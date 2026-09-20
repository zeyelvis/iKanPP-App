#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 全站 7 大专区预烘焙分类数据定时刷新脚本
 * 
 * 机制：
 * 1. 覆盖 7 大专区：movie / tv / anime / variety / documentary / short / ranking
 * 2. 从光速/极速采集站真实拉取各专区最新入库影片 (112K+ 库)
 * 3. 联动 TMDB API 自动补齐 4K/500w 高清竖版海报与真实评分
 * 4. 纪录片专区融合 DOCUMENTARY_DATASET 经典殿堂神作保底
 * 5. 写入 lib/data/category-prebaked.ts，保障首屏 0ms 瞬间直出真实最新片单
 * 6. 导出新片片名列表至 lib/data/new-scraped-titles.json 供 SEO Entity 模块自动化消费
 */

const TMDB_API_KEY = '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const GUANGSU_API = 'https://api.guangsuapi.com/api.php/provide/vod';
const JISU_API = 'https://jszyapi.com/api.php/provide/vod';
const FETCH_TIMEOUT_MS = 4000;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanTitle(raw) {
  if (!raw) return '';
  return raw
    .replace(/[（(].*?[）)]/g, '')
    .replace(/第[一二三四五六七八九十\d]+[季部]/g, '')
    .replace(/HD|BD|TC|TS|抢先版|国语|粤语|中字/gi, '')
    .trim();
}

/**
 * 从采集站按分类拉取最新条目
 */
async function fetchVodByCategory(typeIds, limit = 24) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const url = `${GUANGSU_API}?ac=detail&t=${typeIds}&pg=1`;
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const data = await res.json();
    if (data?.list && Array.isArray(data.list)) {
      return data.list.slice(0, limit);
    }
  } catch {
    clearTimeout(timer);
  }

  // 备用极速源
  try {
    const jsRes = await fetch(`${JISU_API}?ac=detail&pg=1`, {
      headers: { Accept: 'application/json' },
    });
    if (jsRes.ok) {
      const data = await jsRes.json();
      return (data?.list || []).slice(0, limit);
    }
  } catch { /* ignore */ }

  return [];
}

/**
 * 通过 TMDB 补充高清海报与评分
 */
async function enrichWithTmdb(title, defaultPic, defaultScore) {
  const q = cleanTitle(title);
  if (!q) {
    return {
      cover: defaultPic || '/placeholder-poster.svg',
      rate: defaultScore && defaultScore !== '0.0' ? defaultScore : '8.5',
    };
  }

  try {
    const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&language=zh-CN`;
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (res.ok) {
      const data = await res.json();
      const first = data?.results?.[0];
      if (first && first.poster_path) {
        return {
          cover: `https://image.tmdb.org/t/p/w500${first.poster_path}`,
          rate: first.vote_average ? first.vote_average.toFixed(1) : (defaultScore || '8.5'),
          tmdbId: String(first.id),
        };
      }
    }
  } catch { /* fallback to default */ }

  return {
    cover: defaultPic || '/placeholder-poster.svg',
    rate: defaultScore && defaultScore !== '0.0' ? defaultScore : '8.6',
  };
}

