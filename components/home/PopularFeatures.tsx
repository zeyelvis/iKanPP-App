'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import { TagManager } from './TagManager';
import { MovieGrid } from './MovieGrid';
import { useTagManager } from './hooks/useTagManager';
import { usePopularMovies } from './hooks/usePopularMovies';
import { HeroSlideshow } from './TmdbSlideshow';
import { Top10Rail } from './Top10Rail';
import { ContentRail } from './ContentRail';
import { useRankingData } from './hooks/useRankingData';
import { useUserStore } from '@/lib/store/user-store';
import { VipPrompt } from '@/components/premium/VipPrompt';
import { AuthModal } from '@/components/auth/AuthModal';

interface PopularFeaturesProps {
  onSearch?: (query: string) => void;
}

export function PopularFeatures({ onSearch }: PopularFeaturesProps) {
  const router = useRouter();
  const { user } = useUserStore();
  const [showVipPrompt, setShowVipPrompt] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const {
    tags,
    selectedTag,
    contentType,
    newTagInput,
    showTagManager,
    justAddedTag,
    setContentType,
    setSelectedTag,
    setNewTagInput,
    setShowTagManager,
    setJustAddedTag,
    handleAddTag,
    handleDeleteTag,
    handleRestoreDefaults,
    handleDragEnd,
    isLoadingTags,
  } = useTagManager();

  // 排行榜数据（用于 TOP 10 Rail）
  const { movieRanking, tvRanking, loading: rankingLoading } = useRankingData({ limit: 10 });
  const top10Data = contentType === 'movie' ? movieRanking : tvRanking;

  // 主探索区影片
  const {
    movies,
    loading,
    page,
    hasMore,
    goToPage,
  } = usePopularMovies(selectedTag, tags, contentType);

  // 主题货架分片数据获取
  const [latestMovies, setLatestMovies] = useState<any[]>([]);
  const [highRateMovies, setHighRateMovies] = useState<any[]>([]);
  const [chineseMovies, setChineseMovies] = useState<any[]>([]);
  const [loadingShelves, setLoadingShelves] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchShelves = async () => {
      setLoadingShelves(true);
      try {
        const [resLatest, resHigh, resChinese] = await Promise.allSettled([
          fetch(`/api/douban/movies?tag=最新&type=${contentType}&page_limit=12&page_start=0`).then(r => r.json()),
          fetch(`/api/douban/movies?tag=豆瓣高分&type=${contentType}&page_limit=12&page_start=0`).then(r => r.json()),
          fetch(`/api/douban/movies?tag=华语&type=${contentType}&page_limit=12&page_start=0`).then(r => r.json()),
        ]);

        if (isMounted) {
          if (resLatest.status === 'fulfilled' && resLatest.value?.subjects) {
            setLatestMovies(resLatest.value.subjects);
          }
          if (resHigh.status === 'fulfilled' && resHigh.value?.subjects) {
            setHighRateMovies(resHigh.value.subjects);
          }
          if (resChinese.status === 'fulfilled' && resChinese.value?.subjects) {
            setChineseMovies(resChinese.value.subjects);
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
  }, [contentType]);

  const handleMovieClick = (movie: any) => {
    const params = new URLSearchParams();
    params.set('title', movie.title);
    params.set('type', contentType);
    router.push(`/player?${params.toString()}`);
  };

  const handleTagSelect = (tagId: string) => {
    if (tagId === 'custom_高级' || tags.find(t => t.id === tagId)?.label === '高级') {
      window.location.href = '/premium';
      return;
    }
    setSelectedTag(tagId);
  };

  return (
    <div className="animate-fade-in pb-16">
      {/* 1. 🏆 影院级全景沉浸式巨幕 Billboard */}
      <HeroSlideshow contentType={contentType} onSearch={onSearch} />

      {/* 2. 🌟 流媒体核心分类快速切换（电影 / 电视剧 / 动漫 / 综艺） */}
      <div className="flex items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setContentType('movie')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              contentType === 'movie'
                ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30 scale-105'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            🎬 电影专区
          </button>
          <button
            onClick={() => setContentType('tv')}
            className={`px-5 py-2 rounded-full text-sm font-bold transition-all cursor-pointer ${
              contentType === 'tv'
                ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30 scale-105'
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

      {/* 3. 🥇 Netflix 风格今日 TOP 10 实时排行榜 */}
      <Top10Rail
        movies={top10Data}
        loading={rankingLoading}
        onMovieClick={handleMovieClick}
        contentType={contentType}
      />

      {/* 4. 🆕 院线首播 & 最新上映滑轨 */}
      <ContentRail
        title="院线首播 & 最新上映"
        icon="✨"
        badge="NEW"
        movies={latestMovies}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => setSelectedTag('最新')}
      />

      {/* 5. ⭐ 豆瓣 8.5+ 影史高分神作滑轨 */}
      <ContentRail
        title="豆瓣 8.5+ 影史必看神作"
        icon="⭐"
        badge="HIGH RATED"
        movies={highRateMovies}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => setSelectedTag('豆瓣高分')}
      />

      {/* 6. 🏮 华语精选热播专区 */}
      <ContentRail
        title="华语热门热播精选"
        icon="🏮"
        movies={chineseMovies}
        loading={loadingShelves}
        onMovieClick={handleMovieClick}
        onViewAll={() => setSelectedTag('华语')}
      />

      {/* 7. 🏷️ 深度题材与分类探索区 */}
      <div className="mt-14 pt-8 border-t border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧭</span>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              按类型题材随心探索
            </h2>
          </div>
          <span className="text-xs text-white/40">实时抓取全网最新片单</span>
        </div>

        {/* 标签选择抽屉 */}
        <TagManager
          tags={tags}
          selectedTag={selectedTag}
          showTagManager={showTagManager}
          newTagInput={newTagInput}
          justAddedTag={justAddedTag}
          onTagSelect={handleTagSelect}
          onTagDelete={handleDeleteTag}
          onToggleManager={() => setShowTagManager(!showTagManager)}
          onRestoreDefaults={handleRestoreDefaults}
          onNewTagInputChange={setNewTagInput}
          onAddTag={handleAddTag}
          onDragEnd={handleDragEnd}
          onJustAddedTagHandled={() => setJustAddedTag(false)}
          isLoadingTags={isLoadingTags}
        />

        {/* 影片网格 */}
        <MovieGrid
          movies={movies}
          loading={loading}
          page={page}
          hasMore={hasMore}
          onMovieClick={handleMovieClick}
          onPageChange={goToPage}
        />
      </div>

      {/* VIP 弹窗 */}
      {showVipPrompt && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
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
