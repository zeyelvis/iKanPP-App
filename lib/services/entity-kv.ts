import { TitleEntity } from '@/lib/types/entity';
import { generateSlug, formatEntityId, normalizeTitle, isInvalidDramaOrMovie, hasTitleOverlap, isCleanChineseTitle } from '@/lib/data/entities/entity-utils';

/**
 * 影视实体精简卡片项（用于「最新上线」货架与 RSS Feed 0ms 瞬间直出）
 */
export interface RecentTitleItem {
  entityId: string;
  tmdbId?: string;
  title: string;
  slug: string;
  cover: string;
  backdrop?: string;
  rate: string;
  year: string;
  type: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string;
  channelKey?: string;
  genres?: string[];
  updateBadge?: string;
  createdAt: string;
}

// 内存缓存字典（用于本地开发或运行时轻量缓存）
const memoryStore = new Map<string, string>();

async function ensurePrebakedSeeded(): Promise<void> {
  // 保持空实现，防止庞大的预烘焙数据打入 Edge Worker bundle
  return;
}

// 获取 Cloudflare KV 实例（如果在 Cloudflare Pages / Worker 环境）
function getCloudflareKV(): any | null {
  try {
    if (typeof (globalThis as any).KVIDEO_KV !== 'undefined') {
      return (globalThis as any).KVIDEO_KV;
    }
    if (typeof process !== 'undefined' && (process.env as any).KVIDEO_KV) {
      return (process.env as any).KVIDEO_KV;
    }
  } catch {
    // 忽略异常
  }
  return null;
}

const CF_KV_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CF_API_KEY || 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const CF_KV_EMAIL = process.env.CLOUDFLARE_EMAIL || process.env.CF_EMAIL || 'zeyelvis@gmail.com';

/**
 * 读取 KV 中的原始字符串（优先原生 Cloudflare Binding，本地环境透明走 REST API + 内存缓存）
 */
export async function kvGet(key: string): Promise<string | null> {
  const kv = getCloudflareKV();
  if (kv && typeof kv.get === 'function') {
    try {
      const val = await kv.get(key);
      if (val !== null && val !== undefined) return val;
    } catch (e) {
      console.warn(`[KV get] error for key ${key}:`, e);
    }
  }

  // 本地开发或非 Worker 环境：透明通过 Cloudflare REST API 直连并写入内存缓存
  if (!kv && typeof fetch === 'function' && CF_KV_API_KEY && CF_KV_EMAIL) {
    if (memoryStore.has(key)) {
      return memoryStore.get(key) || null;
    }
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
      const res = await fetch(url, {
        headers: {
          'X-Auth-Email': CF_KV_EMAIL,
          'X-Auth-Key': CF_KV_API_KEY,
        },
      });
      if (res.ok) {
        const val = await res.text();
        memoryStore.set(key, val);
        return val;
      }
    } catch (err) {
      // 网络离线或超时静默回退
    }
  }

  // 回退到内存预烘焙字典
  await ensurePrebakedSeeded();
  return memoryStore.get(key) || null;
}

/**
 * 写入 KV
 */
export async function kvPut(key: string, value: string): Promise<void> {
  await ensurePrebakedSeeded();
  memoryStore.set(key, value);

  const kv = getCloudflareKV();
  if (kv && typeof kv.put === 'function') {
    try {
      await kv.put(key, value);
    } catch (e) {
      console.warn(`[KV put] error for key ${key}:`, e);
    }
  }
}

/**
 * 物理删除 KV 键（用于毒化键清理与索引自愈）
 */
export async function kvDelete(key: string): Promise<void> {
  memoryStore.delete(key);

  const kv = getCloudflareKV();
  if (kv && typeof kv.delete === 'function') {
    try {
      await kv.delete(key);
    } catch (e) {
      console.warn(`[KV delete] error for key ${key}:`, e);
    }
    return;
  }

  // 本地开发或非 Worker 环境：透明通过 Cloudflare REST API 直连物理删除
  if (!kv && typeof fetch === 'function' && CF_KV_API_KEY && CF_KV_EMAIL) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
      await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-Auth-Email': CF_KV_EMAIL,
          'X-Auth-Key': CF_KV_API_KEY,
        },
      });
    } catch (err) {
      console.warn(`[KV delete REST] error for key ${key}:`, err);
    }
  }
}

/**
 * 根据实体 ID 获取影片
 * @param entityId 如 "ik000001"
 */
export async function getEntityById(entityId: string): Promise<TitleEntity | null> {
  if (!entityId) return null;
  const cleanId = entityId.toLowerCase();
  const raw = await kvGet(`entity:${cleanId}`);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as TitleEntity;
      parsed.directors = (parsed.directors || []).filter(d => d && d !== '知名导演');
      parsed.actors = (parsed.actors || []).filter(a => a && a !== '实力主演');
      return parsed;
    } catch {}
  }
  // 兜底从内存预烘焙中查找
  await ensurePrebakedSeeded();
  const memRaw = memoryStore.get(`entity:${cleanId}`);
  if (memRaw) {
    try {
      const parsed = JSON.parse(memRaw) as TitleEntity;
      parsed.directors = (parsed.directors || []).filter(d => d && d !== '知名导演');
      parsed.actors = (parsed.actors || []).filter(a => a && a !== '实力主演');
      return parsed;
    } catch {}
  }
  return null;
}

