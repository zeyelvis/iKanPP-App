'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { PREBAKED_HOME_DATA, type PrebakedSubject, type TrendingNavItem } from '@/lib/data/home-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';

interface PosterImageProps {
  src: string;
  alt: string;
  className?: string;
  style?: React.CSSProperties;
  sizes?: string;
  priority?: boolean;
}

/**
 * 缩略图海报组件（支持代理与直连双通道容灾）
 */
function PosterImage({ src, alt, className = '', style, sizes = '100vw', priority = false }: PosterImageProps) {
  const [useDirect, setUseDirect] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUseDirect(false);
    setError(false);
    setLoaded(false);
  }, [src]);

  const proxiedSrc = getOptimizedImageUrl(src, { noFallback: true });
  const activeSrc = useDirect ? src : proxiedSrc;

  const handleImgError = () => {
    if (!useDirect && src && src.startsWith('http') && src !== proxiedSrc) {
      // 代理节点故障或超时，自动无缝重试原链接直连
      setUseDirect(true);
    } else {
      setError(true);
    }
  };

  if (error) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-white/5 ${className}`} style={style}>
        <span className="text-[10px] text-white/30">暂无海报</span>
      </div>
    );
  }

  return (
    <>
      {!loaded && <div className="absolute inset-0 bg-white/5 animate-pulse" />}
      <Image
        key={activeSrc}
        src={activeSrc || '/placeholder-poster.svg'}
        alt={alt}
        fill
        priority={priority}
        className={`${className} ${loaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-500`}
        style={style}
        sizes={sizes}
        unoptimized
        referrerPolicy="no-referrer"
        onLoad={() => setLoaded(true)}
        onError={handleImgError}
      />
    </>
  );
}

/**
 * 电影巨幕专属背景组件（双图层架构 + 多级容灾回退 + 即时氛围光晕，彻底根除偶发黑屏）
 */
function HeroBackdrop({
  backdrop,
  cover,
  title,
}: {
  backdrop?: string | null;
  cover?: string | null;
  title: string;
}) {
  // 构建候选重试容灾链：
  // 1. 代理优化版 Backdrop（高清横图）
  // 2. 原生 Backdrop 直连（避免边缘代理抖动）
  // 3. 代理优化版 Cover（海报大图降级）
  // 4. 原生 Cover 直连
  const candidates = useMemo(() => {
    const list: string[] = [];
    if (backdrop) {
      const optBackdrop = getOptimizedImageUrl(backdrop, { noFallback: true });
      list.push(optBackdrop);
      if (backdrop !== optBackdrop && backdrop.startsWith('http')) {
        list.push(backdrop);
      }
    }
    if (cover) {
      const optCover = getOptimizedImageUrl(cover, { noFallback: true });
      if (!list.includes(optCover)) list.push(optCover);
      if (cover !== optCover && cover.startsWith('http') && !list.includes(cover)) {
        list.push(cover);
      }
    }
    return list;
  }, [backdrop, cover]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [displaySrc, setDisplaySrc] = useState<string>('');
  const [prevSrc, setPrevSrc] = useState<string>('');

  const currentSrc = candidates[currentIndex] || '';

  useEffect(() => {
    setCurrentIndex(0);
    setLoaded(false);
  }, [backdrop, cover]);

  useEffect(() => {
    if (currentSrc && currentSrc !== displaySrc) {
      // 切换新图源时，将当前已加载的图像沉降为底衬 prevSrc，避免任何白屏、黑屏与闪烁
      if (displaySrc) {
        setPrevSrc(displaySrc);
      }
      setDisplaySrc(currentSrc);
      setLoaded(false);
    }
  }, [currentSrc, displaySrc]);

  const handleBackdropError = () => {
    // 当前源失败，无缝激活下一级容灾候选源（如：Backdrop -> Cover 海报）
    if (currentIndex + 1 < candidates.length) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handleLoaded = () => {
    setLoaded(true);
  };

  // 底层即时氛围图（用封面海报高斯模糊铺底，0秒呈现，彻底杜绝任何黑屏）
  const ambientSrc = cover ? getOptimizedImageUrl(cover) : (backdrop ? getOptimizedImageUrl(backdrop) : '');

  return (
    <div className="absolute inset-0 bg-[#0A0A0F] ambient-mesh-glow overflow-hidden select-none">
      {/* 1. 底层：即时电影色彩氛围层（极小体积海报 + 高斯模糊，0 秒呈现，彻底告别黑屏） */}
      {ambientSrc && (
        <div className="absolute inset-0 -m-8 pointer-events-none">
          <Image
            src={ambientSrc}
            alt=""
            fill
            sizes="100vw"
            unoptimized
            priority
            referrerPolicy="no-referrer"
            className="object-cover blur-3xl opacity-40 scale-125 saturate-150 transition-opacity duration-1000"
          />
        </div>
      )}

      {/* 2. 底层前一帧剧照（保留至新图完全加载，彻底根除切换瞬间的黑屏/闪烁） */}
      {prevSrc && prevSrc !== displaySrc && (
        <Image
          src={prevSrc}
          alt=""
          fill
          sizes="100vw"
          unoptimized
          priority
          referrerPolicy="no-referrer"
          className="object-cover scale-105"
          style={{ objectPosition: 'center 20%' }}
        />
      )}

      {/* 3. 顶层：当前最新巨幕高清剧照（支持多源自动容灾 + 极速双缓冲平滑淡入） */}
      {displaySrc && (
        <Image
          key={displaySrc}
          src={displaySrc}
          alt={title}
          fill
          priority
          sizes="100vw"
          unoptimized
          referrerPolicy="no-referrer"
          onLoad={handleLoaded}
          onError={handleBackdropError}
          className={`object-cover scale-105 transition-opacity duration-700 ease-out ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ objectPosition: 'center 20%' }}
        />
      )}

      {/* 4. 纯净极简电影级自然羽化系统（仅保留头部与底部自然平滑渐变，还原大片通透沉浸感） */}
      {/* 顶部自然防眩羽化：柔和保护全透明浮动 Navbar 文字与搜索框，向下自然淡出 */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: '180px',
          background: 'linear-gradient(to bottom, rgba(10, 10, 15, 0.88) 0%, rgba(10, 10, 15, 0.5) 45%, rgba(10, 10, 15, 0.15) 75%, transparent 100%)',
        }}
      />

      {/* 底部自然平滑羽化：向上优雅延展约 320px，刚好柔和托衬贴底控制栏，并与下方页面无缝融合 */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '320px',
          background: 'linear-gradient(to top, #0A0A0F 0%, rgba(10, 10, 15, 0.95) 25%, rgba(10, 10, 15, 0.65) 55%, rgba(10, 10, 15, 0.18) 82%, transparent 100%)',
        }}
      />
      {/* 底边极细纯黑衔接层：确保底部边缘与下方内容轨道色值完全一致 */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none"
        style={{
          height: '60px',
          background: 'linear-gradient(to top, #0A0A0F 0%, rgba(10, 10, 15, 0.85) 60%, transparent 100%)',
        }}
      />
    </div>
  );
}

