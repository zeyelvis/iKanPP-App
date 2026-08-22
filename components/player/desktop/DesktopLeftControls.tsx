import React from 'react';
import { Icons } from '@/components/ui/Icon';
import { DesktopVolumeControl } from './DesktopVolumeControl';

interface DesktopLeftControlsProps {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    showVolumeBar: boolean;
    volumeBarRef: React.RefObject<HTMLDivElement | null>;
    onTogglePlay: () => void;
    onToggleMute: () => void;
    onVolumeChange: (e: React.MouseEvent<HTMLDivElement>) => void;
    onVolumeMouseDown: (e: React.MouseEvent<HTMLDivElement>) => void;
    formatTime: (seconds: number) => string;
}

export function DesktopLeftControls({
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    showVolumeBar,
    volumeBarRef,
    onTogglePlay,
    onToggleMute,
    onVolumeChange,
    onVolumeMouseDown,
    formatTime
}: DesktopLeftControlsProps) {
    return (
        <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Play/Pause */}
            <button
                onClick={onTogglePlay}
                className="btn-icon"
                aria-label={isPlaying ? 'Pause' : 'Play'}
            >
                {isPlaying ? <Icons.Pause size={18} /> : <Icons.Play size={18} />}
            </button>

            {/* Volume */}
            <DesktopVolumeControl
                volumeBarRef={volumeBarRef}
                volume={volume}
                isMuted={isMuted}
                showVolumeBar={showVolumeBar}
                onToggleMute={onToggleMute}
                onVolumeChange={onVolumeChange}
                onVolumeMouseDown={onVolumeMouseDown}
            />

            {/* Time */}
            <span className="text-white text-xs sm:text-sm font-medium tabular-nums whitespace-nowrap">
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>
        </div>
    );
}
