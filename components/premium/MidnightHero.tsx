'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Play, Sparkles, Shield, ChevronLeft, ChevronRight, EyeOff, Film } from 'lucide-react';

interface HeroSlide {
    id: string;
    title: string;
    description: string;
    tag: string;
    badge: string;
    cover: string;
    query: string;
}

const HERO_SLIDES: HeroSlide[] = [
    {
        id: '1',
        title: '2026 年度年度中文字幕大片盛典',
        description: '全网首发超清原画，官方中文字幕，身临其境的视听盛宴。',
        tag: '👑 独家精选',
        badge: '4K 原画',
        cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
        query: '中文字幕',
    },
    {
        id: '2',
        title: '华语自制 · 顶级原生高颜值精选',
        description: '东方韵味极致展现，4K 蓝光极速专线，秒播零等待。',
        tag: '🏮 国产原创',
        badge: '极速秒播',
        cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop',
        query: '国产',
    },
    {
        id: '3',
        title: '欧美经典剧情巨制 · 影院级宽幕呈现',
        description: '好莱坞级制作质感，超清无码蓝光画质，全方位震撼感官。',
        tag: '🎬 欧美巨制',
        badge: '杜比视界',
        cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1920&auto=format&fit=crop',
        query: '欧美',
    },
];

export function MidnightHero({
    onSearch,
    onPlayVideo,
}: {
    onSearch?: (query: string) => void;
    onPlayVideo?: (video: any) => void;
}) {
    const router = useRouter();
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    // 自动轮播
    useEffect(() => {
        if (isPaused) return;
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
        }, 5000);
        return () => clearInterval(timer);
    }, [isPaused]);

    // 监听 Esc 老板键
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                router.push('/');
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [router]);

    const currentSlide = HERO_SLIDES[currentIndex];

    const handlePlay = (query: string) => {
        if (onPlayVideo) {
            onPlayVideo({ vod_name: query, title: query });
        } else if (onSearch) {
            onSearch(query);
        }
    };

    return (
        <div
            className="relative w-full rounded-3xl overflow-hidden mb-8 border border-white/10 shadow-2xl shadow-purple-950/40 group"
            style={{ minHeight: '380px' }}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* 背景大图 */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={currentSlide.cover}
                    alt={currentSlide.title}
                    fill
                    className="object-cover transition-transform duration-1000 scale-105 group-hover:scale-100"
                    priority
                    unoptimized
                />
                {/* 深度暗黑极光紫金渐变遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#060609] via-[#060609]/70 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#060609] via-[#060609]/80 to-transparent" />
            </div>

            {/* 内容区 */}
            <div className="relative z-10 p-6 sm:p-10 md:p-12 flex flex-col justify-end min-h-[380px] max-w-2xl">
                {/* 标签 */}
                <div className="flex items-center gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 backdrop-blur-md flex items-center gap-1 shadow-sm">
                        <Sparkles size={11} className="text-purple-300" />
                        {currentSlide.tag}
                    </span>
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                        {currentSlide.badge}
                    </span>
                </div>

                {/* 主标题 */}
                <h2 className="text-2xl sm:text-4xl font-black text-white mb-3 tracking-tight leading-tight drop-shadow-md">
                    {currentSlide.title}
                </h2>

                {/* 描述 */}
                <p className="text-xs sm:text-sm text-white/70 mb-6 line-clamp-2 leading-relaxed">
                    {currentSlide.description}
                </p>

                {/* 操作按钮区 */}
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => handlePlay(currentSlide.query)}
                        className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-bold text-sm hover:brightness-110 active:scale-95 shadow-xl shadow-purple-600/30 transition-all cursor-pointer"
                    >
                        <Play size={16} className="fill-white" />
                        立即探索
                    </button>

                    {/* 老板键提示 */}
                    <button
                        onClick={() => router.push('/')}
                        className="flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/15 text-white/80 hover:text-white border border-white/10 backdrop-blur-md text-xs font-medium transition-all cursor-pointer"
                        title="按 Esc 键瞬间退出至首页"
                    >
                        <EyeOff size={14} className="text-amber-400" />
                        <span>防窥 (Esc)</span>
                    </button>
                </div>
            </div>

            {/* 左右切换箭头 */}
            <button
                onClick={() => setCurrentIndex((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1))}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                aria-label="上一张"
            >
                <ChevronLeft size={20} />
            </button>
            <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length)}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/70 border border-white/10 text-white flex items-center justify-center backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-20 cursor-pointer"
                aria-label="下一张"
            >
                <ChevronRight size={20} />
            </button>

            {/* 底部指示圆点 */}
            <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
                {HERO_SLIDES.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setCurrentIndex(idx)}
                        className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            currentIndex === idx ? 'w-6 bg-gradient-to-r from-purple-400 to-amber-400' : 'w-1.5 bg-white/30'
                        }`}
                        aria-label={`切换到第 ${idx + 1} 张`}
                    />
                ))}
            </div>
        </div>
    );
}
