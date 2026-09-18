/**
 * 首页首屏预烘焙精选影视数据集 (包含 100% 真实有效官方演职人员与 TMDB 原画直链)
 */

export interface PrebakedSubject {
  id: string;
  tmdbId?: string;
  title: string;
  rate: string;
  cover: string;
  backdrop?: string;
  description?: string;
  year?: string;
  is_new?: boolean;
  playable?: boolean;
  episodes_info?: string;
  type?: string;
  types?: string[];
  directors?: string[];
  actors?: string[];
  tagline?: string;
}

export interface TrendingNavItem {
  title: string;
  updateBadge?: string;
  url?: string;
  type?: string;
}

export interface PrebakedHomeCategory {
  hero: PrebakedSubject[];
  top10: PrebakedSubject[];
  s1: PrebakedSubject[];
  s2: PrebakedSubject[];
  s3: PrebakedSubject[];
  s4: PrebakedSubject[];
  trendingNav?: TrendingNavItem[];
}

import { ANIME_HOME_DATA, VARIETY_HOME_DATA, SHORT_HOME_DATA, ALL_HOME_DATA, DOCUMENTARY_HOME_DATA } from './home-prebaked-extra';

export const PREBAKED_HOME_DATA: {
  all: PrebakedHomeCategory;
  movie: PrebakedHomeCategory;
  tv: PrebakedHomeCategory;
  anime: PrebakedHomeCategory;
  variety: PrebakedHomeCategory;
  short: PrebakedHomeCategory;
  documentary: PrebakedHomeCategory;
} = {
  "all": ALL_HOME_DATA,
  "documentary": DOCUMENTARY_HOME_DATA,
  "movie": {
    "trendingNav": [
        {
                "title": "欢迎来龙餐馆",
                "updateBadge": ""
        },
        {
                "title": "给阿嬷的情书",
                "updateBadge": ""
        },
        {
                "title": "特立独行",
                "updateBadge": ""
        },
        {
                "title": "逃出绝命街",
                "updateBadge": ""
        },
        {
                "title": "打生桩",
                "updateBadge": ""
        },
        {
                "title": "出入平安",
                "updateBadge": ""
        },
        {
                "title": "M.I.S.S.I.O.N. 歌剧般的潜入搜查官",
                "updateBadge": ""
        },
        {
                "title": "蜂鸟行动",
                "updateBadge": ""
        },
        {
                "title": "夜王",
                "updateBadge": ""
        },
        {
                "title": "求救信号",
                "updateBadge": ""
        },
        {
                "title": "海洋奇缘：启航",
                "updateBadge": ""
        },
        {
                "title": "怒之杀(听译)",
                "updateBadge": ""
        }
      ],
    "hero": [
        {
                "id": "iyf_hero_movie_1",
                "title": "特立独行",
                "rate": "6.7",
                "cover": "https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/kTp2i00tjARpsI6wTkU4Q8ArGaX.jpg",
                "description": "三十年前，以超人王长海为首的超英协会击溃了外星人，多年后，王长海被任命回乡建立战斗小队，但在这个多年和平的莱茵镇上，人情世故和礼尚往来让王长海手足无措，给王长海完成任务造成了层层阻碍。",
                "year": "2026",
                "types": [
                        "热门",
                        "剧情",
                        "电影"
                ],
                "episodes_info": "电影·剧情",
                "type": "movie",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_movie_2",
                "title": "给阿嬷的情书",
                "rate": "8.8",
                "cover": "https://image.tmdb.org/t/p/w500/s0sC3hPPX4OobLNfdl2iSs2vtvI.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/AwmlL79nKTcX5tzAhyoV298xXlz.jpg",
                "description": "潮汕阿嬷叶淑柔一直守着平淡的日子，安享晚年。孙子晓伟因债务缠身，瞒着家人远赴泰国，寻找传闻中已成亿万富豪的阿公郑木生。然而，一个令人意外的消息打破了整个家庭的平静：多年来一直通过跨国信件与阿嬷“谈情说爱”诉说思念的人，竟然并非阿嬷的丈夫郑木生。随着晓伟的调查，一个感人的真相被缓缓揭开。",
                "year": "2026",
                "types": [
                        "热门",
                        "剧情",
                        "电影"
                ],
                "episodes_info": "电影·剧情",
                "type": "movie",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_movie_3",
                "title": "玩具总动员5",
                "rate": "8.4",
                "cover": "https://image.tmdb.org/t/p/w500/oo46YfPuMcV9t7KsTiaMVUVRjvJ.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
                "description": "胡迪、巴斯光年、翠斯等“元老级”玩具将跟随小主人邦妮的成长脚步，共同迎接数字时代下的全新挑战。随着无所不能的科技产品逐渐走进童年世界，一批充满科技感的崭新角色也随之重磅亮相：青蛙造型的智能平板小荷、憨态可掬的导航玩具小不丢、活力十足的抓拍好手小拍侠，以及自带笑点的臭屁小机灵。当身边的同龄朋友们开始沉浸在科技玩具带来的“电子陪伴”中，而玩具伙伴们也迎来了前所未有的生存难题：在屏幕占据注意力的时代，玩具的时代真的结束了吗？在“被取代”危机的当下，这群玩具伙伴还能否携手，帮助邦妮找回属于自己的真实友谊与快乐？",
                "year": "2026",
                "types": [
                        "热门",
                        "动画",
                        "电影"
                ],
                "episodes_info": "电影·动画",
                "type": "movie",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_movie_4",
                "title": "寒战1994",
                "rate": "6.5",
                "cover": "https://image.tmdb.org/t/p/w500/8NaaLrhXbhuXmjndCKmgaJvLTb1.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/gIpIMTZKhDNqFsoSj04sKZfV0g0.jpg",
                "description": "2017年，李文彬突然失踪，与此同时，蔡元祺在英国遭到暗杀。为了查明两起事件背后的关联，刘杰辉向简奥伟寻求帮助，一份尘封多年的1994年档案也由此被重新打开。时间回到香港回归前夕，随着政治部即将解散，一宗震动全城的富商绑架案将年轻的O记警司李文彬与蔡元祺卷入其中。案件背后，英方、警队、富商与黑道等多方势力彼此角力，在权力即将重新洗牌的时代节点，各方都试图为自己争取位置。随着调查深入，李文彬与蔡元祺之间的分歧也逐渐扩大，而这段发生在1994年的往事，似乎与多年后的“寒战”风波有着更深的联系……",
                "year": "2026",
                "types": [
                        "热门",
                        "剧情",
                        "电影"
                ],
                "episodes_info": "电影·剧情",
                "type": "movie",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_movie_5",
                "title": "穿普拉达的女王2",
                "rate": "7.0",
                "cover": "https://image.tmdb.org/t/p/w500/zGQyw7v2dvb2FNDdVUJFcaPrD5y.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/Af907x5h9W1wVis8XrSd7ynTWuy.jpg",
                "description": "　　随着传统出版业的式微，时尚女王米兰达在职业生涯中迎来新挑战。她不得不与手握广告预算的曾经的助理，如今已是奢侈品牌集团高管的艾米莉正面交锋。两人在行业变局中展开了一场关乎权力与生存的较量。",
                "year": "2026",
                "types": [
                        "热门",
                        "剧情",
                        "电影"
                ],
                "episodes_info": "电影·剧情",
                "type": "movie",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_movie_6",
                "title": "我的妈耶",
                "rate": "6.3",
                "cover": "https://image.tmdb.org/t/p/w500/cE15hXnCv6VfADRCo69n83BRNsS.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/tRg0CIV7HQVKcdd2Jabv4GdhEVF.jpg",
                "description": "十一（黄明昊 饰）从小由父亲张永勋（白客 饰）独自抚养长大，自出生时就离世的妈妈东玉（马思纯 饰）对于他而言则是陌生人般的存在。处于青春叛逆期的十一，在自己18岁生日这天意外发现了一本「妈妈的日记」。在好奇心的驱使下，十一翻开日记，开启了一段“认识妈妈”的旅程——十一跟随着妈妈的成长经历，邂逅了她人生不同阶段的重要人物——霹雳舞学长（梁靖康 饰）、高中闺蜜彩霞（嵇嘉禾 饰）、发小刘皮孩（王天放 饰）、初恋小哥（孙阳 饰）以及老公张永勋。这些人物串联起东玉一生所经历的友谊、爱情与亲情…… 透过这本「日记」，十一看见了东玉短暂却向阳的一生，也终于感受到了她对自己从始至终不曾缺席的爱……",
                "year": "2026",
                "types": [
                        "热门",
                        "剧情",
                        "电影"
                ],
                "episodes_info": "电影·剧情",
                "type": "movie",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_movie_7",
                "title": "镖人：风起大漠",
                "rate": "8.2",
                "cover": "https://image.tmdb.org/t/p/w500/ki0ilBYgbOZKUuE1NN53FYWK9zQ.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/wHwoA0K8GO5vTcOSro8viyfxf6m.jpg",
                "description": "大漠之上，镖人、官府、西域五大家族等多方势力盘根错节、暗潮涌动。“天字第二号逃犯”刀马受恩人莫族长所托，接下一趟特殊的押镖任务，护送神秘人物知世郎从西域前往长安。然而，他很快发现自己护送的竟是“天字第一号逃犯”。随着消息传开，各方势力纷纷闻风而动，一场围绕这趟神秘押镖展开的争夺席卷大漠。面对接踵而来的追杀与危机，刀马也逐渐发现，这趟任务背后还隐藏着与自己和小七有关的秘密……",
                "year": "2026",
                "types": [
                        "热门",
                        "动作",
                        "电影"
                ],
                "episodes_info": "电影·动作",
                "type": "movie",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_movie_8",
                "title": "迈克尔·杰克逊：巨星之路",
                "rate": "8.6",
                "cover": "https://image.tmdb.org/t/p/w500/1hPSbiyfAhtWAIBf2XtDPA0NyvS.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/ufSwlnECLoUbBjPrFqEQcWBzHwc.jpg",
                "description": "　　本片将通过一段从未展现过的深度视角，真实记录传奇巨星迈克尔·杰克逊的复杂人生。影片不仅再现了他最具标志性的艺术表演瞬间，更深入挖掘了他的内心世界——从天才神童的成长阵痛到全球偶像背后的争议与坚韧，全面呈现这位伟大艺术家的辉煌与坎坷。",
                "year": "2026",
                "types": [
                        "热门",
                        "剧情",
                        "电影"
                ],
                "episodes_info": "电影·剧情",
                "type": "movie",
                "is_new": true,
                "playable": true
        }
      ],
    "top10": [
      {
        "id": "pb_m_top10_1",
        "tmdbId": "1368337",
        "title": "奥德赛",
        "rate": "8.6",
        "cover": "https://img9.doubanio.com/view/photo/m_ratio_poster/public/p2933569626.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/RMXG8myu1aGlNUsRjtxzmpdMK0.jpg",
        "description": "豆瓣一周电影口碑榜 TOP 1。荷马史诗震撼重现，克里斯托弗·诺兰执导，马特·达蒙主演，登顶本周口碑榜榜首。",
        "year": "2026",
        "types": [
          "动作",
          "历史",
          "史诗"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "马特·达蒙",
          "汤姆·赫兰德",
          "安妮·海瑟薇",
          "罗伯特·帕丁森",
          "希米什·帕特尔"
        ]
      },
      {
        "id": "pb_m_top10_2",
        "tmdbId": "1391021",
        "title": "欢迎来龙餐馆",
        "rate": "8.7",
        "cover": "https://img3.doubanio.com/view/photo/m_ratio_poster/public/p2935109312.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zr7om0GOLOcLo7SXMmNEG5rz6de.jpg",
        "description": "豆瓣一周电影口碑榜 TOP 2。动荡时代下人间烟火与人性温暖的细腻交织，全网极高赞誉与感动。",
        "year": "2026",
        "types": [
          "剧情",
          "战争"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "文牧野"
        ],
        "actors": [
          "沈腾",
          "蒋奇明",
          "奥马尔·谢里夫",
          "李治廷",
          "谢里夫·萨比"
        ]
      },
      {
        "id": "pb_m_top10_3",
        "tmdbId": "1305672",
        "title": "抓特务",
        "rate": "7.4",
        "cover": "https://img9.doubanio.com/view/photo/m_ratio_poster/public/p2933198755.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8Jjl0CUOt2T6Wf2hYcii4pd0SDR.jpg",
        "description": "豆瓣一周电影口碑榜 TOP 3。高能谍战智斗，悬念丛生，层层反转扣人心弦。",
        "year": "2026",
        "types": [
          "剧情",
          "悬疑"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "冯小刚"
        ],
        "actors": [
          "雷佳音",
          "胡歌",
          "啜妮",
          "张瑶",
          "林晓凡"
        ]
      },
      {
        "id": "pb_m_top10_4",
        "tmdbId": "950028",
        "title": "激情邀约",
        "rate": "7.4",
        "cover": "https://img1.doubanio.com/view/photo/m_ratio_poster/public/p2932993239.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lEwqBGNR65KZv6Ej5ufcmhZu2y2.jpg",
        "description": "豆瓣一周电影口碑榜 TOP 4。浪漫喜剧年度黑马，诙谐幽默中深入探讨当代两性情感与信任。",
        "year": "2026",
        "types": [
          "喜剧",
          "爱情"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "奥利维亚·王尔德"
        ],
        "actors": [
          "塞斯·罗根",
          "奥利维亚·王尔德",
          "佩内洛普·克鲁兹",
          "爱德华·诺顿",
          "Skip Howland"
        ]
      },
      {
        "id": "pb_m_top10_5",
        "tmdbId": "1433601",
        "title": "无界之环",
        "rate": "7.9",
        "cover": "https://img3.doubanio.com/view/photo/m_ratio_poster/public/p2934876803.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cX7F226WqkQ7Ly2GHEdIuGaai0u.jpg",
        "description": "豆瓣一周电影口碑榜 TOP 5。脑洞大开的奇幻轻喜剧，天马行空的视觉构想与独特视听表达。",
        "year": "2025",
        "types": [
          "喜剧",
          "奇幻"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "Oscar Hudson"
        ],
        "actors": [
          "艾略特·提特恩索",
          "卢克·提特恩索",
          "尼尔·马斯克尔",
          "马修·迪伦·罗伯茨",
          "Camilla Waldman"
        ]
      },
      {
        "id": "pb_m_top10_6",
        "tmdbId": "1472813",
        "title": "女仆日记",
        "rate": "7.3",
        "cover": "https://img3.doubanio.com/view/photo/m_ratio_poster/public/p2934910303.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bYaiKiCmTOnd2EW0yuzA4vno8g.jpg",
        "description": "豆瓣一周电影口碑榜 TOP 6。冷静剖析上流社会的虚伪面具，撕开华丽表面下的人性裂痕。",
        "year": "2026",
        "types": [
          "剧情",
          "喜剧"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "拉杜·裘德"
        ],
        "actors": [
          "Ana Dumitrașcu",
          "玛丽·里维埃",
          "Louen Bouteiller",
          "Arnaud Baudoin",
          "梅兰尼·蒂埃里"
        ]
      },
      {
        "id": "pb_m_top10_7",
        "tmdbId": "1294972",
        "title": "凤仙花",
        "rate": "7.3",
        "cover": "https://img2.doubanio.com/view/photo/m_ratio_poster/public/p2923172271.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/q9BznLtUUuHfHzyT3NOKzqM6oxz.jpg",
        "description": "豆瓣一周电影口碑榜 TOP 7。诗意盎然的情感治愈力作，以温暖笔触描摹时光流转中的生命之美。",
        "year": "2025",
        "types": [
          "动画",
          "治愈"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "木下麦"
        ],
        "actors": [
          "小林薰",
          "户冢纯贵",
          "满岛光",
          "宫崎美子",
          "泷正则"
        ]
      },
      {
        "id": "pb_m_top10_8",
        "tmdbId": "1376415",
        "title": "伪钞之王",
        "rate": "7.2",
        "cover": "https://img3.doubanio.com/view/photo/m_ratio_poster/public/p2926256257.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/hKC8k08rgIyXFVQXrp1izEAWwL1.jpg",
        "description": "豆瓣一周电影口碑榜 TOP 8。跌宕起伏的金融犯罪风云，瞒天过海的惊天骗局步步惊心。",
        "year": "2025",
        "types": [
          "犯罪",
          "剧情"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "Jean-Paul Salomé"
        ],
        "actors": [
          "瑞达·凯特布",
          "Sara Giraudeau",
          "巴斯蒂安·布永",
          "康坦·多尔迈尔",
          "皮埃尔·洛坦"
        ]
      },
      {
        "id": "pb_m_top10_9",
        "tmdbId": "1318335",
        "title": "荣光与暗影",
        "rate": "7.4",
        "cover": "https://img9.doubanio.com/view/photo/m_ratio_poster/public/p2931227654.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/6LpnsToxRww4wsFDX4HUcNKTNF4.jpg",
        "description": "豆瓣一周电影口碑榜 TOP 9。波澜壮阔的历史篇章，时代洪流中无名个体的命运抉择。",
        "year": "2026",
        "types": [
          "剧情",
          "历史"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "格扎维埃・吉亚诺利"
        ],
        "actors": [
          "让·杜雅尔丹",
          "娜斯提亚・戈卢别娃・卡拉克斯",
          "奥古斯特·迪尔",
          "奥利维耶・尚特罗",
          "安娜·普罗奇尼亚克"
        ]
      },
      {
        "id": "pb_m_top10_10",
        "tmdbId": "1119548",
        "title": "一切从头来过",
        "rate": "7.1",
        "cover": "https://img1.doubanio.com/view/photo/m_ratio_poster/public/p2926570640.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/sq4KQ8CXOFr02KI2XWIZvkpJXui.jpg",
        "description": "豆瓣一周电影口碑榜 TOP 10。真挚感人的家庭大作，在生活的困局中重新燃起希望之火。",
        "year": "2025",
        "types": [
          "剧情",
          "家庭"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "Jérôme Bonnell"
        ],
        "actors": [
          "斯万·阿劳德",
          "加拉泰亚·贝露琪",
          "Louise Chevillotte",
          "Emmanuelle Devos",
          "Aymeline Alix"
        ]
      }
    ],
    "s1": [
      {
        "id": "36343469",
        "title": "海洋奇缘：启航",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/8f4OJJrMtZcoB4h1BLyyZewd96X.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/dmwb15BCkqjoXA9dXIsoY2Hn10F.jpg",
        "description": "莫阿娜受到大海的召唤，与传奇半神毛伊一同启航，首次跨越莫图鲁尼岛的礁石，驶向远方未知的海域。迪士尼顶级真人冒险巨制。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "奇幻",
          "冒险",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "托马斯·凯尔"
        ],
        "actors": [
          "凯瑟琳·拉加艾亚",
          "道恩·强森"
        ]
      },
      {
        "id": "35811064",
        "title": "欢迎来龙餐馆",
        "rate": "8.7",
        "cover": "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2935109312.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zr7om0GOLOcLo7SXMmNEG5rz6de.jpg",
        "description": "2026 院线热播巨制。由文牧野执导，沈腾 / 蒋奇明 / 奥马尔·谢里夫联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "文牧野"
        ],
        "actors": [
          "沈腾",
          "蒋奇明",
          "奥马尔·谢里夫",
          "李治廷",
          "谢里夫·萨比"
        ]
      },
      {
        "id": "36808876",
        "tmdbId": "1368337",
        "title": "奥德赛",
        "rate": "8.6",
        "cover": "https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2933569626.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/RMXG8myu1aGlNUsRjtxzmpdMK0.jpg",
        "description": "2026 院线热播巨制。由克里斯托弗·诺兰执导，马特·达蒙 / 汤姆·霍兰德 / 安妮·海瑟薇联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "马特·达蒙",
          "汤姆·赫兰德",
          "安妮·海瑟薇",
          "罗伯特·帕丁森",
          "希米什·帕特尔"
        ]
      },
      {
        "id": "36882191",
        "tmdbId": "1633056",
        "title": "八仙！",
        "rate": "8.2",
        "cover": "https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2934074566.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lMK3FnMfQ9O3DiC7hi4J2XBzNf.jpg",
        "description": "2026 院线热播巨制。由牟正洋执导，陈浩 / 李绍哲 / 立冬联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "牟正洋"
        ],
        "actors": [
          "陈浩",
          "李绍哲",
          "立冬",
          "Huang Guo",
          "Dong Tianyi"
        ]
      },
      {
        "id": "36246195",
        "title": "蜘蛛侠：崭新之日",
        "rate": "7.8",
        "cover": "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2934276912.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7iwUUcKURMT7aKfCwMy6YnGtchD.jpg",
        "description": "2026 院线热播巨制。由德斯汀·丹尼尔·克雷顿执导，汤姆·霍兰德 / 赞达亚 / 萨迪·辛克联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "德斯汀·丹尼尔·克雷顿"
        ],
        "actors": [
          "汤姆·赫兰德",
          "赞达亚·科尔曼",
          "马克·鲁法洛",
          "乔·博恩瑟",
          "雅各布·贝塔隆"
        ]
      },
      {
        "id": "36452545",
        "tmdbId": "1491920",
        "title": "功夫女足",
        "rate": "6.3",
        "cover": "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2933860063.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/J1UgJwRxDQS92kw75KgeVFZMHf.jpg",
        "description": "2026 院线热播巨制。由周星驰执导，张小斐 / 迪丽热巴 / 张艺兴联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "周星驰"
        ],
        "actors": [
          "张小斐",
          "迪丽热巴",
          "张艺兴",
          "刘嘉玲",
          "佐藤健"
        ]
      },
      {
        "id": "37450627",
        "title": "痴迷",
        "rate": "7.6",
        "cover": "https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2934049524.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rZfmzpixLKLR3Hg2u0WgC7XLFl8.jpg",
        "description": "2025 院线热播惊悚力作。由库里·巴克执导，迈克尔·约翰斯顿 / 印达·纳瓦雷特联袂呈现。",
        "year": "2025",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "Curry Barker"
        ],
        "actors": [
          "迈克尔·约翰斯顿",
          "英迪·納瓦瑞特",
          "Cooper Tomlinson",
          "Megan Lawless",
          "安迪·里克特"
        ]
      },
      {
        "id": "36235977",
        "title": "后室",
        "rate": "6.6",
        "cover": "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2933327977.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/dqmMWNWfLnExDRpMtIMqI97GQFR.jpg",
        "description": "2026 院线热播科幻巨制。由凯恩·帕森斯执导，切瓦特·埃加福 / 雷娜特·赖因斯夫 / 芬恩·本尼特联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "凯恩·帕森斯"
        ],
        "actors": [
          "切瓦特·埃加福",
          "雷娜特·赖因斯夫",
          "芬恩·本尼特",
          "Lukita Maxwell",
          "马克·杜普拉斯"
        ]
      },
      {
        "id": "36238849",
        "title": "玩具总动员5",
        "rate": "8.0",
        "cover": "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2933391462.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
        "description": "2026 迪士尼皮克斯动画巨制。由安德鲁·斯坦顿 麦肯纳·哈里斯执导，汤姆·汉克斯 / 蒂姆·艾伦 / 琼·库萨克联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "安德鲁·斯坦顿"
        ],
        "actors": [
          "琼·库萨克",
          "汤姆·汉克斯",
          "蒂姆·艾伦",
          "柯南·奥布莱恩",
          "Scarlett Spears"
        ]
      },
      {
        "id": "36812879",
        "title": "抓特务",
        "rate": "7.4",
        "cover": "https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2933198755.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8Jjl0CUOt2T6Wf2hYcii4pd0SDR.jpg",
        "description": "2026 院线热播巨制。由冯小刚执导，雷佳音 / 胡歌 / 啜妮联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "冯小刚"
        ],
        "actors": [
          "雷佳音",
          "胡歌",
          "啜妮",
          "张瑶",
          "林晓凡"
        ]
      },
      {
        "id": "37508847",
        "title": "空枪",
        "rate": "7.2",
        "cover": "https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2934946788.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/c1hrosrq2q56Afn7aZHJZqA1Dn6.jpg",
        "description": "2026 院线热播悬疑巨制。由韩延执导，朱一龙 / 檀健次 / 梁家辉联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "韩延"
        ],
        "actors": [
          "朱一龙",
          "檀健次",
          "梁家辉",
          "卫诗雅",
          "惠英红"
        ]
      },
      {
        "id": "36850814",
        "title": "年会不能停！2",
        "rate": "6.6",
        "cover": "https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2934583425.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/jXW4Gu7s96HB2KZf8Cb73SRGe9q.jpg",
        "description": "2026 院线爆笑喜剧。由董润年执导，张若昀 / 白客 / 高叶联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "董润年"
        ],
        "actors": [
          "张若昀",
          "白客",
          "高叶",
          "董成鹏",
          "庄达菲"
        ]
      },
      {
        "id": "36953973",
        "title": "特立独行",
        "rate": "6.7",
        "cover": "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2933638302.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kTp2i00tjARpsI6wTkU4Q8ArGaX.jpg",
        "description": "2026 院线热播巨制。由邢文雄执导，白敬亭 / 魏翔 / 张国强联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "邢文雄"
        ],
        "actors": [
          "白敬亭",
          "魏翔",
          "张国强",
          "苏小玎",
          "黄才伦"
        ]
      },
      {
        "id": "36962219",
        "title": "小黄人与大怪兽",
        "rate": "6.6",
        "cover": "https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2933539994.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kkcwhgSFd81QDlXo8ytrpHPQjhy.jpg",
        "description": "2026 照明娱乐合家欢动画巨制。由皮埃尔·柯芬执导。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "皮埃尔·科芬"
        ],
        "actors": [
          "皮埃尔·科芬",
          "特雷·帕克",
          "克里斯托弗·瓦尔兹",
          "艾莉森·詹尼",
          "杰西·艾森伯格"
        ]
      },
      {
        "id": "37191746",
        "title": "四渡",
        "rate": "7.5",
        "cover": "https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2931635664.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8BVpdY93rqrbopHi9BwEkiIdkX7.jpg",
        "description": "2026 历史战争史诗巨制。由徐展雄执导，刘烨 / 王雷 / 于适联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "徐展雄"
        ],
        "actors": [
          "刘烨",
          "王雷",
          "于适",
          "许魏洲",
          "王天辰"
        ]
      },
      {
        "id": "38581618",
        "title": "牛来",
        "rate": "6.0",
        "cover": "https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2934945600.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xVZBG9LgFfbUbP6RJDKCO3emUK7.jpg",
        "description": "2026 院线温情治愈力作。由信雨萌执导。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "信雨萌"
        ],
        "actors": [
          "信雨萌",
          "孙丽芳"
        ]
      },
      {
        "id": "35275131",
        "title": "去你的岛",
        "rate": "7.6",
        "cover": "https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2934742318.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/sUtCmlkUcup2aI10p5XxVELaFbg.jpg",
        "description": "2026 院线治愈系动画电影。由周浩然执导，杨茜云 / 张福正 / 孙婉瑜联袂献声。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "周浩然"
        ],
        "actors": [
          "夏天妹妹",
          "张福正"
        ]
      },
      {
        "id": "pb_m_s1_fall2",
        "tmdbId": "1101412",
        "title": "坠落2：死点",
        "rate": "5.5",
        "cover": "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2935283013.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/yBDxqDB29kpH9VojTytjGWBgmdJ.jpg",
        "description": "2026 院线热播惊悚巨制。由迈克尔·斯派瑞 彼得·斯派瑞执导，哈丽特·斯莱特 / 阿塞玛·托马斯 / 汤姆·布里特尼联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "迈克尔·斯派瑞",
          "彼得·斯派瑞"
        ],
        "actors": [
          "哈里特·斯莱特",
          "Arsema Thomas",
          "汤姆·布里特尼",
          "弗吉尼亚·加德纳",
          "萨哈贾克·波斯安吉特"
        ]
      },
      {
        "id": "pb_m_s1_wrath",
        "tmdbId": "1288445",
        "title": "怒之杀",
        "rate": "5.8",
        "cover": "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2935069903.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/e2QAGrEmbpmZpMymDRkDisJkvg9.jpg",
        "description": "2026 院线热播巨制。由让-弗朗索瓦·雷切执导，杰森·斯坦森 / 钱尼尔·库勒 / 拉蒙·蒂卡拉姆联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "让-弗朗索瓦·里歇"
        ],
        "actors": [
          "杰森·斯坦森",
          "安娜贝拉·沃丽丝",
          "罗兰·默勒",
          "拉蒙·提卡蓝",
          "阿尔纳斯·费达拉维丘斯"
        ]
      },
      {
        "id": "pb_m_s1_burn",
        "tmdbId": "1444590",
        "title": "燃烧吧！爸爸",
        "rate": "6.8",
        "cover": "https://img3.doubanio.com/view/photo/s_ratio_poster/public/p2935535832.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oOI3KNLmMSaHpDukSQN4cSLn4tb.jpg",
        "description": "2026 院线热播巨制。由刘潇阳执导，文淇 / 倪虹洁 / 喻恩泰联袂呈现。",
        "year": "2026",
        "types": [
          "院线",
          "热映",
          "电影"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "刘潇阳"
        ],
        "actors": [
          "文淇",
          "倪虹洁",
          "喻恩泰",
          "郭俊辰",
          "葛鑫怡"
        ]
      }
    ],
    "s2": [
      {
        "id": "pb_m_s2_1",
        "tmdbId": "278",
        "title": "肖申克的救赎",
        "rate": "8.7",
        "cover": "https://image.tmdb.org/t/p/w500/iKZev9OgfklidO8AvdrYlwung2o.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/pNjh59JSxChQktamG3LMp9ZoQzp.jpg",
        "description": "安迪·杜佛兰因被错判谋杀妻子及其情人，被判处两项无期徒刑，送入缅因州的肖申克监狱服刑。在残酷而压抑的监狱生活中，安迪凭借冷静、智慧和始终未曾熄灭的希望逐渐赢得狱友们的尊重，并与瑞德建立起深厚的友谊。漫长的岁月里，他也开始用自己的方式改变身边的人，以及这座看似牢不可破的监狱。...",
        "year": "1994",
        "types": [
          "剧情",
          "经典"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "弗兰克·德拉邦特"
        ],
        "actors": [
          "蒂姆·罗宾斯",
          "摩根·弗里曼",
          "鲍勃·冈顿",
          "威廉姆·赛德勒",
          "克兰西·布朗"
        ]
      },
      {
        "id": "pb_m_s2_2",
        "tmdbId": "10997",
        "title": "霸王别姬",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/vOEkLofQ8N1OdbGs5L87m7Plpw2.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bBiZN1epQTu3F8iFLBuMhc4TRzr.jpg",
        "description": "段小楼与程蝶衣是一对自幼一起学戏长大的师兄弟，两人在舞台上配合天衣无缝，尤其一出《霸王别姬》更是誉满京城，并约定要合演一辈子。然而，两人对戏剧与人生的理解截然不同：段小楼深知戏非人生，程蝶衣却早已人戏不分。后来，段小楼迎娶菊仙，三人之间由此产生复杂的情感纠葛。随着时代风云不断变迁，他们的命运也一次次被卷入其中，舞台上的...",
        "year": "1993",
        "types": [
          "剧情",
          "文艺"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "陈凯歌"
        ],
        "actors": [
          "张国荣",
          "张丰毅",
          "巩俐",
          "吕齐",
          "英达"
        ]
      },
      {
        "id": "pb_m_s2_3",
        "tmdbId": "13",
        "title": "阿甘正传",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/pplybKImR7LKzSVzRylK6Cl4dzm.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/66Kn4XWhkuPkJxOJyPEx4U2CUfN.jpg",
        "description": "阿甘出生在美国南方阿拉巴马州一个闭塞的小镇，智商只有75，然而他的妈妈是一位性格坚强的女性，她常常鼓励阿甘要自强不息。阿甘像普通孩子一样上学，并认识了一生的朋友和挚爱珍妮。在珍妮和妈妈的爱护下，阿甘凭着自己出众的奔跑能力，开始了一生不停的奔跑。他先后成为橄榄球明星、越战英雄、乒乓球外交使者和亿万富翁，但始终忘不了珍妮。...",
        "year": "1994",
        "types": [
          "励志",
          "剧情"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "罗伯特·泽米吉斯"
        ],
        "actors": [
          "汤姆·汉克斯",
          "罗宾·怀特",
          "加里·西尼斯",
          "莎莉·菲尔德",
          "麦凯尔泰·威廉逊"
        ]
      },
      {
        "id": "pb_m_s2_4",
        "tmdbId": "157336",
        "title": "星际穿越",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/spQm5r317XPNHK1941ChWmqzkZs.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5XNQBqnBwPA9yT0jZ0p3s8bbLh0.jpg",
        "description": "近未来的地球黄沙遍野，小麦、秋葵等基础农作物相继因枯萎病灭绝，人类不再像从前那样仰望星空，放纵想象力和灵感的迸发，而是每日在沙尘暴的肆虐下倒数着所剩不多的光景。在家务农的前NASA宇航员库珀接连在女儿墨菲的书房发现奇怪的重力场现象，随即得知在某个未知区域内前NASA成员仍秘密进行一个拯救人类的计划。多年以前土星附近出现...",
        "year": "2014",
        "types": [
          "科幻",
          "烧脑"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "马修·麦康纳",
          "安妮·海瑟薇",
          "迈克尔·凯恩",
          "杰西卡·查斯坦",
          "卡西·阿弗莱克"
        ]
      },
      {
        "id": "pb_m_s2_5",
        "tmdbId": "27205",
        "title": "盗梦空间",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/89W962aAnPS3N3BdKgy2BvUhnCh.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg",
        "description": "道姆·柯布与同事阿瑟和纳什在一次针对日本能源大亨齐藤（渡边谦 饰）的盗梦行动中失败，反被齐藤利用。齐藤威逼利诱因遭通缉而流亡海外的柯布帮他拆分他竞争对手的公司，采取极端措施在其唯一继承人罗伯特·费希尔的深层潜意识中种下放弃家族公司、自立门户的想法。为了重返美国，柯布偷偷求助于岳父迈尔斯，吸收了年轻的梦境设计师艾里阿德妮...",
        "year": "2010",
        "types": [
          "科幻",
          "悬疑"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "莱昂纳多·迪卡普里奥",
          "约瑟夫·高登-莱维特",
          "渡边谦",
          "汤姆·哈迪",
          "艾利奥特·佩吉"
        ]
      },
      {
        "id": "pb_m_s2_6",
        "tmdbId": "129",
        "title": "千与千寻",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/dnwMqbndJpOEhoVqjlMU9U7LFle.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/dyJvKsNs2KP8qQnAXbRwDjblViy.jpg",
        "description": "10岁的千寻跟随父母搬家途中，意外穿过一条神秘隧道，闯入了一个属于神灵的奇异世界。父母因为擅自吃下供奉给神灵的食物而被变成猪，惊慌失措的千寻则在神秘少年白龙的帮助下得以留下。为了在这个世界生存并寻找救回父母的方法，她不得不到汤婆婆掌管的“油屋”浴场工作。在形形色色的神灵与不可思议的遭遇中，原本胆小任性的千寻开始学会独自...",
        "year": "2001",
        "types": [
          "动画",
          "奇幻"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "宫崎骏"
        ],
        "actors": [
          "柊瑠美",
          "入野自由",
          "夏木真理",
          "内藤刚志",
          "泽口靖子"
        ]
      },
      {
        "id": "pb_m_s2_7",
        "tmdbId": "101",
        "title": "这个杀手不太冷",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/wT9bYGpoFnJGiRaRF9DErVjZ7qo.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fj0hwDJEOOHllRim2BMt5L7tbjf.jpg",
        "description": "里昂是名孤独的职业杀手，受人雇佣。一天，邻居家小姑娘马蒂尔达敲开他的房门，要求在他那里暂避杀身之祸。原来邻居家的主人是警方缉毒组的眼线，只因贪污了一小包毒品而遭恶警杀害全家的惩罚。马蒂尔达得到里昂的留救，幸免于难，并留在里昂那里。里昂教小女孩使枪，她教里昂法文，两人关系日趋亲密，相处融洽。女孩想着去报仇，反倒被抓，里昂...",
        "year": "1994",
        "types": [
          "动作",
          "犯罪"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "吕克·贝松"
        ],
        "actors": [
          "让·雷诺",
          "娜塔莉·波特曼",
          "加里·奥德曼",
          "丹尼尔·艾洛",
          "彼得·阿佩尔"
        ]
      },
      {
        "id": "pb_m_s2_8",
        "tmdbId": "597",
        "title": "泰坦尼克号",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/lFYUkUPcFXDzZzSfkiCDsvHIJxj.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xnHVX37XZEp33hhCbYlQFq7ux1J.jpg",
        "description": "1912年4月10日，号称 “世界工业史上的奇迹”的豪华客轮泰坦尼克号开始了它完工后的首次商业航行，从英国的南安普顿出发驶往美国纽约。富家少女罗丝与母亲及未婚夫卡尔坐上了头等舱；另一边，放荡不羁的少年画家杰克也在码头的一场赌博中赢得了下等舱的船票。罗丝厌倦了上流社会虚伪的生活，不愿嫁给卡尔，打算投海自尽，被杰克救起。很...",
        "year": "1997",
        "types": [
          "爱情",
          "灾难"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "詹姆斯·卡梅隆"
        ],
        "actors": [
          "莱昂纳多·迪卡普里奥",
          "凯特·温斯莱特",
          "比利·赞恩",
          "凯西·贝茨",
          "弗兰西丝·费舍"
        ]
      },
      {
        "id": "pb_m_s2_9",
        "tmdbId": "637",
        "title": "美丽人生",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/84PPFpTTMO83bPy19v7JgdNklDp.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/6aNKD81RHR1DqUUa8kOZ1TBY1Lp.jpg",
        "description": "1939年的意大利，乐观幽默的犹太青年圭多邂逅了女教师多拉。经过一连串阴差阳错，两人相爱成家，并有了儿子乔舒亚。然而随着战争的阴影逼近，圭多和儿子因犹太身份被强行送往集中营，没有犹太血统的多拉也毅然选择同行。为了保护年幼的乔舒亚免受残酷现实的伤害，圭多把集中营里的生活编成一场游戏，并告诉他获胜的奖品是一辆真正的坦克。在...",
        "year": "1997",
        "types": [
          "剧情",
          "战争"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "罗伯托·贝尼尼"
        ],
        "actors": [
          "罗伯托·贝尼尼",
          "尼可莱塔·布拉斯基",
          "乔治·坎塔里尼",
          "朱斯蒂诺·杜拉诺",
          "赛尔乔·比尼·布斯特里克"
        ]
      },
      {
        "id": "pb_m_s2_10",
        "tmdbId": "37165",
        "title": "楚门的世界",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/nAnzFcqORitpwvRQPceIt4mcm8G.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rmiG2uwcNoGFmBKMoa1pIcf514L.jpg",
        "description": "楚门·伯班克过着看似平凡而安稳的生活，却总觉得身边有些事情不太对劲：曾经突然消失的初恋、早已溺水身亡却似乎再次出现的父亲，以及一次次阻止他离开家乡的意外。随着越来越多无法解释的异常发生，楚门开始怀疑自己熟悉的生活并不像表面那样真实，甚至感觉无论走到哪里都有人在注视着自己。为了找到失踪的初恋，也为了弄清隐藏在日常生活背后...",
        "year": "1998",
        "types": [
          "剧情",
          "哲学"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "彼得·威尔"
        ],
        "actors": [
          "金·凯瑞",
          "劳拉·琳妮",
          "诺亚·艾默里奇",
          "娜塔莎·麦克艾霍恩",
          "霍兰德·泰勒"
        ]
      }
    ],
    "s3": [
      {
        "id": "pb_m_s3_1",
        "tmdbId": "51533",
        "title": "让子弹飞",
        "rate": "7.8",
        "cover": "https://image.tmdb.org/t/p/w500/p5KiZq5MtGExUhmgPbpwiGFzALt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/k1ziDzX0u8HgrAYshMb082nvtrF.jpg",
        "description": "故事发生在1920年北洋年间的南国。买官上任的县长马邦德（葛优 饰）携妻（刘嘉玲 饰）、师爷（冯小刚 饰）及随从在赴任途中，遭遇悍匪张麻子（姜文 饰）伏击。为保命，马邦德谎称自己是师爷，并怂恿张麻子冒充县长，前往油水丰厚的“鹅城”捞钱。  然而，鹅城实际被称霸五代、贩卖鸦片、勾结官府的恶霸黄四郎（周润发 饰）完全掌控。...",
        "year": "2010",
        "types": [
          "动作",
          "黑色幽默"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "姜文"
        ],
        "actors": [
          "姜文",
          "周润发",
          "葛优",
          "刘嘉玲",
          "邵兵"
        ]
      },
      {
        "id": "pb_m_s3_2",
        "tmdbId": "1422",
        "title": "无间道",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/rF7oZ54CFBMDHTBQPm0ptIPk1hP.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/6WRrGYalXXveItfpnipYdayFkQB.jpg",
        "description": "这部由马丁·斯科塞斯执导的硬派犯罪剧情片，将我们带入两名警察的人生：科林·沙利文（马特·达蒙 饰）精明而野心勃勃，看似在麻省州警精英特别调查组中拥有快速晋升通道，该部门的首要目标是势力庞大的爱尔兰黑帮头目弗兰克·卡斯特罗（杰克·尼科尔森 饰）。比利·科斯蒂根（莱昂纳多·迪卡普里奥 饰）熟知街头法则且强悍坚韧，却因被指暴...",
        "year": "2006",
        "types": [
          "犯罪",
          "悬疑"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "马丁·斯科塞斯"
        ],
        "actors": [
          "莱昂纳多·迪卡普里奥",
          "马特·达蒙",
          "杰克·尼科尔森",
          "马克·沃尔伯格",
          "马丁·辛"
        ]
      },
      {
        "id": "pb_m_s3_3",
        "tmdbId": "13345",
        "title": "大话西游之月光宝盒",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/2dka8szEqgKWbqwhYbaT0ssAtrK.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8R2sjZg0htjBMnRii9dgUoont5P.jpg",
        "description": "五百年前，孙悟空因犯下大错遭到观音菩萨惩罚，唐三藏为救徒弟甘愿牺牲自己。五百年后，孙悟空转世成为斧头帮帮主至尊宝，过着与前世毫无关系的山贼生活。一天，春三十娘与白晶晶突然来到五岳山，寻找转世后的唐三藏，至尊宝一伙也因此被卷入妖怪之间的争斗。更让至尊宝意外的是，白晶晶与五百年前的孙悟空似乎还有一段未了的情缘。随着自己的身...",
        "year": "1995",
        "types": [
          "奇幻",
          "喜剧"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "刘镇伟"
        ],
        "actors": [
          "周星驰",
          "吴孟达",
          "罗家英",
          "蓝洁瑛",
          "莫文蔚"
        ]
      },
      {
        "id": "pb_m_s3_4",
        "tmdbId": "11471",
        "title": "英雄本色",
        "rate": "7.4",
        "cover": "https://image.tmdb.org/t/p/w500/qvdvGB9d58zjberXoCX5RihD5PY.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/o3NOUSFVCHjQFUUvS6OYPvC4sBE.jpg",
        "description": "香港某个国际伪钞集团重要分子宋子豪（狄龙）和Mark（周润发）情同手足，某次宋子豪带手下谭成（李子雄）去台北交易时被其出卖受枪伤被捕入狱，为替好兄弟报仇，Mark孤身赴台，结果被人打成瘸子，江湖地位自此一落千丈，而宋子豪的父亲也在不久丧命。一向视宋子豪为偶像的宋子杰得知哥哥的真实身份后，对黑社会及他恨之人骨，立誓利用警...",
        "year": "1986",
        "types": [
          "枪战",
          "兄弟情"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "吴宇森"
        ],
        "actors": [
          "狄龙",
          "周润发",
          "张国荣",
          "朱宝意",
          "李子雄"
        ]
      },
      {
        "id": "pb_m_s3_5",
        "tmdbId": "39915",
        "title": "青蛇",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/4PIXqxN9BIYhhNIRwACgkrwPvH7.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/sofHRGQgG6LvKYJWpaxQRFKe4or.jpg",
        "description": "南宋是一个人妖难分的时期，法海和尚（赵文卓 饰）到处收服妖精，也扰乱了在西湖底修炼的白青二蛇。青（张曼玉 饰）曾获白（王祖贤 饰）相救，二者便以姐妹相称。姐妹俩受惑佯装成人生活在民间，白更嫁于老实书生许仙，青也同时看上了许仙，便常常以媚态勾引许仙，无奈许仙只深爱白一个。白开设了药店，以为可以自此过上安定的生活，可许仙却...",
        "year": "1993",
        "types": [
          "奇幻",
          "经典"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "徐克"
        ],
        "actors": [
          "张曼玉",
          "王祖贤",
          "赵文卓",
          "吴兴国",
          "马精武"
        ]
      },
      {
        "id": "pb_m_s3_6",
        "tmdbId": "47423",
        "title": "纵横四海",
        "rate": "6.8",
        "cover": "https://image.tmdb.org/t/p/w500/5RY3c5m7lElGAWHUbkJJXQtgKEQ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ld6pkUVbFBdhtTwFNoRv4BRx0aM.jpg",
        "description": "　　钵仔糕/阿海（周润发 饰）、阿占（张国荣 饰）与红豆（锺楚红 饰）都是孤儿，从小被养父（曾江 饰）培养成国际艺术品大盗，专为他盗取名画赚钱。与此同时，他们亦认了一名警察（朱江 饰）作干爹。\r 　　法国巴黎博物馆内，名画《赫林之女仆》突然失窃。不久，阿海、阿占与红豆联手盗得另一幅名画，在与法国买家交易时，得知《赫林之...",
        "year": "1991",
        "types": [
          "动作",
          "喜剧"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "吴宇森"
        ],
        "actors": [
          "周润发",
          "张国荣",
          "钟楚红",
          "朱江",
          "曾江"
        ]
      },
      {
        "id": "pb_m_s3_7",
        "tmdbId": "9470",
        "title": "功夫",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/wv91QM70K9KzF9usPOebYX3LKkp.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9XhZhoSnFJ3AjpfzdIiZVHLQIS4.jpg",
        "description": "20世纪40年代的上海，街头混混阿星自小受尽欺辱，一心想加入横行上海的黑道势力“斧头帮”，借此出人头地。一次，他假冒斧头帮成员来到贫民社区“猪笼城寨”敲诈居民，却阴差阳错招来了真正的斧头帮。谁也没有想到，这个看似破败的城寨其实卧虎藏龙，除了脾气火爆的包租婆和看似懦弱的包租公，居民中还隐藏着多位身怀绝技的武林高手。原本只...",
        "year": "2004",
        "types": [
          "动作",
          "喜剧"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "周星驰"
        ],
        "actors": [
          "周星驰",
          "元秋",
          "元华",
          "林子聪",
          "梁小龙"
        ]
      },
      {
        "id": "pb_m_s3_8",
        "tmdbId": "146",
        "title": "卧虎藏龙",
        "rate": "7.4",
        "cover": "https://image.tmdb.org/t/p/w500/28FX5rCNo6p602DzgPOTNZjyMPh.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/nSm9cij9VRrGDoZoS16CPnX0FqK.jpg",
        "description": "十九世纪的中国，一位侠士将青冥剑赠予红颜知己，宝剑失窃后众人踏上寻剑之旅。追踪线索引向贝勒府，随着神秘刺客的出现与另一段爱情故事的展开，剧情走向陡然转折。...",
        "year": "2000",
        "types": [
          "武侠",
          "动作"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "李安"
        ],
        "actors": [
          "周润发",
          "杨紫琼",
          "章子怡",
          "张震",
          "郎雄"
        ]
      },
      {
        "id": "pb_m_s3_9",
        "tmdbId": "40751",
        "title": "东邪西毒",
        "rate": "7.7",
        "cover": "https://image.tmdb.org/t/p/w500/oJiwnFSwNmBLShTVqi7eY8qGMwS.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xQeOEWUScqWu7X7FtA2DH9QfZtZ.jpg",
        "description": "经过修复和重新剪辑的终极版《东邪西毒》。片子取材于金庸的武侠神作《射雕英雄传》，但故事的主线变成了原著中不受人待见的欧阳锋（张国荣 饰）。欧阳锋因为昔日恋人（张曼玉 饰）赌气嫁给兄长而离开家乡白驼山，来到大漠中开了一家专门介绍杀手的酒舍。在沙漠的自我放逐中他重逢了好友黄药师（梁家辉 饰），遇见了精分的慕容嫣（林青霞 饰...",
        "year": "2008",
        "types": [
          "武侠",
          "文艺"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "王家卫"
        ],
        "actors": [
          "王家卫",
          "张国荣",
          "林青霞",
          "梁朝伟",
          "张学友"
        ]
      },
      {
        "id": "pb_m_s3_10",
        "tmdbId": "11104",
        "title": "重庆森林",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/ejkczWHjQoNAPUmTU26tU3aRkr8.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/vuglA60RqvpHK9rIcG8sXaiWw1L.jpg",
        "description": "编号为223的警察失恋后患上失恋综合症，在与金发女杀手擦肩而过又离奇相遇并有了一晚温情后，原本以为包括“爱情”在内的所有东西都有保质期的他意外地迎来心灵的短暂温暖。可是，他们的爱情还是结束了。快餐店新来的女招待阿菲爱上了时常光顾快餐店的编号为633的警察，因拆了他的女友留在快餐店给他的“分手” 信，阿菲知晓了他的心情，...",
        "year": "1994",
        "types": [
          "爱情",
          "都市"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "王家卫"
        ],
        "actors": [
          "林青霞",
          "金城武",
          "梁朝伟",
          "王菲",
          "周嘉玲"
        ]
      }
    ],
    "s4": [
      {
        "id": "pb_m_s4_1",
        "tmdbId": "603",
        "title": "黑客帝国",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/eMurN09rDC2qeEv3npkUbcJfIXN.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/tlm8UkiQsitc8rSuIAscQDCnP8d.jpg",
        "description": "不久的将来，网络黑客尼奥对这个看似正常的现实世界产生了怀疑。他结识了黑客崔妮蒂，并见到了黑客组织的首领墨菲斯。墨菲斯告诉他，现实世界其实是由一个名叫“母体”的计算机人工智能系统控制，人们就像他们饲养的动物，没有自由和思想，而尼奥就是能够拯救人类的救世主。可是，救赎之路从来都不会一帆风顺，到底哪里才是真实的世界？如何才能...",
        "year": "1999",
        "types": [
          "科幻",
          "哲学"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "拉娜·沃卓斯基",
          "莉莉·沃卓斯基"
        ],
        "actors": [
          "基努·里维斯",
          "劳伦斯·菲什伯恩",
          "凯瑞-安·莫斯",
          "雨果·维文",
          "格洛丽亚·福斯特"
        ]
      },
      {
        "id": "pb_m_s4_2",
        "tmdbId": "76600",
        "title": "阿凡达：水之道",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/az6FndKaR11uuxnRQucKJ2mmglg.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/kJsPVzdyBrYHLomuNv5SJDXUQ2f.jpg",
        "description": "十多年过去，杰克·萨利已经永久生活在自己的阿凡达躯体中，并与奈蒂莉组建家庭，育有三个孩子，还收养了格蕾丝留下的女儿琪莉。原本平静的生活随着人类势力重返潘多拉而被打破，曾经死去的迈尔斯·夸里奇上校也以新的躯体归来，一心寻找杰克复仇。为了避免族人受到牵连，也为了保护家人，杰克带着奈蒂莉和孩子们离开森林中的家园，前往梅卡伊纳...",
        "year": "2022",
        "types": [
          "科幻",
          "奇幻"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "詹姆斯·卡梅隆"
        ],
        "actors": [
          "萨姆·沃辛顿",
          "佐伊·索尔达娜",
          "西格妮·韦弗",
          "史蒂芬·朗",
          "凯特·温斯莱特"
        ]
      },
      {
        "id": "pb_m_s4_3",
        "tmdbId": "299534",
        "title": "复仇者联盟4：终局之战",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/wXyZYO6BKDh8Evf80DF80VzKcz3.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
        "description": "灭霸集齐六颗无限宝石后的一声响指，让宇宙中半数生命灰飞烟灭。幸存的复仇者们几近绝望，即使找到灭霸，也发现无限宝石已经被毁，希望似乎彻底破灭。五年后，迷失在量子领域的蚁人意外回到现实世界，并带来了一个可能逆转一切的办法。托尼·斯塔克、美国队长等幸存的英雄再度集结，尝试穿越不同的时间节点寻找过去的无限宝石。然而在行动过程中...",
        "year": "2019",
        "types": [
          "动作",
          "超级英雄"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "安东尼·罗素",
          "乔·罗素"
        ],
        "actors": [
          "小罗伯特·唐尼",
          "克里斯·埃文斯",
          "马克·鲁法洛",
          "克里斯·海姆斯沃斯",
          "斯嘉丽·约翰逊"
        ]
      },
      {
        "id": "pb_m_s4_4",
        "tmdbId": "333339",
        "title": "头号玩家",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/546MvE18yfLXEBwWWsxE0f4xuMy.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/5a7lMDn3nAj2ByO0X1fg6BhUphR.jpg",
        "description": "2045年，处于混乱和崩溃边缘的现实世界令人失望，人们将救赎的希望寄托于“绿洲”，一个由鬼才詹姆斯·哈利迪（马克·里朗斯 饰）一手打造的虚拟游戏宇宙。在那里，想象力主宰一切，你可以去任何地方，做任何想做的事，成为任何想成为的人。哈利迪弥留之际，宣布将巨额财产和“绿洲”的所有权留给第一个闯过三道谜题，找出他在游戏中藏匿彩...",
        "year": "2018",
        "types": [
          "科幻",
          "游戏"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "史蒂文·斯皮尔伯格"
        ],
        "actors": [
          "泰伊·谢里丹",
          "奥利维亚·库克",
          "本·门德尔森",
          "丽娜·维特",
          "T·J·米勒"
        ]
      },
      {
        "id": "pb_m_s4_5",
        "tmdbId": "335984",
        "title": "银翼杀手2049",
        "rate": "7.6",
        "cover": "https://image.tmdb.org/t/p/w500/sxA89XGotN9c5u5O1GWpbYYX3Ks.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/gNdLJU9TxrpGx4dkZidjys3fyy0.jpg",
        "description": "在《银翼杀手》（1982）事件发生三十年后，新一代银翼杀手、洛杉矶警察“K”发现了一个尘封已久的秘密，这个秘密有可能使所剩无几的社会陷入混乱。K的这一发现引领他踏上寻找失踪三十年的前洛杉矶警察银翼杀手瑞克·戴克之路。[华纳兄弟影业]...",
        "year": "2017",
        "types": [
          "科幻",
          "赛博朋克"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "丹尼斯·维伦纽瓦"
        ],
        "actors": [
          "瑞恩·高斯林",
          "哈里森·福特",
          "安娜·德·阿玛斯",
          "戴夫·巴蒂斯塔",
          "罗宾·怀特"
        ]
      },
      {
        "id": "pb_m_s4_6",
        "tmdbId": "155",
        "title": "蝙蝠侠：黑暗骑士",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/qYB7QqwT1NtTW9aCwtopGy80rmA.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9FE5eD92WfVCiivM9Pq9GVSrlWk.jpg",
        "description": "在蝙蝠侠、警官詹姆斯·戈登和地方检察官哈维·丹特的共同努力下，哥谭市的犯罪势力受到前所未有的打击。然而，自称“小丑”的神秘罪犯突然出现，以毫无规则的暴力和精心策划的犯罪不断挑战城市秩序，也将蝙蝠侠、戈登和丹特一步步逼入道德与人性的困境。面对一个无法用常规逻辑理解的敌人，蝙蝠侠必须在守护哥谭与坚守自身原则之间作出艰难选择...",
        "year": "2008",
        "types": [
          "动作",
          "犯罪"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "克里斯托弗·诺兰"
        ],
        "actors": [
          "克里斯蒂安·贝尔",
          "希斯·莱杰",
          "艾伦·艾克哈特",
          "迈克尔·凯恩",
          "玛吉·吉伦哈尔"
        ]
      },
      {
        "id": "pb_m_s4_7",
        "title": "指环王：王者归来",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/kKUgYEOVebuu21N0KnQiGpIStiN.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ctiw6FZK4N36LmkjSklWEbuvlq9.jpg",
        "description": "索伦大军为剿灭人类种族，已对刚铎都城米那斯提力斯展开围攻。这座昔日的伟大王国由一位日渐衰弱的摄政王守护，此刻比任何时候都更需要它的王者归来。但阿拉贡能否回应血脉的召唤，成为命定之君？中土世界的命运，正系于他宽阔的双肩。...",
        "year": "2003",
        "types": [
          "魔幻",
          "史诗"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "彼得·杰克逊"
        ],
        "actors": [
          "伊利亚·伍德",
          "伊恩·麦克莱恩",
          "维果·莫特森",
          "西恩·奥斯汀",
          "安迪·瑟金斯"
        ]
      },
      {
        "id": "pb_m_s4_8",
        "tmdbId": "698687",
        "title": "变形金刚",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/pGbVQL0oEHLM6tC8OQqbWotXr3w.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cMfokHWle5lfCreoV08cbmkKv6G.jpg",
        "description": "影片将时间线拨回赛博坦时期，生活在赛博坦星球的擎天柱（克里斯·海姆斯沃斯 Chris Hemsworth 配音）与威震天（布莱恩·泰里·亨利 Brian Tyree Henry 配音）才20岁出头，是情同手足的朋友，此时他们还是没有变形能力的机器人，讲述他们如何从手足变为死敌的起源故事。...",
        "year": "2024",
        "types": [
          "动作",
          "机甲"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "乔什·库利"
        ],
        "actors": [
          "克里斯·海姆斯沃斯",
          "布莱恩·泰里·亨利",
          "斯嘉丽·约翰逊",
          "科甘-迈克尔·凯",
          "乔恩·哈姆"
        ]
      },
      {
        "id": "pb_m_s4_9",
        "tmdbId": "68726",
        "title": "环太平洋",
        "rate": "6.9",
        "cover": "https://image.tmdb.org/t/p/w500/zZdNPXlOi6uMH0h1ZVPuJ2S19Zb.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/9X7Im1YuBhyHYVD8r7CAONPJR5k.jpg",
        "description": "近未来，地球环境逐步恶化。神秘外星殖民者通过大洋底部的虫洞“缺口”将身形庞大、残冷迅猛、身藏剧毒的怪兽接连派往地球，有条不紊地实施着它们的殖民毁灭计划。为此，人类联手打造“贼鸥计划”，制造出与怪兽体型相当的机甲战士迎战，但随着怪兽渐次进化，机甲战士全面溃败，各国政要试图修筑偏于防守的“生命之墙”以阻挡侵略者的脚步，无奈...",
        "year": "2013",
        "types": [
          "动作",
          "机甲"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "吉尔莫·德尔·托罗"
        ],
        "actors": [
          "查理·汉纳姆",
          "菊地凛子",
          "伊德瑞斯·艾尔巴",
          "马克斯·马蒂尼",
          "小克利夫顿·克林斯"
        ]
      },
      {
        "id": "pb_m_s4_10",
        "tmdbId": "135397",
        "title": "侏罗纪世界",
        "rate": "6.3",
        "cover": "https://image.tmdb.org/t/p/w500/gKG56CEsncQSr7kmMLmclosXPPa.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zNriRTr0kWwyaXPzdg1EIxf0BWk.jpg",
        "description": "在《侏罗纪世界3》事件发生五年后，秘密行动专家佐拉·贝内特（Zora Bennett）受雇带领一支精锐小队，执行一项绝密任务——从全球体型最庞大的三种恐龙身上获取基因样本。然而，当佐拉的行动意外与一户平民家庭交汇时，局势急转直下：这家人原本正在进行一次海上航行，却遭遇船只倾覆，流落荒岛。如今，他们与佐拉的小队一同被困在...",
        "year": "2025",
        "types": [
          "科幻",
          "冒险"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "加里斯·爱德华斯"
        ],
        "actors": [
          "斯嘉丽·约翰逊",
          "马赫沙拉·阿里",
          "乔纳森·贝利",
          "鲁珀特·弗兰德",
          "马奴·贾西亚·鲁尔福"
        ]
      }
    ]
  },
  "tv": {
    "trendingNav": [
        {
                "title": "兰香如故",
                "updateBadge": "2"
        },
        {
                "title": "早春晴朗",
                "updateBadge": ""
        },
        {
                "title": "交锋",
                "updateBadge": "2"
        },
        {
                "title": "一瓯春",
                "updateBadge": ""
        },
        {
                "title": "冬城猎凶",
                "updateBadge": ""
        },
        {
                "title": "生逢其时",
                "updateBadge": ""
        },
        {
                "title": "死有对证",
                "updateBadge": "1"
        },
        {
                "title": "飞到我心上",
                "updateBadge": ""
        },
        {
                "title": "深渊无间",
                "updateBadge": ""
        },
        {
                "title": "花开锦绣",
                "updateBadge": ""
        },
        {
                "title": "中头奖还是要上班",
                "updateBadge": "2"
        },
        {
                "title": "百花杀",
                "updateBadge": ""
        }
      ],
    "hero": [
        {
                "id": "iyf_hero_tv_1",
                "title": "一瓯春",
                "rate": "9.0",
                "cover": "https://image.tmdb.org/t/p/w500/7KjVhRaarZ5L3CBirQEmt89ioiz.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/qLZQnTiQxkBOid9tVLWC1CmoOcu.jpg",
                "description": "“杀伐千面腹黑男”沈润与“人间清醒黑莲花”谢清圆互为刀刃交错，在理智与情感中携手复仇，于高门大户里明争暗斗，立朝堂官场上搅弄风云。最终他们走出暗流深渊，奔赴璀璨新生。",
                "year": "2026",
                "types": [
                        "热门",
                        "连续剧"
                ],
                "episodes_info": "更新至06集 | 共30集",
                "type": "tv",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_tv_2",
                "title": "兰香如故",
                "rate": "6.7",
                "cover": "https://image.tmdb.org/t/p/w500/kfurXRMH1ZkUoyT5HN72zLTQxzZ.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/mZSewqVlY4F2F2Axm7hiG6KBOBp.jpg",
                "description": "大学士府长孙女沈嘉兰与吏部尚书林家的长孙林锦岐订下婚约，然而朝堂风云突变，祖父沈大学士被判谋逆之罪，沈家惨遭灭门。林家为了自保，与沈家退婚，另与御前新贵赵家结亲。沈嘉兰母亲崔氏曾接济过的林家家奴许万全夫妇用刚病亡的女儿许兰香替下嘉兰。嘉兰从此顶着许兰香的身份，成为林府的一名三等丫鬟。在艰难的境遇中，兰香没有向命运低头，始终为自己和家人的幸福生活努力着，反抗一切不公与压迫。最终，兰香凭借自己的善良与聪慧，突破阶级身份的束缚，赢得林锦岐倾心的同时也获得了林家上下的信服与尊重，成为林家的当家人，将命运牢牢掌控在自己的手中，为沈家洗刷冤屈讨回公道。",
                "year": "2026",
                "types": [
                        "热门",
                        "连续剧"
                ],
                "episodes_info": "更新至16集 | 共47集",
                "type": "tv",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_tv_3",
                "title": "冬城猎凶",
                "rate": "8.0",
                "cover": "https://image.tmdb.org/t/p/w500/64NVbdSuNgrK90wqhtnlR2S4sPK.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/28u4q3fPzXmbyf3BoiWweUOuuzj.jpg",
                "description": "银行大劫案，搅动大城风云；儿童拐卖案，重起罪恶迷雾。双时空、案中案，极致追凶。",
                "year": "2026",
                "types": [
                        "热门",
                        "连续剧"
                ],
                "episodes_info": "更新至13集 | 共18集",
                "type": "tv",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_tv_4",
                "title": "深渊无间",
                "rate": "9.0",
                "cover": "https://image.tmdb.org/t/p/w500/b9ngtGNgaHBbLihRrT0MsPRY0GW.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/s9YSQAJtXjimsjBVsqLtJNnIjEs.jpg",
                "description": "　　一篇名为《深渊》的推理网文悄然上线，打破了保守小城多年来的平静。文中诸多情节与警方未曾公布的多年前“三一二”连环奸杀案案情有着惊人的相似，作案手法、现场痕迹、凶手心理侧写，竟与尘封的卷宗几乎一字不差。\n\n　　热血正义的新警李成（任嘉伦 饰）以“网瘾少年”身份潜入网吧卧底，逐步接近案件关键嫌疑人——网吧老板韩品木（秦俊杰 饰）。韩品木表面温和，实则身份成谜，他既是当年受害者的家属，又是小说《深渊》的幕后上传者。在调查过程中，李成与暗中追查旧案的前刑警辛吉然（田小洁 饰）、刑侦队长赵干哲（王砚辉 饰）结成同盟，共同重启这桩尘封八年的悬案。\n\n　　随着一众人等接连登场——行动诡秘的老警察、暗中窥探的酒店保安、口风严密的职场经理、游走灰色地带的边缘人，以及案件幸存者陈春丽（倪虹洁 饰），全员皆藏秘密，人人皆有疑点。李成与多方嫌疑人一次次上演高智对弈，最终拨开迷雾，侦查出掩藏在令人扼腕的亲情和友情之下的真相。\n\n　　一念之差，有的人走向了绿洲，有的人永远被困在了深渊。",
                "year": "2026",
                "types": [
                        "热门",
                        "连续剧"
                ],
                "episodes_info": "更新至13集 | 共16集",
                "type": "tv",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_tv_5",
                "title": "交锋",
                "rate": "9.0",
                "cover": "https://image.tmdb.org/t/p/w500/gRe5FZjMWw8xXzWk1hxWuNQckOg.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/lYDwHYOR8PROQfSJGZ8LqvwUVcW.jpg",
                "description": "一宗世纪之交的泄密大案扣动两岸局势脉搏，同时还掩藏着一场境外势力与我方在隐蔽战线上的针锋较量。二十世纪九十年代末，闽州市国家安全局一对性格迥异的师徒，因机缘巧合的命运安排，为了共同的使命与信仰并肩作战。他们联手挫败了各种阴谋，也与敌手在横跨二十年的命运长河里不断纠缠。当时间流转，新世纪的潮流剧变席卷而来，国家安全局势攻防易势，隐蔽战线上的较量却不止不休。在一次次关乎人性的考验中，这三人的命运关系因不同抉择，在岁月洗礼中悄然改变着。",
                "year": "2026",
                "types": [
                        "热门",
                        "连续剧"
                ],
                "episodes_info": "更新至26集 | 共40集",
                "type": "tv",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_tv_6",
                "title": "生逢其时",
                "rate": "9.0",
                "cover": "https://image.tmdb.org/t/p/w500/q2ulZwiuO9Gg0bVziimr8CXHdpk.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/7HXIhc3aRr1v7KmOrCulszXf3YP.jpg",
                "description": "　　八十年代初，北方厂矿小镇青梧镇，住着齐家和曹家两户比邻而居的人家——齐爱华（郭涛 饰）与霍青莲（刘琳 饰）性格迥异但彼此包容；曹东方（郭晓东 饰）在妻子去世后与爸爸曹本顺（霍青 饰）两个男人一起撑起家，日子艰难但乐在其中。两家在同一天诞下孩子，却因医院疏忽，将两个婴儿抱错——齐家健康的男婴成了曹家的曹信，曹家患有白化病的女婴成了齐家的齐时。长辈们约定互不声张，两个孩子便在各自家庭中错位成长。\n\n　　身患白化病的齐时（关晓彤 饰）自小便意识到自己的“与众不同”。一头白发让她在小镇受尽旁人异样的目光，她喝酱油、戴假发，试图成为和普通人一样的存在。另一边的曹信（王子奇 饰），一路走来都是家长口中“别人家的孩子”，然而光环之下却始终伴随着父亲的严苛要求，他始终向往遵从本心的活法。\n\n　　当特立独行、勇敢倔强的齐时，遇上乖巧听话、优秀自律的曹信，两个家庭在邻里间日积月累的相处中，因荒唐的“换子”碰撞出了眼泪的故事和“新生”的契机。孩子们经历着关于亲情、友情、爱情的考验，大人们也在面对关于事业、婚姻、家庭的难题。在时代洪流中，纵使生活跌跌撞撞，他们亦携手缝缝补补修炼人生，共同找寻属于自己的人生和幸福。",
                "year": "2026",
                "types": [
                        "热门",
                        "连续剧"
                ],
                "episodes_info": "更新至21集 | 共26集",
                "type": "tv",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_tv_7",
                "title": "重案六组:消失的警号",
                "rate": "8.0",
                "cover": "https://image.tmdb.org/t/p/w500/xiq23i6XsryjJvxYvqQsyE9Nzen.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/nr1uqvJs4kqtGcBTwIAew5OiSXI.jpg",
                "description": "剧情核心围绕“消失的警号”展开，通过“老警号传承”设计致敬原版角色，并融入科技办案、新老刑侦理念碰撞等创新元素。",
                "year": "2026",
                "types": [
                        "热门",
                        "连续剧"
                ],
                "episodes_info": "更新至20集 | 共26集",
                "type": "tv",
                "is_new": true,
                "playable": true
        },
        {
                "id": "iyf_hero_tv_8",
                "title": "早春晴朗",
                "rate": "8.3",
                "cover": "https://image.tmdb.org/t/p/w500/nLWFbYv1r99Yy7dWvjoxMRegoe0.jpg",
                "backdrop": "https://image.tmdb.org/t/p/w1280/oUFUvEMCBP80e4eYsfVfxC8n7ih.jpg",
                "description": "这是一段十年交锋，敬于才华，合于性格、久于平等的禁忌之恋。北漂伊始的尚之桃与极具天赋的“鬼才”栾念狭路相逢。热烈勇敢的尚之桃亦步亦趋地蜕变成长，撬碎了栾念世故坚硬的心防，互相吸引的二人在都市丛林中极限拉扯、分分合合。爱情，就是用光所有勇气，再无遗憾。爱，则是互相修复，共同成长。但情和爱之间，她选择生存。当她独当一面，他收敛锋芒，势均力敌的他们将会为彼此写下了新的结局……",
                "year": "2026",
                "types": [
                        "热门",
                        "连续剧"
                ],
                "episodes_info": "24集全",
                "type": "tv",
                "is_new": true,
                "playable": true
        }
      ],
    "top10": [
      {
        "id": "pb_t_top10_1",
        "tmdbId": "309663",
        "title": "开庭",
        "rate": "8.6",
        "cover": "https://img9.doubanio.com/view/photo/m_ratio_poster/public/p2932548406.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/fGOfVu7YjBEBxPZH7fwkufZ47Lu.jpg",
        "description": "豆瓣一周华语口碑剧集榜 TOP 1。硬核律政交锋，现实主义笔触直击社会复杂痛点，引爆全网热议。",
        "year": "2026",
        "types": [
          "律政",
          "剧情"
        ],
        "is_new": true,
        "playable": true
      },
      {
        "id": "pb_t_top10_2",
        "tmdbId": "291856",
        "title": "重器",
        "rate": "7.3",
        "cover": "https://img1.doubanio.com/view/photo/m_ratio_poster/public/p2934828709.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/sUTK5UjUNud0d5hcEbhOk4RTqII.jpg",
        "description": "豆瓣一周华语口碑剧集榜 TOP 2。大国重工与时代脉动，老一辈工匠的坚定信念与薪火相传。",
        "year": "2026",
        "types": [
          "悬疑",
          "年代"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "沈严"
        ],
        "actors": [
          "黄景瑜",
          "蒋奇明",
          "张佳宁",
          "姜珮瑶",
          "闫佩伦"
        ]
      },
      {
        "id": "pb_t_top10_3",
        "tmdbId": "273114",
        "title": "悬案",
        "rate": "7.6",
        "cover": "https://img3.doubanio.com/view/photo/m_ratio_poster/public/p2933759962.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/hMAew4hKxZJeqqvYljhLpvS4OZA.jpg",
        "description": "豆瓣一周华语口碑剧集榜 TOP 3。跨越数十载的尘封大案，抽丝剥茧探寻真相与正义之光。",
        "year": "2026",
        "types": [
          "刑侦",
          "犯罪"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "算"
        ],
        "actors": [
          "岳云鹏",
          "杨烁",
          "江奇霖",
          "郎月婷",
          "黄觉"
        ]
      },
      {
        "id": "pb_t_top10_4",
        "tmdbId": "306672",
        "title": "日落下的彩虹",
        "rate": "8.5",
        "cover": "https://img9.doubanio.com/view/photo/m_ratio_poster/public/p2934077326.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/oLG0Smu4GB4OBVmydd2qxejDF82.jpg",
        "description": "豆瓣一周华语口碑剧集榜 TOP 4。平凡生活中的诗意与温情，以细腻真挚的人间情感打动千万观众。",
        "year": "2026",
        "types": [
          "剧情",
          "治愈"
        ],
        "is_new": true,
        "playable": true,
        "actors": [
          "邱士缙",
          "周家怡",
          "許軼",
          "唐诗咏",
          "潘灿良"
        ]
      },
      {
        "id": "pb_t_top10_5",
        "tmdbId": "287496",
        "title": "花开锦绣",
        "rate": "7.1",
        "cover": "https://img3.doubanio.com/view/photo/m_ratio_poster/public/p2934718593.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zyAFGC97834c2Ld4xPY02uacdQk.jpg",
        "description": "豆瓣一周华语口碑剧集榜 TOP 5。匠心雕琢的东方美学画卷，女子在逆境中昂首突围的励志传奇。",
        "year": "2026",
        "types": [
          "古装",
          "爱情"
        ],
        "is_new": true,
        "playable": true,
        "actors": [
          "丁禹兮",
          "邓恩熙",
          "范诗然",
          "董子凡"
        ]
      },
      {
        "id": "pb_t_top10_6",
        "tmdbId": "280133",
        "title": "藏锋",
        "rate": "6.7",
        "cover": "https://img1.doubanio.com/view/photo/m_ratio_poster/public/p2935209228.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/iHShzy0Fa1WDbjFMJqxZV5nLwOQ.jpg",
        "description": "豆瓣一周华语口碑剧集榜 TOP 6。暗夜潜伏的无声较量，生死抉择间的坚守与信仰。",
        "year": "2026",
        "types": [
          "谍战",
          "悬疑"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "邢键钧"
        ],
        "actors": [
          "段奕宏",
          "余男",
          "阿如那",
          "李纯",
          "万鹏"
        ]
      },
      {
        "id": "pb_t_top10_7",
        "tmdbId": "233076",
        "title": "问心2",
        "rate": "7.5",
        "cover": "https://img9.doubanio.com/view/photo/m_ratio_poster/public/p2933401946.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xBI8m2aYsr9o4vtgbnI7wsewGc6.jpg",
        "description": "豆瓣一周华语口碑剧集榜 TOP 7。医疗职场经典口碑续作，白衣执甲以心护命。",
        "year": "2026",
        "types": [
          "医疗",
          "生活"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "黎志"
        ],
        "actors": [
          "赵又廷",
          "毛晓彤",
          "金世佳",
          "黄觉",
          "王川"
        ]
      },
      {
        "id": "pb_t_top10_8",
        "tmdbId": "295558",
        "title": "雀骨",
        "rate": "6.9",
        "cover": "https://img9.doubanio.com/view/photo/m_ratio_poster/public/p2931739796.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/eZTq2kkhZ9AQtQ1H5SD7h1Q0PIc.jpg",
        "description": "豆瓣一周华语口碑剧集榜 TOP 8。权谋与江湖的风云交汇，宿命纠葛中的快意恩仇。",
        "year": "2026",
        "types": [
          "古装",
          "传奇"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "高翊浚"
        ],
        "actors": [
          "侯明昊",
          "艾米",
          "王以纶",
          "马秋元",
          "米热"
        ]
      },
      {
        "id": "pb_t_top10_9",
        "tmdbId": "271016",
        "title": "九门",
        "rate": "6.7",
        "cover": "https://img9.doubanio.com/view/photo/m_ratio_poster/public/p2934488566.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/paF9IoqXN3inVb5eR9rxElbpYyb.jpg",
        "description": "豆瓣一周华语口碑剧集榜 TOP 9。民国神秘探险传奇，地底奇观与家族谜团步步惊心。",
        "year": "2026",
        "types": [
          "探险",
          "悬疑"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "柏杉"
        ],
        "actors": [
          "陈伟霆",
          "曾舜晞",
          "陈瑶",
          "应昊茗",
          "王奕婷"
        ]
      },
      {
        "id": "pb_t_top10_10",
        "tmdbId": "327916",
        "title": "凛冬下的罪恶",
        "rate": "6.9",
        "cover": "https://img1.doubanio.com/view/photo/m_ratio_poster/public/p2934675359.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/gN3vSMrarrirco31Af8bUsSHBYZ.jpg",
        "description": "豆瓣一周华语口碑剧集榜 TOP 10。极寒林海雪原中的冷峻追凶，直面罪恶与人性救赎。",
        "year": "2026",
        "types": [
          "刑侦",
          "罪案"
        ],
        "is_new": true,
        "playable": true,
        "actors": [
          "王大奇",
          "孙之鸿",
          "吴昊宸",
          "肖涵",
          "张睿"
        ]
      }
    ],
    "s1": [
      {
        "id": "pb_t_s1_1",
        "tmdbId": "230835",
        "title": "莲花楼",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/h8DteNYVPnGn6ZgCjIlQXW5KFUb.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/v0It4jPMkYT3H57x6ot4Fd56C8E.jpg",
        "description": "十年前四顾门门主李相夷以相夷太剑冠绝天下，为正道武林之光，却因与金鸳盟盟主笛飞声约战东海，两大高手就此消失在万顷碧波之上。四顾门与金鸳盟也两败俱伤渐渐消失于江湖。十年后乡间游医李莲花拖着一座莲花楼行走世间，误打误撞得了个名医的头衔，本不想涉足江湖的他就这样卷入江湖。梦想行侠仗义安天下的热血少爷方多病则察觉李莲花不简单，...",
        "year": "2023",
        "types": [
          "武侠",
          "悬疑"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "郭虎",
          "任海涛"
        ],
        "actors": [
          "成毅",
          "曾舜晞",
          "肖顺尧",
          "陈都灵",
          "王鹤润"
        ]
      },
      {
        "id": "pb_t_s1_2",
        "tmdbId": "210524",
        "title": "长相思",
        "rate": "7.1",
        "cover": "https://image.tmdb.org/t/p/w500/sIWIB7Q6vsU3b4ULoa6a1kq7SXg.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8g14KLvaJ23lj9OlPHtJRwuEzyM.jpg",
        "description": "大荒内，人、神、妖混居，西炎、辰荣、皓翎三国鼎立。流落大荒的皓翎国王姬玖瑶（小夭）历经百年颠沛之苦，不但失去了身份，也失去了容貌，在清水镇落脚，成为了“无处可去、无人可依、无力自保”的玟小六。他悬壶为生恣意不羁。曾与小夭青梅竹马的西炎国王孙玱玹去了皓翎国做质子，即使寄人篱下、隐忍蛰伏，为了寻找小夭走遍大荒，来到清水镇。...",
        "year": "2023",
        "types": [
          "古装",
          "神话"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "秦榛",
          "杨欢"
        ],
        "actors": [
          "杨紫",
          "张晚意",
          "邓为",
          "檀健次",
          "代露娃"
        ]
      },
      {
        "id": "pb_t_s1_3",
        "tmdbId": "207668",
        "title": "与凤行",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/zW1YdedNH24xVCMrWHOZHxpJC39.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4J8znHxVaZY3vKb05IWqWfzczXR.jpg",
        "description": "身为魔界衔珠而生的碧苍王，沈璃的一生是璀璨而夺目的，但在她千岁诞辰之际，政治联姻的魔爪劈头盖脸的挠过来。九十九重天上的帝君，一纸天书颁下，着碧苍王与帝君第三十三孙拂容君定亲。拂容君早年便因花心而闻名天外，她堂堂魔界一霸，一杆银枪平四海战八荒，岂能嫁给那种花心草包!这婚必须逃!沈璃不想，这一跑还真碰上了那个不属于三界五行...",
        "year": "2024",
        "types": [
          "仙侠",
          "爱情"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "邓科"
        ],
        "actors": [
          "赵丽颖",
          "林更新",
          "辛云来",
          "何与",
          "李嘉琦"
        ]
      },
      {
        "id": "pb_t_s1_4",
        "tmdbId": "229202",
        "title": "玫瑰的故事",
        "rate": "7.4",
        "cover": "https://image.tmdb.org/t/p/w500/stxOoW8qTj3JdSX8ENlN6daaCSo.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/80ukSQi9aHAfm8CoDxdPwGGLeOt.jpg",
        "description": "出生于书香世家的黄亦玫（刘亦菲 饰）一路在呵护中长大，从小便展露出艺术天赋。初入职场的黄亦玫很快受到重用，与合作伙伴庄国栋相识相爱，但最终错过彼此，这段职场磨炼也令她对自己的人生有了更清晰的规划，决定重返校园求学深造。毕业后，她和学长方协文步入婚姻殿堂。可婚后两人发展方向相去甚远，最终选择离婚。黄亦玫开始创业，在艺术品...",
        "year": "2024",
        "types": [
          "现代",
          "情感"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "汪俊"
        ],
        "actors": [
          "刘亦菲",
          "佟大为",
          "林更新",
          "万茜",
          "林一"
        ]
      },
      {
        "id": "pb_t_s1_5",
        "tmdbId": "216943",
        "title": "少年歌行",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/hauiCvGKenZEeVasznun04jETVA.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/iZrLK8iOHvYB9EKHx3AqT51fteR.jpg",
        "description": "初出茅庐的少年侠客雷无桀，慕名前往江湖第一大城——雪月城的途中误入雪落山庄。第一次行侠仗义就因砸了老板萧瑟的客栈被追究赔偿，无奈只好带萧瑟一同上路前往雪月城借钱还债。路上碰巧遇到押运黄金棺材的雪月城大弟子唐莲，阴差阳错的卷入一场轰动整个江湖的事件当中。...",
        "year": "2022",
        "types": [
          "武侠",
          "热血"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "尹涛"
        ],
        "actors": [
          "李宏毅",
          "刘学义",
          "林博洋",
          "敖瑞鹏",
          "李欣泽"
        ]
      },
      {
        "id": "pb_t_s1_6",
        "tmdbId": "210191",
        "title": "一念关山",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/6zOT4e0VWsG4xQkqydsCY5FKu8b.jpg",
        "description": "安国朱衣卫前左使任如意因机缘巧合成为梧国迎帝使小分队成员，和梧国六道堂堂主宁远舟、风流浪子于十三、公主杨盈、聪敏少年元禄、御前侍卫钱昭等人经历生死，共同成长的故事。",
        "year": "2023",
        "types": [
          "古装",
          "武侠"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "Zhou Yuanzhou",
          "邹曦"
        ],
        "actors": [
          "刘诗诗",
          "刘宇宁",
          "方逸伦",
          "何蓝逗",
          "陈昊宇"
        ]
      },
      {
        "id": "pb_t_s1_7",
        "tmdbId": "138289",
        "title": "风吹半夏",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/4PzNozYxVKlFI4KrXm3gQTCNt0Z.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8nxdy7sqAk7zjUPBXrhLcSux4po.jpg",
        "description": "许半夏的母亲生许半夏的时候难产而死，父亲自许半夏出生起便不闻不问，反而养成了许半夏天生傲骨、敢闯敢拼的性格。随着中国经济的腾飞，许半夏带着兄弟小陈、童骁骑做起了废钢、运输生意，在男性占据绝对主导地位的钢铁行业中，许半夏硬是凭借敢想敢闯的冒险精神和务实的处事态度，勇闯俄罗斯，历经千辛万苦甚至生死考验，开辟了独立的国际钢铁...",
        "year": "2022",
        "types": [
          "商战",
          "励志"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "傅东育",
          "毛溦"
        ],
        "actors": [
          "赵丽颖",
          "欧豪",
          "李光洁",
          "黄澄澄",
          "刘威"
        ]
      },
      {
        "id": "pb_t_s1_7",
        "tmdbId": "203042",
        "title": "警察荣誉",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/2FFZ6BKObmieClCogTrPSezyjLd.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/43pkxetDXl5WJa5Od1Omz96w8VZ.jpg",
        "description": "故事围绕李大为（张若昀 饰）、夏洁（白鹿 饰）、杨树（徐开骋 饰）、赵继伟（曹璐 饰）四个初出茅庐的见习警员展开，讲述了他们在“警情高发”的平陵市八里河派出所历经各类案件洗礼，并在老警察的言传身教下迅速成长，最终成为合格的人民警察的故事。...",
        "year": "2022",
        "types": [
          "生活",
          "职场"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "丁黑",
          "鲍成志",
          "符策欣"
        ],
        "actors": [
          "张若昀",
          "白鹿",
          "王景春",
          "宁理",
          "徐开骋"
        ]
      },
      {
        "id": "pb_t_s1_8",
        "tmdbId": "155441",
        "title": "开端",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/3vbovxhpmrHbz3Ot9AhzLziaxTO.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/jG3tJ64c207xRuhvxskd9izGCsV.jpg",
        "description": "公交车上的乘客们，身份和经历各异，有各自的困境，也有各自对未来生活的期冀，通过他们的经历，可以看到生命的厚重、生存的姿态，感受到生活的意义。肖鹤云（白敬亭饰）和李诗情（赵今麦饰），两个缺少主角光环的普通人经历时间循环、寻找真相的过程中，一次次经历生死挑战，实现自我成长。爆炸的真相隐藏在层层迷雾中，但正义终会来临，正如俩...",
        "year": "2022",
        "types": [
          "悬疑",
          "无限流"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "孙墨龙",
          "算",
          "刘洪源"
        ],
        "actors": [
          "赵今麦",
          "白敬亭",
          "刘奕君",
          "刘涛",
          "黄觉"
        ]
      },
      {
        "id": "pb_t_s1_9",
        "tmdbId": "202876",
        "title": "梦华录",
        "rate": "6.5",
        "cover": "https://image.tmdb.org/t/p/w500/4mCQBKQ3w9adnengQSm2GCZpGr6.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/i6yUBPRyQhSAj63dThXW0Bz5ppd.jpg",
        "description": "在钱塘开茶铺的赵盼儿惊闻未婚夫、新科探花欧阳旭要另娶当朝高官之女，不甘命运的她誓要上京讨个公道。在途中她遇到了出自权门但生性正直的皇城司指挥顾千帆，并卷入江南一场大案，两人不打不相识从而结缘。赵盼儿凭借智慧解救了被骗婚而惨遭虐待的“江南第一琵琶高手”宋引章与被苛刻家人逼得离家出走的豪爽厨娘孙三娘，三位姐妹从此结伴同行，...",
        "year": "2022",
        "types": [
          "古装",
          "女性"
        ],
        "is_new": true,
        "playable": true,
        "directors": [
          "杨阳"
        ],
        "actors": [
          "刘亦菲",
          "陈晓",
          "柳岩",
          "林允",
          "徐海乔"
        ]
      }
    ],
    "s2": [
      {
        "id": "pb_t_s2_1",
        "tmdbId": "1396",
        "title": "绝命毒师",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/rqliuvX7NdknSHu5qaSDfESplQi.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
        "description": "新墨西哥州的高中化学老师沃尔特·H·怀特是拮据家庭的唯一经济来源。他大半生安分守己，兢兢业业，却在50岁生日之际突然得知自己罹患肺癌晚期的噩耗，原本便不甚顺意的人生顿时雪上加霜。为了保障怀孕的妻子斯凯勒和残疾的儿子小沃特能在自己死后衣食无忧，沃尔特决意铤而走险。他主动找到曾经的学生、而今的毒贩小混混杰西·平克曼谈合作，...",
        "year": "2008",
        "types": [
          "犯罪",
          "剧情"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "布莱恩·克兰斯顿",
          "亚伦·保尔",
          "安娜·冈",
          "RJ·米特",
          "迪恩·诺里斯"
        ]
      },
      {
        "id": "pb_t_s2_2",
        "tmdbId": "60059",
        "title": "风骚律师",
        "rate": "8.7",
        "cover": "https://image.tmdb.org/t/p/w500/ceybevjR1WAC4wqiHEEAhrW1U9L.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rfxryDIv8huejujg4JueDJx8zCz.jpg",
        "description": "名不见经传的律师吉米·麦吉尔是如何转变成备受道德谴责的大律师索尔·古德曼的？...",
        "year": "2015",
        "types": [
          "律政",
          "剧情"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "鲍勃·奥登科克",
          "乔纳森·班克斯",
          "蕾亚·塞洪",
          "托尼·达尔顿",
          "吉安卡罗·埃斯波西托"
        ]
      },
      {
        "id": "pb_t_s2_3",
        "tmdbId": "66732",
        "title": "怪奇物语",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/iTvTODru3s8A4eGqVZzALcipIft.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
        "description": "1983年印第安纳州的霍金斯小镇，男孩威尔·拜尔斯在回家途中离奇失踪。其朋友麦克、达斯汀和卢卡斯在寻找过程中，遇到拥有超能力的女孩十一。在调查过程中，众人逐步揭露涉及秘密实验与超自然力量的阴谋。...",
        "year": "2016",
        "types": [
          "科幻",
          "复古"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "薇诺娜·瑞德",
          "大卫·哈伯",
          "米莉·波比·布朗",
          "菲恩·伍法德",
          "伽塔·马塔拉佐"
        ]
      },
      {
        "id": "pb_t_s2_4",
        "tmdbId": "60573",
        "title": "硅谷",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/qpN9Sl35iNcOUTJdQYPObvdRQXt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4pfXAnWxOfEJsUgDPW0zqzs5UWv.jpg",
        "description": "故事发生在高科技产业云集的美国硅谷，在这里，最有资质成功的人往往却是最没有办法处理其“功成名就”的人，本剧主人公理查德（托马斯·米德勒蒂奇 Thomas Middleditch 饰）正是这样的人。故事围绕着包括理查德在内的四个不善社交但绝顶聪明的计算机程序员，以及早期依靠互联网站发家的百万富翁埃利希（托德·约瑟夫·米勒...",
        "year": "2014",
        "types": [
          "喜剧",
          "创业"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "托马斯·米德尔迪奇",
          "扎克·伍兹",
          "库马尔·纳贾尼",
          "馬丁·斯塔爾",
          "阿曼达·克鲁"
        ]
      },
      {
        "id": "pb_t_s2_5",
        "tmdbId": "1425",
        "title": "纸牌屋",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/hdgLe0YDvk1tPOliWM5fOoNE6qG.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/zoAxfThy7ntyCutBeNgdaKhRoSX.jpg",
        "description": "弗兰西斯·安德伍德是一位极具政治野心的南卡罗来纳州民主党众议员、众议院多数党党鞭。他帮助加勒特·沃克赢得大选成为第45任美国总统，而沃克作为回报则许诺将任命他为国务卿。然而，在沃克宣誓就职之前，白宫幕僚长琳达·瓦斯奎兹却告知安德伍德，称总统希望将他留在国会推动法案通过，因而将不会提名他作国务卿。安德伍德对总统的背叛之举...",
        "year": "2013",
        "types": [
          "政治",
          "剧情"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "罗宾·怀特",
          "迈克尔·凯利",
          "康斯坦斯·齐默",
          "帕特里夏·克拉克森",
          "德里克·塞西尔"
        ]
      },
      {
        "id": "pb_t_s2_6",
        "tmdbId": "63247",
        "title": "西部世界",
        "rate": "8.0",
        "cover": "https://image.tmdb.org/t/p/w500/kgCNunp2VbUv6o5As5viHvkAsWv.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rX5hvSRB2k4YoIvRg6Zky52rWk0.jpg",
        "description": "在遥远的未来，一座集“西部”“罗马”“中世纪”三大元素主题版块于一身的巨型高科技成人乐园建成，园中无数逼真的机器人角色，夜以继日地为游客提供杀戮与性欲的满足。在一次次的更新升级中，这座巨大机械乐园的后台系统渐渐失去了对机器人的控制，游客接连被机器人杀死，所有想逃离者都被锁定……本剧改编自 1973 年的同名科幻电影，故...",
        "year": "2016",
        "types": [
          "科幻",
          "AI"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "埃文·蕾切尔·伍德",
          "坦迪·牛顿",
          "杰弗里·怀特",
          "泰莎·汤普森",
          "亚伦·保尔"
        ]
      },
      {
        "id": "pb_t_s2_7",
        "tmdbId": "46648",
        "title": "真探",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/203aK2bjFALUoATyPOF5izNQjpU.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/v8YFr8BbU9qsO8PYIulzTeM6Qk.jpg",
        "description": "这是一部美国犯罪侦探系列剧，采用多时间线的方式，调查揭示出参与其中的人员的个人和职业秘密，无论是在法律内部还是外部。...",
        "year": "2014",
        "types": [
          "悬疑",
          "犯罪"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "朱迪·福斯特",
          "卡莉·瑞斯",
          "费奥纳·肖",
          "芬恩·本尼特",
          "伊莎贝拉·拉布兰克"
        ]
      },
      {
        "id": "pb_t_s2_8",
        "tmdbId": "87108",
        "title": "切尔诺贝利",
        "rate": "8.7",
        "cover": "https://image.tmdb.org/t/p/w500/2kjMfJSwwQqOq4o4idiZxbNxoYz.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3URK0z9PzpVNJrGE7XOuyy6KFzk.jpg",
        "description": "剧中将会描述当时究竟发生了甚么引致这事故，而且当年勇敢的众人是如何牺牲自己拯救处于灾难中的欧洲...",
        "year": "2019",
        "types": [
          "历史",
          "灾难"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "杰瑞德·哈里斯",
          "斯特兰·斯卡斯加德",
          "艾米丽·沃森",
          "保罗·里特",
          "杰茜·巴克利"
        ]
      },
      {
        "id": "pb_t_s2_9",
        "title": "旺达幻视",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/nr5xh3wPEGSlxO0HiFZdqpDTw02.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lOr9NKxh4vMweufMOUDJjJhCRHW.jpg",
        "description": "自从幻视死后，旺达用魔法控制了小镇“西景镇”，并创造了全新的幻视。在这个世界中，她跟幻视过着理想的郊区生活，但随着天剑局的介入，旺达的宁静再度被打破……...",
        "year": "2021",
        "types": [
          "漫威",
          "奇幻"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "伊丽莎白·奥尔森",
          "保罗·贝坦尼",
          "凯瑟琳·哈恩",
          "泰柔娜·派丽丝",
          "兰道尔·朴"
        ]
      },
      {
        "id": "pb_t_s2_10",
        "tmdbId": "76331",
        "title": "继承之战",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/tgImKD6CdMWAyCT8AVEx0eelfBD.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/bcdUYUFk8GdpZJPiSAas9UeocLH.jpg",
        "description": "Logan Roy及他的四个孩子控制着全球最大的娱乐媒体集团之一，年迈的父亲开始退出公司，而他的孩子则思索如何抓紧机会继承这帝国。...",
        "year": "2018",
        "types": [
          "家族",
          "商战"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "杰里米·斯特朗",
          "基兰·卡尔金",
          "莎拉·斯努克",
          "布莱恩·考克斯",
          "马修·麦克费登"
        ]
      }
    ],
    "s3": [
      {
        "id": "pb_t_s3_1",
        "tmdbId": "96102",
        "title": "机智的医生生活",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/zYBo8ASGhGtkF6fTY0zrJzOQtLt.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/ji7KaBHhxb6ngHEHxXHcfEzi9bu.jpg",
        "description": "肝胆胰外科的李翊晙（曹政奭饰）、小儿外科的安涏援（柳演锡饰）、胸外科的金隽婠（郑敬淏饰）、妇产科的杨硕亨（金大明饰）和神经外科的蔡颂和（田美都饰），他们都年届四十，是相识20年的医学院同届的校友，也是律帝医院各自科室的骨干。五人能够成为好友，在于就读医学院时一起组建乐队的经历，这份业余爱好，从学生时代一直延续至现在他们...",
        "year": "2020",
        "types": [
          "医疗",
          "治愈"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "曹政奭",
          "柳演锡",
          "郑敬淏",
          "金大明",
          "田美都"
        ]
      },
      {
        "id": "pb_t_s3_2",
        "tmdbId": "94796",
        "title": "爱的迫降",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/976e81HXfGk5aJhYyHsD1oSmQXe.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/3yEHM2HT2vrUtO93YzTJNgEfiZG.jpg",
        "description": "韩国财阀继承女因滑翔伞事故被迫在朝鲜着陆，并进入一名军官的生活，这名军官决定帮她躲起来。...",
        "year": "2019",
        "types": [
          "爱情",
          "喜剧"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "金希元"
        ],
        "actors": [
          "玄彬",
          "孙艺珍",
          "徐智慧",
          "金正贤",
          "杨景元"
        ]
      },
      {
        "id": "pb_t_s3_3",
        "tmdbId": "65143",
        "title": "太阳的后裔",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/21FrxeG8sGu4zKQcnuIR7F9XrYi.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/4ODaZrnKT7iM6sfgDB8ud8FdrVr.jpg",
        "description": "特战警备队大尉柳时镇（宋仲基 饰）与上士徐大荣（晋久 饰）休假之时遭遇激斗事件，送小偷去医院的时候，被主任医师姜暮烟（宋慧乔 饰）误会，也引得徐大荣的前女友尹明珠（金智媛 饰）突然出现，姜暮烟因此与柳时镇结缘，可是由于立场不同最终不欢而散。一次意外派遣，姜暮烟又与柳时镇相遇在战火频发的乌鲁克，作为海外医疗派遣队队长的姜...",
        "year": "2016",
        "types": [
          "军事",
          "爱情"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "李应福",
          "白尚勋",
          "刘钟善"
        ],
        "actors": [
          "宋慧乔",
          "宋仲基",
          "金智媛",
          "晋久",
          "温流"
        ]
      },
      {
        "id": "pb_t_s3_4",
        "tmdbId": "103147",
        "title": "信号",
        "rate": "6.1",
        "cover": "https://image.tmdb.org/t/p/w500/qFplFFQy6zMMplHItcrMAtBEseO.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/eoky4vypEBIWCoY3lMLvEOShVLy.jpg",
        "description": "《心动的信号》是由腾讯视频推出的一档恋爱社交推理真人秀节目。节目以信号小屋中发生的素人真实恋爱故事为主体，采用非传统意义上的星素结合方式，每期邀请明星嘉宾和心理学专家以场外观察员的身份，来反观6位素人单身男女日常相处的生活细节和情感走向，从而进行推理分析和心动连线。...",
        "year": "2018",
        "types": [
          "悬疑",
          "时空"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "杨超越",
          "杜海涛",
          "张纯烨",
          "代旭",
          "薛凯琪"
        ]
      },
      {
        "id": "pb_t_s3_5",
        "tmdbId": "67915",
        "title": "孤单又灿烂的神：鬼怪",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/9VqVphrJ7k9k2atBMfNZ0cg5Rdp.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/smSbK5cd8T9XHcxEUcems23BDEF.jpg",
        "description": "高丽时期的大将军金侁（孔刘饰）因为受到王的猜忌而遇害，死后获得了诅咒般的能力——“永生”和强大的能力。拥有不死之身的“鬼怪”金侁，为了结束自己无限循环的生活必需找到一位人类新娘，却在寻找途中阴差阳错与失去记忆的阴间使者王黎（李栋旭饰）开始了奇妙“同居”生活，两人在遇到了传说中的“鬼怪新娘”——一个“命中注定要死”的少女...",
        "year": "2016",
        "types": [
          "奇幻",
          "浪漫"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "尹钟镐",
          "权赫灿",
          "李应福"
        ],
        "actors": [
          "孔刘",
          "金高银",
          "李栋旭",
          "刘寅娜",
          "陆星材"
        ]
      },
      {
        "id": "pb_t_s3_6",
        "tmdbId": "75701",
        "title": "非自然死亡",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/xqmRCfHB7s5np5TyDa02ZXQd2Wc.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xBArQQzPVYvPj0DidnsK9nF3JbB.jpg",
        "description": "在“非自然死亡原因研究所”（简称“UDI”）工作的三澄美琴是专门探查死者死因的解剖医生。她最不能容忍的是对“非自然死亡”不闻不问。在她看来，“非自然”的背后必定有着需要法医来追究的真相，比如伪装杀人、医疗失误、未知的疑难疾病等等。然而，在日本，很多非自然死亡的死者都未经解剖就火化了。美琴与她那些个性鲜明的同事们一起，向...",
        "year": "2018",
        "types": [
          "法医",
          "悬疑"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "冢原亚由子",
          "村尾嘉昭",
          "竹村谦太郎"
        ],
        "actors": [
          "石原里美",
          "井浦新",
          "洼田正孝",
          "市川实日子",
          "松重丰"
        ]
      },
      {
        "id": "pb_t_s3_7",
        "tmdbId": "55925",
        "title": "半泽直树",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/m5kpwUaZH1EpClrBbkruvzCsNU9.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/i3VsZ816Hf6z96REOohkwxCWj4z.jpg",
        "description": "在泡沫经济时期，进入东京中央银行的银行职员半泽直树一边同银行内外的“敌人”斗争，一边贯彻自己的信念“不能像机器一样对待身边的人”，对待恶人要“以牙还牙，加倍奉还”。...",
        "year": "2013",
        "types": [
          "职场",
          "复仇"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "堺雅人",
          "上户彩",
          "及川光博",
          "贺来贤人",
          "香川照之"
        ]
      },
      {
        "id": "pb_t_s3_8",
        "tmdbId": "215197",
        "title": "重启人生",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/uaZXNusiStCwGMyUun97bysK774.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/xcs4Ud9FOPEcGqA6FLTpUC0AL6f.jpg",
        "description": "近藤麻美（安藤樱 饰）是个任职于地方市役所、生活非常平凡的33岁单身女性。某天一睁开眼，麻美发现自己居然带着记忆穿越到过去，人生更是从呱呱坠地的零岁重来一遍！意会过来的她，想起死后世界的引路人，以及自己希望再投胎为人类而选择一边积德、一边重新过上同样的人生。亲情、友情、恋情… 第二轮平凡的人生，开始！...",
        "year": "2023",
        "types": [
          "奇幻",
          "日常"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "狩山俊辅",
          "水野格"
        ],
        "actors": [
          "安藤樱",
          "夏帆",
          "木南晴夏"
        ]
      },
      {
        "id": "pb_t_s3_9",
        "tmdbId": "46234",
        "title": "胜者即是正义",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/8h56NWBnJspZrsRb2yaAaoWlp0m.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/goWGf6rnqEYiGGBxSxltTteVKzD.jpg",
        "description": "官司胜诉率高达100%却性格偏执的律师古美门研介，和坦率得有些鲁莽的后辈黛真知子这对“凹凸组合”一起解决疑难案件。...",
        "year": "2012",
        "types": [
          "律政",
          "搞笑"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "西坂瑞城",
          "石川淳一",
          "城宝秀则"
        ],
        "actors": [
          "堺雅人",
          "新垣结衣",
          "冈田将生",
          "田口淳之介",
          "小雪"
        ]
      },
      {
        "id": "pb_t_s3_10",
        "tmdbId": "95718",
        "title": "东京大饭店",
        "rate": "8.4",
        "cover": "https://image.tmdb.org/t/p/w500/qbmilxpotzMShI02qgswlKQOxGy.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/r8f2xmBQlmRpo9tvRwy73CoF972.jpg",
        "description": "尾花夏树是一位法餐厨师，他凭才能在巴黎拥有了自己的店，而且获得了米其林二星。他由于被誉为魅力超凡的主厨而由自信变得自高自大，但另一方面，他却无论如何也拿不到三星，为此压力巨大，遇到了事业的瓶颈。这时，店里发生重大事件，他失去了店和伙伴们。跌入人生谷底的他，与名为早见伦子的女厨师相遇，决定作为厨师从头再开，更以打造世界上...",
        "year": "2019",
        "types": [
          "美食",
          "励志"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "木村拓哉",
          "铃木京香",
          "玉森裕太",
          "泽村一树",
          "及川光博"
        ]
      }
    ],
    "s4": [
      {
        "id": "pb_t_s4_1",
        "tmdbId": "106449",
        "title": "凡人修仙传",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/u1VRjvvCIVwb1MUhoxSAUimhoKZ.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/8NIvQY34tNPc4txNeym2zEYk9ek.jpg",
        "description": "平凡少年韩立出生贫困，为了让家人过上更好的生活，自愿前去七玄门参加入门考核，最终被墨大夫收入门下。墨大夫一开始对韩立悉心培养、传授医术，让韩立对他非常感激，但随着一同入门的弟子张铁失踪，韩立才发现了墨大夫的真面目。墨大夫试图夺舍韩立，最终却被韩立反杀。通过墨大夫的遗书韩立得知了一个全新世界：修仙界的存在。在帮助七玄门抵...",
        "year": "2020",
        "types": [
          "仙侠",
          "国漫"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "钱文青",
          "宋伊人",
          "李诗萌",
          "徐佳琦",
          "杨默"
        ]
      },
      {
        "id": "pb_t_s4_2",
        "tmdbId": "124003",
        "title": "完美世界",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/mNJPCv2dLADVVSgLlzsMJoXdTmb.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qgTHKXeje3iInDXFaIBsIHpJQzu.jpg",
        "description": "本作动画改编自起点白金作者辰东遮天三部曲的第二部——完美世界。他为修道而生，为应劫而至，他身化亿万血雨，洒落万古岁月，经历无数时空的熬炼，岁月长河的洗礼，他化万古，他化自在。看男主石昊如何一生极致辉煌，造就无尽传说。...",
        "year": "2021",
        "types": [
          "玄幻",
          "国漫"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "张帅"
        ],
        "actors": [
          "陈锦闻",
          "李诗萌",
          "刘明月",
          "刘晴",
          "楚越"
        ]
      },
      {
        "id": "pb_t_s4_3",
        "tmdbId": "224839",
        "title": "遮天",
        "rate": "8.9",
        "cover": "https://image.tmdb.org/t/p/w500/z9JNGlJ8eGy6S6SOlBhpmxjjXGT.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/1HcuGlNEfc6EYZHEZGwgKjAvYa4.jpg",
        "description": "本作动画改编自起点白金作者辰东遮天三部曲的第一部——遮天。冰冷与黑暗并存的宇宙深处，九具庞大的龙尸拉着一口青铜古棺，亘古长存。这是太空探测器在枯寂的宇宙中捕捉到的一幅极其震撼的画面。九龙拉棺，究竟是回到了上古，还是来到了星空的彼岸？一个浩大的仙侠世界，光怪陆离，神秘无尽。热血似火山沸腾，激情若瀚海汹涌，欲望如深渊无止境...",
        "year": "2023",
        "types": [
          "玄幻",
          "热血"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "赵乾景",
          "李婵妃",
          "徐翔",
          "吴磊",
          "张若瑜"
        ]
      },
      {
        "id": "pb_t_s4_4",
        "tmdbId": "79481",
        "title": "斗破苍穹 年番",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/oyoahIcdamTXwjIaL3CqZ1v5CLl.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/cTCn2EO69SERNfhaezJMoqBom4G.jpg",
        "description": "萧炎曾是家族里公认的斗气天才，年仅11岁便已经抵达了常人穷尽一生都无法修炼到的境界。可12岁那年，一场意外让萧炎的全部努力都化为了乌有，失去一切的他体会到了人情的冷暖和世态的炎凉，之后，萧炎和纳兰嫣然许下了决斗的三年之约，来到魔兽山脉，在身世神秘的药老手下修炼。三年间，萧炎的身影穿梭在塔戈尔大沙漠和加玛帝国黑岩城等地，...",
        "year": "2017",
        "types": [
          "玄幻",
          "燃向"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "顾振华",
          "陈百俊"
        ],
        "actors": [
          "不一",
          "刘雨轩",
          "陈奕雯",
          "冯骏骅",
          "文晓依"
        ]
      },
      {
        "id": "pb_t_s4_5",
        "tmdbId": "101172",
        "title": "吞噬星空",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/lDVOl7wTFUIqwlSrWsGjBCHt3fQ.jpg",
        "description": "RR病毒席卷全球，受感染的动物异变为恐怖怪兽，人类文明几近毁灭。在绝境中，人类筑起高墙，建立基地市作为最后的堡垒。这段至暗岁月，被称为\"大涅槃时期\"。灾难也催生了进化——人类体质在极端环境下飞速突破，尚武之风兴起，那些站在巅峰的强者，被称为\"武者\"。18岁的罗峰即将高考，却因一场怪兽袭击改变了命运。当军方束手无策时，一...",
        "year": "2020",
        "types": [
          "科幻",
          "国漫"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "邵官华",
          "沈乐平"
        ],
        "actors": [
          "赵乾景",
          "谢莹",
          "张晔",
          "赵梓涵",
          "张欣"
        ]
      },
      {
        "id": "pb_t_s4_6",
        "tmdbId": "223911",
        "title": "仙逆",
        "rate": "8.2",
        "cover": "https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/crn53sSGWRZ8wAtEGso52nepEkz.jpg",
        "description": "改编自耳根同名小说《仙逆》，讲述了乡村平凡少年王林以心中之感动，逆仙而修，求的不仅是长生，更多的是摆脱那背后的蝼蚁之身。他坚信道在人为，以平庸的资质踏入修真仙途，历经坎坷风雨，凭着其聪睿的心智，一步一步走向巅峰，凭一己之力，扬名修真界。...",
        "year": "2023",
        "types": [
          "仙侠",
          "杀伐"
        ],
        "is_new": false,
        "playable": true,
        "directors": [
          "石头熊",
          "冯毅"
        ],
        "actors": [
          "史泽鲲",
          "张惠霖",
          "常文涛",
          "刘思岑",
          "白雪岑"
        ]
      },
      {
        "id": "pb_t_s4_7",
        "tmdbId": "209867",
        "title": "葬送的芙莉莲",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/1TtrtRIwXz5BB0gXEl8zgBypl9c.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/rBOnrVlck7BIlGeWVlzYiZeg4l2.jpg",
        "description": "打倒了魔王的勇者一行人的后日谈——在“那之后”的故事。身为魔法使的芙莉莲是一位精灵，她和另外三人有着不一样的地方。对于生活在“之后”的世界、感受到的事情有着不一样的看法……残存世间的人们所编织的，葬送与祈祷相伴的故事——从“冒险的结束”开始了。...",
        "year": "2023",
        "types": [
          "奇幻",
          "治愈"
        ],
        "is_new": false,
        "playable": true,
        "actors": [
          "种崎敦美",
          "市之濑加那",
          "小林千晃",
          "冈本信彦",
          "东地宏树"
        ]
      },
      {
        "id": "pb_t_s4_8",
        "tmdbId": "95479",
        "title": "咒术回战 第二季",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/kdE1ALF5G6DFMyDU67AyyUklEtn.jpg",
        "backdrop": "https://image.tmdb.org/t/p/w1280/qpin8cASXEVtwhzNsprHYFiOAGk.jpg",
        "description": "少年战斗着——「为寻求正确的死亡」。辛酸·后悔·耻辱人类产生的负面情感，化为诅咒，潜入日常生活诅咒是蔓延于世界的祸源，最糟糕的情况下，会让人类踏入死亡，并且诅咒只能以诅咒祓除。虎杖悠仁是一位体育万能的高中生，某天他为了从“咒物”危机中解救学姐，而吞下了被诅咒的手指“两面宿傩之指”，让“宿傩”这种诅咒跟自己合而为一。在最...",
        "year": "2020",
        "types": [
          "超自然",
          "高燃"
        ],
        "is_new": false,
        "playable": true
      },
      {
        "id": "pb_t_s4_9",
        "title": "鬼灭之刃 柱训练篇",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/sSE8DZr44URZccaKtdU8BZyEU6Q.jpg",
        "description": "炭治郎等鬼杀队剑士接受九柱地狱级特训，为了即将到来的无限城终极决战做好觉醒斑纹的严酷准备。",
        "year": "2024",
        "types": [
          "热血",
          "战斗"
        ],
        "is_new": true,
        "playable": true
      },
      {
        "id": "pb_t_s4_10",
        "tmdbId": "313028",
        "title": "进击的巨人 最终季",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/5gaf9yFJHJTkg6KtLc7enqBY6UK.jpg",
        "description": "《进击的巨人》系列的最终完结特别篇。化身末日巨人的艾连带领着无数巨人前进史拉托亚要塞。这时，出现在深陷绝境的难民们面前的，是在千钧一发之际逃过地鸣的米卡莎、阿尔敏、约翰、柯尼、莱纳、皮可和里维一行人。 过去的伙伴们和两位同年玩伴与艾连之间的战斗，即将划下句点。...",
        "year": "2023",
        "types": [
          "史诗",
          "末日"
        ],
        "is_new": false,
        "playable": true
      }
    ]
  },
  "anime": ANIME_HOME_DATA,
  "variety": VARIETY_HOME_DATA,
  "short": SHORT_HOME_DATA
};
