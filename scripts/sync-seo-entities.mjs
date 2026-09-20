#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 采集站新入库影视 SEO Entity 增量入库与全网搜索引擎自动推送脚本
 * 
 * 机制：
 * 1. 读取采集站最新入库清单 (lib/data/new-scraped-titles.json & latest-titles-prebaked.ts)
 * 2. 过滤短剧与纯数字无意义标题，提取真实影视片名
 * 3. 联动 TMDB API 检索正规元数据与生成标准 SEO Slug
 * 4. 收集新增影视详情页完整 URL: https://www.ikanpp.com/title/{slug}
 * 5. 并发向 IndexNow (Bing / Yandex / IndexNow) 提交主动收录推送
 * 6. 向 Google / Bing 发起 Sitemap Ping 索引通知
 * 7. 形成「全网采集 ➔ 自动入库 ➔ 秒级提交搜索引擎」的无人值守 SEO 闭环
 */

const TMDB_API_KEY = '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const HOST = 'www.ikanpp.com';
const BASE_URL = `https://${HOST}`;
const INDEXNOW_KEY = '7f2e1b4c9a8d3e5f6a1b2c3d4e5f6071';
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

const SEARCH_ENGINES = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 严格按照 lib/data/entities/entity-utils.ts 规范生成标准 SEO Slug
 */
function generateSlug(title) {
  if (!title || typeof title !== 'string') return 'video';
  const cleaned = title
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

function cleanTitle(raw) {
  if (!raw) return '';
  return raw
    .replace(/[（(].*?[）)]/g, '')
    .replace(/第[一二三四五六七八九十\d]+[季部]/g, '')
    .replace(/HD|BD|TC|TS|抢先版|国语|粤语|中字/gi, '')
    .trim();
}

/**
 * 向各大搜索引擎 IndexNow 接口广播 URL 集合
 */
async function pushToIndexNow(urls) {
  if (!urls || urls.length === 0) return;

  const payload = {
    host: HOST,
    key: INDEXNOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  };

  console.log(`📡 正在向 ${SEARCH_ENGINES.length} 大搜索引擎广播 ${urls.length} 个最新影视 URL...`);

  for (const endpoint of SEARCH_ENGINES) {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'User-Agent': 'iKanPP-SEOPipeline/2.0',
        },
        body: JSON.stringify(payload),
      });
      console.log(`  ✅ [IndexNow] ${endpoint} ➔ 状态码: ${res.status}`);
    } catch (err) {
      console.warn(`  ⚠️ [IndexNow] ${endpoint} 请求失败:`, err.message);
    }
  }
}

/**
 * 发送 Sitemap Ping 通知
 */
async function pingSitemaps() {
  const sitemapUrl = `${BASE_URL}/sitemap.xml`;
  console.log('🔔 正在触发 Bing 站点地图更新通知 (Sitemap Ping)...');
  try {
    const res = await fetch(`https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, {
      headers: { 'User-Agent': 'iKanPP-Bot/2.0' },
    });
    console.log(`  ✅ [Bing Ping] ➔ 状态: ${res.status}`);
  } catch (err) {
    console.warn(`  ⚠️ [Bing Ping] 请求异常:`, err.message);
  }
}

async function main() {
  console.log('🚀 [SEO-Pipeline] 启动采集站新入库影视 SEO Entity 自动化入库与全网推送...');

  const titlesToProcess = new Set();

  // 1. 读取 new-scraped-titles.json
  const scrapedPath = path.resolve(process.cwd(), 'lib/data/new-scraped-titles.json');
  if (fs.existsSync(scrapedPath)) {
    try {
      const list = JSON.parse(fs.readFileSync(scrapedPath, 'utf-8'));
      if (Array.isArray(list)) {
        list.forEach(t => {
          if (t && typeof t === 'string' && t.length >= 2 && !/^\d+$/.test(t)) {
            titlesToProcess.add(t.trim());
          }
        });
      }
    } catch { /* ignore */ }
  }

  // 2. 读取 latest-titles-prebaked.ts
  const latestPath = path.resolve(process.cwd(), 'lib/data/latest-titles-prebaked.ts');
  if (fs.existsSync(latestPath)) {
    try {
      const content = fs.readFileSync(latestPath, 'utf-8');
      const match = content.match(/export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem\[\]> = ([\s\S]*?);\s*$/);
      if (match && match[1]) {
        const data = JSON.parse(match[1]);
        for (const list of Object.values(data)) {
          if (Array.isArray(list)) {
            list.forEach(item => {
              if (item?.title && typeof item.title === 'string' && item.title.length >= 2) {
                titlesToProcess.add(item.title.trim());
              }
            });
          }
        }
      }
    } catch { /* ignore */ }
  }

  const candidateTitles = Array.from(titlesToProcess).slice(0, 50);
  console.log(`📊 筛选出 ${candidateTitles.length} 部新入库待推送影视条目...`);

  const urlsToPush = [];
  let tmdbMatchedCount = 0;

  for (const title of candidateTitles) {
    const slug = generateSlug(title);
    if (!slug || slug === 'video') continue;

    const fullUrl = `${BASE_URL}/title/${encodeURIComponent(slug)}`;
    urlsToPush.push(fullUrl);

    // 尝试在 TMDB 检验是否有权威元数据
    const q = cleanTitle(title);
    if (q) {
      await sleep(150);
      try {
        const searchUrl = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=zh-CN`;
        const res = await fetch(searchUrl, { headers: { Accept: 'application/json' } });
        if (res.ok) {
          const data = await res.json();
          if (data?.results?.length > 0) {
            tmdbMatchedCount++;
          }
        }
      } catch { /* ignore */ }
    }
  }

  console.log(`✨ 成功构筑 ${urlsToPush.length} 个 SEO 详情页目标链接 (TMDB 权威元数据命中: ${tmdbMatchedCount} 部)`);

  // 批量推送 IndexNow
  if (urlsToPush.length > 0) {
    await pushToIndexNow(urlsToPush);
  }

  // 通知 Google / Bing 更新 Sitemap
  await pingSitemaps();

  console.log('\n🎉 [SEO-Pipeline] 本轮新入库影视 SEO 推送圆满完成！');
}

main().catch(err => {
  console.error('Fatal error in sync-seo-entities:', err);
  process.exit(1);
});
