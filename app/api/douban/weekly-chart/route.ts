import { NextResponse } from 'next/server';

export const runtime = 'edge';

const TMDB_API_KEY = process.env.TMDB_API_KEY || '82eaf0e14803590730e45c2123c90957';
const TMDB_BASE = 'https://api.themoviedb.org/3';

// 预烘焙一周口碑榜托底兜底数据（网络不可达时保障 0ms 瞬间秒出）
const FALLBACK_WEEKLY_MOVIE = [
  {
    id: 'db_w_1',
    title: '奥德赛',
    rate: '8.6',
    cover: 'https://image.tmdb.org/t/p/w500/Aj0Uykxj0vhwVsyrRJka0aM3SP1.jpg',
    year: '2026',
    types: ['动作', '历史', '史诗']
  },
  {
    id: 'db_w_2',
    title: '欢迎来龙餐馆',
    rate: '8.7',
    cover: 'https://image.tmdb.org/t/p/w500/2OJX7udqqpk5c82pXXdL2hnny0D.jpg',
    year: '2026',
    types: ['剧情', '战争']
  },
  {
    id: 'db_w_3',
    title: '抓特务',
    rate: '7.4',
    cover: 'https://image.tmdb.org/t/p/w500/ozQe6oNmGHvwk2zdCQilMikUTBZ.jpg',
    year: '2026',
    types: ['剧情', '悬疑']
  },
  {
    id: 'db_w_4',
    title: '激情邀约',
    rate: '7.4',
    cover: 'https://image.tmdb.org/t/p/w500/3T3FolKgLQtYGcFHUAWRCwCKTsp.jpg',
    year: '2026',
    types: ['喜剧', '爱情']
  },
  {
    id: 'db_w_5',
    title: '无界之环',
    rate: '7.9',
    cover: 'https://image.tmdb.org/t/p/w500/oUgvACOtLKLYMzrUsM0llleYm3E.jpg',
    year: '2025',
    types: ['喜剧', '奇幻']
  },
  {
    id: 'db_w_6',
    title: '女仆日记',
    rate: '7.3',
    cover: 'https://image.tmdb.org/t/p/w500/iKDaYgc0crkad8jlu668Fkk3QaL.jpg',
    year: '2026',
    types: ['剧情', '喜剧']
  },
  {
    id: 'db_w_7',
    title: '凤仙花',
    rate: '7.3',
    cover: 'https://image.tmdb.org/t/p/w500/fZsog59guqRZ4Q2DqKCiLDLuyjz.jpg',
    year: '2025',
    types: ['动画', '治愈']
  },
  {
    id: 'db_w_8',
    title: '伪钞之王',
    rate: '7.2',
    cover: 'https://image.tmdb.org/t/p/w500/urCxdFRLmozhiXJEsSd7H5W0DXb.jpg',
    year: '2025',
    types: ['犯罪', '剧情']
  },
  {
    id: 'db_w_9',
    title: '荣光与暗影',
    rate: '7.4',
    cover: 'https://image.tmdb.org/t/p/w500/1l9mxuDThsc84eUpHyIJcUOTg4f.jpg',
    year: '2026',
    types: ['剧情', '历史']
  },
  {
    id: 'db_w_10',
    title: '一切从头来过',
    rate: '7.1',
    cover: 'https://image.tmdb.org/t/p/w500/rKxnJGcEmHJaYeleqOVqoX2twIa.jpg',
    year: '2025',
    types: ['剧情', '家庭']
  }
];

