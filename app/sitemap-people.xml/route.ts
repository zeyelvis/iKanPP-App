import { NextResponse } from 'next/server';
import { getDb } from '@/lib/data/d1/db';
import { POPULAR_ACTORS, POPULAR_DIRECTORS } from '@/lib/data/popular-people';


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
  const lastModDate = new Date().toISOString().split('T')[0];
  const urlElements: string[] = [];

  // 人物收录门槛：片库里至少有一部 live 作品（D1 演职关系），没有作品的人物页不上站点地图。
  const db = getDb();
  const names = [...new Set([...POPULAR_DIRECTORS, ...POPULAR_ACTORS].map((n) => n.trim()).filter(Boolean))];
  const credited = new Set<string>();
  if (db && names.length) {
    const rows = await db
      .prepare(
        `SELECT DISTINCT p.name || '|' || c.role AS k FROM people p JOIN credits c ON c.person_id = p.id JOIN titles t ON t.id = c.title_id
         WHERE t.state = 'live' AND p.name IN (${names.map(() => '?').join(',')})`,
      )
      .bind(...names)
      .all<{ k: string }>();
    for (const r of rows.results) credited.add(r.k);
  }
  const validDirectors = POPULAR_DIRECTORS.filter((d) => credited.has(`${d.trim()}|director`));
  const validActors = POPULAR_ACTORS.filter((a) => credited.has(`${a.trim()}|actor`));

  // 导演专栏
  for (const director of validDirectors) {
    const fullUrl = `${BASE_URL}/director/${encodeURIComponent(director)}`;
    urlElements.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${lastModDate}</lastmod>
  </url>`);
  }

  // 演员专栏
  for (const actor of validActors) {
    const fullUrl = `${BASE_URL}/actor/${encodeURIComponent(actor)}`;
    urlElements.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${lastModDate}</lastmod>
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
