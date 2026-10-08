/**
 * D1 titles 行 ↔ 旧站的 TitleEntity（重构阶段 3）。新站页面组件沿用 TitleEntity，数据改从 D1 读。
 * 导入时 KV 记录里表结构之外的字段原样存进 extra（JSON），这里展开回去，保证页面拿到的字段与旧站一致。
 */
import type { TitleAiContent, TitleEntity } from '@/lib/types/entity';
import { canonicalPathOf, entityCode, type D1Like, type TitleRow } from './title-route';

const list = (v: unknown): string[] => {
  if (typeof v !== 'string' || !v) return [];
  try {
    const parsed = JSON.parse(v);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const object = <T>(v: unknown): T | undefined => {
  if (typeof v !== 'string' || !v) return undefined;
  try {
    return JSON.parse(v) as T;
  } catch {
    return undefined;
  }
};

const str = (v: unknown) => (v == null ? undefined : String(v));
const n = (v: unknown) => (v == null || v === '' ? undefined : Number(v));

/** 评分沿用旧站的字符串格式（一位小数）；没有评分时为空串，不写默认值（AGENTS 准则 19.1）。 */
const rate = (v: unknown) => (v == null || v === '' ? '' : Number(v).toFixed(1));

export function rowToEntity(row: TitleRow, canonicalSlug: string): TitleEntity {
  const extra = object<Record<string, unknown>>(row.extra) ?? {};
  const code = entityCode(row.id);
  const kind = str(row.kind) ?? 'movie';
  return {
    ...extra,
    entityId: code,
    slug: canonicalSlug.replace(/^ik\d{6}-/i, ''),
    canonicalSlug,
    tmdbId: str(row.tmdb_id) ?? '',
    tmdbType: (row.tmdb_type === 'tv' || row.tmdb_type === 'movie' ? row.tmdb_type : kind === 'movie' ? 'movie' : 'tv') as 'movie' | 'tv',
    doubanId: str(row.douban_id),
    imdbId: str(row.imdb_id),
    title: str(row.name) ?? '',
    originalTitle: str(row.original_name),
    type: kind,
    year: row.year ? String(row.year) : '',
    description: str(row.overview) ?? '',
    cover: str(row.poster) ?? '',
    backdrop: str(row.backdrop),
    rate: rate(row.rating),
    score: rate(row.rating) || undefined,
    genres: list(row.genres),
    directors: list(row.directors),
    actors: list(row.actors),
    region: str(row.region),
    language: str(row.language),
    status: str(row.status_label),
    popularity: n(row.popularity),
    hot: n(row.hot),
    runtime: n(row.runtime),
    numberOfSeasons: n(row.seasons),
    numberOfEpisodes: n(row.episodes),
    keywords: list(row.keywords),
    aliases: list(row.aliases),
    aiContent: object<TitleAiContent>(row.ai_content),
    createdAt: str(row.created_at) ?? '',
    updatedAt: str(row.updated_at) ?? '',
  } as TitleEntity;
}

/** 按编号取 live 作品（merged 顺着走到规范编号；removed 返回 null）。 */
export async function getTitleEntity(db: D1Like, id: number): Promise<TitleEntity | null> {
  let row = await db.prepare('SELECT * FROM titles WHERE id = ?').bind(id).first<TitleRow>();
  for (let hop = 0; row && row.state === 'merged' && row.merged_into && hop < 5; hop++) {
    row = await db.prepare('SELECT * FROM titles WHERE id = ?').bind(row.merged_into).first<TitleRow>();
  }
  if (!row || row.state !== 'live') return null;
  const path = await canonicalPathOf(db, row.id);
  return rowToEntity(row, path.slice('/title/'.length));
}
