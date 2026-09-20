'use client';

import React, { useState } from 'react';
import { X, Check, Copy, Share2, Send, MessageCircle, Twitter, ExternalLink, Sparkles } from 'lucide-react';

interface ShareCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  poster?: string;
  episodeName?: string;
  year?: string;
  type?: string;
}

export function ShareCardModal({
  isOpen,
  onClose,
  title,
  poster,
  episodeName,
  year,
  type,
}: ShareCardModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const isPremium = typeof window !== 'undefined' && (window.location.hostname.includes('ikanx.com') || window.location.search.includes('premium=1'));
  const brandName = isPremium ? 'iKanX' : 'iKanPP 爱看片片';
  const brandTag = isPremium ? 'iKanX' : 'iKanPP';
  const defaultFallbackUrl = isPremium ? 'https://ikanx.com' : 'https://www.ikanpp.com';
  const currentUrl = typeof window !== 'undefined' ? window.location.href : defaultFallbackUrl;
  const shareText = `🎬 发现了一部超赞的${type || '精选作品'}《${title}》${
    episodeName ? `(${episodeName})` : ''
  }！4K极速秒播，推荐给你直接戳链接：${currentUrl} （${brandName}）`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleShareTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(
      `🎬 正在 ${brandTag} 看《${title}》，4K极速直连播放！`
    )}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      `正在看《${title}》，4K秒播专区 #${brandTag}`
    )}&url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/85 animate-fade-in select-none">
      <div className="relative w-full max-w-md bg-neutral-900/95 border border-white/15 rounded-3xl p-5 sm:p-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col gap-4 text-white overflow-hidden">
        {/* 背景氛围流光 */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* 顶部标题栏 */}
        <div className="flex items-center justify-between pb-1 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-red-500/20 text-red-400">
              <Sparkles size={16} />
            </span>
            <span className="font-bold text-sm sm:text-base tracking-wide">分享这部精彩好片</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* 预览卡片 (Card Preview) */}
        <div className="relative rounded-2xl bg-linear-to-b from-white/10 to-white/5 border border-white/10 p-4 flex gap-4 items-center overflow-hidden shadow-inner">
          {poster ? (
            <img
              src={poster}
              alt={title}
              className="w-20 h-28 object-cover rounded-xl shadow-lg border border-white/10 shrink-0"
              loading="lazy"
            />
          ) : (
            <div className="w-20 h-28 rounded-xl bg-white/10 flex items-center justify-center text-white/40 text-xs shrink-0">
              暂无海报
            </div>
          )}

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-red-600 text-[10px] font-black tracking-wider uppercase">
                4K 超清
              </span>
              {year && <span className="text-xs text-white/60">{year}</span>}
              {type && <span className="text-xs text-white/60">· {type}</span>}
            </div>

            <h3 className="text-base font-black text-white truncate">{title}</h3>
            {episodeName && (
              <p className="text-xs text-red-400 font-semibold truncate">正在播放：{episodeName}</p>
            )}

            <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">
              海外华人免翻墙直连播放平台 · 极速秒播 0 卡顿
            </p>
          </div>
        </div>

        {/* 社交媒体一键直达按钮 */}
        <div className="space-y-2">
          <span className="text-xs font-bold text-white/60">一键分享到华人社交圈：</span>
          <div className="grid grid-cols-3 gap-2.5">
            <button
              onClick={handleShareTelegram}
              className="py-2.5 px-3 rounded-xl bg-[#2AABEE]/20 hover:bg-[#2AABEE]/30 border border-[#2AABEE]/40 text-[#2AABEE] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Send size={14} />
              Telegram
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="py-2.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <MessageCircle size={14} />
              WhatsApp
            </button>

            <button
              onClick={handleShareTwitter}
              className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Twitter size={14} />
              Twitter / X
            </button>
          </div>
        </div>

        {/* 复制推荐口令与链接 */}
        <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs text-white/70">
            <span>推荐文案与直达口令：</span>
            <span className="text-[10px] text-white/40">已包含防失效链接</span>
          </div>

          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={currentUrl}
              className="w-full bg-black/50 border border-white/15 rounded-xl py-2.5 pl-3 pr-24 text-xs text-white/80 select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md"
            >
              {copied ? (
                <>
                  <Check size={13} />
                  已复制
                </>
              ) : (
                <>
                  <Copy size={13} />
                  复制口令
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
