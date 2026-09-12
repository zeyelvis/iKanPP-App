'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

const GENRES = [
  { label: '自然生态', value: '自然' },
  { label: '历史人文', value: '历史' },
  { label: '风味美食', value: '美食' },
  { label: '科学探索', value: '科学' },
  { label: '人文地理', value: '地理' },
  { label: '社会纪实', value: '社会' },
  { label: '传记风云', value: '传记' },
  { label: '极限探险', value: '冒险' },
  { label: '军事战争', value: '战争' },
  { label: '海洋秘境', value: '海洋' },
];

const REGIONS = [
  { label: '华语纪录片', value: '华语' },
  { label: '英国 (BBC)', value: '英国' },
  { label: '美国 (国家地理/探索)', value: '欧美' },
  { label: '日本 (NHK)', value: '日本' },
  { label: '法国', value: '法国' },
  { label: '全球自然', value: '自然' },
];

const YEARS = [
  { label: '2026 最新', value: '2026' },
  { label: '2025 精选', value: '2025' },
  { label: '2024 精选', value: '2024' },
  { label: '经典高分必看', value: '经典高分' },
];

const SHELVES = [
  { title: '🌍 BBC 史诗级自然与浩瀚宇宙', icon: '🌍', badge: 'BBC 4K', tag: '自然' },
  { title: '🍲 人间烟火 · 顶级华语美食图鉴', icon: '🍲', badge: 'FOOD', tag: '美食' },
  { title: '🏺 华夏光影 · 历史人文与国宝探寻', icon: '🏺', badge: 'HISTORY', tag: '历史' },
  { title: '🏆 影史殿堂 · 豆瓣 9.5+ 极致口碑神作', icon: '⭐', badge: 'TOP 9.5+', tag: '豆瓣高分' },
  { title: '🔬 前沿探索 · 科学奥秘与未知文明', icon: '🔬', badge: 'SCIENCE', tag: '科学' },
  { title: '🏔️ 极限挑战 · 人性与自然无畏冒险', icon: '🏔️', badge: 'ADVENTURE', tag: '冒险' },
  { title: '🏙️ 城市微光 · 时代社会与温情纪实', icon: '🏙️', badge: 'LIFE', tag: '社会' },
];

export default function DocumentaryClient() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
          <div className="brand-spinner" />
        </div>
      }
    >
      <CategoryHub
        categoryTitle="纪录片大厅"
        categorySubtitle="全球 4K 顶级自然生态 · 华夏史诗人文 · 舌尖人间烟火"
        doubanType="movie"
        activeNav="documentary"
        genres={GENRES}
        regions={REGIONS}
        years={YEARS}
        shelves={SHELVES}
        defaultTag="纪录片"
        heroItems={PREBAKED_HOME_DATA.documentary?.hero}
        trendingNav={PREBAKED_HOME_DATA.documentary?.trendingNav}
      />
    </Suspense>
  );
}
