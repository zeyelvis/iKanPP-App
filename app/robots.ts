import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/settings', '/profile', '/premium', '/player'],
            },
            // 支持各大主流 AI 搜索引擎 (ChatGPT, Claude, Perplexity, Gemini, Applebot)
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'cohere-ai', 'CCBot', 'Applebot'],
                allow: '/',
                disallow: ['/api/', '/profile', '/settings', '/premium', '/player'],
            },
        ],
        sitemap: [
            `${BASE_URL}/sitemap-index.xml`,
            `${BASE_URL}/sitemap.xml`,
        ],
    };
}
