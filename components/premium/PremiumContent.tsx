'use client';

import { useState } from 'react';
import { MidnightHero } from './MidnightHero';
import { MidnightFilter } from './MidnightFilter';
import { PremiumContentGrid } from './PremiumContentGrid';
import { usePremiumContent } from '@/lib/hooks/usePremiumContent';
import {
    MIDNIGHT_CATEGORIES,
    type MidnightCategory,
    type MidnightSortType,
} from '@/lib/constants/midnight-categories';

interface PremiumContentProps {
    onSearch?: (query: string) => void;
}

export function PremiumContent({ onSearch }: PremiumContentProps) {
    const [activeCategory, setActiveCategory] = useState('featured');
    const [activeKeyword, setActiveKeyword] = useState('');
    const [activeSort, setActiveSort] = useState<MidnightSortType>('recommend');

    const {
        videos,
        loading,
        hasMore,
        prefetchRef,
        loadMoreRef,
    } = usePremiumContent(activeKeyword);

    const handleCategorySelect = (cat: MidnightCategory) => {
        setActiveCategory(cat.id);
        setActiveKeyword(cat.keyword);
    };

    const handleSortSelect = (sort: MidnightSortType) => {
        setActiveSort(sort);
    };

    const handleVideoClick = (video: any) => {
        if (onSearch) {
            onSearch(video.vod_name || video.title);
        }
    };

    return (
        <div className="animate-fade-in space-y-6">
            {/* 1. 专属暗夜高奢 Hero Banner */}
            <MidnightHero onSearch={onSearch} />

            {/* 2. 专业多维分类与排序矩阵 */}
            <MidnightFilter
                activeCategory={activeCategory}
                activeSort={activeSort}
                onSelectCategory={handleCategorySelect}
                onSelectSort={handleSortSelect}
            />

            {/* 3. 影视内容无尽流网格 */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <span className="w-1.5 h-4 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full" />
                        <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                            {MIDNIGHT_CATEGORIES.find(c => c.id === activeCategory)?.label || '今日精选'}
                        </h3>
                        <span className="text-xs text-white/40 hidden sm:inline">
                            · {MIDNIGHT_CATEGORIES.find(c => c.id === activeCategory)?.description}
                        </span>
                    </div>
                    <span className="text-xs text-purple-400 font-medium">
                        蓝光专线秒播
                    </span>
                </div>

                <PremiumContentGrid
                    videos={videos}
                    loading={loading}
                    hasMore={hasMore}
                    onVideoClick={handleVideoClick}
                    prefetchRef={prefetchRef}
                    loadMoreRef={loadMoreRef}
                />
            </div>
        </div>
    );
}

