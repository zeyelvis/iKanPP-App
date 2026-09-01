'use client';

import { useState, useEffect, useRef } from 'react';
import { AlertCircle, RefreshCw, Maximize, Minimize, List, X } from 'lucide-react';
import type { LiveChannel } from '@/lib/data/live-channels';

interface IPTVPlayerProps {
  channel: LiveChannel;
  channels: LiveChannel[];
  onChannelChange: (channel: LiveChannel) => void;
}

export function IPTVPlayer({ channel, channels, onChannelChange }: IPTVPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // 获取电视频道直播流
  const fetchLiveStream = async (liveId: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/iptv/live?id=${liveId}`);
      const data = await res.json();
      if (data.success && data.embedUrl) {
        setEmbedUrl(data.embedUrl);
      } else {
        setError(data.error || '该频道暂未开通或正在维护中');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '网络请求失败';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (channel?.liveId) {
      fetchLiveStream(channel.liveId);
    }
  }, [channel?.id, channel?.liveId]);

  // 全屏控制
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full min-h-[360px] sm:min-h-[480px] bg-black flex flex-col justify-center items-center select-none overflow-hidden"
    >
      {/* 播放器核心加载区 */}
      {loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md">
          <div className="relative flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-white/10 border-t-red-500 animate-spin" />
            <span className="absolute text-xs font-black text-white/80">LIVE</span>
          </div>
          <p className="mt-4 text-sm font-bold text-white/90">正在接入专用流媒体转播节点...</p>
          <p className="mt-1 text-xs text-white/40">{channel.name} · 海外高速专线</p>
        </div>
      )}

      {/* 错误提示区 */}
      {error && !loading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center p-6 text-center bg-black/95">
          <div className="p-4 rounded-full bg-red-500/10 text-red-400 mb-3 border border-red-500/20">
            <AlertCircle size={32} />
          </div>
          <h3 className="text-base font-bold text-white mb-1">信号源暂时不可用</h3>
          <p className="text-xs text-white/50 max-w-md mb-5">{error}</p>
          <div className="flex gap-3">
            <button
              onClick={() => fetchLiveStream(channel.liveId)}
              className="px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <RefreshCw size={13} />
              重新连接
            </button>
            <button
              onClick={() => {
                const nextCh = channels.find((c) => c.id !== channel.id);
                if (nextCh) onChannelChange(nextCh);
              }}
              className="px-5 py-2 rounded-full bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all cursor-pointer"
            >
              换个频道
            </button>
          </div>
        </div>
      )}

      {/* 实际播放 iframe 嵌入流 */}
      {embedUrl && (
        <iframe
          key={embedUrl}
          src={embedUrl}
          className="w-full h-full border-0 absolute inset-0 z-10"
          allow="autoplay; fullscreen; picture-in-picture"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          title={`${channel.name} 直播`}
        />
      )}

      {/* 顶部悬浮控制条 */}
      <div className="absolute top-0 inset-x-0 z-30 p-3 sm:p-4 bg-linear-to-b from-black/80 via-black/30 to-transparent flex items-center justify-between opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-auto">
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-600 text-white text-[10px] font-black tracking-wider uppercase shadow-lg shadow-red-600/30">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            LIVE
          </span>
          <span className="text-sm sm:text-base font-bold text-white drop-shadow-md">
            {channel.name}
          </span>
          {channel.badge && (
            <span className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/80 border border-white/15">
              {channel.badge}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* 切换频道侧边栏 */}
          <button
            onClick={() => setShowDrawer(!showDrawer)}
            className="p-2 rounded-full bg-black/60 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-md transition-all cursor-pointer"
            title="查看频道列表"
          >
            <List size={16} />
          </button>

          {/* 刷新当前频道 */}
          <button
            onClick={() => fetchLiveStream(channel.liveId)}
            className="p-2 rounded-full bg-black/60 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-md transition-all cursor-pointer"
            title="刷新直播流"
          >
            <RefreshCw size={16} />
          </button>

          {/* 全屏按钮 */}
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-full bg-black/60 hover:bg-white/20 text-white/90 hover:text-white backdrop-blur-md transition-all cursor-pointer"
            title={isFullscreen ? '退出全屏' : '全屏播放'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      {/* 快捷浮动选台抽屉 */}
      {showDrawer && (
        <div className="absolute top-0 right-0 bottom-0 z-40 w-64 bg-black/95 backdrop-blur-xl border-l border-white/10 p-4 flex flex-col animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <span className="text-xs font-bold text-white/70">快速换台</span>
            <button
              onClick={() => setShowDrawer(false)}
              className="p-1 text-white/40 hover:text-white cursor-pointer"
            >
              <X size={14} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto py-2 space-y-1 custom-scrollbar">
            {channels.map((ch) => {
              const isCurrent = ch.id === channel.id;
              return (
                <button
                  key={ch.id}
                  onClick={() => {
                    onChannelChange(ch);
                    setShowDrawer(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-red-600 text-white shadow-md'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="truncate">{ch.name}</span>
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
