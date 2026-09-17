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
      "entityId": "ik_latest_all_1",
      "tmdbId": "282326",
      "title": "兰香如故",
      "slug": "%E5%85%B0%E9%A6%99%E5%A6%82%E6%95%85",
      "cover": "https://image.tmdb.org/t/p/w500/kfurXRMH1ZkUoyT5HN72zLTQxzZ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mZSewqVlY4F2F2Axm7hiG6KBOBp.jpg",
      "rate": "6.7",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "古装",
        "剧集"
      ],
      "updateBadge": "更新至第14集",
      "createdAt": "2026-09-16T12:51:00.000Z"
    },
    {
      "entityId": "ik_latest_all_2",
      "tmdbId": "299952",
      "title": "早春晴朗",
      "slug": "%E6%97%A9%E6%98%A5%E6%99%B4%E6%9C%97",
      "cover": "https://image.tmdb.org/t/p/w500/nLWFbYv1r99Yy7dWvjoxMRegoe0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oUFUvEMCBP80e4eYsfVfxC8n7ih.jpg",
      "rate": "8.4",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_3",
      "tmdbId": "294486",
      "title": "交锋",
      "slug": "%E4%BA%A4%E9%94%8B",
      "cover": "https://image.tmdb.org/t/p/w500/gRe5FZjMWw8xXzWk1hxWuNQckOg.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lYDwHYOR8PROQfSJGZ8LqvwUVcW.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "悬疑",
        "剧集"
      ],
      "updateBadge": "更新至第24集",
      "createdAt": "2026-09-16T12:49:00.000Z"
    },
    {
      "entityId": "ik_latest_all_4",
      "tmdbId": "290863",
      "title": "冬城猎凶",
      "slug": "%E5%86%AC%E5%9F%8E%E7%8C%8E%E5%87%B6",
      "cover": "https://image.tmdb.org/t/p/w500/64NVbdSuNgrK90wqhtnlR2S4sPK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/28u4q3fPzXmbyf3BoiWweUOuuzj.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "罪案",
        "剧集"
      ],
      "updateBadge": "更新至第12集",
      "createdAt": "2026-09-16T12:12:00.000Z"
    },
    {
      "entityId": "ik_latest_all_5",
      "tmdbId": "286686",
      "title": "生逢其时",
      "slug": "%E7%94%9F%E9%80%A2%E5%85%B6%E6%97%B6",
      "cover": "https://image.tmdb.org/t/p/w500/q2ulZwiuO9Gg0bVziimr8CXHdpk.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/7HXIhc3aRr1v7KmOrCulszXf3YP.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第19集",
      "createdAt": "2026-09-16T14:10:00.000Z"
    },
    {
      "entityId": "ik_latest_all_6",
      "tmdbId": "331912",
      "title": "死有对证",
      "slug": "%E6%AD%BB%E6%9C%89%E5%AF%B9%E8%AF%81",
      "cover": "https://image.tmdb.org/t/p/w500/86j3acQApCYjDruQ6riVVcJ9Y4m.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zjdyowR7sH4upiKoAnTiAhg55Iy.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第08集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_7",
      "tmdbId": "286988",
      "title": "飞到我心上",
      "slug": "%E9%A3%9E%E5%88%B0%E6%88%91%E5%BF%83%E4%B8%8A",
      "cover": "https://image.tmdb.org/t/p/w500/vnaO6MJVrGUb0DBqFpUy3K1j0KC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/aYtWVJ5mUkPRFghrCHbc3I2v4WE.jpg",
      "rate": "7.9",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_8",
      "tmdbId": "301489",
      "title": "深渊无间",
      "slug": "%E6%B7%B1%E6%B8%8A%E6%97%A0%E9%97%B4",
      "cover": "https://image.tmdb.org/t/p/w500/b9ngtGNgaHBbLihRrT0MsPRY0GW.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/s9YSQAJtXjimsjBVsqLtJNnIjEs.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "悬疑",
        "剧集"
      ],
      "updateBadge": "全16集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_9",
      "title": "一饭封神第2季",
      "slug": "%E4%B8%80%E9%A5%AD%E5%B0%81%E7%A5%9E%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "第8期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_10",
      "title": "心动的信号第9季",
      "slug": "%E5%BF%83%E5%8A%A8%E7%9A%84%E4%BF%A1%E5%8F%B7%E7%AC%AC9%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "260916超前彩蛋",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_11",
      "tmdbId": "287496",
      "title": "花开锦绣",
      "slug": "%E8%8A%B1%E5%BC%80%E9%94%A6%E7%BB%A3",
      "cover": "https://image.tmdb.org/t/p/w500/erj7cX8aa1jndO9HlmoyRcJNLQL.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zyAFGC97834c2Ld4xPY02uacdQk.jpg",
      "rate": "7.1",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "古装",
        "剧集"
      ],
      "updateBadge": "全36集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_12",
      "tmdbId": "223911",
      "title": "仙逆",
      "slug": "%E4%BB%99%E9%80%86",
      "cover": "https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/crn53sSGWRZ8wAtEGso52nepEkz.jpg",
      "rate": "8.3",
      "year": "2023",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第158集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_13",
      "title": "花儿与少年第8季",
      "slug": "%E8%8A%B1%E5%84%BF%E4%B8%8E%E5%B0%91%E5%B9%B4%E7%AC%AC8%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "rate": "8.3",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "第6期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_14",
      "title": "披荆斩棘2026",
      "slug": "%E6%8A%AB%E8%8D%86%E6%96%A9%E6%A3%982026",
      "cover": "https://img.guangsuimage.com/cover/2eea2ab420e3cde52f34fd7cc5d341ee.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/2eea2ab420e3cde52f34fd7cc5d341ee.jpg",
      "rate": "8.5",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "三公小考",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_15",
      "tmdbId": "286506",
      "title": "百花杀",
      "slug": "%E7%99%BE%E8%8A%B1%E6%9D%80",
      "cover": "https://image.tmdb.org/t/p/w500/sWdiop8BQwODB6tVOMeTfi0XHE3.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oSUWFmPPQkEFUDhLWPJcNumIWll.jpg",
      "rate": "8.9",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "更新至第75集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_16",
      "tmdbId": "1391021",
      "title": "欢迎来龙餐馆",
      "slug": "%E6%AC%A2%E8%BF%8E%E6%9D%A5%E9%BE%99%E9%A4%90%E9%A6%86",
      "cover": "https://image.tmdb.org/t/p/w500/2OJX7udqqpk5c82pXXdL2hnny0D.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zr7om0GOLOcLo7SXMmNEG5rz6de.jpg",
      "rate": "9.1",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "正片",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_17",
      "tmdbId": "106449",
      "title": "凡人修仙传",
      "slug": "%E5%87%A1%E4%BA%BA%E4%BF%AE%E4%BB%99%E4%BC%A0",
      "cover": "https://image.tmdb.org/t/p/w500/u1VRjvvCIVwb1MUhoxSAUimhoKZ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8NIvQY34tNPc4txNeym2zEYk9ek.jpg",
      "rate": "8.4",
      "year": "2020",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第191集",
      "createdAt": "2026-09-12T05:13:00.000Z"
    },
    {
      "entityId": "ik_latest_all_18",
      "tmdbId": "294095",
      "title": "杀手妈咪",
      "slug": "%E6%9D%80%E6%89%8B%E5%A6%88%E5%92%AA",
      "cover": "https://image.tmdb.org/t/p/w500/jdaHI1jIbJgPXdlDi2quuWw6fKB.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/j9AqsMJxuq7NEYJX4Q1vSfKb5CG.jpg",
      "rate": "8.2",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全14集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_19",
      "tmdbId": "271016",
      "title": "九门",
      "slug": "%E4%B9%9D%E9%97%A8",
      "cover": "https://image.tmdb.org/t/p/w500/bkyBY4EYv1htCkgmgVNfVrJ7qqW.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/paF9IoqXN3inVb5eR9rxElbpYyb.jpg",
      "rate": "7.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "悬疑",
        "剧集"
      ],
      "updateBadge": "正片",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_all_20",
      "title": "韩国制造第2季",
      "slug": "%E9%9F%A9%E5%9B%BD%E5%88%B6%E9%80%A0%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/63a26cde813e7e3578d8fef4bcea84fe.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/63a26cde813e7e3578d8fef4bcea84fe.jpg",
      "rate": "9.1",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "动作",
        "剧集"
      ],
      "updateBadge": "更新至第4集",
      "createdAt": "2026-09-16T10:52:00.000Z"
    }
  ],
  "movie": [
    {
      "entityId": "ik_latest_movie_1",
      "tmdbId": "1391021",
      "title": "欢迎来龙餐馆",
      "slug": "%E6%AC%A2%E8%BF%8E%E6%9D%A5%E9%BE%99%E9%A4%90%E9%A6%86",
      "cover": "https://image.tmdb.org/t/p/w500/2OJX7udqqpk5c82pXXdL2hnny0D.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zr7om0GOLOcLo7SXMmNEG5rz6de.jpg",
      "rate": "9.1",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "正片",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_movie_2",
      "tmdbId": "1101383",
      "title": "逃出绝命街",
      "slug": "%E9%80%83%E5%87%BA%E7%BB%9D%E5%91%BD%E8%A1%97",
      "cover": "https://image.tmdb.org/t/p/w500/2eXquFgtDqSyVmrcBwC9ZnzNw3d.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/b9q9VmbXDvJmTziRqkwdEmFdwhr.jpg",
      "rate": "6.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "动作",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-09-14T13:24:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_3",
      "tmdbId": "1671548",
      "title": "给阿嬷的情书",
      "slug": "%E7%BB%99%E9%98%BF%E5%AC%B7%E7%9A%84%E6%83%85%E4%B9%A6",
      "cover": "https://image.tmdb.org/t/p/w500/s0sC3hPPX4OobLNfdl2iSs2vtvI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/AwmlL79nKTcX5tzAhyoV298xXlz.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "576P",
      "createdAt": "2026-08-31T10:49:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_4",
      "tmdbId": "1353926",
      "title": "特立独行",
      "slug": "%E7%89%B9%E7%AB%8B%E7%8B%AC%E8%A1%8C",
      "cover": "https://image.tmdb.org/t/p/w500/cyzcsp95W2Op3G5Gb8S2cPEnSc2.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/kTp2i00tjARpsI6wTkU4Q8ArGaX.jpg",
      "rate": "6.6",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-09-04T11:14:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_5",
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
        "惊悚",
        "电影"
      ],
      "updateBadge": "720P",
      "createdAt": "2026-09-15T17:53:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_6",
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
        "网络电影",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-09-12T11:45:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_7",
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
        "剧情",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-09-11T03:47:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_8",
      "tmdbId": "1108427",
      "title": "海洋奇缘：启航",
      "slug": "%E6%B5%B7%E6%B4%8B%E5%A5%87%E7%BC%98-%E5%90%AF%E8%88%AA",
      "cover": "https://image.tmdb.org/t/p/w500/8f4OJJrMtZcoB4h1BLyyZewd96X.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/c6BPbkO5Npt1OdwttAxCFo06wtH.jpg",
      "rate": "7.3",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "喜剧",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-09-08T15:27:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_9",
      "tmdbId": "1602727",
      "title": "夜王",
      "slug": "%E5%A4%9C%E7%8E%8B",
      "cover": "https://image.tmdb.org/t/p/w500/mYGhDzTRB8n45En5BQZVXcvE2p.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/i9ptnJUIQkMqAe2XBDiFYDYEHn7.jpg",
      "rate": "6.9",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-08-29T14:22:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_10",
      "tmdbId": "1137844",
      "title": "求救信号",
      "slug": "%E6%B1%82%E6%95%91%E4%BF%A1%E5%8F%B7",
      "cover": "https://image.tmdb.org/t/p/w500/6MzhVjAgqj4mA0FjzoECcBlLMB7.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/g7Ccid5kuD7A8hXWlsQiNfwOxaD.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "动作",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-09-04T14:32:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_11",
      "tmdbId": "1305672",
      "title": "抓特务",
      "slug": "%E6%8A%93%E7%89%B9%E5%8A%A1",
      "cover": "https://image.tmdb.org/t/p/w500/ozQe6oNmGHvwk2zdCQilMikUTBZ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8Jjl0CUOt2T6Wf2hYcii4pd0SDR.jpg",
      "rate": "6.9",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-08-28T12:27:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_12",
      "tmdbId": "1288445",
      "title": "怒之杀(听译)",
      "slug": "%E6%80%92%E4%B9%8B%E6%9D%80%E5%90%AC%E8%AF%91",
      "cover": "https://image.tmdb.org/t/p/w500/5E6hS9faru2CDOXLrHhIyOUfC7a.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/e2QAGrEmbpmZpMymDRkDisJkvg9.jpg",
      "rate": "6.4",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "动作",
        "电影"
      ],
      "updateBadge": "576P",
      "createdAt": "2026-08-25T19:27:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_13",
      "title": "百分之十",
      "slug": "%E7%99%BE%E5%88%86%E4%B9%8B%E5%8D%81",
      "cover": "https://img.guangsuimage.com/cover/729192820ddbc2879943360421c281a2.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/729192820ddbc2879943360421c281a2.jpg",
      "rate": "6.9",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "720P",
      "createdAt": "2026-09-10T15:38:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_14",
      "tmdbId": "1084244",
      "title": "玩具总动员5",
      "slug": "%E7%8E%A9%E5%85%B7%E6%80%BB%E5%8A%A8%E5%91%985",
      "cover": "https://image.tmdb.org/t/p/w500/oo46YfPuMcV9t7KsTiaMVUVRjvJ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qjTqY5coNiz6sVtPng40IzltsoN.jpg",
      "rate": "8.4",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "动画",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-08-18T00:23:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_15",
      "tmdbId": "1572830",
      "title": "不成功穿越指南",
      "slug": "%E4%B8%8D%E6%88%90%E5%8A%9F%E7%A9%BF%E8%B6%8A%E6%8C%87%E5%8D%97",
      "cover": "https://image.tmdb.org/t/p/w500/3ETbY1nV0vJIeoxiJslXon0Z9Q9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ajqlk7EGZVjjl4b5VrrQQUc6k7G.jpg",
      "rate": "5.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-09-10T13:10:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_16",
      "tmdbId": "1499071",
      "title": "寒战1994",
      "slug": "%E5%AF%92%E6%88%981994",
      "cover": "https://image.tmdb.org/t/p/w500/8NaaLrhXbhuXmjndCKmgaJvLTb1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/gIpIMTZKhDNqFsoSj04sKZfV0g0.jpg",
      "rate": "6.5",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-07-24T11:04:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_17",
      "title": "邻人可疑",
      "slug": "%E9%82%BB%E4%BA%BA%E5%8F%AF%E7%96%91",
      "cover": "https://ok.zuidapic.com/upload/vod/20260821-1/71dff0f210d972b32cc59cd2e6a8a661.jpg",
      "backdrop": "https://ok.zuidapic.com/upload/vod/20260821-1/71dff0f210d972b32cc59cd2e6a8a661.jpg",
      "rate": "8.4",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-08-20T11:37:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_18",
      "tmdbId": "1522776",
      "title": "小气鬼",
      "slug": "%E5%B0%8F%E6%B0%94%E9%AC%BC",
      "cover": "https://image.tmdb.org/t/p/w500/sJVh2U27BXwnfT05kpLOmo0ZUop.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/wjcu5Wi4fbkyQN3kH3J1naTK40T.jpg",
      "rate": "7.7",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-09-02T10:49:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_19",
      "tmdbId": "860508",
      "title": "耳语者",
      "slug": "%E8%80%B3%E8%AF%AD%E8%80%85",
      "cover": "https://image.tmdb.org/t/p/w500/xIa2tidLzJ9tts5cAEmkv6qPxBH.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/uauoVKKCkNA9iWjgJCL8TdSfLf5.jpg",
      "rate": "6.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-08-28T16:36:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_20",
      "tmdbId": "1440098",
      "title": "保镖恋人",
      "slug": "%E4%BF%9D%E9%95%96%E6%81%8B%E4%BA%BA",
      "cover": "https://image.tmdb.org/t/p/w500/wRyb983cO7hdEdWsN6RNAXXhWqu.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/i65y7cMae36K0giN0GRaMjAHUru.jpg",
      "rate": "6.6",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "爱情",
        "电影"
      ],
      "updateBadge": "576P",
      "createdAt": "2026-09-09T15:41:00.000Z"
    }
  ],
  "tv": [
    {
      "entityId": "ik_latest_tv_1",
      "tmdbId": "282326",
      "title": "兰香如故",
      "slug": "%E5%85%B0%E9%A6%99%E5%A6%82%E6%95%85",
      "cover": "https://image.tmdb.org/t/p/w500/kfurXRMH1ZkUoyT5HN72zLTQxzZ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mZSewqVlY4F2F2Axm7hiG6KBOBp.jpg",
      "rate": "6.7",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "古装",
        "剧集"
      ],
      "updateBadge": "更新至第14集",
      "createdAt": "2026-09-16T12:51:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_2",
      "tmdbId": "299952",
      "title": "早春晴朗",
      "slug": "%E6%97%A9%E6%98%A5%E6%99%B4%E6%9C%97",
      "cover": "https://image.tmdb.org/t/p/w500/nLWFbYv1r99Yy7dWvjoxMRegoe0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oUFUvEMCBP80e4eYsfVfxC8n7ih.jpg",
      "rate": "8.4",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_3",
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
        "悬疑",
        "剧集"
      ],
      "updateBadge": "更新至第24集",
      "createdAt": "2026-09-16T12:49:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_4",
      "tmdbId": "290863",
      "title": "冬城猎凶",
      "slug": "%E5%86%AC%E5%9F%8E%E7%8C%8E%E5%87%B6",
      "cover": "https://image.tmdb.org/t/p/w500/64NVbdSuNgrK90wqhtnlR2S4sPK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/28u4q3fPzXmbyf3BoiWweUOuuzj.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "罪案",
        "剧集"
      ],
      "updateBadge": "更新至第12集",
      "createdAt": "2026-09-16T12:12:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_5",
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
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第19集",
      "createdAt": "2026-09-16T14:10:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_6",
      "tmdbId": "331912",
      "title": "死有对证",
      "slug": "%E6%AD%BB%E6%9C%89%E5%AF%B9%E8%AF%81",
      "cover": "https://image.tmdb.org/t/p/w500/86j3acQApCYjDruQ6riVVcJ9Y4m.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zjdyowR7sH4upiKoAnTiAhg55Iy.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第08集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_7",
      "tmdbId": "286988",
      "title": "飞到我心上",
      "slug": "%E9%A3%9E%E5%88%B0%E6%88%91%E5%BF%83%E4%B8%8A",
      "cover": "https://image.tmdb.org/t/p/w500/vnaO6MJVrGUb0DBqFpUy3K1j0KC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/aYtWVJ5mUkPRFghrCHbc3I2v4WE.jpg",
      "rate": "7.9",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_8",
      "tmdbId": "301489",
      "title": "深渊无间",
      "slug": "%E6%B7%B1%E6%B8%8A%E6%97%A0%E9%97%B4",
      "cover": "https://image.tmdb.org/t/p/w500/b9ngtGNgaHBbLihRrT0MsPRY0GW.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/s9YSQAJtXjimsjBVsqLtJNnIjEs.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "悬疑",
        "剧集"
      ],
      "updateBadge": "全16集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_9",
      "tmdbId": "287496",
      "title": "花开锦绣",
      "slug": "%E8%8A%B1%E5%BC%80%E9%94%A6%E7%BB%A3",
      "cover": "https://image.tmdb.org/t/p/w500/erj7cX8aa1jndO9HlmoyRcJNLQL.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zyAFGC97834c2Ld4xPY02uacdQk.jpg",
      "rate": "7.1",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "古装",
        "剧集"
      ],
      "updateBadge": "全36集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_10",
      "tmdbId": "286506",
      "title": "百花杀",
      "slug": "%E7%99%BE%E8%8A%B1%E6%9D%80",
      "cover": "https://image.tmdb.org/t/p/w500/sWdiop8BQwODB6tVOMeTfi0XHE3.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oSUWFmPPQkEFUDhLWPJcNumIWll.jpg",
      "rate": "8.9",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "更新至第75集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_11",
      "tmdbId": "294095",
      "title": "杀手妈咪",
      "slug": "%E6%9D%80%E6%89%8B%E5%A6%88%E5%92%AA",
      "cover": "https://image.tmdb.org/t/p/w500/jdaHI1jIbJgPXdlDi2quuWw6fKB.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/j9AqsMJxuq7NEYJX4Q1vSfKb5CG.jpg",
      "rate": "8.2",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全14集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_12",
      "tmdbId": "271016",
      "title": "九门",
      "slug": "%E4%B9%9D%E9%97%A8",
      "cover": "https://image.tmdb.org/t/p/w500/bkyBY4EYv1htCkgmgVNfVrJ7qqW.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/paF9IoqXN3inVb5eR9rxElbpYyb.jpg",
      "rate": "7.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "悬疑",
        "剧集"
      ],
      "updateBadge": "正片",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_13",
      "title": "韩国制造第2季",
      "slug": "%E9%9F%A9%E5%9B%BD%E5%88%B6%E9%80%A0%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/63a26cde813e7e3578d8fef4bcea84fe.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/63a26cde813e7e3578d8fef4bcea84fe.jpg",
      "rate": "9.1",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "动作",
        "剧集"
      ],
      "updateBadge": "更新至第4集",
      "createdAt": "2026-09-16T10:52:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_14",
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
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第9集",
      "createdAt": "2026-09-16T06:33:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_15",
      "title": "侠探杰克第4季",
      "slug": "%E4%BE%A0%E6%8E%A2%E6%9D%B0%E5%85%8B%E7%AC%AC4%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/04996df279dac53beeecd3e45edd460c.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/04996df279dac53beeecd3e45edd460c.jpg",
      "rate": "9.6",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_16",
      "tmdbId": "279388",
      "title": "逐玉",
      "slug": "%E9%80%90%E7%8E%89",
      "cover": "https://image.tmdb.org/t/p/w500/cYV1cn51qeu7aLqMUrSsmPe1QNo.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/yiUZ8Ck86FF3obLztVvSQqeBi0Y.jpg",
      "rate": "8.1",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全40集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_17",
      "tmdbId": "289761",
      "title": "醒来",
      "slug": "%E9%86%92%E6%9D%A5",
      "cover": "https://image.tmdb.org/t/p/w500/lxULhYKRE1C6zhaCNO0R0Id7ReM.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/jY5xb5HLoVWkXlKCTbXqh3g7GQL.jpg",
      "rate": "6.3",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全22集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_18",
      "tmdbId": "273207",
      "title": "侠女内莉",
      "slug": "%E4%BE%A0%E5%A5%B3%E5%86%85%E8%8E%89",
      "cover": "https://image.tmdb.org/t/p/w500/l5gxBGG8RVECttvH4lBn2YkNR13.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/uYOYLFQ4q7asuhdiKXCqGaeAQUH.jpg",
      "rate": "7.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_19",
      "tmdbId": "295558",
      "title": "雀骨",
      "slug": "%E9%9B%80%E9%AA%A8",
      "cover": "https://image.tmdb.org/t/p/w500/858HgKLO9hZkYs2tS7ZPkqh9HVr.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/eZTq2kkhZ9AQtQ1H5SD7h1Q0PIc.jpg",
      "rate": "7.9",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "全28集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_tv_20",
      "tmdbId": "292696",
      "title": "莫离",
      "slug": "%E8%8E%AB%E7%A6%BB",
      "cover": "https://image.tmdb.org/t/p/w500/pRPDAGXmoUnWlRj34BHQ1Gt05ai.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/gxkcHgZJfyGZOtVPdfGOtFnmwHT.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "全40集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    }
  ],
  "anime": [
    {
      "entityId": "ik_latest_anime_1",
      "tmdbId": "223911",
      "title": "仙逆",
      "slug": "%E4%BB%99%E9%80%86",
      "cover": "https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/crn53sSGWRZ8wAtEGso52nepEkz.jpg",
      "rate": "8.3",
      "year": "2023",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第158集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_anime_2",
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
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第191集",
      "createdAt": "2026-09-12T05:13:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_3",
      "title": "妖神记第4季",
      "slug": "%E5%A6%96%E7%A5%9E%E8%AE%B0%E7%AC%AC4%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/75b4f712b9a4860516a726646282d56a.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/75b4f712b9a4860516a726646282d56a.jpg",
      "rate": "6.8",
      "year": "2020",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第451集",
      "createdAt": "2026-09-16T12:47:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_4",
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
        "其它",
        "剧集"
      ],
      "updateBadge": "更新至第04集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_anime_5",
      "tmdbId": "106480",
      "title": "海贼王",
      "slug": "%E6%B5%B7%E8%B4%BC%E7%8E%8B",
      "cover": "https://image.tmdb.org/t/p/w500/irXdsPTvC6euwYalDD2XJXDM17U.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xBYfKcbDY0NktGn9f7QW8qaV96g.jpg",
      "rate": "7.4",
      "year": "2021",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "艾格赫德前半总集篇",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_anime_6",
      "tmdbId": "224839",
      "title": "遮天",
      "slug": "%E9%81%AE%E5%A4%A9",
      "cover": "https://image.tmdb.org/t/p/w500/z9JNGlJ8eGy6S6SOlBhpmxjjXGT.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/1HcuGlNEfc6EYZHEZGwgKjAvYa4.jpg",
      "rate": "8.9",
      "year": "2023",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "冒险",
        "剧集"
      ],
      "updateBadge": "更新至第181集",
      "createdAt": "2026-09-15T14:19:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_7",
      "tmdbId": "236534",
      "title": "牧神记",
      "slug": "%E7%89%A7%E7%A5%9E%E8%AE%B0",
      "cover": "https://image.tmdb.org/t/p/w500/jPHitNQ1fuKK6aPZ6eCPiFq9XhG.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3XYx3pQh2sKRnc9CI9tY7UU2SPv.jpg",
      "rate": "7.8",
      "year": "2024",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第100集",
      "createdAt": "2026-09-13T05:21:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_8",
      "tmdbId": "79481",
      "title": "斗破苍穹年番",
      "slug": "%E6%96%97%E7%A0%B4%E8%8B%8D%E7%A9%B9%E5%B9%B4%E7%95%AA",
      "cover": "https://image.tmdb.org/t/p/w500/oyoahIcdamTXwjIaL3CqZ1v5CLl.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cTCn2EO69SERNfhaezJMoqBom4G.jpg",
      "rate": "7.9",
      "year": "2017",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第210集",
      "createdAt": "2026-09-12T13:05:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_9",
      "tmdbId": "101172",
      "title": "吞噬星空",
      "slug": "%E5%90%9E%E5%99%AC%E6%98%9F%E7%A9%BA",
      "cover": "https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lDVOl7wTFUIqwlSrWsGjBCHt3fQ.jpg",
      "rate": "8.5",
      "year": "2020",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "科幻",
        "剧集"
      ],
      "updateBadge": "更新至第241集",
      "createdAt": "2026-09-14T13:18:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_10",
      "tmdbId": "291043",
      "title": "我独自盗墓",
      "slug": "%E6%88%91%E7%8B%AC%E8%87%AA%E7%9B%97%E5%A2%93",
      "cover": "https://image.tmdb.org/t/p/w500/auWQytep71FZx1XHFqY8WaHSuDD.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/auWQytep71FZx1XHFqY8WaHSuDD.jpg",
      "rate": "8.6",
      "year": "2020",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "冒险",
        "剧集"
      ],
      "updateBadge": "更新至第11集",
      "createdAt": "2026-09-16T19:33:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_11",
      "title": "从零开始的异世界生活第4季",
      "slug": "%E4%BB%8E%E9%9B%B6%E5%BC%80%E5%A7%8B%E7%9A%84%E5%BC%82%E4%B8%96%E7%95%8C%E7%94%9F%E6%B4%BB%E7%AC%AC4%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/f87490a5be6e9c191a740a1135160af9.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/f87490a5be6e9c191a740a1135160af9.jpg",
      "rate": "9.3",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "魔幻",
        "剧集"
      ],
      "updateBadge": "更新至第17集",
      "createdAt": "2026-09-16T16:02:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_12",
      "tmdbId": "218642",
      "title": "师兄啊师兄",
      "slug": "%E5%B8%88%E5%85%84%E5%95%8A%E5%B8%88%E5%85%84",
      "cover": "https://image.tmdb.org/t/p/w500/hLUK05JYFVDVGYJLDlI7FUxV6jh.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3Icy4H4NAJ5obx4c3AxJin1nvLY.jpg",
      "rate": "8.8",
      "year": "2023",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "爆笑",
        "剧集"
      ],
      "updateBadge": "更新至第159集",
      "createdAt": "2026-09-16T03:58:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_13",
      "tmdbId": "303287",
      "title": "一斩苍穹",
      "slug": "%E4%B8%80%E6%96%A9%E8%8B%8D%E7%A9%B9",
      "cover": "https://image.tmdb.org/t/p/w500/7rDjnBLbJhFN6oLE2uVd9bDx0bU.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cU5PAnxXY9DWStsZ0HsFhq4SHWr.jpg",
      "rate": "10.0",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "魔幻",
        "剧集"
      ],
      "updateBadge": "更新至第9集",
      "createdAt": "2026-09-15T04:09:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_14",
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
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第39集",
      "createdAt": "2026-09-12T04:03:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_15",
      "tmdbId": "229192",
      "title": "沧元图",
      "slug": "%E6%B2%A7%E5%85%83%E5%9B%BE",
      "cover": "https://image.tmdb.org/t/p/w500/m7aoxGa7NWw2abNIoWL8NxYzpO8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/7LzHgJ0OZJeG3eljeISJ09BdaaF.jpg",
      "rate": "9.2",
      "year": "2023",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第94集",
      "createdAt": "2026-09-11T04:00:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_16",
      "tmdbId": "30983",
      "title": "名侦探柯南",
      "slug": "%E5%90%8D%E4%BE%A6%E6%8E%A2%E6%9F%AF%E5%8D%97",
      "cover": "https://image.tmdb.org/t/p/w500/7qBrY88hNwMrMb75PkBZjhFolbL.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/z67lpMtm8YGykJO4p89meuNMvj8.jpg",
      "rate": "8.0",
      "year": "1996",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "推理",
        "剧集"
      ],
      "updateBadge": "更新至第1272集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_anime_17",
      "title": "诛仙4",
      "slug": "%E8%AF%9B%E4%BB%994",
      "cover": "https://img.guangsuimage.com/cover/e255ba0d78af223ff77727dea645f1a1.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/e255ba0d78af223ff77727dea645f1a1.jpg",
      "rate": "9.3",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第6集",
      "createdAt": "2026-09-10T13:12:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_18",
      "tmdbId": "331477",
      "title": "一念永恒完结季",
      "slug": "%E4%B8%80%E5%BF%B5%E6%B0%B8%E6%81%92%E5%AE%8C%E7%BB%93%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/sMh3dDaDFA72Y3TSu09ovQzWYQA.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/mHE5x9iMM57Al1tGFPUlplRLIR0.jpg",
      "rate": "8.5",
      "year": "2020",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第11集",
      "createdAt": "2026-09-15T14:17:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_19",
      "title": "乡下大叔成为剑圣第2季",
      "slug": "%E4%B9%A1%E4%B8%8B%E5%A4%A7%E5%8F%94%E6%88%90%E4%B8%BA%E5%89%91%E5%9C%A3%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/6b833c9e894b58478efcd0129c74f0e9.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/6b833c9e894b58478efcd0129c74f0e9.jpg",
      "rate": "9.0",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "魔幻",
        "剧集"
      ],
      "updateBadge": "更新至第11集",
      "createdAt": "2026-09-16T18:07:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_20",
      "tmdbId": "326695",
      "title": "择日飞升",
      "slug": "%E6%8B%A9%E6%97%A5%E9%A3%9E%E5%8D%87",
      "cover": "https://image.tmdb.org/t/p/w500/5NKojVuw2Jf0dT9nSgGPlLiBQV5.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/yUqwbhTCHEKAAZquPqgLAZXgaUF.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "魔幻",
        "剧集"
      ],
      "updateBadge": "更新至第11集",
      "createdAt": "2026-09-12T02:53:00.000Z"
    }
  ],
  "variety": [
    {
      "entityId": "ik_latest_variety_1",
      "title": "一饭封神第2季",
      "slug": "%E4%B8%80%E9%A5%AD%E5%B0%81%E7%A5%9E%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第8期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_2",
      "title": "心动的信号第9季",
      "slug": "%E5%BF%83%E5%8A%A8%E7%9A%84%E4%BF%A1%E5%8F%B7%E7%AC%AC9%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "260916超前彩蛋",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_3",
      "title": "花儿与少年第8季",
      "slug": "%E8%8A%B1%E5%84%BF%E4%B8%8E%E5%B0%91%E5%B9%B4%E7%AC%AC8%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "rate": "8.3",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第6期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_4",
      "title": "披荆斩棘2026",
      "slug": "%E6%8A%AB%E8%8D%86%E6%96%A9%E6%A3%982026",
      "cover": "https://img.guangsuimage.com/cover/2eea2ab420e3cde52f34fd7cc5d341ee.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/2eea2ab420e3cde52f34fd7cc5d341ee.jpg",
      "rate": "8.5",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "三公小考",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_5",
      "title": "密室大逃脱第8季",
      "slug": "%E5%AF%86%E5%AE%A4%E5%A4%A7%E9%80%83%E8%84%B1%E7%AC%AC8%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/4bd8575441a219bc600c27999928e8ed.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/4bd8575441a219bc600c27999928e8ed.jpg",
      "rate": "9.2",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第9期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_6",
      "title": "我家那闺女2026",
      "slug": "%E6%88%91%E5%AE%B6%E9%82%A3%E9%97%BA%E5%A5%B32026",
      "cover": "https://img.guangsuimage.com/cover/26341e155670d44627317021c84245ac.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/26341e155670d44627317021c84245ac.jpg",
      "rate": "8.1",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第5期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_7",
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
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第5期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_8",
      "title": "地球超新鲜第2季",
      "slug": "%E5%9C%B0%E7%90%83%E8%B6%85%E6%96%B0%E9%B2%9C%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/b9157fcbb292322b146460825507c6a3.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/b9157fcbb292322b146460825507c6a3.jpg",
      "rate": "9.3",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第2期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_9",
      "title": "脱口秀和Ta的朋友们第3季",
      "slug": "%E8%84%B1%E5%8F%A3%E7%A7%80%E5%92%8Cta%E7%9A%84%E6%9C%8B%E5%8F%8B%E4%BB%AC%E7%AC%AC3%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/a5a145919123f9541e89868ab2796244.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/a5a145919123f9541e89868ab2796244.jpg",
      "rate": "9.1",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "脱口秀",
        "剧集"
      ],
      "updateBadge": "穷门永存纯享",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_10",
      "title": "喜剧之王单口季第3季",
      "slug": "%E5%96%9C%E5%89%A7%E4%B9%8B%E7%8E%8B%E5%8D%95%E5%8F%A3%E5%AD%A3%E7%AC%AC3%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/2a0c7668910b8ee5928c5255c5855f5c.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/2a0c7668910b8ee5928c5255c5855f5c.jpg",
      "rate": "8.1",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "飞行气氛组特辑",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_11",
      "tmdbId": "326694",
      "title": "说唱巅峰对决2026",
      "slug": "%E8%AF%B4%E5%94%B1%E5%B7%85%E5%B3%B0%E5%AF%B9%E5%86%B32026",
      "cover": "https://image.tmdb.org/t/p/w500/sfZawhbu32LxTJAzYfgFObfXl0i.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lUIY59PL7uEdOLPIxP2GOv6gwSn.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "总决赛(六)",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_12",
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
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第4期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_13",
      "tmdbId": "33238",
      "title": "Running Man",
      "slug": "running-man",
      "cover": "https://image.tmdb.org/t/p/w500/15SMnscZqd7HZ0bzruatOcKUlOV.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/wsHj4oHQJoe7DMYaqNFwVoyLiAh.jpg",
      "rate": "8.2",
      "year": "2010",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "竞技",
        "剧集"
      ],
      "updateBadge": "正片",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_14",
      "tmdbId": "297509",
      "title": "食神·百厨大战",
      "slug": "%E9%A3%9F%E7%A5%9E-%E7%99%BE%E5%8E%A8%E5%A4%A7%E6%88%98",
      "cover": "https://image.tmdb.org/t/p/w500/kDQYE6BunrxJ4sFHi69DwKVNnBK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9kejOOsiuaIlXHTebKIgadlFhSZ.jpg",
      "rate": "8.6",
      "year": "2025",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第13期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_15",
      "tmdbId": "154770",
      "title": "你好星期六",
      "slug": "%E4%BD%A0%E5%A5%BD%E6%98%9F%E6%9C%9F%E5%85%AD",
      "cover": "https://image.tmdb.org/t/p/w500/wsTjWy6NE2s3h0neChr0D92ddwI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/pvOI0jUuBVigqNTXClGGhIK2dSk.jpg",
      "rate": "6.5",
      "year": "2022",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "20260914(加更版",
      "createdAt": "2026-09-14T06:15:00.000Z"
    },
    {
      "entityId": "ik_latest_variety_16",
      "title": "密室大逃脱大神版第8季",
      "slug": "%E5%AF%86%E5%AE%A4%E5%A4%A7%E9%80%83%E8%84%B1%E5%A4%A7%E7%A5%9E%E7%89%88%E7%AC%AC8%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/40a862df96c3aaee56ff5f2c750de8c1.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/40a862df96c3aaee56ff5f2c750de8c1.jpg",
      "rate": "9.1",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "已完结",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_17",
      "tmdbId": "121876",
      "title": "花儿与少年丝路季",
      "slug": "%E8%8A%B1%E5%84%BF%E4%B8%8E%E5%B0%91%E5%B9%B4%E4%B8%9D%E8%B7%AF%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/s4WOcsEQ1pLjdKWEy7dcFDlWfI4.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/kIgzX0QdvK3vtaoHBpj9fUy7DP9.jpg",
      "rate": "6.8",
      "year": "2014",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "20240207(特别企",
      "createdAt": "2024-02-07T08:47:00.000Z"
    },
    {
      "entityId": "ik_latest_variety_18",
      "title": "姐姐当家第2季",
      "slug": "%E5%A7%90%E5%A7%90%E5%BD%93%E5%AE%B6%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/adc48ee14471bd351849361486a28c04.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/adc48ee14471bd351849361486a28c04.jpg",
      "rate": "9.7",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第10期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_variety_19",
      "title": "打歌2026",
      "slug": "%E6%89%93%E6%AD%8C2026",
      "cover": "https://img.guangsuimage.com/cover/15a14d5c27bb3d97f6380cbd051efe77.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/15a14d5c27bb3d97f6380cbd051efe77.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第1期",
      "createdAt": "2026-09-13T06:09:00.000Z"
    },
    {
      "entityId": "ik_latest_variety_20",
      "tmdbId": "331587",
      "title": "伦敦合伙人",
      "slug": "%E4%BC%A6%E6%95%A6%E5%90%88%E4%BC%99%E4%BA%BA",
      "cover": "https://image.tmdb.org/t/p/w500/a6D6QHnWQTTNGAmllEmIZ0HTiV9.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/a6D6QHnWQTTNGAmllEmIZ0HTiV9.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第6期",
      "createdAt": "2026-09-17T01:17:53.102Z"
    }
  ],
  "documentary": [
    {
      "entityId": "ik_latest_documentary_1",
      "title": "克拉克森的农场第4季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC4%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/6f08b009341a1952b8dacc9990cafe94.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/6f08b009341a1952b8dacc9990cafe94.jpg",
      "rate": "10.0",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_2",
      "title": "克拉克森的农场第3季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC3%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/a88fed17c7e74dc17e021116d25a50a2.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/a88fed17c7e74dc17e021116d25a50a2.jpg",
      "rate": "10.0",
      "year": "2024",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_3",
      "title": "欢迎来到雷克斯汉姆",
      "slug": "%E6%AC%A2%E8%BF%8E%E6%9D%A5%E5%88%B0%E9%9B%B7%E5%85%8B%E6%96%AF%E6%B1%89%E5%A7%86",
      "cover": "https://img.guangsuimage.com/cover/a81d0525b1bf67680570fa60790b8e07.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/a81d0525b1bf67680570fa60790b8e07.jpg",
      "rate": "8.9",
      "year": "2022",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "更新至第18集",
      "createdAt": "2022-12-28T14:31:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_4",
      "title": "克拉克森的农场第1季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC1%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/647715020a35f278c5ff9de26e2a4f9b.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/647715020a35f278c5ff9de26e2a4f9b.jpg",
      "rate": "9.6",
      "year": "2021",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "人物",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_5",
      "title": "克拉克森的农场第5季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC5%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/c2ddf6d0564a49ecc3052c9153e10456.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/c2ddf6d0564a49ecc3052c9153e10456.jpg",
      "rate": "10.0",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_6",
      "title": "克拉克森的农场第2季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/6177dff3880bc5a2d2e5aeae40fa48fe.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/6177dff3880bc5a2d2e5aeae40fa48fe.jpg",
      "rate": "9.6",
      "year": "2023",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "人物",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_7",
      "tmdbId": "78990",
      "title": "中国通史",
      "slug": "%E4%B8%AD%E5%9B%BD%E9%80%9A%E5%8F%B2",
      "cover": "https://image.tmdb.org/t/p/w500/ryV0N1mCAXRseheuAfNljlnKV10.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lauMPVhxZVifi7sZ5k56nfRu74Y.jpg",
      "rate": "9.8",
      "year": "2013",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "历史",
        "剧集"
      ],
      "updateBadge": "全100集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_8",
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
        "人物",
        "剧集"
      ],
      "updateBadge": "全3集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_9",
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
        "其它",
        "剧集"
      ],
      "updateBadge": "全3集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_10",
      "title": "守护解放西第6季",
      "slug": "%E5%AE%88%E6%8A%A4%E8%A7%A3%E6%94%BE%E8%A5%BF%E7%AC%AC6%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/5a5abe3c5d675d05ce98484ca2bfa3fa.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/5a5abe3c5d675d05ce98484ca2bfa3fa.jpg",
      "rate": "9.4",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "人物",
        "剧集"
      ],
      "updateBadge": "更新至第10集",
      "createdAt": "2025-12-05T13:11:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_11",
      "tmdbId": "131651",
      "title": "转折点：911与反恐战争",
      "slug": "%E8%BD%AC%E6%8A%98%E7%82%B9-911%E4%B8%8E%E5%8F%8D%E6%81%90%E6%88%98%E4%BA%89",
      "cover": "https://image.tmdb.org/t/p/w500/aWHyzSVVVlKcd6KIuZCMIvD5TPZ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/pxhxhEKJXznWEavLXJWUxxxdo2X.jpg",
      "rate": "7.3",
      "year": "2021",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "解密",
        "剧集"
      ],
      "updateBadge": "更新至第05集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_12",
      "tmdbId": "288824",
      "title": "寻色中国",
      "slug": "%E5%AF%BB%E8%89%B2%E4%B8%AD%E5%9B%BD",
      "cover": "https://image.tmdb.org/t/p/w500/bd6IuhpQGZz37sCMqSsRzuz5EDn.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/uEUTIrvuXG7gAsKqn8GJq4ceU2e.jpg",
      "rate": "8.6",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "其它",
        "剧集"
      ],
      "updateBadge": "番外篇",
      "createdAt": "2025-06-20T06:45:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_13",
      "tmdbId": "286325",
      "title": "牛奶是部文明史",
      "slug": "%E7%89%9B%E5%A5%B6%E6%98%AF%E9%83%A8%E6%96%87%E6%98%8E%E5%8F%B2",
      "cover": "https://image.tmdb.org/t/p/w500/riHROQJElyrfyvgKJoATBSDYEVt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/onTmvH6jLbSja9YTAtLyZejSEAu.jpg",
      "rate": "8.0",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "更新至第6集",
      "createdAt": "2025-04-10T12:33:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_14",
      "title": "守护解放西第4季",
      "slug": "%E5%AE%88%E6%8A%A4%E8%A7%A3%E6%94%BE%E8%A5%BF%E7%AC%AC4%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/5a5abe3c5d675d05ce98484ca2bfa3fa.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/5a5abe3c5d675d05ce98484ca2bfa3fa.jpg",
      "rate": "9.5",
      "year": "2023",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "人物",
        "剧集"
      ],
      "updateBadge": "更新至第10集",
      "createdAt": "2023-12-29T13:04:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_15",
      "title": "千古风流人物第1季",
      "slug": "%E5%8D%83%E5%8F%A4%E9%A3%8E%E6%B5%81%E4%BA%BA%E7%89%A9%E7%AC%AC1%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/c95fb5808427c136e697d4bdc6676de3.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/c95fb5808427c136e697d4bdc6676de3.jpg",
      "rate": "9.3",
      "year": "2021",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "人物",
        "剧集"
      ],
      "updateBadge": "全20集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_16",
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
        "其它",
        "剧集"
      ],
      "updateBadge": "全4集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_17",
      "title": "街边下饭魂第2季",
      "slug": "%E8%A1%97%E8%BE%B9%E4%B8%8B%E9%A5%AD%E9%AD%82%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/291806ebb9de8fe92dc92a02a2b46b5a.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/291806ebb9de8fe92dc92a02a2b46b5a.jpg",
      "rate": "6.0",
      "year": "2024",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "其它",
        "剧集"
      ],
      "updateBadge": "全5集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_18",
      "tmdbId": "233237",
      "title": "世界第二次大战：前线经历",
      "slug": "%E4%B8%96%E7%95%8C%E7%AC%AC%E4%BA%8C%E6%AC%A1%E5%A4%A7%E6%88%98-%E5%89%8D%E7%BA%BF%E7%BB%8F%E5%8E%86",
      "cover": "https://image.tmdb.org/t/p/w500/6bP7gYe4sftWnCcMEi46B2vOmbl.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cw3S08Eh5LxnegXTQ8M2RVFNEa0.jpg",
      "rate": "8.0",
      "year": "2023",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "军事",
        "剧集"
      ],
      "updateBadge": "更新至第6集",
      "createdAt": "2023-12-07T14:30:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_19",
      "tmdbId": "9326",
      "title": "史前星球",
      "slug": "%E5%8F%B2%E5%89%8D%E6%98%9F%E7%90%83",
      "cover": "https://image.tmdb.org/t/p/w500/ubahGAUSZmZsTVwjKcZpQh7vcIK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/ubahGAUSZmZsTVwjKcZpQh7vcIK.jpg",
      "rate": "8.5",
      "year": "2002",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "历史",
        "剧集"
      ],
      "updateBadge": "全5集",
      "createdAt": "2026-09-17T01:17:53.102Z"
    },
    {
      "entityId": "ik_latest_documentary_20",
      "title": "主厨的餐桌第2季",
      "slug": "%E4%B8%BB%E5%8E%A8%E7%9A%84%E9%A4%90%E6%A1%8C%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/1c34bf1931d3009da403034004b2460a.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/1c34bf1931d3009da403034004b2460a.jpg",
      "rate": "8.5",
      "year": "2016",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "其它",
        "剧集"
      ],
      "updateBadge": "更新至第6集",
      "createdAt": "2017-10-26T12:12:00.000Z"
    }
  ]
};
