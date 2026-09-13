/**
 * API Response Parsers
 */

import type { Episode } from '@/lib/types';
import { sanitizeStreamUrl } from '@/lib/utils/stream-sanitizer';

/**
 * Parse episode URL string into structured array
 */
export function parseEpisodes(playUrl: string): Episode[] {
    if (!playUrl) return [];

    try {
        // Format: "Episode1$url1#Episode2$url2#..."
        const episodes = playUrl.split('#').filter(Boolean);

        return episodes.map((episode, index) => {
            const parts = episode.split('$');
            let name: string, url: string;

            if (parts.length > 1) {
                name = parts[0];
                url = parts[1];
            } else {
                // If no '$' separator, treat the whole thing as the URL
                url = parts[0];
                name = `第 ${index + 1} 集`;
            }

            // Clean up URL: remove double slashes but keep protocol (http:// or https://)
            const cleanUrl = (url || '').replace(/([^:])\/\//g, '$1/');
            // 防污染与域名自动热修复
            const sanitizedUrl = sanitizeStreamUrl(cleanUrl);

            return {
                name: name || `第 ${index + 1} 集`,
                url: sanitizedUrl,
                index,
            };
        });
    } catch (error) {
        console.error('Failed to parse episodes:', error);
        return [];
    }
}

