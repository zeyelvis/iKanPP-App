/**
 * 巨量资源 (Juliang Resources 2.0) 官方全量分类字典与安全过滤策略
 * 接口基地址: https://api.juliang.live/api/provide/vod/
 * 严谨对齐 AppleCMS V10 标准分类
 */

export interface JuliangCategory {
  id: number;
  pid: number;
  name: string;
  code: string;
  isExcluded?: boolean; // 标记是否为全站彻底封禁的成人边缘类目
  is4K?: boolean;       // 标记是否为 4K 专区
  isShortDrama?: boolean; // 标记是否为短剧专线类目
}

/**
 * 巨量资源成人边缘分类黑名单（铁律：彻底排除，不进入主站普通影视，亦不路由至 iKanX 午夜专区）
 */
export const JULIANG_EXCLUDED_CATEGORY_IDS = new Set<number>([
  190, // 伦理片
  191, // 写真
]);

/**
 * 巨量资源成人关键词黑名单
 */
export const JULIANG_EXCLUDED_KEYWORDS = ['伦理', '写真', '福利', '限制级', '18禁', '三级'];

/**
 * 巨量短剧专区分类 ID 集合（合计 62,665+ 部短剧 + 10,429+ 部 AI漫剧）
 */
export const JULIANG_SHORT_DRAMA_CATEGORY_IDS = new Set<number>([
  5,   // 短剧 (顶级大类)
  501, // 古装仙侠
  502, // 穿越
  503, // 悬疑
  504, // 都市
  505, // 女频
  506, // 爽剧
  599, // 其他
  7,   // AI漫剧 (顶级大类)
  701, // AI漫剧
]);

/**
 * 巨量 4K 专区分类 ID
 */
export const JULIANG_4K_CATEGORY_ID = 192; // 电影 -> 4K专区

/**
 * 巨量全量分类映射表
 */
