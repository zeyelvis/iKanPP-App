import fs from 'fs';
import path from 'path';

const CF_KV_ACCOUNT_ID = '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CF_KV_API_KEY || process.env.CF_API_KEY || process.env.CLOUDFLARE_AUTH_KEY || '';
const CF_KV_EMAIL = 'zeyelvis@gmail.com';

const ADULT_BLACKLIST_WORDS = [
  '痴漢', '痴汉', '調教', '调教', '発情', '发情', '近親', '近亲', '乱倫', '乱伦',
  '性奴', '小股', '沙龙病院', '中出し', '潮吹き', '巨乳', '美乳', '素人',
  '熟女', '人妻', '淫乱', '絶頂', '绝顶', '強姦', '强奸', '輪姦', '轮奸', '肉便器',
  '風俗', '风俗', '無修正', '无修正', 'エロ', 'AV', 'JAV', 'FC2', 'SM', '変態', '变态',
  '制服誘惑', '制服诱惑', '女教師', '女教师', '看護婦', '看护妇', '盗撮', '覗き', '偷窥',
  '性交', '做爱', '自慰', '色情', '三级', '露点', '情色', '偷拍', '色誘', '色诱', '情欲', '欲女'
];

function evaluateEntity(entity) {
  if (!entity || !entity.title) return { isSpam: true, reason: 'empty_title' };
  const title = String(entity.title).trim();

  // 1. 命中色情/低俗黑名单词汇
  for (const word of ADULT_BLACKLIST_WORDS) {
    if (title.includes(word)) {
      return { isSpam: true, reason: `adult_word: ${word}` };
    }
  }

  // 2. 纯日文假名地下录像（含平假名或片假名）
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(title)) {
    return { isSpam: true, reason: 'contains_kana' };
  }

  // 3. 华语平台核心防线：必须包含中文字符
  // 没有任何汉字的纯外文/小语种/孟加拉语/葡语机械爬取条目，100% 无法播放且无华语受众
  const hasChinese = /[\u4e00-\u9fa5]/.test(title);
  if (!hasChinese) {
    return { isSpam: true, reason: 'no_chinese_characters' };
  }

  // 4. 极低评分远古垃圾片（评分 <= 3.5 且 2024 年前）
  const rateNum = parseFloat(entity.rate || '0');
  const yearNum = parseInt(entity.year || '0', 10);
  if (rateNum > 0 && rateNum <= 3.5 && yearNum < 2024) {
    return { isSpam: true, reason: `low_score: ${entity.rate}` };
  }

  return { isSpam: false, reason: 'clean' };
}

