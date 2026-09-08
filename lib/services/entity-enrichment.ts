import { TitleEntity } from '@/lib/types/entity';
import { generateSlug, formatEntityId, normalizeTitle } from '@/lib/data/entities/entity-utils';
import { getEntityByTitle, getEntityByTmdb, getNextEntitySeq, saveEntity } from '@/lib/services/entity-kv';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

interface TMDBDetailResponse {
  id: number;
  title?: string;
  name?: string;
  original_title?: string;
  original_name?: string;
  overview?: string;
  poster_path?: string;
  backdrop_path?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genres?: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  credits?: {
    cast?: { name: string; character?: string; order: number }[];
    crew?: { name: string; job: string }[];
  };
  keywords?: {
    keywords?: { id: number; name: string }[];
    results?: { id: number; name: string }[];
  };
}

/**
 * 清理标题中的杂质提高 TMDB 命中率
 */
function sanitizeSearchTitle(title: string): string {
  return title
    .replace(/\s*第[一二三四五六七八九十\d]+季/, '')
    .replace(/\s*[Ss](?:eason)?\s*\d+/i, '')
    .replace(/\s*[（(][^)）]*[)）]/g, '')
    .replace(/\s*(?:更新至|全)\d+集?/, '')
    .trim();
}

/**
 * 根据 TMDB ID 拉取完整中文化元数据
 */
export async function fetchTMDBDetails(
  tmdbId: string | number,
  type: 'movie' | 'tv',
  apiKey = TMDB_API_KEY
): Promise<TMDBDetailResponse | null> {
  if (!apiKey || !tmdbId) return null;

  try {
    const url = `${TMDB_BASE}/${type}/${tmdbId}?api_key=${apiKey}&language=zh-CN&append_to_response=credits,keywords`;
    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 * 7 }, // 7天缓存
    });

    if (!res.ok) return null;
    return (await res.json()) as TMDBDetailResponse;
  } catch (err) {
    console.warn(`[TMDB fetch error] id=${tmdbId}:`, err);
    return null;
  }
}

/**
 * 根据影片名称在 TMDB 搜索并抓取最匹配条目的完整详情
 */
export async function searchAndEnrichFromTMDB(
  title: string,
  preferredType: 'movie' | 'tv' = 'movie',
  year?: string
): Promise<TitleEntity | null> {
  if (!title) return null;

  // 1. 先检查本地或 KV 是否已经收录
  const existing = await getEntityByTitle(title);
  if (existing) return existing;

  if (!TMDB_API_KEY) return null;

  const cleanQuery = sanitizeSearchTitle(title);
  const searchEndpoints = preferredType === 'tv'
    ? ['search/tv', 'search/movie']
    : ['search/movie', 'search/tv'];

  for (const ep of searchEndpoints) {
    const actualType: 'movie' | 'tv' = ep.includes('tv') ? 'tv' : 'movie';
    let searchUrl = `${TMDB_BASE}/${ep}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanQuery)}`;
    if (year) {
      const y = year.match(/\d{4}/)?.[0];
      if (y) {
        searchUrl += actualType === 'movie' ? `&year=${y}` : `&first_air_date_year=${y}`;
      }
    }

    try {
      const sRes = await fetch(searchUrl, { headers: { Accept: 'application/json' } });
      if (!sRes.ok) continue;

      const sData = await sRes.json();
      const firstHit = sData.results?.[0];
      if (!firstHit || !firstHit.id) continue;

      // 检查该 TMDB ID 是否已被别的别名收录
      const existByTmdb = await getEntityByTmdb(actualType, String(firstHit.id));
      if (existByTmdb) return existByTmdb;

      // 拉取深度元数据
      const detail = await fetchTMDBDetails(firstHit.id, actualType, TMDB_API_KEY);
      if (!detail) continue;

      // 生成新实体
      const nextSeq = await getNextEntitySeq();
      const entityId = formatEntityId(nextSeq);
      const mainTitle = detail.title || detail.name || title;
      const slug = generateSlug(mainTitle);

      const directors: string[] = [];
      const actors: string[] = [];

      if (detail.credits?.crew) {
        for (const c of detail.credits.crew) {
          if (c.job === 'Director' && !directors.includes(c.name)) {
            directors.push(c.name);
          }
        }
      }

      if (detail.credits?.cast) {
        for (const c of detail.credits.cast.slice(0, 5)) {
          if (c.name && !actors.includes(c.name)) {
            actors.push(c.name);
          }
        }
      }

      const releaseYear = (detail.release_date || detail.first_air_date || year || '2024').slice(0, 4);
      const genres = (detail.genres || []).map(g => g.name).filter(Boolean);

      const rawKeywords = detail.keywords?.keywords || detail.keywords?.results || [];
      const keywords = rawKeywords.map(k => k.name).filter(Boolean).slice(0, 10);

      const entity: TitleEntity = {
        entityId,
        slug,
        tmdbId: String(detail.id),
        tmdbType: actualType,
        title: mainTitle,
        originalTitle: detail.original_title || detail.original_name,
        type: actualType,
        year: releaseYear,
        description: detail.overview || `${mainTitle} 在线观看，支持海外华人免翻墙极速高清播放。`,
        cover: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : '',
        backdrop: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : '',
        rate: detail.vote_average ? detail.vote_average.toFixed(1) : '8.5',
        genres: genres.length > 0 ? genres : [actualType === 'movie' ? '电影' : '电视剧'],
        directors: directors.length > 0 ? directors : ['知名导演'],
        actors: actors.length > 0 ? actors : ['实力主演'],
        runtime: detail.runtime,
        numberOfSeasons: detail.number_of_seasons,
        numberOfEpisodes: detail.number_of_episodes,
        keywords,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // 存入 KV 索引系统
      await saveEntity(entity);
      return entity;
    } catch (e) {
      console.warn(`[Enrich search fail] title=${title}:`, e);
    }
  }

  return null;
}
