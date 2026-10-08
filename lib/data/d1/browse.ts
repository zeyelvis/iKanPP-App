/**
 * 频道片库查询（/api/library/browse 与频道大厅「全部片库」网格，D1）：
 * - 筛选：频道（titles.kind）、题材（title_genres）、地区、年份、语言、连载状态；
 * - 排序：添加时间、更新时间、人气、评分（各有 (kind, 字段) 索引，取一页只读这一页附近的行）；
 * - 没有细分筛选时，前几页按爱壹帆四大排序的顺序（入库 Worker 写的 rank:<排序>:<频道>，AGENTS 准则 17.3），
 *   排完再接片库自己的排序（去掉已列出的）。
 * 总数按筛选条件在同一个 Worker 实例里缓存 10 分钟。
 */
import type { TitleEntity } from '@/lib/types/entity';
import { loadDocuments } from './documents';
import { toEntities } from './related';
import type { D1Like, TitleRow } from './title-route';

export type BrowseSort = 'time_added' | 'time_updated' | 'popularity' | 'rating';

export interface BrowseFilters {
  channel?: string; // movie | tv | anime | variety | documentary | all
  genre?: string;
  region?: string;
  year?: string;
  language?: string;
  status?: string; // 完结 | 连载中
  sort?: BrowseSort;
  page?: number;
  limit?: number;
}

export interface BrowseResult {
  items: TitleEntity[];
  total: number;
  page: number;
  pageCount: number;
  limit: number;
}

const ORDER: Record<BrowseSort, string> = {
  time_added: 't.created_at DESC, t.id DESC',
  time_updated: 't.updated_at DESC, t.id DESC',
  popularity: 't.popularity DESC, t.id DESC',
  rating: 't.rating DESC, t.id DESC',
};
const KINDS = new Set(['movie', 'tv', 'anime', 'variety', 'documentary']);
const COUNT_TTL = 10 * 60_000;
const counts = new Map<string, { at: number; n: number }>();

function where(f: BrowseFilters): { sql: string; args: unknown[]; join: string } {
  const parts = ["t.state = 'live'"];
  const args: unknown[] = [];
  let join = '';
  if (f.channel && KINDS.has(f.channel)) {
    parts.push('t.kind = ?');
    args.push(f.channel);
  }
  if (f.genre) {
    join = 'JOIN title_genres g ON g.title_id = t.id AND g.genre = ?';
    args.unshift(f.genre);
  }
  if (f.region) {
    parts.push("t.region LIKE '%' || ? || '%'");
    args.push(f.region);
  }
  if (f.year && /^\d{4}$/.test(f.year)) {
    parts.push('t.year = ?');
    args.push(Number(f.year));
  }
  if (f.language) {
    parts.push("t.language LIKE '%' || ? || '%'");
    args.push(f.language);
  }
  if (f.status === '完结') parts.push("(t.status_label LIKE '%完结%' OR t.status_label LIKE '全%')");
  if (f.status === '连载中') parts.push("t.status_label LIKE '%更新%'");
  if (f.sort === 'rating') parts.push('t.rating IS NOT NULL');
  return { sql: parts.join(' AND '), args, join };
}

async function countTitles(db: D1Like, f: BrowseFilters): Promise<number> {
  const key = JSON.stringify({ ...f, page: 0, limit: 0 });
  const hit = counts.get(key);
  if (hit && Date.now() - hit.at < COUNT_TTL) return hit.n;
  const w = where(f);
  const row = await db.prepare(`SELECT COUNT(*) AS n FROM titles t ${w.join} WHERE ${w.sql}`).bind(...w.args).first<{ n: number }>();
  const n = row?.n ?? 0;
  counts.set(key, { at: Date.now(), n });
  return n;
}

async function rowsByIds(db: D1Like, ids: number[]): Promise<TitleRow[]> {
  if (!ids.length) return [];
  const rows = await db
    .prepare(`SELECT * FROM titles WHERE state = 'live' AND id IN (${ids.map(() => '?').join(',')})`)
    .bind(...ids)
    .all<TitleRow>();
  const byId = new Map(rows.results.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is TitleRow => Boolean(r));
}

export async function browseTitles(db: D1Like, f: BrowseFilters): Promise<BrowseResult> {
  const sort: BrowseSort = f.sort ?? 'time_added';
  const limit = Math.min(48, Math.max(1, f.limit ?? 24));
  const page = Math.max(1, f.page ?? 1);
  const filters = { ...f, sort };
  const total = await countTitles(db, filters);
  const pageCount = Math.max(1, Math.ceil(total / limit));

  // 没有细分筛选：先按爱壹帆的排序（只取关联上片库作品的条目）
  const plain = !f.genre && !f.region && !f.year && !f.language && !f.status;
  let ranked: number[] = [];
  if (plain) {
    const channel = f.channel && KINDS.has(f.channel) ? f.channel : 'all';
    const key = `rank:${sort === 'rating' ? 'score' : sort}:${channel}`;
    const docs = await loadDocuments([key]).catch(() => ({}) as Record<string, unknown>);
    const list = (docs[key] as Array<{ id?: string }> | undefined) ?? [];
    ranked = [...new Set(list.map((e) => Number(e.id?.slice(2))).filter((n) => Number.isInteger(n) && n > 0))];
  }

  const start = (page - 1) * limit;
  const fromRanked = ranked.slice(start, start + limit);
  let rows = await rowsByIds(db, fromRanked);
  if (rows.length < limit) {
    // 接片库自己的排序，跳过已在爱壹帆排序里列出的
    const w = where(filters);
    // D1 每条语句最多绑定 100 个参数：编号都是解析出来的整数，直接写进语句。
    const exclude = ranked.length ? `AND t.id NOT IN (${ranked.join(',')})` : '';
    const offset = Math.max(0, start - ranked.length);
    const more = await db
      .prepare(`SELECT t.* FROM titles t ${w.join} WHERE ${w.sql} ${exclude} ORDER BY ${ORDER[sort]} LIMIT ? OFFSET ?`)
      .bind(...w.args, limit - rows.length, offset)
      .all<TitleRow>();
    rows = [...rows, ...more.results];
  }
  return { items: await toEntities(db, rows), total, page, pageCount, limit };
}
