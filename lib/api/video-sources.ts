/**
 * Video Source Configuration and Management
 * Handles third-party video API sources with validation and health checks
 */

import type { VideoSource } from '@/lib/types';
import { DEFAULT_SOURCES } from './default-sources';
import { PREMIUM_SOURCES } from './premium-sources';

/**
 * Get source by ID from both default and premium sources
 */
export function getSourceById(id: string): VideoSource | undefined {
  // Search in default sources first
  const defaultSource = DEFAULT_SOURCES.find(source => source.id === id);
  if (defaultSource) {
    return defaultSource;
  }

  // Search in premium sources
  return PREMIUM_SOURCES.find(source => source.id === id);
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
  const source = getSourceById(id);
  return Boolean(source && source.enabled !== false);
}
