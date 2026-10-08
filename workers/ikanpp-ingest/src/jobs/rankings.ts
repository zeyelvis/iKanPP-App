/**
 * 爱壹帆四大排序（AGENTS 准则 17.3）：添加时间、更新时间、人气、评分，6 个频道共 24 个列表，
 * 取代 scripts/sync-iyf-four-rankings.mjs。结果写入 documents 的 rank:<排序>:<频道>。
 * - 两个时间排序每小时取（前 300 / 200 部）；人气、评分变化慢，每天北京时间 4 点取一次（前 900 / 600 部）。
 * - 只按片名 + 年份关联已有作品（D1 titles），关联不上的保留片名与年份，**不分配编号**：
 *   旧脚本在这里给关联不上的片名顺手发号却不建档，这些编号后来被别的脚本拿去建了别的作品，
 *   是编号改指的来源之一。新编号只能由数据库在建档时分配（见 .plans 第 10 节）。
 * - 不再置顶写死的「先锋」作品（旧脚本固定把 ik020581 放第一），顺序与爱壹帆一致。
 * 某个列表取到的作品少于 20 部时，保留上一次的结果。
 */
import { isCleanChineseTitle } from '../../../../lib/data/entities/entity-utils';
import type { Env } from '../env';
import { sortedList, type IyfListItem } from '../iyf';

type Sort = 'time_added' | 'time_updated' | 'popularity' | 'score';
const SORTS: Array<{ key: Sort; orderby: 0 | 1 | 2 | 3; daily: boolean }> = [
  { key: 'time_added', orderby: 0, daily: false },
  { key: 'time_updated', orderby: 1, daily: false },
  { key: 'popularity', orderby: 2, daily: true },
  { key: 'score', orderby: 3, daily: true },
];
const CHANNELS = [
  { key: 'all', cid: '', big: true },
  { key: 'movie', cid: '0,1,3', big: true },
  { key: 'tv', cid: '0,1,4', big: true },
  { key: 'anime', cid: '0,1,6', big: false },
  { key: 'variety', cid: '0,1,5', big: false },
  { key: 'documentary', cid: '0,1,7', big: false },
];
const IYF_KIND: Record<string, string> = { 电影: 'movie', 电视剧: 'tv', 动漫: 'anime', 综艺: 'variety', 纪录片: 'documentary' };
const MIN_TO_PUBLISH = 20;

export interface RankEntry {
  id?: string;        // 关联上的作品编号 ik000123
  title: string;
  year?: number;
  kind?: string;
  score?: string;     // 爱壹帆评分（「暂无评分」不存）
  hot?: number;
  badge?: string;     // 爱壹帆的更新信息原文（lastName）
}

function pagesFor(sort: (typeof SORTS)[number], big: boolean) {
  return sort.daily ? (big ? 18 : 12) : big ? 6 : 4;
}

async function fetchList(cid: string, orderby: 0 | 1 | 2 | 3, pages: number): Promise<IyfListItem[]> {
  const out: IyfListItem[] = [];
  const seen = new Set<string>();
  for (let page = 1; page <= pages; page++) {
    const list = await sortedList(cid, orderby, page);
    for (const it of list) {
      if (seen.has(it.title) || !isCleanChineseTitle(it.title)) continue;
      seen.add(it.title);
      out.push(it);
    }
    if (list.length < 50) break;
  }
  return out;
}

/** 片名 → 候选作品（live），按片名分批查。 */
async function loadTitles(env: Env, names: string[]) {
  const byName = new Map<string, Array<{ id: number; year: number | null; kind: string | null }>>();
  for (let i = 0; i < names.length; i += 90) {
    const chunk = names.slice(i, i + 90);
    const rows = await env.DB.prepare(`SELECT id, name, year, kind FROM titles WHERE state = 'live' AND name IN (${chunk.map(() => '?').join(',')})`)
      .bind(...chunk)
      .all<{ id: number; name: string; year: number | null; kind: string | null }>();
    for (const r of rows.results) byName.set(r.name, [...(byName.get(r.name) ?? []), r]);
  }
  return byName;
}

/** 同名作品里挑年份差不超过 1、类型相容的唯一一部；对不上或有歧义就不关联。 */
function pick(cands: Array<{ id: number; year: number | null; kind: string | null }> | undefined, year?: number, kind?: string) {
  if (!cands?.length) return undefined;
  const fit = cands.filter((c) => (!year || !c.year || Math.abs(c.year - year) <= 1) && (!kind || !c.kind || c.kind === kind || (kind === 'tv' && c.kind !== 'movie')));
  return fit.length === 1 ? fit[0].id : undefined;
}

export async function syncRankings(env: Env, opts: { daily?: boolean } = {}): Promise<string[]> {
  const report: string[] = [];
  const sorts = SORTS.filter((s) => !s.daily || opts.daily);
  const lists: Array<{ key: string; items: IyfListItem[]; channelKind?: string }> = [];
  for (const sort of sorts) {
    for (const ch of CHANNELS) {
      try {
        const items = await fetchList(ch.cid, sort.orderby, pagesFor(sort, ch.big));
        lists.push({ key: `rank:${sort.key}:${ch.key}`, items, channelKind: ch.key === 'all' ? undefined : ch.key });
      } catch (err) {
        report.push(`rank:${sort.key}:${ch.key}：失败，保留上次结果（${err instanceof Error ? err.message : err}）`);
      }
    }
  }
  const names = [...new Set(lists.flatMap((l) => l.items.map((it) => it.title)))];
  const byName = await loadTitles(env, names);

  const stmt = env.DB.prepare(
    "INSERT INTO documents (key, value, source, updated_at) VALUES (?, ?, 'ingest:rankings', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) ON CONFLICT (key) DO UPDATE SET value = excluded.value, source = excluded.source, updated_at = excluded.updated_at",
  );
  const writes: D1PreparedStatement[] = [];
  for (const l of lists) {
    if (l.items.length < MIN_TO_PUBLISH) {
      report.push(`${l.key}：只有 ${l.items.length} 部，保留上次结果`);
      continue;
    }
    let linked = 0;
    const entries: RankEntry[] = l.items.map((it) => {
      const kind = l.channelKind ?? IYF_KIND[it.atypeName ?? ''];
      const year = Number(it.year) || undefined;
      const id = pick(byName.get(it.title), year, kind);
      if (id) linked++;
      const score = it.score && /^\d+(\.\d+)?$/.test(it.score) ? it.score : undefined;
      return {
        ...(id ? { id: `ik${String(id).padStart(6, '0')}` } : {}),
        title: it.title,
        ...(year ? { year } : {}),
        ...(kind ? { kind } : {}),
        ...(score ? { score } : {}),
        ...(it.hot ? { hot: Number(it.hot) } : {}),
        ...(it.lastName ? { badge: it.lastName } : {}),
      };
    });
    writes.push(stmt.bind(l.key, JSON.stringify(entries)));
    report.push(`${l.key}：${entries.length} 部（对上片库 ${linked}）`);
  }
  for (let i = 0; i < writes.length; i += 20) await env.DB.batch(writes.slice(i, i + 20));
  return report;
}
