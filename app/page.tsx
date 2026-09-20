import { Metadata } from 'next';
import { Suspense } from 'react';
import { HomePageClient } from '@/components/home/HomePageClient';
import { HomePageSkeleton } from '@/components/home/HomePageSkeleton';
import { MainSiteJsonLd } from '@/components/seo/MainSiteJsonLd';
import { ALL_HOME_DATA } from '@/lib/data/home-prebaked-extra';

import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  const hero = ALL_HOME_DATA.hero[0];
  const desktopBackdropUrl = hero?.backdrop
    ? getOptimizedImageUrl(hero.backdrop, { width: 1280, noFallback: true })
    : '';
  const mobileBackdropUrl = hero?.backdrop
    ? getOptimizedImageUrl(hero.backdrop, { width: 780, noFallback: true })
    : '';

  return (
    <>
      {/* 🚀 LCP 极速攻坚：服务端直出 Hero 响应式高优先级预加载，彻底消除首屏大图发现延迟 */}
      {desktopBackdropUrl && (
        <link
          rel="preload"
          as="image"
          href={desktopBackdropUrl}
          media="(min-width: 641px)"
          fetchPriority="high"
        />
      )}
      {mobileBackdropUrl && (
        <link
          rel="preload"
          as="image"
          href={mobileBackdropUrl}
          media="(max-width: 640px)"
          fetchPriority="high"
        />
      )}

      {/* 服务端直出 Schema.org 知识图谱与 AI FAQ 胶囊，确保百度/秘塔等任何爬虫首字节 100% 抓取 */}
      <MainSiteJsonLd />
      {/* 语义化固化 H1，供搜索引擎爬虫与无障碍识别，视觉通过 sr-only 隐藏保持原有视觉美感 */}
      <h1 className="sr-only">iKanPP — 海外华人影视聚合搜索平台</h1>
      <Suspense fallback={<HomePageSkeleton />}>
        <HomePageClient />
      </Suspense>
    </>
  );
}

