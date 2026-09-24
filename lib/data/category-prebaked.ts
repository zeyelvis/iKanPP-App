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
      "title": "一击3",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/af92dca3544d5e5ed05682bdb9b863b6.jpg",
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
      "title": "狮拳",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/72849f9494c9be0678f160e2837d7f16.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_3",
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
      "id": "pb_cat_movie_4",
      "title": "逃出绝命街",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/aa8800575ee95da62f14ae1ec635d231.jpg",
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
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/dd98ca414b8565cf33c285781d75c6a1.jpg",
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
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b19005ea98350860fc5dd7dd9ae99be2.jpg",
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
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e56a79be3e4b7537222905f571a0d4b3.jpg",
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
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7a69af541acf50223d4d446a762af1cf.jpg",
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
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/68fbe9790662f9f667a9686803519714.jpg",
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
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/91b2c65083593ceb9a0aebf1ad39d601.jpg",
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
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7485b644403627612cc11d3e80ffa907.jpg",
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
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/74b83a50be74bf1d20c0722216f5eaaf.jpg",
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
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d4dcef7c6eb8d95f1e7beed9cd6f6aa1.jpg",
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
      "cover": "https://img.guangsuimage.com/cover/80dfbcb5e15a4ce875452354c3f85772.jpg",
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
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b7a12744f5dcc23be8ff48d062b810c2.jpg",
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
      "title": "器子",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/87caf7c42aedbada42572e2374eed08d.jpg",
      "year": "2025",
      "types": [
        "动作片",
        "剧情",
        "动作",
        "犯罪"
      ],
      "remarks": "正片",
      "is_new": true
    }
  ],
  "tv": [
    {
      "id": "pb_cat_tv_1",
      "title": "法医秦明之龙番往事",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4ac9f92e3a113e08be6ea8bb19232ac9.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "犯罪",
        "悬疑",
        "内地剧"
      ],
      "remarks": "第8集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_2",
      "title": "兰香如故",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ea1f901d18c2ec1083053ba1e243c737.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "女性成长",
        "逆袭",
        "内地剧"
      ],
      "remarks": "第30集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_3",
      "title": "杨光的快乐生活8",
      "rate": "6.8",
      "cover": "https://img.guangsuimage.com/cover/d2c6571c425b36af3cc01ffe48c2364a.jpg",
      "year": "2011",
      "types": [
        "大陆剧",
        "剧情",
        "喜剧",
        "内地剧"
      ],
      "remarks": "第34集完结",
      "is_new": false
    },
    {
      "id": "pb_cat_tv_4",
      "title": "我不是大师",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/df31a636d493b0e715a5978a1c873f64.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "男性传奇",
        "局中局",
        "反转",
        "内地剧"
      ],
      "remarks": "第04集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_5",
      "title": "一瓯春",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fab55811525be3d6e53a950bf168117b.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "复仇爽剧",
        "内地剧"
      ],
      "remarks": "第17集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_6",
      "title": "杨光的快乐生活7",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a098e41f026d8a5deb0c243f4120a958.jpg",
      "year": "2010",
      "types": [
        "大陆剧",
        "内地剧"
      ],
      "remarks": "第38集完结",
      "is_new": false
    },
    {
      "id": "pb_cat_tv_7",
      "title": "隋唐英雄传",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4358b34290de9fb2a4b9a1f99df07be2.jpg",
      "year": "2003",
      "types": [
        "大陆剧",
        "传统武侠",
        "古装",
        "内地剧"
      ],
      "remarks": "第40集已完结",
      "is_new": false
    },
    {
      "id": "pb_cat_tv_8",
      "title": "为爱正名",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1f0815a80baee53ee652513578406913.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "甜虐爱情",
        "姐妹情",
        "内地剧"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_9",
      "title": "汉武大帝",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/22ed291fcf6df13dd6af452b9f42f6da.jpg",
      "year": "2005",
      "types": [
        "大陆剧",
        "历史",
        "古装",
        "内地剧"
      ],
      "remarks": "第58集已完结",
      "is_new": false
    },
    {
      "id": "pb_cat_tv_10",
      "title": "妾本草芥",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e2f522f1c68c7336f56bb2f9524df188.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "内地剧"
      ],
      "remarks": "第21集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_11",
      "title": "云雀叫天录",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/238cded6b2966171e52be1ee183fb684.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "年代剧",
        "传记",
        "内地剧"
      ],
      "remarks": "第24集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_12",
      "title": "黑岛监狱",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bc546801ff7ef8532c95880bb285f5e6.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "警匪罪案",
        "刑侦破案",
        "悬疑",
        "内地剧"
      ],
      "remarks": "第8集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_13",
      "title": "行镖",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/047f25ce6a0ad2031887e573c86a5b1a.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "东方玄幻",
        "英雄成长",
        "内地剧"
      ],
      "remarks": "第08集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_14",
      "title": "独剑九天",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f8dca9e824c5476762c6acf77aaaecec.jpg",
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
      "id": "pb_cat_tv_15",
      "title": "未尽之言",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bfaeb0ee5a41baa95b88e78c0a03bcb6.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "罪案纪实",
        "都市",
        "内地剧"
      ],
      "remarks": "第20集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_16",
      "title": "如期",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a5db9511167ff953ebd55f453004abc8.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "奇幻爱",
        "情",
        "甜虐爱情",
        "内地剧"
      ],
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_17",
      "title": "熔城",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2f49a8356e755a4c57432fdac4a3030b.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "男性传奇",
        "抗日战争",
        "内地剧"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_18",
      "title": "南洋识骨",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c843481f52d8eeb5c03a8cbbf48355d7.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "超能力",
        "惊悚",
        "年代",
        "内地剧"
      ],
      "remarks": "第12集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_19",
      "title": "今日宜偏爱",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8daee3f0920e09d1d974db673eec47ec.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "都市爱情",
        "内地剧"
      ],
      "remarks": "第10集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_20",
      "title": "杨光的快乐生活6",
      "rate": "7.9",
      "cover": "https://img.guangsuimage.com/cover/0a9968ea516328d1d65e31258deab042.jpg",
      "year": "2009",
      "types": [
        "大陆剧",
        "喜剧",
        "内地剧"
      ],
      "remarks": "第22集完结",
      "is_new": false
    }
  ],
  "anime": [
    {
      "id": "pb_cat_anime_1",
      "title": "天灾末世，她囤满物资后所向披靡！",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1f89a6014e659ecc77ec21b090eb5cbc.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "末世"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_2",
      "title": "天灾末世，她囤满物资后所向披靡第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ff261cb050c634febdeb5ab260bf6f80.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "科幻",
        "末世"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_3",
      "title": "完美世界",
      "rate": "7.0",
      "cover": "https://img.guangsuimage.com/cover/c68df1093a93023d0960841f27224080.jpg",
      "year": "2021",
      "types": [
        "中国动漫",
        "剧情",
        "动画",
        "奇幻"
      ],
      "remarks": "第288集",
      "is_new": false
    },
    {
      "id": "pb_cat_anime_4",
      "title": "狐妖小红娘黄风岭篇",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/726612e9c6061c7c6600857715199e21.jpg",
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
      "remarks": "第08集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_5",
      "title": "诛仙最终季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e255ba0d78af223ff77727dea645f1a1.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "东方",
        "仙侠",
        "玄幻"
      ],
      "remarks": "第08集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_6",
      "title": "天灾末世，她囤满物资后所向披靡第三季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3bcf68dfd7fb2555d719e6f930cdfc8b.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "末世",
        "战神"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_7",
      "title": "时光代理人第三季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3f72ed6b3450fd69ca10c75c94b0bb4f.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "剧情",
        "动作",
        "科幻",
        "动画",
        "悬疑"
      ],
      "remarks": "第8集",
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
      "remarks": "第169集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_9",
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
      "remarks": "第190集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_10",
      "title": "我怎么会嫁给一个反派",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/edcbb16417f7a00253240c23ef93dfb6.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "动漫"
      ],
      "remarks": "第24集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_11",
      "title": "甲武神",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7e7a5f8546ebd7950b3d484e725f66b2.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "热血",
        "冒险",
        "奇幻"
      ],
      "remarks": "第10集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_12",
      "title": "一只叫囧的熊决定要快乐",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/199a777aa2d5adb3a49b14c34a5506f0.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "生活故事动画",
        "儿童故事"
      ],
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_13",
      "title": "雪王来了！",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/feabaad0fa2e8df89c5180532cb7ff35.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "原创",
        "搞笑",
        "日常",
        "萌系"
      ],
      "remarks": "第14集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_14",
      "title": "我只想安静地打游戏第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/cf56ae83ca8ef703bab87b3bec14f42e.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "都市奇幻",
        "国漫",
        "奇幻冒险"
      ],
      "remarks": "第122集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_15",
      "title": "长生猫",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8d0cb398135902fbbe6fc9c7a6b86655.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "冒险",
        "悬疑",
        "奇幻"
      ],
      "remarks": "第30集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_16",
      "title": "我家娘子竟是当朝女帝",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/30242cff0f775d3e3bb483f48e6849a8.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "穿越",
        "古装",
        "恋爱"
      ],
      "remarks": "第16集",
      "is_new": true
    }
  ],
  "variety": [
    {
      "id": "pb_cat_variety_1",
      "title": "脱口秀和Ta的朋友们 第三季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a5a145919123f9541e89868ab2796244.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "脱口秀",
        "喜剧竞演"
      ],
      "remarks": "第10期离场之后",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_2",
      "title": "毛雪汪（2026）",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/da04762eb0c15088e2a13703d0e15388.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "脱口秀",
        "生活观察"
      ],
      "remarks": "20260923汪子问问问",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_3",
      "title": "一饭封神第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食竞技"
      ],
      "remarks": "第9期下纯享",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_4",
      "title": "心动的信号第9季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "社交观察"
      ],
      "remarks": "第8期加更下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_5",
      "title": "一路向海的少年",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/24f251cb9569d43975c1feebb0a61c02.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "旅行节目",
        "游戏节目",
        "生活"
      ],
      "remarks": "第8期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_6",
      "title": "中国平安大地之歌青春芒果节专场音乐会",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/feef0322a34245d142dfd603913667dc.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "音乐现场"
      ],
      "remarks": "第260924期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_7",
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
      "remarks": "第9期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_8",
      "title": "思想的浪花",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ab7bec709206a1324c96fea0c238b347.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "脱口秀"
      ],
      "remarks": "第9期上",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_9",
      "title": "食神·百厨大战",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e98043c16265282fb185adf9e8b7d197.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食",
        "真人秀"
      ],
      "remarks": "第14期加更",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_10",
      "title": "花儿与少年2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "文化"
      ],
      "remarks": "超前营业第3期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_11",
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
      "remarks": "聚乐部第4期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_12",
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
      "remarks": "第20260923期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_13",
      "title": "娜就聊姐姐",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a7ee11c99daa86125832bfc5e5a06cce.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星趣事",
        "女性"
      ],
      "remarks": "第4期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_14",
      "title": "我家那闺女2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/26341e155670d44627317021c84245ac.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星",
        "真人秀"
      ],
      "remarks": "盲盒大放送第8期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_15",
      "title": "大哥小助理",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9dac9db8204abfacece76632f697b6ec.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "职业体验",
        "真人秀",
        "观察"
      ],
      "remarks": "第6期母带4",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_16",
      "title": "2026微博音乐盛典",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/56f90cc01997b24e76a1add745e8c982.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "视听盛宴",
        "晚会",
        "颁奖典礼",
        "明星演唱"
      ],
      "remarks": "红毯回顾",
      "is_new": true
    }
  ],
  "documentary": [
    {
      "id": "pb_cat_documentary_1",
      "title": "战争游戏2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/de2a35e78a80fd8380ed45dcb56b7337.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "第1集",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_2",
      "title": "一个致命故事",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/eb2fc50027cc7b4e506a87b9a6f98a80.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片",
        "犯罪"
      ],
      "remarks": "第2集",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_3",
      "title": "十三邀第九季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2906dda4fedb740e57e75cbca80e6025.jpg",
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
      "id": "pb_cat_documentary_4",
      "title": "普法栏目剧2011年",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ce9858d6de8887d99ebcc487e7eccde1.jpg",
      "year": "2011",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "走出泥潭下",
      "is_new": false
    },
    {
      "id": "pb_cat_documentary_5",
      "title": "柯南势在必行第三季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/017cbe61413e59cdc7370d4017bd3d91.jpg",
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
      "id": "pb_cat_documentary_6",
      "title": "兄弟连：薪火永续",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/69580446ed4cda7f15b67e2816f7203a.jpg",
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
      "id": "pb_cat_documentary_8",
      "title": "体坛秘史：文斯·扬的人生剖白",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0f8f4f94574b821c8d86eb62370cfa4c.jpg",
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
      "id": "pb_cat_documentary_10",
      "title": "菲托·帕兹：歌中的世界",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/27e27a098527fd9af6e0fbf2fda8d29a.jpg",
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
      "title": "神兽猎局",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7040a2c436110ffc37957d80ca3ebe6e.jpg",
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
      "id": "pb_cat_documentary_12",
      "title": "体坛秘史：霹雳舞博士雷切尔·冈恩",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1bcc312ff0527fb291ade0dbe7657e2f.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_13",
      "title": "失窃王国",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e725091c02879fc0a3492d83e84f91ea.jpg",
      "year": "2025",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_14",
      "title": "转折点：911世代",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c665b8e98acc9e422eb5ba424d0fa8ab.jpg",
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
      "id": "pb_cat_documentary_15",
      "title": "前浪第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0bb7d661835fdc1d627d409025e18f67.jpg",
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
      "id": "pb_cat_documentary_16",
      "title": "最后一课",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/28e1ca1658136b6fffe7519320d9c2d1.jpg",
      "year": "2025",
      "types": [
        "记录片",
        "纪录片",
        "传记"
      ],
      "remarks": "正片",
      "is_new": true
    }
  ],
  "short": [
    {
      "id": "pb_cat_short_1",
      "title": "布衣镇山河2",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d570ad70c7fd2207a7ad9e4d0c4279c5.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_2",
      "title": "与君共覆局",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4096eb99b2dcc802c9723fc99455988e.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_3",
      "title": "我在修仙界摆摊",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c2da40ed0c4c4fb524748bc570299550.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_4",
      "title": "以庶换嫡：本嫡女不伺候了",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/26eed9b9280ec3c193b24a2c877a1470.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_5",
      "title": "镇国公世子之卧底情深",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fe4c72a2eefd7abb77969461ac82c638.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_6",
      "title": "师姐断我五行道我御兽飞升",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/77743b3fe8245764cfbe77a90e892504.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_7",
      "title": "二嫁有喜",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a927f9cf77210d063ae2868ef0747798.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_8",
      "title": "娘娘有点野，靠弑君补贴家用",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/68e351e42bf60dd7fbf079668a4e537c.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_9",
      "title": "重生废皇子",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a36b2f382191582727ab5d5ab2c9892c.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_10",
      "title": "锁金枝",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/783d6a25635e8f73eba03470f4be05c9.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_11",
      "title": "挟恩图报，高冷王爷步步沦陷",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0389905733927737301864366717f117.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_12",
      "title": "烬明月",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/97d63afca231917ef171ad40094d306d.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_13",
      "title": "我，剑圣！昆仑山签到一百年",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b3325e0db8d71edfd25c211787a18919.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_14",
      "title": "九幽圣体：被废丹田后我横推仙道",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/89198c50baf29b27d1699162c12e52e6.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_15",
      "title": "刺桐花开",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/84af3e7804a96c72cd0ed638dcf981d8.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_16",
      "title": "我在皇宫开动物园",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c32cbe2acc8f0fed81856c7a3649718c.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_17",
      "title": "救命！我那么一个温柔夫君呢",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0c64004685e61f0d97edc8c33b4dea76.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_18",
      "title": "我是京城第一告状精",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ef88fdf7ee0b2841ddb5a82c24017c5c.jpg",
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
      "title": "一击3",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/af92dca3544d5e5ed05682bdb9b863b6.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_2",
      "title": "狮拳",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/72849f9494c9be0678f160e2837d7f16.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_3",
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
      "id": "pb_cat_rank_4",
      "title": "逃出绝命街",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/aa8800575ee95da62f14ae1ec635d231.jpg",
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
      "id": "pb_cat_rank_5",
      "title": "蜂鸟行动",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/dd98ca414b8565cf33c285781d75c6a1.jpg",
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
      "title": "叛谍猎手",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b19005ea98350860fc5dd7dd9ae99be2.jpg",
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
      "id": "pb_cat_rank_7",
      "title": "无情的拳头",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e56a79be3e4b7537222905f571a0d4b3.jpg",
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
      "title": "热血部落",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7a69af541acf50223d4d446a762af1cf.jpg",
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
      "id": "pb_cat_rank_9",
      "title": "山竹刀",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/68fbe9790662f9f667a9686803519714.jpg",
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
      "id": "pb_cat_rank_10",
      "title": "异种污染",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/91b2c65083593ceb9a0aebf1ad39d601.jpg",
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
      "id": "pb_cat_rank_11",
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
      "id": "pb_cat_rank_12",
      "title": "神拳赌约",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7485b644403627612cc11d3e80ffa907.jpg",
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
      "id": "pb_cat_rank_13",
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
      "id": "pb_cat_rank_14",
      "title": "乱世杀局",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/74b83a50be74bf1d20c0722216f5eaaf.jpg",
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
      "id": "pb_cat_rank_15",
      "title": "监狱雄心",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d4dcef7c6eb8d95f1e7beed9cd6f6aa1.jpg",
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
      "title": "速战速决",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b7a12744f5dcc23be8ff48d062b810c2.jpg",
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
      "id": "pb_cat_rank_17",
      "title": "器子",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/87caf7c42aedbada42572e2374eed08d.jpg",
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
      "id": "pb_cat_rank_18",
      "title": "法医秦明之龙番往事",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4ac9f92e3a113e08be6ea8bb19232ac9.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "犯罪",
        "悬疑",
        "内地剧"
      ],
      "remarks": "第8集",
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
