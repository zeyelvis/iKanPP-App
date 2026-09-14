import { NextResponse } from 'next/server';
import { listRecentEntities } from '@/lib/services/entity-kv';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';

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
  const now = new Date();
  const currentBuildDate = now.toUTCString();

  // 1. 优先拉取全自动飞轮增量入库的最新实体（最新 30 部）
  const recentEntities = await listRecentEntities(30);

  const dynamicItems = recentEntities.map((item) => {
    const itemDate = item.createdAt ? new Date(item.createdAt) : now;
    const typeLabel = item.type === 'movie' ? '院线电影' : '热播剧集';
    const slug = item.slug || generateSlug(item.title);
    const detailUrl = `${BASE_URL}/title/${item.entityId}-${slug}`;
    const desc = `iKanPP 今日增量收录《${item.title}》(${item.year || '2026'})，评分 ${item.rate || '8.8'}，类型：${(item.genres || []).join('/') || typeLabel}。支持海外华人免翻墙 4K/1080P 超清秒播。`;

    return {
      title: item.title,
      type: typeLabel,
      desc,
      url: detailUrl,
      pubDate: itemDate.toUTCString(),
    };
  });

  // 2. 结合经典高分代表作（作为 SEO 长尾底座，日期赋予自然时间梯度）
  const classicItems = [
    ...PREBAKED_HOME_DATA.movie.s1.slice(0, 6).map((m, idx) => ({
      title: m.title,
      type: '院线精选',
      desc: `iKanPP 4K 院线精选《${m.title}》，评分 ${m.rate || '9.0'}，海外免翻墙超清极速流畅播放。`,
      url: `${BASE_URL}/title/${generateSlug(m.title)}`,
      pubDate: new Date(now.getTime() - (idx + 1) * 86400000).toUTCString(),
    })),
    ...PREBAKED_HOME_DATA.tv.s1.slice(0, 6).map((t, idx) => ({
      title: t.title,
      type: '热播连续剧',
      desc: `iKanPP 全网热播剧集《${t.title}》，评分 ${t.rate || '8.8'}，全集极速免 VIP 连播。`,
      url: `${BASE_URL}/title/${generateSlug(t.title)}`,
      pubDate: new Date(now.getTime() - (idx + 1) * 86400000).toUTCString(),
    })),
  ];

  // 合并并按 URL 排重
  const seenUrls = new Set<string>();
  const combinedItems = [];

  for (const it of [...dynamicItems, ...classicItems]) {
    if (seenUrls.has(it.url)) continue;
    seenUrls.add(it.url);
    combinedItems.push(it);
  }

  const latestItemDate = dynamicItems[0]?.pubDate || currentBuildDate;

  const rssItemsXml = combinedItems.map(item => `    <item>
      <title><![CDATA[【${item.type}】${item.title} - iKanPP 爱看片片]]></title>
      <link>${escapeXml(item.url)}</link>
      <guid isPermaLink="true">${escapeXml(item.url)}</guid>
      <description><![CDATA[${item.desc}]]></description>
      <pubDate>${item.pubDate}</pubDate>
      <category>${item.type}</category>
    </item>`).join('\n');

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>iKanPP 爱看片片 - 全球海外华人影视聚合与极速播放平台</title>
    <link>${BASE_URL}</link>
    <description>专为全球海外华人打造的影视聚合平台，每日持续自动增量收录院线大片、热播国产剧、美剧、韩剧、港剧、日漫与国创动画，海外免翻墙超清直连播放。</description>
    <language>zh-CN</language>
    <lastBuildDate>${latestItemDate}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${rssItemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}

