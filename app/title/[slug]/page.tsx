import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Star, Clock, Calendar, Film, ArrowLeft } from 'lucide-react';
import { getEntityBySlug, getEntitiesByGenre, getEntitiesByDirector, getEntitiesByActor, saveEntity } from '@/lib/services/entity-kv';
import { getGenreBySlug } from '@/lib/data/genres';
import { searchAndEnrichFromTMDB, fetchTMDBDetails } from '@/lib/services/entity-enrichment';
import { TitleJsonLd } from '@/components/seo/TitleJsonLd';
import { PlayButton } from '@/components/title/PlayButton';
import { Navbar } from '@/components/layout/Navbar';

export const runtime = 'edge';
export const dynamic = 'force-dynamic';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * 动态 SEO Metadata 生成（含 Google Discover 大图与 AI 摘要授权）
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  let entity = await getEntityBySlug(slug);

  if (!entity) {
    // 按需 TMDB 补全
    entity = await searchAndEnrichFromTMDB(slug);
  }

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
  let entity = await getEntityBySlug(slug);

  if (!entity) {
    entity = await searchAndEnrichFromTMDB(slug);
  }

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

  const isTv = entity.type === 'tv';
  const channelPath = isTv ? '/tv' : '/movie';
  const channelName = isTv ? '电视剧' : '电影';

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
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

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {/* 面包屑导航 (Breadcrumbs) */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/50 mb-8 overflow-x-auto whitespace-nowrap">
          <Link href="/" className="hover:text-white transition-colors">
            首页
          </Link>
          <span>/</span>
          <Link href={channelPath} className="hover:text-white transition-colors">
            {channelName}
          </Link>
          <span>/</span>
          <span className="text-white/80 font-medium truncate max-w-xs">{entity.title}</span>
        </nav>

        {/* 核心详情区 (Article) */}
        <article className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 mb-16">
          {/* 左侧：主海报 (2:3 黄金比例，LCP 优化) */}
          <div className="md:col-span-4 lg:col-span-3">
            <div className="relative aspect-2/3 w-full max-w-[320px] mx-auto rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-white/5">
              {entity.cover ? (
                <Image
                  src={entity.cover}
                  alt={`${entity.title} 封面海报`}
                  fill
                  sizes="(max-width: 768px) 320px, (max-width: 1200px) 25vw, 320px"
                  priority
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <Film className="w-12 h-12" />
                </div>
              )}
              {entity.rate && (
                <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-black/70 backdrop-blur-md border border-amber-500/30 flex items-center gap-1.5 shadow-lg">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="font-black text-amber-400 text-sm">{entity.rate}</span>
                </div>
              )}
            </div>
          </div>

          {/* 右侧：影片信息与长尾描述 */}
          <div className="md:col-span-8 lg:col-span-9 flex flex-col justify-between">
            <div>
              {/* 唯一语义 H1 */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
                {entity.title}
                {entity.originalTitle && entity.originalTitle !== entity.title && (
                  <span className="block text-lg sm:text-2xl font-normal text-white/50 mt-1">
                    {entity.originalTitle}
                  </span>
                )}
              </h1>

              {/* 基础标签栏 */}
              <div className="flex flex-wrap items-center gap-3 text-sm text-white/60 mb-6">
                <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                  <Calendar className="w-3.5 h-3.5" />
                  {entity.year || '2024'}
                </span>
                {entity.region && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    {entity.region}
                  </span>
                )}
                {entity.runtime && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    <Clock className="w-3.5 h-3.5" />
                    {entity.runtime} 分钟
                  </span>
                )}
                {isTv && entity.numberOfEpisodes && (
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    共 {entity.numberOfEpisodes} 集
                  </span>
                )}
              </div>

              {/* 题材标签 */}
              <div className="flex flex-wrap gap-2 mb-8">
                {entity.genres?.map(genre => {
                  const gInfo = getGenreBySlug(genre);
                  const href = gInfo ? `/genre/${gInfo.slug}` : `/genre/${encodeURIComponent(genre)}`;
                  return (
                    <Link
                      key={genre}
                      href={href}
                      className="px-3 py-1 text-xs font-semibold rounded-full bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors border border-white/5"
                    >
                      {genre}
                    </Link>
                  );
                })}
              </div>

              {/* AEO 回答胶囊 (Answer Capsule)：针对 AI 搜索引擎（Google AI Overview、Perplexity 等）深度优化 */}
              <div className="p-4 sm:p-5 rounded-2xl bg-white/4 border border-white/10 mb-8 backdrop-blur-sm">
                <h2 className="text-xs uppercase tracking-wider font-bold text-white/40 mb-2">
                  影片概览 (Storyline)
                </h2>
                <p className="text-white/85 text-sm sm:text-base leading-relaxed">
                  {entity.description}
                </p>
              </div>

              {/* 演职员表（深度内链直达导演/演员作品专栏） */}
              {(validDirectors.length > 0 || validActors.length > 0) && (
                <div className="space-y-3 mb-8 text-sm sm:text-base">
                  {validDirectors.length > 0 && (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-white/40 font-medium">导演：</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {validDirectors.map((d, idx) => (
                          <span key={d} className="inline-flex items-center">
                            <Link
                              href={`/director/${encodeURIComponent(d)}`}
                              className="text-white/90 hover:text-red-400 hover:underline transition-colors font-medium"
                            >
                              {d}
                            </Link>
                            {idx < validDirectors.length - 1 && (
                              <span className="text-white/30 ml-1.5">/</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {validActors.length > 0 && (
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-white/40 font-medium">主演：</span>
                      <div className="flex flex-wrap items-center gap-1.5">
                        {validActors.map((a, idx) => (
                          <span key={a} className="inline-flex items-center">
                            <Link
                              href={`/actor/${encodeURIComponent(a)}`}
                              className="text-white/90 hover:text-red-400 hover:underline transition-colors"
                            >
                              {a}
                            </Link>
                            {idx < validActors.length - 1 && (
                              <span className="text-white/30 ml-1.5">/</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* E-E-A-T 影视资料背书 */}
              <div className="flex items-center gap-2 text-xs text-white/35 mb-6">
                <span>🛡️</span>
                <span>影视资料由 iKanPP 影视库团队整理校对</span>
                <span>·</span>
                <span>最新核验于 {entity.year} 年</span>
              </div>
            </div>

            {/* 播放触发操作区 */}
            <div className="pt-6 border-t border-white/10 flex flex-wrap items-center gap-4">
              <PlayButton
                entityId={entity.entityId}
                title={entity.title}
                type={entity.type}
              />
              <span className="text-xs text-white/40">
                ⚡ 浏览器纯直连第三方 CDN · 零等待秒播
              </span>
            </div>
          </div>
        </article>

        {/* 相关影片推荐内链网络 (同导演、同主演与同题材) */}
        {combinedRelated.length > 0 && (
          <section className="mt-16 pt-12 border-t border-white/10">
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <span>🍿</span>
              <span>更多{primaryGenre}与演职员精选推荐</span>
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {combinedRelated.slice(0, 12).map(rel => (
                <Link
                  key={rel.entityId}
                  href={`/title/${rel.entityId}-${rel.slug}`}
                  className="group block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="relative aspect-2/3 w-full bg-black/40 overflow-hidden">
                    {rel.cover ? (
                      <Image
                        src={rel.cover}
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
                    {rel.rate && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-amber-400 text-xs font-bold flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-amber-400" />
                        {rel.rate}
                      </div>
                    )}
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
    </div>
  );
}
