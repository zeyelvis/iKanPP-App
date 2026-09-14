import type {
    VideoSource,
    VideoDetail,
    ApiDetailResponse,
} from '@/lib/types';
import { fetchWithTimeout, withRetry } from './http-utils';
import { parseEpisodes } from './parsers';
import { getOlevodDetail } from '@/lib/server/olevod';

/**
 * Get video detail from a single source
 */
export async function getVideoDetail(
    id: string | number,
    source: VideoSource
): Promise<VideoDetail> {
    if (source.id === 'ole_vip' || source.id === 'ole_hd') {
        const quality = source.id === 'ole_vip' ? '1080p' : '720p';
        const detail = await getOlevodDetail(id, quality);
        if (!detail) throw new Error(`Video not found in Olevod (${quality})`);
        return {
            vod_id: detail.vod_id,
            vod_name: detail.vod_name,
            vod_pic: detail.vod_pic || '',
            vod_year: detail.vod_year,
            vod_content: detail.vod_content,
            vod_actor: detail.vod_actor,
            vod_director: detail.vod_director,
            type_name: detail.type_name,
            episodes: detail.episodes,
            source: source.id,
            source_code: source.id,
        };
    }

    const url = new URL(`${source.baseUrl}${source.detailPath}`);
    url.searchParams.set('ac', 'detail');
    url.searchParams.set('ids', id.toString());

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

        const data: ApiDetailResponse = await response.json();

        if (data.code !== 1 && data.code !== 0) {
            throw new Error(data.msg || 'Invalid API response');
        }

        if (!data.list || data.list.length === 0) {
            throw new Error('Video not found');
        }

        const videoData = data.list[0];

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
