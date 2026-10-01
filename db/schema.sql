-- ==============================================================================
-- iKanPP Cloudflare D1 Native Relational Schema
-- ==============================================================================

CREATE TABLE IF NOT EXISTS entities (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 高性能复合多维索引 (废除 24 个手写 KV 倒排索引，毫秒级多条件过滤)
CREATE INDEX IF NOT EXISTS idx_entities_browse ON entities(category, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_entities_rating ON entities(category, rating DESC);
CREATE INDEX IF NOT EXISTS idx_entities_pop ON entities(category, popularity DESC);
CREATE INDEX IF NOT EXISTS idx_entities_year ON entities(category, year DESC);
CREATE INDEX IF NOT EXISTS idx_entities_slug ON entities(slug);
