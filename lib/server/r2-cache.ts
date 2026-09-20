/**
 * Cloudflare R2 对象存储持久化镜像工具
 * 
 * 功能：
 * 1. 标准化图片存储键（严格遵循铁律：{source}/{width}/{filename}）
 * 2. 毫秒级从 img.ikanpp.com (CF CDN) 探测/读取已缓存海报
 * 3. 异步非阻塞 Write-Through 透写上传至 R2 存储桶 (永久持久化，零出站费)
 */

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';
const CF_AUTH_EMAIL = process.env.CLOUDFLARE_AUTH_EMAIL || '';
const CF_AUTH_KEY = process.env.CLOUDFLARE_AUTH_KEY || '';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'ikanpp-images';
// 优先使用 R2 亚太专属托管 CDN 域名，确保 100% 畅通直出
const R2_PUBLIC_BASE = (process.env.NEXT_PUBLIC_R2_DOMAIN || 'https://pub-e83e5b0b8f9348079dd0676e6c0c0563.r2.dev').replace(/\/+$/, '');

/**
 * 根据外部原始图片 URL 计算出规范的 R2 存储 Key
 * 规范：{source}/{width}/{filename}
 */
export function getR2KeyFromUrl(rawUrl: string, requestedWidth: number = 342): string {
  try {
    const parsed = new URL(rawUrl);

    // 1. TMDB 图片
    if (parsed.hostname.includes('tmdb.org')) {
      const match = parsed.pathname.match(/\/([^/]+\.(jpg|jpeg|png|webp|avif))$/i);
      const filename = match ? match[1] : parsed.pathname.split('/').pop() || 'poster.jpg';
      const widthPrefix = requestedWidth > 0 ? `w${requestedWidth}` : 'original';
      return `tmdb/${widthPrefix}/${filename}`;
    }

    // 2. 豆瓣图片
    if (parsed.hostname.includes('doubanio.com') || parsed.hostname.includes('douban.com')) {
      const match = parsed.pathname.match(/([^/]+\.(jpg|jpeg|png|webp|avif))$/i);
      const filename = match ? match[1] : parsed.pathname.split('/').pop() || 'douban.jpg';
      const widthPrefix = requestedWidth > 0 ? `w${requestedWidth}` : 'w342';
      return `douban/${widthPrefix}/${filename}`;
    }

    // 3. 其它合法外部源
    const cleanPath = parsed.pathname.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(-64);
    return `misc/w${requestedWidth}/${cleanPath}`;
  } catch {
    return `misc/w${requestedWidth}/fallback.jpg`;
  }
}

/**
 * 获取公开访问 URL
 */
export function getR2PublicUrl(key: string): string {
  return `${R2_PUBLIC_BASE}/${key}`;
}

/**
 * 尝试从 R2 / CDN 获取已缓存的图片
 * 命中返回 Response，未命中返回 null
 */
export async function fetchFromR2(key: string): Promise<Response | null> {
  try {
    const publicUrl = getR2PublicUrl(key);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(publicUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok && res.status === 200) {
      return res;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 将图片二进制持久化写入 Cloudflare R2
 * 修复：对路径各级目录分别编码，保留路径斜杠 /，确保 R2 能够正确分级存储
 */
export async function saveToR2Async(key: string, data: ArrayBuffer, contentType: string): Promise<boolean> {
  try {
    const encodedKeyPath = key.split('/').map(encodeURIComponent).join('/');
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodedKeyPath}`;

    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'X-Auth-Email': CF_AUTH_EMAIL,
        'X-Auth-Key': CF_AUTH_KEY,
        'Content-Type': contentType || 'image/jpeg',
      },
      body: data,
    });

    return res.ok;
  } catch (err) {
    console.warn('[R2 Write-Through Warning]', err);
    return false;
  }
}

