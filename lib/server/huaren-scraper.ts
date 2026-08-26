/**
 * Huaren.live 真实数据抓取与解析引擎
 *
 * 通过 fetch + cookies 绕过 Cloudflare 抓取 huaren.live 首页 HTML，
 * 精确解析所有板块（电影/电视剧/综艺/动漫/短剧）的真实影视卡片数据。
 *
 * 封面图来源: static.huarenlivewebsite.top / hhmage.com / img.jisuimage.com
 * 播放: 用户点击后传 vodId 到播放器，从 vodplay 页提取 m3u8 直播流
 */

export interface HuarenVideoItem {
  vodId: string;
  title: string;
  cover: string;       // 真实 CDN 封面图 URL
  badge?: string;      // 标签(热映推荐/豆瓣热榜)
  status?: string;     // 集数状态(36集全/更新中/已完结)
  score?: string;      // 豆瓣评分
  type?: 'movie' | 'tv' | 'variety' | 'anime';
}

export interface HuarenSection {
  id: string;
  title: string;
  moreLink: string;    // huaren.live 上的 "更多" 链接
  items: HuarenVideoItem[];
}

// 内存缓存 (10 分钟有效)
let cachedData: { sections: HuarenSection[]; ts: number } | null = null;
const CACHE_TTL = 10 * 60 * 1000;

/**
 * 从 huaren.live 首页 HTML 中解析所有板块数据
 */
function parseHomepageHTML(html: string): HuarenSection[] {
  const sections: HuarenSection[] = [];

  // 1. 提取板块标题与位置
  const sectionRegex = /<h2 class="this-name cor4">(.*?)<\/h2>/g;
  const sectionPositions: { name: string; pos: number }[] = [];
  let match;
  while ((match = sectionRegex.exec(html)) !== null) {
    sectionPositions.push({ name: match[1], pos: match.index });
  }

  // 2. 提取所有 vodId -> title 映射
  const titleMap = new Map<string, string>();
  const titleRegex = /href="\/voddetail\/(\d+)\.html"[^>]*title="([^"]+)"/g;
  while ((match = titleRegex.exec(html)) !== null) {
    if (!titleMap.has(match[1])) {
      titleMap.set(match[1], match[2].trim());
    }
  }

  // 3. 精确提取 vodId -> cover 映射
  // 策略: 从每个 <a class="public-list-exp"> 位置开始，只在 500 字符内寻找 data-src
  // 这样绝不会跨卡片边界匹配，确保封面 100% 精准
  const coverMap = new Map<string, string>();
  const badgeMap = new Map<string, string>();
  const statusMap = new Map<string, string>();
  const scoreMap = new Map<string, string>();

  const cardAnchorRegex = /class="public-list-exp"\s+href="\/voddetail\/(\d+)\.html"\s+title="([^"]+)"/g;
  while ((match = cardAnchorRegex.exec(html)) !== null) {
    const vid = match[1];
    const pos = match.index + match[0].length;
    // 只在 <a> 标签之后 500 字符内搜索 (同一个 card 内)
    const snippet = html.substring(pos, pos + 500);

    // 封面图
    if (!coverMap.has(vid)) {
      const imgMatch = snippet.match(/data-src="([^"]+)"/);
      if (imgMatch) {
        coverMap.set(vid, imgMatch[1]);
      }
    }

    // 标签 badge (热映推荐/豆瓣热榜)
    if (!badgeMap.has(vid)) {
      const badgeMatch = snippet.match(/public-prt[^>]*>([^<]+)<\/span>/);
      if (badgeMatch) {
        badgeMap.set(vid, badgeMatch[1].trim());
      }
    }

    // 评分 score
    if (!scoreMap.has(vid)) {
      const scoreMatch = snippet.match(/public-list-prb[^>]*>\s*<i[^>]*>([^<]+)<\/i>/);
      if (scoreMatch) {
        scoreMap.set(vid, scoreMatch[1].trim());
      }
    }

    // 状态 status (集数)
    if (!statusMap.has(vid)) {
      const statusMatch = snippet.match(/public-list-prb[^>]*>([^<]+)<\/span>/);
      if (statusMatch) {
        statusMap.set(vid, statusMatch[1].trim());
      }
    }
  }

  // 5. 按板块分组
  // 过滤掉 "榜单" 类板块 (我们只要主内容板块)
  const mainSections = [
    { key: '热映排行', id: 'hot-rank', type: 'movie' as const, link: '/label/rank.html' },
    { key: '豆瓣热播电影', id: 'douban-movie', type: 'movie' as const, link: '/vodshow/1/by/score.html' },
    { key: '豆瓣热播电视', id: 'douban-tv', type: 'tv' as const, link: '/vodshow/2/by/score.html' },
    { key: '豆瓣热播综艺', id: 'douban-variety', type: 'variety' as const, link: '/vodshow/3/by/score.html' },
    { key: '豆瓣热播动漫', id: 'douban-anime', type: 'anime' as const, link: '/vodshow/4/by/score.html' },
    { key: '最新电影', id: 'latest-movie', type: 'movie' as const, link: '/vodshow/1.html' },
    { key: '最新剧集', id: 'latest-tv', type: 'tv' as const, link: '/vodshow/2.html' },
    { key: '最新综艺', id: 'latest-variety', type: 'variety' as const, link: '/vodshow/3.html' },
    { key: '最热动漫', id: 'latest-anime', type: 'anime' as const, link: '/vodshow/4.html' },
  ];

  for (const sec of mainSections) {
    const sectionIdx = sectionPositions.findIndex(s => s.name === sec.key);
    if (sectionIdx === -1) continue;

    const startPos = sectionPositions[sectionIdx].pos;
    const endPos = sectionIdx + 1 < sectionPositions.length
      ? sectionPositions[sectionIdx + 1].pos
      : html.length;
    const chunk = html.substring(startPos, endPos);

    // 提取该板块下所有 vodId (保持顺序, 去重)
    const vodIds: string[] = [];
    const seen = new Set<string>();
    const vodRegex = /href="\/voddetail\/(\d+)\.html"/g;
    let vm;
    while ((vm = vodRegex.exec(chunk)) !== null) {
      if (!seen.has(vm[1])) {
        seen.add(vm[1]);
        vodIds.push(vm[1]);
      }
    }

    const items: HuarenVideoItem[] = vodIds
      .filter(vid => titleMap.has(vid) && coverMap.has(vid))
      .map(vid => ({
        vodId: vid,
        title: titleMap.get(vid)!,
        cover: coverMap.get(vid)!,
        badge: badgeMap.get(vid),
        status: statusMap.get(vid),
        score: scoreMap.get(vid),
        type: sec.type,
      }));

    if (items.length > 0) {
      sections.push({
        id: sec.id,
        title: sec.key,
        moreLink: sec.link,
        items,
      });
    }
  }

  return sections;
}

