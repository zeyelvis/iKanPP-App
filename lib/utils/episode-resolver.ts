/**
 * 智能集数解析器 (Intelligent Episode Resolver)
 * 解决 1-based (自然集数序号) 与 0-based (数组下标) 的错位问题，
 * 以及剧集列表中含有预告片、特别篇或不同资源站命名风格造成的偏差。
 */

export interface EpisodeLike {
  name?: string;
  url?: string;
}

/**
 * 智能提取切片名称中的正片集数编号
 * 过滤花絮、预告、特别篇等非正片切片
 */
const CHINESE_NUM_MAP: Record<string, number> = {
  '一': 1, '二': 2, '两': 2, '三': 3, '四': 4, '五': 5,
  '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
  '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15,
};

/**
 * 清洗第三方采集站切片名称中的内部转码序列号、工单号等垃圾前缀
 * 例如："0001 · 第 1 季 第 1 集" ➔ "第 1 季 第 1 集"
 *       "0151 · 第 1 季 第 151 集" ➔ "第 1 季 第 151 集"
 *       "0001-第1集" ➔ "第1集"
 *       "0001. 第1集" ➔ "第1集"
 *       "0001 第1集" ➔ "第1集"
 */
export function cleanEpisodeName(rawName?: string): string {
  if (!rawName) return '';
  let clean = rawName.trim();

  // 匹配前缀：3~4位数字紧随分隔符（点、中圆点、短横线、下划线、空格等）且后面跟随其他有效文本
  const prefixMatch = clean.match(/^(\d{3,4})\s*[·・\-_\.\s]\s*(.+)$/);
  if (prefixMatch && prefixMatch[2]) {
    clean = prefixMatch[2].trim();
  }
  return clean || rawName.trim();
}

/**
 * 针对网格胶囊按钮（宽度有限，70~90px）智能格式化剧集标签
 * 优先展示纯数字编号（如 151、152），特辑/预告展示紧凑文本
 */
export function formatEpisodeGridLabel(name?: string, index: number = 0): string {
  if (!name) return String(index + 1);

  const clean = cleanEpisodeName(name);

  // 1. 尝试提取正片集数
  const epNum = extractEpisodeNumber(clean);
  if (epNum !== null && epNum > 0) {
    return String(epNum);
  }

  // 2. 特别篇 / 预告 / 花絮等非纯数字剧集
  // 精简冗余字词，确保在胶囊内不溢出
  let compact = clean
    .replace(/\s+/g, '')
    .replace(/^第/, '')
    .replace(/集$/, '');

  if (compact.length > 5) {
    compact = compact.slice(0, 4) + '..';
  }

  return compact || String(index + 1);
}

/**
 * 智能提取切片名称中的季数编号与正片集数编号
 * 例如：'第 1 季 第 2 集' ➔ { seasonNumber: 1, episodeNumber: 2 }
 *       '第 2 季 第 1 集 范闲死讯传遍全城' ➔ { seasonNumber: 2, episodeNumber: 1 }
 *       'S02E05' ➔ { seasonNumber: 2, episodeNumber: 5 }
 *       '第 15 集' ➔ { seasonNumber: null, episodeNumber: 15 }
 */
export function extractSeasonAndEpisodeNumber(name?: string): { seasonNumber: number | null; episodeNumber: number | null } {
  if (!name) return { seasonNumber: null, episodeNumber: null };
  const clean = cleanEpisodeName(name);
  if (/(?:预告|花絮|PV|特辑|采访|彩蛋)/i.test(clean)) return { seasonNumber: null, episodeNumber: null };

  let seasonNumber: number | null = null;

  // 1. 尝试提取中文季数（如 '第 1 季 ', '第二季', '第 2 部'）
  const sMatch1 = clean.match(/(?:第\s*([0-9一二两三四五六七八九十]+)\s*(?:季|部))/i);
  if (sMatch1) {
    const rawVal = sMatch1[1].trim();
    if (/^\d+$/.test(rawVal)) {
      seasonNumber = parseInt(rawVal, 10);
    } else if (CHINESE_NUM_MAP[rawVal]) {
      seasonNumber = CHINESE_NUM_MAP[rawVal];
    }
  }

  // 2. 尝试提取英文季数（如 'Season 2', 'S02', 'S2'）
  if (seasonNumber === null) {
    const sMatch2 = clean.match(/(?:season\s*(\d+)|s(\d+))/i);
    if (sMatch2) {
      const rawVal = sMatch2[1] || sMatch2[2];
      const num = parseInt(rawVal, 10);
      if (num > 0 && num <= 30) {
        seasonNumber = num;
      }
    }
  }

  // 3. 剥离季数前缀，精准提取集数编号
  const epNum = extractEpisodeNumber(clean);

  return { seasonNumber, episodeNumber: epNum };
}

