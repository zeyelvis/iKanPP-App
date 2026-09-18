# iKanPP "详情页即片库" (Title-Entity-as-Database) 架构规范

本文档确立 iKanPP 自有结构化实体片库与多维筛选大厅的统一架构规范。

---

## 一、架构定位与双核驱动

iKanPP 采用**双核驱动**的流媒体与片库模型：

1. **全网穿透搜索（Search Core）**：
   - 用户发起搜索时，并发向全网 25+ 采集源发起查询。
   - 搜到结果后，通过后台异步任务 `searchAndEnrichFromTMDB()` 自动对实体进行 TMDB 丰润并沉淀至 Cloudflare KV。
   - 实现“用户搜一次，片库自愈沉淀一次”的飞轮效应。

2. **自有结构化片库（Entity Catalog Core）**：
   - 影视详情页与分类筛选大厅（`/api/library/browse`）统一依托于 Cloudflare KV 自有 `TitleEntity` 实体库。
   - 彻底解除筛选大厅对第三方采集站单次分页内存过滤的脆弱依赖。
   - 保证多维精准筛选（频道 + 题材 + 地区 + 年份 + 语言 + 连载状态 + 排序）具备 100% 真实总数统计与毫秒级交集响应。

---

## 二、实体数据结构规范 (`TitleEntity`)

存储键：`entity:{entityId}`（如 `entity:ik000100`）

```typescript
export interface TitleEntity {
  entityId: string;            // "ik000001" (全局唯一不可变自增序号)
  slug: string;                // 拼音别名，例如 "xiao-shen-ke-de-jiu-shu"
  tmdbId: string;              // TMDB 官方条目 ID，例如 "278"
  tmdbType: 'movie' | 'tv';    // TMDB 媒体类型
  doubanId?: string;           // 豆瓣 ID
  title: string;               // 中文主标题，例如 "肖申克的救赎"
  originalTitle?: string;      // 原语言标题，例如 "The Shawshank Redemption"
  type: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string; // 归属专区频道
  year: string;                // 上映或播出年份，例如 "2026"
  description: string;         // 中文完整剧情梗概 (SEO 与 AI 引用)
  cover: string;               // 海报图片 URL (w500 / R2持久化镜像)
  backdrop?: string;           // 剧照横版背景图 URL (w1280)
  rate: string;                // 评分，例如 "9.7"
  genres: string[];            // 题材分类，例如 ["剧情", "科幻"]
  directors: string[];         // 导演列表
  actors: string[];            // 主演列表
  region?: string;             // 制片国家/地区，例如 "中国大陆"、"美国"、"泰国"
  language?: string;           // 主要语言，例如 "国语"、"英语"、"泰语"
  status?: string;             // 连载状态，例如 "完结"、"更新至第12集"
  popularity?: number;         // TMDB 真实热度指数（用于综合热度排序）
  runtime?: number;            // 片长（分钟）
  numberOfSeasons?: number;    // 电视剧季数
  numberOfEpisodes?: number;   // 电视剧总集数
  keywords?: string[];         // 核心标签与长尾关键词
  relatedEntityIds?: string[]; // 站内强关联影片 entityId 列表
  createdAt: string;           // 初次入库 ISO 8601 时间戳
  updatedAt: string;           // 最后更新 ISO 8601 时间戳
}
```

---

## 三、多维反向索引架构

为了在边缘无服务器环境实现极致性能的多维筛选，系统基于 Cloudflare KV 维护以下原子反向索引表：

| 索引键模式 | 示例 | 存储值 | 作用 |
|-----------|------|--------|------|
| `channel:{type}` | `channel:movie`, `channel:tv` | `string[]` (entityIds) | 专区频道过滤 |
| `region:{token}` | `region:大陆`, `region:泰国`, `region:欧美` | `string[]` (entityIds) | 制片国家/地区归一化过滤 |
| `year:{year}` | `year:2026`, `year:2025` | `string[]` (entityIds) | 发行年份过滤 |
| `language:{token}` | `language:国语`, `language:英语` | `string[]` (entityIds) | 语言过滤 |
| `status:{token}` | `status:完结`, `status:连载中` | `string[]` (entityIds) | 连载状态过滤 |
| `genre:{genre}` | `genre:科幻`, `genre:动作` | `string[]` (entityIds) | 题材分类过滤 |
| `index:all` | `index:all` | `string[]` (all entityIds) | 全量实体主索引 |
| `sitemap:catalog` | `sitemap:catalog` | `[id, slug, modDate][]` | Sitemap 毫秒级直出精简目录 |

### 查询原理（原子交集算法）
1. 用户传入筛选参数：`channel=tv&area=泰国&year=2026`
2. 系统并行读取 `channel:tv`、`region:泰国`、`year:2026` 对应的 ID 数组。
3. 按数组长度升序排列，以最短数组为基准做 `Set` 内存交集过滤。
4. 根据排序参数（最新上映 / 豆瓣高分 / 综合热度）进行分页切片，按需只读取当前页（默认 36 部）实体详情。
5. 单次请求响应耗时稳定在 15~35ms 之间，CLS 恒为 0。

---

## 四、短剧专区源站扩充矩阵

短剧专区（`/short`）全面纳入全站实体片库体系，接入以下高权重源站：

1. **巨量短剧专线**（优先级 1，6.2 万+ 部，原生真实分集）
2. **魔都短剧专线**（优先级 2，3.4 万+ 部，原生分集）
3. **红牛短剧专线**（优先级 6，3.7 万+ 部，涵盖古装仙侠/现代都市等 8 大细分子分类）
   - **海豚容灾镜像**：配置 `fallbackBaseUrl: 'https://hhzyapi.com'`（子分类 ID 偏移 +2）。当红牛遭遇网络波动时自动无感切到海豚资源。
