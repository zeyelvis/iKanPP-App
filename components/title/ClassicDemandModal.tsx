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
        setFeedbackNotice('🎉 求片心愿已成功登记！我们将优先协调数字化正片上线。');
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
      className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/85 backdrop-blur-xl overflow-y-auto select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-classic-title"
    >
      {/* 
        响应式双模卡片外壳：
        - 手机端 (< sm): 贴底升起的现代化半屏抽屉 (Bottom Sheet)，圆润顶部，大拇指舒适触达，天然避开顶部导航栏；
        - 平板与桌面端 (>= sm): 舒展大气的影院级居中画幅 (max-w-[560px])，电影感拉满，彻底告别局促过小。
      */}
      <div
        className="relative w-full sm:max-w-[560px] md:max-w-[580px] max-h-[88vh] sm:max-h-[90vh] flex flex-col bg-[#0E0E16] border-t sm:border border-white/15 rounded-t-3xl sm:rounded-3xl shadow-[0_-15px_50px_rgba(0,0,0,0.95),0_0_50px_rgba(220,38,38,0.12)] overflow-hidden transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 手机端专用：顶部滑动抓手横条 (Drag Handle) */}
        <div className="sm:hidden w-full pt-2.5 pb-1 flex items-center justify-center shrink-0">
          <div className="w-10 h-1 bg-white/30 rounded-full" />
        </div>

        {/* 顶部通栏电影剧照横幅 (桌面端宽大舒展，手机端比例得当) */}
        <div className="relative w-full h-32 sm:h-44 bg-neutral-900 overflow-hidden shrink-0">
          {backdropImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-[0.5px] scale-105 opacity-45"
              style={{ backgroundImage: `url(${backdropImage})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-amber-950/40 via-red-950/30 to-black" />
          )}

          {/* 电影级微光与暗角渐变 */}
          <div className="absolute inset-0 bg-linear-to-t from-[#0E0E16] via-[#0E0E16]/75 to-black/60" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0E0E16]/85 via-transparent to-[#0E0E16]/85" />

          {/* 右上角精致关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-3.5 sm:right-3.5 z-30 w-8 h-8 rounded-full bg-black/75 hover:bg-white/20 border border-white/20 text-white/80 hover:text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer active:scale-90 shadow-lg"
            aria-label="关闭"
          >
            <X size={16} />
          </button>

          {/* 左上角典藏徽章 (金光弥散) */}
          <div className="absolute top-3 left-3.5 sm:top-3.5 sm:left-4 z-20">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/35 backdrop-blur-md shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>影史馆藏 · 典藏珍本</span>
            </span>
          </div>

          {/* 底部浮凸海报与标题元数据区 */}
          <div className="absolute bottom-2.5 sm:bottom-3 left-3.5 sm:left-4 right-3.5 sm:right-4 z-20 flex items-end gap-3 sm:gap-4">
            {/* 3D 浮凸立体微海报 */}
            <div className="relative w-14 sm:w-20 aspect-2/3 rounded-lg overflow-hidden border border-white/25 shadow-2xl shadow-black shrink-0 bg-black/80">
              {entity.cover ? (
                <img
                  src={entity.cover}
                  alt={entity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <Film size={20} />
                </div>
              )}
            </div>

            {/* 标题与评分年份 */}
            <div className="flex-1 min-w-0 pb-0.5 space-y-1">
              <h2
                id="modal-classic-title"
                className="text-base sm:text-xl md:text-2xl font-black text-white tracking-tight truncate drop-shadow-lg"
              >
                {entity.title}
              </h2>

              {entity.originalTitle && entity.originalTitle !== entity.title && (
                <p className="text-xs sm:text-sm text-white/55 italic truncate font-serif">
                  {entity.originalTitle}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs sm:text-sm text-white/75 pt-0.5">
                {entity.year && (
                  <span className="font-semibold text-amber-300">
                    {entity.year} 年
                  </span>
                )}
                {entity.rate && Number(entity.rate) > 0 && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold bg-black/65 px-1.5 py-0.5 rounded border border-white/10 text-xs">
                    <Star size={12} className="fill-amber-400" />
                    <span>{entity.rate}</span>
                  </span>
                )}
                <span className="text-white/40">·</span>
                <span className="text-white/65">{entity.type === 'movie' ? '电影' : '剧集'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 弹窗主体区 (内容舒展、带自然滚动防护) */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto">
          {/* 典藏公报卡片 (文质彬彬，信息通透) */}
          <div className="relative rounded-xl bg-white/[0.03] border border-white/10 p-3.5 sm:p-4 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-amber-400 via-rose-500 to-amber-600" />

            <div className="pl-2 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-300">
                <Sparkles size={14} className="text-amber-400 shrink-0" />
                <span>片库数字馆藏说明</span>
              </div>
              <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
                《{entity.title}》于 {entity.year || '早期'} 上映。受早期海外胶片数字化转换与版权分发所限，当前全网公网切片站暂未收录高清在线片源。
              </p>
              <p className="text-xs text-white/50 leading-relaxed">
                iKanPP 已为您完整收录百科图谱与权威资料。点击下方一键登记，平台将优先协调母带与高清正片上线！
              </p>
            </div>
          </div>

          {/* 旗舰级求片行动按钮 (饱满有质感) */}
          <div>
            <button
              onClick={handleSubmitDemand}
              disabled={isRequested || isSubmitting}
              className={`group w-full py-3 sm:py-3.5 px-6 rounded-xl sm:rounded-2xl font-black text-xs sm:text-base flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer shadow-xl ${
                isRequested
                  ? 'bg-emerald-950/50 text-emerald-300 border border-emerald-500/40 shadow-emerald-950/20 cursor-default'
                  : 'bg-linear-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 text-white shadow-red-600/30 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>正在登记求片需求...</span>
                </>
              ) : isRequested ? (
                <>
                  <CheckCircle2 size={18} className="text-emerald-400 animate-bounce" />
                  <span>已登记求片需求 · 平台优先协调调度</span>
                </>
              ) : (
                <>
                  <BellRing size={18} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>登记求片需求 · 优先调度正片上线</span>
                </>
              )}
            </button>

            {feedbackNotice && (
              <p className="text-xs text-center text-emerald-400 mt-2 animate-fade-in font-medium">
                {feedbackNotice}
              </p>
            )}
          </div>

          {/* 智能挽留推荐：精选同年代/同类型可播佳作 */}
          {relatedTitles.length > 0 && (
            <div className="pt-3 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs sm:text-sm font-bold text-white/85 flex items-center gap-1.5">
                  <Clapperboard size={15} className="text-red-400" />
                  <span>为您推荐同时代高分佳作</span>
                </span>
                <span className="text-xs text-white/40 flex items-center gap-1">
                  <span>点击直接看</span>
                  <ArrowRight size={12} />
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2.5 sm:gap-3.5">
                {relatedTitles.slice(0, 3).map((item) => (
                  <Link
                    key={item.entityId}
                    href={`/title/${item.entityId}-${item.slug}`}
                    onClick={onClose}
                    className="group block bg-white/[0.02] border border-white/10 hover:border-red-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
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
                          <Film size={18} />
                        </div>
                      )}
                      {item.rate && Number(item.rate) > 0 && (
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[10px] text-amber-400 font-bold flex items-center gap-0.5 border border-white/10">
                          <Star size={9} className="fill-amber-400" />
                          <span>{item.rate}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-0.5">
                      <p className="text-xs sm:text-sm text-white/90 font-medium truncate group-hover:text-red-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[11px] text-white/45 truncate">
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
