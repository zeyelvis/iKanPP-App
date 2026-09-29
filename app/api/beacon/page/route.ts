import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

/**
 * 真实用户网页打开速度上报接口 (PageSpeed Beacon API)
 * 写入 Cloudflare Workers Analytics Engine (ikanpp_pagespeed)
 * 
 * 规范契约（方案第 5 节）：
 * 1. 同源校验，防止外部伪造攻击；
 * 2. 爬虫与自动化抓取工具直接 204 忽略；
 * 3. 限制请求体不超过 512 字节；
 * 4. 数值限制在 0～60000ms；
 * 5. 写入 Analytics Engine 数据集 ikanpp_pagespeed：
 *    - blobs: [国家, 页面类型, 设备]
 *    - doubles: [ttfb, lcp或0, 有无lcp]
 */
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

    // 2. 爬虫与机器人直接 204 忽略，不消耗指标与配额
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

    let payload: { path?: string; ttfb?: number; lcp?: number };
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return new NextResponse('Bad Request', { status: 400 });
    }

    const { path, ttfb, lcp } = payload;
    if (typeof path !== 'string' || typeof ttfb !== 'number') {
      return new NextResponse(null, { status: 204 });
    }

    // 4. 双轨隔离与后台纯净铁律：午夜专区与管理后台不上报
    if (path.startsWith('/admin') || path.startsWith('/premium')) {
      return new NextResponse(null, { status: 204 });
    }

    // 5. 提取访客国家代码（Cloudflare Edge 自动注入）
    const country = request.headers.get('cf-ipcountry') || 'XX';

    // 6. 规整页面类型
    let pageType = 'other';
    if (path === '/') pageType = 'home';
    else if (path.startsWith('/movie')) pageType = 'movie';
    else if (path.startsWith('/tv')) pageType = 'tv';
    else if (path.startsWith('/anime')) pageType = 'anime';
    else if (path.startsWith('/variety')) pageType = 'variety';
    else if (path.startsWith('/documentary')) pageType = 'documentary';
    else if (path.startsWith('/title/')) pageType = 'detail';
    else if (path.startsWith('/player')) pageType = 'player';
    else if (path.startsWith('/search')) pageType = 'search';
    else if (path.startsWith('/ranking')) pageType = 'ranking';

    // 7. 设备类型推断
    let device = 'desktop';
    if (/iPad|Tablet/i.test(ua)) {
      device = 'tablet';
    } else if (/Mobi|Android|iPhone|iPod/i.test(ua)) {
      device = 'mobile';
    }

    // 8. 数值上下限约束（0~60000ms）
    const validTtfb = Math.min(60000, Math.max(0, isFinite(ttfb) ? Math.round(ttfb) : 0));
    const hasLcp = typeof lcp === 'number' && isFinite(lcp) && lcp >= 0 ? 1 : 0;
    const validLcp = hasLcp === 1 ? Math.min(60000, Math.max(0, Math.round(lcp!))) : 0;

    // 9. 写入 Workers Analytics Engine
    const analytics =
      (process.env as any).PAGESPEED ||
      (globalThis as any).PAGESPEED ||
      (request as any).env?.PAGESPEED;

    if (analytics && typeof analytics.writeDataPoint === 'function') {
      analytics.writeDataPoint({
        blobs: [country, pageType, device],
        doubles: [validTtfb, validLcp, hasLcp],
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