/**
 * 根据 slug 获取影片（支持 "ik000001-xiao-shen-ke-de-jiu-shu" 或 "ik000001"）
 */
export async function getEntityBySlug(slugKey: string): Promise<TitleEntity | null> {
  if (!slugKey) return null;
  const cleanKey = slugKey.toLowerCase();

  // 1. 优先尝试从 slug 显式映射取 entityId（如旧 URL 301 映射、历史别名权威路由）
  const explicitTargetId = await kvGet(`slug:${cleanKey}`);
  if (explicitTargetId) {
    const ent = await getEntityById(explicitTargetId);
    if (ent) {
      // 显式映射属于权威别名路由，直接返回实体，无需再因 URL 拼写差异丢弃
      return ent;
    }
  }

  // 2. 如果无显式 slug 映射，解析是否带有 ik[6位数字] 前缀
  const match = cleanKey.match(/^(ik\d{6})/i);
  if (match) {
    const targetId = match[1].toLowerCase();
    const ent = await getEntityById(targetId);
    if (ent) {
      // 🌟 强一致防线：如果 slugKey 带有附加标题部分（例如 ik002001-仙逆剧场版-弑仙之战），
      // 校验 URL 中的标题部分与实体（中文标题、原名、实体slug）是否具有语义相关性
      const parts = cleanKey.split('-');
      if (parts.length > 1) {
        const urlTitlePart = parts.slice(1).join('-');
        const isMatch =
          !urlTitlePart ||
          hasTitleOverlap(ent.title, urlTitlePart) ||
          (ent.originalTitle && hasTitleOverlap(ent.originalTitle, urlTitlePart)) ||
          (ent.slug && hasTitleOverlap(ent.slug, urlTitlePart));

        if (!isMatch) {
          console.warn(`[getEntityBySlug Mismatch Discarded]: URL part="${urlTitlePart}" does not match entity.title="${ent.title}" (targetId=${targetId})`);
          return null;
        }
      }
      return ent;
    }
  }

  return null;
}

/**
 * 根据 TMDB ID 查询实体（用于导入排重与权威匹配）
 * 核心防线：增加「读取时自动核验与净化（On-Access Auto-Purge）」机制
 * 若 KV 中存储的实体 tmdbId 与入参不一致，立即物理删除该毒化反向索引键并返回 null！
 */
export async function getEntityByTmdb(tmdbType: 'movie' | 'tv', tmdbId: string): Promise<TitleEntity | null> {
  if (!tmdbId) return null;
  const key = `tmdb:${tmdbType}:${tmdbId}`;
  const entityId = await kvGet(key);
  if (!entityId) return null;

  const ent = await getEntityById(entityId);
  if (!ent) {
    // 实体本身不存在，物理清理死键
    await kvDelete(key);
    return null;
  }

  // 🌟 核心防线：强一致核验实体内部的 tmdbId 与 tmdbType
  if (String(ent.tmdbId) !== String(tmdbId) || (ent.tmdbType && ent.tmdbType !== tmdbType)) {
    console.warn(`[getEntityByTmdb Auto-Purge] Poisoned key detected: ${key} -> ${entityId} (actual entity tmdbId: ${ent.tmdbId}, type: ${ent.tmdbType}, title: ${ent.title}). Purging!`);
    await kvDelete(key);
    return null;
  }

  return ent;
}

/**
 * 根据影片名称查询实体（用于历史 URL 301 重定向）
 */
export async function getEntityByTitle(title: string): Promise<TitleEntity | null> {
  if (!title) return null;
  const norm = normalizeTitle(title);
  if (!norm) return null;
  const entityId = await kvGet(`title:${norm}`);
  if (!entityId) return null;
  const ent = await getEntityById(entityId);
  if (!ent) {
    await kvDelete(`title:${norm}`);
    return null;
  }

  // 强一致防毒化自愈：严格比对条目名称与查询词是否有实质语义重叠
  const isOverlap =
    hasTitleOverlap(title, ent.title) ||
    (ent.originalTitle && hasTitleOverlap(title, ent.originalTitle)) ||
    (ent.slug && hasTitleOverlap(title, ent.slug));

  if (!isOverlap) {
    console.warn(`[getEntityByTitle Auto-Purge] Poisoned title key detected: title:${norm} -> ${entityId} (actual title: "${ent.title}", expected: "${title}"). Purging!`);
    await kvDelete(`title:${norm}`);
    return null;
  }

  return ent;
}

/**
 * 保存或更新实体到 KV（并同步更新全套二级反向索引）
 */
