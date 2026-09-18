import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/verify-access';
import { queryEntities, getEntityById, getEntityByTmdb } from '@/lib/services/entity-kv';
import { calculateSeoScore } from '@/app/api/seo/entity-pipeline/route';
import { TitleEntity } from '@/lib/types/entity';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const channel = searchParams.get('channel') || undefined;
    const genre = searchParams.get('genre') || undefined;
    const region = searchParams.get('region') || undefined;
    const year = searchParams.get('year') || undefined;
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '36', 10);
    const search = (searchParams.get('search') || '').trim();
    const scoreRange = searchParams.get('scoreRange') || undefined; // 'excellent' | 'good' | 'needsWork'

    // 1. 如果搜索框精准指定了 entityId (例如 ik000001)
    if (/^ik\d{5,7}$/i.test(search)) {
      const single = await getEntityById(search.toLowerCase());
      if (single) {
        const score = calculateSeoScore(single);
        return NextResponse.json({
          success: true,
          items: [{ ...single, seoScore: score }],
          total: 1,
          page: 1,
          pageCount: 1,
          limit,
        });
      }
    }

    // 2. 如果搜索框指定了纯数字 (可能是 tmdbId)
    if (/^\d{3,9}$/.test(search)) {
      const movieMatch = await getEntityByTmdb('movie', search);
      const tvMatch = !movieMatch ? await getEntityByTmdb('tv', search) : null;
      const matched = movieMatch || tvMatch;
      if (matched) {
        const score = calculateSeoScore(matched);
        return NextResponse.json({
          success: true,
          items: [{ ...matched, seoScore: score }],
          total: 1,
          page: 1,
          pageCount: 1,
          limit,
        });
      }
    }

    // 3. 走底层高性能原子索引交集查询引擎
    const result = await queryEntities({
      channel,
      genre,
      region,
      year,
      sort,
      page,
      limit: Math.min(limit, 100),
    });

    let items = result.items;

    // 4. 标题模糊搜索（在当前筛选池中）
    if (search) {
      const sLower = search.toLowerCase();
      items = items.filter(
        (item) =>
          item.title?.toLowerCase().includes(sLower) ||
          item.originalTitle?.toLowerCase().includes(sLower) ||
          item.slug?.toLowerCase().includes(sLower)
      );
    }

    // 5. 计算并补全实时 SEO 评分
    const itemsWithScores = items.map((item) => ({
      ...item,
      seoScore: calculateSeoScore(item),
    }));

    // 6. 若有分数区间过滤
    let finalItems = itemsWithScores;
    if (scoreRange === 'excellent') {
      finalItems = itemsWithScores.filter((i) => (i.seoScore || 0) >= 80);
    } else if (scoreRange === 'good') {
      finalItems = itemsWithScores.filter((i) => (i.seoScore || 0) >= 60 && (i.seoScore || 0) < 80);
    } else if (scoreRange === 'needsWork') {
      finalItems = itemsWithScores.filter((i) => (i.seoScore || 0) < 60);
    }

    return NextResponse.json({
      success: true,
      items: finalItems,
      total: result.total,
      page: result.page,
      pageCount: result.pageCount,
      limit: result.limit,
    });
  } catch (error: any) {
    console.error('[Admin Entities API] 异常:', error);
    return NextResponse.json(
      { success: false, error: error.message || '查询实体库异常' },
      { status: 500 }
    );
  }
}
