/**
 * 全站影视详情页与演职员健康度深度体检与自愈中枢
 * 
 * 核心目标：
 * 1. 扫描片库核心前台热门影视（首页大厅、各专区、热门搜索、最新收录）
 * 2. 识别缺失演职员（directors/actors为空）或存在拼音群演脏数据的条目
 * 3. 借助升级后的 5 重防线 TMDB 权威算法（类型强匹配、华语原生压倒性加分、动画隔离、年份容差）
 *    全自动清洗并回填真实官方权威导演、全明星主演、4K 剧照与 TMDB ID！
 */

import { kvGet, kvPut, saveEntity } from '../../lib/services/entity-kv.js';
import { searchAndEnrichFromTMDB } from '../../lib/services/entity-enrichment.js';
import { PREBAKED_HOME_DATA } from '../../lib/data/home-prebaked.js';
import { PREBAKED_LATEST_TITLES } from '../../lib/data/latest-titles-prebaked.js';

function collectHighPriorityTitles() {
  const titles = new Set();

  // 1. 首页各板块热门影视
  if (PREBAKED_HOME_DATA) {
    (PREBAKED_HOME_DATA.hero || []).forEach(i => i.title && titles.add(i.title.trim()));
    (PREBAKED_HOME_DATA.trendingNav || []).forEach(i => i.title && titles.add(i.title.trim()));
    (PREBAKED_HOME_DATA.sections || []).forEach(s => {
      (s.items || []).forEach(i => i.title && titles.add(i.title.trim()));
    });
  }

  // 2. 最新上线雷达前台片库
  if (PREBAKED_LATEST_TITLES) {
    Object.values(PREBAKED_LATEST_TITLES).forEach(list => {
      if (Array.isArray(list)) {
        list.forEach(i => i.title && titles.add(i.title.trim()));
      }
    });
  }

  return Array.from(titles);
}

async function main() {
  console.log('====================================================');
  console.log('🩺 启动全站核心影视详情页与演职员健康度体检自愈工程');
  console.log('====================================================\n');

  const targets = collectHighPriorityTitles();
  console.log(`📋 收集到高优先级前台核心影视条目: ${targets.length} 部\n`);

  let checkedCount = 0;
  let healedCount = 0;
  let alreadyHealthyCount = 0;
  let notFoundCount = 0;

  for (const title of targets) {
    checkedCount++;
    const entityId = await kvGet(`title:${title}`);
    let entity = null;
    if (entityId) {
      const raw = await kvGet(`entity:${entityId}`);
      if (raw) {
        try { entity = JSON.parse(raw); } catch {}
      }
    }

    const hasDirectors = entity?.directors && entity.directors.length > 0;
    const hasActors = entity?.actors && entity.actors.length > 0;
    const hasPinyin = (entity?.actors || []).some(a => /^[A-Za-z\s]{4,}$/.test(a));
    const isMissingCover = !entity?.cover || entity.cover.trim() === '';

    // 如果健康度完好，跳过
    if (entity && hasDirectors && hasActors && !hasPinyin && !isMissingCover) {
      alreadyHealthyCount++;
      continue;
    }

    console.log(`[${checkedCount}/${targets.length}] 发现需自愈条目: 《${title}》 (ID: ${entityId || '待分配'})`);
    if (!hasDirectors && !hasActors) console.log(`   ⚠️ 演职员完全缺失`);
    if (hasPinyin) console.log(`   ⚠️ 包含拼音/杂乱演员数据: ${entity.actors.join(', ')}`);

    try {
      // 触发 5 重防线 TMDB 权威拉取
      const healed = await searchAndEnrichFromTMDB(title, entity?.type, entity?.year, true);
      if (healed) {
        healedCount++;
        console.log(`   ✅ 成功自愈: 导演=[${healed.directors.join(', ')}] | 主演=[${healed.actors.slice(0, 4).join(', ')}] (TMDB: ${healed.tmdbType}/${healed.tmdbId})`);
      } else {
        notFoundCount++;
        console.log(`   ⚪ TMDB 未检索到权威对应项，保持兜底`);
      }
    } catch (err) {
      console.warn(`   ❌ 自愈出错:`, err.message);
    }

    // 适度休眠，避免击穿 TMDB 频控
    await new Promise(r => setTimeout(r, 200));
  }

  console.log('\n====================================================');
  console.log('🎉 全站核心影视详情页体检自愈完成！');
  console.log(`📊 总巡检: ${checkedCount} 部`);
  console.log(`✨ 本身完好健康: ${alreadyHealthyCount} 部`);
  console.log(`💉 成功深度自愈: ${healedCount} 部`);
  console.log(`⚪ 维持原样: ${notFoundCount} 部`);
  console.log('====================================================\n');
}

main().catch(console.error);
