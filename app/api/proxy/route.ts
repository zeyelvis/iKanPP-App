import { NextRequest, NextResponse } from 'next/server';
import { processM3u8Content } from '@/lib/utils/proxy-utils';
import { fetchWithRetry } from '@/lib/utils/fetch-with-retry';
import { isSafeExternalUrl } from '@/lib/utils/security';

export const runtime = 'edge';

// Disable SSL verification for video sources with invalid certificates
// Note: This is not supported in Cloudflare Workers/Edge Runtime.
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');

    if (!url) {
        return new NextResponse('Missing URL parameter', { status: 400 });
    }

    // SSRF 防护：禁止内网 IP 和非法协议
    if (!isSafeExternalUrl(url)) {
        return new NextResponse('URL not allowed', { status: 403 });
    }

    // 双轨架构安全铁律：iKanPP 普通开放采集源必须 100% 浏览器直连，绝不允许通过代理中转消耗边缘算力及触发切片重写
    const OPEN_CMS_DOMAINS = [
        'gsuus.com', 'xluuss.com', 'bfzycdn.com', 'ffzyread.com',
        'lz-cdn', 'modujx.com', 'xinlang', '1080zyk', 'zuidazy'
    ];
    const isDirectPlayDomain = OPEN_CMS_DOMAINS.some(d => url.toLowerCase().includes(d));
    if (isDirectPlayDomain) {
        return new NextResponse(
            JSON.stringify({
                error: 'DirectPlayRequired',
                message: 'iKanPP open CMS sources must use direct play. Proxying is prohibited to prevent segment rewriting and bandwidth throttling.'
            }),
            { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
        );
    }

    try {
        // Extract headers to forward (only essential ones)
        const requestHeaders: Record<string, string> = {};
        const forwardHeaders = ['cookie', 'range'];

        forwardHeaders.forEach(key => {
            const value = request.headers.get(key);
            if (value) requestHeaders[key] = value;
        });

        // 优先使用显式传递的 referer 参数
        const explicitReferer = request.nextUrl.searchParams.get('referer');
        if (explicitReferer) {
            requestHeaders['Referer'] = explicitReferer;
            try {
                requestHeaders['Origin'] = new URL(explicitReferer).origin;
            } catch {}
            requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
        }

        // Jable.tv 与其他主流成人流媒体 CDN 防盗链自动伪装 (包含 mushroomtrack, mushroomcdn 等真实分发 CDN)
        const isJableRelated = url.includes('jable.tv') ||
            url.includes('assets-cdn.jable.tv') ||
            url.includes('mushroomtrack') ||
            url.includes('mushroomcdn') ||
            url.includes('fs-cdn') ||
            url.includes('jable');

        if (isJableRelated) {
            requestHeaders['Referer'] = requestHeaders['Referer'] || 'https://jable.tv/';
            requestHeaders['Origin'] = requestHeaders['Origin'] || 'https://jable.tv';
            requestHeaders['User-Agent'] = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36';
        }

        const effectiveReferer = requestHeaders['Referer'] || explicitReferer || (isJableRelated ? 'https://jable.tv/' : undefined);

        const response = await fetchWithRetry({ url, request, headers: requestHeaders });

        // If upstream returned an error, pass it through with CORS headers
        if (!response.ok) {
            const errorText = await response.text();
            return new NextResponse(errorText || `Upstream error: ${response.status}`, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    'Content-Type': response.headers.get('Content-Type') || 'text/plain',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        const contentType = response.headers.get('Content-Type');

        // Better M3U8 detection: check both content-type and actual content
        const isM3u8ByHeader = contentType &&
            (contentType.includes('application/vnd.apple.mpegurl') ||
                contentType.includes('application/x-mpegurl')) ||
            url.endsWith('.m3u8');

        // For potential M3U8 files, check content
        if (isM3u8ByHeader || url.includes('.m3u8')) {
            const text = await response.text();

            // Verify it's actually M3U8 content (starts with #EXTM3U or #EXT-X-)
            if (text.trim().startsWith('#EXTM3U') || text.trim().startsWith('#EXT-X-')) {
                const modifiedText = await processM3u8Content(text, url, request.nextUrl.origin, effectiveReferer);

                return new NextResponse(modifiedText, {
                    status: response.status,
                    statusText: response.statusText,
                    headers: {
                        'Content-Type': 'application/vnd.apple.mpegurl',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                });
            }

            // Not M3U8 content, return as-is
            return new NextResponse(text, {
                status: response.status,
                statusText: response.statusText,
                headers: {
                    'Content-Type': contentType || 'text/plain',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        // For non-m3u8 content
        const headers = new Headers();
        response.headers.forEach((value, key) => {
            const lowerKey = key.toLowerCase();
            if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(lowerKey)) {
                headers.set(key, value);
            }
        });

        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

        return new NextResponse(response.body, {
            status: response.status,
            statusText: response.statusText,
            headers: headers,
        });
    } catch (error) {
        console.error('Proxy error:', error);
        return new NextResponse(
            JSON.stringify({
                error: 'Proxy request failed',
                message: 'Internal proxy error',
            }),
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                }
            }
        );
    }
}

export async function OPTIONS(request: NextRequest) {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
