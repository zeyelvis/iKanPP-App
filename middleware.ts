import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

    // ── 1. 副站 ikanx.com 专属路由逻辑 ──
    if (isIkanX) {
        // www.ikanx.com → ikanx.com 统一 301
        if (host.startsWith('www.')) {
            url.host = 'ikanx.com';
            url.protocol = 'https';
            return NextResponse.redirect(url, 301);
        }

        // 访问副站根目录 / 内部重写至 /premium，地址栏保持 https://ikanx.com/
        if (pathname === '/' || pathname === '') {
            url.pathname = '/premium';
            return NextResponse.rewrite(url);
        }

        // 若在副站直接输入了 /premium，规范化 301 重定向到 /
        if (pathname === '/premium') {
            url.pathname = '/';
            return NextResponse.redirect(url, 301);
        }

        return NextResponse.next();
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

    return NextResponse.next();
}

// 仅匹配页面路由，排除静态资源和 API
export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|icon.png|og-image.png|manifest.json|robots.txt|sitemap.xml|api/).*)',
    ],
};
