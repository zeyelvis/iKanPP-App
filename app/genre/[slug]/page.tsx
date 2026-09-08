import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Film, ArrowLeft } from 'lucide-react';
import { getGenreBySlug, GENRE_MAP } from '@/lib/data/genres';
import { getEntitiesByGenre } from '@/lib/services/entity-kv';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { Navbar } from '@/components/layout/Navbar';

export const runtime = 'edge';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const genre = getGenreBySlug(slug);

  if (!genre) {
    return {
      title: '题材未找到 - iKanPP 爱看片片',
      robots: { index: false, follow: false },
    };
  }

  const title = `${genre.name}片大全 - 免费高清在线观看 | iKanPP 爱看片片`;
  const description = `iKanPP 汇聚全网最新高分${genre.name}影视大全。${genre.desc}，多源秒播，海外华人免翻墙极速超清直连播放。`;
  const canonicalUrl = `${BASE_URL}/genre/${genre.slug}`;

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

export default async function GenrePage({ params }: Props) {
  const { slug } = await params;
  const genre = getGenreBySlug(slug);

  if (!genre) {
    notFound();
  }

  const entities = await getEntitiesByGenre(genre.name, 36);

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
        name: `${genre.name}片`,
        item: `${BASE_URL}/genre/${genre.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* 结构化数据 */}
      <ItemListJsonLd
        name={`${genre.name}片精选列表`}
        description={genre.desc}
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
          <span className="text-white/80 font-medium">{genre.name}片</span>
        </nav>

        {/* 顶部标题区 */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
            {genre.name}片大全
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-2xl">
            {genre.desc}。多播放源聚合秒播，海外免翻墙超清无卡顿。
          </p>

          {/* 题材快速横向切换条 */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
            {Object.values(GENRE_MAP).map(g => (
              <Link
                key={g.slug}
                href={`/genre/${g.slug}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                  g.slug === genre.slug
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {g.name}
              </Link>
            ))}
          </div>
        </header>

        {/* 影视卡片网格（直通 /title/ 实体详情页） */}
        {entities.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {entities.map(item => (
              <Link
                key={item.entityId}
                href={`/title/${item.entityId}-${item.slug}`}
                className="group block rounded-xl overflow-hidden bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-200 hover:-translate-y-1"
              >
                <div className="relative aspect-[2/3] w-full bg-black/40 overflow-hidden">
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
                  <h2 className="font-semibold text-sm text-white/90 truncate group-hover:text-red-400 transition-colors">
                    {item.title}
                  </h2>
                  <p className="text-xs text-white/40 mt-0.5">
                    {item.year || '2024'} · {item.type === 'tv' ? '电视剧' : '电影'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center text-white/40">
            <Film className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>该分类正在入库中，敬请期待...</p>
          </div>
        )}
      </main>
    </div>
  );
}
