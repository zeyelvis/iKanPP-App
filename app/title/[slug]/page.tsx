import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Calendar, Film, ArrowLeft, Clapperboard, User, Sparkles, CheckCircle2, Play } from 'lucide-react';
import { getEntityBySlug, getEntityByTitle, getEntitiesByGenre, getEntitiesByDirector, getEntitiesByActor, saveEntity } from '@/lib/services/entity-kv';
import { getGenreBySlug } from '@/lib/data/genres';
import { parseEntitySlug } from '@/lib/data/entities/entity-utils';
import { searchAndEnrichFromTMDB, fetchTMDBDetails } from '@/lib/services/entity-enrichment';
import { getPersonAvatars } from '@/lib/services/person-avatar';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { TitleEntity } from '@/lib/types/entity';
import { TitleJsonLd } from '@/components/seo/TitleJsonLd';
import { TitleActionsBar } from '@/components/title/TitleActionsBar';
import { EpisodesSelector } from '@/components/title/EpisodesSelector';
import { StickyBottomPlayCTA } from '@/components/title/StickyBottomPlayCTA';
import { Navbar } from '@/components/layout/Navbar';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

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

  // 1. 尝试直接根据 slug 取实体（支持 ik000001-slug, ik000001 等）
  let entity = await getEntityBySlug(decodedSlug);
  if (entity) return entity;

  // 2. 解析 slug，分离 entityId 与 cleanTitle
  const { entityId, slug: innerSlug } = parseEntitySlug(decodedSlug);

  // 提取纯净标题（剔除 ik00xxxx- 前缀后的纯标题）
  let cleanTitle = innerSlug || (entityId ? '' : decodedSlug);
  cleanTitle = cleanTitle.replace(/^[-\s]+|[-\s]+$/g, '');

  // 3. 如果有纯净标题，尝试在本地按标题反向索引查找
  if (cleanTitle) {
    entity = await getEntityByTitle(cleanTitle);
    if (entity) {
      return entity;
    }
  }

  // 4. 若本地/预置库未命中，使用纯净标题到 TMDB 搜索并自愈入库
  const queryTitle = cleanTitle || decodedSlug;
  if (queryTitle && !/^ik\d{6}$/i.test(queryTitle)) {
    entity = await searchAndEnrichFromTMDB(queryTitle);
    if (entity) {
      return entity;
    }
  }

  return null;
}

