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
      "title": "忍者战争黑狐VS将军乃忍者",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/908f1a7b179b71ae1d40e76f64e9d64b.jpg",
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
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_3",
      "title": "战无不胜2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fdad88ed0657cbfccecaedc83243fed7.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "犯罪",
        "动作",
        "剧情"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_movie_4",
      "title": "义警",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bb3e0d9ee7b74f20512157e3ca1166d8.jpg",
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
      "id": "pb_cat_movie_6",
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
      "id": "pb_cat_movie_7",
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
      "id": "pb_cat_movie_8",
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
      "id": "pb_cat_movie_9",
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
      "id": "pb_cat_movie_10",
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
    }
  ],
  "tv": [
    {
      "id": "pb_cat_tv_1",
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
      "remarks": "第5集",
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
      "remarks": "第26集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_3",
      "title": "无可替代",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0c6375950ad0aa87234bc1aa8ce096df.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "都市",
        "内地剧"
      ],
      "remarks": "第14集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_4",
      "title": "假面良人",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/628433a6f94c0cb21931a6322dcff167.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "甜虐爱情",
        "内地剧"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_5",
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
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_6",
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
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_7",
      "title": "喜剧之王2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/234c04f19f239b6d91cf473d6738deeb.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "百姓趣闻",
        "喜剧",
        "农村",
        "内地剧"
      ],
      "remarks": "第8集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_8",
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
      "remarks": "第22集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_9",
      "title": "魅影神捕",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ee3fe9a00ceb01b5fbeee331b31dc23d.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装探案",
        "悬疑",
        "内地剧"
      ],
      "remarks": "第16集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_10",
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
      "remarks": "第17集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_11",
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
      "remarks": "第20集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_12",
      "title": "太玄·东方阙",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/87aab4ad31d86180e6fed8ce7b01a6bd.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "仙侠玄幻",
        "东方玄幻",
        "古装",
        "内地剧"
      ],
      "remarks": "第8集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_13",
      "title": "死刑将至",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/77e6db8d3de475a59d61faa84117757f.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "罪案纪实",
        "犯罪心理",
        "内地剧"
      ],
      "remarks": "第10集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_14",
      "title": "不可靠近的他",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/708ad56a59dc3b0cb49bcda2363d2824.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "奇幻爱情",
        "甜虐爱情",
        "内地剧"
      ],
      "remarks": "第14集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_15",
      "title": "风华令",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/7d35406dc4780516573e05300e0be62e.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "古装爱情",
        "内地剧"
      ],
      "remarks": "第20集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_16",
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
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_17",
      "title": "后西游记第一季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/337686c236e2a6f8a90d2f692a6b93af.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "神话",
        "古装",
        "内地剧"
      ],
      "remarks": "第10集",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_18",
      "title": "草莽枭雄",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/748dd3b7086b2bb4e4984e40dd03f817.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "年代剧",
        "权谋",
        "内地剧"
      ],
      "remarks": "第33集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_tv_19",
      "title": "乘龙怪婿第四季",
      "rate": "8.0",
      "cover": "https://img.guangsuimage.com/cover/1010647d6bb1b5eb9c5fd9379fa127cd.jpg",
      "year": "2009",
      "types": [
        "大陆剧",
        "剧情",
        "喜剧",
        "古装",
        "内地剧"
      ],
      "remarks": "第120集完结",
      "is_new": false
    },
    {
      "id": "pb_cat_tv_20",
      "title": "乘龙怪婿第三季",
      "rate": "8.9",
      "cover": "https://img.guangsuimage.com/cover/6cb8885286a598955b4559df5a8f11f8.jpg",
      "year": "2007",
      "types": [
        "大陆剧",
        "喜剧",
        "古装",
        "内地剧"
      ],
      "remarks": "第140集完结",
      "is_new": false
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
      "remarks": "第07集",
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
      "remarks": "第555集",
      "is_new": false
    },
    {
      "id": "pb_cat_anime_3",
      "title": "万古劫灭",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/631c41424efaf5284b92f1b655552892.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "逆袭",
        "热血"
      ],
      "remarks": "第40集已完结",
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
      "remarks": "第22集",
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
      "remarks": "第203集",
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
      "remarks": "第182集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_7",
      "title": "我怎么会嫁给一个反派",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/edcbb16417f7a00253240c23ef93dfb6.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "动漫"
      ],
      "remarks": "第27集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_8",
      "title": "玄幻，我！天命大反派",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fcac8b77e7900d5c3feb5f61c010ba09.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻修真",
        "动漫"
      ],
      "remarks": "第27集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_9",
      "title": "全职法师特别篇世界学府之争",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/153e13b5e618d9cc1949327b619e9f73.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "国漫",
        "热血战斗",
        "奇幻魔法"
      ],
      "remarks": "第120集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_10",
      "title": "斗罗大陆5重生唐三 动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/650202924b0aa0b5aff4f7da307591d4.jpg",
      "year": "2025",
      "types": [
        "中国动漫",
        "玄幻",
        "神怪"
      ],
      "remarks": "第89集",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_11",
      "title": "凡躯育木逆镇魔源",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0cff9152e707e81227cb5efe782db053.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "异能",
        "传记",
        "励志"
      ],
      "remarks": "第8集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_12",
      "title": "物理超度修仙界",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a84f018790d455c957a25c968f1fbcad.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "玄幻",
        "穿越",
        "科幻"
      ],
      "remarks": "第9集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_13",
      "title": "涧底知川",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/914d67c2cae642f93c4ad56aea9c360b.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "武侠",
        "古装",
        "励志"
      ],
      "remarks": "第11集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_14",
      "title": "弱水墨魂",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0b9729a8355f5e3efeb35c5d7730c0d1.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "武侠",
        "古装",
        "生活"
      ],
      "remarks": "第6集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_15",
      "title": "我每天零花一个亿动态漫画",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/cc6947ccb2bdbbbd9789377052e3aabc.jpg",
      "year": "2025",
      "types": [
        "中国动漫",
        "系统流",
        "幻",
        "职场"
      ],
      "remarks": "第30集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_anime_16",
      "title": "红妆送君葬",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/93ae0d44b350540f196d8bcde3ddeca3.jpg",
      "year": "2026",
      "types": [
        "中国动漫",
        "古风"
      ],
      "remarks": "第85集",
      "is_new": true
    }
  ],
  "variety": [
    {
      "id": "pb_cat_variety_1",
      "title": "你好湖南",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bb076991c5c7cb0165f9c389560878a5.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "纪实",
        "访谈"
      ],
      "remarks": "第27期",
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
      "remarks": "第20261006期",
      "is_new": false
    },
    {
      "id": "pb_cat_variety_3",
      "title": "中国好团队",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/12be2f6aa997b62e361f5d5d37f45668.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "脑力竞技"
      ],
      "remarks": "第二期上",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_4",
      "title": "毛雪汪（2026）",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/da04762eb0c15088e2a13703d0e15388.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "脱口秀",
        "生活观察"
      ],
      "remarks": "20261006超长尊享版",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_5",
      "title": "一饭封神第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食竞技"
      ],
      "remarks": "261007回顾特辑",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_6",
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
      "remarks": "大神版第12期下",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_7",
      "title": "舞蹈新风暴",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/854748b11de4be0ab4ed4b24f76b94eb.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "歌舞",
        "真人秀"
      ],
      "remarks": "Plus版第7期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_8",
      "title": "滚烫夜话",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bbe722a8d692caae8d7b9bcb6e11f5c1.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "播客"
      ],
      "remarks": "第7期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_9",
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
      "remarks": "心动日记第10期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_10",
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
      "remarks": "训练室全纪录第4期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_11",
      "title": "向内一公里",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3805bc35dca88bf94f89533481d5ae6a.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "女性力量",
        "深度访谈"
      ],
      "remarks": "第2期",
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
      "remarks": "第8期母带3",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_13",
      "title": "对味",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ce90754c5667236900bb9e769f1337c7.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "美食",
        "真人秀"
      ],
      "remarks": "第3期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_14",
      "title": "深夜怪谈会 第六季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f39b2034e52acfb7fc1c51d227d03d10.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺"
      ],
      "remarks": "第15期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_15",
      "title": "东方纹样有点东西",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/6c20a9f2b2509a1fbffbf03577d6e778.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "文化"
      ],
      "remarks": "敦煌站第3期",
      "is_new": true
    },
    {
      "id": "pb_cat_variety_16",
      "title": "伦敦合伙人",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/56448fb13eecfe67571619e16a2f9fea.jpg",
      "year": "2026",
      "types": [
        "大陆综艺",
        "综艺"
      ],
      "remarks": "合伙人日记第9期",
      "is_new": true
    }
  ],
  "documentary": [
    {
      "id": "pb_cat_documentary_1",
      "title": "谁是马丁·马尔？",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/81c391fce10a05eb124ce40d9a8622f5.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片",
        "传记"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_2",
      "title": "黑僵尸",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3bfde44a1fec6cdcb0824eded0750260.jpg",
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
      "title": "漆黑林地与着魔时日：民俗恐怖电影史",
      "rate": "8.2",
      "cover": "https://img.guangsuimage.com/cover/c151bde0e289125a5145e74b8af686cc.jpg",
      "year": "2021",
      "types": [
        "记录片",
        "恐怖",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": false
    },
    {
      "id": "pb_cat_documentary_4",
      "title": "卡尔",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a2a8d30cb095b1d5353948bc40ad271f.jpg",
      "year": "2025",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_5",
      "title": "天梯：蔡国强的艺术",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/47b3e66932caba1d7e776c1037cdcab9.jpg",
      "year": "2016",
      "types": [
        "记录片",
        "纪实",
        "纪录片"
      ],
      "remarks": "正片",
      "is_new": false
    },
    {
      "id": "pb_cat_documentary_6",
      "title": "我们的国家公园",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/1fe6933bcf6d9b8590dd89d998b46cae.jpg",
      "year": "2023",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "第5集完结",
      "is_new": false
    },
    {
      "id": "pb_cat_documentary_7",
      "title": "一江百味",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f24b019ae6b72f79d657e5ec7b4994dd.jpg",
      "year": "2024",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "第10集完结",
      "is_new": false
    },
    {
      "id": "pb_cat_documentary_8",
      "title": "纳斯卡：全速狂飙 第二季",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/6b8039457e64dca94cac0e73d3708034.jpg",
      "year": "2025",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "第5集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_9",
      "title": "体坛秘史：枪狂后卫",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/a6595ea414abf35ece702137c3a5ed49.jpg",
      "year": "2025",
      "types": [
        "记录片",
        "纪录片",
        "运动"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_10",
      "title": "战争游戏2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/de2a35e78a80fd8380ed45dcb56b7337.jpg",
      "year": "2026",
      "types": [
        "记录片",
        "纪录片"
      ],
      "remarks": "第4集",
      "is_new": true
    },
    {
      "id": "pb_cat_documentary_11",
      "title": "舒马赫1994：传奇诞生",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3fb896fdc48b5a1f54aaf9695092b807.jpg",
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
      "title": "万人之上：冬攀乔戈里峰",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ae07822252537d684eeec3f2d4ba9adb.jpg",
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
      "title": "鳏夫疑案：至死不渝",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/87601bead6c9bff726842695073fcc1a.jpg",
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
      "id": "pb_cat_documentary_15",
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
      "id": "pb_cat_documentary_16",
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
    }
  ],
  "short": [
    {
      "id": "pb_cat_short_1",
      "title": "穿越古代搞军工，满朝权贵破防了",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/982fa73a0a01d2f2c7297f567fdc06c5.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_2",
      "title": "凤隐朝云",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/2fc18c49dc6fc4ebf05be080c6b6a62d.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_3",
      "title": "世子凶猛",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/eb65e37a40eae845522cab24624db991.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_4",
      "title": "将门枭虎",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/f55b0ce15b46eb8cc8666c471cc6466c.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_5",
      "title": "武朝录：魏家逆子成首辅",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/3d862d1cf3b2d0d1eb845d821bcb3e2a.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_6",
      "title": "帝后今天恩爱了吗",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/def6041160f19b89fa04d897b71aac98.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_7",
      "title": "真帝王回归，重振大乾",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/ef66844f7afaff9d95949cbaa1329435.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_8",
      "title": "首辅娇娘",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/d9681afde2e82a22815bfd357f76f4e5.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_9",
      "title": "锦墨风华第二部",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/9e5b728efd63e2f8c27fc10832b3db53.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_10",
      "title": "将军将我贬妾为妻，圣旨赐下后他慌了",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/060c7cb35d024b35db67f04bf310e3d0.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_11",
      "title": "逍遥小王爷",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/5d6e1cda3192d61960f615aee0af9418.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_12",
      "title": "大宋交子",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/b78ae18ba9a0c5f4c5f8282433b538c4.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_13",
      "title": "被抢当王妃，我用嫁妆带飞王府",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/8ff1139c76a93227341d3856f6bd0786.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_14",
      "title": "全家问斩我爹狂爆家丑卡BUG，皇帝听懵了",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/72e245b269ec36846b9daf23e829137a.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_15",
      "title": "被赶下山后我成了京城团宠",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/cd566b891ff54f3900fd8ca6ab26ff8f.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_16",
      "title": "大魏风华",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0b6be9900cdff3ca59c64f47cd15dd0d.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_17",
      "title": "和离后双穿，权臣前夫他急红了眼",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/05715f8b52ffdef8d2710323f4173a65.jpg",
      "year": "2026",
      "types": [
        "古装仙侠"
      ],
      "remarks": "全集完结",
      "is_new": true
    },
    {
      "id": "pb_cat_short_18",
      "title": "接回真女儿，侯门主母不忍啦",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/e954dc1599c3b545f3977b16a36e2b75.jpg",
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
      "title": "乘龙怪婿第三季",
      "rate": "8.9",
      "cover": "https://img.guangsuimage.com/cover/6cb8885286a598955b4559df5a8f11f8.jpg",
      "year": "2007",
      "types": [
        "大陆剧",
        "喜剧",
        "古装",
        "内地剧"
      ],
      "remarks": "第140集完结",
      "is_new": false
    },
    {
      "id": "pb_cat_rank_2",
      "title": "忍者战争黑狐VS将军乃忍者",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/908f1a7b179b71ae1d40e76f64e9d64b.jpg",
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
      "title": "战无不胜2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/fdad88ed0657cbfccecaedc83243fed7.jpg",
      "year": "2026",
      "types": [
        "动作片",
        "犯罪",
        "动作",
        "剧情"
      ],
      "remarks": "正片",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_4",
      "title": "义警",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/bb3e0d9ee7b74f20512157e3ca1166d8.jpg",
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
      "id": "pb_cat_rank_6",
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
      "id": "pb_cat_rank_7",
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
      "id": "pb_cat_rank_8",
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
      "id": "pb_cat_rank_9",
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
      "id": "pb_cat_rank_10",
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
      "id": "pb_cat_rank_11",
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
      "remarks": "第5集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_12",
      "title": "征途",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/52a2eaa4181d764a87ee4761c15f5afc.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "历史",
        "内地剧"
      ],
      "remarks": "第26集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_13",
      "title": "无可替代",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/0c6375950ad0aa87234bc1aa8ce096df.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "都市",
        "内地剧"
      ],
      "remarks": "第14集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_14",
      "title": "假面良人",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/628433a6f94c0cb21931a6322dcff167.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "甜虐爱情",
        "内地剧"
      ],
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_15",
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
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_16",
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
      "remarks": "第24集已完结",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_17",
      "title": "喜剧之王2026",
      "rate": "8.6",
      "cover": "https://img.guangsuimage.com/cover/234c04f19f239b6d91cf473d6738deeb.jpg",
      "year": "2026",
      "types": [
        "大陆剧",
        "百姓趣闻",
        "喜剧",
        "农村",
        "内地剧"
      ],
      "remarks": "第8集",
      "is_new": true
    },
    {
      "id": "pb_cat_rank_18",
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
      "remarks": "第22集",
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
