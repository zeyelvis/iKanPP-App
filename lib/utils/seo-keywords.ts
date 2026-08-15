/**
 * 影视智能关联词自动衍生引擎 (Automated Movie & TV Keyword Expansion Engine)
 * 自动根据影片片名、类型、年份及演职员，动态衍生全套多维度长尾搜索词。
 * 针对海外华人（北美/欧洲/东南亚/澳新/港澳台）高频搜索场景进行深度优化。
 */

export interface MovieKeywordParams {
    title: string;
    type?: 'movie' | 'tv' | string;
    year?: string;
    actors?: string[];
    directors?: string[];
    genre?: string[];
}

/**
 * 为单个影视条目自动生成全套长尾关联词
 */
export function generateMovieKeywords(params: MovieKeywordParams): string[] {
    const rawTitle = params.title.trim();
    if (!rawTitle) return [];

    // 清理片名中的季数/集数备注
    const cleanTitle = rawTitle
        .replace(/\s*第[一二三四五六七八九十\d]+季/, '')
        .replace(/\s*[Ss](?:eason)?\s*\d+/i, '')
        .replace(/\s*[（(][^)）]*[)）]/g, '')
        .trim();

    const isTV = params.type === 'tv' || /剧|季|连续剧/.test(rawTitle);
    const keywords: Set<string> = new Set();

    // 1. 核心与全网播放长尾词
    keywords.add(rawTitle);
    if (cleanTitle !== rawTitle) keywords.add(cleanTitle);
    keywords.add(`${cleanTitle} 在线看`);
    keywords.add(`${cleanTitle} 免费观看`);
    keywords.add(`${cleanTitle} 高清完整版`);
    keywords.add(`${cleanTitle} 4K超清`);

    if (isTV) {
        keywords.add(`${cleanTitle} 电视剧全集`);
        keywords.add(`${cleanTitle} 大结局在线看`);
        keywords.add(`${cleanTitle} 免费更新`);
    } else {
        keywords.add(`${cleanTitle} 电影免费播放`);
        keywords.add(`${cleanTitle} 完整版免费`);
    }

    // 2. 海外华人专属痛点词
    keywords.add(`${cleanTitle} 海外在线看`);
    keywords.add(`${cleanTitle} 北美看剧`);
    keywords.add(`${cleanTitle} 欧洲看电影`);
    keywords.add(`${cleanTitle} 海外免翻墙`);
    keywords.add(`${cleanTitle} 澳洲华人影视`);
    keywords.add(`${cleanTitle} 新马追剧`);

    // 3. 年份与长尾热词
    if (params.year) {
        keywords.add(`${params.year} ${cleanTitle}`);
        keywords.add(`${cleanTitle} (${params.year})`);
    } else {
        keywords.add(`2026 ${cleanTitle}`);
    }

    // 4. 演职员关联词
    if (params.actors && params.actors.length > 0) {
        params.actors.slice(0, 3).forEach((actor) => {
            const trimmed = actor.trim();
            if (trimmed) {
                keywords.add(`${trimmed} ${cleanTitle}`);
                keywords.add(`${cleanTitle} ${trimmed}主演`);
            }
        });
    }

    if (params.directors && params.directors.length > 0) {
        params.directors.slice(0, 2).forEach((director) => {
            const trimmed = director.trim();
            if (trimmed) {
                keywords.add(`${trimmed}导演 ${cleanTitle}`);
            }
        });
    }

    // 5. 国际化与英文/拼音词
    keywords.add(`Watch ${cleanTitle} Online Free`);
    keywords.add(`${cleanTitle} Eng Sub`);

    return Array.from(keywords);
}

/**
 * 针对搜索词生成动态关联推荐词（用于 UI 胶囊标签与站内深层内链）
 */
export function generateRelatedSearchTags(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const tags: string[] = [
        `${trimmed} 高清完整版`,
        `${trimmed} 全集在线看`,
        `${trimmed} 免费播放`,
        `${trimmed} 4K资源`,
        `${trimmed} 海外看`,
        `${trimmed} 演员表`,
        `2026 ${trimmed}`,
        `${trimmed} 大结局`,
        `Watch ${trimmed} Online`,
    ];

    return tags;
}
