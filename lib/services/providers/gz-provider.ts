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
   * 搜索视频 (按关键词匹配内部 vod_id)
   */
  public async search(title: string): Promise<Array<{ vod_id: string; title: string; year: string }> | null> {
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

    const list = res.list.map((item: any) => ({
      vod_id: String(item.vod_id),
      title: String(item.vod_name || item.vod_title || ''),
      year: String(item.vod_year || ''),
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
