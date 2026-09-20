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
  createdAt: string;
}
