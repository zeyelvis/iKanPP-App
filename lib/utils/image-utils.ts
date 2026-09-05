/**
 * 高性能智能图片 URL 优化器
 * 核心设计原则：
 * 1. TMDB 等原生高速全球 CDN 绝对直连加载，不经过自身服务器代理，实现 0 延迟秒开；
 * 2. 仅针对 doubanio.com 等具备严格反盗链限制的源使用 /api/img-proxy 镜像容灾通道；
 * 3. 相对路径或本地资源直接透传。
 */
export function getOptimizedImageUrl(url?: string | null, options?: { noFallback?: boolean }): string {
  if (!url) return '/placeholder-poster.svg';
  if (!url.startsWith('http')) return url;

  // TMDB 与豆瓣等外链图片统一通过高速边缘代理镜像输出，解决国内部分网络无法直连 image.tmdb.org 及豆瓣防盗链问题
  if (
    url.includes('image.tmdb.org') ||
    url.includes('tmdb.org') ||
    url.includes('doubanio.com') ||
    url.includes('douban.com')
  ) {
    const noFallbackQuery = options?.noFallback ? '&nofallback=1' : '';
    return `/api/img-proxy?url=${encodeURIComponent(url)}${noFallbackQuery}`;
  }

  return url;
}
