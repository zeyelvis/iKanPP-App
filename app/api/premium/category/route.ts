import { NextResponse } from 'next/server';
import { PREMIUM_SOURCES } from '@/lib/api/premium-sources';
import { isSafeExternalUrl } from '@/lib/utils/security';

export const runtime = 'edge';

// ==================== 内存缓存 ====================
const CACHE_TTL = 30 * 60 * 1000; // 30 分钟
const cache = new Map<string, { data: any[]; timestamp: number }>();

function getCached(key: string): any[] | null {
    const entry = cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > CACHE_TTL) {
        cache.delete(key);
        return null;
    }
    return entry.data;
}

function setCache(key: string, data: any[]): void {
    if (cache.size > 200) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
    }
    cache.set(key, { data, timestamp: Date.now() });
}

// ==================== 工具函数 ====================

function buildSourceUrl(source: any): URL {
    const base = source.baseUrl.replace(/\/$/, '');
    const path = source.searchPath || source.detailPath || '';
    return new URL(base + path);
}

/**
 * 从单个源高速获取数据（严格 2 秒超时）
 */
async function fetchFromSource(source: any, params: Record<string, string>): Promise<any[]> {
    try {
        if (!source || !isSafeExternalUrl(source.baseUrl)) return [];
        const url = buildSourceUrl(source);
        for (const [k, v] of Object.entries(params)) {
            url.searchParams.set(k, v);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000); // 极速 2 秒超时

        const response = await fetch(url.toString(), {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
                Accept: 'application/json, text/plain, */*',
            },
            next: { revalidate: 1800 },
        });

        clearTimeout(timeoutId);
        if (!response.ok) return [];

        const data = await response.json();
        return (data.list || []).map((item: any) => ({
            vod_id: item.vod_id,
            vod_name: item.vod_name,
            vod_pic: item.vod_pic,
            vod_remarks: item.vod_remarks,
            type_name: item.type_name,
            source: source.id,
        }));
    } catch {
        return [];
    }
}

/**
 * 智能交错合并多源结果并去重
 */
function interleaveAndDeduplicate(results: any[][]): any[] {
    const interleaved: any[] = [];
    const seenNames = new Set<string>();
    const maxLen = Math.max(...results.map(r => r.length), 0);

    for (let i = 0; i < maxLen; i++) {
        for (let j = 0; j < results.length; j++) {
            const item = results[j][i];
            if (item && item.vod_name) {
                const normalized = item.vod_name.trim().toLowerCase();
                if (!seenNames.has(normalized)) {
                    seenNames.add(normalized);
                    interleaved.push(item);
                }
            }
        }
    }
    return interleaved;
}

// ==================== 核心极速聚合处理 ====================

async function handleCategoryRequest(
    sourceList: any[],
    categoryParam: string,
    page: number,
    limit: number
) {
    try {
        const enabledSources = sourceList.filter(s => s && s.enabled !== false && isSafeExternalUrl(s.baseUrl));

        if (enabledSources.length === 0) {
            return NextResponse.json({ videos: [], error: 'No enabled sources' }, { status: 500 });
        }

        // 标准化缓存 key（基于 category 和 page）
        const cacheKey = `${categoryParam || '_all_'}:${page}`;

        // 检查边缘内存缓存
        const cached = getCached(cacheKey);
        if (cached && cached.length > 0) {
            return NextResponse.json({ videos: cached, fromCache: true }, {
                headers: {
                    'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
                    'CDN-Cache-Control': 'public, s-maxage=900',
                }
            });
        }

        const isKeywordSearch = categoryParam && !categoryParam.includes(':');

        // 构建请求参数
        const sourceMap = new Map<string, string>();
        if (categoryParam && !isKeywordSearch) {
            categoryParam.split(',').forEach(part => {
                if (part.includes(':')) {
                    const [sId, tId] = part.split(':');
                    sourceMap.set(sId, tId);
                }
            });
        }

        const targetSources = sourceMap.size > 0
            ? enabledSources.filter(s => sourceMap.has(s.id))
            : enabledSources;

        // 为避免并发爆炸，选取优先级最高的 10 个源并发竞速
        const activeSources = targetSources.slice(0, 10);

        const fetchPromises = activeSources.map(s => {
            const params: Record<string, string> = { ac: 'detail', pg: page.toString() };
            if (isKeywordSearch) {
                params.wd = categoryParam;
            } else if (sourceMap.has(s.id)) {
                params.t = sourceMap.get(s.id)!;
            }
            return fetchFromSource(s, params);
        });

        // 极速竞速聚合机制：最多等待 2.2 秒，绝不卡死
        const timeoutPromise = new Promise<any[]>((resolve) => setTimeout(() => resolve([]), 2200));

        const settledResults = await Promise.race([
            Promise.allSettled(fetchPromises),
            timeoutPromise.then(() => [])
        ]);

        const validResults: any[][] = Array.isArray(settledResults) && settledResults.length > 0
            ? settledResults
                .map(r => r.status === 'fulfilled' ? r.value : [])
                .filter(arr => arr && arr.length > 0)
            : [];

        let videos = interleaveAndDeduplicate(validResults);

        // 如果本次成功拿到有效结果，写入缓存
        if (videos.length > 0) {
            setCache(cacheKey, videos);
        }

        return NextResponse.json({ videos }, {
            headers: {
                'Cache-Control': 'public, s-maxage=900, stale-while-revalidate=86400',
                'CDN-Cache-Control': 'public, s-maxage=900',
            }
        });

    } catch (error) {
        console.error('Category content error:', error);
        return NextResponse.json(
            { videos: [], error: 'Failed to fetch category content' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { sources, category, page, limit } = body;

        return await handleCategoryRequest(
            sources && sources.length > 0 ? sources : PREMIUM_SOURCES,
            category || '',
            parseInt(page || '1'),
            parseInt(limit || '20')
        );
    } catch {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const categoryParam = searchParams.get('category') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    return await handleCategoryRequest(PREMIUM_SOURCES, categoryParam, page, limit);
}
