/**
 * Video Source Configuration and Management
 * Handles third-party video API sources with validation and health checks
 */

import type { VideoSource } from '@/lib/types';
import { DEFAULT_SOURCES } from './default-sources';

/**
 * Get source by ID from the default sources
 */
export function getSourceById(id: string): VideoSource | undefined {
  return DEFAULT_SOURCES.find(source => source.id === id);
}

/**
 * 历史已废弃、已下线或不符合当前直连协议的黑名单源
 */
export const DEPRECATED_SOURCES = new Set(['ole_vip', 'ole_hd', 'olevod']);

/**
 * 检查线路 ID 是否有效且可用（非废弃且在可用列表中启用）
 */
export function isValidSourceId(id?: string | null): boolean {
  if (!id) return false;
  if (DEPRECATED_SOURCES.has(id)) return false;
  if (id === 'shadowline' || id === 'shadow' || id === 'gz360') return true;
  const source = getSourceById(id);
  return Boolean(source && source.enabled !== false);
}
