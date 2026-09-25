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
      "id": "pb_cat_tv_2",
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
      "remarks": "第9集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_3",
      "title": "末誓",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/538bb178cf73205573bf842c265f1a69.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "内地剧"
      ],
      "remarks": "第14集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_4",
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
      "remarks": "第32集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_5",
      "title": "寒阳风起春山境",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/406e049b2f3585064598b37495da8e2a.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "剧情",
        "同性",
        "内地剧"
      ],
      "remarks": "番外1",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_6",
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
      "remarks": "第06集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_7",
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
      "remarks": "第19集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_8",
      "title": "法医秦明之天谴者",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/eb5cd76927e1363add49f86da6cab437.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "高智商推理",
        "法医法证",
        "警匪刑侦",
        "内地剧"
      ],
      "remarks": "第10集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_9",
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
      "remarks": "第12集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_10",
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
      "id": "pb_cat_tv_11",
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
      "id": "pb_cat_tv_12",
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
      "remarks": "第25集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_14",
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
      "remarks": "第10集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_15",
      "title": "长生契",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/854b29f0b09d28dc0bf8bd539745e052.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "奇幻",
        "情感",
        "内地剧"
      ],
      "remarks": "第6集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_16",
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
      "remarks": "第25集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_17",
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
      "remarks": "第13集",
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
      "remarks": "第22集",
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
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_20",
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
    }
  ],
  "anime": [
    {
      "id": "pb_cat_anime_1",
      "title": "斗罗大陆II绝世唐门",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4b34871ca5e89bdd680aa05db5e398ed.jpg",
      "year": "2023",
      "types": [
        "中国动漫",
        "玄幻"
      ],
      "remarks": "第172集",
      "is_new": false
    },
    {
      "id": "pb_cat_anime_2",
      "title": "开心锤锤世界",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8d7a61eea541d40205d882cc3f36fc88.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "搞笑",
        "泡面"
      ],
      "remarks": "第73集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_3",
      "title": "刚毕业就末日：万亿开局当神豪动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/77aea29ef4b54d9099634379ed790f25.jpg",
      "year": "2025",
      "types": [
        "中国动漫",
        "系统流",
        "玄幻",
        "动作"
      ],
      "remarks": "第357集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_4",
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
      "remarks": "第170集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_5",
      "title": "大千小镇",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2c0e55555895ab7a61cc2ea419eb6d7c.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "搞笑"
      ],
      "remarks": "第19集",
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
      "remarks": "第191集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_7",
      "title": "魔皇大管家",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/6b7dd1eef93a9c8a69c524492bc0cf56.jpg",
      "year": "2023",
      "types": [
        "中国动漫",
        "东方玄幻",
        "修真",
        "3D",
        "动画"
      ],
      "remarks": "第10集",
      "is_new": false
    },
    {
      "id": "pb_cat_anime_8",
      "title": "神王序列",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0224c7dd6cf7e42283b4f5ab36da134a.jpg",
      "year": "2025",
      "types": [
        "中国动漫",
        "热血",
        "都市",
        "神魔"
      ],
      "remarks": "第210集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_9",
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
      "remarks": "第86集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_10",
      "title": "王者？别闹！",
      "rate": "7.2",
      "cover": "https://img.guangsuimage.com/cover/5c1e4de49d8575440b98077731e7a25f.jpg",
      "year": "2017",
      "types": [
        "中国动漫",
        "喜剧",
        "动画"
      ],
      "remarks": "番外",
      "is_new": false
    },
    {
      "id": "pb_cat_anime_11",
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
      "remarks": "第15集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_12",
      "title": "逆天至尊",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bc44b9e1df4dfc8cbf8a5f08f4ac01a8.jpg",
      "year": "2021",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第552集",
      "is_new": false
    },
    {
      "id": "pb_cat_anime_13",
      "title": "无上神帝",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/03af2dab7923447ee070be156ac70bc7.jpg",
      "year": "2020",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第643集",
      "is_new": false
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
      "remarks": "第102集",
      "is_new": false
    },
    {
      "id": "pb_cat_anime_15",
      "title": "亡灵行者！从鱼人地下城开始 动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e810a0d552ec61be7e15e7ad8706f7d6.jpg",
      "year": "2025",
      "types": [
        "中国动漫"
      ],
      "remarks": "第102集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_16",
      "title": "一家三口闯仙域",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9b4cd431c76954eabbeb84dfab50ec8e.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "穿越",
        "古装"
      ],
      "remarks": "第74集",
      "is_new": true
    }
  ],
  "variety": [
    {
      "id": "pb_cat_variety_1",
      "title": "2026湖南卫视芒果TV中秋之夜",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b2c004ab8ea216f5dbc89929d6ba0ea8.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星",
        "晚会"
      ],
      "remarks": "中秋之夜",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_2",
      "title": "密室大逃脱第八季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4bd8575441a219bc600c27999928e8ed.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "悬疑",
        "密室",
        "综艺",
        "推理"
      ],
      "remarks": "大神版Plus版第10期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_3",
      "title": "一站到底少年季第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9eae1d7b8e91d0b9e88f7a38faa3ad9c.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺"
      ],
      "remarks": "第8期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_4",
      "title": "超级玩家芭莎之夜",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/02c8a743760b73a9f86a428c11732aa9.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "视听盛宴",
        "晚会"
      ],
      "remarks": "正更新",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_5",
      "title": "钱塘老娘舅",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/445c77cfd1c86def7ddd0d14e9bd8948.jpg",
      "year": "2009",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第20260924期",
      "is_new": false
    },
    {
      "id": "pb_cat_variety_6",
      "title": "奔跑吧少年第7季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/19d7bb12e94e1f83d4fdff273181e24d.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "游戏娱乐",
        "真人秀"
      ],
      "remarks": "第6期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_7",
      "title": "一饭封神第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食竞技"
      ],
      "remarks": "第10期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_8",
      "title": "梦想改造家第13季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7464328a7e964400a71614ddaa3c39fc.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "家装改造",
        "真人秀"
      ],
      "remarks": "第260924期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_9",
      "title": "游戏综艺王高能典藏版",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4b501d4dc7e6686d20dd78ea76fa39fc.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "游戏竞技"
      ],
      "remarks": "第1期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_10",
      "title": "思想的浪花",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ab7bec709206a1324c96fea0c238b347.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "脱口秀"
      ],
      "remarks": "第10期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_11",
      "title": "2026中秋奇妙游",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/74444af26e6b2504fc0069beca54d916.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "传统节日",
        "晚会"
      ],
      "remarks": "李一桐刘宇演绎东方美学",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_12",
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
      "remarks": "第7期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_13",
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
      "remarks": "第20260924期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_14",
      "title": "花儿与少年2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "文化"
      ],
      "remarks": "第3期下",
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
      "remarks": "第7期上",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_16",
      "title": "互相关注",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/427957fe5262bd96650e49fe48635b3d.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "访谈节目",
        "明星访谈"
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
      "remarks": "第3集",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_2",
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
      "title": "凤鸣传",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/c0891202851a561fd279c4131dcbff7e.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_2",
      "title": "炼气3000层2",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5c3b51cb7e29ce1aa76e39bec3853422.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_3",
      "title": "狐嫁契约",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/38188bb6f421cce2fc5f7fd44086582b.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_4",
      "title": "我在修真大陆开工厂",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/359ca1250cebfbe8d2a982c2fc753c77.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_5",
      "title": "兰心相照",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/91f3aedd8ec95c0d562e914a877d2427.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_6",
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
      "id": "pb_cat_short_7",
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
      "id": "pb_cat_short_8",
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
      "id": "pb_cat_short_9",
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
      "id": "pb_cat_short_10",
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
      "id": "pb_cat_short_11",
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
      "id": "pb_cat_short_12",
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
      "id": "pb_cat_short_13",
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
      "id": "pb_cat_short_14",
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
      "id": "pb_cat_short_15",
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
      "id": "pb_cat_short_16",
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
      "id": "pb_cat_short_17",
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
      "id": "pb_cat_short_18",
      "title": "我，剑圣！昆仑山签到一百年",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b3325e0db8d71edfd25c211787a18919.jpg",
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
