'use client';

import React, { useState } from 'react';
import { MidnightHero } from './MidnightHero';
import { JableHeaderNav } from './JableHeaderNav';
import { JableVideoCard } from './JableVideoCard';
import { JableActressSlider } from './JableActressSlider';
import { JableTagCloud } from './JableTagCloud';
import { usePremiumContent } from '@/lib/hooks/usePremiumContent';
import { JABLE_MAIN_CATEGORIES, type JableCategory, type JableActress } from '@/lib/constants/jable-categories';
import { Flame, Crown, Film, Sparkles, ChevronRight } from 'lucide-react';

interface PremiumContentProps {
    onSearch?: (query: string) => void;
}

export function PremiumContent({ onSearch }: PremiumContentProps) {
    const [activeCategoryId, setActiveCategoryId] = useState('all');
    const [searchKeyword, setSearchKeyword] = useState('');

    const {
        videos,
        loading,
        hasMore,
        prefetchRef,
        loadMoreRef,
    } = usePremiumContent(searchKeyword);

    const handleSelectCategory = (cat: JableCategory) => {
        setActiveCategoryId(cat.id);
        setSearchKeyword(cat.keyword);
    };

    const handleSelectActress = (actress: JableActress) => {
        if (onSearch) {
            onSearch(actress.searchKey);
        } else {
            setSearchKeyword(actress.searchKey);
        }
    };

    const handleSelectTag = (tagKey: string) => {
        if (onSearch) {
            onSearch(tagKey);
        } else {
            setSearchKeyword(tagKey);
        }
    };

    const handleVideoClick = (video: any) => {
        if (onSearch) {
            onSearch(video.vod_name || video.title);
        }
    };

    // 今日最热 Top 8
    const topVideos = videos.slice(0, 8);
    // 最新发布余下流
    const remainingVideos = videos.slice(8);

    const currentCatObj = JABLE_MAIN_CATEGORIES.find(c => c.id === activeCategoryId);

    return (
        <div className="animate-fade-in space-y-6">
            {/* 1. 顶部专业 Jable 横向二级分类条 */}
            <JableHeaderNav
                activeCategory={activeCategoryId}
                onSelectCategory={handleSelectCategory}
            />

            {/* 2. 沉浸式 Hero 影视大片轮播 */}
            <MidnightHero onSearch={onSearch} />

            {/* 3. 🌸 人气名优女神推荐专区 */}
            <JableActressSlider onSelectActress={handleSelectActress} />

            {/* 4. 🔥 今日最热 Top 8 分区 */}
            {topVideos.length > 0 && (
                <section className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                            <span className="w-1.5 h-4 bg-gradient-to-b from-amber-400 to-rose-500 rounded-full" />
                            <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                                <Flame size={18} className="text-amber-400 fill-amber-400" />
                                {currentCatObj ? `${currentCatObj.label} · 今日榜单` : '今日最热排行'}
                            </h3>
                        </div>
                        <span className="text-xs text-amber-400/80 font-bold">
                            TOP 8 实时热播
                        </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                        {topVideos.map((video, idx) => (
                            <JableVideoCard
                                key={`${video.vod_id}-${idx}`}
                                video={video}
                                onClick={() => handleVideoClick(video)}
                                index={idx}
                                rankBadge={idx + 1}
                            />
                        ))}
                    </div>
                </section>
            )}

            {/* 5. 🏷️ 热门主题探索标签云 */}
            <JableTagCloud onSelectTag={handleSelectTag} />

            {/* 6. ⚡ 更多精选与无尽全量流 */}
            <section className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                        <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                            <Film size={18} className="text-purple-400" />
                            最新收录影片
                        </h3>
                    </div>
                    <span className="text-xs text-purple-300/60">
                        官方 4K / 1080P 极清
                    </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                    {remainingVideos.map((video, idx) => (
                        <JableVideoCard
                            key={`rem-${video.vod_id}-${idx}`}
                            video={video}
                            onClick={() => handleVideoClick(video)}
                            index={idx + 8}
                        />
                    ))}
                </div>

                {/* 滚动加载指示器 */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* 无限滚动触发锚点 */}
                <div ref={prefetchRef} className="h-10" />
                <div ref={loadMoreRef} className="h-10" />
            </section>
        </div>
    );
}
