/**
 * 「最新上线」横轨（AGENTS 准则 13、17），取代 scripts/sync-release-radar.mjs 与 sync-episode-updates.mjs：
 * - 来源：爱壹帆最近上架（GetLastAdd 前两页）+ 光速、极速两个采集站各分类最近入库；
 *   采集站最新 6 部排最前，然后是爱壹帆，再是其余采集站作品；每个频道 24 部。
 * - 只收内容安全检查通过的（isCleanChineseTitle）；采集站的电影只要近两年的。
 * - 海报、剧照、简介、评分用 TMDB（片名、年份必须对得上）；TMDB 没有时用采集站海报，爱壹帆的图带水印
 *   不用，找不到可用海报的不上。评分只用 TMDB 的，没有就留空，不写默认值（准则 19.1）。
 * - 能对上片库作品（D1 titles：先按 TMDB 编号，再按片名 + 年份）的，用作品编号与规范网址。
 * 结果写入 documents 的 latest:<频道>。某频道来源全挂或凑不满 12 部时，保留上一次的结果。
 */
import { generateSlug, isCleanChineseTitle, normalizeTitle } from '../../../../lib/data/entities/entity-utils';
import type { LatestPrebakedItem } from '../../../../lib/types/prebaked';
import { recentVods, type ChannelKey, type Kind, type Vod } from '../collectors';
import type { Env } from '../env';
import { lastAdd, type IyfLatest } from '../iyf';
import { tmdbSearchStrict, type TmdbBrief } from '../tmdb';

const CHANNELS: Array<{ key: ChannelKey; cid: string }> = [
  { key: 'all', cid: '0,1' },
  { key: 'movie', cid: '0,1,3' },
  { key: 'tv', cid: '0,1,4' },
  { key: 'anime', cid: '0,1,6' },
  { key: 'variety', cid: '0,1,5' },
  { key: 'documentary', cid: '0,1,7' },
];
const PER_CHANNEL = 24;
const MIN_TO_PUBLISH = 12;
/** 每次运行最多发起的 TMDB 搜索数（缓存命中不算），超出的作品本次只用采集站资料。 */
const TMDB_BUDGET = 150;
/** 动态漫画、漫剧不是动漫正片（与短剧同类），不进最新上线。 */
const MOTION_COMIC = /动态漫画|动态漫|漫剧|沙雕动画/;
/** 采集站「中国动漫」里网文改编动态漫的常见题材；没有 TMDB 资料又带这些题材的不进动漫横轨。 */
const WEB_NOVEL_GENRES = new Set(['系统', '系统流', '脑洞', '逆袭', '复仇', '反转', '虐心', '穿越', '重生', '战神', '赘婿', '神豪', '都市']);
const KIND_LABEL: Record<Kind, string> = { movie: '电影', tv: '电视剧', anime: '动漫', variety: '综艺', documentary: '纪录片' };
const IYF_KIND: Record<string, Kind> = { 电影: 'movie', 电视剧: 'tv', 动漫: 'anime', 综艺: 'variety', 纪录片: 'documentary' };

interface Candidate {
  title: string;
  kind: Kind;
  tmdbType: 'movie' | 'tv';
  year?: number;
  badgeRaw: string;
  cover?: string;           // 采集站海报（爱壹帆的不用）
  quality?: string;
  overview?: string;
  genres: string[];
  addedAt?: string;
}

/** 更新角标统一写法：更新至第N集 / 全N集 / 已完结 / 第N期 / 更新至M月D日 / 正片 / 抢先版。 */
const CN_DIGIT: Record<string, number> = { 一: 1, 二: 2, 两: 2, 三: 3, 四: 4, 五: 5, 六: 6, 七: 7, 八: 8, 九: 9 };
/** 一到九十九的中文数字。 */
function cnNumber(text: string): number {
  const m = text.match(/^([一二两三四五六七八九])?(十)?([一二三四五六七八九])?$/);
  if (!m || (!m[1] && !m[2])) return 0;
  if (!m[2]) return CN_DIGIT[m[1]];
  return (m[1] ? CN_DIGIT[m[1]] : 1) * 10 + (m[3] ? CN_DIGIT[m[3]] : 0);
}

