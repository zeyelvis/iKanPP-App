'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Icons } from '@/components/ui/Icon';
import { FavoritesSidebar } from '@/components/favorites/FavoritesSidebar';
import { WatchHistorySidebar } from '@/components/history/WatchHistorySidebar';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { PREBAKED_CATEGORY_ITEMS } from '@/lib/data/category-prebaked';

interface RankingItem {
  id: string;
  title: string;
  cover: string;
  rate?: string;
  year?: string;
  types?: string[];
  region?: string[];
  directors?: string[];
  actors?: string[];
  description?: string;
}

const RANK_CATEGORIES = [
  { id: 'movie_hot', label: '🎬 电影热度榜', type: 'movie', tag: '热门', genre: '', region: '' },
  { id: 'tv_hot', label: '📺 电视剧热播榜', type: 'tv', tag: '热门', genre: '', region: '' },
  { id: 'guoman_hot', label: '🏮 国漫风云榜', type: 'tv', tag: '国产动画', genre: '国漫', region: '国产动画' },
  { id: 'anime_hot', label: '⚡ 日本新番榜', type: 'tv', tag: '日本动画', genre: '动漫', region: '日本动画' },
  { id: 'movie_high', label: '⭐ 豆瓣高分神作', type: 'movie', tag: '豆瓣高分', genre: '', region: '' },
  { id: 'variety_hot', label: '🎤 热门综艺榜', type: 'tv', tag: '综艺', genre: '', region: '' },
];

// ── SWR 排行榜本地瞬间缓存 ──────────────────────────
const RANK_CACHE_KEY = 'kvideo-rank-cache-v7-';

function getLocalRank(id: string): RankingItem[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(RANK_CACHE_KEY + id);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch {}
  return null;
}

function setLocalRank(id: string, items: RankingItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(RANK_CACHE_KEY + id, JSON.stringify(items));
  } catch {}
}

