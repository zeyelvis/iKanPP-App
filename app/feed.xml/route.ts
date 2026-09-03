import { NextResponse } from 'next/server';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

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
  const now = new Date().toUTCString();

  // 聚合最新热播与推荐影视
  const items = [
    ...PREBAKED_HOME_DATA.movie.s1.map(m => ({
      title: m.title,
      type: '电影',
      desc: `iKanPP 4K 院线推荐《${m.title}》，评分 ${m.rate || '9.0'}，支持海外华人免翻墙极速高清流畅播放。`,
      url: `${BASE_URL}/player?title=${encodeURIComponent(m.title)}&type=movie`,
      pubDate: now,
    })),
    ...PREBAKED_HOME_DATA.tv.s1.map(t => ({
      title: t.title,
      type: '电视剧',
      desc: `iKanPP 全网热播剧集《${t.title}》，评分 ${t.rate || '8.8'}，全集极速看，多线路极速秒播。`,
      url: `${BASE_URL}/player?title=${encodeURIComponent(t.title)}&type=tv`,
      pubDate: now,
    })),
    ...PREBAKED_HOME_DATA.movie.s2.slice(0, 10).map(m => ({
      title: m.title,
      type: '经典神作',
      desc: `豆瓣高分华语经典《${m.title}》，海外华人观影首选。`,
      url: `${BASE_URL}/player?title=${encodeURIComponent(m.title)}&type=movie`,
      pubDate: now,
    })),
  ];

  const rssItemsXml = items.map(item => `    <item>
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
    <description>专为全球海外华人打造的影视聚合平台，每日更新院线大片、热播国产剧、美剧、韩剧、港剧、日漫与国创动画，海外免翻墙超清直连播放。</description>
    <language>zh-CN</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${BASE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${rssItemsXml}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=14400, stale-while-revalidate=86400',
    },
  });
}
