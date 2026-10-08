-- 规范化片名（lib/data/entities/entity-utils.ts 的 normalizeTitle：小写、去括号内容、只留字母数字与汉字），
-- 供按网址里的片名找作品：/title/燃烧吧-爸爸 → 「燃烧吧！爸爸」。由导入与入库时写入。
ALTER TABLE titles ADD COLUMN name_key TEXT;
CREATE INDEX ix_titles_name_key ON titles (name_key) WHERE state = 'live';
