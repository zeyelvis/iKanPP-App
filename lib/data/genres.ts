export interface GenreInfo {
  slug: string;
  name: string;
  desc: string;
}

export const GENRE_MAP: Record<string, GenreInfo> = {
  action: { slug: 'action', name: '动作', desc: '惊险刺激的动作大片与热血格斗电影' },
  comedy: { slug: 'comedy', name: '喜剧', desc: '轻松幽默的爆笑喜剧电影与欢乐剧集' },
  drama: { slug: 'drama', name: '剧情', desc: '深度动人的高分剧情神作与温情故事' },
  scifi: { slug: 'scifi', name: '科幻', desc: '震撼人心的硬核科幻片与未来宇宙幻想' },
  romance: { slug: 'romance', name: '爱情', desc: '浪漫唯美的现代言情与经典爱情影视' },
  thriller: { slug: 'thriller', name: '悬疑', desc: '烧脑反转的悬疑推理破案影视' },
  animation: { slug: 'animation', name: '动漫', desc: '高人气国创动画与热血日本新番' },
  crime: { slug: 'crime', name: '犯罪', desc: '警匪对决与犯罪心理高智商较量' },
  fantasy: { slug: 'fantasy', name: '奇幻', desc: '瑰丽壮阔的东方修真与西方奇幻冒险' },
  adventure: { slug: 'adventure', name: '冒险', desc: '惊心动魄的探险求生与寻宝奇遇' },
  costume: { slug: 'costume', name: '古装', desc: '风云激荡的古代历史与仙侠传奇古装大戏' },
  wuxia: { slug: 'wuxia', name: '武侠', desc: '刀光剑影的传统江湖与快意恩仇武侠巨作' },
  war: { slug: 'war', name: '战争', desc: '铁血铸就的真实二战与现代战争史诗' },
  documentary: { slug: 'documentary', name: '纪录片', desc: '探索自然与人文历史的高清优质纪录片' },
  short: { slug: 'short', name: '短剧', desc: '全网爆款微短剧与快节奏爽剧合集' },
  variety: { slug: 'variety', name: '综艺', desc: '爆笑真人秀、音乐竞演与脱口秀精选' },
};

export function getGenreBySlug(slug: string): GenreInfo | null {
  if (!slug) return null;
  const lower = slug.toLowerCase();
  if (GENRE_MAP[lower]) return GENRE_MAP[lower];

  // 支持直接按中文名称查询
  const entry = Object.values(GENRE_MAP).find(g => g.name === slug);
  if (entry) return entry;

  return {
    slug: lower,
    name: decodeURIComponent(slug),
    desc: `精彩的${decodeURIComponent(slug)}题材影视作品推荐`,
  };
}
