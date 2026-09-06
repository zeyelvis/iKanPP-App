/**
 * 瓜子影视 (gz360.tv) API 适配器
 *
 * 核心能力：
 * 1. AES-128-CBC 双向加解密（请求体 + 响应体）
 * 2. 搜索 → 标准化 VideoItem[] 输出
 * 3. 视频详情 + 播放列表合并直出（含 m3u8 直链）
 * 4. 热搜榜 / 分类列表
 *
 * API 规格：
 * - Host: haiwaiapi.1fc8ab0.com
 * - 路径前缀: /H5
 * - 加密: AES-128-CBC, Key=181cc88340ae5b2b, IV=4423d1e2773476ce
 * - 请求: POST JSON {"params": "<加密hex>"}
 * - 响应: {"data": "<加密hex>", "code": 200}
 */

// ─── 加密常量 ───────────────────────────────────────────────────────────────

const GZ360_API_HOST = 'https://haiwaiapi.1fc8ab0.com';
const GZ360_PATH_PREFIX = '/H5';

// AES-128-CBC 密钥（海外线路专用）
const AES_KEY_HEX = '181cc88340ae5b2b';
const AES_IV_HEX = '4423d1e2773476ce';

// ─── 类型定义 ───────────────────────────────────────────────────────────────

export interface Gz360SearchItem {
  vod_id: string | number;
  vod_name: string;
  vod_pic?: string;
  vod_picthumb?: string;
  vod_scroe?: string;
  vod_continu?: string;
  vod_area?: string;
  vod_year?: string;
  t_id?: number;
  d_total?: string;
  is_end?: boolean;
  videoTag?: string[];
}

export interface Gz360Episode {
  name: string;
  url: string;
  vurl_id: number;
  sort: number;
  resolution?: string;
}

export interface Gz360VodInfo {
  vod_id: string;
  vod_name: string;
  vod_pic?: string;
  vod_scroe?: string;
  vod_year?: string;
  vod_area?: string;
  vod_actor?: string;
  vod_director?: string;
  vod_use_content?: string;
  vod_continu?: string;
  vod_total?: string;
  videoTag?: string[];
  play_url?: string;
  default_play_name?: string;
  cid?: string;
}

export interface Gz360PlayList {
  total_vod_vurl: string;
  vod_continu: string;
  d_total: string;
  new_continue?: string;
  is_end: boolean;
  tags?: string[];
  urls: Gz360Episode[];
}

export interface Gz360DetailResult {
  vod_id: string;
  vod_name: string;
  vod_pic: string;
  vod_year: string;
  vod_area: string;
  vod_actor: string;
  vod_director: string;
  vod_content: string;
  type_name: string;
  episodes: Array<{ name: string; url: string; index: number }>;
}

export interface Gz360HotItem {
  id: string;
  vod_keyword: string;
  vod_show: string;
}

export interface Gz360Category {
  id: number;
  name: string;
}

// ─── 加解密 ─────────────────────────────────────────────────────────────────

/**
 * 将 UTF-8 字符串转为 Uint8Array
 */
function utf8Encode(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

/**
 * 将 Uint8Array 转为 UTF-8 字符串
 */
function utf8Decode(buf: Uint8Array): string {
  return new TextDecoder().decode(buf);
}

/**
 * 将 hex 字符串转为 Uint8Array
 */
function hexToBytes(hex: string): Uint8Array {
  const h = hex.toLowerCase();
  const bytes = new Uint8Array(h.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = parseInt(h.substring(i * 2, i * 2 + 2), 16);
  }
  return bytes;
}

/**
 * 将 Uint8Array 转为 hex 字符串
 */
function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * AES-128-CBC 加密（输出 hex）
 * 使用 Web Crypto API，兼容 Edge Runtime
 */
async function encrypt(plaintext: string): Promise<string> {
  const keyData = utf8Encode(AES_KEY_HEX);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData.buffer as ArrayBuffer,
    { name: 'AES-CBC' },
    false,
    ['encrypt']
  );

  const iv = utf8Encode(AES_IV_HEX);
  const data = utf8Encode(plaintext);

  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: iv.buffer as ArrayBuffer },
    key,
    data.buffer as ArrayBuffer
  );

  return bytesToHex(new Uint8Array(encrypted));
}

