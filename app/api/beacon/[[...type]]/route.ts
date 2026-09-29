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

    const { type = [] } = await context.params;
    const subRoute = type[0] || '';

    const text = await request.text();
    if (!text) {
      return new NextResponse(null, { status: 204 });
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
      if (!source || typeof source !== 'string') {
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
