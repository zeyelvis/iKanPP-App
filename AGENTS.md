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
   - **最新上线雷达片库全覆盖**：全专区所有新入库影视（`PREBAKED_LATEST_TITLES`）必须 100% 纳入 R2 图片推流与边缘 CDN 预热，且在入库脚本阶段直接写入生产 Cloudflare KV 实体库与别名索引，杜绝新片冷启动骨架屏等待；
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

---

## 10. 实体反向索引防毒化自愈与详情页 SEO 301 永久重定向铁律 (Anti-Poisoning & Canonical Redirect Spec)

全站影视详情页与搜索中枢必须永久恪守以下防毒化与流量保真规范，彻底杜绝搜索引擎流量与站内搜索推荐“张冠李戴”：
1. **反向索引强一致核验与物理自愈（On-Access Auto-Purge）**：
   - 任何从 `getEntityByTmdb(type, id)` 取出的实体，必须强一致核验其内部的 `tmdbId` 与 `tmdbType`；
   - 一旦发现属性不符或虚空实体，立即在后台就地执行 `kvDelete` 物理抹除该毒化反向索引键并返回 `null`，绝不向客户端下发错误条目。
2. **片名语义重叠门槛防线（Title Overlap Guard）**：
   - TMDB 搜索命中与反向缓存复用前，必须通过 `hasTitleOverlap` 严格比对条目名称，标题完全无交集者坚决丢弃缓存并重新拉取官方最新精准详情。
3. **详情页路由解析 ID 优先与权威别名路由**：
   - `/title/[slug]` 解析必须遵循：显式别名映射（`slug:*`）最高优先 ➔ 实体 ID（`ik\d{6}`）物理主键优先 ➔ 纯中文标题检索 ➔ TMDB 在线冷门自愈。
   - 严禁跳过 ID 拿 URL 尾部的英文短词反查同名其他剧集（如误把 `the-bill` 查成英剧）。
4. **SEO 规范 URL 301/308 永久重定向**：
   - 任何历史非规范 URL（包括旧版别名、纯 ID、历史带连字符 URL），一旦解析出正确实体且当前 slug 与规范 `canonicalSlug` 不一致，必须 100% 触发 301/308 永久重定向，将搜索引擎与外链权重全量转移到标准规范 URL。
5. **候选证据评分与长期去重铁律 (Entity Resolver & Dedupe Spec)**：
   - **外部权威 ID 绝对优先**：TMDB(type, id) 与豆瓣 ID 一致者判定为同一实体（`decision: same`，置信度 1.0）；
   - **多维证据加权评分**：当无权威外部 ID 时，统一由 `lib/server/entity-resolver.ts` 计算复合证据分（标题 35% + 原名 20% + 年代 15% + 导演 15% + 主演 10% + 片长 5%）。综合评分 $\ge 0.88$ 判为 `same`，$\le 0.55$ 判为 `different`，中间状态进入 `review` 隔离队列；严禁单纯按同名和年份差 $\le 1$ 盲目强行合并不同影视作品；
   - **确定性 Winner 选举与幂等性**：依据规范 5.2 节的 6 级确定性规则（外链权威度 ➔ 外部 ID 完整度 ➔ 内容字段丰富度 ➔ 早期稳定 ID ➔ 字典序平局保底）选出 winner，确保去重作业 100% 幂等；
   - **四阶段安全去重闭环**：历史重复条目治理必须经由 `scripts/seo/dedupe-backfill.mjs` 依次执行 `scan` 扫描 ➔ `plan` 规划 ➔ `apply` 确认应用 ➔ `verify` 验证闭环，生成单跳 308 重定向，杜绝循环跳转与误删。

---

## 11. SEO Mission Control 管理后台与 Zero Trust 双层隔离铁律 (Admin & Zero Trust Spec)

iKanPP 全域影视实体管理与自动化促抓监控中心 (`/admin`) 必须永久恪守以下安全与架构基线：
1. **Zero Trust 邮箱 OTP 与应用层双重鉴权防线**：
   - **第一道防线**：由 Cloudflare Access Zero Trust 在网络层拦截所有 `/admin/*` 访问，仅允许白名单邮箱通过邮箱 OTP 登录，从网络层面彻底杜绝后台被黑客扫描或弱密码爆破风险；
   - **第二道防线**：所有 `/api/admin/*` 接口必须经由 `verifyCloudflareAccess` / `requireAdminAuth` 进行 Web Crypto RS256 JWKS 公钥验签、`aud` 标签比对与邮箱白名单核验，未通过者坚决返回 401/403 阻断。
2. **主站零污染与前台绝对静默**：
   - `app/robots.ts` 必须显式声明 `Disallow: /admin`，禁止任何搜索引擎爬虫索引后台；
   - 全站级 Speculation Rules API 必须通过 `{ not: { href_matches: '/admin*' } }` 排除后台页面，严禁客户端推测预渲染；
   - 主站前台组件（`Footer`、`MobileBottomNav`、`BackToTop`）必须在 `/admin` 下彻底静默不渲染，保证后台页面的纯净独立。
3. **双轨绝对隔离铁律恪守**：
   - 管理后台仅服务于轨道 A（iKanPP 主站公网影视），**严禁触碰、管理或混合轨道 B（iKanX 午夜特区）的任何数据与代理路由**。
4. **Google Indexing API 配额安全硬锁**：
   - 严格遵循 Google 单日 200 URLs 默认调用上限，系统在消耗达到 180 条时强制开启安全熔断硬锁，API 与前端界面同步拦截，杜绝超频违规。
5. **全流程操作审计留痕 (Audit Trail)**：
   - 所有实体修改、下架删除、批量促抓推送与 GitHub Actions 调度，必须自动写入 Cloudflare KV (`admin:audit-log:*`) 并保留 90 天，实现全流程透明可追溯。

---

## 12. 华语流媒体主站内容安全与非华语/日文假名绝对阻断铁律 (Strict Chinese Content Safety Spec)

