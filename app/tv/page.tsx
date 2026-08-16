'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';

const GENRES = [
  { label: '古装', value: '古装' },
  { label: '都市', value: '都市' },
  { label: '悬疑', value: '悬疑' },
  { label: '爱情', value: '爱情' },
  { label: '武侠', value: '武侠' },
  { label: '历史', value: '历史' },
  { label: '科幻', value: '科幻' },
  { label: '喜剧', value: '喜剧' },
  { label: '犯罪', value: '犯罪' },
  { label: '战争', value: '战争' },
];

const REGIONS = [
  { label: '国产剧', value: '国产剧' },
  { label: '美剧', value: '美剧' },
  { label: '韩剧', value: '韩剧' },
  { label: '日剧', value: '日剧' },
  { label: '港剧', value: '香港' },
  { label: '台剧', value: '台湾' },
  { label: '英剧', value: '英国' },
  { label: '泰剧', value: '泰国' },
];

const YEARS = [
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '高分必看', value: '高分' },
];

const SHELVES = [
  { title: '2026 华语黄金档热播剧', icon: '🔥', badge: 'HOT', tag: '国产剧' },
  { title: '顶级欧美神剧专区（权游/绝命毒师）', icon: '🌟', badge: 'TOP US', tag: '美剧' },
  { title: '人气爆款韩剧精选', icon: '🍿', badge: 'TRENDING', tag: '韩剧' },
  { title: '经典口碑高分日剧', icon: '🌸', tag: '日剧' },
];

export default function TvPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center"><div className="brand-spinner" /></div>}>
      <CategoryHub
        categoryTitle="电视剧集"
        categorySubtitle="全球连载追剧 · 华语大剧 · 顶级美剧 · 热门韩剧"
        doubanType="tv"
        activeNav="tv"
        genres={GENRES}
        regions={REGIONS}
        years={YEARS}
        shelves={SHELVES}
        defaultTag="热门"
      />
    </Suspense>
  );
}
