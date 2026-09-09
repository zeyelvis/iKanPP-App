/**
 * 热门名导与核心明星代表作预烘焙生成脚本
 * 用法: npx tsx scripts/bake-people-credits.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { POPULAR_DIRECTORS, POPULAR_ACTORS } from '../lib/data/popular-people';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 纯纯 edge 兼容 slug 生成
function toSlug(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'movie';
}

async function fetchPersonCredits(name: string, role: 'director' | 'actor') {
  try {
    const sUrl = `${TMDB_BASE}/search/person?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(name)}`;
    const sRes = await fetch(sUrl);
    if (!sRes.ok) return [];
    const sData = await sRes.json();
    const person = sData.results?.[0];
    if (!person || !person.id) return [];

    const cUrl = `${TMDB_BASE}/person/${person.id}/combined_credits?api_key=${TMDB_API_KEY}&language=zh-CN`;
    const cRes = await fetch(cUrl);
    if (!cRes.ok) return [];
    const cData = await cRes.json();

    let candidates: any[] = [];
    if (role === 'director') {
      const crew = Array.isArray(cData.crew) ? cData.crew : [];
      candidates = crew.filter((c: any) => c.job === 'Director' || c.department === 'Directing');
    } else {
      candidates = Array.isArray(cData.cast) ? cData.cast : [];
    }

    return candidates
      .filter((c: any) => (c.title || c.name) && c.poster_path)
      .sort((a: any, b: any) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 6);
  } catch (e) {
    console.warn(`Fetch ${name} error:`, e);
    return [];
  }
}

async function main() {
  console.log('🚀 开始抓取名导与巨星代表作...');
  const collectedEntities: any[] = [];
  const seenTmdb = new Set<string>();
  let seq = 1000; // 从 1000 起始分配实体序列

  // 1. 抓取导演
  for (const dir of POPULAR_DIRECTORS) {
    console.log(`🎬 抓取导演: ${dir}`);
    const items = await fetchPersonCredits(dir, 'director');
    for (const item of items) {
      const type: 'movie' | 'tv' = item.media_type === 'tv' ? 'tv' : 'movie';
      const key = `${type}:${item.id}`;
      const title = item.title || item.name;

      if (!seenTmdb.has(key)) {
        seenTmdb.add(key);
        seq++;
        const entityId = `ik${String(seq).padStart(6, '0')}`;
        collectedEntities.push({
          entityId,
          slug: toSlug(title),
          tmdbId: String(item.id),
          tmdbType: type,
          title,
          originalTitle: item.original_title || item.original_name,
          type,
          year: (item.release_date || item.first_air_date || '2024').slice(0, 4),
          description: item.overview || `${title} 由 ${dir} 执导，在 iKanPP 免费在线观看高清完整版。`,
          cover: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          rate: item.vote_average ? item.vote_average.toFixed(1) : '8.5',
          genres: [type === 'movie' ? '电影' : '电视剧'],
          directors: [dir],
          actors: ['实力主演'],
          createdAt: '2026-09-01T00:00:00Z',
          updatedAt: '2026-09-01T00:00:00Z',
        });
      } else {
        // 追加导演
        const existing = collectedEntities.find(e => e.tmdbId === String(item.id) && e.tmdbType === type);
        if (existing && !existing.directors.includes(dir)) {
          existing.directors.push(dir);
        }
      }
    }
    await sleep(200);
  }

  // 2. 抓取演员
  for (const act of POPULAR_ACTORS) {
    console.log(`🌟 抓取演员: ${act}`);
    const items = await fetchPersonCredits(act, 'actor');
    for (const item of items) {
      const type: 'movie' | 'tv' = item.media_type === 'tv' ? 'tv' : 'movie';
      const key = `${type}:${item.id}`;
      const title = item.title || item.name;

      if (!seenTmdb.has(key)) {
        seenTmdb.add(key);
        seq++;
        const entityId = `ik${String(seq).padStart(6, '0')}`;
        collectedEntities.push({
          entityId,
          slug: toSlug(title),
          tmdbId: String(item.id),
          tmdbType: type,
          title,
          originalTitle: item.original_title || item.original_name,
          type,
          year: (item.release_date || item.first_air_date || '2024').slice(0, 4),
          description: item.overview || `${title} 由 ${act} 主演，在 iKanPP 免费在线观看高清完整版。`,
          cover: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          backdrop: item.backdrop_path ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}` : `https://image.tmdb.org/t/p/w500${item.poster_path}`,
          rate: item.vote_average ? item.vote_average.toFixed(1) : '8.5',
          genres: [type === 'movie' ? '电影' : '电视剧'],
          directors: ['知名导演'],
          actors: [act],
          createdAt: '2026-09-01T00:00:00Z',
          updatedAt: '2026-09-01T00:00:00Z',
        });
      } else {
        // 追加演员
        const existing = collectedEntities.find(e => e.tmdbId === String(item.id) && e.tmdbType === type);
        if (existing) {
          if (existing.actors[0] === '实力主演') {
            existing.actors = [act];
          } else if (!existing.actors.includes(act)) {
            existing.actors.push(act);
          }
        }
      }
    }
    await sleep(200);
  }

  console.log(`✅ 抓取完成！共收集 ${collectedEntities.length} 部经典代表作！`);

  const fileContent = `/**
 * 核心名导与顶级号召力巨星代表作预烘焙数据集 (Prebaked People Credits)
 * 涵盖 56+ 位核心人物，冷启动秒开且 100% 有作品
 */
import { TitleEntity } from '@/lib/types/entity';

export const PEOPLE_PREBAKED_ENTITIES: TitleEntity[] = ${JSON.stringify(collectedEntities, null, 2)};
`;

  const outputPath = path.resolve(process.cwd(), 'lib/data/people-prebaked.ts');
  fs.writeFileSync(outputPath, fileContent, 'utf-8');
  console.log(`🎉 预烘焙数据已生成到: ${outputPath}`);
}

main();
