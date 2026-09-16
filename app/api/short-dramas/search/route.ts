import { NextRequest, NextResponse } from 'next/server';
import {
  SHORT_DRAMA_SOURCES,
  ShortDramaSource,
  ShortDramaItem,
  parseShortDramaPlayUrl,
  parseEpisodesCount,
} from '@/lib/api/short-drama-sources';
import {
  isJuliangExcludedCategory,
  isJuliangShortDramaCategory,
} from '@/lib/api/juliang-category-map';
import { safeParseResponse } from '@/lib/utils/safe-json';

export const runtime = 'edge';

const FETCH_TIMEOUT_MS = 3000;

function isShortDramaItem(item: any, source: ShortDramaSource): boolean {
  const typeId = Number(item.type_id);
  const typeName = String(item.type_name || '');

  // 铁律：排除成人边缘内容 (伦理片、写真等)
  if (isJuliangExcludedCategory(typeId, typeName)) return false;

  // 巨量源短剧识别 (顶级大类 5, 501~506, 599, 7, 701, 299)
  if (source.id === 'juliang' && isJuliangShortDramaCategory(typeId)) return true;

  // 魔都源 38 是短剧，42 是 AI 漫剧
  if (source.id.startsWith('modu') && (typeId === 38 || typeId === 42)) return true;

  const allCatIds = Object.values(source.categories).flatMap((val) =>
    Array.isArray(val) ? val : [val]
  );
  if (allCatIds.includes(typeId)) return true;

  const dramaKeywords = ['短剧', '爽剧', '都市', '总裁', '重生', '仙侠', '穿越', '反转', '漫剧'];
  return dramaKeywords.some((kw) => typeName.includes(kw));
}

function normalizeDramaItem(item: any, source: ShortDramaSource): ShortDramaItem {
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
  } else if (totalEpisodes > 0) {
    displayRemarks = `共${totalEpisodes}集`;
  }

  return {
    id: `${source.id}-${item.vod_id}`,
    title: item.vod_name || '未知短剧',
    poster: item.vod_pic || '',
    category: 'search',
    categoryName: item.type_name || '短剧',
    year: item.vod_year || '',
    area: item.vod_area || '',
    remarks: displayRemarks,
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
    isEpisodic,
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
    const timeoutMs = source.id === 'juliang' ? 6000 : 3500;
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const cleanBase = source.baseUrl.replace(/\/+$/, '');
      const cleanPath = source.apiPath.replace(/\/+$/, '');
      let url = `${cleanBase}${cleanPath}/?ac=detail&wd=${encodeURIComponent(query)}&pg=${page}`;
      let res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
          Accept: 'application/json, text/plain, */*',
        },
      });

      let data: any = null;
      if (res.ok) {
        data = await safeParseResponse(res);
      }

      // 若整句未查到且 query 包含标点/副标题，尝试取主标题词二次检索
      const subTitle = query.split(/[,，、:：\s\-—_]/)[0]?.trim();
      if ((!data || !Array.isArray(data.list) || data.list.length === 0) && subTitle && subTitle.length >= 2 && subTitle !== query) {
        url = `${cleanBase}${cleanPath}/?ac=detail&wd=${encodeURIComponent(subTitle)}&pg=${page}`;
        res = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            Accept: 'application/json, text/plain, */*',
          },
        });
        if (res.ok) {
          data = await safeParseResponse(res);
        }
      }

      clearTimeout(timer);

      if (!data || !Array.isArray(data.list) || data.list.length === 0) continue;

      // 过滤短剧相关项目
      const filteredList = data.list.filter((it: any) => isShortDramaItem(it, source));
      const targetItems = filteredList.length > 0 ? filteredList : data.list;

      const normalizedList = targetItems.map((it: any) => normalizeDramaItem(it, source));

      // 智能排序：优先展示真实分集数最多的短剧
      normalizedList.sort((a: ShortDramaItem, b: ShortDramaItem) => (b.totalEpisodes || 0) - (a.totalEpisodes || 0));

      return NextResponse.json({
        total: targetItems.length,
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
