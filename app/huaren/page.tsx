'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { SearchForm } from '@/components/search/SearchForm';
import { SearchResults } from '@/components/home/SearchResults';
import { useHomePage } from '@/lib/hooks/useHomePage';
import { HUAREN_REAL_SECTIONS, HuarenRealCard, HuarenRealSection } from '@/lib/data/huaren-real-data';
import { Play, ChevronRight, Flame } from 'lucide-react';

// 统一图片安全代理方法（100% 杜绝黑屏与防盗链拦截）
function getSafeCoverUrl(rawUrl: string): string {
    if (!rawUrl) return '';
    if (rawUrl.startsWith('/api/')) return rawUrl;
    return `/api/img-proxy?url=${encodeURIComponent(rawUrl)}`;
}

function HuarenHome() {
    const router = useRouter();
    // 初始状态使用高保真预置数据实现 0 毫秒首屏秒出，随后后台自动拉取最新实时数据平滑同步
    const [sections, setSections] = useState<HuarenRealSection[]>(HUAREN_REAL_SECTIONS);

    const {
        query,
        hasSearched,
        loading: searchLoading,
        results: searchResults,
        availableSources,
        handleSearch,
        handleReset,
    } = useHomePage();

    // 页面挂载后在后台实时拉取 huaren.live 官方最新更新（新剧/新电影/新榜单）
    useEffect(() => {
        let isMounted = true;
        fetch('/api/huaren?mode=home')
            .then((res) => res.json())
            .then((json) => {
                if (isMounted && json.success && Array.isArray(json.sections) && json.sections.length > 0) {
                    setSections(json.sections);
                }
            })
            .catch(() => {
                // 网络异常自动保留预置高保真数据，用户体验不受任何影响
            });
        return () => {
            isMounted = false;
        };
    }, []);

    // 播放逻辑：传 title 和 type，由播放器并发调度 36 大影视专线直解秒播！
    const handlePlayVideo = useCallback((item: { title: string; type?: string }) => {
        if (!item.title) return;
        const cleanTitle = item.title.trim();
        const typeParam = item.type === 'movie' ? 'movie' : 'tv';
        router.push(`/player?title=${encodeURIComponent(cleanTitle)}&type=${typeParam}`);
    }, [router]);

    return (
        <div className="min-h-screen bg-[#14151B] text-white relative overflow-x-hidden selection:bg-rose-500 selection:text-white">
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

            <main className="fluid-container pb-24 space-y-12">
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
                        {/* 1:1 Huaren.live 原版各大板块（左侧 2行x5列网格 + 右侧 Top 10 排行榜） */}
                        {sections.map((section: HuarenRealSection) => (
                            <section key={section.id} className="space-y-4">
                                {/* 1. 板块 Header */}
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                                    {/* 左侧大标题 + 更多 */}
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                                {section.title}
                                            </h2>
                                            <button
                                                onClick={() => router.push(section.type === 'movie' ? '/movie' : '/tv')}
                                                className="text-xs text-white/50 hover:text-white flex items-center transition-colors cursor-pointer mt-0.5"
                                            >
                                                <span>更多</span>
                                                <ChevronRight size={14} />
                                            </button>
                                        </div>

                                        {/* 横向胶囊分类筛选标签 */}
                                        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto scrollbar-none">
                                            {section.tags.map((tag, idx) => (
                                                <button
                                                    key={idx}
                                                    onClick={() => handlePlayVideo({ title: tag, type: section.type })}
                                                    className="px-3 py-1 rounded-full text-xs text-white/70 hover:text-white bg-white/[0.04] hover:bg-white/10 border border-white/5 transition-all cursor-pointer shrink-0"
                                                >
                                                    {tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* 右侧榜单标题 (对应右侧侧边栏) */}
                                    <div className="hidden lg:block w-[280px] shrink-0">
                                        <h3 className="text-lg font-bold text-white tracking-tight">
                                            {section.rankTitle}
                                        </h3>
                                    </div>
                                </div>

                                {/* 2. 主内容区域：左侧 2x5 网格 (10部) + 右侧 Top 10 榜单 */}
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    {/* 左侧：2 行 × 5 列 = 10 部卡片网格 (占 9 栏) */}
                                    <div className="lg:col-span-9 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                                        {section.cards.slice(0, 10).map((card: HuarenRealCard) => (
                                            <HuarenMovieCard
                                                key={card.vodId}
                                                card={card}
                                                type={section.type}
                                                onClick={() => handlePlayVideo({ title: card.title, type: section.type })}
                                            />
                                        ))}
                                    </div>

                                    {/* 右侧：Top 10 排行榜卡片列表 (占 3 栏) */}
                                    <div className="lg:col-span-3 bg-[#1A1B22]/90 rounded-2xl border border-white/[0.06] p-4 flex flex-col justify-between shadow-xl">
                                        <h3 className="lg:hidden text-base font-bold text-white mb-3 pb-2 border-b border-white/10">
                                            {section.rankTitle}
                                        </h3>

                                        <div className="space-y-2.5">
                                            {section.rankings.map((item) => {
                                                const isTop1 = item.rank === 1;
                                                const isTop2 = item.rank === 2;
                                                const isTop3 = item.rank === 3;

                                                return (
                                                    <div
                                                        key={item.rank}
                                                        onClick={() => handlePlayVideo({ title: item.title, type: section.type })}
                                                        className="group flex items-center justify-between p-1.5 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer"
                                                    >
                                                        {/* 排名与标题 */}
                                                        <div className="flex items-center gap-2.5 min-w-0 pr-2">
                                                            {/* NO 标志与排名数字 (1~3 红色/橙色高光斜体) */}
                                                            <div className="flex items-baseline gap-1 shrink-0 w-8">
                                                                <span className="text-[10px] italic text-white/30 font-semibold">NO</span>
                                                                <span className={`text-base font-black italic ${
                                                                    isTop1 ? 'text-[#FF4D4F]' : isTop2 ? 'text-[#FA8C16]' : isTop3 ? 'text-[#FAAD14]' : 'text-white/40'
                                                                }`}>
                                                                    {item.rank}
                                                                </span>
                                                            </div>

                                                            <div className="min-w-0">
                                                                <p className="text-xs sm:text-sm font-bold text-white/90 group-hover:text-rose-400 truncate transition-colors">
                                                                    {item.title}
                                                                </p>
                                                                <p className="text-[10px] text-white/40 truncate">
                                                                    {item.status}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* 右侧热度火焰 🔥🔥🔥🔥🔥 */}
                                                        <div className="flex items-center gap-0.5 text-amber-500 text-xs shrink-0">
                                                            <Flame size={11} className="fill-amber-500 text-amber-500" />
                                                            <Flame size={11} className="fill-amber-500 text-amber-500" />
                                                            <Flame size={11} className="fill-amber-500 text-amber-500" />
                                                            <Flame size={11} className="fill-amber-500 text-amber-500" />
                                                            <Flame size={11} className="fill-amber-500 text-amber-500" />
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        ))}
                    </>
                )}
            </main>
        </div>
    );
}

// 1:1 Huaren.live 原版竖版电影卡片组件
function HuarenMovieCard({
    card,
    type,
    onClick,
}: {
    card: HuarenRealCard;
    type: 'movie' | 'tv';
    onClick: () => void;
}) {
    const [imgError, setImgError] = useState(false);
    const coverUrl = getSafeCoverUrl(card.cover);

    return (
        <div
            onClick={onClick}
            className="group relative flex flex-col cursor-pointer select-none transition-transform duration-300 hover:-translate-y-1.5"
        >
            {/* 封面区域 (3:4 比例，圆角 16px) */}
            <div className="relative aspect-[3/4] w-full rounded-2xl bg-[#1C1D24] overflow-hidden shadow-lg border border-white/[0.04] group-hover:border-white/20 transition-all">
                {!imgError && coverUrl ? (
                    <Image
                        src={coverUrl}
                        alt={card.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 15vw"
                        className="object-cover object-center scale-100 group-hover:scale-106 transition-transform duration-700 ease-out"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-black flex flex-col items-center justify-center p-3 text-center">
                        <span className="text-xs font-bold text-white/80 line-clamp-2">{card.title}</span>
                    </div>
                )}

                {/* 悬停微暗影 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 opacity-60 group-hover:opacity-30 transition-opacity" />

                {/* 右上角彩色气泡角标 (如“甜虐爱情”、“剧情”、“推理”、“戏剧”) */}
                {card.badge && (
                    <div className={`absolute top-2 right-2 z-20 px-2 py-0.5 rounded-md text-[10px] font-bold shadow-md ${card.badgeColor || 'bg-emerald-500 text-white'}`}>
                        {card.badge}
                    </div>
                )}

                {/* 右下角集数角标 (如“16”、“第24集完结”、“第14集”) */}
                {card.episode && (
                    <div className="absolute bottom-2 right-2 z-20 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] text-white/90 font-medium">
                        {card.episode}
                    </div>
                )}

                {/* 悬停居中浮现播放图标 */}
                <div className="absolute inset-0 z-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-xl scale-75 group-hover:scale-100 transition-transform duration-300">
                        <Play size={20} className="fill-white ml-0.5" />
                    </div>
                </div>
            </div>

            {/* 标题与副标题 */}
            <div className="pt-2.5 space-y-0.5 px-0.5">
                <h4 className="text-xs sm:text-sm font-bold text-white/95 group-hover:text-rose-400 line-clamp-1 transition-colors">
                    {card.title}
                </h4>
                <p className="text-[11px] text-white/40 line-clamp-1">
                    {card.desc}
                </p>
            </div>
        </div>
    );
}

export default function HuarenPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#14151B]">
                <div className="w-8 h-8 rounded-full border-2 border-rose-500 border-t-transparent animate-spin" />
            </div>
        }>
            <HuarenHome />
        </Suspense>
    );
}
