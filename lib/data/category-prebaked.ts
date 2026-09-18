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
      "rate": "6.0",
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
      "rate": "6.9",
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
      "rate": "7.6",
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
      "title": "生逢其时",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/q2ulZwiuO9Gg0bVziimr8CXHdpk.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第26集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_2",
      "title": "兰香如故",
      "rate": "7.2",
      "cover": "https://image.tmdb.org/t/p/w500/kfurXRMH1ZkUoyT5HN72zLTQxzZ.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "女性成长",
        "逆袭",
        "内地剧"
      ],
      "remarks": "第18集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_3",
      "title": "交锋",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/gRe5FZjMWw8xXzWk1hxWuNQckOg.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第28集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_4",
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
      "remarks": "第27集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_5",
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
      "remarks": "第14集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_6",
      "title": "一瓯春",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/7KjVhRaarZ5L3CBirQEmt89ioiz.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "复仇爽剧",
        "内地剧"
      ],
      "remarks": "第8集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_7",
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
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_8",
      "title": "荣耀的阶梯",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/lZXqOkURnRMPMJ05fnvvpmTNiv5.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "都市爱情",
        "复仇",
        "内地剧"
      ],
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_9",
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
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_10",
      "title": "阎魔的宠妃",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/86d2641cf8c4473a96c6bbbaaa245f75.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "奇幻爱情",
        "仙侠",
        "内地剧"
      ],
      "remarks": "第24集已完结",
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
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_12",
      "title": "妾本草芥",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/hABseMRLlM8tOSJTcyJku7VmxsZ.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "内地剧"
      ],
      "remarks": "第11集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_13",
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
      "id": "pb_cat_tv_14",
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
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_15",
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
      "remarks": "第15集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_16",
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
      "remarks": "第22集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_17",
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
      "remarks": "第5集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_18",
      "title": "微风襟袖同卿心2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/01a0eb84f0ea44688ac2ab93391a399d.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "微短剧",
        "内地剧"
      ],
      "remarks": "第18集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_19",
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
      "id": "pb_cat_tv_20",
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
    }
  ],
  "anime": [
    {
      "id": "pb_cat_anime_1",
      "title": "请吃红小豆吧！第五季",
      "rate": "8.7",
      "cover": "https://image.tmdb.org/t/p/w500/i0NMdmLt4PLxORLCT8fmvmru3la.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "搞笑",
        "治愈",
        "日常"
      ],
      "remarks": "第3集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_2",
      "title": "斗罗大陆II绝世唐门",
      "rate": "7.9",
      "cover": "https://image.tmdb.org/t/p/w500/kVlTNqhSVRHudCRTjSJbBGmAZby.jpg",
      "year": "2023",
      "types": [
        "中国动漫",
        "玄幻"
      ],
      "remarks": "第171集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_3",
      "title": "开心锤锤世界",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/ltOJHTZOMYxXYPO7IdF5CpfQhzE.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "搞笑",
        "泡面"
      ],
      "remarks": "第72集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_4",
      "title": "逆天邪神 第二季",
      "rate": "8.3",
      "cover": "https://image.tmdb.org/t/p/w500/xORt4bvPxAlRPddiwIjq8YF8Gbq.jpg",
      "year": "2021",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第384集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_5",
      "title": "我在古代的六小时工作制",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ffc843534b30fd4366722e308ea7f9fa.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "穿越",
        "逆袭",
        "古装"
      ],
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_6",
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
      "remarks": "第184集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_7",
      "title": "大千小镇",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/uUy84cJ6vVOoebTZ9z9MPRAc0Vv.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "搞笑"
      ],
      "remarks": "第17集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_8",
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
      "remarks": "第163集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_9",
      "title": "魔皇大管家",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/crfIGHFSs02YxeYOzejHNiTVQEm.jpg",
      "year": "2023",
      "types": [
        "中国动漫",
        "东方玄幻",
        "修真",
        "3D",
        "动画"
      ],
      "remarks": "第09集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_10",
      "title": "百日成王",
      "rate": "6.7",
      "cover": "https://image.tmdb.org/t/p/w500/pUQVZGKxODzRNTAD91DK4tu3qZS.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "喜剧",
        "动作",
        "动画",
        "奇幻"
      ],
      "remarks": "第25集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_11",
      "title": "全球御鬼，我的体内有亿只鬼动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/dbd234daab8899daa26bbcd36f75c870.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "系统流",
        "穿越",
        "奇幻"
      ],
      "remarks": "第85集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_12",
      "title": "全球惊悚：我开启外挂自选商城 动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/81404ff8a5080f88fa03b7637071b0a8.jpg",
      "year": "2024",
      "types": [
        "中国动漫"
      ],
      "remarks": "第99集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_13",
      "title": "狐妖小红娘黄风岭篇",
      "rate": "6.6",
      "cover": "https://image.tmdb.org/t/p/w500/9oquBnehuZPAVhA4rhW3IXY6LqN.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "剧情",
        "喜剧",
        "动作",
        "爱情",
        "动画",
        "奇幻"
      ],
      "remarks": "第06集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_14",
      "title": "全民御兽：开局觉醒神话级天赋 动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/069da2c40b859bbefe9065072e6f7404.jpg",
      "year": "2024",
      "types": [
        "中国动漫",
        "热血",
        "穿越"
      ],
      "remarks": "第101集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_15",
      "title": "全民转职：驭龙师是最弱职业 动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9c8a38769e8fe34ed6ef094eb357f7dc.jpg",
      "year": "2024",
      "types": [
        "中国动漫"
      ],
      "remarks": "第100集已完结",
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
      "remarks": "第95集已完结",
      "is_new": true
    }
  ],
  "variety": [
    {
      "id": "pb_cat_variety_1",
      "title": "说唱巅峰对决2026",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/sfZawhbu32LxTJAzYfgFObfXl0i.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "音乐竞演",
        "真人秀"
      ],
      "remarks": "总决赛纯享",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_2",
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
      "remarks": "第6期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_3",
      "title": "不想睡的星期五",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/ladRcczkCEFXFxycIleWgx9yV5q.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺",
        "生活"
      ],
      "remarks": "第6期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_4",
      "title": "花儿与少年2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "文化"
      ],
      "remarks": "第2期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_5",
      "title": "你好，星期六 2022",
      "rate": "6.8",
      "cover": "https://img.guangsuimage.com/cover/f9cb3124b5a22b133f21273ef2cb0695.jpg",
      "year": "2022",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第20260918期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_6",
      "title": "超棒的我们 第二季",
      "rate": "10.0",
      "cover": "https://image.tmdb.org/t/p/w500/hua8Mchd3c7a3YcofibTA9I8DRu.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第8期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_7",
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
      "remarks": "Plus版第9期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_8",
      "title": "KuKu聊",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8781854915bdfb582337a784eb6aa33b.jpg",
      "year": "2025",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第20260917期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_9",
      "title": "一个县城女人有啥了不起",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a6da3ece4ed601af58eeac1e1491db5e.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "播客",
        "女性",
        "励志"
      ],
      "remarks": "第1期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_10",
      "title": "爱情保卫战2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/11db11b458eead530c21328893921156.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "情感",
        "观察"
      ],
      "remarks": "第20260917期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_11",
      "title": "梦想改造家第13季",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/rrg87cIKnTvy411Nx3MPjAb0hrD.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "家装改造",
        "真人秀"
      ],
      "remarks": "第260917期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_12",
      "title": "心动的信号第9季",
      "rate": "6.1",
      "cover": "https://image.tmdb.org/t/p/w500/qFplFFQy6zMMplHItcrMAtBEseO.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "社交观察"
      ],
      "remarks": "第7期加更下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_13",
      "title": "脱口秀和Ta的朋友们 第三季",
      "rate": "6.0",
      "cover": "https://image.tmdb.org/t/p/w500/j0HNHpQzWZPVUjjmBULIvG6oCWq.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "脱口秀",
        "喜剧竞演"
      ],
      "remarks": "第9期离场之后",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_14",
      "title": "思想的浪花",
      "rate": "0.0",
      "cover": "https://image.tmdb.org/t/p/w500/5makDK17sDqhXNeIgDjkKUGrxvN.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "脱口秀"
      ],
      "remarks": "第8期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_15",
      "title": "六人定律",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/35d00a18dc210564ab10a1ad59c58c8a.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "播客",
        "明星趣事",
        "文艺"
      ],
      "remarks": "第1期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_16",
      "title": "一饭封神第二季",
      "rate": "6.3",
      "cover": "https://image.tmdb.org/t/p/w500/9dyojjMqquQX30ombDixuZsBISl.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食竞技"
      ],
      "remarks": "第8期下纯享",
      "is_new": true
    }
  ],
  "documentary": [
    {
      "id": "pb_cat_documentary_1",
      "title": "十三邀第九季",
      "rate": "8.8",
      "cover": "https://image.tmdb.org/t/p/w500/jaVXnCKiE3k1O3ULUQ1xFVwZSHg.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片",
        "历史",
        "脱口秀"
      ],
      "remarks": "第14集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_2",
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
      "id": "pb_cat_documentary_3",
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
      "id": "pb_cat_documentary_4",
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
      "id": "pb_cat_documentary_5",
      "title": "兄弟连：薪火永续",
      "rate": "8.8",
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
      "id": "pb_cat_documentary_6",
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
      "id": "pb_cat_documentary_7",
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
      "id": "pb_cat_documentary_8",
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
      "id": "pb_cat_documentary_9",
      "title": "菲托·帕兹：歌中的世界",
      "rate": "5.2",
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
      "id": "pb_cat_documentary_10",
      "title": "神兽猎局",
      "rate": "7.3",
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
      "id": "pb_cat_documentary_11",
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
      "id": "pb_cat_documentary_12",
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
      "id": "pb_cat_documentary_13",
      "title": "转折点：911世代",
      "rate": "6.2",
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
      "id": "pb_cat_documentary_14",
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
      "id": "pb_cat_documentary_15",
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
      "id": "pb_cat_documentary_16",
      "title": "911 Reunited",
      "rate": "8.8",
      "cover": "https://image.tmdb.org/t/p/w500/h1X1nS0PWrS40x4CUBnq8zwoKiD.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片",
        "历史"
      ],
      "remarks": "第3集完结",
      "is_new": true
    }
  ],
  "short": [
    {
      "id": "pb_cat_short_1",
      "title": "师叔她断情证道",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1c1495b6f6e62722ca9c07acf46720c0.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_2",
      "title": "靠当戏精苟命，玩转三大权臣",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/17682441a1951203954b930e79312fbc.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_3",
      "title": "穿成虐文女主后，我绑定了反派系统",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/87a9db0a78e948f71ab069deb0a89a6b.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_4",
      "title": "朝朝暮暮终有时",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8496a6b28e5825b1571c03c17c60e6f9.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_5",
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
      "id": "pb_cat_short_6",
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
      "id": "pb_cat_short_7",
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
      "id": "pb_cat_short_8",
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
      "id": "pb_cat_short_9",
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
      "id": "pb_cat_short_10",
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
      "id": "pb_cat_short_11",
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
      "id": "pb_cat_short_12",
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
      "id": "pb_cat_short_13",
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
      "id": "pb_cat_short_14",
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
      "id": "pb_cat_short_15",
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
      "id": "pb_cat_short_16",
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
      "id": "pb_cat_short_17",
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
      "id": "pb_cat_short_18",
      "title": "落魄书生：开局迎娶俏佳人",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fbd123a4d95c6f8abb19f4993a468354.jpg",
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
      "title": "生逢其时",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/q2ulZwiuO9Gg0bVziimr8CXHdpk.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第26集已完结",
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
      "remarks": "第28集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_3",
      "title": "一瓯春",
      "rate": "9.0",
      "cover": "https://image.tmdb.org/t/p/w500/7KjVhRaarZ5L3CBirQEmt89ioiz.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "复仇爽剧",
        "内地剧"
      ],
      "remarks": "第8集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_4",
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
      "remarks": "第12集",
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
      "title": "阎魔的宠妃",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/86d2641cf8c4473a96c6bbbaaa245f75.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "奇幻爱情",
        "仙侠",
        "内地剧"
      ],
      "remarks": "第24集已完结",
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
      "remarks": "第5集",
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
      "remarks": "第18集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_12",
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
      "id": "pb_cat_rank_13",
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
      "id": "pb_cat_rank_14",
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
      "remarks": "第14集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_15",
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
      "id": "pb_cat_rank_16",
      "title": "监狱雄心",
      "rate": "7.6",
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
      "id": "pb_cat_rank_17",
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
      "id": "pb_cat_rank_18",
      "title": "兰香如故",
      "rate": "7.2",
      "cover": "https://image.tmdb.org/t/p/w500/kfurXRMH1ZkUoyT5HN72zLTQxzZ.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "女性成长",
        "逆袭",
        "内地剧"
      ],
      "remarks": "第18集",
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
