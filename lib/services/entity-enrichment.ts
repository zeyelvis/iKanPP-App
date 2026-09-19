import { TitleEntity } from '@/lib/types/entity';
import { generateSlug, formatEntityId, normalizeTitle, isCleanChineseTitle } from '@/lib/data/entities/entity-utils';
import { getEntityByTitle, getEntityByTmdb, getNextEntitySeq, saveEntity, setPersonEntitiesIndex, markPersonEnriched } from '@/lib/services/entity-kv';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
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
  vote_count?: number;
  release_date?: string;
  first_air_date?: string;
  genres?: { id: number; name: string }[];
  runtime?: number;
  number_of_seasons?: number;
  number_of_episodes?: number;
  popularity?: number;
  status?: string;
  original_language?: string;
  spoken_languages?: { iso_639_1: string; name: string }[];
  production_countries?: { iso_3166_1: string; name: string }[];
  origin_country?: string[];
  credits?: {
    cast?: { name: string; character?: string; order: number }[];
    crew?: { name: string; job: string }[];
  };
  keywords?: {
    keywords?: { id: number; name: string }[];
    results?: { id: number; name: string }[];
  };
  translations?: {
    translations?: {
      iso_3166_1: string;
      iso_639_1: string;
      name?: string;
      english_name?: string;
      data?: {
        name?: string;
        title?: string;
        overview?: string;
      };
    }[];
  };
}

// 常用影视多地译名简繁字映射（覆盖港台常见影视译名音译字符）
const S2T_MAP: Record<string, string> = {
  '丽': '麗', '兹': '茲', '顿': '頓', '齐': '齊', '莉': '莉', '博': '博', '登': '登',
  '特': '特', '斯': '斯', '尔': '爾', '曼': '曼', '德': '德', '格': '格', '拉': '拉',
  '维': '維', '杰': '傑', '克': '克', '逊': '遜', '里': '裏', '亚': '亞', '诺': '諾',
  '兰': '蘭', '罗': '羅', '伯': '伯', '理': '理', '查': '查', '弗': '弗', '雷': '雷',
  '战': '戰', '杀': '殺', '爱': '愛', '恋': '戀', '恶': '惡', '魔': '魔', '异': '異',
  '录': '錄', '传': '傳', '说': '說', '记': '記', '历': '歷', '险': '險', '门': '門',
  '间': '間', '发': '發', '复': '復', '仇': '仇', '绝': '絕', '对': '對', '极': '極',
  '风': '風', '暴': '暴', '云': '雲', '梦': '夢', '灵': '靈', '魂': '魂', '灭': '滅',
  '无': '無', '尽': '盡', '终': '終', '结': '結', '形': '形', '体': '體', '国': '國',
  '度': '度', '时': '時', '代': '代', '头': '頭', '号': '號', '玩': '玩', '家': '家',
  '总': '總', '动': '動', '员': '員', '神': '神', '偷': '偷', '爸': '爸', '机': '機',
  '器': '器', '人': '人', '黑': '黑', '客': '客', '帝': '帝'
};