/**
 * 智能提取切片名称中的正片集数编号
 * 过滤花絮、预告、特别篇等非正片切片
 */
export function extractEpisodeNumber(name?: string): number | null {
  if (!name) return null;
  const clean = cleanEpisodeName(name);
  if (/(?:预告|花絮|PV|特辑|采访|彩蛋)/i.test(clean)) return null;

  // 1. 先彻底剔除季数前缀（如 '第 1 季 ', 'Season 2', 'S01'），防止 '第 1 季 第 189 集' 误将季数 '1' 识别为集数
  const withoutSeason = clean
    .replace(/(?:第\s*[0-9一二两三四五六七八九十]+\s*[季部]|season\s*\d+|s\d+)/gi, '')
    .trim();

  // 2. 强匹配：明确带有 '集'、'话'、'期' 的集数（如 '第 189 集', '第191话', '189集', 'EP 12期'）
  const m1 = withoutSeason.match(/(?:第|ep)?\s*(\d+)\s*(?:集|话|期)/i);
  if (m1) {
    const num = parseInt(m1[1], 10);
    if (num > 0 && num < 2500) return num;
  }

  // 3. 匹配明确的 EP/E/第 + 数字（如 'EP189', 'E05', '第189', 'EP.189'）
  const m2 = withoutSeason.match(/(?:ep\.?|e\.?|第)\s*(\d+)/i);
  if (m2) {
    const num = parseInt(m2[1], 10);
    if (num > 0 && num < 2500) return num;
  }

  // 4. 匹配以数字开头的集数（如 '189', '189 完结', '01'，排除4位数年份）
  const m3 = withoutSeason.match(/^(\d+)(?:\s|$|[-_:：])/);
  if (m3) {
    const num = parseInt(m3[1], 10);
    if (num > 0 && num < 2500 && num !== 1900 && num !== 2023 && num !== 2024 && num !== 2025 && num !== 2026) return num;
  }

  // 5. 兜底匹配纯数字
  if (/^\d+$/.test(withoutSeason)) {
    const num = parseInt(withoutSeason, 10);
    if (num > 0 && num < 2500) return num;
  }

  return null;
}

/**
 * 将传入的集数参数（URL 中的 episode / ep 参数及可选的 season 参数）精准映射为 episodes 数组的合法下标
 * 
 * @param episodes 剧集对象数组
 * @param episodeParam URL 中提取的 episode 参数（如 "157", "1", "0", "虚天战纪下"）
 * @param defaultIndex 无法匹配时的保底下标（通常为 0）
 * @param seasonParam 可选的 season 参数（如 "2", 2），用于多季合并条目中精准定位特定季
 * @returns 合法的剧集数组下标 index
 */
