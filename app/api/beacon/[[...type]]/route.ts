import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * 统一埋点上报中枢路由 (Beacon Hub API)
 * 支持 /api/beacon/play (播放质量与连通率上报) 与 /api/beacon/page (网页首字节与 LCP 耗时上报)
 * 动态写入 Workers Analytics Engine (ikanpp_playback / ikanpp_pagespeed)
 */
let hasWarnedMissingPlaybackBinding = false;
let hasWarnedMissingPagespeedBinding = false;

interface AnalyticsDataset {
  writeDataPoint(point: { blobs?: string[]; doubles?: number[]; indexes?: string[] }): void;
}
type AnalyticsEnv = { PLAYBACK?: AnalyticsDataset; PAGESPEED?: AnalyticsDataset };

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ type?: string[] }> }
) {
  try {
    // 1. 同源鉴权精确校验：严禁包含式匹配（防止 evil.ikanpp.com / ikanpp.com.evil.com 绕过）
    const secFetchSite = request.headers.get('sec-fetch-site');
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    let isSameOrigin = secFetchSite === 'same-origin';
    if (!isSameOrigin && origin && host) {
      try {
        isSameOrigin = new URL(origin).host === host;
      } catch {}
    }
    if (!isSameOrigin) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    // 2. 爬虫与机器人直接 204 忽略，不消耗指标
    const ua = request.headers.get('user-agent') || '';
    if (/bot|spider|crawl|slurp|headless|facebookexternalhit|curl|wget/i.test(ua)) {
      return new NextResponse(null, { status: 204 });
    }

    // 3. 请求体大小限制：先查 content-length，再查实际读取长度，超 512 字节返回 413
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > 512) {
      return new NextResponse('Payload Too Large', { status: 413 });
    }

    const { type = [] } = await context.params;
    const subRoute = type[0] || '';

    const text = await request.text();
    if (!text) {
      return new NextResponse(null, { status: 204 });
    }
    if (text.length > 512) {
      return new NextResponse('Payload Too Large', { status: 413 });
    }

    let payload: Record<string, unknown> = {};
    try {
      payload = JSON.parse(text);
    } catch {
      return new NextResponse(null, { status: 204 });
    }

    const country = request.headers.get('cf-ipcountry') || 'XX';

    // ── 分流 1：播放质量上报 (/api/beacon/play 或包含 source 字段) ──
    if (subRoute === 'play' || 'source' in payload) {
      const { source, ok, ms } = payload as { source?: string; ok?: boolean; ms?: number };

      // 线路名白名单格式强校验：只允许字母、数字、下划线，1~32 字符，防止脏数据注入
      if (!source || typeof source !== 'string' || !/^[a-z0-9_]{1,32}$/.test(source)) {
        return new NextResponse(null, { status: 204 });
      }

      // 服务端防线：午夜专区线路绝不上报至主站 Analytics Engine
      if (source.startsWith('jable') || source.startsWith('premium_')) {
        return new NextResponse(null, { status: 204 });
      }

      const statusStr = ok ? 'ok' : 'fail';
      const durationMs = typeof ms === 'number' && isFinite(ms) && ms >= 0 ? Math.min(60000, ms) : 0;

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
    }

    // ── 分流 2：页面耗时性能上报 (/api/beacon/page 或包含 ttfb 字段) ──
    if (subRoute === 'page' || 'ttfb' in payload) {
      const { ttfb, lcp, pageType: rawPageType, device: rawDevice } = payload as {
        ttfb?: number;
        lcp?: number | null;
        pageType?: string;
        device?: string;
      };

      if (typeof ttfb !== 'number' || !isFinite(ttfb) || ttfb < 0) {
        return new NextResponse(null, { status: 204 });
      }

      const validPageTypes = new Set(['home', 'category', 'title', 'player', 'other']);
      const pageType = typeof rawPageType === 'string' && validPageTypes.has(rawPageType) ? rawPageType : 'other';

      const validDevices = new Set(['mobile', 'desktop', 'tablet']);
      const device = typeof rawDevice === 'string' && validDevices.has(rawDevice) ? rawDevice : 'desktop';

      const validTtfb = Math.min(60000, Math.max(0, isFinite(ttfb) ? Math.round(ttfb) : 0));
      const hasLcp = typeof lcp === 'number' && isFinite(lcp) && lcp >= 0 ? 1 : 0;
      const validLcp = hasLcp === 1 ? Math.min(60000, Math.max(0, Math.round(lcp!))) : 0;

      const analytics =
        (process.env as unknown as AnalyticsEnv).PAGESPEED ||
        (globalThis as unknown as AnalyticsEnv).PAGESPEED ||
        (request as unknown as { env?: AnalyticsEnv }).env?.PAGESPEED;

      if (analytics && typeof analytics.writeDataPoint === 'function') {
        analytics.writeDataPoint({
          blobs: [country, pageType, device],
          doubles: [validTtfb, validLcp, hasLcp],
        });
      } else if (!hasWarnedMissingPagespeedBinding) {
        hasWarnedMissingPagespeedBinding = true;
        console.warn('[Beacon Page] Workers Analytics Engine PAGESPEED 绑定未生效，请在 Cloudflare Pages 控制台设置中添加绑定。');
      }

      return new NextResponse(null, { status: 204 });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[Beacon API] Error:', error);
    return new NextResponse(null, { status: 204 });
  }
}
