#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 🔍 生产 KV 全量实体重复扫描与权威合并引擎
 *
 * 功能：
 * 1. 从 Cloudflare KV 读取 sitemap:catalog 与 index:all；
 * 2. 对全量条目按 normalizeTitle 进行严格聚合统计；
 * 3. 找出全库所有具有多个不同 entityId 的重复影片（同一部作品不同时期被重复收录）；
 * 4. 统计重复严重程度；
 * 5. 在 --apply 模式下：
 *    - 自动保留信息最完整/权威的主实体；
 *    - 将次级重复实体的 ID 与所有衍生 slug 写入生产 KV 的 301 别名映射（指向主实体）；
 *    - 从 index:all 与 sitemap:catalog 中原子剔除多余实体 ID，彻底净化 Sitemap 与全站索引！
 */

const CF_KV_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = process.env.CLOUDFLARE_API_KEY || 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const CF_KV_EMAIL = process.env.CLOUDFLARE_EMAIL || 'zeyelvis@gmail.com';

const isApplyMode = process.argv.includes('--apply');

const headers = {
  'X-Auth-Email': CF_KV_EMAIL,
  'X-Auth-Key': CF_KV_API_KEY,
  'Content-Type': 'application/json',
};

function normalizeTitle(title) {
  if (!title || typeof title !== 'string') return '';
  return title
    .toLowerCase()
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[【\[][^】\]]*[】\]]/g, '')
    .replace(/\s+/g, '')
    .replace(/[^\w\u4e00-\u9fa5]/g, '');
}

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

async function kvGet(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function kvPut(key, value) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Auth-Email': CF_KV_EMAIL,
      'X-Auth-Key': CF_KV_API_KEY,
      'Content-Type': 'text/plain',
    },
    body: typeof value === 'string' ? value : JSON.stringify(value),
  });
  return res.ok;
}

