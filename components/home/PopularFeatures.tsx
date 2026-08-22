'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { HeroSlideshow } from './TmdbSlideshow';
import { Top10Rail } from './Top10Rail';
import { ContentRail } from './ContentRail';
import { CategoryBrandBar } from './CategoryBrandBar';
import { ContinueWatchingRail } from './ContinueWatchingRail';
import { LiveChannelsPreview } from './LiveChannelsPreview';
import { PlatformFeaturesStrip } from './PlatformFeaturesStrip';
import { PersonalizedForYouRail } from './PersonalizedForYouRail';
import { ExploreHubFooterBanner } from './ExploreHubFooterBanner';
import { useRankingData } from './hooks/useRankingData';
import { useUserStore } from '@/lib/store/user-store';
import { VipPrompt } from '@/components/premium/VipPrompt';
import { AuthModal } from '@/components/auth/AuthModal';

import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
}

// ── SWR 本地瞬间缓存 ──────────────────────────
const SHELVES_CACHE_KEY = 'kvideo-home-shelves-v4-';

function getLocalShelves(type: 'movie' | 'tv') {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(SHELVES_CACHE_KEY + type);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.s1) && parsed.s1.length > 0) {
      return parsed;
    }
  } catch {}
  return null;
}

function setLocalShelves(type: 'movie' | 'tv', data: { s1: any[]; s2: any[]; s3: any[]; s4: any[] }) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SHELVES_CACHE_KEY + type, JSON.stringify(data));
  } catch {}
}

