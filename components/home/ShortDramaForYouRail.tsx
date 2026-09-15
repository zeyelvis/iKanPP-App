'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { useShortDramaRecommendations } from './hooks/useShortDramaRecommendations';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

export function ShortDramaForYouRail() {
  const router = useRouter();
  const railRef = useRef<HTMLDivElement>(null);
  const { movies, loading, hasHistory } = useShortDramaRecommendations();

  const scroll = (direction: 'left' | 'right') => {
    if (!railRef.current) return;
    const distance = direction === 'left' ? -600 : 600;
    railRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  const handleClickDrama = (drama: any) => {
    const playUrl = drama.playUrl || drama.firstPlayUrl || '';
    const query = new URLSearchParams();
    if (drama.title) query.set('title', drama.title);
    if (playUrl) query.set('url', playUrl);
    if (drama.poster) query.set('poster', drama.poster);
    if (drama.id) query.set('id', String(drama.id));
    router.push(`/short/player?${query.toString()}`);
  };

  if (!loading && movies.length === 0) return null;

  return (
    <div className="relative my-6 sm:my-8 group/rail">
      {/* 头部标题区 */}
      <div className="flex items-center justify-between px-4 sm:px-8 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">{hasHistory ? '✨' : '🔥'}</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                {hasHistory ? '猜你想追 · 专属高能短剧' : '全网热搜 · 现象级微短剧'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-(--accent-color)/20 text-(--accent-color) border border-(--accent-color)/30">
                {hasHistory ? 'AI 偏好定制' : 'HOT 爆款'}
              </span>
            </div>
            <p className="text-xs text-white/40 mt-0.5">
              {hasHistory ? '根据你的观看偏好实时智能计算生成' : '全网亿级播放量爆款 · 极速直连爽看'}
            </p>
          </div>
        </div>

        {/* 左右滚动翻页按钮 */}
        <div className="hidden sm:flex items-center gap-1.5 opacity-0 group-hover/rail:opacity-100 transition-opacity">
          <button
            onClick={() => scroll('left')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <Icons.ChevronLeft size={16} />
          </button>
          <button
            onClick={() => scroll('right')}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer"
          >
            <Icons.ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* 横向滑轨 */}
      <div
        ref={railRef}
        className="content-rail-scroll flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar px-4 sm:px-8 pb-3 overscroll-x-contain"
      >
        {loading && movies.length === 0
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="w-[125px] sm:w-[150px] shrink-0 aspect-[9/14] rounded-2xl bg-white/5 animate-pulse"
              />
            ))
          : movies.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClickDrama(item)}
                className="w-[125px] sm:w-[150px] shrink-0 group cursor-pointer flex flex-col gap-1.5 transition-all duration-300 hover:scale-[1.03]"
              >
                {/* 海报卡片 */}
                <div className="relative aspect-[9/13.5] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-lg group-hover:border-(--accent-color) group-hover:shadow-(--accent-color)/20 transition-all">
                  <Image
                    src={getOptimizedImageUrl(item.poster)}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 130px, 160px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />

                  {/* 渐变暗影 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                  {/* 悬停播放指示 */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                    <div className="w-10 h-10 rounded-full bg-(--accent-color) text-white flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                      <Icons.Play size={20} className="ml-0.5 fill-white" />
                    </div>
                  </div>

                  {/* 推荐理由标签 */}
                  {item.reason && (
                    <div className="absolute top-2 left-2 right-2">
                      <span className="block px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-300 truncate border border-amber-400/20 shadow">
                        {item.reason}
                      </span>
                    </div>
                  )}

                  {/* 集数角标 */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between">
                    <span className="px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-bold text-white/90">
                      {item.remarks || (item.totalEpisodes ? `全${item.totalEpisodes}集` : '微短剧')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-(--accent-color)/80 text-[10px] font-black text-white">
                      {item.categoryName}
                    </span>
                  </div>
                </div>

                {/* 标题 */}
                <h3 className="text-xs sm:text-sm font-bold text-white/90 group-hover:text-(--accent-color) line-clamp-1 transition-colors">
                  {item.title}
                </h3>
              </div>
            ))}
      </div>
    </div>
  );
}