export const JULIANG_CATEGORIES: JuliangCategory[] = [
  // 顶级分类 (type_pid = 0)
  { id: 1, pid: 0, name: '电影', code: 'movie' },
  { id: 2, pid: 0, name: '电视剧', code: 'series' },
  { id: 3, pid: 0, name: '动漫', code: 'anime' },
  { id: 4, pid: 0, name: '综艺', code: 'variety' },
  { id: 5, pid: 0, name: '短剧', code: 'short_drama', isShortDrama: true },
  { id: 6, pid: 0, name: '体育赛事', code: 'sports' },
  { id: 7, pid: 0, name: 'AI漫剧', code: 'ai', isShortDrama: true },

  // 电影子类 (pid = 1)
  { id: 101, pid: 1, name: '动作片', code: 'action' },
  { id: 102, pid: 1, name: '喜剧片', code: 'comedy' },
  { id: 103, pid: 1, name: '爱情片', code: 'romance' },
  { id: 104, pid: 1, name: '科幻片', code: 'sci_fi' },
  { id: 105, pid: 1, name: '恐怖片', code: 'horror' },
  { id: 106, pid: 1, name: '剧情片', code: 'drama' },
  { id: 107, pid: 1, name: '战争片', code: 'war' },
  { id: 108, pid: 1, name: '惊悚片', code: 'thriller' },
  { id: 109, pid: 1, name: '犯罪片', code: 'crime' },
  { id: 110, pid: 1, name: '悬疑片', code: 'mystery' },
  { id: 111, pid: 1, name: '冒险片', code: 'adventure' },
  { id: 112, pid: 1, name: '动画片', code: 'animation' },
  { id: 113, pid: 1, name: '武侠片', code: 'wuxia' },
  { id: 114, pid: 1, name: '奇幻片', code: 'fantasy' },
  { id: 115, pid: 1, name: '历史片', code: 'history' },
  { id: 116, pid: 1, name: '传记片', code: 'biography' },
  { id: 117, pid: 1, name: '歌舞片', code: 'musical' },
  { id: 118, pid: 1, name: '纪录片', code: 'documentary' },
  { id: 119, pid: 1, name: '西部片', code: 'western' },
  { id: 120, pid: 1, name: '灾难片', code: 'disaster' },
  { id: 121, pid: 1, name: '青春片', code: 'youth' },
  { id: 122, pid: 1, name: '预告片', code: 'trailer' },
  { id: 190, pid: 1, name: '伦理片', code: 'erotic', isExcluded: true },
  { id: 191, pid: 1, name: '写真', code: 'gravure', isExcluded: true },
  { id: 192, pid: 1, name: '4K专区', code: '4k', is4K: true },
  { id: 199, pid: 1, name: '电影解说', code: 'movie_commentary' },

  // 电视剧子类 (pid = 2)
  { id: 201, pid: 2, name: '国产剧', code: 'mainland' },
  { id: 202, pid: 2, name: '欧美剧', code: 'western' },
  { id: 203, pid: 2, name: '日剧', code: 'japanese' },
  { id: 204, pid: 2, name: '韩剧', code: 'korean' },
  { id: 205, pid: 2, name: '台剧', code: 'taiwanese' },
  { id: 206, pid: 2, name: '港剧', code: 'hongkong' },
  { id: 207, pid: 2, name: '泰剧', code: 'thai' },
  { id: 208, pid: 2, name: '海外剧', code: 'overseas' },
  { id: 299, pid: 2, name: '短剧(剧集分类)', code: 'short_drama_legacy', isShortDrama: true },

  // 动漫子类 (pid = 3)
  { id: 301, pid: 3, name: '国产动漫', code: 'chinese_anime' },
  { id: 302, pid: 3, name: '日本动漫', code: 'japanese_anime' },
  { id: 303, pid: 3, name: '欧美动漫', code: 'western_anime' },
  { id: 304, pid: 3, name: '港台动漫', code: 'hk_tw_anime' },
  { id: 305, pid: 3, name: '韩国动漫', code: 'korean_anime' },
  { id: 306, pid: 3, name: '海外动漫', code: 'overseas_anime' },
  { id: 307, pid: 3, name: '动漫电影', code: 'anime_movie' },
  { id: 399, pid: 3, name: '动态漫画', code: 'motion_comic' },

  // 综艺子类 (pid = 4)
  { id: 401, pid: 4, name: '大陆综艺', code: 'mainland_variety' },
  { id: 402, pid: 4, name: '港台综艺', code: 'hk_tw_variety' },
  { id: 403, pid: 4, name: '日韩综艺', code: 'jp_kr_variety' },
  { id: 404, pid: 4, name: '欧美综艺', code: 'western_variety' },
  { id: 405, pid: 4, name: '访谈脱口秀', code: 'talk_show' },
  { id: 406, pid: 4, name: '真人秀', code: 'reality_show' },
  { id: 407, pid: 4, name: '选秀竞演', code: 'talent_show' },
  { id: 499, pid: 4, name: '晚会盛典', code: 'gala' },

  // 短剧子类 (pid = 5) - 主力专线 (合计 62,665+ 部)
  { id: 501, pid: 5, name: '古装仙侠', code: 'guzhuang', isShortDrama: true },
  { id: 502, pid: 5, name: '穿越', code: 'chuanyue', isShortDrama: true },
  { id: 503, pid: 5, name: '悬疑', code: 'naodong', isShortDrama: true },
  { id: 504, pid: 5, name: '都市', code: 'dushi', isShortDrama: true },
  { id: 505, pid: 5, name: '女频', code: 'yanqing', isShortDrama: true },
  { id: 506, pid: 5, name: '爽剧', code: 'shuangju', isShortDrama: true },
  { id: 599, pid: 5, name: '其他短剧', code: 'other_short', isShortDrama: true },

  // 体育赛事 (pid = 6)
  { id: 601, pid: 6, name: '足球', code: 'football' },
  { id: 602, pid: 6, name: '篮球', code: 'basketball' },
  { id: 603, pid: 6, name: '网球', code: 'tennis' },
  { id: 604, pid: 6, name: '赛车', code: 'racing' },
  { id: 605, pid: 6, name: '电竞赛事', code: 'esports' },

  // AI漫剧 (pid = 7)
  { id: 701, pid: 7, name: 'AI漫剧', code: 'ai_series', isShortDrama: true },
];

/**
 * 校验指定分类 ID 是否为严禁收录的成人边缘分类
 */
export function isJuliangExcludedCategory(typeId: number, typeName?: string): boolean {
  if (JULIANG_EXCLUDED_CATEGORY_IDS.has(typeId)) {
    return true;
  }
  if (typeName) {
    const lowerName = typeName.toLowerCase();
    return JULIANG_EXCLUDED_KEYWORDS.some((kw) => lowerName.includes(kw));
  }
  return false;
}

/**
 * 判断指定分类 ID 是否属于短剧或 AI 漫剧专线
 */
export function isJuliangShortDramaCategory(typeId: number): boolean {
  return JULIANG_SHORT_DRAMA_CATEGORY_IDS.has(typeId) || typeId === 299;
}

/**
 * 判断巨量源内容是否属于真实的 4K 规格（仅限 4K 专区 t=192 或片名/分类带 4K/2160）
 */
export function isJuliang4KContent(typeId?: number, title?: string, typeName?: string): boolean {
  if (typeId === JULIANG_4K_CATEGORY_ID) {
    return true;
  }
  const textToCheck = `${title || ''} ${typeName || ''}`.toUpperCase();
  return textToCheck.includes('4K') || textToCheck.includes('2160P') || textToCheck.includes('2160');
}
