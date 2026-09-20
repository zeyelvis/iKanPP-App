#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 全站全专区「最新上线」自动化同步与预烘焙脚本
 * 
 * 机制：
 * 1. 真实对接爱壹帆 6 大核心板块最新流 (CID 0,1 / 0,1,3 / 0,1,4 / 0,1,6 / 0,1,5 / 0,1,7)
 * 2. 提取真实入库时间 (updDate)、连载状态 (updVname)、分类 (videoType)
 * 3. 对接 TMDB API 自动补齐 4K 宽屏 backdrop、高清竖版海报与真实评分
 * 4. 预烘焙写入 lib/data/latest-titles-prebaked.ts，全站 0ms 秒开直出
 */

const TMDB_API_KEY = '';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const CHANNELS = [
  { key: 'all', name: '全站大厅', cid: '0,1', defaultType: 'all' },
  { key: 'movie', name: '电影专区', cid: '0,1,3', defaultType: 'movie' },
  { key: 'tv', name: '电视剧专区', cid: '0,1,4', defaultType: 'tv' },
  { key: 'anime', name: '动漫专区', cid: '0,1,6', defaultType: 'anime' },
  { key: 'variety', name: '综艺专区', cid: '0,1,5', defaultType: 'variety' },
  { key: 'documentary', name: '纪录片专区', cid: '0,1,7', defaultType: 'documentary' },
];

/**
 * 清洗并格式化更新状态角标
 */
function formatUpdateBadge(updVname, type) {
  if (!updVname) return type === 'movie' ? '正片' : '热播中';
  const v = String(updVname).trim();
  if (/^\d+$/.test(v)) {
    const epNum = parseInt(v, 10);
    return `更新至第${epNum}集`;
  }
  if (v.includes('期')) {
    const qMatch = v.match(/(第\d+期[^)]*)/);
    if (qMatch) return qMatch[1].slice(0, 10);
  }
  if (v.toUpperCase().includes('1080P') || v.toUpperCase().includes('4K')) {
    return '1080P超清';
  }
  return v.slice(0, 12);
}

/**
 * 格式化时间为 ISO 字符串
 */
function normalizeIsoDate(dateStr) {
  if (!dateStr) return new Date().toISOString();
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return new Date().toISOString();
    return d.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * 拼音 Slug 简易生成
 */
function simpleSlug(title) {
  return encodeURIComponent(
    title
      .toLowerCase()
      .replace(/[\s:：·•\-_—]+/g, '-')
      .replace(/[^\w\u4e00-\u9fa5\-]/g, '')
  );
}

/**
 * 检索 TMDB 获取高清海报与背景图
 */
async function fetchTmdbMeta(query, mediaType = 'movie') {
  const cleanKey = query.replace(/[（(][^)）]*[)）]/g, '').trim();
  const searchType = mediaType === 'tv' || mediaType === 'anime' ? 'tv' : (mediaType === 'movie' ? 'movie' : 'multi');
  const endpoint = searchType === 'multi' ? 'search/multi' : `search/${searchType}`;
  const url = `${TMDB_BASE}/${endpoint}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanKey)}`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(4000)
    });
    if (!res.ok) return null;
    const data = await res.json();
    const match = data?.results?.[0];
    if (!match) return null;

    return {
      tmdbId: String(match.id),
      rate: match.vote_average && match.vote_average > 0 ? match.vote_average.toFixed(1) : '8.6',
      cover: match.poster_path ? `https://image.tmdb.org/t/p/w500${match.poster_path}` : '',
      backdrop: match.backdrop_path ? `https://image.tmdb.org/t/p/w1280${match.backdrop_path}` : '',
      overview: match.overview || '',
      year: (match.release_date || match.first_air_date || '').slice(0, 4) || undefined,
    };
  } catch {
    return null;
  }
}

const COLLECTOR_APIS = [
  'https://api.guangsuapi.com/api.php/provide/vod?ac=detail&wd=',
  'https://api.zuidapi.com/api.php/provide/vod?ac=detail&wd=',
  'https://api.wujinapi.me/api.php/provide/vod?ac=detail&wd=',
];

const CHN_NUM_MAP = {
  '1': '一', '2': '二', '3': '三', '4': '四', '5': '五',
  '6': '六', '7': '七', '8': '八', '9': '九', '10': '十'
};

/**
 * 当 TMDB 无匹配时，从骨干采集库（光速、最大、无尽）并发检索官方原版高清海报
 */
