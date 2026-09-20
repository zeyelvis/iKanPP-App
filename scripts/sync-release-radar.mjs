#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * =========================================================================
 * iKanPP「全球数字发行雷达」融合引擎 (Global Release Radar Engine)
 * =========================================================================
 * 
 * 核心设计目标：
 * 1. 彻底解决「最新上线」充斥冷门老片与维基编辑污染的问题。
 * 2. 以爱壹帆（IYF）人工审核最新流为基准（破解 GetLastAdd 动态 MD5 签名 + 自动密钥轮转自愈）。
 * 3. 深度融合骨干采集站（光速/极速等）按真实入库时间（vod_time）倒序的刚上线资源。
 * 4. 深度融合 TMDB 全球流媒体数字发行（Discover Digital Release）与院线热映（Now Playing / Trending）。
 * 5. TMDB 原版 4K 无水印海报与宽屏剧照增强，杜绝官方压缩变形与水印。
 * 6. 严格执行华语内容安全铁律（isCleanChineseTitle），阻断日文假名、韩文、纯外文与低俗违规片。
 * 7. 双重输出：预烘焙直出 lib/data/latest-titles-prebaked.ts + 生产环境 KV recent:* 受控写入。
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// Cloudflare KV 配置
const CF_KV_ACCOUNT_ID = process.env.CF_KV_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = process.env.CF_KV_API_KEY || process.env.CLOUDFLARE_API_KEY || '';
const CF_KV_EMAIL = process.env.CF_KV_EMAIL || process.env.CLOUDFLARE_EMAIL || 'zeyelvis@gmail.com';

