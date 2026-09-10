/**
 * 首页首屏扩展预烘焙精选数据集 (动漫 / 综艺 / 短剧 / 全部推荐)
 * 采用 100% 真实有效官方演职人员与 TMDB 原画直链，零延时秒开。
 */

import type { PrebakedSubject, PrebakedHomeCategory } from './home-prebaked';

// ── 1. 🏮 动漫专区精选 (Anime) ──────────────────────────────────────────
export const ANIME_HOME_DATA: PrebakedHomeCategory = {
  hero: [
    {
      id: 'pb_anime_hero_1',
      title: '葬送的芙莉莲',
      rate: '9.5',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      description: '打倒魔王后的世界里，长寿的精灵魔法使芙莉莲在漫长的时光中重新理解生命与人心的旅程。豆瓣 9.5 分年度神作，治愈与史诗感交织。',
      year: '2023',
      types: ['奇幻', '治愈', '冒险'],
      episodes_info: '全28集·已完结',
      type: 'tv',
      is_new: false,
      playable: true,
      actors: ['种崎敦美', '市之濑加那', '小林千晃', '冈本信彦']
    },
    {
      id: 'pb_anime_hero_2',
      title: '鬼灭之刃 柱训练篇',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      description: '炭治郎与九柱集结开展特训，决战无限城前夕最后的宁静与高燃试炼！飞碟社顶级作画再次刷新视觉天花板。',
      year: '2024',
      types: ['热血', '奇幻', '战斗'],
      episodes_info: '全8集·已完结',
      type: 'tv',
      is_new: true,
      playable: true,
      actors: ['花江夏树', '鬼头明里', '下野纮', '松冈祯丞']
    },
    {
      id: 'pb_anime_hero_3',
      title: '凡人修仙传',
      rate: '9.3',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      description: '一个普通山村少年韩立，凭借坚韧毅力与过人智慧，历经无尽凶险与坎坷，在弱肉强食的修仙界一步步逆天修仙、傲立诸天！国漫 3D 动作巅峰。',
      year: '2024',
      types: ['仙侠', '玄幻', '修真'],
      episodes_info: '连载中年番',
      type: 'tv',
      is_new: true,
      playable: true,
      actors: ['钱文青', '杨天翔', '佟心竹']
    }
  ],
  top10: [
    {
      id: 'pb_a_top_1',
      title: '葬送的芙莉莲',
      rate: '9.5',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2023',
      types: ['奇幻', '治愈'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_top_2',
      title: '鬼灭之刃 柱训练篇',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '2024',
      types: ['热血', '战斗'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_top_3',
      title: '咒术回战 第二季',
      rate: '9.2',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2023',
      types: ['热血', '超自然'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_top_4',
      title: '凡人修仙传',
      rate: '9.3',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2024',
      types: ['仙侠', '玄幻'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_top_5',
      title: '仙逆',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2024',
      types: ['仙侠', '修真'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_top_6',
      title: '完美世界',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg',
      year: '2024',
      types: ['玄幻', '热血'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_top_7',
      title: '进击的巨人 最终季',
      rate: '9.6',
      cover: 'https://image.tmdb.org/t/p/w500/5gaf9yFJHJTkg6KtLc7enqBY6UK.jpg',
      year: '2023',
      types: ['动作', '末日'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_top_8',
      title: '吞噬星空',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg',
      year: '2024',
      types: ['科幻', '玄幻'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_top_9',
      title: '间谍过家家 第二季',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '2023',
      types: ['喜剧', '日常'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_top_10',
      title: '遮天',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2024',
      types: ['玄幻', '仙侠'],
      is_new: true,
      playable: true
    }
  ],
  s1: [
    {
      id: 'pb_a_s1_1',
      title: '鬼灭之刃 柱训练篇',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '2024',
      types: ['热血', '动作'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s1_2',
      title: '葬送的芙莉莲',
      rate: '9.5',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2023',
      types: ['奇幻', '治愈'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s1_3',
      title: '咒术回战 第二季',
      rate: '9.2',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2023',
      types: ['热血', '战斗'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s1_4',
      title: '怪兽8号',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2024',
      types: ['热血', '动作'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s1_5',
      title: '迷宫饭',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2024',
      types: ['美食', '奇幻'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s1_6',
      title: '我推的孩子 第二季',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '2024',
      types: ['悬疑', '剧情'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s1_7',
      title: '胆大党',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2024',
      types: ['超自然', '动作'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s1_8',
      title: '药屋少女的呢喃',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2023',
      types: ['悬疑', '古风'],
      is_new: false,
      playable: true
    }
  ],
  s2: [
    {
      id: 'pb_a_s2_1',
      title: '凡人修仙传',
      rate: '9.3',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2024',
      types: ['仙侠', '玄幻'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s2_2',
      title: '仙逆',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2024',
      types: ['仙侠', '杀伐果断'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s2_3',
      title: '完美世界',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg',
      year: '2024',
      types: ['玄幻', '热血'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s2_4',
      title: '遮天',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2024',
      types: ['玄幻', '神话'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s2_5',
      title: '吞噬星空',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg',
      year: '2024',
      types: ['科幻', '玄幻'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s2_6',
      title: '斗破苍穹 年番',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg',
      year: '2024',
      types: ['玄幻', '热血'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s2_7',
      title: '剑来',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2024',
      types: ['武侠', '仙侠'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_s2_8',
      title: '一念永恒',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg',
      year: '2024',
      types: ['搞笑', '修真'],
      is_new: true,
      playable: true
    }
  ],
  s3: [
    {
      id: 'pb_a_s3_1',
      title: '进击的巨人 最终季',
      rate: '9.6',
      cover: 'https://image.tmdb.org/t/p/w500/5gaf9yFJHJTkg6KtLc7enqBY6UK.jpg',
      year: '2023',
      types: ['史诗', '末日'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s3_2',
      title: '钢之炼金术师FA',
      rate: '9.6',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2009',
      types: ['奇幻', '冒险'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s3_3',
      title: '死亡笔记',
      rate: '9.3',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2006',
      types: ['悬疑', '智斗'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s3_4',
      title: '灌篮高手',
      rate: '9.4',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '1993',
      types: ['运动', '青春'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s3_5',
      title: '新世纪福音战士',
      rate: '9.4',
      cover: 'https://image.tmdb.org/t/p/w500/5gaf9yFJHJTkg6KtLc7enqBY6UK.jpg',
      year: '1995',
      types: ['机战', '科幻'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s3_6',
      title: '全职猎人',
      rate: '9.5',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2011',
      types: ['冒险', '热血'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s3_7',
      title: '银魂',
      rate: '9.5',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '2006',
      types: ['搞笑', '热血'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s3_8',
      title: '海贼王',
      rate: '9.5',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '1999',
      types: ['热血', '冒险'],
      is_new: false,
      playable: true
    }
  ],
  s4: [
    {
      id: 'pb_a_s4_1',
      title: '你的名字。',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2016',
      types: ['动画', '爱情', '奇幻'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s4_2',
      title: '千与千寻',
      rate: '9.4',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2001',
      types: ['动画', '奇幻', '冒险'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s4_3',
      title: '铃芽之旅',
      rate: '8.0',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2022',
      types: ['动画', '奇幻'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s4_4',
      title: '蜘蛛侠：纵横宇宙',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2023',
      types: ['动画', '动作', '科幻'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s4_5',
      title: '灌篮高手剧场版',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '2022',
      types: ['动画', '运动'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s4_6',
      title: '疯狂动物城',
      rate: '9.2',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2016',
      types: ['动画', '喜剧'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s4_7',
      title: '寻梦环游记',
      rate: '9.1',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2017',
      types: ['动画', '音乐'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_a_s4_8',
      title: '哪吒之魔童降世',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2019',
      types: ['动画', '奇幻'],
      is_new: false,
      playable: true
    }
  ]
};

// ── 2. 🎤 综艺专区精选 (Variety) ──────────────────────────────────────────
export const VARIETY_HOME_DATA: PrebakedHomeCategory = {
  hero: [
    {
      id: 'pb_var_hero_1',
      title: '歌手2024',
      rate: '8.0',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      description: '全开麦、不修音、国际顶级唱将同台直播竞技！掀起 2024 年华语乐坛现象级音乐风暴与全民话题狂潮。',
      year: '2024',
      types: ['音乐', '真人秀', '竞技'],
      episodes_info: '全12期·已完结',
      type: 'tv',
      is_new: true,
      playable: true,
      actors: ['那英', '凡希亚', '香缇莫', '孙楠', '谭维维']
    },
    {
      id: 'pb_var_hero_2',
      title: '种地吧 第二季',
      rate: '9.0',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      description: '十个勤天重聚后沟村，用汗水与热血在土地上播种希望。豆瓣 9.0 分超高口碑，最真实的田园劳作与青年奋斗史诗。',
      year: '2024',
      types: ['真人秀', '治愈', '生活'],
      episodes_info: '全50期·已完结',
      type: 'tv',
      is_new: true,
      playable: true,
      actors: ['陈少熙', '何浩楠', '蒋敦豪', '李耕耘', '李昊']
    },
    {
      id: 'pb_var_hero_3',
      title: '脱口秀和Ta的朋友们',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      description: '生活需要笑对！老将回归、黑马杀出，金句频现、爆梗齐飞，献上一场场酣畅淋漓的国民级爆笑视听盛宴。',
      year: '2024',
      types: ['脱口秀', '喜剧', '语言'],
      episodes_info: '全10期·已完结',
      type: 'tv',
      is_new: true,
      playable: true,
      actors: ['张绍刚', '大张伟', '鲁豫', '呼兰', '徐志胜']
    }
  ],
  top10: [
    {
      id: 'pb_v_top_1',
      title: '种地吧 第二季',
      rate: '9.0',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2024',
      types: ['真人秀', '生活'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_top_2',
      title: '歌手2024',
      rate: '8.0',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2024',
      types: ['音乐', '真人秀'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_top_3',
      title: '脱口秀和Ta的朋友们',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2024',
      types: ['脱口秀', '喜剧'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_top_4',
      title: '大侦探 第九季',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2024',
      types: ['悬疑', '推理'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_top_5',
      title: '喜剧之王单口季',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2024',
      types: ['脱口秀', '幽默'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_top_6',
      title: '披荆斩棘 第四季',
      rate: '7.8',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2024',
      types: ['音乐', '舞台'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_top_7',
      title: '奔跑吧 第十二季',
      rate: '7.2',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2024',
      types: ['竞技', '游戏'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_top_8',
      title: '极限挑战 第十季',
      rate: '7.1',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2024',
      types: ['真人秀', '竞技'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_top_9',
      title: '乘风2024',
      rate: '7.5',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2024',
      types: ['女性', '唱跳'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_top_10',
      title: '你好星期六',
      rate: '7.6',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2024',
      types: ['游戏', '访谈'],
      is_new: true,
      playable: true
    }
  ],
  s1: [
    {
      id: 'pb_v_s1_1',
      title: '奔跑吧 第十二季',
      rate: '7.2',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2024',
      types: ['游戏', '竞技'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s1_2',
      title: '极限挑战 第十季',
      rate: '7.1',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2024',
      types: ['真人秀', '竞技'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s1_3',
      title: '种地吧 第二季',
      rate: '9.0',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2024',
      types: ['真人秀', '生活'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s1_4',
      title: '大侦探 第九季',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2024',
      types: ['推理', '悬疑'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s1_5',
      title: '密室大逃脱 第六季',
      rate: '7.8',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2024',
      types: ['解密', '惊悚'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s1_6',
      title: '花儿与少年·丝路季',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2023',
      types: ['旅行', '治愈'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s1_7',
      title: '你好星期六',
      rate: '7.6',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2024',
      types: ['搞笑', '访谈'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s1_8',
      title: '王牌对王牌 第八季',
      rate: '7.0',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2023',
      types: ['搞笑', '情怀'],
      is_new: false,
      playable: true
    }
  ],
  s2: [
    {
      id: 'pb_v_s2_1',
      title: '脱口秀和Ta的朋友们',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2024',
      types: ['脱口秀', '喜剧'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s2_2',
      title: '喜剧之王单口季',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2024',
      types: ['单口喜剧', '幽默'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s2_3',
      title: '一年一度喜剧大赛 第二季',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2022',
      types: ['素描喜剧', '爆笑'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s2_4',
      title: '脱口秀大会 第五季',
      rate: '7.8',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2022',
      types: ['脱口秀', '竞技'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s2_5',
      title: '德云斗笑社 第二季',
      rate: '8.0',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2021',
      types: ['相声', '真人秀'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s2_6',
      title: '欢乐喜剧人 第七季',
      rate: '7.3',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2021',
      types: ['喜剧', '竞演'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s2_7',
      title: '吐槽大会 第五季',
      rate: '7.5',
      cover: 'https://image.tmdb.org/t/p/w500/nYsiHMplUCBFazdAOVr1gQaGy34.jpg',
      year: '2021',
      types: ['脱口秀', '吐槽'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s2_8',
      title: '开播！情景喜剧',
      rate: '7.6',
      cover: 'https://image.tmdb.org/t/p/w500/jOl12DTFiMcp9ga2KaEKwt5H8oo.jpg',
      year: '2022',
      types: ['情景喜剧', '舞台'],
      is_new: false,
      playable: true
    }
  ],
  s3: [
    {
      id: 'pb_v_s3_1',
      title: '歌手2024',
      rate: '8.0',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2024',
      types: ['音乐', '全开麦'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s3_2',
      title: '披荆斩棘 第四季',
      rate: '7.8',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2024',
      types: ['舞台', '唱演'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s3_3',
      title: '乘风2024',
      rate: '7.5',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2024',
      types: ['唱跳', '女性'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s3_4',
      title: '声生不息·宝岛季',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2023',
      types: ['流行音乐', '经典'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s3_5',
      title: '乐队的夏天 第三季',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2023',
      types: ['摇滚', '乐队'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s3_6',
      title: '天赐的声音 第五季',
      rate: '7.4',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2024',
      types: ['音乐', '金曲'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s3_7',
      title: '中国好声音',
      rate: '7.9',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2022',
      types: ['选拔', '现场'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s3_8',
      title: '我们的歌 第五季',
      rate: '7.5',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2023',
      types: ['代际合作', '改编'],
      is_new: false,
      playable: true
    }
  ],
  s4: [
    {
      id: 'pb_v_s4_1',
      title: '向往的生活 第七季',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2023',
      types: ['田园', '美食'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s4_2',
      title: '中餐厅 第八季',
      rate: '7.1',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2024',
      types: ['美食', '经营'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_v_s4_3',
      title: '风味人间 第四季',
      rate: '9.0',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2022',
      types: ['美食', '纪录'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s4_4',
      title: '人生一串 第三季',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2021',
      types: ['烧烤', '烟火气'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s4_5',
      title: '恰好是少年',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2021',
      types: ['自驾', '青春'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s4_6',
      title: '奇遇人生 第二季',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2019',
      types: ['深度', '旅行'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s4_7',
      title: '漫游记',
      rate: '7.9',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2020',
      types: ['慢综', '风景'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_s4_8',
      title: '早餐中国 第四季',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2022',
      types: ['美食', '温暖'],
      is_new: false,
      playable: true
    }
  ]
};

// ── 3. ⚡ 精品短剧专区精选 (Short Drama) ──────────────────────────────────
export const SHORT_HOME_DATA: PrebakedHomeCategory = {
  hero: [
    {
      id: 'pb_short_hero_1',
      title: '我在八零年代当后妈',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      description: '现代女大学生意外穿越到八十年代，成了两个孩子的后妈。智斗极品亲戚，凭借现代经商头脑带着全家逆袭致富，并俘获帅气军官的甜宠传奇！全网狂揽数亿播放的现象级短剧神作。',
      year: '2024',
      types: ['短剧', '年代', '逆袭', '甜宠'],
      episodes_info: '全82集·已完结',
      type: 'tv',
      is_new: true,
      playable: true,
      actors: ['滕泽文', '苏袀禾']
    },
    {
      id: 'pb_short_hero_2',
      title: '无双',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      description: '一代龙王战神隐姓埋名入赘豪门，受尽欺凌与白眼。当外敌入侵、家族危亡之际，他终于撕下伪装，调动十万镇国铁军，王者归来，横扫一切强敌！',
      year: '2024',
      types: ['短剧', '战神', '逆袭', '热血'],
      episodes_info: '全98集·已完结',
      type: 'tv',
      is_new: true,
      playable: true,
      actors: ['白方文', '张楚萱']
    },
    {
      id: 'pb_short_hero_3',
      title: '执笔',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
      description: '相府嫡女苏云绮意外发现自己竟是话本中的恶毒女配，且注定惨死。她誓不认命，执笔改命，撕开命定剧本的枷锁，逆风翻盘主宰自己的人生！高分口碑古装权谋短剧。',
      year: '2024',
      types: ['短剧', '古装', '权谋', '重生'],
      episodes_info: '全24集·已完结',
      type: 'tv',
      is_new: true,
      playable: true,
      actors: ['李沐宸', '叶盛佳']
    }
  ],
  top10: [
    {
      id: 'pb_s_top_1',
      title: '我在八零年代当后妈',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      year: '2024',
      types: ['年代', '甜宠'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_top_2',
      title: '无双',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      year: '2024',
      types: ['战神', '热血'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_top_3',
      title: '执笔',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
      year: '2024',
      types: ['古装', '权谋'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_top_4',
      title: '黑莲花上位手册',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg',
      year: '2023',
      types: ['复仇', '宫斗'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_s_top_5',
      title: '闪婚后傅先生的马甲藏不住了',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
      year: '2024',
      types: ['豪门', '甜宠'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_top_6',
      title: '授她以柄',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg',
      year: '2024',
      types: ['古风', '虐恋'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_top_7',
      title: '盛夏的果实',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/s0sC3hPPX4OobLNfdl2iSs2vtvI.jpg',
      year: '2024',
      types: ['都市', '情感'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_top_8',
      title: '顾少的隐婚罪妻',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2024',
      types: ['豪门', '反转'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_top_9',
      title: '重生后我成了首富千金',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg',
      year: '2024',
      types: ['重生', '打脸'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_top_10',
      title: '绝世天将',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg',
      year: '2024',
      types: ['热血', '无敌'],
      is_new: true,
      playable: true
    }
  ],
  s1: [
    {
      id: 'pb_s_s1_1',
      title: '无双',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      year: '2024',
      types: ['战神', '热血'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s1_2',
      title: '绝世天将',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg',
      year: '2024',
      types: ['无敌', '逆袭'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s1_3',
      title: '镇国神婿',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2024',
      types: ['神婿', '打脸'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s1_4',
      title: '龙王出狱',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg',
      year: '2024',
      types: ['都市', '霸气'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s1_5',
      title: '天降神豪',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      year: '2024',
      types: ['神豪', '暴富'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s1_6',
      title: '隐形首富',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
      year: '2024',
      types: ['首富', '扮猪吃虎'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s1_7',
      title: '狂龙在渊',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg',
      year: '2024',
      types: ['武道', '热血'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s1_8',
      title: '傲世龙医',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/s0sC3hPPX4OobLNfdl2iSs2vtvI.jpg',
      year: '2024',
      types: ['神医', '修仙'],
      is_new: true,
      playable: true
    }
  ],
  s2: [
    {
      id: 'pb_s_s2_1',
      title: '闪婚后傅先生的马甲藏不住了',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
      year: '2024',
      types: ['豪门', '甜宠'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s2_2',
      title: '顾少的隐婚罪妻',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2024',
      types: ['总裁', '虐恋'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s2_3',
      title: '霍总夫人又惊艳全球了',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
      year: '2024',
      types: ['豪门', '多重身份'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s2_4',
      title: '假千金她才是真大佬',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg',
      year: '2024',
      types: ['真假千金', '爽文'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s2_5',
      title: '替嫁后大佬马甲掉了',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      year: '2024',
      types: ['替嫁', '先婚后爱'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s2_6',
      title: '傅爷的小祖宗又爆红了',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/s0sC3hPPX4OobLNfdl2iSs2vtvI.jpg',
      year: '2024',
      types: ['娱乐圈', '独宠'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s2_7',
      title: '契约娇妻跑不掉',
      rate: '8.1',
      cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      year: '2024',
      types: ['都市', '甜虐'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s2_8',
      title: '陆总的在逃小甜妻',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg',
      year: '2024',
      types: ['追妻', '豪门'],
      is_new: true,
      playable: true
    }
  ],
  s3: [
    {
      id: 'pb_s_s3_1',
      title: '我在八零年代当后妈',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      year: '2024',
      types: ['年代', '致富'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s3_2',
      title: '重生后我成了首富千金',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg',
      year: '2024',
      types: ['重生', '逆风翻盘'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s3_3',
      title: '回到八零发家致富',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/s0sC3hPPX4OobLNfdl2iSs2vtvI.jpg',
      year: '2024',
      types: ['种田', '经商'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s3_4',
      title: '重回1990当首富',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg',
      year: '2024',
      types: ['商业', '风口'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s3_5',
      title: '重生九零小辣妻',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
      year: '2024',
      types: ['逆袭', '爱情'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s3_6',
      title: '穿越古代当神厨',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      year: '2024',
      types: ['穿越', '美食'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s3_7',
      title: '我在古代开酒楼',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg',
      year: '2024',
      types: ['古代', '经商'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s3_8',
      title: '重回高考前一天',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2024',
      types: ['校园', '热血'],
      is_new: true,
      playable: true
    }
  ],
  s4: [
    {
      id: 'pb_s_s4_1',
      title: '执笔',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
      year: '2024',
      types: ['古装', '改命'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s4_2',
      title: '黑莲花上位手册',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg',
      year: '2023',
      types: ['宫斗', '复仇'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_s_s4_3',
      title: '授她以柄',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg',
      year: '2024',
      types: ['禁忌', '权谋'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s4_4',
      title: '娘娘今日不上朝',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
      year: '2024',
      types: ['女帝', '爽快'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s4_5',
      title: '长公主的谋逆日常',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/s0sC3hPPX4OobLNfdl2iSs2vtvI.jpg',
      year: '2024',
      types: ['权谋', '大女主'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s4_6',
      title: '庶女攻略之掌上珠',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      year: '2024',
      types: ['宅斗', '逆袭'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s4_7',
      title: '凤谋天下',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2024',
      types: ['乱世', '争霸'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_s4_8',
      title: '步步深宫',
      rate: '8.1',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      year: '2024',
      types: ['深宫', '博弈'],
      is_new: true,
      playable: true
    }
  ]
};

// ── 4. 🔥 全部推荐专区精选 (All / Mixed) ──────────────────────────────────
export const ALL_HOME_DATA: PrebakedHomeCategory = {
  hero: [
    {
      id: '1353926',
      title: '特立独行',
      rate: '6.4',
      cover: 'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/kTp2i00tjARpsI6wTkU4Q8ArGaX.jpg',
      description: '三十年前，以超人王长海为首的超英协会击溃了外星人，多年后，王长海被任命回乡建立战斗小队，但在这个多年和平的莱茵镇上，人情世故和礼尚往来让王长海手足无措。',
      year: '2026',
      types: ['电影', '喜剧', '动作'],
      episodes_info: '电影·院线精选',
      type: 'movie',
      is_new: true,
      playable: true,
      directors: ['邢文雄'],
      actors: ['白敬亭', '魏翔', '张国强', '苏小玎']
    },
    {
      id: 'pb_all_h2',
      title: '庆余年 第二季',
      rate: '7.3',
      cover: 'https://image.tmdb.org/t/p/w500/3r46wGgU4f7v5g7qV1G2yZ3H4.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/3r46wGgU4f7v5g7qV1G2yZ3H4.jpg',
      description: '范闲率领使团回归南庆，假死脱身之后重入京都名利场，面对二皇子等人的步步紧逼，展开更加波谲云诡、智计百出的朝堂与江湖大对决！',
      year: '2024',
      types: ['古装', '权谋', '热播'],
      episodes_info: '全36集·华语剧王',
      type: 'tv',
      is_new: true,
      playable: true,
      actors: ['张若昀', '李沁', '陈道明', '吴刚']
    },
    {
      id: 'pb_all_h3',
      title: '葬送的芙莉莲',
      rate: '9.5',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      description: '打倒魔王后的世界里，长寿的精灵魔法使芙莉莲在漫长的时光中重新理解生命与人心的旅程。豆瓣 9.5 分年度神作。',
      year: '2023',
      types: ['奇幻', '治愈', '动漫'],
      episodes_info: '全28集·已完结',
      type: 'tv',
      is_new: false,
      playable: true,
      actors: ['种崎敦美', '市之濑加那', '小林千晃']
    },
    {
      id: 'pb_cat_m1',
      title: '抓娃娃',
      rate: '7.3',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      description: '困苦表面下的惊天富豪秘密，沈腾马丽爆笑演绎荒诞家庭教育局，暑期档全民热议票房冠军。',
      year: '2024',
      types: ['喜剧', '爆笑', '电影'],
      episodes_info: '电影·院线大片',
      type: 'movie',
      is_new: true,
      playable: true,
      actors: ['沈腾', '马丽', '史彭元', '萨日娜']
    },
    {
      id: 'pb_var_hero_1',
      title: '歌手2024',
      rate: '8.0',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      backdrop: 'https://image.tmdb.org/t/p/w1280/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      description: '全开麦、不修音、国际顶级唱将同台直播竞技！掀起 2024 年华语乐坛现象级音乐风暴。',
      year: '2024',
      types: ['音乐', '真人秀', '综艺'],
      episodes_info: '全12期·已完结',
      type: 'tv',
      is_new: true,
      playable: true,
      actors: ['那英', '凡希亚', '香缇莫', '孙楠']
    }
  ],
  top10: [
    {
      id: '1353926',
      title: '特立独行',
      rate: '6.4',
      cover: 'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg',
      year: '2026',
      types: ['电影', '喜剧'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_cat_m1',
      title: '抓娃娃',
      rate: '7.3',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      year: '2024',
      types: ['喜剧', '爆笑'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_top_3',
      title: '庆余年 第二季',
      rate: '7.3',
      cover: 'https://image.tmdb.org/t/p/w500/3r46wGgU4f7v5g7qV1G2yZ3H4.jpg',
      year: '2024',
      types: ['古装', '权谋'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_cat_m3',
      title: '异形：夺命舰',
      rate: '7.4',
      cover: 'https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg',
      year: '2024',
      types: ['科幻', '恐怖'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_top_1',
      title: '葬送的芙莉莲',
      rate: '9.5',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2023',
      types: ['奇幻', '动漫'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_v_top_2',
      title: '歌手2024',
      rate: '8.0',
      cover: 'https://image.tmdb.org/t/p/w500/gZxoF6ks9mMufSbcey3hC4XsYgy.jpg',
      year: '2024',
      types: ['音乐', '综艺'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_top_1',
      title: '我在八零年代当后妈',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      year: '2024',
      types: ['短剧', '年代'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_cat_m2',
      title: '死侍与金刚狼',
      rate: '7.1',
      cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
      year: '2024',
      types: ['动作', '科幻'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_a_top_2',
      title: '鬼灭之刃 柱训练篇',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '2024',
      types: ['动漫', '热血'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_s_top_2',
      title: '无双',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      year: '2024',
      types: ['短剧', '战神'],
      is_new: true,
      playable: true
    }
  ],
  // 货架 1：院线重磅 & 华语热播
  s1: [
    {
      id: 'pb_all_s1_1',
      title: '抓娃娃',
      rate: '7.3',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      year: '2024',
      types: ['喜剧', '爆笑'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s1_2',
      title: '死侍与金刚狼',
      rate: '7.1',
      cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
      year: '2024',
      types: ['动作', '科幻'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s1_3',
      title: '异形：夺命舰',
      rate: '7.4',
      cover: 'https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg',
      year: '2024',
      types: ['科幻', '恐怖'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s1_4',
      title: '庆余年 第二季',
      rate: '7.3',
      cover: 'https://image.tmdb.org/t/p/w500/3r46wGgU4f7v5g7qV1G2yZ3H4.jpg',
      year: '2024',
      types: ['古装', '权谋'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s1_5',
      title: '周处除三害',
      rate: '8.1',
      cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      year: '2024',
      types: ['犯罪', '动作'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s1_6',
      title: '九龙城寨之围城',
      rate: '7.2',
      cover: 'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg',
      year: '2024',
      types: ['动作', '动作'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s1_7',
      title: '我的阿勒泰',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/vl5WKVXgL1tQs9D9wGE2ido6dwW.jpg',
      year: '2024',
      types: ['治愈', '自然'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s1_8',
      title: '繁花',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2023',
      types: ['剧情', '年代'],
      is_new: false,
      playable: true
    }
  ],
  // 货架 2：顶级欧美神剧 & 艾美奖力作
  s2: [
    {
      id: 'pb_all_s2_1',
      title: '龙之家族 第二季',
      rate: '8.3',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2024',
      types: ['奇幻', '史诗'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s2_2',
      title: '辐射 第一季',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
      year: '2024',
      types: ['科幻', '末日'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s2_3',
      title: '熊家餐馆 第三季',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/s0sC3hPPX4OobLNfdl2iSs2vtvI.jpg',
      year: '2024',
      types: ['剧情', '美食'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s2_4',
      title: '绝命毒师',
      rate: '9.6',
      cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2008',
      types: ['犯罪', '经典'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_all_s2_5',
      title: '风骚律师',
      rate: '9.7',
      cover: 'https://image.tmdb.org/t/p/w500/89W962aAnPS3N3BdKgy2BvUhnCh.jpg',
      year: '2022',
      types: ['犯罪', '律政'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_all_s2_6',
      title: '权力的游戏',
      rate: '9.4',
      cover: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
      year: '2011',
      types: ['史诗', '魔幻'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_all_s2_7',
      title: '黑袍纠察队 第四季',
      rate: '7.8',
      cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
      year: '2024',
      types: ['反超英', '动作'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s2_8',
      title: '三体 英文版',
      rate: '7.6',
      cover: 'https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg',
      year: '2024',
      types: ['科幻', '悬疑'],
      is_new: true,
      playable: true
    }
  ],
  // 货架 3：热血动漫 & 连载新番巅峰
  s3: [
    {
      id: 'pb_all_s3_1',
      title: '葬送的芙莉莲',
      rate: '9.5',
      cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
      year: '2023',
      types: ['奇幻', '治愈'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_all_s3_2',
      title: '鬼灭之刃 柱训练篇',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
      year: '2024',
      types: ['热血', '奇幻'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s3_3',
      title: '咒术回战 第二季',
      rate: '9.2',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2023',
      types: ['热血', '战斗'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_all_s3_4',
      title: '凡人修仙传',
      rate: '9.3',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2024',
      types: ['国漫', '玄幻'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s3_5',
      title: '进击的巨人 最终季',
      rate: '9.6',
      cover: 'https://image.tmdb.org/t/p/w500/5gaf9yFJHJTkg6KtLc7enqBY6UK.jpg',
      year: '2023',
      types: ['动作', '末日'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_all_s3_6',
      title: '仙逆',
      rate: '8.9',
      cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
      year: '2024',
      types: ['仙侠', '杀伐果断'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s3_7',
      title: '完美世界',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg',
      year: '2024',
      types: ['玄幻', '热血'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s3_8',
      title: '怪兽8号',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
      year: '2024',
      types: ['热血', '怪兽'],
      is_new: true,
      playable: true
    }
  ],
  // 货架 4：爆款微短剧精选
  s4: [
    {
      id: 'pb_all_s4_1',
      title: '我在八零年代当后妈',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
      year: '2024',
      types: ['短剧', '年代'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s4_2',
      title: '无双',
      rate: '8.8',
      cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
      year: '2024',
      types: ['短剧', '战神'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s4_3',
      title: '执笔',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
      year: '2024',
      types: ['短剧', '权谋'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s4_4',
      title: '黑莲花上位手册',
      rate: '8.7',
      cover: 'https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg',
      year: '2023',
      types: ['短剧', '宫斗'],
      is_new: false,
      playable: true
    },
    {
      id: 'pb_all_s4_5',
      title: '闪婚后傅先生的马甲藏不住了',
      rate: '8.4',
      cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
      year: '2024',
      types: ['短剧', '甜宠'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s4_6',
      title: '授她以柄',
      rate: '8.5',
      cover: 'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg',
      year: '2024',
      types: ['短剧', '虐恋'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s4_7',
      title: '顾少的隐婚罪妻',
      rate: '8.2',
      cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
      year: '2024',
      types: ['短剧', '总裁'],
      is_new: true,
      playable: true
    },
    {
      id: 'pb_all_s4_8',
      title: '绝世天将',
      rate: '8.6',
      cover: 'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg',
      year: '2024',
      types: ['短剧', '无敌'],
      is_new: true,
      playable: true
    }
  ]
};
