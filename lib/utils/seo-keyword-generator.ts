/**
 * 全光谱搜索意图与长尾截流生成器 (Full-Spectrum SEO/GEO Keyword Generator)
 * 
 * 核心功能：
 * 1. 100% 遵循白帽规范，根据片名、分类、导演、主演全自动裂变衍生 4 大类 25~35 个精准长尾词；
 * 2. 覆盖网盘下载截流意图（百度网盘、迅雷、夸克、磁力），引导用户转化为站内 0ms 在线播放；
 * 3. 覆盖画质与版本意图（4K超清原画、未删减完整版、国粤双语、中文字幕）；
 * 4. 覆盖观影决策衍生词（豆瓣真实评分、结局解析、演职员表、片尾彩蛋）；
 * 5. 常见同音字与标点拆解容错（如“生活危机” <-> “生化危机”）。
 */

export interface KeywordGeneratorInput {
  title: string;
  year?: string;
  type?: string;
  genres?: string[];
  directors?: string[];
  actors?: string[];
  region?: string;
  numberOfEpisodes?: number;
  description?: string;
}

export interface KeywordGeneratorOutput {
  keywords: string[];
  metaDescription: string;
  intentChips: string[];
  cleanTitle: string;
}

/**
 * 常见影视错别字/同音词容错字典
 */
const COMMON_FUZZY_ALIASES: Record<string, string[]> = {
  '生化危机': ['生活危机', '生化危机电影'],
  '凡人修仙传': ['凡人修仙', '凡人修仙传动画', '凡人动漫'],
  '完美世界': ['完美世界动画', '完美世界动漫'],
  '遮天': ['遮天动画', '遮天动漫'],
  '吞噬星空': ['吞噬星空动画', '吞噬星空动漫'],
  '仙逆': ['仙逆动画', '仙逆动漫'],
  '斗破苍穹': ['斗破', '斗破苍穹年番'],
  '斗罗大陆': ['斗罗', '斗罗大陆动画'],
  '怪奇物语': ['怪奇物语第', '怪奇物语全集'],
  '权力的游戏': ['权利的游戏', '权游'],
  '肖申克的救赎': ['消申克的救赎', '肖申克救赎'],
  '霸王别姬': ['霸王别鸡'],
};

/**
 * 清理片名标点符号，提取纯净搜索核心词
 */
