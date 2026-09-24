'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/layout/Navbar';
import { ContentRail, RailMovie } from '@/components/home/ContentRail';
import { MovieGrid } from '@/components/home/MovieGrid';
import { Icons } from '@/components/ui/Icon';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { getPrebakedCategoryShelves, PREBAKED_CATEGORY_ITEMS } from '@/lib/data/category-prebaked';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';
import { HeroSlideshow } from '@/components/home/TmdbSlideshow';
import type { PrebakedSubject, TrendingNavItem } from '@/lib/data/home-prebaked';
import { UniversalFilterMatrix, FilterParams } from '@/components/category/UniversalFilterMatrix';

// 🚀 八层极速秒开架构：次级侧边栏组件按需加载
const FavoritesSidebar = dynamic(
  () => import('@/components/favorites/FavoritesSidebar').then((m) => m.FavoritesSidebar),
  { ssr: false }
);
const WatchHistorySidebar = dynamic(
  () => import('@/components/history/WatchHistorySidebar').then((m) => m.WatchHistorySidebar),
  { ssr: false }
);
const LatestTitlesRail = dynamic(
  () => import('@/components/home/LatestTitlesRail'),
  { ssr: false }
);

const NAV_TO_BROWSE_TYPE: Record<string, string> = {
  movie: 'movie',
  tv: 'tv',
  anime: 'anime',
  variety: 'variety',
  documentary: 'documentary',
};

export interface FilterOption {
  label: string;
  value: string;
}

export interface ShelfConfig {
  id?: string;
  title: string;
  icon: string;
  badge?: string;
  tag: string;
  doubanType?: 'movie' | 'tv';
  prebakedOnly?: boolean;
}

export function getShelfKey(shelf: ShelfConfig): string {
  return shelf.id || shelf.title || shelf.tag;
}

export interface CategoryHubProps {
  categoryTitle: string;
  categorySubtitle: string;
  doubanType: 'movie' | 'tv';
  activeNav: string;
  genres?: FilterOption[];
  regions?: FilterOption[];
  years?: FilterOption[];
  shelves: ShelfConfig[];
  defaultTag?: string;
  usePrebakedOnly?: boolean;
  shortDramaMode?: boolean;
  topCustomRails?: React.ReactNode;
  heroItems?: PrebakedSubject[];
  trendingNav?: TrendingNavItem[];
}

export function CategoryHub({
  categoryTitle,
  categorySubtitle,
  doubanType,
  activeNav,
  genres = [],
  regions = [],
  years = [],
  shelves,
  defaultTag = '热门',
  usePrebakedOnly = false,
  shortDramaMode = false,
  topCustomRails,
  heroItems,
  trendingNav,
}: CategoryHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 统一多维检索矩阵状态（覆盖板块/类型/地区/语言/年份/画质/状态/排序）
  const [filters, setFilters] = useState<FilterParams>({
    channel: activeNav || 'movie',
    genre: searchParams.get('genre') || '',
    region: searchParams.get('region') || '',
    lang: searchParams.get('lang') || '',
    year: searchParams.get('year') || '',
    quality: searchParams.get('quality') || '',
    status: searchParams.get('status') || '',
    sort: 'time_added',
  });
  const [totalCount, setTotalCount] = useState<number>(0);

// ── SWR 频道大厅本地瞬间缓存（升级至 v8，彻底清除旧版假封面与错误缓存） ────────
const CATHUB_CACHE_KEY = 'kvideo-cathub-v8-';

function getLocalCatHub(key: string): Record<string, RailMovie[]> | null {
  if (typeof window === 'undefined') return null;
  try {
    // 自动自愈清理历史旧版本缓存
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i);
      if (k && k.startsWith('kvideo-cathub-') && !k.startsWith(CATHUB_CACHE_KEY)) {
        localStorage.removeItem(k);
      }
    }
    const raw = localStorage.getItem(CATHUB_CACHE_KEY + key);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function setLocalCatHub(key: string, data: Record<string, RailMovie[]>) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CATHUB_CACHE_KEY + key, JSON.stringify(data));
  } catch {}
}