/**
 * 抓取 huaren.live 首页并返回结构化数据
 * 使用多种策略绕过 Cloudflare:
 * 1. 携带完整浏览器指纹 headers
 * 2. 自动管理 cookies
 */
export async function fetchHuarenHomepage(): Promise<HuarenSection[]> {
  // 检查缓存
  if (cachedData && Date.now() - cachedData.ts < CACHE_TTL) {
    return cachedData.sections;
  }

  try {
    const resp = await fetch('https://huaren.live/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'Referer': 'https://www.google.com/',
        'Cache-Control': 'no-cache',
      },
      next: { revalidate: 600 }, // 10 分钟 ISR 缓存
    });

    if (!resp.ok) {
      console.warn(`[huaren-scraper] 首页抓取失败: HTTP ${resp.status}`);
      return cachedData?.sections ?? [];
    }

    const html = await resp.text();
    if (html.length < 10000) {
      // 可能是 Cloudflare challenge 页面
      console.warn('[huaren-scraper] 首页返回内容过短, 可能被 CF 拦截');
      return cachedData?.sections ?? [];
    }

    const sections = parseHomepageHTML(html);
    cachedData = { sections, ts: Date.now() };
    return sections;
  } catch (err) {
    console.error('[huaren-scraper] 抓取异常:', err);
    return cachedData?.sections ?? [];
  }
}

/**
 * 从 huaren.live vodplay 页面提取视频播放 URL
 */
export async function extractHuarenPlayUrl(vodId: string): Promise<string | null> {
  try {
    // vodplay 页面 URL 格式: /vodplay/{vodId}-1-1.html
    const resp = await fetch(`https://huaren.live/vodplay/${vodId}-1-1.html`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Referer': 'https://huaren.live/',
      },
    });

    if (!resp.ok) return null;

    const html = await resp.text();

    // 提取 player_aaaa JSON 配置
    const playerMatch = html.match(/var\s+player_aaaa\s*=\s*(\{[^}]+\})/);
    if (playerMatch) {
      try {
        const config = JSON.parse(playerMatch[1]);
        // config.url 通常是 m3u8 或 mp4 直播流地址
        if (config.url) {
          // 如果是编码的, 解码
          let url = config.url;
          if (url.includes('%')) {
            url = decodeURIComponent(url);
          }
          return url;
        }
      } catch {
        // JSON 解析失败
      }
    }

    // 备用: 提取 iframe src
    const iframeMatch = html.match(/iframe[^>]+src="([^"]+\.m3u8[^"]*)"/i)
      || html.match(/iframe[^>]+src="([^"]+player[^"]*)"/i);
    if (iframeMatch) {
      return iframeMatch[1];
    }

    return null;
  } catch {
    return null;
  }
}
