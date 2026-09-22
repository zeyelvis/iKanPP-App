#!/usr/bin/env node

/**
 * iKanPP 批量生成并预烘焙 AI 深度资产工具 (Bulk AI Insights Generator)
 * 
 * 借助本地 codex-proxy (gpt-5.6-sol) 顶级算力，为重点影片批量生成：
 * 1. 独家悬念金句 (hook)
 * 2. 300~400字独家深度剧情剖析 (uniqueSynopsis)
 * 3. 3大剧情高光核心看点 (highlights)
 * 4. 主演演技与角色博弈点评 (characterAnalysis)
 * 5. 适宜受众画像 (audienceFit)
 * 6. Google FAQPage 结构化问答胶囊 (faqs)
 * 7. 港台公映规范译名 (taiwanTitle / hongkongTitle)
 * 
 * 自动增量写入并持久化至 lib/data/prebaked-ai-insights.ts 与 Cloudflare KV。
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

import { generateAiComprehensiveInsights } from '../../lib/services/ai-seo.js';
import { PREBAKED_AI_INSIGHTS } from '../../lib/data/prebaked-ai-insights.ts';
import { getEntityByTitle, saveEntity } from '../../lib/services/entity-kv.js';

const AI_MODEL = process.env.AI_MODEL || 'gpt-5.6-sol';

// 重点目标片单：经典高分必看神作 + 近期新上线大片
const TARGET_TITLES = [
  // 核心电视剧
  { title: '繁花', type: 'tv', year: '2023', genres: ['剧情', '爱情'], overview: '讲述九十年代初沪上弄堂青年阿宝在时代浪潮中跌宕起伏的传奇商战与情感纠葛。' },
  { title: '漫长的季节', type: 'tv', year: '2023', genres: ['悬疑', '剧情', '犯罪'], overview: '讲述东北小城桦林跨越近二十年的一桩悬案，以及被时代列车抛下的一代人的命运回响。' },
  { title: '狂飙', type: 'tv', year: '2023', genres: ['剧情', '犯罪'], overview: '讲述刑警安欣与黑恶势力代表高启强长达二十年的正邪博弈与人性异化。' },
  { title: '三体', type: 'tv', year: '2023', genres: ['科幻', '剧情'], overview: '纳米科学家汪淼与刑警史强联手调查科学家连续自杀事件，揭开地外三体文明即将入侵地球的惊天秘密。' },
  { title: '庆余年 第二季', type: 'tv', year: '2024', genres: ['古装', '权谋'], overview: '范闲假死归京，面对南庆朝堂更加汹涌诡谲的政商暗流与皇子纷争。' },
  { title: '白夜追凶', type: 'tv', year: '2017', genres: ['悬疑', '刑侦', '犯罪'], overview: '刑侦支队长关宏峰与双胞胎弟弟关宏宇昼夜交替、共用身份洗脱嫌疑并追查灭门惨案。' },
  { title: '隐秘的角落', type: 'tv', year: '2020', genres: ['悬疑', '犯罪', '剧情'], overview: '三个孩子在景区无意录下一起谋杀案，以此展开与凶手张东升危险交涉与心理博弈。' },
  { title: '沉默的真相', type: 'tv', year: '2020', genres: ['悬疑', '犯罪', '剧情'], overview: '检察官江阳历经十年苦难追查侯贵平死因，以生命为代价撕开长夜黑幕。' },
  { title: '开端', type: 'tv', year: '2022', genres: ['时间循环', '悬疑', '科幻'], overview: '大学生李诗情与游戏架构师肖鹤云在遭遇公交车爆炸后陷入时间循环，努力阻止灾难寻找真凶。' },
  { title: '莲花楼', type: 'tv', year: '2023', genres: ['武侠', '悬疑', '古装'], overview: '四顾门门主李相夷重伤后化名游医李莲花，与方多病、笛飞声携手屡破江湖奇案。' },
  { title: '唐朝诡事录之西行', type: 'tv', year: '2024', genres: ['悬疑', '古装', '探案'], overview: '卢凌风与苏无名一路西行，在盛唐奇幻诡谲的边关异域破解一系列惊天奇案。' },
  { title: '我的阿勒泰', type: 'tv', year: '2024', genres: ['自然', '治愈', '剧情'], overview: '汉族女孩李文秀回到阿勒泰母亲经营的牧场小卖部，在广袤旷野中感受哈萨克族传统游牧的辽阔与温存。' },

  // 核心电影
  { title: '流浪地球2', type: 'movie', year: '2023', genres: ['科幻', '灾难', '动作'], overview: '太阳危机爆发前夕，人类面临移山计划与数字生命计划的严峻抉择，航天员与科学家舍生忘死守护家园。' },
  { title: '无间道', type: 'movie', year: '2002', genres: ['犯罪', '悬疑', '经典'], overview: '警方卧底陈永仁与黑帮内鬼刘建明在无间地狱般的边缘处境中上演高智商心理与信任较量。' },
  { title: '我不是药神', type: 'movie', year: '2018', genres: ['剧情', '现实', '喜剧'], overview: '神油店老板程勇为了赚钱走私印度仿制药，在见证白血病群体的生存困境后蜕变为救赎者的故事。' },
  { title: '周处除三害', type: 'movie', year: '2023', genres: ['动作', '犯罪', '剧情'], overview: '通缉犯陈桂林得知自己身患绝症，决心除掉排名前两位的通缉犯以扬名立万，却陷入人性深渊。' },
  { title: '抓娃娃', type: 'movie', year: '2024', genres: ['喜剧', '家庭'], overview: '富豪夫妻为了培养儿子成才，隐藏亿万家产假装贫困户，展开一场笑料百出的人造苦难大戏。' },
  { title: '九龙城寨之围城', type: 'movie', year: '2024', genres: ['动作', '犯罪'], overview: '落魄青年陈洛军误入九龙城寨，与城寨四子并肩对抗外敌，重燃香港动作片黄金荣光。' },

  // 最新先锋新片
  { title: '一击3：最后一击', type: 'movie', year: '2026', genres: ['动作', '惊悚', '电影'], overview: '海豹突击队在绝境危机中展开最后一搏的硬派军事战术动作大片。' },
  { title: '法医秦明之龙番往事', type: 'tv', year: '2026', genres: ['电视剧', '悬疑', '刑侦'], overview: '青年秦明初入法医行业，在师父指导下抽丝剥茧破获连环奇案的成长序章。' },
  { title: '古战场传奇：吾血之亲第2季', type: 'tv', year: '2026', genres: ['剧情', '爱情', '奇幻'], overview: '聚焦两对父母在十八世纪苏格兰高地与一战西线战场跨越时空的史诗爱恋。' },
  { title: '万物既伟大又渺小第7季', type: 'tv', year: '2026', genres: ['剧情', '喜剧', '治愈'], overview: '约克郡乡村兽医詹姆斯与小镇居民在乡野风光中治愈动物与人心的温暖生活日常。' },
];

async function runBulkGeneration() {
  console.log('========================================================');
  console.log('🚀 iKanPP 批量 AI 深度资产生成中枢启动');
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`🧠 调度模型: ${AI_MODEL}`);
  console.log(`📋 待处理片单数量: ${TARGET_TITLES.length} 部重点影视`);
  console.log('========================================================\n');

  const currentDataset = { ...PREBAKED_AI_INSIGHTS };
  let successCount = 0;
  let skipCount = 0;

  for (let i = 0; i < TARGET_TITLES.length; i++) {
    const item = TARGET_TITLES[i];
    const indexStr = `[${i + 1}/${TARGET_TITLES.length}]`;

    // 幂等性检测：已有完整资产直接跳过
    if (
      currentDataset[item.title] &&
      currentDataset[item.title].hook &&
      currentDataset[item.title].uniqueSynopsis &&
      currentDataset[item.title].faqs?.length >= 3
    ) {
      console.log(`${indexStr} ⏩ 《${item.title}》已有完整 AI 深度资产，自动跳过`);
      skipCount++;
      continue;
    }

    console.log(`${indexStr} ⚡ 正在为《${item.title}》(${item.year}) 一站式生成独家影评、Hook金句、看点与 FAQ 胶囊...`);

    try {
      // 一站式高效生成（1次网络请求搞定全部字段）
      const insightData = await generateAiComprehensiveInsights({
        title: item.title,
        type: item.type,
        year: item.year,
        overview: item.overview,
        genres: item.genres,
        model: AI_MODEL,
      });

      const aiContent = {
        hook: insightData.hook,
        uniqueSynopsis: insightData.uniqueSynopsis,
        highlights: insightData.highlights,
        characterAnalysis: insightData.characterAnalysis,
        audienceFit: insightData.audienceFit,
        faqs: insightData.faqs,
        taiwanTitle: insightData.taiwanTitle,
        hongkongTitle: insightData.hongkongTitle,
        traditionalMetaDescription: `【4K線上看】《${item.title}》完整版高清免翻牆極速播放。iKanPP 全球 Anycast CDN 直連，零廣告零緩衝，即刻享受極致影音！`,
        traditionalKeywords: [item.title, `${item.title} 線上看`, `${item.title} 4K`],
        generatedAt: new Date().toISOString(),
      };

      currentDataset[item.title] = aiContent;
      successCount++;

      console.log(`     ✨ 黄金Hook: "${aiContent.hook}"`);
      console.log(`     🎯 核心看点数: ${aiContent.highlights?.length} 条`);
      console.log(`     ❓ FAQ问答数: ${aiContent.faqs?.length} 条`);
      console.log(`     🇹🇼 台湾译名: ${aiContent.taiwanTitle} | 🇭🇰 香港译名: ${aiContent.hongkongTitle}`);
      console.log(`     ✅ 《${item.title}》AI 深度资产生成成功！\n`);

      // 尝试写回 KV 实体（非阻塞）
      try {
        const existingEnt = await getEntityByTitle(item.title);
        if (existingEnt) {
          existingEnt.aiContent = { ...(existingEnt.aiContent || {}), ...aiContent };
          const aliases = new Set(existingEnt.aliases || []);
          if (aiContent.taiwanTitle) aliases.add(aiContent.taiwanTitle.trim());
          if (aiContent.hongkongTitle) aliases.add(aiContent.hongkongTitle.trim());
          existingEnt.aliases = Array.from(aliases);
          await saveEntity(existingEnt);
        }
      } catch (kvErr) {
        // KV 可选，不影响预烘焙
      }

      // 每生成 2 部，持久化更新一次 lib/data/prebaked-ai-insights.ts，防止意外中断
      if (successCount % 2 === 0 || i === TARGET_TITLES.length - 1) {
        saveDatasetToFile(currentDataset);
      }
    } catch (err) {
      console.error(`❌ 处理《${item.title}》失败:`, err.message);
    }
  }

  // 最终持久化
  saveDatasetToFile(currentDataset);

  console.log('\n========================================================');
  console.log('🎉 批量 AI 深度资产生成完毕！');
  console.log(`📊 统计: 共 ${TARGET_TITLES.length} 部，成功生成 ${successCount} 部，跳过已有 ${skipCount} 部`);
  console.log(`📁 预烘焙文件: lib/data/prebaked-ai-insights.ts`);
  console.log('========================================================');
}

function saveDatasetToFile(dataset) {
  const targetFile = path.join(projectRoot, 'lib/data/prebaked-ai-insights.ts');
  const fileHeader = `/**
 * 全站影视 AI 深度资产预烘焙数据集 (Prebaked AI Insights)
 * 自动生成于: ${new Date().toISOString()}
 * 
 * 0ms 纯内存直出，杜绝 SSR 网络卡顿，消灭 Thin Content，拉满 Google 搜索排名！
 */

import { TitleAiContent } from '@/lib/types/entity';

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

  fs.writeFileSync(targetFile, fileHeader, 'utf8');
}

runBulkGeneration().catch(err => {
  console.error('💥 批量生成脚本异常中断:', err);
  process.exit(1);
});
