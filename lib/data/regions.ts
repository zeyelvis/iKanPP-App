export interface RegionInfo {
  slug: string;
  name: string;
  desc: string;
  aliases: string[];
}

export const REGION_MAP: Record<string, RegionInfo> = {
  mainland: {
    slug: 'mainland',
    name: '中国大陆',
    desc: '中国大陆华语高口碑影视大片与连载热剧',
    aliases: ['大陆', '国产', '中国', '内地'],
  },
  hk: {
    slug: 'hk',
    name: '中国香港',
    desc: '香港经典警匪枪战、动作传奇与港风怀旧电影',
    aliases: ['香港', '港剧', '港片'],
  },
  tw: {
    slug: 'tw',
    name: '中国台湾',
    desc: '台湾高分文艺爱情、悬疑推理与现实题材剧集',
    aliases: ['台湾', '台剧'],
  },
  us: {
    slug: 'us',
    name: '欧美',
    desc: '好莱坞震撼视效大片与欧美高分必看经典美剧',
    aliases: ['美国', '欧美', '美剧'],
  },
  kr: {
    slug: 'kr',
    name: '韩国',
    desc: '韩国年度高分爆款电视剧与犯罪悬疑剧情电影',
    aliases: ['韩国', '韩剧'],
  },
  jp: {
    slug: 'jp',
    name: '日本',
    desc: '日本治愈系温情佳作、推理电影与热血经典新番',
    aliases: ['日本', '日剧'],
  },
  th: {
    slug: 'th',
    name: '泰国',
    desc: '泰国热门电视剧、青春校园与惊悚反转剧情大片',
    aliases: ['泰国', '泰剧'],
  },
  gb: {
    slug: 'gb',
    name: '英国',
    desc: '英国BBC高品质历史剧、英伦探案与经典英剧',
    aliases: ['英国', '英剧'],
  },
};

export function getRegionBySlug(slug: string): RegionInfo | null {
  if (!slug) return null;
  const clean = decodeURIComponent(slug).trim().toLowerCase();
  if (REGION_MAP[clean]) return REGION_MAP[clean];

  // 按中文名或别名查询
  for (const info of Object.values(REGION_MAP)) {
    if (info.name === clean || info.aliases.some(a => a.toLowerCase() === clean)) {
      return info;
    }
  }

  return {
    slug: clean,
    name: decodeURIComponent(slug),
    desc: `${decodeURIComponent(slug)}地区优质影视作品合集`,
    aliases: [],
  };
}
