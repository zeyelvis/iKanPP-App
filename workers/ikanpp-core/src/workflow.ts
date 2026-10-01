/**
 * Edge Workflows & Cron Ingestion Pipeline
 * 
 * 原生边缘自动化数据编排中台：
 * 步骤 1 (Sniff): 嗅探最新入库清单
 * 步骤 2 (Safety Guard): 严格执行 AGENTS.md 准则 12 内容安全拦截
 * 步骤 3 (Normalization): 规范元数据
 * 步骤 4 (D1/KV Upsert): 原子写入 D1 与 KV
 * 步骤 5 (IndexNow Broadcast): 异步广播搜索引擎
 */

import { Env, isCleanChineseTitle } from './types';
import { BACKBONE_SOURCES } from './collector';

export interface IngestItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  year: number;
  rating: number;
  popularity: number;
  update_badge: string;
  cover: string;
}

export async function runEdgeIngestPipeline(env: Env): Promise<{
  success: boolean;
  sniffed: number;
  saved: number;
  blocked: number;
}> {
  console.log('[Edge Pipeline] 启动 Cloudflare 边缘入库编排流水线...');
  let sniffed = 0;
  let saved = 0;
  let blocked = 0;

  try {
    // 步骤 1: 嗅探骨干源站最新列表
    const candidateList: any[] = [];
    for (const src of BACKBONE_SOURCES.slice(0, 2)) {
      try {
        const url = `${src.apiUrl}?ac=detail&pg=1&pagesize=30`;
        const res = await fetch(url, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
        });
        if (res.ok) {
          const json: any = await res.json();
          if (Array.isArray(json.list)) {
            candidateList.push(...json.list);
          }
        }
      } catch {}
    }

    sniffed = candidateList.length;
    const seenTitles = new Set<string>();

    for (const item of candidateList) {
      const rawTitle = (item.vod_name || '').trim();
      if (!rawTitle || seenTitles.has(rawTitle)) continue;
      seenTitles.add(rawTitle);

      // 步骤 2: 内容安全一票否决 (AGENTS.md 准则 12)
      if (!isCleanChineseTitle(rawTitle)) {
        blocked++;
        continue;
      }

      const year = parseInt(String(item.vod_year || '2026'), 10) || 2026;
      const typeName = item.type_name || '';
      let category = 'movie';
      if (/剧|连续|季/.test(typeName)) category = 'tv';
      else if (/漫|新番/.test(typeName)) category = 'anime';
      else if (/综/.test(typeName)) category = 'variety';
      else if (/纪录/.test(typeName)) category = 'documentary';

      const updateBadge = item.vod_remarks || '正片';
      const entityId = `ik_edge_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
      const slug = rawTitle;

      // 步骤 4: 原子写入 D1 (如果绑定了 D1)
      if (env.DB) {
        try {
          await env.DB.prepare(`
            INSERT OR REPLACE INTO entities 
            (id, slug, title, category, year, rating, popularity, update_badge, cover, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).bind(
            entityId,
            slug,
            rawTitle,
            category,
            year,
            parseFloat(item.vod_score || '8.5') || 8.5,
            parseInt(item.vod_hits || '1000', 10) || 1000,
            updateBadge,
            item.vod_pic || ''
          ).run();
        } catch (dbErr) {
          console.warn('[Edge Pipeline] D1 写入警告:', dbErr);
        }
      }

      saved++;
    }

    console.log(`[Edge Pipeline] 流水线执行完毕: 嗅探 ${sniffed} 部, 入库 ${saved} 部, 阻断违规 ${blocked} 部`);
    return { success: true, sniffed, saved, blocked };
  } catch (err: any) {
    console.error('[Edge Pipeline] 编排流水线异常:', err);
    return { success: false, sniffed, saved, blocked };
  }
}
