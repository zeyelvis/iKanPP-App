/**
 * TMDB 批量影视入库种子脚本 (Seed Script)
 * 用法: npx tsx scripts/seed-entities.ts [pages]
 * 默认抓取 discover/movie 和 discover/tv 中文与高分影片
 */

import * as fs from 'fs';
import * as path from 'path';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runSeed() {
  if (!TMDB_API_KEY) {
    console.error('❌ 请先配置环境变量 TMDB_API_KEY，例如: TMDB_API_KEY=xxx npx tsx scripts/seed-entities.ts');
    process.exit(1);
  }

  const maxPages = parseInt(process.argv[2] || '5', 10);
  console.log(`🚀 开始从 TMDB 抓取影视元数据，计划抓取 ${maxPages} 页...`);

  const collected: any[] = [];
  const types: ('movie' | 'tv')[] = ['movie', 'tv'];

  for (const type of types) {
    for (let page = 1; page <= maxPages; page++) {
      const url = `${TMDB_BASE}/discover/${type}?api_key=${TMDB_API_KEY}&language=zh-CN&sort_by=vote_count.desc&with_original_language=zh&page=${page}`;
      try {
        const res = await fetch(url);
        if (!res.ok) {
          console.warn(`⚠️ 抓取 ${type} 第 ${page} 页失败: ${res.statusText}`);
          continue;
        }
        const data = await res.json();
        const results = data.results || [];
        console.log(`✅ [${type}] 第 ${page}/${maxPages} 页抓取成功，获取 ${results.length} 部条目`);
        collected.push(...results.map((r: any) => ({ ...r, _media_type: type })));
        await sleep(250); // 速率控制，避免触发 TMDB 429
      } catch (err) {
        console.error(`❌ 抓取异常:`, err);
      }
    }
  }

  const snapshotPath = path.resolve(process.cwd(), 'lib/data/seed-snapshot.json');
  fs.writeFileSync(snapshotPath, JSON.stringify(collected, null, 2), 'utf-8');
  console.log(`🎉 抓取完成！共收集 ${collected.length} 部经典华语影视，已保存至 ${snapshotPath}`);
}

runSeed();
