'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Icons } from '@/components/ui/Icon';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

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
  badge?: string;
  movies: Top10Movie[];
  loading?: boolean;
  onMovieClick: (movie: Top10Movie) => void;
  contentType: 'movie' | 'tv';
}

function Top10Item({
  movie,
  idx,
  onMovieClick,
}: {
  movie: Top10Movie;
  idx: number;
  onMovieClick: (movie: Top10Movie) => void;
}) {
  const [imageError, setImageError] = useState(false);
  const proxiedCover = getOptimizedImageUrl(movie.cover);
  const isDoubleDigit = idx + 1 >= 10;

  return (
    <div
      onClick={() => onMovieClick(movie)}
      className="shrink-0 flex items-center cursor-pointer group select-none relative pr-2 sm:pr-4"
    >
      {/* Netflix 风格超大立体镂空描边排名数字 */}
      <div
        className={`top10-rank-number shrink-0 translate-x-3 sm:translate-x-5 z-10 select-none ${
          isDoubleDigit ? 'is-double-digit tracking-[-0.15em]' : ''
        }`}
      >
        {idx + 1}
      </div>

      {/* 紧随的海报卡片：严格固定海报宽度与 2:3 纵横比，绝不被两位数字挤压变形 */}
      <div
        className="relative shrink-0 aspect-2/3 rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-(--accent-color)/60"
        style={{ width: 'clamp(120px, 32vw, 185px)' }}
      >
        {!imageError && proxiedCover ? (
          <Image
            src={proxiedCover}
            alt={movie.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            sizes="180px"
            loading={idx < 4 ? 'eager' : 'lazy'}
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          /* 定制艺术电影原木/胶片风封套：兜底杜绝破裂碎图 */
          <div className="w-full h-full p-3 flex flex-col justify-between items-center text-center bg-gradient-to-br from-[#1e1e2f] via-[#12131d] to-[#07070b] border border-white/5 select-none relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-red-600/10 rounded-full blur-xl pointer-events-none" />
            <div className="w-full flex items-center justify-between z-10">
              <span className="text-[9px] font-black tracking-widest text-white/30 uppercase">
                TOP {idx + 1}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1.5 my-auto z-10 px-1">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400/80 shadow-inner group-hover:scale-110 transition-transform">
                <Icons.Film size={18} />
              </div>
              <h4 className="text-xs sm:text-sm font-black text-white/90 line-clamp-3 leading-snug drop-shadow-md">
                {movie.title}
              </h4>
            </div>
            <div className="z-10 text-[9px] text-white/40 font-mono">
              {movie.year || '重磅大片'}
            </div>
          </div>
        )}

        {/* 冠亚季军专属尊贵角标 */}
        {idx === 0 && (
          <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-amber-500 to-yellow-300 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
            <span>👑 TOP 1</span>
          </div>
        )}
        {idx === 1 && (
          <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-slate-300 to-slate-100 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
            <span>🥈 TOP 2</span>
          </div>
        )}
        {idx === 2 && (
          <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-amber-700 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
            <span>🥉 TOP 3</span>
          </div>
        )}

        {/* 评分 */}
        {movie.rate && parseFloat(movie.rate) > 0 && (
          <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/10 z-20">
            <Icons.Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-amber-300">{movie.rate}</span>
          </div>
        )}

        {/* 悬停播放遮罩 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-2.5 z-30 pointer-events-none">
          <p className="text-xs font-bold text-white line-clamp-1 mb-2">
            {movie.title}
          </p>
          <button className="w-full py-1.5 bg-(--accent-color) hover:brightness-110 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 shadow-md cursor-pointer pointer-events-auto">
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            立即播放
          </button>
        </div>
      </div>
    </div>
  );
}

export function Top10Rail({
  title,
  badge,
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
            {title || (contentType === 'movie' ? '豆瓣一周电影口碑榜 TOP 10' : '豆瓣一周华语口碑剧集 TOP 10')}
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-linear-to-r from-emerald-600 via-teal-600 to-amber-600 text-white shadow-md flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              {badge || '豆瓣权威榜 · 每日自动更新'}
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
              className="shrink-0 aspect-2/3 rounded-2xl shimmer-card border border-white/5 ml-6 sm:ml-8"
              style={{ width: 'clamp(120px, 32vw, 185px)' }}
            />
          ))
        ) : top10List.length > 0 ? (
          top10List.map((movie, idx) => (
            <Top10Item
              key={movie.id || idx}
              movie={movie}
              idx={idx}
              onMovieClick={onMovieClick}
            />
          ))
        ) : (
          <div className="py-8 text-center text-white/30 w-full">排行榜数据加载中...</div>
        )}
      </div>
    </section>
  );
}
