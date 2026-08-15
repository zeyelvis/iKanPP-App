import { NextResponse } from 'next/server';
import { isAllowedDoubanImageUrl } from '@/lib/utils/security';
import { buildDoubanImageCandidates } from '@/lib/server/douban-image';

export const runtime = 'edge';

const REQUEST_HEADERS = {
    'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
    Accept: 'image/jpeg,image/png,image/gif,*/*;q=0.8',
    Referer: 'https://movie.douban.com/',
};

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
        return NextResponse.json({ error: 'Missing image URL' }, { status: 400 });
    }

    // SSRF 防护：仅允许豆瓣图片域名
    if (!isAllowedDoubanImageUrl(imageUrl)) {
        return NextResponse.json({ error: 'URL not allowed' }, { status: 403 });
    }

    // ── Cloudflare Cache API ──────────────────────────
    const cacheKey = new Request(request.url, { method: 'GET' });
    // @ts-ignore — caches.default 是 Cloudflare Workers 专有 API
    const cache = typeof caches !== 'undefined' && caches.default ? caches.default : null;

    if (cache) {
        try {
            const cached = await cache.match(cacheKey);
            if (cached) return cached;
        } catch {
            // 缓存读取失败，继续请求源站
        }
    }

    // ── 从豆瓣图床拉取图片（多镜像自动容灾） ────────────────────────────
    let lastStatus = 502;
    let lastError = 'Error fetching image';

    for (const candidate of buildDoubanImageCandidates(imageUrl)) {
        try {
            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 6000);

            const imageResponse = await fetch(candidate, {
                headers: REQUEST_HEADERS,
                signal: controller.signal,
            });

            clearTimeout(timer);

            if (!imageResponse.ok) {
                lastStatus = imageResponse.status;
                lastError = imageResponse.statusText || 'Error fetching image';
                continue; // 尝试下一个镜像
            }

            if (!imageResponse.body) {
                lastStatus = 500;
                lastError = 'Image response has no body';
                continue;
            }

            const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';
            const body = await imageResponse.arrayBuffer();

            const headers = new Headers();
            headers.set('Content-Type', contentType);
            headers.set('Cache-Control', 'public, max-age=15720000, s-maxage=15720000');
            headers.set('Access-Control-Allow-Origin', '*');

            const response = new Response(body, { status: 200, headers });

            // 写入边缘缓存
            if (cache) {
                try {
                    const cacheResponse = new Response(body, { status: 200, headers });
                    cache.put(cacheKey, cacheResponse).catch(() => {});
                } catch {}
            }

            return response;
        } catch (err: any) {
            // 网络不可达或超时，继续尝试下一个镜像候选
            lastStatus = err?.name === 'AbortError' ? 504 : 502;
            lastError = err?.message || 'Mirror unreachable';
            continue;
        }
    }

    return NextResponse.json({ error: lastError }, { status: lastStatus });
}
