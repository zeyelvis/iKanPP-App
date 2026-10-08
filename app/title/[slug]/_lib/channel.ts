/**
 * 作品所属频道（面包屑、页面标题里的「电影 / 电视剧 / 动漫 / 综艺 / 纪录片」）。
 * 从原 resolve-entity.ts 原样移出：页面标题格式不能变。
 */
import type { TitleEntity } from '@/lib/types/entity';
import { normalizeVideoType } from '@/lib/utils/taxonomy';

export function resolveEntityChannel(entity: TitleEntity): { category: string; path: string; name: string } {
  // 1. entity.type 已经是 'anime' 的直接命中
  if (entity.type === 'anime') {
    return { category: 'anime', path: '/anime', name: '动漫' };
  }

  // 2. 通过 genres 中的标签进行多维度匹配
  const genres = entity.genres || [];
  const genreStr = genres.join(',');

  // 动漫关键词识别（覆盖国漫、日漫、新番等所有变体）
  const animeKeywords = ['动漫', '动画', '国漫', '国创', '日漫', '新番', '番剧', '修仙', 'Animation'];
  if (animeKeywords.some(kw => genreStr.includes(kw))) {
    return { category: 'anime', path: '/anime', name: '动漫' };
  }

  // 利用 taxonomy 归一化引擎对每个 genre 做深度识别
  for (const g of genres) {
    const norm = normalizeVideoType(g, entity.title);
    if (norm.category === 'anime') {
      return { category: 'anime', path: '/anime', name: '动漫' };
    }
    if (norm.category === 'documentary') {
      return { category: 'documentary', path: '/documentary', name: '纪录片' };
    }
    if (norm.category === 'variety') {
      return { category: 'variety', path: '/variety', name: '综艺' };
    }
  }

  // 3. 标准 movie / tv 回退
  if (entity.type === 'tv') {
    return { category: 'tv', path: '/tv', name: '电视剧' };
  }

  return { category: 'movie', path: '/movie', name: '电影' };
}