export async function saveEntity(entity: TitleEntity): Promise<void> {
  if (!entity || !entity.entityId) return;

  const id = entity.entityId.toLowerCase();
  const slugKey = `${id}-${entity.slug}`.toLowerCase();
  const normTitle = normalizeTitle(entity.title);

  // 1. 保存主键实体
  await kvPut(`entity:${id}`, JSON.stringify(entity));

  // 2. 保存 Slug 索引
  await kvPut(`slug:${slugKey}`, id);
  await kvPut(`slug:${id}`, id);

  // 3. 保存 TMDB 索引
  if (entity.tmdbId) {
    await kvPut(`tmdb:${entity.tmdbType}:${entity.tmdbId}`, id);
  }

  // 4. 保存标题归一化索引 (供 301 重定向命中)
  if (normTitle) {
    await kvPut(`title:${normTitle}`, id);
  }

  // 5. 追加到全局所有 ID 列表与 Sitemap 轻量全量目录
  const rawAll = await kvGet('index:all');
  const allIds: string[] = rawAll ? JSON.parse(rawAll) : [];
  if (!allIds.includes(id)) {
    allIds.push(id);
    await kvPut('index:all', JSON.stringify(allIds));
  }

  try {
    const rawCatalog = await kvGet('sitemap:catalog');
    let catalog: [string, string, string][] = rawCatalog ? JSON.parse(rawCatalog) : [];
    const modDate = (entity.updatedAt || entity.createdAt || new Date().toISOString()).split('T')[0];
    catalog = catalog.filter(c => c[0] !== id);
    catalog.push([id, entity.slug || id, modDate]);
    await kvPut('sitemap:catalog', JSON.stringify(catalog));
  } catch (err) {
    console.warn('[saveEntity] sitemap:catalog update warning:', err);
  }

  // 6. 追加到分类索引
  if (Array.isArray(entity.genres)) {
    for (const g of entity.genres) {
      const gKey = `genre:${g.trim()}`;
      const rawG = await kvGet(gKey);
      const gList: string[] = rawG ? JSON.parse(rawG) : [];
      if (!gList.includes(id)) {
        gList.push(id);
        await kvPut(gKey, JSON.stringify(gList));
      }
    }
  }

  // 7. 追加到导演索引（严禁脱口秀/综艺通告等非影视正片污染）
  if (Array.isArray(entity.directors) && !isInvalidDramaOrMovie(entity)) {
    for (const d of entity.directors) {
      if (!d || d === '知名导演') continue;
      const dKey = `director:${d.trim()}`;
      const rawD = await kvGet(dKey);
      const dList: string[] = rawD ? JSON.parse(rawD) : [];
      if (!dList.includes(id)) {
        dList.push(id);
        await kvPut(dKey, JSON.stringify(dList));
      }
    }
  }

  // 8. 追加到演员索引（严禁脱口秀/综艺通告等非影视正片污染）
  if (Array.isArray(entity.actors) && !isInvalidDramaOrMovie(entity)) {
    for (const a of entity.actors) {
      if (!a || a === '实力主演') continue;
      const aKey = `actor:${a.trim()}`;
      const rawA = await kvGet(aKey);
      const aList: string[] = rawA ? JSON.parse(rawA) : [];
      if (!aList.includes(id)) {
        aList.push(id);
        await kvPut(aKey, JSON.stringify(aList));
      }
    }
  }

  // 9. 追加到专区频道索引 (channel:movie, channel:tv, channel:anime, etc.)
  if (entity.type) {
    const ch = entity.type.toLowerCase().trim();
    await appendToIndex(`channel:${ch}`, id);
    if (ch === 'short-drama' || ch === 'short') {
      await appendToIndex('channel:short', id);
      await appendToIndex('channel:short-drama', id);
    }
  }

  // 10. 追加到地区索引 (region:美国, region:泰国, etc.)
  const regionTokens = getRegionTokens(entity.region);
  for (const r of regionTokens) {
    await appendToIndex(`region:${r}`, id);
  }

  // 11. 追加到年份索引 (year:2026, year:2025, etc.)
  if (entity.year) {
    const y = String(entity.year).trim();
    await appendToIndex(`year:${y}`, id);
  }

  // 12. 追加到语言索引 (language:国语, language:英语, etc.)
  const langTokens = getLanguageTokens(entity.language);
  for (const l of langTokens) {
    await appendToIndex(`language:${l}`, id);
  }

  // 13. 追加到连载状态索引 (status:完结, status:连载中, etc.)
  const statusTokens = getStatusTokens(entity.status);
  for (const s of statusTokens) {
    await appendToIndex(`status:${s}`, id);
  }

  // 14. 原子维护最近入库有序索引 (recent:all 与 recent:${entity.type})
  const recentItem: RecentTitleItem = {
    entityId: id,
    title: entity.title,
    slug: entity.slug,
    cover: entity.cover,
    backdrop: entity.backdrop || entity.cover,
    rate: entity.rate || '8.8',
    year: entity.year || '2026',
    type: entity.type,
    genres: entity.genres || [],
    createdAt: entity.createdAt || new Date().toISOString(),
  };

  // 严格安全内容铁律：成人低俗词汇、日文假名地下录像与垃圾片坚决不进入最近上线索引
  if (isSafeRecentTitleItem(recentItem)) {
    const updateRecentList = async (key: string) => {
      try {
        const rawList = await kvGet(key);
        let list: RecentTitleItem[] = rawList ? JSON.parse(rawList) : [];
        // 排重同 id 或归一化同名实体
        list = list.filter(item => item.entityId !== id && normalizeTitle(item.title) !== normTitle && isSafeRecentTitleItem(item));
        list.unshift(recentItem);
        if (list.length > 60) list = list.slice(0, 60);
        await kvPut(key, JSON.stringify(list));
      } catch (e) {
        console.warn(`[saveEntity] updateRecentList failed for ${key}:`, e);
      }
    };

    await updateRecentList('recent:all');
    if (entity.type === 'movie' || entity.type === 'tv') {
      await updateRecentList(`recent:${entity.type}`);
    }
  }
}

// ── 辅助函数：分词与多维标签提取 ─────────────────────────────────

