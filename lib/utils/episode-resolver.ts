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
export function extractEpisodeNumber(name?: string): number | null {
  if (!name) return null;
  const clean = name.trim();
  if (/(?:预告|花絮|PV|特辑|采访|彩蛋)/i.test(clean)) return null;

  // 优先匹配：第191集、第191话、EP191、第77集星海飞驰篇
  const m1 = clean.match(/(?:第|ep)\s*(\d+)\s*(?:集|话)?/i);
  if (m1) {
    const num = parseInt(m1[1], 10);
    if (num > 0 && num < 2500) return num;
  }

  // 匹配：191集、191话
  const m2 = clean.match(/^(\d+)\s*(?:集|话)/);
  if (m2) {
    const num = parseInt(m2[1], 10);
    if (num > 0 && num < 2500) return num;
  }

  // 匹配纯数字：191（排除4位数年份）
  if (/^\d+$/.test(clean)) {
    const num = parseInt(clean, 10);
    if (num > 0 && num < 1900) return num;
  }

  return null;
}

/**
 * 将传入的集数参数（URL 中的 episode / ep 参数）精准映射为 episodes 数组的合法下标
 * 
 * @param episodes 剧集对象数组
 * @param episodeParam URL 中提取的 episode 参数（如 "157", "1", "0", "虚天战纪下"）
 * @param defaultIndex 无法匹配时的保底下标（通常为 0）
 * @returns 合法的剧集数组下标 index
 */
export function resolveEpisodeIndex(
  episodes: EpisodeLike[] | null | undefined,
  episodeParam: string | number | null | undefined,
  defaultIndex: number = 0
): number {
  if (!episodes || episodes.length === 0) return 0;

  const validDefault = (defaultIndex >= 0 && defaultIndex < episodes.length) ? defaultIndex : 0;

  if (episodeParam === null || episodeParam === undefined || episodeParam === '') {
    return validDefault;
  }

  const str = String(episodeParam).trim();
  const num = parseInt(str, 10);

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

  // 2. 优先根据正片集数名称智能反查（最精准，彻底消除 0-based/1-based 和中间插入特别篇的偏差）
  // 能够识别 "第157集", "第157话", "157", "EP157", "157集", "第 157 集", "第77集星海飞驰篇" 等
  const matchIndex = episodes.findIndex((ep) => {
    if (!ep || !ep.name) return false;
    const epNum = extractEpisodeNumber(ep.name);
    return epNum === num;
  });

  if (matchIndex !== -1) {
    return matchIndex;
  }

  // 3. 针对 0 的特殊处理：明确传入 0 时作为 0-based 第一集
  if (num === 0) {
    return 0;
  }

  // 4. 自然集数常规转换：传入 num 视为 1-based 集数（例如 1 -> index 0, 157 -> index 156）
  const oneBasedIndex = num - 1;
  if (oneBasedIndex >= 0 && oneBasedIndex < episodes.length) {
    return oneBasedIndex;
  }

  // 5. 超出上限保护（例如 TMDB 显示 158 集，但片源最新只更新到了 157 集，用户在详情页点击了 158）：
  // 必须平滑定格在当前源的最新一集（episodes.length - 1），绝对不能回退到第 1 集！
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
   * 是否为番外篇 / 特别篇
   */
  isSpecial: boolean;
}

/**
 * 全局统一：根据剧集列表和切片下标，智能生成集数显示文案与播放路由参数
 * 
 * 核心设计原则：以切片真实元数据（name / episodeNumber）为第一真值，物理下标仅作为无切片时的兜底。
 * 彻底消除因中间插播特别篇、番外、预告片导致的集数计算错位。
 */
export function getEpisodeDisplayInfo(
  episodes?: EpisodeLike[] | null,
  episodeIndex?: number | null
): EpisodeDisplayInfo {
  const safeIndex = typeof episodeIndex === 'number' && episodeIndex >= 0 ? episodeIndex : 0;
  const currentEp = episodes && episodes.length > safeIndex ? episodes[safeIndex] : null;

  if (currentEp?.name) {
    const epNum = extractEpisodeNumber(currentEp.name);
    if (epNum !== null) {
      return {
        label: `第 ${epNum} 集`,
        paramValue: String(epNum),
        episodeNumber: epNum,
        isSpecial: false,
      };
    }
    // 非正片纯集数（如特别篇、番外、PV、剧场版等）
    const cleanName = currentEp.name.trim();
    return {
      label: cleanName,
      paramValue: cleanName,
      episodeNumber: null,
      isSpecial: true,
    };
  }

  // 兜底（当 episodes 数组未提供或越界时，按 1-based 下标退化展示）
  const fallbackNum = safeIndex + 1;
  return {
    label: `第 ${fallbackNum} 集`,
    paramValue: String(fallbackNum),
    episodeNumber: fallbackNum,
    isSpecial: false,
  };
}
