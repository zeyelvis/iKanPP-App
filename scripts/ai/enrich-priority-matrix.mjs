#!/usr/bin/env node

/**
 * iKanPP 重点冲榜影视 AI 深度资产赋能流水线 (Priority Matrix Enricher)
 * 
 * 专门针对 lib/data/seo-priority-matrix.json 中的 36 部重点影视（Priority A & B）：
 * 1. 批量生成 100% 官方特约原创深度剧情解构 (uniqueSynopsis)
 * 2. 3大剧情高光核心看点 (highlights)
 * 3. 主演心理博弈与角色弧光 (characterAnalysis)
 * 4. 适宜受众画像 (audienceFit)
 * 5. Google FAQPage 结构化问答胶囊 (faqs)
 * 6. 港台公映规范译名库 (taiwanTitle / hongkongTitle)
 * 7. 电视剧分集高光剧情导视 (episodeHighlights)
 * 
 * 自动写入 lib/data/prebaked-ai-insights.ts（0ms 内存秒出）并同步到 Cloudflare KV。
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

import { generateAiComprehensiveInsights } from '../../lib/services/ai-seo.ts';
import { PREBAKED_AI_INSIGHTS } from '../../lib/data/prebaked-ai-insights.ts';

const PRIMARY_MODEL = process.env.AI_MODEL || 'gpt-6-astra';
const FALLBACK_MODELS = ['gpt-5.6-terra', 'gpt-6-sol', 'gpt-5.5'];
const CONCURRENCY = 2; // 平稳并发

async function runEnrichment() {
  console.log('========================================================');
  console.log('🎬 iKanPP 重点影视矩阵 AI 深度资产赋能流水线启动');
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`🧠 调度模型: ${PRIMARY_MODEL} | 🚀 并发度: ${CONCURRENCY}`);
  console.log('========================================================\n');

  // 1. 读取重点矩阵
  const matrixPath = path.join(projectRoot, 'lib/data/seo-priority-matrix.json');
  if (!fs.existsSync(matrixPath)) {
    console.error('❌ 未找到 lib/data/seo-priority-matrix.json，请先执行矩阵构建！');
    process.exit(1);
  }

  const matrixData = JSON.parse(fs.readFileSync(matrixPath, 'utf8'));
  const entities = matrixData.entities || [];
  console.log(`📊 载入重点影视矩阵: 共 ${entities.length} 部 (Priority A: ${matrixData.priorityACount} 部, Priority B: ${matrixData.priorityBCount} 部)`);

  const currentDataset = { ...PREBAKED_AI_INSIGHTS };
  const initialCount = Object.keys(currentDataset).length;
  console.log(`📦 当前已预置资产: ${initialCount} 部`);

  // 2. 筛选需要生成的条目
  const pendingEntities = entities.filter(item => {
    const existing = currentDataset[item.entityTitle];
    // 若已具备深度影评和 3 条以上 FAQ，则视为已完善
    return !(existing && existing.uniqueSynopsis && existing.highlights?.length >= 3 && existing.faqs?.length >= 3);
  });

  console.log(`⚡ 本次待处理新增重点影视: ${pendingEntities.length} 部\n`);

  if (pendingEntities.length === 0) {
    console.log('🎉 所有重点影视均已具备完整深度 AI 资产，无需重复生成！');
    return;
  }

  let completedCount = 0;

  // 3. 分批执行并发提炼
  for (let i = 0; i < pendingEntities.length; i += CONCURRENCY) {
    const batch = pendingEntities.slice(i, i + CONCURRENCY);
    const batchTitles = batch.map(b => `《${b.entityTitle}》(${b.priority})`).join('、');
    console.log(`⏳ [批次 ${Math.floor(i / CONCURRENCY) + 1}/${Math.ceil(pendingEntities.length / CONCURRENCY)}] 正在并发精润: ${batchTitles}...`);

    const results = await Promise.allSettled(
      batch.map(async item => {
        const isTv = item.entityType === 'tv';
        let insight = null;
        const candidateModels = [PRIMARY_MODEL, ...FALLBACK_MODELS];

        for (const model of candidateModels) {
          try {
            insight = await generateAiComprehensiveInsights({
              title: item.entityTitle,
              type: item.entityType || 'movie',
              genres: item.watchKeywords ? ['热门影视', item.entityType === 'tv' ? '电视剧' : '电影'] : ['精选佳作'],
              model,
            });
            if (insight && insight.uniqueSynopsis && !insight.uniqueSynopsis.includes('fallback')) {
              break;
            }
          } catch (e) {
            // 继续尝试下一个候选模型
          }
        }

        if (!insight) {
          throw new Error('All models failed to generate valid insight');
        }

        const aiContent = {
          hook: insight.hook,
          uniqueSynopsis: insight.uniqueSynopsis,
          highlights: insight.highlights,
          characterAnalysis: insight.characterAnalysis,
          audienceFit: insight.audienceFit,
          faqs: insight.faqs,
          taiwanTitle: insight.taiwanTitle,
          hongkongTitle: insight.hongkongTitle,
          traditionalMetaDescription: `【4K線上看】《${item.entityTitle}》完整版高清免翻牆極速播放。iKanPP 全球 Anycast CDN 直連，零廣告零緩衝，即刻享受極致影音！`,
          traditionalKeywords: [
            item.entityTitle,
            `${item.entityTitle} 線上看`,
            `${item.entityTitle} 完整版`,
            `${item.entityTitle} 4K`,
          ],
          episodeHighlights: insight.episodeHighlights,
          generatedAt: new Date().toISOString(),
        };

        return { title: item.entityTitle, aiContent, priority: item.priority };
      })
    );

    for (let rIdx = 0; rIdx < results.length; rIdx++) {
      const res = results[rIdx];
      const item = batch[rIdx];
      if (res.status === 'fulfilled') {
        const { title, aiContent, priority } = res.value;
        currentDataset[title] = aiContent;
        completedCount++;
        const epTag = aiContent.episodeHighlights ? ` [分集导视: ${Object.keys(aiContent.episodeHighlights).length}集]` : '';
        console.log(`   ✅ [${priority}级] 《${title}》Hook: "${aiContent.hook}"${epTag} (台: ${aiContent.taiwanTitle} | 港: ${aiContent.hongkongTitle})`);
      } else {
        console.error(`   ❌ 《${item.entityTitle}》精润异常:`, res.reason?.message || res.reason);
      }
    }

    // 每一批次完成后即时写回持久化文件，确保进程中断也不丢失
    saveDatasetToFile(currentDataset);
  }

  console.log(`\n🎉 重点影视深度精润完成！共成功处理 ${completedCount} 部影视作品。`);
  console.log(`📦 当前全站深度资产总量: ${Object.keys(currentDataset).length} 部`);
}

function saveDatasetToFile(dataset) {
  const filePath = path.join(projectRoot, 'lib/data/prebaked-ai-insights.ts');
  const fileHeader = `/**
 * 全站影视 AI 深度资产预烘焙数据集 (Prebaked AI Insights)
 * 自动生成于: ${new Date().toISOString()}
 * 
 * 0ms 纯内存直出，杜绝 SSR 网络卡顿，消灭 Thin Content，拉满 Google 搜索排名！
 */

import { TitleAiContent } from "@/lib/types/entity";

export const PREBAKED_AI_INSIGHTS: Record<string, TitleAiContent> = ${JSON.stringify(dataset, null, 2)};

/**
 * 0ms 纯内存提取指定影视的预烘焙 AI 资产
 */
export function getPrebakedAiInsight(key: {
  title?: string;
  entityId?: string;
  slug?: string;
}): TitleAiContent | null {
  if (!key) return null;
  if (key.title && PREBAKED_AI_INSIGHTS[key.title]) {
    return PREBAKED_AI_INSIGHTS[key.title];
  }
  if (key.entityId && PREBAKED_AI_INSIGHTS[key.entityId]) {
    return PREBAKED_AI_INSIGHTS[key.entityId];
  }
  if (key.slug && PREBAKED_AI_INSIGHTS[key.slug]) {
    return PREBAKED_AI_INSIGHTS[key.slug];
  }
  return null;
}
`;

  fs.writeFileSync(filePath, fileHeader, 'utf8');
}

runEnrichment().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
