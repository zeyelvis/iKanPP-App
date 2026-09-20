'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegister() {
    useEffect(() => {
        if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

        // 🚀 TBT 极速攻坚：严禁在首屏 load 事件瞬间注册抢占 CPU 与带宽
        // 延迟至首屏水合完成且浏览器进入 idle 空闲状态（3秒后）再静默注册
        const registerSW = () => {
            const execute = () => {
                navigator.serviceWorker.register('/sw.js').catch(() => {
                    // 容错忽略
                });
            };

            if ('requestIdleCallback' in window) {
                (window as unknown as { requestIdleCallback: (cb: () => void, opts?: { timeout: number }) => void })
                    .requestIdleCallback(execute, { timeout: 4000 });
            } else {
                setTimeout(execute, 2000);
            }
        };

        if (document.readyState === 'complete') {
            setTimeout(registerSW, 2500);
        } else {
            window.addEventListener('load', () => {
                setTimeout(registerSW, 2500);
            }, { once: true });
        }
    }, []);

    return null;
}
