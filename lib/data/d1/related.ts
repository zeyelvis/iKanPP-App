/**
 * 作品页「更多类似推荐」与影人页作品列表（D1）：同导演、同主演、同题材，按热度取前几部。
 * 只读带索引的小范围（credits 按影人、title_genres 按题材+热度），不扫整张 titles。
 */
import type { TitleEntity } from '@/lib/types/entity';
import { entityCode, type D1Like, type TitleRow } from './title-route';
import { rowToEntity } from './titles';

/** 一次查出这些作品的规范片段，再转成 TitleEntity。 */
export async function toEntities(db: D1Like, rows: TitleRow[]): Promise<TitleEntity[]> {
  if (!rows.length) return [];
  const slugs = await db
    .prepare(`SELECT title_id, slug FROM slugs WHERE canonical = 1 AND title_id IN (${rows.map(() => '?').join(',')})`)
    .bind(...rows.map((r) => r.id))
    .all<{ title_id: number; slug: string }>();
  const canonical = new Map(slugs.results.map((s) => [s.title_id, s.slug]));
  return rows.map((row) => rowToEntity(row, canonical.get(row.id) ?? entityCode(row.id)));
}

/** 某位导演或演员参与的 live 作品，热度从高到低。 */
export async function titlesByPerson(db: D1Like, name: string, role: 'director' | 'actor', limit: number): Promise<TitleEntity[]> {
  if (!name.trim()) return [];
  const rows = await db
    .prepare(
      `SELECT t.* FROM people p JOIN credits c ON c.person_id = p.id JOIN titles t ON t.id = c.title_id
       WHERE p.name = ? AND c.role = ? AND t.state = 'live'
       ORDER BY coalesce(t.popularity, t.hot, 0) DESC, t.id LIMIT ?`,
    )
    .bind(name.trim(), role, limit)
    .all<TitleRow>();
  return toEntities(db, rows.results);
}

/** 同题材里最热的几部（可限定作品类型）。 */
export async function titlesByGenre(db: D1Like, genre: string, limit: number, kind?: string): Promise<TitleEntity[]> {
  if (!genre.trim()) return [];
  const rows = await db
    .prepare(
      `SELECT t.* FROM title_genres g JOIN titles t ON t.id = g.title_id
       WHERE g.genre = ? ${kind ? 'AND g.kind = ?' : ''} AND t.state = 'live'
       ORDER BY g.popularity DESC LIMIT ?`,
    )
    .bind(...(kind ? [genre.trim(), kind, limit] : [genre.trim(), limit]))
    .all<TitleRow>();
  return toEntities(db, rows.results);
}
