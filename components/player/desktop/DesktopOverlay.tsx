import React from 'react';
import { Icons } from '@/components/ui/Icon';

import { DesktopMoreMenu } from './DesktopMoreMenu';
import { DesktopSpeedMenu } from './DesktopSpeedMenu';

interface DesktopOverlayProps {
    isLoading: boolean;
    isTransitioningToNextEpisode?: boolean;
    isPlaying: boolean;
    showSkipForwardIndicator: boolean;
    showSkipBackwardIndicator: boolean;
    skipForwardAmount: number;
    skipBackwardAmount: number;
    isSkipForwardAnimatingOut: boolean;
    isSkipBackwardAnimatingOut: boolean;
    showToast: boolean;
    toastMessage: string | null;
    showControls: boolean;
    onTogglePlay: () => void;
    onSkipForward: () => void;
    onSkipBackward: () => void;
    showMoreMenu: boolean;
    isProxied: boolean;
    onToggleMoreMenu: () => void;
    onMoreMenuMouseEnter: () => void;
    onMoreMenuMouseLeave: () => void;
    onCopyLink: (type?: 'original' | 'proxy') => void;
    // Speed Menu Props
    playbackRate: number;
    showSpeedMenu: boolean;
    speeds: number[];
    onToggleSpeedMenu: () => void;
    onSpeedChange: (speed: number) => void;
    onSpeedMenuMouseEnter: () => void;
    onSpeedMenuMouseLeave: () => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    isRotated?: boolean;
}

