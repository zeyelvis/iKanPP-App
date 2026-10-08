#!/usr/bin/env node
/**
 * 重构阶段 2：把 2026-10-08 的 KV 基线导入成一个本地 SQLite 文件（表结构同 db/d1/0001_init.sql），
 * 再由 scripts/d1/verify-import.mjs 校验、scripts/d1/push-import.mjs 整体导入 D1 ikanpp-db。
 *
 *   node scripts/d1/build-import.mjs <基线目录> <日期> <输出 sqlite 文件>
 *
 * 基线目录（本机，不进仓库）里应有：
 *   entities-<日期>.jsonl.gz       KV entity:* 原样备份（{key, value}）
 *   slugs-<日期>.jsonl             KV slug:* 别名（{k, v}）
 *   gsc-urls-90d-<日期>.json       Search Console 有展示的网址
 *   live-baseline-<日期>.jsonl     这些网址在线上的实际行为（跳转链、最终网址、标题）
 *   lists-<日期>.json              KV 里的列表（index:*、channel:*、recent:*、line-rank:*）
 *
 * 规则（详见 .plans/ikanpp-refactor.md 第 9 节）：
 * - 每个编号保持原值；历史上出现过、但已没有数据的编号也写入，标为 removed，永不复用；
 * - 同一 TMDB 作品的多个编号只留一个 live，其余 merged 指向它：快照里有流量的优先，
 *   其次资料最全的，最后编号最小的；不同 TMDB 的同名作品不合并；
 * - 网址片段：每部作品的规范片段（KV 的 canonicalSlug）、「编号-旧 slug」、slug:* 全部别名；
 *   别名目标按合并结果改写。
 */
import { DatabaseSync } from "node:sqlite";
import { createReadStream, existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { createGunzip } from "node:zlib";
import { join, resolve } from "node:path";
import { getTitleCanonicalHref, normalizeTitle } from "../../lib/data/entities/entity-utils.ts";

const [dir, day, outFile] = process.argv.slice(2);
if (!dir || !day || !outFile) {
  console.error("用法：node scripts/d1/build-import.mjs <基线目录> <日期> <输出 sqlite 文件>");
  process.exit(1);
}
const file = (name) => join(dir, name.replace("<日期>", day));
const ROOT = resolve(import.meta.dirname, "../..");

if (existsSync(outFile)) rmSync(outFile);
// 导入期间关闭外键检查：合并的编号要指向规范编号，写入顺序无法保证；导入 D1 时按先 live 后 merged 的顺序。
const db = new DatabaseSync(outFile, { enableForeignKeyConstraints: false });
// 只建作品、网址、影人相关的表（documents、tmdb_matches 是入库 Worker 的，不在导入范围）。
for (const m of ["0001_init.sql", "0004_title_name_key.sql", "0005_title_genres.sql", "0007_browse_indexes.sql", "0008_titles_merged_index.sql"]) db.exec(readFileSync(join(ROOT, "db/d1", m), "utf8"));
db.exec("PRAGMA journal_mode = OFF; PRAGMA synchronous = OFF;");

const ID = /^ik(\d{6})$/i;
const toId = (code) => {
  const m = String(code ?? "").match(ID);
  return m ? Number(m[1]) : null;
};
const code = (id) => `ik${String(id).padStart(6, "0")}`;
const json = (v) => JSON.stringify(Array.isArray(v) ? v : []);
const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) && v !== "" && v != null ? n : null;
};
const safeDecode = (s) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

// ---- 1. 作品 ---------------------------------------------------------------------------

