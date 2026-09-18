import { NextRequest, NextResponse } from 'next/server';
import { getEntityByTitle, kvGet, kvPut } from '@/lib/services/entity-kv';
import { searchMultipleEntitiesFromTMDB, enrichEpisodeCount } from '@/lib/services/entity-enrichment';
import { normalizeTitle } from '@/lib/data/entities/entity-utils';
import { TitleEntity } from '@/lib/types/entity';

export const runtime = 'edge';

// L1 边缘节点内存热缓存（0ms 秒级直出）
const MEMORY_CACHE = new Map<string, { entities: TitleEntity[]; expireAt: number }>();
const MEMORY_TTL_MS = 10 * 60 * 1000; // 10分钟节点内热存

/**
 * 权威影视实体极速搜索接口（四级火箭加速引擎）
 * 
 * 加速架构：
 * 1. L1 内存热缓存 (0ms) -> 节点内高频词原地直出
 * 2. L2 Cloudflare KV 关键词专属倒排缓存 (5~15ms) -> 全球边缘共享，一人检索全网终生秒开
 * 3. L3 本站 KV 精准标题索引检索 (5~15ms) -> 命中已收录条目直接返回，彻底阻断 TMDB 跨洋握手
 * 4. L4 TMDB 在线多源发现 + 1500ms 超时熔断守卫 -> 异步透写回填 KV 倒排索引
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length === 0) {
      return NextResponse.json({ entities: [], entity: null });
    }

    const normQuery = normalizeTitle(query) || query.toLowerCase();

    // ──────────────────────────────────────────
    // 1. L1: 边缘实例内存缓存 (0ms)
    // ──────────────────────────────────────────
    const mem = MEMORY_CACHE.get(normQuery);
    if (mem && mem.expireAt > Date.now()) {
      return NextResponse.json(
        {
          entities: mem.entities,
          entity: mem.entities[0] || null,
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
            'X-Cache': 'HIT-L1-MEMORY',
          },
        }
      );
    }

    // ──────────────────────────────────────────
    // 2. L2: Cloudflare KV 关键词专属倒排索引 (5~15ms)
    // ──────────────────────────────────────────
    const kvCacheKey = `entity-query:${normQuery}`;
    try {
      const cachedRaw = await kvGet(kvCacheKey);
      if (cachedRaw) {
        const cachedEntities: TitleEntity[] = JSON.parse(cachedRaw);
        if (Array.isArray(cachedEntities) && cachedEntities.length > 0) {
          // 填充 L1
          MEMORY_CACHE.set(normQuery, { entities: cachedEntities, expireAt: Date.now() + MEMORY_TTL_MS });
          return NextResponse.json(
            {
              entities: cachedEntities,
              entity: cachedEntities[0] || null,
            },
            {
              headers: {
                'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
                'X-Cache': 'HIT-L2-KV',
              },
            }
          );
        }
      }
    } catch (kvErr) {
      console.warn('[Entity Search] KV query cache read fail:', kvErr);
    }

    // ──────────────────────────────────────────
    // 3. L3: 本站本地已收录实体精准命中 (5~15ms)
    // ──────────────────────────────────────────
    try {
      const localSingle = await getEntityByTitle(query);
      if (localSingle && localSingle.cover) {
        const enriched = await enrichEpisodeCount(localSingle);
        const entities = [enriched];

        // 异步回写 L1 & L2
        MEMORY_CACHE.set(normQuery, { entities, expireAt: Date.now() + MEMORY_TTL_MS });
        kvPut(kvCacheKey, JSON.stringify(entities)).catch(() => {});

        return NextResponse.json(
          {
            entities,
            entity: enriched,
          },
          {
            headers: {
              'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
              'X-Cache': 'HIT-L3-LOCAL-TITLE',
            },
          }
        );
      }
    } catch (localErr) {
      console.warn('[Entity Search] Local title lookup fail:', localErr);
    }

    // ──────────────────────────────────────────
    // 4. L4: TMDB 在线多源检索 + 3500ms 超时熔断守卫
    // ──────────────────────────────────────────
    const tmdbPromise = searchMultipleEntitiesFromTMDB(query, 2);
    const timeoutPromise = new Promise<TitleEntity[]>((resolve) =>
      setTimeout(() => resolve([]), 3500)
    );

    let entities: TitleEntity[] = [];
    try {
      entities = await Promise.race([tmdbPromise, timeoutPromise]);
    } catch (err) {
      console.warn(`[Entity Search TMDB Race Fail] query=${query}:`, err);
    }

    // 若 TMDB 熔断超时或未命中，再次宽容尝试本地模糊/首词条目
    if (entities.length === 0) {
      const fallbackSingle = await getEntityByTitle(query);
      if (fallbackSingle && fallbackSingle.cover) {
        const enriched = await enrichEpisodeCount(fallbackSingle);
        entities = [enriched];
      }
    }

    if (entities.length > 0) {
      // 写入 L1 内存
      MEMORY_CACHE.set(normQuery, { entities, expireAt: Date.now() + MEMORY_TTL_MS });
      
      // 必须 await 写入 L2 KV，防止 Edge Worker 在 response 返回后被瞬间挂起导致写入丢失
      try {
        await kvPut(kvCacheKey, JSON.stringify(entities));
      } catch (saveErr) {
        console.warn('[Entity Search] kvPut error:', saveErr);
      }

      return NextResponse.json(
        {
          entities,
          entity: entities[0] || null,
        },
        {
          headers: {
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
            'X-Cache': 'MISS-TMDB-POPULATED',
          },
        }
      );
    }

    return NextResponse.json(
      { entities: [], entity: null },
      {
        headers: {
          'Cache-Control': 'public, max-age=600, s-maxage=1800',
        },
      }
    );
  } catch (error) {
    console.error('[Entity Search API Fatal Error]:', error);
    return NextResponse.json({ entities: [], entity: null });
  }
}

