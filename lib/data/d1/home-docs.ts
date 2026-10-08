/**
 * 服务端接口（订阅源、llms 文本、豆瓣兜底、电报机器人）用的首屏数据集，取自 D1 documents。
 * 同一个 Worker 实例里缓存 5 分钟，省得每次请求都查库；读不到时各列表为空。
 */
import type { HomeChannel, LatestPrebakedItem, PrebakedHomeCategory } from '@/lib/types/prebaked';
import { loadDocuments } from './documents';

const CHANNELS: HomeChannel[] = ['all', 'movie', 'tv', 'anime', 'variety', 'short', 'documentary'];
const TTL = 5 * 60_000;
let memo: { at: number; value: Promise<HomeDocs> } | null = null;

export interface HomeDocs {
  home: Record<HomeChannel, PrebakedHomeCategory>;
  latest: Record<string, LatestPrebakedItem[]>;
}

async function load(): Promise<HomeDocs> {
  const docs = await loadDocuments([...CHANNELS.map((c) => `home:${c}`), ...CHANNELS.map((c) => `latest:${c}`)]).catch(() => ({}) as Record<string, unknown>);
  const home = Object.fromEntries(
    CHANNELS.map((c) => {
      const d = (docs[`home:${c}`] ?? {}) as Partial<PrebakedHomeCategory>;
      return [c, { hero: d.hero ?? [], top10: d.top10 ?? [], s1: d.s1 ?? [], s2: d.s2 ?? [], s3: d.s3 ?? [], s4: d.s4 ?? [], trendingNav: d.trendingNav ?? [] }];
    }),
  ) as Record<HomeChannel, PrebakedHomeCategory>;
  const latest = Object.fromEntries(CHANNELS.map((c) => [c, (docs[`latest:${c}`] as LatestPrebakedItem[] | undefined) ?? []]));
  return { home, latest };
}

export function loadHomeDocs(): Promise<HomeDocs> {
  if (!memo || Date.now() - memo.at > TTL) {
    const value = load();
    memo = { at: Date.now(), value };
    // 读失败不缓存
    value.then((v) => { if (!Object.values(v.home).some((h) => h.hero.length)) memo = null; }).catch(() => { memo = null; });
  }
  return memo.value;
}
