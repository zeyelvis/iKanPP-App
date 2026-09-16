import { sanitizeStreamUrl } from '@/lib/utils/stream-sanitizer';

export interface ShortDramaSource {
  id: string;
  name: string;
  baseUrl: string;
  apiPath: string;
  priority: number;
  categories: Record<string, number | number[]>;
  categoryKeywords?: Record<string, string>;
  isEpisodic?: boolean; // 标记是否为原生真实分集短剧源
}

export interface ShortDramaEpisode {
  name: string;
  url: string;
  epIndex: number;
}

export interface ShortDramaItem {
  id: string | number;
  title: string;
  poster: string;
  category: string;
  categoryName?: string;
  year?: string;
  area?: string;
  remarks?: string; // 例如 "全80集" 或 "全集长片版"
  totalEpisodes?: number;
  director?: string;
  actor?: string;
  desc?: string;
  sourceId?: string;
  sourceName?: string;
  playUrl?: string; // 原始 vod_play_url
  episodes?: ShortDramaEpisode[];
  firstPlayUrl?: string;
  updatedAt?: string;
  isEpisodic?: boolean; // 是否具备真实分集
}

export const SHORT_DRAMA_SOURCES: ShortDramaSource[] = [
  {
    id: 'juliang',
    name: '巨量短剧专线',
    baseUrl: 'https://api.juliang.live',
    apiPath: '/api/provide/vod',
    priority: 1,
    isEpisodic: true,
    categories: {
      all: 5,        // 全部短剧顶级大类（62,665+ 部，100% 真实原生分集）
      shuangju: 506, // 爽剧 (3,559 部)
      yanqing: 505,  // 女频 (8,273 部)
      dushi: 504,    // 都市 (22,249 部)
      guzhuang: 501, // 古装仙侠 (10,988 部)
      chuanyue: 502, // 穿越 (4,258 部)
      chongsheng: 504, // 重生都市
      naodong: 503,  // 悬疑脑洞 (866 部)
      ai: 7,         // AI漫剧顶级大类 (10,429 部)
    },
    categoryKeywords: {
      chongsheng: '重生',
    },
  },
  {
    id: 'modu',
    name: '魔都短剧专线',
    baseUrl: 'https://caiji.moduapi.cc',
    apiPath: '/api.php/provide/vod',
    priority: 2,
    isEpisodic: true,
    categories: {
      all: 38,       // 全部短剧（34,395+ 部，100% 分集）
      ai: 42,        // AI漫剧专区
    },
    categoryKeywords: {
      shuangju: '逆袭',
      yanqing: '总裁',
      dushi: '都市',
      guzhuang: '古装',
      chuanyue: '穿越',
      chongsheng: '重生',
      naodong: '系统',
    },
  },
  {
    id: 'modu_mirror',
    name: '魔都镜像专线',
    baseUrl: 'https://www.mdzyapi.com',
    apiPath: '/api.php/provide/vod',
    priority: 3,
    isEpisodic: true,
    categories: {
      all: 38,
      ai: 42,
    },
    categoryKeywords: {
      shuangju: '逆袭',
      yanqing: '总裁',
      dushi: '都市',
      guzhuang: '古装',
      chuanyue: '穿越',
      chongsheng: '重生',
      naodong: '系统',
    },
  },
  {
    id: 'guangsu',
    name: '光速资源',
    baseUrl: 'https://api.guangsuapi.com',
    apiPath: '/api.php/provide/vod',
    priority: 4,
    isEpisodic: false,
    categories: {
      all: [44, 45, 46, 47, 48, 49, 50, 52],
      guzhuang: 44, // 古装仙侠
      dushi: 45,    // 现代都市
      chuanyue: 46, // 穿越年代
      yanqing: 47,  // 言情总裁
      chongsheng: 48, // 重生民国
      shuangju: 49, // 反转爽剧
      naodong: 50,  // 脑洞悬疑
      ai: 52,       // AI漫剧
    },
  },
  {
    id: 'jisu',
    name: '极速资源',
    baseUrl: 'https://jszyapi.com',
    apiPath: '/api.php/provide/vod',
    priority: 5,
    isEpisodic: false,
    categories: {
      all: [45, 46, 47, 48, 49, 50, 52, 54],
      guzhuang: 45,
      dushi: 46,
      chuanyue: 47,
      yanqing: 48,
      chongsheng: 49,
      shuangju: 50,
      naodong: 52,
      ai: 54,
    },
  },
];

export const SHORT_DRAMA_GENRES = [
  { label: '全部短剧', value: '', icon: '🔥', tag: 'all' },
  { label: '反转爽剧', value: 'shuangju', icon: '⚡', tag: 'shuangju' },
  { label: '言情总裁', value: 'yanqing', icon: '💕', tag: 'yanqing' },
  { label: '现代都市', value: 'dushi', icon: '🏙️', tag: 'dushi' },
  { label: '古装仙侠', value: 'guzhuang', icon: '🏯', tag: 'guzhuang' },
  { label: '穿越年代', value: 'chuanyue', icon: '⏳', tag: 'chuanyue' },
  { label: '重生民国', value: 'chongsheng', icon: '🔄', tag: 'chongsheng' },
  { label: '脑洞悬疑', value: 'naodong', icon: '🔍', tag: 'naodong' },
  { label: 'AI漫剧', value: 'ai', icon: '🤖', tag: 'ai' },
];

/**
 * 将 CMS 返回的 vod_play_url 解析为剧集列表
 * 智能策略：如果包含多个播放源 ($$$)，优先挑选有效分集数最多的那组源
 */
export function parseShortDramaPlayUrl(rawUrl?: string): ShortDramaEpisode[] {
  if (!rawUrl) return [];

  let bestSource = rawUrl;
  if (rawUrl.includes('$$$')) {
    const sources = rawUrl.split('$$$');
    let maxEpisodesCount = 0;
    for (const src of sources) {
      const parts = src.split('#').filter(Boolean);
      // 必须包含 m3u8 或可播放 http 协议
      const hasPlayable = parts.some(p => p.includes('.m3u8') || p.includes('http'));
      if (hasPlayable && parts.length > maxEpisodesCount) {
        maxEpisodesCount = parts.length;
        bestSource = src;
      }
    }
  }

  const items = bestSource.split('#');
  const episodes: ShortDramaEpisode[] = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i].trim();
    if (!item) continue;
    const parts = item.split('$');
    if (parts.length >= 2) {
      const epName = parts[0].trim();
      const epUrl = parts[1].trim();
      if (epUrl.startsWith('http://') || epUrl.startsWith('https://')) {
        episodes.push({
          name: epName,
          url: sanitizeStreamUrl(epUrl),
          epIndex: i,
        });
      }
    } else if (parts.length === 1 && (parts[0].startsWith('http://') || parts[0].startsWith('https://'))) {
      episodes.push({
        name: `第${i + 1}集`,
        url: sanitizeStreamUrl(parts[0].trim()),
        epIndex: i + 1,
      });
    }
  }

  return episodes;
}

/**
 * 提取剧集总数或备注解析
 */
export function parseEpisodesCount(remarks?: string, episodesCount?: number): number {
  if (episodesCount && episodesCount > 0) return episodesCount;
  if (!remarks) return 0;
  const match = remarks.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}