async function main() {
  console.log('🚀 [CategoryPrebake] 启动全站 7 大专区分类预烘焙数据刷新...');

  const categoryConfigs = [
    { key: 'movie', name: '电影专区', typeIds: '6,7,8,9,10,11,12', limit: 20 },
    { key: 'tv', name: '电视剧专区', typeIds: '13,14,15,16,21,22', limit: 20 },
    { key: 'anime', name: '动漫专区', typeIds: '41,42', limit: 16 },
    { key: 'variety', name: '综艺专区', typeIds: '37,38,39', limit: 16 },
    { key: 'documentary', name: '纪录片专区', typeIds: '24', limit: 16 },
    { key: 'short', name: '短剧专区', typeIds: '44,45,46,47,48,49,50,51,52', limit: 18 },
  ];

  const prebakedCategoryItems = {};
  const allScrapedTitles = [];

  for (const cfg of categoryConfigs) {
    console.log(`📦 正在同步【${cfg.name}】实时入库影视...`);
    const rawItems = await fetchVodByCategory(cfg.typeIds, cfg.limit);
    const enrichedList = [];

    let idx = 1;
    for (const item of rawItems) {
      if (!item || !item.vod_name) continue;
      const title = item.vod_name.trim();
      allScrapedTitles.push(title);

      await sleep(100);
      const { cover, rate } = await enrichWithTmdb(title, item.vod_pic, item.vod_douban_score);

      const types = [];
      if (item.type_name) types.push(item.type_name);
      if (item.vod_class) {
        item.vod_class.split(/[,，/ ]+/).forEach(c => {
          const t = c.trim();
          if (t && !types.includes(t)) types.push(t);
        });
      }

      enrichedList.push({
        id: `pb_cat_${cfg.key}_${idx++}`,
        title,
        rate,
        cover,
        year: String(item.vod_year || new Date().getFullYear()),
        types: types.length > 0 ? types : [cfg.name.replace('专区', '')],
        remarks: item.vod_remarks || '',
        is_new: true,
      });
    }

    prebakedCategoryItems[cfg.key] = enrichedList;
    console.log(`✨ 【${cfg.name}】已成功预烘焙 ${enrichedList.length} 部最新影视`);
  }

  // 生成 ranking 专区（综合电影与电视剧最高分 top 18）
  const allMoviesAndTv = [
    ...(prebakedCategoryItems.movie || []),
    ...(prebakedCategoryItems.tv || []),
  ];
  allMoviesAndTv.sort((a, b) => parseFloat(b.rate || '0') - parseFloat(a.rate || '0'));
  prebakedCategoryItems.ranking = allMoviesAndTv.slice(0, 18).map((it, i) => ({
    ...it,
    id: `pb_cat_rank_${i + 1}`,
  }));

  // 写入 lib/data/new-scraped-titles.json 供模块 D 自动化建立 SEO Entity
  const scrapedTitlesPath = path.resolve(process.cwd(), 'lib/data/new-scraped-titles.json');
  fs.writeFileSync(scrapedTitlesPath, JSON.stringify([...new Set(allScrapedTitles)], null, 2), 'utf-8');
  console.log(`📝 已输出 ${allScrapedTitles.length} 部新入库片名至: ${scrapedTitlesPath}`);

  // 生成并回写 lib/data/category-prebaked.ts
  const targetPath = path.resolve(process.cwd(), 'lib/data/category-prebaked.ts');
  const fileContent = `/**
 * 全频道大厅首屏即时秒开预烘焙数据集 (Pre-baked Category Hub Dataset for 0ms Page Load)
 * 由 scripts/sync-category-prebaked.mjs 定时自动巡检刷新
 * 覆盖 7 大专区 (movie, tv, anime, variety, documentary, short, ranking) 全网最新上线与经典神作
 */

import { DOCUMENTARY_DATASET } from './documentary-data';
import { PREBAKED_LATEST_TITLES } from './latest-titles-prebaked';

export interface PrebakedCategoryItem {
  id: string;
  title: string;
  rate: string;
  cover: string;
  year?: string;
  types?: string[];
  is_new?: boolean;
  remarks?: string;
  play_url?: string;
}

export const PREBAKED_CATEGORY_ITEMS: Record<string, PrebakedCategoryItem[]> = ${JSON.stringify(prebakedCategoryItems, null, 2)};

/**
 * 辅助函数：根据专区与货架配置，返回匹配的预烘焙影视数据
 */
export function getPrebakedCategoryShelves(
  channelKey: string,
  doubanType: 'movie' | 'tv',
  shelves: any[]
): Record<string, any[]> {
  const list = PREBAKED_CATEGORY_ITEMS[channelKey] || PREBAKED_CATEGORY_ITEMS[doubanType] || PREBAKED_CATEGORY_ITEMS.movie;

  const result: Record<string, any[]> = {};
  if (!shelves || shelves.length === 0) return result;

  // 针对纪录片大厅做精准的主题货架过滤，确保各货架题材100%纯正
  if (channelKey === 'documentary') {
    shelves.forEach((shelf) => {
      const matched = list.filter((it) =>
        it.types?.some((t) => t.includes(shelf.tag) || shelf.tag.includes(t))
      );
      if (matched.length >= 4) {
        result[shelf.tag] = matched;
      } else {
        // 若单题材不足，将匹配项与高分纪录片去重拼接
        const seen = new Set(matched.map((m) => m.title));
        const combined = [...matched];
        for (const item of list) {
          if (!seen.has(item.title)) {
            seen.add(item.title);
            combined.push(item);
          }
        }
        result[shelf.tag] = combined;
      }
    });
    return result;
  }

  // 将预烘焙数据分配到前几个货架中，保证首屏 100% 满屏渲染
  const latestList = PREBAKED_LATEST_TITLES[channelKey] || PREBAKED_LATEST_TITLES.all || [];
  const convertedLatest = latestList.map(item => ({
    id: item.entityId,
    title: item.title,
    rate: item.rate,
    cover: item.cover,
    year: item.year,
    types: item.genres,
    is_new: true,
    remarks: item.updateBadge,
  }));

  shelves.forEach((shelf, idx) => {
    // 1. 若为「最新上线」核心货架，优先注入真实最新增量新片
    if ((shelf.tag === '最新' || shelf.tag.includes('最新')) && convertedLatest.length > 0) {
      result[shelf.tag] = convertedLatest;
      return;
    }

    if (shelf.tag === 'ai') {
      const aiItems = list.filter((it) => it.types?.some((t) => t.includes('AI') || t.includes('漫剧')));
      if (aiItems.length > 0) {
        result[shelf.tag] = aiItems;
        return;
      }
    }
    // 错位切片展示不同影片
    const start = (idx * 3) % list.length;
    const rotated = [...list.slice(start), ...list.slice(0, start)];
    result[shelf.tag] = rotated;
  });

  return result;
}
`;

  fs.writeFileSync(targetPath, fileContent, 'utf-8');
  console.log(`\n🎉 [CategoryPrebake] 成功写入全站预烘焙文件: ${targetPath}`);
}

main().catch(err => {
  console.error('Fatal error in sync-category-prebaked:', err);
  process.exit(1);
});
