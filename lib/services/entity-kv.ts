import { TitleEntity } from '@/lib/types/entity';
import { generateSlug, formatEntityId, normalizeTitle } from '@/lib/data/entities/entity-utils';
import { PREBAKED_HOME_DATA, PrebakedSubject } from '@/lib/data/home-prebaked';

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

  for (const item of allPrebaked) {
    const s = item.subject;
    const norm = normalizeTitle(s.title);
    if (seenTitles.has(norm)) continue;
    seenTitles.add(norm);

    const entityId = formatEntityId(seq++);
    const slug = generateSlug(s.title);

    // 解析 TMDB ID（如果 cover 中包含，或用自增）
    const tmdbIdMatch = s.id?.match(/\d+/);
    const tmdbId = tmdbIdMatch ? tmdbIdMatch[0] : String(seq + 1000);

    const entity: TitleEntity = {
      entityId,
      slug,
      tmdbId,
      tmdbType: item.type,
      title: s.title,
      type: item.type,
      year: s.year || '2024',
      description: s.description || `${s.title} 是一部精彩的${item.type === 'movie' ? '电影' : '连续剧'}，评分 ${s.rate || '9.0'}，支持在 iKanPP 免费在线观看完整版高清视频。`,
      cover: s.cover,
      backdrop: s.backdrop || s.cover,
      rate: s.rate || '9.0',
      genres: s.types || [item.type === 'movie' ? '电影' : '电视剧'],
      directors: s.directors || ['知名导演'],
      actors: s.actors || ['实力主演'],
      createdAt: '2026-09-01T00:00:00Z',
      updatedAt: '2026-09-01T00:00:00Z',
    };

    memoryStore.set(`entity:${entityId}`, JSON.stringify(entity));
    memoryStore.set(`slug:${entityId}-${slug}`, entityId);
    memoryStore.set(`slug:${entityId}`, entityId);
    memoryStore.set(`tmdb:${entity.tmdbType}:${entity.tmdbId}`, entityId);
    memoryStore.set(`title:${norm}`, entityId);

    // 索引分类
    for (const g of entity.genres) {
      const gKey = `genre:${g}`;
      const existing = memoryStore.get(gKey);
      const list = existing ? JSON.parse(existing) : [];
      list.push(entityId);
      memoryStore.set(gKey, JSON.stringify(list));
    }
  }

  // 全量实体索引
  const allIds = Array.from(seenTitles).map((_, i) => formatEntityId(i + 1));
  memoryStore.set('index:all', JSON.stringify(allIds));
  memoryStore.set('counter:next_id', String(seq));
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
  const raw = await kvGet(`entity:${entityId.toLowerCase()}`);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TitleEntity;
  } catch {
    return null;
  }
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
    return getEntityById(targetId);
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

  // 5. 追加到全局所有 ID 列表
  const rawAll = await kvGet('index:all');
  const allIds: string[] = rawAll ? JSON.parse(rawAll) : [];
  if (!allIds.includes(id)) {
    allIds.push(id);
    await kvPut('index:all', JSON.stringify(allIds));
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

  // 7. 追加到导演索引
  if (Array.isArray(entity.directors)) {
    for (const d of entity.directors) {
      if (!d) continue;
      const dKey = `director:${d.trim()}`;
      const rawD = await kvGet(dKey);
      const dList: string[] = rawD ? JSON.parse(rawD) : [];
      if (!dList.includes(id)) {
        dList.push(id);
        await kvPut(dKey, JSON.stringify(dList));
      }
    }
  }

  // 8. 追加到演员索引
  if (Array.isArray(entity.actors)) {
    for (const a of entity.actors) {
      if (!a) continue;
      const aKey = `actor:${a.trim()}`;
      const rawA = await kvGet(aKey);
      const aList: string[] = rawA ? JSON.parse(rawA) : [];
      if (!aList.includes(id)) {
        aList.push(id);
        await kvPut(aKey, JSON.stringify(aList));
      }
    }
  }
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
 * 获取同导演作品（用于详情页内链）
 */
export async function getEntitiesByDirector(director: string, limit = 6): Promise<TitleEntity[]> {
  if (!director) return [];
  const raw = await kvGet(`director:${director.trim()}`);
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
 * 获取同主演作品（用于详情页内链）
 */
export async function getEntitiesByActor(actor: string, limit = 6): Promise<TitleEntity[]> {
  if (!actor) return [];
  const raw = await kvGet(`actor:${actor.trim()}`);
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
 * 获取下一个自增序号并更新计数器
 */
export async function getNextEntitySeq(): Promise<number> {
  const raw = await kvGet('counter:next_id');
  const current = raw ? parseInt(raw, 10) || 1 : 1;
  await kvPut('counter:next_id', String(current + 1));
  return current;
}
