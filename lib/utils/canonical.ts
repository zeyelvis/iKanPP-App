import { generateSlug } from '@/lib/data/entities/entity-utils';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

export interface MinimalTitleEntity {
  entityId?: string;
  canonicalSlug?: string;
  slug?: string;
  title?: string;
}

/**
 * 获取影视详情页权威相对路径 (对应规范 6.3 节)
 */
export function getCanonicalTitlePath(entity: MinimalTitleEntity): string {
  if (entity.canonicalSlug && entity.canonicalSlug.trim()) {
    return `/title/${entity.canonicalSlug.trim()}`;
  }
  const id = entity.entityId || '';
  const fallbackSlug = generateSlug(entity.slug || entity.title || 'detail');
  return `/title/${id ? `${id}-${fallbackSlug}` : fallbackSlug}`;
}

/**
 * 获取影视详情页权威绝对 URL
 */
export function getCanonicalTitleUrl(entity: MinimalTitleEntity): string {
  return `${BASE_URL}${getCanonicalTitlePath(entity)}`;
}

/**
 * 获取演职员权威相对路径
 */
export function getCanonicalPersonPath(type: 'actor' | 'director', name: string): string {
  const cleanName = encodeURIComponent(name.trim());
  return `/${type}/${cleanName}`;
}

/**
 * 获取题材分类权威相对路径
 */
export function getCanonicalGenrePath(slug: string): string {
  return `/genre/${encodeURIComponent(slug.trim())}`;
}

/**
 * 获取精选片单权威相对路径
 */
export function getCanonicalCollectionPath(slug: string): string {
  return `/collection/${encodeURIComponent(slug.trim())}`;
}

/**
 * 转换相对路径为标准绝对 URL
 */
export function toAbsoluteUrl(pathname: string): string {
  if (pathname.startsWith('http://') || pathname.startsWith('https://')) {
    return pathname;
  }
  const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${BASE_URL}${cleanPath}`;
}
