/**
 * 全站预烘焙影视条目统一类型契约 (Single Source of Truth)
 * 供所有离线预热脚本、采集同步脚本与前端展示组件共用
 * 严禁任何脚本在模板字符串中重复手写此接口定义！
 */

export interface LatestPrebakedItem {
  entityId: string;
  tmdbId?: string;
  title: string;
  slug: string;
  cover: string;
  backdrop: string;
  rate: string;
  year: string;
  type: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string;
  channelKey: 'all' | 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string;
  genres: string[];
  updateBadge: string;
  platformBadge?: string;
  qualityBadge?: string;
  directors?: string[];
  actors?: string[];
  description?: string;
  createdAt: string;
}

/** 首页与各频道的轮播、榜单、货架里的一张卡片（D1 documents 的 home:<频道>）。 */
export interface PrebakedSubject {
  id: string;
  tmdbId?: string;
  title: string;
  rate: string;
  cover: string;
  backdrop?: string;
  description?: string;
  year?: string;
  is_new?: boolean;
  playable?: boolean;
  episodes_info?: string;
  type?: string;
  types?: string[];
  directors?: string[];
  actors?: string[];
  tagline?: string;
}

/** 频道热播标签（对齐爱壹帆，AGENTS 准则 6）。 */
export interface TrendingNavItem {
  title: string;
  updateBadge?: string;
  url?: string;
  type?: string;
}

/** 一个频道的首屏数据：轮播、榜单、四个货架、热播标签。 */
export interface PrebakedHomeCategory {
  hero: PrebakedSubject[];
  top10: PrebakedSubject[];
  s1: PrebakedSubject[];
  s2: PrebakedSubject[];
  s3: PrebakedSubject[];
  s4: PrebakedSubject[];
  trendingNav?: TrendingNavItem[];
}

/** 频道大厅货架卡片（D1 documents 的 category:<频道>）。 */
export interface PrebakedCategoryItem {
  id: string;
  title: string;
  rate: string;
  cover: string;
  year?: string;
  types?: string[];
  is_new?: boolean;
  remarks?: string;
  play_url?: string;
}

export type HomeChannel = 'all' | 'movie' | 'tv' | 'anime' | 'variety' | 'short' | 'documentary';
