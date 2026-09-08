import { Metadata } from 'next';
import VarietyClient from './VarietyClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '综艺娱乐 - 热门真人秀 & 爆笑脱口秀音乐竞演在线看 | iKanPP 爱看片片',
  description: 'iKanPP 综艺频道汇聚 2026 最新爆款真人秀、热门脱口秀、音乐竞演现场、日韩高分真人秀与欧美精选综艺。全网聚合超清无广告，随时随地开心追综。',
  openGraph: {
    title: '综艺娱乐 - 热门真人秀 & 爆笑脱口秀 | iKanPP',
    description: '爆笑真人秀 · 顶级音乐竞演 · 热门脱口秀 · 慢生活旅行。',
    type: 'website',
    url: 'https://www.ikanpp.com/variety',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/variety',
  },
};

export default function VarietyPage() {
  const topShows = PREBAKED_HOME_DATA.tv.s4.slice(0, 10).map((v, idx) => ({
    position: idx + 1,
    name: v.title,
    url: `https://www.ikanpp.com/title/${generateSlug(v.title)}`,
    image: v.cover,
  }));

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: '首页', url: 'https://www.ikanpp.com' },
    { name: '综艺', url: 'https://www.ikanpp.com/variety' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ItemListJsonLd name="热门综艺精选" items={topShows} />
      <VarietyClient />
    </>
  );
}

