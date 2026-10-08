import { NextResponse } from 'next/server';
import { getDb } from '@/lib/data/d1/db';
import { sitemapTitleVolumes } from '@/lib/data/d1/sitemaps';


const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

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

  const subSitemaps: { url: string; lastmod: string }[] = [
    { url: `${BASE_URL}/sitemap.xml`, lastmod: todayStr },
    { url: `${BASE_URL}/sitemap-topics.xml`, lastmod: todayStr },
    { url: `${BASE_URL}/sitemap-genres.xml`, lastmod: todayStr },
    { url: `${BASE_URL}/sitemap-people.xml`, lastmod: todayStr },
  ];

  // 作品分卷：每卷的 lastmod 取卷内作品最晚的更新日期（不虚标）
  const db = getDb();
  const volumes = db ? await sitemapTitleVolumes(db) : [];
  for (const v of volumes) {
    subSitemaps.push({ url: `${BASE_URL}/sitemap-titles-${v.page}.xml`, lastmod: v.lastmod || todayStr });
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
