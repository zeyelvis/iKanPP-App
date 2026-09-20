#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 将全站预烘焙基础影视实体批量写入 Cloudflare KV 存储
 * 解决 Edge Worker 包体积限制（不将 300KB+ 静态数据打包进 Edge 函数），
 * 让数据存储在 Cloudflare KV 中，由 Worker 通过 KVIDEO_KV 极速 10ms 访问。
 */

const ACCOUNT_ID = '172a13185bd6e694bfefc089b12cad6a';
const NAMESPACE_ID = '42311924427747deaf00981d99d58998'; // kvideo-seo-entities
const API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CF_KV_API_KEY || process.env.CF_API_KEY || process.env.CLOUDFLARE_AUTH_KEY || '';
const EMAIL = 'zeyelvis@gmail.com';

function generateSlug(title) {
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

function normalizeTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[（(].*?[）)]/g, '')
    .replace(/[【\[].*?[】\]]/g, '')
    .replace(/[:：·•/／\\、，,。！？!?~～@#$%^&*+=|\s_-]/g, '')
    .trim();
}

function formatEntityId(seq) {
  const padded = Math.max(1, Math.floor(seq)).toString().padStart(6, '0');
  return `ik${padded}`;
}

async function main() {
  console.log('🚀 开始提取预烘焙影视数据准备写入 Cloudflare KV...');

  const kvPairs = [];
  const addKV = (key, value) => {
    kvPairs.push({ key, value: typeof value === 'string' ? value : JSON.stringify(value) });
  };

  const seenTitles = new Set();
  let seq = 1;
  const sitemapCatalog = [];
  const allIds = [];
  const now = Date.now();

  // 1. 读取 home-prebaked.ts
  const homePrebakedPath = path.resolve(process.cwd(), 'lib/data/home-prebaked.ts');
  const homeContent = fs.readFileSync(homePrebakedPath, 'utf-8');
  
  // 提取各列表中的 subject
  const regex = /{\s*id:\s*['"]([^'"]+)['"],\s*title:\s*['"]([^'"]+)['"],\s*poster:\s*['"]([^'"]+)['"](?:,\s*rate:\s*['"]([^'"]*)['"])?(?:,\s*year:\s*['"]([^'"]*)['"])?(?:,\s*genres:\s*\[([^\]]*)\])?(?:,\s*directors:\s*\[([^\]]*)\])?(?:,\s*actors:\s*\[([^\]]*)\])?/g;
  let match;
  while ((match = regex.exec(homeContent)) !== null) {
    const rawId = match[1];
    const title = match[2];
    const poster = match[3];
    const rate = match[4] || '8.8';
    const year = match[5] || '2025';
    
    const norm = normalizeTitle(title);
    if (!norm || seenTitles.has(norm)) continue;
    seenTitles.add(norm);

    const entityId = formatEntityId(seq++);
    const slug = generateSlug(title);
    const modDate = new Date(now - (seq - 1) * 3600000).toISOString().split('T')[0];

    const entity = {
      entityId,
      slug,
      tmdbId: rawId && /^\d+$/.test(rawId) ? rawId : String(seq + 900000),
      tmdbType: 'movie',
      title,
      type: 'movie',
      year,
      rate,
      cover: poster,
      backdrop: poster,
      description: `${title} 支持在 iKanPP 免费在线观看完整版高清视频。`,
      genres: ['电影'],
      directors: [],
      actors: [],
      createdAt: `${modDate}T00:00:00.000Z`,
      updatedAt: `${modDate}T00:00:00.000Z`,
    };

    addKV(`entity:${entityId}`, entity);
    addKV(`slug:${entityId}-${slug}`, entityId);
    addKV(`slug:${entityId}`, entityId);
    addKV(`slug:${slug}`, entityId);
    addKV(`title:${norm}`, entityId);
    if (entity.tmdbId) {
      addKV(`tmdb:movie:${entity.tmdbId}`, entityId);
    }

    allIds.push(entityId);
    sitemapCatalog.push([entityId, slug, modDate]);
  }

  // 2. 读取 latest-titles-prebaked.ts
  const latestPath = path.resolve(process.cwd(), 'lib/data/latest-titles-prebaked.ts');
  if (fs.existsSync(latestPath)) {
    const latestContent = fs.readFileSync(latestPath, 'utf-8');
    const jsonMatch = latestContent.match(/export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem\[\]> = ([\s\S]*?);\s*$/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const latestData = JSON.parse(jsonMatch[1]);
        for (const [ch, items] of Object.entries(latestData)) {
          if (Array.isArray(items)) {
            addKV(`recent:${ch}`, items);
            for (const item of items) {
              if (!item || !item.title) continue;
              const norm = normalizeTitle(item.title);
              if (seenTitles.has(norm)) continue;
              seenTitles.add(norm);

              const entityId = item.entityId && /^ik\d{6}$/i.test(item.entityId) ? item.entityId : formatEntityId(seq++);
              const slug = generateSlug(item.title);
              const modDate = (item.createdAt || new Date().toISOString()).split('T')[0];

              const entity = {
                entityId,
                slug,
                tmdbId: item.tmdbId || String(seq + 900000),
                tmdbType: item.type === 'movie' ? 'movie' : 'tv',
                title: item.title,
                type: item.type || 'movie',
                year: item.year || '2026',
                rate: item.rate || '8.8',
                cover: item.cover,
                backdrop: item.backdrop || item.cover,
                description: `${item.title} 支持在 iKanPP 免费在线观看完整版高清视频。`,
                genres: item.genres || [item.type === 'movie' ? '电影' : '电视剧'],
                directors: [],
                actors: [],
                createdAt: item.createdAt || `${modDate}T00:00:00.000Z`,
                updatedAt: item.createdAt || `${modDate}T00:00:00.000Z`,
              };

              addKV(`entity:${entityId}`, entity);
              addKV(`slug:${entityId}-${slug}`, entityId);
              addKV(`slug:${entityId}`, entityId);
              addKV(`slug:${slug}`, entityId);
              addKV(`title:${norm}`, entityId);

              allIds.push(entityId);
              sitemapCatalog.push([entityId, slug, modDate]);
            }
          }
        }
      } catch (err) {
        console.warn('解析 latest-titles-prebaked 异常:', err.message);
      }
    }
  }

  // 3. 全局索引与元数据
  addKV('index:all', allIds);
  addKV('sitemap:catalog', sitemapCatalog);
  addKV('counter:next_id', String(Math.max(seq, 2000)));

  console.log(`📦 共生成 ${kvPairs.length} 条 KV 写入记录（包含 ${sitemapCatalog.length} 部影视全量 Sitemap 索引）...`);

  // 4. 分批调用 Cloudflare KV Bulk Write API (每批最多 1000 条)
  const BATCH_SIZE = 1000;
  for (let i = 0; i < kvPairs.length; i += BATCH_SIZE) {
    const batch = kvPairs.slice(i, i + BATCH_SIZE);
    console.log(`📤 正在提交第 ${i + 1} ~ ${Math.min(i + BATCH_SIZE, kvPairs.length)} 条记录到 Cloudflare KV...`);
    const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/bulk`, {
      method: 'PUT',
      headers: {
        'X-Auth-Email': EMAIL,
        'X-Auth-Key': API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(batch),
    });

    const data = await res.json();
    if (!data.success) {
      console.error('❌ KV Bulk 写入失败:', JSON.stringify(data.errors));
    } else {
      console.log(`  ✅ 成功写入 ${batch.length} 条！`);
    }
  }

  console.log('\n🎉 Cloudflare KV 初始化数据写入完毕！');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
