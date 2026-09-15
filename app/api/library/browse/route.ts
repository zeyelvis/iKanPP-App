import { NextRequest, NextResponse } from 'next/server';
import { DOCUMENTARY_DATASET } from '@/lib/data/documentary-data';

export const runtime = 'edge';

const FETCH_TIMEOUT_MS = 3500;

interface SourceConfig {
  id: string;
  name: string;
  baseUrl: string;
}

const SOURCES: SourceConfig[] = [
  {
    id: 'guangsu',
    name: '光速资源',
    baseUrl: 'https://api.guangsuapi.com/api.php/provide/vod',
  },
  {
    id: 'jisu',
    name: '极速资源',
    baseUrl: 'https://jszyapi.com/api.php/provide/vod',
  },
];

// 光速资源分类映射
const GUANGSU_TYPE_MAP: Record<string, string> = {
  // 电影默认与子类
  'movie_default': '6,7,8,9,10,11,12,20',
  'movie_动作': '6',
  'movie_喜剧': '7',
  'movie_爱情': '8',
  'movie_科幻': '9',
  'movie_剧情': '10',
  'movie_恐怖': '11',
  'movie_惊悚': '11',
  'movie_战争': '12',
  'movie_动画': '20',
  'movie_动漫': '20',

  // 电视剧默认与地区
  'tv_default': '13,14,15,16,21,22,23',
  'tv_华语': '13',
  'tv_大陆': '13',
  'tv_内地': '13',
  'tv_国产': '13',
  'tv_欧美': '14',
  'tv_美国': '14',
  'tv_英国': '14',
  'tv_港台': '15,22',
  'tv_香港': '15',
  'tv_台湾': '22',
  'tv_韩剧': '16',
  'tv_韩国': '16',
  'tv_日剧': '21',
  'tv_日本': '21',
  'tv_泰剧': '23',

  // 动漫默认与地区
  'anime_default': '41,42,43',
  'anime_国产': '41',
  'anime_中国': '41',
  'anime_华语': '41',
  'anime_日本': '42',
  'anime_欧美': '43',

  // 综艺默认与地区
  'variety_default': '37,38,39,40',
  'variety_大陆': '37',
  'variety_华语': '37',
  'variety_内地': '37',
  'variety_日韩': '38',
  'variety_韩国': '38',
  'variety_日本': '38',
  'variety_港台': '39',
  'variety_台湾': '39',
  'variety_香港': '39',
  'variety_欧美': '40',

  // 纪录片
  'documentary_default': '24',
};

// 极速资源分类映射
const JISU_TYPE_MAP: Record<string, string> = {
  // 电影默认与子类
  'movie_default': '9,10,11,12,13,14,15,16,23,34,35,36,37',
  'movie_动作': '9',
  'movie_爱情': '10',
  'movie_喜剧': '11',
  'movie_科幻': '12',
  'movie_恐怖': '13',
  'movie_惊悚': '13',
  'movie_剧情': '14',
  'movie_战争': '15',
  'movie_动画': '23',
  'movie_动漫': '23',
  'movie_灾难': '34',
  'movie_悬疑': '35',
  'movie_犯罪': '36',
  'movie_奇幻': '37',

  // 电视剧默认与地区
  'tv_default': '3,4,5,6,7,20,28',
  'tv_华语': '20',
  'tv_大陆': '20',
  'tv_内地': '20',
  'tv_国产': '20',
  'tv_欧美': '3',
  'tv_美国': '3',
  'tv_英国': '3',
  'tv_港台': '4,28',
  'tv_香港': '4',
  'tv_台湾': '28',
  'tv_韩剧': '5',
  'tv_韩国': '5',
  'tv_日剧': '6',
  'tv_日本': '6',
  'tv_泰剧': '7',

  // 动漫默认与地区
  'anime_default': '24,25,26',
  'anime_国产': '24',
  'anime_中国': '24',
  'anime_华语': '24',
  'anime_日本': '25',
  'anime_欧美': '26',

  // 综艺默认与地区
  'variety_default': '30,31,32,33',
  'variety_大陆': '30',
  'variety_华语': '30',
  'variety_内地': '30',
  'variety_日韩': '31',
  'variety_韩国': '31',
  'variety_日本': '31',
  'variety_港台': '32',
  'variety_台湾': '32',
  'variety_香港': '32',
  'variety_欧美': '33',

  // 纪录片
  'documentary_default': '16',
};

/**
 * 根据专区类型和筛选条件解析对应源站的 type_id
 */
function resolveTypeId(
  source: 'guangsu' | 'jisu',
  type: string,
  genre?: string,
  area?: string
): string {
  const map = source === 'guangsu' ? GUANGSU_TYPE_MAP : JISU_TYPE_MAP;

  // 优先类型（如 电影+动作片）
  if (genre && genre !== '全部') {
    const genreKey = `${type}_${genre}`;
    if (map[genreKey]) return map[genreKey];
    for (const [k, v] of Object.entries(map)) {
      if (k.startsWith(`${type}_`) && k.includes(genre)) return v;
    }
  }

  // 其次地区（如 电视剧+韩剧/欧美/大陆）
  if (area && area !== '全部') {
    const areaKey = `${type}_${area}`;
    if (map[areaKey]) return map[areaKey];
    for (const [k, v] of Object.entries(map)) {
      if (k.startsWith(`${type}_`) && k.includes(area)) return v;
    }
  }

  return map[`${type}_default`] || '';
}

