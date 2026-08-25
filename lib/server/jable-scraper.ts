/**
 * Jable.tv 官方全站流媒体数据抓取与解析引擎
 * 
 * 功能：
 * 1. 抓取 Jable 官方今日最热、本周热门、本月封神、最新上架、分类标签与关键词搜索
 * 2. 精准提取视频番号 (如 SSIS-123)、真实时长、点赞率、播放数与原版高清封面
 * 3. 内置高拟真浏览器请求指纹 (User-Agent, Referer, Accept)
 * 4. 内置边缘内存缓存 (S-Maxage 15~30 分钟)，避免重复请求
 */

export interface JableVideoItem {
    vod_id: string;
    vod_name: string;
    video_code?: string;
    vod_pic: string;
    preview_url?: string;
    vod_remarks?: string;
    duration?: string;
    views?: string;
    likes?: string;
    rating?: number;
    actors?: string[];
    tags?: string[];
    detail_url?: string;
    source: 'jable';
}

// 边缘内存缓存
const CACHE_TTL = 20 * 60 * 1000; // 20 分钟缓存
const jableMemoryCache = new Map<string, { data: JableVideoItem[]; timestamp: number }>();

function getJableCached(key: string): JableVideoItem[] | null {
    const entry = jableMemoryCache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        jableMemoryCache.delete(key);
        return null;
    }
    return entry.data;
}

function setJableCache(key: string, data: JableVideoItem[]): void {
    if (jableMemoryCache.size > 200) {
        const oldest = jableMemoryCache.keys().next().value;
        if (oldest) jableMemoryCache.delete(oldest);
    }
    jableMemoryCache.set(key, { data, timestamp: Date.now() });
}

// 模拟真实浏览器请求头
const FAKE_HEADERS = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7,ja;q=0.6',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Ch-Ua': '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"Windows"',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
};

/**
 * 从 HTML 中精准解析 Jable 视频卡片
 */
export function parseJableHtml(html: string): JableVideoItem[] {
    const videos: JableVideoItem[] = [];
    const seenIds = new Set<string>();

    const cardRegex = /<div\s+class="[^"]*(?:video-img-box|img-box|video-elem)[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    let match;

    while ((match = cardRegex.exec(html)) !== null) {
        const block = match[1];

        // 1. 提取链接和 ID
        const linkMatch = block.match(/href="(?:https?:\/\/jable\.tv)?\/videos\/([^"/]+)\/?"/i);
        if (!linkMatch) continue;
        const videoId = linkMatch[1];
        if (seenIds.has(videoId)) continue;
        seenIds.add(videoId);

        // 2. 提取封面图与官方动态预览视频链接
        const imgMatch = block.match(/data-src="([^"]+)"/i) || block.match(/src="([^"]+)"/i);
        let pic = imgMatch ? imgMatch[1] : '';
        if (pic.startsWith('//')) {
            pic = 'https:' + pic;
        }

        const previewMatch = block.match(/data-preview="([^"]+)"/i) || block.match(/preview="([^"]+)"/i);
        let previewUrl = previewMatch ? previewMatch[1] : undefined;
        if (!previewUrl && pic && (pic.includes('jable.tv') || pic.includes('videos_screenshots'))) {
            previewUrl = pic.replace(/\/320x180\/[0-9]+\.jpg/i, '/preview.mp4').replace(/\/preview\.jpg/i, '/preview.mp4');
        }
        if (previewUrl && previewUrl.startsWith('//')) {
            previewUrl = 'https:' + previewUrl;
        }

        // 3. 提取标题
        const titleMatch = block.match(/<h6[^>]*class="title"[^>]*>[\s\S]*?<a[^>]*>([\s\S]*?)<\/a>/i) ||
                           block.match(/alt="([^"]+)"/i) ||
                           block.match(/title="([^"]+)"/i);
        let title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : videoId;

        // 4. 智能提取番号 (如 SSIS-123, FC2-PPV-123456, IPX-999 等)
        const codeMatch = title.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
        const videoCode = codeMatch ? codeMatch[0].toUpperCase() : undefined;

        // 5. 提取时长
        const durationMatch = block.match(/<span\s+class="label"[^>]*>([\d:]+)<\/span>/i);
        const duration = durationMatch ? durationMatch[1] : undefined;

        // 6. 提取观看数与点赞数
        const viewsMatch = block.match(/class="sub-title"[^>]*>[\s\S]*?(\d+(?:\.\d+)?[KMk万]?)\s*次[瀏覽|浏览]/i);
        const views = viewsMatch ? viewsMatch[1] : undefined;

        const likesMatch = block.match(/(\d+)%/);
        const likes = likesMatch ? `${likesMatch[1]}%` : undefined;
        const rating = likesMatch ? parseInt(likesMatch[1]) : 95;

        videos.push({
            vod_id: videoId,
            vod_name: title,
            video_code: videoCode,
            vod_pic: pic,
            preview_url: previewUrl,
            vod_remarks: duration ? `${duration} · ${likes || '98%'}` : (likes || '4K 原画'),
            duration,
            views,
            likes,
            rating,
            detail_url: `https://jable.tv/videos/${videoId}/`,
            source: 'jable',
        });
    }

    return videos;
}

