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
      "updateBadge": "更新至第12集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_2",
      "title": "心动的信号第9季",
      "slug": "%E5%BF%83%E5%8A%A8%E7%9A%84%E4%BF%A1%E5%8F%B7%E7%AC%AC9%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "第7期",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_3",
      "tmdbId": "299952",
      "title": "早春晴朗",
      "slug": "%E6%97%A9%E6%98%A5%E6%99%B4%E6%9C%97",
      "cover": "https://image.tmdb.org/t/p/w500/nLWFbYv1r99Yy7dWvjoxMRegoe0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oUFUvEMCBP80e4eYsfVfxC8n7ih.jpg",
      "rate": "8.2",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-15T12:12:32.731Z"
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
      "updateBadge": "更新至第11集",
      "createdAt": "2026-09-15T03:45:00.000Z"
    },
    {
      "entityId": "ik_latest_all_5",
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
      "updateBadge": "更新至第22集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_6",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_7",
      "tmdbId": "286988",
      "title": "飞到我心上",
      "slug": "%E9%A3%9E%E5%88%B0%E6%88%91%E5%BF%83%E4%B8%8A",
      "cover": "https://image.tmdb.org/t/p/w500/vnaO6MJVrGUb0DBqFpUy3K1j0KC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/aYtWVJ5mUkPRFghrCHbc3I2v4WE.jpg",
      "rate": "8.3",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_8",
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
      "updateBadge": "更新至第16集",
      "createdAt": "2026-09-14T07:29:00.000Z"
    },
    {
      "entityId": "ik_latest_all_9",
      "tmdbId": "331912",
      "title": "死有对证",
      "slug": "%E6%AD%BB%E6%9C%89%E5%AF%B9%E8%AF%81",
      "cover": "https://image.tmdb.org/t/p/w500/mRDJwZJluve4ETbWn5Oqify9EPh.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zjdyowR7sH4upiKoAnTiAhg55Iy.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第06集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_10",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_11",
      "title": "花儿与少年第8季",
      "slug": "%E8%8A%B1%E5%84%BF%E4%B8%8E%E5%B0%91%E5%B9%B4%E7%AC%AC8%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.4",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "第5期",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_12",
      "tmdbId": "288873",
      "title": "云雀叫天录",
      "slug": "%E4%BA%91%E9%9B%80%E5%8F%AB%E5%A4%A9%E5%BD%95",
      "cover": "https://image.tmdb.org/t/p/w500/nHAqLcS38jFpNsDRI0mZLIUmRVI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ptn62KJ5n96MCVKiXVxRdhbn5BG.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第7集",
      "createdAt": "2026-09-14T23:56:00.000Z"
    },
    {
      "entityId": "ik_latest_all_13",
      "title": "披荆斩棘2026",
      "slug": "%E6%8A%AB%E8%8D%86%E6%96%A9%E6%A3%982026",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "真人秀",
        "电影"
      ],
      "updateBadge": "三公小考",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_14",
      "tmdbId": "223911",
      "title": "仙逆",
      "slug": "%E4%BB%99%E9%80%86",
      "cover": "https://image.tmdb.org/t/p/w500/mCt5qgkOYEvuHSiSwNByMv6LMoB.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/crn53sSGWRZ8wAtEGso52nepEkz.jpg",
      "rate": "8.2",
      "year": "2023",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第158集",
      "createdAt": "2026-09-13T06:38:00.000Z"
    },
    {
      "entityId": "ik_latest_all_15",
      "tmdbId": "303287",
      "title": "一斩苍穹",
      "slug": "%E4%B8%80%E6%96%A9%E8%8B%8D%E7%A9%B9",
      "cover": "https://image.tmdb.org/t/p/w500/7rDjnBLbJhFN6oLE2uVd9bDx0bU.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/cU5PAnxXY9DWStsZ0HsFhq4SHWr.jpg",
      "rate": "10.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "魔幻",
        "剧集"
      ],
      "updateBadge": "更新至第9集",
      "createdAt": "2026-09-14T21:39:00.000Z"
    },
    {
      "entityId": "ik_latest_all_16",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_17",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_18",
      "tmdbId": "1101383",
      "title": "逃出绝命街",
      "slug": "%E9%80%83%E5%87%BA%E7%BB%9D%E5%91%BD%E8%A1%97",
      "cover": "https://image.tmdb.org/t/p/w500/2eXquFgtDqSyVmrcBwC9ZnzNw3d.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/b9q9VmbXDvJmTziRqkwdEmFdwhr.jpg",
      "rate": "6.5",
      "year": "2026",
      "type": "movie",
      "channelKey": "all",
      "genres": [
        "动作",
        "电影"
      ],
      "updateBadge": "正片",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_all_19",
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
      "createdAt": "2026-09-11T22:43:00.000Z"
    },
    {
      "entityId": "ik_latest_all_20",
      "tmdbId": "101172",
      "title": "吞噬星空",
      "slug": "%E5%90%9E%E5%99%AC%E6%98%9F%E7%A9%BA",
      "cover": "https://image.tmdb.org/t/p/w500/dShQsQFLSivwCIRjC7crsnznPXY.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/lDVOl7wTFUIqwlSrWsGjBCHt3fQ.jpg",
      "rate": "8.5",
      "year": "2020",
      "type": "tv",
      "channelKey": "all",
      "genres": [
        "科幻",
        "剧集"
      ],
      "updateBadge": "更新至第241集",
      "createdAt": "2026-09-14T06:48:00.000Z"
    }
  ],
  "movie": [
    {
      "entityId": "ik_latest_movie_1",
      "tmdbId": "1101383",
      "title": "逃出绝命街",
      "slug": "%E9%80%83%E5%87%BA%E7%BB%9D%E5%91%BD%E8%A1%97",
      "cover": "https://image.tmdb.org/t/p/w500/2eXquFgtDqSyVmrcBwC9ZnzNw3d.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/b9q9VmbXDvJmTziRqkwdEmFdwhr.jpg",
      "rate": "6.5",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "动作",
        "电影"
      ],
      "updateBadge": "正片",
      "createdAt": "2026-09-15T12:12:32.731Z"
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
      "updateBadge": "1080P超清",
      "createdAt": "2026-08-31T04:39:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_3",
      "tmdbId": "1671548",
      "title": "给阿嬷的情书",
      "slug": "%E7%BB%99%E9%98%BF%E5%AC%B7%E7%9A%84%E6%83%85%E4%B9%A6",
      "cover": "https://image.tmdb.org/t/p/w500/s0sC3hPPX4OobLNfdl2iSs2vtvI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/AwmlL79nKTcX5tzAhyoV298xXlz.jpg",
      "rate": "8.9",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "576P",
      "createdAt": "2026-08-31T04:19:00.000Z"
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
      "createdAt": "2026-09-04T04:44:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_5",
      "tmdbId": "1765955",
      "title": "蜂鸟行动",
      "slug": "%E8%9C%82%E9%B8%9F%E8%A1%8C%E5%8A%A8",
      "cover": "https://image.tmdb.org/t/p/w500/oZXH2DonlPsDVPBTIy5gQxBZLcU.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/oZXH2DonlPsDVPBTIy5gQxBZLcU.jpg",
      "rate": "4.0",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "网络电影",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-09-12T05:15:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_6",
      "tmdbId": "1241918",
      "title": "出入平安",
      "slug": "%E5%87%BA%E5%85%A5%E5%B9%B3%E5%AE%89",
      "cover": "https://image.tmdb.org/t/p/w500/dEBGIgF3mjHHEozd2VMcrbTP6g1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/d9BG2RvTNKvsCl7wEfazTEtrXJz.jpg",
      "rate": "7.0",
      "year": "2024",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-09-10T21:17:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_7",
      "tmdbId": "1108427",
      "title": "海洋奇缘：启航",
      "slug": "%E6%B5%B7%E6%B4%8B%E5%A5%87%E7%BC%98-%E5%90%AF%E8%88%AA",
      "cover": "https://image.tmdb.org/t/p/w500/8f4OJJrMtZcoB4h1BLyyZewd96X.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/c6BPbkO5Npt1OdwttAxCFo06wtH.jpg",
      "rate": "7.2",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "喜剧",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-09-08T08:57:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_8",
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
      "createdAt": "2026-08-29T07:52:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_9",
      "tmdbId": "1137844",
      "title": "求救信号",
      "slug": "%E6%B1%82%E6%95%91%E4%BF%A1%E5%8F%B7",
      "cover": "https://image.tmdb.org/t/p/w500/6MzhVjAgqj4mA0FjzoECcBlLMB7.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/g7Ccid5kuD7A8hXWlsQiNfwOxaD.jpg",
      "rate": "7.9",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "动作",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-09-04T08:02:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_10",
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
      "createdAt": "2026-09-10T06:40:00.000Z"
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
      "createdAt": "2026-08-25T12:57:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_12",
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
      "createdAt": "2026-08-28T05:57:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_13",
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
      "createdAt": "2026-08-17T17:53:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_14",
      "title": "百分之十",
      "slug": "%E7%99%BE%E5%88%86%E4%B9%8B%E5%8D%81",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "6.8",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "720P",
      "createdAt": "2026-09-10T09:08:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_15",
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
      "createdAt": "2026-07-24T04:34:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_16",
      "title": "邻人可疑",
      "slug": "%E9%82%BB%E4%BA%BA%E5%8F%AF%E7%96%91",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.4",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "剧情",
        "电影"
      ],
      "updateBadge": "2160P",
      "createdAt": "2026-08-20T05:07:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_17",
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
      "createdAt": "2026-09-02T04:19:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_18",
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
      "createdAt": "2026-09-09T09:11:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_19",
      "tmdbId": "13899",
      "title": "逃亡者",
      "slug": "%E9%80%83%E4%BA%A1%E8%80%85",
      "cover": "https://image.tmdb.org/t/p/w500/m2T8lXo6gjMcnTG7aHPzmZC8L7B.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/xxXDo6LGKsHcOKhnFB6zXlwetYo.jpg",
      "rate": "6.8",
      "year": "2000",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "动作",
        "电影"
      ],
      "updateBadge": "1080P超清",
      "createdAt": "2026-09-02T08:10:00.000Z"
    },
    {
      "entityId": "ik_latest_movie_20",
      "tmdbId": "1315772",
      "title": "小黄人与大怪兽",
      "slug": "%E5%B0%8F%E9%BB%84%E4%BA%BA%E4%B8%8E%E5%A4%A7%E6%80%AA%E5%85%BD",
      "cover": "https://image.tmdb.org/t/p/w500/y4JWxHZ1dMisqbHhX7ytOAK3wwv.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/kkcwhgSFd81QDlXo8ytrpHPQjhy.jpg",
      "rate": "7.6",
      "year": "2026",
      "type": "movie",
      "channelKey": "movie",
      "genres": [
        "动画",
        "电影"
      ],
      "updateBadge": "更新至第1集",
      "createdAt": "2026-08-12T07:28:00.000Z"
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
      "updateBadge": "更新至第12集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_2",
      "tmdbId": "299952",
      "title": "早春晴朗",
      "slug": "%E6%97%A9%E6%98%A5%E6%99%B4%E6%9C%97",
      "cover": "https://image.tmdb.org/t/p/w500/nLWFbYv1r99Yy7dWvjoxMRegoe0.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/oUFUvEMCBP80e4eYsfVfxC8n7ih.jpg",
      "rate": "8.2",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_3",
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
      "updateBadge": "更新至第11集",
      "createdAt": "2026-09-15T03:45:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_4",
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
      "updateBadge": "更新至第22集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_5",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_6",
      "tmdbId": "286988",
      "title": "飞到我心上",
      "slug": "%E9%A3%9E%E5%88%B0%E6%88%91%E5%BF%83%E4%B8%8A",
      "cover": "https://image.tmdb.org/t/p/w500/vnaO6MJVrGUb0DBqFpUy3K1j0KC.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/aYtWVJ5mUkPRFghrCHbc3I2v4WE.jpg",
      "rate": "8.3",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全24集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_7",
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
      "updateBadge": "更新至第16集",
      "createdAt": "2026-09-14T07:29:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_8",
      "tmdbId": "331912",
      "title": "死有对证",
      "slug": "%E6%AD%BB%E6%9C%89%E5%AF%B9%E8%AF%81",
      "cover": "https://image.tmdb.org/t/p/w500/mRDJwZJluve4ETbWn5Oqify9EPh.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/zjdyowR7sH4upiKoAnTiAhg55Iy.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第06集",
      "createdAt": "2026-09-15T12:12:32.731Z"
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_10",
      "tmdbId": "288873",
      "title": "云雀叫天录",
      "slug": "%E4%BA%91%E9%9B%80%E5%8F%AB%E5%A4%A9%E5%BD%95",
      "cover": "https://image.tmdb.org/t/p/w500/nHAqLcS38jFpNsDRI0mZLIUmRVI.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/ptn62KJ5n96MCVKiXVxRdhbn5BG.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第7集",
      "createdAt": "2026-09-14T23:56:00.000Z"
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_12",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_13",
      "tmdbId": "314939",
      "title": "不是你的恋爱",
      "slug": "%E4%B8%8D%E6%98%AF%E4%BD%A0%E7%9A%84%E6%81%8B%E7%88%B1",
      "cover": "https://image.tmdb.org/t/p/w500/2JA4ntjtFZiL5E2TnvCwG3Rf3c1.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/moUjiEzpJVNZc7hyNRBbLPt0CPX.jpg",
      "rate": "8.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第2集",
      "createdAt": "2026-09-13T10:42:00.000Z"
    },
    {
      "entityId": "ik_latest_tv_14",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_15",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_16",
      "tmdbId": "295599",
      "title": "御廷谣",
      "slug": "%E5%BE%A1%E5%BB%B7%E8%B0%A3",
      "cover": "https://image.tmdb.org/t/p/w500/v8Giwuf0l0XKoD29kWb9RSxiYku.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/qKGSZaLLbfCaoTbE88oOwdAsTm8.jpg",
      "rate": "7.8",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "爱情",
        "剧集"
      ],
      "updateBadge": "全32集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_17",
      "tmdbId": "272938",
      "title": "师兄太稳健",
      "slug": "%E5%B8%88%E5%85%84%E5%A4%AA%E7%A8%B3%E5%81%A5",
      "cover": "https://image.tmdb.org/t/p/w500/lqPc3hI2HRlDb0afjx3bB5NNYWy.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/8zsKL8gDjv7NI7HHk4POIBMl2jE.jpg",
      "rate": "8.7",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "全30集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_18",
      "tmdbId": "294636",
      "title": "中头奖还是要上班",
      "slug": "%E4%B8%AD%E5%A4%B4%E5%A5%96%E8%BF%98%E6%98%AF%E8%A6%81%E4%B8%8A%E7%8F%AD",
      "cover": "https://image.tmdb.org/t/p/w500/iit1tcgJFXlsrBoif3G1HLJFAXs.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/2vN1SjkpXT6oCBxeE9GOK5NVS2b.jpg",
      "rate": "10.0",
      "year": "2026",
      "type": "tv",
      "channelKey": "tv",
      "genres": [
        "剧情",
        "剧集"
      ],
      "updateBadge": "更新至第2集",
      "createdAt": "2026-09-10T09:35:00.000Z"
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_tv_20",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
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
      "rate": "8.2",
      "year": "2023",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第158集",
      "createdAt": "2026-09-13T06:38:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_2",
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
      "createdAt": "2026-09-14T21:39:00.000Z"
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
      "createdAt": "2026-09-11T22:43:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_4",
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
      "createdAt": "2026-09-14T06:48:00.000Z"
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_anime_6",
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
      "createdAt": "2026-09-12T22:51:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_7",
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
      "createdAt": "2026-09-12T06:35:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_8",
      "tmdbId": "110181",
      "title": "武神主宰",
      "slug": "%E6%AD%A6%E7%A5%9E%E4%B8%BB%E5%AE%B0",
      "cover": "https://image.tmdb.org/t/p/w500/ihVkKv0QBPK8kf8SUajc4cK1Km6.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/iWS5Z9wsQT8hC0HYAUN6WXLmFNP.jpg",
      "rate": "7.4",
      "year": "2020",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第692集",
      "createdAt": "2026-09-14T23:51:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_9",
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
      "createdAt": "2026-09-11T21:33:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_10",
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
      "createdAt": "2026-09-10T21:30:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_11",
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
        "其它",
        "剧集"
      ],
      "updateBadge": "更新至第377集",
      "createdAt": "2026-09-14T21:22:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_12",
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
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第483集",
      "createdAt": "2026-09-14T22:37:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_13",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_anime_15",
      "tmdbId": "326695",
      "title": "择日飞升",
      "slug": "%E6%8B%A9%E6%97%A5%E9%A3%9E%E5%8D%87",
      "cover": "https://image.tmdb.org/t/p/w500/5NKojVuw2Jf0dT9nSgGPlLiBQV5.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/yUqwbhTCHEKAAZquPqgLAZXgaUF.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "魔幻",
        "剧集"
      ],
      "updateBadge": "更新至第11集",
      "createdAt": "2026-09-11T20:23:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_16",
      "title": "死神：千年血战篇第4季",
      "slug": "%E6%AD%BB%E7%A5%9E-%E5%8D%83%E5%B9%B4%E8%A1%80%E6%88%98%E7%AF%87%E7%AC%AC4%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.4",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第8集",
      "createdAt": "2026-09-12T10:34:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_17",
      "title": "诛仙4",
      "slug": "%E8%AF%9B%E4%BB%994",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.3",
      "year": "2026",
      "type": "anime",
      "channelKey": "anime",
      "genres": [
        "热血",
        "剧集"
      ],
      "updateBadge": "更新至第6集",
      "createdAt": "2026-09-10T06:42:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_18",
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
      "updateBadge": "更新至第158集",
      "createdAt": "2026-09-08T21:37:00.000Z"
    },
    {
      "entityId": "ik_latest_anime_19",
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
      "updateBadge": "更新至第03集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_anime_20",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    }
  ],
  "variety": [
    {
      "entityId": "ik_latest_variety_1",
      "title": "心动的信号第9季",
      "slug": "%E5%BF%83%E5%8A%A8%E7%9A%84%E4%BF%A1%E5%8F%B7%E7%AC%AC9%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.8",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第7期",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_2",
      "title": "花儿与少年第8季",
      "slug": "%E8%8A%B1%E5%84%BF%E4%B8%8E%E5%B0%91%E5%B9%B4%E7%AC%AC8%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.4",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第5期",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_3",
      "title": "披荆斩棘2026",
      "slug": "%E6%8A%AB%E8%8D%86%E6%96%A9%E6%A3%982026",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.6",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "三公小考",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_4",
      "title": "一饭封神第2季",
      "slug": "%E4%B8%80%E9%A5%AD%E5%B0%81%E7%A5%9E%E7%AC%AC2%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.9",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第7期",
      "createdAt": "2026-09-14T23:01:00.000Z"
    },
    {
      "entityId": "ik_latest_variety_5",
      "title": "密室大逃脱第8季",
      "slug": "%E5%AF%86%E5%AE%A4%E5%A4%A7%E9%80%83%E8%84%B1%E7%AC%AC8%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.2",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第9期",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_6",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_7",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_8",
      "title": "我家那闺女2026",
      "slug": "%E6%88%91%E5%AE%B6%E9%82%A3%E9%97%BA%E5%A5%B32026",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.1",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第3期",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_9",
      "title": "地球超新鲜第2季",
      "slug": "%E5%9C%B0%E7%90%83%E8%B6%85%E6%96%B0%E9%B2%9C%E7%AC%AC2%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.4",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第2期",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_10",
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
      "createdAt": "2026-09-13T23:45:00.000Z"
    },
    {
      "entityId": "ik_latest_variety_11",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_12",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_13",
      "title": "脱口秀和Ta的朋友们第3季",
      "slug": "%E8%84%B1%E5%8F%A3%E7%A7%80%E5%92%8Cta%E7%9A%84%E6%9C%8B%E5%8F%8B%E4%BB%AC%E7%AC%AC3%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.1",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "脱口秀",
        "剧集"
      ],
      "updateBadge": "穷门永存纯享",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_14",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_15",
      "title": "喜剧之王单口季第3季",
      "slug": "%E5%96%9C%E5%89%A7%E4%B9%8B%E7%8E%8B%E5%8D%95%E5%8F%A3%E5%AD%A3%E7%AC%AC3%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.1",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "飞行气氛组特辑",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_16",
      "tmdbId": "137726",
      "title": "毛雪汪",
      "slug": "%E6%AF%9B%E9%9B%AA%E6%B1%AA",
      "cover": "https://image.tmdb.org/t/p/w500/biarmEDDU3W5WSxCo8rYsykPOpP.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3UtKvTXlqLNHoADgkKxdj5QppPN.jpg",
      "rate": "8.8",
      "year": "2021",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第155期",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_17",
      "title": "密室大逃脱大神版第8季",
      "slug": "%E5%AF%86%E5%AE%A4%E5%A4%A7%E9%80%83%E8%84%B1%E5%A4%A7%E7%A5%9E%E7%89%88%E7%AC%AC8%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.1",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "已完结",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_variety_18",
      "title": "打歌2026",
      "slug": "%E6%89%93%E6%AD%8C2026",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "6.0",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第1期",
      "createdAt": "2026-09-12T23:39:00.000Z"
    },
    {
      "entityId": "ik_latest_variety_19",
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
      "createdAt": "2024-02-07T02:17:00.000Z"
    },
    {
      "entityId": "ik_latest_variety_20",
      "title": "开始推理吧第4季",
      "slug": "%E5%BC%80%E5%A7%8B%E6%8E%A8%E7%90%86%E5%90%A7%E7%AC%AC4%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.4",
      "year": "2026",
      "type": "variety",
      "channelKey": "variety",
      "genres": [
        "真人秀",
        "剧集"
      ],
      "updateBadge": "第2期",
      "createdAt": "2026-09-15T12:12:32.731Z"
    }
  ],
  "documentary": [
    {
      "entityId": "ik_latest_documentary_1",
      "title": "克拉克森的农场第1季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC1%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.7",
      "year": "2021",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "人物",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_2",
      "title": "克拉克森的农场第5季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC5%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "10.0",
      "year": "2026",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_3",
      "title": "克拉克森的农场第4季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC4%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "10.0",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_4",
      "title": "守护解放西第6季",
      "slug": "%E5%AE%88%E6%8A%A4%E8%A7%A3%E6%94%BE%E8%A5%BF%E7%AC%AC6%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.4",
      "year": "2025",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "人物",
        "剧集"
      ],
      "updateBadge": "更新至第10集",
      "createdAt": "2025-12-05T06:41:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_5",
      "title": "克拉克森的农场第3季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC3%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "10.0",
      "year": "2024",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_6",
      "title": "克拉克森的农场第2季",
      "slug": "%E5%85%8B%E6%8B%89%E5%85%8B%E6%A3%AE%E7%9A%84%E5%86%9C%E5%9C%BA%E7%AC%AC2%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.9",
      "year": "2023",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "人物",
        "剧集"
      ],
      "updateBadge": "全8集",
      "createdAt": "2026-09-15T12:12:32.731Z"
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_8",
      "tmdbId": "232345",
      "title": "国宝里的中国故事",
      "slug": "%E5%9B%BD%E5%AE%9D%E9%87%8C%E7%9A%84%E4%B8%AD%E5%9B%BD%E6%95%85%E4%BA%8B",
      "cover": "https://image.tmdb.org/t/p/w500/gYxzbtudMY9SJosNJnSRhVNE7nv.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/gYxzbtudMY9SJosNJnSRhVNE7nv.jpg",
      "rate": "8.6",
      "year": "2023",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "更新至第6集",
      "createdAt": "2023-06-17T06:54:00.000Z"
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_10",
      "title": "早餐中国第2季",
      "slug": "%E6%97%A9%E9%A4%90%E4%B8%AD%E5%9B%BD%E7%AC%AC2%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "6.7",
      "year": "2019",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "更新至第30集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_11",
      "tmdbId": "93229",
      "title": "早餐中国",
      "slug": "%E6%97%A9%E9%A4%90%E4%B8%AD%E5%9B%BD",
      "cover": "https://image.tmdb.org/t/p/w500/mZKlMrdl7rOIYQTbN9CFWQyDm38.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/3kWqT4b1xaudM3m5Xvhbm1YqMla.jpg",
      "rate": "8.0",
      "year": "2019",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "更新至第30集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_12",
      "tmdbId": "38956",
      "title": "海豚湾",
      "slug": "%E6%B5%B7%E8%B1%9A%E6%B9%BE",
      "cover": "https://image.tmdb.org/t/p/w500/bR1hMo9UQ1u3qCLb7ZF80wdQtS.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/uOeWAVt7zTit5o9JKigFUQzNPmP.jpg",
      "rate": "8.0",
      "year": "2003",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "自然",
        "剧集"
      ],
      "updateBadge": "正片",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_13",
      "tmdbId": "279093",
      "title": "直击罪案现场",
      "slug": "%E7%9B%B4%E5%87%BB%E7%BD%AA%E6%A1%88%E7%8E%B0%E5%9C%BA",
      "cover": "https://image.tmdb.org/t/p/w500/uBpdZmuEFX3d50hChHKacZOIdRJ.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/uBpdZmuEFX3d50hChHKacZOIdRJ.jpg",
      "rate": "8.6",
      "year": "2024",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "其它",
        "剧集"
      ],
      "updateBadge": "更新至第10集",
      "createdAt": "2025-01-06T07:07:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_14",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_15",
      "title": "河中巨怪第1-9季",
      "slug": "%E6%B2%B3%E4%B8%AD%E5%B7%A8%E6%80%AA%E7%AC%AC1-9%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "8.4",
      "year": "2020",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "自然",
        "剧集"
      ],
      "updateBadge": "第7期",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_16",
      "title": "舌尖上的中国第3季",
      "slug": "%E8%88%8C%E5%B0%96%E4%B8%8A%E7%9A%84%E4%B8%AD%E5%9B%BD%E7%AC%AC3%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "6.8",
      "year": "2018",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "文化",
        "剧集"
      ],
      "updateBadge": "更新至第7集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_17",
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
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_18",
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
      "createdAt": "2025-06-20T00:15:00.000Z"
    },
    {
      "entityId": "ik_latest_documentary_19",
      "title": "守护解放西第5季",
      "slug": "%E5%AE%88%E6%8A%A4%E8%A7%A3%E6%94%BE%E8%A5%BF%E7%AC%AC5%E5%AD%A3",
      "cover": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w500/placeholder.jpg",
      "rate": "9.3",
      "year": "2024",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "其它",
        "剧集"
      ],
      "updateBadge": "全10集",
      "createdAt": "2026-09-15T12:12:32.731Z"
    },
    {
      "entityId": "ik_latest_documentary_20",
      "tmdbId": "260264",
      "title": "流行星学院：KATSEYE",
      "slug": "%E6%B5%81%E8%A1%8C%E6%98%9F%E5%AD%A6%E9%99%A2-katseye",
      "cover": "https://image.tmdb.org/t/p/w500/eWPe0nRouV0JHgld0aMXgNbuOV8.jpg",
      "backdrop": "https://image.tmdb.org/t/p/w1280/w4WpKIQ60HgcqgNUPwecwsoeP00.jpg",
      "rate": "7.7",
      "year": "2024",
      "type": "documentary",
      "channelKey": "documentary",
      "genres": [
        "其它",
        "剧集"
      ],
      "updateBadge": "更新至第8集",
      "createdAt": "2024-08-21T07:18:00.000Z"
    }
  ]
};
