import { Metadata } from 'next';
import ShortClient from './ShortClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '精品短剧专区 - 2026 最新爆款短剧在线免费全集连播 | iKanPP 爱看片片',
  description: 'iKanPP 精品短剧专区汇聚 2026 全网爆款微短剧，涵盖战神归来、逆袭打脸、豪门总裁、甜宠闪婚、穿越重生、古装权谋等高能爽剧。1080P 超清画质免 VIP 免费极速在线看。',
  openGraph: {
    title: '精品短剧专区 - 爆款微短剧免费全集连播 | iKanPP',
    description: '全网爆款爽剧 · 战神逆袭 · 豪门甜宠 · 穿越重生全集连播，免 VIP 超清畅享。',
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
    url: `https://www.ikanpp.com/title/${generateSlug(a.title)}`,
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
      <ShortClient />
    </>
  );
}
