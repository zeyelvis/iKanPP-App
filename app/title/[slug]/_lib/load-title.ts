/**
 * 作品页数据（重构阶段 3）：只读 D1，不在页面访问时写任何数据、不同步请求 TMDB。
 * 网址解析见 lib/data/d1/title-route.ts（快照路由 → 片段表 → 编号 → 片名）。
 * 带季号的网址（/title/时光代理人第3季）与旧站一样在原网址显示该季，规范网址指向整部剧。
 */
import { cache } from 'react';
import type { TitleEntity } from '@/lib/types/entity';
import { getDb } from '@/lib/data/d1/db';
import { resolveTitleSegment } from '@/lib/data/d1/title-route';
import { rowToEntity } from '@/lib/data/d1/titles';
import { parseEntitySlug } from '@/lib/data/entities/entity-utils';
import { getPrebakedAiInsight } from '@/lib/data/prebaked-ai-insights';
import { parseSeasonFromTitle, type ParsedSeasonInfo } from '@/lib/utils/season-resolver';

export type TitlePageLoad =
  | { type: 'title'; entity: TitleEntity; season: ParsedSeasonInfo | null }
  | { type: 'redirect'; location: string }
  | { type: 'not-found' };

const safeDecode = (s: string) => {
  try {
    return decodeURIComponent(s);
  } catch {
    return s;
  }
};

/** 站内路径编码成可放进 Location 的形式（中文片段百分号编码）。 */
export const encodePath = (path: string) => path.split('/').map((part) => encodeURIComponent(part)).join('/');

export const loadTitlePage = cache(async (rawSlug: string): Promise<TitlePageLoad> => {
  const db = getDb();
  if (!db) return { type: 'not-found' };
  const decoded = safeDecode(rawSlug).trim();
  const { entityId, slug: inner } = parseEntitySlug(decoded);
  const season = parseSeasonFromTitle(inner || (entityId ? '' : decoded));

  let r = await resolveTitleSegment(db, rawSlug);
  // 季号网址解析到整部剧的规范网址时，不跳转，原地显示该季。
  if (r.type === 'redirect' && season && r.location.startsWith('/title/')) {
    const target = await resolveTitleSegment(db, r.location.slice('/title/'.length));
    if (target.type === 'title' && target.row.kind !== 'movie' && !(target.row.name ?? '').includes(season.rawSeasonMatch)) r = target;
  }
  if (r.type !== 'title') return r;

  const entity = rowToEntity(r.row, r.canonicalPath.slice('/title/'.length));
  // 已有的独家长文（2026-10-08 起冻结，不再生成）：KV 里没有的从预置数据补上，与旧站一致。
  const prebakedAi = getPrebakedAiInsight({ title: entity.title, entityId: entity.entityId, slug: entity.slug });
  if (prebakedAi) entity.aiContent = { ...prebakedAi, ...(entity.aiContent || {}) };
  const seasonSpecified = Boolean(season && !entity.title.includes(season.rawSeasonMatch));
  return { type: 'title', entity, season: seasonSpecified ? season : null };
});
