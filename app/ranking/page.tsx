import { Metadata } from 'next';
import RankingClient from './RankingClient';

export const metadata: Metadata = {
  title: '影视风云榜 - 实时全网热播榜 & 豆瓣高分榜 TOP50 | iKanPP 爱看片片',
  description: 'iKanPP 影视风云榜实时汇总全网搜索与播放热度，提供电影热度总榜、电视剧风向标、豆瓣影史高分 Top250、动漫新番热度榜与热门综艺榜。一键秒切播放。',
  keywords: ['影视排行榜', '热播榜', '电影排行榜', '电视剧排行榜', '豆瓣高分榜', '动漫热播榜', '综艺排行榜', 'iKanPP'],
  openGraph: {
    title: '影视风云榜 - 实时全网热播榜 & 豆瓣高分榜 | iKanPP',
    description: '全球全网影视风向标 · 实时汇总搜索与播放热度 · 权威排行。',
    type: 'website',
    url: 'https://www.ikanpp.com/ranking',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/ranking',
  },
};

export default function RankingPage() {
  return <RankingClient />;
}
