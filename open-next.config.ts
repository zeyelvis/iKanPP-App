import { defineCloudflareConfig, getCloudflareContext } from '@opennextjs/cloudflare';
import r2IncrementalCache from '@opennextjs/cloudflare/overrides/incremental-cache/r2-incremental-cache';
import { withRegionalCache } from '@opennextjs/cloudflare/overrides/incremental-cache/regional-cache';
import doQueue from '@opennextjs/cloudflare/overrides/queue/do-queue';

// ISR 页面（作品页 1 小时、影人页 1 天）存在 R2，前面加各地区的 Cache API。
// 过期页面的重新生成经 Durable Object 队列在后台完成。
function requestWaitUntil(): ((work: Promise<unknown>) => void) | null {
  try {
    const { ctx } = getCloudflareContext();
    return typeof ctx?.waitUntil === 'function' ? (work) => ctx.waitUntil(work) : null;
  } catch {
    return null;
  }
}

// OpenNext 返回过期页面前会先等队列调用完成，而队列已有 5 个页面在重新生成时会把调用挂住，
// 过期页面因此要多等 0.5–2 秒（爬虫遍历片库时最明显）。改为在响应发出后再提交。
const backgroundQueue: typeof doQueue = {
  name: 'durable-queue-background',
  send: async (msg) => {
    const waitUntil = requestWaitUntil();
    if (!waitUntil) return doQueue.send(msg);
    waitUntil(doQueue.send(msg).catch((err: unknown) => console.log(JSON.stringify({ queue: 'send-failed', error: String(err) }))));
  },
};

export default defineCloudflareConfig({
  incrementalCache: withRegionalCache(r2IncrementalCache, { mode: 'long-lived' }),
  queue: backgroundQueue,
  // 在 Next 运行之前直接用缓存的 ISR 页面回答，并按每个缓存条目自己的 revalidate 判断是否过期。
  enableCacheInterception: true,
});