function getRegionTokens(region?: string): string[] {
  if (!region) return [];
  const tokens = new Set<string>();
  const str = String(region).trim();
  const lower = str.toLowerCase();

  // 1. 中英文国别与大区映射
  if (lower.includes('united states') || lower.includes('usa') || lower === 'us' || str.includes('美国')) {
    tokens.add('美国');
    tokens.add('欧美');
  }
  if (lower.includes('united kingdom') || lower.includes('uk') || str.includes('英国')) {
    tokens.add('英国');
    tokens.add('欧美');
  }
  if (lower.includes('korea') || str.includes('韩国') || str.includes('韩剧')) {
    tokens.add('韩国');
    tokens.add('韩剧');
    tokens.add('日韩');
  }
  if (lower.includes('japan') || str.includes('日本') || str.includes('日剧')) {
    tokens.add('日本');
    tokens.add('日剧');
    tokens.add('日韩');
  }
  if (lower.includes('thailand') || str.includes('泰国') || str.includes('泰剧')) {
    tokens.add('泰国');
    tokens.add('泰剧');
    tokens.add('东南亚');
  }
  if (lower.includes('hong kong') || str.includes('香港') || str.includes('港剧')) {
    tokens.add('香港');
    tokens.add('港台');
    tokens.add('华语');
  }
  if (lower.includes('taiwan') || str.includes('台湾') || str.includes('台剧')) {
    tokens.add('台湾');
    tokens.add('港台');
    tokens.add('华语');
  }
  if (lower.includes('china') || str.includes('大陆') || str.includes('内地') || str.includes('国产') || str === '中国') {
    tokens.add('大陆');
    tokens.add('中国大陆');
    tokens.add('华语');
    tokens.add('国产');
  }
  if (lower.includes('france') || str.includes('法国') || lower.includes('germany') || str.includes('德国') || lower.includes('canada') || str.includes('加拿大')) {
    tokens.add('欧美');
  }

  // 2. 切分词
  const rawParts = str.split(/[/,、| \t]+/).map(s => s.trim()).filter(Boolean);
  for (const part of rawParts) {
    if (part.length > 1 && !['of', 'the', 'and'].includes(part.toLowerCase())) {
      tokens.add(part);
    }
  }

  return Array.from(tokens);
}

function getLanguageTokens(lang?: string): string[] {
  if (!lang) return [];
  const tokens = new Set<string>();
  const rawParts = lang.split(/[/,、| \t]+/).map(s => s.trim()).filter(Boolean);
  for (const part of rawParts) {
    tokens.add(part);
    if (part.includes('国语') || part.includes('普通话') || part.includes('汉语') || part.includes('中文')) {
      tokens.add('国语');
      tokens.add('普通话');
      tokens.add('华语');
    }
    if (part.includes('粤语') || part.includes('广东话')) {
      tokens.add('粤语');
    }
    if (part.includes('英语') || part.toLowerCase().includes('english')) {
      tokens.add('英语');
    }
    if (part.includes('日语') || part.toLowerCase().includes('japanese')) {
      tokens.add('日语');
    }
    if (part.includes('韩语') || part.toLowerCase().includes('korean')) {
      tokens.add('韩语');
    }
    if (part.includes('泰语') || part.toLowerCase().includes('thai')) {
      tokens.add('泰语');
    }
  }
  return Array.from(tokens);
}

function getStatusTokens(status?: string): string[] {
  const tokens = new Set<string>();
  const str = `${status || ''}`;
  if (str.includes('完结') || str.includes('全集') || str.includes('HD') || str.includes('BD') || str.includes('1080P') || str.includes('4K')) {
    tokens.add('完结');
  }
  if (str.includes('连载') || str.includes('更新') || str.includes('第') || str.includes('期')) {
    tokens.add('连载中');
    tokens.add('连载');
  }
  return Array.from(tokens);
}

async function appendToIndex(key: string, id: string): Promise<void> {
  try {
    const raw = await kvGet(key);
    let list: string[] = raw ? JSON.parse(raw) : [];
    if (!list.includes(id)) {
      list.unshift(id);
      if (list.length > 100000) list = list.slice(0, 100000);
      await kvPut(key, JSON.stringify(list));
    }
  } catch (err) {
    console.warn(`[appendToIndex] failed for key ${key}:`, err);
  }
}

// ── 多维精准检索接口定义与核心实现 ──────────────────────────────

export interface QueryEntitiesFilters {
  channel?: string;    // movie | tv | anime | variety | documentary | short
  genre?: string;      // 科幻 | 动作 | 爱情 ...
  region?: string;     // 美国 | 大陆 | 香港 | 台湾 | 韩国 | 日本 | 泰国 ...
  year?: string;       // 2026 | 2025 ...
  language?: string;   // 国语 | 英语 | 泰语 ...
  status?: string;     // 完结 | 连载中
  sort?: 'latest' | 'rating' | 'popularity' | 'hits' | 'time' | 'rank' | string;
  page?: number;
  limit?: number;
}

export interface QueryEntitiesResult {
  items: TitleEntity[];
  total: number;
  page: number;
  pageCount: number;
  limit: number;
}

/**
 * 多维筛选查询（这是替代第三方采集站 API 代理的核心片库查询引擎）
 *
 * 核心原理：
 * 1. 根据筛选条件读取各分类反向索引集合（KV 键值直出）
 * 2. 对各条件 ID 列表执行原子交集运算（Set 内存过滤）
 * 3. 统计真实总数并计算分页
 * 4. 针对当前页所需数据并行批量装配完整实体
 */
