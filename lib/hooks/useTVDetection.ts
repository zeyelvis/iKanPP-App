/**
 * useTVDetection
 * 检测用户是否在电视/机顶盒浏览器上。
 * 支持 localStorage 手动覆盖。
 */

import { useState, useEffect } from 'react';

// 真实电视/机顶盒专用 UA 关键词
const TV_USER_AGENT_PATTERNS = [
  /smart-?tv/i,
  /tizen/i,
  /webos/i,
  /firetv/i,
  /android tv/i,
  /googletv/i,
  /crkey/i,       // Chromecast
  /aftt/i,        // Amazon Fire TV Stick
  /aftm/i,        // Amazon Fire TV
  /bravia/i,      // Sony Bravia
  /netcast/i,     // LG NetCast
  /viera/i,       // Panasonic Viera
  /hbbtv/i,
  /vidaa/i,       // 海信 VIDAA
  /whale/i,       // 三星 Whale
  /mibox/i,       // 小米盒子
  /roku/i,        // Roku
  /philipstv/i,   // Philips 飞利浦
  /\b(apple|android|smart|opera|hisense|sony|tcl|lg|samsung)tv\b/i,
];

const STORAGE_KEY = 'kvideo-tv-mode';

export function useTVDetection(): boolean {
  const [isTV, setIsTV] = useState(false);

  useEffect(() => {
    // 1. 手动覆盖优先（用户在设置中切换）
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'on') {
      setIsTV(true);
      return;
    }
    if (stored === 'off') {
      setIsTV(false);
      return;
    }

    // 2. URL 参数检查 (例如 ?mode=tv 或 ?tv=1)
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('tv') === '1' || urlParams.get('mode') === 'tv') {
        setIsTV(true);
        return;
      }
    }

    // 3. 精确 UA 匹配真实电视设备
    const ua = navigator.userAgent || '';
    const uaMatch = TV_USER_AGENT_PATTERNS.some(pattern => pattern.test(ua));

    if (uaMatch) {
      setIsTV(true);
      return;
    }

    // 普通 PC / Mac 电脑正常使用现代自适应桌面布局，绝不启用 TV 模式
    setIsTV(false);
  }, []);

  return isTV;
}

/**
 * 手动设置 TV 模式（设置页面调用）
 * @param mode 'on' = 强制启用, 'off' = 强制关闭, 'auto' = 自动检测
 */
export function setTVMode(mode: 'on' | 'off' | 'auto') {
  if (mode === 'auto') {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    localStorage.setItem(STORAGE_KEY, mode);
  }
  // 刷新页面让检测生效
  window.location.reload();
}
