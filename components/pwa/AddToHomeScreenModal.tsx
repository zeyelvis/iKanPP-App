'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

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

    // 1. 若当前已经是以独立 PWA / 全屏 App 模式运行，不触发
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    if (isStandalone) return;

    // 2. 仅针对移动端视口
    const isMobile = window.innerWidth <= 768;
    if (!isMobile) return;

    // 3. 检查免打扰时间戳（7天内不打扰）
    const dismissedAt = localStorage.getItem('ikanpp_pwa_dismissed_at');
    if (dismissedAt) {
      const diff = Date.now() - parseInt(dismissedAt, 10);
      if (diff < 7 * 24 * 60 * 60 * 1000) {
        return;
      }
    }

    // 4. 判断设备系统
    const ua = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIosDevice);

    // 5. 监听 Android / Chrome 的原生安装候选事件
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    // 6. 沉浸式观影或停留 180 秒后优雅唤起
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 180000); // 3 分钟

    return () => {
      clearTimeout(timer);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

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
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="relative w-full max-w-sm rounded-3xl bg-[#141416]/95 border border-white/10 p-5 shadow-2xl text-white space-y-4">
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
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 transition-colors"
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
          <div className="rounded-2xl bg-white/5 p-3 border border-white/5 space-y-2 text-xs text-white/80">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">1</span>
              <span>点击 Safari 浏览器底部的 <strong>分享</strong> 按钮 ⎋</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">2</span>
              <span>向下滑动，选择 <strong>添加到主屏幕</strong> ⊕</span>
            </div>
            <div className="pt-2">
              <button
                onClick={handleDismiss}
                className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs tracking-wider transition-colors shadow-lg shadow-red-600/30"
              >
                我知道了，稍后添加
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-1 flex gap-2">
            <button
              onClick={handleDismiss}
              className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 font-medium text-xs transition-colors text-white/70"
            >
              稍后再说
            </button>
            <button
              onClick={handleInstallClick}
              className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs tracking-wider transition-colors shadow-lg shadow-red-600/30"
            >
              一键添加至桌面
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
