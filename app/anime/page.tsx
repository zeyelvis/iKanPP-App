import { Metadata } from 'next';
import AnimeClient from './AnimeClient';
import { ItemListJsonLd } from '@/components/seo/ItemListJsonLd';
import { JsonLd, generateBreadcrumbJsonLd } from '@/components/seo/JsonLd';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';
import { generateSlug } from '@/lib/data/entities/entity-utils';

export const metadata: Metadata = {
  title: '动漫专区 - 当季新番连载 & 国创动画巅峰之作在线看 | iKanPP 爱看片片',
  description: 'iKanPP 动漫专区覆盖 2026 日本当季热血新番、国创动画巅峰、剧场版动画与影史经典动漫。鬼灭之刃、咒术回战、海贼王、进击的巨人高清全集极速播放。',
  openGraph: {
    title: '动漫专区 - 当季新番连载 & 国创动画巅峰 | iKanPP',
    description: '当季新番连载 · 国创新巅峰 · 经典剧场版动画，4K 蓝光画质畅享。',
    type: 'website',
    url: 'https://www.ikanpp.com/anime',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/anime',
  },
};

export default function AnimePage() {
  const topAnime = PREBAKED_HOME_DATA.tv.s3.slice(0, 10).map((a, idx) => ({
    position: idx + 1,
    name: a.title,
    url: `https://www.ikanpp.com/title/${generateSlug(a.title)}`,
    image: a.cover,
  }));

  const breadcrumbs = generateBreadcrumbJsonLd([
    { name: '首页', url: 'https://www.ikanpp.com' },
    { name: '动漫', url: 'https://www.ikanpp.com/anime' },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbs} />
      <ItemListJsonLd name="热门动漫精选" items={topAnime} />
      <AnimeClient />
    </>
  );
}

