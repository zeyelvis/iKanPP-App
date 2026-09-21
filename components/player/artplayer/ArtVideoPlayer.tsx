'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { createHlsConfig } from '@/lib/player/hls-config-factory';
import { InPlayerEpisodesDrawer } from '../desktop/InPlayerEpisodesDrawer';
import { InPlayerSourceDrawer } from '../desktop/InPlayerSourceDrawer';
import { NextEpisodeOverlay } from '../desktop/NextEpisodeOverlay';
import { KeyboardShortcutsModal } from '../desktop/KeyboardShortcutsModal';
import { InPlayerTopBar } from '../desktop/InPlayerTopBar';
import { ChevronLeft, MessageSquare, Clock, FastForward, RotateCcw, RotateCw, Sparkles, Zap, VolumeX } from 'lucide-react';
import { useHistoryStore, usePremiumHistoryStore } from '@/lib/store/history-store';
import { settingsStore } from '@/lib/store/settings-store';
import { premiumModeSettingsStore } from '@/lib/store/premium-mode-settings';
import { filterM3u8Ad } from '@/lib/utils/m3u8-utils';
import { usePlayerSettings } from '../hooks/usePlayerSettings';
import type { VideoResolutionInfo } from '../hooks/useVideoResolution';

interface SourceItem {
  id: string | number;
  source: string;
  label?: string;
  isAvailable?: boolean;
}

interface EpisodeItem {
  name?: string;
  url: string;
}

export interface ArtVideoPlayerProps {
  playUrl: string;
  videoId?: string;
  currentEpisode: number;
  onBack?: () => void;
  totalEpisodes?: number;
  onNextEpisode?: () => void;
  isReversed?: boolean;
  isPremium?: boolean;
  videoTitle?: string;
  episodeName?: string;
  externalTimeRef?: React.MutableRefObject<number>;
  nextEpisodeUrl?: string | null;
  onResolutionDetected?: (info: VideoResolutionInfo) => void;
  onPlaybackError?: (error: string) => boolean | void;
  connectingMessage?: string;
  isLoadingSource?: boolean;
  episodes?: EpisodeItem[];
  onSelectEpisode?: (index: number) => void;
  sources?: SourceItem[];
  currentSource?: string;
  onSelectSource?: (source: SourceItem) => void;
  rating?: string | number | null;
  resolutionLabel?: string;
}

