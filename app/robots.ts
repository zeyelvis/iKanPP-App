import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/api/', '/settings', '/player', '/profile', '/premium'],
            },
            // 支持各大主流 AI 搜索引擎 (ChatGPT, Claude, Perplexity, Gemini)
            {
                userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'cohere-ai', 'CCBot'],
                allow: '/',
                disallow: ['/api/', '/player', '/profile'],
            },
        ],
        sitemap: `${BASE_URL}/sitemap.xml`,
    };
}
