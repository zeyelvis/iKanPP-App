#!/usr/bin/env node
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * 🌟 将爱壹帆原生 orderBy=3 的高分 (9.9, 9.8, 9.7 等) 原位注入到本站实体中
 * 确保卡片右上角角标与爱壹帆截图 100% 呈现高分金色徽章！
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CF_API_KEY || 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const EMAIL = process.env.CLOUDFLARE_EMAIL || process.env.CF_EMAIL || 'zeyelvis@gmail.com';

const CACHE_DIR = path.resolve(process.cwd(), '.cache');

function md5(str) { return crypto.createHash('md5').update(str).digest('hex'); }
function getQuery(url) {
  if (url.indexOf('?') > -1) {
    const pairs = url.substring(url.indexOf('?') + 1).split('&');
    return pairs.map(p => {
      const kv = p.split('=');
      return kv[0] + '=' + decodeURIComponent(kv.slice(1).join('=')).split('+').join(' ');
    }).join('&');
  }
  return '';
}
function uriSignature(url, pub, privList) {
  let q = (getQuery(url) || '').toLowerCase();
  const vv = md5(pub + '&' + q + '&' + privList[0]);
  return url + (url.includes('?') ? '&' : '?') + 'vv=' + vv + '&pub=' + pub;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getPConfig() {
  const res = await fetch('https://www.iyf.tv/list', { headers: { 'User-Agent': 'Mozilla/5.0' } });
  const html = await res.text();
  const m = html.match(/var injectJson = (\{.*?\});/s);
  return JSON.parse(m[1]).config[0].pConfig;
}

async function kvGet(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, { headers: { 'X-Auth-Email': EMAIL, 'X-Auth-Key': API_KEY } });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV GET ${key} failed: ${res.status}`);
  return await res.text();
}

async function kvBulkPut(pairs) {
  const BATCH_SIZE = 1000;
  for (let i = 0; i < pairs.length; i += BATCH_SIZE) {
    const batch = pairs.slice(i, i + BATCH_SIZE).map(p => ({
      key: p.key,
      value: typeof p.value === 'string' ? p.value : JSON.stringify(p.value),
    }));
    const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/bulk`;
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Auth-Email': EMAIL,
        'X-Auth-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });
    const data = await res.json();
    if (!data.success) throw new Error(`KV Bulk PUT failed: ${JSON.stringify(data.errors)}`);
    console.log(`  ⚡ 已成功批量同步实体到 Cloudflare KV: ${Math.min(i + BATCH_SIZE, pairs.length)} / ${pairs.length} 条`);
    await sleep(200);
  }
}

async function main() {
  console.log('🚀 正在为爱壹帆 orderBy=3 头部口碑作品原位补全精准评分...');
  const pConfig = await getPConfig();

  const titleToScoreMap = new Map();
  // 抓取全站大厅前 10 页及各专区前 5 页的高分作品真实分数字典
  const targets = ['', '&cid=0,1,3', '&cid=0,1,4', '&cid=0,1,6', '&cid=0,1,5', '&cid=0,1,7'];
  for (const cidParam of targets) {
    for (let page = 1; page <= 6; page++) {
      const rawUrl = `https://m10.iyf.tv/api/list/Search?cinema=1${cidParam}&page=${page}&size=50&orderby=3&desc=1`;
      const signedUrl = uriSignature(rawUrl, pConfig.publicKey, pConfig.privateKey);
      try {
        const res = await fetch(signedUrl, { headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://www.iyf.tv/list?orderBy=3' } });
        const json = await res.json();
        const list = json.data?.info?.[0]?.result || [];
        for (const it of list) {
          const title = (it.title || '').trim();
          if (title && it.score && it.score !== '暂无评分') {
            titleToScoreMap.set(title, {
              score: String(it.score),
              hot: Number(it.hot) || 0,
            });
          }
        }
        await sleep(50);
      } catch {}
    }
  }
  console.log(`✅ 成功捕获真实高分头部作品字典: ${titleToScoreMap.size} 部`);

  // 对齐本地 entityId 并拉取原实体更新
  const sitemapBackupPath = path.resolve(CACHE_DIR, 'sitemap_catalog_backup.json');
  const titleToId = new Map();
  if (fs.existsSync(sitemapBackupPath)) {
    const sitemapData = JSON.parse(fs.readFileSync(sitemapBackupPath, 'utf-8'));
    for (const item of sitemapData) {
      if (Array.isArray(item) && item[0] && item[1]) {
        titleToId.set(item[1].trim(), item[0]);
      }
    }
  }

  const kvPairs = [];
  let patchedCount = 0;
  for (const [title, info] of titleToScoreMap.entries()) {
    const id = titleToId.get(title);
    if (!id) continue;

    try {
      const rawEnt = await kvGet(`entity:${id}`);
      if (rawEnt) {
        const ent = JSON.parse(rawEnt);
        ent.rate = info.score;
        ent.score = info.score;
        if (info.hot > (ent.hot || 0)) {
          ent.hot = info.hot;
          ent.popularity = info.hot;
        }
        kvPairs.push({ key: `entity:${id}`, value: ent });
        patchedCount++;
      }
    } catch {}
    if (kvPairs.length >= 200) break; // 优先精准修复最头部 200 部核心口碑神作
  }

  console.log(`🚀 准备推送 ${kvPairs.length} 部实体的真实评分原位修正...`);
  if (kvPairs.length > 0) {
    await kvBulkPut(kvPairs);
  }
  console.log(`🎉 头部实体真实评分注入大功告成！已原位修正 ${patchedCount} 部神作！`);
}

main().catch(console.error);