export function resolveEpisodeIndex(
  episodes: EpisodeLike[] | null | undefined,
  episodeParam: string | number | null | undefined,
  defaultIndex: number = 0,
  seasonParam?: string | number | null | undefined
): number {
  if (!episodes || episodes.length === 0) return 0;

  const validDefault = (defaultIndex >= 0 && defaultIndex < episodes.length) ? defaultIndex : 0;

  if (episodeParam === null || episodeParam === undefined || episodeParam === '') {
    return validDefault;
  }

  const str = String(episodeParam).trim();
  const num = parseInt(str, 10);
  const targetSeason = (seasonParam !== null && seasonParam !== undefined && seasonParam !== '')
    ? parseInt(String(seasonParam).trim(), 10)
    : null;

  // 1. 若为非纯数字（如特别篇/番外名称 "虚天战纪下"），按名称精确或模糊匹配
  if (isNaN(num)) {
    const specialIdx = episodes.findIndex((ep) => {
      if (!ep || !ep.name) return false;
      const n = ep.name.trim();
      return n === str || n.includes(str) || str.includes(n);
    });
    if (specialIdx !== -1) {
      return specialIdx;
    }
    return validDefault;
  }

  // 2. 季数 + 集数双维精确匹配（针对巨量资源等多季合并在同一 vod 条目下的连续剧/动漫）
  if (targetSeason && !isNaN(targetSeason) && targetSeason > 0) {
    const seasonAndEpIdx = episodes.findIndex((ep) => {
      if (!ep || !ep.name) return false;
      const parsed = extractSeasonAndEpisodeNumber(ep.name);
      return parsed.seasonNumber === targetSeason && parsed.episodeNumber === num;
    });
    if (seasonAndEpIdx !== -1) {
      return seasonAndEpIdx;
    }
  }

  // 3. 优先根据正片集数名称智能反查
  // 若存在多个同名/同集数切片（多季合并），根据当前播放所在位置（defaultIndex）优先匹配同一季或最近的切片
  const candidateIndices: number[] = [];
  episodes.forEach((ep, idx) => {
    if (!ep || !ep.name) return;
    const epNum = extractEpisodeNumber(ep.name);
    if (epNum === num) {
      candidateIndices.push(idx);
    }
  });

  if (candidateIndices.length === 1) {
    return candidateIndices[0];
  } else if (candidateIndices.length > 1) {
    // 多个切片均符合（例如第 1 季第 1 集与第 2 季第 1 集），寻找距当前 defaultIndex 最近的候选
    candidateIndices.sort((a, b) => Math.abs(a - defaultIndex) - Math.abs(b - defaultIndex));
    return candidateIndices[0];
  }

  // 4. 针对 0 的特殊处理：明确传入 0 时作为 0-based 第一集
  if (num === 0) {
    return 0;
  }

  // 5. 自然集数常规转换：传入 num 视为 1-based 集数（例如 1 -> index 0, 157 -> index 156）
  const oneBasedIndex = num - 1;
  if (oneBasedIndex >= 0 && oneBasedIndex < episodes.length) {
    return oneBasedIndex;
  }

  // 6. 超出上限保护：平滑定格在当前源的最新一集（episodes.length - 1），绝对不能回退到第 1 集！
  if (num >= episodes.length) {
    return episodes.length - 1;
  }

  return validDefault;
}

/**
 * 标准集数与番外展示信息接口
 */
export interface EpisodeDisplayInfo {
  /**
   * 用于 UI 界面展示的文本，如 "第 156 集" 或特别篇名称 "虚天战纪上"
   */
  label: string;
  /**
   * 传递给播放器路由 (/player?episode=...) 的标准参数，如 "156" 或 "虚天战纪上"
   */
  paramValue: string;
  /**
   * 提取出的真实正片集数（如 156），若为番外篇则为 null
   */
  episodeNumber: number | null;
  /**
   * 提取出的季数编号（如 2），若无季数则为 null 或 undefined
   */
  seasonNumber?: number | null;
  /**
   * 是否为番外篇 / 特别篇
   */
  isSpecial: boolean;
}

/**
 * 全局统一：根据剧集列表和切片下标，智能生成集数显示文案与播放路由参数
 */
export function getEpisodeDisplayInfo(
  episodes?: EpisodeLike[] | null,
  episodeIndex?: number | null
): EpisodeDisplayInfo {
  const safeIndex = typeof episodeIndex === 'number' && episodeIndex >= 0 ? episodeIndex : 0;
  const currentEp = episodes && episodes.length > safeIndex ? episodes[safeIndex] : null;

  if (currentEp?.name) {
    const { seasonNumber, episodeNumber } = extractSeasonAndEpisodeNumber(currentEp.name);
    if (episodeNumber !== null) {
      const seasonPrefix = seasonNumber ? `第 ${seasonNumber} 季 ` : '';
      return {
        label: `${seasonPrefix}第 ${episodeNumber} 集`,
        paramValue: String(episodeNumber),
        episodeNumber,
        seasonNumber,
        isSpecial: false,
      };
    }
    // 非正片纯集数（如特别篇、番外、PV、剧场版等）
    const cleanName = cleanEpisodeName(currentEp.name);
    return {
      label: cleanName,
      paramValue: cleanName,
      episodeNumber: null,
      seasonNumber: null,
      isSpecial: true,
    };
  }

  // 兜底（当 episodes 数组未提供或越界时，按 1-based 下标退化展示）
  const fallbackNum = safeIndex + 1;
  return {
    label: `第 ${fallbackNum} 集`,
    paramValue: String(fallbackNum),
    episodeNumber: fallbackNum,
    seasonNumber: null,
    isSpecial: false,
  };
}
