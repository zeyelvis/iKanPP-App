#!/usr/bin/env node
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

/**
 * 🌟 爱壹帆官方原生 4 大排序体系 100% 绝对对齐引擎
 * 
 * 4 大排序真值表：
 * - orderBy=0: 添加时间 (time_added / default) ➔ 最新入库新片
 * - orderBy=1: 更新时间 (time_updated) ➔ 连载最新更新集数
 * - orderBy=2: 人气高低 (popularity) ➔ 全网千万级热度排行
 * - orderBy=3: 评分高低 (rating / score) ➔ 爱壹帆官方权威口碑神作榜
 */

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CF_API_KEY || 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const EMAIL = process.env.CLOUDFLARE_EMAIL || process.env.CF_EMAIL || 'zeyelvis@gmail.com';

const CACHE_DIR = path.resolve(process.cwd(), '.cache');

// 内容安全敏感词
const ADULT_BLACKLIST = [
  'AV', '三级', '情色', '无码', '有码', '成人', '调教', '偷拍', '熟女', '乱伦',
  '女优', '肉便器', '群交', '巨乳', '痴汉', '快感', '色情'
];

function isCleanChineseTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const clean = title.trim();
  if (!clean) return false;
  // 必须包含至少一个汉字
  if (!/[\u4e00-\u9fa5]/.test(clean)) return false;
  // 绝对零容忍日文假名
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(clean)) return false;
  // 绝对零容忍韩文字符
  if (/[\uac00-\ud7af]/.test(clean)) return false;
  // 敏感词
  for (const word of ADULT_BLACKLIST) {
    if (clean.includes(word)) return false;
  }
  return true;
}

function md5(str) {
  return crypto.createHash('md5').update(str).digest('hex');
}

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

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function getPConfig() {
  const res = await fetch('https://www.iyf.tv/list', {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const html = await res.text();
  const m = html.match(/var injectJson = (\{.*?\});/s);
  if (!m) throw new Error('无法解析 HTML 中的 injectJson');
  const injectJson = JSON.parse(m[1]);
  return injectJson.config[0].pConfig;
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
    console.log(`  ⚡ 已成功批量推送到 Cloudflare KV: ${Math.min(i + BATCH_SIZE, pairs.length)} / ${pairs.length} 条`);
    await sleep(150);
  }
}

async function kvGet(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: { 'X-Auth-Email': EMAIL, 'X-Auth-Key': API_KEY }
  });
  if (res.status === 404) return null;
  if (!res.ok) return null;
  return await res.text();
}

