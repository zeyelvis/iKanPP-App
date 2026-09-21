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
      "id": "pb_cat_tv_2",
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
      "id": "pb_cat_tv_3",
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
      "remarks": "第22集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_4",
      "title": "交锋",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c2eff6732858311bcb38f406692da90f.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第32集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_5",
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
      "id": "pb_cat_tv_6",
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
      "id": "pb_cat_tv_7",
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
      "id": "pb_cat_tv_8",
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
      "id": "pb_cat_tv_9",
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
    },
    {
      "id": "pb_cat_tv_10",
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
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_11",
      "title": "济公之降龙除妖",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/dd483b9b4964c66303908e32bce43481.jpg",
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
      "title": "车轮下的真相",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9919ff0c70f967d2c04de979d880d48a.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "刑侦破案",
        "警匪",
        "悬疑",
        "内地剧"
      ],
      "remarks": "第30集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_13",
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
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_14",
      "title": "荣耀的阶梯",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ce6f2a8a3aac3138c6804a6b2af0c58b.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "都市爱情",
        "复仇",
        "内地剧"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_15",
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
      "remarks": "第14集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_16",
      "title": "异世界",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b97fffc285f450059fa7838ca653ff23.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "科幻冒险",
        "穿越",
        "内地剧"
      ],
      "remarks": "第16集已完结",
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
      "remarks": "第17集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_18",
      "title": "妾本草芥",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e2f522f1c68c7336f56bb2f9524df188.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "内地剧"
      ],
      "remarks": "第15集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_19",
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
      "remarks": "第04集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_20",
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
    }
  ],
  "anime": [
    {
      "id": "pb_cat_anime_1",
      "title": "稀有祖宗",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c6e015b9e45c233d448f493abcb06597.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "原创动画",
        "国漫",
        "都市奇幻"
      ],
      "remarks": "第124集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_2",
      "title": "最强仙尊陈北玄 第四季·动态漫",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9ea94aee3e419f6c26dcb261e6362433.jpg",
      "year": "2024",
      "types": [
        "中国动漫"
      ],
      "remarks": "第426集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_3",
      "title": "成也萧河",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/04ffa9271faf54ddbfc41f5d9b02aa1b.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第10集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_4",
      "title": "仙逆",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/896b690b9566f53a875e03a3a324c091.jpg",
      "year": "2023",
      "types": [
        "中国动漫"
      ],
      "remarks": "第159集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_5",
      "title": "邪魔墨然",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/feaf23482ff4eb0c97088b7e1c948e4e.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "动作",
        "动画",
        "惊悚",
        "奇幻"
      ],
      "remarks": "第34集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_6",
      "title": "财神窦占龙",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/35d1c6945f7caae6fdbf53b248dd79df.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "热血冒险",
        "奇幻",
        "武侠"
      ],
      "remarks": "第8集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_7",
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
      "remarks": "第165集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_8",
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
      "remarks": "第186集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_9",
      "title": "反派大师兄 师妹们不按套路出牌·动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f0d101a2a09b93f2af88f31a5e95f1dd.jpg",
      "year": "2024",
      "types": [
        "中国动漫",
        "玄幻"
      ],
      "remarks": "第141集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_10",
      "title": "我带超市穿到古代养丞相",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/df10c586367d4e304e069c63783f042f.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "动漫"
      ],
      "remarks": "第74集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_11",
      "title": "武神主宰",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e4263fd4a14819a2b3dfe2730abe3226.jpg",
      "year": "2020",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第693集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_12",
      "title": "高温末世我靠窑洞逆袭",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/383039867253008a2329c2dd81692a8e.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "末日",
        "灾难",
        "生活"
      ],
      "remarks": "第9集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_13",
      "title": "我一剑劈开了天门",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f54a993e214a2ab48c6382550feefe94.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "逆袭",
        "励志"
      ],
      "remarks": "第40集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_14",
      "title": "云霄少年守山河",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8f5a87906db1b5372815e95644395fca.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "反转",
        "脑洞"
      ],
      "remarks": "第29集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_15",
      "title": "废太子签到，弹指镇宗门",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d4a85dff733eee5de22c6291e2bf3440.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "搞笑",
        "穿越",
        "系统"
      ],
      "remarks": "第39集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_16",
      "title": "牧神记",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1303f700901b0618800c94479308df8d.jpg",
      "year": "2024",
      "types": [
        "中国动漫",
        "玄幻",
        "热血",
        "战斗"
      ],
      "remarks": "第101集",
      "is_new": true
    }
  ],
  "variety": [
    {
      "id": "pb_cat_variety_1",
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
      "remarks": "三公观演区下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_2",
      "title": "开始奏乐开始舞",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5119e3ea8312f864ed2cfb21bba62110.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "音乐"
      ],
      "remarks": "第7期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_3",
      "title": "友你的旅行",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9d7929981ee34fdd2d0096997655d721.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "娱乐",
        "旅游",
        "文化"
      ],
      "remarks": "第9期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_4",
      "title": "家乡美食大赛",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fdd1e361d5de6fbf55e11f9cb205145e.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺"
      ],
      "remarks": "川渝站第1集",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_5",
      "title": "奔跑吧少年第7季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/19d7bb12e94e1f83d4fdff273181e24d.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "游戏娱乐",
        "真人秀"
      ],
      "remarks": "第1期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_6",
      "title": "潮创新生力",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8b14f79688c0146367914b8240be4128.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "综艺"
      ],
      "remarks": "第3期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_7",
      "title": "打歌2026·X舞台",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/15a14d5c27bb3d97f6380cbd051efe77.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "视听盛宴",
        "音乐表演"
      ],
      "remarks": "第2期精编版",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_8",
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
      "remarks": "沙滩号第7期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_9",
      "title": "一饭封神第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食竞技"
      ],
      "remarks": "家常菜第8期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_10",
      "title": "我家那闺女2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/26341e155670d44627317021c84245ac.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星",
        "真人秀"
      ],
      "remarks": "第4期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_11",
      "title": "你好，星期六 2022",
      "rate": "6.8",
      "cover": "https://img.guangsuimage.com/cover/f9cb3124b5a22b133f21273ef2cb0695.jpg",
      "year": "2022",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第20260920期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_12",
      "title": "花儿与少年2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "文化"
      ],
      "remarks": "加更版第2期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_13",
      "title": "心动的信号第9季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "社交观察"
      ],
      "remarks": "260920花絮特辑",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_14",
      "title": "职来职往2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/161c62b91445d360dbde2644a02e640e.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "职场节目",
        "求职"
      ],
      "remarks": "秋招季第2期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_15",
      "title": "地球超新鲜 第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b9157fcbb292322b146460825507c6a3.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "旅行节目",
        "生活体验",
        "美食生活"
      ],
      "remarks": "回顾特辑第1期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_16",
      "title": "你好时光第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1cb74d812726cf83fb69ae13520e80d2.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺",
        "真人秀"
      ],
      "remarks": "第4期",
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
      "id": "pb_cat_short_2",
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
      "id": "pb_cat_short_3",
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
      "id": "pb_cat_short_4",
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
      "id": "pb_cat_short_5",
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
      "id": "pb_cat_short_6",
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
      "id": "pb_cat_short_7",
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
      "id": "pb_cat_short_8",
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
      "id": "pb_cat_short_9",
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
      "id": "pb_cat_short_10",
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
      "id": "pb_cat_short_11",
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
      "id": "pb_cat_short_12",
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
      "id": "pb_cat_short_13",
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
      "id": "pb_cat_short_14",
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
      "id": "pb_cat_short_15",
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
      "id": "pb_cat_short_16",
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
      "id": "pb_cat_short_17",
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
      "id": "pb_cat_short_18",
      "title": "太后归来，先帝竟成了我的大学老师",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9b23e3107a223e5ca7f9fd565a51cc52.jpg",
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
