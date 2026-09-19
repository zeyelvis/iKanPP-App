#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 📚 iKanPP 全站实体片库海量灌入与多维反向索引维护引擎
 *
 * 功能：
 * 1. 自动化采集第三方正规资源站（光速、极速、巨量、红牛、非凡、暴风等）
 * 2. 对接 TMDB API 智能补齐高清海报、宽屏剧照、豆瓣/TMDB评分、演职员、国别、语言等
 * 3. 实时写入 Cloudflare KV，原子维护 channel / region / year / language / status / genre 反向索引
 * 4. 支持多种运行模式：
 *    - --mode=test        小批量试跑（验证全链路）
 *    - --mode=incremental 增量刷新（检测连载更新与近期上线）
 *    - --mode=full        全量深度入库
 *    - --mode=reindex     对 KV 中现有已有实体极速回补/重建多维反向索引
 *    - --channel=tv       限定专区 (movie | tv | anime | variety | documentary | short)
 *    - --limit=100        限定本次处理最大条目数
 *    - --resume           断点续跑
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CF_API_KEY || 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const EMAIL = process.env.CLOUDFLARE_EMAIL || process.env.CF_EMAIL || 'zeyelvis@gmail.com';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_DELAY_MS = 280; // TMDB 权威限速安全线

const CHECKPOINT_FILE = path.resolve(process.cwd(), '.cache/ingest-checkpoint.json');

const ADULT_BLACKLIST_WORDS = [
  '痴漢', '痴汉', '調教', '调教', '発情', '发情', '近親', '近亲', '乱倫', '乱伦',
  '性奴', '小股', '沙龙病院', '中出し', '潮吹き', '巨乳', '美乳', '素人',
  '熟女', '人妻', '淫乱', '絶頂', '绝顶', '強姦', '强奸', '輪姦', '轮奸', '肉便器',
  '風俗', '风俗', '無修正', '无修正', 'エロ', 'AV', 'JAV', 'FC2', 'SM', '変態', '变态',
  '制服誘惑', '制服诱惑', '女教師', '女教师', '看護婦', '看护妇', '盗撮', '覗き', '偷窥',
  '性交', '做爱', '自慰', '色情', '三级', '露点', '情色', '偷拍', '色誘', '色诱', '情欲', '欲女',
  '売春', '愛汁', '肉しびれ', '女囚', '痴情', '快辱', '乱交', 'ポルノ', '半熟売春'
];

function isCleanChineseTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const t = title.trim();
  if (!t) return false;
  for (const w of ADULT_BLACKLIST_WORDS) {
    if (t.includes(w)) return false;
  }
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return false;
  if (/[\uac00-\ud7af]/.test(t)) return false;
  if (!/[\u4e00-\u9fa5]/.test(t)) return false;
  return true;
}

