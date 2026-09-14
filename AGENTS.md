# iKanPP (KVideo) 工程与架构准则

本文档是本仓库的核心工程规范。所有参与本项目的开发者、维护者及 AI 编程助手必须严格遵守以下准则。

---

## 1. 核心架构：iKanPP 与 iKanX 双轨绝对隔离 (Dual-Track Streaming)

本项目严格划分为两条业务与网络架构截然不同的轨道，**绝不可混为一谈**：

### 轨道 A：iKanPP 主站普通影视 (`/player`, `isPremium: false`)
- **定位**：全网主流公网影视采集库（光速源、无尽源、最大源、极速源、新浪源等）。
- **网络模型**：**100% 浏览器纯直连第三方源站 CDN (Direct Play)**。
- **架构铁律**：
  1. **禁止任何代理**：`proxyMode` 必须恒为 `'none'`，`effectiveUseProxy` 必须恒为 `false`。
  2. **禁止任何切片重写**：严禁调用 `processM3u8Content` 改写 m3u8 内部的 `.ts` 切片地址。
  3. **容灾唯有纯前端切源**：当某个源在特定地区超时或死链时，唯一的自愈策略是前端自动切换到下一条可用源（如光速 ➔ 无尽 ➔ 最大），**绝对不允许通过 `/api/proxy` 尝试抢救死链**。

### 轨道 B：iKanX 午夜专区 / 绅士特区 (`/premium/player`, `isPremium: true`)
- **定位**：具有严格防盗链限制的特区站点（如 Jable 等校验 `Referer: https://jable.tv/` 的源）。
- **网络模型**：通过 Cloudflare Edge Worker (`/api/proxy`) 进行请求头伪装与中转。
- **架构机制**：必须使用 `processM3u8Content` 将其内部切片重写为带代理标记的 URL，以防客户端直连触发 403 阻断。

---

## 2. 播放器卡顿与自愈红线 (No Aggressive Nudge)

- **绝对禁忌**：**严禁在任何卡顿检测逻辑中执行 `videoRef.current.currentTime += 0.1` 或任何强行拨快时间轴的操作！**
- **底层原理**：HLS 协议依赖浏览器的 SourceBuffer 自然流水线。修改 `currentTime` 会强制清空浏览器已下载的所有切片缓冲并重新发起握手请求。在弱网或高延迟地区，这将导致严重的“缓冲 ➔ 被拨快 ➔ 清空缓冲 ➔ 重新握手 ➔ 再次超时”无限死循环。
- **正规做法**：检测到缓冲等待时，仅通过 `setIsLoading(true)` 显示加载圈，给予底层的 Hls.js 充足的网络缓冲时间。

---

## 3. 切片概念与术语规范

- **我们绝不切片**：本项目所有服务都不转码、不存储、不对视频进行任何切片操作。
- **切片的真实含义**：HLS 流媒体协议中，第三方源站分发的 `.m3u8` 本身由一个个 2~10 秒的 `.ts` 视频小片段构成（技术规范称之为 segment / 切片）。浏览器加载这些片段是正常的 HLS 原理，切勿误导为“我们平台正在切片”。

---

## 4. 存储与状态物理隔离

- 主站普通影视使用 `useHistoryStore` 和 `settingsStore`。
- 午夜特区使用 `usePremiumHistoryStore` 和 `premiumModeSettingsStore`。
- 二者在 localStorage 中严格分库分表，绝不共用同一状态池，防止数据交叉污染与隐私泄露。

---

## 5. 重大架构演进与文档同步铁律 (Architecture Spec Sync)

- **同步更新义务**：凡涉及播放器核心调度、切源自愈机制、代理路由策略、CDN 规则或双轨边界的重大架构调整或新增功能，**必须在提交代码的同时一并更新 [dual-track-streaming-spec.md](docs/architecture/dual-track-streaming-spec.md)**。
- **文档即基线**：代码实现与架构文档必须保持 100% 严格一致，严禁“只改代码、放任文档过期”。任何有悖于该架构文档的设计或代码改动均被视为违规。

---

## 6. 全站各专区 Hero 轮播大图与频道专属快捷推荐速报标签绝对对齐铁律 (Hero & Trending Nav Iron Rule)

本项目全站（首页大厅、电影、电视剧、综艺、动漫、纪录片 6 大专区）的顶部通栏巨幕与中栏文字速报标签已确立为最高优先级工程基线，**必须且只能 100% 绝对对齐爱壹帆官方原生各页面的真实数量与排版，任何后续开发严禁擅自修改、混淆或一刀切**：

