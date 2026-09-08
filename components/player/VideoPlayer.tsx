'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useHistoryStore, usePremiumHistoryStore } from '@/lib/store/history-store';
import { CustomVideoPlayer } from './CustomVideoPlayer';
import { VideoPlayerError } from './VideoPlayerError';
import { VideoPlayerEmpty } from './VideoPlayerEmpty';
import { usePlayerSettings } from './hooks/usePlayerSettings';

interface VideoPlayerProps {
  playUrl: string;
  videoId?: string;
  currentEpisode: number;
  onBack: () => void;
  // Episode navigation props for auto-skip/auto-next
  totalEpisodes?: number;
  onNextEpisode?: () => void;
  isReversed?: boolean;
  isPremium?: boolean;
  // Danmaku props
  videoTitle?: string;
  episodeName?: string;
  // Expose current time to parent
  externalTimeRef?: React.MutableRefObject<number>;
  // Next episode URL
  nextEpisodeUrl?: string | null;
  // Resolution callback
  onResolutionDetected?: (info: import('./hooks/useVideoResolution').VideoResolutionInfo) => void;
  // 零成本播放失败自动切源回调
  onPlaybackError?: (error: string) => boolean | void;
}

export function VideoPlayer({
  playUrl,
  videoId,
  currentEpisode,
  onBack,
  totalEpisodes,
  onNextEpisode,
  isReversed = false,
  isPremium = false,
  videoTitle,
  episodeName,
  externalTimeRef,
  nextEpisodeUrl,
  onResolutionDetected,
  onPlaybackError,
}: VideoPlayerProps) {
  const [videoError, setVideoError] = useState<string>('');
  const [useProxy, setUseProxy] = useState(false);
  const [shouldAutoPlay, setShouldAutoPlay] = useState(true);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_MANUAL_RETRIES = 20;
  const lastSaveTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const durationRef = useRef(0);
  const SAVE_INTERVAL = 5000; // 5 seconds throttle

  const { showModeIndicator, proxyMode } = usePlayerSettings(isPremium);
  const effectiveUseProxy = proxyMode === 'always' ? true : proxyMode === 'none' ? false : useProxy;

  // 使用 Selector 单独订阅 addToHistory 动作，彻底切断每 5 秒保存进度导致的播放器子树无端重渲染与卡顿！
  const addToHistory = isPremium
    ? usePremiumHistoryStore((s) => s.addToHistory)
    : useHistoryStore((s) => s.addToHistory);
  const searchParams = useSearchParams();

  // Get video metadata from URL params
  const source = searchParams.get('source') || '';
  const title = searchParams.get('title') || '未知视频';

  // 仅在视频/集数初次挂载或切源切集时获取起播进度，绝不随每次时间存储而反复触发组件重渲染
  const initialTime = useMemo(() => {
    const timeParam = searchParams.get('t');
    if (timeParam) {
      const t = parseFloat(timeParam);
      if (t > 0 && isFinite(t)) return t;
    }

    if (!videoId) return 0;

    const history = (isPremium ? usePremiumHistoryStore : useHistoryStore).getState().viewingHistory;
    const normalizedTitle = title.toLowerCase().trim();
    const historyItem = history.find(item =>
      item.title.toLowerCase().trim() === normalizedTitle &&
      item.episodeIndex === currentEpisode
    );

    return historyItem ? historyItem.playbackPosition : 0;
  }, [videoId, currentEpisode, searchParams, title, isPremium]);

  // Save progress function (used by throttle and beforeunload)
  const saveProgress = useCallback((currentTime: number, duration: number) => {
    if (!videoId || !playUrl || duration === 0 || currentTime <= 1) return;
    addToHistory(
      videoId,
      title,
      playUrl,
      currentEpisode,
      source,
      currentTime,
      duration,
      undefined,
      []
    );
  }, [videoId, playUrl, title, currentEpisode, source, addToHistory]);

  // Handle time updates and save progress (throttled to every 5 seconds)
  const handleTimeUpdate = useCallback((currentTime: number, duration: number) => {
    // Always track current time for beforeunload
    currentTimeRef.current = currentTime;
    durationRef.current = duration;
    // Expose to parent for source switching
    if (externalTimeRef) externalTimeRef.current = currentTime;

    if (!videoId || !playUrl || duration === 0) return;

    const now = Date.now();
    // Only save if enough time has passed since last save
    if (currentTime > 1 && now - lastSaveTimeRef.current >= SAVE_INTERVAL) {
      lastSaveTimeRef.current = now;
      saveProgress(currentTime, duration);
    }
  }, [videoId, playUrl, saveProgress]);

  // Save on page leave/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Save current progress before leaving
      if (currentTimeRef.current > 1 && durationRef.current > 0) {
        saveProgress(currentTimeRef.current, durationRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveProgress]);

  const lastAutoSwitchTimeRef = useRef(0);

  // Handle video errors
  const handleVideoError = useCallback((error: string) => {
    console.error('Video playback error:', error);
    const now = Date.now();

    // 防抖与熔断保护：2.5秒内禁止重复切线自愈，杜绝高频刷新与黑屏闪烁
    if (now - lastAutoSwitchTimeRef.current < 2500) {
      return;
    }

    // 优先尝试纯前端零成本自动切换到其他可用线路（自愈机制，0 服务器成本）
    if (onPlaybackError && onPlaybackError(error)) {
      lastAutoSwitchTimeRef.current = now;
      setVideoError('');
      return;
    }

    // Auto-retry with proxy if:
    // 1. Not already using proxy
    // 2. Proxy mode is NOT 'none' (so 'retry' or potentially 'always' if it somehow failed locally)
    // 3. Proxy mode is 'retry' (specifically for the auto-switch logic)
    if (!effectiveUseProxy && proxyMode === 'retry') {
      lastAutoSwitchTimeRef.current = now;
      setUseProxy(true);
      setShouldAutoPlay(true); // Force autoplay after proxy retry
      setVideoError('');
      return;
    }

    setVideoError(error);
  }, [effectiveUseProxy, proxyMode, onPlaybackError]);

  const handleRetry = () => {
    if (retryCount >= MAX_MANUAL_RETRIES) return;

    setRetryCount(prev => prev + 1);
    setVideoError('');
    setShouldAutoPlay(true);
    // Toggle proxy to try different path, but since we are already in error state which likely means proxy failed (or direct failed),
    // we can try toggling or just force re-render.
    // Requirement says: "try without proxy and proxy and same as before"
    // We will just toggle useProxy state to force a refresh with/without proxy.
    // However, if we want to cycle, we can just toggle.
    // But the requirement says "proxy attempt count to 20".
    // So we just increment count and maybe toggle proxy or keep it.
    // Let's toggle it to give best chance.
    // Actually requirement says "try no proxy and proxy and same as before".
    // So simple toggle is fine.
    setUseProxy(prev => proxyMode === 'none' ? false : !prev);
  };

  const finalPlayUrl = effectiveUseProxy
    ? `/api/proxy?url=${encodeURIComponent(playUrl)}&retry=${retryCount}` // Add retry param to force fresh request
    : playUrl;

  if (!playUrl) {
    return <VideoPlayerEmpty videoTitle={videoTitle} isPremium={isPremium} />;
  }

  return (
    <div data-no-spatial className="relative group">
      {/* 影院级环境光晕特效 (Ambient Lighting) */}
      <div 
        className="absolute -inset-3 sm:-inset-6 bg-gradient-to-r from-amber-500/20 via-orange-600/15 to-purple-600/20 rounded-3xl blur-2xl sm:blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-1000 -z-10 pointer-events-none"
        aria-hidden="true" 
      />

      {/* Mode Indicator Badge - controlled by settings */}
      {showModeIndicator && (
        <div className="absolute top-3 right-3 z-30">
          <span className={`px-2 py-1 text-xs font-medium rounded-full backdrop-blur-md transition-all duration-300 ${effectiveUseProxy
            ? 'bg-orange-500/80 text-white'
            : 'bg-green-500/80 text-white'
            }`}>
            {effectiveUseProxy ? '代理模式' : '直连模式'}
          </span>
        </div>
      )}
      {videoError ? (
        <VideoPlayerError
          error={videoError}
          onBack={onBack}
          onRetry={handleRetry}
          retryCount={retryCount}
          maxRetries={MAX_MANUAL_RETRIES}
        />
      ) : (
        <CustomVideoPlayer
          key={`${effectiveUseProxy ? 'proxy' : 'direct'}-${retryCount}-${source}`} // Remount when switching sources, modes, or retrying
          src={finalPlayUrl}
          onError={handleVideoError}
          onTimeUpdate={handleTimeUpdate}
          initialTime={initialTime}
          shouldAutoPlay={shouldAutoPlay}
          totalEpisodes={totalEpisodes}
          currentEpisodeIndex={currentEpisode}
          onNextEpisode={onNextEpisode}
          isReversed={isReversed}
          videoTitle={videoTitle}
          episodeName={episodeName}
          isPremium={isPremium}
          onBack={onBack}
          onResolutionDetected={onResolutionDetected}
        />
      )}
    </div>
  );
}