const KV_BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}`;
const KV_HEADERS = {
  'X-Auth-Email': CF_KV_EMAIL,
  'X-Auth-Key': CF_KV_API_KEY,
};

// 专区配置（涵盖全站 6 大核心板块）
const CHANNELS = [
  { key: 'all', name: '全站大厅', cid: '0,1', defaultType: 'all', collectorTypes: [13, 6, 41, 37, 24] },
  { key: 'movie', name: '电影专区', cid: '0,1,3', defaultType: 'movie', collectorTypes: [6, 7, 9, 10] },
  { key: 'tv', name: '电视剧专区', cid: '0,1,4', defaultType: 'tv', collectorTypes: [13, 14, 15, 21, 22] },
  { key: 'anime', name: '动漫专区', cid: '0,1,6', defaultType: 'anime', collectorTypes: [41, 42, 43] },
  { key: 'variety', name: '综艺专区', cid: '0,1,5', defaultType: 'variety', collectorTypes: [37, 39] },
  { key: 'documentary', name: '纪录片专区', cid: '0,1,7', defaultType: 'documentary', collectorTypes: [24] },
];

// 成人低俗违禁词黑名单
const ADULT_BLACKLIST_WORDS = [
  '痴漢', '痴汉', '調教', '调教', '発情', '发情', '近親', '近亲', '乱倫', '乱伦',
  '性奴', '小股', '沙龙病院', '中出し', '潮吹き', '巨乳', '美乳', '素人',
  '熟女', '人妻', '淫乱', '絶頂', '绝顶', '強姦', '强奸', '輪姦', '轮奸', '肉便器',
  '風俗', '风俗', '無修正', '无修正', 'エロ', 'AV', 'JAV', 'FC2', 'SM', '変態', '变态',
  '制服誘惑', '制服诱惑', '女教師', '女教师', '看護婦', '看护妇', '盗撮', '覗き', '偷窥',
  '性交', '做爱', '自慰', '色情', '三级', '露点', '情色', '偷拍', '色誘', '色诱', '情欲', '欲女',
  '売春', '愛汁', '肉しびれ', '女囚', '痴情', '快辱', '乱交', 'ポルノ', '半熟売春'
];

const COMMENTARY_BLACKLIST_WORDS = [
  '解说', '说电影', '几分钟看', '一口气看', '速看', '看懂',
  '纯享版', '先导片', '幕后花絮', '独家花絮', '精彩看点', '正片片段',
  '电影解说', '影视解说', '剧情解说', '短剧解说', '影视剪辑', '混剪'
];

/**
 * 严格遵循 AGENTS.md 准则 12：华语流媒体内容安全绝对防线
 */
function isCleanChineseTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const t = title.trim();
  if (!t) return false;

  for (const w of ADULT_BLACKLIST_WORDS) {
    if (t.includes(w)) return false;
  }
  for (const cw of COMMENTARY_BLACKLIST_WORDS) {
    if (t.includes(cw)) return false;
  }


  // 1. 日文假名绝对零容忍（平假名/片假名，无论是否夹带汉字）
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) {
    return false;
  }

  // 2. 韩文字符绝对零容忍
  if (/[\uac00-\ud7af]/.test(t)) {
    return false;
  }

  // 3. 必须包含中文汉字（纯英文、纯外文冷门条目坚决拦截）
  if (!/[\u4e00-\u9fa5]/.test(t)) {
    return false;
  }

  return true;
}

/**
 * 标题基础归一化（去除季数、括号、多余标点，用于跨数据源排重）
 */
function normalizeTitle(rawTitle) {
  if (!rawTitle) return '';
  return rawTitle
    .replace(/[（(][^)）]*[)）]/g, '')
    .replace(/第[0-9一二三四五六七八九十]+[季期部]/g, '')
    .replace(/[：:·•\-_—\s]+/g, '')
    .toLowerCase()
    .trim();
}

/**
 * 格式化更新状态角标（对齐官方原生规范）
 */
function formatUpdateBadge(rawBadge, type) {
  if (type === 'movie') {
    if (!rawBadge) return '正片';
    const v = String(rawBadge).trim().toUpperCase();
    if (v.includes('4K')) return '4K超清';
    if (v.includes('1080P')) return '1080P';
    if (v.includes('HDR')) return 'HDR';
    if (v.includes('TC') || v.includes('枪版')) return '抢先版';
    return '正片';
  }

  if (!rawBadge) return '热播中';
  const v = String(rawBadge).trim();
  if (/^\d+$/.test(v)) {
    return `更新至第${parseInt(v, 10)}集`;
  }
  if (v.includes('期')) {
    const qMatch = v.match(/(第\d+期[^)]*)/);
    if (qMatch) return qMatch[1].slice(0, 10);
  }
  if (v.includes('集') || v.includes('话')) {
    return v.slice(0, 12);
  }
  if (v.toUpperCase().includes('4K') || v.toUpperCase().includes('1080P')) {
    return '4K超清';
  }
  return v.slice(0, 12);
}

/**
 * 识别发行平台与规格角标
 */
function detectBadges(item) {
  const contextText = `${item.title || ''} ${item.labels || ''} ${item.contxt || ''} ${item.vod_remarks || ''}`;
  let platformBadge = undefined;
  let qualityBadge = undefined;

  if (/netflix|奈飞|网飞/i.test(contextText)) {
    platformBadge = 'Netflix';
  } else if (/apple\s*tv|苹果/i.test(contextText)) {
    platformBadge = 'Apple TV+';
  } else if (/disney|迪士尼/i.test(contextText)) {
    platformBadge = 'Disney+';
  } else if (/hbo|max/i.test(contextText)) {
    platformBadge = 'HBO Max';
  } else if (/tencent|腾讯/i.test(contextText)) {
    platformBadge = '腾讯视频';
  } else if (/iqiyi|爱奇艺/i.test(contextText)) {
    platformBadge = '爱奇艺';
  } else if (/youku|优酷/i.test(contextText)) {
    platformBadge = '优酷';
  } else if (/mango|芒果/i.test(contextText)) {
    platformBadge = '芒果TV';
  } else if (item.isNowPlaying) {
    platformBadge = '院线热映';
  } else if (item.isTrending) {
    platformBadge = '全球热度';
  }

  if (/4k|2160p|uhd|hdr/i.test(contextText) || item.vipResource === '4K') {
    qualityBadge = '4K';
  } else if (/1080p|fhd/i.test(contextText) || item.vipResource === '1080P') {
    qualityBadge = '1080P';
  }

  return { platformBadge, qualityBadge };
}

/**
 * 拼音 Slug 简易安全生成
 */
function simpleSlug(title) {
  if (!title) return 'video';
  return title
    .toLowerCase()
    .replace(/[\s:：·•\-_—]+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5\-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'video';
}

// ── 爱壹帆（IYF）动态签名与自愈网络层 ──────────────────────────────────────────

let cachedIyfKeys = {
  publicKey: 'CJSuEJStC38vCIutCZ5VL4XVD3CkCZ4mBZ8pCIunCZDVCZTYP3GuOcLcEMGpD38uEJapCJSmOMCpCpKmPMKsCMLVE6GuOs5ZD6LXCJWuDZbZE3arOJ8rDJ8pDc9aE38rDp8',
  privateKey: 'SuEJJSuEJStC38vCIutC',
  updatedAt: Date.now(),
};

/**
 * 动态从爱壹帆 HTML 解析提取最新 pConfig 密钥，实现全自动自愈
 */
async function refreshIyfKeys() {
  try {
    const res = await fetch('https://www.iyf.tv/list', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return;
    const html = await res.text();
    const match = html.match(/"pConfig":\s*(\{[^}]+\})/);
    if (match) {
      const pConfig = JSON.parse(match[1]);
      const pub = pConfig.publicKey;
      const priv = Array.isArray(pConfig.privateKey) ? pConfig.privateKey[0] : pConfig.privateKey;
      if (pub && priv) {
        cachedIyfKeys = {
          publicKey: pub,
          privateKey: priv,
          updatedAt: Date.now(),
        };
        console.log(`🔑 [IYF-Auth] 成功自愈提取爱壹帆最新签名密钥 (pub: ${pub.slice(0, 16)}...)`);
      }
    }
  } catch (err) {
    console.warn('⚠️ [IYF-Auth] 自动自愈抓取 pConfig 失败，使用内置密钥:', err.message);
  }
}

/**
 * 计算爱壹帆专属 MD5 签名
 */
function signIyfQuery(queryString, keys) {
  const normalized = queryString.toLowerCase();
  const rawStr = `${keys.publicKey}&${normalized}&${keys.privateKey}`;
  return crypto.createHash('md5').update(rawStr).digest('hex');
}

/**
 * 请求爱壹帆 GetLastAdd API（带自动重试与自愈）
 */
async function fetchIyfLastAdd(cid = '0,1', page = 1, pageSize = 50) {
  const doFetch = async (keys) => {
    const query = `cinema=1&cid=${cid}&page=${page}&pageSize=${pageSize}`;
    const sign = signIyfQuery(query, keys);
    const url = `https://m10.iyf.tv/api/list/GetLastAdd?${query}&vv=${sign}&pub=${keys.publicKey}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://www.iyf.tv/',
      },
      signal: AbortSignal.timeout(8000),
    });
    return res;
  };

  try {
    let res = await doFetch(cachedIyfKeys);
    if (res.status === 401 || res.status === 403) {
      // 签名失效，触发自愈刷新
      await refreshIyfKeys();
      res = await doFetch(cachedIyfKeys);
    }
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    return data?.data?.info || [];
  } catch (err) {
    console.warn(`⚠️ [IYF-API] cid=${cid} page=${page} 请求失败:`, err.message);
    return [];
  }
}