/**
 * 请求 Jable 页面并解析（带超时与缓存）
 */
export async function fetchJableList(
    path: string,
    params: Record<string, string> = {}
): Promise<JableVideoItem[]> {
    const url = new URL(`https://jable.tv${path.startsWith('/') ? path : '/' + path}`);
    for (const [k, v] of Object.entries(params)) {
        if (v) url.searchParams.set(k, v);
    }

    const cacheKey = url.toString();
    const cached = getJableCached(cacheKey);
    if (cached && cached.length > 0) {
        return cached;
    }

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500); // 3.5秒超时保护

        const response = await fetch(url.toString(), {
            headers: {
                ...FAKE_HEADERS,
                'Referer': 'https://jable.tv/',
            },
            signal: controller.signal,
            next: { revalidate: 1800 },
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
            console.warn(`[JableScraper] HTTP ${response.status} from ${url}`);
            return [];
        }

        const html = await response.text();
        const items = parseJableHtml(html);

        if (items.length > 0) {
            setJableCache(cacheKey, items);
        }

        return items;
    } catch (err) {
        console.error(`[JableScraper] Error fetching ${url}:`, err);
        return [];
    }
}

/**
 * 抓取 Jable 视频播放详情页（用于解析真实 M3U8 流）
 */
export async function fetchJableVideoDetail(videoId: string): Promise<{
    title: string;
    hlsUrl?: string;
    videoCode?: string;
    cover?: string;
    actors?: string[];
    tags?: string[];
} | null> {
    const url = `https://jable.tv/videos/${videoId}/`;

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);

        const response = await fetch(url, {
            headers: {
                ...FAKE_HEADERS,
                'Referer': 'https://jable.tv/',
            },
            signal: controller.signal,
        });

        clearTimeout(timeoutId);
        if (!response.ok) return null;

        const html = await response.text();

        // 提取标题
        const titleMatch = html.match(/<h4[^>]*>([^<]+)<\/h4>/i) || html.match(/<title>([^<]+)<\/title>/i);
        const title = titleMatch ? titleMatch[1].replace(/- Jable\.TV.*/i, '').trim() : videoId;

        // 提取番号
        const codeMatch = title.match(/([A-Za-z0-9]{2,8}[-_][0-9]{3,8}|FC2[-_]PPV[-_][0-9]{5,8}|T28[-_][0-9]{3,5})/i);
        const videoCode = codeMatch ? codeMatch[0].toUpperCase() : undefined;

        // 提取原生 HLS M3U8 地址
        const hlsMatch = html.match(/var\s+hlsUrl\s*=\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                         html.match(/hlsUrl:\s*["']([^"']+\.m3u8[^"']*)["']/i) ||
                         html.match(/<source\s+src="([^"]+\.m3u8[^"]*)"/i);
        const hlsUrl = hlsMatch ? hlsMatch[1] : undefined;

        // 提取封面图
        const posterMatch = html.match(/poster="([^"]+)"/i) || html.match(/property="og:image"\s+content="([^"]+)"/i);
        const cover = posterMatch ? posterMatch[1] : undefined;

        // 提取标签与女优
        const actors: string[] = [];
        const actorMatches = html.matchAll(/<a[^>]*href="[^"]*\/models\/[^"]*"[^>]*>([^<]+)<\/a>/gi);
        for (const m of actorMatches) {
            if (m[1] && !actors.includes(m[1].trim())) {
                actors.push(m[1].trim());
            }
        }

        const tags: string[] = [];
        const tagMatches = html.matchAll(/<a[^>]*href="[^"]*\/categories\/[^"]*"[^>]*>([^<]+)<\/a>/gi);
        for (const m of tagMatches) {
            if (m[1] && !tags.includes(m[1].trim())) {
                tags.push(m[1].trim());
            }
        }

        return {
            title,
            hlsUrl,
            videoCode,
            cover,
            actors,
            tags,
        };
    } catch (err) {
        console.error(`[JableScraper] Failed to fetch video detail for ${videoId}:`, err);
        return null;
    }
}
