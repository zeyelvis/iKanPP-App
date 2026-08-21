import { NextResponse } from 'next/server';

export const runtime = 'edge';

// TMDB API 配置
const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

/**
 * 用电影名搜索 TMDB，返回横版 Backdrop 图片 URL
 * GET /api/tmdb/trending?title=流浪地球&lang=zh-CN
 * POST /api/tmdb/trending body: { titles: ["流浪地球", "哪吒"] }
 */

/**
 * 清理标题中的季数、集数等后缀，提高 TMDB 搜索匹配率
 * 例如："七王国的骑士 第一季" → "七王国的骑士"
 *       "鱿鱼游戏 第二季" → "鱿鱼游戏"
 *       "某某剧(2025)" → "某某剧"
 */
function cleanTitle(title: string): string {
    return title
        // 去除中文季数：第一季、第二季、第1季...
        .replace(/\s*第[一二三四五六七八九十\d]+季/, '')
        // 去除英文季数：Season 1、S01...
        .replace(/\s*[Ss](?:eason)?\s*\d+/i, '')
        // 去除括号备注：(2025)、（更新至08集）
        .replace(/\s*[（(][^)）]*[)）]/g, '')
        // 去除集数：更新至XX集、全XX集
        .replace(/\s*(?:更新至|全)\d+集?/, '')
        .trim();
}

// 内部搜索函数（单次搜索）
// type: 'movie' 先搜电影再搜电视剧，'tv' 先搜电视剧再搜电影
// year: 可选年份，用于精确匹配
async function _searchTMDB(query: string, lang: string, type: 'movie' | 'tv' = 'movie', year?: string): Promise<{ full: string; thumb: string } | null> {
    // 根据 type 决定搜索顺序
    const endpoints = type === 'tv'
        ? ['search/tv', 'search/movie']   // 电视剧优先
        : ['search/movie', 'search/tv'];  // 电影优先

    for (const endpoint of endpoints) {
        try {
            let url = `${TMDB_BASE}/${endpoint}?api_key=${TMDB_API_KEY}&language=${lang}&query=${encodeURIComponent(query)}`;
            // 添加年份过滤：电影用 year，电视剧用 first_air_date_year
            if (year) {
                const yearNum = year.match(/\d{4}/)?.[0];
                if (yearNum) {
                    if (endpoint.includes('movie')) {
                        url += `&year=${yearNum}`;
                    } else {
                        url += `&first_air_date_year=${yearNum}`;
                    }
                }
            }
            const res = await fetch(url, {
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 86400 }
            });
            if (res.ok) {
                const data = await res.json();
                const match = (data.results || []).find((r: any) => r.backdrop_path);
                if (match) {
                    return {
                        full: `https://image.tmdb.org/t/p/w1280${match.backdrop_path}`,
                        thumb: `https://image.tmdb.org/t/p/w500${match.backdrop_path}`,
                    };
                }
            }
        } catch {
            // 继续尝试下一个类型
        }
    }

    return null;
}

// 单部影片搜索 → 返回 backdrop（大图 + 缩略图）
// 策略：带年份精确搜 → 清理标题+带年份 → 不带年份兜底 → 清理标题不带年份
async function searchBackdrop(title: string, lang: string, type: 'movie' | 'tv' = 'movie', year?: string): Promise<{ full: string; thumb: string } | null> {
    const cleaned = cleanTitle(title);
    const queries = [title];
    if (cleaned !== title && cleaned.length > 0) queries.push(cleaned);

    // 第一轮：带年份精确搜索（如果有年份）
    if (year) {
        for (const q of queries) {
            const result = await _searchTMDB(q, lang, type, year);
            if (result) return result;
        }
    }

    // 第二轮：不带年份兜底
    for (const q of queries) {
        const result = await _searchTMDB(q, lang, type);
        if (result) return result;
    }

    return null;
}

// 批量搜索：POST { items: [{title, year?}], type: 'movie'|'tv' }
// 兼容旧格式：POST { titles: [...], type }
export async function POST(request: Request) {
    if (!TMDB_API_KEY) {
        return NextResponse.json({ error: 'TMDB API Key not configured' }, { status: 500 });
    }

    try {
        const body = await request.json();
        const type = body.type || 'movie';
        const lang = body.lang || 'zh-CN';

        // 支持新格式 items: [{title, year}] 和旧格式 titles: [string]
        let items: { title: string; year?: string }[] = [];
        if (Array.isArray(body.items)) {
            items = body.items;
        } else if (Array.isArray(body.titles)) {
            items = body.titles.map((t: string) => ({ title: t }));
        }

        if (items.length === 0) {
            return NextResponse.json({ backdrops: {} });
        }

        // 并发搜索所有影片的 backdrop
        const results = await Promise.allSettled(
            items.map(async (item) => ({
                title: item.title,
                backdrop: await searchBackdrop(item.title, lang, type, item.year),
            }))
        );

        // 组装为 { "影片名": { full, thumb } } 映射
        const backdrops: Record<string, { full: string; thumb: string } | null> = {};
        results.forEach(r => {
            if (r.status === 'fulfilled' && r.value) {
                backdrops[r.value.title] = r.value.backdrop;
            }
        });

        return NextResponse.json({ backdrops }, {
            headers: {
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
                'CDN-Cache-Control': 'public, s-maxage=86400',
                'Cloudflare-CDN-Cache-Control': 'public, s-maxage=86400',
            },
        });
    } catch {
        return NextResponse.json({ backdrops: {} }, { status: 500 });
    }
}

// 单个搜索：GET ?title=xxx&type=movie|tv&year=2025
export async function GET(request: Request) {
    if (!TMDB_API_KEY) {
        return NextResponse.json({ error: 'TMDB API Key not configured' }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const title = searchParams.get('title') || '';
    const lang = searchParams.get('lang') || 'zh-CN';
    const type = (searchParams.get('type') as 'movie' | 'tv') || 'movie';
    const year = searchParams.get('year') || undefined;

    if (!title) {
        return NextResponse.json({ backdrop: null });
    }

    const result = await searchBackdrop(title, lang, type, year);
    return NextResponse.json(
        { backdrop: result?.full || null, thumb: result?.thumb || null },
        {
            headers: {
                'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
                'CDN-Cache-Control': 'public, s-maxage=86400',
                'Cloudflare-CDN-Cache-Control': 'public, s-maxage=86400',
            },
        }
    );
}

