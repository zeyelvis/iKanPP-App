import { Metadata } from 'next';
import DocumentaryClient from './DocumentaryClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '纪录片大厅 - 豆瓣高分神作 & BBC/国家地理 4K 巨制在线观看 | iKanPP 爱看片片',
  description: 'iKanPP 纪录片频道收录全球自然风光、历史人文、宇宙天文、社会纪实顶级纪录片。汇聚 BBC、国家地理、Discovery 4K 高清珍藏，无广告流畅直连播放。',
  openGraph: {
    title: '纪录片大厅 - 豆瓣高分神作 & BBC/国家地理 4K 巨制 | iKanPP',
    description: '全球顶级神作 · 探索自然宇宙 · 洞悉历史文明，4K 震撼视界畅享。',
    type: 'website',
    url: 'https://www.ikanpp.com/documentary',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/documentary',
  },
};

export default function DocumentaryPage() {
  const topDocs = (PREBAKED_HOME_DATA.documentary?.top10 || PREBAKED_HOME_DATA.documentary?.hero || []).slice(0, 10).map((m, idx) => ({
    position: idx + 1,
    name: m.title,
    url: `https://www.ikanpp.com${getTitleCanonicalHref(m)}`,
    image: m.cover,
  }));

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: '首页', url: 'https://www.ikanpp.com' },
    { name: '纪录片', url: 'https://www.ikanpp.com/documentary' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ItemListJsonLd name="高分经典纪录片精选" items={topDocs} />
      <h1 className="sr-only">纪录片大厅 - 豆瓣高分神作 & BBC/国家地理巨制在线观看 | iKanPP 爱看片片</h1>
      <DocumentaryClient />
    </>
  );

}
