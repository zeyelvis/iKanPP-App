import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { FullscreenMode } from '../useDesktopPlayerState';
import {
    createAndroidPiPTransitionPlan,
    getAndroidPiPSourceRect,
    shouldRestoreInlineAfterAndroidPiP,
    shouldRollbackTemporaryWindowFullscreen,
    type AndroidPiPSessionState,
} from './android-pip-utils';

interface AndroidPiPBridge {
    isPictureInPictureSupported?: () => boolean;
    enterPictureInPicture?: (
        width: number,
        height: number,
        left: number,
        top: number,
        right: number,
        bottom: number
    ) => boolean;
}

interface AndroidPiPChangeDetail {
    inPictureInPicture?: boolean;
}

type OrientationCapableScreen = Screen & {
    orientation?: ScreenOrientation & {
        lock?: (orientation: string) => Promise<void>;
        unlock?: () => void;
    };
};

type FullscreenCapableDocument = Document & {
    webkitFullscreenElement?: Element | null;
    mozFullScreenElement?: Element | null;
    msFullscreenElement?: Element | null;
    webkitExitFullscreen?: () => Promise<void>;
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    pictureInPictureEnabled?: boolean;
    pictureInPictureElement?: Element | null;
    exitPictureInPicture?: () => Promise<void>;
};

type FullscreenCapableElement = HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    msRequestFullscreen?: () => Promise<void>;
};

type PiPCapableVideoElement = HTMLVideoElement & {
    webkitEnterFullscreen?: () => void;
    webkitExitFullscreen?: () => void;
    webkitDisplayingFullscreen?: boolean;
    webkitSupportsFullscreen?: boolean;
    webkitSupportsPresentationMode?: (mode: 'picture-in-picture') => boolean;
    webkitPresentationMode?: 'inline' | 'picture-in-picture' | string;
    webkitSetPresentationMode?: (mode: 'inline' | 'picture-in-picture') => void;
    webkitShowPlaybackTargetPicker?: () => void;
};

function isAppleTouchDevice(): boolean {
    if (typeof navigator === 'undefined' || typeof window === 'undefined') return false;
    const isIOSUserAgent = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isIPadOS = (navigator.platform === 'MacIntel' || /Macintosh/i.test(navigator.userAgent)) &&
        navigator.maxTouchPoints > 1 &&
        'ontouchstart' in window &&
        (window.matchMedia?.('(pointer: coarse)')?.matches ?? false);
    return isIOSUserAgent || isIPadOS;
}

function getFullscreenDocument(): FullscreenCapableDocument {
    return document as FullscreenCapableDocument;
}

function waitForAnimationFrame(): Promise<void> {
    return new Promise((resolve) => {
        window.requestAnimationFrame(() => resolve());
    });
}

async function waitForWindowFullscreenLayout(): Promise<void> {
    await waitForAnimationFrame();
    await waitForAnimationFrame();
}

interface UseFullscreenControlsProps {
    containerRef: React.RefObject<HTMLDivElement | null>;
    videoRef: React.RefObject<HTMLVideoElement | null>;
    setIsFullscreen: (fullscreen: boolean) => void;
    fullscreenMode: FullscreenMode;
    setFullscreenMode: (mode: FullscreenMode) => void;
    isPiPSupported: boolean;
    isAirPlaySupported: boolean;
    setIsPiPSupported: (supported: boolean) => void;
    setIsAirPlaySupported: (supported: boolean) => void;
    fullscreenType?: 'native' | 'window';
}

