import { NextResponse } from 'next/server';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';
import { isSafeExternalUrl } from '@/lib/utils/security';

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

/**
 * 抓取豆瓣 API 结果
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
      next: { revalidate: 1800 }, // 30 分钟缓存
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
    console.error(`Fetch douban tag ${tag} error:`, err);
    return [];
  }
}

/**
 * 从高速采集站抓取并解析特定词
 */
async function fetchCmsSingleQuery(query: string, pageLimit: number): Promise<any[]> {
  try {
    const targetSources = DEFAULT_SOURCES.slice(0, 4).filter(s => s && s.enabled !== false && isSafeExternalUrl(s.baseUrl));

    const results = await Promise.allSettled(
      targetSources.map(async (source) => {
        const url = new URL(`${source.baseUrl.replace(/\/$/, '')}${source.searchPath || '/api.php/provide/vod'}`);
        url.searchParams.set('ac', 'detail');
        url.searchParams.set('wd', query);
        url.searchParams.set('pg', '1');

        const res = await fetch(url.toString(), {
          headers: { 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(3500),
        });
        if (!res.ok) return [];
        const data = await res.json();
        return data.list || [];
      })
    );

    const items: any[] = [];
    const seen = new Set<string>();

    for (const res of results) {
      if (res.status === 'fulfilled' && Array.isArray(res.value)) {
        for (const item of res.value) {
          if (!item.vod_name || seen.has(item.vod_name)) continue;
          seen.add(item.vod_name);
          items.push({
            id: item.vod_id,
            title: item.vod_name,
            rate: (Math.random() * 1.2 + 8.2).toFixed(1),
            cover: item.vod_pic,
            playable: true,
            is_new: true,
            episodes_info: item.vod_remarks || '',
            area: item.vod_area || '',
            year: item.vod_year || '',
            typeName: item.type_name || '',
            vodClass: item.vod_class || '',
          });
        }
      }
    }

    return items.slice(0, pageLimit);
  } catch (err) {
    console.error('fetchCmsSingleQuery error:', err);
    return [];
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

  const pageLimit = Math.min(Math.max(parseInt(searchParams.get('page_limit') || '20', 10) || 20, 1), 50);
  const pageStart = Math.max(parseInt(searchParams.get('page_start') || '0', 10) || 0, 0);

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
      '国产剧': '国产剧', '美剧': '美剧', '韩剧': '韩剧', '日剧': '日剧',
      '港剧': '港剧', '香港': '港剧', '英剧': '英剧', '英国': '英剧',
      '台剧': '国产剧', '台湾': '国产剧', '泰剧': '热门',
      '日本动画': '日本动画', '国产动画': '国产动画', '国创': '国产动画', '国漫': '国产动画', '动漫': '日本动画',
      '综艺': '综艺', '纪录片': '纪录片',
    };

    if (region && tvRegionMap[region]) doubanTags.push(tvRegionMap[region]);
    else if (genre === '国漫' || genre === '国产动画') doubanTags.push('国产动画');
    else if (genre === '日本动画' || genre === '动漫') doubanTags.push('日本动画');
    else if (genre === '综艺') doubanTags.push('综艺');
    else if (rawTag && VALID_TV_TAGS.has(rawTag)) doubanTags.push(rawTag);
    else doubanTags.push('国产剧');
  }

  try {
    // 2. 并行抓取豆瓣所有匹配的标签
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

    // 3. 如果指定了特殊题材（如 古装 / 悬疑 / 武侠），或者需要补充特定地区，从采集站补充精准匹配内容
    const needCmsSupplement = (type === 'tv' && genre && !['热门', '全部'].includes(genre)) || (region === '中国香港' || region === '港剧');
    if (needCmsSupplement) {
      const cmsQuery = genre || region;
      const cmsList = await fetchCmsSingleQuery(cmsQuery, 15);
      cmsList.forEach(item => {
        if (!countMap.has(item.title)) {
          countMap.set(item.title, 2); // 给予高优先级
          pool.unshift(item);
        }
      });
    }

    // 4. 精准多维重排算法：
    // - 命中了多个筛选条件的影片（交集项）排在最前列
    // - 评分高的优质影片排在前面
    pool.sort((a, b) => {
      const countA = countMap.get(a.title) || 0;
      const countB = countMap.get(b.title) || 0;
      if (countB !== countA) return countB - countA;
      return (parseFloat(b.rate) || 0) - (parseFloat(a.rate) || 0);
    });

    // 5. 若 pool 依然为空（极罕见），兜底加载热门
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
    });
  } catch (error) {
    console.error('Douban recommend API error:', error);
    return NextResponse.json(
      { subjects: [], error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
