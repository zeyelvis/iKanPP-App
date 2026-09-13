'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icon';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

export interface RailMovie {
  id: string;
  title: string;
  cover: string;
  rate?: string;
  year?: string;
  types?: string[];
  url?: string;
}

interface ContentRailProps {
  title: string;
  icon?: string;
  badge?: string;
  movies: RailMovie[];
  loading?: boolean;
  isPriority?: boolean;
  onMovieClick: (movie: RailMovie) => void;
  onViewAll?: () => void;
}

function RailPosterItem({
  movie,
  idx,
  isPriority,
  onMovieClick,
}: {
  movie: RailMovie;
  idx: number;
  isPriority: boolean;
  onMovieClick: (movie: RailMovie) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const proxiedCover = getOptimizedImageUrl(movie.cover, { variant: 'poster' });

  useEffect(() => {
    setImageError(false);
  }, [movie.cover]);

  return (
    <div
      onClick={() => onMovieClick(movie)}
      className="cinema-poster-card shrink-0 w-[118px] sm:w-40 lg:w-46 cursor-pointer group/card select-none"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '160px 240px' }}
    >
      {/* 海报卡片 */}
      <div className="relative aspect-2/3 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-[0_6px_20px_rgba(0,0,0,0.35)] group-hover/card:border-(--accent-color)/50 transition-all duration-300">
        {!imageError && proxiedCover ? (
          <Image
            src={proxiedCover}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover/card:scale-108"
            sizes="(max-width: 640px) 118px, (max-width: 1024px) 160px, 184px"
            loading={isPriority && idx < 4 ? 'eager' : 'lazy'}
            decoding="async"
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* 极致艺术电影原木/胶片风定制封套：原图失效或反盗链时的优雅兜底，杜绝破裂碎图 */
          <div className="w-full h-full p-3 flex flex-col justify-between items-center text-center bg-gradient-to-br from-[#1e1e2f] via-[#12131d] to-[#07070b] border border-white/5 select-none relative overflow-hidden">
            {/* 背景动态流光微光 */}
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-600/10 rounded-full blur-xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-amber-500/10 rounded-full blur-xl pointer-events-none" />

            {/* 顶部胶片微标 */}
            <div className="w-full flex items-center justify-between z-10">
              <span className="text-[9px] font-black tracking-widest text-white/30 uppercase">
                iKanPP 4K
              </span>
            </div>

            {/* 中间大字与胶片徽标 */}
            <div className="flex flex-col items-center gap-1.5 my-auto z-10 px-1">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400/80 shadow-inner group-hover/card:scale-110 transition-transform">
                <Icons.Film size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white/90 line-clamp-3 leading-snug drop-shadow-md">
                {movie.title}
              </h4>
            </div>

            {/* 底部微小说明 */}
            <div className="z-10 text-[9px] text-white/40 font-mono">
              {movie.year || '经典影音'}
            </div>
          </div>
        )}

        {/* 评分角标 */}
        {movie.rate && parseFloat(movie.rate) > 0 ? (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-black/80 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/15 shadow-md z-20">
            <Icons.Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[10px] sm:text-[11px] font-black text-amber-300">
              {movie.rate}
            </span>
          </div>
        ) : (
          <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-emerald-600/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-full border border-white/15 z-20">
            <span className="text-[9px] sm:text-[10px] font-bold text-white">新热</span>
          </div>
        )}

        {/* 悬停播放光效 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-2.5 sm:p-3 z-30 pointer-events-none">
          <div className="w-full py-1.5 sm:py-2 bg-(--accent-color) hover:brightness-110 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all pointer-events-auto">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            立即播放
          </div>
        </div>
      </div>

      {/* 底部标题与年份 */}
      <div className="mt-1.5 sm:mt-2 px-0.5">
        <h3 className="text-xs sm:text-sm font-semibold text-white/90 truncate group-hover/card:text-(--accent-color) transition-colors leading-snug">
          {movie.title}
        </h3>
        {movie.year && (
          <p className="text-[10px] sm:text-[11px] text-white/40 mt-0.5 font-medium">
            {movie.year}
          </p>
        )}
      </div>
    </div>
  );
}

export function ContentRail({
  title,
  icon = '🎬',
  badge,
  movies,
  loading = false,
  isPriority = false,
  onMovieClick,
  onViewAll,
}: ContentRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll, { passive: true });
      window.addEventListener('resize', checkScroll);
    }
    return () => {
      if (el) el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [movies]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="relative my-8 sm:my-10 group/rail">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3.5 px-1 sm:px-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl">{icon}</span>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            {title}
            {badge && (
              <span className="text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full bg-(--accent-color)/20 text-(--accent-color) border border-(--accent-color)/30">
                {badge}
              </span>
            )}
          </h2>
        </div>

        {onViewAll && (
          <button
            onClick={onViewAll}
            className="flex items-center gap-1 text-xs sm:text-sm font-medium text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <span>查看全部</span>
            <Icons.ChevronRight size={14} />
          </button>
        )}
      </div>

      {/* 左右滑动控制箭头 */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-[55%] -translate-y-1/2 z-30 w-10 h-24 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center rounded-r-xl transition-all duration-300 opacity-0 group-hover/rail:opacity-100 shadow-2xl cursor-pointer hover:w-12 border-y border-r border-white/10"
          aria-label="向左滚动"
        >
          <Icons.ChevronLeft size={24} />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-[55%] -translate-y-1/2 z-30 w-10 h-24 bg-black/70 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center rounded-l-xl transition-all duration-300 opacity-0 group-hover/rail:opacity-100 shadow-2xl cursor-pointer hover:w-12 border-y border-l border-white/10"
          aria-label="向右滚动"
        >
          <Icons.ChevronRight size={24} />
        </button>
      )}

      {/* 滑轨容器 */}
      <div
        ref={scrollRef}
        className="content-rail-scroll flex gap-3 sm:gap-4 overflow-x-auto pb-4 pt-1 px-1 sm:px-2 scroll-smooth"
      >
        {loading ? (
          // 高级流光骨架屏
          Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[118px] sm:w-40 lg:w-46 aspect-2/3 rounded-2xl shimmer-card border border-white/5"
            />
          ))
        ) : movies.length > 0 ? (
          movies.map((movie, idx) => (
            <RailPosterItem
              key={`${movie.id || movie.title || idx}-${movie.cover || ''}`}
              movie={movie}
              idx={idx}
              isPriority={isPriority}
              onMovieClick={onMovieClick}
            />
          ))
        ) : (
          <div className="py-8 text-center text-white/30 w-full">暂无推荐影片</div>
        )}
      </div>
    </section>
  );
}
