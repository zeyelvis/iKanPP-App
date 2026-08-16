'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';

const GENRES = [
  { label: '玄幻修真', value: '玄幻' },
  { label: '热血战斗', value: '热血' },
  { label: '3D 科幻', value: '科幻' },
  { label: '古风仙侠', value: '仙侠' },
  { label: '穿越重生', value: '穿越' },
  { label: '都市异能', value: '都市' },
  { label: '恋爱少女', value: '恋爱' },
  { label: '搞笑日常', value: '搞笑' },
];

const REGIONS = [
  { label: '国创年番', value: '国产动画' },
  { label: '玄幻大作', value: '玄幻' },
  { label: '漫改神作', value: '国漫' },
  { label: '经典重温', value: '经典' },
];

const YEARS = [
  { label: '2026 连载', value: '2026' },
  { label: '2025 热播', value: '2025' },
  { label: '2024 精选', value: '2024' },
  { label: '封神经典', value: '国产动画' },
];

const SHELVES = [
  { title: '🔥 现象级玄幻修真年番（凡人/遮天/完美/仙逆）', icon: '🗡️', badge: 'HOT C-ANIME', tag: '国产动画' },
  { title: '🚀 3D 异能末世与高燃科幻（吞噬星空/灵笼/沧元图）', icon: '⚡', badge: '3D SCI-FI', tag: '国产动画' },
  { title: '🌸 唯美国风经典（一人之下/狐妖/剑来/大理寺）', icon: '🏮', badge: 'MASTERPIECE', tag: '国产动画' },
];

export default function GuomanClient() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center"><div className="brand-spinner" /></div>}>
      <CategoryHub
        categoryTitle="国创动漫大厅"
        categorySubtitle="东方玄幻修仙年番 · 3D 科幻末世巨制 · 唯美国风经典"
        doubanType="tv"
        activeNav="guoman"
        genres={GENRES}
        regions={REGIONS}
        years={YEARS}
        shelves={SHELVES}
        defaultTag="国产动画"
      />
    </Suspense>
  );
}
