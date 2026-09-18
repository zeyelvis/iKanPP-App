import { NextRequest, NextResponse } from 'next/server';
import { recordTitleDemand, getTitleDemandLeaderboard } from '@/lib/services/entity-kv';

export const runtime = 'edge';

/**
 * 用户求片工单处理端点
 * POST /api/title/demand
 * Body: { entityId: string, title: string, year?: string, type?: string, poster?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { entityId, title, year, type, poster } = body || {};

    if (!entityId || !title || typeof title !== 'string' || typeof entityId !== 'string') {
      return NextResponse.json({ success: false, error: '缺少必要的影片实体参数' }, { status: 400 });
    }

    const record = await recordTitleDemand({
      entityId: entityId.trim(),
      title: title.trim(),
      year: year ? String(year).trim() : undefined,
      type: type ? String(type).trim() : undefined,
      poster: poster ? String(poster).trim() : undefined,
    });

    return NextResponse.json({
      success: true,
      message: '求片需求已成功登记！我们将优先协调资源。',
      data: record,
    });
  } catch (err: any) {
    console.error('[Title Demand API Error]:', err);
    return NextResponse.json({ success: false, error: err.message || '内部服务异常' }, { status: 500 });
  }
}

/**
 * 获取求片工单排行榜
 * GET /api/title/demand?limit=50
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const leaderboard = await getTitleDemandLeaderboard(limit);

    return NextResponse.json({
      success: true,
      data: leaderboard,
    }, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
