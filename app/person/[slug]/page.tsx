import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Film, User, Clapperboard, Award } from 'lucide-react';
import { getEntitiesByActor, getEntitiesByDirector } from '@/lib/services/entity-kv';
import { getPersonAvatar } from '@/lib/services/person-avatar';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';
import { isInvalidDramaOrMovie, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { Navbar } from '@/components/layout/Navbar';

export const runtime = 'edge';
export const revalidate = 86400;

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const personName = decodeURIComponent(slug).trim();

  if (!personName || personName === '实力主演' || personName === '知名导演') {
    return {
      title: '影人资料未找到 - iKanPP 爱看片片',
      robots: { index: false, follow: false },
    };
  }

  // 并行获取影人参与的所有作品（导演与演员双轨合并）
  const [directorWorks, actorWorks] = await Promise.all([
    getEntitiesByDirector(personName, 12),
    getEntitiesByActor(personName, 12),
  ]);

  const map = new Map<string, any>();
  for (const item of [...directorWorks, ...actorWorks]) {
    if (item && item.entityId && !map.has(item.entityId) && !isInvalidDramaOrMovie(item)) {
      map.set(item.entityId, item);
    }
  }
  const cleanEntities = Array.from(map.values());

  // 薄内容门禁（Thin Content Guard）：无收录作品则输出 noindex
  if (cleanEntities.length === 0) {
    return {
      title: `${personName} - 影人全集代表作与影视资料 | iKanPP 爱看片片`,
      description: `查看${personName}的影视资料与作品档案。`,
      robots: { index: false, follow: false },
    };
  }

  const topWorks = cleanEntities.slice(0, 3).map(e => `《${e.title}》`).join('、');
  const title = `${personName} - 影视全集代表作与影人资料 | iKanPP 爱看片片`;
  const description = `iKanPP 收录${personName}执导与参演的高口碑影视代表作，包含${topWorks}等共${cleanEntities.length}部精选影视档案。查看在线高清直连播放与作品年表。`;
  const canonicalUrl = `${BASE_URL}/person/${encodeURIComponent(personName)}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'iKanPP 爱看片片',
      locale: 'zh_CN',
    },
  };
}

export default async function PersonPage({ params }: Props) {
  const { slug } = await params;
  const personName = decodeURIComponent(slug).trim();

  if (!personName || personName === '实力主演' || personName === '知名导演') {
    notFound();
  }

  const [rawDirectorWorks, rawActorWorks] = await Promise.all([
    getEntitiesByDirector(personName, 48),
    getEntitiesByActor(personName, 48),
  ]);

  const directorClean = rawDirectorWorks.filter(e => !isInvalidDramaOrMovie(e));
  const actorClean = rawActorWorks.filter(e => !isInvalidDramaOrMovie(e));

  const allMap = new Map<string, any>();
  for (const item of [...directorClean, ...actorClean]) {
    if (item && item.entityId && !allMap.has(item.entityId)) {
      allMap.set(item.entityId, item);
    }
  }

  const allEntities = Array.from(allMap.values()).sort((a, b) => {
    const rateA = parseFloat(a.rate || '0');
    const rateB = parseFloat(b.rate || '0');
    return rateB - rateA;
  });

  // 获取影人头像
  let avatarUrl: string | null = null;
  try {
    avatarUrl = await getPersonAvatar(personName);
  } catch {}

  const itemList = allEntities.map((e, idx) => ({
    position: idx + 1,
    url: `${BASE_URL}${e.canonicalSlug ? `/title/${e.canonicalSlug}` : getTitleCanonicalHref(e)}`,
    name: e.title,
    image: e.cover,
  }));

  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: personName,
    url: `${BASE_URL}/person/${encodeURIComponent(personName)}`,
    image: avatarUrl ? avatarUrl : undefined,
    jobTitle: [
      directorClean.length > 0 ? '导演' : null,
      actorClean.length > 0 ? '演员' : null,
    ].filter(Boolean),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: '首页',
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: personName,
        item: `${BASE_URL}/person/${encodeURIComponent(personName)}`,
      },
    ],
  };

  const roles = [
    directorClean.length > 0 ? `执导作品 ${directorClean.length} 部` : null,
    actorClean.length > 0 ? `参演作品 ${actorClean.length} 部` : null,
  ].filter(Boolean).join(' · ');

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* 结构化数据 */}
      <ItemListJsonLd
        name={`${personName} 影视作品集`}
        description={`iKanPP 收录的 ${personName} 影视作品年表与代表作`}
        items={itemList}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
        {/* 面包屑 */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-white/50 mb-6">
          <Link href="/" className="hover:text-white transition-colors">
            首页
          </Link>
          <span>/</span>
          <span className="text-white/80 font-medium">{personName}</span>
        </nav>

        {/* 影人档案头部卡片 */}
        <header className="mb-10 bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden border-2 border-white/20 bg-white/10 shrink-0 shadow-xl">
              {avatarUrl ? (
                <Image
                  src={getOptimizedImageUrl(avatarUrl, { variant: 'avatar' })}
                  alt={personName}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white/30">
                  <User className="w-12 h-12" />
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {personName}
                </h1>
                {directorClean.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-600/20 text-red-400 border border-red-500/30">
                    <Clapperboard className="w-3 h-3" />
                    导演
                  </span>
                )}
                {actorClean.length > 0 && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-600/20 text-amber-400 border border-amber-500/30">
                    <Award className="w-3 h-3" />
                    主演
                  </span>
                )}
              </div>

              <p className="text-sm text-white/60 mb-4">
                {roles || '影视主创'} · 共收录 {allEntities.length} 部代表作
              </p>

              <p className="text-xs sm:text-sm text-white/50 max-w-3xl leading-relaxed">
                收录 {personName} 的经典代表作与全部影视档案。所有片源支持第三方源站极速秒播，无需会员与繁杂步骤。
              </p>
            </div>
          </div>
        </header>

        {/* 影视作品网格 */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2">
              <Film className="w-5 h-5 text-red-500" />
              全部代表作 ({allEntities.length})
            </h2>
            <span className="text-xs text-white/40">按口碑评分排序</span>
          </div>

          {allEntities.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
              {allEntities.map(item => {
                const targetHref = item.canonicalSlug ? `/title/${item.canonicalSlug}` : getTitleCanonicalHref(item);
                return (
                  <Link
                    key={item.entityId}
                    href={targetHref}
                    className="group block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 hover:-translate-y-1"
                  >
                    <div className="relative aspect-2/3 w-full bg-black/40 overflow-hidden">
                      {item.cover ? (
                        <Image
                          src={item.cover}
                          alt={item.title}
                          fill
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/20">
                          <Film className="w-8 h-8" />
                        </div>
                      )}
                      {item.rate && (
                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-amber-400 text-xs font-bold flex items-center gap-0.5">
                          <Star className="w-3 h-3 fill-amber-400" />
                          {item.rate}
                        </div>
                      )}
                    </div>
                    <div className="p-2.5">
                      <h3 className="font-semibold text-sm text-white/90 truncate group-hover:text-red-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-xs text-white/40 mt-0.5">
                        {item.year ? `${item.year} · ` : ''}{item.type === 'tv' ? '电视剧' : '电影'}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-white/40">
              <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>暂无收录该影人的作品档案</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