export async function queryEntities(filters: QueryEntitiesFilters = {}): Promise<QueryEntitiesResult> {
  const page = Math.max(1, Number(filters.page) || 1);
  const limit = Math.max(1, Math.min(100, Number(filters.limit) || 36));

  const indexKeys: string[] = [];

  // 1. Channel 筛选
  if (filters.channel && filters.channel !== 'all' && filters.channel !== '全部') {
    let ch = filters.channel.toLowerCase().trim();
    if (ch === 'short-drama') ch = 'short';
    indexKeys.push(`channel:${ch}`);
  }

  // 2. Genre 筛选
  if (filters.genre && filters.genre !== 'all' && filters.genre !== '全部') {
    indexKeys.push(`genre:${filters.genre.trim()}`);
  }

  // 3. Region 筛选
  if (filters.region && filters.region !== 'all' && filters.region !== '全部') {
    indexKeys.push(`region:${filters.region.trim()}`);
  }

  // 4. Year 筛选（支持语义年份：今年/去年/更早/90年代/80年代/怀旧 → 多年份并集）
  let yearUnionIds: string[] | null = null; // 当语义年份需要并集时使用
  if (filters.year && filters.year !== 'all' && filters.year !== '全部') {
    const yearStr = filters.year.trim();
    const currentYear = new Date().getFullYear();
    let semanticYears: number[] | null = null;

    if (yearStr === '今年') {
      semanticYears = [currentYear, currentYear - 1];
    } else if (yearStr === '去年') {
      semanticYears = [currentYear - 1, currentYear - 2];
    } else if (yearStr === '更早') {
      semanticYears = [];
      for (let y = 2000; y < currentYear - 2; y++) semanticYears.push(y);
    } else if (yearStr === '90年代') {
      semanticYears = [];
      for (let y = 1990; y <= 1999; y++) semanticYears.push(y);
    } else if (yearStr === '80年代') {
      semanticYears = [];
      for (let y = 1980; y <= 1989; y++) semanticYears.push(y);
    } else if (yearStr === '怀旧') {
      semanticYears = [];
      for (let y = 1920; y < 1980; y++) semanticYears.push(y);
    }

    if (semanticYears !== null) {
      // 语义年份：并发读取多个 year:XXXX 索引并做并集
      const yearRawResults = await Promise.all(
        semanticYears.map(y => kvGet(`year:${y}`))
      );
      const yearUnionSet = new Set<string>();
      for (const raw of yearRawResults) {
        if (raw) {
          try {
            const arr = JSON.parse(raw);
            if (Array.isArray(arr)) arr.forEach((id: string) => yearUnionSet.add(id));
          } catch { /* 忽略解析异常 */ }
        }
      }
      yearUnionIds = Array.from(yearUnionSet);
    } else {
      // 精确年份（如 "2026"）：直接走常规索引键
      indexKeys.push(`year:${yearStr}`);
    }
  }

  // 5. Language 筛选
  if (filters.language && filters.language !== 'all' && filters.language !== '全部') {
    indexKeys.push(`language:${filters.language.trim()}`);
  }

  // 6. Status 筛选（映射 "全集" → "完结"，UI 可能传 "全集" 但 KV 存的是 "完结"）
  if (filters.status && filters.status !== 'all' && filters.status !== '全部') {
    const s = filters.status.trim();
    const statusKey = s.includes('连载') ? '连载中' : (s === '全集' ? '完结' : s);
    indexKeys.push(`status:${statusKey}`);
  }

  let matchedIds: string[] = [];

  if (indexKeys.length === 0 && yearUnionIds === null) {
    // 无任何细化筛选条件时，使用全局全部条目索引
    const rawAll = await kvGet('index:all');
    matchedIds = rawAll ? JSON.parse(rawAll) : [];
  } else if (indexKeys.length === 0 && yearUnionIds !== null) {
    // 仅有语义年份筛选，无其他索引条件
    matchedIds = yearUnionIds;
  } else {
    // 并发读取各维度的 ID 列表
    const idLists: string[][] = [];
    for (const key of indexKeys) {
      const raw = await kvGet(key);
      if (raw) {
        try {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            idLists.push(arr);
          } else {
            idLists.push([]);
          }
        } catch {
          idLists.push([]);
        }
      } else {
        idLists.push([]);
      }
    }

    // 如果有语义年份并集结果，将其作为额外的交集维度纳入
    if (yearUnionIds !== null) {
      idLists.push(yearUnionIds);
    }

    // 按数组长度升序排列（从最小集合开始求交集，计算耗时最优）
    idLists.sort((a, b) => a.length - b.length);

    if (idLists.length === 0 || idLists[0].length === 0) {
      matchedIds = [];
    } else {
      let currentSet = new Set<string>(idLists[0]);
      for (let i = 1; i < idLists.length; i++) {
        const nextList = idLists[i];
        const nextSet = new Set<string>(nextList);
        currentSet = new Set<string>([...currentSet].filter(id => nextSet.has(id)));
        if (currentSet.size === 0) break;
      }
      matchedIds = Array.from(currentSet);
    }
  }

  const total = matchedIds.length;
  const pageCount = Math.max(1, Math.ceil(total / limit));

  if (total === 0) {
    return {
      items: [],
      total: 0,
      page,
      pageCount: 0,
      limit,
    };
  }

  const sortMode = (filters.sort || 'time').toLowerCase();
  const isScoreSort = sortMode === 'rank' || sortMode === 'rating' || sortMode === 'score';
  const isHitsSort = sortMode === 'hits' || sortMode === 'popularity' || sortMode === 'recommend';

  // 如果需要按高分或综合热度排序：
  if (isScoreSort || isHitsSort) {
    // 限制加载前 150 条候选 ID 进行精确加权排序
    const candidateIds = matchedIds.slice(0, 150);
    const candidateEntities = (await Promise.all(candidateIds.map(id => getEntityById(id)))).filter(Boolean) as TitleEntity[];

    if (isScoreSort) {
      candidateEntities.sort((a, b) => parseFloat(b.rate || '0') - parseFloat(a.rate || '0'));
    } else if (isHitsSort) {
      candidateEntities.sort((a, b) => {
        const popA = a.popularity || (parseFloat(a.rate || '0') * 10 + (a.year ? parseInt(a.year, 10) : 0));
        const popB = b.popularity || (parseFloat(b.rate || '0') * 10 + (b.year ? parseInt(b.year, 10) : 0));
        return popB - popA;
      });
    }

    const startIndex = (page - 1) * limit;
    const items = candidateEntities.slice(startIndex, startIndex + limit);

    return {
      items,
      total,
      page,
      pageCount,
      limit,
    };
  }

  // 默认或按最新上映（time / latest）：ID 数组内部最新实体居首，直接切片后按需并行加载
  const startIndex = (page - 1) * limit;
  const pageIds = matchedIds.slice(startIndex, startIndex + limit);
  const items = (await Promise.all(pageIds.map(id => getEntityById(id)))).filter(Boolean) as TitleEntity[];

  return {
    items,
    total,
    page,
    pageCount,
    limit,
  };
}