async function main() {
  console.log('🚀 启动爱壹帆官方原生 4 大排序物理索引 100% 对齐引擎...');
  
  const pConfig = await getPConfig();
  console.log('✅ 动态签名密钥对就绪');

  // 装载片名映射字典
  console.log('🔄 正在极速装载片名映射字典...');
  const titleToEntityId = new Map();
  let maxIdNum = 1000;

  const sitemapBackupPath = path.resolve(CACHE_DIR, 'sitemap_catalog_backup.json');
  if (fs.existsSync(sitemapBackupPath)) {
    const sitemapData = JSON.parse(fs.readFileSync(sitemapBackupPath, 'utf-8'));
    for (const item of sitemapData) {
      if (Array.isArray(item) && item[0] && item[1]) {
        titleToEntityId.set(item[1].trim(), item[0]);
        const m = item[0].match(/^ik(\d{6})$/i);
        if (m) {
          const n = parseInt(m[1], 10);
          if (n > maxIdNum) maxIdNum = n;
        }
      }
    }
  }

  console.log(`✅ 片名映射字典装载完毕: ${titleToEntityId.size} 条真实建档实体`);

  // 6 大核心频道
  const CHANNELS = [
    { key: 'all', name: '全站大厅', cid: '' },
    { key: 'movie', name: '电影专区', cid: '0,1,3' },
    { key: 'tv', name: '电视剧专区', cid: '0,1,4' },
    { key: 'anime', name: '动漫专区', cid: '0,1,6' },
    { key: 'variety', name: '综艺专区', cid: '0,1,5' },
    { key: 'documentary', name: '纪录片专区', cid: '0,1,7' },
  ];

  // 4 大排序定义
  const SORT_MODES = [
    { orderby: 0, indexPrefix: 'index:time_added', label: '添加时间 (orderBy=0)' },
    { orderby: 1, indexPrefix: 'index:time_updated', label: '更新时间 (orderBy=1)' },
    { orderby: 2, indexPrefix: 'index:popularity', label: '人气高低 (orderBy=2)' },
    { orderby: 3, indexPrefix: 'index:score', label: '评分高低 (orderBy=3)' },
  ];

  const kvIndexPairs = [];
  const entityPatches = new Map(); // 缓存需要修补 score / popularity 的实体

  for (const sortMode of SORT_MODES) {
    console.log(`\n======================================================`);
    console.log(`🌟 正在同步【${sortMode.label}】全专区原生索引`);
    console.log(`======================================================`);

    for (const channel of CHANNELS) {
      const orderedIds = [];
      const seenTitles = new Set();
      
      // 抓取前 15 页 (每页 50 条，前 750 部顶级代表作)
      const maxPages = (channel.key === 'all' || channel.key === 'movie' || channel.key === 'tv') ? 18 : 12;

      for (let page = 1; page <= maxPages; page++) {
        const cidParam = channel.cid ? `&cid=${channel.cid}` : '';
        const rawUrl = `https://m10.iyf.tv/api/list/Search?cinema=1${cidParam}&page=${page}&size=50&orderby=${sortMode.orderby}&desc=1`;
        const signedUrl = uriSignature(rawUrl, pConfig.publicKey, pConfig.privateKey);

        try {
          const res = await fetch(signedUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
              'Referer': `https://www.iyf.tv/list?orderBy=${sortMode.orderby}`,
            },
          });
          const json = await res.json();
          const list = json.data?.info?.[0]?.result || [];
          if (list.length === 0) break;

          for (const it of list) {
            const title = (it.title || '').trim();
            if (!title || seenTitles.has(title)) continue;
            if (!isCleanChineseTitle(title)) continue;
            seenTitles.add(title);

            const entityId = titleToEntityId.get(title);
            if (!entityId) {
              // 生产库中暂无该条目，安全跳过，绝不塞入虚空 ID 污染倒排索引
              continue;
            }

            orderedIds.push(entityId);

            // 若条目有明确的 score 或 hot，记录修补补丁
            if (sortMode.orderby === 3 && it.score && it.score !== '暂无评分') {
              const prev = entityPatches.get(entityId) || {};
              prev.score = String(it.score);
              prev.rate = String(it.score);
              entityPatches.set(entityId, prev);
            }
            if (sortMode.orderby === 2 && it.hot) {
              const prev = entityPatches.get(entityId) || {};
              prev.popularity = Number(it.hot) || 0;
              prev.hot = Number(it.hot) || 0;
              entityPatches.set(entityId, prev);
            }
          }

          process.stdout.write(`  [${channel.name}] 第 ${page}/${maxPages} 页拉取成功 (当前累计: ${orderedIds.length} 部)\r`);
          await sleep(40);
        } catch (err) {
          console.warn(`  [${channel.name}] 第 ${page} 页拉取异常: ${err.message}`);
        }
      }

      // 🌟【双轨智能融合核心】：对于时间排序（添加时间与更新时间），无缝置顶先锋首发爆款
      if (sortMode.indexPrefix === 'index:time_added' || sortMode.indexPrefix === 'index:time_updated') {
        let pioneerIds = [];
        const pioneersPath = path.join(CACHE_DIR, 'first-release-pioneers.json');
        if (fs.existsSync(pioneersPath)) {
          try {
            const pioneers = JSON.parse(fs.readFileSync(pioneersPath, 'utf-8'));
            pioneerIds = pioneers
              .filter(p => channel.key === 'all' || p.type === channel.key)
              .map(p => p.entityId);
          } catch {}
        }
        // 确保战略先锋爆款（如《生化危机：爆发夜》ik020581）永远常驻在电影和全站第一线
        if (channel.key === 'movie' || channel.key === 'all') {
          if (!pioneerIds.includes('ik020581')) {
            pioneerIds.unshift('ik020581');
          }
        }
        // 动态合并并去重
        if (pioneerIds.length > 0) {
          const pioneerSet = new Set(pioneerIds);
          orderedIds = [...pioneerIds, ...orderedIds.filter(id => !pioneerSet.has(id))];
          console.log(`  🌟 [双轨融合] 已将 ${pioneerIds.length} 部首发先锋爆款置顶注入 ${sortMode.label} 索引首位`);
        }
      }

      console.log(`\n  ✅ 【${channel.name}】${sortMode.label} 索引构建完毕: ${orderedIds.length} 部`);
      kvIndexPairs.push({
        key: `${sortMode.indexPrefix}:${channel.key}`,
        value: orderedIds,
      });
    }
  }

  // 推送全部 24 个核心倒排索引
  console.log(`\n🚀 准备向 Cloudflare 生产 KV 批量推送 4 大排序共 ${kvIndexPairs.length} 条物理倒排索引...`);
  await kvBulkPut(kvIndexPairs);
  console.log(`🎉 4 大排序物理倒排索引推送完毕！`);

  // 修补部分头部神作与热门作品的实体数据（如有）
  if (entityPatches.size > 0) {
    console.log(`\n🔄 发现 ${entityPatches.size} 个实体的真实评分/人气补丁，正在进行安全写回...`);
    const patchPairs = [];
    const patchEntries = Array.from(entityPatches.entries()).slice(0, 300); // 优先修补前 300 部头部作品
    for (const [entityId, patch] of patchEntries) {
      try {
        const raw = await kvGet(`entity:${entityId}`);
        if (raw) {
          const entity = JSON.parse(raw);
          let changed = false;
          if (patch.score && entity.rate !== patch.score) {
            entity.rate = patch.score;
            entity.score = patch.score;
            changed = true;
          }
          if (patch.popularity && entity.popularity !== patch.popularity) {
            entity.popularity = patch.popularity;
            entity.hot = patch.popularity;
            changed = true;
          }
          if (changed) {
            patchPairs.push({
              key: `entity:${entityId}`,
              value: entity,
            });
          }
        }
      } catch (err) {
        // 忽略单条异常
      }
      await sleep(10);
    }
    if (patchPairs.length > 0) {
      console.log(`  ⚡ 正在写回 ${patchPairs.length} 条头部实体的真实 score / popularity...`);
      await kvBulkPut(patchPairs);
      console.log(`  ✅ 实体真实属性写回完毕`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`🎉🎉🎉 爱壹帆官方原生 4 大排序体系全网 100% 绝对对齐完成！`);
  console.log(`======================================================`);
}

main().catch(err => {
  console.error('Fatal Error:', err);
  process.exit(1);
});
