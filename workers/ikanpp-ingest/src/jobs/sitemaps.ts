/**
 * 每天重算作品站点地图 sitemap_titles（规则见 db/d1/rebuild-sitemap-titles.sql，与手动执行的是同一份）。
 */
import rebuildSql from '../../../../db/d1/rebuild-sitemap-titles.sql';
import type { Env } from '../env';

export async function syncSitemaps(env: Env): Promise<string[]> {
  const statements = rebuildSql
    .replace(/^--.*$/gm, '')
    .split(';')
    .map((st) => st.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  // 删旧、插新在同一个批次（事务）里，站点地图不会出现短暂为空
  await env.DB.batch(statements.map((st) => env.DB.prepare(st)));
  const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM sitemap_titles').first<{ n: number }>();
  return [`站点地图：${row?.n ?? 0} 部作品`];
}
