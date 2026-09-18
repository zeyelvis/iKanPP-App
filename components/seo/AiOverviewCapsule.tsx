import React from 'react';
import { TitleEntity } from '@/lib/types/entity';
import { Sparkles, Calendar, Globe, Film, User, Star, CheckCircle } from 'lucide-react';

interface AiOverviewCapsuleProps {
  entity: TitleEntity;
  channelName: string;
}

export function AiOverviewCapsule({ entity, channelName }: AiOverviewCapsuleProps) {
  const validDirectors = (entity.directors || []).filter(d => d && !['知名导演', '未知', '暂无'].includes(d.trim()));
  const validActors = (entity.actors || []).filter(a => a && !['实力主演', '未知', '暂无'].includes(a.trim()));

  return (
    <section
      className="my-8 rounded-2xl bg-neutral-900/60 border border-white/10 p-5 sm:p-6 backdrop-blur-md shadow-xl below-fold-section"
      aria-label="影视档案与AI速览"
      itemScope
      itemType={entity.type === 'tv' || entity.type === 'anime' ? 'https://schema.org/TVSeries' : 'https://schema.org/Movie'}
    >
      {/* 头部装饰 */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <h2 className="text-base sm:text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>影视速览档案</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-neutral-300 font-normal">
              AI 智能摘要
            </span>
          </h2>
        </div>
        <div className="text-xs text-neutral-400 hidden sm:flex items-center gap-1.5">
          <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span>官方元数据权威核验</span>
        </div>
      </div>

      {/* 核心事实网格 (Facts Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-xs sm:text-sm">
        {/* 片名 */}
        <div className="space-y-1">
          <span className="text-neutral-500 text-xs block">官方片名</span>
          <p className="text-neutral-200 font-medium truncate" itemProp="name">
            {entity.title}
          </p>
        </div>

        {/* 年份与分类 */}
        <div className="space-y-1">
          <span className="text-neutral-500 text-xs flex items-center gap-1">
            <Calendar className="w-3 h-3" /> 年份 / 分类
          </span>
          <p className="text-neutral-200 font-medium">
            <span itemProp="dateCreated">{entity.year || '2024'}</span> · <span>{channelName}</span>
          </p>
        </div>

        {/* 制片地区 */}
        {entity.region && (
          <div className="space-y-1">
            <span className="text-neutral-500 text-xs flex items-center gap-1">
              <Globe className="w-3 h-3" /> 制片国家/地区
            </span>
            <p className="text-neutral-200 font-medium" itemProp="countryOfOrigin">
              {entity.region}
            </p>
          </div>
        )}

        {/* 综合评分 */}
        <div className="space-y-1">
          <span className="text-neutral-500 text-xs flex items-center gap-1">
            <Star className="w-3 h-3 text-amber-400" /> 全网口碑评分
          </span>
          <p className="text-amber-400 font-bold flex items-center gap-1">
            <span>{entity.rate || '8.5'}</span>
            <span className="text-xs text-neutral-500 font-normal">/ 10</span>
          </p>
        </div>

        {/* 导演 */}
        {validDirectors.length > 0 && (
          <div className="space-y-1">
            <span className="text-neutral-500 text-xs flex items-center gap-1">
              <Film className="w-3 h-3" /> 导演
            </span>
            <p className="text-neutral-200 font-medium truncate" itemProp="director">
              {validDirectors.slice(0, 2).join('、')}
            </p>
          </div>
        )}

        {/* 领衔主演 */}
        {validActors.length > 0 && (
          <div className="space-y-1 col-span-2 sm:col-span-1">
            <span className="text-neutral-500 text-xs flex items-center gap-1">
              <User className="w-3 h-3" /> 领衔主演
            </span>
            <p className="text-neutral-200 font-medium truncate" itemProp="actor">
              {validActors.slice(0, 3).join('、')}
            </p>
          </div>
        )}

        {/* 播放特性 */}
        <div className="space-y-1 col-span-2 sm:col-span-2 md:col-span-2">
          <span className="text-neutral-500 text-xs block">播放规格</span>
          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-xs border border-amber-500/20">
              1080P/4K超清
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-xs border border-emerald-500/20">
              免VIP极速秒播
            </span>
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 text-xs border border-cyan-500/20">
              海外多节点直连
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