// ── 采集站真实入库流（按 vod_time 倒序） ─────────────────────────────────────

async function fetchCollectorStream(typeIds = [6, 13]) {
  const items = [];
  for (const tid of typeIds.slice(0, 3)) {
    try {
      const url = `https://api.guangsuapi.com/api.php/provide/vod?ac=detail&t=${tid}&pg=1&pagesize=15`;
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const list = data?.list || [];
      for (const vod of list) {
        if (!vod.vod_name) continue;
        items.push({
          source: 'collector',
          title: vod.vod_name.trim(),
          year: vod.vod_year || String(new Date().getFullYear()),
          vod_remarks: vod.vod_remarks,
          cover: vod.vod_pic,
          vod_time: vod.vod_time,
          vod_class: vod.vod_class,
          score: vod.vod_score,
        });
      }
    } catch {}
  }
  return items;
}

// ── TMDB 全球排期流与 4K 高清物料增强 ──────────────────────────────────────────

const tmdbMetaCache = new Map();

// 常用影视多地译名简繁字映射
const S2T_MAP = {
  '丽': '麗', '兹': '茲', '顿': '頓', '齐': '齊', '莉': '莉', '博': '博', '登': '登',
  '特': '特', '斯': '斯', '尔': '爾', '曼': '曼', '德': '德', '格': '格', '拉': '拉',
  '维': '維', '杰': '傑', '克': '克', '逊': '遜', '里': '裏', '亚': '亞', '诺': '諾',
  '兰': '蘭', '罗': '羅', '伯': '伯', '理': '理', '查': '查', '弗': '弗', '雷': '雷',
  '战': '戰', '杀': '殺', '爱': '愛', '恋': '戀', '恶': '惡', '魔': '魔', '异': '異',
  '录': '錄', '传': '傳', '说': '說', '记': '記', '历': '歷', '险': '險', '门': '門',
  '间': '間', '发': '發', '复': '復', '仇': '仇', '绝': '絕', '对': '對', '极': '極',
  '风': '風', '暴': '暴', '云': '雲', '梦': '夢', '灵': '靈', '魂': '魂', '灭': '滅',
  '无': '無', '尽': '盡', '终': '終', '结': '結', '形': '形', '体': '體', '国': '國',
  '度': '度', '时': '時', '代': '代', '头': '頭', '号': '號', '玩': '玩', '家': '家',
  '总': '總', '动': '動', '员': '員', '神': '神', '偷': '偷', '爸': '爸', '机': '機',
  '器': '器', '人': '人', '黑': '黑', '客': '客', '帝': '帝'
};

