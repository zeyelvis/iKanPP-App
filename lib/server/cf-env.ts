import { getCloudflareContext } from '@opennextjs/cloudflare';

/**
 * 当前请求的 Cloudflare 绑定（KV、D1、R2、Analytics Engine）。OpenNext 下绑定只在请求上下文里可取；
 * 本地脚本或构建期不在 Workers 里时返回 null。
 */
export function cfEnv(): Record<string, any> | null {
  try {
    return getCloudflareContext().env as unknown as Record<string, any>;
  } catch {
    return null;
  }
}