async function cfKvRequest(endpoint, method = 'GET', body = null) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}${endpoint}`;
  const headers = {
    'X-Auth-Email': CF_KV_EMAIL,
    'X-Auth-Key': CF_KV_API_KEY,
  };
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });
  return res.json();
}

async function bulkDeleteKeys(keys) {
  if (!keys || keys.length === 0) return 0;
  try {
    const res = await cfKvRequest('/bulk/delete', 'POST', keys);
    if (res.success) {
      return keys.length;
    } else {
      console.error('批量删除失败:', res.errors);
      return 0;
    }
  } catch (err) {
    console.error('批量删除异常:', err.message);
    return 0;
  }
}

async function listAllEntityKeys() {
  console.log('🔍 正在遍历全库所有 entity:* 键列表（基于游标）...');
  let allKeys = [];
  let cursor = null;
  let page = 1;

  while (true) {
    let endpoint = `/keys?prefix=entity:&limit=1000`;
    if (cursor) endpoint += `&cursor=${encodeURIComponent(cursor)}`;

    const data = await cfKvRequest(endpoint);
    if (!data.success || !data.result) {
      console.error('拉取 keys 失败:', data.errors);
      break;
    }

    const keys = data.result.map(k => k.name);
    allKeys = allKeys.concat(keys);
    process.stdout.write(`\r  已检索第 ${page} 页，累计 ${allKeys.length} 个条目...`);

    cursor = data.result_info?.cursor;
    if (!cursor) break;
    page++;
  }
  console.log(`\n✅ 全库 entity:* 键扫描完毕，总计: ${allKeys.length} 个`);
  return allKeys;
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run');
  console.log(`================================================================`);
  console.log(`  iKanPP 全库深度大扫除流水线 [${isDryRun ? 'DRY-RUN 预检模式' : '🔥 真实物理连根抹除模式'}]`);
  console.log(`================================================================\n`);

  const allKeys = await listAllEntityKeys();
  if (allKeys.length === 0) {
    console.log('未找到任何 entity 键，退出。');
    return;
  }

  let spamCount = 0;
  let cleanCount = 0;
  let totalKeysDeleted = 0;

  const spamSamples = [];
  const cleanSamples = [];
  let deleteQueue = [];

  // 并发拉取并过滤（40 并发）
  const BATCH_SIZE = 40;
  const startTime = Date.now();

  for (let i = 0; i < allKeys.length; i += BATCH_SIZE) {
    const batch = allKeys.slice(i, i + BATCH_SIZE);
    
    await Promise.all(batch.map(async (keyName) => {
      try {
        const entRes = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(keyName)}`, {
          headers: { 'X-Auth-Email': CF_KV_EMAIL, 'X-Auth-Key': CF_KV_API_KEY }
        });
        if (!entRes.ok) return;
        const ent = await entRes.json();
        const check = evaluateEntity(ent);

        if (check.isSpam) {
          spamCount++;
          if (spamSamples.length < 20) {
            spamSamples.push({ id: ent.entityId, title: ent.title, year: ent.year, rate: ent.rate, reason: check.reason });
          }

          if (!isDryRun) {
            // 将主键及所有伴随反向索引排入物理删除队列
            deleteQueue.push(keyName);
            if (ent.slug) deleteQueue.push(`slug:${ent.slug}`);
            if (ent.tmdbId && ent.tmdbType) deleteQueue.push(`tmdb:${ent.tmdbType}:${ent.tmdbId}`);
          }
        } else {
          cleanCount++;
          if (cleanSamples.length < 20) {
            cleanSamples.push({ id: ent.entityId, title: ent.title, year: ent.year, rate: ent.rate });
          }
        }
      } catch (err) {
        // 网络微抖动静默跳过
      }
    }));

    // 攒满 500 个待删 keys 触发一次高效批量物理抹除
    if (!isDryRun && deleteQueue.length >= 500) {
      const keysToFlush = deleteQueue.splice(0, deleteQueue.length);
      const deleted = await bulkDeleteKeys(keysToFlush);
      totalKeysDeleted += deleted;
    }

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(0);
    const progress = (((i + batch.length) / allKeys.length) * 100).toFixed(1);
    process.stdout.write(`\r  耗时: ${elapsedSec}s | 进度: ${progress}% | 垃圾: ${spamCount} | 保留优质: ${cleanCount} | 已删键数: ${totalKeysDeleted} `);
  }

  // 清空最后一批待删队列
  if (!isDryRun && deleteQueue.length > 0) {
    const keysToFlush = deleteQueue.splice(0, deleteQueue.length);
    const deleted = await bulkDeleteKeys(keysToFlush);
    totalKeysDeleted += deleted;
  }

  console.log('\n\n================ 清理战报 (Final Audit) ================');
  console.log(`全库总扫描条目: ${allKeys.length}`);
  console.log(`识别并${isDryRun ? '标记垃圾' : '物理连根抹除垃圾'}: ${spamCount} 部`);
  console.log(`保留 100% 纯净华语正版优质资产: ${cleanCount} 部`);
  if (!isDryRun) {
    console.log(`Cloudflare KV 物理清除键总计: ${totalKeysDeleted} 个`);
  }

  console.log('\n--- 垃圾条目样本 (前 20 部，已切除) ---');
  console.table(spamSamples);

  console.log('\n--- 保留华语优质条目样本 (前 20 部，健康运行) ---');
  console.table(cleanSamples);
  console.log('========================================================\n');
}

main().catch(console.error);
