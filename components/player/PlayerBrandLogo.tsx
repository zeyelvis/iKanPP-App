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
 * 苹果/好莱坞电影级无缝径向羽化台标（Apple/IMAX Ambient Cinema Watermark）
 * 
 * 极致美学与细节提升：
 * 1. 采用高阶双重径向烟雾羽化渐变 (Radial Gaussian Feathering)，消除任何可见边界切线
 * 2. 沉浸观影智能呼吸透光：控制条隐藏时优雅降至 70% 极简微透，唤出控制条时瞬间晶亮
 * 3. 黄金比例极简金冠微标，彻底去除任何突兀硬底
 * 4. 严丝合缝零缝隙包覆，100% 彻底吞噬底层所有原站印记
 */
export function PlayerBrandLogo({
  videoRef,
  containerRef,
  isPremium = true,
  className = '',
  showControls = true,
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
      className={`absolute z-35 pointer-events-none select-none transition-all duration-500 ease-out ${className}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '230px',
        height: '76px',
        opacity: position.ready ? (showControls ? 1 : 0.85) : 0,
      }}
      aria-hidden="true"
    >
      {/* 1. 电影级双重径向烟雾羽化底罩（彻底抹平所有切线，像原生暗角般无缝融入） */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 110% 100% at 0% 0%, rgba(0,0,0,0.96) 0%, rgba(0,0,0,0.85) 38%, rgba(0,0,0,0.4) 65%, rgba(0,0,0,0) 100%)',
          backdropFilter: 'blur(4px)',
          WebkitBackdropFilter: 'blur(4px)',
          maskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black 50%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black 50%, transparent 100%)',
        }}
      />

      {/* 2. 苹果 / IMAX 极致精巧纯粹原厂台标 */}
      <div className="relative h-full flex items-start pt-3 pl-3.5 gap-2">
        {/* 纯金微晶金冠标 */}
        <div className="w-5 h-5 rounded-lg bg-white/5 border border-amber-400/30 flex items-center justify-center shadow-sm shadow-amber-500/20 mt-0.5 shrink-0 backdrop-blur-md">
          <Crown size={11} className="text-amber-400 font-black drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" />
        </div>

        {/* 黄金排版文字 */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[13px] font-black tracking-wider text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] font-sans">
              iKanPP
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-400/15 text-amber-300 border border-amber-400/30 uppercase tracking-tighter drop-shadow-sm">
              4K MAX
            </span>
          </div>
          <span className="text-[8px] font-bold text-white/55 tracking-[0.2em] uppercase mt-1 drop-shadow-md">
            {isPremium ? 'VIP CINEMA PRO' : 'ULTRA HD'}
          </span>
        </div>
      </div>
    </div>
  );
}
