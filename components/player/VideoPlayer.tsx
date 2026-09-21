'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { useHistoryStore, usePremiumHistoryStore } from '@/lib/store/history-store';
import { CustomVideoPlayer } from './CustomVideoPlayer';
import { ArtVideoPlayer } from './artplayer/ArtVideoPlayer';
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
  // 片源连接与检索状态文本（收拢全屏 Loading 至播放器视窗内）
  connectingMessage?: string;
  isLoadingSource?: boolean;
  // Netflix 级新交互
  episodes?: Array<{ name?: string; url: string }>;
  onSelectEpisode?: (index: number) => void;
  sources?: Array<import('./desktop/InPlayerSourceDrawer').SourceItem>;
  currentSource?: string;
  onSelectSource?: (source: import('./desktop/InPlayerSourceDrawer').SourceItem) => void;
}

export const VideoPlayer = React.memo(function VideoPlayer({
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
  connectingMessage,
  isLoadingSource,
  episodes,
  onSelectEpisode,
  sources,
  currentSource,
  onSelectSource,
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
  // 普通模式 (iKanPP) 100% 纯前端直连各大主流 CDN，绝不代理也不重写切片；仅 iKanX (isPremium) 允许代理
  const effectiveUseProxy = isPremium
    ? (proxyMode === 'always' ? true : proxyMode === 'none' ? false : useProxy)
    : false;

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

    // Auto-retry with proxy ONLY for iKanX (premium mode):
    // 1. isPremium is true
    // 2. Not already using proxy
    // 3. Proxy mode is 'retry'
    if (isPremium && !effectiveUseProxy && proxyMode === 'retry') {
      lastAutoSwitchTimeRef.current = now;
      setUseProxy(true);
      setShouldAutoPlay(true); // Force autoplay after proxy retry
      setVideoError('');
      return;
    }

    setVideoError(error);
  }, [isPremium, effectiveUseProxy, proxyMode, onPlaybackError]);

  const handleRetry = () => {
    if (retryCount >= MAX_MANUAL_RETRIES) return;

    setRetryCount(prev => prev + 1);
    setVideoError('');
    setShouldAutoPlay(true);
    // 普通主站永远直连重试，仅 iKanX 允许在直连和代理之间切换
    setUseProxy(prev => (!isPremium || proxyMode === 'none') ? false : !prev);
  };

  const finalPlayUrl = effectiveUseProxy
    ? `/api/proxy?url=${encodeURIComponent(playUrl)}&retry=${retryCount}` // Add retry param to force fresh request
    : playUrl;

  if (!playUrl) {
    if (connectingMessage || isLoadingSource) {
      return (
        <div data-no-spatial className="relative group">
          {/* 影院级环境光晕特效 (Ambient Lighting) */}
          <div 
            className="absolute -inset-3 sm:-inset-6 bg-gradient-to-r from-amber-500/20 via-orange-600/15 to-purple-600/20 rounded-3xl blur-2xl sm:blur-3xl opacity-50 transition-opacity duration-1000 -z-10 pointer-events-none"
            aria-hidden="true" 
          />
          <div className="aspect-video w-full rounded-2xl sm:rounded-3xl bg-black/85 backdrop-blur-2xl border border-white/10 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden shadow-2xl">
            {/* 顶层柔和背景光纹 */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            
            {/* 优雅呼吸微光转圈 */}
            <div className="relative flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full border-3 border-white/10 border-t-(--accent-color) animate-spin" />
              <div className="absolute w-6 h-6 rounded-full bg-(--accent-color)/20 blur-md animate-pulse" />
            </div>

            <p className="text-sm sm:text-base font-medium text-white tracking-wide animate-pulse">
              {connectingMessage || '正在智能连接片源...'}
            </p>
            {videoTitle && (
              <p className="text-xs text-white/40 mt-2 max-w-sm truncate">
                《{videoTitle}》
              </p>
            )}
          </div>
        </div>
      );
    }

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
        <ArtVideoPlayer
          key={`${effectiveUseProxy ? 'proxy' : 'direct'}-${retryCount}-${source}`} // Remount when switching sources, modes, or retrying
          playUrl={finalPlayUrl}
          videoId={videoId}
          currentEpisode={currentEpisode}
          onBack={onBack}
          totalEpisodes={totalEpisodes}
          onNextEpisode={onNextEpisode}
          isReversed={isReversed}
          isPremium={isPremium}
          videoTitle={videoTitle}
          episodeName={episodeName}
          externalTimeRef={externalTimeRef}
          nextEpisodeUrl={nextEpisodeUrl}
          initialTime={initialTime}
          shouldAutoPlay={shouldAutoPlay}
          onResolutionDetected={onResolutionDetected}
          onPlaybackError={onPlaybackError}
          connectingMessage={connectingMessage}
          isLoadingSource={isLoadingSource}
          episodes={episodes}
          onSelectEpisode={onSelectEpisode}
          sources={sources}
          currentSource={currentSource}
          onSelectSource={onSelectSource}
        />
      )}
    </div>
  );
});