4. **非凡短剧专线**（优先级 7，2.0 万+ 部，通过关键词精准划分爽剧/言情/都市/古装等子专区）
5. **暴风短剧专线**（优先级 8，1.2 万+ 部，独有「女恋总裁」「闪婚离婚」特色专区）

---

## 五、自动化入库与更新闭环

1. **增量自动巡检（每周两次）**：
   - 由 `.github/workflows/ingest-entity-catalog.yml` 于每周日与周三 UTC 20:00 自动触发。
   - 自动扫描采集站新片，对接 TMDB 智能补齐元数据。
   - 自动更新反向索引，并触发 IndexNow 搜索引擎推送与全站预热。
2. **每小时连载追踪**：
   - 由 `.github/workflows/sync-iyf-channels.yml` 每小时整点触发 `sync-episode-updates.mjs`。
   - 实时同步连载剧集的更新状态（`status`）与播出集数（`numberOfEpisodes`）。

---

## 六、反向索引自愈、防毒化校验与 URL 语义冲突解决铁律 (Auto-Purge & Anti-Poisoning Spec)

为了杜绝搜索引擎流量落地页张冠李戴、站内搜索头部推荐卡片错乱等恶性体验事故，全站必须永久恪守以下五大防毒化与自愈架构铁律：

### 1. 反向索引读取时强一致校验 (On-Access Strong Verification)
- 任何通过 `getEntityByTmdb(tmdbType, tmdbId)` 读取实体的地方，系统必须且只能在内存中强一致核验读出实体的实际属性：
  ```typescript
  if (String(ent.tmdbId) !== String(tmdbId) || (ent.tmdbType && ent.tmdbType !== tmdbType)) {
    // 判定为毒化键，拒绝向调用方返回
  }
  ```
- 严禁盲目信任反向索引指向的实体，防止历史脏数据或脚本错误导致跨影片关联。

### 2. 读取时自动物理净化 (On-Access Auto-Purge)
- 一旦检测到反向索引指向了错误的实体（或指向了已删除的虚空实体），系统必须立即调用 `kvDelete` 物理删除该毒化键：
  ```typescript
  console.warn(`[getEntityByTmdb Auto-Purge] Poisoned key: ${key} -> ${entityId}. Purging!`);
  await kvDelete(key);
  return null;
  ```
- 绝不允许“知错留错”，实现任意请求只要触碰到脏数据，即可在毫秒级全自动完成单点物理清理，阻止毒化数据二次蔓延。

### 3. 片名语义重叠门槛防线 (Title Overlap Guard)
- 在 `searchAndEnrichFromTMDB` 与 `convertHitToEntity` 中，从本地 KV 命中缓存实体后，必须校验该实体的 `title`、`originalTitle` 或 `slug` 是否与当前的搜索命中候选项（Hit Title / Original Title / Query）具备实质语义重叠（`hasTitleOverlap`）；
- 若标题风马牛不相及（例如以《杀死比尔》检索命中历史毒化条目《我的宝贝四千金》），坚决予以丢弃，强制进入 TMDB 官方 API 深度元数据抓取并重写入库，杜绝搜索推荐卡片“指鹿为马”。

### 4. URL 路由解析实体 ID 优先与显式别名路由 (ID-First & Explicit Alias Routing)
- 影视详情页路由 `/title/[slug]` 的解析必须严格遵循权威层级优先级：
  1. **显式别名路由优先**：检查 `slug:${cleanKey}` 是否在 KV 中具有显式映射（如历史被 Google 收录的旧链接 `slug:ik002038-the-bill -> ik007343`）。显式映射代表系统权威意志，直接返回正确实体；
  2. **实体物理 ID 优先**：若 URL 含有标准 ID（`ik\d{6}`），直接以该 ID 检索实体，并比对 URL 尾部的标题片段。若尾部仅为英文拼写或外语原名，绝不可跳过 ID 直接拿英文尾缀去按片名全局反查，杜绝英文短词（如 `the-bill`）撞车同名其他剧集的恶性 Bug；
  3. **中文纯净标题检索**：仅当 URL 不含 ID 且包含中文字符时，才允许执行 `getEntityByTitle`；
  4. **TMDB 在线冷门自愈**：仅对含中文字符的新鲜词条执行在线搜索自愈。

### 5. SEO 规范 URL 301 永久重定向 (Canonical 301 Permanent Redirect)
- 任何非权威规范 Slug（包含带 `-` 的历史别名 URL、纯 ID URL、拼音不规范 URL），在详情页元数据与主体渲染阶段，必须统一触发 301 / 308 永久重定向：
  ```typescript
  const canonicalSlug = `${entity.entityId}-${entity.slug}`.toLowerCase();
  const currentCleanSlug = decodedSlug.toLowerCase();
  if (currentCleanSlug !== canonicalSlug && !isSeasonSpecified) {
    redirect(`/title/${encodeURIComponent(`${entity.entityId}-${entity.slug}`)}`, RedirectType.replace);
  }
  ```
- 彻底移除 `!currentCleanSlug.includes('-')` 限制，确保所有历史旧链接（即使带连字符）均能无缝永久重定向至标准 Canonical URL，将外链权重 100% 汇聚，彻底解决 Google Search Console 备用网页报警与流量落地错位。

