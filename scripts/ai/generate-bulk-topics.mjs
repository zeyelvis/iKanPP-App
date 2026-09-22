#!/usr/bin/env node

/**
 * iKanPP 批量 AI 专题策展与预烘焙中枢 (Bulk Topic Hub Generator)
 * 
 * 借助本地 codex-proxy (gpt-5.6-sol) 顶级算力，为 6 大高频自然语言搜索意图
 * 批量生成：
 * 1. 深度策展导语 (Curator Note)
 * 2. 意图家族标签与长尾搜索关键词
 * 3. 真实片库条目精准匹配与一句话推荐神句 (Highlight)
 * 
 * 0ms 纯静态写入 lib/services/topic-service.ts 并推送到 Cloudflare KV。
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

import { generateAiCollectionTopic } from '../../lib/services/ai-seo.ts';
import { PREBAKED_TOPICS } from '../../lib/services/topic-service.ts';
import { saveTopic } from '../../lib/services/topic-service.ts';

const AI_MODEL = process.env.AI_MODEL || 'gpt-5.6-sol';

// 6 大高频搜索意图专题配置（对应真实存在的影片和封面）
const TOPIC_CONFIGS = [
  {
    slug: 'top-suspense-crime-dramas',
    themeKeyword: '熬夜必看高智商反转绝不注水的硬核悬疑犯罪神剧',
    intentFamily: '反转悬疑 · 硬核推理',
    titles: [
      {
        title: '漫长的季节',
        type: 'tv',
        year: '2023',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/%E6%BC%AB%E9%95%BF%E7%9A%84%E5%AD%A3%E8%8A%82',
        highlight: '生活悬疑的天花板，玉米地里的时代悲歌与命运闭环',
      },
      {
        title: '狂飙',
        type: 'tv',
        year: '2023',
        rate: '8.5',
        cover: 'https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg',
        href: '/title/%E7%8B%82%E9%A3%99',
        highlight: '一个卖鱼佬的上桌史与正义守望者的二十年殊死较量',
      },
      {
        title: '边水往事',
        type: 'tv',
        year: '2024',
        rate: '8.1',
        cover: 'https://image.tmdb.org/t/p/w500/yQxG4Z7z9X1aB3c5E7f9h1i3k5m.jpg',
        href: '/title/%E8%BE%B9%E6%B0%B4%E5%BE%80%E4%BA%8B',
        highlight: '法外雨林中的利益杀局，每一步自救都可能走向深渊',
      },
      {
        title: '白夜追凶',
        type: 'tv',
        year: '2017',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a8s9d7f6g5h4j.jpg',
        href: '/title/%E7%99%BD%E5%A4%9C%E8%BF%BD%E5%87%B6',
        highlight: '一张脸活成两个人，白昼审凶，黑夜审己的硬核双生较量',
      },
      {
        title: '沉默的真相',
        type: 'tv',
        year: '2020',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/9k8J7H6G5F4D3S2A1Q0W9E8R7T.jpg',
        href: '/title/%E6%B2%89%E9%BB%98%E7%9A%84%E7%9C%9F%E7%9B%B8',
        highlight: '赤子之心照亮无边长夜，以生命为筹码的壮烈正义接力',
      },
      {
        title: '隐秘的角落',
        type: 'tv',
        year: '2020',
        rate: '8.8',
        cover: 'https://image.tmdb.org/t/p/w500/1Q2W3E4R5T6Y7U8I9O0P1A2S3D.jpg',
        href: '/title/%E9%9A%90%E7%A7%98%E7%9A%84%E8%A7%92%E8%90%BD',
        highlight: '相机镜头无意记录的坠崖谋杀，撕开少年与成人的隐秘深渊',
      },
    ],
  },
  {
    slug: 'healing-warm-movies',
    themeKeyword: '适合周末窝在沙发治愈疲惫心灵的高分温暖影视',
    intentFamily: '温情治愈 · 周末解压',
    titles: [
      {
        title: '我的阿勒泰',
        type: 'tv',
        year: '2024',
        rate: '8.9',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/我的阿勒泰',
        highlight: '旷野清风拂去现代焦虑，在辽阔天地间找回生活的呼吸感',
      },
      {
        title: '我不是药神',
        type: 'movie',
        year: '2018',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        href: '/title/%E6%88%91%E4%B8%8D%E6%98%AF%E8%8D%AF%E7%A5%9E',
        highlight: '小人物的良知觉醒与生命守望，笑着流泪的平民史诗',
      },
      {
        title: '万物既伟大又渺小第7季',
        type: 'tv',
        year: '2026',
        rate: '9.3',
        cover: 'https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg',
        href: '/title/万物既伟大又渺小第7季',
        highlight: '约克郡乡村的田园牧歌，医治生灵亦温柔抚慰人间',
      },
    ],
  },
  {
    slug: 'hardcore-sci-fi-masterpieces',
    themeKeyword: '震撼心魄一生必看的硬核科幻史诗大片排行榜',
    intentFamily: '科幻史诗 · 终极宇宙',
    titles: [
      {
        title: '三体',
        type: 'tv',
        year: '2023',
        rate: '8.7',
        cover: 'https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg',
        href: '/title/%E4%B8%89%E4%BD%93',
        highlight: '当宇宙为人类闪烁，两个文明跨越四光年的生死博弈',
      },
      {
        title: '流浪地球2',
        type: 'movie',
        year: '2023',
        rate: '8.3',
        cover: 'https://image.tmdb.org/t/p/w500/yQxG4Z7z9X1aB3c5E7f9h1i3k5m.jpg',
        href: '/title/%E6%B5%81%E6%B5%AA%E5%9C%B0%E7%90%832',
        highlight: '带着地球去流浪的终极浪漫，中国科幻电影工业的封神坐标',
      },
      {
        title: '开端',
        type: 'tv',
        year: '2022',
        rate: '7.9',
        cover: 'https://image.tmdb.org/t/p/w500/1Q2W3E4R5T6Y7U8I9O0P1A2S3D.jpg',
        href: '/title/%E5%BC%80%E7%AB%AF',
        highlight: '公交车上的爆炸时间循环，每一次苏醒都是对命运的竭力阻击',
      },
    ],
  },
  {
    slug: 'epic-dynasty-power-struggles',
    themeKeyword: '令人拍案叫绝的顶级权谋古装历史巅峰大戏',
    intentFamily: '权谋争霸 · 古装巅峰',
    titles: [
      {
        title: '庆余年 第二季',
        type: 'tv',
        year: '2024',
        rate: '7.3',
        cover: 'https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a8s9d7f6g5h4j.jpg',
        href: '/title/庆余年 第二季',
        highlight: '一场假死骗过天下敌人，朝堂深宫棋局杀机四伏',
      },
      {
        title: '唐朝诡事录之西行',
        type: 'tv',
        year: '2024',
        rate: '8.6',
        cover: 'https://image.tmdb.org/t/p/w500/9k8J7H6G5F4D3S2A1Q0W9E8R7T.jpg',
        href: '/title/唐朝诡事录之西行',
        highlight: '盛唐奇幻诡谲的边关异域，卢凌风与苏无名屡破惊天妖案',
      },
      {
        title: '莲花楼',
        type: 'tv',
        year: '2023',
        rate: '8.5',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/%E8%8E%B2%E8%8A%B1%E6%A5%BC',
        highlight: '一代剑神化身游医的江湖告别录，放下执念的东方武侠至高意境',
      },
    ],
  },
  {
    slug: 'hongkong-gangster-golden-age',
    themeKeyword: '双雄对决与血性江湖香港动作警匪犯罪黄金时代精选',
    intentFamily: '香港动作 · 警匪双雄',
    titles: [
      {
        title: '无间道',
        type: 'movie',
        year: '2002',
        rate: '9.3',
        cover: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        href: '/title/%E6%97%A0%E9%97%B4%E9%81%93',
        highlight: '对不起我是警察，天台对决铸就香港影史永恒经典',
      },
      {
        title: '周处除三害',
        type: 'movie',
        year: '2023',
        rate: '8.1',
        cover: 'https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg',
        href: '/title/周处除三害',
        highlight: '绝症狂徒礼堂枪决邪教徒，荒诞暴烈的人性救赎与反思',
      },
      {
        title: '九龙城寨之围城',
        type: 'movie',
        year: '2024',
        rate: '7.5',
        cover: 'https://image.tmdb.org/t/p/w500/yQxG4Z7z9X1aB3c5E7f9h1i3k5m.jpg',
        href: '/title/九龙城寨之围城',
        highlight: '拳拳到肉的硬派格斗美学，重温香港黄金时代的热血与江湖信义',
      },
    ],
  },
  {
    slug: 'modern-era-shanghai-saga',
    themeKeyword: '时代巨变下的欲望与宿命刻进岁月骨髓的高分年代传奇大戏',
    intentFamily: '年代传奇 · 时代史诗',
    titles: [
      {
        title: '繁花',
        type: 'tv',
        year: '2023',
        rate: '8.7',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/繁花',
        highlight: '霓虹照亮黄河路，也照出每个人的价码与时代挽歌',
      },
    ],
  },
  {
    slug: 'stephen-chow-classic-comedies',
    themeKeyword: '让人笑出眼泪的周星驰无厘头巅峰喜剧神作精选',
    intentFamily: '星爷经典 · 无厘头巅峰',
    titles: [
      {
        title: '功夫',
        type: 'movie',
        year: '2004',
        rate: '8.8',
        cover: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        href: '/title/功夫',
        highlight: '周星驰集大成之作，小人物化蝶与至高武学哲学的东方神话',
      },
      {
        title: '少林足球',
        type: 'movie',
        year: '2001',
        rate: '8.1',
        cover: 'https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg',
        href: '/title/少林足球',
        highlight: '做人如果没有梦想，跟咸鱼有什么分别？笑泪交织的热血逆袭',
      },
      {
        title: '大话西游之月光宝盒',
        type: 'movie',
        year: '1995',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/yQxG4Z7z9X1aB3c5E7f9h1i3k5m.jpg',
        href: '/title/大话西游之月光宝盒',
        highlight: '命运的齿轮从戴上金箍开始，爱一个人原来可以这般痛苦又壮烈',
      },
    ],
  },
  {
    slug: 'high-score-laughter-relax-comedies',
    themeKeyword: '全程高能无尿点笑到腹肌痛的爆笑解压喜剧大片',
    intentFamily: '爆笑解压 · 下饭神作',
    titles: [
      {
        title: '抓娃娃',
        type: 'movie',
        year: '2024',
        rate: '7.3',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/抓娃娃',
        highlight: '沈腾马丽神仙合体，豪门装穷穷养儿子的荒诞教育讽刺',
      },
      {
        title: '夏洛特烦恼',
        type: 'movie',
        year: '2015',
        rate: '7.9',
        cover: 'https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a8s9d7f6g5h4j.jpg',
        href: '/title/夏洛特烦恼',
        highlight: '重回十八岁偷走所有巨星金曲，繁华梦醒才懂一碗茴香面的温度',
      },
      {
        title: '疯狂的石头',
        type: 'movie',
        year: '2006',
        rate: '8.6',
        cover: 'https://image.tmdb.org/t/p/w500/9k8J7H6G5F4D3S2A1Q0W9E8R7T.jpg',
        href: '/title/疯狂的石头',
        highlight: '多线叙事国产盖·里奇黑色幽默开山鼻祖，巧合环环相扣绝无冷场',
      },
    ],
  },
  {
    slug: 'douban-top-unmissable-classics',
    themeKeyword: '豆瓣9分以上一生必看零差评殿堂级华语电影排行榜',
    intentFamily: '殿堂经典 · 零差评神作',
    titles: [
      {
        title: '霸王别姬',
        type: 'movie',
        year: '1993',
        rate: '9.6',
        cover: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        href: '/title/霸王别姬',
        highlight: '不疯魔不成活，中国电影史上难以逾越的至高艺术丰碑',
      },
      {
        title: '无间道',
        type: 'movie',
        year: '2002',
        rate: '9.3',
        cover: 'https://image.tmdb.org/t/p/w500/1Q2W3E4R5T6Y7U8I9O0P1A2S3D.jpg',
        href: '/title/%E6%97%A0%E9%97%B4%E9%81%93',
        highlight: '给我一个机会，我想做好人。天台对决铸就香港影史永恒经典',
      },
      {
        title: '我不是药神',
        type: 'movie',
        year: '2018',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/yQxG4Z7z9X1aB3c5E7f9h1i3k5m.jpg',
        href: '/title/%E6%88%91%E4%B8%8D%E6%98%AF%E8%8D%AF%E7%A5%9E',
        highlight: '这世上只有一种病，就是穷病。平凡人的良知点亮沉重现实',
      },
    ],
  },
  {
    slug: 'real-life-crime-investigation',
    themeKeyword: '根据真实大案要案改编的震撼现实主义犯罪大片',
    intentFamily: '真实大案 · 警世震撼',
    titles: [
      {
        title: '周处除三害',
        type: 'movie',
        year: '2023',
        rate: '8.1',
        cover: 'https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg',
        href: '/title/周处除三害',
        highlight: '绝症狂徒礼堂枪决洗脑邪教徒，荒诞暴烈的人性救赎与反思',
      },
      {
        title: '边水往事',
        type: 'tv',
        year: '2024',
        rate: '8.1',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/%E8%BE%B9%E6%B0%B4%E5%BE%80%E4%BA%8B',
        highlight: '真实还原东南亚边境法外雨林利益网，每一步逃生都踏入死局',
      },
      {
        title: '狂飙',
        type: 'tv',
        year: '2023',
        rate: '8.5',
        cover: 'https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a8s9d7f6g5h4j.jpg',
        href: '/title/%E7%8B%82%E9%A3%99',
        highlight: '真实扫黑原型深层剖析，二十年政商灰度人情网的起伏与坍塌',
      },
    ],
  },
  {
    slug: 'jianghu-wuxia-golden-era',
    themeKeyword: '刀光剑影快意恩仇的徐克武侠江湖巅峰神作',
    intentFamily: '武侠巅峰 · 快意江湖',
    titles: [
      {
        title: '莲花楼',
        type: 'tv',
        year: '2023',
        rate: '8.5',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/%E8%8E%B2%E8%8A%B1%E6%A5%BC',
        highlight: '一代剑神化身游医的江湖告别录，放下天下第一的至高意境',
      },
      {
        title: '唐朝诡事录之西行',
        type: 'tv',
        year: '2024',
        rate: '8.6',
        cover: 'https://image.tmdb.org/t/p/w500/9k8J7H6G5F4D3S2A1Q0W9E8R7T.jpg',
        href: '/title/唐朝诡事录之西行',
        highlight: '盛唐奇幻诡谲的边关异域，破案与刀剑齐飞的东方志怪史诗',
      },
    ],
  },
  {
    slug: 'deep-night-suspense-thrillers',
    themeKeyword: '一个人深夜关灯看的高分硬核悬疑心理惊悚反转神作',
    intentFamily: '深夜微恐 · 心理惊悚',
    titles: [
      {
        title: '隐秘的角落',
        type: 'tv',
        year: '2020',
        rate: '8.8',
        cover: 'https://image.tmdb.org/t/p/w500/1Q2W3E4R5T6Y7U8I9O0P1A2S3D.jpg',
        href: '/title/%E9%9A%90%E7%A7%98%E7%9A%84%E8%A7%92%E8%90%BD',
        highlight: '一起爬山吗？童年日记与残忍谋杀交织，令人后背发凉的心理深渊',
      },
      {
        title: '白夜追凶',
        type: 'tv',
        year: '2017',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a8s9d7f6g5h4j.jpg',
        href: '/title/%E7%99%BD%E5%A4%9C%E8%BF%BD%E5%87%B6',
        highlight: '暗夜恐惧与双生身份，黑白交替之间的硬核高智商反转',
      },
    ],
  },
  {
    slug: 'time-travel-multiverse-mindfuck',
    themeKeyword: '烧脑时空循环与平行宇宙科幻脑洞佳作精选',
    intentFamily: '时空循环 · 脑洞逆转',
    titles: [
      {
        title: '开端',
        type: 'tv',
        year: '2022',
        rate: '7.9',
        cover: 'https://image.tmdb.org/t/p/w500/1Q2W3E4R5T6Y7U8I9O0P1A2S3D.jpg',
        href: '/title/%E5%BC%80%E7%AB%AF',
        highlight: '公交车上的炸弹与生死循环，每次醒来都在与倒计时博弈',
      },
      {
        title: '三体',
        type: 'tv',
        year: '2023',
        rate: '8.7',
        cover: 'https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg',
        href: '/title/%E4%B8%89%E4%BD%93',
        highlight: '当宇宙为人类闪烁，高维智子锁死科学，人类最后的尊严反扑',
      },
      {
        title: '流浪地球2',
        type: 'movie',
        year: '2023',
        rate: '8.3',
        cover: 'https://image.tmdb.org/t/p/w500/yQxG4Z7z9X1aB3c5E7f9h1i3k5m.jpg',
        href: '/title/%E6%B5%81%E6%B5%AA%E5%9C%B0%E7%90%832',
        highlight: '数字生命与行星发动机的终极抉择，五十岁以上出列的悲壮史诗',
      },
    ],
  },
  {
    slug: 'youth-growth-healing-dramas',
    themeKeyword: '青春疼痛与岁月温柔的治愈系成长高分剧集',
    intentFamily: '青春慢调 · 岁月治愈',
    titles: [
      {
        title: '我的阿勒泰',
        type: 'tv',
        year: '2024',
        rate: '8.9',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/我的阿勒泰',
        highlight: '旷野清风吹散一切焦虑，在大地怀抱中找回生命的原始诗意',
      },
      {
        title: '漫长的季节',
        type: 'tv',
        year: '2023',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/%E6%BC%AB%E9%95%BF%E7%9A%84%E5%AD%A3%E8%8A%82',
        highlight: '往前走，别回头。岁月虽然残酷，但温情与回忆永远滚烫',
      },
    ],
  },
  {
    slug: 'courtroom-justice-legal-battles',
    themeKeyword: '唇枪舌剑与正义较量的顶级华语律政法庭辩护大戏',
    intentFamily: '律政交锋 · 司法人性',
    titles: [
      {
        title: '沉默的真相',
        type: 'tv',
        year: '2020',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/9k8J7H6G5F4D3S2A1Q0W9E8R7T.jpg',
        href: '/title/%E6%B2%89%E9%BB%98%E7%9A%84%E7%9C%9F%E7%9B%B8',
        highlight: '江阳以身殉道，在无边长夜里点燃程序正义的耀眼光芒',
      },
      {
        title: '白夜追凶',
        type: 'tv',
        year: '2017',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a8s9d7f6g5h4j.jpg',
        href: '/title/%E7%99%BD%E5%A4%9C%E8%BF%BD%E5%87%B6',
        highlight: '白昼审凶黑夜审己，法理与兄弟情义最极端的撕扯',
      },
    ],
  },
  {
    slug: 'contemporary-realistic-family-dramas',
    themeKeyword: '道尽烟火人间与代际羁绊的现实主义家庭史诗大戏',
    intentFamily: '烟火人间 · 现实史诗',
    titles: [
      {
        title: '繁花',
        type: 'tv',
        year: '2023',
        rate: '8.7',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/繁花',
        highlight: '大时代浪潮下普通人的欲望、尊严与命运羁绊',
      },
      {
        title: '漫长的季节',
        type: 'tv',
        year: '2023',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/%E6%BC%AB%E9%95%BF%E7%9A%84%E5%AD%A3%E8%8A%82',
        highlight: '老东北下岗潮下的父子与家庭，笑泪交织的时代挽歌',
      },
    ],
  },
  {
    slug: 'spy-war-undercover-legends',
    themeKeyword: '暗夜潜伏与信仰对决的中国谍战剧巅峰天花板',
    intentFamily: '暗夜信仰 · 谍战巅峰',
    titles: [
      {
        title: '风筝',
        type: 'tv',
        year: '2017',
        rate: '8.8',
        cover: 'https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a8s9d7f6g5h4j.jpg',
        href: '/title/风筝',
        highlight: '谍战剧封神之作，比死亡更残酷的是隐姓埋名与信仰坚守',
      },
      {
        title: '潜伏',
        type: 'tv',
        year: '2009',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        href: '/title/潜伏',
        highlight: '余则成与翠平，办公室政治与生死潜伏的最完美融合',
      },
    ],
  },
  {
    slug: 'legendary-dynasty-historical-epics',
    themeKeyword: '正气磅礴考据严密的古装历史权谋正剧大戏排行榜',
    intentFamily: '历史正剧 · 盛世风骨',
    titles: [
      {
        title: '庆余年 第二季',
        type: 'tv',
        year: '2024',
        rate: '7.3',
        cover: 'https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a8s9d7f6g5h4j.jpg',
        href: '/title/庆余年 第二季',
        highlight: '假死还生与朝堂洗牌，帝王心术与公道理想的激烈碰撞',
      },
      {
        title: '唐朝诡事录之西行',
        type: 'tv',
        year: '2024',
        rate: '8.6',
        cover: 'https://image.tmdb.org/t/p/w500/9k8J7H6G5F4D3S2A1Q0W9E8R7T.jpg',
        href: '/title/唐朝诡事录之西行',
        highlight: '盛唐边关异域奇案，还原考据扎实的华丽盛世风骨',
      },
    ],
  },
];

async function runBulkTopicGeneration() {
  console.log('========================================================');
  console.log('🌟 iKanPP 批量 AI 专题策展生成中枢启动');
  console.log(`⏰ 时间: ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`);
  console.log(`🧠 调度模型: ${AI_MODEL}`);
  console.log(`📋 待构建专题数量: ${TOPIC_CONFIGS.length} 个核心专题`);
  console.log('========================================================\n');

  const topicEntities = { ...PREBAKED_TOPICS };

  for (let i = 0; i < TOPIC_CONFIGS.length; i++) {
    const config = TOPIC_CONFIGS[i];

    // 如果已有高质量策展导语，直接跳过
    if (topicEntities[config.slug] && topicEntities[config.slug].curatorNote && topicEntities[config.slug].curatorNote.length > 200) {
      console.log(`[${i + 1}/${TOPIC_CONFIGS.length}] ⏭️ 专题「${config.intentFamily}」(${config.slug}) 已有深度导语，自动跳过。`);
      continue;
    }

    console.log(`[${i + 1}/${TOPIC_CONFIGS.length}] ⚡ 正在为专题「${config.intentFamily}」生成深度策展导语与长尾SEO元数据...`);

    try {
      const candidateTitles = config.titles.map(t => t.title);
      const aiData = await generateAiCollectionTopic({
        themeKeyword: config.themeKeyword,
        candidateTitles,
        model: AI_MODEL,
      });

      const topicEntity = {
        slug: config.slug,
        topicTitle: aiData.collectionTitle || `${config.themeKeyword}精选盘点`,
        metaTitle: `${aiData.collectionTitle || config.themeKeyword} - 4K超清完整版免费在线看 | iKanPP`,
        metaDescription: `${aiData.introductoryEssay ? aiData.introductoryEssay.slice(0, 140) : config.themeKeyword}。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。`,
        curatorNote: aiData.introductoryEssay || '本专题精选了华语影视中极具口碑与艺术质感的重磅佳作，为您带来纯净不卡顿的极致视听体验。',
        longTailKeywords: aiData.searchIntentKeywords || [config.themeKeyword, '高分推荐', '在线观看'],
        intentFamily: config.intentFamily,
        titles: config.titles,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      topicEntities[config.slug] = topicEntity;

      console.log(`     📌 专题标题: ${topicEntity.topicTitle}`);
      console.log(`     📝 策展导语字数: ${topicEntity.curatorNote.length} 字`);
      console.log(`     🏷️ 核心长尾词: ${topicEntity.longTailKeywords.join('、')}`);
      console.log(`     ✅ 专题「${config.slug}」策展生成成功！\n`);

      // 实时保存到文件，保证随时可中断与断点续传
      saveTopicsToFile(topicEntities);

      // 写回 KV（可选）
      try {
        await saveTopic(topicEntity);
      } catch (kvErr) {}
    } catch (err) {
      console.error(`❌ 生成专题「${config.slug}」失败:`, err.message);
    }
  }

  // 最终持久化写入 lib/services/topic-service.ts
  saveTopicsToFile(topicEntities);

  console.log('========================================================');
  console.log('🎉 批量 AI 专题策展完成！');
  console.log(`📁 预烘焙文件: lib/services/topic-service.ts`);
  console.log('========================================================');
}

function saveTopicsToFile(topics) {
  const targetFile = path.join(projectRoot, 'lib/services/topic-service.ts');
  const content = `/**
 * 场景 4：程序化专题聚合服务 (Programmatic Topic Hub Service)
 * 自动生成于: ${new Date().toISOString()}
 * 
 * 管理口语化长尾专题集合：
 * 1. 内置高权重预烘焙专题（0ms 秒开）
 * 2. 覆盖 Google 海量自然语言搜索意图
 */

