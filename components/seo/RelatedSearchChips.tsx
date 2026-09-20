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

const KNOWN_GENRES = [
  '动作', '喜剧', '爱情', '科幻', '悬疑', '惊悚', '恐怖', '犯罪', '剧情', '战争', '奇幻', '冒险', '灾难', '武侠', '古装', '历史', '动画', '纪录'
];

function resolveCanonicalHref(query: string, currentGenre?: string, entity?: TitleEntity): string | null {
  const cleanQ = query.trim();

  // 1. 优先匹配题材分类 (/genre/[name])
  for (const g of KNOWN_GENRES) {
    if (cleanQ.includes(g)) {
      return `/genre/${encodeURIComponent(g)}`;
    }
  }

  // 2. 匹配专区频道
  if (cleanQ.includes('动漫') || cleanQ.includes('动画') || cleanQ.includes('国漫') || cleanQ.includes('番剧')) {
    return '/anime';
  }
  if (cleanQ.includes('电影') || cleanQ.includes('大片') || cleanQ.includes('院线')) {
    return '/movie';
  }
  if (cleanQ.includes('剧') || cleanQ.includes('连续剧') || cleanQ.includes('网剧')) {
    return '/tv';
  }
  if (cleanQ.includes('综艺')) {
    return '/variety';
  }
  if (cleanQ.includes('纪录')) {
    return '/documentary';
  }

  // 3. 兜底回退到当前作品的合法分类
  if (currentGenre && KNOWN_GENRES.includes(currentGenre)) {
    return `/genre/${encodeURIComponent(currentGenre)}`;
  }

  if (entity?.type) {
    const t = entity.type.toLowerCase();
    if (['movie', 'tv', 'anime', 'variety', 'documentary'].includes(t)) {
      return `/${t}`;
    }
  }

  // 4. 其他纯长尾意图词，不生成非规范抓取链接，返回 null 作为纯语义展示标签
  return null;
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
    // 紧随其后注入 YAML 跨维度探索标签
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

  // 3. 动静结合
  const combined = [
    ...dynamicChips.slice(0, 8),
    ...filteredStatic.slice(0, limit - Math.min(dynamicChips.length, 8)),
  ];

  if (combined.length === 0) return null;
  const displayItems = combined.slice(0, limit);

  return (
    <section className="mt-8 mb-6 below-fold-section" aria-label="影视分类与相关探索">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-400 text-sm font-semibold tracking-wide flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.08 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.17 15.47 5.41 15.97C5.7 16.57 6.1 17.16 6.61 17.68C8.75 19.8 12.06 20.37 14.77 19.06C17.47 17.76 19.08 14.94 18.66 12.03C18.57 11.42 18.25 10.87 17.66 11.2Z" />
          </svg>
          精彩影视分类与长尾探索
        </span>
        <span className="text-xs text-neutral-500">• 探索同类精彩作品与频道分类</span>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {displayItems.map((item, idx) => {
          const canonicalHref = resolveCanonicalHref(item.query, currentGenre, entity);
          const chipClasses = `group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs sm:text-sm transition-all duration-200 backdrop-blur-sm ${
            item.isDynamic
              ? 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/30 text-amber-300 hover:text-amber-200'
              : 'bg-white/5 hover:bg-white/10 border-white/10 text-neutral-300 hover:text-white'
          }`;

          if (canonicalHref) {
            return (
              <Link
                key={`${item.query}-${idx}`}
                href={canonicalHref}
                title={`浏览《${item.query}》相关分类`}
                className={chipClasses}
              >
                <span className="text-neutral-500 group-hover:text-amber-400/80 transition-colors text-xs">#</span>
                <span className="font-medium">{item.query}</span>
                {Boolean((item as any).impressions && (item as any).impressions > 5) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                )}
              </Link>
            );
          }

          return (
            <span
              key={`${item.query}-${idx}`}
              className={chipClasses}
            >
              <span className="text-neutral-500 text-xs">#</span>
              <span className="font-medium">{item.query}</span>
            </span>
          );
        })}
      </div>
    </section>
  );
}

