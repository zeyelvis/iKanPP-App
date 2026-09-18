import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/verify-access';
import highPotentialData from '@/lib/data/seo-high-potential.json';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    // 优先读取高潜词库与 GSC 缓存词
    const data = highPotentialData as any;
    const keywords = (data.keywords || []).map((k: any) => ({
      query: k.query,
      clicks: Math.round((k.impressions || 1) * 0.08),
      impressions: k.impressions || 1,
      ctr: ((Math.round((k.impressions || 1) * 0.08) / (k.impressions || 1)) * 100).toFixed(1) + '%',
      position: Number(k.pos).toFixed(1),
      isPotential: k.pos >= 11 && k.pos <= 30,
      title: k.title,
    }));

    return NextResponse.json({
      success: true,
      updatedAt: data.updatedAt,
      rows: keywords.slice(0, limit),
      total: keywords.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '获取分析词失败' },
      { status: 500 }
    );
  }
}
