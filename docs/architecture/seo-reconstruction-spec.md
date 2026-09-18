# iKanPP SEO 体系化重构终极技术架构规范 (v4.0 旗舰落地版)

**文档版本：** v4.0  
**生效时间：** 2026-09  
**适用域名：** www.ikanpp.com（主站）  
**技术栈：** Next.js 16.1.6 / Cloudflare Pages + KV（Edge Runtime） / Google Search Console API / IndexNow Protocol  
**业务边界与铁律：** iKanPP 不转码、不切片、不存储任何视频文件，通过多个第三方影视源 API 聚合搜索内容，用户浏览器 100% 纯直连第三方播放源 CDN（严格遵守双轨流媒体架构隔离，iKanPP 零代理）。

---

## 一、 核心目标与系统拓扑

### 1.1 终极目标
> **用户在 Google、Bing 及主流生成式 AI 搜索引擎（ChatGPT Search、Perplexity、Google AI Overviews）搜索任何一部中文影视时，都能找到 iKanPP 的权威详情页并秒级播放。**

实体详情页规模目标：**数万级**。本规范覆盖影视聚合站 SEO 可用的全部正规白帽前沿技术，零第三方付费 API 依赖。

### 1.2 系统架构拓扑 (v4.0 全景)

```text
Googlebot / Bingbot / GPTBot / PerplexityBot / 真实用户
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│  /title/{entityId}-{slug}                                   │
│  动态 SSR 实体详情页 (Server Component + Cloudflare 边缘缓存) │
│  ├─ 动态多维 Meta Description (【年份·地区·评分·流派】唯一化)  │
│  ├─ 复合结构化数据 (Movie/TV + VideoObject + FAQ + Breadcrumb)│
│  ├─ AI Overview 结构化速览胶囊 (AiOverviewCapsule 微格式)     │
│  ├─ 影迷热搜聚合与高权重锚文本网 (RelatedSearchChips)         │
│  ├─ 站内相关推荐高潜词置顶提权 (PageRank Boost)               │
│  ├─ Google Discover 大图卡片 (max-image-preview: large)     │
│  ├─ Speculation Rules API → 后台预渲染次页秒开              │
│  └─ 自引用唯一规范 canonicalSlug (强制 301 永久重定向守护)   │
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
                               ▲
                               │ 每日无人值守自动化巡检与双向自愈
┌──────────────────────────────┴──────────────────────────────┐
│  SEO Intelligence OS (scripts/seo-intelligence.mjs)         │
│  ├─ GSC API 官方巡检 (Sitemap 状态、真实搜索词挖掘)         │
│  ├─ 第 11~30 位高潜冲榜词自动持久化 (seo-high-potential.json)│
│  ├─ IndexNow 协议全量大盘广播 (Bing/Yandex，数万条/日)      │
│  ├─ Google Indexing API 精准受控促抓 (≤150条/日，安全防封)  │
│  ├─ URL Inspection 异常检测与死链主动清退 (URL_DELETED)     │
│  └─ Truthful Lastmod 分卷切片与 ETag/304 边缘缓存极速协商   │
└─────────────────────────────────────────────────────────────┘
```

---

