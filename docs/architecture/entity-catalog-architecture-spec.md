# iKanPP "详情页即片库" (Title-Entity-as-Database) 架构规范 (v5.0 权威升级版)

本文档确立 iKanPP 自有结构化实体片库与多维筛选大厅的统一架构规范。

---

## 一、架构定位与权威/边缘双层模型

iKanPP 采用**D1 权威存储 + KV 边缘只读投影**的现代化实体片库与流媒体模型：

1. **强一致权威控制层（D1 / DO Authoritative Layer）**：
   - 解决纯 KV 存储在并发写入时缺乏强一致性、自增 ID 竞态断号、外键缺乏完整性约束的固有缺陷；
   - 全网影视实体主数据（`titles`）、外源映射（`title_external_ids`）、演职员关系（`people` / `title_people`）、多维分类（`title_genres`）、事实断言与版本溯源（`fact_assertions` / `schema_migrations`）统一由 Cloudflare D1 关系型数据库作为唯一真理源（Single Source of Truth）；
   - 由权威层生成全局唯一的 `entityId` 序列（如 `ik000001`）。

2. **边缘只读投影层（Edge Read-Only Projection Layer）**：
   - 影视详情页与分类筛选大厅（`/api/library/browse`）统一依托于 Cloudflare KV 高速只读缓存投影；
   - 保证多维精准筛选（频道 + 题材 + 地区 + 年份 + 语言 + 连载状态 + 排序）具备毫秒级响应（15~35ms），CLS 恒为 0；
   - 彻底解除筛选大厅对第三方采集站单次分页内存过滤的脆弱依赖。

3. **全网穿透搜索与异步沉淀（Search Core）**：
   - 用户发起搜索时，并发向全网采集源发起查询；
   - 搜到结果后，通过后台异步作业 `searchAndEnrichFromTMDB()` 自动对实体进行 TMDB 事实丰润，经过 `entity-resolver` 评分去重后写入权威层并原子投影至 KV，形成飞轮效应。

---

## 二、实体数据结构规范 (`TitleEntity` 与 `PublishedTitleEntity`)

存储键：`entity:{entityId}`（如 `entity:ik000100`）

```typescript
export interface TitleEntity {
  entityId: string;            // "ik000001" (全局唯一不可变序号)
  slug: string;                // 拼音别名，例如 "xiao-shen-ke-de-jiu-shu"
  tmdbId: string;              // TMDB 官方条目 ID，例如 "278"
  tmdbType: 'movie' | 'tv';    // TMDB 媒体类型
  doubanId?: string;           // 豆瓣 ID
  title: string;               // 中文主标题，例如 "肖申克的救赎"
  originalTitle?: string;      // 原语言标题，例如 "The Shawshank Redemption"
  type: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary' | string; // 归属专区频道
  year: string;                // 上映或播出年份，例如 "2026"
  description: string;         // 中文完整剧情梗概 (真实事实)
  cover: string;               // 海报图片 URL (w500 / R2持久化镜像)
  backdrop?: string;           // 剧照横版背景图 URL (w1280)
  rate: string;                // 真实评分
  genres: string[];            // 题材分类，例如 ["剧情", "科幻"]
  directors: string[];         // 导演列表
  actors: string[];            // 主演列表
  region?: string;             // 制片国家/地区
  language?: string;           // 主要语言
  status?: string;             // 连载状态
  popularity?: number;         // TMDB 真实热度指数
  runtime?: number;            // 片长（分钟）
  numberOfSeasons?: number;    // 电视剧季数
  numberOfEpisodes?: number;   // 电视剧总集数
  keywords?: string[];         // 核心标签与长尾关键词
  relatedEntityIds?: string[]; // 站内强关联影片 entityId 列表
  contentHash?: string;        // SHA-256 内容指纹 (用于 304 协商与增量发布)
  createdAt: string;           // 初次入库 ISO 8601 时间戳
  updatedAt: string;           // 最后更新 ISO 8601 时间戳
}
```

---

## 三、多维反向索引架构 (KV 只读投影)

