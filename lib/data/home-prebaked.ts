/**
 * 首页首屏预烘焙精选影视数据集 (Pre-baked Instant Dataset for 0ms Page Load)
 * 全部采用 100% 真实有效官方 TMDB 全球 CDN 高清原画海报直链（免代理防盗链，全球秒开，永不失效）
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
        cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['喜剧']
      },
      {
        id: 'pb_m_2',
        title: '死侍与金刚狼',
        rate: '7.1',
        cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动作', '科幻', '喜剧']
      },
      {
        id: 'pb_m_3',
        title: '异形：夺命舰',
        rate: '7.4',
        cover: 'https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['科幻', '惊悚', '恐怖']
      },
      {
        id: 'pb_m_4',
        title: '九龙城寨之围城',
        rate: '7.5',
        cover: 'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动作', '犯罪']
      },
      {
        id: 'pb_m_5',
        title: '沙丘2',
        rate: '8.2',
        cover: 'https://image.tmdb.org/t/p/w500/9uaCR4HEZqxUqgORq0uZqTNm43G.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动作', '科幻', '冒险']
      },
      {
        id: 'pb_m_6',
        title: '默杀',
        rate: '6.5',
        cover: 'https://image.tmdb.org/t/p/w500/uKThqY2oRYSHOPxYryTp2550fuZ.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['悬疑', '犯罪']
      },
      {
        id: 'pb_m_7',
        title: '白蛇：浮生',
        rate: '7.0',
        cover: 'https://image.tmdb.org/t/p/w500/mTszIRmU7zKm4Nl03uEhlcQ5Dkz.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动画', '奇幻', '爱情']
      },
      {
        id: 'pb_m_8',
        title: '逆行人生',
        rate: '6.8',
        cover: 'https://image.tmdb.org/t/p/w500/lEYQtKfNDyxr1ozwu2YYUTU8ZOD.jpg',
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
        cover: 'https://image.tmdb.org/t/p/w500/iKZev9OgfklidO8AvdrYlwung2o.jpg',
        year: '1994',
        playable: true,
        types: ['剧情', '犯罪']
      },
      {
        id: 'pb_m_10',
        title: '霸王别姬',
        rate: '9.6',
        cover: 'https://image.tmdb.org/t/p/w500/vOEkLofQ8N1OdbGs5L87m7Plpw2.jpg',
        year: '1993',
        playable: true,
        types: ['剧情', '爱情']
      },
      {
        id: 'pb_m_11',
        title: '阿甘正传',
        rate: '9.5',
        cover: 'https://image.tmdb.org/t/p/w500/pplybKImR7LKzSVzRylK6Cl4dzm.jpg',
        year: '1994',
        playable: true,
        types: ['剧情', '爱情']
      },
      {
        id: 'pb_m_12',
        title: '泰坦尼克号',
        rate: '9.5',
        cover: 'https://image.tmdb.org/t/p/w500/lFYUkUPcFXDzZzSfkiCDsvHIJxj.jpg',
        year: '1997',
        playable: true,
        types: ['剧情', '爱情', '灾难']
      },
      {
        id: 'pb_m_13',
        title: '星际穿越',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/spQm5r317XPNHK1941ChWmqzkZs.jpg',
        year: '2014',
        playable: true,
        types: ['科幻', '冒险']
      },
      {
        id: 'pb_m_14',
        title: '盗梦空间',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/89W962aAnPS3N3BdKgy2BvUhnCh.jpg',
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
        cover: 'https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg',
        year: '2023',
        playable: true,
        types: ['科幻', '冒险']
      },
      {
        id: 'pb_m_16',
        title: '封神第一部：朝歌风云',
        rate: '7.8',
        cover: 'https://image.tmdb.org/t/p/w500/8fzJZQhmkLyZeXdZUi1eE2ZKhkm.jpg',
        year: '2023',
        playable: true,
        types: ['动作', '战争', '奇幻']
      },
      {
        id: 'pb_m_17',
        title: '让子弹飞',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/p5KiZq5MtGExUhmgPbpwiGFzALt.jpg',
        year: '2010',
        playable: true,
        types: ['剧情', '喜剧', '动作']
      },
      {
        id: 'pb_m_18',
        title: '无间道',
        rate: '9.3',
        cover: 'https://image.tmdb.org/t/p/w500/rF7oZ54CFBMDHTBQPm0ptIPk1hP.jpg',
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
        cover: 'https://image.tmdb.org/t/p/w500/a6v21Mgz2w6OQL7ezkQxGbGA92W.jpg',
        year: '2023',
        playable: true,
        types: ['传记', '历史', '剧情']
      },
      {
        id: 'pb_m_20',
        title: '阿凡达：水之道',
        rate: '7.8',
        cover: 'https://image.tmdb.org/t/p/w500/az6FndKaR11uuxnRQucKJ2mmglg.jpg',
        year: '2022',
        playable: true,
        types: ['动作', '科幻', '冒险']
      },
      {
        id: 'pb_m_21',
        title: '复仇者联盟4：终局之战',
        rate: '8.5',
        cover: 'https://image.tmdb.org/t/p/w500/wXyZYO6BKDh8Evf80DF80VzKcz3.jpg',
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
        cover: 'https://image.tmdb.org/t/p/w500/wHJvPo9CLpXwX1ncDg6uD0QJIZo.jpg',
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
        cover: 'https://image.tmdb.org/t/p/w500/rV1owsdKtXytJ5eFMOOVTze3mrk.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全30集完结',
        types: ['剧情', '年代']
      },
      {
        id: 'pb_t_3',
        title: '狂飙',
        rate: '8.5',
        cover: 'https://image.tmdb.org/t/p/w500/6F2UcY1p2YCz3xgLz6NfDh81QC3.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全39集完结',
        types: ['剧情', '犯罪']
      },
      {
        id: 'pb_t_4',
        title: '漫长的季节',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/tJLiKDYdfMskFkJXV1HnaQAdpGf.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全12集完结',
        types: ['悬疑', '生活']
      },
      {
        id: 'pb_t_5',
        title: '三体',
        rate: '8.7',
        cover: 'https://image.tmdb.org/t/p/w500/q2sNliRi4j0ncXKUO1x0MldR20A.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全30集完结',
        types: ['科幻', '悬疑']
      },
      {
        id: 'pb_t_6',
        title: '去有风的地方',
        rate: '8.7',
        cover: 'https://image.tmdb.org/t/p/w500/qaYfoLzWtOLaVoNvOeNBZYIjo1V.jpg',
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
        cover: 'https://image.tmdb.org/t/p/w500/rqliuvX7NdknSHu5qaSDfESplQi.jpg',
        year: '2013',
        playable: true,
        episodes_info: '神作完结',
        types: ['犯罪', '剧情']
      },
      {
        id: 'pb_t_8',
        title: '权力的游戏 第八季',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/6fJ7Gql9rD4C3X1uW2zinlkNwvw.jpg',
        year: '2019',
        playable: true,
        episodes_info: '全集',
        types: ['奇幻', '史诗']
      },
      {
        id: 'pb_t_9',
        title: '怪奇物语 第四季',
        rate: '9.2',
        cover: 'https://image.tmdb.org/t/p/w500/iTvTODru3s8A4eGqVZzALcipIft.jpg',
        year: '2022',
        playable: true,
        episodes_info: '全9集',
        types: ['科幻', '恐怖']
      },
      {
        id: 'pb_t_10',
        title: '最后生还者 第一季',
        rate: '9.1',
        cover: 'https://image.tmdb.org/t/p/w500/ydyTjqxZsPlcFSTBNY2INYrmEvk.jpg',
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
        cover: 'https://image.tmdb.org/t/p/w500/4ANJBZETwHOmtofE5D0QjpCWB9w.jpg',
        year: '2022',
        playable: true,
        episodes_info: '复仇神作',
        types: ['复仇', '悬疑']
      },
      {
        id: 'pb_t_12',
        title: '泪之女王',
        rate: '8.0',
        cover: 'https://image.tmdb.org/t/p/w500/fFKmhXGukOoi50tDvqSHxz4dmcc.jpg',
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
        cover: 'https://image.tmdb.org/t/p/w500/cX068rNsLNFnRCTNbqqARhwbhug.jpg',
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
        cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全28集完结',
        types: ['动画', '治愈', '奇幻']
      },
      {
        id: 'pb_t_15',
        title: '咒术回战 第二季',
        rate: '9.0',
        cover: 'https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg',
        year: '2023',
        playable: true,
        episodes_info: '涩谷事变篇',
        types: ['动画', '热血', '动作']
      },
      {
        id: 'pb_t_16',
        title: '鬼灭之刃 柱训练篇',
        rate: '8.4',
        cover: 'https://image.tmdb.org/t/p/w500/tZ0yGfG4EIox7bYJTxAtqUhoOmR.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        episodes_info: '全8集完结',
        types: ['动画', '动作', '奇幻']
      }
    ]
  }
};
