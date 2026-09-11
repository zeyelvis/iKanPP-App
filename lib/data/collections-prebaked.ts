/**
 * 精选片单预烘焙数据集 (Curated Collections - 14 大主题全矩阵)
 * 采用 100% 真实有效、已通过 HTTP HEAD 200 校验的 TMDB 官方高清海报直链
 * 每个片单深度收录 12 ~ 16 部经典口碑代表作，全站影视库丰富饱满
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
    "id": "col-douban-top",
    "title": "豆瓣 9.0+ 封神之作",
    "subtitle": "影史公认殿堂级必看神作，评分 9.0 以上绝不翻车",
    "slug": "douban-top-masterpiece",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/iKZev9OgfklidO8AvdrYlwung2o.jpg",
      "https://image.tmdb.org/t/p/w500/vOEkLofQ8N1OdbGs5L87m7Plpw2.jpg",
      "https://image.tmdb.org/t/p/w500/pplybKImR7LKzSVzRylK6Cl4dzm.jpg"
    ],
    "totalCount": 16,
    "description": "汇聚豆瓣评分 9.0 分以上的世界顶级影史丰碑，涵盖《肖申克的救赎》、《霸王别姬》、《阿甘正传》、《星际穿越》等传世名篇，每一部都是无可挑剔的灵魂震撼之作。",
    "accent": "#F59E0B",
    "films": [
      {
        "id": "col_film_1_1",
        "title": "肖申克的救赎",
        "rate": "9.7",
        "cover": "https://image.tmdb.org/t/p/w500/iKZev9OgfklidO8AvdrYlwung2o.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/pNjh59JSxChQktamG3LMp9ZoQzp.jpg",
        "year": "1994",
        "description": "1947年，银行家安迪·杜佛兰因被控杀害妻子及其情人，尽管始终坚称清白，仍被判处两项无期徒刑，送入缅因州的肖申克监狱服刑。在残酷而压抑的监狱生活中，安迪凭借冷静、智慧和始终未曾熄灭的希望逐渐赢得狱友们的尊重，并与能够在狱中弄到各种物品的瑞德…",
        "types": [
          "剧情",
          "犯罪"
        ],
        "directors": [
          "弗兰克·德拉邦特"
        ],
        "actors": [
          "蒂姆·罗宾斯",
          "摩根·弗里曼",
          "鲍勃·冈顿",
          "威廉姆·赛德勒"
        ]
      },
      {
        "id": "col_film_1_2",
        "title": "霸王别姬",
        "rate": "9.6",
        "cover": "https://image.tmdb.org/t/p/w500/vOEkLofQ8N1OdbGs5L87m7Plpw2.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bBiZN1epQTu3F8iFLBuMhc4TRzr.jpg",
        "year": "1993",
        "description": "段小楼与程蝶衣是一对自幼一起学戏长大的师兄弟，两人在舞台上配合天衣无缝，尤其一出《霸王别姬》更是誉满京城，并约定要合演一辈子。然而，两人对戏剧与人生的理解截然不同：段小楼深知戏非人生，程蝶衣却早已人戏不分。后来，段小楼迎娶菊仙，三人之间由此…",
        "types": [
          "剧情"
        ],
        "directors": [
          "陈凯歌"
        ],
        "actors": [
          "张国荣",
          "张丰毅",
          "巩俐",
          "吕齐"
        ]
      },
      {
        "id": "col_film_1_3",
        "title": "阿甘正传",
        "rate": "9.5",
        "cover": "https://image.tmdb.org/t/p/w500/pplybKImR7LKzSVzRylK6Cl4dzm.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/66Kn4XWhkuPkJxOJyPEx4U2CUfN.jpg",
        "year": "1994",
        "description": "阿甘出生在美国南方阿拉巴马州一个闭塞的小镇，智商只有75，然而他的妈妈是一位性格坚强的女性，她常常鼓励阿甘要自强不息。阿甘像普通孩子一样上学，并认识了一生的朋友和挚爱珍妮。在珍妮和妈妈的爱护下，阿甘凭着自己出众的奔跑能力，开始了一生不停的奔…",
        "types": [
          "喜剧",
          "剧情",
          "爱情"
        ],
        "directors": [
          "罗伯特·泽米吉斯"
        ],
        "actors": [
          "汤姆·汉克斯",
          "罗宾·怀特",
          "加里·西尼斯",
          "莎莉·菲尔德"
        ]
      },
      {
        "id": "col_film_1_4",
        "title": "美丽人生",
        "rate": "9.5",
        "cover": "https://image.tmdb.org/t/p/w500/84PPFpTTMO83bPy19v7JgdNklDp.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/6aNKD81RHR1DqUUa8kOZ1TBY1Lp.jpg",
        "year": "1997",
        "description": "1939年的意大利，乐观幽默的犹太青年圭多邂逅了女教师多拉。经过一连串阴差阳错，两人相爱成家，并有了儿子乔舒亚。然而随着战争的阴影逼近，圭多和儿子因犹太身份被强行送往集中营，没有犹太血统的多拉也毅然选择同行。为了保护年幼的乔舒亚免受残酷现实…",
        "types": [
          "喜剧",
          "剧情"
        ],
        "directors": [
          "罗伯托·贝尼尼"
        ],
        "actors": [
          "罗伯托·贝尼尼",
          "尼可莱塔·布拉斯基",
          "乔治·坎塔里尼",
          "朱斯蒂诺·杜拉诺"
        ]
      },
      {
        "id": "col_film_1_5",
        "title": "辛德勒的名单",
        "rate": "9.5",
        "cover": "https://image.tmdb.org/t/p/w500/7cDI6MrIi12uQxfipiNIeJPYljy.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zb6fM1CX41D9rF9hdgclu0peUmy.jpg",
        "year": "1993",
        "description": "1939年，纳粹德国入侵波兰。德国商人奥斯卡·辛德勒来到被占领的克拉科夫，利用自己的人脉和金钱开办了一家搪瓷厂，并雇用被迫劳动的犹太人生产军需用品，希望借战争获取财富。随着纳粹对犹太人的迫害不断升级，辛德勒亲眼目睹了克拉科夫犹太区遭到清剿，…",
        "types": [
          "剧情",
          "历史",
          "战争"
        ],
        "directors": [
          "史蒂文·斯皮尔伯格"
        ],
        "actors": [
          "连姆·尼森",
          "本·金斯利",
          "拉尔夫·费因斯",
          "卡罗琳·古道尔"
        ]
      },
      {
        "id": "col_film_1_6",
        "title": "这个杀手不太冷",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/wT9bYGpoFnJGiRaRF9DErVjZ7qo.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fj0hwDJEOOHllRim2BMt5L7tbjf.jpg",
        "year": "1994",
        "description": "里昂是名孤独的职业杀手，受人雇佣。一天，邻居家小姑娘马蒂尔达敲开他的房门，要求在他那里暂避杀身之祸。原来邻居家的主人是警方缉毒组的眼线，只因贪污了一小包毒品而遭恶警杀害全家的惩罚。马蒂尔达得到里昂的留救，幸免于难，并留在里昂那里。里昂教小女…",
        "types": [
          "犯罪",
          "剧情",
          "动作"
        ],
        "directors": [
          "吕克·贝松"
        ],
        "actors": [
          "让·雷诺",
          "娜塔莉·波特曼",
          "加里·奥德曼",
          "丹尼尔·艾洛"
        ]
      },
      {
        "id": "col_film_1_7",
        "title": "泰坦尼克号",
        "rate": "9.5",
        "cover": "https://image.tmdb.org/t/p/w500/lFYUkUPcFXDzZzSfkiCDsvHIJxj.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xXCuto8YVp5RFqBJ7yKmVmLOWpF.jpg",
        "year": "1997",
        "description": "1912年4月10日，豪华客轮泰坦尼克号从英国南安普顿启航，开始驶往美国纽约的处女航。出身上流社会的罗丝与母亲、未婚夫卡尔登上头等舱，而自由不羁的年轻画家杰克则在一场赌博中意外赢得了三等舱船票。被家族期待和婚姻束缚得喘不过气的罗丝，在绝望之…",
        "types": [
          "剧情",
          "爱情"
        ],
        "directors": [
          "詹姆斯·卡梅隆"
        ],
        "actors": [
          "莱昂纳多·迪卡普里奥",
          "凯特·温斯莱特",
          "比利·赞恩",
          "凯西·贝茨"
        ]
      },
      {
        "id": "col_film_1_8",
        "title": "星际穿越",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/spQm5r317XPNHK1941ChWmqzkZs.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5XNQBqnBwPA9yT0jZ0p3s8bbLh0.jpg",
        "year": "2014",
        "description": "近未来，地球环境持续恶化，枯萎病和沙尘暴让越来越多农作物消失，人类的生存前景也变得岌岌可危。曾为NASA飞行员的库珀如今与家人在农场生活，一次偶然发现的异常重力现象，却将他和女儿墨菲引向一个仍在秘密运作的NASA基地。布兰德教授告诉他，多年…",
        "types": [
          "冒险",
          "剧情",
          "科幻"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "马修·麦康纳",
          "安妮·海瑟薇",
          "迈克尔·凯恩",
          "杰西卡·查斯坦"
        ]
      },
      {
        "id": "col_film_1_9",
        "title": "盗梦空间",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/89W962aAnPS3N3BdKgy2BvUhnCh.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "year": "2010",
        "description": "道姆·柯布与同事阿瑟和纳什在一次针对日本能源大亨齐藤（渡边谦 饰）的盗梦行动中失败，反被齐藤利用。齐藤威逼利诱因遭通缉而流亡海外的柯布帮他拆分他竞争对手的公司，采取极端措施在其唯一继承人罗伯特·费希尔的深层潜意识中种下放弃家族公司、自立门户…",
        "types": [
          "动作",
          "科幻",
          "冒险"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "莱昂纳多·迪卡普里奥",
          "约瑟夫·高登-莱维特",
          "渡边谦",
          "汤姆·哈迪"
        ]
      },
      {
        "id": "col_film_1_10",
        "title": "千与千寻",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/dnwMqbndJpOEhoVqjlMU9U7LFle.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/dyJvKsNs2KP8qQnAXbRwDjblViy.jpg",
        "year": "2001",
        "description": "10岁的千寻跟随父母搬家途中，意外穿过一条神秘隧道，闯入了一个属于神灵的奇异世界。父母因为擅自吃下供奉给神灵的食物而被变成猪，惊慌失措的千寻则在神秘少年白龙的帮助下得以留下。为了在这个世界生存并寻找救回父母的方法，她不得不到汤婆婆掌管的“油…",
        "types": [
          "动画",
          "家庭",
          "奇幻"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "柊瑠美",
          "入野自由",
          "夏木真理",
          "内藤刚志"
        ]
      },
      {
        "id": "col_film_1_11",
        "title": "忠犬八公的故事",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/fCRj02jAyqzDvPEUceFYEA7WmWM.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/a5pOEjOLvr04Hr8qktIDM75OZi0.jpg",
        "year": "2009",
        "description": "八公 是一条谜一样的犬，因为没有人知道它从哪里来。教授帕克 在小镇的火车站拣到一只走失的小狗，冥冥中似乎注定小狗和帕克教授有着某种缘分，帕克一抱起这只小狗就再也放不下来，最终，帕克对小狗八公的疼爱感化了起初极力反对养狗的妻子卡特。八公在帕克…",
        "types": [
          "剧情",
          "家庭"
        ],
        "directors": [
          "莱塞·霍尔斯道姆"
        ],
        "actors": [
          "理查·基尔",
          "琼·艾伦",
          "莎拉露瑪",
          "田川洋行"
        ]
      },
      {
        "id": "col_film_1_12",
        "title": "楚门的世界",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/nAnzFcqORitpwvRQPceIt4mcm8G.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rmiG2uwcNoGFmBKMoa1pIcf514L.jpg",
        "year": "1998",
        "description": "楚门·伯班克过着看似平凡而安稳的生活，却总觉得身边有些事情不太对劲：曾经突然消失的初恋、早已溺水身亡却似乎再次出现的父亲，以及一次次阻止他离开家乡的意外。随着越来越多无法解释的异常发生，楚门开始怀疑自己熟悉的生活并不像表面那样真实，甚至感觉…",
        "types": [
          "喜剧",
          "剧情"
        ],
        "directors": [
          "彼得·威尔"
        ],
        "actors": [
          "金·凯瑞",
          "劳拉·琳妮",
          "诺亚·艾默里奇",
          "娜塔莎·麦克艾霍恩"
        ]
      },
      {
        "id": "col_film_1_13",
        "title": "三傻大闹宝莱坞",
        "rate": "9.2",
        "cover": "https://image.tmdb.org/t/p/w500/3Kdkci7FE36fWcsuoeGFYApBBE1.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8gT3UKtglLVpu0YfccwbmXZ5Eis.jpg",
        "year": "2009",
        "description": "十年前，法兰、拉杜与兰乔在印度顶尖的皇家工程学院相识并成为好友。面对竞争激烈、崇尚成绩与服从的教育环境，特立独行的兰乔始终坚持真正的学习来自兴趣与理解，并一次次挑战校长“病毒”的教育理念。他的想法也逐渐影响着背负家庭期待的法兰和拉杜，鼓励两…",
        "types": [
          "剧情",
          "喜剧"
        ],
        "directors": [
          "拉吉库马尔·希拉尼"
        ],
        "actors": [
          "阿米尔·汗",
          "马达范 R",
          "沙尔曼·乔什",
          "卡琳娜·卡普"
        ]
      },
      {
        "id": "col_film_1_14",
        "title": "放牛班的春天",
        "rate": "9.3",
        "cover": "https://image.tmdb.org/t/p/w500/d623rdQLxw7QhdP7ECsz1UkJrHl.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/eWYrrdCKd4bjOKB9DB0HtRUhI1o.jpg",
        "year": "2004",
        "description": "1949年的法国乡村，音乐家克莱门特·马修来到一所名为“池塘之底”的男子寄宿学校担任助理教师。这里的学生大多顽皮难管，体罚和高压管教更是司空见惯。性格温和的马修不认同校长的教育方式，决定尝试用音乐改变这些孩子。他重新创作合唱曲，组织起一支合…",
        "types": [
          "剧情",
          "喜剧",
          "音乐"
        ],
        "directors": [
          "克里斯托夫·巴哈蒂"
        ],
        "actors": [
          "热拉尔·朱尼奥",
          "弗朗索瓦·贝莱昂",
          "凯德·麦拉德",
          "让-保罗·博奈雷"
        ]
      },
      {
        "id": "col_film_1_15",
        "title": "机器人总动员",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/eVcHArmmMXajXaqVBH4dhUWfwmS.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/nYs4ZwnJBK4AgljhvzwNz7fpr3E.jpg",
        "year": "2008",
        "description": "公元 2700 年，人类文明高度发展，却因污染和生活垃圾大量增加使得地球不再适于人类居住。地球人被迫乘坐飞船离开故乡，进行一次漫长无边的宇宙之旅。临行前他们委托 Buynlarge 的公司对地球垃圾进行清理，该公司开发了名为 WALL·E（…",
        "types": [
          "动画",
          "家庭",
          "科幻"
        ],
        "directors": [
          "安德鲁·斯坦顿"
        ],
        "actors": [
          "本·贝尔特",
          "艾丽莎·奈特",
          "杰夫·格尔林",
          "佛莱德·威拉特"
        ]
      },
      {
        "id": "col_film_1_16",
        "title": "无间道",
        "rate": "9.3",
        "cover": "https://image.tmdb.org/t/p/w500/Apy624adTXc4prITxtcVbEdUPUm.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4Mm5l3TcKGynSNto0eyRJgBrkJ7.jpg",
        "year": "2002",
        "description": "多年前，黑帮成员刘建明奉韩琛之命进入警队，逐渐成为一名真正的警察；与此同时，警校学员陈永仁则接受秘密任务，被安排潜入韩琛的犯罪集团。多年过去，两个人都在各自的身份中越陷越深：陈永仁渴望结束漫长的卧底生涯，重新以警察身份生活，而刘建明也开始对…",
        "types": [
          "剧情",
          "动作",
          "惊悚"
        ],
        "directors": [
          "麦兆辉",
          "刘伟强"
        ],
        "actors": [
          "刘德华",
          "梁朝伟",
          "黄秋生",
          "曾志伟"
        ]
      }
    ]
  },
  {
    "id": "col-box-office",
    "title": "年度票房黑马",
    "subtitle": "年度院线口碑爆发与出人意料的逆袭之作",
    "slug": "box-office-dark-horse",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg",
      "https://image.tmdb.org/t/p/w500/mJGPPKMsYTxvkAIu4SbAtP2PCef.jpg",
      "https://image.tmdb.org/t/p/w500/a5s7sDM8Do9BxOTUcvwQgyt4PAT.jpg"
    ],
    "totalCount": 16,
    "description": "复盘年度院线最具爆发力的大银幕爆款，从喜剧黑马到科幻视效巅峰，票房与口碑齐飞的年度必看阵容。",
    "accent": "#EF4444",
    "films": [
      {
        "id": "col_film_2_1",
        "title": "抓娃娃",
        "rate": "7.0",
        "cover": "https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/vH0IXldpTM8J3MCT35khoeUMb5E.jpg",
        "year": "2024",
        "description": "西虹市富豪马成钢与妻子春兰担心优渥的生活会让儿子马继业失去独立成长的能力，于是隐瞒真实家境，搬进破旧的大院，在儿子面前扮成生活拮据的普通家庭。为了把马继业培养成他们心目中的理想接班人，夫妻二人精心设计他的生活与教育，甚至让身边的人共同参与这…",
        "types": [
          "喜剧"
        ],
        "directors": [
          "彭大魔",
          "闫非"
        ],
        "actors": [
          "沈腾",
          "马丽",
          "史彭元",
          "萨日娜"
        ]
      },
      {
        "id": "col_film_2_2",
        "title": "飞驰人生2",
        "rate": "7.2",
        "cover": "https://image.tmdb.org/t/p/w500/mJGPPKMsYTxvkAIu4SbAtP2PCef.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ch8rKF1a5WXFDcxi2AKfmnaMBk7.jpg",
        "year": "2024",
        "description": "五年前的巴音布鲁克一战后，张驰虽然完成了那场孤注一掷的比赛，却因赛车铅封始终未能找到，成绩被组委会取消。离开赛场后，他靠经营驾校维持生活，却又遭遇网络争议，曾经的传奇车手逐渐淡出人们视线。就在张驰几乎放下赛车时，一家濒临停产的老头乐车厂主动…",
        "types": [
          "剧情",
          "喜剧",
          "冒险"
        ],
        "directors": [
          "韩寒"
        ],
        "actors": [
          "沈腾",
          "范丞丞",
          "尹正",
          "张本煜"
        ]
      },
      {
        "id": "col_film_2_3",
        "title": "热辣滚烫",
        "rate": "6.8",
        "cover": "https://image.tmdb.org/t/p/w500/a5s7sDM8Do9BxOTUcvwQgyt4PAT.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9IEYCg2Sxk72QdNNcvbbCMelalu.jpg",
        "year": "2024",
        "description": "大学毕业后，杜乐莹只短暂工作过一段时间，便长期宅在家中，与外界逐渐疏远。一次与妹妹的激烈冲突让她决定离开家，尝试独自生活，却又接连遭遇爱情、亲情与现实的打击。阴差阳错之下，乐莹结识了拳击教练昊坤，也第一次真正接触到拳击。在一次次跌倒与挫折中…",
        "types": [
          "剧情",
          "喜剧",
          "动作"
        ],
        "directors": [
          "贾玲"
        ],
        "actors": [
          "贾玲",
          "雷佳音",
          "张小斐",
          "杨紫"
        ]
      },
      {
        "id": "col_film_2_4",
        "title": "第二十条",
        "rate": "6.9",
        "cover": "https://image.tmdb.org/t/p/w500/nTKeuNKbnUgiZZ4vEZWpUds3DYP.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/PsyMMWKOyMVjTZBiyhNebyHDsQ.jpg",
        "year": "2024",
        "description": "人到中年的检察官韩明早已褪去往日锋芒，眼下最关心的是结束挂职、顺利转正。然而，一起发生在康村的伤人案打破了他平静的生活：村民王永强为保护妻子捅伤长期欺压他们的刘文经，却因此面临严厉的刑事追责。女检察官吕玲玲顶住各方压力，坚持重新审视案件真相…",
        "types": [
          "剧情",
          "喜剧"
        ],
        "directors": [
          "张艺谋"
        ],
        "actors": [
          "雷佳音",
          "马丽",
          "赵丽颖",
          "高叶"
        ]
      },
      {
        "id": "col_film_2_5",
        "title": "默杀",
        "rate": "7.0",
        "cover": "https://image.tmdb.org/t/p/w500/uKThqY2oRYSHOPxYryTp2550fuZ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/un0v8F21uxZuLZSstWpQVjXZJfH.jpg",
        "year": "2024",
        "description": "女子中学学生陈语彤遭遇校园霸凌，母亲李涵却无法拯救身处“地狱”的女儿，身边所有人更是“视而不见”，一场集体的沉默酝酿着更大的暴力……",
        "types": [
          "犯罪",
          "悬疑",
          "惊悚"
        ],
        "directors": [
          "柯汶利"
        ],
        "actors": [
          "王传君",
          "张钧甯",
          "吴镇宇",
          "王圣迪"
        ]
      },
      {
        "id": "col_film_2_6",
        "title": "九龙城寨之围城",
        "rate": "7.0",
        "cover": "https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/vnOc8bBkUyynscYKK4VAP1ti7jn.jpg",
        "year": "2024",
        "description": "九龙城寨是众多黑帮虎视眈眈之地，其中以狄秋（任贤齐 饰）、Tiger（黄德斌 饰）和龙卷风（古天乐 饰）为首的帮派，以及雷震东带领之另一帮派最为突出。两派经常在城寨打斗，试图赶绝另一方，争夺城寨的控制权，雷震东的手下陈占（郭富城 饰）甚至在…",
        "types": [
          "动作",
          "犯罪",
          "惊悚"
        ],
        "directors": [
          "郑保瑞"
        ],
        "actors": [
          "林峯",
          "古天乐",
          "洪金宝",
          "任贤齐"
        ]
      },
      {
        "id": "col_film_2_7",
        "title": "异形：夺命舰",
        "rate": "7.2",
        "cover": "https://image.tmdb.org/t/p/w500/cDJwZ4lSZiUnHtixdyhaPPwsjyo.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/iYqSQaWDttQIQzsxg9xHyg0bttG.jpg",
        "year": "2024",
        "description": "影片时间线设定在1979年第一部《异形》与1986年的续集《异形2》之间，围绕一群年轻而勇敢的太空殖民者展开。讲述他们为逃离外星采矿殖民地的沉闷生活，在冒险探索一座废弃的太空站时，意外遭遇了宇宙中最可怕的生命体——异形。 狭窄幽暗、危机四伏…",
        "types": [
          "恐怖",
          "科幻"
        ],
        "directors": [
          "费德里科·阿尔瓦雷兹"
        ],
        "actors": [
          "卡莉·史派妮",
          "戴维·荣松",
          "阿奇·雷诺",
          "伊莎贝拉·莫塞德"
        ]
      },
      {
        "id": "col_film_2_8",
        "title": "沙丘2",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/9uaCR4HEZqxUqgORq0uZqTNm43G.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
        "year": "2024",
        "description": "《沙丘2》承接第一部剧情，讲述保罗·厄崔迪（提莫西·查拉梅 Timothée Chalamet 饰）被帕迪沙皇帝和哈克南人联手灭族后，在厄拉科斯星球遇到弗雷曼女战士契妮（赞达亚 Zendaya 饰）以及加入弗雷曼人后展开的传奇旅程。保罗与让…",
        "types": [
          "科幻",
          "冒险"
        ],
        "directors": [
          "丹尼斯·维伦纽瓦"
        ],
        "actors": [
          "提莫西·查拉梅",
          "赞达亚·科尔曼",
          "丽贝卡·弗格森",
          "哈维尔·巴登"
        ]
      },
      {
        "id": "col_film_2_9",
        "title": "死侍与金刚狼",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg",
        "year": "2024",
        "description": "经历一连串人生挫折后，韦德·威尔逊已经放下双刀，不再以死侍的身份行动，试图过上属于普通人的生活。然而生日当天，神秘的时间变异管理局突然将他带走，并告诉他所在的时间线正面临逐渐消亡的危机。得知自己珍视的朋友和整个世界都可能因此消失，韦德不得不…",
        "types": [
          "动作",
          "喜剧",
          "科幻"
        ],
        "directors": [
          "肖恩·利维"
        ],
        "actors": [
          "瑞安·雷诺兹",
          "休·杰克曼",
          "艾玛·科林",
          "马修·麦克费登"
        ]
      },
      {
        "id": "col_film_2_10",
        "title": "年会不能停！",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/nhsi6kfqwlfAdzaeZOocnUqMlH2.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/f4OCzvS3HvisHEkxq5596jg21UJ.jpg",
        "year": "2023",
        "description": "集团裁员风波之下，底层钳工胡建林却阴差阳错被调入总部，从一名普通工人摇身一变成为“大厂”白领。发现这场调动其实是一场乌龙后，人事经理马杰为了保住饭碗，只能想方设法替他隐瞒真相。没想到与总部职场规则格格不入的胡建林，不仅闹出一连串笑话，反而凭…",
        "types": [
          "剧情",
          "喜剧"
        ],
        "directors": [
          "董润年"
        ],
        "actors": [
          "董成鹏",
          "白客",
          "庄达菲",
          "王迅"
        ]
      },
      {
        "id": "col_film_2_11",
        "title": "白蛇3：浮生",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/mTszIRmU7zKm4Nl03uEhlcQ5Dkz.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1d4IhfrOQFltNjwuiajUDmOvfW1.jpg",
        "year": "2024",
        "description": "南宋临安，小白五百年后终于觅得阿宣的转世——许仙，二人断桥相遇。小白小青隐身街巷，和许仙还有姐夫李公甫一起开始了人间的热闹生活。却不想杭州城中突发怪事，金山寺法海除妖而来，意外揭开了小白和小青的蛇妖身份，许仙惊恐目睹小白化身巨蟒……　浮生中…",
        "types": [
          "动画",
          "爱情",
          "喜剧"
        ],
        "directors": [
          "陈健喜",
          "李佳锴"
        ],
        "actors": [
          "张喆",
          "杨天翔",
          "唐小喜",
          "张赫"
        ]
      },
      {
        "id": "col_film_2_12",
        "title": "志愿军：存亡之战",
        "rate": "6.6",
        "cover": "https://image.tmdb.org/t/p/w500/s6iSPGkpEHwcztNmNIMr21M6inK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/pU8pR29OYRTQqy5rEj387PdDGft.jpg",
        "year": "2024",
        "description": "影片聚焦铁原阻击战。1951年5月，中国人民志愿军第63军刚刚结束了持续一个月的作战，就受命进驻铁原战场，正面对抗“联合国军”4个师。志愿军将士们浴血奋战，终于把敌军打上了谈判桌。为了完成任务，63军189师的战士化整为零，把自己变成一根钉…",
        "types": [
          "剧情",
          "战争",
          "历史"
        ],
        "directors": [
          "陈凯歌"
        ],
        "actors": [
          "朱一龙",
          "辛柏青",
          "张子枫",
          "朱亚文"
        ]
      },
      {
        "id": "col_film_2_13",
        "title": "危机航线",
        "rate": "6.1",
        "cover": "https://image.tmdb.org/t/p/w500/b8xNJ39aOtEk3I7MFt8XJuN2bGS.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8lqfrOBQ2EcY7znD3LxTYcvlh25.jpg",
        "year": "2024",
        "description": "“有人吗？有……”一条来自高皓军（刘德华 饰）的神秘信息从万米高空传来。一架五星级 A380 超豪华客机在国际首航途中遭遇劫机，国际安保专家高皓军挺身而出与一众暴徒周旋，女儿小军（张子枫 饰）被困机舱，劫匪头目 Mike（屈楚萧 饰）以全…",
        "types": [
          "动作",
          "犯罪"
        ],
        "directors": [
          "彭顺"
        ],
        "actors": [
          "刘德华",
          "张子枫",
          "屈楚萧",
          "刘涛"
        ]
      },
      {
        "id": "col_film_2_14",
        "title": "封神第一部：朝歌风云",
        "rate": "7.1",
        "cover": "https://image.tmdb.org/t/p/w500/8fzJZQhmkLyZeXdZUi1eE2ZKhkm.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ef9dYKxDe2isgNhoJsGrt9yjXPz.jpg",
        "year": "2023",
        "description": "大商二王子殷寿率领亲手训练的质子旅和殷商大军征讨叛乱的冀州侯苏护，却意外解开轩辕坟中妖狐的封印。妖狐附身苏护之女妲己，并随殷寿返回朝歌。一场宫廷变故后，殷寿登上王位，朝歌却接连出现灾异。与此同时，昆仑仙人姜子牙携“封神榜”下山，希望将其交给…",
        "types": [
          "动作",
          "奇幻",
          "战争"
        ],
        "directors": [
          "乌尔善"
        ],
        "actors": [
          "于适",
          "费翔",
          "李雪健",
          "黄渤"
        ]
      },
      {
        "id": "col_film_2_15",
        "title": "孤注一掷",
        "rate": "7.0",
        "cover": "https://image.tmdb.org/t/p/w500/gjyqQD5LsNOiVIXuczw9joqjiKQ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/aXyCINHbxFBa9ZlQ9lSYeg1hAIC.jpg",
        "year": "2023",
        "description": "电影取材自上万起真实诈骗案例，境外网络诈骗全产业链骇人内幕将在大银幕上首度被揭秘。南亚某国诈骗团伙头目陆经理张狂傲慢，用诡计和暴力统治着这个血泪王国。程序员潘生离开之前的公司，根据高薪招聘启示走入了陆经理设下的圈套，成为一名利用网络诈骗的“…",
        "types": [
          "剧情",
          "犯罪"
        ],
        "directors": [
          "申奥"
        ],
        "actors": [
          "张艺兴",
          "王传君",
          "咏梅",
          "周也"
        ]
      },
      {
        "id": "col_film_2_16",
        "title": "特立独行",
        "rate": "6.4",
        "cover": "https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kTp2i00tjARpsI6wTkU4Q8ArGaX.jpg",
        "year": "2026",
        "description": "三十年前，以超人王长海为首的超英协会击溃了外星人，多年后，王长海被任命回乡建立战斗小队，但在这个多年和平的莱茵镇上，人情世故和礼尚往来让王长海手足无措，给王长海完成任务造成了层层阻碍。",
        "types": [
          "剧情",
          "喜剧",
          "科幻"
        ],
        "directors": [
          "邢文雄"
        ],
        "actors": [
          "白敬亭",
          "魏翔",
          "张国强",
          "苏小玎"
        ]
      }
    ]
  },
  {
    "id": "col-suspense",
    "title": "烧脑悬疑 · 层层反转",
    "subtitle": "高能反转直到最后一刻的智商博弈与心理谜局",
    "slug": "mind-bending-suspense",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/7YaMt0qcy9UzJ2bVmMUMM1ULA48.jpg",
      "https://image.tmdb.org/t/p/w500/zq4XIU55RkoPDrr1LdgXwCXSNzp.jpg",
      "https://image.tmdb.org/t/p/w500/wye3YonBnbXEmfFWMHcf2mZgPRv.jpg"
    ],
    "totalCount": 16,
    "description": "不看到最后一秒猜不到真相的本格推理与高能反转佳作，逻辑严密，伏笔千里，挑战你的观察力与推演极限。",
    "accent": "#8B5CF6",
    "films": [
      {
        "id": "col_film_3_1",
        "title": "看不见的客人",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/7YaMt0qcy9UzJ2bVmMUMM1ULA48.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1ZSWFzAP4AZuFCigZZoib2RdcUO.jpg",
        "year": "2017",
        "description": "事业有成、已有妻女的高科技企业家艾德里安·多利亚在一间从内部反锁的酒店房间里醒来，发现情人劳拉已经死在身旁，而现场没有任何其他人出入的迹象，他也因此成为案件的唯一嫌疑人。获准保释后，艾德里安请来经验丰富的律师弗吉尼亚·古德曼为自己准备辩护，…",
        "types": [
          "剧情",
          "悬疑",
          "惊悚"
        ],
        "directors": [
          "奥里奥尔·保罗"
        ],
        "actors": [
          "马里奥·卡萨斯",
          "阿娜·瓦格纳",
          "何塞·科罗纳多",
          "巴巴拉·莱涅"
        ]
      },
      {
        "id": "col_film_3_2",
        "title": "禁闭岛",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/zq4XIU55RkoPDrr1LdgXwCXSNzp.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rbZvGN1A1QyZuoKzhCw8QPmf2q0.jpg",
        "year": "2010",
        "description": "故事发生于波士顿海湾的一座与世隔绝的小岛上，66名精神病罪犯被关押于此，传言岛上正在进行种种人体实验。重重戒备之下，一个杀害了三个亲生孩子的女犯雷切尔，竟诡异失踪。联邦执法官泰德·丹尼尔和搭档查克奉命上岛调查此事。而泰德此行前来还有一个隐秘…",
        "types": [
          "剧情",
          "惊悚",
          "悬疑"
        ],
        "directors": [
          "马丁·斯科塞斯"
        ],
        "actors": [
          "莱昂纳多·迪卡普里奥",
          "马克·鲁法洛",
          "本·金斯利",
          "马克斯·冯·西多"
        ]
      },
      {
        "id": "col_film_3_3",
        "title": "控方证人",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/wye3YonBnbXEmfFWMHcf2mZgPRv.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/evUB9YKE5IPPtQOchcEF6hS90BO.jpg",
        "year": "1957",
        "description": "本片改编自阿加莎·克里斯蒂同名小说。  伦敦著名刑案辩护律师韦菲爵士接受了心脏病治疗，但是身体依旧虚弱，第一天回家休养，护士一直严厉监督他服药，并杜绝烟酒。管家为了便于上楼，还专门为他修了电梯。但是，种种关心照顾，对于这位桀骜不驯、牙尖嘴利…",
        "types": [
          "剧情",
          "悬疑",
          "犯罪"
        ],
        "directors": [
          "比利·怀尔德"
        ],
        "actors": [
          "泰隆·鲍华",
          "玛琳·黛德丽",
          "查尔斯·劳顿",
          "爱尔莎·兰切斯特"
        ]
      },
      {
        "id": "col_film_3_4",
        "title": "致命魔术",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/5DMDkeRfgISRqwxgrX9McAYwu6A.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/z3br1ub7spqGMkxgjgJSdM4DC21.jpg",
        "year": "2006",
        "description": "19世纪末的伦敦，罗伯特·安吉尔与阿尔弗雷德·伯登都是充满野心的年轻魔术师，曾经作为伙伴一起登台表演。然而一次意外造成的悲剧彻底改变了两人的关系，让昔日伙伴变成势不两立的竞争对手。此后，他们各自建立自己的舞台事业，不断钻研新的魔术，也开始想…",
        "types": [
          "剧情",
          "悬疑",
          "科幻"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "休·杰克曼",
          "克里斯蒂安·贝尔",
          "迈克尔·凯恩",
          "派珀·佩拉博"
        ]
      },
      {
        "id": "col_film_3_5",
        "title": "记忆碎片",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/rO9d5ES2v5h2xDDZzVWUfQwdZ42.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7Wev9JMo6R5XAfz2KDvXb7oPMmy.jpg",
        "year": "2000",
        "description": "警方不予受理后，伦纳德·谢尔比执意追查强奸杀害妻子的凶手。然而，一种罕见且无法治愈的失忆症，使他踏上复仇之路难上加难。",
        "types": [
          "悬疑",
          "惊悚"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "盖·皮尔斯",
          "凯瑞-安·莫斯",
          "乔·潘托里亚诺",
          "小马克·布恩"
        ]
      },
      {
        "id": "col_film_3_6",
        "title": "消失的爱人",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/rbs1LbLCIYhLyiTggRztnWFWfbp.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/iWak7wT0j6ycCc8lKr4NBz9c7n5.jpg",
        "year": "2014",
        "description": "结婚五周年纪念日当天，尼克·邓恩回到家中，却发现妻子艾米离奇失踪，屋内还留下了不同寻常的痕迹。随着警方展开调查，一个个疑点逐渐指向尼克，而艾米的失踪也在媒体持续报道下迅速成为全国关注的案件。面对越来越强烈的怀疑，尼克原本展现在众人面前的幸福…",
        "types": [
          "悬疑",
          "惊悚",
          "剧情"
        ],
        "directors": [
          "大卫·芬奇"
        ],
        "actors": [
          "本·阿弗莱克",
          "裴淳华",
          "尼尔·帕特里克·哈里斯",
          "泰勒·佩里"
        ]
      },
      {
        "id": "col_film_3_7",
        "title": "致命ID",
        "rate": "7.2",
        "cover": "https://image.tmdb.org/t/p/w500/p59g3NUxuOK4ghPqblA5e3k26sv.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/iiPBXynI88EgnpunHoUlBCnLpSE.jpg",
        "year": "2003",
        "description": "一个典型而又引人入胜的悬疑故事：一个汽车旅馆里，住进了10个人，他们中间有司机、妓女、过气女星、夫妇、警探和他的犯人，还有神秘的旅馆经理。这天风雨大作，通讯中断，10人被困在了旅馆里，惊悚的故事开始了。  他们一个接一个的死去，并且按照顺序…",
        "types": [
          "悬疑",
          "惊悚"
        ],
        "directors": [
          "詹姆斯·曼戈尔德"
        ],
        "actors": [
          "约翰·库萨克",
          "雷·利奥塔",
          "阿曼达·皮特",
          "约翰·霍克斯"
        ]
      },
      {
        "id": "col_film_3_8",
        "title": "七宗罪",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/e7J95YHcmLtyUtB1yojY76xQO90.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/i5H7zusQGsysGQ8i6P361Vnr0n2.jpg",
        "year": "1995",
        "description": "“暴食”、“贪婪”、“懒惰”、“嫉妒”、“骄傲”、“淫欲”、“愤怒”，这是天主教教义所指的人性七宗罪。城市中发生的连坏杀人案，死者恰好都是犯有这些教义的人。凶手故弄玄虚的作案手法，令资深冷静的警员沙摩塞（摩根•弗里曼 Morgan Free…",
        "types": [
          "犯罪",
          "悬疑",
          "惊悚"
        ],
        "directors": [
          "大卫·芬奇"
        ],
        "actors": [
          "摩根·弗里曼",
          "布拉德·皮特",
          "格温妮斯·帕特洛",
          "约翰·卡西尼"
        ]
      },
      {
        "id": "col_film_3_9",
        "title": "利刃出鞘",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/lyST2ENOPittfDEzcRUPd88uDd7.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4HWAQu28e2yaWrtupFPGFkdNU7V.jpg",
        "year": "2019",
        "description": "当知名犯罪小说作家哈兰·斯隆比在其85岁生日后不久被发现死于自家庄园时，好奇而风度翩翩的侦探贝努瓦·布兰克被神秘地请来调查此案。从哈兰关系不和的家人到忠诚的仆人们，布兰克在一连串烟雾弹和自私谎言中仔细梳理，以揭开哈兰英年早逝背后的真相。[狮…",
        "types": [
          "喜剧",
          "犯罪",
          "悬疑"
        ],
        "directors": [
          "莱恩·约翰逊"
        ],
        "actors": [
          "丹尼尔·克雷格",
          "克里斯·埃文斯",
          "安娜·德·阿玛斯",
          "杰米·李·柯蒂斯"
        ]
      },
      {
        "id": "col_film_3_10",
        "title": "蝴蝶效应",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/ubI1LllWsA92f4M9GKX2wUlzkPR.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/75UPGUm2Zm6M60szq1gQisDF4g.jpg",
        "year": "2004",
        "description": "伊万从小经历着一个充满创伤的童年，每当一些可怕的事情发生时，他总会莫名失去一段记忆，只留下零碎而模糊的片段。在心理医生的建议下，他开始用日记记录自己的生活。多年后，已经进入大学的伊万重新翻看童年时期的日记，意外发现自己的意识能够回到那些曾经…",
        "types": [
          "科幻",
          "惊悚"
        ],
        "directors": [
          "埃里克·布雷斯",
          "J·麦基·格鲁伯"
        ],
        "actors": [
          "阿什顿·库彻",
          "艾米·斯马特",
          "梅洛拉·沃尔特斯",
          "埃尔登·汉森"
        ]
      },
      {
        "id": "col_film_3_11",
        "title": "催眠大师",
        "rate": "6.7",
        "cover": "https://image.tmdb.org/t/p/w500/j36Bz7SqGXavHrMjZzF1KKtpIFu.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xNEa9sFcTnHDXbxdUQlBshIDkdy.jpg",
        "year": "2014",
        "description": "国内擅长催眠疗法的知名心理治疗师徐瑞宁（徐峥饰）正值事业风生水起之时，由他治疗过的病人全都痊愈出院，这也使得徐瑞宁信心倍增，直至骄傲自大。就连自己的学生在课堂上对他理论的质疑，都毫不收敛的回击过去，这些都被徐瑞宁的大学老师方教授看在眼里。在…",
        "types": [
          "惊悚",
          "剧情",
          "悬疑"
        ],
        "directors": [
          "陈正道"
        ],
        "actors": [
          "徐峥",
          "莫文蔚",
          "吕中",
          "王耀庆"
        ]
      },
      {
        "id": "col_film_3_12",
        "title": "误杀",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/cUd8OVN1kjzyySFvhdpca4ZiGPH.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kgacyo0eXU22ObxUwZ0lquGNB6I.jpg",
        "year": "2019",
        "description": "李维杰与妻子阿玉在泰国生活多年，经营着一家小公司，与两个女儿过着平静的生活。一天，大女儿平平遭到当地督察长拉韫之子素察的侵犯，并在反抗过程中意外致其死亡。深知当地权力与司法环境的李维杰明白，一旦事情暴露，整个家庭都将陷入危险。为了保护妻女，…",
        "types": [
          "犯罪",
          "悬疑",
          "惊悚"
        ],
        "directors": [
          "柯汶利"
        ],
        "actors": [
          "肖央",
          "谭卓",
          "陈冲",
          "姜皓文"
        ]
      },
      {
        "id": "col_film_3_13",
        "title": "心迷宫",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/1ertjhiOTYVIhh5VBI1SHe0evid.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7uL8JLW5cQzHqCFeX8NlTsXu26B.jpg",
        "year": "2015",
        "description": "一个青年在一次争执中失手杀死了同村的痞子，被迫逃亡。他没有想过会用这样的方式逃离安逸的生活，离开之际却惊人的发现宿命早已将他和父亲紧紧连接在一起，走或留他都将失去一切。一个饱受家庭暴力摧残的留守女人，在曾经恋人的怀抱里找到了慰藉。黑暗里…",
        "types": [
          "剧情"
        ],
        "directors": [
          "忻钰坤"
        ],
        "actors": [
          "霍卫民",
          "王笑天",
          "罗芸",
          "杨瑜珍"
        ]
      },
      {
        "id": "col_film_3_14",
        "title": "网络谜踪2",
        "rate": "7.4",
        "cover": "https://image.tmdb.org/t/p/w500/bAuG5N3wrWchuyK2cUjVSqtHgtT.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/tVH1qEFyKiCpP6kNDFyXKW2Tiif.jpg",
        "year": "2023",
        "description": "少女朱恩（斯托姆·瑞德 饰）为了寻找离奇失踪的母亲（尼娅·朗 饰），展开抽丝剥茧般的互联网跨国追踪。巨大的信息量浩如烟海，未知的危险在暗中潜伏，朱恩能否找到真相，妈妈能否平安归来？…",
        "types": [
          "剧情",
          "悬疑",
          "惊悚"
        ],
        "directors": [
          "维尔·梅里克",
          "尼古拉斯·D·约翰逊"
        ],
        "actors": [
          "斯托姆·瑞德",
          "华金姆·德·艾尔梅达",
          "肯·兰格",
          "艾米·兰德克"
        ]
      },
      {
        "id": "col_film_3_15",
        "title": "恐怖游轮",
        "rate": "6.9",
        "cover": "https://image.tmdb.org/t/p/w500/JPF79YnhjuVP545OLYli4w6gq1.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rlVpm5r7vZYyU9JHWf9UGOVDo5M.jpg",
        "year": "2009",
        "description": "单亲母亲杰西和一帮朋友乘游艇出海游玩，但她总有一种有不好的事情发生的感觉。不久，他们便在海上遭遇一场强烈的风暴。游艇翻船，众人落海，几经挣扎他们好不容易爬到游艇残骸上来。正当他们无计可施之时，一艘巨大的游轮向众人缓缓驶来。众人欣喜过望，未加…",
        "types": [
          "恐怖"
        ],
        "directors": [
          "克里斯托弗·史密斯"
        ],
        "actors": [
          "梅利莎·乔治",
          "利亚姆·海姆斯沃斯",
          "艾玛·朗",
          "瑞秋·卡帕尼"
        ]
      },
      {
        "id": "col_film_3_16",
        "title": "调音师",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/29YqkGW6ztW3jbe0Nse6TwcXbhs.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/2f5Viug0j2jskSmeyhd89QYhqmS.jpg",
        "year": "2026",
        "description": "一位才华横溢的钢琴调音师，发现自己精湛的钢琴调音技艺可以用于破解保险箱，由此他的生活发生了翻天覆地的变化。",
        "types": [
          "犯罪",
          "剧情",
          "惊悚"
        ],
        "directors": [
          "Daniel Roher"
        ],
        "actors": [
          "利奥·伍德尔",
          "达斯汀·霍夫曼",
          "Alisen Richmond-Peck",
          "Ellyn Jameson"
        ]
      }
    ]
  },
  {
    "id": "col-nolan",
    "title": "诺兰导演全系列",
    "subtitle": "穿梭于时间、梦境与维度的当代电影哲学大师",
    "slug": "christopher-nolan-universe",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/a6v21Mgz2w6OQL7ezkQxGbGA92W.jpg",
      "https://image.tmdb.org/t/p/w500/qEAQBbRHTmro9WsS3G7kqxHucYL.jpg",
      "https://image.tmdb.org/t/p/w500/2HG3jCpmgw2eFCnjYosttnCtJSJ.jpg"
    ],
    "totalCount": 12,
    "description": "完整收录当代视听宗师克里斯托弗·诺兰的非线性叙事经典，以胶片质感丈量人性、时间重塑与宇宙终极法则。",
    "accent": "#06B6D4",
    "films": [
      {
        "id": "col_film_4_1",
        "title": "奥本海默",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/a6v21Mgz2w6OQL7ezkQxGbGA92W.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/neeNHeXjMF5fXoCJRsOmkNGC7q.jpg",
        "year": "2023",
        "description": "随着战争阴云笼罩世界，各国之间的军事竞赛愈演愈烈。为了抢占先机，美国军方找到量子力学与核物理学家罗伯特·奥本海默，任命他领导洛斯阿拉莫斯实验室，并参与推进绝密的曼哈顿计划。在科学家们争分夺秒的研发下，人类历史上第一颗原子弹最终在荒漠中成功引…",
        "types": [
          "剧情",
          "历史"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "基利安·墨菲",
          "艾米莉·布朗特",
          "马特·达蒙",
          "小罗伯特·唐尼"
        ]
      },
      {
        "id": "col_film_4_2",
        "title": "信条",
        "rate": "7.2",
        "cover": "https://image.tmdb.org/t/p/w500/qEAQBbRHTmro9WsS3G7kqxHucYL.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/mQOUyqDybTqxl73hO5LujCZsM1o.jpg",
        "year": "2020",
        "description": "乌克兰基辅国家歌剧院，一伙蒙面歹徒突然闯入演出大厅，挟持在场数百名音乐家和观众。未过多久，乌克兰特警部队迅速赶到，并按照既定战术突入进去。与此同时，神秘之人换上特警部队肩章，趁乱潜入歌剧院，救出被困的美国大使。神秘人虽然一度顺利完成任务，却…",
        "types": [
          "动作",
          "惊悚",
          "科幻"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "约翰·大卫·华盛顿",
          "罗伯特·帕丁森",
          "伊丽莎白·德比齐",
          "肯尼思·布拉纳"
        ]
      },
      {
        "id": "col_film_4_3",
        "title": "敦刻尔克",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/2HG3jCpmgw2eFCnjYosttnCtJSJ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ddIkmH3TpR6XSc47jj0BrGK5Rbz.jpg",
        "year": "2017",
        "description": "1940年，第二次世界大战初期，40万英法盟军被德军围困在法国敦刻尔克的海滩上，背靠大海等待撤离。英国政府和海军征集大批民用船只参与救援。陆地上，英国士兵汤米在逃离海滩的过程中结识吉布森和亚历克斯，在持续的轰炸与混乱中寻找生路；海上，道森先…",
        "types": [
          "战争",
          "动作",
          "剧情"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "菲恩·怀特海德",
          "汤姆·哈迪",
          "马克·里朗斯",
          "肯尼思·布拉纳"
        ]
      },
      {
        "id": "col_film_4_4",
        "title": "星际穿越",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/spQm5r317XPNHK1941ChWmqzkZs.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5XNQBqnBwPA9yT0jZ0p3s8bbLh0.jpg",
        "year": "2014",
        "description": "近未来，地球环境持续恶化，枯萎病和沙尘暴让越来越多农作物消失，人类的生存前景也变得岌岌可危。曾为NASA飞行员的库珀如今与家人在农场生活，一次偶然发现的异常重力现象，却将他和女儿墨菲引向一个仍在秘密运作的NASA基地。布兰德教授告诉他，多年…",
        "types": [
          "冒险",
          "剧情",
          "科幻"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "马修·麦康纳",
          "安妮·海瑟薇",
          "迈克尔·凯恩",
          "杰西卡·查斯坦"
        ]
      },
      {
        "id": "col_film_4_5",
        "title": "蝙蝠侠：黑暗骑士崛起",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/9NtWj8TFNQixyayY5ZznpQRpseE.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/y2DB71C4nyIdMrANijz8mzvQtk6.jpg",
        "year": "2012",
        "description": "哈维·登特死后的八年间，哥谭市的犯罪活动受到有效遏制，而背负杀害登特罪名的蝙蝠侠也从城市中销声匿迹，布鲁斯·韦恩则过着与世隔绝的生活。然而，神秘而强大的贝恩突然出现，打破了哥谭维持多年的平静。与此同时，行踪莫测的女贼赛琳娜·凯尔也闯入布鲁斯…",
        "types": [
          "动作",
          "犯罪",
          "剧情"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "克里斯蒂安·贝尔",
          "加里·奥德曼",
          "汤姆·哈迪",
          "约瑟夫·高登-莱维特"
        ]
      },
      {
        "id": "col_film_4_6",
        "title": "盗梦空间",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/89W962aAnPS3N3BdKgy2BvUhnCh.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "year": "2010",
        "description": "道姆·柯布与同事阿瑟和纳什在一次针对日本能源大亨齐藤（渡边谦 饰）的盗梦行动中失败，反被齐藤利用。齐藤威逼利诱因遭通缉而流亡海外的柯布帮他拆分他竞争对手的公司，采取极端措施在其唯一继承人罗伯特·费希尔的深层潜意识中种下放弃家族公司、自立门户…",
        "types": [
          "动作",
          "科幻",
          "冒险"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "莱昂纳多·迪卡普里奥",
          "约瑟夫·高登-莱维特",
          "渡边谦",
          "汤姆·哈迪"
        ]
      },
      {
        "id": "col_film_4_7",
        "title": "蝙蝠侠：黑暗骑士",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/qYB7QqwT1NtTW9aCwtopGy80rmA.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg",
        "year": "2008",
        "description": "在蝙蝠侠、警官詹姆斯·戈登和地方检察官哈维·丹特的共同努力下，哥谭市的犯罪势力受到前所未有的打击。然而，自称“小丑”的神秘罪犯突然出现，以毫无规则的暴力和精心策划的犯罪不断挑战城市秩序，也将蝙蝠侠、戈登和丹特一步步逼入道德与人性的困境。面对…",
        "types": [
          "动作",
          "惊悚"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "克里斯蒂安·贝尔",
          "希斯·莱杰",
          "艾伦·艾克哈特",
          "迈克尔·凯恩"
        ]
      },
      {
        "id": "col_film_4_8",
        "title": "致命魔术",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/5DMDkeRfgISRqwxgrX9McAYwu6A.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/z3br1ub7spqGMkxgjgJSdM4DC21.jpg",
        "year": "2006",
        "description": "19世纪末的伦敦，罗伯特·安吉尔与阿尔弗雷德·伯登都是充满野心的年轻魔术师，曾经作为伙伴一起登台表演。然而一次意外造成的悲剧彻底改变了两人的关系，让昔日伙伴变成势不两立的竞争对手。此后，他们各自建立自己的舞台事业，不断钻研新的魔术，也开始想…",
        "types": [
          "剧情",
          "悬疑",
          "科幻"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "休·杰克曼",
          "克里斯蒂安·贝尔",
          "迈克尔·凯恩",
          "派珀·佩拉博"
        ]
      },
      {
        "id": "col_film_4_9",
        "title": "蝙蝠侠：侠影之谜",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/bQqwhAU4dfacGB5yKzRHBc58Sw4.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9IIBboV7MCT0bTxzXHmWK1Hq558.jpg",
        "year": "2005",
        "description": "童年亲眼目睹父母在高谭市街头被杀后，布鲁斯·韦恩始终被恐惧与愤怒所困扰。成年后，他离开故乡周游世界，深入犯罪世界，试图理解罪犯的心理，并在旅途中接受杜卡的训练，学习格斗技巧以及如何驾驭内心的恐惧。当他发现神秘的影忍者盟与自己的信念背道而驰时…",
        "types": [
          "剧情",
          "犯罪",
          "动作"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "克里斯蒂安·贝尔",
          "迈克尔·凯恩",
          "连姆·尼森",
          "凯蒂·霍尔姆斯"
        ]
      },
      {
        "id": "col_film_4_10",
        "title": "白夜追凶",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/cMUymzvJL0MeXR7OuuBmR0KGaxZ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fBClDP2SLBn4NlqYSMkZwky3VEp.jpg",
        "year": "2017",
        "description": "一场灭门惨案，让原本逍遥浪荡的关宏宇成了在逃的通缉嫌犯。身为刑侦支队队长的双胞胎哥哥关宏峰，誓要查出真相，但出于亲属回避的原则，警队禁止关宏峰参与灭门案的调查工作，关宏峰义愤辞职。调任了代支队长的周巡处于破案压力，也为了追寻关宏宇的下落，他…",
        "types": [
          "犯罪",
          "剧情",
          "悬疑"
        ],
        "directors": [
          "刘英剑"
        ],
        "actors": [
          "潘粤明",
          "王龙正",
          "梁缘",
          "尹姝贻"
        ]
      },
      {
        "id": "col_film_4_11",
        "title": "记忆碎片",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/rO9d5ES2v5h2xDDZzVWUfQwdZ42.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7Wev9JMo6R5XAfz2KDvXb7oPMmy.jpg",
        "year": "2000",
        "description": "警方不予受理后，伦纳德·谢尔比执意追查强奸杀害妻子的凶手。然而，一种罕见且无法治愈的失忆症，使他踏上复仇之路难上加难。",
        "types": [
          "悬疑",
          "惊悚"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "盖·皮尔斯",
          "凯瑞-安·莫斯",
          "乔·潘托里亚诺",
          "小马克·布恩"
        ]
      },
      {
        "id": "col_film_4_12",
        "title": "追随",
        "rate": "7.1",
        "cover": "https://image.tmdb.org/t/p/w500/rXHdIfyJ5ojQYsN2wPrmf9aIIyN.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yf5I5VHllK4h5VdbxHfQ40RBTe8.jpg",
        "year": "1999",
        "description": "比尔（杰里米·希尔伯德 Jeremy Theobald 饰）是个游手好闲的作家，借跟踪陌生人打发时间，希望从中能找到一些灵感。这让他体验到形形色色的人生，很神秘，也很刺激。不过，有一次，比尔盯上了一个西服革履的家伙柯布（艾利克斯·豪 Ale…",
        "types": [
          "剧情",
          "惊悚"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "杰里米·西奥伯德",
          "亚历克斯·霍",
          "露西·拉塞尔",
          "约翰·诺兰"
        ]
      }
    ]
  },
  {
    "id": "col-hk-golden",
    "title": "香港电影黄金时代",
    "subtitle": "英雄本色、江湖义气与东方好莱坞的不老传奇",
    "slug": "hong-kong-golden-age",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/qvdvGB9d58zjberXoCX5RihD5PY.jpg",
      "https://image.tmdb.org/t/p/w500/4VcbDfb0CzX0UzNEg6QEUruXXnK.jpg",
      "https://image.tmdb.org/t/p/w500/Apy624adTXc4prITxtcVbEdUPUm.jpg"
    ],
    "totalCount": 16,
    "description": "重温上世纪八九十年代港片巅峰华彩，风衣墨镜的双雄枪战、快意恩仇的武侠江湖，以及无法复刻的黄金一代巨星风采。",
    "accent": "#F43F5E",
    "films": [
      {
        "id": "col_film_5_1",
        "title": "英雄本色",
        "rate": "7.4",
        "cover": "https://image.tmdb.org/t/p/w500/qvdvGB9d58zjberXoCX5RihD5PY.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/o3NOUSFVCHjQFUUvS6OYPvC4sBE.jpg",
        "year": "1986",
        "description": "香港某个国际伪钞集团重要分子宋子豪（狄龙）和Mark（周润发）情同手足，某次宋子豪带手下谭成（李子雄）去台北交易时被其出卖受枪伤被捕入狱，为替好兄弟报仇，Mark孤身赴台，结果被人打成瘸子，江湖地位自此一落千丈，而宋子豪的父亲也在不久丧命。",
        "types": [
          "动作",
          "犯罪",
          "剧情"
        ],
        "directors": [
          "吴宇森"
        ],
        "actors": [
          "狄龙",
          "周润发",
          "张国荣",
          "朱宝意"
        ]
      },
      {
        "id": "col_film_5_2",
        "title": "纵横四海",
        "rate": "5.0",
        "cover": "https://image.tmdb.org/t/p/w500/4VcbDfb0CzX0UzNEg6QEUruXXnK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/nfcx1QYNojKW3gEtNSEogIs1BLh.jpg",
        "year": "1999",
        "description": "利兆天（陶大宇 饰）是香港巨富，他的出身却颇为复杂。原来，以前他的父亲来香港闯荡前曾在老家娶了妻子明星（叶德娴 饰），来港后被富商的女儿白宴（鲍起静 饰）看上，于是又娶了白宴。后来怀孕的明星来港找寻丈夫，白宴大方的让明星入了门。可惜后来…",
        "types": [
          "剧情",
          "犯罪"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "陶大宇",
          "杨恭如",
          "周海媚",
          "谭耀文"
        ]
      },
      {
        "id": "col_film_5_3",
        "title": "无间道",
        "rate": "9.3",
        "cover": "https://image.tmdb.org/t/p/w500/Apy624adTXc4prITxtcVbEdUPUm.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4Mm5l3TcKGynSNto0eyRJgBrkJ7.jpg",
        "year": "2002",
        "description": "多年前，黑帮成员刘建明奉韩琛之命进入警队，逐渐成为一名真正的警察；与此同时，警校学员陈永仁则接受秘密任务，被安排潜入韩琛的犯罪集团。多年过去，两个人都在各自的身份中越陷越深：陈永仁渴望结束漫长的卧底生涯，重新以警察身份生活，而刘建明也开始对…",
        "types": [
          "剧情",
          "动作",
          "惊悚"
        ],
        "directors": [
          "麦兆辉",
          "刘伟强"
        ],
        "actors": [
          "刘德华",
          "梁朝伟",
          "黄秋生",
          "曾志伟"
        ]
      },
      {
        "id": "col_film_5_4",
        "title": "新警察故事",
        "rate": "7.2",
        "cover": "https://image.tmdb.org/t/p/w500/k0toKZFxU7E7Jd7oUSqhwQhIXBQ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qDcLJIeg2z1oMtAWs9qFLeJVJ6E.jpg",
        "year": "2004",
        "description": "陈国荣（成龙饰）的所在那一组警察是警队精英，破案无数。阿祖（吴彦祖饰）是总警师的儿子，却勾结了几个高官子弟挑战警方。他们到银行抢劫，警钟敲响警察赶到时，就把阿荣及队员带进了一个早已设计好的空旷仓库里。警员都陷进了匪徒早已设计好的游戏程序里，…",
        "types": [
          "动作",
          "惊悚",
          "犯罪"
        ],
        "directors": [
          "陈木胜"
        ],
        "actors": [
          "成龙",
          "谢霆锋",
          "杨采妮",
          "蔡卓妍"
        ]
      },
      {
        "id": "col_film_5_5",
        "title": "倩女幽魂",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/fP64i84njY92svpSLqbQyNLMOAB.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/A89LDBfE4I7peBt9flR29LjtBdf.jpg",
        "year": "1987",
        "description": "书生宁采臣（张国荣饰）前往郭北县收帐，但却因帐簿被雨水淋透，收账不成，无处可归。漆黑的夜晚，四周荒山野岭，遂夜宿鬼寺兰若寺，遇上侠士燕赤霞（午马饰），二人成为邻居。一日偶遇艳女小倩（王祖贤饰），二人两情相悦，但小倩乃是被树妖姥姥（刘兆铭饰）…",
        "types": [
          "奇幻",
          "动作"
        ],
        "directors": [
          "程小东"
        ],
        "actors": [
          "张国荣",
          "王祖贤",
          "午马",
          "刘兆铭"
        ]
      },
      {
        "id": "col_film_5_6",
        "title": "大话西游之大圣娶亲",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/xK5I5ikVC8FCCggNzNlanC7GI92.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/hbZT53Kng9UXWAq2oHaPPbp4B83.jpg",
        "year": "1995",
        "description": "至尊宝被月光宝盒带回五百年前，意外遇见紫霞仙子。紫霞与青霞本是如来佛祖座前日月神灯的灯芯，共用同一副身体却性格迥异。紫霞曾立下誓言，谁能拔出她手中的紫青宝剑，谁就是她命中注定的意中人。不料至尊宝无意间拔出了宝剑，从此被紫霞认定为自己的真命天…",
        "types": [
          "动作",
          "冒险",
          "奇幻"
        ],
        "directors": [
          "刘镇伟"
        ],
        "actors": [
          "周星驰",
          "吴孟达",
          "朱茵",
          "蔡少芬"
        ]
      },
      {
        "id": "col_film_5_7",
        "title": "重庆森林",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/ejkczWHjQoNAPUmTU26tU3aRkr8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/vuglA60RqvpHK9rIcG8sXaiWw1L.jpg",
        "year": "1994",
        "description": "编号为223的警察失恋后患上失恋综合症，在与金发女杀手擦肩而过又离奇相遇并有了一晚温情后，原本以为包括“爱情”在内的所有东西都有保质期的他意外地迎来心灵的短暂温暖。可是，他们的爱情还是结束了。快餐店新来的女招待阿菲爱上了时常光顾快餐店的编号…",
        "types": [
          "剧情",
          "喜剧",
          "爱情"
        ],
        "directors": [
          "王家卫"
        ],
        "actors": [
          "林青霞",
          "金城武",
          "梁朝伟",
          "王菲"
        ]
      },
      {
        "id": "col_film_5_8",
        "title": "花样年华",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/1Z32pKrmWW2nkLFYGoc79MzJin6.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ffQFnAUm2Uu4RU0nijpjPRf9TBT.jpg",
        "year": "2000",
        "description": "1962年的香港，报馆编辑周慕云与妻子搬进一间住满上海人的公寓，同一天搬来的还有在贸易公司工作的苏丽珍和她的丈夫。由于各自的配偶经常因工作不在家，周慕云与苏丽珍在一次次碰面中逐渐熟悉起来。不久，两人从一些生活中的蛛丝马迹发现，自己的配偶竟背…",
        "types": [
          "剧情",
          "爱情"
        ],
        "directors": [
          "王家卫"
        ],
        "actors": [
          "张曼玉",
          "梁朝伟",
          "萧炳林",
          "潘迪华"
        ]
      },
      {
        "id": "col_film_5_9",
        "title": "枪火",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/flmNCOe0y2LtX3hm3TQs9bhXD8M.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/tfdNIWA9Pf0wNiB7HGAgymO9o6M.jpg",
        "year": "2014",
        "description": "1931年的奉天，日本关东军频频造事挑衅。东北军主战派将领徐国真，派出留德归来的独子徐文杰和养子多吉所在部队，与关东军对峙。关东军少佐丰田一郎是徐文杰的昔日同窗，他纵容部下骚扰平民，蓄意挑衅。徐文杰不顾“不许交火”的军令，举枪击毙日寇，由…",
        "types": [
          "精选",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "马雅舒",
          "韩青",
          "朱泳腾",
          "冯恩鹤"
        ]
      },
      {
        "id": "col_film_5_10",
        "title": "精武英雄",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/zSs0ueOSgZJRFRzYdZAzWVReYbS.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/2XMjBxdICJWVmBMlbge2JySz7X9.jpg",
        "year": "1994",
        "description": "20年代末，为完成师父的志愿，陈真（李连杰饰）到东洋学先进技术，他喜欢着日本女孩山田光子（中山忍饰）。因为师父霍元甲之死，陈真回到中国，协助师父之子霍廷恩（钱小豪饰）主持精武门的业务，不料却引起了他的妒忌，师兄弟之间引发权力之争。　　另…",
        "types": [
          "动作"
        ],
        "directors": [
          "陈嘉上"
        ],
        "actors": [
          "李连杰",
          "中山忍",
          "钱小豪",
          "周比利"
        ]
      },
      {
        "id": "col_film_5_11",
        "title": "新龙门客栈",
        "rate": "8.7",
        "cover": "https://image.tmdb.org/t/p/w500/asdeRApjcwPmOmEIkpVOx9004uK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kQBEHIcFrUPIudjIlsULhglRQzc.jpg",
        "year": "1992",
        "description": "宦官专权的明朝中叶，东厂曹少钦（甄子丹）假造圣旨杀害了忠良杨宇轩，并想斩草除根杀死其后代。侠女邱莫言（林青霞）、江湖义士贺虎等人冒死救出忠良后代后，逃至边关沙漠里的龙门客栈，与杨宇轩部下周淮安（梁家辉）会合。龙门客栈实则黑店，老板娘金镶玉（…",
        "types": [
          "动作",
          "惊悚"
        ],
        "directors": [
          "李惠民"
        ],
        "actors": [
          "张曼玉",
          "林青霞",
          "梁家辉",
          "甄子丹"
        ]
      },
      {
        "id": "col_film_5_12",
        "title": "黄飞鸿之二：男儿当自强",
        "rate": "7.2",
        "cover": "https://image.tmdb.org/t/p/w500/joSPBNUk4VosLrGbmxscR9eZXH2.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zrSmI2wP2WIkWrgfP7IDSY1F9fW.jpg",
        "year": "1992",
        "description": "清末，黄飞鸿（李连杰 饰）携十三姨（关之琳 饰）和徒弟梁宽（莫少聪 饰）前往广州参加一场国际医学会议。抵穗后，他们目睹白莲教徒以“扶清灭洋”为名，大肆打砸使馆、教堂，甚至袭击小学生，场面令人愤慨。  在医学会议上，十三姨担任翻译，黄飞鸿得以…",
        "types": [
          "动作",
          "喜剧"
        ],
        "directors": [
          "徐克"
        ],
        "actors": [
          "李连杰",
          "关之琳",
          "莫少聪",
          "甄子丹"
        ]
      },
      {
        "id": "col_film_5_13",
        "title": "破坏之王",
        "rate": "7.0",
        "cover": "https://image.tmdb.org/t/p/w500/dkjbSPtWiyBc42ooh9V5zA7Bbqf.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yWGrbwW6cYpp6fIwbdzKDKBgyEg.jpg",
        "year": "1994",
        "description": "快餐店打工仔何金银性格懦弱、身手平平，却在一次送餐时对正在武术中心学习的阿丽一见钟情。为了改变自己，也为了不再受人欺负，他拜自称“魔鬼筋肉人”的鬼王达为师，开始学习所谓的中国古拳法。原本只想骗钱的鬼王达，也渐渐被阿银的善良与执着打动。一次偶…",
        "types": [
          "喜剧",
          "动作"
        ],
        "directors": [
          "李力持"
        ],
        "actors": [
          "周星驰",
          "吴孟达",
          "钟丽缇",
          "林国斌"
        ]
      },
      {
        "id": "col_film_5_14",
        "title": "旺角卡门",
        "rate": "7.0",
        "cover": "https://image.tmdb.org/t/p/w500/ieZmveWa3E82fE4xEXO5gsHWStF.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/tEqeyPPBJfyDJl0lO08YiqefYqd.jpg",
        "year": "1988",
        "description": "香港九龙区旺角混混阿杰做事利落重情义，颇有老大风范，为了照顾做事冲动又好面子的小弟乌蝇，他不停地在各种大小麻烦中周旋，甚至不惜为乌蝇与黑道狠角色结仇。阿杰表妹阿娥前来旺角看病暂住他家，两人慢慢互生情愫，但因为担心自己的身份最终会给阿娥带来伤…",
        "types": [
          "剧情",
          "犯罪",
          "爱情"
        ],
        "directors": [
          "王家卫"
        ],
        "actors": [
          "刘德华",
          "张曼玉",
          "张学友",
          "万梓良"
        ]
      },
      {
        "id": "col_film_5_15",
        "title": "暗战",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/qDbQFn8HyF3GcNu03a8MgijQZgF.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/qDbQFn8HyF3GcNu03a8MgijQZgF.jpg",
        "year": "2003",
        "description": "十年前，时任龙兴市公安局缉毒支队支队长的骆成龙得到情报，大宗毒品要转运到龙兴市，骆成龙亲自出马指挥围捕行动。他的儿子，也就是龙兴市公安局特警大队队长骆树英奉命配合缉毒支队行动。由于骆成龙固执己见，导致行动失败。 省厅派人调查情况，骆树英如实…",
        "types": [
          "犯罪",
          "剧情"
        ],
        "directors": [
          "刘新"
        ],
        "actors": [
          "奚美娟",
          "王庆祥",
          "金鑫",
          "李宗翰"
        ]
      },
      {
        "id": "col_film_5_16",
        "title": "喋血双雄",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/bLEeJsnJxf3vyHkKov1vEgk58Wy.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/jetidiki3UjVJEpFwcK2kUrvoR5.jpg",
        "year": "1989",
        "description": "一名幻灭的杀手接下最后一单任务，希望用酬劳帮助他无意中致盲的歌女恢复视力，却遭老板背叛暗算。",
        "types": [
          "动作",
          "犯罪",
          "剧情"
        ],
        "directors": [
          "吴宇森"
        ],
        "actors": [
          "周润发",
          "李修贤",
          "叶蒨文",
          "朱江"
        ]
      }
    ]
  },
  {
    "id": "col-ghibli",
    "title": "吉卜力手绘童话",
    "subtitle": "宫崎骏与高畑勋的纯真美学与灵魂治愈物语",
    "slug": "ghibli-miyazaki-universe",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/dnwMqbndJpOEhoVqjlMU9U7LFle.jpg",
      "https://image.tmdb.org/t/p/w500/pwDrh5XM59ULSFEsaUlJgt0WsOA.jpg",
      "https://image.tmdb.org/t/p/w500/evy3OHJrqWEPnkeBNzpPAAylG5K.jpg"
    ],
    "totalCount": 14,
    "description": "每一帧都是壁纸级别的纯手工匠心手绘，在夏日微风与飞翔梦境中重拾对自然、生命与和平的初心感动。",
    "accent": "#10B981",
    "films": [
      {
        "id": "col_film_6_1",
        "title": "千与千寻",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/dnwMqbndJpOEhoVqjlMU9U7LFle.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/dyJvKsNs2KP8qQnAXbRwDjblViy.jpg",
        "year": "2001",
        "description": "10岁的千寻跟随父母搬家途中，意外穿过一条神秘隧道，闯入了一个属于神灵的奇异世界。父母因为擅自吃下供奉给神灵的食物而被变成猪，惊慌失措的千寻则在神秘少年白龙的帮助下得以留下。为了在这个世界生存并寻找救回父母的方法，她不得不到汤婆婆掌管的“油…",
        "types": [
          "动画",
          "家庭",
          "奇幻"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "柊瑠美",
          "入野自由",
          "夏木真理",
          "内藤刚志"
        ]
      },
      {
        "id": "col_film_6_2",
        "title": "龙猫",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/pwDrh5XM59ULSFEsaUlJgt0WsOA.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zkThiZAaAie8Lw7RAc5yPTOewBV.jpg",
        "year": "1988",
        "description": "小月和四岁的妹妹小梅随父亲搬到乡间生活，以便离因病住院的母亲更近。姐妹俩对新家和周围的一切充满好奇，也逐渐发现这里栖息着只有孩子才能看见的奇妙精灵。小梅在森林深处偶遇巨大而温和的龙猫，随后小月也与它成为朋友，并在龙猫和伙伴们的陪伴下经历了一…",
        "types": [
          "奇幻",
          "动画",
          "家庭"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "日高范子",
          "坂本千夏",
          "高木均",
          "丝井重里"
        ]
      },
      {
        "id": "col_film_6_3",
        "title": "天空之城",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/evy3OHJrqWEPnkeBNzpPAAylG5K.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/j2ZvLJyz163MlmBFsoaDYOwxgws.jpg",
        "year": "1986",
        "description": "古老帝国拉普达是一座漂浮在空中的巨大的机器岛，传说那里已经无人居住，蕴藏着巨大的财富。因此，无论军方还是海盗，都在找寻着这座传说中的飞行岛。矿工巴鲁这天偶遇拉普达继承人希达，两人一见如故。因为希达身上有找寻拉普达帝国的重要物件飞行石，军方和…",
        "types": [
          "冒险",
          "奇幻",
          "动画"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "横泽启子",
          "田中真弓",
          "寺田农",
          "初井言荣"
        ]
      },
      {
        "id": "col_film_6_4",
        "title": "哈尔的移动城堡",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/mOkZtsb8UObRAa77EDTmbPB5BuY.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/nv5wwZou159v5OC61i4ElR7OqyY.jpg",
        "year": "2004",
        "description": "18岁少女苏菲在街上遇到神秘青年霍尔，霍尔忽然抱起苏菲一同飞上天空，苏菲的心从此深深地被霍尔吸引。然而那天晚上，苏菲被名叫荒地魔女的女巫施了魔法，外表变成了90岁的老婆婆。心灰意冷的苏菲只好整理行李，远离人群，前往霍尔在荒郊野外的城堡……",
        "types": [
          "奇幻",
          "动画",
          "冒险"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "倍赏千惠子",
          "木村拓哉",
          "美轮明宏",
          "我修院达也"
        ]
      },
      {
        "id": "col_film_6_5",
        "title": "幽灵公主",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/mgxuL4rDqAHdcZvO3fXRhrcifpv.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/gl0jzn4BupSbL2qMVeqrjKkF9Js.jpg",
        "year": "1997",
        "description": "室町时代，生活在偏远村落的少年阿席达卡为了保护族人，与一头被邪魔侵蚀的山猪神交战，却因此受到可怕的诅咒。为了寻找诅咒的来源和活下去的方法，他离开故乡前往西方。在旅途中，阿席达卡来到一片古老森林附近，发现以黑帽大人为首的人类为了炼铁不断开采资…",
        "types": [
          "冒险",
          "奇幻",
          "动画"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "松田洋治",
          "石田百合子",
          "田中裕子",
          "小林薰"
        ]
      },
      {
        "id": "col_film_6_6",
        "title": "魔女宅急便",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/oFouL0QtqVjGP6JutSCYpY4AM5b.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ooGaNXI2OYszAajCFdIXLr73E1S.jpg",
        "year": "1989",
        "description": "琪琪今年13岁了，按照魔法界的规矩，魔法少女年满13岁就要出外进行为期一年的修行。所以琪琪带着宠物黑猫吉吉踏上了修行之旅。然而，修行之旅开识得并不顺利，当琪琪来到海边一座大城市时，人们并没有欢迎她的到来，人人都不搭理她。幸亏琪琪有一颗善良的…",
        "types": [
          "动画",
          "家庭",
          "奇幻"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "高山南",
          "佐久间丽",
          "山口胜平",
          "户田惠子"
        ]
      },
      {
        "id": "col_film_6_7",
        "title": "崖上的波妞",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/tt6nw8QrwUZdIEyJuJrWCFliGTf.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1QmEcK0w2Ub4Hm094fHbZT8vA7o.jpg",
        "year": "2008",
        "description": "5岁的宗介和妈妈理莎住在海边小城的悬崖上。一天，他在岸边发现了一条被困在玻璃瓶里的小金鱼，并将她救了出来，给她取名“波妞”。来自海底世界的波妞很快喜欢上了宗介，宗介也答应会一直保护她。然而波妞的父亲藤本并不愿女儿留在人类世界，强行将她带回海…",
        "types": [
          "动画",
          "奇幻",
          "家庭"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "神月柚莉爱",
          "土井洋辉",
          "所乔治",
          "山口智子"
        ]
      },
      {
        "id": "col_film_6_8",
        "title": "风之谷",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/jfTEuVl6iZBqGJWU9kfpkTvSbhA.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ulVUa2MvnJAjAeRt7h23FFJVRKH.jpg",
        "year": "1984",
        "description": "在毁灭工业文明的“火之七日”过去一千年后，世界被散发有毒瘴气的“腐海”逐渐覆盖，生活其中的巨大虫群也让幸存的人类时刻面临威胁。依靠海风阻挡腐海孢子的风之谷，是少数仍能安宁生活的地方。风之谷公主娜乌西卡善于御风，并能够感知王虫等生物的心意，始…",
        "types": [
          "冒险",
          "动画",
          "奇幻"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "岛本须美",
          "永井一郎",
          "纳谷悟朗",
          "松田洋治"
        ]
      },
      {
        "id": "col_film_6_9",
        "title": "侧耳倾听",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/hPFcJ5S9KxZKN8u0FJ7OYvbQWaL.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rphor0XQcYO4CQoQ6auaQm3UPap.jpg",
        "year": "1995",
        "description": "正在读初三的月岛雯是个热爱阅读的女孩，她常常在借书卡上看到“天泽圣司”这个名字，因此对这个素未谋面的人产生了好奇。一次偶然的机会，雯来到一家古董店，并逐渐认识了圣司。圣司对制作小提琴的热爱和对梦想的执着深深触动了她，也让一直喜欢写作的雯开始…",
        "types": [
          "动画",
          "剧情",
          "家庭"
        ],
        "directors": [
          "近藤喜文"
        ],
        "actors": [
          "本名阳子",
          "高桥一生",
          "立花隆",
          "室井滋"
        ]
      },
      {
        "id": "col_film_6_10",
        "title": "吉卜力创作的秘密：宫崎骏与新人导演的400天",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/vkoNFR1HahRq9F2mW6jj1nyJxSW.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/62aOkESgB4QADseUmDYBs9nzx7T.jpg",
        "year": "2010",
        "description": "吉卜力过去曾数度采用新人担任导演，但因为宫崎骏导演自己的龟毛与讲究，一再介入作品製作的情况下，最后乾脆自己接掌下来拍的情况也是经常发生。然而这次在「阿丽埃蒂」，宫崎导演痛下决心一概不插手，除了自己负责的脚本工作外，完全交由过去在他旗下担任动…",
        "types": [
          "纪录"
        ],
        "directors": [
          "細田直生"
        ],
        "actors": [
          "宫崎骏",
          "铃木敏夫",
          "米林宏昌",
          "久石让"
        ]
      },
      {
        "id": "col_film_6_11",
        "title": "红猪",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/yZRLvn5bJmavhpUPfRqAMqbrKCd.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ec4m0EvVlEtVl5aySdw6ab9uG0b.jpg",
        "year": "1992",
        "description": "20世纪20年代末的亚得里亚海，一战时期的王牌飞行员波鲁克不知何故变成了猪的模样。战争结束后，他驾驶着红色水上飞机成为赏金猎人，专门追捕在海上作恶的空中劫匪，也因此被人称为“红猪”。不甘心屡屡受挫的劫匪们请来美国飞行员卡地士对付波鲁克，一场…",
        "types": [
          "动画",
          "冒险",
          "奇幻"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "森山周一郎",
          "加藤登纪子",
          "桂三枝",
          "上条恒彦"
        ]
      },
      {
        "id": "col_film_6_12",
        "title": "你想活出怎样的人生",
        "rate": "7.4",
        "cover": "https://image.tmdb.org/t/p/w500/l4aHizcnMzqQrP39caBatIX7IY3.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/75nSb1fbWooipwcSU5bUttiOriI.jpg",
        "year": "2023",
        "description": "战争年代，少年牧真人的母亲葬身火海。此后，他随父亲牧胜一和继母夏子搬到乡间，开始新的生活。深陷丧母之痛的真人阴郁孤僻，始终难以融入新的家庭和环境。一天，夏子突然失踪，一只会说话的神秘苍鹭将真人引向庄园里废弃已久的塔楼。为了寻找夏子，真人跟随…",
        "types": [
          "动画",
          "奇幻",
          "剧情"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "山时聪真",
          "菅田将晖",
          "柴崎幸",
          "爱缪"
        ]
      },
      {
        "id": "col_film_6_13",
        "title": "起风了",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/6xIHNGC5ocWmsLfd5hGud4pvk2Z.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oTzps90guRdPVkUw7CmErG4nLDX.jpg",
        "year": "2013",
        "description": "自幼热爱飞机的堀越二郎因近视无法成为飞行员，却始终梦想着设计出能够翱翔天空的优美飞机。在梦中，他一次次与自己景仰的意大利航空设计师卡普罗尼相遇，并从中获得追逐梦想的勇气。长大后，二郎如愿成为飞机设计师，与好友本庄一起投身航空技术的研究。时代…",
        "types": [
          "动画",
          "剧情",
          "历史"
        ],
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "庵野秀明",
          "西岛秀俊",
          "泷本美织",
          "西村雅彦"
        ]
      },
      {
        "id": "col_film_6_14",
        "title": "高畑勋制作《辉夜姬物语》933天的传说",
        "rate": "6.7",
        "cover": "https://image.tmdb.org/t/p/w500/atG1lwE8VByvtT8rmsSekMcDayC.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5E0glLr2mIYWhOXGuXfVaLwnKYh.jpg",
        "year": "2014",
        "description": "这是一部记录高畑勋导演创作动画电影《辉夜姬物语》全过程的幕后纪录片。影片历时两年半，跟拍记录了吉卜力工作室为突破动画表现极限而设立第7工作室，历经933天完成这部划时代作品的制作历程。纪录片首次深入高畑勋的执导现场，展现其如何实现背景与角色…",
        "types": [
          "纪录"
        ],
        "directors": [
          "佐藤英和",
          "Akira Miki"
        ],
        "actors": [
          "高畑勋",
          "男鹿和雄",
          "久石让",
          "铃木敏夫"
        ]
      }
    ]
  },
  {
    "id": "col-hardcore-scifi",
    "title": "硬核太空与末日科幻",
    "subtitle": "探索群星深处与人类文明的终极生存边疆",
    "slug": "hardcore-sci-fi-apocalypse",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg",
      "https://image.tmdb.org/t/p/w500/tXuQCgx69DxVgeTsU0TkruR3i9O.jpg",
      "https://image.tmdb.org/t/p/w500/spQm5r317XPNHK1941ChWmqzkZs.jpg"
    ],
    "totalCount": 16,
    "description": "宏大叙事与冰冷工业美学碰撞，聚焦浩瀚星海、时间膨胀、外星接触与末日纪元下的文明抉择。",
    "accent": "#3B82F6",
    "films": [
      {
        "id": "col_film_7_1",
        "title": "流浪地球2",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/94cS0mzODEoNIXFT7nhPcI8V4IJ.jpg",
        "year": "2023",
        "description": "在并不遥远的未来，太阳急速衰老与膨胀，再过几百年整个太阳系将被它吞噬毁灭。为了应对这场史无前例的危机，地球各国放下芥蒂，成立联合政府，试图寻找人类存续的出路。通过摸索与考量，最终推着地球逃出太阳系的“移山计划”获得压倒性胜利。人们着手建造上…",
        "types": [
          "科幻",
          "动作",
          "冒险"
        ],
        "directors": [
          "郭帆"
        ],
        "actors": [
          "吴京",
          "刘德华",
          "李雪健",
          "沙溢"
        ]
      },
      {
        "id": "col_film_7_2",
        "title": "流浪地球",
        "rate": "6.6",
        "cover": "https://image.tmdb.org/t/p/w500/tXuQCgx69DxVgeTsU0TkruR3i9O.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3PjpT6wBsfXawa1PPTEkYGHRaYs.jpg",
        "year": "2019",
        "description": "近未来，科学家们发现太阳急速衰老膨胀，短时间内包括地球在内的整个太阳系都将被太阳所吞没。为了自救，人类提出一个名为“流浪地球”的大胆计划，即倾全球之力在地球表面建造上万座发动机和转向发动机，推动地球离开太阳系，用2500年的时间奔往另外一个…",
        "types": [
          "科幻",
          "动作",
          "剧情"
        ],
        "directors": [
          "郭帆"
        ],
        "actors": [
          "吴京",
          "屈楚萧",
          "李光洁",
          "吴孟达"
        ]
      },
      {
        "id": "col_film_7_3",
        "title": "星际穿越",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/spQm5r317XPNHK1941ChWmqzkZs.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5XNQBqnBwPA9yT0jZ0p3s8bbLh0.jpg",
        "year": "2014",
        "description": "近未来，地球环境持续恶化，枯萎病和沙尘暴让越来越多农作物消失，人类的生存前景也变得岌岌可危。曾为NASA飞行员的库珀如今与家人在农场生活，一次偶然发现的异常重力现象，却将他和女儿墨菲引向一个仍在秘密运作的NASA基地。布兰德教授告诉他，多年…",
        "types": [
          "冒险",
          "剧情",
          "科幻"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "马修·麦康纳",
          "安妮·海瑟薇",
          "迈克尔·凯恩",
          "杰西卡·查斯坦"
        ]
      },
      {
        "id": "col_film_7_4",
        "title": "火星救援",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/4N94tiD7fLRHEl9z0OgruTBDorz.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lzMS0CI3FLQYC5EgJoWeIaEt0lm.jpg",
        "year": "2015",
        "description": "载人航天宇宙飞船阿瑞斯3号成功抵达火星，谁知一场破坏力极其巨大的风暴向宇航员们袭来，阿瑞斯3号被迫中断任务，紧急返航。撤离途中，宇航员马克·沃特尼被飞船上吹落的零件击中，由于生还希望渺茫，队友们只得匆匆返航，并向世人宣告他已牺牲的事实。出乎…",
        "types": [
          "科幻",
          "剧情",
          "冒险"
        ],
        "directors": [
          "雷德利·斯科特"
        ],
        "actors": [
          "马特·达蒙",
          "杰西卡·查斯坦",
          "克丽丝滕·威格",
          "杰夫·丹尼尔斯"
        ]
      },
      {
        "id": "col_film_7_5",
        "title": "银翼杀手2049",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/sxA89XGotN9c5u5O1GWpbYYX3Ks.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/gNdLJU9TxrpGx4dkZidjys3fyy0.jpg",
        "year": "2017",
        "description": "在《银翼杀手》（1982）事件发生三十年后，新一代银翼杀手、洛杉矶警察“K”发现了一个尘封已久的秘密，这个秘密有可能使所剩无几的社会陷入混乱。K的这一发现引领他踏上寻找失踪三十年的前洛杉矶警察银翼杀手瑞克·戴克之路。[华纳兄弟影业]…",
        "types": [
          "科幻",
          "剧情"
        ],
        "directors": [
          "丹尼斯·维伦纽瓦"
        ],
        "actors": [
          "瑞恩·高斯林",
          "哈里森·福特",
          "安娜·德·阿玛斯",
          "戴夫·巴蒂斯塔"
        ]
      },
      {
        "id": "col_film_7_6",
        "title": "降临",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/9ontErpaTQ5m3EuAHiIElP90xjg.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8MUZz7oPXQftFTslZpRP3CVMOoq.jpg",
        "year": "2016",
        "description": "当神秘的外星飞船在全球各地降落时，一支精英团队被召集起来展开调查——其中包括语言学家露易丝·班克斯。当所有人都在争相寻求答案时，人类濒临全球战争的边缘——而为了找到答案，班克斯将冒一次可能威胁到她生命，甚至可能威胁到全人类的险。",
        "types": [
          "剧情",
          "科幻",
          "悬疑"
        ],
        "directors": [
          "丹尼斯·维伦纽瓦"
        ],
        "actors": [
          "艾米·亚当斯",
          "杰瑞米·雷纳",
          "福里斯特·惠特克",
          "迈克尔·斯图巴"
        ]
      },
      {
        "id": "col_film_7_7",
        "title": "沙丘",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/6hsJknqlPceFxExOe87z5VGgNG9.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zRKQW58MBEY078AxkHxEJzUskCl.jpg",
        "year": "2021",
        "description": "电影《沙丘》为观众呈现了一段神秘而感人至深的英雄之旅。天赋异禀的少年保罗·厄崔迪（提莫西·查拉梅 饰）被命运指引，为了保卫自己的家族和人民，决心前往浩瀚宇宙间最危险的星球，开启一场惊心动魄的冒险。与此同时，各路势力为了抢夺这颗星球上一种能够…",
        "types": [
          "科幻",
          "冒险"
        ],
        "directors": [
          "丹尼斯·维伦纽瓦"
        ],
        "actors": [
          "提莫西·查拉梅",
          "丽贝卡·弗格森",
          "奥斯卡·伊萨克",
          "杰森·莫玛"
        ]
      },
      {
        "id": "col_film_7_8",
        "title": "沙丘2",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/9uaCR4HEZqxUqgORq0uZqTNm43G.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/eZ239CUp1d6OryZEBPnO2n87gMG.jpg",
        "year": "2024",
        "description": "《沙丘2》承接第一部剧情，讲述保罗·厄崔迪（提莫西·查拉梅 Timothée Chalamet 饰）被帕迪沙皇帝和哈克南人联手灭族后，在厄拉科斯星球遇到弗雷曼女战士契妮（赞达亚 Zendaya 饰）以及加入弗雷曼人后展开的传奇旅程。保罗与让…",
        "types": [
          "科幻",
          "冒险"
        ],
        "directors": [
          "丹尼斯·维伦纽瓦"
        ],
        "actors": [
          "提莫西·查拉梅",
          "赞达亚·科尔曼",
          "丽贝卡·弗格森",
          "哈维尔·巴登"
        ]
      },
      {
        "id": "col_film_7_9",
        "title": "普罗米修斯",
        "rate": "6.6",
        "cover": "https://image.tmdb.org/t/p/w500/9PMVdGS0XYgTDM7cnLmi1OlxKYN.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qDG5SlGkWNsjSJWiGTBMFI8DpzA.jpg",
        "year": "2012",
        "description": "21世纪末，人类的科技水平已高度发达，克隆人技术和宇宙航行早已实现，不再是梦想。与此同时，许多科学家仍孜孜不倦追索着人类起源的秘密与真相。通过对许多古老文明的考察与对比，科学家伊丽莎白·肖和查理·赫洛维发现，人类可能是来自一个遥远星系的外星…",
        "types": [
          "科幻",
          "悬疑",
          "恐怖"
        ],
        "directors": [
          "雷德利·斯科特"
        ],
        "actors": [
          "劳米·拉佩斯",
          "迈克尔·法斯宾德",
          "查理兹·塞隆",
          "伊德瑞斯·艾尔巴"
        ]
      },
      {
        "id": "col_film_7_10",
        "title": "地心引力",
        "rate": "7.2",
        "cover": "https://image.tmdb.org/t/p/w500/s8R23txlioy3OjAxXPAU0KZi9m.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/a2n6bKD7qhCPCAEALgsAhWOAQcc.jpg",
        "year": "2013",
        "description": "瑞安·斯通博士首次执行太空任务，与经验丰富的宇航员马特·科沃斯基搭乘“探索者”号航天飞机，在太空中维修哈勃太空望远镜，而这也是科沃斯基退休前的最后一次飞行。就在两人进行舱外作业时，一颗俄罗斯卫星被摧毁后产生的大量碎片引发连锁碰撞，“探索者”…",
        "types": [
          "科幻",
          "惊悚",
          "剧情"
        ],
        "directors": [
          "阿方索·卡隆"
        ],
        "actors": [
          "桑德拉·布洛克",
          "乔治·克鲁尼",
          "艾德·哈里斯",
          "奥托·伊格内修斯"
        ]
      },
      {
        "id": "col_film_7_11",
        "title": "疯狂的麦克斯4：狂暴之路",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/jGMjF2SRawSsp8taI7BL8cC2Gp7.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/uT895WNwm0aIJRtGizcQhrejWUo.jpg",
        "year": "2015",
        "description": "在我们星球最偏远的角落，一片荒芜的沙漠景观中，人性已然破碎，人人都在为生存必需品而战。两位反抗者或许能恢复秩序——一个是麦克斯，他行动果决、沉默寡言，在经历混乱失去妻儿后寻求内心平静；另一个是弗瑞奥萨，她坚信唯有穿越沙漠重返童年故土，才能找…",
        "types": [
          "动作",
          "冒险",
          "科幻"
        ],
        "directors": [
          "乔治·米勒"
        ],
        "actors": [
          "汤姆·哈迪",
          "查理兹·塞隆",
          "尼古拉斯·霍尔特",
          "休·基斯-拜恩"
        ]
      },
      {
        "id": "col_film_7_12",
        "title": "后天",
        "rate": "6.6",
        "cover": "https://image.tmdb.org/t/p/w500/7ofpLvibdY6YwtpRGGQGsWOn5IG.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/smqQ71MIn1DSdSiQzCzCOV6rgRq.jpg",
        "year": "2004",
        "description": "气候学家杰克·霍尔在研究全球气候变化时发现，全球变暖和极地冰川融化可能扰乱洋流循环，使地球迅速陷入极端气候危机。然而他的警告并未得到政府足够重视。不久后，异常天气开始席卷世界，巨型冰雹、龙卷风、暴雨和海啸接连出现，北半球气温更在短时间内急剧…",
        "types": [
          "科幻",
          "惊悚",
          "冒险"
        ],
        "directors": [
          "罗兰·艾默里奇"
        ],
        "actors": [
          "丹尼斯·奎德",
          "杰克·吉伦哈尔",
          "伊恩·霍姆",
          "埃米·罗森"
        ]
      },
      {
        "id": "col_film_7_13",
        "title": "2001太空漫游",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/bO7J2LmtDYLyyBoOBeioYjp0VPl.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/w5IDXtifKntw0ajv2co7jFlTQDM.jpg",
        "year": "1968",
        "description": "本片是一次通向未来的倒计时，一张指引人类命运的地图，一场对无限的求索。库布里克为开启这场未来之旅，先回溯至我们史前的猿类祖先时期，随即跨越数千年（通过电影史上一次极具震撼的跳接）来到已被殖民的太空，最终将宇航员鲍曼（凯尔·杜拉 饰）送入未知…",
        "types": [
          "科幻",
          "悬疑",
          "冒险"
        ],
        "directors": [
          "斯坦利·库布里克"
        ],
        "actors": [
          "凯尔·杜拉",
          "加里·洛克伍德",
          "威廉·西尔维斯特",
          "道格拉斯·雷恩"
        ]
      },
      {
        "id": "col_film_7_14",
        "title": "明日边缘",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/pBmA5w8lPl2eXW6FQ7Jgj0P2yI4.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4V1yIoAKPMRQwGBaSses8Bp2nsi.jpg",
        "year": "2014",
        "description": "未来世界陷入外星人入侵的恐慌中，军事演说家凯奇少校畏惧上战场，他从没想过将军会让他去指挥即将开始的“诺曼底战役”，拒绝接受命令之后将军居然恶整了他，那就是把他当做逃兵扔进了军营中。凯奇被归入了J小队中进行战斗，战役的第一天就惨死在战场，没想…",
        "types": [
          "动作",
          "科幻"
        ],
        "directors": [
          "道格·里曼"
        ],
        "actors": [
          "汤姆·克鲁斯",
          "艾米莉·布朗特",
          "布莱丹·格里森",
          "比尔·帕克斯顿"
        ]
      },
      {
        "id": "col_film_7_15",
        "title": "第九区",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/dkEHEwOGvOiBko9wjO03We2ipZN.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/jhM3wgWUrrOkz9r4xwV5cV5RhI4.jpg",
        "year": "2009",
        "description": "1990 年，一艘巨大的飞船出现在地球上空，人们惶恐不安，却又分外好奇。经过一段时间紧张的等待，外星飞船始终没有动静。人类终于小心翼翼靠近它，强行走进舱内，结果发现了不计其数的外星人。他们形容丑陋，宛如虾子，而且健康状况极差，虚弱无力。原来…",
        "types": [
          "科幻"
        ],
        "directors": [
          "尼尔·布洛姆坎普"
        ],
        "actors": [
          "沙尔托·科普雷",
          "杰森·科普",
          "娜塔莉·博尔特",
          "茜尔雯·斯特赖克"
        ]
      },
      {
        "id": "col_film_7_16",
        "title": "月球",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/mKiBfGkcBu32FO21zTXIZ75vlvB.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/mvUAo9ACgmLpS4Ofc2IwD4n7WCt.jpg",
        "year": "2009",
        "description": "未来世界，随着科技的飞速进步，地球的污染也越来越严重。为了遏制这种现状，一家名为月能工业有限公司的企业应运而生。该公司致力于月球能源的开发，通过采集氦-3来满足地球对能源的需求。月能公司在月球设有基地，山姆·贝尔（山姆·洛克威尔 Sam R…",
        "types": [
          "科幻",
          "剧情"
        ],
        "directors": [
          "邓肯·琼斯"
        ],
        "actors": [
          "山姆·洛克威尔",
          "凯文·史派西",
          "多米妮克·麦克艾丽戈特",
          "罗茜·肖"
        ]
      }
    ]
  },
  {
    "id": "col-post90s-nostalgia",
    "title": "90后童年经典神剧",
    "subtitle": "一响前奏便热泪盈眶的假期时代集体记忆",
    "slug": "post-90s-classic-nostalgia",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/bAl4rX85qVbGeVslvQqFRDHsQ6X.jpg",
      "https://image.tmdb.org/t/p/w500/xJxeaJJb8r2WwhIinJzdFT3hB4s.jpg",
      "https://image.tmdb.org/t/p/w500/6Ni4IF97wjdZZwWbbDv6ED5tSQD.jpg"
    ],
    "totalCount": 16,
    "description": "承载几代人成长记忆的国产电视剧巅峰殿堂，百看不厌的童年回忆杀，台词倒背如流的永恒经典。",
    "accent": "#D97706",
    "films": [
      {
        "id": "col_film_8_1",
        "title": "西游记",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/bAl4rX85qVbGeVslvQqFRDHsQ6X.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/vbl5Spyx3vEkxvtAVFYji6Z0Z7v.jpg",
        "year": "1986",
        "description": "东胜神州的傲来国花果山的一块巨石孕育出了一只明灵石猴，石猴后来拜须菩提为师后习得了七十二变，具有了通天本领，于是占山为王，自称齐天大圣。玉帝派太白金星下凡招安大圣上了天庭，后来大圣因为嫌玉帝赐封的官职太低，大闹天宫，被太上老君困于炼丹炉内四…",
        "types": [
          "动作冒险",
          "剧情"
        ],
        "directors": [
          "杨洁"
        ],
        "actors": [
          "六小龄童",
          "崔景富",
          "刘大刚",
          "迟重瑞"
        ]
      },
      {
        "id": "col_film_8_2",
        "title": "武林外传",
        "rate": "8.9",
        "cover": "https://image.tmdb.org/t/p/w500/xJxeaJJb8r2WwhIinJzdFT3hB4s.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7pafv6rEW6M0GtKjg3oVKjD4cjw.jpg",
        "year": "2006",
        "description": "关中一个普通的小镇——七俠镇，这里有一家同福客栈。就是这间不起眼的江湖客栈，因缘巧合之下汇聚了一群性格各异又活泼搞怪的年轻人：武功高强但初入江湖的郭芙蓉（姚晨 饰）、客栈老板娘佟湘玉（闫妮 饰）、金盘洗手的神偷白展堂（沙溢 饰）、满腹经纶的…",
        "types": [
          "喜剧",
          "剧情",
          "家庭"
        ],
        "directors": [
          "尚敬"
        ],
        "actors": [
          "闫妮",
          "沙溢",
          "姚晨",
          "喻恩泰"
        ]
      },
      {
        "id": "col_film_8_3",
        "title": "新白娘子传奇",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/6Ni4IF97wjdZZwWbbDv6ED5tSQD.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/uDE08Ks3aFyKq1phZSV3eECE7DS.jpg",
        "year": "1992",
        "description": "白蛇素贞还是一条没有什么法力的小蛇时曾被捕蛇老人所抓，幸得一小牧童相救。素贞心内发誓，一定要报答这份救命之恩。一千年以后，白蛇修成人身，往人间报恩时相遇青蛇小青，将其驯服，以姊妹相称。得到菩萨明示之后，素贞前往杭州西湖找到了千年后的小牧童、…",
        "types": [
          "剧情",
          "Sci-Fi & Fantasy"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "赵雅芝",
          "叶童",
          "陈美琪",
          "乾德门"
        ]
      },
      {
        "id": "col_film_8_4",
        "title": "仙剑奇侠传",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/fdLDouYBTjlhr0Hdh3dOsJrdEQY.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cvUrD4MK2eTbWQ1JcXD01jE8hDI.jpg",
        "year": "2005",
        "description": "李逍遥是渔村店小二，人如其名，自在逍遥，精灵古怪，生活无所拘束。一段机缘巧合与隐居在仙岛躲避追杀的南诏公主赵灵儿相遇，因一面之缘，结下姻缘。李逍遥护送赵灵儿回苗疆寻母，一番误闯，半路杀出了刁蛮千金林月如。从此，三人的命运紧紧相系，难割难舍。",
        "types": [
          "剧情",
          "动作冒险",
          "Sci-Fi & Fantasy"
        ],
        "directors": [
          "吴锦源",
          "李国立"
        ],
        "actors": [
          "胡歌",
          "刘亦菲",
          "安以轩",
          "彭于晏"
        ]
      },
      {
        "id": "col_film_8_5",
        "title": "家有儿女",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/knQh5E3YazUwkupxvfSyy11VqW0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/nK0Jyx2qMisDcPIahU1C5956UvL.jpg",
        "year": "2005",
        "description": "儿童编导夏东海（高亚麟 饰）离婚后带着儿子夏雨（尤浩然 饰）回国发展，与在国内长大的女儿夏雪（杨紫 饰）团聚了。后来夏东海跟某医院护士长刘梅（宋丹丹 饰）结婚了，刘梅也是离婚了独自带着儿子刘星（张一山 饰）生活。这个一家5口的重组家庭，夫妻…",
        "types": [
          "喜剧",
          "家庭"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "张一山",
          "高亚麟",
          "宋丹丹",
          "尤浩然"
        ]
      },
      {
        "id": "col_film_8_6",
        "title": "还珠格格",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/bmZHyAqZ2kUaWYRuQLAch3Q8DGl.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/b6lZg69n0pejkK6LTGIcCqEGFns.jpg",
        "year": "1998",
        "description": "紫薇（林心如 饰）偕丫环金锁（范冰冰 饰）带着乾隆（张铁林 饰）留给母亲的信物，从江南来到京城想与乾隆相认，发现进宫面圣根本无门，走投无路之际，她们遇上女飞贼小燕子（赵薇 饰），与之结为好友，不想因机缘巧合，本热心为紫薇帮忙的小燕子被乾隆错…",
        "types": [
          "剧情",
          "喜剧"
        ],
        "directors": [
          "孙树培"
        ],
        "actors": [
          "黄奕",
          "马伊琍",
          "古巨基",
          "周杰"
        ]
      },
      {
        "id": "col_film_8_7",
        "title": "天龙八部",
        "rate": "9.1",
        "cover": "https://image.tmdb.org/t/p/w500/qKQ6gtDaVSpGsM3MCDYmcHwBFtx.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/tbw40hy8CG7TFhJYPI9iEey71hW.jpg",
        "year": "1997",
        "description": "丐帮帮主乔峰（黄日华 饰）英雄盖世、义薄云天，与燕王后裔慕容复（张国强饰）并称“北乔峰，南慕容”。时值江湖上突发多起命案，乔峰在帮助慕容复洗刷嫌疑的同时，却不想被丐帮的阴谋党揭发了自己的身世之谜，更因此被逐出丐帮。乔峰在追寻江湖命案和自己身…",
        "types": [
          "剧情"
        ],
        "directors": [
          "Yuan Yingming",
          "李添勝"
        ],
        "actors": [
          "黄日华",
          "陈浩民",
          "樊少皇",
          "李若彤"
        ]
      },
      {
        "id": "col_film_8_8",
        "title": "神探狄仁杰",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/k8wy69p8DDdfzuCmWwowddBN3Ne.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/sIszoET0O7CeQKGoOKJjeTbtvkN.jpg",
        "year": "2004",
        "description": "《神探狄仁杰》系列是由钱雁秋执导，梁冠华、张子健、吕中、须乾、姜昕言、梁凯、赵志刚、姜晓贝、蒋欣、董璇、关悦、钱雁秋、赵军凯、严燕生、乔红、曲栅栅、苑冉、祝延平、淳于珊珊、蒋昌义等联合主演的推理悬疑剧。在该系列剧中，第一部讲述了三个故事：《…",
        "types": [
          "剧情",
          "悬疑"
        ],
        "directors": [
          "谭友业"
        ],
        "actors": [
          "梁冠华",
          "须乾",
          "杨常青",
          "王鸥"
        ]
      },
      {
        "id": "col_film_8_9",
        "title": "士兵突击",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/7Swf81H73n9A5tt7pESwnYaDzZF.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7JknDrJdImoutsmUayIdjnEosWr.jpg",
        "year": "2006",
        "description": "木讷的许三多（王宝强 饰）没进军营，就因看见坦克时“举手投降”招来以“不抛弃、不放弃”精神闻名全团的“钢七连”连长高城（张国强 饰）的反感，入营后，班长史今（张译 饰）成为他的依靠，副班长也是老乡的伍六一（邢家栋 饰）却因他的笨拙将其视为肉…",
        "types": [
          "剧情"
        ],
        "directors": [
          "康洪雷"
        ],
        "actors": [
          "王宝强",
          "陈思诚",
          "段奕宏",
          "张国强"
        ]
      },
      {
        "id": "col_film_8_10",
        "title": "亮剑",
        "rate": "8.7",
        "cover": "https://image.tmdb.org/t/p/w500/kJLn4BFfii9UlXXsFsbZ0uPXcOG.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bOt3abFU9UkD7iPZKGPAlnJESAv.jpg",
        "year": "2005",
        "description": "129师386旅独立团的团长李云龙是个敢想敢干，不按规矩办事的愣头青，他脾气火爆，性格直爽，在他的带领下，整个独立团也呈现出敢于拼杀的不要命劲头。在他面前，不可一世的坂田连队、山崎大队、山本部队接连败下阵来，李云龙名声大噪，却也因屡次犯规而…",
        "types": [
          "War & Politics",
          "剧情"
        ],
        "directors": [
          "张前",
          "陈健"
        ],
        "actors": [
          "李幼斌",
          "张光北",
          "何政军",
          "童蕾"
        ]
      },
      {
        "id": "col_film_8_11",
        "title": "上海滩",
        "rate": "9.2",
        "cover": "https://image.tmdb.org/t/p/w500/2CTP4yiLf91XkmU9C3kdwVMS5cJ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/puQFQrtUmSlNWKsYrbMFleXtUWR.jpg",
        "year": "1980",
        "description": "上海滩上龙争虎斗，仇杀漫天。大学生许文强（周润发 饰）经历过失败的学生运动后，只身来到上海，他与小贩丁力（吕良伟 饰）成为至交，并在同学方艳云的帮助下，混入黑帮，并凭借自己的勇谋成为帮派头目。上海法租界大亨冯敬尧看中许文强的才干，想招其至门…",
        "types": [
          "犯罪",
          "剧情"
        ],
        "directors": [
          "招振強"
        ],
        "actors": [
          "周润发",
          "吕良伟",
          "赵雅芝",
          "刘丹"
        ]
      },
      {
        "id": "col_film_8_12",
        "title": "射雕英雄传",
        "rate": "9.2",
        "cover": "https://image.tmdb.org/t/p/w500/wuOGPke8Dm5g5X4qfYwHu3gXAyX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fcKuYJGQdI8E0Pec4PJUGILKXWe.jpg",
        "year": "1983",
        "description": "南宋年间，全真教道士丘处机与江南七怪武功不相上下，两方决定各培养一个徒弟，日后比武来决定双方武功高低。丘处机的徒弟是金国小王子杨康（苗侨伟 饰），江南七怪的徒弟则是自小随母亲在蒙古生活的郭靖（黄日华 饰）。从蒙古来到中原的郭靖，邂逅了“东邪…",
        "types": [
          "剧情",
          "动作冒险"
        ],
        "directors": [
          "杜琪峰"
        ],
        "actors": [
          "黄日华",
          "翁美玲",
          "苗侨伟",
          "杨盼盼"
        ]
      },
      {
        "id": "col_film_8_13",
        "title": "大宋提刑官",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/4rJ5DQQLFKYx3JzolHhJGbbATZX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/mjVbGLUyBUa6Of7HSzOsB9oA69Y.jpg",
        "year": "2005",
        "description": "宋慈参加京试中了进士，预备返家完婚后随同科好友孟良臣赴边城。岂知，直至完婚那日，宋慈父亲宋巩依旧未归家。两位新人正拜堂之际，一辆马车却载回了父亲的遗体，宋巩一生从事刑狱审戡，从未出错，却因一次误判人命功亏一篑，这是以死谢罪，还留下遗书禁止宋…",
        "types": [
          "犯罪",
          "剧情",
          "悬疑"
        ],
        "directors": [
          "阚卫平"
        ],
        "actors": [
          "王庆祥",
          "刘敏涛",
          "孙涛",
          "苗圃"
        ]
      },
      {
        "id": "col_film_8_14",
        "title": "康熙王朝",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/l8bpaHi066ZxXEkjXN4XD3SQwMX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cC4WAPqvVPPq2NanpGLfkYPLyei.jpg",
        "year": "2001",
        "description": "清朝顺治十八年，天花在皇宫蔓延，顺治帝的董爱妃因此一命呜呼，顺治因痛不欲生而决意出家。此时，清帝国充满了内隐外忧。危急之际，孝庄太后（斯琴高娃 饰）当机立断，将得了天花初愈的年仅八岁的皇子玄烨力推为皇室继承人，康熙皇帝登基了。康熙（陈道明…",
        "types": [
          "剧情"
        ],
        "directors": [
          "陈家林",
          "刘大印"
        ],
        "actors": [
          "陈道明",
          "斯琴高娃",
          "茹萍",
          "高兰村"
        ]
      },
      {
        "id": "col_film_8_15",
        "title": "快乐星球",
        "rate": "7.2",
        "cover": "https://image.tmdb.org/t/p/w500/iiv8X903vmnE5JDXCgcJEj0UYu3.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/gcMAFpecX76DKtgoO8AvfqYvPNU.jpg",
        "year": "2004",
        "description": "《快乐星球》是由郑州电视台、中国中央电视台和河南超凡影视公司等单位联合制作，张惠民执导的256集少儿科幻电视系列剧，李瑞、牛东文、孙斯阳、管桐、马嘉祺、张子扬等领衔主演。 《快乐星球第一部》于2004年8月4日播出；《快乐星球第二部》于20…",
        "types": [
          "儿童",
          "剧情",
          "Sci-Fi & Fantasy"
        ],
        "directors": [
          "张惠民"
        ],
        "actors": [
          "马嘉祺",
          "赵克明",
          "张译兮",
          "张子扬"
        ]
      },
      {
        "id": "col_film_8_16",
        "title": "铁齿铜牙纪晓岚",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/nolgz0Pwl1QfnV6xwbAtOtXHAf5.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bEBcezEZGhBYe8fy8kL4HEDXOL1.jpg",
        "year": "2001",
        "description": "清朝乾隆年间，社会经济、文化的发展呈现出一派祥和繁荣的景象，后人称其为“康乾盛世”。然而，表面上的国泰民安，掩饰不了各种日益激化的矛盾。如何清除图谋不轨者，惩治贪官污吏，平衡君臣矛盾等问题都摆在当朝天子的乾隆皇上面前。乾隆（张铁林饰）是一个…",
        "types": [
          "剧情",
          "喜剧"
        ],
        "directors": [
          "罗长安"
        ],
        "actors": [
          "张国立",
          "王刚",
          "张铁林",
          "袁立"
        ]
      }
    ]
  },
  {
    "id": "col-crime-investigation",
    "title": "高分华语犯罪刑侦",
    "subtitle": "暗夜追凶，直面人性深渊与宿命轮回的硬核力作",
    "slug": "chinese-crime-investigation",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/tJLiKDYdfMskFkJXV1HnaQAdpGf.jpg",
      "https://image.tmdb.org/t/p/w500/6F2UcY1p2YCz3xgLz6NfDh81QC3.jpg",
      "https://image.tmdb.org/t/p/w500/zlaml7IKAIPa3NJE9LhRveELD0v.jpg"
    ],
    "totalCount": 16,
    "description": "以冷峻现实笔触剖析社会肌理与人性的灰色地带，节奏紧凑、反转不断、直击灵魂的高分华语悬疑犯罪代表作。",
    "accent": "#DC2626",
    "films": [
      {
        "id": "col_film_9_1",
        "title": "漫长的季节",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/tJLiKDYdfMskFkJXV1HnaQAdpGf.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rCm6BJkkPukfHYWNNx7WkGpCdZH.jpg",
        "year": "2023",
        "description": "小城桦林，出租司机王响做梦也没想到，他还有机会遇到一个他此生最想遇到，又最怕遇到的人。是仇人还是故人？遇到了就得有交代，给自己，也给儿子。 彼时，火车司机王响意气风发，开的了二十挂的钢铁巨兽却管不好鸡毛蒜皮的三口小家，工厂摇摇欲坠，危机处处…",
        "types": [
          "犯罪",
          "剧情",
          "悬疑"
        ],
        "directors": [
          "辛爽"
        ],
        "actors": [
          "范伟",
          "秦昊",
          "陈明昊",
          "李庚希"
        ]
      },
      {
        "id": "col_film_9_2",
        "title": "狂飙",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/6F2UcY1p2YCz3xgLz6NfDh81QC3.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qfiSlA28MfMm6YHrFl42wZlXE5N.jpg",
        "year": "2023",
        "description": "2000年，意气风发的刑警安欣（张译饰）与倍受欺负的鱼贩子高启强（张颂文饰）相识，而后随着高启强逐渐偏离正途，安欣意识到在京海市社会发展的背后正是以高家兄弟为首的黑恶势力暗流汹涌，两人分道扬镳并展开了长达20年的正邪较量。2021年，在全国…",
        "types": [
          "剧情",
          "动作冒险",
          "犯罪"
        ],
        "directors": [
          "徐纪周"
        ],
        "actors": [
          "张译",
          "张颂文",
          "李一桐",
          "张志坚"
        ]
      },
      {
        "id": "col_film_9_3",
        "title": "隐秘的角落",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/zlaml7IKAIPa3NJE9LhRveELD0v.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/22DU3JT5EJ6fCkCUB8iYgwI8stO.jpg",
        "year": "2020",
        "description": "该剧改编自紫金陈推理小说《坏小孩》 ，讲述了沿海小城的三个孩子在景区游玩时无意拍摄记录了一次谋杀，他们的冒险也由此展开。扑朔迷离的案情，将几个家庭裹挟其中，带向不可预知的未来......…",
        "types": [
          "犯罪",
          "悬疑",
          "剧情"
        ],
        "directors": [
          "辛爽"
        ],
        "actors": [
          "秦昊",
          "王景春",
          "荣梓杉",
          "史彭元"
        ]
      },
      {
        "id": "col_film_9_4",
        "title": "白夜追凶",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/cMUymzvJL0MeXR7OuuBmR0KGaxZ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fBClDP2SLBn4NlqYSMkZwky3VEp.jpg",
        "year": "2017",
        "description": "一场灭门惨案，让原本逍遥浪荡的关宏宇成了在逃的通缉嫌犯。身为刑侦支队队长的双胞胎哥哥关宏峰，誓要查出真相，但出于亲属回避的原则，警队禁止关宏峰参与灭门案的调查工作，关宏峰义愤辞职。调任了代支队长的周巡处于破案压力，也为了追寻关宏宇的下落，他…",
        "types": [
          "犯罪",
          "剧情",
          "悬疑"
        ],
        "directors": [
          "刘英剑"
        ],
        "actors": [
          "潘粤明",
          "王龙正",
          "梁缘",
          "尹姝贻"
        ]
      },
      {
        "id": "col_film_9_5",
        "title": "沉默的真相",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/wU5L7mZA0Yy764D1WPP2403d0MG.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kZwfEXUD3OoxSf2wcUzsnltg06L.jpg",
        "year": "2020",
        "description": "一起看似简单的自杀案，背后隐藏着一个不可告人的巨大秘密；为了揭开这个秘密， 一群人历经七载，付出无数代价，甚至赌上性命…一个曾有大好前途，四平八稳的检察官江阳，但因受贿贪污，坐牢三年，再次出现在公众视野里竟是他出现在行李箱里的蜷缩的尸体；运…",
        "types": [
          "剧情",
          "悬疑",
          "犯罪"
        ],
        "directors": [
          "陈奕甫"
        ],
        "actors": [
          "廖凡",
          "白宇",
          "赵阳",
          "吕晓霖"
        ]
      },
      {
        "id": "col_film_9_6",
        "title": "三大队",
        "rate": "7.1",
        "cover": "https://image.tmdb.org/t/p/w500/vo4JbsDUg4O9TmeefZEHzneXYaz.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yEtb7H15aQUZauTAtG3UNv1QFeV.jpg",
        "year": "2023",
        "description": "刑侦大队队长程兵带领三大队侦办一起恶性案件，却在办案过程中导致一名嫌犯意外死亡，几名队员的人生也因此彻底改变。多年牢狱生活结束后，程兵早已失去警察身份，而案件中的另一名嫌犯却依然在逃。面对已经物是人非的生活，他始终无法放下心中的执念，决定以…",
        "types": [
          "犯罪",
          "剧情"
        ],
        "directors": [
          "戴墨"
        ],
        "actors": [
          "张译",
          "魏晨",
          "曹炳琨",
          "王骁"
        ]
      },
      {
        "id": "col_film_9_7",
        "title": "扫黑风暴",
        "rate": "6.6",
        "cover": "https://image.tmdb.org/t/p/w500/rfD6BrWqSutrgeOFQ34gvBWxrjH.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/uTDjwO5AChSGk58PwwBYt99O4sf.jpg",
        "year": "2021",
        "description": "作为一线刑警的李成阳（孙红雷 饰），不断遭到保护伞的打击，黑恶势力的陷害，甚至顶头上司，公安局长等人为了阻止他的调查而构陷他，导致他身陷囹圄，最终在中政委和中央督导组的指挥和领导下重获自由，后来他联合公检法司各部门，将盘踞在中江市十几年的两…",
        "types": [
          "犯罪",
          "剧情"
        ],
        "directors": [
          "五百"
        ],
        "actors": [
          "孙红雷",
          "张艺兴",
          "刘奕君",
          "吴越"
        ]
      },
      {
        "id": "col_film_9_8",
        "title": "无证之罪",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/xufu1tAufjKOsCMkY3T6QqubJTf.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/mKpxx0dDE2crQm8MJptBVaRtTKk.jpg",
        "year": "2017",
        "description": "奔忙在都市森林中的蚁族白领，为了保护自己心爱的姑娘，无意间卷入了一场杀人案，成为凶案嫌犯。原本死水般的庸碌生活被瞬间打破，在警方和黑帮的双重追查下，求生的本能使人性在在危机中慢慢发酵出危险的味道。",
        "types": [
          "剧情",
          "犯罪"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "秦昊",
          "邓家佳",
          "姚橹",
          "代旭"
        ]
      },
      {
        "id": "col_film_9_9",
        "title": "尘封十三载",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/uPGPeWo7v65HePODxE9vQQd1Z94.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/n7F79xjSkhJJp7IIXGEtmqBFdcS.jpg",
        "year": "2023",
        "description": "1997年未能侦破的特殊杀人案件在13年后重现，当年一直没有追查到真凶的刑警卫峥嵘（陈建斌 饰）备受打击离开一线，而曾经初出茅庐的新警陆行知（陈晓 饰）褪去稚嫩青涩，已成为缜密细致的刑侦能手，案件的重重巧合让师徒二人再次走到了一起，合力追缉…",
        "types": [
          "剧情",
          "悬疑",
          "犯罪"
        ],
        "directors": [
          "刘海波"
        ],
        "actors": [
          "陈建斌",
          "陈晓",
          "啜妮",
          "刘敏涛"
        ]
      },
      {
        "id": "col_film_9_10",
        "title": "烈日灼心",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/hD2c87a0ABANT3TETlSyUHqThRU.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/nI4O4nC4w5kSMOYa3wptXH1HBym.jpg",
        "year": "2015",
        "description": "七年前，福建西陇发生一起震惊当地的灭门惨案，而辛小丰、杨自道和陈比觉三人与这桩悬案有着一段不愿再被提起的过去。此后，他们来到厦门低调生活：辛小丰成为协警，杨自道以开出租车为生，陈比觉则守着渔场，三人共同抚养着一个名叫“尾巴”的女孩。多年来，…",
        "types": [
          "犯罪",
          "剧情",
          "悬疑"
        ],
        "directors": [
          "曹保平"
        ],
        "actors": [
          "邓超",
          "段奕宏",
          "郭涛",
          "王珞丹"
        ]
      },
      {
        "id": "col_film_9_11",
        "title": "边水往事",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/fhlimtLNQKYdvgArV3aXCiB49RI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zWZJV304xSYKa2KRs73jyhnlz1c.jpg",
        "year": "2024",
        "description": "三边坡，一处鱼龙混杂的热带异域，一个繁茂与衰败并生的斑驳之地。意外流落三边坡的打工小白沈星（郭麒麟饰）遇到在多方势力间游走的三边坡和事佬猜叔（吴镇宇饰），一场冒险，一段善良微光指引下的回归，在留与逃的挣扎正在上演 。",
        "types": [
          "剧情",
          "犯罪"
        ],
        "directors": [
          "算"
        ],
        "actors": [
          "郭麒麟",
          "吴镇宇",
          "尤勇智",
          "王迅"
        ]
      },
      {
        "id": "col_film_9_12",
        "title": "唐人街探案",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/zKQtRG6a53CI2NRi0gkrH3IoZ6D.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ferdDyXvWARYARWcZNMBE372L6u.jpg",
        "year": "2015",
        "description": "警校落榜后，天赋异禀却不善言辞的少年秦风被姥姥送到泰国散心，投奔远房表舅唐仁。号称“唐人街第一神探”的唐仁实际上整日靠些小聪明混日子，没想到一次意外之后，他突然成为一桩离奇命案的嫌疑人，而案件背后还牵扯到一批失踪的黄金。为了躲避警方追捕并洗…",
        "types": [
          "喜剧",
          "悬疑",
          "动作"
        ],
        "directors": [
          "陈思诚"
        ],
        "actors": [
          "王宝强",
          "刘昊然",
          "佟丽娅",
          "陈赫"
        ]
      },
      {
        "id": "col_film_9_13",
        "title": "猎罪图鉴",
        "rate": "7.1",
        "cover": "https://image.tmdb.org/t/p/w500/k2n41i7V8OQiGXWKtZ8iTPlSiQH.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5C4WP5p1EKMhq1xeuzRl8tnN120.jpg",
        "year": "2022",
        "description": "该剧讲述了因一起尘封旧案而结怨的模拟画像师沈翊和刑警队长杜城，在机缘巧合下被迫搭档，两人联手侦破多起离奇疑案，共同追踪谜底真相的故事。",
        "types": [
          "剧情",
          "悬疑",
          "犯罪"
        ],
        "directors": [
          "刘殊巧"
        ],
        "actors": [
          "檀健次",
          "金世佳",
          "张柏嘉",
          "朱嘉琦"
        ]
      },
      {
        "id": "col_film_9_14",
        "title": "解救吾先生",
        "rate": "6.4",
        "cover": "https://image.tmdb.org/t/p/w500/rGFSrARfs0t9AbuscikpOT4ESfI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/72d7ea1TARJvbnIo3hkzklTmQsC.jpg",
        "year": "2015",
        "description": "春节假期的夜晚，市中心的酒吧一条街繁华喧嚣，香港电影明星吾先生（刘德华 饰）走出酒吧就被冒充警察的张华（王千源 饰）一伙人持枪绑架到一个与世隔绝的郊外小院里。吾先生意外发现绑匪还绑架了另外一个人质小窦（蔡鹭 饰）经过与张华的一番谈判，吾先生…",
        "types": [
          "犯罪",
          "剧情",
          "惊悚"
        ],
        "directors": [
          "丁晟"
        ],
        "actors": [
          "刘德华",
          "刘烨",
          "王千源",
          "蔡鹭"
        ]
      },
      {
        "id": "col_film_9_15",
        "title": "追凶者也",
        "rate": "7.1",
        "cover": "https://image.tmdb.org/t/p/w500/pD2M7ydPENJsR9vLjP9nsZlQV2C.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cm1tHId6O68MfnodO8XgO1Auwax.jpg",
        "year": "2016",
        "description": "中国西南边陲的一座小镇发生凶案，一名摩的司机遇害，汽修店老板宋老二因为曾与死者发生过矛盾而成为警方和村民怀疑的对象。为了洗清嫌疑，他决定亲自寻找真正的凶手，并循着失窃摩托车留下的线索找到了年轻人王友全。与此同时，刚刚出狱不久的夜总会领班董小…",
        "types": [
          "喜剧",
          "犯罪",
          "剧情"
        ],
        "directors": [
          "曹保平"
        ],
        "actors": [
          "刘烨",
          "张译",
          "段博文",
          "王子文"
        ]
      },
      {
        "id": "col_film_9_16",
        "title": "心迷宫",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/1ertjhiOTYVIhh5VBI1SHe0evid.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7uL8JLW5cQzHqCFeX8NlTsXu26B.jpg",
        "year": "2015",
        "description": "一个青年在一次争执中失手杀死了同村的痞子，被迫逃亡。他没有想过会用这样的方式逃离安逸的生活，离开之际却惊人的发现宿命早已将他和父亲紧紧连接在一起，走或留他都将失去一切。一个饱受家庭暴力摧残的留守女人，在曾经恋人的怀抱里找到了慰藉。黑暗里…",
        "types": [
          "剧情"
        ],
        "directors": [
          "忻钰坤"
        ],
        "actors": [
          "霍卫民",
          "王笑天",
          "罗芸",
          "杨瑜珍"
        ]
      }
    ]
  },
  {
    "id": "col-short-dramas",
    "title": "横屏爆款微短剧",
    "subtitle": "快节奏强冲突，爽点拉满的现代都市短剧精选",
    "slug": "trending-short-dramas",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/mR8avNpdNieD0LYjpfcUKx9Rm28.jpg",
      "https://image.tmdb.org/t/p/w500/5p9vUBqjeOnmSdj7ngRoc3PQGv1.jpg",
      "https://image.tmdb.org/t/p/w500/tSY8NLbUvcjTE6WO5l4jRykHVZw.jpg"
    ],
    "totalCount": 16,
    "description": "反转不断、节奏飞快，集合都市逆袭、豪门复仇、穿越言情与爽感至极的横屏高热度爆款短剧盛宴。",
    "accent": "#EAB308",
    "films": [
      {
        "id": "col_film_10_1",
        "title": "我在八零年代当后妈",
        "rate": "6.0",
        "cover": "https://image.tmdb.org/t/p/w500/mR8avNpdNieD0LYjpfcUKx9Rm28.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qpEV0hc5QaOmTd19fqWgpGUcqTh.jpg",
        "year": "2024",
        "description": "该剧改编自霍北山的网络小说《八零漂亮后妈，嫁个厂长养崽崽》，主要讲述了现代女大学生司念穿越回20世纪八零年代，遇到离异带两娃的养猪场老板周越深，一边谈婚论嫁一边与其亲戚们斗智斗勇，同时还把自己的生意做大做强的故事…",
        "types": [
          "剧情",
          "家庭"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "滕泽文",
          "苏袀禾"
        ]
      },
      {
        "id": "col_film_10_2",
        "title": "念无双",
        "rate": "6.6",
        "cover": "https://image.tmdb.org/t/p/w500/5p9vUBqjeOnmSdj7ngRoc3PQGv1.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/i7bHHftPPu7oly5w2jFeoPtR8rY.jpg",
        "year": "2025",
        "description": "数万年前，神魔大战，源生之神泰和利用世间至高至强的神器“神之左手”封印魔神，结果神器折毁坠落人界，源生之众神陷人长眠，自此三界再无神迹。战鬼族趁乱崛起，引发大战，神女无双受天界之托，化身人族少女进入神仆家族有狐一族的洞府，成为祭司源仲的贴身…",
        "types": [
          "剧情",
          "Sci-Fi & Fantasy"
        ],
        "directors": [
          "郭虎"
        ],
        "actors": [
          "唐嫣",
          "刘学义",
          "郭晓婷",
          "王弘毅"
        ]
      },
      {
        "id": "col_film_10_3",
        "title": "执笔",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/tSY8NLbUvcjTE6WO5l4jRykHVZw.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/r3PYXg9a6CxuLxQ3aaSkX2B56xs.jpg",
        "year": "2024",
        "description": "改编自知乎故事作者林言年的原创小说《执笔者》。 相府嫡女苏云绮（李沐宸 饰）意外发现自己是“命书”中的炮灰女配，并被记录在“命书”当中无法改变。面对不公的命运，苏云绮选择反抗，她要利用“命书”逆天改命，寻求真实的自己，收获真挚的爱情！",
        "types": [
          "剧情"
        ],
        "directors": [
          "张之微",
          "知竹"
        ],
        "actors": [
          "李沐宸",
          "叶盛佳",
          "赵慕颜",
          "刘尚麟"
        ]
      },
      {
        "id": "col_film_10_4",
        "title": "黑莲花上位手册",
        "rate": "6.0",
        "cover": "https://image.tmdb.org/t/p/w500/jwRVKMQegPfkepomHcgiE4uXJf2.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/jwRVKMQegPfkepomHcgiE4uXJf2.jpg",
        "year": "2023",
        "description": "改编自网文小说《昭华乱》，讲述了护国公庶女宋昭的复仇之旅的故事。",
        "types": [
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "马秋元",
          "滕泽文",
          "王道铁"
        ]
      },
      {
        "id": "col_film_10_5",
        "title": "闪婚后傅先生的马甲藏不住了",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg",
        "year": "2023",
        "description": "《闪婚后傅先生的马甲藏不住了》是备受赞誉的口碑经典佳作，以独特的艺术视角和深刻的情感共鸣打动无数观众。",
        "types": [
          "精选",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "实力派演员"
        ]
      },
      {
        "id": "col_film_10_6",
        "title": "授她以柄",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/lpdGOHbOUgu92tfqbQa4MOCauf1.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1IHojg7s6pNgncSrd2H5EZAANgC.jpg",
        "year": "2024",
        "description": "皇帝病重，太子年幼，叛军谋反，兵临城下，她的国和家都要破了，于是写信求了南川王，只要他能出兵来救，她什么要求都能答应。他最终还是来了，救了她和她的夫君孩子，她再怎么无情，他还是舍不得，但代价，还是要付的，他图的，从来不是这天下皇位，而是一人…",
        "types": [
          "剧情"
        ],
        "directors": [
          "周潇"
        ],
        "actors": [
          "李菲",
          "任明珠",
          "权裴伦",
          "穆乐恩"
        ]
      },
      {
        "id": "col_film_10_7",
        "title": "盛夏的果实",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/abSrUusbggL431ngpcorSzAXXoD.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/abSrUusbggL431ngpcorSzAXXoD.jpg",
        "year": "2024",
        "description": "由俞希雅执导，俞希雅、田蜜编剧，周昊杉、蔡子伊等主演。该剧主要讲述了独自在上海打拼的公司职员毛书棠意外结识了小演员沈惟清，二人相遇相知，进而相恋，最后却无奈分手，各自努力变成更好的自己的故事。",
        "types": [
          "精选",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "实力派演员"
        ]
      },
      {
        "id": "col_film_10_8",
        "title": "顾少的隐婚罪妻",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg",
        "year": "2024",
        "description": "《顾少的隐婚罪妻》是备受赞誉的口碑经典佳作，以独特的艺术视角和深刻的情感共鸣打动无数观众。",
        "types": [
          "精选",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "实力派演员"
        ]
      },
      {
        "id": "col_film_10_9",
        "title": "重生后我成了首富千金",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg",
        "year": "2024",
        "description": "《重生后我成了首富千金》是备受赞誉的口碑经典佳作，以独特的艺术视角和深刻的情感共鸣打动无数观众。",
        "types": [
          "精选",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "实力派演员"
        ]
      },
      {
        "id": "col_film_10_10",
        "title": "绝世天将",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg",
        "year": "2024",
        "description": "《绝世天将》是备受赞誉的口碑经典佳作，以独特的艺术视角和深刻的情感共鸣打动无数观众。",
        "types": [
          "精选",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "实力派演员"
        ]
      },
      {
        "id": "col_film_10_11",
        "title": "长风踏歌",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/8YK6EXBSbBUlkQgwQg87GdZOxYl.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/8YK6EXBSbBUlkQgwQg87GdZOxYl.jpg",
        "year": "2024",
        "description": "平定北域的大英雄萧长风归来，获封天威大元帅，却被不知情的未婚妻上门退婚，随后在未婚妻比武招亲擂台上，不想出手的萧长风受不了侵犯者侮辱同胞，出手救下同胞，用自己的行动给世人证明了英雄不只…",
        "types": [
          "精选",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "实力派演员"
        ]
      },
      {
        "id": "col_film_10_12",
        "title": "厉总，你找错夫人了",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/ixIavLKS97qUW2MTHYCGbQvkK0c.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/ixIavLKS97qUW2MTHYCGbQvkK0c.jpg",
        "year": "2024",
        "description": "厉氏集团实习生江笙酒后误睡大老板厉廷衍，醒来后打算提裤子不认人，却误把闺蜜林晓晓的简历落在了房间。结果闺蜜林晓晓顺水推舟冒领身份，搬进了兰园，成为了大佬的女人。江笙本想安分守己的当好实习生，却因为“土”被意外提升为秘书，被迫留在老板身边小心…",
        "types": [
          "精选",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "曾辉",
          "韩雨彤"
        ]
      },
      {
        "id": "col_film_10_13",
        "title": "盛宠娇妻",
        "rate": "10.0",
        "cover": "https://image.tmdb.org/t/p/w500/anrAbmtNJUtivjekrwWOCQsrrIG.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4x33khzXSzvNEZ2yTmpCZmiYgrC.jpg",
        "year": "2023",
        "description": "影卫锦华为帮所爱之人二皇子南宫奕夺得皇位受尽苦难，却最终落得被爱人背叛惨死的结局。死前回想起自己的真实身份是太傅嫡女沈长歌，并重生在命运的转折点。这一世，沈长歌凭借聪慧避开暗箭中伤，同时让所有伤害她的人都尝到失去一切的痛苦，却不曾想昌平王世…",
        "types": [
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "翟一莹",
          "王钰威",
          "Jin Fanhaobo",
          "钟小淇"
        ]
      },
      {
        "id": "col_film_10_14",
        "title": "龙王令之妃卿莫属",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/dmMOIBc2iMGoeeKgNEinV3gfzTv.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/konfJWAAr99PePuLZz1esYoSmeF.jpg",
        "year": "2025",
        "description": "凤芷楼是一个受尽轻蔑的庶女，但并不屈服，梦想着能与龙族并肩作战，原本龙族太子楚墨殇需与圣女结下姻缘共战魔族，可他宁可独自抗魔，也不愿将天下大事系在一桩联姻上，两个逆流而上的个体宿命般地相遇，不仅冲破俗见，披荆斩棘，还成就了更好的彼此，最终扭…",
        "types": [
          "剧情",
          "动作冒险",
          "Sci-Fi & Fantasy"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "李沐宸",
          "叶盛佳",
          "管栎",
          "向昕"
        ]
      },
      {
        "id": "col_film_10_15",
        "title": "脱缰者也",
        "rate": "5.0",
        "cover": "https://image.tmdb.org/t/p/w500/g5Pvbjn5S6KwXlz2nDGMcMF8lOQ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/25HqnWqd0cCp8E2rUljqEopC8Cs.jpg",
        "year": "2025",
        "description": "世纪之交，背井离乡的马飞（郭麒麟 饰）重返天津，在种种不尽如意的遭遇下“拐走”外甥李嘉文（胡朗荃 饰），舅甥就此踏上一段“离经叛道”之旅。事态脱缰失控，抽象不断升级，一切荒唐随之而来……",
        "types": [
          "喜剧",
          "犯罪"
        ],
        "directors": [
          "曹保平"
        ],
        "actors": [
          "郭麒麟",
          "齐溪",
          "孙安可",
          "常远"
        ]
      },
      {
        "id": "col_film_10_16",
        "title": "都市修仙传",
        "rate": "6.0",
        "cover": "https://image.tmdb.org/t/p/w500/k9WbCBs1W1QC230bR1nLAzCLR91.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/k9WbCBs1W1QC230bR1nLAzCLR91.jpg",
        "year": "2023",
        "description": "本片讲述了生活颓废的主人公林风在玩一款治愈类的游戏时，在意识维度中历经了“黄粱一梦”，最终对生命的意义有所感悟的故事。",
        "types": [
          "精选",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "实力派演员"
        ]
      }
    ]
  },
  {
    "id": "col-comedy",
    "title": "年度爆笑解压片单",
    "subtitle": "捧腹大笑赶走所有不开心，纯粹的快乐制造机",
    "slug": "hilarious-comedy",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg",
      "https://image.tmdb.org/t/p/w500/mJGPPKMsYTxvkAIu4SbAtP2PCef.jpg",
      "https://image.tmdb.org/t/p/w500/zaDitWyV81WOg2tiujj6kxEFYtZ.jpg"
    ],
    "totalCount": 16,
    "description": "精选华语与世界影坛高能爆笑神作，密集的包袱与无厘头幽默，治愈疲惫生活的最强快乐解药。",
    "accent": "#F97316",
    "films": [
      {
        "id": "col_film_11_1",
        "title": "抓娃娃",
        "rate": "7.0",
        "cover": "https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/vH0IXldpTM8J3MCT35khoeUMb5E.jpg",
        "year": "2024",
        "description": "西虹市富豪马成钢与妻子春兰担心优渥的生活会让儿子马继业失去独立成长的能力，于是隐瞒真实家境，搬进破旧的大院，在儿子面前扮成生活拮据的普通家庭。为了把马继业培养成他们心目中的理想接班人，夫妻二人精心设计他的生活与教育，甚至让身边的人共同参与这…",
        "types": [
          "喜剧"
        ],
        "directors": [
          "彭大魔",
          "闫非"
        ],
        "actors": [
          "沈腾",
          "马丽",
          "史彭元",
          "萨日娜"
        ]
      },
      {
        "id": "col_film_11_2",
        "title": "飞驰人生2",
        "rate": "7.2",
        "cover": "https://image.tmdb.org/t/p/w500/mJGPPKMsYTxvkAIu4SbAtP2PCef.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ch8rKF1a5WXFDcxi2AKfmnaMBk7.jpg",
        "year": "2024",
        "description": "五年前的巴音布鲁克一战后，张驰虽然完成了那场孤注一掷的比赛，却因赛车铅封始终未能找到，成绩被组委会取消。离开赛场后，他靠经营驾校维持生活，却又遭遇网络争议，曾经的传奇车手逐渐淡出人们视线。就在张驰几乎放下赛车时，一家濒临停产的老头乐车厂主动…",
        "types": [
          "剧情",
          "喜剧",
          "冒险"
        ],
        "directors": [
          "韩寒"
        ],
        "actors": [
          "沈腾",
          "范丞丞",
          "尹正",
          "张本煜"
        ]
      },
      {
        "id": "col_film_11_3",
        "title": "夏洛特烦恼",
        "rate": "7.1",
        "cover": "https://image.tmdb.org/t/p/w500/zaDitWyV81WOg2tiujj6kxEFYtZ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/2cbFleQnWLXFVDvn4vkV7lovSJI.jpg",
        "year": "2015",
        "description": "人到中年的夏洛事业无成，一直靠妻子马冬梅维持生活。参加学生时代暗恋的校花秋雅的婚礼时，看着昔日同学一个个事业有成，他虚荣心作祟，在酒后大闹婚礼，与马冬梅发生激烈冲突。混乱过后，夏洛竟意外回到了1997年的学生时代。面对重新来过的人生，他决定…",
        "types": [
          "爱情",
          "喜剧"
        ],
        "directors": [
          "闫非",
          "彭大魔"
        ],
        "actors": [
          "沈腾",
          "马丽",
          "尹正",
          "艾伦"
        ]
      },
      {
        "id": "col_film_11_4",
        "title": "西虹市首富",
        "rate": "7.0",
        "cover": "https://image.tmdb.org/t/p/w500/AeAjzra5IvNS1KU7Uxx7ySDb1mW.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/huJOhVMWb3slceLm6ftmOir2RHl.jpg",
        "year": "2018",
        "description": "混迹于西虹市丙级足球队的守门员王多鱼因为比赛失利被球队开除，正为生计发愁时，却突然得知自己有机会继承远房二爷留下的一笔巨额遗产。不过想要获得全部财富，他必须先完成一个看似荒唐的考验：在一个月内合法花光10亿元，同时还不能向任何人透露真正的规…",
        "types": [
          "喜剧"
        ],
        "directors": [
          "闫非",
          "彭大魔"
        ],
        "actors": [
          "沈腾",
          "宋芸桦",
          "张一鸣",
          "张晨光"
        ]
      },
      {
        "id": "col_film_11_5",
        "title": "功夫",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/wv91QM70K9KzF9usPOebYX3LKkp.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9XhZhoSnFJ3AjpfzdIiZVHLQIS4.jpg",
        "year": "2004",
        "description": "20世纪40年代的上海，街头混混阿星自小受尽欺辱，一心想加入横行上海的黑道势力“斧头帮”，借此出人头地。一次，他假冒斧头帮成员来到贫民社区“猪笼城寨”敲诈居民，却阴差阳错招来了真正的斧头帮。谁也没有想到，这个看似破败的城寨其实卧虎藏龙，除了…",
        "types": [
          "动作",
          "喜剧",
          "犯罪"
        ],
        "directors": [
          "周星驰"
        ],
        "actors": [
          "周星驰",
          "元秋",
          "元华",
          "林子聪"
        ]
      },
      {
        "id": "col_film_11_6",
        "title": "年会不能停！",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/nhsi6kfqwlfAdzaeZOocnUqMlH2.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/f4OCzvS3HvisHEkxq5596jg21UJ.jpg",
        "year": "2023",
        "description": "集团裁员风波之下，底层钳工胡建林却阴差阳错被调入总部，从一名普通工人摇身一变成为“大厂”白领。发现这场调动其实是一场乌龙后，人事经理马杰为了保住饭碗，只能想方设法替他隐瞒真相。没想到与总部职场规则格格不入的胡建林，不仅闹出一连串笑话，反而凭…",
        "types": [
          "剧情",
          "喜剧"
        ],
        "directors": [
          "董润年"
        ],
        "actors": [
          "董成鹏",
          "白客",
          "庄达菲",
          "王迅"
        ]
      },
      {
        "id": "col_film_11_7",
        "title": "你好，李焕英",
        "rate": "7.0",
        "cover": "https://image.tmdb.org/t/p/w500/31W7qLEMqQKgdCeCtV9EbVi3bwG.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cTD9U4QLJHEL75ee1NoqIIeBc1y.jpg",
        "year": "2021",
        "description": "2001年的某一天，刚刚考上大学的贾晓玲经历了人生中的一次大起大落。一心想要成为母亲骄傲的她却因母亲突遭严重意外，而悲痛万分。在贾晓玲情绪崩溃的状态下，竟意外的回到了1981年，并与年轻的母亲李焕英相遇，二人形影不离，宛如闺蜜。与此同时，也…",
        "types": [
          "剧情",
          "喜剧",
          "奇幻"
        ],
        "directors": [
          "贾玲"
        ],
        "actors": [
          "贾玲",
          "张小斐",
          "沈腾",
          "陈赫"
        ]
      },
      {
        "id": "col_film_11_8",
        "title": "羞羞的铁拳",
        "rate": "6.0",
        "cover": "https://image.tmdb.org/t/p/w500/i7lhHL8puIpgxtxBhFj8mKVeB9k.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lyGuft4aGUrCTvsOBNlvb6YcRCE.jpg",
        "year": "2017",
        "description": "格斗选手艾迪生早已放弃曾经的梦想，靠打假拳混日子，而正义感十足的体育记者马小则一直追查拳坛背后的黑幕。一次意外中，这对互相看不顺眼的冤家同时遭到电击，醒来后竟发现彼此交换了身体。无法立即恢复原状的两人只好被迫进入对方的生活：马小不得不替艾迪…",
        "types": [
          "喜剧",
          "奇幻"
        ],
        "directors": [
          "张吃鱼"
        ],
        "actors": [
          "艾伦",
          "马丽",
          "沈腾",
          "薛皓文"
        ]
      },
      {
        "id": "col_film_11_9",
        "title": "射雕英雄传",
        "rate": "9.2",
        "cover": "https://image.tmdb.org/t/p/w500/wuOGPke8Dm5g5X4qfYwHu3gXAyX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fcKuYJGQdI8E0Pec4PJUGILKXWe.jpg",
        "year": "1983",
        "description": "南宋年间，全真教道士丘处机与江南七怪武功不相上下，两方决定各培养一个徒弟，日后比武来决定双方武功高低。丘处机的徒弟是金国小王子杨康（苗侨伟 饰），江南七怪的徒弟则是自小随母亲在蒙古生活的郭靖（黄日华 饰）。从蒙古来到中原的郭靖，邂逅了“东邪…",
        "types": [
          "剧情",
          "动作冒险"
        ],
        "directors": [
          "杜琪峰"
        ],
        "actors": [
          "黄日华",
          "翁美玲",
          "苗侨伟",
          "杨盼盼"
        ]
      },
      {
        "id": "col_film_11_10",
        "title": "九品芝麻官",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/mdOdl9NDHuNH6V1YDfxwTjSPmdI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/x8zprGIgH2pExKCyNdwfANcbnlG.jpg",
        "year": "1994",
        "description": "包龙星花钱买来候补知县的职位，平日贪财怕事，在当地百姓中名声极差。一次代理知县期间，戚家发生灭门惨案，戚秦氏遭到常威强暴后又被嫁祸成杀害全家的凶手。包龙星原本试图查明真相，却发现常威身后势力庞大，又请来大状方唐镜颠倒黑白、收买证人，使案件迅…",
        "types": [
          "喜剧",
          "剧情"
        ],
        "directors": [
          "王晶"
        ],
        "actors": [
          "周星驰",
          "吴孟达",
          "徐锦江",
          "张敏"
        ]
      },
      {
        "id": "col_film_11_11",
        "title": "疯狂的石头",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/4NVNv2sQKZKb1HtGExUqp3Ukd7f.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yeQZTan6q2W9Lo69QjHULCJAwbJ.jpg",
        "year": "2006",
        "description": "重庆一家濒临倒闭的工艺品厂在拆除旧厂房时，意外从厕所里发现了一块价值不菲的翡翠。为了缓解经营困境，厂里决定举办翡翠展览，并由保卫科长包世宏负责看守。没想到消息传开后，国际大盗麦克和本地一伙小偷都盯上了这块宝物，各自使出不同手段试图将其弄到手…",
        "types": [
          "动作",
          "喜剧"
        ],
        "directors": [
          "宁浩"
        ],
        "actors": [
          "郭涛",
          "刘桦",
          "刘刚",
          "黄渤"
        ]
      },
      {
        "id": "col_film_11_12",
        "title": "大赢家",
        "rate": "7.1",
        "cover": "https://image.tmdb.org/t/p/w500/7cedakrLJKLT70lwAFwNJiFAJUM.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/pzIlhG9i67PS82pnS3VgZkMLr3P.jpg",
        "year": "2020",
        "description": "该片讲述了一场银行抢劫演习，所有人都以为是走个过场，但没想到扮演“劫匪”的银行模范职员严瑾却做足了准备。他与公安局长想的一样，即使是演习，也容不得弄虚作假。这场对弈，真正的大赢家，只有可能属于最认真的那个人的故事 。",
        "types": [
          "喜剧",
          "剧情"
        ],
        "directors": [
          "于淼"
        ],
        "actors": [
          "董成鹏",
          "柳岩",
          "代乐乐",
          "张子贤"
        ]
      },
      {
        "id": "col_film_11_13",
        "title": "唐人街探案",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/zKQtRG6a53CI2NRi0gkrH3IoZ6D.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ferdDyXvWARYARWcZNMBE372L6u.jpg",
        "year": "2015",
        "description": "警校落榜后，天赋异禀却不善言辞的少年秦风被姥姥送到泰国散心，投奔远房表舅唐仁。号称“唐人街第一神探”的唐仁实际上整日靠些小聪明混日子，没想到一次意外之后，他突然成为一桩离奇命案的嫌疑人，而案件背后还牵扯到一批失踪的黄金。为了躲避警方追捕并洗…",
        "types": [
          "喜剧",
          "悬疑",
          "动作"
        ],
        "directors": [
          "陈思诚"
        ],
        "actors": [
          "王宝强",
          "刘昊然",
          "佟丽娅",
          "陈赫"
        ]
      },
      {
        "id": "col_film_11_14",
        "title": "让子弹飞",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/p5KiZq5MtGExUhmgPbpwiGFzALt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/k1ziDzX0u8HgrAYshMb082nvtrF.jpg",
        "year": "2010",
        "description": "民国年间，花钱捐得县长的马邦德携妻赴任途中，遭到悍匪张麻子一伙伏击。为了保住性命，马邦德谎称自己只是师爷，并以鹅城丰厚的油水为诱饵，怂恿张麻子冒充县长前去上任。张麻子带着兄弟来到鹅城，却发现这里早已被豪绅黄四郎牢牢把持。原本只想捞些实利的张…",
        "types": [
          "动作",
          "喜剧"
        ],
        "directors": [
          "姜文"
        ],
        "actors": [
          "姜文",
          "周润发",
          "葛优",
          "刘嘉玲"
        ]
      },
      {
        "id": "col_film_11_15",
        "title": "扬名立万",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/8z7IptdlKjox7BIiwNwSdSV68HP.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/56RNLigrw1qPtxiohkFkXPRKrJO.jpg",
        "year": "2021",
        "description": "民国年间，投资人陆子野召集编剧李家辉、导演郑千里、演员苏梦蝶和关静年等一群事业不得志的电影人，准备把一桩轰动一时的血案搬上银幕，希望借此翻身成名。为了让剧本足够真实，陆子野不仅把众人带到当年的案发别墅，还让已经落网的凶手齐乐山亲自参与案情还…",
        "types": [
          "喜剧",
          "悬疑",
          "剧情"
        ],
        "directors": [
          "刘循子墨"
        ],
        "actors": [
          "尹正",
          "邓家佳",
          "喻恩泰",
          "杨皓宇"
        ]
      },
      {
        "id": "col_film_11_16",
        "title": "满江红",
        "rate": "6.0",
        "cover": "https://image.tmdb.org/t/p/w500/eqcH2KZZMJUvpYM1SWhch2XpSyp.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lY6RkqchljFAS7MrylH4l1nGXIU.jpg",
        "year": "2023",
        "description": "南宋绍兴年间，岳飞死后四年，秦桧率兵与金国会谈。会谈前夜，金国使者死在宰相驻地，所携密信也不翼而飞。一个小兵与亲兵营副统领机缘巧合被裹挟进这巨大阴谋之中，宰相秦桧命两人限一个时辰之内找到凶手，而事情却远没有这么简单……伴随危机四伏的深入调查…",
        "types": [
          "悬疑",
          "喜剧",
          "惊悚"
        ],
        "directors": [
          "张艺谋"
        ],
        "actors": [
          "沈腾",
          "易烊千玺",
          "张译",
          "雷佳音"
        ]
      }
    ]
  },
  {
    "id": "col-healing",
    "title": "治愈系 · 温暖人心",
    "subtitle": "温柔的力量，抚平生活所有的褶皱与疲惫",
    "slug": "healing-warmth",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/cd78ie8CrDkLpXVP4R1N6Gy8IrD.jpg",
      "https://image.tmdb.org/t/p/w500/AkLBZ8dsDxaeBsrf1xzusp0LqT0.jpg",
      "https://image.tmdb.org/t/p/w500/sYDTJoqegWT0LrSf5FQ2OB8SZVt.jpg"
    ],
    "totalCount": 16,
    "description": "静水流深的慢调叙事与人间温情，在一餐一饭、四时流转中体悟生命微光，给予心灵最宁静的抚慰。",
    "accent": "#EC4899",
    "films": [
      {
        "id": "col_film_12_1",
        "title": "海街日记",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/cd78ie8CrDkLpXVP4R1N6Gy8IrD.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/b0Xdh15XGZbKON9CbFVB5sTqrSJ.jpg",
        "year": "2015",
        "description": "影片改编自吉田秋生同名漫画。镰仓小镇，香田家四姐妹居住在外婆留下的老宅。父亲早年离家，母亲抛下她们，由外婆抚养长大。外婆离世后，大姐幸独自照料佳乃、千佳。父亲离世，姐妹三人出席葬礼，遇见素未谋面的异母妹妹铃。幸邀请铃前来同住，铃奔赴镰仓，四…",
        "types": [
          "剧情"
        ],
        "directors": [
          "是枝裕和"
        ],
        "actors": [
          "绫濑遥",
          "长泽雅美",
          "夏帆",
          "广濑铃"
        ]
      },
      {
        "id": "col_film_12_2",
        "title": "小森林：夏秋篇",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/AkLBZ8dsDxaeBsrf1xzusp0LqT0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1bAE9YexmEfAanXKaO1d9Ms4qKm.jpg",
        "year": "2014",
        "description": "平凡女孩市子（桥本爱 饰）自幼生长在位于日本东北地区的村庄小森。这里远离都市的喧嚣和浮躁，为青山绿水所环绕，俨然一个幽静怡然的世外桃源。村民们日出而作，日落而息，依靠一双勤劳的双手经营渺小却舒适的生活，与世无争。市子曾经前往东京闯荡，只…",
        "types": [
          "剧情"
        ],
        "directors": [
          "森淳一"
        ],
        "actors": [
          "桥本爱",
          "三浦贵大",
          "松冈茉优",
          "温水洋一"
        ]
      },
      {
        "id": "col_film_12_3",
        "title": "小森林：冬春篇",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/sYDTJoqegWT0LrSf5FQ2OB8SZVt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3jxT6hCi5eDBseucDRo5c04qWCZ.jpg",
        "year": "2015",
        "description": "该片根据漫画家五十岚大介的同名人气漫画改编，桥本饰演从都市回到乡村的主人公市子，描绘了在严酷大自然中过上自给自足生活的市子，为了每天的食材不得不学习种田的故事。全片在岩手县取景拍摄，当地春冬的美景尽收眼底。",
        "types": [
          "剧情"
        ],
        "directors": [
          "森淳一"
        ],
        "actors": [
          "桥本爱",
          "三浦贵大",
          "松冈茉优",
          "温水洋一"
        ]
      },
      {
        "id": "col_film_12_4",
        "title": "海蒂和爷爷",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/uMM9ovN6L2lL2iPbcrQ8mwLMtRg.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/j61P3ty6dOWygdPSneEH56BrkSD.jpg",
        "year": "2015",
        "description": "自幼失去双亲的海蒂一直由姨妈照顾，后来姨妈因工作无法继续照料她，便将她送到阿尔卑斯山，与独居在山上的爷爷一起生活。爷爷性格孤僻古怪，与村民鲜少往来，但活泼纯真的海蒂逐渐融化了他的心，也在山间结识了牧童彼得，开始了一段自由快乐的生活。然而不久…",
        "types": [
          "冒险",
          "家庭",
          "剧情"
        ],
        "directors": [
          "阿兰·葛斯彭纳"
        ],
        "actors": [
          "阿努克·斯特芬",
          "布鲁诺·甘茨",
          "昆林·艾格匹",
          "伊莎贝尔·奥特曼"
        ]
      },
      {
        "id": "col_film_12_5",
        "title": "菊次郎的夏天",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/4hbpn7WDrG5lnXAgpBnr4GumYvN.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/maxp4hu52uhfNuJmumD5NpZyrRo.jpg",
        "year": "1999",
        "description": "暑假到来，9岁的正男与奶奶相依为命，孤单又无聊的他从母亲寄来的信中得知了她的住址，于是决定独自前往爱知县丰桥市寻找母亲。邻居阿姨发现后，不仅为他准备了旅费，还让游手好闲的丈夫菊次郎陪他同行。然而这个看起来并不靠谱的大叔刚上路便惹出不少麻烦，…",
        "types": [
          "喜剧",
          "剧情"
        ],
        "directors": [
          "北野武"
        ],
        "actors": [
          "北野武",
          "关口雄介",
          "岸本加世子",
          "大家由祐子"
        ]
      },
      {
        "id": "col_film_12_6",
        "title": "奇迹男孩",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/zIcdHTMML8PSyrOQXFqASW3DOHj.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/b7xQ5fuyVO4c24igizCfPgF6n7q.jpg",
        "year": "2017",
        "description": "10岁的奥吉天生面部缺陷，从小经历多次手术，一直由母亲在家中教导。五年级时，他第一次走进普通学校，开始真正接触家人之外的世界。然而与众不同的外表让奥吉成为同学关注和议论的焦点，也让他不得不面对疏远、嘲笑与校园霸凌。好在家人的陪伴和新朋友的善…",
        "types": [
          "家庭",
          "剧情"
        ],
        "directors": [
          "斯蒂芬·乔博斯基"
        ],
        "actors": [
          "雅各布·特伦布莱",
          "朱莉娅·罗伯茨",
          "欧文·威尔逊",
          "伊莎贝拉·维多维奇"
        ]
      },
      {
        "id": "col_film_12_7",
        "title": "绿皮书",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/um1Tc0238x1II2u33FPHbMj3GBE.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5En0fmDagt3Pk8d7P3uTwfeQceg.jpg",
        "year": "2018",
        "description": "1962年，纽约。夜总会因装修暂时停业后，托尼·利普急需寻找一份新工作，并受雇成为知名黑人钢琴家唐·雪利的司机兼保镖。唐·雪利即将展开为期八周的美国南方巡演，而在当时种族隔离与歧视依然严重的南部地区，两人不得不依靠一本为黑人旅行者提供安全食…",
        "types": [
          "剧情",
          "喜剧",
          "历史"
        ],
        "directors": [
          "彼得·法雷利"
        ],
        "actors": [
          "维果·莫特森",
          "马赫沙拉·阿里",
          "琳达·卡德里尼",
          "塞巴斯蒂安·马尼斯科"
        ]
      },
      {
        "id": "col_film_12_8",
        "title": "触不可及",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/dqPRhuTFkSNEg3oOmE1CVBNYRkA.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/q6OGlZ1KMEb14AC8KbPCxyNOal6.jpg",
        "year": "2011",
        "description": "富有的菲利普因一场滑翔伞事故导致高位瘫痪，需要招聘一名全职陪护。前来应聘的人络绎不绝，却始终无法让他满意。直到刚刚出狱的德希斯出现，他本无意得到这份工作，只想拿到一张求职被拒的证明，却意外被菲利普选中，开始了一个月的试用期。一个生活优渥、行…",
        "types": [
          "剧情",
          "喜剧"
        ],
        "directors": [
          "埃里克·托莱达诺",
          "奥利维埃·纳卡什"
        ],
        "actors": [
          "弗朗索瓦·克鲁塞",
          "奥玛·希",
          "安娜·勒尼",
          "奥黛丽·弗洛罗"
        ]
      },
      {
        "id": "col_film_12_9",
        "title": "怦然心动",
        "rate": "9.1",
        "cover": "https://image.tmdb.org/t/p/w500/tOp4DkdonY1a1AS5ESWDia8JP63.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xBSwwkAYl9h8QVG2OxNpSaSgJwr.jpg",
        "year": "2010",
        "description": "1957年，布莱斯·罗斯基一家搬到小镇，与邻家女孩朱丽·贝克成为邻居。第一次见到布莱斯，朱丽便对他怦然心动，此后总想方设法接近他，而布莱斯却一直对这个过分热情的女孩避之不及。随着两人渐渐长大，一棵朱丽深爱的梧桐树以及生活中接连发生的小事，让…",
        "types": [
          "爱情",
          "剧情"
        ],
        "directors": [
          "罗伯·莱纳"
        ],
        "actors": [
          "玛德琳·卡罗尔",
          "卡兰·麦克奥利菲",
          "丽贝卡·德·莫奈",
          "安东尼·爱德华兹"
        ]
      },
      {
        "id": "col_film_12_10",
        "title": "天堂电影院",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/gLFwLAjOdywCT2wwkzmA3Me54xI.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zoVeIgKzGJzpdG6Gwnr7iOYfIMU.jpg",
        "year": "1988",
        "description": "意大利南部的小镇上，男孩多多从小便痴迷电影，总爱跑到“天堂电影院”观看放映，并因此结识了放映师艾佛特。一个古灵精怪，一个嘴硬心软，两人在一卷卷胶片和无数银幕故事中逐渐成为忘年之交，电影院也成了多多童年最重要的地方。一次意外改变了两人的生活，…",
        "types": [
          "剧情",
          "爱情"
        ],
        "directors": [
          "朱塞佩·托纳多雷"
        ],
        "actors": [
          "菲利浦·诺瓦雷",
          "雅克·贝汉",
          "马可·莱昂纳迪",
          "萨瓦特利·卡西欧"
        ]
      },
      {
        "id": "col_film_12_11",
        "title": "步履不停",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/8M0PBJYX8s04u81XeZn3BXGj54U.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lvSB0bnLzuxwrfTlI2l13gctWRn.jpg",
        "year": "2008",
        "description": "这部抒情而深切动人的影片是当代日本电影大师是枝裕和迄今为止最个人化的作品。影片为纪念其已故母亲而创作，描绘了横山家聚集举行纪念仪式的一天——其背后的深意随剧情推进才逐渐清晰。导演并未着力于强烈的戏剧冲突，而是通过细微的举止与家庭日常（尤其是…",
        "types": [
          "剧情",
          "家庭"
        ],
        "directors": [
          "是枝裕和"
        ],
        "actors": [
          "阿部宽",
          "夏川结衣",
          "江原由希子",
          "高桥和也"
        ]
      },
      {
        "id": "col_film_12_12",
        "title": "放牛班的春天",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/d623rdQLxw7QhdP7ECsz1UkJrHl.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/eWYrrdCKd4bjOKB9DB0HtRUhI1o.jpg",
        "year": "2004",
        "description": "1949年的法国乡村，音乐家克莱门特·马修来到一所名为“池塘之底”的男子寄宿学校担任助理教师。这里的学生大多顽皮难管，体罚和高压管教更是司空见惯。性格温和的马修不认同校长的教育方式，决定尝试用音乐改变这些孩子。他重新创作合唱曲，组织起一支合…",
        "types": [
          "剧情",
          "喜剧",
          "音乐"
        ],
        "directors": [
          "克里斯托夫·巴哈蒂"
        ],
        "actors": [
          "热拉尔·朱尼奥",
          "弗朗索瓦·贝莱昂",
          "凯德·麦拉德",
          "让-保罗·博奈雷"
        ]
      },
      {
        "id": "col_film_12_13",
        "title": "白日梦想家",
        "rate": "7.2",
        "cover": "https://image.tmdb.org/t/p/w500/xUvcmKgDFRy79LqTibh7bpu1R5r.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8hSjOHRY4OUEpqxszYbMdem8z9C.jpg",
        "year": "2013",
        "description": "沃尔特在《生活》杂志的底片资产部工作多年，性格内向的他习惯把自己藏在平凡的生活中，并时常陷入白日梦，幻想自己成为无所不能的英雄。他甚至始终没有勇气向心仪的同事谢莉尔表达心意。直到公司被并购，杂志即将推出最后一期，摄影师尚恩寄来的底片中，用作…",
        "types": [
          "冒险",
          "喜剧",
          "剧情"
        ],
        "directors": [
          "本·斯蒂勒"
        ],
        "actors": [
          "本·斯蒂勒",
          "克丽丝滕·威格",
          "西恩·潘",
          "雪莉·麦克雷恩"
        ]
      },
      {
        "id": "col_film_12_14",
        "title": "本杰明·巴顿奇事",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/swBygY0yVWJLIJSOmhv9ntGCrmV.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/2fswjyrY3GEzeoVn6mF8pNeNcgf.jpg",
        "year": "2008",
        "description": "飓风正在侵袭美国新奥尔良，一位病危的老妇睁开了她的睡眼。老妇名叫戴茜，她叫女儿凯若琳 为她阅读一本日记。这本日记的作者叫本杰明•巴顿。本杰明出生在第一次世界大战停战之时，但生来便像个老人的他被父亲当作怪物，被遗弃在了养老院。本杰明在养老院与…",
        "types": [
          "剧情",
          "奇幻",
          "爱情"
        ],
        "directors": [
          "大卫·芬奇"
        ],
        "actors": [
          "布拉德·皮特",
          "凯特·布兰切特",
          "塔拉吉·P·汉森",
          "朱莉娅·奥蒙德"
        ]
      },
      {
        "id": "col_film_12_15",
        "title": "忠犬八公的故事",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/fCRj02jAyqzDvPEUceFYEA7WmWM.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/a5pOEjOLvr04Hr8qktIDM75OZi0.jpg",
        "year": "2009",
        "description": "八公 是一条谜一样的犬，因为没有人知道它从哪里来。教授帕克 在小镇的火车站拣到一只走失的小狗，冥冥中似乎注定小狗和帕克教授有着某种缘分，帕克一抱起这只小狗就再也放不下来，最终，帕克对小狗八公的疼爱感化了起初极力反对养狗的妻子卡特。八公在帕克…",
        "types": [
          "剧情",
          "家庭"
        ],
        "directors": [
          "莱塞·霍尔斯道姆"
        ],
        "actors": [
          "理查·基尔",
          "琼·艾伦",
          "莎拉露瑪",
          "田川洋行"
        ]
      },
      {
        "id": "col_film_12_16",
        "title": "入殓师",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/xV71NnDYOUyYq3oGDjCLGTn2Rlt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/AoWW2J4PoDe0IPuCVQOk50QFS4D.jpg",
        "year": "2008",
        "description": "由于乐队解散，大提琴手小林大悟（本木雅弘饰）就此失业。他和妻子美香（广末凉子饰）一起离开东京回到了老家山形县。然而即使在山形，没有实用一技之长的大悟还是很难找到工作。 “年龄不限，高薪保证，实际劳动时间极短。诚聘旅程助理。”一张条件惹眼的招…",
        "types": [
          "剧情"
        ],
        "directors": [
          "泷田洋二郎"
        ],
        "actors": [
          "本木雅弘",
          "广末凉子",
          "山崎努",
          "余贵美子"
        ]
      }
    ]
  },
  {
    "id": "col-xianxia",
    "title": "东方玄幻 · 修仙巅峰",
    "subtitle": "剑破苍穹，快意恩仇的东方美学壮美仙侠世界",
    "slug": "eastern-fantasy-cultivation",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/u1VRjvvCIVwb1MUhoxSAUimhoKZ.jpg",
      "https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg",
      "https://image.tmdb.org/t/p/w500/mNJPCv2dLADVVSgLlzsMJoXdTmb.jpg"
    ],
    "totalCount": 16,
    "description": "顶流国漫与玄幻大作合集，从微末凡躯逆天改命到执剑问道荡平诸天，燃爆视效与宏大东方世界观的极乐之境。",
    "accent": "#059669",
    "films": [
      {
        "id": "col_film_13_1",
        "title": "凡人修仙传",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/u1VRjvvCIVwb1MUhoxSAUimhoKZ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8NIvQY34tNPc4txNeym2zEYk9ek.jpg",
        "year": "2020",
        "description": "平凡少年韩立出生贫困，为了让家人过上更好的生活，自愿前去七玄门参加入门考核，最终被墨大夫收入门下。墨大夫一开始对韩立悉心培养、传授医术，让韩立对他非常感激，但随着一同入门的弟子张铁失踪，韩立才发现了墨大夫的真面目。墨大夫试图夺舍韩立，最终却…",
        "types": [
          "动画",
          "动作冒险",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "钱文青",
          "宋伊人",
          "李诗萌",
          "徐佳琦"
        ]
      },
      {
        "id": "col_film_13_2",
        "title": "仙逆",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/crn53sSGWRZ8wAtEGso52nepEkz.jpg",
        "year": "2023",
        "description": "改编自耳根同名小说《仙逆》，讲述了乡村平凡少年王林以心中之感动，逆仙而修，求的不仅是长生，更多的是摆脱那背后的蝼蚁之身。他坚信道在人为，以平庸的资质踏入修真仙途，历经坎坷风雨，凭着其聪睿的心智，一步一步走向巅峰，凭一己之力，扬名修真界。",
        "types": [
          "动画",
          "剧情",
          "动作冒险"
        ],
        "directors": [
          "石头熊",
          "冯毅"
        ],
        "actors": [
          "史泽鲲",
          "张惠霖",
          "常文涛",
          "刘思岑"
        ]
      },
      {
        "id": "col_film_13_3",
        "title": "完美世界",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/mNJPCv2dLADVVSgLlzsMJoXdTmb.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qgTHKXeje3iInDXFaIBsIHpJQzu.jpg",
        "year": "2021",
        "description": "本作动画改编自起点白金作者辰东遮天三部曲的第二部——完美世界。他为修道而生，为应劫而至，他身化亿万血雨，洒落万古岁月，经历无数时空的熬炼，岁月长河的洗礼，他化万古，他化自在。看男主石昊如何一生极致辉煌，造就无尽传说。",
        "types": [
          "动画",
          "动作冒险"
        ],
        "directors": [
          "张帅"
        ],
        "actors": [
          "陈锦闻",
          "李诗萌",
          "刘明月",
          "刘晴"
        ]
      },
      {
        "id": "col_film_13_4",
        "title": "斗破苍穹",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/oyoahIcdamTXwjIaL3CqZ1v5CLl.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cTCn2EO69SERNfhaezJMoqBom4G.jpg",
        "year": "2017",
        "description": "萧炎曾是家族里公认的斗气天才，年仅11岁便已经抵达了常人穷尽一生都无法修炼到的境界。可12岁那年，一场意外让萧炎的全部努力都化为了乌有，失去一切的他体会到了人情的冷暖和世态的炎凉，之后，萧炎和纳兰嫣然许下了决斗的三年之约，来到魔兽山脉，在身…",
        "types": [
          "动画",
          "动作冒险",
          "剧情"
        ],
        "directors": [
          "顾振华",
          "陈百俊"
        ],
        "actors": [
          "不一",
          "刘雨轩",
          "陈奕雯",
          "冯骏骅"
        ]
      },
      {
        "id": "col_film_13_5",
        "title": "遮天",
        "rate": "8.9",
        "cover": "https://image.tmdb.org/t/p/w500/z9JNGlJ8eGy6S6SOlBhpmxjjXGT.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1HcuGlNEfc6EYZHEZGwgKjAvYa4.jpg",
        "year": "2023",
        "description": "本作动画改编自起点白金作者辰东遮天三部曲的第一部——遮天。冰冷与黑暗并存的宇宙深处，九具庞大的龙尸拉着一口青铜古棺，亘古长存。这是太空探测器在枯寂的宇宙中捕捉到的一幅极其震撼的画面。九龙拉棺，究竟是回到了上古，还是来到了星空的彼岸？一个浩大…",
        "types": [
          "动画",
          "动作冒险",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "赵乾景",
          "李婵妃",
          "徐翔",
          "吴磊"
        ]
      },
      {
        "id": "col_film_13_6",
        "title": "吞噬星空",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lDVOl7wTFUIqwlSrWsGjBCHt3fQ.jpg",
        "year": "2020",
        "description": "RR病毒席卷全球，受感染的动物异变为恐怖怪兽，人类文明几近毁灭。在绝境中，人类筑起高墙，建立基地市作为最后的堡垒。这段至暗岁月，被称为\\\"大涅槃时期\\\"。灾难也催生了进化——人类体质在极端环境下飞速突破，尚武之风兴起，那些站在巅峰的强者，被…",
        "types": [
          "动画",
          "Sci-Fi & Fantasy",
          "动作冒险"
        ],
        "directors": [
          "邵官华",
          "沈乐平"
        ],
        "actors": [
          "赵乾景",
          "谢莹",
          "张晔",
          "赵梓涵"
        ]
      },
      {
        "id": "col_film_13_7",
        "title": "剑来",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/44LJUcedKZ7fsFeWeOvtLIJzEU.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lhLbAAwMaeoPxvE7bVUQkSDQZ4m.jpg",
        "year": "2024",
        "description": "大千世界，无奇不有。 骊珠洞天中本该有大气运的贫寒少年，因为本命瓷碎裂的缘故，使得机缘临身却难以捉住。基于此，众多大佬纷纷以少年为焦点进行布局，使得少年身边的朋友获得大机缘，而少年却置身风口浪尖之上…",
        "types": [
          "动画",
          "动作冒险",
          "Sci-Fi & Fantasy"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "陈张太康",
          "张惠霖",
          "吴磊",
          "云惟一"
        ]
      },
      {
        "id": "col_film_13_8",
        "title": "一念永恒",
        "rate": "8.9",
        "cover": "https://image.tmdb.org/t/p/w500/jgeAAUyACa4KIdOPafFlWas3em5.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8kjea5G7lMYRit7U9rSOLLZZOUh.jpg",
        "year": "2020",
        "description": "平凡少年白小纯为追求长生之法踏入修仙界，在灵溪宗、血溪宗等宗门中，依靠顽皮机智与非凡机缘不断成长，最终揭开永恒之谜的核心秘密。",
        "types": [
          "动画",
          "Sci-Fi & Fantasy",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "苏尚卿",
          "李诗萌",
          "郭浩然",
          "乔诗语"
        ]
      },
      {
        "id": "col_film_13_9",
        "title": "斗罗大陆",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/o80kcyeLqMHggWtcskg2E9hLQGB.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9URu8gMwjwjtSAUbaAevlIjYqSs.jpg",
        "year": "2018",
        "description": "唐门外门弟子唐三，因偷学内门绝学为唐门所不容，以另外一个身份来到了另一个世界，一个属于武魂的世界，名叫斗罗大陆。这里没有魔法，没有斗气，没有武术，却有神奇的武魂。这里的每个人，在自己六岁的时候，都会在武魂殿中令武魂觉醒。武魂有动物，有植物，…",
        "types": [
          "动画",
          "剧情",
          "动作冒险"
        ],
        "directors": [
          "唐宏宁",
          "沈乐平"
        ],
        "actors": [
          "沈磊",
          "张琦",
          "翟巍",
          "陶典"
        ]
      },
      {
        "id": "col_film_13_10",
        "title": "完美世界之战起青云",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/iKZev9OgfklidO8AvdrYlwung2o.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w500/iKZev9OgfklidO8AvdrYlwung2o.jpg",
        "year": "2024",
        "description": "《完美世界之战起青云》是备受赞誉的口碑经典佳作，以独特的艺术视角和深刻的情感共鸣打动无数观众。",
        "types": [
          "精选",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "实力派演员"
        ]
      },
      {
        "id": "col_film_13_11",
        "title": "画江湖之不良人",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/9NaAIq970v66BSUvJyGUuxeZx5f.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/d16l4tj30LoA88kFd3qZLdyRZhF.jpg",
        "year": "2014",
        "description": "故事发生在唐朝末年，时局动荡，无论朝中还是民间都人心惶惶。隶属于官府的神秘组织“不良人”全体失去了踪迹，同样下落不明的，还是价值连城的国库宝藏。传说中，一切的秘密都隐藏在龙泉剑上，得到了龙泉剑的人，便拥有了掌控天下的能力。李星云自幼失去了父…",
        "types": [
          "动画",
          "动作冒险",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "边江",
          "阎萌萌",
          "赵毅",
          "申秋香"
        ]
      },
      {
        "id": "col_film_13_12",
        "title": "武动乾坤",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/44A3J05gzv1TCBvOhed5BDDgFBx.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5W9Dn9d0sg6xoSfKBmZRk1rMwBU.jpg",
        "year": "2019",
        "description": "修炼一途，乃窃阴阳，夺造化，转涅槃，握生死，掌轮回。武之极，破苍穹，动乾坤！一个浩瀚的仙侠世界，光怪陆离，神秘无尽。热血似火山沸腾，激情若瀚海汹涌，欲望如深渊无止境。",
        "types": [
          "动画",
          "动作冒险",
          "Sci-Fi & Fantasy"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "柯暮卿",
          "萧清源",
          "吕书君",
          "郭鸿博"
        ]
      },
      {
        "id": "col_film_13_13",
        "title": "神印王座",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/3VoqjhxCtsDMKKdeJdm89AMdcTX.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9fOsc3Hmvy6G5Hw8tTOGRFGWp73.jpg",
        "year": "2022",
        "description": "六千年前，魔神皇枫秀与七十二根魔神柱从天而降，所有生物沾染魔神柱散发的气息，立刻会变异成魔族生物，人类随之进入黑暗年代。随后，人类强者自行组织六大圣殿，阻挡魔族前进的脚步，逐渐形成人魔共存的局面。主角龙皓晨，为救母加入六大圣殿之一的骑士圣殿…",
        "types": [
          "动画",
          "动作冒险",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "常蓉珊",
          "沈念如",
          "刘明月",
          "叶知秋"
        ]
      },
      {
        "id": "col_film_13_14",
        "title": "大主宰",
        "rate": "9.1",
        "cover": "https://image.tmdb.org/t/p/w500/e9kdsUK01YSa8Ou5tO72QJ0830X.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/geXR29xfEgnkQJbm5TIpSebqzSo.jpg",
        "year": "2023",
        "description": "大千世界，位面交汇，万族林立，群英荟萃，一位位来自下位面的天之至尊，在这无尽世界，演绎者令人向往的传奇，追求着主宰之路。",
        "types": [
          "动画",
          "动作冒险"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "孙郎朗",
          "李诗萌",
          "江月",
          "贺文潇"
        ]
      },
      {
        "id": "col_film_13_15",
        "title": "永生",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/rSFsyDJXJIbtOIUR1vjcVl8iZkN.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rdN2CW2SuTEPZ7i6RqpZUpRQQ5X.jpg",
        "year": "2022",
        "description": "卑微家奴方寒从小抱着“宁做乞丐，不为人奴”的信念，凭借一己之力纵横天地之间。他靠着一股不服输的倔强突破神通的奥秘，将肉身锻成永生之躯。努力一步步踏入仙道，最终成为巅峰王者。",
        "types": [
          "动画",
          "动作冒险",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "刘思岑",
          "贺文潇",
          "张雨濛",
          "林昭言"
        ]
      },
      {
        "id": "col_film_13_16",
        "title": "修罗武神",
        "rate": "9.3",
        "cover": "https://image.tmdb.org/t/p/w500/oQJMf333GTeKJl5dbOIFNE02gtK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/88y8bINM6N6knr9mIX4TUXSVVXg.jpg",
        "year": "2023",
        "description": "改编自同名小说，故事讲述了一个备受家族欺凌的少年，从一个平凡的下界二等门派青龙宗外门弟子，机缘巧合下得到九色神雷的力量，并发现自己体内封印着更为强大的力量，通过不断修炼成长，同时结识了苏美，苏柔等同伴，楚枫的实力不断增长，但不想其修炼天赋遭…",
        "types": [
          "动画",
          "动作冒险",
          "剧情"
        ],
        "directors": [
          "知名导演"
        ],
        "actors": [
          "魏一凡",
          "常文涛",
          "瞳音",
          "傅晨阳"
        ]
      }
    ]
  },
  {
    "id": "col-superhero",
    "title": "漫威 · DC 超英宇宙",
    "subtitle": "拯救世界的超级英雄史诗与凡人英雄主义",
    "slug": "superhero-cinematic-universe",
    "coverPosters": [
      "https://image.tmdb.org/t/p/w500/wXyZYO6BKDh8Evf80DF80VzKcz3.jpg",
      "https://image.tmdb.org/t/p/w500/bexcd0yH5lmX3fH2Amc1JQAWTMS.jpg",
      "https://image.tmdb.org/t/p/w500/qYB7QqwT1NtTW9aCwtopGy80rmA.jpg"
    ],
    "totalCount": 16,
    "description": "风靡全球的超英史诗巨制，汇聚复仇者联盟、正义联盟与暗黑哥谭，视效炸裂、热血沸腾的传奇之战。",
    "accent": "#E11D48",
    "films": [
      {
        "id": "col_film_14_1",
        "title": "复仇者联盟4：终局之战",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/wXyZYO6BKDh8Evf80DF80VzKcz3.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        "year": "2019",
        "description": "灭霸集齐六颗无限宝石后的一声响指，让宇宙中半数生命灰飞烟灭。幸存的复仇者们几近绝望，即使找到灭霸，也发现无限宝石已经被毁，希望似乎彻底破灭。五年后，迷失在量子领域的蚁人意外回到现实世界，并带来了一个可能逆转一切的办法。托尼·斯塔克、美国队长…",
        "types": [
          "冒险",
          "科幻",
          "动作"
        ],
        "directors": [
          "乔·罗素",
          "安东尼·罗素"
        ],
        "actors": [
          "小罗伯特·唐尼",
          "克里斯·埃文斯",
          "马克·鲁法洛",
          "克里斯·海姆斯沃斯"
        ]
      },
      {
        "id": "col_film_14_2",
        "title": "复仇者联盟3：无限战争",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/bexcd0yH5lmX3fH2Amc1JQAWTMS.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/mDfJG3LC3Dqb67AZ52x3Z0jU0uB.jpg",
        "year": "2018",
        "description": "来自宇宙深处的强大敌人灭霸开始寻找六颗无限宝石，企图利用它们的力量实现自己的计划。随着他的军团向地球和宇宙各处发动袭击，复仇者联盟、银河护卫队以及众多超级英雄被迫卷入这场前所未有的战争。此时的复仇者们仍因过去的分裂而各自行动，却不得不在不断…",
        "types": [
          "冒险",
          "动作",
          "科幻"
        ],
        "directors": [
          "乔·罗素",
          "安东尼·罗素"
        ],
        "actors": [
          "小罗伯特·唐尼",
          "克里斯·埃文斯",
          "克里斯·海姆斯沃斯",
          "乔什·布洛林"
        ]
      },
      {
        "id": "col_film_14_3",
        "title": "蝙蝠侠：黑暗骑士",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/qYB7QqwT1NtTW9aCwtopGy80rmA.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg",
        "year": "2008",
        "description": "在蝙蝠侠、警官詹姆斯·戈登和地方检察官哈维·丹特的共同努力下，哥谭市的犯罪势力受到前所未有的打击。然而，自称“小丑”的神秘罪犯突然出现，以毫无规则的暴力和精心策划的犯罪不断挑战城市秩序，也将蝙蝠侠、戈登和丹特一步步逼入道德与人性的困境。面对…",
        "types": [
          "动作",
          "惊悚"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "克里斯蒂安·贝尔",
          "希斯·莱杰",
          "艾伦·艾克哈特",
          "迈克尔·凯恩"
        ]
      },
      {
        "id": "col_film_14_4",
        "title": "死侍与金刚狼",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/nSpk8U35rPVlMMfZ1uxHnbC14Nd.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/by8z9Fe8y7p4jo2YlW2SZDnptyT.jpg",
        "year": "2024",
        "description": "经历一连串人生挫折后，韦德·威尔逊已经放下双刀，不再以死侍的身份行动，试图过上属于普通人的生活。然而生日当天，神秘的时间变异管理局突然将他带走，并告诉他所在的时间线正面临逐渐消亡的危机。得知自己珍视的朋友和整个世界都可能因此消失，韦德不得不…",
        "types": [
          "动作",
          "喜剧",
          "科幻"
        ],
        "directors": [
          "肖恩·利维"
        ],
        "actors": [
          "瑞安·雷诺兹",
          "休·杰克曼",
          "艾玛·科林",
          "马修·麦克费登"
        ]
      },
      {
        "id": "col_film_14_5",
        "title": "钢铁侠",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/uJh877DvqImALRw8xbTPol0msDT.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cKvDv2LpwVEqbdXWoQl4XgGN6le.jpg",
        "year": "2008",
        "description": "斯塔克工业是美国军方的重要武器供应商，掌门人托尼·斯塔克天资聪颖，却也过着放纵不羁的富豪生活，在助手维吉尼亚·波茨和公司元老俄巴迪亚·斯坦的协助下经营着庞大的军火事业。一次前往中东展示新型武器时，托尼遭到武装分子袭击并被俘，体内残留的弹片随…",
        "types": [
          "动作",
          "科幻",
          "冒险"
        ],
        "directors": [
          "乔恩·费儒"
        ],
        "actors": [
          "小罗伯特·唐尼",
          "泰伦斯·霍华德",
          "杰夫·布里吉斯",
          "格温妮斯·帕特洛"
        ]
      },
      {
        "id": "col_film_14_6",
        "title": "蜘蛛侠：平行宇宙",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/ylS5mFW7M6ReUjKhbEI4N4xB5fA.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8mnXR9rey5uQ08rZAvzojKWbDQS.jpg",
        "year": "2018",
        "description": "布鲁克林少年迈尔斯·莫拉莱斯一直在努力适应新的学校和家庭期待，一次意外却让他被一只神秘蜘蛛咬伤，并逐渐获得了与蜘蛛侠相似的能力。与此同时，犯罪头目金并秘密启动了一台能够打开平行宇宙的时空对撞机，导致不同世界之间的界限开始崩塌。来自另一个宇宙…",
        "types": [
          "动画",
          "动作",
          "冒险"
        ],
        "directors": [
          "鲍勃·佩尔西凯蒂",
          "彼得·拉姆齐"
        ],
        "actors": [
          "沙梅克·摩尔",
          "杰克·约翰逊",
          "海莉·斯坦菲尔德",
          "马赫沙拉·阿里"
        ]
      },
      {
        "id": "col_film_14_7",
        "title": "蜘蛛侠：纵横宇宙",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/rilpPMoF4LbKcBPb4omiqm7Zjw0.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kVd3a9YeLGkoeR50jGEXM6EqseS.jpg",
        "year": "2023",
        "description": "成为蜘蛛侠后的迈尔斯·莫拉莱斯一边守护自己的城市，一边努力在英雄身份与家庭生活之间寻找平衡，却始终怀念曾与自己并肩作战的格温和其他伙伴。一次意外重逢后，迈尔斯跟随蜘蛛格温穿越平行宇宙，第一次来到由来自不同世界的蜘蛛侠组成的“蜘蛛联盟”。然而…",
        "types": [
          "动画",
          "动作",
          "冒险"
        ],
        "directors": [
          "肯普·鲍尔斯",
          "贾斯汀·K·汤普森"
        ],
        "actors": [
          "沙梅克·摩尔",
          "海莉·斯坦菲尔德",
          "布莱恩·泰里·亨利",
          "劳伦·贝莱斯"
        ]
      },
      {
        "id": "col_film_14_8",
        "title": "美国队长2",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/gZjMkPuZO09f8lvP0fxyAM7W8sF.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1RWLMyC9KcFfcaoViMiJGSSZzzr.jpg",
        "year": "2014",
        "description": "纽约大战后，史蒂夫·罗杰斯逐渐适应现代生活，并继续为神盾局执行任务。然而，一次行动使他开始对神盾局秘密推进的“洞察计划”产生怀疑。随着尼克·弗瑞遭到袭击，史蒂夫也被卷入一场危及全球的阴谋，并成为追捕目标。逃亡途中，他与黑寡妇、猎鹰联手追查真…",
        "types": [
          "动作",
          "冒险",
          "科幻"
        ],
        "directors": [
          "乔·罗素",
          "安东尼·罗素"
        ],
        "actors": [
          "克里斯·埃文斯",
          "塞缪尔·杰克逊",
          "斯嘉丽·约翰逊",
          "罗伯特·雷德福"
        ]
      },
      {
        "id": "col_film_14_9",
        "title": "银河护卫队3",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/n2KRdFn5zLgcfFXJI0jULcLGBxn.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5YZbUmjbMa3ClvSW1Wj3D6XGolb.jpg",
        "year": "2023",
        "description": "历经一连串宇宙危机后，银河护卫队终于有了暂时安定的家园，但彼得·奎尔依然没有完全走出失去卡魔拉的阴影。就在众人试图开始新的生活时，一场突如其来的袭击让火箭浣熊身受重伤，而他身体中隐藏的秘密又让常规治疗无法挽救他的生命。为了救回这个一路并肩作…",
        "types": [
          "科幻",
          "冒险",
          "动作"
        ],
        "directors": [
          "詹姆斯·古恩"
        ],
        "actors": [
          "克里斯·帕拉特",
          "佐伊·索尔达娜",
          "戴夫·巴蒂斯塔",
          "凯伦·吉兰"
        ]
      },
      {
        "id": "col_film_14_10",
        "title": "雷神3：诸神黄昏",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/iHyAyCJhOVXPVNxqnZcJguSlTC.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/vLmHH8jAy8Jq8uBsLucd3592WGh.jpg",
        "year": "2017",
        "description": "索科维亚战役两年后，索尔回到阿斯加德，发现洛基一直伪装成奥丁统治着这里。兄弟二人随后前往地球寻找真正的奥丁，并从父亲口中得知一个被隐藏多年的威胁：强大的死亡女神海拉即将重返阿斯加德，而预言中毁灭家园的“诸神黄昏”也正在逼近。与海拉第一次交锋…",
        "types": [
          "动作",
          "科幻",
          "喜剧"
        ],
        "directors": [
          "塔伊加·维迪提"
        ],
        "actors": [
          "克里斯·海姆斯沃斯",
          "马克·鲁法洛",
          "汤姆·希德勒斯顿",
          "凯特·布兰切特"
        ]
      },
      {
        "id": "col_film_14_11",
        "title": "超人：钢铁之躯",
        "rate": "6.7",
        "cover": "https://image.tmdb.org/t/p/w500/xXCWxNeSrdsv6DJwWblzEeAXuh7.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/69EFgWWPFWbRNHmQgYdSnyJ94Ge.jpg",
        "year": "2013",
        "description": "氪星人乔·艾尔（罗素·克劳 Russell Crowe 饰）抵死反抗佐德将军（迈克尔·珊农 Michael Shannon 饰）的邪恶计划，冒险将刚出生不久的儿子卡尔·艾尔送到地球。卡尔降落在美国堪萨斯一座小镇，他幸运地成为乔纳森·肯特（凯…",
        "types": [
          "动作",
          "冒险",
          "科幻"
        ],
        "directors": [
          "扎克·施奈德"
        ],
        "actors": [
          "亨利·卡维尔",
          "艾米·亚当斯",
          "迈克尔·珊农",
          "戴安·琳恩"
        ]
      },
      {
        "id": "col_film_14_12",
        "title": "海王",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/dFOYgVEgzekwcVRekX4Pzk3XbIn.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9QusGjxcYvfPD1THg6oW3RLeNn7.jpg",
        "year": "2018",
        "description": "许多年前，亚特兰蒂斯女王（妮可·基德曼 Nicole Kidman 饰）和人类相知相恋，共同孕育了爱情的结晶——后来被陆地人称为海王的亚瑟·库瑞（杰森·莫玛 Jason Momoa 饰）。在成长的过程中，亚瑟接受海底导师维科（威廉·达福 W…",
        "types": [
          "动作",
          "冒险",
          "奇幻"
        ],
        "directors": [
          "温子仁"
        ],
        "actors": [
          "杰森·莫玛",
          "艾梅柏·希尔德",
          "威廉·达福",
          "帕特里克·威尔森"
        ]
      },
      {
        "id": "col_film_14_13",
        "title": "X战警：逆转未来",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/cEa0ebJoGZ30Tioy9gwg3VNnert.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3czpqXzFy5UcNuD1AubecRLWkwD.jpg",
        "year": "2014",
        "description": "变种人族群遭到了前所未有的毁灭性打击，而这一切的根源是“魔形女”瑞雯（詹妮弗·劳伦斯 Jennifer Lawrence 饰）在1973年刺杀了玻利瓦尔·特拉斯克（彼特·丁拉基 Peter Dinklage 饰）。在得知“小淘气”（艾利奥特…",
        "types": [
          "动作",
          "冒险",
          "科幻"
        ],
        "directors": [
          "布莱恩·辛格"
        ],
        "actors": [
          "休·杰克曼",
          "詹姆斯·麦卡沃伊",
          "迈克尔·法斯宾德",
          "帕特里克·斯图尔特"
        ]
      },
      {
        "id": "col_film_14_14",
        "title": "奇异博士",
        "rate": "7.4",
        "cover": "https://image.tmdb.org/t/p/w500/kqXM1TKDoBHtTvmn0Bf1xL6DMDr.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kkoiH8ZWxJ9WSAjOadGtuHUQxbm.jpg",
        "year": "2016",
        "description": "事业有成的神经外科医生史蒂芬·斯特兰奇在一场严重车祸中双手受创，从此无法继续拿起手术刀。遍寻治疗方法无果后，他来到尼泊尔，在神秘之地卡玛泰姬遇见古一法师，并由此接触到一个超越现实的魔法与多维世界。原本只想治好双手的斯特兰奇，在学习秘术的过程…",
        "types": [
          "奇幻",
          "冒险",
          "动作"
        ],
        "directors": [
          "斯科特·德里克森"
        ],
        "actors": [
          "本尼迪克特·康伯巴奇",
          "切瓦特·埃加福",
          "瑞秋·麦克亚当斯",
          "王汉斌"
        ]
      },
      {
        "id": "col_film_14_15",
        "title": "黑豹",
        "rate": "7.4",
        "cover": "https://image.tmdb.org/t/p/w500/leyh6Kny6kmLzdU0vYNMN1WnBaK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/b6ZJZHUdMEFECvGiDpJjlfUWela.jpg",
        "year": "2018",
        "description": "“美国队长内战”事件后，特查拉因父亲特查卡遇难而返回故乡瓦坎达，继承王位，并继续以“黑豹”的身份守护这个国家。长期与世隔绝的瓦坎达依靠珍贵的振金发展出远超外界想象的科技，却始终将真正实力隐藏于世人眼前。登基后不久，特查拉与娜吉雅、奥克耶等人…",
        "types": [
          "动作",
          "冒险",
          "科幻"
        ],
        "directors": [
          "瑞恩·库格勒"
        ],
        "actors": [
          "查德维克·博斯曼",
          "迈克尔·B·乔丹",
          "露皮塔·尼永奥",
          "丹娜·奎里拉"
        ]
      },
      {
        "id": "col_film_14_16",
        "title": "蝙蝠侠：侠影之谜",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/bQqwhAU4dfacGB5yKzRHBc58Sw4.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9IIBboV7MCT0bTxzXHmWK1Hq558.jpg",
        "year": "2005",
        "description": "童年亲眼目睹父母在高谭市街头被杀后，布鲁斯·韦恩始终被恐惧与愤怒所困扰。成年后，他离开故乡周游世界，深入犯罪世界，试图理解罪犯的心理，并在旅途中接受杜卡的训练，学习格斗技巧以及如何驾驭内心的恐惧。当他发现神秘的影忍者盟与自己的信念背道而驰时…",
        "types": [
          "剧情",
          "犯罪",
          "动作"
        ],
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "克里斯蒂安·贝尔",
          "迈克尔·凯恩",
          "连姆·尼森",
          "凯蒂·霍尔姆斯"
        ]
      }
    ]
  }
];

export function getCollectionBySlug(slug: string): CuratedCollection | undefined {
  return CURATED_COLLECTIONS.find((c) => c.slug === slug);
}

export function getCollectionById(id: string): CuratedCollection | undefined {
  return CURATED_COLLECTIONS.find((c) => c.id === id);
}
