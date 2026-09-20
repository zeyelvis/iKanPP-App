import type { TitleEntity } from '../types/entity.ts';

export type MatchDecision = 'same' | 'different' | 'review';

export interface MatchResult {
  score: number;
  decision: MatchDecision;
  reasons: string[];
}

/**
 * 字符级 Bigram Jaccard 相似度计算
 */
function calculateTextSimilarity(str1?: string, str2?: string): number {
  if (!str1 || !str2) return 0;
  const s1 = str1.trim().toLowerCase().replace(/[\s\p{P}]+/gu, '');
  const s2 = str2.trim().toLowerCase().replace(/[\s\p{P}]+/gu, '');
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;

  // 单字符特判
  if (s1.length === 1 && s2.length === 1) {
    return s1 === s2 ? 1.0 : 0.0;
  }

  const getBigrams = (s: string) => {
    const bigrams = new Set<string>();
    for (let i = 0; i < s.length - 1; i++) {
      bigrams.add(s.slice(i, i + 2));
    }
    return bigrams;
  };

  const bg1 = getBigrams(s1);
  const bg2 = getBigrams(s2);
  if (bg1.size === 0 || bg2.size === 0) {
    return s1 === s2 ? 1.0 : 0.0;
  }

  let intersection = 0;
  for (const b of bg1) {
    if (bg2.has(b)) intersection++;
  }
  const union = bg1.size + bg2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * 数组元素重叠率计算 (Jaccard)
 */
function calculateArrayOverlap(arr1?: string[], arr2?: string[]): number {
  if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0;
  const set1 = new Set(arr1.map(s => s.trim().toLowerCase()).filter(Boolean));
  const set2 = new Set(arr2.map(s => s.trim().toLowerCase()).filter(Boolean));
  if (set1.size === 0 || set2.size === 0) return 0;

  let intersection = 0;
  for (const item of set1) {
    if (set2.has(item)) intersection++;
  }
  const union = set1.size + set2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * 年份相近度计算
 */
function calculateYearSimilarity(yearA?: string, yearB?: string): number {
  if (!yearA || !yearB) return 0.5; // 缺年份给中性分
  const yA = parseInt(yearA, 10);
  const yB = parseInt(yearB, 10);
  if (isNaN(yA) || isNaN(yB)) return 0.5;
  const diff = Math.abs(yA - yB);
  if (diff === 0) return 1.0;
  if (diff === 1) return 0.8;
  if (diff === 2) return 0.4;
  return 0.0; // 相差 3 年以上视为极大可能是不同作品/续集
}

/**
 * 1. 外部权威 ID 强一致核验 (TMDB / Douban)
 */
export function sameVerifiedExternalId(a: Partial<TitleEntity>, b: Partial<TitleEntity>): boolean {
  // TMDB ID 核验
  if (a.tmdbId && b.tmdbId && a.tmdbId !== '0' && a.tmdbId === b.tmdbId) {
    const typeA = a.tmdbType || (a.type === 'movie' ? 'movie' : 'tv');
    const typeB = b.tmdbType || (b.type === 'movie' ? 'movie' : 'tv');
    if (typeA === typeB) return true;
  }
  // 豆瓣 ID 核验
  if (a.doubanId && b.doubanId && a.doubanId !== '0' && a.doubanId === b.doubanId) {
    return true;
  }
  return false;
}

/**
 * 2. 实体解析与多维证据评分决策器 (对应规范 5.1 节)
 */
export function resolveCandidate(a: Partial<TitleEntity>, b: Partial<TitleEntity>): MatchResult {
  const reasons: string[] = [];

  // 1. 外部权威 ID 优先判定
  if (sameVerifiedExternalId(a, b)) {
    return {
      score: 1.0,
      decision: 'same',
      reasons: ['命中权威外部统一标识符 (TMDB/Douban)'],
    };
  }

  // 2. 媒介形态不同（电影 vs 剧集）一票否决
  const typeA = a.type === 'movie' ? 'movie' : 'tv';
  const typeB = b.type === 'movie' ? 'movie' : 'tv';
  if (typeA !== typeB) {
    return {
      score: 0.0,
      decision: 'different',
      reasons: [`媒介形态不同 (一方为${typeA}，另一方为${typeB})`],
    };
  }

  // 3. 各维度加权评分
  const titleScore = calculateTextSimilarity(a.title, b.title);
  const origTitleScore = (a.originalTitle && b.originalTitle)
    ? calculateTextSimilarity(a.originalTitle, b.originalTitle)
    : titleScore; // 缺原名时退避参考主标题
  const yearScore = calculateYearSimilarity(a.year, b.year);
  const directorScore = calculateArrayOverlap(a.directors, b.directors);
  const castScore = calculateArrayOverlap(a.actors, b.actors);

  let runtimeScore = 0.5;
  if (a.runtime && b.runtime) {
    const diff = Math.abs(a.runtime - b.runtime);
    runtimeScore = diff <= 5 ? 1.0 : diff <= 15 ? 0.6 : 0.0;
  }

  // 加权汇总: 35% + 20% + 15% + 15% + 10% + 5% = 100%
  const totalScore = Number((
    titleScore * 0.35 +
    origTitleScore * 0.20 +
    yearScore * 0.15 +
    directorScore * 0.15 +
    castScore * 0.10 +
    runtimeScore * 0.05
  ).toFixed(4));

  reasons.push(`标题相似度: ${(titleScore * 100).toFixed(0)}% (权重 35%)`);
  reasons.push(`原名相似度: ${(origTitleScore * 100).toFixed(0)}% (权重 20%)`);
  reasons.push(`年代相近度: ${(yearScore * 100).toFixed(0)}% (权重 15%)`);
  if (directorScore > 0) reasons.push(`导演重合度: ${(directorScore * 100).toFixed(0)}% (权重 15%)`);
  if (castScore > 0) reasons.push(`主演重合度: ${(castScore * 100).toFixed(0)}% (权重 10%)`);

  // 年代相差 3 年以上，且外部 ID 不一致时，坚决防止续作/同名翻拍误合并
  if (yearScore === 0 && totalScore < 0.92) {
    return {
      score: Math.min(totalScore, 0.5),
      decision: 'different',
      reasons: [...reasons, '年代相差超过 3 年，判定为同名不同作或续集翻拍'],
    };
  }

  // 门槛判定 (规范 5.1 节)
  let decision: MatchDecision = 'review';
  if (totalScore >= 0.88) {
    decision = 'same';
  } else if (totalScore <= 0.55) {
    decision = 'different';
  }

  return {
    score: totalScore,
    decision,
    reasons,
  };
}

/**
 * 3. 确定性 Winner 选择算法 (对应规范 5.2 节)
 * 同一实体的胜出者必须确定、可解释且幂等
 */
export function chooseWinner(candidates: TitleEntity[]): TitleEntity {
  if (candidates.length === 0) {
    throw new Error('chooseWinner: candidates cannot be empty');
  }
  if (candidates.length === 1) {
    return candidates[0];
  }

  const scored = candidates.map(entity => {
    let score = 0;

    // 1. 外部权威 ID 完整度
    if (entity.tmdbId && entity.tmdbId !== '0') score += 500;
    if (entity.doubanId && entity.doubanId !== '0') score += 200;

    // 2. 真实内容质量与完整度
    if (entity.cover) score += 50;
    if (entity.backdrop) score += 50;
    if (entity.description && entity.description.length > 50) score += 80;
    if (entity.directors && entity.directors.length > 0) score += 40;
    if (entity.actors && entity.actors.length > 0) score += 40;
    if (entity.rate && parseFloat(entity.rate) > 0) score += 30;

    // 3. 人气与播放热度指标
    if (entity.hot) score += Math.min(entity.hot / 1000000, 50);
    if (entity.popularity) score += Math.min(entity.popularity, 50);

    // 4. 更早的稳定创建时间优先
    const createdTimestamp = entity.createdAt ? new Date(entity.createdAt).getTime() : Date.now();

    return {
      entity,
      score,
      createdTimestamp,
      entityId: entity.entityId || '',
    };
  });

  // 排序准则：
  // 1. 评分更高者优先
  // 2. 创建时间更早者优先
  // 3. entityId 字典序升序保底（保证重跑 100% 幂等）
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    if (a.createdTimestamp !== b.createdTimestamp) {
      return a.createdTimestamp - b.createdTimestamp;
    }
    return a.entityId.localeCompare(b.entityId);
  });

  return scored[0].entity;
}
