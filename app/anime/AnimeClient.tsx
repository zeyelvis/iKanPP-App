'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';
import { CategoryHubSkeleton } from '@/components/category/CategoryHubSkeleton';
import { ANIME_HOME_DATA } from '@/lib/data/home-prebaked-extra';

const SHELVES = [
  { id: 'a_season', title: '当季热血新番连载', icon: '⚡', badge: 'SEASON', tag: '新番' },
  { id: 'a_china', title: '国创修真年番巅峰（凡人/仙逆/遮天）', icon: '🐉', badge: 'CHINESE ANIME', tag: '国产动画' },
  { id: 'a_classic', title: '经典殿堂级不朽神作', icon: '👑', badge: 'CLASSIC', tag: '日本动画' },
  { id: 'a_movie', title: '全球经典剧场版动画大电影', icon: '🎨', badge: 'MOVIE', tag: '动画', doubanType: 'movie' as const },
  { id: 'a_us', title: '欧美高分动画与科幻视效', icon: '🚀', badge: 'US ANIME', tag: '欧美动画', doubanType: 'movie' as const },
];

export default function AnimeClient() {
  return (
    <Suspense fallback={<CategoryHubSkeleton channelKey="anime" categoryTitle="动漫专区" activeNav="anime" />}>
      <CategoryHub
        categoryTitle="动漫专区"
        categorySubtitle="当季新番连载 · 国创新巅峰 · 经典剧场版动画"
        doubanType="tv"
        activeNav="anime"
        shelves={SHELVES}
        defaultTag="日本动画"
        heroItems={ANIME_HOME_DATA.hero}
        trendingNav={ANIME_HOME_DATA.trendingNav}
      />
    </Suspense>
  );
}
