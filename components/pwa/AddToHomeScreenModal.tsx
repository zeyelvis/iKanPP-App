'use client';

import React, { useState, useEffect } from 'react';
import { Download, Sparkles, CheckCircle2, ChevronRight, Apple, Settings, ShieldCheck, Share, PlusSquare, Smartphone } from 'lucide-react';
import {
  isPwaStandalone,
  isPwaDismissedIn14Days,
  dismissPwaFor14Days,
  isTrueIOSSafari,
  isIOSDevice,
} from '@/lib/client/pwa-install';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

/**
 * PWA 强桌面锁留存卡片 (AddToHomeScreenModal)
 * 
 * 规范契约（方案第 6 节）：
 * 1. 时机：用户看过第 2 集之后才主动弹出（播放器出第一帧时计数），而不是一打开网站就弹；
 * 2. 免打扰：点「以后再说」/关闭后 14 天内不再主动弹；
 * 3. 独立窗口 (display-mode: standalone) 彻底静默；
 * 4. iOS 26 专属措辞对齐：
 *    「点 Safari 底部的「共享」（新版 iOS 先点右下角「···」）→ 选「添加到主屏幕」（新版 iOS 在「查看更多」里）→ 以后从桌面图标打开」；
 * 5. 只在 iOS Safari 显示 iOS 步骤，其他第三方 iOS 浏览器不显示；
 * 6. 弹窗不能遮挡播放器，严禁使用 backdrop-blur。
 */
export function AddToHomeScreenModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  
  // iOS 描述文件安装步骤状态：'ready' (默认展示 iOS 26 标准步骤) | 'downloaded' (已下载描述文件提示去设置安装)
  const [iosStep, setIosStep] = useState<'ready' | 'downloaded'>('ready');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. 若当前已经是以独立 PWA / 全屏 App 模式运行，彻底静默
    if (isPwaStandalone()) return;

    // 2. 主动唤起事件监听（手动从设置/我的页/Navbar 点击触发，无论是否免打扰均展示）
    const handleManualTrigger = () => {
      setIosStep('ready');
      setIsOpen(true);
    };
    window.addEventListener('ikanpp:show-pwa-modal', handleManualTrigger);

    // 3. 自动唤起事件监听（看满第 2 集出第一帧后触发）
    const handleAutoTrigger = () => {
      // 全屏时不打断观影，防遮挡播放器
      if (document.fullscreenElement) return;
      if (isPwaDismissedIn14Days() || isPwaStandalone()) return;
      setIosStep('ready');
      setIsOpen(true);
    };
    window.addEventListener('ikanpp:show-pwa-modal-auto', handleAutoTrigger);

    // 4. 支持通过 URL 参数 (?pwa=1 或 ?install=1) 主动唤起
    const searchParams = new URLSearchParams(window.location.search);
    if (searchParams.get('pwa') === '1' || searchParams.get('pwa') === 'true' || searchParams.get('install') === '1') {
      setIosStep('ready');
      setIsOpen(true);
    }

    // 5. 设备与浏览器精准推断
    setIsIOS(isIOSDevice());
    setIsSafari(isTrueIOSSafari());

    // 6. 监听 Android / Chrome 的原生安装候选事件
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('ikanpp:show-pwa-modal', handleManualTrigger);
      window.removeEventListener('ikanpp:show-pwa-modal-auto', handleAutoTrigger);
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
    dismissPwaFor14Days();
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

  // iOS 描述文件备选直装通道
  const handleIosProfileInstall = () => {
    setIosStep('downloaded');
    window.location.href = '/api/pwa/ios-profile';
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-3 sm:p-6 bg-black/80 animate-fade-in select-none"
      onClick={handleDismiss}
      role="dialog"
      aria-modal="true"
      aria-label="添加到手机桌面"
    >
      <div
        className="relative w-full max-w-sm rounded-3xl bg-[#141416] border border-white/10 p-5 sm:p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.95)] text-white space-y-4 max-h-[calc(100dvh-5rem)] overflow-y-auto"
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
                <h3 className="font-bold text-base tracking-wide text-white">装到桌面 极速看剧</h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300">
                  体验对齐
                </span>
              </div>
              <p className="text-xs text-slate-300/80 mt-0.5">像 App 一样常驻手机桌面 · 秒开 0 广告</p>
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
            {isSafari ? (
              // 真正的 iOS Safari：100% 绝对对齐 iOS 26 新界面 3 步规范
              iosStep === 'ready' ? (
                <div className="space-y-3">
                  <div className="rounded-2xl bg-white/5 p-3.5 border border-white/10 space-y-2.5 text-xs text-white/90">
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-red-600/80 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        1
                      </span>
                      <span>点 Safari 底部的「共享」（新版 iOS 先点右下角「···」）</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-red-600/80 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        2
                      </span>
                      <span>选「添加到主屏幕」（新版 iOS 在「查看更多」里）</span>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-red-600/80 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                        3
                      </span>
                      <span>以后从桌面图标打开</span>
                    </div>
                  </div>

                  {/* 备选快捷描述文件直装 */}
                  <div className="pt-1 flex gap-2">
                    <button
                      type="button"
                      onClick={handleDismiss}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-[0.98] font-medium text-xs text-white/70 transition-all text-center"
                    >
                      以后再说
                    </button>
                    <button
                      type="button"
                      onClick={handleIosProfileInstall}
                      className="flex-[1.5] py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 active:scale-[0.98] font-bold text-xs text-white transition-all text-center shadow-lg shadow-red-600/30 flex items-center justify-center gap-1.5"
                    >
                      <Apple className="w-3.5 h-3.5 fill-white" />
                      <span>一键直装描述文件</span>
                    </button>
                  </div>
                </div>
              ) : (
                // 描述文件已触发下载
                <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>描述文件已开始下载！</span>
                  </div>
                  <div className="space-y-2 text-white/90">
                    <p>1. 若弹出系统提示，请点<strong>「允许」</strong>；</p>
                    <p>2. 打开 iPhone<strong>「设置」</strong>，点击顶部<strong>「已下载描述文件」</strong>完成安装。</p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 font-medium text-xs transition-all text-center"
                  >
                    我知道了
                  </button>
                </div>
              )
            ) : (
              // 非 Safari 的第三方 iOS 浏览器：规范明确不显示 iOS 步骤
              <div className="rounded-2xl bg-white/5 p-4 border border-white/10 space-y-3 text-xs text-slate-300">
                <div className="flex items-center gap-2 text-amber-400 font-bold">
                  <Smartphone className="w-4 h-4" />
                  <span>建议使用 Safari 打开本页</span>
                </div>
                <p className="leading-relaxed">
                  当前浏览器暂不支持直接添加到桌面。请复制当前链接，在 iPhone 自带的 <strong>Safari 浏览器</strong> 中打开，即可一键装到桌面。
                </p>
                <div className="pt-1 flex gap-2">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 font-medium text-xs transition-all text-center"
                  >
                    以后再说
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (typeof navigator !== 'undefined' && navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href);
                      }
                      handleDismiss();
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 font-bold text-xs text-white text-center shadow-lg shadow-red-600/30"
                  >
                    复制链接
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
              以后再说
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