iKanPP 作为面向全球华人的高品质流媒体平台，主站（轨道 A）全域前台展示（包括首页大厅、各专区 Hub、「最新上线 · 实时收录」横轨）及 SEO 实体数据库必须永久恪守以下最高内容安全准则，**严禁任何后续开发、自动化脚本或 AI 助手降低门槛或擅自放行**：

### 1. 日文假名绝对零容忍（无论是否包含汉字）
- **核心判定**：凡是片名包含任何日文平假名或片假名字符（`[\u3040-\u309f\u30a0-\u30ff]`），**无论其夹带多少个汉字（哪怕包含 10 个汉字，如《ど根性物語 銭の踊り》、《悪魔からの勲章》等），一律判定为日文条目，100% 坚决物理阻断与剔除**！
- **严禁使用**：严禁采用类似 `test(kana) && !test(chinese)` 的漏洞逻辑。日文大量汉字绝不能作为放行日文假名片名的借口。

### 2. 纯外文无中文条目绝对零容忍
- **中文底线**：所有入库与前台展示的影视作品必须且只能包含合法的中文汉字（`[\u4e00-\u9fa5]`）。
- **外语过滤**：TMDB、采集站爬取的未本地化、无官方正规中文译名的纯英文、德文、西班牙文、印地文、他加禄语等海外冷门条目（如《Bourek》、《Die Chefin》、《Unser Charly》等），**100% 严禁写入 KV 实体库与 `recent:*` 横轨**。

### 3. 韩文字符绝对零容忍
- 任何韩剧、韩影必须具备正规规范的中文翻译名称，韩文字母（`[\uac00-\ud7af]`）一律坚决拦截。

### 4. 低俗与成人违禁词一票否决
- 严格执行 `ADULT_BLACKLIST_WORDS` 敏感词黑名单，地下色情录像、成人番号、露骨低俗条目一律直接物理抹除。

### 5. 二手短视频与解说类搬运条目绝对零容忍 (No Commentary or Short Snippets)
- **正片底线**：iKanPP 唯一定位为高端 4K 完整影视正片流媒体，严禁任何短视频营销号二次搬运的“电影解说”、“影视解说”、“一口气看完”、“几分钟看懂”、“速看”、“先导片”、“精彩片段”、“纯享版”等非正片条目渗透片库。
- **一票否决**：严格执行 `COMMENTARY_BLACKLIST_WORDS`，统一在 `lib/data/entities/entity-utils.ts` 的 `isCleanChineseTitle` 中执行一票否决。无论在采集源端（`ingest-entity-catalog.mjs`）、增量雷达（`sync-first-release-radar.mjs`、`sync-release-radar.mjs`）、多维检索接口（`app/api/library/browse`）、还是底层存储（`saveEntity`），只要标题或分类命中解说特征，一律坚决物理阻断与丢弃！

### 6. 六重立体防线协同闭环（永不复发钢铁长城）
- **底层算法基线**：统一调用 `lib/data/entities/entity-utils.ts` 中的 `isCleanChineseTitle`；
- **底层存储终极硬锁**：`lib/services/entity-kv.ts` 中的 `saveEntity` 入口强制执行 `if (!isCleanChineseTitle(entity.title)) return;` 物理拦截，任何未汉化、假名、解说类或违规条目底层直接拒收，绝不写入 `index:all`；

- **影人履历彻底脱钩**：`lib/services/entity-enrichment.ts` 中的 `searchAndEnrichPersonCredits` 仅关联本站已收录的影视，**严禁盲目为 TMDB 外部履历分配新实体 ID 并调用 saveEntity**，彻底消除爬虫递归造片漏洞；
- **采集源头门禁**：`scripts/ingest-entity-catalog.mjs`、`app/api/seo/entity-pipeline/route.ts` 与 `app/api/seo/tmdb-changes/route.ts` 必须在前置循环中强制校验 `isCleanChineseTitle`；
- **KV 存储自愈**：`lib/services/entity-kv.ts` 中的 `isSafeRecentTitleItem` 严密把关 `recent:*` 的写入与下发；
- **自动化免疫巡检引擎**：常驻运行 `scripts/sanitize-ghost-entities.mjs`，定期扫描并原子修剪可能渗透的异常空键与死链，守护全局主索引 100% 纯净。

---

## 13. 全站新片雷达与详情页 0ms 零 404 闭环铁律 (Zero-404 Full-Lifecycle Spec)

iKanPP 全域流媒体影视分发中枢必须永久恪守“前台展示即必达、零死链、零 404”的全生命周期工程铁律，任何后续开发、组件重构或自动化巡检脚本严禁违反以下原则：

### 1. 前台展示与详情页 100% 绝对打通（No Isolated Showcase）
- **铁律原则**：凡是在首页大厅「最新上线 · 实时收录」或 6 大频道专区大厅预烘焙数据集（`PREBAKED_LATEST_TITLES`）及生产 KV `recent:*` 中出现的卡片，影视详情页服务端路由（`app/title/[slug]/page.tsx`）的 `resolveEntityRaw` **必须具备最高优先级的预烘焙直连匹配能力（优先级 1.5）**。
- **杜绝断层**：严禁出现“首页展示了精美卡片、用户点进去却提示 404”的架构断层。只要首页或频道大厅能看到，详情页必须 100% 能即刻加载并拉起播放。

### 2. 多地译名简繁与音译多级退避防线（Traditional & Transliteration Fallback）
- **核心痛点**：海外剧集（美剧、日剧、韩剧、动漫）在 TMDB 官方数据库中，社区往往优先录入港台繁体译名（如《怪物：麗茲波頓的故事》）或不同音译汉字（如“莉齐·博登” vs “丽兹·波顿”）。
- **双重贯通**：
  1. **构建与离线采集层**（`scripts/sync-release-radar.mjs`）：在每小时同步最新片单时，必须内置 `generateSearchQueries` 与 `toTraditional` 简繁互转，优先捕获 TMDB 官方 4K 原版物料与 TMDB ID；
  2. **线上运行时自愈层**（`lib/services/entity-enrichment.ts`）：在 `searchAndEnrichFromTMDB` 中，当第一轮简体搜索无结果时，必须自动启动繁体版与主副标题拆解多级并发退避检索，精准唤醒 TMDB 官方条目；
  3. **严禁单次搜索未命中即放弃**，彻底根治多地译名差异导致的自愈失效。

