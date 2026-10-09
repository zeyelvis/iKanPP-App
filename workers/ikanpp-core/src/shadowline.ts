/**
 * ShadowLine Engine for Cloudflare Edge Worker
 * 
 * 核心特性：
 * 1. 100% 基于原生 Web Crypto API (crypto.subtle) 的 AES-128-CBC 动态加解密
 * 2. 轨道 A 铁律：输出的 m3u8 直连源站 CDN，零反代、零切片修改
 * 3. 严格华语内容安全校验
 */

import { Env, CandidateItem, isCleanChineseTitle } from './types';

export interface ShadowLineConfig {
  enabled: boolean;
  baseUrl: string;
  key: string;
  iv: string;
  updatedAt: string;
}

const DEFAULT_CONFIG: ShadowLineConfig = {
  enabled: true,
  baseUrl: 'https://haiwaiapi.1fc8ab0.com',
  key: '181cc88340ae5b2b',
  iv: '4423d1e2773476ce',
  updatedAt: '2026-09-28T11:00:00Z',
};

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Origin': 'https://gz360.tv',
  'Referer': 'https://gz360.tv/',
};

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

async function encrypt(plaintext: string, key: string, iv: string): Promise<string> {
  const cryptoKey = await getCryptoKey(key);
  const ivBuf = new TextEncoder().encode(iv);
  const encBuf = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: ivBuf },
    cryptoKey,
    new TextEncoder().encode(plaintext)
  );
  return Array.from(new Uint8Array(encBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function decrypt<T = any>(hexCiphertext: string, key: string, iv: string): Promise<T> {
  const cryptoKey = await getCryptoKey(key);
  const ivBuf = new TextEncoder().encode(iv);
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

export async function getShadowLineConfig(env: Env): Promise<ShadowLineConfig> {
  try {
    const raw = await env.KVIDEO_KV.get('shadowline:config');
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('[ShadowLine Worker] 读取 KV 配置失败:', err);
  }
  return DEFAULT_CONFIG;
}

/**
 * 按片名搜索候选。上游 2026-10 前后撤掉了 /H5/Resource/GetVodSearch（返回「不存在的路由」），
 * 网页搜索改用 /H5/Search/GetConditionList（参数 keywords / page / pageSize，加密方式不变）。
 * 返回的字段保持原样（vod_id、title、year、category、total_episodes、pic），另加调用方区分同名作品
 * 用的 tags、episodesCount、actors、director。
 */
export async function searchShadowLine(
  keyword: string,
  config: ShadowLineConfig
): Promise<any[]> {
  if (!keyword || !keyword.trim()) return [];
  const clean = keyword.trim();

  try {
    const payload = JSON.stringify({
      keywords: clean,
      page: 1,
      pageSize: 20,
    });
    const enc = await encrypt(payload, config.key, config.iv);

    const res = await fetch(`${config.baseUrl}/H5/Search/GetConditionList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...BROWSER_HEADERS,
      },
      body: JSON.stringify({ params: enc }),
    });

    if (!res.ok) return [];
    const json: any = await res.json();
    if (!json.data || typeof json.data !== 'string') {
      if (json.code !== undefined && json.code !== 200) console.warn('[ShadowLine Worker] 搜索接口返回', json.code, json.message);
      return [];
    }

    const decrypted = await decrypt<any>(json.data, config.key, config.iv);
    const list = decrypted?.list || [];

    return list.map((item: any) => {
      const tags: string[] = Array.isArray(item.tags) ? item.tags.map((t: unknown) => String(t)) : [];
      const episodes = Number(item.vod_continu) || (Array.isArray(item.vurlList) ? item.vurlList.length : 0);
      return {
        vod_id: String(item.vod_id),
        title: String(item.vod_name || '').trim(),
        year: String(item.vod_year || ''),
        category: tags[0] || '',
        total_episodes: episodes,
        pic: item.vod_pic || '',
        tags,
        episodesCount: episodes,
        actors: item.vod_actor || '',
        director: item.vod_directed || '',
      };
    });
  } catch (err) {
    console.warn('[ShadowLine Worker] 搜索失败:', err);
    return [];
  }
}

/**
 * 一部作品的全部分集。上游的 GetVodInfo 现在只给第一集，完整列表改由网页播放页用的
 * /H5/Resource/GetOnePlayList（vod_id、pageSize 0 表示全部、page 1）提供；它失败时退回 GetVodInfo。
 */
export async function getShadowLinePlayList(
  vodId: string,
  config: ShadowLineConfig
): Promise<Array<{ episode: string; url: string }>> {
  if (!vodId) return [];
  const full = await getFullPlayList(vodId, config);
  if (full.length > 0) return full;
  return getPlayListFromVodInfo(vodId, config);
}

async function getFullPlayList(vodId: string, config: ShadowLineConfig): Promise<Array<{ episode: string; url: string }>> {
  try {
    const enc = await encrypt(JSON.stringify({ vod_id: vodId, pageSize: 0, page: 1 }), config.key, config.iv);
    const res = await fetch(`${config.baseUrl}/H5/Resource/GetOnePlayList`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...BROWSER_HEADERS,
      },
      body: JSON.stringify({ params: enc }),
    });
    if (!res.ok) return [];
    const json: any = await res.json();
    if (!json.data || typeof json.data !== 'string') return [];
    const decrypted = await decrypt<any>(json.data, config.key, config.iv);
    const urls: any[] = Array.isArray(decrypted?.urls) ? decrypted.urls : [];
    return urls
      .filter((u) => typeof u?.url === 'string' && u.url.startsWith('http'))
      .sort((a, b) => (Number(a.sort) || 0) - (Number(b.sort) || 0))
      .map((u, i) => ({ episode: String(u.name ?? '').trim() || `第${i + 1}集`, url: u.url.trim() }));
  } catch (err) {
    console.warn('[ShadowLine Worker] 获取完整分集失败:', err);
    return [];
  }
}

async function getPlayListFromVodInfo(vodId: string, config: ShadowLineConfig): Promise<Array<{ episode: string; url: string }>> {

  try {
    const payload = JSON.stringify({ vod_id: vodId });
    const enc = await encrypt(payload, config.key, config.iv);

    const res = await fetch(`${config.baseUrl}/H5/Resource/GetVodInfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...BROWSER_HEADERS,
      },
      body: JSON.stringify({ params: enc }),
    });

    if (!res.ok) return [];
    const json: any = await res.json();
    if (!json.data || typeof json.data !== 'string') return [];

    const decrypted = await decrypt<any>(json.data, config.key, config.iv);
    const vodInfo = decrypted?.vodInfo;
    if (!vodInfo) return [];

    // 解析 play_url 字符串
    // 格式如: "第01集$https://...m3u8#第02集$https://...m3u8" 或纯 URL
    const rawPlayUrl = vodInfo.play_url || '';
    if (!rawPlayUrl) return [];

    const episodes: Array<{ episode: string; url: string }> = [];
    const parts = rawPlayUrl.split('#');

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i].trim();
      if (!part) continue;

      if (part.includes('$')) {
        const [epName, epUrl] = part.split('$');
        if (epUrl && epUrl.startsWith('http')) {
          episodes.push({
            episode: epName.trim() || `第${i + 1}集`,
            url: epUrl.trim(),
          });
        }
      } else if (part.startsWith('http')) {
        episodes.push({
          episode: parts.length === 1 ? '4K 极清' : `第${i + 1}集`,
          url: part,
        });
      }
    }

    return episodes;
  } catch (err) {
    console.warn('[ShadowLine Worker] 获取播放列表失败:', err);
    return [];
  }
}

/**
 * 候选条目多维消歧匹配
 */
export function matchBestCandidate(
  candidates: any[],
  target: {
    title: string;
    year?: string;
    category?: string;
  }
): any | null {
  if (!candidates || candidates.length === 0) return null;

  const targetTitle = target.title.replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();

  // 1. 标题完全全等
  const exact = candidates.find(c => {
    const cTitle = (c.title || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
    return cTitle === targetTitle;
  });
  if (exact) return exact;

  // 2. 年份辅助加权
  if (target.year) {
    const yearMatch = candidates.find(c => {
      const cTitle = (c.title || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
      const isSub = cTitle.includes(targetTitle) || targetTitle.includes(cTitle);
      return isSub && String(c.year) === String(target.year);
    });
    if (yearMatch) return yearMatch;
  }

  // 3. 包含关系最近匹配
  const subMatch = candidates.find(c => {
    const cTitle = (c.title || '').replace(/[《》【】\[\]（）()·\s:：\-]/g, '').toLowerCase();
    return cTitle.includes(targetTitle) || targetTitle.includes(cTitle);
  });
  if (subMatch) return subMatch;

  return candidates[0];
}
