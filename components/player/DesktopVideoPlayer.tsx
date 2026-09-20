'use client';

import React from 'react';
import { useDesktopPlayerState } from './hooks/useDesktopPlayerState';
import { useDesktopPlayerLogic } from './hooks/useDesktopPlayerLogic';
import { useHlsPlayer } from './hooks/useHlsPlayer';
import { useAutoSkip } from './hooks/useAutoSkip';
import { useStallDetection } from './hooks/useStallDetection';
import { useVideoResolution } from './hooks/useVideoResolution';
import { DesktopControlsWrapper } from './desktop/DesktopControlsWrapper';
import { DesktopOverlayWrapper } from './desktop/DesktopOverlayWrapper';
import { DanmakuCanvas } from './DanmakuCanvas';
import { usePlayerSettings } from './hooks/usePlayerSettings';
import { useDanmaku } from './hooks/useDanmaku';
import { PlayerBrandLogo } from './PlayerBrandLogo';
import { useIsIOS, useIsMobile } from '@/lib/hooks/mobile/useDeviceDetection';
import { useDoubleTap } from '@/lib/hooks/mobile/useDoubleTap';
import { settingsStore, DEFAULT_SEEK_STEP_SECONDS } from '@/lib/store/settings-store';
import { premiumModeSettingsStore } from '@/lib/store/premium-mode-settings';
import { shouldHidePlayerCursor } from '@/lib/player/cursor-visibility';
import { ChevronLeft } from 'lucide-react';
import './web-fullscreen.css';

type WebFullscreenSize = 'full' | 'large' | 'focused';

const WEB_FULLSCREEN_SIZE_KEY = 'kvideo-web-fullscreen-size';
const WEB_FULLSCREEN_SIZE_ORDER: WebFullscreenSize[] = ['full', 'large', 'focused'];
const WEB_FULLSCREEN_SCALE: Record<WebFullscreenSize, number> = {
  full: 1,
  large: 0.92,
  focused: 0.84,
};

interface ViewportMetrics {
  width: number;
  height: number;
}

type MobileDomesticVideoProps = React.VideoHTMLAttributes<HTMLVideoElement> & {
  'webkit-playsinline'?: 'true';
  'x5-video-player-type'?: 'h5-page';
  'x5-video-player-fullscreen'?: 'true';
  'x5-video-orientation'?: 'landscape|portrait' | 'landscape' | 'portrait';
  'x5-playsinline'?: 'true';
  't7-video-player-type'?: 'inline';
};

const MOBILE_DOMESTIC_VIDEO_PROPS: MobileDomesticVideoProps = {
  'webkit-playsinline': 'true',
  'x5-video-player-type': 'h5-page',
  'x5-video-player-fullscreen': 'true',
  'x5-video-orientation': 'landscape|portrait',
  'x5-playsinline': 'true',
  't7-video-player-type': 'inline',
};

