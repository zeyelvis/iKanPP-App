-- 频道片库（/api/library/browse）四种排序的索引：按频道 + 排序字段取一页，只读这一页附近的行。
CREATE INDEX ix_titles_browse_hot ON titles (kind, popularity DESC) WHERE state = 'live';
CREATE INDEX ix_titles_browse_rating ON titles (kind, rating DESC) WHERE state = 'live';
CREATE INDEX ix_titles_browse_added ON titles (kind, created_at DESC) WHERE state = 'live';
CREATE INDEX ix_titles_browse_updated ON titles (kind, updated_at DESC) WHERE state = 'live';
