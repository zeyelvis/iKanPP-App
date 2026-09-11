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
 * 单张平整海报层（带安全降级）
 */
function DeckPosterItem({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);
  const proxiedSrc = getOptimizedImageUrl(src);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#161724]">
      {!error && proxiedSrc ? (
        <Image
          src={proxiedSrc}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 120px, 140px"
          loading={priority ? 'eager' : 'lazy'}
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#151726] text-white/30 p-1">
          <Icons.Film size={18} />
        </div>
      )}
    </div>
  );
}

/**
 * 原型图同款水平阶梯叠层卡片 (Horizontal Cascading Deck Card)
 */
function CascadeDeckCard({
  collection,
  index,
}: {
  collection: CuratedCollection;
  index: number;
}) {
  const router = useRouter();

  const p1 = collection.coverPosters[0];
  const p2 = collection.coverPosters[1] || p1;
  const p3 = collection.coverPosters[2] || p2;

  const handleClick = () => {
    router.push(`/collection/${collection.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group/card shrink-0 w-[156px] sm:w-[210px] lg:w-[242px] cursor-pointer select-none transition-transform duration-200 hover:-translate-y-1 focus:outline-none"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
      aria-label={`片单：${collection.title}`}
    >
      {/* 海报组合容器：主海报 100% 严格对齐全局货架尺寸 (w-[118px] sm:w-40 lg:w-46 aspect-2/3) */}
      <div className="relative">
        {/* 右上角极简数量标：与原型图一致的纯粹 +15 */}
        <div className="absolute top-0 right-0 z-40 text-xs sm:text-sm font-semibold text-white/90 font-mono tracking-tight select-none">
          +{collection.totalCount}
        </div>

        {/* 第 3 张海报（最底、最右）：严格 aspect-2/3，上下略微收敛 6px，右侧清晰露出 */}
        <div className="absolute left-[36px] sm:left-[48px] lg:left-[56px] top-[6px] bottom-[6px] w-[118px] sm:w-40 lg:w-46 rounded-2xl overflow-hidden border border-white/10 brightness-90 transition-transform duration-300 group-hover/card:translate-x-1.5 z-10">
          <DeckPosterItem src={p3} alt={`${collection.title} 海报3`} />
        </div>

        {/* 第 2 张海报（中间）：严格 aspect-2/3，上下微收 3px，右侧清晰露出 */}
        <div className="absolute left-[18px] sm:left-[24px] lg:left-[28px] top-[3px] bottom-[3px] w-[118px] sm:w-40 lg:w-46 rounded-2xl overflow-hidden border border-white/10 shadow-[3px_0_12px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover/card:translate-x-1 z-20">
          <DeckPosterItem src={p2} alt={`${collection.title} 海报2`} />
        </div>

        {/* 第 1 张主海报（最前、最左）：与全站所有货架海报尺寸像素级绝对统一！ */}
        <div className="relative w-[118px] sm:w-40 lg:w-46 aspect-2/3 rounded-2xl overflow-hidden border border-white/10 shadow-[0_6px_20px_rgba(0,0,0,0.5)] z-30 group-hover/card:border-white/25 transition-colors">
          <DeckPosterItem
            src={p1}
            alt={collection.title}
            priority={index < 4}
          />
        </div>
      </div>

      {/* 底部标题：与全站货架标题尺寸排版完全一致 */}
      <div className="mt-2 sm:mt-2.5 px-0.5">
        <h3 className="text-xs sm:text-sm font-medium text-white/80 truncate group-hover/card:text-white transition-colors leading-snug">
          {collection.title}
        </h3>
      </div>
    </div>
  );
}

/**
 * 首页常驻精选片单滑轨组件 (CollectionsRail)
 * 100% 像素级对齐原型设计：精致渐变多边形图标 + 纯粹「片单」标题 + 水平平直阶梯卡组
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
    <section className="relative my-8 sm:my-10 group/collections">
      {/* 标题行：原型图同款渐变斜切多边形徽标 + 「片单」大字 */}
      <div className="flex items-center gap-2.5 mb-3 px-1 sm:px-2">
        <div className="w-5 h-5 flex items-center justify-center shrink-0">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M5 4.5L14 3L11.5 13L2.5 14.5L5 4.5Z"
              fill="url(#deck-grad-1)"
            />
            <path
              d="M12.5 10.5L21.5 9L19 19.5L10 21L12.5 10.5Z"
              fill="url(#deck-grad-2)"
            />
            <defs>
              <linearGradient
                id="deck-grad-1"
                x1="2.5"
                y1="3"
                x2="14"
                y2="14.5"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#EC4899" />
                <stop offset="1" stopColor="#8B5CF6" />
              </linearGradient>
              <linearGradient
                id="deck-grad-2"
                x1="10"
                y1="9"
                x2="21.5"
                y2="21"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#6366F1" />
                <stop offset="1" stopColor="#06B6D4" />
              </linearGradient>
            </defs>
          </svg>
        </div>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          片单
        </h2>
      </div>

      {/* 左右翻页控制器 */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-[55%] -translate-y-1/2 z-40 w-10 h-24 bg-black/75 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center rounded-r-xl transition-all duration-300 opacity-0 group-hover/collections:opacity-100 shadow-2xl cursor-pointer hover:w-12 border-y border-r border-white/15"
          aria-label="向左滚动片单"
        >
          <Icons.ChevronLeft size={24} />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-[55%] -translate-y-1/2 z-40 w-10 h-24 bg-black/75 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center rounded-l-xl transition-all duration-300 opacity-0 group-hover/collections:opacity-100 shadow-2xl cursor-pointer hover:w-12 border-y border-l border-white/15"
          aria-label="向右滚动片单"
        >
          <Icons.ChevronRight size={24} />
        </button>
      )}

      {/* 横向滑轨容器 */}
      <div
        ref={scrollRef}
        className="content-rail-scroll flex gap-4 sm:gap-6 overflow-x-auto pt-1 pb-4 px-1 sm:px-2 scroll-smooth"
      >
        {CURATED_COLLECTIONS.map((collection, index) => (
          <CascadeDeckCard
            key={collection.id}
            collection={collection}
            index={index}
          />
        ))}
      </div>
    </section>
  );
}
