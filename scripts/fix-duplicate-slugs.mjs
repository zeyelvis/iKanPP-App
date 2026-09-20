#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 🛠️ 历史错配 Slug 与重复影片 URL 权威合并自愈脚本
 * 
 * 功能：
 * 1. 针对《年会不能停2》等被 GSC 报警的多 ID / 历史错位 URL，建立永久权威映射；
 * 2. 将所有历史错位 slug（如 ik000024-年会不能停-2, ik000025-..., ik000026-...）
 *    及临时 ID slug（ik_radar_movie_5, ik_radar_all_14, 36850814）
 *    全部在 Cloudflare KV 中建立 slug:* -> ik277239 别名索引；
 * 3. 确保实体本体具备 canonicalSlug: "ik277239-年会不能停-2"；
 * 4. 配合服务端的 301 规范重定向引擎，促使 Google 爬虫自动合并页面并转移全部权重。
 */

const CF_KV_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = process.env.CLOUDFLARE_API_KEY || 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const CF_KV_EMAIL = process.env.CLOUDFLARE_EMAIL || 'zeyelvis@gmail.com';

const headers = {
  'X-Auth-Email': CF_KV_EMAIL,
  'X-Auth-Key': CF_KV_API_KEY,
  'Content-Type': 'application/json',
};

async function kvGet(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`KV Get ${key} HTTP ${res.status}`);
    }
    return await res.text();
  } catch (err) {
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
  if (!res.ok) {
    throw new Error(`KV Put ${key} HTTP ${res.status}`);
  }
  return true;
}

async function main() {
  console.log('🚀 开始执行历史错配 Slug 与重复影片 URL 权威修复...');

  // 1. 检查实体 ik277239《年会不能停！2》
  console.log('\n🔍 [步骤 1] 检查权威实体 ik277239...');
  let rawEntity = await kvGet('entity:ik277239');
  let entity = null;
  if (rawEntity) {
    try {
      entity = JSON.parse(rawEntity);
      console.log(`✅ 找到实体: ${entity.title} (${entity.year}), 当前 canonicalSlug: ${entity.canonicalSlug || '未设置'}`);
    } catch (e) {
      console.error('❌ 解析 entity:ik277239 失败:', e);
    }
  } else {
    console.log('⚠️ entity:ik277239 不存在，将从现有数据创建或初始化...');
  }

  // 权威规范 Slug
  const canonicalSlug = 'ik277239-年会不能停-2';

  if (!entity) {
    entity = {
      entityId: 'ik277239',
      tmdbId: '1541125',
      tmdbType: 'movie',
      title: '年会不能停！2',
      originalTitle: '年会不能停！2',
      slug: '年会不能停-2',
      canonicalSlug: canonicalSlug,
      type: 'movie',
      year: '2026',
      cover: 'https://image.tmdb.org/t/p/w500/pD4ItmNxCXcXjAX4KNQLQCMHDjb.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/x8FmUv8INF7E5fkP2Jm9KLfk87Q.jpg',
      rate: '7.0',
      genres: ['喜剧', '剧情', '电影'],
      directors: ['董润年'],
      actors: ['张若昀', '白客', '高叶'],
      description: '2026 院线爆笑喜剧。由董润年执导，张若昀 / 白客 / 高叶联袂呈现。全网多源纯直连超清速播，画质高清流畅，尽在 iKanPP 爱看片片。',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } else {
    entity.canonicalSlug = canonicalSlug;
    entity.slug = '年会不能停-2';
    entity.updatedAt = new Date().toISOString();
  }

  // 保存权威实体
  await kvPut('entity:ik277239', JSON.stringify(entity));
  console.log(`✅ 实体 entity:ik277239 已写入/更新，canonicalSlug 设为: ${canonicalSlug}`);

  // 2. 映射历史所有可能产生的错配与临时 Slug 到 ik277239
  console.log('\n🔗 [步骤 2] 写入权威别名与历史错配映射到生产 KV...');
  const slugsToMap = [
    // 标准规范 slug 与衍生
    'ik277239',
    'ik277239-年会不能停-2',
    'ik277239-年会不能停2',
    'ik277239-年会不能停！2',
    encodeURIComponent('ik277239-年会不能停-2').toLowerCase(),
    encodeURIComponent('ik277239-年会不能停2').toLowerCase(),

    // GSC 报警的历史错位 ID（曾被爬虫抓取）
    'ik000024-年会不能停-2',
    'ik000025-年会不能停-2',
    'ik000026-年会不能停-2',
    'ik000024-年会不能停2',
    'ik000025-年会不能停2',
    'ik000026-年会不能停2',
    encodeURIComponent('ik000024-年会不能停-2').toLowerCase(),
    encodeURIComponent('ik000025-年会不能停-2').toLowerCase(),
    encodeURIComponent('ik000026-年会不能停-2').toLowerCase(),

    // 历史雷达临时 ID
    'ik_radar_movie_5',
    'ik_radar_movie_5-年会不能停-2',
    'ik_radar_movie_5-年会不能停2',
    'ik_radar_movie_5-%e5%b9%b4%e4%bc%9a%e4%b8%8d%e8%83%bd%e5%81%9c2',
    'ik_radar_all_14',
    'ik_radar_all_14-年会不能停-2',
    'ik_radar_all_14-年会不能停2',
    'ik_radar_all_14-%e5%b9%b4%e4%bc%9a%e4%b8%8d%e8%83%bd%e5%81%9c2',

    // 豆瓣 ID
    '36850814',
    '36850814-年会不能停-2',
    '36850814-年会不能停2',

    // 纯片名短链
    '年会不能停2',
    '年会不能停-2',
    '年会不能停！2',
    encodeURIComponent('年会不能停2').toLowerCase(),
    encodeURIComponent('年会不能停-2').toLowerCase(),
    encodeURIComponent('年会不能停！2').toLowerCase(),
  ];

  let mappedCount = 0;
  for (const s of slugsToMap) {
    const key = `slug:${s.toLowerCase()}`;
    await kvPut(key, 'ik277239');
    mappedCount++;
  }
  console.log(`✅ 已成功写入 ${mappedCount} 条 slug 别名映射到生产 KV`);

  // 3. 写入标题索引
  console.log('\n🏷️ [步骤 3] 写入标题归一化索引...');
  const titlesToMap = [
    '年会不能停2',
    '年会不能停！2',
    '年会不能停-2',
  ];
  for (const t of titlesToMap) {
    // 归一化键
    const norm = t.toLowerCase().replace(/[（(][^）)]*[）)]/g, '').replace(/[【\[][^】\]]*[】\]]/g, '').replace(/\s+/g, '').replace(/[^\w\u4e00-\u9fa5]/g, '');
    if (norm) {
      await kvPut(`title:${norm}`, 'ik277239');
      console.log(`  title:${norm} -> ik277239`);
    }
    await kvPut(`title:${t.trim()}`, 'ik277239');
  }

  // 4. 写入 TMDB 索引
  console.log('\n🎬 [步骤 4] 写入 TMDB 反向索引...');
  await kvPut('tmdb:movie:1541125', 'ik277239');
  console.log('  tmdb:movie:1541125 -> ik277239');

  console.log('\n🎉 [全部完成] 权威合并索引与 301 重定向基石已成功加固！');
}

main().catch(err => {
  console.error('❌ 执行异常:', err);
  process.exit(1);
});
