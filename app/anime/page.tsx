import { Metadata } from 'next';
import AnimeClient from './AnimeClient';

export const metadata: Metadata = {
  title: '动漫专区 - 当季新番连载 & 国创动画巅峰之作在线看 | iKanPP 爱看片片',
  description: 'iKanPP 动漫专区覆盖 2026 日本当季热血新番、国创动画巅峰、剧场版动画与影史经典动漫。鬼灭之刃、咒术回战、海贼王、进击的巨人高清全集极速播放。',
  keywords: ['动漫', '新番', '日本动漫', '国漫', '国创动画', '剧场版', '免费动漫', '动漫在线看', 'iKanPP'],
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
  return <AnimeClient />;
}
