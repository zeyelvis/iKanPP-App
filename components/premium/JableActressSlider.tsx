'use client';

import React from 'react';
import Image from 'next/image';
import { JABLE_POPULAR_ACTRESSES, type JableActress } from '@/lib/constants/jable-categories';
import { Sparkles, ChevronRight, Crown } from 'lucide-react';

interface JableActressSliderProps {
    onSelectActress: (actress: JableActress) => void;
}

export function JableActressSlider({ onSelectActress }: JableActressSliderProps) {
    return (
        <div className="my-8 p-4 sm:p-6 rounded-3xl bg-gradient-to-b from-[#131422]/90 to-[#0A0B12]/90 border border-purple-500/20 shadow-2xl">
            {/* 专区标题 */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-gradient-to-b from-pink-500 to-purple-500 rounded-full" />
                    <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-1.5">
                        <Crown size={18} className="text-amber-400 fill-amber-400" />
                        人气女神 · 精选名优专区
                    </h3>
                </div>
                <span className="text-xs text-purple-300/60 font-medium">
                    左右滑动查看更多
                </span>
            </div>

            {/* 女优列表横向滑动 */}
            <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-2 scroll-smooth">
                {JABLE_POPULAR_ACTRESSES.map((actress) => (
                    <button
                        key={actress.id}
                        onClick={() => onSelectActress(actress)}
                        className="group flex flex-col items-center shrink-0 w-24 sm:w-28 cursor-pointer transition-transform hover:-translate-y-1"
                    >
                        {/* 圆形奢华头像 */}
                        <div className="relative w-18 h-18 sm:w-22 sm:h-22 rounded-full p-0.5 bg-gradient-to-tr from-purple-500 via-pink-500 to-amber-400 shadow-lg shadow-purple-950/60 mb-2">
                            <div className="relative w-full h-full rounded-full overflow-hidden bg-neutral-900 border-2 border-[#0A0B12]">
                                <Image
                                    src={actress.avatar}
                                    alt={actress.name}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                    sizes="96px"
                                    unoptimized
                                />
                            </div>
                        </div>

                        {/* 姓名 */}
                        <span className="text-xs font-black text-white group-hover:text-pink-300 transition-colors truncate max-w-full">
                            {actress.name}
                        </span>

                        {/* 称号 */}
                        <span className="text-[10px] text-purple-300/80 bg-purple-500/10 px-1.5 py-0.2 rounded-full mt-0.5 border border-purple-500/20">
                            {actress.tag}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
