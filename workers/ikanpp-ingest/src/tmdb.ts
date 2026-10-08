/** TMDB 中文资料：按编号取详情，或按片名搜索（搜不到时去掉副标题再搜一次）。 */
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
