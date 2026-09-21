# iKanPP 与 iKanX 双轨流媒体架构规范与隔离准则 (Dual-Track Streaming Architecture Specification)

> **版本**：v1.0.0  
> **生效时间**：2026-09  
> **适用范围**：Web 前端、播放器核心组件、边缘代理网关、跨端移植 (iOS/Android/TV)  
> **维护机制**：**本规范为全库最高架构基线**。任何涉及流媒体链路、切源调度、防盗链代理及播放器自愈算法的重大更新，**必须与代码同步修订此文档**。

---

## 1. 架构总览与双轨定位

本项目采用**完全隔离的双轨架构（Dual-Track Architecture）**，分别服务于两个在法律属性、源站特性和网络架构上截然不同的场景：

```
                              ┌────────────────────────────────────────┐
                              │               前端播放器                │
                              └──────────────────┬─────────────────────┘
                                                 │
                     ┌───────────────────────────┴───────────────────────────┐
                     ▼                                                       ▼
      【轨道 A：iKanPP 主站普通影视】                         【轨道 B：iKanX 午夜专区 / 绅士特区】
   (isPremium: false / /player)                            (isPremium: true / /premium/player)
                     │                                                       │
         ┌───────────┴───────────┐                               ┌───────────┴───────────┐
         │ 100% 浏览器纯直连 CDN   │                               │ Cloudflare 边缘代理网关 │
         │   (Direct Play)       │                               │     (/api/proxy)      │
         └───────────┬───────────┘                               └───────────┬───────────┘
                     │                                                       │
                     ▼                                                       ▼
      ┌─────────────────────────────┐                         ┌─────────────────────────────┐
      │ 第三方公网采集源 CDN        │                         │ 严格防盗链源站 (如 Jable)   │
      │ (光速 / 无尽 / 最大 / 极速)  │                         │ (需 Referer 伪装 + 切片重写)│
      └─────────────────────────────┘                         └─────────────────────────────┘
```

---

## 2. 核心架构矩阵对比

| 维度 | 轨道 A：iKanPP (主站影视) | 轨道 B：iKanX (午夜专区) |
| :--- | :--- | :--- |
| **容器组件** | `IkanPPPlayerContainer.tsx` | `IkanXPlayerContainer.tsx` |
| **片源属性** | 苹果 CMS 开放源 (光速/无尽/最大等) | 闭源私有源 / 成人网站 (Jable 等) |
| **防盗链校验** | ❌ 无 (CORS 全球完全开放) | ✅ 有 (必须携带特定 Referer/Origin) |
| **数据链路** | **前端直连**：浏览器 ➔ 采集源 CDN | **边缘中转**：浏览器 ➔ Cloudflare Worker ➔ 源站 |
| **切片处理** | ❌ **零处理**（直接加载原始 m3u8 与 ts） | ✅ **代理重写**（`processM3u8Content` 改写 ts 地址） |
| **服务器带宽消耗** | **0 KB**（全由第三方 CDN 承担） | 消耗边缘 Worker 流量与请求额度 |
| **容灾失败自愈** | **纯前端切线** (自动顺移下一可用源) | 尝试直连/代理切换 (Toggle Proxy) |
| **存储隔离** | `useHistoryStore` / `settingsStore` | `usePremiumHistoryStore` / `premiumModeSettingsStore` |

---

## 3. 架构四项绝对铁律 (Architecture Invariants)

### 铁律一：iKanPP 绝不碰代理与切片重写
- **原理**：iKanPP 的采集源 CDN 遍布全球和亚洲骨干网，带宽充裕、无防盗链。
- **红线**：
  1. `isPremium === false` 时，播放器的 `proxyMode` 强制锁死为 `'none'`，`effectiveUseProxy` 恒为 `false`。
  2. 严禁普通影视源在播放报错时回退或降级至 `/api/proxy`。
  3. 严禁对普通影视源调用 `processM3u8Content` 重写内部 `.ts` 切片。
- **违反后果**：普通影视几千个切片一旦经由 Cloudflare 免费 Worker 转发，将瞬间遭遇并发限流，在缅甸、东南亚等高延迟网络下发生“看几秒卡一下”甚至直接熔断。

### 铁律二：iKanPP 的容灾策略“唯有切源，没有代理”
- **自愈机制**：当 iKanPP 播放遭遇死链、网络丢包或源站 404 时，合法的自愈手段**仅且仅有**：
  1. 纯前端零成本线路无缝切换（光速 ➔ 无尽 ➔ 最大 ➔ 极速 ➔ 新浪）。
  2. 换源时保留播放进度 `currentTime`，实现秒级无感续播。
