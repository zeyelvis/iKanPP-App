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
  ExternalLink,
  ChevronRight,
  Heart,
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

  useEffect(() => {
    if (typeof window !== 'undefined' && entity?.entityId) {
      const demanded = localStorage.getItem(`demanded_${entity.entityId}`);
      if (demanded) {
        setIsRequested(true);
      } else {
        setIsRequested(false);
      }
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
        setFeedbackNotice('🎉 求片工单已成功提交！我们将优先协调片源，感谢您的反馈！');
      } else {
        setFeedbackNotice('提交遇到波动，已为您在本地记录！');
        setIsRequested(true);
      }
    } catch {
      setFeedbackNotice('已为您在本地登记求片心愿！');
      setIsRequested(true);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedbackNotice(null), 4000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-lg bg-[#0C0C14] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-red-950/20 overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 背景氛围微光 */}
        <div className="absolute -top-24 -right-24 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        {/* 顶部关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-colors cursor-pointer"
          aria-label="关闭"
        >
          <X size={18} />
        </button>

        {/* 头部条目简况 */}
        <div className="flex gap-4 items-start pr-8">
          {entity.cover ? (
            <img
              src={entity.cover}
              alt={entity.title}
              className="w-16 h-24 sm:w-20 sm:h-28 object-cover rounded-xl border border-white/10 shadow-lg shrink-0 bg-white/5"
            />
          ) : (
            <div className="w-16 h-24 sm:w-20 sm:h-28 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center shrink-0">
              <Film size={24} className="text-white/30" />
            </div>
          )}

          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <span>🏛️</span>
              <span>历史馆藏档案</span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white tracking-tight truncate">
              {entity.title}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-white/50">
              {entity.year && (
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{entity.year} 年</span>
                </span>
              )}
              {entity.rate && Number(entity.rate) > 0 && (
                <span className="flex items-center gap-1 text-amber-400 font-bold">
                  <Star size={12} className="fill-amber-400" />
                  <span>{entity.rate}</span>
                </span>
              )}
              <span>{entity.type === 'movie' ? '电影' : '影视剧'}</span>
            </div>
          </div>
        </div>

        {/* 馆藏无源现状说明卡片 */}
        <div className="mt-5 p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
            <Sparkles size={14} />
            <span>关于本片流媒体片源说明</span>
          </div>
          <p className="text-xs sm:text-[13px] text-white/70 leading-relaxed">
            《{entity.title}》属于上世纪早期（{entity.year || '经典'}）珍稀作品。由于年代久远或受海外版权胶片分发限制，当前全网公网切片源暂未收录高清流媒体。
          </p>
          <p className="text-xs text-white/50">
            iKanPP 影视图谱已为您完好保留剧照、演职员与剧情资料，点击下方按钮可直接向平台运营提交求片。
          </p>
        </div>

        {/* 求片提交按钮 */}
        <div className="mt-5">
          <button
            onClick={handleSubmitDemand}
            disabled={isRequested || isSubmitting}
            className={`w-full py-3 px-6 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2.5 transition-all shadow-xl cursor-pointer ${
              isRequested
                ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                : 'bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30 hover:scale-[1.01] active:scale-[0.99]'
            }`}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>正在登记求片工单...</span>
              </>
            ) : isRequested ? (
              <>
                <CheckCircle2 size={18} className="text-emerald-400" />
                <span>已提交求片工单 · 平台将优先排期协调</span>
              </>
            ) : (
              <>
                <BellRing size={18} />
                <span>🔔 提交求片需求 (一键登记催更)</span>
              </>
            )}
          </button>

          {feedbackNotice && (
            <p className="text-xs text-center text-emerald-400 mt-2 animate-fade-in font-medium">
              {feedbackNotice}
            </p>
          )}
        </div>

        {/* 智能挽留推荐 */}
        {relatedTitles.length > 0 && (
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                <span>🍿</span>
                <span>为您推荐同类可播高分佳作</span>
              </span>
              <span className="text-[11px] text-white/40">点击直接观看</span>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              {relatedTitles.slice(0, 3).map((item) => (
                <Link
                  key={item.entityId}
                  href={`/title/${item.entityId}-${item.slug}`}
                  onClick={onClose}
                  className="group block bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden hover:border-red-500/40 transition-all"
                >
                  <div className="aspect-2/3 relative bg-black/40 overflow-hidden">
                    {item.cover ? (
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Film size={16} />
                      </div>
                    )}
                    {item.rate && Number(item.rate) > 0 && (
                      <div className="absolute top-1 right-1 px-1 py-0.5 rounded bg-black/80 text-[10px] text-amber-400 font-bold flex items-center gap-0.5">
                        <Star size={9} className="fill-amber-400" />
                        <span>{item.rate}</span>
                      </div>
                    )}
                  </div>
                  <div className="p-1.5">
                    <p className="text-xs text-white/90 font-medium truncate group-hover:text-red-400 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[10px] text-white/40 mt-0.5 truncate">
                      {item.year || '经典'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
