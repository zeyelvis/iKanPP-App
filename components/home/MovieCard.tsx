/**
 * MovieCard - Individual movie card component
 * Displays movie poster, title, and rating
 */

import { memo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Icons } from '@/components/ui/Icon';

interface DoubanMovie {
  id: string;
  title: string;
  cover: string;
  rate: string;
  url: string;
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

  // 外部图片走代理（绕过防盗链 + 长效缓存）
  const proxiedCover = movie.cover?.startsWith('http')
    ? `/api/img-proxy?url=${encodeURIComponent(movie.cover)}`
    : movie.cover;

  return (
    <Link
      href={`/?q=${encodeURIComponent(movie.title)}`}
      onClick={(e) => {
        // Allow default behavior for modifier keys (new tab, etc.)
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

        e.preventDefault();
        onMovieClick(movie);
      }}
      data-focusable
      className="group cursor-pointer movie-card-hover"
      style={{
        position: 'relative',
        zIndex: 1,
        contentVisibility: 'visible',
        contain: 'layout style paint'
      }}
      onMouseEnter={(e) => (e.currentTarget.style.zIndex = '100')}
      onMouseLeave={(e) => (e.currentTarget.style.zIndex = '1')}
    >
      <Card hover={false} className="p-0 h-full shadow-[0_2px_8px_var(--shadow-color)] group-hover:shadow-[0_12px_32px_var(--shadow-color)] transition-all duration-300 ease-out" blur={false}>
        <div className="relative aspect-[2/3] bg-[var(--glass-bg)] rounded-[var(--radius-2xl)] overflow-hidden">
          {/* 骨架屏 shimmer 底层 */}
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 skeleton-shimmer rounded-[var(--radius-2xl)]" />
          )}
          {!imageError ? (
            <Image
              src={proxiedCover}
              alt={movie.title}
              fill
              className={`object-cover transition-transform duration-500 group-hover:scale-105 rounded-[var(--radius-2xl)] ${imageLoaded ? 'img-fade-in' : 'opacity-0'}`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1600px) 16vw, 12vw"
              loading={index < 8 ? 'eager' : 'lazy'}
              unoptimized
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          ) : !fallbackError ? (
            <Image
              src="/placeholder-poster.svg"
              alt={movie.title}
              fill
              className="object-cover rounded-[var(--radius-2xl)]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, (max-width: 1600px) 16vw, 12vw"
              unoptimized
              onError={() => setFallbackError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[var(--glass-bg)] rounded-[var(--radius-2xl)]">
              <p className="text-sm text-[var(--text-muted)]">暂无图片</p>
            </div>
          )}
          {/* 评分标签 */}
          {movie.rate && parseFloat(movie.rate) > 0 ? (
            <div
              className="absolute top-2 right-2 bg-black/80 px-2 py-1 flex items-center gap-1 rounded-[var(--radius-full)] backdrop-blur-sm"
            >
              <Icons.Star size={11} className="text-yellow-400 fill-yellow-400" />
              <span className="text-xs font-bold text-white">
                {movie.rate}
              </span>
            </div>
          ) : (
            <div
              className="absolute top-2 right-2 bg-emerald-500/90 px-2 py-0.5 rounded-[var(--radius-full)] backdrop-blur-sm"
            >
              <span className="text-[10px] font-bold text-white">🆕 新上线</span>
            </div>
          )}
          {/* Hover 时底部渐变叠加 - 播放提示 */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3 rounded-[var(--radius-2xl)]">
            <span className="bg-[var(--accent-color)] text-white text-xs font-semibold px-3.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z" /></svg>
              立即播放
            </span>
          </div>
        </div>
        <div className="pt-2.5 px-0.5">
          <h3 className="movie-card-title font-medium text-center text-[var(--text-color)] line-clamp-2 group-hover:text-[var(--accent-color)] transition-colors">
            {movie.title}
          </h3>
        </div>
      </Card>
    </Link>
  );
});
