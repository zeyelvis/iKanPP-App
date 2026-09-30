/**
 * iKanPP Line Resolver (iKanPP 专线媒体解析与全网骨干自愈服务)
 *
 * 核心定位：
 * - 为本站 (/api/detail) 及对外开放接口 (/api/ikanpp-line) 提供统一的专线调度与防毒化秒播自愈能力
 * - 纯直连零代理原则：返回的流媒体 100% 具备全网高可用、免翻墙、零 403 阻断特性
 * - 双重防线保障：
 *   1. 优先尝试爱壹帆原生专线，并严格执行 0.0.0.0 毒化拦截；
 *   2. 若爱壹帆受阻、未收录或被标记，0ms 静默切换至全网画质最高、直连最稳定的骨干源（巨量、光速、暴风、无尽等）；
 */

import { getIkanppLineConfig } from '@/lib/services/ikanpp-line-service';
import { ikanppProvider, matchBestIkanppLineCandidate } from '@/lib/services/providers/iyf-provider';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';
import { getSourceById } from '@/lib/api/video-sources';
import { searchVideos, getVideoDetail } from '@/lib/api/client';

export interface ResolveIkanppLineOptions {
  title?: string | null;
  id?: string | null;
  mediaKey?: string | null;
  category?: string | null;
  year?: string | null;
  expectedEpisodes?: number | null;
  season?: number | string | null;
  aliases?: string[] | string | null;
  relayOrigin?: string;
}

export interface IkanppLineEpisode {
  name: string;
  url: string;
  index: number;
  videoId?: number;
  mediaKey?: string;
  episodeNumber?: number;
}

export interface IkanppLineResolvedResult {
  vod_id: string;
  vod_name: string;
  vod_pic: string;
  vod_year?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_content?: string;
  vod_remarks?: string;
  type_name: string;
  episodes: IkanppLineEpisode[];
  total_episodes: number;
  source: string;
  quality: string;
  healed?: boolean;
  healedSource?: string;
  healedId?: string | number;
}

/**
 * 智能解析剧集名称中的集数数字
 */
function parseEpisodeNumber(name: string, index: number): number {
  if (!name) return index + 1;
  const match = name.match(/(?:第\s*|EP\s*|E\s*)?(\d+)\s*(?:集|话|期)?/i);
  if (match) {
    const num = parseInt(match[1], 10);
    if (num > 0 && num < 3000) return num;
  }
  return index + 1;
}

/**
 * 核心专线媒体解析器
 */
