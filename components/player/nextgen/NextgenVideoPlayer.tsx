'use client';

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Events, type SimplePlayer } from 'xgplayer';

import './nextgen-player.css';

import { type XgVideoPlayerProps } from '../xg/XgVideoPlayer';
import { createPlayer, detectIsMobileClient, type HlsSource } from './plugins';
import { BrandBadge } from './BrandBadge';
import { COVER, watermarkCover } from './watermark';

import { InPlayerSourceDrawer } from '../desktop/InPlayerSourceDrawer';
import { InPlayerEpisodesDrawer } from '../desktop/InPlayerEpisodesDrawer';
import { NextEpisodeOverlay } from '../desktop/NextEpisodeOverlay';
import { PlayerBrandLogo } from '../PlayerBrandLogo';

import { sanitizeStreamUrl } from '@/lib/utils/stream-sanitizer';
import { usePlayerSettings } from '../hooks/usePlayerSettings';
import { filterM3u8Ad } from '@/lib/utils/m3u8-utils';

const RATES = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;
const AUTONEXT_SECONDS = 5;
const HOLD_MS = 300;
const HOLD_RATE = 5;

const FIT_PROPS = ['top', 'left', 'right', 'bottom', 'width', 'height', 'transform', 'transform-origin'] as const;

/**
 * iPhone 网页旋转全屏尺寸校准 (Viewport Fit for iPhone rotateFullscreen)
 * 严格遵从准则 14 铁律：只读取 window.innerWidth / innerHeight，严禁读取 DOM 元素排版尺寸或计算样式
 */
function fitPhoneFullscreen(root: HTMLElement) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const upright = h > w;
  const set = (prop: (typeof FIT_PROPS)[number], value: string) => root.style.setProperty(prop, value, 'important');
  set('top', '0px');
  set('right', 'auto');
  set('bottom', 'auto');
  set('left', upright ? `${w}px` : '0px');
  set('width', `${upright ? h : w}px`);
  set('height', `${upright ? w : h}px`);
  set('transform-origin', 'top left');
  set('transform', upright ? 'rotate(90deg)' : 'none');
}

function clearPhoneFullscreen(root: HTMLElement) {
  for (const prop of FIT_PROPS) root.style.removeProperty(prop);
  root.style.width = '100%';
  root.style.height = '100%';
}

/**
 * iKanPP 播放器「新一代内核 (nextgen)」工业级组件
 * 对外完全兼容 XgVideoPlayerProps 契约，内部采用模块化解耦插件与单一真理源配置
 */
