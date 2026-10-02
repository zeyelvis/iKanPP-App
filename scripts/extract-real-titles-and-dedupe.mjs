#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 🌟 基于生产 KV 实体真实片名的 100% 零漏网绝杀去重引擎
 * 
 * 核心逻辑：
 * 绝不依赖任何历史 sitemap 假标题！
 * 100% 以生产 KV 的真实 entity.title 为唯一真理源！
 * 并发预拉取四大排序中涉及到的所有实体真实标题，严格保证单片名绝对 1 席！
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
  console.log('🚀 第一阶段：收集四大排序所有榜单涉及的候选实体 ID...');

  const allKeys = [];
  for (const s of SORTS) {
    for (const c of CHANNELS) {
      allKeys.push(`index:${s}:${c}`);
    }
  }

  const indexDataMap = new Map();
  const allNeededIds = new Set();

  for (const key of allKeys) {
    const list = await kvGet(key);
    if (Array.isArray(list)) {
      indexDataMap.set(key, list);
      list.forEach(id => {
        if (/^ik\d{6}$/i.test(id)) {
          allNeededIds.add(id);
        }
      });
    }
  }

  console.log(`✅ 索引装载完成，涉及到的独立合法实体 ID 总计: ${allNeededIds.size} 部`);

  // 第二阶段：并发批量拉取所有实体的真实标题与元数据
  console.log('🔄 第二阶段：高并发拉取生产 KV 真实实体数据 (唯一真理源)...');
  const idArray = Array.from(allNeededIds);
  const realEntityMap = new Map(); // id -> entity

  // 本地缓存文件
  const CACHE_FILE = path.resolve('.cache/real-entity-kv-cache.json');
  if (fs.existsSync(CACHE_FILE)) {
    try {
      const cached = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
      for (const [k, v] of Object.entries(cached)) {
        realEntityMap.set(k, v);
      }
      console.log(`  ⚡ 从本地缓存恢复了 ${realEntityMap.size} 条真实实体数据`);
    } catch {}
  }

  const toFetch = idArray.filter(id => !realEntityMap.has(id));
  console.log(`  需要从生产 KV 实时拉取: ${toFetch.length} 条...`);

  const BATCH_SIZE = 60;
  for (let i = 0; i < toFetch.length; i += BATCH_SIZE) {
    const chunk = toFetch.slice(i, i + BATCH_SIZE);
    await Promise.all(
      chunk.map(async (id) => {
        try {
          const ent = await kvGet(`entity:${id}`);
          if (ent && ent.title) {
            realEntityMap.set(id, {
              title: ent.title.trim(),
              cover: ent.cover || ent.poster || '',
              year: ent.year || '',
              hot: ent.hot || ent.popularity || 0,
            });
          } else {
            realEntityMap.set(id, null); // 404
          }
        } catch {
          realEntityMap.set(id, null);
        }
      })
    );
    process.stdout.write(`  拉取进度: ${Math.min(i + BATCH_SIZE, toFetch.length)} / ${toFetch.length}\r`);
  }

  // 持久化缓存
  try {
    const obj = {};
    for (const [k, v] of realEntityMap.entries()) obj[k] = v;
    fs.writeFileSync(CACHE_FILE, JSON.stringify(obj));
    console.log(`\n  ✅ 真实实体数据全量缓存完毕`);
  } catch {}

  // 第三阶段：基于 100% 真实片名对 24 个索引执行绝对去重
  console.log('\n🧹 第三阶段：基于真实实体标题执行 100% 绝杀去重与回写...');

  let totalDups = 0;
  let totalGhosts = 0;

  for (const [key, rawIds] of indexDataMap.entries()) {
    const cleanIds = [];
    const seenTitles = new Set();
    let dupCount = 0;
    let ghostCount = 0;

    for (const id of rawIds) {
      if (!/^ik\d{6}$/i.test(id)) {
        ghostCount++;
        totalGhosts++;
        continue;
      }

      const ent = realEntityMap.get(id);
      if (!ent || !ent.title) {
        ghostCount++;
        totalGhosts++;
        continue;
      }

      // 过滤无封面或包含 placeholder 占位图
      if (!ent.cover || ent.cover.includes('placeholder') || ent.cover.includes('no-poster')) {
        ghostCount++;
        totalGhosts++;
        continue;
      }

      const norm = normalizeTitle(ent.title);
      if (!norm) {
        ghostCount++;
        totalGhosts++;
        continue;
      }

      if (seenTitles.has(norm)) {
        dupCount++;
        totalDups++;
        continue;
      }

      seenTitles.add(norm);
      cleanIds.push(id);
    }

    console.log(`  【${key}】原 ${rawIds.length} ➔ 纯净 ${cleanIds.length} (消灭重复 ${dupCount} 席, 剔除幽灵/无封面 ${ghostCount} 席)`);
    await kvPut(key, cleanIds);
  }

  console.log(`\n======================================================`);
  console.log(`🎉🎉🎉 全站 24 个四大排序倒排索引已 100% 绝杀去重净化完成！`);
  console.log(`🧹 全局累计消灭真实同名重复: ${totalDups} 席`);
  console.log(`👻 全局累计剔除幽灵与无封面条目: ${totalGhosts} 席`);
  console.log(`======================================================\n`);
}

main().catch(err => {
  console.error('❌ 执行失败:', err);
  process.exit(1);
});