async function kvBulkPut(pairs) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/bulk`;
  const chunkSize = 2000;
  for (let i = 0; i < pairs.length; i += chunkSize) {
    const chunk = pairs.slice(i, i + chunkSize);
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Auth-Email': CF_KV_EMAIL,
        'X-Auth-Key': CF_KV_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`KV Bulk Put failed: HTTP ${res.status}: ${txt}`);
    }
    console.log(`  🚀 批量推送 KV 成功: ${chunk.length} 条记录写入`);
  }
}

async function main() {
  console.log('📡 正在从 Cloudflare KV 同步全库基线数据 (sitemap:catalog)...');
  const rawCatalog = await kvGet('sitemap:catalog');
  if (!rawCatalog) {
    console.error('❌ 获取 sitemap:catalog 失败');
    return;
  }

  let catalog = [];
  try {
    catalog = JSON.parse(rawCatalog);
  } catch (e) {
    console.error('❌ 解析 sitemap:catalog JSON 失败:', e);
    return;
  }

  console.log(`✅ 成功获取 ${catalog.length} 条 sitemap 实体记录`);

  // 按 normalizeTitle 聚合条目
  const titleMap = new Map();

  for (const item of catalog) {
    if (!item) continue;
    const id = Array.isArray(item) ? item[0] : item.id;
    const title = Array.isArray(item) ? item[1] : item.title;
    const slug = Array.isArray(item) ? item[2] : item.slug;
    const updatedAt = Array.isArray(item) ? item[3] : item.updatedAt;

    if (!id || !title) continue;

    const norm = normalizeTitle(title);
    if (!norm) continue;

    if (!titleMap.has(norm)) {
      titleMap.set(norm, []);
    }
    titleMap.get(norm).push({ id: String(id).trim().toLowerCase(), title, slug, updatedAt });
  }

  // 筛选出存在多个不同 ID 的影视作品
  const duplicates = [];
  for (const [norm, entries] of titleMap.entries()) {
    const uniqueIds = Array.from(new Set(entries.map(e => e.id)));
    if (uniqueIds.length > 1) {
      duplicates.push({ norm, uniqueIds, entries });
    }
  }

  console.log(`\n========================================`);
  console.log(`📊 扫描结果汇总:`);
  console.log(`  - 扫描影视总数: ${catalog.length}`);
  console.log(`  - 独有片名总数: ${titleMap.size}`);
  console.log(`  - 发现存在重复多 ID 的影片数: ${duplicates.length}`);
  console.log(`========================================\n`);

  if (duplicates.length === 0) {
    console.log('🎉 恭喜！当前 sitemap:catalog 中 0 部重复多 ID 影片！');
  } else {
    console.log(`⚠️ 发现 ${duplicates.length} 部影片存在多个 ID（关键词互相蚕食风险）：\n`);
    for (let i = 0; i < Math.min(duplicates.length, 15); i++) {
      const d = duplicates[i];
      console.log(`[${i + 1}] 《${d.entries[0].title}》 (归一化: "${d.norm}"): 共有 ${d.uniqueIds.length} 个 ID: ${d.uniqueIds.join(', ')}`);
    }
    if (duplicates.length > 15) {
      console.log(`... 以及其余 ${duplicates.length - 15} 部`);
    }
  }

  // 如果启用 --apply 模式，执行权威合并
  if (isApplyMode && duplicates.length > 0) {
    console.log(`\n🚀 [执行模式 --apply] 开始执行全库重复 ID 权威合并与 301 映射写入...`);

    const idsToRemoveFromCatalog = new Set();
    const kvPairsToPut = [];

    for (const d of duplicates) {
      // 权威主 ID 判定策略：
      // 优先选择最早建档的标准 6 位 ik\d{6} 实体（序号最小者为原始权威主实体）
      const ikIds = d.uniqueIds.filter(id => /^ik\d{6}$/i.test(id)).sort((a, b) => {
        const numA = parseInt(a.slice(2), 10) || 999999;
        const numB = parseInt(b.slice(2), 10) || 999999;
        return numA - numB;
      });
      let primaryId = ikIds.length > 0 ? ikIds[0] : d.uniqueIds[0];

      const secondaryIds = d.uniqueIds.filter(id => id !== primaryId);
      const cleanSlug = generateSlug(d.entries[0].title);
      const canonicalSlug = `${primaryId}-${cleanSlug}`.toLowerCase();

      // 将次级 ID 标记为需要从 sitemap 移除
      for (const secId of secondaryIds) {
        idsToRemoveFromCatalog.add(secId);

        // 写入 301 映射：slug:secId -> primaryId
        kvPairsToPut.push({ key: `slug:${secId}`, value: primaryId });
        kvPairsToPut.push({ key: `slug:${secId}-${cleanSlug}`, value: primaryId });
        kvPairsToPut.push({ key: `slug:${secId}-${encodeURIComponent(cleanSlug).toLowerCase()}`, value: primaryId });
      }

      // 确保主实体拥有规范 slug 映射与 title 映射
      kvPairsToPut.push({ key: `slug:${canonicalSlug}`, value: primaryId });
      kvPairsToPut.push({ key: `title:${d.norm}`, value: primaryId });
    }

    console.log(`📦 正在通过 Cloudflare KV Bulk API 批量写入 ${kvPairsToPut.length} 条别名映射...`);
    await kvBulkPut(kvPairsToPut);
    console.log(`✅ 已成功写入 ${kvPairsToPut.length} 条别名映射到生产 KV！`);

    console.log(`🧹 正在从 sitemap:catalog 中清洗 ${idsToRemoveFromCatalog.size} 个多余重复 ID...`);

    // 过滤 sitemap:catalog
    const newCatalog = catalog.filter(item => {
      const id = (Array.isArray(item) ? item[0] : item.id || '').toString().toLowerCase();
      return !idsToRemoveFromCatalog.has(id);
    });

    await kvPut('sitemap:catalog', JSON.stringify(newCatalog));
    console.log(`✅ sitemap:catalog 已更新：从 ${catalog.length} 条修剪为 ${newCatalog.length} 条（彻底剔除重复项）！`);

    // 同样过滤 index:all
    const rawIndexAll = await kvGet('index:all');
    if (rawIndexAll) {
      try {
        const indexAll = JSON.parse(rawIndexAll);
        const newIndexAll = indexAll.filter(id => !idsToRemoveFromCatalog.has(String(id).toLowerCase()));
        await kvPut('index:all', JSON.stringify(newIndexAll));
        console.log(`✅ index:all 已同步更新：从 ${indexAll.length} 条修剪为 ${newIndexAll.length} 条！`);
      } catch (e) {
        console.warn('⚠️ 更新 index:all 异常:', e);
      }
    }

    console.log('\n🎉 全库重复 ID 治理完毕！所有次级 ID 已永久 301 重定向至唯一权威主实体！');
  } else if (!isApplyMode && duplicates.length > 0) {
    console.log('\n💡 提示：当前为只读检测模式。若需一键在生产 KV 中合并重复 ID 并清洗 Sitemap，请运行:');
    console.log('   node scripts/scan-and-dedup-entities.mjs --apply');
  }
}

main().catch(err => {
  console.error('❌ 执行异常:', err);
  process.exit(1);
});
