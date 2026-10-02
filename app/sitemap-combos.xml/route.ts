import { NextResponse } from 'next/server';
import { GENRE_MAP } from '@/lib/data/genres';
import { YEAR_MAP } from '@/lib/data/years';
import { getEntitiesByGenreAndYear } from '@/lib/services/entity-kv';

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
  const topGenres = ['action', 'comedy', 'drama', 'scifi', 'romance', 'thriller', 'animation', 'crime', 'fantasy', 'adventure'];
  const topYears = ['2026', '2025', '2024', '2023', '2022', '2021', '2020'];

  const combos: { genreSlug: string; yearSlug: string }[] = [];
  for (const g of topGenres) {
    for (const y of topYears) {
      combos.push({ genreSlug: g, yearSlug: y });
    }
  }

  // 收录门禁校验
  const results = await Promise.all(
    combos.map(async (combo) => {
      const genre = GENRE_MAP[combo.genreSlug];
      const yearInfo = YEAR_MAP[combo.yearSlug];
      if (!genre || !yearInfo) return null;

      const works = await getEntitiesByGenreAndYear(genre.name, yearInfo.slug, 1);
      if (works.length === 0) return null;

      const materialDate = works[0]?.updatedAt?.split('T')[0] || works[0]?.createdAt?.split('T')[0] || FALLBACK_LASTMOD;
      return {
        url: `${BASE_URL}/genre/${combo.genreSlug}/year/${combo.yearSlug}`,
        lastmod: materialDate,
      };
    })
  );

  const validCombos = results.filter((r): r is { url: string; lastmod: string } => Boolean(r));
  const urlElements = validCombos.map(item => `  <url>
    <loc>${escapeXml(item.url)}</loc>
    <lastmod>${item.lastmod}</lastmod>
  </url>`);

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
