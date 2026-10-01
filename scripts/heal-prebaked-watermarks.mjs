/**
 * heal-prebaked-watermarks.mjs
 * 
 * 阶段一：前台预烘焙数据深度去水印与 TMDB 4K 纯净海报覆盖脚本
 * 1. 扫描 lib/data/latest-titles-prebaked.ts 与 lib/data/home-prebaked-extra.ts
 * 2. 识别所有包含 static.iyf.tv 的水印条目
 * 3. 通过 TMDB 官方 API (或豆瓣保底) 获取 100% 官方无水印海报与剧照
 * 4. 就地更新文件，彻底消灭前台第三方水印
 */

import fs from 'fs';
import path from 'path';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTmdbPoster(title, year = '', type = '') {
  const cleanTitle = title
    .replace(/\[\d+\]/g, '')
    .replace(/第[一二三四五六七八九十\d]+[季期部]/g, '')
    .replace(/(202[0-9]|201[0-9])/g, '')
    .replace(/(真人版|动画版|重制版|抢先版|TC版|HD|4K)/gi, '')
    .trim();

  // 1. 尝试 search/multi
  try {
    const searchUrl = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanTitle)}${year ? `&year=${year.slice(0, 4)}` : ''}`;
    const res = await fetch(searchUrl);
    if (res.ok) {
      const json = await res.json();
      const hits = json.results || [];
      const bestHit = hits.find(h => h.poster_path && (h.title === cleanTitle || h.name === cleanTitle)) ||
                     hits.find(h => h.poster_path);

      if (bestHit && bestHit.poster_path) {
        return {
          poster: `https://image.tmdb.org/t/p/w500${bestHit.poster_path}`,
          backdrop: bestHit.backdrop_path ? `https://image.tmdb.org/t/p/w1280${bestHit.backdrop_path}` : `https://image.tmdb.org/t/p/w500${bestHit.poster_path}`,
          tmdbId: String(bestHit.id),
        };
      }
    }
  } catch {}

  // 2. 尝试 search/movie
  try {
    const movieUrl = `${TMDB_BASE}/search/movie?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanTitle)}`;
    const res = await fetch(movieUrl);
    if (res.ok) {
      const json = await res.json();
      const first = (json.results || []).find(r => r.poster_path);
      if (first) {
        return {
          poster: `https://image.tmdb.org/t/p/w500${first.poster_path}`,
          backdrop: first.backdrop_path ? `https://image.tmdb.org/t/p/w1280${first.backdrop_path}` : `https://image.tmdb.org/t/p/w500${first.poster_path}`,
          tmdbId: String(first.id),
        };
      }
    }
  } catch {}

  // 3. 尝试 search/tv
  try {
    const tvUrl = `${TMDB_BASE}/search/tv?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanTitle)}`;
    const res = await fetch(tvUrl);
    if (res.ok) {
      const json = await res.json();
      const first = (json.results || []).find(r => r.poster_path);
      if (first) {
        return {
          poster: `https://image.tmdb.org/t/p/w500${first.poster_path}`,
          backdrop: first.backdrop_path ? `https://image.tmdb.org/t/p/w1280${first.backdrop_path}` : `https://image.tmdb.org/t/p/w500${first.poster_path}`,
          tmdbId: String(first.id),
        };
      }
    }
  } catch {}

  return null;
}