### 3. URL 规范重定向严格校验防线（No Undefined Slug）
- 详情页在执行 301/308 SEO 规范重定向时，**必须且只能在 `effectiveEntityId && /^ik\d{6}$/i.test(effectiveEntityId)` 严格成立时方可执行**。
- 坚决杜绝因实体 ID 字段不一致或缺失而拼接出 `/title/undefined-...` 的非法 URL，从源头消灭伪重定向引发的二次 404。

### 4. Canonical URL 生成端绝对纯净铁律（No Percent Mangling）
- **真实片名优先**：全站通用 URL 生成器 `getTitleCanonicalHref(item)` 必须永远优先以真实中文片名（`item.title || item.name`）为第一基准生成标准 URL；
- **防撕裂绝对红线**：严禁将未经 `decodeURIComponent` 的百分号编码串（如 `%E9%98%...`）直接传入 `generateSlug`。`generateSlug` 会将 `%` 作为非英数字符过滤并替换为连字符 `-`，导致 URL 被破坏性撕裂为十六进制碎片（如 `/title/e9-98-bf-e6-b3-a2-e7-bd-97-e9-99-b7-e8-90-bd`）从而直接引发全网 404；对任何输入的外部 slug 必须先通过 `decodeURIComponent` 安全解码；
- **防伪 ID 污染门禁**：仅在条目拥有合法的标准 6 位实体 ID（`/^ik\d{6}$/i.test(rawId)`）时才输出带 ID 的规范 URL（`/title/ik000123-片名`）。对于未分配标准 ID 的雷达新片（临时内部 ID 如 `ik_radar_...` 或 `ik_pre_...`），必须输出规范中文 URL `/title/片名`，严禁将临时内部 ID 拼入对外 URL 或进行伪 308 重定向。

### 5. 详情页预烘焙匹配三维防线与历史受损死链 100% 自动自愈（Three-Dimensional Matching & Hex Self-Healing）
- **双向自愈防线**：在 `app/title/[slug]/page.tsx` 的优先级 1.5 匹配引擎中，必须具备对连字符十六进制碎片（`/[0-9a-f]{2}-[0-9a-f]{2}-[0-9a-f]{2}/i`）的自动识别与双向反解；
- **存量死链零容忍**：任何因历史代码缺陷、用户浏览器缓存或搜索引擎抓取产生的撕裂死链，进入详情页必须 100% 瞬间命中对应影片，直出内容并由服务端 `permanentRedirect`（HTTP 308）重定向至规范中文 URL，实现存量死链 100% 自动治愈，0 个 404；
- **服务端重定向协议**：规范重定向必须使用 `permanentRedirect`（HTTP 308），禁止使用默认 307 的客户端软跳转。

### 6. 数据入库与预烘焙源头纯净中文铁律（Clean Data Ingestion）
- **入库规范**：所有离线与增量同步脚本（如 `sync-latest-titles.mjs`、`sync-release-radar.mjs` 等）中的 `simpleSlug`，严禁执行 `encodeURIComponent`，必须直接输出纯净中文 slug；全站预烘焙数据集（`PREBAKED_LATEST_TITLES`）中的 `slug` 字段必须与真实片名保持语义一致，从数据生产源头杜绝污染。

### 7. 变更自动化全量回归测试铁律（Automated Regression Gate）
- 凡涉及 `getTitleCanonicalHref`、`generateSlug`、`parseEntitySlug` 或详情页匹配逻辑的修改，必须运行 `npx tsx scripts/test-latest-titles-404.mjs`，断言全专区全部影片 100% 命中、历史受损死链 100% 自愈、0 个 404 后方可提交部署。

---

## 14. 全屏硬件直通覆盖层与零 3D Transform 渲染铁律 (Hardware Overlay & Native Fullscreen Spec)

iKanPP 全域视频播放器（包含桌面端、移动端、网页全屏与系统原生全屏）必须永久恪守以下显卡硬件覆盖层与全屏渲染基线，**严禁任何后续开发、代码重构或 AI 助手引入任何违规黑客代码**：

### 1. 全屏 `<video>` 绝对禁止 3D Transform (No 3D Transforms on Video)
- **绝对禁忌**：**严禁向 `<video>` 元素或其直接容器注入任何 `transform: translateZ(...)`、`scale(...)`、`will-change: transform` 或任何 3D 矩阵形变代码！**
- **底层硬件原理**：现代操作系统与显卡驱动（macOS CoreAnimation、Windows DirectComposition）在浏览器进入系统原生全屏（Native Fullscreen）时，为了实现 4K 60fps 零拷贝渲染并降低能耗，会自动将 `<video>` 提拔到操作系统顶层的**显卡硬件独占直通覆盖层（Hardware Overlay Plane）**。一旦施加任何 3D Transform，GPU Compositor 被迫在全屏切换瞬间创建带有三维变换矩阵的离屏帧缓冲区（FBO），直接触发 Surface Swap 上下文丢失死锁，导致**“独立线程音频正常播放、视频画面彻底黑屏”**。
- **正规规范**：
  1. `<video>` 的行内样式必须恒为 `transform: 'none', WebkitTransform: 'none'`；
  2. 全屏事件监听中（`useFullscreenControls.ts`），严禁执行任何 `scale(1.00001)` 等抖动黑客代码，进入和退出全屏时必须且只能安全重置 `v.style.transform = ''`；
  3. `video-player.css` 中所有全屏选择器（`:fullscreen video`, `:-webkit-full-screen video`, `.is-native-fullscreen video`）必须恒定声明 `transform: none !important; -webkit-transform: none !important; will-change: auto !important;`。

