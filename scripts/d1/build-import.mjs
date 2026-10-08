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
db.exec(readFileSync(join(ROOT, "db/d1/0001_init.sql"), "utf8"));
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
// Google 收录的内容就在快照里最终返回 200 的作品页上：这些网址原样作为该作品的规范网址。
// 网址里没有编号的（如 /title/蜘蛛侠-崭新之日），先按片段表、再按片名与年份找到作品。
// 同一作品有多个落地页时，点击多的那个作规范网址，其余作别名（以后 308 过去）。
const clicksByUrl = new Map(gsc.map((r) => [r.url, r.clicks + r.impressions / 100]));
const landings = baseline
  .filter((b) => b.status === 200 && b.final && pathOf(b.final).startsWith("/title/"))
  .sort((a, b) => (clicksByUrl.get(a.url) ?? 0) - (clicksByUrl.get(b.url) ?? 0));
const getTitle = db.prepare("SELECT id, state, merged_into FROM titles WHERE id = ?");
const liveRow = (id) => {
  let t = getTitle.get(id);
  for (let i = 0; t && t.state === "merged" && i < 5; i++) t = getTitle.get(t.merged_into);
  return t && t.state === "live" ? t : null;
};
const bySlug = db.prepare("SELECT title_id FROM slugs WHERE slug = ?");
const byNameYear = db.prepare("SELECT id FROM titles WHERE state = 'live' AND name = ? AND (year = ? OR ? IS NULL) ORDER BY popularity DESC, id LIMIT 2");
const dropSlug = db.prepare("DELETE FROM slugs WHERE slug = ?");
const demote = db.prepare("UPDATE slugs SET canonical = 0 WHERE title_id = ? AND canonical = 1");
const addCanonical = db.prepare("INSERT INTO slugs (slug, title_id, canonical, source) VALUES (?, ?, 1, 'snapshot-landing')");
const unresolved = [];
let fromLanding = 0;
db.exec("BEGIN");
for (const b of landings) {
  const seg = pathOf(b.final).slice("/title/".length);
  const own = toId((seg.match(/^(ik\d{6})/i) ?? [])[1]);
  let t = null;
  if (own) {
    const row = getTitle.get(own);
    // 编号并入了别的编号：这个落地页留作别名，由规范编号的落地页决定规范网址。
    if (row?.state === "merged") continue;
    t = liveRow(own);
  } else {
    const hit = bySlug.get(seg);
    t = hit ? liveRow(hit.title_id) : null;
    if (!t) {
      const name = (b.title ?? "").replace(/\s*\((\d{4})\).*$/, "").trim();
      const year = num(((b.title ?? "").match(/\((\d{4})\)/) ?? [])[1]);
      const rows = name ? byNameYear.all(name, year, year) : [];
      t = rows.length ? liveRow(rows[0].id) : null;
    }
  }
  if (!t) {
    unresolved.push({ url: b.url, final: pathOf(b.final), title: b.title });
    continue;
  }
  dropSlug.run(seg);
  demote.run(t.id);
  addCanonical.run(seg, t.id);
  fromLanding++;
}
db.exec("COMMIT");
console.log(`落地页定规范网址：${fromLanding} 个；找不到作品的 ${unresolved.length} 个（多为导出之后才新建的编号，重新导出后再看）`);
writeFileSync(join(dir, `unresolved-landings-${day}.json`), JSON.stringify(unresolved, null, 1));

// ---- 7. 快照路由 ---------------------------------------------------------------------------

const insertRoute = db.prepare(`INSERT OR REPLACE INTO legacy_routes (path, status, target_path, hops, page_title, noindex, observed_at)
  VALUES (?, ?, ?, ?, ?, ?, ?)`);
db.exec("BEGIN");
for (const b of baseline) {
  if (b.error) continue;
  const from = pathOf(b.url);
  const to = b.final ? pathOf(b.final) : null;
  insertRoute.run(from, typeof b.status === "number" ? b.status : 0, to !== from ? to : null, (b.chain?.length ?? 1) - 1, b.title ?? null, b.noindex ? 1 : 0, `${day}T00:00:00Z`);
}
db.exec("COMMIT");
console.log(`快照路由：${db.prepare("SELECT COUNT(*) n FROM legacy_routes").get().n} 条`);

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

const counts = db.prepare("SELECT state, COUNT(*) n FROM titles GROUP BY state").all();
console.log("作品状态：", counts.map((r) => `${r.state} ${r.n}`).join("，"));
db.close();
