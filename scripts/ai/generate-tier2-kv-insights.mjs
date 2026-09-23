#!/usr/bin/env node

/**
 * iKanPP Tier 2 全量片库 AI 深度资产提炼中枢 (Direct-to-KV Scale-Out Pipeline)
 * 
 * 核心目标：
 * 为前台全部剩余 377 部影视作品生成 7 大维度深度 AI 资产，
 * 0 膨胀代码包体积，全量直接注入生产 Cloudflare KV 实体库！
 * 
 * 特性：
 * 1. 本地断点续传：所有生成结果实时缓存于 scripts/ai/tier2-cache.json，防中断；
 * 2. 3 并发流水线：平稳高效调度本地 codex-proxy (gpt-5.6-sol)；
 * 3. 动态批次推流：每积攒 15 部，自动调用 Cloudflare KV Bulk API 推入生产环境；
 * 4. 自动建立港台译名反查索引：title:别名 -> entityId，通吃繁体流量。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// 加载 .env.local
const envLocalPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

import { PREBAKED_HOME_DATA } from '../../lib/data/home-prebaked.ts';
import { PREBAKED_LATEST_TITLES } from '../../lib/data/latest-titles-prebaked.ts';
import { PREBAKED_AI_INSIGHTS } from '../../lib/data/prebaked-ai-insights.ts';
import { generateAiComprehensiveInsights } from '../../lib/services/ai-seo.js';

const AI_MODEL = process.env.AI_MODEL || 'gpt-5.6-sol';
const CONCURRENCY = 3;
const KV_BULK_FLUSH_THRESHOLD = 15;

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const AUTH_EMAIL = process.env.CLOUDFLARE_AUTH_EMAIL;
const AUTH_KEY = process.env.CLOUDFLARE_AUTH_KEY;
const NAMESPACE_ID = process.env.CLOUDFLARE_KV_NAMESPACE_ID || '42311924427747deaf00981d99d58998';

if (!ACCOUNT_ID || !AUTH_KEY) {
  console.error('❌ 缺失 Cloudflare KV 生产凭据 (CLOUDFLARE_ACCOUNT_ID / CLOUDFLARE_AUTH_KEY)');
  process.exit(1);
}

const headers = {
  'Content-Type': 'application/json',
  ...(AUTH_EMAIL ? { 'X-Auth-Email': AUTH_EMAIL, 'X-Auth-Key': AUTH_KEY } : { 'Authorization': `Bearer ${AUTH_KEY}` })
};

const cacheFilePath = path.join(__dirname, 'tier2-cache.json');

function loadCache() {
  if (fs.existsSync(cacheFilePath)) {
    try {
      return JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
    } catch {}
  }
  return {};
}

function saveCache(cache) {
  fs.writeFileSync(cacheFilePath, JSON.stringify(cache, null, 2), 'utf8');
}

async function getKvValue(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  try {
    const res = await fetch(url, { headers });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    const text = await res.text();
    try {
      return JSON.parse(text);
    } catch {
      return text.trim();
    }
  } catch {
    return null;
  }
}

async function bulkPutKv(entries) {
  if (!entries || entries.length === 0) return;
  const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/bulk`;
  const res = await fetch(url, {
    method: 'PUT',
    headers,
    body: JSON.stringify(entries)
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    console.error(`⚠️ KV Bulk 写入失败: ${res.statusText} - ${txt}`);
  } else {
    console.log(`   🚀 [Cloudflare KV] 成功批量原子写入 ${entries.length} 条数据！`);
  }
}

async function flushToKv(items) {
  const bulkEntries = [];
  for (const { title, aiContent } of items) {
    try {
      let titleVal = await getKvValue(`title:${title}`);
      if (!titleVal) {
        const cleanTitle = title.replace(/\s+/g, '');
        titleVal = await getKvValue(`title:${cleanTitle}`);
      }

      let entityId = null;
      if (typeof titleVal === 'string' && titleVal.startsWith('ik')) {
        entityId = titleVal;
      } else if (titleVal && typeof titleVal === 'object' && titleVal.entityId) {
        entityId = titleVal.entityId;
      }

      if (entityId) {
        const fullEntity = await getKvValue(`entity:${entityId}`);
        if (fullEntity && typeof fullEntity === 'object') {
          fullEntity.aiContent = { ...(fullEntity.aiContent || {}), ...aiContent };

          const aliases = new Set(fullEntity.aliases || []);
          if (aiContent.taiwanTitle && aiContent.taiwanTitle !== title) {
            aliases.add(aiContent.taiwanTitle.trim());
            bulkEntries.push({
              key: `title:${aiContent.taiwanTitle.trim().toLowerCase()}`,
              value: entityId
            });
          }
          if (aiContent.hongkongTitle && aiContent.hongkongTitle !== title) {
            aliases.add(aiContent.hongkongTitle.trim());
            bulkEntries.push({
              key: `title:${aiContent.hongkongTitle.trim().toLowerCase()}`,
              value: entityId
            });
          }
          fullEntity.aliases = Array.from(aliases);

          bulkEntries.push({
            key: `entity:${entityId}`,
            value: JSON.stringify(fullEntity)
          });
        }
      } else {
        bulkEntries.push({
          key: `ai:title:${title}`,
          value: JSON.stringify(aiContent)
        });
      }
    } catch (e) {
      console.warn(`   ⚠️ 组装《${title}》KV 批次异常:`, e.message);
    }
  }

  if (bulkEntries.length > 0) {
    await bulkPutKv(bulkEntries);
  }
}

async function runPipeline() {
  console.log('========================================================');
  console.log('🚀 iKanPP Tier 2 全量片库 AI 深度资产提炼中枢启动');
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`🧠 调度模型: ${AI_MODEL} | 🚀 并发度: ${CONCURRENCY}`);
  console.log('========================================================\n');

  // 1. 汇聚全站前台影视作品
  const allMap = new Map();
  function addTitle(title, item, source) {
    if (!title) return;
    const t = title.trim();
    if (!allMap.has(t)) {
      allMap.set(t, {
        title: t,
        type: item.type || (item.episodes ? 'tv' : 'movie'),
        year: item.year || item.releaseDate?.slice(0, 4) || '2024',
        genres: item.genres || (item.category ? [item.category] : ['剧情']),
        overview: item.overview || item.plot || item.desc || '',
        source
      });
    }
  }

  for (const [key, section] of Object.entries(PREBAKED_HOME_DATA || {})) {
    if (Array.isArray(section)) {
      for (const item of section) addTitle(item.title, item, `home.${key}`);
    } else if (section && typeof section === 'object') {
      for (const [subKey, subList] of Object.entries(section)) {
        if (Array.isArray(subList)) {
          for (const item of subList) addTitle(item.title, item, `home.${key}.${subKey}`);
        }
      }
    }
  }

  for (const [cat, list] of Object.entries(PREBAKED_LATEST_TITLES || {})) {
    if (Array.isArray(list)) {
      for (const item of list) addTitle(item.title, item, `latest.${cat}`);
    }
  }

  const cache = loadCache();
  const cacheCount = Object.keys(cache).length;
  console.log(`📦 本地断点缓存已存在: ${cacheCount} 部已提炼作品`);

  // 过滤掉已在 Tier 1 (100部) 或已在缓存中的作品
  const pendingTitles = [];
  for (const [title, item] of allMap.entries()) {
    if (PREBAKED_AI_INSIGHTS[title]) continue;
    if (cache[title] && cache[title].hook && cache[title].uniqueSynopsis) continue;
    pendingTitles.push(item);
  }

  console.log(`📋 待提炼条目总数: ${pendingTitles.length} 部前台核心作品`);
  console.log(`⏱️ 预计执行耗时: 约 ${Math.ceil((pendingTitles.length / CONCURRENCY) * 44 / 60)} 分钟\n`);

  if (pendingTitles.length === 0) {
    console.log('🎉 所有前台影视条目均已完成 AI 深度资产提炼，无需重复处理！');
    return;
  }

  let successCount = 0;
  let uncommittedBatch = [];

  for (let i = 0; i < pendingTitles.length; i += CONCURRENCY) {
    const batch = pendingTitles.slice(i, i + CONCURRENCY);
    const batchStart = Date.now();
    const batchTitles = batch.map(b => `《${b.title}》`).join('、');
    const batchIndex = Math.floor(i / CONCURRENCY) + 1;
    const totalBatches = Math.ceil(pendingTitles.length / CONCURRENCY);

    console.log(`⏳ [批次 ${batchIndex}/${totalBatches}] 正在并发提炼: ${batchTitles}...`);

    const results = await Promise.allSettled(
      batch.map(async item => {
        const insight = await generateAiComprehensiveInsights({
          title: item.title,
          type: item.type,
          year: item.year,
          overview: item.overview,
          genres: item.genres,
          model: AI_MODEL,
        });

        const aiContent = {
          hook: insight.hook,
          uniqueSynopsis: insight.uniqueSynopsis,
          highlights: insight.highlights,
          characterAnalysis: insight.characterAnalysis,
          audienceFit: insight.audienceFit,
          faqs: insight.faqs,
          taiwanTitle: insight.taiwanTitle,
          hongkongTitle: insight.hongkongTitle,
          traditionalMetaDescription: `【4K線上看】《${item.title}》完整版高清免翻牆極速播放。iKanPP 全球 Anycast CDN 直連，零廣告零緩衝，即刻享受極致影音！`,
          traditionalKeywords: [item.title, `${item.title} 線上看`, `${item.title} 4K`],
          generatedAt: new Date().toISOString(),
        };

        return { title: item.title, aiContent };
      })
    );

    for (let rIdx = 0; rIdx < results.length; rIdx++) {
      const res = results[rIdx];
      const item = batch[rIdx];
      if (res.status === 'fulfilled') {
        const { title, aiContent } = res.value;
        cache[title] = aiContent;
        uncommittedBatch.push({ title, aiContent });
        successCount++;
        console.log(`   ✅ 《${title}》Hook: "${aiContent.hook}" (台: ${aiContent.taiwanTitle} | 港: ${aiContent.hongkongTitle})`);
      } else {
        console.error(`   ❌ 《${item.title}》提炼失败:`, res.reason?.message || res.reason);
      }
    }

    const batchDuration = ((Date.now() - batchStart) / 1000).toFixed(1);
    console.log(`🏁 批次完成，耗时 ${batchDuration}s，累计成功: ${successCount}/${pendingTitles.length}`);

    // 保存本地断点缓存
    saveCache(cache);

    // 达到阈值时批量推入 Cloudflare KV
    if (uncommittedBatch.length >= KV_BULK_FLUSH_THRESHOLD) {
      console.log(`\n📦 正在将积攒的 ${uncommittedBatch.length} 部新提炼资产写入生产 Cloudflare KV...`);
      await flushToKv(uncommittedBatch);
      uncommittedBatch = [];
      console.log('');
    }
  }

  // 写入剩余的待提交项
  if (uncommittedBatch.length > 0) {
    console.log(`\n📦 正在将剩余的 ${uncommittedBatch.length} 部资产写入生产 Cloudflare KV...`);
    await flushToKv(uncommittedBatch);
  }

  console.log('\n========================================================');
  console.log('🎉 Tier 2 全量前台影视 AI 深度资产提炼与 KV 注入圆满达成！');
  console.log(`📊 统计: 本次成功提炼并持久化 ${successCount} 部影视`);
  console.log(`💾 本地缓存路径: scripts/ai/tier2-cache.json`);
  console.log('========================================================');
}

runPipeline().catch(err => {
  console.error('💥 Tier 2 流水线异常中断:', err);
  process.exit(1);
});
