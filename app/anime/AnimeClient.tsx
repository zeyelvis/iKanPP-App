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

const SHELVES = [
  { title: '当季热血新番连载', icon: '⚡', badge: 'SEASON', tag: '日本动画' },
  { title: '国创动画巅峰之作', icon: '🐉', badge: 'CHINESE ANIME', tag: '国产动画' },
  { title: '经典不朽神作（鬼灭/巨人/海贼/咒术）', icon: '👑', badge: 'CLASSIC', tag: '动漫' },
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
