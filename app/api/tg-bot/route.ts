import { NextRequest, NextResponse } from 'next/server';
import { PREBAKED_LATEST_TITLES } from '@/lib/data/latest-titles-prebaked';
import { ALL_HOME_DATA } from '@/lib/data/home-prebaked-extra';
import { getTitleCanonicalHref } from '@/lib/data/entities/entity-utils';

export const runtime = 'edge';

/**
 * iKanPP 官方 Telegram 搜片 Webhook 机器人中枢
 * 
 * 架构优势：
 * 1. 依托 Cloudflare Edge Serverless 运行，0 独立服务器维护成本；
 * 2. 支持群内内联搜索 (Inline Query: @ikanpp_bot <片名>)；
 * 3. 支持直接对话或命令 (/search <片名>, /hot, /latest)；
 * 4. 每一条搜索结果带精美封面、豆瓣评分、直达 4K 播放链接。
 */
export async function POST(req: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    return NextResponse.json({ ok: true, note: 'TELEGRAM_BOT_TOKEN is not configured yet.' });
  }

  try {
    const update = await req.json();

    // 1. 处理内联搜索 (Inline Query: 用户在任意群打字 @ikanpp_bot <关键词>)
    if (update.inline_query) {
      const inlineQuery = update.inline_query;
      const query = (inlineQuery.query || '').trim().toLowerCase();

      // 从预烘焙片库匹配相关影片 (最多返回 8 条)
      const allItems = [
        ...(ALL_HOME_DATA.hero || []),
        ...(ALL_HOME_DATA.s1 || []),
        ...(PREBAKED_LATEST_TITLES.all || []),
      ];

      const matched = allItems.filter(item => 
        !query || item.title.toLowerCase().includes(query)
      ).slice(0, 8);

      const results = matched.map((item, index) => {
        const watchUrl = `https://www.ikanpp.com${getTitleCanonicalHref(item)}`;
        return {
          type: 'article',
          id: `${item.title}_${index}`,
          title: item.title,
          description: `⭐️ 评分: ${item.rate || '8.5'} | ${item.year || '2026'} | 4K免翻墙秒开`,
          thumb_url: item.cover,
          input_message_content: {
            message_text: `🎬 *《${item.title}》* 4K完整版\n\n⭐️ 豆瓣评分: *${item.rate || '8.5'}*\n📅 年代: ${item.year || '2026'}\n✨ 状态: ${(item as { episodes_info?: string; updateBadge?: string }).episodes_info || (item as { episodes_info?: string; updateBadge?: string }).updateBadge || '高清完整版'}\n\n👉 [点击直接在 iKanPP 免费观看](${watchUrl})`,
            parse_mode: 'Markdown',
          },
          reply_markup: {
            inline_keyboard: [
              [
                { text: '▶️ 立即 4K 播放', url: watchUrl },
                { text: '🌐 访问 iKanPP 官网', url: 'https://www.ikanpp.com' }
              ]
            ]
          }
        };
      });

      await fetch(`https://api.telegram.org/bot${token}/answerInlineQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inline_query_id: inlineQuery.id,
          results,
          cache_time: 300,
        }),
      });

      return NextResponse.json({ ok: true });
    }

    // 2. 处理聊天命令消息 (/search, /hot, /latest)
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const text = update.message.text.trim();

      if (text.startsWith('/start')) {
        const welcomeText = `👋 欢迎使用 *iKanPP (爱看片片)* 官方搜片助手！\n\n海外华人第一高分 4K 影视聚合平台，零弹窗、免翻墙、直连秒开。\n\n🔍 *使用方法*：\n• 直接回复片名搜片，例如：\`凡人修仙传\`\n• 发送 \`/hot\` 查看今日全网热搜 Top 10\n• 发送 \`/latest\` 查看最新上映院线抢先版\n• 在任何群内打 \`@${update.message.bot_username || 'ikanpp_bot'} 片名\` 实时查片\n\n🌐 官网地址：https://www.ikanpp.com`;
        
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: welcomeText,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🍿 立即进入 iKanPP 观影', url: 'https://www.ikanpp.com' }]
              ]
            }
          }),
        });
        return NextResponse.json({ ok: true });
      }

      if (text.startsWith('/hot') || text.startsWith('/latest')) {
        const list = text.startsWith('/hot') 
          ? (ALL_HOME_DATA.hero || []).slice(0, 6)
          : (PREBAKED_LATEST_TITLES.all || []).slice(0, 6);

        const replyLines = [
          text.startsWith('/hot') ? '🔥 *今日全网高分精选 Top 榜单*：' : '⚡️ *今日首发先锋雷达最新上线*：',
          ''
        ];

        const buttons = list.map((item) => {
          const watchUrl = `https://www.ikanpp.com${getTitleCanonicalHref(item)}`;
          replyLines.push(`• *《${item.title}》* (${item.rate || '8.5'}分)`);
          return [{ text: `▶️ 《${item.title}》`, url: watchUrl }];
        });

        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: replyLines.join('\n'),
            parse_mode: 'Markdown',
            reply_markup: { inline_keyboard: buttons }
          }),
        });
        return NextResponse.json({ ok: true });
      }

      // 默认模糊搜片
      const searchKeyword = text.replace(/^\/search\s*/, '').trim().toLowerCase();
      const allItems = [
        ...(ALL_HOME_DATA.hero || []),
        ...(ALL_HOME_DATA.s1 || []),
        ...(PREBAKED_LATEST_TITLES.all || []),
      ];

      const match = allItems.find(i => i.title.toLowerCase().includes(searchKeyword));
      if (match) {
        const watchUrl = `https://www.ikanpp.com${getTitleCanonicalHref(match)}`;
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `🎯 找到影片：*《${match.title}》*\n\n⭐️ 豆瓣评分: *${match.rate || '8.5'}*\n📅 上映年份: ${match.year || '2026'}\n✨ 状态: ${(match as { episodes_info?: string; updateBadge?: string }).episodes_info || (match as { episodes_info?: string; updateBadge?: string }).updateBadge || '4K超清完整版'}\n\n👉 [点击直接免翻墙播放](${watchUrl})`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: `▶️ 立即播放《${match.title}》`, url: watchUrl }]
              ]
            }
          }),
        });
      } else {
        const searchWebUrl = `https://www.ikanpp.com/?q=${encodeURIComponent(searchKeyword)}`;
        await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text: `抱歉，在本地快速缓存未找到《${searchKeyword}》，已为您在全网片库发起深度检索：\n\n👉 [点击前往 iKanPP 搜索全网播放源](${searchWebUrl})`,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [
                [{ text: `🔍 在 iKanPP 深度搜片`, url: searchWebUrl }]
              ]
            }
          }),
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[TG Bot Error]', error);
    return NextResponse.json({ ok: false, error: 'Internal Error' }, { status: 500 });
  }
}
