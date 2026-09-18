'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  X,
  BellRing,
  CheckCircle2,
  Loader2,
  Film,
  Sparkles,
  Star,
  Clapperboard,
  ArrowRight,
} from 'lucide-react';
import { TitleEntity } from '@/lib/types/entity';

interface RelatedTitleItem {
  entityId: string;
  slug: string;
  title: string;
  cover: string;
  year?: string;
  rate?: string;
}

interface ClassicDemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: TitleEntity;
  relatedTitles?: RelatedTitleItem[];
}

export function ClassicDemandModal({
  isOpen,
  onClose,
  entity,
  relatedTitles = [],
}: ClassicDemandModalProps) {
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 弹窗打开时锁死背景滚动，关闭时恢复
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // 监听 ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 从本地同步求片状态
  useEffect(() => {
    if (typeof window !== 'undefined' && entity?.entityId) {
      const demanded = localStorage.getItem(`demanded_${entity.entityId}`);
      setIsRequested(!!demanded);
    }
  }, [entity?.entityId, isOpen]);

  if (!isOpen || !mounted) return null;

  const handleSubmitDemand = async () => {
    if (isRequested || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/title/demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: entity.entityId,
          title: entity.title,
          year: entity.year,
          type: entity.type,
          poster: entity.cover,
        }),
      });

      if (res.ok) {
        setIsRequested(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`demanded_${entity.entityId}`, '1');
        }
        setFeedbackNotice('🎉 求片心愿已成功登记！我们将优先协调数字化正片。');
      } else {
        setIsRequested(true);
        setFeedbackNotice('求片心愿已在本地记录！');
      }
    } catch {
      setIsRequested(true);
      setFeedbackNotice('求片心愿已在本地记录！');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedbackNotice(null), 3500);
    }
  };

  const backdropImage = entity.backdrop || entity.cover;

  const modalContent = (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 sm:p-4 pt-16 sm:pt-20 bg-black/85 backdrop-blur-xl overflow-y-auto animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-classic-title"
    >
      {/* 紧凑轻奢卡片外壳：尺寸精炼至 max-w-[380px]，手机端与 iPad 端完美居中、呼吸感充裕 */}
      <div
        className="relative w-full max-w-[360px] sm:max-w-[380px] my-auto bg-[#0E0E16] border border-white/15 rounded-2xl sm:rounded-3xl shadow-[0_20px_70px_rgba(0,0,0,0.95),0_0_30px_rgba(220,38,38,0.12)] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部精巧型剧照横幅 (高度压缩至 h-24 sm:h-28) */}
        <div className="relative w-full h-24 sm:h-28 bg-neutral-900 overflow-hidden">
          {backdropImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-[1px] scale-105 opacity-40"
              style={{ backgroundImage: `url(${backdropImage})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-amber-950/40 via-red-950/30 to-black" />
          )}

          {/* 电影暗角弥散渐变 */}
          <div className="absolute inset-0 bg-linear-to-t from-[#0E0E16] via-[#0E0E16]/75 to-black/60" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0E0E16]/80 via-transparent to-[#0E0E16]/80" />

          {/* 右上角关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-2.5 right-2.5 z-30 w-7 h-7 rounded-full bg-black/70 hover:bg-white/20 border border-white/20 text-white/75 hover:text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer active:scale-90 shadow-md"
            aria-label="关闭"
          >
            <X size={14} />
          </button>

          {/* 左上角典藏徽章 (小巧精致) */}
          <div className="absolute top-2.5 left-3 z-20">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>影史馆藏 · 典藏珍本</span>
            </span>
          </div>

          {/* 底部浮凸海报与片名 (微型精致名片排版) */}
          <div className="absolute bottom-2 left-3 right-3 z-20 flex items-end gap-2.5">
            {/* 3D 浮凸微海报 */}
            <div className="relative w-11 sm:w-12 aspect-2/3 rounded-md overflow-hidden border border-white/25 shadow-lg shadow-black shrink-0 bg-black/80">
              {entity.cover ? (
                <img
                  src={entity.cover}
                  alt={entity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <Film size={16} />
                </div>
              )}
            </div>

            {/* 标题与元数据 */}
            <div className="flex-1 min-w-0 pb-0.5 space-y-0.5">
              <h2
                id="modal-classic-title"
                className="text-sm sm:text-base font-extrabold text-white tracking-tight truncate drop-shadow-md"
              >
                {entity.title}
              </h2>

              {entity.originalTitle && entity.originalTitle !== entity.title && (
                <p className="text-[10px] text-white/50 italic truncate font-serif">
                  {entity.originalTitle}
                </p>
              )}

              <div className="flex items-center gap-1.5 text-[10px] text-white/70">
                {entity.year && (
                  <span className="font-semibold text-amber-300/90">
                    {entity.year} 年
                  </span>
                )}
                {entity.rate && Number(entity.rate) > 0 && (
                  <span className="flex items-center gap-0.5 text-amber-400 font-bold bg-black/60 px-1 py-0.2 rounded border border-white/10 text-[9px]">
                    <Star size={9} className="fill-amber-400" />
                    <span>{entity.rate}</span>
                  </span>
                )}
                <span className="text-white/40">·</span>
                <span className="text-white/60">{entity.type === 'movie' ? '电影' : '剧集'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 弹窗主体区 (紧凑排版，高度最小化) */}
        <div className="p-3.5 sm:p-4 space-y-3">
          {/* 典藏公报卡片 (精炼文案) */}
          <div className="relative rounded-lg bg-white/[0.025] border border-white/10 p-2.5 sm:p-3 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-linear-to-b from-amber-400 via-rose-500 to-amber-600" />

            <div className="pl-1 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
                <Sparkles size={12} className="text-amber-400 shrink-0" />
                <span>片库收录说明</span>
              </div>
              <p className="text-[11px] text-white/75 leading-relaxed">
                《{entity.title}》于 {entity.year || '早期'} 上映。受早期胶片数字化及版权所限，当前公网暂未收录高清切片源。
              </p>
              <p className="text-[10px] text-white/50 leading-normal">
                已完整收录百科图谱，点击下方登记，平台将优先协调母带与正片上线！
              </p>
            </div>
          </div>

          {/* 旗舰级求片行动按钮 */}
          <div>
            <button
              onClick={handleSubmitDemand}
              disabled={isRequested || isSubmitting}
              className={`group w-full py-2 sm:py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer shadow-md ${
                isRequested
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 cursor-default'
                  : 'bg-linear-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 text-white shadow-red-600/20 active:scale-[0.98]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>正在登记中...</span>
                </>
              ) : isRequested ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-400 animate-bounce" />
                  <span>已登记求片 · 平台优先调度</span>
                </>
              ) : (
                <>
                  <BellRing size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>登记求片需求 · 优先调度正片上线</span>
                </>
              )}
            </button>

            {feedbackNotice && (
              <p className="text-[10px] text-center text-emerald-400 mt-1.5 animate-fade-in font-medium">
                {feedbackNotice}
              </p>
            )}
          </div>

          {/* 智能挽留推荐：精选同年代/同类型可播佳作 */}
          {relatedTitles.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] sm:text-[11px] font-bold text-white/80 flex items-center gap-1">
                  <Clapperboard size={12} className="text-red-400" />
                  <span>为您推荐同时代高分佳作</span>
                </span>
                <span className="text-[9px] text-white/40 flex items-center gap-0.5">
                  <span>点击直达</span>
                  <ArrowRight size={9} />
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {relatedTitles.slice(0, 3).map((item) => (
                  <Link
                    key={item.entityId}
                    href={`/title/${item.entityId}-${item.slug}`}
                    onClick={onClose}
                    className="group block bg-white/[0.02] border border-white/10 hover:border-red-500/50 rounded-md overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
                  >
                    <div className="aspect-2/3 relative bg-black/60 overflow-hidden">
                      {item.cover ? (
                        <img
                          src={item.cover}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Film size={14} />
                        </div>
                      )}
                      {item.rate && Number(item.rate) > 0 && (
                        <div className="absolute top-0.5 right-0.5 px-1 py-0.2 rounded bg-black/85 text-[8px] text-amber-400 font-bold flex items-center gap-0.5 border border-white/10">
                          <Star size={7} className="fill-amber-400" />
                          <span>{item.rate}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-1 space-y-0.5">
                      <p className="text-[10px] text-white/90 font-medium truncate group-hover:text-red-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[9px] text-white/40 truncate">
                        {item.year ? `${item.year} 年` : '经典'}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
