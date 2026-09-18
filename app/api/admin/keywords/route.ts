import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/verify-access';
import highPotentialData from '@/lib/data/seo-high-potential.json';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const data = highPotentialData as any;
    return NextResponse.json({
      success: true,
      updatedAt: data.updatedAt || new Date().toISOString(),
      keywords: data.keywords || [],
      total: (data.keywords || []).length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '获取高潜词库失败' },
      { status: 500 }
    );
  }
}
