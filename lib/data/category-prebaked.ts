/**
 * 全频道大厅首屏即时秒开预烘焙数据集 (Pre-baked Category Hub Dataset for 0ms Page Load)
 * 采用 100% 官方 TMDB CDN 高清海报，全球直连加载，实现零等待上屏。
 */

export interface PrebakedCategoryItem {
  id: string;
  title: string;
  rate: string;
  cover: string;
  year?: string;
  types?: string[];
  is_new?: boolean;
  remarks?: string;
  play_url?: string;
}

export const PREBAKED_CATEGORY_ITEMS: Record<string, PrebakedCategoryItem[]> = {
  // ── 电影大厅精选 ──────────────────────────────────────────────
  movie: [
    {
      id: 'pb_cat_m1',
      title: '抓娃娃',
      rate: '7.3',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      year: '2024',
      types: ['喜剧']
    },
    {
      id: 'pb_cat_m2',
      title: '死侍与金刚狼',
      rate: '7.1',
      cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
      year: '2024',
      types: ['动作', '科幻', '喜剧']
    },
    {
      id: 'pb_cat_m3',
      title: '异形：夺命舰',
      rate: '7.4',
      cover: 'https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg',
      year: '2024',
      types: ['科幻', '恐怖']
    },
    {
      id: 'pb_cat_m4',
      title: '奥本海默',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2023',
      types: ['剧情', '传记', '历史']
    },
    {
      id: 'pb_cat_m5',
      title: '沙丘2',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
      year: '2024',
      types: ['科幻', '动作', '冒险']
    },
    {
      id: 'pb_cat_m6',
      title: '流浪地球2',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg',
      year: '2023',
      types: ['科幻', '冒险']
    },
    {
      id: 'pb_cat_m7',
      title: '周处除三害',
      rate: '8.1',
      cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      year: '2024',
      types: ['犯罪', '动作']
    },
    {
      id: 'pb_cat_m8',
      title: '盗梦空间',
      rate: '9.4',
      cover: 'https://image.tmdb.org/t/p/w500/89W962aAnPS3N3BdKgy2BvUhnCh.jpg',
      year: '2010',
      types: ['科幻', '悬疑', '冒险']
    },
    {
      id: 'pb_cat_m9',
      title: '星际穿越',
      rate: '9.4',
      cover: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      year: '2014',
      types: ['科幻', '剧情']
    },
    {
      id: 'pb_cat_m10',
      title: '九龙城寨之围城',
      rate: '7.2',
      cover: 'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg',
      year: '2024',
      types: ['动作', '犯罪']
    }
  ],

  // ── 电视剧大厅精选 ──────────────────────────────────────────
  tv: [
    {
      id: 'pb_cat_t1',
      title: '繁花',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/rV1owsdKtXytJ5eFMOOVTze3mrk.jpg',
      year: '2023',
      types: ['剧情', '爱情']
    },
    {
      id: 'pb_cat_t2',
      title: '庆余年 第二季',
      rate: '7.3',
      cover: 'https://image.tmdb.org/t/p/w500/wHJvPo9CLpXwX1ncDg6uD0QJIZo.jpg',
      year: '2024',
      types: ['古装', '权谋', '喜剧']
    },
    {
      id: 'pb_cat_t3',
      title: '三体',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/q2sNliRi4j0ncXKUO1x0MldR20A.jpg',
      year: '2023',
      types: ['科幻', '悬疑']
    },
    {
      id: 'pb_cat_t4',
      title: '狂飙',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/6F2UcY1p2YCz3xgLz6NfDh81QC3.jpg',
      year: '2023',
      types: ['剧情', '犯罪']
    },
    {
      id: 'pb_cat_t5',
      title: '漫长的季节',
      rate: '9.4',
      cover: 'https://image.tmdb.org/t/p/w500/xErvw04IuhNx5OyESipIGbiDvdX.jpg',
      year: '2023',
      types: ['生活', '悬疑', '犯罪']
    },
    {
      id: 'pb_cat_t6',
      title: '唐朝诡事录之西行',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/mXb1lfYoh3IYbiCRRH8C5rDZ9XQ.jpg',
      year: '2024',
      types: ['古装', '悬疑', '志怪']
    },
    {
      id: 'pb_cat_t7',
      title: '权力的游戏',
      rate: '9.3',
      cover: 'https://image.tmdb.org/t/p/w500/1XS1oqL89opfnbLl8WnZY1O1uJx.jpg',
      year: '2011',
      types: ['奇幻', '剧情']
    },
    {
      id: 'pb_cat_t8',
      title: '绝命毒师',
      rate: '9.6',
      cover: 'https://image.tmdb.org/t/p/w500/ztkUQFLlC19CCMYHW9o1zWhJRNq.jpg',
      year: '2008',
      types: ['犯罪', '剧情']
    }
  ],

  // ── 国创动漫精选（已合并至 anime 大厅）──────────────────────────────────────────
  guoman: [
    {
      id: 'pb_cat_g1',
      title: '凡人修仙传',
      rate: '9.1',
      cover: 'https://image.tmdb.org/t/p/w500/u1VRjvvCIVwb1MUhoxSAUimhoKZ.jpg',
      year: '2024',
      types: ['国漫', '玄幻', '仙侠']
    },
    {
      id: 'pb_cat_g2',
      title: '完美世界',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/mNJPCv2dLADVVSgLlzsMJoXdTmb.jpg',
      year: '2024',
      types: ['玄幻', '动作']
    },
    {
      id: 'pb_cat_g3',
      title: '遮天',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/z9JNGlJ8eGy6S6SOlBhpmxjjXGT.jpg',
      year: '2024',
      types: ['玄幻', '仙侠']
    },
    {
      id: 'pb_cat_g4',
      title: '斗破苍穹 年番',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/oyoahIcdamTXwjIaL3CqZ1v5CLl.jpg',
      year: '2024',
      types: ['玄幻', '热血']
    },
    {
      id: 'pb_cat_g5',
      title: '吞噬星空',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg',
      year: '2024',
      types: ['科幻', '玄幻']
    },
    {
      id: 'pb_cat_g6',
      title: '仙逆',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2024',
      types: ['仙侠', '杀伐果断']
    }
  ],

  // ── 动漫新番大厅精选 ──────────────────────────────────────────
  anime: [
    {
      id: 'pb_cat_a1',
      title: '葬送的芙莉莲',
      rate: '9.5',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2023',
      types: ['奇幻', '治愈', '冒险']
    },
    {
      id: 'pb_cat_a2',
      title: '鬼灭之刃 柱训练篇',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '2024',
      types: ['热血', '奇幻', '战斗']
    },
    {
      id: 'pb_cat_a3',
      title: '咒术回战 第二季',
      rate: '9.2',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2023',
      types: ['热血', '战斗', '超自然']
    },
    {
      id: 'pb_cat_a4',
      title: '进击的巨人 最终季',
      rate: '9.6',
      cover: 'https://image.tmdb.org/t/p/w500/5gaf9yFJHJTkg6KtLc7enqBY6UK.jpg',
      year: '2023',
      types: ['热血', '动作', '末日']
    },
    {
      id: 'pb_cat_a5',
      title: '怪兽8号',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2024',
      types: ['热血', '怪兽']
    },
    {
      id: 'pb_cat_a6',
      title: '迷宫饭',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2024',
      types: ['美食', '奇幻']
    },
    {
      id: 'pb_cat_a7',
      title: '药屋少女的呢喃',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2023',
      types: ['悬疑', '古风']
    },
    {
      id: 'pb_cat_a8',
      title: '你的名字。',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2016',
      types: ['动画', '爱情']
    }
  ],

  // ── 热门综艺大厅精选 ──────────────────────────────────────────
  variety: [
    {
      id: 'pb_cat_v1',
      title: '歌手2024',
      rate: '8.0',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2024',
      types: ['音乐', '真人秀']
    },
    {
      id: 'pb_cat_v2',
      title: '种地吧 第二季',
      rate: '9.0',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2024',
      types: ['真人秀', '生活']
    },
    {
      id: 'pb_cat_v3',
      title: '奔跑吧 第十二季',
      rate: '7.2',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2024',
      types: ['游戏', '竞技']
    },
    {
      id: 'pb_cat_v4',
      title: '极限挑战 第十季',
      rate: '7.1',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2024',
      types: ['竞技', '真人秀']
    },
    {
      id: 'pb_cat_v5',
      title: '脱口秀和Ta的朋友们',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2024',
      types: ['脱口秀', '喜剧']
    },
    {
      id: 'pb_cat_v6',
      title: '大侦探 第九季',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2024',
      types: ['推理', '悬疑']
    },
    {
      id: 'pb_cat_v7',
      title: '披荆斩棘 第四季',
      rate: '7.8',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2024',
      types: ['音乐', '舞台']
    },
    {
      id: 'pb_cat_v8',
      title: '花儿与少年·丝路季',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2023',
      types: ['旅行', '治愈']
    }
  ],

  // ── 精品短剧大厅精选 ──────────────────────────────────────────
  short: [
    {
      id: 'pb_cat_s1',
      title: '秘方遭老板觊觎，我带乡邻逆风翻盘',
      rate: '9.2',
      cover: 'https://img.guangsuimage.com/cover/3f18478daa064f8a9b67f86302dc5e28.jpg',
      year: '2026',
      types: ['反转爽剧', '逆袭', '战神'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/bDk8y3qa/index.m3u8'
    },
    {
      id: 'pb_cat_s2',
      title: '穿书70，竹马他真香了',
      rate: '9.0',
      cover: 'https://img.guangsuimage.com/cover/a9cbc68f9df45c53d7cd75191626bcdf.jpg',
      year: '2026',
      types: ['年代', '甜宠', '穿越'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/erk9Ojpa/index.m3u8'
    },
    {
      id: 'pb_cat_s3',
      title: '代号冥王',
      rate: '9.3',
      cover: 'https://img.guangsuimage.com/cover/f22d9c3b0d6a54671018cde797fbfcd2.jpg',
      year: '2026',
      types: ['战神', '逆袭', '热血'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/ejR8lZye/index.m3u8'
    },
    {
      id: 'pb_cat_s4',
      title: '老实人家的最强话事人',
      rate: '8.9',
      cover: 'https://img.guangsuimage.com/cover/27ec94dfdefd3f3f9665ef0e2d531d49.jpg',
      year: '2026',
      types: ['现代都市', '反转爽剧'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/erk9x04a/index.m3u8'
    },
    {
      id: 'pb_cat_s5',
      title: '你资助的穷小子，十年后为你撑腰',
      rate: '9.1',
      cover: 'https://img.guangsuimage.com/cover/f38df137248cb76aa4ba3fdfb84f3e98.jpg',
      year: '2026',
      types: ['都市', '逆袭', '豪门'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/dyPXv8nb/index.m3u8'
    },
    {
      id: 'pb_cat_s6',
      title: '弃少不好惹，我乃魔道至尊',
      rate: '9.4',
      cover: 'https://img.guangsuimage.com/cover/77454ee9aa2274886c53d66768e201d3.jpg',
      year: '2026',
      types: ['战神', '反转爽剧', '修仙'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/elY7g7la/index.m3u8'
    },
    {
      id: 'pb_cat_s7',
      title: '司先生别藏了',
      rate: '8.8',
      cover: 'https://img.guangsuimage.com/cover/b8feed246945057fc799573b899a9f45.jpg',
      year: '2026',
      types: ['言情总裁', '甜宠', '闪婚'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/aAD1lRpe/index.m3u8'
    },
    {
      id: 'pb_cat_s8',
      title: '夜港绯尘',
      rate: '8.7',
      cover: 'https://img.guangsuimage.com/cover/f63931a910b94513f759377cd4dcbc70.jpg',
      year: '2026',
      types: ['言情总裁', '都市', '虐恋'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/b2kWNWJd/index.m3u8'
    },
    {
      id: 'pb_cat_s9',
      title: '京夜诱温，你管我闺蜜叫姐',
      rate: '8.9',
      cover: 'https://img.guangsuimage.com/cover/4907d9f46494794c4ecc024e52a4b4b2.jpg',
      year: '2026',
      types: ['言情总裁', '甜宠'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/erk9o9wa/index.m3u8'
    },
    {
      id: 'pb_cat_s10',
      title: '如诗说一千里共明月',
      rate: '8.8',
      cover: 'https://img.guangsuimage.com/cover/0726e051d18e9ae347c103a30035f9a1.jpg',
      year: '2026',
      types: ['古装仙侠', '奇幻'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/eVONOpza/index.m3u8'
    },
    {
      id: 'pb_cat_s11',
      title: '大小姐回京后整顿侯府满门',
      rate: '9.2',
      cover: 'https://img.guangsuimage.com/cover/081a65f7d7d18dd2ea14a63d7987db82.jpg',
      year: '2026',
      types: ['古装仙侠', '权谋', '重生'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/epYzwOya/index.m3u8'
    },
    {
      id: 'pb_cat_s12',
      title: '愿我如星卿如月',
      rate: '8.7',
      cover: 'https://img.guangsuimage.com/cover/5077e7522a87b9fc9c829a061c1fb1d9.jpg',
      year: '2026',
      types: ['古装仙侠', '言情'],
      remarks: '全集完结',
      play_url: '全集完结$https://v.gsuus.com/play/aADmDN3e/index.m3u8'
    }
  ]
};

/**
 * 智能获取各频道的即时兜底货架数据
 */
export function getPrebakedCategoryShelves(
  doubanType: string,
  activeNav: string,
  shelves: Array<{ tag: string }>
): Record<string, any[]> {
  const channelKey = activeNav || doubanType;
  const list = PREBAKED_CATEGORY_ITEMS[channelKey] || PREBAKED_CATEGORY_ITEMS[doubanType] || PREBAKED_CATEGORY_ITEMS.movie;

  const result: Record<string, any[]> = {};
  if (!shelves || shelves.length === 0) return result;

  // 将预烘焙数据分配到前几个货架中，保证首屏 100% 满屏渲染
  shelves.forEach((shelf, idx) => {
    // 错位切片展示不同影片
    const start = (idx * 3) % list.length;
    const rotated = [...list.slice(start), ...list.slice(0, start)];
    result[shelf.tag] = rotated;
  });

  return result;
}
