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
  createdAt: string;
}

export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem[]> = {
  "all": [
    {
      "entityId": "ik_radar_all_1",
      "tmdbId": "56570",
      "title": "古战场传奇：吾血之亲第2季",
      "slug": "%E5%8F%A4%E6%88%98%E5%9C%BA%E4%BC%A0%E5%A5%87-%E5%90%BE%E8%A1%80%E4%B9%8B%E4%BA%B2%E7%AC%AC2%E5%AD%A3",
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
      "createdAt": "2026-09-19T13:51:36.716Z"
    },
    {
      "entityId": "ik_radar_all_2",
      "tmdbId": "1306055",
      "title": "数到三",
      "slug": "%E6%95%B0%E5%88%B0%E4%B8%89",
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
      "createdAt": "2026-09-19T13:21:36.716Z"
    },
    {
      "entityId": "ik_radar_all_3",
      "tmdbId": "318239",
      "title": "神秘的声音",
      "slug": "%E7%A5%9E%E7%A7%98%E7%9A%84%E5%A3%B0%E9%9F%B3",
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
      "createdAt": "2026-09-19T12:51:36.716Z"
    },
    {
      "entityId": "ik_radar_all_4",
      "tmdbId": "312585",
      "title": "乌鸦俱乐部",
      "slug": "%E4%B9%8C%E9%B8%A6%E4%BF%B1%E4%B9%90%E9%83%A8",
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
      "createdAt": "2026-09-19T12:21:36.716Z"
    },
    {
      "entityId": "ik_radar_all_5",
      "tmdbId": "1240889",
      "title": "瘴气营地的青春性事与死亡",
      "slug": "%E7%98%B4%E6%B0%94%E8%90%A5%E5%9C%B0%E7%9A%84%E9%9D%92%E6%98%A5%E6%80%A7%E4%BA%8B%E4%B8%8E%E6%AD%BB%E4%BA%A1",
      "cover": "https://image.tmdb.org/t/p/w500/t8JBX1h4yipba70tNmPaTV2tgbr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/d1n2ySWSanU34eEsluRjfrjRq52.jpg",
      "rate": "6.6",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T11:51:36.716Z"
    },
    {
      "entityId": "ik_radar_all_6",
      "tmdbId": "275102",
      "title": "挑情丑闻",
      "slug": "%E6%8C%91%E6%83%85%E4%B8%91%E9%97%BB",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_all_7",
      "tmdbId": "1641629",
      "title": "你我对抗全世界",
      "slug": "%E4%BD%A0%E6%88%91%E5%AF%B9%E6%8A%97%E5%85%A8%E4%B8%96%E7%95%8C",
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
      "createdAt": "2026-09-19T10:51:36.716Z"
    },
    {
      "entityId": "ik_radar_all_8",
      "tmdbId": "1514863",
      "title": "最佳舞伴",
      "slug": "%E6%9C%80%E4%BD%B3%E8%88%9E%E4%BC%B4",
      "cover": "https://image.tmdb.org/t/p/w500/Zm5i6MmXp5cfIT3LffiuAX1uZ6.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5m1j7Wibh3HnZq5QHm97v8dI3GH.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T10:21:36.716Z"
    },
    {
      "entityId": "ik_radar_all_9",
      "title": "梦想改造家2026",
      "slug": "%E6%A2%A6%E6%83%B3%E6%94%B9%E9%80%A0%E5%AE%B62026",
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
      "createdAt": "2026-09-19T09:51:36.716Z"
    },
    {
      "entityId": "ik_radar_all_10",
      "title": "幸福伽菜子的快乐杀手生活第2季",
      "slug": "%E5%B9%B8%E7%A6%8F%E4%BC%BD%E8%8F%9C%E5%AD%90%E7%9A%84%E5%BF%AB%E4%B9%90%E6%9D%80%E6%89%8B%E7%94%9F%E6%B4%BB%E7%AC%AC2%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "rate": "9.2",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第2集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T09:21:36.716Z"
    },
    {
      "entityId": "ik_radar_all_11",
      "title": "黑帮领地第2季",
      "slug": "%E9%BB%91%E5%B8%AE%E9%A2%86%E5%9C%B0%E7%AC%AC2%E5%AD%A3",
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
      "createdAt": "2026-09-19T08:51:36.716Z"
    },
    {
      "entityId": "ik_radar_all_12",
      "title": "万物既伟大又渺小第7季",
      "slug": "%E4%B8%87%E7%89%A9%E6%97%A2%E4%BC%9F%E5%A4%A7%E5%8F%88%E6%B8%BA%E5%B0%8F%E7%AC%AC7%E5%AD%A3",
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
      "createdAt": "2026-09-19T08:21:36.716Z"
    },
    {
      "entityId": "ik_radar_all_13",
      "tmdbId": "1541125",
      "title": "年会不能停！2",
      "slug": "%E5%B9%B4%E4%BC%9A%E4%B8%8D%E8%83%BD%E5%81%9C2",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_all_14",
      "tmdbId": "334754",
      "title": "荣耀的阶梯",
      "slug": "%E8%8D%A3%E8%80%80%E7%9A%84%E9%98%B6%E6%A2%AF",
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
      "createdAt": "2026-09-19T07:21:36.716Z"
    },
    {
      "entityId": "ik_radar_all_15",
      "tmdbId": "298008",
      "title": "假面美颜",
      "slug": "%E5%81%87%E9%9D%A2%E7%BE%8E%E9%A2%9C",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_all_16",
      "tmdbId": "1769717",
      "title": "M.I.S.S.I.O.N. 歌剧般的潜入搜查官",
      "slug": "mission-%E6%AD%8C%E5%89%A7%E8%88%AC%E7%9A%84%E6%BD%9C%E5%85%A5%E6%90%9C%E6%9F%A5%E5%AE%98",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_all_17",
      "tmdbId": "30981",
      "title": "怪物：丽兹·波顿的故事",
      "slug": "%E6%80%AA%E7%89%A9-%E4%B8%BD%E5%85%B9-%E6%B3%A2%E9%A1%BF%E7%9A%84%E6%95%85%E4%BA%8B",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_all_18",
      "tmdbId": "312663",
      "title": "黑白清道夫",
      "slug": "%E9%BB%91%E7%99%BD%E6%B8%85%E9%81%93%E5%A4%AB",
      "cover": "https://image.tmdb.org/t/p/w500/mZ0rPTMe9XfrWRUAeoJzr62cyIa.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iyHgIyMJ6Vd5w79dLeGOTOkqDS5.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全10集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_all_19",
      "tmdbId": "66732",
      "title": "怪奇物语：1985故事集第2季",
      "slug": "%E6%80%AA%E5%A5%87%E7%89%A9%E8%AF%AD-1985%E6%95%85%E4%BA%8B%E9%9B%86%E7%AC%AC2%E5%AD%A3",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_all_20",
      "tmdbId": "335218",
      "title": "妾本草芥",
      "slug": "%E5%A6%BE%E6%9C%AC%E8%8D%89%E8%8A%A5",
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
      "createdAt": "2026-09-19T04:21:36.716Z"
    },
    {
      "entityId": "ik_radar_all_21",
      "tmdbId": "294990",
      "title": "一瓯春",
      "slug": "%E4%B8%80%E7%93%AF%E6%98%A5",
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
      "createdAt": "2026-09-19T03:51:36.716Z"
    },
    {
      "entityId": "ik_radar_all_22",
      "title": "云画的月光10周年综艺特辑",
      "slug": "%E4%BA%91%E7%94%BB%E7%9A%84%E6%9C%88%E5%85%8910%E5%91%A8%E5%B9%B4%E7%BB%BC%E8%89%BA%E7%89%B9%E8%BE%91",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_all_23",
      "title": "劣探德克尔第2季",
      "slug": "%E5%8A%A3%E6%8E%A2%E5%BE%B7%E5%85%8B%E5%B0%94%E7%AC%AC2%E5%AD%A3",
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
      "createdAt": "2026-09-19T02:51:36.716Z"
    },
    {
      "entityId": "ik_radar_all_24",
      "title": "流人第6季",
      "slug": "%E6%B5%81%E4%BA%BA%E7%AC%AC6%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609161254105405070.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609161254105405070.gif",
      "rate": "9.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T02:21:36.716Z"
    }
  ],
  "movie": [
    {
      "entityId": "ik_radar_movie_1",
      "tmdbId": "1306055",
      "title": "数到三",
      "slug": "%E6%95%B0%E5%88%B0%E4%B8%89",
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
      "createdAt": "2026-09-19T13:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_2",
      "tmdbId": "1240889",
      "title": "瘴气营地的青春性事与死亡",
      "slug": "%E7%98%B4%E6%B0%94%E8%90%A5%E5%9C%B0%E7%9A%84%E9%9D%92%E6%98%A5%E6%80%A7%E4%BA%8B%E4%B8%8E%E6%AD%BB%E4%BA%A1",
      "cover": "https://image.tmdb.org/t/p/w500/t8JBX1h4yipba70tNmPaTV2tgbr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/d1n2ySWSanU34eEsluRjfrjRq52.jpg",
      "rate": "6.6",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:22:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_3",
      "tmdbId": "1641629",
      "title": "你我对抗全世界",
      "slug": "%E4%BD%A0%E6%88%91%E5%AF%B9%E6%8A%97%E5%85%A8%E4%B8%96%E7%95%8C",
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
      "createdAt": "2026-09-19T12:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_4",
      "tmdbId": "1514863",
      "title": "最佳舞伴",
      "slug": "%E6%9C%80%E4%BD%B3%E8%88%9E%E4%BC%B4",
      "cover": "https://image.tmdb.org/t/p/w500/Zm5i6MmXp5cfIT3LffiuAX1uZ6.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5m1j7Wibh3HnZq5QHm97v8dI3GH.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T12:22:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_5",
      "tmdbId": "1541125",
      "title": "年会不能停！2",
      "slug": "%E5%B9%B4%E4%BC%9A%E4%B8%8D%E8%83%BD%E5%81%9C2",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_movie_6",
      "tmdbId": "1769717",
      "title": "M.I.S.S.I.O.N. 歌剧般的潜入搜查官",
      "slug": "mission-%E6%AD%8C%E5%89%A7%E8%88%AC%E7%9A%84%E6%BD%9C%E5%85%A5%E6%90%9C%E6%9F%A5%E5%AE%98",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_movie_7",
      "tmdbId": "1469930",
      "title": "打生桩",
      "slug": "%E6%89%93%E7%94%9F%E6%A1%A9",
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
      "createdAt": "2026-09-19T10:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_8",
      "tmdbId": "1101383",
      "title": "逃出绝命街",
      "slug": "%E9%80%83%E5%87%BA%E7%BB%9D%E5%91%BD%E8%A1%97",
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
      "createdAt": "2026-09-19T10:22:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_9",
      "tmdbId": "1765955",
      "title": "蜂鸟行动",
      "slug": "%E8%9C%82%E9%B8%9F%E8%A1%8C%E5%8A%A8",
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
      "createdAt": "2026-09-19T09:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_10",
      "tmdbId": "1241918",
      "title": "出入平安",
      "slug": "%E5%87%BA%E5%85%A5%E5%B9%B3%E5%AE%89",
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
      "createdAt": "2026-09-19T09:22:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_11",
      "tmdbId": "1340102",
      "title": "狮拳",
      "slug": "%E7%8B%AE%E6%8B%B3",
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
      "createdAt": "2026-09-19T08:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_12",
      "title": "惩罚者2026",
      "slug": "%E6%83%A9%E7%BD%9A%E8%80%852026",
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
      "createdAt": "2026-09-19T08:22:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_13",
      "title": "美女捕吏女牢秘档续美女奉行2",
      "slug": "%E7%BE%8E%E5%A5%B3%E6%8D%95%E5%90%8F%E5%A5%B3%E7%89%A2%E7%A7%98%E6%A1%A3%E7%BB%AD%E7%BE%8E%E5%A5%B3%E5%A5%89%E8%A1%8C2",
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
      "createdAt": "2026-09-19T07:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_14",
      "tmdbId": "1377900",
      "title": "叛谍猎手",
      "slug": "%E5%8F%9B%E8%B0%8D%E7%8C%8E%E6%89%8B",
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
      "createdAt": "2026-09-19T07:22:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_15",
      "tmdbId": "1608445",
      "title": "无情的拳头",
      "slug": "%E6%97%A0%E6%83%85%E7%9A%84%E6%8B%B3%E5%A4%B4",
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
      "createdAt": "2026-09-19T06:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_16",
      "tmdbId": "1768954",
      "title": "热血部落",
      "slug": "%E7%83%AD%E8%A1%80%E9%83%A8%E8%90%BD",
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
      "createdAt": "2026-09-19T06:22:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_17",
      "tmdbId": "1764761",
      "title": "山竹刀",
      "slug": "%E5%B1%B1%E7%AB%B9%E5%88%80",
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
      "createdAt": "2026-09-19T05:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_18",
      "tmdbId": "1576549",
      "title": "异种污染",
      "slug": "%E5%BC%82%E7%A7%8D%E6%B1%A1%E6%9F%93",
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
      "createdAt": "2026-09-19T05:22:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_19",
      "title": "血路姐弟",
      "slug": "%E8%A1%80%E8%B7%AF%E5%A7%90%E5%BC%9F",
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
      "createdAt": "2026-09-19T04:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_20",
      "tmdbId": "1278971",
      "title": "神拳赌约",
      "slug": "%E7%A5%9E%E6%8B%B3%E8%B5%8C%E7%BA%A6",
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
      "createdAt": "2026-09-19T04:22:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_21",
      "title": "求救信号2026",
      "slug": "%E6%B1%82%E6%95%91%E4%BF%A1%E5%8F%B72026",
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
      "createdAt": "2026-09-19T03:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_22",
      "tmdbId": "1326891",
      "title": "乱世杀局",
      "slug": "%E4%B9%B1%E4%B8%96%E6%9D%80%E5%B1%80",
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
      "createdAt": "2026-09-19T03:22:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_23",
      "tmdbId": "1433583",
      "title": "监狱雄心",
      "slug": "%E7%9B%91%E7%8B%B1%E9%9B%84%E5%BF%83",
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
      "createdAt": "2026-09-19T02:52:02.912Z"
    },
    {
      "entityId": "ik_radar_movie_24",
      "title": "牺牲",
      "slug": "%E7%89%BA%E7%89%B2",
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
      "createdAt": "2026-09-19T02:22:02.912Z"
    }
  ],
  "tv": [
    {
      "entityId": "ik_radar_tv_1",
      "tmdbId": "56570",
      "title": "古战场传奇：吾血之亲第2季",
      "slug": "%E5%8F%A4%E6%88%98%E5%9C%BA%E4%BC%A0%E5%A5%87-%E5%90%BE%E8%A1%80%E4%B9%8B%E4%BA%B2%E7%AC%AC2%E5%AD%A3",
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
      "createdAt": "2026-09-19T13:52:29.123Z"
    },
    {
      "entityId": "ik_radar_tv_2",
      "tmdbId": "318239",
      "title": "神秘的声音",
      "slug": "%E7%A5%9E%E7%A7%98%E7%9A%84%E5%A3%B0%E9%9F%B3",
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
      "createdAt": "2026-09-19T13:22:29.123Z"
    },
    {
      "entityId": "ik_radar_tv_3",
      "tmdbId": "312585",
      "title": "乌鸦俱乐部",
      "slug": "%E4%B9%8C%E9%B8%A6%E4%BF%B1%E4%B9%90%E9%83%A8",
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
      "createdAt": "2026-09-19T12:52:29.123Z"
    },
    {
      "entityId": "ik_radar_tv_4",
      "tmdbId": "275102",
      "title": "挑情丑闻",
      "slug": "%E6%8C%91%E6%83%85%E4%B8%91%E9%97%BB",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_5",
      "title": "幸福伽菜子的快乐杀手生活第2季",
      "slug": "%E5%B9%B8%E7%A6%8F%E4%BC%BD%E8%8F%9C%E5%AD%90%E7%9A%84%E5%BF%AB%E4%B9%90%E6%9D%80%E6%89%8B%E7%94%9F%E6%B4%BB%E7%AC%AC2%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "rate": "9.2",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第2集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T11:52:29.123Z"
    },
    {
      "entityId": "ik_radar_tv_6",
      "title": "黑帮领地第2季",
      "slug": "%E9%BB%91%E5%B8%AE%E9%A2%86%E5%9C%B0%E7%AC%AC2%E5%AD%A3",
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
      "createdAt": "2026-09-19T11:22:29.123Z"
    },
    {
      "entityId": "ik_radar_tv_7",
      "title": "万物既伟大又渺小第7季",
      "slug": "%E4%B8%87%E7%89%A9%E6%97%A2%E4%BC%9F%E5%A4%A7%E5%8F%88%E6%B8%BA%E5%B0%8F%E7%AC%AC7%E5%AD%A3",
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
      "createdAt": "2026-09-19T10:52:29.123Z"
    },
    {
      "entityId": "ik_radar_tv_8",
      "tmdbId": "298008",
      "title": "假面美颜",
      "slug": "%E5%81%87%E9%9D%A2%E7%BE%8E%E9%A2%9C",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_9",
      "tmdbId": "30981",
      "title": "怪物：丽兹·波顿的故事",
      "slug": "%E6%80%AA%E7%89%A9-%E4%B8%BD%E5%85%B9-%E6%B3%A2%E9%A1%BF%E7%9A%84%E6%95%85%E4%BA%8B",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_10",
      "tmdbId": "312663",
      "title": "黑白清道夫",
      "slug": "%E9%BB%91%E7%99%BD%E6%B8%85%E9%81%93%E5%A4%AB",
      "cover": "https://image.tmdb.org/t/p/w500/mZ0rPTMe9XfrWRUAeoJzr62cyIa.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iyHgIyMJ6Vd5w79dLeGOTOkqDS5.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "全10集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_11",
      "tmdbId": "332507",
      "title": "末誓",
      "slug": "%E6%9C%AB%E8%AA%93",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_12",
      "tmdbId": "282326",
      "title": "兰香如故",
      "slug": "%E5%85%B0%E9%A6%99%E5%A6%82%E6%95%85",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_13",
      "tmdbId": "294486",
      "title": "交锋",
      "slug": "%E4%BA%A4%E9%94%8B",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_14",
      "tmdbId": "317308",
      "title": "请记住我的名字",
      "slug": "%E8%AF%B7%E8%AE%B0%E4%BD%8F%E6%88%91%E7%9A%84%E5%90%8D%E5%AD%97",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_15",
      "tmdbId": "290863",
      "title": "冬城猎凶",
      "slug": "%E5%86%AC%E5%9F%8E%E7%8C%8E%E5%87%B6",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_16",
      "tmdbId": "294990",
      "title": "一瓯春",
      "slug": "%E4%B8%80%E7%93%AF%E6%98%A5",
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
      "createdAt": "2026-09-19T06:22:29.123Z"
    },
    {
      "entityId": "ik_radar_tv_17",
      "title": "八仙伏魔录",
      "slug": "%E5%85%AB%E4%BB%99%E4%BC%8F%E9%AD%94%E5%BD%95",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_18",
      "tmdbId": "288873",
      "title": "云雀叫天录",
      "slug": "%E4%BA%91%E9%9B%80%E5%8F%AB%E5%A4%A9%E5%BD%95",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_19",
      "tmdbId": "334754",
      "title": "荣耀的阶梯",
      "slug": "%E8%8D%A3%E8%80%80%E7%9A%84%E9%98%B6%E6%A2%AF",
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
      "createdAt": "2026-09-19T04:52:29.123Z"
    },
    {
      "entityId": "ik_radar_tv_20",
      "tmdbId": "333517",
      "title": "车轮下的真相",
      "slug": "%E8%BD%A6%E8%BD%AE%E4%B8%8B%E7%9A%84%E7%9C%9F%E7%9B%B8",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_21",
      "tmdbId": "332014",
      "title": "熔城",
      "slug": "%E7%86%94%E5%9F%8E",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_22",
      "tmdbId": "303290",
      "title": "九品猎妖官",
      "slug": "%E4%B9%9D%E5%93%81%E7%8C%8E%E5%A6%96%E5%AE%98",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_23",
      "tmdbId": "335131",
      "title": "为爱正名",
      "slug": "%E4%B8%BA%E7%88%B1%E6%AD%A3%E5%90%8D",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_tv_24",
      "tmdbId": "334299",
      "title": "独剑九天",
      "slug": "%E7%8B%AC%E5%89%91%E4%B9%9D%E5%A4%A9",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    }
  ],
  "anime": [
    {
      "entityId": "ik_radar_anime_1",
      "tmdbId": "66732",
      "title": "怪奇物语：1985故事集第2季",
      "slug": "%E6%80%AA%E5%A5%87%E7%89%A9%E8%AF%AD-1985%E6%95%85%E4%BA%8B%E9%9B%86%E7%AC%AC2%E5%AD%A3",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_2",
      "tmdbId": "75787",
      "title": "狐妖小红娘黄风岭篇",
      "slug": "%E7%8B%90%E5%A6%96%E5%B0%8F%E7%BA%A2%E5%A8%98%E9%BB%84%E9%A3%8E%E5%B2%AD%E7%AF%87",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_3",
      "tmdbId": "314478",
      "title": "登登登邓氏三宝",
      "slug": "%E7%99%BB%E7%99%BB%E7%99%BB%E9%82%93%E6%B0%8F%E4%B8%89%E5%AE%9D",
      "cover": "https://image.tmdb.org/t/p/w500/cnh7OusbX48u7ctpGCws8HzRCo9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xcjvlbVkVvGodPdfv3c6NzknMIB.jpg",
      "rate": "7.2",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "全8集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_4",
      "tmdbId": "207468",
      "title": "怪兽8号 鸣海的日常",
      "slug": "%E6%80%AA%E5%85%BD8%E5%8F%B7-%E9%B8%A3%E6%B5%B7%E7%9A%84%E6%97%A5%E5%B8%B8",
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
      "createdAt": "2026-09-19T12:22:54.336Z"
    },
    {
      "entityId": "ik_radar_anime_5",
      "tmdbId": "297923",
      "title": "灵境行者",
      "slug": "%E7%81%B5%E5%A2%83%E8%A1%8C%E8%80%85",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_6",
      "title": "银魂吉原大炎上",
      "slug": "%E9%93%B6%E9%AD%82%E5%90%89%E5%8E%9F%E5%A4%A7%E7%82%8E%E4%B8%8A",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_7",
      "title": "诛仙4",
      "slug": "%E8%AF%9B%E4%BB%994",
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
      "createdAt": "2026-09-19T10:52:54.336Z"
    },
    {
      "entityId": "ik_radar_anime_8",
      "tmdbId": "330609",
      "title": "财神窦占龙",
      "slug": "%E8%B4%A2%E7%A5%9E%E7%AA%A6%E5%8D%A0%E9%BE%99",
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
      "createdAt": "2026-09-19T10:22:54.336Z"
    },
    {
      "entityId": "ik_radar_anime_9",
      "title": "时光代理人第3季",
      "slug": "%E6%97%B6%E5%85%89%E4%BB%A3%E7%90%86%E4%BA%BA%E7%AC%AC3%E5%AD%A3",
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
      "createdAt": "2026-09-19T09:52:54.336Z"
    },
    {
      "entityId": "ik_radar_anime_10",
      "tmdbId": "331159",
      "title": "谷雨街后巷",
      "slug": "%E8%B0%B7%E9%9B%A8%E8%A1%97%E5%90%8E%E5%B7%B7",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_11",
      "tmdbId": "79481",
      "title": "斗破苍穹 年番",
      "slug": "%E6%96%97%E7%A0%B4%E8%8B%8D%E7%A9%B9-%E5%B9%B4%E7%95%AA",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_12",
      "tmdbId": "272206",
      "title": "全球惊悚：我开启外挂自选商城 动态漫画",
      "slug": "%E5%85%A8%E7%90%83%E6%83%8A%E6%82%9A-%E6%88%91%E5%BC%80%E5%90%AF%E5%A4%96%E6%8C%82%E8%87%AA%E9%80%89%E5%95%86%E5%9F%8E-%E5%8A%A8%E6%80%81%E6%BC%AB%E7%94%BB",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_13",
      "title": "论苟道飞升的可能性",
      "slug": "%E8%AE%BA%E8%8B%9F%E9%81%93%E9%A3%9E%E5%8D%87%E7%9A%84%E5%8F%AF%E8%83%BD%E6%80%A7",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_14",
      "title": "禅王渡尘",
      "slug": "%E7%A6%85%E7%8E%8B%E6%B8%A1%E5%B0%98",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_15",
      "title": "魔道重生的女武神",
      "slug": "%E9%AD%94%E9%81%93%E9%87%8D%E7%94%9F%E7%9A%84%E5%A5%B3%E6%AD%A6%E7%A5%9E",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_16",
      "title": "红妆送君葬",
      "slug": "%E7%BA%A2%E5%A6%86%E9%80%81%E5%90%9B%E8%91%AC",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_17",
      "tmdbId": "281233",
      "title": "光阴之外",
      "slug": "%E5%85%89%E9%98%B4%E4%B9%8B%E5%A4%96",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_18",
      "tmdbId": "116042",
      "title": "如果历史是一群喵 大明皇朝篇",
      "slug": "%E5%A6%82%E6%9E%9C%E5%8E%86%E5%8F%B2%E6%98%AF%E4%B8%80%E7%BE%A4%E5%96%B5-%E5%A4%A7%E6%98%8E%E7%9A%87%E6%9C%9D%E7%AF%87",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_19",
      "tmdbId": "220850",
      "title": "炼气十万年",
      "slug": "%E7%82%BC%E6%B0%94%E5%8D%81%E4%B8%87%E5%B9%B4",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_20",
      "tmdbId": "122612",
      "title": "万界独尊",
      "slug": "%E4%B8%87%E7%95%8C%E7%8B%AC%E5%B0%8A",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_21",
      "title": "无良系统变向导，我被四个哨兵拿捏了",
      "slug": "%E6%97%A0%E8%89%AF%E7%B3%BB%E7%BB%9F%E5%8F%98%E5%90%91%E5%AF%BC%E6%88%91%E8%A2%AB%E5%9B%9B%E4%B8%AA%E5%93%A8%E5%85%B5%E6%8B%BF%E6%8D%8F%E4%BA%86",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_22",
      "title": "余烬之后",
      "slug": "%E4%BD%99%E7%83%AC%E4%B9%8B%E5%90%8E",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_23",
      "title": "仙界第一残魄，可她悟性超绝",
      "slug": "%E4%BB%99%E7%95%8C%E7%AC%AC%E4%B8%80%E6%AE%8B%E9%AD%84%E5%8F%AF%E5%A5%B9%E6%82%9F%E6%80%A7%E8%B6%85%E7%BB%9D",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_anime_24",
      "tmdbId": "106449",
      "title": "凡人修仙传",
      "slug": "%E5%87%A1%E4%BA%BA%E4%BF%AE%E4%BB%99%E4%BC%A0",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    }
  ],
  "variety": [
    {
      "entityId": "ik_radar_variety_1",
      "title": "梦想改造家2026",
      "slug": "%E6%A2%A6%E6%83%B3%E6%94%B9%E9%80%A0%E5%AE%B62026",
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
      "createdAt": "2026-09-19T13:53:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_2",
      "title": "云画的月光10周年综艺特辑",
      "slug": "%E4%BA%91%E7%94%BB%E7%9A%84%E6%9C%88%E5%85%8910%E5%91%A8%E5%B9%B4%E7%BB%BC%E8%89%BA%E7%89%B9%E8%BE%91",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_variety_3",
      "tmdbId": "334553",
      "title": "第六感: B side",
      "slug": "%E7%AC%AC%E5%85%AD%E6%84%9F-b-side",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_variety_4",
      "title": "打歌2026",
      "slug": "%E6%89%93%E6%AD%8C2026",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_variety_5",
      "title": "背后第2季",
      "slug": "%E8%83%8C%E5%90%8E%E7%AC%AC2%E5%AD%A3",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_variety_6",
      "title": "花儿与少年第8季",
      "slug": "%E8%8A%B1%E5%84%BF%E4%B8%8E%E5%B0%91%E5%B9%B4%E7%AC%AC8%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609041706270661205.jpg",
      "backdrop": "https://static.iyf.tv/upload/video/202609041706270661205.jpg",
      "rate": "8.1",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "第2期",
      "qualityBadge": "4K",
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_variety_7",
      "tmdbId": "302173",
      "title": "对我来说太刻薄的经纪人-秘书镇第2季",
      "slug": "%E5%AF%B9%E6%88%91%E6%9D%A5%E8%AF%B4%E5%A4%AA%E5%88%BB%E8%96%84%E7%9A%84%E7%BB%8F%E7%BA%AA%E4%BA%BA-%E7%A7%98%E4%B9%A6%E9%95%87%E7%AC%AC2%E5%AD%A3",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_variety_8",
      "title": "我家那闺女2026",
      "slug": "%E6%88%91%E5%AE%B6%E9%82%A3%E9%97%BA%E5%A5%B32026",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_variety_9",
      "tmdbId": "94773",
      "title": "舞蹈新风暴",
      "slug": "%E8%88%9E%E8%B9%88%E6%96%B0%E9%A3%8E%E6%9A%B4",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_variety_10",
      "title": "你好时光第2季",
      "slug": "%E4%BD%A0%E5%A5%BD%E6%97%B6%E5%85%89%E7%AC%AC2%E5%AD%A3",
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
      "createdAt": "2026-09-19T09:23:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_11",
      "tmdbId": "154770",
      "title": "你好，星期六 2022",
      "slug": "%E4%BD%A0%E5%A5%BD%E6%98%9F%E6%9C%9F%E5%85%AD-2022",
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
      "createdAt": "2026-09-19T08:53:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_12",
      "title": "种植前线2026",
      "slug": "%E7%A7%8D%E6%A4%8D%E5%89%8D%E7%BA%BF2026",
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
      "createdAt": "2026-09-19T08:23:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_13",
      "title": "一饭封神第二季",
      "slug": "%E4%B8%80%E9%A5%AD%E5%B0%81%E7%A5%9E%E7%AC%AC%E4%BA%8C%E5%AD%A3",
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
      "createdAt": "2026-09-19T07:53:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_14",
      "tmdbId": "1232909",
      "title": "打歌2026·X舞台",
      "slug": "%E6%89%93%E6%AD%8C2026-x%E8%88%9E%E5%8F%B0",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_variety_15",
      "tmdbId": "779206",
      "title": "背后2",
      "slug": "%E8%83%8C%E5%90%8E2",
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
      "createdAt": "2026-09-19T06:53:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_16",
      "tmdbId": "331587",
      "title": "伦敦合伙人",
      "slug": "%E4%BC%A6%E6%95%A6%E5%90%88%E4%BC%99%E4%BA%BA",
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
      "createdAt": "2026-09-19T06:23:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_17",
      "tmdbId": "330926",
      "title": "一路向海的少年",
      "slug": "%E4%B8%80%E8%B7%AF%E5%90%91%E6%B5%B7%E7%9A%84%E5%B0%91%E5%B9%B4",
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
      "createdAt": "2026-09-19T05:53:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_18",
      "title": "现在就出发第四季",
      "slug": "%E7%8E%B0%E5%9C%A8%E5%B0%B1%E5%87%BA%E5%8F%91%E7%AC%AC%E5%9B%9B%E5%AD%A3",
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
      "createdAt": "2026-09-19T05:23:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_19",
      "tmdbId": "296202",
      "title": "地球超新鲜 第二季",
      "slug": "%E5%9C%B0%E7%90%83%E8%B6%85%E6%96%B0%E9%B2%9C-%E7%AC%AC%E4%BA%8C%E5%AD%A3",
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
      "createdAt": "2026-09-19T13:54:08.489Z"
    },
    {
      "entityId": "ik_radar_variety_20",
      "title": "北京厂开玩",
      "slug": "%E5%8C%97%E4%BA%AC%E5%8E%82%E5%BC%80%E7%8E%A9",
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
      "createdAt": "2026-09-19T04:23:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_21",
      "tmdbId": "331649",
      "title": "大哥小助理",
      "slug": "%E5%A4%A7%E5%93%A5%E5%B0%8F%E5%8A%A9%E7%90%86",
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
      "createdAt": "2026-09-19T03:53:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_22",
      "tmdbId": "331569",
      "title": "不想睡的星期五",
      "slug": "%E4%B8%8D%E6%83%B3%E7%9D%A1%E7%9A%84%E6%98%9F%E6%9C%9F%E4%BA%94",
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
      "createdAt": "2026-09-19T03:23:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_23",
      "tmdbId": "330354",
      "title": "心动双重奏",
      "slug": "%E5%BF%83%E5%8A%A8%E5%8F%8C%E9%87%8D%E5%A5%8F",
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
      "createdAt": "2026-09-19T02:53:20.186Z"
    },
    {
      "entityId": "ik_radar_variety_24",
      "title": "小姐不熙娣2026",
      "slug": "%E5%B0%8F%E5%A7%90%E4%B8%8D%E7%86%99%E5%A8%A32026",
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
      "createdAt": "2026-09-19T02:23:20.186Z"
    }
  ],
  "documentary": [
    {
      "entityId": "ik_radar_documentary_1",
      "tmdbId": "329274",
      "title": "若泽·穆里尼奥：特立之道",
      "slug": "%E8%8B%A5%E6%B3%BD-%E7%A9%86%E9%87%8C%E5%B0%BC%E5%A5%A5-%E7%89%B9%E7%AB%8B%E4%B9%8B%E9%81%93",
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
      "createdAt": "2026-09-19T13:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_2",
      "tmdbId": "328735",
      "title": "爱达荷州血案：大学梦魇",
      "slug": "%E7%88%B1%E8%BE%BE%E8%8D%B7%E5%B7%9E%E8%A1%80%E6%A1%88-%E5%A4%A7%E5%AD%A6%E6%A2%A6%E9%AD%87",
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
      "createdAt": "2026-09-19T13:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_3",
      "title": "克拉克森的农场第5季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC5%E5%AD%A3",
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
      "createdAt": "2026-09-19T12:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_4",
      "tmdbId": "1641962",
      "title": "体坛秘史：棋逢敌手",
      "slug": "%E4%BD%93%E5%9D%9B%E7%A7%98%E5%8F%B2-%E6%A3%8B%E9%80%A2%E6%95%8C%E6%89%8B",
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
      "createdAt": "2026-09-19T12:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_5",
      "tmdbId": "1641965",
      "title": "体坛秘史：监狱拓荒者",
      "slug": "%E4%BD%93%E5%9D%9B%E7%A7%98%E5%8F%B2-%E7%9B%91%E7%8B%B1%E6%8B%93%E8%8D%92%E8%80%85",
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
      "createdAt": "2026-09-19T11:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_6",
      "tmdbId": "1641961",
      "title": "体坛秘史：拉玛·奥多姆的生死边缘",
      "slug": "%E4%BD%93%E5%9D%9B%E7%A7%98%E5%8F%B2-%E6%8B%89%E7%8E%9B-%E5%A5%A5%E5%A4%9A%E5%A7%86%E7%9A%84%E7%94%9F%E6%AD%BB%E8%BE%B9%E7%BC%98",
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
      "createdAt": "2026-09-19T11:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_7",
      "tmdbId": "1641966",
      "title": "体坛秘史：马术名将枪击案",
      "slug": "%E4%BD%93%E5%9D%9B%E7%A7%98%E5%8F%B2-%E9%A9%AC%E6%9C%AF%E5%90%8D%E5%B0%86%E6%9E%AA%E5%87%BB%E6%A1%88",
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
      "createdAt": "2026-09-19T10:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_8",
      "tmdbId": "1623125",
      "title": "大卫·艾登堡：大猩猩的故事",
      "slug": "%E5%A4%A7%E5%8D%AB-%E8%89%BE%E7%99%BB%E5%A0%A1-%E5%A4%A7%E7%8C%A9%E7%8C%A9%E7%9A%84%E6%95%85%E4%BA%8B",
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
      "createdAt": "2026-09-19T10:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_9",
      "title": "十三邀第九季",
      "slug": "%E5%8D%81%E4%B8%89%E9%82%80%E7%AC%AC%E4%B9%9D%E5%AD%A3",
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
      "createdAt": "2026-09-19T09:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_10",
      "title": "普法栏目剧2011年",
      "slug": "%E6%99%AE%E6%B3%95%E6%A0%8F%E7%9B%AE%E5%89%A72011%E5%B9%B4",
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
      "createdAt": "2026-09-19T09:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_11",
      "title": "柯南势在必行第三季",
      "slug": "%E6%9F%AF%E5%8D%97%E5%8A%BF%E5%9C%A8%E5%BF%85%E8%A1%8C%E7%AC%AC%E4%B8%89%E5%AD%A3",
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
      "createdAt": "2026-09-19T08:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_12",
      "tmdbId": "332910",
      "title": "一个致命故事",
      "slug": "%E4%B8%80%E4%B8%AA%E8%87%B4%E5%91%BD%E6%95%85%E4%BA%8B",
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
      "createdAt": "2026-09-19T08:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_13",
      "tmdbId": "1762506",
      "title": "兄弟连：薪火永续",
      "slug": "%E5%85%84%E5%BC%9F%E8%BF%9E-%E8%96%AA%E7%81%AB%E6%B0%B8%E7%BB%AD",
      "cover": "https://image.tmdb.org/t/p/w500/n29MsV1m2OCbDp6PLeHxziOVOLG.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mMLVXM8UOKSxVSxnXcmuBPMiHsC.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T07:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_14",
      "title": "天真一代第一季",
      "slug": "%E5%A4%A9%E7%9C%9F%E4%B8%80%E4%BB%A3%E7%AC%AC%E4%B8%80%E5%AD%A3",
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
      "createdAt": "2026-09-19T07:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_15",
      "tmdbId": "1739186",
      "title": "体坛秘史：文斯·扬的人生剖白",
      "slug": "%E4%BD%93%E5%9D%9B%E7%A7%98%E5%8F%B2-%E6%96%87%E6%96%AF-%E6%89%AC%E7%9A%84%E4%BA%BA%E7%94%9F%E5%89%96%E7%99%BD",
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
      "createdAt": "2026-09-19T06:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_16",
      "title": "爱了！中国式现代化",
      "slug": "%E7%88%B1%E4%BA%86%E4%B8%AD%E5%9B%BD%E5%BC%8F%E7%8E%B0%E4%BB%A3%E5%8C%96",
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
      "createdAt": "2026-09-19T06:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_17",
      "tmdbId": "1744876",
      "title": "菲托·帕兹：歌中的世界",
      "slug": "%E8%8F%B2%E6%89%98-%E5%B8%95%E5%85%B9-%E6%AD%8C%E4%B8%AD%E7%9A%84%E4%B8%96%E7%95%8C",
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
      "createdAt": "2026-09-19T05:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_18",
      "tmdbId": "311731",
      "title": "神兽猎局",
      "slug": "%E7%A5%9E%E5%85%BD%E7%8C%8E%E5%B1%80",
      "cover": "https://image.tmdb.org/t/p/w500/tZhx3eXEcaLnLJkITX85TsKCAod.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/gQUA5I6dOC17soO3BLagbztB6v2.jpg",
      "rate": "7.3",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第4集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-19T05:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_19",
      "tmdbId": "1739202",
      "title": "体坛秘史：霹雳舞博士雷切尔·冈恩",
      "slug": "%E4%BD%93%E5%9D%9B%E7%A7%98%E5%8F%B2-%E9%9C%B9%E9%9B%B3%E8%88%9E%E5%8D%9A%E5%A3%AB%E9%9B%B7%E5%88%87%E5%B0%94-%E5%86%88%E6%81%A9",
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
      "createdAt": "2026-09-19T04:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_20",
      "tmdbId": "1038727",
      "title": "失窃王国",
      "slug": "%E5%A4%B1%E7%AA%83%E7%8E%8B%E5%9B%BD",
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
      "createdAt": "2026-09-19T04:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_21",
      "tmdbId": "1752159",
      "title": "转折点：911世代",
      "slug": "%E8%BD%AC%E6%8A%98%E7%82%B9-911%E4%B8%96%E4%BB%A3",
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
      "createdAt": "2026-09-19T03:53:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_22",
      "title": "前浪第二季",
      "slug": "%E5%89%8D%E6%B5%AA%E7%AC%AC%E4%BA%8C%E5%AD%A3",
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
      "createdAt": "2026-09-19T03:23:45.086Z"
    },
    {
      "entityId": "ik_radar_documentary_23",
      "tmdbId": "364136",
      "title": "最后一课",
      "slug": "%E6%9C%80%E5%90%8E%E4%B8%80%E8%AF%BE",
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
      "createdAt": "2026-09-19T02:53:45.086Z"
    }
  ]
};
