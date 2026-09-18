import React from 'react';
import Link from 'next/link';
import highPotentialData from '@/lib/data/seo-high-potential.json';

interface RelatedSearchChipsProps {
  currentTitle: string;
  currentGenre?: string;
  limit?: number;
}

export function RelatedSearchChips({
  currentTitle,
  currentGenre,
  limit = 8,
}: RelatedSearchChipsProps) {
  const allKeywords = highPotentialData?.keywords || [];
  if (allKeywords.length === 0) return null;

  // 过滤掉当前正在浏览的影片标题，避免自我死循环内链
  const filtered = allKeywords.filter(k => {
    const isSelf = k.title === currentTitle || k.query.includes(currentTitle) || currentTitle.includes(k.title);
    return !isSelf;
  });

  if (filtered.length === 0) return null;

  // 截取指定展示数量
  const displayItems = filtered.slice(0, limit);

  return (
    <section className="mt-8 mb-6 below-fold-section" aria-label="相关搜索与热门探索">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-amber-400 text-sm font-semibold tracking-wide flex items-center gap-1.5">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.66 11.2C17.43 10.9 17.15 10.64 16.89 10.38C16.22 9.78 15.46 9.35 14.82 8.72C13.33 7.26 13 4.85 13.95 3C13 3.23 12.17 3.75 11.46 4.32C8.87 6.4 7.85 10.07 9.07 13.22C9.11 13.32 9.15 13.42 9.15 13.55C9.15 13.77 9 13.97 8.8 14.05C8.57 14.15 8.33 14.08 8.14 13.93C8.08 13.88 8.04 13.83 8 13.76C6.87 12.33 6.69 10.28 7.45 8.64C5.78 10 4.87 12.3 5 14.47C5.06 14.97 5.17 15.47 5.41 15.97C5.7 16.57 6.1 17.16 6.61 17.68C8.75 19.8 12.06 20.37 14.77 19.06C17.47 17.76 19.08 14.94 18.66 12.03C18.57 11.42 18.25 10.87 17.66 11.2Z" />
          </svg>
          影迷热搜聚合
        </span>
        <span className="text-xs text-neutral-500">• 探索大家都在关注的精彩影视</span>
      </div>

      <div className="flex flex-wrap gap-2 sm:gap-2.5">
        {displayItems.map((item, idx) => (
          <Link
            key={`${item.query}-${idx}`}
            href={`/search?q=${encodeURIComponent(item.title || item.query)}`}
            title={`搜索观看《${item.title || item.query}》`}
            className="group inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-amber-500/10 border border-white/10 hover:border-amber-500/30 text-xs sm:text-sm text-neutral-300 hover:text-amber-300 transition-all duration-200 backdrop-blur-sm"
          >
            <span className="text-neutral-500 group-hover:text-amber-400/80 transition-colors text-xs">#</span>
            <span className="font-medium">{item.query}</span>
            {item.impressions > 5 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
