/**
 * 采集站（MacCMS 接口）最近入库的作品。两个站的分类编号不同，各用各的：
 * 旧脚本拿光速的编号去查极速，结果纪录片里混进恐怖片、综艺里混进预告片。
 */
export type ChannelKey = 'all' | 'movie' | 'tv' | 'anime' | 'variety' | 'documentary';
export type Kind = 'movie' | 'tv' | 'anime' | 'variety' | 'documentary';

interface Source {
  name: string;
  base: string;
  types: Record<ChannelKey, Array<[number, Kind]>>;
}

const SOURCES: Source[] = [
  {
    name: 'guangsu',
    base: 'https://api.guangsuapi.com/api.php/provide/vod',
    // 13 大陆剧 14 欧美剧 15 港澳剧 / 6 动作 7 喜剧 9 科幻 / 41-43 中日欧美动漫 / 37 大陆综艺 39 港台综艺 / 24 纪录片
    types: {
      all: [[13, 'tv'], [6, 'movie'], [41, 'anime']],
      movie: [[6, 'movie'], [7, 'movie'], [9, 'movie']],
      tv: [[13, 'tv'], [14, 'tv'], [15, 'tv']],
      anime: [[41, 'anime'], [42, 'anime'], [43, 'anime']],
      variety: [[37, 'variety'], [39, 'variety']],
      documentary: [[24, 'documentary']],
    },
  },
  {
    name: 'jisu',
    base: 'https://jszyapi.com/api.php/provide/vod',
    // 20 内地剧 3 欧美剧 4 香港剧 / 9 动作 11 喜剧 12 科幻 / 24-26 中日欧美动漫 / 30 大陆综艺 32 港台综艺 / 16 纪录片
    types: {
      all: [[20, 'tv'], [9, 'movie'], [24, 'anime']],
      movie: [[9, 'movie'], [11, 'movie'], [12, 'movie']],
      tv: [[20, 'tv'], [3, 'tv'], [4, 'tv']],
      anime: [[24, 'anime'], [25, 'anime'], [26, 'anime']],
      variety: [[30, 'variety'], [32, 'variety']],
      documentary: [[16, 'documentary']],
    },
  },
];

export interface Vod {
  source: string;
  title: string;
  year?: number;
  remarks: string;
  cover: string;
  time: string;       // 采集站入库时间（北京时间，形如 2026-10-08 12:00:00）
  classes: string[];
  kind: Kind;
}

interface RawVod {
  vod_name?: string;
  vod_year?: string;
  vod_remarks?: string;
  vod_pic?: string;
  vod_time?: string;
  vod_class?: string;
}

/** 某频道在两个采集站各分类第一页（每页 20 部）的作品，按入库时间从新到旧。 */
export async function recentVods(channel: ChannelKey): Promise<Vod[]> {
  const jobs = SOURCES.flatMap((src) => src.types[channel].map(([t, kind]) => ({ src, t, kind })));
  const pages = await Promise.all(
    jobs.map(async ({ src, t, kind }) => {
      const res = await fetch(`${src.base}?ac=detail&t=${t}&pg=1&pagesize=20`, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(8000) }).catch(() => null);
      if (!res?.ok) return [];
      const data = (await res.json().catch(() => null)) as { list?: RawVod[] } | null;
      return (data?.list ?? [])
        .filter((v) => v.vod_name?.trim())
        .map<Vod>((v) => ({
          source: src.name,
          title: v.vod_name!.trim(),
          year: Number(v.vod_year) || undefined,
          remarks: (v.vod_remarks ?? '').trim(),
          cover: v.vod_pic ?? '',
          time: v.vod_time ?? '',
          classes: (v.vod_class ?? '').split(/[,，/]/).map((c) => c.trim()).filter(Boolean),
          kind,
        }));
    }),
  );
  return pages.flat().sort((a, b) => b.time.localeCompare(a.time));
}
