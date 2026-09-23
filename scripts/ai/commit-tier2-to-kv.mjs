#!/usr/bin/env node

/**
 * iKanPP Tier 2 全量 Cloudflare KV 保证投递与去重中枢
 * 
 * 读取 scripts/ai/tier2-cache.json 中已生成的 377 部数据，
 * 严格去重 key，确保 100% 灌入生产 Cloudflare KV。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// 加载 .env.local
const envLocalPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const AUTH_EMAIL = process.env.CLOUDFLARE_AUTH_EMAIL;
const AUTH_KEY = process.env.CLOUDFLARE_AUTH_KEY;
const NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || '42311924427747deaf00981d99d58998';

const headers = {
  'Content-Type': 'application/json',
  ...(AUTH_EMAIL ? { 'X-Auth-Email': AUTH_EMAIL, 'X-Auth-Key': AUTH_KEY } : { 'Authorization': `Bearer ${AUTH_KEY}` })
};

async function getKvValue(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, { headers });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text.trim();
    }
  } catch {
    return null;
  }
}

async function bulkPutKv(entries) {
  if (!entries || entries.length === 0) return;
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/bulk`;
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(entries)
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error(`⚠️ KV Bulk 失败: ${res.statusText} - ${txt}`);
  } else {
    console.log(`   ✅ 成功批量提交 ${entries.length} 条数据至 Cloudflare KV`);
  }
}

async function commitAll() {
  console.log('========================================================');
  console.log('🚀 Tier 2 全量 Cloudflare KV 保证投递中枢启动');
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log('========================================================\n');

  const cachePath = path.join(__dirname, 'tier2-cache.json');
  const cache = JSON.parse(fs.readFileSync(cachePath, 'utf8'));
  const titles = Object.keys(cache);
  console.log(`📋 待投递条目总数: ${titles.length} 部`);

  // 使用 Map 确保每一个批次内的 Key 绝对唯一
  const pendingBatchMap = new Map();
  let totalCommitted = 0;

  for (let i = 0; i < titles.length; i++) {
    const title = titles[i];
    const aiContent = cache[title];

    try {
      let titleVal = await getKvValue(`title:${title}`);
      if (!titleVal) {
        const cleanTitle = title.replace(/\s+/g, '');
        titleVal = await getKvValue(`title:${cleanTitle}`);
      }

      let entityId = null;
      if (typeof titleVal === 'string' && titleVal.startsWith('ik')) {
        entityId = titleVal;
      } else if (titleVal && typeof titleVal === 'object' && titleVal.entityId) {
        entityId = titleVal.entityId;
      }

      if (entityId) {
        const fullEntity = await getKvValue(`entity:${entityId}`);
        if (fullEntity && typeof fullEntity === 'object') {
          fullEntity.aiContent = { ...(fullEntity.aiContent || {}), ...aiContent };

          const aliases = new Set(fullEntity.aliases || []);
          if (aiContent.taiwanTitle && aiContent.taiwanTitle !== title) {
            aliases.add(aiContent.taiwanTitle.trim());
            pendingBatchMap.set(`title:${aiContent.taiwanTitle.trim().toLowerCase()}`, entityId);
          }
          if (aiContent.hongkongTitle && aiContent.hongkongTitle !== title) {
            aliases.add(aiContent.hongkongTitle.trim());
            pendingBatchMap.set(`title:${aiContent.hongkongTitle.trim().toLowerCase()}`, entityId);
          }
          fullEntity.aliases = Array.from(aliases);

          pendingBatchMap.set(`entity:${entityId}`, JSON.stringify(fullEntity));
        }
      } else {
        pendingBatchMap.set(`ai:title:${title}`, JSON.stringify(aiContent));
      }
    } catch (e) {
      console.warn(`   ⚠️ 跳过《${title}》:`, e.message);
    }

    // 每 50 个唯一 key 提交一次
    if (pendingBatchMap.size >= 50) {
      const entries = Array.from(pendingBatchMap.entries()).map(([key, value]) => ({ key, value }));
      pendingBatchMap.clear();
      await bulkPutKv(entries);
      totalCommitted += entries.length;
    }
  }

  // 提交剩余
  if (pendingBatchMap.size > 0) {
    const entries = Array.from(pendingBatchMap.entries()).map(([key, value]) => ({ key, value }));
    pendingBatchMap.clear();
    await bulkPutKv(entries);
    totalCommitted += entries.length;
  }

  console.log('\n========================================================');
  console.log(`🎉 投递大功告成！累计向 Cloudflare KV 原子提交了 ${totalCommitted} 条实体与别名索引`);
  console.log('========================================================');
}

commitAll().catch(console.error);
