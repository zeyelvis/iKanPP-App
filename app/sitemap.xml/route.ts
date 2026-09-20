import { NextResponse } from 'next/server';
import { listRecentEntities, getSitemapCatalog } from '@/lib/services/entity-kv';
import { generateSlug } from '@/lib/data/entities/entity-utils';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

// 核心高权重频道大厅与公开可索引页面（不含播放器空壳）
const STATIC_ROUTES = [
    { path: '', priority: '1.0', changefreq: 'daily' },
    { path: '/movie', priority: '0.95', changefreq: 'daily' },
    { path: '/tv', priority: '0.95', changefreq: 'daily' },
    { path: '/anime', priority: '0.95', changefreq: 'daily' },
    { path: '/variety', priority: '0.95', changefreq: 'daily' },
    { path: '/documentary', priority: '0.95', changefreq: 'daily' },
    { path: '/short', priority: '0.95', changefreq: 'daily' },
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

    // 1. 静态主频道与公开索引页
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

    // 2. 动态增量收录影视落地页（最新增量入库条目）
    try {
        const recentEntities = await listRecentEntities(60);
        for (const item of recentEntities) {
            const slug = item.slug || generateSlug(item.title);
            const fullUrl = `${BASE_URL}/title/${item.entityId}-${slug}`;
            if (seenUrls.has(fullUrl)) continue;
            seenUrls.add(fullUrl);

            const modDate = item.createdAt ? item.createdAt.split('T')[0] : lastModDate;

            urlElements.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
  </url>`);
        }

        // 3. 追加高频活跃影视实体（前 500 部，极速直出且不超时）
        const catalog = await getSitemapCatalog();
        const topEntities = catalog.slice(0, 500);

        for (const ent of topEntities) {
            if (!ent || !ent.id) continue;
            const cleanSlug = generateSlug(ent.slug || ent.id);
            const fullUrl = `${BASE_URL}/title/${ent.id}-${cleanSlug}`;
            if (seenUrls.has(fullUrl)) continue;
            seenUrls.add(fullUrl);

            const modDate = ent.updatedAt || lastModDate;

            urlElements.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${modDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.80</priority>
  </url>`);
        }
    } catch (e) {
        console.warn('[sitemap.xml] dynamic entity injection warning:', e);
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements.join('\n')}
</urlset>`;

    return new NextResponse(xml, {
        status: 200,
        headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
        },
    });
}

