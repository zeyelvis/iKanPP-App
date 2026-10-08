/**
 * 新站 /title/[slug] 的网址解析（重构阶段 3，设计见 .plans/ikanpp-refactor.md 11.2），只读 D1 ikanpp-db：
 * 1. 快照路由 legacy_routes：2026-10-08 在 Google 有展示的网址，按导入时认定的结果返回（同一部片）；
 * 2. 网址片段表 slugs：合并的编号走到规范编号；不是规范片段时 308 到规范网址；
 * 3. 片段带「ik + 6 位」编号且作品 live：308 到规范网址；
 * 4. 编号已下架（removed）或片段表里没有：用片段里的片名在 live 作品里找唯一同名的，308 过去；
 * 5. 都找不到：404。编号永不复用。
 */
import { decodeMangledHexSlug, normalizeTitle } from '@/lib/data/entities/entity-utils';

/** D1Database 里用到的最小接口，便于在本地用 SQLite 文件测试。 */
export interface D1Like {
  prepare(sql: string): {
    bind(...values: unknown[]): {
      first<T = Record<string, unknown>>(): Promise<T | null>;
      all<T = Record<string, unknown>>(): Promise<{ results: T[] }>;
    };
  };
}

export interface TitleRow {
  id: number;
  state: 'live' | 'merged' | 'removed';
  merged_into: number | null;
  kind: string | null;
  name: string | null;
  year: number | null;
  [column: string]: unknown;
}

export type TitleResolution =
  | { type: 'title'; row: TitleRow; canonicalPath: string }
  | { type: 'redirect'; location: string }
  | { type: 'not-found' };

const ID_PREFIX = /^ik(\d{6})(?:-|$)/i;

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

export const entityCode = (id: number) => `ik${String(id).padStart(6, '0')}`;

async function liveTitle(db: D1Like, id: number): Promise<TitleRow | null> {
  let row = await db.prepare('SELECT * FROM titles WHERE id = ?').bind(id).first<TitleRow>();
  for (let hop = 0; row && row.state === 'merged' && row.merged_into && hop < 5; hop++) {
    row = await db.prepare('SELECT * FROM titles WHERE id = ?').bind(row.merged_into).first<TitleRow>();
  }
  return row && row.state === 'live' ? row : null;
}

export async function canonicalPathOf(db: D1Like, id: number): Promise<string> {
  const row = await db.prepare('SELECT slug FROM slugs WHERE title_id = ? AND canonical = 1').bind(id).first<{ slug: string }>();
  return `/title/${row?.slug ?? entityCode(id)}`;
}

async function bySlug(db: D1Like, seg: string) {
  return db
    .prepare('SELECT title_id, canonical, source FROM slugs WHERE slug = ?')
    .bind(seg)
    .first<{ title_id: number; canonical: number; source: string | null }>();
}

/** 片段里的片名部分：去掉开头的编号，连字符当分隔。 */
function nameKeyOf(seg: string): string {
  return normalizeTitle(seg.replace(ID_PREFIX, '').replace(/-/g, ' '));
}

/**
 * 片段里的中文片名与作品是否对得上。编号曾被反复改指，KV 留下的别名可能指向现在占着这个编号的另一部片；
 * 纯英文片段（旧的拼音、外文别名）无从核对，放行；译名相近（字符重合 ≥ 60%）算对得上。
 */
export function segmentFitsName(seg: string, name: string | null): boolean {
  const a = nameKeyOf(seg);
  const b = normalizeTitle(name ?? '');
  if (!a || /^[a-z0-9_]+$/.test(a) || !b) return true;
  if (a === b || a.startsWith(b) || b.startsWith(a)) return true;
  const x = new Set(a), y = new Set(b);
  return [...x].filter((c) => y.has(c)).length / Math.min(x.size, y.size) >= 0.6;
}

async function render(db: D1Like, row: TitleRow, path: string): Promise<TitleResolution> {
  const canonicalPath = await canonicalPathOf(db, row.id);
  return canonicalPath === path ? { type: 'title', row, canonicalPath } : { type: 'redirect', location: canonicalPath };
}

/** 解析 /title/ 之后的片段（原样传入，可以是百分号编码）。 */
export async function resolveTitleSegment(db: D1Like, rawSegment: string): Promise<TitleResolution> {
  const seg = safeDecode(rawSegment).trim();
  if (!seg) return { type: 'not-found' };
  const path = `/title/${seg}`;

  // 1. 快照路由
  const legacy = await db
    .prepare('SELECT status, target_path FROM legacy_routes WHERE path = ?')
    .bind(path)
    .first<{ status: number; target_path: string | null }>();
  if (legacy) {
    if (legacy.target_path && legacy.target_path !== path) return { type: 'redirect', location: legacy.target_path };
    if (legacy.status === 404 || legacy.status === 410) return { type: 'not-found' };
    // 200 且不跳转：落地页本身就是规范网址，交给下面按片段表解析。
  }

  // 2. 片段表（原样、小写、旧的十六进制撕裂网址还原后各试一次）
  for (const candidate of [...new Set([seg, seg.toLowerCase(), decodeMangledHexSlug(seg)])]) {
    const hit = await bySlug(db, candidate);
    if (!hit) continue;
    const row = await liveTitle(db, hit.title_id);
    // 规范片段与快照认定的片段可信；KV 留下的别名要核对片名。
    const trusted = hit.canonical === 1 || hit.source?.startsWith('snapshot-');
    if (row && (trusted || segmentFitsName(candidate, row.name))) return render(db, row, path);
  }

  // 3. 片段带编号且作品 live
  const idMatch = seg.match(ID_PREFIX);
  if (idMatch) {
    const row = await liveTitle(db, Number(idMatch[1]));
    // 编号还在、但片段里的片名与作品对不上：编号曾被改指，不能把这个网址交给现在占着编号的作品。
    if (row && segmentFitsName(seg, row.name)) return render(db, row, path);
  }

  // 4. 按片名找唯一的 live 作品
  const key = nameKeyOf(decodeMangledHexSlug(seg));
  if (key && !/^[a-z0-9_]+$/.test(key)) {
    const rows = await db
      .prepare("SELECT id FROM titles WHERE state = 'live' AND name_key = ? LIMIT 2")
      .bind(key)
      .all<{ id: number }>();
    if (rows.results.length === 1) return { type: 'redirect', location: await canonicalPathOf(db, rows.results[0].id) };
  }

  return { type: 'not-found' };
}
