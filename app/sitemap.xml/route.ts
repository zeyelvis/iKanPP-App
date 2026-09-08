import { NextResponse } from 'next/server';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

// 核心高权重频道大厅与公开可索引页面（不含播放器空壳）
const STATIC_ROUTES = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/movie', priority: '0.95', changefreq: 'daily' },
    { path: '/tv', priority: '0.95', changefreq: 'daily' },
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

function escapeXml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

export async function GET() {
    const lastModDate = new Date().toISOString().split('T')[0]; // 使用标准 YYYY-MM-DD
    const seenUrls = new Set<string>();
    const urlElements: string[] = [];

    // 静态主频道与公开索引页
    for (const route of STATIC_ROUTES) {
        const fullUrl = `${BASE_URL}${route.path}`;
        if (seenUrls.has(fullUrl)) continue;
        seenUrls.add(fullUrl);

        urlElements.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${lastModDate}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
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
