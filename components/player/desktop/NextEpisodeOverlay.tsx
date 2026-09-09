'use client';

import React, { useState, useEffect } from 'react';
import { Play, X, FastForward } from 'lucide-react';

interface NextEpisodeOverlayProps {
  visible: boolean;
  nextEpisodeName: string;
  nextEpisodeIndex: number;
  onPlayNext: () => void;
  onCancel: () => void;
  autoPlayDelaySeconds?: number;
}

export function NextEpisodeOverlay({
  visible,
  nextEpisodeName,
  nextEpisodeIndex,
  onPlayNext,
  onCancel,
  autoPlayDelaySeconds = 5,
}: NextEpisodeOverlayProps) {
  const [secondsRemaining, setSecondsRemaining] = useState(autoPlayDelaySeconds);

  useEffect(() => {
    if (!visible) {
      setSecondsRemaining(autoPlayDelaySeconds);
      return;
    }

    setSecondsRemaining(autoPlayDelaySeconds);

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onPlayNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [visible, autoPlayDelaySeconds, onPlayNext]);

  if (!visible) return null;

  // 计算倒计时进度 (0 - 100)
  const progressPercent = ((autoPlayDelaySeconds - secondsRemaining) / autoPlayDelaySeconds) * 100;
  const strokeDashoffset = 100 - progressPercent;

  return (
    <div
      className="absolute bottom-20 right-6 z-40 max-w-sm pointer-events-auto select-none"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="relative overflow-hidden rounded-2xl bg-black/90 backdrop-blur-2xl border border-white/20 p-4 shadow-[0_12px_40px_rgba(0,0,0,0.85)] text-white flex flex-col gap-3">
        {/* 顶部标签与取消按钮 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-bold text-red-500 tracking-wider uppercase">
            <FastForward size={14} className="animate-pulse" />
            <span>即将播放下一集</span>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-full bg-white/10 hover:bg-white/20 text-white/60 hover:text-white transition-colors cursor-pointer"
            title="取消自动播放"
          >
            <X size={14} />
          </button>
        </div>

        {/* 剧集信息 */}
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white/95 truncate">
            {nextEpisodeName || `第 ${nextEpisodeIndex + 1} 集`}
          </h4>
          <p className="text-xs text-white/50">
            {secondsRemaining > 0 ? `${secondsRemaining} 秒后自动连播` : '正在切换...'}
          </p>
        </div>

        {/* 倒计时进度条 */}
        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-red-600 transition-all duration-1000 ease-linear rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* 动作按钮 */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onPlayNext}
            className="flex-1 py-2 px-4 rounded-xl bg-white text-black font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-white/90 active:scale-95 transition-all shadow-md cursor-pointer"
          >
            <Play size={14} className="fill-black" />
            <span>立即播放</span>
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white font-medium text-xs transition-colors cursor-pointer"
          >
            取消
          </button>
        </div>
      </div>
    </div>
  );
}
