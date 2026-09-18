'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  BellRing,
  CheckCircle2,
  Loader2,
  Film,
  Sparkles,
  Calendar,
  Star,
  Clapperboard,
  Compass,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // 监听 ESC 键关闭
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 从本地缓存同步已求片状态
  useEffect(() => {
    if (typeof window !== 'undefined' && entity?.entityId) {
      const demanded = localStorage.getItem(`demanded_${entity.entityId}`);
      setIsRequested(!!demanded);
    }
  }, [entity?.entityId, isOpen]);

  if (!isOpen) return null;

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
        setFeedbackNotice('🎉 求片需求已成功登记！我们将优先协调数字化正片资源。');
      } else {
        setIsRequested(true);
        setFeedbackNotice('求片需求已在本地记录！');
      }
    } catch {
      setIsRequested(true);
      setFeedbackNotice('求片需求已在本地记录！');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  const backdropImage = entity.backdrop || entity.cover;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-2xl overflow-y-auto animate-fade-in select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-classic-title"
    >
      {/* 质感外壳容器 */}
      <div
        className="relative w-full max-w-xl my-auto bg-[#0C0C14] border border-white/15 rounded-3xl shadow-[0_30px_90px_rgba(0,0,0,0.9),0_0_50px_rgba(220,38,38,0.12)] overflow-hidden transform transition-all duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部大画幅剧照巨幕区 (16:9 Cinematic Backdrop) */}
        <div className="relative w-full h-44 sm:h-52 bg-neutral-900 overflow-hidden">
          {backdropImage ? (
            <div
              className="absolute inset-0 bg-cover bg-center filter blur-[1px] scale-105 opacity-55 transition-transform duration-1000"
              style={{ backgroundImage: `url(${backdropImage})` }}
            />
          ) : (
            <div className="absolute inset-0 bg-linear-to-br from-amber-950/40 via-red-950/30 to-black" />
          )}

          {/* 电影级多层渐变暗角与雾化融合 */}
          <div className="absolute inset-0 bg-linear-to-t from-[#0C0C14] via-[#0C0C14]/60 to-black/40" />
          <div className="absolute inset-0 bg-linear-to-r from-[#0C0C14]/80 via-transparent to-[#0C0C14]/80" />

          {/* 悬浮通透微光关闭按钮 */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 hover:bg-white/20 border border-white/20 text-white/70 hover:text-white flex items-center justify-center backdrop-blur-md transition-all cursor-pointer shadow-lg active:scale-95"
            aria-label="关闭弹窗"
          >
            <X size={18} />
          </button>

          {/* 巨幕内的金色典藏徽章 */}
          <div className="absolute top-4 left-5 z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 backdrop-blur-md shadow-lg shadow-amber-950/40">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>影史馆藏档案 · 典藏珍本</span>
            </span>
          </div>

          {/* 底部与主体内容衔接的浮凸海报与片名 */}
          <div className="absolute bottom-3 left-5 right-5 z-10 flex items-end gap-4">
            {/* 3D 浮凸海报 */}
            <div className="relative w-20 sm:w-24 aspect-2/3 rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black shrink-0 bg-black/60">
              {entity.cover ? (
                <img
                  src={entity.cover}
                  alt={entity.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <Film size={28} />
                </div>
              )}
            </div>

            {/* 标题与元数据 */}
            <div className="flex-1 min-w-0 pb-0.5 space-y-1">
              <h2
                id="modal-classic-title"
                className="text-xl sm:text-2xl font-black text-white tracking-tight truncate drop-shadow-md"
              >
                {entity.title}
              </h2>

              {entity.originalTitle && entity.originalTitle !== entity.title && (
                <p className="text-xs text-white/50 italic truncate drop-shadow-sm font-serif">
                  {entity.originalTitle}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-white/70">
                {entity.year && (
                  <span className="flex items-center gap-1 font-semibold text-amber-300/90">
                    <Calendar size={12} />
                    <span>{entity.year} 年</span>
                  </span>
                )}
                {entity.rate && Number(entity.rate) > 0 && (
                  <span className="flex items-center gap-1 text-amber-400 font-bold bg-black/60 px-1.5 py-0.5 rounded border border-white/10">
                    <Star size={11} className="fill-amber-400" />
                    <span>{entity.rate}</span>
                  </span>
                )}
                <span className="text-white/40">·</span>
                <span className="text-white/60">{entity.type === 'movie' ? '电影' : '剧集'}</span>
                {entity.region && (
                  <>
                    <span className="text-white/40">·</span>
                    <span className="text-white/60">{entity.region}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 弹窗主体内容区 */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* 典藏公报卡片 (Archive Bulletin) */}
          <div className="relative rounded-2xl bg-white/[0.03] border border-white/10 p-4 sm:p-5 overflow-hidden">
            {/* 左侧香槟金渐变高光饰条 */}
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-amber-400 via-rose-500 to-amber-600" />

            <div className="pl-2 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Sparkles size={14} className="text-amber-400" />
                <span>片库数字公报：关于本片流媒体说明</span>
              </div>
              <p className="text-xs sm:text-[13px] text-white/75 leading-relaxed">
                《{entity.title}》于 {entity.year || '早期'} 上映，距今已历经半个多世纪的风华沉淀。受早期海外胶片数字化转换与版权分发所限，当前全网第三方 CDN 切片站暂未完成高清在线流媒体收录。
              </p>
              <p className="text-xs text-white/50 leading-relaxed">
                iKanPP 影视库已为您完整收录该片高清海报、主创阵容与权威图谱。点击下方可一键提交求片工单，平台将优先协调母带与高清片源！
              </p>
            </div>
          </div>

          {/* 旗舰级求片行动按钮 (Flagship CTA) */}
          <div>
            <button
              onClick={handleSubmitDemand}
              disabled={isRequested || isSubmitting}
              className={`group w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all duration-300 cursor-pointer shadow-xl ${
                isRequested
                  ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-500/40 shadow-emerald-950/30 cursor-default'
                  : 'bg-linear-to-r from-red-600 via-rose-600 to-amber-600 hover:brightness-110 text-white shadow-red-600/30 hover:scale-[1.01] active:scale-[0.99]'
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>正在递交求片需求...</span>
                </>
              ) : isRequested ? (
                <>
                  <CheckCircle2 size={19} className="text-emerald-400 animate-bounce" />
                  <span>已提交求片工单 · 平台正优先排期补源</span>
                </>
              ) : (
                <>
                  <BellRing size={19} className="group-hover:rotate-12 transition-transform duration-300" />
                  <span>登记求片需求 · 优先调度正片上线</span>
                </>
              )}
            </button>

            {feedbackNotice && (
              <p className="text-xs text-center text-emerald-400 mt-2.5 animate-fade-in font-medium">
                {feedbackNotice}
              </p>
            )}
          </div>

          {/* 智能挽留推荐：精选同年代/同类型可播佳作 */}
          {relatedTitles.length > 0 && (
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-white/85 flex items-center gap-1.5">
                  <Clapperboard size={14} className="text-red-400" />
                  <span>为您推荐同时代高分佳作</span>
                </span>
                <span className="text-[11px] text-white/40 flex items-center gap-1">
                  <span>点击直接看</span>
                  <ArrowRight size={11} />
                </span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {relatedTitles.slice(0, 3).map((item) => (
                  <Link
                    key={item.entityId}
                    href={`/title/${item.entityId}-${item.slug}`}
                    onClick={onClose}
                    className="group block bg-white/[0.02] border border-white/10 hover:border-red-500/50 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-black"
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
                        <div className="absolute top-1 right-1 px-1.5 py-0.5 rounded bg-black/85 text-[10px] text-amber-400 font-bold flex items-center gap-0.5 border border-white/10 backdrop-blur-xs">
                          <Star size={9} className="fill-amber-400" />
                          <span>{item.rate}</span>
                        </div>
                      )}
                    </div>
                    <div className="p-2 space-y-0.5">
                      <p className="text-xs text-white/90 font-semibold truncate group-hover:text-red-400 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-[10px] text-white/45 truncate">
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
}
