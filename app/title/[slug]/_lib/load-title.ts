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
import { generateSlug, normalizeTitle, parseEntitySlug } from '@/lib/data/entities/entity-utils';
import { loadHomeDocs } from '@/lib/data/d1/home-docs';
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

/**
 * 片库里还没有、但首页或频道横轨上展示着的作品（入库 Worker 的最新上线、轮播、货架）：按卡片资料直出，
 * 与旧站详情页「预烘焙直连匹配」一致（AGENTS 准则 13.1：前台展示即必达）。网址用纯片名（旧站对没有标准编号的
 * 作品就是这样生成链接的）；切换后入库 Worker 会为它们建档，届时片名网址按片名找到作品 308 过去。
 */
async function cardFallback(seg: string): Promise<TitlePageLoad> {
  const name = seg.replace(/^ik_[a-z]+_[^-]*(?:-[0-9a-f%]*)?-/i, '').replace(/^ik\d{6}-/i, '');
  const key = normalizeTitle(name.replace(/-/g, ' '));
  if (!key) return { type: 'not-found' };
  const { home, latest } = await loadHomeDocs();
  type Card = { title: string; cover?: string; backdrop?: string; year?: string; rate?: string; type?: string; genres?: string[]; types?: string[]; description?: string; updateBadge?: string; episodes_info?: string; tmdbId?: string };
  const pool: Card[] = [
    ...Object.values(latest).flat(),
    ...Object.values(home).flatMap((h) => [...h.hero, ...h.top10, ...h.s1, ...h.s2, ...h.s3, ...h.s4]),
  ] as Card[];
  const card = pool.find((c) => c?.title && normalizeTitle(c.title) === key && c.cover);
  if (!card) return { type: 'not-found' };
  const slug = generateSlug(card.title);
  if (safeDecode(seg) !== slug) return { type: 'redirect', location: `/title/${slug}` };
  const kind = card.type && ['movie', 'tv', 'anime', 'variety', 'documentary'].includes(card.type) ? card.type : 'tv';
  const entity: TitleEntity = {
    // 不是标准编号：链接与规范网址都用纯片名（getTitleCanonicalHref 对非 ik + 6 位编号就是这样）
    entityId: `ik_card_${slug}`,
    slug,
    canonicalSlug: slug,
    tmdbId: card.tmdbId ?? '',
    tmdbType: kind === 'movie' ? 'movie' : 'tv',
    title: card.title,
    type: kind,
    year: card.year ?? '',
    description: card.description ?? '',
    cover: card.cover ?? '',
    backdrop: card.backdrop,
    rate: card.rate ?? '',
    genres: card.genres ?? card.types ?? [],
    directors: [],
    actors: [],
    status: card.updateBadge ?? card.episodes_info,
    createdAt: '',
    updatedAt: '',
  };
  return { type: 'title', entity, season: null };
}

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
  if (r.type === 'not-found') return cardFallback(rawSlug);
  if (r.type !== 'title') return r;

  const entity = rowToEntity(r.row, r.canonicalPath.slice('/title/'.length));
  // 已有的独家长文（2026-10-08 起冻结，不再生成）：KV 里没有的从预置数据补上，与旧站一致。
  const prebakedAi = getPrebakedAiInsight({ title: entity.title, entityId: entity.entityId, slug: entity.slug });
  if (prebakedAi) entity.aiContent = { ...prebakedAi, ...(entity.aiContent || {}) };
  const seasonSpecified = Boolean(season && !entity.title.includes(season.rawSeasonMatch));
  return { type: 'title', entity, season: seasonSpecified ? season : null };
});