export function toTraditional(str: string): string {
  return str.split('').map(ch => S2T_MAP[ch] || ch).join('');
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
    .replace(/\s*(?:19|20)\d{2}\s*$/, '') // 移除末尾年份（如 2026、2021）
    .replace(/^(?:19|20)\d{2}\s+/, '')    // 移除开头的年份
    .replace(/[·・•]/g, ' ')             // 间隔号转换为空格
    .replace(/[\-_—–]+/g, ' ')           // 连字符/破折号转换为空格
    .replace(/[：:]+/g, ' ')             // 冒号转换为空格
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 针对复杂复合片名（如带副标题、连字符、多地音译差异）生成多级候选搜索词
 */
export function generateSearchQueries(title: string): string[] {
  const queries = new Set<string>();
  const sanitized = sanitizeSearchTitle(title);
  if (sanitized) queries.add(sanitized);

  // 紧凑无空格版本
  const compact = sanitized.replace(/\s+/g, '');
  if (compact && compact !== sanitized) queries.add(compact);

  // 主副标题拆分（遇到空格/标点拆分）
  const parts = sanitized.split(/\s+/).filter(p => p.length > 0);
  if (parts.length >= 2) {
    const mainPart = parts[0].trim();
    if (mainPart.length >= 2) queries.add(mainPart);

    const subPart = parts.slice(1).join(' ').trim();
    if (subPart.length >= 2) queries.add(subPart);

    const compactSub = parts.slice(1).join('').trim();
    if (compactSub.length >= 2) queries.add(compactSub);
  }

  // 补充繁体版本（极大提高港台/美剧译名在 TMDB 中的命中率）
  const tradList: string[] = [];
  for (const q of queries) {
    const trad = toTraditional(q);
    if (trad !== q) tradList.push(trad);
  }
  for (const t of tradList) {
    queries.add(t);
  }

  return Array.from(queries);
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
    const url = `${TMDB_BASE}/${type}/${tmdbId}?api_key=${apiKey}&language=zh-CN&append_to_response=credits,keywords,translations`;
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
 * 智能确立华语流媒体规范的权威主标题与原名
 * 解决海外美剧/英剧/韩剧（如 MobLand）TMDB zh-CN 主标题仍为英文导致被误杀或无法中文直达的问题
 */
function resolveCanonicalTitle(
  detail: TMDBDetailResponse,
  fallbackTitle: string
): { mainTitle: string; originalTitle?: string } {
  const orig = (detail.original_title || detail.original_name || '').trim();
  let rawTitle = (detail.title || detail.name || '').trim();
  const hasChineseRaw = /[\u4e00-\u9fff]/.test(rawTitle);

  // 1. 若 TMDB 官方主标题本身包含中文，优先使用
  if (hasChineseRaw) {
    return { mainTitle: rawTitle, originalTitle: orig || rawTitle };
  }

  // 2. 检查 translations 接口中是否存在中文译名（涵盖中国大陆、台湾、香港）
  let zhTranslation = '';
  if (detail.translations?.translations && Array.isArray(detail.translations.translations)) {
    const zhList = detail.translations.translations.filter((t: any) => t.iso_639_1 === 'zh');
    const bestZh =
      zhList.find((t: any) => t.iso_3166_1 === 'CN' && (t.data?.name || t.data?.title)) ||
      zhList.find((t: any) => (t.data?.name || t.data?.title));
    if (bestZh?.data?.name || bestZh?.data?.title) {
      zhTranslation = (bestZh.data.name || bestZh.data.title || '').trim();
    }
  }

  // 3. 校验调用方传入的 fallbackTitle（如中文搜索词 "黑帮领地"）
  const cleanFallback = sanitizeSearchTitle(fallbackTitle);
  if (cleanFallback && isCleanChineseTitle(cleanFallback)) {
    return { mainTitle: cleanFallback, originalTitle: orig || rawTitle };
  }
  if (zhTranslation && isCleanChineseTitle(zhTranslation)) {
    return { mainTitle: zhTranslation, originalTitle: orig || rawTitle };
  }
  if (cleanFallback && /[\u4e00-\u9fff]/.test(cleanFallback)) {
    return { mainTitle: cleanFallback, originalTitle: orig || rawTitle };
  }

  return { mainTitle: rawTitle || fallbackTitle, originalTitle: orig };
}

/**
 * 从 TMDB 季详情 API 精确统计已播出集数
 * 
 * 核心原理：TMDB 的 number_of_episodes 包含了预排期但尚未播出的占位集数，
 * 导致页面显示虚高的集数（如凡人修仙传实际 191 集却显示 206 集）。
 * 本函数通过 /tv/{id}/season/{n} 接口获取每集的 air_date，
 * 仅统计 air_date ≤ 今天的已播出集数，确保 100% 精确。
 * 
 * 适用于所有连载中的动漫/剧集（凡人修仙传、斗罗大陆、名侦探柯南等）。
 */
export async function fetchTMDBAiredEpisodeCount(
  tmdbId: string | number,
  numberOfSeasons: number = 1,
  apiKey = TMDB_API_KEY
): Promise<number | null> {
  if (!apiKey || !tmdbId || numberOfSeasons < 1) return null;

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  try {
    // 并行查询所有季（大多数中国动漫只有 1 季，即使多季也通常不超过 5 季）
    const seasonNumbers = Array.from({ length: numberOfSeasons }, (_, i) => i + 1);
    const seasonPromises = seasonNumbers.map(async (seasonNum) => {
      try {
        const url = `${TMDB_BASE}/tv/${tmdbId}/season/${seasonNum}?api_key=${apiKey}&language=zh-CN`;
        const res = await fetch(url, {
          headers: { Accept: 'application/json' },
          next: { revalidate: 86400 }, // 1 天缓存，适应每周更新节奏
        });
        if (!res.ok) return 0;
        const data = await res.json();
        if (!data.episodes || !Array.isArray(data.episodes)) return 0;

        // 只统计 air_date ≤ 今天的已播出集数
        return data.episodes.filter(
          (ep: any) => ep.air_date && ep.air_date <= today
        ).length;
      } catch {
        return 0;
      }
    });

    const airedPerSeason = await Promise.all(seasonPromises);
    const totalAired = airedPerSeason.reduce((sum, n) => sum + n, 0);

    return totalAired > 0 ? totalAired : null;
  } catch (err) {
    console.warn(`[TMDB aired count error] id=${tmdbId}:`, err);
    return null;
  }
}

/**
 * 根据影片名称在 TMDB 搜索并抓取最匹配、最高质量条目的完整详情
 */
export async function searchAndEnrichFromTMDB(
  title: string,
  preferredType?: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string,
  year?: string,
  forceRefresh = false
): Promise<TitleEntity | null> {
  if (!title) return null;

  // 1. 先检查本地或 KV 是否已经收录（且海报数据有效）
  if (!forceRefresh) {
    const existing = await getEntityByTitle(title);
    if (existing && existing.cover && existing.cover.trim() !== '') {
      return existing;
    }
  }

  if (!TMDB_API_KEY) return null;

  // 智能提取标题自带年份（例如 "求救信号 2026" 或 "求救信号2026"）
  const effectiveYear = year || title.match(/\b((?:19|20)\d{2})\b/)?.[1];

  const cleanQuery = sanitizeSearchTitle(title);
  if (!cleanQuery) return null;

  try {
    // 聚合所有候选结果
    const candidates: any[] = [];

    // 优先调用 TMDB 综合搜索端点 search/multi（自动整合电影与电视剧，按热度综合推荐）
    const multiUrl = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanQuery)}`;
    try {
      const mRes = await fetch(multiUrl, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 86400 * 7 }
      });
      if (mRes.ok) {
        const mData = await mRes.json();
        if (Array.isArray(mData.results)) {
          candidates.push(...mData.results);
        }
      }
    } catch {}

    // 若 multi 结果较少，补充特定端点搜索
    if (candidates.length < 3) {
      const fallbackEps = preferredType === 'tv'
        ? ['search/tv', 'search/movie']
        : ['search/movie', 'search/tv'];
      for (const ep of fallbackEps) {
        let sUrl = `${TMDB_BASE}/${ep}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanQuery)}`;
        if (effectiveYear) {
          const y = effectiveYear.match(/\d{4}/)?.[0];
          if (y) sUrl += ep.includes('tv') ? `&first_air_date_year=${y}` : `&year=${y}`;
        }
        try {
          const sRes = await fetch(sUrl, {
            headers: { Accept: 'application/json' },
            next: { revalidate: 86400 * 7 }
          });
          if (sRes.ok) {
            const sData = await sRes.json();
            if (Array.isArray(sData.results)) {
              for (const r of sData.results) {
                if (!candidates.some(c => c.id === r.id)) {
                  candidates.push({ ...r, media_type: ep.includes('tv') ? 'tv' : 'movie' });
                }
              }
            }
          }
        } catch {}
      }
    }

    if (candidates.length === 0) {
      // 触发多级退避候选词检索（覆盖繁体、主标题、副标题拆解）
      const alternativeQueries = generateSearchQueries(title).filter(q => q !== cleanQuery);
      for (const altQ of alternativeQueries) {
        if (candidates.length >= 3) break;
        const altEps = preferredType === 'tv'
          ? ['search/tv', 'search/multi', 'search/movie']
          : ['search/multi', 'search/movie', 'search/tv'];
        for (const ep of altEps) {
          if (candidates.length >= 3) break;
          let aUrl = `${TMDB_BASE}/${ep}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(altQ)}`;
          if (effectiveYear) {
            const y = effectiveYear.match(/\d{4}/)?.[0];
            if (y) aUrl += ep.includes('tv') ? `&first_air_date_year=${y}` : `&year=${y}`;
          }
          try {
            const aRes = await fetch(aUrl, {
              headers: { Accept: 'application/json' },
              next: { revalidate: 86400 * 7 }
            });
            if (aRes.ok) {
              const aData = await aRes.json();
              if (Array.isArray(aData.results)) {
                for (const r of aData.results) {
                  if (!candidates.some(c => c.id === r.id)) {
                    candidates.push({ ...r, media_type: r.media_type || (ep.includes('tv') ? 'tv' : 'movie') });
                  }
                }
              }
            }
          } catch {}
        }
      }
    }

    if (candidates.length === 0) return null;

    // 智能多维打分排序（依据：标题精准度 + 海报剧照完整度 + 热度人气 + 评分人数）
    const allQueryCandidates = generateSearchQueries(title);
    const ranked = candidates
      .filter(r => r && (r.media_type === 'movie' || r.media_type === 'tv' || !r.media_type))
      .map(hit => {
        let score = 0;
        const hitTitle = (hit.title || hit.name || '').trim();
        const origTitle = (hit.original_title || hit.original_name || '').trim();
        const cleanQ = cleanQuery.toLowerCase();

        // 1. 标题匹配度 (权重高)
        const matchesAnyQuery = allQueryCandidates.some(q => {
          const qLow = q.toLowerCase();
          return hitTitle.toLowerCase().includes(qLow) ||
            origTitle.toLowerCase().includes(qLow) ||
            qLow.includes(hitTitle.toLowerCase());
        });

        if (hitTitle.toLowerCase() === cleanQ) score += 100;
        else if (origTitle.toLowerCase() === cleanQ) score += 90;
        else if (hitTitle.toLowerCase().includes(cleanQ)) score += 50;
        else if (matchesAnyQuery) score += 60;

        // 2. 海报与剧照完整度 (权重极高！坚决淘汰无图空壳条目)
        if (hit.poster_path) score += 70;
        if (hit.backdrop_path) score += 30;
        if (hit.overview && hit.overview.trim().length > 10) score += 20;

        // 3. 热度与人气加分 (依据 popularity，最高 50 分)
        const pop = Number(hit.popularity) || 0;
        score += Math.min(pop * 2, 50);

        // 4. 评价人数加分 (过滤无人问津的极冷门条目)
        const votes = Number(hit.vote_count) || 0;
        if (votes > 10) score += 10;
        if (votes > 100) score += 10;

        // 5. 指定年份匹配
        if (effectiveYear) {
          const hitYear = (hit.release_date || hit.first_air_date || '').slice(0, 4);
          if (hitYear === effectiveYear.slice(0, 4)) score += 50;
        }

        // 6. 类型偏好匹配
        const hitType = hit.media_type || (hit.title ? 'movie' : 'tv');
        if (preferredType && preferredType === hitType) {
          score += 25;
        }

        // 7. 严厉惩罚项：如果完全没有海报封面且热度低于 2.5，扣除 120 分
        if (!hit.poster_path && pop < 2.5) {
          score -= 120;
        }

        return { hit, score, actualType: (hitType === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv' };
      })
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    if (!best || !best.hit?.id) return null;

    // ====== 防线：标题匹配度硬性门槛 ======
    // 防止 TMDB 搜索返回的最高分候选与搜索词完全不相关
    const bestTitle = (best.hit.title || best.hit.name || '').trim();
    const bestOrig = (best.hit.original_title || best.hit.original_name || '').trim();
    const hasChineseQuery = /[\u4e00-\u9fff]/.test(cleanQuery);

    if (hasChineseQuery) {
      // 包含原始查询词以及所有多级候选词中的中文字符（兼容简繁、音译别名与主副标题）
      const queryChars = Array.from(new Set(generateSearchQueries(title).join('').match(/[\u4e00-\u9fff]/g) || []));
      const combinedTitle = bestTitle + bestOrig;
      const hasOverlap = queryChars.some(ch => combinedTitle.includes(ch));
      const overviewText = best.hit.overview || '';
      const hasOverviewOverlap = queryChars.some(ch => overviewText.includes(ch));
      const hasChineseOverview = /[\u4e00-\u9fff]/.test(overviewText);

      if (!hasOverlap && !hasOverviewOverlap && !(best.score >= 40 && hasChineseOverview)) {
        return null;
      }
    } else {
      // 英文搜索：最低分数门槛，排除得分极低的无关条目
      if (best.score < 50) return null;
    }

    const firstHit = best.hit;
    const actualType = best.actualType;

    // 检查该 TMDB ID 是否已被别的别名收录
    if (!forceRefresh) {
      const existByTmdb = await getEntityByTmdb(actualType, String(firstHit.id));
      if (existByTmdb && existByTmdb.cover && existByTmdb.cover.trim() !== '') {
        const hitTitle = (firstHit.title || firstHit.name || '').trim();
        const origTitle = (firstHit.original_title || firstHit.original_name || '').trim();
        const isRelated =
          hasTitleOverlap(existByTmdb.title, hitTitle + origTitle + cleanQuery) ||
          (existByTmdb.originalTitle && hasTitleOverlap(existByTmdb.originalTitle, hitTitle + origTitle + cleanQuery)) ||
          (existByTmdb.slug && hasTitleOverlap(existByTmdb.slug, hitTitle + origTitle + cleanQuery));

        if (isRelated) {
          return existByTmdb;
        }
        console.warn(`[searchAndEnrichFromTMDB] Cache discarded due to title mismatch: existTitle="${existByTmdb.title}", hitTitle="${hitTitle}", query="${cleanQuery}"`);
      }
    }

    // 拉取深度元数据
    const detail = await fetchTMDBDetails(firstHit.id, actualType, TMDB_API_KEY);
    if (!detail) return null;

    // 生成新实体或升级现有残缺实体
    let entityId: string;
    let existingToUpdate: TitleEntity | null = null;
    if (forceRefresh) {
      existingToUpdate = await getEntityByTitle(title);
    }
    if (existingToUpdate) {
      entityId = existingToUpdate.entityId;
    } else {
      const nextSeq = await getNextEntitySeq();
      entityId = formatEntityId(nextSeq);
    }

    const { mainTitle, originalTitle } = resolveCanonicalTitle(detail, title);
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
      for (const c of detail.credits.cast.slice(0, 8)) {
        if (c.name && !actors.includes(c.name)) {
          actors.push(c.name);
        }
      }
    }

    const releaseYear = (detail.release_date || detail.first_air_date || year || '2024').slice(0, 4);
    const genres = (detail.genres || []).map(g => g.name).filter(Boolean);

    const region = detail.production_countries?.[0]?.name || (
      detail.origin_country?.[0] === 'CN' ? '中国' :
      detail.origin_country?.[0] === 'US' ? '美国' :
      detail.origin_country?.[0] === 'KR' ? '韩国' :
      detail.origin_country?.[0] === 'JP' ? '日本' :
      detail.origin_country?.[0] === 'TH' ? '泰国' :
      detail.origin_country?.[0] || '华语'
    );
    const language = detail.spoken_languages?.[0]?.name || (
      detail.original_language === 'zh' ? '国语' :
      detail.original_language === 'en' ? '英语' :
      detail.original_language === 'ko' ? '韩语' :
      detail.original_language === 'ja' ? '日语' :
      detail.original_language === 'th' ? '泰语' :
      detail.original_language
    );
    const status = detail.status === 'Ended' ? '完结' : (detail.status === 'Returning Series' ? '连载中' : (detail.status || '完结'));

    const rawKeywords = detail.keywords?.keywords || detail.keywords?.results || [];
    const keywords = rawKeywords.map(k => k.name).filter(Boolean).slice(0, 10);

    const entity: TitleEntity = {
      entityId,
      slug,
      tmdbId: String(detail.id),
      tmdbType: actualType,
      title: mainTitle,
      originalTitle: originalTitle || detail.original_title || detail.original_name,
      type: actualType,
      year: releaseYear,
      description: detail.overview || `${mainTitle} 在线观看，支持海外华人免翻墙极速高清播放。`,
      cover: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : '',
      backdrop: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : '',
      rate: detail.vote_average ? detail.vote_average.toFixed(1) : '8.5',
      genres: genres.length > 0 ? genres : [actualType === 'movie' ? '电影' : '电视剧'],
      directors: directors.filter(d => d && d !== '知名导演'),
      actors: actors.filter(a => a && a !== '实力主演'),
      region,
      language,
      status,
      popularity: detail.popularity,
      runtime: detail.runtime,
      numberOfSeasons: detail.number_of_seasons,
      numberOfEpisodes: detail.number_of_episodes, // 临时赋值，下面精确覆盖
      keywords,
      createdAt: existingToUpdate?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 精确统计已播出集数（过滤掉预排期的占位集数）
    if (actualType === 'tv' && detail.number_of_seasons) {
      try {
        const airedCount = await fetchTMDBAiredEpisodeCount(
          detail.id,
          detail.number_of_seasons
        );
        if (airedCount && airedCount > 0) {
          entity.numberOfEpisodes = airedCount;
        }
      } catch {}
    }

    // 存入 KV 索引系统
    await saveEntity(entity);
    return entity;
  } catch (e) {
    console.warn(`[Enrich search fail] title=${title}:`, e);
  }

  return null;
}

/**
 * 内部辅助：将 TMDB Hit 完整转换为 TitleEntity 并持久化到 KV
 */
async function convertHitToEntity(
  firstHit: any,
  actualType: 'movie' | 'tv',
  fallbackTitle: string
): Promise<TitleEntity | null> {
  try {
    const existByTmdb = await getEntityByTmdb(actualType, String(firstHit.id));
    if (existByTmdb && existByTmdb.cover && existByTmdb.cover.trim() !== '') {
      const hitTitle = (firstHit.title || firstHit.name || '').trim();
      const origTitle = (firstHit.original_title || firstHit.original_name || '').trim();
      const isRelated =
        hasTitleOverlap(existByTmdb.title, hitTitle + origTitle + fallbackTitle) ||
        (existByTmdb.originalTitle && hasTitleOverlap(existByTmdb.originalTitle, hitTitle + origTitle + fallbackTitle)) ||
        (existByTmdb.slug && hasTitleOverlap(existByTmdb.slug, hitTitle + origTitle + fallbackTitle));

      if (isRelated) {
        return enrichEpisodeCount(existByTmdb);
      }
      console.warn(`[convertHitToEntity] Discarding mismatch cache: existTitle="${existByTmdb.title}", hitTitle="${hitTitle}", fallback="${fallbackTitle}"`);
    }

    const detail = await fetchTMDBDetails(firstHit.id, actualType, TMDB_API_KEY);
    if (!detail) return null;

    const nextSeq = await getNextEntitySeq();
    const entityId = formatEntityId(nextSeq);

    const { mainTitle, originalTitle } = resolveCanonicalTitle(detail, fallbackTitle);
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
      for (const c of detail.credits.cast.slice(0, 8)) {
        if (c.name && !actors.includes(c.name)) {
          actors.push(c.name);
        }
      }
    }

    const releaseYear = (detail.release_date || detail.first_air_date || '2024').slice(0, 4);
    const genres = (detail.genres || []).map(g => g.name).filter(Boolean);

    const region = detail.production_countries?.[0]?.name || (
      detail.origin_country?.[0] === 'CN' ? '中国' :
      detail.origin_country?.[0] === 'US' ? '美国' :
      detail.origin_country?.[0] === 'KR' ? '韩国' :
      detail.origin_country?.[0] === 'JP' ? '日本' :
      detail.origin_country?.[0] === 'TH' ? '泰国' :
      detail.origin_country?.[0] || '华语'
    );
    const language = detail.spoken_languages?.[0]?.name || (
      detail.original_language === 'zh' ? '国语' :
      detail.original_language === 'en' ? '英语' :
      detail.original_language === 'ko' ? '韩语' :
      detail.original_language === 'ja' ? '日语' :
      detail.original_language === 'th' ? '泰语' :
      detail.original_language
    );
    const status = detail.status === 'Ended' ? '完结' : (detail.status === 'Returning Series' ? '连载中' : (detail.status || '完结'));

    const rawKeywords = detail.keywords?.keywords || detail.keywords?.results || [];
    const keywords = rawKeywords.map(k => k.name).filter(Boolean).slice(0, 10);

    const entity: TitleEntity = {
      entityId,
      slug,
      tmdbId: String(detail.id),
      tmdbType: actualType,
      title: mainTitle,
      originalTitle: originalTitle || detail.original_title || detail.original_name,
      type: actualType,
      year: releaseYear,
      description: detail.overview || `${mainTitle} 在线观看，支持海外华人免翻墙极速高清播放。`,
      cover: detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : '',
      backdrop: detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : '',
      rate: detail.vote_average ? detail.vote_average.toFixed(1) : '8.5',
      genres: genres.length > 0 ? genres : [actualType === 'movie' ? '电影' : '电视剧'],
      directors: directors.filter(d => d && d !== '知名导演'),
      actors: actors.filter(a => a && a !== '实力主演'),
      region,
      language,
      status,
      popularity: detail.popularity,
      runtime: detail.runtime,
      numberOfSeasons: detail.number_of_seasons,
      numberOfEpisodes: detail.number_of_episodes,
      keywords,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (actualType === 'tv' && detail.number_of_seasons) {
      try {
        const airedCount = await fetchTMDBAiredEpisodeCount(detail.id, detail.number_of_seasons);
        if (airedCount && airedCount > 0) {
          entity.numberOfEpisodes = airedCount;
        }
      } catch {}
    }

    await saveEntity(entity);
    return entity;
  } catch (err) {
    console.warn(`[convertHitToEntity fail] id=${firstHit?.id}:`, err);
    return null;
  }
}

/**
 * 搜索 TMDB 多个权威匹配实体（如动漫原版 + 真人改编版双轨推荐）
 */
export async function searchMultipleEntitiesFromTMDB(
  query: string,
  limit = 2
): Promise<TitleEntity[]> {
  if (!query || !TMDB_API_KEY) return [];
  const cleanQuery = sanitizeSearchTitle(query);
  if (!cleanQuery) return [];

  try {
    const multiUrl = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanQuery)}`;
    const mRes = await fetch(multiUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 * 7 }
    });

    if (!mRes.ok) return [];
    const mData = await mRes.json();
    const candidates: any[] = Array.isArray(mData.results) ? mData.results : [];
    if (candidates.length === 0) return [];

    const cleanQ = cleanQuery.toLowerCase();
    const ranked = candidates
      .filter(r => r && (r.media_type === 'movie' || r.media_type === 'tv' || !r.media_type))
      .map(hit => {
        let score = 0;
        const hitTitle = (hit.title || hit.name || '').trim();
        const origTitle = (hit.original_title || hit.original_name || '').trim();

        if (hitTitle === cleanQuery || origTitle === cleanQuery) score += 100;
        else if (hitTitle.toLowerCase().startsWith(cleanQ)) score += 70;
        else if (hitTitle.toLowerCase().includes(cleanQ)) score += 50;

        if (hit.poster_path) score += 70;
        if (hit.backdrop_path) score += 30;
        if (hit.overview && hit.overview.trim().length > 10) score += 20;

        const pop = Number(hit.popularity) || 0;
        score += Math.min(pop * 2, 50);

        const votes = Number(hit.vote_count) || 0;
        if (votes > 10) score += 10;
        if (votes > 100) score += 10;

        if (!hit.poster_path && pop < 2.5) {
          score -= 120;
        }

        const hitType = hit.media_type || (hit.title ? 'movie' : 'tv');
        return { hit, score, actualType: (hitType === 'tv' ? 'tv' : 'movie') as 'movie' | 'tv' };
      })
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    if (!best || !best.hit?.id) return [];

    const bestTitle = (best.hit.title || best.hit.name || '').trim();
    const bestOrig = (best.hit.original_title || best.hit.original_name || '').trim();
    if (!hasTitleOverlap(cleanQuery, bestTitle + bestOrig)) {
      return [];
    }

    const selectedHits = [best];

    // 寻找第二席（如真人版或备受瞩目的衍生版）
    if (limit >= 2 && ranked.length >= 2) {
      for (const cand of ranked.slice(1)) {
        if (!cand.hit?.id || cand.hit.id === best.hit.id) continue;
        if (!cand.hit.poster_path) continue;

        const candTitle = (cand.hit.title || cand.hit.name || '').trim();
        const candOrig = (cand.hit.original_title || cand.hit.original_name || '').trim();
        const candFullTitle = candTitle + candOrig;

        if (!hasTitleOverlap(cleanQuery, candFullTitle)) continue;

        const isSameName = candTitle === bestTitle || candTitle === cleanQuery;
        const hasDecentPop = (cand.hit.popularity || 0) > 3.0 || cand.score >= 80;

        if (isSameName || hasDecentPop) {
          selectedHits.push(cand);
          break;
        }
      }
    }

    const entities: TitleEntity[] = [];
    const seenKeys = new Set<string>();

    for (const item of selectedHits) {
      if (!item.hit?.id) continue;
      const tmdbKey = `${item.actualType}:${item.hit.id}`;
      if (seenKeys.has(tmdbKey)) continue;

      const entity = await convertHitToEntity(item.hit, item.actualType, cleanQuery);
      if (entity && entity.cover) {
        let finalEntity = entity;
        if (finalEntity.type !== 'movie' && (!finalEntity.numberOfEpisodes || finalEntity.numberOfEpisodes === 0)) {
          finalEntity = await enrichEpisodeCount(finalEntity);
        }

        if (!seenKeys.has(finalEntity.entityId) && !seenKeys.has(`${finalEntity.type}:${finalEntity.tmdbId}`)) {
          seenKeys.add(tmdbKey);
          seenKeys.add(finalEntity.entityId);
          seenKeys.add(`${finalEntity.type}:${finalEntity.tmdbId}`);
          entities.push(finalEntity);
        }
      }
    }

    return entities;
  } catch (err) {
    console.warn(`[searchMultipleEntitiesFromTMDB fail] query=${query}:`, err);
    return [];
  }
}

