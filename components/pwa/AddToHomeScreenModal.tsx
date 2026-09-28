'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, CheckCircle2, ChevronRight, Apple, Smartphone, Settings, ArrowDownCircle } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA 强桌面锁留存卡片 (AddToHomeScreenModal)
 * 
 * 升级版核心能力：
 * 1. 智能平台双轨调度：
 *    - Android / Chrome：捕获 beforeinstallprompt 事件，支持原生真正一键直装；
 *    - iOS (iPhone / iPad)：
 *      - 核心推荐【黑科技 A：iOS 描述文件直装 (.mobileconfig)】，直接触发 Safari 系统弹窗“允许下载描述文件”，彻底跳过难找的分享菜单；
 *      - 备选方案【Safari 底部分享菜单添加】，双轨兼顾；
 * 2. 7 天免打扰与独立窗口 (standalone) 100% 自动静默；
 * 3. 支持全局事件 (ikanpp:show-pwa-modal) 与 URL 参数 (?pwa=1, ?install=1) 主动唤起。
 */
export function AddToHomeScreenModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // iOS 描述文件安装步骤状态：'ready' (准备下载) | 'downloaded' (已下载，提示去设置安装)
  const [iosStep, setIosStep] = useState<'ready' | 'downloaded'>('ready');
  // 是否展开 iOS 传统的 Safari 分享步骤
  const [showIosShareFallback, setShowIosShareFallback] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. 主动唤起事件监听（主动触发无论是否免打扰均展示）
    const handleCustomTrigger = () => {
      setIosStep('ready');
      setIsOpen(true);
    };
    window.addEventListener('ikanpp:show-pwa-modal', handleCustomTrigger);

    // 2. 支持通过 URL 参数 (?pwa=1 或 ?install=1) 主动唤起
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('pwa') === '1' || searchParams.get('pwa') === 'true' || searchParams.get('install') === '1') {
      setIosStep('ready');
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

    // 8. 沉浸式观影或停留 180 秒后被动优雅唤起
    const timer = setTimeout(() => {
      setIosStep('ready');
      setIsOpen(true);
    }, 180000);

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

  // Android / Chrome 原生一键直装
  const handleAndroidInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsOpen(false);
        }
      } catch (err) {
        console.warn('PWA prompt error:', err);
      }
      setDeferredPrompt(null);
    } else {
      handleDismiss();
    }
  };

  // iOS 黑科技 A：WebClip 描述文件直装
  const handleIosProfileInstall = () => {
    // 切换弹窗为教学状态
    setIosStep('downloaded');
    // 直接触发描述文件下载，Safari 自动弹出“允许下载描述文件吗？”
    window.location.href = '/api/pwa/ios-profile';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-fade-in select-none"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="添加到手机桌面"
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-[#141416]/98 border border-white/10 p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] text-white space-y-4 max-h-[calc(100dvh-2rem)] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部图标与关闭按钮 */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-red-600/30">
              iK
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-bold text-base tracking-wide text-white">安装 iKanPP 客户端</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300">
                  免翻
                </span>
              </div>
              <p className="text-xs text-slate-300/80 mt-0.5">像 App 一样常驻手机桌面</p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 flex items-center justify-center text-white/60 hover:text-white transition-all cursor-pointer"
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
            <div className="text-xs font-semibold text-amber-400">永不迷路</div>
            <div className="text-[10px] text-white/40">独立窗口</div>
          </div>
        </div>

        {/* 平台分流内容 */}
        {isIOS ? (
          // ==================== 苹果 iOS 专属流程 ====================
          <div className="space-y-3.5">
            {iosStep === 'ready' ? (
              // 步骤 1：主推通道（iOS WebClip 描述文件一键直装）
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleIosProfileInstall}
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] font-bold text-sm tracking-wider text-white shadow-xl shadow-red-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Apple className="w-4 h-4 fill-white" />
                  <span>一键直装到桌面 (极速推荐)</span>
                  <ChevronRight className="w-4 h-4 opacity-75" />
                </button>

                <p className="text-[11px] text-center text-slate-400 leading-relaxed">
                  点击后系统将提示「允许下载」，按指引 5 秒完成入驻
                </p>

                {/* 折叠切换：Safari 传统底部分享方式 */}
                <div className="pt-1 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowIosShareFallback(!showIosShareFallback)}
                    className="w-full text-center text-xs text-slate-400 hover:text-white py-1 flex items-center justify-center gap-1 transition-colors"
                  >
                    <span>习惯使用 Safari 分享菜单添加？</span>
                    <span className="text-[10px] text-red-400 underline">
                      {showIosShareFallback ? '收起' : '查看步骤'}
                    </span>
                  </button>

                  {showIosShareFallback && (
                    <div className="mt-2.5 rounded-2xl bg-white/5 p-3.5 border border-white/5 space-y-2 text-xs text-white/80 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">1</span>
                        <span>点击 Safari 底部的 <strong>分享按钮 ⎋</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold shrink-0">2</span>
                        <span>往下滑动选择 <strong>添加到主屏幕 ⊕</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              // 步骤 2：下载后引导用户前往设置安装
              <div className="rounded-2xl bg-gradient-to-b from-white/10 to-white/5 p-4 border border-white/10 space-y-3.5 animate-fade-in text-xs">
                <div className="flex items-center gap-2 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>描述文件已开始下载！最后两步：</span>
                </div>

                <div className="space-y-2.5 text-white/90">
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/80 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</span>
                    <span>若 Safari 弹出提示，请点击 <strong>「允许」</strong> 并关闭提示框</span>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-red-600/80 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</span>
                    <div>
                      <span>打开 iPhone <strong>「设置」</strong>，点击最上方的：</span>
                      <div className="mt-1 px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 font-bold text-amber-300 flex items-center gap-1.5 w-fit">
                        <Settings className="w-3.5 h-3.5 text-amber-400" />
                        <span>已下载描述文件 ➔ 点安装</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={handleIosProfileInstall}
                    className="flex-1 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 font-medium text-xs transition-all text-center"
                  >
                    重新下载
                  </button>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs text-white transition-all text-center shadow-lg shadow-red-600/30"
                  >
                    去设置安装
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          // ==================== 安卓 Android / Chrome 原生一键直装 ====================
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={handleDismiss}
              className="flex-1 py-3 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-[0.98] font-medium text-xs transition-all text-white/70"
            >
              稍后再说
            </button>
            <button
              type="button"
              onClick={handleAndroidInstall}
              className="flex-[1.5] py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] font-bold text-xs tracking-wider transition-all shadow-xl shadow-red-600/30 flex items-center justify-center gap-1.5 text-white"
            >
              <Download className="w-4 h-4" />
              <span>一键添加至桌面</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
