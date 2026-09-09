import React from 'react';
import { DesktopOverlay } from './DesktopOverlay';
import { useDesktopPlayerState } from '../hooks/useDesktopPlayerState';
import { InPlayerEpisodesDrawer } from './InPlayerEpisodesDrawer';
import { InPlayerSourceDrawer, SourceItem } from './InPlayerSourceDrawer';
import { NextEpisodeOverlay } from './NextEpisodeOverlay';
import { KeyboardShortcutsModal } from './KeyboardShortcutsModal';

interface DesktopOverlayWrapperProps {
    data: ReturnType<typeof useDesktopPlayerState>['data'];
    showControls: boolean;
    isFullscreen: boolean;
    fullscreenClock: string;
    isRotated?: boolean;
    onTogglePlay: () => void;
    onSkipForward: () => void;
    onSkipBackward: () => void;
    isTransitioningToNextEpisode?: boolean;
    showMoreMenu: boolean;
    isPremium?: boolean;
    isProxied: boolean;
    onToggleMoreMenu: () => void;
    onMoreMenuMouseEnter: () => void;
    onMoreMenuMouseLeave: () => void;
    onCopyLink: (type?: 'original' | 'proxy') => void;
    seekStepSeconds: number;
    // Speed Menu Props
    playbackRate: number;
    showSpeedMenu: boolean;
    speeds: number[];
    onToggleSpeedMenu: () => void;
    onSpeedChange: (speed: number) => void;
    onSpeedMenuMouseEnter: () => void;
    onSpeedMenuMouseLeave: () => void;
    webFullscreenSize: 'full' | 'large' | 'focused';
    onCycleWebFullscreenSize: () => void;
    containerRef: React.RefObject<HTMLDivElement | null>;
    // Netflix 级沉浸式浮层 Props
    episodes?: Array<{ name?: string; url: string }>;
    currentEpisode?: number;
    isEpisodesDrawerOpen?: boolean;
    onCloseEpisodesDrawer?: () => void;
    onSelectEpisode?: (index: number) => void;
    sources?: SourceItem[];
    currentSource?: string;
    isSourceDrawerOpen?: boolean;
    onCloseSourceDrawer?: () => void;
    onSelectSource?: (source: SourceItem) => void;
    isShortcutsModalOpen?: boolean;
    onCloseShortcutsModal?: () => void;
    showNextEpisodeCountdown?: boolean;
    nextEpisodeName?: string;
    nextEpisodeIndex?: number;
    onPlayNextEpisode?: () => void;
    onCancelNextEpisode?: () => void;
}

export function DesktopOverlayWrapper({
    data,
    showControls,
    isFullscreen,
    fullscreenClock,
    isRotated = false,
    onTogglePlay,
    onSkipForward,
    onSkipBackward,
    isTransitioningToNextEpisode = false,
    showMoreMenu,
    isPremium = false,
    isProxied,
    onToggleMoreMenu,
    onMoreMenuMouseEnter,
    onMoreMenuMouseLeave,
    onCopyLink,
    seekStepSeconds,
    playbackRate,
    showSpeedMenu,
    speeds,
    onToggleSpeedMenu,
    onSpeedChange,
    onSpeedMenuMouseEnter,
    onSpeedMenuMouseLeave,
    webFullscreenSize,
    onCycleWebFullscreenSize,
    containerRef,
    // Netflix 级新交互
    episodes,
    currentEpisode = 0,
    isEpisodesDrawerOpen = false,
    onCloseEpisodesDrawer,
    onSelectEpisode,
    sources,
    currentSource = '',
    isSourceDrawerOpen = false,
    onCloseSourceDrawer,
    onSelectSource,
    isShortcutsModalOpen = false,
    onCloseShortcutsModal,
    showNextEpisodeCountdown = false,
    nextEpisodeName = '',
    nextEpisodeIndex = 0,
    onPlayNextEpisode,
    onCancelNextEpisode,
}: DesktopOverlayWrapperProps) {
    const {
        isLoading,
        isPlaying,
        showSkipForwardIndicator,
        showSkipBackwardIndicator,
        skipForwardAmount,
        skipBackwardAmount,
        isSkipForwardAnimatingOut,
        isSkipBackwardAnimatingOut,
        showToast,
        toastMessage,
    } = data;

    return (
        <>
            <DesktopOverlay
                isLoading={isLoading}
                isTransitioningToNextEpisode={isTransitioningToNextEpisode}
                isPlaying={isPlaying}
                showSkipForwardIndicator={showSkipForwardIndicator}
                showSkipBackwardIndicator={showSkipBackwardIndicator}
                skipForwardAmount={skipForwardAmount}
                skipBackwardAmount={skipBackwardAmount}
                isSkipForwardAnimatingOut={isSkipForwardAnimatingOut}
                isSkipBackwardAnimatingOut={isSkipBackwardAnimatingOut}
                showToast={showToast}
                toastMessage={toastMessage}
                showControls={showControls}
                isFullscreen={isFullscreen}
                fullscreenClock={fullscreenClock}
                onTogglePlay={onTogglePlay}
                onSkipForward={onSkipForward}
                onSkipBackward={onSkipBackward}
                showMoreMenu={showMoreMenu}
                isPremium={isPremium}
                isProxied={isProxied}
                onToggleMoreMenu={onToggleMoreMenu}
                onMoreMenuMouseEnter={onMoreMenuMouseEnter}
                onMoreMenuMouseLeave={onMoreMenuMouseLeave}
                onCopyLink={onCopyLink}
                seekStepSeconds={seekStepSeconds}
                playbackRate={playbackRate}
                showSpeedMenu={showSpeedMenu}
                speeds={speeds}
                onToggleSpeedMenu={onToggleSpeedMenu}
                onSpeedChange={onSpeedChange}
                onSpeedMenuMouseEnter={onSpeedMenuMouseEnter}
                onSpeedMenuMouseLeave={onSpeedMenuMouseLeave}
                webFullscreenSize={webFullscreenSize}
                onCycleWebFullscreenSize={onCycleWebFullscreenSize}
                containerRef={containerRef}
                isRotated={isRotated}
            />

            {/* Netflix 剧集选集抽屉 */}
            {episodes && episodes.length > 0 && onCloseEpisodesDrawer && onSelectEpisode && (
                <InPlayerEpisodesDrawer
                    isOpen={isEpisodesDrawerOpen}
                    onClose={onCloseEpisodesDrawer}
                    episodes={episodes}
                    currentEpisode={currentEpisode}
                    onSelectEpisode={onSelectEpisode}
                />
            )}

            {/* Netflix 专线切换抽屉 */}
            {sources && sources.length > 0 && onCloseSourceDrawer && onSelectSource && (
                <InPlayerSourceDrawer
                    isOpen={isSourceDrawerOpen}
                    onClose={onCloseSourceDrawer}
                    sources={sources}
                    currentSource={currentSource}
                    onSelectSource={onSelectSource}
                />
            )}

            {/* Netflix 下一集自动倒计时连播卡片 */}
            {onPlayNextEpisode && onCancelNextEpisode && (
                <NextEpisodeOverlay
                    visible={showNextEpisodeCountdown}
                    nextEpisodeName={nextEpisodeName}
                    nextEpisodeIndex={nextEpisodeIndex}
                    onPlayNext={onPlayNextEpisode}
                    onCancel={onCancelNextEpisode}
                />
            )}

            {/* 键盘快捷键指南 */}
            {onCloseShortcutsModal && (
                <KeyboardShortcutsModal
                    isOpen={isShortcutsModalOpen}
                    onClose={onCloseShortcutsModal}
                />
            )}
        </>
    );
}
