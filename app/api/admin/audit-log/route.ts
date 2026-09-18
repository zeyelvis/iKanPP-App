import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/verify-access';
import { getRecentAuditLogs } from '@/lib/admin/audit';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const logs = await getRecentAuditLogs(Math.min(limit, 100));

    return NextResponse.json({
      success: true,
      logs,
      total: logs.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '获取审计日志失败' },
      { status: 500 }
    );
  }
}
