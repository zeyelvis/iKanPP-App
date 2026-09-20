#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * =========================================================================
 * iKanPP 自主「首发先锋雷达引擎」 (First-Release Priority Radar)
 * =========================================================================
 * 
 * 战略使命：
 * 彻底破除对爱壹帆更新节奏的单向依赖！
 * 爱壹帆因“非正式数字发行不收录”导致院线上映期有 2周~2个月的真空期。
 * 本引擎分钟级监听全网骨干采集站（光速/极速/暴风等）院线抢先版/TC/HD新片，
 * 自动结合 TMDB 4K 原版物料建档、置顶四大排序物理索引、并在 15 分钟内闪电广播，
 * 抢占 Google / Bing 首发搜索流量最高峰！
 */

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_KV_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID || process.env.CF_KV_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CF_KV_API_KEY || process.env.CF_API_KEY || process.env.CLOUDFLARE_AUTH_KEY || '';
const EMAIL = process.env.CLOUDFLARE_EMAIL || process.env.CF_KV_EMAIL || process.env.CF_EMAIL || process.env.CLOUDFLARE_AUTH_EMAIL || 'zeyelvis@gmail.com';

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}`;
const HEADERS = {
  'X-Auth-Email': EMAIL,
  'X-Auth-Key': API_KEY,
};

const CACHE_DIR = path.resolve(process.cwd(), '.cache');
if (!fs.existsSync(CACHE_DIR)) {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
}

// 采集站配置
const COLLECTORS = [
  { id: 'guangsu', name: '光速资源', url: 'https://api.guangsuapi.com/api.php/provide/vod' },
  { id: 'jisu', name: '极速资源', url: 'https://jszyapi.com/api.php/provide/vod' },
  { id: 'baofeng', name: '暴风资源', url: 'https://bfzyapi.com/api.php/provide/vod' },
];

// 内容安全黑名单（遵循准则 12）
const ADULT_BLACKLIST = [
  '痴漢', '痴汉', '調教', '调教', '発情', '发情', '近親', '近亲', '乱倫', '乱伦',
  '性奴', '巨乳', '素人', '熟女', '人妻', '淫乱', '絶頂', '绝顶', '強姦', '强奸',
  '輪姦', '轮奸', '肉便器', '風俗', '风俗', '無修正', '无修正', 'エロ', 'AV', 'JAV',
  'FC2', 'SM', '変態', '变态', '制服誘惑', '盗撮', '性交', '做爱', '自慰', '色情',
  '三级', '露点', '情色', '偷拍'
];

const COMMENTARY_BLACKLIST = [
  '解说', '说电影', '几分钟看', '一口气看', '速看', '看懂',
  '纯享版', '先导片', '幕后花絮', '独家花絮', '精彩看点', '正片片段',
  '电影解说', '影视解说', '剧情解说', '短剧解说', '影视剪辑', '混剪'
];

function isCleanChineseTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const t = title.trim();
  if (!t) return false;
  for (const w of ADULT_BLACKLIST) {
    if (t.includes(w)) return false;
  }
  for (const cw of COMMENTARY_BLACKLIST) {
    if (t.includes(cw)) return false;
  }

  // 日文假名绝对零容忍
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return false;
  // 韩文字符绝对零容忍
  if (/[\uac00-\ud7af]/.test(t)) return false;
  // 必须包含中文汉字
  if (!/[\u4e00-\u9fa5]/.test(t)) return false;
  // 绝不能以全角波浪号 ～ 或 日文特定符号结尾/夹带
  if (/[～〜]/.test(t)) return false;
  // 汉字数量至少占所有字符的 40% 以上（杜绝 Grow Up Show 这类外文夹带两个汉字）
  const chineseChars = t.match(/[\u4e00-\u9fa5]/g) || [];
  const validTotal = t.replace(/\s+/g, '').length;
  if (chineseChars.length / validTotal < 0.4) return false;
  return true;
}

function normalizeTitle(title) {
  if (!title || typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[【\[][^】\]]*[】\]]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^\w\u4e00-\u9fa5]/g, '');
}

/**
 * 纯化片名：剥离抢先版、TC、枪版、HD、国粤双语、字幕等杂质
 */
function cleanMovieTitle(raw) {
  if (!raw) return '';
  let name = raw.trim();
  name = name.replace(/[（(][^)）]*[)）]/g, '');
  name = name.replace(/\[[^\]]*\]/g, '');
  name = name.replace(/(抢先版|TC版|TC|枪版|HD版|HD|高清版|高清|中字|国语|粤语|原声|TS|CAM|HC|超清|完整版|未删减|4K|1080P)/gi, '');
  name = name.replace(/[·•\-_—\s：:]+$/g, '');
  return name.trim();
}

async function kvGet(key) {
  try {
    const res = await fetch(`${BASE_URL}/values/${encodeURIComponent(key)}`, { headers: HEADERS });
    if (!res.ok) return null;
    return res.text();
  } catch {
    return null;
  }
}

async function kvPut(key, value) {
  if (!API_KEY) {
    console.warn(`⚠️ [首发雷达] 未提供 KV API Key，跳过写入 ${key}`);
    return;
  }
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    const res = await fetch(`${BASE_URL}/values/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { ...HEADERS, 'Content-Type': 'application/json' },
      body: str,
    });
    const data = await res.json();
    if (!data.success) {
      console.warn(`⚠️ [首发雷达] kvPut warning for ${key}: ${JSON.stringify(data.errors)}`);
    }
  } catch (err) {
    console.warn(`⚠️ [首发雷达] kvPut error for ${key}:`, err.message);
  }
}

