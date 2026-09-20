/**
 * 详情页专属三维静态资产 Cloudflare R2 主动批量预热脚本
 * 
 * 作用：
 * 针对影视详情页 (/title/[slug]) 必须的三大关键图片进行精准预热：
 * 1. 【巨幕全景剧照】：w1280 (backdrop) — 沉浸式背景，首屏视觉核心
 * 2. 【详情高清封面】：w780 (detail) — 详情页主画幅大图
 * 3. 【导演/主演头像】：w185 (avatar) — 演职员圆形头像列表
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const CF_AUTH_EMAIL = process.env.CLOUDFLARE_AUTH_EMAIL || 'zeyelvis@gmail.com';
const CF_AUTH_KEY = process.env.CLOUDFLARE_AUTH_KEY || '';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'ikanpp-images';

function getR2Key(rawUrl, width) {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.hostname.includes('tmdb.org')) {
      const match = parsed.pathname.match(/\/([^/]+\.(jpg|jpeg|png|webp|avif))$/i);
      const filename = match ? match[1] : parsed.pathname.split('/').pop() || 'poster.jpg';
      return `tmdb/w${width}/${filename}`;
    }
    if (parsed.hostname.includes('doubanio.com') || parsed.hostname.includes('douban.com')) {
      const match = parsed.pathname.match(/([^/]+\.(jpg|jpeg|png|webp|avif))$/i);
      const filename = match ? match[1] : parsed.pathname.split('/').pop() || 'douban.jpg';
      return `douban/w${width}/${filename}`;
    }
    const cleanPath = parsed.pathname.replace(/[^a-zA-Z0-9_.-]/g, '_').slice(-64);
    return `misc/w${width}/${cleanPath}`;
  } catch {
    return null;
  }
}

async function uploadToR2(key, buffer, contentType) {
  const encodedKeyPath = key.split('/').map(encodeURIComponent).join('/');
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodedKeyPath}`;

  const res = await fetch(endpoint, {
    method: 'PUT',
    headers: {
      'X-Auth-Email': CF_AUTH_EMAIL,
      'X-Auth-Key': CF_AUTH_KEY,
      'Content-Type': contentType || 'image/jpeg',
    },
    body: buffer,
  });

  return res.ok;
}

async function fetchImage(url, targetWidth) {
  let finalUrl = url;
  if (url.includes('tmdb.org')) {
    finalUrl = url.replace(/\/t\/p\/(w\d+|original)\//, `/t/p/w${targetWidth}/`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let referer = '';
  if (url.includes('douban')) referer = 'https://movie.douban.com/';

  try {
    const res = await fetch(finalUrl, {
      headers: {
        'Referer': referer,
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        Accept: 'image/avif,image/webp,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const contentType = res.headers.get('content-type') || 'image/jpeg';
      const buffer = await res.arrayBuffer();
      return { buffer, contentType };
    }
  } catch {
    clearTimeout(timeout);
  }
  return null;
}

async function main() {
  console.log('🎬 开始收集详情页专属核心图片资产...');
  const tasks = [];

  // 1. 演职员头像 (w185)
  const avatarsFile = path.join(ROOT_DIR, 'lib', 'data', 'prebaked-avatars.ts');
  if (fs.existsSync(avatarsFile)) {
    const content = fs.readFileSync(avatarsFile, 'utf-8');
    const avatarUrls = content.match(/https:\/\/image\.tmdb\.org[^\s'"]+/g) || [];
    for (const url of new Set(avatarUrls)) {
      tasks.push({ url, width: 185, type: 'avatar' });
    }
    console.log(`👤 提取到 ${new Set(avatarUrls).size} 位知名导演/演员高清头像 (w185)`);
  }

  // 2. 核心大片封面 (w780 详情大图) 与剧照 (w1280 巨幕背景)
  const homePrebakedFile = path.join(ROOT_DIR, 'lib', 'data', 'home-prebaked.ts');
  if (fs.existsSync(homePrebakedFile)) {
    const content = fs.readFileSync(homePrebakedFile, 'utf-8');
    const matches = content.match(/https?:\/\/[^\s'"`]+\.(jpg|jpeg|png|webp|avif)[^\s'"`]*/gi) || [];
    const unique = Array.from(new Set(matches)).slice(0, 60);

    for (const url of unique) {
      // 详情封面 w780
      tasks.push({ url, width: 780, type: 'detail-cover' });
      // 巨幕背景 w1280 (针对 TMDB 原图)
      if (url.includes('tmdb.org')) {
        tasks.push({ url, width: 1280, type: 'hero-backdrop' });
      }
    }
    console.log(`🖼️ 提取到热门影片封面与剧照共 ${tasks.length} 项详情页渲染任务`);
  }

  console.log(`\n🚀 开始高并发预热详情页 ${tasks.length} 张核心资产进入 R2 亚太存储桶...`);

  let successCount = 0;
  let failCount = 0;
  const concurrency = 6;
  let index = 0;

  async function worker() {
    while (index < tasks.length) {
      const current = tasks[index++];
      const key = getR2Key(current.url, current.width);
      if (!key) {
        failCount++;
        continue;
      }

      const imgData = await fetchImage(current.url, current.width);
      if (imgData) {
        const ok = await uploadToR2(key, imgData.buffer, imgData.contentType);
        if (ok) {
          successCount++;
          process.stdout.write(`\r✅ [${successCount + failCount}/${tasks.length}] 详情页预热成功: ${key} (${(imgData.buffer.byteLength / 1024).toFixed(1)} KB)`);
        } else {
          failCount++;
        }
      } else {
        failCount++;
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);

  console.log(`\n\n🎉 详情页专属三维预热全部大功告成！`);
  console.log(`✨ 成功落盘进 R2 存储桶: ${successCount} 张`);
  console.log(`⚠️ 忽略/跳过: ${failCount} 张`);
}

main().catch(console.error);
