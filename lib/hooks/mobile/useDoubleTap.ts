import { useRef, useCallback } from 'react';

interface DoubleTapHandler {
    onDoubleTapLeft: () => void;
    onDoubleTapRight: () => void;
    onSingleTap: () => void;
    onSkipContinueLeft: () => void;
    onSkipContinueRight: () => void;
    isSkipModeActive: boolean;
    onLongPressStart?: () => void;
    onLongPressEnd?: () => void;
}

/**
 * Hook for handling double-tap gestures and long-press fast forward on mobile devices
 * Divides the video into left/right zones for skip forward/backward
 */
export function useDoubleTap({
    onDoubleTapLeft,
    onDoubleTapRight,
    onSingleTap,
    onSkipContinueLeft,
    onSkipContinueRight,
    isSkipModeActive,
    onLongPressStart,
    onLongPressEnd,
}: DoubleTapHandler) {
    const lastTapRef = useRef<{ time: number; side: 'left' | 'right' | null }>({
        time: 0,
        side: null,
    });
    const singleTapTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
    const isLongPressingRef = useRef<boolean>(false);

    const handleTouchStart = useCallback((e: React.TouchEvent<HTMLVideoElement>) => {
        isLongPressingRef.current = false;
        // Start long-press timer (500ms)
        if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = setTimeout(() => {
            isLongPressingRef.current = true;
            if (singleTapTimeoutRef.current) {
                clearTimeout(singleTapTimeoutRef.current);
                singleTapTimeoutRef.current = null;
            }
            onLongPressStart?.();
            try {
                if (typeof navigator !== 'undefined' && navigator.vibrate) {
                    navigator.vibrate(30);
                }
            } catch {}
        }, 500);
    }, [onLongPressStart]);

    const handleTouchEnd = useCallback((e: React.TouchEvent<HTMLVideoElement>) => {
        // Clear long press timer
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }

        // If long press was active, end it and do not trigger tap
        if (isLongPressingRef.current) {
            isLongPressingRef.current = false;
            onLongPressEnd?.();
            return;
        }

        const currentTime = Date.now();
        const videoElement = e.currentTarget;
        const touch = e.changedTouches[0];

        if (!touch || !videoElement) return;

        // Calculate touch position relative to video element
        const rect = videoElement.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const width = rect.width;
        const side = x < width / 2 ? 'left' : 'right';

        const timeDiff = currentTime - lastTapRef.current.time;
        const sameSide = lastTapRef.current.side === side;

        // Clear any pending single tap
        if (singleTapTimeoutRef.current) {
            clearTimeout(singleTapTimeoutRef.current);
            singleTapTimeoutRef.current = null;
        }

        // If skip mode is active, single tap continues skipping
        if (isSkipModeActive) {
            if (side === 'left') {
                onSkipContinueLeft();
            } else {
                onSkipContinueRight();
            }
            lastTapRef.current = { time: currentTime, side };
            return;
        }

        // Double tap detected (within 300ms on the same side)
        if (timeDiff < 300 && sameSide) {
            if (side === 'left') {
                onDoubleTapLeft();
            } else {
                onDoubleTapRight();
            }

            // Reset to prevent triple-tap
            lastTapRef.current = { time: 0, side: null };
        } else {
            // Possible single tap - wait to see if there's a double tap
            lastTapRef.current = { time: currentTime, side };

            singleTapTimeoutRef.current = setTimeout(() => {
                onSingleTap();
                singleTapTimeoutRef.current = null;
            }, 280);
        }
    }, [
        isSkipModeActive,
        onDoubleTapLeft,
        onDoubleTapRight,
        onLongPressEnd,
        onSingleTap,
        onSkipContinueLeft,
        onSkipContinueRight,
    ]);

    const handleTouchCancel = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        if (isLongPressingRef.current) {
            isLongPressingRef.current = false;
            onLongPressEnd?.();
        }
    }, [onLongPressEnd]);

    return {
        handleTouchStart,
        handleTouchEnd,
        handleTouchCancel,
    };
}

