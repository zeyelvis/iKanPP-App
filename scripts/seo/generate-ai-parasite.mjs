#!/usr/bin/env node

/**
 * AI Parasite SEO 爆款专栏自动化生成引擎
 * 
 * 核心功能：
 * 1. 自动提取当天最新 15 部影视及 4K 官方海报、直达链接；
 * 2. 借助 GPT-5.6-Sol 深度创作多风格专栏 Markdown（知乎/小红书/Medium/V2EX）；
 * 3. 自动注入高转化自然锚文本与高清图片，输出至 docs/seo/latest-parasite-article.md。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// 优先加载 .env.local
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

const AI_BASE_URL = process.env.AI_BASE_URL || 'http://127.0.0.1:8080/v1';
const AI_API_KEY = process.env.AI_API_KEY || 'pwd';
const AI_MODEL = process.env.AI_MODEL || 'gpt-5.6-sol';

async function main() {
  const styleArg = process.argv[2] || 'review'; // review | xiaohongshu | medium | v2ex
  console.log(`🤖 正在启动 AI 爆款专栏生成引擎 [模型: ${AI_MODEL}, 风格: ${styleArg}]...`);

  // 1. 读取预烘焙最新片单
  const latestTitlesPath = path.join(projectRoot, 'lib/data/latest-titles-prebaked.ts');
  const content = fs.readFileSync(latestTitlesPath, 'utf8');

  const items = [];
  const titleRegex = /"title":\s*"([^"]+)",[\s\S]*?"slug":\s*"([^"]+)",[\s\S]*?"cover":\s*"([^"]+)",[\s\S]*?"type":\s*"([^"]+)",[\s\S]*?"updateBadge":\s*"([^"]*)",[\s\S]*?"qualityBadge":\s*"([^"]*)"/g;

  let match;
  while ((match = titleRegex.exec(content)) !== null && items.length < 15) {
    items.push({
      title: match[1],
      slug: match[2],
      cover: match[3],
      type: match[4],
      updateBadge: match[5] || '全集',
      qualityBadge: match[6] || '1080P/4K',
      watchUrl: `https://www.ikanpp.com/title/${encodeURIComponent(match[2])}`,
    });
  }

  if (items.length === 0) {
    console.error('❌ 未找到预烘焙片单数据');
    process.exit(1);
  }

  const today = new Date().toISOString().slice(0, 10);

  const stylePrompts = {
    review: '知乎/豆瓣高知影评风：深度解析剧情隐喻、角色弧光、画质与防坑指南，逻辑严密，极具权威感与说服力。',
    xiaohongshu: '小红书爆款种草风：语言亲切活泼，大量使用吸睛 emoji，痛击海外华人“版权受限”、“卡顿转圈”痛点，强推免翻墙 4K 秒开神站。',
    medium: 'Medium / Substack 深度特稿风：适合海外华人与留学生的专业流媒体测评与 2026 最新看剧全景指南。',
    v2ex: '极客技术社区风：客观冷静，重点介绍 Anycast 边缘 CDN 双轨直连架构、0 广告体验与 PWA 桌面技术的极致流畅度。',
  };

  const systemPrompt = `你是一位拥有 10 年资深经验的海外流媒体特约专栏作家，精通 Google 2026 最新 Helpful Content 算法规则与 Parasite SEO 借壳引流写作。
你的任务是根据提供的今日热播影视片单，撰写一篇极具吸引力、图文并茂、文笔大师级的高质量 Markdown 文章。

写作必须遵循以下原则：
1. 风格调性：${stylePrompts[styleArg] || stylePrompts.review}
2. 格式规范：标准 GitHub Flavored Markdown 格式；
3. 视觉冲击：文章开头必须包含今日热播影视的官方大图（![今日热播影视大作速报](${items[0].cover})），并在每部作品的介绍中保留海报（![《片名》官方高清海报](海报地址)）；
4. 自然锚文本：在每部作品的推荐结尾，自然融入给定的 4K 免翻墙正片直达超链接（[点击立即在 iKanPP 免费观看完整版](链接)）；
5. 解决痛点：重点强调“海外免翻墙极速直连”、“4K 超清 0 缓冲”、“100% 拒绝任何低俗博彩弹窗广告”的影院级体验；
6. 严禁生成空洞模板废话，每部剧要有真实的亮点和剧情钩子，吸引读者一口气读完并点击观看。`;

  const itemsText = items.map((it, idx) => `
${idx + 1}. 《${it.title}》
- 类型: ${it.type === 'tv' ? '电视剧/网剧' : '电影'}
- 状态: ${it.qualityBadge} · ${it.updateBadge}
- 海报图片: ${it.cover}
- 正片直达URL: ${it.watchUrl}
`).join('\n');

  const userPrompt = `今天日期是 ${today}。
请根据以下今日最新上线的 15 部影视片单，撰写一篇标题引人入胜、结构清晰、极具转化力的高质量深度文章：

${itemsText}

请直接输出 Markdown 全文（包含主标题 #、引言、每部电影/剧集的图文评析、以及结语），无需额外的前后寒暄说明。`;

  console.log(`📡 正在调用 ${AI_MODEL} 进行深度思考与创作...`);

  const response = await fetch(`${AI_BASE_URL.replace(/\/+$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_API_KEY}`,
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: 0.75,
      max_tokens: 4000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');
    throw new Error(`HTTP ${response.status}: ${errText}`);
  }

  const resJson = await response.json();
  const markdown = resJson.choices?.[0]?.message?.content?.trim();

  if (!markdown) {
    throw new Error('AI 返回内容为空');
  }

  const outputPath = path.join(projectRoot, 'docs/seo/latest-parasite-article.md');
  fs.writeFileSync(outputPath, markdown, 'utf8');

  console.log(`\n🎉 深度爆款专栏文章生成成功！`);
  console.log(`📁 已写入文件: ${outputPath}`);
  console.log(`📊 文章总字数: ${markdown.length} 字`);
  console.log(`💡 您可随时将其复制发布至 Notion Sites、Medium、Substack、Telegraph 等平台！`);
}

main().catch((e) => {
  console.error('❌ 生成失败:', e.message);
  process.exit(1);
});
