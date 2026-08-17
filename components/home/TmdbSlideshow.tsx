'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRankingData } from './hooks/useRankingData';
import { Icons } from '@/components/ui/Icon';

interface PosterImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
}

function PosterImage({ src, alt, className = '', style, sizes = '100vw', priority = false }: PosterImageProps) {
  const [error, setError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setError(false);
    setFallbackError(false);
    setLoaded(false);
  }, [src]);

  const proxiedSrc = src?.startsWith('http')
    ? `/api/img-proxy?url=${encodeURIComponent(src)}`
    : src;

  if (error && fallbackError) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-white/5 ${className}`} style={style}>
        <span className="text-xs text-white/30">暂无海报</span>
      </div>
    );
  }

  if (error) {
    return (
      <Image
        src="/placeholder-poster.svg"
        alt={alt}
        fill
        className={`object-cover ${className}`}
        style={style}
        sizes={sizes}
        unoptimized
        onError={() => setFallbackError(true)}
      />
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
      <Image
        src={proxiedSrc || '/placeholder-poster.svg'}
        alt={alt}
        fill
        priority={priority}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-700`}
        style={style}
        sizes={sizes}
        unoptimized
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={() => setError(true)}
      />
    </>
  );
}

interface HeroSlideshowProps {
  contentType: 'movie' | 'tv';
  onSearch?: (query: string) => void;
}

