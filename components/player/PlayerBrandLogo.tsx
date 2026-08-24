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
 * 苹果/好莱坞双层实体防透光电影级台标（Zero-Leak Ambient Cinema Mask）
 * 
 * 核心技术突破：
 * 1. 【核心黑洞层 (Zero-Leak Solid Core)】：水印区域 100% 纯黑绝对不透明 (#000000)，透光率严格为 0%，100% 物理级吞没 jable.tv！
 * 2. 【外圈柔和烟雾层 (Outer Smoke Feathering)】：从实体黑向右下方以高阶高斯平滑羽化融入画面，完全无可见硬边。
 * 3. 【全天候 100% 恒定遮挡】：始终保持 opacity: 1 实体覆盖，杜绝任何亮度下的隐约透字。
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

    // 严密贴合视频真实画面最顶角
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
        width: '240px',
        height: '80px',
        opacity: position.ready ? 1 : 0,
      }}
      aria-hidden="true"
    >
      {/* 1. 【核心黑洞层】：水印区域 100% 纯黑实体覆写，透光率 0%，彻底物理灭绝 jable.tv */}
      <div className="absolute top-0 left-0 w-[170px] h-[52px] bg-black" />

      {/* 2. 【外圈柔和烟雾层】：平滑向右下羽化扩散，彻底消除边界任何生硬切线 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 100% 100% at 0% 0%, #000000 0%, #000000 50%, rgba(0,0,0,0.85) 68%, rgba(0,0,0,0) 100%)',
        }}
      />

      {/* 3. 【IMAX 级纯粹尊享台标】：纯正发光字标 */}
      <div className="relative h-full flex items-start pt-2.5 pl-3.5 gap-2 z-10">
        {/* 纯金微晶金冠标 */}
        <div className="w-5 h-5 rounded-lg bg-white/10 border border-amber-400/40 flex items-center justify-center shadow-md shadow-amber-500/20 mt-0.5 shrink-0">
          <Crown size={11} className="text-amber-400 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>

        {/* 黄金排版文字 */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[13px] font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-sans">
              iKanPP
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-400/20 text-amber-300 border border-amber-400/40 uppercase tracking-tighter shadow-sm">
              4K MAX
            </span>
          </div>
          <span className="text-[8px] font-bold text-white/70 tracking-[0.2em] uppercase mt-1 drop-shadow-sm">
            {isPremium ? 'VIP CINEMA PRO' : 'ULTRA HD'}
          </span>
        </div>
      </div>
    </div>
  );
}
