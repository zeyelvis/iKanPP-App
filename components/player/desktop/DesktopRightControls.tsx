import React from 'react';
import { Icons } from '@/components/ui/Icon';



interface DesktopRightControlsProps {
    isFullscreen: boolean;
    isPiPSupported: boolean;
    isAirPlaySupported: boolean;
    isCastAvailable: boolean;
    isProxied?: boolean;
    onToggleFullscreen: () => void;
    onTogglePictureInPicture: () => void;
    onShowAirPlayMenu: () => void;
    onShowCastMenu: () => void;
}

export function DesktopRightControls({
    isFullscreen,
    isPiPSupported,
    isAirPlaySupported,
    isCastAvailable,
    isProxied,
    onToggleFullscreen,
    onTogglePictureInPicture,
    onShowAirPlayMenu,
    onShowCastMenu
}: DesktopRightControlsProps) {
    return (
        <div className="relative z-50 flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Picture-in-Picture */}
            {
                isPiPSupported && (
                    <button
                        onClick={onTogglePictureInPicture}
                        className="btn-icon"
                        aria-label="画中画"
                        title="画中画"
                    >
                        <Icons.PictureInPicture size={18} />
                    </button>
                )
            }

            {/* AirPlay */}
            {
                isAirPlaySupported && (
                    <button
                        onClick={onShowAirPlayMenu}
                        className="btn-icon"
                        aria-label="隔空播放"
                        title="隔空播放"
                    >
                        <Icons.Airplay size={18} />
                    </button>
                )
            }

            {/* Google Cast */}
            {
                isCastAvailable && (
                    <button
                        onClick={onShowCastMenu}
                        className="btn-icon"
                        aria-label="投屏"
                        title="投屏"
                    >
                        <Icons.Cast size={18} />
                    </button>
                )
            }

            {/* Fullscreen */}
            <button
                onClick={onToggleFullscreen}
                className="btn-icon"
                aria-label={isFullscreen ? '退出全屏' : '全屏'}
            >
                {isFullscreen ? <Icons.Minimize size={18} /> : <Icons.Maximize size={18} />}
            </button>
        </div>
    );
}
