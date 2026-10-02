/**
 * iKanPP 占位图深度定向自愈引擎 (Placeholder Cover Deep Healing Engine)
 * 
 * 核心目标：
 * 针对片库中因标题噪点（如“TV版”、“网络版”、“未删减”、“为什么/为何”等）
 * 导致未能初次命中 TMDB 而降级为 /placeholder-poster.svg 的 2,213 部作品，
 * 实施多阶段智能分词、别名自愈、TMDB 及主力骨干采集站（极速、光速）并发补全，
 * 彻底消灭片库中的“封面加载中”占位海报。
 */

import fs from 'fs';
import path from 'path';

const MASTER_CATALOG_FILE = path.resolve('.cache/iyf-master-catalog.json');
const HEAL_CACHE_FILE = path.resolve('.cache/watermark-heal-cache.json');
const TMDB_API_KEY = '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const NOISE_REGEX = /(TV版|网络版|未删减版|未删减|最终季|预告|花絮|粤语版|国语版|普通话版|原声版|中字|双字|超清版|高清版|重制版|典藏版|第[一二三四五六七八九十0-9]+[季部]|完结篇|剧场版|\d+集全|\d+期全)/gi;

function cleanTitleVariants(raw) {
  if (!raw) return [];
  const variants = new Set();
  
  // 1. 去除括号内容
  const noBracket = raw
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[【\[].*?[】\]]/g, '')
    .trim();
  variants.add(noBracket);

  // 2. 剥离版本噪点
  const stripped = noBracket.replace(NOISE_REGEX, '').trim();
  if (stripped && stripped !== noBracket) {
    variants.add(stripped);
  }

  // 3. 特殊字词同义转换
  if (stripped.includes('为什么')) {
    variants.add(stripped.replace(/为什么/g, '为何'));
  }
  if (stripped.includes('为何')) {
    variants.add(stripped.replace(/为何/g, '为什么'));
  }
  if (stripped.includes('哈利波特')) {
    variants.add(stripped.replace(/哈利波特\s*(\d*)\s*(.*)/, '哈利·波特与$2').trim());
    variants.add(stripped.replace(/哈利波特/g, '哈利·波特'));
  }
  if (stripped.includes('绿豆前的我们')) {
    variants.add('玛嘉烈与大卫 绿豆');
  }

  // 4. 清理末尾特殊符号
  for (const v of Array.from(variants)) {
    const pure = v.replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|\s_-]/g, '').trim();
    if (pure) variants.add(pure);
  }

  return Array.from(variants).filter(Boolean);
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function fetchTMDB(query, year) {
  try {
    const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(query)}${year ? `&year=${year.slice(0, 4)}` : ''}`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data.results?.find(x => x.poster_path);
    if (hit) {
      return {
        cover: `https://image.tmdb.org/t/p/w500${hit.poster_path}`,
        backdrop: hit.backdrop_path ? `https://image.tmdb.org/t/p/w1280${hit.backdrop_path}` : `https://image.tmdb.org/t/p/w500${hit.poster_path}`,
        source: 'tmdb',
      };
    }
  } catch {}
  return null;
}

async function fetchCollector(query) {
  // 极速资源
  try {
    const u1 = `https://jszyapi.com/api.php/provide/vod/?ac=detail&wd=${encodeURIComponent(query)}`;
    const r1 = await fetch(u1, { signal: AbortSignal.timeout(3500) });
    if (r1.ok) {
      const d1 = await r1.json();
      const hit1 = d1.list?.find(x => x.vod_pic && !x.vod_pic.includes('iyf.tv') && x.vod_pic.startsWith('http'));
      if (hit1) {
        return {
          cover: hit1.vod_pic,
          backdrop: hit1.vod_pic,
          source: 'jisu',
        };
      }
    }
  } catch {}

  // 光速资源
  try {
    const u2 = `https://api.guangsuapi.com/api.php/provide/vod/?ac=detail&wd=${encodeURIComponent(query)}`;
    const r2 = await fetch(u2, { signal: AbortSignal.timeout(3500) });
    if (r2.ok) {
      const d2 = await r2.json();
      const hit2 = d2.list?.find(x => x.vod_pic && !x.vod_pic.includes('iyf.tv') && x.vod_pic.startsWith('http'));
      if (hit2) {
        return {
          cover: hit2.vod_pic,
          backdrop: hit2.vod_pic,
          source: 'guangsu',
        };
      }
    }
  } catch {}

  return null;
}

