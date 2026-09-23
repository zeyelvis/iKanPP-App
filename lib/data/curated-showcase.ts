/**
 * 官方策展 · 殿堂片单与深度意图专题超级聚合数据服务
 * 
 * 融合：
 * 1. CURATED_COLLECTIONS (14 大殿堂级精选片单，深入12~16部经典)
 * 2. PREBAKED_TOPICS (20 大口语化长尾高频意图专栏，覆盖精准搜索)
 * 
 * 0ms 纯静态融合，双轨路由无损传递
 */

import { CURATED_COLLECTIONS } from '@/lib/data/collections-prebaked';
import { PREBAKED_TOPICS } from '@/lib/data/prebaked-topics';

export interface CuratedShowcaseItem {
  id: string;
  slug: string;
  type: 'collection' | 'topic';
  title: string;
  category: string;
  badge: string;
  quote: string;
  totalCount: number;
  posters: string[];
  href: string;
}

export const SHOWCASE_CATEGORIES = [
  '全部',
  '豆瓣殿堂',
  '悬疑反转',
  '温情治愈',
  '硬核科幻',
  '经典喜剧',
  '权谋历史',
  '华语经典',
] as const;

export type ShowcaseCategory = typeof SHOWCASE_CATEGORIES[number];

function getCategoryForCollection(slug: string): string {
  if (slug.includes('suspense') || slug.includes('crime')) return '悬疑反转';
  if (slug.includes('scifi') || slug.includes('nolan')) return '硬核科幻';
  if (slug.includes('healing') || slug.includes('ghibli')) return '温情治愈';
  if (slug.includes('comedy')) return '经典喜剧';
  if (slug.includes('hk-golden') || slug.includes('xianxia') || slug.includes('post90s')) return '华语经典';
  return '豆瓣殿堂';
}

function getCategoryForTopic(fam: string): string {
  if (fam.includes('悬疑') || fam.includes('推理')) return '悬疑反转';
  if (fam.includes('科幻') || fam.includes('时空')) return '硬核科幻';
  if (fam.includes('治愈') || fam.includes('温情') || fam.includes('成长')) return '温情治愈';
  if (fam.includes('喜剧') || fam.includes('笑')) return '经典喜剧';
  if (fam.includes('权谋') || fam.includes('历史') || fam.includes('王朝') || fam.includes('谍战')) return '权谋历史';
  if (fam.includes('江湖') || fam.includes('警匪') || fam.includes('犯罪') || fam.includes('传奇')) return '华语经典';
  return '豆瓣殿堂';
}

// 统一融合全量精选策展库（片单与意图专题交叉排布）
export const CURATED_SHOWCASE_ITEMS: CuratedShowcaseItem[] = [
  // 1. 殿堂片单
  ...CURATED_COLLECTIONS.map((col): CuratedShowcaseItem => ({
    id: `col_${col.slug}`,
    slug: col.slug,
    type: 'collection',
    title: col.title,
    category: getCategoryForCollection(col.slug),
    badge: col.subtitle ? col.subtitle.slice(0, 16) : '官方精选片单',
    quote: col.description ? col.description.slice(0, 56) + '…' : '影史公认殿堂级口碑佳作精选。',
    totalCount: col.totalCount || col.films.length,
    posters: col.coverPosters.slice(0, 3),
    href: `/collection/${col.slug}`,
  })),

  // 2. 长尾意图深度专题
  ...Object.values(PREBAKED_TOPICS).map((topic): CuratedShowcaseItem => ({
    id: `topic_${topic.slug}`,
    slug: topic.slug,
    type: 'topic',
    title: topic.topicTitle,
    category: getCategoryForTopic(topic.intentFamily || ''),
    badge: topic.intentFamily || '深度意图策展',
    quote: topic.curatorNote ? topic.curatorNote.replace(/\s+/g, ' ').slice(0, 56) + '…' : '深度精选豆瓣高分神作，全网首发极速秒播。',
    totalCount: topic.titles.length,
    posters: topic.titles.slice(0, 3).map(t => t.cover).filter(Boolean) as string[],
    href: `/topic/${topic.slug}`,
  })),
];
