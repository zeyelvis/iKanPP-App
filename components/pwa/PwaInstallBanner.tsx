'use client';

import React, { useState, useEffect } from 'react';
import { Download, X, Sparkles } from 'lucide-react';

/**
 * 移动端智能吸顶 PWA 安装横幅 (PwaInstallBanner)
 * 
 * 核心策略：
 * 1. 独立窗口 (standalone) 100% 静默：老用户直接打开已安装应用时不显示；
 * 2. 3 天免打扰：用户点击关闭后 3 天内不再重复显示；
 * 3. 仅在移动端视口显示；
 * 4. 点击一键唤起双轨安装弹窗 (Android 原生一键装 / iOS 描述文件直装)。
 */
export function PwaInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. 检测是否已处于独立 PWA 窗口中
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(standaloneMode);
    if (standaloneMode) return;

    // 2. 仅在移动端视口展示
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    // 3. 检查免打扰时间戳 (3 天内不重复出现)
    const dismissedAt = localStorage.getItem('ikanpp_pwa_banner_dismissed');
    if (dismissedAt) {
      const diff = Date.now() - parseInt(dismissedAt, 10);
      if (diff < 3 * 24 * 60 * 60 * 1000) return;
    }

    // 延时 1 秒平滑滑出，避免首屏瞬间阻挡用户视线
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setIsVisible(false);
    localStorage.setItem('ikanpp_pwa_banner_dismissed', Date.now().toString());
  };

  const handleOpenInstall = () => {
    window.dispatchEvent(new CustomEvent('ikanpp:show-pwa-modal'));
  };

  if (!isVisible || isStandalone) return null;

  return (
    <div className="sm:hidden sticky top-0 inset-x-0 z-50 bg-[#121216]/98 border-b border-white/10 px-3 py-2 flex items-center justify-between shadow-xl animate-fade-in select-none">
      {/* 左侧：应用图标与标语 */}
      <div className="flex items-center gap-2.5 min-w-0" onClick={handleOpenInstall}>
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
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white text-xs font-bold shadow-lg shadow-red-600/30 active:scale-95 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>安装</span>
        </button>
        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="关闭横幅"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
