import { NextRequest, NextResponse } from 'next/server';
import { getEntityByTitle, kvGet, kvPut, kvDelete } from '@/lib/services/entity-kv';
import { searchMultipleEntitiesFromTMDB, enrichEpisodeCount } from '@/lib/services/entity-enrichment';
import { normalizeTitle, hasTitleOverlap } from '@/lib/data/entities/entity-utils';
import { TitleEntity } from '@/lib/types/entity';

export const runtime = 'edge';

// L1 边缘节点内存热缓存（0ms 秒级直出）
const MEMORY_CACHE = new Map<string, { entities: TitleEntity[]; expireAt: number }>();
const MEMORY_TTL_MS = 10 * 60 * 1000; // 10分钟节点内热存

/**
 * 权威影视实体极速搜索接口（四级火箭加速引擎 + 防毒化强一致安全防线）
 * 
 * 加速与安全架构：
 * 1. L1 内存热缓存 (0ms) -> 校验 TitleOverlap，原地秒出
 * 2. L2 Cloudflare KV 关键词倒排索引 (5~15ms) -> 强一致校验，毒化键自动抹除
 * 3. L3 本站 KV 精准标题索引检索 (5~15ms) -> 命中已收录条目并核验证实
 * 4. L4 TMDB 在线多源发现 + 3500ms 超时熔断守卫 -> 异步透写回填 KV 倒排索引
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
      const first = mem.entities[0];
      if (first && (hasTitleOverlap(query, first.title) || (first.originalTitle && hasTitleOverlap(query, first.originalTitle)))) {
        return NextResponse.json(
          {
            entities: mem.entities,
            entity: first,
          },
          {
            headers: {
              'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
              'X-Cache': 'HIT-L1-MEMORY',
            },
          }
        );
      }
      MEMORY_CACHE.delete(normQuery);
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
          const first = cachedEntities[0];
          // 强一致防毒化核验：标题必须存在实质语义重叠
          if (first && (hasTitleOverlap(query, first.title) || (first.originalTitle && hasTitleOverlap(query, first.originalTitle)))) {
            MEMORY_CACHE.set(normQuery, { entities: cachedEntities, expireAt: Date.now() + MEMORY_TTL_MS });
            return NextResponse.json(
              {
                entities: cachedEntities,
                entity: first,
              },
              {
                headers: {
                  'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
                  'X-Cache': 'HIT-L2-KV',
                },
              }
            );
          } else {
            console.warn(`[Entity Search L2 Purge] Mismatched cache for query "${query}": found "${first?.title}". Purging!`);
            await kvDelete(kvCacheKey);
          }
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
        if (hasTitleOverlap(query, localSingle.title) || (localSingle.originalTitle && hasTitleOverlap(query, localSingle.originalTitle))) {
          const enriched = await enrichEpisodeCount(localSingle);
          const entities = [enriched];

          MEMORY_CACHE.set(normQuery, { entities, expireAt: Date.now() + MEMORY_TTL_MS });
          try {
            await kvPut(kvCacheKey, JSON.stringify(entities));
          } catch {}

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

    // 强一致安全防线：严格过滤未通过 hasTitleOverlap 校验的条目
    if (Array.isArray(entities) && entities.length > 0) {
      entities = entities.filter(ent =>
        ent && (hasTitleOverlap(query, ent.title) || (ent.originalTitle && hasTitleOverlap(query, ent.originalTitle)))
      );
    }

    // 若 TMDB 熔断超时或未命中，再次宽容尝试本地已收录条目（严格保证标题交集）
    if (entities.length === 0) {
      const fallbackSingle = await getEntityByTitle(query);
      if (fallbackSingle && fallbackSingle.cover) {
        if (hasTitleOverlap(query, fallbackSingle.title) || (fallbackSingle.originalTitle && hasTitleOverlap(query, fallbackSingle.originalTitle))) {
          const enriched = await enrichEpisodeCount(fallbackSingle);
          entities = [enriched];
        }
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

