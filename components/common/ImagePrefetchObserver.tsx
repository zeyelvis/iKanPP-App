'use client';

import { useEffect } from 'react';

/**
 * 全局超视口预测加载调度器 (ImagePrefetchObserver)
 * 
 * 原理：
 * 1. 监控页面内标记有 data-prefetch-src 的元素或滚动视口
 * 2. rootMargin=600px：在元素进入视口前提前 600 像素触发探测
 * 3. requestIdleCallback：在浏览器帧空闲时执行 Image 预热，绝不挤占主线程与正片播放带宽
 * 4. 并发控制：最多并发 3 个预取任务，平滑拉取
 */
export function ImagePrefetchObserver() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    let observer: IntersectionObserver | null = null;
    const prefetchQueue: string[] = [];
    let isProcessing = false;

    // 🚀 LCP & TBT 极速攻坚：推迟 2 秒再启动超视口预热，把首屏带宽 100% 留给 Hero 首图
    const timer = setTimeout(() => {
      const processQueue = () => {
        if (prefetchQueue.length === 0) {
          isProcessing = false;
          return;
        }

        isProcessing = true;
        const url = prefetchQueue.shift();
        if (!url) {
          processQueue();
          return;
        }

        const schedule = window.requestIdleCallback || ((cb) => setTimeout(cb, 150));
        schedule(() => {
          const img = new Image();
          img.decoding = 'async';
          img.src = url;
          img.onload = () => {
            setTimeout(processQueue, 80); // 间隔 80ms 平滑处理下一个
          };
          img.onerror = () => {
            setTimeout(processQueue, 80);
          };
        });
      };

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const el = entry.target as HTMLElement;
              const src = el.getAttribute('data-prefetch-src') || el.getAttribute('data-src');
              if (src && !prefetchQueue.includes(src)) {
                prefetchQueue.push(src);
                if (!isProcessing) {
                  processQueue();
                }
              }
              observer?.unobserve(el);
            }
          });
        },
        {
          rootMargin: '300px 0px', // 精准缩减至提前 300 像素，避免超远预热
          threshold: 0.01,
        }
      );

      // 扫描页面所有待加载卡片
      const elements = document.querySelectorAll('[data-prefetch-src]');
      elements.forEach((el) => observer?.observe(el));
    }, 2000);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, []);

  return null;
}
