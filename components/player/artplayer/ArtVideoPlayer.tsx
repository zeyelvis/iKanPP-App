'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import ReactDOM from 'react-dom';
import Artplayer from 'artplayer';
import Hls from 'hls.js';
import { createHlsConfig } from '@/lib/player/hls-config-factory';
import { InPlayerEpisodesDrawer } from '../desktop/InPlayerEpisodesDrawer';
import { InPlayerSourceDrawer } from '../desktop/InPlayerSourceDrawer';
import { ChevronLeft } from 'lucide-react';
import { useHistoryStore, usePremiumHistoryStore } from '@/lib/store/history-store';
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
}: ArtVideoPlayerProps & { initialTime?: number; shouldAutoPlay?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<Artplayer | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  // 状态抽屉管理
  const [isEpisodesDrawerOpen, setIsEpisodesDrawerOpen] = useState(false);
  const [isSourceDrawerOpen, setIsSourceDrawerOpen] = useState(false);
  const [showControls, setShowControls] = useState(true);

  // 保存进度历史专用 selector，严格杜绝全量订阅导致的 5 秒重渲染瀑布
  const addToHistory = isPremium
    ? usePremiumHistoryStore((s) => s.addToHistory)
    : useHistoryStore((s) => s.addToHistory);

  const { adFilterMode, adKeywords } = usePlayerSettings(isPremium);

  // Ref 稳定引用，供底层事件闭包调用
  const onPlaybackErrorRef = useRef(onPlaybackError);
  onPlaybackErrorRef.current = onPlaybackError;
  const onNextEpisodeRef = useRef(onNextEpisode);
  onNextEpisodeRef.current = onNextEpisode;
  const onResolutionDetectedRef = useRef(onResolutionDetected);
  onResolutionDetectedRef.current = onResolutionDetected;

  // 记录上次保存时间，防抖 5 秒保存
  const lastSaveTimeRef = useRef<number>(0);

  // 播放 M3U8 的核心定制逻辑 (100% 继承双轨直连/反代与 120s 缓冲区深水库)
  const playM3u8 = useCallback((video: HTMLVideoElement, url: string, art: Artplayer) => {
    if (Hls.isSupported()) {
      if ((art as any).hls) {
        (art as any).hls.destroy();
      }

      const isMobile = Artplayer.utils.isMobile;

      const config = createHlsConfig({
        isMobileClient: isMobile,
        isAdFilterEnabled: true,
        filterM3u8Ad,
        adFilterMode,
        adKeywords,
      });

      const hls = new Hls(config);
      hls.loadSource(url);
      hls.attachMedia(video);
      art.hls = hls;

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        if (initialTime && initialTime > 0) {
          video.currentTime = initialTime;
        }
        if (shouldAutoPlay && video.paused) {
          art.play().catch(() => {});
        }
      });

      hls.on(Hls.Events.LEVEL_LOADED, (_event, data) => {
        if (data.details?.totalduration && art.duration !== data.details.totalduration) {
          // 更新总时长
        }
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (data.fatal) {
          console.warn('[Artplayer HLS] 遇到致命网络/解码错误:', data.type, data.details);
          if (onPlaybackErrorRef.current) {
            const shouldRetry = onPlaybackErrorRef.current(data.details || 'HLS Fatal Error');
            if (shouldRetry === false) {
              art.notice.show = '播放失败，正在自动切源中...';
            }
          }
        }
      });

      art.on('destroy', () => {
        hls.destroy();
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // 苹果原生 Safari / iOS AVPlayer 硬件加速
      video.src = url;
      if (initialTime && initialTime > 0) {
        video.currentTime = initialTime;
      }
      if (shouldAutoPlay && video.paused) {
        art.play().catch(() => {});
      }
    } else {
      art.notice.show = '当前浏览器环境暂不支持播放此视频流';
    }
  }, [adFilterMode, adKeywords, initialTime, shouldAutoPlay]);

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
        tooltip: '选择集数',
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
        tooltip: '切换专线源站',
        click: function () {
          setIsSourceDrawerOpen((prev) => !prev);
          setIsEpisodesDrawerOpen(false);
        },
      });
    }

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
      autoplay: shouldAutoPlay,
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
      moreVideoAttr: {
        playsInline: true,
      } as any,
      controls: customControls,
      icons: {
        loading: '<div class="spinner" style="width:40px;height:40px;border-width:3px;"></div>',
      },
    });

    artRef.current = art;
    setPortalTarget(art.template.$player);

    // 事件监听：播放器时间更新
    art.on('video:timeupdate', () => {
      const cur = art.currentTime;
      const dur = art.duration;
      if (externalTimeRef) {
        externalTimeRef.current = cur;
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
      if (video && video.videoWidth && video.videoHeight && onResolutionDetectedRef.current) {
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
        onResolutionDetectedRef.current({
          width: w,
          height: h,
          label,
          color,
        });
      }
    });

    // 清理实例
    return () => {
      if (artRef.current) {
        artRef.current.destroy(false);
        artRef.current = null;
      }
    };
  }, [playM3u8]);

  // 当 playUrl 变动时，平滑切流而非销毁播放器实例
  useEffect(() => {
    if (artRef.current && playUrl) {
      if (artRef.current.url !== playUrl) {
        artRef.current.switchUrl(playUrl).catch(() => {
          artRef.current?.play().catch(() => {});
        });
      }
    }
  }, [playUrl]);

  return (
    <div className="relative w-full h-full aspect-video bg-black rounded-none sm:rounded-2xl overflow-hidden group">
      {/* Artplayer 挂载根容器 */}
      <div ref={containerRef} className="w-full h-full" />

      {/* 通过 React Portal 直接挂载进全屏 DOM 根节点，绝不受全屏样式阻断 */}
      {portalTarget &&
        ReactDOM.createPortal(
          <>
            {/* 1. 左上角快捷返回胶囊 */}
            {onBack && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBack();
                }}
                className={`absolute top-4 left-4 z-40 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#141416]/85 hover:bg-black/95 border border-white/20 text-white/90 hover:text-white transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95 text-xs font-bold ${
                  showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                }`}
                title={isPremium ? '返回午夜专区' : '返回'}
              >
                <ChevronLeft size={16} />
                <span>{isPremium ? '午夜版' : '返回'}</span>
              </button>
            )}

            {/* 2. 右上角品牌 4K VIP 台标 / Jable 防盗链遮罩 */}
            <div
              className={`absolute top-4 right-4 z-30 pointer-events-none transition-opacity duration-300 ${
                showControls ? 'opacity-90' : 'opacity-40'
              }`}
            >
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141416]/90 border border-white/20 shadow-lg">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-[11px] font-black tracking-wider text-white">
                  {isPremium ? 'iKanX 4K VIP' : 'iKanPP 4K'}
                </span>
              </div>
            </div>

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

            {/* 5. 专线检索与连接状态指示 (纯色无模糊，防显卡黑屏) */}
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
