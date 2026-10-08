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
  const urlElements: string[] = [];

  // 人物收录门槛：片库里至少有一部 live 作品（D1 演职关系），没有作品的人物页不上站点地图；
  // lastmod 取其作品里最近一次更新的日期，不写当天日期冒充更新。
  const db = getDb();
  const names = [...new Set([...POPULAR_DIRECTORS, ...POPULAR_ACTORS].map((n) => n.trim()).filter(Boolean))];
  const credited = new Map<string, string>();
  if (db && names.length) {
    const rows = await db
      .prepare(
        `SELECT p.name || '|' || c.role AS k, max(substr(t.updated_at, 1, 10)) AS lastmod FROM people p
         JOIN credits c ON c.person_id = p.id JOIN titles t ON t.id = c.title_id
         WHERE t.state = 'live' AND p.name IN (${names.map(() => '?').join(',')}) GROUP BY 1`,
      )
      .bind(...names)
      .all<{ k: string; lastmod: string | null }>();
    for (const r of rows.results) credited.set(r.k, r.lastmod ?? '');
  }

  for (const [role, list] of [['director', POPULAR_DIRECTORS], ['actor', POPULAR_ACTORS]] as const) {
    for (const name of list) {
      const key = `${name.trim()}|${role}`;
      if (!credited.has(key)) continue;
      const lastmod = credited.get(key);
      const fullUrl = `${BASE_URL}/${role}/${encodeURIComponent(name.trim())}`;
      urlElements.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`);
    }
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
