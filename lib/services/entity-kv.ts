import { TitleEntity } from '@/lib/types/entity';
import { generateSlug, formatEntityId, normalizeTitle, isInvalidDramaOrMovie, hasTitleOverlap } from '@/lib/data/entities/entity-utils';
import { PREBAKED_HOME_DATA, PrebakedSubject } from '@/lib/data/home-prebaked';
import { PREBAKED_LATEST_TITLES, LatestPrebakedItem } from '@/lib/data/latest-titles-prebaked';
import { POPULAR_DIRECTORS, POPULAR_ACTORS } from '@/lib/data/popular-people';
import { PEOPLE_PREBAKED_ENTITIES } from '@/lib/data/people-prebaked';

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

// 内存预烘焙回退字典（确保本地开发、静态构建与边缘冷启动时 0ms 秒开且具备首批 110+ 核心经典影视）
const memoryStore = new Map<string, string>();
let isPrebakedSeeded = false;

function seedPrebakedData() {
  if (isPrebakedSeeded) return;
  isPrebakedSeeded = true;

  const allPrebaked: { subject: PrebakedSubject; type: 'movie' | 'tv' }[] = [];
  const collect = (list: PrebakedSubject[], type: 'movie' | 'tv') => {
    for (const s of list) {
      if (s && s.title) allPrebaked.push({ subject: s, type });
    }
  };

  collect(PREBAKED_HOME_DATA.movie.hero, 'movie');
  collect(PREBAKED_HOME_DATA.movie.top10, 'movie');
  collect(PREBAKED_HOME_DATA.movie.s1, 'movie');
  collect(PREBAKED_HOME_DATA.movie.s2, 'movie');
  collect(PREBAKED_HOME_DATA.movie.s3, 'movie');
  collect(PREBAKED_HOME_DATA.movie.s4, 'movie');

  collect(PREBAKED_HOME_DATA.tv.hero, 'tv');
  collect(PREBAKED_HOME_DATA.tv.top10, 'tv');
  collect(PREBAKED_HOME_DATA.tv.s1, 'tv');
  collect(PREBAKED_HOME_DATA.tv.s2, 'tv');
  collect(PREBAKED_HOME_DATA.tv.s3, 'tv');
  collect(PREBAKED_HOME_DATA.tv.s4, 'tv');

  const seenTitles = new Set<string>();
  let seq = 1;
  const recentAllList: RecentTitleItem[] = [];
  const recentMovieList: RecentTitleItem[] = [];
  const recentTvList: RecentTitleItem[] = [];
  const now = Date.now();

  for (const item of allPrebaked) {
    const s = item.subject;
    const norm = normalizeTitle(s.title);
    if (seenTitles.has(norm)) continue;
    seenTitles.add(norm);

    const entityId = formatEntityId(seq++);
    const slug = generateSlug(s.title);

    // 解析 TMDB ID（优先使用显式声明的 tmdbId，其次若 s.id 也是纯数字且大于等于 4 位才回退，严禁将类似 iyf_hero_tv_5 等内部槽位字符串误读为 ID）
    const tmdbId = (s.tmdbId && /^\d+$/.test(s.tmdbId.trim()))
      ? s.tmdbId.trim()
      : ((s.id && /^\d{4,}$/.test(s.id.trim())) ? s.id.trim() : String(seq + 900000));

    // 计算一个递减的新鲜度时间戳（模拟每小时入库一部），确保冷启动时有自然的时间梯度
    const simulatedDate = new Date(now - (seq - 1) * 3600000).toISOString();

    const entity: TitleEntity = {
      entityId,
      slug,
      tmdbId,
      tmdbType: item.type,
      title: s.title,
      type: item.type,
      year: s.year || '2026',
      description: s.description || `${s.title} 是一部精彩的${item.type === 'movie' ? '电影' : '连续剧'}，评分 ${s.rate || '9.0'}，支持在 iKanPP 免费在线观看完整版高清视频。`,
      cover: s.cover,
      backdrop: s.backdrop || s.cover,
      rate: s.rate || '9.0',
      genres: s.types || [item.type === 'movie' ? '电影' : '电视剧'],
      directors: (s.directors || []).filter(d => d && d !== '知名导演'),
      actors: (s.actors || []).filter(a => a && a !== '实力主演'),
      createdAt: simulatedDate,
      updatedAt: simulatedDate,
    };

    memoryStore.set(`entity:${entityId}`, JSON.stringify(entity));
    memoryStore.set(`slug:${entityId}-${slug}`, entityId);
    memoryStore.set(`slug:${entityId}`, entityId);
    memoryStore.set(`tmdb:${entity.tmdbType}:${entity.tmdbId}`, entityId);
    memoryStore.set(`title:${norm}`, entityId);

    // 收集初始 recent 项
    const rItem: RecentTitleItem = {
      entityId,
      title: entity.title,
      slug: entity.slug,
      cover: entity.cover,
      backdrop: entity.backdrop,
      rate: entity.rate,
      year: entity.year,
      type: entity.type,
      genres: entity.genres,
      createdAt: simulatedDate,
    };
    if (recentAllList.length < 50) recentAllList.push(rItem);
    if (item.type === 'movie' && recentMovieList.length < 50) recentMovieList.push(rItem);
    if (item.type === 'tv' && recentTvList.length < 50) recentTvList.push(rItem);

    // 索引分类
    for (const g of entity.genres) {
      const gKey = `genre:${g.trim()}`;
      const existing = memoryStore.get(gKey);
      const list = existing ? JSON.parse(existing) : [];
      if (!list.includes(entityId)) {
        list.push(entityId);
        memoryStore.set(gKey, JSON.stringify(list));
      }
    }

    // 索引导演
    for (const d of entity.directors || []) {
      if (!d || d === '知名导演') continue;
      const dClean = d.trim();
      const dKey = `director:${dClean}`;
      const existing = memoryStore.get(dKey);
      const list = existing ? JSON.parse(existing) : [];
      if (!list.includes(entityId)) {
        list.push(entityId);
        memoryStore.set(dKey, JSON.stringify(list));
      }
    }

    // 索引演员
    for (const a of entity.actors || []) {
      if (!a || a === '实力主演') continue;
      const aClean = a.trim();
      const aKey = `actor:${aClean}`;
      const existing = memoryStore.get(aKey);
      const list = existing ? JSON.parse(existing) : [];
      if (!list.includes(entityId)) {
        list.push(entityId);
        memoryStore.set(aKey, JSON.stringify(list));
      }
    }
  }

  // 注入核心名导与顶级号召力巨星精选代表作库（涵盖 56+ 位核心人物，冷启动秒开且 100% 有作品）
  for (const rawEntity of PEOPLE_PREBAKED_ENTITIES) {
    const entity: TitleEntity = {
      ...rawEntity,
      directors: (rawEntity.directors || []).filter(d => d && d !== '知名导演'),
      actors: (rawEntity.actors || []).filter(a => a && a !== '实力主演'),
    };
    const norm = normalizeTitle(entity.title);
    if (!seenTitles.has(norm)) {
      seenTitles.add(norm);
      memoryStore.set(`entity:${entity.entityId}`, JSON.stringify(entity));
      memoryStore.set(`slug:${entity.entityId}-${entity.slug}`, entity.entityId);
      memoryStore.set(`slug:${entity.entityId}`, entity.entityId);
      memoryStore.set(`tmdb:${entity.tmdbType}:${entity.tmdbId}`, entity.entityId);
      memoryStore.set(`title:${norm}`, entity.entityId);
    }

    // 索引分类
    for (const g of entity.genres || []) {
      const gKey = `genre:${g.trim()}`;
      const existing = memoryStore.get(gKey);
      const list = existing ? JSON.parse(existing) : [];
      if (!list.includes(entity.entityId)) {
        list.push(entity.entityId);
        memoryStore.set(gKey, JSON.stringify(list));
      }
    }

    // 索引导演
    for (const d of entity.directors || []) {
      if (!d || d === '知名导演') continue;
      const dClean = d.trim();
      const dKey = `director:${dClean}`;
      const existing = memoryStore.get(dKey);
      const list = existing ? JSON.parse(existing) : [];
      if (!list.includes(entity.entityId)) {
        list.push(entity.entityId);
        memoryStore.set(dKey, JSON.stringify(list));
      }
    }

    // 索引演员
    for (const a of entity.actors || []) {
      if (!a || a === '实力主演') continue;
      const aClean = a.trim();
      const aKey = `actor:${aClean}`;
      const existing = memoryStore.get(aKey);
      const list = existing ? JSON.parse(existing) : [];
      if (!list.includes(entity.entityId)) {
        list.push(entity.entityId);
        memoryStore.set(aKey, JSON.stringify(list));
      }
    }
  }

  // 收集并持久化全部已知导演与演员集合
  const allDirs = new Set<string>(POPULAR_DIRECTORS);
  const allActs = new Set<string>(POPULAR_ACTORS);
  for (const [key] of memoryStore.entries()) {
    if (key.startsWith('director:')) allDirs.add(key.replace('director:', ''));
    if (key.startsWith('actor:')) allActs.add(key.replace('actor:', ''));
  }
  memoryStore.set('people:directors', JSON.stringify(Array.from(allDirs)));
  memoryStore.set('people:actors', JSON.stringify(Array.from(allActs)));

  // 注入最新上线增量作品，确保全站最新上线 0ms 直出且绝无 404
  for (const items of Object.values(PREBAKED_LATEST_TITLES)) {
    if (!Array.isArray(items)) continue;
    for (const item of items) {
      if (!item || !item.title) continue;
      const norm = normalizeTitle(item.title);
      if (seenTitles.has(norm)) continue;
      seenTitles.add(norm);

      const entityId = item.entityId && /^ik\d{6}$/i.test(item.entityId) ? item.entityId : formatEntityId(seq++);
      const slug = generateSlug(item.title);
      const simulatedDate = item.createdAt || new Date(now - (seq - 1) * 3600000).toISOString();

      const entity: TitleEntity = {
        entityId,
        slug,
        tmdbId: item.tmdbId || String(seq + 900000),
        tmdbType: item.type === 'movie' ? 'movie' : 'tv',
        title: item.title,
        type: item.type === 'movie' ? 'movie' : 'tv',
        year: item.year || '2026',
        description: `${item.title} 是一部精彩的${item.type === 'movie' ? '电影' : '连续剧'}，评分 ${item.rate || '9.0'}，支持在 iKanPP 免费在线观看完整版高清视频。`,
        cover: item.cover,
        backdrop: item.backdrop || item.cover,
        rate: item.rate || '9.0',
        genres: item.genres || [item.type === 'movie' ? '电影' : '电视剧'],
        directors: [],
        actors: [],
        createdAt: simulatedDate,
        updatedAt: simulatedDate,
      };

      memoryStore.set(`entity:${entityId}`, JSON.stringify(entity));
      if (item.entityId) {
        memoryStore.set(`entity:${item.entityId.toLowerCase()}`, JSON.stringify(entity));
        memoryStore.set(`slug:${item.entityId.toLowerCase()}-${slug}`, entityId);
        memoryStore.set(`slug:${item.entityId.toLowerCase()}`, entityId);
      }
      memoryStore.set(`slug:${entityId}-${slug}`, entityId);
      memoryStore.set(`slug:${entityId}`, entityId);
      memoryStore.set(`slug:${slug}`, entityId);
      memoryStore.set(`title:${norm}`, entityId);
      memoryStore.set(`tmdb:${entity.tmdbType}:${entity.tmdbId}`, entityId);
    }
  }

  // 全量实体索引
  const allIds = Array.from(seenTitles).map((_, i) => formatEntityId(i + 1));
  memoryStore.set('index:all', JSON.stringify(allIds));
  memoryStore.set('counter:next_id', String(Math.max(seq, 2000)));

  // 初始化最近入库有序索引（使用真实定时巡检烘焙数据集）
  const allChannels = ['all', 'movie', 'tv', 'anime', 'variety', 'documentary'];
  for (const ch of allChannels) {
    if (PREBAKED_LATEST_TITLES[ch] && PREBAKED_LATEST_TITLES[ch].length > 0) {
      memoryStore.set(`recent:${ch}`, JSON.stringify(PREBAKED_LATEST_TITLES[ch]));
    }
  }
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

/**
 * 读取 KV 中的原始字符串
 */
async function kvGet(key: string): Promise<string | null> {
  const kv = getCloudflareKV();
  if (kv && typeof kv.get === 'function') {
    try {
      const val = await kv.get(key);
      if (val !== null && val !== undefined) return val;
    } catch (e) {
      console.warn(`[KV get] error for key ${key}:`, e);
    }
  }

  // 回退到内存预烘焙字典
  seedPrebakedData();
  return memoryStore.get(key) || null;
}

/**
 * 写入 KV
 */
async function kvPut(key: string, value: string): Promise<void> {
  seedPrebakedData();
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
  seedPrebakedData();
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

  // 1. 尝试从 slug 映射取 entityId
  let targetId = await kvGet(`slug:${cleanKey}`);

  // 2. 如果没取到，解析是否带有 ik[6位数字] 前缀
  if (!targetId) {
    const match = cleanKey.match(/^(ik\d{6})/i);
    if (match) {
      targetId = match[1].toLowerCase();
    }
  }

  if (targetId) {
    const ent = await getEntityById(targetId);
    if (ent) {
      // 🌟 强一致防线：如果 slugKey 带有标题部分（例如 ik002001-仙逆剧场版-弑仙之战），
      // 必须严格校验取出的实体标题是否与 URL 中的标题一致，防止 ID 冲突导致张冠李戴
      const parts = cleanKey.split('-');
      if (parts.length > 1) {
        const urlTitlePart = parts.slice(1).join('-');
        if (urlTitlePart && !hasTitleOverlap(ent.title, urlTitlePart)) {
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
 * 根据 TMDB ID 查询实体（用于导入排重）
 */
export async function getEntityByTmdb(tmdbType: 'movie' | 'tv', tmdbId: string): Promise<TitleEntity | null> {
  if (!tmdbId) return null;
  const entityId = await kvGet(`tmdb:${tmdbType}:${tmdbId}`);
  if (!entityId) return null;
  return getEntityById(entityId);
}

/**
 * 根据影片名称查询实体（用于历史 URL 301 重定向）
 */
export async function getEntityByTitle(title: string): Promise<TitleEntity | null> {
  if (!title) return null;
  const norm = normalizeTitle(title);
  const entityId = await kvGet(`title:${norm}`);
  if (!entityId) return null;
  return getEntityById(entityId);
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

  // 9. 原子维护最近入库有序索引 (recent:all 与 recent:${entity.type})
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

  const updateRecentList = async (key: string) => {
    try {
      const rawList = await kvGet(key);
      let list: RecentTitleItem[] = rawList ? JSON.parse(rawList) : [];
      // 排重同 id 或归一化同名实体
      list = list.filter(item => item.entityId !== id && normalizeTitle(item.title) !== normTitle);
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

  // 1. 尝试从 Cloudflare KV 获取增量缓存
  const raw = await kvGet(targetKey);
  if (raw) {
    try {
      const items = JSON.parse(raw) as RecentTitleItem[];
      if (Array.isArray(items) && items.length > 0) {
        return items.slice(0, limit);
      }
    } catch (e) {
      console.warn(`[listRecentEntities] parse error for ${targetKey}:`, e);
    }
  }

  // 2. 真实预烘焙直出：全专区 0ms 秒开且 100% 具备真实的 24h 最新上线影片、连载集数与 TMDB 高清海报
  const prebakedList = PREBAKED_LATEST_TITLES[channelKey] || (channelKey === 'short' ? [] : PREBAKED_LATEST_TITLES.all) || [];
  if (prebakedList.length > 0) {
    return (prebakedList as RecentTitleItem[]).slice(0, limit);
  }

  // 短剧专区专属兜底：若为空直接返回空列表，绝不回退到全站普通长视频
  if (channelKey === 'short') {
    return (PREBAKED_LATEST_TITLES.short || []).slice(0, limit) as RecentTitleItem[];
  }

  // 3. 终极兜底：预烘焙核心影片
  seedPrebakedData();
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
    seedPrebakedData();
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
    seedPrebakedData();
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
  seedPrebakedData();
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

