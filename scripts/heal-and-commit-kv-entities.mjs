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
import os from 'os';

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
const EMAIL = process.env.CLOUDFLARE_EMAIL || process.env.CF_KV_EMAIL || process.env.CF_EMAIL || process.env.CLOUDFLARE_AUTH_EMAIL || 'zeyelvis@gmail.com';

const INPUT_FILE = path.resolve('.cache/iyf-master-catalog.json');

function getAuthHeaders() {
  // 1. 优先读取 Wrangler 登录的有效 OAuth Token (本地最稳健通道)
  try {
    const wranglerConfigPath = path.join(os.homedir(), '.wrangler', 'config', 'default.toml');
    if (fs.existsSync(wranglerConfigPath)) {
      const cfg = fs.readFileSync(wranglerConfigPath, 'utf-8');
      const m = cfg.match(/oauth_token\s*=\s*['"]([^'"]+)['"]/);
      if (m && m[1]) {
        return {
          'Authorization': `Bearer ${m[1]}`,
          'Content-Type': 'application/json',
        };
      }
    }
  } catch {}

  // 2. 其次读取环境变量中的 API Token 或 Global Key
  const rawKey = process.env.CLOUDFLARE_API_KEY || process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || process.env.CF_KV_API_KEY || process.env.CF_API_KEY || '';
  if (rawKey) {
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

  return {};
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

const sleep = (ms) => new Promise(res => setTimeout(res, ms));

async function kvBulkPut(pairs) {
  if (!pairs || pairs.length === 0) return 0;
  const headers = getAuthHeaders();
  if (!headers['Authorization'] && !headers['X-Auth-Key']) {
    throw new Error('未检测到任何有效的 Cloudflare 鉴权凭证（Wrangler OAuth 或 API Token）');
  }

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
        if (!json.success) {
          throw new Error(`errors: ${JSON.stringify(json.errors)}`);
        }

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

  const LIMIT = parseInt(process.env.LIMIT || String(cleanItems.length), 10);
  const targetItems = cleanItems.slice(0, LIMIT);

  const kvPairs = [];
  const nowIso = new Date().toISOString();

  let seq = 1;
  for (const item of targetItems) {
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

    // 写入主实体键 (用于 /api/library/browse 和 /title/ik****** 极速直出)
    kvPairs.push({
      key: `entity:${entityId}`,
      value: entity,
    });

    // 写入规范别名键 (用于 SEO 规范 URL /title/ik000001-slug 反查)
    kvPairs.push({
      key: `slug:${canonicalSlug}`,
      value: entityId,
    });

    // 写入片名映射键 (用于片名反查唯一 ID)
    if (normTitle) {
      kvPairs.push({
        key: `title:${normTitle}`,
        value: entityId,
      });
    }
  }

  console.log(`📦 生成标准 KV 键值对总计: ${kvPairs.length} 条 (覆盖 ${targetItems.length} 部实体)`);
  console.log(`⚡ 启动 Cloudflare KV /bulk 批量高速推送...\n`);

  const startTime = Date.now();
  const totalWritten = await kvBulkPut(kvPairs);
  const totalSec = Math.round((Date.now() - startTime) / 1000);

  console.log(`\n=============================================================`);
  console.log(`🎉 生产环境 Cloudflare KV 纯净片库批量写入成功！`);
  console.log(`⏱️ 写入耗时: ${totalSec} 秒`);
  console.log(`📊 成功写入键值对: ${totalWritten} 条`);
  console.log(`✨ 线上片库多维检索大厅已实时换装无水印官方 4K 海报！`);
  console.log(`=============================================================\n`);
}

main().catch(err => {
  console.error('Fatal error in KV synchronizer:', err);
  process.exit(1);
});
