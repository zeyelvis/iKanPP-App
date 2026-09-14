import { useCallback, useEffect, useRef, useMemo } from 'react';

interface UseProgressControlsProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    progressBarRef: React.RefObject<HTMLDivElement | null>;
    duration: number;
    setCurrentTime: (time: number) => void;
    isDraggingProgressRef: React.MutableRefObject<boolean>;
    isRotated?: boolean;
}

export function useProgressControls({
    videoRef,
    progressBarRef,
    duration,
    setCurrentTime,
    isDraggingProgressRef,
    isRotated = false
}: UseProgressControlsProps) {
    const lastDragTimeRef = useRef<number>(0);
    const wasPlayingBeforeDragRef = useRef<boolean>(false);

    // 移动端 Touch 与 PC Mouse 互斥隔离时间戳（防止手机松手后补发 mouseup 和 click 造成 2~3 重 Seek 轰炸）
    const lastTouchEndTimeRef = useRef<number>(0);
    const lastMouseUpTimeRef = useRef<number>(0);

    // 单飞互斥 Seek 锁 (Single-Flight Seek Queue)
    // 确保同一时刻底层解码器只接受 1 个 Seek 指令；高频拖拽请求自动合并并保留最新目标时间
    const isSeekingLockRef = useRef<boolean>(false);
    const pendingSeekTargetRef = useRef<number | null>(null);

    const getEventPos = useCallback((e: any, rect: DOMRect) => {
        // Handle both mouse and touch events safely
        const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? (e.changedTouches && e.changedTouches[0]?.clientX) ?? 0;
        const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? (e.changedTouches && e.changedTouches[0]?.clientY) ?? 0;

        if (isRotated) {
            return Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        } else {
            return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        }
    }, [isRotated]);

    // 单飞 Seek 调度引擎：彻底保护底层解码器
    const executeSafeSeek = useCallback((targetTime: number, shouldResume: boolean) => {
        const video = videoRef.current;
        if (!video || !duration) return;
        const boundedTime = Math.max(0, Math.min(targetTime, duration));

        // 如果底层正在寻道中，记录为待执行的最新目标，绝不在前一个未就位时连续发起 Seek
        if (video.seeking || isSeekingLockRef.current) {
            pendingSeekTargetRef.current = boundedTime;
            return;
        }

        isSeekingLockRef.current = true;
        pendingSeekTargetRef.current = null;

        try {
            video.currentTime = boundedTime;
            if (shouldResume && video.paused) {
                video.play().catch(() => {});
            }
        } catch (err) {
            console.warn('[Progress] seek error:', err);
            isSeekingLockRef.current = false;
        }
    }, [videoRef, duration]);

    // 监听底层寻道完成事件，释放锁并执行排队的最新 Seek
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onSeekFinished = () => {
            isSeekingLockRef.current = false;
            if (pendingSeekTargetRef.current !== null) {
                const queuedTarget = pendingSeekTargetRef.current;
                pendingSeekTargetRef.current = null;
                executeSafeSeek(queuedTarget, wasPlayingBeforeDragRef.current);
            }
        };

        video.addEventListener('seeked', onSeekFinished);
        video.addEventListener('canplay', onSeekFinished);

        return () => {
            video.removeEventListener('seeked', onSeekFinished);
            video.removeEventListener('canplay', onSeekFinished);
        };
    }, [videoRef, executeSafeSeek]);

    // 独立精准跳转（用于纯 PC 鼠标点击进度条）
    const handleProgressClick = useCallback((e: any) => {
        if (e && e.stopPropagation) e.stopPropagation();
        // 手机触摸后 500ms 内，或鼠标释放后 200ms 内，坚决拦截并丢弃模拟点击事件
        if (Date.now() - lastTouchEndTimeRef.current < 500 || Date.now() - lastMouseUpTimeRef.current < 200) {
            return;
        }

        if (!videoRef.current || !progressBarRef.current || !duration) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = getEventPos(e, rect);
        const newTime = Math.max(0, Math.min(pos * duration, duration));
        
        lastDragTimeRef.current = newTime;
        setCurrentTime(newTime);
        const shouldResume = !videoRef.current.paused;
        executeSafeSeek(newTime, shouldResume);
    }, [videoRef, progressBarRef, duration, setCurrentTime, getEventPos, executeSafeSeek]);

    // PC 鼠标按下
    const handleProgressMouseDown = useCallback((e: any) => {
        if (e && e.stopPropagation) e.stopPropagation();
        // 手机触摸后 500ms 内丢弃任何鼠标模拟事件
        if (Date.now() - lastTouchEndTimeRef.current < 500) {
            return;
        }
        e.preventDefault();
        isDraggingProgressRef.current = true;
        if (videoRef.current) {
            wasPlayingBeforeDragRef.current = !videoRef.current.paused;
        }
        if (progressBarRef.current && duration) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = getEventPos(e, rect);
            const newTime = Math.max(0, Math.min(pos * duration, duration));
            lastDragTimeRef.current = newTime;
            setCurrentTime(newTime);
        }
    }, [isDraggingProgressRef, progressBarRef, duration, getEventPos, setCurrentTime, videoRef]);

    // 移动端手指触碰：仅更新 UI 视觉指示，绝不过早向底层 video 发起 seek，避免连续两次 seek 击溃解码器
    const handleProgressTouchStart = useCallback((e: any) => {
        if (e && e.stopPropagation) e.stopPropagation();
        if (e.cancelable) e.preventDefault();
        isDraggingProgressRef.current = true;
        if (videoRef.current) {
            wasPlayingBeforeDragRef.current = !videoRef.current.paused;
        }
        if (progressBarRef.current && duration) {
            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = getEventPos(e, rect);
            const newTime = Math.max(0, Math.min(pos * duration, duration));
            lastDragTimeRef.current = newTime;
            setCurrentTime(newTime);
        }
    }, [isDraggingProgressRef, progressBarRef, duration, getEventPos, setCurrentTime, videoRef]);

    useEffect(() => {
        const handleProgressMouseMove = (e: MouseEvent) => {
            if (!isDraggingProgressRef.current || !progressBarRef.current || !duration) return;
            e.preventDefault();
            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = getEventPos(e, rect);
            const newTime = Math.max(0, Math.min(pos * duration, duration));
            lastDragTimeRef.current = newTime;
            setCurrentTime(newTime);
        };

        const handleMouseUp = () => {
            if (isDraggingProgressRef.current) {
                isDraggingProgressRef.current = false;
                lastMouseUpTimeRef.current = Date.now();
                if (Date.now() - lastTouchEndTimeRef.current < 500) {
                    return;
                }
                if (videoRef.current && duration) {
                    const targetTime = Math.max(0, Math.min(lastDragTimeRef.current, duration));
                    executeSafeSeek(targetTime, wasPlayingBeforeDragRef.current);
                }
            }
        };

        const handleProgressTouchMove = (e: TouchEvent) => {
            if (!isDraggingProgressRef.current || !progressBarRef.current || !duration) return;
            if (e.cancelable) e.preventDefault();

            const rect = progressBarRef.current.getBoundingClientRect();
            const pos = getEventPos(e, rect);
            const newTime = Math.max(0, Math.min(pos * duration, duration));
            lastDragTimeRef.current = newTime;
            setCurrentTime(newTime);
        };

        const handleTouchEnd = () => {
            if (isDraggingProgressRef.current) {
                isDraggingProgressRef.current = false;
                lastTouchEndTimeRef.current = Date.now();
                if (videoRef.current && duration) {
                    const targetTime = Math.max(0, Math.min(lastDragTimeRef.current, duration));
                    executeSafeSeek(targetTime, wasPlayingBeforeDragRef.current);
                }
            }
        };

        document.addEventListener('mousemove', handleProgressMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        document.addEventListener('touchmove', handleProgressTouchMove, { passive: false });
        document.addEventListener('touchend', handleTouchEnd);
        document.addEventListener('touchcancel', handleTouchEnd);

        return () => {
            document.removeEventListener('mousemove', handleProgressMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.removeEventListener('touchmove', handleProgressTouchMove);
            document.removeEventListener('touchend', handleTouchEnd);
            document.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [duration, isDraggingProgressRef, progressBarRef, videoRef, setCurrentTime, getEventPos, executeSafeSeek]);

    const progressActions = useMemo(() => ({
        handleProgressClick,
        handleProgressMouseDown,
        handleProgressTouchStart
    }), [handleProgressClick, handleProgressMouseDown, handleProgressTouchStart]);

    return progressActions;
}
