'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/ui/Icon';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import {
  SHORT_DRAMA_COLLECTIONS,
  CuratedCollection,
} from '@/lib/data/collections-prebaked';

function DeckPosterItem({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  const [error, setError] = useState(false);
  const proxiedSrc = getOptimizedImageUrl(src);

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#161724]">
      {!error && proxiedSrc ? (
        <Image
          src={proxiedSrc}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 120px, 140px"
          loading={priority ? 'eager' : 'lazy'}
          unoptimized
          referrerPolicy="no-referrer"
          onError={() => setError(true)}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-[#151726] text-white/30 p-1">
          <Icons.Film size={18} />
        </div>
      )}
    </div>
  );
}

function ShortCollectionDeckCard({
  collection,
  index,
}: {
  collection: CuratedCollection;
  index: number;
}) {
  const router = useRouter();

  const p1 = collection.coverPosters[0];
  const p2 = collection.coverPosters[1] || p1;
  const p3 = collection.coverPosters[2] || p2;

  const handleClick = () => {
    router.push(`/collection/${collection.slug}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group/card shrink-0 w-[156px] sm:w-[210px] lg:w-[242px] cursor-pointer select-none transition-transform duration-200 hover:-translate-y-1 focus:outline-none"
      role="button"
      tabIndex={0}
      aria-label={`短剧片单：${collection.title}`}
    >
      <div className="relative">
        <div className="absolute top-0 right-0 z-40 text-xs sm:text-sm font-semibold text-white/90 font-mono tracking-tight select-none">
          +{collection.totalCount}
        </div>

        {/* 第 3 张海报 */}
        <div className="absolute left-[36px] sm:left-[48px] lg:left-[56px] top-[6px] bottom-[6px] w-[118px] sm:w-40 lg:w-46 rounded-2xl overflow-hidden border border-white/10 brightness-90 transition-transform duration-300 group-hover/card:translate-x-1.5 z-10">
          <DeckPosterItem src={p3} alt={`${collection.title} 海报3`} />
        </div>

        {/* 第 2 张海报 */}
        <div className="absolute left-[18px] sm:left-[24px] lg:left-[28px] top-[3px] bottom-[3px] w-[118px] sm:w-40 lg:w-46 rounded-2xl overflow-hidden border border-white/10 shadow-[3px_0_12px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover/card:translate-x-1 z-20">
          <DeckPosterItem src={p2} alt={`${collection.title} 海报2`} />
        </div>

        {/* 第 1 张主海报 */}
        <div className="relative w-[118px] sm:w-40 lg:w-46 aspect-[9/13.5] rounded-2xl overflow-hidden border border-white/15 shadow-[6px_0_20px_rgba(0,0,0,0.6)] group-hover/card:border-(--accent-color)/60 transition-all z-30">
          <DeckPosterItem
            src={p1}
            alt={`${collection.title} 主海报`}
            priority={index < 2}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity bg-black/30 backdrop-blur-[1px]">
            <div className="w-10 h-10 rounded-full bg-(--accent-color) text-white flex items-center justify-center shadow-xl scale-90 group-hover/card:scale-100 transition-transform">
              <Icons.Play size={18} className="ml-0.5 fill-white" />
            </div>
          </div>
        </div>
      </div>

      {/* 标题区 */}
      <div className="mt-3 w-[118px] sm:w-40 lg:w-46 space-y-1">
        <h3 className="text-sm font-bold text-white group-hover/card:text-(--accent-color) transition-colors line-clamp-1">
          {collection.title}
        </h3>
        <p className="text-xs text-white/50 line-clamp-1">
          {collection.subtitle}
        </p>
      </div>
    </div>
  );
}

export function ShortCollectionsRail() {
  const railRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!railRef.current) return;
    const distance = direction === 'left' ? -600 : 600;
    railRef.current.scrollBy({ left: distance, behavior: 'smooth' });
  };

  return (
    <div className="relative my-6 sm:my-8 group/rail">
      <div className="flex items-center justify-between px-4 sm:px-8 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl sm:text-2xl">📚</span>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                短剧策展合集 · 主题专属片单
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                6 大主题
              </span>
            </div>
            <p className="text-xs text-white/40 mt-0.5">
              战神回归 · 甜宠霸总 · 古风权谋 · 穿越年代精选合集
            </p>
          </div>
        </div>

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

      <div
        ref={railRef}
        className="content-rail-scroll flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar px-4 sm:px-8 pb-4 overscroll-x-contain"
      >
        {SHORT_DRAMA_COLLECTIONS.map((col, idx) => (
          <ShortCollectionDeckCard key={col.id} collection={col} index={idx} />
        ))}
      </div>
    </div>
  );
}
