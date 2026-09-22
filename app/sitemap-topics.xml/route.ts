import { NextResponse } from 'next/server';
import { PREBAKED_TOPICS } from '@/lib/data/prebaked-topics';

export const dynamic = 'force-static';

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
  const topicSlugs = Object.keys(PREBAKED_TOPICS);

  const urlElements = topicSlugs.map(slug => {
    const topic = PREBAKED_TOPICS[slug];
    const lastMod = topic?.updatedAt ? topic.updatedAt.split('T')[0] : todayStr;
    return `  <url>
    <loc>${escapeXml(`${BASE_URL}/topic/${slug}`)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
