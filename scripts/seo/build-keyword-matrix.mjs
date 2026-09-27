#!/usr/bin/env node

/**
 * iKanPP 全站重点影视词库挖掘与优先级冲榜矩阵构建器
 * 
 * 严格对齐 docs/seo/ikanpp_seo_keyword_system.yaml：
 * 1. 自动抽取 GSC 真实排名在 4~25 位的高潜词 (Priority A)
 * 2. 自动抽取 全站 7 大专区正在热播或最新上线的头部影片 (Priority A/B)
 * 3. 自动生成意图簇 (线上看、免费完整版、4K、全集)
 * 4. 产出 lib/data/seo-priority-matrix.json，作为 AI 系统全自动定向赋能的指挥中枢
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

import { PREBAKED_HOME_DATA } from '../../lib/data/home-prebaked.ts';
import { PREBAKED_LATEST_TITLES } from '../../lib/data/latest-titles-prebaked.ts';
import { buildKeywordClusterForEntity } from '../../lib/services/seo-keyword-engine.ts';

// 1. 读取 GSC 高潜词
const hpPath = path.join(projectRoot, 'lib/data/seo-high-potential.json');
let gscKeywords = [];
if (fs.existsSync(hpPath)) {
  try {
    const raw = JSON.parse(fs.readFileSync(hpPath, 'utf8'));
    gscKeywords = raw.keywords || [];
  } catch {}
}

console.log('🚀 开始全站重点影视词库挖掘与冲榜矩阵构建...');
console.log(`📊 载入 GSC 官方实测高潜词: ${gscKeywords.length} 个`);

// 提取 GSC 中匹配的影视标题
const gscEntityMap = new Map();
for (const kw of gscKeywords) {
  // 提取关键词中的纯片名（去掉 "线上看"、"在线观看"、"电影" 等修饰词）
  const cleanTitle = kw.query
    .replace(/(?:线上看|線上看|在线观看|在線觀看|在线看|在線看|电影|電影|电视剧|電視劇|全集|完整版|免费|免費|下载|下載)/gi, '')
    .trim();

  if (cleanTitle && cleanTitle.length >= 2) {
    if (!gscEntityMap.has(cleanTitle)) {
      gscEntityMap.set(cleanTitle, {
        title: cleanTitle,
        pos: kw.pos,
        clicks: kw.clicks || 0,
        impressions: kw.impressions || 0,
        queries: [kw.query],
      });
    } else {
      const existing = gscEntityMap.get(cleanTitle);
      existing.queries.push(kw.query);
      existing.impressions += (kw.impressions || 0);
      existing.clicks += (kw.clicks || 0);
      existing.pos = Math.min(existing.pos, kw.pos);
    }
  }
}

// 2. 收集全网头部与最新重点影片
const candidateMap = new Map();

// 2.1 注入 GSC 高潜条目 (最高优先级)
for (const [title, item] of gscEntityMap.entries()) {
  candidateMap.set(title, {
    title,
    type: 'movie',
    gscPosition: item.pos,
    gscImpressions: item.impressions,
    gscClicks: item.clicks,
    isGscHighPotential: true,
  });
}

// 2.2 注入首页大厅热播焦点 (Top 30)
const homeRows = [
  ...(PREBAKED_HOME_DATA.heroBanners || []),
  ...(PREBAKED_HOME_DATA.movieRail || []),
  ...(PREBAKED_HOME_DATA.tvRail || []),
  ...(PREBAKED_HOME_DATA.animeRail || []),
];

for (const it of homeRows) {
  if (it?.title && !candidateMap.has(it.title)) {
    candidateMap.set(it.title, {
      title: it.title,
      type: it.type || 'tv',
      qualityBadge: it.qualityBadge,
      updateBadge: it.updateBadge,
      isTrending: true,
    });
  }
}

// 2.3 注入今日最新入库前 30 部
const latestRows = PREBAKED_LATEST_TITLES.all || [];
for (const it of latestRows.slice(0, 30)) {
  if (it?.title && !candidateMap.has(it.title)) {
    candidateMap.set(it.title, {
      title: it.title,
      type: it.type || 'tv',
      qualityBadge: it.qualityBadge,
      updateBadge: it.updateBadge,
      isTrending: false,
    });
  }
}

// 3. 构建意图簇并生成冲榜矩阵
const matrixList = [];
for (const item of candidateMap.values()) {
  const cluster = buildKeywordClusterForEntity(item);
  matrixList.push(cluster);
}

// 按优先级 A > B 排序，同级别按 GSC 曝光/排名优先
matrixList.sort((a, b) => {
  if (a.priority !== b.priority) {
    return a.priority.localeCompare(b.priority);
  }
  return 0;
});

const output = {
  lastUpdated: new Date().toISOString(),
  totalEntities: matrixList.length,
  priorityACount: matrixList.filter(m => m.priority === 'A').length,
  priorityBCount: matrixList.filter(m => m.priority === 'B').length,
  entities: matrixList,
};

const targetPath = path.join(projectRoot, 'lib/data/seo-priority-matrix.json');
fs.writeFileSync(targetPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`\n🎉 重点词冲榜矩阵生成完成！`);
console.log(`📁 输出文件: lib/data/seo-priority-matrix.json`);
console.log(`🔥 纳入重点影视: ${output.totalEntities} 部`);
console.log(`⚡ Priority A (临门一脚冲榜梯队): ${output.priorityACount} 部`);
console.log(`📈 Priority B (重要增长梯队): ${output.priorityBCount} 部`);