export function useFullscreenControls({
    containerRef,
    videoRef,
    setIsFullscreen,
    fullscreenMode,
    setFullscreenMode,
    isPiPSupported,
    isAirPlaySupported,
    setIsPiPSupported,
    setIsAirPlaySupported,
    fullscreenType = 'native'
}: UseFullscreenControlsProps) {
    const androidPiPSessionRef = useRef<AndroidPiPSessionState | null>(null);

    const lockLandscape = useCallback(async () => {
        const orientation = (window.screen as OrientationCapableScreen).orientation;
        if (orientation?.lock) {
            try {
                await orientation.lock('landscape');
            } catch (error) {
                console.warn('Orientation lock failed:', error);
            }
        }
    }, []);

    const unlockOrientation = useCallback(() => {
        const orientation = (window.screen as OrientationCapableScreen).orientation;
        if (orientation?.unlock) {
            try {
                orientation.unlock();
            } catch {
                // Ignore unlock errors from unsupported browsers.
            }
        }
    }, []);

    const getNativeFullscreenElement = useCallback(() => {
        const fullscreenDocument = getFullscreenDocument();
        return (
            fullscreenDocument.fullscreenElement ||
            fullscreenDocument.webkitFullscreenElement ||
            (fullscreenDocument as any).webkitCurrentFullScreenElement ||
            fullscreenDocument.mozFullScreenElement ||
            fullscreenDocument.msFullscreenElement
        );
    }, []);

    const getAndroidPiPBridge = useCallback((): AndroidPiPBridge | null => {
        if (typeof window === 'undefined') return null;

        const bridge = (window as Window & { KVideoAndroid?: AndroidPiPBridge }).KVideoAndroid;
        if (!bridge) return null;

        return bridge;
    }, []);

    useEffect(() => {
        if (typeof document !== 'undefined') {
            const fullscreenDocument = getFullscreenDocument();
            const video = videoRef.current as PiPCapableVideoElement | null;
            const hasNativePiP = Boolean(fullscreenDocument.pictureInPictureEnabled);
            const hasWebkitPiP = Boolean(video && (
                typeof video.webkitSupportsPresentationMode === 'function' ||
                typeof video.webkitPresentationMode === 'string'
            ));
            const androidBridge = getAndroidPiPBridge();
            const hasAndroidPiPBridge = Boolean(androidBridge?.isPictureInPictureSupported?.());
            setIsPiPSupported(hasNativePiP || !!hasWebkitPiP || hasAndroidPiPBridge);
        }
        if (typeof window !== 'undefined') {
            setIsAirPlaySupported('WebKitPlaybackTargetAvailabilityEvent' in window);
        }
    }, [getAndroidPiPBridge, setIsPiPSupported, setIsAirPlaySupported, videoRef]);

    const exitNativeFullscreen = useCallback(async () => {
        const fullscreenDocument = getFullscreenDocument();
        const video = videoRef.current as PiPCapableVideoElement | null;

        try {
            if (fullscreenDocument.exitFullscreen) {
                await fullscreenDocument.exitFullscreen();
            } else if (fullscreenDocument.webkitExitFullscreen) {
                await fullscreenDocument.webkitExitFullscreen();
            } else if ((fullscreenDocument as any).webkitCancelFullScreen) {
                await (fullscreenDocument as any).webkitCancelFullScreen();
            } else if (fullscreenDocument.mozCancelFullScreen) {
                await fullscreenDocument.mozCancelFullScreen();
            } else if (fullscreenDocument.msExitFullscreen) {
                await fullscreenDocument.msExitFullscreen();
            }
            if (video && typeof video.webkitExitFullscreen === 'function') {
                video.webkitExitFullscreen();
            }
        } catch (error) {
            console.error('Failed to exit fullscreen:', error);
        } finally {
            unlockOrientation();
            setIsFullscreen(false);
            setFullscreenMode('none');
        }
    }, [setFullscreenMode, setIsFullscreen, unlockOrientation, videoRef]);

    const exitWindowFullscreen = useCallback(() => {
        unlockOrientation();
        setIsFullscreen(false);
        setFullscreenMode('none');
    }, [setFullscreenMode, setIsFullscreen, unlockOrientation]);

    const enterWindowFullscreen = useCallback(async () => {
        if (fullscreenMode === 'native') {
            await exitNativeFullscreen();
        }

        setFullscreenMode('window');
        setIsFullscreen(true);
        await lockLandscape();
    }, [exitNativeFullscreen, fullscreenMode, lockLandscape, setFullscreenMode, setIsFullscreen]);

    const enterNativeFullscreen = useCallback(async () => {
        const container = containerRef.current as FullscreenCapableElement | null;
        const video = videoRef.current as PiPCapableVideoElement | null;

        // 阶段一：仅在不支持 DOM 元素全屏的狭小 iPhone 移动端，才尝试 video 原生全屏
        const isIPhoneOnly = typeof navigator !== 'undefined' && /iPhone|iPod/i.test(navigator.userAgent);
        if (isIPhoneOnly && video && typeof video.webkitEnterFullscreen === 'function') {
            try {
                video.webkitEnterFullscreen();
                setFullscreenMode('native');
                setIsFullscreen(true);
                await lockLandscape();
                return;
            } catch (appleErr) {
                console.warn('video.webkitEnterFullscreen failed on iPhone, trying container:', appleErr);
            }
        }

        // 阶段二：尝试容器 DOM 元素全屏 (桌面端 macOS / Windows / Linux 及 iPadOS 标准浏览器)
        // 核心准则：全屏目标必须且只能是播放器外层容器 container，绝不可回退到 docEl（导致全屏伪类失效与黑屏）
        // 或裸全屏 video（导致自定义控制栏与所有 UI 彻底脱落）。
        if (container) {
            try {
                // 1. 标准 W3C requestFullscreen
                if (typeof container.requestFullscreen === 'function') {
                    await container.requestFullscreen();
                    setFullscreenMode('native');
                    setIsFullscreen(true);
                    await lockLandscape();
                    return;
                }
                // 2. WebKit (macOS Safari & 旧版 Chrome) 兼容两种大小写
                if (typeof (container as any).webkitRequestFullscreen === 'function') {
                    await (container as any).webkitRequestFullscreen();
                    setFullscreenMode('native');
                    setIsFullscreen(true);
                    await lockLandscape();
                    return;
                }
                if (typeof (container as any).webkitRequestFullScreen === 'function') {
                    await (container as any).webkitRequestFullScreen();
                    setFullscreenMode('native');
                    setIsFullscreen(true);
                    await lockLandscape();
                    return;
                }
                // 3. Firefox
                if (typeof (container as any).mozRequestFullScreen === 'function') {
                    await (container as any).mozRequestFullScreen();
                    setFullscreenMode('native');
                    setIsFullscreen(true);
                    await lockLandscape();
                    return;
                }
                // 4. IE / Edge Legacy
                if (typeof (container as any).msRequestFullscreen === 'function') {
                    await (container as any).msRequestFullscreen();
                    setFullscreenMode('native');
                    setIsFullscreen(true);
                    await lockLandscape();
                    return;
                }
            } catch (err) {
                console.warn('Attempt to enter native fullscreen on player container failed:', err);
            }
        }

        // 阶段三：终极自愈降级 (Fail-safe Fallback)
        // 当系统或浏览器安全策略拒绝任何原生全屏调用时，100% 毫秒级自愈降级为网页全屏 (Window Fullscreen)
        console.info('Native fullscreen unavailable or rejected, seamlessly falling back to window fullscreen.');
        await enterWindowFullscreen();
    }, [
        containerRef,
        enterWindowFullscreen,
        lockLandscape,
        setFullscreenMode,
        setIsFullscreen,
        videoRef,
    ]);

    const requestAndroidPictureInPicture = useCallback(async () => {
        const bridge = getAndroidPiPBridge();
        const video = videoRef.current;
        if (!bridge || !video || typeof bridge.enterPictureInPicture !== 'function') {
            return false;
        }

        const plan = createAndroidPiPTransitionPlan(fullscreenMode);
        const session: AndroidPiPSessionState = {
            enteredTemporaryWindowFullscreen: plan.enterTemporaryWindowFullscreen,
            restoreInlineOnExit: plan.restoreInlineOnExit,
        };

        try {
            if (plan.enterTemporaryWindowFullscreen) {
                await enterWindowFullscreen();
                await waitForWindowFullscreenLayout();
            }

            const width = video.videoWidth || containerRef.current?.clientWidth || 16;
            const height = video.videoHeight || containerRef.current?.clientHeight || 9;
            const sourceRect = getAndroidPiPSourceRect(containerRef.current);

            androidPiPSessionRef.current = session;

            const didEnterPiP = bridge.enterPictureInPicture(
                width,
                height,
                sourceRect?.left ?? 0,
                sourceRect?.top ?? 0,
                sourceRect?.right ?? 0,
                sourceRect?.bottom ?? 0
            ) !== false;

            if (!didEnterPiP) {
                if (shouldRollbackTemporaryWindowFullscreen(session)) {
                    exitWindowFullscreen();
                }
                androidPiPSessionRef.current = null;
            }

            return didEnterPiP;
        } catch (error) {
            if (shouldRollbackTemporaryWindowFullscreen(session)) {
                exitWindowFullscreen();
            }
            androidPiPSessionRef.current = null;
            console.error('Android Picture-in-Picture bridge failed:', error);
            return false;
        }
    }, [
        containerRef,
        enterWindowFullscreen,
        exitWindowFullscreen,
        fullscreenMode,
        getAndroidPiPBridge,
        videoRef,
    ]);

    const toggleWindowFullscreen = useCallback(async () => {
        if (fullscreenMode === 'window') {
            exitWindowFullscreen();
            return;
        }

        await enterWindowFullscreen();
    }, [enterWindowFullscreen, exitWindowFullscreen, fullscreenMode]);

    const toggleNativeFullscreen = useCallback(async () => {
        const fullscreenDocument = getFullscreenDocument();
        const video = videoRef.current as PiPCapableVideoElement | null;
        const isCurrentlyNative = Boolean(
            fullscreenDocument.fullscreenElement ||
            fullscreenDocument.webkitFullscreenElement ||
            fullscreenDocument.mozFullScreenElement ||
            fullscreenDocument.msFullscreenElement ||
            video?.webkitDisplayingFullscreen
        );

        if (isCurrentlyNative || fullscreenMode === 'native') {
            await exitNativeFullscreen();
            return;
        }

        // 如果之前在网页全屏状态，直接升级为物理真全屏
        if (fullscreenMode === 'window') {
            exitWindowFullscreen();
        }

        await enterNativeFullscreen();
    }, [enterNativeFullscreen, exitNativeFullscreen, exitWindowFullscreen, fullscreenMode, videoRef]);

    const toggleFullscreen = useCallback(async () => {
        if (fullscreenType === 'window') {
            await toggleWindowFullscreen();
        } else {
            await toggleNativeFullscreen();
        }
    }, [fullscreenType, toggleNativeFullscreen, toggleWindowFullscreen]);

    useEffect(() => {
        const video = videoRef.current as PiPCapableVideoElement | null;

        const handleFullscreenChange = () => {
            const nativeFullscreenElement = getNativeFullscreenElement();
            const isWebkitVideoFullscreen = Boolean(video?.webkitDisplayingFullscreen);

            if (nativeFullscreenElement || isWebkitVideoFullscreen) {
                setIsFullscreen(true);
                setFullscreenMode('native');
                lockLandscape().catch(() => { });

                // 🛡️ 全屏硬件直通层安全防线 (Hardware Overlay Backdrop-Filter Purge)
                // 主动遍历全屏容器内所有 DOM 元素，物理清除任何残留的 backdrop-filter
                // 防止 CSS 层叠优先级在某些浏览器中因 @supports / Tailwind v4 @layer 竞争失效
                // 导致 GPU Back-buffer 反向显存读取死锁 → 视频黑屏有声音
                const fsContainer = nativeFullscreenElement || containerRef?.current;
                if (fsContainer) {
                    requestAnimationFrame(() => {
                        try {
                            const allElements = fsContainer.querySelectorAll('*');
                            allElements.forEach((el: Element) => {
                                const htmlEl = el as HTMLElement;
                                if (htmlEl.style) {
                                    htmlEl.style.backdropFilter = 'none';
                                    (htmlEl.style as any).webkitBackdropFilter = 'none';
                                }
                            });
                        } catch {}
                    });
                }

                // 彻底杜绝 3D Transform 导致的 Chromium / WebKit 硬件叠加层丢帧黑屏：确保 video 保持原生 transform: none
                if (videoRef.current) {
                    videoRef.current.style.transform = 'none';
                    (videoRef.current.style as any).webkitTransform = 'none';

                    // 显卡硬件表面零开销安全握手 (Hardware Overlay Compositor Wakeup)
                    // 解决 macOS Metal / CoreAnimation 在 Space 切换动画完成后未能及时 SwapBuffers 导致黑屏有声音的硬件挂起问题
                    // 采用 W3C 原生 requestVideoFrameCallback，零同步重排 (0 reflow)，唤醒显卡提交视频解码帧
                    if ('requestVideoFrameCallback' in videoRef.current && typeof (videoRef.current as any).requestVideoFrameCallback === 'function') {
                        (videoRef.current as any).requestVideoFrameCallback(() => {});
                    }

                    // 纯 Compositor 线程轻量标记脏图层，安全恢复首帧视频表面
                    window.requestAnimationFrame(() => {
                        if (videoRef.current && !videoRef.current.paused) {
                            videoRef.current.style.opacity = '0.999';
                            window.requestAnimationFrame(() => {
                                if (videoRef.current) {
                                    videoRef.current.style.opacity = '1';
                                }
                            });
                        }
                    });
                }
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new MouseEvent('mousemove', { bubbles: true }));
                }
                return;
            }

            if (fullscreenMode === 'native') {
                unlockOrientation();
                setIsFullscreen(false);
                setFullscreenMode('none');
                if (videoRef.current) {
                    videoRef.current.style.transform = 'none';
                    (videoRef.current.style as any).webkitTransform = 'none';
                    videoRef.current.style.opacity = '1';
                }
            }
        };

        const handleVideoBeginFullscreen = () => {
            setIsFullscreen(true);
            setFullscreenMode('native');
            lockLandscape().catch(() => { });
        };

        const handleVideoEndFullscreen = () => {
            unlockOrientation();
            setIsFullscreen(false);
            setFullscreenMode('none');
        };

        const handleEnterPiP = () => {
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('kvideo-pip-active'));
            }
        };

        const handlePresentationModeChange = () => {
            if (video?.webkitPresentationMode === 'picture-in-picture') {
                handleEnterPiP();
            }
        };

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);

        if (video) {
            video.addEventListener('webkitbeginfullscreen', handleVideoBeginFullscreen);
            video.addEventListener('webkitendfullscreen', handleVideoEndFullscreen);
            video.addEventListener('enterpictureinpicture', handleEnterPiP);
            video.addEventListener('webkitpresentationmodechanged', handlePresentationModeChange);
        }

        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
            if (video) {
                video.removeEventListener('webkitbeginfullscreen', handleVideoBeginFullscreen);
                video.removeEventListener('webkitendfullscreen', handleVideoEndFullscreen);
                video.removeEventListener('enterpictureinpicture', handleEnterPiP);
                video.removeEventListener('webkitpresentationmodechanged', handlePresentationModeChange);
            }
        };
    }, [fullscreenMode, getNativeFullscreenElement, lockLandscape, setFullscreenMode, setIsFullscreen, unlockOrientation, videoRef]);

    useEffect(() => {
        if (fullscreenMode !== 'window') return;

        const previousOverflow = document.body.style.overflow;
        const previousOverscroll = document.body.style.overscrollBehavior;

        document.body.style.overflow = 'hidden';
        document.body.style.overscrollBehavior = 'contain';

        return () => {
            document.body.style.overflow = previousOverflow;
            document.body.style.overscrollBehavior = previousOverscroll;
        };
    }, [fullscreenMode]);

    useEffect(() => {
        if (fullscreenMode !== 'window') return;

        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                exitWindowFullscreen();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [exitWindowFullscreen, fullscreenMode]);

    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleAndroidPiPChange = (event: Event) => {
            const detail = (event as CustomEvent<AndroidPiPChangeDetail>).detail;
            const inPictureInPicture = Boolean(detail?.inPictureInPicture);

            if (shouldRestoreInlineAfterAndroidPiP(androidPiPSessionRef.current, inPictureInPicture)) {
                exitWindowFullscreen();
            }

            if (!inPictureInPicture) {
                androidPiPSessionRef.current = null;
            }
        };

        window.addEventListener('kvideo-android-pip-change', handleAndroidPiPChange);
        return () => window.removeEventListener('kvideo-android-pip-change', handleAndroidPiPChange);
    }, [exitWindowFullscreen]);

    const togglePictureInPicture = useCallback(async () => {
        if (!videoRef.current || !isPiPSupported) return;
        const video = videoRef.current as PiPCapableVideoElement;
        const fullscreenDocument = getFullscreenDocument();
        try {
            if (fullscreenDocument.pictureInPictureElement && fullscreenDocument.exitPictureInPicture) {
                await fullscreenDocument.exitPictureInPicture();
            } else if (video.webkitPresentationMode === 'picture-in-picture') {
                video.webkitSetPresentationMode?.('inline');
            } else if (video.requestPictureInPicture && fullscreenDocument.pictureInPictureEnabled) {
                await video.requestPictureInPicture();
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('kvideo-pip-active'));
                }
            } else if (await requestAndroidPictureInPicture()) {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('kvideo-pip-active'));
                }
                return;
            } else if (
                video.webkitSupportsPresentationMode?.('picture-in-picture') &&
                video.webkitSetPresentationMode
            ) {
                video.webkitSetPresentationMode('picture-in-picture');
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('kvideo-pip-active'));
                }
            }
        } catch (error) {
            if (await requestAndroidPictureInPicture()) {
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('kvideo-pip-active'));
                }
                return;
            }
            console.error('Failed to toggle Picture-in-Picture:', error);
        }
    }, [isPiPSupported, requestAndroidPictureInPicture, videoRef]);

    const showAirPlayMenu = useCallback(() => {
        if (!videoRef.current || !isAirPlaySupported) return;
        const video = videoRef.current as PiPCapableVideoElement;
        if (video.webkitShowPlaybackTargetPicker) {
            video.webkitShowPlaybackTargetPicker();
        }
    }, [videoRef, isAirPlaySupported]);

    const fullscreenActions = useMemo(() => ({
        toggleFullscreen,
        toggleNativeFullscreen,
        toggleWindowFullscreen,
        togglePictureInPicture,
        showAirPlayMenu
    }), [
        toggleFullscreen,
        toggleNativeFullscreen,
        toggleWindowFullscreen,
        togglePictureInPicture,
        showAirPlayMenu
    ]);

    return fullscreenActions;
}
