#!/usr/bin/env node
/**
 * heal-and-commit-kv-entities.mjs
 * 
 * 🚀 将清洗后的纯净片库实体批量同步推送至 Cloudflare KV 生产库
 * 
 * 机制：
 * 1. 读取清洗完成的 .cache/iyf-master-catalog.json；
 * 2. 筛选出 100% 纯净（无任何 static.iyf.tv 水印）的实体数据；
 * 3. 构造符合 iKanPP 契约的标准化实体对象 (entity:ik******)；
 * 4. 调用 Cloudflare KV /bulk API 极速批量写入（每批 1000~2000 个，秒级完成）；
 * 5. 全站片库多维检索大厅 (/api/library/browse) 实时生效 0 水印 4K 官方海报。
 */

import fs from 'fs';
import path from 'path';

// 自动载入环境变量
(function autoLoadEnv() {
  const envFiles = ['.env.local', '.env'];
  for (const file of envFiles) {
    const fullPath = path.resolve(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        for (const line of content.split('\n')) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      } catch {}
    }
  }
})();

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_KV_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || process.env.CF_KV_NAMESPACE_ID || process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || process.env.CF_KV_API_KEY || process.env.CF_API_KEY || '';
const EMAIL = process.env.CLOUDFLARE_EMAIL || process.env.CF_KV_EMAIL || process.env.CF_EMAIL || process.env.CLOUDFLARE_AUTH_EMAIL || 'zeyelvis@gmail.com';

const INPUT_FILE = path.resolve('.cache/iyf-master-catalog.json');

function getAuthHeaders() {
  const rawKey = API_KEY;
  if (!rawKey) return {};

  const isGlobalKey = /^[0-9a-f]{37}$/i.test(rawKey) || rawKey.startsWith('cfk_');
  if (isGlobalKey && EMAIL) {
    return {
      'X-Auth-Email': EMAIL,
      'X-Auth-Key': rawKey,
      'Content-Type': 'application/json',
    };
  }

  const token = rawKey.replace(/^Bearer\s+/i, '');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
}

function generateSlug(title) {
  if (!title) return 'video';
  return String(title)
    .replace(/[（(][^）)]*[）)]/g, ' ')
    .replace(/[【\[][^】\]]*[】\]]/g, ' ')
    .replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|]/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'video';
}

function normalizeTitle(title) {
  if (!title) return '';
  return String(title)
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[【\[].*?[】\]]/g, '')
    .replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|\s_-]/g, '')
    .trim();
}

function formatEntityId(seq) {
  const padded = Math.max(1, Math.floor(seq)).toString().padStart(6, '0');
  return `ik${padded}`;
}

async function kvBulkPut(pairs) {
  if (!pairs || pairs.length === 0) return 0;
  const headers = getAuthHeaders();
  if (!headers['Authorization'] && !headers['X-Auth-Key']) {
    console.warn(`⚠️ 未配置有效的 Cloudflare API 凭证，跳过批量 KV 写入`);
    return 0;
  }

  const BATCH_SIZE = 1000;
  let writtenCount = 0;

  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    const chunk = pairs.slice(i, i + BATCH_SIZE).map(p => ({
      key: p.key,
      value: typeof p.value === 'string' ? p.value : JSON.stringify(p.value),
    }));

    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/bulk`;
    const res = await fetch(url, {
      method: 'PUT',
      headers,
      body: JSON.stringify(chunk),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`KV Bulk 写入失败 (批次 ${Math.floor(i / BATCH_SIZE) + 1}): status ${res.status}, msg: ${errText}`);
    }

    const json = await res.json();
    if (!json.success) {
      throw new Error(`KV Bulk 返回错误: ${JSON.stringify(json.errors)}`);
    }

    writtenCount += chunk.length;
    console.log(`💾 [KV Bulk] 成功推送批次 ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} 个键值对)，累计已写入: ${writtenCount}/${pairs.length}`);
  }

  return writtenCount;
}

async function main() {
  if (!fs.existsSync(INPUT_FILE)) {
    console.error(`❌ 未找到清洗后的片单文件: ${INPUT_FILE}`);
    return;
  }

  console.log(`\n=============================================================`);
  console.log(`🚀 iKanPP 纯净实体批量推流引擎 (Cloudflare KV Synchronizer)`);
  console.log(`=============================================================`);

  const catalog = JSON.parse(fs.readFileSync(INPUT_FILE, 'utf-8'));
  console.log(`📊 载入片库总条目数: ${catalog.length} 部`);

  // 筛选出已清洗完毕的纯净条目（无 static.iyf.tv）
  const cleanItems = catalog.filter(it => it.cover && !it.cover.includes('iyf.tv') && !it.cover.includes('static.iyf'));
  console.log(`✨ 纯净无水印条目数: ${cleanItems.length} 部 (${((cleanItems.length / catalog.length) * 100).toFixed(1)}%)`);

  const kvPairs = [];
  const nowIso = new Date().toISOString();

  let seq = 1;
  for (const item of cleanItems) {
    const entityId = item.entityId || formatEntityId(seq++);
    const slug = generateSlug(item.title);
    const canonicalSlug = `${entityId}-${slug}`.toLowerCase();
    const normTitle = normalizeTitle(item.title);

    const entity = {
      entityId,
      slug,
      canonicalSlug,
      title: item.title,
      type: item.channel || item.type || 'movie',
      year: item.year || '2026',
      rate: item.score || item.rate || '8.8',
      score: item.score || item.rate || '8.8',
      cover: item.cover,
      backdrop: item.backdrop || item.cover,
      genres: Array.isArray(item.types) ? item.types : (item.genres || ['精选']),
      region: item.region || '华语',
      language: item.lang || '国语',
      status: item.remarks || '完结',
      hot: item.hot || 1000,
      popularity: item.hot || 1000,
      description: item.desc || `${item.title} 支持在 iKanPP 免费在线观看完整版超清视频。`,
      updatedAt: item.updatedAt || nowIso,
      createdAt: item.createdAt || nowIso,
    };

    // 写入主实体键
    kvPairs.push({
      key: `entity:${entityId}`,
      value: entity,
    });

    // 写入规范别名键
    kvPairs.push({
      key: `slug:${canonicalSlug}`,
      value: entityId,
    });

    // 写入片名映射键
    if (normTitle) {
      kvPairs.push({
        key: `title:${normTitle}`,
        value: entityId,
      });
    }
  }

  console.log(`📦 已生成标准 KV 键值对总计: ${kvPairs.length} 条 (含主实体、规范别名与标题索引)`);
  console.log(`⚡ 开始执行 Cloudflare KV /bulk 批量推送...`);

  try {
    const totalWritten = await kvBulkPut(kvPairs);
    console.log(`\n🎉 恭喜！已成功将 ${totalWritten} 条纯净实体数据推送写入 Cloudflare KV！`);
  } catch (err) {
    console.error(`❌ KV 推送失败:`, err.message);
    if (!process.env.CI) {
      console.log(`💡 提示：本地环境未配置完整 KV 写入权限，可通过 GitHub Actions (ingest-entity-catalog.yml) 一键触发自动批量同步！`);
    }
  }
}

main().catch(err => {
  console.error('Fatal error in KV synchronizer:', err);
  process.exit(1);
});