- **红线**：绝不尝试“用代理拯救死链”。死链切源即可，代理拯救死链是伪需求且浪费服务器资源。

### 铁律三：播放器严禁自杀式跳帧自愈 (No Aggressive Nudge)
- **原理**：HLS 协议依赖浏览器的 SourceBuffer 自然流水线。视频停顿可能是高延迟网络下切片正在传输中（尤其是弱网网络环境）。
- **红线**：
  1. **严禁在卡顿检测中执行 `videoRef.current.currentTime += 0.1`** 等人为篡改时间轴的代码。
  2. 修改 `currentTime` 会强制触发浏览器清空已经缓存的数据、取消进行中的 HTTP 请求并重新握手，在弱网下会导致“停顿 ➔ 跳帧 ➔ 清空缓冲 ➔ 重新下载 ➔ 再次超时”的无限死循环。
- **正确做法**：仅触发 `setIsLoading(true)` 展示缓冲圈，给予底层 Hls.js 充裕的下载时间。

### 铁律四：双轨状态与存储严格物理隔离
- **红线**：
  1. 页面与容器必须明确区隔，绝不复用包含业务逻辑的复合容器。
  2. 普通影视记录在 `useHistoryStore`，绝不混入 `usePremiumHistoryStore`。
  3. 设置项独立维护，普通模式的更改绝对不影响专区，反之亦然。

---

## 4. 流媒体技术术语规范（内部避坑指南）

为避免团队沟通和代码编写中再次产生歧义，统一规范以下流媒体术语定义：

1. **切片 (HLS Segment / TS 切片)**：
   - **定义**：指第三方源站把视频切成的 2~10 秒 `.ts` 或 `.m4s` 文件。
   - **澄清**：这是源站原本就生成好的，**我们的平台不做转码，也不切片**。
2. **切片重写 (Segment URL Rewriting)**：
   - **定义**：特指在 `lib/utils/proxy-utils.ts` 中将 m3u8 内的 URL 改写为 `/api/proxy?url=...`。
   - **适用**：**100% 仅属于 iKanX 防盗链源**，iKanPP 严禁触碰。
3. **直连播放 (Direct Play)**：
   - **定义**：浏览器播放器直接与源站 CDN 通信。
   - **适用**：**iKanPP 的默认且唯一标准播放形态**。

---

## 5. SEO 实体详情页与播放器路由解耦准则 (2026-09 升级)

在 2026 年 SEO 体系化重构中，主站影视实施**双层页面解耦**：

1. **公开实体详情页 (`/title/{entityId}-{slug}`)**：
   - **职责**：100% 服务端直出 (SSR)、承载 Google Discover 大图、AEO 问答胶囊、Schema.org 结构化数据与站内内链网络；
   - **自引用 canonical**：唯一自引用 URL，永久稳定；
   - **边缘强缓存**：Cloudflare CDN 边缘缓存 7 天 (`s-maxage=604800`)，消除 Worker 计算与 KV 成本。
2. **直连播放器页 (`/player`)**：
   - **职责**：纯前端直连播放与智能切源调度；
   - **索引策略**：强制标明 `noindex, nofollow` 并从 robots.txt Disallow，杜绝空壳播放器污染抓取预算；
   - **路由铁律**：详情页“立即播放”按钮必须携带 `entity` 参数（如 `/player?entity=ik000001&...`），与旧版历史链接 `/player?title=xxx` 的 301 重定向检测严格解耦，绝不触发循环重定向；
   - **状态轻量化**：多线路数据通过 `sessionStorage` (`gsKey`) 传递，绝不将 `groupedSources` JSON 巨石写入 URL。

---

## 6. 微短剧专区 (Track A) 架构规范 (2026-09 升级)

随着微短剧频道全量上线 36,000+ 部动态资源与 9:16 竖屏播放器，特此明确短剧专区的流媒体与架构归属：

1. **轨道归属明确性**：
   - 微短剧（`/short`）与短剧沉浸竖屏播放器（`/short/player`）**100% 严格归属于轨道 A（Track A：普通公网影视）**。
   - 播放配置：`isPremium` 恒为 `false`，`proxyMode` 恒为 `'none'`，`effectiveUseProxy` 恒为 `false`。
   - 严禁任何边缘反向代理，绝不允许使用 `processM3u8Content` 改写短剧切片。
