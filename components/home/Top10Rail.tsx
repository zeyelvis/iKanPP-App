'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icon';

interface Top10Movie {
  id: string;
  title: string;
  cover: string;
  rate?: string;
  year?: string;
  types?: string[];
  description?: string;
}

interface Top10RailProps {
  title?: string;
  movies: Top10Movie[];
  loading?: boolean;
  onMovieClick: (movie: Top10Movie) => void;
  contentType: 'movie' | 'tv';
}

export function Top10Rail({
  title,
  movies,
  loading = false,
  onMovieClick,
  contentType,
}: Top10RailProps) {
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

  const top10List = movies.slice(0, 10);

  return (
    <section className="relative my-8 sm:my-12 group/top10">
      {/* 标题 */}
      <div className="flex items-center justify-between mb-4 px-1 sm:px-2">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">🏆</span>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            {title || `今日 TOP 10 · ${contentType === 'movie' ? '热门电影' : '热播剧集'}`}
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-red-600 text-white shadow-md">
              实时榜单
            </span>
          </h2>
        </div>
      </div>

      {/* 左右滚动箭头 */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-[55%] -translate-y-1/2 z-30 w-10 h-24 bg-black/75 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center rounded-r-xl transition-all duration-300 opacity-0 group-hover/top10:opacity-100 shadow-2xl cursor-pointer hover:w-12 border-y border-r border-white/10"
          aria-label="向左滚动"
        >
          <Icons.ChevronLeft size={24} />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-[55%] -translate-y-1/2 z-30 w-10 h-24 bg-black/75 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center rounded-l-xl transition-all duration-300 opacity-0 group-hover/top10:opacity-100 shadow-2xl cursor-pointer hover:w-12 border-y border-l border-white/10"
          aria-label="向右滚动"
        >
          <Icons.ChevronRight size={24} />
        </button>
      )}

      {/* 滑轨容器 */}
      <div
        ref={scrollRef}
        className="content-rail-scroll flex gap-2 sm:gap-4 overflow-x-auto pb-4 pt-1 px-1 sm:px-2 scroll-smooth items-center"
      >
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <div
              key={idx}
              className="shrink-0 w-[200px] sm:w-[240px] aspect-[16/10] rounded-2xl bg-white/5 animate-pulse"
            />
          ))
        ) : top10List.length > 0 ? (
          top10List.map((movie, idx) => {
            const proxiedCover = movie.cover?.startsWith('http')
              ? `/api/img-proxy?url=${encodeURIComponent(movie.cover)}`
              : movie.cover;

            return (
              <div
                key={movie.id || idx}
                onClick={() => onMovieClick(movie)}
                className="shrink-0 flex items-center cursor-pointer group select-none relative"
                style={{ width: 'clamp(190px, 20vw, 240px)' }}
              >
                {/* Netflix 风格超大立体镂空描边排名数字 */}
                <div className="top10-rank-number shrink-0 translate-x-3 sm:translate-x-4 z-10">
                  {idx + 1}
                </div>

                {/* 紧随的海报卡片 */}
                <div className="relative flex-1 aspect-[2/3] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-[var(--accent-color)]/60">
                  <Image
                    src={proxiedCover || '/placeholder-poster.svg'}
                    alt={movie.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    sizes="180px"
                    loading={idx < 4 ? 'eager' : 'lazy'}
                    unoptimized
                  />

                  {/* 评分 */}
                  {movie.rate && parseFloat(movie.rate) > 0 && (
                    <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10">
                      <Icons.Star size={11} className="text-amber-400 fill-amber-400" />
                      <span className="text-[11px] font-bold text-amber-300">{movie.rate}</span>
                    </div>
                  )}

                  {/* 悬停播放遮罩 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-2.5">
                    <p className="text-xs font-bold text-white line-clamp-1 mb-2">
                      {movie.title}
                    </p>
                    <button className="w-full py-1.5 bg-[var(--accent-color)] hover:brightness-110 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-md">
                      <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      播放
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-white/30 w-full">排行榜数据加载中...</div>
        )}
      </div>
    </section>
  );
}
