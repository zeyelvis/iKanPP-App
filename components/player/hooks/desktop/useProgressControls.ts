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

    const getEventPos = useCallback((e: any, rect: DOMRect) => {
        // Handle both mouse and touch events
        const clientX = e.clientX ?? (e.touches && e.touches[0]?.clientX) ?? 0;
        const clientY = e.clientY ?? (e.touches && e.touches[0]?.clientY) ?? 0;

        if (isRotated) {
            return Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        } else {
            return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        }
    }, [isRotated]);

    // 独立精准跳转（用于纯点击进度条）
    const handleProgressClick = useCallback((e: any) => {
        if (!videoRef.current || !progressBarRef.current || !duration) return;
        const rect = progressBarRef.current.getBoundingClientRect();
        const pos = getEventPos(e, rect);
        const newTime = Math.max(0, Math.min(pos * duration, duration));
        
        try {
            videoRef.current.currentTime = newTime;
        } catch (err) {
            console.warn('[Progress] seek error:', err);
        }
        lastDragTimeRef.current = newTime;
        setCurrentTime(newTime);
    }, [videoRef, progressBarRef, duration, setCurrentTime, getEventPos]);

    // PC 鼠标按下
    const handleProgressMouseDown = useCallback((e: any) => {
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
                if (videoRef.current && duration) {
                    const targetTime = Math.max(0, Math.min(lastDragTimeRef.current, duration));
                    try {
                        videoRef.current.currentTime = targetTime;
                        if (wasPlayingBeforeDragRef.current && videoRef.current.paused) {
                            videoRef.current.play().catch(() => {});
                        }
                    } catch (err) {
                        console.warn('[Progress] seek on mouseup error:', err);
                    }
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
                if (videoRef.current && duration) {
                    const targetTime = Math.max(0, Math.min(lastDragTimeRef.current, duration));
                    try {
                        videoRef.current.currentTime = targetTime;
                        // 移动端关键恢复：如果之前处于播放状态，seek 完毕后确保唤醒播放
                        if (wasPlayingBeforeDragRef.current && videoRef.current.paused) {
                            videoRef.current.play().catch(() => {});
                        }
                    } catch (err) {
                        console.warn('[Progress] seek on touchend error:', err);
                    }
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
    }, [duration, isDraggingProgressRef, progressBarRef, videoRef, setCurrentTime, getEventPos]);

    const progressActions = useMemo(() => ({
        handleProgressClick,
        handleProgressMouseDown,
        handleProgressTouchStart
    }), [handleProgressClick, handleProgressMouseDown, handleProgressTouchStart]);

    return progressActions;
}
