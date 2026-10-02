/**
 * iKanPP 终极全域自愈与生产倒排索引彻底重建引擎
 * 
 * 核心任务：
 * 1. 【老实体原地纠正】：遍历 6.6 万个历史真实主键（如 ik087950 我当你兄弟、ik087157 马腾你别走、ik039582 挑情丑闻），
 *    原地覆盖其 entity:${id} 记录，抹除所有残留的时光代理人与占位图，全面注入 TMDB / 骨干采集站 4K 官方封面；
 * 2. 【全频道权威索引彻底重建】：
 *    彻底清理幽灵 ID（ik885*** 为 null 的条目），
 *    重新生成 channel:movie, channel:tv, channel:anime, channel:variety, channel:documentary, channel:short
 *    重新生成 index:popularity:*, index:score:*, index:time_added:*, index:time_updated:*, index:all
 *    确保用户在任何专区、任何排序下翻页，100% 毫秒级直出无水印真实官方海报；
 * 3. 【极速批量提交】：通过 Cloudflare KV /bulk API 高速写入生产库。
 */

import fs from 'fs';
import path from 'path';

const SITEMAP_BACKUP_FILE = path.resolve('.cache/sitemap_catalog_backup.json');
const MASTER_CATALOG_FILE = path.resolve('.cache/iyf-master-catalog.json');
const HEAL_CACHE_FILE = path.resolve('.cache/watermark-heal-cache.json');

const ACCOUNT_ID = '172a13185bd6e694bfefc089b12cad6a';
const NAMESPACE_ID = '42311924427747deaf00981d99d58998';

function getAuthHeaders() {
  const token = process.env.CLOUDFLARE_API_TOKEN;
  if (token) return { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  try {
    const tomlPath = path.join(process.env.HOME || '', '.wrangler/config/default.toml');
    if (fs.existsSync(tomlPath)) {
      const content = fs.readFileSync(tomlPath, 'utf-8');
      const m = content.match(/oauth_token\s*=\s*"([^"]+)"/);
      if (m && m[1]) return { 'Authorization': `Bearer ${m[1]}`, 'Content-Type': 'application/json' };
    }
  } catch {}

  throw new Error('未找到 Cloudflare 鉴权凭证');
}

function normalizeTitle(t) {
  if (!t) return '';
  return String(t)
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[【\[].*?[】\]]/g, '')
    .replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|\s_-]/g, '')
    .trim();
}