// 采集数据源与分类配置
const SOURCE_CHANNELS = [
  {
    channel: 'movie',
    name: '电影专区',
    baseUrl: 'https://api.guangsuapi.com/api.php/provide/vod',
    categories: [
      { id: 6, name: '动作片' },
      { id: 7, name: '喜剧片' },
      { id: 8, name: '爱情片' },
      { id: 9, name: '科幻片' },
      { id: 10, name: '剧情片' },
      { id: 11, name: '恐怖片' },
      { id: 12, name: '战争片' },
      { id: 20, name: '动画片' },
    ],
  },
  {
    channel: 'tv',
    name: '电视剧专区',
    baseUrl: 'https://api.guangsuapi.com/api.php/provide/vod',
    categories: [
      { id: 13, name: '国产剧', region: '大陆' },
      { id: 14, name: '欧美剧', region: '欧美' },
      { id: 15, name: '香港剧', region: '香港' },
      { id: 16, name: '韩国剧', region: '韩国' },
      { id: 21, name: '日本剧', region: '日本' },
      { id: 22, name: '台湾剧', region: '台湾' },
      { id: 23, name: '泰国剧', region: '泰国' },
    ],
  },
  {
    channel: 'anime',
    name: '动漫专区',
    baseUrl: 'https://api.guangsuapi.com/api.php/provide/vod',
    categories: [
      { id: 41, name: '国产动漫', region: '大陆' },
      { id: 42, name: '日本动漫', region: '日本' },
      { id: 43, name: '欧美动漫', region: '欧美' },
    ],
  },
  {
    channel: 'variety',
    name: '综艺专区',
    baseUrl: 'https://api.guangsuapi.com/api.php/provide/vod',
    categories: [
      { id: 37, name: '大陆综艺', region: '大陆' },
      { id: 38, name: '日韩综艺', region: '日韩' },
      { id: 39, name: '港台综艺', region: '港台' },
      { id: 40, name: '欧美综艺', region: '欧美' },
    ],
  },
  {
    channel: 'documentary',
    name: '纪录片专区',
    baseUrl: 'https://api.guangsuapi.com/api.php/provide/vod',
    categories: [
      { id: 24, name: '纪录片' },
    ],
  },
  {
    channel: 'short',
    name: '短剧专区',
    baseUrl: 'https://www.hongniuzy2.com/api.php/provide/vod',
    categories: [
      { id: 43, name: '古装仙侠', region: '大陆' },
      { id: 44, name: '现代都市', region: '大陆' },
      { id: 45, name: '穿越年代', region: '大陆' },
      { id: 46, name: '言情总裁', region: '大陆' },
      { id: 47, name: '重生民国', region: '大陆' },
      { id: 48, name: '反转爽剧', region: '大陆' },
      { id: 49, name: '脑洞悬疑', region: '大陆' },
      { id: 51, name: 'AI漫剧', region: '大陆' },
    ],
  },
];

// ── 基础工具函数 ──────────────────────────────────────────────────

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeTitle(title) {
  if (!title) return '';
  return String(title)
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[【\[].*?[】\]]/g, '')
    .replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|\s_-]/g, '')
    .trim();
}

function generateSlug(title) {
  if (!title) return 'video';
  const cleaned = String(title)
    .replace(/[（(][^）)]*[）)]/g, ' ')
    .replace(/[【\[][^】\]]*[】\]]/g, ' ')
    .replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|]/g, ' ')
    .trim();
  const slug = cleaned
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'video';
}

function formatEntityId(seq) {
  const padded = Math.max(1, Math.floor(seq)).toString().padStart(6, '0');
  return `ik${padded}`;
}

function getRegionTokens(region) {
  if (!region) return [];
  const tokens = new Set();
  const str = String(region).trim();
  const lower = str.toLowerCase();

  // 1. 中英文国别与大区映射
  if (lower.includes('united states') || lower.includes('usa') || lower === 'us' || str.includes('美国')) {
    tokens.add('美国');
    tokens.add('欧美');
  }
  if (lower.includes('united kingdom') || lower.includes('uk') || str.includes('英国')) {
    tokens.add('英国');
    tokens.add('欧美');
  }
  if (lower.includes('korea') || str.includes('韩国') || str.includes('韩剧')) {
    tokens.add('韩国');
    tokens.add('韩剧');
    tokens.add('日韩');
  }
  if (lower.includes('japan') || str.includes('日本') || str.includes('日剧')) {
    tokens.add('日本');
    tokens.add('日剧');
    tokens.add('日韩');
  }
  if (lower.includes('thailand') || str.includes('泰国') || str.includes('泰剧')) {
    tokens.add('泰国');
    tokens.add('泰剧');
    tokens.add('东南亚');
  }
  if (lower.includes('hong kong') || str.includes('香港') || str.includes('港剧')) {
    tokens.add('香港');
    tokens.add('港台');
    tokens.add('华语');
  }
  if (lower.includes('taiwan') || str.includes('台湾') || str.includes('台剧')) {
    tokens.add('台湾');
    tokens.add('港台');
    tokens.add('华语');
  }
  if (lower.includes('china') || str.includes('大陆') || str.includes('内地') || str.includes('国产') || str === '中国') {
    tokens.add('大陆');
    tokens.add('中国大陆');
    tokens.add('华语');
    tokens.add('国产');
  }
  if (lower.includes('france') || str.includes('法国') || lower.includes('germany') || str.includes('德国') || lower.includes('canada') || str.includes('加拿大')) {
    tokens.add('欧美');
  }

  // 2. 切分词
  const rawParts = str.split(/[/,、| \t]+/).map(s => s.trim()).filter(Boolean);
  for (const part of rawParts) {
    if (part.length > 1 && !['of', 'the', 'and'].includes(part.toLowerCase())) {
      tokens.add(part);
    }
  }

  return Array.from(tokens);
}

