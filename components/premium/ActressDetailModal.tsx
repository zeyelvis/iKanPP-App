'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Film, Sparkles, Flame, Calendar, Award, Play } from 'lucide-react';
import type { JableActress } from '@/lib/constants/jable-categories';
import { JableVideoCard } from './JableVideoCard';
import { usePremiumContent } from '@/lib/hooks/usePremiumContent';

interface ActressDetailModalProps {
    actress: JableActress | null;
    isOpen: boolean;
    onClose: () => void;
    onPlayVideo: (video: any) => void;
}

export function ActressDetailModal({
    actress,
    isOpen,
    onClose,
    onPlayVideo
}: ActressDetailModalProps) {
    const [activeFilter, setActiveFilter] = useState<'all' | 'hot' | 'sub'>('all');

    // 动态拉取该女优的作品集
    const searchKeyword = actress ? `${actress.searchKey} ${activeFilter === 'sub' ? '中文字幕' : ''}`.trim() : '';
    const { videos, loading } = usePremiumContent(searchKeyword, 'today');

    // ESC 键关闭弹窗
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            window.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, onClose]);

    if (!isOpen || !actress) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl animate-fade-in">
            {/* 弹窗主体卡片 */}
            <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col rounded-3xl bg-[#0B0C14] border border-purple-500/30 shadow-2xl shadow-purple-950/60 overflow-hidden">
                
                {/* 顶部背景装饰极光光晕 */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
                <div className="absolute top-10 left-10 w-80 h-80 bg-pink-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

                {/* 右上角关闭按钮 */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer hover:scale-105 active:scale-95"
                    aria-label="关闭"
                >
                    <X size={18} />
                </button>

                {/* 1. 女神专属个人介绍 Hero 区域 */}
                <div className="p-6 sm:p-8 bg-gradient-to-b from-purple-950/40 via-purple-900/10 to-transparent border-b border-white/5 shrink-0">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* 官方正版写真高清大头照 */}
                        <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden ring-4 ring-purple-500/40 shadow-xl shadow-purple-600/20 shrink-0 group">
                            <Image
                                src={actress.avatar}
                                alt={actress.name}
                                fill
                                sizes="(max-width: 640px) 112px, 144px"
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                priority
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        </div>

                        {/* 女优文字档案与专属荣誉 */}
                        <div className="flex-1 text-center sm:text-left space-y-2.5">
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                    {actress.name}
                                </h2>
                                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-black shadow-md flex items-center gap-1">
                                    <Sparkles size={11} />
                                    {actress.tag}
                                </span>
                            </div>

                            <p className="text-xs sm:text-sm text-white/60 max-w-2xl leading-relaxed">
                                日本 S 级顶流超人气偶像女神，代表作涵盖多部年度封神榜单大作。专属 4K 原画收录库，支持中文字幕与极速专线秒播。
                            </p>

                            {/* 互动指标徽章 */}
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 pt-1 text-xs">
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-white/80">
                                    <Film size={13} className="text-purple-400" />
                                    <span>收录作品：<strong className="text-white font-bold">{actress.videoCount}+ 部</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/5 border border-white/10 text-amber-300">
                                    <Award size={13} className="text-amber-400" />
                                    <span>好评率：<strong className="text-amber-300 font-bold">99.2%</strong></span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-300">
                                    <Flame size={13} className="text-pink-400" />
                                    <span>全网热度：<strong>TOP 1</strong></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 作品筛选过滤器 */}
                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/5">
                        <span className="text-xs font-bold text-white/40 mr-1">作品排序：</span>
                        <button
                            onClick={() => setActiveFilter('all')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeFilter === 'all'
                                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                                    : 'bg-white/5 text-white/60 hover:text-white'
                            }`}
                        >
                            全部作品
                        </button>
                        <button
                            onClick={() => setActiveFilter('sub')}
                            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                activeFilter === 'sub'
                                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                                    : 'bg-white/5 text-white/60 hover:text-white'
                            }`}
                        >
                            🔥 中文字幕
                        </button>
                    </div>
                </div>

                {/* 2. 女神专属作品瀑布流列表（可滚动区） */}
                <div className="p-4 sm:p-6 overflow-y-auto flex-1 custom-scrollbar">
                    {loading && videos.length === 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {Array.from({ length: 8 }).map((_, idx) => (
                                <div key={`actress-skel-${idx}`} className="flex flex-col rounded-2xl bg-white/5 animate-pulse overflow-hidden">
                                    <div className="aspect-[16/10] bg-white/10" />
                                    <div className="p-3 space-y-2">
                                        <div className="h-4 bg-white/10 rounded w-3/4" />
                                        <div className="h-3 bg-white/5 rounded w-1/2" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : videos.length > 0 ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                            {videos.map((video, idx) => (
                                <JableVideoCard
                                    key={`actress-vid-${video.vod_id}-${idx}`}
                                    video={video}
                                    onClick={() => {
                                        onClose();
                                        onPlayVideo(video);
                                    }}
                                    index={idx}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="py-16 text-center text-white/40 text-xs">
                            暂未收录更多该分类作品
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
