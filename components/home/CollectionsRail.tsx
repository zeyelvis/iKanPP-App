'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import {
  CURATED_COLLECTIONS,
  CuratedCollection,
} from '@/lib/data/collections-prebaked';

/**
 * 单张堆叠海报渲染层（带防裂图优雅兜底）
 */
function StackedPosterLayer({
  src,
  alt,
  className,
  priority = false,
}: {
  src?: string;
  alt: string;
  className: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);
  const proxiedSrc = src ? getOptimizedImageUrl(src) : '';

  return (
    <div className={`overflow-hidden rounded-2xl bg-[#141522] ${className}`}>
      {!error && proxiedSrc ? (
        <Image
          src={proxiedSrc}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 200px, 260px"
          loading={priority ? 'eager' : 'lazy'}
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-[#1a1b2e] via-[#11121d] to-[#0a0b12] p-2 text-center text-white/40">
          <Icons.Film size={20} className="mb-1 opacity-50" />
          <span className="text-[10px] line-clamp-1 font-mono">{alt}</span>
        </div>
      )}
    </div>
  );
}

/**
 * 3 层错位堆叠牌组卡片 (Stacked Deck Card)
 */
function CollectionDeckCard({
  collection,
  index,
}: {
  collection: CuratedCollection;
  index: number;
}) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);

  // 默认海报退避列表
  const p1 = collection.coverPosters[0] || collection.films[0]?.cover;
  const p2 = collection.coverPosters[1] || collection.films[1]?.cover || p1;
  const p3 = collection.coverPosters[2] || collection.films[2]?.cover || p2;

  const handleClick = () => {
    router.push(`/collection/${collection.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group/deck shrink-0 w-[220px] sm:w-[260px] lg:w-[280px] cursor-pointer select-none transition-transform duration-300 hover:-translate-y-1.5 focus:outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`片单：${collection.title}，收录 ${collection.totalCount} 部影片`}
    >
      {/* 牌组堆叠容器 */}
      <div className="relative w-full aspect-[3/4] pt-2 pr-4 pl-1 pb-1">
        {/* 背景氛围晕染发光 */}
        <div
          className={`absolute inset-0 rounded-3xl blur-2xl transition-opacity duration-500 pointer-events-none ${
            isHovered ? 'opacity-40' : 'opacity-0'
          }`}
          style={{
            background: `radial-gradient(circle at 50% 50%, ${collection.accent} 0%, transparent 70%)`,
          }}
        />

        {/* 第 3 层海报（最底层：小尺寸、深偏移、微模糊） */}
        <div
          className="absolute inset-x-2 top-0 bottom-4 transition-all duration-500 ease-out z-10"
          style={{
            transform: isHovered
              ? 'translate(20px, -8px) scale(0.92) rotate(4.5deg)'
              : 'translate(14px, -4px) scale(0.88) rotate(2deg)',
            opacity: isHovered ? 0.75 : 0.4,
            filter: isHovered ? 'blur(0px)' : 'blur(0.8px)',
          }}
        >
          <StackedPosterLayer
            src={p3}
            alt={`${collection.title} 第 3 封面`}
            className="w-full h-full border border-white/10 shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
          />
        </div>

        {/* 第 2 层海报（中间层：中尺寸、中偏移） */}
        <div
          className="absolute inset-x-1 top-1 bottom-3 transition-all duration-500 ease-out z-20"
          style={{
            transform: isHovered
              ? 'translate(10px, -4px) scale(0.96) rotate(2deg)'
              : 'translate(7px, -2px) scale(0.94) rotate(1deg)',
            opacity: isHovered ? 0.9 : 0.7,
          }}
        >
          <StackedPosterLayer
            src={p2}
            alt={`${collection.title} 第 2 封面`}
            className="w-full h-full border border-white/15 shadow-[0_10px_28px_rgba(0,0,0,0.65)]"
          />
        </div>

        {/* 第 1 层海报（顶层完整展示） */}
        <div
          className="relative w-[90%] aspect-[2/3] transition-all duration-500 ease-out z-30"
          style={{
            transform: isHovered ? 'scale(1.02)' : 'scale(1)',
          }}
        >
          <StackedPosterLayer
            src={p1}
            alt={collection.title}
            priority={index < 3}
            className="w-full h-full border border-white/20 shadow-[0_12px_32px_rgba(0,0,0,0.75)] group-hover/deck:border-white/40"
          />

          {/* 顶层高光遮罩与收录部数微标 */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

          {/* 右上角高质感磨砂玻璃计数 badge */}
          <div className="absolute top-2.5 right-2.5 z-40 px-2 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-1.5">
            <span className="text-xs">{collection.emoji}</span>
            <span className="text-[11px] font-bold text-white tracking-wide">
              {collection.totalCount}部
            </span>
          </div>

          {/* 左上角精选徽标 */}
          <div className="absolute top-2.5 left-2.5 z-40 px-2 py-0.5 rounded-md bg-gradient-to-r from-red-600/90 to-rose-600/90 text-[10px] font-black tracking-wider text-white uppercase shadow-md">
            {collection.badge}
          </div>

          {/* 悬停时的“立即探索”微浮层 */}
          <div
            className={`absolute inset-x-2 bottom-2 z-40 py-1.5 rounded-xl text-center text-xs font-bold text-white transition-all duration-300 flex items-center justify-center gap-1 shadow-lg ${
              isHovered
                ? 'opacity-100 translate-y-0'
                : 'opacity-0 translate-y-2 pointer-events-none'
            }`}
            style={{ backgroundColor: collection.accent }}
          >
            <span>进入片单</span>
            <Icons.ChevronRight size={13} />
          </div>
        </div>
      </div>

      {/* 底部信息文字 */}
      <div className="mt-2.5 px-1">
        <div className="flex items-center justify-between gap-1">
          <h3 className="text-sm sm:text-base font-bold text-white group-hover/deck:text-amber-400 transition-colors truncate">
            {collection.title}
          </h3>
          <span className="text-[11px] font-mono text-white/40 shrink-0">
            {collection.films.length} 部收录
          </span>
        </div>
        <p className="text-xs text-white/50 line-clamp-1 mt-0.5 leading-relaxed">
          {collection.subtitle}
        </p>
      </div>
    </div>
  );
}

/**
 * 首页常驻精选片单滑轨组件 (CollectionsRail)
 * 独立于分类 Tab，展示编辑精心策展的主题牌组
 */
export function CollectionsRail() {
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
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  return (
    <section className="relative my-10 sm:my-14 group/collections">
      {/* 顶部标题行与策展标识 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 mb-4 px-1 sm:px-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-amber-500/20 via-red-500/20 to-purple-500/20 border border-white/15 flex items-center justify-center text-xl shadow-inner">
            📚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-2xl font-black tracking-tight text-white">
                精选片单 · 官方策展
              </h2>
              <span className="text-[10px] sm:text-xs font-extrabold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/30 tracking-wider uppercase">
                CURATED
              </span>
            </div>
            <p className="text-xs sm:text-sm text-white/50 mt-0.5">
              深度主题策展与殿堂经典盘点，找片不迷路
            </p>
          </div>
        </div>

        {/* 提示文案 */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/40">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>8 大主题持续上新</span>
        </div>
      </div>

      {/* 左右翻页控制器 */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-[55%] -translate-y-1/2 z-40 w-10 h-28 bg-black/75 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center rounded-r-2xl transition-all duration-300 opacity-0 group-hover/collections:opacity-100 shadow-2xl cursor-pointer hover:w-12 border-y border-r border-white/15"
          aria-label="向左滚动片单"
        >
          <Icons.ChevronLeft size={24} />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-[55%] -translate-y-1/2 z-40 w-10 h-28 bg-black/75 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center rounded-l-2xl transition-all duration-300 opacity-0 group-hover/collections:opacity-100 shadow-2xl cursor-pointer hover:w-12 border-y border-l border-white/15"
          aria-label="向右滚动片单"
        >
          <Icons.ChevronRight size={24} />
        </button>
      )}

      {/* 横向滑轨容器 */}
      <div
        ref={scrollRef}
        className="content-rail-scroll flex gap-4 sm:gap-6 overflow-x-auto pt-2 pb-6 px-2 sm:px-3 scroll-smooth"
      >
        {CURATED_COLLECTIONS.map((collection, index) => (
          <CollectionDeckCard
            key={collection.id}
            collection={collection}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
