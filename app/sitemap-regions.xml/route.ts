import { NextResponse } from 'next/server';
import { REGION_MAP } from '@/lib/data/regions';
import { getEntitiesByRegion } from '@/lib/services/entity-kv';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';
const FALLBACK_LASTMOD = '2026-09-01';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const regions = Object.values(REGION_MAP);

  // 依循规范 21.4 节：检查地区收录门禁（作品数 >= 1），并计算真实 material lastmod
  const regionResults = await Promise.all(
    regions.map(async (regionInfo) => {
      const works = await getEntitiesByRegion(regionInfo.name, 1);
      if (works.length === 0) return null;

      const materialDate = works[0]?.updatedAt?.split('T')[0] || works[0]?.createdAt?.split('T')[0] || FALLBACK_LASTMOD;
      return {
        slug: regionInfo.slug,
        lastmod: materialDate,
      };
    })
  );

  const validRegions = regionResults.filter((r): r is { slug: string; lastmod: string } => Boolean(r));
  const urlElements: string[] = [];

  for (const item of validRegions) {
    const fullUrl = `${BASE_URL}/region/${item.slug}`;
    urlElements.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${item.lastmod}</lastmod>
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
