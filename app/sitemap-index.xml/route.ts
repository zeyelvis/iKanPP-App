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
  const lastModDate = new Date().toISOString().split('T')[0];

  // 获取全量实体数量，计算所需分卷数
  const catalog = await getSitemapCatalog();
  const totalTitles = catalog.length;
  const pageCount = Math.max(1, Math.ceil(totalTitles / TITLES_PER_SITEMAP));

  const subSitemaps = [
    `${BASE_URL}/sitemap.xml`,
    `${BASE_URL}/sitemap-genres.xml`,
    `${BASE_URL}/sitemap-people.xml`,
  ];

  for (let p = 1; p <= pageCount; p++) {
    subSitemaps.push(`${BASE_URL}/sitemap-titles-${p}.xml`);
  }

  const sitemapElements = subSitemaps.map(url => `  <sitemap>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastModDate}</lastmod>
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
