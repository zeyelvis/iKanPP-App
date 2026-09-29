/**
 * GZ360 (备用线路) 运行时解析器
 * 
 * 核心机制：
 * 1. 采用原生 Web Crypto API 实现 AES-128-CBC 动态加解密，100% 契合 Edge Runtime
 * 2. 严格按需惰性解析 (Lazy Resolve)，严禁大面积批量扫库
 * 3. 结果多级缓存 (内存/KV)，最大化降低外部请求频次
 * 4. 携带全套现代浏览器拟真 Headers，避免被风控拦截
 */

export interface GzConfig {
  baseUrl: string;
  key: string;
  iv: string;
  enabled: boolean;
  updatedAt: string;
}

export interface GzSearchResult {
  vod_id: string;
  title: string;
  year: string;
  score?: number;
  tags?: string[];
  d_type?: string;
  director?: string;
  actors?: string;
  episodesCount?: number;
  pic?: string;
}

export interface ShadowLineMatchOptions {
  title: string;
  year?: string | number;
  category?: string; // 如 'anime', 'movie', 'tv', 'short', 'variety', 'documentary'
  isShortDramaExpected?: boolean;
  expectedEpisodes?: number;
  season?: number | string;
  director?: string;
  actors?: string;
}

const FORM_SUFFIXES = ['剧版', '真人版', '电视剧版', '动画版', '动漫版', '电影版', 'tv版'];
const RELEASE_TAGS = ['tc', 'hd', '抢先版', '枪版', '高清版'];

export function numToChinese(n: number): string {
  const digits = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  if (n <= 10) return digits[n] || String(n);
  if (n < 20) return '十' + (n % 10 === 0 ? '' : digits[n % 10]);
  const tens = Math.floor(n / 10);
  const rem = n % 10;
  return digits[tens] + '十' + (rem === 0 ? '' : digits[rem]);
}

function convertSeasonToChinese(str: string): string {
  let s = str.replace(/第\s*(\d+)\s*[季部期]/gi, (_, d) => `第${numToChinese(parseInt(d, 10))}季`);
  s = s.replace(/\bseason\s*(\d+)\b/gi, (_, d) => `第${numToChinese(parseInt(d, 10))}季`);
  s = s.replace(/\bs(\d{1,2})\b/gi, (_, d) => `第${numToChinese(parseInt(d, 10))}季`);
  return s;
}

export function normalizeTitleForMatch(rawTitle: string): string {
  if (!rawTitle) return '';
  let s = rawTitle;
  // 1. 全角转半角
  s = s.replace(/[\uff01-\uff5e]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xfee0)).replace(/\u3000/g, ' ');
  // 2. 转小写
  s = s.toLowerCase();
  // 3. &amp; 转 &
  s = s.replace(/&amp;/g, '&');
  // 4. 去掉括号内容
  s = s.replace(/\([^)]*\)/g, '').replace(/\[[^\]]*\]/g, '').replace(/（[^）]*）/g, '').replace(/【[^】]*】/g, '');
  // 5. 数字季转中文数字季
  s = convertSeasonToChinese(s);
  // 6. 去掉空格和所有中英文标点
  s = s.replace(/[\s\p{P}\p{S}]/gu, '');
  return s;
}

interface MatchCandidateTitleResult {
  matched: boolean;
  hasFormSuffix: boolean;
}

