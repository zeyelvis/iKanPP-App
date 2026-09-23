'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight, Film, Layers } from 'lucide-react';
import {
  CURATED_SHOWCASE_ITEMS,
  SHOWCASE_CATEGORIES,
  ShowcaseCategory,
  CuratedShowcaseItem,
} from '@/lib/data/curated-showcase';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

/**
 * 单张海报微型组件（原生高性能，带优雅防裂图与暗夜占位）
 */
function ShowcasePoster({
  src,
  alt,
  className = '',
}: {
  src?: string;
  alt: string;
  className?: string;
}) {
  const [error, setError] = useState(false);
  const proxiedSrc = src ? getOptimizedImageUrl(src) : null;

  return (
    <div
      className={`w-full h-full relative rounded-xl overflow-hidden bg-[#151722] border border-white/10 shrink-0 ${className}`}
    >
      {!error && proxiedSrc ? (
        <img
          src={proxiedSrc}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#151722] text-white/20 p-1">
          <Film className="w-4 h-4" />
        </div>
      )}
      {/* 表面微光反射层 */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-white/[0.04] pointer-events-none" />
    </div>
  );
}

/**
 * 首页常驻：官方策展 · 殿堂片单与深度意图专题超级聚合展台 (CollectionsRail)
 */
export function CollectionsRail() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [selectedCategory, setSelectedCategory] = useState<ShowcaseCategory>('全部');
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  // 依据当前选中的分类药丸动态过滤
  const filteredItems = selectedCategory === '全部'
    ? CURATED_SHOWCASE_ITEMS
    : CURATED_SHOWCASE_ITEMS.filter((item) => item.category === selectedCategory);

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
  }, [filteredItems]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  const handleSelectCategory = (cat: ShowcaseCategory) => {
    setSelectedCategory(cat);
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  if (!CURATED_SHOWCASE_ITEMS || CURATED_SHOWCASE_ITEMS.length === 0) return null;

  return (
    <section className="relative my-8 sm:my-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 头部标题与控制按钮 */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-white/60 tracking-wider uppercase mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <Layers className="w-3.5 h-3.5 text-white/70" />
            <span>官方策展 · 殿堂片单与意图专栏</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <span>高分口碑片单 · 深度意图策展</span>
            <span className="text-xs font-normal text-white/40 hidden md:inline tracking-normal">
              · 拒绝剧荒与注水，34 个主题一站式直达
            </span>
          </h2>
        </div>

        {/* 桌面端左右滚动按钮 */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="向左滚动"
            className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-20 disabled:pointer-events-none transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="向右滚动"
            className="w-8 h-8 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-20 disabled:pointer-events-none transition-all duration-200"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 分类筛选药丸胶囊栏 (Filter Pills) */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-3 mb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
        {SHOWCASE_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium shrink-0 transition-all duration-200 ${
                isActive
                  ? 'bg-white text-black font-semibold shadow-md shadow-white/10'
                  : 'bg-white/[0.04] text-white/60 hover:text-white hover:bg-white/10 border border-white/5'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 滑轨容器 */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
      >
        {filteredItems.map((item) => (
          <ShowcaseCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

/**
 * 展台卡片：宽画幅流媒体电影志展台
 */
function ShowcaseCard({ item }: { item: CuratedShowcaseItem }) {
  const p1 = item.posters[0];
  const p2 = item.posters[1] || p1;
  const p3 = item.posters[2] || p2;

  const isCollection = item.type === 'collection';

  return (
    <Link
      href={item.href}
      className="group shrink-0 w-[330px] sm:w-[400px] lg:w-[430px] h-[210px] sm:h-[220px] rounded-2xl bg-gradient-to-br from-[#161726]/90 via-[#11121c]/90 to-[#0c0d14]/95 border border-white/10 hover:border-white/25 p-4 sm:p-5 flex gap-4 sm:gap-5 justify-between select-none transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(0,0,0,0.55)] relative overflow-hidden"
    >
      {/* 顶部环境微光光晕 */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-red-500/10 via-purple-500/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-red-500/15 group-hover:via-purple-500/10 transition-colors" />

      {/* 左侧：策划信息与文案 */}
      <div className="flex-1 flex flex-col justify-between min-w-0 z-10">
        <div>
          {/* 顶部意图分类胶囊 */}
          <div className="flex items-center gap-2 mb-2 sm:mb-2.5">
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-[10px] sm:text-[11px] font-semibold text-white/80 inline-flex items-center gap-1 shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-red-400" />
              <span>{item.badge}</span>
            </span>
            <span className="text-[11px] text-white/40 font-mono tracking-tight shrink-0">
              {item.totalCount}部收录
            </span>
          </div>

          {/* 专题标题 */}
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-white transition-colors line-clamp-2 leading-snug tracking-tight mb-2">
            {item.title}
          </h3>

          {/* 策展点睛金句 */}
          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed tracking-normal font-normal">
            {item.quote}
          </p>
        </div>

        {/* 底部探索触达 */}
        <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-xs font-medium text-white/50 group-hover:text-white transition-colors">
          <span className="truncate">{isCollection ? '查看完整片单' : '深度专栏探索'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform text-white/40 group-hover:text-white" />
        </div>
      </div>

      {/* 右侧：3 张高清电影海报立体扇形叠层展台 (Cascading Overlap Deck) */}
      <div className="relative w-[124px] sm:w-[144px] h-full shrink-0 flex items-center justify-end z-10">
        {/* 第 3 张海报（最底）：向左错位，微倾斜，暗色景深 */}
        {p3 && (
          <div className="absolute right-[34px] sm:right-[40px] top-1/2 -translate-y-1/2 w-[74px] sm:w-[84px] h-[111px] sm:h-[126px] -rotate-6 brightness-75 transition-all duration-300 group-hover:-rotate-12 group-hover:-translate-x-2 z-10 shadow-lg shadow-black/80">
            <ShowcasePoster src={p3} alt={`${item.title} 剧照3`} />
          </div>
        )}

        {/* 第 2 张海报（中间）：居中微偏右，微正旋转 */}
        {p2 && (
          <div className="absolute right-[18px] sm:right-[20px] top-1/2 -translate-y-1/2 w-[78px] sm:w-[88px] h-[117px] sm:h-[132px] rotate-2 brightness-90 transition-all duration-300 group-hover:rotate-6 group-hover:translate-x-1 z-20 shadow-xl shadow-black/90">
            <ShowcasePoster src={p2} alt={`${item.title} 剧照2`} />
          </div>
        )}

        {/* 第 1 张主海报（顶层）：右侧正位，标准立绘，立体投影 */}
        {p1 && (
          <div className="relative w-[82px] sm:w-[92px] h-[123px] sm:h-[138px] z-30 shadow-[0_14px_30px_rgba(0,0,0,0.9)] border border-white/20 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-white/40">
            <ShowcasePoster src={p1} alt={`${item.title} 主海报`} />
          </div>
        )}
      </div>
    </Link>
  );
}