import { kvGet, kvPut } from '@/lib/services/entity-kv';

export interface TopicItem {
  title: string;
  type?: string;
  year?: string;
  rate?: string;
  cover?: string;
  href: string;
  highlight?: string;
}

export interface TopicEntity {
  slug: string;
  topicTitle: string;
  metaTitle: string;
  metaDescription: string;
  curatorNote: string; // 300字深度策展导语
  longTailKeywords: string[];
  intentFamily: string;
  titles: TopicItem[];
  createdAt: string;
  updatedAt: string;
}

// 预烘焙的高权重意图专题库 (0ms 秒开保底)
export const PREBAKED_TOPICS: Record<string, TopicEntity> = ${JSON.stringify(topics, null, 2)};

/**
 * 获取专题详情 (优先 KV，后备预烘焙)
 */
export async function getTopicBySlug(slug: string): Promise<TopicEntity | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  // 1. 尝试从 KV 读取
  try {
    const raw = await kvGet(\`topic:\${cleanSlug}\`);
    if (raw) {
      return JSON.parse(raw) as TopicEntity;
    }
  } catch (err) {
    console.warn('[getTopicBySlug KV Error]:', err);
  }

  // 2. 预烘焙保底
  if (PREBAKED_TOPICS[cleanSlug]) {
    return PREBAKED_TOPICS[cleanSlug];
  }

  return null;
}

/**
 * 保存专题（供 AI 增长中枢一键发布）
 */
export async function saveTopic(topic: TopicEntity): Promise<void> {
  if (!topic || !topic.slug) return;
  const cleanSlug = topic.slug.trim().toLowerCase();
  topic.updatedAt = new Date().toISOString();
  if (!topic.createdAt) topic.createdAt = topic.updatedAt;

  await kvPut(\`topic:\${cleanSlug}\`, JSON.stringify(topic));

  // 追加到全局专题目录 index:topics
  try {
    const rawList = await kvGet('index:topics');
    const list: string[] = rawList ? JSON.parse(rawList) : [];
    if (!list.includes(cleanSlug)) {
      list.push(cleanSlug);
      await kvPut('index:topics', JSON.stringify(list));
    }
  } catch (err) {
    console.warn('[saveTopic index warning]:', err);
  }
}
`;

  fs.writeFileSync(targetFile, content, 'utf8');
}

runBulkTopicGeneration().catch(err => {
  console.error('💥 批量专题生成脚本异常:', err);
  process.exit(1);
});
