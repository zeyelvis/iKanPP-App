/**
 * 智能拼音与模糊搜索工具 (Pinyin & Fuzzy Search Engine)
 * 支持首字母缩写（如 frxxz ➔ 凡人修仙传）、全拼（如 fanrenxiuxianzhuan ➔ 凡人修仙传）与高频影视热搜别名匹配
 */

// 常见热播剧 / 电影拼音别名首字母映射字典
export const POPULAR_MEDIA_PINYIN_MAP: Record<string, string> = {
  // 国漫
  'frxxz': '凡人修仙传',
  'fanren': '凡人修仙传',
  'tmsx': '吞噬星空',
  'tunshi': '吞噬星空',
  'wmsh': '完美世界',
  'wanmei': '完美世界',
  'dpcq': '斗破苍穹',
  'doupocangqiong': '斗破苍穹',
  'dldl': '斗罗大陆',
  'douluodalu': '斗罗大陆',
  'zt': '遮天',
  'zhetian': '遮天',
  'xxb': '仙逆',
  'xianni': '仙逆',
  'ys': '一念永恒',
  'yinian': '一念永恒',
  'yryx': '一人之下',
  'yiren': '一人之下',
  'bsfs': '白蛇浮生',
  'baishe': '白蛇浮生',
  'nz': '哪吒之魔童降世',
  'nezha': '哪吒之魔童降世',

  // 国产热播剧
  'qyn': '庆余年',
  'qingyunian': '庆余年',
  'qyn2': '庆余年 第二季',
  'kb': '狂飙',
  'kuangbiao': '狂飙',
  'fh': '繁花',
  'fanhua': '繁花',
  'st': '三体',
  'santi': '三体',
  'mcjj': '漫长的季节',
  'manchang': '漫长的季节',
  'yfdff': '去有风的地方',
  'feng': '去有风的地方',
  'll': '琅琊榜',
  'langyabang': '琅琊榜',
  'zhy': '甄嬛传',
  'zhenhuan': '甄嬛传',

  // 电影
  'zww': '抓娃娃',
  'zhuawawa': '抓娃娃',
  'ssyjl': '死侍与金刚狼',
  'sishi': '死侍与金刚狼',
  'yx': '异形：夺命舰',
  'yixing': '异形：夺命舰',
  'jlcz': '九龙城寨之围城',
  'jiulong': '九龙城寨之围城',
  'sq2': '沙丘2',
  'shaqiu': '沙丘2',
  'ms': '默杀',
  'mosha': '默杀',
  'nxrs': '逆行人生',
  'nixing': '逆行人生',
  'lydq': '流浪地球',
  'liulangdiqiu': '流浪地球',
  'sf': '封神第一部',
  'fengshen': '封神第一部',
  'abhm': '奥本海默',
  'aobenhaimo': '奥本海默',

  // 美剧与韩剧
  'jmdd': '绝命毒师',
  'juemingdushi': '绝命毒师',
  'qlyx': '权力的游戏',
  'quanlideyouxi': '权力的游戏',
  'gqwy': '怪奇物语',
  'guaiqi': '怪奇物语',
  'zhshz': '最后生还者',
  'dahy': '黑暗荣耀',
  'heianrongyao': '黑暗荣耀',
  'znvw': '泪之女王',
  'leizhi': '泪之女王',
  'qhd1988': '请回答1988',
  'qinghuida': '请回答1988',
  'zsdfln': '葬送的芙莉莲',
  'fulilian': '葬送的芙莉莲',
  'zshz': '咒术回战',
  'zhoushu': '咒术回战',
  'gmzr': '鬼灭之刃',
  'guimie': '鬼灭之刃',
};

/**
 * 将用户输入的纯英文字符串尝试解析为对应中文片名
 * 例如输入 "frxxz" ➔ 返回 "凡人修仙传"
 * 如果没有匹配的别名，则返回原输入
 */
export function resolvePinyinAlias(input: string): string {
  if (!input) return '';
  const clean = input.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  if (POPULAR_MEDIA_PINYIN_MAP[clean]) {
    return POPULAR_MEDIA_PINYIN_MAP[clean];
  }
  return input.trim();
}

/**
 * 判断两个文本是否模糊相关（支持拼音别名匹配）
 */
export function matchesFuzzyPinyin(text: string, query: string): boolean {
  if (!text || !query) return false;
  const q = query.trim().toLowerCase();
  const t = text.trim().toLowerCase();

  // 1. 基础子串包含
  if (t.includes(q)) return true;

  // 2. 别名反查
  const resolved = resolvePinyinAlias(q);
  if (resolved !== q && t.includes(resolved.toLowerCase())) {
    return true;
  }

  return false;
}
