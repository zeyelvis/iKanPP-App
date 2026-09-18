import { NextResponse } from 'next/server';
import { getEntityByTmdb, getNextEntitySeq, saveEntity } from '@/lib/services/entity-kv';
import { fetchTMDBDetails } from '@/lib/services/entity-enrichment';
import { formatEntityId, generateSlug } from '@/lib/data/entities/entity-utils';
import { TitleEntity } from '@/lib/types/entity';
import { batchPublishGoogleIndexing } from '@/lib/services/google-indexing';

export const runtime = 'edge';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const CRON_SECRET = process.env.CRON_SECRET || 'ikanpp-cron-sync-secret';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

interface TMDBChangeItem {
  id: number;
  adult?: boolean;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret') || request.headers.get('x-cron-secret');

  if (secret !== CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // 计算今日日期 YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const startDate = searchParams.get('start_date') || today;
  const endDate = searchParams.get('end_date') || today;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const maxToProcess = parseInt(searchParams.get('limit') || '25', 10);

  const candidateList: { id: number; type: 'movie' | 'tv' }[] = [];

  // 并发拉取电影与电视剧最新变动
  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${TMDB_BASE}/movie/changes?api_key=${TMDB_API_KEY}&start_date=${startDate}&end_date=${endDate}&page=${page}`),
      fetch(`${TMDB_BASE}/tv/changes?api_key=${TMDB_API_KEY}&start_date=${startDate}&end_date=${endDate}&page=${page}`),
    ]);

    if (movieRes.ok) {
      const movieData = await movieRes.json();
      const results: TMDBChangeItem[] = movieData.results || [];
      for (const item of results) {
        if (item.adult) continue;
        candidateList.push({ id: item.id, type: 'movie' });
      }
    }

    if (tvRes.ok) {
      const tvData = await tvRes.json();
      const results: TMDBChangeItem[] = tvData.results || [];
      for (const item of results) {
        if (item.adult) continue;
        candidateList.push({ id: item.id, type: 'tv' });
      }
    }
  } catch (err) {
    console.warn('[TMDB-Changes] 获取 TMDB Changes 列表失败:', err);
    return NextResponse.json({ error: 'Failed to fetch changes from TMDB' }, { status: 502 });
  }

  let newlyAdded = 0;
  const newUrls: string[] = [];
  const processedItems: Array<{ id: number; type: string; title: string; entityId: string }> = [];

  // 逐条筛选过滤与入库
  for (const candidate of candidateList) {
    if (newlyAdded >= maxToProcess) break;

    try {
      const tmdbIdStr = String(candidate.id);
      // 1. 0ms KV 排重：已存在条目立即跳过
      const existing = await getEntityByTmdb(candidate.type, tmdbIdStr);
      if (existing) continue;

      // 2. 拉取权威中文化元数据
      const detail = await fetchTMDBDetails(candidate.id, candidate.type, TMDB_API_KEY);
      if (!detail) continue;

      const mainTitle = (detail.title || detail.name || '').trim();
      const originalTitle = (detail.original_title || detail.original_name || '').trim();

      // 3. 严格质量与内容安全铁律（双轨隔离：主站绝不允许任何成人低俗与小语种垃圾条目）：
      if (!mainTitle) continue;

      // A. 成人低俗违禁词物理阻断
      const ADULT_WORDS = ['売春', '愛汁', '肉しびれ', '女囚', '痴情', '痴漢', '快辱', '熟女', '巨乳', '乱交', '調教', '無修正', '盗撮', '近親', '色情', '三级', '情色', 'AV', '成人', 'ポルノ', 'エロ'];
      if (ADULT_WORDS.some(w => mainTitle.includes(w) || (originalTitle && originalTitle.includes(w)) || (detail.overview && detail.overview.includes(w)))) {
        continue;
      }

      // B. 排除日文假名（平假名/片假名）未汉化地下条目
      if (/[\u3040-\u309f\u30a0-\u30ff]/.test(mainTitle)) {
        continue;
      }

      // C. 必须具有至少 2 个正规中文字符
      const chineseMatches = mainTitle.match(/[\u4e00-\u9fa5]/g);
      if (!chineseMatches || chineseMatches.length < 2) continue;

      // D. 必须具有高清海报与充实剧情简介，杜绝空白或过短占位
      if (!detail.poster_path || !detail.overview || detail.overview.trim().length < 15) continue;

      // E. 严格大众热度与评分门槛：评分低于 4.5 或评价人数极少者坚决不收录，杜绝 2.0 分低俗产物
      if ((detail.vote_average && detail.vote_average < 4.5) || (detail.vote_count && detail.vote_count < 30)) {
        continue;
      }

      // F. 历史老片（早于 2020 年）必须具有至少 100 人评价，无热度老片直接跳过
      const releaseYearStr = (detail.release_date || detail.first_air_date || '').slice(0, 4);
      const parsedYear = releaseYearStr ? parseInt(releaseYearStr, 10) : null;
      if (parsedYear && parsedYear < 2020 && (!detail.vote_count || detail.vote_count < 100)) {
        continue;
      }

      const displayTitle = mainTitle;
      const nextSeq = await getNextEntitySeq();
      const entityId = formatEntityId(nextSeq);
      const slug = generateSlug(displayTitle);

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

      const releaseYear = (detail.release_date || detail.first_air_date || today).slice(0, 4);
      const genres = (detail.genres || []).map(g => g.name).filter(Boolean);
      const rawKeywords = detail.keywords?.keywords || detail.keywords?.results || [];
      const keywords = rawKeywords.map(k => k.name).filter(Boolean).slice(0, 10);

      const entity: TitleEntity = {
        entityId,
        slug,
        tmdbId: tmdbIdStr,
        tmdbType: candidate.type,
        title: displayTitle,
        originalTitle,
        type: candidate.type,
        year: releaseYear,
        description: detail.overview || `${displayTitle} 在线观看，支持海外华人免翻墙极速高清播放。`,
        cover: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : '',
        backdrop: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : '',
        rate: detail.vote_average ? detail.vote_average.toFixed(1) : '8.5',
        genres: genres.length > 0 ? genres : [candidate.type === 'movie' ? '电影' : '电视剧'],
        directors: directors.filter(d => d && d !== '知名导演'),
        actors: actors.filter(a => a && a !== '实力主演'),
        runtime: detail.runtime,
        numberOfSeasons: detail.number_of_seasons,
        numberOfEpisodes: detail.number_of_episodes,
        keywords,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await saveEntity(entity);
      newlyAdded++;
      const fullUrl = `${BASE_URL}/title/${entityId}-${slug}`;
      newUrls.push(fullUrl);
      processedItems.push({
        id: candidate.id,
        type: candidate.type,
        title: displayTitle,
        entityId,
      });
    } catch (err) {
      console.warn(`[TMDB-Changes] 处理 ID=${candidate.id} 异常:`, err);
    }
  }

  // 若有新实体入库，立即触发 IndexNow 与 Google Indexing 推送
  if (newUrls.length > 0) {
    try {
      // 1. IndexNow (Bing / Yandex)
      fetch(`${BASE_URL}/api/seo/indexnow`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: newUrls }),
      }).catch(() => {});

      // 2. Google Indexing API
      batchPublishGoogleIndexing(newUrls, 30).catch(() => {});

      // 3. Bing Sitemap Ping
      const sitemapUrl = encodeURIComponent(`${BASE_URL}/sitemap.xml`);
      fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`).catch(() => {});
    } catch {
      // 忽略异步异常
    }
  }

  return NextResponse.json({
    success: true,
    date: startDate,
    totalChangesFound: candidateList.length,
    newlyAdded,
    items: processedItems,
    pushedUrls: newUrls,
  });
}
