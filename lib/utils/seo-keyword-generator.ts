/**
 * 全光谱搜索意图与长尾截流生成器 (Full-Spectrum SEO/GEO Keyword Generator)
 * 驱动核心: docs/architecture/ikanpp_seo_keyword_system.yaml & lib/data/seo-rules/seo-keyword-system.ts
 * 
 * 核心特性：
 * 1. 100% 遵循白帽规范，根据片名、分类、导演、主演自动渲染 YAML 标准模板；
 * 2. 融入 YAML 意图修饰词库（watch_intent, free_intent, quality, freshness, completion, information）；
 * 3. 深度融入网盘下载截流矩阵（百度网盘、迅雷、夸克、磁力），引导用户 0ms 在线秒播；
 * 4. 覆盖观影决策与剧情衍生词（豆瓣真实评分、结局解析、演职员表、片尾彩蛋）；
 * 5. 拼音与常见错别字容错（如“生活危机” <-> “生化危机”）。
 */

import {
  KEYWORD_TEMPLATES,
  GENERIC_MODIFIERS,
} from '@/lib/data/seo-rules/seo-keyword-system';



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
  discoveryChips: string[];
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

  const primaryGenre = genres[0] || '';
  const primaryCountry = region ? region.split(/[·,\s/]/)[0].slice(0, 4) : '';
  const validActs = actors.filter(a => a && !['知名导演', '实力主演', '未知', '暂无'].includes(a.trim()));
  const validDirs = directors.filter(d => d && !['知名导演', '实力主演', '未知', '暂无'].includes(d.trim()));
  const primaryActor = validActs[0] || '';
  const primaryDirector = validDirs[0] || '';

  // ====== 1. YAML 标准模板渲染 (KEYWORD_TEMPLATES) ======
  const templates = isSeries ? KEYWORD_TEMPLATES.tv : KEYWORD_TEMPLATES.movie;
  for (const tmpl of templates) {
    const rendered = tmpl
      .replace('{title}', primaryTitle)
      .replace('{year}', year || '')
      .replace('{country}', primaryCountry)
      .replace('{genre}', primaryGenre)
      .replace('{actor}', primaryActor)
      .replace('{director}', primaryDirector)
      .replace(/\s+/g, ' ')
      .trim();

    // 如果变量缺失导致的空尾缀（如 "片名  电影"），清理后加入
    if (rendered && !rendered.endsWith('{country}') && !rendered.endsWith('{genre}') && !rendered.endsWith('{actor}')) {
      if (mediaLabel !== '电视剧' && isSeries) {
        keywordSet.add(rendered.replace(/电视剧/g, mediaLabel));
      } else {
        keywordSet.add(rendered);
      }
    }
  }

  // 专属媒体类型标签补充（如 动漫 / 综艺 / 纪录片）
  if (mediaLabel) {
    keywordSet.add(`${primaryTitle} ${mediaLabel}`);
  }

  // 紧凑标题与年份变体
  if (compactTitle !== primaryTitle) keywordSet.add(compactTitle);
  if (year) keywordSet.add(`${primaryTitle} ${year}`);

  // ====== 2. 核心 6 大意图修饰词家族全面注入 (GENERIC_MODIFIERS) ======
  // ① 观影意图 (watch_intent: 在线观看, 在线播放, 在线看, 在线观影)
  for (const w of GENERIC_MODIFIERS.watch_intent) {
    keywordSet.add(`${primaryTitle} ${w}`);
  }

  // ② 免费意图 (free_intent: 免费观看, 免费在线观看)
  for (const f of GENERIC_MODIFIERS.free_intent) {
    keywordSet.add(`${primaryTitle} ${f}`);
  }

  // ③ 画质规格 (quality: 高清, HD, 1080P, 4K, 4K超清原画)
  for (const q of GENERIC_MODIFIERS.quality) {
    keywordSet.add(`${primaryTitle} ${q}`);
  }

  // ④ 完结度与连载状态 (completion & freshness: 完整版, 全集, 大结局, 最新一集, 更新至)
  for (const c of GENERIC_MODIFIERS.completion) {
    keywordSet.add(`${primaryTitle} ${c}`);
  }
  if (isSeries) {
    for (const fr of GENERIC_MODIFIERS.freshness) {
      keywordSet.add(`${primaryTitle} ${fr}`);
    }
    if (numberOfEpisodes && numberOfEpisodes > 1) {
      keywordSet.add(`${primaryTitle} 共${numberOfEpisodes}集`);
      keywordSet.add(`${primaryTitle} 更新至第${numberOfEpisodes}集`);
    }
  }

  // ⑤ 信息与决策 (information: 剧情, 剧情介绍, 简介, 演员表, 导演, 结局, 上映时间, 评分)
  for (const info of GENERIC_MODIFIERS.information) {
    keywordSet.add(`${primaryTitle} ${info}`);
  }
  keywordSet.add(`${primaryTitle} 豆瓣真实评分`);
  keywordSet.add(`${primaryTitle} 结局解析`);
  keywordSet.add(`${primaryTitle} 片尾彩蛋`);

  // ⑥ 口碑推荐与问答意图 (recommendation: 推荐, 排行榜, 好看吗, 值得看吗)
  for (const rec of GENERIC_MODIFIERS.recommendation) {
    keywordSet.add(`${primaryTitle} ${rec}`);
  }

  // ====== 3. 网盘与下载截流词 (GENERIC_MODIFIERS.cloud_storage_intent - 核心转化洼地) ======
  for (const mod of GENERIC_MODIFIERS.cloud_storage_intent) {
    keywordSet.add(`${primaryTitle} ${mod}`);
  }

  // ====== 4. 音轨与地域规格词 ======
  keywordSet.add(`${primaryTitle} 中文字幕`);
  if (region?.includes('港') || region?.includes('台') || region?.includes('粤')) {
    keywordSet.add(`${primaryTitle} 粤语中字`);
    keywordSet.add(`${primaryTitle} 国语配音`);
  } else if (region?.includes('美') || region?.includes('英') || region?.includes('欧')) {
    keywordSet.add(`${primaryTitle} 原声中字`);
    keywordSet.add(`${primaryTitle} 双语字幕`);
  }


  // ====== 6. 拼音/同音/常见别名容错词 (Fuzzy & Phonetic Aliases) ======
  for (const [key, aliases] of Object.entries(COMMON_FUZZY_ALIASES)) {
    if (primaryTitle.includes(key)) {
      for (const alias of aliases) {
        keywordSet.add(alias);
        keywordSet.add(`${alias} 在线观看`);
      }
    }
  }

  // ====== 7. 主创与类型衍生词 ======
  for (const actor of validActs.slice(0, 2)) {
    keywordSet.add(`${actor} ${mediaLabel}`);
  }
  for (const dir of validDirs.slice(0, 1)) {
    keywordSet.add(`${dir} 导演新作`);
  }
  if (primaryGenre) {
    keywordSet.add(`${primaryGenre}片推荐`);
  }

  // 品牌词
  keywordSet.add('iKanPP');
  keywordSet.add('爱看片片');

  // 精选用于页面渲染的探索意图 Chips (融入观影、画质、网盘、口碑等各维度代表)
  const intentChips = [
    `${primaryTitle} 在线观看`,
    `${primaryTitle} 4K超清`,
    `${primaryTitle} 百度网盘`,
    `${primaryTitle} 迅雷下载`,
    `${primaryTitle} 完整版未删减`,
    `${primaryTitle} 豆瓣评分`,
    `${primaryTitle} 好看吗`,
    `${primaryTitle} 推荐`,
    `${primaryTitle} 结局彩蛋`,
  ];

  // ====== 8. YAML 跨维度探索标签 (Discovery Chips) ======
  const discoveryChips: string[] = [];
  if (year && primaryGenre) discoveryChips.push(`${year}热门${primaryGenre}${mediaLabel}`);
  if (primaryCountry && primaryGenre) discoveryChips.push(`${primaryCountry}${primaryGenre}${mediaLabel}推荐`);
  if (primaryActor) discoveryChips.push(`${primaryActor}主演作品`);
  if (primaryDirector) discoveryChips.push(`${primaryDirector}导演代表作`);
  if (primaryGenre) discoveryChips.push(`${primaryGenre}${mediaLabel}排行榜`);

  // ====== 9. YAML 标准元数据语法 + 网盘截流 CTA ======
  const tagParts = [year, primaryCountry, primaryGenre, mediaLabel].filter(Boolean);
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

  // YAML 描述主干 + 网盘截流钩子
  const yamlNarrative = isSeries
    ? `在线观看《${primaryTitle}》，查看最新更新、剧情介绍、演职员表${numberOfEpisodes ? `与全网共${numberOfEpisodes}集更新状态` : ''}。`
    : `在线观看《${primaryTitle}》，查看${year ? `${year}年` : ''}${primaryCountry}${primaryGenre}${mediaLabel}的剧情简介、演员表阵容与导演信息。`;

  const hookCta = isSeries
    ? (numberOfEpisodes ? `寻找《${primaryTitle}》百度网盘/迅雷下载？iKanPP 无需繁琐转存解压，全网首发 4K 超清 0ms 纯直连秒播。` : `寻找《${primaryTitle}》网盘资源？iKanPP 支持全集 4K 原画免VIP极速在线观看。`)
    : `寻找《${primaryTitle}》百度网盘/迅雷资源？无需转存解压与限速等待，iKanPP 提供 1080P/4K 超清原画完整版 0ms 免VIP在线秒播。`;

  const metaDescription = `${signalPrefix}${yamlNarrative} ${castStr}${cleanDesc ? `剧情：${cleanDesc} ` : ''}${hookCta}`;

  return {
    keywords: Array.from(keywordSet).slice(0, 48),
    metaDescription,
    intentChips,
    cleanTitle: primaryTitle,
    discoveryChips,
  };
}

