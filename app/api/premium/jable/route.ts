import { NextRequest, NextResponse } from 'next/server';
import { fetchJableList, type JableVideoItem } from '@/lib/server/jable-scraper';
import { PREMIUM_SOURCES } from '@/lib/api/premium-sources';

export const runtime = 'edge';

/**
 * Jable 原生数据路由
 * 
 * 参数：
 * - mode: 'today' | 'weekly' | 'monthly' | 'latest' | 'category' | 'search'
 * - category: 分类 slug (如 'chinese-subtitle', 'censored', 'uncensored')
 * - q: 搜索词或女优名
 * - page: 页码 (1, 2, 3...)
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'today';
    const category = searchParams.get('category') || '';
    const q = searchParams.get('q') || '';
    const page = searchParams.get('page') || '1';

    let path = '/';
    const params: Record<string, string> = {};

    if (page && page !== '1') {
        params.from = page;
    }

    switch (mode) {
        case 'today':
            path = '/hot/';
            break;
        case 'weekly':
            path = '/hot/';
            params.mode = 'weekly';
            break;
        case 'monthly':
            path = '/hot/';
            params.mode = 'monthly';
            break;
        case 'latest':
            path = '/latest-updates/';
            break;
        case 'category':
            if (category) {
                path = `/categories/${encodeURIComponent(category)}/`;
            } else {
                path = '/categories/';
            }
            break;
        case 'search':
            if (q) {
                path = `/search/${encodeURIComponent(q)}/`;
            } else {
                path = '/latest-updates/';
            }
            break;
        default:
            path = '/';
    }

    try {
        let videos: JableVideoItem[] = await fetchJableList(path, params);

        // 如果 Jable 抓取结果为空（如搜索冷门词或遇临时限流），双轨自动降级到备用专线池
        if (videos.length === 0) {
            console.log(`[JableAPI] Jable returned empty, falling back to backup sources for query: ${q || category || mode}`);
            const fallbackRes = await fetch(`${request.nextUrl.origin}/api/premium/category`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sources: PREMIUM_SOURCES,
                    category: q || category || '',
                    page: page,
                    limit: '20'
                })
            });

            if (fallbackRes.ok) {
                const fallbackData = await fallbackRes.json();
                videos = (fallbackData.videos || []).map((v: any) => ({
                    vod_id: String(v.vod_id),
                    vod_name: v.vod_name,
                    vod_pic: v.vod_pic,
                    vod_remarks: v.vod_remarks || '4K 原画',
                    source: v.source || 'hsck',
                }));
            }
        }

        if (videos.length === 0) {
            // 极速预烘焙数据终极兜底
            const { PREBAKED_PREMIUM_DATA } = await import('@/lib/data/premium-prebaked');
            videos = PREBAKED_PREMIUM_DATA as any;
        }

        return NextResponse.json(
            { videos, mode, page, total: videos.length },
            {
                headers: {
                    'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
                    'CDN-Cache-Control': 'public, s-maxage=3600',
                    'Cloudflare-CDN-Cache-Control': 'public, s-maxage=3600',
                },
            }
        );
    } catch (error: any) {
        console.error('[JableAPI] Route error:', error);
        const { PREBAKED_PREMIUM_DATA } = await import('@/lib/data/premium-prebaked');
        return NextResponse.json(
            { videos: PREBAKED_PREMIUM_DATA, error: 'Fallback to prebaked' },
            {
                status: 200,
                headers: {
                    'Cache-Control': 'public, max-age=300, s-maxage=600',
                },
            }
        );
    }
}
