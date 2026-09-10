# iKanPP SEO 体系化重构终极技术架构规范 (v3.1 正式落地版)

**文档版本：** v3.1  
**生效时间：** 2026-09  
**适用域名：** www.ikanpp.com（主站）  
**技术栈：** Next.js 16.1.6 / Cloudflare Pages + KV（Edge Runtime）  
**业务边界与铁律：** iKanPP 不转码、不切片、不存储任何视频文件，通过多个第三方影视源 API 聚合搜索内容，用户浏览器 100% 纯直连第三方播放源 CDN（严格遵守双轨流媒体架构隔离，iKanPP 零代理）。

---

## 一、 核心目标与系统拓扑

### 1.1 终极目标
> **用户在 Google、Bing 及主流 AI 搜索引擎搜索任何一部中文可搜影视时，都能找到 iKanPP 的权威详情页并秒级播放。**

实体详情页规模目标：**数万级**。本规范覆盖影视聚合站 SEO 可用的全部正规白帽前沿技术。

### 1.2 系统架构拓扑

```text
Googlebot / Bingbot / AI 爬虫 / 真实用户
                │
                ▼
┌─────────────────────────────────────────────────────────────┐
│  /title/{entityId}-{slug}                                   │
│  动态 SSR 实体详情页 (Server Component + Cloudflare 边缘缓存) │
│  ├─ 语义唯一 H1 + 豆瓣/TMDB 真实评分 + 演职员表              │
│  ├─ AEO 回答胶囊 (Answer Capsule) → AI Overview 引用优化    │
│  ├─ Google Discover 大图卡片 (max-image-preview: large)     │
│  ├─ Schema.org (Movie/TVSeries + BreadcrumbList)            │
│  ├─ 密闭内链网格 (同导演/同演员/同题材推荐)                  │
│  ├─ Speculation Rules API → 后台预渲染次页秒开              │
│  └─ 自引用唯一 canonical                                    │
└──────────────────────────────┬──────────────────────────────┘
                               │ 用户点击 "立即播放"
                               ▼
┌─────────────────────────────────────────────────────────────┐
│  /player?entity=ik000001&title=...&type=...                 │
│  客户端直连播放器界面 (Robots: noindex, nofollow)           │
│  ├─ 严格携带 entity 参数，与旧版 301 重定向检测彻底解耦     │
│  ├─ 多线路数据由 sessionStorage (gsKey) 传递，拒绝 URL 膨胀  │
│  └─ 浏览器 100% 直连第三方源站 CDN (零代理、零切片重写)       │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、 架构十一项铁律 (Architectural Invariants)

| 编号 | 铁律原则 | 架构设计要求 |
|:---|:---|:---|
| **R1** | **详情页核心正文必须服务端直出** | 严禁依赖客户端 JS 搜索或 `useEffect` 异步拉取正文，必须在 Server Component 渲染完整 HTML。 |
| **R2** | **详情页只读 KV，不查第三方 API** | 详情页渲染仅查询 Cloudflare KV 索引，绝不向第三方采集源或外部 API 发起实时 HTTP 请求。 |
| **R3** | **播放器页坚决 noindex** | `/player` 必须在 layout 导出 `robots: { index: false, follow: false }`，且在 robots.txt 中 `Disallow: /player`。 |
| **R4** | **每个可索引页具备自引用 canonical** | 根布局绝不输出全局 canonical；每个页面（首页、详情页、分类页）独立输出自身的绝对自引用规范地址。 |
| **R5** | **Sitemap 只收录 200 可索引 URL** | 严禁在 Sitemap 中提交 `/player` 空壳页或带动态参数的重复页面。 |
| **R6** | **无多语言绝不输出虚假 hreflang** | 严禁声明虚假的多国语言标记，避免触发 Google 规范化合并惩罚。 |
| **R7** | **URL 禁止携带 groupedSources** | 多线路状态一律存入 `sessionStorage`，URL 仅传 8 字符短键 `gsKey`，彻底消除 HTTP 414 风险。 |
| **R8** | **主 URL 统一使用自有 entity_id** | 格式统一为 `/title/ik[6位序号]-[slug]`（如 `/title/ik000001-xiao-shen-ke-de-jiu-shu`）。 |
| **R9** | **严守双轨流媒体绝对隔离铁律** | iKanPP 普通影视 100% 浏览器纯直连第三方 CDN，绝不经过 `/api/proxy`，绝不改写 m3u8 切片。 |
| **R10** | **播放按钮必须携带 entity 参数** | 从详情页跳转播放器必须携带 `entity` 参数；中间件仅拦截无 `entity` 的旧链接做 301 重定向，杜绝循环 301。 |
| **R11** | **TMDB 仅在管线与后台层调用** | 每日增量 Cron 与离线种子脚本负责写入 KV，详情页在边缘高速读取，保护 TMDB 限流配额。 |

---

## 三、 统一实体 ID 与数据模型

### 3.1 ID 命名规范
```text
entity_id = ik[6位自增序号]       例: ik000001
URL 结构  = /title/{entity_id}-{slug}
```

### 3.2 实体数据模型 (TitleEntity)
```typescript
interface TitleEntity {
  entityId: string;            // "ik000001" (全局唯一不可变序号)
  slug: string;                // 拼音别名，例如 "xiao-shen-ke-de-jiu-shu"
  tmdbId: string;              // TMDB 官方条目 ID
  tmdbType: 'movie' | 'tv';    // TMDB 媒体类型
  doubanId?: string;           // 豆瓣 ID，可选
  title: string;               // 中文主标题，例如 "肖申克的救赎"
  originalTitle?: string;      // 原语言标题，例如 "The Shawshank Redemption"
  type: 'movie' | 'tv' | 'anime'; // iKanPP 归类：电影 / 剧集 / 动漫
  year: string;                // 上映或播出年份
  description: string;         // 中文完整剧情梗概 (≥150字，供 AI 引用)
  cover: string;               // 海报图片 URL (w500)
  backdrop?: string;           // 剧照大图横版背景图 URL (w1280，用于 OG 与 Discover)
  rate: string;                // 评分，例如 "9.7"
  genres: string[];            // 题材分类，例如 ["剧情", "犯罪"]
  directors: string[];         // 导演列表
  actors: string[];            // 主演列表 (前 5 位)
  region?: string;             // 制片国家/地区
  runtime?: number;            // 片长（分钟）
  numberOfSeasons?: number;    // 电视剧季数
  numberOfEpisodes?: number;   // 电视剧总集数
  keywords?: string[];         // 核心标签与长尾关键词
  relatedEntityIds?: string[]; // 站内强关联影片 entityId 列表 (内链网络拓扑)
  createdAt: string;           // 初次入库 ISO 8601 时间戳
  updatedAt: string;           // 最后更新 ISO 8601 时间戳
}
```

### 3.3 Cloudflare KV 存储与二级反向索引矩阵
| Key 模式 | Value 类型 | 用途与检索场景 |
| :--- | :--- | :--- |
| `entity:{id}` | `TitleEntity` JSON | 主键查询详情页数据 |
| `slug:{id}-{slug}` | `entityId` 字符串 | URL 路径解析为实体 ID |
| `tmdb:{type}:{tmdbId}` | `entityId` 字符串 | TMDB 抓取入库排重 |
| `title:{normalized}` | `entityId` 字符串 | 片名归一化快速匹配，承接旧 URL 301 重定向 |
| `genre:{genre}` | `entityId[]` JSON 数组 | 题材分类聚合页与同类推荐检索 |
| `director:{name}` | `entityId[]` JSON 数组 | 导演作品专栏与同导演内链推荐 |
| `actor:{name}` | `entityId[]` JSON 数组 | 演员作品专栏与同主演内链推荐 |
| `index:all` | `entityId[]` JSON 数组 | 全站总实体索引库，用于生成分卷 Sitemap |
| `counter:next_id` | 数字字符串 | 实体自增序号发号器 |

---

## 四、 全量 SEO 前沿技术矩阵

### 4.1 动态 SSR 详情页与元数据模板
- **Title 规范**：
  - 电影：`{title} ({year}) 在线观看 - 免费高清完整版 | iKanPP 爱看片片`
  - 电视剧：`{title} ({year}) 全集在线观看 - 免费极速播放 | iKanPP 爱看片片`
- **Meta Description 规范**：
  - `在 iKanPP 免费在线观看《{title}》({year}) {type}。{description前120字}... 导演: {directors}，主演: {actors}。海外华人免翻墙极速超清直连播放。`
- **Google Discover 大图信号**：
  - `max-image-preview: large` 标记
  - 1280×720 高清剧照作为 OpenGraph 图片

### 4.2 AEO (Answer Engine Optimization) 回答胶囊
针对 Google AI Overview、ChatGPT Search、Perplexity 等生成式引擎：
- 在详情页正文顶部独立渲染结构化“影片概览 (Storyline)”胶囊卡片；
- 段落自闭环且具备完整事实主体（片名、类型、题材、主要矛盾、导演、主演）；
- 输出 `max-snippet: -1` 授权 AI 引擎完整提取。

### 4.3 结构化数据 (Schema.org) 全家桶
| Schema 类型 | 挂载页面 | 核心价值 |
|:---|:---|:---|
| **WebSite + SearchAction** | 首页 | 获得 Google 搜索框富摘要结果 |
| **Organization** | 全站 | 强化品牌与海外华人影视聚合站 E-E-A-T 实体权威 |
| **Movie / TVSeries** | 详情页 | 触发影片知识卡片、上映年份、评分、演职员富摘要 |
| **BreadcrumbList** | 详情页、分类页 | 呈现清晰的层级面包屑路径（首页 > 电影 > 片名） |
| **ItemList** | 分类聚合页 | 将分类下全部精选卡片组织为合集结构化列表 |

### 4.4 Speculation Rules API 零感知次页秒开
在详情页与分类页底部注入原生 `speculationrules` 配置：
```json
{
  "prerender": [{
    "source": "document",
    "where": {
      "and": [
        { "href_matches": "/title/*" },
        { "not": { "href_matches": "/player*" } },
        { "not": { "href_matches": "/premium*" } }
      ]
    },
    "eagerness": "moderate"
  }]
}
```
当用户在详情页或分类页鼠标悬停至相关推荐卡片时，Chromium 内核浏览器将在后台以低优先级预渲染目标页面，用户点击时实现 0ms 视觉瞬开。

### 4.5 分层 Sitemap 架构
```text
/sitemap-index.xml (总索引)
  ├─ /sitemap.xml          (核心主频道与公开静态页面，~16 个，含 /movie, /tv, /anime, /variety, /short)
  ├─ /sitemap-genres.xml   (16 大核心题材分类聚合页，含短剧与综艺专区)
  └─ /sitemap-titles-1.xml (影视实体详情页分卷，单卷上限 10,000 条)
