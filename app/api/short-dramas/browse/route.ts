import { NextRequest, NextResponse } from 'next/server';
import {
  SHORT_DRAMA_SOURCES,
  ShortDramaSource,
  ShortDramaItem,
  parseShortDramaPlayUrl,
  parseEpisodesCount,
} from '@/lib/api/short-drama-sources';
import { isJuliangExcludedCategory } from '@/lib/api/juliang-category-map';
import { safeParseResponse } from '@/lib/utils/safe-json';

export const runtime = 'edge';

const FETCH_TIMEOUT_MS = 3000;

/**
 * 安全从源站拉取短剧列表（支持可选关键词精准检索）
 */
async function fetchSourceCategory(
  source: ShortDramaSource,
  catId: number,
  page: number,
  keyword?: string
): Promise<{ total: number; pagecount: number; page: number; list: any[] } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const kwParam = keyword ? `&wd=${encodeURIComponent(keyword)}` : '';
    const url = `${source.baseUrl}${source.apiPath}?ac=detail&t=${catId}${kwParam}&pg=${page}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data = await safeParseResponse(res);
    if (!data || !Array.isArray(data.list)) return null;

    return {
      total: Number(data.total) || 0,
      pagecount: Number(data.pagecount) || 1,
      page: Number(data.page) || page,
      list: data.list,
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * 格式化短剧条目，优先真实分集规范化
 */
function normalizeDramaItem(item: any, source: ShortDramaSource, catKey: string): ShortDramaItem {
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
    category: catKey,
    categoryName: item.type_name || '',
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
  const categoryParam = (searchParams.get('category') || 'all').toLowerCase();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(36, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));
  const requestedSourceId = searchParams.get('source');

  // 优先排序分集源（modu P1 > modu_mirror P2 > guangsu P3 > jisu P4）
  const candidateSources = requestedSourceId
    ? SHORT_DRAMA_SOURCES.filter((s) => s.id === requestedSourceId)
    : [...SHORT_DRAMA_SOURCES].sort((a, b) => a.priority - b.priority);

  for (const source of candidateSources) {
    try {
      if (categoryParam === 'all' || categoryParam === '') {
        // 全部短剧
        const allCatId = typeof source.categories.all === 'number'
          ? source.categories.all
          : Array.isArray(source.categories.all)
          ? source.categories.all[0]
          : 38;

        const result = await fetchSourceCategory(source, allCatId, page);
        if (result && result.list.length > 0) {
          const items = result.list
            .filter((it) => !isJuliangExcludedCategory(Number(it.type_id), it.type_name))
            .slice(0, limit)
            .map((it) => normalizeDramaItem(it, source, 'all'));

          return NextResponse.json({
            total: result.total || 62000,
            pagecount: result.pagecount,
            page,
            source: source.id,
            list: items,
          });
        }
      } else {
        // 具体分类
        let catId: number | undefined;
        let keyword: string | undefined;

        if (typeof source.categories[categoryParam] === 'number') {
          catId = source.categories[categoryParam] as number;
          if (source.categoryKeywords && source.categoryKeywords[categoryParam]) {
            keyword = source.categoryKeywords[categoryParam];
          }
        } else if (source.categoryKeywords && source.categoryKeywords[categoryParam]) {
          // 仅有分类关键词的源（如魔都）
          catId = typeof source.categories.all === 'number'
            ? source.categories.all
            : (Array.isArray(source.categories.all) ? source.categories.all[0] : 38);
          keyword = source.categoryKeywords[categoryParam];
        } else if (categoryParam === 'ai' && typeof source.categories.ai === 'number') {
          catId = source.categories.ai;
        }

        if (typeof catId === 'number') {
          const result = await fetchSourceCategory(source, catId, page, keyword);
          if (result && result.list.length > 0) {
            const items = result.list
              .filter((it) => !isJuliangExcludedCategory(Number(it.type_id), it.type_name))
              .slice(0, limit)
              .map((it) => normalizeDramaItem(it, source, categoryParam));
            return NextResponse.json(
              {
                total: result.total,
                pagecount: result.pagecount,
                page,
                source: source.id,
                list: items,
              },
              {
                headers: {
                  'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400',
                },
              }
            );
          }
        }
      }
    } catch {
      // 容灾继续下一源
      continue;
    }
  }

  return NextResponse.json(
    {
      total: 0,
      pagecount: 0,
      page,
      source: 'fallback',
      list: [],
      message: '所有短剧源站均不可达或未查询到数据',
    },
    { status: 200 }
  );
}