export function PopularFeatures({ onSearch }: PopularFeaturesProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const [showVipPrompt, setShowVipPrompt] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [contentType, setContentType] = useState<'movie' | 'tv'>('movie');

  // 排行榜数据（用于 TOP 10 Rail）
  const { movieRanking, tvRanking, loading: rankingLoading } = useRankingData({ limit: 10 });
  const top10Data = contentType === 'movie' ? movieRanking : tvRanking;

  // 主题货架分片数据获取（SWR: 优先使用本地缓存，新用户首次访问直接秒级呈现预烘焙高清精选数据，0ms 瞬间秒开）
  const initialCache = typeof window !== 'undefined' ? getLocalShelves(contentType) : null;
  const prebaked = PREBAKED_HOME_DATA[contentType];

  const [shelf1Movies, setShelf1Movies] = useState<any[]>(() => initialCache?.s1 || prebaked.s1);
  const [shelf2Movies, setShelf2Movies] = useState<any[]>(() => initialCache?.s2 || prebaked.s2);
  const [shelf3Movies, setShelf3Movies] = useState<any[]>(() => initialCache?.s3 || prebaked.s3);
  const [shelf4Movies, setShelf4Movies] = useState<any[]>(() => initialCache?.s4 || prebaked.s4);
  const [loadingShelves, setLoadingShelves] = useState<boolean>(false);

  // 根据 contentType 动态确定 4 个货架的标签
  const isMovie = contentType === 'movie';
  const tag1 = isMovie ? '最新' : '国产剧';
  const tag2 = isMovie ? '豆瓣高分' : '美剧';
  const tag3 = isMovie ? '华语' : '韩剧';
  const tag4 = isMovie ? '欧美' : '日本动画';

  useEffect(() => {
    let isMounted = true;
    const cache = getLocalShelves(contentType);
    if (cache) {
      setShelf1Movies(cache.s1);
      setShelf2Movies(cache.s2);
      setShelf3Movies(cache.s3);
      setShelf4Movies(cache.s4);
      setLoadingShelves(false);
    } else {
      setLoadingShelves(true);
    }

    const fetchShelves = async () => {
      try {
        const [res1, res2, res3, res4] = await Promise.allSettled([
          fetch(`/api/douban/recommend?tag=${encodeURIComponent(tag1)}&type=${contentType}&page_limit=14&page_start=0`).then(r => r.json()),
          fetch(`/api/douban/recommend?tag=${encodeURIComponent(tag2)}&type=${contentType}&page_limit=14&page_start=0`).then(r => r.json()),
          fetch(`/api/douban/recommend?tag=${encodeURIComponent(tag3)}&type=${contentType}&page_limit=14&page_start=0`).then(r => r.json()),
          fetch(`/api/douban/recommend?tag=${encodeURIComponent(tag4)}&type=${contentType}&page_limit=14&page_start=0`).then(r => r.json()),
        ]);

        if (isMounted) {
          const s1 = res1.status === 'fulfilled' && res1.value?.subjects?.length ? res1.value.subjects : [];
          const s2 = res2.status === 'fulfilled' && res2.value?.subjects?.length ? res2.value.subjects : [];
          const s3 = res3.status === 'fulfilled' && res3.value?.subjects?.length ? res3.value.subjects : [];
          const s4 = res4.status === 'fulfilled' && res4.value?.subjects?.length ? res4.value.subjects : [];

          if (s1.length) setShelf1Movies(s1);
          if (s2.length) setShelf2Movies(s2);
          if (s3.length) setShelf3Movies(s3);
          if (s4.length) setShelf4Movies(s4);

          if (s1.length || s2.length) {
            setLocalShelves(contentType, {
              s1: s1.length ? s1 : (cache?.s1 || []),
              s2: s2.length ? s2 : (cache?.s2 || []),
              s3: s3.length ? s3 : (cache?.s3 || []),
              s4: s4.length ? s4 : (cache?.s4 || []),
            });
          }
        }
      } catch (err) {
        console.error('Fetch shelves error:', err);
      } finally {
        if (isMounted) setLoadingShelves(false);
      }
    };

    fetchShelves();
    return () => {
      isMounted = false;
    };
  }, [contentType, tag1, tag2, tag3, tag4]);

  const handleMovieClick = (movie: any) => {
    const params = new URLSearchParams();
    params.set('title', movie.title);
    params.set('type', contentType);
    router.push(`/player?${params.toString()}`);
  };

  return (
    <div className="animate-fade-in pb-28 sm:pb-16">
      {/* 1. 🏆 影院级全景沉浸式巨幕 Billboard */}
      <HeroSlideshow contentType={contentType} onSearch={onSearch} />

      {/* 2. 🎬 断点续播 / 最近观看记录横轨 */}
      <ContinueWatchingRail />

      {/* 3. ✨ 流媒体核心频道与品牌直通入口 (Brands Bar) */}
      <CategoryBrandBar />

      {/* 4. 🌟 流媒体核心分类快速切换（电影 / 电视剧 / 动漫 / 综艺） */}
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setContentType('movie')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              contentType === 'movie'
                ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 scale-105'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            🎬 电影专区
          </button>
          <button
            onClick={() => setContentType('tv')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              contentType === 'tv'
                ? 'bg-(--accent-color) text-white shadow-lg shadow-(--accent-color)/30 scale-105'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            📺 电视剧集
          </button>
          <button
            onClick={() => router.push('/iptv')}
            className="px-4 py-2 rounded-full text-sm font-medium bg-white/5 text-white/60 hover:text-white hover:bg-white/10 transition-all cursor-pointer hidden sm:inline-flex items-center gap-1.5"
          >
            📡 电视直播
          </button>
        </div>

        <span className="text-xs text-white/40 font-medium hidden md:inline">
          全球多源秒播 · 4K 超清聚合
        </span>
      </div>

      {/* 5. 🎯 猜你喜欢 · 智能定制推荐 */}
      <PersonalizedForYouRail
        onMovieClick={handleMovieClick}
        contentType={contentType}
      />

      {/* 6. 🥇 Netflix 风格今日 TOP 10 实时排行榜 */}
      <Top10Rail
        movies={top10Data}
        loading={rankingLoading}
        onMovieClick={handleMovieClick}
        contentType={contentType}
      />

      {/* 7. 货架 1：最新上映 或 国产新剧 */}
      <ContentRail
        title={isMovie ? '✨ 院线首播 & 最新上映' : '🔥 2026 华语热播连续剧'}
        icon={isMovie ? '✨' : '🔥'}
        badge="NEW"
        movies={shelf1Movies}
        loading={loadingShelves}
        isPriority={true}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(isMovie ? '/movie?genre=最新' : '/tv?region=国产剧')}
      />

      {/* 8. 货架 2：豆瓣高分 或 顶级美剧 */}
      <ContentRail
        title={isMovie ? '⭐ 豆瓣 8.5+ 影史高分神作' : '🌟 顶级欧美神剧专区'}
        icon={isMovie ? '⭐' : '🌟'}
        badge={isMovie ? 'HIGH RATED' : 'TOP US'}
        movies={shelf2Movies}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(isMovie ? '/movie?genre=豆瓣高分' : '/tv?region=美剧')}
      />

      {/* 9. 📡 电视直播精选频道 */}
      <LiveChannelsPreview />

      {/* 10. 货架 3：华语经典 或 人气日韩剧 */}
      <ContentRail
        title={isMovie ? '🏮 华语经典口碑大片' : '🍿 人气韩剧 & 日剧精选'}
        icon={isMovie ? '🏮' : '🍿'}
        movies={shelf3Movies}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(isMovie ? '/movie?region=华语' : '/tv?region=韩剧')}
      />

      {/* 11. 货架 4：好莱坞大片 或 动漫新番 */}
      <ContentRail
        title={isMovie ? '🚀 好莱坞 & 欧美科幻大片' : '⚡ 热血动漫 & 新番连载'}
        icon={isMovie ? '🚀' : '⚡'}
        movies={shelf4Movies}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => router.push(isMovie ? '/movie?region=欧美' : '/anime')}
      />

      {/* 12. 🛡️ 平台核心特性与极速播放优势 */}
      <PlatformFeaturesStrip />

      {/* 13. 🧭 全库多维分类检索大厅导航卡片 */}
      <ExploreHubFooterBanner />

      {/* VIP 弹窗 */}
      {showVipPrompt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-9999 flex items-center justify-center">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowVipPrompt(false)} />
          <div className="relative z-10 w-[90vw] max-w-lg rounded-3xl overflow-hidden shadow-2xl animate-fade-in border border-white/10">
            <VipPrompt
              asModal
              onClose={() => setShowVipPrompt(false)}
              onOpenLogin={() => {
                setShowVipPrompt(false);
                setShowLogin(true);
              }}
            />
          </div>
        </div>,
        document.body
      )}

      {/* 登录弹窗 */}
      {showLogin && (
        <AuthModal isOpen={showLogin} onClose={() => setShowLogin(false)} />
      )}
    </div>
  );
}
