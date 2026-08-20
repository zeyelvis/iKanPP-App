import { MetadataRoute } from 'next';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

// ==================== 1. 核心高权重频道大厅与静态页面 ====================
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

// ==================== 2. Sitemap 主函数 ====================
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();
    const sitemapList: MetadataRoute.Sitemap = [];

    // 核心静态路由（带多地域 hreflang 规范化映射）
    for (const route of STATIC_ROUTES) {
        const fullUrl = `${BASE_URL}${route.url}`;
        const path = route.url;

        sitemapList.push({
            url: fullUrl,
            lastModified: now,
            changeFrequency: route.changeFrequency,
            priority: route.priority,
            alternates: {
                languages: {
                    'zh-CN': `${BASE_URL}${path}`,
                    'zh-TW': `${BASE_URL}${path}`,
                    'zh-HK': `${BASE_URL}${path}`,
                    'zh-SG': `${BASE_URL}${path}`,
                    'zh-MY': `${BASE_URL}${path}`,
                    'en': `${BASE_URL}${path}`,
                    'x-default': `${BASE_URL}${path}`,
                },
            },
        });
    }

    return sitemapList;
}