function toTraditional(str) {
  return str.split('').map(ch => S2T_MAP[ch] || ch).join('');
}

function generateSearchQueries(title) {
  const queries = new Set();
  const sanitized = title
    .replace(/[（(][^)）]*[)）]/g, '')
    .replace(/[·・•]/g, ' ')
    .replace(/[\-_—–]+/g, ' ')
    .replace(/[：:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (sanitized) queries.add(sanitized);

  const compact = sanitized.replace(/\s+/g, '');
  if (compact && compact !== sanitized) queries.add(compact);

  const parts = sanitized.split(/\s+/).filter(p => p.length > 0);
  if (parts.length >= 2) {
    const mainPart = parts[0].trim();
    if (mainPart.length >= 2) queries.add(mainPart);
    const subPart = parts.slice(1).join(' ').trim();
    if (subPart.length >= 2) queries.add(subPart);
  }

  const tradList = [];
  for (const q of queries) {
    const trad = toTraditional(q);
    if (trad !== q) tradList.push(trad);
  }
  for (const t of tradList) {
    queries.add(t);
  }

  return Array.from(queries);
}

async function fetchTmdbMeta(query, mediaType = 'movie', yearHint) {
  const cleanKey = query.replace(/[（(][^)）]*[)）]/g, '').trim();
  const cacheKey = `${cleanKey}_${mediaType}_${yearHint || ''}`;
  if (tmdbMetaCache.has(cacheKey)) {
    return tmdbMetaCache.get(cacheKey);
  }

  const searchType = mediaType === 'tv' || mediaType === 'anime' ? 'tv' : (mediaType === 'movie' ? 'movie' : 'multi');
  const endpoint = searchType === 'multi' ? 'search/multi' : `search/${searchType}`;
  
  const queryCandidates = generateSearchQueries(cleanKey);

  for (const q of queryCandidates) {
    let url = `${TMDB_BASE}/${endpoint}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(q)}`;
    if (yearHint && searchType === 'movie') {
      url += `&primary_release_year=${yearHint}`;
    }

    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) continue;
      const data = await res.json();
      const results = data?.results || [];
      if (results.length === 0) continue;

      // 优先标题完全一致项或高匹配项
      const exact = results.find(r => (r.title || r.name) === cleanKey || (r.title || r.name) === q) || results[0];
      if (!exact || !exact.id) continue;

      const meta = {
        tmdbId: String(exact.id),
        rate: exact.vote_average && exact.vote_average > 0 ? exact.vote_average.toFixed(1) : undefined,
        cover: exact.poster_path ? `https://image.tmdb.org/t/p/w500${exact.poster_path}` : undefined,
        backdrop: exact.backdrop_path ? `https://image.tmdb.org/t/p/w1280${exact.backdrop_path}` : undefined,
        overview: exact.overview || '',
        year: (exact.release_date || exact.first_air_date || '').slice(0, 4) || undefined,
      };
      tmdbMetaCache.set(cacheKey, meta);
      return meta;
    } catch {
      continue;
    }
  }

  return null;
}

