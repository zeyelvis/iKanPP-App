export interface TitleAnalysis {
  rawTitle: string;
  pureTitle: string;
  seasonNumber: number | null;
  subtitles: string[];
}

export function analyzeTitle(titleStr: string): TitleAnalysis {
  const raw = (titleStr || '').trim();

  let seasonNumber: number | null = null;
  const sMatch =
    raw.match(/第([一二三四五六七八九十\d]+)[季部期]/i) ||
    raw.match(/\bseason\s*(\d+)\b/i) ||
    raw.match(/\bS(\d{1,2})\b/i);
  if (sMatch) {
    const sStr = sMatch[1];
    const cnMap: Record<string, number> = {
      一: 1,
      二: 2,
      三: 3,
      四: 4,
      五: 5,
      六: 6,
      七: 7,
      八: 8,
      九: 9,
      十: 10,
    };
    seasonNumber = cnMap[sStr] ?? (parseInt(sStr, 10) || null);
  }

  // 提取冒号、空格、破折号拆解的有效子词（如 "爱情公寓：辣味英雄传" 拆解为 ["爱情公寓", "辣味英雄传"]）
  const subtitles = raw
    .split(/[:：·•\-\s_／/]+/)
    .map((s) => s.replace(/[《》【】\[\]（）()]/g, '').trim().toLowerCase())
    .filter((s) => s.length >= 2);

  const pure = raw
    .replace(/[\(（]?(19\d\d|20\d\d)[\)）]?/g, '')
    .replace(/第[一二三四五六七八九十\d]+[季部期]/gi, '')
    .replace(/season\s*\d+/gi, '')
    .replace(/\bS\d{1,2}\b/gi, '')
    .replace(
      /(前篇|后篇|最终季|终章|完结篇|序章|特别篇|剧场版|番外篇|番外|大电影|电影版|真人版|动画版|重制版|重置版|精选版|典藏版)/gi,
      ''
    )
    .replace(/(国语版|粤语版|双语版|原声版|中字版|纯享版|未删减版|加长版)/gi, '')
    .replace(/[《》【】\[\]（）()·\s:：\-—_]/g, '')
    .replace(/(19\d\d|20\d\d)$/g, '') // 🌟 核心防线：剥离末尾紧随的4位年份
    .toLowerCase()
    .trim();

  return { rawTitle: raw, pureTitle: pure, seasonNumber, subtitles };
}

export function isSeriesTypeName(typeName: string): boolean {
  if (!typeName) return false;
  const tn = typeName.toLowerCase();
  if (tn.endsWith('片') && !tn.includes('纪录片')) return false;
  return (
    tn.includes('连续剧') ||
    tn.includes('电视剧') ||
    tn.includes('动漫') ||
    tn.includes('动画') ||
    (tn.includes('剧') && !tn.includes('剧情') && !tn.includes('喜剧'))
  );
}
