import { Metadata } from 'next';
import ShortClient from './ShortClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug, getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '微短剧专区 - 2026 爆款爽剧全集免费在线看 | iKanPP 爱看片片',
  description: 'iKanPP 微短剧频道收录全网热门都市热血、逆袭战神、甜宠虐恋、悬疑古装竖屏短剧。全集高清秒播，极速直连，海外华人无限制免费畅享追剧。',
  openGraph: {
    title: '微短剧专区 - 2026 爆款爽剧全集免费在线看 | iKanPP',
    description: '全网爆款爽剧 · 战神逆袭 · 甜宠古装，全集高清极速连播。',
    type: 'website',
    url: 'https://www.ikanpp.com/short',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/short',
  },
};

export default function ShortPage() {
  const topShort = (PREBAKED_HOME_DATA.short?.top10 || []).slice(0, 10).map((a, idx) => ({
    position: idx + 1,
    name: a.title,
    url: `https://www.ikanpp.com${getTitleCanonicalHref(a)}`,
    image: a.cover,
  }));

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: '首页', url: 'https://www.ikanpp.com' },
    { name: '短剧', url: 'https://www.ikanpp.com/short' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ItemListJsonLd name="热门精品短剧精选" items={topShort} />
      <h1 className="sr-only">微短剧专区 - 2026 爆款爽剧全集免费在线看 | iKanPP 爱看片片</h1>
      <ShortClient />
    </>
  );

}
