import { NextRequest, NextResponse } from 'next/server';
import { verifyCloudflareAccess } from '@/lib/admin/verify-access';
import { batchPublishGoogleIndexing, publishGoogleIndexingUrl } from '@/lib/services/google-indexing';
import { kvGet, kvPut } from '@/lib/services/entity-kv';
import { recordAuditLog } from '@/lib/admin/audit';

export const runtime = 'edge';

const DAILY_LIMIT = 200;
const SAFETY_LOCK_THRESHOLD = 180; // 超过 180 条时硬锁，防止触发超限封号

export async function POST(request: NextRequest) {
  const authResult = await verifyCloudflareAccess(request);
  if (!authResult.authenticated) {
    return NextResponse.json(
      { success: false, error: authResult.error || '未授权' },
      { status: authResult.status }
    );
  }

  try {
    const body = await request.json();
    const urls: string[] = Array.isArray(body.urls)
      ? body.urls
      : body.url
      ? [body.url]
      : [];
    const type = body.type === 'URL_DELETED' ? 'URL_DELETED' : 'URL_UPDATED';

    if (urls.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供待促抓的 URL 列表' },
        { status: 400 }
      );
    }

    const today = new Date().toISOString().split('T')[0];
    const quotaKey = `admin:indexing-quota:${today}`;

    // 检查当日已消耗配额
    let currentUsed = 0;
    try {
      const qVal = await kvGet(quotaKey);
      if (qVal) currentUsed = parseInt(qVal, 10) || 0;
    } catch {}

    if (currentUsed >= SAFETY_LOCK_THRESHOLD) {
      return NextResponse.json(
        {
          success: false,
          error: `今日 Google Indexing API 配额已消耗 ${currentUsed}/${DAILY_LIMIT} 条，已触发安全熔断锁（≥${SAFETY_LOCK_THRESHOLD} 条限制），请明日再试。`,
          quotaUsed: currentUsed,
          quotaLimit: DAILY_LIMIT,
        },
        { status: 429 }
      );
    }

    // 截断不可超过熔断上限
    const allowedCount = Math.min(urls.length, SAFETY_LOCK_THRESHOLD - currentUsed);
    const toPushUrls = urls.slice(0, allowedCount);

    let successful = 0;
    let results: any[] = [];

    if (toPushUrls.length === 1) {
      const res = await publishGoogleIndexingUrl(toPushUrls[0], type);
      results = [res];
      if (res.success) successful = 1;
    } else {
      const batchRes = await batchPublishGoogleIndexing(toPushUrls, toPushUrls.length);
      successful = batchRes.successful;
      results = batchRes.results;
    }

    // 更新今日消耗
    const newUsed = currentUsed + successful;
    await kvPut(quotaKey, String(newUsed));

    // 记录审计日志
    await recordAuditLog({
      actor: authResult.email || 'Admin',
      action: `Google Indexing 促抓 (${type})`,
      target: `${successful} 条 URL (共提交 ${toPushUrls.length})`,
      details: {
        newQuotaUsed: newUsed,
        sampleUrl: toPushUrls[0],
      },
    });

    return NextResponse.json({
      success: true,
      pushedCount: successful,
      totalRequested: urls.length,
      truncated: urls.length > allowedCount,
      quotaUsed: newUsed,
      quotaRemaining: Math.max(0, DAILY_LIMIT - newUsed),
      results,
    });
  } catch (error: any) {
    console.error('[Admin Indexing Push] 异常:', error);
    return NextResponse.json(
      { success: false, error: error.message || '促抓推送异常' },
      { status: 500 }
    );
  }
}
