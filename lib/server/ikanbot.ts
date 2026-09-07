/**
 * ikanbot.com 实时解析与线路直出服务
 * 
 * 核心能力：
 * 1. 动态逆向解密 ikanbot.com Token 签名算法
 * 2. 搜索并精准对齐目标影片（支持片名、年份、季数智能判定）
 * 3. 毫秒级直出 ikanbot 已经预清洗对齐好的 20~30 条每集 m3u8 直链
 */

export interface IkanbotEpisode {
  name: string;
  url: string;
}

export interface IkanbotLine {
  siteId: number;
  flag: string;
  sourceId: string;
  sourceName: string;
  episodes: IkanbotEpisode[];
}

export interface IkanbotDetailResult {
  vod_id: string;
  vod_name: string;
  vod_pic: string;
  vod_year: string;
  vod_content: string;
  lines: IkanbotLine[];
}

const FLAG_NAME_MAP: Record<string, string> = {
  jsm3u8: '极速资源',
  gsm3u8: '光速资源',
  xlm3u8: '新浪资源',
  wjm3u8: '无尽资源',
  bfzym3u8: '暴风资源',
  lzm3u8: '量子资源',
  dyttm3u8: '电影天堂',
  '1080zyk': '1080JSON',
  hym3u8: '虎牙资源',
  hhm3u8: '海豚资源',
  ffm3u8: '非凡资源',
  hongniu: '红牛资源',
  rym3u8: '如意资源',
  zuidam3u8: '最大资源',
  subm3u8: '速博资源',
  jinyingm3u8: '金鹰点播',
  ukm3u8: '优酷资源',
  ikm3u8: 'iKun资源',
  iqym3u8: '乐子资源',
  '360zy': '360资源',
  modu: '魔都资源',
  jingyu: '鲸鱼资源',
  moduys: '魔都影视',
  modu_dm: '魔都动漫',
  dbm3u8: '豆瓣专线',
  snm3u8: '索尼专线',
  sdm3u8: '闪电专线',
  kcm3u8: '快车专线',
  tym3u8: '天涯专线',
  yhm3u8: '樱花专线',
  tpm3u8: '淘片专线',
};

// 梯队权威权重字典（数值越小，稳定性与秒播速度越高）
export const TIER_PRIORITY_MAP: Record<string, number> = {
  // === 第一梯队：全量 443 端口纯净切片与数百万海量热播大源（秒播首选） ===
  wjm3u8: 1,      // 无尽资源 (443纯净源，老片/动画秒播首选)
  zuidam3u8: 2,   // 最大资源 (443纯净源，经典/新剧兼备)
  gsm3u8: 3,      // 光速资源 (数百万海量新热影视第一大站)
  modu: 4,        // 魔都资源 (热播大站)
  '360zy': 5,     // 360资源 (独播大站)

  // === 第二梯队：优质中型主流高码率专线 ===
  '1080zyk': 6,   // 1080JSON
  ffm3u8: 7,      // 非凡资源
  bfzym3u8: 8,    // 暴风资源 (4K/蓝光)
  iqym3u8: 9,     // 乐子资源
  lzm3u8: 10,     // 量子资源
  rym3u8: 11,     // 如意资源
  modu_dm: 12,    // 魔都动漫
  moduys: 13,     // 魔都影视
  hongniu: 14,    // 红牛资源 (4K)
  snm3u8: 15,     // 索尼专线 (4K)
  dyttm3u8: 16,   // 电影天堂
  hym3u8: 17,     // 虎牙资源
  hhm3u8: 18,     // 海豚资源

  // === 第三梯队：备用专线（部分切片非标端口或开启防盗链，顺延保底） ===
  xlm3u8: 20,     // 新浪资源
  subm3u8: 21,    // 速博资源
  jsm3u8: 22,     // 极速资源
  ikm3u8: 23,     // iKun资源
  jinyingm3u8: 24,// 金鹰点播
  ukm3u8: 25,     // 优酷资源
  dbm3u8: 31,     // 豆瓣专线
  kcm3u8: 32,     // 快车专线
  sdm3u8: 33,     // 闪电专线
  tpm3u8: 34,     // 淘片专线
  tym3u8: 35,     // 天涯专线
  yhm3u8: 36,     // 樱花专线
  jingyu: 37,     // 鲸鱼资源
};

export function getTierPriority(flag: string): number {
  return TIER_PRIORITY_MAP[flag] ?? 999;
}

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
};

// 内存缓存（避免连续切集或切线重复触发对 ikanbot 的网络抓取）
const cache = new Map<string, { data: IkanbotDetailResult; expireAt: number }>();

