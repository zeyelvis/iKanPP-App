import { Metadata } from 'next';
import { Suspense } from 'react';
import { HomePageClient } from '@/components/home/HomePageClient';

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
};

export default function Home() {
  return (
    <>
      {/* 语义化固化 H1，供搜索引擎爬虫与无障碍识别，视觉通过 sr-only 隐藏保持原有视觉美感 */}
      <h1 className="sr-only">iKanPP — 海外华人影视聚合搜索平台</h1>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <div className="brand-spinner" />
          </div>
        }
      >
        <HomePageClient />
      </Suspense>
    </>
  );
}
