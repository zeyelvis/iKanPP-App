import { NextRequest, NextResponse } from 'next/server';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

export const runtime = 'edge';

// 华语热门精品电影/剧集大盘（0毫秒秒出兜底库）
const HUAREN_PRESET_MAP: Record<string, Array<{ id: string; title: string; cover: string; rate: string; tag: string }>> = {
    hot: [
        { id: 'h1', title: '庆余年 第二季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2908075726.jpg', rate: '8.8', tag: '古装权谋' },
        { id: 'h2', title: '繁花', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2901968835.jpg', rate: '8.7', tag: '王家卫' },
        { id: 'h3', title: '三体', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886470395.jpg', rate: '8.8', tag: '科幻巨制' },
        { id: 'h4', title: '狂飙', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886867595.jpg', rate: '8.5', tag: '高能扫黑' },
        { id: 'h5', title: '长相思', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2896014495.jpg', rate: '7.8', tag: '仙侠虐恋' },
        { id: 'h6', title: '热辣滚烫', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903730595.jpg', rate: '7.8', tag: '励志喜剧' },
        { id: 'h7', title: '追风者', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2905634595.jpg', rate: '8.0', tag: '民国谍战' },
        { id: 'h8', title: '流浪地球2', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886407595.jpg', rate: '8.3', tag: '硬核科幻' },
        { id: 'h9', title: '漫长的季节', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2890667595.jpg', rate: '9.4', tag: '豆瓣神作' },
        { id: 'h10', title: '隐秘的角落', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2609067595.jpg', rate: '8.8', tag: '高能悬疑' },
        { id: 'h11', title: '无间道', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2564557595.jpg', rate: '9.3', tag: '港片巅峰' },
        { id: 'h12', title: '大话西游之月光宝盒', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2561716440.jpg', rate: '9.0', tag: '华语经典' },
    ],
    movie: [
        { id: 'm1', title: '流浪地球2', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886407595.jpg', rate: '8.3', tag: '硬核科幻' },
        { id: 'm2', title: '封神第一部：朝歌风云', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2895697595.jpg', rate: '7.8', tag: '神话史诗' },
        { id: 'm3', title: '热辣滚烫', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903730595.jpg', rate: '7.8', tag: '励志喜剧' },
        { id: 'm4', title: '飞驰人生2', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903730596.jpg', rate: '7.7', tag: '热血赛车' },
        { id: 'm5', title: '第二十条', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903730597.jpg', rate: '7.6', tag: '张艺谋' },
        { id: 'm6', title: '九龙城寨之围城', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2907430595.jpg', rate: '7.5', tag: '港式硬核' },
        { id: 'm7', title: '无间道', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2564557595.jpg', rate: '9.3', tag: '经典港影' },
        { id: 'm8', title: '霸王别姬', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2561716440.jpg', rate: '9.6', tag: '华语之巅' },
    ],
    tv: [
        { id: 't1', title: '庆余年 第二季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2908075726.jpg', rate: '8.8', tag: '古装大剧' },
        { id: 't2', title: '繁花', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2901968835.jpg', rate: '8.7', tag: '全网热播' },
        { id: 't3', title: '狂飙', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886867595.jpg', rate: '8.5', tag: '现象级爆款' },
        { id: 't4', title: '三体', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2886470395.jpg', rate: '8.8', tag: '口碑封神' },
        { id: 't5', title: '漫长的季节', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2890667595.jpg', rate: '9.4', tag: '9.4高分' },
        { id: 't6', title: '边水往事', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2911667595.jpg', rate: '8.0', tag: '高能悬疑' },
        { id: 't7', title: '雪中悍刀行', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2880667595.jpg', rate: '7.5', tag: '江湖武侠' },
        { id: 't8', title: '梦华录', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2870667595.jpg', rate: '8.0', tag: '古装雅韵' },
    ],
    variety: [
        { id: 'v1', title: '歌手2024', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2908067595.jpg', rate: '8.5', tag: '现场直播' },
        { id: 'v2', title: '奔跑吧 第十二季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2907067595.jpg', rate: '7.2', tag: '爆笑户外' },
        { id: 'v3', title: '乘风2024', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2906067595.jpg', rate: '7.5', tag: '女团竞技' },
        { id: 'v4', title: '极限挑战 第十季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2905067595.jpg', rate: '7.0', tag: '搞笑挑战' },
        { id: 'v5', title: '种地吧 第二季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2904067595.jpg', rate: '9.0', tag: '慢综艺' },
        { id: 'v6', title: '大侦探 第九季', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2903067595.jpg', rate: '8.8', tag: '推理烧脑' },
    ],
    anime: [
        { id: 'a1', title: '仙逆', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2898067595.jpg', rate: '8.9', tag: '国漫顶流' },
        { id: 'a2', title: '完美世界', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2878067595.jpg', rate: '8.4', tag: '石昊称尊' },
        { id: 'a3', title: '遮天', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2888067595.jpg', rate: '8.0', tag: '九龙拉棺' },
        { id: 'a4', title: '凡人修仙传', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2868067595.jpg', rate: '9.0', tag: '韩立成仙' },
        { id: 'a5', title: '吞噬星空', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2858067595.jpg', rate: '8.2', tag: '机甲科幻' },
        { id: 'a6', title: '斗罗大陆2绝世唐门', cover: 'https://images.weserv.nl/?url=https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2895067595.jpg', rate: '7.8', tag: '玄幻动作' },
    ],
};

/**
 * 获取豆瓣影视推荐（带 1.5s 快速超时）
 */
async function fetchDoubanData(tag: string, type: 'movie' | 'tv'): Promise<any[]> {
    try {
        const url = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURIComponent(tag)}&sort=recommend&page_limit=20&page_start=0`;
        const res = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
                'Referer': 'https://movie.douban.com/',
            },
            signal: AbortSignal.timeout(1500),
            next: { revalidate: 86400 },
        });

        if (!res.ok) return [];
        const data = await res.json();
        return Array.isArray(data.subjects) ? data.subjects : [];
    } catch {
        return [];
    }
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const mode = searchParams.get('mode') || 'hot';

    try {
        let tag = '华语';
        let type: 'movie' | 'tv' = 'movie';

        if (mode === 'hot') {
            tag = '热门';
            type = 'tv';
        } else if (mode === 'movie') {
            tag = '华语';
            type = 'movie';
        } else if (mode === 'tv') {
            tag = '国产剧';
            type = 'tv';
        } else if (mode === 'variety') {
            tag = '综艺';
            type = 'tv';
        } else if (mode === 'anime') {
            tag = '国产动画';
            type = 'tv';
        }

        // 1. 尝试从豆瓣拉取最新热播流
        const subjects = await fetchDoubanData(tag, type);

        let videos: any[] = [];

        if (subjects.length > 0) {
            videos = subjects.map((item: any) => ({
                vod_id: String(item.id || item.title),
                vod_name: item.title,
                vod_pic: item.cover ? `/api/douban/image?url=${encodeURIComponent(item.cover)}` : '',
                vod_remarks: item.rate ? `豆瓣 ${item.rate}` : '4K 原画',
                type_name: tag,
                source: 'huaren',
            }));
        }

        // 2. 若豆瓣请求超时或返回空，立刻无缝返回 Prebaked 高清精选库（0 毫秒）
        if (videos.length === 0) {
            const presetList = HUAREN_PRESET_MAP[mode] || HUAREN_PRESET_MAP['hot'];
            videos = presetList.map((item) => ({
                vod_id: item.id,
                vod_name: item.title,
                vod_pic: item.cover,
                vod_remarks: item.rate ? `豆瓣 ${item.rate}` : '4K 蓝光',
                type_name: item.tag,
                source: 'huaren',
            }));
        }

        return NextResponse.json(
            {
                success: true,
                videos,
                mode,
                total: videos.length,
            },
            {
                headers: {
                    'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
                    'CDN-Cache-Control': 'public, s-maxage=3600',
                },
            }
        );
    } catch (error) {
        console.error('[HuarenAPI] Error:', error);
        // 彻底兜底
        const presetList = HUAREN_PRESET_MAP['hot'];
        const videos = presetList.map((item) => ({
            vod_id: item.id,
            vod_name: item.title,
            vod_pic: item.cover,
            vod_remarks: `豆瓣 ${item.rate}`,
            type_name: item.tag,
            source: 'huaren',
        }));

        return NextResponse.json({ success: true, videos, mode, total: videos.length });
    }
}
