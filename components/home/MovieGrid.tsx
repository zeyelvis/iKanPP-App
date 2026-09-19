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
  page: number; // 0-indexed
  hasMore: boolean;
  totalCount?: number;
  pageSize?: number;
  onMovieClick: (movie: DoubanMovie) => void;
  onPageChange: (page: number) => void;
}

export function MovieGrid({
  movies,
  loading,
  page,
  hasMore,
  totalCount,
  pageSize = 24,
  onMovieClick,
  onPageChange,
}: MovieGridProps) {
  if (movies.length === 0 && !loading) {
    return <MovieGridEmpty />;
  }

  const handlePageSelect = (targetPageZeroIndexed: number) => {
    onPageChange(targetPageZeroIndexed);
    if (typeof window !== 'undefined') {
      const anchor = document.getElementById('movie-grid-top') || document.getElementById('cathub-universal-filter');
      if (anchor) {
        anchor.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const currentPage = page + 1; // 1-indexed
  const totalPages = totalCount && totalCount > 0
    ? Math.max(1, Math.ceil(totalCount / pageSize))
    : (hasMore ? currentPage + 1 : currentPage);

  // 🌟 精准实现图 2 ~ 图 5 经典滑动窗口分页算法
  const paginationItems: Array<number | 'ellipsis-left' | 'ellipsis-right'> = (() => {
    if (totalPages <= 7) {
      const items: number[] = [];
      for (let i = 1; i <= totalPages; i++) items.push(i);
      return items;
    }

    // 状态 A（图 2）：当前页处于前部（1~4） -> 1 2 3 4 5 ... totalPages
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis-right', totalPages];
    }

    // 状态 B（图 4）：当前页处于后部（倒数前4） -> 1 ... 1206 1207 1208 1209 1210
    if (currentPage >= totalPages - 3) {
      return [
        1,
        'ellipsis-left',
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    // 状态 C（图 3 & 图 5）：当前页居中 -> 1 ... cur-2 cur-1 [cur] cur+1 cur+2 ... totalPages
    return [
      1,
      'ellipsis-left',
      currentPage - 2,
      currentPage - 1,
      currentPage,
      currentPage + 1,
      currentPage + 2,
      'ellipsis-right',
      totalPages,
    ];
  })();

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

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
              key={movie.title ? `grid-${movie.title}` : (movie.id || index)}
              movie={movie}
              onMovieClick={onMovieClick}
              index={index}
            />
          ))}
        </div>
      )}

      {/* 🌟 图 2 ~ 图 5 极简专业流媒体分页控制栏 */}
      {!loading && movies.length > 0 && (
        <div className="flex items-center justify-center gap-2 sm:gap-4 py-10 mt-6 select-none flex-wrap">
          {/* 上一页 */}
          <button
            onClick={() => !isPrevDisabled && handlePageSelect(page - 1)}
            disabled={isPrevDisabled}
            className={`px-3 py-2 text-sm sm:text-base font-normal transition-colors cursor-pointer ${
              isPrevDisabled
                ? 'text-gray-600 opacity-40 cursor-not-allowed'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            上一页
          </button>

          {/* 页码与省略号组件 */}
          <div className="flex items-center gap-1 sm:gap-2">
            {paginationItems.map((item, idx) => {
              if (item === 'ellipsis-left' || item === 'ellipsis-right') {
                return (
                  <span
                    key={`${item}-${idx}`}
                    className="w-8 sm:w-10 text-center text-gray-400 font-medium tracking-widest"
                  >
                    ...
                  </span>
                );
              }

              const isCurrent = item === currentPage;
              return (
                <button
                  key={item}
                  onClick={() => !isCurrent && handlePageSelect(item - 1)}
                  className={`min-w-[34px] sm:min-w-[42px] h-9 sm:h-10 px-2 rounded-lg text-sm sm:text-base font-medium transition-all duration-150 cursor-pointer active:scale-95 flex items-center justify-center ${
                    isCurrent
                      ? 'bg-[#00b2ff] text-white font-bold shadow-md shadow-[#00b2ff]/20'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          {/* 下一页 */}
          <button
            onClick={() => !isNextDisabled && handlePageSelect(page + 1)}
            disabled={isNextDisabled}
            className={`px-3 py-2 text-sm sm:text-base font-normal transition-colors cursor-pointer ${
              isNextDisabled
                ? 'text-gray-600 opacity-40 cursor-not-allowed'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            下一页
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
        <div key={i} className="skeleton-card skeleton-shimmer aspect-2/3 rounded-2xl" style={{ animationDelay: `${i * 0.05}s` }} />
      ))}
    </div>
  );
}

function MovieGridEmpty() {
  return (
    <div className="text-center py-20">
      <Icons.Film size={64} className="text-(--text-color-secondary) mx-auto mb-4" />
      <p className="text-(--text-color-secondary)">暂无内容</p>
    </div>
  );
}
