'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchResults } from '@/components/home/SearchResults';
import { useHomePage } from '@/lib/hooks/useHomePage';
import { Globe, Flame, Film, Play } from 'lucide-react';
import { useFavorites } from '@/lib/store/favorites-store';

interface VideoItem {
    vod_id: string;
    vod_name: string;
    vod_pic: string;
    vod_remarks?: string;
    type_name?: string;
    vod_year?: string;
    source: string;
}

const HUAREN_CATEGORIES = [
    { id: 'hot', label: '🔥 今日最热', mode: 'hot' },
    { id: 'movie', label: '🎬 华语大片', mode: 'movie' },
    { id: 'tv', label: '📺 热门剧集', mode: 'tv' },
    { id: 'variety', label: '🎪 精彩综艺', mode: 'variety' },
    { id: 'anime', label: '✨ 动漫新番', mode: 'anime' },
];

function HuarenContent() {
    const router = useRouter();
    const [currentMode, setCurrentMode] = useState('hot');
    const [videos, setVideos] = useState<VideoItem[]>([]);
    const [loading, setLoading] = useState(true);

    const {
        query,
        hasSearched,
        loading: searchLoading,
        results: searchResults,
        availableSources,
        handleSearch,
        handleReset,
    } = useHomePage();

    useEffect(() => {
        let isMounted = true;
        setLoading(true);

        fetch(`/api/huaren?mode=${currentMode}`)
            .then(res => res.json())
            .then(data => {
                if (isMounted && data.videos) {
                    setVideos(data.videos);
                }
            })
            .catch(console.error)
            .finally(() => {
                if (isMounted) setLoading(false);
            });

        return () => {
            isMounted = false;
        };
    }, [currentMode]);

    const handlePlayVideo = (video: VideoItem) => {
        const title = video.vod_name;
        if (title) {
            router.push(`/player?title=${encodeURIComponent(title)}&type=tv&id=${encodeURIComponent(video.vod_id)}`);
        }
    };

    // 精选滑块大片
    const featuredVideos = videos.slice(0, 6);
    const regularVideos = videos.slice(6);

    return (
        <div className="min-h-screen bg-[#07080D] text-white relative overflow-x-hidden selection:bg-rose-500 selection:text-white">
            {/* 环境氛围极光 */}
            <div className="fixed top-0 left-1/4 w-96 h-96 bg-rose-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />
            <div className="fixed top-1/3 right-10 w-96 h-96 bg-amber-600/10 rounded-full blur-[140px] pointer-events-none -z-10" />

            {/* 顶部 Navbar */}
            <Navbar onReset={handleReset} />

            {/* 专属搜索栏 */}
            <div className="fluid-container mt-4 mb-6 relative z-30">
                <SearchForm
                    onSearch={handleSearch}
                    onClear={handleReset}
                    isLoading={searchLoading}
                />
            </div>

            <main className="fluid-container pb-20 space-y-8">
                {/* 搜索结果展示 */}
                {hasSearched ? (
                    <SearchResults
                        query={query}
                        loading={searchLoading}
                        results={searchResults}
                        availableSources={availableSources}
                    />
                ) : (
                    <>
                        {/* 1. 🌏 华人专属大标题 */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-500 via-red-600 to-amber-600 flex items-center justify-center shadow-lg shadow-rose-500/30">
                                    <Globe size={22} className="text-white" />
                                </div>
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
                                        华人影视专区 · Huaren.live
                                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                            海外华人首选
                                        </span>
                                    </h1>
                                    <p className="text-xs text-white/50 mt-0.5">
                                        全球华语院线大片 · 国产热播大剧 · 港台经典 · 零广告 4K 蓝光全免秒播
                                    </p>
                                </div>
                            </div>

                            {/* 分类快捷标签栏 */}
                            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1">
                                {HUAREN_CATEGORIES.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setCurrentMode(cat.mode)}
                                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                            currentMode === cat.mode
                                                ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-md shadow-rose-500/30 scale-105'
                                                : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                                        }`}
                                    >
                                        {cat.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* 2. 🎞️ 首屏精选平铺画廊 */}
                        {featuredVideos.length > 0 && (
                            <section className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-black text-white/90 flex items-center gap-1.5">
                                        <Flame size={16} className="text-rose-400" />
                                        <span>今日焦点精选</span>
                                    </h3>
                                </div>

                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                                    {featuredVideos.map((video, idx) => (
                                        <HuarenCard
                                            key={`feat-${video.vod_id}-${idx}`}
                                            video={video}
                                            onClick={() => handlePlayVideo(video)}
                                            isFeatured={true}
                                        />
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* 3. 🎬 全量网格流 */}
                        <section className="space-y-4 pt-2">
                            <div className="flex items-center justify-between">
                                <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                                    <Film size={18} className="text-amber-400" />
                                    <span>全部热播影剧</span>
                                </h3>
                                <span className="text-xs text-white/40 font-mono">
                                    实时同步 Huaren.live 最新流
                                </span>
                            </div>

                            {loading ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                    {Array.from({ length: 8 }).map((_, idx) => (
                                        <div key={`skel-${idx}`} className="flex flex-col rounded-2xl bg-[#0E0F17] border border-white/5 overflow-hidden animate-pulse">
                                            <div className="relative aspect-[16/10] w-full bg-white/5" />
                                            <div className="p-3 space-y-2">
                                                <div className="h-4 bg-white/10 rounded-md w-3/4" />
                                                <div className="h-3 bg-white/5 rounded w-1/3" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                                    {regularVideos.map((video, idx) => (
                                        <HuarenCard
                                            key={`reg-${video.vod_id}-${idx}`}
                                            video={video}
                                            onClick={() => handlePlayVideo(video)}
                                        />
                                    ))}
                                </div>
                            )}
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

function HuarenCard({ video, onClick, isFeatured }: { video: VideoItem; onClick: () => void; isFeatured?: boolean }) {
    const [imgError, setImgError] = useState(false);
    const { isFavorite } = useFavorites();
    const isFav = isFavorite(video.vod_id, video.source || 'huaren');

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-rose-500/40 shadow-lg hover:shadow-[0_12px_36px_rgba(244,63,94,0.2)] transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1.5 select-none"
        >
            {/* 封面区域 */}
            <div className="relative aspect-[16/10] w-full bg-[#0E0F17] overflow-hidden">
                {video.vod_pic && !imgError ? (
                    <Image
                        src={video.vod_pic}
                        alt={video.vod_name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover scale-100 group-hover:scale-108 transition-transform duration-700 ease-out"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-rose-950/40 to-black flex items-center justify-center text-white/30 text-xs font-mono">
                        4K 原画
                    </div>
                )}

                {/* 悬停暗影 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0C14] via-black/20 to-transparent opacity-80 group-hover:opacity-40 transition-opacity" />

                {/* 精选徽章 */}
                {isFeatured && (
                    <div className="absolute top-0 left-0 z-20 overflow-hidden w-14 h-14 pointer-events-none">
                        <div className="absolute -top-6 -left-6 w-14 h-14 bg-gradient-to-br from-rose-500 to-red-600 rotate-45 flex items-end justify-center pb-0.5 shadow-md">
                            <span className="text-[8px] font-black text-white uppercase">
                                精选
                            </span>
                        </div>
                    </div>
                )}

                {/* 4K 标志 */}
                <div className="absolute top-2 right-2 z-20 px-1.5 py-0.5 rounded-md bg-black/70 backdrop-blur-md border border-white/10 text-white text-[9px] font-black">
                    4K 原画
                </div>

                {/* 悬停居中浮现大播放键 */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-rose-500 to-amber-500 text-white flex items-center justify-center shadow-xl shadow-rose-500/40 scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play size={18} className="fill-white ml-0.5" />
                    </div>
                </div>

                {/* 底部备注状态 */}
                {video.vod_remarks && (
                    <div className="absolute bottom-2 left-2 z-20 px-1.5 py-0.5 rounded-md bg-black/80 backdrop-blur-md text-amber-300 text-[10px] font-bold">
                        {video.vod_remarks}
                    </div>
                )}
            </div>

            {/* 标题 */}
            <div className="p-3 space-y-1">
                <h4 className="text-xs sm:text-sm font-bold text-white/90 group-hover:text-rose-400 line-clamp-1 transition-colors">
                    {video.vod_name}
                </h4>
                <div className="flex items-center justify-between text-[11px] text-white/40">
                    <span>{video.type_name || '华语精选'}</span>
                    <span className="text-[10px] text-emerald-400 font-bold">极速秒播</span>
                </div>
            </div>
        </div>
    );
}

export default function HuarenPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#07080D]">
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
            </div>
        }>
            <HuarenContent />
        </Suspense>
    );
}
