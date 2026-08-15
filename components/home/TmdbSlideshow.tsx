'use client';

/**
 * HeroSlideshow — 基于 RankingCarousel 布局 + TMDB Backdrop 升级
 * 左侧 Hero：TMDB 横版大图背景 + 排名/标题/评分/类型/播放按钮
 * 右侧：可滚动竖版海报卡片列表
 * 与网站毛玻璃风格完全统一
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useRankingData } from './hooks/useRankingData';

/** 带加载骨架 / 失败占位的海报图片 */
function PosterImage({ src, alt, sizes, className, style, fill = true, priority = false }: {
    src: string; alt: string; sizes: string; className?: string;
    style?: React.CSSProperties; fill?: boolean; priority?: boolean;
}) {
    const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
    return (
        <>
            {/* 加载中 → 骨架屏闪光动画 */}
            {status === 'loading' && (
                <div className="absolute inset-0 skeleton-shimmer rounded-none" />
            )}
            {/* 加载失败 → 图标 + 标题占位 */}
            {status === 'error' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center"
                     style={{ background: 'linear-gradient(135deg, rgba(30,30,50,0.95), rgba(15,15,30,0.98))' }}>
                    <svg className="w-8 h-8 mb-2 opacity-15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <p className="text-[10px] text-white/25 line-clamp-2 px-2 text-center">{alt}</p>
                </div>
            )}
            <Image
                src={src}
                alt={alt}
                fill={fill}
                className={`${className || ''} ${status === 'loaded' ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
                style={style}
                sizes={sizes}
                unoptimized
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setStatus('loaded')}
                onError={() => setStatus('error')}
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
    const { movieRanking, tvRanking, loading, error, fetchType, enrichMovie, retry } = useRankingData({ limit: 10 });
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    // TMDB Backdrop 状态
    const [backdrops, setBackdrops] = useState<Record<string, string | null>>({});
    const fetchedRef = useRef<string>('');

    const currentData = contentType === 'movie' ? movieRanking : tvRanking;

    // 切换 tab 重置 + 触发 TV 懒加载
    useEffect(() => {
        setActiveIndex(0);
        if (scrollRef.current) scrollRef.current.scrollLeft = 0;
        // 方案 1：切换到 TV 时才触发加载
        fetchType(contentType);
    }, [contentType, fetchType]);

    // 批量获取 TMDB Backdrop
    useEffect(() => {
        if (currentData.length === 0) return;
        const key = contentType + currentData.map(m => m.id).join(',');
        if (fetchedRef.current === key) return;
        fetchedRef.current = key;

        const fetchBackdrops = async () => {
            try {
                // 传递 title + year，用年份精确匹配避免同名不同版本
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
                // 静默失败，使用海报模糊降级
            }
        };

        fetchBackdrops();
    }, [currentData, contentType]);

    // 滚动按钮状态
    const updateScrollButtons = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 10);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateScrollButtons, { passive: true });
        const timer = setTimeout(updateScrollButtons, 100);
        return () => { el.removeEventListener('scroll', updateScrollButtons); clearTimeout(timer); };
    }, [updateScrollButtons, currentData.length]);

    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        el.scrollBy({ left: direction === 'left' ? -450 : 450, behavior: 'smooth' });
    };

    // 方案 3：active 影片变化时按需加载详情
    useEffect(() => {
        const active = currentData[activeIndex];
        if (active && active.description === undefined) {
            enrichMovie(active.id, contentType);
        }
    }, [activeIndex, currentData, contentType, enrichMovie]);

    // 键盘（TV 遥控器）
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') { setActiveIndex(prev => Math.max(0, prev - 1)); e.preventDefault(); }
        if (e.key === 'ArrowRight') { setActiveIndex(prev => Math.min(currentData.length - 1, prev + 1)); e.preventDefault(); }
        if (e.key === 'Enter' && currentData[activeIndex]) { handleMovieClick(currentData[activeIndex]); e.preventDefault(); }
    };

    const handleMovieClick = (movie: any) => {
        const params = new URLSearchParams();
        params.set('title', movie.title);
        params.set('type', contentType);
        if (movie.year) params.set('year', movie.year);
        router.push(`/player?${params.toString()}`);
    };

    // 加载失败 — 显示错误信息和重试按钮
    if (!loading && error && currentData.length === 0) {
        return (
            <div className="mb-3">
                <div className="flex flex-col items-center justify-center h-[280px] sm:h-[280px] rounded-2xl"
                     style={{ background: 'var(--glass-bg, rgba(255,255,255,0.04))', border: '1px solid var(--glass-border, rgba(255,255,255,0.06))' }}>
                    <p className="text-sm mb-3" style={{ color: 'var(--text-color-secondary)' }}>{error}</p>
                    <button
                        onClick={retry}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all hover:scale-105"
                        style={{ background: 'var(--accent-color)' }}
                    >
                        重新加载
                    </button>
                </div>
            </div>
        );
    }

    // 骨架屏 — 尺寸与实际内容完全一致
    if (loading || currentData.length === 0) {
        return (
            <div className="mb-3">
                <div className="hidden sm:flex gap-3 h-[clamp(260px,18vw,320px)]">
                    <div className="w-[38%] min-w-[300px] max-w-[480px] slideshow-skeleton skeleton-shimmer rounded-2xl" />
                    <div className="flex-1 flex gap-3 overflow-hidden">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="w-[clamp(120px,9vw,155px)] shrink-0 skeleton-shimmer rounded-xl" style={{ animationDelay: `${i * 0.08}s` }} />
                        ))}
                    </div>
                </div>
                <div className="mobile-only-section flex gap-3 overflow-hidden h-[210px]">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-[130px] shrink-0 skeleton-shimmer rounded-xl" style={{ animationDelay: `${i * 0.08}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    const active = currentData[activeIndex] || currentData[0];
    const activeBackdrop = backdrops[active.title];

    return (
        <div className="mb-3" onKeyDown={handleKeyDown} tabIndex={0} data-focusable>

            {/* === 桌面端：左 TMDB Hero + 右卡片列表 === */}
            <div className="hidden sm:flex gap-3 h-[clamp(260px,18vw,320px)]">

                {/* 左侧 Hero — TMDB Backdrop 背景 */}
                <div
                    className="hero-left-panel relative w-[38%] min-w-[300px] max-w-[480px] rounded-2xl overflow-hidden cursor-pointer group"
                    onClick={() => handleMovieClick(active)}
                    style={{ isolation: 'isolate' }}
                >
                    {/* 背景图：优先 TMDB Backdrop，降级为海报模糊 */}
                    <div className="absolute inset-0 transition-opacity duration-500">
                        {activeBackdrop ? (
                            <PosterImage
                                src={activeBackdrop}
                                alt={active.title}
                                className="object-cover transition-all duration-700"
                                style={{ objectPosition: 'center 25%' }}
                                sizes="45vw"
                                priority
                            />
                        ) : (
                            <PosterImage
                                src={active.cover}
                                alt={active.title}
                                className="object-cover scale-125 blur-2xl brightness-[0.3] saturate-150"
                                sizes="45vw"
                                priority
                            />
                        )}
                        {/* 渐变叠加 — 底部文字区域加深，上半部分保持透明 */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-black/5" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                    </div>

                    {/* Hero 内容 */}
                    <div className="relative z-10 h-full flex flex-col justify-between p-5">
                        <div>
                            {/* 排行标签 */}
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white/70 text-[10px] rounded-full border border-white/10 mb-3">
                                🔥 {contentType === 'movie' ? '电影' : '电视剧'}热门榜
                            </span>

                            {/* 排名 + 标题 */}
                            <div className="flex items-end gap-2 mb-2">
                                <span
                                    className="text-4xl lg:text-5xl font-black leading-none shrink-0"
                                    style={{
                                        background: 'linear-gradient(180deg, #FFD700, #FF8C00)',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent',
                                        filter: 'drop-shadow(0 2px 4px rgba(255,215,0,0.3))',
                                    }}
                                >
                                    #{activeIndex + 1}
                                </span>
                                <div className="min-w-0 flex-1">
                                    <h2 className="text-xl lg:text-2xl font-bold text-white truncate drop-shadow-lg">
                                        {active.title}
                                    </h2>
                                </div>
                            </div>

                            {/* 评分 + 类型 */}
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                                {active.rate && parseFloat(active.rate) > 0 ? (
                                    <span className="flex items-center gap-1 text-yellow-400 font-bold text-sm">
                                        ★ {active.rate}
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-emerald-400 font-bold text-xs px-1.5 py-0.5 bg-emerald-400/15 rounded">
                                        🆕 新上线
                                    </span>
                                )}
                                {active.types && active.types.length > 0 && (
                                    <div className="flex gap-1">
                                        {active.types.slice(0, 3).map((t: string, i: number) => (
                                            <span key={i} className="px-1.5 py-0.5 bg-white/10 text-white/70 text-xs rounded">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {active.region && (
                                    <span className="text-white/40 text-xs">
                                        {Array.isArray(active.region) ? active.region.join(' / ') : active.region}
                                    </span>
                                )}
                            </div>

                            {/* 简介 */}
                            {active.description && (
                                <p className="text-white/50 text-xs leading-relaxed line-clamp-2 mb-2">
                                    {active.description}
                                </p>
                            )}

                            {/* 导演 / 主演 */}
                            {(active.directors?.length || active.actors?.length) ? (
                                <div className="flex flex-col gap-0.5 text-[11px] text-white/40">
                                    {active.directors && active.directors.length > 0 && (
                                        <p className="truncate">
                                            <span className="text-white/25">导演：</span>
                                            {active.directors.join(' / ')}
                                        </p>
                                    )}
                                    {active.actors && active.actors.length > 0 && (
                                        <p className="truncate">
                                            <span className="text-white/25">主演：</span>
                                            {active.actors.slice(0, 3).join(' / ')}
                                        </p>
                                    )}
                                </div>
                            ) : null}
                        </div>

                        {/* 播放按钮 */}
                        <button
                            className="w-full py-2 bg-[var(--accent-color)] text-white rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg cursor-pointer active:scale-[0.98]"
                            onClick={(e) => { e.stopPropagation(); handleMovieClick(active); }}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            立即播放
                        </button>
                    </div>
                </div>

                {/* 右侧卡片列表 */}
                <div className="flex-1 relative min-w-0 group/list">
                    {/* 左箭头 */}
                    {canScrollLeft && (
                        <button
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/list:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer shadow-lg"
                            onClick={() => scroll('left')}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="15 18 9 12 15 6" />
                            </svg>
                        </button>
                    )}

                    {/* 右箭头 */}
                    {canScrollRight && (
                        <button
                            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/list:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer shadow-lg"
                            onClick={() => scroll('right')}
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    )}

                    {/* 渐变遮罩 */}
                    {canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--bg-color)] to-transparent z-10 pointer-events-none" />
                    )}
                    {canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--bg-color)] to-transparent z-10 pointer-events-none" />
                    )}

                    {/* 卡片容器 */}
                    <div
                        ref={scrollRef}
                        className="flex gap-3 h-full overflow-x-auto scrollbar-hide scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {currentData.map((movie, idx) => (
                            <div
                                key={movie.id || idx}
                                className={`relative shrink-0 w-[clamp(115px,8.5vw,145px)] rounded-xl overflow-hidden cursor-pointer group/card transition-all duration-300 ${idx === activeIndex
                                    ? 'ring-2 ring-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20'
                                    : 'ring-1 ring-white/10 hover:ring-white/25'
                                    }`}
                                onMouseEnter={() => setActiveIndex(idx)}
                                onClick={() => handleMovieClick(movie)}
                            >
                                {/* 海报 */}
                                <PosterImage
                                    src={movie.cover}
                                    alt={movie.title}
                                    className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                                    sizes="150px"
                                    priority={idx < 3}
                                />

                                {/* 排名角标 */}
                                <div className="absolute top-0 left-0 z-10">
                                    <div
                                        className="w-7 h-7 flex items-center justify-center text-xs font-black text-white"
                                        style={{
                                            background: idx < 3
                                                ? 'linear-gradient(135deg, #FFD700, #FF8C00)'
                                                : 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))',
                                            borderRadius: '0 0 8px 0',
                                        }}
                                    >
                                        {idx + 1}
                                    </div>
                                </div>

                                {/* 评分角标 */}
                                {movie.rate && parseFloat(movie.rate) > 0 && (
                                    <div className="absolute top-1 right-1 z-10 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded-full">
                                        <span className="text-yellow-400 text-[10px] font-bold">★ {movie.rate}</span>
                                    </div>
                                )}

                                {/* 底部标题 */}
                                <div className="absolute inset-x-0 bottom-0 z-10">
                                    <div className="bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-10 pb-2 px-2">
                                        <p className="text-white text-xs font-semibold line-clamp-2 leading-tight drop-shadow-lg">
                                            {movie.title}
                                        </p>
                                    </div>
                                </div>

                                {/* Hover 播放提示 */}
                                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/card:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10">
                                    <div className="w-10 h-10 rounded-full bg-[var(--accent-color)]/80 flex items-center justify-center shadow-lg backdrop-blur-sm">
                                        <svg className="w-5 h-5 text-white ml-0.5" viewBox="0 0 24 24" fill="currentColor">
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* === 手机端：紧凑横向滚动（桌面端隐藏）=== */}
            <div className="mobile-only-section">
                <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-sm font-semibold text-[var(--text-color)]">
                        🔥 {contentType === 'movie' ? '电影' : '电视剧'}热门榜
                    </span>
                    <span className="text-xs text-[var(--text-color-secondary)]">
                        共 {currentData.length} 部
                    </span>
                </div>
                <div
                    className="flex gap-2.5 overflow-x-auto scrollbar-hide pb-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {currentData.map((movie, idx) => (
                        <div
                            key={movie.id || idx}
                            className="relative shrink-0 w-[120px] h-[180px] rounded-xl overflow-hidden cursor-pointer group/mcard"
                            onClick={() => handleMovieClick(movie)}
                        >
                            <PosterImage src={movie.cover} alt={movie.title} className="object-cover" sizes="120px" />
                            <div className="absolute top-0 left-0 z-10">
                                <div
                                    className="w-6 h-6 flex items-center justify-center text-[10px] font-black text-white"
                                    style={{
                                        background: idx < 3
                                            ? 'linear-gradient(135deg, #FFD700, #FF8C00)'
                                            : 'linear-gradient(135deg, rgba(0,0,0,0.7), rgba(0,0,0,0.5))',
                                        borderRadius: '0 0 6px 0',
                                    }}
                                >
                                    {idx + 1}
                                </div>
                            </div>
                            {movie.rate && parseFloat(movie.rate) > 0 && (
                                <div className="absolute top-0.5 right-1 z-10 bg-black/60 px-1 py-0.5 rounded-full">
                                    <span className="text-yellow-400 text-[9px] font-bold">★ {movie.rate}</span>
                                </div>
                            )}
                            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-2 px-1.5">
                                <p className="text-white text-[11px] font-semibold line-clamp-2 leading-tight">{movie.title}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
