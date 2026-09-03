/**
 * iKanPP 每日海外华人爆款影视全自动广播机器人 (Telegram Broadcaster)
 * 作用：每天自动挑选 3 部最热门院线大片与热播剧集，推送到海外华人 Telegram 频道/社群
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// 爆款精选备用种子库
const FEATURED_DAILY_PICKS = [
  {
    title: '抓娃娃',
    type: '电影',
    rating: '9.2',
    tags: '喜剧 / 剧情 / 爆笑',
    desc: '沈腾马丽神级合体！年度破纪录爆笑院线巨制，海外免翻全网首播。',
    cover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2910704443.webp',
  },
  {
    title: '庆余年 第二季',
    type: '电视剧',
    rating: '8.9',
    tags: '古装 / 权谋 / 爽剧',
    desc: '范闲王者归来！朝堂风云诡谲，全网热度第一国民神剧全集超清看。',
    cover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2908000454.webp',
  },
  {
    title: '死侍与金刚狼',
    type: '电影',
    rating: '8.7',
    tags: '漫威 / 动作 / 科幻',
    desc: '小贱贱联手狼叔踏破多元宇宙！4K 原画极致打斗与视听风暴。',
    cover: 'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2910243283.webp',
  },
];

async function broadcastToTelegram() {
  console.log('🤖 [Telegram Bot] 正在准备每日海外华人爆款影视广播...');

  const dateStr = new Date().toLocaleDateString('zh-CN', {
    timeZone: 'Asia/Shanghai',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  });

  let message = `🍿 *iKanPP 爱看片片 · 每日爆款追剧精选* (${dateStr})\n\n`;
  message += `专为全球海外华人打造 · 免翻墙 4K 直连播放 · 0 会员 0 广告\n\n`;
  message += `━━━━━━━━━━━━━━━━━━\n\n`;

  for (const [index, item] of FEATURED_DAILY_PICKS.entries()) {
    const playUrl = `${BASE_URL}/player?title=${encodeURIComponent(item.title)}&type=${
      item.type === '电影' ? 'movie' : 'tv'
    }`;

    message += `🔥 *${index + 1}.《${item.title}》*  ⭐ ${item.rating}分\n`;
    message += `🏷️ 类别：${item.type} · ${item.tags}\n`;
    message += `📝 看点：${item.desc}\n`;
    message += `👉 [点击免翻秒开播放](${playUrl})\n\n`;
  }

  message += `━━━━━━━━━━━━━━━━━━\n`;
  message += `🌐 *iKanPP 官方免翻直连大厅*：[https://www.ikanpp.com](${BASE_URL})\n`;
  message += `💡 *分享给身边的海外华人朋友，一起畅快追剧吧！*`;

  console.log('📝 生成的消息预览：\n', message);

  if (!BOT_TOKEN || !CHAT_ID) {
    console.log('⚠️ [Telegram Bot] 未检测到 TELEGRAM_BOT_TOKEN 或 TELEGRAM_CHAT_ID，已完成本地广播生成（跳过网络请求）。');
    return;
  }

  try {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: false,
      }),
    });

    const data = await res.json();
    if (data.ok) {
      console.log('🎉 [Telegram Bot] 每日影视广播推送成功！');
    } else {
      console.error('❌ [Telegram Bot] 发送失败:', data);
    }
  } catch (err) {
    console.error('❌ [Telegram Bot] 网络请求异常:', err);
  }
}

broadcastToTelegram();
