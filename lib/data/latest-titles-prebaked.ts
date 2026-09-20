/**
 * 全站全专区「最新上线」真实增量预烘焙数据集
 * 由 scripts/sync-latest-titles.mjs 定时自动巡检生成
 * 涵盖全站、电影、电视剧、动漫、综艺、纪录片 6 大专区真实 24h 最新入库影视
 */

export interface LatestPrebakedItem {
  entityId: string;
  tmdbId?: string;
  title: string;
  slug: string;
  cover: string;
  backdrop: string;
  rate: string;
  year: string;
  type: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string;
  channelKey: 'all' | 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string;
  genres: string[];
  updateBadge: string;
  platformBadge?: string;
  qualityBadge?: string;
  createdAt: string;
}

export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem[]> = {
  "all": [
    {
      "entityId": "ik_radar_all_1",
      "tmdbId": "56570",
      "title": "古战场传奇：吾血之亲第2季",
      "slug": "古战场传奇-吾血之亲第2季",
      "cover": "https://image.tmdb.org/t/p/w500/9ltOIdbIZA3K9TelnvQkwootkXc.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nf3Vlxm3C9U1aKUUQHmKFZmxPSc.jpg",
      "rate": "8.2",
      "year": "2014",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:09:37.140Z"
    },
    {
      "entityId": "ik_radar_all_2",
      "title": "阿波罗陷落",
      "slug": "阿波罗陷落",
      "cover": "https://static.iyf.tv/upload/video/202609191456165675483.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609191456165675483.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第2集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T16:39:37.140Z"
    },
    {
      "entityId": "ik_radar_all_3",
      "tmdbId": "1306055",
      "title": "数到三",
      "slug": "数到三",
      "cover": "https://image.tmdb.org/t/p/w500/kRlgxkA83z6atla0BRcTxHZRFtf.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/n0hqyWelh52kBuBAftH1V1omTTW.jpg",
      "rate": "5.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T16:09:37.140Z"
    },
    {
      "entityId": "ik_radar_all_4",
      "tmdbId": "318239",
      "title": "神秘的声音",
      "slug": "神秘的声音",
      "cover": "https://image.tmdb.org/t/p/w500/PGfkJNU8RV90kaUlsnHyU0LN80.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/vxUL7EZHqev4YSJ0EwpaW97336B.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T15:39:37.140Z"
    },
    {
      "entityId": "ik_radar_all_5",
      "tmdbId": "312585",
      "title": "乌鸦俱乐部",
      "slug": "乌鸦俱乐部",
      "cover": "https://image.tmdb.org/t/p/w500/gttK2vQTd52txo54xrYFdVg1fbS.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/wPJYkh76gSEECGsN4KTKKLFBkPj.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T15:09:37.140Z"
    },
    {
      "entityId": "ik_radar_all_6",
      "tmdbId": "1240889",
      "title": "瘴气营地的青春性事与死亡",
      "slug": "瘴气营地的青春性事与死亡",
      "cover": "https://image.tmdb.org/t/p/w500/t8JBX1h4yipba70tNmPaTV2tgbr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/d1n2ySWSanU34eEsluRjfrjRq52.jpg",
      "rate": "6.5",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T14:39:37.140Z"
    },
    {
      "entityId": "ik_radar_all_7",
      "tmdbId": "275102",
      "title": "挑情丑闻",
      "slug": "挑情丑闻",
      "cover": "https://image.tmdb.org/t/p/w500/kFKpftbKr2BFe37iyLWd9wQn01c.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/uc1p1PEbEMpdIHqnU9TESNC6Jhp.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全8集",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_all_8",
      "tmdbId": "1641629",
      "title": "你我对抗全世界",
      "slug": "你我对抗全世界",
      "cover": "https://image.tmdb.org/t/p/w500/j801na4Sf6DrZPL5Ba1vUZo5OFN.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nkEhDomjmPHJSA4Tx8pxv0NlKEy.jpg",
      "rate": "5.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:39:37.140Z"
    },
    {
      "entityId": "ik_radar_all_9",
      "tmdbId": "1514863",
      "title": "最佳舞伴",
      "slug": "最佳舞伴",
      "cover": "https://image.tmdb.org/t/p/w500/9soOjsZ91vtMzypK2F3MC378JI5.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5m1j7Wibh3HnZq5QHm97v8dI3GH.jpg",
      "rate": "8.7",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:09:37.140Z"
    },
    {
      "entityId": "ik_radar_all_10",
      "title": "梦想改造家2026",
      "slug": "梦想改造家2026",
      "cover": "https://static.iyf.tv/upload/video/202509181943094364535.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202509181943094364535.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第1期会员版",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T12:39:37.140Z"
    },
    {
      "entityId": "ik_radar_all_11",
      "title": "幸福伽菜子的快乐杀手生活第2季",
      "slug": "幸福伽菜子的快乐杀手生活第2季",
      "cover": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "rate": "9.3",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第2集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T12:09:37.140Z"
    },
    {
      "entityId": "ik_radar_all_12",
      "title": "黑帮领地第2季",
      "slug": "黑帮领地第2季",
      "cover": "https://static.iyf.tv/upload/video/202609181142254213861.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181142254213861.gif",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T11:39:37.140Z"
    },
    {
      "entityId": "ik_radar_all_13",
      "title": "万物既伟大又渺小第7季",
      "slug": "万物既伟大又渺小第7季",
      "cover": "https://static.iyf.tv/upload/video/202609181133593333356.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181133593333356.gif",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T11:09:37.140Z"
    },
    {
      "entityId": "ik277239",
      "tmdbId": "1541125",
      "title": "年会不能停！2",
      "slug": "年会不能停2",
      "cover": "https://image.tmdb.org/t/p/w500/pD4ItmNxCXcXjAX4KNQLQCMHDjb.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/x8FmUv8INF7E5fkP2Jm9KLfk87Q.jpg",
      "rate": "7.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "电影"
      ],
      "updateBadge": "第20260919期",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_all_15",
      "tmdbId": "334754",
      "title": "荣耀的阶梯",
      "slug": "荣耀的阶梯",
      "cover": "https://image.tmdb.org/t/p/w500/lZXqOkURnRMPMJ05fnvvpmTNiv5.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oeDqhlvrsFKrc9oP6nrAmMcao4e.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "短剧"
      ],
      "updateBadge": "更新至第20集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T10:09:37.140Z"
    },
    {
      "entityId": "ik_radar_all_16",
      "tmdbId": "298008",
      "title": "假面美颜",
      "slug": "假面美颜",
      "cover": "https://image.tmdb.org/t/p/w500/r87DTrK1FC5tEjK32JmJzOYw48T.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mIjERiWlnDzQWHTcZdtucLmTCeO.jpg",
      "rate": "7.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全8集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_all_17",
      "tmdbId": "1769717",
      "title": "M.I.S.S.I.O.N. 歌剧般的潜入搜查官",
      "slug": "mission-歌剧般的潜入搜查官",
      "cover": "https://image.tmdb.org/t/p/w500/r7xJyiB1tinL6NlukwaurIHKMBD.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2bBakSsFpnu6W8IKg6B1RJuDNeU.jpg",
      "rate": "5.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "电影"
      ],
      "updateBadge": "更新至第3集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_all_18",
      "tmdbId": "30981",
      "title": "怪物：丽兹·波顿的故事",
      "slug": "怪物-丽兹-波顿的故事",
      "cover": "https://image.tmdb.org/t/p/w500/7ZhHyA0IIQOyz1hzCXpTilXg4Q2.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/6T19aRp9zLMghZo1dTEwoNyreNZ.jpg",
      "rate": "8.5",
      "year": "2004",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全8集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_all_19",
      "tmdbId": "312663",
      "title": "黑白清道夫",
      "slug": "黑白清道夫",
      "cover": "https://image.tmdb.org/t/p/w500/mZ0rPTMe9XfrWRUAeoJzr62cyIa.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iyHgIyMJ6Vd5w79dLeGOTOkqDS5.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全10集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_all_20",
      "tmdbId": "66732",
      "title": "怪奇物语：1985故事集第2季",
      "slug": "怪奇物语-1985故事集第2季",
      "cover": "https://image.tmdb.org/t/p/w500/iTvTODru3s8A4eGqVZzALcipIft.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      "rate": "8.6",
      "year": "2016",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "动漫"
      ],
      "updateBadge": "全10集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_all_21",
      "tmdbId": "335218",
      "title": "妾本草芥",
      "slug": "妾本草芥",
      "cover": "https://image.tmdb.org/t/p/w500/hABseMRLlM8tOSJTcyJku7VmxsZ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5tetx9UPg2uO9zwBXYecRoDJWRD.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "短剧"
      ],
      "updateBadge": "更新至第13集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T07:09:37.140Z"
    },
    {
      "entityId": "ik_radar_all_22",
      "tmdbId": "294990",
      "title": "一瓯春",
      "slug": "一瓯春",
      "cover": "https://image.tmdb.org/t/p/w500/7KjVhRaarZ5L3CBirQEmt89ioiz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qLZQnTiQxkBOid9tVLWC1CmoOcu.jpg",
      "rate": "9.5",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第10集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T06:39:37.140Z"
    },
    {
      "entityId": "ik_radar_all_23",
      "title": "云画的月光10周年综艺特辑",
      "slug": "云画的月光10周年综艺特辑",
      "cover": "https://static.iyf.tv/upload/video/202609161645454528803.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609161645454528803.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第1期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_all_24",
      "title": "劣探德克尔第2季",
      "slug": "劣探德克尔第2季",
      "cover": "https://static.iyf.tv/upload/video/202609161558025872871.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609161558025872871.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T05:39:37.140Z"
    }
  ],
  "movie": [
    {
      "entityId": "ik_radar_movie_1",
      "tmdbId": "1306055",
      "title": "数到三",
      "slug": "数到三",
      "cover": "https://image.tmdb.org/t/p/w500/kRlgxkA83z6atla0BRcTxHZRFtf.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/n0hqyWelh52kBuBAftH1V1omTTW.jpg",
      "rate": "5.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T17:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_2",
      "tmdbId": "1240889",
      "title": "瘴气营地的青春性事与死亡",
      "slug": "瘴气营地的青春性事与死亡",
      "cover": "https://image.tmdb.org/t/p/w500/t8JBX1h4yipba70tNmPaTV2tgbr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/d1n2ySWSanU34eEsluRjfrjRq52.jpg",
      "rate": "6.5",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T16:40:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_3",
      "tmdbId": "1641629",
      "title": "你我对抗全世界",
      "slug": "你我对抗全世界",
      "cover": "https://image.tmdb.org/t/p/w500/j801na4Sf6DrZPL5Ba1vUZo5OFN.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nkEhDomjmPHJSA4Tx8pxv0NlKEy.jpg",
      "rate": "5.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T16:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_4",
      "tmdbId": "1514863",
      "title": "最佳舞伴",
      "slug": "最佳舞伴",
      "cover": "https://image.tmdb.org/t/p/w500/9soOjsZ91vtMzypK2F3MC378JI5.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5m1j7Wibh3HnZq5QHm97v8dI3GH.jpg",
      "rate": "8.7",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T15:40:17.153Z"
    },
    {
      "entityId": "ik277239",
      "tmdbId": "1541125",
      "title": "年会不能停！2",
      "slug": "年会不能停2",
      "cover": "https://image.tmdb.org/t/p/w500/pD4ItmNxCXcXjAX4KNQLQCMHDjb.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/x8FmUv8INF7E5fkP2Jm9KLfk87Q.jpg",
      "rate": "7.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "第20260919期",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_movie_6",
      "tmdbId": "1769717",
      "title": "M.I.S.S.I.O.N. 歌剧般的潜入搜查官",
      "slug": "mission-歌剧般的潜入搜查官",
      "cover": "https://image.tmdb.org/t/p/w500/r7xJyiB1tinL6NlukwaurIHKMBD.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2bBakSsFpnu6W8IKg6B1RJuDNeU.jpg",
      "rate": "5.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "更新至第3集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_movie_7",
      "tmdbId": "1469930",
      "title": "打生桩",
      "slug": "打生桩",
      "cover": "https://image.tmdb.org/t/p/w500/wdOa8jWX8u1YNSlWyRvoNCc9y7S.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/k3Nc57fdRkzleHjodta45mGJV2C.jpg",
      "rate": "3.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T14:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_8",
      "tmdbId": "1101383",
      "title": "逃出绝命街",
      "slug": "逃出绝命街",
      "cover": "https://image.tmdb.org/t/p/w500/2eXquFgtDqSyVmrcBwC9ZnzNw3d.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/b9q9VmbXDvJmTziRqkwdEmFdwhr.jpg",
      "rate": "6.9",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "院线热映",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:40:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_9",
      "tmdbId": "1765955",
      "title": "蜂鸟行动",
      "slug": "蜂鸟行动",
      "cover": "https://image.tmdb.org/t/p/w500/oZXH2DonlPsDVPBTIy5gQxBZLcU.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/dqnS9n5yfMNPzJYyKyand2skUNY.jpg",
      "rate": "4.7",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T13:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_10",
      "tmdbId": "1241918",
      "title": "出入平安",
      "slug": "出入平安",
      "cover": "https://image.tmdb.org/t/p/w500/dEBGIgF3mjHHEozd2VMcrbTP6g1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/d9BG2RvTNKvsCl7wEfazTEtrXJz.jpg",
      "rate": "6.7",
      "year": "2024",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T12:40:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_11",
      "tmdbId": "1340102",
      "title": "狮拳",
      "slug": "狮拳",
      "cover": "https://image.tmdb.org/t/p/w500/3x9vKiUombbUvpVxdxSxcBDxrqB.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mfevSm3elJX1IqCjBxC7bGl07s2.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T12:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_12",
      "title": "惩罚者2026",
      "slug": "惩罚者2026",
      "cover": "https://img.guangsuimage.com/cover/951477c405c46624e7650ab6e4354d4b.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/951477c405c46624e7650ab6e4354d4b.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T11:40:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_13",
      "title": "美女捕吏女牢秘档续美女奉行2",
      "slug": "美女捕吏女牢秘档续美女奉行2",
      "cover": "https://img.guangsuimage.com/cover/d5acadf1b2e7b66ec4c8e46b9de59d1f.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/d5acadf1b2e7b66ec4c8e46b9de59d1f.jpg",
      "rate": "8.8",
      "year": "1995",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T11:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_14",
      "tmdbId": "1377900",
      "title": "叛谍猎手",
      "slug": "叛谍猎手",
      "cover": "https://image.tmdb.org/t/p/w500/wEXaqQXOBPClwqEufiFqgfHVXTk.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zxI3jUzMjvzSuFOyfNiiLXpGUSn.jpg",
      "rate": "0.8",
      "year": "2025",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T10:40:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_15",
      "tmdbId": "1608445",
      "title": "无情的拳头",
      "slug": "无情的拳头",
      "cover": "https://image.tmdb.org/t/p/w500/v9ZtOlIJ3HS49UMtS4eli3WMenT.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/dYcd4GlqPQ923Xx6xMBNHoDIJrH.jpg",
      "rate": "8.2",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T10:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_16",
      "tmdbId": "1768954",
      "title": "热血部落",
      "slug": "热血部落",
      "cover": "https://image.tmdb.org/t/p/w500/5tBQTiSJsN4TPF2UHevG7Lyk7z5.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/5tBQTiSJsN4TPF2UHevG7Lyk7z5.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T09:40:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_17",
      "tmdbId": "1764761",
      "title": "山竹刀",
      "slug": "山竹刀",
      "cover": "https://image.tmdb.org/t/p/w500/uGMUv4cTj1k7UAr4nu7QVFzdLZL.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/uGMUv4cTj1k7UAr4nu7QVFzdLZL.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T09:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_18",
      "tmdbId": "1576549",
      "title": "异种污染",
      "slug": "异种污染",
      "cover": "https://image.tmdb.org/t/p/w500/m0LZmS2HPm0qvzgM49epZ2Cl83t.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/twRNB9E4c3QQd4BczC3drBNrFd5.jpg",
      "rate": "5.5",
      "year": "2025",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T08:40:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_19",
      "title": "血路姐弟",
      "slug": "血路姐弟",
      "cover": "https://img.guangsuimage.com/cover/7ff09dabdadb83b37fcc9d5177a9b097.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/7ff09dabdadb83b37fcc9d5177a9b097.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T08:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_20",
      "tmdbId": "1278971",
      "title": "神拳赌约",
      "slug": "神拳赌约",
      "cover": "https://image.tmdb.org/t/p/w500/Ao4sN50C7RoyQJJlmPrFEMrizAp.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/97N6gxiBB2Dk71g8v0XxSi8Hyeb.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T07:40:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_21",
      "title": "求救信号2026",
      "slug": "求救信号2026",
      "cover": "https://img.guangsuimage.com/cover/d72e35bf81950d921d449c1219c189c9.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/d72e35bf81950d921d449c1219c189c9.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T07:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_22",
      "tmdbId": "1326891",
      "title": "乱世杀局",
      "slug": "乱世杀局",
      "cover": "https://image.tmdb.org/t/p/w500/a8Ut1fkbqvolWfEIl8Voa1oUsDG.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/AvMub4XZABMznZBn7W5fot7ghDS.jpg",
      "rate": "4.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T06:40:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_23",
      "tmdbId": "1433583",
      "title": "监狱雄心",
      "slug": "监狱雄心",
      "cover": "https://image.tmdb.org/t/p/w500/8i5iZV50CoEtmDCFM7RSxCkpE8h.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zLeq2fbHU6UdA7mhsYnIULORTgq.jpg",
      "rate": "6.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T06:10:17.153Z"
    },
    {
      "entityId": "ik_radar_movie_24",
      "title": "牺牲",
      "slug": "牺牲",
      "cover": "https://img.guangsuimage.com/cover/3ce0a6bd2fcb665bd7c80284c6cc3a4e.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/3ce0a6bd2fcb665bd7c80284c6cc3a4e.jpg",
      "rate": "8.8",
      "year": "2025",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T05:40:17.153Z"
    }
  ],
  "tv": [
    {
      "entityId": "ik_radar_tv_1",
      "tmdbId": "56570",
      "title": "古战场传奇：吾血之亲第2季",
      "slug": "古战场传奇-吾血之亲第2季",
      "cover": "https://image.tmdb.org/t/p/w500/9ltOIdbIZA3K9TelnvQkwootkXc.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nf3Vlxm3C9U1aKUUQHmKFZmxPSc.jpg",
      "rate": "8.2",
      "year": "2014",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:10:54.807Z"
    },
    {
      "entityId": "ik_radar_tv_2",
      "title": "阿波罗陷落",
      "slug": "阿波罗陷落",
      "cover": "https://static.iyf.tv/upload/video/202609191456165675483.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609191456165675483.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第2集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T16:40:54.807Z"
    },
    {
      "entityId": "ik_radar_tv_3",
      "tmdbId": "318239",
      "title": "神秘的声音",
      "slug": "神秘的声音",
      "cover": "https://image.tmdb.org/t/p/w500/PGfkJNU8RV90kaUlsnHyU0LN80.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/vxUL7EZHqev4YSJ0EwpaW97336B.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T16:10:54.807Z"
    },
    {
      "entityId": "ik_radar_tv_4",
      "tmdbId": "312585",
      "title": "乌鸦俱乐部",
      "slug": "乌鸦俱乐部",
      "cover": "https://image.tmdb.org/t/p/w500/gttK2vQTd52txo54xrYFdVg1fbS.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/wPJYkh76gSEECGsN4KTKKLFBkPj.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T15:40:54.807Z"
    },
    {
      "entityId": "ik_radar_tv_5",
      "tmdbId": "275102",
      "title": "挑情丑闻",
      "slug": "挑情丑闻",
      "cover": "https://image.tmdb.org/t/p/w500/kFKpftbKr2BFe37iyLWd9wQn01c.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/uc1p1PEbEMpdIHqnU9TESNC6Jhp.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全8集",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_6",
      "title": "幸福伽菜子的快乐杀手生活第2季",
      "slug": "幸福伽菜子的快乐杀手生活第2季",
      "cover": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "rate": "9.3",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第2集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T14:40:54.807Z"
    },
    {
      "entityId": "ik_radar_tv_7",
      "title": "黑帮领地第2季",
      "slug": "黑帮领地第2季",
      "cover": "https://static.iyf.tv/upload/video/202609181142254213861.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181142254213861.gif",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T14:10:54.807Z"
    },
    {
      "entityId": "ik_radar_tv_8",
      "title": "万物既伟大又渺小第7季",
      "slug": "万物既伟大又渺小第7季",
      "cover": "https://static.iyf.tv/upload/video/202609181133593333356.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181133593333356.gif",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:40:54.807Z"
    },
    {
      "entityId": "ik_radar_tv_9",
      "tmdbId": "298008",
      "title": "假面美颜",
      "slug": "假面美颜",
      "cover": "https://image.tmdb.org/t/p/w500/r87DTrK1FC5tEjK32JmJzOYw48T.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mIjERiWlnDzQWHTcZdtucLmTCeO.jpg",
      "rate": "7.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全8集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_10",
      "tmdbId": "30981",
      "title": "怪物：丽兹·波顿的故事",
      "slug": "怪物-丽兹-波顿的故事",
      "cover": "https://image.tmdb.org/t/p/w500/7ZhHyA0IIQOyz1hzCXpTilXg4Q2.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/6T19aRp9zLMghZo1dTEwoNyreNZ.jpg",
      "rate": "8.5",
      "year": "2004",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全8集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_11",
      "tmdbId": "332507",
      "title": "末誓",
      "slug": "末誓",
      "cover": "https://image.tmdb.org/t/p/w500/k236Jf1rXmQ4LvWxeF0zoFWhbC1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/foGJLXGMEmgRo4yHPG1IgW2Dd52.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第12集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_12",
      "tmdbId": "282326",
      "title": "兰香如故",
      "slug": "兰香如故",
      "cover": "https://image.tmdb.org/t/p/w500/kfurXRMH1ZkUoyT5HN72zLTQxzZ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mZSewqVlY4F2F2Axm7hiG6KBOBp.jpg",
      "rate": "7.2",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第20集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_13",
      "tmdbId": "294486",
      "title": "交锋",
      "slug": "交锋",
      "cover": "https://image.tmdb.org/t/p/w500/gRe5FZjMWw8xXzWk1hxWuNQckOg.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lYDwHYOR8PROQfSJGZ8LqvwUVcW.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第30集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_14",
      "tmdbId": "317308",
      "title": "请记住我的名字",
      "slug": "请记住我的名字",
      "cover": "https://image.tmdb.org/t/p/w500/zhPRlmYHRwQW1KHkuAPGnKmZTBQ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iTs5hXdEDA3pI6FabhH6rKkpK7P.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第5集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_15",
      "tmdbId": "290863",
      "title": "冬城猎凶",
      "slug": "冬城猎凶",
      "cover": "https://image.tmdb.org/t/p/w500/8nenduIuctLj2YBjWHG8pFs1X6R.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/28u4q3fPzXmbyf3BoiWweUOuuzj.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全18集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_16",
      "tmdbId": "294990",
      "title": "一瓯春",
      "slug": "一瓯春",
      "cover": "https://image.tmdb.org/t/p/w500/7KjVhRaarZ5L3CBirQEmt89ioiz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qLZQnTiQxkBOid9tVLWC1CmoOcu.jpg",
      "rate": "9.5",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第10集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T09:40:54.807Z"
    },
    {
      "entityId": "ik_radar_tv_17",
      "title": "八仙伏魔录",
      "slug": "八仙伏魔录",
      "cover": "https://img.guangsuimage.com/cover/9dd703a873c91692b9490c638eb8eca5.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/9dd703a873c91692b9490c638eb8eca5.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全56集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_18",
      "tmdbId": "288873",
      "title": "云雀叫天录",
      "slug": "云雀叫天录",
      "cover": "https://image.tmdb.org/t/p/w500/nHAqLcS38jFpNsDRI0mZLIUmRVI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ptn62KJ5n96MCVKiXVxRdhbn5BG.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第14集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_19",
      "tmdbId": "334754",
      "title": "荣耀的阶梯",
      "slug": "荣耀的阶梯",
      "cover": "https://image.tmdb.org/t/p/w500/lZXqOkURnRMPMJ05fnvvpmTNiv5.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oeDqhlvrsFKrc9oP6nrAmMcao4e.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第20集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T08:10:54.807Z"
    },
    {
      "entityId": "ik_radar_tv_20",
      "tmdbId": "333517",
      "title": "车轮下的真相",
      "slug": "车轮下的真相",
      "cover": "https://image.tmdb.org/t/p/w500/4I3vjEm1Ahp34CbGwENDL9OIZ09.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/tPIM8UHqYMpFvEdNQ9qGq7zUqQE.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第20集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_21",
      "tmdbId": "332014",
      "title": "熔城",
      "slug": "熔城",
      "cover": "https://image.tmdb.org/t/p/w500/ik0MVgFJgQSQV4cEawAlHBcapbH.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/yLBXldClV6vLyGete2bCRMbJjwG.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第16集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_22",
      "tmdbId": "303290",
      "title": "九品猎妖官",
      "slug": "九品猎妖官",
      "cover": "https://image.tmdb.org/t/p/w500/a2pQnGu1pGZdJqZENtu7mvxu0jm.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/jrequqXXyh150W6ZJZ1luLx8Hon.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全24集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_23",
      "tmdbId": "335131",
      "title": "为爱正名",
      "slug": "为爱正名",
      "cover": "https://image.tmdb.org/t/p/w500/kcvO8zGPhHxIJX28KaXINTMIMy9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/1rEjheAKERvqDSxANSp8SjUac6o.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第13集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_tv_24",
      "tmdbId": "334299",
      "title": "独剑九天",
      "slug": "独剑九天",
      "cover": "https://image.tmdb.org/t/p/w500/ee8W1LlIqdjotA24ffJNsgFLIIs.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hb2K9fZ8UFlkkswJl0koM09AOXt.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全27集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    }
  ],
  "anime": [
    {
      "entityId": "ik_radar_anime_1",
      "tmdbId": "66732",
      "title": "怪奇物语：1985故事集第2季",
      "slug": "怪奇物语-1985故事集第2季",
      "cover": "https://image.tmdb.org/t/p/w500/iTvTODru3s8A4eGqVZzALcipIft.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      "rate": "8.6",
      "year": "2016",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "全10集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_2",
      "tmdbId": "75787",
      "title": "狐妖小红娘黄风岭篇",
      "slug": "狐妖小红娘黄风岭篇",
      "cover": "https://image.tmdb.org/t/p/w500/9oquBnehuZPAVhA4rhW3IXY6LqN.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/tr2umB8gk8mR7gO5caiFEZhDeGz.jpg",
      "rate": "6.6",
      "year": "2015",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "更新至第06集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_3",
      "tmdbId": "314478",
      "title": "登登登邓氏三宝",
      "slug": "登登登邓氏三宝",
      "cover": "https://image.tmdb.org/t/p/w500/cnh7OusbX48u7ctpGCws8HzRCo9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xcjvlbVkVvGodPdfv3c6NzknMIB.jpg",
      "rate": "5.6",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "全8集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_4",
      "tmdbId": "207468",
      "title": "怪兽8号 鸣海的日常",
      "slug": "怪兽8号-鸣海的日常",
      "cover": "https://image.tmdb.org/t/p/w500/5HOL3peaKj8COZx1hXFcEDgwhvD.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/htGeuCcNhlBe8GTx3izKOsd8frw.jpg",
      "rate": "8.4",
      "year": "2024",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "更新至第3集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T15:41:31.123Z"
    },
    {
      "entityId": "ik_radar_anime_5",
      "tmdbId": "297923",
      "title": "灵境行者",
      "slug": "灵境行者",
      "cover": "https://image.tmdb.org/t/p/w500/skH9B7ZK3kE56wQVUOUOM26OPUY.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/fZtDctt9hhc4JmPYmeX7jWPSNVG.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "更新至第04集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_6",
      "title": "银魂吉原大炎上",
      "slug": "银魂吉原大炎上",
      "cover": "https://static.iyf.tv/upload/video/202608291411331117775.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202608291411331117775.gif",
      "rate": "9.0",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_7",
      "title": "诛仙4",
      "slug": "诛仙4",
      "cover": "https://static.iyf.tv/upload/video/202608202259155970815.jpg",
      "backdrop": "https://static.iyf.tv/upload/video/202608202259155970815.jpg",
      "rate": "9.3",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "更新至第7集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T14:11:31.123Z"
    },
    {
      "entityId": "ik_radar_anime_8",
      "tmdbId": "330609",
      "title": "财神窦占龙",
      "slug": "财神窦占龙",
      "cover": "https://image.tmdb.org/t/p/w500/mCrTWs2VDsg4cV7j12ykJeDG85a.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/1OuxPsIEQE6NnATVV3EJcB17OUH.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "更新至第7集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:41:31.123Z"
    },
    {
      "entityId": "ik_radar_anime_9",
      "title": "时光代理人第3季",
      "slug": "时光代理人第3季",
      "cover": "https://static.iyf.tv/upload/video/202608141332313200888.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202608141332313200888.gif",
      "rate": "9.6",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "更新至第7集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T13:11:31.123Z"
    },
    {
      "entityId": "ik_radar_anime_10",
      "tmdbId": "331159",
      "title": "谷雨街后巷",
      "slug": "谷雨街后巷",
      "cover": "https://image.tmdb.org/t/p/w500/wZvPNfSJoWvuJ37UGsIN1iJR4Tz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/uaMeWhk0dyobNUSaTldpbJqrncc.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "全05集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_11",
      "tmdbId": "79481",
      "title": "斗破苍穹 年番",
      "slug": "斗破苍穹-年番",
      "cover": "https://image.tmdb.org/t/p/w500/oyoahIcdamTXwjIaL3CqZ1v5CLl.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cTCn2EO69SERNfhaezJMoqBom4G.jpg",
      "rate": "8.0",
      "year": "2017",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第211集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_12",
      "tmdbId": "272206",
      "title": "全球惊悚：我开启外挂自选商城 动态漫画",
      "slug": "全球惊悚-我开启外挂自选商城-动态漫画",
      "cover": "https://image.tmdb.org/t/p/w500/dfjOv7XDrIwcWdqbSGmSZeHZ33d.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/dfjOv7XDrIwcWdqbSGmSZeHZ33d.jpg",
      "rate": "8.8",
      "year": "2024",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全100集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_13",
      "title": "论苟道飞升的可能性",
      "slug": "论苟道飞升的可能性",
      "cover": "https://img.guangsuimage.com/cover/5cc5cd4793f11e8ebbcd0a925b31d17a.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/5cc5cd4793f11e8ebbcd0a925b31d17a.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全128集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_14",
      "title": "禅王渡尘",
      "slug": "禅王渡尘",
      "cover": "https://img.guangsuimage.com/cover/b14f1d742a471207c017cc24b0fa6e87.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/b14f1d742a471207c017cc24b0fa6e87.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第164集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_15",
      "title": "魔道重生的女武神",
      "slug": "魔道重生的女武神",
      "cover": "https://img.guangsuimage.com/cover/4390d85d9625806b78ad7ecb81044845.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/4390d85d9625806b78ad7ecb81044845.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第185集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_16",
      "title": "红妆送君葬",
      "slug": "红妆送君葬",
      "cover": "https://img.guangsuimage.com/cover/93ae0d44b350540f196d8bcde3ddeca3.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/93ae0d44b350540f196d8bcde3ddeca3.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第54集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_17",
      "tmdbId": "281233",
      "title": "光阴之外",
      "slug": "光阴之外",
      "cover": "https://image.tmdb.org/t/p/w500/zWvNrMm3yYkkMYafYLn43ZgwZYf.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/enuFwlXhABZP83TW86kV6th6q8d.jpg",
      "rate": "9.4",
      "year": "2025",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第40集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_18",
      "tmdbId": "116042",
      "title": "如果历史是一群喵 大明皇朝篇",
      "slug": "如果历史是一群喵-大明皇朝篇",
      "cover": "https://image.tmdb.org/t/p/w500/95yrKv8xrcUL4VlU6L3qJSxEFwN.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iaV6JMFB3p39d3kNnkd2hhAER1K.jpg",
      "rate": "8.5",
      "year": "2018",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第12集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_19",
      "tmdbId": "220850",
      "title": "炼气十万年",
      "slug": "炼气十万年",
      "cover": "https://image.tmdb.org/t/p/w500/dZF7DTXgyoyshdALJLOrQ9Zj4Xz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iGJ9eOBsWcOPOQkZmH8LwWub4eL.jpg",
      "rate": "8.5",
      "year": "2023",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第378集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_20",
      "tmdbId": "122612",
      "title": "万界独尊",
      "slug": "万界独尊",
      "cover": "https://image.tmdb.org/t/p/w500/l2Z8oW6lW4FhgWt2Uu2NQhaEVLK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/jpTfQzXB7SpsiUrhL4hUbCZRrbu.jpg",
      "rate": "9.5",
      "year": "2021",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第484集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_21",
      "title": "无良系统变向导，我被四个哨兵拿捏了",
      "slug": "无良系统变向导我被四个哨兵拿捏了",
      "cover": "https://img.guangsuimage.com/cover/c0f9a1897e0b5c971c4f213b761a5043.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/c0f9a1897e0b5c971c4f213b761a5043.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第11集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_22",
      "title": "余烬之后",
      "slug": "余烬之后",
      "cover": "https://img.guangsuimage.com/cover/28b627875734779e88bd20f68b705af8.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/28b627875734779e88bd20f68b705af8.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第17集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_23",
      "title": "仙界第一残魄，可她悟性超绝",
      "slug": "仙界第一残魄可她悟性超绝",
      "cover": "https://img.guangsuimage.com/cover/fc406b2b65b2143f2f99bc95621aa5f6.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/fc406b2b65b2143f2f99bc95621aa5f6.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全50集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_anime_24",
      "tmdbId": "106449",
      "title": "凡人修仙传",
      "slug": "凡人修仙传",
      "cover": "https://image.tmdb.org/t/p/w500/u1VRjvvCIVwb1MUhoxSAUimhoKZ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8NIvQY34tNPc4txNeym2zEYk9ek.jpg",
      "rate": "8.4",
      "year": "2020",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第192集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    }
  ],
  "variety": [
    {
      "entityId": "ik_radar_variety_1",
      "title": "梦想改造家2026",
      "slug": "梦想改造家2026",
      "cover": "https://static.iyf.tv/upload/video/202509181943094364535.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202509181943094364535.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第1期会员版",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T17:12:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_2",
      "title": "云画的月光10周年综艺特辑",
      "slug": "云画的月光10周年综艺特辑",
      "cover": "https://static.iyf.tv/upload/video/202609161645454528803.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609161645454528803.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第1期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_variety_3",
      "tmdbId": "334553",
      "title": "第六感: B side",
      "slug": "第六感-b-side",
      "cover": "https://image.tmdb.org/t/p/w500/mGCQQlLobyKPianz2gU0vtVcnvT.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9oiHk75ouFejI5G3gBHq4oYZWBc.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_variety_4",
      "title": "打歌2026",
      "slug": "打歌2026",
      "cover": "https://static.iyf.tv/upload/video/202609111636583635663.jpg",
      "backdrop": "https://static.iyf.tv/upload/video/202609111636583635663.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第2期",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_variety_5",
      "title": "背后第2季",
      "slug": "背后第2季",
      "cover": "https://static.iyf.tv/upload/video/202506011723082337643.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202506011723082337643.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第3期",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_variety_6",
      "title": "花儿与少年第8季",
      "slug": "花儿与少年第8季",
      "cover": "https://static.iyf.tv/upload/video/202609041706270661205.jpg",
      "backdrop": "https://static.iyf.tv/upload/video/202609041706270661205.jpg",
      "rate": "8.2",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第2期",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_variety_7",
      "tmdbId": "302173",
      "title": "对我来说太刻薄的经纪人-秘书镇第2季",
      "slug": "对我来说太刻薄的经纪人-秘书镇第2季",
      "cover": "https://image.tmdb.org/t/p/w500/7H2hHWyYTR0nnlsvqxLYfrhw21m.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mpLTg1XfCKMZBdh0wECjPAm5P73.jpg",
      "rate": "8.5",
      "year": "2025",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第4期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_variety_8",
      "title": "我家那闺女2026",
      "slug": "我家那闺女2026",
      "cover": "https://static.iyf.tv/upload/video/202608271524382431872.jpg",
      "backdrop": "https://static.iyf.tv/upload/video/202608271524382431872.jpg",
      "rate": "7.9",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第4期",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_variety_9",
      "tmdbId": "94773",
      "title": "舞蹈新风暴",
      "slug": "舞蹈新风暴",
      "cover": "https://image.tmdb.org/t/p/w500/jej7FfIvWZyLSMoNbPP3MkEByob.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/WQSOHT9QFxMMpQ4TAscX3f9IMO.jpg",
      "rate": "8.5",
      "year": "2019",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第4期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_variety_10",
      "title": "你好时光第2季",
      "slug": "你好时光第2季",
      "cover": "https://static.iyf.tv/upload/video/202608221659025916676.jpg",
      "backdrop": "https://static.iyf.tv/upload/video/202608221659025916676.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第4期",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T12:42:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_11",
      "tmdbId": "154770",
      "title": "你好，星期六 2022",
      "slug": "你好星期六-2022",
      "cover": "https://image.tmdb.org/t/p/w500/wsTjWy6NE2s3h0neChr0D92ddwI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/pvOI0jUuBVigqNTXClGGhIK2dSk.jpg",
      "rate": "6.5",
      "year": "2022",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第20260919期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T12:12:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_12",
      "title": "种植前线2026",
      "slug": "种植前线2026",
      "cover": "https://img.guangsuimage.com/cover/0478a1a937fb5d10222e707cb19d5ef1.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/0478a1a937fb5d10222e707cb19d5ef1.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第20260919期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T11:42:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_13",
      "title": "一饭封神第二季",
      "slug": "一饭封神第二季",
      "cover": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "主厨沉浸式逛吃澳门",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T11:12:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_14",
      "tmdbId": "1232909",
      "title": "打歌2026·X舞台",
      "slug": "打歌2026-x舞台",
      "cover": "https://image.tmdb.org/t/p/w500/hQR6pQvs2N4hGT31mKNq77SbZDn.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/u3bp1i24OV5TaEQ2hUhdX0Fs7cA.jpg",
      "rate": "8.8",
      "year": "2021",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第2期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_variety_15",
      "tmdbId": "779206",
      "title": "背后2",
      "slug": "背后2",
      "cover": "https://image.tmdb.org/t/p/w500/fzwVvE5sktSqopG2xU3TiwRnV7T.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/vo1uChsqN7GJ51E8gF4lXCND6rl.jpg",
      "rate": "8.8",
      "year": "2019",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第3期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T10:12:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_16",
      "tmdbId": "331587",
      "title": "伦敦合伙人",
      "slug": "伦敦合伙人",
      "cover": "https://image.tmdb.org/t/p/w500/a6D6QHnWQTTNGAmllEmIZ0HTiV9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/a6D6QHnWQTTNGAmllEmIZ0HTiV9.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第7期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T09:42:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_17",
      "tmdbId": "330926",
      "title": "一路向海的少年",
      "slug": "一路向海的少年",
      "cover": "https://image.tmdb.org/t/p/w500/3bQO1x3kmGiKWLUbc6jRt1uwsKJ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/t392uv2WU6ojezRpuDgGZDJS5pb.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第7期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T09:12:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_18",
      "title": "现在就出发第四季",
      "slug": "现在就出发第四季",
      "cover": "https://img.guangsuimage.com/cover/922754ecc14380fcfa4ff0635d066912.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/922754ecc14380fcfa4ff0635d066912.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "260919回顾特辑",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T08:42:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_19",
      "tmdbId": "296202",
      "title": "地球超新鲜 第二季",
      "slug": "地球超新鲜-第二季",
      "cover": "https://image.tmdb.org/t/p/w500/olnV8BefOFnj3U3qcvlYdylAzDq.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8KjVA97182D6RF1cDl6bE6o7zAz.jpg",
      "rate": "8.8",
      "year": "2025",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第1期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:13:20.260Z"
    },
    {
      "entityId": "ik_radar_variety_20",
      "title": "北京厂开玩",
      "slug": "北京厂开玩",
      "cover": "https://img.guangsuimage.com/cover/ddc8bb0477c7261fa8def2fbc0e335d3.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/ddc8bb0477c7261fa8def2fbc0e335d3.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "走向人机融合新方向",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T07:42:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_21",
      "tmdbId": "331649",
      "title": "大哥小助理",
      "slug": "大哥小助理",
      "cover": "https://image.tmdb.org/t/p/w500/42KdZo0AtIxGtdeEe0Z5uStiPYQ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lNAnwytYKugxKWZosYmXvcrV4iU.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第6期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T07:12:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_22",
      "tmdbId": "331569",
      "title": "不想睡的星期五",
      "slug": "不想睡的星期五",
      "cover": "https://image.tmdb.org/t/p/w500/ladRcczkCEFXFxycIleWgx9yV5q.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/y8kPD0sQqlL8lo7oYZVtYWP330Y.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第6期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T06:42:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_23",
      "tmdbId": "330354",
      "title": "心动双重奏",
      "slug": "心动双重奏",
      "cover": "https://img.guangsuimage.com/cover/ad595f77f52724b0e11d07b27f2a5176.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/ad595f77f52724b0e11d07b27f2a5176.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第8期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T06:12:07.724Z"
    },
    {
      "entityId": "ik_radar_variety_24",
      "title": "小姐不熙娣2026",
      "slug": "小姐不熙娣2026",
      "cover": "https://img.guangsuimage.com/cover/d029847ab0189f1a6c570f1d37ccb6cb.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/d029847ab0189f1a6c570f1d37ccb6cb.jpg",
      "rate": "7.6",
      "year": "2022",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第260909期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T05:42:07.724Z"
    }
  ],
  "documentary": [
    {
      "entityId": "ik_radar_documentary_1",
      "tmdbId": "329274",
      "title": "若泽·穆里尼奥：特立之道",
      "slug": "若泽-穆里尼奥-特立之道",
      "cover": "https://image.tmdb.org/t/p/w500/2rqY4giaooi18Z0mLiGOfJ4XUuN.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ucEswoBdNxw3UchQ6WHxnGU4g1a.jpg",
      "rate": "7.8",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "03集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T17:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_2",
      "tmdbId": "328735",
      "title": "爱达荷州血案：大学梦魇",
      "slug": "爱达荷州血案-大学梦魇",
      "cover": "https://image.tmdb.org/t/p/w500/72hhJQKejnwpK0UP2QpFDRdpFd0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/1BosXOwTUudCrE77ayEJSROW8sL.jpg",
      "rate": "6.7",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "3集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T16:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_3",
      "title": "克拉克森的农场第5季",
      "slug": "克拉克森的农场第5季",
      "cover": "https://static.iyf.tv/upload/video/202606192116311654437.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202606192116311654437.gif",
      "rate": "10.0",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "08集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T16:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_4",
      "tmdbId": "1641962",
      "title": "体坛秘史：棋逢敌手",
      "slug": "体坛秘史-棋逢敌手",
      "cover": "https://image.tmdb.org/t/p/w500/oC68KgbyFiraKJRdUedQI9aXBF.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8SEs6yUgrE5shU8tqXuR2MQIdlc.jpg",
      "rate": "6.9",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T15:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_5",
      "tmdbId": "1641965",
      "title": "体坛秘史：监狱拓荒者",
      "slug": "体坛秘史-监狱拓荒者",
      "cover": "https://image.tmdb.org/t/p/w500/vmp45llJTRr6JLaIamt3RlfxgTH.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/gyYTuYSwiqGNaqNomscb6oSZ8Mt.jpg",
      "rate": "6.8",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T15:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_6",
      "tmdbId": "1641961",
      "title": "体坛秘史：拉玛·奥多姆的生死边缘",
      "slug": "体坛秘史-拉玛-奥多姆的生死边缘",
      "cover": "https://image.tmdb.org/t/p/w500/mwm2PeLy5ajHWDxMdNNrk2mSGOH.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/sLHSspHOdkTdK30nZVigY4zxC8P.jpg",
      "rate": "6.7",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T14:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_7",
      "tmdbId": "1641966",
      "title": "体坛秘史：马术名将枪击案",
      "slug": "体坛秘史-马术名将枪击案",
      "cover": "https://image.tmdb.org/t/p/w500/6K0qTMozHAzzYVsWQrXxmqCC5wY.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/6KMv3pPMkPlHoDdy461x3qep6GX.jpg",
      "rate": "6.2",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "platformBadge": "Netflix",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T14:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_8",
      "tmdbId": "1623125",
      "title": "大卫·艾登堡：大猩猩的故事",
      "slug": "大卫-艾登堡-大猩猩的故事",
      "cover": "https://image.tmdb.org/t/p/w500/43XAqW4AnHaDqez4C8qYk55A75o.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/r80zWzxQn5pMAPgDHd4CiKIGOyU.jpg",
      "rate": "7.9",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_9",
      "title": "十三邀第九季",
      "slug": "十三邀第九季",
      "cover": "https://img.guangsuimage.com/cover/2906dda4fedb740e57e75cbca80e6025.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/2906dda4fedb740e57e75cbca80e6025.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第14集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_10",
      "title": "普法栏目剧2011年",
      "slug": "普法栏目剧2011年",
      "cover": "https://img.guangsuimage.com/cover/ce9858d6de8887d99ebcc487e7eccde1.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/ce9858d6de8887d99ebcc487e7eccde1.jpg",
      "rate": "8.8",
      "year": "2011",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "走出泥潭下",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T12:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_11",
      "title": "柯南势在必行第三季",
      "slug": "柯南势在必行第三季",
      "cover": "https://img.guangsuimage.com/cover/017cbe61413e59cdc7370d4017bd3d91.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/017cbe61413e59cdc7370d4017bd3d91.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第4集完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T12:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_12",
      "tmdbId": "332910",
      "title": "一个致命故事",
      "slug": "一个致命故事",
      "cover": "https://image.tmdb.org/t/p/w500/rDPi9MXUtK0oVx3uwXHY5yRTKVW.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/kFp5nRy5b6xghGKObHsqvcyGlR8.jpg",
      "rate": "10.0",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T11:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_13",
      "tmdbId": "1762506",
      "title": "兄弟连：薪火永续",
      "slug": "兄弟连-薪火永续",
      "cover": "https://image.tmdb.org/t/p/w500/n29MsV1m2OCbDp6PLeHxziOVOLG.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mMLVXM8UOKSxVSxnXcmuBPMiHsC.jpg",
      "rate": "9.1",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T11:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_14",
      "title": "天真一代第一季",
      "slug": "天真一代第一季",
      "cover": "https://img.guangsuimage.com/cover/eae283d9b6b4ef69ff165a1445a6519e.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/eae283d9b6b4ef69ff165a1445a6519e.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第3集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T10:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_15",
      "tmdbId": "1739186",
      "title": "体坛秘史：文斯·扬的人生剖白",
      "slug": "体坛秘史-文斯-扬的人生剖白",
      "cover": "https://image.tmdb.org/t/p/w500/A1n4bOedczRdAm3JRBmbg35deCD.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/eVOuDbCLElehZr1U5aZtK1yAU3f.jpg",
      "rate": "6.4",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T10:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_16",
      "title": "爱了！中国式现代化",
      "slug": "爱了中国式现代化",
      "cover": "https://img.guangsuimage.com/cover/60632049220f6fe2c205e3f2e3c7db07.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/60632049220f6fe2c205e3f2e3c7db07.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第8集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T09:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_17",
      "tmdbId": "1744876",
      "title": "菲托·帕兹：歌中的世界",
      "slug": "菲托-帕兹-歌中的世界",
      "cover": "https://image.tmdb.org/t/p/w500/vG6rXAyLSu5MqIZG5jTjP6tpdbl.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/tThekN7w7Kyo41FGrrKYfC0ViVE.jpg",
      "rate": "5.2",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T09:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_18",
      "tmdbId": "311731",
      "title": "神兽猎局",
      "slug": "神兽猎局",
      "cover": "https://image.tmdb.org/t/p/w500/tZhx3eXEcaLnLJkITX85TsKCAod.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/gQUA5I6dOC17soO3BLagbztB6v2.jpg",
      "rate": "7.2",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第4集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T08:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_19",
      "tmdbId": "1739202",
      "title": "体坛秘史：霹雳舞博士雷切尔·冈恩",
      "slug": "体坛秘史-霹雳舞博士雷切尔-冈恩",
      "cover": "https://image.tmdb.org/t/p/w500/3pnlJjsGtrUp3cPEOLzkR0sPQAK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iBik58vWTbO3s9GgUW86v7fYqfZ.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T08:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_20",
      "tmdbId": "1038727",
      "title": "失窃王国",
      "slug": "失窃王国",
      "cover": "https://image.tmdb.org/t/p/w500/u2d5ExYA3Y8NO48oRkU8EZrakBX.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8KyKWCDaF5paMg5VkOshYZ947Pi.jpg",
      "rate": "2.0",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T07:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_21",
      "tmdbId": "1752159",
      "title": "转折点：911世代",
      "slug": "转折点-911世代",
      "cover": "https://image.tmdb.org/t/p/w500/4ZsSaTbddmCoSZc9qgyZt737AWv.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/z2Uf0yntMjY0XG87YfoqeHjIUGD.jpg",
      "rate": "6.2",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T07:12:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_22",
      "title": "前浪第二季",
      "slug": "前浪第二季",
      "cover": "https://img.guangsuimage.com/cover/0bb7d661835fdc1d627d409025e18f67.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/0bb7d661835fdc1d627d409025e18f67.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第6集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T06:42:45.129Z"
    },
    {
      "entityId": "ik_radar_documentary_23",
      "tmdbId": "364136",
      "title": "最后一课",
      "slug": "最后一课",
      "cover": "https://image.tmdb.org/t/p/w500/3sbsRqquMe0P1rsUy88PvbsCnpF.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/fb9nmpOP7TfglTHh1GZcwjSkBLk.jpg",
      "rate": "6.5",
      "year": "2015",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T06:12:45.129Z"
    }
  ]
};
