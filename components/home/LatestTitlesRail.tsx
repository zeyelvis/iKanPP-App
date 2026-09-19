'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icon';
import { getOptimizedImageUrl, getFallbackProxiedImageUrl } from '@/lib/utils/image-utils';
import { generateSlug, isCleanChineseTitle } from '@/lib/data/entities/entity-utils';
import { RecentTitleItem } from '@/lib/services/entity-kv';

interface LatestTitlesRailProps {
  type?: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string;
  title?: string;
  subtitle?: string;
  className?: string;
}

function formatRelativeTime(isoString?: string): string {
  if (!isoString) return '实时入库';
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    if (diff < 0) return '刚刚入库';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours <= 0) return '刚刚入库';
    if (hours < 24) return `${hours}小时前`;
    const days = Math.floor(hours / 24);
    if (days === 1) return '昨日入库';
    if (days < 7) return `${days}天前`;
    return '本周新片';
  } catch {
    return '最新入库';
  }
}

function LatestPosterCard({
  item,
  idx,
  isShort = false,
}: {
  item: RecentTitleItem;
  idx: number;
  isShort?: boolean;
}) {
  const [imageError, setImageError] = useState(false);
  const [useProxyFallback, setUseProxyFallback] = useState(false);

  const initialCover = getOptimizedImageUrl(item.cover, { variant: 'poster' });
  const proxiedCover = useProxyFallback
    ? getFallbackProxiedImageUrl(item.cover, { variant: 'poster' })
    : initialCover;

  useEffect(() => {
    setImageError(false);
    setUseProxyFallback(false);
  }, [item.cover]);

  const handleImageError = () => {
    if (!useProxyFallback && item.cover?.startsWith('http') && !initialCover.includes('/api/img-proxy')) {
      setUseProxyFallback(true);
    } else {
      setImageError(true);
    }
  };

  const isShortDrama = isShort || item.type === 'short' || item.channelKey === 'short';
  const targetHref = isShortDrama
    ? `/short/player?${new URLSearchParams({
        title: item.title,
        poster: item.cover || '',
      }).toString()}`
    : `/title/${generateSlug(item.title)}`;
  const relativeTime = formatRelativeTime(item.createdAt);
  const statusBadge = item.updateBadge || relativeTime;
  const displayGenre = item.genres?.[0] || (isShortDrama ? '短剧' : item.type === 'movie' ? '电影' : '剧集');

  return (
    <Link
      href={targetHref}
      prefetch={idx < 4}
      className="cinema-poster-card shrink-0 w-[122px] sm:w-42 lg:w-48 cursor-pointer group/card select-none block"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '168px 250px' }}
    >
      {/* 海报卡片 */}
      <div className="relative aspect-2/3 rounded-2xl overflow-hidden bg-white/5 border border-emerald-500/20 shadow-[0_8px_24px_rgba(0,0,0,0.4)] group-hover/card:border-emerald-400/60 group-hover/card:shadow-[0_10px_30px_rgba(16,185,129,0.15)] transition-all duration-300">
        {!imageError && proxiedCover ? (
          <Image
            src={proxiedCover}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-500 group-hover/card:scale-108"
            sizes="(max-width: 640px) 122px, (max-width: 1024px) 168px, 192px"
            loading="lazy"
            decoding="async"
            unoptimized
            referrerPolicy="no-referrer"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full p-3 flex flex-col justify-between items-center text-center bg-gradient-to-br from-[#0c1f17] via-[#091510] to-[#040907] border border-emerald-900/30 select-none relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            <div className="z-10 mt-3 text-emerald-400/80">
              <span className="text-xl">🎬</span>
            </div>
            <div className="z-10 px-1">
              <p className="text-xs font-bold text-emerald-100/90 line-clamp-2 leading-tight">
                {item.title}
              </p>
            </div>
            <div className="z-10 text-[9px] text-emerald-400/50 font-mono">
              {item.year || '2026'}
            </div>
          </div>
        )}

        {/* 动态脉搏 NEW 与发行平台角标 */}
        <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex items-center gap-1 z-20">
          <div className="bg-black/85 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-500/40 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[9px] sm:text-[10px] font-black text-emerald-300 tracking-wider">
              NEW
            </span>
          </div>
          {item.platformBadge ? (
            <div className="bg-amber-500/20 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center border border-amber-400/40 shadow-md">
              <span className="text-[9px] font-bold text-amber-300">
                {item.platformBadge}
              </span>
            </div>
          ) : null}
        </div>

        {/* 规格画质与评分角标 */}
        <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-1 z-20">
          {item.qualityBadge ? (
            <div className="bg-emerald-950/80 backdrop-blur-md px-1.5 py-0.5 rounded-full flex items-center border border-emerald-500/50 shadow-md">
              <span className="text-[9px] font-black text-emerald-300 font-mono">
                {item.qualityBadge}
              </span>
            </div>
          ) : null}
          {item.rate && parseFloat(item.rate) > 0 ? (
            <div className="bg-black/80 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/15 shadow-md">
              <Icons.Star size={10} className="text-amber-400 fill-amber-400" />
              <span className="text-[10px] sm:text-[11px] font-black text-amber-300">
                {item.rate}
              </span>
            </div>
          ) : null}
        </div>

        {/* 底部悬浮更新状态与相对时间条 */}
        <div className="absolute bottom-1.5 left-1.5 right-1.5 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-md border border-white/10 z-20 flex items-center justify-between gap-1">
          <span className="text-[9px] sm:text-[10px] text-emerald-300 font-semibold truncate max-w-[70%]">
            {statusBadge}
          </span>
          <span className="text-[8px] sm:text-[9px] text-white/50 font-mono shrink-0">
            {relativeTime}
          </span>
        </div>

        {/* 悬停播放光效 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-2.5 sm:p-3 z-30 pointer-events-none">
          <div className="w-full py-1.5 sm:py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg active:scale-95 transition-all pointer-events-auto">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            立即观看
          </div>
        </div>
      </div>

      {/* 底部标题与年份 */}
      <div className="mt-1.5 sm:mt-2 px-0.5">
        <h3 className="text-xs sm:text-sm font-semibold text-white/90 truncate group-hover/card:text-emerald-400 transition-colors leading-snug">
          {item.title}
        </h3>
        <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-white/40 mt-0.5 font-medium">
          <span>{item.year || '2026'}</span>
          <span className="text-emerald-400/70 font-mono text-[9px]">{displayGenre}</span>
        </div>
      </div>
    </Link>
  );
}

