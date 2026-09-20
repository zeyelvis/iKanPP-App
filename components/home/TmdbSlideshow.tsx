'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getOptimizedImageUrl, getFallbackProxiedImageUrl } from '@/lib/utils/image-utils';
import { PREBAKED_HOME_DATA, type PrebakedSubject, type TrendingNavItem } from '@/lib/data/home-prebaked';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

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
  const [useFallback, setUseFallback] = useState(false);
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setUseFallback(false);
    setError(false);
    setLoaded(false);
  }, [src]);

  const proxiedSrc = getOptimizedImageUrl(src, { noFallback: true });
  const fallbackSrc = proxiedSrc.includes('/api/img-proxy')
    ? (src.startsWith('http') ? src : proxiedSrc)
    : getFallbackProxiedImageUrl(src, { variant: 'thumb' });
  const activeSrc = useFallback ? fallbackSrc : proxiedSrc;

  const handleImgError = () => {
    if (!useFallback && activeSrc !== fallbackSrc) {
      // 当前通道失败（如海外局部防火墙阻断 Fastly 直连），自动无缝切入备用通道
      setUseFallback(true);
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
        decoding="async"
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
  isShortDrama = false,
}: {
  backdrop?: string | null;
  cover?: string | null;
  title: string;
  isShortDrama?: boolean;
}) {
  // 构建候选重试容灾链：
  // 1. 优化版 Backdrop（自适应地域路由）
  // 2. 强制 R2 镜像代理版 Backdrop（避开海外局部防火墙阻断）
  // 3. 原生 Backdrop 直连
  // 4. 优化版 Cover（海报大图降级）
  // 5. 强制 R2 镜像代理版 Cover
  const candidates = useMemo(() => {
    const list: string[] = [];
    if (backdrop) {
      const optBackdrop = getOptimizedImageUrl(backdrop, { variant: 'backdrop', noFallback: true });
      list.push(optBackdrop);
      const fallbackProxy = getFallbackProxiedImageUrl(backdrop, { variant: 'backdrop' });
      if (!list.includes(fallbackProxy)) list.push(fallbackProxy);
      if (backdrop !== optBackdrop && backdrop.startsWith('http') && !list.includes(backdrop)) {
        list.push(backdrop);
      }
    }
    if (cover) {
      const optCover = getOptimizedImageUrl(cover, { variant: 'poster', noFallback: true });
      if (!list.includes(optCover)) list.push(optCover);
      const fallbackProxyCover = getFallbackProxiedImageUrl(cover, { variant: 'poster' });
      if (!list.includes(fallbackProxyCover)) list.push(fallbackProxyCover);
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
          <img
            src={ambientSrc}
            alt=""
            className={`w-full h-full object-cover ${isShortDrama ? 'blur-3xl opacity-60 scale-125 saturate-150' : 'blur-3xl opacity-40 scale-125 saturate-150'} transition-opacity duration-1000`}
            loading="eager"
          />
        </div>
      )}

      {/* 2. 底层前一帧剧照（保留至新图完全加载，彻底根除切换瞬间的黑屏/闪烁；短剧模式下免除） */}
      {!isShortDrama && prevSrc && prevSrc !== displaySrc && (
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

      {/* 3. 顶层：当前最新巨幕高清剧照（非短剧模式下全景呈现） */}
      {!isShortDrama && displaySrc && (
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
      router.push(getTitleCanonicalHref(item));
    }
  };

  const handleMovieClick = (movie: any) => {
    if (onMovieClick) {
      onMovieClick(movie);
      return;
    }
    router.push(getTitleCanonicalHref(movie));
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
        isShortDrama={contentType === 'short'}
      />

      {/* 2. 方案 A：短剧专区原生 9:16 高清竖版海报居中立体浮雕呈现 */}
      {contentType === 'short' && (active.cover || active.backdrop) && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-28 sm:pb-32 lg:pb-36 z-15">
          <div className="relative w-[130px] h-[195px] sm:w-[170px] sm:h-[255px] lg:w-[210px] lg:h-[315px] rounded-2xl overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.95)] border border-white/30 ring-1 ring-white/20 transition-transform duration-500 hover:scale-103">
            <img
              src={active.cover || active.backdrop || ''}
              alt={active.title}
              className="w-full h-full object-cover"
              loading="eager"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/55 via-transparent to-black/10 pointer-events-none" />
            {active.rate && parseFloat(active.rate) > 0 && (
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-black/75 backdrop-blur-md rounded-full border border-amber-400/50 text-amber-400 font-bold text-xs flex items-center gap-1 shadow-lg">
                ★ {active.rate}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. 巨幕内容排版：爱壹帆 1:1 经典三栏布局（整体贴齐图片最下方边缘） */}
      <div className="absolute inset-x-0 bottom-0 z-20 w-full flex flex-col justify-end pb-3 sm:pb-4 lg:pb-5 pointer-events-none">
        <div className="fluid-container relative">
          <div className="iyf-hero-bar pointer-events-auto relative">
            
            {/* 1. 左栏：大气沉浸的大片标题与流媒体 CTA 播放大按钮（iPad/桌面自适应弹性宽度，单排完整呈现） */}
            <div className="shrink-0 w-full max-w-[280px] sm:max-w-[340px] lg:w-[260px] xl:w-[380px] 2xl:w-[480px] flex flex-col items-start justify-end">
              {/* 上方：固定高度弹性底对齐，片名单排完整呈现，统一至尊主标题大字号，容器物理尺寸恒定保证中栏零位移 */}
              <div className="mb-3 sm:mb-4 w-full h-[76px] sm:h-[88px] lg:h-[96px] flex flex-col justify-end overflow-visible">
                <h2 className="text-2xl sm:text-3xl lg:text-[26px] xl:text-3xl 2xl:text-4xl font-black text-white tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] mb-1 leading-tight whitespace-nowrap">
                  {active.title}
                </h2>
                <div className="text-white/90 text-sm sm:text-base font-medium flex items-center gap-2 whitespace-nowrap drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] h-6">
                  <span className="truncate">{active.episodes_info || (active.types && active.types.length > 0 ? active.types.join(' · ') : '电影 · 剧情')}</span>
                  {active.rate && parseFloat(active.rate) > 0 && (
                    <span className="text-amber-400 font-bold text-sm sm:text-base flex items-center gap-0.5 shrink-0">★ {active.rate}</span>
                  )}
                </div>
              </div>

              {/* 下方：流媒体播放大按钮（iPad与桌面高度协调，位置与底线恒定） */}
              <Link
                href={getTitleCanonicalHref(active)}
                prefetch={true}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 xl:px-6 xl:py-3 bg-white/20 hover:bg-white/35 active:scale-95 backdrop-blur-md text-white rounded-full text-sm sm:text-base xl:text-lg font-bold border border-white/30 shadow-[0_4px_24px_rgba(0,0,0,0.6)] transition-all cursor-pointer hover:shadow-[0_0_24px_rgba(255,255,255,0.35)] hover:border-white/60 hover:scale-102 shrink-0"
              >
                <span>立即播放</span>
                <span className="text-sm sm:text-base">▷</span>
              </Link>
            </div>

            {/* 2. 中栏：100% 绝对对齐爱壹帆官方各专区原生速报排布（iPad与大屏全尺寸自适应防变形） */}
            {activeTrendingNav && activeTrendingNav.length > 0 && (() => {
              // 根据爱壹帆官方各板块原生实际排版绝对对齐：
              // - 电影专区 (movie)、首页大厅 (all)、电视剧 (tv)、动漫频道 (anime): 12 席 (6 + 6 黄金对称)
              // - 综艺 (variety)、纪录片 (documentary): 8 席 (4 + 4 黄金对称，长片名从容呼吸)
              const isWide4 = contentType === 'variety' || contentType === 'documentary';
              const splitIdx = isWide4 ? 4 : 6;
              const line1 = activeTrendingNav.slice(0, splitIdx);
              const line2 = activeTrendingNav.slice(splitIdx);

              const renderItem = (item: TrendingNavItem, idx: number) => (
                <Link
                  key={idx}
                  href={getTitleCanonicalHref(item)}
                  prefetch={idx < 6}
                  className="group flex items-center justify-start text-left cursor-pointer text-white/90 hover:text-white hover:drop-shadow-[0_0_12px_rgba(255,255,255,0.75)] hover:scale-103 transition-all duration-200 select-none shrink-0"
                  title={`${item.title}${item.updateBadge ? ` (更新${item.updateBadge}集)` : ''}`}
                >
                  <span className={`font-bold tracking-tight whitespace-nowrap leading-snug truncate shrink-0 ${
                    isWide4
                      ? 'text-[12px] lg:text-[12.5px] xl:text-[14.5px] 2xl:text-[16px] max-w-[110px] lg:max-w-[130px] xl:max-w-[185px] 2xl:max-w-[220px]'
                      : 'text-[11px] lg:text-[11.5px] xl:text-[13px] 2xl:text-[14.5px] max-w-[74px] lg:max-w-[82px] xl:max-w-[120px] 2xl:max-w-[150px]'
                  }`}>
                    {item.title}
                  </span>
                  {item.updateBadge ? (
                    <span className="inline-flex items-center justify-center bg-[#E50914] text-white text-[8.5px] xl:text-[9.5px] 2xl:text-[10px] font-black rounded-xs px-1 py-0.2 min-w-3.5 h-3.5 leading-none ml-1 shrink-0 shadow-md">
                      {item.updateBadge}
                    </span>
                  ) : null}
                </Link>
              );

              return (
                <div className="hidden lg:flex flex-1 min-w-0 flex-col items-center justify-end px-2 xl:px-6 pb-1">
                  <div className="flex flex-col items-center gap-y-2 xl:gap-y-3 w-full max-w-fit">
                    <div className={`flex items-center justify-center whitespace-nowrap shrink-0 ${
                      isWide4
                        ? 'gap-x-3 lg:gap-x-4 xl:gap-x-8 2xl:gap-x-11'
                        : 'gap-x-2 lg:gap-x-2.5 xl:gap-x-5 2xl:gap-x-7'
                    }`}>
                      {line1.map(renderItem)}
                    </div>
                    <div className={`flex items-center justify-center whitespace-nowrap shrink-0 ${
                      isWide4
                        ? 'gap-x-3 lg:gap-x-4 xl:gap-x-8 2xl:gap-x-11'
                        : 'gap-x-2 lg:gap-x-2.5 xl:gap-x-5 2xl:gap-x-7'
                    }`}>
                      {line2.map((item: TrendingNavItem, idx: number) => renderItem(item, idx + splitIdx))}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* 3. 右栏：爱壹帆同款完整轮播大片缩略海报卡片列表（iPad与宽屏全自适应防挤压） */}
            <div className="hidden md:flex items-center gap-0.5 xl:gap-1.5 shrink-0 self-end p-1 xl:p-1.5 rounded-xl bg-black/25 backdrop-blur-xs border border-white/10 ml-auto lg:ml-0">
              {currentData.slice(0, 8).map((item, idx) => {
                const isSelected = idx === activeIndex;
                const cardSizeClass = currentData.length > 7
                  ? 'w-[36px] h-[52px] sm:w-[40px] sm:h-[58px] lg:w-[38px] lg:h-[54px] xl:w-[48px] xl:h-[70px] 2xl:w-[54px] 2xl:h-[78px]'
                  : 'w-[40px] h-[58px] sm:w-[44px] sm:h-[64px] lg:w-[42px] lg:h-[60px] xl:w-[52px] xl:h-[76px] 2xl:w-[60px] 2xl:h-[86px]';
                return (
                  <button
                    key={item.title ? `hero-thumb-${item.title}` : (item.id || idx)}
                    type="button"
                    onClick={() => setActiveIndex(idx)}
                    className={`group relative ${cardSizeClass} rounded-lg overflow-visible transition-[transform,border-color,box-shadow,opacity] duration-200 cursor-pointer border shrink-0 ${
                      isSelected
                        ? 'border-[#00D1FF] ring-2 ring-[#00D1FF]/70 scale-105 shadow-[0_0_14px_rgba(0,209,255,0.6)] z-10'
                        : 'border-white/10 opacity-75 hover:opacity-100 hover:scale-102 hover:border-white/30'
                    }`}
                    title={item.title}
                  >
                    {/* 悬停与激活时的全称气泡提示（绝对零死角保障） */}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-black/95 text-white text-[10.5px] xl:text-[11px] font-semibold px-2 py-0.5 rounded-md shadow-2xl border border-white/20 pointer-events-none z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                      {item.title}
                    </div>

                    {/* 海报卡片内容（圆角防溢出） */}
                    <div className="w-full h-full rounded-[7px] overflow-hidden relative">
                      <PosterImage
                        src={item.cover}
                        alt={item.title}
                        className="object-cover w-full h-full"
                        sizes="80px"
                      />
                      {/* 底部片名容器：彻底移除截断限制与省略号，根据字数自适应字号，片名 100% 逐字完整舒展呈现 */}
                      <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/95 via-black/80 to-transparent pt-3.5 pb-0.5 px-0.5 flex items-end justify-center z-10">
                        <p
                          className={`${
                            (item.title || '').length > 8
                              ? 'text-[8px] sm:text-[8.5px] lg:text-[9px] xl:text-[9.5px] leading-[1.06]'
                              : 'text-[8.5px] sm:text-[9px] lg:text-[9.5px] xl:text-[10px] leading-[1.12]'
                          } text-white/95 text-center font-medium tracking-tighter break-all w-full`}
                        >
                          {item.title}
                        </p>
                      </div>
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


    </div>
  );
}