为了在边缘无服务器环境实现极致性能的多维筛选，发布投影服务（`PublishProjectionService`）基于 D1 权威数据派生并维护以下原子反向索引表：

| 索引键模式 | 示例 | 存储值 | 作用 |
|-----------|------|--------|------|
| `channel:{type}` | `channel:movie`, `channel:tv` | `string[]` (entityIds) | 专区频道过滤 |
| `region:{token}` | `region:大陆`, `region:泰国`, `region:欧美` | `string[]` (entityIds) | 制片国家/地区归一化过滤 |
| `year:{year}` | `year:2026`, `year:2025` | `string[]` (entityIds) | 发行年份过滤 |
| `language:{token}` | `language:国语`, `language:英语` | `string[]` (entityIds) | 语言过滤 |
| `status:{token}` | `status:完结`, `status:连载中` | `string[]` (entityIds) | 连载状态过滤 |
| `genre:{genre}` | `genre:科幻`, `genre:动作` | `string[]` (entityIds) | 题材分类过滤 |
| `actor:{name}` | `actor:沈腾` | `string[]` (entityIds) | 演员作品索引 |
| `director:{name}` | `director:克里斯托弗·诺兰` | `string[]` (entityIds) | 导演作品索引 |
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
1. **巨量短剧专线**（优先级 1，原生真实分集）
2. **魔都短剧专线**（优先级 2，原生分集）
3. **红牛短剧专线**（优先级 6，涵盖古装仙侠/现代都市等 8 大细分子分类）
   - **海豚容灾镜像**：配置 `fallbackBaseUrl: 'https://hhzyapi.com'`。当红牛遭遇网络波动时自动无感切到海豚资源。
4. **非凡短剧专线**（优先级 7，爽剧/言情/都市/古装等子专区）
5. **暴风短剧专线**（优先级 8，独有特色专区）

---

## 五、反向索引自愈、防毒化校验与 URL 语义冲突解决铁律 (Auto-Purge & Anti-Poisoning Spec)

全站必须永久恪守以下五大防毒化与自愈架构铁律：

### 1. 反向索引读取时强一致校验 (On-Access Strong Verification)
- 任何通过 `getEntityByTmdb(tmdbType, tmdbId)` 读取实体的地方，系统必须且只能在内存中强一致核验读出实体的实际属性：
  ```typescript
  if (String(ent.tmdbId) !== String(tmdbId) || (ent.tmdbType && ent.tmdbType !== tmdbType)) {
    // 判定为毒化键，拒绝向调用方返回
  }
  ```
- 严禁盲目信任反向索引指向的实体，防止历史脏数据导致跨影片关联。

### 2. 读取时自动物理净化 (On-Access Auto-Purge)
- 一旦检测到反向索引指向了错误的实体（或指向了已删除的虚空实体），系统必须立即调用 `kvDelete` 物理删除该毒化键：
  ```typescript
  console.warn(`[getEntityByTmdb Auto-Purge] Poisoned key: ${key} -> ${entityId}. Purging!`);
  await kvDelete(key);
  return null;
  ```
- 绝不允许“知错留错”，实现任意请求触碰脏数据时全自动单点物理清理。

### 3. 片名语义重叠门槛防线 (Title Overlap Guard)
- 在命中缓存实体后，必须校验该实体的 `title`、`originalTitle` 或 `slug` 是否与搜索命中项具备实质语义重叠（`hasTitleOverlap`）；
- 若标题无交集，坚决丢弃缓存并重新拉取官方最新精准详情。

### 4. URL 路由解析 ID 优先与权威别名路由
- `/title/[slug]` 解析严格遵循：显式别名映射（`slug:*`）最高优先 ➔ 实体物理 ID（`ik\d{6}`）优先 ➔ 纯中文标题检索 ➔ TMDB 在线冷门自愈；
- 严禁跳过 ID 拿 URL 尾部的英文短词反查同名其他剧集。

