import { NextResponse } from 'next/server';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

// 核心高权重频道大厅与静态页面
const STATIC_ROUTES = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/movie', priority: '0.95', changefreq: 'daily' },
    { path: '/tv', priority: '0.95', changefreq: 'daily' },
    { path: '/guoman', priority: '0.95', changefreq: 'daily' },
    { path: '/anime', priority: '0.95', changefreq: 'daily' },
    { path: '/variety', priority: '0.95', changefreq: 'daily' },
    { path: '/ranking', priority: '0.95', changefreq: 'daily' },
    { path: '/iptv', priority: '0.85', changefreq: 'daily' },
    { path: '/download', priority: '0.80', changefreq: 'weekly' },
    { path: '/about', priority: '0.60', changefreq: 'monthly' },
    { path: '/faq', priority: '0.60', changefreq: 'monthly' },
    { path: '/referral', priority: '0.50', changefreq: 'monthly' },
    { path: '/privacy', priority: '0.30', changefreq: 'yearly' },
    { path: '/terms', priority: '0.30', changefreq: 'yearly' },
];

// 海量热门影视与高分神作种子库
const POPULAR_SEED_TITLES = [
    // 2025-2026 最新爆款电影
    { title: '抓娃娃', type: 'movie' },
    { title: '死侍与金刚狼', type: 'movie' },
    { title: '异形：夺命舰', type: 'movie' },
    { title: '九龙城寨之围城', type: 'movie' },
    { title: '沙丘2', type: 'movie' },
    { title: '默杀', type: 'movie' },
    { title: '白蛇：浮生', type: 'movie' },
    { title: '逆行人生', type: 'movie' },
    { title: '毒液：最后一舞', type: 'movie' },
    { title: '荒野机器人', type: 'movie' },
    { title: '角斗士2', type: 'movie' },
    { title: '疯狂的麦克斯：狂暴女神', type: 'movie' },
    { title: '哥斯拉大战金刚2：帝国崛起', type: 'movie' },
    { title: '头脑特工队2', type: 'movie' },
    { title: '功夫熊猫4', type: 'movie' },
    { title: '热辣滚烫', type: 'movie' },
    { title: '飞驰人生2', type: 'movie' },
    { title: '第二十条', type: 'movie' },

    // 豆瓣 9.0+ 影史高分经典电影
    { title: '肖申克的救赎', type: 'movie' },
    { title: '霸王别姬', type: 'movie' },
    { title: '阿甘正传', type: 'movie' },
    { title: '泰坦尼克号', type: 'movie' },
    { title: '星际穿越', type: 'movie' },
    { title: '盗梦空间', type: 'movie' },
    { title: '千与千寻', type: 'movie' },
    { title: '这个杀手不太冷', type: 'movie' },
    { title: '楚门的世界', type: 'movie' },
    { title: '美丽人生', type: 'movie' },
    { title: '辛德勒的名单', type: 'movie' },
    { title: '忠犬八公的故事', type: 'movie' },
    { title: '三傻大闹宝莱坞', type: 'movie' },
    { title: '放牛班的春天', type: 'movie' },
    { title: '大话西游之大圣娶亲', type: 'movie' },
    { title: '让子弹飞', type: 'movie' },
    { title: '无间道', type: 'movie' },
    { title: '流浪地球2', type: 'movie' },
    { title: '封神第一部：朝歌风云', type: 'movie' },
    { title: '奥本海默', type: 'movie' },
    { title: '阿凡达：水之道', type: 'movie' },
    { title: '复仇者联盟4：终局之战', type: 'movie' },

    // 2024-2026 热播电视剧集
    { title: '逐玉', type: 'tv' },
    { title: '莫离', type: 'tv' },
    { title: '庆余年 第二季', type: 'tv' },
    { title: '繁花', type: 'tv' },
    { title: '狂飙', type: 'tv' },
    { title: '漫长的季节', type: 'tv' },
    { title: '三体', type: 'tv' },
    { title: '墨雨云间', type: 'tv' },
    { title: '边水往事', type: 'tv' },
    { title: '长相思 第二季', type: 'tv' },
    { title: '唐朝诡事录之西行', type: 'tv' },
    { title: '雪中悍刀行', type: 'tv' },
    { title: '梦华录', type: 'tv' },
    { title: '苍兰诀', type: 'tv' },
    { title: '去有风的地方', type: 'tv' },

    // 顶级美剧 / 欧美剧
    { title: '辐射', type: 'tv' },
    { title: '黑袍纠察队 第四季', type: 'tv' },
    { title: '最后生还者', type: 'tv' },
    { title: '权力的游戏', type: 'tv' },
    { title: '绝命毒师', type: 'tv' },
    { title: '怪奇物语', type: 'tv' },
    { title: '西部世界', type: 'tv' },
    { title: '风骚律师', type: 'tv' },
    { title: '切尔诺贝利', type: 'tv' },
    { title: '旺达幻视', type: 'tv' },

    // 热门韩剧 / 日剧
    { title: '泪之女王', type: 'tv' },
    { title: '黑暗荣耀', type: 'tv' },
    { title: '请回答1988', type: 'tv' },
    { title: '机智的医生生活', type: 'tv' },
    { title: '太阳的后裔', type: 'tv' },
    { title: '鬼怪', type: 'tv' },
    { title: '非自然死亡', type: 'tv' },
    { title: '半泽直树', type: 'tv' },

    // 国创动漫 / 热血新番
    { title: '仙逆', type: 'tv' },
    { title: '凡人修仙传', type: 'tv' },
    { title: '遮天', type: 'tv' },
    { title: '吞噬星空', type: 'tv' },
    { title: '完美世界', type: 'tv' },
    { title: '斗罗大陆2绝世唐门', type: 'tv' },
    { title: '一人之下', type: 'tv' },
    { title: '狐妖小红娘', type: 'tv' },
    { title: '剑来', type: 'tv' },
    { title: '大理寺日志', type: 'tv' },
    { title: '鬼灭之刃 柱训练篇', type: 'tv' },
    { title: '进击的巨人 最终季', type: 'tv' },
    { title: '咒术回战 第二季', type: 'tv' },
    { title: '间谍过家家', type: 'tv' },
    { title: '葬送的芙莉莲', type: 'tv' },
    { title: '海贼王', type: 'tv' },
    { title: '火影忍者', type: 'tv' },
];