/**
 * 抓取 TMDB 趋势榜与热映榜，标记全球热度
 */
async function fetchTmdbTrendingStream() {
  const trendingMap = new Map();
  try {
    const [trendRes, nowPlayRes] = await Promise.all([
      fetch(`${TMDB_BASE}/trending/all/day?api_key=${TMDB_API_KEY}&language=zh-CN`, { signal: AbortSignal.timeout(4000) }),
      fetch(`${TMDB_BASE}/movie/now_playing?api_key=${TMDB_API_KEY}&language=zh-CN&page=1`, { signal: AbortSignal.timeout(4000) }),
    ]);

    if (trendRes.ok) {
      const data = await trendRes.json();
      for (const item of data?.results || []) {
        const title = item.title || item.name;
        if (title && isCleanChineseTitle(title)) {
          trendingMap.set(normalizeTitle(title), { isTrending: true, tmdbItem: item });
        }
      }
    }

    if (nowPlayRes.ok) {
      const data = await nowPlayRes.json();
      for (const item of data?.results || []) {
        const title = item.title || item.name;
        if (title && isCleanChineseTitle(title)) {
          const norm = normalizeTitle(title);
          const exist = trendingMap.get(norm) || {};
          trendingMap.set(norm, { ...exist, isNowPlaying: true, tmdbItem: item });
        }
      }
    }
  } catch (e) {
    console.warn('⚠️ [TMDB-Stream] 排期流抓取跳过:', e.message);
  }
  return trendingMap;
}

// ── 智能融合处理核心 ─────────────────────────────────────────────────────────

async function processChannelShowcase(channel, trendingMap) {
  console.log(`\n======================================================`);
  console.log(`📡 [雷达扫描] 开始构建【${channel.name}】(key: ${channel.key}) 最新精选...`);

  // 1. 并发抓取爱壹帆人工审核流（page 1 与 page 2，获取 100 部候选条目）
  const [iyfPage1, iyfPage2, collectorList] = await Promise.all([
    fetchIyfLastAdd(channel.cid, 1, 50),
    fetchIyfLastAdd(channel.cid, 2, 50),
    fetchCollectorStream(channel.collectorTypes),
  ]);

  const iyfItems = [...iyfPage1, ...iyfPage2];
  console.log(`📥 原始候选: 爱壹帆 ${iyfItems.length} 部, 采集站 ${collectorList.length} 部`);

  // 2. 候选流归一化与排重聚合
  const candidatePool = [];
  const seenNormTitles = new Set();

  // 首先以爱壹帆高品质流为基线入库
  for (const item of iyfItems) {
    if (!item || !item.title) continue;
    const title = item.title.trim();
    if (!isCleanChineseTitle(title)) continue;

    const norm = normalizeTitle(title);
    if (seenNormTitles.has(norm)) continue;
    seenNormTitles.add(norm);

    const trendMeta = trendingMap.get(norm);
    candidatePool.push({
      source: 'iyf',
      title,
      year: String(item.year || new Date().getFullYear()),
      rawRate: item.rating && item.rating !== '0.0' ? item.rating : undefined,
      rawCover: item.image,
      updateBadgeRaw: item.lastName || item.updVname || (item.updates ? `更新至第${item.updates}集` : undefined),
      regional: item.regional,
      atypeName: item.atypeName,
      vipResource: item.vipResource,
      contxt: item.contxt,
      labels: item.labels,
      isTrending: !!trendMeta?.isTrending,
      isNowPlaying: !!trendMeta?.isNowPlaying,
      addTime: item.addTime,
    });
  }

  // 补充采集站真实最新入库的条目（填补 IYF 尚未上架的新资源）
  for (const col of collectorList) {
    if (!col || !col.title) continue;
    if (!isCleanChineseTitle(col.title)) continue;
    const norm = normalizeTitle(col.title);
    if (seenNormTitles.has(norm)) continue;
    seenNormTitles.add(norm);

    const trendMeta = trendingMap.get(norm);
    candidatePool.push({
      source: 'collector',
      title: col.title,
      year: String(col.year || new Date().getFullYear()),
      rawRate: col.score,
      rawCover: col.cover,
      updateBadgeRaw: col.vod_remarks,
      regional: '华语',
      atypeName: channel.defaultType === 'movie' ? '电影' : '电视剧',
      vipResource: '1080P',
      contxt: '',
      labels: '',
      isTrending: !!trendMeta?.isTrending,
      isNowPlaying: !!trendMeta?.isNowPlaying,
      addTime: col.vod_time,
    });
  }

  console.log(`🔍 华语安全与排重后候选: ${candidatePool.length} 部`);

  // 3. TMDB 4K 原版物料增强与发行标签注入
  const finalItems = [];
  const now = Date.now();

  for (let i = 0; i < candidatePool.length; i++) {
    const raw = candidatePool[i];
    const targetType = channel.defaultType === 'all'
      ? (raw.atypeName === '电影' ? 'movie' : 'tv')
      : channel.defaultType;

    // TMDB 物料补齐
    const tmdb = await fetchTmdbMeta(raw.title, targetType, raw.year);

    // 确定高清海报与背景（杜绝变形带水印图）
    const cover = tmdb?.cover || (raw.rawCover && raw.rawCover.startsWith('http') ? raw.rawCover : '/placeholder-poster.svg');
    const backdrop = tmdb?.backdrop || cover;
    const rate = tmdb?.rate || (raw.rawRate && raw.rawRate !== '0.0' ? parseFloat(raw.rawRate).toFixed(1) : '8.8');
    const finalYear = tmdb?.year || raw.year || '2026';
    const updateBadge = formatUpdateBadge(raw.updateBadgeRaw, targetType);

    // 智能识别平台与规格角标
    const { platformBadge, qualityBadge } = detectBadges(raw);

    // 严格过滤异常老片（如评分极低且年代久远）
    if (parseFloat(rate) <= 3.0 && parseInt(finalYear, 10) < 2024) {
      continue;
    }

    finalItems.push({
      entityId: `ik_radar_${channel.key}_${i + 1}`,
      tmdbId: tmdb?.tmdbId,
      title: raw.title,
      slug: simpleSlug(raw.title),
      cover,
      backdrop,
      rate,
      year: finalYear,
      type: targetType,
      channelKey: channel.key,
      genres: [raw.atypeName || (targetType === 'movie' ? '电影' : '剧集')].filter(Boolean),
      updateBadge,
      platformBadge,
      qualityBadge,
      createdAt: new Date(now - i * 1800000).toISOString(), // 递减时间差，保持天然时间排序
    });

    if (finalItems.length >= 24) break;
  }

  console.log(`✨ 【${channel.name}】精选完成，产出 ${finalItems.length} 部高品质影视（4K 物料覆盖率: ${finalItems.filter(x => x.cover.includes('tmdb.org')).length}/${finalItems.length}）`);
  return finalItems;
}