/**
 * 根据导演或演员姓名，在 TMDB 抓取该人物的名下代表作品并沉淀入库
 */
export async function searchAndEnrichPersonCredits(
  personName: string,
  role: 'director' | 'actor',
  limit = 12
): Promise<TitleEntity[]> {
  if (!personName || !TMDB_API_KEY) return [];

  const cleanName = personName.trim();

  try {
    // 1. 检索人物 ID
    const searchUrl = `${TMDB_BASE}/search/person?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanName)}`;
    const sRes = await fetch(searchUrl, { headers: { Accept: 'application/json' } });
    if (!sRes.ok) return [];

    const sData = await sRes.json();
    const candidatesPeople = Array.isArray(sData.results) ? sData.results : [];
    if (candidatesPeople.length === 0) return [];

    // 从候选列表中选拔最具代表作积累的权威影人（坚决避免盲目取第0项命中无头像的幽灵/同名条目）
    const pickBestPerson = (people: any[]) => {
      if (people.length === 1) return people[0];

      const scorePerson = (p: any) => {
        let score = (p.popularity || 0) * 10;
        // 有官方肖像大幅加分（知名影人99%有肖像照，同名幽灵或空条目通常为 null）
        if (p.profile_path) score += 80;
        // 职业契合度加分
        if (role === 'director' && (p.known_for_department === 'Directing' || p.known_for_department === 'Writing')) {
          score += 40;
        } else if (role === 'actor' && p.known_for_department === 'Acting') {
          score += 40;
        }
        // 代表作总评价人数加分
        const knownFor = Array.isArray(p.known_for) ? p.known_for : [];
        for (const k of knownFor) {
          score += Math.min(k.vote_count || 0, 500);
        }
        return score;
      };

      return [...people].sort((a, b) => scorePerson(b) - scorePerson(a))[0];
    };

    const person = pickBestPerson(candidatesPeople);
    if (!person || !person.id) return [];

    // 2. 获取作品履历 (combined_credits)
    const creditsUrl = `${TMDB_BASE}/person/${person.id}/combined_credits?api_key=${TMDB_API_KEY}&language=zh-CN`;
    const cRes = await fetch(creditsUrl, { headers: { Accept: 'application/json' } });
    if (!cRes.ok) return [];

    const cData = await cRes.json();
    let candidates: any[] = [];

    if (role === 'director') {
      const crew = Array.isArray(cData.crew) ? cData.crew : [];
      candidates = crew.filter((c: any) => c.job === 'Director' || c.department === 'Directing');
    } else {
      candidates = Array.isArray(cData.cast) ? cData.cast : [];
    }

    // 判断是否为脱口秀、访谈、晚会、真人秀或本人客串
    const isTalkShowOrSelf = (item: any) => {
      const genreIds: number[] = Array.isArray(item.genre_ids) ? item.genre_ids : [];
      // 10767 = Talk (脱口秀/访谈), 10764 = Reality (真人秀), 10763 = News (新闻)
      if (genreIds.some(id => [10767, 10764, 10763].includes(id))) return true;

      const title = (item.title || item.name || '').trim();
      if (/秀$|脱口秀|今夜秀|深夜秀|直播秀|金马奖|金像奖|奥斯卡|春晚|春节联欢晚会|颁奖典礼|电影节|首映礼|慢谈|圆桌派|天天向上|快乐大本营|中餐厅|王牌对王牌|奔跑吧|极限挑战|向往的生活|Running Man/i.test(title)) {
        return true;
      }

      if (role === 'actor') {
        const char = (item.character || '').trim();
        // 注意：绝不能因为没有填写 character 就判定为脱口秀！很多华语/老港经典正片未填 character 英文名字
        if (char) {
          if (/^(self|herself|himself|host|guest|judge|panelist|interviewee)(\b|\s|-|\/)/i.test(char) ||
              /\b(self|herself|himself|guest host)\b/i.test(char) ||
              /uncredited|extra|background/i.test(char) ||
              char.includes('自己') || char.includes('本人') || char.includes('嘉宾') || char.includes('评委')) {
            return true;
          }
        }
      }
      return false;
    };

    // 影视代表作权威口碑评分算法 (评价人数与评分复合加权)
    const calculateScore = (item: any) => {
      const voteCount = item.vote_count || 0;
      const voteAverage = item.vote_average || 0;
      const popularity = item.popularity || 0;
      const voteWeight = Math.log10(voteCount + 10);
      return voteWeight * voteAverage * 1.5 + Math.min(popularity, 40) * 0.3;
    };

    // 过滤出有海报且为真实正片的条目，按权威口碑评分降序排列
    const validCandidates = candidates
      .filter((c: any) => (c.title || c.name) && c.poster_path && !isTalkShowOrSelf(c))
      .sort((a: any, b: any) => calculateScore(b) - calculateScore(a))
      .slice(0, limit);

    const results: TitleEntity[] = [];

    for (const item of validCandidates) {
      const mediaType: 'movie' | 'tv' = item.media_type === 'tv' ? 'tv' : 'movie';
      const tmdbIdStr = String(item.id);

      // 检查是否已有该条目
      let entity = await getEntityByTmdb(mediaType, tmdbIdStr);
      if (!entity) {
        // 创建新实体
        const mainTitle = item.title || item.name;
        const nextSeq = await getNextEntitySeq();
        const entityId = formatEntityId(nextSeq);
        const slug = generateSlug(mainTitle);
        const releaseYear = (item.release_date || item.first_air_date || '2024').slice(0, 4);

        entity = {
          entityId,
          slug,
          tmdbId: tmdbIdStr,
          tmdbType: mediaType,
          title: mainTitle,
          originalTitle: item.original_title || item.original_name,
          type: mediaType,
          year: releaseYear,
          description: item.overview || `${mainTitle} 由 ${cleanName} ${role === 'director' ? '执导' : '主演'}，在 iKanPP 免费在线观看高清完整版。`,
          cover: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          rate: item.vote_average ? item.vote_average.toFixed(1) : '8.5',
          genres: [mediaType === 'movie' ? '电影' : '电视剧'],
          directors: role === 'director' ? [cleanName] : [],
          actors: role === 'actor' ? [cleanName] : [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await saveEntity(entity);
      } else {
        // 如果实体已存在，确保其导演或演员列表中包含该人物，并更新索引
        let needSave = false;
        if (role === 'director' && !entity.directors.includes(cleanName)) {
          entity.directors.push(cleanName);
          needSave = true;
        }
        if (role === 'actor' && !entity.actors.includes(cleanName)) {
          entity.actors.push(cleanName);
          needSave = true;
        }
        if (needSave) {
          await saveEntity(entity);
        }
      }

      results.push(entity);
    }

    // 覆盖更新 KV 中的人物作品索引，彻底冲刷掉历史遗留的脱口秀等脏数据
    if (results.length > 0) {
      try {
        const cleanIds = results.map(r => r.entityId);
        await setPersonEntitiesIndex(role, cleanName, cleanIds);
        await markPersonEnriched(role, cleanName);
      } catch (e) {
        console.warn(`[Failed to update person index] name=${cleanName}:`, e);
      }
    }

      return results;
    } catch (err) {
      console.warn(`[Enrich person fail] name=${personName}:`, err);
      return [];
    }
  }

  /**
   * 判定当前背景图是否为无效/竖版海报假数据
   */
  export function isFakeBackdrop(backdrop?: string, cover?: string): boolean {
    if (!backdrop) return true;
    if (cover && backdrop === cover) return true;
    if (backdrop.includes('ratio_poster')) return true;
    return false;
  }

  /**
   * 智能获取真实的 16:9 横版电影大剧照 (Backdrop)
   * 当 backdrop 缺失或误填了竖版封面时，自动向 TMDB 查询获取原汁原味的横幅剧照大图
   */
  export async function resolveRealBackdrop(
    title: string,
    currentBackdrop?: string,
    currentCover?: string,
    tmdbId?: string,
    type: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string = 'movie',
    year?: string
  ): Promise<string | null> {
    // 若当前已有真正的横版剧照，直接返回
    if (!isFakeBackdrop(currentBackdrop, currentCover)) {
      return currentBackdrop || null;
    }

    if (!TMDB_API_KEY || !title) return null;

    try {
      const tmdbMediaType = type === 'movie' ? 'movie' : 'tv';

      // 1. 若有 tmdbId，优先直接查询详情获取 backdrop_path
      if (tmdbId) {
        const detail = await fetchTMDBDetails(tmdbId, tmdbMediaType);
        if (detail?.backdrop_path) {
          return `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}`;
        }
      }

      // 2. 按纯净标题到 TMDB 搜索获取 16:9 横版剧照
      const cleanQuery = sanitizeSearchTitle(title);
      if (!cleanQuery) return null;

      const searchUrl = `${TMDB_BASE}/search/${tmdbMediaType}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanQuery)}${year ? `&year=${year.slice(0, 4)}` : ''}`;
      const res = await fetch(searchUrl, {
        headers: { Accept: 'application/json' },
        next: { revalidate: 86400 * 7 },
      });

      if (res.ok) {
        const data = await res.json();
        const firstHit = data.results?.[0];
        if (firstHit?.backdrop_path) {
          return `https://image.tmdb.org/t/p/w1280${firstHit.backdrop_path}`;
        }
      }
    } catch (e) {
      console.warn(`[resolveRealBackdrop fail] title=${title}:`, e);
    }

    return null;
  }

/**
 * 标题相似度检测（中文字符交集）
 */
export function hasTitleOverlap(a: string, b: string): boolean {
  const chineseA = a.match(/[\u4e00-\u9fff]/g);
  const chineseB = b.match(/[\u4e00-\u9fff]/g);

  if (chineseA && chineseA.length > 0 && chineseB && chineseB.length > 0) {
    const setB = new Set(chineseB);
    return chineseA.some(ch => setB.has(ch));
  }

  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  return la.includes(lb) || lb.includes(la);
}

/**
 * 内部辅助函数：用指定的 tmdbId 尝试从 TMDB 精确统计已播出集数
 */
export async function tryEnrichFromTMDB(entity: TitleEntity, tmdbId: string): Promise<TitleEntity | null> {
  try {
    const detail = await fetchTMDBDetails(tmdbId, 'tv');
    if (!detail || !detail.number_of_seasons) return null;

    const tmdbName = (detail.name || detail.original_name || '').trim();
    const entityTitle = (entity.title || '').trim();
    if (tmdbName && entityTitle && !hasTitleOverlap(entityTitle, tmdbName)) {
      return null;
    }

    const totalSeasons = detail.number_of_seasons;

    if (detail.genres?.length && (!entity.genres || entity.genres.length <= 1)) {
      entity.genres = detail.genres.map((g: any) => g.name).filter(Boolean);
    }

    const airedCount = await fetchTMDBAiredEpisodeCount(tmdbId, totalSeasons);

    if (airedCount && airedCount > 0) {
      entity.numberOfEpisodes = airedCount;
      entity.numberOfSeasons = totalSeasons;
      entity.tmdbId = tmdbId;
      saveEntity(entity).catch(() => {});
      return entity;
    }

    if (detail.number_of_episodes) {
      entity.numberOfEpisodes = detail.number_of_episodes;
      entity.numberOfSeasons = totalSeasons;
      entity.tmdbId = tmdbId;
      saveEntity(entity).catch(() => {});
      return entity;
    }
  } catch {}

  return null;
}

/**
 * TMDB 集数精确补全器（含 tmdbId 自愈）
 */
export async function enrichEpisodeCount(entity: TitleEntity): Promise<TitleEntity> {
  if (entity.type === 'movie') return entity;

  const tmdbId = entity.tmdbId;

  if (tmdbId && /^\d{4,}$/.test(tmdbId)) {
    const result = await tryEnrichFromTMDB(entity, tmdbId);
    if (result) return result;
  }

  try {
    const healed = await searchAndEnrichFromTMDB(entity.title, 'tv', entity.year, true);
    if (healed && healed.tmdbId && healed.tmdbId !== tmdbId) {
      const result = await tryEnrichFromTMDB(healed, healed.tmdbId);
      if (result) return result;
      return healed;
    }
  } catch {}

  return entity;
}

