'use client';

import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';

interface PlayerBrandLogoProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isPremium?: boolean;
  className?: string;
  showControls?: boolean;
}

/**
 * 苹果/好莱坞电影级无缝暗角奢华台标（用户选定终极版）
 * 
 * 1:1 像素级还原用户最满意的经典版型：
 * 1. 左侧：圆角微透玻璃底座 + 精致小金冠
 * 2. 中间：iKanPP 纯白粗体 + 亮金 4K MAX 圆角徽章
 * 3. 下方：VIP CINEMA PRO 宽字距电影副标
 * 4. 底层：100% 实体防透光核心 + 右下自然平滑电影级烟雾暗角，不漏字不生硬
 */
export function PlayerBrandLogo({
  videoRef,
  containerRef,
  isPremium = true,
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
        width: '230px',
        height: '72px',
        opacity: position.ready ? 1 : 0,
      }}
      aria-hidden="true"
    >
      {/* 1. 核心实体黑防透光层 + 平滑自然电影级暗角羽化 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 110% 100% at 0% 0%, rgba(0,0,0,0.98) 0%, rgba(0,0,0,0.95) 45%, rgba(0,0,0,0.6) 75%, rgba(0,0,0,0) 100%)',
          backdropFilter: 'blur(3px)',
          WebkitBackdropFilter: 'blur(3px)',
        }}
      />

      {/* 2. 1:1 像素级用户指定经典版型 */}
      <div className="relative h-full flex items-start pt-2.5 pl-3.5 gap-2.5 z-10">
        {/* 左侧圆角微晶皇冠底座 */}
        <div className="w-6 h-6 rounded-xl bg-white/10 border border-amber-400/30 backdrop-blur-md flex items-center justify-center shadow-md shadow-black/60 mt-0.5 shrink-0">
          <Crown size={12} className="text-amber-400 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>

        {/* 右侧排版 */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[13px] font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-sans">
              iKanPP
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-tighter shadow-sm">
              4K MAX
            </span>
          </div>
          <span className="text-[8px] font-bold text-white/60 tracking-[0.2em] uppercase mt-1 drop-shadow-md">
            {isPremium ? 'VIP CINEMA PRO' : 'ULTRA HD'}
          </span>
        </div>
      </div>
    </div>
  );
}
