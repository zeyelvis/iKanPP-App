import React from 'react';
import { Icons } from '@/components/ui/Icon';
import { Layers, Server, HelpCircle } from 'lucide-react';

interface DesktopRightControlsProps {
    isNativeFullscreen: boolean;
    isWebFullscreen: boolean;
    isPiPSupported: boolean;
    isAirPlaySupported: boolean;
    isCastAvailable: boolean;
    onToggleNativeFullscreen: () => void;
    onToggleWebFullscreen: () => void;
    onTogglePictureInPicture: () => void;
    onShowAirPlayMenu: () => void;
    onShowCastMenu: () => void;
    // Netflix 级新交互
    totalEpisodes?: number;
    onToggleEpisodesDrawer?: () => void;
    sourcesCount?: number;
    onToggleSourceDrawer?: () => void;
    onToggleShortcutsModal?: () => void;
}

export function DesktopRightControls({
    isNativeFullscreen,
    isWebFullscreen,
    isPiPSupported,
    isAirPlaySupported,
    isCastAvailable,
    onToggleNativeFullscreen,
    onToggleWebFullscreen,
    onTogglePictureInPicture,
    onShowAirPlayMenu,
    onShowCastMenu,
    totalEpisodes = 1,
    onToggleEpisodesDrawer,
    sourcesCount = 1,
    onToggleSourceDrawer,
    onToggleShortcutsModal,
}: DesktopRightControlsProps) {
    return (
        <div className="player-controls-right relative z-50 flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Netflix 剧集选集抽屉入口 */}
            {totalEpisodes > 1 && onToggleEpisodesDrawer && (
                <button
                    onClick={onToggleEpisodesDrawer}
                    className="btn-icon shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    aria-label="剧集选集"
                    title="展开剧集选集"
                >
                    <Layers size={17} />
                    <span className="text-xs font-bold hidden sm:inline">选集</span>
                </button>
            )}

            {/* Netflix 专线切换抽屉入口 */}
            {sourcesCount > 1 && onToggleSourceDrawer && (
                <button
                    onClick={onToggleSourceDrawer}
                    className="btn-icon shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer"
                    aria-label="切换专线"
                    title="切换专线"
                >
                    <Server size={17} />
                    <span className="text-xs font-bold hidden sm:inline">专线</span>
                </button>
            )}
            {/* Picture-in-Picture */}
            {
                isPiPSupported && (
                    <button
                        onClick={onTogglePictureInPicture}
                        className="btn-icon shrink-0"
                        aria-label="画中画 (系统浮窗)"
                        title="画中画 (系统浮窗)"
                    >
                        <Icons.PictureInPicture size={20} />
                    </button>
                )
            }

            {/* AirPlay */}
            {
                isAirPlaySupported && (
                    <button
                        onClick={onShowAirPlayMenu}
                        className="btn-icon shrink-0"
                        aria-label="隔空播放"
                        title="隔空播放"
                    >
                        <Icons.Airplay size={20} />
                    </button>
                )
            }

            {/* Google Cast */}
            {
                isCastAvailable && (
                    <button
                        onClick={onShowCastMenu}
                        className="btn-icon shrink-0"
                        aria-label="投屏"
                        title="投屏"
                    >
                        <Icons.Cast size={20} />
                    </button>
                )
            }

            {/* 键盘快捷键帮助 */}
            {onToggleShortcutsModal && (
                <button
                    onClick={onToggleShortcutsModal}
                    className="btn-icon shrink-0 hidden md:flex items-center justify-center text-white/70 hover:text-white"
                    aria-label="键盘快捷键"
                    title="键盘快捷键 (?)"
                >
                    <HelpCircle size={18} />
                </button>
            )}

            {/* Web Fullscreen (窗口内放大) */}
            <button
                onClick={onToggleWebFullscreen}
                className="btn-icon shrink-0"
                aria-label={isWebFullscreen ? '退出网页全屏' : '网页窗口全屏'}
                title={isWebFullscreen ? '退出网页全屏 (W)' : '网页窗口全屏 (W)'}
            >
                {isWebFullscreen
                    ? <Icons.WebFullscreenExit size={20} className="text-(--accent-color)" />
                    : <Icons.WebFullscreen size={20} />}
            </button>

            {/* Native Fullscreen (设备全部真全屏) */}
            <button
                onClick={onToggleNativeFullscreen}
                className={`btn-icon shrink-0 ${isNativeFullscreen ? 'text-(--accent-color)' : ''}`}
                aria-label={isNativeFullscreen ? '退出全部全屏' : '全部全屏'}
                title={isNativeFullscreen ? '退出全部全屏 (F 或 双击)' : '全部全屏 (F 或 双击)'}
            >
                {isNativeFullscreen ? <Icons.Minimize size={20} /> : <Icons.Maximize size={20} />}
            </button>
        </div >
    );
}