interface HeroSlideshowProps {
  contentType?: 'all' | 'movie' | 'tv' | 'anime' | 'variety' | 'short' | 'documentary';
  onSearch?: (query: string) => void;
  customHeroMovies?: PrebakedSubject[];
  onMovieClick?: (movie: PrebakedSubject) => void;
  badgeTitle?: string;
  compact?: boolean;
  trendingNav?: TrendingNavItem[];
}

export function HeroSlideshow({
  contentType = 'all',
  onSearch,
  customHeroMovies,
  onMovieClick,
  badgeTitle,
  compact = false,
  trendingNav,
}: HeroSlideshowProps) {
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
        const tmdbType = contentType === 'movie' ? 'movie' : 'tv';
        const res = await fetch('/api/tmdb/trending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items, type: tmdbType }),
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

  const activeTrendingNav = trendingNav || (PREBAKED_HOME_DATA as any)[contentType]?.trendingNav || (contentType === 'all' ? PREBAKED_HOME_DATA.all?.trendingNav : undefined);

  const handleTrendingClick = (item: TrendingNavItem) => {
    // 独立追更速报：直接进入播放/详情页，绝不切换顶栏焦点轮播大图，与爱壹帆原生体验保持一致
    if (onMovieClick) {
      onMovieClick({ title: item.title, id: item.title, rate: '', cover: '' });
    } else {
      router.push(`/title/${generateSlug(item.title)}`);
    }
  };

  const handleMovieClick = (movie: any) => {
    if (onMovieClick) {
      onMovieClick(movie);
      return;
    }
    router.push(`/title/${generateSlug(movie.title)}`);
  };

  if (currentData.length === 0) {
    return (
      <div className={`relative w-full ${compact ? 'h-[50vh] sm:h-[58vh] lg:h-[64vh]' : 'h-[52vh] sm:h-[62vh] lg:h-[70vh]'} max-h-180 rounded-2xl sm:rounded-3xl overflow-hidden bg-white/5 animate-pulse mb-8 border border-white/5`} />
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

  // 智能预加载上一部与下一部大片的巨幕背景与海报，实现切换瞬间 0 延迟秒开
  useEffect(() => {
    if (typeof window === 'undefined' || currentData.length <= 1) return;
    const nextIdx = (activeIndex + 1) % currentData.length;
    const prevIdx = (activeIndex - 1 + currentData.length) % currentData.length;

    [nextIdx, prevIdx].forEach(idx => {
      const item = currentData[idx];
      if (!item) return;
      const targetBackdrop = item.backdrop || backdrops[item.title] || item.cover;
      if (targetBackdrop) {
        const img = new window.Image();
        img.referrerPolicy = 'no-referrer';
        img.src = getOptimizedImageUrl(targetBackdrop, { noFallback: true });
      }
      if (item.cover) {
        const coverImg = new window.Image();
        coverImg.referrerPolicy = 'no-referrer';
        coverImg.src = getOptimizedImageUrl(item.cover, { noFallback: true });
      }
    });
  }, [activeIndex, currentData, backdrops]);

  return (
    <div
      className={`relative w-full ${
        compact
          ? 'h-[50vh] min-h-85 sm:h-[58vh] lg:h-[64vh] max-h-160 mb-6 sm:mb-8 rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden'
          : 'h-[68vh] min-h-140 sm:h-[75vh] lg:h-[82vh] max-h-210 mb-0 overflow-hidden'
      } group select-none`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 1. 全景大图背景与自适应光晕（双图层 + 多级容灾回退 + 氛围光垫底，彻底根治偶发黑屏） */}
      <HeroBackdrop
        backdrop={active.backdrop || backdrops[active.title] || active.cover}
        cover={active.cover}
        title={active.title}
      />

      {/* 3. 巨幕内容排版：爱壹帆 1:1 经典三栏布局（整体贴齐图片最下方边缘） */}
      <div className="absolute inset-x-0 bottom-0 z-20 w-full flex flex-col justify-end pb-3 sm:pb-4 lg:pb-5 pointer-events-none">
        <div className="fluid-container">
          <div className="iyf-hero-bar pointer-events-auto">
            
            {/* 1. 左栏：大片主标题与评分在上方相对放大，放大的播放按钮在下方与推荐严格对齐，固定物理宽度彻底杜绝中栏受挤压漂移 */}
            <div className="shrink-0 w-[220px] xl:w-[250px] flex flex-col items-start justify-end">
              {/* 上方：相对放大、极具视觉冲击力的大片片名与评分，固定高度绝对零抖动 */}
              <div className="mb-3 sm:mb-4 w-full">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-[40px] font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] mb-1.5 sm:mb-2 truncate leading-tight h-9 sm:h-11 lg:h-12 flex items-center">
                  {active.title}
                </h2>
                <div className="text-white/90 text-sm sm:text-base font-medium flex items-center gap-2 whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] h-6">
                  <span className="truncate">{active.episodes_info || (active.types && active.types.length > 0 ? active.types.join(' · ') : '电影 · 剧情')}</span>
                  {active.rate && parseFloat(active.rate) > 0 && (
                    <span className="text-amber-400 font-bold text-sm sm:text-base flex items-center gap-0.5 shrink-0">★ {active.rate}</span>
                  )}
                </div>
              </div>

              {/* 下方：放大后的流媒体播放大按钮（高度约 50-52px，与右侧双排推荐在纵向与底线上精准对齐） */}
              <button
                type="button"
                onClick={() => handleMovieClick(active)}
                className="inline-flex items-center justify-center gap-2 px-6 py-2.5 sm:px-6.5 sm:py-3 bg-white/20 hover:bg-white/35 active:scale-95 backdrop-blur-md text-white rounded-full text-base sm:text-lg font-bold border border-white/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-all cursor-pointer hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:border-white/60 hover:scale-102"
              >
                <span>立即播放</span>
                <span className="text-sm sm:text-base">▷</span>
              </button>
            </div>

            {/* 2. 中栏：爱壹帆同款高频热播追更速报列表（底部居中对齐，自适应舒展间距，独立纯净展示不与轮播大图联动） */}
            {activeTrendingNav && activeTrendingNav.length > 0 && (
              <div className="hidden lg:flex flex-1 justify-center items-end px-3 pb-1">
                <div
                  className="grid grid-rows-2 items-center gap-x-3.5 xl:gap-x-5 gap-y-2 xl:gap-y-2.5 max-w-fit"
                  style={{ gridTemplateColumns: 'repeat(6, auto)' }}
                >
                  {activeTrendingNav.slice(0, 12).map((item: TrendingNavItem, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleTrendingClick(item)}
                      className="group flex items-center justify-start text-left cursor-pointer text-white/80 hover:text-white hover:drop-shadow-[0_0_8px_rgba(255,255,255,0.5)] transition-colors duration-200 select-none"
                      title={`${item.title}${item.updateBadge ? ` (更新${item.updateBadge}集)` : ''}`}
                    >
                      <span className="text-[12.5px] xl:text-[13px] font-medium tracking-tight whitespace-nowrap leading-snug">
                        {item.title}
                      </span>
                      {item.updateBadge ? (
                        <span className="inline-flex items-center justify-center bg-[#E50914] text-white text-[9.5px] xl:text-[10px] font-bold rounded-xs px-1 py-0.2 min-w-3.5 h-3.5 leading-none ml-1 shrink-0 shadow-xs">
                          {item.updateBadge}
                        </span>
                      ) : null}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 移动端/平板专享中栏（双排横滑纯文字，同款舒展大字，独立纯净展示） */}
            {activeTrendingNav && activeTrendingNav.length > 0 && (
              <div className="grid lg:hidden grid-flow-col grid-rows-2 auto-cols-max overflow-x-auto gap-x-4 gap-y-2.5 px-2 py-1.5 scrollbar-none self-end">
                {activeTrendingNav.slice(0, 12).map((item: TrendingNavItem, idx: number) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleTrendingClick(item)}
                    className="flex items-center gap-1 text-xs sm:text-sm shrink-0 select-none text-white/80 active:text-white"
                  >
                    <span>{item.title}</span>
                    {item.updateBadge && (
                      <span className="bg-[#E50914] text-white text-[9px] font-bold rounded-xs px-1 py-0.2 min-w-3.5 leading-none">
                        {item.updateBadge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* 3. 右栏：爱壹帆同款完整轮播大片缩略海报卡片列表（饱满大尺寸海报，紧贴右侧安全视口绝不截断） */}
            <div className="hidden md:flex items-center gap-1 xl:gap-1.5 shrink-0 self-end p-1.5 rounded-xl bg-black/25 backdrop-blur-xs border border-white/10">
              {currentData.slice(0, 8).map((item, idx) => {
                const isSelected = idx === activeIndex;
                const cardSizeClass = currentData.length > 7
                  ? 'w-10 h-14.5 sm:w-10.5 sm:h-15.5 lg:w-11 lg:h-16 xl:w-[48px] xl:h-[68px]'
                  : 'w-11 h-15.5 sm:w-11.5 sm:h-16.5 lg:w-12 lg:h-17.5 xl:w-[52px] xl:h-[74px]';
                return (
                  <button
                    key={item.title ? `hero-thumb-${item.title}` : (item.id || idx)}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative ${cardSizeClass} rounded-lg overflow-hidden transition-[transform,border-color,box-shadow,opacity] duration-200 cursor-pointer border ${
                      isSelected
                        ? 'border-[#00D1FF] ring-2 ring-[#00D1FF]/70 scale-105 shadow-[0_0_14px_rgba(0,209,255,0.6)] z-10'
                        : 'border-white/10 opacity-70 hover:opacity-100 hover:scale-102 hover:border-white/30'
                    }`}
                    title={item.title}
                  >
                    <PosterImage
                      src={item.cover}
                      alt={item.title}
                      className="object-cover w-full h-full"
                      sizes="75px"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/50 to-transparent pt-3 pb-0.5 px-0.5">
                      <p className="text-[8.5px] xl:text-[9px] text-white/90 truncate text-center font-medium leading-tight">
                        {item.title}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      </div>

      {/* 4. 左右翻页箭头（加深对比度与高级毛玻璃，消除浮动干扰） */}
      {currentData.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goToPrev();
            }}
            aria-label="切换到上一部大片"
            className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full text-white/90 hover:text-white hover:scale-105 active:scale-90 border border-white/25 hover:border-white/50 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.7)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            style={{
              backgroundColor: 'rgba(10, 10, 15, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
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
            className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-12 sm:h-12 rounded-full text-white/90 hover:text-white hover:scale-105 active:scale-90 border border-white/25 hover:border-white/50 flex items-center justify-center transition-all duration-200 cursor-pointer shadow-[0_4px_24px_rgba(0,0,0,0.7)] hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]"
            style={{
              backgroundColor: 'rgba(10, 10, 15, 0.75)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
            </svg>
          </button>
        </>
      )}

      {/* 5. 分类页移动端指示条（仅在无 trendingNav 时展示） */}
      {(!activeTrendingNav || activeTrendingNav.length === 0) && (
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
      )}
    </div>
  );
}
