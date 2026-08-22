'use client';

import React, { useState } from 'react';
import { Filter, X, RotateCcw, Check, Sparkles } from 'lucide-react';

export interface JableFilterState {
    year: string;
    sub: string;
    quality: string;
    type: string;
}

interface JableFilterDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    onApplyFilter: (filter: JableFilterState) => void;
}

const FILTER_YEARS = [
    { label: '全部年份', value: '' },
    { label: '2026 最新', value: '2026' },
    { label: '2025 年度', value: '2025' },
    { label: '2024 精品', value: '2024' },
    { label: '经典回顾', value: '经典' },
];

const FILTER_SUBS = [
    { label: '全部字幕', value: '' },
    { label: '👑 中文字幕', value: '中文字幕' },
    { label: '⚡ 官方双字', value: '中字' },
    { label: '🌸 原声无字', value: '原声' },
];

const FILTER_QUALITIES = [
    { label: '全部画质', value: '' },
    { label: '💎 4K 极致原画', value: '4K' },
    { label: '⚡ 1080P 蓝光', value: '1080P' },
    { label: '🎬 HD 超清', value: 'HD' },
];

const FILTER_TYPES = [
    { label: '全部分类', value: '' },
    { label: '💎 无码流出', value: '无码' },
    { label: '🌸 日本有码', value: '日本' },
    { label: '🏮 国产自拍', value: '国产' },
    { label: '🗽 欧美大片', value: '欧美' },
    { label: '⚡ 动漫 3D', value: '动漫' },
    { label: '⭐ FC2 独家', value: 'FC2' },
];

export function JableFilterDrawer({ isOpen, onClose, onApplyFilter }: JableFilterDrawerProps) {
    const [selectedYear, setSelectedYear] = useState('');
    const [selectedSub, setSelectedSub] = useState('');
    const [selectedQuality, setSelectedQuality] = useState('');
    const [selectedType, setSelectedType] = useState('');

    if (!isOpen) return null;

    const handleReset = () => {
        setSelectedYear('');
        setSelectedSub('');
        setSelectedQuality('');
        setSelectedType('');
        onApplyFilter({ year: '', sub: '', quality: '', type: '' });
    };

    const handleApply = () => {
        onApplyFilter({
            year: selectedYear,
            sub: selectedSub,
            quality: selectedQuality,
            type: selectedType,
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-xl rounded-3xl bg-[#11121C] border border-purple-500/30 p-6 sm:p-8 shadow-2xl shadow-purple-950/80 text-white animate-scale-up">
                {/* 顶部标题与关闭 */}
                <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
                    <div className="flex items-center gap-2">
                        <Filter size={20} className="text-purple-400" />
                        <h3 className="text-lg font-black tracking-tight">多维专业高级筛选</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors cursor-pointer"
                        aria-label="关闭筛选"
                    >
                        <X size={16} />
                    </button>
                </div>

                <div className="space-y-5 max-h-[60vh] overflow-y-auto pr-1">
                    {/* 1. 字幕状态 */}
                    <div>
                        <div className="text-xs font-bold text-white/50 mb-2.5">字幕语言</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {FILTER_SUBS.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setSelectedSub(item.value)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedSub === item.value
                                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                                            : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. 画质规格 */}
                    <div>
                        <div className="text-xs font-bold text-white/50 mb-2.5">清晰度规格</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {FILTER_QUALITIES.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setSelectedQuality(item.value)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedQuality === item.value
                                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                                            : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 3. 影片类型 */}
                    <div>
                        <div className="text-xs font-bold text-white/50 mb-2.5">专区类型</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                            {FILTER_TYPES.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setSelectedType(item.value)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedType === item.value
                                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                                            : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 4. 发行年份 */}
                    <div>
                        <div className="text-xs font-bold text-white/50 mb-2.5">发行年份</div>
                        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                            {FILTER_YEARS.map((item) => (
                                <button
                                    key={item.value}
                                    onClick={() => setSelectedYear(item.value)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                        selectedYear === item.value
                                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 font-black'
                                            : 'bg-white/5 hover:bg-white/10 text-white/70 border border-white/5'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* 底部按钮 */}
                <div className="flex items-center justify-between gap-3 pt-6 border-t border-white/10 mt-6">
                    <button
                        onClick={handleReset}
                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/60 hover:text-white transition-all cursor-pointer"
                    >
                        <RotateCcw size={14} />
                        重置所有
                    </button>

                    <button
                        onClick={handleApply}
                        className="flex-1 flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black text-sm shadow-xl shadow-purple-600/40 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
                    >
                        <Check size={16} />
                        立即应用筛选
                    </button>
                </div>
            </div>
        </div>
    );
}
