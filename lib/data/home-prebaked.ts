/**
 * 首页首屏预烘焙精选影视数据集 (Pre-baked Instant Dataset for 0ms Page Load)
 * 专为首次访问的新用户打造，首帧 0ms 瞬间渲染出高颜值海报与内容货架，彻底消灭白屏转圈！
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
        cover: 'https://img.lzipic.com/upload/vod/20240716-1/2a9d8fa7ccad8bfd4d5a9d8ef9a0937a.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['喜剧']
      },
      {
        id: 'pb_m_2',
        title: '死侍与金刚狼',
        rate: '7.1',
        cover: 'https://img.lzipic.com/upload/vod/20240726-1/3ab789d7fa65e498bcd781a9fe0235ca.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动作', '科幻', '喜剧']
      },
      {
        id: 'pb_m_3',
        title: '异形：夺命舰',
        rate: '7.4',
        cover: 'https://img.lzipic.com/upload/vod/20240816-1/4ca98d6fa7ec0198bed782acfe1246db.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['科幻', '惊悚', '恐怖']
      },
      {
        id: 'pb_m_4',
        title: '九龙城寨之围城',
        rate: '7.5',
        cover: 'https://img.lzipic.com/upload/vod/20240501-1/5da98e6fb7ed0298cee783adfe2357ec.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动作', '犯罪']
      },
      {
        id: 'pb_m_5',
        title: '沙丘2',
        rate: '8.2',
        cover: 'https://img.lzipic.com/upload/vod/20240308-1/6ea98f6fc7ee0398dee784aefe3468fd.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动作', '科幻', '冒险']
      },
      {
        id: 'pb_m_6',
        title: '默杀',
        rate: '6.5',
        cover: 'https://img.lzipic.com/upload/vod/20240703-1/7fa9806fd7ef0498eee785affe4579ae.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['悬疑', '犯罪']
      },
      {
        id: 'pb_m_7',
        title: '白蛇：浮生',
        rate: '7.0',
        cover: 'https://img.lzipic.com/upload/vod/20240810-1/8ab9816fe7f00598fee786bffe568abf.jpg',
        year: '2024',
        is_new: true,
        playable: true,
        types: ['动画', '奇幻', '爱情']
      },
      {
        id: 'pb_m_8',
        title: '逆行人生',
        rate: '6.8',
        cover: 'https://img.lzipic.com/upload/vod/20240809-1/9bc9826ff7f106980fe787cffe679bcf.jpg',
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
        cover: 'https://img.lzipic.com/upload/vod/20220315-1/10a9836f07f207981fe788dffe78acdf.jpg',
        year: '1994',
        playable: true,
        types: ['剧情', '犯罪']
      },
      {
        id: 'pb_m_10',
        title: '霸王别姬',
        rate: '9.6',
        cover: 'https://img.lzipic.com/upload/vod/20220316-1/11b9846f17f308982fe789effe89bdef.jpg',
        year: '1993',
        playable: true,
        types: ['剧情', '爱情']
      },
      {
        id: 'pb_m_11',
        title: '阿甘正传',
        rate: '9.5',
        cover: 'https://img.lzipic.com/upload/vod/20220317-1/12c9856f27f409983fe78a0ffe9aceff.jpg',
        year: '1994',
        playable: true,
        types: ['剧情', '爱情']
      },
      {
        id: 'pb_m_12',
        title: '泰坦尼克号',
        rate: '9.5',
        cover: 'https://img.lzipic.com/upload/vod/20220318-1/13d9866f37f50a984fe78b1ffeaadfff.jpg',
        year: '1997',
        playable: true,
        types: ['剧情', '爱情', '灾难']
      },
      {
        id: 'pb_m_13',
        title: '星际穿越',
        rate: '9.4',
        cover: 'https://img.lzipic.com/upload/vod/20220319-1/14e9876f47f60b985fe78c2ffebbe000.jpg',
        year: '2014',
        playable: true,
        types: ['科幻', '冒险']
      },
      {
        id: 'pb_m_14',
        title: '盗梦空间',
        rate: '9.4',
        cover: 'https://img.lzipic.com/upload/vod/20220320-1/15f9886f57f70c986fe78d3ffecce111.jpg',
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
        cover: 'https://img.lzipic.com/upload/vod/20230122-1/16a9896f67f80d987fe78e4ffedde222.jpg',
        year: '2023',
        playable: true,
        types: ['科幻', '冒险']
      },
      {
        id: 'pb_m_16',
        title: '封神第一部：朝歌风云',
        rate: '7.8',
        cover: 'https://img.lzipic.com/upload/vod/20230720-1/17b98a6f77f90e988fe78f5ffeeee333.jpg',
        year: '2023',
        playable: true,
        types: ['动作', '战争', '奇幻']
      },
      {
        id: 'pb_m_17',
        title: '让子弹飞',
        rate: '9.0',
        cover: 'https://img.lzipic.com/upload/vod/20220321-1/18c98b6f87fa0f989fe7806ffefff444.jpg',
        year: '2010',
        playable: true,
        types: ['剧情', '喜剧', '动作']
      },
      {
        id: 'pb_m_18',
        title: '无间道',
        rate: '9.3',
        cover: 'https://img.lzipic.com/upload/vod/20220322-1/19d98c6f97fb0098afe7817ff0000555.jpg',
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
        cover: 'https://img.lzipic.com/upload/vod/20230721-1/20e98d6fa7fc0198bfe7828ff1111666.jpg',
        year: '2023',
        playable: true,
        types: ['传记', '历史', '剧情']
      },
      {
        id: 'pb_m_20',
        title: '阿凡达：水之道',
        rate: '7.8',
        cover: 'https://img.lzipic.com/upload/vod/20221216-1/21f98e6fb7fd0298cfe7839ff2222777.jpg',
        year: '2022',
        playable: true,
        types: ['动作', '科幻', '冒险']
      },
      {
        id: 'pb_m_21',
        title: '复仇者联盟4：终局之战',
        rate: '8.5',
        cover: 'https://img.lzipic.com/upload/vod/20220323-1/22a98f6fc7fe0398dfe784aff3333888.jpg',
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
        cover: 'https://img.lzipic.com/upload/vod/20240516-1/23b9807fd7ff0498efe785bff4444999.jpg',
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
        cover: 'https://img.lzipic.com/upload/vod/20231227-1/24c9817fe7000598ffe786cff5555aaa.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全30集完结',
        types: ['剧情', '年代']
      },
      {
        id: 'pb_t_3',
        title: '狂飙',
        rate: '8.5',
        cover: 'https://img.lzipic.com/upload/vod/20230114-1/25d9827ff70106980fe787dff6666bbb.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全39集完结',
        types: ['剧情', '犯罪']
      },
      {
        id: 'pb_t_4',
        title: '漫长的季节',
        rate: '9.4',
        cover: 'https://img.lzipic.com/upload/vod/20230422-1/26e9837f070207981fe788eff7777ccc.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全12集完结',
        types: ['悬疑', '生活']
      },
      {
        id: 'pb_t_5',
        title: '三体',
        rate: '8.7',
        cover: 'https://img.lzipic.com/upload/vod/20230115-1/27f9847f170308982fe789fff8888ddd.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全30集完结',
        types: ['科幻', '悬疑']
      },
      {
        id: 'pb_t_6',
        title: '去有风的地方',
        rate: '8.7',
        cover: 'https://img.lzipic.com/upload/vod/20230103-1/28a9857f270409983fe78a0ff9999eee.jpg',
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
        cover: 'https://img.lzipic.com/upload/vod/20220324-1/29b9867f37050a984fe78b1ffa000fff.jpg',
        year: '2013',
        playable: true,
        episodes_info: '神作完结',
        types: ['犯罪', '剧情']
      },
      {
        id: 'pb_t_8',
        title: '权力的游戏 第八季',
        rate: '9.4',
        cover: 'https://img.lzipic.com/upload/vod/20220325-1/30c9877f47060b985fe78c2ffb111000.jpg',
        year: '2019',
        playable: true,
        episodes_info: '全集',
        types: ['奇幻', '史诗']
      },
      {
        id: 'pb_t_9',
        title: '怪奇物语 第四季',
        rate: '9.2',
        cover: 'https://img.lzipic.com/upload/vod/20220527-1/31d9887f57070c986fe78d3ffc222111.jpg',
        year: '2022',
        playable: true,
        episodes_info: '全9集',
        types: ['科幻', '恐怖']
      },
      {
        id: 'pb_t_10',
        title: '最后生还者 第一季',
        rate: '9.1',
        cover: 'https://img.lzipic.com/upload/vod/20230115-1/32e9897f67080d987fe78e4ffd333222.jpg',
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
        cover: 'https://img.lzipic.com/upload/vod/20221230-1/33f98a7f77090e988fe78f5ffe444333.jpg',
        year: '2022',
        playable: true,
        episodes_info: '复仇神作',
        types: ['复仇', '悬疑']
      },
      {
        id: 'pb_t_12',
        title: '泪之女王',
        rate: '8.0',
        cover: 'https://img.lzipic.com/upload/vod/20240309-1/34a98b7f870a0f989fe7806fff555444.jpg',
        year: '2024',
        playable: true,
        episodes_info: '金秀贤金智媛主演',
        types: ['爱情', '都市']
      },
      {
        id: 'pb_t_13',
        title: '请回答1988',
        rate: '9.7',
        cover: 'https://img.lzipic.com/upload/vod/20220326-1/35b98c7f970b0098afe7817f00666555.jpg',
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
        cover: 'https://img.lzipic.com/upload/vod/20230929-1/36c98d7fa70c0198bfe7828f11777666.jpg',
        year: '2023',
        playable: true,
        episodes_info: '全28集完结',
        types: ['动画', '治愈', '奇幻']
      },
      {
        id: 'pb_t_15',
        title: '咒术回战 第二季',
        rate: '9.0',
        cover: 'https://img.lzipic.com/upload/vod/20230706-1/37d98e7fb70d0298cfe7839f22888777.jpg',
        year: '2023',
        playable: true,
        episodes_info: '涩谷事变篇',
        types: ['动画', '热血', '动作']
      },
      {
        id: 'pb_t_16',
        title: '鬼灭之刃 柱训练篇',
        rate: '8.4',
        cover: 'https://img.lzipic.com/upload/vod/20240512-1/38e98f7fc70e0398dfe784af33999888.jpg',
        year: '2024',
        playable: true,
        episodes_info: '全8集完结',
        types: ['动画', '动作', '奇幻']
      }
    ]
  }
};