/**
 * AES-128-CBC 解密（输入 hex）
 * 使用 Web Crypto API，兼容 Edge Runtime
 */
async function decrypt(cipherHex: string): Promise<string> {
  const keyData = utf8Encode(AES_KEY_HEX);
  const key = await crypto.subtle.importKey(
    'raw',
    keyData.buffer as ArrayBuffer,
    { name: 'AES-CBC' },
    false,
    ['decrypt']
  );

  const iv = utf8Encode(AES_IV_HEX);
  const cipherBytes = hexToBytes(cipherHex);

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: iv.buffer as ArrayBuffer },
    key,
    cipherBytes.buffer as ArrayBuffer
  );

  return utf8Decode(new Uint8Array(decrypted));
}

// ─── HTTP 请求封装 ──────────────────────────────────────────────────────────

/**
 * 向瓜子影视海外 API 发送加密 POST 请求
 */
async function gz360Post<T = any>(path: string, body: Record<string, any> = {}, timeoutMs = 5000): Promise<T> {
  const plaintext = JSON.stringify(body);
  const encryptedParams = await encrypt(plaintext);

  const url = `${GZ360_API_HOST}${GZ360_PATH_PREFIX}${path}`;
  const postBody = JSON.stringify({ params: encryptedParams });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15',
        'Origin': 'https://gz360.tv',
        'Referer': 'https://gz360.tv/',
      },
      body: postBody,
      signal: controller.signal,
    });

    if (!res.ok) {
      throw new Error(`gz360 API HTTP ${res.status}`);
    }

    const json = await res.json();

    // 响应体 data 字段是加密的 hex 字符串
    if (json.data && typeof json.data === 'string' && json.data.length > 0) {
      const decrypted = await decrypt(json.data);
      json.data = JSON.parse(decrypted);
    }

    return json as T;
  } finally {
    clearTimeout(timer);
  }
}

// ─── 内存缓存 ───────────────────────────────────────────────────────────────

const cache = new Map<string, { data: any; expireAt: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 分钟

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (entry && entry.expireAt > Date.now()) {
    return entry.data as T;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, expireAt: Date.now() + CACHE_TTL });
}

// ─── 业务接口 ───────────────────────────────────────────────────────────────

/**
 * 搜索瓜子影视
 * 返回标准化的视频列表（兼容 VideoItem 接口）
 */
export async function searchGz360(
  keyword: string,
  page: number = 1,
  categoryId: number = 0
): Promise<{
  results: Array<{
    vod_id: string | number;
    vod_name: string;
    vod_pic?: string;
    vod_remarks?: string;
    vod_year?: string;
    vod_area?: string;
    type_name?: string;
    source: string;
  }>;
  total: number;
}> {
  try {
    const res = await gz360Post<{
      data?: {
        list?: Gz360SearchItem[];
        total?: number;
      };
      code?: number;
    }>('/Search/GetList', { keyword, page, category_id: categoryId }, 6000);

    if (res.code === 200 && res.data?.list) {
      const results = res.data.list.map((item) => ({
        vod_id: item.vod_id,
        vod_name: item.vod_name,
        vod_pic: item.vod_pic || item.vod_picthumb || '',
        vod_remarks: item.vod_continu
          ? (item.is_end ? `全${item.d_total || item.vod_continu}集` : `更新至${item.vod_continu}集`)
          : '',
        vod_year: item.vod_year || '',
        vod_area: item.vod_area || '',
        type_name: item.videoTag?.[0] || mapTypeId(item.t_id),
        source: 'gz360',
      }));

      return { results, total: res.data.total || results.length };
    }

    return { results: [], total: 0 };
  } catch (e) {
    console.error('[gz360] searchGz360 error:', e);
    return { results: [], total: 0 };
  }
}

/**
 * 获取瓜子影视视频详情（含播放列表直出）
 */
