'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { PREBAKED_HOME_DATA, type PrebakedSubject } from '@/lib/data/home-prebaked';

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

  const proxiedSrc = getOptimizedImageUrl(src);

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
  customHeroMovies?: PrebakedSubject[];
}

export function HeroSlideshow({ contentType, onSearch, customHeroMovies }: HeroSlideshowProps) {
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const [backdrops, setBackdrops] = useState<Record<string, string | null>>({});
  const [isPaused, setIsPaused] = useState(false);
  const fetchedRef = useRef<string>('');

  // 专属巨幕数据池：优先使用定制 Hero 影视（包含 4K 横版剧照与精美简介）
  const heroList = customHeroMovies && customHeroMovies.length > 0
    ? customHeroMovies
    : (PREBAKED_HOME_DATA[contentType]?.hero || []);
  const currentData = heroList;

  useEffect(() => {
    setActiveIndex(0);
  }, [contentType]);

  // 异步补充可能缺失的 Backdrop
  useEffect(() => {
    if (currentData.length === 0) return;
    const key = contentType + currentData.map(m => m.id).join(',');
    if (fetchedRef.current === key) return;
    fetchedRef.current = key;

    const fetchBackdrops = async () => {
      try {
        const needFetch = currentData.filter(m => !m.backdrop);
        if (needFetch.length === 0) return;

        const items = needFetch.map(m => ({ title: m.title, year: m.year }));
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

  // 切换辅助函数（支持循环与重置）
  const goToNext = useCallback(() => {
    if (currentData.length <= 1) return;
    setActiveIndex(prev => (prev + 1) % currentData.length);
  }, [currentData.length]);

  const goToPrev = useCallback(() => {
    if (currentData.length <= 1) return;
    setActiveIndex(prev => (prev - 1 + currentData.length) % currentData.length);
  }, [currentData.length]);

  // 自动轮播（每 7 秒切换一次，用户手动滑动或点击后智能重置完整 7 秒，悬停时暂停）
  useEffect(() => {
    if (isPaused || currentData.length <= 1) return;
    const timer = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % currentData.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [isPaused, currentData.length, activeIndex]);

  const handleMovieClick = (movie: any) => {
    const params = new URLSearchParams();
    params.set('title', movie.title);
    const resolvedType = movie.type || (movie.isSeries || (movie.types && movie.types.includes('连续剧')) || movie.episodes_info ? 'tv' : contentType);
    params.set('type', resolvedType);
    if (movie.year) params.set('year', String(movie.year));
    router.push(`/player?${params.toString()}`);
  };

  if (currentData.length === 0) {
    return (
      <div className="relative w-full h-[52vh] sm:h-[62vh] lg:h-[70vh] max-h-180 rounded-3xl overflow-hidden bg-white/5 animate-pulse mb-8 border border-white/5" />
    );
  }

  const active = currentData[activeIndex] || currentData[0];
  const activeBackdrop = active.backdrop || backdrops[active.title] || active.cover;
  const displayItems = currentData.slice(0, 8);

  // 优化移动端触控滑动：记录 X/Y 坐标，防止页面垂直滚动时误切，提升滑动灵敏度（门槛 30px）
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartRef.current = {
      x: e.targetTouches[0].clientX,
      y: e.targetTouches[0].clientY,
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const endX = e.changedTouches[0].clientX;
    const endY = e.changedTouches[0].clientY;
    const diffX = touchStartRef.current.x - endX;
    const diffY = touchStartRef.current.y - endY;
    touchStartRef.current = null;

    // 只有当横向滑动幅度明显大于垂直滑动幅度时，才触发切屏，体验如丝般顺滑
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 30) {
      if (diffX > 0) {
        goToNext();
      } else {
        goToPrev();
      }
    }
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
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight drop-shadow-2xl mb-4 sm:mb-6 line-clamp-2">
            {active.title}
          </h1>

          {/* 操作按钮组 */}
          <div className="flex items-center">
            <button
              onClick={() => handleMovieClick(active)}
              className="inline-flex items-center justify-center gap-2.5 px-7 py-3 sm:py-3.5 bg-(--accent-color) hover:brightness-110 active:scale-95 text-white rounded-full text-sm sm:text-base font-bold shadow-xl transition-all cursor-pointer hover:shadow-[0_0_25px_rgba(229,9,20,0.6)]"
            >
              <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              立即播放
            </button>
          </div>
        </div>
      </div>

      {/* 4. 左右微光翻页按键（单手随时秒切上一部/下一部，无需干等自动轮播） */}
      {currentData.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label="切换到上一部大片"
            className="absolute left-2.5 sm:left-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 text-white/80 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-xl hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToNext();
            }}
            aria-label="切换到下一部大片"
            className="absolute right-2.5 sm:right-5 top-1/2 -translate-y-1/2 z-30 w-8 h-8 sm:w-11 sm:h-11 rounded-full bg-black/40 hover:bg-black/70 active:scale-90 text-white/80 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all cursor-pointer shadow-xl hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </>
      )}

      {/* 5. 桌面端右下角快速切换指示器（缩略卡片 + 进度指示） */}
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

      {/* 6. 移动端大热区指示栏（支持手指精准点按，带 2/7 页码状态指示） */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex md:hidden items-center gap-0.5 bg-black/60 backdrop-blur-xl px-2 py-0.5 rounded-full border border-white/15 shadow-2xl">
        {displayItems.map((_, idx) => (
          <button
            key={idx}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setActiveIndex(idx);
            }}
            className="p-1.5 flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
            aria-label={`切换到第 ${idx + 1} 张`}
          >
            <span
              className={`block h-1.5 rounded-full transition-all duration-300 ${
                idx === activeIndex
                  ? 'w-5 bg-(--accent-color) shadow-[0_0_8px_rgba(229,9,20,0.9)]'
                  : 'w-1.5 bg-white/35 hover:bg-white/70'
              }`}
            />
          </button>
        ))}
        <span className="text-[10px] font-bold text-white/50 pl-1 pr-1 select-none font-mono">
          {activeIndex + 1}/{displayItems.length}
        </span>
      </div>
    </div>
  );
}