export default function LatestTitlesRail({
  type,
  title = '🆕 最新上线 · 实时收录',
  subtitle = '全网源站自动巡检增量入库',
  className = '',
}: LatestTitlesRailProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [items, setItems] = useState<RecentTitleItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const CACHE_KEY = `kvideo-latest-titles-v8-${type || 'all'}`;

  // 严格安全内容过滤器（彻底杜绝日文假名、纯外文无中文条目与垃圾脏数据进入主站展示）
  const filterSafeItems = (rawList: RecentTitleItem[]): RecentTitleItem[] => {
    return rawList.filter(item => {
      if (!item || !item.title) return false;
      // 1. 严格华语正片标题过滤（阻断日文假名、韩文、纯英文/德文/西文等无中文译名条目与违禁词）
      if (!isCleanChineseTitle(item.title)) return false;
      // 2. 极低评分异常老片阻断
      if (item.rate && parseFloat(item.rate) <= 3.0 && item.year && parseInt(item.year, 10) < 2024) return false;
      return true;
    });
  };

  // SWR 本地优先瞬间恢复 + 异步刷新（带 30 分钟 TTL 刷新机制）
  useEffect(() => {
    let active = true;
    if (typeof window !== 'undefined') {
      try {
        // 清理旧版本被污染的历史 localStorage 缓存（v4, v5, v6, v7）
        for (let i = localStorage.length - 1; i >= 0; i--) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('kvideo-latest-titles-v4-') || k.startsWith('kvideo-latest-titles-v5-') || k.startsWith('kvideo-latest-titles-v6-') || k.startsWith('kvideo-latest-titles-v7-'))) {
            localStorage.removeItem(k);
          }
        }

        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const parsed = JSON.parse(cached);
          const list = Array.isArray(parsed) ? parsed : parsed?.data;
          if (Array.isArray(list) && list.length > 0) {
            const safeList = filterSafeItems(list);
            setItems(safeList);
            setIsLoaded(true);
          }
        }
      } catch {}
    }

    const fetchLatest = async () => {
      try {
        const url = type
          ? `/api/latest-titles?type=${type}&limit=20&v=8`
          : '/api/latest-titles?limit=20&v=8';
        const res = await fetch(url);
        if (!res.ok) return;
        const json = await res.json();
        if (active && json.success && Array.isArray(json.data) && json.data.length > 0) {
          const safeData = filterSafeItems(json.data);
          setItems(safeData);
          setIsLoaded(true);
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: safeData }));
          } catch {}
        }
      } catch (err) {
        console.warn('[LatestTitlesRail] fetch error:', err);
      }
    };

    fetchLatest();
    return () => {
      active = false;
    };
  }, [type, CACHE_KEY]);

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
  }, [items]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const { clientWidth } = scrollRef.current;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  // 如果尚未加载且无任何缓存数据，静默占位，避免 CLS
  if (!isLoaded && items.length === 0) {
    return null;
  }

  return (
    <section className={`below-fold-rail relative my-6 sm:my-8 group/rail select-none ${className}`}>
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-3 px-1 sm:px-2">
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <h2 className="text-base sm:text-xl font-black tracking-tight text-white flex items-center gap-2">
              {title}
            </h2>
          </div>
          <span className="hidden sm:inline-block text-[11px] text-emerald-400/80 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            {subtitle}
          </span>
        </div>

        {/* 左右滚动切换按钮 (桌面端) */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="向左滚动最新影视"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
          >
            <Icons.ChevronLeft size={16} />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="向右滚动最新影视"
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 flex items-center justify-center text-white transition-all active:scale-95"
          >
            <Icons.ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 滑轨容器 */}
      <div
        ref={scrollRef}
        className="content-rail-scroll flex items-stretch gap-3 sm:gap-4 overflow-x-auto no-scrollbar overscroll-x-contain px-1 sm:px-2 pb-2"
        style={{ scrollSnapType: 'x proximity' }}
      >
        {items.map((item, idx) => (
          <LatestPosterCard
            key={`${item.entityId}-${idx}`}
            item={item}
            idx={idx}
            isShort={type === 'short' || item.type === 'short' || item.channelKey === 'short'}
          />
        ))}
      </div>
    </section>
  );
}