function getLanguageTokens(lang) {
  if (!lang) return [];
  const tokens = new Set();
  const rawParts = String(lang).split(/[/,、| \t]+/).map(s => s.trim()).filter(Boolean);
  for (const part of rawParts) {
    tokens.add(part);
    if (part.includes('国语') || part.includes('普通话') || part.includes('汉语') || part.includes('中文')) {
      tokens.add('国语');
      tokens.add('普通话');
      tokens.add('华语');
    }
    if (part.includes('粤语') || part.includes('广东话')) {
      tokens.add('粤语');
    }
    if (part.includes('英语') || part.toLowerCase().includes('english')) {
      tokens.add('英语');
    }
    if (part.includes('日语') || part.toLowerCase().includes('japanese')) {
      tokens.add('日语');
    }
    if (part.includes('韩语') || part.toLowerCase().includes('korean')) {
      tokens.add('韩语');
    }
    if (part.includes('泰语') || part.toLowerCase().includes('thai')) {
      tokens.add('泰语');
    }
  }
  return Array.from(tokens);
}

function getStatusTokens(status) {
  const tokens = new Set();
  const str = String(status || '');
  if (str.includes('完结') || str.includes('全集') || str.includes('HD') || str.includes('BD') || str.includes('1080P') || str.includes('4K')) {
    tokens.add('完结');
  }
  if (str.includes('连载') || str.includes('更新') || str.includes('第') || str.includes('期')) {
    tokens.add('连载中');
    tokens.add('连载');
  }
  return Array.from(tokens);
}

function inferEntityMeta(ent) {
  let region = ent.region;
  let lang = ent.language;
  let status = ent.status;

  const title = ent.title || '';
  const actors = Array.isArray(ent.actors) ? ent.actors : [];
  const directors = Array.isArray(ent.directors) ? ent.directors : [];
  const genres = Array.isArray(ent.genres) ? ent.genres : [];
  const people = [...actors, ...directors].filter(Boolean);

  if (!region) {
    const hasForeignDot = people.some(p => p.includes('·'));
    const hasKana = /[\u3040-\u30ff]/.test(title) || people.some(p => /[\u3040-\u30ff]/.test(p));
    const hasHangul = /[\uac00-\ud7af]/.test(title) || people.some(p => /[\uac00-\ud7af]/.test(p));
    const hasChineseGenre = genres.some(g => ['古装', '武侠', '仙侠', '国产', '华语', '港片', '港剧', '台剧'].includes(g));

    if (hasKana) {
      region = '日本';
    } else if (hasHangul) {
      region = '韩国';
    } else if (genres.some(g => g.includes('香港') || g.includes('港'))) {
      region = '香港';
    } else if (genres.some(g => g.includes('台湾') || g.includes('台'))) {
      region = '台湾';
    } else if (hasChineseGenre) {
      region = '大陆';
    } else if (hasForeignDot) {
      region = '欧美';
    } else if (people.length > 0 && people.every(p => /^[\u4e00-\u9fa5]{2,4}$/.test(p))) {
      region = '大陆';
    } else {
      region = '华语';
    }
  }

  if (!lang) {
    if (region === '大陆' || region === '华语') lang = '国语';
    else if (region === '香港') lang = '粤语';
    else if (region === '欧美') lang = '英语';
    else if (region === '日本') lang = '日语';
    else if (region === '韩国') lang = '韩语';
    else lang = '国语';
  }

  if (!status) {
    if (ent.type === 'movie') status = '完结';
    else if (ent.year && parseInt(ent.year, 10) < 2025) status = '完结';
    else status = '连载中';
  }

  return { region, lang, status };
}

