import type {
    VideoSource,
    VideoDetail,
    ApiDetailResponse,
} from '@/lib/types';
import { fetchWithTimeout, withRetry } from './http-utils';
import { parseEpisodes } from './parsers';
import { safeParseResponse } from '@/lib/utils/safe-json';

/**
 * Get video detail from a single source
 */
export async function getVideoDetail(
    id: string | number,
    source: VideoSource,
    title?: string
): Promise<VideoDetail> {

    const baseUrl = source.baseUrl.replace(/\/+$/, '');
    const detailPath = source.detailPath.startsWith('/') ? source.detailPath : `/${source.detailPath}`;
    const url = new URL(`${baseUrl}${detailPath}`);
    url.searchParams.set('ac', 'detail');

    // 若 id 为纯数字（采集站原始 vod_id），优先通过 ids 精准单条直查；若为站内实体 ID (如 ik100710) 且有 title，使用 wd 关键词查询
    const isStationEntityId = String(id).startsWith('ik') || !/^\d+$/.test(String(id).trim());
    if (isStationEntityId && title) {
        url.searchParams.set('wd', title.replace(/[《》【】\[\]（）()·\s:：\-]/g, ' ').trim());
    } else {
        url.searchParams.set('ids', id.toString());
    }

    try {
        const response = await withRetry(async () => {
            const res = await fetchWithTimeout(url.toString(), {
                method: 'GET',
                headers: {
                    'User-Agent': 'Mozilla/5.0',
                    ...source.headers,
                },
            });

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${res.statusText}`);
            }

            return res;
        });

        let data: ApiDetailResponse = await safeParseResponse(response);

        // 若常规 ids 查不到且提供了 title，尝试用 wd 关键词进行容错挽救
        if ((!data.list || data.list.length === 0) && title) {
            try {
                const fallbackUrl = new URL(`${baseUrl}${detailPath}`);
                fallbackUrl.searchParams.set('ac', 'detail');
                fallbackUrl.searchParams.set('wd', title.replace(/[《》【】\[\]（）()·\s:：\-]/g, ' ').trim());
                const fbRes = await fetchWithTimeout(fallbackUrl.toString(), {
                    method: 'GET',
                    headers: { 'User-Agent': 'Mozilla/5.0', ...source.headers },
                });
                if (fbRes.ok) {
                    const fbData = await safeParseResponse(fbRes);
                    if (fbData.list && fbData.list.length > 0) {
                        data = fbData;
                    }
                }
            } catch { /* ignore fallback */ }
        }

        if (data.code !== 1 && data.code !== 0) {
            throw new Error(data.msg || 'Invalid API response');
        }

        if (!data.list || data.list.length === 0) {
            throw new Error('Video not found');
        }

        // 候选条目多级精准决选：
        // 1. 若列表中存在与传入 id 完全相等的条目，直接采纳
        let videoData = data.list.find((it: any) => String(it.vod_id) === String(id));

        // 2. 若未按 ID 命中且提供了片名 title，按片名精确匹配
        if (!videoData && title) {
            const cleanTarget = title.replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
            
            // 2.1 第一优先级：清洗后标题完全相等（精确匹配）
            const exactMatches = data.list.filter((it: any) => {
                const cleanCand = (it.vod_name || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
                return cleanCand === cleanTarget;
            });

            if (exactMatches.length > 0) {
                // 若有多个同名，优先挑有年份且年份最新的
                exactMatches.sort((a: any, b: any) => {
                    const yA = parseInt(a.vod_year || '0', 10) || 0;
                    const yB = parseInt(b.vod_year || '0', 10) || 0;
                    return yB - yA;
                });
                videoData = exactMatches[0];
            } else if (cleanTarget.length > 3) {
                // 2.2 第二优先级：严防短片名被反向吞噬！仅当目标标题长度 > 3 时允许受限子串匹配
                const subMatches = data.list.filter((it: any) => {
                    const cleanCand = (it.vod_name || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
                    return cleanCand.includes(cleanTarget) && Math.abs(cleanCand.length - cleanTarget.length) <= 3;
                });
                if (subMatches.length > 0) {
                    videoData = subMatches[0];
                }
            }
        }

        // 3. 兜底保障：若未提供 title 且未命中 ID，才回退到第一条
        if (!videoData) {
            if (!title) {
                videoData = data.list[0];
            } else {
                // 提供了 title 却未能精确匹配，坚决不张冠李戴返回错误影片
                throw new Error(`Video not found for title "${title}" in source ${source.name || source.id}`);
            }
        }

        // Handle multiple sources (separated by $$$)
        const playFrom = (videoData.vod_play_from || '').split('$$$');
        const playUrls = (videoData.vod_play_url || '').split('$$$');

        // Find the best source: prioritize m3u8, but ensure it has actual content
        let selectedIndex = -1;

        // 1. Try m3u8 sources first (only if they have actual URLs)
        for (let i = 0; i < playFrom.length; i++) {
            if (playFrom[i].toLowerCase().includes('m3u8') && playUrls[i]?.trim()) {
                selectedIndex = i;
                break;
            }
        }

        // 2. If no valid m3u8, fall back to any source with actual content
        if (selectedIndex === -1) {
            for (let i = 0; i < playUrls.length; i++) {
                if (playUrls[i]?.trim()) {
                    selectedIndex = i;
                    break;
                }
            }
        }

        // 3. If still nothing, use index 0 as last resort
        if (selectedIndex === -1) selectedIndex = 0;

        // Parse episodes from the selected source
        const episodes = parseEpisodes(playUrls[selectedIndex] || '');

        return {
            vod_id: videoData.vod_id,
            vod_name: videoData.vod_name,
            vod_pic: videoData.vod_pic,
            vod_remarks: videoData.vod_remarks,
            vod_year: videoData.vod_year,
            vod_area: videoData.vod_area,
            vod_actor: videoData.vod_actor,
            vod_director: videoData.vod_director,
            vod_content: videoData.vod_content,
            type_name: videoData.type_name,
            vod_lang: videoData.vod_lang,
            episodes,
            source: source.id,
            source_code: playFrom[selectedIndex] || '',
        };
    } catch (error) {
        console.error(`Detail fetch failed for source ${source.name}:`, error);
        throw {
            code: 'DETAIL_FAILED',
            message: `Failed to fetch video detail from ${source.name}`,
            source: source.id,
            retryable: false,
        };
    }
}
