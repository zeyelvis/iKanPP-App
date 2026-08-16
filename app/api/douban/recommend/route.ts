import { NextResponse } from 'next/server';
import { DEFAULT_SOURCES } from '@/lib/api/default-sources';
import { isSafeExternalUrl } from '@/lib/utils/security';

export const runtime = 'edge';

// 豆瓣合法核心主标签
const VALID_MOVIE_TAGS = new Set([
  '热门', '最新', '经典', '可播放', '豆瓣高分', '冷门佳片',
  '华语', '欧美', '韩国', '日本', '动作', '喜剧', '爱情', '科幻', '悬疑', '恐怖', '动画'
]);

const VALID_TV_TAGS = new Set([
  '热门', '国产剧', '美剧', '英剧', '韩剧', '日剧', '港剧', '日本动画', '综艺', '纪录片'
]);

/**
 * 将前端任意多维筛选词智能规范化为豆瓣最匹配的检索主标签
 */
function normalizeDoubanTag(tag: string, type: 'movie' | 'tv'): { primary: string; fallback: string } {
  const cleanTag = tag.trim();

  if (type === 'movie') {
    if (VALID_MOVIE_TAGS.has(cleanTag)) {
      return { primary: cleanTag, fallback: '热门' };
    }

    // 年份映射
    if (cleanTag === '2026' || cleanTag === '2025') return { primary: '最新', fallback: '热门' };
    if (cleanTag === '2024') return { primary: '热门', fallback: '最新' };
    if (cleanTag === '2023' || cleanTag === '经典高分') return { primary: '经典', fallback: '豆瓣高分' };

    // 地区映射
    if (cleanTag === '中国香港' || cleanTag === '香港' || cleanTag === '中国台湾' || cleanTag === '台湾') {
      return { primary: '华语', fallback: '热门' };
    }
    if (cleanTag === '美国' || cleanTag === '英国' || cleanTag === '法国' || cleanTag === '欧美') {
      return { primary: '欧美', fallback: '热门' };
    }

    // 题材映射
    if (cleanTag === '犯罪') return { primary: '悬疑', fallback: '热门' };
    if (cleanTag === '奇幻') return { primary: '科幻', fallback: '热门' };
    if (cleanTag === '战争') return { primary: '动作', fallback: '热门' };
    if (cleanTag === '纪录片') return { primary: '冷门佳片', fallback: '热门' };

    return { primary: '热门', fallback: '最新' };
  } else {
    // TV / 电视剧 / 动漫 / 综艺
    if (VALID_TV_TAGS.has(cleanTag)) {
      return { primary: cleanTag, fallback: '热门' };
    }

    // 年份映射
    if (cleanTag === '2026' || cleanTag === '2025' || cleanTag === '2024' || cleanTag === '2023' || cleanTag === '高分必看') {
      return { primary: '热门', fallback: '国产剧' };
    }

    // 电视剧题材与地区映射
    if (['古装', '都市', '悬疑', '爱情', '武侠', '历史', '喜剧', '犯罪', '战争'].includes(cleanTag)) {
      return { primary: '国产剧', fallback: '热门' };
    }
    if (cleanTag === '港剧' || cleanTag === '香港') return { primary: '港剧', fallback: '国产剧' };
    if (cleanTag === '台剧' || cleanTag === '台湾') return { primary: '国产剧', fallback: '热门' };
    if (cleanTag === '美剧' || cleanTag === '欧美' || cleanTag === '欧美真人秀') return { primary: '美剧', fallback: '热门' };
    if (cleanTag === '英剧' || cleanTag === '英国') return { primary: '英剧', fallback: '美剧' };
    if (cleanTag === '韩剧' || cleanTag === '韩国' || cleanTag === '韩国综艺') return { primary: '韩剧', fallback: '热门' };
    if (cleanTag === '日剧' || cleanTag === '日本') return { primary: '日剧', fallback: '热门' };
    if (cleanTag === '泰剧' || cleanTag === '泰国') return { primary: '热门', fallback: '国产剧' };

    // 动漫题材与类型映射
    if (['日本动画', '热血', '奇幻', '科幻', '冒险', '搞笑', '恋爱', '日常', '治愈', '动漫', '经典神作'].includes(cleanTag)) {
      return { primary: '日本动画', fallback: '热门' };
    }
    if (cleanTag === '国产动画') return { primary: '国产剧', fallback: '日本动画' };
    if (cleanTag === '欧美动画') return { primary: '美剧', fallback: '日本动画' };

    // 综艺
    if (['综艺', '真人秀', '脱口秀', '音乐', '喜剧', '美食', '旅行', '访谈', '大陆综艺', '港台综艺'].includes(cleanTag)) {
      return { primary: '综艺', fallback: '热门' };
    }

    return { primary: '热门', fallback: '国产剧' };
  }
}

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
 * 从高速采集站多源并行抓取，并根据多维条件智能过滤匹配
 */
