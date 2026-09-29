/**
 * PWA 桌面安装与留存辅助模块
 * 
 * 规范契约（方案第 6 节）：
 * 1. 时机：用户看过第 2 集之后才主动弹出（播放器出第一帧时计数），而不是一打开网站就弹；
 * 2. 免打扰：点「以后再说」/关闭后 14 天内不再主动弹；
 * 3. 独立窗口 (display-mode: standalone) 彻底静默不再提示；
 * 4. 浏览器精准识别：只在 iOS 原生 Safari 显示 iOS 步骤，其他第三方 iOS 浏览器不显示；
 * 5. iOS 26 专属措辞对齐。
 */

const WATCHED_EPISODES_KEY = 'ikanpp_watched_episodes_count';
const DISMISSED_AT_KEY = 'ikanpp_pwa_dismissed_at';
const DISMISSED_DURATION_MS = 14 * 24 * 60 * 60 * 1000; // 14 天

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
 * 判断是否为真正的 iOS 原生 Safari 浏览器
 * 
 * 规范铁律：
 * 排除非 Safari 的 iOS 浏览器（UA 含 CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|Baidu|UCBrowser|MQQBrowser|Quark），
 * 以及微信、QQ 等 App 内置 Webview。
 */
export function isTrueIOSSafari(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (!isIOS) return false;

  // 1. 排除各类第三方 iOS 独立浏览器
  const isOtherIosBrowser = /CriOS|FxiOS|EdgiOS|OPiOS|YaBrowser|Baidu|UCBrowser|MQQBrowser|Quark/i.test(ua);
  if (isOtherIosBrowser) return false;

  // 2. 排除主流 App 内置 WebView
  const isInApp = /MicroMessenger|QQ\/|Weibo|DingTalk|Alipay|Bytedance|XiaoHongShu/i.test(ua);
  if (isInApp) return false;

  // 3. 必须包含 Safari 特征
  return /Safari/i.test(ua);
}

/**
 * 判断是否为 iOS 设备（无论何种浏览器）
 */
export function isIOSDevice(): boolean {
  if (typeof window === 'undefined') return false;
  const ua = window.navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}
