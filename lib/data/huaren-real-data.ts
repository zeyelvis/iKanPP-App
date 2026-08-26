// 100% 来源于 huaren.live 真实官网 HTML 提取的数据资产
export interface HuarenRealCard {
    vodId: string;
    title: string;
    cover: string;
    badge: string;
    desc: string;
}

export interface HuarenRealRank {
    rank: number;
    title: string;
    status: string;
}

export interface HuarenRealSection {
    id: string;
    title: string;
    rankTitle: string;
    type: 'movie' | 'tv';
    tags: string[];
    cards: HuarenRealCard[];
    rankings: HuarenRealRank[];
}

export const HUAREN_REAL_SECTIONS: HuarenRealSection[] = [
    {
        "id": "movies",
        "title": "最新电影",
        "rankTitle": "最新电影榜单",
        "type": "movie",
        "tags": [
            "奇幻科幻",
            "战争犯罪",
            "悬疑恐怖惊悚",
            "爱情喜剧剧情",
            "动作冒险灾难",
            "动画电影"
        ],
        "cards": [
            {
                "vodId": "200203",
                "title": "消暑胜地反击战",
                "cover": "https://img.jisuimage.com/cover/5a591fff3a2ece097604ef705124246e.jpg",
                "badge": "喜剧",
                "desc": "一个高度紧张的青少年发现自己被困在与她自由奔放的妈妈(布什)的老土男友，格伦(奥康纳)，谁也是她的副校长度假。这个少年开始秘密策划拆散这对夫妇，以挽回这次旅行。"
            },
            {
                "vodId": "202326",
                "title": "狼域",
                "cover": "https://hhmage.com/cover/c93324a2c83c1d57d4f2176b1873fd49.jpg",
                "badge": "剧情",
                "desc": "暂无简介"
            },
            {
                "vodId": "196998",
                "title": "痴心二人行",
                "cover": "https://img.jisuimage.com/cover/8b7c43d87834919d52136b64140c1456.jpg",
                "badge": "剧情",
                "desc": "在孟买，两个社交笨拙的千禧一代，在努力自我接纳的过程中找到了爱情。当他们与内心的不安全感和社会压力斗争时，他们的旅程从城市的喧嚣一路延伸至群山的宁静之中。"
            },
            {
                "vodId": "197109",
                "title": "聊斋，魅首诡案",
                "cover": "https://img.jisuimage.com/cover/dfd426b67b513566a19a013ddd4b0da2.jpg",
                "badge": "悬疑",
                "desc": "来自西域的舞姬阿离三年前惨死客乡，身首异处，她的妹妹阿月来到事发的客栈，联合戏法师李久成和县令张承合谋演了一出大戏，将三年前涉及此事的相关人等都聚于一堂，巧设妙计让当年害死姐姐的凶手互相指证现形，最终"
            },
            {
                "vodId": "198465",
                "title": "真实之物",
                "cover": "https://img.jisuimage.com/cover/fa15d3b256958c4114eb277ac66ccd21.jpg",
                "badge": "剧情",
                "desc": "在寻找心灵寄托的过程中，莱奥试图与他在约会网站上认识的一位女性见面，却落入卡尔设下的严重敲诈陷阱，而卡尔有着犯罪前科。"
            },
            {
                "vodId": "200380",
                "title": "对我来说你已经死了",
                "cover": "https://img.jisuimage.com/cover/198fa316e1f402c73db0cdc43efa641a.jpg",
                "badge": "恐怖",
                "desc": "这部电影聚焦一群即将离家上大学的高中毕业生，讲述他们如何面对现实。仿佛高三生活还不够让人焦虑似的，还有一个连环杀手逍遥法外。"
            },
            {
                "vodId": "200457",
                "title": "痴人唱颂",
                "cover": "https://img.jisuimage.com/cover/df6121546e9c44610ea4ee9b7a11c93a.jpg",
                "badge": "剧情",
                "desc": "在一个与世隔绝的村庄里，年轻的普拉塔普寻求机会，却踏入了一个充满欺骗的世界。被卷入无法控制的力量之中，他夹在进步与传统保留之间，不断考验着自己的信念与人生目标。"
            },
            {
                "vodId": "202325",
                "title": "蝙蝠侠：骑士陨落第一部：骑士陨落",
                "cover": "https://hhmage.com/cover/488c051af3c09185cf58987d56551094.jpg",
                "badge": "动作",
                "desc": "被称为“贝恩”的神秘巨兽只身突破阿卡姆疯人院，将蝙蝠侠的全部宿敌尽数释放到哥谭街头，整座城市瞬间陷入前所未有的犯罪狂潮。蝙蝠侠为了追捕四散的反派，日夜不休地奔波在哥谭的各个角落，精神与体力都被消耗到极限。而这一切，都是贝恩精心策划的棋局——他在暗处冷眼观察，步步紧逼，用连绵不绝的危机一点点消磨披风斗士的意志，一步步将蝙蝠侠推向身心双重崩溃的临界点。"
            },
            {
                "vodId": "198460",
                "title": "哆啦A梦，新大雄的海底鬼岩城",
                "cover": "https://hhmage.com/cover/4497c7e72bb59c84ad147d9639dfbd05.jpg",
                "badge": "",
                "desc": "『哆啦 梦』2026年新作电影『哆啦 梦 新·大雄的海底鬼岩城』正式公布描绘哆啦 梦与大雄一行人在海底世界展开的全新大冒险1983年的《大雄的海底鬼岩城》时隔40多年后焕然新生监督由首次执导《电影哆"
            },
            {
                "vodId": "202090",
                "title": "祈念守护人",
                "cover": "https://hhmage.com/cover/47861dea38264d3ebde532578e3d4faf.jpg",
                "badge": "剧情",
                "desc": "直井玲人遭遇不公对待丢掉工作，又因被捕彻底跌入人生谷底。他向命运彻底屈服，失去了主动选择的意志，完全放弃了对未来的期待。就在他任由自己沉沦的时候，一场意料之外的相遇悄然降临，给了他一个足以改写整个人生"
            },
            {
                "vodId": "201201",
                "title": "鲨笼绝境",
                "cover": "https://hhmage.com/cover/522722ae899733aa8572c8d52c34e171.jpg",
                "badge": "动作",
                "desc": "五位挚友相约前往热带海岛度假，计划在碧蓝海域中体验刺激的鲨鱼笼潜水，同时享受奢靡的派对狂欢。然而他们浑然不知，这趟旅程不过是一场精心布局的犯罪幌子，幕后主谋正是行事冷酷、算无遗策的危险人物“伯恩斯”—"
            },
            {
                "vodId": "202334",
                "title": "罪火焦点",
                "cover": "https://hhmage.com/cover/8e4f08f754338c19a1b86bcd8ccafce2.jpg",
                "badge": "剧情",
                "desc": "故事设定于AI统治的近未来，一名私家侦探受命调查一起凶杀案，却由此发现一个有能力动摇&amp;quot;数字霸主&amp;quot;的叛军组织。随着调查深入，侦探的身份逐渐瓦解，他的世界陷入催眠式的崩解。"
            },
            {
                "vodId": "202335",
                "title": "歪心狼对阵ACME",
                "cover": "https://hhmage.com/cover/c0deeed20ea047b20dc2c73677beca57.jpg",
                "badge": "喜剧",
                "desc": "歪心狼被Acme产品负了太多次，长期追逐BB鸟而不得，遂请了律师（威尔·福特 饰）将Acme集团告上法庭，并对上了律师那令人畏惧的前老板（约翰·塞纳 饰）。此后，人类与卡通角色逐渐发展出友谊，更加坚定了要打赢官司的决心"
            },
            {
                "vodId": "202360",
                "title": "最后的日出",
                "cover": "https://static.huarenlivewebsite.top/imagecdn/1/9/zui_hou_de_ri_chu/202360_image.png",
                "badge": "剧情",
                "desc": "一位身患疾病的年轻美国女子在马略卡岛度过夏天时，与一位魅力四射的当地人意外坠入爱河，这迫使她权衡内心的渴望与家庭责任以及回家的计划。"
            },
            {
                "vodId": "202295",
                "title": "开棺2：恶魔附身",
                "cover": "https://static.huarenlivewebsite.top/imagecdn/1/8/kai_guan_2__e_mo_fu_shen/202295_image.png",
                "badge": "恐怖",
                "desc": "多年前被父亲莫名逐出家门的少女明如，在听闻妹妹美玉被邪灵缠身、日渐衰弱的消息后，重返家族传承百年的染坊。她本想修复亲情、照料妹妹，却不料自己的归来仿佛唤醒了沉眠的诅咒，染坊内接连发生诡异的死亡事件。随"
            },
            {
                "vodId": "202322",
                "title": "千门八将之群龙夺宝",
                "cover": "https://hhmage.com/cover/d85a3cffc424448020a60cee826e8d6b.jpg",
                "badge": "悬疑烧脑",
                "desc": "民国乱世，千门正将程阳收到恋人马珍珍绝笔与死讯，得知九龙宝剑落入张军阀之手。硬抢无门，程阳召回千门八将，以鬼戏子、血手印、佛像血泪、米虫奇象和大罗金仙等连环鬼局，逼张军阀亲手请出宝剑。宝剑得手后，程阳却发现珍珍之死另有隐情，师父马川、恶霸秦五爷与西林书院地契背后还藏着更深一局。八将再设古墓凶局，夺回地契与国宝，最终明白：千术不是巧取豪夺，而是取不义、归正道。"
            }
        ],
        "rankings": [
            {
                "rank": 1,
                "title": "给阿嬷的情书",
                "status": "已完结"
            },
            {
                "rank": 2,
                "title": "夜王",
                "status": "已完结"
            },
            {
                "rank": 3,
                "title": "蜘蛛侠：崭新之日",
                "status": "高清版"
            },
            {
                "rank": 4,
                "title": "痴迷",
                "status": "第1集"
            },
            {
                "rank": 5,
                "title": "哪吒之魔童闹海",
                "status": "第1集"
            },
            {
                "rank": 6,
                "title": "疯狂动物城2",
                "status": "已完结"
            },
            {
                "rank": 7,
                "title": "飞驰人生3",
                "status": "已完结"
            },
            {
                "rank": 8,
                "title": "一路向西",
                "status": "已完结"
            },
            {
                "rank": 9,
                "title": "群体",
                "status": "已完结"
            },
            {
                "rank": 10,
                "title": "色戒",
                "status": "已完结"
            }
        ]
    },
    {
        "id": "tvs",
        "title": "最新电视剧",
        "rankTitle": "最新剧集榜单",
        "type": "tv",
        "tags": [
            "国产剧",
            "香港剧",
            "韩国剧",
            "欧美剧",
            "日本剧",
            "台湾剧",
            "海外剧"
        ],
        "cards": [
            {
                "vodId": "200158",
                "title": "春花宴",
                "cover": "https://static.huarenlivewebsite.top/piccdn/2/14/chun_hua_yan/200158_image.png",
                "badge": "甜虐爱情",
                "desc": "暗厂死士眉林身负血仇，以命入局，周旋于多位男子之间：她是疯王慕容璟和最锋利的杀人利刃，也是阴狠大皇子眼中的旧梦替身，还是赵国质子越秦偏执守护的人。一场关于利用与深情的修罗场，在皇权博弈中凄美上演。"
            },
            {
                "vodId": "201756",
                "title": "欲望的陷阱(2026)",
                "cover": "https://static.huarenlivewebsite.top/piccdn/2/16/yu_wang_de_xian_jing/201756_image.png",
                "badge": "剧情",
                "desc": "本剧讲述被冤枉为杀人而失去生命的一名女性面对巨大的欲望，重新找回自己人生的复仇剧。"
            },
            {
                "vodId": "202351",
                "title": "月蚀迷城",
                "cover": "https://hhmage.com/cover/5d3c0362c7c9e17c3b023c237ed33bfc.jpg",
                "badge": "剧情",
                "desc": "被陷害成为黑帮卧底的失忆警长沈天白，与落魄黑帮少爷陆野，从死敌到被迫结盟，在乱世的修罗场里互为棋子，最终血洗宁城，在废墟上重铸信仰。"
            },
            {
                "vodId": "202167",
                "title": "法医秦明之蚀骨时差",
                "cover": "https://hhmage.com/cover/109bcf8ddba64394d5a909f2482b1cc6.jpg",
                "badge": "推理",
                "desc": "两代警察生死接力、跨越三十年的追凶故事。秦明因时空异常而无意联系上三十年前的父亲秦天，并将其救下，不料却同时救下一个杀人，引发蝴蝶效应，出现系列杀人案。最终凶手被父子联手制服，连环杀人案画上句号。"
            },
            {
                "vodId": "201299",
                "title": "龙婆虎",
                "cover": "https://hhmage.com/cover/ec5935f52ea59fbad054b523ccdf9c72.jpg",
                "badge": "剧情",
                "desc": "龙婆和伙伴们意外卷入一起钻石抢劫案，成为警方怀疑的对象。为了证明自己的清白、挽回声誉，他们踏上了一场惊险刺激、动作不断的冒险之旅。"
            },
            {
                "vodId": "202324",
                "title": "未来全明星第八季",
                "cover": "https://hhmage.com/cover/6a5a7b235c415f31e1223940c2c456f2.jpg",
                "badge": "戏剧",
                "desc": "暂无简介"
            },
            {
                "vodId": "201828",
                "title": "两颗心",
                "cover": "https://hhmage.com/cover/5f2484cfb8073580c9136f7a8894734e.jpg",
                "badge": "戏剧",
                "desc": "暂无简介"
            },
            {
                "vodId": "202359",
                "title": "醒来",
                "cover": "https://hhmage.com/cover/ba9bce0df1d163c5df894ffe0c8d1bca.jpg",
                "badge": "",
                "desc": "1941年冬，照相师陈开来在师父牺牲后，代其赴上海与地下党接头，路遇表面是舞厅头牌、实为军统特工的金宝，在其帮助下以照相馆为掩护开展潜伏。期间他结识身份各异的女子——汪伪特派员苏门、我党谍报人员沈克希"
            },
            {
                "vodId": "201407",
                "title": "35岁了，还谈什么恋爱",
                "cover": "https://hhmage.com/cover/2782341594899d3c425b4fbfbb532d32.jpg",
                "badge": "剧情",
                "desc": "到了这个年纪，已经不会向男人寻求什么童话了。木元茉莉子，35岁，单身，职业是自由撰稿人。她偶然进了一家小料理店，与店主森原先生一拍即合，度过了一个久违的激情夜晚。当然，她既没有心力与萍水相逢的男人谈恋"
            },
            {
                "vodId": "200137",
                "title": "想要幸福的政宗君",
                "cover": "https://static.huarenlivewebsite.top/piccdn/2/16/xiang_yao_xing_fu_de_zheng_zong_jun/200137_image.png",
                "badge": "剧情",
                "desc": "本剧改编自 创作的人气漫画，系列累计发行量已达20万部。不得志的作家·吉田政宗（中泽元纪 饰）误以为自己与交往了10年的恋人桃香的关系即将走到被甩的“尽头”，于是在逃避心理下，与在拼桌酒吧"
            },
            {
                "vodId": "202072",
                "title": "藏锋",
                "cover": "https://static.huarenlivewebsite.top/piccdn/2/14/cang_feng/202072_image.png",
                "badge": "",
                "desc": "故事以红叶市公安局宣传处副处长谭彦的“职场危机”为切入点，从宣传民警转战特警支队担任政委，一直拿笔杆子的谭彦从宣传岗位投身实战前线，一时间陷入秀才遇到兵有理说不清的处境，与深扎一线浑身荷尔蒙爆棚的特警"
            },
            {
                "vodId": "201837",
                "title": "女警出更第二季",
                "cover": "https://hhmage.com/cover/c54a42429f2ca4168fe42410d5a0fd4d.jpg",
                "badge": "剧情",
                "desc": "苹果宣布续订剧集《女警出更》(Women in Blue)第二季。"
            },
            {
                "vodId": "202364",
                "title": "书虫侦探第二季",
                "cover": "https://hhmage.com/cover/9360dab8a7f2ccb03258c61d3c078c58.jpg",
                "badge": "剧情",
                "desc": "Great news for Mark Gatiss fans! The Cinemaholic can confirm that PBS has renewed the upcoming Briti"
            },
            {
                "vodId": "202156",
                "title": "平凡的乔第二季",
                "cover": "https://hhmage.com/cover/318ddd8bf86d4ecef65d7df547d1b271.jpg",
                "badge": "欧美剧",
                "desc": "为了彻底查清父亲隐藏的犯罪背景，并摆脱无休止的麻烦，乔（由迪昂·科尔 饰）带领他的核心团队离开匹兹堡，一路追寻线索来到了南非的开普敦"
            },
            {
                "vodId": "202132",
                "title": "好，我们离婚吧",
                "cover": "https://static.huarenlivewebsite.top/piccdn/2/16/hao_wo_men_li_hun_ba/202132_image.png",
                "badge": "剧情",
                "desc": "讲述的是婚纱店夫妇为疲惫不堪的婚姻生活画上句号而展开的真实离婚体验记。"
            },
            {
                "vodId": "202336",
                "title": "金色",
                "cover": "https://static.huarenlivewebsite.top/piccdn/2/14/jin_se/202336_image.png",
                "badge": "",
                "desc": "三十万两黄金突现大漠，传言寻金之人皆成厉鬼。前来查案的锦衣卫，第一日便陷入疯癫；迷途不知返的忠胆副使，在欲念与信义之中沉沦；横遭灭门，百毒不侵的女子重返大漠，把自己捆绑成各方必争的焦点，决心复仇！大漠"
            }
        ],
        "rankings": [
            {
                "rank": 1,
                "title": "逐玉",
                "status": "40集全"
            },
            {
                "rank": 2,
                "title": "莫离",
                "status": "非璃墨属跑男默契大挑战集全"
            },
            {
                "rank": 3,
                "title": "九门",
                "status": "彩蛋04集全"
            },
            {
                "rank": 4,
                "title": "百花杀",
                "status": "番外集全"
            },
            {
                "rank": 5,
                "title": "正义女神粤语",
                "status": "25集全"
            },
            {
                "rank": 6,
                "title": "御廷谣",
                "status": "32"
            },
            {
                "rank": 7,
                "title": "铁拳教育",
                "status": "10集全"
            },
            {
                "rank": 8,
                "title": "骄阳似我",
                "status": "36集全"
            },
            {
                "rank": 9,
                "title": "这一秒过火",
                "status": "33集全"
            },
            {
                "rank": 10,
                "title": "新闻女王2粤语",
                "status": "25"
            }
        ]
    },
    {
        "id": "varieties",
        "title": "最新综艺",
        "rankTitle": "最新综艺榜单",
        "type": "tv",
        "tags": [
            "大陆综艺",
            "日韩综艺",
            "港台综艺",
            "欧美综艺"
        ],
        "cards": [
            {
                "vodId": "201039",
                "title": "心动双重奏",
                "cover": "https://hhmage.com/cover/ad595f77f52724b0e11d07b27f2a5176.jpg",
                "badge": "真人秀",
                "desc": "《心动双重奏》首档代际交友真人秀，8位单身青年携长辈开启13天寻爱之旅。以青年心动为主线、长辈陪伴为辅线，纪实记录约会相处点滴，融合心动氛围感、家庭温情与现实婚恋视角，呈现兼具浪漫与烟火气的双向寻爱故"
            },
            {
                "vodId": "201813",
                "title": "宠宠冲冲冲",
                "cover": "https://hhmage.com/cover/da4de9ac9388cf3fba1916019468d9e8.jpg",
                "badge": "真人秀",
                "desc": "《宠宠冲冲冲》节目以“人宠共生，爱不设限”为核心理念，面向全网招募宠物达人及他们的萌宠伙伴，通过直播实时连麦的形式，展现宠物的多元魅力。"
            },
            {
                "vodId": "431",
                "title": "同床异梦2：你是我的命运",
                "cover": "https://hhmage.com/cover/f58d720bf94dad5b8f6fba554975ebc4.jpg",
                "badge": "",
                "desc": "SBS综艺《同床异梦》第二季回归，金九拉、徐章勋搭档主持，主题由第一季亲子关系转向夫妻关系，在中国发展的韩国女演员秋瓷炫及丈夫于晓光作为嘉宾参与了本季节目。"
            },
            {
                "vodId": "201037",
                "title": "萌宠来啦",
                "cover": "https://hhmage.com/cover/01255d6683efe077d3de805a0b7104d7.jpg",
                "badge": "综艺",
                "desc": "《萌宠来啦》是吉林卫视打造的宠物社交科普季播节目，聚焦铲屎官真实养宠痛点，邀请行业专家、资深养宠达人组成嘉宾团，结合真实人宠故事，进行科普演示、互动答疑，兼具实用性与综艺感。节目打造多元人宠互动场景，"
            },
            {
                "vodId": "165988",
                "title": "全民星攻略",
                "cover": "https://www.mdzypic.com/upload/vod/20240614-1/4f527a9700ef40cc0d7c3ffb56386eb6.jpg",
                "badge": "真人秀",
                "desc": "《全民星攻略》日本毕业典礼向学长要制服的第二颗钮釦代表著什麽意思呢？喜欢金庸小说的人必须要来挑战这一题，郭靖第一次见到黄蓉请她吃饭，花了银子19两，请问这一餐大约是台币多少钱呢？青春校园剧球赛、迎新会"
            },
            {
                "vodId": "199645",
                "title": "伟大的导游3",
                "cover": "https://hhmage.com/cover/5d72e77238e2a556a48f39e1403faff3.jpg",
                "badge": "真人秀",
                "desc": "这次旅行地点是非洲，埃塞俄比亚 여행지로 생각해본 적도 없는 미지의 나라로! 생소한 나라 출신의 대한외국인이 설계한 가이드북만 믿고 무작정 떠나는 여행 리얼리티"
            },
            {
                "vodId": "214",
                "title": "小姐不熙娣",
                "cover": "https://hhmage.com/cover/d029847ab0189f1a6c570f1d37ccb6cb.jpg",
                "badge": "",
                "desc": "自带女王气势的IPSS的女王小Ｓ，睽违六年强势回归！以女性出发点的节目议题，聚焦女性的职场与生活感受。"
            },
            {
                "vodId": "95882",
                "title": "娱乐百分百",
                "cover": "https://www.mdzypic.com/upload/vod/20240630-1/e047234133f85e6a0e8a8d8af3f77c2a.jpg",
                "badge": "港台综艺",
                "desc": "《娱乐百分百》是八大综合台一档娱乐新闻节目，每天报道最新的娱乐新闻，节目还会请嘉宾现场访谈！节目贴近年轻族群，介绍时下流行的装扮、以及艺人的流行教室，有固定的特别企划，邀请艺人完成从未尝试过的事情。"
            },
            {
                "vodId": "201836",
                "title": "TheOneShot",
                "cover": "https://hhmage.com/cover/5dfde97d835853b9720acc66b472b6ef.jpg",
                "badge": "真人秀",
                "desc": "日本超人气搞笑组合“千鸟”的大悟亲自策划全新综艺，齐集8位顶级日本笑匠展开争霸战，各出奇谋自制短片，用最强大嘅演技同喜剧细胞，争夺“Golden One Shot”最高殊荣。一场爆笑对决即将展开，谁能"
            },
            {
                "vodId": "200645",
                "title": "你好湖南",
                "cover": "https://hhmage.com/cover/bb076991c5c7cb0165f9c389560878a5.jpg",
                "badge": "纪实",
                "desc": "《你好湖南》项目立足就业、创业、生活、成长四大维度，用接地气的方式解读“年轻人友好省份”。由芒果新生主持，以“建群加好友”搭建沟通桥梁，以通俗提问挖掘真实故事，以主持人手持设备为第一视角，贴身捕捉真实"
            },
            {
                "vodId": "202126",
                "title": "街头世界斗士：编导之战",
                "cover": "https://hhmage.com/cover/1d69ee3900d13553149daf9b0f70df29.jpg",
                "badge": "歌舞",
                "desc": "用头脑战斗，用身体证明的编舞家们的作品战争。最终将自己的名字印到编导榜首的编舞家是谁？"
            },
            {
                "vodId": "201386",
                "title": "开“麦”大笑吧",
                "cover": "https://hhmage.com/cover/bf36697a1ba321dae67aa2440e1547d6.jpg",
                "badge": "青春",
                "desc": "聚焦高校年轻群体。它通过脱口秀的方式，陪伴大学生面对毕业的焦虑与告别，用笑声卸下身心和情绪包袱"
            },
            {
                "vodId": "194473",
                "title": "文明之旅第三季",
                "cover": "https://hhmage.com/cover/770828db44083a6e5bfe8429a7a87bcb.jpg",
                "badge": "历史纪录片",
                "desc": "《文明之旅》是一档逐年讲文明史的长视频知识节目，由得到创始人罗振宇主讲。节目从公元1000年讲到1912年，每期一小时，计划20年持续更新。《文明之旅第3季》将于2026年3月4日至2027年1月27"
            },
            {
                "vodId": "97799",
                "title": "欢乐集结号",
                "cover": "https://dbzy5.com/upload/vod/20250121-1/4c7990004cc10b0d7fb1e324fdbaf916.jpg",
                "badge": "真人秀",
                "desc": "《欢乐集结号》在娱乐资讯类栏目中一枝独秀，领跑全国，是辽宁卫视唯一一档以报道娱乐动态、解读文化现象、重温经典作品为内容的专题栏目。以东北独有的幽默文化为立足点，全面整合辽视独家资源，时时追踪欢乐经典、"
            },
            {
                "vodId": "202138",
                "title": "爱情盲选：英国篇第三季",
                "cover": "https://hhmage.com/cover/406e81c862e7365160ae77a62187f3df.jpg",
                "badge": "真人秀",
                "desc": "暂无简介"
            },
            {
                "vodId": "113403",
                "title": "Salon Drip 2",
                "cover": "https://hhmage.com/cover/2f9e0d95564143260178119ffafd37e4.jpg",
                "badge": "脱口秀",
                "desc": "2023年8月8日~至今"
            }
        ],
        "rankings": [
            {
                "rank": 1,
                "title": "Running Man",
                "status": "20260824"
            },
            {
                "rank": 2,
                "title": "喜欢你我也是第六季",
                "status": "20260823(第12期陪看(三))"
            },
            {
                "rank": 3,
                "title": "乘风2026",
                "status": "20260703(加更版)"
            },
            {
                "rank": 4,
                "title": "半熟恋人第五季",
                "status": "20260816(特别加更)"
            },
            {
                "rank": 5,
                "title": "哈哈哈哈哈第六季",
                "status": "20260706(第5期精编回顾)"
            },
            {
                "rank": 6,
                "title": "你好星期六",
                "status": "20260823(会员精选)"
            },
            {
                "rank": 7,
                "title": "地球超新鲜第二季",
                "status": "20260826(特别加更第9期)"
            },
            {
                "rank": 8,
                "title": "开始推理吧第四季",
                "status": "20260826(收官特辑第1期上)"
            },
            {
                "rank": 9,
                "title": "心动的信号第九季",
                "status": "20260826(超前彩蛋)"
            },
            {
                "rank": 10,
                "title": "现在就出发第三季",
                "status": "20260118(名场面特辑)"
            }
        ]
    },
    {
        "id": "animes",
        "title": "最新动漫",
        "rankTitle": "最新动漫榜单",
        "type": "tv",
        "tags": [
            "国产动漫",
            "日韩动漫",
            "欧美动漫",
            "港台动漫"
        ],
        "cards": [
            {
                "vodId": "122",
                "title": "凡人修仙传",
                "cover": "https://static.huarenlivewebsite.top/piccdn/4/23/fan_ren_xiu_xian_chuan/122_image.png",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "109",
                "title": "仙逆",
                "cover": "https://hhmage.com/cover/896b690b9566f53a875e03a3a324c091.jpg",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "91978",
                "title": "牧神记",
                "cover": "https://hhmage.com/cover/1303f700901b0618800c94479308df8d.jpg",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "2845",
                "title": "沧元图",
                "cover": "https://hhmage.com/cover/af5604111becd28211b2bc271c8c9b57.jpg",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "189909",
                "title": "光阴之外",
                "cover": "https://hhmage.com/cover/d852e3658138a2e06e1105e30ebb3d49.jpg",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "142",
                "title": "完美世界",
                "cover": "https://hhmage.com/cover/c68df1093a93023d0960841f27224080.jpg",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "93084",
                "title": "斗破苍穹年番",
                "cover": "https://img.jisuimage.com/cover/5988319f8fdeb1b2d254a9a38518f52e.jpg",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "91093",
                "title": "吞噬星空",
                "cover": "https://static.huarenlivewebsite.top/imagecdn/4/23/tun_shi_xing_kong/91093_image.png",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "180956",
                "title": "剑来第二季",
                "cover": "https://img.jisuimage.com/cover/46ca629891f3c3bd16b4a4978d31e483.jpg",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "108",
                "title": "海贼王",
                "cover": "https://hhmage.com/cover/36ab2a6162713cc28168f2ccd171caae.jpg",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "23",
                "title": "遮天",
                "cover": "https://hhmage.com/cover/eabe8e1fe6add3ddf6d65b6df954b376.jpg",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "192002",
                "title": "斗罗大陆II绝世唐门",
                "cover": "https://static.huarenlivewebsite.top/piccdn/4/23/dou_luo_da_lu_2__jue_shi_tang_men/192002_image.png",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "97218",
                "title": "拔作岛",
                "cover": "https://static.huarenlivewebsite.top/imagecdn/4/24/ba_zuo_dao/97218_image.png",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "189",
                "title": "师兄啊师兄",
                "cover": "https://hhmage.com/cover/7aa3fe3a2565cc27c69257a8b9d4ed1d.jpg",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "167",
                "title": "神印王座",
                "cover": "https://static.huarenlivewebsite.top/piccdn/4/23/shen_yin_wang_zuo/167_image.png",
                "badge": "",
                "desc": "暂无简介"
            },
            {
                "vodId": "190551",
                "title": "咒术回战第三季",
                "cover": "https://static.huarenlivewebsite.top/imagecdn/4/24/zhou_shu_hui_zhan_di_3_ji/190551_image.png",
                "badge": "",
                "desc": "暂无简介"
            }
        ],
        "rankings": [
            {
                "rank": 1,
                "title": "凡人修仙传",
                "status": "188集全"
            },
            {
                "rank": 2,
                "title": "仙逆",
                "status": "155集全"
            },
            {
                "rank": 3,
                "title": "牧神记",
                "status": "更新中"
            },
            {
                "rank": 4,
                "title": "沧元图",
                "status": "更新中"
            },
            {
                "rank": 5,
                "title": "光阴之外",
                "status": "更新中"
            },
            {
                "rank": 6,
                "title": "完美世界",
                "status": "更新中"
            },
            {
                "rank": 7,
                "title": "斗破苍穹年番",
                "status": "更新中"
            },
            {
                "rank": 8,
                "title": "吞噬星空",
                "status": "更新中"
            },
            {
                "rank": 9,
                "title": "剑来第二季",
                "status": "更新中"
            },
            {
                "rank": 10,
                "title": "遮天",
                "status": "更新中"
            }
        ]
    }
];
