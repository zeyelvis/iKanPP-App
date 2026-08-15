/**
 * 影视智能关联词自动衍生引擎 (Automated Movie & TV Keyword Expansion Engine)
 * 基于海外华人（北美/欧洲/东南亚/澳新/港澳台）8 大核心搜索维度模型自动生成长尾词矩阵。
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
 * 8 大黄金维度全自动影视关联词衍生器
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

    // 1. 【核心与全网播放】
    keywords.add(rawTitle);
    if (cleanTitle !== rawTitle) keywords.add(cleanTitle);
    keywords.add(`${cleanTitle} 在线看`);
    keywords.add(`${cleanTitle} 免费观看`);
    keywords.add(`${cleanTitle} 高清完整版`);
    keywords.add(`${cleanTitle} 播放源`);

    // 2. 【追剧进度与未删减】
    if (isTV) {
        keywords.add(`${cleanTitle} 电视剧全集`);
        keywords.add(`${cleanTitle} 大结局在线看`);
        keywords.add(`${cleanTitle} 更新至第几集`);
        keywords.add(`${cleanTitle} 未删减版全集`);
        keywords.add(`${cleanTitle} 免费抢先看`);
    } else {
        keywords.add(`${cleanTitle} 电影免费播放`);
        keywords.add(`${cleanTitle} 完整版未删减`);
        keywords.add(`${cleanTitle} 院线大片在线看`);
    }

    // 3. 【海外痛点破局（免翻墙/解除限制）】
    keywords.add(`${cleanTitle} 海外看`);
    keywords.add(`${cleanTitle} 海外在线看`);
    keywords.add(`${cleanTitle} 海外免翻墙`);
    keywords.add(`${cleanTitle} 解除地区限制`);
    keywords.add(`${cleanTitle} 海外无版权限制`);

    // 4. 【地域专属（北美/欧洲/新马/澳新/港澳台）】
    keywords.add(`${cleanTitle} 北美看剧`);
    keywords.add(`${cleanTitle} 美国华人看电影`);
    keywords.add(`${cleanTitle} 加拿大华人影视`);
    keywords.add(`${cleanTitle} 欧洲看剧网站`);
    keywords.add(`${cleanTitle} 英国华人看电视`);
    keywords.add(`${cleanTitle} 澳洲华人看剧`);
    keywords.add(`${cleanTitle} 新马华人追剧`);
    keywords.add(`${cleanTitle} 繁體線上看`);
    keywords.add(`${cleanTitle} 粵語線上看`);

    // 5. 【画质与设备（大屏投屏/4K超清）】
    keywords.add(`${cleanTitle} 4K超清`);
    keywords.add(`${cleanTitle} 1080P蓝光画质`);
    keywords.add(`${cleanTitle} 电视投屏TV版`);
    keywords.add(`${cleanTitle} 无广告播放`);

    // 6. 【多语种与字幕（双语/英文字幕）】
    keywords.add(`${cleanTitle} 中英双字`);
    keywords.add(`${cleanTitle} 中文字幕高清`);
    keywords.add(`Watch ${cleanTitle} Online Free`);
    keywords.add(`${cleanTitle} English Subtitles`);
    keywords.add(`${cleanTitle} Eng Sub`);

    // 7. 【演职员与系列关联】
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

    // 8. 【口碑评分与年份】
    if (params.year) {
        keywords.add(`${params.year} ${cleanTitle}`);
        keywords.add(`${cleanTitle} (${params.year})`);
    } else {
        keywords.add(`2026 ${cleanTitle}`);
    }
    keywords.add(`${cleanTitle} 豆瓣评分`);
    keywords.add(`${cleanTitle} 知乎影评解析`);

    return Array.from(keywords);
}

/**
 * 针对搜索词生成动态关联推荐词（用于 UI 胶囊标签与站内深层内链）
 * 精选 8~10 个最高转化率的海外华人高频长尾词
 */
export function generateRelatedSearchTags(query: string): string[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const clean = trimmed
        .replace(/\s*第[一二三四五六七八九十\d]+季/, '')
        .replace(/\s*[（(][^)）]*[)）]/g, '')
        .trim();

    return [
        `${clean} 全集高清在线看`,
        `${clean} 4K超清完整版`,
        `${clean} 海外免翻墙直连`,
        `${clean} 未删减版`,
        `2026 ${clean}`,
        `${clean} 豆瓣评分/影评`,
        `${clean} 繁體線上看`,
        `${clean} 演员表/大结局`,
        `Watch ${clean} Eng Sub`,
    ];
}