export const NextgenVideoPlayer = React.memo(function NextgenVideoPlayer(props: XgVideoPlayerProps) {
  const {
    src,
    poster,
    onError,
    onTimeUpdate,
    initialTime = 0,
    shouldAutoPlay = true,
    totalEpisodes = 1,
    currentEpisodeIndex = 0,
    onNextEpisode,
    isReversed = false,
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
  } = props;

  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<SimplePlayer | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const initialSeekDone = useRef(false);

  // 播放器内部覆盖图层：挂载在 xgplayer root 节点内，确保系统或网页全屏时抽屉正常显示
  const [layer, setLayer] = useState<HTMLElement | null>(null);
  const [badge, setBadge] = useState<HTMLElement | null>(null);

  // 抽屉与悬浮状态
  const [showEpisodesDrawer, setShowEpisodesDrawer] = useState(false);
  const [showSourceDrawer, setShowSourceDrawer] = useState(false);
  const [showNextOverlay, setShowNextOverlay] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 存储隔离：主站与午夜特区严格分库存储倍速偏好
  const rateKey = isPremium ? 'ng-rate-premium' : 'ng-rate';
  const [rate, setRate] = useState<number>(() => {
    if (typeof window === 'undefined') return 1;
    try {
      const saved = parseFloat(localStorage.getItem(rateKey) || '1');
      return (RATES as readonly number[]).includes(saved) ? saved : 1;
    } catch {
      return 1;
    }
  });

  // 广告过滤与播放设置（通过统一的 usePlayerSettings 快照获取）
  const playerSettings = usePlayerSettings(isPremium);

  // 上下集状态
  const hasPrev = currentEpisodeIndex > 0;
  const hasNext = currentEpisodeIndex + 1 < totalEpisodes;

  const nextEpisodeName = useMemo(() => {
    if (!hasNext || !episodes || episodes.length === 0) return '';
    const nextIdx = currentEpisodeIndex + 1;
    return episodes[nextIdx]?.name || `第 ${nextIdx + 1} 集`;
  }, [hasNext, episodes, currentEpisodeIndex]);

  const loadStartTimeRef = useRef(0);
  const reportedBeaconRef = useRef(false);

  const reportBeacon = useCallback((ok: boolean) => {
    if (isPremium || !currentSource || reportedBeaconRef.current) return;
    reportedBeaconRef.current = true;
    const ms = Math.round(performance.now() - (loadStartTimeRef.current || performance.now()));
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      try {
        navigator.sendBeacon('/api/beacon/play', JSON.stringify({ source: currentSource, ok, ms }));
      } catch {}
    }
  }, [isPremium, currentSource]);

  // 回调引用缓存，防止频繁闭包重建
  const onErrorRef = useRef(onError);
  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const onNextEpisodeRef = useRef(onNextEpisode);
  useEffect(() => {
    onNextEpisodeRef.current = onNextEpisode;
  }, [onNextEpisode]);

  const onResolutionDetectedRef = useRef(onResolutionDetected);
  useEffect(() => {
    onResolutionDetectedRef.current = onResolutionDetected;
  }, [onResolutionDetected]);

  // 1. 播放器实例初始化（挂载时仅创建一次）
  useEffect(() => {
    const hostEl = hostRef.current;
    if (!hostEl) return;

    // 清理可能存在的旧节点
    hostEl.innerHTML = '';

    const cleanUrl = sanitizeStreamUrl(src);
    const isMobileClient = detectIsMobileClient();

    const player = createPlayer({
      el: hostEl,
      url: cleanUrl,
      poster: poster || undefined,
      rate,
      rates: RATES,
      hlsOptions: {
        isMobileClient,
        isAdFilterEnabled: playerSettings.adFilterMode !== 'off',
        filterM3u8Ad,
        adFilterMode: playerSettings.adFilterMode,
        adKeywords: playerSettings.adKeywords,
      },
      onFatal: (details) => {
        onErrorRef.current?.(details);
      },
      onPrev: () => {
        if (currentEpisodeIndex > 0) {
          onSelectEpisode?.(currentEpisodeIndex - 1);
        }
      },
      onNext: () => {
        onNextEpisodeRef.current?.();
      },
      onEpisodes: () => {
        setShowEpisodesDrawer(true);
      },
    });

    playerRef.current = player;
    const media = player.media as HTMLVideoElement;
    videoRef.current = media;

    // 全屏下视频标签行内样式严格声明 transform: 'none' (遵从准则 14)
    if (media) {
      media.style.transform = 'none';
      media.style.webkitTransform = 'none';
    }

    // 在 xgplayer root 节点内创建用于挂载抽屉的 React Portal 图层
    const root = player.root;
    if (root) {
      const layerEl = document.createElement('div');
      layerEl.className = 'ng-layer';
      root.appendChild(layerEl);
      setLayer(layerEl);

      const badgeEl = document.createElement('div');
      badgeEl.className = 'ng-badge';
      badgeEl.hidden = true;
      root.appendChild(badgeEl);
      setBadge(badgeEl);
    }

    const onFullscreenChange = (full: boolean) => {
      setIsFullscreen(full);
      if (!full) {
        setShowEpisodesDrawer(false);
        setShowSourceDrawer(false);
      }
    };
    player.on(Events.FULLSCREEN_CHANGE, onFullscreenChange);

    return () => {
      player.destroy();
      playerRef.current = null;
      videoRef.current = null;
      setLayer(null);
      setBadge(null);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2. 媒体源切换（换线路或换集：只调用 load()，绝不销毁重建播放器）
  useEffect(() => {
    const player = playerRef.current;
    const video = videoRef.current;
    if (!player || !video || !src) return;

    initialSeekDone.current = false;
    setShowNextOverlay(false);
    loadStartTimeRef.current = performance.now();
    reportedBeaconRef.current = false;

    const cleanUrl = sanitizeStreamUrl(src);

    const onFirstFrame = () => {
      reportBeacon(true);
    };

    video.addEventListener('loadeddata', onFirstFrame, { once: true });
    video.addEventListener('playing', onFirstFrame, { once: true });

    const onLoadedMetadata = () => {
      if (!initialSeekDone.current && initialTime > 0) {
        initialSeekDone.current = true;
        video.currentTime = initialTime;
      }
      if (shouldAutoPlay) {
        void Promise.resolve(player.play()).catch(() => {
          // 浏览器阻止自动播放属于预期策略，保留中心播放按钮供用户手动点击
        });
      }
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });

    const source = player.getPlugin('ngSource') as HlsSource | null;
    void source?.load(cleanUrl).then((mode) => {
      if (mode === 'unsupported') {
        reportBeacon(false);
        onErrorRef.current?.('unsupported-hls');
      }
      if (mode === 'native' && shouldAutoPlay) {
        void Promise.resolve(player.play()).catch(() => undefined);
      }
    });

    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('loadeddata', onFirstFrame);
      video.removeEventListener('playing', onFirstFrame);
    };
  }, [src, initialTime, shouldAutoPlay, reportBeacon]);

  // 3. 原生 HLS (Safari) 的底层 <video> error 兜底监听
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onNativeError = () => {
      const source = playerRef.current?.getPlugin('ngSource') as HlsSource | null;
      if (source?.usingHls) return;
      reportBeacon(false);
      onErrorRef.current?.('media-error');
    };
    video.addEventListener('error', onNativeError);
    return () => video.removeEventListener('error', onNativeError);
  }, [reportBeacon]);

  // 4. 播放进度与分辨率事件监听
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      onTimeUpdate?.(video.currentTime, video.duration || 0);
    };

    const handleEnded = () => {
      if (hasNext) {
        setShowNextOverlay(true);
      }
    };

    const checkResolution = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0) {
        const h = Math.max(video.videoWidth, video.videoHeight) === video.videoWidth ? video.videoHeight : video.videoWidth;
        const label = h >= 2160 ? '4K' : h >= 1440 ? '2K' : h >= 1080 ? '1080P' : h >= 720 ? '720P' : h >= 480 ? '480P' : `${h}P`;
        const color = h >= 2160 ? 'bg-amber-500' : h >= 1440 ? 'bg-emerald-500' : h >= 1080 ? 'bg-green-500' : 'bg-gray-500';
        onResolutionDetectedRef.current?.({
          width: video.videoWidth,
          height: video.videoHeight,
          label,
          color,
        });
      }
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    video.addEventListener('loadedmetadata', checkResolution);
    video.addEventListener('resize', checkResolution);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      video.removeEventListener('loadedmetadata', checkResolution);
      video.removeEventListener('resize', checkResolution);
    };
  }, [onTimeUpdate, hasNext]);

  // 5. 倍速状态持久化
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const handleRateChange = () => {
      const currentRate = video.playbackRate;
      if ((RATES as readonly number[]).includes(currentRate)) {
        setRate(currentRate);
        try {
          localStorage.setItem(rateKey, String(currentRate));
        } catch {}
      }
    };
    video.addEventListener('ratechange', handleRateChange);
    return () => video.removeEventListener('ratechange', handleRateChange);
  }, [rateKey]);

  // 6. 专线右上角品牌覆盖角标 (Watermark Cover Placement)
  const isShadowLine = currentSource === 'shadowline';
  const shouldShowBadge = isShadowLine && !isPremium;

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !badge) return;

    if (!shouldShowBadge) {
      badge.hidden = true;
      return;
    }

    let box = { width: 0, height: 0 };
    const place = () => {
      const cover = watermarkCover(box, { width: video.videoWidth, height: video.videoHeight });
      badge.hidden = !cover;
      if (!cover) return;
      badge.style.right = `${cover.right}px`;
      badge.style.top = `${cover.top}px`;
      badge.style.width = `${COVER.width * cover.scale}px`;
      badge.style.height = `${COVER.height * cover.scale}px`;
    };

    const observer = new ResizeObserver(([entry]) => {
      box = { width: entry.contentRect.width, height: entry.contentRect.height };
      place();
    });
    observer.observe(video);

    const events = ['loadedmetadata', 'resize', 'emptied'] as const;
    events.forEach((e) => video.addEventListener(e, place));

    return () => {
      observer.disconnect();
      events.forEach((e) => video.removeEventListener(e, place));
      badge.hidden = true;
    };
  }, [badge, shouldShowBadge]);

  // 7. 画面冻结看门狗 (Frozen Picture Watchdog)
  // 严格遵守准则 2 之决策 D3 明确例外：仅在声音在走且时钟前进但连续 2 秒无画面新帧时原地重置，不向前拨动时间轴
  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof video.getVideoPlaybackQuality !== 'function') return;

    let frames = video.getVideoPlaybackQuality().totalVideoFrames;
    let clock = video.currentTime;
    let frozenFor = 0;
    let fixes = 0;
    let lastFix = 0;

    const timer = window.setInterval(() => {
      const nowFrames = video.getVideoPlaybackQuality().totalVideoFrames;
      const advanced = video.currentTime - clock;
      const decoding = nowFrames !== frames;
      frames = nowFrames;
      clock = video.currentTime;

      const elsewhere =
        document.pictureInPictureElement === video ||
        (video as HTMLVideoElement & { webkitCurrentPlaybackTargetIsWireless?: boolean })
          .webkitCurrentPlaybackTargetIsWireless === true;
      const watching =
        document.visibilityState === 'visible' &&
        !video.paused &&
        !video.seeking &&
        video.readyState >= 3 &&
        video.videoWidth > 0 &&
        !elsewhere;

      frozenFor = watching && !decoding && advanced > 0.3 ? frozenFor + 1 : 0;
      if (frozenFor >= 2 && fixes < 3 && Date.now() - lastFix > 10_000) {
        fixes++;
        lastFix = Date.now();
        frozenFor = 0;
        // 原地重定位唤醒解码管线（准则 2 决策 D3 明确例外，严禁强行拨快时间轴）
        video.currentTime = video.currentTime;
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [src]);

  // 8. 标题栏联动
  const titleBarText = useMemo(() => {
    return [videoTitle, episodeName].filter(Boolean).join(' ');
  }, [videoTitle, episodeName]);

  useEffect(() => {
    const titlePlugin = playerRef.current?.getPlugin('ngTitle') as { setTitle: (t: string) => void } | null;
    titlePlugin?.setTitle(titleBarText);
  }, [titleBarText, layer]);

  // 9. 系统 Media Session (锁屏控制、通知中心与灵动岛)
  useEffect(() => {
    if (!layer || typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    const session = navigator.mediaSession;

    const artwork = poster
      ? [
          {
            src: poster.startsWith('http') ? poster : new URL(poster, window.location.href).href,
            sizes: '342x513',
            type: 'image/jpeg',
          },
        ]
      : [];

    session.metadata = new MediaMetadata({
      title: titleBarText || 'iKanPP 视频播放',
      artist: isPremium ? 'iKanX' : 'iKanPP',
      artwork,
    });

    const set = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
      try {
        session.setActionHandler(action, handler);
      } catch {}
    };

    const skip = (seconds: number) => {
      const video = videoRef.current;
      if (video) video.currentTime = Math.max(0, Math.min(video.duration || Infinity, video.currentTime + seconds));
    };

    set('play', () => void Promise.resolve(playerRef.current?.play()).catch(() => undefined));
    set('pause', () => playerRef.current?.pause());
    set('seekbackward', (d) => skip(-(d.seekOffset ?? 10)));
    set('seekforward', (d) => skip(d.seekOffset ?? 10));
    set('previoustrack', hasPrev ? () => onSelectEpisode?.(currentEpisodeIndex - 1) : null);
    set('nexttrack', hasNext ? () => onNextEpisodeRef.current?.() : null);

    return () => {
      for (const action of ['play', 'pause', 'seekbackward', 'seekforward', 'previoustrack', 'nexttrack'] as const) {
        set(action, null);
      }
      session.metadata = null;
    };
  }, [layer, titleBarText, poster, isPremium, hasPrev, hasNext, currentEpisodeIndex, onSelectEpisode]);

  // 10. iPhone 网页全屏旋转尺寸校准 (准则 14 决策 D1)
  useEffect(() => {
    const root = playerRef.current?.root;
    if (!isFullscreen || !root?.classList.contains('xgplayer-rotate-fullscreen')) return;

    document.documentElement.classList.add('ng-player-full');
    const scrollY = window.scrollY;
    let settle = 0;

    const fit = () => {
      window.scrollTo(0, 0);
      fitPhoneFullscreen(root);
    };

    const onResize = () => {
      fit();
      window.clearTimeout(settle);
      settle = window.setTimeout(fit, 350);
    };

    fit();
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    window.visualViewport?.addEventListener('resize', onResize);

    return () => {
      window.clearTimeout(settle);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('orientationchange', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      clearPhoneFullscreen(root);
      document.documentElement.classList.remove('ng-player-full');
      window.scrollTo(0, scrollY);
    };
  }, [isFullscreen]);

  // 11. 快捷键与按住 → 键临时 5 倍速
  useEffect(() => {
    let timer: number | null = null;
    let heldFrom: number | null = null;

    const typing = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      return Boolean(target && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)));
    };

    const release = () => {
      if (timer !== null) window.clearTimeout(timer);
      timer = null;
      const video = videoRef.current;
      if (heldFrom !== null && video) {
        video.playbackRate = heldFrom;
      }
      heldFrom = null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (typing(e) || e.metaKey || e.ctrlKey || e.altKey) return;
      const player = playerRef.current;
      const video = videoRef.current;
      if (!player || !video) return;

      // 按住 → 键加速
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        if (e.repeat || timer !== null || heldFrom !== null) return;
        timer = window.setTimeout(() => {
          timer = null;
          heldFrom = video.playbackRate;
          video.playbackRate = HOLD_RATE;
        }, HOLD_MS);
        return;
      }

      // 其他常规快捷键
      if (e.key === 'k') {
        if (video.paused) void Promise.resolve(player.play()).catch(() => undefined);
        else player.pause();
      } else if (e.key === 'f') {
        if (player.fullscreen) void player.exitFullscreen();
        else void player.getFullscreen();
      } else if (e.key === 'n' && hasNext) {
        onNextEpisodeRef.current?.();
      } else if (e.key === '>' || e.key === '<') {
        e.preventDefault();
        const curIdx = RATES.indexOf(rate as any);
        const nextIdx = e.key === '>' ? Math.min(RATES.length - 1, curIdx + 1) : Math.max(0, curIdx - 1);
        const nextRate = RATES[nextIdx];
        video.playbackRate = nextRate;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight') return;
      const video = videoRef.current;
      if (timer !== null && video) {
        // 短按快进 10 秒
        video.currentTime = Math.min(video.duration || Infinity, video.currentTime + 10);
      }
      release();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', release);

    return () => {
      release();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', release);
    };
  }, [rate, hasNext]);

  return (
    <div className="relative w-full aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden select-none group">
      {/* xgplayer DOM 挂载宿主 */}
      <div ref={hostRef} className="w-full h-full" />

      {/* 专线右上角品牌覆盖角标渲染 */}
      {badge && shouldShowBadge && createPortal(<BrandBadge />, badge)}

      {/* 午夜特区台标消融 */}
      {isPremium && (
        <PlayerBrandLogo
          videoRef={videoRef}
          containerRef={hostRef}
          isPremium={isPremium}
        />
      )}

      {/* 全屏内部覆盖层图层 (通过 React Portal 渲染到 xgplayer 根容器内) */}
      {layer &&
        createPortal(
          <>
            {/* 倒计时自动播放下一集卡片 */}
            <NextEpisodeOverlay
              visible={showNextOverlay}
              nextEpisodeName={nextEpisodeName}
              nextEpisodeIndex={currentEpisodeIndex + 1}
              autoPlayDelaySeconds={AUTONEXT_SECONDS}
              onPlayNext={() => {
                setShowNextOverlay(false);
                onNextEpisodeRef.current?.();
              }}
              onCancel={() => setShowNextOverlay(false)}
            />

            {/* 快速选集抽屉 */}
            <InPlayerEpisodesDrawer
              isOpen={showEpisodesDrawer}
              onClose={() => setShowEpisodesDrawer(false)}
              episodes={episodes}
              currentEpisode={currentEpisodeIndex}
              onSelectEpisode={(idx) => {
                setShowEpisodesDrawer(false);
                onSelectEpisode?.(idx);
              }}
            />

            {/* 快速换源专线抽屉 */}
            {sources && sources.length > 0 && (
              <InPlayerSourceDrawer
                isOpen={showSourceDrawer}
                onClose={() => setShowSourceDrawer(false)}
                sources={sources}
                currentSource={currentSource}
                onSelectSource={(s) => {
                  setShowSourceDrawer(false);
                  onSelectSource?.(s);
                }}
              />
            )}
          </>,
          layer
        )}
    </div>
  );
});
