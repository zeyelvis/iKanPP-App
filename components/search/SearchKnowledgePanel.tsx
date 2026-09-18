'use strict';
'use client';

import React, { useEffect, useState, memo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icon';
import { TitleEntity } from '@/lib/types/entity';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { generateSlug } from '@/lib/data/entities/entity-utils';
import { parseSeasonFromTitle } from '@/lib/utils/season-resolver';

interface SearchKnowledgePanelProps {
  query?: string;
  onEntityLoaded?: (hasEntities: boolean) => void;
}

// 内存单例缓存，保证用户切词或返回时不发生重复网络抖动
const entitiesMemoryCache = new Map<string, TitleEntity[]>();

/**
 * 智能版本属性识别（区分动漫原版 vs 真人改编版）
 */
function getEditionInfo(entity: TitleEntity, allEntities: TitleEntity[], index: number) {
  if (allEntities.length <= 1) {
    return {
      tag: 'TMDB 官方权威认证 · 最高权重首推',
      badgeClass: 'bg-linear-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
      dotClass: 'bg-amber-400',
      tabLabel: '权威首推',
    };
  }

  const hasAnimation = (ent: TitleEntity) =>
    ent.genres?.some(g => g.includes('动') || g.includes('漫')) || ent.type === 'anime';

  const isAnimCurrent = hasAnimation(entity);
  const otherEntity = allEntities[index === 0 ? 1 : 0];
  const isAnimOther = otherEntity ? hasAnimation(otherEntity) : false;

  // 经典模式：动漫原版 vs 真人改编版
  if (isAnimCurrent && !isAnimOther) {
    return {
      tag: 'TMDB 官方认证 · 动漫原版',
      badgeClass: 'bg-linear-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
      dotClass: 'bg-amber-400',
      tabLabel: `动漫原版 · ${entity.year ? `${entity.year}年` : '连载'}`,
    };
  }
  if (!isAnimCurrent && isAnimOther) {
    return {
      tag: 'TMDB 官方认证 · 真人影视版',
      badgeClass: 'bg-linear-to-r from-sky-500/20 to-blue-500/20 text-sky-300 border-sky-500/30',
      dotClass: 'bg-sky-400',
      tabLabel: `真人影视 · ${entity.year ? `${entity.year}年` : '改编'}`,
    };
  }

  // 同为影视剧或同为动漫（如流浪地球 1 与 2）
  if (index === 0) {
    return {
      tag: `TMDB 官方认证 · ${entity.year ? `${entity.year} 首部` : '主推条目'}`,
      badgeClass: 'bg-linear-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border-amber-500/30',
      dotClass: 'bg-amber-400',
      tabLabel: `${entity.title} (${entity.year || '1'})`,
    };
  }

  return {
    tag: `TMDB 官方认证 · ${entity.year ? `${entity.year} 续作/衍生` : '系列条目'}`,
    badgeClass: 'bg-linear-to-r from-emerald-500/20 to-teal-500/20 text-emerald-300 border-emerald-500/30',
    dotClass: 'bg-emerald-400',
    tabLabel: `${entity.title} (${entity.year || '2'})`,
  };
}

/**
 * 单张影视实体知识卡片子组件
 */
const KnowledgeCard = memo(function KnowledgeCard({
  entity,
  editionInfo,
  searchQuery = '',
}: {
  entity: TitleEntity;
  editionInfo: ReturnType<typeof getEditionInfo>;
  searchQuery?: string;
}) {
  const [imageLoaded, setImageLoaded] = useState(false);

  // 季数智能透传：若用户搜索词指定了季数（如 "时光代理人第3季"），在母条目上精准对齐目标季
  const userSeasonInfo = searchQuery ? parseSeasonFromTitle(searchQuery) : null;
  const isSeasonSpecified = Boolean(userSeasonInfo && !entity.title.includes(userSeasonInfo.rawSeasonMatch));
  const targetSeasonTag = userSeasonInfo ? (userSeasonInfo.rawSeasonMatch || `第${userSeasonInfo.seasonNumber}季`) : '';
  const effectiveTitle = isSeasonSpecified ? `${entity.title}${targetSeasonTag}` : entity.title;

  // 统一使用全局规范的纯净 slug 地址，确保跳转到包含目标季的精准详情页
  const detailUrl = `/title/${generateSlug(effectiveTitle)}`;
  const posterUrl = getOptimizedImageUrl(entity.cover);
  const backdropUrl = entity.backdrop ? getOptimizedImageUrl(entity.backdrop) : '';

  const isSeries = entity.type === 'tv' || entity.type === 'anime';
  const episodeBadge = isSeries
    ? isSeasonSpecified
      ? `${targetSeasonTag} 连载正片`
      : entity.numberOfEpisodes && entity.numberOfEpisodes > 0
        ? `更新至 ${entity.numberOfEpisodes} 集`
        : '连载剧集'
    : '高清电影';

  const playUrl = `/player?${new URLSearchParams({
    title: effectiveTitle,
    type: isSeries ? 'tv' : 'movie',
    episode: '1',
  }).toString()}`;

  return (
    <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 shadow-2xl bg-neutral-950/80 backdrop-blur-xl group transition-all duration-300 hover:border-white/20 flex flex-col justify-between h-full">
      {/* 沉浸式剧照大底图 */}
      {backdropUrl && (
        <div
          className="absolute inset-0 bg-cover bg-center opacity-20 filter blur-[2px] scale-105 transition-transform duration-700 group-hover:scale-100 pointer-events-none"
          style={{ backgroundImage: `url(${backdropUrl})` }}
        />
      )}
      <div className="absolute inset-0 bg-linear-to-r from-neutral-950 via-neutral-950/90 to-neutral-900/80 pointer-events-none" />

      {/* 顶部版本标识栏 */}
      <div className="relative z-10 px-4 sm:px-5 pt-3 pb-2 flex items-center justify-between border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border shadow-xs ${editionInfo.badgeClass}`}>
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${editionInfo.dotClass}`} />
            {editionInfo.tag}
          </span>
        </div>
        <Link
          href={detailUrl}
          className="text-xs text-neutral-400 hover:text-white transition-colors flex items-center gap-0.5"
        >
          <span>进入影视图谱</span>
          <Icons.ChevronRight size={13} />
        </Link>
      </div>

      {/* 卡片核心主体 */}
      <div className="relative z-10 p-4 sm:p-5 flex flex-row gap-3.5 sm:gap-5 flex-1">
        {/* 左侧海报 */}
        <div className="relative w-24 sm:w-32 md:w-36 aspect-2/3 rounded-xl sm:rounded-2xl overflow-hidden shrink-0 shadow-xl ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-300 group/poster block self-start">
          <Link href={detailUrl} className="absolute inset-0 z-0">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-neutral-800 animate-pulse" />
            )}
            <Image
              src={posterUrl}
              alt={entity.title}
              fill
              sizes="(max-width: 640px) 96px, (max-width: 768px) 128px, 144px"
              className={`object-cover transition-all duration-500 group-hover/poster:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              priority
            />
          </Link>
          {/* 集数/更新角标 */}
          <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-black/80 backdrop-blur-md text-amber-300 border border-amber-500/30 shadow-md pointer-events-none z-10">
            {episodeBadge}
          </div>
          {/* 海报浮动秒播按钮 */}
          <Link
            href={playUrl}
            className="absolute inset-0 bg-black/30 opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10"
            title={`立即播放《${entity.title}》`}
          >
            <div className="w-10 h-10 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center shadow-lg shadow-red-600/40 transform scale-90 group-hover/poster:scale-100 transition-transform">
              <Icons.Play size={18} className="fill-current ml-0.5" />
            </div>
          </Link>
        </div>

        {/* 右侧详细图谱与信息 */}
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            {/* 标题与基本属性 */}
            <div className="flex flex-wrap items-baseline gap-2 mb-1.5">
              <Link
                href={detailUrl}
                className="text-base sm:text-xl font-bold text-white hover:text-red-400 transition-colors tracking-tight line-clamp-1"
                title={effectiveTitle}
              >
                <span>{entity.title}</span>
              </Link>
              {isSeasonSpecified && (
                <span className="px-2 py-0.5 rounded-md bg-red-600 text-white font-bold text-xs sm:text-sm shadow-md shadow-red-600/30">
                  {targetSeasonTag}
                </span>
              )}
              {entity.year && (
                <span className="text-xs sm:text-sm font-normal text-neutral-400">
                  ({entity.year})
                </span>
              )}
            </div>

            {/* 标签、评分与状态指标栏 */}
            <div className="flex flex-wrap items-center gap-1.5 mb-2.5">
              {entity.rate && parseFloat(entity.rate) > 0 && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  <span className="text-amber-400">★</span>
                  <span>{entity.rate}</span>
                </div>
              )}

              {entity.genres && entity.genres.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {entity.genres.slice(0, 2).map((genre) => (
                    <span
                      key={genre}
                      className="px-1.5 py-0.5 rounded-md text-[10px] bg-white/5 text-neutral-300 border border-white/10"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {entity.numberOfEpisodes ? (
                <span className="text-[11px] text-neutral-400 px-1.5 py-0.5 bg-neutral-800/80 rounded-md border border-neutral-700/60">
                  共 {entity.numberOfEpisodes} 集
                </span>
              ) : null}
            </div>

            {/* 演职员阵容 */}
            {(entity.directors?.length > 0 || entity.actors?.length > 0) && (
              <div className="text-[11px] text-neutral-400 space-y-0.5 mb-2">
                {entity.directors?.length > 0 && (
                  <p className="truncate">
                    <span className="text-neutral-500 font-medium">导演：</span>
                    <span className="text-neutral-300">
                      {entity.directors.slice(0, 2).join(' / ')}
                    </span>
                  </p>
                )}
                {entity.actors?.length > 0 && (
                  <p className="truncate">
                    <span className="text-neutral-500 font-medium">
                      {entity.type === 'anime' ? '配音：' : '主演：'}
                    </span>
                    <span className="text-neutral-300">
                      {entity.actors.slice(0, 4).join(' / ')}
                    </span>
                  </p>
                )}
              </div>
            )}

            {/* 剧情梗概 */}
            {entity.description && (
              <p className="text-xs text-neutral-300/85 leading-relaxed line-clamp-2 mb-2">
                {entity.description}
              </p>
            )}
          </div>

          {/* 底部行动号召 (CTA) 区域 */}
          <div className="pt-2 flex flex-wrap items-center gap-2 border-t border-white/10 mt-auto">
            <Link
              href={playUrl}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-red-600 hover:bg-red-500 text-white shadow-md shadow-red-600/30 hover:scale-105 active:scale-95 transition-all duration-300 cursor-pointer"
            >
              <Icons.Play size={14} className="fill-white" />
              <span>立即播放 · 查看全集</span>
            </Link>

            <Link
              href={detailUrl}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-medium text-neutral-300 bg-white/10 hover:bg-white/20 hover:text-white border border-white/10 transition-colors"
            >
              <span>图谱详情</span>
              <Icons.ChevronRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
});

export const SearchKnowledgePanel = memo(function SearchKnowledgePanel({
  query = '',
  onEntityLoaded,
}: SearchKnowledgePanelProps) {
  const cleanQuery = query.trim();
  const [entities, setEntities] = useState<TitleEntity[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    if (!cleanQuery || cleanQuery.length < 2) {
      setEntities([]);
      setLoading(false);
      setActiveTab(0);
      onEntityLoaded?.(false);
      return;
    }

    // 命中内存缓存
    if (entitiesMemoryCache.has(cleanQuery)) {
      const cached = entitiesMemoryCache.get(cleanQuery) || [];
      setEntities(cached);
      setActiveTab(0);
      onEntityLoaded?.(cached.length > 0);
      return;
    }

    let isSubscribed = true;
    setLoading(true);

    const timer = setTimeout(() => {
      fetch(`/api/entity-search?q=${encodeURIComponent(cleanQuery)}`)
        .then((res) => {
          if (!res.ok) throw new Error('Search failed');
          return res.json();
        })
        .then((data: { entities?: TitleEntity[]; entity?: TitleEntity | null }) => {
          if (!isSubscribed) return;
          const found = data?.entities && data.entities.length > 0
            ? data.entities
            : (data?.entity ? [data.entity] : []);

          entitiesMemoryCache.set(cleanQuery, found);
          setEntities(found);
          setActiveTab(0);
          onEntityLoaded?.(found.length > 0);
        })
        .catch(() => {
          if (!isSubscribed) return;
          entitiesMemoryCache.set(cleanQuery, []);
          setEntities([]);
          onEntityLoaded?.(false);
        })
        .finally(() => {
          if (isSubscribed) setLoading(false);
        });
    }, 150);

    return () => {
      isSubscribed = false;
      clearTimeout(timer);
    };
  }, [cleanQuery, onEntityLoaded]);

  // 加载状态骨架屏
  if (loading && entities.length === 0) {
    return (
      <div className="relative mb-6 rounded-2xl overflow-hidden border border-white/10 bg-neutral-900/40 p-4 sm:p-5 animate-pulse">
        <div className="flex gap-4 sm:gap-6">
          <div className="w-24 sm:w-32 aspect-2/3 rounded-xl bg-white/5 shrink-0" />
          <div className="flex-1 space-y-3 py-1">
            <div className="h-5 bg-white/10 rounded w-1/3" />
            <div className="h-4 bg-white/5 rounded w-1/4" />
            <div className="h-10 bg-white/5 rounded w-full hidden sm:block" />
            <div className="h-8 bg-white/10 rounded-full w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (entities.length === 0) return null;

  // 单实体场景：保持经典全宽卡片展示
  if (entities.length === 1) {
    const single = entities[0];
    const info = getEditionInfo(single, entities, 0);
    return (
      <div className="mb-8">
        <KnowledgeCard entity={single} editionInfo={info} searchQuery={cleanQuery} />
      </div>
    );
  }

  // 双实体场景（例如动漫原版 + 真人改编版）：桌面端双联并排，移动端 Tab 灵动切换
  const activeEntity = entities[activeTab] || entities[0];
  const activeInfo = getEditionInfo(activeEntity, entities, activeTab);

  return (
    <div className="mb-8">
      {/* 桌面端与宽屏（>= 1024px）：双联并排网格展示，一览无余 */}
      <div className="hidden lg:grid lg:grid-cols-2 gap-4.5">
        {entities.map((ent, idx) => (
          <KnowledgeCard
            key={ent.entityId}
            entity={ent}
            editionInfo={getEditionInfo(ent, entities, idx)}
            searchQuery={cleanQuery}
          />
        ))}
      </div>

      {/* 移动端与中窄屏（< 1024px）：灵动 Tab 切换栏 + 单卡紧凑呈现 */}
      <div className="block lg:hidden">
        <div className="flex items-center gap-2 mb-3 bg-neutral-900/70 p-1.5 rounded-2xl border border-white/10 w-fit">
          {entities.map((ent, idx) => {
            const tabInfo = getEditionInfo(ent, entities, idx);
            const isSelected = activeTab === idx;
            return (
              <button
                key={ent.entityId}
                onClick={() => setActiveTab(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-white' : tabInfo.dotClass}`} />
                <span>{tabInfo.tabLabel}</span>
              </button>
            );
          })}
        </div>

        <KnowledgeCard entity={activeEntity} editionInfo={activeInfo} searchQuery={cleanQuery} />
      </div>
    </div>
  );
});
