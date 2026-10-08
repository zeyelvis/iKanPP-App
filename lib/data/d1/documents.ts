/**
 * 入库 Worker 写进 D1 documents 表的整份数据集（重构阶段 3 取代仓库里每小时提交的预烘焙文件）：
 * - home:<频道>     轮播、热播标签、榜单与货架（hero 与 trendingNav 由入库 Worker 每小时更新）
 * - latest:<频道>   最新上线横轨
 * - category:<频道> 频道大厅货架
 * - rank:<排序>:<频道> 爱壹帆四大排序
 * 页面按需读取自己用到的几份（一次查询），再经 PageDataProvider 交给客户端组件。
 */
import { getDb } from './db';

export async function loadDocuments(keys: string[]): Promise<Record<string, unknown>> {
  const db = getDb();
  if (!db || !keys.length) return {};
  const rows = await db
    .prepare(`SELECT key, value FROM documents WHERE key IN (${keys.map(() => '?').join(',')})`)
    .bind(...keys)
    .all<{ key: string; value: string }>();
  const out: Record<string, unknown> = {};
  for (const r of rows.results) {
    try {
      out[r.key] = JSON.parse(r.value);
    } catch {
      // 坏数据当作没有，页面用空列表
    }
  }
  return out;
}
