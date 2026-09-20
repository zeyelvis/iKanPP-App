/**
 * iKanPP 机器可读 SEO 关键词系统与规则中心
 * 对应架构规范: docs/architecture/ikanpp_seo_keyword_system.yaml
 * 
 * 作用：
 * 1. 提供强类型的修饰词分组、模板语法与优先级判定准则；
 * 2. 编译期零额外依赖，SSR 阶段 0ms 纯内存读取，免除 YAML 运行时解析开销；
 * 3. 规范白帽索引门槛（isEntityIndexable），防止薄弱空壳页面被 Google 爬取。
 */

export const SEO_PROJECT_CONFIG = {
  name: 'iKanPP',
  domain: 'ikanpp.com',
  baseUrl: 'https://www.ikanpp.com',
  localePrimary: 'zh-CN',
  siteType: 'movie_tv_streaming_catalog',
  strategy: 'entity_first',
} as const;

/**
 * 核心分类词根 (Primary Keywords)
 */
export const PRIMARY_KEYWORDS = [
  '电影', '电视剧', '影视', '在线观看', '国产剧', '韩剧', '美剧',
  '日剧', '泰剧', '港剧', '台剧', '动漫', '综艺', '纪录片', '短剧',
  '动作片', '爱情片', '喜剧片', '恐怖片', '科幻片', '悬疑片', '犯罪片',
] as const;

/**
 * 通用意图修饰词库 (Generic Modifiers)
 */
export const GENERIC_MODIFIERS = {
  watch_intent: ['在线观看', '在线播放', '在线看', '在线观影'],
  free_intent: ['免费观看', '免费在线观看'],
  quality: ['高清', 'HD', '1080P', '4K', '4K超清原画'],
  freshness: ['最新', '更新', '更新至', '最新一集'],
  completion: ['完整版', '全集', '全季', '大结局', '未删减版'],
  information: ['剧情', '剧情介绍', '简介', '演员表', '导演', '结局', '上映时间', '更新时间', '评分'],
  recommendation: ['推荐', '排行榜', '好看吗', '值得看吗'],
} as const;


/**
 * 影视关键词衍生模板矩阵 (Keyword Templates)
 */
export const KEYWORD_TEMPLATES = {
  movie: [
    '{title}',
    '{title} 电影',
    '{title} 在线观看',
    '{title} 免费观看',
    '{title} 完整版',
    '{title} 高清',
    '{title} 剧情',
    '{title} 剧情介绍',
    '{title} 演员表',
    '{title} 导演',
    '{title} 结局',
    '{title} 上映时间',
    '{title} 评分',
    '{title} {year}',
    '{title} {year} 在线观看',
    '{title} {country} 电影',
    '{title} {genre} 电影',
    '{title} {actor}',
  ],
  tv: [
    '{title}',
    '{title} 电视剧',
    '{title} 在线观看',
    '{title} 免费观看',
    '{title} 全集',
    '{title} 更新到第几集',
    '{title} 最新一集',
    '{title} 大结局',
    '{title} 演员表',
    '{title} 剧情',
    '{title} 更新时间',
    '{title} {year}',
    '{title} {country} 电视剧',
    '{title} {genre} 电视剧',
  ],
  discovery: [
    '{year} 最好看的 {genre} 电影',
    '{year} 热门 {genre} 电影',
    '{year} {country} 电影推荐',
    '{year} {country} {genre} 电影',
    '{year} 热门电视剧',
    '{year} {country} 电视剧推荐',
    '{genre} 电影排行榜',
    '{country} 电影排行榜',
  ],
} as const;

/**
 * 白帽索引门槛与质量护栏 (Indexation Rules)
 */
export interface EntityValidationInput {
  title?: string;
  year?: string;
  cover?: string;
  description?: string;
  genres?: string[];
  type?: string;
}

/**
 * 校验条目是否满足白帽索引标准
 * 规则：必须有明确的中文片名、合理的年份或类型标签，杜绝空白空壳页面被 Google 爬取
 */
export function isEntityIndexable(entity?: EntityValidationInput | null): boolean {
  if (!entity) return false;
  const title = (entity.title || '').trim();
  if (!title || title.length < 1) return false;

  // 杜绝无意义的测试占位片名
  const invalidTitles = ['未知', '测试', 'undefined', 'null', '暂无', '待更新'];
  if (invalidTitles.includes(title)) return false;

  // 必须具有最基础的描述或年份或封面之一，保证页面有实际信息量
  const hasDescription = Boolean(entity.description && entity.description.trim().length > 10);
  const hasYear = Boolean(entity.year && /^\d{4}$/.test(entity.year.trim()));
  const hasCover = Boolean(entity.cover && entity.cover.startsWith('http'));

  return hasDescription || hasYear || hasCover;
}
