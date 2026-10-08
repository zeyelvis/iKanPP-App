/**
 * 服务端页面读取首屏数据集（一次 D1 查询），交给 components/data/PageDataProvider。
 */
import type { PageData } from '@/components/data/PageDataProvider';
import type { HomeChannel } from '@/lib/types/prebaked';
import { loadDocuments } from './documents';

export async function loadPageData(want: { home?: HomeChannel[]; latest?: string[]; category?: string[] }): Promise<PageData> {
  const keys = [
    ...(want.home ?? []).map((c) => `home:${c}`),
    ...(want.latest ?? []).map((c) => `latest:${c}`),
    ...(want.category ?? []).map((c) => `category:${c}`),
  ];
  const docs = await loadDocuments(keys).catch(() => ({}) as Record<string, unknown>);
  const pick = <T,>(prefix: string, list: string[] = []) =>
    Object.fromEntries(list.filter((c) => docs[`${prefix}:${c}`] !== undefined).map((c) => [c, docs[`${prefix}:${c}`] as T]));
  return {
    home: pick('home', want.home),
    latest: pick('latest', want.latest),
    category: pick('category', want.category),
  };
}
