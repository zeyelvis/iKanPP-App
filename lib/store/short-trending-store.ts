'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DramaHeatRecord {
  count: number;
  lastViewed: number;
}

interface ShortTrendingState {
  heatMap: Record<string, DramaHeatRecord>;
  recordClick: (title: string) => void;
  getHeatBonus: (title: string) => number;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const useShortTrendingStore = create<ShortTrendingState>()(
  persist(
    (set, get) => ({
      heatMap: {},

      recordClick: (title: string) => {
        if (!title) return;
        const key = title.trim().toLowerCase();
        const now = Date.now();
        const current = get().heatMap[key] || { count: 0, lastViewed: now };

        set((state) => {
          const nextMap = { ...state.heatMap };
          nextMap[key] = {
            count: current.count + 1,
            lastViewed: now,
          };

          // 清理超过 7 天的老旧无活跃记录
          for (const k in nextMap) {
            if (now - nextMap[k].lastViewed > SEVEN_DAYS_MS) {
              delete nextMap[k];
            }
          }

          return { heatMap: nextMap };
        });
      },

      getHeatBonus: (title: string) => {
        if (!title) return 0;
        const key = title.trim().toLowerCase();
        const item = get().heatMap[key];
        if (!item) return 0;
        // 每次点击权重加成 500 点
        return item.count * 500;
      },
    }),
    {
      name: 'kvideo-short-trending-v1',
    }
  )
);
