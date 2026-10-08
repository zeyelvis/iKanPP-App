-- iKanPP 权威数据库 ikanpp-db（D1）。2026-10-08 重构阶段 2 建立，取代 KV 作为作品、网址与列表的唯一数据源。
-- 设计说明见 .plans/ikanpp-refactor.md 第 9 节（.plans 不进仓库）；要点写在各表注释里。

-- 作品。id 是编号的数字部分（ik000123 → 123），网址里固定写成 ik + 6 位数字。
-- 编号一经出现永不复用、永不改指：行不能删除（下架设 state='removed'），id 不能修改；
-- 同一 TMDB 作品只能有一个 live 编号，其余设为 merged 并指向它。
CREATE TABLE titles (
  id            INTEGER PRIMARY KEY,
  state         TEXT NOT NULL DEFAULT 'live',
  merged_into   INTEGER REFERENCES titles(id),
  kind          TEXT,
  name          TEXT,
  original_name TEXT,
  year          INTEGER,
  tmdb_type     TEXT,
  tmdb_id       TEXT,
  douban_id     TEXT,
  imdb_id       TEXT,
  overview      TEXT,
  poster        TEXT,
  backdrop      TEXT,
  genres        TEXT NOT NULL DEFAULT '[]',
  region        TEXT,
  language      TEXT,
  status_label  TEXT,
  rating        REAL,
  popularity    REAL,
  hot           INTEGER,
  runtime       INTEGER,
  seasons       INTEGER,
  episodes      INTEGER,
  directors     TEXT NOT NULL DEFAULT '[]',
  actors        TEXT NOT NULL DEFAULT '[]',
  aliases       TEXT NOT NULL DEFAULT '[]',
  keywords      TEXT NOT NULL DEFAULT '[]',
  ai_content    TEXT,                      -- 已有的 AI 长文，2026-10-08 起冻结，不再生成
  extra         TEXT,                      -- KV 记录里其余字段原样保留（JSON），便于核对
  source        TEXT,                      -- kv-2026-10-08、ingest、seen-in-urls…
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  CHECK (id BETWEEN 1 AND 999999),
  CHECK (state IN ('live', 'merged', 'removed')),
  CHECK (state <> 'merged' OR merged_into IS NOT NULL)
);
CREATE UNIQUE INDEX ux_titles_tmdb_live ON titles (tmdb_type, tmdb_id) WHERE state = 'live' AND tmdb_id IS NOT NULL;
CREATE INDEX ix_titles_kind ON titles (kind, state);
CREATE INDEX ix_titles_name ON titles (name);
CREATE TRIGGER titles_no_delete BEFORE DELETE ON titles
BEGIN SELECT RAISE(ABORT, 'titles rows are never deleted; set state = removed'); END;
CREATE TRIGGER titles_no_id_change BEFORE UPDATE OF id ON titles
BEGIN SELECT RAISE(ABORT, 'title ids never change'); END;

-- 网址片段（/title/ 之后的部分，解码后）→ 作品：规范片段与全部历史别名。
CREATE TABLE slugs (
  slug       TEXT PRIMARY KEY,
  title_id   INTEGER NOT NULL REFERENCES titles(id),
  canonical  INTEGER NOT NULL DEFAULT 0,
  source     TEXT,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
CREATE INDEX ix_slugs_title ON slugs (title_id, canonical);
CREATE UNIQUE INDEX ux_slugs_canonical ON slugs (title_id) WHERE canonical = 1;

-- 2026-10-08 线上快照：每个在 Google 有展示的网址当时的最终结果。新路由先查这里，
-- 保证这些网址打开后的去向与内容不变。
CREATE TABLE legacy_routes (
  path        TEXT PRIMARY KEY,   -- 解码后的路径，如 /title/ik005105-现在不是出轨的问题
  status      INTEGER NOT NULL,   -- 最终状态码
  target_path TEXT,               -- 有跳转时最终到达的路径（解码）
  hops        INTEGER NOT NULL,
  page_title  TEXT,
  noindex     INTEGER,
  observed_at TEXT NOT NULL
);

-- 影人与演职关系。
CREATE TABLE people (
  id   INTEGER PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);
CREATE TABLE credits (
  title_id  INTEGER NOT NULL REFERENCES titles(id),
  person_id INTEGER NOT NULL REFERENCES people(id),
  role      TEXT NOT NULL,        -- actor | director
  ord       INTEGER NOT NULL,
  PRIMARY KEY (title_id, role, person_id)
);
CREATE INDEX ix_credits_person ON credits (person_id, role);

-- 有序列表：首页轮播与热播标签、最近更新、频道、排行等。card 存列表来源给的原始卡片，
-- 片库里还没有的作品（如爱壹帆新片）也能显示；能关联到作品时填 title_id。
CREATE TABLE lists (
  list_key   TEXT NOT NULL,
  position   INTEGER NOT NULL,
  title_id   INTEGER REFERENCES titles(id),
  card       TEXT,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (list_key, position)
);
CREATE INDEX ix_lists_title ON lists (title_id);

-- 各国各线路的播放成功 / 失败次数，用于线路排序。
CREATE TABLE line_stats (
  country    TEXT NOT NULL,
  line       TEXT NOT NULL,
  ok         INTEGER NOT NULL DEFAULT 0,
  fail       INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT,
  PRIMARY KEY (country, line)
);

-- 任务游标与状态。
CREATE TABLE sync_state (
  key        TEXT PRIMARY KEY,
  value      TEXT,
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);
