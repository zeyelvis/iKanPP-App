import { Metadata } from 'next';
import { notFound, permanentRedirect, RedirectType } from 'next/navigation';
import Link from 'next/link';
import { headers } from 'next/headers';
import { generateSlug } from '@/lib/data/entities/entity-utils';
import { isFakeBackdrop } from '@/lib/services/entity-enrichment';
import { getDb } from '@/lib/data/d1/db';
import { titlesByGenre, titlesByPerson } from '@/lib/data/d1/related';
import { getFastPersonAvatars } from '@/lib/services/person-avatar';
import { getOptimizedImageUrl, isRestrictedRegion } from '@/lib/utils/image-utils';
import { TitleEntity } from '@/lib/types/entity';
import { TitleJsonLd } from '@/components/seo/TitleJsonLd';
import highPotentialKeywordsData from '@/lib/data/seo-high-potential.json';
import { EpisodesSelector } from '@/components/title/EpisodesSelector';
import { WatchStage } from '@/components/title/WatchStage';
import { Navbar } from '@/components/layout/Navbar';
import { loadHomeDocs } from '@/lib/data/d1/home-docs';

// 拆分子模块与库
import { encodePath, loadTitlePage } from './_lib/load-title';
import { resolveEntityChannel } from './_lib/channel';
import { generateTitleMetadata } from './_lib/enrich-metadata';
import { TitleHero } from './_components/TitleHero';
import { TitleSynopsis } from './_components/TitleSynopsis';
import { RelatedTitles } from './_components/RelatedTitles';
import { SeoModules } from './_components/SeoModules';

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

  const loaded = await loadTitlePage(slug);
  if (loaded.type === 'redirect') permanentRedirect(encodePath(loaded.location), RedirectType.replace);
  if (loaded.type === 'not-found') notFound();
  const { entity, season: seasonInfo } = loaded;

  // 季号网址（时光代理人第3季）原地显示该季，播放器按该季取片源。
  const isSeasonSpecified = Boolean(seasonInfo);
  const seasonTag = seasonInfo ? seasonInfo.rawSeasonMatch || `第${seasonInfo.seasonNumber}季` : '';
  const effectiveSearchTitle = isSeasonSpecified ? `${entity.title}${seasonTag}` : entity.title;

  // 严格过滤占位符假数据
  const filterFakePeople = (list: string[] = []) =>
    list.filter((p) => p && !['知名导演', '实力主演', '未知', '暂无'].includes(p.trim()));

  const validDirectors = filterFakePeople(entity.directors);
  const validActors = filterFakePeople(entity.actors);

  // 获取同题材、同导演与同主演相关推荐影片（构建站内强内链拓扑）
  const primaryGenre = entity.genres?.[0] || (entity.type === 'tv' ? '电视剧' : '电影');
  const primaryDirector = validDirectors[0];
  const primaryActor = validActors[0];

  const allPeopleNames = [...validDirectors, ...validActors];
  // 0ms 同步获取预置/内存缓存人物肖像（首屏秒开直出，绝不阻塞网络）
  const peopleAvatars = getFastPersonAvatars(allPeopleNames);

  // 同题材、同导演、同主演推荐（D1，按热度取前几部，都走索引）
  const db = getDb()!;
  const [genreRelated, directorRelated, actorRelated] = await Promise.all([
    titlesByGenre(db, primaryGenre, 8).catch(() => [] as TitleEntity[]),
    primaryDirector ? titlesByPerson(db, primaryDirector, 'director', 7).catch(() => [] as TitleEntity[]) : Promise.resolve([] as TitleEntity[]),
    primaryActor ? titlesByPerson(db, primaryActor, 'actor', 7).catch(() => [] as TitleEntity[]) : Promise.resolve([] as TitleEntity[]),
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
    const { home } = await loadHomeDocs();
    const fallbackList = (entity.type === 'tv' ? home.tv.s1 : home.movie.s1) || [];
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

  const resolvedBackdrop = entity.backdrop;

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
