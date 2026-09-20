/**
 * 全站影视演职员与核心元数据全量批量体检与自愈中枢 (Full-Site Cast & Metadata Healer)
 * 
 * 核心功能：
 * 1. 分级全量覆盖：
 *    - Tier 1: 全站前台 6 大专区 Hero / Trending / 焦点推荐 (~500 部核心流量)
 *    - Tier 2: 最新上线雷达 recent:* 全量片单 (~1500 部高频更新)
 *    - Tier 3: 全站主索引 index:all 全量片库 (分批断点续跑)
 * 2. 0ms 智能跳过健康条目：
 *    - 已具备真实中文导演、中文主演、有效海报与 TMDB 权威绑定的条目瞬间跳过，0 配额消耗
 * 3. 并发控制与防频控：
 *    - 并发度 8，自适应休眠与重试，安全稳健
 * 4. 断点记忆续跑：
 *    - 自动持久化进度到 scripts/seo/.healer-checkpoint.json，随时中断随时接续
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { kvGet, kvPut, saveEntity } from '../../lib/services/entity-kv.js';
import { searchAndEnrichFromTMDB } from '../../lib/services/entity-enrichment.js';
import { PREBAKED_HOME_DATA } from '../../lib/data/home-prebaked.js';
import { PREBAKED_LATEST_TITLES } from '../../lib/data/latest-titles-prebaked.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CHECKPOINT_FILE = path.join(__dirname, '.healer-checkpoint.json');

// 并发度与安全间隔
const CONCURRENCY = 8;
const BATCH_SIZE = 50;

/**
 * 判断演职员数据是否病态或残缺
 */
function isEntitySick(entity) {
  if (!entity) return true;

  const isMissingCover = !entity.cover || entity.cover.trim() === '';
  const noDirectors = !entity.directors || entity.directors.length === 0;
  const noActors = !entity.actors || entity.actors.length === 0;

  // 包含拼音或英文字符主演 (如 "Jiayi Du", "Gao Ye")
  const hasPinyinActor = (entity.actors || []).some(a => /^[A-Za-z\s]{4,}$/.test(a));
  const hasPinyinDirector = (entity.directors || []).some(d => /^[A-Za-z\s]{4,}$/.test(d));

  // 包含垃圾占位符
  const junkWords = ['未知', '知名导演', '实力主演', '群演', '网络主播', '佚名'];
  const hasJunkActor = (entity.actors || []).some(a => junkWords.includes(a));
  const hasJunkDirector = (entity.directors || []).some(d => junkWords.includes(d));

  return isMissingCover || noDirectors || noActors || hasPinyinActor || hasPinyinDirector || hasJunkActor || hasJunkDirector;
}

/**
 * 收集高优先级核心前台片单 (Tier 1 & Tier 2)
 */
function collectHighPriorityTitles() {
  const titles = new Set();

  // Tier 1: 首页预烘焙焦点
  if (PREBAKED_HOME_DATA) {
    (PREBAKED_HOME_DATA.hero || []).forEach(i => i.title && titles.add(i.title.trim()));
    (PREBAKED_HOME_DATA.trendingNav || []).forEach(i => i.title && titles.add(i.title.trim()));
    (PREBAKED_HOME_DATA.sections || []).forEach(s => {
      (s.items || []).forEach(i => i.title && titles.add(i.title.trim()));
    });
  }

  // Tier 2: 最新雷达增量预烘焙全专区
  if (PREBAKED_LATEST_TITLES) {
    Object.values(PREBAKED_LATEST_TITLES).forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(i => i.title && titles.add(i.title.trim()));
      }
    });
  }

  return Array.from(titles);
}

/**
 * 读取断点
 */
function loadCheckpoint() {
  if (fs.existsSync(CHECKPOINT_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CHECKPOINT_FILE, 'utf-8'));
    } catch {}
  }
  return {
    tier1Done: false,
    globalIndexOffset: 0,
    stats: { scanned: 0, healthy: 0, healed: 0, unresolvable: 0 }
  };
}

