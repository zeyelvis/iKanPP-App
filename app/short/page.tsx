import { Metadata } from 'next';
import ShortClient from './ShortClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '精品微短剧专区 - 36,000+ 热门爆款短剧在线免费全集极速播放 | iKanPP 爱看片片',
  description: 'iKanPP 微短剧频道汇聚 36,000+ 部全网超人气微短剧，9 大子分类精准涵盖反转爽剧、言情总裁、现代都市、古装仙侠、穿越年代、重生民国、脑洞悬疑等。支持 9:16 沉浸式竖屏上下滑动切集与免费连播。',
  openGraph: {
    title: '精品微短剧专区 - 36,000+ 部爆款爽剧沉浸式免费看 | iKanPP',
    description: '反转爽剧 · 言情总裁 · 古装仙侠 · 穿越重生全集连播，9:16 沉浸式竖屏播放免 VIP 畅享。',
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
