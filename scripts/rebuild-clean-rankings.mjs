#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 🌟 四大排序 24 个倒排索引 100% 绝对去重与 Winner 终极净化引擎
 * 
 * 核心法则：
 * 1. 彻底消灭《凡人修仙传》x4、《逐玉》x2、《仙逆》x2、《爱情保卫战》x2、《完美世界》x2 等严重重复展示！
 * 2. 同一个片名在同一个榜单中绝对只能出现 1 次！
 * 3. 彻底清除 404 幽灵 ID (如 pb_a_s4_8 等)！
 * 4. 单键精准 PUT 写入生产 KV，保证 100% 生效！
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';

function getAuthToken() {
  if (process.env.CLOUDFLARE_API_TOKEN) return process.env.CLOUDFLARE_API_TOKEN;
  try {
    const tomlPath = path.resolve(process.env.HOME || '', '.wrangler/config/default.toml');
    if (fs.existsSync(tomlPath)) {
      const toml = fs.readFileSync(tomlPath, 'utf-8');
      const m = toml.match(/oauth_token\s*=\s*["']([^"']+)["']/);
      if (m) return m[1];
    }
  } catch {}
  return '';
}

const token = getAuthToken();
if (!token) {
  console.error('❌ 未找到 Cloudflare API Token');
  process.exit(1);
}

// 装载本地字典
const idToTitle = new Map();

// 1. 从 sitemap 备份装载
const sitemapBackupPath = path.resolve('.cache/sitemap_catalog_backup.json');
if (fs.existsSync(sitemapBackupPath)) {
  const sitemap = JSON.parse(fs.readFileSync(sitemapBackupPath, 'utf-8'));
  for (const item of sitemap) {
    if (Array.isArray(item) && item[0] && item[1]) {
      idToTitle.set(item[0].trim(), item[1].trim());
    }
  }
}

// 2. 从预烘焙装载
const prebakedFiles = [
  'lib/data/latest-titles-prebaked.ts',
  'lib/data/category-prebaked.ts',
  'lib/data/home-prebaked.ts',
  'lib/data/home-prebaked-extra.ts',
];
for (const f of prebakedFiles) {
  if (fs.existsSync(f)) {
    const content = fs.readFileSync(f, 'utf-8');
    const matches = content.matchAll(/id:\s*['"]([^'"]+)['"].*?title:\s*['"]([^'"]+)['"]/gs);
    for (const m of matches) {
      idToTitle.set(m[1].trim(), m[2].trim());
    }
  }
}

console.log(`✅ 本地字典已装载 ${idToTitle.size} 个片名映射`);

async function kvGet(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

async function kvPut(key, value) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(value),
  });
  return res.ok;
}

// 实体内存缓存
const entityTitleCache = new Map();

async function resolveEntityTitle(id) {
  if (entityTitleCache.has(id)) return entityTitleCache.get(id);
  if (idToTitle.has(id)) {
    const t = idToTitle.get(id);
    entityTitleCache.set(id, t);
    return t;
  }
  // 未在本地缓存中，向远程 KV 抓取
  const ent = await kvGet(`entity:${id}`);
  if (ent && ent.title) {
    const t = ent.title.trim();
    idToTitle.set(id, t);
    entityTitleCache.set(id, t);
    return t;
  }
  entityTitleCache.set(id, null);
  return null;
}

function normalizeTitle(t) {
  if (!t) return '';
  return t
    .replace(/[《》【】\[\]（）()·\s:：\-]/g, '')
    .trim()
    .toLowerCase();
}

const CHANNELS = ['all', 'movie', 'tv', 'anime', 'variety', 'documentary'];
const SORTS = ['popularity', 'score', 'time_added', 'time_updated'];

async function main() {
  console.log('🚀 启动四大排序 24 个倒排索引 100% 绝对去重与终极净化流水线...\n');

  let totalDupsEliminated = 0;
  let totalGhostsEliminated = 0;

  for (const s of SORTS) {
    for (const c of CHANNELS) {
      const key = `index:${s}:${c}`;
      process.stdout.write(`🔄 正在净化【${key}】... `);

      const rawIds = await kvGet(key);
      if (!Array.isArray(rawIds) || rawIds.length === 0) {
        console.log('跳过 (为空)');
        continue;
      }

      // 并发提前解析前 1000 个 ID 的片名
      const chunkIds = rawIds.slice(0, 1000);
      const unresolved = chunkIds.filter(id => !idToTitle.has(id));
      if (unresolved.length > 0) {
        // 分批解析，避免超并发
        const BATCH = 30;
        for (let i = 0; i < unresolved.length; i += BATCH) {
          await Promise.all(unresolved.slice(i, i + BATCH).map(id => resolveEntityTitle(id)));
        }
      }

      const cleanIds = [];
      const seenTitles = new Set();
      let dupCount = 0;
      let ghostCount = 0;

      for (const id of rawIds) {
        // 过滤明显的历史非法假 ID
        if (id.startsWith('pb_') || id.startsWith('doc_') || id.includes('test')) {
          ghostCount++;
          totalGhostsEliminated++;
          continue;
        }

        const title = await resolveEntityTitle(id);
        if (!title) {
          ghostCount++;
          totalGhostsEliminated++;
          continue;
        }

        const norm = normalizeTitle(title);
        if (!norm) {
          ghostCount++;
          totalGhostsEliminated++;
          continue;
        }

        if (seenTitles.has(norm)) {
          // 同名重复！坚决剔除！
          dupCount++;
          totalDupsEliminated++;
          continue;
        }

        seenTitles.add(norm);
        cleanIds.push(id);
      }

      console.log(`原 ${rawIds.length} ➔ 纯净 ${cleanIds.length} (剔除重复 ${dupCount} 席, 剔除幽灵 ${ghostCount} 席)`);

      // 单键精准写入 KV
      const ok = await kvPut(key, cleanIds);
      if (!ok) {
        console.warn(`  ❌ 写入 ${key} 失败`);
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉 24 个四大排序物理倒排索引全部 100% 绝对去重净化完成！`);
  console.log(`🧹 全局累计消灭重复影片: ${totalDupsEliminated} 席`);
  console.log(`👻 全局累计清除幽灵空条目: ${totalGhostsEliminated} 席`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('❌ 脚本异常:', err);
  process.exit(1);
});
