'use client';

import React, { useState, useEffect } from 'react';
import { Play, Pause, ChevronUp, X, Sparkles } from 'lucide-react';

interface FloatingMiniPlayerProps {
  videoTitle: string;
  episodeName?: string;
  isPlaying?: boolean;
  onTogglePlay?: () => void;
  onScrollToTop: () => void;
  targetElementId?: string;
}

/**
 * 🌟 iKanPP 视口脱离智能伴随浮动小窗 (Floating Mini Player)
 * 当用户向下滚动浏览演职员表、豆瓣评分或相关推荐时，在右下角优雅浮现，保障视听不中断
 */
export const FloatingMiniPlayer = React.memo(function FloatingMiniPlayer({
  videoTitle,
  episodeName,
  isPlaying = true,
  onTogglePlay,
  onScrollToTop,
  targetElementId = 'main-player-stage',
}: FloatingMiniPlayerProps) {
  const [isOutOfView, setIsOutOfView] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const el = document.getElementById(targetElementId);
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // 当主播放器离开视口超过 85% 时，激活浮动小窗
        setIsOutOfView(!entry.isIntersecting);
      },
      {
        threshold: 0.15,
      }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [targetElementId]);

  if (!isOutOfView || isDismissed) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <div className="flex items-center gap-3.5 px-4 py-3 rounded-2xl bg-[#141416]/95 border border-white/20 shadow-[0_12px_40px_rgba(0,0,0,0.8)] text-white select-none transition-all hover:scale-102">
        {/* 呼吸脉冲指示标 */}
        <div className="relative flex items-center justify-center shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
          <div className="absolute w-5 h-5 rounded-full bg-red-500/30 animate-ping" />
        </div>

        {/* 影视信息 */}
        <div className="flex flex-col min-w-0 max-w-[160px] sm:max-w-[220px]">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-bold truncate text-white">
              {videoTitle}
            </span>
          </div>
          {episodeName && (
            <span className="text-[11px] text-white/60 truncate">
              {episodeName} · 正在播放
            </span>
          )}
        </div>

        {/* 控制按键组 */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-white/10">
          {onTogglePlay && (
            <button
              onClick={onTogglePlay}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-all cursor-pointer active:scale-95"
              title={isPlaying ? '暂停' : '播放'}
            >
              {isPlaying ? <Pause size={14} /> : <Play size={14} className="fill-white" />}
            </button>
          )}

          <button
            onClick={onScrollToTop}
            className="flex items-center gap-1 px-2.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer"
            title="还原至主屏"
          >
            <ChevronUp size={14} />
            <span className="hidden sm:inline">大屏</span>
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-2 rounded-xl text-white/40 hover:text-white transition-all cursor-pointer"
            title="关闭浮动栏"
          >
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});
