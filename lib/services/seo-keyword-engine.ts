/**
 * iKanPP 实体优先现代白帽 SEO 关键词意图引擎 (SEO Keyword Engine)
 * 
 * 严格依据 docs/seo/ikanpp_seo_keyword_system.yaml 规范实现：
 * 1. 核心战略：Entity-First（1 个影视实体 = 1 个权威 URL，绝不建重复空页面）
 * 2. 意图簇归纳：按【观影意图】、【免费意图】、【画质4K】、【更新连载】、【完结全集】、【评价口碑】分层归类
 * 3. 动态优先级判定：
 *    - Priority A: 处于 GSC 第 4~20 位的高潜词、当季爆款、有真实点击的影视
 *    - Priority B: 实体 + 观影意图 (如 "片名 线上看"、"片名 完整版")
 *    - Priority C: 剧情、演员表、导演、结局等语义辅助词
 *    - Priority D: 低频组合
 */

export interface KeywordIntentCluster {
  entityTitle: string;
  entityType: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | 'short-drama';
  primaryTargetUrl: string;
  priority: 'A' | 'B' | 'C' | 'D';
  watchKeywords: string[];     // 观影意图词: "线上看", "在线观看", "在线播放"
  freeKeywords: string[];      // 免费意图词: "免费观看", "免费在线观看"
  qualityKeywords: string[];   // 画质词: "4K", "1080P", "高清"
  completionKeywords: string[];// 完结词: "完整版", "全集", "大结局"
  freshnessKeywords: string[]; // 更新词: "最新更新", "更新到第几集"
  informationalKeywords: string[]; // 剧情/演员: "剧情介绍", "演员表", "结局"
  recommendedFaqQueries: string[]; // 推荐喂给 AI 转化为精准 FAQ 胶囊的问题种子
}

// 核心修饰词家族 (Modifier Intents)
export const MODIFIER_GROUPS = {
  watch: ['线上看', '在线观看', '在线播放', '在线看'],
  free: ['免费观看', '免费在线观看', '免费看'],
  quality: ['4K超清', '1080P', '高清完整版'],
  completion: ['完整版', '全集', '未删减版', '大结局'],
  freshness: ['最新更新', '更新至最新集'],
  informational: ['剧情介绍', '演员表', '结局怎么样', '豆瓣评分'],
};

/**
 * 为指定影视作品自动构建关键词意图簇 (Keyword Clustering)
 */
export function buildKeywordClusterForEntity(params: {
  title: string;
  type?: string;
  year?: string | number;
  qualityBadge?: string;
  updateBadge?: string;
  gscPosition?: number;
  gscImpressions?: number;
  gscClicks?: number;
  isTrending?: boolean;
}): KeywordIntentCluster {
  const { title, type = 'movie', year, gscPosition, gscImpressions, gscClicks, isTrending } = params;

  // 1. 计算动态优先级 (Priority Rule)
  let priority: 'A' | 'B' | 'C' | 'D' = 'B';
  if (
    (gscPosition && gscPosition >= 4 && gscPosition <= 20) ||
    (gscClicks && gscClicks > 0) ||
    (gscImpressions && gscImpressions > 50) ||
    isTrending
  ) {
    priority = 'A';
  }

  const isTvType = type === 'tv' || type === 'anime' || type === 'short-drama';

  // 2. 派生意图搜索词
  const watchKeywords = [
    `${title} 线上看`,
    `${title} 在线观看`,
    `${title} 在线看`,
  ];

  const freeKeywords = [
    `${title} 免费观看`,
    `${title} 免费在线观看`,
  ];

  const qualityKeywords = [
    `${title} 4K超清`,
    `${title} 1080P免翻墙`,
  ];

  const completionKeywords = isTvType
    ? [`${title} 全集`, `${title} 完整版`, `${title} 大结局`]
    : [`${title} 完整版`, `${title} 未删减版`];

  const freshnessKeywords = isTvType
    ? [`${title} 最新一集`, `${title} 更新到第几集`]
    : [`${title} 最新上映`];

  const informationalKeywords = [
    `${title} 剧情介绍`,
    `${title} 演员表`,
    `${title} 结局`,
  ];

  // 3. 派生专属 AI FAQ 种子问题（直接用于命中 Google 首屏下拉折叠问答）
  const recommendedFaqQueries = [
    `海外如何免翻墙《${title}》线上看完整版？`,
    `《${title}》可以在哪里免费在线观看 4K 超清画质？`,
    isTvType ? `《${title}》全集更新进度如何？` : `《${title}》剧情主要讲了什么？有哪些看点？`,
    `iKanPP 观看《${title}》需要会员充值或看弹窗广告吗？`,
  ];

  return {
    entityTitle: title,
    entityType: (type as any) || 'movie',
    primaryTargetUrl: `https://www.ikanpp.com/title/${encodeURIComponent(title)}`,
    priority,
    watchKeywords,
    freeKeywords,
    qualityKeywords,
    completionKeywords,
    freshnessKeywords,
    informationalKeywords,
    recommendedFaqQueries,
  };
}
