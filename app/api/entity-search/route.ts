import { NextRequest, NextResponse } from 'next/server';
import { normalizeTitle, hasTitleOverlap, isStrictSafeEntity } from '@/lib/data/entities/entity-utils';
import type { TitleEntity } from '@/lib/types/entity';
import { getDb } from '@/lib/data/d1/db';
import { toEntities } from '@/lib/data/d1/related';
import type { TitleRow } from '@/lib/data/d1/title-route';

/**
 * 搜索结果上方的作品卡片（知识面板）：只查本站片库（D1）。
 * 先按规范化片名精确匹配，没有再按片名前缀；同名多部时按「有 TMDB、热度、年份接近」排序。
 * 不再去 TMDB 现场建档（以前每次搜索都可能发新编号写 KV，片库外的作品由入库 Worker 统一建档）。
 */
const LIMIT = 6;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim() ?? '';
  const year = Number(searchParams.get('year')?.trim()) || 0;
  const empty = () => NextResponse.json({ entities: [], entity: null }, { headers: { 'Cache-Control': 'public, max-age=600, s-maxage=1800' } });

  const key = normalizeTitle(query);
  const db = getDb();
  if (!key || !db) return empty();

  try {
    const order = `(tmdb_id IS NOT NULL) DESC, ${year ? `abs(coalesce(year, 0) - ${year}) ASC,` : ''} coalesce(popularity, hot, 0) DESC, id`;
    let rows = (await db.prepare(`SELECT * FROM titles WHERE state = 'live' AND name_key = ? ORDER BY ${order} LIMIT ${LIMIT}`).bind(key).all<TitleRow>()).results;
    if (!rows.length && key.length >= 2) {
      // 前缀：name_key 在 [key, key + U+FFFF) 区间内，走 name_key 索引
      rows = (
        await db
          .prepare(`SELECT * FROM titles WHERE state = 'live' AND name_key >= ? AND name_key < ? ORDER BY ${order} LIMIT ${LIMIT}`)
          .bind(key, `${key}￿`)
          .all<TitleRow>()
      ).results;
    }
    const entities: TitleEntity[] = (await toEntities(db, rows)).filter(
      (e) => isStrictSafeEntity(e).safe && (hasTitleOverlap(query, e.title) || (e.originalTitle && hasTitleOverlap(query, e.originalTitle))),
    );
    if (!entities.length) return empty();
    return NextResponse.json(
      { entities, entity: entities[0] },
      { headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800' } },
    );
  } catch (error) {
    console.error('[entity-search]', error);
    return empty();
  }
}