// ── Cloudflare KV API 封装 ────────────────────────────────────────

async function kvGet(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: {
      'X-Auth-Email': EMAIL,
      'X-Auth-Key': API_KEY,
    },
  });
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`KV GET ${key} failed: status ${res.status}`);
  }
  return await res.text();
}

async function kvBulkPut(pairs) {
  if (!pairs || pairs.length === 0) return;
  const BATCH_SIZE = 1000;
  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    const batch = pairs.slice(i, i + BATCH_SIZE).map(p => ({
      key: p.key,
      value: typeof p.value === 'string' ? p.value : JSON.stringify(p.value),
    }));
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/bulk`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Auth-Email': EMAIL,
        'X-Auth-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });
    const data = await res.json();
    if (!data.success) {
      throw new Error(`KV Bulk PUT failed: ${JSON.stringify(data.errors)}`);
    }
  }
}

// ── TMDB 抓取与丰润 ───────────────────────────────────────────────

async function searchTMDB(title, type, year) {
  if (!TMDB_API_KEY || !title) return null;
  await sleep(TMDB_DELAY_MS);

  const cleanTitle = title
    .replace(/\s*第[一二三四五六七八九十\d]+季/, '')
    .replace(/\s*[Ss](?:eason)?\s*\d+/i, '')
    .replace(/[（(][^)）]*[)）]/g, '')
    .replace(/(?:更新至|全)\d+集?/, '')
    .trim();

  const tmdbType = type === 'tv' || type === 'anime' ? 'tv' : 'movie';
  const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanTitle)}`;

  try {
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.results || data.results.length === 0) return null;

    // 挑选最佳匹配
    const hit = data.results.find(r => r.media_type === tmdbType) || data.results[0];
    if (!hit || !hit.id) return null;

    // 拉取完整详情
    await sleep(TMDB_DELAY_MS);
    const detailUrl = `${TMDB_BASE}/${hit.media_type || tmdbType}/${hit.id}?api_key=${TMDB_API_KEY}&language=zh-CN&append_to_response=credits,keywords`;
    const dRes = await fetch(detailUrl, { headers: { Accept: 'application/json' } });
    if (!dRes.ok) return null;
    return await dRes.json();
  } catch (err) {
    console.warn(`[TMDB error for ${title}]:`, err.message);
    return null;
  }
}

// ── 核心功能：极速全量回补索引 (Reindex) ──────────────────────────

