'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

interface JablePaginationProps {
    currentPage: number; // 1-based (当前页码，从 1 开始)
    hasMore: boolean;
    loading: boolean;
    onPageChange: (page: number) => void;
}

export function JablePagination({
    currentPage,
    hasMore,
    loading,
    onPageChange,
}: JablePaginationProps) {
    // 计算显示的页码范围（滑动窗口，尽量将当前页居中）
    const windowSize = 5;
    // 如果 hasMore 为 true，表示至少还有下一页
    const knownPages = hasMore ? currentPage + 1 : currentPage;
    const totalVisible = Math.min(windowSize, knownPages);

    let startPage = Math.max(1, currentPage - Math.floor(totalVisible / 2));
    let endPage = startPage + totalVisible - 1;
    if (endPage > knownPages) {
        endPage = knownPages;
        startPage = Math.max(1, endPage - totalVisible + 1);
    }

    const pages: number[] = [];
    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 py-8 mt-6 select-none animate-fade-in">
            <div className="flex items-center gap-2">
                {/* 上一页按钮 */}
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-95 shadow-sm"
                    aria-label="上一页"
                >
                    <ChevronLeft size={16} />
                    <span>上一页</span>
                </button>

                {/* 数字页码组 */}
                <div className="flex items-center gap-1.5">
                    {pages.map((p) => {
                        const isActive = p === currentPage;
                        return (
                            <button
                                key={`jable-page-${p}`}
                                onClick={() => !isActive && !loading && onPageChange(p)}
                                disabled={loading}
                                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center ${
                                    isActive
                                        ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white shadow-lg shadow-purple-600/40 ring-1 ring-white/30 scale-105'
                                        : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white hover:border-white/20'
                                } disabled:cursor-not-allowed`}
                            >
                                {isActive && loading ? (
                                    <Loader2 size={15} className="animate-spin text-white" />
                                ) : (
                                    p
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* 下一页按钮 */}
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!hasMore || loading}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:text-white hover:border-white/20 active:scale-95 shadow-sm"
                    aria-label="下一页"
                >
                    <span>下一页</span>
                    <ChevronRight size={16} />
                </button>
            </div>

            {/* 页面指示与状态说明 */}
            <div className="text-xs text-white/40 font-medium sm:ml-2">
                当前第 <span className="text-amber-400 font-bold">{currentPage}</span> 页
                {hasMore && ' · 更多精彩影片'}
            </div>
        </div>
    );
}
