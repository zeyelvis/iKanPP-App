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

export interface FilterOption {
  label: string;
  value: string;
}

export interface ShelfConfig {
  title: string;
  icon: string;
  badge?: string;
  tag: string;
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

  // 货架数据状态
  const [shelfData, setShelfData] = useState<Record<string, RailMovie[]>>({});
  const [loadingShelves, setLoadingShelves] = useState(true);

  // 全库网格数据
  const [gridMovies, setGridMovies] = useState<any[]>([]);
  const [loadingGrid, setLoadingGrid] = useState(false);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const PAGE_SIZE = 20;

  // 顶部焦点大片（从第一个货架中选取第一部）
  const heroMovie = useMemo(() => {
    const firstShelfKey = shelves[0]?.tag;
    const firstList = shelfData[firstShelfKey];
    return firstList && firstList.length > 0 ? firstList[0] : null;
  }, [shelves, shelfData]);

  // 获取多个专属货架片单
  useEffect(() => {
    let isMounted = true;
    const fetchShelvesData = async () => {
      setLoadingShelves(true);
      try {
        const results = await Promise.allSettled(
          shelves.map((shelf) =>
            fetch(
              `/api/douban/recommend?tag=${encodeURIComponent(
                shelf.tag
              )}&type=${doubanType}&page_limit=14&page_start=0`
            )
              .then((r) => r.json())
              .then((data) => ({ tag: shelf.tag, subjects: data.subjects || [] }))
          )
        );

        if (isMounted) {
          const map: Record<string, RailMovie[]> = {};
          results.forEach((res) => {
            if (res.status === 'fulfilled' && res.value?.tag) {
              map[res.value.tag] = res.value.subjects;
            }
          });
          setShelfData(map);
        }
      } catch (err) {
        console.error('Fetch category shelves error:', err);
      } finally {
        if (isMounted) setLoadingShelves(false);
      }
    };

    fetchShelvesData();
    return () => {
      isMounted = false;
    };
  }, [shelves, doubanType]);

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
    [selectedGenre, selectedRegion, selectedYear, activeSearchTag, doubanType]
  );

  // 筛选器变化时重置回第 0 页
  useEffect(() => {
    loadGridPage(0);
  }, [loadGridPage]);

  const handleMovieClick = (movie: any) => {
    const params = new URLSearchParams();
    params.set('title', movie.title);
    params.set('type', doubanType);
    router.push(`/player?${params.toString()}`);
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

      <div className="fluid-container pt-3 sm:pt-4 pb-24 sm:pb-20 space-y-6 sm:space-y-10">
        {/* 1. 频道顶部焦点巨幕 (Hero Spotlight) */}
        {heroMovie && (
          <div className="relative w-full h-[48vh] min-h-[340px] sm:h-[55vh] lg:h-[60vh] max-h-150 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-white/10 group select-none">
            {/* 背景大图 */}
            <div className="absolute inset-0">
              <img
                src={
                  heroMovie.cover?.startsWith('http')
                    ? `/api/img-proxy?url=${encodeURIComponent(heroMovie.cover)}`
                    : heroMovie.cover || '/placeholder-poster.svg'
                }
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

              <h1 className="text-2xl sm:text-5xl font-black text-white tracking-tight drop-shadow-2xl mb-3 sm:mb-4 line-clamp-2">
                {heroMovie.title}
              </h1>

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
        )}

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
