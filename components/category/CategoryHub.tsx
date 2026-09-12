'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { ContentRail, RailMovie } from '@/components/home/ContentRail';
import { MovieGrid } from '@/components/home/MovieGrid';
import { Icons } from '@/components/ui/Icon';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { WatchHistorySidebar } from '@/components/history/WatchHistorySidebar';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { getPrebakedCategoryShelves, PREBAKED_CATEGORY_ITEMS } from '@/lib/data/category-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';
import { HeroSlideshow } from '@/components/home/TmdbSlideshow';
import type { PrebakedSubject } from '@/lib/data/home-prebaked';

export interface FilterOption {
  label: string;
  value: string;
}

export interface ShelfConfig {
  title: string;
  icon: string;
  badge?: string;
  tag: string;
  doubanType?: 'movie' | 'tv';
  prebakedOnly?: boolean;
}

export interface CategoryHubProps {
  categoryTitle: string;
  categorySubtitle: string;
  doubanType: 'movie' | 'tv';
  activeNav: string;
  genres: FilterOption[];
  regions: FilterOption[];
  years: FilterOption[];
  shelves: ShelfConfig[];
  defaultTag?: string;
  usePrebakedOnly?: boolean;
  shortDramaMode?: boolean;
  topCustomRails?: React.ReactNode;
  heroItems?: PrebakedSubject[];
}

export function CategoryHub({
  categoryTitle,
  categorySubtitle,
  doubanType,
  activeNav,
  genres,
  regions,
  years,
  shelves,
  defaultTag = '热门',
  usePrebakedOnly = false,
  shortDramaMode = false,
  topCustomRails,
  heroItems,
}: CategoryHubProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从 URL 初始化筛选状态
  const initialGenre = searchParams.get('genre') || '';
  const initialRegion = searchParams.get('region') || '';
  const initialYear = searchParams.get('year') || '';

  // 筛选器状态
  const [selectedGenre, setSelectedGenre] = useState<string>(initialGenre);
  const [selectedRegion, setSelectedRegion] = useState<string>(initialRegion);
  const [selectedYear, setSelectedYear] = useState<string>(initialYear);
  const [selectedSort, setSelectedSort] = useState<'recommend' | 'time' | 'rank'>('recommend');

  // URL 参数同步
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedGenre) params.set('genre', selectedGenre);
    if (selectedRegion) params.set('region', selectedRegion);
    if (selectedYear) params.set('year', selectedYear);
    const qs = params.toString();
    const newUrl = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
    window.history.replaceState(null, '', newUrl);
  }, [selectedGenre, selectedRegion, selectedYear]);

// ── SWR 频道大厅本地瞬间缓存 ──────────────────────────
const CATHUB_CACHE_KEY = 'kvideo-cathub-v3-';

