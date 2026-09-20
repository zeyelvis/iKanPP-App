import { Metadata } from 'next';
import VarietyClient from './VarietyClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '综艺大厅 - 2026最新热门华语/韩国真人秀与脱口秀在线看 | iKanPP 爱看片片',
  description: 'iKanPP 综艺专区收录奔跑吧、极限挑战、王牌对王牌、乘风破浪等当季热播真人秀，支持超清原画在线免费看。',
  alternates: {
    canonical: 'https://www.ikanpp.com/variety',
  },
};

export default function VarietyPage() {
  const topShows = PREBAKED_HOME_DATA.tv.s4.slice(0, 10).map((v, idx) => ({
    position: idx + 1,
    name: v.title,
    url: `https://www.ikanpp.com${getTitleCanonicalHref(v)}`,
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
      <h1 className="sr-only">综艺大厅 - 2026 最新热门真人秀与脱口秀在线观看 | iKanPP 爱看片片</h1>
      <VarietyClient />
    </>
  );

}