2. **三源容灾路由**：
   - 数据源与流媒体线路：光速资源 (P1) ➔ 极速资源 (P2) ➔ 红牛资源 (P3)。
   - 当某源超时 (2.5s) 或死链时，系统在 API 层与前端自动降级切源，绝不用代理拯救死链。
3. **竖屏播放器卡顿红线**：
   - 短剧播放器手势滑动、自动连播与卡顿自愈中，**严禁执行 `videoRef.current.currentTime += 0.1`**。
   - 缓冲等待时仅显示 `isLoading` 动画，给予底层 Hls.js 充裕的下载缓冲时间。
4. **存储隔离与数据分流**：
   - 短剧观看历史与集数进度使用 `useHistoryStore`（`type_name: '微短剧'`）。
   - 热度统计使用轻量级客户端本地 Store（`useShortTrendingStore`），与午夜特区严格分库分表隔离。

---

## 7. 轨道 A/B 静态海报资产与视频正片物理绝对隔离原则 (2026-09 升级)

随着全站全类型自动化预热系统与 Cloudflare R2 持久化镜像的落地，特此重申流媒体与静态资产的物理边界：
1. **恪守正片与图片隔离**：Cloudflare R2（`ikanpp-images` / `img.ikanpp.com`）**仅且只能用于持久化缓存静态图片（海报、剧照、演职员肖像）**。严禁存储、缓存或转码任何 m3u8 或 ts 视频正片。
2. **流媒体直连原则不变**：无论是轨道 A（100% 直连第三方源站 CDN）还是轨道 B（通过 Edge Worker 防盗链伪装中转），流媒体播放核心调度与自愈逻辑绝不与静态资产预热混淆。
3. **自动化预热边界**：`.github/workflows/full-site-prewarm.yml` 的执行边界严格限制在“影人肖像增量入库、图片 R2 上传、边缘 CDN 页面热加载”，严禁对视频正片发起批量预加载，杜绝源站风控与不必要的带宽消耗。

---

## 8. 源站老播放域名防污染与自愈热修复规范 (Stream Anti-Pollution Spec) (2026-09 升级)

针对第三方主流源站（如暴风资源等）部分历史存量数据中写死的老播放域名遭遇运营商 DNS 污染 / SNI 阻断导致客户端偶发无法播放的问题，特确立本自愈规范：

### 1. 核心铁律：纯字符级无感热映射 (Zero-Proxy Domain Sanitization)
- **严格恪守 Track A 铁律**：域名防污染纠正**只能且必须在字符级与解析层完成**（`lib/utils/stream-sanitizer.ts`）。
- **零代理保证**：纠偏后生成的播放地址依然交由浏览器 100% 纯直连源站官方最新未污染 Anycast CDN，**绝不允许借机引入任何反向代理，零消耗服务器带宽与计算资源**。

### 2. 全链路五重自愈卡口
1. **普通采集分集解析卡口 (`lib/api/parsers.ts`)**：
   第三方 CMS API 返回原始 `vod_play_url` 被拆解为分集列表时，第一时间完成老域名净化。
2. **聚合专线直出卡口 (`lib/server/ikanbot.ts`)**：
   ikanbot 动态逆向解密出的各线播放流在封装时同步执行防污染映射。
3. **短剧分集解析卡口 (`lib/api/short-drama-sources.ts`)**：
   短剧专区 36,000+ 部影片的分集解析同步接入，杜绝短剧冷门线路污染。
4. **前端播放器最后防线 (`useHlsPlayer.ts`)**：
   在送入底层 Hls.js 或原生 Safari video 标签前执行就地自愈，即使是用户本地 `localStorage` 历史记录里存留的老旧链接，点击播放瞬间立即被无感纠正。
5. **M3U8 清单与切片防伪装 (`lib/utils/m3u8-utils.ts`)**：
   在处理广告过滤与相对切片补全时，若内容中存在老域名的绝对路径切片或子流，一并执行批量清洗。

### 3. 当前主流源站官方紧急替换规则基线
- **暴风资源官方紧急公告 (2026-07-09)**：
  - `s1.fengbao9.com` ➔ **`v.baofeng9.com`** (老域名遭运营商阻断)
  - `v10.baofeng10.com` ➔ **`v.fengbao10.com`** (老域名遭运营商阻断)
  - `v.baofeng10.com` ➔ **`v.fengbao10.com`** (官方建议割接)

---

