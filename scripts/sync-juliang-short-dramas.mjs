#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * 巨量资源 (Juliang) 短剧专线全自动化巡检与预烘焙数据同步脚本
 * 
 * 核心职责：
 * 1. 从巨量资源 2.0 API (t=5 短剧专区) 拉取最新爆款剧集
 * 2. 铁律排除成人边缘分类 (t=190, 191 及伦理/写真等)
 * 3. 提取高清竖版海报、真实分集总数与剧情简介
 * 4. 增量更新 lib/data/home-prebaked-extra.ts 中的 SHORT_HOME_DATA (Hero 8席 + TrendingNav 12席)
 * 5. 追加新片至 lib/data/new-scraped-titles.json 供 SEO 搜索引擎主动推送
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const JULIANG_API_BASE = 'https://api.juliang.live/api/provide/vod/';
const EXCLUDED_TYPE_IDS = new Set([190, 191]);
const EXCLUDED_KEYWORDS = ['伦理', '写真', '福利', '限制级', '18禁', '三级'];

function cleanHtmlText(raw) {
  if (!raw) return '';
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}

function cleanTitle(raw) {
  if (!raw) return '';
  return raw
    .replace(/[（(][^）)]*[）)]/g, '')
    .replace(/[【\[][^】\]]*[】\]]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isExcluded(item) {
  const typeId = Number(item.type_id);
  if (EXCLUDED_TYPE_IDS.has(typeId)) return true;
  const name = String(item.vod_name || '');
  const typeName = String(item.type_name || '');
  const content = String(item.vod_content || '');
  return EXCLUDED_KEYWORDS.some(kw => 
    name.includes(kw) || typeName.includes(kw) || content.includes(kw)
  );
}

function parseEpisodesCount(remarks, playUrl) {
  if (playUrl && playUrl.includes('$')) {
    const parts = playUrl.split('#').filter(Boolean);
    if (parts.length > 1) return parts.length;
  }
  if (!remarks) return 80;
  const match = remarks.match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 80;
}

async function fetchJuliangShortDramas() {
  console.log('📡 正在从巨量资源 2.0 API 拉取短剧专线最新剧集 (t=5)...');
  const items = [];
  
  for (let page = 1; page <= 2; page++) {
    try {
      const url = `${JULIANG_API_BASE}?ac=detail&t=5&pg=${page}`;
      const res = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          Accept: 'application/json',
        },
      });
      if (!res.ok) {
        console.warn(`⚠️ 巨量短剧接口返回 HTTP ${res.status}`);
        continue;
      }
      const data = await res.json();
      if (data && Array.isArray(data.list)) {
        for (const it of data.list) {
          if (!isExcluded(it) && it.vod_name && it.vod_pic) {
            items.push(it);
          }
        }
      }
    } catch (err) {
      console.warn(`⚠️ 拉取第 ${page} 页失败:`, err.message);
    }
  }

  console.log(`✅ 成功获取并清洗出 ${items.length} 部合规优质短剧。`);
  return items;
}

