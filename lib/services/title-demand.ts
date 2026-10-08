import { kvGet, kvPut } from '@/lib/server/kv';

/**
 * 用户求片记录（作品页「求片」按钮）。存在 KV：每部一条 demand:title:<编号>，另有按次数排序的前 100 名 demand:leaderboard。
 */
export interface TitleDemandRecord {
  entityId: string;
  title: string;
  year?: string;
  type?: string;
  poster?: string;
  count: number;
  firstRequestedAt: string;
  lastRequestedAt: string;
}

export async function recordTitleDemand(data: {
  entityId: string;
  title: string;
  year?: string;
  type?: string;
  poster?: string;
}): Promise<TitleDemandRecord> {
  const entityId = data.entityId.trim();
  const key = `demand:title:${entityId}`;
  const now = new Date().toISOString();

  let previous: TitleDemandRecord | null = null;
  try {
    const raw = await kvGet(key);
    if (raw) previous = JSON.parse(raw);
  } catch {}

  const record: TitleDemandRecord = previous
    ? {
        ...previous,
        title: data.title || previous.title,
        year: data.year || previous.year,
        type: data.type || previous.type,
        poster: data.poster || previous.poster,
        count: (previous.count || 1) + 1,
        lastRequestedAt: now,
      }
    : { entityId, title: data.title, year: data.year, type: data.type, poster: data.poster, count: 1, firstRequestedAt: now, lastRequestedAt: now };

  await kvPut(key, JSON.stringify(record));

  try {
    let board = await getTitleDemandLeaderboard(100);
    board = [record, ...board.filter((b) => b.entityId !== entityId)].sort((a, b) => (b.count || 0) - (a.count || 0)).slice(0, 100);
    await kvPut('demand:leaderboard', JSON.stringify(board));
  } catch (err) {
    console.warn('[title-demand] 更新排行失败:', err);
  }
  return record;
}

export async function getTitleDemandLeaderboard(limit = 50): Promise<TitleDemandRecord[]> {
  try {
    const parsed = JSON.parse((await kvGet('demand:leaderboard')) ?? '[]');
    return Array.isArray(parsed) ? parsed.slice(0, limit) : [];
  } catch {
    return [];
  }
}
