#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 连载作品最新集数/期数自动追踪与增量回写脚本
 * 
 * 机制：
 * 1. 读取 lib/data/latest-titles-prebaked.ts 中所有连载剧目 (tv, anime, variety, documentary)
 * 2. 批量通过光速/极速采集站实时接口 (?ac=detail&wd={title}) 精准反查最新更新状态 (vod_remarks)
 * 3. 对比现有 updateBadge，若有最新集数入库则就地更新并刷新时间戳
 * 4. 增量回写 latest-titles-prebaked.ts，保障全站大厅与频道大厅连载角标 1 小时内全自动精准感知
 */

const GUANGSU_API = 'https://api.guangsuapi.com/api.php/provide/vod';
const JISU_API = 'https://jszyapi.com/api.php/provide/vod';
const FETCH_TIMEOUT_MS = 3500;
const SLEEP_MS = 200;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function cleanTitleForSearch(raw) {
  if (!raw) return '';
  return raw
    .replace(/[（(].*?[）)]/g, '')
    .replace(/第[一二三四五六七八九十\d]+[季部]/g, '')
    .trim();
}

/**
 * 清洗并格式化采集站角标
 */
function formatEpisodeBadge(remarks, origBadge) {
  if (!remarks) return origBadge;
  const r = String(remarks).trim();

  // 若明确完结
  if (r.includes('完结') || r.includes('全集')) {
    const numMatch = r.match(/(\d+)/);
    if (numMatch) return `全${numMatch[1]}集`;
    return '已完结';
  }

  // 若带数字集数，如 "第22集" 或 "更新至22集"
  const epMatch = r.match(/(?:更新至|第)?\s*(\d+)\s*集/);
  if (epMatch) {
    return `更新至第${epMatch[1]}集`;
  }

  // 若综艺期数，如 "第7期"
  const qiMatch = r.match(/第\s*(\d+)\s*期/);
  if (qiMatch) {
    return `第${qiMatch[1]}期`;
  }

  return r.slice(0, 12);
}

/**
 * 请求采集站详情搜索接口
 */
async function searchVodDetail(title) {
  const query = cleanTitleForSearch(title) || title;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    // 优先光速资源
    const gsUrl = `${GUANGSU_API}?ac=detail&wd=${encodeURIComponent(query)}`;
    const gsRes = await fetch(gsUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });

    if (gsRes.ok) {
      const gsData = await gsRes.json();
      if (gsData?.list && Array.isArray(gsData.list) && gsData.list.length > 0) {
        clearTimeout(timer);
        // 精确匹配片名
        const matched = gsData.list.find(
          item => item.vod_name === title || item.vod_name.replace(/\s+/g, '') === title.replace(/\s+/g, '')
        ) || gsData.list[0];
        return matched;
      }
    }

    // 备用极速资源
    const jsUrl = `${JISU_API}?ac=detail&wd=${encodeURIComponent(query)}`;
    const jsRes = await fetch(jsUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
    clearTimeout(timer);

    if (jsRes.ok) {
      const jsData = await jsRes.json();
      if (jsData?.list && Array.isArray(jsData.list) && jsData.list.length > 0) {
        const matched = jsData.list.find(
          item => item.vod_name === title || item.vod_name.replace(/\s+/g, '') === title.replace(/\s+/g, '')
        ) || jsData.list[0];
        return matched;
      }
    }
  } catch {
    clearTimeout(timer);
  }

  return null;
}

async function main() {
  console.log('🚀 [EpisodeSync] 启动连载作品最新集数自动巡检...');

  const targetPath = path.resolve(process.cwd(), 'lib/data/latest-titles-prebaked.ts');
  if (!fs.existsSync(targetPath)) {
    console.error(`❌ 未找到目标文件: ${targetPath}`);
    process.exit(1);
  }

  const rawContent = fs.readFileSync(targetPath, 'utf-8');
  const jsonMatch = rawContent.match(/export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem\[\]> = ([\s\S]*?);\s*$/);
  if (!jsonMatch || !jsonMatch[1]) {
    console.error('❌ 无法从 latest-titles-prebaked.ts 解析出 JSON 数据');
    process.exit(1);
  }

  let prebakedData;
  try {
    prebakedData = JSON.parse(jsonMatch[1]);
  } catch (err) {
    console.error('❌ JSON.parse 失败:', err);
    process.exit(1);
  }

  // 收集需要追踪集数的条目（非 movie 类，且有具体片名）
  const candidatesMap = new Map();
  for (const [channelKey, items] of Object.entries(prebakedData)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!item || !item.title) continue;
      if (item.type === 'movie' && channelKey === 'movie') continue;
      // 避免重复追踪
      if (!candidatesMap.has(item.title)) {
        candidatesMap.set(item.title, {
          title: item.title,
          currentBadge: item.updateBadge || '',
          type: item.type,
        });
      }
    }
  }

  const candidates = Array.from(candidatesMap.values()).slice(0, 80);
  console.log(`📊 发现 ${candidates.length} 部待巡检连载作品，开始逐一校验源站更新...`);

  let updatedCount = 0;
  const nowIso = new Date().toISOString();

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i];
    await sleep(SLEEP_MS);

    const vod = await searchVodDetail(candidate.title);
    if (!vod || !vod.vod_remarks) continue;

    const newBadge = formatEpisodeBadge(vod.vod_remarks, candidate.currentBadge);
    if (newBadge && newBadge !== candidate.currentBadge) {
      console.log(`✨ [集数变动] 《${candidate.title}》: "${candidate.currentBadge}" ➔ "${newBadge}" (源站: ${vod.vod_remarks})`);
      updatedCount++;

      // 全域更新 prebakedData 中所有对应的条目
      for (const list of Object.values(prebakedData)) {
        if (!Array.isArray(list)) continue;
        for (const item of list) {
          if (item.title === candidate.title) {
            item.updateBadge = newBadge;
            item.createdAt = nowIso;
          }
        }
      }
    }
  }

  if (updatedCount > 0) {
    console.log(`\n🎉 共检测到 ${updatedCount} 部作品集数/期数更新，正在写回预烘焙文件...`);
    const newContent = `/**
 * 全站全专区「最新上线」真实增量预烘焙数据集
 * 由 scripts/sync-latest-titles.mjs 定时自动巡检生成
 * 涵盖全站、电影、电视剧、动漫、综艺、纪录片 6 大专区真实 24h 最新入库影视
 */

export interface LatestPrebakedItem {
  entityId: string;
  tmdbId?: string;
  title: string;
  slug: string;
  cover: string;
  backdrop: string;
  rate: string;
  year: string;
  type: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string;
  channelKey: 'all' | 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string;
  genres: string[];
  updateBadge: string;
  platformBadge?: string;
  qualityBadge?: string;
  createdAt: string;
}

export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem[]> = ${JSON.stringify(prebakedData, null, 2)};
`;
    fs.writeFileSync(targetPath, newContent, 'utf-8');
    console.log(`✅ [EpisodeSync] 成功写回 ${targetPath}`);
  } else {
    console.log('✨ 所有连载剧目集数均与采集站保持最新，无新增变动。');
  }
}

main().catch(err => {
  console.warn('⚠️ [EpisodeSync 执行警告]:', err.message);
  process.exit(0);
});
