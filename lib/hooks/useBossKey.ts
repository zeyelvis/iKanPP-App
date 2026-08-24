'use client';

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface UseBossKeyOptions {
  redirectUrl?: string;
  enabled?: boolean;
}

/**
 * 午夜版专属一键防尴尬「老板键 (Boss Key)」
 * 
 * 触发方式：
 * 1. 键盘按下 `Esc` 或 `b` / `B` 键
 * 2. 连续快速轻击屏幕 3 次 (移动端手势)
 * 3. 点击「隐私伪装」悬浮按钮
 * 
 * 效果：瞬间静音所有音频，并在 0.05 秒内平滑跳转到普通电影/电视剧主页
 */
export function useBossKey({ redirectUrl = '/movie', enabled = true }: UseBossKeyOptions = {}) {
  const router = useRouter();

  const triggerBossKey = useCallback(() => {
    if (!enabled) return;

    // 1. 瞬间全局静音所有可能正在播放的 audio/video
    try {
      const mediaElements = document.querySelectorAll<HTMLMediaElement>('video, audio');
      mediaElements.forEach(el => {
        el.pause();
        el.muted = true;
      });
    } catch {
      // 忽略可能存在的 DOM 操作限制
    }

    // 2. 0.05 秒极速伪装重定向至普通电影主页
    router.replace(redirectUrl);
  }, [enabled, redirectUrl, router]);

  useEffect(() => {
    if (!enabled) return;

    // 键盘监听 (Esc 或 B 键)
    const handleKeyDown = (e: KeyboardEvent) => {
      // 如果正在输入框中打字，不触发
      const target = e.target as HTMLElement;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA' || target?.isContentEditable) {
        return;
      }

      if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        triggerBossKey();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, triggerBossKey]);

  return {
    triggerBossKey,
  };
}
