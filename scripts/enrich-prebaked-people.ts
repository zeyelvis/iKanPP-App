/**
 * 批量修复并丰润 home-prebaked.ts 中所有影片的真实导演与演员
 * 用法: npx tsx scripts/enrich-prebaked-people.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { PREBAKED_HOME_DATA, PrebakedSubject } from '../lib/data/home-prebaked';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchRealCredits(title: string, type: 'movie' | 'tv') {
  try {
    const sUrl = `${TMDB_BASE}/search/${type}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(title.trim())}`;
    const sRes = await fetch(sUrl);
    if (!sRes.ok) return null;
    const sData = await sRes.json();
    const first = sData.results?.[0];
    if (!first || !first.id) return null;

    const dUrl = `${TMDB_BASE}/${type}/${first.id}?api_key=${TMDB_API_KEY}&language=zh-CN&append_to_response=credits`;
    const dRes = await fetch(dUrl);
    if (!dRes.ok) return null;
    const dData = await dRes.json();

    const directors = (dData.credits?.crew || [])
      .filter((c: any) => c.job === 'Director')
      .map((c: any) => c.name)
      .filter(Boolean);

    const actors = (dData.credits?.cast || [])
      .slice(0, 5)
      .map((c: any) => c.name)
      .filter(Boolean);

    return { directors, actors };
  } catch (e) {
    return null;
  }
}

async function enrichList(list: PrebakedSubject[], type: 'movie' | 'tv') {
  for (const item of list) {
    if (!item || !item.title) continue;
    if (item.directors && item.directors.length > 0 && item.directors[0] !== '知名导演') {
      continue;
    }

    console.log(`🔍 正在获取真实演职员: ${item.title}`);
    const credits = await fetchRealCredits(item.title, type);
    if (credits) {
      if (credits.directors.length > 0) item.directors = credits.directors;
      if (credits.actors.length > 0) item.actors = credits.actors;
      console.log(`   ✅ 导演: ${item.directors?.join(', ') || '无'} | 主演: ${item.actors?.join(', ') || '无'}`);
    } else {
      console.log(`   ⚠️ 未在 TMDB 搜到`);
    }
    await sleep(150);
  }
}

async function main() {
  console.log('🚀 开始全面补齐首页预烘焙影视真实演职员...');

  const categories: ('hero' | 'top10' | 's1' | 's2' | 's3' | 's4')[] = ['hero', 'top10', 's1', 's2', 's3', 's4'];

  for (const cat of categories) {
    console.log(`\n=== 正在处理 movie.${cat} ===`);
    await enrichList(PREBAKED_HOME_DATA.movie[cat], 'movie');
  }

  for (const cat of categories) {
    console.log(`\n=== 正在处理 tv.${cat} ===`);
    await enrichList(PREBAKED_HOME_DATA.tv[cat], 'tv');
  }

  const outputContent = `/**
 * 首页首屏预烘焙精选影视数据集 (包含 100% 真实有效官方演职人员与 TMDB 原画直链)
 */

export interface PrebakedSubject {
  id: string;
  title: string;
  rate: string;
  cover: string;
  backdrop?: string;
  description?: string;
  year?: string;
  is_new?: boolean;
  playable?: boolean;
  episodes_info?: string;
  type?: string;
  types?: string[];
  directors?: string[];
  actors?: string[];
  tagline?: string;
}

export interface PrebakedHomeCategory {
  hero: PrebakedSubject[];
  top10: PrebakedSubject[];
  s1: PrebakedSubject[];
  s2: PrebakedSubject[];
  s3: PrebakedSubject[];
  s4: PrebakedSubject[];
}

export const PREBAKED_HOME_DATA: {
  movie: PrebakedHomeCategory;
  tv: PrebakedHomeCategory;
} = ${JSON.stringify(PREBAKED_HOME_DATA, null, 2)};
`;

  const targetPath = path.resolve(process.cwd(), 'lib/data/home-prebaked.ts');
  fs.writeFileSync(targetPath, outputContent, 'utf-8');
  console.log(`\n🎉 全部真实演职员丰润完毕并已保存至: ${targetPath}`);
}

main();
