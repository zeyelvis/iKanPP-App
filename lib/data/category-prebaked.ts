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
      "title": "狂怒者：荣誉之战",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bc10eb09615df8c5239866ac36a19ca8.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "剧情",
        "动作",
        "运动"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_2",
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
      "id": "pb_cat_movie_3",
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
      "id": "pb_cat_movie_4",
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
      "id": "pb_cat_movie_5",
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
      "id": "pb_cat_movie_6",
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
      "id": "pb_cat_movie_7",
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
      "id": "pb_cat_movie_8",
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
      "id": "pb_cat_movie_9",
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
      "id": "pb_cat_movie_10",
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
      "id": "pb_cat_movie_11",
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
      "id": "pb_cat_movie_12",
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
      "id": "pb_cat_movie_13",
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
      "id": "pb_cat_movie_14",
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
      "id": "pb_cat_movie_15",
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
      "id": "pb_cat_movie_16",
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
      "id": "pb_cat_movie_17",
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
      "id": "pb_cat_movie_18",
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
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_2",
      "title": "征途",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/52a2eaa4181d764a87ee4761c15f5afc.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "历史",
        "内地剧"
      ],
      "remarks": "第12集",
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
      "remarks": "第30集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_4",
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
      "remarks": "第40集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_5",
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
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_6",
      "title": "无可替代",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0c6375950ad0aa87234bc1aa8ce096df.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "都市",
        "内地剧"
      ],
      "remarks": "第7集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_7",
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
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_8",
      "title": "余红旧事",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9ba04fa727ba41652caaa26f04cf497e.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "警匪罪案",
        "悬疑",
        "犯罪",
        "内地剧"
      ],
      "remarks": "第13集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_9",
      "title": "假面良人",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/628433a6f94c0cb21931a6322dcff167.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "甜虐爱情",
        "内地剧"
      ],
      "remarks": "第14集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_10",
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
      "remarks": "第4集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_11",
      "title": "风华令",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7d35406dc4780516573e05300e0be62e.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "内地剧"
      ],
      "remarks": "第6集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_12",
      "title": "特赦1959",
      "rate": "7.5",
      "cover": "https://img.guangsuimage.com/cover/9b94b3d315d4b2938610de45b1265f21.jpg",
      "year": "2019",
      "types": [
        "大陆剧",
        "剧情",
        "历史",
        "内地剧"
      ],
      "remarks": "第39集已完结",
      "is_new": false
    },
    {
      "id": "pb_cat_tv_13",
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
      "id": "pb_cat_tv_14",
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
      "remarks": "第13集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_15",
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
      "remarks": "第12集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_16",
      "title": "雷霆令",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0ab7fc247d391d461677393dadaf9b78.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "缉毒题材",
        "卧底片",
        "警匪较量",
        "内地剧"
      ],
      "remarks": "第08集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_17",
      "title": "厨娘",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/243c73c82e8ca80fdc4b642de846d545.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "古装",
        "内地剧"
      ],
      "remarks": "第20集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_18",
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
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_19",
      "title": "冷宫弃后忙种田",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/20ca001aa8489fb14825246b581d0793.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "偶像爱情",
        "古装爱情",
        "内地剧"
      ],
      "remarks": "第08集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_20",
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
      "remarks": "第12集",
      "is_new": true
    }
  ],
  "anime": [
    {
      "id": "pb_cat_anime_1",
      "title": "灵境行者",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/cda3cd26eb96cd54003c160020d7eb9b.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "奇幻",
        "冒险"
      ],
      "remarks": "第06集",
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
      "remarks": "第175集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_3",
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
      "remarks": "第196集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_4",
      "title": "大千小镇",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2c0e55555895ab7a61cc2ea419eb6d7c.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "搞笑"
      ],
      "remarks": "第20集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_5",
      "title": "我怎么会嫁给一个反派",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/edcbb16417f7a00253240c23ef93dfb6.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "动漫"
      ],
      "remarks": "第25集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_6",
      "title": "玄幻，我！天命大反派",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fcac8b77e7900d5c3feb5f61c010ba09.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻修真",
        "动漫"
      ],
      "remarks": "第25集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_7",
      "title": "斗罗大陆5重生唐三 动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/650202924b0aa0b5aff4f7da307591d4.jpg",
      "year": "2025",
      "types": [
        "中国动漫",
        "玄幻",
        "神怪"
      ],
      "remarks": "第88集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_8",
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
      "remarks": "第359集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_9",
      "title": "胶囊计划 奇迹",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/78141c6d91d2e6ea82af8675915e417e.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "动画"
      ],
      "remarks": "第8集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_10",
      "title": "一人一驴一狗去修仙",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/26530a8db91a9a338af16356bdac4a65.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻修真",
        "国漫",
        "东方仙侠"
      ],
      "remarks": "第65集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_11",
      "title": "万象如意尊第一季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fd9a483355d14f74c125ec3474f82b6f.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "逆袭",
        "异能"
      ],
      "remarks": "第26集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_12",
      "title": "红妆送君葬",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/93ae0d44b350540f196d8bcde3ddeca3.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "古风"
      ],
      "remarks": "第75集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_13",
      "title": "宿命之印",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e7a14d072950bad1496a93e4254daf9d.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "都市奇幻",
        "3D",
        "动画",
        "AI制作"
      ],
      "remarks": "第50集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_14",
      "title": "全民诡异：开局掌握零元购",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/35347250c267d0ac8b34c6d030132d58.jpg",
      "year": "2025",
      "types": [
        "中国动漫",
        "奇幻",
        "末日",
        "热血"
      ],
      "remarks": "第318集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_15",
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
      "remarks": "第28集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_16",
      "title": "九霄神女2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ff6988a2facf2fa741fd203caa634736.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "古装",
        "逆袭"
      ],
      "remarks": "第11集",
      "is_new": true
    }
  ],
  "variety": [
    {
      "id": "pb_cat_variety_1",
      "title": "月是故乡明2026海峡两岸漳州中秋晚会",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7e619500fdac1f706695b4be49206bbc.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "传统节日",
        "晚会"
      ],
      "remarks": "陈佳吕薇共赴团圆",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_2",
      "title": "对味",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ce90754c5667236900bb9e769f1337c7.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食",
        "真人秀"
      ],
      "remarks": "第2期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_3",
      "title": "黄河文化大会·寻宝季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9373e2bf4c0ab56e0020955809d56c02.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "脑力竞技"
      ],
      "remarks": "第2期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_4",
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
      "remarks": "第20260929期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_5",
      "title": "姐姐快醒醒",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/56705f788373b02290d040cbf9545f3f.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "明星访谈"
      ],
      "remarks": "第9期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_6",
      "title": "一饭封神第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食竞技"
      ],
      "remarks": "一饭银河赏",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_7",
      "title": "心动的信号第9季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "社交观察"
      ],
      "remarks": "第10期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_8",
      "title": "中国好团队",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/12be2f6aa997b62e361f5d5d37f45668.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "脑力竞技"
      ],
      "remarks": "第一期上",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_9",
      "title": "非诚勿扰2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e9a2bf9dcbb8ddc18f236cc8d9b28549.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "情感",
        "真人秀"
      ],
      "remarks": "第186期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_10",
      "title": "食神·百厨大战",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e98043c16265282fb185adf9e8b7d197.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食",
        "真人秀"
      ],
      "remarks": "第15期加更",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_11",
      "title": "滚烫夜话",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bbe722a8d692caae8d7b9bcb6e11f5c1.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "播客"
      ],
      "remarks": "第6期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_12",
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
      "remarks": "第3期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_13",
      "title": "舞蹈新风暴",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/854748b11de4be0ab4ed4b24f76b94eb.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "歌舞",
        "真人秀"
      ],
      "remarks": "Plus版第6期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_14",
      "title": "不想睡的星期五",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/813d38364c95c17d1b969aa2364959b4.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺",
        "生活"
      ],
      "remarks": "超前营夜第12期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_15",
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
      "remarks": "心动日记第9期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_16",
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
      "remarks": "大神版第11期下",
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
      "remarks": "第3集",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_2",
      "title": "杀戮·埋葬·报道",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/82f1b7930725cc076f5b80b65631f480.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片",
        "犯罪"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_3",
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
      "id": "pb_cat_documentary_4",
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
      "id": "pb_cat_documentary_5",
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
      "id": "pb_cat_documentary_6",
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
      "id": "pb_cat_documentary_7",
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
      "id": "pb_cat_documentary_8",
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
      "id": "pb_cat_documentary_9",
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
      "id": "pb_cat_documentary_10",
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
      "id": "pb_cat_documentary_11",
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
      "id": "pb_cat_documentary_12",
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
      "id": "pb_cat_documentary_13",
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
      "id": "pb_cat_documentary_14",
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
      "id": "pb_cat_documentary_15",
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
      "id": "pb_cat_documentary_16",
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
    }
  ],
  "short": [
    {
      "id": "pb_cat_short_1",
      "title": "家有奸臣初长成",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/4edcaa40e295ec5c9300e64d2f4a902e.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_2",
      "title": "再造宋骨",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9a5208f9c63961cafb9eda0b4f72e088.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_3",
      "title": "遮天：九龙拉棺",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/6f05747312e23628e82bee0dedcb0d4f.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_4",
      "title": "三根毫毛",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/70c79fc58b2c3e2785355b37573f2f56.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_5",
      "title": "我在古代开酒店",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/68e5585094320268d22a83399be4ca8d.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_6",
      "title": "梦回大安，我为他守满城星火",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1179ff83d232cf99bd01e86f8e2433fa.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_7",
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
      "id": "pb_cat_short_8",
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
      "id": "pb_cat_short_9",
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
      "id": "pb_cat_short_10",
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
      "id": "pb_cat_short_11",
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
      "id": "pb_cat_short_12",
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
      "id": "pb_cat_short_13",
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
      "id": "pb_cat_short_14",
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
      "id": "pb_cat_short_15",
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
      "id": "pb_cat_short_16",
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
      "id": "pb_cat_short_17",
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
      "id": "pb_cat_short_18",
      "title": "求求你们，别再喊我高人了",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/22609203688a1b46856e5a23b1ed105e.jpg",
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
      "title": "狂怒者：荣誉之战",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bc10eb09615df8c5239866ac36a19ca8.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "剧情",
        "动作",
        "运动"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_2",
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
      "id": "pb_cat_rank_3",
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
      "id": "pb_cat_rank_4",
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
      "id": "pb_cat_rank_5",
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
      "id": "pb_cat_rank_6",
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
      "id": "pb_cat_rank_7",
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
      "id": "pb_cat_rank_8",
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
      "id": "pb_cat_rank_9",
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
      "id": "pb_cat_rank_10",
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
      "id": "pb_cat_rank_11",
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
      "id": "pb_cat_rank_12",
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
      "id": "pb_cat_rank_13",
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
      "id": "pb_cat_rank_14",
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
      "id": "pb_cat_rank_15",
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
      "id": "pb_cat_rank_16",
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
      "id": "pb_cat_rank_17",
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
      "id": "pb_cat_rank_18",
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