function cleanTitlePunctuation(rawTitle: string): string[] {
  const variations = new Set<string>();
  const trimmed = rawTitle.trim();
  variations.add(trimmed);

  // 去除常见中英文冒号、破折号、空格分隔符
  const noPunct = trimmed
    .replace(/[：:—\-_/·]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (noPunct && noPunct !== trimmed) {
    variations.add(noPunct);
  }

  // 去除所有空格的紧凑版
  const compact = trimmed.replace(/[\s：:—\-_/·]/g, '');
  if (compact && compact !== trimmed) {
    variations.add(compact);
  }

  // 提取冒号前的主标题（如 "生化危机：爆发之夜" -> "生化危机"）
  const parts = trimmed.split(/[：:—\-_]/);
  if (parts.length > 1 && parts[0].trim().length >= 2) {
    variations.add(parts[0].trim());
  }

  return Array.from(variations);
}

/**
 * 生成全光谱长尾关键词与意图捕获矩阵
 */
export function generateFullSpectrumKeywords(input: KeywordGeneratorInput): KeywordGeneratorOutput {
  const {
    title,
    year,
    type = 'movie',
    genres = [],
    directors = [],
    actors = [],
    region,
    numberOfEpisodes,
    description = '',
  } = input;

  const keywordSet = new Set<string>();
  const titleVariations = cleanTitlePunctuation(title);
  const primaryTitle = titleVariations[0] || title;
  const compactTitle = title.replace(/[\s：:—\-_/·]/g, '');

  const isSeries = type === 'tv' || type === 'anime';
  const isAnime = type === 'anime' || genres.some(g => ['动漫', '动画', '新番', '国漫'].includes(g));
  const mediaLabel = isAnime ? '动漫' : isSeries ? '电视剧' : type === 'variety' ? '综艺' : type === 'documentary' ? '纪录片' : '电影';

  // 1. 基础核心直搜词 (Primary Search Terms)
  keywordSet.add(primaryTitle);
  if (compactTitle !== primaryTitle) keywordSet.add(compactTitle);
  if (year) keywordSet.add(`${primaryTitle} ${year}`);
  keywordSet.add(`${primaryTitle}在线观看`);
  keywordSet.add(`${primaryTitle}免费看`);
  keywordSet.add(`${primaryTitle}完整版`);
  keywordSet.add(`${primaryTitle}高清播放`);
  keywordSet.add(`${primaryTitle}未删减版`);

  if (isSeries) {
    keywordSet.add(`${primaryTitle}全集在线观看`);
    keywordSet.add(`${primaryTitle}大结局`);
    if (numberOfEpisodes && numberOfEpisodes > 1) {
      keywordSet.add(`${primaryTitle}共${numberOfEpisodes}集`);
      keywordSet.add(`${primaryTitle}更新至第${numberOfEpisodes}集`);
    }
  }

  // 2. 网盘与下载截流词 (Cloud Storage & Download Intent - 核心转化洼地)
  keywordSet.add(`${primaryTitle} 百度网盘`);
  keywordSet.add(`${primaryTitle} 迅雷下载`);
  keywordSet.add(`${primaryTitle} 夸克网盘资源`);
  keywordSet.add(`${primaryTitle} 夸克云盘`);
  keywordSet.add(`${primaryTitle} 磁力链接`);
  keywordSet.add(`${primaryTitle} 阿里云盘`);
  keywordSet.add(`${primaryTitle} 网盘下载`);

  // 3. 画质与音轨规格词 (Quality & Audio Track Intent)
  keywordSet.add(`${primaryTitle} 4K超清原画`);
  keywordSet.add(`${primaryTitle} 1080P免VIP`);
  keywordSet.add(`${primaryTitle} 中文字幕`);
  if (region?.includes('港') || region?.includes('台') || region?.includes('粤')) {
    keywordSet.add(`${primaryTitle} 粤语中字`);
    keywordSet.add(`${primaryTitle} 国语配音`);
  } else if (region?.includes('美') || region?.includes('英') || region?.includes('欧')) {
    keywordSet.add(`${primaryTitle} 原声中字`);
    keywordSet.add(`${primaryTitle} 双语字幕`);
  }

  // 4. 观影决策与剧情衍生词 (Discovery & Decision Intent)
  keywordSet.add(`${primaryTitle} 豆瓣真实评分`);
  keywordSet.add(`${primaryTitle} 结局解析`);
  keywordSet.add(`${primaryTitle} 演员表阵容`);
  keywordSet.add(`${primaryTitle} 片尾彩蛋`);

  // 5. 拼音/同音/常见别名容错词 (Fuzzy & Phonetic Aliases)
  for (const [key, aliases] of Object.entries(COMMON_FUZZY_ALIASES)) {
    if (primaryTitle.includes(key)) {
      for (const alias of aliases) {
        keywordSet.add(alias);
        keywordSet.add(`${alias} 在线观看`);
      }
    }
  }

  // 6. 主创与类型衍生词
  const validActs = actors.filter(a => a && !['知名导演', '实力主演', '未知', '暂无'].includes(a.trim()));
  const validDirs = directors.filter(d => d && !['知名导演', '实力主演', '未知', '暂无'].includes(d.trim()));
  for (const actor of validActs.slice(0, 2)) {
    keywordSet.add(`${actor} ${mediaLabel}`);
  }
  for (const dir of validDirs.slice(0, 1)) {
    keywordSet.add(`${dir} 导演新作`);
  }
  if (genres.length > 0) {
    keywordSet.add(`${genres[0]}片推荐`);
  }

  // 7. 品牌主词
  keywordSet.add('iKanPP');
  keywordSet.add('爱看片片');

  // 精选用于页面渲染的探索意图 Chips (8~10个最亮眼的词)
  const intentChips = [
    `${primaryTitle}在线观看`,
    `${primaryTitle} 4K超清`,
    `${primaryTitle} 百度网盘`,
    `${primaryTitle} 迅雷下载`,
    `${primaryTitle} 完整版未删减`,
    `${primaryTitle} 夸克云盘`,
    `${primaryTitle} 豆瓣评分`,
    `${primaryTitle} 结局彩蛋`,
  ];

  // 8. 自动化合成高转化、防降权、高点击率的 Meta Description (白帽自然融入)
  const tagParts = [year, region, genres[0], mediaLabel].filter(Boolean);
  const signalPrefix = tagParts.length > 0 ? `【${tagParts.join('·')}】` : '';

  const castParts: string[] = [];
  if (validDirs.length > 0) castParts.push(`由${validDirs.slice(0, 2).join('、')}执导`);
  if (validActs.length > 0) castParts.push(`${validActs.slice(0, 3).join('、')}领衔主演`);
  const castStr = castParts.length > 0 ? `${castParts.join('，')}。` : '';

  let cleanDesc = description
    .replace(/(?:导演|主演)\s*[:：]\s*(?:知名导演|实力主演)[，。、\s]*/g, '')
    .replace(/在线观看，支持海外华人免翻墙极速高清播放。/g, '')
    .replace(/在线观看，全网高清影视资源。/g, '')
    .trim();
  if (cleanDesc.length > 80) {
    cleanDesc = cleanDesc.slice(0, 80) + '...';
  }

  // 网盘截流钩子 + 0ms 播放行动号召 (CTA)
  const hookCta = isSeries
    ? (numberOfEpisodes ? `寻找《${primaryTitle}》百度网盘/迅雷下载？iKanPP 无需繁琐转存解压，全网首发共${numberOfEpisodes}集 4K 超清 0ms 纯直连秒播。` : `寻找《${primaryTitle}》网盘资源？iKanPP 支持全集 4K 原画免VIP极速在线观看。`)
    : `寻找《${primaryTitle}》百度网盘/迅雷资源？无需转存解压与限速等待，iKanPP 提供 1080P/4K 超清原画完整版 0ms 免VIP在线秒播。`;

  const metaDescription = `${signalPrefix}《${primaryTitle}》${castStr}${cleanDesc ? `剧情介绍：${cleanDesc} ` : ''}${hookCta}`;

  return {
    keywords: Array.from(keywordSet).slice(0, 35),
    metaDescription,
    intentChips,
    cleanTitle: primaryTitle,
  };
}
