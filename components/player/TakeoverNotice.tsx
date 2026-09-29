'use client';

import React, { useState, useMemo } from 'react';
import { Copy, Check, AlertTriangle, ExternalLink } from 'lucide-react';
import { checkIsIPadOS } from '@/lib/hooks/mobile/useDeviceDetection';

interface TakeoverNoticeProps {
  browserName: string;
}

/**
 * 视频劫持浏览器拦截阻断提示组件 (TakeoverNotice)
 * 纯色暗夜底色，严格无 backdrop-filter，提示用户改用系统纯净浏览器打开以获得最佳播放体验
 */
export function TakeoverNotice({ browserName }: TakeoverNoticeProps) {
  const [copied, setCopied] = useState(false);
  const [fallbackShowLink, setFallbackShowLink] = useState(false);

  const isApple = useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent;
    return !/Android/i.test(ua) && (/iPhone|iPad|iPod/i.test(ua) || checkIsIPadOS());
  }, []);

  const recommendedBrowser = isApple ? 'Safari' : 'Chrome 或手机自带浏览器';
  const installGuideText = isApple ? 'Safari' : 'Chrome';

  const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
  const decodedUrl = useMemo(() => {
    try {
      return decodeURI(currentUrl);
    } catch {
      return currentUrl;
    }
  }, [currentUrl]);

  const handleCopy = async () => {
    if (!currentUrl) return;

    // 1. 尝试现代 Clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
      try {
        await navigator.clipboard.writeText(currentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return;
      } catch {}
    }

    // 2. 降级为隐藏 textarea execCommand('copy')
    try {
      const textarea = document.createElement('textarea');
      textarea.value = currentUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 3000);
        return;
      }
    } catch {}

    // 3. 两种方式均失败时，展开链接供用户长按复制
    setFallbackShowLink(true);
  };

  return (
    <div className="relative w-full aspect-video bg-[#121318] rounded-none sm:rounded-2xl border border-white/10 p-6 flex flex-col items-center justify-center text-center select-none overflow-hidden text-white">
      {/* 警告指示徽标 */}
      <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4 shrink-0 shadow-lg">
        <AlertTriangle size={24} />
      </div>

      {/* 主标题 */}
      <h3 className="text-lg sm:text-xl font-bold tracking-tight text-white mb-2">
        {browserName}里无法播放
      </h3>

      {/* 说明文案 */}
      <p className="text-xs sm:text-sm text-white/70 max-w-md leading-relaxed mb-6 px-2">
        {browserName}会用自带的播放器接管网页视频，选集、换线路和续播都会失效。请用{' '}
        <span className="text-amber-400 font-semibold">{recommendedBrowser}</span> 打开本页观看。
      </p>

      {/* 复制链接按钮 */}
      {!fallbackShowLink ? (
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-medium text-sm shadow-md shadow-orange-500/20 active:scale-95 transition-all"
        >
          {copied ? (
            <>
              <Check size={16} className="text-white" />
              <span>已复制链接，请在 {recommendedBrowser} 打开</span>
            </>
          ) : (
            <>
              <Copy size={16} />
              <span>复制本页链接</span>
            </>
          )}
        </button>
      ) : (
        <div className="w-full max-w-md flex flex-col items-center gap-2">
          <span className="text-xs text-amber-400 font-medium">请长按下方链接复制：</span>
          <div className="w-full p-2.5 bg-black/60 border border-white/15 rounded-xl text-xs text-white/90 select-all break-all font-mono max-h-24 overflow-y-auto">
            {decodedUrl}
          </div>
        </div>
      )}

      {/* 底部 PWA 引导小字 */}
      <div className="mt-6 flex items-center gap-1.5 text-[11px] text-white/40">
        <ExternalLink size={12} />
        <span>用 {installGuideText} 打开后，还可以把 iKanPP 装到桌面，像 App 一样看剧。</span>
      </div>
    </div>
  );
}
