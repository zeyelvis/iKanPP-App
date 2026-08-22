'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';

const GENRES = [
  { label: '动作', value: '动作' },
  { label: '喜剧', value: '喜剧' },
  { label: '爱情', value: '爱情' },
  { label: '科幻', value: '科幻' },
  { label: '悬疑', value: '悬疑' },
  { label: '犯罪', value: '犯罪' },
  { label: '恐怖', value: '恐怖' },
  { label: '动画', value: '动画' },
  { label: '奇幻', value: '奇幻' },
  { label: '战争', value: '战争' },
  { label: '纪录片', value: '纪录片' },
];

const REGIONS = [
  { label: '华语', value: '华语' },
  { label: '中国香港', value: '中国香港' },
  { label: '中国台湾', value: '中国台湾' },
  { label: '美国', value: '欧美' },
  { label: '日本', value: '日本' },
  { label: '韩国', value: '韩国' },
  { label: '英国', value: '英国' },
  { label: '法国', value: '法国' },
];

const YEARS = [
  { label: '2026', value: '2026' },
  { label: '2025', value: '2025' },
  { label: '2024', value: '2024' },
  { label: '2023', value: '2023' },
  { label: '经典高分', value: '经典高分' },
];

const SHELVES = [
  { title: '院线热映 & 最新上线', icon: '✨', badge: 'NEW', tag: '最新' },
  { title: '豆瓣 9.0+ 影史高分神作', icon: '⭐', badge: 'HIGH RATED', tag: '豆瓣高分' },
  { title: '好莱坞 & 欧美动作科幻巨制', icon: '🚀', badge: '4K ULTRA', tag: '欧美' },
  { title: '华语经典口碑电影', icon: '🏮', badge: 'CLASSIC', tag: '华语' },
  { title: '燃爆视效 · 巅峰动作大片', icon: '💥', badge: 'ACTION', tag: '动作' },
  { title: '高能烧脑 · 悬疑惊悚精选', icon: '🕵️', badge: 'SUSPENSE', tag: '悬疑' },
  { title: '合家欢 · 爆笑喜剧精选', icon: '🍿', badge: 'COMEDY', tag: '喜剧' },
  { title: '全球高分经典动画电影', icon: '🎨', badge: 'ANIMATION', tag: '动画' },
];

export default function MovieClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center"><div className="brand-spinner" /></div>}>
      <CategoryHub
        categoryTitle="电影大厅"
        categorySubtitle="全球 4K 院线巨制 · 豆瓣高分神作 · 经典华语佳片"
        doubanType="movie"
        activeNav="movie"
        genres={GENRES}
        regions={REGIONS}
        years={YEARS}
        shelves={SHELVES}
        defaultTag="热门"
      />
    </Suspense>
  );
}
