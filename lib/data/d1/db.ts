import { cache } from 'react';
import { cfEnv } from '@/lib/server/cf-env';
import type { D1Like } from './title-route';

/**
 * D1 读副本（2026-10-08 开启）：每个请求开一个会话，第一条查询走最近的副本（主库在亚太，Googlebot 多从美国来），
 * 同一会话里后续查询保持一致。片库只由入库 Worker 写，副本落后几秒不影响页面。
 */
const sessionFor = cache((binding: { withSession?: (c: string) => unknown }) =>
  (binding.withSession ? binding.withSession('first-unconstrained') : binding) as D1Like,
);

/** `next build` 会预渲染没有参数的页面（首页、频道页）。 */
export const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

/**
 * 当前请求的 D1 ikanpp-db；构建期与不在 Workers 请求里时为 null。
 * 构建期不读数据库：本地没有数据，构建产物里这些页面会在部署前删掉（scripts/drop-build-prerenders.mjs），
 * 上线后第一次真实请求再渲染并缓存。
 */
export function getDb(): D1Like | null {
  if (isBuildPhase) return null;
  const binding = cfEnv()?.DB as { withSession?: (c: string) => unknown } | undefined;
  return binding ? sessionFor(binding) : null;
}
