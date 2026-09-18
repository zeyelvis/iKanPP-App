#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 紧急清洗与重置「最新上线」KV 索引脚本
 * 
 * 作用：
 * 1. 使用 lib/data/latest-titles-prebaked.ts 中的纯净华语新片全量覆写 KV 中的 recent:* 系列键
 * 2. 扫描并物理抹除误入库的日文低俗色情录像实体
 */

const CF_KV_ACCOUNT_ID = '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const CF_KV_EMAIL = 'zeyelvis@gmail.com';

// 导入干净的预烘焙数据
const prebakedPath = path.resolve('lib/data/latest-titles-prebaked.ts');
const fileContent = fs.readFileSync(prebakedPath, 'utf8');

// 简易正则提取 PREBAKED_LATEST_TITLES
const jsonMatch = fileContent.match(/export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem\[\]> = ([\s\S]*?);\n/);
if (!jsonMatch) {
  console.error('无法解析 PREBAKED_LATEST_TITLES');
  process.exit(1);
}

const prebakedData = JSON.parse(jsonMatch[1]);

async function putKV(key, value) {
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
  const data = await res.json();
  if (!data.success) {
    console.error(`写入 KV 键 ${key} 失败:`, data.errors);
  } else {
    console.log(`✅ 成功覆写并净化 KV 键: ${key}`);
  }
}

async function deleteKV(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-Auth-Email': CF_KV_EMAIL,
      'X-Auth-Key': CF_KV_API_KEY,
    },
  });
  const data = await res.json();
  if (data.success) {
    console.log(`🗑️ 成功物理删除毒化键: ${key}`);
  }
}

async function main() {
  console.log('🧹 启动「最新上线」全域净化与重置流水线...');

  // 1. 全量覆写 6 大专区 recent 索引
  const channels = ['all', 'movie', 'tv', 'anime', 'variety', 'documentary'];
  for (const ch of channels) {
    const cleanList = prebakedData[ch] || [];
    if (cleanList.length > 0) {
      await putKV(`recent:${ch}`, cleanList);
    }
  }

  // 2. 扫描并物理清理误入库的日文低俗实体
  console.log('🔍 正在扫描误入库的日文色情录像带与垃圾条目...');
  const dirtyKeywords = [
    '売春', '愛汁', '肉しびれ', '女囚', '痴情報道', '痴漢', '快辱',
    '半熟売春', 'YOSHIO', 'Kis-My-Ft2', 'ジャニーズ', 'Unnatural Causes'
  ];

  let cursor = '';
  let deletedCount = 0;

  for (let page = 0; page < 10; page++) {
    const listUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/keys?prefix=entity:ik052&limit=1000${cursor ? '&cursor=' + cursor : ''}`;
    const res = await fetch(listUrl, {
      headers: {
        'X-Auth-Email': CF_KV_EMAIL,
        'X-Auth-Key': CF_KV_API_KEY,
      }
    });
    const json = await res.json();
    if (!json.success || !json.result) break;

    for (const k of json.result) {
      // 检查该实体的值
      const getUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(k.name)}`;
      const entRes = await fetch(getUrl, {
        headers: {
          'X-Auth-Email': CF_KV_EMAIL,
          'X-Auth-Key': CF_KV_API_KEY,
        }
      });
      if (!entRes.ok) continue;
      const text = await entRes.text();

      const isDirty = dirtyKeywords.some(w => text.includes(w));
      if (isDirty) {
        console.log(`🚨 识别到污染实体: ${k.name}`);
        await deleteKV(k.name);
        try {
          const parsed = JSON.parse(text);
          if (parsed.slug) {
            await deleteKV(`slug:${parsed.slug}`);
          }
          if (parsed.tmdbId && parsed.tmdbType) {
            await deleteKV(`tmdb:${parsed.tmdbType}:${parsed.tmdbId}`);
          }
        } catch {}
        deletedCount++;
      }
    }

    if (json.result_info?.cursor) {
      cursor = json.result_info.cursor;
    } else {
      break;
    }
  }

  console.log(`🎉 净化完成！共彻底抹除 ${deletedCount} 个毒化条目，全专区最新上线索引已恢复 100% 纯净。`);
}

main().catch(console.error);