export function formatBadge(raw: string, kind: Kind): string {
  const r = (raw ?? '').trim();
  if (kind === 'movie') return /TC|抢先|枪版|\bTS\b|CAM/i.test(r) ? '抢先版' : '正片';
  const qi = r.match(/第\s*(\d{1,4})\s*期/);
  if (qi) return `第${Number(qi[1])}期`;
  const qiCn = r.match(/第([一二两三四五六七八九十]{1,3})期/);
  if (qiCn && cnNumber(qiCn[1])) return `第${cnNumber(qiCn[1])}期`;
  // 期号写成日期：20261006、第20261006期、261007回顾特辑、第260930期
  const date = r.match(/(?:^|\D)(?:20)?(2\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])(?!\d)/) ?? r.match(/^(?:20)?(2\d)(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])/);
  if (date) return `更新至${Number(date[2])}月${Number(date[3])}日`;
  const all = r.match(/全\s*(\d+)\s*[集话]|(\d+)\s*[集话]全/);
  if (all) return `全${Number(all[1] ?? all[2])}集`;
  if (/完结/.test(r)) {
    const n = r.match(/(\d+)/);
    return n ? `全${Number(n[1])}集` : '已完结';
  }
  if (/^(19|20)\d\d$/.test(r)) return '';
  const ep = r.match(/^(?:更新至|更新到|更新)?\s*第?\s*(\d{1,4})\s*[集话]?$/);
  if (ep) return kind === 'variety' ? `第${Number(ep[1])}期` : `更新至第${Number(ep[1])}集`;
  if (!r || /^(HD|正片|高清|超清|蓝光|1080P|4K)$/i.test(r)) return kind === 'documentary' ? '正片' : '';
  return r.slice(0, 12);
}

/** 爱壹帆 addTime「2026年10月07日」或采集站 vod_time「2026-10-08 12:00:00」（北京时间）→ ISO。 */
function toIso(text?: string): string | undefined {
  const m = text?.match(/(\d{4})\D(\d{1,2})\D(\d{1,2})\D*(?:(\d{1,2}):(\d{2})(?::(\d{2}))?)?/);
  if (!m) return undefined;
  const pad = (v: string | undefined) => String(Number(v ?? 0)).padStart(2, '0');
  const d = new Date(`${m[1]}-${pad(m[2])}-${pad(m[3])}T${pad(m[4])}:${pad(m[5])}:${pad(m[6])}+08:00`);
  return Number.isNaN(d.getTime()) ? undefined : d.toISOString();
}

/** 搜 TMDB 用的片名：去掉粘在片尾的年份（准则 16.1）；剧集再去掉「第N季」，此时不按年份筛（TMDB 按整部剧建档）。 */
function searchKey(c: Candidate): { name: string; year?: number } {
  let name = c.title.replace(/(?<=.{2})(19|20)\d\d$/, '').trim();
  if (c.tmdbType === 'tv') {
    const base = name.replace(/\s*第[0-9一二三四五六七八九十]+季$/, '').trim();
    if (base !== name && base.length >= 2) return { name: base };
  }
  return { name, year: c.year };
}

const fromVod = (v: Vod): Candidate => ({
  title: v.title,
  kind: v.kind,
  tmdbType: v.kind === 'movie' || (v.kind === 'documentary' && /^(HD|正片|高清|超清|蓝光)?$/i.test(v.remarks)) ? 'movie' : 'tv',
  year: v.year,
  badgeRaw: v.remarks,
  cover: /^https?:\/\//.test(v.cover) && !v.cover.includes('iyf.tv') ? v.cover : undefined,
  genres: v.classes.slice(0, 3),
  addedAt: toIso(v.time),
});

const fromIyf = (it: IyfLatest, channelKind?: Kind): Candidate => {
  const kind = channelKind ?? IYF_KIND[it.atypeName ?? ''] ?? 'tv';
  return {
    title: it.title,
    kind,
    tmdbType: kind === 'movie' || (kind === 'documentary' && it.isFilm) ? 'movie' : 'tv',
    year: Number(it.year) || undefined,
    badgeRaw: it.lastName ?? '',
    quality: /^(4K|1080P)$/i.test(it.vipResource ?? '') ? it.vipResource!.toUpperCase() : undefined,
    overview: it.contxt?.trim() || undefined,
    genres: [],
    addedAt: toIso(it.addTime),
  };
};