export function DesktopOverlay({
    isLoading,
    isTransitioningToNextEpisode = false,
    isPlaying,
    showSkipForwardIndicator,
    showSkipBackwardIndicator,
    skipForwardAmount,
    skipBackwardAmount,
    isSkipForwardAnimatingOut,
    isSkipBackwardAnimatingOut,
    showToast,
    toastMessage,
    onTogglePlay,
    onSkipForward,
    onSkipBackward,
    showControls,
    showMoreMenu,
    isProxied,
    onToggleMoreMenu,
    onMoreMenuMouseEnter,
    onMoreMenuMouseLeave,
    onCopyLink,
    playbackRate,
    showSpeedMenu,
    speeds,
    onToggleSpeedMenu,
    onSpeedChange,
    onSpeedMenuMouseEnter,
    onSpeedMenuMouseLeave,
    containerRef,
    isRotated = false,
}: DesktopOverlayProps) {
    // Show navigation buttons when controls are visible or when paused (controls usually show when paused anyway)
    const showNavButtons = showControls || !isPlaying;

    return (
        <>
            {/* More Menu (Top Left) - Responsive position */}
            <div className={`absolute top-3 sm:top-6 left-3 sm:left-6 z-40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} style={{ pointerEvents: showControls ? 'auto' : 'none' }}>
                <DesktopMoreMenu
                    showMoreMenu={showMoreMenu}
                    isProxied={isProxied}
                    onToggleMoreMenu={onToggleMoreMenu}
                    onMouseEnter={onMoreMenuMouseEnter}
                    onMouseLeave={onMoreMenuMouseLeave}
                    onCopyLink={onCopyLink}
                    containerRef={containerRef}
                    isRotated={isRotated}
                />
            </div>

            {/* Speed Menu (Top Right) - Responsive position */}
            <div className={`absolute top-3 sm:top-6 right-3 sm:right-6 z-40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`} style={{ pointerEvents: showControls ? 'auto' : 'none' }}>
                <DesktopSpeedMenu
                    showSpeedMenu={showSpeedMenu}
                    playbackRate={playbackRate}
                    speeds={speeds}
                    onSpeedChange={onSpeedChange}
                    onToggleSpeedMenu={onToggleSpeedMenu}
                    onMouseEnter={onSpeedMenuMouseEnter}
                    onMouseLeave={onSpeedMenuMouseLeave}
                    containerRef={containerRef}
                    isRotated={isRotated}
                />
            </div>

            {/* Loading Spinner - Glass Effect */}
            {isLoading && (
                <div className="loading-overlay-glass">
                    {isTransitioningToNextEpisode ? (
                        <div className="next-episode-loading">
                            <div className="spinner-glass"></div>
                            <span className="next-episode-text">正在自动播放下一集...</span>
                        </div>
                    ) : (
                        <div className="spinner-glass"></div>
                    )}
                </div>
            )}

            {/* Skip Backward Indicator (Animation) */}
            {showSkipBackwardIndicator && (
                <div className="absolute top-1/2 left-24 -translate-y-1/2 pointer-events-none transition-all duration-300 z-20">
                    <div className={`text-white text-3xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ${isSkipBackwardAnimatingOut ? 'animate-scale-out' : 'animate-scale-in'
                        }`}>
                        -{skipBackwardAmount}秒
                    </div>
                </div>
            )}

            {/* Skip Forward Indicator (Animation) */}
            {showSkipForwardIndicator && (
                <div className="absolute top-1/2 right-24 -translate-y-1/2 pointer-events-none transition-all duration-300 z-20">
                    <div className={`text-white text-3xl font-bold drop-shadow-[0_4px_8px_rgba(0,0,0,0.8)] ${isSkipForwardAnimatingOut ? 'animate-scale-out' : 'animate-scale-in'
                        }`}>
                        +{skipForwardAmount}秒
                    </div>
                </div>
            )}

            {/* Previous Button (Method: Skip Backward) */}
            <div
                className={`absolute left-0 top-0 bottom-0 flex items-center justify-center p-4 md:p-8 transition-opacity duration-300 z-10 ${showNavButtons ? 'opacity-100' : 'opacity-0'
                    }`}
                style={{ pointerEvents: showNavButtons ? 'auto' : 'none' }}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSkipBackward();
                    }}
                    className="group flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label="后退 10 秒"
                >
                    <Icons.SkipBack className="w-5 h-5 md:w-8 md:h-8 text-white/80 group-hover:text-white" />
                </button>
            </div>

            {/* Next Button (Method: Skip Forward) - Refined to use FastForward icon */}
            <div
                className={`absolute right-0 top-0 bottom-0 flex items-center justify-center p-4 md:p-8 transition-opacity duration-300 z-10 ${showNavButtons ? 'opacity-100' : 'opacity-0'
                    }`}
                style={{ pointerEvents: showNavButtons ? 'auto' : 'none' }}
            >
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSkipForward();
                    }}
                    className="group flex items-center justify-center w-10 h-10 md:w-16 md:h-16 rounded-full bg-black/40 hover:bg-black/60 backdrop-blur-sm transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer"
                    aria-label="前进 10 秒"
                >
                    <Icons.FastForward className="w-5 h-5 md:w-8 md:h-8 text-white/80 group-hover:text-white" />
                </button>
            </div>

            {/* Center Play Button (when paused: 无论移动端还是桌面端，暂停时均呈现高对比度毛玻璃大播放钮) */}
            {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onTogglePlay();
                        }}
                        className="pointer-events-auto w-16 h-16 md:w-22 md:h-22 rounded-full bg-black/60 hover:bg-(--accent-color) backdrop-blur-md flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-90 cursor-pointer shadow-2xl border border-white/20"
                        aria-label="播放"
                    >
                        <Icons.Play className="w-8 h-8 md:w-11 md:h-11 text-white ml-1.5 drop-shadow-md" />
                    </button>
                </div>
            )}

            {/* Toast Notification */}
            {showToast && toastMessage && (
                <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-[200] animate-slide-up">
                    <div className="bg-[rgba(28,28,30,0.95)] backdrop-blur-[25px] rounded-[var(--radius-2xl)] border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-6 py-3 flex items-center gap-3 min-w-[200px]">
                        <Icons.Check size={18} className="text-[#34c759] flex-shrink-0" />
                        <span className="text-white text-sm font-medium">{toastMessage}</span>
                    </div>
                </div>
            )}
        </>
    );
}
