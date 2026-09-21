/**
 * History State Store using Zustand
 * Manages viewing history with localStorage persistence
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { VideoHistoryItem, Episode } from '@/lib/types';
import { clearSegmentsForUrl, clearAllCache } from '@/lib/utils/cacheManager';
import { profiledKey } from '@/lib/utils/profile-storage';
import { keepRenderableHistory } from '@/lib/utils/sync-records';

const MAX_HISTORY_ITEMS = 50;

interface HistoryState {
  viewingHistory: VideoHistoryItem[];
}

interface HistoryActions {
  addToHistory: (
    videoId: string | number,
    title: string,
    url: string,
    episodeIndex: number,
    source: string,
    playbackPosition: number,
    duration: number,
    poster?: string,
    episodes?: Episode[],
    metadata?: { vod_actor?: string; type_name?: string; vod_area?: string; isPremium?: boolean }
  ) => void;

  removeFromHistory: (showIdentifier: string) => void;
  clearHistory: () => void;
  importHistory: (history: VideoHistoryItem[]) => void;
}

interface HistoryStore extends HistoryState, HistoryActions { }

/**
 * Generate unique identifier for deduplication (source-agnostic)
 */
function generateShowIdentifier(title: string): string {
  return `title:${title.toLowerCase().trim()}`;
}

/**
 * Migrate v1 history entries to v2 (merge entries with same title)
 */
function migrateHistory(history: VideoHistoryItem[]): VideoHistoryItem[] {
  const merged = new Map<string, VideoHistoryItem>();

  for (const item of history) {
    const newId = generateShowIdentifier(item.title);

    const existing = merged.get(newId);
    if (existing) {
      // Keep the more recent entry, merge sourceMap
      const isNewer = item.timestamp > existing.timestamp;
      const mergedSourceMap = {
        ...(existing.sourceMap || { [existing.source]: existing.videoId }),
        ...(item.sourceMap || { [item.source]: item.videoId }),
      };

      merged.set(newId, {
        ...(isNewer ? item : existing),
        showIdentifier: newId,
        sourceMap: mergedSourceMap,
        // Keep newer playback state
        playbackPosition: isNewer ? item.playbackPosition : existing.playbackPosition,
        duration: isNewer ? item.duration : existing.duration,
        episodeIndex: isNewer ? item.episodeIndex : existing.episodeIndex,
        url: isNewer ? item.url : existing.url,
        source: isNewer ? item.source : existing.source,
        videoId: isNewer ? item.videoId : existing.videoId,
        timestamp: Math.max(item.timestamp, existing.timestamp),
        episodes: (isNewer ? item.episodes : existing.episodes) || [],
        poster: isNewer ? (item.poster || existing.poster) : (existing.poster || item.poster),
      });
    } else {
      merged.set(newId, {
        ...item,
        showIdentifier: newId,
        sourceMap: item.sourceMap || { [item.source]: item.videoId },
      });
    }
  }

  return Array.from(merged.values()).sort((a, b) => b.timestamp - a.timestamp);
}

