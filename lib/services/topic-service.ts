/**
 * 场景 4：程序化专题聚合服务 (Programmatic Topic Hub Service)
 * 自动生成于: 2026-09-22T20:18:18.442Z
 * 
 * 管理口语化长尾专题集合：
 * 1. 内置高权重预烘焙专题（0ms 秒开）
 * 2. 覆盖 Google 海量自然语言搜索意图
 */

import { kvGet, kvPut } from '@/lib/services/entity-kv';
import { TopicEntity, PREBAKED_TOPICS } from '@/lib/data/prebaked-topics';

export * from '@/lib/data/prebaked-topics';

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
