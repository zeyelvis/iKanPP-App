import { Metadata } from 'next';
import MovieClient from './MovieClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PageDataProvider } from '@/components/data/PageDataProvider';
import { loadPageData } from '@/lib/data/d1/page-data';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '电影大厅 - 4K 院线大片 & 豆瓣高分神作免费在线观看 | iKanPP 爱看片片',
  description: 'iKanPP 电影频道汇聚最新院线大片、好莱坞 4K 动作科幻巨制、豆瓣高分华语经典与影史必看神作。支持动作、喜剧、悬疑、科幻等多维分类筛选，海外华人免翻墙高速播放。',
  openGraph: {
    title: '电影大厅 - 4K 院线大片 & 豆瓣高分神作 | iKanPP',
    description: '全球 4K 院线巨制 · 豆瓣高分神作 · 经典华语佳片，多维筛选随心畅看。',
    type: 'website',
    url: 'https://www.ikanpp.com/movie',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/movie',
  },
};

// 首屏数据来自 D1（入库 Worker 每小时更新）；页面缓存 5 分钟。
export const revalidate = 300;

export default async function MoviePage() {
  const data = await loadPageData({ home: ['movie'], latest: ['movie'], category: ['movie'] });
  const topMovies = (data.home.movie?.top10 ?? []).slice(0, 10).map((m, idx) => ({
    position: idx + 1,
    name: m.title,
    url: `https://www.ikanpp.com${getTitleCanonicalHref(m)}`,
    image: m.cover,
  }));

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: '首页', url: 'https://www.ikanpp.com' },
    { name: '电影', url: 'https://www.ikanpp.com/movie' },
  ]);

  return (
    <PageDataProvider data={data}>
      <JsonLd data={breadcrumbs} />
      <ItemListJsonLd name="热门电影精选" items={topMovies} />
      <h1 className="sr-only">电影大厅 - 4K 院线大片 & 豆瓣高分神作在线观看 | iKanPP 爱看片片</h1>
      <MovieClient />
    </PageDataProvider>
  );

}