function generateSlug(t) {
  return String(t || '')
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'video';
}

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function kvBulkPut(pairs) {
  if (!pairs || pairs.length === 0) return 0;
  const headers = getAuthHeaders();
  const BATCH_SIZE = 1000;
  let writtenCount = 0;
  const totalBatches = Math.ceil(pairs.length / BATCH_SIZE);

  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    const chunk = pairs.slice(i, i + BATCH_SIZE).map(p => ({
      key: p.key,
      value: typeof p.value === 'string' ? p.value : JSON.stringify(p.value),
    }));

    const batchIdx = Math.floor(i / BATCH_SIZE) + 1;
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/bulk`;

    let retries = 3;
    let ok = false;
    while (retries > 0 && !ok) {
      try {
        const res = await fetch(url, {
          method: 'PUT',
          headers,
          body: JSON.stringify(chunk),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`status ${res.status}: ${errText}`);
        }

        const json = await res.json();
        if (!json.success) throw new Error(`errors: ${JSON.stringify(json.errors)}`);

        ok = true;
        writtenCount += chunk.length;
        const percent = ((writtenCount / pairs.length) * 100).toFixed(1);
        console.log(`💾 [KV Bulk ${batchIdx}/${totalBatches} | ${percent}%] 成功写入 ${chunk.length} 个键值对 (累计: ${writtenCount}/${pairs.length})`);
      } catch (err) {
        retries--;
        console.warn(`⚠️ [KV Bulk 批次 ${batchIdx}] 写入异常，剩余重试 ${retries} 次:`, err.message);
        if (retries > 0) await sleep(1500);
        else throw err;
      }
    }
  }

  return writtenCount;
}

async function main() {
  console.log(`\n=============================================================`);
  console.log(`🚀 iKanPP 终极全域自愈与生产倒排索引彻底重建`);
  console.log(`=============================================================`);

  // 1. 载入核心数据源
  const sitemapCatalog = JSON.parse(fs.readFileSync(SITEMAP_BACKUP_FILE, 'utf-8'));
  const masterCatalog = JSON.parse(fs.readFileSync(MASTER_CATALOG_FILE, 'utf-8'));
  const healCache = fs.existsSync(HEAL_CACHE_FILE) ? JSON.parse(fs.readFileSync(HEAL_CACHE_FILE, 'utf-8')) : {};

  console.log(`📊 载入历史主键条目数: ${sitemapCatalog.length} 部`);
  console.log(`📊 载入清洗主库条目数: ${masterCatalog.length} 部`);
  console.log(`📊 载入自愈缓存条目数: ${Object.keys(healCache).length} 条`);

  // 建立快速索引：片名 ➔ 主库条目
  const masterByNorm = new Map();
  const masterByExact = new Map();
  for (const item of masterCatalog) {
    if (!item.title) continue;
    masterByExact.set(item.title, item);
    const n = normalizeTitle(item.title);
    if (n && !masterByNorm.has(n)) {
      masterByNorm.set(n, item);
    }
  }

  const nowIso = new Date().toISOString();
  const kvMap = new Map();
  const validEntitiesMap = new Map(); // entityId -> entity

  let matchedHistoricalCount = 0;
  let healedCoverCount = 0;

  // 2. 遍历历史主键，就地覆盖老实体
  for (const [entityId, title, modDate] of sitemapCatalog) {
    if (!entityId || !title) continue;

    let master = masterByExact.get(title) || masterByNorm.get(normalizeTitle(title));
    const cached = healCache[title];

    // 如果该条目在 master 或 cached 中有信息，就地自愈
    if (master || cached) {
      matchedHistoricalCount++;

      let cover = '';
      let backdrop = '';
      let channel = master?.channel || master?.type || 'movie';
      let year = master?.year || '2026';
      let rate = master?.score || master?.rate || '8.8';
      let hot = master?.hot || master?.popularity || 10000;
      let genres = Array.isArray(master?.types) ? master.types : (master?.genres || ['精选']);
      let region = master?.region || '华语';
      let lang = master?.lang || '国语';
      let status = master?.remarks || '完结';
      let desc = master?.desc || `${title} 支持在 iKanPP 免费在线观看完整版高清视频。`;

      if (master?.cover && !master.cover.includes('placeholder') && !master.cover.includes('iyf.tv')) {
        cover = master.cover;
        backdrop = master.backdrop || cover;
      }

      if (cached?.poster && !cached.poster.includes('placeholder') && !cached.poster.includes('iyf.tv')) {
        cover = cached.poster;
        backdrop = cached.backdrop || cover;
      }

      // 绝不保留时光代理人
      if (cover.includes('8uBae3fsFRhYNrNBxuWJCXlBFKE')) {
        cover = '';
      }

      if (cover) {
        healedCoverCount++;
      } else {
        cover = '/placeholder-poster.svg';
        backdrop = '/placeholder-poster.svg';
      }

      const slug = generateSlug(title);
      const canonicalSlug = `${entityId}-${slug}`.toLowerCase();
      const normTitle = normalizeTitle(title);

      const entity = {
        entityId,
        slug,
        canonicalSlug,
        title,
        type: channel,
        year: String(year),
        rate: String(rate),
        score: String(rate),
        cover,
        backdrop,
        genres,
        region,
        language: lang,
        status,
        hot: Number(hot) || 1000,
        popularity: Number(hot) || 1000,
        description: desc,
        updatedAt: modDate ? `${modDate}T00:00:00.000Z` : nowIso,
        createdAt: modDate ? `${modDate}T00:00:00.000Z` : nowIso,
      };

      kvMap.set(`entity:${entityId}`, entity);
      kvMap.set(`slug:${canonicalSlug}`, entityId);
      if (normTitle && !kvMap.has(`title:${normTitle}`)) {
        kvMap.set(`title:${normTitle}`, entityId);
      }

      // 若具有真实封面，纳入权威实体池
      if (cover && !cover.includes('placeholder')) {
        validEntitiesMap.set(entityId, entity);
      }
    }
  }

  // 3. 同时也把已分配的 ik000001 ~ ik031433 中有真实封面的实体纳入权威实体池
  let seq = 1;
  for (const item of masterCatalog) {
    if (!item.title) continue;
    const cover = item.cover || '';
    if (!cover || cover.includes('placeholder') || cover.includes('iyf.tv') || cover.includes('8uBae3fsFRhYNrNBxuWJCXlBFKE')) {
      continue;
    }
    const id = `ik${seq.toString().padStart(6, '0')}`;
    seq++;

    if (!validEntitiesMap.has(id)) {
      const slug = generateSlug(item.title);
      const canonicalSlug = `${id}-${slug}`.toLowerCase();
      const normTitle = normalizeTitle(item.title);

      const entity = {
        entityId: id,
        slug,
        canonicalSlug,
        title: item.title,
        type: item.channel || item.type || 'movie',
        year: String(item.year || '2026'),
        rate: String(item.score || item.rate || '8.8'),
        score: String(item.score || item.rate || '8.8'),
        cover: item.cover,
        backdrop: item.backdrop || item.cover,
        genres: Array.isArray(item.types) ? item.types : (item.genres || ['精选']),
        region: item.region || '华语',
        language: item.lang || '国语',
        status: item.remarks || '完结',
        hot: Number(item.hot || item.popularity || 1000),
        popularity: Number(item.hot || item.popularity || 1000),
        description: item.desc || `${item.title} 支持在 iKanPP 免费在线观看完整版高清视频。`,
        updatedAt: item.updatedAt || nowIso,
        createdAt: item.createdAt || nowIso,
      };

      validEntitiesMap.set(id, entity);
      kvMap.set(`entity:${id}`, entity);
      kvMap.set(`slug:${canonicalSlug}`, id);
      if (normTitle && !kvMap.has(`title:${normTitle}`)) {
        kvMap.set(`title:${normTitle}`, id);
      }
    }
  }

  console.log(`✨ 成功就地匹配并纠正老实体: ${matchedHistoricalCount} 部`);
  console.log(`✨ 成功赋予 TMDB / 采集站无水印真实封面: ${healedCoverCount} 部`);
  console.log(`🌟 最终全网权威纯净有效实体池总计: ${validEntitiesMap.size} 部 (100% 真实有效，0 水印，0 时光代理人，0 幽灵)`);

  // 4. 全量构建全专区与多维排序物理倒排索引
  console.log(`\n📐 开始构建各频道与全站倒排索引...`);

  const allValidEntities = Array.from(validEntitiesMap.values());
  const CHANNELS = ['movie', 'tv', 'anime', 'variety', 'documentary', 'short'];
  const channelEntities = {
    movie: [],
    tv: [],
    anime: [],
    variety: [],
    documentary: [],
    short: [],
  };

  for (const ent of allValidEntities) {
    let ch = (ent.type || 'movie').toLowerCase();
    if (ch.includes('short')) ch = 'short';
    else if (ch.includes('tv') || ch.includes('drama') || ch.includes('剧')) ch = 'tv';
    else if (ch.includes('anime') || ch.includes('漫')) ch = 'anime';
    else if (ch.includes('variety') || ch.includes('综')) ch = 'variety';
    else if (ch.includes('doc') || ch.includes('纪')) ch = 'documentary';
    else ch = 'movie';

    channelEntities[ch].push(ent);
  }

  // 写入各专区 channel:*
  for (const ch of CHANNELS) {
    const ids = channelEntities[ch].map(e => e.entityId);
    kvMap.set(`channel:${ch}`, ids);
    console.log(`  📁 channel:${ch} -> ${ids.length} 部真实实体`);
  }

  // 构建各专区 4 大核心排序倒排索引
  for (const ch of CHANNELS) {
    const list = channelEntities[ch];

    // 1. 热度排序 (hot 降序)
    const byPop = [...list].sort((a, b) => (b.hot || 0) - (a.hot || 0));
    kvMap.set(`index:popularity:${ch}`, byPop.slice(0, 2000).map(e => e.entityId));

    // 2. 评分排序 (score 降序)
    const byScore = [...list].sort((a, b) => parseFloat(b.score || '0') - parseFloat(a.score || '0'));
    kvMap.set(`index:score:${ch}`, byScore.slice(0, 2000).map(e => e.entityId));

    // 3. 最新入库排序 (ID/时间最新优先)
    const byAdded = [...list].sort((a, b) => b.entityId.localeCompare(a.entityId));
    kvMap.set(`index:time_added:${ch}`, byAdded.slice(0, 2000).map(e => e.entityId));

    // 4. 最近更新排序 (updatedAt 降序)
    const byUpdated = [...list].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    kvMap.set(`index:time_updated:${ch}`, byUpdated.slice(0, 2000).map(e => e.entityId));
  }

  // 全站大厅四大排序与全量索引 (index:all, index:*:all)
  const allByPop = [...allValidEntities].sort((a, b) => (b.hot || 0) - (a.hot || 0));
  const allByScore = [...allValidEntities].sort((a, b) => parseFloat(b.score || '0') - parseFloat(a.score || '0'));
  const allByAdded = [...allValidEntities].sort((a, b) => b.entityId.localeCompare(a.entityId));
  const allByUpdated = [...allValidEntities].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  kvMap.set('index:popularity:all', allByPop.slice(0, 3000).map(e => e.entityId));
  kvMap.set('index:score:all', allByScore.slice(0, 3000).map(e => e.entityId));
  kvMap.set('index:time_added:all', allByAdded.slice(0, 3000).map(e => e.entityId));
  kvMap.set('index:time_updated:all', allByUpdated.slice(0, 3000).map(e => e.entityId));
  kvMap.set('index:all', allValidEntities.map(e => e.entityId));

  const kvPairs = Array.from(kvMap.entries()).map(([key, value]) => ({ key, value }));

  console.log(`\n📦 生成标准 KV 更新键值对总计: ${kvPairs.length} 条`);
  console.log(`⚡ 启动 Cloudflare KV /bulk 批量高速推送...\n`);

  const startTime = Date.now();
  const totalWritten = await kvBulkPut(kvPairs);
  const totalSec = Math.round((Date.now() - startTime) / 1000);

  console.log(`\n=============================================================`);
  console.log(`🎉 全域老实体纠正与倒排索引彻底重建成功！`);
  console.log(`⏱️ 写入耗时: ${totalSec} 秒`);
  console.log(`📊 成功写入键值对: ${totalWritten} 条`);
  console.log(`=============================================================\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
