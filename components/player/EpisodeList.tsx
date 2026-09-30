'use client';

import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';
import type { VideoResolutionInfo } from './hooks/useVideoResolution';
import type { ResolutionInfo } from '@/lib/hooks/useResolutionProbe';
import { SourceSelector } from './SourceSelector';
import { cleanEpisodeName, formatEpisodeGridLabel } from '@/lib/utils/episode-resolver';

interface Episode {
  name?: string;
  url: string;
}

export interface SourceInfo {
  id: string | number;
  source: string;
  sourceName?: string;
  latency?: number;
  pic?: string;
  typeName?: string;
  remarks?: string;
}

interface EpisodeListProps {
  episodes: Episode[] | null;
  currentEpisode: number;
  isReversed?: boolean;
  onEpisodeClick: (episode: Episode, index: number) => void;
  onToggleReverse?: (reversed: boolean) => void;
  // Optional source integration props
  sources?: SourceInfo[];
  currentSource?: string;
  onSourceChange?: (source: SourceInfo) => void;
  // Actual detected resolution for the current source
  currentResolution?: VideoResolutionInfo | null;
  // Probed resolutions for all sources (key: "source:id")
  sourceResolutions?: Record<string, ResolutionInfo | null>;
  sourceSectionCollapsed?: boolean;
  onSourceSectionCollapseChange?: (collapsed: boolean) => void;
  episodeSectionCollapsed?: boolean;
  onEpisodeSectionCollapseChange?: (collapsed: boolean) => void;
}