function isSameList(a: any[], b: any[]): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const tA = a[i]?.title;
    const tB = b[i]?.title;
    if (tA && tB && tA !== tB) return false;
  }
  return true;
}

  // 货架数据状态（SWR: 优先从本地/预烘焙数据集瞬间 0ms 展示，永不阻塞白屏）
  const initialPrebaked = useMemo(() => {
    return getPrebakedCategoryShelves(activeNav, doubanType, shelves);
  }, [activeNav, doubanType, shelves]);

  const [shelfData, setShelfData] = useState<Record<string, RailMovie[]>>(() => {
    if (!usePrebakedOnly && typeof window !== 'undefined') {
      const cached = getLocalCatHub(activeNav || doubanType);
      if (cached && Object.keys(cached).length > 0) {
        // 安全合并：确保新增的货架即使在旧缓存中不存在，也能立刻显示初始预烘焙海报
        return { ...initialPrebaked, ...cached };
      }
    }
    return initialPrebaked;
  });
  const [loadingShelves, setLoadingShelves] = useState<boolean>(false);

  // 全库网格数据（每页展示 24 部，完美填满 8/6/4/3/2 列排版）
  const [gridMovies, setGridMovies] = useState<any[]>([]);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 24;

  // 顶部焦点大片（从第一个货架中选取第一部）
  const heroMovie = useMemo(() => {
    const firstShelfKey = shelves[0] ? getShelfKey(shelves[0]) : '';
    const firstList = shelfData[firstShelfKey];
    return firstList && firstList.length > 0 ? firstList[0] : null;
  }, [shelves, shelfData]);

  // 获取多个专属货架片单（分两批低压力拉取，带超时熔断，绝不卡死连接池）
  useEffect(() => {
    let isMounted = true;
    const cacheKey = activeNav || doubanType;

    const fetchShelvesData = async () => {
      // 若当前频道声明为纯预烘焙（如短剧），直接使用本地种子，无需发起任何豆瓣 API 请求
      if (usePrebakedOnly) return;

      try {
        // 第一批：优先请求首屏可见的前 2 个核心货架
        const primaryShelves = shelves.slice(0, 2);
        const remainingShelves = shelves.slice(2);

        const fetchShelf = async (shelf: ShelfConfig) => {
          if (shelf.prebakedOnly) return null;
          try {
            const controller = new AbortController();
            // 短剧从源站采集需要更从容的超时时间（6000ms），避免 2500ms 造成 abort 熔断
            const timer = setTimeout(() => controller.abort(), shortDramaMode ? 6000 : 3500);

            if (shortDramaMode) {
              const res = await fetch(
                `/api/short-dramas/browse?category=${encodeURIComponent(shelf.tag)}&limit=20`,
                { signal: controller.signal }
              );
              clearTimeout(timer);
              if (!res.ok) return null;
              const data = await res.json();
              const subjects = (data.list || []).map((item: any) => ({
                id: String(item.id),
                title: item.title,
                cover: item.poster,
                rate: item.remarks || (item.totalEpisodes ? `全${item.totalEpisodes}集` : '9.0'),
                year: item.year,
                types: [item.categoryName || '短剧'],
                url: item.playUrl || item.firstPlayUrl || '',
                play_url: item.playUrl,
                episodes: item.episodes,
              }));
              return { key: getShelfKey(shelf), tag: shelf.tag, subjects };
            }

            const targetDoubanType = shelf.doubanType || doubanType;
            const channelParam = activeNav || doubanType;
            const res = await fetch(
              `/api/douban/recommend?tag=${encodeURIComponent(
                shelf.tag
              )}&type=${targetDoubanType}&channel=${encodeURIComponent(channelParam)}&page_limit=20&page_start=0`,
              { signal: controller.signal }
            );
            clearTimeout(timer);
            if (!res.ok) return null;
            const data = await res.json();
            return { key: getShelfKey(shelf), tag: shelf.tag, subjects: data.subjects || [] };
          } catch {
            return null;
          }
        };

        // 1. 优先拉取前两个
        const primaryResults = await Promise.allSettled(primaryShelves.map(fetchShelf));
        if (!isMounted) return;

        const updateMap: Record<string, RailMovie[]> = {};
        primaryResults.forEach((res) => {
          if (res.status === 'fulfilled' && res.value?.key && res.value.subjects?.length) {
            updateMap[res.value.key] = res.value.subjects;
          }
        });

        if (Object.keys(updateMap).length > 0) {
          setShelfData((prev) => {
            let hasChanges = false;
            for (const [key, list] of Object.entries(updateMap)) {
              const current = prev[key] || [];
              if (!isSameList(current, list)) {
                hasChanges = true;
                break;
              }
            }
            if (!hasChanges) return prev;
            const next = { ...prev, ...updateMap };
            setLocalCatHub(cacheKey, next);
            return next;
          });
        }

        // 2. 延迟 1 秒再拉取剩余货架，彻底平滑流量峰值
        if (remainingShelves.length > 0) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          if (!isMounted) return;

          const remainingResults = await Promise.allSettled(remainingShelves.map(fetchShelf));
          if (!isMounted) return;

          remainingResults.forEach((res) => {
            if (res.status === 'fulfilled' && res.value?.key && res.value.subjects?.length) {
              updateMap[res.value.key] = res.value.subjects;
            }
          });

          if (Object.keys(updateMap).length > 0) {
            setShelfData((prev) => {
              let hasChanges = false;
              for (const [key, list] of Object.entries(updateMap)) {
                const current = prev[key] || [];
                if (!isSameList(current, list)) {
                  hasChanges = true;
                  break;
                }
              }
              if (!hasChanges) return prev;
              const next = { ...prev, ...updateMap };
              setLocalCatHub(cacheKey, next);
              return next;
            });
          }
        }
      } catch (err) {
        console.error('Fetch category shelves error:', err);
      }
    };

    fetchShelvesData();
    return () => {
      isMounted = false;
    };
  }, [shelves, doubanType, activeNav]);

  // 加载全库网格数据（支持全站统一 7 行多维条件检索）
  const loadGridPage = useCallback(
    async (pageNum: number, overrideFilters?: FilterParams) => {
      setLoadingGrid(true);
      try {
        const activeFilters = overrideFilters || filters;

        if (usePrebakedOnly) {
          // 纯预烘焙频道：直接使用本地精选池进行内存过滤与分页呈现
          const pool = PREBAKED_CATEGORY_ITEMS[activeNav] || PREBAKED_CATEGORY_ITEMS.short || [];
          let filtered = [...pool];
          if (activeFilters.genre) {
            filtered = filtered.filter((item) =>
              (item.types && item.types.some((t) => t.includes(activeFilters.genre))) ||
              item.title.includes(activeFilters.genre)
            );
          }
          if (activeFilters.year) {
            filtered = filtered.filter((item) => item.year === activeFilters.year);
          }
          const pageStart = pageNum * PAGE_SIZE;
          const subjects = filtered.slice(pageStart, pageStart + PAGE_SIZE);
          setGridMovies(subjects);
          setHasMore(pageStart + PAGE_SIZE < filtered.length);
          setTotalCount(filtered.length);
          setPage(pageNum);
          return;
        }

        if (shortDramaMode && !usePrebakedOnly && (activeFilters.channel === 'short' || activeNav === 'short')) {
          const targetPage = pageNum + 1;
          const targetCategory = activeFilters.genre || 'all';
          const res = await fetch(
            `/api/short-dramas/browse?category=${encodeURIComponent(targetCategory)}&page=${targetPage}&limit=${PAGE_SIZE}`
          );
          if (!res.ok) {
            setGridMovies([]);
            setHasMore(false);
            return;
          }
          const data = await res.json();
          const subjects = (data.list || []).map((item: any) => ({
            id: String(item.id),
            title: item.title,
            cover: item.poster,
            rate: item.remarks || (item.totalEpisodes ? `全${item.totalEpisodes}集` : '9.0'),
            year: item.year,
            types: [item.categoryName || '短剧'],
            url: item.playUrl || item.firstPlayUrl || '',
            play_url: item.playUrl,
            episodes: item.episodes,
          }));
          setGridMovies(subjects);
          setHasMore(data.page < data.pagecount && subjects.length > 0);
          setTotalCount(Number(data.total) || 62000);
          setPage(pageNum);
          return;
        }

        // 采集站全库实时网格浏览（覆盖全部板块/题材/地区/语言/年份/画质/状态/排序）
        const targetChannel = activeFilters.channel || activeNav;
        const browseType =
          targetChannel === 'all'
            ? 'all'
            : NAV_TO_BROWSE_TYPE[targetChannel] || targetChannel || doubanType;

        const targetPage = pageNum + 1;
        const params = new URLSearchParams();
        params.set('type', browseType);
        params.set('page', String(targetPage));
        params.set('limit', String(PAGE_SIZE));
        if (activeFilters.genre) params.set('genre', activeFilters.genre);
        if (activeFilters.region) params.set('area', activeFilters.region);
        if (activeFilters.lang) params.set('lang', activeFilters.lang);
        if (activeFilters.year) params.set('year', activeFilters.year);
        if (activeFilters.quality) params.set('quality', activeFilters.quality);
        if (activeFilters.status) params.set('status', activeFilters.status);
        if (activeFilters.sort) params.set('sort', activeFilters.sort);

        const res = await fetch(`/api/library/browse?${params.toString()}`);
        if (!res.ok) {
          setGridMovies([]);
          setHasMore(false);
          return;
        }
        const data = await res.json();
        const subjects = data.list || [];

        setGridMovies(subjects);
        setHasMore(data.page < data.pagecount && subjects.length > 0);
        if (data.total !== undefined) {
          setTotalCount(Number(data.total) || subjects.length);
        }
        setPage(pageNum);
      } catch (err) {
        console.error('Fetch grid error:', err);
        setGridMovies([]);
      } finally {
        setLoadingGrid(false);
      }
    },
    [filters, doubanType, usePrebakedOnly, activeNav, shortDramaMode]
  );

  // 统一筛选矩阵变动回调
  const handleUniversalFilterChange = useCallback(
    (newFilters: FilterParams) => {
      setFilters(newFilters);
      loadGridPage(0, newFilters);
    },
    [loadGridPage]
  );

  // 初始化首次加载
  useEffect(() => {
    loadGridPage(0);
  }, [loadGridPage]);

  const handleMovieClick = (movie: any) => {
    if (shortDramaMode) {
      const playUrl = movie.play_url || movie.playUrl || movie.url || movie.firstPlayUrl || '';
      const title = movie.title || '';
      const poster = movie.cover || movie.poster || '';
      const query = new URLSearchParams();
      if (title) query.set('title', title);
      if (playUrl) query.set('url', playUrl);
      if (poster) query.set('poster', poster);
      if (movie.id) query.set('id', String(movie.id));
      query.set('source', movie.sourceId || 'juliang');
      router.push(`/short/player?${query.toString()}`);
      return;
    }
    router.push(getTitleCanonicalHref(movie));
  };

  const handleSearch = (query: string) => {
    router.push(`/?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* 顶部导航：在大片巨幕上方浮动穿透 */}
      <Navbar
        onSearch={handleSearch}
        activeCategory={activeNav}
        transparentFloat={Boolean(heroItems && heroItems.length > 0)}
      />

      {/* 1. 频道顶部影院级全景通栏大片巨幕 (Hero Spotlight / HeroSlideshow 轮播) */}
      {heroItems && heroItems.length > 0 ? (
        <HeroSlideshow
          contentType={(activeNav as any) || (doubanType === 'movie' ? 'movie' : 'tv')}
          customHeroMovies={heroItems}
          trendingNav={trendingNav}
          onMovieClick={handleMovieClick}
          onSearch={handleSearch}
          badgeTitle={`${categoryTitle} · 焦点热播`}
        />
      ) : null}

      <div className={`fluid-container ${heroItems && heroItems.length > 0 ? 'pt-3 sm:pt-4' : (shortDramaMode ? 'pt-20 sm:pt-24' : 'pt-3 sm:pt-4')} pb-24 sm:pb-20 space-y-6 sm:space-y-10 relative z-20`}>
        {/* SEO 规范：为分类页提供显式唯一的 H1 标题 */}
        <h1 className="sr-only">
          {categoryTitle} - {categorySubtitle}
        </h1>

        {/* 备用单图展示（仅当非短剧模式且无轮播项但有单条 heroMovie 时） */}
        {!shortDramaMode && (!heroItems || heroItems.length === 0) && heroMovie ? (
          <div className="relative w-full h-[48vh] min-h-85 sm:h-[55vh] lg:h-[60vh] max-h-150 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group select-none">
            {/* 背景大图 */}
            <div className="absolute inset-0">
              <img
                src={getOptimizedImageUrl(heroMovie.cover)}
                alt={heroMovie.title}
                className="w-full h-full object-cover scale-105 transition-transform duration-1000 group-hover:scale-108"
                style={{ objectPosition: 'center 25%' }}
              />
              <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0F] via-[#0A0A0F]/70 to-transparent" />
              <div className="absolute inset-0 bg-linear-to-r from-[#0A0A0F]/90 via-[#0A0A0F]/40 to-transparent" />
            </div>

            {/* 巨幕内容 */}
            <div className="relative z-10 h-full flex flex-col justify-end p-4 sm:p-10 max-w-2xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 bg-(--accent-color) text-white text-[11px] sm:text-xs font-black rounded-full shadow-lg">
                  {categoryTitle} · 焦点热播
                </span>
                {heroMovie.rate && parseFloat(heroMovie.rate) > 0 && (
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 bg-black/60 backdrop-blur-md text-amber-300 text-[11px] sm:text-xs font-black rounded-full border border-amber-400/30">
                    ★ 豆瓣 {heroMovie.rate}
                  </span>
                )}
              </div>

              <h2 className="text-2xl sm:text-5xl font-black text-white tracking-tight drop-shadow-2xl mb-3 sm:mb-4 line-clamp-2">
                {heroMovie.title}
              </h2>

              <div className="flex items-center gap-2.5 sm:gap-3">
                <Link
                  href={shortDramaMode
                    ? `/short/player?${new URLSearchParams({
                        title: heroMovie.title || '',
                        url: (heroMovie as any).play_url || (heroMovie as any).playUrl || heroMovie.url || (heroMovie as any).firstPlayUrl || '',
                        poster: heroMovie.cover || (heroMovie as any).poster || '',
                        source: (heroMovie as any).sourceId || 'juliang',
                        ...((heroMovie as any).id ? { id: String((heroMovie as any).id) } : {})
                      }).toString()}`
                    : getTitleCanonicalHref(heroMovie)
                  }
                  prefetch={true}
                  className="flex-1 sm:flex-none justify-center px-5 sm:px-7 py-2.5 sm:py-3 bg-(--accent-color) hover:brightness-110 active:scale-95 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-2xl transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  立即播放
                </Link>
                <button
                  onClick={() => handleSearch(heroMovie.title)}
                  className="flex-1 sm:flex-none justify-center px-4 sm:px-5 py-2.5 sm:py-3 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-xl text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2 border border-white/15 transition-all cursor-pointer"
                >
                  <Icons.Search size={14} />
                  搜全网源
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {/* 顶部自定义专属推荐与热度榜等 */}
        {topCustomRails}

        {/* 🆕 专区最新增量入库横轨（全网真实源站自动化定时巡检） */}
        <LatestTitlesRail
          type={activeNav || doubanType}
          title={`🆕 ${categoryTitle} · 最新上线`}
          subtitle="全自动增量收录 · 实时更新"
        />

        {/* 2. 专属垂直特色片单滑轨 */}
        <div className="space-y-4">
          {shelves.map((shelf, idx) => {
            const shelfKey = getShelfKey(shelf);
            const railNode = (
              <ContentRail
                key={shelfKey}
                title={shelf.title}
                icon={shelf.icon}
                badge={shelf.badge}
                movies={shelfData[shelfKey] || []}
                loading={loadingShelves}
                onMovieClick={handleMovieClick}
                onViewAll={() => {
                  const element = document.getElementById('cathub-universal-filter');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.scrollTo({ top: 750, behavior: 'smooth' });
                  }
                }}
              />
            );
            return idx >= 2 ? (
              <div key={shelfKey} className="below-fold-rail">
                {railNode}
              </div>
            ) : (
              railNode
            );
          })}
        </div>

        {/* 3. 爱壹帆工业级全库统一多维检索矩阵 */}
        <div id="cathub-universal-filter" className="below-fold-section scroll-mt-24">
          <UniversalFilterMatrix
            defaultChannel={activeNav}
            totalCount={totalCount}
            loading={loadingGrid}
            onFilterChange={handleUniversalFilterChange}
            channelTitle={categoryTitle}
          />
        </div>

        {/* 4. 全库海报瀑布流网格 */}
        <div className="below-fold-section">
          <MovieGrid
            movies={gridMovies}
            loading={loadingGrid}
            page={page}
            hasMore={hasMore}
            totalCount={totalCount}
            pageSize={PAGE_SIZE}
            onMovieClick={handleMovieClick}
            onPageChange={loadGridPage}
          />
        </div>
      </div>

      {/* 侧边抽屉 */}
      <FavoritesSidebar />
      <WatchHistorySidebar />
    </div>
  );
}