async function kvBulkPut(pairs) {
  if (!API_KEY) {
    console.warn(`⚠️ [首发雷达] 未提供 KV API Key，跳过 Bulk 写入`);
    return;
  }
  const BATCH_SIZE = 1000;
  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    try {
      const batch = pairs.slice(i, i + BATCH_SIZE).map(p => ({
        key: p.key,
        value: typeof p.value === 'string' ? p.value : JSON.stringify(p.value),
      }));
      const res = await fetch(`${BASE_URL}/bulk`, {
        method: 'PUT',
        headers: { ...HEADERS, 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
      const data = await res.json();
      if (!data.success) console.warn(`⚠️ [首发雷达] KV Bulk PUT warning: ${JSON.stringify(data.errors)}`);
    } catch (err) {
      console.warn(`⚠️ [首发雷达] KV Bulk PUT error:`, err.message);
    }
  }
}

/**
 * TMDB 官方权威物料匹配与增强
 */
async function fetchTmdbDetail(title, year, type = 'movie') {
  const tmdbType = type === 'tv' ? 'tv' : 'movie';
  const url = `${TMDB_BASE}/search/${tmdbType}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(title)}&page=1`;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const results = data.results || [];
    if (results.length === 0) return null;

    // 优先匹配年份最接近的
    let hit = results[0];
    if (year) {
      const matchedYear = results.find(r => {
        const release = r.release_date || r.first_air_date || '';
        return release.startsWith(String(year));
      });
      if (matchedYear) hit = matchedYear;
    }

    return {
      tmdbId: String(hit.id),
      tmdbType,
      title: hit.title || hit.name || title,
      originalTitle: hit.original_title || hit.original_name || '',
      description: hit.overview || '',
      rate: hit.vote_average ? String(hit.vote_average.toFixed(1)) : '8.0',
      cover: hit.poster_path ? `https://image.tmdb.org/t/p/w500${hit.poster_path}` : '',
      backdrop: hit.backdrop_path ? `https://image.tmdb.org/t/p/w1280${hit.backdrop_path}` : '',
      year: (hit.release_date || hit.first_air_date || year || '2026').slice(0, 4),
    };
  } catch (err) {
    return null;
  }
}

async function main() {
  console.log('🚀 [首发雷达] 启动全网院线抢先与首发爆款嗅探流水线...');

  const currentYear = new Date().getFullYear();
  const candidateList = [];

  // 1. 扫描三大骨干采集站
  for (const col of COLLECTORS) {
    try {
      console.log(`📡 [首发雷达] 正在嗅探采集站: ${col.name}...`);
      // 拉取最近更新的 40 条
      const url = `${col.url}?ac=detail&pg=1&pagesize=40`;
      const res = await fetch(url, { signal: AbortSignal.timeout(8000), headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) continue;
      const data = await res.json();
      const list = data.list || [];

      for (const it of list) {
        const rawTitle = it.vod_name || '';
        const cleanTitle = cleanMovieTitle(rawTitle);
        const year = parseInt(it.vod_year || currentYear, 10);
        const remarks = it.vod_remarks || '';

        // 仅保留 2025~2026 最新片
        if (year < 2025) continue;
        if (!isCleanChineseTitle(cleanTitle)) continue;

        // 判断是否具备院线首发或高热度特征
        const isFirstRelease = /(抢先|TC|枪版|HD|预告|TS|CAM)/i.test(rawTitle) || /(抢先|TC|枪版)/i.test(remarks);
        
        candidateList.push({
          rawTitle,
          cleanTitle,
          year: String(year),
          type: it.type_id === 1 || it.vod_class?.includes('电影') || (!it.vod_remarks?.includes('集') && !it.vod_remarks?.includes('期')) ? 'movie' : 'tv',
          remarks: remarks || (isFirstRelease ? '抢先版' : '超清'),
          isFirstRelease,
          cover: it.vod_pic,
          vodTime: it.vod_time || new Date().toISOString(),
          collector: col.id,
        });
      }
    } catch (err) {
      console.warn(`⚠️ [首发雷达] 采集站 ${col.name} 请求失败: ${err.message}`);
    }
  }

  console.log(`📋 [首发雷达] 累计捕获候选新片: ${candidateList.length} 条`);

  // 2. 去重并提取唯一新片
  const uniqueTitles = new Map();
  for (const c of candidateList) {
    if (!uniqueTitles.has(c.cleanTitle)) {
      uniqueTitles.set(c.cleanTitle, c);
    }
  }

  const pioneers = [];
  const entitiesToCreate = [];

  // 读取全局 index:all
  const rawIndexAll = await kvGet('index:all');
  const indexAll = rawIndexAll ? JSON.parse(rawIndexAll) : [];
  const indexAllSet = new Set(indexAll);

  // 获取当前最大实体 ID 序号
  let maxEntitySeq = 20581;
  for (const id of indexAll) {
    const m = id.match(/^ik(\d+)$/);
    if (m) {
      const num = parseInt(m[1], 10);
      if (num > maxEntitySeq && num < 900000) maxEntitySeq = num;
    }
  }

  console.log(`🔍 [首发雷达] 生产库当前最高实体序列号: ik${String(maxEntitySeq).padStart(6, '0')}`);

  for (const [title, item] of uniqueTitles.entries()) {
    // 检查生产库是否已有此实体
    let entityId = null;
    const norm = normalizeTitle(title);
    const rawSlugId = await kvGet(`slug:${encodeURIComponent(title)}`) || await kvGet(`slug:${title}`);
    if (rawSlugId) {
      entityId = rawSlugId.trim();
    } else {
      let rawTitleId = norm ? await kvGet(`title:${norm}`) : null;
      if (!rawTitleId) rawTitleId = await kvGet(`title:${title}`);
      if (rawTitleId) entityId = rawTitleId.trim();
    }

    if (entityId) {
      // 检查库中已有实体的年份是否与当前候选新片一致
      const rawEnt = await kvGet(`entity:${entityId}`);
      if (rawEnt) {
        const ent = JSON.parse(rawEnt);
        const existingYear = parseInt(ent.year || '2000', 10);
        const candidateYear = parseInt(item.year || '2026', 10);

        // 🌟 核心防线：只有年份匹配（差值 <= 1 年）才认定为同一部影片
        if (Math.abs(existingYear - candidateYear) <= 1) {
          pioneers.push({
            entityId,
            title: ent.title,
            year: ent.year,
            type: ent.type || item.type,
            rate: ent.rate || '8.0',
            cover: ent.cover,
            backdrop: ent.backdrop,
            remarks: item.remarks,
          });
          continue;
        } else {
          console.log(`⚠️ [同名碰撞消除] 库中已有条目 《${title}》 为 ${existingYear} 年老片，当前为 ${candidateYear} 年超级新片，破除吞噬，重新独立建档！`);
          entityId = null; // 重置，强制进入 TMDB 4K 官方资产建档流水线
        }
      }
    }

    // 库中没有，TMDB 官方匹配与建档
    console.log(`✨ [首发建档] 发现院线首发新片: 《${title}》 (${item.year})，正在请求 TMDB 官方 4K 物料...`);
    const tmdbData = await fetchTmdbDetail(title, item.year, item.type);
    if (!tmdbData) {
      console.log(`   ⏩ TMDB 未命中，暂缓入库: 《${title}》`);
      continue;
    }
    if (!isCleanChineseTitle(tmdbData.title)) {
      console.log(`   ⛔ TMDB 片名非纯净华语标题，拒绝建档: 《${tmdbData.title}》`);
      continue;
    }

    // 🌟 TMDB 反向索引与片名二次查重：坚决复用已有 entityId，杜绝重复建档
    const existingTmdbEntityId = await kvGet(`tmdb:${tmdbData.tmdbType}:${tmdbData.tmdbId}`);
    if (existingTmdbEntityId) {
      console.log(`   ♻️ 发现 TMDB 已有关联实体 (${existingTmdbEntityId.trim()})，坚决复用已有主键，杜绝重复造号！`);
      continue;
    }
    const tmdbTitleNorm = normalizeTitle(tmdbData.title);
    const existingTmdbTitleId = tmdbTitleNorm ? await kvGet(`title:${tmdbTitleNorm}`) : null;
    if (existingTmdbTitleId) {
      console.log(`   ♻️ 发现片名已有关联实体 (${existingTmdbTitleId.trim()})，坚决复用已有主键，杜绝重复造号！`);
      continue;
    }

    maxEntitySeq += 1;
    const newEntityId = `ik${String(maxEntitySeq).padStart(6, '0')}`;
    const newEntity = {
      entityId: newEntityId,
      slug: title.replace(/[:：\s]+/g, '-'),
      tmdbId: tmdbData.tmdbId,
      tmdbType: tmdbData.tmdbType,
      title: tmdbData.title,
      originalTitle: tmdbData.originalTitle,
      type: item.type,
      year: tmdbData.year,
      description: tmdbData.description,
      cover: tmdbData.cover || item.cover,
      backdrop: tmdbData.backdrop,
      rate: tmdbData.rate,
      score: tmdbData.rate,
      genres: item.type === 'movie' ? ['院线', '热映'] : ['剧集'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    entitiesToCreate.push({
      key: `entity:${newEntityId}`,
      value: newEntity,
    });
    entitiesToCreate.push({
      key: `slug:${newEntity.slug}`,
      value: newEntityId,
    });
    entitiesToCreate.push({
      key: `slug:${encodeURIComponent(newEntity.slug)}`,
      value: newEntityId,
    });
    entitiesToCreate.push({
      key: `title:${newEntity.title}`,
      value: newEntityId,
    });
    entitiesToCreate.push({
      key: `slug:${newEntity.slug}-${newEntity.year}`,
      value: newEntityId,
    });
    entitiesToCreate.push({
      key: `slug:${encodeURIComponent(`${newEntity.slug}-${newEntity.year}`)}`,
      value: newEntityId,
    });

    indexAll.push(newEntityId);
    indexAllSet.add(newEntityId);

    pioneers.push({
      entityId: newEntityId,
      title: newEntity.title,
      year: newEntity.year,
      type: newEntity.type,
      rate: newEntity.rate,
      cover: newEntity.cover,
      backdrop: newEntity.backdrop,
      remarks: item.remarks,
    });

    console.log(`   🎉 建档成功: [${newEntityId}] 《${newEntity.title}》 (${newEntity.year})`);
  }

  // 3. 写入新建实体与更新 index:all
  if (entitiesToCreate.length > 0) {
    console.log(`⚡ [首发雷达] 正在向生产 KV 写入 ${entitiesToCreate.length} 条新建实体及别名键...`);
    await kvBulkPut(entitiesToCreate);
    await kvPut('index:all', indexAll);
    console.log(`✅ [首发雷达] 全局 index:all 更新成功，当前实体总数: ${indexAll.length}`);
  }

  // 4. 将先锋片单保存至本地缓存与 KV
  const moviePioneers = pioneers.filter(p => p.type === 'movie');
  const tvPioneers = pioneers.filter(p => p.type === 'tv');

  fs.writeFileSync(path.join(CACHE_DIR, 'first-release-pioneers.json'), JSON.stringify(pioneers, null, 2));
  console.log(`💾 [首发雷达] 先锋片单已持久化至本地缓存: 电影 ${moviePioneers.length} 部, 剧集 ${tvPioneers.length} 部`);

  // 5. 自动无缝置顶融合四大排序与 recent:*
  console.log('🔄 [双轨融合] 正在将首发先锋片单注入四大排序首位与最新上线横轨...');
  
  // 🌟 确保战略级超级院线新片（《生化危机：爆发夜》ik020581 与 韩国科幻巨制《希望》ik100710）恒定排在最前列
  const TOP_FLAGSHIPS = ['ik020581', 'ik100710'];
  const moviePioneerIds = [...TOP_FLAGSHIPS, ...moviePioneers.filter(p => !TOP_FLAGSHIPS.includes(p.entityId)).map(p => p.entityId)];
  const allPioneerIds = [...TOP_FLAGSHIPS, ...pioneers.filter(p => !TOP_FLAGSHIPS.includes(p.entityId)).map(p => p.entityId)];

  // 注入 channel:movie
  let movieChannel = [];
  const rawMovieCh = await kvGet('channel:movie');
  if (rawMovieCh) movieChannel = JSON.parse(rawMovieCh);
  const newChMovie = Array.from(new Set([...moviePioneerIds, ...movieChannel]));
  await kvPut('channel:movie', newChMovie);

  // 置顶 index:time_added:movie 与 index:time_added:all
  const rawTimeAddedM = await kvGet('index:time_added:movie');
  let timeAddedM = rawTimeAddedM ? JSON.parse(rawTimeAddedM) : [];
  timeAddedM = Array.from(new Set([...moviePioneerIds, ...timeAddedM]));
  await kvPut('index:time_added:movie', timeAddedM);

  const rawTimeAddedAll = await kvGet('index:time_added:all');
  let timeAddedAll = rawTimeAddedAll ? JSON.parse(rawTimeAddedAll) : [];
  timeAddedAll = Array.from(new Set([...allPioneerIds, ...timeAddedAll]));
  await kvPut('index:time_added:all', timeAddedAll);

  // 置顶 index:time_updated:movie 与 index:time_updated:all
  const rawTimeUpM = await kvGet('index:time_updated:movie');
  let timeUpM = rawTimeUpM ? JSON.parse(rawTimeUpM) : [];
  timeUpM = Array.from(new Set([...moviePioneerIds, ...timeUpM]));
  await kvPut('index:time_updated:movie', timeUpM);

  // 置顶 recent:movie 与 recent:all 横轨
  const residentEvilRecent = {
    entityId: "ik020581",
    tmdbId: "1423191",
    title: "生化危机：爆发夜",
    slug: "生化危机-爆发夜",
    cover: "https://image.tmdb.org/t/p/w500/qMvRqzzDVfQpLi5ZoKwttTQdaJe.jpg",
    backdrop: "https://image.tmdb.org/t/p/w1280/1CIaRYKf3zg2Xyce1CSfCMg2Vfw.jpg",
    rate: "8.1",
    year: "2026",
    type: "movie",
    channelKey: "movie",
    genres: ["恐怖", "科幻"],
    updateBadge: "抢先版",
    qualityBadge: "TC",
    createdAt: new Date().toISOString()
  };
  const rawRecentM = await kvGet('recent:movie');
  let recentM = rawRecentM ? JSON.parse(rawRecentM) : [];
  recentM = [residentEvilRecent, ...recentM.filter(it => (it.entityId || it.id) !== 'ik020581')].slice(0, 24);
  await kvPut('recent:movie', recentM);

  const rawRecentAll = await kvGet('recent:all');
  let recentAll = rawRecentAll ? JSON.parse(rawRecentAll) : [];
  recentAll = [residentEvilRecent, ...recentAll.filter(it => (it.entityId || it.id) !== 'ik020581')].slice(0, 24);
  await kvPut('recent:all', recentAll);

  console.log(`🎉 [首发雷达] 全网首发先锋爆款已成功完成侦测、建档与排序物理置顶闭环！`);
}

main().catch(err => {
  console.warn('⚠️ [首发雷达执行警告]:', err.message);
  // 保持优雅降级，退出码 0，绝不阻断后续大盘影视同步与自动上线流水线
  process.exit(0);
});
