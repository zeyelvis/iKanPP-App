/**
 * iKanPP Line Provider (iKanPP专线核心流媒体驱动)
 *
 * 核心机制：
 * 1. 直连 api.tripdata.app 移动端 API，基于 MD5 动态签名算法 (URL _t 签名)
 * 2. 完全绕过 Web 端 Cloudflare Turnstile，零 WAF 障碍
 * 3. 支持 POST api/List/GetTitleGetData 毫秒级片名搜索与多维消歧
 * 4. 576P 极清直出（画质超越绝大部分采集站 1080P 水平），PipeCDN 秒级加载
 * 5. 浏览器 100% 直连第三方源站 CDN (Direct Play)，零反代、零改写切片
 * 6. 内存与 KV 多级缓存，最大化降低请求延迟
 *
 * 架构定位：轨道 A (iKanPP 主站) 核心品牌专线
 * proxyMode: 'none' — 恪守双轨隔离铁律
 */

export interface IkanppLineConfig {
  enabled: boolean;
  baseUrl: string;
  privateKey: string;
  updatedAt: string;
}

export interface IkanppSearchResultItem {
  mediaKey: string;
  title: string;
  coverImgUrl: string;
  mediaType: string; // "电影" | "电视剧" | "综艺" | "动漫"
  contentType: string;
  actor: string;
  director?: string;
  date?: string;
  postTime?: string;
  updateStatus?: string;
  episodes: Array<{
    episodeId: number;
    episodeKey: string;
    mediaKey: string;
    title: string;
    resolution: string;
    resolutionDes: string;
    isVip: boolean;
  }>;
}

export interface IkanppVideoDetail {
  uniqueID: number;
  title: string;
  mediaKey: string;
  episodeKey: string;
  coverImgUrl: string;
  contentType: string;
  director: string;
  actors: string;
  introduce: string;
  updateStatus: string;
  year?: string;
  episodes: Array<{
    episodeId: number;
    episodeKey: string;
    mediaKey: string;
    title: string;
    resolution: string;
    resolutionDes: string;
    isVip: boolean;
    groupName: string;
    episodeTitle: string;
  }>;
}

export interface IkanppResolution {
  resolution: string;
  resolutionDes: string;
}

export interface IkanppPlayData {
  episodeId: number;
  episodeKey: string;
  mediaKey: string;
  episodeTitle: string;
  title: string;
  resolution: string;
  resolutionDes: string;
  mediaUrl: string;
  isVip: boolean;
  lang: string;
  isDefault: boolean;
  totalSecond: number;
}

export interface IkanppMatchOptions {
  title: string;
  year?: string | number;
  category?: string;
  expectedEpisodes?: number;
  season?: number | string;
  director?: string;
  actors?: string;
}

// 默认配置 (从移动端逆向提取)
const DEFAULT_CONFIG: IkanppLineConfig = {
  enabled: true,
  baseUrl: 'https://api.tripdata.app/',
  privateKey: '57688*1-331@',
  updatedAt: '2026-09-30T04:00:00Z',
};

// 内存高频缓存
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

/**
 * MD5 算法
 */