## 二、 架构十七项铁律 (Architectural Invariants)

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
| **R12** | **实体入库质量门禁 (Quality Gate)** | 植入 `calculateSeoScore`（满分 100），仅评分 ≥ 60 分的高质量实体允许进入即时主动推送池。 |
| **R13** | **四层结构化数据复合共振** | 详情页同时输出 `Movie`/`TVSeries` + `VideoObject` + `BreadcrumbList` + `FAQPage`，抢占富媒体展示与双倍问答卡片。 |
| **R14** | **真实增量感知与 304 协商** | Sitemap 历史分卷输出客观最后更新日期；分卷计算 SHA-256 ETag，对未变更请求秒回 `HTTP 304 Not Modified`。 |
| **R15** | **GEO 生成式引擎微格式规范** | 部署 `<AiOverviewCapsule />` 事实速览档案，专供 GPTBot 等大模型抓取，争夺 ChatGPT Search / Google AI Overview 信源。 |
| **R16** | **高潜词站内内链智能提权** | 每日将 GSC 第 11~30 位高潜词沉淀至本地库，详情页相关推荐对同题材高潜影片置顶赋权，助力突破首页。 |
| **R17** | **双轨主动广播与死链清退** | 全网大盘走 IndexNow（数万条/日），Google 走安全受控通道（≤150条/日），发现软404/死链主动发送 `URL_DELETED`。 |

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
  type: 'movie' | 'tv' | 'anime' | 'variety' | 'documentary';
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
  seoScore?: number;           // SEO 质量评分 (0-100)，≥60 分准入主动推送池
  createdAt: string;           // 初次入库 ISO 8601 时间戳
  updatedAt: string;           // 最后更新 ISO 8601 时间戳
}
```

---

## 四、 工程落地与文件索引 (v4.0 全景)

| 功能模块 | 文件路径 | 架构核心职责 |
| :--- | :--- | :--- |
| **实体详情页 (SSR)** | [app/title/[slug]/page.tsx](file:///Users/zeyelvis/KVideo/app/title/[slug]/page.tsx) | 动态 Meta、高潜推荐加权、GEO 胶囊与内链集群挂载 |
| **四维 Schema 注入器** | [components/seo/TitleJsonLd.tsx](file:///Users/zeyelvis/KVideo/components/seo/TitleJsonLd.tsx) | `Movie`/`TV` + `VideoObject` + `Breadcrumb` + `FAQPage` |
| **AI Overview 胶囊** | [components/seo/AiOverviewCapsule.tsx](file:///Users/zeyelvis/KVideo/components/seo/AiOverviewCapsule.tsx) | 影视速览档案与 Schema.org 微格式卡片 |
| **热搜与内链网组件** | [components/seo/RelatedSearchChips.tsx](file:///Users/zeyelvis/KVideo/components/seo/RelatedSearchChips.tsx) | 动态渲染高潜词语义锚文本与探索路径 |
| **高潜词知识库** | [lib/data/seo-high-potential.json](file:///Users/zeyelvis/KVideo/lib/data/seo-high-potential.json) | 存储 GSC 第 11~30 位高潜词，供前端 0ms 内存读取 |
| **SEO 智能巡检主引擎**| [scripts/seo-intelligence.mjs](file:///Users/zeyelvis/KVideo/scripts/seo-intelligence.mjs) | GSC 诊断、IndexNow 广播、Google 促抓/清退与报告自动写入 KV |
| **每日自动化工作流** | [.github/workflows/seo-intelligence.yml](file:///Users/zeyelvis/KVideo/.github/workflows/seo-intelligence.yml) | 每日 UTC 03:00 (北京时间 11:00) 无人值守自动巡检 |
| **Sitemap 真实切片** | [app/sitemap-index.xml/route.ts](file:///Users/zeyelvis/KVideo/app/sitemap-index.xml/route.ts) | 真实最后更新日期 (Truthful Lastmod) 计算 |
| **分卷 304 缓存路由**| [app/api/seo/sitemap-titles/[page]/route.ts](file:///Users/zeyelvis/KVideo/app/api/seo/sitemap-titles/[page]/route.ts) | 原生 Web Crypto ETag 计算与 HTTP 304 极速响应 |
| **增量管线与质量门禁**| [app/api/seo/entity-pipeline/route.ts](file:///Users/zeyelvis/KVideo/app/api/seo/entity-pipeline/route.ts) | `calculateSeoScore` 门禁与新增实体安全推送 |
| **SEO 控制台壳工程** | [app/admin/layout.tsx](file:///Users/zeyelvis/KVideo/app/admin/layout.tsx) | Zero Trust 邮箱 OTP + JWT 双层鉴权，前台组件全屏蔽 |
| **仪表盘总览** | [app/admin/dashboard/page.tsx](file:///Users/zeyelvis/KVideo/app/admin/dashboard/page.tsx) | 实体库大盘、配额熔断、质量评级与实时审计日志 |
| **实体管理与 SERP 预览**| [app/admin/entities/page.tsx](file:///Users/zeyelvis/KVideo/app/admin/entities/page.tsx) | 多维筛选、批量促抓、实体查改删与 Google SERP 高保真卡片 |
| **SEO 监控中心** | [app/admin/seo/page.tsx](file:///Users/zeyelvis/KVideo/app/admin/seo/page.tsx) | Sitemap 状态表、高潜冲榜词、自愈记录与远程 Actions 调度 |
| **促抓控制台** | [app/admin/indexing/page.tsx](file:///Users/zeyelvis/KVideo/app/admin/indexing/page.tsx) | 单条/批量促抓、清退、诊断与 180 条安全熔断锁 |
| **GSC 流量分析** | [app/admin/analytics/page.tsx](file:///Users/zeyelvis/KVideo/app/admin/analytics/page.tsx) | 30 天核心搜索词分析与页面 CTR 优化诊断 |
| **系统配置与审计** | [app/admin/system/page.tsx](file:///Users/zeyelvis/KVideo/app/admin/system/page.tsx) | KV 延迟体检、脱敏密钥探测、Actions 调度与 90 天审计日志 |
| **双轨流媒体架构准则**| [AGENTS.md](file:///Users/zeyelvis/KVideo/AGENTS.md) | 工程底线、双轨流媒体绝对隔离与性能规范 |
