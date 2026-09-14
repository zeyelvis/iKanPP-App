import { NextRequest, NextResponse } from 'next/server';
import { listRecentEntities } from '@/lib/services/entity-kv';

export const runtime = 'edge';

/**
 * GET /api/latest-titles
 * 供首页及各频道大厅「最新上线」货架与外部爬虫 0ms 秒级获取全站最新增量收录影视
 *
 * Query Params:
 * - type?: 'movie' | 'tv' (可选，指定内容类型)
 * - limit?: number (可选，默认 20，上限 60)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type') || undefined;
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Math.min(Math.max(isNaN(limitParam) ? 20 : limitParam, 1), 60);

    const data = await listRecentEntities(limit, typeParam);

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        data,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=86400',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  } catch (err: any) {
    console.error('[API /latest-titles] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal Server Error', data: [] },
      { status: 500 }
    );
  }
}
