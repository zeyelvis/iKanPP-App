'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { useShortTrendingStore } from '@/lib/store/short-trending-store';
import { ShortDramaItem } from '@/lib/api/short-drama-sources';

export function ShortDramaTrendingRail() {
  const router = useRouter();
  const railRef = useRef<HTMLDivElement>(null);
  const [topDramas, setTopDramas] = useState<ShortDramaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { recordClick, getHeatBonus } = useShortTrendingStore();

  useEffect(() => {
    let isMounted = true;

    async function loadTrending() {
      try {
        const res = await fetch('/api/short-dramas/trending');
        if (!res.ok) throw new Error('Trending API error');
        const data = await res.json();
        const list: ShortDramaItem[] = data.list || [];

        if (isMounted) {
          // 综合排序：初始顺序权重 + 本地热度加成
          const ranked = list
            .map((item, idx) => {
              const baseScore = 10000 - idx * 200;
              const bonus = getHeatBonus(item.title);
              return { item, totalScore: baseScore + bonus };
            })
            .sort((a, b) => b.totalScore - a.totalScore)
            .map((obj) => obj.item);

          setTopDramas(ranked.slice(0, 10));
        }
      } catch (err) {
        console.error('Fetch trending dramas error:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadTrending();
    return () => {
      isMounted = false;
    };
  }, [getHeatBonus]);

  const scroll = (direction: 'left' | 'right') => {
    if (!railRef.current) return;
    const distance = direction === 'left' ? -600 : 600;
    railRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  const handleClickDrama = (drama: ShortDramaItem) => {
    recordClick(drama.title);
    const playUrl = drama.playUrl || drama.firstPlayUrl || '';
    const query = new URLSearchParams();
    if (drama.title) query.set('title', drama.title);
    if (playUrl) query.set('url', playUrl);
    if (drama.poster) query.set('poster', drama.poster);
    if (drama.id) query.set('id', String(drama.id));
    router.push(`/short/player?${query.toString()}`);
  };

  if (!loading && topDramas.length === 0) return null;

  return (
    <div className="relative my-6 sm:my-8 group/rail">
      {/* 头部标题栏 */}
      <div className="flex items-center justify-between px-4 sm:px-8 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">🔥</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                全网短剧实时热搜榜
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500/20 text-amber-400 border border-amber-500/30">
                TOP 10
              </span>
            </div>
            <p className="text-xs text-white/40 mt-0.5">
              亿级播放高能短剧实时热度风向标 · 每小时动态刷新
            </p>
          </div>
        </div>

        {/* 翻页按钮 */}
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

      {/* 滑轨容器 */}
      <div
        ref={railRef}
        className="flex overflow-x-auto no-scrollbar px-4 sm:px-8 pb-4 scroll-smooth"
      >
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 flex items-center pr-4"
                style={{ width: 'clamp(180px, 45vw, 240px)' }}
              >
                <div className="w-12 h-20 bg-white/5 rounded animate-pulse mr-2" />
                <div className="w-full aspect-[9/13.5] rounded-2xl bg-white/5 animate-pulse" />
              </div>
            ))
          : topDramas.map((drama, idx) => {
              const isDoubleDigit = idx + 1 >= 10;
              return (
                <div
                  key={drama.id}
                  onClick={() => handleClickDrama(drama)}
                  className="shrink-0 flex items-center cursor-pointer group select-none relative pr-4 sm:pr-6"
                >
                  {/* 立体大号描边排名数字 */}
                  <div
                    className={`top10-rank-number shrink-0 translate-x-3 sm:translate-x-5 z-10 select-none ${
                      isDoubleDigit ? 'is-double-digit tracking-[-0.15em]' : ''
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* 海报卡片 */}
                  <div
                    className="relative shrink-0 aspect-[9/13.5] rounded-2xl overflow-hidden bg-white/5 border border-white/10 shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:border-amber-400/80"
                    style={{ width: 'clamp(120px, 32vw, 175px)' }}
                  >
                    <Image
                      src={getOptimizedImageUrl(drama.poster)}
                      alt={drama.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="180px"
                      loading={idx < 3 ? 'eager' : 'lazy'}
                      unoptimized
                      referrerPolicy="no-referrer"
                    />

                    {/* 暗色渐变 */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/20" />

                    {/* 冠亚季军专属尊贵角标 */}
                    {idx === 0 && (
                      <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-amber-500 to-yellow-300 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                        <span>👑 TOP 1</span>
                      </div>
                    )}
                    {idx === 1 && (
                      <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-slate-200 to-gray-400 text-black text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                        <span>🥈 TOP 2</span>
                      </div>
                    )}
                    {idx === 2 && (
                      <div className="absolute top-2 left-2 z-20 bg-gradient-to-r from-amber-700 to-amber-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg flex items-center gap-1">
                        <span>🥉 TOP 3</span>
                      </div>
                    )}

                    {/* 悬停播放指示 */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 backdrop-blur-[2px]">
                      <div className="w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-2xl scale-90 group-hover:scale-100 transition-transform">
                        <Icons.Play size={20} className="ml-0.5 fill-black" />
                      </div>
                    </div>

                    {/* 底部信息 */}
                    <div className="absolute bottom-2 left-2 right-2 flex flex-col gap-0.5">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className="px-1.5 py-0.5 rounded bg-black/60 text-amber-300 font-black">
                          {drama.categoryName}
                        </span>
                        <span className="text-white/70 font-medium">
                          {drama.remarks || '全集完结'}
                        </span>
                      </div>
                      <h3 className="text-xs font-bold text-white line-clamp-1 group-hover:text-amber-300 transition-colors drop-shadow">
                        {drama.title}
                      </h3>
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
}
