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
      "rate": "5.8",
      "cover": "https://image.tmdb.org/t/p/w500/3x9vKiUombbUvpVxdxSxcBDxrqB.jpg",
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
      "rate": "6.7",
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
      "rate": "0.8",
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
      "remarks": "第9集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_2",
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
      "id": "pb_cat_tv_3",
      "title": "车轮下的真相",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/4I3vjEm1Ahp34CbGwENDL9OIZ09.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "刑侦破案",
        "警匪",
        "悬疑",
        "内地剧"
      ],
      "remarks": "第8集",
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
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_5",
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
      "remarks": "第18集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_6",
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
      "id": "pb_cat_tv_7",
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
      "remarks": "第08集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_8",
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
      "remarks": "第17集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_9",
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
      "id": "pb_cat_tv_10",
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
      "remarks": "第13集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_11",
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
      "remarks": "第18集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_12",
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
      "id": "pb_cat_tv_13",
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
      "id": "pb_cat_tv_14",
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
      "id": "pb_cat_tv_15",
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
      "id": "pb_cat_tv_16",
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
      "id": "pb_cat_tv_17",
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
      "id": "pb_cat_tv_18",
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
      "id": "pb_cat_tv_19",
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
      "id": "pb_cat_tv_20",
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
    }
  ],
  "anime": [
    {
      "id": "pb_cat_anime_1",
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
      "remarks": "第20集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_2",
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
      "remarks": "第161集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_3",
      "title": "大千小镇",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/uUy84cJ6vVOoebTZ9z9MPRAc0Vv.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "搞笑"
      ],
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_4",
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
      "remarks": "第182集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_5",
      "title": "玄幻，我！天命大反派",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fcac8b77e7900d5c3feb5f61c010ba09.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻修真",
        "动漫"
      ],
      "remarks": "第21集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_6",
      "title": "我怎么会嫁给一个反派",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/edcbb16417f7a00253240c23ef93dfb6.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "动漫"
      ],
      "remarks": "第21集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_7",
      "title": "仗剑青山",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4f6348660b2e06886b5c4b61badfd6d5.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "动漫"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_8",
      "title": "斗罗大陆5重生唐三 动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/650202924b0aa0b5aff4f7da307591d4.jpg",
      "year": "2025",
      "types": [
        "中国动漫",
        "玄幻",
        "神怪"
      ],
      "remarks": "第86集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_9",
      "title": "天机逆算",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/81deb8dd33241506364113c2844bf285.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "古装",
        "玄幻",
        "冒险"
      ],
      "remarks": "第20集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_10",
      "title": "魔神苏醒，煞血归来",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/db8d781a9831dca1b662e58106d68da5.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "复仇",
        "玄幻",
        "逆袭"
      ],
      "remarks": "第37集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_11",
      "title": "万妖帝主",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3436fcc84654a43c9153e403a02da2cf.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "逆袭",
        "热血"
      ],
      "remarks": "第35集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_12",
      "title": "封剑踏歌守山河",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8763b03d427d69f413df44433092276c.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "逆袭",
        "热血"
      ],
      "remarks": "第15集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_13",
      "title": "全民诡异：开局掌握零元购",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/7LY13eEEKndOG7FmzbysOqWEfhm.jpg",
      "year": "2025",
      "types": [
        "中国动漫",
        "奇幻",
        "末日",
        "热血"
      ],
      "remarks": "第306集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_14",
      "title": "水鬼怀龙胎,开局揍皇帝",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f7668cab65409cd357548748f2b9f618.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "奇幻",
        "神怪",
        "恋爱"
      ],
      "remarks": "第122集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_15",
      "title": "平行天帝：系统启世",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b5aa9f33f1ae3ebd21980a3003ee2a12.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "冒险",
        "热血"
      ],
      "remarks": "第55集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_16",
      "title": "末日重生，我有空间异能",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4564e56634f0f82171f9c1b9b39ad60a.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "末日",
        "奇幻",
        "重生"
      ],
      "remarks": "第93集",
      "is_new": true
    }
  ],
  "variety": [
    {
      "id": "pb_cat_variety_1",
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
      "remarks": "大神版第9期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_2",
      "title": "心动的信号第9季",
      "rate": "6.1",
      "cover": "https://image.tmdb.org/t/p/w500/qFplFFQy6zMMplHItcrMAtBEseO.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "社交观察"
      ],
      "remarks": "260916超前彩蛋",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_3",
      "title": "滚烫夜话",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bbe722a8d692caae8d7b9bcb6e11f5c1.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "播客"
      ],
      "remarks": "第4期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_4",
      "title": "毛雪汪（2026）",
      "rate": "8.8",
      "cover": "https://image.tmdb.org/t/p/w500/biarmEDDU3W5WSxCo8rYsykPOpP.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "脱口秀",
        "生活观察"
      ],
      "remarks": "20260916汪子问问问",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_5",
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
      "remarks": "第5期母带3",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_6",
      "title": "姐姐当家第二季",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/2e0F03Mwd5e1lquypDCBVtN220I.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "女性力量",
        "生活观察"
      ],
      "remarks": "姐姐的母带2第10期上",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_7",
      "title": "花儿与少年2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "文化"
      ],
      "remarks": "送机篇第6期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_8",
      "title": "宠宠冲冲冲",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/da4de9ac9388cf3fba1916019468d9e8.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "萌宠",
        "娱乐"
      ],
      "remarks": "第12期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_9",
      "title": "不想睡的星期五",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/ladRcczkCEFXFxycIleWgx9yV5q.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺",
        "生活"
      ],
      "remarks": "超前营夜第10期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_10",
      "title": "舞蹈新风暴",
      "rate": "8.5",
      "cover": "https://image.tmdb.org/t/p/w500/jej7FfIvWZyLSMoNbPP3MkEByob.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "歌舞",
        "真人秀"
      ],
      "remarks": "Plus版第4期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_11",
      "title": "我家那闺女2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/26341e155670d44627317021c84245ac.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星",
        "真人秀"
      ],
      "remarks": "盲盒大放送第5期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_12",
      "title": "心动双重奏",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ad595f77f52724b0e11d07b27f2a5176.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "情感",
        "旅游"
      ],
      "remarks": "心动日记第7期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_13",
      "title": "深夜怪谈会 第六季",
      "rate": "8.7",
      "cover": "https://image.tmdb.org/t/p/w500/ttkrChNTghHiEFihhDZlGvrMwbp.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺"
      ],
      "remarks": "第13期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_14",
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
      "id": "pb_cat_variety_15",
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
      "id": "pb_cat_variety_16",
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
      "rate": "10.0",
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
      "title": "京阙折枝",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0941adc5619ec3a7f1d774d27609887b.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_2",
      "title": "夫人，我真不是魔尊",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3b1ecb17a213641dd8d8bb64b40ced41.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_3",
      "title": "龙图录：绣衣定乾坤",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/051d89bbf1f33e0fe808821783d132f6.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_4",
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
      "id": "pb_cat_short_5",
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
      "id": "pb_cat_short_6",
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
      "id": "pb_cat_short_7",
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
      "id": "pb_cat_short_8",
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
      "id": "pb_cat_short_9",
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
      "id": "pb_cat_short_10",
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
      "id": "pb_cat_short_11",
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
      "id": "pb_cat_short_12",
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
      "id": "pb_cat_short_13",
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
      "id": "pb_cat_short_14",
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
      "id": "pb_cat_short_15",
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
      "id": "pb_cat_short_16",
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
      "id": "pb_cat_short_17",
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
      "id": "pb_cat_short_18",
      "title": "如诗说一千里共明月",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0726e051d18e9ae347c103a30035f9a1.jpg",
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
      "remarks": "第9集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_2",
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
      "id": "pb_cat_rank_3",
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
      "id": "pb_cat_rank_10",
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
      "remarks": "第12集",
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
      "title": "逃出绝命街",
      "rate": "6.7",
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