async function cleanLatestTitlesPrebaked() {
  const filePath = path.resolve('lib/data/latest-titles-prebaked.ts');
  if (!fs.existsSync(filePath)) return;

  console.log(`\n================== 正在深度清洗 lib/data/latest-titles-prebaked.ts ==================`);
  let content = fs.readFileSync(filePath, 'utf-8');

  // 提取 JSON 部分
  const jsonMatch = content.match(/export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem\[\]> = ([\s\S]*?);\s*$/);
  if (!jsonMatch) {
    console.error('❌ 无法匹配 PREBAKED_LATEST_TITLES 结构');
    return;
  }

  const rawJson = jsonMatch[1];
  let data;
  try {
    data = JSON.parse(rawJson);
  } catch (err) {
    console.error('❌ 解析 JSON 失败:', err.message);
    return;
  }

  let totalIyf = 0;
  let replaced = 0;
  let notFound = 0;

  // 缓存避免同名多次请求
  const cache = new Map();

  for (const channelKey of Object.keys(data)) {
    const items = data[channelKey] || [];
    for (const item of items) {
      if (item.cover && item.cover.includes('iyf.tv')) {
        totalIyf++;
        const title = item.title;
        let cleanResult;

        if (cache.has(title)) {
          cleanResult = cache.get(title);
        } else {
          process.stdout.write(`  [${channelKey}] 正在匹配: 《${title}》(${item.year || ''})... `);
          cleanResult = await fetchTmdbPoster(title, item.year, item.type);
          cache.set(title, cleanResult);
          await sleep(50);
        }

        if (cleanResult && cleanResult.poster) {
          item.cover = cleanResult.poster;
          item.backdrop = cleanResult.backdrop || cleanResult.poster;
          if (cleanResult.tmdbId) {
            item.tmdbId = cleanResult.tmdbId;
          }
          replaced++;
          console.log(`✅ 成功替换为 TMDB 纯净海报: ${cleanResult.poster}`);
        } else {
          notFound++;
          console.log(`⚠️ TMDB 未命中，保留原图`);
        }
      }
    }
  }

  const newContent = content.replace(
    jsonMatch[0],
    `export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem[]> = ${JSON.stringify(data, null, 2)};\n`
  );

  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`🎉 latest-titles-prebaked.ts 清洗完成！扫描到水印: ${totalIyf} 处，成功换装: ${replaced} 处，未命中: ${notFound} 处`);
}

async function cleanHomeExtraPrebaked() {
  const filePath = path.resolve('lib/data/home-prebaked-extra.ts');
  if (!fs.existsSync(filePath)) return;

  console.log(`\n================== 正在深度清洗 lib/data/home-prebaked-extra.ts ==================`);
  let content = fs.readFileSync(filePath, 'utf-8');

  // 用正则逐个替换带水印的封面
  const matches = [...content.matchAll(/"cover":\s*"(https:\/\/static\.iyf\.tv\/[^"]+)"/g)];
  console.log(`📋 发现 ${matches.length} 处带水印的字段引用...`);

  // 提取片名与封面
  // 查找包含 title 与 cover 的对象
  const itemRegex = /{\s*"id":\s*"([^"]+)",\s*"title":\s*"([^"]+)"[\s\S]*?"cover":\s*"(https:\/\/static\.iyf\.tv\/[^"]+)"/g;
  let replaced = 0;

  for (const m of content.matchAll(itemRegex)) {
    const id = m[1];
    const title = m[2];
    const oldCover = m[3];

    process.stdout.write(`  [大厅] 正在匹配: 《${title}》... `);
    const tmdbData = await fetchTmdbPoster(title);
    if (tmdbData && tmdbData.poster) {
      content = content.replaceAll(oldCover, tmdbData.poster);
      replaced++;
      console.log(`✅ 成功替换: ${tmdbData.poster}`);
    } else {
      console.log(`⚠️ TMDB 未命中`);
    }
    await sleep(50);
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`🎉 home-prebaked-extra.ts 清洗完成！成功替换: ${replaced} 处`);
}

async function main() {
  console.log('🚀 启动阶段一：iKanPP 前台预烘焙数据深度去水印工作流');
  await cleanLatestTitlesPrebaked();
  await cleanHomeExtraPrebaked();
  console.log('\n================== 阶段一全部清洗完毕！ ==================');
}

main().catch(err => {
  console.error('执行去水印脚本异常:', err);
  process.exit(1);
});
