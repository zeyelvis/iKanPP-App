-- 整份数据文档：首页各频道（轮播、榜单、货架、热播标签）、最新上线、分类大厅等。
-- 形状与原来 lib/data/*-prebaked.ts 的导出相同，新站读出来直接用；入库 Worker 按块更新。
CREATE TABLE documents (
  key        TEXT PRIMARY KEY,   -- home:all、home:movie、latest:anime、category:tv …
  value      TEXT NOT NULL,      -- JSON
  source     TEXT,               -- prebaked-2026-10-08（初始导入）、ingest:iyf-hero …
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
