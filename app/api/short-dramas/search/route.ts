import { NextRequest, NextResponse } from 'next/server';
import {
  SHORT_DRAMA_SOURCES,
  ShortDramaSource,
  ShortDramaItem,
  parseShortDramaPlayUrl,
  parseEpisodesCount,
} from '@/lib/api/short-drama-sources';

export const runtime = 'edge';

const FETCH_TIMEOUT_MS = 3000;

function isShortDramaItem(item: any, source: ShortDramaSource): boolean {
  const typeId = Number(item.type_id);
  const allCatIds = Object.values(source.categories).flatMap((val) =>
    Array.isArray(val) ? val : [val]
  );
  if (allCatIds.includes(typeId)) return true;

  const typeName = String(item.type_name || '');
  const dramaKeywords = ['短剧', '爽剧', '都市', '总裁', '重生', '仙侠', '穿越', '反转', '漫剧'];
  return dramaKeywords.some((kw) => typeName.includes(kw));
}

function normalizeDramaItem(item: any, source: ShortDramaSource): ShortDramaItem {
  const playUrl = item.vod_play_url || '';
  const episodes = parseShortDramaPlayUrl(playUrl);
  const totalEpisodes = parseEpisodesCount(item.vod_remarks, episodes.length);

  return {
    id: `${source.id}-${item.vod_id}`,
    title: item.vod_name || '未知短剧',
    poster: item.vod_pic || '',
    category: 'search',
    categoryName: item.type_name || '短剧',
    year: item.vod_year || '',
    area: item.vod_area || '',
    remarks: item.vod_remarks || (totalEpisodes > 0 ? `共${totalEpisodes}集` : ''),
    totalEpisodes,
    director: item.vod_director || '',
    actor: item.vod_actor || '',
    desc: item.vod_content || '',
    sourceId: source.id,
    sourceName: source.name,
    playUrl,
    episodes,
    firstPlayUrl: episodes[0]?.url || '',
    updatedAt: item.vod_time || '',
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const query = (
    searchParams.get('q') ||
    searchParams.get('wd') ||
    searchParams.get('keyword') ||
    ''
  ).trim();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  if (!query) {
    return NextResponse.json({
      total: 0,
      pagecount: 0,
      page,
      list: [],
    });
  }

  const candidateSources = [...SHORT_DRAMA_SOURCES].sort((a, b) => a.priority - b.priority);

  for (const source of candidateSources) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    try {
      const url = `${source.baseUrl}${source.apiPath}?ac=detail&wd=${encodeURIComponent(query)}&pg=${page}`;
      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });
      clearTimeout(timer);

      if (!res.ok) continue;
      const data = await res.json();
      if (!data || !Array.isArray(data.list)) continue;

      // 过滤短剧相关项目
      const filteredList = data.list.filter((it: any) => isShortDramaItem(it, source));
      const normalizedList = (filteredList.length > 0 ? filteredList : data.list).map((it: any) =>
        normalizeDramaItem(it, source)
      );

      return NextResponse.json({
        total: filteredList.length > 0 ? filteredList.length : Number(data.total) || 0,
        pagecount: Number(data.pagecount) || 1,
        page,
        source: source.id,
        list: normalizedList,
      });
    } catch {
      clearTimeout(timer);
      continue;
    }
  }

  return NextResponse.json({
    total: 0,
    pagecount: 0,
    page,
    source: 'fallback',
    list: [],
  });
}
