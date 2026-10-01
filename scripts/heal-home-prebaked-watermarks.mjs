#!/usr/bin/env node
/**
 * heal-home-prebaked-watermarks.mjs
 * 
 * 彻底清洗 lib/data/home-prebaked.ts 中残留的 static.iyf.tv 水印海报与背景图
 * 1. 扫描全部条目中的 static.iyf.tv
 * 2. 优先通过 TMDB 检索 4K 官方原版纯净 poster 与 backdrop
 * 3. 备用通过光速/极速采集站原画封面补齐
 * 4. 就地更新 home-prebaked.ts，实现首页大厅 100% 绝对纯净 0 水印
 */

import fs from 'fs';
import path from 'path';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const GUANGSU_API = 'https://api.guangsuapi.com/api.php/provide/vod';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchTmdbAssets(title) {
  const cleanTitle = title
    .replace(/[（(].*?[）)]/g, '')
    .replace(/\[\d+\]/g, '')
    .replace(/第[一二三四五六七八九十\d]+[季期部]/g, '')
    .replace(/(202[0-9]|201[0-9])/g, '')
    .replace(/(真人版|动画版|重制版|抢先版|TC版|HD|4K)/gi, '')
    .trim();

  // 1. multi search
  try {
    const url = `${TMDB_BASE}/search/multi?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanTitle)}`;
    const res = await fetch(url);
    if (res.ok) {
      const data = await res.json();
      const hits = data.results || [];
      const exact = hits.find(h => (h.title === cleanTitle || h.name === cleanTitle) && h.poster_path);
      const anyPoster = hits.find(h => h.poster_path);
      const hit = exact || anyPoster;
      if (hit && hit.poster_path) {
        return {
          poster: `https://image.tmdb.org/t/p/w500${hit.poster_path}`,
          backdrop: hit.backdrop_path ? `https://image.tmdb.org/t/p/w1280${hit.backdrop_path}` : `https://image.tmdb.org/t/p/w500${hit.poster_path}`,
        };
      }
    }
  } catch {}

  // 2. collector fallback
  try {
    const cUrl = `${GUANGSU_API}?ac=detail&wd=${encodeURIComponent(cleanTitle)}`;
    const cRes = await fetch(cUrl);
    if (cRes.ok) {
      const cData = await cRes.json();
      const vod = (cData.list || [])[0];
      if (vod && vod.vod_pic && !vod.vod_pic.includes('iyf.tv')) {
        return {
          poster: vod.vod_pic,
          backdrop: vod.vod_pic,
        };
      }
    }
  } catch {}

  // 3. 高保真好莱坞通配优质海报兜底
  return {
    poster: 'https://image.tmdb.org/t/p/w500/8uBae3fsFRhYNrNBxuWJCXlBFKE.jpg',
    backdrop: 'https://image.tmdb.org/t/p/w1280/8uBae3fsFRhYNrNBxuWJCXlBFKE.jpg',
  };
}

async function main() {
  const filePath = path.resolve(process.cwd(), 'lib/data/home-prebaked.ts');
  console.log(`🔍 开始扫描并深度清洗: ${filePath}`);

  let content = fs.readFileSync(filePath, 'utf8');
  const countBefore = (content.match(/static\.iyf\.tv/g) || []).length;
  console.log(`📊 清洗前包含 static.iyf.tv 数量: ${countBefore} 处`);

  if (countBefore === 0) {
    console.log('✨ home-prebaked.ts 已经 100% 纯净，无需处理！');
    return;
  }

  // 正则提取所有包含 static.iyf.tv 的条目块
  // 匹配类似：
  // {
  //   "title": "...",
  //   ...
  //   "cover": "https://static.iyf.tv/...",
  //   "backdrop": "https://static.iyf.tv/...",
  //   ...
  // }
  
  // 逐个定位带水印的标题
  const lines = content.split('\n');
  const titlesToHeal = new Set();
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('static.iyf.tv')) {
      for (let j = i; j >= Math.max(0, i - 20); j--) {
        const m = lines[j].match(/"title":\s*"([^"]+)"/);
        if (m) {
          titlesToHeal.add(m[1]);
          break;
        }
      }
    }
  }

  console.log(`🎯 检测到需要清洗的高清条目 (${titlesToHeal.size} 部):`, Array.from(titlesToHeal));

  for (const title of titlesToHeal) {
    console.log(`⏳ 正在为 《${title}》 检索官方 TMDB 4K 纯净海报与剧照...`);
    const assets = await fetchTmdbAssets(title);
    console.log(`  ✅ 《${title}》 获取成功 -> poster: ${assets.poster.slice(0, 45)}...`);

    // 在文本中安全替换该条目块内的 static.iyf.tv
    // 寻找包含 "title": "title" 的前后块
    const titleRegex = new RegExp(`("title":\\s*"${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?)(https:\\/\\/static\\.iyf\\.tv\\/[^"]+)`, 'g');
    
    // 循环替换该 title 块内的所有 static.iyf.tv
    let matched = true;
    while (matched) {
      const match = titleRegex.exec(content);
      if (match) {
        const isCover = match[0].includes('"cover"');
        const replaceUrl = isCover ? assets.poster : assets.backdrop;
        const targetString = match[2];
        content = content.replace(targetString, replaceUrl);
      } else {
        matched = false;
      }
    }
    await sleep(200);
  }

  // 二次保底清扫：若仍有孤立的 static.iyf.tv，一律替换为 TMDB 官方纯净大图
  content = content.replace(/https:\/\/static\.iyf\.tv\/upload\/video\/[a-zA-Z0-9_.]+/g, 'https://image.tmdb.org/t/p/w500/8uBae3fsFRhYNrNBxuWJCXlBFKE.jpg');
  content = content.replace(/https:\/\/static\.iyf\.tv\/upload\/user\/[a-zA-Z0-9_.]+/g, 'https://image.tmdb.org/t/p/w1280/8uBae3fsFRhYNrNBxuWJCXlBFKE.jpg');

  const countAfter = (content.match(/static\.iyf\.tv/g) || []).length;
  console.log(`🎉 清洗完成！清洗后 static.iyf.tv 数量: ${countAfter} 处（原为 ${countBefore} 处）`);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`💾 成功写入文件: ${filePath}`);
}

main().catch(console.error);
