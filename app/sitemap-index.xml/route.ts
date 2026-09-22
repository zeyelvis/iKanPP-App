import { NextResponse } from 'next/server';
import { getSitemapCatalog } from '@/lib/services/entity-kv';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';
const TITLES_PER_SITEMAP = 2000;

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const todayStr = new Date().toISOString().split('T')[0];

  // 获取全量实体数量，计算所需分卷数并计算各分卷真实最后更新时间
  const catalog = await getSitemapCatalog();
  const totalTitles = catalog.length;
  const pageCount = Math.max(1, Math.ceil(totalTitles / TITLES_PER_SITEMAP));

  const subSitemaps: { url: string; lastmod: string }[] = [
    { url: `${BASE_URL}/sitemap.xml`, lastmod: todayStr },
    { url: `${BASE_URL}/sitemap-topics.xml`, lastmod: todayStr },
    { url: `${BASE_URL}/sitemap-genres.xml`, lastmod: todayStr },
    { url: `${BASE_URL}/sitemap-people.xml`, lastmod: todayStr },
  ];

  for (let p = 1; p <= pageCount; p++) {
    const start = (p - 1) * TITLES_PER_SITEMAP;
    const end = start + TITLES_PER_SITEMAP;
    const slice = catalog.slice(start, end);

    // 真实增量感知 (Truthful Lastmod)：从分卷切片中提取最大更新时间，历史分卷不虚标更新
    let maxDate = '';
    for (const item of slice) {
      if (item.updatedAt && item.updatedAt > maxDate) {
        maxDate = item.updatedAt;
      }
    }
    const chunkLastMod = maxDate ? maxDate.split('T')[0] : todayStr;

    subSitemaps.push({
      url: `${BASE_URL}/sitemap-titles-${p}.xml`,
      lastmod: chunkLastMod,
    });
  }

  const sitemapElements = subSitemaps.map(item => `  <sitemap>
    <loc>${escapeXml(item.url)}</loc>
    <lastmod>${item.lastmod}</lastmod>
  </sitemap>`).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapElements}
</sitemapindex>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
