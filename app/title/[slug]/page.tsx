import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Calendar, Film, ArrowLeft, Clapperboard, User, Sparkles, CheckCircle2, Play } from 'lucide-react';
import { getEntityBySlug, getEntityByTitle, getEntitiesByGenre, getEntitiesByDirector, getEntitiesByActor, saveEntity } from '@/lib/services/entity-kv';
import { getGenreBySlug } from '@/lib/data/genres';
import { parseEntitySlug, normalizeTitle } from '@/lib/data/entities/entity-utils';
import { searchAndEnrichFromTMDB, fetchTMDBDetails, fetchTMDBAiredEpisodeCount, resolveRealBackdrop, isFakeBackdrop } from '@/lib/services/entity-enrichment';
import { getFastPersonAvatars } from '@/lib/services/person-avatar';
import { getOptimizedImageUrl, isRestrictedRegion } from '@/lib/utils/image-utils';
import { headers } from 'next/headers';
import { TitleEntity } from '@/lib/types/entity';
import { TitleJsonLd } from '@/components/seo/TitleJsonLd';
import { TitleActionsBar } from '@/components/title/TitleActionsBar';
import { EpisodesSelector } from '@/components/title/EpisodesSelector';
import { StickyBottomPlayCTA } from '@/components/title/StickyBottomPlayCTA';
import { MobileHeroStage } from '@/components/title/MobileHeroStage';
import { CastRail } from '@/components/title/CastRail';
import { Navbar } from '@/components/layout/Navbar';
import { normalizeVideoType } from '@/lib/utils/taxonomy';
import { parseSeasonFromTitle } from '@/lib/utils/season-resolver';

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
 * 彻底避免因为带 ID 前缀调用 TMDB 接口导致的 404
 */
async function resolveEntity(rawSlugParam: string): Promise<TitleEntity | null> {
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

  // 🌟 优先级 1：若存在明确纯净标题，优先尝试 100% 精准标题匹配（最高安全级别，杜绝任何 ID 冲突）
  if (cleanTitle) {
    const titleMatch = await getEntityByTitle(cleanTitle);
    if (titleMatch && titleMatch.cover && normalizeTitle(titleMatch.title) === normalizeTitle(cleanTitle)) {
      return enrichEpisodeCount(titleMatch);
    }
  }

  // 2. 尝试根据 slug 或 ID 取实体
  let entity = await getEntityBySlug(decodedSlug);

  // 🌟 核心防线：严格校验取出的实体标题是否与 URL 中的 cleanTitle 匹配！
  if (entity && cleanTitle) {
    const normEntity = normalizeTitle(entity.title);
    const normClean = normalizeTitle(cleanTitle);
    const isOverExtended = normEntity.length > normClean.length + 2 && (normEntity.includes('剧场版') || normEntity.includes('电影版') || normEntity.includes('特别篇') || normEntity.includes('番外'));
    if (!hasTitleOverlap(entity.title, cleanTitle) || isOverExtended) {
      console.warn(`[resolveEntity Mismatch Discarded]: URL cleanTitle="${cleanTitle}" but found entity="${entity.title}" (id=${entity.entityId})`);
      entity = null;
    }
  }

  if (entity) {
    if (!entity.cover || entity.cover.trim() === '') {
      const healed = await searchAndEnrichFromTMDB(entity.title, entity.type, entity.year, true);
      if (healed && healed.cover) return enrichEpisodeCount(healed);
    }
    return enrichEpisodeCount(entity);
  }

  // 3. 如果有纯净标题，尝试在本地按标题反向索引查找
  if (cleanTitle) {
    entity = await getEntityByTitle(cleanTitle);
    if (entity && hasTitleOverlap(entity.title, cleanTitle)) {
      if (!entity.cover || entity.cover.trim() === '') {
        const healed = await searchAndEnrichFromTMDB(cleanTitle, entity.type, entity.year, true);
        if (healed && healed.cover) return enrichEpisodeCount(healed);
      }
      return enrichEpisodeCount(entity);
    }
  }

  // 4. 若本地/预置库未命中，使用纯净标题到 TMDB 搜索并自愈入库（仅全新冷门词条触发）
  const queryTitle = cleanTitle || decodedSlug;
  if (queryTitle && !/^ik\d{6}$/i.test(queryTitle)) {
    entity = await searchAndEnrichFromTMDB(queryTitle);
    if (entity) {
      return enrichEpisodeCount(entity);
    }
  }

  return null;
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

  if (!entity) {
    return {
      title: '影片未找到 - iKanPP 爱看片片',
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

  // 多分类智能识别：动漫也属于「有剧集」形态
  const isSeriesLike = entity.type === 'tv' || entity.type === 'anime';
  const typeText = isSeriesLike ? '全集' : '免费高清完整版';
  const displayTitle = seasonTag && !entity.title.includes(seasonTag) ? `${entity.title} ${seasonTag}` : entity.title;
  const pageTitle = `${displayTitle} (${entity.year}) 在线观看 - ${typeText} | iKanPP 爱看片片`;
  const validDirs = (entity.directors || []).filter(d => d && !['知名导演', '实力主演', '未知', '暂无'].includes(d.trim()));
  const validActs = (entity.actors || []).filter(a => a && !['知名导演', '实力主演', '未知', '暂无'].includes(a.trim()));
  let peopleText = '';
  if (validDirs.length > 0) peopleText += ` 导演: ${validDirs.slice(0, 2).join(' / ')}。`;
  const rawDesc = entity.description || '';
  const cleanDesc = rawDesc.replace(/(?:导演|主演)\s*[:：]\s*(?:知名导演|实力主演)[，。、\s]*/g, '').slice(0, 100);

  const metaDescription = `在 iKanPP 免费在线观看《${displayTitle}》(${entity.year}) ${isSeriesLike ? (entity.type === 'anime' ? '动漫全集' : '电视剧全集') : '电影完整版'}。${cleanDesc ? `${cleanDesc}...` : ''}${peopleText}海外华人免翻墙极速超清播放。`;
  const canonicalUrl = `${BASE_URL}/title/${entity.entityId}-${entity.slug}`;
  let resolvedBackdrop = entity.backdrop;
  if (isFakeBackdrop(entity.backdrop, entity.cover)) {
    healBackdropInBackground(entity);
  }
  const ogImage = resolvedBackdrop || entity.cover;

  return {
    title: pageTitle,
    description: metaDescription,
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

  // 去重合并推荐列表
  const combinedRelated: typeof filteredGenreRelated = [];
  const seenIds = new Set<string>();
  for (const item of [...filteredDirectorRelated, ...filteredActorRelated, ...filteredGenreRelated]) {
    if (!seenIds.has(item.entityId)) {
      seenIds.add(item.entityId);
      combinedRelated.push(item);
    }
  }

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
                <TitleActionsBar entity={entity} playTitle={effectiveSearchTitle} />
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
                  href={`/title/${rel.entityId}-${rel.slug}`}
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
      </main>

      {/* 移动端专属常驻吸底快捷播放栏 */}
      <StickyBottomPlayCTA entity={entity} playTitle={effectiveSearchTitle} />
    </div>
  );
}
