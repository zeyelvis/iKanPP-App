import { NextRequest, NextResponse } from 'next/server';
import { getSitemapCatalog } from '@/lib/services/entity-kv';
import { generateSlug } from '@/lib/data/entities/entity-utils';

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

  const catalog = await getSitemapCatalog();
  const totalTitles = catalog.length;
  const pageCount = Math.max(1, Math.ceil(totalTitles / TITLES_PER_SITEMAP));

  // 🌟 规范第 11.3 节：越界或不存在的分片严格返回 404，绝不返回空的 200 XML
  if (page > pageCount || totalTitles === 0) {
    return new NextResponse('Sitemap page not found', { status: 404 });
  }

  const start = (page - 1) * TITLES_PER_SITEMAP;
  const end = start + TITLES_PER_SITEMAP;
  const slice = catalog.slice(start, end);

  if (slice.length === 0) {
    return new NextResponse('Sitemap page not found', { status: 404 });
  }

  const urlElements: string[] = [];
  let latestDate = '';

  for (const item of slice) {
    if (!item || !item.id) continue;
    // 权威 SEO 规范 URL：与 canonicalSlug 100% 保持一致，杜绝多余 URL 编码或 301 重定向跳跃
    const baseSlug = (item.slug || item.id).trim();
    const cleanSlug = generateSlug(baseSlug);
    const fullUrl = `${BASE_URL}/title/${item.id}-${cleanSlug}`;
    const lastMod = item.updatedAt || new Date().toISOString().split('T')[0];
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
