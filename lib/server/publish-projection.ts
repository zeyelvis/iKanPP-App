import type { PublishedTitleEntity, FactProvenance, RatingFact, AvailabilityFact } from '../types/entity.ts';
import type { D1EntityRecord } from './entity-repository.ts';

/**
 * 构造统一哈希载荷文本
 */
function buildHashPayload(data: {
  title: string;
  year?: string | number;
  synopsis?: string;
  ratingValue?: number;
  ratingCount?: number;
}): string {
  return [
    data.title.trim(),
    String(data.year || ''),
    (data.synopsis || '').trim().slice(0, 300),
    String(data.ratingValue || ''),
    String(data.ratingCount || ''),
  ].join('|');
}

/**
 * 计算实体内容哈希 (同步版本，兼顾 Node.js 与多环境运行时)
 */
export function computeEntityContentHash(data: {
  title: string;
  year?: string | number;
  synopsis?: string;
  ratingValue?: number;
  ratingCount?: number;
}): string {
  const payload = buildHashPayload(data);

  // 1. 尝试 Node.js 环境下的 node:crypto
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const nodeCrypto = require('crypto');
    if (nodeCrypto && typeof nodeCrypto.createHash === 'function') {
      return nodeCrypto.createHash('sha256').update(payload).digest('hex');
    }
  } catch {
    // 处于纯 Edge 或无 require 环境，回退到字符串确定性散列
  }

  // 2. 兜底确定性 64 位散列 (确保在任何极端无内置环境仍保持 64 位十六进制格式)
  let h1 = 0xdeadbeef ^ 0;
  let h2 = 0x41c64e6d ^ 0;
  for (let i = 0; i < payload.length; i++) {
    const ch = payload.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const part1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const part2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return (part1 + part2).repeat(4);
}

/**
 * 计算实体内容哈希 (异步 Web Crypto API 标准版本，全球 Edge / Browser / Node 统一)
 */
export async function computeEntityContentHashAsync(data: {
  title: string;
  year?: string | number;
  synopsis?: string;
  ratingValue?: number;
  ratingCount?: number;
}): Promise<string> {
  const payload = buildHashPayload(data);
  if (typeof crypto !== 'undefined' && crypto.subtle) {
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(payload));
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  return computeEntityContentHash(data);
}

/**
 * 发布投影服务类 (PublishProjectionService)
 */
export class PublishProjectionService {
  static computeHash = computeEntityContentHash;
  static project = projectToPublishedEntity;
}

/**
 * 将 D1 权威记录转换为符合 PublishedTitleEntity 的无假值 KV 投影
 */
export function projectToPublishedEntity(
  d1Record: D1EntityRecord,
  facts: {
    provenanceMap?: Record<string, FactProvenance>;
    rating?: RatingFact;
    availability?: AvailabilityFact[];
    cover?: string;
    backdrop?: string;
    aliases?: string[];
  } = {}
): PublishedTitleEntity {
  const contentHash = computeEntityContentHash({
    title: d1Record.primary_title,
    year: d1Record.release_year,
    synopsis: d1Record.synopsis,
    ratingValue: facts.rating?.value,
    ratingCount: facts.rating?.count,
  });

  return {
    entityId: d1Record.entity_id,
    canonicalSlug: d1Record.canonical_slug,
    identityVersion: 1,
    title: d1Record.primary_title,
    originalTitle: d1Record.original_title,
    aliases: facts.aliases || [],
    mediaType: d1Record.media_type,
    releaseDate: d1Record.release_date,
    releaseDatePrecision: 'year',
    description: d1Record.synopsis,
    cover: facts.cover,
    backdrop: facts.backdrop,
    rating: facts.rating,
    availability: facts.availability || [],
    factProvenance: facts.provenanceMap || {},
    indexState: d1Record.index_state === 'indexable' ? 'indexable' : 'noindex',
    seoScore: d1Record.seo_score || 0,
    contentHash,
    materialUpdatedAt: d1Record.updated_at,
    publishedAt: d1Record.created_at,
  };
}
