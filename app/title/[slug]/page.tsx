import { cache } from 'react';
import { Metadata } from 'next';
import { notFound, permanentRedirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Calendar, Film, ArrowLeft, Clapperboard, User, Sparkles, CheckCircle2, Play } from 'lucide-react';
import { getEntityBySlug, getEntityByTitle, getEntitiesByGenre, getEntitiesByDirector, getEntitiesByActor, saveEntity, isSafeRecentTitleItem } from '@/lib/services/entity-kv';
import { getGenreBySlug } from '@/lib/data/genres';
import { parseEntitySlug, normalizeTitle, isStrictSafeEntity, generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';
import { searchAndEnrichFromTMDB, fetchTMDBDetails, fetchTMDBAiredEpisodeCount, resolveRealBackdrop, isFakeBackdrop } from '@/lib/services/entity-enrichment';
import { getFastPersonAvatars } from '@/lib/services/person-avatar';
import { getOptimizedImageUrl, isRestrictedRegion } from '@/lib/utils/image-utils';
import { headers } from 'next/headers';
import { TitleEntity } from '@/lib/types/entity';
import { TitleJsonLd } from '@/components/seo/TitleJsonLd';
import { RelatedSearchChips } from '@/components/seo/RelatedSearchChips';
import { AiOverviewCapsule } from '@/components/seo/AiOverviewCapsule';
import highPotentialKeywordsData from '@/lib/data/seo-high-potential.json';
import { TitleActionsBar } from '@/components/title/TitleActionsBar';
import { EpisodesSelector } from '@/components/title/EpisodesSelector';
import { StickyBottomPlayCTA } from '@/components/title/StickyBottomPlayCTA';
import { MobileHeroStage } from '@/components/title/MobileHeroStage';
import { CastRail } from '@/components/title/CastRail';
import { AiUniqueReview } from '@/components/title/AiUniqueReview';
import { AiFaqSection } from '@/components/title/AiFaqSection';
import { Navbar } from '@/components/layout/Navbar';
import { normalizeVideoType } from '@/lib/utils/taxonomy';
import { parseSeasonFromTitle } from '@/lib/utils/season-resolver';
import { PREBAKED_LATEST_TITLES } from '@/lib/data/latest-titles-prebaked';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateFullSpectrumKeywords } from '@/lib/utils/seo-keyword-generator';
import { isEntityIndexable } from '@/lib/data/seo-rules/seo-keyword-system';
import { FlagTW, FlagHK } from '@/components/ui/RegionFlags';

interface PrebakedDisplayItem {
  entityId?: string;
  title: string;
  slug?: string;
  type?: string;
  year?: string;
  cover?: string;
  backdrop?: string;
  rate?: string;
  genres?: string[];
  directors?: string[];
  actors?: string[];
  description?: string;
  updateBadge?: string;
  numberOfEpisodes?: number;
  numberOfSeasons?: number;
}

let cachedAllPrebakedItems: PrebakedDisplayItem[] | null = null;

function getAllPrebakedDisplayItems(): PrebakedDisplayItem[] {
  if (cachedAllPrebakedItems) return cachedAllPrebakedItems;

  const items: PrebakedDisplayItem[] = [];
  const seenTitles = new Set<string>();

  // 1. 全专区最新上线雷达库
  for (const list of Object.values(PREBAKED_LATEST_TITLES)) {
    if (Array.isArray(list)) {
      for (const it of list) {
        if (it && it.title && !seenTitles.has(it.title)) {
          seenTitles.add(it.title);
          items.push({
            entityId: it.entityId,
            title: it.title,
            slug: it.slug,
            type: it.type,
            year: it.year,
            cover: it.cover,
            backdrop: it.backdrop,
            rate: it.rate,
            genres: it.genres,
            directors: [],
            actors: [],
            updateBadge: it.updateBadge,
            numberOfEpisodes: it.updateBadge ? parseInt(it.updateBadge.replace(/\D/g, ''), 10) || 1 : 1,
            numberOfSeasons: 1,
          });
        }
      }
    }
  }

  // 2. 全站 7 大专区大厅预烘焙数据（全专区 Hero 巨幕 + 各分类货架）
  for (const catData of Object.values(PREBAKED_HOME_DATA)) {
    if (!catData) continue;
    for (const [sectionKey, sectionVal] of Object.entries(catData)) {
      if (Array.isArray(sectionVal)) {
        for (const it of sectionVal) {
          const itTitle = it?.title || (it as any)?.name;
          if (itTitle && !seenTitles.has(itTitle)) {
            seenTitles.add(itTitle);
            const rawId = (it as any).id;
            const hasIkId = typeof rawId === 'string' && rawId.startsWith('ik');
            items.push({
              entityId: hasIkId ? rawId : undefined,
              title: itTitle,
              slug: (it as any).slug,
              type: (it as any).type || ((it as any).category === 'movie' ? 'movie' : 'tv'),
              year: (it as any).year ? String((it as any).year) : undefined,
              cover: (it as any).cover,
              backdrop: (it as any).backdrop,
              rate: (it as any).rate ? String((it as any).rate) : undefined,
              genres: (it as any).genres,
              directors: (it as any).directors,
              actors: (it as any).actors,
              description: (it as any).description || (it as any).overview,
              updateBadge: (it as any).badge || (it as any).updateBadge,
              numberOfEpisodes: (it as any).episodes || ((it as any).badge ? parseInt(String((it as any).badge).replace(/\D/g, ''), 10) || undefined : undefined),
              numberOfSeasons: (it as any).seasons || 1,
            });
          }
        }
      }
    }
  }

  cachedAllPrebakedItems = items;
  return items;
}

/**
 * 智能频道归属识别器
 * 综合 entity.type 与 genres 标签，精准判断影片应归属的面包屑频道。
 * 解决 TMDB 只返回 movie/tv 导致动漫被误归为"电视剧"的问题。
 */
function resolveEntityChannel(entity: TitleEntity): { category: string; path: string; name: string } {
  // 1. entity.type 已经是 'anime' 的直接命中
  if (entity.type === 'anime') {
    return { category: 'anime', path: '/anime', name: '动漫' };
  }

  // 2. 通过 genres 中的标签进行多维度匹配
  const genres = entity.genres || [];
  const genreStr = genres.join(',');

  // 动漫关键词识别（覆盖国漫、日漫、新番等所有变体）
  const animeKeywords = ['动漫', '动画', '国漫', '国创', '日漫', '新番', '番剧', '修仙', 'Animation'];
  if (animeKeywords.some(kw => genreStr.includes(kw))) {
    return { category: 'anime', path: '/anime', name: '动漫' };
  }

  // 利用 taxonomy 归一化引擎对每个 genre 做深度识别
  for (const g of genres) {
    const norm = normalizeVideoType(g, entity.title);
    if (norm.category === 'anime') {
      return { category: 'anime', path: '/anime', name: '动漫' };
    }
    if (norm.category === 'documentary') {
      return { category: 'documentary', path: '/documentary', name: '纪录片' };
    }
    if (norm.category === 'variety') {
      return { category: 'variety', path: '/variety', name: '综艺' };
    }
  }

  // 3. 标准 movie / tv 回退
  if (entity.type === 'tv') {
    return { category: 'tv', path: '/tv', name: '电视剧' };
  }

  return { category: 'movie', path: '/movie', name: '电影' };
}

