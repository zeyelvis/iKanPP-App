'use client';

/**
 * MobileSearchOverlay — 全屏移动端搜索体验
 * 特性：
 * - 全屏 Overlay，不会触发 iOS auto-zoom
 * - 自动弹出键盘
 * - 搜索历史立即可见
 * - 取消按钮一键退出
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Icons } from '@/components/ui/Icon';
import { useSearchHistory } from '@/lib/hooks/useSearchHistory';
import { useTrendingStore } from '@/lib/store/trending-store';

interface MobileSearchOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (query: string) => void;
    initialQuery?: string;
}

export function MobileSearchOverlay({
    isOpen,
    onClose,
    onSearch,
    initialQuery = '',
}: MobileSearchOverlayProps) {
    const [query, setQuery] = useState(initialQuery);
    const inputRef = useRef<HTMLInputElement>(null);
    const [mounted, setMounted] = useState(false);

    const {
        searchHistory,
        addSearch,
        removeSearch,
        clearAll,
    } = useSearchHistory((selectedQuery) => {
        setQuery(selectedQuery);
        handleSubmitQuery(selectedQuery);
    });

    const trendingKeywords = useTrendingStore(s => s.getKeywords)(10);

    // Client-side mount 用于 Portal
    useEffect(() => { setMounted(true); }, []);

    // 打开时自动聚焦 + 同步 query
    useEffect(() => {
        if (isOpen) {
            setQuery(initialQuery);
            requestAnimationFrame(() => {
                setTimeout(() => inputRef.current?.focus(), 50);
            });
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen, initialQuery]);

    const handleSubmitQuery = useCallback((q: string) => {
        const trimmed = q.trim();
        if (!trimmed) return;
        addSearch(trimmed);
        onSearch(trimmed);
        onClose();
    }, [addSearch, onSearch, onClose]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSubmitQuery(query);
    };

    const handleHistoryClick = (q: string) => {
        setQuery(q);
        handleSubmitQuery(q);
    };

    if (!isOpen || !mounted) return null;

    // Portal 渲染到 body，避免 nav 的 transform: translate3d 破坏 fixed 定位
    return createPortal(
        <div
            className="fixed inset-0 z-[9999] flex flex-col"
            style={{
                background: 'var(--bg-color, #0f0f1a)',
                // 硬性保证覆盖全屏
                width: '100vw',
                height: '100vh',
                top: 0,
                left: 0,
            }}
        >
            {/* 顶部搜索栏 */}
            <form onSubmit={handleSubmit} className="relative z-10 flex items-center gap-2 px-4 pt-[env(safe-area-inset-top,12px)] pb-3 border-b"
                  style={{ borderColor: 'var(--glass-border, rgba(255,255,255,0.06))' }}>
                <div className="flex-1 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                         style={{ color: 'var(--text-color-secondary)' }}>
                        <Icons.Search size={18} />
                    </div>
                    <input
                        ref={inputRef}
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="搜索电影、电视剧、综艺..."
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        enterKeyHint="search"
                        className="w-full pl-10 pr-10 py-3 rounded-xl text-base bg-transparent border transition-colors focus:outline-none"
                        style={{
                            color: 'var(--text-color)',
                            borderColor: 'var(--glass-border, rgba(255,255,255,0.1))',
                            background: 'var(--glass-bg, rgba(255,255,255,0.04))',
                            fontSize: '16px',
                        }}
                    />
                    {query && (
                        <button
                            type="button"
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--text-color-secondary)' }}
                        >
                            <Icons.X size={16} />
                        </button>
                    )}
                </div>
                <button
                    type="button"
                    onClick={onClose}
                    className="shrink-0 px-3 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                    style={{ color: 'var(--accent-color)' }}
                >
                    取消
                </button>
            </form>

            {/* 搜索历史 */}
            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3">
                {searchHistory.length > 0 && (
                    <>
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold uppercase tracking-wider"
                                  style={{ color: 'var(--text-color-secondary)', opacity: 0.6 }}>
                                搜索历史
                            </span>
                            <button
                                onClick={clearAll}
                                className="text-xs transition-opacity hover:opacity-80"
                                style={{ color: 'var(--accent-color)' }}
                            >
                                清空
                            </button>
                        </div>
                        <div className="space-y-0.5">
                            {searchHistory.map((item) => (
                                <div
                                    key={`${item.query}-${item.timestamp}`}
                                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors active:opacity-70"
                                    style={{ background: 'transparent' }}
                                    onClick={() => handleHistoryClick(item.query)}
                                >
                                    <span className="opacity-40" style={{ color: 'var(--text-color-secondary)' }}>
                                        <Icons.Clock size={14} />
                                    </span>
                                    <span className="flex-1 text-sm truncate" style={{ color: 'var(--text-color)' }}>
                                        {item.query}
                                    </span>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); removeSearch(item.query); }}
                                        className="shrink-0 p-1 rounded-full opacity-30 hover:opacity-70 transition-opacity"
                                        style={{ color: 'var(--text-color-secondary)' }}
                                    >
                                        <Icons.X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {searchHistory.length === 0 && trendingKeywords.length === 0 && (
                    <div className="flex flex-col items-center justify-center pt-20 opacity-40">
                        <span style={{ color: 'var(--text-color-secondary)' }}>
                            <Icons.Search size={32} />
                        </span>
                        <p className="text-sm mt-3" style={{ color: 'var(--text-color-secondary)' }}>
                            搜索你想看的影片
                        </p>
                    </div>
                )}

                {/* 🔥 热搜关键词 */}
                {trendingKeywords.length > 0 && (
                    <div className={searchHistory.length > 0 ? 'mt-5' : ''}>
                        <div className="flex items-center gap-1.5 mb-3">
                            <span className="text-base">🔥</span>
                            <span className="text-xs font-semibold tracking-wider"
                                  style={{ color: 'var(--text-color-secondary)', opacity: 0.6 }}>
                                大家在搜
                            </span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {trendingKeywords.map((kw, i) => (
                                <button
                                    key={`${kw.title}-${i}`}
                                    onClick={() => handleHistoryClick(kw.title)}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
                                    style={{
                                        color: 'var(--text-color)',
                                        background: 'var(--glass-bg, rgba(255,255,255,0.06))',
                                        border: '1px solid var(--glass-border, rgba(255,255,255,0.08))',
                                    }}
                                >
                                    {kw.title}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
