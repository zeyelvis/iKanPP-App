'use client';

import React from 'react';
import { JABLE_POPULAR_TAGS } from '@/lib/constants/jable-categories';
import { Tag, Sparkles } from 'lucide-react';

interface JableTagCloudProps {
    onSelectTag: (keyword: string) => void;
}

export function JableTagCloud({ onSelectTag }: JableTagCloudProps) {
    return (
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-[#0E0F17]/80 border border-white/5 backdrop-blur-md">
            <div className="flex items-center gap-2 mb-3 text-xs font-bold text-white/50">
                <Tag size={13} className="text-purple-400" />
                <span>热门主题探索</span>
            </div>

            <div className="flex flex-wrap gap-2">
                {JABLE_POPULAR_TAGS.map((tag, idx) => (
                    <button
                        key={idx}
                        onClick={() => onSelectTag(tag.keyword)}
                        className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-gradient-to-r hover:from-purple-600/30 hover:to-pink-600/30 border border-white/5 hover:border-purple-500/40 text-xs text-white/70 hover:text-white font-medium transition-all duration-200 cursor-pointer active:scale-95 shadow-sm"
                    >
                        {tag.label}
                    </button>
                ))}
            </div>
        </div>
    );
}