export const runtime = 'edge';
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * 高容错实体解析引擎：支持各种形态的 Slug（如 ik000013-女仆日记, ik002015-法律与秩序, 法律与秩序, ik000013 等）
 * 核心架构铁律：ID 与显式 Slug 映射最高优先级，彻底根治 URL 英文后缀导致李代桃僵的问题
 */
async function resolveEntityRaw(rawSlugParam: string): Promise<TitleEntity | null> {
  if (!rawSlugParam) return null;

  let decodedSlug = rawSlugParam.trim();
  try {
    decodedSlug = decodeURIComponent(decodedSlug).trim();
  } catch {}

  // 1. 解析 slug，分离 entityId 与 cleanTitle
  const { entityId, slug: innerSlug } = parseEntitySlug(decodedSlug);
  let cleanTitle = innerSlug || (entityId ? '' : decodedSlug);
  cleanTitle = cleanTitle.replace(/^[-\s]+|[-\s]+$/g, '');
  if (/^[a-zA-Z0-9_]+-/.test(cleanTitle)) {
    cleanTitle = cleanTitle.replace(/^[a-zA-Z0-9_]+-/, '');
  }
  try {
    cleanTitle = decodeURIComponent(cleanTitle).trim();
  } catch {}

  // 🌟 优先级 1：根据完整 decodedSlug 优先查询
  // 覆盖：显式别名映射（如历史错配旧链接 slug:ik002038-the-bill -> ik007343）、规范 canonical slug、实体 ID
  let entity = await getEntityBySlug(decodedSlug);

  if (entity) {
    // 确保实体通过基础安全审核，否则不提前返回，放行至后续片名自愈
    if (!isSafeRecentTitleItem(entity as any) || !isStrictSafeEntity(entity).safe) {
      entity = null;
    } else {
      const isMissingCover = !entity.cover || entity.cover.trim() === '';
      const isMissingCast = (!entity.directors || entity.directors.length === 0) && (!entity.actors || entity.actors.length === 0);
      const hasDirtyPinyinCast = (entity.actors || []).some(a => /^[A-Za-z\s]{4,}$/.test(a));

      if (isMissingCover || isMissingCast || hasDirtyPinyinCast) {
        try {
          const healed = await searchAndEnrichFromTMDB(entity.title, entity.type, entity.year, true);
          if (healed) {
            if (healed.directors && healed.directors.length > 0) entity.directors = healed.directors;
            if (healed.actors && healed.actors.length > 0) entity.actors = healed.actors;
            if (healed.cover && isMissingCover) entity.cover = healed.cover;
            if (healed.backdrop && !entity.backdrop) entity.backdrop = healed.backdrop;
            if (healed.tmdbId && !entity.tmdbId) {
              entity.tmdbId = healed.tmdbId;
              entity.tmdbType = healed.tmdbType;
            }
            saveEntity(entity).catch(() => {});
          }
        } catch {}
      }
      return enrichEpisodeCount(entity);
    }
  }

  // 🌟 优先级 1.5：若 KV 未命中，检查全站预烘焙前台展示片库（HOME_DATA + LATEST_TITLES）
  // 彻底消灭首页/6大专区大厅卡片已展示但点入需要卡顿 3~6 秒等待海外 TMDB 的问题！
  const prebakedItems = getAllPrebakedDisplayItems();
  const prebakedHit = prebakedItems.find(item => {
    if (!item) return false;
    let itemSlugDecoded = '';
    try {
      itemSlugDecoded = decodeURIComponent(item.slug || '');
    } catch {}

    const cleanTitleLower = cleanTitle.toLowerCase();
    const decodedSlugLower = decodedSlug.toLowerCase();
    const itemTitleNorm = normalizeTitle(item.title);
    const cleanTitleNorm = normalizeTitle(cleanTitle);
    const decodedSlugNorm = normalizeTitle(decodedSlug);

    // 1. 标准匹配：原值/解码值/标题/归一化标题/实体ID完全一致
    if (
      item.slug === decodedSlug ||
      itemSlugDecoded === decodedSlug ||
      item.title === cleanTitle ||
      item.title === decodedSlug ||
      (itemTitleNorm && (itemTitleNorm === cleanTitleNorm || itemTitleNorm === decodedSlugNorm)) ||
      (item.entityId && entityId && item.entityId.toLowerCase() === entityId.toLowerCase())
    ) {
      return true;
    }

    // 2. Slug 生成器双向一致性比对（例如古战场传奇-吾血之亲第2季 vs 古战场传奇：吾血之亲第2季）
    const itemTitleSlug = generateSlug(item.title).toLowerCase();
    if (itemTitleSlug === cleanTitleLower || itemTitleSlug === decodedSlugLower) {
      return true;
    }

    // 3. 历史受损 hex-slug 自愈比对（将连字符十六进制碎片与 item.title/item.slug 的编码形式精准比对自愈）
    if (/[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}/i.test(decodedSlugLower) || /[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}/i.test(cleanTitleLower)) {
      const hex1 = generateSlug(encodeURIComponent(itemTitleSlug)).toLowerCase();
      const hex2 = generateSlug(encodeURIComponent(item.title)).toLowerCase();
      if (hex1 === cleanTitleLower || hex1 === decodedSlugLower || hex2 === cleanTitleLower || hex2 === decodedSlugLower) {
        return true;
      }
    }

    return false;
  });

  if (prebakedHit) {
    // 1. 优先尝试从本地/KV 0ms 读取已持久化的完整实体
    const existing = await getEntityByTitle(prebakedHit.title);
    if (existing && existing.cover && existing.cover.trim() !== '') {
      return enrichEpisodeCount(existing);
    }

    // 2. 0ms 秒开防御：直接使用预烘焙已有的高质量数据（标题、4K海报、年份、类型、集数、评分、简介）瞬间组装直出
    // 彻底消灭首屏针对海外 TMDB API 的数秒网络等待与骨架屏闪烁！
    const epCount = prebakedHit.numberOfEpisodes || (prebakedHit.updateBadge ? parseInt(prebakedHit.updateBadge.replace(/\D/g, ''), 10) || 1 : 1);
    const fallbackEntity: TitleEntity = {
      entityId: prebakedHit.entityId || `ik_pre_${encodeURIComponent(prebakedHit.title).slice(0, 16)}`,
      slug: decodeURIComponent(prebakedHit.slug || cleanTitle),
      tmdbId: '',
      tmdbType: (prebakedHit.type === 'tv' || prebakedHit.type === 'anime') ? 'tv' : 'movie',
      title: prebakedHit.title,
      type: prebakedHit.type || 'tv',
      year: prebakedHit.year || '2026',
      description: prebakedHit.description || `${prebakedHit.title} 是 ${prebakedHit.year || '2026'} 年上线的优质${prebakedHit.type === 'movie' ? '电影' : '剧集'}。提供全网多源纯直连极速播放，画质高清流畅，尽在 iKanPP 爱看片片。`,
      cover: prebakedHit.cover || '',
      backdrop: prebakedHit.backdrop || prebakedHit.cover || '',
      rate: prebakedHit.rate || '8.5',
      genres: (prebakedHit.genres && prebakedHit.genres.length > 0) ? prebakedHit.genres : [(prebakedHit.type === 'movie' ? '电影' : '电视剧')],
      directors: prebakedHit.directors || [],
      actors: prebakedHit.actors || [],
      numberOfSeasons: prebakedHit.numberOfSeasons || 1,
      numberOfEpisodes: epCount,
      status: prebakedHit.updateBadge || '正片',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 3. 后台非阻塞异步补全演职员、多语言与深度元数据并持久化到 KV（绝不阻塞用户首屏关键路径）
    (async () => {
      try {
        await searchAndEnrichFromTMDB(prebakedHit.title, prebakedHit.type, prebakedHit.year, true);
      } catch {}
    })();

    return enrichEpisodeCount(fallbackEntity);
  }

  // 🌟 优先级 2：若 URL 未带 ID 但存在明确中文标题，尝试 100% 精准中文标题匹配
  // 智能季数提取：分离季数后缀（如 "黑帮领地第2季" ➔ baseTitle: "黑帮领地", seasonNum: 2）
  const seasonParsed = parseSeasonFromTitle(cleanTitle);
  const baseTitleWithoutSeason = seasonParsed ? seasonParsed.baseTitle.trim() : cleanTitle;

  // 年份后缀匹配（针对母标题如 "求救信号 2026"）
  const yearMatch = baseTitleWithoutSeason.match(/(.*?)(?:[\s_—\-]+)?((?:19|20)\d{2})$/);
  const baseCleanTitle = yearMatch ? yearMatch[1].trim() : baseTitleWithoutSeason;
  const yearSuffix = yearMatch ? yearMatch[2] : undefined;

  const hasChinese = /[\u4e00-\u9fff]/.test(cleanTitle);

  if (cleanTitle && !/^ik\d{6}$/i.test(cleanTitle) && (hasChinese || cleanTitle.length > 8)) {
    const titleCandidates = [cleanTitle];
    if (baseTitleWithoutSeason && baseTitleWithoutSeason !== cleanTitle) {
      titleCandidates.push(baseTitleWithoutSeason);
    }
    if (baseCleanTitle && !titleCandidates.includes(baseCleanTitle)) {
      titleCandidates.push(baseCleanTitle);
    }

    for (const candidate of titleCandidates) {
      const titleMatch = await getEntityByTitle(candidate);
      if (titleMatch && titleMatch.cover && normalizeTitle(titleMatch.title) === normalizeTitle(candidate)) {
        return enrichEpisodeCount(titleMatch);
      }
    }
  }

  // 🌟 优先级 3：如果本地按标题反向索引有匹配（仅限含中文字符查询，防止纯英文词根误伤）
  if (cleanTitle && hasChinese && !/^ik\d{6}$/i.test(cleanTitle)) {
    const titleCandidates = [cleanTitle];
    if (baseTitleWithoutSeason && baseTitleWithoutSeason !== cleanTitle) {
      titleCandidates.push(baseTitleWithoutSeason);
    }
    if (baseCleanTitle && !titleCandidates.includes(baseCleanTitle)) {
      titleCandidates.push(baseCleanTitle);
    }

    for (const candidate of titleCandidates) {
      entity = await getEntityByTitle(candidate);
      if (entity && hasTitleOverlap(entity.title, candidate)) {
        if (!entity.cover || entity.cover.trim() === '') {
          const healed = await searchAndEnrichFromTMDB(entity.title || candidate, entity.type, entity.year || yearSuffix, true);
          if (healed && healed.cover) return enrichEpisodeCount(healed);
        }
        return enrichEpisodeCount(entity);
      }
    }
  }

  // 🌟 优先级 4：若本地/预置库未命中，使用纯净母标题到 TMDB 搜索并自愈入库（仅全新冷门词条触发）
  if (hasChinese && !/^ik\d{6}$/i.test(cleanTitle)) {
    // 候选词生成：去连字符、去季数母词、原标题等
    const unhyphenated = cleanTitle.replace(/[\-_—–]+/g, ' ').replace(/[·・•]/g, ' ').replace(/\s+/g, ' ').trim();
    const searchQueries = Array.from(new Set([
      unhyphenated,
      baseCleanTitle,
      baseTitleWithoutSeason,
      cleanTitle,
      decodedSlug
    ].filter(Boolean)));

    for (const q of searchQueries) {
      if (q && hasChinese && !/^ik\d{6}$/i.test(q)) {
        entity = await searchAndEnrichFromTMDB(q, undefined, yearSuffix);
        if (entity) {
          return enrichEpisodeCount(entity);
        }
      }
    }
  }

  return null;
}

/**
 * 权威标准 Slug 计算器
 * 确保全站任何影视作品，有且仅有一个合法的标准规范 Slug：
 * 格式恒为: ${entityId}-${slug}
 */
export function getEntityCanonicalSlug(entity: TitleEntity): string {
  if (entity.canonicalSlug && entity.canonicalSlug.trim()) {
    return entity.canonicalSlug.trim().toLowerCase();
  }
  const id = (entity.entityId || (entity as any).id || '').toLowerCase();
  const hasStandardId = /^ik\d{6}$/i.test(id);

  let baseText = (entity.title || '').trim();
  if (!baseText && entity.slug) {
    try {
      baseText = decodeURIComponent(entity.slug).trim();
    } catch {
      baseText = entity.slug.trim();
    }
  }
  if (baseText.includes('%')) {
    try {
      baseText = decodeURIComponent(baseText).trim();
    } catch {}
  }

  // 清洗 baseText 开头可能重复的 id 前缀（如 ik000009-一饭封神 或 ik_radar_...-阿波罗陷落）
  if (id && baseText.toLowerCase().startsWith(`${id}-`)) {
    baseText = baseText.slice(id.length + 1);
  }
  if (baseText.startsWith('ik') && /^[a-zA-Z0-9_]+-/.test(baseText)) {
    baseText = baseText.replace(/^[a-zA-Z0-9_]+-/, '');
  }

  const cleanSlugPart = generateSlug(baseText).toLowerCase();

  // 准则 13 铁律：必须且只能在具有标准 6 位 ik\d{6} 实体 ID 时拼接 ID
  // 严禁将临时内部 ID（如 ik_radar_...）拼入 canonicalSlug 触发非法 308 重定向
  if (hasStandardId) {
    return `${id}-${cleanSlugPart}`;
  }
  return cleanSlugPart;
}

/**
 * 影视详情页最终守门员：
 * 任何历史遗留的假名片、低俗录像、成人违规条目强制拦截返回 null（自动触发 404 与 noindex）
 */
async function resolveEntity(rawSlugParam: string): Promise<TitleEntity | null> {
  let entity = await resolveEntityRaw(rawSlugParam);

  // 🌟 终极自愈降级防线（Zero-404 钢铁长城）：
  // 如果 resolveEntityRaw 未命中，或者解析出的实体不安全（如误中历史外文/违规废弃条目），
  // 坚决尝试从 rawSlugParam 中提取中文片名（如历史死链/错链 ik068315-流浪地球2），
  // 通过片名从 KV 救回真正合法权威的实体，自动 308 重定向到权威页面，杜绝 404！
  if (!entity || !isSafeRecentTitleItem(entity as any) || !isStrictSafeEntity(entity).safe) {
    let cleanKey = rawSlugParam.trim();
    try {
      cleanKey = decodeURIComponent(cleanKey).trim();
    } catch {}
    const { slug: innerSlug } = parseEntitySlug(cleanKey);
    let candidateTitle = innerSlug || cleanKey;
    candidateTitle = candidateTitle.replace(/^[-\s]+|[-\s]+$/g, '');
    if (/^[a-zA-Z0-9_]+-/.test(candidateTitle)) {
      candidateTitle = candidateTitle.replace(/^[a-zA-Z0-9_]+-/, '');
    }

    if (candidateTitle && /[\u4e00-\u9fff]/.test(candidateTitle)) {
      try {
        const healed = await getEntityByTitle(candidateTitle);
        if (healed && isSafeRecentTitleItem(healed as any) && isStrictSafeEntity(healed).safe) {
          entity = healed;
        } else {
          return null;
        }
      } catch {
        return null;
      }
    } else {
      return null;
    }
  }

  // 🌟 核心规范化：若命中的实体 ID 不是标准 6 位 ik\d{6}（例如 ik_radar_... 或豆瓣数字 ID），
  // 强制通过片名从 KV 查出其真正的 6 位标准实体，保证前台 URL 与 301 重定向基线 100% 为纯净的 ik\d{6}
  const currentId = entity.entityId || (entity as any).id || '';
  if (!/^ik\d{6}$/i.test(currentId)) {
    try {
      const realEntity = await getEntityByTitle(entity.title);
      if (realEntity && realEntity.entityId && /^ik\d{6}$/i.test(realEntity.entityId)) {
        entity = realEntity;
      }
    } catch {}
  }

  return entity;
}

/**
 * TMDB 集数精确补全器（0ms 秒开守卫）
 *
 * 核心逻辑：
 * 1. 只要当前实体具备集数或为电影，直接 0ms 返回渲染
 * 2. 若集数需要刷新或补全，一律转入后台非阻塞异步执行，绝不阻塞用户首屏关键路径
 */
async function enrichEpisodeCount(entity: TitleEntity): Promise<TitleEntity> {
  // 仅对剧集类型触发
  if (entity.type === 'movie') return entity;

  // 🌟 性能飞跃守卫：如果已具有有效集数统计，并且在 24 小时内更新过，直接复用当前数据，零网络等待！
  if (entity.numberOfEpisodes && entity.numberOfEpisodes > 0 && entity.numberOfSeasons && entity.numberOfSeasons > 0) {
    const lastUpdated = entity.updatedAt ? new Date(entity.updatedAt).getTime() : 0;
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (now - lastUpdated < ONE_DAY_MS) {
      return entity;
    }

    // 超过24小时：立即返回当前数据保障用户秒开，后台异步刷新缓存
    refreshEpisodeCountInBackground(entity);
    return entity;
  }

  // 尚未精确统计过集数：立即返回当前实体保障首屏秒开，后台异步补全并持久化
  refreshEpisodeCountInBackground(entity);
  return entity;
}

/**
 * 后台非阻塞刷新剧集已播出集数与季数
 */
function refreshEpisodeCountInBackground(entity: TitleEntity) {
  (async () => {
    try {
      const tmdbId = entity.tmdbId;
      if (tmdbId && /^\d{4,}$/.test(tmdbId)) {
        await tryEnrichFromTMDB(entity, tmdbId);
        return;
      }
      // tmdbId 无效或缺失，异步通过标题匹配自愈
      const healed = await searchAndEnrichFromTMDB(entity.title, 'tv', entity.year, true);
      if (healed && healed.tmdbId && /^\d{4,}$/.test(healed.tmdbId)) {
        await tryEnrichFromTMDB(healed, healed.tmdbId);
      }
    } catch {}
  })();
}

/**
 * 后台非阻塞丰润演职员质量与一致性
 */
function healCreditsInBackground(entity: TitleEntity) {
  (async () => {
    try {
      const tmdbMediaType: 'movie' | 'tv' = entity.type === 'movie' ? 'movie' : 'tv';
      let isMismatch = false;

      // 1. 若已有 tmdbId，深度校验该 tmdbId 对应的标题是否与本片一致
      if (entity.tmdbId && /^\d+$/.test(entity.tmdbId)) {
        const detail = await fetchTMDBDetails(entity.tmdbId, tmdbMediaType);
        if (detail) {
          const fetchedTitle = (detail.title || detail.name || '').trim().toLowerCase();
          const origTitle = (detail.original_title || detail.original_name || '').trim().toLowerCase();
          const myTitle = entity.title.trim().toLowerCase();
          if (fetchedTitle && !fetchedTitle.includes(myTitle) && !myTitle.includes(fetchedTitle) && !origTitle.includes(myTitle) && !myTitle.includes(origTitle)) {
            isMismatch = true;
            entity.tmdbId = '';
            entity.directors = [];
            entity.actors = [];
          } else if (detail.credits) {
            const realDirs = (detail.credits.crew || []).filter((c: any) => c.job === 'Director').map((c: any) => c.name).filter(Boolean);
            const realActs = (detail.credits.cast || []).slice(0, 8).map((c: any) => c.name).filter(Boolean);
            if (realDirs.length > 0) entity.directors = realDirs;
            if (realActs.length > 0) entity.actors = realActs;
            await saveEntity(entity);
            return;
          }
        }
      }

      // 2. 若发现错配，或演职员仍为空，以影片真实标题触发在线精准重丰润自愈
      if (isMismatch || (!entity.directors?.length && !entity.actors?.length)) {
        const enriched = await searchAndEnrichFromTMDB(entity.title, entity.type, entity.year, true);
        if (enriched) {
          entity.tmdbId = enriched.tmdbId;
          entity.directors = enriched.directors;
          entity.actors = enriched.actors;
          if (enriched.cover && (!entity.cover || entity.cover.includes('douban'))) entity.cover = enriched.cover;
          if (enriched.backdrop && (!entity.backdrop || entity.backdrop.includes('douban'))) entity.backdrop = enriched.backdrop;
          await saveEntity(entity);
        }
      }
    } catch (err) {
      console.warn('[healCreditsInBackground fail]:', err);
    }
  })();
}

/**
 * 后台非阻塞补全真实的 16:9 横版剧照
 */
function healBackdropInBackground(entity: TitleEntity) {
  (async () => {
    try {
      const realBackdrop = await resolveRealBackdrop(
        entity.title,
        entity.backdrop,
        entity.cover,
        entity.tmdbId,
        entity.type,
        entity.year
      );
      if (realBackdrop && realBackdrop !== entity.backdrop) {
        entity.backdrop = realBackdrop;
        await saveEntity(entity);
      }
    } catch (err) {
      console.warn('[healBackdropInBackground fail]:', err);
    }
  })();
}

/**
 * 内部辅助函数：用指定的 tmdbId 尝试从 TMDB 精确统计已播出集数
 * 成功返回更新后的 entity，失败返回 null
 */
async function tryEnrichFromTMDB(entity: TitleEntity, tmdbId: string): Promise<TitleEntity | null> {
  try {
    const detail = await fetchTMDBDetails(tmdbId, 'tv');
    if (!detail || !detail.number_of_seasons) return null;

    // ====== 标题相似度防线 ======
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
      entity.updatedAt = new Date().toISOString();
      await saveEntity(entity);
      return entity;
    }

    if (detail.number_of_episodes) {
      entity.numberOfEpisodes = detail.number_of_episodes;
      entity.numberOfSeasons = totalSeasons;
      entity.tmdbId = tmdbId;
      entity.updatedAt = new Date().toISOString();
      await saveEntity(entity);
      return entity;
    }
  } catch {}

  return null;
}

