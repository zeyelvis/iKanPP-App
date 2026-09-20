/**
 * MovieCard - Individual movie card component
 * 采用顶级流媒体（Netflix / Apple TV+ 质感）高保真卡片容器排版：
 * 1. 一体化深色微透圆角底座（bg-white/5 border border-white/10）
 * 2. 经典 2:3 黄金比例电影海报，带居中播放动效与精致角标（热度/评分）
 * 3. 优雅主副标题：片名 + 年份/题材标签（如 2025 · 历史），极富呼吸感与电影质感
 */

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icons } from '@/components/ui/Icon';
import { getOptimizedImageUrl, getFallbackProxiedImageUrl } from '@/lib/utils/image-utils';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

export interface DoubanMovie {
  id: string;
  title: string;
  cover: string;
  rate?: string;
  score?: string;
  url?: string;
  year?: string | number;
  types?: string[];
  genres?: string[];
  remarks?: string;
  area?: string;
  region?: string;
  hot?: number;
  popularity?: number;
}

interface MovieCardProps {
  movie: DoubanMovie;
  onMovieClick: (movie: DoubanMovie) => void;
  /** 卡片在网格中的索引，前 6 张 eager 加载 */
  index?: number;
}

export const MovieCard = memo(function MovieCard({ movie, onMovieClick, index = 0 }: MovieCardProps) {
  const [imageError, setImageError] = useState(false);
  const [fallbackError, setFallbackError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useProxyFallback, setUseProxyFallback] = useState(false);

  // 智能图片精准物理尺寸与地域路由（海报卡片统一规范为 poster/342 尺寸）
  const initialCover = getOptimizedImageUrl(movie.cover, { variant: 'poster' });
  const proxiedCover = useProxyFallback
    ? getFallbackProxiedImageUrl(movie.cover, { variant: 'poster' })
    : initialCover;

  const handleImageError = () => {
    // 弹性自愈：若当前直连外链加载失败，自动秒切 /api/img-proxy R2 镜像重试
    if (!useProxyFallback && movie.cover?.startsWith('http') && !initialCover.includes('/api/img-proxy')) {
      setUseProxyFallback(true);
    } else {
      setImageError(true);
    }
  };

  // 智能短剧与正片动态目标路由
  const isShortDrama = Boolean(
    (movie as any).play_url ||
    (movie as any).playUrl ||
    (movie as any).firstPlayUrl ||
    (movie.types && movie.types.includes('短剧'))
  );
  const playUrl = (movie as any).play_url || (movie as any).playUrl || (movie as any).url || (movie as any).firstPlayUrl || '';
  const targetHref = isShortDrama
    ? `/short/player?${new URLSearchParams({
        title: movie.title || '',
        url: playUrl,
        poster: movie.cover || (movie as any).poster || '',
        ...(movie.id ? { id: String(movie.id) } : {})
      }).toString()}`
    : getTitleCanonicalHref(movie);

  // 年份与分类提取
  const displayYear = movie.year || '2026';
  const displayGenre = (movie.types && movie.types[0]) || (movie.genres && movie.genres[0]) || movie.area || movie.region || '影视';

  return (
    <Link
      href={targetHref}
      prefetch={index < 8}
      onClick={(e) => {
        // Allow default behavior for modifier keys (new tab, etc.)
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      }}
      data-focusable
      className="group block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black"
      style={{
        contentVisibility: 'auto',
        containIntrinsicSize: '160px 290px',
      }}
    >
      {/* 1. 2:3 黄金比例海报主画幅 */}
      <div className="relative aspect-2/3 w-full bg-black/40 overflow-hidden">
        {/* 骨架屏 shimmer 底层 */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 skeleton-shimmer" />
        )}
        {!imageError ? (
          <Image
            src={proxiedCover}
            alt={movie.title}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${imageLoaded ? 'img-fade-in' : 'opacity-0'}`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1600px) 18vw, 16vw"
            loading={index < 4 ? 'eager' : 'lazy'}
            priority={index < 2}
            decoding="async"
            unoptimized
            referrerPolicy="no-referrer"
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
          />
        ) : !fallbackError ? (
          <Image
            src="/placeholder-poster.svg"
            alt={movie.title}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1600px) 18vw, 16vw"
            unoptimized
            onError={() => setFallbackError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-white/5">
            <p className="text-xs text-white/30">暂无图片</p>
          </div>
        )}

        {/* 全网人气热度角标（🔥 33万） */}
        {(() => {
          const hotVal = movie.hot || movie.popularity;
          if (!hotVal || hotVal < 10000) return null;
          const fmtHot = hotVal >= 10000000
            ? `${(hotVal / 10000000).toFixed(1)}千万`
            : (hotVal >= 10000 ? `${Math.round(hotVal / 10000)}万` : String(hotVal));
          return (
            <div className="absolute top-2 left-2 bg-red-600/90 px-1.5 py-0.5 flex items-center gap-1 rounded text-[10px] font-bold text-white shadow-sm backdrop-blur-xs">
              <span>🔥</span>
              <span>{fmtHot}</span>
            </div>
          );
        })()}

        {/* 评分标签（★ 9.6） */}
        {(() => {
          const displayScore = movie.rate || movie.score;
          if (displayScore && parseFloat(displayScore) > 0) {
            return (
              <div className="absolute top-2 right-2 bg-black/75 px-1.5 py-0.5 rounded text-amber-400 text-xs font-bold flex items-center gap-0.5 backdrop-blur-xs shadow-sm">
                <Icons.Star size={11} className="text-amber-400 fill-amber-400" />
                <span>{displayScore}</span>
              </div>
            );
          }
          return (
            <div className="absolute top-2 right-2 bg-emerald-600/85 px-1.5 py-0.5 rounded text-[10px] font-bold text-white backdrop-blur-xs shadow-sm">
              <span>🆕 新上线</span>
            </div>
          );
        })()}

        {/* Netflix 风格居中悬停播放微动效 */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
            <svg className="w-5 h-5 fill-white ml-0.5" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
          </div>
        </div>
      </div>

      {/* 2. 详情页同款主副标题优雅信息区 */}
      <div className="p-2.5 sm:p-3">
        <h3 className="font-semibold text-sm sm:text-base text-white/90 truncate group-hover:text-red-400 transition-colors">
          {movie.title}
        </h3>
        <p className="text-xs text-white/40 mt-1 truncate">
          {displayYear} · {displayGenre}
          {movie.remarks && (
            <span className="text-white/30 ml-1.5">({movie.remarks})</span>
          )}
        </p>
      </div>
    </Link>
  );
});
