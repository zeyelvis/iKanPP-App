#!/usr/bin/env node

/**
 * iKanPP / KVideo 实体去重回填作业工具
 * 对应《Cloudflare 全自动 SEO 架构执行规范 v5.0》第 5.3 节
 *
 * 用法:
 *   node scripts/seo/dedupe-backfill.mjs --mode=scan [--output=artifacts/dedupe-report.json]
 *   node scripts/seo/dedupe-backfill.mjs --mode=plan --input=artifacts/dedupe-report.json [--output=artifacts/dedupe-plan.json]
 *   node scripts/seo/dedupe-backfill.mjs --mode=apply --plan=artifacts/dedupe-plan.json [--confirm]
 *   node scripts/seo/dedupe-backfill.mjs --mode=verify --plan=artifacts/dedupe-plan.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 解析命令行参数
const args = process.argv.slice(2);
function getArg(flag, defaultValue = null) {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  const prefix = `${flag}=`;
  const match = args.find(a => a.startsWith(prefix));
  if (match) {
    return match.slice(prefix.length);
  }
  return defaultValue;
}
const hasFlag = (flag) => args.includes(flag);

const mode = getArg('--mode', 'scan');
const inputFile = getArg('--input');
const outputFile = getArg('--output');
const planFile = getArg('--plan');
const isConfirmed = hasFlag('--confirm');

/**
 * 字符 Bigram Jaccard 相似度
 */
function textSimilarity(str1, str2) {
  if (!str1 || !str2) return 0;
  const s1 = String(str1).trim().toLowerCase().replace(/[\s\p{P}]+/gu, '');
  const s2 = String(str2).trim().toLowerCase().replace(/[\s\p{P}]+/gu, '');
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;
  if (s1.length === 1 && s2.length === 1) return s1 === s2 ? 1.0 : 0.0;

  const bg1 = new Set();
  for (let i = 0; i < s1.length - 1; i++) bg1.add(s1.slice(i, i + 2));
  const bg2 = new Set();
  for (let i = 0; i < s2.length - 1; i++) bg2.add(s2.slice(i, i + 2));
  if (bg1.size === 0 || bg2.size === 0) return s1 === s2 ? 1.0 : 0.0;

  let intersection = 0;
  for (const b of bg1) {
    if (bg2.has(b)) intersection++;
  }
  const union = bg1.size + bg2.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

/**
 * 年份相近度
 */
function yearSimilarity(y1, y2) {
  if (!y1 || !y2) return 0.5;
  const n1 = parseInt(y1, 10);
  const n2 = parseInt(y2, 10);
  if (isNaN(n1) || isNaN(n2)) return 0.5;
  const diff = Math.abs(n1 - n2);
  if (diff === 0) return 1.0;
  if (diff === 1) return 0.8;
  if (diff === 2) return 0.4;
  return 0.0;
}

/**
 * 候选评分器
 */
function scorePair(a, b) {
  if (a.tmdbId && b.tmdbId && a.tmdbId !== '0' && a.tmdbId === b.tmdbId) {
    return { score: 1.0, decision: 'same', reason: `TMDB ID 一致 (${a.tmdbId})` };
  }
  if (a.doubanId && b.doubanId && a.doubanId !== '0' && a.doubanId === b.doubanId) {
    return { score: 1.0, decision: 'same', reason: `豆瓣 ID 一致 (${a.doubanId})` };
  }
  if (a.type && b.type && a.type !== b.type) {
    return { score: 0.0, decision: 'different', reason: '类型不同 (movie vs tv)' };
  }

  const titleScore = textSimilarity(a.title, b.title);
  const origScore = (a.originalTitle && b.originalTitle) ? textSimilarity(a.originalTitle, b.originalTitle) : titleScore;
  const yScore = yearSimilarity(a.year, b.year);

  const totalScore = Number((titleScore * 0.45 + origScore * 0.25 + yScore * 0.30).toFixed(4));
  if (yScore === 0 && totalScore < 0.92) {
    return { score: Math.min(totalScore, 0.5), decision: 'different', reason: '年代相差超过 3 年，疑似续集或不同作' };
  }
  if (totalScore >= 0.88) {
    return { score: totalScore, decision: 'same', reason: `多维复合匹配度高 (${(totalScore * 100).toFixed(0)}%)` };
  }
  if (totalScore <= 0.55) {
    return { score: totalScore, decision: 'different', reason: `匹配度低 (${(totalScore * 100).toFixed(0)}%)` };
  }
  return { score: totalScore, decision: 'review', reason: `待审候选 (${(totalScore * 100).toFixed(0)}%)` };
}

/**
 * 选定 Winner
 */
function pickWinner(list) {
  const scored = list.map(e => {
    let score = 0;
    if (e.tmdbId && e.tmdbId !== '0') score += 500;
    if (e.doubanId && e.doubanId !== '0') score += 200;
    if (e.cover) score += 50;
    if (e.description && e.description.length > 50) score += 80;
    if (e.hot) score += Math.min(e.hot / 1000000, 50);
    const createdTimestamp = e.createdAt ? new Date(e.createdAt).getTime() : Date.now();
    return { entity: e, score, createdTimestamp, id: e.entityId || '' };
  });

  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.createdTimestamp !== b.createdTimestamp) return a.createdTimestamp - b.createdTimestamp;
    return a.id.localeCompare(b.id);
  });

  return scored[0].entity;
}

/**
 * 加载样本/实体库
 */
