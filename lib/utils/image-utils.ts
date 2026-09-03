/**
 * 高性能智能图片 URL 优化器
 * 核心设计原则：
 * 1. TMDB 等原生高速全球 CDN 绝对直连加载，不经过自身服务器代理，实现 0 延迟秒开；
 * 2. 仅针对 doubanio.com 等具备严格反盗链限制的源使用 /api/img-proxy 镜像容灾通道；
 * 3. 相对路径或本地资源直接透传。
 */
export function getOptimizedImageUrl(url?: string | null): string {
  if (!url) return '/placeholder-poster.svg';
  if (!url.startsWith('http')) return url;

  // TMDB 全球 CDN 直链（海外毫秒级直达，无需代理）
  if (url.includes('image.tmdb.org') || url.includes('tmdb.org')) {
    return url;
  }

  // 只有真正受防盗链限制的豆瓣图片才走后端反代
  if (url.includes('doubanio.com') || url.includes('douban.com')) {
    return `/api/img-proxy?url=${encodeURIComponent(url)}`;
  }

  return url;
}