const KNOWN = new Set([
  "entityId", "slug", "canonicalSlug", "tmdbId", "tmdbType", "doubanId", "imdbId", "title", "originalTitle", "type", "year",
  "description", "cover", "backdrop", "rate", "score", "genres", "directors", "actors", "region", "language", "status",
  "popularity", "hot", "runtime", "numberOfSeasons", "numberOfEpisodes", "keywords", "aliases", "aiContent", "createdAt", "updatedAt",
]);
const insertTitle = db.prepare(`INSERT INTO titles (id, state, merged_into, kind, name, original_name, year, tmdb_type, tmdb_id, douban_id, imdb_id,
  overview, poster, backdrop, genres, region, language, status_label, rating, popularity, hot, runtime, seasons, episodes,
  directors, actors, aliases, keywords, ai_content, extra, source, created_at, updated_at)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

const entities = new Map(); // id -> {tmdbKey, canonicalSlug, slug, completeness}
let skipped = 0;
const readEntities = async function* () {
  const rl = createInterface({ input: createReadStream(file("entities-<日期>.jsonl.gz")).pipe(createGunzip()) });
  for await (const line of rl) {
    if (!line) continue;
    const { key, value } = JSON.parse(line);
    const id = toId(key.slice("entity:".length));
    let e;
    try {
      e = JSON.parse(value);
    } catch {
      e = null;
    }
    if (!id || !e) {
      skipped++;
      continue;
    }
    yield [id, e];
  }
};
// TMDB 的电影和剧集各自编号，同一个数字可能是两部不同的作品：类型没写明的不推断，也不参与合并。
const tmdbOf = (e) => {
  const tmdbId = e.tmdbId ? String(e.tmdbId) : null;
  const tmdbType = tmdbId && (e.tmdbType === "tv" || e.tmdbType === "movie") ? e.tmdbType : null;
  return { tmdbId, tmdbType };
};
// 第一遍：只收集合并与网址需要的信息。
for await (const [id, e] of readEntities()) {
  const { tmdbId, tmdbType } = tmdbOf(e);
  const completeness = ["description", "cover", "backdrop", "directors", "actors", "genres", "year", "rate"].filter((k) => {
    const v = e[k];
    return Array.isArray(v) ? v.length > 0 : v != null && v !== "";
  }).length;
  entities.set(id, { tmdbKey: tmdbId && tmdbType ? `${tmdbType}:${tmdbId}` : null, canonicalSlug: e.canonicalSlug ?? null, slug: e.slug ?? null, completeness });
}
console.log(`作品：${entities.size} 部（跳过无法识别的键 ${skipped} 个）`);

// ---- 2. 快照与流量：哪些编号在 Google 有流量 ----------------------------------------------

const gsc = existsSync(file("gsc-urls-90d-<日期>.json")) ? JSON.parse(readFileSync(file("gsc-urls-90d-<日期>.json"), "utf8")) : [];
const baseline = existsSync(file("live-baseline-<日期>.jsonl"))
  ? readFileSync(file("live-baseline-<日期>.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
  : [];
const pathOf = (url) => safeDecode(new URL(url).pathname);
const idInPath = (p) => toId((p.match(/^\/title\/(ik\d{6})/i) ?? [])[1]);
const clicks = new Map(); // id -> 该编号作为最终去向（或网址里）的点击数
const finalOf = new Map(baseline.map((b) => [b.url, b.final ? pathOf(b.final) : null]));
for (const r of gsc) {
  const final = finalOf.get(r.url) ?? pathOf(r.url);
  const id = idInPath(final);
  if (id) clicks.set(id, (clicks.get(id) ?? 0) + r.clicks + r.impressions / 100);
}
console.log(`快照：Search Console 网址 ${gsc.length} 个，线上行为已记录 ${baseline.length} 个`);

// ---- 3. 合并同一 TMDB 作品的多个编号 ---------------------------------------------------------

const groups = new Map();
for (const [id, e] of entities) if (e.tmdbKey) groups.set(e.tmdbKey, [...(groups.get(e.tmdbKey) ?? []), id]);
const mergedInto = new Map();
for (const ids of groups.values()) {
  if (ids.length < 2) continue;
  const ranked = [...ids].sort((a, b) =>
    (clicks.get(b) ?? 0) - (clicks.get(a) ?? 0) || entities.get(b).completeness - entities.get(a).completeness || a - b);
  const keep = ranked[0];
  for (const id of ranked.slice(1)) mergedInto.set(id, keep);
}
console.log(`合并：${[...groups.values()].filter((g) => g.length > 1).length} 组同一 TMDB 作品，${mergedInto.size} 个编号并入规范编号`);
const live = (id) => mergedInto.get(id) ?? id;

// 第二遍：带着合并结果写入作品。
db.exec("BEGIN");
for await (const [id, e] of readEntities()) {
  const extra = Object.fromEntries(Object.entries(e).filter(([k]) => !KNOWN.has(k)));
  const { tmdbId, tmdbType } = tmdbOf(e);
  const into = mergedInto.get(id) ?? null;
  insertTitle.run(
    id, into ? "merged" : "live", into, e.type ?? null, e.title ?? null, e.originalTitle ?? null, num(String(e.year ?? "").slice(0, 4)),
    tmdbType, tmdbId, e.doubanId ?? null, e.imdbId ?? null, e.description ?? null, e.cover ?? null, e.backdrop ?? null,
    json(e.genres), e.region ?? null, e.language ?? null, e.status ?? null, num(e.rate ?? e.score), num(e.popularity), num(e.hot),
    num(e.runtime), num(e.numberOfSeasons), num(e.numberOfEpisodes), json(e.directors), json(e.actors), json(e.aliases),
    json(e.keywords), e.aiContent ? JSON.stringify(e.aiContent) : null, Object.keys(extra).length ? JSON.stringify(extra) : null,
    `kv-${day}`, e.createdAt ?? new Date().toISOString(), e.updatedAt ?? e.createdAt ?? new Date().toISOString(),
  );
}
db.exec("COMMIT");
{
  const setKey = db.prepare("UPDATE titles SET name_key = ? WHERE id = ?");
  db.exec("BEGIN");
  for (const t of db.prepare("SELECT id, name FROM titles WHERE name IS NOT NULL").all()) setKey.run(normalizeTitle(t.name) || null, t.id);
  db.exec("COMMIT");
}

// ---- 4. 历史上出现过、但已无数据的编号：写入为 removed，永不复用 ---------------------------

const seen = new Set();
for (const r of gsc) {
  const id = idInPath(pathOf(r.url));
  if (id) seen.add(id);
}
for (const b of baseline) {
  for (const u of [b.url, b.final].filter(Boolean)) {
    const id = idInPath(pathOf(u));
    if (id) seen.add(id);
  }
}
const slugRows = existsSync(file("slugs-<日期>.jsonl"))
  ? readFileSync(file("slugs-<日期>.jsonl"), "utf8").split("\n").filter(Boolean).map((l) => JSON.parse(l))
  : [];
for (const s of slugRows) {
  const id = toId(s.v);
  if (id) seen.add(id);
}
const insertRemoved = db.prepare("INSERT INTO titles (id, state, source) VALUES (?, 'removed', 'seen-in-urls')");
let removed = 0;
db.exec("BEGIN");
for (const id of seen) {
  if (!entities.has(id)) {
    insertRemoved.run(id);
    removed++;
  }
}
db.exec("COMMIT");
console.log(`历史编号：另有 ${removed} 个编号在网址或别名里出现过但已无数据，标为 removed`);

// ---- 5. 网址片段 ---------------------------------------------------------------------------

const insertSlug = db.prepare("INSERT OR IGNORE INTO slugs (slug, title_id, canonical, source) VALUES (?, ?, ?, ?)");
let canon = 0, alias = 0;
db.exec("BEGIN");
for (const [id, e] of entities) {
  const c = e.canonicalSlug ? safeDecode(e.canonicalSlug) : null;
  if (c && toId(c.slice(0, 8)) === id) {
    if (mergedInto.has(id)) insertSlug.run(c, live(id), 0, "canonical-of-merged");
    else {
      insertSlug.run(c, id, 1, "kv-canonical");
      canon++;
    }
  }
  if (e.slug) {
    insertSlug.run(`${code(id)}-${safeDecode(e.slug)}`.toLowerCase(), live(id), 0, "kv-id-slug");
    alias++;
  }
}
for (const s of slugRows) {
  const id = toId(s.v);
  if (!id) continue;
  insertSlug.run(safeDecode(s.k.slice("slug:".length)), live(id), 0, "kv-slug");
  alias++;
}
db.exec("COMMIT");
console.log(`网址片段：规范 ${canon} 个，别名 ${alias} 个（slug:* 原始 ${slugRows.length} 个）`);

// ---- 6. 以快照里的落地页为准确定规范网址 -----------------------------------------------------
// Google 收录的内容就在快照里最终返回 200 的作品页上。落地页属于哪部作品，以页面标题里的片名、年份、类型为准，
// 不以网址里的编号为准：编号曾被反复改指（同一分钟内的现场补录拿到同一个号，后建的覆盖先建的），
// 快照里不少跳转目标的编号此刻已是另一部作品。
// - 依次试：网址里的编号、片段表、片名（规范化后）+ 年份（差 ≤ 1）；必须片名对得上。页面标题里的类型不可靠
//   （星际穿越标成电视剧、动画电影标成动漫），只在同名多部时用来排序；
// - 规范网址取页面自己声明的 rel=canonical（没有就取落地页网址），且只有在不带编号、或带的正是该作品
//   自己的编号时才采用；同一作品有多个落地页时点击多的那个说了算，其余作别名（308 过去）；
// - 落地页片段与 Search Console 网址片段都改指到认定的作品（不抢别的作品的规范片段）。
const clicksByUrl = new Map(gsc.map((r) => [r.url, r.clicks + r.impressions / 100]));
const landings = baseline
  .filter((b) => b.status === 200 && b.final && pathOf(b.final).startsWith("/title/"))
  .sort((a, b) => (clicksByUrl.get(a.url) ?? 0) - (clicksByUrl.get(b.url) ?? 0));
const KIND = { 电影: "movie", 电视剧: "tv", 动漫: "anime", 综艺: "variety", 纪录片: "documentary", 短剧: "short" };
const unescape = (t) => String(t ?? "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'");
/** 旧站临时编号网址（/title/ik_radar_all_20-夜色将烬、ik_pre_…、ik_latest_…）：横轨每小时换位，同一个网址后来会跳到别的片，以网址里的片名为准。 */
const tempUrlName = (url) => {
  const m = pathOf(url).match(/^\/title\/ik_[a-z]+_[^-]*(?:-[0-9a-f%]*)?-(.+)$/i);
  return m ? m[1].replace(/-/g, " ").trim() : null;
};
const pageInfo = (title) => {
  const m = unescape(title).match(/^(.*?)\s*(?:\((\d{4})\))?\s*在线观看\s*-\s*([^|\s]+)/);
  // 旧站标题会把季号再写一遍：「庆余年 第二季 第2季」→「庆余年 第二季」
  const name = m?.[1].trim().replace(/(第[一二三四五六七八九十\d]+季)\s*第\d+季$/, "$1");
  return m ? { name, year: num(m[2]), kind: KIND[m[3]] ?? null } : { name: null, year: null, kind: null };
};
const normName = (s) => String(s ?? "").toLowerCase().replace(/[（(][^）)]*[）)]/g, "").replace(/[^\p{L}\p{N}]+/gu, "");
const nameMatch = (a, b) => {
  const x = normName(a), y = normName(b);
  return Boolean(x && y) && (x === y || (Math.min(x.length, y.length) >= 3 && (x.startsWith(y) || y.startsWith(x))));
};
/** 同一编号的译名变化（雪降花 / 雪滴花）：字符重合 ≥ 60%。只用于网址里的编号本身，不用于按片名找作品。 */
const similarName = (a, b) => {
  const x = new Set(normName(a)), y = new Set(normName(b));
  if (!x.size || !y.size) return false;
  return [...x].filter((c) => y.has(c)).length / Math.min(x.size, y.size) >= 0.6;
};
const getTitle = db.prepare("SELECT id, state, merged_into, name, year, kind, popularity FROM titles WHERE id = ?");
const liveRow = (id) => {
  let t = getTitle.get(id);
  for (let i = 0; t && t.state === "merged" && i < 5; i++) t = getTitle.get(t.merged_into);
  return t && t.state === "live" ? t : null;
};
const byNorm = new Map();
for (const t of db.prepare("SELECT id, name, year, kind, popularity FROM titles WHERE state = 'live' AND name IS NOT NULL").all()) {
  const k = normName(t.name);
  if (k) byNorm.set(k, [...(byNorm.get(k) ?? []), t]);
}
const bySlug = db.prepare("SELECT title_id, canonical FROM slugs WHERE slug = ?");
/** 落地页 → 作品（片名必须对得上）。 */
function resolveLanding(b) {
  const seg = pathOf(b.final).slice("/title/".length);
  const info = pageInfo(b.title);
  if (tempUrlName(b.url)) Object.assign(info, { name: tempUrlName(b.url), year: null });
  if (!info.name) return null;
  const ok = (t) => t && nameMatch(t.name, info.name) && (!info.year || !t.year || Math.abs(t.year - info.year) <= 1);
  // 网址编号或片段表直接指到的作品：片名对得上、年份差不超过 1 就认；页面标题带季号的（庆余年 第二季）不卡年份，
  // 季的年份与整部剧不同。不带季号的同名不同年（泰坦尼克号 1998 / 2012）不能认。
  const seasonal = /第[一二三四五六七八九十\d]+季/.test(info.name);
  const fits = (t) => t && nameMatch(t.name, info.name) && (seasonal || !info.year || !t.year || Math.abs(t.year - info.year) <= 1);
  const own = toId((seg.match(/^(ik\d{6})/i) ?? [])[1]);
  const viaId = own ? liveRow(own) : null;
  if (fits(viaId)) return viaId;
  const hit = bySlug.get(seg);
  const viaSlug = hit ? liveRow(hit.title_id) : null;
  if (fits(viaSlug)) return viaSlug;
  // 页面自己声明的 rel=canonical 指向的作品（季号页声明的是整部剧：野生的大魔王出现了第2季 → ik113578）。
  const declared = b.canonical && pathOf(b.canonical).startsWith("/title/") ? pathOf(b.canonical).slice("/title/".length) : null;
  if (declared && declared !== seg) {
    const declaredId = toId((declared.match(/^(ik\d{6})/i) ?? [])[1]);
    const declaredHit = declaredId ? null : bySlug.get(declared);
    const viaCanonical = declaredId ? liveRow(declaredId) : declaredHit ? liveRow(declaredHit.title_id) : null;
    if (fits(viaCanonical)) return viaCanonical;
  }
  const cands = (byNorm.get(normName(info.name)) ?? []).filter(ok);
  cands.sort((a, b) => Number(b.kind === info.kind) - Number(a.kind === info.kind) || (b.popularity ?? 0) - (a.popularity ?? 0) || a.id - b.id);
  if (cands[0]) return cands[0];
  // 片库里没有同名作品，而网址自己的编号是一部译名相近、年份相符的作品：认作同一部（译名改过）。
  const yearOk = (t) => !info.year || !t.year || Math.abs(t.year - info.year) <= 1;
  if (viaId && yearOk(viaId) && similarName(viaId.name, info.name)) return viaId;
  return null;
}
// 片库里没有、但旧站用预烘焙卡片直出的落地页（最新上线横轨里的新片等）：按卡片补建作品。
// 编号取 590000 起（没人用的号段；网站现场补录用 600000–899999），来源记为 prebaked-card。
const cards = existsSync(file("prebaked-cards-<日期>.json")) ? JSON.parse(readFileSync(file("prebaked-cards-<日期>.json"), "utf8")) : [];
const cardsByKey = new Map();
for (const c of cards) cardsByKey.set(normName(c.name), [...(cardsByKey.get(normName(c.name)) ?? []), c]);
let nextRecoveredId = 590000;
let recovered = 0;
function recoverFromCard(b) {
  const info = pageInfo(b.title);
  if (tempUrlName(b.url)) Object.assign(info, { name: tempUrlName(b.url), year: null });
  const card = (cardsByKey.get(normName(info.name)) ?? []).find((c) => !info.year || !c.year || Math.abs(c.year - info.year) <= 1);
  if (!card || !card.cover) return null;
  while (getTitle.get(nextRecoveredId)) nextRecoveredId++;
  const id = nextRecoveredId++;
  const kind = card.kind ?? info.kind ?? null;
  // 电影片名末尾粘连的年份不要（准则 16.1：战无不胜2026 → 战无不胜）；综艺的「2026」是季名，保留。
  const name = kind === "movie" ? card.name.replace(/(?<=.{2})(19|20)\d\d$/, "") : card.name;
  insertTitle.run(
    id, "live", null, kind, name, null, card.year ?? info.year ?? null,
    null, null, null, null, card.description ?? null, card.cover, card.backdrop ?? null,
    json(card.genres), null, null, card.badge ?? null, num(card.rate), null, null,
    null, null, null, "[]", "[]", "[]", "[]", null, JSON.stringify({ cardTmdbId: card.tmdbId ?? null, cardSource: card.source }),
    "prebaked-card", new Date().toISOString(), new Date().toISOString(),
  );
  db.prepare("UPDATE titles SET name_key = ? WHERE id = ?").run(normalizeTitle(name) || null, id);
  const row = getTitle.get(id);
  byNorm.set(normName(name), [...(byNorm.get(normName(name)) ?? []), row]);
  recovered++;
  return row;
}
/** 最后一招：Search Console 网址里的片名（/title/ik002023-联邦调查局 → 联邦调查局）在 live 作品里唯一同名。 */
function byUrlName(b) {
  const seg = pathOf(b.url).replace(/^\/title\//, "").replace(/^ik\d{6}-/i, "");
  if (!seg || /^ik_/i.test(seg)) return null;
  const cands = byNorm.get(normName(seg.replace(/-/g, " "))) ?? [];
  return cands.length === 1 ? cands[0] : null;
}
const dropSlug = db.prepare("DELETE FROM slugs WHERE slug = ?");
const demote = db.prepare("UPDATE slugs SET canonical = 0 WHERE title_id = ? AND canonical = 1");
const addSlug = db.prepare("INSERT INTO slugs (slug, title_id, canonical, source) VALUES (?, ?, ?, ?)");
/** 把片段指到作品（不抢别的作品的规范片段）。 */
const pointSlug = (seg, id, source) => {
  const cur = bySlug.get(seg);
  if (cur?.canonical && cur.title_id !== id) return;
  if (cur && cur.title_id === id) return;
  dropSlug.run(seg);
  addSlug.run(seg, id, 0, source);
};
const unresolved = [];
const landingTitle = new Map(); // Search Console 网址 → 认定的作品编号
let asCanonical = 0, asAlias = 0;
db.exec("BEGIN");
for (const b of landings) {
  const t = resolveLanding(b) ?? recoverFromCard(b) ?? byUrlName(b);
  if (!t) {
    unresolved.push({ url: b.url, final: pathOf(b.final), title: b.title, clicks: clicksByUrl.get(b.url) ?? 0 });
    continue;
  }
  landingTitle.set(b.url, t.id);
  const seg = pathOf(b.final).slice("/title/".length);
  // 页面自己声明的 rel=canonical 是 Google 认的规范网址：落地页声明了别的作品页地址时，用声明的那个。
  const declared = b.canonical && pathOf(b.canonical).startsWith("/title/") ? pathOf(b.canonical).slice("/title/".length) : null;
  const want = declared ?? seg;
  const wantId = toId((want.match(/^(ik\d{6})/i) ?? [])[1]);
  const temporary = /^ik_/i.test(want); // ik_radar_…、ik_pre_… 是旧站的临时编号，不作规范网址
  if (!temporary && (!wantId || wantId === t.id)) {
    const cur = bySlug.get(want);
    if (!(cur?.canonical && cur.title_id !== t.id)) {
      dropSlug.run(want);
      demote.run(t.id);
      addSlug.run(want, t.id, 1, "snapshot-landing");
      asCanonical++;
    }
    if (want !== seg) pointSlug(seg, t.id, "snapshot-landing-alias");
  } else {
    pointSlug(seg, t.id, "snapshot-landing-alias");
    asAlias++;
  }
  const urlSeg = pathOf(b.url).slice("/title/".length);
  if (pathOf(b.url).startsWith("/title/") && urlSeg !== seg) pointSlug(urlSeg, t.id, "snapshot-url-alias");
}
db.exec("COMMIT");
console.log(`落地页：${landings.length} 个，定为规范网址 ${asCanonical} 个，编号与作品不符或临时编号、改作别名 ${asAlias} 个；按预烘焙卡片补建 ${recovered} 部；找不到作品的 ${unresolved.length} 个`);
writeFileSync(join(dir, `unresolved-landings-${day}.json`), JSON.stringify(unresolved, null, 1));

// ---- 6.5 没有规范网址的 live 作品：按线上的生成规则补上 -------------------------------------------
// KV 里约 1.2 万部作品没有 canonicalSlug，线上由 getTitleCanonicalHref 现算：有不带编号的 canonicalSlug 就用它，
// 否则「编号-片名」。这里照同样的规则补，网址与线上一致；片段已被别的作品占用时退到只有编号。
{
  const lacking = db.prepare("SELECT id, name FROM titles t WHERE state = 'live' AND NOT EXISTS (SELECT 1 FROM slugs s WHERE s.title_id = t.id AND s.canonical = 1)").all();
  const owner = db.prepare("SELECT title_id FROM slugs WHERE slug = ?");
  const setCanonical = db.prepare("UPDATE slugs SET canonical = 1, source = source || '+canonical' WHERE slug = ?");
  let filled = 0;
  db.exec("BEGIN");
  for (const t of lacking) {
    const kvCanonical = entities.get(t.id)?.canonicalSlug ? safeDecode(entities.get(t.id).canonicalSlug) : null;
    const options = [
      kvCanonical && !/^ik\d{6}/i.test(kvCanonical) ? kvCanonical : null,
      getTitleCanonicalHref({ entityId: code(t.id), title: t.name ?? "" }).replace(/^\/title\//, ""),
      code(t.id),
    ].filter((x) => x && x !== "/");
    for (const seg of options) {
      const cur = owner.get(seg);
      if (cur && cur.title_id !== t.id) continue;
      if (cur) setCanonical.run(seg);
      else addSlug.run(seg, t.id, 1, "derived-canonical");
      filled++;
      break;
    }
  }
  db.exec("COMMIT");
  console.log(`补规范网址：${lacking.length} 部没有，补上 ${filled} 部`);
}

// ---- 7. 快照路由 ---------------------------------------------------------------------------
// 每个 Search Console 网址当时的结果。最终是作品页的，目标改为认定作品的规范网址（与快照网址相同时不跳转）；
// 其余（404、跳到非作品页等）原样保留。

const canonicalPath = db.prepare("SELECT slug FROM slugs WHERE title_id = ? AND canonical = 1");
const insertRoute = db.prepare(`INSERT OR REPLACE INTO legacy_routes (path, status, target_path, hops, page_title, noindex, observed_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)`);
let retargeted = 0;
db.exec("BEGIN");
for (const b of baseline) {
  if (b.error) continue;
  const from = pathOf(b.url);
  let to = b.final ? pathOf(b.final) : null;
  const tid = landingTitle.get(b.url);
  if (tid) {
    const c = canonicalPath.get(tid)?.slug;
    if (c && `/title/${c}` !== to) retargeted++;
    if (c) to = `/title/${c}`;
  }
  insertRoute.run(from, typeof b.status === "number" ? b.status : 0, to !== from ? to : null, (b.chain?.length ?? 1) - 1, b.title ?? null, b.noindex ? 1 : 0, `${day}T00:00:00Z`);
}
db.exec("COMMIT");
console.log(`快照路由：${db.prepare("SELECT COUNT(*) n FROM legacy_routes").get().n} 条，其中 ${retargeted} 条的目标改为认定作品的规范网址`);

// ---- 8. 影人与演职关系：来自 live 作品的 directors / actors（字符串数组，按原顺序） -----------------

const personId = new Map();
const insertPerson = db.prepare("INSERT INTO people (id, name) VALUES (?, ?)");
const insertCredit = db.prepare("INSERT OR IGNORE INTO credits (title_id, person_id, role, ord) VALUES (?, ?, ?, ?)");
const names = (json) => {
  try {
    const list = JSON.parse(json ?? "[]");
    return Array.isArray(list) ? list.map((n) => (typeof n === "string" ? n : n?.name)).map((n) => String(n ?? "").trim()).filter(Boolean) : [];
  } catch {
    return [];
  }
};
db.exec("BEGIN");
for (const t of db.prepare("SELECT id, directors, actors FROM titles WHERE state = 'live'").all()) {
  for (const [role, list] of [["director", names(t.directors)], ["actor", names(t.actors)]]) {
    list.forEach((name, ord) => {
      let pid = personId.get(name);
      if (!pid) {
        pid = personId.size + 1;
        personId.set(name, pid);
        insertPerson.run(pid, name);
      }
      insertCredit.run(t.id, pid, role, ord);
    });
  }
}
db.exec("COMMIT");
console.log(`影人：${personId.size} 位，演职关系 ${db.prepare("SELECT COUNT(*) n FROM credits").get().n} 条`);

// ---- 9. 题材索引（同题材推荐按热度取前几部，不扫整张表） ----------------------------------------
db.exec(`INSERT OR IGNORE INTO title_genres (genre, title_id, kind, popularity)
  SELECT trim(j.value), t.id, t.kind, coalesce(t.popularity, t.hot, 0) FROM titles t, json_each(t.genres) j
  WHERE t.state = 'live' AND json_valid(t.genres) AND trim(j.value) <> ''`);
console.log(`题材索引：${db.prepare("SELECT COUNT(*) n FROM title_genres").get().n} 条`);

const counts = db.prepare("SELECT state, COUNT(*) n FROM titles GROUP BY state").all();
console.log("作品状态：", counts.map((r) => `${r.state} ${r.n}`).join("，"));
db.close();
