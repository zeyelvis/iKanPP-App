import { NextResponse } from 'next/server';
import { getEntityByTmdb, getNextEntitySeq, saveEntity } from '@/lib/services/entity-kv';
import { fetchTMDBDetails } from '@/lib/services/entity-enrichment';
import { formatEntityId, generateSlug, isCleanChineseTitle } from '@/lib/data/entities/entity-utils';
import { TitleEntity } from '@/lib/types/entity';
import { isJuliangExcludedCategory } from '@/lib/api/juliang-category-map';
import { batchPublishGoogleIndexing } from '@/lib/services/google-indexing';

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

/**
 * 计算实体的 SEO 质量评分 (0-100)
 * 评分门禁标准：
 * 1. 剧情描述丰富度（≥80字高质量描述 +25分，≥30字 +15分）
 * 2. 高清海报 (+20分) 与 剧照背景图 (+10分)
 * 3. 真实演职人员 (+15分)
 * 4. 细分流派/分类 (+10分)
 * 5. 有效评分 (+10分)
 * 6. 标签与长尾关键词 (+10分)
 */
export function calculateSeoScore(entity: TitleEntity): number {
  let score = 0;
  const desc = entity.description || '';
  if (desc.length >= 80 && !desc.includes('在线观看，全网高清影视资源')) {
    score += 25;
  } else if (desc.length >= 30) {
    score += 15;
  }

  if (entity.cover && !entity.cover.includes('default')) {
    score += 20;
  }
  if (entity.backdrop) {
    score += 10;
  }

  const validDirectors = (entity.directors || []).filter(d => d && d !== '知名导演');
  const validActors = (entity.actors || []).filter(a => a && a !== '实力主演');
  if (validDirectors.length > 0 || validActors.length > 0) {
    score += 15;
  }

  if (entity.genres && entity.genres.length > 0) {
    score += 10;
  }

  if (entity.rate && entity.rate !== '0' && entity.rate !== '0.0') {
    score += 10;
  }

  if (entity.keywords && entity.keywords.length >= 3) {
    score += 10;
  }

  return Math.min(score, 100);
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
      if (!mainTitle || !isCleanChineseTitle(mainTitle)) continue;

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
        directors: directors.filter(d => d && d !== '知名导演'),
        actors: actors.filter(a => a && a !== '实力主演'),
        runtime: detail.runtime,
        numberOfSeasons: detail.number_of_seasons,
        numberOfEpisodes: detail.number_of_episodes,
        keywords,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      entity.seoScore = calculateSeoScore(entity);

      await saveEntity(entity);
      newAddedCount++;

      // 质量门禁：只有评分 ≥ 60 的高质量实体才进入搜索引擎即时主动推送池
      if ((entity.seoScore ?? 0) >= 60) {
        newUrls.push(`${BASE_URL}/title/${entityId}-${slug}`);
      } else {
        console.log(`[EntityPipeline] 实体 ${entity.title} (${entity.entityId}) SEO评分未达标(${entity.seoScore}/60)，跳过即时推送`);
      }
    } catch (err) {
      console.warn('[Pipeline item error]:', err);
    }
  }

  // 增量融合：巨量短剧专线高热实体收录
  try {
    const jlRes = await fetch('https://api.juliang.live/api/provide/vod/?ac=detail&t=5&pg=1', {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (jlRes.ok) {
      const jlData = await jlRes.json();
      if (jlData && Array.isArray(jlData.list)) {
        for (const it of jlData.list.slice(0, 15)) {
          if (isJuliangExcludedCategory(Number(it.type_id), it.type_name)) continue;
          const title = it.vod_name?.replace(/[（(][^）)]*[）)]/g, '').trim();
          if (!title) continue;

          const tmdbPseudoId = `jl_${it.vod_id}`;
          const existing = await getEntityByTmdb('tv', tmdbPseudoId);
          if (existing) continue;

          const slug = generateSlug(title);
          const nextSeq = await getNextEntitySeq();
          const entityId = formatEntityId(nextSeq);
          const totalEp = it.vod_remarks?.match(/\d+/)?.[0] || '80';

          const entity: TitleEntity = {
            entityId,
            slug,
            tmdbId: tmdbPseudoId,
            tmdbType: 'tv',
            title,
            originalTitle: title,
            type: 'tv',
            year: String(it.vod_year || '2026'),
            description: it.vod_content ? it.vod_content.replace(/<[^>]+>/g, '').trim().slice(0, 200) : `${title} 短剧全集高清在线播放。`,
            cover: it.vod_pic || '',
            backdrop: it.vod_pic || '',
            rate: '8.5',
            genres: ['短剧', '微短剧', it.type_name || '爽剧'],
            directors: [],
            actors: it.vod_actor ? it.vod_actor.split(',').map((s: string) => s.trim()).filter(Boolean) : [],
            numberOfEpisodes: parseInt(totalEp, 10),
            keywords: ['短剧', '微短剧', title, '爽剧', '全集播放'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          entity.seoScore = calculateSeoScore(entity);

          await saveEntity(entity);
          newAddedCount++;
          if ((entity.seoScore ?? 0) >= 60) {
            newUrls.push(`${BASE_URL}/title/${entityId}-${slug}`);
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Pipeline short drama error]:', err);
  }

  // 若有新入库实体，异步触发 IndexNow (Bing / Yandex) 与 Google Indexing API 实时推送
  if (newUrls.length > 0) {
    try {
      // 1. 广播至 IndexNow (Bing / Yandex 等)
      fetch(`${BASE_URL}/api/seo/indexnow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: newUrls }),
      }).catch(() => {});

      // 2. 实时推送至 Google Indexing API（替代已废弃的 google.com/ping）
      batchPublishGoogleIndexing(newUrls, 50).catch(err => {
        console.warn('[Pipeline GoogleIndexing Error]:', err);
      });

      // 3. 通知 Bing 重新抓取 Sitemap（Bing 依然有效支持 Sitemap Ping）
      const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
      fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`).catch(() => {});
    } catch {
      // 忽略推送静默异常
    }
  }

  console.log(`[EntityPipeline] Processed ${candidateItems.length} candidates, successfully saved ${newAddedCount} new entities.`);

  return NextResponse.json({
    success: true,
    candidatesProcessed: candidateItems.length,
    newAdded: newAddedCount,
    newUrls,
    sitemapUrl: `${BASE_URL}/sitemap.xml`,
    feedUrl: `${BASE_URL}/feed.xml`,
  });
}