export const ArtVideoPlayer = React.memo(function ArtVideoPlayer({
  playUrl,
  videoId,
  currentEpisode,
  onBack,
  totalEpisodes = 1,
  onNextEpisode,
  isPremium = false,
  initialTime = 0,
  shouldAutoPlay = true,
  videoTitle = '',
  episodeName = '',
  externalTimeRef,
  onResolutionDetected,
  onPlaybackError,
  connectingMessage,
  isLoadingSource = false,
  episodes = [],
  onSelectEpisode,
  sources = [],
  currentSource = '',
  onSelectSource,
  rating = null,
  resolutionLabel,
}: ArtVideoPlayerProps & { initialTime?: number; shouldAutoPlay?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<Artplayer | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // 状态抽屉与交互弹窗
  const [isEpisodesDrawerOpen, setIsEpisodesDrawerOpen] = useState(false);
  const [isSourceDrawerOpen, setIsSourceDrawerOpen] = useState(false);
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  const [showNextEpisodeCountdown, setShowNextEpisodeCountdown] = useState(false);
  const nextCountdownDismissedRef = useRef(false);

  // 全屏与时钟状态
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenClock, setFullscreenClock] = useState('');
  const [showControls, setShowControls] = useState(true);

  // 🌟 沉浸式流媒体手势与反馈状态
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const [seekFeedback, setSeekFeedback] = useState<{ type: 'forward' | 'rewind'; text: string } | null>(null);
  const [showSkipIntroBtn, setShowSkipIntroBtn] = useState(false);
  const [stallCandidate, setStallCandidate] = useState<SourceItem | null>(null);
  const [detectedResLabel, setDetectedResLabel] = useState<string>(resolutionLabel || '4K 超清');
  const [isMutedAutoPlayed, setIsMutedAutoPlayed] = useState(false);

  // 保存进度历史专用 selector，严格杜绝全量订阅导致的 5 秒重渲染瀑布
  const addToHistory = isPremium
    ? usePremiumHistoryStore((s) => s.addToHistory)
    : useHistoryStore((s) => s.addToHistory);

  const { adFilterMode, adKeywords } = usePlayerSettings(isPremium);

  // 读取用户设置的快进步长
  const [seekStepSeconds, setSeekStepSeconds] = useState(10);
  useEffect(() => {
    const store = isPremium ? premiumModeSettingsStore : settingsStore;
    const syncStep = () => {
      setSeekStepSeconds(store.getSettings().seekStepSeconds ?? 10);
    };
    syncStep();
    return store.subscribe(syncStep);
  }, [isPremium]);

  // Ref 稳定引用，供底层事件闭包调用，彻底隔断 props 微变导致的初始化 useEffect 重新运行
  const onPlaybackErrorRef = useRef(onPlaybackError);
  onPlaybackErrorRef.current = onPlaybackError;
  const onNextEpisodeRef = useRef(onNextEpisode);
  onNextEpisodeRef.current = onNextEpisode;
  const onResolutionDetectedRef = useRef(onResolutionDetected);
  onResolutionDetectedRef.current = onResolutionDetected;

  const initialTimeRef = useRef(initialTime);
  useEffect(() => {
    if (initialTime && initialTime > 0) {
      initialTimeRef.current = initialTime;
    }
  }, [initialTime]);

  const shouldAutoPlayRef = useRef(shouldAutoPlay);
  useEffect(() => {
    shouldAutoPlayRef.current = shouldAutoPlay;
  }, [shouldAutoPlay]);

  const adFilterModeRef = useRef(adFilterMode);
  useEffect(() => {
    adFilterModeRef.current = adFilterMode;
  }, [adFilterMode]);

  const adKeywordsRef = useRef(adKeywords);
  useEffect(() => {
    adKeywordsRef.current = adKeywords;
  }, [adKeywords]);

  // 记录上次保存时间，防抖 5 秒保存
  const lastSaveTimeRef = useRef<number>(0);

  // 智能自动播放调度器：先尝试带声播放；若被浏览器 Autoplay Policy 拦截，立即降级为静音秒开，确保画面立刻流动
  const attemptAutoPlay = useCallback((art: Artplayer) => {
    if (!shouldAutoPlayRef.current) return;

    art.muted = false;
    const playPromise = art.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch((err: any) => {
        console.warn('[Artplayer] 带声自动播放被浏览器拦截，立即启动静音秒开自愈:', err);
        art.muted = true;
        setIsMutedAutoPlayed(true);
        art.play().catch((e: any) => {
          console.warn('[Artplayer] 静音自动播放亦受阻:', e);
        });
      });
    }
  }, []);

  // 用户点击或交互时，快速解开静音恢复震撼原声
  const handleRestoreSound = useCallback(() => {
    if (artRef.current) {
      artRef.current.muted = false;
      setIsMutedAutoPlayed(false);
      if (artRef.current.notice) {
        artRef.current.notice.show = '';
      }
    }
  }, []);

  // 播放 M3U8 的核心定制逻辑 (100% 继承双轨直连/反代与 120s 缓冲区深水库)
  const playM3u8 = useCallback((video: HTMLVideoElement, url: string, art: Artplayer) => {
    if (Hls.isSupported()) {
      if ((art as any).hls) {
        try {
          (art as any).hls.destroy();
        } catch (e) {}
        (art as any).hls = null;
      }

      const isMobile = Artplayer.utils.isMobile;

      const config = createHlsConfig({
        isMobileClient: isMobile,
        isAdFilterEnabled: true,
        filterM3u8Ad,
        adFilterMode: adFilterModeRef.current,
        adKeywords: adKeywordsRef.current,
      });

      // 历史进度起点配置：让 Hls.js 从对应切片直接拉取，避免先下 0 秒切片再被 currentTime 打断清空
      if (initialTimeRef.current && initialTimeRef.current > 0) {
        config.startPosition = initialTimeRef.current;
      }

      const hls = new Hls(config);
      hls.loadSource(url);
      hls.attachMedia(video);
      (art as any).hls = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        initialTimeRef.current = 0; // 首次启动后清零
        attemptAutoPlay(art);
      });

      hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
        if (data.details?.totalduration && art.duration !== data.details.totalduration) {
          // 时长自愈
        }
      });

      // 工业级双阶错误自愈体系（网络重拉 + 媒体解码管线重建 + 最终切源）
      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('[Artplayer HLS] 遇到致命错误:', data.type, data.details);
          switch (data.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              console.warn('[Artplayer HLS] 触发网络级自愈重载...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              console.warn('[Artplayer HLS] 触发媒体解码管线自愈 recoverMediaError...');
              hls.recoverMediaError();
              break;
            default:
              console.warn('[Artplayer HLS] 无法自愈的致命故障，通知切源:', data.details);
              try {
                hls.destroy();
              } catch (e) {}
              if (onPlaybackErrorRef.current) {
                const handled = onPlaybackErrorRef.current(data.details || 'HLS Fatal Error');
                if (handled !== false) {
                  art.notice.show = '播放失败，正在自动切源中...';
                }
              }
              break;
          }
        }
      });

      art.on('destroy', () => {
        try {
          hls.destroy();
        } catch (e) {}
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // 苹果原生 Safari / iOS AVPlayer 硬件加速
      video.src = url;
      if (initialTimeRef.current && initialTimeRef.current > 0) {
        video.currentTime = initialTimeRef.current;
        initialTimeRef.current = 0;
      }
      attemptAutoPlay(art);
    } else {
      art.notice.show = '当前浏览器环境暂不支持播放此视频流';
    }
  }, [attemptAutoPlay]);

  // 切集或切片源时，重置倒计时与抽屉状态
  useEffect(() => {
    setShowNextEpisodeCountdown(false);
    nextCountdownDismissedRef.current = false;
    setIsEpisodesDrawerOpen(false);
    setIsSourceDrawerOpen(false);
  }, [playUrl, currentEpisode]);

  // 全屏数字时钟定时器
  useEffect(() => {
    if (!isFullscreen) {
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
  }, [isFullscreen]);

  // 全局/全屏键盘快捷键监听
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      } else if ((e.key === 'e' || e.key === 'E') && totalEpisodes > 1) {
        e.preventDefault();
        setIsEpisodesDrawerOpen((prev) => !prev);
        setIsSourceDrawerOpen(false);
      } else if ((e.key === 's' || e.key === 'S') && sources.length > 1) {
        e.preventDefault();
        setIsSourceDrawerOpen((prev) => !prev);
        setIsEpisodesDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalEpisodes, sources.length, isPremium]);

  // 初始化与重置 Artplayer
  useEffect(() => {
    if (!containerRef.current) return;

    // 自定义控制栏按钮
    const customControls: any[] = [];

    if (episodes && episodes.length > 1 && onSelectEpisode) {
      customControls.push({
        name: 'episodes-drawer-btn',
        position: 'right',
        html: '<span class="art-custom-btn" style="font-size:12px;font-weight:700;display:flex;align-items:center;gap:4px;cursor:pointer;padding:0 8px;height:100%;color:#fff;">选集</span>',
        tooltip: '选择集数 (E)',
        click: function () {
          setIsEpisodesDrawerOpen((prev) => !prev);
          setIsSourceDrawerOpen(false);
        },
      });
    }
    if (sources && sources.length > 1 && onSelectSource) {
      customControls.push({
        name: 'sources-drawer-btn',
        position: 'right',
        html: '<span class="art-custom-btn" style="font-size:12px;font-weight:700;display:flex;align-items:center;gap:4px;cursor:pointer;padding:0 8px;height:100%;color:#fff;">线路</span>',
        tooltip: '切换专线源站 (S)',
        click: function () {
          setIsSourceDrawerOpen((prev) => !prev);
          setIsEpisodesDrawerOpen(false);
        },
      });
    }

    // 插件列表
    const plugins: any[] = [];

    // 设置快进步长
    Artplayer.SEEK_STEP = seekStepSeconds;

    const art = new Artplayer({
      container: containerRef.current,
      url: playUrl,
      type: 'm3u8',
      customType: {
        m3u8: playM3u8,
      },
      theme: '#e50914',
      volume: 0.8,
      isLive: false,
      muted: false,
      autoplay: false, // 统一由 Hls.Events.MANIFEST_PARSED 安全拉起，杜绝挂起与并发冲突
      pip: true,
      autoSize: false,
      autoMini: true,
      screenshot: true,
      setting: true,
      loop: false,
      flip: true,
      playbackRate: true,
      aspectRatio: true,
      fullscreen: true,
      fullscreenWeb: true,
      miniProgressBar: true,
      mutex: true,
      backdrop: true,
      playsInline: true,
      autoPlayback: true,
      airplay: true,
      lock: true,
      fastForward: true,
      autoOrientation: true,
      moreVideoAttr: {
        playsInline: true,
      } as any,
      controls: customControls,
      plugins: plugins,
      contextmenu: [
        {
          html: isPremium ? 'iKanX 4K VIP 专区' : 'iKanPP 4K 极速流媒体',
        },
        {
          html: '键盘快捷键指南 (?)',
          click: function () {
            setIsShortcutsModalOpen(true);
          },
        },
      ],
      icons: {
        loading: '<div class="spinner" style="width:40px;height:40px;border-width:3px;"></div>',
      },
    });

    artRef.current = art;
    setPortalTarget(art.template.$player);

    // 事件监听：全屏状态
    art.on('fullscreen', (state: boolean) => {
      setIsFullscreen(state);
    });
    art.on('fullscreenWeb', (state: boolean) => {
      setIsFullscreen(state);
    });

    // 事件监听：播放器时间更新
    art.on('video:timeupdate', () => {
      const cur = art.currentTime;
      const dur = art.duration;
      if (externalTimeRef) {
        externalTimeRef.current = cur;
      }

      // 检测进入尾声倒数 15 秒且有下一集时，弹出 Netflix 倒计时卡片
      const hasNext = currentEpisode < totalEpisodes - 1;
      if (
        hasNext &&
        onNextEpisodeRef.current &&
        dur > 30 &&
        dur - cur <= 15 &&
        cur > 10 &&
        !nextCountdownDismissedRef.current
      ) {
        setShowNextEpisodeCountdown(true);
      }

      // 智能跳过片头：在前 90 秒内且视频总长 > 5 分钟时滑出悬浮提示
      if (cur >= 5 && cur <= 90 && dur > 300) {
        setShowSkipIntroBtn(true);
      } else {
        setShowSkipIntroBtn(false);
      }

      // 每 5 秒定时记录播放历史
      const now = Date.now();
      if (now - lastSaveTimeRef.current >= 5000 && cur > 1 && videoId) {
        lastSaveTimeRef.current = now;
        addToHistory(
          videoId,
          videoTitle || '',
          playUrl,
          currentEpisode,
          currentSource || '',
          Math.floor(cur),
          Math.floor(dur || 0),
          undefined,
          episodes as any,
          { isPremium }
        );
      }
    });

    // 事件监听：控制栏显示隐藏
    art.on('control', (state: boolean) => {
      setShowControls(state);
    });

    // 事件监听：播放结束自动下一集
    art.on('video:ended', () => {
      if (onNextEpisodeRef.current) {
        onNextEpisodeRef.current();
      }
    });

    // 事件监听：视频元数据读取
    art.on('video:loadedmetadata', () => {
      const video = art.video;
      if (video && video.videoWidth && video.videoHeight) {
        const w = video.videoWidth;
        const h = video.videoHeight;
        let label = '1080P';
        let color = 'bg-blue-600';
        if (w >= 3800 || h >= 2100) {
          label = '4K 超清';
          color = 'bg-amber-500';
        } else if (w >= 2500 || h >= 1400) {
          label = '2K 极清';
          color = 'bg-emerald-600';
        } else if (w < 1200 && h < 700) {
          label = '720P 高清';
          color = 'bg-slate-600';
        }
        setDetectedResLabel(label);
        if (onResolutionDetectedRef.current) {
          onResolutionDetectedRef.current({
            width: w,
            height: h,
            label,
            color,
          });
        }
      }
    });

    // 绝对状态同步与卡顿自愈感知雷达
    const rawVideo = art.video;
    let stallTimeout: any = null;

    if (rawVideo) {
      const handlePlaying = () => {
        if (stallTimeout) clearTimeout(stallTimeout);
        setStallCandidate(null);
        if (art.template?.$state) {
          art.template.$state.style.display = 'none';
        }
        if (art.template?.$loading) {
          art.template.$loading.style.display = 'none';
        }
      };
      const handlePause = () => {
        if (stallTimeout) clearTimeout(stallTimeout);
        setStallCandidate(null);
        if (art.template?.$state) {
          art.template.$state.style.display = 'flex';
        }
      };
      const handleWaiting = () => {
        if (art.template?.$loading) {
          art.template.$loading.style.display = 'flex';
        }
        // 连续缓冲超过 3.5 秒，自动探知备选健康源
        if (sources && sources.length > 1 && onSelectSource) {
          stallTimeout = setTimeout(() => {
            const candidate = sources.find((s) => s.source !== currentSource);
            if (candidate) {
              setStallCandidate(candidate);
            }
          }, 3500);
        }
      };
      const handleCanPlay = () => {
        if (art.template?.$loading) {
          art.template.$loading.style.display = 'none';
        }
      };

      rawVideo.addEventListener('playing', handlePlaying);
      rawVideo.addEventListener('pause', handlePause);
      rawVideo.addEventListener('waiting', handleWaiting);
      rawVideo.addEventListener('canplay', handleCanPlay);

      art.on('destroy', () => {
        if (stallTimeout) clearTimeout(stallTimeout);
        rawVideo.removeEventListener('playing', handlePlaying);
        rawVideo.removeEventListener('pause', handlePause);
        rawVideo.removeEventListener('waiting', handleWaiting);
        rawVideo.removeEventListener('canplay', handleCanPlay);
      });
    }

    // 🌟 手势与 HUD 系统：长按 2.0x 极速快进 + 双击左右 ±10s 快进快退
    const playerEl = art.template.$player;
    let longPressTimer: any = null;
    let isLongPressing = false;
    let savedPlaybackRate = 1;

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('.art-bottom') ||
        target.closest('.art-controls') ||
        target.closest('button') ||
        target.closest('.art-state') ||
        target.closest('.player-interactive-overlay')
      ) {
        return;
      }

      savedPlaybackRate = art.playbackRate || 1;
      longPressTimer = setTimeout(() => {
        isLongPressing = true;
        art.playbackRate = 2.0;
        setIsFastForwarding(true);
      }, 350);
    };

    const handlePointerUp = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
      if (isLongPressing) {
        isLongPressing = false;
        art.playbackRate = savedPlaybackRate;
        setIsFastForwarding(false);
      }
    };

    let seekFeedbackTimer: any = null;
    const triggerSeekFeedback = (type: 'forward' | 'rewind', text: string) => {
      if (seekFeedbackTimer) clearTimeout(seekFeedbackTimer);
      setSeekFeedback({ type, text });
      seekFeedbackTimer = setTimeout(() => {
        setSeekFeedback(null);
      }, 900);
    };

    const handleDoubleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.closest('.art-bottom') ||
        target.closest('.art-controls') ||
        target.closest('button') ||
        target.closest('.player-interactive-overlay')
      ) {
        return;
      }

      const rect = playerEl.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const isLeft = clickX < rect.width * 0.4;
      const isRight = clickX > rect.width * 0.6;

      if (isLeft) {
        art.currentTime = Math.max(0, art.currentTime - seekStepSeconds);
        triggerSeekFeedback('rewind', `-${seekStepSeconds}s`);
      } else if (isRight) {
        art.currentTime = Math.min(art.duration, art.currentTime + seekStepSeconds);
        triggerSeekFeedback('forward', `+${seekStepSeconds}s`);
      }
    };

    playerEl.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('pointercancel', handlePointerUp);
    playerEl.addEventListener('dblclick', handleDoubleClick);

    art.on('destroy', () => {
      playerEl.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('pointercancel', handlePointerUp);
      playerEl.removeEventListener('dblclick', handleDoubleClick);
      if (seekFeedbackTimer) clearTimeout(seekFeedbackTimer);
    });

    // 用户与播放器产生任何交互时，若处于静音自愈状态，尝试自动恢复声音
    art.on('click', handleRestoreSound);

    // 清理实例 (严格彻底物理销毁，杜绝幽灵 video 留在后台播声音)
    return () => {
      if (artRef.current) {
        try {
          const artInstance = artRef.current;
          if (artInstance.video) {
            artInstance.video.pause();
            artInstance.video.removeAttribute('src');
            artInstance.video.load();
          }
          if ((artInstance as any).hls) {
            try {
              (artInstance as any).hls.destroy();
            } catch (e) {}
            (artInstance as any).hls = null;
          }
          artInstance.destroy(true); // 传入 true，彻底抹除 DOM 元素！
        } catch (err) {
          console.warn('[Artplayer] Cleanup error:', err);
        }
        artRef.current = null;
      }
    };
  }, [playM3u8, isPremium, seekStepSeconds, sources, currentSource, onSelectSource]);

  return (
    <div className="relative w-full h-full aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden group">
      {/* Artplayer 挂载根容器 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 通过 React Portal 直接挂载进全屏 DOM 根节点，绝不受全屏样式阻断 */}
      {portalTarget &&
        ReactDOM.createPortal(
          <>
            {/* 1. Apple TV+ 级全屏与沉浸动态元数据顶栏 */}
            <InPlayerTopBar
              title={videoTitle}
              episodeName={episodeName}
              isPremium={isPremium}
              onBack={onBack}
              showControls={showControls}
              fullscreenClock={fullscreenClock}
              rating={rating}
              resolutionLabel={detectedResLabel}
            />

            {/* 1.5 浏览器静音自动播放友好恢复胶囊 */}
            {isMutedAutoPlayed && (
              <div className="absolute top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
                <button
                  type="button"
                  onClick={handleRestoreSound}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs sm:text-sm shadow-[0_8px_32px_rgba(229,9,20,0.6)] animate-bounce cursor-pointer border border-white/30 transition-transform active:scale-95 select-none"
                >
                  <VolumeX size={16} className="shrink-0" />
                  <span>浏览器已静音播放，点击恢复声音 🔊</span>
                </button>
              </div>
            )}

            {/* 2. 长按 2.0X 极速快进 HUD 呼吸指示气泡 */}
            {isFastForwarding && (
              <div className="absolute top-16 sm:top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-black/95 border border-red-500/60 text-white shadow-[0_8px_32px_rgba(229,9,20,0.6)] pointer-events-none animate-pulse">
                <FastForward size={16} className="text-red-500" />
                <span className="text-xs sm:text-sm font-bold tracking-wider">
                  2.0X 极速快进中
                </span>
              </div>
            )}

            {/* 3. 双击左右快退/快进拟态水波纹指示器 */}
            {seekFeedback && (
              <div
                className={`absolute top-1/2 -translate-y-1/2 z-40 flex flex-col items-center justify-center pointer-events-none transition-all duration-300 ${
                  seekFeedback.type === 'rewind' ? 'left-12 sm:left-24' : 'right-12 sm:right-24'
                }`}
              >
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-black/85 border border-white/20 flex flex-col items-center justify-center shadow-2xl scale-110">
                  {seekFeedback.type === 'rewind' ? (
                    <RotateCcw size={22} className="text-white mb-1" />
                  ) : (
                    <RotateCw size={22} className="text-white mb-1" />
                  )}
                  <span className="text-xs font-mono font-bold text-white">
                    {seekFeedback.text}
                  </span>
                </div>
              </div>
            )}

            {/* 4. 智能跳过片头悬浮胶囊 */}
            {showSkipIntroBtn && !isEpisodesDrawerOpen && !isSourceDrawerOpen && (
              <div className="absolute bottom-20 right-6 z-40 pointer-events-auto animate-fadeIn">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (artRef.current) {
                      artRef.current.currentTime = 90;
                      setShowSkipIntroBtn(false);
                      if (artRef.current.notice) {
                        artRef.current.notice.show = '已为您跳过片头 90 秒';
                      }
                    }
                  }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#141416]/95 hover:bg-black border border-white/25 text-white shadow-[0_8px_30px_rgba(0,0,0,0.8)] hover:border-red-500/60 hover:scale-105 active:scale-95 transition-all text-xs sm:text-sm font-bold cursor-pointer"
                >
                  <Zap size={14} className="text-amber-400 fill-amber-400" />
                  <span>跳过片头 ➔</span>
                </button>
              </div>
            )}

            {/* 5. 卡顿智能切源雷达微通知 */}
            {stallCandidate && (
              <div className="absolute top-20 right-6 z-40 pointer-events-auto animate-fadeIn max-w-xs">
                <div className="p-3 rounded-2xl bg-[#141416]/95 border border-amber-500/40 shadow-2xl text-white">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-amber-400">
                      <Zap size={12} className="fill-amber-400" />
                      智能自愈雷达
                    </span>
                    <button
                      onClick={() => setStallCandidate(null)}
                      className="text-white/40 hover:text-white text-xs cursor-pointer"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-[11px] text-white/70 mb-2 leading-tight">
                    当前专线网络波动，建议平滑切换至备选线路
                  </p>
                  <button
                    onClick={() => {
                      if (onSelectSource && stallCandidate) {
                        onSelectSource(stallCandidate);
                        setStallCandidate(null);
                      }
                    }}
                    className="w-full py-1.5 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer text-center"
                  >
                    立即切换至【{stallCandidate.label || stallCandidate.source}】
                  </button>
                </div>
              </div>
            )}

            {/* 3. Netflix 级剧集选集抽屉 */}
            {episodes && episodes.length > 0 && onSelectEpisode && (
              <InPlayerEpisodesDrawer
                isOpen={isEpisodesDrawerOpen}
                onClose={() => setIsEpisodesDrawerOpen(false)}
                episodes={episodes}
                currentEpisode={currentEpisode}
                onSelectEpisode={(idx) => {
                  onSelectEpisode(idx);
                  setIsEpisodesDrawerOpen(false);
                }}
              />
            )}

            {/* 4. Netflix 级专线切换抽屉 */}
            {sources && sources.length > 0 && onSelectSource && (
              <InPlayerSourceDrawer
                isOpen={isSourceDrawerOpen}
                onClose={() => setIsSourceDrawerOpen(false)}
                sources={sources}
                currentSource={currentSource}
                onSelectSource={(item) => {
                  onSelectSource(item);
                  setIsSourceDrawerOpen(false);
                }}
              />
            )}

            {/* 5. Netflix 级尾声 15 秒下一集倒计时卡片 */}
            <NextEpisodeOverlay
              visible={showNextEpisodeCountdown}
              nextEpisodeName={episodes?.[currentEpisode + 1]?.name || `第 ${currentEpisode + 2} 集`}
              nextEpisodeIndex={currentEpisode + 1}
              onPlayNext={() => {
                setShowNextEpisodeCountdown(false);
                onNextEpisodeRef.current?.();
              }}
              onCancel={() => {
                setShowNextEpisodeCountdown(false);
                nextCountdownDismissedRef.current = true;
              }}
            />

            {/* 6. 键盘快捷键指南模态框 (?) */}
            <KeyboardShortcutsModal
              isOpen={isShortcutsModalOpen}
              onClose={() => setIsShortcutsModalOpen(false)}
            />

            {/* 7. 专线检索与连接状态指示 (纯色无模糊，防显卡黑屏) */}
            {isLoadingSource && (
              <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/75 pointer-events-none transition-opacity">
                <div className="w-10 h-10 border-3 border-white/20 border-t-red-600 rounded-full animate-spin mb-3" />
                <p className="text-sm font-medium text-white/90 tracking-wide">
                  {connectingMessage || '正在连接专线源站...'}
                </p>
              </div>
            )}
          </>,
          portalTarget
        )}
    </div>
  );
});