async function fetchWithTimeout(url: string, opts: RequestInit = {}, timeoutMs = 5000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 格式化分集列表（例如 "第01集$https://...#第02集$https://..."）
 */
function parseEpisodes(raw: string): IkanbotEpisode[] {
  if (!raw || typeof raw !== 'string') return [];
  const parts = raw.split('#');
  return parts
    .map((part, index) => {
      const trimmed = part.trim();
      if (!trimmed) return null;
      const dollarIdx = trimmed.indexOf('$');
      if (dollarIdx !== -1) {
        const name = trimmed.substring(0, dollarIdx).trim() || `第${index + 1}集`;
        const url = trimmed.substring(dollarIdx + 1).trim();
        return { name, url };
      }
      return {
        name: `第${index + 1}集`,
        url: trimmed,
      };
    })
    .filter((ep): ep is IkanbotEpisode => !!(ep && ep.url && ep.url.startsWith('http')));
}

/**
 * 1. 在 ikanbot 检索影片并匹配最佳候选 ID
 */
export async function searchIkanbot(
  query: string,
  options?: { year?: number; season?: number }
): Promise<{ id: string; title: string; year?: number; pic?: string } | null> {
  try {
    // 连续剧季数规范化（例如将 "第1季" 规范化为 ikanbot 站通用的 "第一季"）
    let cleanTitle = query.replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();
    cleanTitle = cleanTitle.replace(/第(\d+)[季部期]/g, (_, num) => {
      const cn = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][parseInt(num, 10)];
      return cn ? `第${cn}季` : `第${num}季`;
    });

    const searchUrl = `https://www.ikanbot.com/search?q=${encodeURIComponent(cleanTitle)}`;
    const res = await fetchWithTimeout(searchUrl, { headers: HEADERS }, 4000);
    if (!res.ok) return null;

    const html = await res.text();
    // 匹配页面中的视频列表项，格式例如：
    // <a href="/play/387903" ...><img alt="怪奇物语 第一季" data-src="...">...<p ...>怪奇物语 第一季  2016</p>
    const regex = /<a\s+href="\/play\/(\d+)"[^>]*>([\s\S]*?)<\/a>/gi;
    const matches = [...html.matchAll(regex)];
    if (matches.length === 0) return null;

    const candidates: Array<{ id: string; title: string; year?: number; pic?: string; score: number }> = [];

    for (const m of matches) {
      const id = m[1];
      const innerHtml = m[2];
      const imgMatch = innerHtml.match(/alt="([^"]*)"/i);
      const srcMatch = innerHtml.match(/data-src="([^"]*)"/i) || innerHtml.match(/src="([^"]*)"/i);
      const rawTitle = imgMatch ? imgMatch[1].trim() : innerHtml.replace(/<[^>]+>/g, '').trim();
      if (!rawTitle) continue;

      // 提取年份
      let year: number | undefined;
      const yMatch = innerHtml.match(/\b(19\d\d|20\d\d)\b/);
      if (yMatch) {
        year = parseInt(yMatch[1], 10);
      }

      // 计算相似度得分
      let score = 0;
      const normRaw = rawTitle.toLowerCase();
      const normQuery = cleanTitle.toLowerCase();

      if (normRaw === normQuery) {
        score += 100;
      } else if (normRaw.includes(normQuery) || normQuery.includes(normRaw)) {
        score += 60;
      }

      // 年份匹配加分
      if (options?.year && year) {
        if (options.year === year) score += 50;
        else if (Math.abs(options.year - year) === 1) score += 20;
        else score -= 40;
      }

      // 季数匹配加分
      if (options?.season) {
        const seasonCnMap: Record<number, string> = { 1: '一', 2: '二', 3: '三', 4: '四', 5: '五', 6: '六', 7: '七', 8: '八', 9: '九', 10: '十' };
        const cnSeason = seasonCnMap[options.season];
        if (rawTitle.includes(`第${options.season}季`) || (cnSeason && rawTitle.includes(`第${cnSeason}季`))) {
          score += 80;
        }
      }

      candidates.push({
        id,
        title: rawTitle,
        year,
        pic: srcMatch ? srcMatch[1] : undefined,
        score,
      });
    }

    if (candidates.length === 0) return null;
    // 按得分最高排序
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  } catch (e) {
    console.error('searchIkanbot error:', e);
    return null;
  }
}

/**
 * 2. 逆向获取指定 videoId 的全部分线直链
 */
