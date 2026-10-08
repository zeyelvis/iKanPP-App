'use client';

import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';

interface PlayerBrandLogoProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  className?: string;
  showControls?: boolean;
}

/**
 * 播放器左上角的 iKanPP 台标（legacy 引擎使用）：根据视频实际画面位置定位，跟随画面边界。
 */
export function PlayerBrandLogo({
  videoRef,
  containerRef,
  className = '',
}: PlayerBrandLogoProps) {
  // 真实画面偏移量
  const [position, setPosition] = useState<{ top: number; left: number; ready: boolean }>({
    top: 0,
    left: 0,
    ready: false,
  });

  const updatePosition = () => {
    const video = videoRef?.current;
    const container = containerRef?.current || video?.parentElement;

    if (!video || !container) return;

    const vWidth = video.videoWidth;
    const vHeight = video.videoHeight;
    const cWidth = container.clientWidth;
    const cHeight = container.clientHeight;

    if (!vWidth || !vHeight || !cWidth || !cHeight) {
      setPosition({ top: 0, left: 0, ready: true });
      return;
    }

    const videoAspect = vWidth / vHeight;
    const containerAspect = cWidth / cHeight;

    let renderTop = 0;
    let renderLeft = 0;

    if (containerAspect > videoAspect) {
      const renderWidth = cHeight * videoAspect;
      renderLeft = (cWidth - renderWidth) / 2;
      renderTop = 0;
    } else {
      const renderHeight = cWidth / videoAspect;
      renderTop = (cHeight - renderHeight) / 2;
      renderLeft = 0;
    }

    // 严丝合缝贴死视频真实画面顶角
    setPosition({
      top: Math.max(0, Math.round(renderTop)),
      left: Math.max(0, Math.round(renderLeft)),
      ready: true,
    });
  };

  useEffect(() => {
    updatePosition();

    const video = videoRef?.current;
    if (video) {
      video.addEventListener('loadedmetadata', updatePosition);
      video.addEventListener('resize', updatePosition);
      video.addEventListener('playing', updatePosition);
    }

    window.addEventListener('resize', updatePosition);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef?.current) {
      resizeObserver = new ResizeObserver(updatePosition);
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (video) {
        video.removeEventListener('loadedmetadata', updatePosition);
        video.removeEventListener('resize', updatePosition);
        video.removeEventListener('playing', updatePosition);
      }
      window.removeEventListener('resize', updatePosition);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [videoRef, containerRef]);

  return (
    <div
      className={`absolute z-35 pointer-events-none select-none transition-all duration-150 ease-out ${className}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '235px',
        height: '72px',
        opacity: position.ready ? 1 : 0,
      }}
      aria-hidden="true"
    >
      {/* 极简台标：无黑框，通透悬浮 */}
      <div className="relative h-full flex items-start pt-2.5 pl-3.5 gap-2.5 z-10">
        {/* 通透微晶皇冠底座 */}
        <div className="w-6 h-6 rounded-xl bg-black/40 border border-white/25 flex items-center justify-center shadow-md shadow-black/40 mt-0.5 shrink-0">
          <Crown size={12} className="text-amber-400 font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
        </div>

        {/* 右侧白字高光排版 */}
        <div className="flex flex-col">
          {/* 不标画质：未经实测不得宣称 4K / 超清（AGENTS 第 6 条） */}
          <span className="text-[13px] font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-sans leading-none">
            iKanPP
          </span>
        </div>
      </div>
    </div>
  );
}