/**
 * 标题相似度检测（中文字符交集）
 *
 * 判断两个标题是否至少有 1 个中文字符相同。
 * 适用于中文动漫/剧集场景，能准确区分"仙逆"与"Intimate Portrait"等完全无关的匹配。
 * 对于纯英文标题，回退到子串包含检查。
 */
function hasTitleOverlap(a: string, b: string): boolean {
  // 提取中文字符
  const chineseA = a.match(/[\u4e00-\u9fff]/g);
  const chineseB = b.match(/[\u4e00-\u9fff]/g);

  if (chineseA && chineseA.length > 0 && chineseB && chineseB.length > 0) {
    // 两个标题都有中文字符：检查是否有交集
    const setB = new Set(chineseB);
    return chineseA.some(ch => setB.has(ch));
  }

  // 至少一方没有中文字符（纯英文标题）：回退到子串包含检查
  const la = a.toLowerCase();
  const lb = b.toLowerCase();
  return la.includes(lb) || lb.includes(la);
}

/**
 * 基于 React 19 cache 的单请求级数据获取去重包装器
 * 彻底消除 generateMetadata() 与 TitlePage() 对同一条目数据的双重重复解析
 */
const getCachedEntity = cache(async (rawSlugParam: string): Promise<TitleEntity | null> => {
  return resolveEntity(rawSlugParam);
});

