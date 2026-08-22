'use client';

import React from 'react';
import {
    MIDNIGHT_CATEGORIES,
    MIDNIGHT_SORT_OPTIONS,
    type MidnightCategory,
    type MidnightSortType,
} from '@/lib/constants/midnight-categories';
import { Sparkles, Layers, SlidersHorizontal } from 'lucide-react';

interface MidnightFilterProps {
    activeCategory: string;
    activeSort: MidnightSortType;
    onSelectCategory: (category: MidnightCategory) => void;
    onSelectSort: (sort: MidnightSortType) => void;
}

export function MidnightFilter({
    activeCategory,
    activeSort,
    onSelectCategory,
    onSelectSort,
}: MidnightFilterProps) {
    return (
        <div className="mb-8 space-y-5">
            {/* 1. 顶部 8 大专业视觉频道直通卡片 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {MIDNIGHT_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat)}
                            className={`group relative p-3 rounded-2xl text-left transition-all duration-300 cursor-pointer overflow-hidden border ${
                                isActive
                                    ? 'bg-gradient-to-b from-purple-950/80 to-purple-900/40 border-purple-500/60 shadow-lg shadow-purple-950/50 scale-[1.02]'
                                    : 'bg-[#0E0F17]/80 hover:bg-[#151624] border-white/5 hover:border-white/15'
                            }`}
                        >
                            {/* 激活时的顶部流光 */}
                            {isActive && (
                                <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple-400 via-pink-400 to-amber-400" />
                            )}

                            <div className="flex items-center justify-between mb-1.5">
                                <span className="text-xl group-hover:scale-110 transition-transform">
                                    {cat.icon}
                                </span>
                                <span
                                    className={`text-[9px] font-black px-1.5 py-0.2 rounded-md ${
                                        isActive
                                            ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                                            : 'bg-white/5 text-white/40'
                                    }`}
                                >
                                    {cat.tag}
                                </span>
                            </div>

                            <div
                                className={`text-xs font-bold truncate transition-colors ${
                                    isActive ? 'text-white' : 'text-white/80 group-hover:text-white'
                                }`}
                            >
                                {cat.label}
                            </div>

                            <div className="text-[10px] text-white/40 truncate mt-0.5">
                                {cat.description.split('·')[0]}
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* 2. 次级智能排序胶囊条 */}
            <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#0E0F17]/60 border border-white/5 backdrop-blur-md">
                <div className="flex items-center gap-2 text-xs font-bold text-white/50 pl-1">
                    <SlidersHorizontal size={14} className="text-purple-400" />
                    <span>智能排序</span>
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {MIDNIGHT_SORT_OPTIONS.map((sort) => {
                        const isSortActive = activeSort === sort.id;

                        return (
                            <button
                                key={sort.id}
                                onClick={() => onSelectSort(sort.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer shrink-0 ${
                                    isSortActive
                                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md shadow-purple-600/25 font-bold'
                                        : 'bg-white/5 hover:bg-white/10 text-white/60 hover:text-white border border-white/5'
                                }`}
                            >
                                <span>{sort.icon}</span>
                                <span>{sort.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