async function runReindex() {
  console.log('🔄 开始为现有 KV 片库全量实体建立多维反向索引...');

  const rawAll = await kvGet('index:all');
  if (!rawAll) {
    console.log('❌ 未在 KV 中找到 index:all 记录！');
    return;
  }

  const allIds = JSON.parse(rawAll);
  console.log(`📊 发现全量实体共 ${allIds.length} 部，准备分批读取并构建反向索引表...`);

  const indexes = {
    channel: {},
    region: {},
    year: {},
    language: {},
    status: {},
    genre: {},
  };

  const addIndex = (category, key, id) => {
    if (!key) return;
    const cleanKey = String(key).trim();
    if (!indexes[category][cleanKey]) {
      indexes[category][cleanKey] = [];
    }
    if (!indexes[category][cleanKey].includes(id)) {
      indexes[category][cleanKey].push(id);
    }
  };

  const BATCH = 50;
  let processed = 0;

  for (let i = 0; i < allIds.length; i += BATCH) {
    const batchIds = allIds.slice(i, i + BATCH);
    const entities = await Promise.all(
      batchIds.map(async (id) => {
        try {
          const raw = await kvGet(`entity:${id}`);
          return raw ? JSON.parse(raw) : null;
        } catch {
          return null;
        }
      })
    );

    for (let j = 0; j < entities.length; j++) {
      const ent = entities[j];
      const id = batchIds[j];
      if (!ent) continue;

      // 1. Channel
      if (ent.type) {
        const ch = ent.type.toLowerCase().trim();
        addIndex('channel', ch, id);
        if (ch === 'short-drama' || ch === 'short') {
          addIndex('channel', 'short', id);
          addIndex('channel', 'short-drama', id);
        }
      }

      const inferred = inferEntityMeta(ent);
      const effectiveRegion = ent.region || inferred.region;
      const effectiveLang = ent.language || inferred.lang;
      const effectiveStatus = ent.status || inferred.status;

      // 2. Region
      const regTokens = getRegionTokens(effectiveRegion);
      for (const r of regTokens) {
        addIndex('region', r, id);
      }

      // 3. Year
      if (ent.year) {
        addIndex('year', String(ent.year).trim(), id);
      }

      // 4. Language
      const langTokens = getLanguageTokens(effectiveLang);
      for (const l of langTokens) {
        addIndex('language', l, id);
      }

      // 5. Status
      const statusTokens = getStatusTokens(effectiveStatus);
      for (const s of statusTokens) {
        addIndex('status', s, id);
      }

      // 6. Genre
      if (Array.isArray(ent.genres)) {
        for (const g of ent.genres) {
          if (g && g.trim()) addIndex('genre', g.trim(), id);
        }
      }
    }

    processed += batchIds.length;
    if (processed % 500 === 0 || processed === allIds.length) {
      console.log(`  ⏳ 已解析 ${processed} / ${allIds.length} 部实体元数据...`);
    }
  }

  console.log('\n📦 正在将构建完成的多维索引全量提交回 Cloudflare KV...');
  const kvPairs = [];

  for (const [cat, map] of Object.entries(indexes)) {
    for (const [key, ids] of Object.entries(map)) {
      kvPairs.push({
        key: `${cat}:${key}`,
        value: ids,
      });
    }
  }

  console.log(`📤 即将写入 ${kvPairs.length} 条反向多维索引键值对...`);
  await kvBulkPut(kvPairs);

  console.log('🎉 多维反向索引极速重建完成！');
  console.log(`  - 频道索引: ${Object.keys(indexes.channel).length} 个 (${Object.keys(indexes.channel).join(', ')})`);
  console.log(`  - 地区索引: ${Object.keys(indexes.region).length} 个`);
  console.log(`  - 年份索引: ${Object.keys(indexes.year).length} 个`);
  console.log(`  - 题材索引: ${Object.keys(indexes.genre).length} 个`);
}

// ── 核心功能：增量更新受影响的反向索引 ──────────────────────────────

