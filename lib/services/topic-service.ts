/**
 * 场景 4：程序化专题聚合服务 (Programmatic Topic Hub Service)
 * 
 * 管理口语化长尾专题集合：
 * 1. 内置高权重预烘焙专题（0ms 秒开）
 * 2. 支持通过大模型 (GPT-5.6-Sol / GPT-6-Astra) 自动生成并持久化写入 KV
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

// 预烘焙的热门自然语言搜索专题库 (0ms 秒开保底)
export const PREBAKED_TOPICS: Record<string, TopicEntity> = {
  'ao-ye-bi-kan-xuan-yi-shen-ju': {
    slug: 'ao-ye-bi-kan-xuan-yi-shen-ju',
    topicTitle: '绝不注水！熬夜必看的10部反转悬疑神剧盘点',
    metaTitle: '熬夜必看高分反转悬疑神剧盘点推荐 - 4K无删减完整版免费在线看 | iKanPP',
    metaDescription: '精选豆瓣8.5分以上、节奏紧凑绝不拖沓的高智商悬疑推理神剧，反转不断无尿点，支持 4K 超清免 VIP 纯直连秒播。',
    curatorNote: '在快餐式追剧时代，真正能让观众屏息凝神、彻夜难眠的悬疑神作凤毛麟角。本专题由 iKanPP 影库独立精选，剔除所有剧情注水、逻辑崩坏的平庸之作，聚焦于极致的反转博弈、心理博弈与社会派人性深潜。无论你偏好英美硬核本格推理，还是华语高能社会犯罪题材，这批作品都能带给你肾上腺素飙升的解谜快感。',
    longTailKeywords: ['高分悬疑剧推荐', '反转烧脑神剧', '熬夜必看悬疑片单', '高智商推理电视剧', '免VIP完整版'],
    intentFamily: '反转悬疑 · 烧脑推理',
    titles: [
      {
        title: '漫长的季节',
        type: 'tv',
        year: '2023',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg',
        href: '/title/ik000002-man-chang-de-ji-jie',
        highlight: '华语生活悬疑天花板，玉米地里的时代悲歌与命运闭环',
      },
      {
        title: '绝命毒师 第五季',
        type: 'tv',
        year: '2012',
        rate: '9.7',
        cover: 'https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg',
        href: '/title/ik000003-breaking-bad',
        highlight: '影史无可超越的封神之作，老白帝国的盛极而衰',
      },
      {
        title: '沉默的真相',
        type: 'tv',
        year: '2020',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a.jpg',
        href: '/title/ik000004-chen-mo-de-zhen-xiang',
        highlight: '赤子之心照亮长夜，令人泪目的正义接力',
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
  },
  'zhi-yu-xi-dian-ying-tui-jian': {
    slug: 'zhi-yu-xi-dian-ying-tui-jian',
    topicTitle: '适合情侣周末窝在沙发看的温暖治愈系电影',
    metaTitle: '周末情侣高分治愈系温情电影推荐 - 4K超清画质在线看 | iKanPP',
    metaDescription: '告别工作日的疲惫与喧嚣，本片单精选豆瓣高分治愈系温情佳作，唯美配乐与细腻情感交织，适合二人世界安静品味。',
    curatorNote: '快节奏的生活常让我们疲于奔命，唯有在周末的黄昏与爱人依偎在沙发上，让光影的温度慢慢抚平身心的疲惫。本专题以“温柔的治愈力”为母题，涵盖了公路漫游、奇幻陪伴与平淡日常中的温存细节。每一部电影都如同一杯热可可，用细腻的视听语言提醒我们生活原本的美好与纯粹。',
    longTailKeywords: ['情侣周末电影推荐', '高分治愈系电影', '温暖解压片单', '二人世界看什么电影', '豆瓣高分温情片'],
    intentFamily: '治愈温情 · 周末慢调',
    titles: [
      {
        title: '肖申克的救赎',
        type: 'movie',
        year: '1994',
        rate: '9.7',
        cover: 'https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg',
        href: '/title/ik000001-xiao-shen-ke-de-jiu-shu',
        highlight: '希望是美好的事物，也许是世间最美好的东西',
      },
    ],
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-20T00:00:00Z',
  },
};

/**
 * 获取专题详情 (优先 KV，后备预烘焙)
 */
export async function getTopicBySlug(slug: string): Promise<TopicEntity | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  // 1. 尝试从 KV 读取
  try {
    const raw = await kvGet(`topic:${cleanSlug}`);
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

  await kvPut(`topic:${cleanSlug}`, JSON.stringify(topic));

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
