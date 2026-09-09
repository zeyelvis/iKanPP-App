import { PREBAKED_AVATARS } from '@/lib/data/prebaked-avatars';
import { getOptimizedImageUrl } from '@/lib/utils/image-utils';

const avatarMemoryCache = new Map<string, string>();
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';

/**
 * 获取单个影人（导演/演员）的真实官方高清肖像头像
 */
export async function getPersonAvatar(name: string): Promise<string | null> {
  if (!name || typeof name !== 'string') return null;
  const cleanName = name.trim();
  if (!cleanName || cleanName === '实力主演' || cleanName === '导演') return null;

  // 1. 优先查预置高清人物肖像字典（0ms），全自动边缘代理中转
  if (PREBAKED_AVATARS[cleanName]) {
    return getOptimizedImageUrl(PREBAKED_AVATARS[cleanName]);
  }

  // 2. 查内存缓存
  if (avatarMemoryCache.has(cleanName)) {
    return avatarMemoryCache.get(cleanName) || null;
  }

  // 3. 从 TMDB API 在线检索
  try {
    const searchUrl = `${TMDB_BASE}/search/person?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanName)}`;
    const res = await fetch(searchUrl, {
      headers: { Accept: 'application/json' },
      next: { revalidate: 86400 * 7 }, // 缓存 7 天
    });

    if (!res.ok) return null;

    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results : [];
    if (results.length === 0) {
      avatarMemoryCache.set(cleanName, '');
      return null;
    }

    // 优选带肖像照的知名影人
    const candidate = results.find((p: any) => Boolean(p.profile_path)) || results[0];
    if (candidate?.profile_path) {
      const rawUrl = `https://image.tmdb.org/t/p/w185${candidate.profile_path}`;
      const avatarUrl = getOptimizedImageUrl(rawUrl);
      avatarMemoryCache.set(cleanName, avatarUrl);
      return avatarUrl;
    }

    avatarMemoryCache.set(cleanName, '');
    return null;
  } catch (err) {
    console.error(`[Avatar] Failed to fetch avatar for ${cleanName}:`, err);
    return null;
  }
}

/**
 * 批量并行获取多位影人的肖像字典
 */
export async function getPersonAvatars(names: string[]): Promise<Record<string, string>> {
  if (!names || names.length === 0) return {};

  const uniqueNames = Array.from(new Set(names.map(n => n.trim()).filter(Boolean)));
  const result: Record<string, string> = {};

  await Promise.all(
    uniqueNames.map(async (name) => {
      const avatar = await getPersonAvatar(name);
      if (avatar) {
        result[name] = avatar;
      }
    })
  );

  return result;
}
