import fs from 'fs';
import path from 'path';
import { PEOPLE_PREBAKED_ENTITIES } from '../lib/data/people-prebaked';
import { PREBAKED_AVATARS } from '../lib/data/prebaked-avatars';

const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';

// 常见热门影视明星补充库（包含《绅士们》、《驯龙高手》等高频片目）
const EXTRA_POPULAR_PEOPLE = [
  // 绅士们
  '盖·里奇', '提奥·詹姆斯', '卡雅·斯考达里奥', '丹尼尔·艾格斯', '乔莉·理查德森', '维尼·琼斯', '吉安卡罗·埃斯波西托', '雷·温斯顿', '弗莱迪·福克斯',
  // 驯龙高手
  '杰伊·巴鲁切尔', '杰拉德·巴特勒', '克雷格·费格森', '亚美莉卡·费雷拉', '乔纳·希尔', '克里斯托夫·梅兹-普莱瑟', 'T·J·米勒', '克里斯汀·韦格',
  // 漫威/好莱坞巨星
  '小罗伯特·唐尼', '克里斯·埃文斯', '克里斯·海姆斯沃斯', '斯嘉丽·约翰逊', '马克·鲁弗洛', '杰瑞米·雷纳', '汤姆·赫兰德', '本尼迪克特·康伯巴奇', '查德维克·博斯曼', '保罗·路德', '布丽·拉尔森', '瑞安·雷诺兹',
  // 华语顶级戏骨
  '郭富城', '甄子丹', '古天乐', '张家辉', '刘青云', '谢霆锋', '陈道明', '王志文', '李雪健', '于和伟', '辛柏青', '秦昊', '段奕宏', '王千源', '廖凡', '张涵予', '张鲁一'
];

async function fetchPersonAvatar(name: string): Promise<string | null> {
  const cleanName = name.trim();
  if (!cleanName || cleanName === '实力主演' || cleanName === '导演') return null;

  try {
    const url = `${TMDB_BASE}/search/person?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(cleanName)}`;
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    const results = Array.isArray(data.results) ? data.results : [];
    if (results.length === 0) return null;

    const candidate = results.find((p: any) => Boolean(p.profile_path)) || results[0];
    if (candidate?.profile_path) {
      return `https://image.tmdb.org/t/p/w185${candidate.profile_path}`;
    }
    return null;
  } catch (err) {
    console.warn(`Fetch avatar fail for ${cleanName}:`, err);
    return null;
  }
}

async function main() {
  const allNames = new Set<string>();

  // 1. 预置数据中的影人
  PEOPLE_PREBAKED_ENTITIES.forEach(e => {
    (e.directors || []).forEach(d => d && allNames.add(d.trim()));
    (e.actors || []).forEach(a => a && allNames.add(a.trim()));
  });

  // 2. 额外补充的高频影人
  EXTRA_POPULAR_PEOPLE.forEach(p => allNames.add(p.trim()));

  console.log(`总共汇总到 ${allNames.size} 位影人进行头像丰润...`);

  const avatarMap: Record<string, string> = { ...PREBAKED_AVATARS };
  const missingNames = Array.from(allNames).filter(name => !avatarMap[name]);

  console.log(`已有预置头像: ${Object.keys(PREBAKED_AVATARS).length} 位，待抓取: ${missingNames.length} 位`);

  // 并发拉取 (分批并发 8)
  const batchSize = 8;
  let successCount = 0;

  for (let i = 0; i < missingNames.length; i += batchSize) {
    const batch = missingNames.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (name) => {
        const url = await fetchPersonAvatar(name);
        if (url) {
          avatarMap[name] = url;
          successCount++;
          console.log(`[成功] ${name} -> ${url}`);
        } else {
          console.log(`[无图] ${name}`);
        }
      })
    );
    // 轻微延迟避免触发 TMDB 频率限制
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`抓取完成！成功新增 ${successCount} 位影人头像，当前总头像数: ${Object.keys(avatarMap).length}`);

  // 格式化输出为 TS 文件
  const sortedKeys = Object.keys(avatarMap).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
  const sortedMap: Record<string, string> = {};
  for (const k of sortedKeys) {
    sortedMap[k] = avatarMap[k];
  }

  const content = `export const PREBAKED_AVATARS: Record<string, string> = ${JSON.stringify(sortedMap, null, 2)};\n`;
  const targetPath = path.join(__dirname, '../lib/data/prebaked-avatars.ts');
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log(`已成功写回 ${targetPath}`);
}

main().catch(console.error);
