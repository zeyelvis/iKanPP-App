import { MetadataRoute } from 'next';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

// 基础核心静态页面
const STATIC_ROUTES = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/download', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/iptv', priority: 0.8, changeFrequency: 'daily' as const },
    { url: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/referral', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
];

// 高频热门搜索词与影视专题（全自动为每个分类/热门建立专属索引）
const TOP_CATEGORIES = [
    '电影', '电视剧', '美剧', '韩剧', '日剧', '港剧', '台剧', '国产剧',
    '动漫', '综艺', '高分电影', '2026新片', '2026热播剧', '海外看剧', '经典港片'
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const sitemapList: MetadataRoute.Sitemap = [];

    // 1. 核心路由（带多地域语言 alternate）
    for (const route of STATIC_ROUTES) {
        sitemapList.push({
            url: `${BASE_URL}${route.url}`,
            lastModified: now,
            changeFrequency: route.changeFrequency,
            priority: route.priority,
            alternates: {
                languages: {
                    'zh-CN': `${BASE_URL}${route.url}`,
                    'zh-TW': `${BASE_URL}${route.url}`,
                    'zh-HK': `${BASE_URL}${route.url}`,
                    'zh-SG': `${BASE_URL}${route.url}`,
                    'zh-MY': `${BASE_URL}${route.url}`,
                    'en': `${BASE_URL}${route.url}`,
                },
            },
        });
    }

    // 2. 热门分类索引页
    for (const cat of TOP_CATEGORIES) {
        sitemapList.push({
            url: `${BASE_URL}/?q=${encodeURIComponent(cat)}`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.85,
        });
    }

    // 3. 动态从豆瓣/TMDB 聚合热榜获取最新 2026 影视列表（实时动态生成每部新片的独立索引）
    try {
        const [movieRes, tvRes] = await Promise.allSettled([
            fetch('https://movie.douban.com/j/search_subjects?type=movie&tag=热门&sort=recommend&page_limit=40&page_start=0', {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                next: { revalidate: 3600 }
            }).then(r => r.ok ? r.json() : { subjects: [] }),
            fetch('https://movie.douban.com/j/search_subjects?type=tv&tag=热门&sort=recommend&page_limit=40&page_start=0', {
                headers: { 'User-Agent': 'Mozilla/5.0' },
                next: { revalidate: 3600 }
            }).then(r => r.ok ? r.json() : { subjects: [] }),
        ]);

        const movies = movieRes.status === 'fulfilled' ? (movieRes.value?.subjects || []) : [];
        const tvs = tvRes.status === 'fulfilled' ? (tvRes.value?.subjects || []) : [];
        const allItems = [...movies, ...tvs];

        for (const item of allItems) {
            if (item.title) {
                // 每部最新热门影视的专属索引入口
                sitemapList.push({
                    url: `${BASE_URL}/?q=${encodeURIComponent(item.title)}`,
                    lastModified: now,
                    changeFrequency: 'hourly',
                    priority: 0.9,
                });
            }
        }
    } catch {
        // 外部接口异常时降级返回基础 sitemap
    }

    return sitemapList;
}
