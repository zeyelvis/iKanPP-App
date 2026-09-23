#!/usr/bin/env node

/**
 * iKanPP AI 深度资产与港台别名批量同步至 Cloudflare KV 生产库
 * 
 * 作用：
 * 1. 读取 lib/data/prebaked-ai-insights.ts 中的全部独家 AI 资产；
 * 2. 检索并匹配 KV 现有实体 entity:ikXXXXXX；
 * 3. 将 hook、uniqueSynopsis、highlights、faqs、taiwanTitle 等注入 entity.aiContent；
 * 4. 自动为台湾/香港译名建立 title:别名反向索引，实现港台繁体搜索 0ms 直达；
 * 5. 采用 Cloudflare KV Bulk API 批量原子推流，效率拉满！
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

import { PREBAKED_AI_INSIGHTS } from '../../lib/data/prebaked-ai-insights.ts';

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const AUTH_EMAIL = process.env.CLOUDFLARE_AUTH_EMAIL;
const AUTH_KEY = process.env.CLOUDFLARE_AUTH_KEY;
const NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || '42311924427747deaf00981d99d58998';

if (!ACCOUNT_ID || !AUTH_KEY) {
  console.error('❌ 缺失 Cloudflare KV 生产凭据 (CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_AUTH_KEY)');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  ...(AUTH_EMAIL ? { 'X-Auth-Email': AUTH_EMAIL, 'X-Auth-Key': AUTH_KEY } : { 'Authorization': `Bearer ${AUTH_KEY}` })
};

async function getKvValue(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV GET ${key} failed: ${res.statusText}`);
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return text.trim();
  }
}

async function bulkPutKv(entries) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/bulk`;
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(entries)
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`KV Bulk PUT failed: ${res.statusText} - ${txt}`);
  }
  return await res.json();
}

async function runSync() {
  console.log('========================================================');
  console.log('🚀 iKanPP AI 资产 Cloudflare KV 生产批量同步中枢启动');
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`📦 待同步 AI 资产总数: ${Object.keys(PREBAKED_AI_INSIGHTS).length} 部`);
  console.log('========================================================\n');

  const bulkEntries = [];
  let updatedEntities = 0;
  let aliasIndicesAdded = 0;

  for (const [title, aiContent] of Object.entries(PREBAKED_AI_INSIGHTS)) {
    try {
      // 1. 查找现有实体
      let titleVal = await getKvValue(`title:${title}`);
      if (!titleVal) {
        // 尝试去除空格
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
        // 2. 读出完整实体
        const fullEntity = await getKvValue(`entity:${entityId}`);
        if (fullEntity && typeof fullEntity === 'object') {
          // 3. 注入 AI Content
          fullEntity.aiContent = { ...(fullEntity.aiContent || {}), ...aiContent };

          // 4. 注入港台公映别名与反查索引
          const aliases = new Set(fullEntity.aliases || []);
          if (aiContent.taiwanTitle && aiContent.taiwanTitle !== title) {
            aliases.add(aiContent.taiwanTitle.trim());
            bulkEntries.push({
              key: `title:${aiContent.taiwanTitle.trim().toLowerCase()}`,
              value: entityId
            });
            aliasIndicesAdded++;
          }
          if (aiContent.hongkongTitle && aiContent.hongkongTitle !== title) {
            aliases.add(aiContent.hongkongTitle.trim());
            bulkEntries.push({
              key: `title:${aiContent.hongkongTitle.trim().toLowerCase()}`,
              value: entityId
            });
            aliasIndicesAdded++;
          }
          fullEntity.aliases = Array.from(aliases);

          // 5. 加入待同步批量队列
          bulkEntries.push({
            key: `entity:${entityId}`,
            value: JSON.stringify(fullEntity)
          });
          updatedEntities++;
          console.log(`   ✨ 已匹配实体 《${title}》(${entityId}) -> 注入 AI 资产与 ${aliases.size} 个别名`);
        }
      } else {
        // 独立索引池
        bulkEntries.push({
          key: `ai:title:${title}`,
          value: JSON.stringify(aiContent)
        });
        console.log(`   ℹ️ 《${title}》独立存入 ai:title 索引池`);
      }
    } catch (err) {
      console.warn(`   ⚠️ 处理《${title}》跳过:`, err.message);
    }

    // 每积累 50 条提交一次 bulk
    if (bulkEntries.length >= 50) {
      console.log(`\n🚀 正在向 Cloudflare KV 提交 ${bulkEntries.length} 条数据...`);
      await bulkPutKv(bulkEntries.splice(0, bulkEntries.length));
      console.log('   ✅ 提交成功！\n');
    }
  }

  // 提交剩余 entries
  if (bulkEntries.length > 0) {
    console.log(`\n🚀 正在向 Cloudflare KV 提交剩余 ${bulkEntries.length} 条数据...`);
    await bulkPutKv(bulkEntries);
    console.log('   ✅ 提交成功！\n');
  }

  console.log('========================================================');
  console.log('🎉 Cloudflare KV AI 资产同步完毕！');
  console.log(`📊 统计: 更新 ${updatedEntities} 个实体，新增 ${aliasIndicesAdded} 个港台别名索引`);
  console.log('========================================================');
}

runSync().catch(err => {
  console.error('💥 同步异常中断:', err);
  process.exit(1);
});
