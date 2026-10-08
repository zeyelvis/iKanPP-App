#!/usr/bin/env node
/**
 * 重构阶段 2：把 build-import.mjs 生成、verify-import.mjs 校验过的 SQLite 文件整体导入 D1 ikanpp-db。
 *
 *   node scripts/d1/push-import.mjs <sqlite 文件> [--dry-run]
 *
 * - 只在 D1 的 titles 表为空时执行（titles 有禁止删除的触发器，导错了不能简单重来，所以只导一次）；
 * - 不动 documents、sync_state、tmdb_matches 等入库 Worker 在用的表；
 * - 按外键顺序分文件导入：live 作品 → removed → merged（指向 live）→ 网址片段 → 快照路由 → 影人 → 演职关系；
 * - 每个文件导入后核对行数。--dry-run 只生成 SQL 文件、打印行数，不连 D1。
 *
 * wrangler 用本机登录（剥掉环境里旧的 CF_API_TOKEN），SQL 文件写在系统临时目录，导完删除。
 */
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const [dbFile, ...flags] = process.argv.slice(2);
const DRY = flags.includes("--dry-run");
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

const STEPS = [
  ["titles（live）", "titles", "state = 'live' ORDER BY id"],
  ["titles（removed）", "titles", "state = 'removed' ORDER BY id"],
  ["titles（merged）", "titles", "state = 'merged' ORDER BY id"],
  ["slugs", "slugs", "1 ORDER BY title_id"],
  ["legacy_routes", "legacy_routes", "1"],
  ["people", "people", "1 ORDER BY id"],
  ["credits", "credits", "1 ORDER BY title_id"],
];

const db = new DatabaseSync(dbFile, { readOnly: true });
const quote = (v) => (v === null || v === undefined ? "NULL" : typeof v === "number" || typeof v === "bigint" ? String(v) : `'${String(v).replaceAll("'", "''")}'`);

if (!DRY) {
  const existing = remoteCount("SELECT COUNT(*) AS n FROM titles");
  if (existing > 0) {
    console.error(`D1 的 titles 已有 ${existing} 行，停止：只能向空表导入一次。`);
    process.exit(1);
  }
}

const work = mkdtempSync(join(tmpdir(), "ikanpp-d1-"));
try {
  for (const [label, table, where] of STEPS) {
    const rows = db.prepare(`SELECT * FROM ${table} WHERE ${where}`).all();
    if (!rows.length) {
      console.log(`${label}：0 行，跳过`);
      continue;
    }
    const cols = Object.keys(rows[0]);
    const file = join(work, `${table}-${label.length}.sql`);
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
    writeFileSync(file, lines.join("\n") + "\n");
    const mb = (statSync(file).size / 1048576).toFixed(1);
    if (DRY) {
      console.log(`${label}：${rows.length} 行，${mb} MB（未导入）`);
      continue;
    }
    const before = remoteCount(`SELECT COUNT(*) AS n FROM ${table}`);
    wrangler(["d1", "execute", "ikanpp-db", "--remote", "--yes", "--file", file]);
    const after = remoteCount(`SELECT COUNT(*) AS n FROM ${table}`);
    console.log(`${label}：${rows.length} 行，${mb} MB → D1 新增 ${after - before} 行`);
    if (after - before !== rows.length) throw new Error(`${label} 行数不符，停止`);
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
