import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Film, Clapperboard } from 'lucide-react';
import { getEntitiesByDirector } from '@/lib/services/entity-kv';
import { searchAndEnrichPersonCredits } from '@/lib/services/entity-enrichment';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { Navbar } from '@/components/layout/Navbar';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const directorName = decodeURIComponent(slug).trim();

  if (!directorName || directorName === '知名导演') {
    return {
      title: '导演作品未找到 - iKanPP 爱看片片',
      robots: { index: false, follow: false },
    };
  }

  const title = `${directorName} 导演执导作品大全 - 免费高清在线观看 | iKanPP 爱看片片`;
  const description = `iKanPP 汇聚${directorName}导演执导的高分电影与热门剧集全集。高清多源秒播，海外华人免翻墙极速超清直连播放。`;
  const canonicalUrl = `${BASE_URL}/director/${encodeURIComponent(directorName)}`;

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

export default async function DirectorPage({ params }: Props) {
  const { slug } = await params;
  const directorName = decodeURIComponent(slug).trim();

  if (!directorName || directorName === '知名导演') {
    notFound();
  }

  let entities = await getEntitiesByDirector(directorName, 48);

  // 导演作品自愈与自繁殖扩充（通过 TMDB 人物履历抓取其全部执导代表作）
  if (entities.length === 0) {
    try {
      const enriched = await searchAndEnrichPersonCredits(directorName, 'director', 36);
      if (enriched.length > 0) {
        entities = enriched;
      }
    } catch {}
  }

  const itemList = entities.map((e, idx) => ({
    position: idx + 1,
    url: `${BASE_URL}/title/${e.entityId}-${e.slug}`,
    name: e.title,
    image: e.cover,
  }));

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
        name: `${directorName} 执导作品`,
        item: `${BASE_URL}/director/${encodeURIComponent(directorName)}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* 结构化数据 (ItemList + BreadcrumbList) */}
      <ItemListJsonLd
        name={`${directorName} 导演作品列表`}
        description={`${directorName} 执导的高分影视作品精选合集`}
        items={itemList}
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
          <span className="text-white/80 font-medium">{directorName} 导演专栏</span>
        </nav>

        {/* 顶部标题区 */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-red-600/10 border border-red-500/20 text-red-500">
              <Clapperboard className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {directorName} 导演作品大全
              </h1>
            </div>
          </div>
          <p className="text-white/60 text-sm sm:text-base max-w-2xl mt-2">
            共收录 {entities.length} 部由 {directorName} 执导的精选影视作品。支持高清直连秒播，画质清晰流畅无广告卡顿。
          </p>
        </header>

        {/* 影视卡片网格 */}
        {entities.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {entities.map(item => (
              <Link
                key={item.entityId}
                href={`/title/${item.entityId}-${item.slug}`}
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
                    <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-amber-500/30 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      <span className="font-bold text-amber-400 text-xs">{item.rate}</span>
                    </div>
                  )}
                  {item.year && (
                    <div className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[11px] text-white/70">
                      {item.year}
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-semibold text-sm text-white/90 group-hover:text-white truncate">
                    {item.title}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-white/40">
                    <span>{item.type === 'movie' ? '电影' : '剧集'}</span>
                    {item.genres && item.genres.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="truncate">{item.genres.slice(0, 2).join('/')}</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
            <Film className="w-12 h-12 text-white/30 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-white mb-1">暂无 {directorName} 执导的相关片源</h3>
            <p className="text-sm text-white/50 mb-6">我们将根据全网热门动态持续同步更新收录。</p>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-sm transition-colors"
            >
              返回首页探索
            </Link>
          </div>
        )}
      </main>

      {/* Speculation Rules API */}
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
    </div>
  );
}
