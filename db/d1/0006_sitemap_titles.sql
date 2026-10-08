-- 作品站点地图（预先算好，sitemap-titles-N.xml 每份 2000 条直接按 ord 区间取）。
-- 收录条件见 db/d1/rebuild-sitemap-titles.sql：live、有海报、简介 ≥ 30 字、同名同年只收资料最好的一部；
-- 网址一律用规范片段；按入库时间排序，新作品排在最后，已有分卷的内容不因新作品而整体后移。
CREATE TABLE sitemap_titles (
  ord      INTEGER PRIMARY KEY,
  title_id INTEGER NOT NULL UNIQUE,
  slug     TEXT NOT NULL,
  lastmod  TEXT NOT NULL
);