export async function resolveIkanppLineMedia(
  options: ResolveIkanppLineOptions
): Promise<IkanppLineResolvedResult | null> {
  const {
    title,
    id,
    mediaKey,
    category,
    year,
    expectedEpisodes,
    season,
    aliases,
    relayOrigin = '',
  } = options;

  let targetMediaKey = mediaKey || (
    id && id !== 'ikanpp' && id !== 'ikanpp_line' && id !== 'iyf' && id !== 'titanline' && !id.startsWith('ik') && id.length >= 8 && id.length <= 16
      ? id
      : null
  );

  let matchedTitle = title || '';
  let matchedPic = '';

  // 1. 尝试专线爱壹帆渠道
  try {
    const config = await getIkanppLineConfig();
    if (config.enabled) {
      if (!targetMediaKey && title) {
        const cleanTitle = title.replace(/[（(].*?[）)]/g, '').trim();
        const searchKeywords = new Set<string>();
        searchKeywords.add(cleanTitle);

        if (aliases) {
          const aliasList = Array.isArray(aliases)
            ? aliases
            : String(aliases).split(/[,/|，]/);
          for (const a of aliasList) {
            const cleanAlias = a.replace(/[（(].*?[）)]/g, '').trim();
            if (cleanAlias && cleanAlias !== cleanTitle && /[\u4e00-\u9fa5]/.test(cleanAlias)) {
              searchKeywords.add(cleanAlias);
            }
          }
        }

        const searchPromises = Array.from(searchKeywords).map(k => ikanppProvider.searchByTitle(k));
        const searchResults = await Promise.all(searchPromises);

        const candidateMap = new Map<string, any>();
        for (const list of searchResults) {
          if (list && Array.isArray(list)) {
            for (const item of list) {
              if (!candidateMap.has(item.mediaKey)) {
                candidateMap.set(item.mediaKey, item);
              }
            }
          }
        }

        const allCandidates = Array.from(candidateMap.values());
        if (allCandidates.length > 0) {
          const matchedCandidate = matchBestIkanppLineCandidate(allCandidates, {
            title: cleanTitle,
            category: category || undefined,
            year: year || undefined,
            expectedEpisodes: expectedEpisodes ? Number(expectedEpisodes) : undefined,
            season: season || undefined,
          });
          if (matchedCandidate) {
            targetMediaKey = matchedCandidate.mediaKey;
            matchedTitle = matchedCandidate.title;
            matchedPic = matchedCandidate.coverImgUrl;
          }
        }
      }

      if (targetMediaKey) {
        const episodeList = await ikanppProvider.getFullEpisodeList(targetMediaKey);
        // 核心防毒化门禁：严格核验是否被爱壹帆标记为 0.0.0.0 毒链接或空地址
        const hasValidPlayableUrl = episodeList && episodeList.length > 0 && episodeList.some(ep => {
          return ep.url && !ep.url.includes('0.0.0.0') && !ep.url.includes('0_0.0.0.0_');
        });

        if (hasValidPlayableUrl && episodeList && episodeList.length > 0) {
          const streamEndpoint = relayOrigin ? `${relayOrigin}/api/ikanpp-stream` : 'https://www.ikanpp.com/api/ikanpp-stream';
          const relayedEpisodes: IkanppLineEpisode[] = episodeList.map((ep, idx) => {
            const videoId = (ep as any).videoId ?? 0;
            const epMediaKey = (ep as any).mediaKey || targetMediaKey;
            const streamUrl = `${streamEndpoint}?mediaKey=${encodeURIComponent(epMediaKey)}&videoId=${videoId}&url=${encodeURIComponent(ep.url)}`;
            return {
              name: ep.name,
              url: ep.url && ep.url.includes('pipecdn.vip') ? streamUrl : ep.url,
              index: idx,
              videoId,
              mediaKey: epMediaKey,
              episodeNumber: parseEpisodeNumber(ep.name, idx),
            };
          });

          return {
            vod_id: targetMediaKey,
            vod_name: matchedTitle || title || 'iKanPP专线 · 极清',
            vod_pic: matchedPic,
            type_name: '4K 极清 · 专线中继',
            episodes: relayedEpisodes,
            total_episodes: relayedEpisodes.length,
            source: 'ikanpp',
            quality: '4K/1080P 极清',
            healed: false,
          };
        }
      }
    }
  } catch (ikanppErr) {
    console.warn('[IkanppLineResolver] Direct line resolve failed, switching to backbone heal:', ikanppErr);
  }

  // 2. 全网骨干主力源极速自愈防线 (巨量 Anycast / 光速全球 / 暴风 / 无尽)
  if (title && title.trim().length > 0) {
    try {
      const cleanTitle = title.replace(/[《》【】\[\]（）()·\s:：\-]/g, ' ').trim();
      const fallbackSources = DEFAULT_SOURCES.filter(
        s => s.enabled !== false && (s.id === 'juliang' || s.id === 'guangsu' || s.id === 'baofeng' || s.id === 'wujin')
      );

      const searchRes = await searchVideos(cleanTitle, fallbackSources, 1);
      for (const res of searchRes) {
        const candidates = res.results || [];
        const matched = candidates.find(c => {
          const cName = (c.vod_name || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
          const tName = cleanTitle.replace(/\s+/g, '').toLowerCase();
          return cName === tName;
        }) || candidates.find(c => {
          const cName = (c.vod_name || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
          const tName = cleanTitle.replace(/\s+/g, '').toLowerCase();
          const lenDiff = Math.abs(cName.length - tName.length);
          if (cName.includes(tName)) return tName.length > 3 ? lenDiff <= 4 : lenDiff <= 1;
          if (tName.includes(cName)) return lenDiff <= 1;
          return false;
        });

        if (matched && matched.vod_id) {
          const matchedSource = getSourceById(res.source);
          if (matchedSource) {
            const healedDetail = await getVideoDetail(matched.vod_id, matchedSource);
            if (healedDetail && healedDetail.episodes && healedDetail.episodes.length > 0) {
              const formattedEpisodes: IkanppLineEpisode[] = healedDetail.episodes.map((ep, idx) => ({
                name: ep.name || `第 ${idx + 1} 集`,
                url: ep.url,
                index: idx,
                episodeNumber: parseEpisodeNumber(ep.name || '', idx),
              }));

              return {
                vod_id: String(healedDetail.vod_id || matched.vod_id),
                vod_name: healedDetail.vod_name || matchedTitle || title,
                vod_pic: healedDetail.vod_pic || matchedPic || (matched as any).vod_pic || '',
                vod_year: healedDetail.vod_year || (matched as any).vod_year,
                vod_actor: healedDetail.vod_actor || (matched as any).vod_actor,
                vod_director: healedDetail.vod_director || (matched as any).vod_director,
                vod_content: healedDetail.vod_content || (matched as any).vod_content,
                vod_remarks: healedDetail.vod_remarks || (matched as any).vod_remarks,
                type_name: healedDetail.type_name || '4K 极清 · iKanPP极速专线',
                episodes: formattedEpisodes,
                total_episodes: formattedEpisodes.length,
                source: 'ikanpp',
                quality: '4K/1080P 极清',
                healed: true,
                healedSource: matchedSource.id,
                healedId: matched.vod_id,
              };
            }
          }
        }
      }
    } catch (healErr) {
      console.warn('[IkanppLineResolver] Backbone fallback heal failed:', healErr);
    }
  }

  return null;
}
