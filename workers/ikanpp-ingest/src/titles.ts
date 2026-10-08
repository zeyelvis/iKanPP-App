/**
 * 入库 Worker 建档（重构阶段 3 切换后，D1 是唯一发号方）：
 * - 只有 sync_state 里有 site:live（新站上线时写入）才建档；切换前 D1 不发号，以免与旧站 KV 的编号冲突。
 * - 新编号取 13 万以上最小的空号（titles 里出现过的编号都有行，下架的也在，永不复用）；入库 Worker 串行运行，不会两处同时发号。
 * - 同一 TMDB 作品只能有一个 live 编号（唯一索引）：撞上就用已有的那部。
 * - 规范网址「编号-片名」；纯片名也登记为别名，横轨里旧的片名链接按片名找到它。
 */
import { generateSlug, isCleanChineseTitle, normalizeTitle } from '../../../lib/data/entities/entity-utils';
import type { Env } from './env';
import type { TmdbDetails } from './tmdb';

export async function siteIsLive(env: Env): Promise<boolean> {
  return Boolean(await env.DB.prepare("SELECT 1 AS ok FROM sync_state WHERE key = 'site:live'").first());
}

const code = (id: number) => `ik${String(id).padStart(6, '0')}`;

async function smallestFreeId(env: Env): Promise<number> {
  const row = await env.DB.prepare(
    `SELECT CASE WHEN NOT EXISTS (SELECT 1 FROM titles WHERE id = 130000) THEN 130000
            ELSE (SELECT MIN(t.id + 1) FROM titles t WHERE t.id >= 130000 AND NOT EXISTS (SELECT 1 FROM titles u WHERE u.id = t.id + 1)) END AS id`,
  ).first<{ id: number }>();
  if (!row?.id || row.id > 999999) throw new Error('没有可用的编号');
  return row.id;
}

export interface CreatedTitle {
  id: number;
  slug: string;
  created: boolean;
}

/** 按 TMDB 资料建档；已有同一 TMDB 作品时返回已有的。 */
export async function createTitle(env: Env, kind: string, t: TmdbDetails, displayName?: string): Promise<CreatedTitle | null> {
  const name = (displayName || t.title).trim();
  if (!name || !isCleanChineseTitle(name)) return null;
  const existing = await env.DB.prepare(
    "SELECT t.id, s.slug FROM titles t JOIN slugs s ON s.title_id = t.id AND s.canonical = 1 WHERE t.state = 'live' AND t.tmdb_type = ? AND t.tmdb_id = ?",
  )
    .bind(t.tmdbType, t.tmdbId)
    .first<{ id: number; slug: string }>();
  if (existing) return { id: existing.id, slug: existing.slug, created: false };

  for (let attempt = 0; attempt < 3; attempt++) {
    const id = await smallestFreeId(env);
    const slug = `${code(id)}-${generateSlug(name)}`;
    const now = new Date().toISOString();
    try {
      await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO titles (id, state, kind, name, original_name, year, tmdb_type, tmdb_id, overview, poster, backdrop, genres, region,
             rating, runtime, seasons, episodes, directors, actors, name_key, source, created_at, updated_at)
           VALUES (?, 'live', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'ingest:latest', ?, ?)`,
        ).bind(
          id, kind, name, t.originalTitle || null, Number(t.year) || null, t.tmdbType, t.tmdbId, t.overview || null, t.poster || null,
          t.backdrop || null, JSON.stringify(t.genres), t.region || null, t.rate ? Number(t.rate) : null, t.runtime ?? null,
          t.seasons ?? null, t.episodes ?? null, JSON.stringify(t.directors), JSON.stringify(t.actors), normalizeTitle(name) || null, now, now,
        ),
        env.DB.prepare("INSERT INTO slugs (slug, title_id, canonical, source) VALUES (?, ?, 1, 'ingest')").bind(slug, id),
        env.DB.prepare("INSERT OR IGNORE INTO slugs (slug, title_id, canonical, source) VALUES (?, ?, 0, 'ingest-name')").bind(generateSlug(name), id),
        ...t.genres.map((g) =>
          env.DB.prepare('INSERT OR IGNORE INTO title_genres (genre, title_id, kind, popularity) VALUES (?, ?, ?, 0)').bind(g, id, kind),
        ),
      ]);
      return { id, slug, created: true };
    } catch (err) {
      const msg = String(err);
      // 编号被占（理论上不会）就再取一次；TMDB 唯一索引冲突说明刚有别处建了同一作品，回头查已有的
      if (/UNIQUE constraint failed: titles\.id|PRIMARY KEY/i.test(msg)) continue;
      if (/UNIQUE constraint failed: titles\.tmdb/i.test(msg)) return createTitle(env, kind, t, displayName);
      throw err;
    }
  }
  return null;
}
