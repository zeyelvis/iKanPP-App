import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * 播放质量与首帧耗时上报接口 (Play Beacon API)
 * 写入 Cloudflare Workers Analytics Engine (ikanpp_playback)
 * 仅用于按地区学习各线路真实连通率，实现智能动态优选
 */
let hasWarnedMissingPlaybackBinding = false;

export async function POST(request: NextRequest) {
  try {
    // 1. 同源鉴权校验：只接受本站页面发来的请求
    const secFetchSite = request.headers.get('sec-fetch-site');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    const isSameOrigin = secFetchSite === 'same-origin' || (origin && host && origin.includes(host));
    if (!isSameOrigin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 2. 爬虫与机器人直接 204 忽略，不消耗指标
    const ua = request.headers.get('user-agent') || '';
    if (/bot|spider|crawl|slurp|headless|facebookexternalhit|curl|wget/i.test(ua)) {
      return new NextResponse(null, { status: 204 });
    }

    // 3. 严格限制请求体体积（不超过 512 字节）
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > 512) {
      return new NextResponse('Payload Too Large', { status: 413 });
    }

    const rawBody = await request.text();
    if (rawBody.length > 512) {
      return new NextResponse('Payload Too Large', { status: 413 });
    }

    let payload: { source?: string; ok?: boolean; ms?: number };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const { source, ok, ms } = payload;
    if (!source || typeof ok !== 'boolean') {
      return new NextResponse(null, { status: 204 });
    }

    // 4. 双轨隔离铁律：午夜专区线路绝不上报
    if (source === 'jable' || source.startsWith('premium_')) {
      return new NextResponse(null, { status: 204 });
    }

    // 5. 提取访客国家代码（Cloudflare Edge 自动注入）
    const country = request.headers.get('cf-ipcountry') || 'XX';
    const statusStr = ok ? 'ok' : 'fail';
    const durationMs = typeof ms === 'number' && isFinite(ms) && ms >= 0 ? Math.min(60000, ms) : 0;

    interface AnalyticsDataset {
      writeDataPoint(point: { blobs?: string[]; doubles?: number[]; indexes?: string[] }): void;
    }
    type AnalyticsEnv = { PLAYBACK?: AnalyticsDataset };

    // 6. 写入 Workers Analytics Engine
    const analytics =
      (process.env as unknown as AnalyticsEnv).PLAYBACK ||
      (globalThis as unknown as AnalyticsEnv).PLAYBACK ||
      (request as unknown as { env?: AnalyticsEnv }).env?.PLAYBACK;

    if (analytics && typeof analytics.writeDataPoint === 'function') {
      analytics.writeDataPoint({
        blobs: [country, source, statusStr],
        doubles: [durationMs],
      });
    } else if (!hasWarnedMissingPlaybackBinding) {
      hasWarnedMissingPlaybackBinding = true;
      console.warn('[Beacon Play] Workers Analytics Engine PLAYBACK 绑定未生效，请在 Cloudflare Pages 控制台设置中添加绑定。');
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
