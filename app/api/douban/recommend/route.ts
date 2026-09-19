import { NextResponse } from 'next/server';
import { GUOMAN_DATASET } from '@/lib/data/guoman-data';
import { DOCUMENTARY_DATASET } from '@/lib/data/documentary-data';

export const runtime = 'edge';

// 豆瓣电影合法核心标签
const VALID_MOVIE_TAGS = new Set([
  '热门', '最新', '经典', '可播放', '豆瓣高分', '冷门佳片',
  '华语', '欧美', '韩国', '日本', '动作', '喜剧', '爱情', '科幻', '悬疑', '恐怖', '动画'
]);

// 豆瓣电视剧合法核心标签
const VALID_TV_TAGS = new Set([
  '热门', '国产剧', '美剧', '英剧', '韩剧', '日剧', '港剧', '日本动画', '国产动画', '综艺', '纪录片'
]);

import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { VARIETY_HOME_DATA, ANIME_HOME_DATA } from '@/lib/data/home-prebaked-extra';

/**
 * 抓取豆瓣 API 结果（带 2500ms 快速超时熔断，防止海外边缘节点跨国请求卡死）
 */
async function fetchDoubanSubjects(type: string, tag: string, pageLimit: number, pageStart: number): Promise<any[]> {
  try {
    const url = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURIComponent(tag)}&sort=recommend&page_limit=${pageLimit}&page_start=${pageStart}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://movie.douban.com/',
        'Accept': 'application/json, text/plain, */*',
      },
      signal: AbortSignal.timeout(2500), // 2500ms 快速超时熔断，防止海外边缘节点跨国请求卡死
      next: { revalidate: 86400 }, // 24 小时强效边缘缓存
    });

    if (!response.ok) return [];
    const data = await response.json();
    if (data && Array.isArray(data.subjects) && data.subjects.length > 0) {
      return data.subjects.map((item: any) => ({
        ...item,
        cover: item.cover,
      }));
    }
    return [];
  } catch (err) {
    console.warn(`[Douban-API] Timeout or error for tag "${tag}", triggering instant prebaked fallback:`, (err as any)?.message || err);
    // 若请求纪录片发生超时熔断，返回纯净纪录片神作兜底，绝不返回普通商业电影
    if (tag === '纪录片') {
      return DOCUMENTARY_DATASET.slice(pageStart, pageStart + pageLimit).map((item: any) => ({
        ...item,
        cover: item.cover?.startsWith('http') ? `/api/img-proxy?url=${encodeURIComponent(item.cover)}` : item.cover,
      }));
    }
    // 🌟 若请求综艺发生超时熔断，返回纯净综艺节目兜底，绝不允许返回普通电视剧（绝命毒师等）
    if (tag === '综艺' || tag === '脱口秀' || tag === '音乐') {
      const vList = [...VARIETY_HOME_DATA.s1, ...VARIETY_HOME_DATA.s2, ...VARIETY_HOME_DATA.s3, ...VARIETY_HOME_DATA.s4];
      return vList.slice(pageStart, pageStart + pageLimit).map((item: any) => ({
        ...item,
        cover: item.cover?.startsWith('http') ? `/api/img-proxy?url=${encodeURIComponent(item.cover)}` : item.cover,
      }));
    }
    // 🌟 若请求动漫发生超时熔断，返回纯净动漫神作兜底
    if (tag === '日本动画' || tag === '国产动画' || tag === '动漫' || tag === '新番') {
      const aList = tag === '国产动画' ? GUOMAN_DATASET : [...ANIME_HOME_DATA.s1, ...ANIME_HOME_DATA.s2, ...ANIME_HOME_DATA.s3, ...ANIME_HOME_DATA.s4];
      return aList.slice(pageStart, pageStart + pageLimit).map((item: any) => ({
        ...item,
        cover: item.cover?.startsWith('http') ? `/api/img-proxy?url=${encodeURIComponent(item.cover)}` : item.cover,
      }));
    }
    const prebaked = type === 'tv' ? PREBAKED_HOME_DATA.tv : PREBAKED_HOME_DATA.movie;
    const fallbackList = [...prebaked.s1, ...prebaked.s2, ...prebaked.s3, ...prebaked.s4];
    return fallbackList.slice(0, pageLimit).map((item: any) => ({
      ...item,
      cover: item.cover?.startsWith('http') ? `/api/img-proxy?url=${encodeURIComponent(item.cover)}` : item.cover,
    }));
  }
}

