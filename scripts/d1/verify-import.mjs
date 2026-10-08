#!/usr/bin/env node
/**
 * 重构阶段 2：校验导入结果与 2026-10-08 线上快照是否一致。只读。
 *
 *   node scripts/d1/verify-import.mjs <sqlite 文件> [明细输出 json]
 *
 * 两项检查：
 * 1. 落地页：快照里最终是作品页（200）的每个 Search Console 网址，按快照路由走到的目标网址，在新库里
 *    必须是 live 作品的规范网址，且片名与当时的页面标题一致（同一部片）。目标与快照网址不同的，
 *    是导入时为纠正编号改指或合并重复而改成 308 的。
 * 2. 跳转：快照里的每个网址，不查 legacy_routes、只按新规则推演（片段表 → 编号 → 规范网址），
 *    最终到达的作品是否与快照相同。推演不一致的，就是 legacy_routes 必须兜住的网址。
 */
import { DatabaseSync } from "node:sqlite";
import { writeFileSync } from "node:fs";

const [dbFile, outFile] = process.argv.slice(2);
const db = new DatabaseSync(dbFile, { readOnly: true });

const ID = /^\/title\/ik(\d{6})(?:-|$)/i;
const titleOf = db.prepare("SELECT id, state, merged_into, name, year FROM titles WHERE id = ?");
const canonicalOf = db.prepare("SELECT slug FROM slugs WHERE title_id = ? AND canonical = 1");
const slugTo = db.prepare("SELECT title_id FROM slugs WHERE slug = ?");
const live = (id) => {
  let t = titleOf.get(id);
  for (let i = 0; t && t.state === "merged" && i < 5; i++) t = titleOf.get(t.merged_into);
  return t;
};
const pageName = (pageTitle) =>
  (String(pageTitle ?? "").replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").match(/^(.*?)\s*(?:\(\d{4}\))?\s*在线观看\s*-/) ?? [])[1]?.trim() ?? "";
const normName = (s) => String(s ?? "").toLowerCase().replace(/[（(][^）)]*[）)]/g, "").replace(/[^\p{L}\p{N}]+/gu, "");
const nameMatch = (a, b) => {
  const x = normName(a), y = normName(b);
  return Boolean(x && y) && (x === y || (Math.min(x.length, y.length) >= 3 && (x.startsWith(y) || y.startsWith(x))));
};
/** 同一编号的译名变化（雪降花 / 雪滴花）：字符重合 ≥ 60%。 */
const similarName = (a, b) => {
  const x = new Set(normName(a)), y = new Set(normName(b));
  if (!x.size || !y.size) return false;
  return [...x].filter((c) => y.has(c)).length / Math.min(x.size, y.size) >= 0.6;
};

// 新规则推演：/title/{片段} → 作品（不查 legacy_routes）
function resolve(path) {
  const m = path.match(/^\/title\/(.+)$/);
  if (!m) return { kind: "other" };
  const seg = m[1];
  const bySlug = slugTo.get(seg) ?? slugTo.get(seg.toLowerCase());
  const id = bySlug?.title_id ?? (path.match(ID) ? Number(path.match(ID)[1]) : null);
  if (!id) return { kind: "404" };
  const t = live(id);
  if (!t || t.state === "removed") return { kind: "404", id };
  const canon = canonicalOf.get(t.id)?.slug ?? null;
  return { kind: "title", id: t.id, name: t.name, canonical: canon ? `/title/${canon}` : null };
}

const routes = db.prepare("SELECT * FROM legacy_routes").all();
const landing = { ok: 0, redirected: 0, problems: [] };
const redirect = { same: 0, differ: [] };
for (const r of routes) {
  const finalPath = r.target_path ?? r.path;
  if (r.status === 200 && finalPath.startsWith("/title/")) {
    const hit = slugTo.get(finalPath.slice("/title/".length));
    const t = hit ? live(hit.title_id) : null;
    const canon = t ? canonicalOf.get(t.id)?.slug : null;
    const temp = r.path.match(/^\/title\/ik_[a-z]+_[^-]*(?:-[0-9a-f%]*)?-(.+)$/i);
    const want = temp ? temp[1].replace(/-/g, " ").trim() : pageName(r.page_title);
    const nameOk = t && (nameMatch(t.name, want) || similarName(t.name, want));
    if (t && t.state === "live" && `/title/${canon}` === finalPath && nameOk) {
      landing.ok++;
      if (r.target_path) landing.redirected++;
    } else landing.problems.push({ path: r.path, final: finalPath, pageTitle: r.page_title, id: t?.id ?? null, state: t?.state ?? null, canonical: canon ? `/title/${canon}` : null, name: t?.name ?? null });
  }
  if (r.path.startsWith("/title/")) {
    const got = resolve(r.path);
    const want = r.status === 200 && finalPath.startsWith("/title/") ? resolve(finalPath) : { kind: String(r.status) };
    const same = got.kind === want.kind && (got.kind !== "title" || got.id === want.id);
    if (same) redirect.same++;
    else redirect.differ.push({ path: r.path, snapshot: { status: r.status, final: finalPath }, got });
  }
}
const landingTotal = landing.ok + landing.problems.length;
console.log(`落地页（快照里 200 的作品页）：${landingTotal} 个，一致 ${landing.ok}（${(landing.ok / landingTotal * 100).toFixed(2)}%，其中经 308 到达 ${landing.redirected}），不一致 ${landing.problems.length}`);
const why = {};
for (const p of landing.problems) {
  const k = !p.state ? "找不到作品" : p.state !== "live" ? `状态是 ${p.state}` : p.canonical !== p.final ? "规范网址不同" : "片名对不上";
  why[k] = (why[k] ?? 0) + 1;
}
console.log("  不一致原因：", JSON.stringify(why));
console.log(`跳转推演（不查快照路由）：${redirect.same + redirect.differ.length} 个作品网址，一致 ${redirect.same}，需要快照路由兜底 ${redirect.differ.length}`);
for (const p of landing.problems.slice(0, 6)) console.log("  例：", JSON.stringify(p).slice(0, 260));
if (outFile) writeFileSync(outFile, JSON.stringify({ landing, redirect }, null, 1));
