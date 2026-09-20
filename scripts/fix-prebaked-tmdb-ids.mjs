import fs from 'fs';
import path from 'path';

const TMDB_API_KEY = '';
const filePath = path.resolve('lib/data/home-prebaked.ts');

async function searchTMDB(title, typeHint) {
  try {
    const clean = title.replace(/第[一二三四五六七八九十\d]+[季部篇]/g, '').trim();
    const mediaType = typeHint === 'movie' ? 'movie' : typeHint === 'tv' ? 'tv' : 'multi';
    const url = `https://api.themoviedb.org/3/search/${mediaType}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(clean)}`;
    const res = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(6000) });
    if (!res.ok) return null;
    const data = await res.json();
    const hit = data.results?.[0];
    if (!hit) return null;

    const hitTitle = (hit.title || hit.name || '').trim();
    // 简易相关度校验
    if (hitTitle && (hitTitle.includes(clean) || clean.includes(hitTitle))) {
      return hit;
    }
    return null;
  } catch {
    return null;
  }
}

async function run() {
  console.log('Starting prebaked TMDB ID & backdrop enrichment...');
  let content = fs.readFileSync(filePath, 'utf-8');

  // 匹配所有带占位 ID 的影片对象块
  const itemRegex = /\{\s*"id":\s*"(pb_[^"]+)",[\s\S]*?"title":\s*"([^"]+)",[\s\S]*?\}/g;
  let matches = [];
  let m;
  while ((m = itemRegex.exec(content)) !== null) {
    matches.push({
      full: m[0],
      pbId: m[1],
      title: m[2],
      index: m.index
    });
  }

  console.log(`Found ${matches.length} items with placeholder IDs.`);
  let fixedCount = 0;

  for (const item of matches) {
    // 判定是 movie 还是 tv
    const typeHint = item.pbId.includes('_m_') ? 'movie' : 'tv';
    const hit = await searchTMDB(item.title, typeHint);
    if (hit && hit.id) {
      const realId = String(hit.id);
      let updatedBlock = item.full;

      // 替换或注入 tmdbId
      if (!updatedBlock.includes('"tmdbId":')) {
        updatedBlock = updatedBlock.replace(
          `"id": "${item.pbId}",`,
          `"id": "${item.pbId}",\n        "tmdbId": "${realId}",`
        );
      } else {
        updatedBlock = updatedBlock.replace(
          /"tmdbId":\s*"[^"]*",?/,
          `"tmdbId": "${realId}",`
        );
      }

      // 若有 TMDB 真实横版剧照且当前没有或者为竖版
      if (hit.backdrop_path && (!updatedBlock.includes('image.tmdb.org') || updatedBlock.includes('doubanio.com'))) {
        const tmdbBackdrop = `https://image.tmdb.org/t/p/w1280${hit.backdrop_path}`;
        if (updatedBlock.includes('"backdrop":')) {
          updatedBlock = updatedBlock.replace(
            /"backdrop":\s*"[^"]*",?/,
            `"backdrop": "${tmdbBackdrop}",`
          );
        }
      }

      if (updatedBlock !== item.full) {
        content = content.replace(item.full, updatedBlock);
        fixedCount++;
        console.log(`[${fixedCount}] Enriched: ${item.title} -> TMDB ${realId}`);
      }
    }
    // 轻微限速防限频
    await new Promise(r => setTimeout(r, 60));
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Finished! Successfully enriched ${fixedCount} prebaked items with real TMDB IDs.`);
}

run();
