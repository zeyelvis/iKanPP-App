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

    return new NextResponse(lastError, {
        status: lastStatus,
        headers: { 'Access-Control-Allow-Origin': '*' },
    });
}
