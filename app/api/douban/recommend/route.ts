import { NextResponse } from 'next/server';
import { GUOMAN_DATASET } from '@/lib/data/guoman-data';

export const runtime = 'edge';

// 豆瓣电影合法核心标签
const VALID_MOVIE_TAGS = new Set([
  '热门', '最新', '经典', '可播放', '豆瓣高分', '冷门佳片',
  '华语', '欧美', '韩国', '日本', '动作', '喜剧', '爱情', '科幻', '悬疑', '恐怖', '动画'
]);

// 豆瓣电视剧合法核心标签
const VALID_TV_TAGS = new Set([
  '热门', '国产剧', '美剧', '英剧', '韩剧', '日剧', '港剧', '日本动画', '国产动画', '综艺', '纪录片'
]);

import { PREBAKED_HOME_DATA } from '@/lib/data/home-prebaked';

/**
 * 抓取豆瓣 API 结果（带 2500ms 快速超时熔断，防止海外边缘节点跨国请求卡死）
 */
async function fetchDoubanSubjects(type: string, tag: string, pageLimit: number, pageStart: number): Promise<any[]> {
  try {
    const url = `https://movie.douban.com/j/search_subjects?type=${type}&tag=${encodeURIComponent(tag)}&sort=recommend&page_limit=${pageLimit}&page_start=${pageStart}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://movie.douban.com/',
        'Accept': 'application/json, text/plain, */*',
      },
      signal: AbortSignal.timeout(2500), // 2500ms 快速超时熔断，防止海外边缘节点跨国请求卡死
      next: { revalidate: 86400 }, // 24 小时强效边缘缓存
    });

    if (!response.ok) return [];
    const data = await response.json();
    if (data && Array.isArray(data.subjects) && data.subjects.length > 0) {
      return data.subjects.map((item: any) => ({
        ...item,
        cover: item.cover ? `/api/douban/image?url=${encodeURIComponent(item.cover)}` : item.cover,
      }));
    }
    return [];
  } catch (err) {
    console.warn(`[Douban-API] Timeout or error for tag "${tag}", triggering instant prebaked fallback:`, (err as any)?.message || err);
    // 触发即时预置数据熔断兜底，并确保预置数据封面全部经过代理保护
    const prebaked = type === 'tv' ? PREBAKED_HOME_DATA.tv : PREBAKED_HOME_DATA.movie;
    const fallbackList = [...prebaked.s1, ...prebaked.s2, ...prebaked.s3, ...prebaked.s4];
    return fallbackList.slice(0, pageLimit).map((item: any) => ({
      ...item,
      cover: item.cover?.startsWith('http') ? `/api/img-proxy?url=${encodeURIComponent(item.cover)}` : item.cover,
    }));
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const genre = (searchParams.get('genre') || '').trim();
  const region = (searchParams.get('region') || '').trim();
  const year = (searchParams.get('year') || '').trim();
  const rawTag = (searchParams.get('tag') || '').trim();
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv';

  if (!['movie', 'tv'].includes(type)) {
    return NextResponse.json({ subjects: [], error: 'Invalid type' }, { status: 400 });
  }

  const pageLimit = Math.min(Math.max(parseInt(searchParams.get('page_limit') || '36', 10) || 36, 1), 60);
  const pageStart = Math.max(parseInt(searchParams.get('page_start') || '0', 10) || 0, 0);

  // 0. 特殊处理：国漫 / 国产动画（豆瓣官方 API 无此标签，必须走专属精选库）
  const isGuoman =
    rawTag === '国产动画' ||
    rawTag === '国漫' ||
    rawTag === '国创' ||
    genre === '国漫' ||
    genre === '国产动画' ||
    region === '国产动画' ||
    region === '国漫' ||
    region === '国创';

  if (isGuoman) {
    let list = [...GUOMAN_DATASET];

    // 如果指定了特定题材筛选（如：玄幻、科幻、热血、古风）
    if (genre && genre !== '国漫' && genre !== '国产动画') {
      list = list.filter(item => item.types?.some(t => t.includes(genre)));
    }
    // 如果指定了年份筛选
    if (year && !['国产动画', '全部'].includes(year)) {
      list = list.filter(item => item.year === year);
    }

    const paged = list.slice(pageStart, pageStart + pageLimit).map(item => ({
      ...item,
      cover: item.cover?.includes('doubanio.com')
        ? `/api/douban/image?url=${encodeURIComponent(item.cover)}`
        : item.cover,
      playable: true,
      is_new: item.year === '2024' || item.year === '2025' || item.year === '2026',
    }));

    return NextResponse.json({
      subjects: paged,
      tag: '国产动画',
      genre,
      region,
      year,
      total: list.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=1800, s-maxage=3600, stale-while-revalidate=86400',
        'CDN-Cache-Control': 'public, s-maxage=3600',
        'Cloudflare-CDN-Cache-Control': 'public, s-maxage=3600',
      },
    });
  }

  // 1. 确定针对豆瓣的 1~3 个最精准查询 Tag
  const doubanTags: string[] = [];

  if (type === 'movie') {
    // 电影地区映射
    const regionMap: Record<string, string> = {
      '华语': '华语', '香港': '华语', '中国香港': '华语', '台湾': '华语', '中国台湾': '华语',
      '欧美': '欧美', '美国': '欧美', '英国': '欧美', '法国': '欧美',
      '韩国': '韩国', '日本': '日本',
    };
    // 电影题材映射
    const genreMap: Record<string, string> = {
      '动作': '动作', '喜剧': '喜剧', '爱情': '爱情', '科幻': '科幻', '悬疑': '悬疑',
      '恐怖': '恐怖', '动画': '动画', '犯罪': '悬疑', '奇幻': '科幻', '战争': '动作', '纪录片': '冷门佳片',
    };
    // 年份映射
    const yearMap: Record<string, string> = {
      '2026': '最新', '2025': '最新', '2024': '热门', '2023': '经典', '经典高分': '豆瓣高分'
    };

    if (region && regionMap[region]) doubanTags.push(regionMap[region]);
    if (genre && genreMap[genre] && !doubanTags.includes(genreMap[genre])) doubanTags.push(genreMap[genre]);
    if (doubanTags.length === 0 && year && yearMap[year]) doubanTags.push(yearMap[year]);
    if (doubanTags.length === 0) doubanTags.push(rawTag && VALID_MOVIE_TAGS.has(rawTag) ? rawTag : '热门');
  } else {
    // 电视剧 / 动漫 / 国漫 / 综艺
    const tvRegionMap: Record<string, string> = {
      '国产剧': '国产剧', '美剧': '美剧', '欧美剧': '美剧', '欧美': '美剧', '海外剧': '美剧',
      '韩剧': '韩剧', '日剧': '日剧',
      '港剧': '港剧', '香港': '港剧', '英剧': '英剧', '英国': '英剧',
      '台剧': '国产剧', '台湾': '国产剧', '泰剧': '热门',
      '日本动画': '日本动画', '国产动画': '国产动画', '国创': '国产动画', '国漫': '国产动画', '动漫': '日本动画',
      '综艺': '综艺', '纪录片': '纪录片',
    };

    const mappedRawTag = (rawTag === '欧美剧' || rawTag === '欧美' || rawTag === '海外剧')
      ? '美剧'
      : (rawTag === '华语剧' || rawTag === '华语')
      ? '国产剧'
      : rawTag;

    if (region && tvRegionMap[region]) {
      doubanTags.push(tvRegionMap[region]);
    } else if (genre === '国漫' || genre === '国产动画') {
      doubanTags.push('国产动画');
    } else if (genre === '日本动画' || genre === '动漫' || genre === '新番') {
      doubanTags.push('日本动画');
    } else if (genre === '综艺') {
      doubanTags.push('综艺');
    } else if (genre === '纪录片') {
      doubanTags.push('纪录片');
    } else if (mappedRawTag && VALID_TV_TAGS.has(mappedRawTag)) {
      doubanTags.push(mappedRawTag);
    } else {
      doubanTags.push('热门');
    }
  }

  try {
    // 2. 并行抓取豆瓣匹配的标签池
    const fetchResults = await Promise.allSettled(
      doubanTags.map(tag => fetchDoubanSubjects(type, tag, pageLimit, pageStart))
    );

    const pool: any[] = [];
    const countMap = new Map<string, number>();

    fetchResults.forEach(res => {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        res.value.forEach(s => {
          const count = countMap.get(s.title) || 0;
          countMap.set(s.title, count + 1);
          if (count === 0) pool.push(s);
        });
      }
    });

    // 3. 精准多维重排算法：
    // - 命中了多个筛选条件的影片（交集项）排在最前列
    // - 评分高的优质影片排在前面
    pool.sort((a, b) => {
      const countA = countMap.get(a.title) || 0;
      const countB = countMap.get(b.title) || 0;
      if (countB !== countA) return countB - countA;
      return (parseFloat(b.rate) || 0) - (parseFloat(a.rate) || 0);
    });

    // 4. 若 pool 依然为空（极罕见），兜底加载热门
    if (pool.length === 0) {
      const fallbackList = await fetchDoubanSubjects(type, type === 'movie' ? '热门' : '国产剧', pageLimit, pageStart);
      pool.push(...fallbackList);
    }

    return NextResponse.json({
      subjects: pool.slice(0, pageLimit),
      tag: doubanTags[0] || '热门',
      genre,
      region,
      year,
      total: pool.length,
    }, {
      headers: {
        'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
        'CDN-Cache-Control': 'public, s-maxage=86400',
        'Cloudflare-CDN-Cache-Control': 'public, s-maxage=86400',
      },
    });
  } catch (error) {
    console.error('Douban recommend API error:', error);
    return NextResponse.json(
      { subjects: [], error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
