import { NextRequest, NextResponse } from 'next/server';
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

export async function GET(
  request: NextRequest,
  { params }: { params: { page: string } }
) {
  const pageParam = (params?.page || '1').replace(/\.xml$/i, '');
  const page = Math.max(1, parseInt(pageParam, 10) || 1);

  const catalog = await getSitemapCatalog();
  const start = (page - 1) * TITLES_PER_SITEMAP;
  const end = start + TITLES_PER_SITEMAP;
  const slice = catalog.slice(start, end);

  const urlElements: string[] = [];

  for (const item of slice) {
    if (!item || !item.id) continue;
    const fullUrl = `${BASE_URL}/title/${item.id}-${encodeURIComponent(item.slug || item.id)}`;
    const lastMod = item.updatedAt || new Date().toISOString().split('T')[0];

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
