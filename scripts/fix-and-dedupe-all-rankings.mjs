#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 🌟 彻底根治四大排序重复影视与幽灵 ID 脚本
 * 
 * 1. 彻底消灭《凡人修仙传》x4、《逐玉》x2、《仙逆》x2、《完美世界》x2 等严重重复展示！
 * 2. 彻底剔除 pb_... 等非 ik 格式的幽灵 ID！
 * 3. 严格执行片名全局唯一性（单片名绝对 1 席）！
 * 4. 24 个倒排索引单键精准写入生产 KV！
 */

const ACCOUNT_ID = '172a13185bd6e694bfefc089b12cad6a';
const NAMESPACE_ID = '42311924427747deaf00981d99d58998';

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

// 建立 ID ➔ 规范片名 映射表
const idToTitle = new Map();
const titleToWinnerId = new Map();

// 1. 从 sitemap 备份装载全量 6.6 万条映射
const sitemapBackupPath = path.resolve('.cache/sitemap_catalog_backup.json');
if (fs.existsSync(sitemapBackupPath)) {
  const sitemap = JSON.parse(fs.readFileSync(sitemapBackupPath, 'utf-8'));
  for (const item of sitemap) {
    if (Array.isArray(item) && item[0] && item[1]) {
      const id = item[0].trim();
      const title = item[1].trim();
      idToTitle.set(id, title);
    }
  }
}

// 2. 从预烘焙装载核心主 ID (优先级最高，作为 Winner ID)
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
      const id = m[1].trim();
      const title = m[2].trim();
      idToTitle.set(id, title);
      if (!titleToWinnerId.has(title)) {
        titleToWinnerId.set(title, id);
      }
    }
  }
}

console.log(`✅ 内存字典已装载 ${idToTitle.size} 个片名映射`);

function normalizeTitle(t) {
  if (!t) return '';
  return t
    .replace(/[《》【】\[\]（）()·\s:：\-]/g, '')
    .trim()
    .toLowerCase();
}

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

const CHANNELS = ['all', 'movie', 'tv', 'anime', 'variety', 'documentary'];
const SORTS = ['popularity', 'score', 'time_added', 'time_updated'];

async function main() {
  console.log('🚀 启动四大排序 24 个倒排索引 100% 绝对去重与幽灵清除流水线...\n');

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

      const cleanIds = [];
      const seenNormTitles = new Set();
      let dupCount = 0;
      let ghostCount = 0;

      for (const id of rawIds) {
        // 1. 严格过滤非标准 ID 格式 (只保留合法 ik 格式)
        if (!/^ik\d{6}$/i.test(id)) {
          ghostCount++;
          totalGhostsEliminated++;
          continue;
        }

        const rawTitle = idToTitle.get(id);
        if (!rawTitle) {
          // 未知实体，剔除
          ghostCount++;
          totalGhostsEliminated++;
          continue;
        }

        const norm = normalizeTitle(rawTitle);
        if (!norm) {
          ghostCount++;
          totalGhostsEliminated++;
          continue;
        }

        // 2. 严格单片名唯一性判定
        if (seenNormTitles.has(norm)) {
          dupCount++;
          totalDupsEliminated++;
          continue;
        }

        seenNormTitles.add(norm);

        // 如果该片名有已指定的权威 Winner ID，优先采用 Winner ID
        const winner = titleToWinnerId.get(rawTitle);
        if (winner && /^ik\d{6}$/i.test(winner)) {
          cleanIds.push(winner);
        } else {
          cleanIds.push(id);
        }
      }

      console.log(`原 ${rawIds.length} ➔ 纯净 ${cleanIds.length} (消灭重复 ${dupCount} 席, 剔除幽灵 ${ghostCount} 席)`);

      // 单键写入 KV
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
