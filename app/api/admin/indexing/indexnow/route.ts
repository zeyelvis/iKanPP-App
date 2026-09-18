import { NextRequest, NextResponse } from 'next/server';
import { verifyCloudflareAccess } from '@/lib/admin/verify-access';
import { recordAuditLog } from '@/lib/admin/audit';

export const runtime = 'edge';

const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '7f2e1b4c9a8d3e5f6a1b2c3d4e5f6071';
const HOST = 'www.ikanpp.com';
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

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

    if (urls.length === 0) {
      return NextResponse.json(
        { success: false, error: '请提供待广播的 URL 列表' },
        { status: 400 }
      );
    }

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls.slice(0, 10000),
    };

    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(payload),
    });

    // 记录审计日志
    await recordAuditLog({
      actor: authResult.email || 'Admin',
      action: 'IndexNow 多引擎全网广播',
      target: `${urls.length} 条 URL`,
      details: {
        httpStatus: res.status,
        sampleUrl: urls[0],
      },
    });

    if (res.ok || res.status === 200 || res.status === 202) {
      return NextResponse.json({
        success: true,
        broadcastCount: urls.length,
        status: res.status,
        message: 'IndexNow 全网多引擎 (Bing / Yandex / Seznam) 广播已成功投递',
      });
    } else {
      const errText = await res.text();
      return NextResponse.json({
        success: false,
        status: res.status,
        error: `IndexNow 响应非 200: ${errText}`,
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'IndexNow 广播网络异常' },
      { status: 500 }
    );
  }
}
