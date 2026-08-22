'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { TypeBadge } from '@/lib/types';
import { normalizeVideoType } from '@/lib/utils/taxonomy';

/**
 * 影视分类聚合与过滤 Hook
 * 接入全局统一分类清洗引擎，杜绝残缺词与上游脏标签
 */

export function useTypeBadges<T extends { type_name?: string; vod_name?: string }>(videos: T[]) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set());

  // 收集并统计标准规范分类
  const typeBadges = useMemo<TypeBadge[]>(() => {
    const typeMap = new Map<string, { display: string; count: number }>();

    videos.forEach(video => {
      if (video.type_name && video.type_name.trim()) {
        const norm = normalizeVideoType(video.type_name, video.vod_name || '');
        const badgeLabel = norm.badge;
        const existing = typeMap.get(badgeLabel);
        if (existing) {
          existing.count++;
        } else {
          typeMap.set(badgeLabel, { display: badgeLabel, count: 1 });
        }
      }
    });

    // 转换为数组并按出现频次降序排序
    return Array.from(typeMap.entries())
      .map(([, val]) => ({ type: val.display, count: val.count }))
      .sort((a, b) => b.count - a.count);
  }, [videos]);

  // 根据选中的标准分类进行过滤
  const filteredVideos = useMemo(() => {
    if (selectedTypes.size === 0) {
      return videos;
    }

    return videos.filter(video => {
      const norm = normalizeVideoType(video.type_name, video.vod_name || '');
      return selectedTypes.has(norm.badge) || selectedTypes.has(norm.standardType);
    });
  }, [videos, selectedTypes]);

  // Toggle type selection - useCallback to prevent re-creation
  const toggleType = useCallback((type: string) => {
    // Update selected types immediately (high priority)
    setSelectedTypes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(type)) {
        newSet.delete(type);
      } else {
        newSet.add(type);
      }
      return newSet;
    });
  }, []);

  // Auto-cleanup: remove selected types that no longer exist in badges
  useEffect(() => {
    const availableTypes = new Set(typeBadges.map(b => b.type));

    setSelectedTypes(prev => {
      const filtered = new Set(
        Array.from(prev).filter(type => availableTypes.has(type))
      );

      // Only update if changed
      if (filtered.size !== prev.size) {
        return filtered;
      }
      return prev;
    });
  }, [typeBadges]);

  return {
    typeBadges,
    selectedTypes,
    filteredVideos,
    toggleType,
  };
}
