/**
 * 影视名称智能分词与多级检索候选词提取器
 * 
 * 核心能力：
 * 1. 自动剥离常见影视冗余修饰词（如：电影、电视剧、高清版、国语版、全集等）
 * 2. 复合影视名称语义切分（如：“法蒂玛圣母” -> 主词“法蒂玛”；“哈利波特与魔法石” -> 主词“哈利波特”）
 * 3. 生成多阶段搜索候选词队列（Phase 1 严格匹配 -> Phase 2 智能主词回退）
 */

// 常见末尾修饰词与冗余标签
const NOISE_SUFFIXES = [
  '电影', '电视剧', '电视剧版', '电影版', '剧场版', '真人版', '动画版', '重置版', '重制版',
  '国语版', '粤语版', '英语版', '双语版', '原声版', '高清版', '蓝光版', '未删减版',
  '全集', '大结局', '中文字幕', '中字', '国语', '粤语', '高清', '4k', '1080p', '预告片',
];

// 常见复合名词后缀/附属修饰词（常出现在主标题之后）
const COMMON_COMPOUND_SUFFIXES = [
  '圣母', '之谜', '奇迹', '之战', '风云', '传奇', '归来', '崛起', '前传', '后传',
  '起源', '觉醒', '逆袭', '行动', '风暴', '世界', '历险记', '的故事', '特辑',
];

// 连词与介词分割符
const CONJUNCTION_SPLITTERS = [
  '之', '与', '和', '及', '同', '跟',
];

/**
 * 清洗原始搜索词，去除特殊标点和空白
 */
export function cleanSearchTitle(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/[《》【】\[\]（）()""'']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * 剥离影视冗余修饰词（例如 "法蒂玛 电影" -> "法蒂玛"）
 */
export function stripNoiseSuffixes(raw: string): string {
  let cleaned = cleanSearchTitle(raw);
  
  // 逐一检查并剥离后缀
  for (const suffix of NOISE_SUFFIXES) {
    if (cleaned.length > suffix.length + 1 && cleaned.toLowerCase().endsWith(suffix.toLowerCase())) {
      cleaned = cleaned.substring(0, cleaned.length - suffix.length).trim();
    }
  }
  return cleaned;
}

/**
 * 提取核心影视主词（用于智能回退补搜）
 * 例如：
 * - "法蒂玛圣母" -> "法蒂玛"
 * - "哈利波特与魔法石" -> "哈利波特"
 * - "名侦探柯南剧场版" -> "名侦探柯南"
 * - "蜘蛛侠：英雄无归" -> "蜘蛛侠"
 */
export function extractCoreTitle(raw: string): string | null {
  const cleaned = stripNoiseSuffixes(raw);
  if (cleaned.length <= 2) return null;

  // 1. 标点符号分割（如冒号、破折号、斜杠）
  const punctuationParts = cleaned.split(/[:：\-—·/]/).map(p => p.trim()).filter(Boolean);
  if (punctuationParts.length >= 2 && punctuationParts[0].length >= 2) {
    return punctuationParts[0];
  }

  // 2. 介词与连词分割（如 "哈利波特与魔法石" -> "哈利波特"）
  for (const conj of CONJUNCTION_SPLITTERS) {
    const idx = cleaned.indexOf(conj);
    if (idx >= 2 && idx <= cleaned.length - 2) {
      const prefix = cleaned.substring(0, idx).trim();
      if (prefix.length >= 2) {
        return prefix;
      }
    }
  }

  // 3. 常见复合修饰后缀拆解（如 "法蒂玛圣母" -> "法蒂玛"）
  for (const suffix of COMMON_COMPOUND_SUFFIXES) {
    if (cleaned.endsWith(suffix) && cleaned.length > suffix.length + 1) {
      const core = cleaned.substring(0, cleaned.length - suffix.length).trim();
      if (core.length >= 2) {
        return core;
      }
    }
  }

  return null;
}

/**
 * 构建两阶段搜索策略候选词组
 * @returns { phase1: string[], fallback: string[] }
 */
export function buildSearchStrategy(query: string): {
  phase1: string[];
  fallback: string[];
} {
  const clean = cleanSearchTitle(query);
  const noNoise = stripNoiseSuffixes(clean);
  const core = extractCoreTitle(clean);

  const phase1: string[] = [];
  const fallback: string[] = [];

  // Phase 1: 严格精确全词匹配
  const cleanNoSpace = clean.replace(/\s+/g, '');
  phase1.push(cleanNoSpace);

  if (noNoise && noNoise !== cleanNoSpace && !phase1.includes(noNoise)) {
    phase1.push(noNoise);
  }

  // Phase 2: 智能回退主词
  if (core && core !== cleanNoSpace && core !== noNoise) {
    fallback.push(core);
  }

  return { phase1, fallback };
}
