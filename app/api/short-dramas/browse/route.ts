import { NextRequest, NextResponse } from 'next/server';
import {
  SHORT_DRAMA_SOURCES,
  ShortDramaSource,
  ShortDramaItem,
  parseShortDramaPlayUrl,
  parseEpisodesCount,
} from '@/lib/api/short-drama-sources';

export const runtime = 'edge';

const FETCH_TIMEOUT_MS = 2500;

/**
 * 安全从源站拉取短剧列表
 */
async function fetchSourceCategory(
  source: ShortDramaSource,
  catId: number,
  page: number
): Promise<{ total: number; pagecount: number; page: number; list: any[] } | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const url = `${source.baseUrl}${source.apiPath}?ac=detail&t=${catId}&pg=${page}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const data = await res.json();
    if (!data || !Array.isArray(data.list)) return null;

    return {
      total: Number(data.total) || 0,
      pagecount: Number(data.pagecount) || 1,
      page: Number(data.page) || page,
      list: data.list,
    };
  } catch (err) {
    clearTimeout(timer);
    return null;
  }
}

/**
 * 格式化短剧条目
 */
function normalizeDramaItem(item: any, source: ShortDramaSource, catKey: string): ShortDramaItem {
  const playUrl = item.vod_play_url || '';
  const episodes = parseShortDramaPlayUrl(playUrl);
  const totalEpisodes = parseEpisodesCount(item.vod_remarks, episodes.length);

  return {
    id: `${source.id}-${item.vod_id}`,
    title: item.vod_name || '未知短剧',
    poster: item.vod_pic || '',
    category: catKey,
    categoryName: item.type_name || '',
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
  const categoryParam = (searchParams.get('category') || 'all').toLowerCase();
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(36, Math.max(1, parseInt(searchParams.get('limit') || '24', 10)));
  const requestedSourceId = searchParams.get('source');

  // 排序源站
  const candidateSources = requestedSourceId
    ? SHORT_DRAMA_SOURCES.filter((s) => s.id === requestedSourceId)
    : [...SHORT_DRAMA_SOURCES].sort((a, b) => a.priority - b.priority);

  // 遍历源站容灾
  for (const source of candidateSources) {
    try {
      if (categoryParam === 'all' || categoryParam === '') {
        // 全部短剧：如果为第 1 页，混排四大核心热门子分类（爽剧、都市、言情、古装）
        if (page === 1) {
          const mixCatKeys = ['shuangju', 'dushi', 'yanqing', 'guzhuang'];
          const catIds = mixCatKeys
            .map((key) => {
              const id = source.categories[key];
              return typeof id === 'number' ? { key, id } : null;
            })
            .filter(Boolean) as { key: string; id: number }[];

          const perCatLimit = Math.ceil(limit / catIds.length);
          const settledResults = await Promise.allSettled(
            catIds.map((c) => fetchSourceCategory(source, c.id, 1))
          );

          const mixedList: ShortDramaItem[] = [];
          let totalCount = 0;
          let maxPageCount = 1;

          settledResults.forEach((res, idx) => {
            if (res.status === 'fulfilled' && res.value?.list) {
              totalCount += res.value.total;
              maxPageCount = Math.max(maxPageCount, res.value.pagecount);
              const items = res.value.list
                .slice(0, perCatLimit)
                .map((it) => normalizeDramaItem(it, source, catIds[idx].key));
              mixedList.push(...items);
            }
          });

          if (mixedList.length > 0) {
            // 交叉混排
            return NextResponse.json({
              total: totalCount || 36000,
              pagecount: maxPageCount || 100,
              page: 1,
              source: source.id,
              list: mixedList.slice(0, limit),
            });
          }
        } else {
          // 非第 1 页，从主要分类（都市或爽剧）按页拉取
          const defaultCatId =
            typeof source.categories['dushi'] === 'number'
              ? source.categories['dushi']
              : typeof source.categories['shuangju'] === 'number'
              ? source.categories['shuangju']
              : Array.isArray(source.categories['all'])
              ? source.categories['all'][0]
              : null;

          if (defaultCatId) {
            const result = await fetchSourceCategory(source, defaultCatId as number, page);
            if (result && result.list.length > 0) {
              const items = result.list
                .slice(0, limit)
                .map((it) => normalizeDramaItem(it, source, 'all'));
              return NextResponse.json({
                total: result.total || 36000,
                pagecount: result.pagecount,
                page,
                source: source.id,
                list: items,
              });
            }
          }
        }
      } else {
        // 具体分类
        const catId = source.categories[categoryParam];
        if (typeof catId === 'number') {
          const result = await fetchSourceCategory(source, catId, page);
          if (result && result.list.length > 0) {
            const items = result.list
              .slice(0, limit)
              .map((it) => normalizeDramaItem(it, source, categoryParam));
            return NextResponse.json({
              total: result.total,
              pagecount: result.pagecount,
              page,
              source: source.id,
              list: items,
            });
          }
        }
      }
    } catch {
      // 当前源失败，静默降级到下一候选源
      continue;
    }
  }

  // 若全部源失败，返回降级空数据
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
