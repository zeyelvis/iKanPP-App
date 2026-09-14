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
            // 中国主流传统搜索引擎爬虫 (百度、字节跳动/头条/抖音、搜狗、360、神马/阿里)
            {
                userAgent: [
                    'Baiduspider',
                    'Baiduspider-image',
                    'Baiduspider-video',
                    'Bytespider',
                    'Sogou web spider',
                    'Sogou inst spider',
                    '360Spider',
                    'YisouSpider',
                ],
                allow: '/',
                disallow: ['/api/', '/settings', '/profile', '/premium', '/player'],
            },
            // 中国 AI 搜索引擎与大模型 (秘塔搜索、月之暗面 Kimi、DeepSeek、阿里通义、微信搜索)
            {
                userAgent: [
                    'MetasoSpider',
                    'Kimichat',
                    'DeepSeekBot',
                    'TongyiBot',
                    'WeChatBot',
                ],
                allow: '/',
                disallow: ['/api/', '/settings', '/profile', '/premium', '/player'],
            },
            // 全球主流 AI 搜索引擎与大模型爬虫 (ChatGPT, Claude, Perplexity, Gemini, Applebot, etc.)
            {
                userAgent: [
                    'GPTBot',
                    'ChatGPT-User',
                    'ClaudeBot',
                    'PerplexityBot',
                    'Google-Extended',
                    'cohere-ai',
                    'CCBot',
                    'Applebot',
                    'Amazonbot',
                    'FacebookBot',
                ],
                allow: '/',
                disallow: ['/api/', '/settings', '/profile', '/premium', '/player'],
            },
        ],
        sitemap: [
            `${BASE_URL}/sitemap-index.xml`,
            `${BASE_URL}/sitemap.xml`,
        ],
    };
}