/**
 * 带超时的 HTTP 拉取封装
 */
async function fetchSource(url: string): Promise<any | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        Accept: 'application/json',
      },
    });
    clearTimeout(timer);
    if (!res.ok) return null;
    return await res.json();
  } catch {
    clearTimeout(timer);
    return null;
  }
}

/**
 * 标准化采集站条目为 CategoryHub / MovieCard 识别的标准格式
 */
function normalizeVodItem(item: any) {
  const doubanScore = parseFloat(item.vod_douban_score || '0');
  const rate = doubanScore > 0 ? doubanScore.toFixed(1) : (item.vod_remarks?.includes('完结') ? '8.8' : '8.5');

  // 解析标签类型
  const types: string[] = [];
  if (item.type_name) types.push(item.type_name);
  if (item.vod_class) {
    item.vod_class.split(/[,，/ ]+/).forEach((c: string) => {
      const trimmed = c.trim();
      if (trimmed && !types.includes(trimmed)) types.push(trimmed);
    });
  }

  return {
    id: String(item.vod_id),
    title: (item.vod_name || '').trim(),
    cover: item.vod_pic || '',
    rate,
    year: String(item.vod_year || ''),
    types,
    remarks: item.vod_remarks || '',
    area: item.vod_area || '',
    updatedAt: item.vod_time || '',
    url: `/title/${encodeURIComponent((item.vod_name || '').trim())}`,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = (searchParams.get('type') || 'movie').toLowerCase();
  const genre = searchParams.get('genre') || '';
  const area = searchParams.get('area') || searchParams.get('region') || '';
  const year = searchParams.get('year') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(48, Math.max(12, parseInt(searchParams.get('limit') || '24', 10)));

  const sort = searchParams.get('sort') || '';
  const isRankSort = sort === 'rank' || sort === 'rating' || genre === '豆瓣高分';
  const cleanGenre = (genre === '最新' || genre === '豆瓣高分' || genre === '热门' || genre === '全部') ? '' : genre;

  // 解析光速和极速各自的 type_id
  const gsTypeId = resolveTypeId('guangsu', type, cleanGenre, area);
  const jsTypeId = resolveTypeId('jisu', type, cleanGenre, area);

  // 构造查询 URL
  const gsUrl = `${SOURCES[0].baseUrl}?ac=detail${gsTypeId ? `&t=${gsTypeId}` : ''}&pg=${page}`;
  const jsUrl = `${SOURCES[1].baseUrl}?ac=detail${jsTypeId ? `&t=${jsTypeId}` : ''}&pg=${page}`;

  // 并发请求双源（光速为主，极速为备用/补充）
  const [gsData, jsData] = await Promise.all([
    fetchSource(gsUrl),
    fetchSource(jsUrl),
  ]);

  const rawList = [
    ...(gsData?.list && Array.isArray(gsData.list) ? gsData.list : []),
    ...(jsData?.list && Array.isArray(jsData.list) ? jsData.list : []),
  ];

  // 按片名去重合并
  const seenTitles = new Set<string>();
  let normalizedList = [];

  // 如果是纪录片且是第一页，无细化类型筛选，将精选纪录片神作置顶
  if (type === 'documentary' && page === 1 && (!cleanGenre || cleanGenre === '全部') && (!area || area === '全部')) {
    for (const doc of DOCUMENTARY_DATASET.slice(0, 8)) {
      seenTitles.add(doc.title);
      normalizedList.push({
        id: doc.id,
        title: doc.title,
        cover: doc.cover,
        rate: doc.rate,
        year: doc.year,
        types: doc.types,
        remarks: doc.episodes_info || '经典高分',
        area: '全球',
        updatedAt: '',
        url: `/title/${encodeURIComponent(doc.title)}`,
      });
    }
  }

  for (const item of rawList) {
    if (!item || !item.vod_name) continue;
    const cleanTitle = item.vod_name.trim();
    if (seenTitles.has(cleanTitle)) continue;
    seenTitles.add(cleanTitle);

    // 内存过滤年份（如果用户指定）
    if (year && year !== '全部' && year !== '经典高分') {
      if (item.vod_year && !item.vod_year.includes(year)) {
        continue;
      }
    }

    // 内存过滤地区（在无法由 type_id 覆盖的场景下补充过滤）
    if (area && area !== '全部' && !['华语', '大陆', '欧美', '日本', '韩国'].includes(area)) {
      if (item.vod_area && !item.vod_area.includes(area)) {
        continue;
      }
    }

    normalizedList.push(normalizeVodItem(item));
  }

  // 若用户指定高分排序，优先按评分降序排列
  if (isRankSort) {
    normalizedList.sort((a, b) => parseFloat(b.rate || '0') - parseFloat(a.rate || '0'));
  }

  // 计算分页指标
  const primaryData = gsData?.total ? gsData : jsData;
  const total = Number(primaryData?.total) || normalizedList.length;
  const pagecount = Number(primaryData?.pagecount) || Math.ceil(total / limit) || 1;

  // 切割到指定页大小
  const pagedList = normalizedList.slice(0, limit);

  return NextResponse.json(
    {
      code: 200,
      page,
      pagecount,
      total,
      limit,
      list: pagedList,
    },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
      },
    }
  );
}
