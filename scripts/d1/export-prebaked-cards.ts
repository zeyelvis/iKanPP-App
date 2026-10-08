/**
 * 重构阶段 2：导出旧站预烘焙数据里的作品卡片，供导入时补建「只在预烘焙数据里、片库没有」的落地页作品
 * （如最新上线横轨里的 /title/ik_radar_tv_20-厨娘、/title/夜色将烬：旧站详情页直接用卡片资料直出）。
 *
 *   npx tsx scripts/d1/export-prebaked-cards.ts <输出 json> [回溯天数，默认 7]
 *
 * 最新上线每小时都在换，所以从 git 历史里取最近几天每个版本的 latest-titles-prebaked.ts（新的覆盖旧的）；
 * 首页轮播与货架取当前版本。只读。
 */
import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { normalizeTitle } from '../../lib/data/entities/entity-utils';
import { PREBAKED_HOME_DATA } from '../../lib/data/home-prebaked';

interface Card {
  name: string;
  year: number | null;
  kind: string | null;
  cover: string | null;
  backdrop: string | null;
  rate: string | null;
  tmdbId: string | null;
  description: string | null;
  genres: string[];
  badge: string | null;
  source: string;
}

const [outFile, daysArg] = process.argv.slice(2);
const days = Number(daysArg ?? 7);
const cards = new Map<string, Card>();
const keyOf = (name: string, year: number | null) => `${normalizeTitle(name)}|${year ?? ''}`;
const clean = (url?: string | null) => (url && !url.includes('iyf.tv') && !url.includes('placeholder') ? url : null);
const add = (c: Card) => {
  if (!c.name || !normalizeTitle(c.name)) return;
  const k = keyOf(c.name, c.year);
  const prev = cards.get(k);
  // 资料多的留下：有 TMDB 编号、有海报、有简介的优先。
  const score = (x: Card) => Number(Boolean(x.tmdbId)) * 4 + Number(Boolean(x.cover)) * 2 + Number(Boolean(x.description));
  if (!prev || score(c) >= score(prev)) cards.set(k, c);
};

// 1. 最新上线：最近几天每个提交里的版本，旧的先放、新的覆盖。
const shas = execFileSync('git', ['log', `--since=${days}.days`, '--format=%H', '--', 'lib/data/latest-titles-prebaked.ts'], { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(Boolean)
  .reverse();
for (const sha of shas) {
  const text = execFileSync('git', ['show', `${sha}:lib/data/latest-titles-prebaked.ts`], { encoding: 'utf8', maxBuffer: 64 << 20 });
  const m = text.match(/PREBAKED_LATEST_TITLES[^=]*=\s*(\{[\s\S]*\});?\s*$/);
  if (!m) continue;
  let data: Record<string, Array<Record<string, any>>>;
  try {
    data = JSON.parse(m[1]);
  } catch {
    continue;
  }
  for (const list of Object.values(data)) {
    for (const it of list ?? []) {
      add({
        name: String(it.title ?? '').trim(),
        year: Number(it.year) || null,
        kind: it.type ?? null,
        cover: clean(it.cover),
        backdrop: clean(it.backdrop),
        rate: it.rate && it.rate !== '8.8' ? String(it.rate) : null, // 8.8 是旧脚本写死的默认分
        tmdbId: it.tmdbId ? String(it.tmdbId) : null,
        description: it.description ?? null,
        genres: Array.isArray(it.genres) ? it.genres : [],
        badge: it.updateBadge ?? null,
        source: `latest@${sha.slice(0, 7)}`,
      });
    }
  }
}

// 2. 首页与各频道的轮播、货架（当前版本）。
for (const [channel, data] of Object.entries(PREBAKED_HOME_DATA as Record<string, Record<string, unknown>>)) {
  for (const [section, list] of Object.entries(data ?? {})) {
    if (!Array.isArray(list)) continue;
    for (const it of list as Array<Record<string, any>>) {
      if (!it?.title || !('cover' in it)) continue;
      add({
        name: String(it.title).trim(),
        year: Number(it.year) || null,
        kind: it.type ?? null,
        cover: clean(it.cover),
        backdrop: clean(it.backdrop),
        rate: it.rate ? String(it.rate) : null,
        tmdbId: it.tmdbId ? String(it.tmdbId) : null,
        description: it.description ?? null,
        genres: Array.isArray(it.types) ? it.types : [],
        badge: it.episodes_info ?? null,
        source: `home:${channel}.${section}`,
      });
    }
  }
}

writeFileSync(outFile, JSON.stringify([...cards.values()], null, 1));
console.log(`预烘焙卡片：${cards.size} 部（最新上线 ${shas.length} 个版本 + 首页轮播与货架）→ ${outFile}`);