const ADULT_BLACKLIST_WORDS = [
  '売春', '愛汁', '肉しびれ', '女囚', '痴情', '痴漢', '快辱', '熟女', '巨乳', '乱交',
  '調教', '無修正', '盗撮', '近親', '色情', '三级', '情色', 'AV', '成人', 'ポルノ', 'エロ',
  'YOSHIO', 'Kis-My-Ft2', 'ジャニーズ', 'Unnatural Causes'
];

/**
 * 严格安全内容铁律：主站轨道 A 绝不允许任何成人低俗内容、日文假名条目或纯外文垃圾条目泄露
 */
export function isSafeRecentTitleItem(item: RecentTitleItem): boolean {
  if (!item || !item.title) return false;
  const t = item.title;
  // 1. 严格华语合法标题过滤（阻断日文假名、韩文、无中文字符纯外文、违规黑名单）
  if (!isCleanChineseTitle(t)) return false;
  // 2. 极低评分异常垃圾片阻断
  if (item.rate && parseFloat(item.rate) <= 3.0 && item.year && parseInt(item.year, 10) < 2024) return false;
  return true;
}

/**
 * 获取最新入库的影视条目（用于首页及频道专区「最新上线」货架、RSS Feed 等）
 * @param limit 获取数量限制（默认 20，上限 60）
 * @param type 可选 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | 'all' 筛选
 */
export async function listRecentEntities(limit = 20, type?: string): Promise<RecentTitleItem[]> {
  const normalizedChannel = (type || 'all').toLowerCase().trim();
  const validChannels = ['movie', 'tv', 'anime', 'variety', 'documentary', 'short'];
  const channelKey = validChannels.includes(normalizedChannel) ? normalizedChannel : 'all';
  const targetKey = channelKey === 'all' ? 'recent:all' : `recent:${channelKey}`;

  // 1. 尝试从 Cloudflare KV 获取增量缓存（经过双重安全过滤）
  const raw = await kvGet(targetKey);
  if (raw) {
    try {
      const items = JSON.parse(raw) as RecentTitleItem[];
      if (Array.isArray(items) && items.length > 0) {
        const safeItems = items.filter(isSafeRecentTitleItem);
        if (safeItems.length > 0) {
          return safeItems.slice(0, limit);
        }
      }
    } catch (e) {
      console.warn(`[listRecentEntities] parse error for ${targetKey}:`, e);
    }
  }

  // 2. 真实预烘焙直出：全专区 0ms 秒开且 100% 具备真实的 24h 最新上线影片、连载集数与 TMDB 高清海报
  await ensurePrebakedSeeded();
  const rawMem = memoryStore.get(`recent:${channelKey}`);
  if (rawMem) {
    try {
      const items = JSON.parse(rawMem) as RecentTitleItem[];
      if (Array.isArray(items) && items.length > 0) {
        const safeItems = items.filter(isSafeRecentTitleItem);
        if (safeItems.length > 0) {
          return safeItems.slice(0, limit);
        }
      }
    } catch {}
  }

  // 短剧专区专属兜底：若为空直接返回空列表，绝不回退到全站普通长视频
  if (channelKey === 'short') {
    return [];
  }

  // 3. 终极兜底：预烘焙核心影片
  const fallbackList: RecentTitleItem[] = [];
  const now = Date.now();
  const seen = new Set<string>();

  for (const [k, v] of memoryStore.entries()) {
    if (k.startsWith('entity:')) {
      try {
        const ent = JSON.parse(v) as TitleEntity;
        if (channelKey !== 'all' && ent.type !== channelKey) continue;
        const norm = normalizeTitle(ent.title);
        if (seen.has(norm)) continue;
        seen.add(norm);

        fallbackList.push({
          entityId: ent.entityId,
          title: ent.title,
          slug: ent.slug,
          cover: ent.cover,
          backdrop: ent.backdrop,
          rate: ent.rate,
          year: ent.year,
          type: ent.type,
          genres: ent.genres,
          createdAt: ent.createdAt || new Date(now - fallbackList.length * 3600000).toISOString(),
        });
        if (fallbackList.length >= limit) break;
      } catch {}
    }
  }

  return fallbackList.slice(0, limit);
}

