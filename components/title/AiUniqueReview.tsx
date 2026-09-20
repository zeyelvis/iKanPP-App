import React from 'react';
import { TitleEntity } from '@/lib/types/entity';
import { Sparkles, Compass, Users, Target, CheckCircle2 } from 'lucide-react';

interface AiUniqueReviewProps {
  entity: TitleEntity;
}

export function AiUniqueReview({ entity }: AiUniqueReviewProps) {
  const ai = entity.aiContent;
  if (!ai || (!ai.uniqueSynopsis && !ai.highlights?.length && !ai.characterAnalysis)) {
    return null;
  }

  return (
    <section 
      aria-label="iKanPP 独家深度视点与特约影评" 
      className="my-10 p-6 sm:p-8 rounded-3xl bg-linear-to-br from-[#121218] via-[#161622] to-[#0d0d12] border border-amber-500/20 shadow-2xl relative overflow-hidden below-fold-section"
    >
      {/* 氛围渐变光晕 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* 头部标题区 */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white tracking-wide flex items-center gap-2">
              <span>iKanPP 独家视点</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-linear-to-r from-amber-500/20 to-red-500/20 text-amber-300 font-bold border border-amber-500/30">
                特约深度解析
              </span>
            </h2>
            <p className="text-xs text-neutral-400 mt-0.5">
              由 iKanPP 影库研究团队特约撰写 · 深度剖析叙事张力、视听美学与角色弧光
            </p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>平台特约原创 · 严选深度长文</span>
        </div>
      </div>

      {/* 1. 独家剧情深度剖析 (Unique Synopsis) */}
      {ai.uniqueSynopsis && (
        <div className="relative z-10 mb-8 space-y-2">
          <h3 className="text-xs font-bold text-amber-400/90 uppercase tracking-widest flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5" />
            <span>叙事解构与剧情张力</span>
          </h3>
          <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-normal bg-black/20 p-4 sm:p-5 rounded-2xl border border-white/5">
            {ai.uniqueSynopsis}
          </p>
        </div>
      )}

      {/* 2. 三大核心高光看点 (Highlights Grid) */}
      {ai.highlights && ai.highlights.length > 0 && (
        <div className="relative z-10 mb-8 space-y-3">
          <h3 className="text-xs font-bold text-amber-400/90 uppercase tracking-widest flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5" />
            <span>三大核心高光看点 (HIGHLIGHTS)</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {ai.highlights.map((hl, idx) => (
              <div 
                key={idx} 
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/30 transition-all duration-300 flex items-start gap-3 group"
              >
                <div className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-400 font-black text-xs flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:scale-110 transition-transform">
                  0{idx + 1}
                </div>
                <div className="text-xs sm:text-sm text-neutral-300 leading-snug group-hover:text-white transition-colors">
                  {hl}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. 角色博弈与受众画像 (双栏布局) */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm">
        {ai.characterAnalysis && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>角色博弈与演技弧光</span>
            </span>
            <p className="text-neutral-300 leading-relaxed text-xs sm:text-sm">
              {ai.characterAnalysis}
            </p>
          </div>
        )}

        {ai.audienceFit && (
          <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-1.5">
            <span className="text-xs font-bold text-neutral-400 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-rose-400" />
              <span>推荐受众画像与观影姿势</span>
            </span>
            <p className="text-neutral-300 leading-relaxed text-xs sm:text-sm">
              {ai.audienceFit}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
