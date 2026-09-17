'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';
import { CategoryHubSkeleton } from '@/components/category/CategoryHubSkeleton';
import { VARIETY_HOME_DATA } from '@/lib/data/home-prebaked-extra';

const SHELVES = [
  { title: '全网热播爆款综艺', icon: '🎤', badge: 'HOT', tag: '综艺' },
  { title: '爆笑喜剧与名场面脱口秀', icon: '🤣', badge: 'COMEDY', tag: '脱口秀' },
  { title: '顶级音乐竞演现场', icon: '🎵', badge: 'MUSIC', tag: '综艺' },
  { title: '慢生活治愈与美食旅行', icon: '🌿', badge: 'SLOW LIFE', tag: '综艺' },
  { title: '韩国人气真人秀专区', icon: '🎪', badge: 'K-SHOW', tag: '韩国' },
  { title: '硬核推理与高能逃脱（大侦探/密逃）', icon: '🕵️', badge: 'DETECTIVE', tag: '综艺' },
];

export default function VarietyClient() {
  return (
    <Suspense fallback={<CategoryHubSkeleton channelKey="variety" categoryTitle="综艺娱乐" activeNav="variety" />}>
      <CategoryHub
        categoryTitle="综艺娱乐"
        categorySubtitle="爆笑真人秀 · 顶级音乐竞演 · 热门脱口秀 · 慢生活旅行"
        doubanType="tv"
        activeNav="variety"
        shelves={SHELVES}
        defaultTag="综艺"
        heroItems={VARIETY_HOME_DATA.hero}
        trendingNav={VARIETY_HOME_DATA.trendingNav}
      />
    </Suspense>
  );
}
