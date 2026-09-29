'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';
import {
  isPwaStandalone,
  isPwaDismissedIn14Days,
  dismissPwaFor14Days,
  getWatchedEpisodesCount,
} from '@/lib/client/pwa-install';

/**
 * 移动端吸顶 PWA 安装横幅 (PwaInstallBanner)
 * 
 * 规范契约（方案第 6 节）：
 * 1. 独立窗口 (standalone) 100% 静默：老用户直接打开已安装应用时不显示；
 * 2. 时机：用户看过第 2 集之后才主动弹出（播放器出第一帧时计数），而不是一打开网站就弹；
 * 3. 免打扰：用户点击关闭后 14 天内不再重复显示；
 * 4. 仅在移动端视口显示；
 * 5. 点击一键唤起安装指引弹窗。
 */
export function PwaInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. 检测是否已处于独立 PWA 窗口中
    if (isPwaStandalone()) return;

    // 2. 仅在移动端视口展示
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    // 3. 严格铁律：用户看过第 2 集之后才主动弹出
    const watched = getWatchedEpisodesCount();
    if (watched < 2) return;

    // 4. 检查 14 天免打扰
    if (isPwaDismissedIn14Days()) return;

    // 平滑延时滑出
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsVisible(false);
    dismissPwaFor14Days();
  };

  const handleOpenInstall = () => {
    window.dispatchEvent(new CustomEvent('ikanpp:show-pwa-modal'));
  };

  if (!isVisible || isPwaStandalone()) return null;

  return (
    <div className="sm:hidden sticky top-0 inset-x-0 z-50 bg-[#121216] border-b border-white/10 px-3 py-2 flex items-center justify-between shadow-xl animate-fade-in select-none">
      {/* 左侧：应用图标与标语 */}
      <div className="flex items-center gap-2.5 min-w-0 cursor-pointer" onClick={handleOpenInstall}>
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 p-0.5 shadow-md shadow-red-600/30 flex items-center justify-center shrink-0">
          <span className="font-black text-sm text-white tracking-tighter">iK</span>
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-white tracking-wide truncate">iKanPP 官方客户端</span>
            <span className="flex items-center text-[9px] font-mono px-1 py-0.2 rounded bg-red-500/20 text-red-300 border border-red-500/30 shrink-0">
              <Sparkles className="w-2.5 h-2.5 mr-0.5 text-amber-300" />
              免翻
            </span>
          </div>
          <span className="text-[10px] text-slate-300/80 truncate">添加至手机桌面 · 4K秒开 0广告</span>
        </div>
      </div>

      {/* 右侧：安装胶囊按钮与关闭 */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleOpenInstall}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all cursor-pointer"
        >
          <Download className="w-3.5 h-3.5" />
          <span>安装</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="关闭横幅"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