const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';

/**
 * 智能标题归一化工具（用于海内外多数据源去重合并）
 */
function normalizeFilmTitle(t: string): string {
  return (t || '')
    .replace(/[:：,\s，·•\-]/g, '')
    .replace(/\s*第[一二三四五六七八九十\d]+季/, '')
    .replace(/\s*[（(][^)）]*[)）]/g, '')
    .toLowerCase()
    .trim();
}

/**
 * 抓取 TMDB 全球趋势周榜与全球热映大片（覆盖好莱坞/海外已上映但大陆未引进的顶级爆款）
 */
async function fetchTMDBGlobalNowPlaying(): Promise<any[]> {
  if (!TMDB_API_KEY) return [];
  try {
    const urls = [
      `${TMDB_BASE}/trending/movie/week?api_key=${TMDB_API_KEY}&language=zh-CN`,
      `${TMDB_BASE}/movie/now_playing?api_key=${TMDB_API_KEY}&language=zh-CN&page=1`,
    ];

    const results = await Promise.allSettled(
      urls.map(url =>
        fetch(url, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(3000),
          next: { revalidate: 43200 },
        }).then(res => (res.ok ? res.json() : { results: [] }))
      )
    );

    const pool: any[] = [];
    const seen = new Set<string>();

    for (const r of results) {
      if (r.status === 'fulfilled' && Array.isArray(r.value?.results)) {
        for (const m of r.value.results) {
          if (!m || !m.title) continue;
          const key = normalizeFilmTitle(m.title);
          if (key && !seen.has(key)) {
            seen.add(key);
            pool.push({
              id: String(m.id),
              title: m.title,
              rate: m.vote_average && m.vote_average > 0 ? m.vote_average.toFixed(1) : '8.5',
              cover: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '',
              backdrop: m.backdrop_path ? `https://image.tmdb.org/t/p/w1280${m.backdrop_path}` : '',
              year: (m.release_date || '2026').slice(0, 4),
              region: '全球',
              votecount: m.vote_count || 10000,
              source: 'tmdb_global',
              playable: true,
              is_new: true,
            });
          }
        }
      }
    }
    return pool;
  } catch (err) {
    console.warn('[TMDB-Global] Error fetching global trending:', err);
    return [];
  }
}

/**
 * 抓取豆瓣官方全国院线正在热映列表（国内影院正在售票公映的热门华语大片）
 */
async function fetchDoubanDomesticNowPlaying(): Promise<any[]> {
  try {
    const url = 'https://movie.douban.com/cinema/nowplaying/beijing/';
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://movie.douban.com/',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(3000),
      next: { revalidate: 43200 },
    });

    if (!response.ok) return [];
    const html = await response.text();

    const liRegex = /<li\s+id="(\d+)"[\s\S]*?class="list-item[^"]*"[\s\S]*?data-title="([^"]+)"[\s\S]*?data-score="([^"]*)"[\s\S]*?data-release="([^"]*)"[\s\S]*?data-region="([^"]*)"[\s\S]*?data-director="([^"]*)"[\s\S]*?data-actors="([^"]*)"[\s\S]*?data-category="nowplaying"[\s\S]*?data-votecount="(\d*)"[\s\S]*?<img\s+src="([^"]+)"/g;

    let match;
    const allSubjects: any[] = [];
    const seenTitles = new Set<string>();

    while ((match = liRegex.exec(html)) !== null) {
      const title = match[2]?.trim();
      if (!title || seenTitles.has(title)) continue;
      seenTitles.add(title);

      const rawCover = match[9];
      const cover = rawCover || '';
      const year = match[4] || '2026';
      const votecount = parseInt(match[8] || '0', 10);

      allSubjects.push({
        id: match[1],
        title,
        rate: match[3] || '7.5',
        cover,
        year,
        region: match[5] || '华语',
        director: match[6] || '',
        actors: match[7] || '',
        votecount,
        source: 'douban_domestic',
        playable: true,
        is_new: true,
      });
    }

    return allSubjects;
  } catch (err) {
    console.warn('[Douban-Domestic] Error fetching now playing:', err);
    return [];
  }
}

