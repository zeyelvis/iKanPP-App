import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';
import { titlePageForPlayerLink } from '@/lib/utils/player-link';

/**
 * 网站请求入口（Next 16 起 middleware 改名 proxy）：
 * - theone58.com → www.ikanpp.com；ikanpp.com → www.ikanpp.com（301）；
 * - /premium 与 premium=1 的播放请求 → ikanx.com（午夜专区已拆为独立站点）；
 * - 搜索结果页 noindex；旧 /player 链接 308 到作品页；写入访客国家 Cookie；
 * - workers.dev 预览地址整站 noindex（只用于上线前测试，不能和 www 抢收录）。
 */
export function proxy(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    // ── 2. 主站 www.ikanpp.com 规范化与隔离逻辑 ──
    // 旧域名 theone58.com → 新域名 www.ikanpp.com（301 永久重定向）
    if (host === 'theone58.com' || host === 'www.theone58.com') {
        url.host = 'www.ikanpp.com';
        url.protocol = 'https';
        return NextResponse.redirect(url, 301);
    }

    // 非 www → www 301 重定向
    if (
        host === 'ikanpp.com' &&
        !host.startsWith('localhost') &&
        !host.startsWith('127.0.0.1')
    ) {
        url.host = 'www.ikanpp.com';
        return NextResponse.redirect(url, 301);
    }

    // 主站收到任何 /premium 请求，直接 301 永久重定向剥离到副站 ikanx.com
    if (pathname === '/premium' || pathname.startsWith('/premium/')) {
        const subPath = pathname === '/premium' ? '/' : pathname.replace(/^\/premium/, '');
        const targetUrl = new URL(subPath, 'https://ikanx.com');
        targetUrl.search = url.search;
        return NextResponse.redirect(targetUrl, 301);
    }

    // 若在主站访问了带有 premium=1 的播放请求，直接 301 彻底剥离转移至副站 ikanx.com
    if (url.searchParams.get('premium') === '1') {
        const targetUrl = new URL(url.pathname + url.search, 'https://ikanx.com');
        return NextResponse.redirect(targetUrl, 301);
    }

    // 搜索参数（如 /?q=xxx）页面注入 X-Robots-Tag: noindex, follow，防止动态搜索页稀释抓取预算并被判定为薄内容
    if (url.searchParams.has('q') || host.endsWith('.workers.dev')) {
        const response = NextResponse.next();
        response.headers.set('X-Robots-Tag', host.endsWith('.workers.dev') ? 'noindex, nofollow' : 'noindex, follow');
        return response;
    }

    // 详情页即播放页：带 entity 的播放链接（旧分享、书签、外链）308 到详情页，
    // 集数、季数、线路写进 # 片段（浏览器经 308 保留片段）；无本站作品的片源链接留在 /player
    if (pathname === '/player') {
        const target = titlePageForPlayerLink(url.searchParams);
        if (target) return NextResponse.redirect(new URL(target, url), 308);
    }

    // 历史播放器旧 URL 规范化 301 重定向至实体详情页：
    // 严禁拦截带有效播放源定位参数（id、source、url、gsKey）的合法播放请求！
    // 仅规范化无任何源站定位参数的历史纯标题 /player?title=xxx 孤立旧链接
    const hasPlaySourceParams = url.searchParams.has('id') ||
        url.searchParams.has('source') ||
        url.searchParams.has('url') ||
        url.searchParams.has('gsKey') ||
        url.searchParams.has('entity') ||
        url.searchParams.has('type') ||
        url.searchParams.has('year') ||
        url.searchParams.has('episode');

    if (pathname === '/player' && url.searchParams.has('title') && !hasPlaySourceParams) {
        const rawTitle = url.searchParams.get('title') || '';
        if (rawTitle.trim()) {
            url.pathname = getTitleCanonicalHref({ title: rawTitle });
            url.search = '';
            return NextResponse.redirect(url, 301);
        }
    }

    const response = NextResponse.next();

    // ── 3. 边缘地域感知（Edge Geo Injection）──
    // Cloudflare 在边缘层提供访客国家代码 (cf-ipcountry)，毫秒级注入 Cookie
    const country = request.headers.get('cf-ipcountry');
    if (country) {
        const existingCookie = request.cookies.get('geo-region')?.value;
        if (existingCookie !== country) {
            response.cookies.set('geo-region', country, {
                maxAge: 86400 * 7, // 7天有效
                path: '/',
                sameSite: 'lax',
                httpOnly: false, // 允许客户端 JS 同步读取，实现 0 闪烁分流
            });
        }
    }

    // ── 4. 🚀 Edge 动态变色龙渲染（Dynamic Rendering 3.0）──
    // 毫秒级识别全球搜索引擎与生成式 AI 爬虫，注入特权边缘缓存（s-maxage 24h），实现爬虫 0ms 秒开
    const userAgent = request.headers.get('user-agent') || '';
    const isSearchEngineBot = /googlebot|bingbot|yandexbot|baiduspider|bytespider|applebot|slurp|duckduckbot|sogou/i.test(userAgent);
    const isAiAgentBot = /perplexitybot|gptbot|claudebot|ccbot|cohere-ai|diffbot|facebookexternalhit|amazonbot/i.test(userAgent);

    if ((isSearchEngineBot || isAiAgentBot) && !pathname.startsWith('/admin')) {
        response.headers.set('x-edge-crawler', isAiAgentBot ? 'ai-agent' : 'search-engine');
        // 允许公共 CDN 边缘节点持久缓存 24 小时，后台平滑重校验，保证爬虫 100% 命中边缘缓存直出
        response.headers.set('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800');
    }

    return response;
}

// 仅匹配页面路由，排除静态资源和 API
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|icon.png|og-image.png|api/).*)',
    ],
};
