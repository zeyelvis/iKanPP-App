import { NextRequest, NextResponse } from 'next/server';
import { DOCUMENTARY_DATASET } from '@/lib/data/documentary-data';
import { queryEntities } from '@/lib/services/entity-kv';

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

  // 短剧
  'short_default': '13,14,15,16,21,22,23',
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

/**
 * 语言匹配辅助函数
 */
function matchesLang(item: any, lang: string): boolean {
  if (!lang || lang === '全部') return true;
  const itemLang = (item.vod_lang || '').toLowerCase();
  const remarks = (item.vod_remarks || '').toLowerCase();
  const target = lang.toLowerCase();

  if (target === '国语') {
    return itemLang.includes('国语') || itemLang.includes('普通话') || itemLang.includes('汉语') || remarks.includes('国语');
  }
  if (target === '粤语') {
    return itemLang.includes('粤语') || remarks.includes('粤语') || itemLang.includes('广东话');
  }
  if (target === '英语') {
    return itemLang.includes('英') || itemLang.includes('english');
  }
  if (target === '韩语') {
    return itemLang.includes('韩') || itemLang.includes('korean');
  }
  if (target === '日语') {
    return itemLang.includes('日') || itemLang.includes('japanese');
  }
  if (target === '西班牙语') {
    return itemLang.includes('西班牙') || itemLang.includes('spanish');
  }
  if (target === '法语') {
    return itemLang.includes('法') || itemLang.includes('french');
  }
  if (target === '德语') {
    return itemLang.includes('德') || itemLang.includes('german');
  }
  if (target === '意大利语') {
    return itemLang.includes('意') || itemLang.includes('italian');
  }
  if (target === '泰国语' || target === '泰语') {
    return itemLang.includes('泰') || itemLang.includes('thai');
  }
  if (target === '其它' || target === '其他') {
    const knownLangs = ['国语', '普通话', '汉语', '粤语', '英语', '韩语', '日语', '西班牙', '法', '德', '意', '泰'];
    return !knownLangs.some(l => itemLang.includes(l));
  }

  return itemLang.includes(target);
}

/**
 * 画质匹配辅助函数
 */
function matchesQuality(item: any, quality: string): boolean {
  if (!quality || quality === '全部') return true;
  const remarks = (item.vod_remarks || '').toUpperCase();
  const name = (item.vod_name || '').toUpperCase();
  const combined = `${remarks} ${name}`;

  if (quality === '4K') {
    return combined.includes('4K') || combined.includes('2160P') || combined.includes('2160');
  }
  if (quality === '1080P') {
    return combined.includes('1080') || combined.includes('HD') || combined.includes('超清') || combined.includes('蓝光') || combined.includes('BD');
  }
  if (quality === '900P') {
    return combined.includes('900') || combined.includes('HD');
  }
  if (quality === '720P') {
    return combined.includes('720') || combined.includes('高清');
  }

  return combined.includes(quality.toUpperCase());
}

/**
 * 状态匹配辅助函数
 */
function matchesStatus(item: any, status: string): boolean {
  if (!status || status === '全部') return true;
  const remarks = (item.vod_remarks || '');

  if (status === '全集' || status === '完结') {
    return remarks.includes('完结') || remarks.includes('全集') || remarks.includes('全') || /\d+集全/.test(remarks) || remarks.toUpperCase().includes('HD');
  }
  if (status === '连载中' || status === '更新中') {
    return remarks.includes('更') || remarks.includes('连载') || /第\d+集/.test(remarks) || /更新至/.test(remarks);
  }

  return true;
}

/**
 * 年份匹配辅助函数
 */
function matchesYear(item: any, yearStr: string): boolean {
  if (!yearStr || yearStr === '全部' || yearStr === '经典高分') return true;
  const itemYear = parseInt(item.vod_year || '0', 10);
  const currentYear = new Date().getFullYear(); // e.g. 2025/2026

  if (yearStr === '今年') {
    return itemYear >= currentYear - 1;
  }
  if (yearStr === '去年') {
    return itemYear === currentYear - 1 || itemYear === currentYear - 2;
  }
  if (yearStr === '更早') {
    return itemYear > 0 && itemYear < currentYear - 2 && itemYear >= 2000;
  }
  if (yearStr === '90年代') {
    return itemYear >= 1990 && itemYear <= 1999;
  }
  if (yearStr === '80年代') {
    return itemYear >= 1980 && itemYear <= 1989;
  }
  if (yearStr === '怀旧') {
    return itemYear > 0 && itemYear < 1980;
  }

  // 精确匹配具体年份（如 2026, 2025, 2024 等）
  if (item.vod_year) {
    return String(item.vod_year).includes(yearStr);
  }

  return true;
}

