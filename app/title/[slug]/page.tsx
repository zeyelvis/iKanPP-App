import { after } from 'next/server';
import { Metadata } from 'next';
import { notFound, permanentRedirect, RedirectType } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { getEntitiesByGenre, getEntitiesByDirector, getEntitiesByActor, saveEntity } from '@/lib/services/entity-kv';
import { parseEntitySlug, generateSlug } from '@/lib/data/entities/entity-utils';
import { searchAndEnrichFromTMDB, isFakeBackdrop } from '@/lib/services/entity-enrichment';
import { getFastPersonAvatars } from '@/lib/services/person-avatar';
import { getOptimizedImageUrl, isRestrictedRegion } from '@/lib/utils/image-utils';
import { TitleEntity } from '@/lib/types/entity';
import { TitleJsonLd } from '@/components/seo/TitleJsonLd';
import highPotentialKeywordsData from '@/lib/data/seo-high-potential.json';
import { EpisodesSelector } from '@/components/title/EpisodesSelector';
import { WatchStage } from '@/components/title/WatchStage';
import { Navbar } from '@/components/layout/Navbar';
import { parseSeasonFromTitle } from '@/lib/utils/season-resolver';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

// 拆分子模块与库
import {
  getCachedEntity,
  getEntityCanonicalSlug,
  resolveEntityChannel,
  healCreditsInBackground,
  healBackdropInBackground,
} from './_lib/resolve-entity';
import { generateTitleMetadata } from './_lib/enrich-metadata';
import { TitleHero } from './_components/TitleHero';
import { TitleSynopsis } from './_components/TitleSynopsis';
import { RelatedTitles } from './_components/RelatedTitles';
import { SeoModules } from './_components/SeoModules';

export const runtime = 'edge';
export const revalidate = 3600;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

interface Props {
  params: Promise<{ slug: string }>;
}

