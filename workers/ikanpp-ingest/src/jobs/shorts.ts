/**
 * 短剧频道首屏（轮播 8 席、热播标签 12 席、榜单 top10），取代 scripts/sync-juliang-short-dramas.mjs。
 * 来源：巨量资源短剧分类（t=5）最近入库的前 3 页。写回 documents 的 home:short，只替换 hero / trendingNav / top10。
 * 与旧脚本的区别（准则 19.1 可见事实一致）：
 * - 不编评分（旧脚本按 vod_id 算出 8.2～9.6 的假分）、不编演员（旧脚本写「短剧实力派」）；
 * - 简介只用片方的真实简介，「更新全集」「剧情简介暂缺」和「快来夸克网盘下载」这类采集站套话不用；
 * - 擦边短剧（590）与伦理、写真、解说类一律不要。
 * 取到的作品不足 8 部时保留上一次的结果。
 */
import { isCleanChineseTitle } from '../../../../lib/data/entities/entity-utils';
import type { Env } from '../env';

const API = 'https://api.juliang.live/api/provide/vod/';
const EXCLUDED_TYPES = new Set([190, 191, 199, 590]);
const EXCLUDED_WORDS = /伦理|写真|福利|限制级|18禁|三级|擦边|解说|说电影|速看|影视剪辑|混剪/;
/** 采集站简介里的套话与外站导流，不算简介。 */
const BOILERPLATE = /网盘|夸克|迅雷|下载|敬请期待|简介暂缺|暂无简介|^更新全集$|是一部精彩的短剧作品/;

interface Vod {
  vod_id: number | string;
  vod_name?: string;
  vod_pic?: string;
  vod_remarks?: string;
  vod_year?: string;
  vod_content?: string;
  vod_actor?: string;
  vod_play_url?: string;
  type_id?: number | string;
  type_name?: string;
}

const text = (html?: string) => (html ?? '').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const cleanName = (raw?: string) => (raw ?? '').replace(/[（(][^）)]*[）)]/g, '').replace(/[【\[][^】\]]*[】\]]/g, '').replace(/\s+/g, ' ').trim();

/** 集数：播放地址第一条线路的分集数；只有一条「全集」合集时，改用备注或片名里写的集数，都没有就不写。 */
function episodeCount(v: Vod): number {
  const first = (v.vod_play_url ?? '').split('$$$')[0];
  const n = first.split('#').filter((p) => p.includes('$')).length;
  if (n > 1) return n;
  return Number(v.vod_remarks?.match(/(\d+)\s*集/)?.[1]) || Number(v.vod_name?.match(/(\d+)\s*集/)?.[1]) || 0;
}

function description(v: Vod): string | undefined {
  const d = text(v.vod_content);
  return d.length >= 20 && !BOILERPLATE.test(d) ? d : undefined;
}

export async function syncShorts(env: Env): Promise<string[]> {
  const vods: Vod[] = [];
  for (let page = 1; page <= 3; page++) {
    const res = await fetch(`${API}?ac=detail&t=5&pg=${page}`, { headers: { 'User-Agent': 'Mozilla/5.0', Accept: 'application/json' }, signal: AbortSignal.timeout(10_000) }).catch(() => null);
    if (!res?.ok) continue;
    const data = (await res.json().catch(() => null)) as { list?: Vod[] } | null;
    vods.push(...(data?.list ?? []));
  }
  const seen = new Set<string>();
  const picked = vods.filter((v) => {
    const title = cleanName(v.vod_name);
    if (!title || title.length < 2 || seen.has(title) || !v.vod_pic?.startsWith('http')) return false;
    if (EXCLUDED_TYPES.has(Number(v.type_id)) || EXCLUDED_WORDS.test(`${v.vod_name} ${v.type_name ?? ''}`) || !isCleanChineseTitle(title)) return false;
    seen.add(title);
    return true;
  });
  if (picked.length < 8) return [`巨量只取到 ${picked.length} 部可用短剧，保留上次结果`];

  const finished = (v: Vod) => /完结|全集/.test(v.vod_remarks ?? '');
  // 轮播优先有真实简介的。
  const heroSource = [...picked.filter((v) => description(v)), ...picked.filter((v) => !description(v))].slice(0, 8);
  const hero = heroSource.map((v) => {
    const title = cleanName(v.vod_name);
    const eps = episodeCount(v);
    const sub = (v.type_name ?? '').replace(/短剧$/, '');
    const actors = (v.vod_actor ?? '').split(/[\/&,，、]/).map((a) => a.trim()).filter(Boolean).slice(0, 3);
    return {
      id: `jl_short_${v.vod_id}`,
      title,
      rate: '',
      cover: v.vod_pic!,
      backdrop: v.vod_pic!,
      ...(description(v) ? { description: description(v)!.slice(0, 150) } : {}),
      year: v.vod_year && /^\d{4}$/.test(v.vod_year) ? v.vod_year : '',
      types: ['短剧', ...(sub ? [sub] : [])],
      ...(eps ? { episodes_info: finished(v) ? `全${eps}集` : `更新至第${eps}集` } : {}),
      type: 'tv',
      is_new: true,
      playable: true,
      ...(actors.length ? { actors } : {}),
    };
  });
  const trendingNav = picked.slice(0, 12).map((v) => {
    const eps = episodeCount(v);
    return { title: cleanName(v.vod_name), updateBadge: !finished(v) && eps ? String(eps) : '' };
  });
  const top10 = hero.map((h, i) => ({ id: `pb_s_top_${i + 1}`, title: h.title, rate: '', cover: h.cover, year: h.year, types: h.types, is_new: true, playable: true }));

  const row = await env.DB.prepare("SELECT value FROM documents WHERE key = 'home:short'").first<{ value: string }>();
  const doc = row ? (JSON.parse(row.value) as Record<string, unknown>) : { s1: [], s2: [], s3: [], s4: [] };
  Object.assign(doc, { hero, trendingNav, top10 });
  await env.DB.prepare(
    "INSERT INTO documents (key, value, source, updated_at) VALUES ('home:short', ?, 'ingest:shorts', strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) ON CONFLICT (key) DO UPDATE SET value = excluded.value, source = excluded.source, updated_at = excluded.updated_at",
  )
    .bind(JSON.stringify(doc))
    .run();
  return [`short：巨量 ${vods.length} 部 → 可用 ${picked.length}，轮播 ${hero.length}（有简介 ${hero.filter((h) => 'description' in h).length}），热播标签 ${trendingNav.length}`];
}
