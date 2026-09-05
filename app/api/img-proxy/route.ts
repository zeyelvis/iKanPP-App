import { NextRequest, NextResponse } from 'next/server';
import { isSafeExternalUrl } from '@/lib/utils/security';
import { buildDoubanImageCandidates } from '@/lib/server/douban-image';

export const runtime = 'edge';

/**
 * 图片代理 API
 * 
 * 功能：
 * 1. 代理外部图片（解决豆瓣等 CDN 的防盗链 referer 限制与境外解析失败）
 * 2. 针对豆瓣图片（imgN.doubanio.com）提供多镜像自动容灾回退
 * 3. 设置长效缓存头（7 天），配合 Service Worker 做客户端与边缘缓存
 * 4. 保持 Edge Runtime 兼容
 * 
 * 用法：/api/img-proxy?url=https://img9.doubanio.com/xxx.jpg
 */
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // SSRF 防护
    if (!isSafeExternalUrl(url)) {
        return new NextResponse('URL not allowed', { status: 403 });
    }

    // 生成候选 URL（若为豆瓣图片则自动提供 img9/img3/img2/img1 镜像链）
    const candidates = buildDoubanImageCandidates(url);

    let lastStatus = 502;
    let lastError = 'Image proxy failed';

    for (const candidate of candidates) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 10000);

            // 智能防盗链 Referer 处理
            let refererHeader = '';
            try {
                const parsedUrl = new URL(candidate);
                if (candidate.includes('douban')) {
                    refererHeader = 'https://movie.douban.com/';
                } else {
                    refererHeader = `${parsedUrl.protocol}//${parsedUrl.host}/`;
                }
            } catch {
                refererHeader = '';
            }

            const response = await fetch(candidate, {
                headers: {
                    'Referer': refererHeader,
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                    Accept: 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                },
                signal: controller.signal,
                redirect: 'follow',
            });

            clearTimeout(timer);

            if (!response.ok) {
                lastStatus = response.status;
                lastError = `Upstream error: ${response.status}`;
                continue;
            }

            const contentType = response.headers.get('Content-Type') || 'image/jpeg';

            // 只代理图片类型
            if (!contentType.startsWith('image/')) {
                return new NextResponse('Not an image', {
                    status: 415,
                    headers: { 'Access-Control-Allow-Origin': '*' },
                });
            }

            const imageData = await response.arrayBuffer();

            return new NextResponse(imageData, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    // 30 天 Cloudflare 边缘强缓存 + 浏览器本地强缓存 + SWR 弹性容灾
                    'Cache-Control': 'public, max-age=2592000, s-maxage=2592000, stale-while-revalidate=604800',
                    'CDN-Cache-Control': 'public, max-age=2592000',
                    'Cloudflare-CDN-Cache-Control': 'public, max-age=2592000',
                    'Vary': 'Origin',
                },
            });
        } catch (error: any) {
            lastStatus = error?.name === 'AbortError' ? 504 : 502;
            lastError = error?.message || 'Proxy mirror error';
            continue;
        }
    }

    // 若所有外部镜像均失败
    // 若客户端指定了 nofallback 或明确要求错误感知，返回 502 便于客户端启动多级降级容灾
    if (request.nextUrl.searchParams.get('nofallback') === '1') {
        return new NextResponse('Proxy upstream error', {
            status: 502,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    }

    // 默认兜底：返回电影胶片质感 SVG
    const fallbackSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450" fill="none"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#161622"/><stop offset="100%" stop-color="#0A0A0F"/></linearGradient></defs><rect width="300" height="450" fill="url(#bg)" rx="20"/><rect width="298" height="448" x="1" y="1" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" rx="19"/><g transform="translate(150,210)"><rect x="-50" y="-60" width="100" height="120" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" stroke-width="1.5"/><circle cx="0" cy="0" r="24" fill="#E50914"/><path d="M-5,-8 L-5,8 L9,0 Z" fill="#FFF"/></g><text x="150" y="320" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="13" font-weight="700" fill="rgba(255,255,255,0.4)" text-anchor="middle">iKanPP · 影视精选</text><text x="150" y="342" font-family="-apple-system,BlinkMacSystemFont,sans-serif" font-size="10" font-weight="500" fill="rgba(255,255,255,0.2)" text-anchor="middle">高清原画直达</text></svg>`;

    return new NextResponse(fallbackSvg, {
        status: 200,
        headers: {
            'Content-Type': 'image/svg+xml',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=3600',
        },
    });
}
