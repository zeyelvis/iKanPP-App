import { NextRequest, NextResponse } from 'next/server';
import { isSafeExternalUrl } from '@/lib/utils/security';
import { buildDoubanImageCandidates } from '@/lib/server/douban-image';
import { getR2KeyFromUrl, fetchFromR2, saveToR2Async } from '@/lib/server/r2-cache';

export const runtime = 'edge';

/**
 * 智能图片代理与边缘/持久缓存 API v2.0
 * 
 * 功能：
 * 1. 【R2 极速命中】：首次请求后永久沉淀进 Cloudflare R2，二次请求直接从 R2 CDN (img.ikanpp.com) 秒级读取
 * 2. 【按需透写 Write-Through】：未命中时自动从源站拉取，立即向用户输出，并在后台静默写入 R2
 * 3. 【精准降维】：自动将 TMDB 请求降维至最小物理需求尺寸（w185/w342/w780/w1280），节约 70% 体积
 * 4. 【防盗链与多镜像】：内置豆瓣等防盗链突破与多镜像链路自愈
 * 5. 【长效强缓存】：Cloudflare 边缘 1 年 + 浏览器本地 1 年 Immutable 缓存
 * 
 * 用法：/api/img-proxy?url=https://image.tmdb.org/xxx.jpg&w=342
 */
export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    const widthParam = request.nextUrl.searchParams.get('w');
    const requestedWidth = widthParam ? parseInt(widthParam, 10) : 342;

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // SSRF 防护
    if (!isSafeExternalUrl(url)) {
        return new NextResponse('URL not allowed', { status: 403 });
    }

    // 1. 计算标准 R2 存储 Key (格式: {source}/{width}/{filename})
    const r2Key = getR2KeyFromUrl(url, requestedWidth);

    // 2. 【R2 / CDN 极速探测】：如果 R2 已存在，直接从 R2 输出（30~50ms，彻底摆脱源站网络影响）
    try {
        const r2Hit = await fetchFromR2(r2Key);
        if (r2Hit && r2Hit.ok) {
            const r2Data = await r2Hit.arrayBuffer();
            const r2ContentType = r2Hit.headers.get('Content-Type') || 'image/jpeg';

            return new NextResponse(r2Data, {
                status: 200,
                headers: {
                    'Content-Type': r2ContentType,
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
                    'CDN-Cache-Control': 'public, max-age=31536000',
                    'Cloudflare-CDN-Cache-Control': 'public, max-age=31536000',
                    'X-Cache-Status': 'R2-HIT',
                    'Vary': 'Origin, Accept',
                },
            });
        }
    } catch {
        // R2 查询探测异常时不中断，继续往下游源站拉取
    }

    // 3. 准备源站拉取候选列表
    let candidates: string[] = [];

    if (url.includes('tmdb.org')) {
        // TMDB 图片：若原图是 original 或过大尺寸，自动按请求的 requestedWidth 重写为高效小尺寸
        const optimizedTmdbUrl = url
            .replace(/\/t\/p\/(w\d+|original)\//, `/t/p/w${requestedWidth}/`);
        candidates = [optimizedTmdbUrl, url];
    } else {
        // 豆瓣或其它源：构建候选镜像链
        candidates = buildDoubanImageCandidates(url);
    }

    let lastStatus = 502;
    let lastError = 'Image proxy failed';

    for (const candidate of candidates) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 8000);

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

            // 4. 【全自动透写写入 R2】：在 Edge 运行时安全写入落盘（带 1200ms 熔断保护，通常仅耗时 30~50ms）
            try {
                await Promise.race([
                    saveToR2Async(r2Key, imageData, contentType),
                    new Promise((resolve) => setTimeout(resolve, 1200)),
                ]);
            } catch (err) {
                console.warn('[R2 Sync Worker Warning]', err);
            }

            // 5. 立即返回给当前用户
            return new NextResponse(imageData, {
                status: 200,
                headers: {
                    'Content-Type': contentType,
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=31536000, s-maxage=31536000, immutable',
                    'CDN-Cache-Control': 'public, max-age=31536000',
                    'Cloudflare-CDN-Cache-Control': 'public, max-age=31536000',
                    'X-Cache-Status': 'MISS-AND-STORED',
                    'Vary': 'Origin, Accept',
                },
            });
        } catch (error: any) {
            lastStatus = error?.name === 'AbortError' ? 504 : 502;
            lastError = error?.message || 'Proxy mirror error';
            continue;
        }
    }

    // 若所有外部镜像均失败
    if (request.nextUrl.searchParams.get('nofallback') === '1') {
        return new NextResponse('Proxy upstream error', {
            status: 502,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
        });
    }

    // 默认兜底：电影胶片质感 SVG
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

