'use client';

import React, { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA 强桌面锁留存卡片 (AddToHomeScreenModal)
 * 
 * 核心策略：
 * 1. 沉浸期优雅触发：用户在站内沉浸式观影或停留满 180 秒时触发；
 * 2. 7 天免打扰：点击关闭或安装后记录时间戳，7 天内绝不重复弹窗打扰；
 * 3. 智能平台分流：
 *    - iOS Safari：引导点击底部 Safari 分享图标 -> “添加到主屏幕”；
 *    - Android / Chrome：捕获 beforeinstallprompt 事件，支持一键直接安装；
 * 4. 仅在非独立窗口 (standalone) 且移动设备中展示。
 */
export function AddToHomeScreenModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. 主动唤起事件监听（无论是否免打扰，主动触发均可唤起）
    const handleCustomTrigger = () => {
      setIsOpen(true);
    };
    window.addEventListener('ikanpp:show-pwa-modal', handleCustomTrigger);

    // 2. 支持通过 URL 参数 (?pwa=1 或 ?install=1) 主动唤起
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('pwa') === '1' || searchParams.get('pwa') === 'true' || searchParams.get('install') === '1') {
      setIsOpen(true);
    }

    // 3. 判断设备系统
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // 4. 监听 Android / Chrome 的原生安装候选事件
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 5. 若当前已经是以独立 PWA / 全屏 App 模式运行，不自动触发
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) {
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('ikanpp:show-pwa-modal', handleCustomTrigger);
      };
    }

    // 6. 自动唤起仅针对移动端视口
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) {
      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        window.removeEventListener('ikanpp:show-pwa-modal', handleCustomTrigger);
      };
    }

    // 7. 检查免打扰时间戳（7天内不自动打扰）
    const dismissedAt = localStorage.getItem('ikanpp_pwa_dismissed_at');
    if (dismissedAt) {
      const diff = Date.now() - parseInt(dismissedAt, 10);
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        return () => {
          window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
          window.removeEventListener('ikanpp:show-pwa-modal', handleCustomTrigger);
        };
      }
    }

    // 8. 沉浸式观影或停留 180 秒后优雅唤起
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 180000); // 3 分钟

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('ikanpp:show-pwa-modal', handleCustomTrigger);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // 监听 ESC 键关闭
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleDismiss = () => {
    setIsOpen(false);
    localStorage.setItem('ikanpp_pwa_dismissed_at', Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsOpen(false);
      }
      setDeferredPrompt(null);
    } else {
      handleDismiss();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in select-none"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="添加到手机主屏幕"
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-[#141416]/95 border border-white/10 p-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] text-white space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部图标与关闭按钮 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-600/90 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/30">
              iK
            </div>
            <div>
              <h3 className="font-bold text-base tracking-wide text-white">添加到手机主屏幕</h3>
              <p className="text-xs text-white/50">像 App 一样免翻墙一秒看剧</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/60 hover:text-white transition-all"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>

        {/* 核心亮点标签 */}
        <div className="grid grid-cols-3 gap-2 py-1 text-center">
          <div className="rounded-xl bg-white/5 p-2 border border-white/5">
            <div className="text-xs font-semibold text-red-400">0 弹窗广告</div>
            <div className="text-[10px] text-white/40">纯净沉浸</div>
          </div>
          <div className="rounded-xl bg-white/5 p-2 border border-white/5">
            <div className="text-xs font-semibold text-emerald-400">4K 原画秒开</div>
            <div className="text-[10px] text-white/40">CDN 直连</div>
          </div>
          <div className="rounded-xl bg-white/5 p-2 border border-white/5">
            <div className="text-xs font-semibold text-blue-400">永不迷路</div>
            <div className="text-[10px] text-white/40">独立窗口</div>
          </div>
        </div>

        {/* 操作指引 */}
        {isIOS ? (
          <div className="rounded-2xl bg-white/5 p-3.5 border border-white/5 space-y-2.5 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
              <span>点击 Safari 浏览器底部的 <strong>分享</strong> 按钮 ⎋</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
              <span>向下滑动，选择 <strong>添加到主屏幕</strong> ⊕</span>
            </div>
            <div className="pt-2">
              <button
                onClick={handleDismiss}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.98] font-bold text-xs tracking-wider transition-all shadow-lg shadow-red-600/30"
              >
                我知道了，稍后添加
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-1 flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] font-medium text-xs transition-all text-white/70"
            >
              稍后再说
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 active:scale-[0.98] font-bold text-xs tracking-wider transition-all shadow-lg shadow-red-600/30"
            >
              一键添加至桌面
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
