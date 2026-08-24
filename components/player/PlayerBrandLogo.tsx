'use client';

import React, { useState, useEffect } from 'react';
import { Crown } from 'lucide-react';

interface PlayerBrandLogoProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isPremium?: boolean;
  className?: string;
}

/**
 * 电影工业级智能画面吸附台标（Cinematic Ultra HD Watermark）
 * 
 * 核心优化：
 * 1. 彻底去除生硬突兀的黄色药丸胶囊补丁感
 * 2. 采用好莱坞电影级自然暗角羽化渐变 (Cinematic Vignette)
 * 3. 严格贴合真实视频像素顶角 (renderTop, renderLeft)，彻底吞没 Jable 水印无任何残留
 * 4. 浮现如 Netflix / IMAX 原厂般的极简纯粹 4K 蓝光尊享台标
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
      // 左右有黑边，视频高度铺满
      const renderWidth = cHeight * videoAspect;
      renderLeft = (cWidth - renderWidth) / 2;
      renderTop = 0;
    } else {
      // 上下有黑边，视频宽度铺满
      const renderHeight = cWidth / videoAspect;
      renderTop = (cHeight - renderHeight) / 2;
      renderLeft = 0;
    }

    // 严丝合缝贴死视频画面的最顶角（不留任何缝隙露白）
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
      className={`absolute z-35 pointer-events-none select-none overflow-hidden transition-all duration-150 ${className}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '210px',
        height: '64px',
        opacity: position.ready ? 1 : 0.95,
      }}
      aria-hidden="true"
    >
      {/* 1. 电影级左上角自然暗角遮罩（高密度吸收水印，边缘柔和羽化） */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/95 via-black/80 to-transparent backdrop-blur-[6px]" />

      {/* 2. 奢华纯粹的 IMAX / Netflix 级原厂发光台标 */}
      <div className="relative h-full flex items-start pt-2.5 pl-3.5 gap-2">
        {/* 精致小皇冠微标 */}
        <div className="w-5 h-5 rounded-md bg-gradient-to-br from-amber-400/90 to-amber-600/90 flex items-center justify-center shadow-sm shadow-amber-500/30 mt-0.5 shrink-0">
          <Crown size={11} className="text-black font-black" />
        </div>

        {/* 电影级无衬线发光文字 */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[13px] font-black tracking-widest text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] font-sans">
              iKanPP
            </span>
            <span className="px-1 py-0.2 rounded text-[8px] font-extrabold bg-amber-500/30 text-amber-300 border border-amber-400/40 uppercase tracking-tighter">
              4K MAX
            </span>
          </div>
          <span className="text-[8px] font-semibold text-white/50 tracking-wider uppercase mt-1 drop-shadow-sm">
            {isPremium ? 'VIP CINEMA PRO' : 'ULTRA HD'}
          </span>
        </div>
      </div>
    </div>
  );
}
