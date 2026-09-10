'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';

const GENRES = [
  { label: '热血', value: '热血' },
  { label: '奇幻', value: '奇幻' },
  { label: '科幻', value: '科幻' },
  { label: '冒险', value: '冒险' },
  { label: '搞笑', value: '搞笑' },
  { label: '恋爱', value: '恋爱' },
  { label: '日常', value: '日常' },
  { label: '治愈', value: '治愈' },
  { label: '悬疑', value: '悬疑' },
];

const REGIONS = [
  { label: '日本动画', value: '日本动画' },
  { label: '国产动画', value: '国产动画' },
  { label: '欧美动画', value: '欧美动画' },
];

const YEARS = [
  { label: '2026 新番', value: '2026' },
  { label: '2025 新番', value: '2025' },
  { label: '2024 新番', value: '2024' },
  { label: '经典神作', value: '日本动画' },
];

const SHELVES: Array<{
  title: string;
  icon: string;
  badge: string;
  tag: string;
  doubanType?: 'movie' | 'tv';
}> = [
  { title: '当季热血新番连载', icon: '⚡', badge: 'SEASON', tag: '日本动画' },
  { title: '国创修真年番巅峰（凡人/仙逆/遮天）', icon: '🐉', badge: 'CHINESE ANIME', tag: '国产动画' },
  { title: '经典殿堂级不朽神作', icon: '👑', badge: 'CLASSIC', tag: '日本动画' },
  { title: '全球经典剧场版动画大电影', icon: '🎨', badge: 'MOVIE', tag: '动画', doubanType: 'movie' },
  { title: '欧美高分动画与科幻视效', icon: '🚀', badge: 'US ANIME', tag: '动画', doubanType: 'movie' },
];

export default function AnimeClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center"><div className="brand-spinner" /></div>}>
      <CategoryHub
        categoryTitle="动漫专区"
        categorySubtitle="当季新番连载 · 国创新巅峰 · 经典剧场版动画"
        doubanType="tv"
        activeNav="anime"
        genres={GENRES}
        regions={REGIONS}
        years={YEARS}
        shelves={SHELVES}
        defaultTag="日本动画"
      />
    </Suspense>
  );
}
