/**
 * Backbone Collector Sources Fallback & Self-Healing Engine
 * 
 * 骨干采集站自愈调度引擎 (巨量、光速、暴风、无尽)
 * 1. 标准 AppleCMS V10 JSON 协议
 * 2. 100% 浏览器直连第三方源站 CDN，零代理、零切片修改
 * 3. 严格华语内容安全
 */

import { isCleanChineseTitle } from './types';

export interface CollectorSource {
  id: string;
  name: string;
  apiUrl: string;
  timeoutMs?: number;
}

export const BACKBONE_SOURCES: CollectorSource[] = [
  {
    id: 'guangsu',
    name: '光速资源',
    apiUrl: 'https://api.guangsuapi.com/api.php/provide/vod/',
    timeoutMs: 4000,
  },
  {
    id: 'juliang',
    name: '巨量资源',
    apiUrl: 'https://api.juliangzy.com/api.php/provide/vod/',
    timeoutMs: 4000,
  },
  {
    id: 'baofeng',
    name: '暴风资源',
    apiUrl: 'https://bfzyapi.com/api.php/provide/vod/',
    timeoutMs: 4000,
  },
  {
    id: 'wujin',
    name: '无尽资源',
    apiUrl: 'https://api.wujinapi.me/api.php/provide/vod/',
    timeoutMs: 4000,
  },
];

export async function searchCollectorSources(
  title: string,
  targetYear?: string
): Promise<{
  sourceId: string;
  vodName: string;
  episodes: Array<{ episode: string; url: string }>;
} | null> {
  if (!title || !title.trim()) return null;
  const cleanTitle = title.replace(/[《》【】\[\]（）()·\s:：\-]/g, ' ').trim();
  if (!isCleanChineseTitle(cleanTitle)) return null;

  const targetTitleNorm = cleanTitle.replace(/\s+/g, '').toLowerCase();

  // 并发请求各骨干源站
  const promises = BACKBONE_SOURCES.map(async (src) => {
    try {
      const url = `${src.apiUrl}?ac=detail&wd=${encodeURIComponent(cleanTitle)}`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), src.timeoutMs || 4000);

      const res = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
          'Accept': 'application/json',
        },
      });
      clearTimeout(timer);

      if (!res.ok) return null;
      const json: any = await res.json();
      const list = json.list || [];
      if (!Array.isArray(list) || list.length === 0) return null;

      // 匹配最佳条目
      const matched = list.find((it: any) => {
        const itName = (it.vod_name || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
        if (itName === targetTitleNorm) return true;
        if (targetYear && String(it.vod_year) === String(targetYear)) {
          return itName.includes(targetTitleNorm) || targetTitleNorm.includes(itName);
        }
        return false;
      }) || list[0];

      if (!matched || !matched.vod_play_url) return null;

      // 解析播放列表
      const playFrom = (matched.vod_play_from || '').split('$$$');
      const playUrls = (matched.vod_play_url || '').split('$$$');

      // 优选 m3u8 组
      let selectedIndex = 0;
      for (let i = 0; i < playFrom.length; i++) {
        if (playFrom[i].toLowerCase().includes('m3u8') && playUrls[i]?.trim()) {
          selectedIndex = i;
          break;
        }
      }

      const rawGroup = playUrls[selectedIndex] || playUrls[0] || '';
      const rawEpisodes = rawGroup.split('#');
      const episodes: Array<{ episode: string; url: string }> = [];

      for (let i = 0; i < rawEpisodes.length; i++) {
        const epStr = rawEpisodes[i].trim();
        if (!epStr) continue;

        if (epStr.includes('$')) {
          const [epName, epUrl] = epStr.split('$');
          if (epUrl && epUrl.startsWith('http')) {
            episodes.push({
              episode: epName.trim() || `第${i + 1}集`,
              url: epUrl.trim(),
            });
          }
        } else if (epStr.startsWith('http')) {
          episodes.push({
            episode: rawEpisodes.length === 1 ? '4K 极清' : `第${i + 1}集`,
            url: epStr,
          });
        }
      }

      if (episodes.length > 0) {
        return {
          sourceId: src.id,
          vodName: matched.vod_name || cleanTitle,
          episodes,
        };
      }
    } catch {
      // 单源超时或异常，平滑降级
    }
    return null;
  });

  const results = await Promise.all(promises);
  for (const res of results) {
    if (res && res.episodes.length > 0) {
      return res;
    }
  }

  return null;
}