const FALLBACK_WEEKLY_TV = [
  {
    id: 'db_wt_1',
    title: '开庭',
    rate: '8.6',
    cover: 'https://image.tmdb.org/t/p/w500/1mEuvUMkr8xpQoP8uekuxcE65A6.jpg',
    year: '2026',
    types: ['律政', '剧情']
  },
  {
    id: 'db_wt_2',
    title: '重器',
    rate: '7.3',
    cover: 'https://image.tmdb.org/t/p/w500/43iXOUo8dw7KfllwOnuu8JSyqFt.jpg',
    year: '2026',
    types: ['悬疑', '年代']
  },
  {
    id: 'db_wt_3',
    title: '悬案',
    rate: '7.6',
    cover: 'https://image.tmdb.org/t/p/w500/IgAmsxI2xFxUcHZRvEyEpl1myv.jpg',
    year: '2026',
    types: ['刑侦', '犯罪']
  },
  {
    id: 'db_wt_4',
    title: '日落下的彩虹',
    rate: '8.5',
    cover: 'https://image.tmdb.org/t/p/w500/4PR2COQG4DYJMC60RhURgSIlYtp.jpg',
    year: '2026',
    types: ['剧情', '治愈']
  },
  {
    id: 'db_wt_5',
    title: '花开锦绣',
    rate: '7.1',
    cover: 'https://image.tmdb.org/t/p/w500/erj7cX8aa1jndO9HlmoyRcJNLQL.jpg',
    year: '2026',
    types: ['古装', '爱情']
  },
  {
    id: 'db_wt_6',
    title: '藏锋',
    rate: '6.7',
    cover: 'https://image.tmdb.org/t/p/w500/t0fGmHkylAIDQvG3AtqQk0IpDBa.jpg',
    year: '2026',
    types: ['谍战', '悬疑']
  },
  {
    id: 'db_wt_7',
    title: '问心2',
    rate: '7.5',
    cover: 'https://image.tmdb.org/t/p/w500/oCwfg5xVsUh9Yg4R51DtE1hmKys.jpg',
    year: '2026',
    types: ['医疗', '生活']
  },
  {
    id: 'db_wt_8',
    title: '雀骨',
    rate: '6.9',
    cover: 'https://image.tmdb.org/t/p/w500/858HgKLO9hZkYs2tS7ZPkqh9HVr.jpg',
    year: '2026',
    types: ['古装', '传奇']
  },
  {
    id: 'db_wt_9',
    title: '九门',
    rate: '6.7',
    cover: 'https://image.tmdb.org/t/p/w500/bkyBY4EYv1htCkgmgVNfVrJ7qqW.jpg',
    year: '2026',
    types: ['探险', '悬疑']
  },
  {
    id: 'db_wt_10',
    title: '凛冬下的罪恶',
    rate: '6.9',
    cover: 'https://image.tmdb.org/t/p/w500/8PbjBwbkZgFj8k2bitxMFkllal5.jpg',
    year: '2026',
    types: ['刑侦', '罪案']
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';

  try {
    const collection = type === 'tv' ? 'tv_chinese_best_weekly' : 'movie_weekly_best';
    const doubanUrl = `https://m.douban.com/rexxar/api/v2/subject_collection/${collection}/items?start=0&count=10`;

    const res = await fetch(doubanUrl, {
      headers: {
        'Referer': `https://m.douban.com/${type}/weekly`,
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(3000), // 3秒超时熔断
      next: { revalidate: 43200 } // 12 小时边缘缓存，保证每日定时刷新
    });

    if (!res.ok) {
      throw new Error(`Douban weekly API responded with status ${res.status}`);
    }

    const data = await res.json();
    const items = data.subject_collection_items || [];

    if (!Array.isArray(items) || items.length === 0) {
      throw new Error('Empty subjects returned from Douban');
    }

    // 智能提取并匹配 TMDB 官方高清海报
    const processed = await Promise.all(
      items.slice(0, 10).map(async (item: any, idx: number) => {
        const title = item.title || '';
        const rate = item.rating?.value ? item.rating.value.toFixed(1) : (item.rate || '8.0');
        const doubanPoster = item.pic?.large || item.cover_url || '';

        // 尝试用 TMDB 匹配官方原图，免代理且全球 CDN 高速直达
        let poster = '';
        try {
          const tmdbRes = await fetch(
            `${TMDB_BASE}/search/${type === 'tv' ? 'tv' : 'movie'}?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(title)}`,
            { signal: AbortSignal.timeout(1500) }
          );
          if (tmdbRes.ok) {
            const tmdbData = await tmdbRes.json();
            if (tmdbData.results && tmdbData.results[0]?.poster_path) {
              poster = `https://image.tmdb.org/t/p/w500${tmdbData.results[0].poster_path}`;
            }
          }
        } catch {
          // TMDB 匹配失败则降级走豆瓣图片代理
        }

        if (!poster && doubanPoster) {
          poster = `/api/douban/image?url=${encodeURIComponent(doubanPoster)}`;
        }

        // 解析年份和类型
        const subtitle = item.card_subtitle || '';
        const parts = subtitle.split('/').map((s: string) => s.trim());
        const year = parts[0]?.match(/\d{4}/)?.[0] || '2026';
        const types = parts[2] ? parts[2].split(' ').filter(Boolean) : ['口碑精选'];

        return {
          id: item.id || `weekly_${type}_${idx + 1}`,
          title,
          rate,
          cover: poster || doubanPoster,
          year,
          types,
          description: subtitle
        };
      })
    );

    return NextResponse.json(
      {
        title: data.subject_collection?.name || (type === 'movie' ? '一周口碑电影榜' : '华语口碑剧集榜'),
        updated_at: new Date().toISOString(),
        subjects: processed
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=43200, s-maxage=43200, stale-while-revalidate=86400',
          'CDN-Cache-Control': 'public, s-maxage=43200',
          'Cloudflare-CDN-Cache-Control': 'public, s-maxage=43200'
        }
      }
    );
  } catch (err: any) {
    console.warn('[Weekly-Chart-API] Fallback triggered:', err?.message || err);
    return NextResponse.json(
      {
        title: type === 'movie' ? '一周口碑电影榜' : '华语口碑剧集榜',
        updated_at: new Date().toISOString(),
        subjects: type === 'movie' ? FALLBACK_WEEKLY_MOVIE : FALLBACK_WEEKLY_TV,
        is_fallback: true
      },
      {
        headers: {
          'Cache-Control': 'public, max-age=3600'
        }
      }
    );
  }
}