```

### 4.6 边缘强缓存与 Cloudflare 费用控制
通过 `public/_headers` 针对详情页与分类页配置 Cloudflare CDN 边缘强缓存：
```http
/title/*
  Cache-Control: public, max-age=3600, s-maxage=604800, stale-while-revalidate=86400
  CDN-Cache-Control: public, s-maxage=604800
  Cloudflare-CDN-Cache-Control: public, s-maxage=604800
```
- 95% 以上的爬虫和访客请求直接在 Cloudflare 全球 300+ 边缘节点秒级返回；
- 彻底避免穿透到 KV 与 Worker 计算计费，全站月度 Cloudflare 账单稳定在 **$0 ~ $5 / 月**。

---

## 五、 工程落地与文件索引

| 功能模块 | 文件路径 |
| :--- | :--- |
| **全局根布局** | [app/layout.tsx](file:///Users/zeyelvis/KVideo/app/layout.tsx) |
| **首页服务端组件** | [app/page.tsx](file:///Users/zeyelvis/KVideo/app/page.tsx) |
| **首页客户端组件** | [components/home/HomePageClient.tsx](file:///Users/zeyelvis/KVideo/components/home/HomePageClient.tsx) |
| **首页多Tab流媒体货架** | [components/home/PopularFeatures.tsx](file:///Users/zeyelvis/KVideo/components/home/PopularFeatures.tsx) |
| **短剧频道主路由 (SSR)**| [app/short/page.tsx](file:///Users/zeyelvis/KVideo/app/short/page.tsx) |
| **短剧频道客户端组件** | [app/short/ShortClient.tsx](file:///Users/zeyelvis/KVideo/app/short/ShortClient.tsx) |
| **实体详情页 (SSR)** | [app/title/[slug]/page.tsx](file:///Users/zeyelvis/KVideo/app/title/[slug]/page.tsx) |
| **详情页播放按钮** | [components/title/PlayButton.tsx](file:///Users/zeyelvis/KVideo/components/title/PlayButton.tsx) |
| **影视 Schema.org** | [components/seo/TitleJsonLd.tsx](file:///Users/zeyelvis/KVideo/components/seo/TitleJsonLd.tsx) |
| **长尾分类聚合页** | [app/genre/[slug]/page.tsx](file:///Users/zeyelvis/KVideo/app/genre/[slug]/page.tsx) |
| **合集 ItemList Schema**| [components/seo/ItemListJsonLd.tsx](file:///Users/zeyelvis/KVideo/components/seo/ItemListJsonLd.tsx) |
| **KV 存储与索引服务** | [lib/services/entity-kv.ts](file:///Users/zeyelvis/KVideo/lib/services/entity-kv.ts) |
| **TMDB 深度抓取服务** | [lib/services/entity-enrichment.ts](file:///Users/zeyelvis/KVideo/lib/services/entity-enrichment.ts) |
| **每日增量同步 Cron** | [app/api/seo/entity-pipeline/route.ts](file:///Users/zeyelvis/KVideo/app/api/seo/entity-pipeline/route.ts) |
| **批量抓取种子脚本** | [scripts/seed-entities.ts](file:///Users/zeyelvis/KVideo/scripts/seed-entities.ts) |
| **路由中间件与 301** | [middleware.ts](file:///Users/zeyelvis/KVideo/middleware.ts) |
| **Sitemap 总索引** | [app/sitemap-index.xml/route.ts](file:///Users/zeyelvis/KVideo/app/sitemap-index.xml/route.ts) |
| **Robots 配置** | [app/robots.ts](file:///Users/zeyelvis/KVideo/app/robots.ts) |
| **RSS Feed 规范** | [app/feed.xml/route.ts](file:///Users/zeyelvis/KVideo/app/feed.xml/route.ts) |
| **Cloudflare 边缘规则**| [public/_headers](file:///Users/zeyelvis/KVideo/public/_headers) |
| **双轨流媒体架构规范**| [docs/architecture/dual-track-streaming-spec.md](file:///Users/zeyelvis/KVideo/docs/architecture/dual-track-streaming-spec.md) |
