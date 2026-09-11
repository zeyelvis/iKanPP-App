'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  CuratedCollection,
  CURATED_COLLECTIONS,
  CollectionSubject,
} from '@/lib/data/collections-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { Icons } from '@/components/ui/Icon';

interface CollectionDetailClientProps {
  collection: CuratedCollection;
}

function CollectionFilmCard({ film, idx }: { film: CollectionSubject; idx: number }) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);
  const proxiedCover = getOptimizedImageUrl(film.cover);

  const handleClick = () => {
    router.push(`/title/${generateSlug(film.title)}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group/card cursor-pointer select-none rounded-2xl overflow-hidden bg-[#12131D]/80 border border-white/10 hover:border-amber-400/50 transition-all duration-300 hover:-translate-y-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.4)] flex flex-col"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* 封面海报容器 */}
      <div className="relative aspect-[2/3] w-full bg-black/50 overflow-hidden">
        {!imageError && proxiedCover ? (
          <Image
            src={proxiedCover}
            alt={film.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            loading={idx < 6 ? 'eager' : 'lazy'}
            className="object-cover transition-transform duration-500 group-hover/card:scale-108"
            unoptimized
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full p-4 flex flex-col justify-between items-center text-center bg-gradient-to-br from-[#1e1e2f] via-[#12131d] to-[#07070b]">
            <div className="text-[10px] font-black tracking-widest text-white/30 uppercase">
              iKanPP 4K
            </div>
            <div className="flex flex-col items-center gap-1.5 my-auto">
              <Icons.Film size={24} className="text-amber-400/80" />
              <h4 className="text-xs font-bold text-white/90 line-clamp-2">
                {film.title}
              </h4>
            </div>
            <div className="text-[10px] text-white/40 font-mono">
              {film.year || '精选原声'}
            </div>
          </div>
        )}

        {/* 评分角标 */}
        {film.rate && parseFloat(film.rate) > 0 && (
          <div className="absolute top-2 right-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1 border border-white/15 shadow-md z-10">
            <Icons.Star size={10} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-black text-amber-300">
              {film.rate}
            </span>
          </div>
        )}

        {/* 序号徽标 */}
        <div className="absolute top-2 left-2 w-6 h-6 rounded-lg bg-black/70 backdrop-blur-md flex items-center justify-center text-[11px] font-black text-white/80 border border-white/10 z-10">
          {idx + 1}
        </div>

        {/* 悬停遮罩与立即播放按钮 */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-all duration-300 flex flex-col justify-end p-3 z-20 pointer-events-none">
          <div className="w-full py-1.5 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl flex items-center justify-center gap-1 shadow-lg active:scale-95 transition-transform pointer-events-auto">
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
            立即观看
          </div>
        </div>
      </div>

      {/* 底部详细信息 */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-white group-hover/card:text-amber-400 transition-colors line-clamp-1">
            {film.title}
          </h3>

          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-white/50">
            <span>{film.year || '2024'}</span>
            {film.types && film.types.length > 0 && (
              <>
                <span>·</span>
                <span className="truncate">{film.types.slice(0, 2).join('/')}</span>
              </>
            )}
          </div>

          {film.description && (
            <p className="text-[11px] text-white/40 mt-1.5 line-clamp-2 leading-relaxed">
              {film.description}
            </p>
          )}
        </div>

        {film.actors && film.actors.length > 0 && (
          <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-white/40 truncate">
            主演：{film.actors.slice(0, 3).join(', ')}
          </div>
        )}
      </div>
    </div>
  );
}

export function CollectionDetailClient({ collection }: CollectionDetailClientProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);

  // 平均分计算
  const validRates = collection.films
    .map((f) => parseFloat(f.rate))
    .filter((r) => !isNaN(r) && r > 0);
  const avgRate =
    validRates.length > 0
      ? (validRates.reduce((a, b) => a + b, 0) / validRates.length).toFixed(1)
      : null;

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePlayFirst = () => {
    if (collection.films.length > 0) {
      router.push(`/title/${generateSlug(collection.films[0].title)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* 顶部氛围光晕背景 */}
      <div
        className="absolute top-0 inset-x-0 h-96 opacity-25 pointer-events-none blur-3xl"
        style={{
          background: `radial-gradient(circle at 50% 0%, ${collection.accent} 0%, transparent 70%)`,
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-20">
        {/* 面包屑导航 */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-2 text-xs sm:text-sm text-white/50 mb-6"
        >
          <Link href="/" className="hover:text-white transition-colors">
            首页
          </Link>
          <span>/</span>
          <span className="text-white/40">精选片单</span>
          <span>/</span>
          <span className="text-white/90 font-medium truncate">
            {collection.title}
          </span>
        </nav>

        {/* 顶部 Hero 策展看板 */}
        <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white/[0.07] via-white/[0.03] to-transparent border border-white/10 p-5 sm:p-8 lg:p-10 mb-8 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6 lg:gap-10">
            {/* 左侧：3 层错位堆叠海报组视觉徽章 */}
            <div className="relative w-44 sm:w-52 lg:w-60 aspect-[3/4] shrink-0 pt-2 pr-4">
              {/* 第 3 层 */}
              <div
                className="absolute inset-x-2 top-0 bottom-4 rounded-2xl overflow-hidden border border-white/10 opacity-30 shadow-lg z-10"
                style={{
                  transform: 'translate(14px, -4px) scale(0.88) rotate(2deg)',
                }}
              >
                <Image
                  src={collection.coverPosters[2] || collection.films[2]?.cover || ''}
                  alt="海报3"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* 第 2 层 */}
              <div
                className="absolute inset-x-1 top-1 bottom-3 rounded-2xl overflow-hidden border border-white/15 opacity-65 shadow-xl z-20"
                style={{
                  transform: 'translate(7px, -2px) scale(0.94) rotate(1deg)',
                }}
              >
                <Image
                  src={collection.coverPosters[1] || collection.films[1]?.cover || ''}
                  alt="海报2"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>

              {/* 顶层 */}
              <div className="relative w-[90%] aspect-[2/3] rounded-2xl overflow-hidden border border-white/20 shadow-2xl z-30">
                <Image
                  src={collection.coverPosters[0] || collection.films[0]?.cover || ''}
                  alt={collection.title}
                  fill
                  className="object-cover"
                  priority
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-bold text-white border border-white/20">
                  {collection.badge}
                </div>
              </div>
            </div>

            {/* 右侧：片单信息与行动项 */}
            <div className="flex-1 text-center lg:text-left flex flex-col justify-between">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-white/90 mb-3">
                  <span>{collection.emoji}</span>
                  <span>官方编辑部策展</span>
                  <span className="w-1 h-1 rounded-full bg-amber-400" />
                  <span className="text-amber-300">{collection.totalCount} 部殿堂佳作</span>
                </div>

                <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight mb-3">
                  {collection.title}
                </h1>

                <p className="text-sm sm:text-base text-amber-200/90 font-medium mb-4">
                  {collection.subtitle}
                </p>

                <p className="text-xs sm:text-sm text-white/60 leading-relaxed max-w-3xl mb-6">
                  {collection.description}
                </p>

                {/* 统计指标卡片 */}
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-6">
                  <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <Icons.Film size={16} className="text-amber-400" />
                    <div className="text-left">
                      <div className="text-[10px] text-white/40 uppercase">收录数量</div>
                      <div className="text-xs sm:text-sm font-bold text-white">
                        {collection.films.length} 部精彩剧目
                      </div>
                    </div>
                  </div>

                  {avgRate && (
                    <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                      <Icons.Star size={16} className="text-amber-400 fill-amber-400" />
                      <div className="text-left">
                        <div className="text-[10px] text-white/40 uppercase">平均评分</div>
                        <div className="text-xs sm:text-sm font-bold text-amber-300">
                          {avgRate} / 10.0
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                    <span className="text-sm">⚡</span>
                    <div className="text-left">
                      <div className="text-[10px] text-white/40 uppercase">播放通道</div>
                      <div className="text-xs sm:text-sm font-bold text-emerald-400">
                        100% 直连秒播
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* 快捷操作按钮 */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={handlePlayFirst}
                  className="px-6 py-2.5 rounded-xl font-extrabold text-sm text-black flex items-center gap-2 shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
                  style={{ backgroundColor: collection.accent || '#F59E0B' }}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span>立即播放首部</span>
                </button>

                <button
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm text-white/90 bg-white/10 hover:bg-white/20 border border-white/15 flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <span>{copied ? '✓ 已复制链接' : '🔗 分享此片单'}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 横向片单快捷切换胶囊条 */}
        <div className="mb-8">
          <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-2.5 px-1">
            切换探索其他精选片单
          </div>
          <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-none">
            {CURATED_COLLECTIONS.map((c) => {
              const isCurrent = c.slug === collection.slug;
              return (
                <Link
                  key={c.id}
                  href={`/collection/${c.slug}`}
                  className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isCurrent
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 scale-105'
                      : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white border border-white/10'
                  }`}
                >
                  <span>{c.emoji}</span>
                  <span>{c.title}</span>
                  <span className="text-[10px] opacity-70 font-mono">({c.totalCount})</span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* 影片网格列表 */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <span>片单包含影片</span>
              <span className="text-xs text-white/40 font-mono">
                ({collection.films.length} 部)
              </span>
            </h2>
            <span className="text-xs text-white/40">点击海报即刻直达播放</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
            {collection.films.map((film, idx) => (
              <CollectionFilmCard key={film.id || film.title} film={film} idx={idx} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
