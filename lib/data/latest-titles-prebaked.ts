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
      "rate": "7.2",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "古装",
        "剧集"
      ],
      "updateBadge": "更新至第18集",
      "createdAt": "2026-09-18T12:51:00.000Z"
    },
    {
      "entityId": "ik_latest_all_2",
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
      "updateBadge": "更新至第28集",
      "createdAt": "2026-09-18T12:51:00.000Z"
    },
    {
      "entityId": "ik_latest_all_3",
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
        "剧情",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_4",
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
        "爱情",
        "剧集"
      ],
      "updateBadge": "更新至第8集",
      "createdAt": "2026-09-18T12:20:00.000Z"
    },
    {
      "entityId": "ik_latest_all_5",
      "tmdbId": "299952",
      "title": "早春晴朗",
      "slug": "%E6%97%A9%E6%98%A5%E6%99%B4%E6%9C%97",
      "cover": "https://image.tmdb.org/t/p/w500/nLWFbYv1r99Yy7dWvjoxMRegoe0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oUFUvEMCBP80e4eYsfVfxC8n7ih.jpg",
      "rate": "8.3",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_6",
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
      "updateBadge": "全26集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_7",
      "tmdbId": "290863",
      "title": "冬城猎凶",
      "slug": "%E5%86%AC%E5%9F%8E%E7%8C%8E%E5%87%B6",
      "cover": "https://image.tmdb.org/t/p/w500/8nenduIuctLj2YBjWHG8pFs1X6R.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/28u4q3fPzXmbyf3BoiWweUOuuzj.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "罪案",
        "剧集"
      ],
      "updateBadge": "更新至第14集",
      "createdAt": "2026-09-18T10:13:00.000Z"
    },
    {
      "entityId": "ik_latest_all_8",
      "tmdbId": "331912",
      "title": "死有对证",
      "slug": "%E6%AD%BB%E6%9C%89%E5%AF%B9%E8%AF%81",
      "cover": "https://image.tmdb.org/t/p/w500/86j3acQApCYjDruQ6riVVcJ9Y4m.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/e8a1Wufu5iyWnCePVzjxWZXyL5O.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第10集",
      "createdAt": "2026-09-18T15:15:00.000Z"
    },
    {
      "entityId": "ik_latest_all_9",
      "title": "花儿与少年第8季",
      "slug": "%E8%8A%B1%E5%84%BF%E4%B8%8E%E5%B0%91%E5%B9%B4%E7%AC%AC8%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "rate": "8.2",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "第2期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_10",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_11",
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
        "喜剧",
        "电影"
      ],
      "updateBadge": "更新至第28集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_12",
      "tmdbId": "286988",
      "title": "飞到我心上",
      "slug": "%E9%A3%9E%E5%88%B0%E6%88%91%E5%BF%83%E4%B8%8A",
      "cover": "https://image.tmdb.org/t/p/w500/vnaO6MJVrGUb0DBqFpUy3K1j0KC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/aYtWVJ5mUkPRFghrCHbc3I2v4WE.jpg",
      "rate": "7.7",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_13",
      "title": "披荆斩棘2026",
      "slug": "%E6%8A%AB%E8%8D%86%E6%96%A9%E6%A3%982026",
      "cover": "https://img.guangsuimage.com/cover/2eea2ab420e3cde52f34fd7cc5d341ee.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/2eea2ab420e3cde52f34fd7cc5d341ee.jpg",
      "rate": "8.4",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "三公小考",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_14",
      "title": "心动的信号第9季",
      "slug": "%E5%BF%83%E5%8A%A8%E7%9A%84%E4%BF%A1%E5%8F%B7%E7%AC%AC9%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "rate": "8.9",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "第7期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_15",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_16",
      "title": "一饭封神第2季",
      "slug": "%E4%B8%80%E9%A5%AD%E5%B0%81%E7%A5%9E%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "rate": "8.9",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "第8期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_17",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_18",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_all_19",
      "tmdbId": "229192",
      "title": "沧元图",
      "slug": "%E6%B2%A7%E5%85%83%E5%9B%BE",
      "cover": "https://image.tmdb.org/t/p/w500/m7aoxGa7NWw2abNIoWL8NxYzpO8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/7LzHgJ0OZJeG3eljeISJ09BdaaF.jpg",
      "rate": "9.2",
      "year": "2023",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第95集",
      "createdAt": "2026-09-18T04:04:00.000Z"
    },
    {
      "entityId": "ik_latest_all_20",
      "title": "大哥小助理",
      "slug": "%E5%A4%A7%E5%93%A5%E5%B0%8F%E5%8A%A9%E7%90%86",
      "cover": "https://img.guangsuimage.com/cover/9dac9db8204abfacece76632f697b6ec.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/9dac9db8204abfacece76632f697b6ec.jpg",
      "rate": "9.3",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "第6期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    }
  ],
  "movie": [
    {
      "entityId": "ik_latest_movie_1",
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
        "喜剧",
        "电影"
      ],
      "updateBadge": "更新至第28集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_movie_2",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
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
      "rate": "6.7",
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
      "tmdbId": "1641629",
      "title": "你我对抗全世界",
      "slug": "%E4%BD%A0%E6%88%91%E5%AF%B9%E6%8A%97%E5%85%A8%E4%B8%96%E7%95%8C",
      "cover": "https://image.tmdb.org/t/p/w500/xwzLNsGMh1yDRGOGH58ftPWmfzq.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/nkEhDomjmPHJSA4Tx8pxv0NlKEy.jpg",
      "rate": "5.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "爱情",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-09-18T14:25:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_6",
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
        "动作",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-09-14T13:24:00.000Z"
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
      "entityId": "ik_latest_movie_9",
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
      "entityId": "ik_latest_movie_10",
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
      "entityId": "ik_latest_movie_11",
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
      "entityId": "ik_latest_movie_12",
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
      "entityId": "ik_latest_movie_13",
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
      "entityId": "ik_latest_movie_14",
      "tmdbId": "1514863",
      "title": "最佳舞伴",
      "slug": "%E6%9C%80%E4%BD%B3%E8%88%9E%E4%BC%B4",
      "cover": "https://image.tmdb.org/t/p/w500/Zm5i6MmXp5cfIT3LffiuAX1uZ6.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5m1j7Wibh3HnZq5QHm97v8dI3GH.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "720P",
      "createdAt": "2026-09-18T14:13:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_15",
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
      "entityId": "ik_latest_movie_16",
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
      "entityId": "ik_latest_movie_17",
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
      "entityId": "ik_latest_movie_18",
      "title": "邻人可疑",
      "slug": "%E9%82%BB%E4%BA%BA%E5%8F%AF%E7%96%91",
      "cover": "https://ok.zuidapic.com/upload/vod/20260821-1/71dff0f210d972b32cc59cd2e6a8a661.jpg",
      "backdrop": "https://ok.zuidapic.com/upload/vod/20260821-1/71dff0f210d972b32cc59cd2e6a8a661.jpg",
      "rate": "8.5",
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
      "entityId": "ik_latest_movie_19",
      "tmdbId": "1365884",
      "title": "百分之十",
      "slug": "%E7%99%BE%E5%88%86%E4%B9%8B%E5%8D%81",
      "cover": "https://image.tmdb.org/t/p/w500/xfGeL7zbAL8R2DRl1Dpy5Ek3D5i.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/4v8XgcmtUFVXUzGb7noltdjg2Ou.jpg",
      "rate": "6.4",
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
      "entityId": "ik_latest_movie_20",
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
      "rate": "7.2",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "古装",
        "剧集"
      ],
      "updateBadge": "更新至第18集",
      "createdAt": "2026-09-18T12:51:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_2",
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
      "updateBadge": "更新至第28集",
      "createdAt": "2026-09-18T12:51:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_3",
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
        "剧情",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_4",
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
        "爱情",
        "剧集"
      ],
      "updateBadge": "更新至第8集",
      "createdAt": "2026-09-18T12:20:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_5",
      "tmdbId": "299952",
      "title": "早春晴朗",
      "slug": "%E6%97%A9%E6%98%A5%E6%99%B4%E6%9C%97",
      "cover": "https://image.tmdb.org/t/p/w500/nLWFbYv1r99Yy7dWvjoxMRegoe0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oUFUvEMCBP80e4eYsfVfxC8n7ih.jpg",
      "rate": "8.3",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_6",
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
      "updateBadge": "全26集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_7",
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
        "罪案",
        "剧集"
      ],
      "updateBadge": "更新至第14集",
      "createdAt": "2026-09-18T10:13:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_8",
      "tmdbId": "331912",
      "title": "死有对证",
      "slug": "%E6%AD%BB%E6%9C%89%E5%AF%B9%E8%AF%81",
      "cover": "https://image.tmdb.org/t/p/w500/86j3acQApCYjDruQ6riVVcJ9Y4m.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/e8a1Wufu5iyWnCePVzjxWZXyL5O.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第10集",
      "createdAt": "2026-09-18T15:15:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_9",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_10",
      "tmdbId": "286988",
      "title": "飞到我心上",
      "slug": "%E9%A3%9E%E5%88%B0%E6%88%91%E5%BF%83%E4%B8%8A",
      "cover": "https://image.tmdb.org/t/p/w500/vnaO6MJVrGUb0DBqFpUy3K1j0KC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/aYtWVJ5mUkPRFghrCHbc3I2v4WE.jpg",
      "rate": "7.7",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_11",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_12",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_13",
      "tmdbId": "286506",
      "title": "百花杀",
      "slug": "%E7%99%BE%E8%8A%B1%E6%9D%80",
      "cover": "https://image.tmdb.org/t/p/w500/sWdiop8BQwODB6tVOMeTfi0XHE3.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/q7aDczLPQxb8rDAz5FzPwmFzDFo.jpg",
      "rate": "8.9",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "更新至第75集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_14",
      "tmdbId": "294636",
      "title": "中头奖还是要上班",
      "slug": "%E4%B8%AD%E5%A4%B4%E5%A5%96%E8%BF%98%E6%98%AF%E8%A6%81%E4%B8%8A%E7%8F%AD",
      "cover": "https://image.tmdb.org/t/p/w500/iit1tcgJFXlsrBoif3G1HLJFAXs.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oxJIuxIWiBEcIBRDdu48vTwQcJZ.jpg",
      "rate": "10.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第4集",
      "createdAt": "2026-09-17T16:53:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_15",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_16",
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
      "updateBadge": "更新至第12集",
      "createdAt": "2026-09-18T06:30:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_17",
      "title": "黑帮领地第2季",
      "slug": "%E9%BB%91%E5%B8%AE%E9%A2%86%E5%9C%B0%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/80505a95d8ae5f9be198272d1cfc2878.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/80505a95d8ae5f9be198272d1cfc2878.jpg",
      "rate": "8.3",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全10集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_18",
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
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第3集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_19",
      "tmdbId": "291856",
      "title": "重器",
      "slug": "%E9%87%8D%E5%99%A8",
      "cover": "https://image.tmdb.org/t/p/w500/43iXOUo8dw7KfllwOnuu8JSyqFt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/sUTK5UjUNud0d5hcEbhOk4RTqII.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全33集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_tv_20",
      "title": "幸福伽菜子的快乐杀手生活第2季",
      "slug": "%E5%B9%B8%E7%A6%8F%E4%BC%BD%E8%8F%9C%E5%AD%90%E7%9A%84%E5%BF%AB%E4%B9%90%E6%9D%80%E6%89%8B%E7%94%9F%E6%B4%BB%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/5810020022c8030698925c7a2d1e9aaf.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/5810020022c8030698925c7a2d1e9aaf.jpg",
      "rate": "8.4",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第2集",
      "createdAt": "2026-09-18T12:25:00.000Z"
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_anime_2",
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
      "updateBadge": "更新至第95集",
      "createdAt": "2026-09-18T04:04:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_3",
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
      "entityId": "ik_latest_anime_4",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_anime_5",
      "title": "关于我转生变成史莱姆这档事第4季",
      "slug": "%E5%85%B3%E4%BA%8E%E6%88%91%E8%BD%AC%E7%94%9F%E5%8F%98%E6%88%90%E5%8F%B2%E8%8E%B1%E5%A7%86%E8%BF%99%E6%A1%A3%E4%BA%8B%E7%AC%AC4%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/9cab2613d89f605a2966a79b6b802908.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/9cab2613d89f605a2966a79b6b802908.jpg",
      "rate": "9.3",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "冒险",
        "剧集"
      ],
      "updateBadge": "更新至第23集",
      "createdAt": "2026-09-18T17:03:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_6",
      "tmdbId": "79481",
      "title": "斗破苍穹年番",
      "slug": "%E6%96%97%E7%A0%B4%E8%8B%8D%E7%A9%B9%E5%B9%B4%E7%95%AA",
      "cover": "https://image.tmdb.org/t/p/w500/oyoahIcdamTXwjIaL3CqZ1v5CLl.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cTCn2EO69SERNfhaezJMoqBom4G.jpg",
      "rate": "8.0",
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
      "entityId": "ik_latest_anime_9",
      "tmdbId": "226045",
      "title": "大主宰年番",
      "slug": "%E5%A4%A7%E4%B8%BB%E5%AE%B0%E5%B9%B4%E7%95%AA",
      "cover": "https://image.tmdb.org/t/p/w500/e9kdsUK01YSa8Ou5tO72QJ0830X.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/geXR29xfEgnkQJbm5TIpSebqzSo.jpg",
      "rate": "9.1",
      "year": "2023",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第91集",
      "createdAt": "2026-09-18T02:53:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_10",
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
      "updateBadge": "更新至第7集",
      "createdAt": "2026-09-17T13:41:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_11",
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
      "entityId": "ik_latest_anime_12",
      "tmdbId": "280049",
      "title": "地狱模式 喜欢速通游戏的玩家在废设定异世界无双第2季",
      "slug": "%E5%9C%B0%E7%8B%B1%E6%A8%A1%E5%BC%8F-%E5%96%9C%E6%AC%A2%E9%80%9F%E9%80%9A%E6%B8%B8%E6%88%8F%E7%9A%84%E7%8E%A9%E5%AE%B6%E5%9C%A8%E5%BA%9F%E8%AE%BE%E5%AE%9A%E5%BC%82%E4%B8%96%E7%95%8C%E6%97%A0%E5%8F%8C%E7%AC%AC2%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/2z8wbBH2r4JZMyhC2ruKnxwTjlg.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/gf62V8UBVBMFPpD9yI0UFvkFvq2.jpg",
      "rate": "7.4",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "魔幻",
        "剧集"
      ],
      "updateBadge": "更新至第11集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_anime_13",
      "tmdbId": "303287",
      "title": "一斩苍穹",
      "slug": "%E4%B8%80%E6%96%A9%E8%8B%8D%E7%A9%B9",
      "cover": "https://image.tmdb.org/t/p/w500/7rDjnBLbJhFN6oLE2uVd9bDx0bU.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cU5PAnxXY9DWStsZ0HsFhq4SHWr.jpg",
      "rate": "9.0",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_anime_15",
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
      "entityId": "ik_latest_anime_16",
      "tmdbId": "46260",
      "title": "火影忍者",
      "slug": "%E7%81%AB%E5%BD%B1%E5%BF%8D%E8%80%85",
      "cover": "https://image.tmdb.org/t/p/w500/1K8RFGwiXIWdmaBRcgru3YUAXAt.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/5F0HVEgkgP99fEWDjPyikGt9jQi.jpg",
      "rate": "8.4",
      "year": "2002",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "全220集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_anime_17",
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
      "entityId": "ik_latest_anime_18",
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
    },
    {
      "entityId": "ik_latest_anime_19",
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
      "entityId": "ik_latest_anime_20",
      "tmdbId": "304571",
      "title": "死灵法师我即是天灾",
      "slug": "%E6%AD%BB%E7%81%B5%E6%B3%95%E5%B8%88%E6%88%91%E5%8D%B3%E6%98%AF%E5%A4%A9%E7%81%BE",
      "cover": "https://image.tmdb.org/t/p/w500/ogSBOrpx5g5neD7r9nmbXaVyx1n.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2PK8olplzWII2xk3ve8LB29rUKb.jpg",
      "rate": "8.6",
      "year": "2024",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "冒险",
        "剧集"
      ],
      "updateBadge": "更新至第19集",
      "createdAt": "2026-09-18T03:51:00.000Z"
    }
  ],
  "variety": [
    {
      "entityId": "ik_latest_variety_1",
      "title": "花儿与少年第8季",
      "slug": "%E8%8A%B1%E5%84%BF%E4%B8%8E%E5%B0%91%E5%B9%B4%E7%AC%AC8%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/f8063f1b0b35246aaecc6911f3981d81.jpg",
      "rate": "8.2",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第2期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_2",
      "title": "披荆斩棘2026",
      "slug": "%E6%8A%AB%E8%8D%86%E6%96%A9%E6%A3%982026",
      "cover": "https://img.guangsuimage.com/cover/2eea2ab420e3cde52f34fd7cc5d341ee.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/2eea2ab420e3cde52f34fd7cc5d341ee.jpg",
      "rate": "8.4",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "三公小考",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_3",
      "title": "心动的信号第9季",
      "slug": "%E5%BF%83%E5%8A%A8%E7%9A%84%E4%BF%A1%E5%8F%B7%E7%AC%AC9%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/bc6f1f3779c04d2b142bc35d69bd3474.jpg",
      "rate": "8.9",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第7期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_4",
      "title": "一饭封神第2季",
      "slug": "%E4%B8%80%E9%A5%AD%E5%B0%81%E7%A5%9E%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/5a2dfbb1d96bc21ce0b959097117d2e0.jpg",
      "rate": "8.9",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第8期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_5",
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
      "updateBadge": "第6期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_6",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_7",
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
      "updateBadge": "第6期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_8",
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
      "updateBadge": "第9期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_9",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_10",
      "title": "梦想改造家2026",
      "slug": "%E6%A2%A6%E6%83%B3%E6%94%B9%E9%80%A0%E5%AE%B62026",
      "cover": "https://img.guangsuimage.com/cover/7464328a7e964400a71614ddaa3c39fc.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/7464328a7e964400a71614ddaa3c39fc.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第1期会员版",
      "createdAt": "2026-09-18T15:09:00.000Z"
    },
    {
      "entityId": "ik_latest_variety_11",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_13",
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
      "updateBadge": "总决赛纯享",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_14",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
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
      "updateBadge": "20260918(抢先逛",
      "createdAt": "2026-09-18T06:32:00.000Z"
    },
    {
      "entityId": "ik_latest_variety_16",
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
      "entityId": "ik_latest_variety_17",
      "tmdbId": "327830",
      "title": "宇宙年糕店",
      "slug": "%E5%AE%87%E5%AE%99%E5%B9%B4%E7%B3%95%E5%BA%97",
      "cover": "https://image.tmdb.org/t/p/w500/dp8lfZ4iRErqgQzFufNuFAgC8G4.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/v1DTZRkobEWloLKQ70xUA2sExTJ.jpg",
      "rate": "8.5",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第7期",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_18",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_19",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_variety_20",
      "title": "密室大逃脱大神版第8季",
      "slug": "%E5%AF%86%E5%AE%A4%E5%A4%A7%E9%80%83%E8%84%B1%E5%A4%A7%E7%A5%9E%E7%89%88%E7%AC%AC8%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/40a862df96c3aaee56ff5f2c750de8c1.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/40a862df96c3aaee56ff5f2c750de8c1.jpg",
      "rate": "9.2",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "已完结",
      "createdAt": "2026-09-18T20:49:36.204Z"
    }
  ],
  "documentary": [
    {
      "entityId": "ik_latest_documentary_1",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_2",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_3",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_4",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_5",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_6",
      "tmdbId": "238459",
      "title": "古代战场",
      "slug": "%E5%8F%A4%E4%BB%A3%E6%88%98%E5%9C%BA",
      "cover": "https://image.tmdb.org/t/p/w500/biJu38BppQudTFrDHljKkt0RMTz.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/80yh2yBEdEjABFMfJ0dyUTJh4La.jpg",
      "rate": "8.6",
      "year": "2022",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "军事",
        "剧集"
      ],
      "updateBadge": "更新至第18集",
      "createdAt": "2022-08-22T13:59:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_7",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_9",
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
      "entityId": "ik_latest_documentary_10",
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
      "entityId": "ik_latest_documentary_11",
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
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_12",
      "title": "风味人间第5季",
      "slug": "%E9%A3%8E%E5%91%B3%E4%BA%BA%E9%97%B4%E7%AC%AC5%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/6440e1d36d864f933925761f6cfbd8ee.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/6440e1d36d864f933925761f6cfbd8ee.jpg",
      "rate": "9.2",
      "year": "2024",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "更新至第5集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_13",
      "title": "风味人间第4季·谷物星球",
      "slug": "%E9%A3%8E%E5%91%B3%E4%BA%BA%E9%97%B4%E7%AC%AC4%E5%AD%A3-%E8%B0%B7%E7%89%A9%E6%98%9F%E7%90%83",
      "cover": "https://img.guangsuimage.com/cover/c3d13b69cd6a2c973f265ad845bcbbaf.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/c3d13b69cd6a2c973f265ad845bcbbaf.jpg",
      "rate": "9.4",
      "year": "2022",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "其它",
        "剧集"
      ],
      "updateBadge": "更新至第5集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_14",
      "tmdbId": "138304",
      "title": "紫禁城",
      "slug": "%E7%B4%AB%E7%A6%81%E5%9F%8E",
      "cover": "https://image.tmdb.org/t/p/w500/jVz1zJ5KpgCVXR4t3nlfp97Komf.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/gcAwTuIs86OWs2Nx4StlfcfIAOT.jpg",
      "rate": "9.0",
      "year": "2021",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "历史",
        "剧集"
      ],
      "updateBadge": "正片",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_15",
      "tmdbId": "2942",
      "title": "王朝",
      "slug": "%E7%8E%8B%E6%9C%9D",
      "cover": "https://image.tmdb.org/t/p/w500/7pdeNK1CUqj1yuG9VMDeynnq9xK.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cKsmzu5YpayNxc6Gs9KD8wyJV8M.jpg",
      "rate": "7.8",
      "year": "2007",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "自然",
        "剧集"
      ],
      "updateBadge": "全3集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_16",
      "tmdbId": "247723",
      "title": "猎捕",
      "slug": "%E7%8C%8E%E6%8D%95",
      "cover": "https://image.tmdb.org/t/p/w500/mjJMOLr966Q78YUPu0pVA0ydBIP.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/9g5Lv52RSZ36R3NzmiNeTJ9f2fU.jpg",
      "rate": "7.2",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "自然",
        "剧集"
      ],
      "updateBadge": "全13集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_17",
      "title": "大明帝国第2季",
      "slug": "%E5%A4%A7%E6%98%8E%E5%B8%9D%E5%9B%BD%E7%AC%AC2%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/7d8c2c4c2c87f597e658ec3b1bf35067.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/7d8c2c4c2c87f597e658ec3b1bf35067.jpg",
      "rate": "6.0",
      "year": "2024",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "历史",
        "剧集"
      ],
      "updateBadge": "全9集",
      "createdAt": "2026-09-18T20:49:36.204Z"
    },
    {
      "entityId": "ik_latest_documentary_18",
      "title": "古代战场第2季",
      "slug": "%E5%8F%A4%E4%BB%A3%E6%88%98%E5%9C%BA%E7%AC%AC2%E5%AD%A3",
      "cover": "https://ok.zuidapic.com/upload/vod/20230901-1/a0e20c5c668061533b9571914bf8ca45.jpg",
      "backdrop": "https://ok.zuidapic.com/upload/vod/20230901-1/a0e20c5c668061533b9571914bf8ca45.jpg",
      "rate": "7.0",
      "year": "2023",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "历史",
        "剧集"
      ],
      "updateBadge": "第21集智取官渡",
      "createdAt": "2023-03-22T19:09:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_19",
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
      "updateBadge": "帝制的终结",
      "createdAt": "2017-06-24T17:27:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_20",
      "title": "一级方程式：疾速争胜第8季",
      "slug": "%E4%B8%80%E7%BA%A7%E6%96%B9%E7%A8%8B%E5%BC%8F-%E7%96%BE%E9%80%9F%E4%BA%89%E8%83%9C%E7%AC%AC8%E5%AD%A3",
      "cover": "https://img.guangsuimage.com/cover/8b0d529874ff99349e6ccff0393b0be8.jpg",
      "backdrop": "https://img.guangsuimage.com/cover/8b0d529874ff99349e6ccff0393b0be8.jpg",
      "rate": "7.7",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "其它",
        "剧集"
      ],
      "updateBadge": "更新至第8集",
      "createdAt": "2026-02-28T22:09:00.000Z"
    }
  ]
};
