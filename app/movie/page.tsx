import { Metadata } from 'next';
import MovieClient from './MovieClient';

export const metadata: Metadata = {
  title: '电影大厅 - 4K 院线大片 & 豆瓣高分神作免费在线观看 | iKanPP 爱看片片',
  description: 'iKanPP 电影频道汇聚最新院线大片、好莱坞 4K 动作科幻巨制、豆瓣高分华语经典与影史必看神作。支持动作、喜剧、悬疑、科幻等多维分类筛选，海外华人免翻墙高速播放。',
  keywords: ['电影', '最新电影', '4K电影', '院线大片', '豆瓣高分电影', '好莱坞大片', '免费电影', '海外看电影', 'iKanPP'],
  openGraph: {
    title: '电影大厅 - 4K 院线大片 & 豆瓣高分神作 | iKanPP',
    description: '全球 4K 院线巨制 · 豆瓣高分神作 · 经典华语佳片，多维筛选随心畅看。',
    type: 'website',
    url: 'https://www.ikanpp.com/movie',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/movie',
  },
};

export default function MoviePage() {
  return <MovieClient />;
}