### 2. 全屏状态下绝对禁止 `backdrop-filter` 显存回读死锁与全域组件清零
- **核心判定**：全屏硬件加速覆盖层（Hardware Overlay Plane）在安全沙箱和性能保护下，严禁上层 DOM 元素对正在硬件解码的显存进行反向像素回读（GPU Back-buffer Readback），一旦检测到任何 backdrop 滤镜，显卡驱动将直接触发保护性 Surface Detach，导致“声音正常、画面全黑”。
- **防线规范**：
  1. **CSS 选择器与伪元素绝对禁止逗号合写 (No Comma-Separated Vendor Pseudo-Classes/Elements)**：W3C 规范规定选择器列表中若存在浏览器未识别的前缀伪类或伪元素，整组规则会被整块作废！`video-player.css` 中 `:fullscreen *`、`:-webkit-full-screen *`、`.kvideo-container.is-native-fullscreen *` 以及 `::backdrop` / `::-webkit-backdrop` **必须拆分为各自完全独立的 CSS 规则块**，强制将内部子元素的 `backdrop-filter` 降级为 `none !important`；
  2. **播放器全域浮层组件地毯式物理剥离 (Full-Domain DOM Backdrop Removal)**：播放器容器内可能挂载的所有子组件必须从 JSX 源代码级别彻底剔除 `backdrop-blur-*` 与行内 `backdropFilter`，统一使用高级暗夜深色底色（如 `bg-[#141416]/95` 或 `rgba(18, 18, 22, 0.95)`）：
     - `DesktopOverlay.tsx`（全屏时钟、快进快退指示器、播放暂停按钮、Toast 提示）
     - `DesktopSpeedMenu.tsx`（右上角倍速选择浮窗与按钮）
     - `DesktopMoreMenu.tsx`（左上角更多设置主面板与画质/比例/按键子菜单）
     - `InPlayerEpisodesDrawer.tsx`（右侧全屏快速选集抽屉及半透明遮罩）
     - `InPlayerSourceDrawer.tsx`（右侧全屏换源专线抽屉及半透明遮罩）
     - `NextEpisodeOverlay.tsx`（倒计时自动下一集悬浮卡片）
     - `KeyboardShortcutsModal.tsx`（快捷键指南弹窗及遮罩）
     - `ShareCardModal.tsx`（海报分享弹窗及遮罩）
     - `PlayerBrandLogo.tsx`（午夜消融台标：必须使用高级暗夜纯色径向渐变遮盖原站水印，严禁注入 `backdropFilter` 行内样式）
     - `app/styles/video-player.css`（`.spinner-glass` 旋转加载指示器与 `.loading-overlay-glass`）
  3. **全屏容器透明直通铁律 (Transparent Fullscreen Container)**：
     - 全屏容器 `.kvideo-container:fullscreen`、`:-webkit-full-screen` 及 `.is-native-fullscreen` **必须恒为 `background: transparent !important; background-color: transparent !important;`**；
     - 严禁在全屏容器上设置不透明纯黑背景（`background: #000`），否则显卡 Compositor 会触发 Occlusion Culling（遮挡剔除）误判视频被遮挡而停止渲染，导致黑屏有声音；
     - 全屏黑底 100% 委托给浏览器底层的伪元素 `::backdrop` 呈现，确保硬件直通层（Hardware Overlay Plane）绝对透光可见；
  4. **全屏状态切换零重排 GPU 唤醒机制 (Zero-Reflow Compositor Wakeup)**：
     - 在 `useFullscreenControls.ts` 及任何全屏监听逻辑中，**严禁执行 `void v.offsetHeight;` 或读取任何几何布局属性**，杜绝显卡在申请与切换 Hardware Overlay Plane 的毫秒级窗口期被强制重排死锁；
     - 统一采用 W3C 原生 `video.requestVideoFrameCallback()` 与 `requestAnimationFrame` 微调 `opacity: 0.999 -> 1`，纯 Compositor 线程标记脏图层，解决 macOS Space 动画后 Framebuffer 挂起未 SwapBuffers 的问题；
  5. **自动化门禁全域覆盖永久守护**：由 `scripts/test-architecture-integrity.mjs` 在代码提交与 CI 构建中自动扫描上述所有播放器组件、全屏容器透明度、CSS 伪类块及全屏 Hook，任何类名或属性违规立即强制阻断发布。


---

## 15. 全站前台展示影视 100% 深度预热与详情页 0ms 秒开铁律 (Full-Site Display Titles Prewarm & 0ms Detail Instant Spec)

iKanPP 全域流媒体详情页与片库分发中枢必须永久恪守“展示即必达、点击即秒开、零等待”的工程铁律，任何后续开发、组件重构或自动化巡检脚本严禁违反以下原则：

### 1. 服务端 0ms 内存直出守护网铁律 (Zero TMDB Sync Blocking on Main Render)
- **绝对禁忌**：**严禁在影视详情页服务端主渲染路径（`resolveEntityRaw`）中，为了获取未预热影视的元数据而同步阻塞等待海外第三方 API（如 TMDB 串行调用 3~5 次耗时 3~6 秒）！**
- **必须 0ms 内存直出**：
  1. 凡是出现在全站前台 7 大专区（全站大厅、电影、电视剧、动漫、综艺、纪录片、短剧）的任何 Hero 通栏巨幕、热播速报或分类货架影视（`PREBAKED_HOME_DATA` 与 `PREBAKED_LATEST_TITLES`），在 KV 未命中时，**必须且只能在 0ms 内瞬间由内存预置数据提取标题、4K 海报、全景剧照、年份、类型、集数、评分与简介，组装为规范的 `TitleEntity` 先行直出首屏**；
  2. 演职员深度肖像、多语言译名与真实 TMDB ID 必须且只能转入后台非阻塞异步任务进行自愈并持久化写回 KV，彻底消灭前端骨架屏/转圈等待。

### 2. 生产 Cloudflare KV 实体与反向索引批量自动就位铁律 (Automated KV Bulk Ingestion)
- **核心规范**：
  1. 自动化全站预热脚本（`scripts/full-site-prewarm.ts`）在汇总全站 7 大专区前台影视后，**必须自动调用 Cloudflare KV `/bulk` API 批量并发写入生产环境**；
  2. 必须且只能 100% 强一致就位四大核心键：
     - `entity:${entityId}`：完整的影视实体 JSON 字符串；
     - `slug:${canonicalSlug}`：标准权威规范别名反查索引；
     - `slug:${rawSlug}`：原生别名反查索引；
     - `title:${normalizedTitle}`：中文纯净标题倒排索引；
  3. 确保用户点击前台任何卡片时，直接命中生产 KV，首字节响应（TTFB）维持在 20ms ~ 40ms 极速水准。

