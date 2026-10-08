/**
 * 各频道轮播大图（hero）与热播标签（trendingNav），100% 对齐爱壹帆（AGENTS 准则 6）：
 * 轮播取频道网页里的 slide-list（纪录片取轮播接口，不足 8 席用经典纪录片补齐），用 TMDB 补海报、
 * 剧照、简介、年份与评分；热播标签取 getHotVideoTop，保留更新角标。
 * 结果写回 documents 表的 home:<频道> 文档，只替换 hero 与 trendingNav 两块。
 * 某个频道抓取失败时，保留上一次的结果，不用写死的兜底片单。
 */
import type { Env } from '../env';
import { bannerSlides, hotTop, pageSlides, type IyfSlide } from '../iyf';
import { tmdbById, tmdbSearch, type TmdbBrief } from '../tmdb';

type Kind = 'movie' | 'tv' | 'documentary';
interface Channel {
  key: string;
  slides: () => Promise<IyfSlide[]>;
  cid: string;
  trending: number;
  force?: Kind;
}

const CHANNELS: Channel[] = [
  { key: 'all', slides: () => pageSlides('https://www.iyf.tv/'), cid: '0,1', trending: 12 },
  { key: 'movie', slides: () => pageSlides('https://www.iyf.tv/movie'), cid: '0,1,3', trending: 12, force: 'movie' },
  { key: 'tv', slides: () => pageSlides('https://www.iyf.tv/drama'), cid: '0,1,4', trending: 12, force: 'tv' },
  { key: 'anime', slides: () => pageSlides('https://www.iyf.tv/anime'), cid: '0,1,6', trending: 12, force: 'tv' },
  { key: 'variety', slides: () => pageSlides('https://www.iyf.tv/variety'), cid: '0,1,5', trending: 8, force: 'tv' },
  { key: 'documentary', slides: () => bannerSlides('0,1,7'), cid: '0,1,7', trending: 8, force: 'documentary' },
];

/** TMDB 容易配错的片名：直接用确定的编号。 */
const EXACT: Record<string, { id: number; type: 'movie' | 'tv'; title?: string; types?: string[] }> = {
  欢迎来地球: { id: 127700, type: 'tv', title: '欢迎来地球', types: ['纪录片', '自然', '探索'] },
  带你探索地球: { id: 127700, type: 'tv', title: '欢迎来地球', types: ['纪录片', '自然', '探索'] },
  泰国洞穴救援: { id: 680058, type: 'movie', types: ['纪录片', '自然', '探索'] },
  '内马尔：不完美的完美球星': { id: 153519, type: 'tv', types: ['纪录片', '人物', '体育'] },
  '屏住呼吸：挑战冰潜记录': { id: 958080, type: 'movie', types: ['纪录片', '极限', '体育'] },
  史前星球: { id: 95171, type: 'tv', types: ['纪录片', '自然', '探索'] },
  王朝第2季: { id: 82953, type: 'tv', types: ['纪录片', '自然', '野生动物'] },
  '王朝 第二季': { id: 82953, type: 'tv', title: '王朝第2季', types: ['纪录片', '自然', '野生动物'] },
  漫威616: { id: 102693, type: 'tv', types: ['纪录片', '文化', '影视'] },
  欢迎来到雷克斯汉姆: { id: 126929, type: 'tv', types: ['纪录片', '体育', '励志'] },
  小球会大明星: { id: 126929, type: 'tv', title: '欢迎来到雷克斯汉姆', types: ['纪录片', '体育', '励志'] },
  地球脉动: { id: 106379, type: 'tv' },
  蓝色星球: { id: 74313, type: 'tv' },
  '七个世界，一个星球': { id: 94665, type: 'tv' },
};

/** 纪录片轮播不足 8 席时的补位。 */
const DOCUMENTARY_FILL = ['地球脉动', '蓝色星球', '史前星球', '河西走廊', '风味人间', '七个世界，一个星球', '如果国宝会说话', '欢迎来地球'];

