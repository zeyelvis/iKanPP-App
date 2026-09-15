/**
 * 全频道大厅首屏即时秒开预烘焙数据集 (Pre-baked Category Hub Dataset for 0ms Page Load)
 * 由 scripts/sync-category-prebaked.mjs 定时自动巡检刷新
 * 覆盖 7 大专区 (movie, tv, anime, variety, documentary, short, ranking) 全网最新上线与经典神作
 */

import { DOCUMENTARY_DATASET } from './documentary-data';
import { PREBAKED_LATEST_TITLES } from './latest-titles-prebaked';

export interface PrebakedCategoryItem {
  id: string;
  title: string;
  rate: string;
  cover: string;
  year?: string;
  types?: string[];
  is_new?: boolean;
  remarks?: string;
  play_url?: string;
}

export const PREBAKED_CATEGORY_ITEMS: Record<string, PrebakedCategoryItem[]> = {
  "movie": [
    {
      "id": "pb_cat_movie_1",
      "title": "狮拳",
      "rate": "7.3",
      "cover": "https://image.tmdb.org/t/p/w500/ezFIXWTbIXlBuZ4kKgto4N3i3of.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_2",
      "title": "惩罚者2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/951477c405c46624e7650ab6e4354d4b.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作犯罪",
        "枪战"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_3",
      "title": "美女捕吏女牢秘档续美女奉行2",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d5acadf1b2e7b66ec4c8e46b9de59d1f.jpg",
      "year": "1995",
      "types": [
        "动作片",
        "动作",
        "古装"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_4",
      "title": "逃出绝命街",
      "rate": "6.6",
      "cover": "https://image.tmdb.org/t/p/w500/2eXquFgtDqSyVmrcBwC9ZnzNw3d.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "科幻",
        "惊悚",
        "冒险"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_5",
      "title": "蜂鸟行动",
      "rate": "4.0",
      "cover": "https://image.tmdb.org/t/p/w500/oZXH2DonlPsDVPBTIy5gQxBZLcU.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作犯罪",
        "枪战"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_6",
      "title": "叛谍猎手",
      "rate": "0.5",
      "cover": "https://image.tmdb.org/t/p/w500/wEXaqQXOBPClwqEufiFqgfHVXTk.jpg",
      "year": "2025",
      "types": [
        "动作片",
        "动作",
        "惊悚"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_7",
      "title": "无情的拳头",
      "rate": "8.2",
      "cover": "https://image.tmdb.org/t/p/w500/v9ZtOlIJ3HS49UMtS4eli3WMenT.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_8",
      "title": "热血部落",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/5tBQTiSJsN4TPF2UHevG7Lyk7z5.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "冒险",
        "战争"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_9",
      "title": "山竹刀",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/uGMUv4cTj1k7UAr4nu7QVFzdLZL.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作炫酷",
        "武侠江湖"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_10",
      "title": "异种污染",
      "rate": "5.5",
      "cover": "https://image.tmdb.org/t/p/w500/m0LZmS2HPm0qvzgM49epZ2Cl83t.jpg",
      "year": "2025",
      "types": [
        "动作片",
        "动作",
        "科幻",
        "惊悚",
        "恐怖",
        "战争"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_11",
      "title": "血路姐弟",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7ff09dabdadb83b37fcc9d5177a9b097.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_12",
      "title": "神拳赌约",
      "rate": "6.0",
      "cover": "https://image.tmdb.org/t/p/w500/Ao4sN50C7RoyQJJlmPrFEMrizAp.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "奇幻"
      ],
      "remarks": "抢先版",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_13",
      "title": "求救信号2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d72e35bf81950d921d449c1219c189c9.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "冒险"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_14",
      "title": "乱世杀局",
      "rate": "4.0",
      "cover": "https://image.tmdb.org/t/p/w500/a8Ut1fkbqvolWfEIl8Voa1oUsDG.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "惊悚"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_15",
      "title": "监狱雄心",
      "rate": "7.5",
      "cover": "https://image.tmdb.org/t/p/w500/8i5iZV50CoEtmDCFM7RSxCkpE8h.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "冒险"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_16",
      "title": "蜘蛛侠：崭新之日",
      "rate": "7.8",
      "cover": "https://image.tmdb.org/t/p/w500/7AjIupf0lxNKNq0p8z36jv5ZpiJ.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "科幻",
        "奇幻",
        "冒险"
      ],
      "remarks": "高清版",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_17",
      "title": "速战速决",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/xijSYyOSm7puXpUpvY2uzp11tWc.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "犯罪",
        "动作"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_18",
      "title": "碧血蓝天",
      "rate": "6.5",
      "cover": "https://image.tmdb.org/t/p/w500/w3A13uvw19m7ENxXDq6ej2KDJYN.jpg",
      "year": "1998",
      "types": [
        "动作片",
        "動作",
        "驚悚"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_19",
      "title": "器子",
      "rate": "6.0",
      "cover": "https://image.tmdb.org/t/p/w500/prmdcWDzvhKiHKp6naKwADj9KU7.jpg",
      "year": "2025",
      "types": [
        "动作片",
        "剧情",
        "动作",
        "犯罪"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_20",
      "title": "破暗",
      "rate": "7.5",
      "cover": "https://image.tmdb.org/t/p/w500/nqqGHIgoTdvBeHaMNwGSj1NT6Uk.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "武侠"
      ],
      "remarks": "正片",
      "is_new": true
    }
  ],
  "tv": [
    {
      "id": "pb_cat_tv_1",
      "title": "交锋",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/gRe5FZjMWw8xXzWk1hxWuNQckOg.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第22集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_2",
      "title": "兰香如故",
      "rate": "6.7",
      "cover": "https://image.tmdb.org/t/p/w500/kfurXRMH1ZkUoyT5HN72zLTQxzZ.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "女性成长",
        "逆袭",
        "内地剧"
      ],
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_3",
      "title": "生逢其时",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/q2ulZwiuO9Gg0bVziimr8CXHdpk.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第17集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_4",
      "title": "冬城猎凶",
      "rate": "8.0",
      "cover": "https://image.tmdb.org/t/p/w500/64NVbdSuNgrK90wqhtnlR2S4sPK.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "犯罪",
        "内地剧"
      ],
      "remarks": "第11集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_5",
      "title": "卧龙2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0ab5272275d1bc8042643ef8d5fca88f.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "奇幻",
        "悬疑",
        "内地剧"
      ],
      "remarks": "第2集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_6",
      "title": "暗恋小说家",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7319e4d38d55ca798c701cc00f0d480c.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "微短剧",
        "爱情",
        "穿越",
        "青春",
        "内地剧"
      ],
      "remarks": "第2集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_7",
      "title": "熔城",
      "rate": "6.0",
      "cover": "https://image.tmdb.org/t/p/w500/hN29g3tSYksS40PTbJtPv9Vpobp.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "男性传奇",
        "抗日战争",
        "内地剧"
      ],
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_8",
      "title": "云雀叫天录",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/nHAqLcS38jFpNsDRI0mZLIUmRVI.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "年代剧",
        "传记",
        "内地剧"
      ],
      "remarks": "第7集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_9",
      "title": "梦回缘",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/Ainq2bSrsR45LGl4LlDup26bnOd.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "穿越言情",
        "古装爱情",
        "内地剧"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_10",
      "title": "为爱正名",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/kcvO8zGPhHxIJX28KaXINTMIMy9.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "甜虐爱情",
        "姐妹情",
        "内地剧"
      ],
      "remarks": "第06集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_11",
      "title": "济公之降龙除妖",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/3lhWnNt9d2jBeiYvk3QkTCvdzSY.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "神话传说",
        "古装",
        "喜剧",
        "内地剧"
      ],
      "remarks": "第17集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_12",
      "title": "九品猎妖官",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/a2pQnGu1pGZdJqZENtu7mvxu0jm.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "奇幻爱情",
        "古装爱情",
        "东方玄幻",
        "内地剧"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_13",
      "title": "浮生之白蛇前缘",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/wHggxwOctc7fzPaPWiPSuWpiEIq.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "爱情",
        "奇幻",
        "古装",
        "内地剧"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_14",
      "title": "独剑九天",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/ee8W1LlIqdjotA24ffJNsgFLIIs.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "奇幻",
        "古装",
        "内地剧"
      ],
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_15",
      "title": "天赐娘子·小镖师",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/iYaFKNWMSFOiq4l243dk5hboQYb.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "喜剧",
        "爱情",
        "古装",
        "内地剧"
      ],
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_16",
      "title": "微风襟袖同卿心2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/01a0eb84f0ea44688ac2ab93391a399d.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "微短剧",
        "内地剧"
      ],
      "remarks": "第18集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_17",
      "title": "猎罪现场",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/pmR2aBGUyCzWnKREuA1kBfUFyUo.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "刑侦",
        "悬疑",
        "犯罪",
        "内地剧"
      ],
      "remarks": "第24集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_18",
      "title": "深渊无间",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/b9ngtGNgaHBbLihRrT0MsPRY0GW.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "警匪罪案",
        "悬疑",
        "动作",
        "内地剧"
      ],
      "remarks": "第16集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_19",
      "title": "请记住我的名字",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/zhPRlmYHRwQW1KHkuAPGnKmZTBQ.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "同性",
        "内地剧"
      ],
      "remarks": "第4集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_20",
      "title": "末誓",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/k236Jf1rXmQ4LvWxeF0zoFWhbC1.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第8集",
      "is_new": true
    }
  ],
  "anime": [
    {
      "id": "pb_cat_anime_1",
      "title": "遮天",
      "rate": "8.9",
      "cover": "https://image.tmdb.org/t/p/w500/z9JNGlJ8eGy6S6SOlBhpmxjjXGT.jpg",
      "year": "2023",
      "types": [
        "中国动漫",
        "动漫"
      ],
      "remarks": "第181集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_2",
      "title": "一念永恒 完结季",
      "rate": "8.5",
      "cover": "https://image.tmdb.org/t/p/w500/sMh3dDaDFA72Y3TSu09ovQzWYQA.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "东方玄幻",
        "玄幻修真",
        "英雄成长"
      ],
      "remarks": "第11集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_3",
      "title": "聪明的顺溜之雄鹰小子 第二季",
      "rate": "7.0",
      "cover": "https://image.tmdb.org/t/p/w500/3bQio1OXQMeADSIq3egkC5FFczG.jpg",
      "year": "2018",
      "types": [
        "中国动漫"
      ],
      "remarks": "第52集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_4",
      "title": "我的坟冢能滋养修为",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/5ma9bCPGKYMq1mKBkKCNXHwrsny.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "穿越",
        "系统",
        "奇幻"
      ],
      "remarks": "第19集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_5",
      "title": "魔道重生的女武神",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4390d85d9625806b78ad7ecb81044845.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "复仇",
        "脑洞"
      ],
      "remarks": "第181集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_6",
      "title": "禅王渡尘",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b14f1d742a471207c017cc24b0fa6e87.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "古装",
        "反转",
        "虐心"
      ],
      "remarks": "第160集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_7",
      "title": "诸神屠宰场：从万妖谷杀穿星河",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e1b7ab1aa2001f3ffb8700d4af7709f5.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "逆袭",
        "热血"
      ],
      "remarks": "第13集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_8",
      "title": "轮回书生",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/66862e23f05c8e1f6b559799b744a320.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "脑洞",
        "冒险",
        "热血"
      ],
      "remarks": "第43集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_9",
      "title": "岭上春",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5034ddc4e5be30015b6c94e579ce8245.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "逆袭",
        "日常",
        "生活"
      ],
      "remarks": "第14集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_10",
      "title": "全村抢我草莓，我连夜搬空",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2520e36dad8df59acaeba38164fa5a71.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "日常",
        "复仇",
        "灾难"
      ],
      "remarks": "第19集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_11",
      "title": "武神主宰",
      "rate": "7.4",
      "cover": "https://image.tmdb.org/t/p/w500/ihVkKv0QBPK8kf8SUajc4cK1Km6.jpg",
      "year": "2020",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第692集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_12",
      "title": "末世钞能力者 动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/52b243733f53d6184e349f187c32c961.jpg",
      "year": "2025",
      "types": [
        "中国动漫",
        "奇幻",
        "穿越",
        "热血"
      ],
      "remarks": "第127集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_13",
      "title": "仙逆彩蛋·逆仙客栈",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/11bcd3d663b92f1c929fdb3e0844d3c7.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "搞笑动画",
        "生活日常"
      ],
      "remarks": "第6集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_14",
      "title": "误入诡宗后，我成了全宗团宠",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0b70c981d7d918d9b2c240928e2b06ad.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "动漫"
      ],
      "remarks": "第30集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_15",
      "title": "百日成王",
      "rate": "6.5",
      "cover": "https://image.tmdb.org/t/p/w500/pUQVZGKxODzRNTAD91DK4tu3qZS.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "喜剧",
        "动作",
        "动画",
        "奇幻"
      ],
      "remarks": "第25集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_16",
      "title": "万界独尊",
      "rate": "9.5",
      "cover": "https://image.tmdb.org/t/p/w500/l2Z8oW6lW4FhgWt2Uu2NQhaEVLK.jpg",
      "year": "2021",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第483集",
      "is_new": true
    }
  ],
  "variety": [
    {
      "id": "pb_cat_variety_1",
      "title": "心动的信号第9季",
      "rate": "6.1",
      "cover": "https://image.tmdb.org/t/p/w500/qFplFFQy6zMMplHItcrMAtBEseO.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "社交观察"
      ],
      "remarks": "第7期中下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_2",
      "title": "舞蹈新风暴",
      "rate": "8.5",
      "cover": "https://image.tmdb.org/t/p/w500/jej7FfIvWZyLSMoNbPP3MkEByob.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "歌舞",
        "真人秀"
      ],
      "remarks": "纯享版第4期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_3",
      "title": "密室大逃脱第八季",
      "rate": "7.6",
      "cover": "https://image.tmdb.org/t/p/w500/qQ221G1KxusTIotpTi4cxDk6O13.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "悬疑",
        "密室",
        "综艺",
        "推理"
      ],
      "remarks": "大神版超前彩蛋第9期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_4",
      "title": "钱塘老娘舅",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/445c77cfd1c86def7ddd0d14e9bd8948.jpg",
      "year": "2009",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第20260914期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_5",
      "title": "披荆斩棘2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2eea2ab420e3cde52f34fd7cc5d341ee.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星",
        "竞技",
        "真人秀"
      ],
      "remarks": "三公小考",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_6",
      "title": "北京厂开玩",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ddc8bb0477c7261fa8def2fbc0e335d3.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "旅行观光",
        "真人秀"
      ],
      "remarks": "探秘北冰洋工厂",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_7",
      "title": "加油！汪汪",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/AsxjU5lxMDtvC7xRgfK8wtTQxjU.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星体验",
        "闯关节目"
      ],
      "remarks": "第6期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_8",
      "title": "一万元舞台2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3ac7985fdd413e3bea13d9f574376931.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "音乐表演",
        "明星演唱",
        "流行音乐"
      ],
      "remarks": "第10期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_9",
      "title": "毛雪汪（2026）",
      "rate": "8.8",
      "cover": "https://image.tmdb.org/t/p/w500/biarmEDDU3W5WSxCo8rYsykPOpP.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "脱口秀",
        "生活观察"
      ],
      "remarks": "20260915超长尊享版",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_10",
      "title": "一师亦友",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/2kCnk4wcV3NYvLGql5tPuyI45NT.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "访谈"
      ],
      "remarks": "第20260913期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_11",
      "title": "一饭封神第二季",
      "rate": "6.3",
      "cover": "https://image.tmdb.org/t/p/w500/9dyojjMqquQX30ombDixuZsBISl.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食竞技"
      ],
      "remarks": "陪看第7期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_12",
      "title": "有朋自远方来第5季",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/af1n2mLFYIPJaW3QqmyoQG53HPB.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第3期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_13",
      "title": "非你莫属2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/cfc5ef5c3ea43d3e401f6e3496580f6b.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第20260913期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_14",
      "title": "向前一步2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8a92fe99ca57b8b5560f69723979ffc7.jpg",
      "year": "2026",
      "types": [
        "大陆综艺"
      ],
      "remarks": "第20260913期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_15",
      "title": "大哥小助理",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/42KdZo0AtIxGtdeEe0Z5uStiPYQ.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "职业体验",
        "真人秀",
        "观察"
      ],
      "remarks": "第5期母带2",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_16",
      "title": "哥哥来啦",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0e87319c7bbff7c0fb9904f138570582.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星",
        "真人秀"
      ],
      "remarks": "第4期",
      "is_new": true
    }
  ],
  "documentary": [
    {
      "id": "pb_cat_documentary_1",
      "title": "普法栏目剧2011年",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ce9858d6de8887d99ebcc487e7eccde1.jpg",
      "year": "2011",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "走出泥潭下",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_2",
      "title": "柯南势在必行第三季",
      "rate": "7.6",
      "cover": "https://image.tmdb.org/t/p/w500/oWD5vxCy9WeseW1QtKnh0Kr3z8Z.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录",
        "纪录片"
      ],
      "remarks": "第4集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_3",
      "title": "一个致命故事",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/rDPi9MXUtK0oVx3uwXHY5yRTKVW.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片",
        "犯罪"
      ],
      "remarks": "第1集",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_4",
      "title": "兄弟连：薪火永续",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/n29MsV1m2OCbDp6PLeHxziOVOLG.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_5",
      "title": "天真一代第一季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/eae283d9b6b4ef69ff165a1445a6519e.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "科技纪录片",
        "人物故事",
        "访谈节目",
        "纪录片"
      ],
      "remarks": "第3集",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_6",
      "title": "体坛秘史：文斯·扬的人生剖白",
      "rate": "6.4",
      "cover": "https://image.tmdb.org/t/p/w500/A1n4bOedczRdAm3JRBmbg35deCD.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_7",
      "title": "爱了！中国式现代化",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/60632049220f6fe2c205e3f2e3c7db07.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "建设",
        "纪录片"
      ],
      "remarks": "第8集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_8",
      "title": "菲托·帕兹：歌中的世界",
      "rate": "5.1",
      "cover": "https://image.tmdb.org/t/p/w500/vG6rXAyLSu5MqIZG5jTjP6tpdbl.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_9",
      "title": "神兽猎局",
      "rate": "6.3",
      "cover": "https://image.tmdb.org/t/p/w500/tZhx3eXEcaLnLJkITX85TsKCAod.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片",
        "犯罪"
      ],
      "remarks": "第4集",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_10",
      "title": "体坛秘史：霹雳舞博士雷切尔·冈恩",
      "rate": "6.0",
      "cover": "https://image.tmdb.org/t/p/w500/3pnlJjsGtrUp3cPEOLzkR0sPQAK.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_11",
      "title": "失窃王国",
      "rate": "2.0",
      "cover": "https://image.tmdb.org/t/p/w500/u2d5ExYA3Y8NO48oRkU8EZrakBX.jpg",
      "year": "2025",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_12",
      "title": "转折点：911世代",
      "rate": "6.3",
      "cover": "https://image.tmdb.org/t/p/w500/4ZsSaTbddmCoSZc9qgyZt737AWv.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片",
        "历史"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_13",
      "title": "前浪第二季",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/4dpxdjiQZ8FzgVmwDEQHClExrEV.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "社会纪录片",
        "社会话题",
        "纪录片"
      ],
      "remarks": "第6集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_14",
      "title": "最后一课",
      "rate": "6.5",
      "cover": "https://image.tmdb.org/t/p/w500/3sbsRqquMe0P1rsUy88PvbsCnpF.jpg",
      "year": "2025",
      "types": [
        "记录片",
        "纪录片",
        "传记"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_15",
      "title": "911 Reunited",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/h1X1nS0PWrS40x4CUBnq8zwoKiD.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片",
        "历史"
      ],
      "remarks": "第3集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_16",
      "title": "哈士奇王朝：康涅狄格大学女篮",
      "rate": "8.3",
      "cover": "https://image.tmdb.org/t/p/w500/jSLp2DAdszsMBdRQgrtgSrfIiTy.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "第3集完结",
      "is_new": true
    }
  ],
  "short": [
    {
      "id": "pb_cat_short_1",
      "title": "我一邪修养反派为徒很正常吧",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2ad3834e7074ab54fbfa8a10e0370d15.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_2",
      "title": "我在古代，靠召唤系统逍遥自在",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c20b8cf7e3996c8ded8bc426c7882845.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_3",
      "title": "女帝和她的娇夫殿下",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/aec81fe60be6523986974f1e30ca1f26.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_4",
      "title": "太后归来，先帝竟成了我的大学老师",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9b23e3107a223e5ca7f9fd565a51cc52.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_5",
      "title": "报告摄政王，公主又去选面首了",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/076c3fe209eecb92304347da182405be.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_6",
      "title": "夫人别盼死首辅还能活百年",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/03e5255fe734805bd03251e043d43830.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_7",
      "title": "星澜诀",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/69595be589fa326bb3fd783fa039b773.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_8",
      "title": "青莲农宝我的土鸡麒麟镇神魔",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/20b7b5cbfd5a8fe42db28721ee5617ff.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_9",
      "title": "蛮尘渡",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/29ec03bb2d04702c0e22fba276bf9a3e.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_10",
      "title": "认错白月光，陛下追我入后宫",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bbee358230192723d97e3597f9224f07.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_11",
      "title": "落魄书生：开局迎娶俏佳人",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fbd123a4d95c6f8abb19f4993a468354.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_12",
      "title": "向仙文明，大夏让我先成仙",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f03a85c135d905a845e31ed2e0571705.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_13",
      "title": "纨绔双骄",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/55fa53f0739366daf3bb884c63ba887c.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_14",
      "title": "逍遥小帝婿",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/282583c8cb71f1be30f6448db7fca6e9.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_15",
      "title": "如诗说一千里共明月",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0726e051d18e9ae347c103a30035f9a1.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_16",
      "title": "大小姐回京后整顿侯府满门",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/081a65f7d7d18dd2ea14a63d7987db82.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_17",
      "title": "愿我如星卿如月",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5077e7522a87b9fc9c829a061c1fb1d9.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_18",
      "title": "魂穿西楚：吾乃少年霸王是也！",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/88c744249e42dc37b812e4c0deb53da0.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    }
  ],
  "ranking": [
    {
      "id": "pb_cat_rank_1",
      "title": "交锋",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/gRe5FZjMWw8xXzWk1hxWuNQckOg.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第22集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_2",
      "title": "生逢其时",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/q2ulZwiuO9Gg0bVziimr8CXHdpk.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第17集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_3",
      "title": "云雀叫天录",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/nHAqLcS38jFpNsDRI0mZLIUmRVI.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "年代剧",
        "传记",
        "内地剧"
      ],
      "remarks": "第7集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_4",
      "title": "深渊无间",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/b9ngtGNgaHBbLihRrT0MsPRY0GW.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "警匪罪案",
        "悬疑",
        "动作",
        "内地剧"
      ],
      "remarks": "第16集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_5",
      "title": "惩罚者2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/951477c405c46624e7650ab6e4354d4b.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作犯罪",
        "枪战"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_6",
      "title": "美女捕吏女牢秘档续美女奉行2",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d5acadf1b2e7b66ec4c8e46b9de59d1f.jpg",
      "year": "1995",
      "types": [
        "动作片",
        "动作",
        "古装"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_7",
      "title": "血路姐弟",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7ff09dabdadb83b37fcc9d5177a9b097.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_8",
      "title": "求救信号2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d72e35bf81950d921d449c1219c189c9.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "冒险"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_9",
      "title": "卧龙2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0ab5272275d1bc8042643ef8d5fca88f.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "奇幻",
        "悬疑",
        "内地剧"
      ],
      "remarks": "第2集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_10",
      "title": "暗恋小说家",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7319e4d38d55ca798c701cc00f0d480c.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "微短剧",
        "爱情",
        "穿越",
        "青春",
        "内地剧"
      ],
      "remarks": "第2集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_11",
      "title": "微风襟袖同卿心2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/01a0eb84f0ea44688ac2ab93391a399d.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "微短剧",
        "内地剧"
      ],
      "remarks": "第18集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_12",
      "title": "无情的拳头",
      "rate": "8.2",
      "cover": "https://image.tmdb.org/t/p/w500/v9ZtOlIJ3HS49UMtS4eli3WMenT.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_13",
      "title": "冬城猎凶",
      "rate": "8.0",
      "cover": "https://image.tmdb.org/t/p/w500/64NVbdSuNgrK90wqhtnlR2S4sPK.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "犯罪",
        "内地剧"
      ],
      "remarks": "第11集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_14",
      "title": "蜘蛛侠：崭新之日",
      "rate": "7.8",
      "cover": "https://image.tmdb.org/t/p/w500/7AjIupf0lxNKNq0p8z36jv5ZpiJ.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "科幻",
        "奇幻",
        "冒险"
      ],
      "remarks": "高清版",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_15",
      "title": "监狱雄心",
      "rate": "7.5",
      "cover": "https://image.tmdb.org/t/p/w500/8i5iZV50CoEtmDCFM7RSxCkpE8h.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "冒险"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_16",
      "title": "破暗",
      "rate": "7.5",
      "cover": "https://image.tmdb.org/t/p/w500/nqqGHIgoTdvBeHaMNwGSj1NT6Uk.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "武侠"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_17",
      "title": "狮拳",
      "rate": "7.3",
      "cover": "https://image.tmdb.org/t/p/w500/ezFIXWTbIXlBuZ4kKgto4N3i3of.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_18",
      "title": "兰香如故",
      "rate": "6.7",
      "cover": "https://image.tmdb.org/t/p/w500/kfurXRMH1ZkUoyT5HN72zLTQxzZ.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "女性成长",
        "逆袭",
        "内地剧"
      ],
      "remarks": "第12集",
      "is_new": true
    }
  ]
};