export default function RankingClient() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(RANK_CATEGORIES[0]);
  
  const [items, setItems] = useState<RankingItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = getLocalRank(RANK_CATEGORIES[0].id);
      if (cached && cached.length > 0) return cached;
    }
    return (PREBAKED_CATEGORY_ITEMS.movie as any[]) || [];
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const cached = getLocalRank(activeTab.id);
    if (cached && cached.length > 0) {
      setItems(cached);
    } else {
      // 若切换到未缓存的 tab，优先显示对应的预置数据兜底
      const tabKey = activeTab.id.startsWith('tv') ? 'tv' : (activeTab.id.startsWith('guoman') ? 'guoman' : (activeTab.id.startsWith('anime') ? 'anime' : (activeTab.id.startsWith('variety') ? 'variety' : 'movie')));
      if (PREBAKED_CATEGORY_ITEMS[tabKey]) {
        setItems(PREBAKED_CATEGORY_ITEMS[tabKey] as any[]);
      }
    }

    const fetchRankData = async () => {
      try {
        const params = new URLSearchParams();
        params.set('tag', activeTab.tag);
        params.set('type', activeTab.type);
        if (activeTab.genre) params.set('genre', activeTab.genre);
        if (activeTab.region) params.set('region', activeTab.region);
        params.set('page_limit', '50');
        params.set('page_start', '0');

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 1800);
        const res = await fetch(`/api/douban/recommend?${params.toString()}`, { signal: controller.signal });
        clearTimeout(timer);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.subjects?.length) {
          setItems(data.subjects);
          setLocalRank(activeTab.id, data.subjects);
        }
      } catch (err) {
        console.error('Fetch rank error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchRankData();
    return () => {
      isMounted = false;
    };
  }, [activeTab]);

  const handleMovieClick = (item: RankingItem) => {
    const params = new URLSearchParams();
    params.set('title', item.title);
    params.set('type', activeTab.type);
    params.set('from', 'ranking');
    if (item.year) params.set('year', String(item.year));
    router.push(`/player?${params.toString()}`);
  };

  const handleSearch = (query: string) => {
    router.push(`/?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      <Navbar onSearch={handleSearch} activeCategory="ranking" />

      <div className="fluid-container pt-4 sm:pt-6 pb-28 sm:pb-20 space-y-6 sm:space-y-8">
        {/* 顶部标题 */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-linear-to-r from-amber-500/20 via-red-500/20 to-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-black shadow-lg">
            <span>🏆 全球全网影视风向标</span>
          </div>
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white">
            iKanPP 影视风云榜
          </h1>
          <p className="text-xs sm:text-sm text-white/50">
            实时汇总全网搜索、播放热度与豆瓣评分 · 每小时动态刷新
          </p>
        </div>

        {/* 排行榜分类 Tab 切换栏 */}
        <div className="flex justify-center">
          <div className="flex gap-2 overflow-x-auto no-scrollbar p-1.5 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-full max-w-full">
            {RANK_CATEGORIES.map((tab) => {
              const isActive = activeTab.id === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold transition-all duration-300 shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 scale-102'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 排行榜内容列表 */}
        <div className="max-w-4xl mx-auto space-y-3">
          {loading ? (
            Array.from({ length: 8 }).map((_, idx) => (
              <div
                key={idx}
                className="h-28 rounded-3xl bg-white/5 animate-pulse border border-white/5"
              />
            ))
          ) : items.length > 0 ? (
            items.map((item, idx) => {
              const rank = idx + 1;
              const isTop3 = rank <= 3;
              const rawCover = item.cover || '';
              const proxiedCover = getOptimizedImageUrl(rawCover);

              return (
                <div
                  key={item.id || idx}
                  className={`
                    group p-3 sm:p-4 rounded-2xl sm:rounded-3xl transition-all duration-300 flex items-center gap-3 sm:gap-5 border select-none
                    ${
                      isTop3
                        ? 'bg-linear-to-r from-white/10 via-white/5 to-transparent border-amber-500/30 hover:border-amber-500/60 shadow-xl'
                        : 'bg-[#0A0A0F]/80 backdrop-blur-xl border-white/10 hover:border-white/20 hover:bg-white/10'
                    }
                  `}
                >
                  {/* 排名大字 */}
                  <div
                    className={`shrink-0 w-8 sm:w-14 text-center font-black text-xl sm:text-4xl ${
                      rank === 1
                        ? 'text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.6)]'
                        : rank === 2
                        ? 'text-slate-300 drop-shadow-[0_0_12px_rgba(203,213,225,0.6)]'
                        : rank === 3
                        ? 'text-amber-600 drop-shadow-[0_0_12px_rgba(217,119,6,0.6)]'
                        : 'text-white/30 group-hover:text-white/60'
                    }`}
                  >
                    {rank < 10 ? `0${rank}` : rank}
                  </div>

                  {/* 海报封面 */}
                  <div
                    onClick={() => handleMovieClick(item)}
                    className="relative shrink-0 w-14 sm:w-20 h-20 sm:h-28 rounded-xl sm:rounded-2xl overflow-hidden bg-white/10 cursor-pointer shadow-md group-hover:scale-105 transition-transform"
                  >
                    <Image
                      src={proxiedCover || '/placeholder-poster.svg'}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                      unoptimized
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/placeholder-poster.svg';
                      }}
                    />
                  </div>

                  {/* 中间信息 */}
                  <div
                    onClick={() => handleMovieClick(item)}
                    className="flex-1 min-w-0 cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-xs sm:text-base font-bold text-white truncate group-hover:text-(--accent-color) transition-colors">
                        {item.title}
                      </h3>
                      {item.rate && parseFloat(item.rate) > 0 && (
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                          ★ {item.rate}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] sm:text-xs text-white/40">
                      <span>热播推荐</span>
                      <span>·</span>
                      <span className="text-emerald-400">4K 秒播可用</span>
                    </div>
                  </div>

                  {/* 右侧播放操作 */}
                  <div className="shrink-0 flex items-center gap-2">
                    <button
                      onClick={() => handleMovieClick(item)}
                      className="p-2 sm:px-5 sm:py-2.5 bg-(--accent-color) hover:brightness-110 active:scale-95 text-white rounded-full sm:rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
                      title="立即播放"
                    >
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      <span className="hidden sm:inline">立即播放</span>
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 text-white/30">榜单数据加载中...</div>
          )}
        </div>
      </div>

      <FavoritesSidebar />
      <WatchHistorySidebar />
    </div>
  );
}