## 9. 全库实时网格数据源与全自动 SEO 闭环规范 (Full-Library Realtime Browse & SEO Automation Spec) (2026-09 升级)

### 1. 全库浏览网格架构（`/api/library/browse`）— 详情页即片库 2.0 升级
- **核心定位**：全面升级为“详情页即片库”架构，优先从 Cloudflare KV 自有 `TitleEntity` 结构化片库中执行多维原子交集查询（频道 + 题材 + 地区 + 年份 + 语言 + 连载状态 + 排序），提供 100% 精准统计数字与真实总数；同时保留光速+极速双源作为安全兜底降级方案。
- **网络与架构规范**：
  1. **KV 自有结构化片库优先**：单次请求仅需 15~35ms，原子交集计算，保证筛选大厅与详情页 100% 对应互通，彻底消除“筛选大厅能看到但详情页打不开”的割裂。
  2. **双源秒开降级容灾**：当特定冷门长尾查询在 KV 片库无数据时，毫秒级静默降级到光速+极速资源双源实时代理，确保全网长尾查询 100% 不落空。
  3. **100% 恪守 Track A 零代理直连铁律**：无论通过 KV 还是采集站，流媒体播放时客户端仍 100% 直连第三方源站 CDN，严禁中转任何正片流量。
  4. **短剧专区源站扩充**：短剧专线扩充为 8 大源站体系（巨量、魔都、魔都镜像、光速、极速、红牛、非凡、暴风），并配置海豚资源（`https://hhzyapi.com`）作为红牛资源的无感容灾镜像备份。
  5. **边缘 CDN 缓存**：配置 `s-maxage=600, stale-while-revalidate=3600`，同参数毫秒级响应。
  6. **纪录片无缝解锁**：打破纯静态限制，将高分殿堂纪录片置顶，后续无缝衔接实时纪录片库。

### 2. 连载追踪与预烘焙小时级闭环
- **连载状态感知（`sync-episode-updates.mjs`）**：每小时自动遍历连载影视库（电视剧、动漫、综艺），精准提取采集源最新 `vod_remarks`，小时级感知并回写最新集数角标。
- **7 大专区预烘焙（`sync-category-prebaked.mjs`）**：覆盖电影、电视剧、动漫、综艺、纪录片、短剧、排行榜，首屏 0ms 瞬间直出最新上映剧照与豆瓣评分。

### 3. SEO 全自动 Entity 管道与搜索引擎主动推送
- **主动入库推送（`sync-seo-entities.mjs`）**：新入库影片自动生成规范 SEO Slug 与详情页 URL（`/title/{slug}`），通过 IndexNow 协议向各大搜索引擎（Bing / Yandex / IndexNow）批量广播，秒级触发收录。
- **全自动无人值守**：由 `.github/workflows/sync-iyf-channels.yml` 每小时 5 步全量流水线闭环执行，数据变动自动触发 Cloudflare Pages 编译部署上线。

---

## 10. 巨量与光速资源 2.0 双黄金主力源与自愈调度规范 (2026-09 升级)

为应对中国大陆网络与全球海外公网复杂的连通性与画质诉求，主站 Track A 确立“巨量置顶第一（全球Anycast秒开+4K原画）、光速高可用第二、暴风第三”的黄金骨干源调度铁律：

### 1. 骨干源梯度与优先级体系
1. **巨量资源 2.0 (`juliang`, Priority 1 / Score 160)**：
   - **特性**：接口基于 AppleCMS V10 标准，库容超 28.2 万部长视频及 6.2 万部微短剧（覆盖 4K 院线、热播大剧、精品短剧、动漫等）；流媒体切片采用全球 Anycast CDN 纯净分发（NodeCache / 亚太香港优化直连），无跑马灯文字水印，CORS 100% 开放。
   - **调度定位**：作为全站 **#1 黄金主力首选源**。全球海外 Anycast 本地近场秒开，中国大陆直连优化延迟仅 30~50ms，且不受晚高峰跨国丢包影响，原画清晰度与全品类覆盖全网最优。
2. **光速资源 (`guangsu`, Priority 2 / Score 140)**：
   - **特性**：数百万海量新热影视第一大站，多线全网 CDN 高可用并发支撑，全球及大陆播放速度优异，更新极速，CORS 纯净 443 协议直连。
   - **调度定位**：作为全站 **#2 黄金主力源与核心自愈接管源**。