function getLocalCatHub(key: string): Record<string, RailMovie[]> | null {
  if (typeof window === 'undefined') return null;
  try {
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
    return getPrebakedCategoryShelves(doubanType, activeNav, shelves);
  }, [doubanType, activeNav, shelves]);

  const [shelfData, setShelfData] = useState<Record<string, RailMovie[]>>(() => {
    if (typeof window !== 'undefined') {
      const cached = getLocalCatHub(activeNav || doubanType);
      if (cached && Object.keys(cached).length > 0) {
        // 安全合并：确保新增的货架（如 ai）即使在旧缓存中不存在，也能立刻显示初始预烘焙海报
        return { ...initialPrebaked, ...cached };
      }
    }
    return initialPrebaked;
  });
  const [loadingShelves, setLoadingShelves] = useState<boolean>(false);

  // 全库网格数据（每页展示 36 部，完美填满 6/4/3/2 列排版）
  const [gridMovies, setGridMovies] = useState<any[]>([]);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 36;

  // 顶部焦点大片（从第一个货架中选取第一部）
  const heroMovie = useMemo(() => {
    const firstShelfKey = shelves[0]?.tag;
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
              return { tag: shelf.tag, subjects };
            }

            const targetDoubanType = shelf.doubanType || doubanType;
            const res = await fetch(
              `/api/douban/recommend?tag=${encodeURIComponent(
                shelf.tag
              )}&type=${targetDoubanType}&page_limit=20&page_start=0`,
              { signal: controller.signal }
            );
            clearTimeout(timer);
            if (!res.ok) return null;
            const data = await res.json();
            return { tag: shelf.tag, subjects: data.subjects || [] };
          } catch {
            return null;
          }
        };

        // 1. 优先拉取前两个
        const primaryResults = await Promise.allSettled(primaryShelves.map(fetchShelf));
        if (!isMounted) return;

        const updateMap: Record<string, RailMovie[]> = {};
        primaryResults.forEach((res) => {
          if (res.status === 'fulfilled' && res.value?.tag && res.value.subjects?.length) {
            updateMap[res.value.tag] = res.value.subjects;
          }
        });

        if (Object.keys(updateMap).length > 0) {
          setShelfData((prev) => {
            let hasChanges = false;
            for (const [tag, list] of Object.entries(updateMap)) {
              const current = prev[tag] || [];
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
            if (res.status === 'fulfilled' && res.value?.tag && res.value.subjects?.length) {
              updateMap[res.value.tag] = res.value.subjects;
            }
          });

          if (Object.keys(updateMap).length > 0) {
            setShelfData((prev) => {
              let hasChanges = false;
              for (const [tag, list] of Object.entries(updateMap)) {
                const current = prev[tag] || [];
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

  // 计算当前有效综合搜索 Tag
  const activeSearchTag = useMemo(() => {
    if (selectedGenre && selectedRegion) return `${selectedGenre} ${selectedRegion}`;
    if (selectedGenre) return selectedGenre;
    if (selectedRegion) return selectedRegion;
    if (selectedYear) return selectedYear;
    return defaultTag;
  }, [selectedGenre, selectedRegion, selectedYear, defaultTag]);

  // 加载全库网格数据（支持多维 1~3 个条件交叉组合）
  const loadGridPage = useCallback(
    async (pageNum: number) => {
      setLoadingGrid(true);
      try {
        if (usePrebakedOnly) {
          // 纯预烘焙频道（短剧）：直接使用本地精选池进行内存过滤与分页呈现
          const pool = PREBAKED_CATEGORY_ITEMS[activeNav] || PREBAKED_CATEGORY_ITEMS.short || [];
          let filtered = [...pool];
          if (selectedGenre) {
            filtered = filtered.filter(item => item.types?.some(t => t.includes(selectedGenre)));
          }
          if (selectedYear) {
            filtered = filtered.filter(item => item.year === selectedYear);
          }
          const pageStart = pageNum * PAGE_SIZE;
          const subjects = filtered.slice(pageStart, pageStart + PAGE_SIZE);
          setGridMovies(subjects);
          setHasMore(pageStart + PAGE_SIZE < filtered.length);
          setPage(pageNum);
          return;
        }

        if (shortDramaMode && !usePrebakedOnly) {
          const currentCategory = selectedGenre || 'all';
          const targetPage = pageNum + 1;
          const res = await fetch(
            `/api/short-dramas/browse?category=${encodeURIComponent(currentCategory)}&page=${targetPage}&limit=${PAGE_SIZE}`
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
          setPage(pageNum);
          return;
        }

        const pageStart = pageNum * PAGE_SIZE;
        const params = new URLSearchParams();
        if (selectedGenre) params.set('genre', selectedGenre);
        if (selectedRegion) params.set('region', selectedRegion);
        if (selectedYear) params.set('year', selectedYear);
        if (activeSearchTag) params.set('tag', activeSearchTag);
        params.set('type', doubanType);
        params.set('page_limit', String(PAGE_SIZE));
        params.set('page_start', String(pageStart));

        const res = await fetch(`/api/douban/recommend?${params.toString()}`);
        const data = await res.json();
        const subjects = data.subjects || [];

        setGridMovies(subjects);
        setHasMore(subjects.length === PAGE_SIZE);
        setPage(pageNum);
      } catch (err) {
        console.error('Fetch grid error:', err);
        setGridMovies([]);
      } finally {
        setLoadingGrid(false);
      }
    },
    [selectedGenre, selectedRegion, selectedYear, activeSearchTag, doubanType, usePrebakedOnly, activeNav, shortDramaMode]
  );

  // 筛选器变化时重置回第 0 页
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
      router.push(`/short/player?${query.toString()}`);
      return;
    }
    router.push(`/title/${generateSlug(movie.title)}`);
  };

  const handleSearch = (query: string) => {
    router.push(`/?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* 顶部导航 */}
      <Navbar
        onSearch={handleSearch}
        activeCategory={activeNav}
      />

      {/* 1. 频道顶部影院级全景通栏大片巨幕 (Hero Spotlight / HeroSlideshow 轮播) */}
      {heroItems && heroItems.length > 0 ? (
        <HeroSlideshow
          contentType={doubanType === 'movie' ? 'movie' : 'tv'}
          customHeroMovies={heroItems}
          onMovieClick={handleMovieClick}
          onSearch={handleSearch}
          badgeTitle={`${categoryTitle} · 焦点热播`}
        />
      ) : null}

      <div className="fluid-container pt-3 sm:pt-4 pb-24 sm:pb-20 space-y-6 sm:space-y-10 relative z-20">
        {/* SEO 规范：为分类页提供显式唯一的 H1 标题 */}
        <h1 className="sr-only">
          {categoryTitle} - {categorySubtitle}
        </h1>

        {/* 备用单图展示（仅当无轮播项但有单条 heroMovie 时） */}
        {(!heroItems || heroItems.length === 0) && heroMovie ? (
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
                <button
                  onClick={() => handleMovieClick(heroMovie)}
                  className="flex-1 sm:flex-none justify-center px-5 sm:px-7 py-2.5 sm:py-3 bg-(--accent-color) hover:brightness-110 active:scale-95 text-white rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-2xl transition-all cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  立即播放
                </button>
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

        {/* 2. 专属垂直特色片单滑轨 */}
        <div className="space-y-4">
          {shelves.map((shelf) => (
            <ContentRail
              key={shelf.tag}
              title={shelf.title}
              icon={shelf.icon}
              badge={shelf.badge}
              movies={shelfData[shelf.tag] || []}
              loading={loadingShelves}
              onMovieClick={handleMovieClick}
              onViewAll={() => {
                setSelectedGenre(shelf.tag);
                window.scrollTo({ top: 800, behavior: 'smooth' });
              }}
            />
          ))}
        </div>

        {/* 3. 多维综合分类筛选矩阵 */}
        <div className="bg-[#0A0A0F]/90 backdrop-blur-2xl border border-white/10 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-2xl space-y-4 sm:space-y-5">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">🎛️</span>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  {categoryTitle} · 全库多维检索
                </h2>
                <p className="text-xs text-white/40">{categorySubtitle}</p>
              </div>
            </div>
            {(selectedGenre || selectedRegion || selectedYear) && (
              <button
                onClick={() => {
                  setSelectedGenre('');
                  setSelectedRegion('');
                  setSelectedYear('');
                }}
                className="text-xs text-(--accent-color) hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Icons.RefreshCw size={12} />
                重置筛选
              </button>
            )}
          </div>

          {/* 题材类型 */}
          {genres.length > 0 && (
            <div className="flex items-start gap-3 text-xs">
              <span className="text-white/40 font-bold shrink-0 pt-1.5 w-12">类型：</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedGenre('')}
                  className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                    selectedGenre === ''
                      ? 'bg-(--accent-color) text-white font-bold shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  全部
                </button>
                {genres.map((g) => (
                  <button
                    key={g.value}
                    onClick={() => setSelectedGenre(g.value)}
                    className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                      selectedGenre === g.value
                        ? 'bg-(--accent-color) text-white font-bold shadow-md'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 地区 */}
          {regions.length > 0 && (
            <div className="flex items-start gap-3 text-xs">
              <span className="text-white/40 font-bold shrink-0 pt-1.5 w-12">地区：</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedRegion('')}
                  className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                    selectedRegion === ''
                      ? 'bg-(--accent-color) text-white font-bold shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  全部
                </button>
                {regions.map((r) => (
                  <button
                    key={r.value}
                    onClick={() => setSelectedRegion(r.value)}
                    className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                      selectedRegion === r.value
                        ? 'bg-(--accent-color) text-white font-bold shadow-md'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 年份 */}
          {years.length > 0 && (
            <div className="flex items-start gap-3 text-xs">
              <span className="text-white/40 font-bold shrink-0 pt-1.5 w-12">年份：</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setSelectedYear('')}
                  className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                    selectedYear === ''
                      ? 'bg-(--accent-color) text-white font-bold shadow-md'
                      : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  全部
                </button>
                {years.map((y) => (
                  <button
                    key={y.value}
                    onClick={() => setSelectedYear(y.value)}
                    className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                      selectedYear === y.value
                        ? 'bg-(--accent-color) text-white font-bold shadow-md'
                        : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {y.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 排序方式 */}
          <div className="flex items-start gap-3 text-xs pt-1 border-t border-white/5">
            <span className="text-white/40 font-bold shrink-0 pt-1.5 w-12">排序：</span>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedSort('recommend')}
                className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                  selectedSort === 'recommend'
                    ? 'bg-amber-500 text-black font-black shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                🔥 综合热度
              </button>
              <button
                onClick={() => {
                  setSelectedSort('time');
                  if (!selectedGenre) setSelectedGenre('最新');
                }}
                className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                  selectedSort === 'time'
                    ? 'bg-amber-500 text-black font-black shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                ✨ 最新上映
              </button>
              <button
                onClick={() => {
                  setSelectedSort('rank');
                  if (!selectedGenre) setSelectedGenre('豆瓣高分');
                }}
                className={`px-3 py-1 rounded-xl font-medium transition-all cursor-pointer ${
                  selectedSort === 'rank'
                    ? 'bg-amber-500 text-black font-black shadow-md'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                ⭐ 豆瓣高分
              </button>
            </div>
          </div>
        </div>

        {/* 4. 全库海报瀑布流网格 */}
        <div>
          <MovieGrid
            movies={gridMovies}
            loading={loadingGrid}
            page={page}
            hasMore={hasMore}
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
