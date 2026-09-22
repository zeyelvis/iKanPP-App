import { TitleEntity } from '@/lib/types/entity';
import { generateSlug, formatEntityId, normalizeTitle, isInvalidDramaOrMovie, hasTitleOverlap, isCleanChineseTitle, isStrictSafeEntity, decodeMangledHexSlug } from '@/lib/data/entities/entity-utils';

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
  platformBadge?: string;
  qualityBadge?: string;
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

const CF_KV_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_KV_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID || process.env.CF_KV_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CF_API_KEY || process.env.CLOUDFLARE_AUTH_KEY || '';
const CF_KV_EMAIL = process.env.CLOUDFLARE_EMAIL || process.env.CF_EMAIL || process.env.CLOUDFLARE_AUTH_EMAIL || 'zeyelvis@gmail.com';

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
    return;
  }

  // 本地开发或非 Worker 环境：透明通过 Cloudflare REST API 直连写入
  if (!kv && typeof fetch === 'function' && CF_KV_API_KEY && CF_KV_EMAIL) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
      await fetch(url, {
        method: 'PUT',
        headers: {
          'X-Auth-Email': CF_KV_EMAIL,
          'X-Auth-Key': CF_KV_API_KEY,
        },
        body: value,
      });
    } catch (err) {
      console.warn(`[KV put REST] error for key ${key}:`, err);
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
      // 🌟 自动自愈净化：若发现历史 canonicalSlug 被撕裂为连字符十六进制乱码，立即清洗为规范中文 Slug
      if (parsed.canonicalSlug && /(?:e[0-9a-f]-[0-9a-f]{2}){2,}/i.test(parsed.canonicalSlug)) {
        const correctSlug = `${cleanId}-${generateSlug(parsed.title)}`.toLowerCase();
        parsed.canonicalSlug = correctSlug;
        (async () => {
          try {
            await kvPut(`entity:${cleanId}`, JSON.stringify(parsed));
            await kvPut(`slug:${correctSlug}`, cleanId);
          } catch {}
        })();
      }
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
      if (parsed.canonicalSlug && /(?:e[0-9a-f]-[0-9a-f]{2}){2,}/i.test(parsed.canonicalSlug)) {
        parsed.canonicalSlug = `${cleanId}-${generateSlug(parsed.title)}`.toLowerCase();
      }
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

  // 1. 【极速路径】：若带有标准 ik[6位数字] 前缀，直接优先提取实体 ID 并直查实体（消灭多余的 slug: 网络往返）
  const idMatch = cleanKey.match(/^(ik\d{6})/i);
  if (idMatch) {
    const targetId = idMatch[1].toLowerCase();
    const ent = await getEntityById(targetId);
    if (ent && isStrictSafeEntity(ent).safe) {
      const parts = cleanKey.split('-');
      if (parts.length > 1) {
        const urlTitlePart = parts.slice(1).join('-');
        const decodedUrlTitlePart = decodeMangledHexSlug(urlTitlePart);
        const isMatch =
          !urlTitlePart ||
          hasTitleOverlap(ent.title, urlTitlePart) ||
          (decodedUrlTitlePart && hasTitleOverlap(ent.title, decodedUrlTitlePart)) ||
          (ent.originalTitle && (hasTitleOverlap(ent.originalTitle, urlTitlePart) || (decodedUrlTitlePart && hasTitleOverlap(ent.originalTitle, decodedUrlTitlePart)))) ||
          (ent.slug && (hasTitleOverlap(ent.slug, urlTitlePart) || (decodedUrlTitlePart && hasTitleOverlap(ent.slug, decodedUrlTitlePart)))) ||
          (decodedUrlTitlePart && normalizeTitle(ent.title) === normalizeTitle(decodedUrlTitlePart));

        if (isMatch) {
          return ent;
        }
      } else {
        return ent;
      }
    }
  }

  // 2. 若直查未命中或非标准 ID 前缀，查询 slug 显式映射（如旧 URL 301 映射、历史别名权威路由）
  const explicitTargetId = await kvGet(`slug:${cleanKey}`);
  if (explicitTargetId) {
    const ent = await getEntityById(explicitTargetId);
    if (ent) {
      // 🌟 强一致防毒化核验：核验实体安全性与标题语义相关性，杜绝历史毒化别名
      const safeCheck = isStrictSafeEntity(ent);
      const parts = cleanKey.split('-');
      const urlTitlePart = parts.length > 1 ? parts.slice(1).join('-') : '';
      const decodedUrlTitlePart = decodeMangledHexSlug(urlTitlePart);
      const decodedCleanKey = decodeMangledHexSlug(cleanKey);
      const hasChineseInKey = /[\u4e00-\u9fff]/.test(cleanKey) || /[\u4e00-\u9fff]/.test(decodedCleanKey);

      const isMismatch =
        (urlTitlePart &&
          !hasTitleOverlap(ent.title, urlTitlePart) &&
          (!decodedUrlTitlePart || !hasTitleOverlap(ent.title, decodedUrlTitlePart)) &&
          (!ent.originalTitle || (!hasTitleOverlap(ent.originalTitle, urlTitlePart) && (!decodedUrlTitlePart || !hasTitleOverlap(ent.originalTitle, decodedUrlTitlePart)))) &&
          (!ent.slug || (!hasTitleOverlap(ent.slug, urlTitlePart) && (!decodedUrlTitlePart || !hasTitleOverlap(ent.slug, decodedUrlTitlePart))))) ||
        (hasChineseInKey && !hasTitleOverlap(ent.title, cleanKey) && (!decodedCleanKey || !hasTitleOverlap(ent.title, decodedCleanKey)));

      if (!safeCheck.safe || isMismatch) {
        console.warn(`[getEntityBySlug 毒化映射自动修剪]: slug:${cleanKey} -> ${explicitTargetId} (title="${ent.title}", safe=${safeCheck.safe}, mismatch=${isMismatch})`);
        try {
          await kvDelete(`slug:${cleanKey}`);
        } catch {}
      } else {
        return ent;
      }
    } else {
      // 虚空实体，物理清除死链
      try {
        await kvDelete(`slug:${cleanKey}`);
      } catch {}
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
  let entityId = await kvGet(`title:${norm}`);
  if (!entityId && norm !== title.trim()) {
    entityId = await kvGet(`title:${title.trim()}`);
  }
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
export async function saveEntity(entity: TitleEntity, options?: { syncGlobalIndex?: boolean }): Promise<void> {
  if (!entity || !entity.entityId) return;

  // 🌟 终极物理钢铁防线：华语流媒体主站内容安全底线
  // 任何非纯正中文标题、日文假名、韩文字符、纯外文、日文原名含番号/假名、或原名/简介命中违禁词的条目，底层直接物理拒之门外，绝不入库
  const safeCheck = isStrictSafeEntity(entity);
  if (!safeCheck.safe) {
    console.warn(`[saveEntity 物理熔断] 坚决阻断违规/成人/非合规条目入库: id="${entity.entityId}", title="${entity.title}", 原因: ${safeCheck.reason}`);
    return;
  }

  const id = entity.entityId.toLowerCase();
  // 权威规范 Slug 强制预热与持久化
  if (!entity.canonicalSlug || /(?:e[0-9a-f]-[0-9a-f]{2}){2,}/i.test(entity.canonicalSlug)) {
    const cleanSlug = generateSlug(entity.title || entity.slug);
    entity.canonicalSlug = `${id}-${cleanSlug}`.toLowerCase();
  }

  const slugKey = `${id}-${entity.slug}`.toLowerCase();
  const canonicalSlugKey = entity.canonicalSlug.toLowerCase();
  const normTitle = normalizeTitle(entity.title);
  // 🌟 终极防重防线：同一影片唯一权威 ID 绝对保护
  // 无论上层脚本或新功能如何调用，只要片名相同且确系同一部作品，严禁分配并保存第二个独立 ID！
  if (normTitle) {
    const existingId = await kvGet(`title:${normTitle}`);
    if (existingId && existingId.toLowerCase() !== id) {
      const existingEnt = await getEntityById(existingId);
      if (existingEnt && normalizeTitle(existingEnt.title) === normTitle) {
        const yearDiff = Math.abs((Number(existingEnt.year) || 0) - (Number(entity.year) || 0));
        const isSameFilm = !existingEnt.year || !entity.year || yearDiff <= 1;
        if (isSameFilm) {
          console.warn(`[saveEntity 终极防重锁] 检测到重复实体入库尝试: title="${entity.title}", 权威ID=${existingId}, 传入新ID=${id}. 自动转为 301 别名映射，坚决拒绝分裂 URL！`);
          await kvPut(`slug:${id}`, existingId);
          await kvPut(`slug:${slugKey}`, existingId);
          await kvPut(`slug:${canonicalSlugKey}`, existingId);

          let mutated = false;
          if ((!existingEnt.backdrop || existingEnt.backdrop.includes('doubanio.com')) && entity.backdrop && entity.backdrop.includes('tmdb.org')) {
            existingEnt.backdrop = entity.backdrop;
            mutated = true;
          }
          if ((!existingEnt.actors || existingEnt.actors.length === 0) && entity.actors && entity.actors.length > 0) {
            existingEnt.actors = entity.actors;
            mutated = true;
          }
          if (mutated) {
            await kvPut(`entity:${existingId}`, JSON.stringify(existingEnt));
          }
          return;
        }
      }
    }
  }

  // 1. 保存主键实体
  await kvPut(`entity:${id}`, JSON.stringify(entity));

  // 2. 保存 Slug 索引
  await kvPut(`slug:${slugKey}`, id);
  await kvPut(`slug:${id}`, id);
  if (canonicalSlugKey !== slugKey) {
    await kvPut(`slug:${canonicalSlugKey}`, id);
  }

  // 3. 保存 TMDB 索引
  if (entity.tmdbId) {
    await kvPut(`tmdb:${entity.tmdbType}:${entity.tmdbId}`, id);
  }

  // 4. 保存标题归一化索引 (供 301 重定向命中与权威条目直出)
  if (normTitle) {
    const existingId = await kvGet(`title:${normTitle}`);
    if (existingId && existingId.toLowerCase() !== id) {
      // 存在同名作品冲突，比较两者的权重，避免早期冷门片覆盖主流现代大片
      const existingEnt = await getEntityById(existingId);
      if (existingEnt) {
        const getWeight = (ent: TitleEntity) => {
          let w = 0;
          const pop = Number(ent.popularity) || 0;
          w += pop * 2;
          if (ent.actors && ent.actors.length > 0) w += 50;
          if (ent.directors && ent.directors.length > 0 && ent.directors[0] !== '知名导演') w += 20;
          const rate = Number(ent.rate) || 0;
          if (rate > 0) w += rate * 5;
          const year = Number(ent.year) || 0;
          if (year >= 2000) w += 40;
          else if (year >= 1980) w += 10;
          return w;
        };

        const existingWeight = getWeight(existingEnt);
        const currentWeight = getWeight(entity);

        if (existingWeight > currentWeight) {
          console.warn(`[saveEntity Title Conflict] Retaining existing authority ${existingId} ("${existingEnt.title}" ${existingEnt.year}, w:${existingWeight}) over new ${id} ("${entity.title}" ${entity.year}, w:${currentWeight})`);
        } else {
          await kvPut(`title:${normTitle}`, id);
        }
      } else {
        await kvPut(`title:${normTitle}`, id);
      }
    } else {
      await kvPut(`title:${normTitle}`, id);
    }
  }

  // 4.5 保存别名与港台公映译名二级反向索引（场景 5：通吃全球泛华语搜索流量）
  const allAliases = new Set<string>(entity.aliases || []);
  if (entity.aiContent?.taiwanTitle) allAliases.add(entity.aiContent.taiwanTitle.trim());
  if (entity.aiContent?.hongkongTitle) allAliases.add(entity.aiContent.hongkongTitle.trim());

  for (const alias of allAliases) {
    if (!alias || alias === entity.title) continue;
    const aliasNorm = normalizeTitle(alias);
    if (aliasNorm) {
      const existing = await kvGet(`title:${aliasNorm}`);
      if (!existing) {
        await kvPut(`title:${aliasNorm}`, id);
      }
    }
  }

  // 5. 追加到全局所有 ID 列表与 Sitemap 轻量全量目录
  // 🌟 架构防线：仅在显式批量入库/管理模式下执行（严禁线上 Edge 运行时并发读改写全局大集合，杜绝竞态覆盖脏数据）
  if (options?.syncGlobalIndex) {
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
  }

  // 注：原第 14 步维护 recent:* 已彻底解耦移出。
  // 遵循 AGENTS.md 架构准则，前台「最新上线」展台唯一由「全球数字发行雷达」定时任务（updateRecentShowcase）精选写入，
  // 坚决防止底层搜索扩充、详情页冷启动持久化等操作污染前台展示。
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

  const sortMode = (filters.sort || 'time_added').toLowerCase();
  const isScoreSort = sortMode === 'rank' || sortMode === 'rating' || sortMode === 'score';
  const isHitsSort = sortMode === 'hits' || sortMode === 'popularity' || sortMode === 'recommend';
  const isUpdatedSort = sortMode === 'time_updated' || sortMode === 'updated';
  const isAddedSort = sortMode === 'time_added' || sortMode === 'added' || sortMode === 'time' || sortMode === 'latest';

  // ── 核心性能革新：若用户未选择细化属性（纯专区切换排序），直接从全局物理倒排索引秒出 ──
  const targetChannel = (filters.channel && filters.channel !== 'all' && filters.channel !== '全部')
    ? filters.channel.toLowerCase().trim()
    : 'all';
  const hasDetailedFilters = Boolean(
    (filters.genre && filters.genre !== 'all' && filters.genre !== '全部') ||
    (filters.region && filters.region !== 'all' && filters.region !== '全部') ||
    (filters.year && filters.year !== 'all' && filters.year !== '全部') ||
    (filters.language && filters.language !== 'all' && filters.language !== '全部') ||
    (filters.status && filters.status !== 'all' && filters.status !== '全部')
  );

  if (!hasDetailedFilters) {
    let dedicatedIndexKey = '';
    if (isHitsSort) {
      dedicatedIndexKey = `index:popularity:${targetChannel}`;
    } else if (isScoreSort) {
      dedicatedIndexKey = `index:score:${targetChannel}`;
    } else if (isUpdatedSort) {
      dedicatedIndexKey = `index:time_updated:${targetChannel}`;
    } else if (isAddedSort) {
      dedicatedIndexKey = `index:time_added:${targetChannel}`;
    }

    if (dedicatedIndexKey) {
      const rawDedicated = await kvGet(dedicatedIndexKey);
      if (rawDedicated) {
        try {
          const list = JSON.parse(rawDedicated);
          if (Array.isArray(list) && list.length > 0) {
            // 真实专区/全库总数以 matchedIds (如电影专区11498部、全站68499部) 为准，绝不拿倒排索引切片长度当总数
            const realTotal = Math.max(total, list.length);
            const pageCount = Math.max(1, Math.ceil(realTotal / limit));
            const startIndex = (page - 1) * limit;

            // 统一构建候选 ID 池：倒排索引优先，不足或超深翻页时由专区全量库 matchedIds 无缝补充
            const candidateIds: string[] = [...list];
            if (matchedIds.length > list.length) {
              const seenIdSet = new Set<string>(list);
              for (const id of matchedIds) {
                if (!seenIdSet.has(id)) {
                  candidateIds.push(id);
                }
              }
            }

            // 🌟 核心防线：Auto-Replenish 缺额自愈填补流水线
            // 无论遇到任何下架、空键或幽灵 ID，绝不允许返回少于 limit 个条目导致网格末行空缺
            const items: TitleEntity[] = [];
            let cursor = startIndex;
            const CHUNK_SIZE = limit + 8;

            while (items.length < limit && cursor < candidateIds.length) {
              const nextSlice = candidateIds.slice(cursor, cursor + CHUNK_SIZE);
              cursor += nextSlice.length;

              const chunkEntities = (await Promise.all(nextSlice.map(id => getEntityById(id)))).filter(Boolean) as TitleEntity[];
              for (const ent of chunkEntities) {
                items.push(ent);
                if (items.length === limit) break;
              }
            }

            return {
              items,
              total: realTotal,
              page,
              pageCount,
              limit,
            };
          }
        } catch { /* 容灾降级 */ }
      }
    }
  }

  // ── 若存在多维组合筛选，使用真实 popularity、score 与更新时间进行高精度全量排序 ──
  if (isScoreSort || isHitsSort || isUpdatedSort) {
    // 根据交集结果切出当前页所需及后续候选池（最大支持 300 条深度精准排序）
    const candidateIds = matchedIds.slice(0, 300);
    const candidateEntities = (await Promise.all(candidateIds.map(id => getEntityById(id)))).filter(Boolean) as TitleEntity[];

    if (isScoreSort) {
      // 评分排序：真实 rate 降序，同分时真实 popularity 降序
      candidateEntities.sort((a, b) => {
        const sA = parseFloat(a.rate || a.score || '0');
        const sB = parseFloat(b.rate || b.score || '0');
        if (sB !== sA) return sB - sA;
        return (Number(b.popularity) || 0) - (Number(a.popularity) || 0);
      });
    } else if (isHitsSort) {
      // 人气排序：真实 popularity 降序
      candidateEntities.sort((a, b) => (Number(b.popularity) || 0) - (Number(a.popularity) || 0));
    } else if (isUpdatedSort) {
      // 更新时间排序：真实 updatedAt 降序，其次年份降序
      candidateEntities.sort((a, b) => {
        const tA = new Date(a.updatedAt || a.createdAt || '2000-01-01').getTime();
        const tB = new Date(b.updatedAt || b.createdAt || '2000-01-01').getTime();
        if (tB !== tA) return tB - tA;
        return (Number(b.year) || 0) - (Number(a.year) || 0);
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

  // 默认或按最新上映（time / latest）：ID 数组内部最新实体居首，直接切片后按需并行加载（带 Auto-Replenish 补齐）
  const startIndex = (page - 1) * limit;
  const items: TitleEntity[] = [];
  let cursor = startIndex;
  const CHUNK_SIZE = limit + 8;

  while (items.length < limit && cursor < matchedIds.length) {
    const nextSlice = matchedIds.slice(cursor, cursor + CHUNK_SIZE);
    cursor += nextSlice.length;

    const chunkEntities = (await Promise.all(nextSlice.map(id => getEntityById(id)))).filter(Boolean) as TitleEntity[];
    for (const ent of chunkEntities) {
      items.push(ent);
      if (items.length === limit) break;
    }
  }

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
 * 专供「全球数字发行雷达」定时任务写入前台精选「最新上线」列表
 * 拥有对 recent:* 键的唯一受控写权限，彻底隔离底层实体持久化污染
 */
export async function updateRecentShowcase(
  channel: string,
  items: RecentTitleItem[]
): Promise<void> {
  const normalizedChannel = (channel || 'all').toLowerCase().trim();
  const validChannels = ['movie', 'tv', 'anime', 'variety', 'documentary', 'short'];
  const channelKey = validChannels.includes(normalizedChannel) ? normalizedChannel : 'all';
  const targetKey = channelKey === 'all' ? 'recent:all' : `recent:${channelKey}`;

  // 严格华语安全与品质校验过滤
  const safeItems = (items || []).filter(isSafeRecentTitleItem).slice(0, 60);

  // 写入内存缓存（供本地 SSR 0ms 直出）
  memoryStore.set(targetKey, JSON.stringify(safeItems));

  // 写入 Cloudflare KV 持久化
  await kvPut(targetKey, JSON.stringify(safeItems));
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

  // 精准截取候选条目：最多只拉取 (limit + 4) 部，既留出脱口秀过滤余量，又杜绝成倍并发网络风暴
  const candidateCount = Math.min(ids.length, Math.max(limit + 4, 10));
  const selectedIds = ids.slice(0, candidateCount);
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

  // 精准截取候选条目：最多只拉取 (limit + 4) 部，既留出脱口秀过滤余量，又杜绝成倍并发网络风暴
  const candidateCount = Math.min(ids.length, Math.max(limit + 4, 10));
  const selectedIds = ids.slice(0, candidateCount);
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

