'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronLeft, ChevronRight, ArrowRight, Film } from 'lucide-react';
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
 * 展台卡片：宽画幅流媒体电影志展台（支持整卡/按钮 0ms 点击跳转与物理反馈）
 */
function ShowcaseCard({ item }: { item: CuratedShowcaseItem }) {
  const p1 = item.posters[0];
  const p2 = item.posters[1] || p1;
  const p3 = item.posters[2] || p2;

  const isCollection = item.type === 'collection';

  return (
    <Link
      href={item.href}
      prefetch={true}
      className="group shrink-0 w-[310px] sm:w-[350px] lg:w-[370px] h-[190px] sm:h-[195px] rounded-2xl bg-gradient-to-br from-[#161726]/95 via-[#11121c]/95 to-[#0b0c13]/98 border border-white/10 hover:border-amber-400/50 p-4 sm:p-4.5 flex gap-3.5 sm:gap-4 justify-between select-none transition-all duration-300 hover:-translate-y-1.5 active:scale-[0.98] hover:shadow-[0_16px_36px_rgba(0,0,0,0.65)] relative overflow-hidden cursor-pointer"
    >
      {/* 顶部环境微光光晕 */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-amber-500/10 via-red-500/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:from-amber-500/20 group-hover:via-red-500/10 transition-colors" />

      {/* 左侧：策划信息与文案 */}
      <div className="flex-1 flex flex-col justify-between min-w-0 z-10">
        <div>
          {/* 顶部意图分类胶囊 */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 rounded-full bg-white/[0.08] border border-white/10 text-[10px] sm:text-[11px] font-semibold text-amber-200/90 inline-flex items-center gap-1 shrink-0">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span>{item.badge}</span>
            </span>
            <span className="text-[11px] text-white/40 font-mono tracking-tight shrink-0">
              {item.totalCount}部收录
            </span>
          </div>

          {/* 专题标题 */}
          <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-300 transition-colors line-clamp-2 leading-snug tracking-tight mb-1.5">
            {item.title}
          </h3>

          {/* 策展点睛金句 */}
          <p className="text-xs text-white/50 line-clamp-2 leading-relaxed tracking-normal font-normal">
            {item.quote}
          </p>
        </div>

        {/* 底部探索触达：高辨识度实体胶囊 CTA 按钮 */}
        <div className="pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 group-hover:bg-amber-400 text-white/90 group-hover:text-black font-bold text-xs transition-all duration-300 shadow-sm group-hover:shadow-amber-500/20">
            <span>{isCollection ? '探索完整片单' : '深度专栏探索'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>

      {/* 右侧：3 张高清电影海报立体扇形叠层展台 (Cascading Overlap Deck) */}
      <div className="relative w-[116px] sm:w-[130px] h-full shrink-0 flex items-center justify-end z-10">
        {/* 第 3 张海报（最底）：向左错位，微倾斜，暗色景深 */}
        {p3 && (
          <div className="absolute right-[30px] sm:right-[34px] top-1/2 -translate-y-1/2 w-[68px] sm:w-[76px] h-[102px] sm:h-[114px] -rotate-6 brightness-75 transition-all duration-300 group-hover:-rotate-12 group-hover:-translate-x-1.5 z-10 shadow-lg shadow-black/80">
            <ShowcasePoster src={p3} alt={`${item.title} 剧照3`} />
          </div>
        )}

        {/* 第 2 张海报（中间）：居中微偏右，微正旋转 */}
        {p2 && (
          <div className="absolute right-[15px] sm:right-[17px] top-1/2 -translate-y-1/2 w-[72px] sm:w-[80px] h-[108px] sm:h-[120px] rotate-2 brightness-90 transition-all duration-300 group-hover:rotate-6 group-hover:translate-x-1 z-20 shadow-xl shadow-black/90">
            <ShowcasePoster src={p2} alt={`${item.title} 剧照2`} />
          </div>
        )}

        {/* 第 1 张主海报（顶层）：右侧正位，标准立绘，立体投影 */}
        {p1 && (
          <div className="relative w-[76px] sm:w-[84px] h-[114px] sm:h-[126px] z-30 shadow-[0_12px_28px_rgba(0,0,0,0.9)] border border-white/20 rounded-xl overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400/50">
            <ShowcasePoster src={p1} alt={`${item.title} 主海报`} />
          </div>
        )}
      </div>
    </Link>
  );
}

/**
 * 首页常驻：官方策展 · 殿堂片单与深度意图专题超级聚合展台 (CollectionsRail)
 * 100% 严丝合缝融入 fluid-container，左右边距与上下货架严格像素级对齐
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
    <section className="relative my-8 sm:my-10 group/curated">
      {/* 头部标题栏：严格左对齐，与全站货架像素级统一 */}
      <div className="flex items-center justify-between mb-3 px-1 sm:px-2">
        <div className="flex items-center gap-2.5">
          <span className="text-xl sm:text-2xl">✨</span>
          <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white flex flex-wrap items-center gap-2 sm:gap-2.5">
            <span>高分口碑片单 · 深度意图策展</span>
            <span className="text-[10px] sm:text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gradient-to-r from-red-600/20 via-purple-600/20 to-amber-600/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              官方深度策展 · 34个主题一站直达
            </span>
          </h2>
        </div>
      </div>

      {/* 分类筛选药丸胶囊栏 (Filter Pills)：左对齐舒展排列 */}
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 mb-3 px-1 sm:px-2">
        {SHOWCASE_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleSelectCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium shrink-0 transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-amber-400 text-black font-bold shadow-md shadow-amber-400/20 scale-105'
                  : 'bg-white/5 text-white/70 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* 左右滑动控制箭头（与 ContentRail / Top10Rail 100% 保持完全相同的悬浮半透胶囊体验） */}
      {canScrollLeft && (
        <button
          onClick={() => handleScroll('left')}
          className="absolute left-0 top-[55%] -translate-y-1/2 z-30 w-10 h-24 bg-black/75 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center rounded-r-xl transition-all duration-300 opacity-0 group-hover/curated:opacity-100 shadow-2xl cursor-pointer hover:w-12 border-y border-r border-white/10"
          aria-label="向左滚动"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={() => handleScroll('right')}
          className="absolute right-0 top-[55%] -translate-y-1/2 z-30 w-10 h-24 bg-black/75 hover:bg-black/90 backdrop-blur-md text-white flex items-center justify-center rounded-l-xl transition-all duration-300 opacity-0 group-hover/curated:opacity-100 shadow-2xl cursor-pointer hover:w-12 border-y border-l border-white/10"
          aria-label="向右滚动"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* 滑轨容器：严格 px-1 sm:px-2，与全局流式网格 100% 对齐 */}
      <div
        ref={scrollRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto scrollbar-none pb-4 pt-1 px-1 sm:px-2 scroll-smooth"
      >
        {filteredItems.map((item) => (
          <ShowcaseCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
