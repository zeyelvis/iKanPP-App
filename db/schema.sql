-- iKanPP / KVideo 权威关系数据模型 (Cloudflare D1 SQLite)
-- 严格对应《Cloudflare 全自动 SEO 架构执行规范 v5.0》第 4.2 节

-- 1. 核心实体权威主表
CREATE TABLE IF NOT EXISTS entities (
  entity_id TEXT PRIMARY KEY,
  media_type TEXT NOT NULL CHECK(media_type IN ('movie','tv','anime','variety','documentary','short')),
  canonical_slug TEXT NOT NULL UNIQUE,
  primary_title TEXT NOT NULL,
  original_title TEXT,
  release_date TEXT,
  release_date_precision TEXT CHECK(release_date_precision IN ('day','month','year','unknown')),
  release_year INTEGER,
  synopsis TEXT,
  runtime_minutes INTEGER,
  region_code TEXT,
  language_code TEXT,
  lifecycle_state TEXT NOT NULL DEFAULT 'published',
  index_state TEXT NOT NULL DEFAULT 'draft',
  seo_score INTEGER NOT NULL DEFAULT 0,
  first_seen_at TEXT NOT NULL,
  content_updated_at TEXT NOT NULL,
  material_updated_at TEXT,
  published_at TEXT,
  withdrawn_at TEXT,
  version INTEGER NOT NULL DEFAULT 1
);

-- 2. 外部权威 ID 映射表 (阻止同一外部实体映射到多个 winner)
CREATE TABLE IF NOT EXISTS external_ids (
  source TEXT NOT NULL,
  media_type TEXT NOT NULL,
  external_id TEXT NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
  confidence REAL NOT NULL,
  verified_at TEXT,
  PRIMARY KEY(source, media_type, external_id)
);

-- 3. 实体别名与历史 Slug 映射表 (支持永久 308 单跳重定向)
CREATE TABLE IF NOT EXISTS entity_aliases (
  alias_type TEXT NOT NULL,
  alias_value TEXT NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
  locale TEXT,
  is_redirect_source INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  PRIMARY KEY(alias_type, alias_value)
);

-- 4. 实体事实证据表 (带置信度与来源溯源)
CREATE TABLE IF NOT EXISTS entity_facts (
  entity_id TEXT NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
  fact_key TEXT NOT NULL,
  fact_value_json TEXT NOT NULL,
  source_name TEXT NOT NULL,
  source_record_id TEXT,
  fetched_at TEXT NOT NULL,
  confidence REAL NOT NULL,
  license_class TEXT,
  expires_at TEXT,
  PRIMARY KEY(entity_id, fact_key, source_name)
);

-- 5. 人物实体表 (演职员主表)
CREATE TABLE IF NOT EXISTS persons (
  person_id TEXT PRIMARY KEY,
  canonical_slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  original_name TEXT,
  tmdb_person_id TEXT UNIQUE,
  douban_person_id TEXT,
  biography TEXT,
  image_url TEXT,
  index_state TEXT NOT NULL DEFAULT 'draft',
  seo_score INTEGER NOT NULL DEFAULT 0,
  material_updated_at TEXT
);

-- 6. 演职员表
CREATE TABLE IF NOT EXISTS credits (
  entity_id TEXT NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
  role_type TEXT NOT NULL CHECK(role_type IN ('director','actor','writer','creator','producer')),
  character_name TEXT,
  billing_order INTEGER,
  PRIMARY KEY(entity_id, person_id, role_type, character_name)
);

-- 7. 系列与剧集季表
CREATE TABLE IF NOT EXISTS series_membership (
  series_id TEXT NOT NULL,
  entity_id TEXT NOT NULL REFERENCES entities(entity_id) ON DELETE CASCADE,
  season_number INTEGER,
  episode_number INTEGER,
  sequence_number INTEGER,
  PRIMARY KEY(series_id, entity_id)
);

-- 8. 页面索引状态决策表
CREATE TABLE IF NOT EXISTS page_index_state (
  page_key TEXT PRIMARY KEY,
  page_type TEXT NOT NULL,
  canonical_url TEXT NOT NULL UNIQUE,
  index_state TEXT NOT NULL CHECK(index_state IN ('indexable','noindex','suppressed')),
  quality_score INTEGER NOT NULL,
  demand_score INTEGER NOT NULL DEFAULT 0,
  reason_codes_json TEXT NOT NULL,
  content_hash TEXT,
  material_updated_at TEXT,
  evaluated_at TEXT NOT NULL
);

-- 9. 永久重定向映射表 (规范 308)
CREATE TABLE IF NOT EXISTS redirects (
  source_path TEXT PRIMARY KEY,
  destination_path TEXT NOT NULL,
  status_code INTEGER NOT NULL CHECK(status_code IN (301,308,410)),
  reason TEXT NOT NULL,
  created_at TEXT NOT NULL,
  verified_at TEXT
);

-- 10. 内容变更事件表
CREATE TABLE IF NOT EXISTS content_change_events (
  event_id TEXT PRIMARY KEY,
  entity_id TEXT,
  page_key TEXT,
  event_type TEXT NOT NULL,
  material_change INTEGER NOT NULL,
  old_hash TEXT,
  new_hash TEXT,
  occurred_at TEXT NOT NULL,
  processed_at TEXT
);

-- 11. 发布事件事务发件箱
CREATE TABLE IF NOT EXISTS publish_outbox (
  event_id TEXT PRIMARY KEY,
  target TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  available_at TEXT NOT NULL,
  completed_at TEXT,
  last_error TEXT
);

-- 12. SEO 异常检测问题表
CREATE TABLE IF NOT EXISTS seo_issues (
  issue_id TEXT PRIMARY KEY,
  severity TEXT NOT NULL CHECK(severity IN ('P0','P1','P2','P3')),
  rule_id TEXT NOT NULL,
  page_key TEXT,
  evidence_json TEXT NOT NULL,
  detected_at TEXT NOT NULL,
  resolved_at TEXT
);

-- 创建高频查询索引
CREATE INDEX IF NOT EXISTS idx_entities_canonical_slug ON entities(canonical_slug);
CREATE INDEX IF NOT EXISTS idx_entities_index_state ON entities(index_state);
CREATE INDEX IF NOT EXISTS idx_external_ids_entity ON external_ids(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_aliases_entity ON entity_aliases(entity_id);
CREATE INDEX IF NOT EXISTS idx_credits_person ON credits(person_id);
CREATE INDEX IF NOT EXISTS idx_publish_outbox_available ON publish_outbox(available_at) WHERE completed_at IS NULL;
