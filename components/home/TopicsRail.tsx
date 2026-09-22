'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, Compass, ChevronLeft, ChevronRight, ArrowRight, Film } from 'lucide-react';
import { PREBAKED_TOPICS, TopicEntity } from '@/lib/services/topic-service';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

export function TopicsRail() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const topicsList = Object.values(PREBAKED_TOPICS);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const offset = direction === 'left' ? -360 : 360;
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    setTimeout(checkScroll, 300);
  };

  if (!topicsList || topicsList.length === 0) return null;

  return (
    <section className="relative my-8 sm:my-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* 头部标题与控制按钮 */}
      <div className="flex items-end justify-between mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5" />
            <span>深度策展 · 意图专栏</span>
          </div>
          <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>高分意图专题精选</span>
            <span className="text-xs font-normal text-neutral-400 hidden sm:inline">
              · 拒绝注水，一站式解决找片难题
            </span>
          </h2>
        </div>

        {/* 桌面端左右滚动按钮 */}
        <div className="hidden sm:flex items-center gap-1.5">
          <button
            onClick={() => handleScroll('left')}
            disabled={!canScrollLeft}
            aria-label="向左滚动"
            className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleScroll('right')}
            disabled={!canScrollRight}
            aria-label="向右滚动"
            className="w-8 h-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-white flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 滑轨容器 */}
      <div
        ref={scrollRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 -mx-4 px-4 sm:mx-0 sm:px-0 scroll-smooth"
      >
        {topicsList.map((topic) => (
          <TopicCard key={topic.slug} topic={topic} />
        ))}
      </div>
    </section>
  );
}

function TopicCard({ topic }: { topic: TopicEntity }) {
  const topPicks = topic.titles.slice(0, 3);

  return (
    <Link
      href={`/topic/${topic.slug}`}
      className="group shrink-0 w-[290px] sm:w-[340px] flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-[#121218]/90 border border-white/10 hover:border-amber-500/40 hover:-translate-y-1 transition-all duration-300 shadow-lg shadow-black/40 hover:shadow-amber-500/5 select-none"
    >
      <div>
        {/* 顶部标签 */}
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-[11px] font-bold text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>{topic.intentFamily || '精选专栏'}</span>
          </span>
          <span className="text-[11px] text-neutral-400">
            收录 {topic.titles.length} 部
          </span>
        </div>

        {/* 专题标题 */}
        <h3 className="text-sm sm:text-base font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug mb-2">
          {topic.topicTitle}
        </h3>

        {/* 策展导语摘录 */}
        <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed mb-4">
          {topic.curatorNote}
        </p>

        {/* 代表作海报预览栏 */}
        <div className="flex items-center gap-2 py-2 px-2.5 rounded-xl bg-white/[0.02] border border-white/5 mb-4">
          {topPicks.map((item, idx) => {
            const proxiedCover = item.cover ? getOptimizedImageUrl(item.cover) : null;
            return (
              <div key={idx} className="relative w-12 sm:w-14 aspect-2/3 rounded-lg overflow-hidden shrink-0 bg-neutral-900 border border-white/10">
                {proxiedCover ? (
                  <Image
                    src={proxiedCover}
                    alt={item.title}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <Film className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex flex-col justify-center min-w-0 pl-1">
            <span className="text-[11px] text-neutral-400 truncate">代表作：</span>
            <span className="text-xs font-medium text-white truncate">
              {topPicks.map(p => p.title).join('、')}
            </span>
          </div>
        </div>
      </div>

      {/* 底部探索链接 */}
      <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-amber-400/90 font-semibold group-hover:text-amber-400">
        <span>进入专栏深度探索</span>
        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
