import { Metadata } from 'next';
import TvClient from './TvClient';

export const metadata: Metadata = {
  title: '电视剧集 - 2026 华语热播剧 & 顶级美剧韩剧免费追剧 | iKanPP 爱看片片',
  description: 'iKanPP 电视剧集频道提供 2026 全网热播国产连续剧、顶级欧美神剧、经典高分韩剧与日剧港剧。全集高清更新，极速多源秒切，海外华人无限制畅享追剧。',
  keywords: ['电视剧', '热播剧', '国产剧', '美剧', '韩剧', '日剧', '港剧', '海外追剧', '免费电视剧', 'iKanPP'],
  openGraph: {
    title: '电视剧集 - 2026 华语热播剧 & 顶级欧美韩剧 | iKanPP',
    description: '全球连载追剧 · 华语黄金档 · 顶级美剧 · 热门韩剧，全集同步更新。',
    type: 'website',
    url: 'https://www.ikanpp.com/tv',
  },
  alternates: {
    canonical: 'https://www.ikanpp.com/tv',
  },
};

export default function TvPage() {
  return <TvClient />;
}