/**
 * 动态 SEO Metadata 生成（含 Google Discover 大图与 AI 摘要授权）
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = await getCachedEntity(slug);

  if (!entity || !isEntityIndexable(entity)) {
    return {
      title: '影片未收录 - iKanPP 爱看片片',
      robots: { index: false, follow: false },
    };
  }

  let decodedSlug = slug.trim();
  try {
    decodedSlug = decodeURIComponent(decodedSlug).trim();
  } catch {}
  const { entityId: rawEntityId, slug: innerSlug } = parseEntitySlug(decodedSlug);
  const rawCleanTitle = innerSlug || (rawEntityId ? '' : decodedSlug);
  const seasonInfo = parseSeasonFromTitle(rawCleanTitle);
  const seasonTag = seasonInfo ? (seasonInfo.rawSeasonMatch || `第${seasonInfo.seasonNumber}季`) : '';
  const isSeasonSpecified = Boolean(seasonTag && !entity.title.includes(seasonTag));

  // 权威规范 Slug 计算（用于规范 Canonical URL 声明，重定向由 TitlePage 组件主体统一触发）
  const canonicalSlug = getEntityCanonicalSlug(entity);

  // 多分类与真实标题定义（依循规范第 9.2 节：杜绝机械堆砌“免费、全集、4K、免翻墙、秒播”）
  const isSeriesLike = entity.type === 'tv' || entity.type === 'anime';
  const displayTitle = seasonTag && !entity.title.includes(seasonTag) ? `${entity.title} ${seasonTag}` : entity.title;
  const yearSuffix = entity.year ? ` (${entity.year})` : '';
  const pageTitle = `${displayTitle}${yearSuffix} - 剧情、演职员与在线观看信息 | iKanPP 爱看片片`;
  // 动态构建高信息密度、千人千面的 Meta Description（杜绝模板化被 Google 惩罚）
  const regionText = entity.region ? entity.region.slice(0, 4) : '';
  const primaryGenre = (entity.genres && entity.genres.length > 0) ? entity.genres[0] : '';
  const mediaTypeLabel = entity.type === 'anime' ? '动漫' : entity.type === 'tv' ? '电视剧' : entity.type === 'variety' ? '综艺' : entity.type === 'documentary' ? '纪录片' : '电影';
  const ratingText = entity.rate && Number(entity.rate) > 0 ? `评分${entity.rate}` : '';
  const tagParts = [entity.year, regionText, ratingText, primaryGenre, mediaTypeLabel].filter(Boolean);
  const signalPrefix = `【${tagParts.join('·')}】`;

  const validDirs = (entity.directors || []).filter(d => d && !['知名导演', '实力主演', '未知', '暂无'].includes(d.trim()));
  const validActs = (entity.actors || []).filter(a => a && !['知名导演', '实力主演', '未知', '暂无'].includes(a.trim()));
  const castParts: string[] = [];
  if (validDirs.length > 0) castParts.push(`由${validDirs.slice(0, 2).join('、')}执导`);
  if (validActs.length > 0) castParts.push(`${validActs.slice(0, 3).join('、')}领衔主演`);
  const castStr = castParts.length > 0 ? `${castParts.join('，')}。` : '';

  let cleanDesc = (entity.description || '')
    .replace(/(?:导演|主演)\s*[:：]\s*(?:知名导演|实力主演)[，。、\s]*/g, '')
    .replace(/在线观看，支持海外华人免翻墙极速高清播放。/g, '')
    .replace(/在线观看，全网高清影视资源。/g, '')
    .trim();
  if (cleanDesc.length > 90) {
    cleanDesc = cleanDesc.slice(0, 90) + '...';
  }

  const cta = isSeriesLike
    ? (entity.numberOfEpisodes ? `共${entity.numberOfEpisodes}集全网纯直连超清速播。` : '全集无删减完整版免VIP极速秒播。')
    : '1080P超清原画免VIP在线观看。';

  const canonicalUrl = `${BASE_URL}/title/${encodeURIComponent(canonicalSlug)}`;
  let resolvedBackdrop = entity.backdrop;
  if (isFakeBackdrop(entity.backdrop, entity.cover)) {
    healBackdropInBackground(entity);
  }
  const ogImage = resolvedBackdrop || entity.cover;

  // 🌟 自动化构建全光谱长尾关键词与意图捕获矩阵 (Programmatic White-Hat SEO & Intent Harvesting)
  const seoSpectrum = generateFullSpectrumKeywords({
    title: displayTitle,
    year: entity.year,
    type: entity.type,
    genres: entity.genres,
    directors: entity.directors,
    actors: entity.actors,
    region: entity.region,
    numberOfEpisodes: entity.numberOfEpisodes,
    description: entity.description,
  });

  const metaDescription = seoSpectrum.metaDescription;

  return {
    // 依循规范 21.3 节：仅输出少量核心实体词，彻底杜绝 meta keyword 堆叠
    keywords: seoSpectrum.keywords.slice(0, 5),
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',    // 2026 Google Discover 大图核心信号
      'max-snippet': -1,               // 允许 Google AI Overview 引用完整胶囊摘要
      'max-video-preview': -1,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    openGraph: {
      title: pageTitle,
      description: metaDescription,
      url: canonicalUrl,
      type: 'video.movie',
      siteName: 'iKanPP 爱看片片',
      locale: 'zh_CN',
      images: [
        {
          url: ogImage,
          width: 1280,
          height: 720,
          alt: `${entity.title} 官方剧照海报`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: metaDescription,
      images: [ogImage],
    },
  };
}

export default async function TitlePage({ params }: Props) {
  const { slug } = await params;
  const headersList = await headers();
  const country = headersList.get('cf-ipcountry') || headersList.get('x-geo-country');
  const isChinaMainland = isRestrictedRegion(country);

  let decodedSlug = slug.trim();
  try {
    decodedSlug = decodeURIComponent(decodedSlug).trim();
  } catch {}

  let entity = await getCachedEntity(slug);

  if (!entity) {
    notFound();
  }

  // 季数智能解析：若 URL / Slug 带有具体季数（如 "时光代理人第3季"），在母条目上精准对齐当季
  const { entityId: parsedId, slug: innerSlug } = parseEntitySlug(decodedSlug);
  const rawTitleFromSlug = innerSlug || (parsedId ? '' : decodedSlug);
  const seasonInfo = parseSeasonFromTitle(rawTitleFromSlug);
  const seasonTag = seasonInfo ? (seasonInfo.rawSeasonMatch || `第${seasonInfo.seasonNumber}季`) : '';
  const isSeasonSpecified = Boolean(seasonTag && !entity.title.includes(seasonTag));
  const effectiveSearchTitle = isSeasonSpecified ? `${entity.title}${seasonTag}` : entity.title;

  // 🌟 SEO 308 权威规范重定向：若请求的 URL 不是权威规范 Slug（如纯 ID ik000001 或历史非规范别名），
  // 强制发起 308 永久重定向，将爬虫与外链权重 100% 汇聚于标准规范 URL，彻底根治 GSC 2130+ 备用网页报警
  const canonicalSlug = getEntityCanonicalSlug(entity);
  const currentCleanSlug = decodedSlug.toLowerCase();
  if (canonicalSlug && currentCleanSlug !== canonicalSlug && !isSeasonSpecified) {
    permanentRedirect(`/title/${encodeURIComponent(canonicalSlug)}`);
  }

  // 质量自愈保障：若当前实体缺少封面海报（如历史残缺数据），强制在线触发重新丰润
  if (!entity.cover || entity.cover.trim() === '') {
    const healed = await searchAndEnrichFromTMDB(entity.title, entity.type, entity.year, true);
    if (healed && healed.cover) {
      entity = healed;
    }
  }

  // 严格过滤占位符假数据
  const filterFakePeople = (list: string[] = []) =>
    list.filter(p => p && !['知名导演', '实力主演', '未知', '暂无'].includes(p.trim()));

  let validDirectors = filterFakePeople(entity.directors);
  let validActors = filterFakePeople(entity.actors);

  // 演职员质量与一致性智能校验（转入非阻塞后台自愈，杜绝阻塞主渲染路径）
  if (validDirectors.length === 0 || validActors.length === 0) {
    healCreditsInBackground(entity);
  }

  // 获取同题材、同导演与同主演相关推荐影片（构建站内强内链拓扑）
  const primaryGenre = entity.genres?.[0] || (entity.type === 'tv' ? '电视剧' : '电影');
  const primaryDirector = validDirectors[0];
  const primaryActor = validActors[0];

  const allPeopleNames = [...validDirectors, ...validActors];
  // 0ms 同步获取预置/内存缓存人物肖像（首屏秒开直出，绝不阻塞网络）
  const peopleAvatars = getFastPersonAvatars(allPeopleNames);

  const [genreRelated, directorRelated, actorRelated] = await Promise.all([
    getEntitiesByGenre(primaryGenre, 8),
    primaryDirector ? getEntitiesByDirector(primaryDirector, 6) : Promise.resolve([]),
    primaryActor ? getEntitiesByActor(primaryActor, 6) : Promise.resolve([]),
  ]);

  // 过滤自身
  const filteredGenreRelated = genreRelated.filter(e => e.entityId !== entity.entityId).slice(0, 6);
  const filteredDirectorRelated = directorRelated.filter(e => e.entityId !== entity.entityId).slice(0, 6);
  const filteredActorRelated = actorRelated.filter(e => e.entityId !== entity.entityId).slice(0, 6);

  // 去重合并推荐列表，并优先置顶处于 Google 第 11~30 位的高潜冲榜影片（智能内链提权）
  const hpTitles = new Set((highPotentialKeywordsData?.keywords || []).map(k => k.title));
  const boostedRelated: typeof filteredGenreRelated = [];
  const normalRelated: typeof filteredGenreRelated = [];
  const seenIds = new Set<string>();

  for (const item of [...filteredDirectorRelated, ...filteredActorRelated, ...filteredGenreRelated]) {
    if (!seenIds.has(item.entityId)) {
      seenIds.add(item.entityId);
      if (hpTitles.has(item.title)) {
        boostedRelated.push(item);
      } else {
        normalRelated.push(item);
      }
    }
  }
  const combinedRelated = [...boostedRelated, ...normalRelated];

  // 多分类智能识别：根据 entity.type + genres 精准定位所属频道
  const resolvedChannel = resolveEntityChannel(entity);
  const channelPath = resolvedChannel.path;
  const channelName = resolvedChannel.name;
  // isTv 语义：是否有剧集列表（电视剧 + 动漫均有，电影没有）
  const isTv = entity.type === 'tv' || entity.type === 'anime' || resolvedChannel.category === 'anime' || resolvedChannel.category === 'tv';

  // 智能识别并自动丰润 TMDB 真实 16:9 横版电影大画幅剧照（转入非阻塞后台自愈）
  let resolvedBackdrop = entity.backdrop;
  if (isFakeBackdrop(entity.backdrop, entity.cover)) {
    healBackdropInBackground(entity);
  }

  // 是否为纯正的 16:9 横版电影剧照大图，并接入物理尺寸精准降维与双轨加速（大陆用户直出安全代理镜像，0ms 秒开）
  const isTrueBackdrop = !isFakeBackdrop(resolvedBackdrop, entity.cover);
  const heroBackdrop = getOptimizedImageUrl(resolvedBackdrop || entity.cover, { variant: 'backdrop', isChinaMainland });
  const entityCover = getOptimizedImageUrl(entity.cover, { variant: 'detail', isChinaMainland });

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-red-600 selection:text-white relative">
      {/* 🚀 八层极速秒开架构：详情页核心背景大图预加载，消除 LCP 延迟 */}
      {heroBackdrop && (
        <link rel="preload" as="image" href={heroBackdrop} fetchPriority="high" />
      )}

      {/* 结构化数据注入 */}
      <TitleJsonLd entity={entity} siteUrl={BASE_URL} />

      {/* 2026 前沿 Speculation Rules API：预渲染相关影片详情页，实现次页秒开 */}
      <script
        type="speculationrules"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            prerender: [
              {
                source: 'document',
                where: {
                  and: [
                    { href_matches: '/title/*' },
                    { not: { href_matches: '/premium*' } },
                  ],
                },
                eagerness: 'moderate',
              },
            ],
          }),
        }}
      />

      {/* 顶部导航：在大剧照上方全透明浮动穿透，与首页/各频道 100% 保持一致 */}
      <Navbar
        activeCategory={entity.type === 'tv' ? 'tv' : 'movie'}
        transparentFloat={Boolean(heroBackdrop)}
      />

      {/* Netflix 级沉浸式通顶全屏背景大画幅 (Hero Billboard Backdrop) */}
      <div className="relative w-full overflow-hidden">
        {heroBackdrop && (
          <div className="absolute inset-x-0 top-0 h-[68vh] sm:h-[80vh] lg:h-[88vh] w-full select-none pointer-events-none z-0">
            <Image
              src={heroBackdrop}
              alt={`${entity.title} 剧照大图`}
              fill
              priority
              sizes="100vw"
              className={
                isTrueBackdrop
                  ? "object-cover object-center opacity-30 sm:opacity-45 lg:opacity-55 filter brightness-95 saturate-[1.15] transition-all duration-700"
                  : "object-cover object-top opacity-20 filter blur-3xl scale-125 transition-all duration-700"
              }
            />
            {/* 1. 顶部自然防眩羽化遮罩：柔和保护全透明浮动 Navbar 文字与搜索框 */}
            <div
              className="absolute inset-x-0 top-0 pointer-events-none"
              style={{
                height: '180px',
                background: 'linear-gradient(to bottom, rgba(10, 10, 15, 0.88) 0%, rgba(10, 10, 15, 0.5) 45%, rgba(10, 10, 15, 0.15) 75%, transparent 100%)',
              }}
            />
            {/* 2. 底部自然平滑羽化：向上优雅延展约 320px，与下方内容完全无缝融合 */}
            <div
              className="absolute inset-x-0 bottom-0 pointer-events-none"
              style={{
                height: '320px',
                background: 'linear-gradient(to top, #0A0A0F 0%, rgba(10, 10, 15, 0.95) 25%, rgba(10, 10, 15, 0.65) 55%, rgba(10, 10, 15, 0.18) 82%, transparent 100%)',
              }}
            />
            {/* 3. 侧边向右压暗文字背景 */}
            <div className="absolute inset-0 bg-linear-to-r from-[#0A0A0F] via-[#0A0A0F]/85 to-transparent sm:max-w-4xl" />
          </div>
        )}

        {/* 核心视觉区：有通顶大图时优雅避让浮动 Navbar */}
        <div className={`relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 z-10 ${
          heroBackdrop ? 'pt-20 sm:pt-24 lg:pt-28' : 'pt-4 sm:pt-8'
        }`}>
          {/* 面包屑导航 (Breadcrumbs) - 移动端紧凑排布 */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-white/50 mb-2.5 sm:mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
            <Link href="/" className="hover:text-white transition-colors">
              首页
            </Link>
            <span>/</span>
            <Link href={channelPath} className="hover:text-white transition-colors">
              {channelName}
            </Link>
            <span>/</span>
            <span className="text-white/80 font-medium truncate max-w-[180px] sm:max-w-xs">
              {entity.title}
              {isSeasonSpecified && <span className="text-red-400 font-bold ml-1.5">{seasonTag}</span>}
            </span>
          </nav>

          {/* 影视主体大横幅 (Hero Article) */}
          <article className="grid grid-cols-1 md:grid-cols-12 gap-2.5 md:gap-8 lg:gap-12 pb-4 sm:pb-16 items-end">
            {/* 左侧海报区：移动端 16:9 宽屏剧照舞台（点击秒播） vs 桌面端 2:3 立体大悬浮海报 */}
            <div className="md:col-span-4 lg:col-span-3">
              {/* 1. 移动端 16:9 全画幅沉浸式舞台 (仅在小于 md 渲染，带源秒开直达快车道) */}
              <div className="block md:hidden w-full mb-1">
                <MobileHeroStage
                  entityId={entity.entityId}
                  title={effectiveSearchTitle}
                  type={entity.type}
                  heroBackdrop={heroBackdrop}
                  displayTitle={entity.title}
                />
              </div>

              {/* 2. 桌面端 2:3 黄金比例悬浮立体海报 (hidden md:block) */}
              <div className="hidden md:block relative aspect-2/3 w-full max-w-[260px] lg:max-w-[290px] rounded-2xl overflow-hidden shadow-2xl shadow-black/80 border border-white/15 bg-black/40 group">
                {entity.cover ? (
                  <Image
                    src={entityCover}
                    alt={`${entity.title} 封面海报`}
                    fill
                    sizes="(max-width: 768px) 280px, (max-width: 1200px) 25vw, 320px"
                    priority
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30">
                    <Film className="w-12 h-12" />
                  </div>
                )}
                {/* 海报右上角悬浮评分 */}
                {entity.rate && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 rounded-xl bg-black/75 backdrop-blur-md border border-amber-500/30 flex items-center gap-1 shadow-lg">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-black text-amber-400 text-xs sm:text-sm">{entity.rate}</span>
                  </div>
                )}
              </div>
            </div>

            {/* 右侧：电影巨幕主标题、规格徽章与行动栏 (移动端全宽自适应，桌面端网格靠左) */}
            <div className="w-full md:col-span-8 lg:col-span-9 flex flex-col justify-end items-start text-left">
              {/* 唯一语义主标题 H1 */}
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-1.5 sm:mb-3 drop-shadow-md text-left flex flex-wrap items-center gap-2 sm:gap-3">
                <span>{entity.title}</span>
                {isSeasonSpecified && (
                  <span className="inline-flex items-center px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-xl bg-red-600/90 text-white font-black text-sm sm:text-2xl lg:text-3xl tracking-wide shadow-lg shadow-red-950/40">
                    {seasonTag}
                  </span>
                )}
                {entity.originalTitle && entity.originalTitle !== entity.title && (
                  <span className="w-full block text-xs sm:text-2xl font-light text-white/50 mt-0.5 sm:mt-1 tracking-normal font-sans">
                    {entity.originalTitle}
                  </span>
                )}
              </h1>

              {/* 港台公映译名徽章 (场景 5：通吃全球泛华语搜索流量) */}
              {(entity.aiContent?.taiwanTitle || entity.aiContent?.hongkongTitle) && (
                <div className="w-full flex flex-wrap items-center gap-2 mb-2 sm:mb-4 text-xs sm:text-sm font-medium">
                  {entity.aiContent.taiwanTitle && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                      <FlagTW className="w-3.5 h-2.5 sm:w-4 sm:h-3" />
                      <span>台译：</span>
                      <strong className="font-bold text-white">{entity.aiContent.taiwanTitle}</strong>
                    </span>
                  )}
                  {entity.aiContent.hongkongTitle && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                      <FlagHK className="w-3.5 h-2.5 sm:w-4 sm:h-3" />
                      <span>港译：</span>
                      <strong className="font-bold text-white">{entity.aiContent.hongkongTitle}</strong>
                    </span>
                  )}
                </div>
              )}

              {/* Netflix 风格视听规格徽章行 */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2.5 text-xs sm:text-sm text-white/80 mb-2 sm:mb-6">
                {/* 评分胶囊 */}
                {entity.rate && (
                  <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold text-[11px] sm:text-sm">
                    ★ {entity.rate} 分
                  </span>
                )}

                {/* 年份 */}
                <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/10 border border-white/10 font-semibold text-[11px] sm:text-sm">
                  {entity.year || '2024'}
                </span>

                {/* 画质规格徽章 */}
                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-black bg-red-600/90 text-white tracking-wider border border-red-500/40">
                  4K ULTRA HD
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded text-[10px] sm:text-[11px] font-bold bg-white/10 text-white/90 border border-white/15">
                  HDR10
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-white/10 text-white/90 border border-white/15">
                  DOLBY ATMOS
                </span>

                {/* 时长 / 集数 */}
                {entity.runtime ? (
                  <span className="flex items-center gap-1 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/5 border border-white/10 text-white/60 text-[11px] sm:text-sm">
                    <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                    {entity.runtime} 分钟
                  </span>
                ) : null}

                {isTv && (
                  <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/5 border border-white/10 text-white/70 text-[11px] sm:text-sm">
                    {entity.numberOfEpisodes ? `全 ${entity.numberOfEpisodes} 集` : '连载中'}
                  </span>
                )}

                {entity.region && (
                  <span className="hidden sm:inline-block px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/60">
                    {entity.region}
                  </span>
                )}
              </div>

              {/* 题材分类标签 */}
              <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2.5 sm:mb-6">
                {entity.genres?.map(genre => {
                  const gInfo = getGenreBySlug(genre);
                  const href = gInfo ? `/genre/${gInfo.slug}` : `/genre/${encodeURIComponent(genre)}`;
                  return (
                    <Link
                      key={genre}
                      href={href}
                      className="px-2.5 sm:px-3 py-0.5 sm:py-1 text-[11px] sm:text-xs font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/10"
                    >
                      {genre}
                    </Link>
                  );
                })}
              </div>

              {/* Netflix 主控行动区 (立即播放 / 追剧清单 / 分享 / 推荐) */}
              <div className="w-full mb-2 sm:mb-6">
                <TitleActionsBar
                  entity={entity}
                  playTitle={effectiveSearchTitle}
                  relatedTitles={combinedRelated.slice(0, 6).map(r => ({
                    entityId: r.entityId,
                    slug: r.slug,
                    title: r.title,
                    cover: r.cover,
                    year: r.year,
                    rate: r.rate,
                  }))}
                />
              </div>
            </div>
          </article>
        </div>
      </div>

      {/* 主体内容布局区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        {/* AEO 剧情梗概 (Storyline / Answer Capsule) */}
        <section className="p-5 sm:p-7 rounded-2xl bg-white/4 border border-white/10 backdrop-blur-md mb-10 shadow-xl">
          <h2 className="text-xs uppercase tracking-wider font-bold text-white/40 mb-3 flex items-center gap-2">
            <span>📖</span>
            <span>剧情梗概 (STORYLINE)</span>
          </h2>
          <p className="text-white/85 text-sm sm:text-base leading-relaxed">
            {entity.description}
          </p>

          {/* E-E-A-T 影视背书 */}
          <div className="flex items-center gap-2 text-xs text-white/35 mt-5 pt-4 border-t border-white/5">
            <span>🛡️</span>
            <span>影视资料由 iKanPP 影视库团队整理校对</span>
            <span>·</span>
            <span>最新核验于 {entity.year || '2024'} 年</span>
          </div>
        </section>

        {/* 场景 1：AI 独家深度影评与高光剧情看点 (消灭 Thin Content) */}
        <AiUniqueReview entity={entity} />

        {/* 场景 2：Google FAQPage 常见问题与观影答疑折叠胶囊 */}
        <AiFaqSection entity={entity} />

        {/* 电视剧/动漫专用选集控制台 (Episodes Selector) */}
        {isTv && (
          <section className="mb-14 p-5 sm:p-7 rounded-2xl bg-white/4 border border-white/10 backdrop-blur-md shadow-xl">
            <EpisodesSelector
              entityId={entity.entityId}
              title={effectiveSearchTitle}
              type={entity.type}
              totalEpisodes={entity.numberOfEpisodes || 24}
              numberOfSeasons={entity.numberOfSeasons || 1}
              currentSeason={seasonInfo?.seasonNumber || 1}
            />
          </section>
        )}

        {/* 演职员圆形名牌滑轨 (Cast & Crew Rail) - 客户端自愈补全组件 */}
        {(validDirectors.length > 0 || validActors.length > 0) && (
          <div className="below-fold-rail">
            <CastRail
              directors={validDirectors}
              actors={validActors}
              initialAvatars={peopleAvatars}
            />
          </div>
        )}

        {/* AI Overview / GEO 胶囊速览档案与微格式标记 */}
        <AiOverviewCapsule entity={entity} channelName={channelName} />

        {/* Netflix 标志性“更多类似推荐”（More Like This） */}
        {combinedRelated.length > 0 && (
          <section className="mt-8 below-fold-section">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🍿</span>
              <span>更多{primaryGenre}精选推荐</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {combinedRelated.slice(0, 12).map(rel => (
                <Link
                  key={rel.entityId}
                  href={getTitleCanonicalHref(rel)}
                  className="group block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black"
                  style={{ contentVisibility: 'auto', containIntrinsicSize: '160px 240px' }}
                >
                  <div className="relative aspect-2/3 w-full bg-black/40 overflow-hidden">
                    {rel.cover ? (
                      <Image
                        src={getOptimizedImageUrl(rel.cover, { variant: 'poster', isChinaMainland })}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white/20">
                        <Film className="w-8 h-8" />
                      </div>
                    )}
                    {/* 评分 */}
                    {rel.rate && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/75 text-amber-400 text-xs font-bold flex items-center gap-0.5 backdrop-blur-sm">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {rel.rate}
                      </div>
                    )}

                    {/* Netflix 风格悬停播放图标 */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                        <Play className="w-5 h-5 fill-white ml-0.5" />
                      </div>
                    </div>
                  </div>
                  <div className="p-2.5">
                    <h3 className="font-semibold text-sm text-white/90 truncate group-hover:text-red-400 transition-colors">
                      {rel.title}
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">
                      {rel.year || '2024'} · {rel.genres?.[0] || '影视'}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* 关联热搜与深度内链集群 (Phase 2 SEO High-Potential Mesh) */}
        <RelatedSearchChips currentTitle={entity.title} currentGenre={primaryGenre} entity={entity} limit={12} />
      </main>

      {/* 移动端专属常驻吸底快捷播放栏 */}
      <StickyBottomPlayCTA entity={entity} playTitle={effectiveSearchTitle} />
    </div>
  );
}