### 1. 数据接口与专区专属数量铁律
- **Hero 通栏全景巨幕（8 席）**：数据源必须且只能对接爱壹帆官方频道焦点轮播接口（`getflashbanner?cinema=1&cid=${cid}&size=20`），结合 TMDB / 豆瓣智能补齐 4K 宽屏剧照 (`backdrop`)、高清竖版海报、剧情简介与豆瓣真实评分。**严禁将轮播大图片名误塞入下方的文字标签中！**
- **各专区专属速报标签矩阵（trendingNav，绝对对齐爱壹帆原生）**：数据源必须且只能 100% 绝对对齐爱壹帆官方原生二级速报接口（`list/getHotVideoTop?cinema=1&cid=${cid}`），并真实保留官方更新角标（如 `[1]`、`[2]`），且每个专区的展示数量与拆行完全遵循官方原生页面标准：
  - **电影专区**：12 席（6 + 6 原生对称矩阵，片名精悍紧凑）
  - **首页大厅**：12 席（6 + 6 原生对称矩阵，上下各 6 席严丝合缝无缺席）
  - **电视剧专区**：12 席（6 + 6 原生对称矩阵，黄金档热剧速报严丝合缝无缺席）
  - **动漫专区**：12 席（6 + 6 原生对称矩阵，热门年番新番速报，绝对 1:1 对齐爱壹帆官方原生）
  - **综艺专区**：8 席（4 + 4 原生矩阵，季播长标题舒展呼吸）
  - **纪录片专区**：8 席（4 + 4 原生矩阵，神级高分巨制速报）
  **严禁一刀切，严禁互相混淆，绝对 1:1 对齐官方原生！**

### 2. 覆盖板块基线
全站 6 大核心板块必须全量覆盖并保持各自独立的频道 CID：
- 首页大厅：`cid=0,1`
- 电影专区：`cid=0,1,3`
- 电视剧专区：`cid=0,1,4`
- 综艺专区：`cid=0,1,5`
- 动漫专区：`cid=0,1,6`
- 纪录片专区：`cid=0,1,7`

### 3. 全自动闭环巡检铁律
- **执行频次**：由 `.github/workflows/sync-iyf-channels.yml` **每小时整点全自动巡检与极速同步（`0 * * * *`）**，精准捕捉电视剧、热门新番、王牌综艺与院线新片的连载集数角标（如 `[1]`、`[2]`、`[5]`），确保高频更新剧目在 1 小时内全自动感知上线。
- **自动部署**：数据一旦有变动，机器人自动提交预烘焙数据后，**必须自动触发 Cloudflare Pages 编译部署（`gh workflow run deploy.yml`）**，形成无人值守的 100% 全自动上线闭环。任何人都不可禁用或降级此自动化链条。

---

## 7. 全站极速加载与全球/大陆双轨性能架构铁律 (Global Performance Spec)

1. **普通海外用户**：TMDB 图片直连官方 Anycast CDN，零代理延时，零服务器成本。
2. **受限国家与地区用户（CN 大陆、MM 缅甸、RU 俄罗斯、IR 伊朗、BY 白俄罗斯、KP 朝鲜、SY 叙利亚、CU 古巴、VE 委内瑞拉、VN 越南、ID 印尼、TM 土库曼斯坦等）**：通过 `/api/img-proxy` 接入自建 Cloudflare R2 (`img.ikanpp.com`) 持久化镜像，自动透写（Write-Through），实现受限网络环境下同域 CDN 高速秒开与 100% 防裂图。
3. **客户端双轨弹性自愈**：全域海报组件若直连遭遇局部网络封锁或丢包（`onError`），自动毫秒级静默切换为 `/api/img-proxy` R2 镜像重试，杜绝裂图与碎图。
4. **物理尺寸精准降维**：列表卡片必须严格限定为 `w185` (thumb) 或 `w342` (poster)，严禁直接拉取原图或未降维尺寸。
5. **恪守正片与图片隔离**：R2 仅用于持久缓存静态图片，严禁存储或转码任何正片视频。
6. **本地 0ms 体验**：全域海报通过 Service Worker 执行 Cache-First 0ms 读取。

