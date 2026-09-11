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
      remarks: "全72集",
      play_url: "第01集$https://play.modujx17.com/20260911/F1Voadxe/index.m3u8#第02集$https://play.modujx17.com/20260911/nRcUJeRR/index.m3u8#第03集$https://play.modujx17.com/20260911/4NsC15z9/index.m3u8#第04集$https://play.modujx17.com/20260911/RhCqOvD0/index.m3u8#第05集$https://play.modujx17.com/20260911/XztWFFGd/index.m3u8#第06集$https://play.modujx17.com/20260911/VFqlRLRv/index.m3u8#第07集$https://play.modujx17.com/20260911/F6alOI3J/index.m3u8#第08集$https://play.modujx17.com/20260911/bukAryWm/index.m3u8#第09集$https://play.modujx17.com/20260911/zDfpgSws/index.m3u8#第10集$https://play.modujx17.com/20260911/p31IZuE2/index.m3u8#第11集$https://play.modujx17.com/20260911/yrrKEnMG/index.m3u8#第12集$https://play.modujx17.com/20260911/0hnNPYBx/index.m3u8#第13集$https://play.modujx17.com/20260911/MQv0lvYW/index.m3u8#第14集$https://play.modujx17.com/20260911/1YMyhnIu/index.m3u8#第15集$https://play.modujx17.com/20260911/YqghlEc3/index.m3u8#第16集$https://play.modujx17.com/20260911/cr1CrLSZ/index.m3u8#第17集$https://play.modujx17.com/20260911/6nKAJqns/index.m3u8#第18集$https://play.modujx17.com/20260911/TDxerzN9/index.m3u8#第19集$https://play.modujx17.com/20260911/B8DeCM27/index.m3u8#第20集$https://play.modujx17.com/20260911/N2N3i0mE/index.m3u8#第21集$https://play.modujx17.com/20260911/VB6j3wGs/index.m3u8#第22集$https://play.modujx17.com/20260911/94xEYoka/index.m3u8#第23集$https://play.modujx17.com/20260911/XONTH96W/index.m3u8#第24集$https://play.modujx17.com/20260911/3N6Cmi2f/index.m3u8#第25集$https://play.modujx17.com/20260911/jS62isvd/index.m3u8#第26集$https://play.modujx17.com/20260911/tfk0MlXe/index.m3u8#第27集$https://play.modujx17.com/20260911/Z69449Xp/index.m3u8#第28集$https://play.modujx17.com/20260911/jmMN1eMU/index.m3u8#第29集$https://play.modujx17.com/20260911/JLRqxXyg/index.m3u8#第30集$https://play.modujx17.com/20260911/YKHYC1Ax/index.m3u8#第31集$https://play.modujx17.com/20260911/IiJtpoqt/index.m3u8#第32集$https://play.modujx17.com/20260911/MAl55CaK/index.m3u8#第33集$https://play.modujx17.com/20260911/RyBe6FzZ/index.m3u8#第34集$https://play.modujx17.com/20260911/ZoL4PSFI/index.m3u8#第35集$https://play.modujx17.com/20260911/JAahDtOq/index.m3u8#第36集$https://play.modujx17.com/20260911/1DTvnf8j/index.m3u8#第37集$https://play.modujx17.com/20260911/EXB8fMqE/index.m3u8#第38集$https://play.modujx17.com/20260911/f8pucEOA/index.m3u8#第39集$https://play.modujx17.com/20260911/K6l3lyhx/index.m3u8#第40集$https://play.modujx17.com/20260911/NQPdentl/index.m3u8#第41集$https://play.modujx17.com/20260911/aGvxgNJM/index.m3u8#第42集$https://play.modujx17.com/20260911/q7rSaw6D/index.m3u8#第43集$https://play.modujx17.com/20260911/N2tKhMNn/index.m3u8#第44集$https://play.modujx17.com/20260911/CbSqwLjF/index.m3u8#第45集$https://play.modujx17.com/20260911/rBd9KAbv/index.m3u8#第46集$https://play.modujx17.com/20260911/Fri77weO/index.m3u8#第47集$https://play.modujx17.com/20260911/w1NSoHzP/index.m3u8#第48集$https://play.modujx17.com/20260911/i4tCRCE3/index.m3u8#第49集$https://play.modujx17.com/20260911/AJkp0m1d/index.m3u8#第50集$https://play.modujx17.com/20260911/UPmodBih/index.m3u8#第51集$https://play.modujx17.com/20260911/tERxPxZP/index.m3u8#第52集$https://play.modujx17.com/20260911/NJY51mH7/index.m3u8#第53集$https://play.modujx17.com/20260911/m3EgWTOM/index.m3u8#第54集$https://play.modujx17.com/20260911/OTtSO5ci/index.m3u8#第55集$https://play.modujx17.com/20260911/VHuJcHey/index.m3u8#第56集$https://play.modujx17.com/20260911/d3vEa3Iw/index.m3u8#第57集$https://play.modujx17.com/20260911/n7yYA1O9/index.m3u8#第58集$https://play.modujx17.com/20260911/b2B3yRei/index.m3u8#第59集$https://play.modujx17.com/20260911/GlbgwZ8a/index.m3u8#第60集$https://play.modujx17.com/20260911/U9aqHMz0/index.m3u8#第61集$https://play.modujx17.com/20260911/vYKw0ROz/index.m3u8#第62集$https://play.modujx17.com/20260911/FVV9XLIf/index.m3u8#第63集$https://play.modujx17.com/20260911/H1WBHOBd/index.m3u8#第64集$https://play.modujx17.com/20260911/6CHUqps5/index.m3u8#第65集$https://play.modujx17.com/20260911/GVMrBKKx/index.m3u8#第66集$https://play.modujx17.com/20260911/lK8rGiaY/index.m3u8#第67集$https://play.modujx17.com/20260911/gVI9vS0a/index.m3u8#第68集$https://play.modujx17.com/20260911/G2fKxmLh/index.m3u8#第69集$https://play.modujx17.com/20260911/GtlUlyC2/index.m3u8#第70集$https://play.modujx17.com/20260911/a93ldjRg/index.m3u8#第71集$https://play.modujx17.com/20260911/iTKDqilE/index.m3u8#第72集$https://play.modujx17.com/20260911/k9v5MmzB/index.m3u8"
    },
    {
      id: "pb_cat_s2",
      title: "故纵短剧",
      rate: "8.6",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/4f8cf8b2c22c3e439a21f62e5a0850d0.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全64集",
      play_url: "第01集$https://play.modujx17.com/20260911/ebLGGpaJ/index.m3u8#第02集$https://play.modujx17.com/20260911/WywYCFd7/index.m3u8#第03集$https://play.modujx17.com/20260911/Tl95OG6A/index.m3u8#第04集$https://play.modujx17.com/20260911/L3ejZrDq/index.m3u8#第05集$https://play.modujx17.com/20260911/Lb9z3AqZ/index.m3u8#第06集$https://play.modujx17.com/20260911/zA7seJPw/index.m3u8#第07集$https://play.modujx17.com/20260911/m6Akx3EG/index.m3u8#第08集$https://play.modujx17.com/20260911/3VoGGTFF/index.m3u8#第09集$https://play.modujx17.com/20260911/O99pjLKn/index.m3u8#第10集$https://play.modujx17.com/20260911/eBGf8B1F/index.m3u8#第11集$https://play.modujx17.com/20260911/fwytMkOY/index.m3u8#第12集$https://play.modujx17.com/20260911/ZmMLQ211/index.m3u8#第13集$https://play.modujx17.com/20260911/uKSx8ITQ/index.m3u8#第14集$https://play.modujx17.com/20260911/gnu0HW6Z/index.m3u8#第15集$https://play.modujx17.com/20260911/DXIsWMWX/index.m3u8#第16集$https://play.modujx17.com/20260911/OQy9pipx/index.m3u8#第17集$https://play.modujx17.com/20260911/hBOROUPA/index.m3u8#第18集$https://play.modujx17.com/20260911/KiaHX667/index.m3u8#第19集$https://play.modujx17.com/20260911/YVHCngK8/index.m3u8#第20集$https://play.modujx17.com/20260911/QYtzNDEK/index.m3u8#第21集$https://play.modujx17.com/20260911/Eyrq63Ae/index.m3u8#第22集$https://play.modujx17.com/20260911/4AHdj5Nm/index.m3u8#第23集$https://play.modujx17.com/20260911/fB3ZBkjq/index.m3u8#第24集$https://play.modujx17.com/20260911/rHSOy4Bg/index.m3u8#第25集$https://play.modujx17.com/20260911/cKTgXnI6/index.m3u8#第26集$https://play.modujx17.com/20260911/zW6lvodq/index.m3u8#第27集$https://play.modujx17.com/20260911/mSdoIsAG/index.m3u8#第28集$https://play.modujx17.com/20260911/WCpnclaO/index.m3u8#第29集$https://play.modujx17.com/20260911/YVGJkrdl/index.m3u8#第30集$https://play.modujx17.com/20260911/YLyqQDr9/index.m3u8#第31集$https://play.modujx17.com/20260911/7K9v1gZO/index.m3u8#第32集$https://play.modujx17.com/20260911/HxhC16g3/index.m3u8#第33集$https://play.modujx17.com/20260911/TE5ltNZm/index.m3u8#第34集$https://play.modujx17.com/20260911/o16sguCs/index.m3u8#第35集$https://play.modujx17.com/20260911/K48d2b1L/index.m3u8#第36集$https://play.modujx17.com/20260911/nReOWifg/index.m3u8#第37集$https://play.modujx17.com/20260911/KvmAsH61/index.m3u8#第38集$https://play.modujx17.com/20260911/rjpUUyPD/index.m3u8#第39集$https://play.modujx17.com/20260911/InJk5fcS/index.m3u8#第40集$https://play.modujx17.com/20260911/O7C4s49Z/index.m3u8#第41集$https://play.modujx17.com/20260911/zkC8N52T/index.m3u8#第42集$https://play.modujx17.com/20260911/Zq76NtWW/index.m3u8#第43集$https://play.modujx17.com/20260911/Vkeoq4Go/index.m3u8#第44集$https://play.modujx17.com/20260911/5H9QoMXi/index.m3u8#第45集$https://play.modujx17.com/20260911/ZQ4YuACu/index.m3u8#第46集$https://play.modujx17.com/20260911/oFzX8cNt/index.m3u8#第47集$https://play.modujx17.com/20260911/MIenzWlI/index.m3u8#第48集$https://play.modujx17.com/20260911/YzsRuwc1/index.m3u8#第49集$https://play.modujx17.com/20260911/WC2pMmPF/index.m3u8#第50集$https://play.modujx17.com/20260911/rG3iGYgH/index.m3u8#第51集$https://play.modujx17.com/20260911/keEjRVvf/index.m3u8#第52集$https://play.modujx17.com/20260911/zx3o87bc/index.m3u8#第53集$https://play.modujx17.com/20260911/9J963Naz/index.m3u8#第54集$https://play.modujx17.com/20260911/WJtPe3gD/index.m3u8#第55集$https://play.modujx17.com/20260911/tFIg1Fjb/index.m3u8#第56集$https://play.modujx17.com/20260911/X9i0jCd9/index.m3u8#第57集$https://play.modujx17.com/20260911/5PDikBmq/index.m3u8#第58集$https://play.modujx17.com/20260911/qEwV7JND/index.m3u8#第59集$https://play.modujx17.com/20260911/ImexDmiQ/index.m3u8#第60集$https://play.modujx17.com/20260911/EdHSYr4Q/index.m3u8#第61集$https://play.modujx17.com/20260911/Yyn9WSub/index.m3u8#第62集$https://play.modujx17.com/20260911/I8tLu06T/index.m3u8#第63集$https://play.modujx17.com/20260911/RzRZzbKx/index.m3u8#第64集$https://play.modujx17.com/20260911/yehDiltY/index.m3u8"
    },
    {
      id: "pb_cat_s3",
      title: "婚后热恋陆先生追妻有点甜",
      rate: "8.7",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/2964c668ab51ddb4ce8fdffe5e71645b.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全57集",
      play_url: "第01集$https://play.modujx17.com/20260911/qCOxnuon/index.m3u8#第02集$https://play.modujx17.com/20260911/Te0pF0q2/index.m3u8#第03集$https://play.modujx17.com/20260911/HiH3M1X2/index.m3u8#第04集$https://play.modujx17.com/20260911/tH4Ri33i/index.m3u8#第05集$https://play.modujx17.com/20260911/AGbz45ed/index.m3u8#第06集$https://play.modujx17.com/20260911/h0qJeH2n/index.m3u8#第07集$https://play.modujx17.com/20260911/MFOOMjgJ/index.m3u8#第08集$https://play.modujx17.com/20260911/cXgyTnO3/index.m3u8#第09集$https://play.modujx17.com/20260911/3tTFUAKs/index.m3u8#第10集$https://play.modujx17.com/20260911/dJBYnmqA/index.m3u8#第11集$https://play.modujx17.com/20260911/1hT57Vn2/index.m3u8#第12集$https://play.modujx17.com/20260911/yosq9rUZ/index.m3u8#第13集$https://play.modujx17.com/20260911/pucogfEI/index.m3u8#第14集$https://play.modujx17.com/20260911/4cd1HJhT/index.m3u8#第15集$https://play.modujx17.com/20260911/ZgfdRRbj/index.m3u8#第16集$https://play.modujx17.com/20260911/bGHphFtr/index.m3u8#第17集$https://play.modujx17.com/20260911/UyUcuyG3/index.m3u8#第18集$https://play.modujx17.com/20260911/cFwJb4c9/index.m3u8#第19集$https://play.modujx17.com/20260911/TRqlou7Q/index.m3u8#第20集$https://play.modujx17.com/20260911/Dsvftbrm/index.m3u8#第21集$https://play.modujx17.com/20260911/kuG03uqS/index.m3u8#第22集$https://play.modujx17.com/20260911/FSQGe9eB/index.m3u8#第23集$https://play.modujx17.com/20260911/lo3e0HFg/index.m3u8#第24集$https://play.modujx17.com/20260911/agJRGTUM/index.m3u8#第25集$https://play.modujx17.com/20260911/iWu0kjyR/index.m3u8#第26集$https://play.modujx17.com/20260911/GPTMqwNC/index.m3u8#第27集$https://play.modujx17.com/20260911/Dclm4zKH/index.m3u8#第28集$https://play.modujx17.com/20260911/2s1ecH5g/index.m3u8#第29集$https://play.modujx17.com/20260911/W8ssmHxL/index.m3u8#第30集$https://play.modujx17.com/20260911/X9tEZkaz/index.m3u8#第31集$https://play.modujx17.com/20260911/QtNkhWCf/index.m3u8#第32集$https://play.modujx17.com/20260911/dnyzsteT/index.m3u8#第33集$https://play.modujx17.com/20260911/ryUfhlok/index.m3u8#第34集$https://play.modujx17.com/20260911/bKeOlPW8/index.m3u8#第35集$https://play.modujx17.com/20260911/YNzaGlpX/index.m3u8#第36集$https://play.modujx17.com/20260911/7xgGYmls/index.m3u8#第37集$https://play.modujx17.com/20260911/Y60au6ty/index.m3u8#第38集$https://play.modujx17.com/20260911/0SZuAoTM/index.m3u8#第39集$https://play.modujx17.com/20260911/ArWjXMLK/index.m3u8#第40集$https://play.modujx17.com/20260911/s8Aau40q/index.m3u8#第41集$https://play.modujx17.com/20260911/8CId770n/index.m3u8#第42集$https://play.modujx17.com/20260911/g6afk1kB/index.m3u8#第43集$https://play.modujx17.com/20260911/9SMqnI0Y/index.m3u8#第44集$https://play.modujx17.com/20260911/HRNSuHqF/index.m3u8#第45集$https://play.modujx17.com/20260911/ViFtV4y9/index.m3u8#第46集$https://play.modujx17.com/20260911/9i6ODyQ9/index.m3u8#第47集$https://play.modujx17.com/20260911/ebflSclG/index.m3u8#第48集$https://play.modujx17.com/20260911/Nrd7bXsv/index.m3u8#第49集$https://play.modujx17.com/20260911/s3wWGs6Q/index.m3u8#第50集$https://play.modujx17.com/20260911/cEBGHFmV/index.m3u8#第51集$https://play.modujx17.com/20260911/mVrHmQpW/index.m3u8#第52集$https://play.modujx17.com/20260911/ZUrAOWgO/index.m3u8#第53集$https://play.modujx17.com/20260911/JioMpUe9/index.m3u8#第54集$https://play.modujx17.com/20260911/soPZq0Ng/index.m3u8#第55集$https://play.modujx17.com/20260911/LPrj9OwV/index.m3u8#第56集$https://play.modujx17.com/20260911/txvc9oC4/index.m3u8#第57集$https://play.modujx17.com/20260911/9zqixepR/index.m3u8"
    },
    {
      id: "pb_cat_s4",
      title: "原主作天作地，前夫回国和我兜底",
      rate: "8.8",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/97ed9b3534a18fea07021b388ea1e4ef.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全92集",
      play_url: "第01集$https://play.modujx17.com/20260911/5UrXpUgM/index.m3u8#第02集$https://play.modujx17.com/20260911/An1bmOyj/index.m3u8#第03集$https://play.modujx17.com/20260911/AhSmSxjb/index.m3u8#第04集$https://play.modujx17.com/20260911/3fEmsWDD/index.m3u8#第05集$https://play.modujx17.com/20260911/f61vTPvY/index.m3u8#第06集$https://play.modujx17.com/20260911/Tfz9CzsF/index.m3u8#第07集$https://play.modujx17.com/20260911/66btKz4z/index.m3u8#第08集$https://play.modujx17.com/20260911/fmtIadCU/index.m3u8#第09集$https://play.modujx17.com/20260911/gpJzXB6N/index.m3u8#第10集$https://play.modujx17.com/20260911/AZym8o7S/index.m3u8#第11集$https://play.modujx17.com/20260911/rhbKMGDT/index.m3u8#第12集$https://play.modujx17.com/20260911/6cKfo9EC/index.m3u8#第13集$https://play.modujx17.com/20260911/3CPWhQa2/index.m3u8#第14集$https://play.modujx17.com/20260911/0XpEkfaG/index.m3u8#第15集$https://play.modujx17.com/20260911/baf0uLY7/index.m3u8#第16集$https://play.modujx17.com/20260911/YG7KKJmo/index.m3u8#第17集$https://play.modujx17.com/20260911/2s1Hatvc/index.m3u8#第18集$https://play.modujx17.com/20260911/4tlk4X8c/index.m3u8#第19集$https://play.modujx17.com/20260911/AV2WcaE2/index.m3u8#第20集$https://play.modujx17.com/20260911/WAPhsD46/index.m3u8#第21集$https://play.modujx17.com/20260911/eXkX1rfC/index.m3u8#第22集$https://play.modujx17.com/20260911/bdVui5en/index.m3u8#第23集$https://play.modujx17.com/20260911/OzE1VQ2B/index.m3u8#第24集$https://play.modujx17.com/20260911/dFTPHqPV/index.m3u8#第25集$https://play.modujx17.com/20260911/dIt1lx0r/index.m3u8#第26集$https://play.modujx17.com/20260911/ftMVYA5K/index.m3u8#第27集$https://play.modujx17.com/20260911/2nsfrscX/index.m3u8#第28集$https://play.modujx17.com/20260911/oX3jYGR9/index.m3u8#第29集$https://play.modujx17.com/20260911/VYlw4lLo/index.m3u8#第30集$https://play.modujx17.com/20260911/Hd39IMcp/index.m3u8#第31集$https://play.modujx17.com/20260911/Uu60nYMR/index.m3u8#第32集$https://play.modujx17.com/20260911/NTFP1Qpf/index.m3u8#第33集$https://play.modujx17.com/20260911/RUf9cv8z/index.m3u8#第34集$https://play.modujx17.com/20260911/06z5BSQY/index.m3u8#第35集$https://play.modujx17.com/20260911/4114vUbA/index.m3u8#第36集$https://play.modujx17.com/20260911/KXTsj8yq/index.m3u8#第37集$https://play.modujx17.com/20260911/sTKdsbJ4/index.m3u8#第38集$https://play.modujx17.com/20260911/Hg3FgXPe/index.m3u8#第39集$https://play.modujx17.com/20260911/EtsLGu3l/index.m3u8#第40集$https://play.modujx17.com/20260911/DF46RBIW/index.m3u8#第41集$https://play.modujx17.com/20260911/ilUpHqx2/index.m3u8#第42集$https://play.modujx17.com/20260911/Y9elzKMO/index.m3u8#第43集$https://play.modujx17.com/20260911/OG1GvmHi/index.m3u8#第44集$https://play.modujx17.com/20260911/IGP6NW84/index.m3u8#第45集$https://play.modujx17.com/20260911/fDrSqWMn/index.m3u8#第46集$https://play.modujx17.com/20260911/OrRFNWDE/index.m3u8#第47集$https://play.modujx17.com/20260911/yAJhMvdH/index.m3u8#第48集$https://play.modujx17.com/20260911/fjOTTSx8/index.m3u8#第49集$https://play.modujx17.com/20260911/ees0V0Co/index.m3u8#第50集$https://play.modujx17.com/20260911/0qzP91dt/index.m3u8#第51集$https://play.modujx17.com/20260911/9F1S60fy/index.m3u8#第52集$https://play.modujx17.com/20260911/A5yGpPDS/index.m3u8#第53集$https://play.modujx17.com/20260911/0YgSrKXw/index.m3u8#第54集$https://play.modujx17.com/20260911/n5qDVmc6/index.m3u8#第55集$https://play.modujx17.com/20260911/nuKogTw0/index.m3u8#第56集$https://play.modujx17.com/20260911/DQkIWz3W/index.m3u8#第57集$https://play.modujx17.com/20260911/b5HENXRf/index.m3u8#第58集$https://play.modujx17.com/20260911/jb7qGQZ5/index.m3u8#第59集$https://play.modujx17.com/20260911/3krvJTmu/index.m3u8#第60集$https://play.modujx17.com/20260911/E5yC2Pys/index.m3u8#第61集$https://play.modujx17.com/20260911/xz2QrVbV/index.m3u8#第62集$https://play.modujx17.com/20260911/ZV93f3Lu/index.m3u8#第63集$https://play.modujx17.com/20260911/Pk56ZF10/index.m3u8#第64集$https://play.modujx17.com/20260911/wfYmKiny/index.m3u8#第65集$https://play.modujx17.com/20260911/V7gRauND/index.m3u8#第66集$https://play.modujx17.com/20260911/cbfzgJ7Y/index.m3u8#第67集$https://play.modujx17.com/20260911/K6h8llAt/index.m3u8#第68集$https://play.modujx17.com/20260911/Ks2KyUjX/index.m3u8#第69集$https://play.modujx17.com/20260911/tNVLwF7N/index.m3u8#第70集$https://play.modujx17.com/20260911/61IX3XBN/index.m3u8#第71集$https://play.modujx17.com/20260911/keJZvcnL/index.m3u8#第72集$https://play.modujx17.com/20260911/fFbqarGG/index.m3u8#第73集$https://play.modujx17.com/20260911/soLt1yif/index.m3u8#第74集$https://play.modujx17.com/20260911/OEhpbg7M/index.m3u8#第75集$https://play.modujx17.com/20260911/AQpSPzEC/index.m3u8#第76集$https://play.modujx17.com/20260911/tm3VJHHf/index.m3u8#第77集$https://play.modujx17.com/20260911/YKjsv29a/index.m3u8#第78集$https://play.modujx17.com/20260911/TGjqCDsi/index.m3u8#第79集$https://play.modujx17.com/20260911/oQClxcni/index.m3u8#第80集$https://play.modujx17.com/20260911/4D9AgViu/index.m3u8#第81集$https://play.modujx17.com/20260911/xky6Bwas/index.m3u8#第82集$https://play.modujx17.com/20260911/ZtpkVS8G/index.m3u8#第83集$https://play.modujx17.com/20260911/r0Us4im0/index.m3u8#第84集$https://play.modujx17.com/20260911/WvPXRS5A/index.m3u8#第85集$https://play.modujx17.com/20260911/zdZSERrs/index.m3u8#第86集$https://play.modujx17.com/20260911/IVWFszjR/index.m3u8#第87集$https://play.modujx17.com/20260911/ixdSvHjp/index.m3u8#第88集$https://play.modujx17.com/20260911/gDrwUOAa/index.m3u8#第89集$https://play.modujx17.com/20260911/IrDkEwoo/index.m3u8#第90集$https://play.modujx17.com/20260911/Xa7ugfrj/index.m3u8#第91集$https://play.modujx17.com/20260911/moR0n5vb/index.m3u8#第92集$https://play.modujx17.com/20260911/qHR8yRVn/index.m3u8"
    },
    {
      id: "pb_cat_s5",
      title: "愿我如星卿如月",
      rate: "8.9",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/d75079036d7c0381aecd9ae1f7372d9c.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全80集",
      play_url: "第01集$https://play.modujx17.com/20260911/BJyIFMXl/index.m3u8#第02集$https://play.modujx17.com/20260911/gcFwjTnc/index.m3u8#第03集$https://play.modujx17.com/20260911/NFhwDoOY/index.m3u8#第04集$https://play.modujx17.com/20260911/PvcNGBJK/index.m3u8#第05集$https://play.modujx17.com/20260911/RnEsQUOh/index.m3u8#第06集$https://play.modujx17.com/20260911/BittF9y5/index.m3u8#第07集$https://play.modujx17.com/20260911/yK4MY2jq/index.m3u8#第08集$https://play.modujx17.com/20260911/E5ZBUYia/index.m3u8#第09集$https://play.modujx17.com/20260911/LD0LQl7S/index.m3u8#第10集$https://play.modujx17.com/20260911/In1FOM4l/index.m3u8#第11集$https://play.modujx17.com/20260911/DisgDPcC/index.m3u8#第12集$https://play.modujx17.com/20260911/hDZiOpAk/index.m3u8#第13集$https://play.modujx17.com/20260911/UasNdpBT/index.m3u8#第14集$https://play.modujx17.com/20260911/aTT18Cid/index.m3u8#第15集$https://play.modujx17.com/20260911/QPmsqxVX/index.m3u8#第16集$https://play.modujx17.com/20260911/keeLjJwJ/index.m3u8#第17集$https://play.modujx17.com/20260911/1idHfrlg/index.m3u8#第18集$https://play.modujx17.com/20260911/Vgxx4PDB/index.m3u8#第19集$https://play.modujx17.com/20260911/YAPgTQAX/index.m3u8#第20集$https://play.modujx17.com/20260911/X31CcnXC/index.m3u8#第21集$https://play.modujx17.com/20260911/R9wP47C4/index.m3u8#第22集$https://play.modujx17.com/20260911/bqTd1a8O/index.m3u8#第23集$https://play.modujx17.com/20260911/gBLR33Jh/index.m3u8#第24集$https://play.modujx17.com/20260911/5BZ09Rii/index.m3u8#第25集$https://play.modujx17.com/20260911/7k2dcWsI/index.m3u8#第26集$https://play.modujx17.com/20260911/QZIlj6Ly/index.m3u8#第27集$https://play.modujx17.com/20260911/olGgqdXo/index.m3u8#第28集$https://play.modujx17.com/20260911/gAa803nG/index.m3u8#第29集$https://play.modujx17.com/20260911/9439Wy1J/index.m3u8#第30集$https://play.modujx17.com/20260911/AKBELSbK/index.m3u8#第31集$https://play.modujx17.com/20260911/GdtDfruY/index.m3u8#第32集$https://play.modujx17.com/20260911/juh2VHBU/index.m3u8#第33集$https://play.modujx17.com/20260911/JtT4Kye6/index.m3u8#第34集$https://play.modujx17.com/20260911/q5hhFLdw/index.m3u8#第35集$https://play.modujx17.com/20260911/7Wxxzl1i/index.m3u8#第36集$https://play.modujx17.com/20260911/Xr1gyekD/index.m3u8#第37集$https://play.modujx17.com/20260911/0UwjroXR/index.m3u8#第38集$https://play.modujx17.com/20260911/HvxE1lkj/index.m3u8#第39集$https://play.modujx17.com/20260911/LhEalC2c/index.m3u8#第40集$https://play.modujx17.com/20260911/Mr11Cz9g/index.m3u8#第41集$https://play.modujx17.com/20260911/weKxC37a/index.m3u8#第42集$https://play.modujx17.com/20260911/JPn5FWAe/index.m3u8#第43集$https://play.modujx17.com/20260911/k9pf2d9o/index.m3u8#第44集$https://play.modujx17.com/20260911/YwUBuGbN/index.m3u8#第45集$https://play.modujx17.com/20260911/LwcgFd33/index.m3u8#第46集$https://play.modujx17.com/20260911/zHjpdtc8/index.m3u8#第47集$https://play.modujx17.com/20260911/W5L55xYX/index.m3u8#第48集$https://play.modujx17.com/20260911/66sFIZY3/index.m3u8#第49集$https://play.modujx17.com/20260911/qnCVnmPp/index.m3u8#第50集$https://play.modujx17.com/20260911/F2OWpAtv/index.m3u8#第51集$https://play.modujx17.com/20260911/779YXVd4/index.m3u8#第52集$https://play.modujx17.com/20260911/Za2No5de/index.m3u8#第53集$https://play.modujx17.com/20260911/OYY2z94C/index.m3u8#第54集$https://play.modujx17.com/20260911/F8QCu4wS/index.m3u8#第55集$https://play.modujx17.com/20260911/keM9qNIy/index.m3u8#第56集$https://play.modujx17.com/20260911/VW46Kk4g/index.m3u8#第57集$https://play.modujx17.com/20260911/T9wBwP4A/index.m3u8#第58集$https://play.modujx17.com/20260911/nFNwKutX/index.m3u8#第59集$https://play.modujx17.com/20260911/CFNAwFII/index.m3u8#第60集$https://play.modujx17.com/20260911/3DP7cB7o/index.m3u8#第61集$https://play.modujx17.com/20260911/WGiedSo0/index.m3u8#第62集$https://play.modujx17.com/20260911/8KfQ2ZiS/index.m3u8#第63集$https://play.modujx17.com/20260911/HlpzIju9/index.m3u8#第64集$https://play.modujx17.com/20260911/ZAZbDKcT/index.m3u8#第65集$https://play.modujx17.com/20260911/8cljkMBe/index.m3u8#第66集$https://play.modujx17.com/20260911/VJ8dfr2G/index.m3u8#第67集$https://play.modujx17.com/20260911/WL37fBn2/index.m3u8#第68集$https://play.modujx17.com/20260911/rj6QlKgQ/index.m3u8#第69集$https://play.modujx17.com/20260911/rAjliv6m/index.m3u8#第70集$https://play.modujx17.com/20260911/QVlwLUWg/index.m3u8#第71集$https://play.modujx17.com/20260911/ewo7xjo3/index.m3u8#第72集$https://play.modujx17.com/20260911/UP8UhV2J/index.m3u8#第73集$https://play.modujx17.com/20260911/hqhWrtmA/index.m3u8#第74集$https://play.modujx17.com/20260911/DYBL4Qcx/index.m3u8#第75集$https://play.modujx17.com/20260911/Wt7V0K9P/index.m3u8#第76集$https://play.modujx17.com/20260911/oEQ0V0Fb/index.m3u8#第77集$https://play.modujx17.com/20260911/Yk1DtXpz/index.m3u8#第78集$https://play.modujx17.com/20260911/V3rZL60O/index.m3u8#第79集$https://play.modujx17.com/20260911/BBh81rJF/index.m3u8#第80集$https://play.modujx17.com/20260911/ugWuIJ5G/index.m3u8"
    },
    {
      id: "pb_cat_s6",
      title: "团宠妹宝重生，错位亲情七六年的救赎",
      rate: "9.0",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/8479b00c5e3c2c9943ef47ecdcd202f9.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全70集",
      play_url: "第01集$https://play.modujx17.com/20260911/cP2RUb5z/index.m3u8#第02集$https://play.modujx17.com/20260911/6J3zAoA3/index.m3u8#第03集$https://play.modujx17.com/20260911/eI8XCu64/index.m3u8#第04集$https://play.modujx17.com/20260911/Jw9dXgl3/index.m3u8#第05集$https://play.modujx17.com/20260911/isVNc13Z/index.m3u8#第06集$https://play.modujx17.com/20260911/lXaykajV/index.m3u8#第07集$https://play.modujx17.com/20260911/gRWrC7qD/index.m3u8#第08集$https://play.modujx17.com/20260911/m7t3Xu3J/index.m3u8#第09集$https://play.modujx17.com/20260911/3Xt7Yd8V/index.m3u8#第10集$https://play.modujx17.com/20260911/3OwyYTep/index.m3u8#第11集$https://play.modujx17.com/20260911/99BZzigt/index.m3u8#第12集$https://play.modujx17.com/20260911/IiMJCOjj/index.m3u8#第13集$https://play.modujx17.com/20260911/OuSUjIgS/index.m3u8#第14集$https://play.modujx17.com/20260911/1Bh5JYHF/index.m3u8#第15集$https://play.modujx17.com/20260911/rW00cLjC/index.m3u8#第16集$https://play.modujx17.com/20260911/qfBxiZRj/index.m3u8#第17集$https://play.modujx17.com/20260911/7Gy6Shfg/index.m3u8#第18集$https://play.modujx17.com/20260911/Vy6bNTUx/index.m3u8#第19集$https://play.modujx17.com/20260911/dHFOe9zA/index.m3u8#第20集$https://play.modujx17.com/20260911/vsrt3sXM/index.m3u8#第21集$https://play.modujx17.com/20260911/Hq9YzycI/index.m3u8#第22集$https://play.modujx17.com/20260911/9H5WZn0x/index.m3u8#第23集$https://play.modujx17.com/20260911/jFr2y6ex/index.m3u8#第24集$https://play.modujx17.com/20260911/vNG4uiq2/index.m3u8#第25集$https://play.modujx17.com/20260911/KHszDlIG/index.m3u8#第26集$https://play.modujx17.com/20260911/AlX3nuyr/index.m3u8#第27集$https://play.modujx17.com/20260911/H8y8peIM/index.m3u8#第28集$https://play.modujx17.com/20260911/aosiGVCd/index.m3u8#第29集$https://play.modujx17.com/20260911/dx4IFmmJ/index.m3u8#第30集$https://play.modujx17.com/20260911/Fv64IweC/index.m3u8#第31集$https://play.modujx17.com/20260911/nwzz1Y0R/index.m3u8#第32集$https://play.modujx17.com/20260911/VeEahoX1/index.m3u8#第33集$https://play.modujx17.com/20260911/IbxogFz5/index.m3u8#第34集$https://play.modujx17.com/20260911/5kykXNuV/index.m3u8#第35集$https://play.modujx17.com/20260911/ZL3e4wsI/index.m3u8#第36集$https://play.modujx17.com/20260911/wCkiqj75/index.m3u8#第37集$https://play.modujx17.com/20260911/C8QE46M0/index.m3u8#第38集$https://play.modujx17.com/20260911/0eWFFFwt/index.m3u8#第39集$https://play.modujx17.com/20260911/SetGcJc4/index.m3u8#第40集$https://play.modujx17.com/20260911/Bycs4Y9J/index.m3u8#第41集$https://play.modujx17.com/20260911/THVksZTj/index.m3u8#第42集$https://play.modujx17.com/20260911/DZ9cU6MT/index.m3u8#第43集$https://play.modujx17.com/20260911/9jaYCnly/index.m3u8#第44集$https://play.modujx17.com/20260911/SaXPA7RW/index.m3u8#第45集$https://play.modujx17.com/20260911/QN3pagcA/index.m3u8#第46集$https://play.modujx17.com/20260911/oWTBQREk/index.m3u8#第47集$https://play.modujx17.com/20260911/8PbB5ycr/index.m3u8#第48集$https://play.modujx17.com/20260911/rOX6Ggty/index.m3u8#第49集$https://play.modujx17.com/20260911/9hEZ1Eu2/index.m3u8#第50集$https://play.modujx17.com/20260911/ZzxPCo5E/index.m3u8#第51集$https://play.modujx17.com/20260911/Xtlc9hj6/index.m3u8#第52集$https://play.modujx17.com/20260911/kY8vNsCI/index.m3u8#第53集$https://play.modujx17.com/20260911/dTolifRK/index.m3u8#第54集$https://play.modujx17.com/20260911/buXjzbJA/index.m3u8#第55集$https://play.modujx17.com/20260911/VpPxMQUZ/index.m3u8#第56集$https://play.modujx17.com/20260911/QeZTbEDf/index.m3u8#第57集$https://play.modujx17.com/20260911/ctlmynLq/index.m3u8#第58集$https://play.modujx17.com/20260911/eN70aYGc/index.m3u8#第59集$https://play.modujx17.com/20260911/3TzVwxi1/index.m3u8#第60集$https://play.modujx17.com/20260911/fFl9chvi/index.m3u8#第61集$https://play.modujx17.com/20260911/Omi1Ir8N/index.m3u8#第62集$https://play.modujx17.com/20260911/8UVhGQSI/index.m3u8#第63集$https://play.modujx17.com/20260911/qhGCOuly/index.m3u8#第64集$https://play.modujx17.com/20260911/xNtqzcZ2/index.m3u8#第65集$https://play.modujx17.com/20260911/8N5hsb5O/index.m3u8#第66集$https://play.modujx17.com/20260911/e2GwdYcT/index.m3u8#第67集$https://play.modujx17.com/20260911/CLUURRWI/index.m3u8#第68集$https://play.modujx17.com/20260911/3aOtOfcR/index.m3u8#第69集$https://play.modujx17.com/20260911/gLs8nzxm/index.m3u8#第70集$https://play.modujx17.com/20260911/JBeUiGu1/index.m3u8"
    },
    {
      id: "pb_cat_s7",
      title: "所城里的夏天",
      rate: "9.1",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/b6f8138e576e82892b7a291419200ea5.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全60集",
      play_url: "第01集$https://play.modujx17.com/20260911/Ky7euEz3/index.m3u8#第02集$https://play.modujx17.com/20260911/euPUpDzh/index.m3u8#第03集$https://play.modujx17.com/20260911/3i6wsc4o/index.m3u8#第04集$https://play.modujx17.com/20260911/cD4xqiPV/index.m3u8#第05集$https://play.modujx17.com/20260911/KvyS9b1d/index.m3u8#第06集$https://play.modujx17.com/20260911/5VHQJx0J/index.m3u8#第07集$https://play.modujx17.com/20260911/bgTMk4hB/index.m3u8#第08集$https://play.modujx17.com/20260911/Xx1mDGaE/index.m3u8#第09集$https://play.modujx17.com/20260911/dmVk2DRg/index.m3u8#第10集$https://play.modujx17.com/20260911/7o03FzDP/index.m3u8#第11集$https://play.modujx17.com/20260911/MW6i2xrf/index.m3u8#第12集$https://play.modujx17.com/20260911/5HKd0uCi/index.m3u8#第13集$https://play.modujx17.com/20260911/bbc0zj6L/index.m3u8#第14集$https://play.modujx17.com/20260911/GwwFPFLf/index.m3u8#第15集$https://play.modujx17.com/20260911/8wwdpTyo/index.m3u8#第16集$https://play.modujx17.com/20260911/TIeFBWPu/index.m3u8#第17集$https://play.modujx17.com/20260911/Ix97BlKc/index.m3u8#第18集$https://play.modujx17.com/20260911/3p9Q9NKL/index.m3u8#第19集$https://play.modujx17.com/20260911/lC7si4LU/index.m3u8#第20集$https://play.modujx17.com/20260911/w8se9XOJ/index.m3u8#第21集$https://play.modujx17.com/20260911/QrVHvTgK/index.m3u8#第22集$https://play.modujx17.com/20260911/nPlTuw6W/index.m3u8#第23集$https://play.modujx17.com/20260911/86mEfDJb/index.m3u8#第24集$https://play.modujx17.com/20260911/jMmjyHH9/index.m3u8#第25集$https://play.modujx17.com/20260911/2z2roWgg/index.m3u8#第26集$https://play.modujx17.com/20260911/trogJAxB/index.m3u8#第27集$https://play.modujx17.com/20260911/z58ZkxnH/index.m3u8#第28集$https://play.modujx17.com/20260911/rqWwFIqL/index.m3u8#第29集$https://play.modujx17.com/20260911/24j43Kzc/index.m3u8#第30集$https://play.modujx17.com/20260911/Je0cbfJ6/index.m3u8#第31集$https://play.modujx17.com/20260911/W80JdT8c/index.m3u8#第32集$https://play.modujx17.com/20260911/U1Ho7x1z/index.m3u8#第33集$https://play.modujx17.com/20260911/zKIMwME7/index.m3u8#第34集$https://play.modujx17.com/20260911/aUBwcQDV/index.m3u8#第35集$https://play.modujx17.com/20260911/9cnWsJue/index.m3u8#第36集$https://play.modujx17.com/20260911/oHcEk3kf/index.m3u8#第37集$https://play.modujx17.com/20260911/RioY52uZ/index.m3u8#第38集$https://play.modujx17.com/20260911/BrXic0lO/index.m3u8#第39集$https://play.modujx17.com/20260911/5MguASrJ/index.m3u8#第40集$https://play.modujx17.com/20260911/AEHAnGod/index.m3u8#第41集$https://play.modujx17.com/20260911/l7PLFYaN/index.m3u8#第42集$https://play.modujx17.com/20260911/SZ7HtHin/index.m3u8#第43集$https://play.modujx17.com/20260911/pVNUUxhJ/index.m3u8#第44集$https://play.modujx17.com/20260911/1lJ4tF3w/index.m3u8#第45集$https://play.modujx17.com/20260911/WqU02x57/index.m3u8#第46集$https://play.modujx17.com/20260911/MSKz85KU/index.m3u8#第47集$https://play.modujx17.com/20260911/ENKfjHsW/index.m3u8#第48集$https://play.modujx17.com/20260911/RzE9yosV/index.m3u8#第49集$https://play.modujx17.com/20260911/GjdI8hwj/index.m3u8#第50集$https://play.modujx17.com/20260911/vEpQ1Stz/index.m3u8#第51集$https://play.modujx17.com/20260911/N4UTWzkQ/index.m3u8#第52集$https://play.modujx17.com/20260911/7kxaePcy/index.m3u8#第53集$https://play.modujx17.com/20260911/gUNNlaig/index.m3u8#第54集$https://play.modujx17.com/20260911/nwX01q89/index.m3u8#第55集$https://play.modujx17.com/20260911/rr4MdQEI/index.m3u8#第56集$https://play.modujx17.com/20260911/F6CDlhPg/index.m3u8#第57集$https://play.modujx17.com/20260911/C6FCyUOZ/index.m3u8#第58集$https://play.modujx17.com/20260911/fu77Ylqt/index.m3u8#第59集$https://play.modujx17.com/20260911/We9dXGRY/index.m3u8#第60集$https://play.modujx17.com/20260911/qkl50GHP/index.m3u8"
    },
    {
      id: "pb_cat_s8",
      title: "逆袭开宝箱，前妻一家崩溃了",
      rate: "9.2",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/9d776f054a52b1d66786f3484357b432.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全73集",
      play_url: "第01集$https://play.modujx17.com/20260911/y8AdMICo/index.m3u8#第02集$https://play.modujx17.com/20260911/bJwKwHq1/index.m3u8#第03集$https://play.modujx17.com/20260911/EtI3DnUW/index.m3u8#第04集$https://play.modujx17.com/20260911/Unflp863/index.m3u8#第05集$https://play.modujx17.com/20260911/JJRqF7ud/index.m3u8#第06集$https://play.modujx17.com/20260911/tvPqMOFE/index.m3u8#第07集$https://play.modujx17.com/20260911/tjus7Ng0/index.m3u8#第08集$https://play.modujx17.com/20260911/6i0Q24v5/index.m3u8#第09集$https://play.modujx17.com/20260911/Ahxo6X8o/index.m3u8#第10集$https://play.modujx17.com/20260911/yT6FKQo9/index.m3u8#第11集$https://play.modujx17.com/20260911/KRpHK2SW/index.m3u8#第12集$https://play.modujx17.com/20260911/I4i41j0K/index.m3u8#第13集$https://play.modujx17.com/20260911/39GS6rpm/index.m3u8#第14集$https://play.modujx17.com/20260911/rjstj5OJ/index.m3u8#第15集$https://play.modujx17.com/20260911/IHLWy3ef/index.m3u8#第16集$https://play.modujx17.com/20260911/xjefyyPe/index.m3u8#第17集$https://play.modujx17.com/20260911/2DOwX0SF/index.m3u8#第18集$https://play.modujx17.com/20260911/a3crtUpE/index.m3u8#第19集$https://play.modujx17.com/20260911/zzJvVwb4/index.m3u8#第20集$https://play.modujx17.com/20260911/TMmclWKL/index.m3u8#第21集$https://play.modujx17.com/20260911/hJAbq4F9/index.m3u8#第22集$https://play.modujx17.com/20260911/te7qNXZJ/index.m3u8#第23集$https://play.modujx17.com/20260911/VvCu0cpc/index.m3u8#第24集$https://play.modujx17.com/20260911/jVFFJICD/index.m3u8#第25集$https://play.modujx17.com/20260911/zTKafZMG/index.m3u8#第26集$https://play.modujx17.com/20260911/HCUfOmoM/index.m3u8#第27集$https://play.modujx17.com/20260911/bkzpdwzr/index.m3u8#第28集$https://play.modujx17.com/20260911/67mPZZ9c/index.m3u8#第29集$https://play.modujx17.com/20260911/4z0fur9v/index.m3u8#第30集$https://play.modujx17.com/20260911/tGJyvohU/index.m3u8#第31集$https://play.modujx17.com/20260911/XZlbkXZ0/index.m3u8#第32集$https://play.modujx17.com/20260911/6OacLQ3w/index.m3u8#第33集$https://play.modujx17.com/20260911/gJg25HTr/index.m3u8#第34集$https://play.modujx17.com/20260911/1Inz0LOQ/index.m3u8#第35集$https://play.modujx17.com/20260911/saVbZ7bg/index.m3u8#第36集$https://play.modujx17.com/20260911/gmhaj9JP/index.m3u8#第37集$https://play.modujx17.com/20260911/7cwZFLpQ/index.m3u8#第38集$https://play.modujx17.com/20260911/MTx2CUnS/index.m3u8#第39集$https://play.modujx17.com/20260911/QaHfnn41/index.m3u8#第40集$https://play.modujx17.com/20260911/GFfNB164/index.m3u8#第41集$https://play.modujx17.com/20260911/AuhHUWJL/index.m3u8#第42集$https://play.modujx17.com/20260911/Cj5nYKiZ/index.m3u8#第43集$https://play.modujx17.com/20260911/jmvhcHO9/index.m3u8#第44集$https://play.modujx17.com/20260911/7tof40qI/index.m3u8#第45集$https://play.modujx17.com/20260911/KNGAqKcf/index.m3u8#第46集$https://play.modujx17.com/20260911/C9OxfgPi/index.m3u8#第47集$https://play.modujx17.com/20260911/COYPhqjE/index.m3u8#第48集$https://play.modujx17.com/20260911/4lKLRA4V/index.m3u8#第49集$https://play.modujx17.com/20260911/dQdK5DcI/index.m3u8#第50集$https://play.modujx17.com/20260911/HpSfMGJd/index.m3u8#第51集$https://play.modujx17.com/20260911/oa1AVhNk/index.m3u8#第52集$https://play.modujx17.com/20260911/n1gjzjTG/index.m3u8#第53集$https://play.modujx17.com/20260911/VGfl80aA/index.m3u8#第54集$https://play.modujx17.com/20260911/wVHbXrfU/index.m3u8#第55集$https://play.modujx17.com/20260911/4KAhQSiF/index.m3u8#第56集$https://play.modujx17.com/20260911/0Z0XPhjo/index.m3u8#第57集$https://play.modujx17.com/20260911/ANCQNYpx/index.m3u8#第58集$https://play.modujx17.com/20260911/xja18cIs/index.m3u8#第59集$https://play.modujx17.com/20260911/QUCgkd4B/index.m3u8#第60集$https://play.modujx17.com/20260911/NXU8MKlV/index.m3u8#第61集$https://play.modujx17.com/20260911/AfRIitpO/index.m3u8#第62集$https://play.modujx17.com/20260911/FgGICxq2/index.m3u8#第63集$https://play.modujx17.com/20260911/8li2u2Bp/index.m3u8#第64集$https://play.modujx17.com/20260911/NA1O78Ob/index.m3u8#第65集$https://play.modujx17.com/20260911/akZ6bJTk/index.m3u8#第66集$https://play.modujx17.com/20260911/Bo7Pdkc5/index.m3u8#第67集$https://play.modujx17.com/20260911/Lu5iHvKy/index.m3u8#第68集$https://play.modujx17.com/20260911/NNq3jKrC/index.m3u8#第69集$https://play.modujx17.com/20260911/JS73xw9p/index.m3u8#第70集$https://play.modujx17.com/20260911/97SPvL3K/index.m3u8#第71集$https://play.modujx17.com/20260911/4LT7J0R2/index.m3u8#第72集$https://play.modujx17.com/20260911/UrBj3rf8/index.m3u8#第73集$https://play.modujx17.com/20260911/uajN3I0n/index.m3u8"
    },
    {
      id: "pb_cat_s9",
      title: "蛮女养蛊也养夫",
      rate: "9.3",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/333865e4adcb2fb2da74d31b84823679.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全56集",
      play_url: "第01集$https://play.modujx17.com/20260911/dvu9T0nD/index.m3u8#第02集$https://play.modujx17.com/20260911/kCHEm18u/index.m3u8#第03集$https://play.modujx17.com/20260911/M72MEmlY/index.m3u8#第04集$https://play.modujx17.com/20260911/8gYLQDwV/index.m3u8#第05集$https://play.modujx17.com/20260911/D5MJMd70/index.m3u8#第06集$https://play.modujx17.com/20260911/3uY9Qa5R/index.m3u8#第07集$https://play.modujx17.com/20260911/55Ficqpc/index.m3u8#第08集$https://play.modujx17.com/20260911/9mpJ979c/index.m3u8#第09集$https://play.modujx17.com/20260911/YKCWzCAn/index.m3u8#第10集$https://play.modujx17.com/20260911/oXqqnmz7/index.m3u8#第11集$https://play.modujx17.com/20260911/jA8bepOV/index.m3u8#第12集$https://play.modujx17.com/20260911/c4TZrRFZ/index.m3u8#第13集$https://play.modujx17.com/20260911/JdufrRxA/index.m3u8#第14集$https://play.modujx17.com/20260911/pzcJxi5Y/index.m3u8#第15集$https://play.modujx17.com/20260911/Xf5MiJzU/index.m3u8#第16集$https://play.modujx17.com/20260911/YMXLOoYI/index.m3u8#第17集$https://play.modujx17.com/20260911/QEX5DBzL/index.m3u8#第18集$https://play.modujx17.com/20260911/3DytEewY/index.m3u8#第19集$https://play.modujx17.com/20260911/pJPgvwt5/index.m3u8#第20集$https://play.modujx17.com/20260911/j8rueDms/index.m3u8#第21集$https://play.modujx17.com/20260911/zAt4E49m/index.m3u8#第22集$https://play.modujx17.com/20260911/h0F41Ucn/index.m3u8#第23集$https://play.modujx17.com/20260911/v3k4dNba/index.m3u8#第24集$https://play.modujx17.com/20260911/4JiR3l0d/index.m3u8#第25集$https://play.modujx17.com/20260911/lzUAZ7SR/index.m3u8#第26集$https://play.modujx17.com/20260911/6SIjCJFW/index.m3u8#第27集$https://play.modujx17.com/20260911/dGqgEFuv/index.m3u8#第28集$https://play.modujx17.com/20260911/L5VRlXn5/index.m3u8#第29集$https://play.modujx17.com/20260911/KY7eLzP4/index.m3u8#第30集$https://play.modujx17.com/20260911/UEop6sTK/index.m3u8#第31集$https://play.modujx17.com/20260911/8XZToW7U/index.m3u8#第32集$https://play.modujx17.com/20260911/O9yqTFLh/index.m3u8#第33集$https://play.modujx17.com/20260911/ulZwGvHT/index.m3u8#第34集$https://play.modujx17.com/20260911/Q8Jrm8Th/index.m3u8#第35集$https://play.modujx17.com/20260911/uILf42R0/index.m3u8#第36集$https://play.modujx17.com/20260911/2w3AqJVf/index.m3u8#第37集$https://play.modujx17.com/20260911/yLrHcM7Q/index.m3u8#第38集$https://play.modujx17.com/20260911/0omVb07E/index.m3u8#第39集$https://play.modujx17.com/20260911/zbtMnqVl/index.m3u8#第40集$https://play.modujx17.com/20260911/iEqTYyo8/index.m3u8#第41集$https://play.modujx17.com/20260911/4k9aqQaH/index.m3u8#第42集$https://play.modujx17.com/20260911/5KvD7za1/index.m3u8#第43集$https://play.modujx17.com/20260911/pkIWeV7y/index.m3u8#第44集$https://play.modujx17.com/20260911/ANp4S6Gs/index.m3u8#第45集$https://play.modujx17.com/20260911/UIGksYQW/index.m3u8#第46集$https://play.modujx17.com/20260911/bDUr1WyK/index.m3u8#第47集$https://play.modujx17.com/20260911/XZr1Q8Bs/index.m3u8#第48集$https://play.modujx17.com/20260911/4o7WlVb5/index.m3u8#第49集$https://play.modujx17.com/20260911/KSXAncy4/index.m3u8#第50集$https://play.modujx17.com/20260911/argOJWM2/index.m3u8#第51集$https://play.modujx17.com/20260911/cq8tyosz/index.m3u8#第52集$https://play.modujx17.com/20260911/1KT7qnzh/index.m3u8#第53集$https://play.modujx17.com/20260911/EmNhJHYh/index.m3u8#第54集$https://play.modujx17.com/20260911/eVZnXQvI/index.m3u8#第55集$https://play.modujx17.com/20260911/LDESeaoM/index.m3u8#第56集$https://play.modujx17.com/20260911/vqz7VUjY/index.m3u8"
    },
    {
      id: "pb_cat_s10",
      title: "和冰山女神绝地逃生",
      rate: "9.4",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/a7d8689dcc57612e86c396000a2e917f.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全50集",
      play_url: "第01集$https://play.modujx17.com/20260911/y5Rd2cpA/index.m3u8#第02集$https://play.modujx17.com/20260911/YX0J5yOP/index.m3u8#第03集$https://play.modujx17.com/20260911/wqvb5zOb/index.m3u8#第04集$https://play.modujx17.com/20260911/RFfBgFxn/index.m3u8#第05集$https://play.modujx17.com/20260911/Ub6d6SVH/index.m3u8#第06集$https://play.modujx17.com/20260911/vrb3I1Z8/index.m3u8#第07集$https://play.modujx17.com/20260911/JcOurnLk/index.m3u8#第08集$https://play.modujx17.com/20260911/Q5oZSmw9/index.m3u8#第09集$https://play.modujx17.com/20260911/Fs7jjc5J/index.m3u8#第10集$https://play.modujx17.com/20260911/SFHYmKAX/index.m3u8#第11集$https://play.modujx17.com/20260911/MrYAtcGD/index.m3u8#第12集$https://play.modujx17.com/20260911/wJu3LSTj/index.m3u8#第13集$https://play.modujx17.com/20260911/lBjr3FHm/index.m3u8#第14集$https://play.modujx17.com/20260911/vy4L7iTn/index.m3u8#第15集$https://play.modujx17.com/20260911/uGrUoEFG/index.m3u8#第16集$https://play.modujx17.com/20260911/1NwydU5c/index.m3u8#第17集$https://play.modujx17.com/20260911/CoXIWdNf/index.m3u8#第18集$https://play.modujx17.com/20260911/OF6VJIsK/index.m3u8#第19集$https://play.modujx17.com/20260911/KYzjZG7v/index.m3u8#第20集$https://play.modujx17.com/20260911/xCBu68zH/index.m3u8#第21集$https://play.modujx17.com/20260911/g9KOObIU/index.m3u8#第22集$https://play.modujx17.com/20260911/YroTdd4L/index.m3u8#第23集$https://play.modujx17.com/20260911/GMBmZqrg/index.m3u8#第24集$https://play.modujx17.com/20260911/V3EILZOs/index.m3u8#第25集$https://play.modujx17.com/20260911/056AYJ3d/index.m3u8#第26集$https://play.modujx17.com/20260911/JSamm7dN/index.m3u8#第27集$https://play.modujx17.com/20260911/k29iKcIJ/index.m3u8#第28集$https://play.modujx17.com/20260911/PCmlKII3/index.m3u8#第29集$https://play.modujx17.com/20260911/kzoFNQah/index.m3u8#第30集$https://play.modujx17.com/20260911/LDVvRL7V/index.m3u8#第31集$https://play.modujx17.com/20260911/EOKg6gwj/index.m3u8#第32集$https://play.modujx17.com/20260911/SUdus0A4/index.m3u8#第33集$https://play.modujx17.com/20260911/Oc9tjkUu/index.m3u8#第34集$https://play.modujx17.com/20260911/PC7dGTy6/index.m3u8#第35集$https://play.modujx17.com/20260911/nmQxGrgB/index.m3u8#第36集$https://play.modujx17.com/20260911/7u8KlqkM/index.m3u8#第37集$https://play.modujx17.com/20260911/pq3rCHBu/index.m3u8#第38集$https://play.modujx17.com/20260911/gk9jFp9z/index.m3u8#第39集$https://play.modujx17.com/20260911/NYgpYkCg/index.m3u8#第40集$https://play.modujx17.com/20260911/RosjWjVT/index.m3u8#第41集$https://play.modujx17.com/20260911/r4QV989V/index.m3u8#第42集$https://play.modujx17.com/20260911/CMjDuJxv/index.m3u8#第43集$https://play.modujx17.com/20260911/sLEfi7Y1/index.m3u8#第44集$https://play.modujx17.com/20260911/h2JiXqGF/index.m3u8#第45集$https://play.modujx17.com/20260911/rIFf6RcQ/index.m3u8#第46集$https://play.modujx17.com/20260911/1MTE79gY/index.m3u8#第47集$https://play.modujx17.com/20260911/k79nWeSj/index.m3u8#第48集$https://play.modujx17.com/20260911/qTlKPFdw/index.m3u8#第49集$https://play.modujx17.com/20260911/WSXhNehi/index.m3u8#第50集$https://play.modujx17.com/20260911/ooJc5YU0/index.m3u8"
    },
    {
      id: "pb_cat_s11",
      title: "重生：大嫂别闹，我要护家",
      rate: "9.5",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/12bceee4e3b278c55ce617797eaab17d.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全42集",
      play_url: "第01集$https://play.modujx17.com/20260911/ra3gfdkx/index.m3u8#第02集$https://play.modujx17.com/20260911/bJNtwAEP/index.m3u8#第03集$https://play.modujx17.com/20260911/4r750Q7A/index.m3u8#第04集$https://play.modujx17.com/20260911/gIk5rHI4/index.m3u8#第05集$https://play.modujx17.com/20260911/yNB8dUW3/index.m3u8#第06集$https://play.modujx17.com/20260911/a9uhPDQq/index.m3u8#第07集$https://play.modujx17.com/20260911/LaUVElxY/index.m3u8#第08集$https://play.modujx17.com/20260911/QyyutyMW/index.m3u8#第09集$https://play.modujx17.com/20260911/cDwfoQPY/index.m3u8#第10集$https://play.modujx17.com/20260911/1xmq89PH/index.m3u8#第11集$https://play.modujx17.com/20260911/dOe4UBBy/index.m3u8#第12集$https://play.modujx17.com/20260911/CTOorGU6/index.m3u8#第13集$https://play.modujx17.com/20260911/4QgWrNad/index.m3u8#第14集$https://play.modujx17.com/20260911/sFMa5sHL/index.m3u8#第15集$https://play.modujx17.com/20260911/bMD0VbX8/index.m3u8#第16集$https://play.modujx17.com/20260911/cpyM1Fq8/index.m3u8#第17集$https://play.modujx17.com/20260911/HOW0fT2H/index.m3u8#第18集$https://play.modujx17.com/20260911/iCQRrRWM/index.m3u8#第19集$https://play.modujx17.com/20260911/DJ1gxFS7/index.m3u8#第20集$https://play.modujx17.com/20260911/SEDClVUF/index.m3u8#第21集$https://play.modujx17.com/20260911/INZh2bBr/index.m3u8#第22集$https://play.modujx17.com/20260911/SZRQYQGm/index.m3u8#第23集$https://play.modujx17.com/20260911/xKQzUc1o/index.m3u8#第24集$https://play.modujx17.com/20260911/R6fRrD7y/index.m3u8#第25集$https://play.modujx17.com/20260911/72PNcylp/index.m3u8#第26集$https://play.modujx17.com/20260911/XryOCwec/index.m3u8#第27集$https://play.modujx17.com/20260911/IIhE5JvA/index.m3u8#第28集$https://play.modujx17.com/20260911/WpreHZrd/index.m3u8#第29集$https://play.modujx17.com/20260911/12DVT2Ds/index.m3u8#第30集$https://play.modujx17.com/20260911/iifyFvoe/index.m3u8#第31集$https://play.modujx17.com/20260911/L0GDRnX8/index.m3u8#第32集$https://play.modujx17.com/20260911/VVbz6iBz/index.m3u8#第33集$https://play.modujx17.com/20260911/NLrcXbMS/index.m3u8#第34集$https://play.modujx17.com/20260911/SlXhyFuY/index.m3u8#第35集$https://play.modujx17.com/20260911/Ui3PCiEj/index.m3u8#第36集$https://play.modujx17.com/20260911/9Y2D9yoI/index.m3u8#第37集$https://play.modujx17.com/20260911/X9XHoj3m/index.m3u8#第38集$https://play.modujx17.com/20260911/HZscZEBD/index.m3u8#第39集$https://play.modujx17.com/20260911/Z8PFSVq8/index.m3u8#第40集$https://play.modujx17.com/20260911/fQVJPM94/index.m3u8#第41集$https://play.modujx17.com/20260911/otTsw0L4/index.m3u8#第42集$https://play.modujx17.com/20260911/2wCZ1H09/index.m3u8"
    },
    {
      id: "pb_cat_s12",
      title: "遗信邮差",
      rate: "9.6",
      cover: "https://www.mdzypic.com/upload/vod/20260911-1/73a972adc059a94971c7693284421672.jpg",
      year: "2026",
      types: ["微短剧", "精选热播", "竖屏"],
      remarks: "全46集",
      play_url: "第01集$https://play.modujx17.com/20260911/Q8TtoUXP/index.m3u8#第02集$https://play.modujx17.com/20260911/pk3QdFnb/index.m3u8#第03集$https://play.modujx17.com/20260911/2SDPdSFr/index.m3u8#第04集$https://play.modujx17.com/20260911/UOOoVY3l/index.m3u8#第05集$https://play.modujx17.com/20260911/zjkEDVTW/index.m3u8#第06集$https://play.modujx17.com/20260911/GuDPuikz/index.m3u8#第07集$https://play.modujx17.com/20260911/4yKx9H8A/index.m3u8#第08集$https://play.modujx17.com/20260911/wa0j5Ru6/index.m3u8#第09集$https://play.modujx17.com/20260911/SGFhzIX6/index.m3u8#第10集$https://play.modujx17.com/20260911/8r1V3Bc2/index.m3u8#第11集$https://play.modujx17.com/20260911/GoxAoHCa/index.m3u8#第12集$https://play.modujx17.com/20260911/hgZPPmjE/index.m3u8#第13集$https://play.modujx17.com/20260911/gQGVzrZ7/index.m3u8#第14集$https://play.modujx17.com/20260911/0QRJMyTS/index.m3u8#第15集$https://play.modujx17.com/20260911/EmUHjLKR/index.m3u8#第16集$https://play.modujx17.com/20260911/C0W84kL3/index.m3u8#第17集$https://play.modujx17.com/20260911/3yCfdOfy/index.m3u8#第18集$https://play.modujx17.com/20260911/2SuKnRqy/index.m3u8#第19集$https://play.modujx17.com/20260911/1PSbVQd2/index.m3u8#第20集$https://play.modujx17.com/20260911/TIvHo25K/index.m3u8#第21集$https://play.modujx17.com/20260911/DLd8Ks6u/index.m3u8#第22集$https://play.modujx17.com/20260911/oYEruCTD/index.m3u8#第23集$https://play.modujx17.com/20260911/fJMBZIPH/index.m3u8#第24集$https://play.modujx17.com/20260911/JFffP9xD/index.m3u8#第25集$https://play.modujx17.com/20260911/6sQSZKTc/index.m3u8#第26集$https://play.modujx17.com/20260911/4gtw1MNr/index.m3u8#第27集$https://play.modujx17.com/20260911/0rxmTJMb/index.m3u8#第28集$https://play.modujx17.com/20260911/ua3xpvj8/index.m3u8#第29集$https://play.modujx17.com/20260911/pibGZX5c/index.m3u8#第30集$https://play.modujx17.com/20260911/6CUAfvE5/index.m3u8#第31集$https://play.modujx17.com/20260911/CA60YLhW/index.m3u8#第32集$https://play.modujx17.com/20260911/QPBZnaNK/index.m3u8#第33集$https://play.modujx17.com/20260911/dosvP9tJ/index.m3u8#第34集$https://play.modujx17.com/20260911/mOsQ1gur/index.m3u8#第35集$https://play.modujx17.com/20260911/kHT1PTB1/index.m3u8#第36集$https://play.modujx17.com/20260911/WPvBOpWY/index.m3u8#第37集$https://play.modujx17.com/20260911/TnUUFZxf/index.m3u8#第38集$https://play.modujx17.com/20260911/tl2OnMBj/index.m3u8#第39集$https://play.modujx17.com/20260911/gEfDbi5O/index.m3u8#第40集$https://play.modujx17.com/20260911/LWRF7YLL/index.m3u8#第41集$https://play.modujx17.com/20260911/Swsgxhp0/index.m3u8#第42集$https://play.modujx17.com/20260911/rU2pDVy3/index.m3u8#第43集$https://play.modujx17.com/20260911/3NEfG3YJ/index.m3u8#第44集$https://play.modujx17.com/20260911/gl3T8kXM/index.m3u8#第45集$https://play.modujx17.com/20260911/5sJZBdMf/index.m3u8#第46集$https://play.modujx17.com/20260911/4CZEvAux/index.m3u8"
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
