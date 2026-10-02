export interface YearInfo {
  slug: string;
  name: string;
  desc: string;
}

export const YEAR_MAP: Record<string, YearInfo> = {
  '2026': { slug: '2026', name: '2026年', desc: '2026年最新上映院线大片与全球热门连载剧集' },
  '2025': { slug: '2025', name: '2025年', desc: '2025年度热门爆款电影、高口碑热播影视神作' },
  '2024': { slug: '2024', name: '2024年', desc: '2024年高分电影与年度黑马剧集精选合集' },
  '2023': { slug: '2023', name: '2023年', desc: '2023年精彩影视回顾与口碑佳作档案' },
  '2022': { slug: '2022', name: '2022年', desc: '2022年高分必看影视与经典连载大戏' },
  '2021': { slug: '2021', name: '2021年', desc: '2021年全球热门院线电影与现象级热播剧' },
  '2020': { slug: '2020', name: '2020年', desc: '2020年经典电影与高口碑代表作集锦' },
  '2019': { slug: '2019', name: '2019年', desc: '2019年神级高分巨制与影迷必看佳作' },
  '1990s': { slug: '1990s', name: '90年代', desc: '90年代世界电影黄金期巅峰神作与复古情怀巨献' },
  '1980s': { slug: '1980s', name: '80年代', desc: '80年代港台与世界经典老电影怀旧档案' },
};

export function getYearBySlug(slug: string): YearInfo | null {
  if (!slug) return null;
  const clean = slug.trim().toLowerCase();
  if (YEAR_MAP[clean]) return YEAR_MAP[clean];

  // 纯 4 位数字年份（如 2018, 2015, 2008）
  if (/^\d{4}$/.test(clean)) {
    return {
      slug: clean,
      name: `${clean}年`,
      desc: `${clean}年上映与播出的精选优质影视作品推荐`,
    };
  }

  return null;
}