详细性能规范与数据链路请参考：[global-performance-spec.md](file:///Users/zeyelvis/KVideo/docs/architecture/global-performance-spec.md)。
流媒体播放规范请参考：[dual-track-streaming-spec.md](file:///Users/zeyelvis/KVideo/docs/architecture/dual-track-streaming-spec.md)。

---

## 8. 全站四维全量自动化预热与演职员自愈铁律 (Automated Full-Site Prewarm & Cast Rail Spec)

全站影视更新与资产预热必须严格遵循四维全自动化闭环规范：
1. **四维预热全覆盖**：
   - **影人肖像**：自动扫描全站 7 大专区新片主创，增量同步 TMDB 官方肖像库；
   - **全站图片 R2 预热**：规范降维多尺寸（w342 卡片、w1280 巨幕）推送到亚太 R2；
   - **详情页三维资产**：详情主画幅大图（w780）与演职员肖像（w185）预先推送到 R2；
   - **边缘 CDN 缓存热加载**：全频道路由及核心影视详情页并发触发 HTML 与 RSC Prefetch 缓存生成，保障用户访问首字节响应（TTFB）维持在 30~50ms 秒开水平。
2. **全自动闭环频次与联动**：
   - 由 `.github/workflows/full-site-prewarm.yml` 每日固定 2 次自动巡检（北京时间 04:00 与 16:30）；
   - 在 `.github/workflows/sync-iyf-channels.yml` 同步完新片后**必须自动联动触发全量预热**，形成“新片更新 ➔ 自动部署 ➔ 全量预热”的无人值守闭环。
3. **演职员专栏自愈绝对规范**：
   - 演职员专栏必须使用 `<CastRail />` 客户端自愈组件；
   - 服务端主渲染链路恒为 0ms 纯内存匹配，缺失头像必须由客户端在后台异步拉取淡入；
   - **严禁在服务端主渲染路径中加设任何网络超时截断（如 Promise.race 350ms）**，彻底杜绝单字兜底或污染边缘 ISR 缓存。

---

## 9. 全站八层极速秒开与 0ms 感知架构铁律 (Full-Site 8-Layer Ultra-Fast Performance Spec)

全站（首页大厅、6 大频道大厅、详情页、影人页等所有页面）必须永久恪守“八层极速秒开”工程铁律，任何后续开发、组件重构或功能迭代严禁违反以下原则：

### 1. 彻底消灭空白 Spinner 铁律 (Zero Blank Spinner / SSR Skeleton First Paint)
- **绝对禁忌**：**严禁在首页或任何主要频道页（`/`, `/movie`, `/tv`, `/anime`, `/variety`, `/documentary`, `/ranking`）使用空白居中的 `<div className="brand-spinner" />` 作为 Suspense fallback！**
- **必须直出真实高保真骨架**：
  - 首页必须使用 `<HomePageSkeleton />`；
  - 6 大频道页必须使用 `<CategoryHubSkeleton />`；
  - 骨架必须直接利用预烘焙数据（`PREBAKED_HOME_DATA`）在服务端首字节 HTML 中直出：
    1. 真实 16:9 宽屏 Hero 背景大图；
    2. 真实片名与立即播放大按钮；
    3. 100% 对齐爱壹帆官方排版的 TrendingNav 频道专属速报标签栏；
    4. 具有 `contain-intrinsic-size` 锁高防抖的骨架货架横轨。
- **原生 `<img>` 零 JS 依赖启动**：
  - 骨架中的首屏背景大图必须使用原生 `<img>` 标签（严禁使用 Next/Image 以免受客户端 JS 运行时水合阻塞）；
  - 必须携带 `fetchPriority="high"`、`loading="eager"` 与 `decoding="sync"`；
  - 图片 URL 必须通过 `/api/img-proxy?url=...&w=1280` 直出，确保中国大陆与全球受限国家用户首屏直出 0ms 防裂图秒开。

### 2. 全站级 Speculation Rules 推测预渲染铁律
- 全站 `<head>` 必须且只能由 `app/layout.tsx` 注入统一的 Speculation Rules API：
  - 对 6 大核心频道（`/movie`, `/tv`, `/anime`, `/variety`, `/documentary`, `/ranking`）配置 `prerender`（`eagerness: 'moderate'`）；
  - 对影视详情页（`/title/*`）配置 `prefetch` / `prerender`；
  - 确保用户鼠标悬停或触碰链接的 200~300ms 间隙内，目标页面已在后台极速预渲染完成，点击路由切换体验恒为 **0ms 秒切（Instant Navigation）**。

### 3. 非首屏 DOM 视口渲染跳过铁律 (content-visibility: auto)
- 所有处于首屏视口下方的货架、瀑布流、长文本剧情梗概及演职员滑轨，必须使用 `.below-fold-rail` 或 `.below-fold-section` 工具类；
- 必须配合 `contain-intrinsic-size` 物理锁死占位高度，确保用户滚动平滑不跳动（CLS 恒为 0）；
- 强制浏览器在首屏阶段跳过屏下 DOM 的样式计算、布局排版与重绘渲染，首屏主线程 CPU 耗时立降 60%~70%。

### 4. 非首屏组件严格按需动态加载铁律 (Dynamic Imports)
- **侧边栏与弹窗**：`FavoritesSidebar`、`WatchHistorySidebar`、`ResumePlayBubble` 必须使用 `dynamic(..., { ssr: false })` 按需加载；
- **搜索交互模块**：`SearchResults`、`NoResults`、`SearchLoadingAnimation` 必须使用 `dynamic(..., { ssr: false })` 拆解；
- **非首屏货架**：`LiveChannelsPreview`、`CollectionsRail`、`PlatformFeaturesStrip`、`ExploreHubFooterBanner`、`PersonalizedForYouRail` 必须使用 `dynamic` 异步加载；
- **严禁将次级或偶发交互组件强行打入首屏主 Entry Bundle！**

### 5. 全站 Service Worker 全域智能预缓存
- Service Worker 在 `install` 阶段必须自动预缓存首页及 6 大频道大厅的页面 shell（`PRECACHE_URLS`）；
- 对全网海报与图片持久实行 Cache-First 0ms 读取；
- 二次访问与全站任意漫游实现 100% 内存/本地磁盘 0ms 瞬间打开。




