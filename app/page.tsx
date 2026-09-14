import { Metadata } from 'next';
import { Suspense } from 'react';
import { HomePageClient } from '@/components/home/HomePageClient';
import { HomePageSkeleton } from '@/components/home/HomePageSkeleton';
import { MainSiteJsonLd } from '@/components/seo/MainSiteJsonLd';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
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
