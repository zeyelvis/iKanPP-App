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
 * 将传入的集数参数（URL 中的 episode / ep 参数）精准映射为 episodes 数组的合法下标
 * 
 * @param episodes 剧集对象数组
 * @param episodeParam URL 中提取的 episode 参数（如 "157", "1", "0"）
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

  if (isNaN(num)) {
    return validDefault;
  }

  // 1. 优先根据集数名称智能反查（最精准，彻底消除 0-based/1-based 和前置预告片的偏差）
  // 能够识别 "第157集", "第157话", "157", "EP157", "157集", "第 157 集" 等
  const matchIndex = episodes.findIndex((ep) => {
    if (!ep || !ep.name) return false;
    const name = ep.name.trim();
    
    // 正则提取首个匹配的集数编号
    const m = name.match(/(?:第|ep)?\s*(\d+)\s*(?:集|话)?/i) || name.match(/\b(\d+)\b/);
    if (m) {
      const epNum = parseInt(m[1], 10);
      return epNum === num;
    }
    return false;
  });

  if (matchIndex !== -1) {
    return matchIndex;
  }

  // 2. 针对 0 的特殊处理：明确传入 0 时作为 0-based 第一集
  if (num === 0) {
    return 0;
  }

  // 3. 自然集数常规转换：传入 num 视为 1-based 集数（例如 1 -> index 0, 157 -> index 156）
  const oneBasedIndex = num - 1;
  if (oneBasedIndex >= 0 && oneBasedIndex < episodes.length) {
    return oneBasedIndex;
  }

  // 4. 超出上限保护（例如 TMDB 显示 158 集，但片源最新只更新到了 157 集，用户在详情页点击了 158）：
  // 必须平滑定格在当前源的最新一集（episodes.length - 1），绝对不能回退到第 1 集！
  if (num >= episodes.length) {
    return episodes.length - 1;
  }

  return validDefault;
}
