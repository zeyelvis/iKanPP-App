'use client';

import React from 'react';
import { useDesktopPlayerState } from './hooks/useDesktopPlayerState';
import { useDesktopPlayerLogic } from './hooks/useDesktopPlayerLogic';
import { useHlsPlayer } from './hooks/useHlsPlayer';
import { useAutoSkip } from './hooks/useAutoSkip';
import { useStallDetection } from './hooks/useStallDetection';
import { useEpisodePrefetch } from './hooks/useEpisodePrefetch';
import { DesktopControlsWrapper } from './desktop/DesktopControlsWrapper';
import { DesktopOverlayWrapper } from './desktop/DesktopOverlayWrapper';
import { DanmakuCanvas } from './DanmakuCanvas';
import { usePlayerSettings } from './hooks/usePlayerSettings';
import { useDanmaku } from './hooks/useDanmaku';
import { useIsIOS, useIsMobile } from '@/lib/hooks/mobile/useDeviceDetection';
import { useDoubleTap } from '@/lib/hooks/mobile/useDoubleTap';
import { shouldHidePlayerCursor } from '@/lib/player/cursor-visibility';
import './web-fullscreen.css';

interface DesktopVideoPlayerProps {
  src: string;
  poster?: string;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
  shouldAutoPlay?: boolean;
  // Episode navigation props for auto-skip/auto-next
  totalEpisodes?: number;
  currentEpisodeIndex?: number;
  onNextEpisode?: () => void;
  isReversed?: boolean;
  // Danmaku props
  videoTitle?: string;
  episodeName?: string;
  // 下一集 URL（用于预加载）
  nextEpisodeUrl?: string | null;
}

