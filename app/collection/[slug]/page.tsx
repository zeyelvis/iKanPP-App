import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  getCollectionBySlug,
  CURATED_COLLECTIONS,
  CollectionSubject,
} from '@/lib/data/collections-prebaked';
import { Navbar } from '@/components/layout/Navbar';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { CollectionDetailClient } from './CollectionDetailClient';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';
import { toAbsoluteUrl } from '@/lib/utils/canonical';

export function generateStaticParams() {
  return CURATED_COLLECTIONS.map(c => ({ slug: c.slug }));
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    return {
      title: '精选片单未找到 - iKanPP 爱看片片',
      robots: { index: false, follow: false },
    };
  }

  const filmCount = collection.films?.length || collection.totalCount || 0;
  const title = `${collection.title} - 精选片单推荐 | iKanPP 爱看片片`;
  const description = `${collection.description}。iKanPP 收录 ${filmCount} 部精选影视作品，查看在线剧情简介与深度推荐。`;
  const canonicalUrl = `${BASE_URL}/collection/${collection.slug}`;

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
      images: collection.coverPosters[0]
        ? [{ url: collection.coverPosters[0], width: 500, height: 750, alt: collection.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: collection.coverPosters[0] ? [collection.coverPosters[0]] : [],
    },
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const collection = getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  const itemList = collection.films.map((f: CollectionSubject, idx: number) => ({
    position: idx + 1,
    url: toAbsoluteUrl(getTitleCanonicalHref(f)),
    name: f.title,
    image: f.cover,
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
        name: '精选片单',
        item: `${BASE_URL}/collection/${collection.slug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: collection.title,
        item: `${BASE_URL}/collection/${collection.slug}`,
      },
    ],
  };

  return (
    <>
      {/* SEO 结构化数据 */}
      <ItemListJsonLd
        name={`${collection.title} - 精选片单`}
        description={collection.description}
        items={itemList}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* 顶部导航 */}
      <Navbar />

      {/* 片单详情主体 */}
      <main>
        <CollectionDetailClient collection={collection} />
      </main>
    </>
  );
}