### 3. 三维静态资产 R2 持久化与 Edge CDN 预热闭环 (R2 Ingestion & Edge Prefetch)
- **资产推流**：前台所有条目的 `w342`（卡片海报）、`w1280`（全景巨幕）、`w780`（详情页主画幅大图）和 `w185`（演职员肖像）必须预先推流至亚太自建 R2（`img.ikanpp.com`），确保中国大陆及全球受限网络环境下同域 0 延迟秒开与 100% 防裂图；
- **边缘预取**：每次全站预热必须并发触发核心频道路由与前台影视详情页的 Edge CDN 预取（`Accept: text/html` 与 `RSC: 1`），让全球 Anycast 边缘节点提前就绪缓存；
---

## 16. 新片首发窗口期全自动 SEO/GEO 闪电引流与程序化白帽铁律 (New Release Programmatic SEO & GEO Syndication Spec)

iKanPP 全域流媒体平台在应对院线新片、热播剧集与新番动漫首发上线窗口期时，必须永久恪守以下全自动引流与白帽合规工程底线，严禁任何后续开发降级或违反：

### 1. 100% 恪守 2026 程序化白帽合规底线 (Strict White-Hat Compliance)
- **绝对禁忌**：**严禁使用任何黑帽 SEO 手段（包括但不限于：`display: none` / `font-size: 0` 隐藏堆砌关键词、障眼法欺诈重定向 Cloaking、虚假评分或虚假演员伪造）！**
- **自然融入准则**：所有衍生关键词、网盘截流意图词与播放规格，必须作为正常语法自然融入页面的 Meta 标签、FAQ 展开项或底部探索 Chips，真实用户清晰可见；
- **真实满足意图**：针对搜寻“网盘/下载”的用户，页面在 Meta Description 中说明“*寻找《xxx》网盘资源？无需繁琐转存解压与限速等待，iKanPP 支持 4K 超清 0ms 免VIP在线秒播*”，并在同页面直接提供秒级起播的真实播放入口，彻底满足用户终极观影需求，大幅提升停留时间（Dwell Time）。

### 2. 全光谱 6 大意图长尾矩阵自动裂变机制 (Full-Spectrum 6-Family Intent Matrix)
- 详情页必须统一通过 `lib/utils/seo-keyword-generator.ts`（`generateFullSpectrumKeywords`）自动裂变包含 YAML 规范定义的 6 大意图修饰词家族（`GENERIC_MODIFIERS`）的 48 组精准长尾词：
  1. **观影意图**（`watch_intent`：在线观看、在线播放、在线看、在线观影）；
  2. **免费意图**（`free_intent`：免费观看、免费在线观看，配合 `isAccessibleForFree: true` 实体标记）；
  3. **画质规格**（`quality`：高清、HD、1080P、4K、4K超清原画、中文字幕）；
  4. **完结度与连载状态**（`completion` & `freshness`：完整版、全集、大结局、最新一集、更新至第X集、未删减版）；
  5. **信息与决策**（`information`：剧情、剧情介绍、简介、演员表、导演、上映时间、豆瓣真实评分、结局解析、片尾彩蛋）；
  6. **口碑推荐与问答意图**（`recommendation`：推荐、排行榜、好看吗、值得看吗）；
  7. **核心截流与容错**：网盘/下载截流词（百度网盘、迅雷下载、夸克云盘、磁力链接）与拼音/同音错字容错词（如“生活危机” ➔ “生化危机”）；
  8. **媒体类型自适应**：动漫、综艺、纪录片自动将通用模板标签自适应为专属媒体类型（如自动生成“动漫”而非“电视剧”）。

### 3. GEO 生成式 AI 搜索实体图谱深度对齐 (AI Search & GEO Grounding)
- **机器可读 Schema 深度增强**：
  1. 必须在 JSON-LD 中声明 `isAccessibleForFree: true` 与 `inLanguage: 'zh-CN'`，明确告知各大大模型本站内容公开免费无门槛；
  2. 凡具备有效 `tmdbId` 的影视，必须在 `sameAs` 数组中挂载官方权威实体链接（`https://www.themoviedb.org/...`），在向量空间中与官方知识图谱 100% 强绑定；
  3. FAQPage 中必须内置免客户端、免网盘直接网页看的权威事实直答，让 ChatGPT Search、Perplexity、Google Gemini 在回答用户时优先打上 iKanPP 引用角标。

### 4. 自动化即时多引擎闪电广播流水线 (Instant Search Syndication Pipeline)
- 每次构建部署完成后（`.github/workflows/deploy.yml`）或新片增量入库后，必须全自动并发触发两大广播链路：
  1. **Google Indexing API 闪电广播**：通过 `scripts/push-google-indexing.mjs`，根据 Priority A 级策略将最新上线影视的规范 URL 提交至 Google Indexing API，触发 Googlebot 在 5~15 分钟内入站抓取，抢占首发搜索红利；单日推送严格控制在 30~50 条以内以防超额；
  2. **IndexNow 即时全网广播**：通过 `scripts/push-indexnow.mjs` 将全量 URL 广播给 Bing 与 Yandex，实现 1 小时内直通 OpenAI ChatGPT 联网搜索候选池。

### 5. 动态相关探索内链网络 (Dynamic Internal Linking Mesh)
- 详情页底部的 `<RelatedSearchChips />` 严禁使用纯死板静态词，必须结合当前影片的题材、年份、6 大意图与跨维度 Discovery 探索词（如 `2026热门动作电影`、`动作电影排行榜`），动态裂变专属长尾探索内链，打破孤岛效应，使新片与全站内容形成高密度互联互通。

