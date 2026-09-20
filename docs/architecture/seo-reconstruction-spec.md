# iKanPP SEO 体系化重构终极技术架构规范 (v5.0 旗舰白帽落地版)

**文档版本：** v5.0  
**生效时间：** 2026-09  
**适用域名：** www.ikanpp.com（主站）  
**技术栈：** Next.js 16.1.6 / Cloudflare Pages + D1 权威存储 + KV 边缘只读投影 / Google Search Console API / IndexNow Protocol  
**业务边界与铁律：** iKanPP 不转码、不切片、不存储任何视频文件，通过多个第三方影视源 API 聚合搜索内容，用户浏览器 100% 纯直连第三方播放源 CDN（严格遵守双轨流媒体架构隔离，iKanPP 零代理）。

---

## 一、 核心目标与系统拓扑

### 1.1 终极目标
> **构建事实驱动、白帽合规、防降权、D1 权威控制与 Edge 投影的现代化 SEO 架构，在 Google、Bing 及主流生成式 AI 搜索引擎（ChatGPT Search、Perplexity、Google AI Overviews）中建立真实权威度。**

实体详情页规模目标：**数万级**。本规范覆盖影视聚合站 SEO 可用的全部正规白帽前沿技术，零虚假数据、零机械模板、零第三方付费 API 依赖。

### 1.2 系统架构拓扑 (v5.0 全景)