### 5. SEO 规范 URL 308 永久重定向 (Canonical 308 Permanent Redirect)
- 任何非权威规范 Slug，在详情页元数据与主体渲染阶段，统一通过服务端 `permanentRedirect` 触发 HTTP 308 单跳永久重定向：
  ```typescript
  const canonicalSlug = getEntityCanonicalSlug(entity);
  const currentCleanSlug = decodedSlug.toLowerCase();
  if (canonicalSlug && currentCleanSlug !== canonicalSlug && !isSeasonSpecified) {
    permanentRedirect(`/title/${encodeURIComponent(canonicalSlug)}`);
  }
  ```
- 将历史外链权重 100% 汇聚到规范地址，严禁使用客户端 307 软重定向。

---

## 六、实体解析评分与去重作业体系 (Entity Resolver & Deduplication)

1. **权威 ID 优先规则**：TMDB(type, id) 或 豆瓣 ID 一致直接确认为同一实体；
2. **多维证据加权评分**：标题 35% + 原名 20% + 年代 15% + 导演 15% + 主演 10% + 片长 5%。综合分 ≥ 0.88 判为 `same`，≤ 0.55 判为 `different`，中间状态进入 `review` 队列；
3. **确定性 Winner 选举**：外链权重 > 外部 ID 完整度 > 字段丰富度 > 早期 ID > 字典序，保证去重作业 100% 幂等；
4. **四阶段安全执行**：`scripts/seo/dedupe-backfill.mjs` 依次执行 `scan` ➔ `plan` ➔ `apply`（需 `--confirm`）➔ `verify`，自动建立 308 重定向与外链合并。

---

## 七、全站新片雷达零 404 与 URL 编码防撕裂架构 (Zero-404 & Anti-Mangle Spec)

### 1. 核心教训与防撕裂红线 (No Percent Mangling)
- **教训复盘**：曾因离线脚本对片名做了 `encodeURIComponent`，导致 `PREBAKED_LATEST_TITLES` 存储了 `%xx%xx` 编码串，随后前台 `getTitleCanonicalHref` 传给 `generateSlug` 时，`%` 被错当作非英数字符过滤并替换为连字符 `-`，把汉字彻底撕裂成十六进制连字符乱码（如 `/title/e9-98-bf-e6-b3-a2...`），引发全站最新上线模块大规模 404；
- **生成端铁律**：全站通用 `getTitleCanonicalHref(item)` 必须恒以真实中文片名（`item.title || item.name`）为第一基准生成标准 URL；对任何输入 slug 必须先执行 `decodeURIComponent` 解码，严禁将未解码的百分号编码串传入 `generateSlug`；
- **标准 6 位实体 ID 门禁**：必须且只能在实体具备标准 6 位 `ik\d{6}` 实体 ID 时才拼接 `${id}-${slug}`；对于未分配标准 ID 的雷达新片（临时内部 ID 如 `ik_radar_...` 或 `ik_pre_...`），对外 URL 恒为规范中文 URL `/title/片名`，严禁将临时内部 ID 拼入对外 URL 或触发伪 308 重定向。

### 2. 详情页预烘焙匹配三维防线与存量死链 100% 自动自愈
- **前台即必达**：凡是在首页大厅或各专区「最新上线」展示的卡片，详情页服务端路由（`app/title/[slug]/page.tsx`）的优先级 1.5 预烘焙命中引擎必须 100% 秒级匹配直出，彻底消灭“前台能看、点入 404”的断层；
- **历史死链自动自愈**：预烘焙匹配引擎必须内置对连字符十六进制碎片（`/[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}/i`）的自动识别与双向反解，任何因历史缓存或外部爬虫已收录的撕裂死链，进入详情页必须 100% 瞬间命中对应影片，并由服务端 `permanentRedirect`（HTTP 308）重定向至规范中文 URL，实现存量死链 100% 自动自愈；
- **数据生产源头纯净**：所有离线与增量同步脚本中的 `simpleSlug` 严禁使用 `encodeURIComponent`，必须直接输出纯净中文 slug。

### 3. 全自动回归测试门禁
- 凡修改 URL 生成、slug 解析或详情页匹配逻辑，必须运行：
  ```bash
  npx tsx scripts/test-latest-titles-404.mjs
  ```
  自动化断言全专区所有新片 100% 命中、历史死链 100% 自愈、0 个 404 后方可提交上线。
