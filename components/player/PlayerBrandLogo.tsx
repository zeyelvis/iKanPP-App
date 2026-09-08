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
 * 苹果/好莱坞 56px 超强双通道高斯消融台标（Ultra-Deep Frost Glass Delogo）
 * 
 * 核心升级：
 * 1. 【56px 双通道超强高斯核】：核半径从 32px 飙升至 56px，彻底揉碎打散任何高亮白字轮廓
 * 2. 【高反差像素中和 (Contrast Neutralizer)】：brightness(0.9) + saturate(130%)，彻底抹平高反差字迹亮斑
 * 3. 【0 黑底 100% 动态透色】：仍然保持通透纯净无黑底，视频是红色即透红，是蓝色即透蓝
 * 4. 【边缘平滑无痕径向羽化】：Mask Image 边缘平滑淡出，完全无硬边
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
        width: '235px',
        height: '72px',
        opacity: position.ready ? 1 : 0,
      }}
      aria-hidden="true"
    >
      {/* 1. 【第一道强力高斯消融】：56px 广域卷积揉碎文字字符 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: 'blur(56px) brightness(0.9) saturate(140%)',
          WebkitBackdropFilter: 'blur(56px) brightness(0.9) saturate(140%)',
          background: 'rgba(0, 0, 0, 0.08)',
          maskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black 55%, rgba(0,0,0,0.5) 80%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black 55%, rgba(0,0,0,0.5) 80%, transparent 100%)',
        }}
      />

      {/* 2. 【第二道微晶光雾中和层】：彻底消除高反差残影 */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: 'blur(36px)',
          WebkitBackdropFilter: 'blur(36px)',
          background: 'radial-gradient(ellipse 90% 90% at 0% 0%, rgba(255,255,255,0.05) 0%, transparent 80%)',
          maskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black 40%, transparent 100%)',
          WebkitMaskImage: 'radial-gradient(ellipse 100% 100% at 0% 0%, black 40%, transparent 100%)',
        }}
      />

      {/* 3. 【极简纯净原厂台标】：无黑框，通透悬浮 */}
      <div className="relative h-full flex items-start pt-2.5 pl-3.5 gap-2.5 z-10">
        {/* 通透微晶皇冠底座 */}
        <div className="w-6 h-6 rounded-xl bg-black/20 border border-white/25 backdrop-blur-2xl flex items-center justify-center shadow-md shadow-black/40 mt-0.5 shrink-0">
          <Crown size={12} className="text-amber-400 font-black drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]" />
        </div>

        {/* 右侧白字高光排版 */}
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5 leading-none">
            <span className="text-[13px] font-black tracking-wider text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] font-sans">
              {isPremium ? 'iKanX' : 'iKanPP'}
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
