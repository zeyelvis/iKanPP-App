'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';
import { CategoryHubSkeleton } from '@/components/category/CategoryHubSkeleton';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

const SHELVES = [
  { title: '2026 华语黄金档热播剧', icon: '🔥', badge: 'HOT', tag: '国产剧' },
  { title: '顶级欧美神剧专区（权游/绝命毒师）', icon: '🌟', badge: 'TOP US', tag: '美剧' },
  { title: '人气爆款韩剧精选', icon: '🍿', badge: 'TRENDING', tag: '韩剧' },
  { title: '经典口碑高分日剧', icon: '🌸', badge: 'JAPAN', tag: '日剧' },
  { title: '经典 TVB & 港剧黄金年代', icon: '🏙️', badge: 'HK TVB', tag: '港剧' },
  { title: '高分口碑华语台剧 & 时代光影', icon: '🍵', badge: 'TAIWAN', tag: '台剧' },
  { title: '东南亚悬疑与浪漫热播泰剧', icon: '🐘', badge: 'THAI', tag: '泰剧' },
  { title: '英伦高分罪案与历史大剧', icon: '👑', badge: 'BRITISH', tag: '英剧' },
];

export default function TvClient() {
  return (
    <Suspense fallback={<CategoryHubSkeleton channelKey="tv" categoryTitle="电视剧集" activeNav="tv" />}>
      <CategoryHub
        categoryTitle="电视剧集"
        categorySubtitle="全球连载追剧 · 华语大剧 · 顶级美剧 · 热门韩剧"
        doubanType="tv"
        activeNav="tv"
        shelves={SHELVES}
        defaultTag="热门"
        heroItems={PREBAKED_HOME_DATA.tv.hero}
        trendingNav={PREBAKED_HOME_DATA.tv.trendingNav}
      />
    </Suspense>
  );
}
