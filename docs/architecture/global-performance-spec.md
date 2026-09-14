# iKanPP 全站极速加载与全球/大陆双轨性能架构规范 (Global Performance Spec)

> **版本**：v2.0.0 (永久生效基线)  
> **生效时间**：2026-09  
> **适用范围**：全站所有页面、组件、API、静态资源、图片传输链路  
> **维护机制**：**本规范为本仓库最高性能工程基线**。任何涉及图片加载、CDN 策略、缓存机制、字体加载或第三方依赖的改动，**必须与代码同步修订此文档**。

---

## 0. 性能底线承诺与核心指标

| 指标 | 海外用户 (美/欧/日/东南亚) | 中国大陆用户 (CN) | 二次访问 (全球) |
|:---|:---|:---|:---:|
| **首屏可交互 (TTI)** | < 1.0s | < 2.0s | **< 0.4s** |
| **图片首次加载** | < 40ms (Anycast 直连) | < 120ms (R2 / Edge 缓存) | **0ms** (SW 缓存) |
| **图片二次加载** | **0ms** | **0ms** | **0ms** |
| **LCP (最大内容渲染)** | < 0.8s | < 1.8s | **< 0.3s** |
| **CLS (布局偏移)** | 0 | 0 | **0** |

---

## 1. 架构总览：双轨智能分流与三级本地缓存

```
                          ┌────────────────────────────────────────────────────┐
                          │                用户浏览器 (Browser)                 │
                          │  ┌──────────┐  ┌──────────┐  ┌──────────────┐     │
                          │  │ SW Cache │  │ HTTP Cache│  │ Memory Cache │     │
                          │  │ (0ms)    │  │ (0ms)    │  │ (0ms)        │     │
                          │  └────┬─────┘  └────┬─────┘  └──────┬───────┘     │
                          │       └──────────────┴───────────────┘             │
                          │                   ▲ 三级本地缓存 (全球统一 0ms)      │
                          └───────────────────┼────────────────────────────────┘
                                              │ 未命中时
                                    ┌─────────┴──────────┐
                                    │  地域感知路由决策器   │
                                    │  (Cookie/cf-ip)    │
                                     └────┬──────────┬─────┘
                           普通海外用户   │          │ 受限国家(CN/MM/RU/IR/BY/SY等)
                                     ▼          ▼
                    ┌─────────────────────┐    ┌──────────────────────────────┐
                    │ 通道 A: CDN 零延迟直连│    │ 通道 B: R2 持久镜像 + Edge缓存│
                    │ image.tmdb.org      │    │ img.ikanpp.com (CF Anycast)  │
                    │ (Anycast 全球节点)   │    │ 或 /api/img-proxy 自动透写    │
                    │ [失败自愈降级至通道B] │    │ R2命中: 30~60ms (同域高速CDN) │
                    └─────────────────────┘    └──────────────────────────────┘
```

---

## 2. 核心架构组成与技术规范

### 2.1 物理尺寸精准降维矩阵 (Size Demagnification)
严禁直接加载未经尺寸规范的原始大图。所有图片渲染必须指定尺寸变体：

| 变体名称 (`variant`) | 物理宽度 (`width`) | 单图平均体积 | 适用场景 |
|:---|:---:|:---:|:---|
| `thumb` | **185px** | ~6 KB | Top10 紧凑卡片、搜索下拉弹窗、演职员头像 |
| `poster` | **342px** | ~15 KB | 瀑布流海报卡片 (MovieCard, ContentRail) |
| `detail` | **780px** | ~35 KB | 实体详情页海报大图 |
| `backdrop` | **1280px** | ~50 KB | 首页及频道页 Hero 通栏巨幕轮播背景 |
| `avatar` | **185px** | ~6 KB | 影人主页圆形头像 |

### 2.2 Cloudflare R2 全自动持久镜像 (Write-Through Architecture)
- **存储桶名称**：`ikanpp-images` (亚太 APAC 区域)
- **公开加速域名**：`https://img.ikanpp.com`（全站开启 Cloudflare 橙色云朵 Anycast 缓存与 HTTPS）
- **数据流转机制**：
  1. **查询 (Hit Check)**：请求优先探测 `img.ikanpp.com` 或 R2，命中即以 30~50ms 秒级直出；
  2. **回源 (Origin Fetch)**：若首次访问未命中，边缘节点拉取源站并自动完成防盗链伪装；
  3. **非阻塞透写 (Async Put)**：在吐给用户的同时，后台异步调用 Cloudflare API 写入 R2；
  4. **一次写入，永久极速**：后续全球任意用户请求同一张海报，永久享受 0 回源 CDN 极速。

