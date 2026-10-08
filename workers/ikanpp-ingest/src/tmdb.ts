/** TMDB 中文资料：按编号取详情，或按片名搜索（搜不到时去掉副标题再搜一次）。 */
import { hasTitleOverlap } from '../../../lib/data/entities/entity-utils';

const BASE = 'https://api.themoviedb.org/3';

export interface TmdbBrief {
  tmdbId: string;
  tmdbType: 'movie' | 'tv';
  title: string;
  overview: string;
  poster: string;
  backdrop: string;
  rate: string;
  year: string;
}

function brief(match: Record<string, any>, tmdbType: 'movie' | 'tv'): TmdbBrief {
  return {
    tmdbId: String(match.id),
    tmdbType,
    title: match.title || match.name || '',
    overview: match.overview || '',
    poster: match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : '',
    backdrop: match.backdrop_path ? `https://image.tmdb.org/t/p/w1280${match.backdrop_path}` : '',
    // 没有评分就留空，不写默认值（AGENTS 准则 19.1）。
    rate: match.vote_average > 0 ? Number(match.vote_average).toFixed(1) : '',
    year: (match.release_date || match.first_air_date || '').slice(0, 4),
  };
}

async function get(key: string, path: string): Promise<any | null> {
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${BASE}${path}${sep}api_key=${key}&language=zh-CN`, { signal: AbortSignal.timeout(8000) }).catch(() => null);
  return res?.ok ? res.json() : null;
}

export async function tmdbById(key: string, id: number, type: 'movie' | 'tv'): Promise<TmdbBrief | null> {
  const match = await get(key, `/${type}/${id}`);
  return match ? brief(match, type) : null;
}

export async function tmdbSearch(key: string, query: string, type: 'movie' | 'tv'): Promise<TmdbBrief | null> {
  const data = await get(key, `/search/${type}?query=${encodeURIComponent(query)}`);
  const match = data?.results?.[0];
  if (match) return brief(match, type);
  const shorter = query.split(/[:：\s]/)[0].trim();
  return shorter && shorter !== query ? tmdbSearch(key, shorter, type) : null;
}

const yearOf = (r: Record<string, any>) => Number((r.release_date || r.first_air_date || '').slice(0, 4)) || 0;

/**
 * 新片用的搜索：结果片名必须与原片名对得上（hasTitleOverlap），给了年份时年份差不能超过 1，
 * 宁可不配也不张冠李戴。有年份时，整名搜不到再用主标题（冒号前）搜一次；没有年份不做这一步，
 * 免得短母题吞掉带副标题的新片（AGENTS 准则 16）。
 */
export async function tmdbSearchStrict(key: string, query: string, type: 'movie' | 'tv', year?: number): Promise<TmdbBrief | null> {
  const main = query.split(/[:：·\s]/)[0].trim();
  const queries = year && main.length >= 2 && main !== query ? [query, main] : [query];
  for (const q of queries) {
    const data = await get(key, `/search/${type}?query=${encodeURIComponent(q)}`);
    const results: Record<string, any>[] = data?.results ?? [];
    const fits = results.filter((r) => hasTitleOverlap(query, r.title || r.name || ''));
    const near = year ? fits.filter((r) => yearOf(r) && Math.abs(yearOf(r) - year) <= 1) : fits;
    const match = near.find((r) => (r.title || r.name) === query) ?? near[0];
    if (match) return brief(match, type);
  }
  return null;
}
