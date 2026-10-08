'use client';

/**
 * 页面用到的首屏数据集（D1 documents）由服务端页面读出，经这个 Provider 交给客户端组件。
 * 取代原来客户端组件直接 import 的预烘焙文件（那些文件每小时由机器人提交，数据还被打进浏览器 JS）。
 * 页面没读的数据集按空列表处理。
 */
import { createContext, useContext, useMemo, type ReactNode } from 'react';
import type { HomeChannel, LatestPrebakedItem, PrebakedCategoryItem, PrebakedHomeCategory } from '@/lib/types/prebaked';

export interface PageData {
  home: Partial<Record<HomeChannel, Partial<PrebakedHomeCategory>>>;
  latest: Partial<Record<string, LatestPrebakedItem[]>>;
  category: Partial<Record<string, PrebakedCategoryItem[]>>;
}

const CHANNELS: HomeChannel[] = ['all', 'movie', 'tv', 'anime', 'variety', 'short', 'documentary'];
const EMPTY: PageData = { home: {}, latest: {}, category: {} };
const PageDataContext = createContext<PageData>(EMPTY);

export function PageDataProvider({ data, children }: { data: PageData; children: ReactNode }) {
  return <PageDataContext.Provider value={data}>{children}</PageDataContext.Provider>;
}

const withDefaults = (d?: Partial<PrebakedHomeCategory>): PrebakedHomeCategory => ({
  hero: d?.hero ?? [],
  top10: d?.top10 ?? [],
  s1: d?.s1 ?? [],
  s2: d?.s2 ?? [],
  s3: d?.s3 ?? [],
  s4: d?.s4 ?? [],
  trendingNav: d?.trendingNav ?? [],
});

/** 一个频道的首屏数据（没读到时各列表为空）。 */
export function useHomeData(channel: HomeChannel): PrebakedHomeCategory {
  const { home } = useContext(PageDataContext);
  return useMemo(() => withDefaults(home[channel]), [home, channel]);
}

/** 全部频道的首屏数据，形状与原 PREBAKED_HOME_DATA 相同。 */
export function useAllHomeData(): Record<HomeChannel, PrebakedHomeCategory> {
  const { home } = useContext(PageDataContext);
  return useMemo(() => Object.fromEntries(CHANNELS.map((c) => [c, withDefaults(home[c])])) as Record<HomeChannel, PrebakedHomeCategory>, [home]);
}

/** 全部频道的最新上线，形状与原 PREBAKED_LATEST_TITLES 相同。 */
export function useLatestTitles(): Partial<Record<string, LatestPrebakedItem[]>> {
  return useContext(PageDataContext).latest;
}

/** 全部频道的大厅货架，形状与原 PREBAKED_CATEGORY_ITEMS 相同。 */
export function useCategoryItems(): Partial<Record<string, PrebakedCategoryItem[]>> {
  return useContext(PageDataContext).category;
}
