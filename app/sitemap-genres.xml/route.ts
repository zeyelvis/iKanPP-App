import { NextResponse } from 'next/server';
import { GENRE_MAP } from '@/lib/data/genres';
import { getDb } from '@/lib/data/d1/db';


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
  const genres = Object.values(GENRE_MAP);

  // 题材收录门槛：至少有一部 live 作品；lastmod 取该题材下最近更新的作品日期（D1 title_genres）。
  const db = getDb();
  const names = genres.map((g) => g.name);
  const latest = new Map<string, string>();
  if (db && names.length) {
    const rows = await db
      .prepare(
        `SELECT g.genre, max(substr(t.updated_at, 1, 10)) AS lastmod FROM title_genres g JOIN titles t ON t.id = g.title_id
         WHERE t.state = 'live' AND g.genre IN (${names.map(() => '?').join(',')}) GROUP BY g.genre`,
      )
      .bind(...names)
      .all<{ genre: string; lastmod: string }>();
    for (const r of rows.results) latest.set(r.genre, r.lastmod);
  }
  const genreResults = genres.map((genre) => (latest.has(genre.name) ? { slug: genre.slug, lastmod: latest.get(genre.name) || FALLBACK_LASTMOD } : null));

  const validGenres = genreResults.filter((g): g is { slug: string; lastmod: string } => Boolean(g));
  const urlElements: string[] = [];

  for (const item of validGenres) {
    const fullUrl = `${BASE_URL}/genre/${item.slug}`;
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

