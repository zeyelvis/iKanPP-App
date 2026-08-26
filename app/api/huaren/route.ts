import { NextRequest, NextResponse } from 'next/server';
import { fetchHuarenList, type HuarenVideoItem } from '@/lib/server/huaren-scraper';
import { searchVideos } from '@/lib/api/client';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';

export const runtime = 'edge';

/**
 * 华人影视专区数据接口
 * 
 * 参数：
 * - mode: 'hot' | 'latest' | 'movie' | 'tv' | 'variety' | 'anime' | 'search'
 * - q: 搜索词
 * - page: 页码
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'hot';
    const q = searchParams.get('q') || '';
    const page = searchParams.get('page') || '1';

    let path = '/';
    const params: Record<string, string> = {};

    if (page && page !== '1') {
        params.page = page;
    }

    switch (mode) {
        case 'hot':
            path = '/';
            break;
        case 'movie':
            path = '/type/1.html';
            break;
        case 'tv':
            path = '/type/2.html';
            break;
        case 'variety':
            path = '/type/3.html';
            break;
        case 'anime':
            path = '/type/4.html';
            break;
        case 'search':
            if (q) {
                path = `/search.html?wd=${encodeURIComponent(q)}`;
            } else {
                path = '/';
            }
            break;
        default:
            path = '/';
    }

    try {
        let videos: HuarenVideoItem[] = await fetchHuarenList(path, params);

        // 双轨容灾保护：若遇到临时限流或搜索冷门内容，自动无缝调度全网影视源
        if (videos.length === 0) {
            const fallbackQuery = q || (mode === 'movie' ? '华语' : mode === 'tv' ? '大剧' : mode === 'variety' ? '综艺' : '热播');
            try {
                const searchResults = await searchVideos(fallbackQuery, DEFAULT_SOURCES);
                videos = (searchResults || []).slice(0, 20).map((v: any) => ({
                    vod_id: String(v.vod_id),
                    vod_name: v.vod_name,
                    vod_pic: v.vod_pic,
                    vod_remarks: v.vod_remarks || '4K 蓝光',
                    type_name: v.type_name || '华语精选',
                    vod_year: v.vod_year,
                    source: 'huaren',
                }));
            } catch {}
        }

        return NextResponse.json(
            {
                success: true,
                videos,
                mode,
                page,
                total: videos.length,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=1200, stale-while-revalidate=86400',
                    'CDN-Cache-Control': 'public, s-maxage=1200',
                },
            }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, error: 'Failed to fetch Huaren media' },
            { status: 500 }
        );
    }
}
