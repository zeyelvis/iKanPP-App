'use client';

import { Suspense } from 'react';
import { CategoryHub } from '@/components/category/CategoryHub';
import { CategoryHubSkeleton } from '@/components/category/CategoryHubSkeleton';
import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

const SHELVES = [
  { id: 'm_new', title: '院线热映 & 最新上线', icon: '✨', badge: 'NEW', tag: '最新' },
  { id: 'm_top', title: '豆瓣 9.0+ 影史高分神作', icon: '⭐', badge: 'HIGH RATED', tag: '豆瓣高分' },
  { id: 'm_hollywood', title: '好莱坞 & 欧美动作科幻巨制', icon: '🚀', badge: '4K ULTRA', tag: '欧美' },
  { id: 'm_chinese', title: '华语经典口碑电影', icon: '🏮', badge: 'CLASSIC', tag: '华语' },
  { id: 'm_action', title: '燃爆视效 · 巅峰动作大片', icon: '💥', badge: 'ACTION', tag: '动作' },
  { id: 'm_suspense', title: '高能烧脑 · 悬疑惊悚精选', icon: '🕵️', badge: 'SUSPENSE', tag: '悬疑' },
  { id: 'm_comedy', title: '合家欢 · 爆笑喜剧精选', icon: '🍿', badge: 'COMEDY', tag: '喜剧' },
  { id: 'm_anim', title: '全球高分经典动画电影', icon: '🎨', badge: 'ANIMATION', tag: '动画' },
  { id: 'm_doc', title: '震撼自然与人文 · 高分纪录片', icon: '🌍', badge: 'DOCS', tag: '纪录片' },
  { id: 'm_hidden', title: '冷门黑马 · 深度挖掘口碑佳片', icon: '💎', badge: 'HIDDEN GEMS', tag: '冷门佳片' },
];

export default function MovieClient() {
  return (
    <Suspense fallback={<CategoryHubSkeleton channelKey="movie" categoryTitle="电影大厅" activeNav="movie" />}>
      <CategoryHub
        categoryTitle="电影大厅"
        categorySubtitle="全球 4K 院线巨制 · 豆瓣高分神作 · 经典华语佳片"
        doubanType="movie"
        activeNav="movie"
        shelves={SHELVES}
        defaultTag="热门"
        heroItems={PREBAKED_HOME_DATA.movie.hero}
        trendingNav={PREBAKED_HOME_DATA.movie.trendingNav}
      />
    </Suspense>
  );
}
