/**
 * IPTV Store - Manages IPTV/M3U playlist sources and cached channels
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { parseM3U, groupChannelsByName, type M3UChannel } from '@/lib/utils/m3u-parser';

export interface IPTVSource {
  id: string;
  name: string;
  url: string;
  addedAt: number;
}

interface IPTVState {
  sources: IPTVSource[];
  cachedChannels: M3UChannel[];
  cachedGroups: string[];
  cachedChannelsBySource: Record<string, { channels: M3UChannel[]; groups: string[] }>;
  lastRefreshed: number;
  isLoading: boolean;
}

interface IPTVActions {
  addSource: (name: string, url: string) => void;
  removeSource: (id: string) => void;
  updateSource: (id: string, updates: Partial<Pick<IPTVSource, 'name' | 'url'>>) => void;
  refreshSources: () => Promise<void>;
  setLoading: (loading: boolean) => void;
}

interface IPTVStore extends IPTVState, IPTVActions { }

const MAX_CONCURRENT = 3;

async function fetchWithConcurrencyLimit<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = [];
  let index = 0;

  async function runNext(): Promise<void> {
    while (index < tasks.length) {
      const currentIndex = index++;
      results[currentIndex] = await tasks[currentIndex]();
    }
  }

  const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => runNext());
  await Promise.all(workers);
  return results;
}

const DEFAULT_IPTV_SOURCES: IPTVSource[] = [
  {
    id: 'default-guovin-cctv-ws',
    name: '🔥 国内央视卫视精选 (每日自动维护)',
    url: 'https://raw.githubusercontent.com/Guovin/iptv-api/gd/output/result.m3u',
    addedAt: 0,
  },
  {
    id: 'default-vbskycn-iptv4',
    name: '📡 全球中文与港澳台精选',
    url: 'https://raw.githubusercontent.com/vbskycn/iptv/master/tv/iptv4.m3u',
    addedAt: 0,
  },
  {
    id: 'default-iptv-org-zho',
    name: '🌐 全球电视台精选 (IPTV-ORG)',
    url: 'https://iptv-org.github.io/iptv/languages/zho.m3u',
    addedAt: 0,
  },
];

export const useIPTVStore = create<IPTVStore>()(
  persist(
    (set, get) => ({
      sources: DEFAULT_IPTV_SOURCES,
      cachedChannels: [],
      cachedGroups: [],
      cachedChannelsBySource: {},
      lastRefreshed: 0,
      isLoading: false,

      addSource: (name, url) => {
        const id = `iptv-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
        set((state) => ({
          sources: [...state.sources, { id, name, url, addedAt: Date.now() }],
        }));
      },

      removeSource: (id) => {
        set((state) => ({
          sources: state.sources.filter((s) => s.id !== id),
        }));
      },

      updateSource: (id, updates) => {
        set((state) => ({
          sources: state.sources.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      refreshSources: async () => {
        const { sources } = get();
        if (sources.length === 0) {
          set({ cachedChannels: [], cachedGroups: [], cachedChannelsBySource: {}, lastRefreshed: Date.now() });
          return;
        }

        set({ isLoading: true });

        try {
          const allChannels: M3UChannel[] = [];
          const allGroups = new Set<string>();
          const channelsBySourceRaw: Record<string, M3UChannel[]> = {};
          const groupsBySource: Record<string, Set<string>> = {};

          const tasks = sources.map((source) => async () => {
            try {
              const res = await fetch('/api/iptv?' + new URLSearchParams({ url: source.url }));
              if (!res.ok) return;
              const text = await res.text();
              const playlist = parseM3U(text);
              // Tag channels with source info
              const tagged = playlist.channels.map(ch => ({
                ...ch,
                sourceId: source.id,
                sourceName: source.name,
              }));
              allChannels.push(...tagged);
              playlist.groups.forEach((g) => allGroups.add(g));
              // Track per-source
              channelsBySourceRaw[source.id] = tagged;
              groupsBySource[source.id] = new Set(playlist.groups);
            } catch (e) {
              console.error(`Failed to fetch IPTV source: ${source.name}`, e);
            }
          });

          await fetchWithConcurrencyLimit(tasks, MAX_CONCURRENT);

          // Group channels by normalized name across all sources
          const mergedChannels = groupChannelsByName(allChannels);

          // Also group per-source channels
          const channelsBySource: Record<string, { channels: M3UChannel[]; groups: string[] }> = {};
          for (const [srcId, chList] of Object.entries(channelsBySourceRaw)) {
            const merged = groupChannelsByName(chList);
            const grps = Array.from(groupsBySource[srcId] || []);
            channelsBySource[srcId] = { channels: merged, groups: grps };
          }

          set({
            cachedChannels: mergedChannels,
            cachedGroups: Array.from(allGroups),
            cachedChannelsBySource: channelsBySource,
            lastRefreshed: Date.now(),
            isLoading: false,
          });
        } catch (e) {
          console.error('Failed to refresh IPTV sources', e);
          set({ isLoading: false });
        }
      },

      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'kvideo-iptv-store',
      version: 13,
      migrate: (persistedState: any, version: number) => {
        let sources = persistedState.sources || [];
        sources = sources.filter((s: any) => !s.id?.startsWith('default-'));
        persistedState.sources = [...DEFAULT_IPTV_SOURCES, ...sources];
        persistedState.cachedChannels = [];
        persistedState.cachedGroups = [];
        persistedState.cachedChannelsBySource = {};
        persistedState.lastRefreshed = 0;
        return persistedState;
      },
      partialize: (state) => ({
        sources: state.sources,
        lastRefreshed: state.lastRefreshed,
      }),
    }
  )
);