export function DesktopVideoPlayer({
  src,
  poster,
  onError,
  onTimeUpdate,
  initialTime = 0,
  shouldAutoPlay = false,
  totalEpisodes = 1,
  currentEpisodeIndex = 0,
  onNextEpisode,
  isReversed = false,
  videoTitle = '',
  episodeName = '',
  nextEpisodeUrl = null,
}: DesktopVideoPlayerProps) {
  const { refs, data, actions } = useDesktopPlayerState();
  const { fullscreenType: settingsFullscreenType } = usePlayerSettings();
  const isIOS = useIsIOS();
  const isMobile = useIsMobile();

  // Danmaku
  const { danmakuEnabled, setDanmakuEnabled, comments: danmakuComments } = useDanmaku({
    videoTitle,
    episodeName,
    episodeIndex: currentEpisodeIndex,
  });

  // State to track if device is in landscape mode
  const [isLandscape, setIsLandscape] = React.useState(true);

  React.useEffect(() => {
    const checkOrientation = () => {
      // Check if width > height
      if (typeof window !== 'undefined') {
        setIsLandscape(window.innerWidth > window.innerHeight);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);
    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Use user preference for fullscreen type, resolving 'auto' to device default
  // Auto Rules:
  // - Mobile: Window Fullscreen (Better for Danmaku/Controls)
  // - Desktop: Native Fullscreen (Better for PiP/Performance)
  const fullscreenType = settingsFullscreenType === 'auto'
    ? (isIOS ? 'window' : isMobile ? 'window' : 'native') // Treat all mobile as window for consistency if auto
    : settingsFullscreenType;

  // Check if we need to force landscape (iOS + Fullscreen + Portrait)
  const shouldForceLandscape = data.isFullscreen && fullscreenType === 'window' && isIOS && !isLandscape;

  // Initialize HLS Player
  const { hlsRef } = useHlsPlayer({
    videoRef: refs.videoRef,
    src,
    autoPlay: shouldAutoPlay
  });

  const {
    videoRef,
    containerRef,
  } = refs;

  const {
    isPlaying,
    currentTime,
    duration,
  } = data;

  const {
    setShowControls,
    setIsLoading,
    setCurrentTime,
    setDuration,
  } = actions;

  // Reset loading state and show spinner when source changes
  React.useEffect(() => {
    setIsLoading(true);
    // 换集时重置，避免新集初始加载触发帧冻结
    hasPlayedRef.current = false;
    if (seekOverlayRef.current?.parentElement) {
      seekOverlayRef.current.parentElement.removeChild(seekOverlayRef.current);
    }
  }, [src, setIsLoading]);

  const logic = useDesktopPlayerLogic({
    src,
    initialTime,
    shouldAutoPlay,
    onError,
    onTimeUpdate,
    refs,
    data,
    actions,
    fullscreenType,
    isForceLandscape: shouldForceLandscape
  });

  // Auto-skip intro/outro and auto-next episode
  const { isOutroActive, isTransitioningToNextEpisode } = useAutoSkip({
    videoRef,
    currentTime,
    duration,
    isPlaying,
    totalEpisodes,
    currentEpisodeIndex,
    onNextEpisode,
    isReversed,
    src,
  });

  // Sensitive stalling detection (e.g. video stuck but HTML5 state says playing)
  useStallDetection({
    videoRef,
    hlsRef,
    isPlaying: data.isPlaying,
    isDraggingProgressRef: refs.isDraggingProgressRef,
    setIsLoading: actions.setIsLoading,
    isTransitioningToNextEpisode
  });

  // 下一集预加载：outro 阶段提前拉取 manifest + 首个分片
  useEpisodePrefetch({
    nextEpisodeUrl,
    isOutroActive,
    isPlaying: data.isPlaying,
  });

  // === Seek 帧冻结遮罩 ===
  // 在用户主动 seek 前截取当前帧覆盖在视频上方，防止 TV 浏览器闪白屏/黑屏
  // ⚠️ 只在视频首次播放后才启用，避免初始加载阶段 HLS 内部 seeking 事件触发多次闪白
  const seekOverlayRef = React.useRef<HTMLImageElement | null>(null);
  const seekCanvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const hasPlayedRef = React.useRef(false);

  const handleSeeking = React.useCallback(() => {
    const video = videoRef.current;
    const container = containerRef.current;
    // 门控：初始加载阶段不启用帧冻结（HLS 内部 seek 会触发多次 seeking 事件）
    if (!video || !container || video.readyState < 2 || !hasPlayedRef.current) return;

    try {
      // 创建离屏 canvas 截取当前帧
      if (!seekCanvasRef.current) {
        seekCanvasRef.current = document.createElement('canvas');
      }
      const canvas = seekCanvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 360;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 将截图转为 dataURL
      const frameUrl = canvas.toDataURL('image/jpeg', 0.85);

      // 创建/复用覆盖 img 元素
      if (!seekOverlayRef.current) {
        const img = document.createElement('img');
        img.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain;z-index:1;pointer-events:none;transition:opacity 0.15s ease-out;';
        seekOverlayRef.current = img;
      }
      const overlay = seekOverlayRef.current;
      overlay.src = frameUrl;
      overlay.style.opacity = '1';

      // 插入到视频旁边（同层级）
      const videoParent = video.parentElement;
      if (videoParent && !videoParent.contains(overlay)) {
        videoParent.appendChild(overlay);
      }
    } catch {
      // canvas 截图可能因 CORS 失败，静默忽略（回退到原始行为）
    }
  }, [videoRef, containerRef]);

  // Seek 完成后：移除帧冻结遮罩 + HLS 声画同步恢复
  const handleSeeked = React.useCallback(() => {
    // 淡出并移除帧冻结遮罩
    const overlay = seekOverlayRef.current;
    if (overlay && overlay.parentElement) {
      overlay.style.opacity = '0';
      setTimeout(() => {
        overlay.parentElement?.removeChild(overlay);
      }, 160);
    }

    // 初始加载阶段不执行声画恢复（避免干扰 HLS 正常初始化）
    if (!hasPlayedRef.current) return;

    // HLS 声画同步恢复
    const hls = hlsRef.current;
    const video = videoRef.current;
    if (!hls || !video) return;

    // 主动要求 HLS 从新位置开始加载分片
    hls.startLoad(video.currentTime);

    // 延迟 500ms 检测声画同步：如果此时仍在缓冲，调用 recoverMediaError 强制同步解码器
    setTimeout(() => {
      if (video && !video.paused && video.readyState < 3) {
        console.warn('[Seek] Post-seek buffer stall, recovering media...');
        hls.recoverMediaError();
      }
    }, 500);
  }, [hlsRef, videoRef]);

  const {
    handleMouseMove,
    handleTouchToggleControls,
    togglePlay,
    handlePlay,
    handlePause,
    handleTimeUpdateEvent,
    handleLoadedMetadata,
    handleVideoError,
  } = logic;

  // Mobile double-tap gesture for skip forward/backward
  const { handleTap } = useDoubleTap({
    onSingleTap: handleTouchToggleControls,
    onDoubleTapLeft: () => {
      logic.skipBackward();
      handleMouseMove(); // Reset 3s auto-hide timer
    },
    onDoubleTapRight: () => {
      logic.skipForward();
      handleMouseMove(); // Reset 3s auto-hide timer
    },
    onSkipContinueLeft: () => {
      logic.skipBackward();
      handleMouseMove();
    },
    onSkipContinueRight: () => {
      logic.skipForward();
      handleMouseMove();
    },
    isSkipModeActive: data.showSkipForwardIndicator || data.showSkipBackwardIndicator,
  });

  const shouldHideCursor = shouldHidePlayerCursor({
    isFullscreen: data.isFullscreen,
    isPlaying: data.isPlaying,
    showControls: data.showControls,
    hasInteractiveOverlay: data.showSpeedMenu || data.showMoreMenu || data.showVolumeBar,
  });

  return (
    <div
      ref={containerRef}
      className={`kvideo-container relative w-full h-auto aspect-video bg-black rounded-[var(--radius-2xl)] group ${data.isFullscreen && fullscreenType === 'window' ? 'is-web-fullscreen' : ''
        } ${shouldForceLandscape ? 'force-landscape' : ''}`}
      style={{ cursor: shouldHideCursor ? 'none' : undefined }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      {/* Clipping Wrapper for video and overlays - Restores the 'Liquid Glass' rounded look */}
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${data.isFullscreen && fullscreenType === 'window' ? 'rounded-0' : 'rounded-[var(--radius-2xl)]'
        }`}>
        <div className="absolute inset-0 pointer-events-auto">
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            poster={poster}
            x-webkit-airplay="allow"
            playsInline={true} // Crucial for iOS custom fullscreen to work without native player taking over
            controls={false} // Explicitly disable native controls
            onPlay={() => { hasPlayedRef.current = true; handlePlay(); }}
            onPause={handlePause}
            onTimeUpdate={handleTimeUpdateEvent}
            onLoadedMetadata={handleLoadedMetadata}
            onError={handleVideoError}
            onWaiting={() => setIsLoading(true)}
            onCanPlay={() => {
              setIsLoading(false);
              // canPlay 时也清除帧冻结遮罩（兜底）
              const overlay = seekOverlayRef.current;
              if (overlay?.parentElement) {
                overlay.style.opacity = '0';
                setTimeout(() => overlay.parentElement?.removeChild(overlay), 160);
              }
            }}
            onSeeking={handleSeeking}
            onSeeked={handleSeeked}
            onClick={!isMobile ? (e) => {
              togglePlay();
            } : undefined}
            onTouchStart={isMobile ? handleTap : undefined}
            {...({ 'webkit-playsinline': 'true' } as any)} // Legacy iOS support
          />

          {/* Danmaku Canvas */}
          {danmakuEnabled && danmakuComments.length > 0 && (
            <DanmakuCanvas
              comments={danmakuComments}
              currentTime={currentTime}
              isPlaying={isPlaying}
              duration={duration}
            />
          )}

          <DesktopOverlayWrapper
            data={data}
            actions={actions}
            showControls={data.showControls}
            isRotated={shouldForceLandscape}
            onTogglePlay={togglePlay}
            onSkipForward={logic.skipForward}
            onSkipBackward={logic.skipBackward}
            isTransitioningToNextEpisode={isTransitioningToNextEpisode}
            // More Menu Props
            showMoreMenu={data.showMoreMenu}
            isProxied={src.includes('/api/proxy')}
            onToggleMoreMenu={() => actions.setShowMoreMenu(!data.showMoreMenu)}
            onMoreMenuMouseEnter={() => {
              if (refs.moreMenuTimeoutRef.current) {
                clearTimeout(refs.moreMenuTimeoutRef.current);
                refs.moreMenuTimeoutRef.current = null;
              }
            }}
            onMoreMenuMouseLeave={() => {
              if (refs.moreMenuTimeoutRef.current) {
                clearTimeout(refs.moreMenuTimeoutRef.current);
              }
              refs.moreMenuTimeoutRef.current = setTimeout(() => {
                actions.setShowMoreMenu(false);
                refs.moreMenuTimeoutRef.current = null;
              }, 800); // Increased timeout for better stability
            }}
            onCopyLink={logic.handleCopyLink}
            // Speed Menu Props
            playbackRate={data.playbackRate}
            showSpeedMenu={data.showSpeedMenu}
            speeds={[0.5, 0.75, 1, 1.25, 1.5, 2]}
            onToggleSpeedMenu={() => actions.setShowSpeedMenu(!data.showSpeedMenu)}
            onSpeedChange={logic.changePlaybackSpeed}
            onSpeedMenuMouseEnter={logic.clearSpeedMenuTimeout}
            onSpeedMenuMouseLeave={logic.startSpeedMenuTimeout}
            // Portal container
            containerRef={containerRef}
          />

          <DesktopControlsWrapper
            src={src}
            data={data}
            actions={actions}
            logic={logic}
            refs={refs}
          />
        </div>
      </div>
    </div>
  );
}
