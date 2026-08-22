'use client';

import React from 'react';
import { JABLE_STUDIOS, type JableStudio } from '@/lib/constants/jable-categories';
import { Building2, ChevronRight, Sparkles } from 'lucide-react';

interface JableStudioSliderProps {
    onSelectStudio: (studio: JableStudio) => void;
}

export function JableStudioSlider({ onSelectStudio }: JableStudioSliderProps) {
    return (
        <div className="my-8">
            <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full" />
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                        <Building2 size={18} className="text-cyan-400" />
                        顶级厂牌 · 知名片商专区
                    </h3>
                </div>
                <span className="text-xs text-cyan-300/60 font-medium">
                    独家正版企划
                </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {JABLE_STUDIOS.map((studio) => (
                    <button
                        key={studio.id}
                        onClick={() => onSelectStudio(studio)}
                        className="group relative p-3 rounded-2xl bg-[#0E0F17] hover:bg-[#151625] border border-white/5 hover:border-cyan-500/40 text-left transition-all duration-300 cursor-pointer overflow-hidden hover:-translate-y-1 shadow-md hover:shadow-cyan-950/40"
                    >
                        {/* 顶部彩色微光指示 */}
                        <div className={`h-1 w-8 rounded-full bg-gradient-to-r ${studio.color} mb-2 group-hover:w-full transition-all duration-300`} />

                        <div className="text-xs font-black text-white group-hover:text-cyan-300 transition-colors truncate">
                            {studio.name}
                        </div>

                        <div className="text-[10px] text-white/40 font-mono mt-0.5 truncate">
                            {studio.codePrefix}
                        </div>

                        <div className="mt-2 flex items-center justify-between">
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/5 text-white/50 border border-white/5 group-hover:border-cyan-500/20 group-hover:text-cyan-300">
                                {studio.tag}
                            </span>
                            <ChevronRight size={12} className="text-white/20 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
