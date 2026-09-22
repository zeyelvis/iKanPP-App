import { NextResponse } from 'next/server';

export const dynamic = 'force-static';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

// 核心高权重频道大厅与公开可索引核心页面（Core-Only，绝不混入影视实体，避免与分卷 Sitemap 重复）
const STATIC_ROUTES = [
  '',
  '/movie',
  '/tv',
  '/anime',
  '/variety',
  '/documentary',
  '/short',
  '/ranking',
  '/iptv',
  '/download',
  '/about',
  '/faq',
  '/referral',
  '/privacy',
  '/terms',
];

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

  // 纯净 Core 频道与核心页面
  for (const path of STATIC_ROUTES) {
    const fullUrl = `${BASE_URL}${path}`;
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
