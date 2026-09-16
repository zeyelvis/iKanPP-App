import type { FavoriteItem, VideoHistoryItem } from '@/lib/types';
import { DEPRECATED_SOURCES } from '@/lib/api/video-sources';

function hasIdentity(value: unknown): boolean {
  if (!value || typeof value !== 'object') return false;
  const record = value as { videoId?: unknown; source?: unknown; title?: unknown };
  const videoId = record.videoId;
  const hasVideoId = typeof videoId === 'string'
    ? videoId.trim().length > 0
    : typeof videoId === 'number' && Number.isFinite(videoId);

  return hasVideoId &&
    typeof record.source === 'string' && record.source.trim().length > 0 &&
    typeof record.title === 'string' && record.title.trim().length > 0;
}

/**
 * Records restored from server-side sync are not guaranteed to be well formed —
 * they may come from an older schema or a partial write. Rendering one without
 * `videoId` or `episodeIndex` throws while building the player URL, which takes
 * down the whole page, so anything lacking the required URL fields is dropped.
 */
export function isRenderableHistoryItem(value: unknown): value is VideoHistoryItem {
  if (!hasIdentity(value)) return false;
  const episodeIndex = (value as { episodeIndex?: unknown }).episodeIndex;
  return typeof episodeIndex === 'number' && Number.isInteger(episodeIndex) && episodeIndex >= 0;
}

export function isRenderableFavoriteItem(value: unknown): value is FavoriteItem {
  return hasIdentity(value);
}

export function keepRenderableHistory(items: unknown): VideoHistoryItem[] {
  if (!Array.isArray(items)) return [];
  return items.filter(isRenderableHistoryItem).map((item) => {
    // 若命中已下线的历史废弃源（如 ole_vip, ole_hd），清理该废弃标记
    if (item.source && DEPRECATED_SOURCES.has(item.source)) {
      const cleanedSourceMap = { ...(item.sourceMap || {}) };
      for (const dep of DEPRECATED_SOURCES) {
        delete cleanedSourceMap[dep];
      }
      return {
        ...item,
        source: 'juliang', // 优雅回退到当前全站第一黄金骨干源
        sourceMap: cleanedSourceMap,
      };
    }
    return item;
  });
}

export function keepRenderableFavorites(items: unknown): FavoriteItem[] {
  return Array.isArray(items) ? items.filter(isRenderableFavoriteItem) : [];
}
