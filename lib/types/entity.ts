export interface TitleEntity {
  entityId: string;            // "ik000001" (全局唯一不可变序号)
  slug: string;                // 拼音别名，例如 "xiao-shen-ke-de-jiu-shu"
  canonicalSlug?: string;       // 唯一权威规范 URL Slug，例如 "ik000001-肖申克的救赎"
  tmdbId: string;              // TMDB 官方条目 ID，例如 "278"
  tmdbType: 'movie' | 'tv';    // TMDB 媒体类型
  doubanId?: string;           // 豆瓣 ID，可选
  title: string;               // 中文主标题，例如 "肖申克的救赎"
  originalTitle?: string;      // 原语言标题，例如 "The Shawshank Redemption"
  type: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string; // iKanPP 归类：电影 / 剧集 / 动漫 / 综艺 / 纪录片
  year: string;                // 上映或播出年份，例如 "1994"
  description: string;         // 中文完整剧情梗概 (用于 SEO 丰富度与 AI 引用)
  cover: string;               // 海报图片 URL (推荐 w500)
  backdrop?: string;           // 剧照大图横版背景图 URL (推荐 w1280，用于 OG 与 Discover)
  rate: string;                // 评分，例如 "9.7"
  score?: string;               // 权威打分 (同 rate)
  genres: string[];            // 题材分类，例如 ["剧情", "犯罪"]
  directors: string[];         // 导演列表
  actors: string[];            // 主演列表 (前 5 位)
  region?: string;             // 制片国家/地区，例如 "美国"
  language?: string;           // 主要语言，例如 "国语"、"英语"、"泰语"
  status?: string;             // 连载状态，例如 "完结"、"更新至第12集"
  popularity?: number;         // TMDB/全网人气指数（用于综合热度排序）
  hot?: number;                // 真实全网播放/关注热度值（如 60802000）
  runtime?: number;            // 片长（分钟）
  numberOfSeasons?: number;    // 电视剧季数
  numberOfEpisodes?: number;   // 电视剧总集数
  keywords?: string[];         // 核心标签与长尾关键词
  relatedEntityIds?: string[]; // 站内强关联影片 entityId 列表 (内链网络拓扑)
  seoScore?: number;           // SEO 质量评分 (0-100)，≥60 分方可进入搜索引擎主动推送池
  aliases?: string[];          // 别名与外地公映译名库（用于搜索命中与301跳转）
  aiContent?: TitleAiContent;  // AI 生成的 5 大场景增强资产（独家深度影评、高光看点、FAQ、港台译名等）
  createdAt: string;           // 初次入库 ISO 8601 时间戳
  updatedAt: string;           // 最后更新 ISO 8601 时间戳
}

/**
 * AI 赋能的 5 大 SEO 超级场景实体数据模型
 */
export interface TitleAiContent {
  // 场景 1：独家原创深度影评与高光剧情
  hook?: string;                // 15~25字极具悬念与冲击力的一句话观影金句 (用于 Google 搜索结果首句抓人)
  uniqueSynopsis?: string;      // 300~400字独家深度剖析
  highlights?: string[];        // 3大剧情高光核心看点
  characterAnalysis?: string;   // 角色博弈与主演演技点评
  audienceFit?: string;         // 适宜受众画像

  // 场景 2：Google FAQPage 结构化问答
  faqs?: Array<{ question: string; answer: string; [key: string]: any }>;

  // 场景 5：全球繁体与港台本地化译名库
  taiwanTitle?: string;         // 台湾院线公映名 (如: 刺激1995)
  hongkongTitle?: string;       // 香港院线公映名 (如: 月黑高飛)
  traditionalMetaDescription?: string; // 港台繁体搜索摘要
  traditionalKeywords?: string[];      // 港台繁体长尾关键词

  generatedAt?: string;         // 生成时间
}

/**
 * 事实来源溯源模型 (对应规范 4.3 节)
 */
export interface FactProvenance {
  source: 'tmdb' | 'douban' | 'provider' | 'editorial' | 'derived';
  sourceId?: string;
  fetchedAt: string;
  confidence: number; // 0.0 - 1.0 置信度
}

/**
 * 权威评分事实
 */
export interface RatingFact {
  value: number;       // 10分制打分
  scale: 10;
  count?: number;      // 真实评价人数 (严禁硬编码或假造)
  source: string;      // 评分数据来源 (如 'TMDB'、'Douban')
  observedAt: string;  // 观测时间戳
}

/**
 * 片源可用性事实 (播放能力探测)
 */
export interface AvailabilityFact {
  sourceId: string;
  playable: boolean;
  checkedAt: string;
  maxResolution?: 'SD' | '720p' | '1080p' | '4K';
  hdr?: boolean;
  audioFormats?: string[];
  regionsAllowed?: string[];
}

/**
 * 生产发布态实体读取模型 (KV 只读投影)
 */
export interface PublishedTitleEntity {
  entityId: string;
  canonicalSlug: string;
  identityVersion: number;
  title: string;
  originalTitle?: string;
  aliases: string[];
  mediaType: string;
  releaseDate?: string;
  releaseDatePrecision: 'day' | 'month' | 'year' | 'unknown';
  description?: string;
  cover?: string;
  backdrop?: string;
  rating?: RatingFact;
  availability: AvailabilityFact[];
  factProvenance: Record<string, FactProvenance>;
  indexState: 'noindex' | 'indexable' | 'suppressed';
  seoScore: number;
  contentHash: string;
  materialUpdatedAt?: string;
  publishedAt?: string;
}

/**
 * 事实准出函数 (对应规范 4.4 节)
 * 每一个会进入正文、metadata 或 Schema 的事实必须通过严格来源置信度校验
 */
export function canPublishFact(fact: unknown, provenance?: FactProvenance): boolean {
  if (fact === undefined || fact === null || fact === '') {
    return false;
  }
  if (!provenance) {
    return false;
  }
  // 置信度低于 0.8 不予作为权威事实宣称
  if (provenance.confidence < 0.8) {
    return false;
  }
  return true;
}

