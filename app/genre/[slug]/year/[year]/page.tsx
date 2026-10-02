import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Star, Film } from 'lucide-react';
import { getGenreBySlug, GENRE_MAP } from '@/lib/data/genres';
import { getYearBySlug, YEAR_MAP } from '@/lib/data/years';
import { getEntitiesByGenreAndYear } from '@/lib/services/entity-kv';
import { getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { Navbar } from '@/components/layout/Navbar';

export const revalidate = 86400;

export function generateStaticParams() {
  const topGenres = ['action', 'comedy', 'drama', 'scifi', 'romance', 'thriller', 'animation'];
  const topYears = ['2026', '2025', '2024', '2023'];
  const params: { slug: string; year: string }[] = [];
  for (const slug of topGenres) {
    for (const year of topYears) {
      params.push({ slug, year });
    }
  }
  return params;
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

interface Props {
  params: Promise<{ slug: string; year: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, year: yearParam } = await params;
  const genre = getGenreBySlug(slug);
  const yearInfo = getYearBySlug(yearParam);

  if (!genre || !yearInfo) {
    return {
      title: '分类未找到 - iKanPP 爱看片片',
      robots: { index: false, follow: false },
    };
  }

  const entities = await getEntitiesByGenreAndYear(genre.name, yearInfo.slug, 12);
  if (entities.length === 0) {
    return {
      title: `${yearInfo.name}${genre.name}片大全 - iKanPP 爱看片片`,
      description: `查看${yearInfo.name}${genre.name}类精选影视作品档案。`,
      robots: { index: false, follow: false },
    };
  }

  const title = `${yearInfo.name}${genre.name}片大全 - 热门高分影视作品精选 | iKanPP 爱看片片`;
  const description = `iKanPP 收录${yearInfo.name}上映与播出的${genre.name}影视作品精选。多播放源直连极速秒播，无需会员与繁杂步骤。`;
  const canonicalUrl = `${BASE_URL}/genre/${genre.slug}/year/${yearInfo.slug}`;

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

export default async function GenreYearPage({ params }: Props) {
  const { slug, year: yearParam } = await params;
  const genre = getGenreBySlug(slug);
  const yearInfo = getYearBySlug(yearParam);

  if (!genre || !yearInfo) {
    notFound();
  }

  const entities = await getEntitiesByGenreAndYear(genre.name, yearInfo.slug, 36);

  const itemList = entities.map((e, idx) => ({
    position: idx + 1,
    url: `${BASE_URL}${e.canonicalSlug ? `/title/${e.canonicalSlug}` : getTitleCanonicalHref(e)}`,
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
      {
        '@type': 'ListItem',
        position: 3,
        name: `${yearInfo.name}`,
        item: `${BASE_URL}/genre/${genre.slug}/year/${yearInfo.slug}`,
      },
    ],
  };

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white">
      {/* 结构化数据 */}
      <ItemListJsonLd
        name={`${yearInfo.name}${genre.name}片列表`}
        description={`${yearInfo.name}${genre.name}类精选影视作品推荐`}
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
          <Link href={`/genre/${genre.slug}`} className="hover:text-white transition-colors">
            {genre.name}片
          </Link>
          <span>/</span>
          <span className="text-white/80 font-medium">{yearInfo.name}</span>
        </nav>

        {/* 顶部标题区 */}
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3">
            {yearInfo.name}{genre.name}片大全
          </h1>
          <p className="text-white/60 text-sm sm:text-base max-w-2xl">
            收录{yearInfo.name}精选优质{genre.name}影视作品，{genre.desc}。多源秒播，海外免翻墙超清无卡顿。
          </p>

          {/* 年份快捷横滑条 */}
          <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-2 scrollbar-none">
            {Object.values(YEAR_MAP).slice(0, 8).map(y => (
              <Link
                key={y.slug}
                href={`/genre/${genre.slug}/year/${y.slug}`}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition-colors ${
                  y.slug === yearInfo.slug
                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                    : 'bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                {y.name}
              </Link>
            ))}
          </div>
        </header>

        {/* 影视卡片网格 */}
        {entities.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-6">
            {entities.map(item => {
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
                    <h2 className="font-semibold text-sm text-white/90 truncate group-hover:text-red-400 transition-colors">
                      {item.title}
                    </h2>
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
            <p>该分类与年份正在增量收录中，敬请期待...</p>
          </div>
        )}
      </main>
    </div>
  );
}
