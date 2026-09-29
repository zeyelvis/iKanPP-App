'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Compass, X } from 'lucide-react';
import { inAppBrowser } from '@/lib/client/in-app';

const STORAGE_KEY = 'ikanpp_in_app_banner_closed';

/**
 * 第三方 App 内置 WebView 提示横幅 (InAppBrowserBanner)
 * 引导微信、QQ、微博、抖音等用户切换至系统默认浏览器，享受原生全屏、无劫持与桌面 App 安装体验
 */
export function InAppBrowserBanner() {
  const [appName, setAppName] = useState<string | null>(null);
  const [isDismissed, setIsDismissed] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    // 1. 读取内置浏览器特征
    const detected = inAppBrowser();
    if (!detected) return;

    // 2. 检查当前会话是否已手动关闭
    try {
      const closed = sessionStorage.getItem(STORAGE_KEY);
      if (closed === '1') return;
    } catch {}

    setAppName(detected);
    setIsDismissed(false);
  }, []);

  const handleClose = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {}
  };

  // 1. 无内置浏览器或已关闭
  if (isDismissed || !appName) {
    return null;
  }

  // 2. 管理后台绝对静默
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  // 3. 计算底部间距：普通页面存在 MobileBottomNav（约 58px），播放页无底部导航
  const isPlayerPage =
    pathname?.startsWith('/player') ||
    pathname?.startsWith('/short/player') ||
    pathname?.startsWith('/premium/player');

  const bottomClass = isPlayerPage
    ? 'bottom-0 pb-[max(8px,env(safe-area-inset-bottom))]'
    : 'bottom-[calc(56px+env(safe-area-inset-bottom))]';

  return (
    <div
      role="alert"
      className={`fixed ${bottomClass} inset-x-0 z-40 px-3 py-2 sm:px-4 sm:py-2.5 bg-[#181922] border-t border-amber-500/30 shadow-[0_-8px_30px_rgba(0,0,0,0.8)] select-none text-white transition-transform duration-300`}
    >
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <Compass size={14} className="animate-spin-slow" />
          </div>
          <p className="text-white/90 leading-snug line-clamp-2">
            你正在{appName}里浏览。点右上角「···」选「在浏览器打开」，播放更流畅，还能全屏、装到桌面。
          </p>
        </div>

        <button
          type="button"
          onClick={handleClose}
          aria-label="关闭提示"
          className="shrink-0 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
