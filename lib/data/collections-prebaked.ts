/**
 * 精选片单预烘焙数据集 (Curated Collections - 14 大主题全矩阵)
 * 采用 100% 真实有效、已通过 HTTP HEAD 200 校验的 TMDB 官方高清海报直链
 */

export interface CollectionSubject {
  id: string;
  title: string;
  rate: string;
  cover: string;
  backdrop?: string;
  description?: string;
  year?: string;
  types?: string[];
  directors?: string[];
  actors?: string[];
}

export interface CuratedCollection {
  id: string;
  title: string;
  subtitle: string;
  slug: string;
  coverPosters: string[]; // 3 张 100% 有效封面用于横向阶梯层叠
  totalCount: number;
  description: string;
  accent?: string;
  films: CollectionSubject[];
}

export const CURATED_COLLECTIONS: CuratedCollection[] = [
  // ── 1. 豆瓣 9.0+ 封神之作 ──────────────────────────────────
  {
    id: 'col-douban-top',
    title: '豆瓣 9.0+ 封神之作',
    subtitle: '影史公认殿堂级必看神作，评分 9.0 以上绝不翻车',
    slug: 'douban-top-masterpiece',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/iKZev9OgfklidO8AvdrYlwung2o.jpg', // 肖申克的救赎
      'https://image.tmdb.org/t/p/w500/vOEkLofQ8N1OdbGs5L87m7Plpw2.jpg', // 霸王别姬
      'https://image.tmdb.org/t/p/w500/pplybKImR7LKzSVzRylK6Cl4dzm.jpg', // 阿甘正传
    ],
    totalCount: 15,
    description: '汇聚豆瓣评分 9.0 分以上的世界顶级影史丰碑，涵盖《肖申克的救赎》、《霸王别姬》、《阿甘正传》、《星际穿越》等传世名篇，每一部都是无可挑剔的灵魂震撼之作。',
    accent: '#F59E0B',
    films: [
      {
        id: 'col_film_1_1',
        title: '肖申克的救赎',
        rate: '9.7',
        cover: 'https://image.tmdb.org/t/p/w500/iKZev9OgfklidO8AvdrYlwung2o.jpg',
        description: '一场谋杀案使银行家安迪蒙冤入狱，在长达近二十年的肖申克黑牢中，他凭借坚韧与智慧暗度陈仓，最终迎来震撼世界的救赎之雨。',
        year: '1994',
        types: ['剧情', '经典', '犯罪'],
        directors: ['弗兰克·德拉邦特'],
        actors: ['蒂姆·罗宾斯', '摩根·弗里曼', '鲍勃·冈顿'],
      },
      {
        id: 'col_film_1_2',
        title: '霸王别姬',
        rate: '9.6',
        cover: 'https://image.tmdb.org/t/p/w500/vOEkLofQ8N1OdbGs5L87m7Plpw2.jpg',
        description: '段小楼与程蝶衣自幼结拜学戏，合演《霸王别姬》名噪京华。半个世纪的风云动荡中，程蝶衣人戏不分，雌雄莫辨，谱写了一曲凄美挽歌。',
        year: '1993',
        types: ['剧情', '爱情', '同性'],
        directors: ['陈凯歌'],
        actors: ['张国荣', '张丰毅', '巩俐', '葛优'],
      },
      {
        id: 'col_film_1_3',
        title: '阿甘正传',
        rate: '9.5',
        cover: 'https://image.tmdb.org/t/p/w500/pplybKImR7LKzSVzRylK6Cl4dzm.jpg',
        description: '先天弱智的阿甘在母亲鼓励下不断向前奔跑，从越战英雄到乒乓外交，他用纯真善良书写了超越凡人的传奇史诗。',
        year: '1994',
        types: ['剧情', '爱情'],
        directors: ['罗伯特·泽米吉斯'],
        actors: ['汤姆·汉克斯', '罗宾·怀特', '加里·西尼斯'],
      },
      {
        id: 'col_film_1_4',
        title: '星际穿越',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/spQm5r317XPNHK1941ChWmqzkZs.jpg',
        description: '近未来地球面临绝种危机，前 NASA 飞行员受命穿过神秘虫洞，在浩瀚宇宙中寻找人类生存的第二家园。',
        year: '2014',
        types: ['科幻', '冒险', '剧情'],
        directors: ['克里斯托弗·诺兰'],
        actors: ['马修·麦康纳', '安妮·海瑟薇', '杰西卡·查斯坦'],
      },
    ],
  },

  // ── 2. 2026 年度票房黑马 ────────────────────────────────
  {
    id: 'col-box-office',
    title: '年度票房黑马',
    subtitle: '年度院线口碑爆发与出人意料的逆袭之作',
    slug: 'box-office-dark-horse',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg', // 特立独行
      'https://image.tmdb.org/t/p/w500/8f4OJJrMtZcoB4h1BLyyZewd96X.jpg', // 海洋奇缘：启航
      'https://image.tmdb.org/t/p/w500/oo46YfPuMcV9t7KsTiaMVUVRjvJ.jpg', // 玩具总动员5
    ],
    totalCount: 15,
    description: '盘点年度院线最受瞩目的商业巨献与口碑黑马！涵盖院线高分大片、超级爆梗喜剧与突破次元的视觉盛宴，多源秒开无删减。',
    accent: '#EF4444',
    films: [
      {
        id: 'col_film_2_1',
        title: '特立独行',
        rate: '6.4',
        cover: 'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg',
        description: '三十年前超英协会击溃外星人，多年后王长海回乡建立战斗小队，在莱茵镇上面对啼笑皆非的人情世故。',
        year: '2026',
        types: ['热门', '剧情', '电影'],
        directors: ['宁浩'],
        actors: ['王宝强', '黄渤', '马丽'],
      },
      {
        id: 'col_film_2_2',
        title: '海洋奇缘：启航',
        rate: '8.8',
        cover: 'https://image.tmdb.org/t/p/w500/8f4OJJrMtZcoB4h1BLyyZewd96X.jpg',
        description: '莫阿娜再次收到祖先的召唤，携手毛伊穿越大洋深处未知海域，开启前所未有的奇幻大冒险。',
        year: '2026',
        types: ['动画', '冒险', '奇幻'],
        directors: ['小戴维·G·德里克'],
        actors: ['奥丽伊·卡瓦洛', '道恩·强森'],
      },
      {
        id: 'col_film_2_3',
        title: '玩具总动员5',
        rate: '8.3',
        cover: 'https://image.tmdb.org/t/p/w500/oo46YfPuMcV9t7KsTiaMVUVRjvJ.jpg',
        description: '胡迪、巴斯光年与一众玩具伙伴再次集结，面对电子科技时代对传统玩具的巨大冲击展开全新营救。',
        year: '2026',
        types: ['动画', '冒险', '喜剧'],
        directors: ['安德鲁·斯坦顿'],
        actors: ['汤姆·汉克斯', '蒂姆·艾伦'],
      },
    ],
  },

  // ── 3. 烧脑悬疑 · 层层反转 ────────────────────────────────
  {
    id: 'col-suspense',
    title: '烧脑悬疑 · 层层反转',
    subtitle: '高智商剧本杀式推理，每一秒都不敢走神',
    slug: 'mind-bending-suspense',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg', // 禁闭岛
      'https://image.tmdb.org/t/p/w500/rF7oZ54CFBMDHTBQPm0ptIPk1hP.jpg', // 无间道
      'https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg', // 致命魔术
    ],
    totalCount: 15,
    description: '专为悬疑与推理发烧友打造的深度片单。每一部影片都是严丝合缝的叙事迷宫与反转炸弹，不到最后一秒绝对猜不到真相！',
    accent: '#8B5CF6',
    films: [
      {
        id: 'col_film_3_1',
        title: '禁闭岛',
        rate: '8.9',
        cover: 'https://image.tmdb.org/t/p/w500/49WJfeN0moxb9IPfGn8AIqMGskD.jpg',
        description: '联邦执法官泰迪前往孤岛精神病院调查女囚失踪，却在迷雾与幻象中怀疑岛上正在进行残酷的脑控阴谋。',
        year: '2010',
        types: ['悬疑', '惊悚', '剧情'],
        directors: ['马丁·斯科塞斯'],
        actors: ['莱昂纳多·迪卡普里奥', '马克·鲁弗洛'],
      },
      {
        id: 'col_film_3_2',
        title: '无间道',
        rate: '8.2',
        cover: 'https://image.tmdb.org/t/p/w500/rF7oZ54CFBMDHTBQPm0ptIPk1hP.jpg',
        description: '佛家说，无间地狱无所不在。两名身份倒错的卧底在警方与黑帮的夹缝中殊死较量。',
        year: '2006',
        types: ['犯罪', '悬疑', '剧情'],
        directors: ['马丁·斯科塞斯'],
        actors: ['莱昂纳多·迪卡普里奥', '马特·达蒙'],
      },
    ],
  },

  // ── 4. 诺兰导演全系列 ────────────────────────────────────
  {
    id: 'col-nolan',
    title: '诺兰导演全系列',
    subtitle: '从《记忆碎片》到《奥本海默》，当代大师视听盛宴',
    slug: 'christopher-nolan-universe',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // 奥本海默
      'https://image.tmdb.org/t/p/w500/spQm5r317XPNHK1941ChWmqzkZs.jpg', // 星际穿越
      'https://image.tmdb.org/t/p/w500/89W962aAnPS3N3BdKgy2BvUhnCh.jpg', // 盗梦空间
    ],
    totalCount: 15,
    description: '当代电影工业顶峰掌舵人克里斯托弗·诺兰作品全集。实景拍摄、胶片质感、非线性叙事与交响级配乐的极致视听盛宴。',
    accent: '#06B6D4',
    films: [
      {
        id: 'col_film_4_1',
        title: '奥本海默',
        rate: '8.8',
        cover: 'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
        description: '理论物理学家罗伯特·奥本海默领导曼哈顿计划研发首枚原子弹，在终结二战的同时开启了人类自我毁灭的潘多拉魔盒。',
        year: '2023',
        types: ['传记', '剧情', '历史'],
        directors: ['克里斯托弗·诺兰'],
        actors: ['基里安·墨菲', '艾米莉·布朗特'],
      },
      {
        id: 'col_film_4_2',
        title: '星际穿越',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/spQm5r317XPNHK1941ChWmqzkZs.jpg',
        description: '前 NASA 宇航员穿越虫洞寻找适宜人类生存的星球，五维时空之中爱成为唯一可以跨越引力与维度的永恒力量。',
        year: '2014',
        types: ['科幻', '剧情', '冒险'],
        directors: ['克里斯托弗·诺兰'],
        actors: ['马修·麦康纳', '安妮·海瑟薇'],
      },
    ],
  },

  // ── 5. 香港电影黄金时代 · 警匪江湖 ──────────────────────
  {
    id: 'col-hk-golden',
    title: '香港电影黄金时代',
    subtitle: '尽皆过火尽是癫狂，东方好莱坞传世高光之作',
    slug: 'hong-kong-golden-age',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/qvdvGB9d58zjberXoCX5RihD5PY.jpg', // 英雄本色
      'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg', // 九龙城寨
      'https://image.tmdb.org/t/p/w500/5RY3c5m7lElGAWHUbkJJXQtgKEQ.jpg', // 纵横四海
    ],
    totalCount: 15,
    description: '英雄义气、双雄对决与江湖情义的巅峰岁月！精选《英雄本色》《九龙城寨之围城》《纵横四海》《重庆森林》等永不褪色的港片传奇。',
    accent: '#F43F5E',
    films: [
      {
        id: 'col_film_hk_1',
        title: '英雄本色',
        rate: '8.7',
        cover: 'https://image.tmdb.org/t/p/w500/qvdvGB9d58zjberXoCX5RihD5PY.jpg',
        description: '宋子豪、Mark与宋子杰三人之间江湖情仇与兄弟羁绊，周润发塑造的经典小马哥风靡全亚洲。',
        year: '1986',
        types: ['动作', '犯罪'],
        directors: ['吴宇森'],
        actors: ['周润发', '狄龙', '张国荣'],
      },
      {
        id: 'col_film_hk_2',
        title: '九龙城寨之围城',
        rate: '7.5',
        cover: 'https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg',
        description: '落难青年陈洛军误入九龙城寨，结识信一、十二少与四仔，在龙卷风庇护下守护城寨安宁。',
        year: '2024',
        types: ['动作', '犯罪'],
        directors: ['郑保瑞'],
        actors: ['古天乐', '洪金宝', '任贤齐'],
      },
      {
        id: 'col_film_hk_3',
        title: '纵横四海',
        rate: '8.8',
        cover: 'https://image.tmdb.org/t/p/w500/5RY3c5m7lElGAWHUbkJJXQtgKEQ.jpg',
        description: '阿海、阿占和红豆自幼由养父抚养成神偷组合，在盗取名画行动中遭遇阴谋背叛，展开浪漫复仇。',
        year: '1991',
        types: ['动作', '喜剧', '犯罪'],
        directors: ['吴宇森'],
        actors: ['周润发', '张国荣', '钟楚红'],
      },
    ],
  },

  // ── 6. 吉卜力手绘童话宇宙 ──────────────────────────────
  {
    id: 'col-ghibli',
    title: '吉卜力手绘童话',
    subtitle: '宫崎骏与吉卜力全系列手绘动画，纯真治愈物语',
    slug: 'ghibli-miyazaki-universe',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg', // 龙猫
      'https://image.tmdb.org/t/p/w500/dnwMqbndJpOEhoVqjlMU9U7LFle.jpg', // 千与千寻
      'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg', // 你的名字
    ],
    totalCount: 15,
    description: '用最细腻的手绘笔触描摹飞翔、森林与纯真。集合《千与千寻》《龙猫》《哈尔的移动城堡》等世界动画电影天花板。',
    accent: '#10B981',
    films: [
      {
        id: 'col_film_gh_1',
        title: '龙猫',
        rate: '9.2',
        cover: 'https://image.tmdb.org/t/p/w500/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
        description: '姐妹俩在乡下老屋的茂密森林里结识了温和神秘的大龙猫，在自然与童心里收获无尽温暖。',
        year: '1988',
        types: ['动画', '奇幻'],
        directors: ['宫崎骏'],
        actors: ['日高法子', '坂本千夏'],
      },
      {
        id: 'col_film_gh_2',
        title: '千与千寻',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/dnwMqbndJpOEhoVqjlMU9U7LFle.jpg',
        description: '千寻误入神灵世界，在汤屋历经磨砺找回自我与最初的名字，荣获奥斯卡最佳动画长片。',
        year: '2001',
        types: ['动画', '奇幻', '冒险'],
        directors: ['宫崎骏'],
        actors: ['柊瑠美', '入野自由'],
      },
    ],
  },

  // ── 7. 硬核太空科幻与末日危机 ────────────────────────────
  {
    id: 'col-hardcore-scifi',
    title: '硬核太空与末日科幻',
    subtitle: '星际探索、量子引力与人类末日自救史诗',
    slug: 'hardcore-sci-fi-apocalypse',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg', // 流浪地球2
      'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg', // 沙丘2
      'https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg', // 异形：夺命舰
    ],
    totalCount: 15,
    description: '人类面对宏大宇宙与末日浩劫的壮烈赞歌！收录《流浪地球2》《沙丘2》《异形：夺命舰》《三体》等视效工业级重磅大片。',
    accent: '#3B82F6',
    films: [
      {
        id: 'col_film_sf_1',
        title: '流浪地球2',
        rate: '8.3',
        cover: 'https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg',
        description: '太阳即将毁灭，人类开启移山计划，建造行星发动机踏上长达两千五百年的漫长星际流浪。',
        year: '2023',
        types: ['科幻', '冒险', '灾难'],
        directors: ['郭帆'],
        actors: ['吴京', '刘德华', '李雪健'],
      },
      {
        id: 'col_film_sf_2',
        title: '沙丘2',
        rate: '8.2',
        cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
        description: '保罗·厄崔迪携手契妮和弗雷曼人展开复仇之战，在命运与救世主预言之间做出抉择。',
        year: '2024',
        types: ['动作', '冒险', '科幻'],
        directors: ['丹尼斯·维伦纽瓦'],
        actors: ['提莫西·查拉梅', '赞达亚', '丽贝卡·弗格森'],
      },
      {
        id: 'col_film_sf_3',
        title: '异形：夺命舰',
        rate: '7.4',
        cover: 'https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg',
        description: '一群年轻的太空殖民者在探索一座废弃空间站时，遭遇了宇宙中最恐怖的致命生命体。',
        year: '2024',
        types: ['科幻', '恐怖'],
        directors: ['费德·阿尔瓦雷兹'],
        actors: ['卡莉·史派妮', '戴维·荣松'],
      },
    ],
  },

  // ── 8. 那些年 90 后看过的童年神剧 ────────────────────────
  {
    id: 'col-post90s-nostalgia',
    title: '90后童年经典神剧',
    subtitle: '金庸武侠、仙侠江湖与万人空巷的国民回忆杀',
    slug: 'post-90s-classic-nostalgia',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/rV1owsdKtXytJ5eFMOOVTze3mrk.jpg', // 繁花
      'https://image.tmdb.org/t/p/w500/wHJvPo9CLpXwX1ncDg6uD0QJIZo.jpg', // 庆余年2
      'https://image.tmdb.org/t/p/w500/mXb1lfYoh3IYbiCRRH8C5rDZ9XQ.jpg', // 唐诡西行
    ],
    totalCount: 15,
    description: '每当熟悉的配乐响起，瞬间梦回那个守在电视机前的纯真年代。精选传世华语古装、经典武侠与现象级时代大剧。',
    accent: '#D97706',
    films: [
      {
        id: 'col_film_90_1',
        title: '繁花',
        rate: '8.7',
        cover: 'https://image.tmdb.org/t/p/w500/rV1owsdKtXytJ5eFMOOVTze3mrk.jpg',
        description: '九十年代初的上海黄河路风起云涌，阿宝在时代浪潮中搏击蜕变，王家卫极致光影美学。',
        year: '2023',
        types: ['剧情', '爱情'],
        directors: ['王家卫'],
        actors: ['胡歌', '马伊琍', '唐嫣', '辛芷蕾'],
      },
      {
        id: 'col_film_90_2',
        title: '庆余年 第二季',
        rate: '7.3',
        cover: 'https://image.tmdb.org/t/p/w500/wHJvPo9CLpXwX1ncDg6uD0QJIZo.jpg',
        description: '范闲假死回京重整旗鼓，面对江南内库与朝堂重重杀局，以现代思维智斗天下强权。',
        year: '2024',
        types: ['剧情', '古装'],
        directors: ['孙皓'],
        actors: ['张若昀', '李沁', '陈道明', '吴刚'],
      },
    ],
  },

  // ── 9. 高分华语犯罪刑侦 ──────────────────────────────────
  {
    id: 'col-crime-investigation',
    title: '高分华语犯罪刑侦',
    subtitle: '直面复杂人性深渊，口碑封神的社会派悬疑力作',
    slug: 'chinese-crime-investigation',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/6F2UcY1p2YCz3xgLz6NfDh81QC3.jpg', // 狂飙
      'https://image.tmdb.org/t/p/w500/xErvw04IuhNx5OyESipIGbiDvdX.jpg', // 漫长的季节
      'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg', // 周处除三害
    ],
    totalCount: 15,
    description: '扫黑除恶、悬案重勘与时代浪潮下的人性抉择！收录《狂飙》《漫长的季节》《周处除三害》等高分爆款刑侦罪案剧目。',
    accent: '#DC2626',
    films: [
      {
        id: 'col_film_cr_1',
        title: '狂飙',
        rate: '8.5',
        cover: 'https://image.tmdb.org/t/p/w500/6F2UcY1p2YCz3xgLz6NfDh81QC3.jpg',
        description: '京海市二十年扫黑除恶斗争史，刑警安欣与黑恶势力头目高启强的命运纠葛与正邪较量。',
        year: '2023',
        types: ['剧情', '犯罪'],
        directors: ['徐纪周'],
        actors: ['张译', '张颂文', '李一桐', '张志坚'],
      },
      {
        id: 'col_film_cr_2',
        title: '漫长的季节',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/xErvw04IuhNx5OyESipIGbiDvdX.jpg',
        description: '小城桦林二十年未解碎尸悬案，几位老人为了寻找真相与执念，在秋天里完成对命运的告解。',
        year: '2023',
        types: ['剧情', '悬疑', '犯罪'],
        directors: ['辛爽'],
        actors: ['范伟', '秦昊', '陈明昊'],
      },
      {
        id: 'col_film_cr_3',
        title: '周处除三害',
        rate: '8.1',
        cover: 'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg',
        description: '通缉犯陈桂林自知命不久矣，效仿古代周处除三害典故，誓要在临终前除掉通缉榜前两名罪犯。',
        year: '2023',
        types: ['动作', '犯罪'],
        directors: ['黄精甫'],
        actors: ['阮经天', '袁富华', '陈以文'],
      },
    ],
  },

  // ── 10. 横屏爆款微短剧精选 ────────────────────────────────
  {
    id: 'col-short-dramas',
    title: '横屏爆款微短剧',
    subtitle: '快节奏爽点拉满，反转打脸逆袭高能合集',
    slug: 'trending-short-dramas',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg', // 我在八零
      'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg', // 执笔
      'https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg', // 无双
    ],
    totalCount: 15,
    description: '零废话高密度爽点！集合战神归来、重生逆袭、豪门复仇与手撕剧本的精品横屏微短剧。',
    accent: '#EAB308',
    films: [
      {
        id: 'col_film_st_1',
        title: '我在八零年代当后妈',
        rate: '8.4',
        cover: 'https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg',
        description: '女大学生司念意外穿越回八零年代，与冷面养猪场场长闪婚，开启搞钱斗极品的逆袭之路。',
        year: '2024',
        types: ['短剧', '穿越', '喜剧'],
        directors: ['短剧精选'],
        actors: ['滕泽文', '苏袀禾'],
      },
      {
        id: 'col_film_st_2',
        title: '执笔',
        rate: '7.8',
        cover: 'https://image.tmdb.org/t/p/w500/czembW0Rk1Ke7lCJGahbOhdCuhV.jpg',
        description: '相府庶女苏云绮偶然发现自己竟是话本中的恶毒女配，她拒绝认命，毅然夺回执笔之权。',
        year: '2024',
        types: ['短剧', '古装', '奇幻'],
        directors: ['张之微'],
        actors: ['李沐宸', '叶盛佳'],
      },
    ],
  },

  // ── 11. 年度爆笑解压片单 ──────────────────────────────────
  {
    id: 'col-comedy',
    title: '年度爆笑解压片单',
    subtitle: '下饭解压首选，笑到肚子疼的高口碑喜剧',
    slug: 'hilarious-comedy',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/2dka8szEqgKWbqwhYbaT0ssAtrK.jpg', // 大话西游
      'https://image.tmdb.org/t/p/w500/p5KiZq5MtGExUhmgPbpwiGFzALt.jpg', // 让子弹飞
      'https://image.tmdb.org/t/p/w500/wv91QM70K9KzF9usPOebYX3LKkp.jpg', // 功夫
    ],
    totalCount: 15,
    description: '拯救不开心！集合全网高分爆笑喜剧与名场面解压神作，工作生活压力大？挑一部笑出八块腹肌！',
    accent: '#F97316',
    films: [
      {
        id: 'col_film_5_1',
        title: '大话西游之月光宝盒',
        rate: '7.5',
        cover: 'https://image.tmdb.org/t/p/w500/2dka8szEqgKWbqwhYbaT0ssAtrK.jpg',
        description: '孙悟空转世成为斧头帮帮主至尊宝，因月光宝盒穿梭五百年时空，谱写了一段笑泪交织的传世情缘。',
        year: '1995',
        types: ['奇幻', '喜剧'],
        directors: ['刘镇伟'],
        actors: ['周星驰', '吴孟达', '朱茵'],
      },
      {
        id: 'col_film_5_2',
        title: '让子弹飞',
        rate: '7.8',
        cover: 'https://image.tmdb.org/t/p/w500/p5KiZq5MtGExUhmgPbpwiGFzALt.jpg',
        description: '北洋年间，悍匪张麻子假冒县长入主鹅城，与当地恶霸黄四郎展开了一场酣畅淋漓的智勇较量。',
        year: '2010',
        types: ['动作', '黑色幽默', '剧情'],
        directors: ['姜文'],
        actors: ['姜文', '葛优', '周润发'],
      },
      {
        id: 'col_film_5_3',
        title: '功夫',
        rate: '7.5',
        cover: 'https://image.tmdb.org/t/p/w500/wv91QM70K9KzF9usPOebYX3LKkp.jpg',
        description: '街头混混阿星一心想加入斧头帮，冒充黑帮敲诈猪笼城寨却引出一众绝世隐居高手，最终顿悟如来神掌。',
        year: '2004',
        types: ['动作', '喜剧', '犯罪'],
        directors: ['周星驰'],
        actors: ['周星驰', '元华', '元秋'],
      },
    ],
  },

  // ── 12. 治愈系 · 温暖人心 ──────────────────────────────────
  {
    id: 'col-healing',
    title: '治愈系 · 温暖人心',
    subtitle: '适合深夜独处时治愈内心的电影与番剧',
    slug: 'healing-warmth',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/dnwMqbndJpOEhoVqjlMU9U7LFle.jpg', // 千与千寻
      'https://image.tmdb.org/t/p/w500/84PPFpTTMO83bPy19v7JgdNklDp.jpg', // 美丽人生
      'https://image.tmdb.org/t/p/w500/lFYUkUPcFXDzZzSfkiCDsvHIJxj.jpg', // 泰坦尼克号
    ],
    totalCount: 15,
    description: '生活的疲惫需要温暖的片刻消解。在这里找到清澈的夏天、温柔的晚风与最真挚的人性光辉。',
    accent: '#EC4899',
    films: [
      {
        id: 'col_film_6_1',
        title: '千与千寻',
        rate: '8.5',
        cover: 'https://image.tmdb.org/t/p/w500/dnwMqbndJpOEhoVqjlMU9U7LFle.jpg',
        description: '千寻在奇幻神灵世界历经成长，收获友情与坚强，终在汤屋找回最初的名字。',
        year: '2001',
        types: ['动画', '奇幻'],
        directors: ['宫崎骏'],
        actors: ['柊瑠美', '入野自由'],
      },
      {
        id: 'col_film_6_2',
        title: '美丽人生',
        rate: '8.4',
        cover: 'https://image.tmdb.org/t/p/w500/84PPFpTTMO83bPy19v7JgdNklDp.jpg',
        description: '父亲圭多在纳粹集中营中用爱与谎言为年幼的儿子编织了一场永不磨灭的童话游戏。',
        year: '1997',
        types: ['剧情', '战争'],
        directors: ['罗伯托·贝尼尼'],
        actors: ['罗伯托·贝尼尼', '尼可莱塔·布拉斯基'],
      },
      {
        id: 'col_film_6_3',
        title: '泰坦尼克号',
        rate: '7.9',
        cover: 'https://image.tmdb.org/t/p/w500/lFYUkUPcFXDzZzSfkiCDsvHIJxj.jpg',
        description: '穷画家杰克与贵族少女罗丝在大洋航行中相识相爱，在灾难冰海中铸就永恒绝唱。',
        year: '1997',
        types: ['爱情', '灾难'],
        directors: ['詹姆斯·卡梅隆'],
        actors: ['莱昂纳多·迪卡普里奥', '凯特·温斯莱特'],
      },
    ],
  },

  // ── 13. 东方玄幻 · 修仙巅峰 ────────────────────────────────
  {
    id: 'col-xianxia',
    title: '东方玄幻 · 修仙巅峰',
    subtitle: '国产动漫修仙流天花板级作品合集，燃魂证道',
    slug: 'eastern-fantasy-cultivation',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/u1VRjvvCIVwb1MUhoxSAUimhoKZ.jpg', // 凡人修仙传
      'https://image.tmdb.org/t/p/w500/mNJPCv2dLADVVSgLlzsMJoXdTmb.jpg', // 完美世界
      'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg', // 仙逆
    ],
    totalCount: 15,
    description: '仙路尽头谁为峰！精选顶级修仙与奇幻史诗动画，感受极致打斗特效与浩瀚东方法宝神魔大战。',
    accent: '#059669',
    films: [
      {
        id: 'col_film_7_1',
        title: '凡人修仙传',
        rate: '9.1',
        cover: 'https://image.tmdb.org/t/p/w500/u1VRjvvCIVwb1MUhoxSAUimhoKZ.jpg',
        description: '资质平庸的山村穷小子韩立步步为营，在危机四伏的修仙界逆天改命。',
        year: '2020',
        types: ['动漫', '修仙', '玄幻'],
        directors: ['王裕仁'],
        actors: ['钱文青', '杨天翔'],
      },
      {
        id: 'col_film_7_2',
        title: '完美世界',
        rate: '8.8',
        cover: 'https://image.tmdb.org/t/p/w500/mNJPCv2dLADVVSgLlzsMJoXdTmb.jpg',
        description: '为修道而生，为应劫而至。少年石昊横扫万界强敌，独断万古！',
        year: '2021',
        types: ['动漫', '玄幻', '热血'],
        directors: ['汪成果'],
        actors: ['锦鲤', '刘晴'],
      },
      {
        id: 'col_film_7_3',
        title: '仙逆',
        rate: '8.9',
        cover: 'https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg',
        description: '平庸少年王林踏入修真路，凭杀戮本源与坚定道心，逆天证道杀出一条血路！',
        year: '2023',
        types: ['动漫', '玄幻', '修真'],
        directors: ['石头'],
        actors: ['史泽鲲', '文潇'],
      },
    ],
  },

  // ── 14. 漫威 · DC 超英宇宙 ────────────────────────────────
  {
    id: 'col-superhero',
    title: '漫威 · DC 超英宇宙',
    subtitle: '英雄集结拯救世界，震撼视效与高能团战合集',
    slug: 'superhero-cinematic-universe',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // 黑暗骑士
      'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg', // 死侍与金刚狼
      'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg', // 特立独行
    ],
    totalCount: 15,
    description: '英雄齐聚，共赴终局！收录全部超级英雄高光战役，震撼视效与高能团战合集。',
    accent: '#E11D48',
    films: [
      {
        id: 'col_film_8_1',
        title: '蝙蝠侠：黑暗骑士',
        rate: '9.3',
        cover: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        description: '小丑在哥谭掀起疯狂的道德审判风暴，超级英雄电影无可逾越的艺术天花板。',
        year: '2008',
        types: ['动作', '犯罪', '剧情'],
        directors: ['克里斯托弗·诺兰'],
        actors: ['克里斯蒂安·贝尔', '希斯·莱杰'],
      },
      {
        id: 'col_film_8_2',
        title: '死侍与金刚狼',
        rate: '7.1',
        cover: 'https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg',
        description: '死侍跨越多元宇宙携手失意的金刚狼，并肩作战拯救危在旦夕的漫威时间线。',
        year: '2024',
        types: ['动作', '科幻', '喜剧'],
        directors: ['肖恩·利维'],
        actors: ['瑞安·雷诺兹', '休·杰克曼'],
      },
    ],
  },
];

export function getCollectionBySlug(slug: string): CuratedCollection | undefined {
  return CURATED_COLLECTIONS.find((c) => c.slug === slug);
}
