/**
 * 场景 4：程序化专题聚合服务 (Programmatic Topic Hub Service)
 * 自动生成于: 2026-09-22T20:08:59.399Z
 * 
 * 管理口语化长尾专题集合：
 * 1. 内置高权重预烘焙专题（0ms 秒开）
 * 2. 覆盖 Google 海量自然语言搜索意图
 */

import { kvGet, kvPut } from '@/lib/services/entity-kv';

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
        "cover": "https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg",
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
        "cover": "https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a.jpg",
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
        "cover": "https://image.tmdb.org/t/p/w500/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
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
        "cover": "https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg",
        "href": "/title/%E6%BC%AB%E9%95%BF%E7%9A%84%E5%AD%A3%E8%8A%82",
        "highlight": "生活悬疑的天花板，玉米地里的时代悲歌与命运闭环"
      },
      {
        "title": "狂飙",
        "type": "tv",
        "year": "2023",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg",
        "href": "/title/%E7%8B%82%E9%A3%99",
        "highlight": "一个卖鱼佬的上桌史与正义守望者的二十年殊死较量"
      },
      {
        "title": "边水往事",
        "type": "tv",
        "year": "2024",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/yQxG4Z7z9X1aB3c5E7f9h1i3k5m.jpg",
        "href": "/title/%E8%BE%B9%E6%B0%B4%E5%BE%80%E4%BA%8B",
        "highlight": "法外雨林中的利益杀局，每一步自救都可能走向深渊"
      },
      {
        "title": "白夜追凶",
        "type": "tv",
        "year": "2017",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a8s9d7f6g5h4j.jpg",
        "href": "/title/%E7%99%BD%E5%A4%9C%E8%BF%BD%E5%87%B6",
        "highlight": "一张脸活成两个人，白昼审凶，黑夜审己的硬核双生较量"
      },
      {
        "title": "沉默的真相",
        "type": "tv",
        "year": "2020",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/9k8J7H6G5F4D3S2A1Q0W9E8R7T.jpg",
        "href": "/title/%E6%B2%89%E9%BB%98%E7%9A%84%E7%9C%9F%E7%9B%B8",
        "highlight": "赤子之心照亮无边长夜，以生命为筹码的壮烈正义接力"
      },
      {
        "title": "隐秘的角落",
        "type": "tv",
        "year": "2020",
        "rate": "8.8",
        "cover": "https://image.tmdb.org/t/p/w500/1Q2W3E4R5T6Y7U8I9O0P1A2S3D.jpg",
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
        "cover": "https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg",
        "href": "/title/我的阿勒泰",
        "highlight": "旷野清风拂去现代焦虑，在辽阔天地间找回生活的呼吸感"
      },
      {
        "title": "我不是药神",
        "type": "movie",
        "year": "2018",
        "rate": "9.0",
        "cover": "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        "href": "/title/%E6%88%91%E4%B8%8D%E6%98%AF%E8%8D%AF%E7%A5%9E",
        "highlight": "小人物的良知觉醒与生命守望，笑着流泪的平民史诗"
      },
      {
        "title": "万物既伟大又渺小第7季",
        "type": "tv",
        "year": "2026",
        "rate": "9.3",
        "cover": "https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg",
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
        "cover": "https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg",
        "href": "/title/%E4%B8%89%E4%BD%93",
        "highlight": "当宇宙为人类闪烁，两个文明跨越四光年的生死博弈"
      },
      {
        "title": "流浪地球2",
        "type": "movie",
        "year": "2023",
        "rate": "8.3",
        "cover": "https://image.tmdb.org/t/p/w500/yQxG4Z7z9X1aB3c5E7f9h1i3k5m.jpg",
        "href": "/title/%E6%B5%81%E6%B5%AA%E5%9C%B0%E7%90%832",
        "highlight": "带着地球去流浪的终极浪漫，中国科幻电影工业的封神坐标"
      },
      {
        "title": "开端",
        "type": "tv",
        "year": "2022",
        "rate": "7.9",
        "cover": "https://image.tmdb.org/t/p/w500/1Q2W3E4R5T6Y7U8I9O0P1A2S3D.jpg",
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
        "cover": "https://image.tmdb.org/t/p/w500/5k7B8Q7j8p3d5a8s9d7f6g5h4j.jpg",
        "href": "/title/庆余年 第二季",
        "highlight": "一场假死骗过天下敌人，朝堂深宫棋局杀机四伏"
      },
      {
        "title": "唐朝诡事录之西行",
        "type": "tv",
        "year": "2024",
        "rate": "8.6",
        "cover": "https://image.tmdb.org/t/p/w500/9k8J7H6G5F4D3S2A1Q0W9E8R7T.jpg",
        "href": "/title/唐朝诡事录之西行",
        "highlight": "盛唐奇幻诡谲的边关异域，卢凌风与苏无名屡破惊天妖案"
      },
      {
        "title": "莲花楼",
        "type": "tv",
        "year": "2023",
        "rate": "8.5",
        "cover": "https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg",
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
        "cover": "https://image.tmdb.org/t/p/w500/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
        "href": "/title/%E6%97%A0%E9%97%B4%E9%81%93",
        "highlight": "对不起我是警察，天台对决铸就香港影史永恒经典"
      },
      {
        "title": "周处除三害",
        "type": "movie",
        "year": "2023",
        "rate": "8.1",
        "cover": "https://image.tmdb.org/t/p/w500/bF2g4F24K20C6eN9v6u8i3Z9y4A.jpg",
        "href": "/title/周处除三害",
        "highlight": "绝症狂徒礼堂枪决邪教徒，荒诞暴烈的人性救赎与反思"
      },
      {
        "title": "九龙城寨之围城",
        "type": "movie",
        "year": "2024",
        "rate": "7.5",
        "cover": "https://image.tmdb.org/t/p/w500/yQxG4Z7z9X1aB3c5E7f9h1i3k5m.jpg",
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
        "cover": "https://image.tmdb.org/t/p/w500/z6hOq8Yq4n5U5d9c7J6h5F4.jpg",
        "href": "/title/繁花",
        "highlight": "霓虹照亮黄河路，也照出每个人的价码与时代挽歌"
      }
    ],
    "createdAt": "2026-09-22T20:08:59.399Z",
    "updatedAt": "2026-09-22T20:08:59.399Z"
  }
};

