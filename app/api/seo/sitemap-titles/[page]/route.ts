import { NextRequest, NextResponse } from 'next/server';
import { getDb } from '@/lib/data/d1/db';
import { sitemapTitlePage } from '@/lib/data/d1/sitemaps';


const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function computeETag(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
  return `"${hashHex}"`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ page: string }> }
) {
  const { page: rawPage } = await context.params;
  const pageParam = (rawPage || '1').replace(/\.xml$/i, '');
  const page = parseInt(pageParam, 10);

  if (isNaN(page) || page < 1) {
    return new NextResponse('Invalid sitemap page', { status: 404 });
  }

  const db = getDb();
  const slice = db ? await sitemapTitlePage(db, page) : [];
  // 越界或不存在的分卷返回 404，不返回空的 200 XML
  if (slice.length === 0) {
    return new NextResponse('Sitemap page not found', { status: 404 });
  }

  const urlElements: string[] = [];
  let latestDate = '';

  for (const item of slice) {
    // 规范网址：与作品页的 rel=canonical 完全一致
    const fullUrl = `${BASE_URL}/title/${encodeURIComponent(item.slug)}`;
    const lastMod = item.lastmod;
    if (lastMod > latestDate) {
      latestDate = lastMod;
    }

    // 移除 Google 忽略的 priority 与 changefreq 标签
    urlElements.push(`  <url>
    <loc>${escapeXml(fullUrl)}</loc>
    <lastmod>${lastMod}</lastmod>
  </url>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements.join('\n')}
</urlset>`;

  // 边缘缓存与 ETag 校验：若内容未变动，直接返回 304 Not Modified，极大保护搜索引擎抓取预算
  const etag = await computeETag(xml);
  const clientIfNoneMatch = request.headers.get('if-none-match');

  const headers: Record<string, string> = {
    'Content-Type': 'application/xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400',
    ETag: etag,
  };

  if (latestDate) {
    headers['Last-Modified'] = new Date(latestDate).toUTCString();
  }

  if (clientIfNoneMatch === etag) {
    return new NextResponse(null, {
      status: 304,
      headers,
    });
  }

  return new NextResponse(xml, {
    status: 200,
    headers,
  });
}
