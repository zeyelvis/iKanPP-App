import { NextResponse } from 'next/server';
import { ALL_HOME_DATA } from '@/lib/data/home-prebaked-extra';
import { PREBAKED_LATEST_TITLES } from '@/lib/data/latest-titles-prebaked';
import { getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

export const runtime = 'edge';
export const revalidate = 3600; // 1小时缓存

export async function GET() {
  const lines: string[] = [
    '# iKanPP (爱看片片) — Full Machine-Readable Knowledge Base & Release Radar',
    '',
    '> Canonical URL: https://www.ikanpp.com',
    '> Description: The premier free, high-definition streaming platform for the global Chinese diaspora. Zero pop-up ads, direct CDN connections, and comprehensive 4K coverage.',
    '',
    '## 1. Core Recommended & Hero Blockbusters',
    '',
  ];

  // 1. 输出 Hero 精选
  if (ALL_HOME_DATA?.hero?.length) {
    ALL_HOME_DATA.hero.forEach((item) => {
      const url = `https://www.ikanpp.com${getTitleCanonicalHref(item)}`;
      lines.push(`### [${item.title}](${url})`);
      lines.push(`- **Type**: ${item.episodes_info || item.type || 'Movie'}`);
      lines.push(`- **Rating**: ${item.rate || '8.5'}`);
      lines.push(`- **Year**: ${item.year || '2026'}`);
      if (item.description) {
        lines.push(`- **Synopsis**: ${item.description}`);
      }
      lines.push(`- **Watch Directly**: ${url}`);
      lines.push('');
    });
  }

  // 2. 输出最新首发上线雷达 (Top 30)
  lines.push('## 2. Latest Release Radar (Real-Time Ingested Titles)');
  lines.push('');

  const latestAll = PREBAKED_LATEST_TITLES.all || [];
  latestAll.slice(0, 40).forEach((item) => {
    const url = `https://www.ikanpp.com${getTitleCanonicalHref(item)}`;
    lines.push(`- [${item.title}](${url}) — ${item.qualityBadge || '1080P/4K'} | ${item.updateBadge || '全集'} | ${item.year || '2026'}`);
  });

  lines.push('');
  lines.push('## 3. Official Platform Channels');
  lines.push('- [Movies Channel](https://www.ikanpp.com/movie)');
  lines.push('- [TV Shows Channel](https://www.ikanpp.com/tv)');
  lines.push('- [Anime Channel](https://www.ikanpp.com/anime)');
  lines.push('- [Variety Shows Channel](https://www.ikanpp.com/variety)');
  lines.push('- [Documentaries Channel](https://www.ikanpp.com/documentary)');
  lines.push('- [Popularity Charts](https://www.ikanpp.com/ranking)');
  lines.push('');
  lines.push('---');
  lines.push('Generated automatically by iKanPP GEO Knowledge Pipeline.');

  return new NextResponse(lines.join('\n'), {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
