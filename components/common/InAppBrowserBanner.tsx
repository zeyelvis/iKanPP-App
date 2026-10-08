'use client';

import React, { useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import { Compass, X } from 'lucide-react';
import { inAppBrowser } from '@/lib/client/in-app';

const STORAGE_KEY = 'ikanpp_in_app_banner_closed';

function subscribe() {
  return () => {};
}

function getClientSnapshot(): string | null {
  const detected = inAppBrowser();
  if (!detected) return null;
  try {
    if (sessionStorage.getItem(STORAGE_KEY) === '1') return null;
  } catch {}
  return detected;
}

function getServerSnapshot(): null {
  return null;
}

/**
 * 第三方 App 内置 WebView 提示横幅 (InAppBrowserBanner)
 * 引导微信、QQ、微博、抖音等用户切换至系统默认浏览器，享受原生全屏、无劫持与桌面 App 安装体验
 */
export function InAppBrowserBanner() {
  const appName = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  const [isDismissed, setIsDismissed] = useState(false);
  const pathname = usePathname();

  const handleClose = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem(STORAGE_KEY, '1');
    } catch {}
  };

  // 1. 无内置浏览器或已手动关闭
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
    pathname?.startsWith('/short/player');

  const bottomClass = isPlayerPage
    ? 'bottom-0 pb-[max(8px,env(safe-area-inset-bottom))]'
    : 'bottom-[calc(56px+env(safe-area-inset-bottom))]';

  return (
    <div
      className={`fixed left-0 right-0 z-[80] px-3 transition-transform duration-300 ease-out select-none ${bottomClass}`}
    >
      <div className="max-w-md mx-auto bg-[#141416]/95 border border-amber-500/30 text-amber-200 rounded-xl p-3 shadow-[0_8px_30px_rgba(0,0,0,0.8)] flex items-start gap-3">
        <Compass className="w-5 h-5 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
        <div className="flex-1 min-w-0 text-xs leading-relaxed text-amber-100/90">
          <p className="font-semibold text-amber-300">正在使用 {appName} 内置浏览器</p>
          <p className="text-[11px] text-amber-200/80 mt-0.5">
            请点击右上角 <span className="font-mono font-bold">•••</span> 选择
            <span className="font-bold text-white bg-amber-500/20 px-1 py-0.5 rounded mx-0.5">在浏览器打开</span>
            以获得最佳 4K 原画与防截断全屏体验
          </p>
        </div>
        <button
          onClick={handleClose}
          className="p-1 -mr-1 -mt-1 text-amber-400/60 hover:text-amber-200 transition-colors cursor-pointer shrink-0"
          aria-label="关闭提示"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
