import { MetadataRoute } from 'next';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

// ==================== 1. 核心静态页面 ====================
const STATIC_ROUTES = [
    { url: '', priority: 1.0, changeFrequency: 'daily' as const },
    { url: '/movie', priority: 0.95, changeFrequency: 'daily' as const },
    { url: '/tv', priority: 0.95, changeFrequency: 'daily' as const },
    { url: '/guoman', priority: 0.95, changeFrequency: 'daily' as const },
    { url: '/anime', priority: 0.95, changeFrequency: 'daily' as const },
    { url: '/variety', priority: 0.95, changeFrequency: 'daily' as const },
    { url: '/ranking', priority: 0.95, changeFrequency: 'daily' as const },
    { url: '/iptv', priority: 0.85, changeFrequency: 'daily' as const },
    { url: '/download', priority: 0.8, changeFrequency: 'weekly' as const },
    { url: '/about', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/faq', priority: 0.6, changeFrequency: 'monthly' as const },
    { url: '/referral', priority: 0.5, changeFrequency: 'monthly' as const },
    { url: '/privacy', priority: 0.3, changeFrequency: 'yearly' as const },
    { url: '/terms', priority: 0.3, changeFrequency: 'yearly' as const },
];

// ==================== 2. 影视分类矩阵（大类 + 地域 + 场景）====================
const CATEGORY_MATRIX = [
    // 内容大类
    '电影', '电视剧', '美剧', '韩剧', '日剧', '港剧', '台剧', '国产剧', '泰剧',
    '动漫', '国漫', '日漫', '新番', '综艺', '纪录片', '短剧',
    // 年份热词
    '2026新片', '2026热播剧', '2026美剧', '2026韩剧', '2026日剧', '2026国产剧', '2026动漫新番',
    '2025高分电影', '2025美剧推荐',
    // 口碑与评分
    '高分电影', '豆瓣高分电视剧', '必看神作', '经典港片', '漫威电影全集',
    '周星驰全集', '宫崎骏动画全集', '诺兰电影全集',
    // 海外华人场景词
    '海外看剧', '海外看电影', '海外华人影视', '北美看剧', '欧洲看剧', '澳洲看剧',
    '新马华人追剧', '海外免翻墙看剧', '海外中文电影网站',
    // 画质/设备
    '4K超清电影', '4K电视剧', '蓝光高清电影',
    // 字幕
    '中英双字电影', '英文字幕美剧',
];

// ==================== 3. 常青经典影史片库（海外华人搜索量极大且常年不衰）====================
const EVERGREEN_TITLES = [
    // 华语经典（海外华人必搜）
    '西游记', '红楼梦', '三国演义', '水浒传', '射雕英雄传', '天龙八部', '神雕侠侣',
    '甄嬛传', '琅琊榜', '知否知否应是绿肥红瘦', '人民的名义', '大明王朝1566',
    '潜伏', '伪装者', '白鹿原', '都挺好', '觉醒年代', '狂飙', '繁花', '庆余年',
    // 周星驰经典（海外社区长期讨论）
    '大话西游', '功夫', '少林足球', '喜剧之王', '唐伯虎点秋香', '食神',
    // 港片经典
    '无间道', '英雄本色', '赌神', '古惑仔', '倩女幽魂', '霸王别姬',
    // 经典美剧（海外华人双语搜索）
    '权力的游戏', '绝命毒师', '老友记', '纸牌屋', '黑镜', '怪奇物语',
    '鱿鱼游戏', '最后生还者', '曼达洛人',
    // 经典韩剧
    '鬼怪', '请回答1988', '来自星星的你', '太阳的后裔', '黑暗荣耀',
    // 宫崎骏 / 动漫经典
    '千与千寻', '龙猫', '天空之城', '灌篮高手', '名侦探柯南', '海贼王', '进击的巨人',
    '鬼灭之刃', '咒术回战', '间谍过家家',
    // 漫威 / 好莱坞经典
    '复仇者联盟', '蜘蛛侠', '蝙蝠侠', '哈利波特', '指环王', '星球大战',
    '盗梦空间', '星际穿越', '肖申克的救赎', '阿甘正传',
];

// ==================== 4. 豆瓣多榜单抓取配置 ====================
const DOUBAN_ENDPOINTS = [
    // 电影榜
    { type: 'movie', tag: '热门', limit: 50 },
    { type: 'movie', tag: '最新', limit: 50 },
    { type: 'movie', tag: '豆瓣高分', limit: 50 },
    { type: 'movie', tag: '冷门佳片', limit: 30 },
    { type: 'movie', tag: '华语', limit: 40 },
    { type: 'movie', tag: '欧美', limit: 40 },
    { type: 'movie', tag: '韩国', limit: 30 },
    { type: 'movie', tag: '日本', limit: 30 },
    // 电视剧榜
    { type: 'tv', tag: '热门', limit: 50 },
    { type: 'tv', tag: '国产剧', limit: 50 },
    { type: 'tv', tag: '美剧', limit: 40 },
    { type: 'tv', tag: '韩剧', limit: 40 },
    { type: 'tv', tag: '日剧', limit: 30 },
    { type: 'tv', tag: '港剧', limit: 30 },
    { type: 'tv', tag: '日本动画', limit: 30 },
];

// 安全抓取豆瓣接口
async function fetchDoubanList(type: string, tag: string, limit: number): Promise<string[]> {
    try {
        const res = await fetch(
            `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURIComponent(tag)}&sort=recommend&page_limit=${limit}&page_start=0`,
            {
                headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
                next: { revalidate: 3600 },
            }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.subjects || []).map((s: { title?: string }) => s.title).filter(Boolean);
    } catch {
        return [];
    }
}

// ==================== 5. Sitemap 主函数 ====================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const sitemapList: MetadataRoute.Sitemap = [];
    const seen = new Set<string>(); // URL 去重

    const addUrl = (url: string, opts: { priority?: number; changeFrequency?: MetadataRoute.Sitemap[0]['changeFrequency']; withHreflang?: boolean }) => {
        if (seen.has(url)) return;
        seen.add(url);

        const entry: MetadataRoute.Sitemap[0] = {
            url,
            lastModified: now,
            changeFrequency: opts.changeFrequency || 'daily',
            priority: opts.priority || 0.7,
        };

        if (opts.withHreflang) {
            const path = url.replace(BASE_URL, '');
            entry.alternates = {
                languages: {
                    'zh-CN': `${BASE_URL}${path}`,
                    'zh-TW': `${BASE_URL}${path}`,
                    'zh-HK': `${BASE_URL}${path}`,
                    'zh-SG': `${BASE_URL}${path}`,
                    'zh-MY': `${BASE_URL}${path}`,
                    'en': `${BASE_URL}${path}`,
                },
            };
        }

        sitemapList.push(entry);
    };

    // 1. 核心静态路由（带 hreflang）
    for (const route of STATIC_ROUTES) {
        addUrl(`${BASE_URL}${route.url}`, {
            priority: route.priority,
            changeFrequency: route.changeFrequency,
            withHreflang: true,
        });
    }

    // 2. 影视分类矩阵页
    for (const cat of CATEGORY_MATRIX) {
        addUrl(`${BASE_URL}/?q=${encodeURIComponent(cat)}`, {
            priority: 0.85,
            changeFrequency: 'daily',
        });
    }

    // 3. 常青经典影史片库（永久索引）
    for (const title of EVERGREEN_TITLES) {
        addUrl(`${BASE_URL}/?q=${encodeURIComponent(title)}`, {
            priority: 0.8,
            changeFrequency: 'weekly',
        });
    }

    // 4. 豆瓣多榜单实时热播影视（并发抓取，单个失败不影响全局）
    const doubanResults = await Promise.allSettled(
        DOUBAN_ENDPOINTS.map(ep => fetchDoubanList(ep.type, ep.tag, ep.limit))
    );

    for (const result of doubanResults) {
        if (result.status === 'fulfilled') {
            for (const title of result.value) {
                addUrl(`${BASE_URL}/?q=${encodeURIComponent(title)}`, {
                    priority: 0.9,
                    changeFrequency: 'hourly',
                });
            }
        }
    }

    // 5. 为所有已收录的影片额外衍生 2 条海外华人高频长尾页（去重后）
    const movieTitles = Array.from(seen)
        .filter(url => url.includes('/?q='))
        .map(url => {
            try { return decodeURIComponent(url.split('/?q=')[1]); } catch { return ''; }
        })
        .filter(t => t && !CATEGORY_MATRIX.includes(t));

    // 精选 2 条最高价值长尾后缀（避免过度膨胀）
    const LONG_TAIL_SUFFIXES = ['全集在线看', '海外看'];

    for (const title of movieTitles) {
        for (const suffix of LONG_TAIL_SUFFIXES) {
            addUrl(`${BASE_URL}/?q=${encodeURIComponent(`${title} ${suffix}`)}`, {
                priority: 0.75,
                changeFrequency: 'daily',
            });
        }
    }

    return sitemapList;
}
