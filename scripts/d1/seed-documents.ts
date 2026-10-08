/**
 * 重构阶段 2：把同步任务维护的整份数据（首页各频道、最新上线、分类大厅）原样写进 D1 的 documents 表，
 * 新站上线第一天就有完整数据；之后由入库 Worker 按块接管更新。
 *
 *   npx tsx scripts/d1/seed-documents.ts <输出 sql 文件>
 *   再用 wrangler d1 execute ikanpp-db --remote --file <输出 sql 文件> 写入。
 *
 * 专题（prebaked-topics）、合集（collections-prebaked）是编辑维护的静态内容，留在代码里。
 */
import { writeFileSync } from "node:fs";
import { PREBAKED_HOME_DATA } from "../../lib/data/home-prebaked";
import { PREBAKED_LATEST_TITLES } from "../../lib/data/latest-titles-prebaked";
import { PREBAKED_CATEGORY_ITEMS } from "../../lib/data/category-prebaked";

const out = process.argv[2];
if (!out) throw new Error("用法：npx tsx scripts/d1/seed-documents.ts <输出 sql 文件>");
const source = `prebaked-${new Date().toISOString().slice(0, 10)}`;
const docs: [string, unknown][] = [
  ...Object.entries(PREBAKED_HOME_DATA).map(([k, v]) => [`home:${k}`, v] as [string, unknown]),
  ...Object.entries(PREBAKED_LATEST_TITLES).map(([k, v]) => [`latest:${k}`, v] as [string, unknown]),
  ...Object.entries(PREBAKED_CATEGORY_ITEMS).map(([k, v]) => [`category:${k}`, v] as [string, unknown]),
];
const quote = (s: string) => `'${s.replace(/'/g, "''")}'`;
const lines = docs.map(([key, value]) => {
  const json = JSON.stringify(value);
  // D1 单条语句上限 100 KB。
  if (json.length > 95_000) throw new Error(`${key} 有 ${json.length} 字节，超过单条语句上限`);
  return `INSERT OR REPLACE INTO documents (key, value, source) VALUES (${quote(key)}, ${quote(json)}, ${quote(source)});`;
});
writeFileSync(out, lines.join("\n") + "\n");
console.log(`${docs.length} 份文档：${docs.map(([k, v]) => `${k}(${(JSON.stringify(v).length / 1024).toFixed(0)}KB)`).join("，")}`);
