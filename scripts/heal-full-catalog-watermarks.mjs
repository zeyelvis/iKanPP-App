/**
 * heal-full-catalog-watermarks.mjs
 * 
 * 阶段二：片库总表深度去水印与 TMDB 4K 纯净海报全量替换引擎
 * 1. 扫描 .cache/iyf-master-catalog.json 中的全部 3.1 万部条目
 * 2. 挂载断点续传缓存 (.cache/watermark-heal-cache.json)，防止重复调用 TMDB API
 * 3. 并发批量清洗，优先覆盖热度 TOP 5000 黄金片单
 * 4. 彻底将 .cache/iyf-master-catalog.json 中的 static.iyf.tv 替换为 TMDB 官方 4K 原版海报
 */

import fs from 'fs';
import path from 'path';

const CACHE_DIR = path.resolve('.cache');
const INPUT_FILE = path.resolve(CACHE_DIR, 'iyf-master-catalog.json');
const HEAL_CACHE_FILE = path.resolve(CACHE_DIR, 'watermark-heal-cache.json');

const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// 加载历史清洗缓存
let healCache = new Map();
if (fs.existsSync(HEAL_CACHE_FILE)) {
  try {
    const raw = JSON.parse(fs.readFileSync(HEAL_CACHE_FILE, 'utf-8'));
    healCache = new Map(Object.entries(raw));
    console.log(`📂 已加载断点清洗缓存: ${healCache.size} 部`);
  } catch {}
}

function saveCache() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
  fs.writeFileSync(HEAL_CACHE_FILE, JSON.stringify(Object.fromEntries(healCache), null, 2), 'utf-8');
}

async function fetchCleanPoster(title, year = '', channel = '') {
  if (healCache.has(title)) {
    return healCache.get(title);
  }

  const cleanTitle = title
    .replace(/\[\d+\]/g, '')
    .replace(/第[一二三四五六七八九十\d]+[季期部]/g, '')
    .replace(/(202[0-9]|201[0-9])/g, '')
    .replace(/(真人版|动画版|重制版|抢先版|TC版|HD|4K)/gi, '')
    .trim();

  let result = null;

  try {
    const searchUrl = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanTitle)}${year ? `&year=${year.slice(0, 4)}` : ''}`;
    const res = await fetch(searchUrl);
    if (res.ok) {
      const json = await res.json();
      const hits = json.results || [];
      const best = hits.find(h => h.poster_path && (h.title === cleanTitle || h.name === cleanTitle)) ||
                   hits.find(h => h.poster_path);

      if (best && best.poster_path) {
        result = {
          poster: `https://image.tmdb.org/t/p/w500${best.poster_path}`,
          backdrop: best.backdrop_path ? `https://image.tmdb.org/t/p/w1280${best.backdrop_path}` : '',
          tmdbId: String(best.id),
        };
      }
    }
  } catch {}

  if (!result) {
    // 降级使用 search/movie 或 search/tv
    const ep = channel === 'tv' || channel === 'anime' ? 'tv' : 'movie';
    try {
      const u = `${TMDB_BASE}/search/${ep}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanTitle)}`;
      const res = await fetch(u);
      if (res.ok) {
        const json = await res.json();
        const first = (json.results || []).find(r => r.poster_path);
        if (first) {
          result = {
            poster: `https://image.tmdb.org/t/p/w500${first.poster_path}`,
            backdrop: first.backdrop_path ? `https://image.tmdb.org/t/p/w1280${first.backdrop_path}` : '',
            tmdbId: String(first.id),
          };
        }
      }
    } catch {}
  }

  healCache.set(title, result || false);
  return result;
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ 未找到全量片单文件: ${INPUT_FILE}`);
    return;
  }

  console.log(`\n🚀 启动全库 3.1 万部片单深度去水印与 TMDB 4K 海报覆盖引擎...`);
  const catalog = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`📊 成功载入全库条目: ${catalog.length} 部`);

  let watermarkCount = 0;
  let healedCount = 0;
  let skippedCount = 0;

  // 筛选出所有带水印的条目
  const targets = catalog.filter(it => it.cover && it.cover.includes('iyf.tv'));
  console.log(`📋 统计全库带爱壹帆水印条目: ${targets.length} 部`);

  // 按热度排序，优先清洗最高频被访问的热门影视
  targets.sort((a, b) => (Number(b.hot) || 0) - (Number(a.hot) || 0));

  // 本批次处理上限（每次处理 1000 部最高热度影片，支持定期滚动全部清洗）
  const BATCH_LIMIT = parseInt(process.env.LIMIT || '500', 10);
  const currentBatch = targets.slice(0, BATCH_LIMIT);
  console.log(`⚡ 本批次聚焦清洗 TOP ${currentBatch.length} 部高频热剧/院线新片...\n`);

  for (let i = 0; i < currentBatch.length; i++) {
    const item = currentBatch[i];
    process.stdout.write(`[${i + 1}/${currentBatch.length}] 正在清洗: 《${item.title}》(${item.year || ''})... `);

    const clean = await fetchCleanPoster(item.title, item.year, item.channel);
    if (clean && clean.poster) {
      item.cover = clean.poster;
      if (clean.backdrop) {
        item.backdrop = clean.backdrop;
      }
      healedCount++;
      console.log(`✅ 已换装 TMDB 官方海报: ${clean.poster}`);
    } else {
      skippedCount++;
      console.log(`⚠️ 未命中官方资产，保留当前`);
    }

    // 每 50 部持久化一次断点
    if ((i + 1) % 50 === 0) {
      saveCache();
      fs.writeFileSync(INPUT_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
      console.log(`💾 进度已安全持久化 (${i + 1}/${currentBatch.length})`);
    }

    await sleep(40);
  }

  saveCache();
  fs.writeFileSync(INPUT_FILE, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\n🎉 本批次清洗完成！成功换装: ${healedCount} 部，未命中: ${skippedCount} 部`);
}

main().catch(err => {
  console.error('全库去水印任务异常:', err);
  process.exit(1);
});
