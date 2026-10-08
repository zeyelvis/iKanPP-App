import { cfEnv } from '@/lib/server/cf-env';
import type { D1Like } from './title-route';

/** `next build` 会预渲染没有参数的页面（首页、频道页）。 */
export const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

/**
 * 当前请求的 D1 ikanpp-db；构建期与不在 Workers 请求里时为 null。
 * 构建期不读数据库：本地没有数据，构建产物里这些页面会在部署前删掉（scripts/drop-build-prerenders.mjs），
 * 上线后第一次真实请求再渲染并缓存。
 */
export function getDb(): D1Like | null {
  if (isBuildPhase) return null;
  return (cfEnv()?.DB as D1Like | undefined) ?? null;
}
