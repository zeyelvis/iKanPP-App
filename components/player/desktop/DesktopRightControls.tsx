import React from 'react';
import { Icons } from '@/components/ui/Icon';



interface DesktopRightControlsProps {
    isNativeFullscreen: boolean;
    isWebFullscreen: boolean;
    isPiPSupported: boolean;
    isAirPlaySupported: boolean;
    isCastAvailable: boolean;
    onToggleNativeFullscreen: () => void;
    onToggleWebFullscreen: () => void;
    onTogglePictureInPicture: () => void;
    onShowAirPlayMenu: () => void;
    onShowCastMenu: () => void;
}

export function DesktopRightControls({
    isNativeFullscreen,
    isWebFullscreen,
    isPiPSupported,
    isAirPlaySupported,
    isCastAvailable,
    onToggleNativeFullscreen,
    onToggleWebFullscreen,
    onTogglePictureInPicture,
    onShowAirPlayMenu,
    onShowCastMenu
}: DesktopRightControlsProps) {
    return (
        <div className="player-controls-right relative z-50 flex shrink-0 items-center gap-3">
            {/* Picture-in-Picture */}
            {
                isPiPSupported && (
                    <button
                        onClick={onTogglePictureInPicture}
                        className="btn-icon shrink-0"
                        aria-label="画中画"
                        title="画中画"
                    >
                        <Icons.PictureInPicture size={20} />
                    </button>
                )
            }

            {/* AirPlay */}
            {
                isAirPlaySupported && (
                    <button
                        onClick={onShowAirPlayMenu}
                        className="btn-icon shrink-0"
                        aria-label="隔空播放"
                        title="隔空播放"
                    >
                        <Icons.Airplay size={20} />
                    </button>
                )
            }

            {/* Google Cast */}
            {
                isCastAvailable && (
                    <button
                        onClick={onShowCastMenu}
                        className="btn-icon shrink-0"
                        aria-label="投屏"
                        title="投屏"
                    >
                        <Icons.Cast size={20} />
                    </button>
                )
            }

            {/* Web Fullscreen (窗口内放大) */}
            <button
                onClick={onToggleWebFullscreen}
                className="btn-icon shrink-0"
                aria-label={isWebFullscreen ? '退出网页全屏' : '网页窗口全屏'}
                title={isWebFullscreen ? '退出网页全屏 (W)' : '网页窗口全屏 (W)'}
            >
                {isWebFullscreen
                    ? <Icons.WebFullscreenExit size={20} className="text-(--accent-color)" />
                    : <Icons.WebFullscreen size={20} />}
            </button>

            {/* Native Fullscreen (设备全部真全屏) */}
            <button
                onClick={onToggleNativeFullscreen}
                className={`btn-icon shrink-0 ${isNativeFullscreen ? 'text-(--accent-color)' : ''}`}
                aria-label={isNativeFullscreen ? '退出全部全屏' : '全部全屏'}
                title={isNativeFullscreen ? '退出全部全屏 (F 或 双击)' : '全部全屏 (F 或 双击)'}
            >
                {isNativeFullscreen ? <Icons.Minimize size={20} /> : <Icons.Maximize size={20} />}
            </button>
        </div >
    );
}