const LANGUAGES = ['zh-CN', 'zh-TW', 'zh-HK', 'zh-SG', 'zh-MY', 'en', 'x-default'];

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    const now = new Date().toISOString();
    const seenUrls = new Set<string>();
    const urlElements: string[] = [];

    // 1. 静态主频道
    for (const route of STATIC_ROUTES) {
        const fullUrl = `${BASE_URL}${route.path}`;
        if (seenUrls.has(fullUrl)) continue;
        seenUrls.add(fullUrl);

        const hreflangTags = LANGUAGES.map(
            (lang) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapeXml(fullUrl)}" />`
        ).join('\n    ');

        urlElements.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    ${hreflangTags}
    <lastmod>${now}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
    }

    // 2. 动态片库（包括预烘焙数据与热门种子）
    const allSubjects = [
        ...PREBAKED_HOME_DATA.movie.s1.map(s => ({ title: s.title, type: 'movie' })),
        ...PREBAKED_HOME_DATA.movie.s2.map(s => ({ title: s.title, type: 'movie' })),
        ...PREBAKED_HOME_DATA.movie.s3.map(s => ({ title: s.title, type: 'movie' })),
        ...PREBAKED_HOME_DATA.movie.s4.map(s => ({ title: s.title, type: 'movie' })),
        ...PREBAKED_HOME_DATA.tv.s1.map(s => ({ title: s.title, type: 'tv' })),
        ...PREBAKED_HOME_DATA.tv.s2.map(s => ({ title: s.title, type: 'tv' })),
        ...PREBAKED_HOME_DATA.tv.s3.map(s => ({ title: s.title, type: 'tv' })),
        ...PREBAKED_HOME_DATA.tv.s4.map(s => ({ title: s.title, type: 'tv' })),
        ...POPULAR_SEED_TITLES,
    ];

    for (const item of allSubjects) {
        if (!item.title) continue;
        const cleanTitle = item.title.trim();
        const rawUrl = `${BASE_URL}/player?title=${encodeURIComponent(cleanTitle)}&type=${item.type}`;
        if (seenUrls.has(rawUrl)) continue;
        seenUrls.add(rawUrl);

        const escapedUrl = escapeXml(rawUrl);
        const hreflangTags = LANGUAGES.map(
            (lang) => `<xhtml:link rel="alternate" hreflang="${lang}" href="${escapedUrl}" />`
        ).join('\n    ');

        urlElements.push(`  <url>
    <loc>${escapedUrl}</loc>
    ${hreflangTags}
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.85</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlElements.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
        },
    });
}
