'use client';

import { useRef, useCallback, useState, useMemo, useEffect } from 'react';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Icons } from '@/components/ui/Icon';
import { LatencyBadge } from '@/components/ui/LatencyBadge';
import { Button } from '@/components/ui/Button';
import { useKeyboardNavigation } from '@/lib/hooks/useKeyboardNavigation';
import { settingsStore } from '@/lib/store/settings-store';

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
}

interface EpisodeListProps {
  episodes: Episode[] | null;
  currentEpisode: number;
  isReversed?: boolean;
  onEpisodeClick: (episode: Episode, index: number) => void;
  onToggleReverse?: (reversed: boolean) => void;
  sources?: SourceInfo[];
  currentSource?: string;
  onSourceChange?: (source: SourceInfo) => void;
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
}: EpisodeListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [selectedRangeIndex, setSelectedRangeIndex] = useState(0);

  // Source latency state
  const [latencies, setLatencies] = useState<Record<string, number>>({});
  const [isLoadingLatency, setIsLoadingLatency] = useState(false);

  const showSourceSelector = sources && sources.length > 1 && onSourceChange;

  // Sort sources by latency
  const sortedSources = useMemo(() => {
    if (!sources) return [];
    return [...sources].sort((a, b) => {
      const latA = latencies[a.source] ?? a.latency ?? Infinity;
      const latB = latencies[b.source] ?? b.latency ?? Infinity;
      return latA - latB;
    });
  }, [sources, latencies]);

  const getSourcePingUrl = useCallback((sourceId: string): string | null => {
    const settings = settingsStore.getSettings();
    const allConfigs = [...settings.sources, ...settings.premiumSources];
    const config = allConfigs.find(s => s.id === sourceId);
    return config?.baseUrl || null;
  }, []);

  useEffect(() => {
    if (!sources) return;
    const initial: Record<string, number> = {};
    sources.forEach(s => {
      if (s.latency !== undefined) initial[s.source] = s.latency;
    });
    setLatencies(initial);
  }, [sources]);

  const refreshLatencies = useCallback(async () => {
    if (!sources) return;
    setIsLoadingLatency(true);
    const results = await Promise.all(
      sources.map(async source => {
        const pingUrl = getSourcePingUrl(source.source);
        if (!pingUrl) return { source: source.source, latency: undefined };
        try {
          const response = await fetch(`/api/ping?url=${encodeURIComponent(pingUrl)}`, {
            signal: AbortSignal.timeout(3000),
          });
          if (response.ok) {
            const data = await response.json();
            return { source: source.source, latency: data.latency };
          }
        } catch {}
        return { source: source.source, latency: undefined };
      })
    );

    const newLatencies: Record<string, number> = {};
    results.forEach(({ source, latency }) => {
      if (latency !== undefined) newLatencies[source] = latency;
    });
    setLatencies(newLatencies);
    setIsLoadingLatency(false);
  }, [sources, getSourcePingUrl]);

  // Display episodes & pagination for large episode counts (e.g. > 30 episodes)
  const displayEpisodes = useMemo(() => {
    if (!episodes) return null;
    return isReversed ? [...episodes].reverse() : episodes;
  }, [episodes, isReversed]);

  const getOriginalIndex = useCallback(
    (displayIndex: number) => {
      if (!episodes || !isReversed) return displayIndex;
      return episodes.length - 1 - displayIndex;
    },
    [episodes, isReversed]
  );

  const getDisplayIndex = useCallback(
    (originalIndex: number) => {
      if (!episodes || !isReversed) return originalIndex;
      return episodes.length - 1 - originalIndex;
    },
    [episodes, isReversed]
  );

  // Group into tabs if > 30 episodes
  const EPISODES_PER_TAB = 30;
  const episodeTabs = useMemo(() => {
    if (!displayEpisodes || displayEpisodes.length <= EPISODES_PER_TAB) return null;
    const count = Math.ceil(displayEpisodes.length / EPISODES_PER_TAB);
    return Array.from({ length: count }, (_, i) => ({
      start: i * EPISODES_PER_TAB + 1,
      end: Math.min((i + 1) * EPISODES_PER_TAB, displayEpisodes.length),
      index: i,
    }));
  }, [displayEpisodes]);

  const currentTabEpisodes = useMemo(() => {
    if (!displayEpisodes) return [];
    if (!episodeTabs) return displayEpisodes;
    const start = selectedRangeIndex * EPISODES_PER_TAB;
    return displayEpisodes.slice(start, start + EPISODES_PER_TAB);
  }, [displayEpisodes, episodeTabs, selectedRangeIndex]);

  const isGridFormat = (displayEpisodes?.length || 0) > 4;

  return (
    <div className="bg-[#0A0A0F]/80 backdrop-blur-2xl rounded-3xl border border-white/10 p-5 sm:p-6 shadow-2xl space-y-6">
      {/* 1. ⚡ 极速智能测速换源条 */}
      {showSourceSelector && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-base">⚡</span>
              <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                <span>播放线路</span>
                <span className="text-[10px] text-white/40 font-normal">({sources.length} 条可用源)</span>
              </h4>
            </div>
            <button
              onClick={refreshLatencies}
              disabled={isLoadingLatency}
              className="text-[11px] font-medium text-white/50 hover:text-[var(--accent-color)] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Icons.RefreshCw size={11} className={isLoadingLatency ? 'animate-spin' : ''} />
              <span>测速</span>
            </button>
          </div>

          {/* 横向滑动的极速源药丸切换栏 */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
            {sortedSources.map((source, idx) => {
              const isCurrent = source.source === currentSource;
              const latency = latencies[source.source] ?? source.latency;
              const isFastest = idx === 0 && (latency || 0) < 150;

              return (
                <button
                  key={source.source}
                  onClick={() => !isCurrent && onSourceChange!(source)}
                  className={`shrink-0 px-3.5 py-2 rounded-2xl text-xs font-bold transition-all duration-300 flex items-center gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30 scale-102 border border-white/20'
                      : 'bg-white/5 hover:bg-white/10 text-white/70 hover:text-white border border-white/10'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    isCurrent ? 'bg-white animate-pulse' :
                    (latency || 0) < 150 ? 'bg-emerald-400' :
                    (latency || 0) < 350 ? 'bg-amber-400' : 'bg-white/30'
                  }`} />
                  <span className="truncate max-w-[100px]">{source.sourceName || source.source}</span>
                  {latency !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                      isCurrent ? 'bg-black/30 text-white' : 'bg-white/10 text-white/60'
                    }`}>
                      {latency}ms
                    </span>
                  )}
                  {isFastest && !isCurrent && (
                    <span className="text-[9px] px-1 bg-emerald-500/20 text-emerald-300 rounded font-black">
                      推荐
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2. 🎬 剧集选集面板 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">📺</span>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>正片选集</span>
              {episodes && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white/80">
                  共 {episodes.length} 集
                </span>
              )}
            </h3>
          </div>

          {/* 倒序/正序切换 */}
          {episodes && episodes.length > 1 && (
            <button
              onClick={() => onToggleReverse?.(!isReversed)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                isReversed
                  ? 'bg-[var(--accent-color)] text-white shadow-md'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10 border border-white/10'
              }`}
              title={isReversed ? '切换为正序' : '切换为倒序'}
            >
              <Icons.ArrowUpDown size={13} />
              <span className="text-[11px]">{isReversed ? '倒序' : '正序'}</span>
            </button>
          )}
        </div>

        {/* 选集范围 Tabs（当集数超过 30 集时） */}
        {episodeTabs && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar mb-3 pb-1">
            {episodeTabs.map(tab => (
              <button
                key={tab.index}
                onClick={() => setSelectedRangeIndex(tab.index)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedRangeIndex === tab.index
                    ? 'bg-white/20 text-white border border-white/30'
                    : 'bg-white/5 text-white/50 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.start}-{tab.end}
              </button>
            ))}
          </div>
        )}

        {/* 选集按钮容器 */}
        <div
          ref={listRef}
          className={`max-h-[380px] sm:max-h-[520px] overflow-y-auto pr-1 ${
            isGridFormat
              ? 'grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2'
              : 'space-y-2'
          }`}
          role="radiogroup"
        >
          {currentTabEpisodes && currentTabEpisodes.length > 0 ? (
            currentTabEpisodes.map((episode, idxInTab) => {
              const displayIndex = episodeTabs ? selectedRangeIndex * EPISODES_PER_TAB + idxInTab : idxInTab;
              const originalIndex = getOriginalIndex(displayIndex);
              const isCurrentEpisode = currentEpisode === originalIndex;

              return (
                <button
                  key={originalIndex}
                  ref={el => { buttonRefs.current[displayIndex] = el; }}
                  onClick={() => onEpisodeClick(episode, originalIndex)}
                  className={`
                    relative transition-all duration-300 cursor-pointer rounded-2xl flex items-center justify-center font-bold text-center select-none active:scale-95
                    ${isGridFormat ? 'h-12 text-xs sm:text-sm' : 'w-full py-3 px-4 text-left justify-between'}
                    ${isCurrentEpisode
                      ? 'bg-[var(--accent-color)] text-white shadow-xl shadow-[var(--accent-color)]/40 ring-2 ring-white/30 scale-102 z-10'
                      : 'bg-white/5 hover:bg-white/15 text-white/80 hover:text-white border border-white/10'
                    }
                  `}
                >
                  <span className="truncate px-1">
                    {episode.name || `${originalIndex + 1}`}
                  </span>

                  {/* 正在播放声波均衡器动画 */}
                  {isCurrentEpisode && (
                    <div className="absolute right-2.5 flex items-end gap-0.5 h-3.5">
                      <span className="w-0.5 bg-white rounded-full animate-eq-1" />
                      <span className="w-0.5 bg-white rounded-full animate-eq-2" />
                      <span className="w-0.5 bg-white rounded-full animate-eq-3" />
                    </div>
                  )}
                </button>
              );
            })
          ) : (
            <div className="col-span-full py-12 text-center text-white/30">
              <Icons.Inbox size={40} className="mx-auto mb-2 opacity-30" />
              <p className="text-xs">暂无可用剧集</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
