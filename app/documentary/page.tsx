import { Metadata } from 'next';
import DocumentaryClient from './DocumentaryClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '纪录片大厅 - BBC 顶级自然生态 & 华夏史诗人文纪录片免费在线观看 | iKanPP 爱看片片',
  description: 'iKanPP 纪录片大厅精选 BBC 史诗级自然与宇宙大片（地球脉动、蓝色星球）、央视顶级华夏人文历史（河西走廊、如果国宝会说话）、人间烟火风味美食（舌尖、风味人间）与豆瓣 9.5+ 殿堂神作。全网超清极速播放。',
  openGraph: {
    title: '纪录片大厅 - BBC 顶级自然 & 华夏人文史诗神作 | iKanPP',
    description: '全球 4K 自然生态 · 华夏史诗人文 · 舌尖风味图鉴，豆瓣高分神作畅享。',
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
    url: `https://www.ikanpp.com/title/${generateSlug(m.title)}`,
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
      <DocumentaryClient />
    </>
  );
}
