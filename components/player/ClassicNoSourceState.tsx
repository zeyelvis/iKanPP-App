'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Film,
  Sparkles,
  BellRing,
  CheckCircle2,
  Loader2,
  BookOpen,
  Home,
  Calendar,
  Layers,
  Star,
  ChevronLeft,
} from 'lucide-react';
import { ContentRail, RailMovie } from '@/components/home/ContentRail';
import { getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

interface ClassicNoSourceStateProps {
  title: string;
  expectedYear?: string | null;
  expectedType?: string | null;
  entityId?: string | null;
  poster?: string | null;
  relatedMovies?: RailMovie[];
  loadingRelated?: boolean;
  onSelectMovie?: (movie: RailMovie) => void;
  onBack?: () => void;
}

export function ClassicNoSourceState({
  title,
  expectedYear,
  expectedType,
  entityId,
  poster,
  relatedMovies = [],
  loadingRelated = false,
  onSelectMovie,
  onBack,
}: ClassicNoSourceStateProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequested, setIsRequested] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const effectiveId = entityId || title;

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`demanded_${effectiveId}`);
      if (stored) setIsRequested(true);
    }
  }, [effectiveId]);

  const handleSubmitDemand = async () => {
    if (isRequested || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/title/demand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: effectiveId,
          title,
          year: expectedYear || undefined,
          type: expectedType || undefined,
          poster: poster || undefined,
        }),
      });

      if (res.ok) {
        setIsRequested(true);
        if (typeof window !== 'undefined') {
          localStorage.setItem(`demanded_${effectiveId}`, '1');
        }
        setFeedback('已为您成功登记求片需求！我们将优先协调补源。');
      } else {
        setIsRequested(true);
        setFeedback('求片心愿已在本地记录！');
      }
    } catch {
      setIsRequested(true);
      setFeedback('求片心愿已在本地记录！');
    } finally {
      setIsSubmitting(false);
      setTimeout(() => setFeedback(null), 4000);
    }
  };

  const detailUrl = getTitleCanonicalHref({ entityId: entityId || undefined, title });

  return (
    <div className="space-y-10 animate-fade-in">
      {/* 展台大卡片 */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-[#0E0E17]/95 p-6 sm:p-10 shadow-2xl">
        {/* 背景氛围晕染 */}
        <div className="absolute -top-32 -left-32 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row gap-6 md:gap-10 items-center md:items-start text-center md:text-left">
          {/* 左侧海报 */}
          <div className="relative w-36 sm:w-44 aspect-2/3 rounded-2xl overflow-hidden border border-white/15 shadow-2xl shadow-black/80 shrink-0 bg-white/5">
            {poster ? (
              <img
                src={poster}
                alt={title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/20">
                <Film size={40} />
              </div>
            )}
            {expectedYear && (
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/90 text-[11px] font-bold text-amber-400 border border-white/10">
                {expectedYear}
              </div>
            )}
          </div>

          {/* 右侧说明与行动区 */}
          <div className="flex-1 space-y-4 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/25">
              <span>🏛️</span>
              <span>历史经典档案 · 暂未上线在线播放资源</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              《{title}》
            </h1>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-white/60">
              {expectedYear && (
                <span className="flex items-center gap-1">
                  <Calendar size={13} />
                  <span>{expectedYear} 年出品</span>
                </span>
              )}
              <span className="flex items-center gap-1">
                <Layers size={13} />
                <span>{expectedType === 'tv' ? '电视剧' : '电影'}</span>
              </span>
              <span className="text-white/40">|</span>
              <span className="text-amber-300">公网切片暂无收录</span>
            </div>

            <p className="text-sm sm:text-base text-white/75 leading-relaxed">
              您访问的影视作品《{title}》年代较为久远，当前全网第三方公网切片采集源暂未上线有效流媒体播放切片。
              iKanPP 影视图谱已完好收录该作品百科资料。您可点击下方一键提交求片工单，或浏览同年代可播放的高分佳作。
            </p>

            {/* 操作按钮组合 */}
            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={handleSubmitDemand}
                disabled={isRequested || isSubmitting}
                className={`py-3 px-6 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                  isRequested
                    ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 cursor-default'
                    : 'bg-linear-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-600/30 hover:scale-[1.02] active:scale-[0.98]'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>正在提交求片...</span>
                  </>
                ) : isRequested ? (
                  <>
                    <CheckCircle2 size={16} className="text-emerald-400" />
                    <span>已提交求片需求 · 优先排期中</span>
                  </>
                ) : (
                  <>
                    <BellRing size={16} />
                    <span>🔔 提交求片工单 (一键登记催更)</span>
                  </>
                )}
              </button>

              <Link
                href={detailUrl}
                className="py-3 px-5 rounded-xl font-semibold text-sm bg-white/10 hover:bg-white/15 text-white border border-white/15 transition-all flex items-center gap-2 cursor-pointer hover:scale-[1.02]"
              >
                <BookOpen size={16} />
                <span>返回影视百科图谱</span>
              </Link>

              <Link
                href="/"
                className="py-3 px-4 rounded-xl font-semibold text-sm bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Home size={16} />
                <span>平台首页</span>
              </Link>
            </div>

            {feedback && (
              <p className="text-xs text-emerald-400 animate-fade-in font-medium pt-1">
                {feedback}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 智能挽留引流：同类可播影视推荐 */}
      <div className="pt-4">
        <ContentRail
          title="🍿 为您推荐同年代/同类型可播高分佳作"
          icon="✨"
          badge="RECOMMENDED"
          movies={relatedMovies}
          loading={loadingRelated}
          onMovieClick={onSelectMovie}
        />
      </div>
    </div>
  );
}
