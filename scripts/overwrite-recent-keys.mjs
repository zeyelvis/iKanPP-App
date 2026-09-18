#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const CF_KV_ACCOUNT_ID = '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const CF_KV_EMAIL = 'zeyelvis@gmail.com';

const prebakedPath = path.resolve('lib/data/latest-titles-prebaked.ts');
const fileContent = fs.readFileSync(prebakedPath, 'utf8');
const jsonMatch = fileContent.match(/export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem\[\]> = ([\s\S]*?);\n/);
if (!jsonMatch) {
  console.error('无法解析 PREBAKED_LATEST_TITLES');
  process.exit(1);
}

const prebakedData = JSON.parse(jsonMatch[1]);

async function putKV(key, value) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const payload = typeof value === 'string' ? value : JSON.stringify(value);
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Auth-Email': CF_KV_EMAIL,
      'X-Auth-Key': CF_KV_API_KEY,
      'Content-Type': 'text/plain',
    },
    body: payload,
  });
  const data = await res.json();
  if (!data.success) {
    console.error(`❌ 写入 KV 键 ${key} 失败:`, data.errors);
  } else {
    console.log(`✅ 成功覆写 KV 键: ${key} (${Array.isArray(value) ? value.length : 0} 部华语新片)`);
  }
}

async function main() {
  const channels = ['all', 'movie', 'tv', 'anime', 'variety', 'documentary'];
  for (const ch of channels) {
    const list = prebakedData[ch] || [];
    if (list.length > 0) {
      await putKV(`recent:${ch}`, list);
    }
  }
  console.log('🎉 全部专区最新上线索引已完成 100% 覆盖重置！');
}

main().catch(console.error);
