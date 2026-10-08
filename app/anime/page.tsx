import { Metadata } from 'next';
import AnimeClient from './AnimeClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PageDataProvider } from '@/components/data/PageDataProvider';
import { loadPageData } from '@/lib/data/d1/page-data';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '动漫大全 - 2026最新热门日本动漫与国漫在线观看 | iKanPP 爱看片片',
  description: 'iKanPP 动漫频道收录最新热播日本新番、经典国创动画、热血修仙全集高清流媒体资源。免VIP全网纯直连超清速播。',
  alternates: {
    canonical: 'https://www.ikanpp.com/anime',
  },
};

// 首屏数据来自 D1（入库 Worker 每小时更新）；页面缓存 5 分钟。
export const revalidate = 300;

export default async function AnimePage() {
  const data = await loadPageData({ home: ['anime', 'tv'], latest: ['anime'], category: ['anime'] });
  const topAnime = (data.home.tv?.s3 ?? []).slice(0, 10).map((a, idx) => ({
    position: idx + 1,
    name: a.title,
    url: `https://www.ikanpp.com${getTitleCanonicalHref(a)}`,
    image: a.cover,
  }));

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: '首页', url: 'https://www.ikanpp.com' },
    { name: '动漫', url: 'https://www.ikanpp.com/anime' },
  ]);

  return (
    <PageDataProvider data={data}>
      <JsonLd data={breadcrumbs} />
      <ItemListJsonLd name="热门动漫精选" items={topAnime} />
      <h1 className="sr-only">动漫专区 - 2026 最新热门日本动漫与国漫在线观看 | iKanPP 爱看片片</h1>
      <AnimeClient />
    </PageDataProvider>
  );

}

