import { NextRequest, NextResponse } from 'next/server';
import { loadHomeDocs } from '@/lib/data/d1/home-docs';


/**
 * GET /api/latest-titles
 * 首页及各频道大厅「最新上线」货架的数据：入库 Worker 每小时写进 D1 documents 的 latest:<频道>。
 *
 * Query Params:
 * - type?: 'all' | 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' (可选，指定专区或内容类型)
 * - limit?: number (可选，默认 20，上限 60)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type') || searchParams.get('channel') || undefined;
    const limitParam = parseInt(searchParams.get('limit') || '20', 10);
    const limit = Math.min(Math.max(isNaN(limitParam) ? 20 : limitParam, 1), 60);

    const channel = typeParam && ['all', 'movie', 'tv', 'anime', 'variety', 'documentary'].includes(typeParam) ? typeParam : 'all';
    const { latest } = await loadHomeDocs();
    const data = (latest[channel] ?? []).slice(0, limit);

    return NextResponse.json(
      {
        success: true,
        count: data.length,
        data,
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
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