export function HeroSlideshow({ contentType, onSearch }: HeroSlideshowProps) {
  const router = useRouter();
  const { movieRanking, tvRanking, loading, fetchType } = useRankingData({ limit: 10 });
  const [activeIndex, setActiveIndex] = useState(0);
  const [backdrops, setBackdrops] = useState<Record<string, string | null>>({});
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const fetchedRef = useRef<string>('');

  const currentData = contentType === 'movie' ? movieRanking : tvRanking;

  useEffect(() => {
    setActiveIndex(0);
    fetchType(contentType);
  }, [contentType, fetchType]);

  // 获取 TMDB Backdrops
  useEffect(() => {
    if (currentData.length === 0) return;
    const key = contentType + currentData.map(m => m.id).join(',');
    if (fetchedRef.current === key) return;
    fetchedRef.current = key;

    const fetchBackdrops = async () => {
      try {
        const items = currentData.map(m => ({ title: m.title, year: m.year }));
        const res = await fetch('/api/tmdb/trending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, type: contentType }),
        });
        const data = await res.json();
        const bds: Record<string, string | null> = {};
        const raw = data.backdrops || {};
        for (const [title, val] of Object.entries(raw)) {
          if (val && typeof val === 'object' && 'full' in (val as any)) {
            bds[title] = (val as any).full;
          } else if (typeof val === 'string') {
            bds[title] = val;
          } else {
            bds[title] = null;
          }
        }
        setBackdrops(bds);
      } catch {
        // 静默降级
      }
    };

    fetchBackdrops();
  }, [currentData, contentType]);

  // 自动轮播（每 7 秒切换一次，悬浮时暂停）
  useEffect(() => {
    if (isPaused || currentData.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % Math.min(currentData.length, 6));
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, currentData.length]);

  const handleMovieClick = (movie: any) => {
    const params = new URLSearchParams();
    params.set('title', movie.title);
    params.set('type', contentType);
    router.push(`/player?${params.toString()}`);
  };

  if (loading || currentData.length === 0) {
    return (
      <div className="relative w-full h-[52vh] sm:h-[62vh] lg:h-[70vh] max-h-180 rounded-3xl overflow-hidden bg-white/5 animate-pulse mb-8 border border-white/5" />
    );
  }

  const active = currentData[activeIndex] || currentData[0];
  const activeBackdrop = backdrops[active.title] || active.cover;
  const displayItems = currentData.slice(0, 6);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;
    if (diff > 45) {
      // 向左滑 -> 下一张
      setActiveIndex(prev => (prev + 1) % Math.min(currentData.length, 6));
    } else if (diff < -45) {
      // 向右滑 -> 上一张
      setActiveIndex(prev => (prev - 1 + Math.min(currentData.length, 6)) % Math.min(currentData.length, 6));
    }
    setTouchStart(null);
  };

  return (
    <div
      className="relative w-full h-[58vh] min-h-97.5 sm:h-[64vh] lg:h-[72vh] max-h-187.5 rounded-3xl overflow-hidden mb-10 group select-none shadow-2xl border border-white/10"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. 全景大图背景 */}
      <div className="absolute inset-0 bg-[#0A0A0F] ambient-mesh-glow transition-all duration-1000 ease-out">
        <PosterImage
          src={activeBackdrop}
          alt={active.title}
          className="object-cover scale-105 transition-all duration-1000"
          style={{ objectPosition: 'center 20%' }}
          priority
        />

        {/* 2. 电影级三重暗黑渐变叠层 */}
        {/* 底部向上渐变（文字区与内容区无缝融合） */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0F] via-[#0A0A0F]/60 to-transparent" />
        {/* 左侧向右渐变（突出左下大字标题） */}
        <div className="absolute inset-0 bg-linear-to-r from-[#0A0A0F]/95 via-[#0A0A0F]/50 to-transparent" />
        {/* 顶部微暗渐变（保障 Navbar 识别度） */}
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-transparent" />
      </div>

      {/* 3. 巨幕内容排版 */}
      <div className="relative z-20 h-full fluid-container flex flex-col justify-end pb-8 sm:pb-12 pt-16">
        <div className="max-w-3xl">
          {/* 榜单热度与类型徽章 */}
          <div className="flex items-center gap-2 flex-wrap mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-linear-to-r from-red-600 to-amber-600 text-white text-xs font-black rounded-full shadow-lg">
              🔥 #{activeIndex + 1} 全网焦点热播
            </span>

            {active.rate && parseFloat(active.rate) > 0 ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-black/60 backdrop-blur-md text-amber-300 font-black text-xs rounded-full border border-amber-400/30">
                ★ 豆瓣 {active.rate}
              </span>
            ) : null}

            {active.types?.slice(0, 3).map((type: string, i: number) => (
              <span
                key={i}
                className="px-2.5 py-1 bg-white/10 backdrop-blur-md text-white/80 text-xs rounded-full border border-white/15"
              >
                {type}
              </span>
            ))}

            {active.year && (
              <span className="text-white/40 text-xs font-medium px-1">
                {active.year}
              </span>
            )}
          </div>

          {/* 巨幕超大片名 */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl mb-3 line-clamp-2">
            {active.title}
          </h1>

          {/* 剧情简介 */}
          {active.description && (
            <p className="text-white/70 text-xs sm:text-sm lg:text-base leading-relaxed line-clamp-2 sm:line-clamp-3 mb-6 max-w-2xl text-shadow">
              {active.description}
            </p>
          )}

          {/* 主创阵容 */}
          {(active.directors?.length || active.actors?.length) ? (
            <div className="hidden sm:flex items-center gap-4 text-xs text-white/50 mb-6 truncate">
              {active.directors?.length ? (
                <span>导演：<strong className="text-white/80 font-medium">{active.directors.join(' / ')}</strong></span>
              ) : null}
              {active.actors?.length ? (
                <span className="truncate">主演：<strong className="text-white/80 font-medium">{active.actors.slice(0, 3).join(' / ')}</strong></span>
              ) : null}
            </div>
          ) : null}

          {/* 操作按钮组 */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 w-full sm:w-auto">
            <button
              onClick={() => handleMovieClick(active)}
              className="flex-1 sm:flex-none justify-center px-5 sm:px-8 py-3 sm:py-3.5 bg-(--accent-color) hover:brightness-110 active:scale-95 text-white rounded-2xl text-xs sm:text-base font-bold flex items-center gap-2 shadow-2xl transition-all cursor-pointer hover:shadow-[0_0_25px_rgba(229,9,20,0.6)]"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              立即播放
            </button>

            {onSearch && (
              <button
                onClick={() => onSearch(active.title)}
                className="flex-1 sm:flex-none justify-center px-4 sm:px-6 py-3 sm:py-3.5 bg-white/10 hover:bg-white/20 active:scale-95 backdrop-blur-xl text-white rounded-2xl text-xs sm:text-base font-semibold flex items-center gap-1.5 sm:gap-2 border border-white/20 transition-all cursor-pointer"
              >
                <Icons.Search size={16} />
                全网搜源
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. 右下角快速切换指示器（缩略卡片 + 进度圆点） */}
      <div className="absolute right-4 sm:right-8 bottom-6 z-20 hidden md:flex items-center gap-2 bg-black/40 backdrop-blur-xl p-2 rounded-2xl border border-white/10">
        {displayItems.map((item, idx) => (
          <button
            key={item.id || idx}
            onClick={() => setActiveIndex(idx)}
            className={`relative w-12 h-16 rounded-xl overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
              idx === activeIndex
                ? 'border-(--accent-color) scale-110 shadow-lg'
                : 'border-transparent opacity-50 hover:opacity-100'
            }`}
          >
            <PosterImage src={item.cover} alt={item.title} className="object-cover" sizes="50px" />
          </button>
        ))}
      </div>

      {/* 移动端轮播指示点 */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex md:hidden items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full">
        {displayItems.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setActiveIndex(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === activeIndex ? 'w-5 bg-(--accent-color)' : 'w-1.5 bg-white/30'
            }`}
            aria-label={`切换到第 ${idx + 1} 张`}
          />
        ))}
      </div>
    </div>
  );
}
