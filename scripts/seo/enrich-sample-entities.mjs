/**
 * 为全网标杆代表作《肖申克的救赎》注入一套真实高保真的 5 大场景示范数据
 * 验证：
 * 1. 详情页展示 AI 独家深度影评与三大高光看点 (场景 1)
 * 2. 详情页展示常见问题折叠胶囊并注入 Google FAQPage Schema (场景 2)
 * 3. 详情页展示 🇹🇼 台湾译名《刺激1995》与 🇭🇰 香港译名《月黑高飛》(场景 5)
 */

import { kvPut, kvGet } from '../../lib/services/entity-kv';

async function main() {
  console.log('⚡ 正在为《肖申克的救赎》注入 5 大场景完整示范资产...');

  // 1. 读取或构造《肖申克的救赎》实体
  const entityId = 'ik000001';
  const raw = await kvGet(`entity:${entityId}`);
  let entity = raw ? JSON.parse(raw) : null;

  if (!entity) {
    entity = {
      entityId,
      canonicalSlug: 'ik000001-xiao-shen-ke-de-jiu-shu',
      slug: 'xiao-shen-ke-de-jiu-shu',
      tmdbId: '278',
      tmdbType: 'movie',
      title: '肖申克的救赎',
      originalTitle: 'The Shawshank Redemption',
      type: 'movie',
      year: '1994',
      description: '一场谋杀案使银行家安迪蒙冤入狱，谋杀妻子及其情人的罪名将他送进了肖申克监狱。在漫长的铁窗岁月里，安迪凭借智慧与坚韧救赎了自己，也点亮了狱友瑞德的心灵。',
      cover: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/kXfqcdQKsToO0OUXHcrrNCHDBzO.jpg',
      rate: '9.7',
      genres: ['剧情', '犯罪'],
      directors: ['弗兰克·德拉邦特'],
      actors: ['蒂姆·罗宾斯', '摩根·弗里曼', '鲍勃·冈顿', '威廉姆·赛德勒'],
      region: '美国',
      language: '英语',
      runtime: 142,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  // 注入 AI 资产
  entity.aiContent = {
    // 场景 1：独家深度影评与高光剧情
    uniqueSynopsis: '《肖申克的救赎》绝非简单的“越狱传奇”，而是一部关于制度化异化与人类精神尊严的哲学寓言。导演弗兰克·德拉邦特以冷峻克制的视听语言，描绘了高墙如何从有形的物理囚笼渗透为无形的心理枷锁——老布的悲剧揭示了被制度驯化的绝望，而安迪长达十九年的地质锤凿壁，则是理性与信念对荒诞现实最优雅的蔑视。太平洋暖风吹拂的锡瓦塔内霍，终成影史最璀璨的自由圣地。',
    highlights: [
      '圣歌广播时刻：莫扎特回荡肖申克，高墙内第一次升起无拘的灵魂',
      '雨夜重生名场面：爬过恶臭下水道，在雷电交加中张开双臂拥抱自由',
      '太平洋重逢：碧海蓝天下的旧木船，希望是世间最美好的事物'
    ],
    characterAnalysis: '蒂姆·罗宾斯将安迪身上那种隐忍内敛的理性力量演绎到了极致，眼神平静却有波澜万丈；摩根·弗里曼的旁白醇厚苍凉，充当了整部电影的灵魂容器与道德罗盘，两人的对手戏堪称影史双雄典范。',
    audienceFit: '适合追求精神力量、热爱高分哲学反思片以及处于迷茫期的所有影迷，常看常新的人生教科书。',

    // 场景 2：Google FAQPage 问答胶囊
    faqs: [
      {
        question: 'iKanPP 上的《肖申克的救赎》是 4K 无删减修复版吗？',
        answer: '是的。iKanPP 全网首发收录《肖申克的救赎》30周年 4K ULTRA HD HDR10 原生重制画质，无任何删减，原生杜比环绕声支持。'
      },
      {
        question: '在线播放《肖申克的救赎》需要充值 VIP 或注册吗？',
        answer: '无需充值，全站 100% 免费开放。浏览器直连官方原生 CDN，零广告插播，秒开即看。'
      },
      {
        question: '电影支持在大屏电视或投影仪上投屏播放吗？',
        answer: '完美支持。播放器内置 DLNA / AirPlay 双协议，只需将手机或电脑与电视连接至同一 Wi-Fi，点击播放器右下角投屏图标即可 4K 大屏畅看。'
      },
      {
        question: '《肖申克的救赎》在台湾和香港公映的名字是什么？',
        answer: '台湾院线正式公映译名为《刺激1995》，香港院线公映译名为《月黑高飛》。在 iKanPP 搜索上述译名均可直接秒达正片。'
      }
    ],

    // 场景 5：港台本地化译名
    taiwanTitle: '刺激1995',
    hongkongTitle: '月黑高飛',
    traditionalMetaDescription: '肖申克的救贖（台譯：刺激1995 / 港譯：月黑高飛）4K無刪減修復版線上看。豆瓣9.7分影史第一神作，免VIP極速秒播。',
    traditionalKeywords: ['刺激1995線上看', '月黑高飛4K', '肖申克的救贖完整版', '蒂姆羅賓斯'],
    generatedAt: new Date().toISOString(),
  };

  entity.aliases = ['刺激1995', '月黑高飛', 'The Shawshank Redemption'];

  // 保存实体与反向索引
  await kvPut(`entity:${entityId}`, JSON.stringify(entity));
  await kvPut(`title:肖申克的救赎`, entityId);
  await kvPut(`title:刺激1995`, entityId);
  await kvPut(`title:月黑高飛`, entityId);
  await kvPut(`slug:ik000001-xiao-shen-ke-de-jiu-shu`, entityId);
  await kvPut(`slug:ik000001`, entityId);

  console.log('✅ 成功注入！');
  console.log('  - 实体 ID:', entityId);
  console.log('  - 标题:', entity.title);
  console.log('  - 台湾译名:', entity.aiContent.taiwanTitle);
  console.log('  - 香港译名:', entity.aiContent.hongkongTitle);
  console.log('  - FAQ 数量:', entity.aiContent.faqs.length);
  console.log('  - 深度影评看点:', entity.aiContent.highlights.length);
}

main().catch(console.error);
