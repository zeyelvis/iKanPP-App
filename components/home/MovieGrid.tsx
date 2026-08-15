/**
 * MovieGrid — 影片网格 + 分页控制
 * 每页 20 部，底部有上一页/下一页按钮和页码显示
 */

import { MovieCard } from './MovieCard';
import { Icons } from '@/components/ui/Icon';

interface DoubanMovie {
  id: string;
  title: string;
  cover: string;
  rate: string;
  url: string;
}

interface MovieGridProps {
  movies: DoubanMovie[];
  loading: boolean;
  page: number;
  hasMore: boolean;
  onMovieClick: (movie: DoubanMovie) => void;
  onPageChange: (page: number) => void;
}

export function MovieGrid({
  movies,
  loading,
  page,
  hasMore,
  onMovieClick,
  onPageChange,
}: MovieGridProps) {
  if (movies.length === 0 && !loading) {
    return <MovieGridEmpty />;
  }

  return (
    <div>
      {/* 锚点：翻页后滚动到这里 */}
      <div id="movie-grid-top" className="scroll-mt-24" />

      {/* 加载中遮罩 */}
      {loading && <MovieGridLoading />}

      {/* 影片网格 */}
      {!loading && movies.length > 0 && (
        <div className="movie-fluid-grid">
          {movies.map((movie, index) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              onMovieClick={onMovieClick}
              index={index}
            />
          ))}
        </div>
      )}

      {/* 分页控制栏 */}
      {!loading && movies.length > 0 && (
        <div className="flex items-center justify-center gap-3 py-8 mt-4">
          {/* 上一页 */}
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[var(--glass-bg-hover)] active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            上一页
          </button>

          {/* 页码组（最多显示 5 个） */}
          <div className="flex items-center gap-1.5">
            {(() => {
              // 计算显示的页码范围（滑动窗口，当前页尽量居中）
              const currentPage = page + 1;
              const windowSize = 5;
              // hasMore 意味着至少还有下一页，所以已知页数至少是 currentPage + 1
              const knownPages = hasMore ? currentPage + 1 : currentPage;
              const totalVisible = Math.min(windowSize, knownPages);

              let startPage = Math.max(1, currentPage - Math.floor(totalVisible / 2));
              let endPage = startPage + totalVisible - 1;
              if (endPage > knownPages) {
                endPage = knownPages;
                startPage = Math.max(1, endPage - totalVisible + 1);
              }

              const pages = [];
              for (let i = startPage; i <= endPage; i++) {
                const isActive = i === currentPage;
                pages.push(
                  <button
                    key={i}
                    onClick={() => !isActive && onPageChange(i - 1)}
                    className={`w-10 h-10 rounded-xl text-sm font-bold transition-all duration-200 cursor-pointer active:scale-95 ${
                      isActive
                        ? 'text-white shadow-lg'
                        : 'bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[var(--glass-bg-hover)]'
                    }`}
                    style={isActive ? {
                      background: 'var(--accent-color)',
                      boxShadow: '0 0 15px rgba(0,122,255,0.3)',
                    } : undefined}
                  >
                    {i}
                  </button>
                );
              }
              return pages;
            })()}
          </div>

          {/* 下一页 */}
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={!hasMore}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-[var(--glass-bg)] border border-[var(--glass-border)] text-[var(--text-color)] hover:bg-[var(--glass-bg-hover)] active:scale-95"
          >
            下一页
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}

function MovieGridLoading() {
  return (
    <div className="movie-fluid-grid">
      {[...Array(14)].map((_, i) => (
        <div key={i} className="skeleton-card skeleton-shimmer aspect-[2/3] rounded-[var(--radius-2xl)]" style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  );
}

function MovieGridEmpty() {
  return (
    <div className="text-center py-20">
      <Icons.Film size={64} className="text-[var(--text-color-secondary)] mx-auto mb-4" />
      <p className="text-[var(--text-color-secondary)]">暂无内容</p>
    </div>
  );
}
