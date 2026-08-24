'use client';

import React from 'react';
import { Crown, Sparkles } from 'lucide-react';

interface PlayerBrandLogoProps {
  className?: string;
  isPremium?: boolean;
}

/**
 * 播放器左上角专属尊享品牌台标（常驻微遮罩）
 * 1. 完美覆盖 Jable 等第三方原站压制的左上角硬水印
 * 2. 提升 iKanPP 自研 4K 蓝光品牌质感与私享尊贵感
 * 3. 兼容桌面端、移动端沉浸式全屏与小屏
 */
export function PlayerBrandLogo({ className = '', isPremium = true }: PlayerBrandLogoProps) {
  return (
    <div
      className={`absolute top-2.5 left-2.5 sm:top-3.5 sm:left-3.5 z-30 pointer-events-none select-none transition-opacity duration-300 ${className}`}
      style={{ minWidth: '120px', minHeight: '32px' }}
      aria-hidden="true"
    >
      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-black/85 backdrop-blur-md border border-amber-500/30 shadow-lg shadow-black/60">
        <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-sm">
          <Crown size={12} className="text-black font-black" />
        </div>
        <div className="flex flex-col">
          <span className="text-[11px] font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 leading-none">
            iKanPP 4K
          </span>
          <span className="text-[8px] font-semibold text-white/50 tracking-tighter leading-none mt-0.5">
            {isPremium ? 'VIP 独家蓝光' : '极速原画'}
          </span>
        </div>
        <Sparkles size={10} className="text-amber-400/80 ml-0.5 animate-pulse" />
      </div>
    </div>
  );
}
