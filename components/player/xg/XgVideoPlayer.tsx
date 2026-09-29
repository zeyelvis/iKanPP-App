'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import Player from 'xgplayer';
import HlsPlugin from 'xgplayer-hls';
import 'xgplayer/dist/index.min.css';
import './xg-player.css';

import { InPlayerSourceDrawer, SourceItem } from '../desktop/InPlayerSourceDrawer';
import { InPlayerEpisodesDrawer } from '../desktop/InPlayerEpisodesDrawer';
import {
  ChevronLeft,
  Layers,
  ListVideo,
  Zap,
  Radio,
  FastForward,
  Lock,
  Unlock,
  RotateCcw,
  RotateCw,
  Tv,
  Battery,
  BatteryCharging,
} from 'lucide-react';

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
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<Player | null>(null);

  // 全屏与旋转全屏状态
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCssFullscreen, setIsCssFullscreen] = useState(false);
  const [isRotateFullscreen, setIsRotateFullscreen] = useState(false);
  // iPhone / PWA 移动端视口接管与 90 度旋转全屏
  const [isIPhone, setIsIPhone] = useState(false);
  const [isIPhoneCustomFullscreen, setIsIPhoneCustomFullscreen] = useState(false);
  const [isScreenLandscape, setIsScreenLandscape] = useState(false);
  const isFullActive = isFullscreen || isCssFullscreen || isRotateFullscreen || isIPhoneCustomFullscreen;

  // 防误触锁屏状态
  const [isScreenLocked, setIsScreenLocked] = useState(false);
  const isScreenLockedRef = useRef(false);
  isScreenLockedRef.current = isScreenLocked;
  const [showLockButton, setShowLockButton] = useState(true);
  const lockButtonTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 移动端状态栏：实时时间与电量
  const [systemTime, setSystemTime] = useState<string>('');
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState(false);

  // 轻量级 Toast 提示
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 2000);
  }, []);

  // 抽屉状态
  const [sourceDrawerOpen, setSourceDrawerOpen] = useState(false);
  const [episodeDrawerOpen, setEpisodeDrawerOpen] = useState(false);
  const [showControlsOverlay, setShowControlsOverlay] = useState(true);

  // 5.0x 极速快进状态与 Refs
  const [isFastForwarding, setIsFastForwarding] = useState(false);
  const isFastForwardingRef = useRef(false);
  const originalPlaybackRateRef = useRef<number>(1);
  const wasPausedBeforeFastForwardRef = useRef<boolean>(false);
  const keyPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isKeyDownHandledRef = useRef<boolean>(false);
  const pointerPressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 计时器引用
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 回调引用绑定，防止闭包失效
  const onTimeUpdateRef = useRef(onTimeUpdate);
  onTimeUpdateRef.current = onTimeUpdate;
  const onNextEpisodeRef = useRef(onNextEpisode);
  onNextEpisodeRef.current = onNextEpisode;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  // 判断当前是否使用了暗影专线或 iKanPP专线
  const isShadowLineSource = useMemo(() => {
    return currentSource.includes('shadow') || currentSource.includes('暗影') || currentSource.includes('独家') || currentSource.includes('ikanpp') || currentSource.includes('专线');
  }, [currentSource]);

  // 移动端系统时间与电量监听
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setSystemTime(`${hours}:${minutes}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);

    // 电池电量监听
    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery?.().then((battery: any) => {
        setBatteryLevel(Math.round(battery.level * 100));
        setIsCharging(Boolean(battery.charging));

        const handleLevel = () => setBatteryLevel(Math.round(battery.level * 100));
        const handleCharge = () => setIsCharging(Boolean(battery.charging));

        battery.addEventListener('levelchange', handleLevel);
        battery.addEventListener('chargingchange', handleCharge);
      }).catch(() => {});
    }

    return () => clearInterval(interval);
  }, []);

  // 1. iPhone 设备识别与横竖屏方向动态监听
  useEffect(() => {
    const isIosPhone = typeof navigator !== 'undefined' && /iPhone|iPod/i.test(navigator.userAgent);
    setIsIPhone(isIosPhone);

    const updateOrientation = () => {
      const isLand = window.innerWidth > window.innerHeight;
      setIsScreenLandscape(isLand);
    };

    updateOrientation();
    window.addEventListener('resize', updateOrientation);
    window.addEventListener('orientationchange', updateOrientation);

    return () => {
      window.removeEventListener('resize', updateOrientation);
      window.removeEventListener('orientationchange', updateOrientation);
    };
  }, []);

  // 2. iPhone 全屏锁定页面背景滚动与穿透 (Scroll Lock)
  useEffect(() => {
    if (!isIPhoneCustomFullscreen) return;

    const originalOverflow = document.body.style.overflow;
    const originalTouchAction = document.body.style.touchAction;

    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.touchAction = originalTouchAction;
    };
  }, [isIPhoneCustomFullscreen]);

  // 3. 手机物理横转联动全屏 (播放中物理横置手机自动全屏，竖回自动退出)
  useEffect(() => {
    if (!isIPhone) return;

    if (isScreenLandscape) {
      // 物理横屏：只要在播放，自动进入全屏
      if (playerRef.current && !playerRef.current.paused) {
        setIsIPhoneCustomFullscreen(true);
      }
    } else {
      // 物理竖屏：若未加屏幕锁，自动退出全屏恢复内联
      if (!isScreenLockedRef.current) {
        setIsIPhoneCustomFullscreen(false);
      }
    }
  }, [isScreenLandscape, isIPhone]);

  // 4. 同步 XGPlayer 内部状态与触发视口重绘 (Resize)
  useEffect(() => {
    if (playerRef.current && isIPhone) {
      playerRef.current.emit('fullscreen_change', isIPhoneCustomFullscreen);
      const fsBtn = playerRef.current.root?.querySelector('.xgplayer-fullscreen');
      if (fsBtn) {
        if (isIPhoneCustomFullscreen) {
          fsBtn.setAttribute('data-state', 'full');
        } else {
          fsBtn.removeAttribute('data-state');
        }
      }
    }
    if (playerRef.current) {
      const timer = setTimeout(() => {
        try {
          playerRef.current?.emit('resize');
        } catch (_) {}
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isIPhoneCustomFullscreen, isScreenLandscape, isIPhone]);

  // 5. iPhone / PWA 全屏数学视口样式计算 (竖屏 90 度居中自适应，横屏 0 度无缝铺满)
  const iPhoneFullscreenStyle: React.CSSProperties = useMemo(() => {
    if (!isIPhoneCustomFullscreen) return {};

    if (isScreenLandscape) {
      return {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100dvw',
        height: '100dvh',
        maxWidth: '100dvw',
        maxHeight: '100dvh',
        zIndex: 999999,
        transform: 'none',
        borderRadius: 0,
        margin: 0,
      };
    }

    return {
      position: 'fixed',
      width: '100dvh',
      height: '100dvw',
      left: 'calc(50vw - 50dvh)',
      top: 'calc(50dvh - 50vw)',
      transform: 'rotate(90deg)',
      transformOrigin: 'center center',
      zIndex: 999999,
      borderRadius: 0,
      margin: 0,
    };
  }, [isIPhoneCustomFullscreen, isScreenLandscape]);

  // 唤起控制栏与锁屏键 (延时 3.5s 自动淡出)
  const handleTriggerControls = useCallback(() => {
    setShowLockButton(true);
    if (lockButtonTimerRef.current) clearTimeout(lockButtonTimerRef.current);
    lockButtonTimerRef.current = setTimeout(() => {
      setShowLockButton(false);
    }, 3500);

    if (isScreenLocked) return;

    setShowControlsOverlay(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (!sourceDrawerOpen && !episodeDrawerOpen) {
        setShowControlsOverlay(false);
      }
    }, 3500);
  }, [isScreenLocked, sourceDrawerOpen, episodeDrawerOpen]);

  // 切换锁屏防误触
  const handleToggleLock = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsScreenLocked((prev) => {
      const next = !prev;
      showToast(next ? '屏幕已锁定' : '屏幕已解锁');
      if (next) {
        setShowControlsOverlay(false);
      } else {
        setShowControlsOverlay(true);
      }
      return next;
    });
  }, [showToast]);

  // 快退 15 秒
  const handleSkipBackward15 = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const player = playerRef.current;
    if (!player) return;
    const cur = player.currentTime || 0;
    player.currentTime = Math.max(0, cur - 15);
    showToast('快退 15 秒');
  }, [showToast]);

  // 快进 15 秒
  const handleSkipForward15 = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const player = playerRef.current;
    if (!player) return;
    const cur = player.currentTime || 0;
    const dur = player.duration || Infinity;
    player.currentTime = Math.min(dur, cur + 15);
    showToast('快进 15 秒');
  }, [showToast]);

  // AirPlay 投屏触发
  const handleAirPlay = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    const video = (playerRef.current?.video as any);
    if (video && typeof video.webkitShowPlaybackTargetPicker === 'function') {
      video.webkitShowPlaybackTargetPicker();
    } else {
      showToast('可使用系统控制中心或电视投屏');
    }
  }, [showToast]);

  // 全屏退出或返回上一页
  const handleBackAction = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isIPhoneCustomFullscreen) {
      setIsIPhoneCustomFullscreen(false);
      return;
    }
    const player = playerRef.current;
    if (player) {
      const video = player.video as any;
      if (video && typeof video.webkitExitFullscreen === 'function' && video.webkitDisplayingFullscreen) {
        try {
          video.webkitExitFullscreen();
        } catch (_) {}
      }
      if (player.fullscreen) {
        try {
          player.exitFullscreen();
        } catch (_) {}
      }
    }
    setIsFullscreen(false);
    setIsCssFullscreen(false);
    setIsRotateFullscreen(false);

    // 仅在非全屏模式下才真正执行路由返回
    if (!isFullActive) {
      onBack?.();
    }
  }, [isFullActive, isIPhoneCustomFullscreen, onBack]);

  // 启动 5.0x 极速快进
  const startFastForward = useCallback(() => {
    const player = playerRef.current;
    if (!player || isFastForwardingRef.current) return;

    isFastForwardingRef.current = true;
    originalPlaybackRateRef.current = player.playbackRate || 1;
    wasPausedBeforeFastForwardRef.current = Boolean(player.paused);

    try {
      // 5.0 倍速通过底层浏览器硬件自然解复用，零缓冲破坏
      player.playbackRate = 5;
      if (player.video) {
        (player.video as any).playbackRate = 5;
      }
      if (player.paused) {
        player.play();
      }
    } catch (err) {
      console.warn('[FastForward] 5.0x 提速失败:', err);
    }

    setIsFastForwarding(true);
  }, []);

  // 停止 5.0x 极速快进并恢复原倍速
  const stopFastForward = useCallback(() => {
    if (keyPressTimerRef.current) {
      clearTimeout(keyPressTimerRef.current);
      keyPressTimerRef.current = null;
    }
    if (pointerPressTimerRef.current) {
      clearTimeout(pointerPressTimerRef.current);
      pointerPressTimerRef.current = null;
    }

    if (!isFastForwardingRef.current) return;
    isFastForwardingRef.current = false;
    setIsFastForwarding(false);

    const player = playerRef.current;
    if (!player) return;

    const restoreRate = originalPlaybackRateRef.current || 1;
    try {
      player.playbackRate = restoreRate;
      if (player.video) {
        (player.video as any).playbackRate = restoreRate;
      }
      if (wasPausedBeforeFastForwardRef.current) {
        player.pause();
      }
    } catch (err) {
      console.warn('[FastForward] 恢复原倍速失败:', err);
    }
  }, []);

  // 全局键盘快捷键与长按 5.0x 控制器
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果焦点在输入控件中，忽略快捷键
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        (e.target as HTMLElement)?.isContentEditable
      ) {
        return;
      }

      const key = e.key.toLowerCase();
      const player = playerRef.current;
      if (!player) return;

      // 快进键: ArrowRight 或 l
      if (key === 'arrowright' || key === 'l') {
        e.preventDefault();
        handleTriggerControls();

        if (!isKeyDownHandledRef.current) {
          isKeyDownHandledRef.current = true;
          // 按住超过 200ms 即判定为长按极速快进 5.0x
          keyPressTimerRef.current = setTimeout(() => {
            startFastForward();
          }, 200);
        } else if (e.repeat && !isFastForwardingRef.current) {
          // 连续 repeat 立即切入 5.0x
          startFastForward();
        }
        return;
      }

      // 快退键: ArrowLeft 或 j (后退 5 秒)
      if (key === 'arrowleft' || key === 'j') {
        e.preventDefault();
        handleTriggerControls();
        const cur = player.currentTime || 0;
        player.currentTime = Math.max(0, cur - 5);
        return;
      }

      // 播放 / 暂停: 空格 或 k
      if (key === ' ' || key === 'k') {
        e.preventDefault();
        handleTriggerControls();
        if (player.paused) {
          player.play();
        } else {
          player.pause();
        }
        return;
      }

      // 调高音量: ArrowUp
      if (key === 'arrowup') {
        e.preventDefault();
        handleTriggerControls();
        const curVol = typeof player.volume === 'number' ? player.volume : 1;
        player.volume = Math.min(1, Math.round((curVol + 0.1) * 10) / 10);
        return;
      }

      // 调低音量: ArrowDown
      if (key === 'arrowdown') {
        e.preventDefault();
        handleTriggerControls();
        const curVol = typeof player.volume === 'number' ? player.volume : 1;
        player.volume = Math.max(0, Math.round((curVol - 0.1) * 10) / 10);
        return;
      }

      // 静音 / 取消静音: m
      if (key === 'm') {
        e.preventDefault();
        handleTriggerControls();
        player.muted = !player.muted;
        return;
      }

      // 全屏: f
      if (key === 'f') {
        e.preventDefault();
        handleTriggerControls();
        if (player.fullscreen) {
          player.exitFullscreen();
        } else {
          player.getFullscreen(player.root || undefined);
        }
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'arrowright' || key === 'l') {
        isKeyDownHandledRef.current = false;
        if (isFastForwardingRef.current) {
          // 长按结束：恢复原速
          stopFastForward();
        } else {
          // 短按松手（<200ms）：步进快进 5 秒
          if (keyPressTimerRef.current) {
            clearTimeout(keyPressTimerRef.current);
            keyPressTimerRef.current = null;
          }
          const player = playerRef.current;
          if (player) {
            const cur = player.currentTime || 0;
            const dur = player.duration || Infinity;
            player.currentTime = Math.min(dur, cur + 5);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (keyPressTimerRef.current) clearTimeout(keyPressTimerRef.current);
      if (pointerPressTimerRef.current) clearTimeout(pointerPressTimerRef.current);
    };
  }, [startFastForward, stopFastForward, handleTriggerControls]);

  // 全屏事件同步监听兜底
  useEffect(() => {
    const handleDocFsChange = () => {
      const isDocFull = Boolean(
        document.fullscreenElement &&
        (document.fullscreenElement === wrapperRef.current || wrapperRef.current?.contains(document.fullscreenElement))
      );
      setIsFullscreen(isDocFull);
    };

    document.addEventListener('fullscreenchange', handleDocFsChange);
    document.addEventListener('webkitfullscreenchange', handleDocFsChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleDocFsChange);
      document.removeEventListener('webkitfullscreenchange', handleDocFsChange);
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // 初始化与销毁 XGPlayer 实例
  useEffect(() => {
    if (!containerRef.current || !src) return;

    // 清理旧实例
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    const isIPhone = typeof navigator !== 'undefined' && /iPhone|iPod/.test(navigator.userAgent);
    let videoEl: HTMLVideoElement | null = null;
    let handleWebkitBegin: (() => void) | null = null;
    let handleWebkitEnd: (() => void) | null = null;

    try {
      const player = new Player({
        el: containerRef.current,
        fullscreenTarget: wrapperRef.current || undefined,
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
        keyShortcut: false, // 禁用 XG 原生重复触发快捷键，由上层自研长按 5.0x 控制器接管
        controls: true,
        crossOrigin: false,
        lang: 'zh-cn',
        // 移动端正常嵌入播放
        playsinline: true,
        'webkit-playsinline': true,
        'x5-video-player-type': 'h5-page',
        'x5-video-player-fullscreen': 'true',
        'x5-playsinline': 'true',
        // 彻底杜绝生硬的 CSS 旋转假全屏（严禁 rotateFullscreen，避免高度拉伸变形与漏底）
        rotateFullscreen: false,
        fullscreen: isIPhone
          ? {
              rotateFullscreen: false,
              useCssFullscreen: false,
              switchCallback: () => {
                setIsIPhoneCustomFullscreen((prev) => !prev);
              },
            }
          : {
              rotateFullscreen: false,
              useCssFullscreen: false,
              useScreenOrientation: true,
              lockOrientationType: 'landscape',
            },
      });

      playerRef.current = player;

      // 监听 iOS 原生视频全屏生命周期 (WebKit enter/exit fullscreen)
      videoEl = (player.video || containerRef.current?.querySelector('video')) as HTMLVideoElement | null;
      if (videoEl) {
        handleWebkitBegin = () => {
          setIsFullscreen(true);
          player.emit('fullscreen_change', true);
        };
        handleWebkitEnd = () => {
          setIsFullscreen(false);
          player.emit('fullscreen_change', false);
        };
        videoEl.addEventListener('webkitbeginfullscreen', handleWebkitBegin);
        videoEl.addEventListener('webkitendfullscreen', handleWebkitEnd);
      }

      // 绑定全屏与旋转全屏事件
      player.on('fullscreen_change', (isFull: boolean) => {
        setIsFullscreen(Boolean(isFull));
      });

      player.on('cssFullscreen_change', (isCssFull: boolean) => {
        setIsCssFullscreen(Boolean(isCssFull));
      });

      player.on('rotate_fullscreen_change', (isRotateFull: boolean) => {
        setIsRotateFullscreen(Boolean(isRotateFull));
      });

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

      // 监听用户活动
      player.on('user_active', () => handleTriggerControls());
      player.on('user_inactive', () => {
        if (!sourceDrawerOpen && !episodeDrawerOpen) {
          setShowControlsOverlay(false);
        }
      });
    } catch (err: any) {
      console.error('[XGPlayer] 初始化异常:', err);
      onErrorRef.current?.(err?.message || '初始化失败');
    }

    return () => {
      if (videoEl && handleWebkitBegin && handleWebkitEnd) {
        videoEl.removeEventListener('webkitbeginfullscreen', handleWebkitBegin);
        videoEl.removeEventListener('webkitendfullscreen', handleWebkitEnd);
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [src, poster, shouldAutoPlay, initialTime, handleTriggerControls, sourceDrawerOpen, episodeDrawerOpen]);

  return (
    <div
      ref={wrapperRef}
      onMouseMove={handleTriggerControls}
      onMouseLeave={() => {
        if (!sourceDrawerOpen && !episodeDrawerOpen) {
          setShowControlsOverlay(false);
        }
      }}
      onPointerDown={(e) => {
        // 如果处于锁屏状态，拦截一切长按与手势，仅唤起解锁按钮
        if (isScreenLocked) {
          handleTriggerControls();
          return;
        }

        // 忽略交互性控件（按钮、选集抽屉、控制条等）
        const target = e.target as HTMLElement;
        if (target.closest('button, a, input, select, .in-player-drawer, .xgplayer-controls, .xg-top-bar, .xgplayer-playbackrate')) {
          return;
        }
        // 仅处理鼠标左键或单点触控
        if (e.button !== 0 && e.pointerType === 'mouse') return;

        if (pointerPressTimerRef.current) clearTimeout(pointerPressTimerRef.current);
        pointerPressTimerRef.current = setTimeout(() => {
          startFastForward();
        }, 260);
      }}
      onPointerUp={() => {
        if (pointerPressTimerRef.current) {
          clearTimeout(pointerPressTimerRef.current);
          pointerPressTimerRef.current = null;
        }
        if (isFastForwardingRef.current) {
          stopFastForward();
        }
      }}
      onPointerCancel={() => {
        if (pointerPressTimerRef.current) {
          clearTimeout(pointerPressTimerRef.current);
          pointerPressTimerRef.current = null;
        }
        if (isFastForwardingRef.current) {
          stopFastForward();
        }
      }}
      className={`relative bg-black select-none ${
        isIPhoneCustomFullscreen
          ? 'overflow-hidden'
          : isFullActive
          ? 'fixed inset-0 z-50 w-screen h-screen rounded-none'
          : 'w-full aspect-video rounded-none sm:rounded-2xl overflow-hidden'
      }`}
      style={isIPhoneCustomFullscreen ? iPhoneFullscreenStyle : undefined}
    >
      {/* XGPlayer DOM 挂载容器 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 5.0x 极速快进高保真居中动态胶囊 (严格恪守防黑屏铁律: 纯色底色不使用 backdrop-filter) */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none transition-all duration-200 select-none ${
          isFastForwarding && !isScreenLocked ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-3.5 px-6 py-3 rounded-full bg-[#141416]/95 border border-amber-500/50 shadow-2xl text-amber-300">
          <div className="flex items-center text-amber-400 animate-pulse">
            <Zap className="w-5 h-5 fill-amber-400" />
            <FastForward className="w-5 h-5 ml-0.5 fill-amber-400" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black font-mono tracking-tight text-white drop-shadow">5.0x</span>
              <span className="text-xs font-bold text-amber-300">极速快进中</span>
            </div>
            <span className="text-[10px] text-slate-300/70 tracking-wider">松开按键恢复原速播放</span>
          </div>
        </div>
      </div>

      {/* 轻量级操作反馈 Toast (无任何 backdrop-blur，恪守显卡安全规范) */}
      <div
        className={`absolute top-14 left-1/2 -translate-x-1/2 z-50 pointer-events-none transition-all duration-200 select-none ${
          toastMessage ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div className="px-4 py-1.5 rounded-full bg-[#141416]/95 border border-white/20 text-white text-xs font-medium shadow-2xl flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      </div>

      {/* 左侧垂直居中悬浮：防误触「锁屏」按钮 (对齐移动端专业影院图一) */}
      {isFullActive && (
        <div
          className={`absolute left-[max(1rem,env(safe-area-inset-left))] top-1/2 -translate-y-1/2 z-40 transition-opacity duration-300 pointer-events-auto ${
            showLockButton || isScreenLocked ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleToggleLock}
            className={`p-3 rounded-full border transition-all shadow-2xl flex items-center justify-center ${
              isScreenLocked
                ? 'bg-amber-500 text-black border-amber-400 scale-110 shadow-amber-500/40 animate-pulse'
                : 'bg-black/60 hover:bg-black/80 text-white/90 border-white/20 hover:scale-105 active:scale-95'
            }`}
            title={isScreenLocked ? '点击解锁屏幕' : '锁定屏幕防止误触'}
          >
            {isScreenLocked ? (
              <Lock className="w-5 h-5 stroke-[2.5]" />
            ) : (
              <Unlock className="w-5 h-5 stroke-[2]" />
            )}
          </button>
        </div>
      )}

      {/* 右侧纵向快捷跳片头/片尾按钮 (对齐移动端专业影院图二) */}
      {isFullActive && (
        <div
          className={`absolute right-[max(1rem,env(safe-area-inset-right))] top-1/2 -translate-y-1/2 z-40 flex flex-col gap-3 transition-opacity duration-300 pointer-events-auto ${
            showControlsOverlay && !isScreenLocked ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={handleSkipForward15}
            className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 text-white transition-all hover:scale-105 shadow-xl active:scale-95"
            title="快进 15 秒"
          >
            <RotateCw className="w-4 h-4 text-amber-300" />
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5 text-white/90">15s</span>
          </button>
          <button
            type="button"
            onClick={handleSkipBackward15}
            className="flex flex-col items-center justify-center w-11 h-11 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 text-white transition-all hover:scale-105 shadow-xl active:scale-95"
            title="快退 15 秒"
          >
            <RotateCcw className="w-4 h-4 text-amber-300" />
            <span className="text-[9px] font-mono font-bold leading-none mt-0.5 text-white/90">15s</span>
          </button>
        </div>
      )}

      {/* 顶部通栏自定义覆盖层 (仅在全屏沉浸模式下展示：退出全屏、剧名、电量、系统时间、选集与切源) */}
      {isFullActive && (
        <div
          className={`absolute top-0 inset-x-0 z-30 flex items-center justify-between p-3.5 sm:p-4 pl-[max(0.875rem,env(safe-area-inset-left))] pr-[max(0.875rem,env(safe-area-inset-right))] pt-[max(0.875rem,env(safe-area-inset-top))] bg-gradient-to-b from-black/85 via-black/45 to-transparent transition-opacity duration-300 pointer-events-none ${
            showControlsOverlay && !isScreenLocked ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          {/* 左侧：退出全屏返回键与影视信息 */}
          <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto">
            <button
              onClick={handleBackAction}
              className="p-2 rounded-full bg-black/50 hover:bg-white/20 text-white transition-colors border border-white/10 active:scale-95"
              title="退出全屏"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white drop-shadow truncate max-w-[180px] sm:max-w-md">
                  {videoTitle}
                </h2>
                {isShadowLineSource && (
                  <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500/30 to-indigo-500/30 border border-purple-500/40 text-purple-200 shadow-sm animate-pulse">
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

          {/* 右侧：系统时间、电池电量、投屏、换源与选集 */}
          <div className="flex items-center gap-2 sm:gap-2.5 pointer-events-auto">
            {/* 实时时间 (移动端专业状态栏) */}
            {systemTime && (
              <span className="text-xs font-mono font-semibold text-white/90 drop-shadow px-1.5 hidden xs:inline-block">
                {systemTime}
              </span>
            )}

            {/* 实时电量胶囊 */}
            {batteryLevel !== null && (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 border border-white/15 text-[11px] font-mono text-white/90 drop-shadow">
                {isCharging ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                ) : (
                  <Battery className="w-3.5 h-3.5 text-white/80" />
                )}
                <span>{batteryLevel}%</span>
              </div>
            )}

            {/* 投屏 (TV) 按钮 */}
            <button
              onClick={handleAirPlay}
              className="p-1.5 rounded-lg bg-black/50 hover:bg-white/15 text-white text-xs flex items-center justify-center border border-white/15 transition-all hover:scale-105 active:scale-95"
              title="投屏播放"
            >
              <Tv className="w-4 h-4 text-emerald-400" />
            </button>

            {/* 换源抽屉 */}
            {sources.length > 0 && (
              <button
                onClick={() => setSourceDrawerOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-black/50 hover:bg-white/15 text-white text-xs flex items-center gap-1.5 border border-white/15 transition-all hover:scale-105 active:scale-95"
              >
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">换源</span>
                {currentSource && (
                  <span className="text-[10px] text-slate-400 font-mono hidden md:inline">({currentSource})</span>
                )}
              </button>
            )}

            {/* 选集抽屉 */}
            {episodes.length > 1 && (
              <button
                onClick={() => setEpisodeDrawerOpen(true)}
                className="px-2.5 py-1.5 rounded-lg bg-black/50 hover:bg-white/15 text-white text-xs flex items-center gap-1.5 border border-white/15 transition-all hover:scale-105 active:scale-95"
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
      )}

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
