import { cache } from 'react';
import { after } from 'next/server';
import { TitleEntity } from '@/lib/types/entity';
import {
  getEntityBySlug,
  getEntityById,
  getEntityByTitle,
  getEntityByTmdb,
  saveEntity,
  isSafeRecentTitleItem,
  kvDelete,
} from '@/lib/services/entity-kv';
import {
  parseEntitySlug,
  normalizeTitle,
  isStrictSafeEntity,
  generateSlug,
  decodeMangledHexSlug,
  hasTitleOverlap,
} from '@/lib/data/entities/entity-utils';
import {
  searchAndEnrichFromTMDB,
  enrichEntityByTMDBId,
  fetchTMDBDetails,
  fetchTMDBAiredEpisodeCount,
  resolveRealBackdrop,
} from '@/lib/services/entity-enrichment';
import { normalizeVideoType } from '@/lib/utils/taxonomy';
import { parseSeasonFromTitle } from '@/lib/utils/season-resolver';
import { PREBAKED_LATEST_TITLES } from '@/lib/data/latest-titles-prebaked';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { getPrebakedAiInsight } from '@/lib/data/prebaked-ai-insights';

export interface PrebakedDisplayItem {
  entityId?: string;
  tmdbId?: string;
  tmdbType?: 'movie' | 'tv';
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

export function getAllPrebakedDisplayItems(): PrebakedDisplayItem[] {
  if (cachedAllPrebakedItems) return cachedAllPrebakedItems;

  const items: PrebakedDisplayItem[] = [];
  const seenTitles = new Set<string>();

  // 1. 全专区最新上线雷达库
  for (const list of Object.values(PREBAKED_LATEST_TITLES)) {
    if (Array.isArray(list)) {
      for (const it of list) {
        if (it && it.title && !seenTitles.has(it.title)) {
          seenTitles.add(it.title);
          const rawTmdb = (it as any).tmdbId;
          const itType = it.type || 'tv';
          items.push({
            entityId: it.entityId,
            tmdbId: rawTmdb ? String(rawTmdb) : undefined,
            tmdbType: (itType === 'tv' || itType === 'anime') ? 'tv' : 'movie',
            title: it.title,
            slug: it.slug,
            type: it.type,
            year: it.year,
            cover: it.cover,
            backdrop: it.backdrop,
            rate: it.rate,
            genres: it.genres,
            directors: (it as any).directors || [],
            actors: (it as any).actors || [],
            description: (it as any).description || (it as any).overview,
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
    for (const [, sectionVal] of Object.entries(catData)) {
      if (Array.isArray(sectionVal)) {
        for (const it of sectionVal) {
          const itTitle = it?.title || (it as any)?.name;
          if (itTitle) {
            const exist = items.find(x => x.title === itTitle);
            if (exist) {
              if ((!exist.directors || exist.directors.length === 0) && (it as any).directors?.length) {
                exist.directors = (it as any).directors;
              }
              if ((!exist.actors || exist.actors.length === 0) && (it as any).actors?.length) {
                exist.actors = (it as any).actors;
              }
              if (!exist.description && ((it as any).description || (it as any).overview)) {
                exist.description = (it as any).description || (it as any).overview;
              }
              if (!exist.backdrop && (it as any).backdrop) {
                exist.backdrop = (it as any).backdrop;
              }
              if (!exist.tmdbId && (it as any).tmdbId) {
                exist.tmdbId = String((it as any).tmdbId);
              }
              continue;
            }

            if (!seenTitles.has(itTitle)) {
              seenTitles.add(itTitle);
              const rawId = (it as any).id;
              const hasIkId = typeof rawId === 'string' && rawId.startsWith('ik');
              const rawTmdbId = (it as any).tmdbId;
              const itemType = (it as any).type || ((it as any).category === 'movie' ? 'movie' : 'tv');
              items.push({
                entityId: hasIkId ? rawId : undefined,
                tmdbId: rawTmdbId ? String(rawTmdbId) : undefined,
                tmdbType: (itemType === 'tv' || itemType === 'anime') ? 'tv' : 'movie',
                title: itTitle,
                slug: (it as any).slug,
                type: itemType,
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
  }

  cachedAllPrebakedItems = items;
  return items;
}

/**
 * 智能频道归属识别器
 * 综合 entity.type 与 genres 标签，精准判断影片应归属的面包屑频道。
 * 解决 TMDB 只返回 movie/tv 导致动漫被误归为"电视剧"的问题。
 */
export function resolveEntityChannel(entity: TitleEntity): { category: string; path: string; name: string } {
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

/**
 * 高容错实体解析引擎：支持各种形态的 Slug（如 ik000013-女仆日记, ik002015-法律与秩序, 法律与秩序, ik000013 等）
 * 核心架构铁律：ID 与显式 Slug 映射最高优先级，彻底根治 URL 英文后缀导致李代桃僵的问题
 */
export async function resolveEntityRaw(rawSlugParam: string): Promise<TitleEntity | null> {
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
  cleanTitle = decodeMangledHexSlug(cleanTitle);

  // 🌟 优先级 0：显式历史遗留/更名 URL 映射表（防止历史老词、历史合并条目丢失权重）
  const LEGACY_SLUG_REDIRECTS: Record<string, string> = {
    'ik002038-the-bill': 'ik007343-杀死比尔-血色全传', // 历史将杀死比尔错配至 2038，后纠正至 7343
  };
  const legacyTarget = LEGACY_SLUG_REDIRECTS[decodedSlug.toLowerCase()];
  if (legacyTarget) {
    const targetEntity = (await getEntityBySlug(legacyTarget)) || (legacyTarget.startsWith('ik') ? await getEntityById(legacyTarget.slice(0, 8)) : null);
    if (targetEntity) return enrichEpisodeCount(targetEntity);
  }

  // 🌟 优先级 1：根据完整 decodedSlug 优先查询
  // 覆盖：显式别名映射（如历史错配旧链接 slug:ik002038-the-bill -> ik007343）、规范 canonical slug、实体 ID
  let entity = await getEntityBySlug(decodedSlug);

  // 🌟 优先级 1.1：若完整 Slug 未命中，但解析出标准 6 位实体 ID（如 ik002038），
  // 必须直接按 ID 查询主键实体！随后由 TitlePage 组件 100% 自动 308 永久重定向到最新标准规范 URL！
  // 彻底根除历史带有旧英文后缀、旧别名、旧 ID 的 URL 发生 404 或白屏异常！
  if (!entity && entityId && /^ik\d{6}$/i.test(entityId)) {
    entity = await getEntityById(entityId);
  }

  if (entity) {
    // 🌟 强一致防毒化核验门禁：若访问请求带有中文片名，KV 取出的实体必须具备真实语义交集
    // 彻底杜绝《老蔡的奥德赛》或脏别名污染覆盖正牌大片《奥德赛》
    const expectedTitle = cleanTitle || decodedSlug;
    const hasChinese = /[\u4e00-\u9fff]/.test(expectedTitle);
    const isPoisoned = hasChinese && !hasTitleOverlap(expectedTitle, entity.title) &&
      (!entity.originalTitle || !hasTitleOverlap(expectedTitle, entity.originalTitle)) &&
      (!entity.slug || !hasTitleOverlap(expectedTitle, entity.slug));

    if (isPoisoned) {
      console.warn(`[resolveEntityRaw 防毒化拦截] 实体片名与预期严重不符，剔除毒化缓存: expected="${expectedTitle}", actual="${entity.title}", id="${entity.entityId}"`);
      // 异步清理受损别名
      (async () => {
        try {
          const norm = normalizeTitle(expectedTitle);
          if (norm) {
            await kvDelete(`title:${norm}`);
            await kvDelete(`slug:${norm}`);
          }
        } catch {}
      })();
      entity = null;
    } else if (!isSafeRecentTitleItem(entity as any) || !isStrictSafeEntity(entity).safe) {
      entity = null;
    } else {
      // 🌟 强一致同名异作消歧门禁（彻底解决 2026 新剧被 2020 同名老泰剧等历史条目覆盖问题）：
      // 若全站前台展示池 (prebakedItems) 中正在热播宣传同名影视，且其明确绑定了权威 tmdbId 或特定年份，
      // 而当前从 KV 查出的 entity 与之严重冲突（TMDB ID 不符或年份相差 > 1 年），坚决放弃该旧实体！
      const prebakedPool = getAllPrebakedDisplayItems();
      const pConflict = prebakedPool.find(p => p && (p.title === entity!.title || p.title === expectedTitle));
      if (pConflict) {
        const tmdbConflict = pConflict.tmdbId && entity.tmdbId && String(pConflict.tmdbId) !== String(entity.tmdbId);
        const yearDiff = pConflict.year && entity.year ? Math.abs(parseInt(pConflict.year, 10) - parseInt(entity.year, 10)) : 0;
        const yearConflict = yearDiff > 1;
        const thaiLanguageLeak = entity.originalTitle && /[\u0e00-\u0e7f]/.test(entity.originalTitle) && pConflict.year && parseInt(pConflict.year, 10) >= 2025;

        if (tmdbConflict || yearConflict || thaiLanguageLeak) {
          console.warn(`[resolveEntityRaw 同名异作消歧拦截] 历史 KV 实体与前台热播新剧严重冲突，丢弃冲突老条目: title="${entity.title}", kvTmdb=${entity.tmdbId}, pTmdb=${pConflict.tmdbId}, kvYear=${entity.year}, pYear=${pConflict.year}`);
          entity = null;
        }
      }
    }

    if (entity) {
      const isMissingCover = !entity.cover || entity.cover.trim() === '';
      const isMissingCast = (!entity.directors || entity.directors.length === 0) && (!entity.actors || entity.actors.length === 0);
      const hasDirtyPinyinCast = (entity.actors || []).some(a => /^[A-Za-z\s]{4,}$/.test(a));

      if (isMissingCover) {
        try {
          const healed = await searchAndEnrichFromTMDB(entity.title, entity.type, entity.year, true);
          if (healed) {
            if (healed.directors && healed.directors.length > 0) entity.directors = healed.directors;
            if (healed.actors && healed.actors.length > 0) entity.actors = healed.actors;
            if (healed.cover) entity.cover = healed.cover;
            if (healed.backdrop && !entity.backdrop) entity.backdrop = healed.backdrop;
            if (healed.tmdbId && !entity.tmdbId) {
              entity.tmdbId = healed.tmdbId;
              entity.tmdbType = healed.tmdbType;
            }
            saveEntity(entity).catch(() => {});
          }
        } catch {}
      } else if (isMissingCast || hasDirtyPinyinCast) {
        // 🚀 0ms 秒开守卫：已有封面与基础数据的影片，演职员质量与拼音清洗转入后台异步非阻塞自愈，首屏主渲染路径绝不挂起等待海外 TMDB
        healCreditsInBackground(entity);
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

    // 3. 历史受损 hex-slug 自愈比对（将连字符十六进制碎片无损还原为真实中文比对）
    const decodedClean = decodeMangledHexSlug(cleanTitleLower);
    const decodedSlugHex = decodeMangledHexSlug(decodedSlugLower);
    if (
      (decodedClean && (item.title === decodedClean || itemTitleNorm === normalizeTitle(decodedClean) || itemTitleSlug === decodedClean)) ||
      (decodedSlugHex && (item.title === decodedSlugHex || itemTitleNorm === normalizeTitle(decodedSlugHex) || itemTitleSlug === decodedSlugHex))
    ) {
      return true;
    }

    return false;
  });

  if (prebakedHit) {
    // 1. 优先尝试从本地/KV 0ms 读取已持久化的完整实体（权威 TMDB ID 绝对优先，杜绝同名老片反客为主）
    let existing = prebakedHit.tmdbId
      ? await getEntityByTmdb(prebakedHit.tmdbType || ((prebakedHit.type === 'tv' || prebakedHit.type === 'anime') ? 'tv' : 'movie'), prebakedHit.tmdbId)
      : null;

    if (!existing) {
      existing = await getEntityByTitle(prebakedHit.title);
      if (existing) {
        const isNotOverlap = !hasTitleOverlap(prebakedHit.title, existing.title);
        const tmdbConflict = prebakedHit.tmdbId && existing.tmdbId && String(prebakedHit.tmdbId) !== String(existing.tmdbId);
        const yearDiff = prebakedHit.year && existing.year ? Math.abs(parseInt(prebakedHit.year, 10) - parseInt(existing.year, 10)) : 0;
        const yearConflict = yearDiff > 1;
        const thaiLanguageLeak = existing.originalTitle && /[\u0e00-\u0e7f]/.test(existing.originalTitle) && prebakedHit.year && parseInt(prebakedHit.year, 10) >= 2025;

        if (isNotOverlap || tmdbConflict || yearConflict || thaiLanguageLeak) {
          console.warn(`[resolveEntityRaw Prebaked 防同名串台拦截] 预置新片 "${prebakedHit.title}"(tmdb=${prebakedHit.tmdbId}, year=${prebakedHit.year}) 与 KV existing(title="${existing.title}", tmdb=${existing.tmdbId}, year=${existing.year}) 冲突，丢弃冲突老条目`);
          existing = null;
        }
      }
    }

    if (existing && existing.cover && existing.cover.trim() !== '') {
      return enrichEpisodeCount(existing);
    }

    // 2. 0ms 秒开防御：直接使用预烘焙已有的高质量数据（标题、4K海报、年份、类型、集数、评分、简介）瞬间组装直出
    // 彻底消灭首屏针对海外 TMDB API 的数秒网络等待与骨架屏闪烁！
    const epCount = prebakedHit.numberOfEpisodes || (prebakedHit.updateBadge ? parseInt(prebakedHit.updateBadge.replace(/\D/g, ''), 10) || 1 : 1);
    const fallbackEntity: TitleEntity = {
      entityId: prebakedHit.entityId || `ik_pre_${encodeURIComponent(prebakedHit.title).slice(0, 16)}`,
      slug: decodeURIComponent(prebakedHit.slug || cleanTitle),
      tmdbId: prebakedHit.tmdbId || '',
      tmdbType: prebakedHit.tmdbType || ((prebakedHit.type === 'tv' || prebakedHit.type === 'anime') ? 'tv' : 'movie'),
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
    // 🌟 核心改进：若预烘焙已带有权威 TMDB ID，直接直连获取详情，0 误差 0 模糊匹配歧义！
    (async () => {
      try {
        if (prebakedHit.tmdbId) {
          await enrichEntityByTMDBId(
            prebakedHit.tmdbId,
            prebakedHit.tmdbType || ((prebakedHit.type === 'tv' || prebakedHit.type === 'anime') ? 'tv' : 'movie'),
            prebakedHit.title,
            prebakedHit.entityId,
            prebakedHit.year
          );
        } else {
          await searchAndEnrichFromTMDB(prebakedHit.title, prebakedHit.type, prebakedHit.year, true);
        }
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
    const unhyphenated = cleanTitle.replace(/[\-_—–]+/g, ' ').replace(/[·・•]/g, ' ').replace(/\s+/g, ' ').trim();
    const searchQueries = Array.from(new Set([
      unhyphenated,
      baseCleanTitle,
      baseTitleWithoutSeason,
      cleanTitle,
      decodedSlug,
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
    const rawCanonical = entity.canonicalSlug.trim().toLowerCase();
    // 🚨 严禁使用连字符十六进制乱码作为 canonicalSlug
    if (!/(?:e[0-9a-f]-[0-9a-f]{2}){2,}/i.test(rawCanonical)) {
      return rawCanonical;
    }
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
  baseText = decodeMangledHexSlug(baseText);

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
  let computedSlug = cleanSlugPart;
  if (hasStandardId) {
    computedSlug = `${id}-${cleanSlugPart}`;
  }

  // 🌟 若发现原 entity.canonicalSlug 受损或缺失，就地修正内存字段并异步自愈写回 KV
  if (hasStandardId && (!entity.canonicalSlug || /(?:e[0-9a-f]-[0-9a-f]{2}){2,}/i.test(entity.canonicalSlug))) {
    entity.canonicalSlug = computedSlug;
    saveEntity(entity).catch(() => {});
  }

  return computedSlug;
}

/**
 * 影视详情页最终守门员：
 * 任何历史遗留的假名片、低俗录像、成人违规条目强制拦截返回 null（自动触发 404 与 noindex）
 */
export async function resolveEntity(rawSlugParam: string): Promise<TitleEntity | null> {
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
        const prebakedPool = getAllPrebakedDisplayItems();
        const pMatch = prebakedPool.find(p => p && (p.title === candidateTitle || normalizeTitle(p.title) === normalizeTitle(candidateTitle)));
        let healed: TitleEntity | null = null;
        if (pMatch && pMatch.tmdbId) {
          healed = await getEntityByTmdb(pMatch.tmdbType || ((pMatch.type === 'tv' || pMatch.type === 'anime') ? 'tv' : 'movie'), pMatch.tmdbId);
        }
        if (!healed) {
          healed = await getEntityByTitle(candidateTitle);
          if (healed && pMatch) {
            const tmdbConflict = pMatch.tmdbId && healed.tmdbId && String(pMatch.tmdbId) !== String(healed.tmdbId);
            const yearDiff = pMatch.year && healed.year ? Math.abs(parseInt(pMatch.year, 10) - parseInt(healed.year, 10)) : 0;
            const thaiLeak = healed.originalTitle && /[\u0e00-\u0e7f]/.test(healed.originalTitle) && pMatch.year && parseInt(pMatch.year, 10) >= 2025;
            if (tmdbConflict || yearDiff > 1 || thaiLeak) {
              healed = null;
            }
          }
        }
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
  // 尝试规范化为主键实体，但必须严格执行同名异作消歧门禁，严禁李代桃僵！
  const currentId = entity.entityId || (entity as any).id || '';
  if (!/^ik\d{6}$/i.test(currentId)) {
    try {
      let realEntity: TitleEntity | null = null;
      // 1. 若当前实体持有权威 tmdbId，优先按精准 TMDB ID 检查是否存在标准 6 位实体
      if (entity.tmdbId) {
        realEntity = await getEntityByTmdb(entity.tmdbType || ((entity.type === 'tv' || entity.type === 'anime') ? 'tv' : 'movie'), entity.tmdbId);
      }

      // 2. 若未按 TMDB 命中，才尝试按标题查询，但必须通过全维度同名冲突核验
      if (!realEntity) {
        const candidate = await getEntityByTitle(entity.title);
        if (candidate && candidate.entityId && /^ik\d{6}$/i.test(candidate.entityId)) {
          const tmdbConflict = entity.tmdbId && candidate.tmdbId && String(entity.tmdbId) !== String(candidate.tmdbId);
          const yearDiff = entity.year && candidate.year ? Math.abs(parseInt(entity.year, 10) - parseInt(candidate.year, 10)) : 0;
          const yearConflict = yearDiff > 1;
          const thaiConflict = candidate.originalTitle && /[\u0e00-\u0e7f]/.test(candidate.originalTitle) && entity.year && parseInt(entity.year, 10) >= 2025;

          if (!tmdbConflict && !yearConflict && !thaiConflict) {
            realEntity = candidate;
          } else {
            console.warn(`[resolveEntity 规范化防串台拦截] 阻止将当前新剧 "${entity.title}" (tmdb=${entity.tmdbId}, year=${entity.year}) 错误替换为冲突老实体 (id=${candidate.entityId}, tmdb=${candidate.tmdbId}, year=${candidate.year})`);
          }
        }
      }

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
export async function enrichEpisodeCount(entity: TitleEntity): Promise<TitleEntity> {
  if (entity.type === 'movie') return entity;

  const hasValidEpisodes = entity.type === 'tv'
    ? (entity.numberOfEpisodes && entity.numberOfEpisodes > 1)
    : (entity.numberOfEpisodes && entity.numberOfEpisodes > 0);

  if (hasValidEpisodes && entity.numberOfSeasons && entity.numberOfSeasons > 0) {
    const lastUpdated = entity.updatedAt ? new Date(entity.updatedAt).getTime() : 0;
    const now = Date.now();
    const ONE_DAY_MS = 24 * 60 * 60 * 1000;

    if (now - lastUpdated < ONE_DAY_MS) {
      return entity;
    }

    refreshEpisodeCountInBackground(entity);
    return entity;
  }

  refreshEpisodeCountInBackground(entity);
  return entity;
}

/**
 * 后台非阻塞刷新剧集已播出集数与季数（使用 after 保证 Edge Worker 响应后完整持久化）
 */
export function refreshEpisodeCountInBackground(entity: TitleEntity) {
  try {
    after(async () => {
      try {
        const tmdbId = entity.tmdbId;
        if (tmdbId && /^\d{4,}$/.test(tmdbId)) {
          await tryEnrichFromTMDB(entity, tmdbId);
          return;
        }
        const healed = await searchAndEnrichFromTMDB(entity.title, 'tv', entity.year, true);
        if (healed && healed.tmdbId && /^\d{4,}$/.test(healed.tmdbId)) {
          await tryEnrichFromTMDB(healed, healed.tmdbId);
        }
      } catch (err) {
        console.warn('[refreshEpisodeCountInBackground error]', err);
      }
    });
  } catch {
    // 兼容不支持 after 的静态构建/离线环境
  }
}

/**
 * 后台非阻塞丰润演职员质量与一致性（使用 after 保证 Edge Worker 响应后完整持久化）
 */
export function healCreditsInBackground(entity: TitleEntity) {
  try {
    after(async () => {
      try {
        const tmdbMediaType: 'movie' | 'tv' = entity.type === 'movie' ? 'movie' : 'tv';
        let isMismatch = false;

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
    });
  } catch {
    // 兼容不支持 after 的静态构建/离线环境
  }
}

/**
 * 后台非阻塞补全真实的 16:9 横版剧照（使用 after 保证 Edge Worker 响应后完整持久化）
 */
export function healBackdropInBackground(entity: TitleEntity) {
  try {
    after(async () => {
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
    });
  } catch {
    // 兼容不支持 after 的静态构建/离线环境
  }
}

/**
 * 内部辅助函数：用指定的 tmdbId 尝试从 TMDB 精确统计已播出集数
 */
async function tryEnrichFromTMDB(entity: TitleEntity, tmdbId: string): Promise<TitleEntity | null> {
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
 * 基于 React 19 cache 的单请求级数据获取去重包装器
 * 彻底消除 generateMetadata() 与 TitlePage() 对同一条目数据的双重重复解析
 */
export const getCachedEntity = cache(async (rawSlugParam: string): Promise<TitleEntity | null> => {
  const entity = await resolveEntity(rawSlugParam);
  if (entity) {
    const prebakedAi = getPrebakedAiInsight({
      title: entity.title,
      entityId: entity.entityId,
      slug: entity.slug,
    });
    if (prebakedAi) {
      entity.aiContent = { ...prebakedAi, ...(entity.aiContent || {}) };
    }
  }
  return entity;
});