export async function getGz360Detail(vodId: string | number): Promise<Gz360DetailResult | null> {
  const cacheKey = `gz360_detail_${vodId}`;
  const cached = getCached<Gz360DetailResult>(cacheKey);
  if (cached) return cached;

  try {
    // 并发请求详情和播放列表
    const [infoRes, playRes] = await Promise.all([
      gz360Post<{ data?: { vodInfo?: Gz360VodInfo }; code?: number }>(
        '/Resource/GetVodInfo',
        { vod_id: Number(vodId) }
      ),
      gz360Post<{ data?: Gz360PlayList; code?: number }>(
        '/Resource/GetOnePlayList',
        { vod_id: Number(vodId) }
      ),
    ]);

    if (infoRes.code !== 200 || !infoRes.data?.vodInfo) {
      console.error('[gz360] GetVodInfo failed:', infoRes);
      return null;
    }

    const info = infoRes.data.vodInfo;

    // 构建分集列表
    let episodes: Array<{ name: string; url: string; index: number }> = [];

    if (playRes.code === 200 && playRes.data?.urls?.length) {
      episodes = playRes.data.urls
        .sort((a, b) => a.sort - b.sort)
        .map((ep, idx) => ({
          name: ep.name || `第${idx + 1}集`,
          url: ep.url,
          index: idx,
        }));
    } else if (info.play_url) {
      // 回退到详情页自带的首集链接
      episodes = [
        {
          name: info.default_play_name || '第1集',
          url: info.play_url,
          index: 0,
        },
      ];
    }

    const result: Gz360DetailResult = {
      vod_id: String(info.vod_id || vodId),
      vod_name: (info.vod_name || '').trim(),
      vod_pic: info.vod_pic || '',
      vod_year: info.vod_year || '',
      vod_area: info.vod_area || '',
      vod_actor: info.vod_actor || '',
      vod_director: info.vod_director || '',
      vod_content: cleanHtmlContent(info.vod_use_content || ''),
      type_name: info.videoTag?.join(', ') || mapTypeId(Number(info.cid)) || '',
      episodes,
    };

    setCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error('[gz360] getGz360Detail error:', e);
    return null;
  }
}

/**
 * 获取热搜榜 + 分类列表
 */
export async function getGz360HotSearch(): Promise<{
  hotList: Gz360HotItem[];
  categories: Gz360Category[];
} | null> {
  const cacheKey = 'gz360_hot_search';
  const cached = getCached<{ hotList: Gz360HotItem[]; categories: Gz360Category[] }>(cacheKey);
  if (cached) return cached;

  try {
    // 热搜接口不需要加密，直接 POST JSON
    const res = await fetch(`${GZ360_API_HOST}${GZ360_PATH_PREFIX}/Search/ShowHots`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        'Origin': 'https://gz360.tv',
      },
      body: JSON.stringify({}),
    });

    if (!res.ok) return null;

    const json = await res.json();
    if (json.code !== 200 || !json.data) return null;

    const result = {
      hotList: (json.data.hot_list || []) as Gz360HotItem[],
      categories: (json.data.categories || []) as Gz360Category[],
    };

    setCache(cacheKey, result);
    return result;
  } catch (e) {
    console.error('[gz360] getGz360HotSearch error:', e);
    return null;
  }
}

/**
 * 获取首页推荐（Banner + 分类推荐）
 */
export async function getGz360Home(): Promise<any | null> {
  const cacheKey = 'gz360_home';
  const cached = getCached<any>(cacheKey);
  if (cached) return cached;

  try {
    const res = await gz360Post('/Index/CategoryList', {});
    if (res.code === 200 && res.data) {
      setCache(cacheKey, res.data);
      return res.data;
    }
    return null;
  } catch (e) {
    console.error('[gz360] getGz360Home error:', e);
    return null;
  }
}

// ─── 工具函数 ───────────────────────────────────────────────────────────────

/**
 * 将瓜子影视的分类 ID 映射为中文类型名
 */
function mapTypeId(typeId?: number): string {
  if (!typeId) return '';
  const map: Record<number, string> = {
    1: '电影',
    2: '连续剧',
    3: '综艺',
    4: '动漫',
    39: '短剧解说',
    64: '短剧',
    70: '电竞解说',
    71: '体育解说',
    72: '音乐',
    73: '电影解说',
    74: 'AI漫剧',
  };
  return map[typeId] || '';
}

/**
 * 清理 HTML 内容中的标签和多余空白
 */
function cleanHtmlContent(html: string): string {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
