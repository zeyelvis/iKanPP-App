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
      "title": "副警长2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1d3066af6e7e3abefb481f89651e3b42.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "惊悚",
        "犯罪"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_2",
      "title": "夺命狂花2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2b2b87f802fa14e8303a28f3fc5402eb.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "犯罪",
        "动作",
        "悬疑"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_3",
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
      "id": "pb_cat_movie_4",
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
      "id": "pb_cat_movie_5",
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
      "id": "pb_cat_movie_6",
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
      "id": "pb_cat_movie_7",
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
      "id": "pb_cat_movie_8",
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
      "id": "pb_cat_movie_9",
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
      "id": "pb_cat_movie_10",
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
      "id": "pb_cat_movie_11",
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
      "id": "pb_cat_movie_12",
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
      "id": "pb_cat_movie_13",
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
      "id": "pb_cat_movie_14",
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
      "id": "pb_cat_movie_15",
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
      "id": "pb_cat_movie_16",
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
      "id": "pb_cat_movie_17",
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
      "id": "pb_cat_movie_18",
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
      "id": "pb_cat_movie_19",
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
    }
  ],
  "tv": [
    {
      "id": "pb_cat_tv_1",
      "title": "无可替代",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0c6375950ad0aa87234bc1aa8ce096df.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "都市",
        "内地剧"
      ],
      "remarks": "第3集",
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
      "remarks": "第13集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_3",
      "title": "玄门大师",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/86c0642135bc64806f5105547c052fc9.jpg",
      "year": "2018",
      "types": [
        "大陆剧",
        "仙侠玄幻",
        "古装",
        "仙侠",
        "内地剧"
      ],
      "remarks": "第46集已完结",
      "is_new": false
    },
    {
      "id": "pb_cat_tv_4",
      "title": "美丽的秘密",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/af51d242a662ad2b921e57ce9d1c4771.jpg",
      "year": "2015",
      "types": [
        "大陆剧",
        "甜虐爱情",
        "音乐题材",
        "都市爱情",
        "逆袭",
        "内地剧"
      ],
      "remarks": "第37集已完结",
      "is_new": false
    },
    {
      "id": "pb_cat_tv_5",
      "title": "机关龙城",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/809837deab4565d26b7fa6ddc5068f9d.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "探险寻宝",
        "科幻冒险",
        "奇幻",
        "内地剧"
      ],
      "remarks": "第20集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_6",
      "title": "征途",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/52a2eaa4181d764a87ee4761c15f5afc.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "历史",
        "内地剧"
      ],
      "remarks": "第08集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_7",
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
      "remarks": "第37集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_8",
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
      "remarks": "第24集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_9",
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
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_10",
      "title": "假面良人",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/628433a6f94c0cb21931a6322dcff167.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "甜虐爱情",
        "内地剧"
      ],
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_11",
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
      "remarks": "第16集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_12",
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
      "remarks": "第31集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_13",
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
      "remarks": "第11集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_14",
      "title": "染指流年",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5ed0be272550e6744f95787740587cee.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "年代剧",
        "爱情",
        "内地剧"
      ],
      "remarks": "第8集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_15",
      "title": "大刑伺候",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7061e3bbcfd7d67f2830655b448cacf6.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "甜虐爱情",
        "古装爱情",
        "内地剧"
      ],
      "remarks": "第08集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_16",
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
      "remarks": "第15集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_17",
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
      "id": "pb_cat_tv_18",
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
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_19",
      "title": "东北有个周东北",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2a4cb7f84dea5ebd753a04717b80c04a.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "都市喜剧",
        "创业",
        "搞笑",
        "内地剧"
      ],
      "remarks": "第8集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_20",
      "title": "夜色将烬",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7884526f146dccf95b3ccf58c82a7374.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "虐恋",
        "复仇",
        "内地剧"
      ],
      "remarks": "第6集",
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
      "remarks": "第243集",
      "is_new": false
    },
    {
      "id": "pb_cat_anime_2",
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
      "remarks": "第206集",
      "is_new": false
    },
    {
      "id": "pb_cat_anime_3",
      "title": "聊不了斋",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0807f683e88d6d75f1dc152fd35ad613.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "脑洞",
        "神怪",
        "奇幻"
      ],
      "remarks": "第18集",
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
      "remarks": "第173集",
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
      "remarks": "第194集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_6",
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
      "remarks": "第358集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_7",
      "title": "猿主无痕",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/36ffd2577182cb420cc64facd45ad846.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "奇幻",
        "穿越"
      ],
      "remarks": "第33集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_8",
      "title": "烬火逆途",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/169c3beef5d1cfe69bb95f60a6889032.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "奇幻",
        "复仇",
        "异能"
      ],
      "remarks": "第51集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_9",
      "title": "2049：超能猩云队",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f0512c9fd83d905a40e0943ada9b218f.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "科幻",
        "搞笑",
        "冒险"
      ],
      "remarks": "第9集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_10",
      "title": "公主今天保护欲满满",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a75ac5104bdd3d3670f44c26117e5c0e.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "奇幻",
        "魔法"
      ],
      "remarks": "第24集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_11",
      "title": "她会驯服英雄",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/99bb987fa827b87196dfae3e34f9c1ee.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "动漫",
        "奇幻"
      ],
      "remarks": "第23集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_12",
      "title": "星辰帝女，逆转命运之歌",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8f94bb7d47dd21a37ea667583dc972d3.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "恋爱",
        "玄幻"
      ],
      "remarks": "第50集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_13",
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
      "remarks": "第67集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_14",
      "title": "技能无限增幅，爽得我不想当辅助了！动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/6269cd730988b8c6df3ba27a0d01eea9.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "穿越",
        "热血",
        "冒险"
      ],
      "remarks": "第117集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_15",
      "title": "无上神帝",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/03af2dab7923447ee070be156ac70bc7.jpg",
      "year": "2020",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第644集",
      "is_new": false
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
      "remarks": "第134集",
      "is_new": true
    }
  ],
  "variety": [
    {
      "id": "pb_cat_variety_1",
      "title": "心动的信号第9季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "社交观察"
      ],
      "remarks": "第9期中纯享",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_2",
      "title": "向前一步2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8a92fe99ca57b8b5560f69723979ffc7.jpg",
      "year": "2026",
      "types": [
        "大陆综艺"
      ],
      "remarks": "第20260927期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_3",
      "title": "奔跑吧少年第7季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/19d7bb12e94e1f83d4fdff273181e24d.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "游戏娱乐",
        "真人秀"
      ],
      "remarks": "第9期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_4",
      "title": "毛雪汪",
      "rate": "7.2",
      "cover": "https://img.guangsuimage.com/cover/1e06ec8cf0abf417f8c787235f66f350.jpg",
      "year": "2021",
      "types": [
        "大陆综艺",
        "真人秀"
      ],
      "remarks": "第157期",
      "is_new": false
    },
    {
      "id": "pb_cat_variety_5",
      "title": "我家的两岸故事·思源季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b1514746ba42cf57027379281f185e97.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "文观察",
        "访谈"
      ],
      "remarks": "第8集",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_6",
      "title": "我在中国当农人第三季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/49757c5c1794ebdc0d55bf09839fda7d.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "乡村振兴",
        "创业故事"
      ],
      "remarks": "第1期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_7",
      "title": "伦敦合伙人",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/56448fb13eecfe67571619e16a2f9fea.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺"
      ],
      "remarks": "超长营业第8期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_8",
      "title": "高手云吉",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d99d71f9c3784f28e3ae831bc8054044.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "职场",
        "采访",
        "科技"
      ],
      "remarks": "第21期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_9",
      "title": "一师亦友",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e330b102f21f8a72906f6b9ffae78bb6.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "访谈"
      ],
      "remarks": "第20260927期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_10",
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
      "remarks": "第7期母带1",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_11",
      "title": "花儿与少年2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "文化"
      ],
      "remarks": "七福陪看记第3期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_12",
      "title": "星动网球社",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2549a06a9e3556ebc9ac6433959a1e5a.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "球类",
        "竞技"
      ],
      "remarks": "第2期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_13",
      "title": "静请期戴",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9cd2f6f7b9a713ee65acd9ebe9c66f41.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "播客"
      ],
      "remarks": "第8期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_14",
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
      "remarks": "第4期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_15",
      "title": "浪里个浪青春版",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/01322d798af83096b047e6ef8b585b74.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺"
      ],
      "remarks": "第6期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_16",
      "title": "手信集·青岛篇",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3e1a813196d7bfc007bedb02c7956842.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "真人秀",
        "情感"
      ],
      "remarks": "第6期",
      "is_new": true
    }
  ],
  "documentary": [
    {
      "id": "pb_cat_documentary_1",
      "title": "特技车手",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2b9ac4106e0972191950fec5bb58f47a.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "传记",
        "纪录片"
      ],
      "remarks": "抢先版",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_2",
      "title": "翠贝卡电影节25年",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a9e2411c7f0342590a8ccb88af08f42c.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_3",
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
      "id": "pb_cat_documentary_4",
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
      "id": "pb_cat_documentary_5",
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
      "id": "pb_cat_documentary_6",
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
      "id": "pb_cat_documentary_7",
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
      "id": "pb_cat_documentary_8",
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
      "id": "pb_cat_documentary_9",
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
      "id": "pb_cat_documentary_10",
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
      "id": "pb_cat_documentary_11",
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
      "id": "pb_cat_documentary_12",
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
      "id": "pb_cat_documentary_13",
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
      "id": "pb_cat_documentary_14",
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
      "id": "pb_cat_documentary_15",
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
      "id": "pb_cat_documentary_16",
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
    }
  ],
  "short": [
    {
      "id": "pb_cat_short_1",
      "title": "逍遥镇北王",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2bf1564153a0ab14e52c587da9c8a8c3.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_2",
      "title": "原来我是绝世大佬",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8b41d4b63a0977b2ecd1ba2cf4d5e259.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_3",
      "title": "双珠换嫁掌荣华",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/cec0974cf89949d91612dc583619e606.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_4",
      "title": "开局百年内力，我带师妹横扫武林",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/50677116a26c798e4e7634da13c70ad6.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_5",
      "title": "修仙：我即天命",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/14146087648d8dd9dd416efcfcaab7be.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_6",
      "title": "棺中神医：世子妃强势归位",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4b3bf62bcd372d2d49f004e56c39b064.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_7",
      "title": "重生之嫡女归来",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e607f1ec010ea1512f6cf63f17b76d9a.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_8",
      "title": "碎月缚",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1b68701d9f3edfdc0135e0cd3f236f07.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_9",
      "title": "因为怕痛，所以全点防御了",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8aece1b15d8e922e3e77c50d2b6c1756.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_10",
      "title": "朕为天子：斩奸",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b6b3fa15346c8206d86df6c0de020106.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_11",
      "title": "太极山河：张三丰",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8015a17d62eff89866248ab482705734.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_12",
      "title": "求求你们，别再喊我高人了",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/22609203688a1b46856e5a23b1ed105e.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_13",
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
      "id": "pb_cat_short_14",
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
      "id": "pb_cat_short_15",
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
      "id": "pb_cat_short_16",
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
      "id": "pb_cat_short_17",
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
      "id": "pb_cat_short_18",
      "title": "布衣镇山河2",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d570ad70c7fd2207a7ad9e4d0c4279c5.jpg",
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
      "title": "副警长2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1d3066af6e7e3abefb481f89651e3b42.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "动作",
        "惊悚",
        "犯罪"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_2",
      "title": "夺命狂花2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2b2b87f802fa14e8303a28f3fc5402eb.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "犯罪",
        "动作",
        "悬疑"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_3",
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
      "id": "pb_cat_rank_4",
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
      "id": "pb_cat_rank_7",
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
      "id": "pb_cat_rank_8",
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
      "id": "pb_cat_rank_9",
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
      "id": "pb_cat_rank_10",
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
      "id": "pb_cat_rank_11",
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
      "id": "pb_cat_rank_12",
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
      "id": "pb_cat_rank_13",
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
      "id": "pb_cat_rank_14",
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
      "id": "pb_cat_rank_15",
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
      "id": "pb_cat_rank_16",
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
      "id": "pb_cat_rank_17",
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
      "id": "pb_cat_rank_18",
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
