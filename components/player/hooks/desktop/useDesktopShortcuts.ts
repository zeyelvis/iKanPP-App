import { useEffect } from 'react';

interface UseDesktopShortcutsProps {
    videoRef: React.RefObject<HTMLVideoElement | null>;
    isPlaying: boolean;
    volume: number;
    isPiPSupported: boolean;
    togglePlay: () => void;
    toggleMute: () => void;
    toggleFullscreen: () => void;
    toggleNativeFullscreen: () => void;
    toggleWindowFullscreen: () => void;
    togglePictureInPicture: () => void;
    skipForward: () => void;
    skipBackward: () => void;
    showVolumeBarTemporarily: () => void;
    setShowControls: (show: boolean) => void;
    setVolume: (volume: number) => void;
    setIsMuted: (muted: boolean) => void;
    controlsTimeoutRef: React.MutableRefObject<NodeJS.Timeout | null>;
}

export function useDesktopShortcuts({
    videoRef,
    isPlaying,
    volume,
    isPiPSupported,
    togglePlay,
    toggleMute,
    toggleFullscreen,
    toggleNativeFullscreen,
    toggleWindowFullscreen,
    togglePictureInPicture,
    skipForward,
    skipBackward,
    showVolumeBarTemporarily,
    setShowControls,
    setVolume,
    setIsMuted,
    controlsTimeoutRef,
}: UseDesktopShortcutsProps) {
    useEffect(() => {
        let isKeyDownHandled = false;
        let isFastForwarding = false;
        let originalRate = 1;
        let pressTimer: NodeJS.Timeout | null = null;

        const handleKeyDown = (e: KeyboardEvent) => {
            // Ignore shortcuts if typing in an input
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || (e.target as HTMLElement)?.isContentEditable) {
                return;
            }

            const key = e.key.toLowerCase();

            // Show controls on any key press
            setShowControls(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            if (isPlaying) {
                controlsTimeoutRef.current = setTimeout(() => {
                    setShowControls(false);
                }, 3000);
            }

            if (key === 'arrowright' || key === 'l') {
                e.preventDefault();
                if (!isKeyDownHandled) {
                    isKeyDownHandled = true;
                    pressTimer = setTimeout(() => {
                        if (videoRef.current) {
                            isFastForwarding = true;
                            originalRate = videoRef.current.playbackRate || 1;
                            videoRef.current.playbackRate = 5;
                            if (videoRef.current.paused) {
                                videoRef.current.play().catch(() => {});
                            }
                        }
                    }, 200);
                } else if (e.repeat && !isFastForwarding && videoRef.current) {
                    isFastForwarding = true;
                    originalRate = videoRef.current.playbackRate || 1;
                    videoRef.current.playbackRate = 5;
                }
                return;
            }

            switch (key) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleNativeFullscreen();
                    break;
                case 'w':
                    e.preventDefault();
                    toggleWindowFullscreen();
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'p':
                    if (isPiPSupported) {
                        e.preventDefault();
                        togglePictureInPicture();
                    }
                    break;
                case 'arrowleft':
                case 'j':
                    e.preventDefault();
                    skipBackward();
                    break;
                case 'arrowup':
                    e.preventDefault();
                    const newVolUp = Math.min(1, volume + 0.1);
                    setVolume(newVolUp);
                    if (videoRef.current) {
                        videoRef.current.volume = newVolUp;
                        videoRef.current.muted = newVolUp === 0;
                    }
                    setIsMuted(newVolUp === 0);
                    localStorage.setItem('kvideo-volume', String(newVolUp));
                    localStorage.setItem('kvideo-muted', String(newVolUp === 0));
                    showVolumeBarTemporarily();
                    break;
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    if (videoRef.current && videoRef.current.duration) {
                        e.preventDefault();
                        const percent = parseInt(e.key, 10) / 10;
                        videoRef.current.currentTime = videoRef.current.duration * percent;
                    }
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    const newVolDown = Math.max(0, volume - 0.1);
                    setVolume(newVolDown);
                    if (videoRef.current) {
                        videoRef.current.volume = newVolDown;
                        videoRef.current.muted = newVolDown === 0;
                    }
                    setIsMuted(newVolDown === 0);
                    localStorage.setItem('kvideo-volume', String(newVolDown));
                    localStorage.setItem('kvideo-muted', String(newVolDown === 0));
                    showVolumeBarTemporarily();
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            const key = e.key.toLowerCase();
            if (key === 'arrowright' || key === 'l') {
                isKeyDownHandled = false;
                if (pressTimer) {
                    clearTimeout(pressTimer);
                    pressTimer = null;
                }
                if (isFastForwarding) {
                    isFastForwarding = false;
                    if (videoRef.current) {
                        videoRef.current.playbackRate = originalRate || 1;
                    }
                } else {
                    skipForward();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (pressTimer) clearTimeout(pressTimer);
        };
    }, [
        videoRef,
        isPlaying,
        volume,
        isPiPSupported,
        togglePlay,
        toggleMute,
        toggleFullscreen,
        toggleWindowFullscreen,
        togglePictureInPicture,
        skipForward,
        skipBackward,
        showVolumeBarTemporarily,
        setShowControls,
        setVolume,
        setIsMuted,
        controlsTimeoutRef,
    ]);
}
