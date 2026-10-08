/**
 * 作品站点地图（D1 sitemap_titles，由 db/d1/rebuild-sitemap-titles.sql 每天重算）：
 * 只收 live、有海报和简介、同名同年取一部的作品，网址一律是规范网址（不再列会 308 的「编号-片名」）。
 */
import type { D1Like } from './title-route';

export const TITLES_PER_SITEMAP = 2000;

/** 分卷数与每卷的最后更新日期。 */
export async function sitemapTitleVolumes(db: D1Like): Promise<{ page: number; lastmod: string }[]> {
  const rows = await db
    .prepare(`SELECT (ord - 1) / ${TITLES_PER_SITEMAP} + 1 AS page, max(lastmod) AS lastmod FROM sitemap_titles GROUP BY page ORDER BY page`)
    .bind()
    .all<{ page: number; lastmod: string }>();
  return rows.results;
}

/** 第 page 卷（从 1 开始）的规范片段与最后更新日期。 */
export async function sitemapTitlePage(db: D1Like, page: number): Promise<{ slug: string; lastmod: string }[]> {
  const start = (page - 1) * TITLES_PER_SITEMAP + 1;
  const rows = await db
    .prepare('SELECT slug, lastmod FROM sitemap_titles WHERE ord BETWEEN ? AND ? ORDER BY ord')
    .bind(start, start + TITLES_PER_SITEMAP - 1)
    .all<{ slug: string; lastmod: string }>();
  return rows.results;
}
