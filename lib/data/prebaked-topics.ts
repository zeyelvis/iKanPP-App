/**
 * 场景 4：程序化专题预烘焙数据集 (Prebaked Topic Dataset)
 * 纯静态数据，无任何 KV/网络依赖，0ms 秒开且绝不膨胀 Worker Bundle
 */

export interface TopicItem {
  title: string;
  type?: string;
  year?: string;
  rate?: string;
  cover?: string;
  href: string;
  highlight?: string;
}

export interface TopicEntity {
  slug: string;
  topicTitle: string;
  metaTitle: string;
  metaDescription: string;
  curatorNote: string; // 300字深度策展导语
  longTailKeywords: string[];
  intentFamily: string;
  titles: TopicItem[];
  createdAt: string;
  updatedAt: string;
}

// 预烘焙的高权重意图专题库 (0ms 秒开保底)
export const PREBAKED_TOPICS: Record<string, TopicEntity> = {
  "ao-ye-bi-kan-xuan-yi-shen-ju": {
    "slug": "ao-ye-bi-kan-xuan-yi-shen-ju",
    "topicTitle": "绝不注水！熬夜必看的10部反转悬疑神剧盘点",
    "metaTitle": "熬夜必看高分反转悬疑神剧盘点推荐 - 4K无删减完整版免费在线看 | iKanPP",
    "metaDescription": "精选豆瓣8.5分以上、节奏紧凑绝不拖沓的高智商悬疑推理神剧，反转不断无尿点，支持 4K 超清免 VIP 纯直连秒播。",
    "curatorNote": "在快餐式追剧时代，真正能让观众屏息凝神、彻夜难眠的悬疑神作凤毛麟角。本专题由 iKanPP 影库独立精选，剔除所有剧情注水、逻辑崩坏的平庸之作，聚焦于极致的反转博弈、心理博弈与社会派人性深潜。无论你偏好英美硬核本格推理，还是华语高能社会犯罪题材，这批作品都能带给你肾上腺素飙升的解谜快感。",
    "longTailKeywords": [
      "高分悬疑剧推荐",
      "反转烧脑神剧",
      "熬夜必看悬疑片单",
      "高智商推理电视剧",
      "免VIP完整版"
    ],
    "intentFamily": "反转悬疑 · 烧脑推理",
    "titles": [
      {
        "title": "漫长的季节",
        "type": "tv",
        "year": "2023",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/tJLiKDYdfMskFkJXV1HnaQAdpGf.jpg",
        "href": "/title/ik000002-man-chang-de-ji-jie",
        "highlight": "华语生活悬疑天花板，玉米地里的时代悲歌与命运闭环"
      },
      {
        "title": "绝命毒师 第五季",
        "type": "tv",
        "year": "2012",
        "rate": "9.7",
        "cover": "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        "href": "/title/ik000003-breaking-bad",
        "highlight": "影史无可超越的封神之作，老白帝国的盛极而衰"
      },
      {
        "title": "沉默的真相",
        "type": "tv",
        "year": "2020",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/wU5L7mZA0Yy764D1WPP2403d0MG.jpg",
        "href": "/title/ik000004-chen-mo-de-zhen-xiang",
        "highlight": "赤子之心照亮长夜，令人泪目的正义接力"
      }
    ],
    "createdAt": "2026-09-01T00:00:00Z",
    "updatedAt": "2026-09-20T00:00:00Z"
  },
  "zhi-yu-xi-dian-ying-tui-jian": {
    "slug": "zhi-yu-xi-dian-ying-tui-jian",
    "topicTitle": "适合情侣周末窝在沙发看的温暖治愈系电影",
    "metaTitle": "周末情侣高分治愈系温情电影推荐 - 4K超清画质在线看 | iKanPP",
    "metaDescription": "告别工作日的疲惫与喧嚣，本片单精选豆瓣高分治愈系温情佳作，唯美配乐与细腻情感交织，适合二人世界安静品味。",
    "curatorNote": "快节奏的生活常让我们疲于奔命，唯有在周末的黄昏与爱人依偎在沙发上，让光影的温度慢慢抚平身心的疲惫。本专题以“温柔的治愈力”为母题，涵盖了公路漫游、奇幻陪伴与平淡日常中的温存细节。每一部电影都如同一杯热可可，用细腻的视听语言提醒我们生活原本的美好与纯粹。",
    "longTailKeywords": [
      "情侣周末电影推荐",
      "高分治愈系电影",
      "温暖解压片单",
      "二人世界看什么电影",
      "豆瓣高分温情片"
    ],
    "intentFamily": "治愈温情 · 周末慢调",
    "titles": [
      {
        "title": "肖申克的救赎",
        "type": "movie",
        "year": "1994",
        "rate": "9.7",
        "cover": "https://image.tmdb.org/t/p/w500/aAdnwqwkKX5PPcr8EdtaiA8AZVl.jpg",
        "href": "/title/ik000001-xiao-shen-ke-de-jiu-shu",
        "highlight": "希望是美好的事物，也许是世间最美好的东西"
      }
    ],
    "createdAt": "2026-09-01T00:00:00Z",
    "updatedAt": "2026-09-20T00:00:00Z"
  },
  "top-suspense-crime-dramas": {
    "slug": "top-suspense-crime-dramas",
    "topicTitle": "熬夜也要追完：高智商反转、全程无注水的国产硬核悬疑犯罪神剧",
    "metaTitle": "熬夜也要追完：高智商反转、全程无注水的国产硬核悬疑犯罪神剧 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "真正让人熬夜的悬疑剧，从来不靠故弄玄虚，而是用严密因果、复杂人性与不断重构真相的叙事，让每一处细节都成为破局线索。本专题从候选片库中精选兼具案件强度、逻辑密度和人物厚度的国产犯罪佳作：既有双胞胎共用身份、在昼夜之间追查旧案的高概念设定，也有横跨多年、借时代褶皱还原罪与罚的沉浸式追。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "真正让人熬夜的悬疑剧，从来不靠故弄玄虚，而是用严密因果、复杂人性与不断重构真相的叙事，让每一处细节都成为破局线索。本专题从候选片库中精选兼具案件强度、逻辑密度和人物厚度的国产犯罪佳作：既有双胞胎共用身份、在昼夜之间追查旧案的高概念设定，也有横跨多年、借时代褶皱还原罪与罚的沉浸式追凶；既呈现司法体系内孤勇者以生命守护证据的悲壮，也通过儿童视角揭开成年人世界最幽暗的秘密。这些作品拒绝机械拖延与廉价反转，伏笔、表演、镜头和人物选择彼此咬合，谜底揭晓后仍值得回看验证。它们关心的不只是凶手是谁，更追问一个人如何被欲望、家庭、环境和时间推向深渊。适合偏爱高智商博弈、非线性叙事、社会派推理与暗黑犯罪美学的观众，一旦点开，便很难在真相落地前关掉屏幕。",
    "longTailKeywords": [
      "高智商反转国产悬疑剧",
      "熬夜必看犯罪神剧",
      "全程无注水悬疑剧推荐",
      "国产硬核推理电视剧"
    ],
    "intentFamily": "反转悬疑 · 硬核推理",
    "titles": [
      {
        "title": "漫长的季节",
        "type": "tv",
        "year": "2023",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/tJLiKDYdfMskFkJXV1HnaQAdpGf.jpg",
        "href": "/title/%E6%BC%AB%E9%95%BF%E7%9A%84%E5%AD%A3%E8%8A%82",
        "highlight": "生活悬疑的天花板，玉米地里的时代悲歌与命运闭环"
      },
      {
        "title": "狂飙",
        "type": "tv",
        "year": "2023",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/xmBmR46Nks73VlTrCsH9i6KCWSH.jpg",
        "href": "/title/%E7%8B%82%E9%A3%99",
        "highlight": "一个卖鱼佬的上桌史与正义守望者的二十年殊死较量"
      },
      {
        "title": "边水往事",
        "type": "tv",
        "year": "2024",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/fhlimtLNQKYdvgArV3aXCiB49RI.jpg",
        "href": "/title/%E8%BE%B9%E6%B0%B4%E5%BE%80%E4%BA%8B",
        "highlight": "法外雨林中的利益杀局，每一步自救都可能走向深渊"
      },
      {
        "title": "白夜追凶",
        "type": "tv",
        "year": "2017",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/cMUymzvJL0MeXR7OuuBmR0KGaxZ.jpg",
        "href": "/title/%E7%99%BD%E5%A4%9C%E8%BF%BD%E5%87%B6",
        "highlight": "一张脸活成两个人，白昼审凶，黑夜审己的硬核双生较量"
      },
      {
        "title": "沉默的真相",
        "type": "tv",
        "year": "2020",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/wU5L7mZA0Yy764D1WPP2403d0MG.jpg",
        "href": "/title/%E6%B2%89%E9%BB%98%E7%9A%84%E7%9C%9F%E7%9B%B8",
        "highlight": "赤子之心照亮无边长夜，以生命为筹码的壮烈正义接力"
      },
      {
        "title": "隐秘的角落",
        "type": "tv",
        "year": "2020",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/zlaml7IKAIPa3NJE9LhRveELD0v.jpg",
        "href": "/title/%E9%9A%90%E7%A7%98%E7%9A%84%E8%A7%92%E8%90%BD",
        "highlight": "相机镜头无意记录的坠崖谋杀，撕开少年与成人的隐秘深渊"
      }
    ],
    "createdAt": "2026-09-22T20:07:09.382Z",
    "updatedAt": "2026-09-22T20:07:09.383Z"
  },
  "healing-warm-movies": {
    "slug": "healing-warm-movies",
    "topicTitle": "周末沙发治愈片单：让疲惫心灵慢慢回暖的高分影视",
    "metaTitle": "周末沙发治愈片单：让疲惫心灵慢慢回暖的高分影视 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "当一周的忙碌耗尽情绪，周末最需要的未必是强刺激，而是一段能让呼吸慢下来、重新感受生活温度的影像时光。这份片单从辽阔自然、日常善意与普通人的彼此守护出发，精选三部气质不同却同样真诚的作品。《我的阿勒泰》用草原、雪山和质朴人情抚平焦虑，让人找回与自我及世界相处的松弛感；《万物既伟大又。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "当一周的忙碌耗尽情绪，周末最需要的未必是强刺激，而是一段能让呼吸慢下来、重新感受生活温度的影像时光。这份片单从辽阔自然、日常善意与普通人的彼此守护出发，精选三部气质不同却同样真诚的作品。《我的阿勒泰》用草原、雪山和质朴人情抚平焦虑，让人找回与自我及世界相处的松弛感；《万物既伟大又渺小》第7季延续英伦乡野中的动物故事，以幽默、体面和细碎温情提供稳定慰藉；《我不是药神》虽然触及疾病与现实困境，却在沉重之中照见勇气、尊严和陌生人之间的善意。它们不回避生活的褶皱，也不刻意制造廉价煽情，而是提醒我们：治愈并非忘掉疲惫，而是在真实人生里重新发现值得珍惜的人、风景与微小希望。适合泡一杯热饮，窝进沙发，留出一个不被打扰的周末慢慢观看。",
    "longTailKeywords": [
      "周末治愈系高分影视",
      "温暖治愈电视剧推荐",
      "适合窝在沙发看的剧",
      "治愈疲惫心灵的电影"
    ],
    "intentFamily": "温情治愈 · 周末解压",
    "titles": [
      {
        "title": "我的阿勒泰",
        "type": "tv",
        "year": "2024",
        "rate": "8.9",
        "cover": "https://image.tmdb.org/t/p/w500/pBXwnHGkTlIAzTaDdUpYK5Olj3p.jpg",
        "href": "/title/我的阿勒泰",
        "highlight": "旷野清风拂去现代焦虑，在辽阔天地间找回生活的呼吸感"
      },
      {
        "title": "我不是药神",
        "type": "movie",
        "year": "2018",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/qrhEWQjR3AyMbyy5l3vFuwA576W.jpg",
        "href": "/title/%E6%88%91%E4%B8%8D%E6%98%AF%E8%8D%AF%E7%A5%9E",
        "highlight": "小人物的良知觉醒与生命守望，笑着流泪的平民史诗"
      },
      {
        "title": "万物既伟大又渺小第7季",
        "type": "tv",
        "year": "2026",
        "rate": "9.3",
        "cover": "https://image.tmdb.org/t/p/w500/26q9nXwRbHP2LE1NcMUZ8cB7Mjp.jpg",
        "href": "/title/万物既伟大又渺小第7季",
        "highlight": "约克郡乡村的田园牧歌，医治生灵亦温柔抚慰人间"
      }
    ],
    "createdAt": "2026-09-22T20:07:31.099Z",
    "updatedAt": "2026-09-22T20:07:31.099Z"
  },
  "hardcore-sci-fi-masterpieces": {
    "slug": "hardcore-sci-fi-masterpieces",
    "topicTitle": "震撼心魄的一生必看硬核科幻史诗：国产科幻巅峰大片排行榜",
    "metaTitle": "震撼心魄的一生必看硬核科幻史诗：国产科幻巅峰大片排行榜 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "真正值得一生反复观看的硬核科幻，不只依靠宏大特效制造奇观，更要用严谨设定追问文明存亡、技术伦理与人类命运。这个专题从现有片库中精选《三体》与《流浪地球2》：前者以跨越时代的宇宙谜局、黑暗森林式生存危机和思想实验，呈现人类第一次直面高等文明时的恐惧与分裂；后者则把太阳危机、行星发动。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "真正值得一生反复观看的硬核科幻，不只依靠宏大特效制造奇观，更要用严谨设定追问文明存亡、技术伦理与人类命运。这个专题从现有片库中精选《三体》与《流浪地球2》：前者以跨越时代的宇宙谜局、黑暗森林式生存危机和思想实验，呈现人类第一次直面高等文明时的恐惧与分裂；后者则把太阳危机、行星发动机、数字生命和全球协作熔铸成一场工业级视听史诗。它们一个从寂静星空向内审视人性，一个以末日倒计时向外拓展家园边界，共同代表国产科幻从概念想象走向系统化世界建构的重要高度。无论你偏爱烧脑理论、文明博弈，还是灾难场面、机械奇观与悲壮群像，这份片单都能提供震撼心魄且富有余韵的观影体验。建议先看《三体》理解宇宙尺度下的生存法则，再看《流浪地球2》感受全人类背负地球远征的磅礴浪漫。",
    "longTailKeywords": [
      "一生必看的硬核科幻大片",
      "震撼心魄科幻史诗排行榜",
      "国产高分科幻电影电视剧",
      "三体流浪地球2片单推荐"
    ],
    "intentFamily": "科幻史诗 · 终极宇宙",
    "titles": [
      {
        "title": "三体",
        "type": "tv",
        "year": "2023",
        "rate": "8.7",
        "cover": "https://image.tmdb.org/t/p/w500/q2sNliRi4j0ncXKUO1x0MldR20A.jpg",
        "href": "/title/%E4%B8%89%E4%BD%93",
        "highlight": "当宇宙为人类闪烁，两个文明跨越四光年的生死博弈"
      },
      {
        "title": "流浪地球2",
        "type": "movie",
        "year": "2023",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg",
        "href": "/title/%E6%B5%81%E6%B5%AA%E5%9C%B0%E7%90%832",
        "highlight": "带着地球去流浪的终极浪漫，中国科幻电影工业的封神坐标"
      },
      {
        "title": "开端",
        "type": "tv",
        "year": "2022",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/3vbovxhpmrHbz3Ot9AhzLziaxTO.jpg",
        "href": "/title/%E5%BC%80%E7%AB%AF",
        "highlight": "公交车上的爆炸时间循环，每一次苏醒都是对命运的竭力阻击"
      }
    ],
    "createdAt": "2026-09-22T20:07:51.151Z",
    "updatedAt": "2026-09-22T20:07:51.151Z"
  },
  "epic-dynasty-power-struggles": {
    "slug": "epic-dynasty-power-struggles",
    "topicTitle": "步步皆局，落子定江山：顶级古装权谋巅峰大戏精选",
    "metaTitle": "步步皆局，落子定江山：顶级古装权谋巅峰大戏精选 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "真正令人拍案叫绝的古装权谋剧，从不只靠帝王将相的口舌交锋，而是让身份、制度、人心与利益彼此牵制，使每一次试探都可能改写全局。本专题从候选片库中精选三部兼具谋略密度、人物锋芒与历史质感的作品：《庆余年 第二季》将朝堂博弈推向更深处，范闲在皇权、家族和理想之间步步破局；《唐朝诡事录之。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "真正令人拍案叫绝的古装权谋剧，从不只靠帝王将相的口舌交锋，而是让身份、制度、人心与利益彼此牵制，使每一次试探都可能改写全局。本专题从候选片库中精选三部兼具谋略密度、人物锋芒与历史质感的作品：《庆余年 第二季》将朝堂博弈推向更深处，范闲在皇权、家族和理想之间步步破局；《唐朝诡事录之西行》借奇案透视盛唐地方治理与官场暗流，在诡谲氛围中展开多方角力；《莲花楼》则以江湖探案包裹旧案迷局，呈现门派、朝堂与个人宿命的隐秘牵连。它们并非传统历史正剧，却都擅长用层层伏笔、立场反转和高智商对决制造沉浸感。若你偏爱聪明人过招、台词暗藏机锋、人物在绝境中借势翻盘，这份片单正适合连续追看。",
    "longTailKeywords": [
      "好看的古装权谋剧推荐",
      "高智商朝堂争斗电视剧",
      "顶级权谋历史大剧",
      "反转烧脑古装剧"
    ],
    "intentFamily": "权谋争霸 · 古装巅峰",
    "titles": [
      {
        "title": "庆余年 第二季",
        "type": "tv",
        "year": "2024",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/zp6xQY6erziGoqqQ4L7sfDMjzCY.jpg",
        "href": "/title/庆余年 第二季",
        "highlight": "一场假死骗过天下敌人，朝堂深宫棋局杀机四伏"
      },
      {
        "title": "唐朝诡事录之西行",
        "type": "tv",
        "year": "2024",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/mXb1lfYoh3IYbiCRRH8C5rDZ9XQ.jpg",
        "href": "/title/唐朝诡事录之西行",
        "highlight": "盛唐奇幻诡谲的边关异域，卢凌风与苏无名屡破惊天妖案"
      },
      {
        "title": "莲花楼",
        "type": "tv",
        "year": "2023",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/h8DteNYVPnGn6ZgCjIlQXW5KFUb.jpg",
        "href": "/title/%E8%8E%B2%E8%8A%B1%E6%A5%BC",
        "highlight": "一代剑神化身游医的江湖告别录，放下执念的东方武侠至高意境"
      }
    ],
    "createdAt": "2026-09-22T20:08:16.430Z",
    "updatedAt": "2026-09-22T20:08:16.431Z"
  },
  "hongkong-gangster-golden-age": {
    "slug": "hongkong-gangster-golden-age",
    "topicTitle": "双雄对决与血性江湖：香港动作警匪犯罪黄金时代精选",
    "metaTitle": "双雄对决与血性江湖：香港动作警匪犯罪黄金时代精选 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "香港动作警匪片最迷人的，从来不只是枪火、拳脚与街头追逐，而是两个强者在身份、道义和命运夹缝中的正面碰撞。本专题以“双雄对决”与“血性江湖”为线索，精选三部兼具类型力度和人物悲剧性的作品。《无间道》用警匪卧底的镜像结构，将忠诚与背叛推向心理悬崖；《九龙城寨之围城》以逼仄城寨、硬桥硬。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "香港动作警匪片最迷人的，从来不只是枪火、拳脚与街头追逐，而是两个强者在身份、道义和命运夹缝中的正面碰撞。本专题以“双雄对决”与“血性江湖”为线索，精选三部兼具类型力度和人物悲剧性的作品。《无间道》用警匪卧底的镜像结构，将忠诚与背叛推向心理悬崖；《九龙城寨之围城》以逼仄城寨、硬桥硬马和兄弟情义，重燃港产动作片的黄金年代气血；《周处除三害》虽出自台湾，却以凶悍暴力、黑色宿命和孤胆反杀，延续华语犯罪电影的江湖精神。它们既有高手狭路相逢的压迫感，也有人物面对规则、欲望与死亡时的艰难选择。无论你怀念港片鼎盛期的凌厉节奏，还是偏爱善恶模糊、角色互为倒影的犯罪叙事，这份片单都能带你重新进入那个刀锋见血、情义见真的银幕江湖。",
    "longTailKeywords": [
      "香港双雄警匪电影推荐",
      "经典港产动作犯罪片",
      "血性江湖电影片单",
      "无间道同类型电影"
    ],
    "intentFamily": "香港动作 · 警匪双雄",
    "titles": [
      {
        "title": "无间道",
        "type": "movie",
        "year": "2002",
        "rate": "9.3",
        "cover": "https://image.tmdb.org/t/p/w500/Apy624adTXc4prITxtcVbEdUPUm.jpg",
        "href": "/title/%E6%97%A0%E9%97%B4%E9%81%93",
        "highlight": "对不起我是警察，天台对决铸就香港影史永恒经典"
      },
      {
        "title": "周处除三害",
        "type": "movie",
        "year": "2023",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg",
        "href": "/title/周处除三害",
        "highlight": "绝症狂徒礼堂枪决邪教徒，荒诞暴烈的人性救赎与反思"
      },
      {
        "title": "九龙城寨之围城",
        "type": "movie",
        "year": "2024",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/dS8C60iEHnuZEFgKFjRx0GCLVRf.jpg",
        "href": "/title/九龙城寨之围城",
        "highlight": "拳拳到肉的硬派格斗美学，重温香港黄金时代的热血与江湖信义"
      }
    ],
    "createdAt": "2026-09-22T20:08:37.799Z",
    "updatedAt": "2026-09-22T20:08:37.799Z"
  },
  "modern-era-shanghai-saga": {
    "slug": "modern-era-shanghai-saga",
    "topicTitle": "时代浪潮中的欲望与宿命：刻进岁月骨髓的高分年代传奇《繁花》",
    "metaTitle": "时代浪潮中的欲望与宿命：刻进岁月骨髓的高分年代传奇《繁花》 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "当个人欲望撞上时代巨变，命运便不再只是私人选择，而会成为一代人的共同烙印。《繁花》以九十年代上海为舞台，从阿宝蜕变为宝总的浮沉切入，将商业竞争、情感纠葛与城市变迁编织成一幅流光溢彩又暗藏锋芒的时代画卷。它真正迷人的地方，不只在于霓虹、华服与觥筹交错营造出的繁盛气象，更在于繁华背后。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "当个人欲望撞上时代巨变，命运便不再只是私人选择，而会成为一代人的共同烙印。《繁花》以九十年代上海为舞台，从阿宝蜕变为宝总的浮沉切入，将商业竞争、情感纠葛与城市变迁编织成一幅流光溢彩又暗藏锋芒的时代画卷。它真正迷人的地方，不只在于霓虹、华服与觥筹交错营造出的繁盛气象，更在于繁华背后那些无法明说的野心、遗憾、情义和代价。黄河路上的每次相逢与离散，既是人物命运的转折，也是市场浪潮裹挟普通人的缩影。王家卫式光影赋予往事朦胧诗意，密集的人物关系和商战起伏则让故事始终保有强烈张力。有人借风而起，有人困于执念，有人在爱与利益之间反复取舍；最终留下的，是盛景散去后仍刻在岁月深处的人情冷暖。若你想寻找一部兼具年代质感、命运厚度与审美高度的传奇大戏，《繁花》值得反复品味。",
    "longTailKeywords": [
      "高分年代传奇大戏",
      "时代巨变下的欲望与宿命",
      "繁花电视剧推荐",
      "上海商战年代剧"
    ],
    "intentFamily": "年代传奇 · 时代史诗",
    "titles": [
      {
        "title": "繁花",
        "type": "tv",
        "year": "2023",
        "rate": "8.7",
        "cover": "https://image.tmdb.org/t/p/w500/rV1owsdKtXytJ5eFMOOVTze3mrk.jpg",
        "href": "/title/繁花",
        "highlight": "霓虹照亮黄河路，也照出每个人的价码与时代挽歌"
      }
    ],
    "createdAt": "2026-09-22T20:08:59.399Z",
    "updatedAt": "2026-09-22T20:08:59.399Z"
  },
  "stephen-chow-classic-comedies": {
    "slug": "stephen-chow-classic-comedies",
    "topicTitle": "笑出眼泪的周星驰无厘头巅峰：三部百看不厌的喜剧神作",
    "metaTitle": "笑出眼泪的周星驰无厘头巅峰：三部百看不厌的喜剧神作 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "如果你正在寻找真正能让人笑到停不下来、笑完又有些鼻酸的周星驰电影，这份片单就是一次浓缩的无厘头喜剧巡礼。精选的三部作品横跨奇幻爱情、热血运动与武侠功夫，不仅汇集错位对白、夸张动作、草根逆袭和一本正经胡说八道等标志性元素，也藏着周星驰电影最动人的底色：小人物即使被现实反复击倒，依然。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "如果你正在寻找真正能让人笑到停不下来、笑完又有些鼻酸的周星驰电影，这份片单就是一次浓缩的无厘头喜剧巡礼。精选的三部作品横跨奇幻爱情、热血运动与武侠功夫，不仅汇集错位对白、夸张动作、草根逆袭和一本正经胡说八道等标志性元素，也藏着周星驰电影最动人的底色：小人物即使被现实反复击倒，依然可以守住梦想、尊严与爱情。《大话西游之月光宝盒》用时空错位铺开宿命悲喜，让年少时听见笑声、成年后读懂遗憾；《少林足球》把失意人生拍成燃爆全场的梦想童话；《功夫》则以成熟的视觉奇观和传统武侠情怀，将无厘头推向兼具商业娱乐与作者表达的高峰。它们的笑点密集却不廉价，荒诞背后始终有人情温度，即使重看多次，仍会在熟悉的台词、配乐与名场面里发现新的感动。",
    "longTailKeywords": [
      "周星驰无厘头喜剧",
      "让人笑出眼泪的电影",
      "周星驰巅峰神作",
      "经典港式喜剧推荐"
    ],
    "intentFamily": "星爷经典 · 无厘头巅峰",
    "titles": [
      {
        "title": "功夫",
        "type": "movie",
        "year": "2004",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/wv91QM70K9KzF9usPOebYX3LKkp.jpg",
        "href": "/title/功夫",
        "highlight": "周星驰集大成之作，小人物化蝶与至高武学哲学的东方神话"
      },
      {
        "title": "少林足球",
        "type": "movie",
        "year": "2001",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/rwfeeT02j1z5SBgJOH2eOwNCNQO.jpg",
        "href": "/title/少林足球",
        "highlight": "做人如果没有梦想，跟咸鱼有什么分别？笑泪交织的热血逆袭"
      },
      {
        "title": "大话西游之月光宝盒",
        "type": "movie",
        "year": "1995",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/rwyZUFkjmpK9sxorXgjdIG0iuYm.jpg",
        "href": "/title/大话西游之月光宝盒",
        "highlight": "命运的齿轮从戴上金箍开始，爱一个人原来可以这般痛苦又壮烈"
      }
    ],
    "createdAt": "2026-09-22T20:14:21.412Z",
    "updatedAt": "2026-09-22T20:14:21.413Z"
  },
  "high-score-laughter-relax-comedies": {
    "slug": "high-score-laughter-relax-comedies",
    "topicTitle": "全程高能笑到腹肌痛：三部无尿点爆笑解压喜剧大片",
    "metaTitle": "全程高能笑到腹肌痛：三部无尿点爆笑解压喜剧大片 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "生活压力拉满，只想找一部不用费脑、打开就能笑的电影？这份片单精选三部兼具密集笑点、荒诞设定与现实共鸣的国产喜剧，让你从开场一路笑到片尾。《抓娃娃》把“反向富养”变成大型家庭实验，在教育焦虑与身份错位中持续制造反差；《夏洛特烦恼》用一场梦重启失败人生，将青春遗憾、怀旧金曲和爆梗巧妙。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "生活压力拉满，只想找一部不用费脑、打开就能笑的电影？这份片单精选三部兼具密集笑点、荒诞设定与现实共鸣的国产喜剧，让你从开场一路笑到片尾。《抓娃娃》把“反向富养”变成大型家庭实验，在教育焦虑与身份错位中持续制造反差；《夏洛特烦恼》用一场梦重启失败人生，将青春遗憾、怀旧金曲和爆梗巧妙串联；《疯狂的石头》则凭多线叙事、方言喜感与阴差阳错的连环碰撞，奉上节奏精准的黑色幽默。它们不只靠段子堆砌，更擅长用小人物的欲望、窘境和误会引爆笑声。无论是周末宅家、朋友聚会，还是情绪低落急需回血，这三部作品都能提供门槛极低、后劲十足的快乐体验。准备好零食，暂时放下烦恼，开启一场笑到腹肌发酸的解压马拉松。",
    "longTailKeywords": [
      "全程高能无尿点喜剧电影",
      "笑到腹肌痛的爆笑电影",
      "国产爆笑解压喜剧大片",
      "适合心情不好看的喜剧"
    ],
    "intentFamily": "爆笑解压 · 下饭神作",
    "titles": [
      {
        "title": "抓娃娃",
        "type": "movie",
        "year": "2024",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/dXjYk7fnA6HNqhJHTnmeD6rV4Aw.jpg",
        "href": "/title/抓娃娃",
        "highlight": "沈腾马丽神仙合体，豪门装穷穷养儿子的荒诞教育讽刺"
      },
      {
        "title": "夏洛特烦恼",
        "type": "movie",
        "year": "2015",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/zaDitWyV81WOg2tiujj6kxEFYtZ.jpg",
        "href": "/title/夏洛特烦恼",
        "highlight": "重回十八岁偷走所有巨星金曲，繁华梦醒才懂一碗茴香面的温度"
      },
      {
        "title": "疯狂的石头",
        "type": "movie",
        "year": "2006",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/4NVNv2sQKZKb1HtGExUqp3Ukd7f.jpg",
        "href": "/title/疯狂的石头",
        "highlight": "多线叙事国产盖·里奇黑色幽默开山鼻祖，巧合环环相扣绝无冷场"
      }
    ],
    "createdAt": "2026-09-22T20:14:42.090Z",
    "updatedAt": "2026-09-22T20:14:42.091Z"
  },
  "douban-top-unmissable-classics": {
    "slug": "douban-top-unmissable-classics",
    "topicTitle": "豆瓣9分以上一生必看：殿堂级华语电影高分榜",
    "metaTitle": "豆瓣9分以上一生必看：殿堂级华语电影高分榜 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "当一部华语电影跨越多年仍稳居豆瓣9分阵营，它所依靠的往往不只是精巧的故事，更是经得起时代检验的人物、表演与现实关怀。本专题从候选片库中精选《霸王别姬》《无间道》《我不是药神》三部代表作：前者借半世纪风云书写戏梦人生，以极致美学凝视身份、情感与命运；《无间道》用双重卧底结构重塑香港。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "当一部华语电影跨越多年仍稳居豆瓣9分阵营，它所依靠的往往不只是精巧的故事，更是经得起时代检验的人物、表演与现实关怀。本专题从候选片库中精选《霸王别姬》《无间道》《我不是药神》三部代表作：前者借半世纪风云书写戏梦人生，以极致美学凝视身份、情感与命运；《无间道》用双重卧底结构重塑香港警匪片，在身份错位与人性挣扎间制造持久张力；《我不是药神》则从普通人的困境出发，让商业类型片兼具笑泪、锐度和社会温度。三部作品横跨历史史诗、犯罪悬疑与现实主义，分别代表华语电影在艺术表达、类型叙事和公共议题上的高峰。所谓“零差评”并非绝对没有争议，而是指它们拥有罕见的广泛口碑与跨代共鸣，值得影迷反复观看、讨论和收藏。",
    "longTailKeywords": [
      "豆瓣9分以上华语电影",
      "一生必看华语电影",
      "零差评国产电影排行榜",
      "殿堂级高分华语电影"
    ],
    "intentFamily": "殿堂经典 · 零差评神作",
    "titles": [
      {
        "title": "霸王别姬",
        "type": "movie",
        "year": "1993",
        "rate": "9.6",
        "cover": "https://image.tmdb.org/t/p/w500/vOEkLofQ8N1OdbGs5L87m7Plpw2.jpg",
        "href": "/title/霸王别姬",
        "highlight": "不疯魔不成活，中国电影史上难以逾越的至高艺术丰碑"
      },
      {
        "title": "无间道",
        "type": "movie",
        "year": "2002",
        "rate": "9.3",
        "cover": "https://image.tmdb.org/t/p/w500/Apy624adTXc4prITxtcVbEdUPUm.jpg",
        "href": "/title/%E6%97%A0%E9%97%B4%E9%81%93",
        "highlight": "给我一个机会，我想做好人。天台对决铸就香港影史永恒经典"
      },
      {
        "title": "我不是药神",
        "type": "movie",
        "year": "2018",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/qrhEWQjR3AyMbyy5l3vFuwA576W.jpg",
        "href": "/title/%E6%88%91%E4%B8%8D%E6%98%AF%E8%8D%AF%E7%A5%9E",
        "highlight": "这世上只有一种病，就是穷病。平凡人的良知点亮沉重现实"
      }
    ],
    "createdAt": "2026-09-22T20:15:02.467Z",
    "updatedAt": "2026-09-22T20:15:02.468Z"
  },
  "real-life-crime-investigation": {
    "slug": "real-life-crime-investigation",
    "topicTitle": "真实大案照进银幕：震撼人心的现实主义犯罪影视精选",
    "metaTitle": "真实大案照进银幕：震撼人心的现实主义犯罪影视精选 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "当犯罪故事与真实社会经验发生连接，最震撼的往往不只是枪火、追凶和反转，而是极端案件背后盘根错节的人性、权力与生存困境。本专题精选具有真实案件原型、社会事件影子或现实犯罪生态基础的华语作品：《狂飙》从多起扫黑除恶案例中提炼素材，以二十年跨度拆解黑恶势力的滋生链条；《周处除三害》借鉴。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "当犯罪故事与真实社会经验发生连接，最震撼的往往不只是枪火、追凶和反转，而是极端案件背后盘根错节的人性、权力与生存困境。本专题精选具有真实案件原型、社会事件影子或现实犯罪生态基础的华语作品：《狂飙》从多起扫黑除恶案例中提炼素材，以二十年跨度拆解黑恶势力的滋生链条；《周处除三害》借鉴真实通缉犯经历，用凌厉暴力与宗教骗局完成一场荒诞的自我审判；《边水往事》虽非对单一大案的直接复刻，却凭借边境灰色产业、人口交易与地下秩序的写实描摹，补足了犯罪世界的社会剖面。三部作品分别从权力腐化、亡命救赎与边地生存切入，既提供高强度类型快感，也追问罪恶如何被环境纵容、普通人又如何在利益和恐惧中失守。适合偏爱真实质感、复杂人性与沉浸式犯罪叙事的观众。",
    "longTailKeywords": [
      "根据真实大案改编的犯罪片",
      "真实案件改编国产影视剧",
      "现实主义扫黑犯罪剧推荐",
      "震撼人心的华语犯罪大片"
    ],
    "intentFamily": "真实大案 · 警世震撼",
    "titles": [
      {
        "title": "周处除三害",
        "type": "movie",
        "year": "2023",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/b5P8eg7u4XgDSYNF6da17CcZy2d.jpg",
        "href": "/title/周处除三害",
        "highlight": "绝症狂徒礼堂枪决洗脑邪教徒，荒诞暴烈的人性救赎与反思"
      },
      {
        "title": "边水往事",
        "type": "tv",
        "year": "2024",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/fhlimtLNQKYdvgArV3aXCiB49RI.jpg",
        "href": "/title/%E8%BE%B9%E6%B0%B4%E5%BE%80%E4%BA%8B",
        "highlight": "真实还原东南亚边境法外雨林利益网，每一步逃生都踏入死局"
      },
      {
        "title": "狂飙",
        "type": "tv",
        "year": "2023",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/xmBmR46Nks73VlTrCsH9i6KCWSH.jpg",
        "href": "/title/%E7%8B%82%E9%A3%99",
        "highlight": "真实扫黑原型深层剖析，二十年政商灰度人情网的起伏与坍塌"
      }
    ],
    "createdAt": "2026-09-22T20:15:24.998Z",
    "updatedAt": "2026-09-22T20:15:24.999Z"
  },
  "jianghu-wuxia-golden-era": {
    "slug": "jianghu-wuxia-golden-era",
    "topicTitle": "徐克式武侠江湖回响：刀光剑影与快意恩仇佳作精选",
    "metaTitle": "徐克式武侠江湖回响：刀光剑影与快意恩仇佳作精选 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "徐克以凌厉剪辑、奇诡想象与浪漫豪情，塑造了华语武侠最具辨识度的银幕江湖。虽然本次候选片单中没有徐克亲自执导的作品，但《莲花楼》与《唐朝诡事录之西行》都延续了这种令人着迷的武侠气韵：前者从天下第一的传奇退隐写起，在连环谜案、故人旧怨与生死抉择之间，重新诠释何为真正的侠者；后者则把盛。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "徐克以凌厉剪辑、奇诡想象与浪漫豪情，塑造了华语武侠最具辨识度的银幕江湖。虽然本次候选片单中没有徐克亲自执导的作品，但《莲花楼》与《唐朝诡事录之西行》都延续了这种令人着迷的武侠气韵：前者从天下第一的传奇退隐写起，在连环谜案、故人旧怨与生死抉择之间，重新诠释何为真正的侠者；后者则把盛唐风物、志怪奇谈和凌厉动作熔于一炉，以西行冒险铺开诡谲壮阔的东方世界。两部作品一雅一奇，一部胜在人物情义与剑客风骨，一部强在视觉想象与群像闯关。它们并非对徐克经典的简单复刻，而是以当代剧集节奏回应那份天马行空、刀剑纵横的武侠精神，适合偏爱快意恩仇、悬案冒险、高手对决和东方奇观的观众连续观看。",
    "longTailKeywords": [
      "徐克武侠风格电视剧",
      "刀光剑影快意恩仇武侠剧",
      "好看的古装探案武侠剧",
      "东方奇幻江湖剧推荐"
    ],
    "intentFamily": "武侠巅峰 · 快意江湖",
    "titles": [
      {
        "title": "莲花楼",
        "type": "tv",
        "year": "2023",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/h8DteNYVPnGn6ZgCjIlQXW5KFUb.jpg",
        "href": "/title/%E8%8E%B2%E8%8A%B1%E6%A5%BC",
        "highlight": "一代剑神化身游医的江湖告别录，放下天下第一的至高意境"
      },
      {
        "title": "唐朝诡事录之西行",
        "type": "tv",
        "year": "2024",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/mXb1lfYoh3IYbiCRRH8C5rDZ9XQ.jpg",
        "href": "/title/唐朝诡事录之西行",
        "highlight": "盛唐奇幻诡谲的边关异域，破案与刀剑齐飞的东方志怪史诗"
      }
    ],
    "createdAt": "2026-09-22T20:15:46.218Z",
    "updatedAt": "2026-09-22T20:15:46.219Z"
  },
  "deep-night-suspense-thrillers": {
    "slug": "deep-night-suspense-thrillers",
    "topicTitle": "深夜关灯必看：高分硬核悬疑与心理惊悚反转神作",
    "metaTitle": "深夜关灯必看：高分硬核悬疑与心理惊悚反转神作 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "当房间彻底安静、屏幕成为唯一光源，真正高级的悬疑剧才会显露出最锋利的一面。本专题专为想独自沉浸、享受推理压力与心理寒意的观众策划，从片库中精选《隐秘的角落》与《白夜追凶》两部国产悬疑标杆。前者借一场意外目击撕开平静小城的阴影，让孩子、家庭与成年人之间的秘密彼此纠缠；童谣、空镜和含。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "当房间彻底安静、屏幕成为唯一光源，真正高级的悬疑剧才会显露出最锋利的一面。本专题专为想独自沉浸、享受推理压力与心理寒意的观众策划，从片库中精选《隐秘的角落》与《白夜追凶》两部国产悬疑标杆。前者借一场意外目击撕开平静小城的阴影，让孩子、家庭与成年人之间的秘密彼此纠缠；童谣、空镜和含蓄留白，更把恐惧藏进看似寻常的日常。后者则以双胞胎身份谜局串联连环案件，在昼夜交替中不断挑战观众对人物真伪与证词可信度的判断。它们不依赖廉价惊吓，而是通过严密叙事、复杂人性、危险博弈和多重反转制造持续压迫感。每一处表情、对白与镜头都可能埋着答案，也可能是精心设计的误导。适合关灯戴耳机连续观看，但请做好在结局之后重新审视全部细节的准备。",
    "longTailKeywords": [
      "一个人深夜看的悬疑剧",
      "高分硬核心理惊悚剧",
      "国产烧脑反转神作",
      "关灯看很刺激的电视剧"
    ],
    "intentFamily": "深夜微恐 · 心理惊悚",
    "titles": [
      {
        "title": "隐秘的角落",
        "type": "tv",
        "year": "2020",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/zlaml7IKAIPa3NJE9LhRveELD0v.jpg",
        "href": "/title/%E9%9A%90%E7%A7%98%E7%9A%84%E8%A7%92%E8%90%BD",
        "highlight": "一起爬山吗？童年日记与残忍谋杀交织，令人后背发凉的心理深渊"
      },
      {
        "title": "白夜追凶",
        "type": "tv",
        "year": "2017",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/cMUymzvJL0MeXR7OuuBmR0KGaxZ.jpg",
        "href": "/title/%E7%99%BD%E5%A4%9C%E8%BF%BD%E5%87%B6",
        "highlight": "暗夜恐惧与双生身份，黑白交替之间的硬核高智商反转"
      }
    ],
    "createdAt": "2026-09-22T20:16:06.300Z",
    "updatedAt": "2026-09-22T20:16:06.301Z"
  },
  "time-travel-multiverse-mindfuck": {
    "slug": "time-travel-multiverse-mindfuck",
    "topicTitle": "时间重启，宇宙分岔：烧脑时空循环与科幻脑洞佳作精选",
    "metaTitle": "时间重启，宇宙分岔：烧脑时空循环与科幻脑洞佳作精选 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "当时间不再沿着直线前进，当现实可能只是无数宇宙分支中的一种选择，科幻作品便成了检验逻辑、想象力与人性的终极试验场。本专题从片库中精选三部兼具大众观赏性和思想密度的华语佳作：既有《开端》将普通人困进爆炸倒计时，用重复与变量搭建严谨的循环谜局；也有《三体》把视野推向文明兴衰和宇宙尺度。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "当时间不再沿着直线前进，当现实可能只是无数宇宙分支中的一种选择，科幻作品便成了检验逻辑、想象力与人性的终极试验场。本专题从片库中精选三部兼具大众观赏性和思想密度的华语佳作：既有《开端》将普通人困进爆炸倒计时，用重复与变量搭建严谨的循环谜局；也有《三体》把视野推向文明兴衰和宇宙尺度，在科学危机背后追问人类如何面对未知；《流浪地球2》则以多线叙事、数字生命和全球危机，呈现另一种关于时间、意识与未来选择的宏大推演。它们并非都以平行宇宙为直接设定，却共同打破单一时空经验：微小决定可能改变结局，技术路线可能分裂未来，个体意志也可能撬动文明命运。无论你偏爱循环解谜、硬核宇宙观，还是末日背景下的哲学思辨，这份片单都值得反复观看、逐层拆解。",
    "longTailKeywords": [
      "烧脑时空循环影视推荐",
      "平行宇宙科幻佳作",
      "国产高分硬科幻片单",
      "类似开端三体的作品"
    ],
    "intentFamily": "时空循环 · 脑洞逆转",
    "titles": [
      {
        "title": "开端",
        "type": "tv",
        "year": "2022",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/3vbovxhpmrHbz3Ot9AhzLziaxTO.jpg",
        "href": "/title/%E5%BC%80%E7%AB%AF",
        "highlight": "公交车上的炸弹与生死循环，每次醒来都在与倒计时博弈"
      },
      {
        "title": "三体",
        "type": "tv",
        "year": "2023",
        "rate": "8.7",
        "cover": "https://image.tmdb.org/t/p/w500/q2sNliRi4j0ncXKUO1x0MldR20A.jpg",
        "href": "/title/%E4%B8%89%E4%BD%93",
        "highlight": "当宇宙为人类闪烁，高维智子锁死科学，人类最后的尊严反扑"
      },
      {
        "title": "流浪地球2",
        "type": "movie",
        "year": "2023",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/cAS2e9hUwu6Ydsx7byXj16H00Ai.jpg",
        "href": "/title/%E6%B5%81%E6%B5%AA%E5%9C%B0%E7%90%832",
        "highlight": "数字生命与行星发动机的终极抉择，五十岁以上出列的悲壮史诗"
      }
    ],
    "createdAt": "2026-09-22T20:16:32.106Z",
    "updatedAt": "2026-09-22T20:16:32.107Z"
  },
  "youth-growth-healing-dramas": {
    "slug": "youth-growth-healing-dramas",
    "topicTitle": "青春有痛，岁月温柔：高分治愈系国产成长剧精选",
    "metaTitle": "青春有痛，岁月温柔：高分治愈系国产成长剧精选 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "成长从来不只是热血、心动与鲜花，也包含离别留下的空洞、家庭难以言说的裂痕，以及被漫长岁月悄悄改变的人生。本专题精选《我的阿勒泰》与《漫长的季节》，从辽阔草原到沉默东北，两部高分剧集以截然不同的地域气质，写下关于青春疼痛、亲情羁绊与自我和解的动人篇章。《我的阿勒泰》清澈明亮，让迷惘。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "成长从来不只是热血、心动与鲜花，也包含离别留下的空洞、家庭难以言说的裂痕，以及被漫长岁月悄悄改变的人生。本专题精选《我的阿勒泰》与《漫长的季节》，从辽阔草原到沉默东北，两部高分剧集以截然不同的地域气质，写下关于青春疼痛、亲情羁绊与自我和解的动人篇章。《我的阿勒泰》清澈明亮，让迷惘的年轻人在自然、劳作和朴素人情中重新认识生活；《漫长的季节》则穿过悬案与时代阵痛，凝视普通人如何背负遗憾继续前行。它们不贩卖廉价鸡汤，也不回避命运的冷峻，而是用克制表演、细腻镜头与充满余韵的叙事告诉我们：真正的治愈并非忘记伤痛，而是在看清生活之后，依然保有爱人的能力与向前走的勇气。适合偏爱慢节奏、强情感和现实质感的观众静心观看。",
    "longTailKeywords": [
      "青春疼痛治愈系国产剧",
      "高分成长剧集推荐",
      "温柔治愈的现实主义电视剧",
      "我的阿勒泰漫长的季节类似剧"
    ],
    "intentFamily": "青春慢调 · 岁月治愈",
    "titles": [
      {
        "title": "我的阿勒泰",
        "type": "tv",
        "year": "2024",
        "rate": "8.9",
        "cover": "https://image.tmdb.org/t/p/w500/pBXwnHGkTlIAzTaDdUpYK5Olj3p.jpg",
        "href": "/title/我的阿勒泰",
        "highlight": "旷野清风吹散一切焦虑，在大地怀抱中找回生命的原始诗意"
      },
      {
        "title": "漫长的季节",
        "type": "tv",
        "year": "2023",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/tJLiKDYdfMskFkJXV1HnaQAdpGf.jpg",
        "href": "/title/%E6%BC%AB%E9%95%BF%E7%9A%84%E5%AD%A3%E8%8A%82",
        "highlight": "往前走，别回头。岁月虽然残酷，但温情与回忆永远滚烫"
      }
    ],
    "createdAt": "2026-09-22T20:16:53.486Z",
    "updatedAt": "2026-09-22T20:16:53.487Z"
  },
  "courtroom-justice-legal-battles": {
    "slug": "courtroom-justice-legal-battles",
    "topicTitle": "唇枪舌剑与正义较量：华语律政悬疑高分大戏",
    "metaTitle": "唇枪舌剑与正义较量：华语律政悬疑高分大戏 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "真正有力量的律政故事，不只靠法庭上的慷慨陈词，更在于证据如何被发现、真相如何被证明，以及司法工作者愿意为正义付出怎样的代价。面对“顶级华语律政法庭辩护大戏”这一搜索需求，本专题从候选片库中严格筛选出《沉默的真相》：它虽非传统意义上庭审密集的律师剧，却把检察体系、案件复查、证据链构。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "真正有力量的律政故事，不只靠法庭上的慷慨陈词，更在于证据如何被发现、真相如何被证明，以及司法工作者愿意为正义付出怎样的代价。面对“顶级华语律政法庭辩护大戏”这一搜索需求，本专题从候选片库中严格筛选出《沉默的真相》：它虽非传统意义上庭审密集的律师剧，却把检察体系、案件复查、证据链构建与程序正义拍出了罕见的厚度。故事从一桩看似证据确凿的案件切入，逐步揭开横跨多年的冤屈与权力阻碍；每一次询问、推演和证据交锋，都像一场发生在法庭之外的无声辩论。观众看到的不仅是高智商破局，更是法律人在现实压力下对职业信念的坚守。如果你偏爱逻辑严密、人物克制、反转服务于真相，并希望作品能够追问“正义需要付出什么”，这部剧正是华语司法题材中不可绕过的沉重佳作。",
    "longTailKeywords": [
      "好看的华语律政剧",
      "高分法庭辩护电视剧",
      "司法正义悬疑剧推荐",
      "检察官查案国产剧"
    ],
    "intentFamily": "律政交锋 · 司法人性",
    "titles": [
      {
        "title": "沉默的真相",
        "type": "tv",
        "year": "2020",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/wU5L7mZA0Yy764D1WPP2403d0MG.jpg",
        "href": "/title/%E6%B2%89%E9%BB%98%E7%9A%84%E7%9C%9F%E7%9B%B8",
        "highlight": "江阳以身殉道，在无边长夜里点燃程序正义的耀眼光芒"
      },
      {
        "title": "白夜追凶",
        "type": "tv",
        "year": "2017",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/cMUymzvJL0MeXR7OuuBmR0KGaxZ.jpg",
        "href": "/title/%E7%99%BD%E5%A4%9C%E8%BF%BD%E5%87%B6",
        "highlight": "白昼审凶黑夜审己，法理与兄弟情义最极端的撕扯"
      }
    ],
    "createdAt": "2026-09-22T20:17:17.197Z",
    "updatedAt": "2026-09-22T20:17:17.198Z"
  },
  "contemporary-realistic-family-dramas": {
    "slug": "contemporary-realistic-family-dramas",
    "topicTitle": "烟火人间与代际羁绊：时代洪流中的现实主义家庭史诗",
    "metaTitle": "烟火人间与代际羁绊：时代洪流中的现实主义家庭史诗 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "真正动人的家庭史诗，从不只讲一家人的聚散悲欢，更借一张饭桌、一座工厂、几条旧街，照见时代如何改变普通人的命运。《繁花》与《漫长的季节》恰是两种气质迥异却彼此映照的现实主义佳作：前者置身九十年代上海，在流光溢彩的生意场与市井弄堂间，书写个人欲望、情感债务和城市变迁；后者回望东北工业。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "真正动人的家庭史诗，从不只讲一家人的聚散悲欢，更借一张饭桌、一座工厂、几条旧街，照见时代如何改变普通人的命运。《繁花》与《漫长的季节》恰是两种气质迥异却彼此映照的现实主义佳作：前者置身九十年代上海，在流光溢彩的生意场与市井弄堂间，书写个人欲望、情感债务和城市变迁；后者回望东北工业城镇，以一桩横跨多年的悬案，剖开下岗潮、家庭创伤与迟来的和解。它们没有把亲情简化为温暖慰藉，而是直面父辈的沉默、伴侣的亏欠、朋友的离散，以及代际之间难以言说的理解与误解。精密的群像塑造、富有地域质感的生活细节和跨越岁月的叙事结构，让宏大历史落到每一次选择、每一顿家常饭与每一个未能告别的人身上。若你想看兼具文学厚度、烟火气息与命运余韵的国产大剧，这两部作品值得并置观看。",
    "longTailKeywords": [
      "现实主义家庭史诗国产剧",
      "讲代际羁绊的年代剧",
      "有烟火气的高分国产剧",
      "时代变迁群像剧推荐"
    ],
    "intentFamily": "烟火人间 · 现实史诗",
    "titles": [
      {
        "title": "繁花",
        "type": "tv",
        "year": "2023",
        "rate": "8.7",
        "cover": "https://image.tmdb.org/t/p/w500/rV1owsdKtXytJ5eFMOOVTze3mrk.jpg",
        "href": "/title/繁花",
        "highlight": "大时代浪潮下普通人的欲望、尊严与命运羁绊"
      },
      {
        "title": "漫长的季节",
        "type": "tv",
        "year": "2023",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/tJLiKDYdfMskFkJXV1HnaQAdpGf.jpg",
        "href": "/title/%E6%BC%AB%E9%95%BF%E7%9A%84%E5%AD%A3%E8%8A%82",
        "highlight": "老东北下岗潮下的父子与家庭，笑泪交织的时代挽歌"
      }
    ],
    "createdAt": "2026-09-22T20:17:37.826Z",
    "updatedAt": "2026-09-22T20:17:37.827Z"
  },
  "spy-war-undercover-legends": {
    "slug": "spy-war-undercover-legends",
    "topicTitle": "暗夜潜伏与信仰对决：中国谍战剧巅峰之作",
    "metaTitle": "暗夜潜伏与信仰对决：中国谍战剧巅峰之作 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "真正顶级的中国谍战剧，从来不只比拼密码、枪战与身份反转，更把人物置于信仰、情感和生死交错的暗夜之中。本专题精选《潜伏》与《风筝》两部公认标杆：前者以克制幽默的叙事和精密紧凑的布局，将办公室政治、夫妻伪装与隐秘战线巧妙熔于一炉；后者则用更漫长、更冷峻的时间跨度，追问潜伏者如何背负误。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "真正顶级的中国谍战剧，从来不只比拼密码、枪战与身份反转，更把人物置于信仰、情感和生死交错的暗夜之中。本专题精选《潜伏》与《风筝》两部公认标杆：前者以克制幽默的叙事和精密紧凑的布局，将办公室政治、夫妻伪装与隐秘战线巧妙熔于一炉；后者则用更漫长、更冷峻的时间跨度，追问潜伏者如何背负误解、牺牲亲情，并在身份撕裂中守住初心。余则成与郑耀先并非无所不能的传奇英雄，他们的每一次判断，都可能以战友、爱人乃至自身命运为代价。两部作品一明一暗、一巧一沉，共同抵达谍战类型最动人的核心：较量的不只是情报与谋略，更是人在孤独、怀疑和诱惑面前对信仰的最终选择。若你想寻找逻辑扎实、人物复杂、余味深长且值得反复重看的国产谍战剧，这份双片单就是绕不开的巅峰入口。",
    "longTailKeywords": [
      "中国谍战剧巅峰之作",
      "好看的潜伏特工电视剧",
      "信仰对决国产谍战剧",
      "风筝潜伏哪部更好看"
    ],
    "intentFamily": "暗夜信仰 · 谍战巅峰",
    "titles": [
      {
        "title": "风筝",
        "type": "tv",
        "year": "2017",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/vYJ3aaGMXWLdO8MxPdaHSH8hwUJ.jpg",
        "href": "/title/风筝",
        "highlight": "谍战剧封神之作，比死亡更残酷的是隐姓埋名与信仰坚守"
      },
      {
        "title": "潜伏",
        "type": "tv",
        "year": "2009",
        "rate": "9.4",
        "cover": "https://image.tmdb.org/t/p/w500/wsRFwiNKAoD28NhqHIQLUeTqU3X.jpg",
        "href": "/title/潜伏",
        "highlight": "余则成与翠平，办公室政治与生死潜伏的最完美融合"
      }
    ],
    "createdAt": "2026-09-22T20:17:57.373Z",
    "updatedAt": "2026-09-22T20:17:57.375Z"
  },
  "legendary-dynasty-historical-epics": {
    "slug": "legendary-dynasty-historical-epics",
    "topicTitle": "正气磅礴、考据严密：古装历史权谋正剧大戏精选榜",
    "metaTitle": "正气磅礴、考据严密：古装历史权谋正剧大戏精选榜 - 4K超清完整版免费在线看 | iKanPP",
    "metaDescription": "真正耐看的古装权谋大戏，不只靠朝堂争斗与密集反转，更要让礼制、官署、律法、人情和天下观共同构成可信的时代肌理。本专题从有限片库中精选《庆余年 第二季》与《唐朝诡事录之西行》：前者虽为架空历史，却以科举舞弊、财政制度、监察体系和君臣博弈搭建出层次分明的政治棋局，在诙谐叙事之下追问公。iKanPP 汇聚全网高分好剧，支持 4K 原生画质纯直连秒播。",
    "curatorNote": "真正耐看的古装权谋大戏，不只靠朝堂争斗与密集反转，更要让礼制、官署、律法、人情和天下观共同构成可信的时代肌理。本专题从有限片库中精选《庆余年 第二季》与《唐朝诡事录之西行》：前者虽为架空历史，却以科举舞弊、财政制度、监察体系和君臣博弈搭建出层次分明的政治棋局，在诙谐叙事之下追问公平与权力边界；后者则借盛唐西行奇案铺展州县治理、驿路风貌、民间信仰与官场生态，以探案照见秩序和人心。两部作品并非传统意义上的历史复刻正剧，但在服化道质感、制度逻辑、家国立场与人物风骨方面各有扎实表达。若你偏爱庙堂机锋、群像交锋和理想主义，可首选《庆余年 第二季》；若更看重唐风考据、地方奇案与正邪对决，《唐朝诡事录之西行》更值得追看。",
    "longTailKeywords": [
      "古装历史权谋正剧排行榜",
      "正气磅礴的国产古装剧",
      "考据严密的历史剧推荐",
      "高质量朝堂权谋剧"
    ],
    "intentFamily": "历史正剧 · 盛世风骨",
    "titles": [
      {
        "title": "庆余年 第二季",
        "type": "tv",
        "year": "2024",
        "rate": "7.3",
        "cover": "https://image.tmdb.org/t/p/w500/zp6xQY6erziGoqqQ4L7sfDMjzCY.jpg",
        "href": "/title/庆余年 第二季",
        "highlight": "假死还生与朝堂洗牌，帝王心术与公道理想的激烈碰撞"
      },
      {
        "title": "唐朝诡事录之西行",
        "type": "tv",
        "year": "2024",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/mXb1lfYoh3IYbiCRRH8C5rDZ9XQ.jpg",
        "href": "/title/唐朝诡事录之西行",
        "highlight": "盛唐边关异域奇案，还原考据扎实的华丽盛世风骨"
      }
    ],
    "createdAt": "2026-09-22T20:18:18.440Z",
    "updatedAt": "2026-09-22T20:18:18.442Z"
  }
};
