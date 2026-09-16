import { NextResponse } from 'next/server';
import {
  SHORT_DRAMA_SOURCES,
  ShortDramaItem,
  parseShortDramaPlayUrl,
  parseEpisodesCount,
} from '@/lib/api/short-drama-sources';
import { isJuliangExcludedCategory } from '@/lib/api/juliang-category-map';
import { safeParseResponse } from '@/lib/utils/safe-json';

export const runtime = 'edge';

const FETCH_TIMEOUT_MS = 3000;

export async function GET() {
  const primarySources = SHORT_DRAMA_SOURCES.filter((s) => s.isEpisodic);

  for (const source of primarySources) {
    const controller = new AbortController();
    const timeoutMs = source.id === 'juliang' ? 6000 : 3500;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      // 聚合短剧最新榜单
      const allCatId = typeof source.categories.all === 'number'
        ? source.categories.all
        : Array.isArray(source.categories.all)
        ? source.categories.all[0]
        : 38;
      const cleanBase = source.baseUrl.replace(/\/+$/, '');
      const cleanPath = source.apiPath.replace(/\/+$/, '');
      const url = `${cleanBase}${cleanPath}/?ac=detail&t=${allCatId}&pg=1`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
        },
      });
      clearTimeout(timer);

      if (!res.ok) continue;
      const data = await safeParseResponse(res);
      if (!data || !Array.isArray(data.list) || data.list.length === 0) continue;

      const candidates: ShortDramaItem[] = [];

      for (const item of data.list) {
        if (isJuliangExcludedCategory(Number(item.type_id), item.type_name)) continue;
        const playUrl = item.vod_play_url || '';
        const episodes = parseShortDramaPlayUrl(playUrl);
        const parsedCount = parseEpisodesCount(item.vod_remarks, episodes.length);
        const totalEpisodes = episodes.length > 0 ? episodes.length : parsedCount;
        const isEpisodic = episodes.length > 1;

        let displayRemarks = item.vod_remarks || '';
        if (isEpisodic) {
          displayRemarks = `全${totalEpisodes}集`;
        } else if (displayRemarks.includes('全集') || displayRemarks.includes('完结')) {
          displayRemarks = '全集长片版';
        }

        candidates.push({
          id: `${source.id}-${item.vod_id}`,
          title: item.vod_name || '短剧',
          poster: item.vod_pic || '',
          category: 'trending',
          categoryName: '全网热播',
          year: item.vod_year || '2026',
          remarks: displayRemarks,
          totalEpisodes,
          sourceId: source.id,
          sourceName: source.name,
          playUrl,
          episodes,
          firstPlayUrl: episodes[0]?.url || '',
          updatedAt: item.vod_time || '',
          isEpisodic,
        });
      }

      // 优先展示分集数较多的
      candidates.sort((a, b) => (b.totalEpisodes || 0) - (a.totalEpisodes || 0));

      return NextResponse.json({
        success: true,
        total: candidates.length,
        source: source.id,
        list: candidates.slice(0, 20),
      });
    } catch {
      clearTimeout(timer);
      continue;
    }
  }

  return NextResponse.json({
    success: false,
    list: [],
  });
}
