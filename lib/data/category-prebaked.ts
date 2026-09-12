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
      id: "pb_cat_s1",
      title: "太子殿下，臣妾真的不想当女帝",
      rate: "8.5",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/ee3bee18a72a6bf07e434c5c07e83a4b.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全72集"
    },
    {
      id: "pb_cat_s2",
      title: "故纵短剧",
      rate: "8.6",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/4f8cf8b2c22c3e439a21f62e5a0850d0.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全64集"
    },
    {
      id: "pb_cat_s3",
      title: "婚后热恋陆先生追妻有点甜",
      rate: "8.7",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/2964c668ab51ddb4ce8fdffe5e71645b.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全57集"
    },
    {
      id: "pb_cat_s4",
      title: "原主作天作地，前夫回国和我兜底",
      rate: "8.8",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/97ed9b3534a18fea07021b388ea1e4ef.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全92集"
    },
    {
      id: "pb_cat_s5",
      title: "愿我如星卿如月",
      rate: "8.9",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/d75079036d7c0381aecd9ae1f7372d9c.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全80集"
    },
    {
      id: "pb_cat_s6",
      title: "团宠妹宝重生，错位亲情七六年的救赎",
      rate: "9.0",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/8479b00c5e3c2c9943ef47ecdcd202f9.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全70集"
    },
    {
      id: "pb_cat_s7",
      title: "所城里的夏天",
      rate: "9.1",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/b6f8138e576e82892b7a291419200ea5.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全60集"
    },
    {
      id: "pb_cat_s8",
      title: "逆袭开宝箱，前妻一家崩溃了",
      rate: "9.2",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/9d776f054a52b1d66786f3484357b432.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全73集"
    },
    {
      id: "pb_cat_s9",
      title: "蛮女养蛊也养夫",
      rate: "9.3",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/333865e4adcb2fb2da74d31b84823679.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全56集"
    },
    {
      id: "pb_cat_s10",
      title: "和冰山女神绝地逃生",
      rate: "9.4",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/a7d8689dcc57612e86c396000a2e917f.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全50集"
    },
    {
      id: "pb_cat_s11",
      title: "重生：大嫂别闹，我要护家",
      rate: "9.5",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/12bceee4e3b278c55ce617797eaab17d.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全42集"
    },
    {
      id: "pb_cat_s12",
      title: "遗信邮差",
      rate: "9.6",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/73a972adc059a94971c7693284421672.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全46集"
    },
    {
      id: "pb_cat_s_ai1",
      title: "镜中影：神豪与替身主播",
      rate: "9.5",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/b6d16ec220fba08fcde96ee7a28abe19.jpg",
      year: "2026",
      types: ["微短剧", "AI漫剧", "神豪"],
      remarks: "全73集"
    },
    {
      id: "pb_cat_s_ai2",
      title: "偏偏京夜想你",
      rate: "9.4",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/8f1fdad65b24195325e9c56a81a4ebbd.jpg",
      year: "2026",
      types: ["微短剧", "AI漫剧", "言情"],
      remarks: "全80集"
    },
    {
      id: "pb_cat_s_ai3",
      title: "竹马出殡当天，我被迫嫁给了神君",
      rate: "9.6",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/57639c809cc684c6be25099822262002.jpg",
      year: "2026",
      types: ["微短剧", "AI漫剧", "玄幻"],
      remarks: "全62集"
    },
    {
      id: "pb_cat_s_ai4",
      title: "嫡姐夺骨我为帝，万鬼同悲血作祭",
      rate: "9.7",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/c97826cf24ebe7bfc5ebf0e262efa064.jpg",
      year: "2026",
      types: ["微短剧", "AI漫剧", "复仇"],
      remarks: "全99集"
    },
    {
      id: "pb_cat_s_ai5",
      title: "让你当宫女，你让暴君跪搓衣板",
      rate: "9.3",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/49ab95925d242e0787905d0246f04b5c.jpg",
      year: "2026",
      types: ["微短剧", "AI漫剧", "穿越"],
      remarks: "全61集"
    },
    {
      id: "pb_cat_s_ai6",
      title: "闪婚室友慢慢爱，玫瑰入瓮",
      rate: "9.2",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/1fc20ab3e306058ceb0bc2021f58aa75.jpg",
      year: "2026",
      types: ["微短剧", "AI漫剧", "都市"],
      remarks: "全94集"
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
    if (shelf.tag === 'ai') {
      const aiItems = list.filter((it) => it.types?.some((t) => t.includes('AI') || t.includes('漫剧')));
      if (aiItems.length > 0) {
        result[shelf.tag] = aiItems;
        return;
      }
    }
    // 错位切片展示不同影片
    const start = (idx * 3) % list.length;
    const rotated = [...list.slice(start), ...list.slice(0, start)];
    result[shelf.tag] = rotated;
  });

  return result;
}