/**
 * 分页或按数量获取分类下的实体列表（用于分类聚合页与内链推荐）
 */
export async function getEntitiesByGenre(genre: string, limit = 12): Promise<TitleEntity[]> {
  if (!genre) return [];
  const raw = await kvGet(`genre:${genre.trim()}`);
  if (!raw) return [];
  try {
    const ids: string[] = JSON.parse(raw);
    const selectedIds = ids.slice(0, limit);
    const results = await Promise.all(selectedIds.map(id => getEntityById(id)));
    return results.filter((e): e is TitleEntity => e !== null);
  } catch {
    return [];
  }
}

/**
 * 覆写指定导演或演员的作品 ID 列表索引（用于清洗脏数据和自愈更新）
 */
export async function setPersonEntitiesIndex(role: 'director' | 'actor', personName: string, entityIds: string[]): Promise<void> {
  const clean = personName.trim();
  const key = `${role}:${clean}`;
  await kvPut(key, JSON.stringify(entityIds));
}

/**
 * 检查该人物是否已完成过深度全量代表作扩充
 */
export async function isPersonEnriched(role: 'director' | 'actor', personName: string): Promise<boolean> {
  const clean = personName.trim();
  const val = await kvGet(`person:enriched:${role}:${clean}`);
  return val === '1';
}

/**
 * 标记该人物已完成深度全量代表作扩充
 */
export async function markPersonEnriched(role: 'director' | 'actor', personName: string): Promise<void> {
  const clean = personName.trim();
  await kvPut(`person:enriched:${role}:${clean}`, '1');
}

/**
 * 获取同导演作品（用于详情页内链与导演作品专栏，严格剔除脱口秀/综艺通告）
 */
export async function getEntitiesByDirector(director: string, limit = 48): Promise<TitleEntity[]> {
  if (!director || director === '知名导演') return [];
  let name = director.trim();
  try {
    name = decodeURIComponent(name).trim();
  } catch {
    // 忽略异常
  }
  if (name === '知名导演') return [];

  const raw = await kvGet(`director:${name}`);
  let ids: string[] = [];
  try {
    if (raw) ids = JSON.parse(raw);
  } catch {}

  // 若 KV 查询结果为空，自动兜底从内存预烘焙索引中查找
  if (!ids || ids.length === 0) {
    await ensurePrebakedSeeded();
    const memRaw = memoryStore.get(`director:${name}`);
    if (memRaw) {
      try {
        ids = JSON.parse(memRaw);
      } catch {}
    }
  }

  if (!ids || ids.length === 0) return [];

  // 取更多条目以应对脱口秀过滤
  const selectedIds = ids.slice(0, Math.max(limit * 2, 60));
  const results = await Promise.all(selectedIds.map(id => getEntityById(id)));
  const valid = results
    .filter((e): e is TitleEntity => e !== null)
    .filter(e => !isInvalidDramaOrMovie(e));
  return valid.slice(0, limit);
}

/**
 * 获取同主演作品（用于详情页内链与演员作品专栏，严格剔除脱口秀/综艺通告）
 */
export async function getEntitiesByActor(actor: string, limit = 48): Promise<TitleEntity[]> {
  if (!actor || actor === '实力主演') return [];
  let name = actor.trim();
  try {
    name = decodeURIComponent(name).trim();
  } catch {
    // 忽略异常
  }
  if (name === '实力主演') return [];

  const raw = await kvGet(`actor:${name}`);
  let ids: string[] = [];
  try {
    if (raw) ids = JSON.parse(raw);
  } catch {}

  // 若 KV 查询结果为空，自动兜底从内存预烘焙索引中查找
  if (!ids || ids.length === 0) {
    await ensurePrebakedSeeded();
    const memRaw = memoryStore.get(`actor:${name}`);
    if (memRaw) {
      try {
        ids = JSON.parse(memRaw);
      } catch {}
    }
  }

  if (!ids || ids.length === 0) return [];

  // 取更多条目以应对脱口秀过滤
  const selectedIds = ids.slice(0, Math.max(limit * 2, 60));
  const results = await Promise.all(selectedIds.map(id => getEntityById(id)));
  const valid = results
    .filter((e): e is TitleEntity => e !== null)
    .filter(e => !isInvalidDramaOrMovie(e));
  return valid.slice(0, limit);
}

export interface SitemapCatalogEntry {
  id: string;
  slug: string;
  updatedAt: string;
}

/**
 * 获取所有实体 ID 列表（用于 Sitemap Index 生成）
 */
