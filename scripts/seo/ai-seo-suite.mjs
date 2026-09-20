#!/usr/bin/env node

/**
 * AI SEO 5 大超级场景多功能套件 (CLI)
 * 
 * 用法：
 * 场景 1: node scripts/seo/ai-seo-suite.mjs --scenario=review --title="美国人质"
 * 场景 2: node scripts/seo/ai-seo-suite.mjs --scenario=faq --title="凡人修仙传"
 * 场景 3: node scripts/seo/ai-seo-suite.mjs --scenario=article --style=review
 * 场景 4: node scripts/seo/ai-seo-suite.mjs --scenario=collection --theme="反转烧脑悬疑"
 * 场景 5: node scripts/seo/ai-seo-suite.mjs --scenario=localize --title="肖申克的救赎" --original="The Shawshank Redemption"
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

// 动态载入 ai-seo.ts
import {
  generateAiUniqueReview,
  generateAiFaq,
  generateAiParasiteArticle,
  generateAiCollectionTopic,
  generateAiLocalization,
} from '../../lib/services/ai-seo.ts';

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith('--')) {
      const [k, v] = arg.slice(2).split('=');
      args[k] = v || true;
    }
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const scenario = args.scenario || 'help';

  console.log(`\n======================================================`);
  console.log(`🤖 iKanPP AI SEO 全场景赋能矩阵 (模型: ${process.env.AI_MODEL || 'gpt-5.6-sol'})`);
  console.log(`======================================================\n`);

  if (scenario === 'review') {
    const title = args.title || '美国人质';
    console.log(`🎬 [场景 1] 正在为《${title}》生成全网独家原创深度影评与高光看点...`);
    const result = await generateAiUniqueReview({
      title,
      type: 'tv',
      overview: '危机谈判与权力舆论博弈',
      cast: ['实力派戏骨', '领衔主演'],
      genres: ['剧情', '悬疑', '政治'],
    });
    console.log('\n✅ 【独家原创剧情剖析】：');
    console.log(result.uniqueSynopsis);
    console.log('\n🌟 【三大核心高光看点】：');
    result.highlights.forEach((h, i) => console.log(`  ${i + 1}. ${h}`));
    console.log('\n🎭 【演技与角色博弈】：', result.characterAnalysis);
    console.log('🎯 【适宜受众定位】：', result.audienceFit);
  } else if (scenario === 'faq') {
    const title = args.title || '凡人修仙传';
    console.log(`⚡ [场景 2] 正在为《${title}》生成 Google FAQPage 结构化数据胶囊...`);
    const result = await generateAiFaq({
      title,
      type: 'tv',
      overview: '热血国漫年番巨作，凡人韩立逆天修仙传说。',
    });
    console.log('\n✅ 【FAQ 问答对】：');
    result.faqs.forEach((f, i) => {
      console.log(`\nQ${i + 1}: ${f.question}`);
      console.log(`A${i + 1}: ${f.answer}`);
    });
    console.log('\n📋 【Google JSON-LD Schema】：');
    console.log(JSON.stringify(result.jsonLd, null, 2));
  } else if (scenario === 'article') {
    const style = args.style || 'review';
    console.log(`🚀 [场景 3] 正在生成 Parasite 爆款万字长文 [风格: ${style}]...`);
    // 读取最新片单
    const latestTitlesPath = path.join(projectRoot, 'lib/data/latest-titles-prebaked.ts');
    const content = fs.readFileSync(latestTitlesPath, 'utf8');
    const items = [];
    const titleRegex = /"title":\s*"([^"]+)",[\s\S]*?"slug":\s*"([^"]+)",[\s\S]*?"cover":\s*"([^"]+)",[\s\S]*?"type":\s*"([^"]+)",[\s\S]*?"updateBadge":\s*"([^"]*)",[\s\S]*?"qualityBadge":\s*"([^"]*)"/g;
    let match;
    while ((match = titleRegex.exec(content)) !== null && items.length < 15) {
      items.push({
        title: match[1],
        type: match[4],
        qualityBadge: match[6] || '1080P/4K',
        updateBadge: match[5] || '全集',
        watchUrl: `https://www.ikanpp.com/title/${encodeURIComponent(match[2])}`,
        coverUrl: match[3],
      });
    }
    const result = await generateAiParasiteArticle(items, { style });
    console.log(`\n✅ 专栏生成成功！标题: ${result.title}`);
    console.log(`📊 总字数: ${result.markdown.length} 字`);
    const out = path.join(projectRoot, 'docs/seo/latest-parasite-article.md');
    fs.writeFileSync(out, result.markdown, 'utf8');
    console.log(`📁 已写入: ${out}`);
  } else if (scenario === 'collection') {
    const theme = args.theme || '2026反转烧脑悬疑神剧';
    console.log(`📚 [场景 4] 正在根据口语化搜索词「${theme}」自动裂变专题聚合页...`);
    const candidateTitles = ['美国人质', '汤米和塔彭丝', '古战场传奇', '阿波罗陷落', '数到三', '神秘的声音'];
    const result = await generateAiCollectionTopic({
      themeKeyword: theme,
      candidateTitles,
    });
    console.log('\n✅ 【生成的专题聚合页信息】：');
    console.log(`📌 专题名称: ${result.collectionTitle}`);
    console.log(`🔗 规范 Slug: /collection/${result.collectionSlug}`);
    console.log(`📝 策展导语: ${result.introductoryEssay}`);
    console.log(`🏷️ 覆盖搜索词: ${result.searchIntentKeywords.join('、')}`);
    console.log('🎬 推荐片目:');
    result.recommendedPicks.forEach((p) => console.log(`  - 《${p.title}》: ${p.oneLinePitch}`));
  } else if (scenario === 'localize') {
    const title = args.title || '肖申克的救赎';
    const original = args.original || 'The Shawshank Redemption';
    console.log(`🌏 [场景 5] 正在为《${title}》补齐港台公映译名与全球繁体搜索词...`);
    const result = await generateAiLocalization({
      title,
      originalName: original,
      year: '1994',
    });
    console.log('\n✅ 【港台多地本地化信息】：');
    console.log(`🇹🇼 台湾公映译名: 《${result.taiwanTitle}》`);
    console.log(`🇭🇰 香港公映译名: 《${result.hongkongTitle}》`);
    console.log(`🀄 正体繁体片名: 《${result.traditionalTitle}》`);
    console.log(`🔍 繁体搜索同义词: ${result.searchAliases.join(' / ')}`);
    console.log(`📄 繁体 Meta 描述: ${result.traditionalMetaDescription}`);
  } else {
    console.log(`使用方法示例：`);
    console.log(`  node scripts/seo/ai-seo-suite.mjs --scenario=review --title="美国人质"`);
    console.log(`  node scripts/seo/ai-seo-suite.mjs --scenario=faq --title="凡人修仙传"`);
    console.log(`  node scripts/seo/ai-seo-suite.mjs --scenario=article --style=review`);
    console.log(`  node scripts/seo/ai-seo-suite.mjs --scenario=collection --theme="反转烧脑悬疑"`);
    console.log(`  node scripts/seo/ai-seo-suite.mjs --scenario=localize --title="肖申克的救赎"`);
  }
}

main().catch((err) => {
  console.error('\n❌ 运行失败:', err);
  process.exit(1);
});
