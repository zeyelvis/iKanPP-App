'use client';

import React from 'react';
import { Film, Sparkles, Building2, Flame, Award } from 'lucide-react';

export interface StudioInfo {
  id: string;
  name: string;
  codePrefix: string;
  tagline: string;
  color: string;
  gradient: string;
  videoCount: string;
  rating: string;
}

export const TOP_STUDIOS: StudioInfo[] = [
  {
    id: 's1',
    name: 'S1 NO.1 STYLE',
    codePrefix: 'SSIS',
    tagline: '业界第一美少女殿堂 · 河北彩花/三上悠亚专属厂牌',
    color: 'text-amber-400',
    gradient: 'from-amber-500/20 via-yellow-600/10 to-transparent',
    videoCount: '1,280+',
    rating: '9.9',
  },
  {
    id: 'moodyz',
    name: 'MOODYZ',
    codePrefix: 'MIDE',
    tagline: '企划与剧情之王 · 年度销量总冠军大厂',
    color: 'text-pink-400',
    gradient: 'from-pink-500/20 via-rose-600/10 to-transparent',
    videoCount: '2,150+',
    rating: '9.8',
  },
  {
    id: 'ipx',
    name: 'IDEA POCKET',
    codePrefix: 'IPZZ',
    tagline: '专属女神梦工厂 · 高颜值与治愈系天花板',
    color: 'text-purple-400',
    gradient: 'from-purple-500/20 via-indigo-600/10 to-transparent',
    videoCount: '980+',
    rating: '9.8',
  },
  {
    id: 'sod',
    name: 'SOD CREATE',
    codePrefix: 'STARS',
    tagline: '企划创意鼻祖 · 脑洞魔镜与真实社会实验',
    color: 'text-emerald-400',
    gradient: 'from-emerald-500/20 via-teal-600/10 to-transparent',
    videoCount: '1,640+',
    rating: '9.7',
  },
  {
    id: 'faleno',
    name: 'FALENO',
    codePrefix: 'FSDSS',
    tagline: '新世代电影级轻奢厂牌 · 唯美画质典范',
    color: 'text-cyan-400',
    gradient: 'from-cyan-500/20 via-blue-600/10 to-transparent',
    videoCount: '520+',
    rating: '9.7',
  },
  {
    id: 'fc2',
    name: 'FC2-PPV',
    codePrefix: 'FC2',
    tagline: '全网最火爆素人无码破解专区 · 真实无删减',
    color: 'text-rose-400',
    gradient: 'from-rose-500/20 via-red-600/10 to-transparent',
    videoCount: '3,800+',
    rating: '9.9',
  },
  {
    id: 'prestige',
    name: 'PRESTIGE',
    codePrefix: 'ABW',
    tagline: '潮流制服与唯美模特系标杆',
    color: 'text-violet-400',
    gradient: 'from-violet-500/20 via-purple-600/10 to-transparent',
    videoCount: '1,100+',
    rating: '9.6',
  },
  {
    id: 'attackers',
    name: 'ATTACKERS',
    codePrefix: 'ATID',
    tagline: '悬疑反转与熟女人妻天花板',
    color: 'text-amber-500',
    gradient: 'from-amber-600/20 via-orange-600/10 to-transparent',
    videoCount: '890+',
    rating: '9.6',
  },
];

interface JableStudioGalaxyProps {
  onSelectStudio?: (studio: StudioInfo) => void;
}

export function JableStudioGalaxy({ onSelectStudio }: JableStudioGalaxyProps) {
  return (
    <section className="space-y-4 pt-2">
      {/* 标题 */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-4 bg-gradient-to-b from-purple-400 to-pink-600 rounded-full" />
          <h3 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center gap-2">
            <Building2 size={18} className="text-purple-400" />
            <span>日本顶流片商宇宙 · 厂牌直达</span>
          </h3>
        </div>
        <span className="text-xs text-white/40 font-mono hidden sm:inline">
          8 大官方正版授权厂牌
        </span>
      </div>

      {/* 厂牌卡片网格 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {TOP_STUDIOS.map((studio) => (
          <div
            key={studio.id}
            onClick={() => onSelectStudio && onSelectStudio(studio)}
            className="group relative flex flex-col justify-between p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.07] border border-white/10 hover:border-purple-500/40 shadow-lg hover:shadow-purple-950/40 transition-all duration-300 overflow-hidden cursor-pointer hover:-translate-y-1"
          >
            {/* 背景动态流光渐变 */}
            <div
              className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${studio.gradient} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}
            />

            {/* 顶部厂牌名与番号代号 */}
            <div className="space-y-1.5 z-10">
              <div className="flex items-center justify-between">
                <span className={`text-xs sm:text-sm font-black tracking-wider uppercase ${studio.color}`}>
                  {studio.name}
                </span>
                <span className="px-1.5 py-0.5 rounded-md bg-white/10 text-[9px] font-mono text-white/70 font-bold">
                  {studio.codePrefix}-
                </span>
              </div>
              <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed group-hover:text-white/80 transition-colors">
                {studio.tagline}
              </p>
            </div>

            {/* 底部收录量与评分 */}
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-white/5 text-[10px] text-white/40 z-10">
              <span className="flex items-center gap-1">
                <Film size={11} className="text-purple-400" />
                <strong className="text-white/80 font-bold">{studio.videoCount}</strong>
              </span>
              <span className="flex items-center gap-1 text-amber-300 font-bold">
                <Award size={11} className="text-amber-400" />
                {studio.rating}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
