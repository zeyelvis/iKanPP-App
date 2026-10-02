-- ==============================================================================
-- iKanPP Cloudflare D1 Native Relational Schema (规范 4.2 节 & 21.2 节)
-- ==============================================================================

-- 1. 实体主表 (Single Source of Truth)
CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  canonical_slug TEXT UNIQUE,
  title TEXT NOT NULL,
  original_title TEXT,
  category TEXT NOT NULL,        -- movie, tv, anime, variety, documentary, short
  year INTEGER,
  rating REAL DEFAULT 0.0,
  popularity INTEGER DEFAULT 0,
  update_badge TEXT,
  quality_badge TEXT,
  cover TEXT,
  backdrop TEXT,
  actors TEXT,
  directors TEXT,
  genres TEXT,
  synopsis TEXT,
  runtime_minutes INTEGER,
  region_code TEXT,
  language_code TEXT,
  index_state TEXT DEFAULT 'indexable',
  seo_score INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 高性能复合多维索引 (废除手写 KV 倒排索引，毫秒级多条件过滤)
CREATE INDEX IF NOT EXISTS idx_entities_browse ON entities(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entities_rating ON entities(category, rating DESC);
CREATE INDEX IF NOT EXISTS idx_entities_pop ON entities(category, popularity DESC);
CREATE INDEX IF NOT EXISTS idx_entities_year ON entities(category, year DESC);
CREATE INDEX IF NOT EXISTS idx_entities_slug ON entities(slug);
CREATE INDEX IF NOT EXISTS idx_entities_canonical_slug ON entities(canonical_slug);

-- 2. 外部权威 ID 映射表 (TMDB, 豆瓣, IMDb)
CREATE TABLE IF NOT EXISTS external_ids (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  source TEXT NOT NULL,          -- 'tmdb', 'douban', 'imdb'
  media_type TEXT NOT NULL,      -- 'movie', 'tv'
  external_id TEXT NOT NULL,
  confidence REAL DEFAULT 1.0,
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source, media_type, external_id)
);
CREATE INDEX IF NOT EXISTS idx_ext_ids_lookup ON external_ids(source, media_type, external_id);
CREATE INDEX IF NOT EXISTS idx_ext_ids_entity ON external_ids(entity_id);

-- 3. 实体别名与曾用名表 (308 永久规范重定向与全名检索)
CREATE TABLE IF NOT EXISTS entity_aliases (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  alias_value TEXT NOT NULL,
  alias_type TEXT DEFAULT 'translation', -- 'translation', 'pinyin', 'misspelling', 'legacy_slug'
  is_redirect INTEGER DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(alias_value)
);
CREATE INDEX IF NOT EXISTS idx_aliases_entity ON entity_aliases(entity_id);

-- 4. 事实证据与可信度表
CREATE TABLE IF NOT EXISTS entity_facts (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  fact_type TEXT NOT NULL,       -- 'synopsis', 'cast', 'rating', 'runtime'
  fact_payload TEXT NOT NULL,    -- JSON payload
  source TEXT NOT NULL,
  confidence REAL DEFAULT 1.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_facts_entity ON entity_facts(entity_id);

-- 5. 演职员表
CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  original_name TEXT,
  tmdb_id TEXT,
  avatar TEXT,
  bio TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_persons_slug ON persons(slug);

-- 6. 影视演职员关联表
CREATE TABLE IF NOT EXISTS credits (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  role TEXT NOT NULL,            -- 'director', 'actor', 'writer'
  character_name TEXT,
  order_num INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(entity_id, person_id, role)
);
CREATE INDEX IF NOT EXISTS idx_credits_entity ON credits(entity_id);
CREATE INDEX IF NOT EXISTS idx_credits_person ON credits(person_id);

-- 7. 页面索引决策状态表
CREATE TABLE IF NOT EXISTS page_index_state (
  page_url TEXT PRIMARY KEY,
  entity_id TEXT REFERENCES entities(id) ON DELETE SET NULL,
  state TEXT NOT NULL,           -- 'indexable', 'noindex', 'redirect', 'excluded'
  reason TEXT,
  last_evaluated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 8. 边缘发布发件箱 (KV / Edge Cache 只读投影流水线)
CREATE TABLE IF NOT EXISTS publish_outbox (
  id TEXT PRIMARY KEY,
  entity_id TEXT NOT NULL REFERENCES entities(id) ON DELETE CASCADE,
  operation TEXT NOT NULL,       -- 'upsert', 'delete'
  content_hash TEXT NOT NULL,
  status TEXT DEFAULT 'pending', -- 'pending', 'published', 'failed'
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_outbox_status ON publish_outbox(status);
