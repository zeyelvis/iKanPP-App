#!/usr/bin/env node
/**
 * 重构阶段 2：校验导入结果与 2026-10-08 线上快照是否一致。只读。
 *
 *   node scripts/d1/verify-import.mjs <sqlite 文件> [明细输出 json]
 *
 * 两项检查：
 * 1. 落地页：快照里最终返回 200 的作品页（Google 收录的内容就在这些网址上），在新库里必须是
 *    同一个编号的 live 作品，规范网址与快照的最终网址完全相同，片名与当时的页面标题一致。
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
const pageName = (pageTitle) => (pageTitle ?? "").replace(/\s*\(\d{4}\).*$/, "").replace(/\s*在线观看.*$/, "").replace(/\s*-.*$/, "").trim();

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
const landing = { ok: 0, problems: [] };
const redirect = { same: 0, differ: [] };
for (const r of routes) {
  const finalPath = r.target_path ?? r.path;
  if (r.status === 200 && finalPath.startsWith("/title/")) {
    // 先按片段表找（落地网址可能不带编号），再按网址里的编号找。
    const m = finalPath.match(ID);
    const hit = slugTo.get(finalPath.slice("/title/".length));
    const t = hit ? live(hit.title_id) : m ? live(Number(m[1])) : null;
    const canon = t ? canonicalOf.get(t.id)?.slug : null;
    const nameOk = t && pageName(r.page_title) && (t.name ?? "").startsWith(pageName(r.page_title).slice(0, 4));
    if (t && t.state === "live" && `/title/${canon}` === finalPath && nameOk) landing.ok++;
    else landing.problems.push({ path: r.path, final: finalPath, pageTitle: r.page_title, id: t?.id ?? (m ? Number(m[1]) : null), state: t?.state ?? null, canonical: canon ? `/title/${canon}` : null, name: t?.name ?? null });
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
console.log(`落地页（快照里 200 的作品页）：${landingTotal} 个，一致 ${landing.ok}，不一致 ${landing.problems.length}`);
const why = {};
for (const p of landing.problems) {
  const k = !p.state ? "编号不在库里" : p.state !== "live" ? `状态是 ${p.state}` : p.canonical !== p.final ? "规范网址不同" : "片名对不上";
  why[k] = (why[k] ?? 0) + 1;
}
console.log("  不一致原因：", JSON.stringify(why));
console.log(`跳转推演（不查快照路由）：${redirect.same + redirect.differ.length} 个作品网址，一致 ${redirect.same}，需要快照路由兜底 ${redirect.differ.length}`);
for (const p of landing.problems.slice(0, 6)) console.log("  例：", JSON.stringify(p).slice(0, 260));
if (outFile) writeFileSync(outFile, JSON.stringify({ landing, redirect }, null, 1));