// 规范 21.3 节：详情页由 generateTitleMetadata 驱动，keywords 必须限制在 5 个核心实体词以内防堆叠 (seoSpectrum.keywords.slice(0, 5))
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  return generateTitleMetadata(slug);
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

  // 标题纯净化守护网：彻底剥离历史残留的纯数字加冒号脏前缀（如 "33：一击3：最后一击" -> "一击3：最后一击"）
  if (entity.title && /^\d+[:：]\s*/.test(entity.title)) {
    entity.title = entity.title.replace(/^\d+[:：]\s*/, '').trim();
    saveEntity(entity).catch(() => {});
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
    permanentRedirect(`/title/${encodeURIComponent(canonicalSlug)}`, RedirectType.replace);
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
    list.filter((p) => p && !['知名导演', '实力主演', '未知', '暂无'].includes(p.trim()));

  const validDirectors = filterFakePeople(entity.directors);
  const validActors = filterFakePeople(entity.actors);

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

  // 🚀 0ms 秒开守卫：为次级推荐设置 400ms 超时熔断，绝不拖慢主首屏 HTML 吐出
  const [genreRelated, directorRelated, actorRelated] = await Promise.race([
    Promise.all([
      getEntitiesByGenre(primaryGenre, 8),
      primaryDirector ? getEntitiesByDirector(primaryDirector, 6) : Promise.resolve([]),
      primaryActor ? getEntitiesByActor(primaryActor, 6) : Promise.resolve([]),
    ]),
    new Promise<[TitleEntity[], TitleEntity[], TitleEntity[]]>((resolve) =>
      setTimeout(() => resolve([[], [], []]), 400)
    ),
  ]);

  // 过滤自身
  const filteredGenreRelated = genreRelated.filter((e) => e.entityId !== entity.entityId).slice(0, 6);
  const filteredDirectorRelated = directorRelated.filter((e) => e.entityId !== entity.entityId).slice(0, 6);
  const filteredActorRelated = actorRelated.filter((e) => e.entityId !== entity.entityId).slice(0, 6);

  // 去重合并推荐列表，并优先置顶处于 Google 第 11~30 位的高潜冲榜影片（智能内链提权）
  const hpTitles = new Set((highPotentialKeywordsData?.keywords || []).map((k) => k.title));
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
  let combinedRelated = [...boostedRelated, ...normalRelated];

  // 若推荐列表为空（如极端弱网熔断或新入库影视），0ms 预烘焙兜底填充，确保 SEO 内链与推荐货架永不空白
  if (combinedRelated.length === 0) {
    const fallbackList = (entity.type === 'tv' ? PREBAKED_HOME_DATA.tv?.s1 : PREBAKED_HOME_DATA.movie?.s1) || [];
    const fallbackItems = fallbackList.filter((item: any) => item.title !== entity.title).slice(0, 6);
    combinedRelated = fallbackItems.map((item: any, idx: number) => ({
      entityId: item.id || `ik_rel_${idx}`,
      title: item.title,
      cover: item.cover,
      backdrop: item.backdrop || item.cover,
      year: item.year || '',
      type: (item.type || entity.type) as 'movie' | 'tv' | 'anime',
      genres: item.types || [primaryGenre],
      directors: item.directors || [],
      actors: item.actors || [],
      description: item.description || '',
      slug: item.id ? `${item.id}-${generateSlug(item.title)}` : generateSlug(item.title),
    })) as TitleEntity[];
  }

  // 多分类智能识别：根据 entity.type + genres 精准定位所属频道
  const resolvedChannel = resolveEntityChannel(entity);
  const channelPath = resolvedChannel.path;
  const channelName = resolvedChannel.name;
  const isTv =
    entity.type === 'tv' ||
    entity.type === 'anime' ||
    resolvedChannel.category === 'anime' ||
    resolvedChannel.category === 'tv';

  // 智能识别并自动丰润 TMDB 真实 16:9 横版电影大画幅剧照（转入非阻塞后台自愈）
  const resolvedBackdrop = entity.backdrop;
  if (isFakeBackdrop(entity.backdrop, entity.cover)) {
    healBackdropInBackground(entity);
  }

  const isTrueBackdrop = !isFakeBackdrop(resolvedBackdrop, entity.cover);
  const heroBackdrop = getOptimizedImageUrl(resolvedBackdrop || entity.cover, {
    variant: 'backdrop',
    isChinaMainland,
  });
  const entityCover = getOptimizedImageUrl(entity.cover, { variant: 'detail', isChinaMainland });

  const header = (
    <TitleHero
      entity={entity}
      entityCover={entityCover}
      effectiveSearchTitle={effectiveSearchTitle}
      isSeasonSpecified={isSeasonSpecified}
      seasonTag={seasonTag}
      isTv={isTv}
      combinedRelated={combinedRelated}
    />
  );

  const storyline = <TitleSynopsis entity={entity} channelName={channelName} />;

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-red-600 selection:text-white relative">
      {/* 🚀 八层极速秒开架构：详情页核心背景大图预加载，消除 LCP 延迟 */}
      {heroBackdrop && <link rel="preload" as="image" href={heroBackdrop} fetchPriority="high" />}

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
                  and: [{ href_matches: '/title/*' }, { not: { href_matches: '/premium*' } }],
                },
                eagerness: 'moderate',
              },
            ],
          }),
        }}
      />

      <Navbar activeCategory={entity.type === 'tv' ? 'tv' : 'movie'} />

      {/* 播放区：详情页即播放页，在本页原地播放 */}
      <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-6 pb-10">
        {/* 面包屑导航 (Breadcrumbs) */}
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 sm:gap-2 text-[11px] sm:text-sm text-white/50 mb-3 sm:mb-5 overflow-x-auto whitespace-nowrap scrollbar-none"
        >
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

        <WatchStage
          entityId={entity.entityId}
          playTitle={effectiveSearchTitle}
          displayTitle={entity.title}
          type={entity.type}
          year={entity.year}
          numberOfSeasons={entity.numberOfSeasons || 1}
          season={seasonInfo?.seasonNumber ?? null}
          still={heroBackdrop || null}
          stillIsPoster={!isTrueBackdrop}
          header={header}
          panel={
            isTv ? (
              <section
                aria-label="选集"
                className="p-4 sm:p-5 rounded-2xl bg-white/4 border border-white/10 shadow-xl"
              >
                <EpisodesSelector
                  title={effectiveSearchTitle}
                  type={entity.type}
                  totalEpisodes={entity.numberOfEpisodes || 24}
                  numberOfSeasons={entity.numberOfSeasons || 1}
                  currentSeason={seasonInfo?.seasonNumber || 1}
                  episodeHighlights={entity.aiContent?.episodeHighlights}
                  layout="panel"
                />
              </section>
            ) : (
              storyline
            )
          }
        />
      </div>

      {/* 主体内容布局区 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-28">
        {/* AEO 剧情梗概：电视剧在此；电影在播放区旁 */}
        {isTv ? <div className="mb-10">{storyline}</div> : null}

        {/* 聚合 SEO / GEO 模块 */}
        <SeoModules
          entity={entity}
          channelName={channelName}
          primaryGenre={primaryGenre}
          validDirectors={validDirectors}
          validActors={validActors}
          peopleAvatars={peopleAvatars}
        />

        {/* 更多类似推荐 */}
        <RelatedTitles
          relatedTitles={combinedRelated}
          primaryGenre={primaryGenre}
          isChinaMainland={isChinaMainland}
        />
      </main>
    </div>
  );
}