```text
Googlebot / Bingbot / GPTBot / PerplexityBot / 真实用户
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  /title/{entityId}-{slug}                                   │
│  动态 SSR 实体详情页 (Server Component + Cloudflare 边缘缓存) │
│  ├─ 真实客观 Meta Description (年份·地区·流派·真实剧情简介)  │
│  ├─ 单一规范 JSON-LD @graph (WebSite + WebPage + Movie/TV)  │
│  │   (彻底清除机械伪造 FAQPage、虚假评分人数与伪造 VideoObject)│
│  ├─ AI Overview 事实速览档案 (严格剔除空值默认占位与假宣称)  │
│  ├─ 规范内链推荐集群 (RelatedSearchChips，消除搜索伪内链)   │
│  ├─ Google Discover 大图卡片 (max-image-preview: large)     │
│  ├─ Speculation Rules API → 后台预渲染次页秒开              │
│  └─ 自引用唯一规范 canonicalSlug (强制 308 永久重定向守护)   │
└──────────────────────────────┬──────────────────────────────┘
                               │ 用户点击 "立即播放"
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  /player?entity=ik000001&title=...&type=...                 │
│  客户端直连播放器界面 (Robots: noindex, nofollow)           │
│  ├─ robots.txt 放行此路径，允许爬虫正常读取并遵守 noindex     │
│  ├─ 严格携带 entity 参数，与旧版重定向检测彻底解耦          │
│  ├─ 多线路数据由 sessionStorage (gsKey) 传递，拒绝 URL 膨胀  │
│  └─ 浏览器 100% 直连第三方源站 CDN (零代理、零切片重写)       │
└─────────────────────────────────────────────────────────────┘
                               ▲
                               │ 每日无人值守自动化巡检与双向自愈
┌──────────────────────────────┴──────────────────────────────┐
│  SEO Intelligence OS (scripts/seo-intelligence.mjs)         │
│  ├─ GSC API 官方巡检 (Sitemap 状态、真实搜索词挖掘)         │
│  ├─ 第 11~30 位高潜冲榜词自动持久化 (seo-high-potential.json)│
│  ├─ IndexNow 协议增量受控广播 (POST Bearer Token 鉴权)      │
│  ├─ Google Indexing API 白名单安全熔断 (普通影视100%停用)   │
│  ├─ 实体去重评分引擎与确定性 Winner 选举算法 (D1/KV 实体库) │
│  └─ Truthful Lastmod 分卷切片与 ETag/304 边缘缓存极速协商   │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、 架构十七项铁律 (Architectural Invariants)

| 编号 | 铁律原则 | 架构设计要求 |
|:---|:---|:---|
| **R1** | **详情页核心正文必须服务端直出** | 严禁依赖客户端 JS 搜索或 `useEffect` 异步拉取正文，必须在 Server Component 渲染完整 HTML。 |
| **R2** | **详情页只读 Edge 投影，不查第三方 API** | 详情页渲染仅查询 Cloudflare KV 缓存投影，绝不向第三方采集源或外部 API 发起阻塞式 HTTP 请求。 |
| **R3** | **播放器页坚决 noindex 且爬虫可感知** | `/player` 页面输出 `robots: { index: false, follow: false }`；`robots.txt` 允许爬虫访问 `/player` 以便解析此标记，坚决避免索引黑盒。 |
| **R4** | **每个可索引页具备自引用 canonical** | 根布局绝不输出全局 canonical；每个页面（首页、详情页、分类页）独立输出自身的绝对自引用规范地址。 |
| **R5** | **Sitemap 只收录 200 真实优质 URL** | 严禁在 Sitemap 中提交 `/player` 空壳页或 0 作品空人物页；人物收录门槛必须为在库影视作品数 ≥ 1。 |
| **R6** | **无多语言绝不输出虚假 hreflang** | 严禁声明虚假的多国语言标记，避免触发搜索引擎规范化合并惩罚。 |
| **R7** | **URL 禁止携带 groupedSources** | 多线路状态一律存入 `sessionStorage`，URL 仅传 8 字符短键 `gsKey`，彻底消除 HTTP 414 风险。 |
| **R8** | **主 URL 统一使用规范 canonicalSlug** | 格式统一为 `/title/ik[6位序号]-[slug]`（如 `/title/ik000001-xiao-shen-ke-de-jiu-shu`）。 |
| **R9** | **严守双轨流媒体绝对隔离铁律** | iKanPP 普通影视 100% 浏览器纯直连第三方 CDN，绝不经过 `/api/proxy`，绝不改写 m3u8 切片。 |
| **R10** | **非规范 URL 统一使用 HTTP 308 跳转** | 详情页旧别名或非规范 slug 统一使用 HTTP 308 (Permanent Redirect) 单跳重定向至权威 URL，权重 100% 无损传递。 |
| **R11** | **TMDB 仅在管线与后台层调用** | 增量 Cron 与离线治理脚本负责异步写入 D1 权威库并投影至 KV，详情页在边缘高速读取，保护 TMDB 配额。 |
| **R12** | **实体事实溯源与质量门禁** | 引入 `FactProvenance` 体系与准出门禁，未验证评分/未探测线路严禁生成虚假断言。 |
| **R13** | **单一规范 JSON-LD @graph 架构** | 详情页统一输出单个规范 `@graph`，包含 `WebSite`、`WebPage`、`Movie`/`TVSeries`、`BreadcrumbList`，彻底移除伪造 `VideoObject` 与机械 `FAQPage`。 |
| **R14** | **真实增量感知与 304 协商** | Sitemap 历史分卷输出客观最后更新日期；分卷计算 SHA-256 ETag，对未变更请求秒回 `HTTP 304 Not Modified`。 |
| **R15** | **GEO 真实档案速览胶囊** | 部署 `<AiOverviewCapsule />`，基于数据库事实渲染，空值字段直接省略，禁止写死 2024/8.5/4K/免VIP 假数据。 |
| **R16** | **规范化语义内链拓扑** | `RelatedSearchChips` 输出规范分类或语义内链，彻底消除 `/search?q=` 动态伪内链。 |
| **R17** | **合规主动广播与安全隔离** | IndexNow 协议限制为安全 POST 鉴权广播；普通影视 100% 停用 Google Indexing API，仅保留白名单受限广播，避免降权封号。 |

---

## 三、 统一实体 ID 与数据模型

### 3.1 ID 命名规范
```text
entity_id = ik[6位自增序号]       例: ik000001
URL 结构  = /title/{entity_id}-{slug}
```

### 3.2 实体数据模型 (TitleEntity / PublishedTitleEntity)
```typescript
interface TitleEntity {
  entityId: string;            // "ik000001" (全局唯一不可变序号)
  slug: string;                // 拼音别名，例如 "xiao-shen-ke-de-jiu-shu"
  tmdbId: string;              // TMDB 官方条目 ID
  tmdbType: 'movie' | 'tv';    // TMDB 媒体类型
  doubanId?: string;           // 豆瓣 ID，可选
  title: string;               // 中文主标题，例如 "肖申克的救赎"
  originalTitle?: string;      // 原语言标题，例如 "The Shawshank Redemption"
  type: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary';
  year: string;                // 上映或播出年份
  description: string;         // 中文完整剧情梗概 (真实事实)
  cover: string;               // 海报图片 URL (w500)
  backdrop?: string;           // 剧照大图横版背景图 URL (w1280，用于 OG 与 Discover)
  rate: string;                // 真实评分
  genres: string[];            // 题材分类，例如 ["剧情", "犯罪"]
  directors: string[];         // 导演列表
  actors: string[];            // 主演列表
  region?: string;             // 制片国家/地区
  runtime?: number;            // 片长（分钟）
  numberOfSeasons?: number;    // 电视剧季数
  numberOfEpisodes?: number;   // 电视剧总集数
  keywords?: string[];         // 核心标签与长尾关键词
  relatedEntityIds?: string[]; // 站内强关联影片 entityId 列表 (内链网络拓扑)
  seoScore?: number;           // SEO 质量评分 (0-100)
  createdAt: string;           // 初次入库 ISO 8601 时间戳
  updatedAt: string;           // 最后更新 ISO 8601 时间戳
}
```

---

## 四、 工程落地与文件索引 (v5.0 全景)

| 功能模块 | 文件路径 | 架构核心职责 |
| :--- | :--- | :--- |
| **实体详情页 (SSR)** | [app/title/[slug]/page.tsx](file:///Users/zeyelvis/KVideo/app/title/[slug]/page.tsx) | 真实 Meta、单一 @graph、HTTP 308 重定向、GEO 胶囊与内链集群 |
| **单一 Schema 注入器** | [components/seo/TitleJsonLd.tsx](file:///Users/zeyelvis/KVideo/components/seo/TitleJsonLd.tsx) | 单一 `@graph`：`WebSite` + `WebPage` + `Movie`/`TVSeries` + `BreadcrumbList` |
| **AI Overview 胶囊** | [components/seo/AiOverviewCapsule.tsx](file:///Users/zeyelvis/KVideo/components/seo/AiOverviewCapsule.tsx) | 真实事实档案，无默认占位符，空值优雅隐藏 |
| **热搜与内链网组件** | [components/seo/RelatedSearchChips.tsx](file:///Users/zeyelvis/KVideo/components/seo/RelatedSearchChips.tsx) | 规范分类与语义标签内链，消除伪搜索跳转 |
| **规范 URL 助手** | [lib/utils/canonical.ts](file:///Users/zeyelvis/KVideo/lib/utils/canonical.ts) | 统一实体、人物、流派等权威规范 URL 派生 |
| **实体解析与去重评分** | [lib/server/entity-resolver.ts](file:///Users/zeyelvis/KVideo/lib/server/entity-resolver.ts) | 外部 ID 强比对、6 维加权证据评分、确定性 Winner 选举 |
| **D1 权威数据表定义** | [db/schema.sql](file:///Users/zeyelvis/KVideo/db/schema.sql) | 7 张核心表、外键级联与唯一索引约束 |
| **实体仓储抽象** | [lib/server/entity-repository.ts](file:///Users/zeyelvis/KVideo/lib/server/entity-repository.ts) | 隔离 D1 权威写入与 KV 边缘投影读取 |
| **发布投影服务** | [lib/server/publish-projection.ts](file:///Users/zeyelvis/KVideo/lib/server/publish-projection.ts) | 权威实体发布校验、内容哈希计算与 KV 缓存投影 |
| **Sitemap 真实切片** | [app/sitemap-index.xml/route.ts](file:///Users/zeyelvis/KVideo/app/sitemap-index.xml/route.ts) | 真实最后更新日期 (Truthful Lastmod) 与 0 重复索引 |
| **人物 Sitemap 门禁** | [app/sitemap-people.xml/route.ts](file:///Users/zeyelvis/KVideo/app/sitemap-people.xml/route.ts) | 在库作品数 ≥ 1 准入门槛，杜绝 0 作品空人物页进地图 |
| **分卷 304 缓存路由**| [app/api/seo/sitemap-titles/[page]/route.ts](file:///Users/zeyelvis/KVideo/app/api/seo/sitemap-titles/[page]/route.ts) | 原生 Web Crypto ETag 计算与 HTTP 304 极速响应 |
| **增量管线与质量门禁**| [app/api/seo/entity-pipeline/route.ts](file:///Users/zeyelvis/KVideo/app/api/seo/entity-pipeline/route.ts) | `calculateSeoScore` 门禁与安全内容核验 |
| **IndexNow 安全接口** | [app/api/seo/indexnow/route.ts](file:///Users/zeyelvis/KVideo/app/api/seo/indexnow/route.ts) | 封禁 GET 推送，强制 POST Bearer Token 鉴权 |
| **全站 URL 审计工具** | [scripts/seo/audit-urls.mjs](file:///Users/zeyelvis/KVideo/scripts/seo/audit-urls.mjs) | 规范 20.3 节自动化审计工具，输出 JSON 与 Markdown 报表 |
| **去重回填作业工具** | [scripts/seo/dedupe-backfill.mjs](file:///Users/zeyelvis/KVideo/scripts/seo/dedupe-backfill.mjs) | scan/plan/apply/verify 四阶段去重，带 `--confirm` 安全锁 |
| **双轨流媒体架构准则**| [AGENTS.md](file:///Users/zeyelvis/KVideo/AGENTS.md) | 工程底线、双轨流媒体绝对隔离与性能规范 |
