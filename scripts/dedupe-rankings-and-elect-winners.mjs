#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 🌟 四大排序倒排索引全域去重与 Winner 优选选举引擎 (0ms 内存极速版)
 * 
 * 彻底消灭四大排序中因历史多 ID 导致的《凡人修仙传》x4、《逐玉》x2、《仙逆》x2 等严重重复展示问题！
 * 严格执行片名全局唯一性原则：同一片名在同一个榜单中绝对只能出现 1 次！
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

// 1. 构建内存片名字典
console.log('🔄 正在极速构建内存全库片名字典...');
const idToTitle = new Map();
const titleToPreferredId = new Map();

// 从 sitemap 备份装载
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

// 从预烘焙装载核心主 ID (优先级最高)
const prebakedPaths = [
  path.resolve('lib/data/latest-titles-prebaked.ts'),
  path.resolve('lib/data/category-prebaked.ts'),
  path.resolve('lib/data/home-prebaked.ts'),
  path.resolve('lib/data/home-prebaked-extra.ts'),
];

for (const p of prebakedPaths) {
  if (fs.existsSync(p)) {
    const content = fs.readFileSync(p, 'utf-8');
    const matches = content.matchAll(/id:\s*['"]([^'"]+)['"].*?title:\s*['"]([^'"]+)['"]/gs);
    for (const m of matches) {
      const id = m[1].trim();
      const title = m[2].trim();
      idToTitle.set(id, title);
      // 预烘焙中的 ID 优先选为该片名的 Winner ID
      if (!titleToPreferredId.has(title)) {
        titleToPreferredId.set(title, id);
      }
    }
  }
}

// 首发先锋
const pioneersPath = path.resolve('.cache/first-release-pioneers.json');
if (fs.existsSync(pioneersPath)) {
  try {
    const pioneers = JSON.parse(fs.readFileSync(pioneersPath, 'utf-8'));
    for (const p of pioneers) {
      if (p.entityId && p.title) {
        idToTitle.set(p.entityId, p.title);
        titleToPreferredId.set(p.title, p.entityId);
      }
    }
  } catch {}
}

console.log(`✅ 内存字典装载完成: 映射了 ${idToTitle.size} 个实体的真实片名`);

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

async function kvPutAll(pairs) {
  for (const pair of pairs) {
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${encodeURIComponent(pair.key)}`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(pair.value),
    });
    const data = await res.json();
    if (!data.success) {
      console.warn(`⚠️ PUT failed for ${pair.key}:`, data.errors);
    } else {
      console.log(`  ✅ [KV 写入成功] ${pair.key} (${pair.value.length} 部)`);
    }
  }
}

const CHANNELS = ['all', 'movie', 'tv', 'anime', 'variety', 'documentary'];
const SORTS = ['popularity', 'score', 'time_added', 'time_updated'];

async function main() {
  console.log('🚀 启动四大排序 24 个倒排索引全局去重与 Winner 优选选举引擎...');

  const updatedPairs = [];
  let totalDeduplicated = 0;

  for (const s of SORTS) {
    for (const c of CHANNELS) {
      const key = `index:${s}:${c}`;
      process.stdout.write(`🔄 正在治理索引: ${key}... `);
      const rawIds = await kvGet(key);
      if (!Array.isArray(rawIds) || rawIds.length === 0) {
        console.log('跳过 (为空)');
        continue;
      }

      const deduplicatedIds = [];
      const seenNormalizedTitles = new Set();
      let dupCount = 0;

      for (const id of rawIds) {
        const rawTitle = idToTitle.get(id);
        if (!rawTitle) {
          // 若在片名映射中找不到，可能是直接保留的特殊 ID
          deduplicatedIds.push(id);
          continue;
        }

        const norm = normalizeTitle(rawTitle);
        if (!norm) {
          deduplicatedIds.push(id);
          continue;
        }

        if (seenNormalizedTitles.has(norm)) {
          // 重复条目！坚决剔除！
          dupCount++;
          totalDeduplicated++;
          continue;
        }

        seenNormalizedTitles.add(norm);
        // 如果该片名有明确的官方优选 ID，使用优选 ID
        const preferred = titleToPreferredId.get(rawTitle);
        if (preferred && preferred !== id && !seenNormalizedTitles.has(normalizeTitle(preferred))) {
          deduplicatedIds.push(preferred);
        } else {
          deduplicatedIds.push(id);
        }
      }

      console.log(`去重完成 (原 ${rawIds.length} -> 净化后 ${deduplicatedIds.length}, 剔除重复 ${dupCount} 席)`);
      updatedPairs.push({
        key,
        value: deduplicatedIds,
      });
    }
  }

  console.log(`\n======================================================`);
  console.log(`📦 生成清洗后的去重倒排索引: ${updatedPairs.length} 条`);
  console.log(`🧹 全局累计剔除重复影视条目: ${totalDeduplicated} 处`);
  console.log(`⚡ 正在向 Cloudflare 生产 KV 批量写回...`);
  await kvPutAll(updatedPairs);
  console.log(`🎉 24 个四大排序倒排索引已全部彻底净化完成！`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('❌ 去重脚本运行失败:', err);
  process.exit(1);
});