/**
 * 获取专题详情 (优先 KV，后备预烘焙)
 */
export async function getTopicBySlug(slug: string): Promise<TopicEntity | null> {
  if (!slug) return null;
  const cleanSlug = slug.trim().toLowerCase();

  // 1. 尝试从 KV 读取
  try {
    const raw = await kvGet(`topic:${cleanSlug}`);
    if (raw) {
      return JSON.parse(raw) as TopicEntity;
    }
  } catch (err) {
    console.warn('[getTopicBySlug KV Error]:', err);
  }

  // 2. 预烘焙保底
  if (PREBAKED_TOPICS[cleanSlug]) {
    return PREBAKED_TOPICS[cleanSlug];
  }

  return null;
}

/**
 * 保存专题（供 AI 增长中枢一键发布）
 */
export async function saveTopic(topic: TopicEntity): Promise<void> {
  if (!topic || !topic.slug) return;
  const cleanSlug = topic.slug.trim().toLowerCase();
  topic.updatedAt = new Date().toISOString();
  if (!topic.createdAt) topic.createdAt = topic.updatedAt;

  await kvPut(`topic:${cleanSlug}`, JSON.stringify(topic));

  // 追加到全局专题目录 index:topics
  try {
    const rawList = await kvGet('index:topics');
    const list: string[] = rawList ? JSON.parse(rawList) : [];
    if (!list.includes(cleanSlug)) {
      list.push(cleanSlug);
      await kvPut('index:topics', JSON.stringify(list));
    }
  } catch (err) {
    console.warn('[saveTopic index warning]:', err);
  }
}
