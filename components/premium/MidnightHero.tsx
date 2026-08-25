'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { Play, ChevronLeft, ChevronRight, Sparkles, Flame, Crown } from 'lucide-react';

interface MidnightHeroProps {
    videos?: any[];
    onPlayVideo?: (video: any) => void;
    onExploreCategory?: (keyword: string) => void;
}

/**
 * Jable 原版风格精选多卡片横向轮播滑块 (Jable Featured Slider)
 * 1:1 还原 Jable 官方首页首屏：
 * 1. 一排平铺 5~6 张原汁原味大卡片
 * 2. 左上角配备粉色斜角「精选」高光徽章
 * 3. 支持平滑左右滑动画廊体验与一键秒播
 */
export function MidnightHero({
    videos = [],
    onPlayVideo,
}: MidnightHeroProps) {
    const sliderRef = useRef<HTMLDivElement>(null);

    // 精选前 12 部大片作为首屏精选滑块
    const featuredList = videos.slice(0, 12);

    if (featuredList.length === 0) return null;

    const scrollLeft = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: -400, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (sliderRef.current) {
            sliderRef.current.scrollBy({ left: 400, behavior: 'smooth' });
        }
    };

    return (
        <section className="relative w-full mb-6 group/hero select-none">
            {/* 左右滑动控制箭头 */}
            <button
                onClick={scrollLeft}
                className="absolute left-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/75 hover:bg-black text-white/80 hover:text-white border border-white/15 flex items-center justify-center backdrop-blur-xl shadow-xl opacity-0 group-hover/hero:opacity-100 transition-all cursor-pointer hover:scale-110 active:scale-95"
                aria-label="向左滑动"
            >
                <ChevronLeft size={22} />
            </button>
            <button
                onClick={scrollRight}
                className="absolute right-1 top-1/2 -translate-y-1/2 z-30 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-black/75 hover:bg-black text-white/80 hover:text-white border border-white/15 flex items-center justify-center backdrop-blur-xl shadow-xl opacity-0 group-hover/hero:opacity-100 transition-all cursor-pointer hover:scale-110 active:scale-95"
                aria-label="向右滑动"
            >
                <ChevronRight size={22} />
            </button>

            {/* 横向滚动容器 */}
            <div
                ref={sliderRef}
                className="flex gap-3 sm:gap-3.5 overflow-x-auto scrollbar-none py-1 px-1 scroll-smooth snap-x"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
                {featuredList.map((video, idx) => {
                    const title = video?.vod_name || video?.title || '';
                    const rawPic = video?.vod_pic || '';
                    const codeMatch = title.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
                    const videoCode = codeMatch ? codeMatch[0].toUpperCase() : null;
                    const cleanTitle = videoCode ? title.replace(videoCode, '').replace(/[《》【】\[\]（）()]/g, ' ').trim() : title;

                    return (
                        <div
                            key={`featured-${video.vod_id}-${idx}`}
                            onClick={() => onPlayVideo && onPlayVideo(video)}
                            className="group relative flex-none w-[180px] sm:w-[220px] lg:w-[250px] rounded-2xl bg-[#0E0F17] border border-white/10 hover:border-pink-500/50 shadow-lg hover:shadow-pink-950/40 transition-all duration-300 overflow-hidden cursor-pointer snap-start hover:-translate-y-1.5"
                        >
                            {/* 1. 封面海报图 */}
                            <div className="relative aspect-[16/10] w-full bg-black/40 overflow-hidden">
                                {rawPic ? (
                                    <Image
                                        src={rawPic}
                                        alt={title}
                                        fill
                                        sizes="(max-width: 640px) 180px, (max-width: 1024px) 220px, 250px"
                                        className="object-cover scale-100 group-hover:scale-108 transition-transform duration-700 ease-out"
                                        priority={idx < 5}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-purple-950/40 to-black flex items-center justify-center text-white/30 text-xs font-mono">
                                        {videoCode || '精选大片'}
                                    </div>
                                )}

                                {/* Jable 官方原版粉色斜角「精选」徽章 */}
                                <div className="absolute top-0 left-0 z-20 overflow-hidden w-16 h-16 pointer-events-none">
                                    <div className="absolute -top-7 -left-7 w-16 h-16 bg-gradient-to-br from-pink-500 to-rose-600 rotate-45 flex items-end justify-center pb-1 shadow-md shadow-pink-600/40">
                                        <span className="text-[9px] font-black text-white tracking-tighter uppercase">
                                            精选
                                        </span>
                                    </div>
                                </div>

                                {/* 右上角 4K 标志 */}
                                <div className="absolute top-2 right-2 z-20 px-1.5 py-0.2 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-white text-[9px] font-black">
                                    4K
                                </div>

                                {/* 悬停居中浮现大播放键 */}
                                <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-500 text-black flex items-center justify-center shadow-xl shadow-amber-500/50 scale-75 group-hover:scale-100 transition-transform duration-300">
                                        <Play size={18} className="fill-black ml-0.5" />
                                    </div>
                                </div>

                                {/* 底部番号与暗影 */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C14] via-transparent to-transparent opacity-80" />
                                {videoCode && (
                                    <div className="absolute bottom-2 left-2.5 z-20 px-2 py-0.5 rounded-md bg-black/80 text-amber-300 text-[10px] font-mono font-black border border-amber-500/30 backdrop-blur-md">
                                        {videoCode}
                                    </div>
                                )}
                            </div>

                            {/* 2. 标题信息 */}
                            <div className="p-2.5 sm:p-3 space-y-1">
                                <h4 className="text-xs font-bold text-white/90 group-hover:text-pink-400 line-clamp-2 leading-snug transition-colors">
                                    {cleanTitle || title}
                                </h4>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
