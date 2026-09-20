import fs from 'fs';
import path from 'path';

const TMDB_API_KEY = '';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

async function fetchTMDBDetails(type: 'movie' | 'tv', id: string) {
  try {
    const url = `${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=zh-CN&append_to_response=credits`;
    const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) return null;
    return await res.json() as any;
  } catch {
    return null;
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const filePath = path.join(process.cwd(), 'lib/data/people-prebaked.ts');
  let content = fs.readFileSync(filePath, 'utf-8');

  // 正则提取 PEOPLE_PREBAKED_ENTITIES 数组内容
  const match = content.match(/export const PEOPLE_PREBAKED_ENTITIES: TitleEntity\[\] = (\[[\s\S]*\]);/);
  if (!match) {
    console.error('无法解析 people-prebaked.ts');
    process.exit(1);
  }

  const entities = JSON.parse(match[1]) as any[];
  console.log(`📦 总共读取到 ${entities.length} 个条目，开始检查与清洗...`);

  let updatedCount = 0;

  for (let i = 0; i < entities.length; i++) {
    const item = entities[i];
    const needsEnrich = (!item.directors || item.directors.length === 0 || !item.actors || item.actors.length === 0);

    if (needsEnrich) {
      console.log(`[${i + 1}/${entities.length}] 正在为代表作补全演职员: 《${item.title}》 (TMDB: ${item.tmdbType}/${item.tmdbId})`);
      
      // 先过滤掉假数据
      item.directors = (item.directors || []).filter((d: string) => d && d !== '知名导演');
      item.actors = (item.actors || []).filter((a: string) => a && a !== '实力主演');

      if (item.tmdbId && item.tmdbType) {
        const detail = await fetchTMDBDetails(item.tmdbType, item.tmdbId);
        if (detail && detail.credits) {
          if (item.directors.length === 0) {
            const crew = detail.credits.crew || [];
            const directors = crew
              .filter((c: any) => c.job === 'Director')
              .map((c: any) => c.name)
              .filter(Boolean);
            if (directors.length > 0) {
              item.directors = directors;
            }
          }

          if (item.actors.length === 0) {
            const cast = detail.credits.cast || [];
            const actors = cast
              .slice(0, 5)
              .map((c: any) => c.name)
              .filter(Boolean);
            if (actors.length > 0) {
              item.actors = actors;
            }
          }
        }
        await sleep(100);
      }

      updatedCount++;
    }
  }

  console.log(`🎉 清洗与补全完成！共更新 ${updatedCount} 部影片。`);

  // 写回文件
  const newContent = `/**
 * 核心名导与顶级号召力巨星代表作预烘焙数据集 (Prebaked People Credits)
 * 涵盖 56+ 位核心人物，冷启动秒开且 100% 有作品
 */
import { TitleEntity } from '@/lib/types/entity';

export const PEOPLE_PREBAKED_ENTITIES: TitleEntity[] = ${JSON.stringify(entities, null, 2)};
`;

  fs.writeFileSync(filePath, newContent, 'utf-8');
  console.log(`💾 已成功写回 lib/data/people-prebaked.ts！`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
