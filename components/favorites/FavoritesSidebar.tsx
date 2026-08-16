/**
 * FavoritesSidebar - Main favorites sidebar component
 * Positioned on the left side of the screen (opposite to WatchHistorySidebar)
 */

'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useFavorites } from '@/lib/store/favorites-store';
import { WatchHistorySidebar } from '@/components/history/WatchHistorySidebar';
import { Icons } from '@/components/ui/Icon';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { FavoritesHeader } from './FavoritesHeader';
import { FavoritesList } from './FavoritesList';
import { FavoritesFooter } from './FavoritesFooter';
import { trapFocus } from '@/lib/accessibility/focus-management';

export function FavoritesSidebar({ isPremium = false }: { isPremium?: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState<{
        isOpen: boolean;
        videoId?: string;
        source?: string;
        isClearAll?: boolean;
    }>({ isOpen: false });
    const { favorites, removeFavorite, clearFavorites } = useFavorites(isPremium);
    const sidebarRef = useRef<HTMLElement>(null);
    const cleanupFocusTrapRef = useRef<(() => void) | null>(null);

    // 播放页隐藏浮动按钮
    const pathname = usePathname();
    const isPlayerPage = pathname?.startsWith('/player');

    // 滚动时隐藏浮动按钮
    const [isScrolling, setIsScrolling] = useState(false);
    const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolling(true);
            if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
            scrollTimerRef.current = setTimeout(() => setIsScrolling(false), 1500);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
        };
    }, []);

    // 浮动按钮是否可见
    const showToggle = !isPlayerPage && !isScrolling;

    // Setup focus trap when sidebar opens
    useEffect(() => {
        if (isOpen && sidebarRef.current) {
            cleanupFocusTrapRef.current = trapFocus(sidebarRef.current);
        }

        return () => {
            if (cleanupFocusTrapRef.current) {
                cleanupFocusTrapRef.current();
                cleanupFocusTrapRef.current = null;
            }
        };
    }, [isOpen]);

    // Handle escape key to close sidebar
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    // Handle delete confirmation
    const handleDeleteItem = (videoId: string | number, source: string) => {
        setDeleteConfirm({ isOpen: true, videoId: String(videoId), source });
    };

    const handleClearAll = () => {
        setDeleteConfirm({ isOpen: true, isClearAll: true });
    };

    const confirmDelete = () => {
        if (deleteConfirm.isClearAll) {
            clearFavorites();
        } else if (deleteConfirm.videoId && deleteConfirm.source) {
            removeFavorite(deleteConfirm.videoId, deleteConfirm.source);
        }
        setDeleteConfirm({ isOpen: false });
    };

    const cancelDelete = () => {
        setDeleteConfirm({ isOpen: false });
    };

    return (
        <>
            {/* Toggle Button - Left side */}
            <button
                onClick={() => setIsOpen(true)}
                className={`fixed left-6 top-[45%] -translate-y-1/2 z-40 hidden sm:flex bg-(--glass-bg) backdrop-blur-sm saturate-120 border border-(--glass-border) rounded-2xl shadow-(--shadow-md) p-3 hover:scale-105 transition-all duration-300 cursor-pointer ${showToggle ? 'opacity-60 hover:opacity-100' : 'opacity-0 pointer-events-none'}`}
                aria-label="打开收藏夹"
            >
                <Icons.Heart size={20} className="text-(--text-color)" />
            </button>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-1999 bg-black/40 opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar - Left side */}
            <aside
                ref={sidebarRef}
                role="complementary"
                aria-labelledby="favorites-sidebar-title"
                aria-hidden={!isOpen}
                style={{
                    transform: isOpen ? 'translate3d(0, 0, 0)' : 'translate3d(-100%, 0, 0)',
                    willChange: isOpen ? 'transform' : 'auto'
                }}
                className={`fixed top-0 left-0 bottom-0 w-[88%] sm:w-[90%] max-w-105 z-2000 bg-[#0A0A0F]/95 backdrop-blur-3xl border-r border-white/10 p-6 flex flex-col shadow-2xl transition-transform duration-250 ease-out`}
            >
                <FavoritesHeader onClose={() => setIsOpen(false)} />

                <FavoritesList
                    favorites={favorites}
                    onRemove={handleDeleteItem}
                    isPremium={isPremium}
                />

                <FavoritesFooter
                    hasFavorites={favorites.length > 0}
                    onClearAll={handleClearAll}
                />
            </aside>

            {/* Watch History Sidebar - Right side */}
            <WatchHistorySidebar isPremium={isPremium} />

            {/* Confirm Dialog */}
            <ConfirmDialog
                isOpen={deleteConfirm.isOpen}
                title={deleteConfirm.isClearAll ? '清空收藏夹' : '取消收藏'}
                message={
                    deleteConfirm.isClearAll
                        ? '确定要清空所有收藏吗？此操作无法撤销。'
                        : '确定要取消收藏这个视频吗？'
                }
                onConfirm={confirmDelete}
                onCancel={cancelDelete}
                confirmText="确定"
                cancelText="取消"
                variant="danger"
            />
        </>
    );
}
