export interface ShortDramaSource {
  id: string;
  name: string;
  baseUrl: string;
  apiPath: string;
  priority: number;
  categories: Record<string, number | number[]>;
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
  remarks?: string; // 例如 "共80集" 或 "更新至60集"
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
}

export const SHORT_DRAMA_SOURCES: ShortDramaSource[] = [
  {
    id: 'guangsu',
    name: '光速资源',
    baseUrl: 'https://api.guangsuapi.com',
    apiPath: '/api.php/provide/vod',
    priority: 1,
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
    priority: 2,
    categories: {
      all: [45, 46, 47, 48, 49, 50, 52, 54],
      guzhuang: 45, // 古装仙侠
      dushi: 46,    // 现代都市
      chuanyue: 47, // 穿越年代
      yanqing: 48,  // 言情总裁
      chongsheng: 49, // 重生民国
      shuangju: 50, // 反转爽剧
      naodong: 52,  // 脑洞悬疑
      ai: 54,       // AI漫剧
    },
  },
  {
    id: 'hongniu',
    name: '红牛资源',
    baseUrl: 'https://www.hongniuzy2.com',
    apiPath: '/api.php/provide/vod',
    priority: 3,
    categories: {
      all: [43, 45, 46],
      guzhuang: 43,
      chuanyue: 45,
      yanqing: 46,
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
 * 格式通常为: "第01集$https://...m3u8#第02集$https://...m3u8"
 * 或者多个播放源: "gsyun$$$第01集$url#...$$$gsm3u8$$$第01集$url#..."
 */
export function parseShortDramaPlayUrl(rawUrl?: string): ShortDramaEpisode[] {
  if (!rawUrl) return [];

  // 如果包含多个播放源源分隔符 ($$$)，优先提取 m3u8 源
  let targetPlaySource = rawUrl;
  if (rawUrl.includes('$$$')) {
    const sources = rawUrl.split('$$$');
    // 寻找包含 m3u8 的片段组
    for (let i = 0; i < sources.length; i++) {
      if (sources[i].includes('.m3u8')) {
        targetPlaySource = sources[i];
        break;
      }
    }
  }

  const items = targetPlaySource.split('#');
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
          url: epUrl,
          epIndex: i + 1,
        });
      }
    } else if (parts.length === 1 && (parts[0].startsWith('http://') || parts[0].startsWith('https://'))) {
      episodes.push({
        name: `第${i + 1}集`,
        url: parts[0].trim(),
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
