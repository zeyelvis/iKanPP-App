import { Metadata } from 'next';
import TvClient from './TvClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '电视剧集 - 2026 华语热播剧 & 顶级美剧韩剧免费追剧 | iKanPP 爱看片片',
  description: 'iKanPP 电视剧集频道提供 2026 全网热播国产连续剧、顶级欧美神剧、经典高分韩剧与日剧港剧。全集高清更新，极速多源秒切，海外华人无限制畅享追剧。',
  openGraph: {
    title: '电视剧集 - 2026 华语热播剧 & 顶级欧美韩剧 | iKanPP',
    description: '全球连载追剧 · 华语黄金档 · 顶级美剧 · 热门韩剧，全集同步更新。',
    type: 'website',
    url: 'https://www.ikanpp.com/tv',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/tv',
  },
};

export default function TvPage() {
  const topShows = PREBAKED_HOME_DATA.tv.top10.slice(0, 10).map((t, idx) => ({
    position: idx + 1,
    name: t.title,
    url: `https://www.ikanpp.com/title/${generateSlug(t.title)}`,
    image: t.cover,
  }));

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: '首页', url: 'https://www.ikanpp.com' },
    { name: '电视剧', url: 'https://www.ikanpp.com/tv' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ItemListJsonLd name="热门热播剧集" items={topShows} />
      <TvClient />
    </>
  );
}