function readViewportMetrics(): ViewportMetrics {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }

  const viewport = window.visualViewport;
  return {
    width: Math.round(viewport?.width ?? window.innerWidth ?? 0),
    height: Math.round(viewport?.height ?? window.innerHeight ?? 0),
  };
}

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
  isPremium?: boolean;
  onBack?: () => void;
  // Resolution callback
  onResolutionDetected?: (info: import('./hooks/useVideoResolution').VideoResolutionInfo) => void;
  // Netflix 级新交互
  episodes?: Array<{ name?: string; url: string }>;
  onSelectEpisode?: (index: number) => void;
  sources?: Array<import('./desktop/InPlayerSourceDrawer').SourceItem>;
  currentSource?: string;
  onSelectSource?: (source: import('./desktop/InPlayerSourceDrawer').SourceItem) => void;
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
  isPremium = false,
  onBack,
  onResolutionDetected,
  episodes,
  onSelectEpisode,
  sources,
  currentSource,
  onSelectSource,
}: DesktopVideoPlayerProps) {
  const { refs, data, actions } = useDesktopPlayerState();
  const { fullscreenType: settingsFullscreenType } = usePlayerSettings(isPremium);
  const isIOS = useIsIOS();
  const isMobile = useIsMobile();
  const [viewportMetrics, setViewportMetrics] = React.useState<ViewportMetrics>(() => readViewportMetrics());
  const [seekStepSeconds, setSeekStepSeconds] = React.useState(DEFAULT_SEEK_STEP_SECONDS);
  const [webFullscreenSize, setWebFullscreenSize] = React.useState<WebFullscreenSize>(() => {
    if (typeof window === 'undefined') return 'full';
    const saved = localStorage.getItem(WEB_FULLSCREEN_SIZE_KEY);
    return saved === 'large' || saved === 'focused' || saved === 'full' ? saved : 'full';
  });
  const [fullscreenClock, setFullscreenClock] = React.useState('');

  // Detect actual video resolution
  const videoResolution = useVideoResolution(refs.videoRef);

  // Notify parent when resolution is detected
  React.useEffect(() => {
    if (videoResolution && onResolutionDetected) {
      onResolutionDetected(videoResolution);
    }
  }, [videoResolution, onResolutionDetected]);

  // 确保视频标签具备 no-referrer 局部隔离策略，允许跨源企业 CDN 切片安全加载
  React.useEffect(() => {
    if (refs.videoRef.current) {
      refs.videoRef.current.setAttribute('referrerpolicy', 'no-referrer');
    }
  }, [refs.videoRef]);

  // Danmaku
  const { danmakuEnabled, comments: danmakuComments } = useDanmaku({
    videoTitle,
    episodeName,
    episodeIndex: currentEpisodeIndex,
  });

  const updateViewportMetrics = React.useCallback(() => {
    setViewportMetrics((current) => {
      const next = readViewportMetrics();
      if (current.width === next.width && current.height === next.height) {
        return current;
      }
      return next;
    });
  }, []);

  React.useEffect(() => {
    updateViewportMetrics();

    const visualViewport = window.visualViewport;
    window.addEventListener('resize', updateViewportMetrics);
    window.addEventListener('orientationchange', updateViewportMetrics);
    visualViewport?.addEventListener('resize', updateViewportMetrics);

    return () => {
      window.removeEventListener('resize', updateViewportMetrics);
      window.removeEventListener('orientationchange', updateViewportMetrics);
      visualViewport?.removeEventListener('resize', updateViewportMetrics);
    };
  }, [updateViewportMetrics]);

  // 默认全屏偏好：优先设备原生全屏 (Native Fullscreen / 真正的全部全屏)
  // 仅在设备明确为 iPhone 手机 (iOS Safari 不支持容器元素全屏) 时平滑降级为 window 网页全屏
  const isIPhoneOnly = typeof navigator !== 'undefined' && /iPhone|iPod/i.test(navigator.userAgent);
  const fullscreenType = settingsFullscreenType === 'auto'
    ? (isIPhoneOnly ? 'window' : 'native')
    : settingsFullscreenType;

  const isLandscape = viewportMetrics.width > viewportMetrics.height;

  // Check if we need to force landscape (iOS + Fullscreen + Portrait)
  const shouldForceLandscape = data.fullscreenMode === 'window' && isIOS && !isLandscape;

  React.useEffect(() => {
    updateViewportMetrics();

    if (data.fullscreenMode !== 'window') return;

    const rafId = window.requestAnimationFrame(updateViewportMetrics);
    const timeoutId = window.setTimeout(updateViewportMetrics, 250);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.clearTimeout(timeoutId);
    };
  }, [data.fullscreenMode, src, updateViewportMetrics]);

  React.useEffect(() => {
    localStorage.setItem(WEB_FULLSCREEN_SIZE_KEY, webFullscreenSize);
  }, [webFullscreenSize]);

  React.useEffect(() => {
    const store = isPremium ? premiumModeSettingsStore : settingsStore;

    const syncSeekStep = () => {
      setSeekStepSeconds(store.getSettings().seekStepSeconds ?? DEFAULT_SEEK_STEP_SECONDS);
    };

    syncSeekStep();
    const unsubscribe = store.subscribe(syncSeekStep);
    return () => unsubscribe();
  }, [isPremium]);

  React.useEffect(() => {
    if (!data.isFullscreen) {
      setFullscreenClock('');
      return;
    }

    const formatter = new Intl.DateTimeFormat('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const updateClock = () => {
      setFullscreenClock(formatter.format(new Date()));
    };

    updateClock();
    const interval = window.setInterval(updateClock, 30000);
    return () => window.clearInterval(interval);
  }, [data.isFullscreen]);

  // Initialize HLS Player
  useHlsPlayer({
    videoRef: refs.videoRef,
    src,
    isPremium,
    autoPlay: shouldAutoPlay,
    onError,
  });

  const {
    videoRef,
    containerRef,
    moreMenuTimeoutRef,
  } = refs;

  const {
    isPlaying,
    currentTime,
    duration,
  } = data;

  const {
    setShowControls,
    setBufferedTime,
    setIsLoading,
  } = actions;


  // Netflix 级沉浸式交互状态
  const [isEpisodesDrawerOpen, setIsEpisodesDrawerOpen] = React.useState(false);
  const [isSourceDrawerOpen, setIsSourceDrawerOpen] = React.useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = React.useState(false);
  const [showNextEpisodeCountdown, setShowNextEpisodeCountdown] = React.useState(false);
  const nextCountdownDismissedRef = React.useRef(false);

  // 切集或切片源时，重置倒计时与抽屉状态
  React.useEffect(() => {
    setShowNextEpisodeCountdown(false);
    nextCountdownDismissedRef.current = false;
    setIsEpisodesDrawerOpen(false);
    setIsSourceDrawerOpen(false);
  }, [src, currentEpisodeIndex]);

  // 检测进入尾声倒数 15 秒且有下一集时，自动滑出 Netflix 经典倒计时卡片
  React.useEffect(() => {
    if (!onNextEpisode) return;
    const hasNext = currentEpisodeIndex < totalEpisodes - 1;
    if (!hasNext) return;

    if (
      data.duration > 30 &&
      data.duration - data.currentTime <= 15 &&
      data.currentTime > 10 &&
      !nextCountdownDismissedRef.current
    ) {
      if (!showNextEpisodeCountdown) {
        setShowNextEpisodeCountdown(true);
      }
    }
  }, [data.currentTime, data.duration, currentEpisodeIndex, totalEpisodes, onNextEpisode, showNextEpisodeCountdown]);

  // 全局/全屏键盘快捷键监听增强（按下 ? 开启帮助，按下 E 开启选集）
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen(prev => !prev);
      } else if ((e.key === 'e' || e.key === 'E') && totalEpisodes > 1) {
        e.preventDefault();
        setIsEpisodesDrawerOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalEpisodes]);


  // 工业级 Loading 防抖机制：
  // 避免 HLS 切片交替（Frag Transition）时的微等待（50~200ms）误报触发转圈
  // 只有当持续网络卡顿超过 400ms 时，才呈现悬浮加载指示器
  const loadingTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearDebouncedLoading = React.useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    setIsLoading(false);
  }, [setIsLoading]);

  const startDebouncedLoading = React.useCallback((immediate = false) => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    if (immediate) {
      setIsLoading(true);
      return;
    }
    loadingTimerRef.current = setTimeout(() => {
      setIsLoading(true);
      loadingTimerRef.current = null;
    }, 400);
  }, [setIsLoading]);

  // Reset loading state and show spinner when source changes
  React.useEffect(() => {
    setIsLoading(true);
    setBufferedTime(0);
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, [src, setBufferedTime, setIsLoading]);

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
    isForceLandscape: shouldForceLandscape,
    seekStepSeconds,
  });

  // Auto-skip intro/outro and auto-next episode
  const { isTransitioningToNextEpisode } = useAutoSkip({
    videoRef,
    currentTime,
    duration,
    isPlaying,
    isPremium,
    totalEpisodes,
    currentEpisodeIndex,
    onNextEpisode,
    isReversed,
    src,
  });

  // Sensitive stalling detection (e.g. video stuck but HTML5 state says playing)
  useStallDetection({
    videoRef,
    isPlaying: data.isPlaying,
    isDraggingProgressRef: refs.isDraggingProgressRef,
    setIsLoading: actions.setIsLoading,
    isTransitioningToNextEpisode
  });

  const {
    handleMouseMove,
    handleTouchToggleControls,
    togglePlay,
    handlePlay,
    handlePause,
    handleTimeUpdateEvent,
    handleLoadedMetadata,
    handleProgressEvent,
    handleVideoError,
  } = logic;

  const cycleWebFullscreenSize = React.useCallback(() => {
    setWebFullscreenSize((current) => {
      const currentIndex = WEB_FULLSCREEN_SIZE_ORDER.indexOf(current);
      return WEB_FULLSCREEN_SIZE_ORDER[(currentIndex + 1) % WEB_FULLSCREEN_SIZE_ORDER.length];
    });
  }, []);

  const webFullscreenStyle = React.useMemo<React.CSSProperties | undefined>(() => {
    if (data.fullscreenMode !== 'window') return undefined;
    if (viewportMetrics.width <= 0 || viewportMetrics.height <= 0) return undefined;

    const stageWidth = shouldForceLandscape ? viewportMetrics.height : viewportMetrics.width;
    const stageHeight = shouldForceLandscape ? viewportMetrics.width : viewportMetrics.height;

    return {
      ['--kvideo-viewport-width' as string]: `${viewportMetrics.width}px`,
      ['--kvideo-viewport-height' as string]: `${viewportMetrics.height}px`,
      ['--kvideo-stage-viewport-width' as string]: `${stageWidth}px`,
      ['--kvideo-stage-viewport-height' as string]: `${stageHeight}px`,
      ['--kvideo-web-scale' as string]: WEB_FULLSCREEN_SCALE[webFullscreenSize].toString(),
    };
  }, [data.fullscreenMode, shouldForceLandscape, viewportMetrics, webFullscreenSize]);

  const shouldHideCursor = shouldHidePlayerCursor({
    isFullscreen: data.isFullscreen,
    isPlaying: data.isPlaying,
    showControls: data.showControls,
    hasInteractiveOverlay: data.showSpeedMenu || data.showMoreMenu || data.showVolumeBar,
  });

  const containerStyle = React.useMemo<React.CSSProperties>(() => ({
    ...(webFullscreenStyle ?? {}),
    cursor: shouldHideCursor ? 'none' : undefined,
  }), [webFullscreenStyle, shouldHideCursor]);

  const stageClassName = data.fullscreenMode === 'window'
    ? 'kvideo-stage kvideo-web-fullscreen-stage'
    : 'kvideo-stage absolute inset-0';
  const isTopAlignedWebFullscreen = data.fullscreenMode === 'window' && isMobile && !isLandscape && !shouldForceLandscape;

  // iPad / 移动端画中画操作指引 Toast 提示（提示支持四角磁吸停靠与双指缩放画幅）
  const [showPiPGuideToast, setShowPiPGuideToast] = React.useState(false);
  const pipGuideTimerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    const handlePiPActive = () => {
      if (pipGuideTimerRef.current) clearTimeout(pipGuideTimerRef.current);
      setShowPiPGuideToast(true);
      pipGuideTimerRef.current = setTimeout(() => {
        setShowPiPGuideToast(false);
        pipGuideTimerRef.current = null;
      }, 3500);
    };

    window.addEventListener('kvideo-pip-active', handlePiPActive);
    return () => {
      window.removeEventListener('kvideo-pip-active', handlePiPActive);
      if (pipGuideTimerRef.current) clearTimeout(pipGuideTimerRef.current);
    };
  }, []);

  // Mobile long-press fast forward state
  const [isLongPressFastForward, setIsLongPressFastForward] = React.useState(false);
  const previousPlaybackRateRef = React.useRef<number>(1.0);

  // Mobile double-tap gesture for skip forward/backward & long-press 2X
  const { handleTouchStart, handleTouchEnd, handleTouchCancel } = useDoubleTap({
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
    onLongPressStart: () => {
      if (!data.isPlaying) return;
      previousPlaybackRateRef.current = data.playbackRate;
      logic.changePlaybackSpeed(2.0);
      setIsLongPressFastForward(true);
    },
    onLongPressEnd: () => {
      logic.changePlaybackSpeed(previousPlaybackRateRef.current || 1.0);
      setIsLongPressFastForward(false);
    },
  });

  return (
    <div
      ref={containerRef}
      className={`kvideo-container relative bg-black group ${
        data.isFullscreen ? 'w-full h-full is-fullscreen' : 'aspect-video'
      } ${
        data.fullscreenMode === 'window' ? 'is-web-fullscreen' : ''
      } ${
        data.fullscreenMode === 'native' ? 'is-native-fullscreen' : ''
      } ${shouldForceLandscape ? 'force-landscape' : ''} ${
        isTopAlignedWebFullscreen ? 'top-align-stage' : ''
      } ${
        data.isFullscreen ? 'overflow-visible' : 'overflow-hidden'
      } ${
        data.isFullscreen ? 'rounded-none' : 'rounded-none sm:rounded-2xl'
      }`}
      style={containerStyle}
      onMouseMove={() => { handleMouseMove(); }}
      onMouseLeave={() => isPlaying && setShowControls(false)}
    >
      <div className={stageClassName}>
        {/* Clipping Wrapper for video and overlays - Restores the 'Liquid Glass' rounded look in normal mode */}
        <div className={`kvideo-clipping-wrapper absolute inset-0 pointer-events-none ${
          data.isFullscreen ? 'overflow-visible rounded-none' : 'overflow-hidden rounded-none sm:rounded-2xl'
        }`}>
          <div className="kvideo-video-slot absolute inset-0 pointer-events-auto">
          {/* Video Element */}
          <video
            ref={videoRef}
            className="w-full h-full object-contain"
            style={{
              transform: 'none',
              WebkitTransform: 'none',
            }}
            poster={poster}
            preload="auto"
            x-webkit-airplay="allow"
            playsInline={true} // Crucial for iOS custom fullscreen to work without native player taking over
            controlsList="nodownload nofullscreen noplaybackrate"
            disablePictureInPicture={false}
            onPlay={() => {
              clearDebouncedLoading();
              handlePlay();
            }}
            onPause={handlePause}
            onTimeUpdate={() => {
              if (loadingTimerRef.current) {
                clearDebouncedLoading();
              }
              handleTimeUpdateEvent();
            }}
            onLoadedMetadata={handleLoadedMetadata}
            onProgress={handleProgressEvent}
            onError={handleVideoError}
            onWaiting={() => startDebouncedLoading(false)}
            onCanPlay={clearDebouncedLoading}
            onPlaying={clearDebouncedLoading}
            onSeeking={() => startDebouncedLoading(true)}
            onSeeked={() => {
              clearDebouncedLoading();
              if (isPlaying && videoRef.current && videoRef.current.paused) {
                videoRef.current.play().catch(() => {});
              }
            }}
            onClick={!isMobile ? () => {
              togglePlay();
            } : undefined}
            onDoubleClick={!isMobile ? () => {
              logic.toggleNativeFullscreen();
            } : undefined}
            onTouchStart={isMobile ? handleTouchStart : undefined}
            onTouchEnd={isMobile ? handleTouchEnd : undefined}
            onTouchCancel={isMobile ? handleTouchCancel : undefined}
            {...MOBILE_DOMESTIC_VIDEO_PROPS} // 微信X5同层、夸克/UC/移动端与iOS完整兼容属性
          />

          {/* iPad / 移动端画中画操作指引 Toast（消除“无法随意移动”误解） */}
          {showPiPGuideToast && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-scale-in max-w-[90vw]">
              <div className="bg-[#141416]/95 border border-white/25 px-4 py-2 rounded-full flex items-center gap-2 shadow-[0_12px_36px_rgba(0,0,0,0.85)]">
                <span className="text-amber-400 text-sm">💡</span>
                <span className="text-xs font-bold text-white tracking-wide">
                  画中画已开启：支持在 iPad 四角磁吸停靠与双指缩放画幅
                </span>
              </div>
            </div>
          )}

          {/* Long Press 2X Fast Forward Capsule Badge */}
          {isLongPressFastForward && (
            <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-scale-in">
              <div className="bg-[#141416]/95 border border-white/20 px-3.5 py-1.5 rounded-full flex items-center gap-2 shadow-[0_8px_32px_rgba(0,0,0,0.8)]">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-(--accent-color) opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-(--accent-color)"></span>
                </span>
                <span className="text-xs font-black text-white tracking-wider flex items-center gap-1">
                  ⚡ 2X 倍速播放中
                </span>
              </div>
            </div>
          )}

          {/* Danmaku Canvas */}
          {danmakuEnabled && danmakuComments.length > 0 && (
            <DanmakuCanvas
              comments={danmakuComments}
              currentTime={currentTime}
              isPlaying={isPlaying}
              duration={duration}
            />
          )}

          {/* 专属 iKanPP 4K VIP 尊享品牌台标（智能边界追踪，100% 严丝合缝死死遮盖 Jable 水印） */}
          <PlayerBrandLogo
            videoRef={refs.videoRef}
            containerRef={containerRef}
            isPremium={isPremium}
            showControls={data.showControls}
          />

          {/* Video Resolution Badge - follows controls bar visibility */}
          {videoResolution && (
            <div className={`absolute top-3 left-36 z-20 pointer-events-none transition-opacity duration-300 ${data.showControls ? 'opacity-80' : 'opacity-0'}`}>
              <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${videoResolution.color}`}>
                {videoResolution.label}
                <span className="font-normal opacity-80">{videoResolution.width}x{videoResolution.height}</span>
              </span>
            </div>
          )}

          {/* 播放器左上角独立快捷返回胶囊（全屏与移动端首选返回入口） */}
          {onBack && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBack();
              }}
              className={`absolute top-4 left-4 z-50 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141416]/85 hover:bg-black/95 border border-white/20 text-white/90 hover:text-white transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95 text-xs font-bold ${
                data.showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              title={isPremium ? '返回午夜版' : '返回'}
            >
              <ChevronLeft size={16} />
              <span>
                {isPremium
                  ? '午夜版'
                  : (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('from')
                      ? ({ movie: '电影', tv: '剧集', anime: '动漫', variety: '综艺', ranking: '榜单', iptv: '直播' } as Record<string, string>)[new URLSearchParams(window.location.search).get('from')!] || '返回'
                      : '返回')}
              </span>
            </button>
          )}

          <DesktopOverlayWrapper
            data={data}
            showControls={data.showControls}
            isFullscreen={data.isFullscreen}
            fullscreenClock={fullscreenClock}
            isRotated={shouldForceLandscape}
            onTogglePlay={togglePlay}
            onSkipForward={logic.skipForward}
            onSkipBackward={logic.skipBackward}
            isTransitioningToNextEpisode={isTransitioningToNextEpisode}
            // More Menu Props
            showMoreMenu={data.showMoreMenu}
            isPremium={isPremium}
            isProxied={src.includes('/api/proxy')}
            onToggleMoreMenu={() => actions.setShowMoreMenu(!data.showMoreMenu)}
            onMoreMenuMouseEnter={() => {
              if (moreMenuTimeoutRef.current) {
                clearTimeout(moreMenuTimeoutRef.current);
                moreMenuTimeoutRef.current = null;
              }
            }}
            onMoreMenuMouseLeave={() => {
              if (moreMenuTimeoutRef.current) {
                clearTimeout(moreMenuTimeoutRef.current);
              }
              moreMenuTimeoutRef.current = setTimeout(() => {
                actions.setShowMoreMenu(false);
                moreMenuTimeoutRef.current = null;
              }, 800); // Increased timeout for better stability
            }}
            onCopyLink={logic.handleCopyLink}
            seekStepSeconds={seekStepSeconds}
            // Speed Menu Props
            playbackRate={data.playbackRate}
            showSpeedMenu={data.showSpeedMenu}
            speeds={[0.5, 0.75, 1, 1.25, 1.5, 2]}
            onToggleSpeedMenu={() => actions.setShowSpeedMenu(!data.showSpeedMenu)}
            onSpeedChange={logic.changePlaybackSpeed}
            onSpeedMenuMouseEnter={logic.clearSpeedMenuTimeout}
            onSpeedMenuMouseLeave={logic.startSpeedMenuTimeout}
            webFullscreenSize={webFullscreenSize}
            onCycleWebFullscreenSize={cycleWebFullscreenSize}
            // Portal container
            containerRef={containerRef}
            // Netflix 级新交互
            episodes={episodes}
            currentEpisode={currentEpisodeIndex}
            isEpisodesDrawerOpen={isEpisodesDrawerOpen}
            onCloseEpisodesDrawer={() => setIsEpisodesDrawerOpen(false)}
            onSelectEpisode={onSelectEpisode}
            sources={sources}
            currentSource={currentSource}
            isSourceDrawerOpen={isSourceDrawerOpen}
            onCloseSourceDrawer={() => setIsSourceDrawerOpen(false)}
            onSelectSource={onSelectSource}
            isShortcutsModalOpen={isShortcutsModalOpen}
            onCloseShortcutsModal={() => setIsShortcutsModalOpen(false)}
            showNextEpisodeCountdown={showNextEpisodeCountdown}
            nextEpisodeName={episodes?.[currentEpisodeIndex + 1]?.name || `第 ${currentEpisodeIndex + 2} 集`}
            nextEpisodeIndex={currentEpisodeIndex + 1}
            onPlayNextEpisode={() => {
              setShowNextEpisodeCountdown(false);
              onNextEpisode?.();
            }}
            onCancelNextEpisode={() => {
              setShowNextEpisodeCountdown(false);
              nextCountdownDismissedRef.current = true;
            }}
          />

          <DesktopControlsWrapper
            src={src}
            data={data}
            logic={logic}
            refs={refs}
            totalEpisodes={totalEpisodes}
            onToggleEpisodesDrawer={() => setIsEpisodesDrawerOpen((prev) => !prev)}
            sourcesCount={sources?.length || 1}
            onToggleSourceDrawer={() => setIsSourceDrawerOpen((prev) => !prev)}
            onToggleShortcutsModal={() => setIsShortcutsModalOpen((prev) => !prev)}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