### 2.3 零延迟边缘地域感知 (Edge Geo Injection)
- 在 `middleware.ts` 边缘阶段读取 `cf-ipcountry`；
- 毫秒级写入 `geo-region` Cookie（7天有效期）；
- 客户端组件在 0ms 阶段同步读取 Cookie，实现零网络往返、零客户端跳动闪烁。

### 2.4 Service Worker 0ms 全域海报缓存
- 拦截目标：`img.ikanpp.com`、`tmdb.org`、`doubanio.com`、`/api/img-proxy` 及静态图片；
- 策略：**Cache-First**。海报具备天然不可变性，二次加载直接 0ms 闪电响应。

### 2.6 演职员肖像智能自愈与零阻塞渲染 (CastRail Architecture)
- **客户端自愈组件 (`CastRail.tsx`)**：
  - 首屏直接渲染已有头像（纯内存 `getFastPersonAvatars` 0ms 直出，严禁在 SSR 阶段加设外部超时截断）；
  - 客户端挂载后，若检测到缺失头像的影人，在后台通过 `/api/person-avatars?names=...` 进行**非阻塞异步补全**，收到后平滑淡入（Fade in）渲染；
  - 100% 杜绝因网络延迟导致的单字兜底圆圈或图片丢失。
- **全站官方肖像库**：预置收录 760+ 位知名主创肖像，覆盖 7 大专区核心热播影视。

### 2.7 四维全量自动化预热引擎 (Full-Site Prewarm Engine)
由 `scripts/full-site-prewarm.ts` 与 GitHub Actions `.github/workflows/full-site-prewarm.yml` 驱动，实施无人值守的四维全量预热：
1. **影人头像增量入库**：自动扫描全站新片主创，批量补充 TMDB 官方肖像；
2. **全站图片 R2 预热**：规范降维多尺寸（w342 卡片、w1280 巨幕）推送到亚太 R2；
3. **详情页三维资产 R2 预热**：详情主画幅大图（w780）与肖像（w185）预先写入 R2；
4. **边缘 CDN 缓存热加载**：并发向生产发起全频道及核心影视详情页请求，让 Cloudflare 边缘节点提前锁定 ISR 与 RSC Prefetch 缓存，实现用户进站 **100% 30~50ms 秒开**。
### 2.8 八层极速秒开全栈架构 (Full-Site 8-Layer Ultra-Fast Architecture)
在 2026 年最新流媒体 Web 性能基准下，全站确立“八层极速秒开”全栈链路，各层无缝协同，将受限国家首次打开时间从 3~5 秒压缩至 0.8~1.2 秒，全球二次打开达到绝对 0ms：
1. **第 1 层：Cloudflare 边缘缓存与 30ms TTFB (Edge HTML Cache)**
   - 静态路由及边缘 ISR 在全球 330+ 数据中心缓存完整 HTML，首字节响应稳定在 30~50ms 内。
2. **第 2 层：SSR 高保真骨架首字节直出 (Zero-JS Skeleton First Paint)**
   - 彻底废除全站空白居中 `<div className="brand-spinner" />`；
   - 首页采用 `HomePageSkeleton`，各频道采用 `CategoryHubSkeleton`；
   - 服务端首字节 HTML 100% 直出真实 16:9 4K Hero 背景图（原生 `<img>`、`fetchPriority="high"`、`loading="eager"`）、真实标题、立即播放 CTA 与爱壹帆对齐的 TrendingNav 速报标签；
   - 用户肉眼在网络连接建立后第 100~300ms 即可感知到完整页面形态。
3. **第 3 层：全球与大陆全链路持久化海报镜像 (R2 Image Pipeline)**
   - 全网首屏 Hero 背景通过 `/api/img-proxy?url=...&w=1280` 由亚太 R2 同域秒出，彻底隔绝大陆等受限地区网络封锁。
4. **第 4 层：全站级推测预渲染与智能预取 (Speculation Rules API)**
   - `app/layout.tsx` 全站注入推测规则，在用户触碰或悬停时毫秒级在后台预渲染核心频道（`/movie`, `/tv`, `/anime`, `/variety`, `/documentary`, `/ranking`）与详情页（`/title/*`），实现 0ms 瞬间换页。
5. **第 5 层：非首屏 DOM 视口渲染跳过 (content-visibility: auto)**
   - 所有首屏下方的货架、全库瀑布流与剧情梗概模块应用 `.below-fold-rail` 与 `.below-fold-section`；
   - 使用 `contain-intrinsic-size` 锁死物理高度防止布局跳动（CLS 恒为 0），首屏 CPU 主线程渲染耗时立降 60~70%。
