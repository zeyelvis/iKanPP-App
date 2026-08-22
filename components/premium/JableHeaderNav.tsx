'use client';

import React from 'react';
import { JABLE_MAIN_CATEGORIES, type JableCategory } from '@/lib/constants/jable-categories';
import { Flame, Sparkles } from 'lucide-react';

interface JableHeaderNavProps {
    activeCategory: string;
    onSelectCategory: (category: JableCategory) => void;
}

export function JableHeaderNav({
    activeCategory,
    onSelectCategory,
}: JableHeaderNavProps) {
    return (
        <div className="w-full bg-[#0D0E16]/95 border-y border-white/10 backdrop-blur-2xl sticky top-14 z-20 shadow-xl mb-6">
            <div className="fluid-container py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar scroll-smooth">
                {JABLE_MAIN_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.id;

                    return (
                        <button
                            key={cat.id}
                            onClick={() => onSelectCategory(cat)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer ${
                                isActive
                                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-600/30 scale-105'
                                    : 'text-white/70 hover:text-white hover:bg-white/10'
                            }`}
                        >
                            <span className="text-sm">{cat.icon}</span>
                            <span>{cat.label}</span>
                            {cat.badge && (
                                <span
                                    className={`text-[9px] px-1 py-0.2 rounded font-black tracking-tighter ${
                                        isActive
                                            ? 'bg-white text-purple-900'
                                            : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                                    }`}
                                >
                                    {cat.badge}
                                </span>
                            )}
                            {cat.isHot && !isActive && (
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
