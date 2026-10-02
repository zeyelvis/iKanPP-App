/**
 * iKanPP 历史实体主键就地自愈与全频道倒排索引彻底重建引擎
 * 
 * 核心任务：
 * 1. 【真实历史主键对齐】：读取 sitemap_catalog_backup.json 中的真实历史 ID（如 ik087950、ik087157、ik039582）
 *    将其与清洗后的 4K 无水印真实海报（TMDB / 极速 / 光速）进行强绑定，原地覆盖更新 entity:${id}，彻底消除《时光代理人》与占位图；
 * 2. 【彻底清洗倒排索引】：剔除所有不存在实体的幽灵 ID（如 ik885*** 为 null 的条目），
 *    重新构建 channel:*、index:popularity:*、index:score:*、index:time_added:*、index:all 等所有索引；
 * 3. 【原子批量推流】：通过 Cloudflare KV /bulk API 将数万条实体与索引高速同步入库。
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
  console.log(`🚀 iKanPP 历史实体主键原地自愈与全频道倒排索引彻底重建`);
  console.log(`=============================================================`);

  // 1. 载入核心数据
  const sitemapCatalog = JSON.parse(fs.readFileSync(SITEMAP_BACKUP_FILE, 'utf-8'));
  const masterCatalog = JSON.parse(fs.readFileSync(MASTER_CATALOG_FILE, 'utf-8'));
  const healCache = fs.existsSync(HEAL_CACHE_FILE) ? JSON.parse(fs.readFileSync(HEAL_CACHE_FILE, 'utf-8')) : {};

  console.log(`📊 载入历史主键映射总数: ${sitemapCatalog.length} 部`);
  console.log(`📊 载入已清洗主库条目数: ${masterCatalog.length} 部`);
  console.log(`📊 载入清洗缓存条目数: ${Object.keys(healCache).length} 条`);

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
  const kvPairs = [];
  const validEntities = [];

  let matchedHistoricalCount = 0;
  let healedWithCoverCount = 0;

  // 2. 遍历 sitemap 中的每一个历史 ID，将其与真实封面强绑定
  for (const [entityId, title, modDate] of sitemapCatalog) {
    if (!entityId || !title) continue;

    // 匹配主库条目
    let master = masterByExact.get(title) || masterByNorm.get(normalizeTitle(title));
    const cached = healCache[title];

    let cover = '';
    let backdrop = '';
    let channel = 'movie';
    let year = '2026';
    let rate = '8.8';
    let hot = 10000;
    let genres = ['精选'];
    let region = '华语';
    let lang = '国语';
    let status = '完结';
    let desc = `${title} 支持在 iKanPP 免费在线观看完整版高清视频。`;

    if (master) {
      matchedHistoricalCount++;
      channel = master.channel || master.type || 'movie';
      year = master.year || '2026';
      rate = master.score || master.rate || '8.8';
      hot = master.hot || master.popularity || 10000;
      genres = Array.isArray(master.types) ? master.types : (master.genres || ['精选']);
      region = master.region || '华语';
      lang = master.lang || '国语';
      status = master.remarks || '完结';
      desc = master.desc || desc;
      cover = master.cover || '';
      backdrop = master.backdrop || cover;
    }

    // 优先采用缓存的高清封面
    if (cached && cached.poster && !cached.poster.includes('iyf.tv') && !cached.poster.includes('placeholder')) {
      cover = cached.poster;
      backdrop = cached.backdrop || cover;
    }

    // 检查封面合法性，绝不写入时光代理人
    if (cover.includes('8uBae3fsFRhYNrNBxuWJCXlBFKE')) {
      cover = '';
    }

    if (cover && !cover.includes('placeholder') && !cover.includes('iyf.tv')) {
      healedWithCoverCount++;
    } else {
      // 确实没有封面的，使用安全占位图
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

    validEntities.push(entity);

    // 写入主实体键 (使用真实历史主键 ID!)
    kvPairs.push({ key: `entity:${entityId}`, value: entity });
    kvPairs.push({ key: `slug:${canonicalSlug}`, value: entityId });
    if (normTitle) {
      kvPairs.push({ key: `title:${normTitle}`, value: entityId });
    }
  }

  console.log(`✨ 匹配历史实体: ${matchedHistoricalCount} 部`);
  console.log(`✨ 赋予无水印真实 4K 官方封面: ${healedWithCoverCount} 部`);

  // 3. 构建全专区与多维排序倒排索引（彻底剔除幽灵 ID）
  console.log(`\n📐 开始全量构建各频道与多维排序物理倒排索引...`);

  const CHANNELS = ['movie', 'tv', 'anime', 'variety', 'documentary', 'short'];
  const channelEntities = {
    movie: [],
    tv: [],
    anime: [],
    variety: [],
    documentary: [],
    short: [],
  };

  for (const ent of validEntities) {
    let ch = (ent.type || 'movie').toLowerCase();
    if (ch.includes('short')) ch = 'short';
    else if (ch.includes('tv') || ch.includes('drama') || ch.includes('剧')) ch = 'tv';
    else if (ch.includes('anime') || ch.includes('漫')) ch = 'anime';
    else if (ch.includes('variety') || ch.includes('综')) ch = 'variety';
    else if (ch.includes('doc') || ch.includes('纪')) ch = 'documentary';
    else ch = 'movie';

    if (channelEntities[ch]) {
      channelEntities[ch].push(ent);
    } else {
      channelEntities.movie.push(ent);
    }
  }

  // 写入专区频道全量 ID 集合 (channel:*)
  for (const ch of CHANNELS) {
    const ids = channelEntities[ch].map(e => e.entityId);
    kvPairs.push({ key: `channel:${ch}`, value: JSON.stringify(ids) });
    console.log(`  📁 channel:${ch} -> ${ids.length} 部真实实体`);
  }

  // 构建各专区 4 大核心排序倒排索引 (popularity, score, time_added, time_updated)
  for (const ch of CHANNELS) {
    const list = channelEntities[ch];

    // 1. 人气/热度排序
    const byPop = [...list].sort((a, b) => (b.hot || 0) - (a.hot || 0));
    kvPairs.push({
      key: `index:popularity:${ch}`,
      value: JSON.stringify(byPop.slice(0, 1500).map(e => e.entityId)),
    });

    // 2. 评分排序
    const byScore = [...list].sort((a, b) => parseFloat(b.score || '0') - parseFloat(a.score || '0'));
    kvPairs.push({
      key: `index:score:${ch}`,
      value: JSON.stringify(byScore.slice(0, 1500).map(e => e.entityId)),
    });

    // 3. 最新入库排序 (ID/时间最新优先)
    const byAdded = [...list].sort((a, b) => b.entityId.localeCompare(a.entityId));
    kvPairs.push({
      key: `index:time_added:${ch}`,
      value: JSON.stringify(byAdded.slice(0, 1500).map(e => e.entityId)),
    });

    // 4. 最近更新排序
    const byUpdated = [...list].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));
    kvPairs.push({
      key: `index:time_updated:${ch}`,
      value: JSON.stringify(byUpdated.slice(0, 1500).map(e => e.entityId)),
    });
  }

  // 全站大厅四大排序与全量索引 (index:all, index:*:all)
  const allByPop = [...validEntities].sort((a, b) => (b.hot || 0) - (a.hot || 0));
  const allByScore = [...validEntities].sort((a, b) => parseFloat(b.score || '0') - parseFloat(a.score || '0'));
  const allByAdded = [...validEntities].sort((a, b) => b.entityId.localeCompare(a.entityId));
  const allByUpdated = [...validEntities].sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''));

  kvPairs.push({ key: 'index:popularity:all', value: JSON.stringify(allByPop.slice(0, 2000).map(e => e.entityId)) });
  kvPairs.push({ key: 'index:score:all', value: JSON.stringify(allByScore.slice(0, 2000).map(e => e.entityId)) });
  kvPairs.push({ key: 'index:time_added:all', value: JSON.stringify(allByAdded.slice(0, 2000).map(e => e.entityId)) });
  kvPairs.push({ key: 'index:time_updated:all', value: JSON.stringify(allByUpdated.slice(0, 2000).map(e => e.entityId)) });
  kvPairs.push({ key: 'index:all', value: JSON.stringify(validEntities.map(e => e.entityId)) });

  console.log(`\n📦 生成标准 KV 更新键值对总计: ${kvPairs.length} 条`);
  console.log(`⚡ 启动 Cloudflare KV /bulk 批量高速推送...\n`);

  const startTime = Date.now();
  const totalWritten = await kvBulkPut(kvPairs);
  const totalSec = Math.round((Date.now() - startTime) / 1000);

  console.log(`\n=============================================================`);
  console.log(`🎉 历史实体与全频道倒排索引彻底同步入库成功！`);
  console.log(`⏱️ 写入耗时: ${totalSec} 秒`);
  console.log(`📊 成功写入键值对: ${totalWritten} 条`);
  console.log(`=============================================================\n`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
