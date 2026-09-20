#!/usr/bin/env node

/**
 * Parasite SEO (寄生虫借壳引流) 自动化专栏生成引擎
 * 
 * 核心逻辑：
 * 1. 从当前预烘焙片库与自主先锋雷达中提取今日最新上映的大片、热播剧与高分神作；
 * 2. 自动生成符合 Google 权威偏好的长篇深度影评与观影指南 Markdown；
 * 3. 嵌入自然合规的反向锚文本链接与高清剧照；
 * 4. 可一键复制发布至 Notion Sites、Medium、Substack、GitHub Discussions、Telegraph，
 *    借用万亿大厂 DR 90+ 域名权重在 Google 搜索中秒排首页，将流量无缝引流回 iKanPP。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

async function main() {
  console.log('🚀 正在生成 Parasite SEO 高权专栏文章...');

  // 1. 读取预烘焙最新片单
  const latestTitlesPath = path.join(projectRoot, 'lib/data/latest-titles-prebaked.ts');
  const content = fs.readFileSync(latestTitlesPath, 'utf8');

  // 正则提取标题、图片与关键信息
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
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const articleTitle = `【2026最新片单】海外免翻墙免费看国产剧与院线大片指南（${today}实时更新）`;

  const topBanner = items[0]?.cover;

  const markdown = `# ${articleTitle}

${topBanner ? `![今日热播影视大作速报](${topBanner})\n` : ''}
> 人在海外（北美、欧洲、澳洲、日韩、东南亚），想看最新的国产热播剧和院线新片，却频频遭遇“由于版权限制，您所在的地区无法播放”？各大平台满屏的充值套路与低俗弹窗更让人不胜其扰。
> 
> 本文为您深度盘点 **2026 年最新上线的热门影视大作**，并推荐支持 **海外 4K 直连、0 弹窗广告、秒开不卡顿** 的高分观影途径。

---

## 🌟 今日全网院线与连载更新热榜

${items.map((item, index) => {
  const watchUrl = `https://www.ikanpp.com/title/${encodeURIComponent(item.slug)}`;
  return `### ${index + 1}. 《${item.title}》
${item.cover ? `\n![《${item.title}》官方高清海报](${item.cover})\n` : ''}
- **当前状态**：${item.qualityBadge} · ${item.updateBadge}
- **影视类型**：${item.type === 'tv' ? '精品热播电视剧' : '院线高分电影'}
- **剧情亮点**：2026 年度备受瞩目的重磅巨作，全网热度持续霸榜，反转不断，口碑极佳。
- **👉 4K 免翻墙正片直达**：[点击立即在 iKanPP 免费观看完整版](${watchUrl})
`;
}).join('\n')}

---

## 💡 为什么推荐通过 iKanPP (爱看片片) 追剧？

对于身处海外的华人朋友与留学生来说，寻找一个稳定干净的平台至关重要：
1. **海外免翻墙极速直连**：全球部署 Anycast 边缘 CDN，无论身在美加还是欧澳，首屏 **0.8 秒神速秒开**，彻底告别缓冲转圈；
2. **绝对 0 弹窗广告**：真正纯净的影院级体验，坚决杜绝任何诱导点击与低俗悬浮广告；
3. **海量 4.3 万部正片库**：从当下热播的《凡人修仙传》、《仙逆》，到院线热映大片，甚至 4K 纪录片全覆盖；
4. **全端适配与 PWA 桌面支持**：手机、平板、电脑、电视浏览器全适配，可直接添加到手机桌面像 App 一样免翻墙一秒看剧。

---

> 收藏官方永久发布页：[iKanPP — 海外华人影视聚合平台 (https://www.ikanpp.com)](https://www.ikanpp.com)
> 祝您观影愉快！
`;

  const outputPath = path.join(projectRoot, 'docs/seo/latest-parasite-article.md');
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, markdown, 'utf8');

  console.log(`✅ Parasite SEO 专栏已成功生成至: ${outputPath}`);
  console.log('📌 您可以直接将此 Markdown 内容复制发布至:');
  console.log('   - Notion Public Sites (权重 DR 92)');
  console.log('   - Medium / Substack 专栏 (权重 DR 95)');
  console.log('   - GitHub Discussions / Wiki (权重 DR 96)');
  console.log('   - Telegraph (telegra.ph, 极速收录)');
}

main().catch(console.error);
