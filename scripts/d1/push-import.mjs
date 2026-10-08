#!/usr/bin/env node
/**
 * 重构阶段 2：把 build-import.mjs 生成、verify-import.mjs 校验过的 SQLite 文件整体导入 D1 ikanpp-db。
 *
 *   node scripts/d1/push-import.mjs <sqlite 文件> [--dry-run] [--reset]
 *
 * --reset：切换前修正导入规则后重导用。删掉 D1 里作品、网址、影人、题材这几张表重建再导入
 *   （documents、tmdb_matches、sync_state 等入库 Worker 的表不动）。必须同时设
 *   IKANPP_D1_RESET=before-cutover，且 sync_state 里没有 site:live 标记（切换上线时写入），否则拒绝执行。
 * - 可续跑：每一步先看 D1 里这一步的行数，已等于应导入的行数就跳过，为 0 才导入，其余情况停下等人处理
 *   （titles 有禁止删除的触发器，导错了不能简单重来）；
 * - 每个文件约 15 MB 一份上传，上传失败（Cloudflare 偶发 InternalError）自动重试 3 次；
 * - 不动 documents、sync_state、tmdb_matches 等入库 Worker 在用的表；
 * - 按外键顺序分文件导入：live 作品 → removed → merged（指向 live）→ 网址片段 → 快照路由 → 影人 → 演职关系；
 * - 每个文件导入后核对行数。--dry-run 只生成 SQL 文件、打印行数，不连 D1。
 *
 * wrangler 用本机登录（剥掉环境里旧的 CF_API_TOKEN），SQL 文件写在系统临时目录，导完删除。
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const [dbFile, ...flags] = process.argv.slice(2);
const DRY = flags.includes("--dry-run");
const RESET = flags.includes("--reset");
if (!dbFile) {
  console.error("用法：node scripts/d1/push-import.mjs <sqlite 文件> [--dry-run]");
  process.exit(1);
}

const env = { ...process.env };
delete env.CF_API_TOKEN;
delete env.CLOUDFLARE_API_TOKEN;
const wrangler = (args) =>
  execFileSync("npx", ["--prefix", "/Users/zeyelvis/kanpp", "wrangler", ...args], { cwd: tmpdir(), env, encoding: "utf8", maxBuffer: 64 << 20, stdio: ["ignore", "pipe", "pipe"] });
const remoteCount = (sql) => {
  const out = wrangler(["d1", "execute", "ikanpp-db", "--remote", "--json", "--command", sql]);
  return Number(Object.values(JSON.parse(out)[0].results[0])[0]);
};

// [说明, 表, 条件, 排序]
const STEPS = [
  ["titles（live）", "titles", "state = 'live'", "id"],
  ["titles（removed）", "titles", "state = 'removed'", "id"],
  ["titles（merged）", "titles", "state = 'merged'", "id"],
  ["slugs", "slugs", "1", "title_id"],
  ["legacy_routes", "legacy_routes", "1", "path"],
  ["people", "people", "1", "id"],
  ["credits", "credits", "1", "title_id"],
  ["title_genres", "title_genres", "1", "genre"],
];
const CHUNK_BYTES = 15 << 20;

const db = new DatabaseSync(dbFile, { readOnly: true });
const quote = (v) => (v === null || v === undefined ? "NULL" : typeof v === "number" || typeof v === "bigint" ? String(v) : `'${String(v).replaceAll("'", "''")}'`);

const work = mkdtempSync(join(tmpdir(), "ikanpp-d1-"));
if (RESET && !DRY) {
  if (process.env.IKANPP_D1_RESET !== "before-cutover") throw new Error("--reset 需要 IKANPP_D1_RESET=before-cutover");
  const live = JSON.parse(wrangler(["d1", "execute", "ikanpp-db", "--remote", "--json", "--command", "SELECT COUNT(*) AS n FROM sync_state WHERE key = 'site:live'"]))[0].results[0].n;
  if (live) throw new Error("新站已上线（sync_state 有 site:live），不能再重置作品表");
  // 大表一次 DROP 会超出 D1 的 CPU 限制（整条语句回滚）：先分批删行，再删空表、重建。
  const exec = (sql) => wrangler(["d1", "execute", "ikanpp-db", "--remote", "--yes", "--command", sql]);
  const count = (sql) => remoteCount(sql);
  const drain = (table, where = "1") => {
    while (count(`SELECT COUNT(*) AS n FROM ${table} WHERE ${where}`) > 0) {
      exec(`DELETE FROM ${table} WHERE rowid IN (SELECT rowid FROM ${table} WHERE ${where} LIMIT 20000)`);
    }
  };
  for (const t of ["sitemap_titles", "title_genres", "credits", "people", "legacy_routes", "slugs"]) {
    drain(t);
    console.log(`已清空 ${t}`);
  }
  exec("DROP TRIGGER IF EXISTS titles_no_delete");
  drain("titles", "state = 'merged'");
  drain("titles");
  console.log("已清空 titles");
  // 作品、网址、影人相关的表定义：0001 里 lists 之前的部分（titles、slugs、legacy_routes、people、credits 及触发器）+ 0004 + 0005 + 0007。
  const init = readFileSync(join(import.meta.dirname, "../../db/d1/0001_init.sql"), "utf8");
  const catalogDdl = init.slice(0, init.indexOf("-- 有序列表"));
  const ddl = [
    "DROP TABLE IF EXISTS title_genres;",
    "DROP TABLE IF EXISTS credits;",
    "DROP TABLE IF EXISTS people;",
    "DROP TABLE IF EXISTS legacy_routes;",
    "DROP TABLE IF EXISTS slugs;",
    "DROP TABLE IF EXISTS titles;",
    catalogDdl,
    readFileSync(join(import.meta.dirname, "../../db/d1/0004_title_name_key.sql"), "utf8"),
    readFileSync(join(import.meta.dirname, "../../db/d1/0005_title_genres.sql"), "utf8"),
    readFileSync(join(import.meta.dirname, "../../db/d1/0007_browse_indexes.sql"), "utf8"),
    readFileSync(join(import.meta.dirname, "../../db/d1/0008_titles_merged_index.sql"), "utf8"),
  ].join("\n");
  const file = join(work, "reset.sql");
  writeFileSync(file, ddl);
  wrangler(["d1", "execute", "ikanpp-db", "--remote", "--yes", "--file", file]);
  console.log("已重建作品、网址、影人、题材表");
}
try {
  for (const [label, table, where, order] of STEPS) {
    const rows = db.prepare(`SELECT * FROM ${table} WHERE ${where} ORDER BY ${order}`).all();
    if (!rows.length) {
      console.log(`${label}：0 行，跳过`);
      continue;
    }
    if (!DRY) {
      const already = remoteCount(`SELECT COUNT(*) AS n FROM ${table} WHERE ${where}`);
      if (already === rows.length) {
        console.log(`${label}：D1 已有 ${already} 行，跳过`);
        continue;
      }
      if (already !== 0) throw new Error(`${label}：D1 已有 ${already} 行，应为 0 或 ${rows.length}，停止`);
    }
    const cols = Object.keys(rows[0]);
    // D1 单条语句上限 100 KB：多行合并成一条 INSERT，按 UTF-8 字节攒到约 80 KB 就换下一条。
    const head = `INSERT INTO ${table} (${cols.join(",")}) VALUES `;
    const lines = [];
    let batch = [];
    let size = 0;
    for (const r of rows) {
      const v = `(${cols.map((c) => quote(r[c])).join(",")})`;
      const bytes = Buffer.byteLength(v);
      if (batch.length && size + bytes > 80_000) {
        lines.push(head + batch.join(",") + ";");
        batch = [];
        size = 0;
      }
      batch.push(v);
      size += bytes + 1;
    }
    if (batch.length) lines.push(head + batch.join(",") + ";");
    // 按约 15 MB 切成多个文件。
    const files = [];
    let part = [], partBytes = 0;
    for (const line of lines) {
      const b = Buffer.byteLength(line) + 1;
      if (part.length && partBytes + b > CHUNK_BYTES) {
        files.push(part);
        part = [];
        partBytes = 0;
      }
      part.push(line);
      partBytes += b;
    }
    if (part.length) files.push(part);
    let totalMb = 0;
    for (const [i, chunk] of files.entries()) {
      const file = join(work, `${table}-${i}.sql`);
      writeFileSync(file, chunk.join("\n") + "\n");
      totalMb += statSync(file).size / 1048576;
      if (DRY) continue;
      for (let attempt = 1; ; attempt++) {
        try {
          wrangler(["d1", "execute", "ikanpp-db", "--remote", "--yes", "--file", file]);
          break;
        } catch (err) {
          const msg = String(err?.stderr ?? err?.message ?? err);
          if (attempt >= 4 || !/could not be uploaded|InternalError|timed out|ETIMEDOUT|ECONNRESET|fetch failed|503|502/i.test(msg)) throw err;
          console.log(`  第 ${i + 1}/${files.length} 份上传失败，重试（${attempt}）`);
        }
      }
    }
    if (DRY) {
      console.log(`${label}：${rows.length} 行，${totalMb.toFixed(1)} MB，${files.length} 份（未导入）`);
      continue;
    }
    const after = remoteCount(`SELECT COUNT(*) AS n FROM ${table} WHERE ${where}`);
    console.log(`${label}：${rows.length} 行，${totalMb.toFixed(1)} MB，${files.length} 份 → D1 现有 ${after} 行`);
    if (after !== rows.length) throw new Error(`${label} 行数不符，停止`);
  }
  if (!DRY) {
    // 作品表变了，站点地图跟着重算
    wrangler(["d1", "execute", "ikanpp-db", "--remote", "--yes", "--file", join(import.meta.dirname, "../../db/d1/rebuild-sitemap-titles.sql")]);
    console.log("已重算作品站点地图（sitemap_titles）");
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
