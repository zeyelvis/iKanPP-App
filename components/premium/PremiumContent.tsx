'use client';

import React, { useState, useEffect } from 'react';
import { MidnightHero } from './MidnightHero';
import { JableHeaderNav } from './JableHeaderNav';
import { JableVideoCard } from './JableVideoCard';
import { JableActressSlider } from './JableActressSlider';
import { JableStudioGalaxy } from './JableStudioGalaxy';
import { JableTagCloud } from './JableTagCloud';
import { JableFilterDrawer, type JableFilterState } from './JableFilterDrawer';
import { ActressDetailModal } from './ActressDetailModal';
import { MidnightContinueWatching } from './MidnightContinueWatching';
import { MidnightRecommendedRadar } from './MidnightRecommendedRadar';
import { JablePagination } from './JablePagination';
import { usePremiumContent } from '@/lib/hooks/usePremiumContent';
import {
    JABLE_MAIN_CATEGORIES,
    JABLE_RANKING_TABS,
    type JableCategory,
    type JableActress,
    type JableStudio,
} from '@/lib/constants/jable-categories';
import { Flame, Crown, Film, Sparkles, Filter, SlidersHorizontal, ShieldCheck } from 'lucide-react';

interface PremiumContentProps {
    onSearch?: (query: string) => void;
    onPlayVideo?: (video: any) => void;
}

