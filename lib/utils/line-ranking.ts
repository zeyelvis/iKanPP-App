/**
 * 地区自适应线路排序算法 (Regional Line Ranking Engine)
 * 
 * 核心机制：
 * 1. 平滑成功率模型：rate = (ok + 10 * base) / (ok + fail + 10)
 * 2. 赌博与低俗片头广告线路扣分 (-0.15)
 * 3. 0.14 防抖超车门槛：只有得分高出前面线路 0.14 以上才换序，杜绝单次抖动频繁换序
 * 4. 纯地区限制线路降权 (0.1)
 */

export interface LineStats {
  ok: number;
  fail: number;
}

// 带片头赌博/低俗跑马灯广告的传统采集线路
export const AD_PRONE_SOURCES = new Set([
  'guangsu',
  'guangsu_http',
  'wujin',
  'wujin_me',
  'wujin_cc',
  'wujin_net',
  'juliang',
  'feifan',
  'feifan_api',
  'feifan1',
  'zuida',
  'zuida_db',
  'wolong',
  'wolong_cj',
]);

// 仅对中国大陆地区开放/在海外大概率受阻的线路（在海外通常返回 403/404）
export const CN_ONLY_SOURCES = new Set(['baofeng', 'dytt', 'json1080', 'youku']);

// 默认基准排序权重 (兜底顺序)
export const DEFAULT_LINE_TOP_ORDER: string[] = [
  'shadowline',
  'juliang',
  'guangsu',
  'wujin',
  'zuida',
  'jisu',
  'baofeng',
  'hongniu',
  'suoni',
  'feifan',
  'wolong',
  'dytt',
  'kuaiche',
];

/**
 * 计算单条线路在特定地区的综合评分
 */
export function computeLineScore(
  sourceId: string,
  countryStats: Record<string, LineStats> = {},
  globalStats: Record<string, LineStats> = {},
  country: string = 'XX'
): number {
  let score: number;

  if (CN_ONLY_SOURCES.has(sourceId)) {
    if (country !== 'CN') {
      // 1a. 在大陆以外：若在该国没有数据，初始分数取 0.1；若有数据，以 0.1 为弱基准平滑计算
      const c = countryStats[sourceId];
      if (c && (c.ok > 0 || c.fail > 0)) {
        score = (c.ok + 10 * 0.1) / (c.ok + c.fail + 10);
      } else {
        score = 0.1;
      }
    } else {
      // 1b. 在大陆 (CN)：按普通线路计算，但不借用全球汇总分数（全球数据把大陆内外混在一起）
      const cnBase = 0.8;
      const c = countryStats[sourceId];
      if (c && (c.ok > 0 || c.fail > 0)) {
        score = (c.ok + 10 * cnBase) / (c.ok + c.fail + 10);
      } else {
        score = cnBase;
      }
    }
  } else {
    // 2. 普通全域线路：计算全球平滑基准 base
    let globalBase = 0.8;
    const g = globalStats[sourceId];
    if (g && (g.ok > 0 || g.fail > 0)) {
      globalBase = (g.ok + 10 * 0.8) / (g.ok + g.fail + 10);
    }

    // 计算国家平滑成功率
    score = globalBase;
    const c = countryStats[sourceId];
    if (c && (c.ok > 0 || c.fail > 0)) {
      score = (c.ok + 10 * globalBase) / (c.ok + c.fail + 10);
    }
  }

  // 3. 赌博广告片头扣分 (-0.15)
  if (AD_PRONE_SOURCES.has(sourceId)) {
    score -= 0.15;
  }

  return score;
}

/**
 * 依据地区质量学习数据对候选线路执行稳定超车排序
 */
export function rankSourcesByPerformance<T extends { source?: string; id?: string | number }>(
  sources: T[],
  countryStats: Record<string, LineStats> = {},
  globalStats: Record<string, LineStats> = {},
  country: string = 'XX',
  fallbackOrder: string[] = DEFAULT_LINE_TOP_ORDER
): T[] {
  if (!sources || sources.length <= 1) return sources || [];

  // 1. 先按 fallbackOrder 进行基础优先级排列
  const result = [...sources];
  result.sort((a, b) => {
    const sA = String(a.source || a.id || '');
    const sB = String(b.source || b.id || '');
    const idxA = fallbackOrder.indexOf(sA);
    const idxB = fallbackOrder.indexOf(sB);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return 0;
  });

  const scoreMap = new Map<string, number>();
  const getScore = (src: string) => {
    if (!scoreMap.has(src)) {
      scoreMap.set(src, computeLineScore(src, countryStats, globalStats, country));
    }
    return scoreMap.get(src)!;
  };

  // 2. 使用插入排序算法执行防抖超车
  // 铁律：只有当分数比排在它前面的线路高出 0.14 以上时才允许超车
  for (let i = 1; i < result.length; i++) {
    let j = i;
    while (j > 0) {
      const curSource = String(result[j].source || result[j].id || '');
      const prevSource = String(result[j - 1].source || result[j - 1].id || '');
      const curScore = getScore(curSource);
      const prevScore = getScore(prevSource);

      if (curScore - prevScore > 0.14) {
        const temp = result[j];
        result[j] = result[j - 1];
        result[j - 1] = temp;
        j--;
      } else {
        break;
      }
    }
  }

  return result;
}
