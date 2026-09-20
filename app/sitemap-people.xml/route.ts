import { NextResponse } from 'next/server';
import { getKnownPeople, getEntitiesByDirector, getEntitiesByActor } from '@/lib/services/entity-kv';

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
  const lastModDate = new Date().toISOString().split('T')[0];
  const { directors, actors } = await getKnownPeople();
  const urlElements: string[] = [];

  // 🌟 规范第 7.2 节与第 21.4 节：人物收录门槛（在库影视作品数 >= 1，0 空人物页坚决不上地图）
  const validDirectors = (
    await Promise.all(
      directors.map(async (d) => {
        if (!d) return null;
        const works = await getEntitiesByDirector(d, 1);
        return works.length > 0 ? d : null;
      })
    )
  ).filter((d): d is string => Boolean(d));

  const validActors = (
    await Promise.all(
      actors.map(async (a) => {
        if (!a) return null;
        const works = await getEntitiesByActor(a, 1);
        return works.length > 0 ? a : null;
      })
    )
  ).filter((a): a is string => Boolean(a));

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
