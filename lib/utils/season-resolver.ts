/**
 * 智能季数解析器 (Season Resolver)
 * 解决影视剧与动漫在爱壹帆、TMDB 与各公网采集站之间因：
 * “中文数字/阿拉伯数字”（如“第3季”vs“第三季”）、
 * “全角半角空格”（如“第 3 季”vs“第三季”）、
 * “英文标示”（如“Season 3”vs“S3”）
 * 导致的字符孤岛阻断与切片脱靶问题。
 */

const CHINESE_TO_NUM: Record<string, number> = {
  '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
};

const NUM_TO_CHINESE: Record<number, string> = {
  1: '一', 2: '二', 3: '三', 4: '四', 5: '五',
  6: '六', 7: '七', 8: '八', 9: '九', 10: '十',
  11: '十一', 12: '十二', 13: '十三', 14: '十四', 15: '十五',
};

export interface ParsedSeasonInfo {
  /** 纯净的核心母标题，如 "时光代理人" */
  baseTitle: string;
  /** 季数数字，如 3 */
  seasonNumber: number;
  /** 原始季数文本，如 "第3季" */
  rawSeasonMatch: string;
}

/**
 * 从片名中智能提取季数与母标题
 * 例如："时光代理人第3季" ➔ { baseTitle: "时光代理人", seasonNumber: 3, rawSeasonMatch: "第3季" }
 *       "时光代理人 第三季" ➔ { baseTitle: "时光代理人", seasonNumber: 3, rawSeasonMatch: "第三季" }
 *       "死神：千年血战篇第4季" ➔ { baseTitle: "死神：千年血战篇", seasonNumber: 4, rawSeasonMatch: "第4季" }
 */
export function parseSeasonFromTitle(title?: string | null): ParsedSeasonInfo | null {
  if (!title || typeof title !== 'string') return null;
  const clean = title.trim();

  // 1. 匹配中文或阿拉伯数字季数：第3季、第三季、第3部、第三部
  const m1 = clean.match(/(?:第\s*([0-9一二两三四五六七八九十]+)\s*(?:季|部))/i);
  if (m1) {
    const rawVal = m1[1].trim();
    let num: number | undefined;
    if (/^\d+$/.test(rawVal)) {
      num = parseInt(rawVal, 10);
    } else if (CHINESE_TO_NUM[rawVal]) {
      num = CHINESE_TO_NUM[rawVal];
    }
    if (num && num > 0 && num <= 30) {
      const base = clean.replace(m1[0], '').replace(/[-_:\s]+$/, '').trim();
      return {
        baseTitle: base || clean,
        seasonNumber: num,
        rawSeasonMatch: m1[0].trim(),
      };
    }
  }

  // 2. 匹配英文 Season 3, S3, 3rd Season
  const m2 = clean.match(/(?:season\s*(\d+)|s(\d+)|(\d+)(?:st|nd|rd|th)\s*season)/i);
  if (m2) {
    const rawVal = m2[1] || m2[2] || m2[3];
    const num = parseInt(rawVal, 10);
    if (num > 0 && num <= 30) {
      const base = clean.replace(m2[0], '').replace(/[-_:\s]+$/, '').trim();
      return {
        baseTitle: base || clean,
        seasonNumber: num,
        rawSeasonMatch: m2[0].trim(),
      };
    }
  }

  return null;
}

/**
 * 针对带有季数的片名，生成多维度采集站搜索候选词变体
 *
 * 例如输入 "时光代理人第3季"，生成：
 * 1. "时光代理人第三季"（国内采集站最常用中文标准名）
 * 2. "时光代理人第3季"（爱壹帆原生阿拉伯数字名）
 * 3. "时光代理人 第三季"（带空格变体）
 * 4. "时光代理人 第3季"（带空格变体）
 * 5. "时光代理人"（母标题兜底）
 */
export function generateSeasonSearchVariants(title?: string | null): string[] {
  if (!title || typeof title !== 'string') return [];
  const clean = title.trim();
  const parsed = parseSeasonFromTitle(clean);

  if (!parsed) {
    return [clean];
  }

  const { baseTitle, seasonNumber } = parsed;
  const chineseNum = NUM_TO_CHINESE[seasonNumber];
  const variants: string[] = [];

  // 基础候选标题集：包含原母标题、去除常见连接符号的母标题、以及复合长标题的核心部分
  const candidateBases: string[] = [baseTitle];
  const noSymbolsBase = baseTitle.replace(/[·・\-_:：]/g, '');
  if (noSymbolsBase !== baseTitle) {
    candidateBases.push(noSymbolsBase);
  }

  // 若长标题包含复合 IP 前缀（如 "剑网3侠肝义胆沈剑心"），提取去除 IP 后的核心子标题（"侠肝义胆沈剑心"）
  if (baseTitle.length >= 6) {
    // 匹配如 "剑网3"、"Fate" 等前置 IP
    const prefixMatch = baseTitle.match(/^(?:[\u4e00-\u9fa5]{1,4}\d{1,2}|[a-zA-Z]{2,6}\d{0,2})[·・\-_:：\s]*(.+)$/);
    if (prefixMatch && prefixMatch[1] && prefixMatch[1].length >= 3) {
      candidateBases.push(prefixMatch[1]);
    }
  }

  // 1. 各候选标题的中文标准季名优先（命中率最高，如 "时光代理人第三季"、"侠肝义胆沈剑心第三季"）
  if (chineseNum) {
    for (const b of candidateBases) {
      variants.push(`${b}第${chineseNum}季`);
    }
  }

  // 2. 各候选标题的阿拉伯数字季名
  for (const b of candidateBases) {
    variants.push(`${b}第${seasonNumber}季`);
  }

  // 3. 带空格与部数等变体
  if (chineseNum) {
    for (const b of candidateBases) {
      variants.push(`${b} 第${chineseNum}季`);
      variants.push(`${b}第${chineseNum}部`);
    }
  }

  for (const b of candidateBases) {
    variants.push(`${b} 第${seasonNumber}季`);
    variants.push(`${b} Season ${seasonNumber}`);
    variants.push(b);
  }

  // 去重保序
  const seen = new Set<string>();
  const result: string[] = [];
  for (const v of variants) {
    const trimmed = v.trim();
    if (trimmed && !seen.has(trimmed)) {
      seen.add(trimmed);
      result.push(trimmed);
    }
  }

  return result;
}

/**
 * 校验采集站条目名称是否匹配目标季数
 */
export function matchesTargetSeason(vodName: string, targetSeason: number): boolean {
  if (!vodName) return false;
  const parsed = parseSeasonFromTitle(vodName);
  if (!parsed) {
    // 若条目名未显式标注季数，仅当目标季为第 1 季时视为匹配
    return targetSeason === 1;
  }
  return parsed.seasonNumber === targetSeason;
}
