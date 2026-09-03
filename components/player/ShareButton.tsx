'use client';

/**
 * ShareButton — 播放页分享按钮
 * 支持复制链接、预写文案、Web Share API
 */

import { useState, useRef, useEffect } from 'react';
import { Share2, Copy, Check, X, Link2, MessageCircle, QrCode, Sparkles } from 'lucide-react';
import { siteConfig } from '@/lib/config/site-config';
import { ShareCardModal } from './ShareCardModal';

interface ShareButtonProps {
  title: string;
  size?: number;
  poster?: string;
  episodeName?: string;
  year?: string;
  type?: string;
  isPremium?: boolean;
}

export function ShareButton({ title, size = 20, poster, episodeName, year, type, isPremium }: ShareButtonProps) {
  const [showPanel, setShowPanel] = useState(false);
  const [showCardModal, setShowCardModal] = useState(false);
  const [copied, setCopied] = useState<'link' | 'text' | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // 构建分享链接：/player?title=xxx  — 直接打开搜索
  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/player?title=${encodeURIComponent(title)}${isPremium || window.location.search.includes('premium=1') ? '&premium=1' : ''}`
    : '';

  const shareText = `我在 ${siteConfig.name} 免费看《${title}》，无广告高清播放 →`;

  // 点击外部关闭面板
  useEffect(() => {
    if (!showPanel) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setShowPanel(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showPanel]);

  const copyToClipboard = async (text: string, type: 'link' | 'text') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const handleShare = async () => {
    // 优先使用 Web Share API（移动端）
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${title} - ${siteConfig.name}`,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {
        // 用户取消或 API 不支持，回退到面板
      }
    }
    setShowPanel(!showPanel);
  };

  const openTelegram = () => {
    const url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const openTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
  };

  const openWhatsApp = () => {
    const url = `https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* 分享按钮 */}
      <button
        onClick={handleShare}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full 
          bg-[var(--glass-bg)] border border-[var(--glass-border)]
          text-[var(--text-color-secondary)] hover:text-[var(--accent-color)] 
          hover:border-[var(--accent-color)]/30 transition-all cursor-pointer"
        title="分享"
      >
        <Share2 size={size - 4} />
        <span className="hidden sm:inline">分享</span>
      </button>

      {/* 分享模态框 */}
      {showPanel && (
        <>
          {/* 遮罩层 */}
          <div
            className="fixed inset-0 bg-black/60 z-[100]"
            onClick={() => setShowPanel(false)}
          />
          {/* 面板 */}
          <div
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              w-[340px] max-w-[90vw] p-5 z-[101]
              bg-[var(--bg-color)] border border-[var(--glass-border)] 
              rounded-2xl shadow-2xl"
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowPanel(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full
                text-[var(--text-color-secondary)] hover:text-[var(--text-color)] 
                hover:bg-white/10 transition-all cursor-pointer"
            >
              <X size={16} />
            </button>

            <h3 className="text-base font-semibold text-[var(--text-color)] mb-4">
              分享影片
            </h3>

            {/* 推荐文案 */}
            <div className="mb-3">
              <label className="text-xs text-[var(--text-color-secondary)] mb-1.5 block">推荐文案</label>
              <div className="flex items-start gap-2 p-3 bg-white/5 rounded-xl text-sm text-[var(--text-color)]">
                <span className="flex-1 leading-relaxed">{shareText}</span>
                <button
                  onClick={() => copyToClipboard(shareText + ' ' + shareUrl, 'text')}
                  className="flex-shrink-0 p-1 hover:text-[var(--accent-color)] transition-colors cursor-pointer"
                  title="复制文案"
                >
                  {copied === 'text' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            {/* 分享链接 */}
            <div className="mb-5">
              <label className="text-xs text-[var(--text-color-secondary)] mb-1.5 block">分享链接</label>
              <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl">
                <Link2 size={14} className="text-[var(--text-color-secondary)] flex-shrink-0" />
                <span className="text-xs text-[var(--text-color)] truncate flex-1">{shareUrl}</span>
                <button
                  onClick={() => copyToClipboard(shareUrl, 'link')}
                  className="flex-shrink-0 px-3 py-1.5 text-xs bg-[var(--accent-color)] text-white 
                    rounded-lg hover:opacity-90 transition-opacity cursor-pointer font-medium"
                >
                  {copied === 'link' ? '已复制 ✓' : '复制'}
                </button>
              </div>
            </div>

            {/* 社交平台按钮 */}
            <div>
              <label className="text-xs text-[var(--text-color-secondary)] mb-2 block">分享到</label>
              <div className="flex justify-between">
                <button
                  onClick={openTelegram}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl 
                    hover:bg-white/5 transition-colors cursor-pointer group"
                  title="Telegram"
                >
                  <div className="w-11 h-11 rounded-full bg-[#2AABEE]/15 flex items-center justify-center
                    group-hover:bg-[#2AABEE]/25 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[#2AABEE]" fill="currentColor">
                      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-[var(--text-color-secondary)]">Telegram</span>
                </button>

                <button
                  onClick={openTwitter}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl 
                    hover:bg-white/5 transition-colors cursor-pointer group"
                  title="X / Twitter"
                >
                  <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center
                    group-hover:bg-white/15 transition-colors">
                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-[var(--text-color)]" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <span className="text-[10px] text-[var(--text-color-secondary)]">X</span>
                </button>

                <button
                  onClick={openWhatsApp}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl 
                    hover:bg-white/5 transition-colors cursor-pointer group"
                  title="WhatsApp"
                >
                  <div className="w-11 h-11 rounded-full bg-[#25D366]/15 flex items-center justify-center
                    group-hover:bg-[#25D366]/25 transition-colors">
                    <MessageCircle size={20} className="text-[#25D366]" />
                  </div>
                  <span className="text-[10px] text-[var(--text-color-secondary)]">WhatsApp</span>
                </button>

                <button
                  onClick={() => copyToClipboard(shareText + '\n' + shareUrl, 'text')}
                  className="flex flex-col items-center gap-1.5 p-2 rounded-xl 
                    hover:bg-white/5 transition-colors cursor-pointer group"
                  title="复制全部"
                >
                  <div className="w-11 h-11 rounded-full bg-[var(--accent-color)]/15 flex items-center justify-center
                    group-hover:bg-[var(--accent-color)]/25 transition-colors">
                    {copied === 'text'
                      ? <Check size={20} className="text-emerald-400" />
                      : <Copy size={20} className="text-[var(--accent-color)]" />
                    }
                  </div>
                  <span className="text-[10px] text-[var(--text-color-secondary)]">
                    {copied === 'text' ? '已复制' : '复制'}
                  </span>
                </button>
              </div>
            </div>

            {/* 生成海报卡片推荐 */}
            <button
              onClick={() => {
                setShowPanel(false);
                setShowCardModal(true);
              }}
              className="w-full mt-3 py-2.5 px-3 rounded-xl bg-gradient-to-r from-red-600/20 to-indigo-600/20 hover:from-red-600/30 hover:to-indigo-600/30 border border-white/15 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <Sparkles size={14} className="text-red-400" />
              生成高颜值影评分享卡片
            </button>
          </div>
        </>
      )}

      {/* 专属影评裂变分享弹窗 */}
      <ShareCardModal
        isOpen={showCardModal}
        onClose={() => setShowCardModal(false)}
        title={title}
        poster={poster}
        episodeName={episodeName}
        year={year}
        type={type}
      />
    </div>
  );
}