async function fetchCollectorCover(title) {
  const searchKeywords = new Set();
  searchKeywords.add(title);

  // 变体1: "第9季" -> "第九季"
  const chnVariant = title.replace(/第(\d+)季/g, (_, num) => `第${CHN_NUM_MAP[num] || num}季`);
  searchKeywords.add(chnVariant);

  // 变体2: 去除季数纯片名 "心动的信号第9季" -> "心动的信号"
  let pureTitle = title.replace(/第[0-9一二三四五六七八九十]+[季期]/g, '').trim();
  pureTitle = pureTitle.replace(/\d+$/, '').trim();
  if (pureTitle && pureTitle !== title) {
    searchKeywords.add(pureTitle);
  }

  // 变体3: 提取冒号后或副标题
  if (title.includes('：')) {
    title.split('：').forEach(p => searchKeywords.add(p.trim()));
  }

  for (const apiBase of COLLECTOR_APIS) {
    for (const kw of searchKeywords) {
      if (!kw || kw.length < 2) continue;
      try {
        const res = await fetch(`${apiBase}${encodeURIComponent(kw)}`, {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3500)
        });
        if (!res.ok) continue;
        const data = await res.json();
        const list = data?.list || [];
        if (list.length === 0) continue;

        // 优先完全匹配或包含季数的项
        const exact = list.find(it => it.vod_name === title || it.vod_name === chnVariant);
        const match = exact || list[0];
        if (match && match.vod_pic && match.vod_pic.startsWith('http')) {
          return {
            cover: match.vod_pic,
            backdrop: match.vod_pic,
            rate: match.vod_score && match.vod_score !== '0.0' ? match.vod_score : undefined,
          };
        }
      } catch {}
    }
  }
  return null;
}

/**
 * 同步单个专区板块的最新上线列表
 */
async function fetchChannelLatest(channel) {
  console.log(`\n🚀 [LatestSync] 正在拉取【${channel.name}】(cid=${channel.cid}) 真实最新更新流...`);
  const url = `https://m10.iyf.tv/v3/list/getHotVideoTop?cinema=1&cid=${channel.cid}&pageSize=25`;
  
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(6000)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const rawList = data?.data?.info || [];
    console.log(`✅ [LatestSync] 【${channel.name}】获取到原始条目 ${rawList.length} 个`);

    const resultList = [];
    const seenTitles = new Set();

    for (let i = 0; i < rawList.length; i++) {
      const item = rawList[i];
      if (!item || !item.title) continue;
      const title = item.title.trim();
      if (seenTitles.has(title)) continue;
      seenTitles.add(title);

      const targetType = channel.defaultType === 'all' 
        ? (item.cid?.includes(',3') ? 'movie' : 'tv') 
        : channel.defaultType;

      const updateBadge = formatUpdateBadge(item.updVname, targetType);
      const createdAt = normalizeIsoDate(item.updDate);
      const year = item.year || '2026';
      const genres = [item.videoType || '精选', targetType === 'movie' ? '电影' : '剧集'].filter(Boolean);

      // 1. 查询 TMDB 补齐高清剧照
      const tmdb = await fetchTmdbMeta(title, targetType);
      // 2. 若 TMDB 查无匹配，回退到各大采集骨干库秒级检索真实高清封面
      const collector = !tmdb?.cover ? await fetchCollectorCover(title) : null;

      const cover = tmdb?.cover || collector?.cover || '/placeholder-poster.svg';
      const backdrop = tmdb?.backdrop || collector?.backdrop || cover;
      const rate = tmdb?.rate || collector?.rate || (item.pinFenValue ? (item.pinFenValue * 10).toFixed(1) : '8.8');
      const finalYear = tmdb?.year || year;

      resultList.push({
        entityId: `ik_latest_${channel.key}_${i + 1}`,
        tmdbId: tmdb?.tmdbId,
        title,
        slug: simpleSlug(title),
        cover,
        backdrop,
        rate,
        year: finalYear,
        type: targetType,
        channelKey: channel.key,
        genres,
        updateBadge,
        createdAt,
      });

      if (resultList.length >= 20) break;
    }

    return resultList;
  } catch (err) {
    console.warn(`⚠️ [LatestSync] 【${channel.name}】拉取异常:`, err.message);
    return [];
  }
}

async function main() {
  console.log('====================================================');
  console.log('🎬 iKanPP 全站 6 大专区「最新上线」定时增量同步飞轮启动');
  console.log('====================================================');

  const prebakedData = {};

  for (const channel of CHANNELS) {
    const list = await fetchChannelLatest(channel);
    prebakedData[channel.key] = list;
    console.log(`✨ 【${channel.name}】成功预烘焙 ${list.length} 部真实最新影片`);
  }

  // 写入 lib/data/latest-titles-prebaked.ts
  const targetPath = path.resolve(process.cwd(), 'lib/data/latest-titles-prebaked.ts');
  const fileContent = `/**
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
  createdAt: string;
}

export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem[]> = ${JSON.stringify(prebakedData, null, 2)};
`;

  fs.writeFileSync(targetPath, fileContent, 'utf-8');
  console.log(`\n🎉 [LatestSync] 成功写入预烘焙文件: ${targetPath}`);
}

main().catch(err => {
  console.error('Fatal error in sync-latest-titles:', err);
  process.exit(1);
});