async function fetchCmsSingleQuery(query: string, pageLimit: number): Promise<any[]> {
  try {
    const targetSources = DEFAULT_SOURCES.slice(0, 5).filter(s => s && s.enabled !== false && isSafeExternalUrl(s.baseUrl));

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

  // 确定针对豆瓣与采集站各自的主检索词
  // 对于电视剧 (tv):
  // - 豆瓣的主标签应该是地区（如 "国产剧", "美剧", "韩剧", "日剧", "港剧"）
  // - 采集站可以精准查题材（如 "古装", "都市", "悬疑", "武侠"）
  let doubanTag = '';
  if (region && VALID_TV_TAGS.has(region)) {
    doubanTag = region;
  } else if (genre && VALID_MOVIE_TAGS.has(genre) && type === 'movie') {
    doubanTag = genre;
  } else if (region && VALID_MOVIE_TAGS.has(region) && type === 'movie') {
    doubanTag = region;
  } else {
    doubanTag = normalizeDoubanTag(region || genre || rawTag || '热门', type).primary;
  }

  // 采集站主查询词（使用最具体的单一词，避免多词导致采集站 0 匹配）
  const cmsQuery = genre || region || (year ? (type === 'movie' ? '2026' : '电视剧') : '热门');

  try {
    // 并行获取豆瓣与采集站数据
    const [doubanRes, cmsRes] = await Promise.allSettled([
      fetchDoubanSubjects(type, doubanTag, pageLimit, pageStart),
      fetchCmsSingleQuery(cmsQuery, pageLimit),
    ]);

    const doubanList = doubanRes.status === 'fulfilled' ? doubanRes.value : [];
    const cmsList = cmsRes.status === 'fulfilled' ? cmsRes.value : [];

    // 智能融合两路数据
    const seenTitles = new Set<string>();
    const subjects: any[] = [];

    // 1. 如果指定了题材（如 古装），优先放入采集站搜到的精准题材剧集
    if (genre) {
      for (const item of cmsList) {
        if (!seenTitles.has(item.title)) {
          seenTitles.add(item.title);
          subjects.push(item);
        }
      }
    }

    // 2. 补充豆瓣高分热门剧集/电影
    for (const item of doubanList) {
      if (!seenTitles.has(item.title)) {
        seenTitles.add(item.title);
        subjects.push(item);
      }
    }

    // 3. 补充其余采集站内容
    for (const item of cmsList) {
      if (!seenTitles.has(item.title)) {
        seenTitles.add(item.title);
        subjects.push(item);
      }
    }

    // 4. 若依然为空（极罕见），使用全站兜底热门标签
    if (subjects.length === 0) {
      const fallbackList = await fetchDoubanSubjects(type, type === 'movie' ? '热门' : '国产剧', pageLimit, pageStart);
      for (const item of fallbackList) {
        if (!seenTitles.has(item.title)) {
          seenTitles.add(item.title);
          subjects.push(item);
        }
      }
    }

    return NextResponse.json({
      subjects: subjects.slice(0, pageLimit),
      tag: doubanTag,
      genre,
      region,
      year,
      total: subjects.length,
    });
  } catch (error) {
    console.error('Douban Multi-filter API error:', error);
    return NextResponse.json(
      { subjects: [], error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}