export async function getAllEntityIds(): Promise<string[]> {
  const raw = await kvGet('index:all');
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

/**
 * 极速获取全量实体紧凑索引（用于 Sitemap 毫秒级直出，单次 KV 读取，彻底消除 Edge Subrequest 限制）
 */
export async function getSitemapCatalog(): Promise<SitemapCatalogEntry[]> {
  const raw = await kvGet('sitemap:catalog');
  if (raw) {
    try {
      const list: [string, string, string][] = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) {
        return list.map(([id, slug, updatedAt]) => ({
          id,
          slug,
          updatedAt: updatedAt || new Date().toISOString().split('T')[0],
        }));
      }
    } catch {}
  }

  // 兜底自愈：从内存预烘焙数据中提取全量已有实体
  await ensurePrebakedSeeded();
  const catalog: SitemapCatalogEntry[] = [];
  const seenIds = new Set<string>();

  for (const [key, value] of memoryStore.entries()) {
    if (key.startsWith('entity:')) {
      try {
        const ent = JSON.parse(value) as TitleEntity;
        if (ent && ent.entityId && !seenIds.has(ent.entityId)) {
          seenIds.add(ent.entityId);
          catalog.push({
            id: ent.entityId,
            slug: ent.slug || ent.entityId,
            updatedAt: (ent.updatedAt || ent.createdAt || new Date().toISOString()).split('T')[0],
          });
        }
      } catch {}
    }
  }

  // 回写优化后续读取
  if (catalog.length > 0) {
    const compact = catalog.map(c => [c.id, c.slug, c.updatedAt]);
    kvPut('sitemap:catalog', JSON.stringify(compact)).catch(() => {});
  }

  return catalog;
}

/**
 * 获取下一个自增序号并更新计数器
 */
export async function getNextEntitySeq(): Promise<number> {
  const raw = await kvGet('counter:next_id');
  const current = raw ? parseInt(raw, 10) || 1 : 1;
  await kvPut('counter:next_id', String(current + 1));
  return current;
}

/**
 * 获取已知全部导演与演员名单（用于人物 Sitemap 生成）
 */
export async function getKnownPeople(): Promise<{ directors: string[]; actors: string[] }> {
  const { POPULAR_DIRECTORS, POPULAR_ACTORS } = await import('@/lib/data/popular-people');
  const rawDirs = await kvGet('people:directors');
  const rawActs = await kvGet('people:actors');
  const dirSet = new Set<string>(POPULAR_DIRECTORS);
  const actSet = new Set<string>(POPULAR_ACTORS);

  try {
    if (rawDirs) {
      const parsed = JSON.parse(rawDirs);
      if (Array.isArray(parsed)) {
        for (const d of parsed) {
          if (d && d !== '知名导演') dirSet.add(d);
        }
      }
    }
  } catch {}

  try {
    if (rawActs) {
      const parsed = JSON.parse(rawActs);
      if (Array.isArray(parsed)) {
        for (const a of parsed) {
          if (a && a !== '实力主演') actSet.add(a);
        }
      }
    }
  } catch {}

  return {
    directors: Array.from(dirSet),
    actors: Array.from(actSet),
  };
}

/**
 * 用户求片工单记录结构
 */
export interface TitleDemandRecord {
  entityId: string;
  title: string;
  year?: string;
  type?: string;
  poster?: string;
  count: number;
  firstRequestedAt: string;
  lastRequestedAt: string;
}

/**
 * 记录一次用户求片工单（原子递增计数并刷新排行榜）
 */
export async function recordTitleDemand(data: {
  entityId: string;
  title: string;
  year?: string;
  type?: string;
  poster?: string;
}): Promise<TitleDemandRecord> {
  const entityId = data.entityId.trim();
  const key = `demand:title:${entityId}`;
  const now = new Date().toISOString();

  let record: TitleDemandRecord;
  const existingRaw = await kvGet(key);

  if (existingRaw) {
    try {
      const parsed = JSON.parse(existingRaw);
      record = {
        ...parsed,
        title: data.title || parsed.title,
        year: data.year || parsed.year,
        type: data.type || parsed.type,
        poster: data.poster || parsed.poster,
        count: (parsed.count || 1) + 1,
        lastRequestedAt: now,
      };
    } catch {
      record = {
        entityId,
        title: data.title,
        year: data.year,
        type: data.type,
        poster: data.poster,
        count: 1,
        firstRequestedAt: now,
        lastRequestedAt: now,
      };
    }
  } else {
    record = {
      entityId,
      title: data.title,
      year: data.year,
      type: data.type,
      poster: data.poster,
      count: 1,
      firstRequestedAt: now,
      lastRequestedAt: now,
    };
  }

  // 1. 持久化单个条目
  await kvPut(key, JSON.stringify(record));

  // 2. 更新全局排行榜 (demand:leaderboard)
  try {
    const boardRaw = await kvGet('demand:leaderboard');
    let board: TitleDemandRecord[] = [];
    if (boardRaw) {
      try {
        const parsed = JSON.parse(boardRaw);
        if (Array.isArray(parsed)) board = parsed;
      } catch {}
    }

    const existingIndex = board.findIndex(b => b.entityId === entityId);
    if (existingIndex >= 0) {
      board[existingIndex] = record;
    } else {
      board.push(record);
    }

    // 按求片热度排序并截取 Top 100
    board.sort((a, b) => (b.count || 0) - (a.count || 0));
    if (board.length > 100) board = board.slice(0, 100);

    await kvPut('demand:leaderboard', JSON.stringify(board));
  } catch (err) {
    console.warn('[recordTitleDemand leaderboard update fail]:', err);
  }

  return record;
}

/**
 * 获取全局用户求片热度排行榜
 */
export async function getTitleDemandLeaderboard(limit = 50): Promise<TitleDemandRecord[]> {
  try {
    const raw = await kvGet('demand:leaderboard');
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.slice(0, limit);
  } catch {
    return [];
  }
}

