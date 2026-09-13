/**
 * Cloudflare R2 对象存储持久化镜像工具
 * 
 * 功能：
 * 1. 标准化图片存储键（严格遵循铁律：{source}/{width}/{filename}）
 * 2. 毫秒级从 img.ikanpp.com (CF CDN) 探测/读取已缓存海报
 * 3. 异步非阻塞 Write-Through 透写上传至 R2 存储桶 (永久持久化，零出站费)
 */

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const CF_AUTH_EMAIL = process.env.CLOUDFLARE_AUTH_EMAIL || 'zeyelvis@gmail.com';
const CF_AUTH_KEY = process.env.CLOUDFLARE_AUTH_KEY || 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'ikanpp-images';
const R2_PUBLIC_BASE = (process.env.NEXT_PUBLIC_R2_DOMAIN || 'https://img.ikanpp.com').replace(/\/+$/, '');

/**
 * 根据外部原始图片 URL 计算出规范的 R2 存储 Key
 * 规范：{source}/{width}/{filename}
 */
export function getR2KeyFromUrl(rawUrl: string, requestedWidth: number = 342): string {
  try {
    const parsed = new URL(rawUrl);

    // 1. TMDB 图片
    if (parsed.hostname.includes('tmdb.org')) {
      // 提取 TMDB 路径，例如 /t/p/w500/abc.jpg -> abc.jpg
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

    // 3. 其它合法外部源（通过简单 hash/clean path 归类）
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
 * 命中返回 Response，未命中（404 或网络波动）返回 null
 */
export async function fetchFromR2(key: string): Promise<Response | null> {
  try {
    const publicUrl = getR2PublicUrl(key);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2500); // 2.5s 极速探测

    const res = await fetch(publicUrl, {
      method: 'GET',
      headers: {
        'Accept': 'image/avif,image/webp,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (res.ok) {
      return res;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * 异步将图片二进制持久化写入 Cloudflare R2
 * （非阻塞执行，即使上传异常也不影响用户正常看图）
 */
export async function saveToR2Async(key: string, data: ArrayBuffer, contentType: string): Promise<void> {
  try {
    const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodeURIComponent(key)}`;

    await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'X-Auth-Email': CF_AUTH_EMAIL,
        'X-Auth-Key': CF_AUTH_KEY,
        'Content-Type': contentType || 'image/jpeg',
      },
      body: data,
    });
  } catch (err) {
    console.warn('[R2 Write-Through Warning]', err);
  }
}