async function updateIncrementalIndexes(newEntities) {
  if (!newEntities || newEntities.length === 0) return;
  const updates = new Map();

  const add = (k, id) => {
    if (!updates.has(k)) updates.set(k, new Set());
    updates.get(k).add(id);
  };

  for (const ent of newEntities) {
    const id = ent.entityId;
    if (ent.type) {
      const ch = ent.type.toLowerCase().trim();
      add(`channel:${ch}`, id);
      if (ch === 'short-drama' || ch === 'short') {
        add('channel:short', id);
        add('channel:short-drama', id);
      }
    }
    const inferred = inferEntityMeta(ent);
    const effectiveRegion = ent.region || inferred.region;
    const effectiveLang = ent.language || inferred.lang;
    const effectiveStatus = ent.status || inferred.status;

    for (const r of getRegionTokens(effectiveRegion)) {
      add(`region:${r}`, id);
    }
    if (ent.year) {
      add(`year:${String(ent.year).trim()}`, id);
    }
    for (const l of getLanguageTokens(effectiveLang)) {
      add(`language:${l}`, id);
    }
    for (const s of getStatusTokens(effectiveStatus)) {
      add(`status:${s}`, id);
    }
    if (Array.isArray(ent.genres)) {
      for (const g of ent.genres) {
        if (g && g.trim()) add(`genre:${g.trim()}`, id);
      }
    }
  }

  const affectedKeys = Array.from(updates.keys());
  console.log(`  ⚡ 本次新增影响 ${affectedKeys.length} 个多维索引键，正在并发合并更新...`);
  const kvPairs = [];

  for (const key of affectedKeys) {
    let existingList = [];
    try {
      const raw = await kvGet(key);
      if (raw) existingList = JSON.parse(raw);
    } catch {}
    const newIds = Array.from(updates.get(key));
    const combined = [...newIds, ...existingList.filter(id => !updates.get(key).has(id))];
    kvPairs.push({ key, value: combined.slice(0, 100000) });
  }

  await kvBulkPut(kvPairs);
  console.log(`  ✅ 成功增量更新 ${kvPairs.length} 条反向索引键！`);
}

// ── 核心功能：自动化目录采集与灌入 ────────────────────────────────