/**
 * 🏆 海内外双轨融合引擎：国内院线排片 + TMDB 全球流行趋势智能合流
 * 彻底消除海内外上映时效鸿沟，海外火爆但国内未上映的大作全自动置顶
 */
async function fetchGlobalAndDomesticNowPlaying(pageLimit: number, pageStart: number): Promise<any[]> {
  try {
    const [tmdbGlobalList, doubanDomesticList] = await Promise.all([
      fetchTMDBGlobalNowPlaying(),
      fetchDoubanDomesticNowPlaying(),
    ]);

    // 智能筛选与时效加权（优先 2024-2026 新片，经典重映片后置）
    const isModern = (m: any) => parseInt(m.year || '2026', 10) >= 2024;
    const globalModern = tmdbGlobalList.filter(isModern);
    const domesticModern = doubanDomesticList.filter(isModern);
    const olderReleases = [
      ...doubanDomesticList.filter(m => !isModern(m)),
      ...tmdbGlobalList.filter(m => !isModern(m)),
    ];

    // 国内按观众评分票数排序
    domesticModern.sort((a, b) => b.votecount - a.votecount);
    olderReleases.sort((a, b) => b.votecount - a.votecount);

    const fused: any[] = [];
    const seen = new Set<string>();

    const addFilm = (item: any) => {
      if (!item || !item.title) return;
      const key = normalizeFilmTitle(item.title);
      if (key && !seen.has(key)) {
        seen.add(key);
        fused.push(item);
      }
    };

    // 交织排布加权策略：
    // 头部前列交替插入全球顶尖爆款与国内院线排片主力
    const maxLen = Math.max(globalModern.length, domesticModern.length);
    for (let i = 0; i < maxLen; i++) {
      if (i < globalModern.length) addFilm(globalModern[i]);
      if (i < domesticModern.length) addFilm(domesticModern[i]);
    }

    // 后续放入其他年份热片
    for (const m of olderReleases) {
      addFilm(m);
    }

    if (fused.length === 0) return [];
    return fused.slice(pageStart, pageStart + pageLimit);
  } catch (err) {
    console.warn('[Hybrid-Cinema-Engine] Error fusing now playing streams:', err);
    return [];
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const channel = (searchParams.get('channel') || '').trim();
  const genre = (searchParams.get('genre') || '').trim();
  const region = (searchParams.get('region') || '').trim();
  const year = (searchParams.get('year') || '').trim();
  const rawTag = (searchParams.get('tag') || '').trim();
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';

  if (!['movie', 'tv'].includes(type)) {
    return NextResponse.json({ subjects: [], error: 'Invalid type' }, { status: 400 });
  }

  const pageLimit = Math.min(Math.max(parseInt(searchParams.get('page_limit') || '36', 10) || 36, 1), 60);
  const pageStart = Math.max(parseInt(searchParams.get('page_start') || '0', 10) || 0, 0);

  // 0. 特殊处理：院线热映 / 院线热播 / 最新电影（直通豆瓣全国院线正在热映官方榜）
  const isNowPlayingMovie = type === 'movie' && (
    rawTag === '最新' ||
    rawTag === '院线' ||
    rawTag === '院线热播' ||
    rawTag === '热映' ||
    genre === '最新' ||
    genre === '院线热播'
  );

  if (isNowPlayingMovie) {
    const nowPlayingList = await fetchGlobalAndDomesticNowPlaying(pageLimit, pageStart);
    if (nowPlayingList && nowPlayingList.length > 0) {
      return NextResponse.json({
        subjects: nowPlayingList,
        tag: '院线热播',
        genre,
        region,
        year,
        total: nowPlayingList.length,
      }, {
        headers: {
          'Cache-Control': 'public, max-age=43200, s-maxage=43200, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'public, s-maxage=43200',
          'Cloudflare-CDN-Cache-Control': 'public, s-maxage=43200',
        },
      });
    }
    // 若抓取偶发为空，自动降级至预烘焙种子数据
    const prebaked = PREBAKED_HOME_DATA.movie.s1;
    return NextResponse.json({
      subjects: prebaked.slice(pageStart, pageStart + pageLimit),
      tag: '院线热播',
      genre,
      region,
      year,
      total: prebaked.length,
    });
  }

  // 0.1 特殊处理：国漫 / 国产动画（豆瓣官方 API 无此标签，必须走专属精选库）
  const isGuoman =
    rawTag === '国产动画' ||
    rawTag === '国漫' ||
    rawTag === '国创' ||
    genre === '国漫' ||
    genre === '国产动画' ||
    region === '国产动画' ||
    region === '国漫' ||
    region === '国创';

  if (isGuoman) {
    let list = [...GUOMAN_DATASET];

    // 如果指定了特定题材筛选（如：玄幻、科幻、热血、古风）
    if (genre && genre !== '国漫' && genre !== '国产动画') {
      list = list.filter(item => item.types?.some(t => t.includes(genre)));
    }
    // 如果指定了年份筛选
    if (year && !['国产动画', '全部'].includes(year)) {
      list = list.filter(item => item.year === year);
    }

    const paged = list.slice(pageStart, pageStart + pageLimit).map(item => ({
      ...item,
      cover: item.cover,
      playable: true,
      is_new: item.year === '2024' || item.year === '2025' || item.year === '2026',
    }));

    return NextResponse.json({
      subjects: paged,
      tag: '国产动画',
      genre,
      region,
      year,
      total: list.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=3600',
        'Cloudflare-CDN-Cache-Control': 'public, s-maxage=3600',
      },
    });
  }

  // 0.2 特殊处理：纪录片专区与细分题材精准路由 (100% 杜绝任何商业故事电影混入)
  const isDocumentary =
    rawTag === '纪录片' ||
    genre === '纪录片' ||
    (type === 'tv' && ['自然', '美食', '历史', '科学', '冒险', '社会', '地理', '海洋', '豆瓣高分'].includes(rawTag)) ||
    (type === 'tv' && ['自然', '美食', '历史', '科学', '冒险', '社会', '地理', '海洋', '豆瓣高分'].includes(genre));

  if (isDocumentary) {
    const targetTag = ['自然', '美食', '历史', '科学', '冒险', '社会', '地理', '海洋', '豆瓣高分'].includes(genre)
      ? genre
      : ['自然', '美食', '历史', '科学', '冒险', '社会', '地理', '海洋', '豆瓣高分'].includes(rawTag)
      ? rawTag
      : genre || '';

    // 1. 若请求具体细分题材货架（自然/历史/美食/科学/冒险/社会/豆瓣高分等）
    if (targetTag) {
      let filtered = targetTag === '豆瓣高分'
        ? DOCUMENTARY_DATASET.filter(item => parseFloat(item.rate || '0') >= 9.4)
        : DOCUMENTARY_DATASET.filter(item =>
            item.types?.some(t => t.includes(targetTag) || targetTag.includes(t))
          );
      if (year && year !== '经典高分') {
        filtered = filtered.filter(item => item.year === year);
      }
      if (filtered.length < 4) {
        const seen = new Set(filtered.map(f => f.title));
        for (const item of DOCUMENTARY_DATASET) {
          if (!seen.has(item.title)) {
            seen.add(item.title);
            filtered.push(item);
          }
        }
      }
      const paged = filtered.slice(pageStart, pageStart + pageLimit).map(item => ({
        ...item,
        cover: item.cover,
        playable: true,
      }));

      return NextResponse.json({
        subjects: paged,
        tag: targetTag,
        genre,
        region,
        year,
        total: filtered.length,
      }, {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'public, s-maxage=7200',
          'Cloudflare-CDN-Cache-Control': 'public, s-maxage=7200',
        },
      });
    }

    // 2. 若为全库底部分页网格（tag=纪录片），优先拉取豆瓣官方 type=tv&tag=纪录片
    try {
      const doubanDocs = await fetchDoubanSubjects('tv', '纪录片', pageLimit, pageStart);
      const finalSubjects = doubanDocs.length > 0 ? doubanDocs : DOCUMENTARY_DATASET.slice(pageStart, pageStart + pageLimit).map(item => ({
        ...item,
        cover: item.cover,
        playable: true,
      }));

      return NextResponse.json({
        subjects: finalSubjects,
        tag: '纪录片',
        genre,
        region,
        year,
        total: finalSubjects.length,
      }, {
        headers: {
          'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'public, s-maxage=7200',
          'Cloudflare-CDN-Cache-Control': 'public, s-maxage=7200',
        },
      });
    } catch {
      const fallbackList = DOCUMENTARY_DATASET.slice(pageStart, pageStart + pageLimit).map(item => ({
        ...item,
        cover: item.cover,
        playable: true,
      }));
      return NextResponse.json({
        subjects: fallbackList,
        tag: '纪录片',
        genre,
        region,
        year,
        total: fallbackList.length,
      });
    }
  }

  // 0.3 特殊处理：综艺专区与细分题材精准路由 (100% 杜绝美剧/电视剧跨界混入)
  const isVariety =
    channel === 'variety' ||
    rawTag === '综艺' ||
    genre === '综艺' ||
    ['脱口秀', '相声', '单口喜剧', '真人秀', '慢生活', '韩综', '音乐竞演'].some(t => rawTag.includes(t) || genre.includes(t)) ||
    (type === 'tv' && ['脱口秀', '喜剧', '相声', '音乐', '慢生活', '美食'].some(t => rawTag.includes(t) || genre.includes(t))) ||
    (channel === 'variety' && (region === '韩国' || rawTag === '韩国'));

  if (isVariety) {
    let pool: any[] = [];
    const vTag = rawTag || genre || '';

    // 1. 细分题材精准命中
    if (vTag.includes('脱口秀') || vTag.includes('单口喜剧') || vTag.includes('相声') || vTag.includes('喜剧')) {
      pool = [...VARIETY_HOME_DATA.s2];
    } else if (vTag.includes('音乐') || vTag.includes('竞演') || vTag.includes('舞台') || vTag.includes('唱跳')) {
      pool = [...VARIETY_HOME_DATA.s3];
    } else if (vTag.includes('慢生活') || vTag.includes('美食') || vTag.includes('旅行') || vTag.includes('治愈')) {
      pool = [...VARIETY_HOME_DATA.s4];
    } else if (vTag.includes('韩国') || region.includes('韩国')) {
      // 韩国高分现象级真人秀
      pool = [
        { id: 'v_k_1', title: 'Running Man', rate: '9.2', cover: 'https://image.tmdb.org/t/p/w500/y0Lp6H2VbX4n4D7N8S6b0.jpg', year: '2024', types: ['韩国综艺', '真人秀', '搞笑'], playable: true },
        { id: 'v_k_2', title: '黑白大厨：料理阶级大战', rate: '8.8', cover: 'https://image.tmdb.org/t/p/w500/qQ4dGfV1X3t4Z5m7Y8w9A.jpg', year: '2024', types: ['韩国综艺', '美食', '竞演'], playable: true },
        { id: 'v_k_3', title: '单身即地狱 第三季', rate: '7.8', cover: 'https://image.tmdb.org/t/p/w500/3x9vKiUombbUvpVxdxSxcBDxrqB.jpg', year: '2024', types: ['韩国综艺', '恋爱', '真人秀'], playable: true },
        { id: 'v_k_4', title: '换乘恋爱 第三季', rate: '8.1', cover: 'https://image.tmdb.org/t/p/w500/gttK2vQTd52txo54xrYFdVg1fbS.jpg', year: '2024', types: ['韩国综艺', '情感', '真人秀'], playable: true },
        { id: 'v_k_5', title: '新西游记 第八季', rate: '9.6', cover: 'https://image.tmdb.org/t/p/w500/42KdZo0AtIxGtdeEe0Z5uStiPYQ.jpg', year: '2020', types: ['韩国综艺', '搞笑', '旅行'], playable: true },
        { id: 'v_k_6', title: '无限挑战', rate: '9.7', cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg', year: '2018', types: ['韩国综艺', '真人秀'], playable: true },
      ];
    } else if (vTag.includes('推理') || vTag.includes('大侦探') || vTag.includes('密逃')) {
      pool = [
        { id: 'v_det_1', title: '大侦探 第九季', rate: '8.8', cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg', year: '2024', types: ['推理', '悬疑'], playable: true },
        { id: 'v_det_2', title: '密室大逃脱 第六季', rate: '7.8', cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg', year: '2024', types: ['解密', '惊悚'], playable: true },
        { id: 'v_det_3', title: '明星大侦探 第八季', rate: '8.9', cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg', year: '2023', types: ['推理', '悬疑'], playable: true },
        { id: 'v_det_4', title: '森林进化论', rate: '9.0', cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg', year: '2023', types: ['博弈', '推理'], playable: true },
      ];
    }

    // 2. 若非细分或需扩展，优先从豆瓣获取纯正 tag=综艺
    if (pool.length === 0) {
      try {
        const doubanShows = await fetchDoubanSubjects('tv', '综艺', pageLimit, pageStart);
        if (doubanShows.length > 0) {
          pool = doubanShows;
        }
      } catch {}
    }

    // 3. 兜底至 VARIETY_HOME_DATA 纯正综艺库（100% 杜绝美剧/电影跨界）
    if (pool.length === 0) {
      pool = [...VARIETY_HOME_DATA.s1, ...VARIETY_HOME_DATA.s2, ...VARIETY_HOME_DATA.s3, ...VARIETY_HOME_DATA.s4];
    }

    const paged = pool.slice(pageStart, pageStart + pageLimit).map((item: any) => ({
      ...item,
      cover: item.cover,
      playable: true,
    }));

    return NextResponse.json({
      subjects: paged,
      tag: rawTag || '综艺',
      genre,
      region,
      year,
      total: pool.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=7200',
        'Cloudflare-CDN-Cache-Control': 'public, s-maxage=7200',
      },
    });
  }

  // 0.4 特殊处理：动漫专区细分题材精准路由
  const isAnime =
    channel === 'anime' ||
    rawTag === '日本动画' ||
    genre === '日本动画' ||
    rawTag === '动漫' ||
    genre === '动漫' ||
    ['新番', '国创', '年番', '修真', '剧场版动画'].some(t => rawTag.includes(t) || genre.includes(t));

  if (isAnime) {
    let pool: any[] = [];
    const aTag = rawTag || genre || '';

    if (aTag.includes('新番') || aTag.includes('当季') || aTag.includes('连载')) {
      pool = [...ANIME_HOME_DATA.s1];
    } else if (aTag.includes('国创') || aTag.includes('修真') || aTag.includes('年番') || aTag.includes('国产动画')) {
      pool = [...ANIME_HOME_DATA.s2];
    } else if (aTag.includes('经典') || aTag.includes('神作') || aTag.includes('不朽')) {
      pool = [...ANIME_HOME_DATA.s3];
    } else if (aTag.includes('剧场版') || aTag.includes('动画电影')) {
      pool = [...ANIME_HOME_DATA.s4];
    }

    if (pool.length === 0) {
      try {
        const doubanAnime = await fetchDoubanSubjects('tv', '日本动画', pageLimit, pageStart);
        if (doubanAnime.length > 0) {
          pool = doubanAnime;
        }
      } catch {}
    }

    if (pool.length === 0) {
      pool = [...ANIME_HOME_DATA.s1, ...ANIME_HOME_DATA.s2, ...ANIME_HOME_DATA.s3, ...ANIME_HOME_DATA.s4];
    }

    const paged = pool.slice(pageStart, pageStart + pageLimit).map((item: any) => ({
      ...item,
      cover: item.cover,
      playable: true,
    }));

    return NextResponse.json({
      subjects: paged,
      tag: rawTag || '日本动画',
      genre,
      region,
      year,
      total: pool.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=3600, s-maxage=7200, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=7200',
        'Cloudflare-CDN-Cache-Control': 'public, s-maxage=7200',
      },
    });
  }

  // 1. 确定针对豆瓣的 1~3 个最精准查询 Tag
  const doubanTags: string[] = [];

  if (type === 'movie') {
    // 电影地区映射
    const regionMap: Record<string, string> = {
      '华语': '华语', '香港': '华语', '中国香港': '华语', '台湾': '华语', '中国台湾': '华语',
      '欧美': '欧美', '美国': '欧美', '英国': '欧美', '法国': '欧美',
      '韩国': '韩国', '日本': '日本',
    };
    // 电影题材映射（严禁将纪录片映射为冷门佳片电影）
    const genreMap: Record<string, string> = {
      '动作': '动作', '喜剧': '喜剧', '爱情': '爱情', '科幻': '科幻', '悬疑': '悬疑',
      '恐怖': '恐怖', '动画': '动画', '犯罪': '悬疑', '奇幻': '科幻', '战争': '动作',
    };
    // 年份映射
    const yearMap: Record<string, string> = {
      '2026': '最新', '2025': '最新', '2024': '热门', '2023': '经典', '经典高分': '豆瓣高分'
    };

    if (region && regionMap[region]) doubanTags.push(regionMap[region]);
    if (genre && genreMap[genre] && !doubanTags.includes(genreMap[genre])) doubanTags.push(genreMap[genre]);
    if (doubanTags.length === 0 && year && yearMap[year]) doubanTags.push(yearMap[year]);
    if (doubanTags.length === 0) doubanTags.push(rawTag && VALID_MOVIE_TAGS.has(rawTag) ? rawTag : '热门');
  } else {
    // 电视剧 / 动漫 / 国漫 / 综艺
    const tvRegionMap: Record<string, string> = {
      '国产剧': '国产剧', '美剧': '美剧', '欧美剧': '美剧', '欧美': '美剧', '海外剧': '美剧',
      '韩剧': '韩剧', '日剧': '日剧',
      '港剧': '港剧', '香港': '港剧', '英剧': '英剧', '英国': '英剧',
      '台剧': '国产剧', '台湾': '国产剧', '泰剧': '热门',
      '日本动画': '日本动画', '国产动画': '国产动画', '国创': '国产动画', '国漫': '国产动画', '动漫': '日本动画',
      '综艺': '综艺', '纪录片': '纪录片',
    };

    const mappedRawTag = (rawTag === '欧美剧' || rawTag === '欧美' || rawTag === '海外剧')
      ? '美剧'
      : (rawTag === '华语剧' || rawTag === '华语' || rawTag === '台剧' || rawTag === '台湾')
      ? '国产剧'
      : (rawTag === '港剧' || rawTag === '香港')
      ? '港剧'
      : rawTag;

    if (region && tvRegionMap[region]) {
      doubanTags.push(tvRegionMap[region]);
    } else if (genre === '国漫' || genre === '国产动画') {
      doubanTags.push('国产动画');
    } else if (genre === '日本动画' || genre === '动漫' || genre === '新番') {
      doubanTags.push('日本动画');
    } else if (genre === '综艺') {
      doubanTags.push('综艺');
    } else if (genre === '纪录片') {
      doubanTags.push('纪录片');
    } else if (mappedRawTag && VALID_TV_TAGS.has(mappedRawTag)) {
      doubanTags.push(mappedRawTag);
    } else {
      doubanTags.push('热门');
    }
  }

  try {
    // 2. 并行抓取豆瓣匹配的标签池
    const fetchResults = await Promise.allSettled(
      doubanTags.map(tag => fetchDoubanSubjects(type, tag, pageLimit, pageStart))
    );

    const pool: any[] = [];
    const countMap = new Map<string, number>();

    fetchResults.forEach(res => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        res.value.forEach(s => {
          const count = countMap.get(s.title) || 0;
          countMap.set(s.title, count + 1);
          if (count === 0) pool.push(s);
        });
      }
    });

    // 3. 精准多维重排算法：
    // - 命中了多个筛选条件的影片（交集项）排在最前列
    // - 评分高的优质影片排在前面
    pool.sort((a, b) => {
      const countA = countMap.get(a.title) || 0;
      const countB = countMap.get(b.title) || 0;
      if (countB !== countA) return countB - countA;
      return (parseFloat(b.rate) || 0) - (parseFloat(a.rate) || 0);
    });

    // 4. 若 pool 依然为空（极罕见），兜底加载热门
    if (pool.length === 0) {
      const fallbackList = await fetchDoubanSubjects(type, type === 'movie' ? '热门' : '国产剧', pageLimit, pageStart);
      pool.push(...fallbackList);
    }

    return NextResponse.json({
      subjects: pool.slice(0, pageLimit),
      tag: doubanTags[0] || '热门',
      genre,
      region,
      year,
      total: pool.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'CDN-Cache-Control': 'public, s-maxage=86400',
        'Cloudflare-CDN-Cache-Control': 'public, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Douban recommend API error:', error);
    return NextResponse.json(
      { subjects: [], error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