function checkCandidateTitleMatch(candNorm: string, validTargetNames: Set<string>): MatchCandidateTitleResult {
  // 1. 直接全等
  if (validTargetNames.has(candNorm)) {
    return { matched: true, hasFormSuffix: false };
  }

  // 2. 尝试去掉一次发布标签 (TC, HD, 抢先版, 枪版, 高清版, 或 4位年份)
  // 注意：一次只去掉一个！
  for (const tag of RELEASE_TAGS) {
    if (candNorm.endsWith(tag) && candNorm.length > tag.length) {
      const stripped = candNorm.slice(0, -tag.length);
      if (validTargetNames.has(stripped)) {
        return { matched: true, hasFormSuffix: false };
      }
      for (const form of FORM_SUFFIXES) {
        if (stripped.endsWith(form) && stripped.length > form.length) {
          const strippedBoth = stripped.slice(0, -form.length);
          if (validTargetNames.has(strippedBoth)) {
            return { matched: true, hasFormSuffix: true };
          }
        }
      }
    }
  }

  // 4位年份结尾标签 (如 2024, 2025 等)
  const yearMatch = candNorm.match(/^(.*?)(\d{4})$/);
  if (yearMatch && yearMatch[1]) {
    const strippedYear = yearMatch[1];
    if (validTargetNames.has(strippedYear)) {
      return { matched: true, hasFormSuffix: false };
    }
    for (const form of FORM_SUFFIXES) {
      if (strippedYear.endsWith(form) && strippedYear.length > form.length) {
        const strippedBoth = strippedYear.slice(0, -form.length);
        if (validTargetNames.has(strippedBoth)) {
          return { matched: true, hasFormSuffix: true };
        }
      }
    }
  }

  // 3. 尝试去掉形式后缀 (如 剧版, 真人版 等)
  for (const form of FORM_SUFFIXES) {
    if (candNorm.endsWith(form) && candNorm.length > form.length) {
      const strippedForm = candNorm.slice(0, -form.length);
      if (validTargetNames.has(strippedForm)) {
        return { matched: true, hasFormSuffix: true };
      }
    }
  }

  return { matched: false, hasFormSuffix: false };
}

/**
 * 暗影专线「宁缺毋错」智能消歧匹配器 (ShadowLine Disambiguation Matcher 2.0)
 * 核心两步流程：
 * 1. 严格否决条件（一票否决淘汰所有不合格候选，全部淘汰返回 null）
 * 2. 在通过否决的合格候选之间进行精细化加权打分
 */
