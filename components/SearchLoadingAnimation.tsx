'use client';

import { useEffect, useState, useRef } from 'react';

interface SearchLoadingAnimationProps {
  currentSource?: string;
  checkedSources?: number;
  totalSources?: number;
  isPaused?: boolean;
  onComplete?: (checkedSources: number, totalSources: number) => void;
}

export function SearchLoadingAnimation({
  currentSource,
  checkedSources = 0,
  totalSources = 16,
  isPaused = false,
  onComplete,
}: SearchLoadingAnimationProps) {
  const [dots, setDots] = useState('');
  const dotIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const hasCalledComplete = useRef(false);

  const progress = totalSources > 0 ? (checkedSources / totalSources) * 100 : 0;
  const isComplete = progress >= 100;

  useEffect(() => {
    if (isPaused || isComplete) {
      if (dotIntervalRef.current) {
        clearInterval(dotIntervalRef.current);
        dotIntervalRef.current = null;
      }
      return;
    }

    dotIntervalRef.current = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 400);

    return () => {
      if (dotIntervalRef.current) {
        clearInterval(dotIntervalRef.current);
        dotIntervalRef.current = null;
      }
    };
  }, [isPaused, isComplete]);

  useEffect(() => {
    if (isComplete && onComplete && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      const timeout = setTimeout(() => {
        onComplete(checkedSources, totalSources);
      }, 100);
      return () => clearTimeout(timeout);
    }
  }, [isComplete, onComplete, checkedSources, totalSources]);

  return (
    <div className="w-full max-w-xl mx-auto py-6 px-6 bg-[#0A0A0F]/80 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl animate-fade-in relative overflow-hidden">
      {/* 顶部微弱红光环境弥散 */}
      <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-[var(--accent-color)]/20 blur-3xl rounded-full pointer-events-none" />

      {/* 雷达与状态展示 */}
      <div className="flex items-center gap-4 mb-4">
        {/* 中心雷达脉冲 */}
        <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
          <div className="absolute inset-0 rounded-full bg-[var(--accent-color)]/20 animate-radar-ring" />
          <div className="absolute inset-2 rounded-full bg-[var(--accent-color)]/40 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="relative w-8 h-8 rounded-full bg-[var(--accent-color)] flex items-center justify-center text-white shadow-[0_0_15px_rgba(229,9,20,0.6)]">
            <svg className="w-4 h-4 animate-spin-slow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <circle cx="12" cy="12" r="10" strokeDasharray="30 20" />
            </svg>
          </div>
        </div>

        {/* 文字提示与实时源名称 */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-1.5">
              <span>全网多源并发雷达检索中</span>
              <span className="w-4 text-left text-[var(--accent-color)]">{dots}</span>
            </h4>
            <span className="text-xs font-black text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
              {Math.round(progress)}%
            </span>
          </div>

          <p className="text-xs text-white/50 truncate mt-0.5 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {currentSource ? `正在探测：${currentSource}` : '正在从 30+ 优质片源节点竞速抓取...'}
          </p>
        </div>
      </div>

      {/* 影院级流光进度条 */}
      <div className="relative w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-red-600 via-[var(--accent-color)] to-amber-500 transition-all duration-300 ease-out rounded-full relative"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer" />
        </div>
      </div>

      {/* 底部统计与状态标签 */}
      <div className="flex items-center justify-between mt-3 text-[11px] text-white/40 font-medium">
        <span>已完成探测：<strong className="text-white/80">{checkedSources}</strong> / {totalSources} 个资源站</span>
        <span className="text-[10px] text-emerald-400/80">⚡ 毫秒级多线竞速已开启</span>
      </div>
    </div>
  );
}