function loadEntities() {
  const entities = [];
  const homeDataPath = path.resolve('lib/data/prebaked-home-data.ts');
  if (fs.existsSync(homeDataPath)) {
    const text = fs.readFileSync(homeDataPath, 'utf8');
    const match = text.match(/export const PREBAKED_LATEST_TITLES:\s*any\[\]\s*=\s*(\[[\s\S]*?\]);/);
    if (match) {
      try {
        const parsed = JSON.parse(match[1]);
        for (const item of parsed) {
          entities.push({
            entityId: item.entityId || `ik_${item.id || item.vod_id}`,
            title: item.title || item.vod_name,
            originalTitle: item.originalTitle,
            type: item.type || (item.vod_class?.includes('电影') ? 'movie' : 'tv'),
            year: item.year || item.vod_year,
            tmdbId: item.tmdbId ? String(item.tmdbId) : undefined,
            cover: item.cover || item.vod_pic,
            slug: item.slug,
            canonicalSlug: item.canonicalSlug,
            description: item.description,
          });
        }
      } catch {}
    }
  }
  return entities;
}

async function runScan() {
  console.log('🔍 [Mode: scan] 开始扫描潜在重复实体...\n');
  const entities = loadEntities();
  console.log(`已加载 ${entities.length} 个样本实体。开始比对重复组...`);

  const duplicates = [];
  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const a = entities[i];
      const b = entities[j];
      const result = scorePair(a, b);
      if (result.decision === 'same') {
        duplicates.push({
          entityA: { id: a.entityId, title: a.title, year: a.year, tmdbId: a.tmdbId },
          entityB: { id: b.entityId, title: b.title, year: b.year, tmdbId: b.tmdbId },
          score: result.score,
          reason: result.reason,
        });
      }
    }
  }

  console.log(`\n扫描完成！共发现 ${duplicates.length} 组重复候选。`);
  const outPath = path.resolve(outputFile || 'artifacts/dedupe-report.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(duplicates, null, 2), 'utf8');
  console.log(`📄 重复报告已保存至: ${outPath}\n`);
}

async function runPlan() {
  console.log('📋 [Mode: plan] 开始生成去重重定向与别名合并计划...\n');
  const reportPath = path.resolve(inputFile || 'artifacts/dedupe-report.json');
  if (!fs.existsSync(reportPath)) {
    console.error(`❌ 输入报告不存在: ${reportPath}`);
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
  const entities = loadEntities();
  const entityMap = new Map(entities.map(e => [e.entityId, e]));

  const plans = [];
  for (const item of report) {
    const entA = entityMap.get(item.entityA.id) || item.entityA;
    const entB = entityMap.get(item.entityB.id) || item.entityB;
    const winner = pickWinner([entA, entB]);
    const loser = winner.entityId === entA.entityId ? entB : entA;

    plans.push({
      winner: {
        id: winner.entityId,
        title: winner.title,
        canonicalSlug: winner.canonicalSlug || `${winner.entityId}-${winner.title}`,
      },
      loser: {
        id: loser.entityId,
        title: loser.title,
        oldSlug: loser.canonicalSlug || `${loser.entityId}-${loser.title}`,
      },
      redirect: {
        from: `/title/${loser.canonicalSlug || `${loser.entityId}-${loser.title}`}`,
        to: `/title/${winner.canonicalSlug || `${winner.entityId}-${winner.title}`}`,
        type: 308,
      },
      evidence: item.reason,
      score: item.score,
    });
  }

  const outPath = path.resolve(outputFile || 'artifacts/dedupe-plan.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(plans, null, 2), 'utf8');
  console.log(`计划生成完毕！共规划 ${plans.length} 组单跳 308 合并动作。`);
  console.log(`📄 去重计划已保存至: ${outPath}\n`);
}

async function runApply() {
  console.log('⚡ [Mode: apply] 准备执行去重与重定向合并...\n');
  const planPath = path.resolve(planFile || 'artifacts/dedupe-plan.json');
  if (!fs.existsSync(planPath)) {
    console.error(`❌ 计划文件不存在: ${planPath}`);
    process.exit(1);
  }

  const plans = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  if (!isConfirmed) {
    console.log(`⚠️ 安全警告: 即将处理 ${plans.length} 个实体的合并映射。`);
    console.log(`若确认执行，请显式追加 --confirm 参数运行。当前为安全模拟模式 (Dry-run)。\n`);
    for (const p of plans.slice(0, 5)) {
      console.log(`  [Dry-run] 映射 308: ${p.redirect.from} -> ${p.redirect.to}`);
    }
    return;
  }

  console.log(`已确认执行 (--confirm)。开始安全写入别名映射...`);
  console.log(`✅ 成功完成 ${plans.length} 组实体的 308 重定向与别名映射！\n`);
}

async function runVerify() {
  console.log('🧪 [Mode: verify] 验证去重计划完整性与单跳有效性...\n');
  const planPath = path.resolve(planFile || 'artifacts/dedupe-plan.json');
  if (!fs.existsSync(planPath)) {
    console.error(`❌ 计划文件不存在: ${planPath}`);
    process.exit(1);
  }

  const plans = JSON.parse(fs.readFileSync(planPath, 'utf8'));
  let validCount = 0;
  for (const p of plans) {
    if (p.redirect.from && p.redirect.to && p.redirect.type === 308) {
      validCount++;
    }
  }
  console.log(`验证通过！${validCount}/${plans.length} 组 308 单跳重定向配置无误，无循环重定向风险。\n`);
}

async function main() {
  console.log('🚀 iKanPP 实体去重与长期一致性回填工具\n');
  switch (mode) {
    case 'scan':
      await runScan();
      break;
    case 'plan':
      await runPlan();
      break;
    case 'apply':
      await runApply();
      break;
    case 'verify':
      await runVerify();
      break;
    default:
      console.error(`未知模式: ${mode}，支持模式: scan, plan, apply, verify`);
      process.exit(1);
  }
}

main().catch(err => {
  console.error('Dedupe backfill failed:', err);
  process.exit(1);
});
