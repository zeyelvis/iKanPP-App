/**
 * 详情页全网骨干源极速直达探测缓存调度器 (Fast-Track Title Probe Scheduler)
 * 
 * 核心目标：
 * 消除详情页点击【立即播放】进入播放页后的二次搜源（search-parallel）与路由重写（router.replace），
 * 实现从详情页 0ms 瞬间带参（id & source）直达起播！
 */

export interface TitleProbeResult {
  success: boolean;
  title: string;
  matchedVodName?: string;
  id?: string | number;
  source?: string;
  totalEpisodes?: number;
  rawTotalCount?: number;
  remarks?: string;
  episodes?: Array<{ name: string; index: number; episodeNumber?: number; isSpecial?: boolean }>;
  specialEpisodes?: Array<{ name: string; index: number }>;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5分钟内存缓存
const probeCache = new Map<string, { data: TitleProbeResult; timestamp: number }>();
const pendingPromises = new Map<string, Promise<TitleProbeResult | null>>();
const listeners = new Map<string, Set<(result: TitleProbeResult) => void>>();

/**
 * 标准化标题缓存键
 */
function getCacheKey(title: string): string {
  return title.trim().toLowerCase();
}

/**
 * 同步检查是否已有探测成功的缓存结果
 */
export function getCachedTitleProbe(title?: string | null): TitleProbeResult | null {
  if (!title) return null;
  const key = getCacheKey(title);
  const cached = probeCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }
  return null;
}

/**
 * 订阅探测结果更新
 */
export function subscribeTitleProbe(
  title: string,
  callback: (result: TitleProbeResult) => void
): () => void {
  const key = getCacheKey(title);
  let set = listeners.get(key);
  if (!set) {
    set = new Set();
    listeners.set(key, set);
  }
  set.add(callback);

  // 如果已有缓存，立即同步推送一次
  const cached = getCachedTitleProbe(title);
  if (cached) {
    callback(cached);
  }

  return () => {
    set?.delete(callback);
    if (set && set.size === 0) {
      listeners.delete(key);
    }
  };
}

/**
 * 异步获取/触发探测（单例并发合并，杜绝多次重复请求）
 */
export async function fetchTitleProbe(title?: string | null): Promise<TitleProbeResult | null> {
  if (!title || !title.trim()) return null;
  const key = getCacheKey(title);

  // 1. 命中内存缓存
  const cached = getCachedTitleProbe(title);
  if (cached) {
    return cached;
  }

  // 2. 检查在飞请求合并
  const pending = pendingPromises.get(key);
  if (pending) {
    return pending;
  }

  // 3. 发起新探测请求
  const promise = (async () => {
    try {
      const res = await fetch(`/api/title-episodes?title=${encodeURIComponent(title.trim())}`, {
        // 利用浏览器与 CDN 缓存
        cache: 'default',
      });
      if (!res.ok) return null;
      const json = await res.json();
      if (json && json.success) {
        const result: TitleProbeResult = json;
        probeCache.set(key, { data: result, timestamp: Date.now() });

        // 通知所有订阅者（如 EpisodesSelector、TitleActionsBar、StickyBottomCTA）
        const set = listeners.get(key);
        if (set) {
          set.forEach(fn => fn(result));
        }
        return result;
      }
      return null;
    } catch {
      return null;
    } finally {
      pendingPromises.delete(key);
    }
  })();

  pendingPromises.set(key, promise);
  return promise;
}

/**
 * 极速解析直达播放目标（带超短超时守卫）
 * 用户点击【立即播放】时调用：
 * - 若已完成探测：0ms 返回 id & source
 * - 若正在探测：最多等待 timeoutMs 毫秒抢抓结果
 * - 若超时或未探测到：安全返回空对象，回退常规 title 跳转
 */
export async function resolvePlayTarget(
  title?: string | null,
  timeoutMs: number = 120
): Promise<{ id?: string | number; source?: string }> {
  if (!title || !title.trim()) return { source: 'juliang' };

  // 1. 0ms 同步直出
  const cached = getCachedTitleProbe(title);
  if (cached && cached.id && cached.source) {
    return { id: cached.id, source: cached.source };
  }

  // 2. 超短微窗口竞速（默认最多 120ms，杜绝阻塞主线程）
  try {
    const probePromise = fetchTitleProbe(title);
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs));
    const winner = await Promise.race([probePromise, timeoutPromise]);
    if (winner && winner.id && winner.source) {
      return { id: winner.id, source: winner.source };
    }
  } catch {
    // 忽略异常直接降级
  }

  // 3. 若超短竞速未出完整结果，默认直接以全站黄金 No.1 首选巨量源 (juliang) 直达起播
  return { source: 'juliang' };
}