### 6. 机器可读 YAML 全景规范与白帽索引门槛 (YAML Specification & Indexation Guardrails)
- **基线规范**：全站 SEO 体系永久以 `docs/architecture/ikanpp_seo_keyword_system.yaml` 及 `lib/data/seo-rules/seo-keyword-system.ts` 为唯一权威规则库；
- **白帽索引门槛 (`isEntityIndexable`)**：必须严密核验条目健康度，对缺失核心信息或非正常入库的空壳条目，强制输出 `robots: { index: false, follow: false }`，坚决杜绝薄弱内容（Thin Content）拉低整站域名信任度。

### 7. 存量已收录页面零破坏平滑继承与长尾词扩容铁律 (Zero-Disruption Legacy Page Continuity)
---

## 16. 全域新片电影与剧集防串台/防母题吞噬物理隔离铁律 (Anti-Cross-Series & Subtitle Specificity Spec)

全域影视播放器调度与骨干源探测中枢（包含 `/player`、`/api/title-episodes`、`/api/detail` 及客户端仲裁引擎）必须永久恪守以下影视类型物理隔离与防母题吞噬基线，**彻底根除院线新片因模糊匹配误播同名剧集的底层隐患，严禁任何后续开发降级门槛**：

### 1. 通用片名去粘连年份归一化防线 (Trailing Year Detachment)
- **底层原理**：各大采集站（光速、极速、暴风等）上架院线新片（TC/抢先版/HD）时，常将片名标记为 `${片名}${4位年份}`（如《生化危机：爆发夜2026》）；
- **铁律要求**：全站所有标题分析（`analyzeTitle`、`normalizeTitleClean`）必须通过 `/(19\d\d|20\d\d)$/g` 自动剥离片尾粘连的 4 位年份数字，恢复纯净官方片名，确保在第一步比对中直接达成 `pureTitle === targetPureTitle` 的 100% 精确匹配，杜绝退化为模糊匹配。

### 2. 特异性副标题双向锁死防线 (Subtitle Specificity Guard / Anti-Parent-Swallowing)
- **绝对禁忌**：**严禁仅因 `target.includes(cand)` 就赋予高置信度匹配分！** 带有特异副标题的长子题（如《生化危机：爆发夜》）天然包含了母题短词（《生化危机》），直接放行会导致只有 4 个字的母题连续剧冒充 7 个字的新片；
- **铁律要求**：
  1. 当目标包含特异副标题时，候选片名必须同样包含该特异副标题（如候选必须包含“爆发夜”）；
  2. 纯片名互相包含时，若候选缺失特异词且字数差距超过 1 个字，必须判定为不匹配并重扣 300 分，坚决消灭短母题吞噬长子题。

### 3. 全链路影视类型硬核门禁 (Full-Chain Movie vs TV Physical Isolation)
- **四节点贯通**：从详情页跳转（`type=movie`）、探测 API（`targetType === 'movie'`）、秒播仲裁（`isTypeMismatched`）到备用线路发现（`discoveredSources`），必须全量透传并校验媒体类型；
- **铁律要求**：当期待为 `movie`（电影）时，凡带有“连续剧 / 欧美剧 / 日韩剧 / 电视剧 / 动漫”类型或集数大于 2 的条目，坚决一票否决（扣 800 分并物理剔除）；严禁将单集电影与多集电视剧放在同一池中比集数。

### 4. 播放器运行时脱靶自愈纠偏 (Runtime Misdirection Auto-Heal)
- **终端守护**：播放器内置运行时异常脱靶检测守护，一旦视频详情加载后发现“期待电影但实际为剧集且片名缺失目标特异副标题”，播放器必须在 100ms 内静默拉黑该脱靶线路，并基于片名与类型全自动重新秒播仲裁切回真正的正片电影，实现用户端零感知自愈。

---

## 17. 全网首发先锋雷达与四大排序双轨智能融合置顶铁律 (First-Release Priority & Hybrid Ranking Spec)

iKanPP 全域流媒体片单调度中枢必须永久恪守超越爱壹帆的独立自主抢跑架构，**彻底破除对爱壹帆更新节奏的单向依赖，严禁任何后续开发降级或回退为单一镜像模式**：

### 1. 独立自主战略定位与双轨融合铁律
- **战略定位**：**“爱壹帆 4.3 万部高分精品库做底座，自研首发先锋雷达做尖刀开路”**；
- **破除真空期**：针对爱壹帆坚守“非正式数字发行不收录”导致的 2 周至 2 个月院线空白期，iKanPP 必须以分钟级速度抢先收录院线首发抢先版/TC版，并在四大排序中强力置顶，霸占自然搜索爆发最高峰。

### 2. 首发雷达自动嗅探与 TMDB 4K 建档铁律 (`scripts/sync-first-release-radar.mjs`)
- **多源轮询**：每小时自动扫描光速资源、极速资源、暴风资源等骨干源站；
- **安全过滤**：严格执行准则 12 内容安全，日文假名、韩文、全角波浪号 `～` 与成人低俗违规词 100% 物理拦截；
- **TMDB 4K 官方资产自愈**：必须自动拉取官方 4K 宽屏剧照 (`w1280`)、高清竖版海报 (`w500`)、剧情简介、评分与演职员，并自动分配 `ikXXXXXX` 实体 ID 写入全局索引。

### 3. 四大排序双轨智能置顶铁律 (`scripts/sync-iyf-four-rankings.mjs`)
- 在构建 `index:time_added:*`（添加时间）与 `index:time_updated:*`（更新时间）时，**强制将首发先锋片单置顶在 Top 1~30 席**；
- 后面通过去重顺延爱壹帆精品片单，确保先锋爆款永远插队在大厅第一行第一位。

### 4. 画质全自动无缝晋升与 SEO 权重 0 损耗 (Quality Auto-Upgrade)
- **院线期**：标记「抢先版/TC」，切片接入公网 TC 源；
- **流媒体期**：1~2 个月后高清原盘流出，后台自动换源为 4K/1080P，角标自动晋升为「4K超清」；
- **SEO 权重永久沉淀**：页面规范 URL 恒定不变，院线首发期积累的 Google 自然搜索排名、外链和用户播放历史 100% 永久保留。

