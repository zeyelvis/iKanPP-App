import { NextRequest, NextResponse } from 'next/server';
import { HUAREN_REAL_SECTIONS, HuarenRealSection, HuarenRealCard, HuarenRealRank } from '@/lib/data/huaren-real-data';

export const runtime = 'nodejs';

// 内存缓存
let liveSectionsCache: { data: HuarenRealSection[]; timestamp: number } | null = null;
const CACHE_TTL_MS = 15 * 60 * 1000; // 15分钟自动刷新一次最新数据

/**
 * 从 HTML 动态提取板块数据
 */
function extractSectionsFromHTML(html: string): HuarenRealSection[] | null {
    try {
        if (!html || html.length < 20000 || !html.includes('最新电影')) {
            return null;
        }

        const extractCardsAndRanks = (startTag: string, endTag: string) => {
            const p1 = html.indexOf(startTag);
            if (p1 === -1) return { cards: [], rankings: [] };
            const p2 = endTag ? html.indexOf(endTag, p1 + startTag.length) : html.length;
            const chunk = html.substring(p1, p2 !== -1 ? p2 : html.length);

            const cards: HuarenRealCard[] = [];
            // 卡片正则
            const cardRegex = /<div class="public-list-box[^"]*">[\s\S]*?(?=<div class="public-list-box|class="this-right"|$)/g;
            let m;
            while ((m = cardRegex.exec(chunk)) !== null) {
                const cChunk = m[0];
                const vidM = cChunk.match(/href="\/voddetail\/(\d+)\.html"\s+title="([^"]+)"/);
                if (!vidM) continue;

                const vid = vidM[1];
                const title = vidM[2].trim();

                const imgM = cChunk.match(/data-src="([^"]+)"/);
                const cover = imgM ? imgM[1].trim() : '';

                const badgeM = cChunk.match(/<span class="public-prt[^"]*">([^<]+)<\/span>/);
                const badge = badgeM ? badgeM[1].trim() : '';

                const descM = cChunk.match(/<div class="public-list-subtitle[^"]*">([^<]*)<\/div>/);
                const desc = descM ? descM[1].trim() : '暂无简介';

                const epM = cChunk.match(/<span class="public-list-prb[^"]*">([^<]+)<\/span>/);
                const episode = epM ? epM[1].trim() : '全';

                // 自动徽章颜色
                let badgeColor = 'bg-emerald-500 text-white';
                if (badge.includes('喜剧') || badge.includes('爱情')) badgeColor = 'bg-emerald-500 text-white';
                else if (badge.includes('剧情') || badge.includes('古装') || badge.includes('动作')) badgeColor = 'bg-blue-500 text-white';
                else if (badge.includes('悬疑') || badge.includes('热榜') || badge.includes('推荐')) badgeColor = 'bg-amber-500 text-black font-black';
                else if (badge.includes('恐怖') || badge.includes('惊悚')) badgeColor = 'bg-purple-600 text-white';
                else if (badge.includes('推理') || badge.includes('探案')) badgeColor = 'bg-cyan-500 text-white';

                cards.push({
                    vodId: vid,
                    title,
                    cover,
                    badge,
                    badgeColor,
                    episode,
                    desc,
                });
            }

            // 榜单
            const rankings: HuarenRealRank[] = [];
            const rPos = chunk.indexOf('榜单');
            if (rPos !== -1) {
                const rChunk = chunk.substring(rPos);
                const rankRegex = /<span class="vod-on-e-styles key(\d+)[^"]*">(\d+)<\/span>[\s\S]*?<span class="vod-title" title="([^"]+)">[\s\S]*?<span class="vod-sub-text[^"]*">([^<]+)<\/span>/g;
                let rm;
                while ((rm = rankRegex.exec(rChunk)) !== null) {
                    rankings.push({
                        rank: parseInt(rm[2], 10),
                        title: rm[3].trim(),
                        status: rm[4].trim(),
                    });
                }
            }

            return { cards, rankings };
        };

        const movieData = extractCardsAndRanks('最新电影', '最新剧集');
        const tvData = extractCardsAndRanks('最新剧集', '最新综艺');
        const varietyData = extractCardsAndRanks('最新综艺', '最热动漫');
        const animeData = extractCardsAndRanks('最热动漫', '友情链接');

        if (movieData.cards.length === 0 && tvData.cards.length === 0) {
            return null;
        }

        const sections: HuarenRealSection[] = [
            {
                id: 'movies',
                title: '最新电影',
                rankTitle: '最新电影榜单',
                type: 'movie',
                tags: ['奇幻科幻', '战争犯罪', '悬疑恐怖惊悚', '爱情喜剧剧情', '动作冒险灾难', '动画电影'],
                cards: movieData.cards.length > 0 ? movieData.cards : HUAREN_REAL_SECTIONS[0].cards,
                rankings: movieData.rankings.length > 0 ? movieData.rankings : HUAREN_REAL_SECTIONS[0].rankings,
            },
            {
                id: 'tvs',
                title: '最新剧集',
                rankTitle: '最新剧集榜单',
                type: 'tv',
                tags: ['大陆剧', '港台剧', '日韩剧', '欧美剧', '其他剧'],
                cards: tvData.cards.length > 0 ? tvData.cards : HUAREN_REAL_SECTIONS[1].cards,
                rankings: tvData.rankings.length > 0 ? tvData.rankings : HUAREN_REAL_SECTIONS[1].rankings,
            },
            {
                id: 'varieties',
                title: '最新综艺',
                rankTitle: '最新综艺榜单',
                type: 'tv',
                tags: ['大陆综艺', '日韩综艺', '港台综艺', '欧美综艺'],
                cards: varietyData.cards.length > 0 ? varietyData.cards : HUAREN_REAL_SECTIONS[2].cards,
                rankings: varietyData.rankings.length > 0 ? varietyData.rankings : HUAREN_REAL_SECTIONS[2].rankings,
            },
            {
                id: 'animes',
                title: '最热动漫',
                rankTitle: '最热动漫榜单',
                type: 'tv',
                tags: ['国产动漫', '日韩动漫', '欧美动漫', '港台动漫'],
                cards: animeData.cards.length > 0 ? animeData.cards : HUAREN_REAL_SECTIONS[3].cards,
                rankings: HUAREN_REAL_SECTIONS[3].rankings,
            },
        ];

        return sections;
    } catch (e) {
        console.error('[huaren-api] 解析实时 HTML 异常:', e);
        return null;
    }
}

