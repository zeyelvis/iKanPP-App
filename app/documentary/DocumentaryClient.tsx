'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';
import { CategoryHubSkeleton } from '@/components/category/CategoryHubSkeleton';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

const SHELVES = [
  { id: 'doc_nature', title: '🌍 BBC 史诗级自然与浩瀚宇宙', icon: '🌍', badge: 'BBC 4K', tag: '自然', doubanType: 'tv' as const },
  { id: 'doc_food', title: '🍲 人间烟火 · 顶级华语美食图鉴', icon: '🍲', badge: 'FOOD', tag: '美食', doubanType: 'tv' as const },
  { id: 'doc_history', title: '🏺 华夏光影 · 历史人文与国宝探寻', icon: '🏺', badge: 'HISTORY', tag: '历史', doubanType: 'tv' as const },
  { id: 'doc_top', title: '🏆 影史殿堂 · 豆瓣 9.5+ 极致口碑神作', icon: '⭐', badge: 'TOP 9.5+', tag: '豆瓣高分', doubanType: 'tv' as const },
  { id: 'doc_science', title: '🔬 前沿探索 · 科学奥秘与未知文明', icon: '🔬', badge: 'SCIENCE', tag: '科学', doubanType: 'tv' as const },
  { id: 'doc_adventure', title: '🏔️ 极限挑战 · 人性与自然无畏冒险', icon: '🏔️', badge: 'ADVENTURE', tag: '冒险', doubanType: 'tv' as const },
  { id: 'doc_life', title: '🏙️ 城市微光 · 时代社会与温情纪实', icon: '🏙️', badge: 'LIFE', tag: '社会', doubanType: 'tv' as const },
];

export default function DocumentaryClient() {
  return (
    <Suspense
      fallback={
        <CategoryHubSkeleton channelKey="documentary" categoryTitle="纪录片大厅" activeNav="documentary" />
      }
    >
      <CategoryHub
        categoryTitle="纪录片大厅"
        categorySubtitle="全球 4K 顶级自然生态 · 华夏史诗人文 · 舌尖人间烟火"
        doubanType="tv"
        activeNav="documentary"
        shelves={SHELVES}
        defaultTag="纪录片"
        heroItems={PREBAKED_HOME_DATA.documentary?.hero}
        trendingNav={PREBAKED_HOME_DATA.documentary?.trendingNav}
      />
    </Suspense>
  );
}
