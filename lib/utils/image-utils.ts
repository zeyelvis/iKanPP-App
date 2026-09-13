/**
 * 高性能智能图片 URL 优化器 v2.0
 * 
 * 核心架构铁律：
 * 1. 【精准降维】：强制使用与视口卡片匹配的物理最小尺寸（w185/w342/w780/w1280），体积降低 60%~80%
 * 2. 【地域分流】：
 *    - 海外用户 (≠CN)：TMDB 直接直连官方 Anycast CDN，0ms 边缘握手，零服务器开销；
 *    - 大陆用户 (CN)：通过 /api/img-proxy 走 Cloudflare R2 极速持久镜像与 CDN；
 * 3. 【防盗链守护】：豆瓣等外链全球统一走代理镜像通道；
 * 4. 【客户端零闪烁】：优先从 Cookie (geo-region) 同步秒级判定地域。
 */

export type ImageSizeVariant = 'thumb' | 'poster' | 'detail' | 'backdrop' | 'avatar';

export const SIZE_CONFIG: Record<ImageSizeVariant, { width: number }> = {
  thumb:    { width: 185 },  // 紧凑卡片 / 搜索下拉 / 演职员小图 (~6KB)
  poster:   { width: 342 },  // 标准海报瀑布流 (~15KB)
  detail:   { width: 780 },  // 详情页主画幅海报 (~35KB)
  backdrop: { width: 1280 }, // Hero 全景通栏巨幕剧照 (~50KB)
  avatar:   { width: 185 },  // 影人圆形头像 (~6KB)
};

export interface ImageOptimizationOptions {
  variant?: ImageSizeVariant;
  width?: number;
  isChinaMainland?: boolean;
  noFallback?: boolean;
}

/**
 * 客户端轻量同步获取地域标记 (从 Middleware 写入的 Cookie 读取)
 */
function getClientGeoRegion(): boolean {
  if (typeof document === 'undefined') return false;
  try {
    const match = document.cookie.match(/(?:^|;\s*)geo-region=([^;]*)/);
    if (match && match[1]) {
      return match[1].toUpperCase() === 'CN';
    }
  } catch {
    // 忽略异常
  }
  return false;
}

/**
 * 构建经过物理尺寸与地域路由双重优化的图片 URL
 */
export function getOptimizedImageUrl(
  url?: string | null,
  options?: ImageOptimizationOptions
): string {
  if (!url) return '/placeholder-poster.svg';
  if (!url.startsWith('http')) return url;

  // 1. 确定目标宽度
  let targetWidth = 342;
  if (options?.width && options.width > 0) {
    targetWidth = options.width;
  } else if (options?.variant && SIZE_CONFIG[options.variant]) {
    targetWidth = SIZE_CONFIG[options.variant].width;
  }

  // 2. 确定访客地域（options 指定优先，其次客户端 Cookie，默认海外）
  const isChina = options?.isChinaMainland !== undefined
    ? options.isChinaMainland
    : getClientGeoRegion();

  const isTmdb = url.includes('image.tmdb.org') || url.includes('tmdb.org');
  const isDouban = url.includes('doubanio.com') || url.includes('douban.com');

  // 3. 处理 TMDB 资源
  if (isTmdb) {
    // 精准尺寸重写 (例如将 /original/ 或 /w500/ 规范为 /w342/)
    const resizedTmdbUrl = url
      .replace(/\/t\/p\/(w\d+|original)\//, `/t/p/w${targetWidth}/`);

    if (isChina) {
      // 大陆用户：走 /api/img-proxy 接入 R2 镜像与 Cloudflare 边缘加速
      const noFallbackQuery = options?.noFallback ? '&nofallback=1' : '';
      return `/api/img-proxy?url=${encodeURIComponent(resizedTmdbUrl)}&w=${targetWidth}${noFallbackQuery}`;
    }

    // 海外用户：直连 TMDB 官方 CDN (Anycast 全球极速直出)
    return resizedTmdbUrl;
  }

  // 4. 处理豆瓣资源 (防盗链强限制，全球统一走 img-proxy)
  if (isDouban) {
    const noFallbackQuery = options?.noFallback ? '&nofallback=1' : '';
    return `/api/img-proxy?url=${encodeURIComponent(url)}&w=${targetWidth}${noFallbackQuery}`;
  }

  // 5. 其它通用外链：保持原链直出
  return url;
}