const PLACEHOLDER = '/placeholder-poster.svg';

async function lookup(env: Env, title: string, type: 'movie' | 'tv'): Promise<TmdbBrief | null> {
  const exact = EXACT[title];
  if (exact) {
    const hit = await tmdbById(env.TMDB_API_KEY, exact.id, exact.type);
    if (hit) return hit;
  }
  return tmdbSearch(env.TMDB_API_KEY, title, type);
}

/** 轮播项，字段与原 PREBAKED_HOME_DATA 的 hero 项相同。 */
async function heroItem(env: Env, slide: IyfSlide, index: number, force?: Kind) {
  const sub = slide.subTitle ?? '';
  const isMovie = force === 'movie' || (!force && sub.includes('电影'));
  const isSeries = force === 'tv' || force === 'documentary' || (!isMovie && /集|季|电视剧|连载/.test(sub));
  const tmdbType: 'movie' | 'tv' = isSeries ? 'tv' : 'movie';
  const t = await lookup(env, slide.title, tmdbType);
  // 图片只用 TMDB 的：爱壹帆的图带水印。
  const clean = (url?: string) => (url && !url.includes('iyf.tv') ? url : PLACEHOLDER);
  const types = force === 'documentary'
    ? EXACT[slide.title]?.types ?? ['纪录片', '自然', '探索']
    : [
        '热门',
        ...(['剧情', '动画', '喜剧', '动作'] as const).filter((g) => sub.includes(g)),
        ...(/悬疑|警/.test(sub) ? ['悬疑'] : []),
        isSeries ? '连续剧' : '电影',
      ];
  return {
    id: `iyf_hero_${force === 'documentary' ? 'doc' : tmdbType}_${index + 1}`,
    ...(t ? { tmdbId: t.tmdbId } : {}),
    title: EXACT[slide.title]?.title ?? slide.title,
    rate: t?.rate ?? '',
    cover: clean(t?.poster),
    backdrop: clean(t?.backdrop),
    description: t?.overview || (sub ? `《${slide.title}》${sub}` : `《${slide.title}》`),
    year: t?.year ?? '',
    types: [...new Set(types)],
    episodes_info: sub || undefined,
    type: tmdbType,
    is_new: true,
    playable: true,
  };
}

export async function syncHero(env: Env): Promise<string[]> {
  const report: string[] = [];
  for (const ch of CHANNELS) {
    try {
      const [slides, trending] = await Promise.all([ch.slides(), hotTop(ch.cid, ch.trending).catch(() => [])]);
      const picked = [...slides];
      if (ch.force === 'documentary') {
        for (const title of DOCUMENTARY_FILL) {
          if (picked.length >= 8) break;
          if (!picked.some((s) => s.title === title)) picked.push({ title, subTitle: '纪录片' });
        }
      }
      const hero = [];
      for (const [i, s] of picked.slice(0, 8).entries()) hero.push(await heroItem(env, s, i, ch.force));

      const row = await env.DB.prepare('SELECT value FROM documents WHERE key = ?').bind(`home:${ch.key}`).first<{ value: string }>();
      if (!row) {
        report.push(`${ch.key}：没有 home:${ch.key} 文档，跳过`);
        continue;
      }
      const doc = JSON.parse(row.value) as Record<string, unknown>;
      if (hero.length) doc.hero = hero;
      if (trending.length) doc.trendingNav = trending;
      await env.DB.prepare("UPDATE documents SET value = ?, source = 'ingest:iyf-hero', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE key = ?")
        .bind(JSON.stringify(doc), `home:${ch.key}`)
        .run();
      report.push(`${ch.key}：轮播 ${hero.length}，热播标签 ${trending.length}`);
    } catch (err) {
      report.push(`${ch.key}：失败，保留上次结果（${err instanceof Error ? err.message : err}）`);
    }
  }
  return report;
}
