import { NextResponse } from 'next/server';
import { getEntityByTmdb, getNextEntitySeq, saveEntity } from '@/lib/services/entity-kv';
import { fetchTMDBDetails } from '@/lib/services/entity-enrichment';
import { formatEntityId, generateSlug } from '@/lib/data/entities/entity-utils';
import { TitleEntity } from '@/lib/types/entity';

export const runtime = 'edge';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const CRON_SECRET = process.env.CRON_SECRET || 'ikanpp-cron-sync-secret';

interface TrendingItem {
  id: number;
  media_type?: 'movie' | 'tv';
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
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || request.headers.get('x-cron-secret');

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!TMDB_API_KEY) {
    return NextResponse.json({ error: 'TMDB_API_KEY not configured' }, { status: 500 });
  }

  const endpoints = [
    `${TMDB_BASE}/trending/movie/day?api_key=${TMDB_API_KEY}&language=zh-CN`,
    `${TMDB_BASE}/trending/tv/day?api_key=${TMDB_API_KEY}&language=zh-CN`,
    `${TMDB_BASE}/movie/now_playing?api_key=${TMDB_API_KEY}&language=zh-CN&page=1`,
    `${TMDB_BASE}/tv/airing_today?api_key=${TMDB_API_KEY}&language=zh-CN&page=1`,
  ];

  const candidateItems: { item: TrendingItem; type: 'movie' | 'tv' }[] = [];

  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, { headers: { Accept: 'application/json' } });
      if (!res.ok) continue;
      const data = await res.json();
      const results: TrendingItem[] = data.results || [];
      const defaultType: 'movie' | 'tv' = ep.includes('/tv') ? 'tv' : 'movie';

      for (const r of results) {
        if (!r || !r.id) continue;
        const type = r.media_type === 'tv' || defaultType === 'tv' ? 'tv' : 'movie';
        candidateItems.push({ item: r, type });
      }
    } catch (e) {
      console.warn('[Pipeline fetch error]:', e);
    }
  }

  let newAddedCount = 0;
  const newUrls: string[] = [];
  const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

  for (const { item, type } of candidateItems) {
    try {
      const tmdbIdStr = String(item.id);
      const existing = await getEntityByTmdb(type, tmdbIdStr);
      if (existing) continue;

      // 获取完整 credits 等元数据
      const detail = await fetchTMDBDetails(item.id, type, TMDB_API_KEY);
      if (!detail) continue;

      const mainTitle = detail.title || detail.name || item.title || item.name;
      if (!mainTitle) continue;

      const nextSeq = await getNextEntitySeq();
      const entityId = formatEntityId(nextSeq);
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

      const releaseYear = (detail.release_date || detail.first_air_date || '2024').slice(0, 4);
      const genres = (detail.genres || []).map(g => g.name).filter(Boolean);
      const rawKeywords = detail.keywords?.keywords || detail.keywords?.results || [];
      const keywords = rawKeywords.map(k => k.name).filter(Boolean).slice(0, 10);

      const entity: TitleEntity = {
        entityId,
        slug,
        tmdbId: tmdbIdStr,
        tmdbType: type,
        title: mainTitle,
        originalTitle: detail.original_title || detail.original_name,
        type,
        year: releaseYear,
        description: detail.overview || `${mainTitle} 在线观看，支持海外华人免翻墙极速高清播放。`,
        cover: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : '',
        backdrop: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : '',
        rate: detail.vote_average ? detail.vote_average.toFixed(1) : '8.5',
        genres: genres.length > 0 ? genres : [type === 'movie' ? '电影' : '电视剧'],
        directors: directors.length > 0 ? directors : ['知名导演'],
        actors: actors.length > 0 ? actors : ['实力主演'],
        runtime: detail.runtime,
        numberOfSeasons: detail.number_of_seasons,
        numberOfEpisodes: detail.number_of_episodes,
        keywords,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveEntity(entity);
      newAddedCount++;
      newUrls.push(`${BASE_URL}/title/${entityId}-${slug}`);
    } catch (err) {
      console.warn('[Pipeline item error]:', err);
    }
  }

  // 若有新入库实体，异步触发 IndexNow 推送 Bing / Yandex
  if (newUrls.length > 0) {
    try {
      fetch(`${BASE_URL}/api/seo/indexnow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: newUrls }),
      }).catch(() => {});
    } catch {
      // 忽略推送静默异常
    }
  }

  return NextResponse.json({
    success: true,
    candidatesProcessed: candidateItems.length,
    newAdded: newAddedCount,
    newUrls,
  });
}
