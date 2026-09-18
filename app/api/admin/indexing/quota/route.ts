import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/admin/verify-access';
import { kvGet } from '@/lib/services/entity-kv';

export const runtime = 'edge';

const DAILY_LIMIT = 200;
const SAFETY_LOCK_THRESHOLD = 180;

export async function GET(request: NextRequest) {
  const authError = await requireAdminAuth(request);
  if (authError) return authError;

  try {
    const today = new Date().toISOString().split('T')[0];
    const quotaKey = `admin:indexing-quota:${today}`;

    let used = 0;
    try {
      const qVal = await kvGet(quotaKey);
      if (qVal) used = parseInt(qVal, 10) || 0;
    } catch {}

    const remaining = Math.max(0, DAILY_LIMIT - used);
    const isLocked = used >= SAFETY_LOCK_THRESHOLD;

    return NextResponse.json({
      success: true,
      date: today,
      used,
      limit: DAILY_LIMIT,
      remaining,
      safetyLockThreshold: SAFETY_LOCK_THRESHOLD,
      isLocked,
      percent: Math.min(100, Math.round((used / DAILY_LIMIT) * 100)),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || '查询配额异常' },
      { status: 500 }
    );
  }
}
