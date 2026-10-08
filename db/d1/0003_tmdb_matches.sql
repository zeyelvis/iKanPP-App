-- 入库 Worker 的 TMDB 片名匹配缓存：同一片名每小时都会出现在列表里，命中的结果长期复用，
-- 没搜到的隔一天再搜，免得每次运行都把 TMDB 重新查一遍。
CREATE TABLE tmdb_matches (
  query      TEXT PRIMARY KEY,   -- '<movie|tv>:<规范化片名>:<年份或空>'
  tmdb_id    TEXT,               -- NULL 表示没搜到（或搜到的年份、片名对不上）
  payload    TEXT,               -- 命中时的 TmdbBrief（JSON）
  checked_at TEXT NOT NULL
);