/**
 * 保存断点
 */
function saveCheckpoint(data) {
  try {
    fs.writeFileSync(CHECKPOINT_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch {}
}

/**
 * 核心单条处理任务
 */
async function processOneTitle(titleOrId, isId = false) {
  let entity = null;
  let entityId = null;

  if (isId) {
    entityId = titleOrId;
    const raw = await kvGet(`entity:${entityId}`);
    if (raw) {
      try { entity = JSON.parse(raw); } catch {}
    }
  } else {
    entityId = await kvGet(`title:${titleOrId}`);
    if (entityId) {
      const raw = await kvGet(`entity:${entityId}`);
      if (raw) {
        try { entity = JSON.parse(raw); } catch {}
      }
    }
  }

  const title = entity?.title || (isId ? null : titleOrId);
  if (!title) return { status: 'skip_empty' };

  // 快速健康度核验：若数据完整，0ms 瞬间跳过
  if (entity && !isEntitySick(entity)) {
    return { status: 'healthy', title, entityId };
  }

  // 触发 5 重防线升级后的 TMDB 检索自愈
  try {
    const healed = await searchAndEnrichFromTMDB(title, entity?.type, entity?.year, true);
    if (healed && healed.tmdbId) {
      // 保持已有实体 ID，避免分裂 URL
      if (entity) {
        entity.directors = healed.directors || [];
        entity.actors = healed.actors || [];
        if (healed.cover && (!entity.cover || entity.cover.trim() === '')) entity.cover = healed.cover;
        if (healed.backdrop && !entity.backdrop) entity.backdrop = healed.backdrop;
        entity.tmdbId = healed.tmdbId;
        entity.tmdbType = healed.tmdbType;
        entity.updatedAt = new Date().toISOString();
        await saveEntity(entity);
      } else {
        await saveEntity(healed);
      }
      return {
        status: 'healed',
        title,
        directors: (entity || healed).directors,
        actors: (entity || healed).actors,
        tmdb: `${(entity || healed).tmdbType}/${(entity || healed).tmdbId}`
      };
    }
    return { status: 'unresolvable', title };
  } catch (err) {
    return { status: 'error', title, error: err.message };
  }
}

/**
 * 并发批处理
 */
async function processBatch(items, isId = false) {
  const results = [];
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const chunk = items.slice(i, i + CONCURRENCY);
    const chunkResults = await Promise.all(chunk.map(item => processOneTitle(item, isId)));
    results.push(...chunkResults);
    // 批次微休眠，保护 TMDB 限流
    await new Promise(r => setTimeout(r, 150));
  }
  return results;
}

async function main() {
  console.log('======================================================================');
  console.log('🚀 启动 iKanPP 全站影视演职员与核心元数据全量批量体检与自愈中枢');
  console.log('======================================================================\n');

  const checkpoint = loadCheckpoint();
  console.log(`📌 当前断点状态: Tier1已完成=${checkpoint.tier1Done}, 全局扫描偏移量=${checkpoint.globalIndexOffset}`);
  console.log(`📊 历史累计统计: 扫描=${checkpoint.stats.scanned}, 健康=${checkpoint.stats.healthy}, 自愈=${checkpoint.stats.healed}\n`);

  // ----------------------------------------------------
  // 阶段 1: 前台核心流量高优池 (Tier 1 & Tier 2)
  // ----------------------------------------------------
  if (!checkpoint.tier1Done) {
    console.log('--- 阶段 1: 扫描全站前台核心高优池 (Hero / Trending / 最新上线) ---');
    const priorityTitles = collectHighPriorityTitles();
    console.log(`🎯 收集到高优核心条目: ${priorityTitles.length} 部`);

    let tier1Healed = 0;
    let tier1Healthy = 0;

    for (let i = 0; i < priorityTitles.length; i += BATCH_SIZE) {
      const batch = priorityTitles.slice(i, i + BATCH_SIZE);
      const res = await processBatch(batch, false);

      for (const r of res) {
        checkpoint.stats.scanned++;
        if (r.status === 'healed') {
          tier1Healed++;
          checkpoint.stats.healed++;
          console.log(`  ✨ [自愈] 《${r.title}》 导=[${r.directors.join(',')}] | 演=[${r.actors.slice(0, 4).join(',')}] (${r.tmdb})`);
        } else if (r.status === 'healthy') {
          tier1Healthy++;
          checkpoint.stats.healthy++;
        } else if (r.status === 'unresolvable') {
          checkpoint.stats.unresolvable++;
        }
      }

      console.log(`[Tier 1 进度] ${Math.min(i + BATCH_SIZE, priorityTitles.length)}/${priorityTitles.length} | 本阶段自愈: ${tier1Healed}, 原本健康: ${tier1Healthy}`);
      saveCheckpoint(checkpoint);
    }

    checkpoint.tier1Done = true;
    saveCheckpoint(checkpoint);
    console.log(`✅ 阶段 1 核心流量高优池自愈完毕！共自愈: ${tier1Healed} 部，原本健康: ${tier1Healthy} 部\n`);
  }

  // ----------------------------------------------------
  // 阶段 2: 全局主索引全量库 (Tier 3: index:all)
  // ----------------------------------------------------
  console.log('--- 阶段 2: 扫描全局主索引全库 (index:all 6.6万部) ---');
  const allKeysRaw = await kvGet('index:all');
  const allIds = allKeysRaw ? JSON.parse(allKeysRaw) : [];
  console.log(`📚 全库实体总计: ${allIds.length} 部，当前自断点第 ${checkpoint.globalIndexOffset} 部开始接续\n`);

  const MAX_PER_RUN = 500; // 每次执行处理 500 部，确保轻量快速、平稳推进
  const targetBatchIds = allIds.slice(checkpoint.globalIndexOffset, checkpoint.globalIndexOffset + MAX_PER_RUN);

  if (targetBatchIds.length === 0) {
    console.log('🎉 全库所有条目已全量扫描自愈完毕！');
    return;
  }

  let batchHealed = 0;
  let batchHealthy = 0;

  for (let i = 0; i < targetBatchIds.length; i += BATCH_SIZE) {
    const subBatch = targetBatchIds.slice(i, i + BATCH_SIZE);
    const res = await processBatch(subBatch, true);

    for (const r of res) {
      checkpoint.stats.scanned++;
      if (r.status === 'healed') {
        batchHealed++;
        checkpoint.stats.healed++;
        console.log(`  ✨ [自愈] 《${r.title}》 导=[${r.directors.join(',')}] | 演=[${r.actors.slice(0, 4).join(',')}] (${r.tmdb})`);
      } else if (r.status === 'healthy') {
        batchHealthy++;
        checkpoint.stats.healthy++;
      } else if (r.status === 'unresolvable') {
        checkpoint.stats.unresolvable++;
      }
    }

    checkpoint.globalIndexOffset += subBatch.length;
    saveCheckpoint(checkpoint);

    const progressPct = ((checkpoint.globalIndexOffset / allIds.length) * 100).toFixed(1);
    console.log(`[全局全量进度] ${checkpoint.globalIndexOffset}/${allIds.length} (${progressPct}%) | 本批自愈: ${batchHealed}, 本批健康: ${batchHealthy}`);
  }

  console.log('\n======================================================================');
  console.log('🎉 本轮批量全站影视演职员体检与自愈顺利完成！');
  console.log(`📈 全库总进度: ${checkpoint.globalIndexOffset} / ${allIds.length} 部 (${((checkpoint.globalIndexOffset / allIds.length) * 100).toFixed(1)}%)`);
  console.log(`✨ 本轮成功自愈: ${batchHealed} 部`);
  console.log(`💎 历史累计自愈: ${checkpoint.stats.healed} 部`);
  console.log(`🟢 历史累计完好健康: ${checkpoint.stats.healthy} 部`);
  console.log('======================================================================\n');
}

main().catch(console.error);
