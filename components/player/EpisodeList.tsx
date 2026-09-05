'use client';

import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';
import { settingsStore } from '@/lib/store/settings-store';
import type { VideoResolutionInfo } from './hooks/useVideoResolution';
import type { ResolutionInfo } from '@/lib/hooks/useResolutionProbe';
import { getCachedResolution } from '@/lib/player/resolution-cache';
import { getSourceResolutionBadge, shouldExpandForCurrentSource } from '@/lib/player/source-list-utils';
import { SourceSelector } from './SourceSelector';
// 4K (2160P) 原画专线字典
const FOUR_K_SOURCES = new Set([
  '4kvm', 'hongniu', 'hongniu3', 'haohua_4k', 'blue_4k', 'suoni', 'suoni_sd',
  'baofeng', 'baofeng_app', 'json1080', 'laosiji_4k', 'midnight_4k', 'yutu', 'hsck', 'jingpin'
]);

// 1080P 蓝光极清秒播专线字典
const HD_BLURAY_SOURCES = new Set([
  'feifan', 'feifan_api', 'feifan1', 'guangsu', 'guangsu_http', 'wolong', 'wolong_cj',
  'zuida', 'zuida_db', 'baidu', 'jisu', 'liangzi', 'kuaiche', 'leba', 'ck', 'tantan', 'sejie', 'wujin', 'wujin_me', 'wujin_cc', 'wujin_net', 'dytt'
]);

export function isSource4K(s: { source: string; sourceName?: string }): boolean {
  return FOUR_K_SOURCES.has(s.source) ||
         Boolean(s.sourceName?.includes('4K')) ||
         Boolean(s.sourceName?.includes('2160')) ||
         Boolean(s.sourceName?.includes('红牛')) ||
         Boolean(s.sourceName?.includes('暴风')) ||
         Boolean(s.sourceName?.includes('索尼')) ||
         Boolean(s.sourceName?.includes('老司机'));
}

