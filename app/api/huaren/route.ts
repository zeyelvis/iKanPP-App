import { NextRequest, NextResponse } from 'next/server';
import { fetchHuarenList, type HuarenVideoItem } from '@/lib/server/huaren-scraper';
import { searchVideos } from '@/lib/api/client';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';

export const runtime = 'edge';

// 热门华语精选关键词池（确保首屏秒开）
const HUAREN_KEYWORDS: Record<string, string[]> = {
    hot: ['繁花', '庆余年', '热辣滚烫', '长相思', '追风者', '三体', '狂飙', '流浪地球', '隐秘的角落', '漫长的季节'],
    movie: ['华语', '院线', '粤语', '港产', '动作', '悬疑', '喜剧', '经典'],
    tv: ['国产', '古装', '都市', '爱情', '悬疑', '仙侠', '武侠', '热播'],
    variety: ['跑男', '歌手', '王牌', '脱口秀', '极限挑战', '乘风破浪', '向往的生活'],
    anime: ['仙逆', '完美世界', '遮天', '斗罗大陆', '斗破苍穹', '凡人修仙传', '吞噬星空', '武庚纪'],
};

/**
 * 华人影视专区数据接口
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'hot';
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1', 10);

    try {
        let videos: HuarenVideoItem[] = [];

        // 1. 尝试从 Huaren.live 抓取
        if (!q) {
            let path = '/';
            if (mode === 'movie') path = '/type/1.html';
            else if (mode === 'tv') path = '/type/2.html';
            else if (mode === 'variety') path = '/type/3.html';
            else if (mode === 'anime') path = '/type/4.html';

            videos = await fetchHuarenList(path, { page: page.toString() });
        }

        // 2. 双轨极速保障：若抓取为空或用户搜索，自动并行调度华语高速专线
        if (videos.length === 0) {
            const queryWord = q || HUAREN_KEYWORDS[mode]?.[0] || '热播';
            const searchRes = await searchVideos(queryWord, DEFAULT_SOURCES.slice(0, 8), page);

            const allItems = searchRes.flatMap(r => r.results || []);
            const seen = new Set<string>();

            videos = allItems
                .filter(item => {
                    if (!item || !item.vod_id || seen.has(String(item.vod_id))) return false;
                    seen.add(String(item.vod_id));
                    return true;
                })
                .slice(0, 24)
                .map(item => ({
                    vod_id: String(item.vod_id),
                    vod_name: item.vod_name || '华语热播大片',
                    vod_pic: item.vod_pic || '',
                    vod_remarks: item.vod_remarks || '4K 极清',
                    type_name: item.type_name || '华语精选',
                    vod_year: item.vod_year,
                    source: 'huaren',
                }));
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
        console.error('[HuarenAPI] Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch Huaren media' },
            { status: 500 }
        );
    }
}
