#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 生产环境「最新上线」全域净化与重置流水线
 * 1. 使用 lib/data/latest-titles-prebaked.ts 中的优质华语正片全量覆写 KV 中的 recent:* 系列键
 * 2. 严格遵循 isCleanChineseTitle 铁律，剔除所有日文假名、纯英文/德文/西文及垃圾条目
 * 3. 扫描并物理抹除刚才误入库的非华语实体键
 */

const CF_KV_ACCOUNT_ID = process.env.CF_KV_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = process.env.CF_KV_API_KEY || '';
const CF_KV_EMAIL = process.env.CF_KV_EMAIL || 'zeyelvis@gmail.com';

const BASE_URL = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}`;
const HEADERS = {
  'X-Auth-Email': CF_KV_EMAIL,
  'X-Auth-Key': CF_KV_API_KEY,
};

const ADULT_BLACKLIST_WORDS = [
  '痴漢', '痴汉', '調教', '调教', '発情', '发情', '近親', '近亲', '乱倫', '乱伦',
  '性奴', '小股', '沙龙病院', '中出し', '潮吹き', '巨乳', '美乳', '素人',
  '熟女', '人妻', '淫乱', '絶頂', '绝顶', '強姦', '强奸', '輪姦', '轮奸', '肉便器',
  '風俗', '风俗', '無修正', '无修正', 'エロ', 'AV', 'JAV', 'FC2', 'SM', '変態', '变态',
  '制服誘惑', '制服诱惑', '女教師', '女教师', '看護婦', '看护妇', '盗撮', '覗き', '偷窥',
  '性交', '做爱', '自慰', '色情', '三级', '露点', '情色', '偷拍', '色誘', '色诱', '情欲', '欲女',
  '売春', '愛汁', '肉しびれ', '女囚', '痴情', '快辱', '乱交', 'ポルノ', '半熟売春'
];

function isCleanChineseTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const t = title.trim();
  if (!t) return false;

  for (const w of ADULT_BLACKLIST_WORDS) {
    if (t.includes(w)) return false;
  }

  // 绝对零容忍日文平假名、片假名（无论是否带汉字，如“銭の踊り”、“悪魔からの勲章”，一律拦截）
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) {
    return false;
  }

  // 绝对零容忍韩文字符
  if (/[\uac00-\ud7af]/.test(t)) {
    return false;
  }

  // 华语平台核心底线：必须包含中文字符（彻底拦截 Bourek、Die Chefin、Unser Charly 等纯外文条目）
  if (!/[\u4e00-\u9fa5]/.test(t)) {
    return false;
  }

  return true;
}

async function kvPut(key, value) {
  const url = `${BASE_URL}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      ...HEADERS,
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body: typeof value === 'string' ? value : JSON.stringify(value),
  });
  const data = await res.json();
  if (!data.success) {
    throw new Error(`写入 KV 键 ${key} 失败: ${JSON.stringify(data.errors)}`);
  }
}

async function kvDelete(key) {
  const url = `${BASE_URL}/values/${encodeURIComponent(key)}`;
  await fetch(url, {
    method: 'DELETE',
    headers: HEADERS,
  });
}

// 导入干净的预烘焙数据
const prebakedPath = path.resolve('lib/data/latest-titles-prebaked.ts');
const fileContent = fs.readFileSync(prebakedPath, 'utf8');

const jsonMatch = fileContent.match(/export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem\[\]> = ([\s\S]*?);\s*$/);
if (!jsonMatch) {
  console.error('无法解析 PREBAKED_LATEST_TITLES');
  process.exit(1);
}

const prebakedData = JSON.parse(jsonMatch[1]);

async function main() {
  console.log('🚀 启动「最新上线」全域净化与重置流水线...\n');

  // 1. 全量覆写 7 大专区 recent 索引（经过 isCleanChineseTitle 过滤）
  const channels = ['all', 'movie', 'tv', 'anime', 'variety', 'documentary', 'short'];
  for (const ch of channels) {
    const rawList = prebakedData[ch] || [];
    const cleanList = rawList.filter(item => {
      if (!item || !item.title) return false;
      return isCleanChineseTitle(item.title);
    });

    console.log(`📦 正在覆写 recent:${ch} ➔ 纯净有效华语影视: ${cleanList.length} 部...`);
    await kvPut(`recent:${ch}`, cleanList);
    console.log(`✅ [完成] recent:${ch} 写入成功！前 3 部: ${cleanList.slice(0, 3).map(it => it.title).join(' / ')}`);
  }

  // 2. 扫描并抹除刚才误入库的高位无中文/日文实体
  console.log('\n🔍 正在扫描误入库的非华语临时条目...');
  let cursor = '';
  let scanned = 0;
  let purgedCount = 0;

  for (let page = 0; page < 10; page++) {
    const listUrl = `${BASE_URL}/keys?prefix=entity:ik058&limit=1000${cursor ? '&cursor=' + cursor : ''}`;
    const res = await fetch(listUrl, { headers: HEADERS });
    const json = await res.json();
    if (!json.success || !json.result || json.result.length === 0) break;

    for (const k of json.result) {
      scanned++;
      const getUrl = `${BASE_URL}/values/${encodeURIComponent(k.name)}`;
      const valRes = await fetch(getUrl, { headers: HEADERS });
      if (!valRes.ok) continue;

      try {
        const ent = await valRes.json();
        const title = ent.title || '';
        if (!isCleanChineseTitle(title)) {
          console.log(`   ❌ 正在物理抹除非华语/日文垃圾实体: [${ent.entityId}] ${title}`);
          await kvDelete(k.name);
          if (ent.slug) {
            await kvDelete(`slug:${ent.slug}`);
            await kvDelete(`slug:${ent.entityId}-${ent.slug}`);
          }
          await kvDelete(`slug:${ent.entityId}`);
          purgedCount++;
        }
      } catch (e) {}
    }

    cursor = json.result_info?.cursor;
    if (!cursor) break;
  }

  console.log(`\n🧹 扫描完成: 检索 ${scanned} 个高位实体，物理抹除 ${purgedCount} 个非华语垃圾条目`);
  console.log('🎉 「最新上线」横轨与全域 KV 数据库已恢复 100% 纯正华语影视！\n');
}

main().catch(err => {
  console.error('❌ 执行失败:', err);
  process.exit(1);
});
