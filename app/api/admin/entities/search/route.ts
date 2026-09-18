import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/verify-access';
import { getEntityById, getEntityByTmdb, queryEntities } from '@/lib/services/entity-kv';
import { calculateSeoScore } from '@/app/api/seo/entity-pipeline/route';
import { TitleEntity } from '@/lib/types/entity';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();
    const { query, tmdbId, type, limit = 20 } = body;

    const results: TitleEntity[] = [];

    // 1. 如果传了 tmdbId
    if (tmdbId) {
      if (type) {
        const found = await getEntityByTmdb(type as any, String(tmdbId));
        if (found) results.push(found);
      } else {
        const movie = await getEntityByTmdb('movie', String(tmdbId));
        const tv = !movie ? await getEntityByTmdb('tv', String(tmdbId)) : null;
        if (movie) results.push(movie);
        if (tv) results.push(tv);
      }
    }

    // 2. 如果传了关键字 query
    if (query && results.length === 0) {
      const qLower = String(query).trim().toLowerCase();
      // 先测是否为 entityId
      if (/^ik\d{5,7}$/i.test(qLower)) {
        const byId = await getEntityById(qLower);
        if (byId) results.push(byId);
      } else {
        const queryRes = await queryEntities({ limit: 50 });
        const matched = queryRes.items.filter((item) =>
          item.title?.toLowerCase().includes(qLower) ||
          item.directors?.some((d) => d.toLowerCase().includes(qLower)) ||
          item.actors?.some((a) => a.toLowerCase().includes(qLower)) ||
          item.keywords?.some((k) => k.toLowerCase().includes(qLower))
        );
        results.push(...matched.slice(0, limit));
      }
    }

    const itemsWithScores = results.map((item) => ({
      ...item,
      seoScore: calculateSeoScore(item),
    }));

    return NextResponse.json({
      success: true,
      items: itemsWithScores,
      count: itemsWithScores.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '高级搜索异常' },
      { status: 500 }
    );
  }
}