3. **暴风资源 (`baofeng`, Priority 3 / Score 130)**：
   - **特性**：国内多线 BGP/CDN 秒播骨干源，国内民用宽带延迟极低，高并发承载能力强。
4. **后续梯队**：无尽 (`wujin`) ➔ 最大 (`zuida`) ➔ 极速 (`jisu`) ➔ 新浪 (`xinlang`) ➔ 电影天堂 (`dytt`) ➔ 魔都 (`modu`) ➔ 360 (`zy360`)。

### 2. 纯净切片提取与播放安全
- 巨量资源接口同时返回切片流与网页播放器（`"jlm3u8$$$jlplayer"`），系统分集解析层通过 `playFrom.includes('m3u8')` 物理隔离机制，自动识别并提取 `jlm3u8` 纯净 m3u8 切片，彻底过滤包含跳转与内嵌广告的网页播放器。
- 恪守 Track A 铁律：巨量流切片直接由客户端直连源站香港 CDN，零代理中转。

### 3. 巨量短剧专线 (#1 主力源) 与 62,665+ 部短剧集成规范
- **短剧维度优先级跃升**：巨量短剧拥有 62,665+ 部真实分集短剧，超越魔都（34,395 部），正式确立为全站短剧维度 **#1 黄金主力源（Priority 1）**，魔都顺延为 Priority 2，魔都镜像为 3，光速 4，极速 5。
- **原生 7 大子分类与 AI 漫剧直通映射**：
  - 古装仙侠 (`t=501`, 10,988 部)
  - 穿越 (`t=502`, 4,258 部)
  - 悬疑 (`t=503`, 866 部)
  - 都市 (`t=504`, 22,249 部)
  - 女频 (`t=505`, 8,273 部)
  - 爽剧 (`t=506`, 3,559 部)
  - 其他短剧 (`t=599`, 12,472 部)
  - AI漫剧顶级专区 (`t=7` / `t=701`, 10,429 部)
- **100% 真实原生分集秒开**：全部分集链接在字符层直接经由 `sanitizeStreamUrl` 净化，交由客户端直连，零代理。

### 4. 铁律排除成人边缘分类 (Absolute Adult Category Exclusion)
- **零容忍彻底封禁**：巨量子类目中的伦理片 (`t=190`) 与写真 (`t=191`) 属于成人擦边类目，**实行全平台彻底排除铁律**：既不进入主站 Track A 普通影视与短剧库，亦不路由至 iKanX 午夜专区。
- **全链路五重防御卡口**：
  1. 分类映射层 (`lib/api/juliang-category-map.ts`)：建立 `JULIANG_EXCLUDED_CATEGORY_IDS` 黑名单；
  2. 频道浏览层 (`app/api/short-dramas/browse/route.ts`)：列表输出前强制 `isJuliangExcludedCategory` 过滤；
  3. 全局搜索层 (`lib/api/search-api.ts` 与 `app/api/short-dramas/search/route.ts`)：物理阻断成人关键词与对应类目；
  4. 专区热播层 (`app/api/short-dramas/trending/route.ts`)：榜单聚合强制过滤；
  5. 自动化同步层 (`scripts/sync-juliang-short-dramas.mjs` 与 `entity-pipeline`)：预烘焙与 SEO 推送坚决剔除。

### 5. 4K 原画专线精准识别规范 (Precision 4K Identification)
- **杜绝全源一刀切虚标**：纠偏原先对 `juliang` 全部片目赋予 4K 标识的粗放逻辑。巨量资源中只有 4K 专区 (`t=192`) 或片名/分类明确标注 `4K` / `2160` 的内容才判定为 4K 原画（`isSource4K`）。
- **蓝光专线精准承接**：巨量海量常规 1080P 片目精准归入蓝光极清秒播专线（`HD_BLURAY_SOURCES`），既保障了视觉标识的专业真实性，又保持了高码率线路的梯队优先权。

### 6. 短剧专区 Hero 轮播方案 A 规范 (Vertical Poster Centered + Gaussian Blur 16:9)
- **视觉痛点破解**：短剧海报 100% 均为 9:16 竖版高清图，无原生 16:9 横版剧照。若强行按横版裁剪拉伸会导致严重失真变形。
- **方案 A 落地机制**：
  1. **背景层**：采用该短剧海报全景铺底，施加 `blur-3xl opacity-50 scale-125 saturate-150` 高斯模糊与动态柔光渐变，将 9:16 色彩平滑延展为 16:9 电影级巨幕氛围；
  2. **前景层**：在巨幕视觉中心以精致浮雕阴影（`shadow-[0_20px_50px_rgba(0,0,0,0.9)]`、`rounded-2xl`）立体呈现原生 9:16 高清海报卡片；
  3. **控制层**：贴底三栏布局无缝联动爱壹帆 1:1 规范，保持左侧主标题与立即播放 CTA、中栏 12 席（6 + 6）短剧速报标签矩阵、右侧 8 席缩略卡片。

