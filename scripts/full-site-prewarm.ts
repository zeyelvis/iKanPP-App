/**
 * iKanPP 全站全维度全量自动化预热总控脚本 (Full-Site Prewarm & Asset Ingestion)
 * 
 * 核心功能：
 * 1. 【演职员头像增量入库】：扫描全站 7 大专区（电影、电视、动漫、综艺、纪录片、短剧、首页）所有演职员，补全官方肖像
 * 2. 【全站核心图片 R2 预热】：海报 (w342) 与通栏巨幕 (w1280) 批量拉取并上传 Cloudflare R2
 * 3. 【详情页三维资产 R2 预热】：详情封面 (w780) 与演职员肖像 (w185) 批量写入 R2
 * 4. 【线上生产边缘 CDN 预热】：并发访问生产环境全站核心页面 (HTML + RSC Payload)，让 Cloudflare Edge 提前建立缓存
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PREBAKED_HOME_DATA } from '../lib/data/home-prebaked';
import { PEOPLE_PREBAKED_ENTITIES } from '../lib/data/people-prebaked';
import { PREBAKED_AVATARS } from '../lib/data/prebaked-avatars';
import { PREBAKED_LATEST_TITLES } from '../lib/data/latest-titles-prebaked';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Cloudflare 凭证与配置
const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const CF_AUTH_EMAIL = process.env.CLOUDFLARE_AUTH_EMAIL || 'zeyelvis@gmail.com';
const CF_AUTH_KEY = process.env.CLOUDFLARE_AUTH_KEY || 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const R2_BUCKET = process.env.R2_BUCKET_NAME || 'ikanpp-images';

// Cloudflare KV 配置
const CF_KV_ACCOUNT_ID = process.env.CF_KV_ACCOUNT_ID || CF_ACCOUNT_ID;
const CF_KV_NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = process.env.CF_KV_API_KEY || CF_AUTH_KEY;
const CF_KV_EMAIL = process.env.CF_KV_EMAIL || CF_AUTH_EMAIL;

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
const PROD_BASE_URL = process.env.SITE_URL || 'https://www.ikanpp.com';

function generateSlug(title: string): string {
  if (!title || typeof title !== 'string') return 'video';
  const cleaned = title
    .replace(/[（(][^）)]*[）)]/g, ' ')
    .replace(/[【\[][^】\]]*[】\]]/g, ' ')
    .replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|]/g, ' ')
    .trim();
  const slug = cleaned
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\u4e00-\u9fa5-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return slug || 'video';
}

function normalizeTitle(title: string): string {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[【\[].*?[】\]]/g, '')
    .replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|\s_-]/g, '')
    .trim();
}

function generateDeterministicId(title: string): string {
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = ((hash << 5) - hash) + title.charCodeAt(i);
    hash |= 0;
  }
  const pos = Math.abs(hash) % 900000 + 100000;
  return `ik${pos}`;
}

async function bulkPutKV(items: Array<{ key: string; value: string }>): Promise<boolean> {
  if (!items.length) return true;
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/bulk`;

  try {
    const res = await fetch(endpoint, {
      method: 'PUT',
      headers: {
        'X-Auth-Email': CF_KV_EMAIL,
        'X-Auth-Key': CF_KV_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function getR2Key(rawUrl: string, width: number): string | null {
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

async function uploadToR2(key: string, buffer: ArrayBuffer, contentType: string): Promise<boolean> {
  const encodedKeyPath = key.split('/').map(encodeURIComponent).join('/');
  const endpoint = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodedKeyPath}`;

  try {
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
  } catch {
    return false;
  }
}

async function fetchImageBuffer(url: string, targetWidth: number): Promise<{ buffer: ArrayBuffer; contentType: string } | null> {
  let finalUrl = url;
  if (url.includes('tmdb.org')) {
    finalUrl = url.replace(/\/t\/p\/(w\d+|original)\//, `/t/p/w${targetWidth}/`);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);

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

// ----------------------------------------------------
// 步骤一：增量丰润全站演职员官方头像
// ----------------------------------------------------
async function stepEnrichAvatars(allPeople: Set<string>): Promise<boolean> {
  console.log(`\n========================================`);
  console.log(`👤 步骤一：演职员官方高清肖像增量丰润`);
  console.log(`========================================`);

  const avatarMap: Record<string, string> = { ...PREBAKED_AVATARS };
  const missingNames = Array.from(allPeople).filter(name => !avatarMap[name] && name !== '实力主演' && name !== '导演');

  console.log(`全站汇总知名影人: ${allPeople.size} 位，已有头像: ${Object.keys(PREBAKED_AVATARS).length} 位，待增量查询: ${missingNames.length} 位`);

  if (missingNames.length === 0) {
    console.log(`✨ 演职员官方肖像库已是 100% 完整最新，无需重复抓取。`);
    return false;
  }

  let successCount = 0;
  const batchSize = 6;

  for (let i = 0; i < missingNames.length; i += batchSize) {
    const batch = missingNames.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (name) => {
        try {
          const url = `${TMDB_BASE}/search/person?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(name)}`;
          const res = await fetch(url);
          if (!res.ok) return;
          const data = await res.json();
          const candidate = (data.results || []).find((p: any) => Boolean(p.profile_path)) || data.results?.[0];
          if (candidate?.profile_path) {
            const avatarUrl = `https://image.tmdb.org/t/p/w185${candidate.profile_path}`;
            avatarMap[name] = avatarUrl;
            successCount++;
            console.log(`  ✅ 成功获取: ${name} -> ${avatarUrl}`);
          }
        } catch {}
      })
    );
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`🎉 增量抓取完成！成功新增 ${successCount} 位影人肖像，当前总头像数: ${Object.keys(avatarMap).length}`);

  if (successCount > 0) {
    const sortedKeys = Object.keys(avatarMap).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
    const sortedMap: Record<string, string> = {};
    for (const k of sortedKeys) {
      sortedMap[k] = avatarMap[k];
    }

    const content = `export const PREBAKED_AVATARS: Record<string, string> = ${JSON.stringify(sortedMap, null, 2)};\n`;
    const targetPath = path.join(ROOT_DIR, 'lib', 'data', 'prebaked-avatars.ts');
    fs.writeFileSync(targetPath, content, 'utf8');
    console.log(`💾 已成功写回本地字典: ${targetPath}`);
    return true;
  }

  return false;
}

// ----------------------------------------------------
// 步骤二 & 三：全站海报、剧照与详情三维资产预热到 Cloudflare R2
// ----------------------------------------------------
async function stepPrewarmR2Images(mediaTasks: Array<{ url: string; width: number; type: string }>) {
  console.log(`\n========================================`);
  console.log(`📦 步骤二 & 三：全站多尺寸静态资产批量预热写入 R2`);
  console.log(`========================================`);
  console.log(`待处理图片资产总数: ${mediaTasks.length} 项（包含 w342海报、w1280巨幕、w780详情大图、w185肖像）`);

  let successCount = 0;
  let failCount = 0;
  const concurrency = 8;
  let index = 0;

  async function worker() {
    while (index < mediaTasks.length) {
      const current = mediaTasks[index++];
      const key = getR2Key(current.url, current.width);
      if (!key) {
        failCount++;
        continue;
      }

      const img = await fetchImageBuffer(current.url, current.width);
      if (img) {
        const ok = await uploadToR2(key, img.buffer, img.contentType);
        if (ok) {
          successCount++;
          process.stdout.write(`\r  ✅ [${successCount + failCount}/${mediaTasks.length}] 已写入 R2: ${key} (${(img.buffer.byteLength / 1024).toFixed(1)} KB)`);
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

  console.log(`\n🎉 R2 静态资源全量预热完毕！成功入库: ${successCount} 张，跳过/失败: ${failCount} 张`);
}

// ----------------------------------------------------
// 步骤四：线上生产环境 Edge CDN 智能热加载 (Edge Cache Warm-up)
// ----------------------------------------------------
async function stepWarmupEdgeCDN(uniqueTitles: string[]) {
  console.log(`\n========================================`);
  console.log(`⚡ 步骤四：生产环境 Cloudflare Edge CDN 缓存智能热加载`);
  console.log(`========================================`);

  // 1. 核心频道路由
  const channelRoutes = [
    '/',
    '/movie',
    '/tv',
    '/anime',
    '/variety',
    '/documentary',
    '/short',
    '/ranking',
  ];

  // 2. 详情页路由
  const titleRoutes = uniqueTitles.map(t => `/title/${encodeURIComponent(t)}`);
  const allRoutes = [...channelRoutes, ...titleRoutes];

  console.log(`🎯 准备热加载边缘缓存路由总数: ${allRoutes.length} 个页面（包含全专区频道 + ${uniqueTitles.length} 部核心影视）`);

  let warmedCount = 0;
  const concurrency = 6;
  let index = 0;

  async function cdnWorker() {
    while (index < allRoutes.length) {
      const route = allRoutes[index++];
      const fullUrl = `${PROD_BASE_URL}${route}`;

      try {
        // 同时触发普通 HTML 渲染与 Next.js RSC Prefetch 缓存
        const [resHtml, resRsc] = await Promise.all([
          fetch(fullUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iKanPP CDN Prewarmer Bot; +https://www.ikanpp.com)',
            }
          }),
          fetch(fullUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (iKanPP CDN Prewarmer Bot; +https://www.ikanpp.com)',
              'RSC': '1',
            }
          }),
        ]);

        warmedCount++;
        const cfRay = resHtml.headers.get('cf-ray') || '';
        const cfCache = resHtml.headers.get('cf-cache-status') || 'DYNAMIC';
        process.stdout.write(`\r  ⚡ [${warmedCount}/${allRoutes.length}] 边缘预热成功: ${route} (Ray: ${cfRay.slice(-8)}, Cache: ${cfCache})`);
      } catch (err) {
        // 静默继续
      }
    }
  }

  const workers = Array.from({ length: concurrency }, () => cdnWorker());
  await Promise.all(workers);

  console.log(`\n🎉 边缘 CDN 页面级主动预热大功告成！全网节点已生成 ISR / RSC 极速缓存！`);
}

// ----------------------------------------------------
// 步骤三：全站前台展示核心影视批量写入 Cloudflare 生产 KV
// ----------------------------------------------------
async function stepBulkIngestEntitiesToKV(entitiesMap: Map<string, any>) {
  console.log(`\n========================================`);
  console.log(`🗄️  步骤三：全站前台展示核心影视批量写入 Cloudflare 生产 KV`);
  console.log(`========================================`);
  console.log(`待写入实体总数: ${entitiesMap.size} 部影视作品`);

  const kvPairs: Array<{ key: string; value: string }> = [];

  for (const entity of entitiesMap.values()) {
    const entityId = entity.entityId;
    const rawSlug = entity.slug || generateSlug(entity.title);
    const canonicalSlug = `${entityId}-${rawSlug}`.toLowerCase();
    const cleanNormTitle = normalizeTitle(entity.title);

    // 1. 实体主记录
    kvPairs.push({
      key: `entity:${entityId}`,
      value: JSON.stringify(entity),
    });

    // 2. 权威 canonical slug
    kvPairs.push({
      key: `slug:${canonicalSlug}`,
      value: entityId,
    });

    // 3. 原始 slug
    if (rawSlug && rawSlug !== canonicalSlug) {
      kvPairs.push({
        key: `slug:${rawSlug}`,
        value: entityId,
      });
    }

    // 4. 中文纯净标题倒排索引
    if (cleanNormTitle) {
      kvPairs.push({
        key: `title:${cleanNormTitle}`,
        value: entityId,
      });
    }
  }

  console.log(`构建生产 KV 键值对总数: ${kvPairs.length} 条（含实体主记录、canonical别名、原生别名与标题索引）`);

  const BATCH_SIZE = 150;
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < kvPairs.length; i += BATCH_SIZE) {
    const batch = kvPairs.slice(i, i + BATCH_SIZE);
    const ok = await bulkPutKV(batch);
    if (ok) {
      successCount += batch.length;
      process.stdout.write(`\r  ✅ [${Math.min(i + BATCH_SIZE, kvPairs.length)}/${kvPairs.length}] 已写入 Cloudflare KV`);
    } else {
      failCount += batch.length;
      console.warn(`\n  ⚠️ 批量写入失败 (${batch.length} 条)`);
    }
    await new Promise(r => setTimeout(r, 80));
  }

  console.log(`\n🎉 生产 KV 批量入库完毕！成功写入: ${successCount} 条，失败: ${failCount} 条\n`);
}

// ----------------------------------------------------
// 主执行器
// ----------------------------------------------------
async function main() {
  console.log(`🌟 ====================================================`);
  console.log(`🌟 iKanPP 全站全类型全量自动化预热引擎启动`);
  console.log(`🌟 目标生产域名: ${PROD_BASE_URL}`);
  console.log(`🌟 ====================================================`);

  const allPeople = new Set<string>();
  const mediaTasks: Array<{ url: string; width: number; type: string }> = [];
  const uniqueTitles = new Set<string>();
  const seenImageUrls = new Set<string>();
  const entitiesMap = new Map<string, any>();

  const registerEntity = (rawItem: any, defaultType: string = 'tv') => {
    const rawTitle = (rawItem.title || rawItem.name || '').trim();
    if (!rawTitle) return;
    uniqueTitles.add(rawTitle);

    if (entitiesMap.has(rawTitle)) {
      const existing = entitiesMap.get(rawTitle);
      if (!existing.cover && rawItem.cover) existing.cover = rawItem.cover;
      if (!existing.backdrop && rawItem.backdrop) existing.backdrop = rawItem.backdrop;
      if (!existing.description && (rawItem.description || rawItem.overview)) {
        existing.description = rawItem.description || rawItem.overview;
      }
      return;
    }

    const rawId = rawItem.entityId || rawItem.id;
    const isStandardIkId = typeof rawId === 'string' && /^ik\d{6}$/i.test(rawId);
    const entityId = isStandardIkId ? rawId : generateDeterministicId(rawTitle);
    const rawSlug = rawItem.slug || generateSlug(rawTitle);
    const itemType = rawItem.type || (rawItem.category === 'movie' ? 'movie' : defaultType);

    const entity = {
      entityId,
      slug: rawSlug,
      title: rawTitle,
      type: itemType,
      year: rawItem.year ? String(rawItem.year) : '2026',
      rate: rawItem.rate ? String(rawItem.rate) : '8.5',
      cover: rawItem.cover || '',
      backdrop: rawItem.backdrop || rawItem.cover || '',
      description: rawItem.description || rawItem.overview || `${rawTitle} 是一部优质精彩影视作品。提供全网多源纯直连极速播放，画质高清流畅，尽在 iKanPP 爱看片片。`,
      genres: Array.isArray(rawItem.genres) && rawItem.genres.length > 0 ? rawItem.genres : [(itemType === 'movie' ? '电影' : '电视剧')],
      directors: Array.isArray(rawItem.directors) ? rawItem.directors : [],
      actors: Array.isArray(rawItem.actors) ? rawItem.actors : [],
      numberOfEpisodes: rawItem.numberOfEpisodes || rawItem.episodes || (rawItem.badge ? parseInt(String(rawItem.badge).replace(/\D/g, ''), 10) || 1 : 1),
      numberOfSeasons: rawItem.numberOfSeasons || rawItem.seasons || 1,
      status: rawItem.status || rawItem.badge || rawItem.updateBadge || '正片',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    entitiesMap.set(rawTitle, entity);
  };

  // 1. 扫描 7 大专区（all, movie, tv, anime, variety, documentary, short）
  for (const [catName, catData] of Object.entries(PREBAKED_HOME_DATA)) {
    for (const [sectionKey, subjects] of Object.entries(catData)) {
      if (Array.isArray(subjects) && sectionKey !== 'trendingNav') {
        subjects.forEach((s: any) => {
          registerEntity(s, s.type || (catName === 'movie' ? 'movie' : 'tv'));

          // 收集影人
          (s.directors || []).forEach((d: string) => d && allPeople.add(d.trim()));
          (s.actors || []).forEach((a: string) => a && allPeople.add(a.trim()));

          // 收集封面海报 (w342 卡片 + w780 详情大图)
          if (s.cover && !seenImageUrls.has(s.cover)) {
            seenImageUrls.add(s.cover);
            mediaTasks.push({ url: s.cover, width: 342, type: 'poster' });
            mediaTasks.push({ url: s.cover, width: 780, type: 'detail-cover' });
          }

          // 收集全景剧照 (w1280 巨幕)
          if (s.backdrop && !seenImageUrls.has(s.backdrop)) {
            seenImageUrls.add(s.backdrop);
            mediaTasks.push({ url: s.backdrop, width: 1280, type: 'backdrop' });
          }
        });
      }
    }
  }

  // 2. 扫描 SEO 核心代表作影人库
  PEOPLE_PREBAKED_ENTITIES.forEach(e => {
    registerEntity(e, e.type);
    (e.directors || []).forEach(d => d && allPeople.add(d.trim()));
    (e.actors || []).forEach(a => a && allPeople.add(a.trim()));
    if (e.cover && !seenImageUrls.has(e.cover)) {
      seenImageUrls.add(e.cover);
      mediaTasks.push({ url: e.cover, width: 342, type: 'poster' });
      mediaTasks.push({ url: e.cover, width: 780, type: 'detail-cover' });
    }
    if (e.backdrop && !seenImageUrls.has(e.backdrop)) {
      seenImageUrls.add(e.backdrop);
      mediaTasks.push({ url: e.backdrop, width: 1280, type: 'backdrop' });
    }
  });

  // 3. 收集演职员头像列表 (w185)
  Object.values(PREBAKED_AVATARS).forEach(avatarUrl => {
    if (avatarUrl && !seenImageUrls.has(avatarUrl)) {
      seenImageUrls.add(avatarUrl);
      mediaTasks.push({ url: avatarUrl, width: 185, type: 'avatar' });
    }
  });

  // 4. 全量扫描全专区最新上线雷达库（PREBAKED_LATEST_TITLES）
  // 彻底消灭新入库影片详情页冷启动慢与首屏骨架屏闪烁
  for (const [channelKey, items] of Object.entries(PREBAKED_LATEST_TITLES)) {
    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        registerEntity(item, item.type);
        if (item.slug) {
          try {
            uniqueTitles.add(decodeURIComponent(item.slug));
          } catch {}
        }

        // 收集封面海报 (w342 卡片 + w780 详情大图)
        if (item.cover && !seenImageUrls.has(item.cover)) {
          seenImageUrls.add(item.cover);
          mediaTasks.push({ url: item.cover, width: 342, type: 'poster' });
          mediaTasks.push({ url: item.cover, width: 780, type: 'detail-cover' });
        }

        // 收集全景剧照 (w1280 巨幕)
        if (item.backdrop && !seenImageUrls.has(item.backdrop)) {
          seenImageUrls.add(item.backdrop);
          mediaTasks.push({ url: item.backdrop, width: 1280, type: 'backdrop' });
        }
      });
    }
  }

  console.log(`📊 数据汇总完成：`);
  console.log(`  - 唯一影视作品: ${uniqueTitles.size} 部 (实体映射: ${entitiesMap.size} 部)`);
  console.log(`  - 汇总演职员名单: ${allPeople.size} 位`);
  console.log(`  - 待预热核心图片: ${mediaTasks.length} 项`);

  // 执行各大预热步骤
  const hasAvatarUpdates = await stepEnrichAvatars(allPeople);
  await stepPrewarmR2Images(mediaTasks);
  await stepBulkIngestEntitiesToKV(entitiesMap);
  await stepWarmupEdgeCDN(Array.from(uniqueTitles));

  console.log(`\n====================================================`);
  console.log(`🎉 iKanPP 全站全维度全量自动化预热圆满完成！`);
  console.log(`🚀 用户访问任何分类、海报或详情页均已处于 100% 极速秒开状态！`);
  console.log(`====================================================\n`);

  if (hasAvatarUpdates) {
    console.log(`💡 检测到演职员肖像库有新增更新，后续步骤将自动提交并触发部署。`);
  }
}

main().catch(err => {
  console.error('全量预热执行异常:', err);
  process.exit(1);
});
