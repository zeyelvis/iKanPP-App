import React from 'react';
import Link from 'next/link';
import highPotentialData from '@/lib/data/seo-high-potential.json';
import { generateFullSpectrumKeywords } from '@/lib/utils/seo-keyword-generator';
import { TitleEntity } from '@/lib/types/entity';

interface RelatedSearchChipsProps {
  currentTitle: string;
  currentGenre?: string;
  entity?: TitleEntity;
  limit?: number;
}

export function RelatedSearchChips({
  currentTitle,
  currentGenre,
  entity,
  limit = 12,
}: RelatedSearchChipsProps) {
  const allKeywords = highPotentialData?.keywords || [];

  // 1. 动态针对当前影片裂变专属意图 Chips 与跨维度 Discovery 探索标签
  const dynamicChips: Array<{ query: string; isDynamic?: boolean }> = [];
  if (entity || currentTitle) {
    const seoRes = generateFullSpectrumKeywords({
      title: entity?.title || currentTitle,
      year: entity?.year,
      type: entity?.type,
      genres: entity?.genres || (currentGenre ? [currentGenre] : []),
      directors: entity?.directors,
      actors: entity?.actors,
      region: entity?.region,
      numberOfEpisodes: entity?.numberOfEpisodes,
    });
    // 优先注入专属意图词
    for (const chip of seoRes.intentChips) {
      dynamicChips.push({ query: chip, isDynamic: true });
    }
    // 紧随其后注入 YAML 跨维度探索标签 (如 2026热门科幻电影、美国动作片推荐)
    for (const dChip of seoRes.discoveryChips) {
      dynamicChips.push({ query: dChip, isDynamic: true });
    }
  }

  // 2. 静态高潜词中过滤掉当前正在浏览的影片标题，避免死循环
  const filteredStatic = allKeywords
    .filter(k => {
      const isSelf = k.title === currentTitle || k.query.includes(currentTitle) || currentTitle.includes(k.title);
      return !isSelf;
    })
    .map(k => ({ query: k.query, title: k.title, impressions: k.impressions, isDynamic: false }));

  // 3. 动静结合：前 6~8 个为当前影片专属意图与跨维度探索词，后 4~6 个为全站高潜探索词
  const combined = [
    ...dynamicChips.slice(0, 8),
    ...filteredStatic.slice(0, limit - Math.min(dynamicChips.length, 8)),
  ];

  if (combined.length === 0) return null;
  const displayItems = combined.slice(0, limit);

  return (
    <section className="mt-8 mb-6 below-fold-section" aria-label="相关搜索与长尾探索">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-400 text-sm font-semibold tracking-wide flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.08 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.17 15.47 5.41 15.97C5.7 16.57 6.1 17.16 6.61 17.68C8.75 19.8 12.06 20.37 14.77 19.06C17.47 17.76 19.08 14.94 18.66 12.03C18.57 11.42 18.25 10.87 17.66 11.2Z" />
          </svg>
          影迷热搜与意图聚合
        </span>
        <span className="text-xs text-neutral-500">• 探索大家都在关注的精彩影视与全网长尾词</span>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {displayItems.map((item, idx) => (
          <Link
            key={`${item.query}-${idx}`}
            href={`/search?q=${encodeURIComponent((item as any).title || item.query)}`}
            title={`探索搜索《${(item as any).title || item.query}》`}
            className={`group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs sm:text-sm transition-all duration-200 backdrop-blur-sm ${
              item.isDynamic
                ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300 hover:text-amber-200'
                : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
            }`}
          >
            <span className="text-neutral-500 group-hover:text-amber-400/80 transition-colors text-xs">#</span>
            <span className="font-medium">{item.query}</span>
            {Boolean((item as any).impressions && (item as any).impressions > 5) && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}

