import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock } from 'lucide-react';
import { TitleEntity } from '@/lib/types/entity';
import { TitleActionsBar } from '@/components/title/TitleActionsBar';
import { genrePagePath } from '@/lib/data/genres';
import { regionLabel } from '@/lib/utils/region-label';
import { FlagTW, FlagHK } from '@/components/ui/RegionFlags';

interface TitleHeroProps {
  entity: TitleEntity;
  entityCover: string;
  effectiveSearchTitle: string;
  isSeasonSpecified: boolean;
  seasonTag: string;
  isTv: boolean;
  combinedRelated: TitleEntity[];
}

export function TitleHero({
  entity,
  entityCover,
  effectiveSearchTitle,
  isSeasonSpecified,
  seasonTag,
  isTv,
  combinedRelated,
}: TitleHeroProps) {
  return (
    <article className="flex gap-4 sm:gap-6">
      {entity.cover ? (
        <div className="hidden sm:block relative shrink-0 w-28 lg:w-32 aspect-2/3 rounded-xl overflow-hidden border border-white/15 bg-black/40 shadow-xl shadow-black/60">
          <Image
            src={entityCover}
            alt={`${entity.title} 封面海报`}
            fill
            sizes="128px"
            className="object-cover"
          />
        </div>
      ) : null}

      <div className="min-w-0 flex-1 flex flex-col items-start text-left">
        {/* 唯一语义主标题 H1 */}
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight mb-2 sm:mb-3 flex flex-wrap items-center gap-2 sm:gap-3">
          <span>{entity.title}</span>
          {isSeasonSpecified && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-xl bg-red-600/90 text-white font-black text-sm sm:text-lg tracking-wide">
              {seasonTag}
            </span>
          )}
          {entity.originalTitle && entity.originalTitle !== entity.title && (
            <span className="w-full block text-xs sm:text-base font-light text-white/50 tracking-normal font-sans">
              {entity.originalTitle}
            </span>
          )}
        </h1>

        {/* 港台公映译名徽章 */}
        {(entity.aiContent?.taiwanTitle || entity.aiContent?.hongkongTitle) && (
          <div className="w-full flex flex-wrap items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm font-medium">
            {entity.aiContent.taiwanTitle && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                <FlagTW className="w-3.5 h-2.5 sm:w-4 sm:h-3" />
                <span>台译：</span>
                <strong className="font-bold text-white">{entity.aiContent.taiwanTitle}</strong>
              </span>
            )}
            {entity.aiContent.hongkongTitle && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                <FlagHK className="w-3.5 h-2.5 sm:w-4 sm:h-3" />
                <span>港译：</span>
                <strong className="font-bold text-white">{entity.aiContent.hongkongTitle}</strong>
              </span>
            )}
          </div>
        )}

        {/* 基本信息：评分 / 年份 / 时长 / 集数 / 地区 */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-white/80 mb-2.5 sm:mb-4">
          {entity.rate && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {entity.rate} 分
            </span>
          )}
          {entity.year && (
            <span className="px-2 py-0.5 rounded-md bg-white/10 border border-white/10 font-semibold">
              {entity.year}
            </span>
          )}
          {entity.runtime ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60">
              <Clock className="w-3 h-3" />
              {entity.runtime} 分钟
            </span>
          ) : null}
          {isTv && entity.numberOfEpisodes && entity.numberOfEpisodes > 1 ? (
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70">
              共 {entity.numberOfEpisodes} 集
            </span>
          ) : null}
          {isTv && entity.status ? (
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/70">
              {entity.status}
            </span>
          ) : null}
          {regionLabel(entity.region) && (
            <span className="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-white/60">
              {regionLabel(entity.region)}
            </span>
          )}
        </div>

        {/* 题材分类标签 */}
        {entity.genres && entity.genres.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-5">
            {entity.genres.map((genre) => {
              const href = genrePagePath(genre);
              const chip =
                'px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-full bg-white/10 text-white/80 border border-white/10';
              return href ? (
                <Link
                  key={genre}
                  href={href}
                  className={`${chip} hover:bg-white/20 hover:text-white transition-colors`}
                >
                  {genre}
                </Link>
              ) : (
                <span key={genre} className={chip}>
                  {genre}
                </span>
              );
            })}
          </div>
        ) : null}

        {/* 主控行动区 (播放 / 追剧清单 / 分享 / 推荐) */}
        <div className="w-full">
          <TitleActionsBar
            entity={entity}
            playTitle={effectiveSearchTitle}
            relatedTitles={combinedRelated.slice(0, 6).map((r) => ({
              entityId: r.entityId,
              slug: r.slug,
              title: r.title,
              cover: r.cover,
              year: r.year,
              rate: r.rate,
            }))}
          />
        </div>
      </div>
    </article>
  );
}