export function PremiumContent({ onSearch, onPlayVideo }: PremiumContentProps) {
    const [activeCategoryId, setActiveCategoryId] = useState('all');
    const [rankingTabId, setRankingTabId] = useState('today');
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const [selectedActress, setSelectedActress] = useState<JableActress | null>(null);

    // 主内容请求（支持 Jable 时段榜单与关键词联动）
    const {
        videos,
        loading,
        hasMore,
        page,
        changePage,
    } = usePremiumContent(searchKeyword, rankingTabId);

    // 切换主分类
    const handleSelectCategory = (cat: JableCategory) => {
        setActiveCategoryId(cat.id);
        setSearchKeyword(cat.keyword);
        setSavedTopVideos([]);
    };

    // 切换时段排行榜 Tab
    const handleSelectRankingTab = (tabId: string) => {
        setRankingTabId(tabId);
        setSearchKeyword('');
        setSavedTopVideos([]);
    };

    // 选择女优（唤起女神专属独立主页）
    const handleSelectActress = (actress: JableActress) => {
        setSelectedActress(actress);
    };

    // 选择片商
    const handleSelectStudio = (studio: JableStudio) => {
        if (onSearch) {
            onSearch(studio.searchKey);
        } else {
            setSearchKeyword(studio.searchKey);
        }
    };

    // 选择标签
    const handleSelectTag = (tagKey: string) => {
        if (onSearch) {
            onSearch(tagKey);
        } else {
            setSearchKeyword(tagKey);
        }
    };

    // 应用复合筛选
    const handleApplyFilter = (filter: JableFilterState) => {
        const keywords = [filter.sub, filter.quality, filter.type, filter.year].filter(Boolean);
        const combined = keywords.join(' ');
        if (onSearch && combined) {
            onSearch(combined);
        } else {
            setSearchKeyword(combined);
        }
    };

    const handleVideoClick = (video: any) => {
        if (onPlayVideo) {
            onPlayVideo(video);
        } else if (onSearch) {
            onSearch(video.vod_name || video.title);
        }
    };

    // 榜单前 8 部与最新收录流
    // 为保证翻页时顶部“实时热播排行榜”和 Hero 轮播稳定不晃动，榜单始终固定在第 1 页拉取的 topVideos
    const [savedTopVideos, setSavedTopVideos] = useState<any[]>([]);

    useEffect(() => {
        if (videos.length > 0 && (savedTopVideos.length === 0 || page === 1)) {
            setSavedTopVideos(videos.slice(0, 8));
        }
    }, [videos, page, savedTopVideos.length]);

    const topVideos = savedTopVideos.length > 0 ? savedTopVideos : videos.slice(0, 8);
    // 第 1 页展示 8 之后的 12 部；第 2 页及以后展示整页 20 部全量视频
    const displayVideos = page === 1 ? videos.slice(8) : videos;

    // 翻页处理：触发数据加载并顺滑回滚至最新列表顶部锚点
    const handlePageChange = (targetPage: number) => {
        changePage(targetPage);
        const anchor = document.getElementById('latest-premium-top');
        if (anchor) {
            anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    const currentRankingTab = JABLE_RANKING_TABS.find(t => t.id === rankingTabId) || JABLE_RANKING_TABS[0];

    return (
        <div className="animate-fade-in space-y-7">
            {/* 1. Jable 顶部二级分类条 */}
            <JableHeaderNav
                activeCategory={activeCategoryId}
                onSelectCategory={handleSelectCategory}
            />

            {/* 2. Netflix 级 3D 沉浸式 Hero 轮播 */}
            <MidnightHero
                videos={videos}
                onPlayVideo={onPlayVideo}
                onExploreCategory={onSearch}
            />

            {/* 2.5 私密接着看断点续播快捷条 */}
            <MidnightContinueWatching onPlayVideo={handleVideoClick} />

            {/* 3. 🔥 时段多 Tab 联动排行榜 */}
            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-gradient-to-b from-amber-400 to-rose-500 rounded-full" />
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                            <Flame size={18} className="text-amber-400 fill-amber-400" />
                            排行榜单 · 实时热播
                        </h3>
                    </div>

                    {/* 4 大时段切换 Tab */}
                    <div className="flex items-center gap-1 bg-[#12131F] p-1 rounded-2xl border border-white/10">
                        {JABLE_RANKING_TABS.map((tab) => {
                            const isTabActive = rankingTabId === tab.id;

                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => handleSelectRankingTab(tab.id)}
                                    className={`flex items-center gap-1 px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        isTabActive
                                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-black shadow-md font-black scale-105'
                                            : 'text-white/60 hover:text-white hover:bg-white/5'
                                    }`}
                                >
                                    <span>{tab.icon}</span>
                                    <span>{tab.label}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {videos.length === 0 && loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <div key={`skel-top-${idx}`} className="flex flex-col rounded-2xl bg-[#0E0F17] border border-white/5 overflow-hidden animate-pulse">
                                <div className="relative aspect-[16/10] w-full bg-white/5" />
                                <div className="p-3 space-y-2">
                                    <div className="h-4 bg-white/10 rounded-md w-3/4" />
                                    <div className="flex justify-between items-center pt-1">
                                        <div className="h-3 bg-white/5 rounded w-1/4" />
                                        <div className="h-3 bg-white/5 rounded w-1/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {topVideos.map((video, idx) => (
                            <JableVideoCard
                                key={`top-${video.vod_id}-${idx}`}
                                video={video}
                                onClick={() => handleVideoClick(video)}
                                index={idx}
                                rankBadge={idx + 1}
                            />
                        ))}
                    </div>
                )}
            </section>

            {/* 4. 🌸 人气名优女神专区 */}
            <JableActressSlider onSelectActress={handleSelectActress} />

            {/* 5. 🏢 日本顶流片商宇宙专区 */}
            <JableStudioGalaxy
                onSelectStudio={(studio) => {
                    if (onSearch) {
                        onSearch(studio.codePrefix);
                    } else {
                        setSearchKeyword(studio.codePrefix);
                    }
                }}
            />

            {/* 6. 🏷️ 热门主题探索标签云 */}
            <JableTagCloud onSelectTag={handleSelectTag} />

            {/* 6.5 🧭 智能推荐雷达 */}
            <MidnightRecommendedRadar
                videos={videos}
                onPlayVideo={handleVideoClick}
                onExploreMore={() => setSearchKeyword('')}
            />

            {/* 7. ⚡ 最新收录全量流与高级筛选入口 */}
            <section className="space-y-4">
                {/* 翻页顺滑回滚定位锚点 */}
                <div id="latest-premium-top" className="scroll-mt-24" />

                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                            <Film size={18} className="text-purple-400" />
                            最新收录影片
                            {page > 1 && (
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 ml-1.5">
                                    第 {page} 页
                                </span>
                            )}
                        </h3>
                    </div>

                    {/* 高级筛选按钮 */}
                    <button
                        onClick={() => setIsFilterOpen(true)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                    >
                        <SlidersHorizontal size={13} />
                        <span>高级筛选</span>
                    </button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {Array.from({ length: 8 }).map((_, idx) => (
                            <div key={`skel-rem-${idx}`} className="flex flex-col rounded-2xl bg-[#0E0F17] border border-white/5 overflow-hidden animate-pulse">
                                <div className="relative aspect-[16/10] w-full bg-white/5" />
                                <div className="p-3 space-y-2">
                                    <div className="h-4 bg-white/10 rounded-md w-3/4" />
                                    <div className="flex justify-between items-center pt-1">
                                        <div className="h-3 bg-white/5 rounded w-1/4" />
                                        <div className="h-3 bg-white/5 rounded w-1/4" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayVideos.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {displayVideos.map((video, idx) => (
                            <JableVideoCard
                                key={`rem-${video.vod_id}-${idx}`}
                                video={video}
                                onClick={() => handleVideoClick(video)}
                                index={page === 1 ? idx + 8 : idx}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="py-16 text-center text-white/40 text-sm">
                        暂未收录更多该分类影片
                    </div>
                )}

                {/* 专属暗黑霓虹数字分页器 */}
                {videos.length > 0 && (
                    <JablePagination
                        currentPage={page}
                        hasMore={hasMore}
                        loading={loading}
                        onPageChange={handlePageChange}
                    />
                )}
            </section>

            {/* 8. 专属暗黑免责与隐私说明 Footer */}
            <footer className="pt-10 pb-6 border-t border-white/10 text-center space-y-3">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-amber-400/80">
                    <ShieldCheck size={16} />
                    <span>iKanX 专属加密影院 · 100% 隐私无痕保障</span>
                </div>
                <p className="text-[11px] text-white/30 max-w-xl mx-auto leading-relaxed">
                    本专区所有资源均通过海外加密专线实时秒播，仅供成年人 (18+) 私人学术交流与影视鉴赏，系统不记录任何用户本地观影私密隐私。
                </p>
                <div className="text-[10px] text-white/20 font-mono">
                    © 2026 iKanX. All rights reserved.
                </div>
            </footer>

            {/* 多维复合高级筛选抽屉 */}
            <JableFilterDrawer
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
                onApplyFilter={handleApplyFilter}
            />

            {/* 女神专属独立主页弹窗 */}
            <ActressDetailModal
                actress={selectedActress}
                isOpen={!!selectedActress}
                onClose={() => setSelectedActress(null)}
                onPlayVideo={handleVideoClick}
            />
        </div>
    );
}
