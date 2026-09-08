import { NextResponse } from 'next/server';
import { getAllEntityIds, getEntityById } from '@/lib/services/entity-kv';

export const runtime = 'edge';

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
  const allIds = await getAllEntityIds();
  // 针对每个子 sitemap 截取前 10,000 个（Sitemap 官方规范上限）
  const sliceIds = allIds.slice(0, 10000);

  const entities = await Promise.all(sliceIds.map(id => getEntityById(id)));
  const urlElements: string[] = [];

  for (const e of entities) {
    if (!e || !e.entityId) continue;
    const fullUrl = `${BASE_URL}/title/${e.entityId}-${e.slug}`;
    const lastMod = (e.updatedAt || e.createdAt || new Date().toISOString()).split('T')[0];

    urlElements.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.85</priority>
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