const createHistoryStore = (name: string) =>
  create<HistoryStore>()(
    persist(
      (set, get) => ({
        viewingHistory: [],

        addToHistory: (
          videoId,
          title,
          url,
          episodeIndex,
          source,
          playbackPosition,
          duration,
          poster,
          episodes = [],
          metadata
        ) => {
          const showIdentifier = generateShowIdentifier(title);
          const timestamp = Date.now();

          set((state) => {
            // Check if item already exists (by normalized title)
            const existingIndex = state.viewingHistory.findIndex(
              (item) => item.showIdentifier === showIdentifier
            );

            let newHistory: VideoHistoryItem[];

            if (existingIndex !== -1) {
              const existing = state.viewingHistory[existingIndex];
              // Merge sourceMap
              const mergedSourceMap = {
                ...(existing.sourceMap || { [existing.source]: existing.videoId }),
                [source]: videoId,
              };

              // Update existing item and move to top
              const updatedItem: VideoHistoryItem = {
                ...existing,
                videoId,
                source,
                url,
                episodeIndex,
                playbackPosition,
                duration,
                timestamp,
                sourceMap: mergedSourceMap,
                episodes: episodes.length > 0 ? episodes : existing.episodes,
                poster: poster || existing.poster,
                vod_actor: metadata?.vod_actor ?? existing.vod_actor,
                type_name: metadata?.type_name ?? existing.type_name,
                vod_area: metadata?.vod_area ?? existing.vod_area,
                isPremium: metadata?.isPremium ?? existing.isPremium,
              };

              newHistory = [
                updatedItem,
                ...state.viewingHistory.filter((_, index) => index !== existingIndex),
              ];
            } else {
              // Add new item at the top
              const newItem: VideoHistoryItem = {
                videoId,
                title,
                url,
                episodeIndex,
                source,
                timestamp,
                playbackPosition,
                duration,
                poster,
                episodes,
                showIdentifier,
                sourceMap: { [source]: videoId },
                vod_actor: metadata?.vod_actor,
                type_name: metadata?.type_name,
                vod_area: metadata?.vod_area,
                isPremium: metadata?.isPremium,
              };

              newHistory = [newItem, ...state.viewingHistory];
            }

            // Limit history size
            if (newHistory.length > MAX_HISTORY_ITEMS) {
              newHistory = newHistory.slice(0, MAX_HISTORY_ITEMS);
            }

            return { viewingHistory: newHistory };
          });
        },

        removeFromHistory: (showIdentifier) => {
          const state = get();
          const itemToRemove = state.viewingHistory.find(
            (item) => item.showIdentifier === showIdentifier
          );

          if (itemToRemove) {
            // Clear cache for this video
            clearSegmentsForUrl(itemToRemove.url);
          }

          set((state) => ({
            viewingHistory: state.viewingHistory.filter(
              (item) => item.showIdentifier !== showIdentifier
            ),
          }));
        },

        clearHistory: () => {
          // Clear all cached segments
          clearAllCache();
          set({ viewingHistory: [] });
        },

        importHistory: (history) => {
          set({ viewingHistory: keepRenderableHistory(history) });
        },
      }),
      {
        name,
        version: 2,
        migrate: (persistedState: any, version: number) => {
          if (version < 2) {
            // Migrate from v1: merge entries with same normalized title
            const oldHistory = persistedState?.viewingHistory || [];
            return {
              ...persistedState,
              viewingHistory: keepRenderableHistory(migrateHistory(oldHistory)),
            };
          }
          return {
            ...persistedState,
            viewingHistory: keepRenderableHistory(persistedState?.viewingHistory || []),
          } as HistoryStore;
        },
      }
    )
  );

export const useHistoryStore = createHistoryStore(profiledKey('kvideo-history-store'));
export const usePremiumHistoryStore = createHistoryStore(profiledKey('kvideo-premium-history-store'));

/**
 * Helper hook to get the appropriate history store.
 *
 * ⚠️ 架构铁律警告：
 * 严禁在播放器容器（IkanPPPlayerContainer / IkanXPlayerContainer）等高频渲染组件中
 * 不传 selector 直接解构使用（如 const { addToHistory } = useHistory()）！
 * 否则每 5 秒保存播放进度更新 viewingHistory 时，会强制触发整个父容器及其子树全量级联重渲染，
 * 引发音视频 MSE 解码管线掉帧与周期性卡顿！
 * 播放器容器必须直接使用：
 * - 主站: useHistoryStore((s) => s.addToHistory)
 * - 午夜: usePremiumHistoryStore((s) => s.addToHistory)
 */
export function useHistory(isPremium?: boolean): HistoryStore;
export function useHistory<T>(selector: (state: HistoryStore) => T, isPremium?: boolean): T;
export function useHistory<T = HistoryStore>(
  arg1?: boolean | ((state: HistoryStore) => T),
  arg2: boolean = false
): T | HistoryStore {
  const isPremium = typeof arg1 === 'boolean' ? arg1 : arg2;
  const selector = typeof arg1 === 'function' ? arg1 : ((s: HistoryStore) => s as unknown as T);
  const store = isPremium ? usePremiumHistoryStore : useHistoryStore;
  return store(selector);
}