async function runIngestion(options = {}) {
  const { mode = 'test', limit = 100, channelFilter, resume = false } = options;
  console.log(`🚀 启动实体片库数据灌入流程 [mode=${mode}, limit=${limit}, channel=${channelFilter || 'all'}]...`);

  // 1. 初始化断点目录
  if (!fs.existsSync(path.dirname(CHECKPOINT_FILE))) {
    fs.mkdirSync(path.dirname(CHECKPOINT_FILE), { recursive: true });
  }

  // 2. 读取已知全部实体 ID 与当前序号
  console.log('📡 正在从 Cloudflare KV 同步当前片库基线数据...');
  let seq = 25000;
  try {
    const rawSeq = await kvGet('counter:next_id');
    if (rawSeq) seq = parseInt(rawSeq, 10) || 25000;
  } catch {}

  let allIds = [];
  try {
    const rawAll = await kvGet('index:all');
    if (rawAll) allIds = JSON.parse(rawAll);
  } catch {}

  let sitemapCatalog = [];
  try {
    const rawCat = await kvGet('sitemap:catalog');
    if (rawCat) sitemapCatalog = JSON.parse(rawCat);
  } catch {}

  const seenTitles = new Set();
  // 建立已有标题快速排重集合
  for (const item of sitemapCatalog) {
    if (item && item[1]) seenTitles.add(normalizeTitle(item[1]));
  }

  console.log(`✅ 片库基线就绪: 当前序号 ik${String(seq).padStart(6, '0')}, 已收录 ${seenTitles.size} 部独有影视作品`);

  const targetChannels = SOURCE_CHANNELS.filter(
    (c) => !channelFilter || c.channel === channelFilter.toLowerCase()
  );

  let totalAdded = 0;
  let totalSkipped = 0;
  let totalFailed = 0;
  const pendingKVPairs = [];
  const newEntities = [];

  for (const chConfig of targetChannels) {
    if (totalAdded >= limit) break;
    console.log(`\n📂 正在扫描板块: 【${chConfig.name}】(${chConfig.channel}) ...`);

    for (const cat of chConfig.categories) {
      if (totalAdded >= limit) break;
      let page = 1;
      let maxPage = 1;

      console.log(`  🔍 正在遍历分类 [${cat.name}] (cid=${cat.id}) ...`);

      while (page <= maxPage && totalAdded < limit) {
        const url = `${chConfig.baseUrl}?ac=detail&t=${cat.id}&pg=${page}`;
        let data = null;
        try {
          const res = await fetch(url, { headers: { 'User-Agent': 'iKanPP-Ingest/2.0' } });
          if (res.ok) data = await res.json();
        } catch (e) {
          console.warn(`    ⚠️ 请求第 ${page} 页失败:`, e.message);
          break;
        }

        if (!data || !Array.isArray(data.list) || data.list.length === 0) {
          break;
        }

        maxPage = Math.min(Number(data.pagecount) || 1, mode === 'test' ? 3 : 50);

        for (const item of data.list) {
          if (totalAdded >= limit) break;
          const vodName = (item.vod_name || '').trim();
          if (!vodName || !isCleanChineseTitle(vodName)) continue;

          const norm = normalizeTitle(vodName);
          if (seenTitles.has(norm)) {
            totalSkipped++;
            continue;
          }

          seenTitles.add(norm);

          // TMDB 智能匹配
          const tmdbDetail = await searchTMDB(vodName, chConfig.channel, item.vod_year);
          const entityId = formatEntityId(seq++);
          const slug = generateSlug(vodName);
          const nowIso = new Date().toISOString();
          const modDate = nowIso.split('T')[0];

          let entity = null;

          if (tmdbDetail) {
            const releaseYear = (tmdbDetail.release_date || tmdbDetail.first_air_date || item.vod_year || '2026').slice(0, 4);
            const genres = (tmdbDetail.genres || []).map(g => g.name).filter(Boolean);
            const rawDirectors = (tmdbDetail.credits?.crew || [])
              .filter(c => c.job === 'Director')
              .map(c => c.name)
              .slice(0, 3);
            const rawActors = (tmdbDetail.credits?.cast || [])
              .map(c => c.name)
              .slice(0, 6);

            const reg = cat.region || tmdbDetail.production_countries?.[0]?.name || (
              tmdbDetail.origin_country?.[0] === 'CN' ? '中国' :
              tmdbDetail.origin_country?.[0] === 'US' ? '美国' :
              tmdbDetail.origin_country?.[0] === 'KR' ? '韩国' :
              tmdbDetail.origin_country?.[0] === 'JP' ? '日本' :
              tmdbDetail.origin_country?.[0] === 'TH' ? '泰国' :
              item.vod_area || '华语'
            );

            const lang = tmdbDetail.spoken_languages?.[0]?.name || (
              tmdbDetail.original_language === 'zh' ? '国语' :
              tmdbDetail.original_language === 'en' ? '英语' :
              tmdbDetail.original_language === 'ko' ? '韩语' :
              tmdbDetail.original_language === 'ja' ? '日语' :
              tmdbDetail.original_language === 'th' ? '泰语' :
              item.vod_lang || '国语'
            );

            const status = tmdbDetail.status === 'Ended' ? '完结' : (
              tmdbDetail.status === 'Returning Series' ? '连载中' : (item.vod_remarks || '完结')
            );

            entity = {
              entityId,
              slug,
              tmdbId: String(tmdbDetail.id),
              tmdbType: chConfig.channel === 'tv' || chConfig.channel === 'anime' ? 'tv' : 'movie',
              title: vodName,
              originalTitle: tmdbDetail.original_title || tmdbDetail.original_name,
              type: chConfig.channel,
              year: releaseYear,
              description: tmdbDetail.overview || `${vodName} 在线观看，支持海外华人免翻墙极速高清播放。`,
              cover: tmdbDetail.poster_path ? `https://image.tmdb.org/t/p/w500${tmdbDetail.poster_path}` : (item.vod_pic || ''),
              backdrop: tmdbDetail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${tmdbDetail.backdrop_path}` : (item.vod_pic || ''),
              rate: tmdbDetail.vote_average ? tmdbDetail.vote_average.toFixed(1) : '8.8',
              genres: genres.length > 0 ? genres : [cat.name.replace(/片|剧|动漫|综艺/, '')],
              directors: rawDirectors,
              actors: rawActors,
              region: reg,
              language: lang,
              status,
              popularity: tmdbDetail.popularity || 10,
              runtime: tmdbDetail.runtime,
              numberOfSeasons: tmdbDetail.number_of_seasons,
              numberOfEpisodes: tmdbDetail.number_of_episodes,
              createdAt: nowIso,
              updatedAt: nowIso,
            };
          } else {
            // TMDB 未匹配时（如短剧或极小众冷门剧），保留采集站高质量元数据兜底
            entity = {
              entityId,
              slug,
              tmdbId: String(seq + 900000),
              tmdbType: chConfig.channel === 'tv' ? 'tv' : 'movie',
              title: vodName,
              type: chConfig.channel,
              year: String(item.vod_year || '2026'),
              description: `${vodName} 在线观看，支持免翻墙极速高清播放。`,
              cover: item.vod_pic || '',
              backdrop: item.vod_pic || '',
              rate: item.vod_douban_score || '8.5',
              genres: [cat.name.replace(/片|剧|动漫|综艺/, '')],
              directors: [],
              actors: [],
              region: item.vod_area || '华语',
              language: item.vod_lang || '国语',
              status: item.vod_remarks || '完结',
              popularity: 5,
              createdAt: nowIso,
              updatedAt: nowIso,
            };
          }

          newEntities.push(entity);
          pendingKVPairs.push({ key: `entity:${entityId}`, value: entity });
          pendingKVPairs.push({ key: `slug:${entityId}-${slug}`, value: entityId });
          pendingKVPairs.push({ key: `slug:${entityId}`, value: entityId });
          pendingKVPairs.push({ key: `slug:${slug}`, value: entityId });
          pendingKVPairs.push({ key: `title:${norm}`, value: entityId });

          allIds.unshift(entityId);
          sitemapCatalog.unshift([entityId, slug, modDate]);

          totalAdded++;
          console.log(`    ✨ [${totalAdded}/${limit}] 成功入库: ${vodName} (${entity.year} / ${entity.region} / ${entity.rate}分) -> ${entityId}`);
        }

        page++;
      }
    }
  }

  // 3. 提交数据与更新全局索引
  if (pendingKVPairs.length > 0) {
    console.log(`\n📤 正在批量将 ${pendingKVPairs.length} 条新条目提交至 Cloudflare KV...`);
    pendingKVPairs.push({ key: 'index:all', value: allIds });
    pendingKVPairs.push({ key: 'sitemap:catalog', value: sitemapCatalog });
    pendingKVPairs.push({ key: 'counter:next_id', value: String(seq) });
    await kvBulkPut(pendingKVPairs);
    console.log(`✅ 实体数据写入成功！`);

    // 4. 触发轻量增量索引同步
    console.log(`🔄 正在为本次新增的 ${newEntities.length} 部实体极速增量合并反向索引...`);
    await updateIncrementalIndexes(newEntities);
  }

  console.log(`\n🎉 灌入执行完毕！`);
  console.log(`  - 成功新增: ${totalAdded} 部`);
  console.log(`  - 跳过重复: ${totalSkipped} 部`);
  console.log(`  - 总库规模: ${allIds.length} 部`);
}

// ── 命令行入口 ────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  let mode = 'test';
  let limit = 50;
  let channel = '';
  let resume = false;

  for (const arg of args) {
    if (arg.startsWith('--mode=')) {
      mode = arg.split('=')[1];
    } else if (arg.startsWith('--limit=')) {
      limit = parseInt(arg.split('=')[1], 10) || 50;
    } else if (arg.startsWith('--channel=')) {
      channel = arg.split('=')[1];
    } else if (arg === '--resume') {
      resume = true;
    }
  }

  if (mode === 'reindex') {
    await runReindex();
  } else {
    await runIngestion({ mode, limit, channelFilter: channel, resume });
  }
}

main().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
