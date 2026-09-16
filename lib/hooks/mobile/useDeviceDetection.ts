import { useState, useEffect } from 'react';

/**
 * 检测是否为真正的 iPadOS 触控设备（排查带多点触控板的桌面 MacBook）
 */
function checkIsIPadOS(): boolean {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
    // 带有多点触控并且主指针为粗触控（触摸屏），排除主指针为 fine（鼠标/Mac触控板）的桌面 Mac
    const isMacPlatform = navigator.platform === 'MacIntel' || /Macintosh/i.test(navigator.userAgent);
    const hasTouchPoints = navigator.maxTouchPoints > 1;
    const hasTouchScreen = 'ontouchstart' in window;
    const isCoarsePointer = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;

    // 只有同时具备触摸屏特性且主输入为粗触控/非传统桌面的，才是真正的 iPadOS
    return isMacPlatform && hasTouchPoints && hasTouchScreen && isCoarsePointer;
}

/**
 * Hook to detect if the device is mobile
 */
export function useIsMobile() {
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const isIPad = checkIsIPadOS();
            const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ) || isIPad || (window.innerWidth < 768 && window.matchMedia?.('(pointer: coarse)')?.matches);
            setIsMobile(Boolean(mobile));
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    return isMobile;
}

/**
 * Hook to detect if the device is iOS (including iPadOS)
 */
export function useIsIOS() {
    const [isIOS, setIsIOS] = useState(false);

    useEffect(() => {
        const checkIOS = () => {
            const isIPad = checkIsIPadOS();
            const ios = (/iPad|iPhone|iPod/.test(navigator.userAgent) || isIPad) && !(window as any).MSStream;
            setIsIOS(Boolean(ios));
        };

        checkIOS();
    }, []);

    return isIOS;
}