export async function fetchIkanbotDetail(videoId: string): Promise<IkanbotDetailResult | null> {
  const cacheKey = `ikanbot_detail_${videoId}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expireAt > Date.now()) {
    return cached.data;
  }

  try {
    const playUrl = `https://www.ikanbot.com/play/${videoId}`;
    const playRes = await fetchWithTimeout(playUrl, { headers: HEADERS }, 5000);
    if (!playRes.ok) return null;

    const html = await playRes.text();

    // 提取页面信息
    const cidMatch = html.match(/id="current_id"[^>]*value="([^"]+)"/i) || html.match(/value="([^"]+)"[^>]*id="current_id"/i);
    const etMatch = html.match(/id="e_token"[^>]*value="([^"]+)"/i) || html.match(/value="([^"]+)"[^>]*id="e_token"/i);
    if (!cidMatch || !etMatch) return null;

    // 提取片名与海报
    const titleMatch = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    const picMatch = html.match(/<img[^>]*class="[^"]*detail-pic[^"]*"[^>]*src="([^"]+)"/i) ||
                     html.match(/<img[^>]*src="([^"]+)"[^>]*class="[^"]*detail-pic[^"]*"/i);
    const contentMatch = html.match(/<div class="summary"[^>]*>([\s\S]*?)<\/div>/i);
    const yearMatch = html.match(/\b(19\d\d|20\d\d)\b/);

    const vod_name = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const vod_pic = picMatch ? picMatch[1] : '';
    const vod_content = contentMatch ? contentMatch[1].replace(/<[^>]+>/g, '').trim() : '';
    const vod_year = yearMatch ? yearMatch[1] : '';

    // 执行 ikanbot Token 动态加解密算法
    const current_id = cidMatch[1];
    let e_token = etMatch[1];
    const last4 = current_id.substring(current_id.length - 4);
    const resArr: string[] = [];

    for (let i = 0; i < last4.length; i++) {
      const digit = parseInt(last4[i], 10);
      const offset = (digit % 3) + 1;
      resArr[i] = e_token.substring(offset, offset + 8);
      e_token = e_token.substring(offset + 8);
    }
    const token = resArr.join('');

    // 请求线路下发接口
    const apiUrl = `https://www.ikanbot.com/api/getResN?videoId=${videoId}&mtype=1&token=${token}`;
    const apiRes = await fetchWithTimeout(apiUrl, {
      headers: { ...HEADERS, Referer: playUrl },
    }, 5000);
    if (!apiRes.ok) return null;

    const data = await apiRes.json();
    if (!data || !data.data || !Array.isArray(data.data.list)) return null;

    const lines: IkanbotLine[] = [];
    const flagCounts = new Map<string, number>();

    for (const item of data.data.list) {
      try {
        // resData 为序列化数组字符串，例如：[{"flag":"jsm3u8","url":"..."}]
        // 使用 Function 构造器安全求值
        const evalFn = new Function(`return ${item.resData}`);
        const parsed = evalFn();

        if (Array.isArray(parsed)) {
          for (const sub of parsed) {
            if (sub && sub.flag && sub.url) {
              const episodes = parseEpisodes(sub.url);
              if (episodes.length > 0) {
                const flag = sub.flag;
                const count = (flagCounts.get(flag) || 0) + 1;
                flagCounts.set(flag, count);

                const baseName = FLAG_NAME_MAP[flag] || `专线 (${flag})`;
                const sourceName = count === 1 ? baseName : `${baseName} (备用${count - 1})`;
                const sourceId = count === 1 ? `ikanbot_${flag}` : `ikanbot_${flag}_${count}`;

                lines.push({
                  siteId: item.siteId,
                  flag,
                  sourceId,
                  sourceName,
                  episodes,
                });
              }
            }
          }
        }
      } catch {}
    }

    // 核心：严格按照第一梯队（顶级骨干秒播大源）> 第二梯队（优质中型专线）> 第三梯队（备用小源）排序
    lines.sort((a, b) => {
      const pA = getTierPriority(a.flag);
      const pB = getTierPriority(b.flag);
      if (pA !== pB) return pA - pB;
      return b.episodes.length - a.episodes.length;
    });

    const result: IkanbotDetailResult = {
      vod_id: videoId,
      vod_name,
      vod_pic,
      vod_year,
      vod_content,
      lines,
    };

    // 写入内存缓存（5 分钟）
    cache.set(cacheKey, {
      data: result,
      expireAt: Date.now() + 5 * 60 * 1000,
    });

    return result;
  } catch (e) {
    console.error('fetchIkanbotDetail error:', e);
    return null;
  }
}

/**
 * 3. 统一入口：输入片名直接解析并直出 ikanbot 完整线路库
 */
export async function getIkanbotVideo(
  title: string,
  options?: { year?: number; season?: number }
): Promise<IkanbotDetailResult | null> {
  const match = await searchIkanbot(title, options);
  if (!match || !match.id) return null;
  return await fetchIkanbotDetail(match.id);
}
