export interface TitleEntity {
  entityId: string;            // "ik000001" (全局唯一不可变序号)
  slug: string;                // 拼音别名，例如 "xiao-shen-ke-de-jiu-shu"
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
  genres: string[];            // 题材分类，例如 ["剧情", "犯罪"]
  directors: string[];         // 导演列表
  actors: string[];            // 主演列表 (前 5 位)
  region?: string;             // 制片国家/地区，例如 "美国"
  language?: string;           // 主要语言，例如 "国语"、"英语"、"泰语"
  status?: string;             // 连载状态，例如 "完结"、"更新至第12集"
  popularity?: number;         // TMDB 人气指数（用于综合热度排序）
  runtime?: number;            // 片长（分钟）
  numberOfSeasons?: number;    // 电视剧季数
  numberOfEpisodes?: number;   // 电视剧总集数
  keywords?: string[];         // 核心标签与长尾关键词
  relatedEntityIds?: string[]; // 站内强关联影片 entityId 列表 (内链网络拓扑)
  seoScore?: number;           // SEO 质量评分 (0-100)，≥60 分方可进入搜索引擎主动推送池
  createdAt: string;           // 初次入库 ISO 8601 时间戳
  updatedAt: string;           // 最后更新 ISO 8601 时间戳
}
