'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

/**
 * 真实用户网页打开速度监控器 (PageSpeedMonitor)
 * 
 * 规范契约（方案第 5 节）：
 * 1. 从 performance.getEntriesByType('navigation')[0] 取首字节时间 (responseStart - activationStart)；
 * 2. 用 PerformanceObserver 监听 largest-contentful-paint (Safari/Firefox 不支持则不报)；
 * 3. 页面打开时就在后台 (visibilityState === 'hidden') 则不报 LCP；
 * 4. 在页面隐藏、pagehide 或 20 秒后，通过 sendBeacon('/api/beacon/page') 发送一次；
 * 5. 午夜特区 (/premium) 与管理后台 (/admin) 静默不上报，遵循隔离铁律。
 */
export function PageSpeedMonitor() {
  const pathname = usePathname();
  const hasReportedRef = useRef(false);

  useEffect(() => {
    // 1. 忽略管理后台与午夜特区
    if (!pathname || pathname.startsWith('/admin') || pathname.startsWith('/premium')) {
      return;
    }

    if (typeof window === 'undefined' || typeof performance === 'undefined') {
      return;
    }

    // 2. 检测页面打开时是否处于后台
    const wasInitiallyHidden = typeof document !== 'undefined' && document.visibilityState === 'hidden';

    // 3. 计算预渲染页面的 activationStart
    type NavigationTimingWithActivation = PerformanceNavigationTiming & { activationStart?: number };
    const navEntries = performance.getEntriesByType('navigation');
    const nav = (navEntries.length > 0 ? navEntries[0] : null) as NavigationTimingWithActivation | null;
    const activationStart = nav?.activationStart || 0;

    let lcpVal: number | null = null;
    let observer: PerformanceObserver | null = null;

    // 4. 仅在初始前台且浏览器支持时监听 LCP
    if (
      !wasInitiallyHidden &&
      typeof PerformanceObserver !== 'undefined' &&
      PerformanceObserver.supportedEntryTypes?.includes('largest-contentful-paint')
    ) {
      try {
        observer = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            lcpVal = Math.max(0, Math.round(lastEntry.startTime - activationStart));
          }
        });
        observer.observe({ type: 'largest-contentful-paint', buffered: true });
      } catch {
        // 忽略不支持的环境
      }
    }

    // 5. 上报函数（只上报一次）
    const sendReport = () => {
      if (hasReportedRef.current) return;
      hasReportedRef.current = true;

      try {
        if (observer) {
          observer.disconnect();
          observer = null;
        }

        // 重新获取最新的 navigation timing（首字节）
        const latestNavEntries = performance.getEntriesByType('navigation');
        const latestNav = (latestNavEntries.length > 0 ? latestNavEntries[0] : nav) as NavigationTimingWithActivation | null;
        const curActivation = latestNav?.activationStart || activationStart;
        const responseStart = latestNav?.responseStart || 0;
        const ttfb = responseStart > 0 ? Math.max(0, Math.round(responseStart - curActivation)) : 0;

        const payload: { path: string; ttfb: number; lcp?: number } = {
          path: pathname,
          ttfb: Math.min(60000, ttfb),
        };

        if (typeof lcpVal === 'number' && isFinite(lcpVal) && lcpVal >= 0) {
          payload.lcp = Math.min(60000, lcpVal);
        }

        const dataStr = JSON.stringify(payload);

        if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
          const blob = new Blob([dataStr], { type: 'application/json' });
          navigator.sendBeacon('/api/beacon/page', blob);
        } else {
          fetch('/api/beacon/page', {
            method: 'POST',
            body: dataStr,
            headers: { 'Content-Type': 'application/json' },
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // 静默处理上报异常
      }
    };

    // 6. 监听各种触发时机：visibilitychange、pagehide、20 秒兜底定时器
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        sendReport();
      }
    };

    const handlePageHide = () => {
      sendReport();
    };

    const timer = setTimeout(sendReport, 20000);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [pathname]);

  return null;
}