### 5. 全流程 100% 无人值守自动化
- 挂载于 `.github/workflows/sync-iyf-channels.yml`，**每小时整点全自动巡检（`0 * * * *`）**，自动触发“全网嗅探 ➔ 4K建档 ➔ 物理置顶 ➔ IndexNow 增量广播”闭环。

---

## 18. 全站大厅流媒体一体化视觉基线与缺额自愈铁律 (Streaming Hero Hub & Auto-Replenish Spec)

全站大厅（包含 `/`, `/movie`, `/tv`, `/anime`, `/variety`, `/documentary`）必须永久恪守以下流媒体前沿视觉基线与单页网格健壮性工程规范：

### 1. 详情页同款一体化深色底座与高级排版 (Netflix-Grade Unified Surface)
- **绝对禁忌**：严禁采用粗糙简陋的独立白色浮岛卡片或缺乏呼吸感的紧绷网格；
- **视觉标准**：
  1. 卡片必须使用与详情页同源的深色一体化底座（`bg-[#141416]/90 border border-white/5`），悬停时呈现霓虹微光呼吸边框；
  2. 竖版海报比例必须严格锁定为标准的黄金 `aspect-[2/3]`，图片圆角与卡片顶部严丝合缝；
  3. 卡片正下方必须清晰呈现两行排版：
     - 第一行：纯白粗体主标题（`font-semibold text-white truncate`），支持 2 行自动截断防撑爆；
     - 第二行：高品质次级元数据行（`text-xs text-white/50`），格式统一为：`${年份} · ${类型}`（如 `2026 · 恐怖`、`2026 · 动作 / 科幻`）；
  4. **Netflix 悬停居中微动效**：鼠标悬停在卡片海报上方时，海报适度缩放（`scale-105`），海报正中央平滑淡入半透明高光播放徽标（Play Icon），带来极其强烈的沉浸式观影冲动。

### 2. 黄金对称 6 列网格与整行整除铁律 (Symmetric 6-Column Grid)
- **排版铁律**：桌面端网格必须且只能采用标准黄金 6 列对称布局（`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6`）；
- **单页容量**：单页拉取数量恒定限定为 **24 部**（严格满足 $24 = 6 \times 4$ 整整 4 行饱满陈列），严禁 18、20、25 等无法整除 6 的非标数值。

### 3. 缺额自愈填补流水线 (Auto-Replenish Guardrail)
- **底层自愈**：在 `lib/services/entity-kv.ts` 与大厅 API 中，统一挂载 `Auto-Replenish` 缺额自愈游标引擎；
- **防线要求**：无论遇到任何历史下架条目、空键或已清理的幽灵 ID，系统必须自动向后滑动游标连续补位，**确保下发给前端的条目数量恒定满 24 部**，彻底消灭末行留白或缺卡现象。

### 4. 真实全量片库总数基线 (Authentic Total Metric)
- 分类大厅返回的 `total` 总数，必须严格以底层对应频道全量有效实体数（如电影专区 11,500+ 部、全站 68,500+ 部）为基准，坚决杜绝因截取倒排索引切片而将总数误标为 800 或 1000 部。

---

## 19. 白帽真实性、D1 权威控制与主动广播铁律 (White-Hat SEO & D1 Authority Spec)

全站 SEO 体系与数据管理中枢必须永久恪守以下白帽合规与权威存储工程基线，坚决杜绝任何引发搜索引擎降权或数据竞争的违规操作：

### 1. 结构化数据与可见事实真实性铁律 (Truth Parity Guard)
- **单一规范 `@graph`**：详情页仅输出包含 `WebSite`、`WebPage`、`Movie`/`TVSeries` 与 `BreadcrumbList` 的单一规范 `@graph`；
- **伪造数据零容忍**：严禁伪造 `1520` 等固定评分人数；严禁机械注入伪造的 `FAQPage`；严禁在无内嵌可播放视频的页面输出 `VideoObject`；
- **可见事实一致**：AI Overview 胶囊与详情页文案中，未探测的数据（如年份、评分、画质、地区）必须直接隐藏或优雅省略，绝对禁止写死默认值（如 `2024`、`8.5`、`4K超清`、`免VIP`）或虚假宣称。

### 2. 索引控制与 Robots 穿透感知铁律 (Crawling & Indexing Spec)
- **`/player` 穿透感知**：播放器页面输出 `robots: { index: false, follow: false }`；`robots.txt` 必须放行 `/player`，确保爬虫能正常读取并遵守 `noindex` 指令，杜绝索引黑盒；
- **薄内容与空人物页绝对隔离**：收录作品数为 0 的演职员专栏（`/actor/*`、`/director/*`）及分类题材页（`/genre/*`）必须严格输出 `noindex`；`sitemap-people.xml` 与 `sitemap-genres.xml` 必须执行在库作品数 $\ge 1$ 门禁，实现“0 空页面入地图”。

### 3. D1 强一致权威层与 Edge KV 只读投影铁律 (D1 Authority & Edge Read Spec)
- **权威真理源**：实体主数据、外部权威 ID 映射、演职员关系与事实断言统一由 Cloudflare D1 关系型数据库（`db/schema.sql`）作为唯一真理源，负责全局 ID 分配与强一致性；
- **KV 仅作只读投影**：Cloudflare KV 严格作为 Edge 端高速只读缓存，禁止在 KV 中执行并发原子自增或全局大数组读改写；
- **实质内容哈希**：由 `PublishProjectionService` 计算 64 位 SHA-256 内容哈希，仅当实质性内容变更时方可触发增量发布与 sitemap `lastmod` 刷新。

### 4. 搜索引擎广播安全合规铁律 (Push Safety Spec)
- **普通影视停用 Google Indexing API**：根据 Google 官方政策，Indexing API 仅限招聘与直播流，普通影视 URL 100% 停用，服务端硬锁阻断；
- **IndexNow POST 安全鉴权**：IndexNow 路由彻底封禁 GET 方法的外部推送副作用，仅允许携带 `CRON_SECRET` Bearer Token 的受控 POST 请求进行增量广播。

---

