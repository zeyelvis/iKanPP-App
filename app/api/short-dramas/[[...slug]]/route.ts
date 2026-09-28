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

interface RouteContext {
  params: Promise<{ slug?: string[] }>;
}

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

function normalizeDramaItem(item: any, source: ShortDramaSource, categoryKey?: string): ShortDramaItem {
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
    category: categoryKey || item.type_name || '短剧',
    totalEpisodes,
    remarks: displayRemarks,
    sourceId: source.id,
    playUrl: playUrl,
    episodes: isEpisodic ? episodes : undefined,
    isEpisodic,
  };
}

async function fetchSourceCategory(
  source: ShortDramaSource,
  catId: number,
  page: number,
  keyword?: string
): Promise<{ total: number; pagecount: number; page: number; list: any[] } | null> {
  const controller = new AbortController();
  const timeoutMs = source.id === 'juliang' ? 6000 : 3500;
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const kwParam = keyword ? `&wd=${encodeURIComponent(keyword)}` : '';
    const cleanBase = source.baseUrl.replace(/\/+$/, '');
    const cleanPath = source.apiPath.replace(/\/+$/, '');
    const url = `${cleanBase}${cleanPath}/?ac=detail&t=${catId}${kwParam}&pg=${page}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
      },
    });
    clearTimeout(timer);

    if (!res.ok) return null;
    const json = await safeParseResponse<any>(res);
    if (!json || !Array.isArray(json.list)) return null;

    return {
      total: Number(json.total) || json.list.length,
      pagecount: Number(json.pagecount) || 1,
      page: Number(json.page) || page,
      list: json.list,
    };
  } catch {
    clearTimeout(timer);
    return null;
  }
}

async function searchSingleSource(
  source: ShortDramaSource,
  query: string,
  limit: number
): Promise<ShortDramaItem[]> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const cleanBase = source.baseUrl.replace(/\/+$/, '');
    const cleanPath = source.apiPath.replace(/\/+$/, '');
    const url = `${cleanBase}${cleanPath}/?ac=detail&wd=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
      },
    });
    clearTimeout(timer);

    if (!res.ok) return [];
    const json = await safeParseResponse<any>(res);
    if (!json || !Array.isArray(json.list)) return [];

    return json.list
      .filter((item: any) => isShortDramaItem(item, source))
      .slice(0, limit)
      .map((item: any) => normalizeDramaItem(item, source));
  } catch {
    clearTimeout(timer);
    return [];
  }
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  const { slug } = await params;
  const action = (slug?.[0] || 'trending').toLowerCase();

  // 1. Trending 热门榜单
  if (action === 'trending') {
    const primarySources = SHORT_DRAMA_SOURCES.filter((s) => s.isEpisodic);

    for (const source of primarySources) {
      const controller = new AbortController();
      const timeoutMs = source.id === 'juliang' ? 6000 : 3500;
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      try {
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
        const json = await safeParseResponse<any>(res);
        if (!json || !Array.isArray(json.list) || json.list.length === 0) continue;

        const filtered = json.list
          .filter((it: any) => !isJuliangExcludedCategory(Number(it.type_id), it.type_name))
          .slice(0, 18)
          .map((it: any) => normalizeDramaItem(it, source));

        if (filtered.length > 0) {
          return NextResponse.json(
            { source: source.id, items: filtered },
            { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=1800, stale-while-revalidate=86400' } }
          );
        }
      } catch {
        clearTimeout(timer);
        continue;
      }
    }

    return NextResponse.json({ source: 'fallback', items: [] });
  }

  // 2. Search 搜索
  if (action === 'search') {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const limit = Math.min(Number(searchParams.get('limit')) || 24, 60);

    if (!query.trim()) {
      return NextResponse.json({ query: '', total: 0, items: [] });
    }

    const cleanQuery = query.replace(/[《》【】\[\]()（）]/g, '').trim();
    const settled = await Promise.allSettled(
      SHORT_DRAMA_SOURCES.map((source) => searchSingleSource(source, cleanQuery, limit))
    );

    const mergedItems: ShortDramaItem[] = [];
    const seenTitles = new Set<string>();

    for (const res of settled) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        for (const item of res.value) {
          const normTitle = item.title.replace(/\s+/g, '').toLowerCase();
          if (!seenTitles.has(normTitle)) {
            seenTitles.add(normTitle);
            mergedItems.push(item);
          }
        }
      }
    }

    return NextResponse.json(
      { query: cleanQuery, total: mergedItems.length, items: mergedItems.slice(0, limit) },
      { headers: { 'Cache-Control': 'public, max-age=180, s-maxage=600, stale-while-revalidate=86400' } }
    );
  }

  // 3. Browse 分类浏览
  if (action === 'browse') {
    const { searchParams } = new URL(req.url);
    const categoryParam = searchParams.get('category') || 'all';
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(Number(searchParams.get('limit')) || 30, 60);

    for (const source of SHORT_DRAMA_SOURCES) {
      try {
        if (categoryParam === 'all') {
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
          let catId: number | undefined;
          let keyword: string | undefined;

          if (typeof source.categories[categoryParam] === 'number') {
            catId = source.categories[categoryParam] as number;
            if (source.categoryKeywords && source.categoryKeywords[categoryParam]) {
              keyword = source.categoryKeywords[categoryParam];
            }
          } else if (source.categoryKeywords && source.categoryKeywords[categoryParam]) {
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
        continue;
      }
    }

    return NextResponse.json(
      { total: 0, pagecount: 0, page, source: 'fallback', list: [], message: '所有短剧源站均不可达或未查询到数据' },
      { status: 200 }
    );
  }

  return NextResponse.json({ error: 'Not found' }, { status: 404 });
}
