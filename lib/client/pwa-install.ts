'use client';

import { useSyncExternalStore } from 'react';
import { inAppBrowser } from '@/lib/client/in-app';
import { PWA_INSTALLED_KEY } from '@/lib/client/pwa-capture';
import { checkIsIPadOS } from '@/lib/hooks/mobile/useDeviceDetection';

/**
 * PWA 桌面安装与留存辅助模块
 *
 * 规范契约（方案第 6 节）：
 * 1. 时机：用户看过第 2 集之后才主动弹出（播放器出第一帧时计数），而不是一打开网站就弹；
 * 2. 免打扰：点「以后再说」/关闭后 14 天内不再主动弹；
 * 3. 独立窗口 (display-mode: standalone) 彻底静默；装过一次（appinstalled）也记住，不再提示；
 * 4. 只在真能安装的地方提示：浏览器给出安装事件的（安卓 Chrome、Edge 等）一键安装，
 *    iPhone / iPad 的 Safari 给步骤；微信、QQ 等 App 内置浏览器提示「在浏览器打开」；
 * 5. iOS 26 专属措辞对齐；iPad 识别必须走 checkIsIPadOS（准则 22，Mac 触控板也报多点触控）。
 */

const WATCHED_EPISODES_KEY = 'ikanpp_watched_episodes_count';
const DISMISSED_AT_KEY = 'ikanpp_pwa_dismissed_at';
const DISMISSED_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 天

/**
 * iOS 描述文件（/api/pwa/ios-profile）签名证书的到期日。过期后 iPhone 会显示「未验证」，
 * 届时入口自动隐藏，重新签名后更新此日期。
 */
export const IOS_PROFILE_SIGNED_UNTIL = '2026-12-27';

export type InstallPath = 'prompt' | 'ios' | 'in-app' | 'installed' | 'none';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

type InstallWindow = Window & { __ikInstall?: BeforeInstallPromptEvent | null };

// 装到桌面的事件捕获脚本与「已安装」标记见 lib/client/pwa-capture.ts（根布局注入）。
export { inAppBrowser };

/**
 * 记录出第一帧的集数，并返回累计看过的集数
 */
export function recordEpisodeWatch(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const current = parseInt(localStorage.getItem(WATCHED_EPISODES_KEY) || '0', 10);
    const next = current + 1;
    localStorage.setItem(WATCHED_EPISODES_KEY, next.toString());
    return next;
  } catch {
    return 1;
  }
}

/**
 * 获取当前累计看过的集数
 */
export function getWatchedEpisodesCount(): number {
  if (typeof window === 'undefined') return 0;
  try {
    return parseInt(localStorage.getItem(WATCHED_EPISODES_KEY) || '0', 10);
  } catch {
    return 0;
  }
}

/**
 * 检测当前是否已处于独立 PWA 桌面应用窗口 (standalone)
 */
export function isPwaStandalone(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

/** 已在桌面窗口里，或在这个浏览器里装过（appinstalled / 安装框里点了「安装」）。 */
export function isPwaInstalled(): boolean {
  if (isPwaStandalone()) return true;
  try {
    return localStorage.getItem(PWA_INSTALLED_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * 检测是否处于 14 天免打扰期
 */
export function isPwaDismissedIn14Days(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const dismissedAt = localStorage.getItem(DISMISSED_AT_KEY);
    if (!dismissedAt) return false;
    const diff = Date.now() - parseInt(dismissedAt, 10);
    return diff < DISMISSED_DURATION_MS;
  } catch {
    return false;
  }
}

/**
 * 标记关闭免打扰 14 天
 */
export function dismissPwaFor14Days(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DISMISSED_AT_KEY, Date.now().toString());
  } catch {}
}

/**
 * 判断是否为 iOS 设备（无论何种浏览器）。iPad 自称 Mac：按准则 22 用 checkIsIPadOS 识别，
 * 不能只看多点触控（MacBook 触控板也会上报）。
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  if (/Android/i.test(ua)) return false;
  return /iPhone|iPad|iPod/i.test(ua) || checkIsIPadOS();
}

/**
 * 判断是否为真正的 iOS 原生 Safari 浏览器
 *
 * 规范铁律：
 * 排除非 Safari 的 iOS 浏览器（UA 含 CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|Baidu|UCBrowser|MQQBrowser|Quark），
 * 以及微信、QQ 等 App 内置 Webview。
 */
export function isTrueIOSSafari(): boolean {
  if (!isIOSDevice()) return false;
  const ua = window.navigator.userAgent;
  if (/CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|Baidu|UCBrowser|MQQBrowser|Quark/i.test(ua)) return false;
  if (inAppBrowser()) return false;
  return /Safari/i.test(ua);
}

/** 电脑上的 Safari（macOS Sonoma 起可「添加到程序坞」）。 */
export function isMacSafari(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;
  return /Macintosh/.test(ua) && !isIOSDevice() && /Safari/.test(ua) && !/Chrome|Chromium|Edg\/|Firefox|OPR\//.test(ua);
}

/** iOS 描述文件入口：仅在签名证书有效期内提供（见 IOS_PROFILE_SIGNED_UNTIL）。 */
export function iosProfileAvailable(): boolean {
  return Date.now() < Date.parse(`${IOS_PROFILE_SIGNED_UNTIL}T00:00:00Z`);
}

const listeners = new Set<() => void>();
let watching = false;

function watch() {
  if (watching || typeof window === 'undefined') return;
  watching = true;
  const notify = () => listeners.forEach((l) => l());
  // 内联脚本的监听先注册、先执行；这里只负责让组件重新渲染。
  window.addEventListener('beforeinstallprompt', () => queueMicrotask(notify));
  window.addEventListener('appinstalled', () => queueMicrotask(notify));
}

function currentPath(): InstallPath {
  if (typeof window === 'undefined') return 'none';
  if (isPwaInstalled()) return 'installed';
  if (inAppBrowser()) return 'in-app';
  if ((window as InstallWindow).__ikInstall) return 'prompt';
  if (isTrueIOSSafari()) return 'ios';
  return 'none';
}

/** 这位访客此刻能怎么把网站装到桌面。 */
export function useInstallPath(): InstallPath {
  return useSyncExternalStore(
    (listener) => {
      watch();
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    currentPath,
    () => 'none',
  );
}

/** 弹出浏览器自带的安装框；用户点了「安装」返回 true。安装事件只能用一次。 */
export async function promptInstall(): Promise<boolean> {
  const event = (window as InstallWindow).__ikInstall;
  if (!event) return false;
  (window as InstallWindow).__ikInstall = null;
  try {
    await event.prompt();
    const { outcome } = await event.userChoice;
    if (outcome === 'accepted') {
      try {
        localStorage.setItem(PWA_INSTALLED_KEY, '1');
      } catch {}
    }
    return outcome === 'accepted';
  } catch {
    return false;
  } finally {
    listeners.forEach((l) => l());
  }
}
