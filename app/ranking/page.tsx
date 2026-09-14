import { Metadata } from 'next';
import { Suspense } from 'react';
import RankingClient from './RankingClient';
import { CategoryHubSkeleton } from '@/components/category/CategoryHubSkeleton';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '影视风云榜 - 实时全网热播榜 & 豆瓣高分榜 TOP50 | iKanPP 爱看片片',
  description: 'iKanPP 影视风云榜实时汇总全网搜索与播放热度，提供电影热度总榜、电视剧风向标、豆瓣影史高分 Top250、动漫新番热度榜与热门综艺榜。一键秒切播放。',
  openGraph: {
    title: '影视风云榜 - 实时全网热播榜 & 豆瓣高分榜 | iKanPP',
    description: '全球全网影视风向标 · 实时汇总搜索与播放热度 · 权威排行。',
    type: 'website',
    url: 'https://www.ikanpp.com/ranking',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/ranking',
  },
};

export default function RankingPage() {
  const topRanked = [
    ...PREBAKED_HOME_DATA.movie.top10.slice(0, 5),
    ...PREBAKED_HOME_DATA.tv.top10.slice(0, 5),
  ].map((item, idx) => ({
    position: idx + 1,
    name: item.title,
    url: `https://www.ikanpp.com/title/${generateSlug(item.title)}`,
    image: item.cover,
  }));

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: '首页', url: 'https://www.ikanpp.com' },
    { name: '风云榜', url: 'https://www.ikanpp.com/ranking' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ItemListJsonLd name="全网影视风云榜 TOP10" items={topRanked} />
      <Suspense fallback={<CategoryHubSkeleton channelKey="movie" categoryTitle="影视风云榜" activeNav="ranking" />}>
        <RankingClient />
      </Suspense>
    </>
  );
}

