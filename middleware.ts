import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { generateSlug } from '@/lib/data/entities/entity-utils';

/**
 * Middleware — 多域名智能路由 + SEO 域名物理隔离
 * 1. 域名物理隔离：
 *    - 主站 (www.ikanpp.com): 纯净绿色影视。若直接访问 /premium，301 永久重定向至 https://ikanx.com/
 *    - 副站 (ikanx.com / www.ikanx.com): 午夜专属专区。根路径 / 自动 rewrite 到 /premium，地址栏保持 https://ikanx.com/
 * 2. 规范化 301：
 *    - theone58.com / www.theone58.com → www.ikanpp.com
 *    - ikanpp.com → www.ikanpp.com
 *    - www.ikanx.com → ikanx.com
 */
export function middleware(request: NextRequest) {
    const host = request.headers.get('host') || '';
    const url = request.nextUrl.clone();
    const pathname = url.pathname;

    const isIkanX = host.includes('ikanx.com');

    // ── 1. 副站 ikanx.com 专属路由与绝对反爬/反索引防护 ──
    if (isIkanX) {
        // 全面封禁所有爬虫与搜索引擎索引 ikanx.com
        if (pathname === '/robots.txt') {
            return new NextResponse('User-agent: *\nDisallow: /\n', {
                status: 200,
                headers: {
                    'Content-Type': 'text/plain; charset=utf-8',
                    'Cache-Control': 'public, max-age=86400',
                    'X-Robots-Tag': 'noindex, nofollow',
                },
            });
        }

        // ikanx.com 不提供公开 sitemap，避免搜索引擎收录成人页面
        if (pathname === '/sitemap.xml') {
            return new NextResponse('Not Found', { status: 404 });
        }

        // ikanx.com 不暴露主站 manifest.json
        if (pathname === '/manifest.json') {
            return new NextResponse('Not Found', { status: 404 });
        }

        // www.ikanx.com → ikanx.com 统一 301
        if (host.startsWith('www.')) {
            url.host = 'ikanx.com';
            url.protocol = 'https';
            return NextResponse.redirect(url, 301);
        }

        // 访问副站根目录 / 内部重写至 /premium，地址栏保持 https://ikanx.com/
        if (pathname === '/' || pathname === '') {
            url.pathname = '/premium';
            const response = NextResponse.rewrite(url);
            response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex');
            return response;
        }

        // 若在副站直接输入了 /premium，规范化 301 重定向到 /
        if (pathname === '/premium') {
            url.pathname = '/';
            return NextResponse.redirect(url, 301);
        }

        // 若在副站访问普通影视大厅或主站特定页面，301 引导到主站，避免内容重复与权重分散
        const mainstreamPaths = ['/movie', '/tv', '/anime', '/variety', '/ranking', '/iptv', '/download', '/about', '/faq', '/terms', '/privacy'];
        if (mainstreamPaths.some(p => pathname === p || pathname.startsWith(p + '/'))) {
            const targetUrl = new URL(pathname, 'https://www.ikanpp.com');
            targetUrl.search = url.search;
            return NextResponse.redirect(targetUrl, 301);
        }

        const response = NextResponse.next();
        response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet, notranslate, noimageindex');
        return response;
    }

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
    if (url.searchParams.has('q')) {
        const response = NextResponse.next();
        response.headers.set('X-Robots-Tag', 'noindex, follow');
        return response;
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
            const slug = generateSlug(rawTitle);
            url.pathname = `/title/${slug}`;
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

    return response;
}

// 仅匹配页面路由，排除静态资源和 API
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|icon.png|og-image.png|api/).*)',
    ],
};