export function EpisodeList({
  episodes,
  currentEpisode,
  isReversed = false,
  onEpisodeClick,
  onToggleReverse,
  sources,
  currentSource,
  onSourceChange,
  episodeSectionCollapsed = false,
  onEpisodeSectionCollapseChange,
}: EpisodeListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  // list = classic vertical list; grid = multi-column with section pages
  const [episodeLayout, setEpisodeLayout] = useState<'list' | 'grid'>('grid');
  const [userPage, setUserPage] = useState<number | null>(null);
  const [prevEpisode, setPrevEpisode] = useState(currentEpisode);

  if (prevEpisode !== currentEpisode) {
    setPrevEpisode(currentEpisode);
    setUserPage(null);
  }

  const EPISODES_PER_PAGE = 50;

  const showSourceSelector = Boolean(sources && sources.length > 1 && onSourceChange);

  // Memoized display episodes - reversed if toggle is on
  const displayEpisodes = useMemo(() => {
    if (!episodes) return null;
    return isReversed ? [...episodes].reverse() : episodes;
  }, [episodes, isReversed]);

  const totalEpisodePages = useMemo(() => {
    if (!displayEpisodes || displayEpisodes.length === 0) return 1;
    return Math.max(1, Math.ceil(displayEpisodes.length / EPISODES_PER_PAGE));
  }, [displayEpisodes]);

  const defaultPage = useMemo(() => {
    if (!episodes || episodes.length === 0) return 0;
    const displayIndex = isReversed
      ? episodes.length - 1 - currentEpisode
      : currentEpisode;
    const page = Math.floor(displayIndex / EPISODES_PER_PAGE);
    return Math.min(Math.max(0, page), Math.max(0, Math.ceil(episodes.length / EPISODES_PER_PAGE) - 1));
  }, [currentEpisode, episodes, isReversed]);

  const episodePage = userPage !== null ? userPage : defaultPage;

  // 自动平滑滚动到当前选中的集数：只滚动列表自身，不带动整个页面
  // （scrollIntoView 会连同窗口一起滚，把页面从播放器拉到选集列表）
  useEffect(() => {
    if (!episodes || episodes.length === 0) return;
    const targetDisplayIdx = isReversed
      ? episodes.length - 1 - currentEpisode
      : currentEpisode;
    const timer = setTimeout(() => {
      const button = buttonRefs.current[targetDisplayIdx];
      const box = listRef.current;
      if (!button || !box) return;
      const b = button.getBoundingClientRect();
      const c = box.getBoundingClientRect();
      if (b.top < c.top) box.scrollBy({ top: b.top - c.top, behavior: 'smooth' });
      else if (b.bottom > c.bottom) box.scrollBy({ top: b.bottom - c.bottom, behavior: 'smooth' });
    }, 250);
    return () => clearTimeout(timer);
  }, [currentEpisode, episodes, isReversed, episodePage]);

  const pagedEpisodes = useMemo(() => {
    if (!displayEpisodes) return null;
    if (episodeLayout === 'list' || displayEpisodes.length <= EPISODES_PER_PAGE) {
      return displayEpisodes.map((episode, displayIndex) => ({ episode, displayIndex }));
    }
    const start = episodePage * EPISODES_PER_PAGE;
    return displayEpisodes
      .slice(start, start + EPISODES_PER_PAGE)
      .map((episode, offset) => ({ episode, displayIndex: start + offset }));
  }, [displayEpisodes, episodeLayout, episodePage]);

  const pageRangeLabels = useMemo(() => {
    if (!displayEpisodes) return [] as string[];
    const labels: string[] = [];
    for (let page = 0; page < totalEpisodePages; page++) {
      const start = page * EPISODES_PER_PAGE + 1;
      const end = Math.min((page + 1) * EPISODES_PER_PAGE, displayEpisodes.length);
      labels.push(`${start}-${end}`);
    }
    return labels;
  }, [displayEpisodes, totalEpisodePages]);

  // Map display index to original index
  const getOriginalIndex = useCallback((displayIndex: number) => {
    if (!episodes || !isReversed) return displayIndex;
    return episodes.length - 1 - displayIndex;
  }, [episodes, isReversed]);

  // Map original index to display index (for highlighting current episode)
  const getDisplayIndex = useCallback((originalIndex: number) => {
    if (!episodes || !isReversed) return originalIndex;
    return episodes.length - 1 - originalIndex;
  }, [episodes, isReversed]);

  // Keyboard navigation
  useKeyboardNavigation({
    enabled: !episodeSectionCollapsed,
    containerRef: listRef,
    currentIndex: getDisplayIndex(currentEpisode),
    itemCount: episodes?.length || 0,
    orientation: 'vertical',
    onNavigate: useCallback((index: number) => {
      buttonRefs.current[index]?.focus();
      buttonRefs.current[index]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest'
      });
    }, []),
    onSelect: useCallback((displayIndex: number) => {
      if (episodes) {
        const originalIndex = getOriginalIndex(displayIndex);
        if (episodes[originalIndex]) {
          onEpisodeClick(episodes[originalIndex], originalIndex);
        }
      }
    }, [episodes, onEpisodeClick, getOriginalIndex]),
  });

  const showReverseToggle = episodes && episodes.length > 1;
  const currentEpisodeLabel = cleanEpisodeName(episodes?.[currentEpisode]?.name) || `第${currentEpisode + 1}集`;

  if (!episodes) {
    return (
      <Card hover={false}>
        {showSourceSelector && (
          <div className="mb-4 pb-4 border-b border-white/10">
            <div className="h-9 w-full rounded-xl bg-white/5 animate-pulse" />
          </div>
        )}
        <div className="text-lg sm:text-xl font-bold text-[var(--text-color)] mb-4 flex items-center gap-2">
          <Icons.List size={20} className="sm:w-6 sm:h-6 opacity-60" />
          <span>选集</span>
          <div className="w-8 h-5 rounded-md bg-white/10 animate-pulse" />
        </div>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-2.5">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-10 rounded-xl bg-white/5 border border-white/5 animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card hover={false}>
      {showSourceSelector && (
        <div className="mb-4 pb-4 border-b border-white/10">
          <SourceSelector
            sources={sources!}
            currentSource={currentSource || ''}
            onSourceChange={onSourceChange!}
            embedded={true}
          />
        </div>
      )}

      <div className="text-lg sm:text-xl font-bold text-[var(--text-color)] mb-4 flex items-center gap-2 flex-wrap">
        <Icons.List size={20} className="sm:w-6 sm:h-6" />
        <span>选集</span>
        {episodes && (
          <Badge variant="primary">{episodes.length}</Badge>
        )}
        <div className="ml-auto flex items-center gap-1.5">
          {/* Layout toggle */}
          {showReverseToggle && !episodeSectionCollapsed && (
            <button
              onClick={() => setEpisodeLayout((current) => (current === 'grid' ? 'list' : 'grid'))}
              className={`
                p-1.5 rounded-[var(--radius-2xl)] transition-all duration-200 cursor-pointer
                ${episodeLayout === 'grid'
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--glass-bg)] text-[var(--text-color-secondary)] hover:bg-[var(--glass-hover)] border border-[var(--glass-border)]'
                }
              `}
              aria-label={episodeLayout === 'grid' ? '切换为列表' : '切换为网格'}
              title={episodeLayout === 'grid' ? '切换为列表' : '切换为网格'}
            >
              <Icons.Layers size={16} />
            </button>
          )}
          {/* Reverse order toggle button - only show when more than 1 episode */}
          {showReverseToggle && !episodeSectionCollapsed && (
            <button
              onClick={() => onToggleReverse?.(!isReversed)}
              className={`
                p-1.5 rounded-[var(--radius-2xl)] transition-all duration-200 cursor-pointer
                ${isReversed
                  ? 'bg-[var(--accent-color)] text-white'
                  : 'bg-[var(--glass-bg)] text-[var(--text-color-secondary)] hover:bg-[var(--glass-hover)] border border-[var(--glass-border)]'
                }
              `}
              aria-label={isReversed ? '恢复正序' : '倒序排列'}
              title={isReversed ? '恢复正序' : '倒序排列'}
            >
              <Icons.ArrowUpDown size={16} />
            </button>
          )}
          <button
            onClick={() => onEpisodeSectionCollapseChange?.(!episodeSectionCollapsed)}
            className="p-1.5 rounded-[var(--radius-2xl)] bg-[var(--glass-bg)] text-[var(--text-color-secondary)] hover:bg-[var(--glass-hover)] border border-[var(--glass-border)] transition-all duration-200 cursor-pointer"
            aria-label={episodeSectionCollapsed ? '展开选集列表' : '折叠选集列表'}
            title={episodeSectionCollapsed ? '展开选集列表' : '折叠选集列表'}
          >
            <Icons.ChevronDown
              size={16}
              className={`transition-transform duration-200 ${episodeSectionCollapsed ? '-rotate-90' : 'rotate-0'}`}
            />
          </button>
        </div>
      </div>

      {episodeSectionCollapsed ? (
        <div className="rounded-[var(--radius-2xl)] border border-[var(--glass-border)] bg-[var(--glass-bg)] p-3">
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="text-[var(--text-color-secondary)]">当前选集</span>
            <span className="font-medium text-[var(--text-color)] truncate">
              {currentEpisodeLabel}
            </span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Section page chips for long episode lists */}
          {episodeLayout === 'grid' && totalEpisodePages > 1 && (
            <div className="flex flex-wrap gap-1.5">
              {pageRangeLabels.map((label, page) => (
                <button
                  key={label}
                  onClick={() => setUserPage(page)}
                  className={`
                    px-2.5 py-1 rounded-[var(--radius-2xl)] text-xs font-medium transition-all duration-200 cursor-pointer
                    ${episodePage === page
                      ? 'bg-[var(--accent-color)] text-white'
                      : 'bg-[var(--glass-bg)] text-[var(--text-color-secondary)] hover:bg-[var(--glass-hover)] border border-[var(--glass-border)]'
                    }
                  `}
                  aria-current={episodePage === page ? 'true' : undefined}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          <div
            ref={listRef}
            className={`max-h-[400px] sm:max-h-[600px] overflow-y-auto pr-1 ${
              episodeLayout === 'grid'
                ? 'grid grid-cols-3 sm:grid-cols-4 gap-2'
                : 'space-y-2'
            }`}
            role="radiogroup"
            aria-label="剧集选择"
          >
            {pagedEpisodes && pagedEpisodes.length > 0 ? (
              pagedEpisodes.map(({ episode, displayIndex }) => {
                const originalIndex = getOriginalIndex(displayIndex);
                const isCurrentEpisode = currentEpisode === originalIndex;
                const isGrid = episodeLayout === 'grid';
                const fullLabel = cleanEpisodeName(episode.name) || `第 ${originalIndex + 1} 集`;
                const gridLabel = formatEpisodeGridLabel(episode.name, originalIndex);

                return (
                  <button
                    key={originalIndex}
                    ref={(el) => { buttonRefs.current[displayIndex] = el; }}
                    onClick={() => onEpisodeClick(episode, originalIndex)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onEpisodeClick(episode, originalIndex);
                      }
                    }}
                    tabIndex={0}
                    role="radio"
                    aria-checked={isCurrentEpisode}
                    aria-current={isCurrentEpisode ? 'true' : undefined}
                    aria-label={`${fullLabel}${isCurrentEpisode ? '，当前播放' : ''}`}
                    title={fullLabel}
                    className={`
                      rounded-[var(--radius-2xl)] transition-[var(--transition-fluid)] cursor-pointer
                      ${isGrid
                        ? 'px-2 py-2.5 text-center'
                        : 'w-full px-3 py-2 sm:px-4 sm:py-3 text-left'
                      }
                      ${isCurrentEpisode
                        ? 'bg-[var(--accent-color)] text-white shadow-[0_4px_12px_color-mix(in_srgb,var(--accent-color)_50%,transparent)] brightness-110'
                        : 'bg-[var(--glass-bg)] hover:bg-[var(--glass-hover)] text-[var(--text-color)] border border-[var(--glass-border)]'
                      }
                      focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] focus-visible:ring-offset-2
                    `}
                  >
                    <div className={`flex items-center ${isGrid ? 'justify-center gap-1.5' : 'justify-between'}`}>
                      <span className={`font-semibold ${isGrid ? 'text-xs sm:text-sm tracking-tight' : 'text-sm sm:text-base'}`}>
                        {isGrid ? gridLabel : fullLabel}
                      </span>
                      {isCurrentEpisode && (
                        <div className="equalizer-bar text-white flex-shrink-0">
                          <span />
                          <span />
                          <span />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-8 text-[var(--text-secondary)] col-span-full">
                <Icons.Inbox size={48} className="text-[var(--text-color-secondary)] mx-auto mb-2" />
                <p>暂无剧集信息</p>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
