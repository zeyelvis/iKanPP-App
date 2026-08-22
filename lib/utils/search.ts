/**
 * Search Utilities
 * Search relevance scoring and optimization
 */

import type { VideoItem } from '@/lib/types';

/**
 * Check if title contains at least 2 consecutive characters from search query
 * This filters out irrelevant results
 */
export function hasMinimumMatch(title: string, query: string): boolean {
  const normalizedTitle = title.toLowerCase();
  const normalizedQuery = query.toLowerCase().trim();

  // Extract all 2+ character substrings from query
  for (let i = 0; i <= normalizedQuery.length - 2; i++) {
    const substring = normalizedQuery.slice(i, i + 2);
    if (normalizedTitle.includes(substring)) {
      return true;
    }
  }
  return false;
}

/**
 * 提取纯净核心片名（去除版本、年份、季数、清晰度、方括号等噪音）
 */
export function extractCleanBaseTitle(title: string): string {
  if (!title) return '';
  return title
    .replace(/\[[^\]]*\]/g, '')     // 移除 [全集]、[国语] 等
    .replace(/【[^】]*】/g, '')     // 移除 【4K】等
    .replace(/\([^)]*\)/g, '')       // 移除 (2023) 等
    .replace(/（[^）]*）/g, '')     // 移除 （国语版）等
    .replace(/(第[0-9一二三四五六七八九十]+[季部集期话]|全[0-9]+[集话期]|更新至[0-9]+[集话期]?|[0-9]+集全|HD|BD|TC|TS|4K|1080P|720P|国语版|粤语版|未删减版|先行版|抢先版|超清|高清|中字|双字|原画)/gi, '')
    .replace(/[\s\-_:：·\.]+(19\d\d|20\d\d)(年)?$/gi, '') // 移除末尾年份如 "狂飙 2023"
    .replace(/(19\d\d|20\d\d)(年)?$/gi, '')              // 移除直接紧跟的年份
    .replace(/[\s\-_:：·\.]+/g, '')
    .toLowerCase()
    .trim();
}

/**
 * 智能相关度评分算法 (Relevance Scoring Engine)
 * 确保核心目标大剧/大片以绝对优势排在最前列，衍生片（如“XX之XX”）合理降权
 */
export function calculateRelevanceScore(item: VideoItem, query: string): number {
  let score = 0;
  const rawQuery = query.toLowerCase().trim();
  const rawTitle = (item.vod_name || '').toLowerCase().trim();

  const cleanQuery = extractCleanBaseTitle(rawQuery);
  const cleanTitle = extractCleanBaseTitle(rawTitle);

  if (!cleanQuery || !cleanTitle) return 0;

  // 1. 完全一致的核心原名（最高优先级：给 10000 分，绝对置顶）
  // 例如：搜“狂飙”，片名为“狂飙”、“狂飙[全39集]”、“狂飙 (2023)”、“狂飙 国语版”全部命中
  if (cleanTitle === cleanQuery) {
    score += 10000;

    // 额外加分：正片集数多的剧集（如全39集）通常是正版连续剧大作
    if (item.vod_remarks) {
      const rem = item.vod_remarks.toLowerCase();
      if (/全[0-9]+集|[0-9]+集全|完结|更新至/.test(rem)) {
        score += 500;
      }
    }
    return score;
  }

  // 2. 判断是否为衍生作品（如“狂飙之逃出生天”、“狂飙：极限行动”、“狂飙前传”）
  const isDerivative = /之|：|:|-|_|后传|前传|外传|大电影|篇/.test(rawTitle);

  // 3. 标题以查询词开头
  if (cleanTitle.startsWith(cleanQuery)) {
    if (isDerivative) {
      // 衍生剧/外传：给予适中分数（300分），绝对不压过主剧
      score += 300;
    } else {
      // 正常长标题或续集（如“狂飙第二部”）：给予 800 分
      score += 800;
    }
  } else if (cleanTitle.includes(cleanQuery)) {
    // 4. 标题中间包含查询词（如“新狂飙”）
    score += 200;
  }

  // 5. 演员完全匹配（如搜张译、张颂文）
  if (item.vod_actor) {
    const actors = item.vod_actor.toLowerCase();
    if (actors.includes(rawQuery) || actors.includes(cleanQuery)) {
      score += 400;
    }
  }

  // 6. 导演匹配
  if (item.vod_director) {
    const director = item.vod_director.toLowerCase();
    if (director.includes(rawQuery) || director.includes(cleanQuery)) {
      score += 200;
    }
  }

  // 7. 剧集集数与清晰度加分
  if (item.vod_remarks) {
    const rem = item.vod_remarks.toLowerCase();
    if (/全[0-9]+集|[0-9]+集全|完结/.test(rem)) score += 50;
    if (rem.includes('4k') || rem.includes('1080') || rem.includes('蓝光')) score += 30;
  }

  return Math.max(0, score);
}

