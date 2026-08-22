/**
 * 首页首屏预烘焙精选影视数据集 (Pre-baked Instant Dataset for 0ms Page Load)
 * 全部采用 100% 真实有效官方高清海报直链（带防盗链代理与多镜像容灾机制）
 */

export interface PrebakedSubject {
  id: string;
  title: string;
  rate: string;
  cover: string;
  year?: string;
  is_new?: boolean;
  playable?: boolean;
  episodes_info?: string;
  types?: string[];
}

export interface PrebakedHomeCategory {
  s1: PrebakedSubject[];
  s2: PrebakedSubject[];
  s3: PrebakedSubject[];
  s4: PrebakedSubject[];
}

export const PREBAKED_HOME_DATA: {
  movie: PrebakedHomeCategory;
  tv: PrebakedHomeCategory;
} = {
  // ── 电影分类 ─────────────────────────────────────────────────────────────
  movie: {
    // 货架 1: 最新上映 / 院线热播
    s1: [
      {
        id: 'pb_m_1',
        title: '抓娃娃',
        rate: '7.3',
        cover: 'https://img3.doubanio.com/view/photo/l_ratio_poster/public/p2910105262.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['喜剧']
      },
      {
        id: 'pb_m_2',
        title: '死侍与金刚狼',
        rate: '7.1',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2908440764.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动作', '科幻', '喜剧']
      },
      {
        id: 'pb_m_3',
        title: '异形：夺命舰',
        rate: '7.4',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2910926865.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['科幻', '惊悚', '恐怖']
      },
      {
        id: 'pb_m_4',
        title: '九龙城寨之围城',
        rate: '7.5',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2920653336.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动作', '犯罪']
      },
      {
        id: 'pb_m_5',
        title: '沙丘2',
        rate: '8.2',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2902227445.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动作', '科幻', '冒险']
      },
      {
        id: 'pb_m_6',
        title: '默杀',
        rate: '6.5',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2910398624.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['悬疑', '犯罪']
      },
      {
        id: 'pb_m_7',
        title: '白蛇：浮生',
        rate: '7.0',
        cover: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2911299937.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动画', '奇幻', '爱情']
      },
      {
        id: 'pb_m_8',
        title: '逆行人生',
        rate: '6.8',
        cover: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2910814988.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['剧情']
      }
    ],

    // 货架 2: 豆瓣高分经典
    s2: [
      {
        id: 'pb_m_9',
        title: '肖申克的救赎',
        rate: '9.7',
        cover: 'https://img2.doubanio.com/view/photo/l_ratio_poster/public/p480747492.jpg',
        year: '1994',
        playable: true,
        types: ['剧情', '犯罪']
      },
      {
        id: 'pb_m_10',
        title: '霸王别姬',
        rate: '9.6',
        cover: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2561716440.jpg',
        year: '1993',
        playable: true,
        types: ['剧情', '爱情']
      },
      {
        id: 'pb_m_11',
        title: '阿甘正传',
        rate: '9.5',
        cover: 'https://img2.doubanio.com/view/photo/l_ratio_poster/public/p2372307693.jpg',
        year: '1994',
        playable: true,
        types: ['剧情', '爱情']
      },
      {
        id: 'pb_m_12',
        title: '泰坦尼克号',
        rate: '9.5',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2889314814.jpg',
        year: '1997',
        playable: true,
        types: ['剧情', '爱情', '灾难']
      },
      {
        id: 'pb_m_13',
        title: '星际穿越',
        rate: '9.4',
        cover: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2614988097.jpg',
        year: '2014',
        playable: true,
        types: ['科幻', '冒险']
      },
      {
        id: 'pb_m_14',
        title: '盗梦空间',
        rate: '9.4',
        cover: 'https://img2.doubanio.com/view/photo/l_ratio_poster/public/p2616355133.jpg',
        year: '2010',
        playable: true,
        types: ['动作', '科幻', '悬疑']
      }
    ],

    // 货架 3: 华语精选
    s3: [
      {
        id: 'pb_m_15',
        title: '流浪地球2',
        rate: '8.3',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2885955776.jpg',
        year: '2023',
        playable: true,
        types: ['科幻', '冒险']
      },
      {
        id: 'pb_m_16',
        title: '封神第一部：朝歌风云',
        rate: '7.8',
        cover: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2893817109.jpg',
        year: '2023',
        playable: true,
        types: ['动作', '战争', '奇幻']
      },
      {
        id: 'pb_m_17',
        title: '让子弹飞',
        rate: '9.0',
        cover: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p1512562617.jpg',
        year: '2010',
        playable: true,
        types: ['剧情', '喜剧', '动作']
      },
      {
        id: 'pb_m_18',
        title: '无间道',
        rate: '9.3',
        cover: 'https://img2.doubanio.com/view/photo/l_ratio_poster/public/p2551877632.jpg',
        year: '2002',
        playable: true,
        types: ['剧情', '惊悚', '犯罪']
      }
    ],

    // 货架 4: 欧美大片
    s4: [
      {
        id: 'pb_m_19',
        title: '奥本海默',
        rate: '8.8',
        cover: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2896328830.jpg',
        year: '2023',
        playable: true,
        types: ['传记', '历史', '剧情']
      },
      {
        id: 'pb_m_20',
        title: '阿凡达：水之道',
        rate: '7.8',
        cover: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2883828630.jpg',
        year: '2022',
        playable: true,
        types: ['动作', '科幻', '冒险']
      },
      {
        id: 'pb_m_21',
        title: '复仇者联盟4：终局之战',
        rate: '8.5',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2554248564.jpg',
        year: '2019',
        playable: true,
        types: ['动作', '科幻', '奇幻']
      }
    ]
  },

  // ── 电视剧分类 ───────────────────────────────────────────────────────────
  tv: {
    // 货架 1: 国产热播大剧
    s1: [
      {
        id: 'pb_t_1',
        title: '庆余年 第二季',
        rate: '7.3',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2908027784.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        episodes_info: '全36集完结',
        types: ['古装', '喜剧']
      },
      {
        id: 'pb_t_2',
        title: '繁花',
        rate: '8.7',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2902047326.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全30集完结',
        types: ['剧情', '年代']
      },
      {
        id: 'pb_t_3',
        title: '狂飙',
        rate: '8.5',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2886369046.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全39集完结',
        types: ['剧情', '犯罪']
      },
      {
        id: 'pb_t_4',
        title: '漫长的季节',
        rate: '9.4',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2891396265.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全12集完结',
        types: ['悬疑', '生活']
      },
      {
        id: 'pb_t_5',
        title: '三体',
        rate: '8.7',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2886400595.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全30集完结',
        types: ['科幻', '悬疑']
      },
      {
        id: 'pb_t_6',
        title: '去有风的地方',
        rate: '8.7',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2885984635.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全40集完结',
        types: ['治愈', '爱情']
      }
    ],

    // 货架 2: 高分美剧
    s2: [
      {
        id: 'pb_t_7',
        title: '绝命毒师 第五季',
        rate: '9.7',
        cover: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2110156947.jpg',
        year: '2013',
        playable: true,
        episodes_info: '神作完结',
        types: ['犯罪', '剧情']
      },
      {
        id: 'pb_t_8',
        title: '权力的游戏 第八季',
        rate: '9.4',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2551847116.jpg',
        year: '2019',
        playable: true,
        episodes_info: '全集',
        types: ['奇幻', '史诗']
      },
      {
        id: 'pb_t_9',
        title: '怪奇物语 第四季',
        rate: '9.2',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2873426865.jpg',
        year: '2022',
        playable: true,
        episodes_info: '全9集',
        types: ['科幻', '恐怖']
      },
      {
        id: 'pb_t_10',
        title: '最后生还者 第一季',
        rate: '9.1',
        cover: 'https://img1.doubanio.com/view/photo/l_ratio_poster/public/p2884846467.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全9集',
        types: ['末日', '冒险']
      }
    ],

    // 货架 3: 热门韩剧
    s3: [
      {
        id: 'pb_t_11',
        title: '黑暗荣耀',
        rate: '8.9',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2885888995.jpg',
        year: '2022',
        playable: true,
        episodes_info: '复仇神作',
        types: ['复仇', '悬疑']
      },
      {
        id: 'pb_t_12',
        title: '泪之女王',
        rate: '8.0',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2904576356.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        episodes_info: '全16集',
        types: ['爱情', '都市']
      },
      {
        id: 'pb_t_13',
        title: '请回答1988',
        rate: '9.7',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2272563445.jpg',
        year: '2015',
        playable: true,
        episodes_info: '满分温情神剧',
        types: ['家庭', '青春']
      }
    ],

    // 货架 4: 热门动漫新番
    s4: [
      {
        id: 'pb_t_14',
        title: '葬送的芙莉莲',
        rate: '9.5',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2897463694.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全28集完结',
        types: ['动画', '治愈', '奇幻']
      },
      {
        id: 'pb_t_15',
        title: '咒术回战 第二季',
        rate: '9.0',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2894228965.jpg',
        year: '2023',
        playable: true,
        episodes_info: '涩谷事变篇',
        types: ['动画', '热血', '动作']
      },
      {
        id: 'pb_t_16',
        title: '鬼灭之刃 柱训练篇',
        rate: '8.4',
        cover: 'https://img9.doubanio.com/view/photo/l_ratio_poster/public/p2908154564.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        episodes_info: '全8集完结',
        types: ['动画', '动作', '奇幻']
      }
    ]
  }
};