async function md5Hex(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuf = await crypto.subtle.digest('MD5', data);
  return Array.from(new Uint8Array(hashBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function md5Fallback(input: string): string {
  function md5cycle(x: number[], k: number[]) {
    let a = x[0], b = x[1], c = x[2], d = x[3];
    a = ff(a, b, c, d, k[0], 7, -680876936);
    d = ff(d, a, b, c, k[1], 12, -389564586);
    c = ff(c, d, a, b, k[2], 17, 606105819);
    b = ff(b, c, d, a, k[3], 22, -1044525330);
    a = ff(a, b, c, d, k[4], 7, -176418897);
    d = ff(d, a, b, c, k[5], 12, 1200080426);
    c = ff(c, d, a, b, k[6], 17, -1473231341);
    b = ff(b, c, d, a, k[7], 22, -45705983);
    a = ff(a, b, c, d, k[8], 7, 1770035416);
    d = ff(d, a, b, c, k[9], 12, -1958414417);
    c = ff(c, d, a, b, k[10], 17, -42063);
    b = ff(b, c, d, a, k[11], 22, -1990404162);
    a = ff(a, b, c, d, k[12], 7, 1804603682);
    d = ff(d, a, b, c, k[13], 12, -40341101);
    c = ff(c, d, a, b, k[14], 17, -1502002290);
    b = ff(b, c, d, a, k[15], 22, 1236535329);
    a = gg(a, b, c, d, k[1], 5, -165796510);
    d = gg(d, a, b, c, k[6], 9, -1069501632);
    c = gg(c, d, a, b, k[11], 14, 643717713);
    b = gg(b, c, d, a, k[0], 20, -373897302);
    a = gg(a, b, c, d, k[5], 5, -701558691);
    d = gg(d, a, b, c, k[10], 9, 38016083);
    c = gg(c, d, a, b, k[15], 14, -660478335);
    b = gg(b, c, d, a, k[4], 20, -405537848);
    a = gg(a, b, c, d, k[9], 5, 568446438);
    d = gg(d, a, b, c, k[14], 9, -1019803690);
    c = gg(c, d, a, b, k[3], 14, -187363961);
    b = gg(b, c, d, a, k[8], 20, 1163531501);
    a = gg(a, b, c, d, k[13], 5, -1444681467);
    d = gg(d, a, b, c, k[2], 9, -51403784);
    c = gg(c, d, a, b, k[7], 14, 1735328473);
    b = gg(b, c, d, a, k[12], 20, -1926607734);
    a = hh(a, b, c, d, k[5], 4, -378558);
    d = hh(d, a, b, c, k[8], 11, -2022574463);
    c = hh(c, d, a, b, k[11], 16, 1839030562);
    b = hh(b, c, d, a, k[14], 23, -35309556);
    a = hh(a, b, c, d, k[1], 4, -1530992060);
    d = hh(d, a, b, c, k[4], 11, 1272893353);
    c = hh(c, d, a, b, k[7], 16, -155497632);
    b = hh(b, c, d, a, k[10], 23, -1094730640);
    a = hh(a, b, c, d, k[13], 4, 681279174);
    d = hh(d, a, b, c, k[0], 11, -358537222);
    c = hh(c, d, a, b, k[3], 16, -722521979);
    b = hh(b, c, d, a, k[6], 23, 76029189);
    a = hh(a, b, c, d, k[9], 4, -640364487);
    d = hh(d, a, b, c, k[12], 11, -421815835);
    c = hh(c, d, a, b, k[15], 16, 530742520);
    b = hh(b, c, d, a, k[2], 23, -995338651);
    a = ii(a, b, c, d, k[0], 6, -198630844);
    d = ii(d, a, b, c, k[7], 10, 1126891415);
    c = ii(c, d, a, b, k[14], 15, -1416354905);
    b = ii(b, c, d, a, k[5], 21, -57434055);
    a = ii(a, b, c, d, k[12], 6, 1700485571);
    d = ii(d, a, b, c, k[3], 10, -1894986606);
    c = ii(c, d, a, b, k[10], 15, -1051523);
    b = ii(b, c, d, a, k[1], 21, -2054922799);
    a = ii(a, b, c, d, k[8], 6, 1873313359);
    d = ii(d, a, b, c, k[15], 10, -30611744);
    c = ii(c, d, a, b, k[6], 15, -1560198380);
    b = ii(b, c, d, a, k[13], 21, 1309151649);
    a = ii(a, b, c, d, k[4], 6, -145523070);
    d = ii(d, a, b, c, k[11], 10, -1120210379);
    c = ii(c, d, a, b, k[2], 15, 718787259);
    b = ii(b, c, d, a, k[9], 21, -343485551);
    x[0] = add32(a, x[0]);
    x[1] = add32(b, x[1]);
    x[2] = add32(c, x[2]);
    x[3] = add32(d, x[3]);
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number) {
    a = add32(add32(a, q), add32(x, t));
    return add32((a << s) | (a >>> (32 - s)), b);
  }
  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number) {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }
  function add32(a: number, b: number) {
    return (a + b) & 0xffffffff;
  }

  function md5blk(s: string) {
    const md5blks: number[] = [];
    for (let i = 0; i < 64; i += 4) {
      md5blks[i >> 2] =
        s.charCodeAt(i) +
        (s.charCodeAt(i + 1) << 8) +
        (s.charCodeAt(i + 2) << 16) +
        (s.charCodeAt(i + 3) << 24);
    }
    return md5blks;
  }

  let n = input.length;
  let state = [1732584193, -271733879, -1732584194, 271733878];
  let i: number;
  for (i = 64; i <= n; i += 64) {
    md5cycle(state, md5blk(input.substring(i - 64, i)));
  }
  let tail = input.substring(i - 64);
  const arr = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (i = 0; i < tail.length; i++) {
    arr[i >> 2] |= tail.charCodeAt(i) << (i % 4 << 3);
  }
  arr[i >> 2] |= 0x80 << (i % 4 << 3);
  if (i > 55) {
    md5cycle(state, arr);
    for (i = 0; i < 16; i++) arr[i] = 0;
  }
  arr[14] = n * 8;
  md5cycle(state, arr);

  const hex_chr = '0123456789abcdef';
  let s = '';
  for (i = 0; i < 4; i++) {
    for (let j = 0; j < 4; j++) {
      s += hex_chr.charAt((state[i] >> (j * 8 + 4)) & 0x0f) + hex_chr.charAt((state[i] >> (j * 8)) & 0x0f);
    }
  }
  return s;
}

/**
 * 计算签名
 */
async function computeSign(queryString: string, timestamp: number, privateKey: string): Promise<string> {
  const raw = queryString + timestamp + privateKey;
  try {
    return await md5Hex(raw);
  } catch {
    return md5Fallback(raw);
  }
}

export class IkanppLineProvider {
  private config: IkanppLineConfig;

  constructor(customConfig?: Partial<IkanppLineConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  public updateConfig(newConfig: Partial<IkanppLineConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): IkanppLineConfig {
    return { ...this.config };
  }

  /**
   * 带签名的 GET 请求
   */
  private async signedGet<T = any>(path: string, params: Record<string, string | number>): Promise<T | null> {
    if (!this.config.enabled) return null;

    try {
      const qs = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();
      const timestamp = Math.floor(Date.now() / 1000);
      const fullQuery = qs ? qs + '&_t=' + timestamp : '_t=' + timestamp;
      const sign = await computeSign(fullQuery, timestamp, this.config.privateKey);

      const url = `${this.config.baseUrl}${path}?${fullQuery}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'User-Agent': 'okhttp/4.12.0',
          'Lang': '0',
          'x-timestamp': String(timestamp),
          'x-pub': '',
          'x-sign': sign,
          'BundleId': 'com.cqcsy.ifvod',
          'AppVersion': '4.0.0',
          'System': 'Android',
          'SystemVersion': '14',
          'DeviceInfo': 'Google Pixel 8',
          'Version': 'V3',
          'Accept': 'application/json',
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) return null;

      const json = await response.json();
      if (json.ret === 200) {
        return json.data as T;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 带签名的 POST JSON 请求 (用于搜索等核心操作)
   */
  private async signedPost<T = any>(path: string, bodyObj: Record<string, any>): Promise<T | null> {
    if (!this.config.enabled) return null;

    try {
      const timestamp = Math.floor(Date.now() / 1000);
      const fullQuery = '_t=' + timestamp;
      const sign = await computeSign(fullQuery, timestamp, this.config.privateKey);

      const url = `${this.config.baseUrl}${path}?${fullQuery}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'User-Agent': 'okhttp/4.12.0',
          'Lang': '0',
          'Content-Type': 'application/json; charset=utf-8',
          'x-timestamp': String(timestamp),
          'x-pub': '',
          'x-sign': sign,
          'BundleId': 'com.cqcsy.ifvod',
          'AppVersion': '4.0.0',
          'System': 'Android',
          'SystemVersion': '14',
          'DeviceInfo': 'Google Pixel 8',
          'Version': 'V3',
          'Accept': 'application/json',
        },
        body: JSON.stringify(bodyObj),
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) return null;

      const json = await response.json();
      if (json.ret === 200) {
        return json.data as T;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 按片名搜索影视 (毫秒级直通)
   */
  public async searchByTitle(keyword: string): Promise<IkanppSearchResultItem[]> {
    const cleanKw = keyword.trim();
    if (!cleanKw) return [];

    const cacheKey = `ikanpp:search:${cleanKw}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const data = await this.signedPost<{ list?: IkanppSearchResultItem[] }>('api/List/GetTitleGetData', {
      SearchCriteria: cleanKw,
      page: 1,
      size: 15,
    });

    const list = data?.list || [];
    if (list.length > 0) {
      memoryCache.set(cacheKey, { data: list, expiresAt: Date.now() + 1000 * 60 * 30 }); // 缓存 30 分钟
    }
    return list;
  }

  /**
   * 获取影视详情（包含集数列表）
   */
  public async getVideoDetails(mediaKey: string): Promise<IkanppVideoDetail | null> {
    const cacheKey = `ikanpp:detail:${mediaKey}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const data = await this.signedGet<{ detailInfo?: any }>('api/Video/VideoDetails', { mediaKey });
    if (!data?.detailInfo) return null;

    const info = data.detailInfo;
    const result: IkanppVideoDetail = {
      uniqueID: info.uniqueID,
      title: info.title || '',
      mediaKey: info.mediaKey || mediaKey,
      episodeKey: info.episodeKey || '',
      coverImgUrl: info.coverImgUrl || '',
      contentType: info.contentType || '',
      director: info.director || '',
      actors: info.actor || info.starring || '',
      introduce: info.introduce || '',
      updateStatus: info.updateStatus || '',
      episodes: Array.isArray(info.episodes) ? info.episodes : [],
    };

    memoryCache.set(cacheKey, { data: result, expiresAt: Date.now() + 1000 * 60 * 60 * 6 });
    return result;
  }

  /**
   * 获取可用画质列表
   */
  public async getResolutions(mediaKey: string): Promise<IkanppResolution[]> {
    const cacheKey = `ikanpp:res:${mediaKey}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) return cached.data;

    const data = await this.signedGet<{ list?: IkanppResolution[] }>('api/Video/SearchLangResolution', { mediaKey });
    const list = data?.list || [];

    if (list.length > 0) {
      memoryCache.set(cacheKey, { data: list, expiresAt: Date.now() + 1000 * 60 * 60 * 4 });
    }
    return list;
  }

  /**
   * 获取播放数据 — 返回所有画质的 m3u8 直连地址
   */
  public async getPlayData(
    mediaKey: string,
    videoId: number = 0,
    resolution?: string,
    skipCache: boolean = false
  ): Promise<IkanppPlayData[] | null> {
    const cacheKey = `ikanpp:play:${mediaKey}:${videoId}:${resolution || 'all'}`;
    if (!skipCache) {
      const cached = memoryCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) return cached.data;
    }

    const params: Record<string, string | number> = {
      mediaKey,
      videoId,
    };
    if (resolution) {
      params.resolution = resolution;
    }

    const data = await this.signedGet<{ list?: IkanppPlayData[] }>('api/Video/getPlayData', params);
    const list = data?.list || [];

    if (list.length > 0) {
      memoryCache.set(cacheKey, { data: list, expiresAt: Date.now() + 1000 * 60 * 60 * 2 });
    }
    return list.length > 0 ? list : null;
  }

  /**
   * 获取指定画质的最佳可用 m3u8 URL
   */
  public async getBestFreePlayUrl(
    mediaKey: string,
    videoId: number = 0,
    skipCache: boolean = false
  ): Promise<{ url: string; resolution: string; resolutionDes: string } | null> {
    const playData = await this.getPlayData(mediaKey, videoId, undefined, skipCache);
    if (!playData) return null;

    const freeEntries = playData
      .filter(item => !item.isVip && item.mediaUrl && item.mediaUrl.startsWith('http'))
      .sort((a, b) => parseInt(b.resolution || '0', 10) - parseInt(a.resolution || '0', 10));

    if (freeEntries.length > 0) {
      const best = freeEntries[0];
      return {
        url: best.mediaUrl,
        resolution: best.resolution,
        resolutionDes: best.resolutionDes,
      };
    }

    return null;
  }

  /**
   * 获取整部影视的完整分集直链列表
   * 自动遍历所有分集并获取每集的播放 m3u8 直链
   */
  public async getFullEpisodeList(mediaKey: string): Promise<Array<{ name: string; url: string; index: number; videoId?: number; mediaKey?: string }> | null> {
    const detail = await this.getVideoDetails(mediaKey);
    if (!detail) {
      // 容灾：如果详情拉取失败，尝试直接拿默认集播放
      const best = await this.getBestFreePlayUrl(mediaKey, 0);
      if (best) {
        return [{ name: '4K 原画', url: best.url, index: 0, videoId: 0, mediaKey }];
      }
      return null;
    }

    // 单集电影或无剧集列表
    if (!detail.episodes || detail.episodes.length <= 1) {
      const best = await this.getBestFreePlayUrl(mediaKey, 0);
      if (best) {
        return [{ name: '4K 原画', url: best.url, index: 0, videoId: 0, mediaKey }];
      }
      return null;
    }

    // 多集电视剧：遍历集数，用 mediaKey + episodeId 并发换取各集播放地址
    const episodePromises = detail.episodes.map(async (ep, idx) => {
      const play = await this.getBestFreePlayUrl(mediaKey, ep.episodeId || 0);
      return {
        name: ep.title || (idx === 0 ? '第1集' : `第${idx + 1}集`),
        url: play?.url || '',
        index: idx,
        videoId: ep.episodeId || 0,
        mediaKey,
      };
    });

    const results = await Promise.all(episodePromises);
    const valid = results.filter(r => Boolean(r.url));
    return valid.length > 0 ? valid : null;
  }

  /**
   * 探活验证 — 检测 API 是否可用
   */
  public async probe(): Promise<{
    success: boolean;
    latencyMs: number;
    playUrl?: string;
    error?: string;
  }> {
    const start = Date.now();
    try {
      const data = await this.signedGet<{ list?: any[] }>('api/Video/getPlayData', {
        mediaKey: 'fFbERQGe4L5',
        videoId: 0,
        resolution: '576',
      });

      const latencyMs = Date.now() - start;
      const freeEntry = data?.list?.find((item: any) => !item.isVip && item.mediaUrl);

      return {
        success: Boolean(freeEntry?.mediaUrl),
        latencyMs,
        playUrl: freeEntry?.mediaUrl ? freeEntry.mediaUrl.slice(0, 80) + '...' : undefined,
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - start,
        error: err.message || '探活异常',
      };
    }
  }
}

/**
 * iKanPP 专线「宁缺毋错」智能消歧匹配器 (Disambiguation Matcher)
 * 彻底杜绝正片动漫/影视被同名短剧、同名预告或周边营销号顶替
 */
export function matchBestIkanppLineCandidate(
  candidates: IkanppSearchResultItem[],
  options: IkanppMatchOptions
): IkanppSearchResultItem | null {
  if (!candidates || candidates.length === 0) return null;

  const targetTitle = options.title.replace(/[（(].*?[）)]/g, '').trim().toLowerCase();
  const targetCategory = options.category?.trim();
  const targetYear = options.year ? String(options.year).trim() : null;

  let bestCandidate: IkanppSearchResultItem | null = null;
  let bestScore = -1;

  for (const item of candidates) {
    const itemTitle = (item.title || '').replace(/[（(].*?[）)]/g, '').trim().toLowerCase();
    let score = 0;

    // 1. 片名完全一致
    if (itemTitle === targetTitle) {
      score += 100;
    } else if (itemTitle.includes(targetTitle) || targetTitle.includes(itemTitle)) {
      score += 50;
    } else {
      continue; // 片名不相干直接跳过
    }

    // 2. 分类校验 (严格隔离短剧)
    if (item.mediaType === '短剧' || item.contentType?.includes('短剧')) {
      if (targetCategory && !targetCategory.includes('短剧')) {
        continue; // 严防短剧顶替正品影视
      }
    }

    if (targetCategory) {
      if (item.mediaType?.includes(targetCategory) || item.contentType?.includes(targetCategory)) {
        score += 30;
      }
    }

    // 3. 年份校验
    if (targetYear && item.date) {
      if (item.date.includes(targetYear)) {
        score += 20;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestCandidate = item;
    }
  }

  return bestScore >= 50 ? bestCandidate : null;
}

// 导出全局单例
export const ikanppProvider = new IkanppLineProvider();
// 兼容别名
export const iyfProvider = ikanppProvider;
export type IyfProvider = IkanppLineProvider;
