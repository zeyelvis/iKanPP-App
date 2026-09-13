import { NextRequest, NextResponse } from 'next/server';
import { getEntityByTitle } from '@/lib/services/entity-kv';
import { searchMultipleEntitiesFromTMDB, enrichEpisodeCount } from '@/lib/services/entity-enrichment';

export const runtime = 'edge';

/**
 * 权威影视实体搜索接口（支持动漫原版 + 真人改编版双轨推荐）
 * 
 * 逻辑：
 * 1. 优先查本站 KV 存储中已存在的精准实体（~5ms）
 * 2. 通过 searchMultipleEntitiesFromTMDB 获取权重排名前列的实体条目（支持动漫原版+真人版）
 * 3. 返回最高权重、最受信赖的影视条目列表（海报、评分、精准已播集数、演职员等）
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    if (!query || query.length === 0) {
      return NextResponse.json({ entities: [], entity: null });
    }

    // 1. 调用 TMDB 多实体高权重检索（智能捕获动漫原版与真人改编版）
    let entities = await searchMultipleEntitiesFromTMDB(query, 2);

    // 2. 若 TMDB 未命中，回退到本站 KV 单实体精准查找
    if (entities.length === 0) {
      const single = await getEntityByTitle(query);
      if (single && single.cover) {
        const enriched = await enrichEpisodeCount(single);
        entities = [enriched];
      }
    }

    if (entities.length > 0) {
      return NextResponse.json(
        {
          entities,
          entity: entities[0] || null, // 向下兼容旧调用
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
          },
        }
      );
    }

    return NextResponse.json({ entities: [], entity: null });
  } catch (error) {
    console.error('[Entity Search API Error]:', error);
    return NextResponse.json({ entity: null });
  }
}
