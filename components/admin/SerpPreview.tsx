'use client';

import React from 'react';
import { Globe, Star } from 'lucide-react';
import { TitleEntity } from '@/lib/types/entity';

interface SerpPreviewProps {
  entity: Partial<TitleEntity>;
}

export function SerpPreview({ entity }: SerpPreviewProps) {
  const title = entity.title || '影视标题';
  const siteName = 'iKanPP 爱看片片';
  const slug = entity.slug || 'slug-placeholder';
  const entityId = entity.entityId || 'ik000001';
  const rate = entity.rate || '8.5';
  const year = entity.year || '2026';
  const region = entity.region || '中国大陆';
  const genres = (entity.genres || []).slice(0, 3).join('/');
  
  // 模拟最终 SERP 标题
  const serpTitle = `${title} 在线观看 (完整未删减) - 高清免费播放 | ${siteName}`;
  const displayUrl = `https://www.ikanpp.com › title › ${entityId}-${slug}`;
  
  // 模拟描述
  const desc = entity.description || '全网高清影视聚合，极速秒开零卡顿，支持超清多清晰度流畅在线播放。';
  const snippet = `【${year}·${region}·${genres || '影视'}】豆瓣评分 ${rate} 分。${desc.slice(0, 110)}...`;

  return (
    <div className="p-5 rounded-2xl bg-[#12121A] border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-blue-400" />
          <span>Google 搜索结果 (SERP) 实时高保真预览</span>
        </span>
        <span className="text-[11px] text-slate-400 font-mono">Canonical: /title/{entityId}-{slug}</span>
      </div>

      <div className="p-4 rounded-xl bg-[#202124] text-left border border-white/5 shadow-inner">
        {/* URL 面包屑 */}
        <div className="flex items-center gap-2 text-[12px] text-[#bdc1c6] font-sans truncate">
          <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[9px] font-black text-white shrink-0">
            K
          </div>
          <span className="text-[#dadce0] font-medium">iKanPP 爱看片片</span>
          <span className="text-[#9aa0a6]">› title › {entityId}-{slug}</span>
        </div>

        {/* 标题 */}
        <h3 className="text-base sm:text-lg font-normal text-[#8ab4f8] hover:underline cursor-pointer truncate mt-1 leading-snug">
          {serpTitle}
        </h3>

        {/* 评分富媒体片段 */}
        <div className="flex items-center gap-2 text-xs text-[#bdc1c6] mt-1 font-sans">
          <div className="flex items-center text-amber-400">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="ml-1 font-medium text-white">{rate}</span>
          </div>
          <span>•</span>
          <span>评分 (豆瓣/TMDB)</span>
          <span>•</span>
          <span>{year} 年上映</span>
        </div>

        {/* Snippet 摘要 */}
        <p className="text-xs text-[#bdc1c6] mt-1.5 leading-relaxed line-clamp-2">
          {snippet}
        </p>
      </div>
    </div>
  );
}
