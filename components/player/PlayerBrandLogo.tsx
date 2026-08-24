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
 * 苹果/好莱坞无黑底通透高斯磨砂台标（Zero-Black-Card Frost Glass Watermark）
 * 
 * 核心设计突破：
 * 1. 【彻底移除黑底】：不再使用任何黑斑或黑色渐变，背景 100% 透出当前视频的实时画面颜色（蓝天即蓝、红砖即红）
 * 2. 【高阶高斯消融】：采用 28px 超强动态 Backdrop Blur，将底层 jable.tv 锐利文字彻底打散消融为柔和纯净背景光
 * 3. 【边缘无痕羽化】：采用 Radial Mask 边缘渐变融合，与原画面无缝衔接
 * 4. 【极简纯净排版】：通透高透玻璃底座 + 纯白高光 iKanPP 4K MAX 徽标
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
        width: '220px',
        height: '68px',
        opacity: position.ready ? 1 : 0,
      }}
      aria-hidden="true"
    >
      {/* 1. 【无黑底高斯磨砂消融层】：0 黑底，直接实时模糊视频原色，将 Jable 锐利文字打散消融 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
          maskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black 40%, rgba(0,0,0,0.5) 75%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black 40%, rgba(0,0,0,0.5) 75%, transparent 100%)',
        }}
      />

      {/* 2. 【极简纯净原厂台标】：无黑框，通透悬浮 */}
      <div className="relative h-full flex items-start pt-2.5 pl-3.5 gap-2.5 z-10">
        {/* 通透微晶皇冠底座 */}
        <div className="w-6 h-6 rounded-xl bg-black/15 border border-white/20 backdrop-blur-xl flex items-center justify-center shadow-sm mt-0.5 shrink-0">
          <Crown size={12} className="text-amber-400 font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
        </div>

        {/* 右侧白字高光排版 */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[13px] font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-sans">
              iKanPP
            </span>
            <span className="px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-400/25 text-amber-300 border border-amber-300/40 uppercase tracking-tighter drop-shadow-md">
              4K MAX
            </span>
          </div>
          <span className="text-[8px] font-bold text-white/80 tracking-[0.2em] uppercase mt-1 drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
            {isPremium ? 'VIP CINEMA PRO' : 'ULTRA HD'}
          </span>
        </div>
      </div>
    </div>
  );
}
