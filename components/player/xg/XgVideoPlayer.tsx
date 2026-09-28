'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Player from 'xgplayer';
import HlsPlugin from 'xgplayer-hls';
import 'xgplayer/dist/index.min.css';
import './xg-player.css';

import { InPlayerSourceDrawer, SourceItem } from '../desktop/InPlayerSourceDrawer';
import { InPlayerEpisodesDrawer } from '../desktop/InPlayerEpisodesDrawer';
import { ChevronLeft, Layers, ListVideo, Zap, Radio } from 'lucide-react';

export interface XgVideoPlayerProps {
  src: string;
  poster?: string;
  onError?: (error: string) => void;
  onTimeUpdate?: (currentTime: number, duration: number) => void;
  initialTime?: number;
  shouldAutoPlay?: boolean;
  totalEpisodes?: number;
  currentEpisodeIndex?: number;
  onNextEpisode?: () => void;
  isReversed?: boolean;
  videoTitle?: string;
  episodeName?: string;
  isPremium?: boolean;
  onBack?: () => void;
  onResolutionDetected?: (info: import('../hooks/useVideoResolution').VideoResolutionInfo) => void;
  episodes?: Array<{ name?: string; url: string }>;
  onSelectEpisode?: (index: number) => void;
  sources?: Array<SourceItem>;
  currentSource?: string;
  onSelectSource?: (source: SourceItem) => void;
}

export function XgVideoPlayer({
  src,
  poster,
  onError,
  onTimeUpdate,
  initialTime = 0,
  shouldAutoPlay = true,
  totalEpisodes = 1,
  currentEpisodeIndex = 0,
  onNextEpisode,
  videoTitle = '',
  episodeName = '',
  isPremium = false,
  onBack,
  onResolutionDetected,
  episodes = [],
  onSelectEpisode,
  sources = [],
  currentSource = '',
  onSelectSource,
}: XgVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  // 抽屉状态
  const [sourceDrawerOpen, setSourceDrawerOpen] = useState(false);
  const [episodeDrawerOpen, setEpisodeDrawerOpen] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);

  // 回调引用绑定，防止闭包失效
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;
  const onNextEpisodeRef = useRef(onNextEpisode);
  onNextEpisodeRef.current = onNextEpisode;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // 判断当前是否使用了暗影专线
  const isShadowLineSource = useMemo(() => {
    return currentSource.includes('shadow') || currentSource.includes('暗影') || currentSource.includes('独家');
  }, [currentSource]);

  // 初始化与销毁 XGPlayer 实例
  useEffect(() => {
    if (!containerRef.current || !src) return;

    // 清理旧实例
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    try {
      const player = new Player({
        el: containerRef.current,
        url: src,
        poster: poster || '',
        autoplay: shouldAutoPlay,
        autoplayMuted: false,
        width: '100%',
        height: '100%',
        plugins: [HlsPlugin],
        hls: {
          targetBufferLength: 120, // 严格遵守 120s 深缓冲区规范
          maxBufferLength: 180,
          maxBufferSize: 60 * 1000 * 1000,
        },
        playbackRate: [0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3],
        defaultPlaybackRate: 1,
        pip: true,
        screenShot: true,
        keyShortcut: true,
        controls: true,
        marginControls: true,
        crossOrigin: false,
        lang: 'zh-cn',
      });

      playerRef.current = player;

      // 绑定生命周期事件
      player.on('timeupdate', () => {
        if (player.currentTime && Number.isFinite(player.currentTime)) {
          onTimeUpdateRef.current?.(player.currentTime, player.duration || 0);
        }
      });

      player.on('ended', () => {
        onNextEpisodeRef.current?.();
      });

      player.on('error', (err: any) => {
        console.warn('[XGPlayer] 播放错误:', err);
        onErrorRef.current?.(err?.message || '视频加载遇到问题');
      });

      player.once('canplay', () => {
        if (initialTime > 0 && Number.isFinite(initialTime)) {
          player.currentTime = initialTime;
        }
      });

      // 监听鼠标活动以控制自定义顶栏显隐
      player.on('user_active', () => setShowControlsOverlay(true));
      player.on('user_inactive', () => setShowControlsOverlay(false));
    } catch (err: any) {
      console.error('[XGPlayer] 初始化异常:', err);
      onErrorRef.current?.(err?.message || '初始化失败');
    }

    return () => {
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [src, poster, shouldAutoPlay, initialTime]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden group select-none">
      {/* XGPlayer DOM 挂载容器 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 顶部通栏自定义覆盖层 (返回、剧名、选集与切源快捷键) */}
      <div
        className={`absolute top-0 inset-x-0 z-30 flex items-center justify-between p-4 bg-linear-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 pointer-events-none ${
          showControlsOverlay || sourceDrawerOpen || episodeDrawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {/* 左侧：返回键与影视信息 */}
        <div className="flex items-center gap-3 pointer-events-auto">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-full bg-black/40 hover:bg-white/20 text-white backdrop-blur-none transition-colors border border-white/10"
              title="返回"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-white drop-shadow truncate max-w-xs sm:max-w-md">
                {videoTitle}
              </h2>
              {isShadowLineSource && (
                <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-linear-to-r from-purple-500/30 to-indigo-500/30 border border-purple-500/40 text-purple-200 shadow-sm animate-pulse">
                  <Radio className="w-3 h-3 text-purple-400" />
                  暗影 4K 原画
                </span>
              )}
            </div>
            {episodeName && (
              <span className="text-xs text-slate-300/80 drop-shadow">{episodeName}</span>
            )}
          </div>
        </div>

        {/* 右侧：切源与选集抽屉呼出按钮 */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {sources.length > 0 && (
            <button
              onClick={() => setSourceDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-black/50 hover:bg-white/15 text-white text-xs flex items-center gap-1.5 border border-white/15 transition-all hover:scale-105"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>换源</span>
              {currentSource && (
                <span className="text-[10px] text-slate-400 font-mono">({currentSource})</span>
              )}
            </button>
          )}

          {episodes.length > 1 && (
            <button
              onClick={() => setEpisodeDrawerOpen(true)}
              className="px-3 py-1.5 rounded-lg bg-black/50 hover:bg-white/15 text-white text-xs flex items-center gap-1.5 border border-white/15 transition-all hover:scale-105"
            >
              <ListVideo className="w-3.5 h-3.5 text-sky-400" />
              <span>选集</span>
              <span className="text-[10px] text-slate-400 font-mono">
                ({currentEpisodeIndex + 1}/{totalEpisodes})
              </span>
            </button>
          )}
        </div>
      </div>

      {/* 侧边切源抽屉 */}
      <InPlayerSourceDrawer
        isOpen={sourceDrawerOpen}
        onClose={() => setSourceDrawerOpen(false)}
        sources={sources}
        currentSource={currentSource}
        onSelectSource={(source) => {
          onSelectSource?.(source);
          setSourceDrawerOpen(false);
        }}
      />

      {/* 侧边选集抽屉 */}
      <InPlayerEpisodesDrawer
        isOpen={episodeDrawerOpen}
        onClose={() => setEpisodeDrawerOpen(false)}
        episodes={episodes}
        currentEpisode={currentEpisodeIndex}
        onSelectEpisode={(index) => {
          onSelectEpisode?.(index);
          setEpisodeDrawerOpen(false);
        }}
      />
    </div>
  );
}