async function main() {
  console.log(`\n=============================================================`);
  console.log(`🚀 iKanPP 占位图深度定向自愈引擎启动`);
  console.log(`=============================================================`);

  if (!fs.existsSync(MASTER_CATALOG_FILE)) {
    console.error(`❌ 未找到主片库文件: ${MASTER_CATALOG_FILE}`);
    return;
  }

  const catalog = JSON.parse(fs.readFileSync(MASTER_CATALOG_FILE, 'utf-8'));
  const healCache = fs.existsSync(HEAL_CACHE_FILE) ? JSON.parse(fs.readFileSync(HEAL_CACHE_FILE, 'utf-8')) : {};

  // 找出所有占位图条目
  const targets = [];
  catalog.forEach((item, index) => {
    if (!item.cover || item.cover.includes('placeholder') || item.cover === '/placeholder-poster.svg') {
      targets.push({ item, index });
    }
  });

  console.log(`📊 片库总数: ${catalog.length} 部`);
  console.log(`🎯 待自愈占位图数量: ${targets.length} 部\n`);

  let healedCount = 0;
  let tmdbHealed = 0;
  let collectorHealed = 0;
  const CONCURRENCY = 10;

  for (let i = 0; i < targets.length; i += CONCURRENCY) {
    const chunk = targets.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async ({ item, index }) => {
      const rawTitle = item.title;
      const variants = cleanTitleVariants(rawTitle);

      let found = null;

      // 1. 尝试 TMDB 多变体检索
      for (const v of variants) {
        found = await fetchTMDB(v, item.year);
        if (found) break;
      }

      // 2. 若 TMDB 未命中，尝试采集站检索
      if (!found) {
        for (const v of variants) {
          found = await fetchCollector(v);
          if (found) break;
        }
      }

      if (found) {
        catalog[index].cover = found.cover;
        catalog[index].backdrop = found.backdrop || found.cover;
        healedCount++;
        if (found.source === 'tmdb') tmdbHealed++;
        else collectorHealed++;

        // 记入缓存
        healCache[rawTitle] = {
          poster: found.cover,
          backdrop: found.backdrop || found.cover,
          source: found.source,
          healedAt: new Date().toISOString(),
        };

        console.log(`✨ [${healedCount}] 自愈成功: "${rawTitle}" (${item.year || ''}) -> [${found.source.toUpperCase()}] ${found.cover.slice(0, 60)}...`);
      }
    }));

    if (i % 100 === 0 && i > 0) {
      console.log(`⏳ 进度: ${i}/${targets.length} (${((i / targets.length) * 100).toFixed(1)}%) | 已成功自愈: ${healedCount} 部 (TMDB: ${tmdbHealed}, 采集站: ${collectorHealed})`);
      // 定期持久化
      fs.writeFileSync(MASTER_CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
      fs.writeFileSync(HEAL_CACHE_FILE, JSON.stringify(healCache, null, 2), 'utf-8');
    }
  }

  // 最终保存
  fs.writeFileSync(MASTER_CATALOG_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
  fs.writeFileSync(HEAL_CACHE_FILE, JSON.stringify(healCache, null, 2), 'utf-8');

  const remainingPlaceholders = catalog.filter(x => !x.cover || x.cover.includes('placeholder')).length;

  console.log(`\n=============================================================`);
  console.log(`🎉 占位图深度自愈执行完毕！`);
  console.log(`📊 成功补全封面: ${healedCount} 部 (TMDB: ${tmdbHealed}, 采集站: ${collectorHealed})`);
  console.log(`📉 剩余占位图数量降至: ${remainingPlaceholders} 部 (占比: ${((remainingPlaceholders / catalog.length) * 100).toFixed(2)}%)`);
  console.log(`=============================================================\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
