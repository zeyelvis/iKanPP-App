'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';
import { VARIETY_HOME_DATA } from '@/lib/data/home-prebaked-extra';

const GENRES = [
  { label: '真人秀', value: '真人秀' },
  { label: '脱口秀', value: '脱口秀' },
  { label: '音乐竞演', value: '音乐' },
  { label: '喜剧爆笑', value: '喜剧' },
  { label: '美食探寻', value: '美食' },
  { label: '户外旅行', value: '旅行' },
  { label: '恋爱交友', value: '恋爱' },
  { label: '深度访谈', value: '访谈' },
];

const REGIONS = [
  { label: '大陆综艺', value: '综艺' },
  { label: '港台综艺', value: '港台' },
  { label: '韩国综艺', value: '韩国' },
  { label: '欧美真人秀', value: '欧美' },
];

const YEARS = [
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
];

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
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center"><div className="brand-spinner" /></div>}>
      <CategoryHub
        categoryTitle="综艺娱乐"
        categorySubtitle="爆笑真人秀 · 顶级音乐竞演 · 热门脱口秀 · 慢生活旅行"
        doubanType="tv"
        activeNav="variety"
        genres={GENRES}
        regions={REGIONS}
        years={YEARS}
        shelves={SHELVES}
        defaultTag="综艺"
        heroItems={VARIETY_HOME_DATA.hero}
      />
    </Suspense>
  );
}