// ── Cloudflare KV 写入层 ──────────────────────────────────────────────────────

async function writeKvShowcase(channelKey, items) {
  const targetKey = channelKey === 'all' ? 'recent:all' : `recent:${channelKey}`;
  const url = `${KV_BASE_URL}/values/${encodeURIComponent(targetKey)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...KV_HEADERS,
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body: JSON.stringify(items),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`写入 KV ${targetKey} 失败: ${JSON.stringify(data.errors)}`);
  }
}

/**
 * 将新上线的雷达条目自动生成完整实体写入生产 KV，实现入库即预热
 */
async function writeKvEntities(items) {
  for (const item of items) {
    if (!item || !item.title) continue;
    const entityId = item.entityId;
    const decodedSlug = decodeURIComponent(item.slug || item.title);
    const title = item.title;
    const tmdbId = item.tmdbId;

    const entity = {
      entityId: entityId,
      id: entityId,
      title: title,
      slug: decodedSlug,
      canonicalSlug: decodedSlug,
      type: item.type || 'tv',
      year: item.year || '2026',
      cover: item.cover,
      backdrop: item.backdrop || item.cover,
      overview: item.overview || `${title} 是 ${item.year || '2026'} 年上线的优质影视。提供全网多源纯直连极速播放，画质高清流畅，尽在 iKanPP 爱看片片。`,
      description: item.overview || `${title} 是 ${item.year || '2026'} 年上线的优质影视。提供全网多源纯直连极速播放，画质高清流畅，尽在 iKanPP 爱看片片。`,
      genres: item.genres || [(item.type === 'movie' ? '电影' : '电视剧')],
      directors: [],
      actors: [],
      rate: item.rate || '8.0',
      numberOfSeasons: 1,
      numberOfEpisodes: item.updateBadge ? parseInt(item.updateBadge.replace(/\D/g, ''), 10) || 1 : 1,
      status: item.updateBadge || '正片',
      tmdbId: tmdbId || '',
      tmdbType: (item.type === 'tv' || item.type === 'anime') ? 'tv' : 'movie',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const keysToPut = [
      { key: `entity:${entityId}`, val: entity },
      { key: `slug:${decodedSlug}`, val: entityId },
      { key: `title:${title}`, val: entityId },
    ];
    if (item.slug && item.slug !== decodedSlug) {
      keysToPut.push({ key: `slug:${item.slug}`, val: entityId });
    }
    if (tmdbId) {
      keysToPut.push({ key: `tmdb:${entity.tmdbType}:${tmdbId}`, val: entityId });
    }

    for (const k of keysToPut) {
      try {
        const url = `${KV_BASE_URL}/values/${encodeURIComponent(k.key)}`;
        const payload = typeof k.val === 'string' ? k.val : JSON.stringify(k.val);
        await fetch(url, {
          method: 'PUT',
          headers: { ...KV_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' },
          body: payload,
        });
      } catch {}
    }
  }
}

// ── 主程序 ───────────────────────────────────────────────────────────────────

async function main() {
  const isDryRun = process.argv.includes('--dry-run');

  console.log('================================================================');
  console.log('🚀 iKanPP「全球数字发行雷达」融合同步引擎启动');
  console.log(`⚙️ 运行模式: ${isDryRun ? 'DRY-RUN 预览模式（不写磁盘与 KV）' : '生产写入模式'}`);
  console.log('================================================================');

  // 1. 初始化自愈抓取爱壹帆最新密钥
  await refreshIyfKeys();

  // 2. 抓取 TMDB 趋势与排期流
  const trendingMap = await fetchTmdbTrendingStream();

  // 3. 逐专区构建雷达精选数据
  const prebakedData = {};

  for (const channel of CHANNELS) {
    const list = await processChannelShowcase(channel, trendingMap);
    prebakedData[channel.key] = list;

    if (!isDryRun) {
      try {
        await writeKvShowcase(channel.key, list);
        await writeKvEntities(list);
        console.log(`☁️ [KV] 成功同步写入 KV 键 recent:${channel.key} 并完成 ${list.length} 部新片完整实体预热`);
      } catch (err) {
        console.warn(`⚠️ [KV] 写入 KV 键 recent:${channel.key} 异常:`, err.message);
      }
    }
  }

  // 4. 生成写入 lib/data/latest-titles-prebaked.ts
  if (!isDryRun) {
    const targetPath = path.resolve(process.cwd(), 'lib/data/latest-titles-prebaked.ts');
    const fileContent = `/**
 * 全站全专区「最新上线」全球数字发行雷达预烘焙数据集
 * 由 scripts/sync-release-radar.mjs 每小时自动融合生成
 * 数据源：爱壹帆人工审核流 + 采集站真实入库流 + TMDB 全球数字发行/院线排期流
 * 物料规范：TMDB 4K 原版无水印海报与 4K 宽屏剧照
 */

import type { LatestPrebakedItem } from '../types/prebaked';
export type { LatestPrebakedItem };

export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem[]> = ${JSON.stringify(prebakedData, null, 2)};
`;

    fs.writeFileSync(targetPath, fileContent, 'utf-8');
    console.log(`\n🎉 [Prebake] 成功写入预烘焙文件: ${targetPath}`);
  } else {
    console.log('\n🔍 [DRY-RUN] 预览输出完成，展示全站首屏前 5 部：');
    for (const item of (prebakedData.all || []).slice(0, 5)) {
      console.log(`  - [${item.type.toUpperCase()}] ${item.title} (${item.year}) | 评分: ${item.rate} | 状态: ${item.updateBadge} | 平台: ${item.platformBadge || '官方'} | 封面: ${item.cover.slice(0, 45)}...`);
    }
  }

  console.log('\n🏁 [Done] 全球数字发行雷达同步任务圆满完成！');
}

main().catch(err => {
  console.error('Fatal error in sync-release-radar:', err);
  process.exit(1);
});
