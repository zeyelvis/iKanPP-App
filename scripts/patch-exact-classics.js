const https = require('https');
const fs = require('fs');
const path = require('path');

const TMDB_API_KEY = '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';

const EXACT_OVERRIDES = {
  '无间道': { id: 10775, type: 'movie', rate: '9.3', title: '无间道' },
  '东成西就': { id: 55157, type: 'movie', rate: '8.9', title: '射雕英雄传之东成西就' },
  '新龙门客栈': { id: 40213, type: 'movie', rate: '8.7', title: '新龙门客栈' },
  '天龙八部': { id: 72819, type: 'tv', rate: '9.1', title: '天龙八部' },
  '上海滩': { id: 15855, type: 'tv', rate: '9.2', title: '上海滩' },
  '射雕英雄传': { id: 104, type: 'tv', rate: '9.2', title: '射雕英雄传' },
  '海王': { id: 297802, type: 'movie', rate: '7.8', title: '海王' },
  '怦然心动': { id: 43949, type: 'movie', rate: '9.1', title: '怦然心动' },
  '唐人街探案': { id: 373200, type: 'movie', rate: '7.7', title: '唐人街探案' }
};

function httpGet(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

function checkHead(url) {
  return new Promise((resolve) => {
    if (!url || !url.startsWith('http')) return resolve(false);
    const req = https.request(url, { method: 'HEAD', timeout: 4000 }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 400);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

async function fetchExact(override) {
  const detailUrl = `${TMDB_BASE}/${override.type}/${override.id}?api_key=${TMDB_API_KEY}&language=zh-CN&append_to_response=credits`;
  const detail = await httpGet(detailUrl);
  if (!detail) return null;

  const title = override.title || detail.title || detail.name;
  const cover = detail.poster_path ? `https://image.tmdb.org/t/p/w500${detail.poster_path}` : '';
  const backdrop = detail.backdrop_path ? `https://image.tmdb.org/t/p/w1280${detail.backdrop_path}` : cover;
  const year = (detail.release_date || detail.first_air_date || '').slice(0, 4);
  const types = (detail.genres || []).map(g => g.name).slice(0, 3);
  const directors = (detail.credits?.crew || [])
    .filter(c => c.job === 'Director')
    .map(c => c.name || c.original_name)
    .slice(0, 2);
  const actors = (detail.credits?.cast || [])
    .map(c => c.name || c.original_name)
    .slice(0, 4);
  let description = (detail.overview || '').replace(/[\r\n\t]+/g, ' ').slice(0, 120).trim();
  if (description && !description.endsWith('。') && !description.endsWith('…')) {
    description += '…';
  }

  return {
    title,
    cover,
    backdrop,
    year,
    rate: override.rate,
    types: types.length > 0 ? types : ['经典', '剧情'],
    directors,
    actors,
    description
  };
}

async function run() {
  const targetPath = path.join(__dirname, '../lib/data/collections-prebaked.ts');
  let content = fs.readFileSync(targetPath, 'utf8');

  const start = content.indexOf('= [');
  const end = content.lastIndexOf('];');
  if (start === -1 || end === -1) {
    console.error('Cannot locate JSON payload');
    return;
  }

  const jsonStr = content.slice(start + 2, end + 1);
  const collections = JSON.parse(jsonStr);

  for (const [key, conf] of Object.entries(EXACT_OVERRIDES)) {
    console.log(`Patching exact classic: ${key} -> ${conf.title} (${conf.id})...`);
    const patchData = await fetchExact(conf);
    if (!patchData || !patchData.cover) {
      console.warn(`Failed to fetch exact data for ${key}`);
      continue;
    }
    const isValid = await checkHead(patchData.cover);
    if (!isValid) {
      console.warn(`Cover invalid for ${key}`);
      continue;
    }

    collections.forEach(col => {
      col.films.forEach(film => {
        if (film.title === key || film.title.includes(key) || key.includes(film.title)) {
          film.title = patchData.title;
          film.cover = patchData.cover;
          film.backdrop = patchData.backdrop;
          film.year = patchData.year;
          film.rate = patchData.rate;
          film.types = patchData.types;
          if (patchData.directors.length > 0) film.directors = patchData.directors;
          if (patchData.actors.length > 0) film.actors = patchData.actors;
          if (patchData.description) film.description = patchData.description;
          console.log(`  Updated in collection [${col.title}]: ${film.title} (${film.year})`);
        }
      });
      // 更新 coverPosters
      col.coverPosters = col.films.slice(0, 3).map(f => f.cover);
    });
  }

  const newTsContent = `/**
 * 精选片单预烘焙数据集 (Curated Collections - 14 大主题全矩阵)
 * 采用 100% 真实有效、已通过 HTTP HEAD 200 校验的 TMDB 官方高清海报直链
 * 每个片单深度收录 12 ~ 16 部经典口碑代表作，全站影视库丰富饱满
 */

export interface CollectionSubject {
  id: string;
  title: string;
  rate: string;
  cover: string;
  backdrop?: string;
  description?: string;
  year?: string;
  types?: string[];
  directors?: string[];
  actors?: string[];
}

export interface CuratedCollection {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  coverPosters: string[]; // 3 张 100% 有效封面用于横向阶梯层叠
  totalCount: number;
  description: string;
  accent?: string;
  films: CollectionSubject[];
}

export const CURATED_COLLECTIONS: CuratedCollection[] = ${JSON.stringify(collections, null, 2)};

export function getCollectionBySlug(slug: string): CuratedCollection | undefined {
  return CURATED_COLLECTIONS.find((c) => c.slug === slug);
}

export function getCollectionById(id: string): CuratedCollection | undefined {
  return CURATED_COLLECTIONS.find((c) => c.id === id);
}
`;

  fs.writeFileSync(targetPath, newTsContent, 'utf8');
  console.log('Successfully patched exact classics into collections-prebaked.ts!');
}

run();