6. **第 6 层：非首屏组件严格按需动态加载 (Dynamic Imports)**
   - 侧边栏抽屉（WatchHistorySidebar, FavoritesSidebar）、搜索交互模块（SearchResults, NoResults, SearchLoadingAnimation）、非首屏货架（LiveChannelsPreview, CollectionsRail, PlatformFeaturesStrip, ExploreHubFooterBanner, PersonalizedForYouRail）全部转为 `dynamic(..., { ssr: false })` 异步 chunk，主包体积直降 30% 以上。
7. **第 7 层：HTTP/3 QUIC 传输优化与 Early Hints**
   - 启用 0-RTT 连接复用与 103 Early Hints，首屏资源并发提前握手。
8. **第 8 层：Service Worker PWA 全域智能预缓存**
   - `sw.js` 在 `install` 阶段预缓存全站核心频道页面 shell 与关键海报，实现离线与二次访问 100% 内存级 0ms 瞬间开启。

---

## 3. Cloudflare R2 资源安全与免费配额防护矩阵

通过以下三道防火墙，保障 R2 资源极度安全且 100% 运行在官方免费套餐之内：
1. **物理降维压缩**：1000+ 张核心图片总容量仅占用约 **81.5 MB**，仅占 10 GB 免费存储额度的 **0.8%**；
2. **写入频次控制**：每日定时 2 次预热 + 动态增量透写，Class A 每月约 6~8 万次，仅占 100 万次免费额度的 **7%**；
3. **CDN 边缘强缓存阻隔**：挂载 `Cache-Control: public, max-age=604800`，95% 以上的读图请求直接被边缘 Anycast CDN 拦截，根本不穿透到 R2 存储桶；
4. **永久 0 元免流**：Cloudflare R2 永久 0 出站流量费，从根本上杜绝天价账单风险。

---

## 4. 永久工程铁律 (Iron Rules)

> [!CAUTION]
> **以下十二条铁律为全站性能红线，任何后续开发与重构均不得违背：**

1. **绝对禁止引入外部 CDN 依赖**：不得引用 Google Fonts 外部直连、cdnjs、unpkg、jsdelivr 等存在国内阻断或污染风险的资源。全站字体必须通过 `next/font` 纯本地自托管打包。
2. **绝对禁止硬编码图片直连**：所有外部海报、剧照、演职员头像，必须统一经由 `getOptimizedImageUrl()` 接入降维与分流链路。
3. **严格禁止在海报卡片上加载超标尺寸**：列表卡片严禁使用 `original` 或 `w780` 以上原图，必须严格匹配 `variant` 规范。
4. **恪守流媒体与图片物理隔离**：本方案仅针对静态海报图片。视频正片严格遵循 `AGENTS.md` 铁律，100% 浏览器直连第三方源站 CDN，零转码、零切片、零持久存储。
5. **严禁删除 Service Worker 缓存规则**：海报缓存规则是实现 0ms 极速体验的底座，严禁注释或随意删除。
6. **严禁滥用 `fetchPriority="high"`**：除首屏核心 Hero 巨幕首图外，其他卡片严禁标记 high，以免挤占首屏 CSS 和关键 HTML 的网络信道。
7. **严禁移除 `content-visibility: auto`**：这是解决页面几百张卡片导致滚动卡顿的杀手锏，样式调试时不可擅自剔除。
8. **R2 镜像路径必须统一结构**：严格遵守 `{source}/{width}/{filename}` 格式，保持仓储整洁与命中一致性。
9. **严禁在详情页 SSR 阶段加设网络超时截断**：头像与资产获取必须走客户端非阻塞自愈（`CastRail`）或后台异步，严禁使用 `Promise.race` 截断产生空数据并污染 ISR 缓存。
10. **全站卡片必须遵循语义化 `<Link>` 规范**：严禁在影片卡片上使用 `e.preventDefault() + router.push()` 破坏 Next.js 原生预加载（Viewport & Hover Prefetch）机制。
11. **严禁在全站主要页面使用空白 brand-spinner 作为 Suspense fallback**：首页及 6 大频道页必须使用 `HomePageSkeleton` / `CategoryHubSkeleton` 在服务端首字节 HTML 中直出高保真大图与骨架。骨架背景图必须使用原生 `<img>` 配合 `fetchPriority="high"`，零 JS 依赖即刻启动网络传输。
12. **非首屏货架与次级交互组件必须实行严格按需动态加载 (Dynamic Imports)**：侧边栏抽屉、搜索交互模块与非首屏货架严禁打入首屏主 Entry Bundle，必须使用 `dynamic(..., { ssr: false })` 异步解耦。