### 7. 自动化全流程闭环与 SEO 索引
- 由 `scripts/sync-juliang-short-dramas.mjs` 与 `.github/workflows/sync-iyf-channels.yml` 每小时整点闭环执行；
- 数据变更自动刷新 `SHORT_HOME_DATA`，并在提交后自动触发 Cloudflare Pages 编译部署；
- 增量爆款短剧实时写入 `new-scraped-titles.json`，秒级触发 IndexNow 全网搜索引擎主动广播收录。

---

## 9. 全站默认播放源统一为巨量资源与老用户自愈升级铁律 (2026-09 升级)

为了确保中国大陆与海外全球用户极致的播放秒开率、片库覆盖率与 4K/1080P 超高清画质体验，全站确立**巨量资源为全网 No.1 黄金首选播放源（Gold Default Source）**：

1. **骨干探测仲裁容差机制 (`app/api/title-episodes/route.ts`)**：
   - 彻底消除非正片预告/花絮切片对正片的虚假集数干扰：电影（<=3集）或剧集集数差异在 8 集以内（或相对误差在 10% 以内）时，严格以源权重仲裁，巨量资源稳居第一；
   - 杜绝其他采集源因多包含几个预告片而挤掉巨量纯净正片。
2. **流式并发搜源秒播仲裁 (`IkanPPPlayerContainer.tsx`)**：
   - 在流式搜索中，只有命中 `v.source === 'juliang'` 才能秒播，其他源等待流收集完成后按权重仲裁，杜绝低延迟次级源抢跑。
3. **老用户历史与本地配置自愈升级 (`settings-store.ts`, `TitleActionsBar.tsx`, `HistoryItem.tsx`)**：
   - 老用户打开网站，`getSettings()` 自动检测本地源顺序，若首位不是巨量资源立即自动覆写修正；
   - 老用户进入详情页点击【立即播放】/【继续观看】时，只要巨量资源探测可用，优先以巨量资源起播，同时完全继承老用户的续播集数进度与时间戳；
   - 观看历史抽屉与首页继续观看气泡同步支持巨量优先升级。
4. **搜索普通与分组视图对齐 (`VideoGrid.tsx`)**：
   - 普通去重模式与分组模式统一采用 `SOURCE_PRIORITY_ORDER`，确保卡片代表源 100% 为巨量资源。

---

## 10. 全球数字发行雷达系统与「最新上线」展台绝对解耦铁律 (Global Release Radar & Zero-Pollution Showcase Spec)

全站首页大厅与 6 大专区「最新上线 · 实时收录」货架必须永久恪守“高品质当季热播与真实数字发行时间”标准，任何后续开发、底层搜索拓展或自动化同步严禁违反以下工程基线：

### 1. 彻底切断底层持久化对前台展示的污染 (Zero-Pollution Showcase Invariant)
- **严禁写入**：`saveEntity()` 严格定位于底层影视实体数据的持久化与搜索反向索引维护（步骤 1-13），**严禁在 `saveEntity()` 内部向 `recent:all` 或 `recent:${type}` 盲目推入数据**。
- **唯一受控写入口**：前台 `recent:*` 展台的写入权限**唯一归属于 `updateRecentShowcase()`**，只能由每小时执行的「全球数字发行雷达」任务受控调度，彻底杜绝搜索图谱补齐老片（如《美国队长》老动画或冷门老片）污染前台展示。

### 2. 三维数据源智能融合与自愈闭环 (Tri-Source Intelligence Radar)
- **维度一：爱壹帆（IYF）人工审核最新流**：
  - 通过逆向解析 `GetLastAdd?cinema=1&cid=${cid}` 接口并搭载动态 MD5 签名算法（`MD5(publicKey + "&" + queryString.toLowerCase() + "&" + privateKey)`）；
  - 脚本集成 HTML `pConfig` 自动提取自愈机制，彻底免疫爱壹帆未来前端密钥轮转；
  - 严格继承连载状态、官方分集角标（如更新至第X集、08集全）。