export function isSourceBluRay(s: { source: string; sourceName?: string }): boolean {
  return !isSource4K(s) && (HD_BLURAY_SOURCES.has(s.source) || Boolean(s.sourceName?.includes('蓝光')) || Boolean(s.sourceName?.includes('极速')));
}

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
  currentResolution,
  sourceResolutions,
  sourceSectionCollapsed = false,
  onSourceSectionCollapseChange,
  episodeSectionCollapsed = false,
  onEpisodeSectionCollapseChange,
}: EpisodeListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sourceItemRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [sourceExpanded, setSourceExpanded] = useState(false);
  const [showAllSources, setShowAllSources] = useState(false);
  // list = classic vertical list; grid = multi-column with section pages
  const [episodeLayout, setEpisodeLayout] = useState<'list' | 'grid'>('grid');
  const [episodePage, setEpisodePage] = useState(0);

  const EPISODES_PER_PAGE = 50;

  // Source latency state
  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [isLoadingLatency, setIsLoadingLatency] = useState(false);

  const showSourceSelector = sources && sources.length > 1 && onSourceChange;

  // Helper: get best resolution badge for a source
  const getResBadge = useCallback((source: SourceInfo, isCurrent: boolean) => {
    const probeKey = `${source.source}:${source.id}`;
    return getSourceResolutionBadge({
      isCurrent,
      currentResolution: currentResolution || undefined,
      probedResolution: sourceResolutions?.[probeKey] || undefined,
      cachedResolution: getCachedResolution(source.source, source.id) || undefined,
      remarks: source.remarks,
    });
  }, [currentResolution, sourceResolutions]);

  // Current source info
  const currentSourceInfo = useMemo(() => {
    if (!sources || !currentSource) return null;
    return sources.find(s => s.source === currentSource) || null;
  }, [sources, currentSource]);

  // Sort sources by latency
  const initialLatencies = useMemo(() => {
    if (!sources) return {};
    return sources.reduce<Record<string, number>>((accumulator, source) => {
      if (source.latency !== undefined) {
        accumulator[source.source] = source.latency;
      }
      return accumulator;
    }, {});
  }, [sources]);

  const mergedLatencies = useMemo(() => ({
    ...initialLatencies,
    ...latencies,
  }), [initialLatencies, latencies]);

  const sortedSources = useMemo(() => {
    if (!sources) return [];
    return [...sources].sort((a, b) => {
      const isA4K = isSource4K(a);
      const isB4K = isSource4K(b);

      if (isA4K && !isB4K) return -1;
      if (!isA4K && isB4K) return 1;

      const latA = mergedLatencies[a.source] ?? a.latency ?? Infinity;
      const latB = mergedLatencies[b.source] ?? b.latency ?? Infinity;
      return latA - latB;
    });
  }, [mergedLatencies, sources]);

  const isSourceListOpen = !sourceSectionCollapsed && sourceExpanded;
  const forceExpandedForCurrentSource = !!currentSource && shouldExpandForCurrentSource(sortedSources, currentSource);
  const showAllVisibleSources = showAllSources || forceExpandedForCurrentSource;

  useEffect(() => {
    if (!isSourceListOpen || !currentSource) return;

    const frame = requestAnimationFrame(() => {
      sourceItemRefs.current[currentSource]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [currentSource, isSourceListOpen, showAllVisibleSources, sortedSources]);

  // Resolve source ID to its actual baseUrl for pinging
  const getSourcePingUrl = useCallback((sourceId: string): string | null => {
    const settings = settingsStore.getSettings();
    const allConfigs = [
      ...settings.sources,
      ...settings.premiumSources,
    ];
    const config = allConfigs.find(s => s.id === sourceId);
    return config?.baseUrl || null;
  }, []);

  // Initialize latencies from sources
  useEffect(() => {
    if (!sources) return;
    const hasMissing = sources.some((source) => source.latency === undefined);

    // Auto-refresh latencies for sources that don't have them
    if (hasMissing && sources.length > 1) {
      const autoRefresh = async () => {
        const missing = sources.filter(s => s.latency === undefined);
        const results = await Promise.all(
          missing.map(async (source) => {
            try {
              const pingUrl = getSourcePingUrl(source.source);
              if (!pingUrl) return { source: source.source, latency: undefined };
              const response = await fetch('/api/ping', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: pingUrl }),
              });
              if (response.ok) {
                const data = await response.json();
                return { source: source.source, latency: data.latency as number | undefined };
              }
            } catch { /* ignore */ }
            return { source: source.source, latency: undefined };
          })
        );
        setLatencies(prev => {
          const updated = { ...prev };
          results.forEach(({ source, latency }) => {
            if (latency !== undefined) updated[source] = latency;
          });
          return updated;
        });
      };
      autoRefresh();
    }
  }, [sources, getSourcePingUrl]);

  // Refresh latencies
  const refreshLatencies = useCallback(async () => {
    if (!sources) return;
    setIsLoadingLatency(true);

    const results = await Promise.all(
      sources.map(async (source) => {
        try {
          const pingUrl = getSourcePingUrl(source.source);
          if (!pingUrl) return { source: source.source, latency: undefined };
          const response = await fetch('/api/ping', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: pingUrl }),
          });
          if (response.ok) {
            const data = await response.json();
            return { source: source.source, latency: data.latency };
          }
        } catch {
          // Ignore errors
        }
        return { source: source.source, latency: undefined };
      })
    );

    const newLatencies: Record<string, number> = {};
    results.forEach(({ source, latency }) => {
      if (latency !== undefined) {
        newLatencies[source] = latency;
      }
    });
    setLatencies(newLatencies);
    setIsLoadingLatency(false);
  }, [sources, getSourcePingUrl]);

  // Memoized display episodes - reversed if toggle is on
  const displayEpisodes = useMemo(() => {
    if (!episodes) return null;
    return isReversed ? [...episodes].reverse() : episodes;
  }, [episodes, isReversed]);

  const totalEpisodePages = useMemo(() => {
    if (!displayEpisodes || displayEpisodes.length === 0) return 1;
    return Math.max(1, Math.ceil(displayEpisodes.length / EPISODES_PER_PAGE));
  }, [displayEpisodes]);

  // Keep the current episode's page visible when order/layout changes
  useEffect(() => {
    if (!episodes || episodes.length === 0) {
      setEpisodePage(0);
      return;
    }
    const displayIndex = isReversed
      ? episodes.length - 1 - currentEpisode
      : currentEpisode;
    const page = Math.floor(displayIndex / EPISODES_PER_PAGE);
    setEpisodePage(Math.min(Math.max(0, page), Math.max(0, Math.ceil(episodes.length / EPISODES_PER_PAGE) - 1)));
  }, [currentEpisode, episodes, isReversed, episodeLayout]);

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
  const currentEpisodeLabel = episodes?.[currentEpisode]?.name || `第${currentEpisode + 1}集`;

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
                  onClick={() => setEpisodePage(page)}
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
                    aria-label={`${episode.name || `第 ${originalIndex + 1} 集`}${isCurrentEpisode ? '，当前播放' : ''}`}
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
                      <span className={`font-semibold ${isGrid ? 'text-xs sm:text-sm truncate' : 'text-sm sm:text-base'}`}>
                        {episode.name || `第 ${originalIndex + 1} 集`}
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
