/**
 * 用导入好的 SQLite 文件离线检验新站的 /title 网址解析（lib/data/d1/title-route.ts）：
 * 快照里每个 Search Console 网址走一遍新规则（最多跟 5 次跳转），与 2026-10-08 线上结果比较。
 *
 *   npx tsx scripts/d1/test-title-route.ts <sqlite 文件> <live-baseline jsonl> [明细输出 json]
 *
 * - 线上最终是作品页（200）的：新规则也必须落到作品页，片名与当时的页面标题对得上（同一部片）；
 * - 线上是 404 的：新规则也应 404（落到作品页的单独列出，属于「修好了」，人工看）；
 * - 线上跳到非作品页的（首页、频道页）：不在 /title 解析范围，只统计。
 */
import { readFileSync, writeFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import {
  resolveTitleSegment,
  segmentFitsName,
  type D1Like,
} from "../../lib/data/d1/title-route";

const [dbFile, baselineFile, outFile] = process.argv.slice(2);
const sqlite = new DatabaseSync(dbFile, { readOnly: true });
const db: D1Like = {
  prepare(sql) {
    const st = sqlite.prepare(sql);
    return {
      bind: (...values) => ({
        first: async <T>() => (st.get(...(values as never[])) as T) ?? null,
        all: async <T>() => ({
          results: st.all(...(values as never[])) as T[],
        }),
      }),
    };
  },
};

const pageName = (t: string | null) =>
  (String(t ?? "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .match(/^(.*?)\s*(?:\(\d{4}\))?\s*在线观看\s*-/) ?? [])[1]?.trim() ?? "";
const pathOf = (url: string) => {
  try {
    return decodeURIComponent(new URL(url).pathname);
  } catch {
    return new URL(url).pathname;
  }
};

async function follow(path: string) {
  let current = path;
  for (let hop = 0; hop < 6; hop++) {
    if (!current.startsWith("/title/"))
      return { kind: "other" as const, path: current, hops: hop };
    const r = await resolveTitleSegment(db, current.slice("/title/".length));
    if (r.type === "redirect") {
      current = r.location;
      continue;
    }
    if (r.type === "not-found")
      return { kind: "404" as const, path: current, hops: hop };
    return {
      kind: "title" as const,
      path: current,
      hops: hop,
      name: r.row.name,
    };
  }
  return { kind: "loop" as const, path: current, hops: 6 };
}

async function main() {
  const rows = readFileSync(baselineFile, "utf8")
    .split("\n")
    .filter(Boolean)
    .map((l) => JSON.parse(l));
  const stats = {
    titleOk: 0,
    titleWrong: [] as unknown[],
    titleMissing: [] as unknown[],
    notFoundOk: 0,
    notFoundNowTitle: [] as unknown[],
    other: 0,
    loops: [] as unknown[],
  };
  for (const b of rows) {
    if (b.error || !String(b.url).includes("/title/")) {
      stats.other++;
      continue;
    }
    const got = await follow(pathOf(b.url));
    if (got.kind === "loop") stats.loops.push({ url: b.url, got });
    const final = b.final ? pathOf(b.final) : null;
    if (b.status === 200 && final?.startsWith("/title/")) {
      const want = pageName(b.title);
      if (got.kind !== "title")
        stats.titleMissing.push({ url: pathOf(b.url), want, got });
      else if (want && !segmentFitsName(want, got.name ?? null))
        stats.titleWrong.push({ url: pathOf(b.url), want, got });
      else stats.titleOk++;
    } else if (b.status === 404) {
      if (got.kind === "404") stats.notFoundOk++;
      else stats.notFoundNowTitle.push({ url: pathOf(b.url), got });
    } else stats.other++;
  }
  const total =
    stats.titleOk + stats.titleWrong.length + stats.titleMissing.length;
  console.log(
    `作品页网址 ${total} 个：同一部片 ${stats.titleOk}（${((stats.titleOk / total) * 100).toFixed(2)}%），片不对 ${stats.titleWrong.length}，找不到 ${stats.titleMissing.length}`,
  );
  console.log(
    `线上 404 的：仍 404 ${stats.notFoundOk}，现在能打开 ${stats.notFoundNowTitle.length}；其他 ${stats.other}；跳转循环 ${stats.loops.length}`,
  );
  for (const x of [
    ...stats.titleWrong.slice(0, 5),
    ...stats.titleMissing.slice(0, 5),
  ])
    console.log("  例：", JSON.stringify(x).slice(0, 220));
  if (outFile) writeFileSync(outFile, JSON.stringify(stats, null, 1));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
