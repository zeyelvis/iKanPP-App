'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useRankingData } from './hooks/useRankingData';
import { generateSlug } from '@/lib/data/entities/entity-utils';

interface RankingCarouselProps {
    /** 当前内容类型，与 PopularFeatures 的三联按钮联动 */
    contentType: 'movie' | 'tv';
}

export function RankingCarousel({ contentType }: RankingCarouselProps) {
    const router = useRouter();
    const { movieRanking, tvRanking, loading, fetchType, enrichMovie } = useRankingData({ limit: 10 });
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const currentData = contentType === 'movie' ? movieRanking : tvRanking;

    // 切换 tab 时重置 + 触发 TV 懒加载
    useEffect(() => {
        setActiveIndex(0);
        if (scrollRef.current) {
            scrollRef.current.scrollLeft = 0;
        }
        fetchType(contentType);
    }, [contentType, fetchType]);

    // 方案 3：active 影片变化时按需加载详情
    useEffect(() => {
        const active = currentData[activeIndex];
        if (active && active.description === undefined) {
            enrichMovie(active.id, contentType);
        }
    }, [activeIndex, currentData, contentType, enrichMovie]);

    // 更新滚动按钮状态
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
        // 初始检查
        const timer = setTimeout(updateScrollButtons, 100);
        return () => {
            el.removeEventListener('scroll', updateScrollButtons);
            clearTimeout(timer);
        };
    }, [updateScrollButtons, currentData.length]);

    // 滚动控制
    const scroll = (direction: 'left' | 'right') => {
        const el = scrollRef.current;
        if (!el) return;
        const cardWidth = 150; // 大约一个卡片宽度 + gap
        const scrollAmount = cardWidth * 3;
        el.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth',
        });
    };

    // 键盘操作（TV 遥控器）
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            setActiveIndex(prev => Math.max(0, prev - 1));
            e.preventDefault();
        }
        if (e.key === 'ArrowRight') {
            setActiveIndex(prev => Math.min(currentData.length - 1, prev + 1));
            e.preventDefault();
        }
        if (e.key === 'Enter' && currentData[activeIndex]) {
            handleMovieClick(currentData[activeIndex]);
            e.preventDefault();
        }
    };

    const handleMovieClick = (movie: any) => {
        router.push(`/title/${generateSlug(movie.title)}`);
    };

    // 骨架屏
    if (loading) {
        return (
            <div className="mb-3">
                <div className="hidden sm:flex gap-3 h-[260px]">
                    <div className="w-[38%] slideshow-skeleton skeleton-shimmer rounded-2xl" />
                    <div className="flex-1 flex gap-3 overflow-hidden">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="w-[130px] shrink-0 skeleton-shimmer rounded-xl" style={{ animationDelay: `${i * 0.1}s` }} />
                        ))}
                    </div>
                </div>
                <div className="sm:hidden flex gap-3 overflow-hidden h-[220px]">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="w-[140px] shrink-0 skeleton-shimmer rounded-xl" style={{ animationDelay: `${i * 0.1}s` }} />
                    ))}
                </div>
            </div>
        );
    }

    if (currentData.length === 0) return null;

    const active = currentData[activeIndex] || currentData[0];

    return (
        <div className="mb-3" onKeyDown={handleKeyDown} tabIndex={0} data-focusable>

            {/* === 桌面端布局：左 Hero + 右卡片列表 === */}
            <div className="hidden sm:flex gap-3 h-[260px]">

                {/* 左侧 Hero 区域 */}
                <Link
                    href={`/title/${generateSlug(active.title)}`}
                    prefetch={true}
                    className="relative w-[38%] min-w-[280px] rounded-2xl overflow-hidden cursor-pointer group block"
                    style={{ isolation: 'isolate' }}
                >
                    {/* 模糊背景 */}
                    <div className="absolute inset-0 transition-opacity duration-500">
                        <Image
                            src={active.cover}
                            alt=""
                            fill
                            className="object-cover scale-125 blur-2xl brightness-[0.3] saturate-150"
                            sizes="40vw"
                            unoptimized
                            aria-hidden="true"
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/50" />
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
                                        {active.types.slice(0, 3).map((t, i) => (
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
                        <div
                            className="w-full py-2 bg-[var(--accent-color)] text-white rounded-full text-sm font-semibold flex items-center justify-center gap-2 hover:brightness-110 transition-all shadow-lg active:scale-[0.98]"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M8 5v14l11-7z" />
                            </svg>
                            立即播放
                        </div>
                    </div>
                </Link>

                {/* 右侧卡片列表 */}
                <div className="flex-1 relative min-w-0 group/list">
                    {/* 左箭头 */}
                    {canScrollLeft && (
                        <button
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/list:opacity-100 transition-opacity hover:bg-black/80 cursor-pointer shadow-lg"
                            onClick={() => scroll('left')}
                            aria-label="向左滚动"
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
                            aria-label="向右滚动"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <polyline points="9 18 15 12 9 6" />
                            </svg>
                        </button>
                    )}

                    {/* 左侧渐变遮罩 */}
                    {canScrollLeft && (
                        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[var(--bg-color)] to-transparent z-10 pointer-events-none" />
                    )}
                    {/* 右侧渐变遮罩 */}
                    {canScrollRight && (
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-[var(--bg-color)] to-transparent z-10 pointer-events-none" />
                    )}

                    {/* 可滚动卡片容器 */}
                    <div
                        ref={scrollRef}
                        className="flex gap-3 h-full overflow-x-auto scrollbar-hide scroll-smooth"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {currentData.map((movie, idx) => (
                            <Link
                                key={movie.id || idx}
                                href={`/title/${generateSlug(movie.title)}`}
                                prefetch={idx < 4}
                                className={`relative shrink-0 w-[130px] lg:w-[145px] rounded-xl overflow-hidden cursor-pointer group/card transition-all duration-300 block ${idx === activeIndex
                                        ? 'ring-2 ring-[var(--accent-color)] shadow-lg shadow-[var(--accent-color)]/20'
                                        : 'ring-1 ring-white/10 hover:ring-white/25'
                                    }`}
                                onMouseEnter={() => setActiveIndex(idx)}
                            >
                                {/* 海报 */}
                                <Image
                                    src={movie.cover}
                                    alt={movie.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                                    sizes="150px"
                                    unoptimized
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

                                {/* 底部渐变 + 标题 */}
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
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* === 手机端布局：紧凑横向滚动卡片 === */}
            <div className="sm:hidden">
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
                        <Link
                            key={movie.id || idx}
                            href={`/title/${generateSlug(movie.title)}`}
                            prefetch={idx < 3}
                            className="relative shrink-0 w-[120px] h-[180px] rounded-xl overflow-hidden cursor-pointer group/mcard block"
                        >
                            {/* 海报 */}
                            <Image
                                src={movie.cover}
                                alt={movie.title}
                                fill
                                className="object-cover"
                                sizes="120px"
                                unoptimized
                            />

                            {/* 排名角标 */}
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

                            {/* 评分 */}
                            {movie.rate && parseFloat(movie.rate) > 0 && (
                                <div className="absolute top-0.5 right-1 z-10 bg-black/60 px-1 py-0.5 rounded-full">
                                    <span className="text-yellow-400 text-[9px] font-bold">★ {movie.rate}</span>
                                </div>
                            )}

                            {/* 底部标题 */}
                            <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-2 px-1.5">
                                <p className="text-white text-[11px] font-semibold line-clamp-2 leading-tight">
                                    {movie.title}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
