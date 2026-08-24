'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Crown, Sparkles } from 'lucide-react';

interface PlayerBrandLogoProps {
  videoRef?: React.RefObject<HTMLVideoElement | null>;
  containerRef?: React.RefObject<HTMLDivElement | null>;
  isPremium?: boolean;
  className?: string;
}

/**
 * 智能视频画面边界追踪品牌台标（Smart Video Bounds Tracker）
 * 
 * 核心特性：
 * 1. 动态计算 object-contain 下视频画面的真实渲染坐标（剔除上下/左右黑边偏移）
 * 2. 无论全屏、小窗、旋转或缩放，台标永远吸附在视频真实像素的左上角 (Jable 水印位置)
 * 3. 扩大安全遮罩面积 (176px x 42px) + 不透明毛玻璃，100% 彻底抹去 Jable.tv 字样
 */
export function PlayerBrandLogo({
  videoRef,
  containerRef,
  isPremium = true,
  className = '',
}: PlayerBrandLogoProps) {
  // 真实画面偏移量
  const [position, setPosition] = useState<{ top: number; left: number; ready: boolean }>({
    top: 14,
    left: 14,
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
      setPosition({ top: 14, left: 14, ready: true });
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

    // 将遮罩放置在视频真实画面的左上角内部（偏移 12px, 10px）
    setPosition({
      top: Math.max(8, Math.round(renderTop + 10)),
      left: Math.max(8, Math.round(renderLeft + 12)),
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

    // 观察容器尺寸变化
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
      className={`absolute z-35 pointer-events-none select-none transition-all duration-200 ${className}`}
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        opacity: position.ready ? 1 : 0.9,
      }}
      aria-hidden="true"
    >
      {/* 强化遮罩底板：加大尺寸 (176px x 42px) + 高密度暗黑毛玻璃，彻底消融 Jable 水印 */}
      <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-2xl bg-[#090A10]/95 backdrop-blur-xl border border-amber-500/40 shadow-2xl shadow-black/90">
        <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-amber-400 via-yellow-500 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
          <Crown size={14} className="text-black font-black" />
        </div>
        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1">
            <span className="text-xs font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 leading-none">
              iKanPP 4K
            </span>
            <Sparkles size={11} className="text-amber-400 shrink-0 animate-pulse" />
          </div>
          <span className="text-[9px] font-bold text-white/70 tracking-tight leading-none mt-1">
            {isPremium ? 'VIP 独家蓝光' : '极速原画'}
          </span>
        </div>
      </div>
    </div>
  );
}
