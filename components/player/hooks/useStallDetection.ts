'use client';

import { useEffect, useRef } from 'react';

interface UseStallDetectionProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isPlaying: boolean;
    isDraggingProgressRef: React.MutableRefObject<boolean>;
    setIsLoading: (loading: boolean) => void;
    isTransitioningToNextEpisode: boolean;
}

/**
 * 工业级视频卡死检测与自愈 Hook
 * - 针对拉动进度条（Seek）具备智能豁免期，彻底解决手机端拉动进度条卡死的问题
 * - 检测阈值科学平滑，避免网络正常加载时的误报
 * - 遇到极端卡死，自动微调推进（Nudge）救活解码器
 */
export function useStallDetection({
    videoRef,
    isPlaying,
    isDraggingProgressRef,
    setIsLoading,
    isTransitioningToNextEpisode
}: UseStallDetectionProps) {
    const lastTimeRef = useRef<number>(0);
    const lastUpdateTimeRef = useRef<number>(Date.now());
    const isStalledByMeRef = useRef<boolean>(false);
    const isSeekingRef = useRef<boolean>(false);
    const lastSeekTimeRef = useRef<number>(0);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onSeeking = () => {
            isSeekingRef.current = true;
            lastSeekTimeRef.current = Date.now();
            lastUpdateTimeRef.current = Date.now();
        };

        const onSeeked = () => {
            isSeekingRef.current = false;
            lastSeekTimeRef.current = Date.now();
            lastUpdateTimeRef.current = Date.now();
            lastTimeRef.current = video.currentTime;
            if (isStalledByMeRef.current) {
                setIsLoading(false);
                isStalledByMeRef.current = false;
            }
        };

        video.addEventListener('seeking', onSeeking);
        video.addEventListener('seeked', onSeeked);

        const checkStall = () => {
            if (!videoRef.current) return;

            const isVideoPaused = videoRef.current.paused;
            const currentTime = videoRef.current.currentTime;
            const now = Date.now();

            // 如果正在拖动进度条、刚 seek 后的 1.5 秒缓冲期内、或正在切换集数，均处于合法缓冲保护期
            const isSeekGracePeriod = isSeekingRef.current || (now - lastSeekTimeRef.current < 1500);

            if (isPlaying && !isVideoPaused && !isDraggingProgressRef.current && !isSeekGracePeriod && !isTransitioningToNextEpisode) {
                if (currentTime !== lastTimeRef.current) {
                    // 时间正常推进，重置状态
                    if (isStalledByMeRef.current) {
                        setIsLoading(false);
                        isStalledByMeRef.current = false;
                    }
                    lastTimeRef.current = currentTime;
                    lastUpdateTimeRef.current = now;
                } else {
                    // 时间停滞，判断停滞时长（科学平滑阈值 2200ms，常规切片下载不误判）
                    const stallDuration = now - lastUpdateTimeRef.current;
                    if (stallDuration > 2200) {
                        setIsLoading(true);
                        isStalledByMeRef.current = true;

                        // 极端停滞保护：若卡死超过 3.5 秒且非用户暂停，轻微微调 0.1 秒跳过坏帧自愈
                        if (stallDuration > 3500 && stallDuration < 4000) {
                            try {
                                console.info('[StallDetection] Auto nudging video forward 0.1s to recover playback');
                                videoRef.current.currentTime += 0.1;
                                lastUpdateTimeRef.current = now;
                            } catch (e) {
                                console.warn('[StallDetection] Nudge failed:', e);
                            }
                        }
                    }
                }
            } else {
                // 处于暂停、拖动或 Seek 宽限期内，重置追踪基准
                lastTimeRef.current = currentTime;
                lastUpdateTimeRef.current = now;
                if (isStalledByMeRef.current && !isSeekingRef.current) {
                    setIsLoading(false);
                    isStalledByMeRef.current = false;
                }
            }
        };

        const interval = setInterval(checkStall, 250);

        return () => {
            clearInterval(interval);
            video.removeEventListener('seeking', onSeeking);
            video.removeEventListener('seeked', onSeeked);
            if (isStalledByMeRef.current) {
                setIsLoading(false);
                isStalledByMeRef.current = false;
            }
        };
    }, [isPlaying, videoRef, isDraggingProgressRef, setIsLoading, isTransitioningToNextEpisode]);
}
