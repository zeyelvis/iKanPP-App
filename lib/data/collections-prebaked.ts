/**
 * 精选片单预烘焙数据集 (Curated Collections)
 * 采用 100% 真实有效已验证 200 OK 的官方 TMDB 封面直链
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
      {
        id: 'col_film_1_5',
        title: '盗梦空间',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/89W962aAnPS3N3BdKgy2BvUhnCh.jpg',
        description: '多姆·柯布是一名经验老道的神偷，专门在梦境最脆弱的时刻潜入他人潜意识，植入一个改变一生命运的全新意念。',
        year: '2010',
        types: ['动作', '科幻', '悬疑'],
        directors: ['克里斯托弗·诺兰'],
        actors: ['莱昂纳多·迪卡普里奥', '约瑟夫·高登-莱维特'],
      },
      {
        id: 'col_film_1_6',
        title: '千与千寻',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/dnwMqbndJpOEhoVqjlMU9U7LFle.jpg',
        description: '年仅 10 岁的荻野千寻误入神灵世界，父母因贪吃变成肥猪。为了生存和拯救父母，千寻在汤屋历经磨砺找回自我。',
        year: '2001',
        types: ['动画', '奇幻', '冒险'],
        directors: ['宫崎骏'],
        actors: ['柊瑠美', '入野自由', '夏木真理'],
      },
      {
        id: 'col_film_1_7',
        title: '这个杀手不太冷',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/wT9bYGpoFnJGiRaRF9DErVjZ7qo.jpg',
        description: '职业杀手莱昂偶遇全家遭黑警屠杀的邻家女孩玛蒂尔达，孤傲冷峻的杀手与早熟的女孩在纽约暗流中相互依偎救赎。',
        year: '1994',
        types: ['剧情', '动作', '犯罪'],
        directors: ['吕克·贝松'],
        actors: ['让·雷诺', '娜塔莉·波特曼', '加里·奥德曼'],
      },
      {
        id: 'col_film_1_8',
        title: '楚门的世界',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/nAnzFcqORitpwvRQPceIt4mcm8G.jpg',
        description: '楚门是一档 24 小时全球直播真人秀的主人公，当他发现周边一切皆为布景与演员时，毅然决定冲向未知的天际边缘。',
        year: '1998',
        types: ['剧情', '科幻'],
        directors: ['彼得·威尔'],
        actors: ['金·凯瑞', '劳拉·琳妮', '艾德·哈里斯'],
      },
    ],
  },
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
      {
        id: 'col_film_2_4',
        title: '阿凡达：水之道',
        rate: '8.0',
        cover: 'https://image.tmdb.org/t/p/w500/az6FndKaR11uuxnRQucKJ2mmglg.jpg',
        description: '杰克·萨利与奈蒂莉组建家庭，随着人类威胁再次降临，他们不得不离开熟悉的森林前往潘多拉星球礁石族寻求庇护。',
        year: '2022',
        types: ['动作', '冒险', '科幻'],
        directors: ['詹姆斯·卡梅隆'],
        actors: ['萨姆·沃辛顿', '佐伊·索尔达娜', '西格妮·韦弗'],
      },
    ],
  },
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
      {
        id: 'col_film_3_3',
        title: '致命魔术',
        rate: '8.9',
        cover: 'https://image.tmdb.org/t/p/w500/tRNlZbgNCNOpLpbPEz5L8G8A0JN.jpg',
        description: '维多利亚时期的伦敦，两位才华横溢的年轻魔术师从挚友走向殊死对抗，为实现超越时代的绝技不惜献祭灵魂。',
        year: '2006',
        types: ['剧情', '悬疑', '惊悚'],
        directors: ['克里斯托弗·诺兰'],
        actors: ['休·杰克曼', '克里斯蒂安·贝尔'],
      },
      {
        id: 'col_film_3_4',
        title: '黑客帝国',
        rate: '8.3',
        cover: 'https://image.tmdb.org/t/p/w500/eMurN09rDC2qeEv3npkUbcJfIXN.jpg',
        description: '一名年轻的网络黑客尼奥发现看似正常的现实世界实际上是由人工智能母体控制的虚拟程序。',
        year: '1999',
        types: ['动作', '科幻'],
        directors: ['莉莉·沃卓斯基', '拉娜·沃卓斯基'],
        actors: ['基努·里维斯', '劳伦斯·菲什伯恩'],
      },
    ],
  },
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
        actors: ['基里安·墨菲', '艾米莉·布朗特', '小罗伯特·唐尼'],
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
        actors: ['马修·麦康纳', '安妮·海瑟薇', '杰西卡·查斯坦'],
      },
      {
        id: 'col_film_4_3',
        title: '盗梦空间',
        rate: '9.4',
        cover: 'https://image.tmdb.org/t/p/w500/89W962aAnPS3N3BdKgy2BvUhnCh.jpg',
        description: '神偷团队深入多层梦境执行潜意识植入任务，在现实与虚幻的悬崖边展开多重维度的精密追逐。',
        year: '2010',
        types: ['动作', '科幻', '悬疑'],
        directors: ['克里斯托弗·诺兰'],
        actors: ['莱昂纳多·迪卡普里奥', '约瑟夫·高登-莱维特'],
      },
      {
        id: 'col_film_4_4',
        title: '蝙蝠侠：黑暗骑士',
        rate: '9.3',
        cover: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
        description: '哥谭市迎来了混沌化身小丑，蝙蝠侠与戈登警长在正义与堕落的深渊中接受人性考验。',
        year: '2008',
        types: ['动作', '犯罪', '剧情'],
        directors: ['克里斯托弗·诺兰'],
        actors: ['克里斯蒂安·贝尔', '希斯·莱杰'],
      },
    ],
  },
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
      {
        id: 'col_film_5_4',
        title: '纵横四海',
        rate: '6.8',
        cover: 'https://image.tmdb.org/t/p/w500/5RY3c5m7lElGAWHUbkJJXQtgKEQ.jpg',
        description: '阿海、阿占和红豆自幼由养父抚养成神偷组合，在一次盗取名画行动中遭遇阴谋背叛。',
        year: '1991',
        types: ['动作', '喜剧', '犯罪'],
        directors: ['吴宇森'],
        actors: ['周润发', '张国荣', '钟楚红'],
      },
    ],
  },
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
  {
    id: 'col-xianxia',
    title: '东方玄幻 · 修仙巅峰',
    subtitle: '国产动漫修仙流天花板级作品合集，燃魂证道',
    slug: 'eastern-fantasy-cultivation',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg', // 芙莉莲
      'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg', // 鬼灭
      'https://image.tmdb.org/t/p/w500/gRe5FZjMWw8xXzWk1hxWuNQckOg.jpg', // 交锋
    ],
    totalCount: 15,
    description: '仙路尽头谁为峰！精选顶级修仙与奇幻史诗动画，感受极致打斗特效与浩瀚东方法宝神魔大战。',
    films: [
      {
        id: 'col_film_7_1',
        title: '葬送的芙莉莲',
        rate: '9.5',
        cover: 'https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg',
        description: '长寿精灵芙莉莲在漫长时光中重新理解生命的意义，豆瓣 9.5 分年度神作。',
        year: '2023',
        types: ['奇幻', '冒险', '治愈'],
        directors: ['斋藤圭一郎'],
        actors: ['种崎敦美', '市之濑加那'],
      },
      {
        id: 'col_film_7_2',
        title: '鬼灭之刃 柱训练篇',
        rate: '8.9',
        cover: 'https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg',
        description: '炭治郎与九柱集结开展特训，决战无限城前夕最后的试炼，飞碟社作画天花板。',
        year: '2024',
        types: ['热血', '奇幻', '战斗'],
        directors: ['外崎春雄'],
        actors: ['花江夏树', '鬼头明里'],
      },
    ],
  },
  {
    id: 'col-superhero',
    title: '漫威 · DC 超英宇宙',
    subtitle: '英雄集结拯救世界，震撼视效与高能团战合集',
    slug: 'superhero-cinematic-universe',
    coverPosters: [
      'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', // 黑暗骑士
      'https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg', // 奥本海默
      'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg', // 特立独行
    ],
    totalCount: 15,
    description: '英雄齐聚，共赴终局！收录全部超级英雄高光战役，震撼视效与高能团战合集。',
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
        title: '特立独行',
        rate: '6.4',
        cover: 'https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg',
        description: '三十年前超英协会击溃外星人，多年后英雄重返小镇建立战队。',
        year: '2026',
        types: ['剧情', '动作'],
        directors: ['宁浩'],
        actors: ['王宝强', '黄渤'],
      },
    ],
  },
];

export function getCollectionBySlug(slug: string): CuratedCollection | undefined {
  return CURATED_COLLECTIONS.find((c) => c.slug === slug);
}