- **维度二：主流采集站真实入库流 (Real-Time Collector Stream)**：
  - 针对电影、大陆剧、欧美剧、动漫、综艺等叶子分类并发抓取光速/极速最新资源；
  - 按真实的 `vod_time`（入库时间）倒序排序，确保刚刚在网络上架的华语热播新片抢先捕获。
- **维度三：TMDB 全球排期流 (TMDB Trending & Digital Release)**：
  - 并发监控 `trending/all/day` 与 `movie/now_playing`；
  - 智能识别流媒体网络发行平台，为卡片自动注入 `Netflix` / `Disney+` / `Apple TV+` / `HBO Max` / `院线热映` / `全球热度` 等发行徽章。

### 3. TMDB 原版 4K 无水印物料赋能
- 前台卡片绝不直接采用被压缩、拉伸或带第三方水印的低清图片；
- 融合引擎自动通过片名检索 TMDB 中文条目，补齐原版 4K 竖版海报（`w500`）与 4K 宽屏剧照（`w1280`），并校准真实豆瓣/TMDB 评分。

### 4. 华语流媒体安全防线穿透校验
- 融合脚本底层、KV 写入前校验与前端展示组件（`LatestTitlesRail.tsx`）三层统一执行 `isCleanChineseTitle` 铁律；
- 绝对拦截平假名/片假名日文条目、纯外文无中文条目、韩文字符及低俗敏感词，严禁垃圾老片（评分 <= 3.0 且年代 < 2024）入榜。

### 5. 双重落地与持续自动化
- **预烘焙文件**：生成写入 `lib/data/latest-titles-prebaked.ts`，为全站提供 SSR 0ms 直出骨架；
- **KV 持久化**：由 `.github/workflows/sync-iyf-channels.yml` 每小时整点调度 `scripts/sync-release-radar.mjs`，通过 Cloudflare KV REST API 自动更新生产环境 `recent:*` 系列键；
- **客户端缓存无缝升级**：前台组件将缓存版本升级至 `v8`，并自动清理历史旧版本缓存。

---

## 11. 播放器防周期性卡顿与高吞吐深缓冲水位绝对规范 (Anti-Periodic Stalling & High-Throughput Buffering Spec)

针对用户在长视频播放过程中“播放一段时间后反复卡顿、一部影片内周期性出现卡顿”的历史顽疾，本项目确立了设备识别、缓冲水位、状态解耦、组件隔离与自动化巡检五重立体防御体系：

### 1. 设备环境精准判定（消灭 MacBook 误判移动端）
- **现象归因**：MacBook 带有 Force Touch 触控板，系统原生上报 `navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1`。若单纯依赖此条件判定 iPad，会导致 Mac 桌面端被粗暴降级为移动端，被硬性分配只有 30MB 显存限制与 30 秒缓冲的小缓冲区。播放高码率片源 30 秒后水库蓄满停止拉流，待播放头追上时引发周期性饥饿卡顿。
- **实施标准**：统一调用 `lib/hooks/mobile/useDeviceDetection.ts` 中的 `checkIsIPadOS()`，强制加设 `window.matchMedia('(pointer: coarse)').matches` 与 `'ontouchstart' in window` 双重校验，彻底根治 MacBook 触控板误判。

### 2. 桌面端 120s 高吞吐深水库与 60s 安全后向缓冲区
- **参数红线**：
  - `maxBufferLength`: 桌面端 $\ge 120$ 秒，移动端 $\ge 60$ 秒；
  - `maxMaxBufferLength`: 桌面端 $\ge 240$ 秒，移动端 $\ge 120$ 秒；
  - `maxBufferSize`: 桌面端 $\ge 120\text{MB}$，移动端 $\ge 60\text{MB}$；
  - `backBufferLength`: 桌面端 $\ge 60$ 秒，移动端 $\ge 25$ 秒；
  - `fragLoadingTimeOut`: 恒定 $30000\text{ms}$，重试超时 $60000\text{ms}$。
- **机理保障**：拉开后向回退缓冲区距离（60 秒），杜绝 Hls.js 以秒级频率调用 `SourceBuffer.remove(0, currentTime - 30)` 导致浏览器解码管线进入 `updating = true` 锁冲突而阻断切片追加。