## 20. 全网自动化流水线高容错、契约单一真理源与架构守卫门禁铁律 (Pipeline Fault-Tolerance & Shared Contract Spec)

iKanPP 全域自动化运维流水线与数据同步中枢必须永久恪守以下契约单一真理源、高韧性容错与前置架构门禁工程基线，**彻底终结“改完核心业务 ➔ 辅助脚本断裂 ➔ 事后被动补漏”的恶性循环，严禁任何后续开发回退**：

### 1. 契约单一真理源铁律 (Single Source of Truth, SSOT)
- **绝对禁忌**：**严禁在任何生成脚本、离线爬虫或测试工具中使用 JS 字符串模板手写重复的 `interface` 或核心数据类型！**
- **统一导入机制**：全站所有核心数据契约必须且只能统一定义在 `lib/types/` 中（如预烘焙统一契约 `lib/types/prebaked.ts`）；
- **防覆盖机制**：数据生成脚本（如 `sync-release-radar.mjs`、`sync-episode-updates.mjs`、`sync-latest-titles.mjs`）写入 `.ts` 文件时，必须使用 `import type { ... } from '../types/...'` 引用共享契约，严禁在模板中重复内联声明，杜绝脚本重复运行引发的类型擦除与编译崩溃。

### 2. 流水线辅助任务非阻塞优雅降级铁律 (Graceful Non-Blocking Fallback)
- **核心判定**：在 `.github/workflows/` 中串联的次级辅助任务（如：首发先锋雷达嗅探、4 大排序倒排索引同步、剧集更新角标探测、短剧增量巡检、SEO 广播推送等），属于大盘增量增强任务；
- **铁律要求**：辅助脚本必须在其顶层 `main().catch(...)` 中捕获 Warning 日志并**保持 `process.exit(0)` 正常退出**，严禁因单个辅助源抖动、外部 API 鉴权超时或次级索引异常而执行致命的 `process.exit(1)`，坚决杜绝单点异常阻断全站大盘影视的自动提交、部署与上线闭环。

### 3. 公共基础 SDK 化与凭据别名统一解析铁律 (Shared Infra & Multi-Alias Fallback)
- **消灭重复代码**：所有涉及 Cloudflare KV、D1、外部 API 调用的脚本，必须统一调用共享辅助库（如 `scripts/common/kv-helper.mjs`），严禁在几十个独立脚本中机械复制粘贴 `fetch` 与凭证读取逻辑；
- **多别名全覆盖**：所有读取环境凭证的基础设施必须默认兼容 `CLOUDFLARE_API_KEY || CF_KV_API_KEY || CF_API_KEY || CLOUDFLARE_AUTH_KEY` 等全部历史别名，杜绝因环境变量名差异引发的云端鉴权失败。

### 4. API 端点 Cron Secret 安全默认值防线 (Safe Cron Secret Default)
- 所有对外暴露由 GitHub Actions 或第三方定时触发的接口（如 `/api/seo/entity-pipeline`、`/api/seo/tmdb-changes`），其鉴权逻辑必须内置安全默认 Secret 兜底（`process.env.CRON_SECRET || 'ikanpp-cron-sync-secret'`），彻底杜绝由于云端 Pages 未手动配置环境变量而产生的 401 阻断。

### 5. 架构守卫与前置门禁双重拦截机制 (Architecture Integrity Linter Gate)
- **本地与 CI 双门禁**：全站配置统一的架构契约巡检器 `scripts/test-architecture-integrity.mjs` 与防 404 门禁 `scripts/test-latest-titles-404.mjs`，并通过 `npm run test:arch` 统一编排；
- **构建前硬拦截**：Cloudflare Pages 部署工作流（`deploy.yml`）在执行编译前必须先通过架构守卫门禁，只要检测到任何手写重复契约、辅助脚本致命退出或死链隐患，立即就地阻断并精准报警，将所有潜在架构脱节扼杀在发版之前。

---

## 21. 全站内容原创性与 iKanPP 第一方品牌权威背书铁律 (Brand Editorial Authority & Zero-Machine-Label Spec)

为确保 iKanPP 在 Google 2024~2026 最新核心算法（E-E-A-T）中建立最高权威度、防范“低成本自动化生成（Scaled Content Abuse）”算法惩罚，并为平台沉淀坚不可摧的第一方内容品牌资产，全站必须永久恪守以下准则：

### 1. 统一 iKanPP 第一方品牌权威背书
- **内容责任主体**：全站所有独家深度影评、叙事解构、三大高光看点、角色博弈分析及观影答疑，**对外必须且只能统一定位为「iKanPP 独家视点」与「iKanPP 官方观影指南与答疑」**；
- **权威署名基线**：统一声明“由 iKanPP 影库研究团队特约撰写 · 深度剖析叙事张力、视听美学与角色弧光”，将所有原创内容资产的最终版权、专业度与责任主体 100% 绑定沉淀在 `ikanpp.com` 品牌实体上。

### 2. 前台展示与爬虫可见层“零机器感”铁律 (Zero Machine Label)
- **绝对禁忌**：**严禁在任何前台展示的 UI、HTML 标签、DOM 属性（如 `aria-label`）、结构化数据或摘要中暴露“AI 自动生成”、“AI 独家解析”、“机器人编写”等机械感标签！**
- **严禁内部黑话外露**：严禁在 DOM 中暴露“消灭 Thin Content”等内部开发与算法调试术语，统一替换为“平台特约原创 · 严选深度长文”等高质感专业文案。

### 3. E-E-A-T 品牌心智与停留时长（Dwell Time）正向飞轮
- **隐式信号最大化**：通过充满电影工业质感与文学深度的专业影评，彻底消灭观众的“廉价塑料感”，将单页平均停留时间（Dwell Time）提升至 45 秒以上，以超高用户黏性向搜索引擎持续释放第一梯队正向排名信号；
- **自动化门禁常态化守护**：由 `scripts/test-architecture-integrity.mjs` 中的检查 7 持续硬拦截，任何前端组件若重新出现“AI 独家解析”或内部调试黑话，本地与 CI 编译立即就地阻断发布。