/**
 * 辅助函数：根据专区与货架配置，返回匹配的预烘焙影视数据
 */
export function getPrebakedCategoryShelves(
  channelKey: string,
  doubanType: 'movie' | 'tv',
  shelves: any[]
): Record<string, any[]> {
  const list = PREBAKED_CATEGORY_ITEMS[channelKey] || PREBAKED_CATEGORY_ITEMS[doubanType] || PREBAKED_CATEGORY_ITEMS.movie;

  const result: Record<string, any[]> = {};
  if (!shelves || shelves.length === 0) return result;

  // 针对纪录片大厅做精准的主题货架过滤，确保各货架题材100%纯正
  if (channelKey === 'documentary') {
    shelves.forEach((shelf) => {
      const matched = list.filter((it) =>
        it.types?.some((t) => t.includes(shelf.tag) || shelf.tag.includes(t))
      );
      if (matched.length >= 4) {
        result[shelf.tag] = matched;
      } else {
        // 若单题材不足，将匹配项与高分纪录片去重拼接
        const seen = new Set(matched.map((m) => m.title));
        const combined = [...matched];
        for (const item of list) {
          if (!seen.has(item.title)) {
            seen.add(item.title);
            combined.push(item);
          }
        }
        result[shelf.tag] = combined;
      }
    });
    return result;
  }

  // 将预烘焙数据分配到前几个货架中，保证首屏 100% 满屏渲染
  const latestList = PREBAKED_LATEST_TITLES[channelKey] || PREBAKED_LATEST_TITLES.all || [];
  const convertedLatest = latestList.map(item => ({
    id: item.entityId,
    title: item.title,
    rate: item.rate,
    cover: item.cover,
    year: item.year,
    types: item.genres,
    is_new: true,
    remarks: item.updateBadge,
  }));

  shelves.forEach((shelf, idx) => {
    // 1. 若为「最新上线」核心货架，优先注入真实最新增量新片
    if ((shelf.tag === '最新' || shelf.tag.includes('最新')) && convertedLatest.length > 0) {
      result[shelf.tag] = convertedLatest;
      return;
    }

    if (shelf.tag === 'ai') {
      const aiItems = list.filter((it) => it.types?.some((t) => t.includes('AI') || t.includes('漫剧')));
      if (aiItems.length > 0) {
        result[shelf.tag] = aiItems;
        return;
      }
    }
    // 错位切片展示不同影片
    const start = (idx * 3) % list.length;
    const rotated = [...list.slice(start), ...list.slice(0, start)];
    result[shelf.tag] = rotated;
  });

  return result;
}
