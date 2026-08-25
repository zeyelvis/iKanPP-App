'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Play, Sparkles, Flame, Crown, Heart, ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { useFavorites } from '@/lib/store/favorites-store';

interface MidnightHeroProps {
    videos?: any[];
    onPlayVideo?: (video: any) => void;
    onExploreCategory?: (keyword: string) => void;
}

export function MidnightHero({
    videos = [],
    onPlayVideo,
    onExploreCategory,
}: MidnightHeroProps) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const { addFavorite, removeFavorite, isFavorite } = useFavorites(true);

    // 精选前 5 部作为轮播焦点图
    const heroList = videos.slice(0, 5);
    const currentVideo = heroList[currentIndex] || videos[0] || null;

    // 6 秒自动平滑轮播
    useEffect(() => {
        if (heroList.length <= 1 || isPaused) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % heroList.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [heroList.length, isPaused]);

    if (!currentVideo) {
        // 缺省极简 Hero
        return (
            <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-purple-950/40 via-[#0B0C14] to-black border border-purple-500/20 p-8 sm:p-12 mb-8">
                <div className="max-w-2xl space-y-4">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-black">
                        <Sparkles size={13} />
                        <span>iKanPP 午夜 VIP 独家专线</span>
                    </div>
                    <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
                        4K 极清画质 · 0 广告秒播
                    </h1>
                    <p className="text-sm text-white/60">
                        收录全网 36 大专线与日本官方名优正版高清库，为您呈现顶级母带视听盛宴。
                    </p>
                </div>
            </div>
        );
    }

    // 从标题提取番号与女优名
    const title = currentVideo.vod_name || currentVideo.title || '';
    const codeMatch = title.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
    const videoCode = codeMatch ? codeMatch[0].toUpperCase() : '4K VIP 独家';
    const cleanTitle = title.replace(/[《》【】\[\]（）()]/g, ' ').replace(videoCode, '').trim();
    const coverUrl = currentVideo.vod_pic || '';
    const currentSource = currentVideo.source || 'hsck';
    const currentVid = String(currentVideo.vod_id);
    const isFav = isFavorite(currentVid, currentSource);

    const handleToggleFav = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isFav) {
            removeFavorite(currentVid, currentSource);
        } else {
            addFavorite({
                videoId: currentVid,
                title: title,
                poster: coverUrl,
                source: currentSource,
                sourceName: '4K 原画',
                remarks: '4K MAX',
                type: 'tv',
            });
        }
    };

    return (
        <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="relative w-full rounded-3xl overflow-hidden bg-[#07080E] border border-white/10 shadow-2xl shadow-purple-950/40 mb-8 group select-none"
        >
            {/* 1. 4K 超宽景深海报背景图 */}
            <div className="relative w-full h-[360px] sm:h-[440px] lg:h-[480px]">
                {coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={title}
                        fill
                        sizes="(max-width: 1200px) 100vw, 1400px"
                        className="object-cover object-center scale-105 group-hover:scale-100 transition-transform duration-1000 ease-out"
                        priority
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-purple-950 via-slate-900 to-black" />
                )}

                {/* 电影级多重暗影渐变罩（左侧纯黑实底方便读字，右侧保留剧照） */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#07080E] via-[#07080E]/80 to-transparent w-full sm:w-3/4 z-10" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#07080E] via-[#07080E]/40 to-transparent z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-[#07080E]/60 via-transparent to-transparent z-10" />
            </div>

            {/* 2. 左侧核心文案与操作按钮 */}
            <div className="absolute inset-0 z-20 flex flex-col justify-end sm:justify-center p-6 sm:p-10 lg:p-14 max-w-2xl space-y-4">
                {/* 顶部标签行 */}
                <div className="flex flex-wrap items-center gap-2.5">
                    <span className="px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 text-black text-xs font-black tracking-wider uppercase shadow-lg shadow-amber-500/30 flex items-center gap-1.5">
                        <Crown size={13} className="fill-black" />
                        {videoCode}
                    </span>

                    <span className="px-2.5 py-0.5 rounded-lg bg-white/10 backdrop-blur-md border border-white/15 text-white/80 text-xs font-bold flex items-center gap-1">
                        <Flame size={12} className="text-pink-500" />
                        今日封神榜 TOP {currentIndex + 1}
                    </span>

                    <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-extrabold">
                        99.8% 好评
                    </span>
                </div>

                {/* 影片主标题 */}
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight line-clamp-2 drop-shadow-lg">
                    {cleanTitle || title}
                </h2>

                {/* 介绍与特性徽章 */}
                <p className="text-xs sm:text-sm text-white/70 line-clamp-2 leading-relaxed max-w-xl">
                    官方正版母带 4K 原画重制，无广告纯净切片。搭载自研超清专线，0 毫秒极速秒播。
                </p>

                {/* 核心操作按钮 */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        onClick={() => onPlayVideo && onPlayVideo(currentVideo)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-400 text-black font-black text-sm shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                        <Play size={18} className="fill-black" />
                        <span>立即 4K 秒播</span>
                    </button>

                    <button
                        onClick={handleToggleFav}
                        className={`flex items-center gap-2 px-4 py-3 rounded-2xl border backdrop-blur-xl font-bold text-sm transition-all cursor-pointer hover:scale-105 active:scale-95 ${
                            isFav
                                ? 'bg-pink-600/30 border-pink-500/50 text-pink-300'
                                : 'bg-white/10 hover:bg-white/20 border-white/15 text-white'
                        }`}
                        title={isFav ? '已在私密片单中' : '加入私密片单'}
                    >
                        <Heart size={16} className={isFav ? 'fill-pink-500 text-pink-500' : ''} />
                        <span>{isFav ? '已收藏' : '收藏'}</span>
                    </button>
                </div>
            </div>

            {/* 3. 左右切片切换箭头 (桌面端悬停浮现) */}
            {heroList.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev - 1 + heroList.length) % heroList.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-110"
                        aria-label="上一部"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={() => setCurrentIndex((prev) => (prev + 1) % heroList.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white/70 hover:text-white border border-white/10 flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all cursor-pointer hover:scale-110"
                        aria-label="下一部"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* 4. 底部 5 根动态切片微光进度指示条 */}
            {heroList.length > 1 && (
                <div className="absolute bottom-4 right-6 z-30 flex items-center gap-2">
                    {heroList.map((_, idx) => (
                        <button
                            key={`hero-dot-${idx}`}
                            onClick={() => setCurrentIndex(idx)}
                            className="group/dot relative h-1.5 rounded-full transition-all cursor-pointer overflow-hidden"
                            style={{
                                width: currentIndex === idx ? '32px' : '10px',
                                background: currentIndex === idx ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.2)',
                            }}
                            aria-label={`切换到第 ${idx + 1} 部`}
                        >
                            {currentIndex === idx && (
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full shadow-[0_0_8px_rgba(245,158,11,1)]"
                                    style={{
                                        animation: isPaused ? 'none' : 'heroProgress 6s linear infinite',
                                    }}
                                />
                            )}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
