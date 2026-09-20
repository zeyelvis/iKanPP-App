import { Metadata } from 'next';
import TvClient from './TvClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '电视剧频道 - 热门华语陆剧 & 美剧韩剧全集免费高清观看 | iKanPP 爱看片片',
  description: 'iKanPP 电视剧频道实时同步最新热门华语陆剧、欧美顶级美剧、高分日韩剧与热血动漫新番。支持选集播放、连载速递与多画质极速直连播放。',
  openGraph: {
    title: '电视剧频道 - 热门华语陆剧 & 美剧韩剧全集免费观看 | iKanPP',
    description: '全网热播大剧 · 连载同步更新 · 4K 高清流畅，一网打尽随时看。',
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
    url: `https://www.ikanpp.com${getTitleCanonicalHref(t)}`,
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