export function matchBestShadowLineCandidate(
  candidates: GzSearchResult[],
  options: ShadowLineMatchOptions
): GzSearchResult | null {
  if (!candidates || candidates.length === 0) return null;

  const rawCat = (options.category || '').toLowerCase();
  const isAnime = rawCat === 'anime' || /动漫|动画/.test(rawCat);
  const isMovie = rawCat === 'movie' || /电影|影院/.test(rawCat);
  const isTv = rawCat === 'tv' || /剧集|电视剧|连续剧/.test(rawCat);
  const isVariety = rawCat === 'variety' || /综艺/.test(rawCat);
  const isDoc = rawCat === 'documentary' || /纪录片|记录片/.test(rawCat);
  const isShortDramaExpected = options.isShortDramaExpected || rawCat === 'short' || /短剧/.test(rawCat);

  // 解析目标季数
  let targetSeason: number | null = null;
  if (options.season !== undefined && options.season !== null && options.season !== '') {
    const sNum = parseInt(String(options.season), 10);
    if (!isNaN(sNum) && sNum > 0) targetSeason = sNum;
  }
  if (targetSeason === null) {
    const sMatch = options.title.match(/第([一二三四五六七八九十\d]+)[季部期]/i) ||
                   options.title.match(/\bseason\s*(\d+)\b/i) ||
                   options.title.match(/\bS(\d{1,2})\b/i);
    if (sMatch) {
      const sStr = sMatch[1];
      const cnMap: Record<string, number> = { '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10 };
      targetSeason = cnMap[sStr] ?? (parseInt(sStr, 10) || null);
    }
  }

  // 目标片名规范化基础词
  const normTarget = normalizeTitleForMatch(options.title);
  // 去掉目标片名中包含的季信息，得到纯基准名
  let cleanBaseTarget = normTarget.replace(/第[一二三四五六七八九十\d]+季/g, '');

  const validTargetNames = new Set<string>();
  if (isMovie) {
    validTargetNames.add(cleanBaseTarget);
    validTargetNames.add(normTarget);
  } else if (targetSeason === 1 || targetSeason === null) {
    validTargetNames.add(cleanBaseTarget);
    validTargetNames.add(`${cleanBaseTarget}第一季`);
    validTargetNames.add(normTarget);
  } else {
    // 第 N 季 (N >= 2)
    const seasonChinese = numToChinese(targetSeason);
    validTargetNames.add(`${cleanBaseTarget}第${seasonChinese}季`);
    validTargetNames.add(normTarget);
  }

  const targetYear = options.year ? parseInt(String(options.year), 10) : null;
  const E = options.expectedEpisodes && options.expectedEpisodes > 0 ? options.expectedEpisodes : null;

  // 演员/导演名字拆分
  const targetActors = (options.actors || '')
    .split(/[\s,，、/|]+/)
    .map(a => a.trim())
    .filter(a => a.length >= 2);
  const targetDirectors = (options.director || '')
    .split(/[\s,，、/|]+/)
    .map(d => d.trim())
    .filter(d => d.length >= 2);

  // 第一步：否决条件严格筛选
  interface QualifiedCandidate {
    cand: GzSearchResult;
    hasFormSuffix: boolean;
    candNorm: string;
    candTag0: string;
  }

  const qualified: QualifiedCandidate[] = [];

  for (const cand of candidates) {
    const rawCandTitle = cand.title || '';
    const candNorm = normalizeTitleForMatch(rawCandTitle);
    const candTags = cand.tags || [];
    const candTag0 = candTags[0] || '';
    const isCandShortDrama = candTag0 === '短剧' || cand.d_type === '29';

    // 否决条件 1: 片名含「解说」，或候选分类是「短剧」
    if (/解说/.test(rawCandTitle) || /解说/.test(candNorm)) {
      continue;
    }
    if (isCandShortDrama && !isShortDramaExpected) {
      continue;
    }

    // 否决条件 2: 类型不符与动漫/真人连续剧绝对隔离
    const isCandAnime = candTag0 === '动漫' || cand.d_type === '30' || /动画版|动漫版/.test(rawCandTitle);
    const isCandLiveTv = (candTag0 === '连续剧' || cand.d_type === '2') && !isCandAnime;

    // 铁律：动漫永远不配给真人连续剧，反过来也一样
    if (isAnime && (isCandLiveTv || /剧版|真人版|电视剧版/.test(rawCandTitle))) {
      continue;
    }
    if ((isTv || (!isAnime && !isMovie && !isVariety && !isDoc)) && isCandAnime) {
      continue;
    }

    if (isTv) {
      if (!['连续剧', '综艺', '纪录片'].includes(candTag0) && candTag0 !== '') {
        continue;
      }
    } else if (isAnime) {
      if (!['动漫', '连续剧'].includes(candTag0) && candTag0 !== '') {
        continue;
      }
    } else if (isVariety) {
      if (!['综艺', '连续剧'].includes(candTag0) && candTag0 !== '') {
        continue;
      }
    } else if (isDoc) {
      if (!['纪录片', '连续剧'].includes(candTag0) && candTag0 !== '') {
        continue;
      }
    } else if (isMovie) {
      const allowed = ['电影'];
      if (isAnime || /动画|动漫/.test(rawCat)) allowed.push('动漫');
      if (isDoc || /纪录|记录/.test(rawCat)) allowed.push('纪录片');
      if (!allowed.includes(candTag0) && candTag0 !== '') {
        continue;
      }
    }

    // 否决条件 3: 片名不是同一部
    const matchResult = checkCandidateTitleMatch(candNorm, validTargetNames);
    if (!matchResult.matched) {
      continue;
    }

    // 否决条件 4: 年份相差超过 1 年
    const candYear = cand.year ? parseInt(cand.year, 10) : null;
    if (targetYear !== null && !isNaN(targetYear) && candYear !== null && !isNaN(candYear)) {
      if (Math.abs(targetYear - candYear) > 1) {
        continue;
      }
    }

    // 否决条件 5: 集数
    const c = cand.episodesCount || 0;
    if (isMovie) {
      if (c > 3) {
        continue;
      }
    } else if (E !== null && E > 0 && c > 0) {
      if (c < E * 0.5 - 1) {
        continue;
      }
      if (targetYear === null && candYear === null) {
        if (c > E * 1.5 + 2) {
          continue;
        }
      }
    }

    qualified.push({
      cand,
      hasFormSuffix: matchResult.hasFormSuffix,
      candNorm,
      candTag0,
    });
  }

  // 全部被淘汰就返回 null
  if (qualified.length === 0) {
    return null;
  }

  // 第二步：在合格候选之间进行精细化打分
  let bestCandidate: GzSearchResult | null = null;
  let bestScore = -99999;

  for (const q of qualified) {
    const { cand, hasFormSuffix, candTag0 } = q;
    let score = 0;

    // 1. 片名得分：完全相同 +30，带形式后缀 +20
    if (!hasFormSuffix) {
      score += 30;
    } else {
      score += 20;
    }

    // 2. 类型为首选 +20
    if (isTv && candTag0 === '连续剧') score += 20;
    else if (isAnime && candTag0 === '动漫') score += 20;
    else if (isMovie && candTag0 === '电影') score += 20;
    else if (isVariety && candTag0 === '综艺') score += 20;
    else if (isDoc && candTag0 === '纪录片') score += 20;

    // 3. 年份得分：相同 +15，差 1 年 +5
    const candYear = cand.year ? parseInt(cand.year, 10) : null;
    if (targetYear !== null && !isNaN(targetYear) && candYear !== null && !isNaN(candYear)) {
      const diff = Math.abs(targetYear - candYear);
      if (diff === 0) score += 15;
      else if (diff === 1) score += 5;
    }

    // 4. 集数得分：越接近 E 越高: +15 * (1 - |c - E| / E)
    const c = cand.episodesCount || 0;
    if (E !== null && E > 0 && c > 0) {
      const ratio = 1 - Math.abs(c - E) / E;
      if (ratio > 0) {
        score += 15 * ratio;
      }
    }

    // 5. 主演或导演重合得分：每重合一人 +8，最多 +24
    let peopleOverlap = 0;
    const candActors = (cand.actors || '')
      .split(/[\s,，、/|]+/)
      .map(a => a.trim())
      .filter(a => a.length >= 2);
    const candDirectors = (cand.director || '')
      .split(/[\s,，、/|]+/)
      .map(d => d.trim())
      .filter(d => d.length >= 2);

    for (const actor of targetActors) {
      if (candActors.includes(actor)) peopleOverlap++;
    }
    for (const dir of targetDirectors) {
      if (candDirectors.includes(dir)) peopleOverlap++;
    }
    score += Math.min(24, peopleOverlap * 8);

    if (score > bestScore) {
      bestScore = score;
      bestCandidate = cand;
    }
  }

  return bestCandidate;
}

// 默认基线密钥 (若 KV 未配置或降级时使用)
const DEFAULT_CONFIG: GzConfig = {
  baseUrl: 'https://haiwaiapi.1fc8ab0.com',
  key: '181cc88340ae5b2b',
  iv: '4423d1e2773476ce',
  enabled: true,
  updatedAt: '2026-09-28T11:00:00Z',
};

// 内存高频缓存（TTL 2小时）
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

function getSpoofedHeaders() {
  return {
    'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
    'Origin': 'https://gz360.tv',
    'Referer': 'https://gz360.tv/',
    'Sec-Ch-Ua': '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
    'Sec-Ch-Ua-Mobile': '?0',
    'Sec-Ch-Ua-Platform': '"macOS"',
    'Sec-Fetch-Dest': 'empty',
    'Sec-Fetch-Mode': 'cors',
    'Sec-Fetch-Site': 'cross-site',
  };
}

async function getCryptoKey(keyStr: string): Promise<CryptoKey> {
  const keyBuf = new TextEncoder().encode(keyStr);
  return crypto.subtle.importKey(
    'raw',
    keyBuf,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );
}

export class GzProvider {
  private config: GzConfig;

  constructor(customConfig?: Partial<GzConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...customConfig };
  }

  public updateConfig(newConfig: Partial<GzConfig>) {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * AES-128-CBC 原生 Web Crypto 加密 (Hex 输出)
   */
  public async encrypt(plaintext: string): Promise<string> {
    const cryptoKey = await getCryptoKey(this.config.key);
    const ivBuf = new TextEncoder().encode(this.config.iv);
    const encBuf = await crypto.subtle.encrypt(
      { name: 'AES-CBC', iv: ivBuf },
      cryptoKey,
      new TextEncoder().encode(plaintext)
    );
    return Array.from(new Uint8Array(encBuf))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  /**
   * AES-128-CBC 原生 Web Crypto 解密 (Hex 输入，返回反序列化对象)
   */
  public async decrypt<T = any>(hexCiphertext: string): Promise<T> {
    const cryptoKey = await getCryptoKey(this.config.key);
    const ivBuf = new TextEncoder().encode(this.config.iv);
    const hex = hexCiphertext.trim();
    const match = hex.match(/.{1,2}/g) || [];
    const cipherBytes = new Uint8Array(match.map(b => parseInt(b, 16)));
    const decBuf = await crypto.subtle.decrypt(
      { name: 'AES-CBC', iv: ivBuf },
      cryptoKey,
      cipherBytes
    );
    const decText = new TextDecoder().decode(decBuf);
    return JSON.parse(decText) as T;
  }

  /**
   * 基础 API 请求封装 (自动加密 Payload 与解密 Response)
   */
  public async request<T = any>(endpoint: string, payload: Record<string, any>): Promise<T | null> {
    if (!this.config.enabled) {
      return null;
    }

    try {
      const encParams = await this.encrypt(JSON.stringify(payload));
      const url = `${this.config.baseUrl}${endpoint}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getSpoofedHeaders(),
        },
        body: JSON.stringify({ params: encParams }),
      });

      if (!response.ok) {
        return null;
      }

      const json = await response.json();
      if (json.code === 200 && typeof json.data === 'string' && json.data.length > 0) {
        return await this.decrypt<T>(json.data);
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 搜索视频 (按关键词匹配内部 vod_id，包含完整分类与元数据)
   */
  public async search(title: string): Promise<Array<GzSearchResult> | null> {
    const cacheKey = `search:${title}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const res = await this.request<{ list?: Array<any> }>('/H5/Search/GetConditionList', {
      keywords: title,
      page: 1,
      pageSize: 10,
      tid: 0,
      area: 0,
      year: 0,
      sort: 'd_id',
    });

    if (!res || !res.list) return null;

    const list: GzSearchResult[] = res.list.map((item: any) => ({
      vod_id: String(item.vod_id),
      title: String(item.vod_name || item.vod_title || ''),
      year: String(item.vod_year || ''),
      score: parseFloat(item.vod_scroe || '0') || 0,
      tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
      d_type: String(item.d_type || ''),
      director: String(item.vod_directed || ''),
      actors: String(item.vod_actor || ''),
      episodesCount: parseInt(item.vod_continu || item.d_total || '0', 10) || 0,
      pic: String(item.vod_pic || ''),
    }));

    memoryCache.set(cacheKey, { data: list, expiresAt: Date.now() + 1000 * 60 * 60 * 6 }); // 6小时缓存
    return list;
  }

  /**
   * 获取某部影视的全集播放源列表 (m3u8 直链)
   */
  public async getPlayList(vodId: string): Promise<Array<{ episode: string; url: string }> | null> {
    const cacheKey = `playlist:${vodId}`;
    const cached = memoryCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const res = await this.request<{ urls?: Array<any> }>('/H5/Resource/GetOnePlayList', {
      vod_id: vodId,
      pageSize: 0,
      page: 1,
    });

    if (!res || !res.urls || !Array.isArray(res.urls)) {
      return null;
    }

    const episodes = res.urls.map((item: any, idx: number) => ({
      episode: String(item.name || `第${idx + 1}集`),
      url: String(item.url || ''),
    })).filter((item: any) => item.url.startsWith('http'));

    if (episodes.length > 0) {
      memoryCache.set(cacheKey, { data: episodes, expiresAt: Date.now() + 1000 * 60 * 60 * 4 }); // 4小时缓存
    }

    return episodes;
  }
}

export const gzProvider = new GzProvider();