### 3. 播放器父容器解除 Zustand 全量订阅（消灭 5 秒级联 Re-render 风暴）
- **现象归因**：播放器每 5 秒自动调用 `addToHistory` 保存进度，修改了 `viewingHistory` 数组。若父容器直接解构 `const { addToHistory } = useHistory()`，就会无意中订阅整个 store，每 5 秒引发 1400 行容器全量子树级联重渲染，抢占主线程 CPU 造成音视频管线卡顿。
- **实施标准**：
  - 主站容器：`const addToHistory = useHistoryStore((s) => s.addToHistory);`
  - 午夜容器：`const addToHistory = usePremiumHistoryStore((s) => s.addToHistory);`
  - 外部回调（如 `onSelectEpisode`）必须由容器使用 `useCallback` 严格记忆化，严禁内联匿名箭头函数。

### 4. 播放器核心组件 React.memo 物理隔离
- `VideoPlayer`、`DesktopVideoPlayer`、`CustomVideoPlayer` 统一通过 `React.memo` 导出，隔离父级一切非必要重绘。

### 5. 自动化架构门禁常态化锁定
- 由 `scripts/test-architecture-integrity.mjs` 第 11 项常态化巡检，CI/CD 与本地预提交硬拦截任何参数倒退。

---

## 12. 工业级 Artplayer 5 独立渲染核心与全屏防黑屏铁律 (Artplayer 5 Core & Fullscreen Surface Spec)

为了彻底根除用户在全屏播放时画面偶发黑屏（声音正常播放但视频图层丢失）的顽疾，播放器渲染层全面升级为工业级 **Artplayer 5 原生 DOM 架构**：

### 1. 根本原因与架构解耦机理
- **冲突根源**：在原有纯 React 播放器模型中，`<video>` 标签被包裹在 5 层 React `<div>` 容器中。当用户进入系统全屏时，操作系统（如 macOS CoreAnimation、Windows DirectComposition）会将底层 `<video>` 提升到显卡专属的 **Hardware Overlay Plane（硬件直通叠加平面）** 以实现零拷贝省电渲染。然而，浏览器触发 `fullscreenchange` 事件时，React 虚拟 DOM 会捕获该事件并重新渲染外层 1400 行的容器与所有子组件，频繁变更内联样式与 ClassName。这种虚拟 DOM 的回流（Reflow）强制显卡驱动发生 **Surface Detach（硬件平面脱离）**，导致视频图层被显卡保护性剔除，呈现出“黑屏但声音继续”的假死现象。
- **Artplayer 物理隔离解耦**：Artplayer 5 是纯原生 JavaScript 驱动的工业级流媒体播放器，`<video>` 元素与控制栏全部在独立的纯原生 DOM 树内创建与调度，**彻底不受 React 虚拟 DOM Re-render 瀑布流的任何干扰**。在进入或退出全屏时，显卡硬件叠加图层保持绝对稳定，彻底终结全屏黑屏风险。

### 2. 双轨业务与 Netflix 交互 100% 资产继承
- **单一真理源配置贯穿**：通过 `lib/player/hls-config-factory.ts` 为 Artplayer 提供标准化的 `createHlsConfig()`：
  - 桌面端：`maxBufferLength: 120s`、`maxMaxBufferLength: 240s`、`maxBufferSize: 120MB`、`backBufferLength: 60s`、`fragLoadingTimeOut: 30000ms`；
  - 移动端：`maxBufferLength: 60s`、`maxMaxBufferLength: 120s`、`maxBufferSize: 60MB`、`backBufferLength: 25s`；
  - 精准识别：彻底杜绝通过简单 `maxTouchPoints > 1` 将 MacBook 误判为 iPad 的漏洞。
- **双轨绝对隔离**：轨道 A 恒定 100% 浏览器直连第三方源站 CDN（`effectiveUseProxy: false`），轨道 B 恒定走 Cloudflare Edge Worker 中转伪装，边界丝毫不乱。
- **全屏 Portal 容器直插**：选集抽屉（`InPlayerEpisodesDrawer`）、线路抽屉（`InPlayerSourceDrawer`）、返回按钮与 4K VIP 品牌台标，统一通过 `ReactDOM.createPortal(..., art.template.$player)` 直接挂载到 Artplayer 原生全屏宿主容器内部。在系统全屏与网页全屏下皆能平滑弹出，且底色严格恪守 `bg-[#141416]/98` 纯色不透明原则，彻底剔除 `backdrop-filter`。
- **进度保存 Selector 防重绘**：通过 `useHistoryStore((s) => s.addToHistory)` 和 `usePremiumHistoryStore((s) => s.addToHistory)` 进行防抖（5 秒）保存，绝不订阅全量 store。


