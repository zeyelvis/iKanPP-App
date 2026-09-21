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
      "title": "碧血蓝天",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e51d437f5983cfb4072eff2d30ce731f.jpg",
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
      "id": "pb_cat_movie_20",
      "title": "破暗",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3bc235d7af5589b1ddf7b96ee1c4cda6.jpg",
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
      "remarks": "第24集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_2",
      "title": "交锋",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c2eff6732858311bcb38f406692da90f.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第34集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_3",
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
      "remarks": "第14集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_4",
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
      "id": "pb_cat_tv_5",
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
      "remarks": "第18集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_6",
      "title": "云边不打烊",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7e4d5db053826a6096a227979ba78f65.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "都市爱情",
        "内地剧"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_7",
      "title": "妾本草芥",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e2f522f1c68c7336f56bb2f9524df188.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "内地剧"
      ],
      "remarks": "第17集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_8",
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
      "id": "pb_cat_tv_9",
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
      "remarks": "第06集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_10",
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
      "remarks": "第15集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_11",
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
      "remarks": "第05集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_12",
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
      "remarks": "第7集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_13",
      "title": "猎罪现场",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/94a17b32720e835ec9f9ff71445f2426.jpg",
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
      "id": "pb_cat_tv_14",
      "title": "天赐娘子·小镖师",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c375be6b5cae946ef86524a792993b9f.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "喜剧",
        "爱情",
        "古装",
        "内地剧"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_15",
      "title": "请记住我的名字",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/893c9483e4e4645d8dd91342c128cdbe.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "同性",
        "内地剧"
      ],
      "remarks": "第6集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_16",
      "title": "无间道3",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/95bd44ba2753b364af4bbf0775854a38.jpg",
      "year": "2017",
      "types": [
        "大陆剧",
        "悬疑",
        "罪案",
        "警匪",
        "内地剧"
      ],
      "remarks": "第12集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_17",
      "title": "无间道",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d68832575869ce6bfe3c9ea485d338a9.jpg",
      "year": "2016",
      "types": [
        "大陆剧",
        "悬疑",
        "警匪",
        "都市",
        "内地剧"
      ],
      "remarks": "第12集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_18",
      "title": "别了，温哥华",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8c4ea07ab65173712a9b927b7717bc6e.jpg",
      "year": "2003",
      "types": [
        "大陆剧",
        "都市爱情",
        "言情",
        "都市",
        "内地剧"
      ],
      "remarks": "第22集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_19",
      "title": "无间道第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a7efee65c6b77c9a43e7aa59587f6c7e.jpg",
      "year": "2017",
      "types": [
        "大陆剧",
        "悬疑",
        "警匪",
        "罪案",
        "内地剧"
      ],
      "remarks": "第12集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_20",
      "title": "无间道2",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a7efee65c6b77c9a43e7aa59587f6c7e.jpg",
      "year": "2017",
      "types": [
        "大陆剧",
        "悬疑",
        "警匪",
        "罪案",
        "内地剧"
      ],
      "remarks": "第12集已完结",
      "is_new": true
    }
  ],
  "anime": [
    {
      "id": "pb_cat_anime_1",
      "title": "吞噬星空",
      "rate": "6.8",
      "cover": "https://img.guangsuimage.com/cover/1e81d9ddb81fa08481c942a7f794300e.jpg",
      "year": "2020",
      "types": [
        "中国动漫",
        "科幻",
        "动画"
      ],
      "remarks": "第242集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_2",
      "title": "逆天至尊",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bc44b9e1df4dfc8cbf8a5f08f4ac01a8.jpg",
      "year": "2021",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第551集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_3",
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
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_4",
      "title": "大荒妖君，为我赴凡尘",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c38648b6e838613f6158e3db05942d53.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "恋爱",
        "治愈"
      ],
      "remarks": "第3集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_5",
      "title": "斗罗大陆4终极斗罗 合集",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5aaa24c3ab499a42ff9e8b0be143a1b6.jpg",
      "year": "2024",
      "types": [
        "中国动漫",
        "玄幻修真",
        "东方玄幻",
        "动态漫画"
      ],
      "remarks": "第205集",
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
      "remarks": "第166集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_7",
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
      "remarks": "第187集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_8",
      "title": "雾镜狐月",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2fc8f02c289ba301ecff622410403e8d.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "虐心",
        "奇幻"
      ],
      "remarks": "第30集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_9",
      "title": "牛大力作妖记",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f948a0d891d3928d5a31f319a01a614f.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "搞笑动画"
      ],
      "remarks": "第06集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_10",
      "title": "摆烂成仙",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1b4c1afae2a4477623cf0c6b148a5dbe.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "修仙",
        "玄幻"
      ],
      "remarks": "第9集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_11",
      "title": "红妆送君葬",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/93ae0d44b350540f196d8bcde3ddeca3.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "古风"
      ],
      "remarks": "第60集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_12",
      "title": "一斩苍穹",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/80edc839105c1689cdc84a8258d2edd3.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "动漫"
      ],
      "remarks": "第10集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_13",
      "title": "修仙归来当大佬",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3c38bf04ae972211c47d7de393fcccc8.jpg",
      "year": "2023",
      "types": [
        "中国动漫"
      ],
      "remarks": "第711集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_14",
      "title": "无上神帝",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/03af2dab7923447ee070be156ac70bc7.jpg",
      "year": "2020",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第642集",
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
      "remarks": "第60集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_16",
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
      "remarks": "第127集",
      "is_new": true
    }
  ],
  "variety": [
    {
      "id": "pb_cat_variety_1",
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
      "remarks": "小加更第7期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_2",
      "title": "钱塘老娘舅",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/445c77cfd1c86def7ddd0d14e9bd8948.jpg",
      "year": "2009",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第20260920期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_3",
      "title": "心动的信号第9季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "社交观察"
      ],
      "remarks": "第8期中纯享",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_4",
      "title": "奔跑吧少年第7季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/19d7bb12e94e1f83d4fdff273181e24d.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "游戏娱乐",
        "真人秀"
      ],
      "remarks": "第2期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_5",
      "title": "毛雪汪",
      "rate": "7.2",
      "cover": "https://img.guangsuimage.com/cover/1e06ec8cf0abf417f8c787235f66f350.jpg",
      "year": "2021",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第156期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_6",
      "title": "星动网球社",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2549a06a9e3556ebc9ac6433959a1e5a.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "球类",
        "竞技"
      ],
      "remarks": "第1期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_7",
      "title": "我家那闺女2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/26341e155670d44627317021c84245ac.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星",
        "真人秀"
      ],
      "remarks": "加更版第4期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_8",
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
      "remarks": "第6期母带1",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_9",
      "title": "伦敦合伙人",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/56448fb13eecfe67571619e16a2f9fea.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺"
      ],
      "remarks": "超长营业第7期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_10",
      "title": "舞蹈新风暴",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/854748b11de4be0ab4ed4b24f76b94eb.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "歌舞",
        "真人秀"
      ],
      "remarks": "风暴进行时第4期",
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
      "remarks": "加更版第5期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_12",
      "title": "博物馆夜行指楠",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/00ac8c9b984ddfc64cb9f1923348e225.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "文化",
        "娱乐",
        "播客"
      ],
      "remarks": "第3期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_13",
      "title": "哥哥来啦",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0e87319c7bbff7c0fb9904f138570582.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星",
        "真人秀"
      ],
      "remarks": "第5期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_14",
      "title": "手信集·青岛篇",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3e1a813196d7bfc007bedb02c7956842.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "情感"
      ],
      "remarks": "第5期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_15",
      "title": "湾区升明月2026大湾区电影音乐晚会",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/75fbf002ed9d924c8df2d29144e463c0.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "晚会"
      ],
      "remarks": "第1期纯享版",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_16",
      "title": "向前一步2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8a92fe99ca57b8b5560f69723979ffc7.jpg",
      "year": "2026",
      "types": [
        "大陆综艺"
      ],
      "remarks": "第20260920期",
      "is_new": true
    }
  ],
  "documentary": [
    {
      "id": "pb_cat_documentary_1",
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
      "id": "pb_cat_documentary_2",
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
      "id": "pb_cat_documentary_3",
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
      "id": "pb_cat_documentary_4",
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
      "id": "pb_cat_documentary_5",
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
      "id": "pb_cat_documentary_10",
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
      "id": "pb_cat_documentary_11",
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
      "id": "pb_cat_documentary_12",
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
      "id": "pb_cat_documentary_13",
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
      "id": "pb_cat_documentary_14",
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
      "id": "pb_cat_documentary_15",
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
    },
    {
      "id": "pb_cat_documentary_16",
      "title": "911 Reunited",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3e74d4efb63e0f6f60c6097ce1085dfa.jpg",
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
      "id": "pb_cat_short_2",
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
      "id": "pb_cat_short_3",
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
      "id": "pb_cat_short_4",
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
      "id": "pb_cat_short_5",
      "title": "我是京城第一告状精",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ef88fdf7ee0b2841ddb5a82c24017c5c.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_6",
      "title": "宗门里除了我都是卧底短剧",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d2361761b2c16e7b6ef6f6b1a17c2fe3.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_7",
      "title": "我画的魔王活过来了",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/497ff166f185ca28f5204a9b63f68b92.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_8",
      "title": "这个乞丐会抄诗",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3da4c8cefbe5b7998f05bb990a1871b9.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_9",
      "title": "一纸误春深",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/812a15627ae8c6404021c744bb56e64b.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_10",
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
      "id": "pb_cat_short_11",
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
      "id": "pb_cat_short_12",
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
      "id": "pb_cat_short_13",
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
      "id": "pb_cat_short_14",
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
      "id": "pb_cat_short_15",
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
      "id": "pb_cat_short_16",
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
      "id": "pb_cat_short_17",
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
      "id": "pb_cat_short_18",
      "title": "我在古代，靠召唤系统逍遥自在",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c20b8cf7e3996c8ded8bc426c7882845.jpg",
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
      "id": "pb_cat_rank_2",
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
      "id": "pb_cat_rank_3",
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
      "title": "碧血蓝天",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e51d437f5983cfb4072eff2d30ce731f.jpg",
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
      "id": "pb_cat_rank_18",
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