/**
 * 实时抓取 huaren.live 官网数据
 */
async function fetchLiveHuarenData(): Promise<HuarenRealSection[]> {
    // 1. 检查有效缓存 (15分钟)
    if (liveSectionsCache && Date.now() - liveSectionsCache.timestamp < CACHE_TTL_MS) {
        return liveSectionsCache.data;
    }

    try {
        const resp = await fetch('https://huaren.live/', {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                'Referer': 'https://www.google.com/',
                'Cache-Control': 'no-cache',
            },
            next: { revalidate: 900 },
        });

        if (resp.ok) {
            const html = await resp.text();
            const parsed = extractSectionsFromHTML(html);
            if (parsed && parsed.length > 0) {
                liveSectionsCache = {
                    data: parsed,
                    timestamp: Date.now(),
                };
                return parsed;
            }
        }
    } catch (e) {
        console.warn('[huaren-api] 实时网络请求失败，使用高保真预置数据兜底:', e);
    }

    // 2. 失败兜底：使用已验证的高保真数据
    return HUAREN_REAL_SECTIONS;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get('mode') || 'home';

    if (mode === 'home') {
        const sections = await fetchLiveHuarenData();
        return NextResponse.json({
            success: true,
            isLive: !!liveSectionsCache,
            updatedAt: liveSectionsCache?.timestamp || Date.now(),
            sections,
        });
    }

    return NextResponse.json({ success: true, sections: HUAREN_REAL_SECTIONS });
}
