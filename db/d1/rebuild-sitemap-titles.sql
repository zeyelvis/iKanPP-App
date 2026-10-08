-- 重算作品站点地图（入库 Worker 每天跑一次；也可手动执行）。
DELETE FROM sitemap_titles;
INSERT INTO sitemap_titles (ord, title_id, slug, lastmod)
SELECT ROW_NUMBER() OVER (ORDER BY t.created_at, t.id), t.id, s.slug, substr(t.updated_at, 1, 10)
FROM (
  SELECT id, created_at, updated_at,
         ROW_NUMBER() OVER (PARTITION BY name_key, coalesce(year, 0)
                            ORDER BY (tmdb_id IS NOT NULL) DESC, coalesce(popularity, hot, 0) DESC, id) AS rn
  FROM titles
  WHERE state = 'live' AND poster LIKE 'http%' AND length(coalesce(overview, '')) >= 30 AND name_key IS NOT NULL
    AND name NOT IN ('未知', '测试', 'undefined', 'null', '暂无', '待更新')
) t
JOIN slugs s ON s.title_id = t.id AND s.canonical = 1
WHERE t.rn = 1;