/**
 * 动态 SEO Metadata 生成（含 Google Discover 大图与 AI 摘要授权）
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const entity = await resolveEntity(slug);

  if (!entity) {
    return {
      title: '影片未找到 - iKanPP 爱看片片',
      robots: { index: false, follow: false },
    };
  }

  const isTv = entity.type === 'tv';
  const typeText = isTv ? '全集' : '免费高清完整版';
  const pageTitle = `${entity.title} (${entity.year}) 在线观看 - ${typeText} | iKanPP 爱看片片`;
  const validDirs = (entity.directors || []).filter(d => d && !['知名导演', '实力主演', '未知', '暂无'].includes(d.trim()));
  const validActs = (entity.actors || []).filter(a => a && !['知名导演', '实力主演', '未知', '暂无'].includes(a.trim()));
  let peopleText = '';
  if (validDirs.length > 0) peopleText += ` 导演: ${validDirs.slice(0, 2).join(' / ')}。`;
  const rawDesc = entity.description || '';
  const cleanDesc = rawDesc.replace(/(?:导演|主演)\s*[:：]\s*(?:知名导演|实力主演)[，。、\s]*/g, '').slice(0, 100);

  const metaDescription = `在 iKanPP 免费在线观看《${entity.title}》(${entity.year}) ${isTv ? '电视剧全集' : '电影完整版'}。${cleanDesc ? `${cleanDesc}...` : ''}${peopleText}海外华人免翻墙极速超清播放。`;
  const canonicalUrl = `${BASE_URL}/title/${entity.entityId}-${entity.slug}`;
  const ogImage = entity.backdrop || entity.cover;

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
  const entity = await resolveEntity(slug);

  if (!entity) {
    notFound();
  }

  // 严格过滤占位符假数据
  const filterFakePeople = (list: string[] = []) =>
    list.filter(p => p && !['知名导演', '实力主演', '未知', '暂无'].includes(p.trim()));

  let validDirectors = filterFakePeople(entity.directors);
  let validActors = filterFakePeople(entity.actors);

  // 演职员数据缺失或包含假数据时，若有 TMDB ID，现场异步向 TMDB 自动丰润拉取真实演职员并更新持久化
  if ((validDirectors.length === 0 || validActors.length === 0) && entity.tmdbId) {
    try {
      const tmdbMediaType: 'movie' | 'tv' = entity.type === 'movie' ? 'movie' : 'tv';
      const detail = await fetchTMDBDetails(entity.tmdbId, tmdbMediaType);
      if (detail?.credits) {
        const realDirs = (detail.credits.crew || []).filter(c => c.job === 'Director').map(c => c.name).filter(Boolean);
        const realActs = (detail.credits.cast || []).slice(0, 5).map(c => c.name).filter(Boolean);
        if (realDirs.length > 0) {
          entity.directors = realDirs;
          validDirectors = realDirs;
        }
        if (realActs.length > 0) {
          entity.actors = realActs;
          validActors = realActs;
        }
        if (realDirs.length > 0 || realActs.length > 0) {
          await saveEntity(entity);
        }
      }
    } catch {}
  }

  // 获取同题材、同导演与同主演相关推荐影片（构建站内强内链拓扑）
  const primaryGenre = entity.genres?.[0] || (entity.type === 'tv' ? '电视剧' : '电影');
  const primaryDirector = validDirectors[0];
  const primaryActor = validActors[0];

  const allPeopleNames = [...validDirectors, ...validActors];
  const [genreRelated, directorRelated, actorRelated, peopleAvatars] = await Promise.all([
    getEntitiesByGenre(primaryGenre, 8),
    primaryDirector ? getEntitiesByDirector(primaryDirector, 6) : Promise.resolve([]),
    primaryActor ? getEntitiesByActor(primaryActor, 6) : Promise.resolve([]),
    getPersonAvatars(allPeopleNames),
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

  const isTv = entity.type === 'tv';
  const channelPath = isTv ? '/tv' : '/movie';
  const channelName = isTv ? '电视剧' : '电影';
  const heroBackdrop = getOptimizedImageUrl(entity.backdrop || entity.cover);
  const entityCover = getOptimizedImageUrl(entity.cover);

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white selection:bg-red-600 selection:text-white relative">
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
                    { not: { href_matches: '/player*' } },
                    { not: { href_matches: '/premium*' } },
                  ],
                },
                eagerness: 'moderate',
              },
            ],
          }),
        }}
      />

      {/* 顶部导航 */}
      <Navbar />

      {/* Netflix 级沉浸式全屏背景大画幅 (Hero Billboard Backdrop) */}
      <div className="relative w-full overflow-hidden">
        {heroBackdrop && (
          <div className="hidden md:block absolute inset-0 h-[60vh] sm:h-[75vh] lg:h-[82vh] w-full select-none pointer-events-none z-0">
            <Image
              src={heroBackdrop}
              alt={`${entity.title} 剧照大图`}
              fill
              priority
              sizes="100vw"
              className="object-cover object-top opacity-35 sm:opacity-45 filter brightness-90 saturate-[1.15]"
            />
            {/* 多重电影级渐变融合：底边向上淡入深黑，侧边向右压暗文字背景 */}
            <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0F] via-[#0A0A0F]/70 to-transparent" />
            <div className="absolute inset-0 bg-linear-to-r from-[#0A0A0F] via-[#0A0A0F]/85 to-transparent sm:max-w-4xl" />
          </div>
        )}

        {/* 核心视觉区 */}
        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-2.5 sm:pt-8 z-10">
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
            <span className="text-white/80 font-medium truncate max-w-[180px] sm:max-w-xs">{entity.title}</span>
          </nav>

          {/* 影视主体大横幅 (Hero Article) */}
          <article className="grid grid-cols-1 md:grid-cols-12 gap-2.5 md:gap-8 lg:gap-12 pb-4 sm:pb-16 items-end">
            {/* 左侧海报区：移动端 16:9 宽屏剧照舞台（点击秒播） vs 桌面端 2:3 立体大悬浮海报 */}
            <div className="md:col-span-4 lg:col-span-3">
              {/* 1. 移动端 16:9 全画幅沉浸式舞台 (仅在小于 md 渲染) */}
              <div className="block md:hidden w-full mb-1">
                <Link
                  href={`/player?${new URLSearchParams({
                    entity: entity.entityId,
                    title: entity.title,
                    type: entity.type === 'tv' ? 'tv' : 'movie',
                    episode: '1',
                  }).toString()}`}
                  className="group relative block w-full aspect-16/9 rounded-2xl overflow-hidden bg-black/60 border border-white/15 shadow-2xl shadow-black cursor-pointer"
                >
                  {heroBackdrop ? (
                    <Image
                      src={heroBackdrop}
                      alt={`${entity.title} 封面海报`}
                      fill
                      priority
                      sizes="100vw"
                      className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white/30">
                      <Film className="w-12 h-12" />
                    </div>
                  )}
                  {/* 电影级微光暗角融合 */}
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-black/30" />
                  <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />

                  {/* 居中浮动 Netflix 级透明磨砂玻璃【▶ 播放】高阶按钮 */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-14 h-14 rounded-full bg-black/40 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-2xl shadow-black/80 group-hover:scale-110 group-active:scale-95 group-hover:bg-black/55 group-hover:border-white/50 transition-all duration-300">
                      <Play className="w-6 h-6 fill-white text-white translate-x-0.5 opacity-90 group-hover:opacity-100" />
                    </div>
                  </div>
                </Link>
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
              <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight mb-1.5 sm:mb-3 drop-shadow-md text-left">
                {entity.title}
                {entity.originalTitle && entity.originalTitle !== entity.title && (
                  <span className="block text-xs sm:text-2xl font-light text-white/50 mt-0.5 sm:mt-1 tracking-normal font-sans">
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
                <TitleActionsBar entity={entity} />
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
              title={entity.title}
              type={entity.type}
              totalEpisodes={entity.numberOfEpisodes || 24}
            />
          </section>
        )}

        {/* 演职员圆形名牌滑轨 (Cast & Crew Rail) */}
        {(validDirectors.length > 0 || validActors.length > 0) && (
          <section className="mb-14">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 flex items-center gap-2">
              <Clapperboard className="w-5 h-5 text-red-500" />
              <span>演职员专栏</span>
            </h2>

            <div className="flex items-center gap-3.5 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
              {/* 导演卡片 */}
              {validDirectors.map(d => (
                <Link
                  key={d}
                  href={`/director/${encodeURIComponent(d)}`}
                  className="group shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/40 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-red-950/30"
                >
                  {peopleAvatars[d] ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-red-500/40 group-hover:border-red-500 shrink-0 shadow-md group-hover:scale-105 transition-all">
                      <Image
                        src={getOptimizedImageUrl(peopleAvatars[d])}
                        alt={d}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-red-600/10 border border-red-500/20 text-red-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform font-bold text-sm">
                      {d.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-red-400 transition-colors">
                      {d}
                    </div>
                    <div className="text-[11px] text-white/40 mt-0.5">导演</div>
                  </div>
                </Link>
              ))}

              {/* 演员卡片 */}
              {validActors.map(a => (
                <Link
                  key={a}
                  href={`/actor/${encodeURIComponent(a)}`}
                  className="group shrink-0 flex items-center gap-3 px-4 py-2.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-500/40 transition-all duration-200 hover:-translate-y-0.5 shadow-sm hover:shadow-lg hover:shadow-amber-950/30"
                >
                  {peopleAvatars[a] ? (
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-amber-500/40 group-hover:border-amber-500 shrink-0 shadow-md group-hover:scale-105 transition-all">
                      <Image
                        src={getOptimizedImageUrl(peopleAvatars[a])}
                        alt={a}
                        fill
                        sizes="48px"
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform font-bold text-sm">
                      {a.slice(0, 1)}
                    </div>
                  )}
                  <div>
                    <div className="font-bold text-sm text-white group-hover:text-amber-400 transition-colors">
                      {a}
                    </div>
                    <div className="text-[11px] text-white/40 mt-0.5">实力主演</div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Netflix 标志性“更多类似推荐”（More Like This） */}
        {combinedRelated.length > 0 && (
          <section className="mt-8">
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
                >
                  <div className="relative aspect-2/3 w-full bg-black/40 overflow-hidden">
                    {rel.cover ? (
                      <Image
                        src={getOptimizedImageUrl(rel.cover)}
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
      <StickyBottomPlayCTA entity={entity} />
    </div>
  );
}
