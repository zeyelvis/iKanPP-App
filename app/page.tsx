import { Metadata } from 'next';
import { Suspense } from 'react';
import { HomePageClient } from '@/components/home/HomePageClient';
import { HomePageSkeleton } from '@/components/home/HomePageSkeleton';
import { MainSiteJsonLd } from '@/components/seo/MainSiteJsonLd';
import { PageDataProvider } from '@/components/data/PageDataProvider';
import { loadPageData } from '@/lib/data/d1/page-data';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';


export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

// 首屏数据来自 D1（入库 Worker 每小时更新）；页面缓存 5 分钟。
export const revalidate = 300;

export default async function Home() {
  const data = await loadPageData({
    home: ['all', 'movie', 'tv', 'anime', 'variety', 'documentary', 'short'],
    latest: ['all', 'movie', 'tv', 'anime', 'variety', 'documentary'],
  });
  // 首屏轮播第一张的大图提前加载（原来写在根布局里，每个页面都预加载首页大图）。
  const firstBackdrop = data.home.all?.hero?.[0]?.backdrop;
  return (
    <PageDataProvider data={data}>
      {firstBackdrop && (
        <>
          <link rel="preload" as="image" href={getOptimizedImageUrl(firstBackdrop, { width: 1280, noFallback: true })} media="(min-width: 641px)" fetchPriority="high" />
          <link rel="preload" as="image" href={getOptimizedImageUrl(firstBackdrop, { width: 500, noFallback: true })} media="(max-width: 640px)" fetchPriority="high" />
        </>
      )}

      {/* 服务端直出 Schema.org 知识图谱与 AI FAQ 胶囊，确保百度/秘塔等任何爬虫首字节 100% 抓取 */}
      <MainSiteJsonLd />
      {/* 语义化固化 H1，供搜索引擎爬虫与无障碍识别，视觉通过 sr-only 隐藏保持原有视觉美感 */}
      <h1 className="sr-only">iKanPP — 海外华人影视聚合搜索平台</h1>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageClient />
      </Suspense>
    </PageDataProvider>
  );
}

