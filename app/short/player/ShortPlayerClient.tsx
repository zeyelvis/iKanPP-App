'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { useHlsPlayer } from '@/components/player/hooks/useHlsPlayer';
import { useHistoryStore } from '@/lib/store/history-store';
import { ShortEpisodeSheet } from '@/components/player/ShortEpisodeSheet';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import {
  ShortDramaEpisode,
  parseShortDramaPlayUrl,
  parseEpisodesCount,
} from '@/lib/api/short-drama-sources';

const SPEED_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0, 3.0];

interface EndRecommendItem {
  title: string;
  poster: string;
  remarks?: string;
  firstPlayUrl?: string;
}

export default function ShortPlayerClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从 URL 参数获取基础信息
  const titleParam = searchParams.get('title') || '微短剧';
  const rawUrlParam = searchParams.get('url') || '';
  const initialEpParam = parseInt(searchParams.get('ep') || '1', 10);
  const posterParam = searchParams.get('poster') || '';

  // 状态管理
  const [title, setTitle] = useState(titleParam);
  const [poster, setPoster] = useState(posterParam);
  const [episodes, setEpisodes] = useState<ShortDramaEpisode[]>([]);
  const [currentEpIndex, setCurrentEpIndex] = useState(initialEpParam);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isLongPressing, setIsLongPressing] = useState(false);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showEpisodeSheet, setShowEpisodeSheet] = useState(false);
  const [showEndModal, setShowEndModal] = useState(false);
  const [endRecommendations, setEndRecommendations] = useState<EndRecommendItem[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // 引用
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const preloadedRef = useRef(false);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartYRef = useRef(0);
  const touchStartTimeRef = useRef(0);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const wheelThrottleRef = useRef(false);

  // 历史记录 Store
  const addToHistory = useHistoryStore((s) => s.addToHistory);

  // 提示 Toast
  const showToast = useCallback((msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage(msg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }, []);

  // 1. 初始化剧集数据（如果 URL 传入了 rawUrl 则直接解析，否则通过 search API 自愈拉取）
  useEffect(() => {
    let isMounted = true;

    async function initDramaData() {
      // 1. 若已传入 rawUrl 且包含真实多集（> 1 集）
      if (rawUrlParam) {
        const parsed = parseShortDramaPlayUrl(rawUrlParam);
        if (parsed.length > 1) {
          if (isMounted) {
            setEpisodes(parsed);
            return;
          }
        }
      }

      // 2. 如果未传 rawUrl 或者传入仅有 1 集，通过 search API 寻找真正拥有多集分集的版本
      if (titleParam) {
        setIsLoading(true);
        try {
          const res = await fetch(`/api/short-dramas/search?q=${encodeURIComponent(titleParam)}`);
          if (!res.ok) throw new Error('Search failed');
          const data = await res.json();
          if (data.list && data.list.length > 0) {
            // 优先匹配包含真实多集的版本
            const bestHit =
              data.list.find((it: any) => it.episodes && it.episodes.length > 1) || data.list[0];

            if (isMounted) {
              setTitle(bestHit.title || titleParam);
              if (bestHit.poster) setPoster(bestHit.poster);
              if (bestHit.episodes && bestHit.episodes.length > 0) {
                setEpisodes(bestHit.episodes);
                if (bestHit.playUrl && typeof window !== 'undefined') {
                  const p = new URLSearchParams(window.location.search);
                  p.set('url', bestHit.playUrl);
                  window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`);
                }
                return;
              } else if (bestHit.playUrl) {
                const epList = parseShortDramaPlayUrl(bestHit.playUrl);
                if (epList.length > 0) {
                  setEpisodes(epList);
                  if (typeof window !== 'undefined') {
                    const p = new URLSearchParams(window.location.search);
                    p.set('url', bestHit.playUrl);
                    window.history.replaceState(null, '', `${window.location.pathname}?${p.toString()}`);
                  }
                  return;
                }
              }
            }
          }
        } catch (err) {
          console.error('Init drama search error:', err);
        } finally {
          if (isMounted) setIsLoading(false);
        }
      }

      // 3. 兜底降级：若搜索无多集结果，但传入了 rawUrl，则加载该单集
      if (rawUrlParam && isMounted) {
        const fallbackParsed = parseShortDramaPlayUrl(rawUrlParam);
        setEpisodes(
          fallbackParsed.length > 0
            ? fallbackParsed
            : [{ name: '第1集', url: rawUrlParam, epIndex: 1 }]
        );
      }
    }

    initDramaData();
    return () => {
      isMounted = false;
    };
  }, [titleParam, rawUrlParam]);

  // 异步预加载完结推荐短剧（用于全剧播毕留存转化）
  useEffect(() => {
    async function loadEndRecs() {
      try {
        const res = await fetch('/api/short-dramas/browse?category=shuangju&limit=3');
        if (!res.ok) return;
        const data = await res.json();
        if (data.list) {
          setEndRecommendations(
            data.list.slice(0, 3).map((it: any) => ({
              title: it.title,
              poster: it.poster,
              remarks: it.remarks,
              firstPlayUrl: it.firstPlayUrl,
            }))
          );
        }
      } catch {}
    }
    loadEndRecs();
  }, []);

  // 当前播放源 URL
  const currentEpisode = episodes[currentEpIndex - 1] || episodes[0];
  const currentUrl = currentEpisode?.url || rawUrlParam || '';

  // 2. 挂接核心 Hls.js 播放器（严格遵守轨道 A 直连铁律，isPremium 恒为 false，绝无代理）
  useHlsPlayer({
    videoRef,
    src: currentUrl,
    autoPlay: true,
    isPremium: false,
    onError: (msg) => {
      console.warn('[ShortPlayer] HLS Warning/Error:', msg);
      setIsLoading(false);
    },
  });

  // 3. 播放器事件绑定（进度、70%预探、结束自动连播）
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);

      // 70% 进度时预连接下一集切片
      if (video.duration > 0 && video.currentTime / video.duration > 0.7) {
        if (!preloadedRef.current && currentEpIndex < episodes.length) {
          preloadedRef.current = true;
          const nextEp = episodes[currentEpIndex];
          if (nextEp?.url && typeof document !== 'undefined') {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'fetch';
            link.href = nextEp.url;
            document.head.appendChild(link);
          }
        }
      }

      // 同步历史记录
      if (video.currentTime > 2 && video.duration > 0) {
        addToHistory(
          `short-${title}`,
          title,
          currentUrl,
          currentEpIndex,
          'modu',
          video.currentTime,
          video.duration,
          poster,
          episodes.map((ep, i) => ({ name: ep.name, url: ep.url, index: i })),
          { type_name: '微短剧', isPremium: false }
        );
      }
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onWaiting = () => setIsLoading(true);
    const onPlaying = () => setIsLoading(false);
    const onLoadedData = () => setIsLoading(false);

    // 集数播放完毕，自动无缝连播下一集；最后一集弹出完结推荐
    const onEnded = () => {
      if (currentEpIndex < episodes.length) {
        showToast(`已为您自动播放第 ${currentEpIndex + 1} 集`);
        setCurrentEpIndex((prev) => prev + 1);
        preloadedRef.current = false;
      } else {
        showToast('全剧已播放完毕！为您推荐精彩好剧');
        setShowEndModal(true);
      }
    };

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('loadeddata', onLoadedData);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('loadeddata', onLoadedData);
      video.removeEventListener('ended', onEnded);
    };
  }, [currentUrl, currentEpIndex, episodes, title, poster, addToHistory, showToast]);

  // 切集函数
  const switchEpisode = useCallback(
    (targetIndex: number) => {
      if (targetIndex < 1 || targetIndex > episodes.length) return;
      setCurrentEpIndex(targetIndex);
      preloadedRef.current = false;
      setShowEndModal(false);
      setIsLoading(true);
      showToast(`正在播放第 ${targetIndex} 集`);
      // 更新 URL
      const params = new URLSearchParams(window.location.search);
      params.set('ep', String(targetIndex));
      window.history.replaceState(null, '', `${window.location.pathname}?${params.toString()}`);
    },
    [episodes.length, showToast]
  );

  // 播放 / 暂停切换
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // 快进 / 后退
  const seekRelative = useCallback((seconds: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + seconds));
    showToast(seconds > 0 ? '+10秒' : '-10秒');
  }, [showToast]);

  // 手势交互引擎
  const handlePointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.player-control-interactive')) return;

    touchStartYRef.current = e.clientY;
    touchStartTimeRef.current = Date.now();

    longPressTimerRef.current = setTimeout(() => {
      const video = videoRef.current;
      if (video && !video.paused) {
        setIsLongPressing(true);
        video.playbackRate = 3.0;
      }
    }, 500);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest('.player-control-interactive')) return;

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (isLongPressing) {
      setIsLongPressing(false);
      const video = videoRef.current;
      if (video) video.playbackRate = playbackRate;
      return;
    }

    const deltaY = e.clientY - touchStartYRef.current;
    const durationMs = Date.now() - touchStartTimeRef.current;

    if (Math.abs(deltaY) > 50 && durationMs < 500) {
      if (deltaY < 0) {
        if (currentEpIndex < episodes.length) {
          switchEpisode(currentEpIndex + 1);
        } else {
          showToast('已经是最后一集啦');
        }
      } else {
        if (currentEpIndex > 1) {
          switchEpisode(currentEpIndex - 1);
        } else {
          showToast('已经是第一集啦');
        }
      }
      return;
    }

    if (Math.abs(deltaY) < 15) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        if (clickX < rect.width / 2) {
          seekRelative(-10);
        } else {
          seekRelative(10);
        }
      } else {
        clickTimerRef.current = setTimeout(() => {
          togglePlay();
          clickTimerRef.current = null;
        }, 260);
      }
    }
  };

  // 鼠标滚轮切集
  const handleWheel = (e: React.WheelEvent) => {
    if (wheelThrottleRef.current) return;
    if (Math.abs(e.deltaY) > 40) {
      wheelThrottleRef.current = true;
      if (e.deltaY > 0) {
        if (currentEpIndex < episodes.length) switchEpisode(currentEpIndex + 1);
      } else {
        if (currentEpIndex > 1) switchEpisode(currentEpIndex - 1);
      }
      setTimeout(() => {
        wheelThrottleRef.current = false;
      }, 600);
    }
  };

  // 切换倍速
  const handleSelectRate = (rate: number) => {
    setPlaybackRate(rate);
    const video = videoRef.current;
    if (video) video.playbackRate = rate;
    setShowSpeedMenu(false);
    showToast(`倍速已设为 ${rate}x`);
  };

  // 静音切换
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // 分享功能
  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      showToast('已复制短剧专属链接，快去分享给好友吧！');
    }
  };

  // 格式化时间 00:00
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onWheel={handleWheel}
      className="relative w-screen h-[100dvh] bg-black overflow-hidden select-none touch-none flex items-center justify-center"
    >
      {/* 核心视频容器（9:16 沉浸比例） */}
      <video
        ref={videoRef}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        className="w-full h-full object-contain md:object-cover bg-black cursor-pointer"
      />

      {/* 顶部左侧返回按钮与剧名 */}
      <div className="player-control-interactive absolute top-0 left-0 right-0 z-30 p-4 pt-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/short')}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-xl flex items-center justify-center text-white border border-white/10 transition-all cursor-pointer active:scale-90 shadow-lg"
          >
            <Icons.ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="text-base sm:text-lg font-black text-white truncate max-w-[220px] sm:max-w-md drop-shadow-md">
              {title}
            </h1>
            <p className="text-xs text-white/60 drop-shadow">
              第 {currentEpIndex} 集 {episodes.length > 0 && `/ 共 ${episodes.length} 集`}
            </p>
          </div>
        </div>

        {/* 顶部右侧功能按键 */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleMute}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white/80 hover:text-white transition-all cursor-pointer"
          >
            {isMuted ? <Icons.VolumeX size={18} /> : <Icons.Volume2 size={18} />}
          </button>
          <button
            onClick={() => setShowEpisodeSheet(true)}
            className="px-3 py-1.5 rounded-full bg-(--accent-color) hover:brightness-110 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all cursor-pointer"
          >
            <Icons.List size={14} />
            <span>选集</span>
          </button>
        </div>
      </div>

      {/* 长按 3x 倍速浮动徽标 */}
      {isLongPressing && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-full bg-amber-500/90 backdrop-blur-md text-black font-black text-xs sm:text-sm flex items-center gap-1.5 shadow-2xl animate-pulse">
          <Icons.Zap size={16} />
          <span>3.0X 超速播放中</span>
        </div>
      )}

      {/* 画面中间加载动画 */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
          <div className="w-14 h-14 rounded-full border-4 border-white/20 border-t-(--accent-color) animate-spin" />
        </div>
      )}

      {/* 画面中间暂停指示图标 */}
      {!isPlaying && !isLoading && !showEndModal && (
        <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none animate-scaleIn">
          <div className="w-16 h-16 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl">
            <Icons.Play size={32} className="ml-1 fill-white" />
          </div>
        </div>
      )}

      {/* 右侧悬浮垂直操作栏 */}
      <div className="player-control-interactive absolute right-3 bottom-24 z-30 flex flex-col items-center gap-4 pointer-events-auto">
        {/* 分享 */}
        <button
          onClick={handleShare}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-all cursor-pointer group active:scale-90"
        >
          <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-lg group-hover:border-(--accent-color)">
            <Icons.Share2 size={18} />
          </div>
          <span className="text-[10px] font-bold">分享</span>
        </button>

        {/* 选集 */}
        <button
          onClick={() => setShowEpisodeSheet(true)}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-all cursor-pointer group active:scale-90"
        >
          <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-lg group-hover:border-(--accent-color)">
            <Icons.Layers size={20} />
          </div>
          <span className="text-[10px] font-bold">选集</span>
        </button>

        {/* 倍速 */}
        <div className="relative">
          <button
            onClick={() => setShowSpeedMenu((prev) => !prev)}
            className="flex flex-col items-center gap-1 text-white/80 hover:text-white transition-all cursor-pointer group active:scale-90"
          >
            <div className="w-11 h-11 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-xl border border-white/15 flex items-center justify-center shadow-lg group-hover:border-(--accent-color)">
              <span className="text-xs font-black">{playbackRate}x</span>
            </div>
            <span className="text-[10px] font-bold">倍速</span>
          </button>

          {/* 倍速切换面板 */}
          {showSpeedMenu && (
            <div className="absolute right-14 bottom-0 bg-[#14141E]/95 backdrop-blur-2xl border border-white/15 rounded-2xl p-2 shadow-2xl flex flex-col gap-1 min-w-[70px] animate-scaleIn">
              {SPEED_OPTIONS.map((rate) => (
                <button
                  key={rate}
                  onClick={() => handleSelectRate(rate)}
                  className={`py-1.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer ${
                    playbackRate === rate
                      ? 'bg-(--accent-color) text-white shadow-md'
                      : 'text-white/70 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {rate}x
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 上一集 */}
        <button
          onClick={() => switchEpisode(currentEpIndex - 1)}
          disabled={currentEpIndex <= 1}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white disabled:opacity-30 transition-all cursor-pointer active:scale-90"
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-lg border border-white/10 flex items-center justify-center shadow-lg">
            <Icons.ChevronUp size={18} />
          </div>
          <span className="text-[9px]">上一集</span>
        </button>

        {/* 下一集 */}
        <button
          onClick={() => switchEpisode(currentEpIndex + 1)}
          disabled={currentEpIndex >= episodes.length}
          className="flex flex-col items-center gap-1 text-white/80 hover:text-white disabled:opacity-30 transition-all cursor-pointer active:scale-90"
        >
          <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-lg border border-white/10 flex items-center justify-center shadow-lg">
            <Icons.ChevronDown size={18} />
          </div>
          <span className="text-[9px]">下一集</span>
        </button>
      </div>

      {/* 底部信息浮层与进度条 */}
      <div className="player-control-interactive absolute bottom-0 left-0 right-0 z-30 p-4 pb-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex flex-col gap-2 pointer-events-auto">
        <div className="flex items-center justify-between text-xs text-white/70">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-(--accent-color)/80 text-white font-black text-[11px]">
              第 {currentEpIndex} 集
            </span>
            <span className="truncate max-w-[200px]">{title}</span>
          </div>
          <div className="text-[11px] font-mono text-white/50">
            {formatTime(currentTime)} / {formatTime(duration)}
          </div>
        </div>

        <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden cursor-pointer">
          <div
            className="h-full bg-(--accent-color) rounded-full transition-all duration-100"
            style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
          />
        </div>

        <div className="flex items-center justify-center gap-1 text-[11px] text-white/40 pt-1">
          <span>↑ 上滑看下一集</span>
          <span className="mx-2 text-white/20">|</span>
          <span>↓ 下滑看上一集</span>
          <span className="mx-2 text-white/20">|</span>
          <span>按住 3x 倍速</span>
        </div>
      </div>

      {/* 全剧完结推荐弹窗浮层 */}
      {showEndModal && (
        <div className="player-control-interactive absolute inset-0 z-45 bg-black/85 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white animate-fadeIn pointer-events-auto">
          <div className="w-full max-w-sm bg-[#14141E] border border-white/10 rounded-3xl p-6 shadow-2xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3">
              <Icons.Sparkles size={24} />
            </div>
            <h2 className="text-lg font-black text-white">🎉 全剧完结</h2>
            <p className="text-xs text-white/50 mt-1 mb-4">
              精彩不打烊，为您精选以下高能短剧立即无缝连播：
            </p>

            {/* 3 部推荐短剧 */}
            <div className="w-full grid grid-cols-3 gap-2.5 mb-5">
              {endRecommendations.map((rec) => (
                <div
                  key={rec.title}
                  onClick={() => {
                    const q = new URLSearchParams();
                    q.set('title', rec.title);
                    if (rec.firstPlayUrl) q.set('url', rec.firstPlayUrl);
                    if (rec.poster) q.set('poster', rec.poster);
                    router.push(`/short/player?${q.toString()}`);
                    setShowEndModal(false);
                  }}
                  className="group cursor-pointer flex flex-col gap-1"
                >
                  <div className="relative aspect-[9/13] rounded-xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-(--accent-color) transition-all">
                    <Image
                      src={getOptimizedImageUrl(rec.poster)}
                      alt={rec.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform"
                      unoptimized
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Icons.Play size={20} className="fill-white text-white" />
                    </div>
                  </div>
                  <span className="text-[11px] font-bold line-clamp-1 group-hover:text-(--accent-color) transition-colors">
                    {rec.title}
                  </span>
                </div>
              ))}
            </div>

            {/* 操作按钮组 */}
            <div className="flex items-center gap-2.5 w-full">
              <button
                onClick={() => switchEpisode(1)}
                className="flex-1 py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-xs font-bold transition-all cursor-pointer"
              >
                从头重温
              </button>
              <button
                onClick={() => router.push('/short')}
                className="flex-1 py-2.5 rounded-2xl bg-(--accent-color) hover:brightness-110 text-xs font-black transition-all cursor-pointer shadow-lg"
              >
                返回频道
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast 提示浮窗 */}
      {toastMessage && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 px-4 py-2 rounded-2xl bg-black/80 backdrop-blur-xl border border-white/20 text-white text-xs font-bold shadow-2xl animate-fadeIn">
          {toastMessage}
        </div>
      )}

      {/* 底部全集选集弹窗 */}
      <ShortEpisodeSheet
        isOpen={showEpisodeSheet}
        onClose={() => setShowEpisodeSheet(false)}
        title={title}
        episodes={episodes}
        currentEpIndex={currentEpIndex}
        onSelectEpisode={switchEpisode}
      />
    </div>
  );
}