/** 按频道合并、去重、过滤出候选（顺序即展示顺序）。 */
function candidates(key: ChannelKey, iyf: IyfLatest[], vods: Vod[]): Candidate[] {
  const channelKind = key === 'all' ? undefined : (key as Kind);
  const minYear = new Date().getUTCFullYear() - 2;
  const seen = new Set<string>();
  const take = (c: Candidate) => {
    const norm = normalizeTitle(c.title);
    if (!norm || seen.has(norm) || !isCleanChineseTitle(c.title) || MOTION_COMIC.test(c.title)) return false;
    seen.add(norm);
    return true;
  };
  // 采集站的电影、纪录片常有老片重传，只要近两年的；剧集、综艺老节目会持续更新，不限。
  const fromCollectors = vods.map(fromVod).filter((c) => !((c.kind === 'movie' || c.kind === 'documentary') && (!c.year || c.year < minYear))).filter(take);
  const fromIyfList = iyf.map((it) => fromIyf(it, channelKind)).filter(take);
  // 爱壹帆的作品借用采集站同名作品的海报（采集站每类只取一页，同名的不一定在里面）。
  const vodCover = new Map(vods.filter((v) => /^https?:\/\//.test(v.cover)).map((v) => [normalizeTitle(v.title), v.cover]));
  for (const c of fromIyfList) c.cover ??= vodCover.get(normalizeTitle(c.title));
  return [...fromCollectors.slice(0, 6), ...fromIyfList, ...fromCollectors.slice(6)];
}

class TmdbMatcher {
  private cache = new Map<string, { hit: TmdbBrief | null; checkedAt: string }>();
  private writes: Array<[string, string | null, string | null]> = [];
  searches = 0;
  constructor(private env: Env) {}

  private keyOf(c: Candidate) {
    const s = searchKey(c);
    return `${c.tmdbType}:${normalizeTitle(s.name)}:${s.year ?? ''}`;
  }

  async preload(list: Candidate[]) {
    const keys = [...new Set(list.map((c) => this.keyOf(c)))].filter((k) => !this.cache.has(k));
    for (let i = 0; i < keys.length; i += 90) {
      const chunk = keys.slice(i, i + 90);
      const rows = await this.env.DB.prepare(`SELECT query, payload, checked_at FROM tmdb_matches WHERE query IN (${chunk.map(() => '?').join(',')})`)
        .bind(...chunk)
        .all<{ query: string; payload: string | null; checked_at: string }>();
      for (const r of rows.results) this.cache.set(r.query, { hit: r.payload ? (JSON.parse(r.payload) as TmdbBrief) : null, checkedAt: r.checked_at });
    }
  }

  /** 命中长期复用；没搜到的过一天再搜。 */
  async match(c: Candidate): Promise<TmdbBrief | null> {
    const key = this.keyOf(c);
    const cached = this.cache.get(key);
    const stale = cached && !cached.hit && Date.now() - Date.parse(cached.checkedAt) > 86_400_000;
    if (cached && !stale) return cached.hit;
    if (this.searches >= TMDB_BUDGET) return cached?.hit ?? null;
    this.searches++;
    const s = searchKey(c);
    const hit = await tmdbSearchStrict(this.env.TMDB_API_KEY, s.name, c.tmdbType, s.year).catch(() => null);
    const now = new Date().toISOString();
    this.cache.set(key, { hit, checkedAt: now });
    this.writes.push([key, hit?.tmdbId ?? null, hit ? JSON.stringify(hit) : null]);
    return hit;
  }

  async flush() {
    const stmt = this.env.DB.prepare(
      'INSERT INTO tmdb_matches (query, tmdb_id, payload, checked_at) VALUES (?, ?, ?, ?) ON CONFLICT (query) DO UPDATE SET tmdb_id = excluded.tmdb_id, payload = excluded.payload, checked_at = excluded.checked_at',
    );
    const now = new Date().toISOString();
    for (let i = 0; i < this.writes.length; i += 50) await this.env.DB.batch(this.writes.slice(i, i + 50).map((w) => stmt.bind(...w, now)));
    this.writes = [];
  }
}

const placeholders = (n: number) => Array.from({ length: n }, () => '?').join(',');

/** 对上片库作品：先按 TMDB 编号，再按片名 + 年份（年份差不超过 1，且只有一部）。返回 下标 → { 编号, 规范片段 }。 */
async function linkTitles(env: Env, items: LatestPrebakedItem[], tmdbTypes: Array<'movie' | 'tv'>): Promise<Map<number, { id: number; slug: string }>> {
  const ids = new Map<number, number>();
  const withTmdb = items.map((it, i) => ({ it, i })).filter(({ it }) => it.tmdbId);
  if (withTmdb.length) {
    const rows = await env.DB.prepare(`SELECT id, tmdb_type, tmdb_id FROM titles WHERE state = 'live' AND tmdb_id IN (${placeholders(withTmdb.length)})`)
      .bind(...withTmdb.map(({ it }) => it.tmdbId!))
      .all<{ id: number; tmdb_type: string; tmdb_id: string }>();
    for (const { it, i } of withTmdb) {
      const row = rows.results.find((r) => r.tmdb_id === it.tmdbId && r.tmdb_type === tmdbTypes[i]);
      if (row) ids.set(i, row.id);
    }
  }
  const rest = items.map((it, i) => ({ it, i })).filter(({ i }) => !ids.has(i));
  if (rest.length) {
    const rows = await env.DB.prepare(`SELECT id, name, year FROM titles WHERE state = 'live' AND name IN (${placeholders(rest.length)})`)
      .bind(...rest.map(({ it }) => it.title))
      .all<{ id: number; name: string; year: number | null }>();
    for (const { it, i } of rest) {
      const year = Number(it.year) || 0;
      const same = rows.results.filter((r) => r.name === it.title && (!year || !r.year || Math.abs(r.year - year) <= 1));
      if (same.length === 1) ids.set(i, same[0].id);
    }
  }
  const out = new Map<number, { id: number; slug: string }>();
  if (!ids.size) return out;
  const unique = [...new Set(ids.values())];
  const slugs = await env.DB.prepare(`SELECT title_id, slug FROM slugs WHERE canonical = 1 AND title_id IN (${placeholders(unique.length)})`)
    .bind(...unique)
    .all<{ title_id: number; slug: string }>();
  const slugOf = new Map(slugs.results.map((r) => [r.title_id, r.slug]));
  for (const [i, id] of ids) {
    const slug = slugOf.get(id);
    if (slug) out.set(i, { id, slug });
  }
  return out;
}

async function buildChannel(env: Env, matcher: TmdbMatcher, key: ChannelKey, cid: string): Promise<{ items: LatestPrebakedItem[]; note: string }> {
  const [p1, p2, vods] = await Promise.all([
    lastAdd(cid, 1).catch(() => [] as IyfLatest[]),
    lastAdd(cid, 2).catch(() => [] as IyfLatest[]),
    recentVods(key).catch(() => [] as Vod[]),
  ]);
  if (!p1.length && !vods.length) throw new Error('爱壹帆与采集站都没取到');
  const pool = candidates(key, [...p1, ...p2], vods);
  await matcher.preload(pool);

  const items: LatestPrebakedItem[] = [];
  const tmdbTypes: Array<'movie' | 'tv'> = [];
  const now = Date.now();
  for (const c of pool) {
    if (items.length >= PER_CHANNEL) break;
    const t = await matcher.match(c);
    const cover = t?.poster || c.cover;
    if (!cover) continue;
    if (c.kind === 'anime' && !t && c.genres.some((g) => WEB_NOVEL_GENRES.has(g))) continue;
    const year = c.year ? String(c.year) : t?.year ?? '';
    const title = c.kind === 'movie' ? c.title.replace(/(?<=.{2})(19|20)\d\d$/, '') : c.title;
    tmdbTypes.push(c.tmdbType);
    items.push({
      entityId: `ik_radar_${key}_${items.length + 1}`,
      ...(t ? { tmdbId: t.tmdbId } : {}),
      title,
      slug: generateSlug(title),
      cover,
      backdrop: t?.backdrop || '/placeholder-poster.svg',
      rate: t?.rate ?? '',
      year,
      type: c.kind,
      channelKey: key,
      genres: c.genres.length ? c.genres : [KIND_LABEL[c.kind]],
      updateBadge: formatBadge(c.badgeRaw, c.kind),
      ...(c.quality ? { qualityBadge: c.quality } : {}),
      ...(t?.overview || c.overview ? { description: t?.overview || c.overview } : {}),
      createdAt: c.addedAt ?? new Date(now).toISOString(),
    });
  }
  const linked = await linkTitles(env, items, tmdbTypes);
  for (const [i, { id, slug }] of linked) {
    items[i].entityId = `ik${String(id).padStart(6, '0')}`;
    items[i].slug = slug;
  }
  const withTmdb = items.filter((it) => it.tmdbId).length;
  return { items, note: `爱壹帆 ${p1.length + p2.length}，采集站 ${vods.length}，候选 ${pool.length} → ${items.length} 部（TMDB ${withTmdb}，对上片库 ${linked.size}）` };
}

export async function syncLatest(env: Env): Promise<string[]> {
  const report: string[] = [];
  const matcher = new TmdbMatcher(env);
  for (const ch of CHANNELS) {
    try {
      const { items, note } = await buildChannel(env, matcher, ch.key, ch.cid);
      if (items.length < MIN_TO_PUBLISH) {
        report.push(`${ch.key}：只有 ${items.length} 部，保留上次结果（${note}）`);
        continue;
      }
      await env.DB.prepare(
        "INSERT INTO documents (key, value, source, updated_at) VALUES (?, ?, 'ingest:latest', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) ON CONFLICT (key) DO UPDATE SET value = excluded.value, source = excluded.source, updated_at = excluded.updated_at",
      )
        .bind(`latest:${ch.key}`, JSON.stringify(items))
        .run();
      report.push(`${ch.key}：${note}`);
    } catch (err) {
      report.push(`${ch.key}：失败，保留上次结果（${err instanceof Error ? err.message : err}）`);
    }
  }
  await matcher.flush();
  report.push(`TMDB 搜索 ${matcher.searches} 次`);
  return report;
}
