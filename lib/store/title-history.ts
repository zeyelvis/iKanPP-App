'use client';

import { useMemo } from 'react';
import type { VideoHistoryItem } from '@/lib/types';
import { useHistoryStore } from './history-store';

/** The history entry of a title, matched by any of its names (case and spaces ignored). */
export function findTitleHistory(list: VideoHistoryItem[], titles: string[]): VideoHistoryItem | undefined {
  const names = titles.map((t) => t.trim().toLowerCase()).filter(Boolean);
  return list.find((h) => {
    const name = h.title?.trim().toLowerCase();
    return !!name && names.includes(name);
  });
}

/**
 * A title's history entry for components on its page. The player on the same page saves the
 * position every 5 seconds; subscribed to the whole history, every such component re-rendered
 * (and reran its effects) with each save. This changes only when the episode, line, episode
 * list or (with `progress`) tenth of progress changes (铁律 22).
 */
export function useTitleHistory(titles: string[], { progress = true }: { progress?: boolean } = {}): VideoHistoryItem | null {
  const names = titles.join('\n');
  const key = useHistoryStore((s) => {
    const h = findTitleHistory(s.viewingHistory, names.split('\n'));
    if (!h) return '';
    const tenth = progress && h.duration > 0 ? Math.floor((h.playbackPosition / h.duration) * 10) : -1;
    return `${h.videoId}|${h.source}|${h.episodeIndex}|${h.episodes?.length ?? 0}|${tenth}`;
  });
  return useMemo(
    () => (key ? findTitleHistory(useHistoryStore.getState().viewingHistory, names.split('\n')) ?? null : null),
    [key, names],
  );
}