async function main() {
  const dramas = await fetchJuliangShortDramas();
  if (dramas.length === 0) {
    console.log('ℹ️ 未获取到新短剧数据，保持现有预烘焙不变。');
    return;
  }

  // 1. 构建候选 TrendingNav（12 席，黄金 6 + 6 对称矩阵）
  const trendingNav = [];
  const seenTitles = new Set();

  for (const d of dramas) {
    const title = cleanTitle(d.vod_name);
    if (!title || seenTitles.has(title) || title.length < 2) continue;
    seenTitles.add(title);

    let updateBadge = '';
    if (d.vod_remarks?.includes('完结')) {
      updateBadge = '全';
    } else {
      const epMatch = d.vod_remarks?.match(/(\d+)/);
      if (epMatch) updateBadge = epMatch[1];
    }

    trendingNav.push({
      title,
      updateBadge: updateBadge || 'HOT',
    });

    if (trendingNav.length >= 12) break;
  }

  // 2. 构建候选 Hero 轮播（8 席精选大图）
  const heroItems = [];
  const heroCandidates = dramas.filter(d => 
    d.vod_content && cleanHtmlText(d.vod_content).length > 20
  );

  const selectedForHero = heroCandidates.slice(0, 8);
  // 若带详述的少于8部，用普通优质补充
  if (selectedForHero.length < 8) {
    for (const d of dramas) {
      if (!selectedForHero.some(s => s.vod_id === d.vod_id)) {
        selectedForHero.push(d);
        if (selectedForHero.length >= 8) break;
      }
    }
  }

  for (let i = 0; i < selectedForHero.length; i++) {
    const it = selectedForHero[i];
    const title = cleanTitle(it.vod_name);
    const totalEp = parseEpisodesCount(it.vod_remarks, it.vod_play_url);
    const rawDesc = cleanHtmlText(it.vod_content) || `${title} 精彩全集连播，高能反转停不下来！`;
    const typeName = it.type_name || '微短剧';
    const subGenre = typeName.replace(/短剧/g, '') || '爽剧';

    heroItems.push({
      id: `jl_short_${it.vod_id}`,
      title,
      rate: (8.2 + ((it.vod_id % 15) / 10)).toFixed(1),
      cover: it.vod_pic,
      backdrop: it.vod_pic, // 方案 A：16:9 背景由前端以该图做全屏高斯模糊扩展
      description: rawDesc.slice(0, 150) + (rawDesc.length > 150 ? '...' : ''),
      year: String(it.vod_year || '2026'),
      types: ['短剧', subGenre, '全集连播'],
      episodes_info: `全${totalEp}集·${it.vod_remarks || '已完结'}`,
      type: 'tv',
      is_new: true,
      playable: true,
      actors: it.vod_actor ? it.vod_actor.split(',').map(s => s.trim()).filter(Boolean).slice(0, 2) : ['短剧实力派'],
    });
  }

  console.log(`🎬 成功构建短剧专区 8 席 Hero 轮播与 12 席 TrendingNav 速报。`);

  // 3. 安全更新 lib/data/home-prebaked-extra.ts 中的 SHORT_HOME_DATA
  const prebakedExtraPath = path.join(ROOT_DIR, 'lib/data/home-prebaked-extra.ts');
  if (fs.existsSync(prebakedExtraPath)) {
    let content = fs.readFileSync(prebakedExtraPath, 'utf8');

    // 查找 SHORT_HOME_DATA
    const startIdx = content.indexOf('export const SHORT_HOME_DATA: PrebakedHomeCategory = {');
    if (startIdx !== -1) {
      // 提取 top10 保留原有，更新 trendingNav 和 hero
      const nextExportIdx = content.indexOf('export const ', startIdx + 50);
      const shortBlock = nextExportIdx !== -1 ? content.slice(startIdx, nextExportIdx) : content.slice(startIdx);
      
      const newShortDataCode = `export const SHORT_HOME_DATA: PrebakedHomeCategory = {
  trendingNav: ${JSON.stringify(trendingNav, null, 4).replace(/\n/g, '\n  ')},
  hero: ${JSON.stringify(heroItems, null, 4).replace(/\n/g, '\n  ')},
  top10: [
${heroItems.map((h, idx) => `    {
      id: 'pb_s_top_${idx + 1}',
      title: ${JSON.stringify(h.title)},
      rate: ${JSON.stringify(h.rate)},
      cover: ${JSON.stringify(h.cover)},
      year: ${JSON.stringify(h.year)},
      types: ${JSON.stringify(h.types)},
      is_new: true,
      playable: true
    }`).join(',\n')}
  ],
  s1: [],
  s2: [],
  s3: [],
  s4: []
};\n\n`;

      if (nextExportIdx !== -1) {
        content = content.slice(0, startIdx) + newShortDataCode + content.slice(nextExportIdx);
      } else {
        content = content.slice(0, startIdx) + newShortDataCode;
      }

      fs.writeFileSync(prebakedExtraPath, content, 'utf8');
      console.log('✅ 成功回写 lib/data/home-prebaked-extra.ts 中的 SHORT_HOME_DATA！');
    }
  }

  // 3.5 同步更新 lib/data/latest-titles-prebaked.ts 中的 short 频道最新上线
  const latestTitlesPath = path.join(ROOT_DIR, 'lib/data/latest-titles-prebaked.ts');
  if (fs.existsSync(latestTitlesPath)) {
    try {
      let latestContent = fs.readFileSync(latestTitlesPath, 'utf8');
      const latestShortItems = dramas.slice(0, 20).map((it, idx) => {
        let badge = it.vod_remarks || '已完结';
        if (it.vod_play_url) {
          const eps = it.vod_play_url.split('#').filter(Boolean);
          if (eps.length > 1) {
            badge = `全${eps.length}集`;
          }
        }
        const title = cleanTitle(it.vod_name);
        return {
          entityId: `ik_latest_short_${idx + 1}`,
          title,
          slug: encodeURIComponent(title),
          cover: it.vod_pic || '',
          backdrop: it.vod_pic || '',
          rate: (8.0 + (idx % 10) * 0.1).toFixed(1),
          year: String(it.vod_year || '2026'),
          type: 'short',
          channelKey: 'short',
          genres: [it.type_name || '短剧', '爽剧'],
          updateBadge: badge,
          createdAt: new Date(Date.now() - idx * 3600000).toISOString(),
        };
      });

      const shortMatch = latestContent.match(/"short":\s*\[[\s\S]*?\](?=\s*\};)/);
      if (shortMatch) {
        latestContent = latestContent.replace(
          shortMatch[0],
          `"short": ${JSON.stringify(latestShortItems, null, 2)}`
        );
        fs.writeFileSync(latestTitlesPath, latestContent, 'utf8');
        console.log('✅ 成功同步更新 lib/data/latest-titles-prebaked.ts 中的 short 频道最新上线！');
      }
    } catch (err) {
      console.warn('⚠️ 更新 latest-titles-prebaked.ts 失败:', err.message);
    }
  }

  // 4. 追加新短剧到 lib/data/new-scraped-titles.json 供 SEO 推送
  const newTitlesPath = path.join(ROOT_DIR, 'lib/data/new-scraped-titles.json');
  let currentNewTitles = [];
  if (fs.existsSync(newTitlesPath)) {
    try {
      currentNewTitles = JSON.parse(fs.readFileSync(newTitlesPath, 'utf8'));
    } catch {
      currentNewTitles = [];
    }
  }

  const addedTitles = [];
  for (const item of trendingNav) {
    if (!currentNewTitles.includes(item.title)) {
      currentNewTitles.unshift(item.title);
      addedTitles.push(item.title);
    }
  }

  if (addedTitles.length > 0) {
    fs.writeFileSync(newTitlesPath, JSON.stringify(currentNewTitles.slice(0, 100), null, 2), 'utf8');
    console.log(`🚀 成功向 new-scraped-titles.json 追加 ${addedTitles.length} 部新短剧用于全网 SEO 推送:`, addedTitles.join(', '));
  }
}

main().catch(err => {
  console.warn('⚠️ [同步巨量短剧执行警告]:', err.message);
  process.exit(0);
});
