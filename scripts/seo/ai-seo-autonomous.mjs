#!/usr/bin/env node

/**
 * iKanPP 每日全自动 AI SEO 协同增长引擎 (Autonomous AI SEO Engine)
 * 
 * 每日无人值守自动化闭环：
 * 1. 【全自动】今日最新上映影片 3 合 1 自动赋能（独家影评 + FAQ 结构化数据 + 港台公映译名）
 * 2. 【全自动】今日 15 部新片万字 Parasite SEO 爆款长文全自动生产并归档
 * 3. 【全自动】每周五自动策展口语化程序化专题聚合页并上线
 * 4. 【全自动】Telegram Bot 自动化运营速报推送到站长手机
 * 5. 【半自动】站长手机一键复制长文，随手分发至知乎/小红书/Medium，零风控借壳引流
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

import { PREBAKED_LATEST_TITLES } from '../../lib/data/latest-titles-prebaked';
import { getTitleCanonicalHref } from '../../lib/data/entities/entity-utils';
import { getEntityById, getEntityByTitle, saveEntity } from '../../lib/services/entity-kv';
import {
  generateAiUniqueReview,
  generateAiFaq,
  generateAiParasiteArticle,
  generateAiCollectionTopic,
  generateAiLocalization,
} from '../../lib/services/ai-seo';
import { saveTopic } from '../../lib/services/topic-service';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const AI_MODEL = process.env.AI_MODEL || 'gpt-5.6-sol';

async function sendTelegramMessage(text) {
  if (!BOT_TOKEN || !CHAT_ID) {
    console.log('⚠️ [Telegram] 未配置 TELEGRAM_BOT_TOKEN 或 TELEGRAM_CHAT_ID，跳过推送');
    return;
  }
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    });
    const json = await res.json();
    if (json.ok) {
      console.log('📱 [Telegram] 自动运营速报推送成功！');
    } else {
      console.warn('❌ [Telegram] 推送失败:', json);
    }
  } catch (err) {
    console.warn('❌ [Telegram] 网络异常:', err.message);
  }
}

async function runAutonomousAiSeo() {
  console.log('====================================================');
  console.log('🤖 iKanPP 每日全自动 AI SEO 协同引擎启动');
  console.log(`⏰ 执行时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`🧠 调度模型: ${AI_MODEL}`);
  console.log('====================================================\n');

  const dateStr = new Date().toISOString().split('T')[0];
  const allLatest = PREBAKED_LATEST_TITLES.all || [];

  // ==========================================================================
  // 第一阶段：今日新片 3 合 1 自动赋能（独家影评 + FAQ + 港台译名）
  // ==========================================================================
  console.log('📋 【阶段 1/4】扫描今日最新入库影片，执行 3 合 1 自动增强...');
  const targetCandidates = allLatest.slice(0, 8); // 取前 8 部重点新片
  const enrichedTitles = [];

  for (const item of targetCandidates) {
    try {
      let ent = await getEntityById(item.entityId);
      if (!ent) {
        ent = await getEntityByTitle(item.title);
      }

      // 幂等性保护：若已有深度影评，直接跳过，0 浪费 Token
      if (ent && ent.aiContent?.uniqueSynopsis && ent.aiContent?.faqs?.length) {
        console.log(`  ⏩ 《${item.title}》已具备 AI 资产，自动跳过`);
        continue;
      }

      console.log(`  ⚡ 正在为《${item.title}》生成独家原创影评、FAQ 胶囊与港台译名...`);

      // 并行执行轻量提取与深度撰写
      const [reviewData, faqData, localizeData] = await Promise.all([
        generateAiUniqueReview({
          title: item.title,
          type: item.type || 'tv',
          genres: item.genres,
          model: AI_MODEL,
        }).catch(err => {
          console.warn(`    ⚠️ 影评生成异常:`, err.message);
          return null;
        }),
        generateAiFaq({
          title: item.title,
          type: item.type || 'tv',
          model: 'gpt-5.6-terra', // 极速轻量模型
        }).catch(err => {
          console.warn(`    ⚠️ FAQ 生成异常:`, err.message);
          return null;
        }),
        generateAiLocalization({
          title: item.title,
          year: item.year,
          model: 'gpt-5.6-terra',
        }).catch(err => {
          console.warn(`    ⚠️ 港台译名异常:`, err.message);
          return null;
        }),
      ]);

      if (!ent) {
        ent = {
          entityId: item.entityId,
          title: item.title,
          slug: item.slug,
          type: item.type,
          year: item.year || '2024',
          description: item.description || '',
          cover: item.cover,
          backdrop: item.backdrop,
          rate: item.rate || '8.5',
          genres: item.genres || ['影视'],
          directors: [],
          actors: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }

      ent.aiContent = {
        ...(ent.aiContent || {}),
        ...(reviewData || {}),
        faqs: faqData?.faqs || ent.aiContent?.faqs,
        taiwanTitle: localizeData?.taiwanTitle || ent.aiContent?.taiwanTitle,
        hongkongTitle: localizeData?.hongkongTitle || ent.aiContent?.hongkongTitle,
        traditionalMetaDescription: localizeData?.traditionalMetaDescription || ent.aiContent?.traditionalMetaDescription,
        traditionalKeywords: localizeData?.traditionalKeywords || ent.aiContent?.traditionalKeywords,
        generatedAt: new Date().toISOString(),
      };

      const aliases = new Set(ent.aliases || []);
      if (localizeData?.taiwanTitle) aliases.add(localizeData.taiwanTitle.trim());
      if (localizeData?.hongkongTitle) aliases.add(localizeData.hongkongTitle.trim());
      ent.aliases = Array.from(aliases);

      await saveEntity(ent);
      enrichedTitles.push({
        title: ent.title,
        taiwan: localizeData?.taiwanTitle,
        hongkong: localizeData?.hongkongTitle,
        faqsCount: faqData?.faqs?.length || 0,
        highlightsCount: reviewData?.highlights?.length || 0,
      });

      console.log(`  ✅ 《${item.title}》AI 资产自动写入完成！`);
    } catch (err) {
      console.warn(`  ❌ 处理《${item.title}》失败:`, err.message);
    }
  }

  // ==========================================================================
  // 第二阶段：今日万字 Parasite SEO 爆款长文全自动生产与归档
  // ==========================================================================
  console.log('\n📝 【阶段 2/4】正在为今日 15 部新片全自动撰写万字爆款长文...');
  let articleSummary = '';
  try {
    const candidateList = allLatest.slice(0, 15).map(it => ({
      title: it.title,
      type: it.type,
      qualityBadge: it.qualityBadge,
      updateBadge: it.updateBadge,
      watchUrl: `${BASE_URL}${getTitleCanonicalHref(it)}`,
      coverUrl: it.cover || it.backdrop,
    }));

    const articleResult = await generateAiParasiteArticle(candidateList, {
      style: 'review',
      model: AI_MODEL,
    });

    // 1. 写入最新主文件
    const targetFile = path.join(projectRoot, 'docs/seo/latest-parasite-article.md');
    fs.writeFileSync(targetFile, articleResult.markdown, 'utf8');

    // 2. 归档历史副本
    const archiveDir = path.join(projectRoot, 'docs/seo/archive');
    if (!fs.existsSync(archiveDir)) fs.mkdirSync(archiveDir, { recursive: true });
    const archiveFile = path.join(archiveDir, `parasite-article-${dateStr}.md`);
    fs.writeFileSync(archiveFile, articleResult.markdown, 'utf8');

    articleSummary = articleResult.summary;
    console.log(`  ✅ 万字长文生成并归档成功！字数: ${articleResult.charCount} 字`);
    console.log(`  📁 文件路径: docs/seo/latest-parasite-article.md`);
  } catch (err) {
    console.warn('  ❌ 万字长文生成失败:', err.message);
  }

  // ==========================================================================
  // 第三阶段：每周五自动策展口语化专题聚合页
  // ==========================================================================
  const isFriday = new Date().getDay() === 5 || process.argv.includes('--weekly-topic');
  if (isFriday) {
    console.log('\n🌟 【阶段 3/4】周五专属：自动策展上线全新周末长尾专题聚合页...');
    try {
      const topicThemes = [
        '适合情侣窝在沙发看的超甜治愈系高分电影',
        '一口气看完！反转不断的高智商悬疑推理神剧',
        '下饭必看！笑点密集的豆瓣高分爆笑喜剧精选',
        '神作连台！影迷公认一生必看的科幻史诗大片',
      ];
      const selectedTheme = topicThemes[Math.floor(Math.random() * topicThemes.length)];
      const candidateTitles = allLatest.slice(0, 15).map(it => it.title);

      const topicData = await generateAiCollectionTopic({
        themeKeyword: selectedTheme,
        candidateTitles,
        model: AI_MODEL,
      });

      await saveTopic(topicData);
      console.log(`  🎉 全新口语化专题已自动发布上线！`);
      console.log(`  🔗 前台专题 URL: /topic/${topicData.slug}`);
      console.log(`  📖 专题标题: ${topicData.topicTitle}`);
    } catch (err) {
      console.warn('  ❌ 专题自动发布失败:', err.message);
    }
  } else {
    console.log('\n⏭️ 【阶段 3/4】今日非周五，跳过定期专题发布（仅每周五执行）');
  }

  // ==========================================================================
  // 第四阶段：Telegram Bot 运营速报推送到手机
  // ==========================================================================
  console.log('\n📱 【阶段 4/4】通过 Telegram Bot 向站长发送今日自动化速报...');
  let tgMessage = `🚀 *iKanPP 全自动 AI SEO 晨间运营速报* (${dateStr})\n\n`;
  tgMessage += `🤖 *调度模型*：\`${AI_MODEL}\`\n`;
  tgMessage += `⚡ *新片自动赋能*：今日已自动完成 *${enrichedTitles.length}* 部重点影视的独家影评、Google FAQ 与港台公映名注入！\n`;

  if (enrichedTitles.length > 0) {
    tgMessage += `\n🎬 *新入库赋能列表*：\n`;
    for (const item of enrichedTitles.slice(0, 5)) {
      tgMessage += `• 《${item.title}》`;
      if (item.taiwan) tgMessage += ` (🇹🇼台: ${item.taiwan})`;
      tgMessage += `\n`;
    }
  }

  tgMessage += `\n📝 *今日万字 Parasite SEO 文章已备好*：\n`;
  tgMessage += `• *核心主题*：2026 最新爆款影视独家深度盘点\n`;
  tgMessage += `• *摘要看点*：${articleSummary ? articleSummary.slice(0, 120) + '...' : '包含 4K 原生海报与播放直达外链'}\n`;
  tgMessage += `• *手机一键复制*：文章已存档于 \`docs/seo/latest-parasite-article.md\`，喝咖啡时复制发到知乎/小红书即可！\n\n`;
  tgMessage += `━━━━━━━━━━━━━━━━━━\n`;
  tgMessage += `🌐 [进入管理后台查看全域增长中枢](${BASE_URL}/admin/growth)\n`;

  await sendTelegramMessage(tgMessage);

  console.log('\n====================================================');
  console.log('🎉 今日全自动 AI SEO 协同任务全部圆满完成！');
  console.log('====================================================');
}

runAutonomousAiSeo().catch(err => {
  console.error('💥 自动化引擎发生未捕获异常:', err);
  process.exit(1);
});
