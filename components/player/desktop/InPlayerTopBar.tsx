'use client';

import React from 'react';
import { ChevronLeft, Clock, Star, Sparkles } from 'lucide-react';

interface InPlayerTopBarProps {
  title: string;
  episodeName?: string;
  isPremium?: boolean;
  onBack?: () => void;
  showControls: boolean;
  fullscreenClock?: string;
  rating?: string | number | null;
  resolutionLabel?: string;
}

/**
 * 🛡️ iKanPP 全屏/播放器沉浸顶部元数据悬浮面板 (Apple TV+ 级设计)
 * 严格遵从工程铁律：严禁使用 backdrop-blur，采用纯色/线性渐变遮罩，100% 杜绝显卡 Hardware Overlay 显存回读黑屏！
 */
export const InPlayerTopBar = React.memo(function InPlayerTopBar({
  title,
  episodeName,
  isPremium = false,
  onBack,
  showControls,
  fullscreenClock,
  rating,
  resolutionLabel = '4K 超清',
}: InPlayerTopBarProps) {
  const formattedRating = rating ? Number(rating).toFixed(1) : null;

  return (
    <div
      data-player-layer="true"
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      className={`absolute top-0 left-0 right-0 z-40 px-4 sm:px-6 py-4 flex items-center justify-between pointer-events-none transition-all duration-300 ${
        showControls
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 -translate-y-2'
      }`}
      style={{
        background: 'linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.4) 60%, transparent 100%)',
      }}
    >
      {/* 左侧：返回胶囊与影片元数据 */}
      <div className="flex items-center gap-3 min-w-0 max-w-[65%] pointer-events-auto">
        {onBack && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (typeof document !== 'undefined' && document.fullscreenElement) {
                document.exitFullscreen().catch(() => {});
              }
              onBack();
            }}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#141416]/90 hover:bg-black border border-white/20 text-white/90 hover:text-white transition-all cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:scale-105 active:scale-95 text-xs font-bold shrink-0"
            title={isPremium ? '返回' : '返回'}
          >
            <ChevronLeft size={16} />
            <span>返回</span>
          </button>
        )}

        <div className="flex items-center gap-2 min-w-0">
          <h1 className="text-sm sm:text-base font-bold text-white tracking-wide truncate max-w-[200px] sm:max-w-[360px] drop-shadow-md">
            {title || '正在播放'}
          </h1>

          {episodeName && (
            <span className="px-2 py-0.5 rounded-md bg-[#1e1e24]/90 border border-white/15 text-[11px] font-semibold text-white/80 shrink-0">
              {episodeName}
            </span>
          )}
        </div>
      </div>

      {/* 中间/右侧：规格芯片与全屏时钟 */}
      <div className="flex items-center gap-2 shrink-0 pointer-events-auto">
        {/* 豆瓣真实评分 */}
        {formattedRating && (
          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#141416]/90 border border-amber-500/30 text-xs font-bold text-amber-400 shadow-md">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{formattedRating}</span>
          </div>
        )}

        {/* 4K 原画与 HDR 科技标 */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141416]/90 border border-white/20 text-xs font-mono font-semibold text-white/90 shadow-md">
          <Sparkles size={12} className="text-amber-400" />
          <span>{resolutionLabel}</span>
          <span className="text-white/40 text-[10px]">|</span>
          <span className="text-white/70 text-[11px]">HDR10</span>
        </div>

        {/* 数字时钟 */}
        {fullscreenClock && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141416]/90 border border-white/20 shadow-md text-xs font-mono text-white/80">
            <Clock size={12} className="text-white/60" />
            <span>{fullscreenClock}</span>
          </div>
        )}

        {/* 品牌专属台标 */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#141416]/90 border border-white/20 shadow-md">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[11px] font-black tracking-wider text-white">
            {isPremium ? 'iKanX 4K VIP' : 'iKanPP 4K'}
          </span>
        </div>
      </div>
    </div>
  );
});