// 板块映射表
const CHANNEL_MAP: Record<string, string> = {
  '全部': 'all',
  'all': 'all',
  '电影': 'movie',
  'movie': 'movie',
  '电视剧': 'tv',
  'tv': 'tv',
  '综艺': 'variety',
  'variety': 'variety',
  '动漫': 'anime',
  'anime': 'anime',
  '纪录片': 'documentary',
  'documentary': 'documentary',
  '短剧': 'short',
  'short': 'short',
  'short-drama': 'short',
};

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const rawType = (searchParams.get('type') || 'movie').toLowerCase();
  const type = CHANNEL_MAP[rawType] || rawType || 'movie';
  const genre = searchParams.get('genre') || '';
  const area = searchParams.get('area') || searchParams.get('region') || '';
  const year = searchParams.get('year') || '';
  const lang = searchParams.get('lang') || '';
  const quality = searchParams.get('quality') || '';
  const status = searchParams.get('status') || '';
  const sort = searchParams.get('sort') || '';
  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
  const limit = Math.min(48, Math.max(12, parseInt(searchParams.get('limit') || '36', 10)));

  const isRankSort = sort === 'rank' || sort === 'rating' || sort === 'score' || genre === '豆瓣高分';
  const isHitsSort = sort === 'popularity' || sort === 'hits';
  const isUpdatedSort = sort === 'time_updated' || sort === 'updated';
  const isAddedSort = sort === 'time_added' || sort === 'added' || sort === 'time' || sort === 'latest';
  const cleanGenre = (genre === '最新' || genre === '豆瓣高分' || genre === '热门' || genre === '全部') ? '' : genre;

  // 映射为标准 4 大排序
  let resolvedSort = 'time_added';
  if (isRankSort) {
    resolvedSort = 'rating';
  } else if (isHitsSort) {
    resolvedSort = 'popularity';
  } else if (isUpdatedSort) {
    resolvedSort = 'time_updated';
  } else {
    resolvedSort = 'time_added';
  }

  // ── 1. 优先从 Cloudflare KV 自有结构化实体片库中查询 ───────────────────
  try {
    const kvResult = await queryEntities({
      channel: type,
      genre: cleanGenre,
      region: (area && area !== '全部') ? area : undefined,
      year: (year && year !== '全部') ? year : undefined,
      language: (lang && lang !== '全部') ? lang : undefined,
      status: (status && status !== '全部') ? status : undefined,
      sort: resolvedSort,
      page,
      limit,
    });

    // 频道实体库成熟度仲裁：
    // 1. 全库 (all)、电影与电视剧为成熟主力库（已有万级实体），只要有匹配结果即由 KV 毫秒级直出；
    // 2. 动漫、综艺、纪录片、短剧等专区若当前收录量较少（< 100 部），说明尚未完成全量灌入，
    //    自动降级至第三方采集站全网实时接口，确保大厅呈现数千部完整片源！
    const isMatureChannel = type === 'movie' || type === 'tv' || type === 'anime' || type === 'variety' || type === 'documentary' || type === 'all';
    const hasSufficientEntities = kvResult && kvResult.total >= 50;
    const shouldServeKV = kvResult && kvResult.total > 0 && (isMatureChannel || hasSufficientEntities);

    if (shouldServeKV) {
      const list = kvResult.items.map(entity => ({
        id: entity.entityId,
        title: entity.title,
        cover: entity.cover,
        rate: entity.rate || entity.score || '8.8',
        score: entity.score || entity.rate || '8.8',
        popularity: entity.popularity || entity.hot || 0,
        hot: entity.hot || entity.popularity || 0,
        year: entity.year || '2026',
        types: entity.genres || [],
        remarks: entity.status || (entity.numberOfEpisodes ? `${entity.numberOfEpisodes}集全` : '全高清'),
        area: entity.region || '华语',
        updatedAt: (entity.updatedAt || entity.createdAt || '').split('T')[0],
        url: `/title/${encodeURIComponent(entity.slug || entity.title)}`,
      }));

      return NextResponse.json(
        {
          code: 200,
          page: kvResult.page,
          pagecount: kvResult.pageCount,
          total: kvResult.total,
          limit: kvResult.limit,
          list,
        },
        {
          headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=3600',
          },
        }
      );
    }
  } catch (kvErr) {
    console.warn('[browse/route.ts] KV query fallback to collector API:', kvErr);
  }

  // ── 2. 降级备用：第三方采集站实时代理（双保险兜底）──────────────────────
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

    // 内存过滤年份
    if (!matchesYear(item, year)) {
      continue;
    }

    // 内存过滤地区（在无法由 type_id 覆盖的场景下补充过滤）
    if (area && area !== '全部' && !['华语', '大陆', '欧美', '日本', '韩国'].includes(area)) {
      if (item.vod_area && !item.vod_area.includes(area)) {
        continue;
      }
    }

    // 内存过滤语言
    if (!matchesLang(item, lang)) {
      continue;
    }

    // 内存过滤画质
    if (!matchesQuality(item, quality)) {
      continue;
    }

    // 内存过滤状态（全集 / 连载中）
    if (!matchesStatus(item, status)) {
      continue;
    }

    normalizedList.push(normalizeVodItem(item));
  }

  // 排序处理
  if (isRankSort) {
    normalizedList.sort((a, b) => parseFloat(b.rate || '0') - parseFloat(a.rate || '0'));
  } else if (isUpdatedSort || isAddedSort) {
    normalizedList.sort((a, b) => {
      const timeA = a.updatedAt ? new Date(a.updatedAt).getTime() : 0;
      const timeB = b.updatedAt ? new Date(b.updatedAt).getTime() : 0;
      return timeB - timeA;
    });
  } else if (isHitsSort) {
    normalizedList.sort((a, b) => (parseFloat(b.rate || '0') * 10 + (b.year ? parseInt(b.year, 10) : 0)) - (parseFloat(a.rate || '0') * 10 + (a.year ? parseInt(a.year, 10) : 0)));
  }

  // 计算分页指标（真实反映源站与筛选后的条目数量）
  const primaryData = gsData?.total ? gsData : jsData;
  const isFiltered = Boolean((year && year !== '全部') || (lang && lang !== '全部') || (quality && quality !== '全部') || (status && status !== '全部'));

  // 未加细筛选时，直接透传源站该专区真实总数；加细筛选时如实统计匹配结果
  let total = Number(primaryData?.total) || normalizedList.length;
  if (isFiltered) {
    total = normalizedList.length;
  }
  const pagecount = isFiltered ? Math.max(1, Math.ceil(total / limit)) : (Number(primaryData?.pagecount) || Math.max(1, Math.ceil(total / limit)));

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

