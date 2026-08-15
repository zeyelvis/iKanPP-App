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
    // 限制缓存大小（最多 100 个 key）
    if (cache.size > 100) {
        const oldest = cache.keys().next().value;
        if (oldest) cache.delete(oldest);
    }
    cache.set(key, { data, timestamp: Date.now() });
}

// ==================== 工具函数 ====================

/**
 * 构建正确的采集站 API URL
 */
function buildSourceUrl(source: any): URL {
    const base = source.baseUrl.replace(/\/$/, '');
    const path = source.searchPath || source.detailPath || '';
    return new URL(base + path);
}

/**
 * 从单个源获取数据
 */
async function fetchFromSource(source: any, params: Record<string, string>): Promise<any[]> {
    try {
        if (!source || !isSafeExternalUrl(source.baseUrl)) return [];
        const url = buildSourceUrl(source);
        for (const [k, v] of Object.entries(params)) {
            url.searchParams.set(k, v);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000); // 4 秒超时

        const response = await fetch(url.toString(), {
            signal: controller.signal,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
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
 * 交错合并多源结果
 */
function interleaveResults(results: any[][]): any[] {
    const interleaved: any[] = [];
    const maxLen = Math.max(...results.map(r => r.length), 0);
    for (let i = 0; i < maxLen; i++) {
        for (let j = 0; j < results.length; j++) {
            if (results[j][i]) {
                interleaved.push(results[j][i]);
            }
        }
    }
    return interleaved;
}

// ==================== 核心处理 ====================

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

        // 缓存 key
        const sourceIds = enabledSources.map(s => s.id).sort().join(',');
        const cacheKey = `${categoryParam || '_all_'}:${page}:${sourceIds}`;

        // 检查缓存
        const cached = getCached(cacheKey);
        if (cached) {
            return NextResponse.json({ videos: cached, fromCache: true });
        }

        const isKeywordSearch = categoryParam && !categoryParam.includes(':');

        if (isKeywordSearch) {
            // ========== 关键词搜索模式 ==========
            // 分批：前 5 个优先源 + 剩余源并行
            const prioritySources = enabledSources.slice(0, 5);
            const restSources = enabledSources.slice(5);

            const params = { ac: 'detail', wd: categoryParam, pg: page.toString() };

            // 第 1 批：优先源
            const priorityResults = await Promise.all(
                prioritySources.map(s => fetchFromSource(s, params))
            );

            // 第 2 批：剩余源（与第 1 批并行开始但不等待）
            const restPromise = restSources.length > 0
                ? Promise.all(restSources.map(s => fetchFromSource(s, params)))
                : Promise.resolve([]);

            // 先用优先源结果
            let allResults = [...priorityResults];

            // 等待剩余源（最多再等 3 秒）
            try {
                const restResults = await Promise.race([
                    restPromise,
                    new Promise<any[][]>((resolve) => setTimeout(() => resolve([]), 3000))
                ]);
                allResults = [...allResults, ...restResults];
            } catch {
                // 剩余源超时，只用优先源结果
            }

            const videos = interleaveResults(allResults);
            setCache(cacheKey, videos);
            return NextResponse.json({ videos });
        }

        // ========== 分类模式 ==========
        const sourceMap = new Map<string, string>();

        if (categoryParam) {
            categoryParam.split(',').forEach(part => {
                if (part.includes(':')) {
                    const [sId, tId] = part.split(':');
                    sourceMap.set(sId, tId);
                }
            });
        }

        let targetSources = sourceMap.size > 0
            ? enabledSources.filter(s => sourceMap.has(s.id))
            : enabledSources;

        if (targetSources.length === 0) {
            return NextResponse.json({ videos: [], error: 'No matching sources' }, { status: 500 });
        }

        // 分批请求
        const prioritySources = targetSources.slice(0, 5);
        const restSources = targetSources.slice(5);

        const buildParams = (source: any) => {
            const p: Record<string, string> = { ac: 'detail', pg: page.toString() };
            if (sourceMap.has(source.id)) {
                p.t = sourceMap.get(source.id)!;
            }
            return p;
        };

        // 第 1 批
        const priorityResults = await Promise.all(
            prioritySources.map(s => fetchFromSource(s, buildParams(s)))
        );

        // 第 2 批
        const restPromise = restSources.length > 0
            ? Promise.all(restSources.map(s => fetchFromSource(s, buildParams(s))))
            : Promise.resolve([]);

        let allResults = [...priorityResults];

        try {
            const restResults = await Promise.race([
                restPromise,
                new Promise<any[][]>((resolve) => setTimeout(() => resolve([]), 3000))
            ]);
            allResults = [...allResults, ...restResults];
        } catch {
            // 超时
        }

        const videos = interleaveResults(allResults);
        setCache(cacheKey, videos);
        return NextResponse.json({ videos });

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
            sources || [],
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
