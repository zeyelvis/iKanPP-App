/**
 * 全站全专区「最新上线」全球数字发行雷达预烘焙数据集
 * 由 scripts/sync-release-radar.mjs 每小时自动融合生成
 * 数据源：爱壹帆人工审核流 + 采集站真实入库流 + TMDB 全球数字发行/院线排期流
 * 物料规范：TMDB 4K 原版无水印海报与 4K 宽屏剧照
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
      "createdAt": "2026-09-18T22:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_2",
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
      "createdAt": "2026-09-18T21:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_3",
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
      "createdAt": "2026-09-18T21:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_4",
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
      "updateBadge": "08集全",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T20:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_5",
      "tmdbId": "1641629",
      "title": "你我对抗全世界",
      "slug": "%E4%BD%A0%E6%88%91%E5%AF%B9%E6%8A%97%E5%85%A8%E4%B8%96%E7%95%8C",
      "cover": "https://image.tmdb.org/t/p/w500/j801na4Sf6DrZPL5Ba1vUZo5OFN.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nkEhDomjmPHJSA4Tx8pxv0NlKEy.jpg",
      "rate": "5.3",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T20:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_6",
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
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T19:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_7",
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
      "createdAt": "2026-09-18T19:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_8",
      "title": "幸福伽菜子的快乐杀手生活第2季",
      "slug": "%E5%B9%B8%E7%A6%8F%E4%BC%BD%E8%8F%9C%E5%AD%90%E7%9A%84%E5%BF%AB%E4%B9%90%E6%9D%80%E6%89%8B%E7%94%9F%E6%B4%BB%E7%AC%AC2%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "rate": "8.7",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第2集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T18:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_9",
      "title": "黑帮领地第2季",
      "slug": "%E9%BB%91%E5%B8%AE%E9%A2%86%E5%9C%B0%E7%AC%AC2%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609181142254213861.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181142254213861.gif",
      "rate": "8.7",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T18:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_10",
      "title": "万物既伟大又渺小第7季",
      "slug": "%E4%B8%87%E7%89%A9%E6%97%A2%E4%BC%9F%E5%A4%A7%E5%8F%88%E6%B8%BA%E5%B0%8F%E7%AC%AC7%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609181133593333356.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181133593333356.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T17:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_11",
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
      "updateBadge": "正片",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T17:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_12",
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
      "updateBadge": "更新至第16集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T16:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_13",
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
      "updateBadge": "08集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T16:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_14",
      "tmdbId": "1769717",
      "title": "M.I.S.S.I.O.N. 歌剧般的潜入搜查官",
      "slug": "mission-%E6%AD%8C%E5%89%A7%E8%88%AC%E7%9A%84%E6%BD%9C%E5%85%A5%E6%90%9C%E6%9F%A5%E5%AE%98",
      "cover": "https://image.tmdb.org/t/p/w500/r7xJyiB1tinL6NlukwaurIHKMBD.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2bBakSsFpnu6W8IKg6B1RJuDNeU.jpg",
      "rate": "4.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T15:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_15",
      "title": "怪物：丽兹·波顿的故事",
      "slug": "%E6%80%AA%E7%89%A9-%E4%B8%BD%E5%85%B9-%E6%B3%A2%E9%A1%BF%E7%9A%84%E6%95%85%E4%BA%8B",
      "cover": "https://static.iyf.tv/upload/video/202609171342044218480.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609171342044218480.gif",
      "rate": "8.4",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "08集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T15:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_16",
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
      "updateBadge": "10集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T14:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_17",
      "title": "怪奇物语：1985故事集第2季",
      "slug": "%E6%80%AA%E5%A5%87%E7%89%A9%E8%AF%AD-1985%E6%95%85%E4%BA%8B%E9%9B%86%E7%AC%AC2%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609171158515862311.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609171158515862311.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "动漫"
      ],
      "updateBadge": "08集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T14:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_18",
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
      "updateBadge": "更新至第11集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T13:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_19",
      "tmdbId": "294990",
      "title": "一瓯春",
      "slug": "%E4%B8%80%E7%93%AF%E6%98%A5",
      "cover": "https://image.tmdb.org/t/p/w500/7KjVhRaarZ5L3CBirQEmt89ioiz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qLZQnTiQxkBOid9tVLWC1CmoOcu.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第8集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T13:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_20",
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
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T12:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_21",
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
      "createdAt": "2026-09-18T12:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_22",
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
      "createdAt": "2026-09-18T11:58:20.485Z"
    },
    {
      "entityId": "ik_radar_all_23",
      "tmdbId": "273207",
      "title": "侠女内莉",
      "slug": "%E4%BE%A0%E5%A5%B3%E5%86%85%E8%8E%89",
      "cover": "https://image.tmdb.org/t/p/w500/l5gxBGG8RVECttvH4lBn2YkNR13.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/uYOYLFQ4q7asuhdiKXCqGaeAQUH.jpg",
      "rate": "7.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "08集全",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T11:28:20.485Z"
    },
    {
      "entityId": "ik_radar_all_24",
      "tmdbId": "333517",
      "title": "车轮下的真相",
      "slug": "%E8%BD%A6%E8%BD%AE%E4%B8%8B%E7%9A%84%E7%9C%9F%E7%9B%B8",
      "cover": "https://image.tmdb.org/t/p/w500/4I3vjEm1Ahp34CbGwENDL9OIZ09.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/tPIM8UHqYMpFvEdNQ9qGq7zUqQE.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "短剧"
      ],
      "updateBadge": "更新至第16集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T10:58:20.485Z"
    }
  ],
  "movie": [
    {
      "entityId": "ik_radar_movie_1",
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
      "createdAt": "2026-09-18T22:28:30.781Z"
    },
    {
      "entityId": "ik_radar_movie_2",
      "tmdbId": "1641629",
      "title": "你我对抗全世界",
      "slug": "%E4%BD%A0%E6%88%91%E5%AF%B9%E6%8A%97%E5%85%A8%E4%B8%96%E7%95%8C",
      "cover": "https://image.tmdb.org/t/p/w500/j801na4Sf6DrZPL5Ba1vUZo5OFN.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nkEhDomjmPHJSA4Tx8pxv0NlKEy.jpg",
      "rate": "5.3",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T21:58:30.781Z"
    },
    {
      "entityId": "ik_radar_movie_3",
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
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T21:28:30.781Z"
    },
    {
      "entityId": "ik_radar_movie_4",
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
      "updateBadge": "正片",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T20:58:30.781Z"
    },
    {
      "entityId": "ik_radar_movie_5",
      "tmdbId": "1769717",
      "title": "M.I.S.S.I.O.N. 歌剧般的潜入搜查官",
      "slug": "mission-%E6%AD%8C%E5%89%A7%E8%88%AC%E7%9A%84%E6%BD%9C%E5%85%A5%E6%90%9C%E6%9F%A5%E5%AE%98",
      "cover": "https://image.tmdb.org/t/p/w500/r7xJyiB1tinL6NlukwaurIHKMBD.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2bBakSsFpnu6W8IKg6B1RJuDNeU.jpg",
      "rate": "4.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T20:28:30.781Z"
    },
    {
      "entityId": "ik_radar_movie_6",
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
      "createdAt": "2026-09-18T19:58:30.781Z"
    },
    {
      "entityId": "ik_radar_movie_7",
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
      "createdAt": "2026-09-18T19:28:30.781Z"
    },
    {
      "entityId": "ik_radar_movie_8",
      "tmdbId": "1765955",
      "title": "蜂鸟行动",
      "slug": "%E8%9C%82%E9%B8%9F%E8%A1%8C%E5%8A%A8",
      "cover": "https://image.tmdb.org/t/p/w500/oZXH2DonlPsDVPBTIy5gQxBZLcU.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/dqnS9n5yfMNPzJYyKyand2skUNY.jpg",
      "rate": "4.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T18:58:30.781Z"
    },
    {
      "entityId": "ik_radar_movie_9",
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
      "createdAt": "2026-09-18T18:28:30.781Z"
    },
    {
      "entityId": "ik_radar_movie_10",
      "tmdbId": "1365884",
      "title": "百分之十",
      "slug": "%E7%99%BE%E5%88%86%E4%B9%8B%E5%8D%81",
      "cover": "https://image.tmdb.org/t/p/w500/xfGeL7zbAL8R2DRl1Dpy5Ek3D5i.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4v8XgcmtUFVXUzGb7noltdjg2Ou.jpg",
      "rate": "6.5",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T17:58:30.781Z"
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
      "createdAt": "2026-09-18T17:28:30.781Z"
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
      "createdAt": "2026-09-18T16:58:30.781Z"
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
      "createdAt": "2026-09-18T16:28:30.781Z"
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
      "createdAt": "2026-09-18T15:58:30.781Z"
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
      "createdAt": "2026-09-18T15:28:30.781Z"
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
      "createdAt": "2026-09-18T14:58:30.781Z"
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
      "createdAt": "2026-09-18T14:28:30.781Z"
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
      "createdAt": "2026-09-18T13:58:30.781Z"
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
      "createdAt": "2026-09-18T13:28:30.781Z"
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
      "createdAt": "2026-09-18T12:58:30.781Z"
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
      "createdAt": "2026-09-18T12:28:30.781Z"
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
      "createdAt": "2026-09-18T11:58:30.781Z"
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
      "createdAt": "2026-09-18T11:28:30.781Z"
    },
    {
      "entityId": "ik_radar_movie_24",
      "tmdbId": "1306820",
      "title": "疯狂舞蹈办公室",
      "slug": "%E7%96%AF%E7%8B%82%E8%88%9E%E8%B9%88%E5%8A%9E%E5%85%AC%E5%AE%A4",
      "cover": "https://image.tmdb.org/t/p/w500/5tUNj2UXAwgZ9tYYPlaDzn4DjuU.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/hkKl1BIOuch4Tf8J5kl2rwxONCy.jpg",
      "rate": "5.7",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "电影"
      ],
      "updateBadge": "正片",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T10:58:30.781Z"
    }
  ],
  "tv": [
    {
      "entityId": "ik_radar_tv_1",
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
      "createdAt": "2026-09-18T22:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_2",
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
      "createdAt": "2026-09-18T21:58:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_3",
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
      "updateBadge": "08集全",
      "platformBadge": "全球热度",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T21:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_4",
      "title": "幸福伽菜子的快乐杀手生活第2季",
      "slug": "%E5%B9%B8%E7%A6%8F%E4%BC%BD%E8%8F%9C%E5%AD%90%E7%9A%84%E5%BF%AB%E4%B9%90%E6%9D%80%E6%89%8B%E7%94%9F%E6%B4%BB%E7%AC%AC2%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181151435135882.gif",
      "rate": "8.7",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第2集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T20:58:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_5",
      "title": "黑帮领地第2季",
      "slug": "%E9%BB%91%E5%B8%AE%E9%A2%86%E5%9C%B0%E7%AC%AC2%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609181142254213861.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181142254213861.gif",
      "rate": "8.7",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T20:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_6",
      "title": "万物既伟大又渺小第7季",
      "slug": "%E4%B8%87%E7%89%A9%E6%97%A2%E4%BC%9F%E5%A4%A7%E5%8F%88%E6%B8%BA%E5%B0%8F%E7%AC%AC7%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609181133593333356.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609181133593333356.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T19:58:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_7",
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
      "updateBadge": "08集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T19:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_8",
      "title": "怪物：丽兹·波顿的故事",
      "slug": "%E6%80%AA%E7%89%A9-%E4%B8%BD%E5%85%B9-%E6%B3%A2%E9%A1%BF%E7%9A%84%E6%95%85%E4%BA%8B",
      "cover": "https://static.iyf.tv/upload/video/202609171342044218480.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609171342044218480.gif",
      "rate": "8.4",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "08集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T18:58:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_9",
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
      "updateBadge": "10集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T18:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_10",
      "tmdbId": "294990",
      "title": "一瓯春",
      "slug": "%E4%B8%80%E7%93%AF%E6%98%A5",
      "cover": "https://image.tmdb.org/t/p/w500/7KjVhRaarZ5L3CBirQEmt89ioiz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qLZQnTiQxkBOid9tVLWC1CmoOcu.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "更新至第8集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T17:58:39.599Z"
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
      "updateBadge": "第10集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T17:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_12",
      "tmdbId": "286686",
      "title": "生逢其时",
      "slug": "%E7%94%9F%E9%80%A2%E5%85%B6%E6%97%B6",
      "cover": "https://image.tmdb.org/t/p/w500/q2ulZwiuO9Gg0bVziimr8CXHdpk.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/7HXIhc3aRr1v7KmOrCulszXf3YP.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第26集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T16:58:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_13",
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
      "updateBadge": "第18集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T16:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_14",
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
      "updateBadge": "第28集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T15:58:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_15",
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
      "updateBadge": "第27集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T15:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_16",
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
      "updateBadge": "第14集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T14:58:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_17",
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
      "updateBadge": "第12集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T14:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_18",
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
      "updateBadge": "第16集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T13:58:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_19",
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
      "updateBadge": "第16集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T13:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_20",
      "title": "阎魔的宠妃",
      "slug": "%E9%98%8E%E9%AD%94%E7%9A%84%E5%AE%A0%E5%A6%83",
      "cover": "https://img.guangsuimage.com/cover/86d2641cf8c4473a96c6bbbaaa245f75.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/86d2641cf8c4473a96c6bbbaaa245f75.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第24集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T12:58:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_21",
      "tmdbId": "334188",
      "title": "济公之降龙除妖",
      "slug": "%E6%B5%8E%E5%85%AC%E4%B9%8B%E9%99%8D%E9%BE%99%E9%99%A4%E5%A6%96",
      "cover": "https://image.tmdb.org/t/p/w500/3lhWnNt9d2jBeiYvk3QkTCvdzSY.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mEMbAU1i2P6Uaf8PI2DRpebbOmB.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第24集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T12:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_22",
      "tmdbId": "335218",
      "title": "妾本草芥",
      "slug": "%E5%A6%BE%E6%9C%AC%E8%8D%89%E8%8A%A5",
      "cover": "https://image.tmdb.org/t/p/w500/hABseMRLlM8tOSJTcyJku7VmxsZ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5tetx9UPg2uO9zwBXYecRoDJWRD.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第11集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T11:58:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_23",
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
      "updateBadge": "第24集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T11:28:39.599Z"
    },
    {
      "entityId": "ik_radar_tv_24",
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
      "updateBadge": "第12集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T10:58:39.599Z"
    }
  ],
  "anime": [
    {
      "entityId": "ik_radar_anime_1",
      "title": "怪奇物语：1985故事集第2季",
      "slug": "%E6%80%AA%E5%A5%87%E7%89%A9%E8%AF%AD-1985%E6%95%85%E4%BA%8B%E9%9B%86%E7%AC%AC2%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609171158515862311.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609171158515862311.gif",
      "rate": "6.0",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "08集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T22:28:46.515Z"
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
      "updateBadge": "更新至第6集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T21:58:46.515Z"
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
      "updateBadge": "08集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T21:28:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_4",
      "title": "怪兽8号 鸣海的日常",
      "slug": "%E6%80%AA%E5%85%BD8%E5%8F%B7-%E9%B8%A3%E6%B5%B7%E7%9A%84%E6%97%A5%E5%B8%B8",
      "cover": "https://static.iyf.tv/upload/video/202609051331573138133.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202609051331573138133.gif",
      "rate": "7.4",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "动漫"
      ],
      "updateBadge": "更新至第2集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T20:58:46.515Z"
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
      "updateBadge": "更新至第4集",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T20:28:46.515Z"
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
      "updateBadge": "1080P集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T19:58:46.515Z"
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
      "createdAt": "2026-09-18T19:28:46.515Z"
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
      "createdAt": "2026-09-18T18:58:46.515Z"
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
      "createdAt": "2026-09-18T18:28:46.515Z"
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
      "updateBadge": "05集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T17:58:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_11",
      "title": "请吃红小豆吧！第五季",
      "slug": "%E8%AF%B7%E5%90%83%E7%BA%A2%E5%B0%8F%E8%B1%86%E5%90%A7%E7%AC%AC%E4%BA%94%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/66b1f7d95cb1acb3a8ec728b274a2d7b.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/66b1f7d95cb1acb3a8ec728b274a2d7b.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第3集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T17:28:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_12",
      "tmdbId": "228429",
      "title": "斗罗大陆II绝世唐门",
      "slug": "%E6%96%97%E7%BD%97%E5%A4%A7%E9%99%86ii%E7%BB%9D%E4%B8%96%E5%94%90%E9%97%A8",
      "cover": "https://image.tmdb.org/t/p/w500/kVlTNqhSVRHudCRTjSJbBGmAZby.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/w2DBa4lRn97uvZkshoCX8XVvieZ.jpg",
      "rate": "7.9",
      "year": "2023",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第171集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T16:58:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_13",
      "tmdbId": "300553",
      "title": "开心锤锤世界",
      "slug": "%E5%BC%80%E5%BF%83%E9%94%A4%E9%94%A4%E4%B8%96%E7%95%8C",
      "cover": "https://image.tmdb.org/t/p/w500/ltOJHTZOMYxXYPO7IdF5CpfQhzE.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2fcHGGpVZuHx9ukKjJIznOxDXkh.jpg",
      "rate": "8.8",
      "year": "2025",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第72集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T16:28:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_14",
      "title": "逆天邪神 第二季",
      "slug": "%E9%80%86%E5%A4%A9%E9%82%AA%E7%A5%9E-%E7%AC%AC%E4%BA%8C%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/9d1cedfbd54ff2444c04f3730c562b75.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/9d1cedfbd54ff2444c04f3730c562b75.jpg",
      "rate": "6.8",
      "year": "2021",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第384集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T15:58:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_15",
      "title": "我在古代的六小时工作制",
      "slug": "%E6%88%91%E5%9C%A8%E5%8F%A4%E4%BB%A3%E7%9A%84%E5%85%AD%E5%B0%8F%E6%97%B6%E5%B7%A5%E4%BD%9C%E5%88%B6",
      "cover": "https://img.guangsuimage.com/cover/ffc843534b30fd4366722e308ea7f9fa.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/ffc843534b30fd4366722e308ea7f9fa.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第16集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T15:28:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_16",
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
      "updateBadge": "第184集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T14:58:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_17",
      "tmdbId": "331441",
      "title": "大千小镇",
      "slug": "%E5%A4%A7%E5%8D%83%E5%B0%8F%E9%95%87",
      "cover": "https://image.tmdb.org/t/p/w500/uUy84cJ6vVOoebTZ9z9MPRAc0Vv.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/uUy84cJ6vVOoebTZ9z9MPRAc0Vv.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第17集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T14:28:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_18",
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
      "updateBadge": "第163集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T13:58:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_19",
      "tmdbId": "251361",
      "title": "魔皇大管家",
      "slug": "%E9%AD%94%E7%9A%87%E5%A4%A7%E7%AE%A1%E5%AE%B6",
      "cover": "https://image.tmdb.org/t/p/w500/crfIGHFSs02YxeYOzejHNiTVQEm.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/fFvuDAo2hCIO2MmUPx0ZWPni7Ch.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第09集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T13:28:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_20",
      "tmdbId": "326844",
      "title": "百日成王",
      "slug": "%E7%99%BE%E6%97%A5%E6%88%90%E7%8E%8B",
      "cover": "https://image.tmdb.org/t/p/w500/pUQVZGKxODzRNTAD91DK4tu3qZS.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/sCiAP45k7IvngU9xXdLobauW17f.jpg",
      "rate": "6.7",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第25集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T12:58:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_21",
      "title": "全球御鬼，我的体内有亿只鬼动态漫画",
      "slug": "%E5%85%A8%E7%90%83%E5%BE%A1%E9%AC%BC%E6%88%91%E7%9A%84%E4%BD%93%E5%86%85%E6%9C%89%E4%BA%BF%E5%8F%AA%E9%AC%BC%E5%8A%A8%E6%80%81%E6%BC%AB%E7%94%BB",
      "cover": "https://img.guangsuimage.com/cover/dbd234daab8899daa26bbcd36f75c870.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/dbd234daab8899daa26bbcd36f75c870.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第85集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T12:28:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_22",
      "title": "全球惊悚：我开启外挂自选商城 动态漫画",
      "slug": "%E5%85%A8%E7%90%83%E6%83%8A%E6%82%9A-%E6%88%91%E5%BC%80%E5%90%AF%E5%A4%96%E6%8C%82%E8%87%AA%E9%80%89%E5%95%86%E5%9F%8E-%E5%8A%A8%E6%80%81%E6%BC%AB%E7%94%BB",
      "cover": "https://img.guangsuimage.com/cover/81404ff8a5080f88fa03b7637071b0a8.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/81404ff8a5080f88fa03b7637071b0a8.jpg",
      "rate": "8.8",
      "year": "2024",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第99集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T11:58:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_23",
      "title": "全民御兽：开局觉醒神话级天赋 动态漫画",
      "slug": "%E5%85%A8%E6%B0%91%E5%BE%A1%E5%85%BD-%E5%BC%80%E5%B1%80%E8%A7%89%E9%86%92%E7%A5%9E%E8%AF%9D%E7%BA%A7%E5%A4%A9%E8%B5%8B-%E5%8A%A8%E6%80%81%E6%BC%AB%E7%94%BB",
      "cover": "https://img.guangsuimage.com/cover/069da2c40b859bbefe9065072e6f7404.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/069da2c40b859bbefe9065072e6f7404.jpg",
      "rate": "8.8",
      "year": "2024",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第101集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T11:28:46.515Z"
    },
    {
      "entityId": "ik_radar_anime_24",
      "title": "全民转职：驭龙师是最弱职业 动态漫画",
      "slug": "%E5%85%A8%E6%B0%91%E8%BD%AC%E8%81%8C-%E9%A9%AD%E9%BE%99%E5%B8%88%E6%98%AF%E6%9C%80%E5%BC%B1%E8%81%8C%E4%B8%9A-%E5%8A%A8%E6%80%81%E6%BC%AB%E7%94%BB",
      "cover": "https://img.guangsuimage.com/cover/9c8a38769e8fe34ed6ef094eb357f7dc.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/9c8a38769e8fe34ed6ef094eb357f7dc.jpg",
      "rate": "8.8",
      "year": "2024",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第100集已完结",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T10:58:46.515Z"
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
      "createdAt": "2026-09-18T22:28:58.126Z"
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
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T21:58:58.126Z"
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
      "updateBadge": "更新至第1集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T21:28:58.126Z"
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
      "updateBadge": "第2期纯享",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T20:58:58.126Z"
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
      "updateBadge": "20260912(长播客",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T20:28:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_6",
      "title": "花儿与少年第8季",
      "slug": "%E8%8A%B1%E5%84%BF%E4%B8%8E%E5%B0%91%E5%B9%B4%E7%AC%AC8%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202609041706270661205.jpg",
      "backdrop": "https://static.iyf.tv/upload/video/202609041706270661205.jpg",
      "rate": "8.2",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "20260918(正片加",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T19:58:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_7",
      "title": "对我来说太刻薄的经纪人-秘书镇第2季",
      "slug": "%E5%AF%B9%E6%88%91%E6%9D%A5%E8%AF%B4%E5%A4%AA%E5%88%BB%E8%96%84%E7%9A%84%E7%BB%8F%E7%BA%AA%E4%BA%BA-%E7%A7%98%E4%B9%A6%E9%95%87%E7%AC%AC2%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202608311609560923756.jpg",
      "backdrop": "https://static.iyf.tv/upload/video/202608311609560923756.jpg",
      "rate": "9.3",
      "year": "2025",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "更新至第3集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T19:28:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_8",
      "title": "我家那闺女2026",
      "slug": "%E6%88%91%E5%AE%B6%E9%82%A3%E9%97%BA%E5%A5%B32026",
      "cover": "https://static.iyf.tv/upload/video/202608271524382431872.jpg",
      "backdrop": "https://static.iyf.tv/upload/video/202608271524382431872.jpg",
      "rate": "8.1",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "综艺"
      ],
      "updateBadge": "20260917(盲盒放",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T18:58:58.126Z"
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
      "updateBadge": "20260916(Plu",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T18:28:58.126Z"
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
      "updateBadge": "第3期",
      "qualityBadge": "4K",
      "createdAt": "2026-09-18T17:58:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_11",
      "title": "梦想改造家第13季",
      "slug": "%E6%A2%A6%E6%83%B3%E6%94%B9%E9%80%A0%E5%AE%B6%E7%AC%AC13%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/7464328a7e964400a71614ddaa3c39fc.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/7464328a7e964400a71614ddaa3c39fc.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第260918期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T17:28:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_12",
      "title": "一站到底少年季第二季",
      "slug": "%E4%B8%80%E7%AB%99%E5%88%B0%E5%BA%95%E5%B0%91%E5%B9%B4%E5%AD%A3%E7%AC%AC%E4%BA%8C%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/9eae1d7b8e91d0b9e88f7a38faa3ad9c.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/9eae1d7b8e91d0b9e88f7a38faa3ad9c.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第7期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T16:58:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_13",
      "tmdbId": "326694",
      "title": "说唱巅峰对决2026",
      "slug": "%E8%AF%B4%E5%94%B1%E5%B7%85%E5%B3%B0%E5%AF%B9%E5%86%B32026",
      "cover": "https://image.tmdb.org/t/p/w500/sfZawhbu32LxTJAzYfgFObfXl0i.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lUIY59PL7uEdOLPIxP2GOv6gwSn.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "总决赛纯享",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T16:28:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_14",
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
      "updateBadge": "第6期下",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T15:58:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_15",
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
      "createdAt": "2026-09-18T15:28:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_16",
      "title": "花儿与少年2026",
      "slug": "%E8%8A%B1%E5%84%BF%E4%B8%8E%E5%B0%91%E5%B9%B42026",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第2期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T14:58:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_17",
      "title": "你好，星期六 2022",
      "slug": "%E4%BD%A0%E5%A5%BD%E6%98%9F%E6%9C%9F%E5%85%AD-2022",
      "cover": "https://img.guangsuimage.com/cover/f9cb3124b5a22b133f21273ef2cb0695.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/f9cb3124b5a22b133f21273ef2cb0695.jpg",
      "rate": "6.8",
      "year": "2022",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第20260918期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T14:28:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_18",
      "title": "超棒的我们 第二季",
      "slug": "%E8%B6%85%E6%A3%92%E7%9A%84%E6%88%91%E4%BB%AC-%E7%AC%AC%E4%BA%8C%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/be7e14e5fdde96bbee86960a5a007e4b.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/be7e14e5fdde96bbee86960a5a007e4b.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第8期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T13:58:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_19",
      "title": "密室大逃脱第八季",
      "slug": "%E5%AF%86%E5%AE%A4%E5%A4%A7%E9%80%83%E8%84%B1%E7%AC%AC%E5%85%AB%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/4bd8575441a219bc600c27999928e8ed.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/4bd8575441a219bc600c27999928e8ed.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第9期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T13:28:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_20",
      "title": "KuKu聊",
      "slug": "kuku%E8%81%8A",
      "cover": "https://img.guangsuimage.com/cover/8781854915bdfb582337a784eb6aa33b.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/8781854915bdfb582337a784eb6aa33b.jpg",
      "rate": "8.8",
      "year": "2025",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第20260917期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T12:58:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_21",
      "title": "一个县城女人有啥了不起",
      "slug": "%E4%B8%80%E4%B8%AA%E5%8E%BF%E5%9F%8E%E5%A5%B3%E4%BA%BA%E6%9C%89%E5%95%A5%E4%BA%86%E4%B8%8D%E8%B5%B7",
      "cover": "https://img.guangsuimage.com/cover/a6da3ece4ed601af58eeac1e1491db5e.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/a6da3ece4ed601af58eeac1e1491db5e.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第1期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T12:28:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_22",
      "title": "爱情保卫战2026",
      "slug": "%E7%88%B1%E6%83%85%E4%BF%9D%E5%8D%AB%E6%88%982026",
      "cover": "https://img.guangsuimage.com/cover/11db11b458eead530c21328893921156.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/11db11b458eead530c21328893921156.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第20260917期",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T11:58:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_23",
      "title": "心动的信号第9季",
      "slug": "%E5%BF%83%E5%8A%A8%E7%9A%84%E4%BF%A1%E5%8F%B7%E7%AC%AC9%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第7期加更下",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T11:28:58.126Z"
    },
    {
      "entityId": "ik_radar_variety_24",
      "title": "脱口秀和Ta的朋友们 第三季",
      "slug": "%E8%84%B1%E5%8F%A3%E7%A7%80%E5%92%8Cta%E7%9A%84%E6%9C%8B%E5%8F%8B%E4%BB%AC-%E7%AC%AC%E4%B8%89%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/a5a145919123f9541e89868ab2796244.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/a5a145919123f9541e89868ab2796244.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "电视剧"
      ],
      "updateBadge": "第9期离场之后",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T10:58:58.126Z"
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
      "createdAt": "2026-09-18T22:29:09.026Z"
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
      "createdAt": "2026-09-18T21:59:09.026Z"
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
      "createdAt": "2026-09-18T21:29:09.026Z"
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
      "createdAt": "2026-09-18T20:59:09.026Z"
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
      "createdAt": "2026-09-18T20:29:09.026Z"
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
      "createdAt": "2026-09-18T19:59:09.026Z"
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
      "createdAt": "2026-09-18T19:29:09.026Z"
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
      "createdAt": "2026-09-18T18:59:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_9",
      "tmdbId": "1492341",
      "title": "乐想越多：民谣才子诺亚·卡汉",
      "slug": "%E4%B9%90%E6%83%B3%E8%B6%8A%E5%A4%9A-%E6%B0%91%E8%B0%A3%E6%89%8D%E5%AD%90%E8%AF%BA%E4%BA%9A-%E5%8D%A1%E6%B1%89",
      "cover": "https://image.tmdb.org/t/p/w500/8VtZAonOgK8hae7FwOZCSg7XmCu.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qgQPajFB3gt58dwJX9A13P3rJIQ.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T18:29:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_10",
      "tmdbId": "316544",
      "title": "罗纳尔迪尼奥：独步球坛",
      "slug": "%E7%BD%97%E7%BA%B3%E5%B0%94%E8%BF%AA%E5%B0%BC%E5%A5%A5-%E7%8B%AC%E6%AD%A5%E7%90%83%E5%9D%9B",
      "cover": "https://image.tmdb.org/t/p/w500/zYdSaQLM8w3NMuBnjRPjqpiUnyp.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/eBna9nTSwL89wsR3fmA5AVDxzxR.jpg",
      "rate": "7.5",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "03集全",
      "platformBadge": "Netflix",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T17:59:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_11",
      "tmdbId": "1636918",
      "title": "排出毒素：微塑料威胁自救指南",
      "slug": "%E6%8E%92%E5%87%BA%E6%AF%92%E7%B4%A0-%E5%BE%AE%E5%A1%91%E6%96%99%E5%A8%81%E8%83%81%E8%87%AA%E6%95%91%E6%8C%87%E5%8D%97",
      "cover": "https://image.tmdb.org/t/p/w500/p1zoPaL2RpI95QGmyCI6kIdvdGY.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/q3VkiqQi7syrVANAK8PjgIry0Vx.jpg",
      "rate": "6.9",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T17:29:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_12",
      "tmdbId": "315159",
      "title": "权力王朝：默多克家族",
      "slug": "%E6%9D%83%E5%8A%9B%E7%8E%8B%E6%9C%9D-%E9%BB%98%E5%A4%9A%E5%85%8B%E5%AE%B6%E6%97%8F",
      "cover": "https://image.tmdb.org/t/p/w500/bPxb52QjQiUSwSlSKExOuHh9QC8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/drWappLrpSgPuQ3wcY9LbvIwgH7.jpg",
      "rate": "7.9",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "04集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T16:59:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_13",
      "tmdbId": "1633264",
      "title": "路易斯·泰鲁：解构男性圈",
      "slug": "%E8%B7%AF%E6%98%93%E6%96%AF-%E6%B3%B0%E9%B2%81-%E8%A7%A3%E6%9E%84%E7%94%B7%E6%80%A7%E5%9C%88",
      "cover": "https://image.tmdb.org/t/p/w500/yeHm0aIsAMFt0E8b12KhJ70wQKF.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cmpiLnDIdxQNFZLZZFRj1rSo7fW.jpg",
      "rate": "6.6",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T16:29:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_14",
      "tmdbId": "313338",
      "title": "TikTok杀手：蛛丝网迹",
      "slug": "tiktok%E6%9D%80%E6%89%8B-%E8%9B%9B%E4%B8%9D%E7%BD%91%E8%BF%B9",
      "cover": "https://image.tmdb.org/t/p/w500/95dPENf5ub7l0xK8lp6saTv8PVQ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qTbaaF0zthCuFxFPowr7XdnJl5r.jpg",
      "rate": "5.8",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "02集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T15:59:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_15",
      "tmdbId": "313298",
      "title": "恐龙时代：你不知道的故事",
      "slug": "%E6%81%90%E9%BE%99%E6%97%B6%E4%BB%A3-%E4%BD%A0%E4%B8%8D%E7%9F%A5%E9%81%93%E7%9A%84%E6%95%85%E4%BA%8B",
      "cover": "https://image.tmdb.org/t/p/w500/2PqiAWN4VEFZ6yYeUVxP202opTr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8X2R9uLys3SmkRuQAmSI96xxJAF.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "04集全",
      "platformBadge": "Netflix",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T15:29:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_16",
      "title": "一级方程式：疾速争胜第8季",
      "slug": "%E4%B8%80%E7%BA%A7%E6%96%B9%E7%A8%8B%E5%BC%8F-%E7%96%BE%E9%80%9F%E4%BA%89%E8%83%9C%E7%AC%AC8%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202602281852315261375.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202602281852315261375.gif",
      "rate": "10.0",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "08集全",
      "platformBadge": "Netflix",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T14:59:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_17",
      "title": "守护解放西第6季",
      "slug": "%E5%AE%88%E6%8A%A4%E8%A7%A3%E6%94%BE%E8%A5%BF%E7%AC%AC6%E5%AD%A3",
      "cover": "https://static.iyf.tv/upload/video/202510092004480401430.gif",
      "backdrop": "https://static.iyf.tv/upload/video/202510092004480401430.gif",
      "rate": "9.4",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "更新至第10集",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T14:29:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_18",
      "tmdbId": "290682",
      "title": "以幸存者之名：深入韩国惨案",
      "slug": "%E4%BB%A5%E5%B9%B8%E5%AD%98%E8%80%85%E4%B9%8B%E5%90%8D-%E6%B7%B1%E5%85%A5%E9%9F%A9%E5%9B%BD%E6%83%A8%E6%A1%88",
      "cover": "https://image.tmdb.org/t/p/w500/qNOW4MsrK9aCSCJIbuMRqc5NrNv.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/97yy7CgS8poPk9OsvtHQZieymMB.jpg",
      "rate": "8.2",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "08集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T13:59:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_19",
      "tmdbId": "293130",
      "title": "死无止境：阿根廷贵妇命案",
      "slug": "%E6%AD%BB%E6%97%A0%E6%AD%A2%E5%A2%83-%E9%98%BF%E6%A0%B9%E5%BB%B7%E8%B4%B5%E5%A6%87%E5%91%BD%E6%A1%88",
      "cover": "https://image.tmdb.org/t/p/w500/y0Gsck86XHPguPwuZ2P4nZQOvnY.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/gyOlQ01A0CoSF8a5WTdBW6dMpCc.jpg",
      "rate": "7.1",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "03集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T13:29:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_20",
      "tmdbId": "1193865",
      "title": "王者如我：新奥尔良狂欢节上的祖鲁游行",
      "slug": "%E7%8E%8B%E8%80%85%E5%A6%82%E6%88%91-%E6%96%B0%E5%A5%A5%E5%B0%94%E8%89%AF%E7%8B%82%E6%AC%A2%E8%8A%82%E4%B8%8A%E7%9A%84%E7%A5%96%E9%B2%81%E6%B8%B8%E8%A1%8C",
      "cover": "https://image.tmdb.org/t/p/w500/dr9ouxc6vP7oF6loXKc9dISuezQ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9KAMqN5jkRnhSenUNbuxOz3kC1b.jpg",
      "rate": "10.0",
      "year": "2024",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T12:59:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_21",
      "tmdbId": "291583",
      "title": "空运可卡因：高空三万尺走私奇案",
      "slug": "%E7%A9%BA%E8%BF%90%E5%8F%AF%E5%8D%A1%E5%9B%A0-%E9%AB%98%E7%A9%BA%E4%B8%89%E4%B8%87%E5%B0%BA%E8%B5%B0%E7%A7%81%E5%A5%87%E6%A1%88",
      "cover": "https://image.tmdb.org/t/p/w500/tDCSuV8ORa689D1SKp9EywT0JKW.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ceuc2V5QdHJL2Pte6xJ5cYzHElY.jpg",
      "rate": "7.5",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "03集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T12:29:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_22",
      "tmdbId": "1477453",
      "title": "全面失控：得州音乐节悲剧",
      "slug": "%E5%85%A8%E9%9D%A2%E5%A4%B1%E6%8E%A7-%E5%BE%97%E5%B7%9E%E9%9F%B3%E4%B9%90%E8%8A%82%E6%82%B2%E5%89%A7",
      "cover": "https://image.tmdb.org/t/p/w500/uX68nakCMjIXPxUi1zPRkvMIDVC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/dpfVOZygSFYNRrIq7PZOuUH67qy.jpg",
      "rate": "6.6",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T11:59:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_23",
      "tmdbId": "1484255",
      "title": "全面失控：恶搞市长",
      "slug": "%E5%85%A8%E9%9D%A2%E5%A4%B1%E6%8E%A7-%E6%81%B6%E6%90%9E%E5%B8%82%E9%95%BF",
      "cover": "https://image.tmdb.org/t/p/w500/wcy6MyKenxvWhxQCkVKdmHCJc9W.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nx3Wv4MWtg1FUN4AXw4GYD2GhHV.jpg",
      "rate": "6.6",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "01集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T11:29:09.026Z"
    },
    {
      "entityId": "ik_radar_documentary_24",
      "tmdbId": "289123",
      "title": "威斯特夫妇：英国恐怖故事",
      "slug": "%E5%A8%81%E6%96%AF%E7%89%B9%E5%A4%AB%E5%A6%87-%E8%8B%B1%E5%9B%BD%E6%81%90%E6%80%96%E6%95%85%E4%BA%8B",
      "cover": "https://image.tmdb.org/t/p/w500/llMCYi8IEvBrvhbVmXaFJWe4CGw.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/kXf0oLGrdKiAhoRJaABAAJiD5hy.jpg",
      "rate": "6.9",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "纪录片"
      ],
      "updateBadge": "03集全",
      "qualityBadge": "1080P",
      "createdAt": "2026-09-18T10:59:09.026Z"
    }
  ]
};
