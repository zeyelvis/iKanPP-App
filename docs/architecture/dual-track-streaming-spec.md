# iKanPP 与 iKanX 双轨流媒体架构规范与隔离准则 (Dual-Track Streaming Architecture Specification)

> **版本**：v1.1.0  
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
   (isPremium: false / /title/* 页内播放)                   (isPremium: true / /premium/player)
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

## 5. 详情页即播放页：页内原地播放准则 (2026-09 合并升级)

主站影视（轨道 A）的详情页与播放页合并为一页：用户在详情页原地看片，不再跳转到单独的播放页。

1. **详情页 (`/title/{entityId}-{slug}`) 即播放页**：
   - **布局**：顶部播放区 `components/title/WatchStage.tsx`。起播前为 16:9 剧照与播放按钮，片头信息（片名、评分、年份、类型、操作按钮）在剧照下方，右侧（手机在下方）为选集，电影为剧情梗概；
   - **原地起播**：点击播放、选集或页面上任何播放按钮，播放器在剧照位置挂载，右侧换为播放器自带的线路与选集，片头信息留在播放器下方；
   - **同一个播放器**：内嵌的是 `/player` 同一套 `IkanPPPlayer`（`variant="embedded"`），切源自愈、防串台、连接看门狗、缓冲水位红线全部沿用；轨道 A 零代理直连不变，全站 `referrer: no-referrer` 不变；
   - **状态写在 # 片段**：`#ep=3`、`#s=2&ep=3`、`#ep=3&line=modu`、`#play`（从上次位置继续）。片段不发到服务器，每部作品始终只有一个可缓存、可索引的 URL；用 `history.replaceState` 写入，不产生多余的历史记录（`lib/client/watch-fragment.ts`）；
   - **续播直达**：刷新或"继续观看"时，若本季在本机看过，直接复用观看记录里的线路与视频 ID 起播，不重新搜索片源；线路失效时照常前端切源；
   - **订阅隔离**：详情页组件只订阅本片的观看记录（`lib/store/title-history.ts`），播放器每 5 秒保存进度不会引起详情页重渲染（准则 22）；
   - **真实 308**：规范 URL 重定向必须是 HTTP 308。详情页不设 `loading.tsx`，重定向与 `notFound()` 在首字节前完成（否则只能输出 200 + meta refresh 的假重定向与软 404）；浏览器经 308 会保留 # 片段。
2. **`/player` 兜底**：
   - 带 `entity` 的旧链接（分享、书签、外链）由服务端 308 到详情页，集数、季数、线路转为 # 片段；标准 ID 直达规范 URL，雷达临时 ID 只输出 `/title/片名`（准则 13.4）；
   - 午夜特区（`premium=1`）以及只有片源视频 ID、没有本站作品的链接（观看历史、收藏、片源搜索结果）继续在 `/player` 播放；
   - **索引策略**：保持 `noindex, nofollow`，robots.txt 放行以便爬虫读取 noindex（准则 19.2）；
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
- **全屏 Portal 容器直插**：选集抽屉（`InPlayerEpisodesDrawer`）、线路抽屉（`InPlayerSourceDrawer`）、返回按钮与 4K VIP 品牌台标，统一通过纯色不透明全屏宿主容器挂载。在系统全屏与网页全屏下皆能平滑弹出，且底色严格恪守 `bg-[#141416]/98` 纯色不透明原则，彻底剔除 `backdrop-filter`。
- **进度保存 Selector 防重绘**：通过 `useHistoryStore((s) => s.addToHistory)` 和 `usePremiumHistoryStore((s) => s.addToHistory)` 进行防抖（5 秒）保存，绝不订阅全量 store。

---

## 13. 字节跳动 XGPlayer (西瓜播放器 v3) 工业级流媒体引擎与全站双核演进规范 (XGPlayer Engine & Dual-Core Architecture Spec) (2026-09 升级)

为实现媲美西瓜视频、抖音 Web 端的一线流媒体播放体验，项目确立全面升级为**字节跳动 XGPlayer v3 插件化播放引擎**：

### 1. 核心技术选型与解复用卸载
- **纯插件解耦模型**：采用 `xgplayer@^3.0.26` 与 `xgplayer-hls@^3.0.26`，所有 UI 控件与控制逻辑由插件按需装载；
- **Web Worker 后台解复用**：`xgplayer-hls` 将复杂的 m3u8 清单解析与 TS 切片解复用（Demuxing）彻底卸载至 Web Worker 独立线程，**主渲染线程 CPU 耗时立降 40%**，杜绝 4K 高码率播放时的掉帧与微小卡顿；
- **原生多维手势支持**：原生集成单指滑动调节亮度/音量、双击暂停、长按 2x 倍速、横向滑动快进/快退进度带实时缩略图预览等字节级微交互。

### 2. 架构铁律与硬件直通防黑屏 100% 严密继承
- **120s 深缓冲水位锁死**：XGPlayer HLS 插件必须强制配置 `targetBufferLength: 120`，严禁擅自下调导致高码率片源水库饥饿；
- **严守 No Aggressive Nudge 铁律**：严禁在卡顿检测中执行强行拨快时间轴（`currentTime += 0.1`）的操作；
- **全屏硬件直通防黑屏（Hardware Overlay Plane）**：
  - XGPlayer 样式定制文件（`components/player/xg/xg-player.css`）强制覆盖：`-webkit-backdrop-filter: none !important; backdrop-filter: none !important;`；
  - 严禁在全屏伪类中将 `:fullscreen` 与 `:-webkit-full-screen` 逗号合写，必须拆解为独立规则块，杜绝显卡驱动触发 Surface Detach 导致画面黑屏。

### 3. 多核 A/B 灰度与自愈回退兜底机制
- **状态存储集成**：在 `lib/store/settings-store.ts` 中配置 `playerEngine: 'nextgen' | 'xgplayer' | 'legacy'`，默认值为 `'nextgen'`（新一代内核），`xgplayer` 和 `legacy` 作为回退选项；
- **动态分发入口**：由 `components/player/CustomVideoPlayer.tsx` 统一动态路由分发，若用户遇到特定老旧机型兼容问题，支持在设置或 URL 参数中平滑回退，保障 100% 播放稳定性。

---

## 14. 暗影自愈专线 (ShadowLine Engine) 架构与反侦察隐匿铁律 (ShadowLine Stealth & Autonomous Self-Healing Spec) (2026-09 升级)

针对全网主流公网源在部分冷门美剧、外语新番或院线先锋大片上画质不佳或缺集的问题，平台正式确立**「暗影自愈专线 (ShadowLine Engine)」特种分级调度与管理体系**：

### 1. 分级双层多轨源调度模型 (Tiered Multi-Source Scheduling)
- **第一层：骨干采集源（主力公开层）**：
  - 巨量、光速、极速、无尽、暴风等遵循 MacCMS 规范的公开源站；
  - 承担全站 95% 以上常规大流量播放，批量定时巡检，公开稳定；
- **第二层：暗影自愈专线（特种备用层）**：
  - 基于 AES-128-CBC 动态加解密逆向打通的自压制 4K/1080P 高码率线路；
  - 仅在骨干源暂缺、画质低劣或用户在播放器切源抽屉中主动点播时唤醒，充当精准尖刀。

### 2. 100% 恪守轨道 A 零代理直连铁律
- **绝对直连**：暗影专线流媒体 m3u8 及 TS 切片**必须且只能由客户端浏览器纯直连对端 CDN (Direct Play)**；
- **禁止反代抢救**：**严禁将暗影专线导入 `/api/proxy` 进行请求头伪装与切片重写**。若对端 CDN 阻断跨域直连，系统的唯一合法动作是**静默熔断下线该线路**，坚决不浪费我方任何服务器计算与带宽资源。

### 3. 反侦察与零暴露四原则 (Zero-Leak Traffic Policy)
为确保暗影专线长期稳定运作，防止对端风控与告警，必须严格遵循以下原则：
1. **0 预爬取与按需惰性解析 (Lazy Resolve)**：严禁全库定时批量扫描抓取，只在单集被点播时触发单次解析，并利用内存与 KV 缓存 4~6 小时；
2. **客户端完全隔离**：前端拉取切片时必须声明 `referrerPolicy="no-referrer"`，严禁泄露我方主站域名；
3. **高斯随机抖动巡检 (Jittered Probing)**：巡检自愈脚本必须加入随机时间抖动（如 2小时 ± 随机30分钟），规避固定频控模型；
4. **全真 Chromium 网络指纹**：Node 端 API 握手必须完整补齐 `Sec-Ch-Ua`, `Sec-Fetch-*`, `Accept-Language` 等全套拟真请求头。

### 4. 后台控制中枢与 90 天审计追踪 (`/admin/shadowline`)
- 控制台设立三大核心卡片：动态解密凭据矩阵、Canary 探活质量雷达、隐匿防侦察水位；
- 支持一键手动静默嗅探（`POST /api/admin/shadowline/sniff`）、Canary 金丝雀探活（`POST /api/admin/shadowline/probe`）与紧急熔断硬锁（`POST /api/admin/shadowline/toggle`）；
- 每次探活与配置变动强制记入 KV 并保留 90 天审计日志（`admin:audit-log:shadowline`），合规透明可追溯。

---

## 15. 播放器「新一代内核 (nextgen)」流媒体引擎架构规范 (2026-09 升级)

为在保持 XGPlayer 优秀控件手势的同时，进一步优化高码率流媒体加载体验、AirPlay 真正原生投屏、iPhone 网页全屏旋转适配与专线品牌角标覆盖，全站播放器体系引入第三代演进内核「新一代内核 (nextgen)」：

### 1. 核心调用链与架构分层
```
IkanPPPlayerContainer / IkanXPlayerContainer (双轨容器，负责线路调度与状态隔离)
  └─ VideoPlayer (中间层，进度保存、出错切源驱动)
       └─ CustomVideoPlayer (多引擎分发调度中枢)
            ├─ legacy   → DesktopVideoPlayer (经典自研渲染核心，回退兜底)
            ├─ xgplayer → xg/XgVideoPlayer (字节跳动 xgplayer v3，回退引擎)
            └─ nextgen  → nextgen/NextgenVideoPlayer (新一代内核，全站默认主力引擎，模块化解耦插件与单一真理源配置)
```
- **默认引擎演进**：全站默认主力引擎正式确立为 `nextgen`，老用户本地缓存自动平滑迁移至新内核，保留 `xgplayer` 和 `legacy` 作为回退选项；
- **换线路与容灾**：新引擎在遇到播放致命错误时仅调用 `onError(msg)`，中间层 `VideoPlayer` 接管并驱动外层容器执行纯前端切源，新引擎内部不耦合切源业务逻辑；
- **进度保存**：通过 `onTimeUpdate(t, d)` 统一向上汇报，由中间层持久化存储。

### 2. 双模智能加载与单一真理源配置
- **苹果生态原生直连**：在 Safari、iOS 各类浏览器环境下，直接使用系统原生 HLS 播放（`video.src = m3u8`），以最小 CPU 功耗支持系统级 AirPlay 投屏；
- **其他平台工场统一**：在 Chromium、Firefox、Edge 等设备上，通过 `import('hls.js')` 动态加载，并强制由 `lib/player/hls-config-factory.ts` 的 `createHlsConfig()` 注入配置；
- **设备精准识别**：严格调用 `checkIsIPadOS()` 并结合粗指针与触摸事件识别移动端，严禁仅凭 `maxTouchPoints > 1` 误判 Mac 桌面端；
- **起播看门狗 (15秒截止)**：
  - 加载后 15 秒内未出现第一帧画面（`loadeddata`），立即触发 `onError('start-timeout')` 驱动容器无缝切线；
  - 原生播放模式下仅在用户具有播放意图（`play`）时计时，避免自动播放被浏览器拦截时的误切；
  - 仅负责起播阶段，播放中的缓冲一律由 120s 深水库自然流水线调度，严禁暴力跳转。

### 3. iPhone 网页全屏旋转校准与全屏硬件直通防黑屏
- **iPhone 网页全屏旋转**：在 iPhone 上采用 `rotateFullscreen: true`，横屏时播放器根节点旋转 90° 铺满视口，并通过 `fitPhoneFullscreen` 依据 `window.innerWidth/innerHeight` 精准校准尺寸，彻底消除顶部灰带与错位；
- **原生全屏零 Transform**：系统原生全屏（Native Fullscreen）下，`<video>` 行内样式恒定声明 `transform: none`；
- **全域组件纯色无模糊**：选集抽屉、专线换源抽屉、倒计时弹窗等统一采用高级纯色暗夜背景（`bg-[#141416]/95`），严禁任何 `backdrop-filter`，彻底杜绝 GPU Back-buffer 显存反向回读引发的 Surface Detach 画面黑屏。

### 4. 专线右上角品牌覆盖角标 (Brand Badge)
- **展示条件**：仅在当前线路为专线（`currentSource === 'shadowline'`）且为主站普通影视（`!isPremium`）时激活；
- **微米级定位**：基于 `watermarkCover` 纯几何计算，通过 `ResizeObserver` 与分辨率监听，让 iKanPP 矢量品牌角标与原片源标识严格契合；
- **双轨隔离恪守**：午夜特区（`isPremium: true`）展示专属消融台标，绝不混淆渲染。

### 5. 零暴露流量隐匿策略 (Referrer-Policy: no-referrer)
- 播放器拉取流媒体 m3u8 与 TS 切片时，全局遵循 `no-referrer` 规范，杜绝向第三方对端源站 CDN 暴露主站域名。

---

## 16. 按地区学习的线路智能排序与自愈调度规范 (Regional Line Ranking Spec) (2026-09 升级)

为彻底解决不同国家/地区网络环境下公网采集源与专线可用性差异过大、固定 `TOP_ORDER` 导致用户反复撞死链的痛点，全站流媒体体系确立按地区自适应学习的线路排序机制：

### 1. 指标上报闭环 (Analytics Engine)
- **第一帧与报错上报**：新一代播放器在出第一帧（`loadeddata` / `playing`）时通过 `navigator.sendBeacon('/api/beacon/play')` 上报成功及耗时；在调用 `onError` 时上报失败；
- **双轨隔离铁律**：午夜专区（`isPremium: true` 或 `source === 'jable'`）**绝对不上报**，严禁污染主站指标；
- **安全与防刷**：接口严格核验同源上下文，拦截爬虫与超过 512 字节的异常载荷，并将国家 (`cf-ipcountry`)、线路、状态写入 Cloudflare Workers Analytics Engine (`ikanpp_playback`)。

### 2. 7 天滑动窗口离线聚合 (Cron Job)
- 每小时自动化巡检调度 `scripts/aggregate-line-rankings.mjs`，执行 Analytics Engine SQL 汇总近 7 天各国与全球的成功/失败次数；
- 原子化批量写入 Cloudflare KV 键 `line-rank:{国家}` 与全球汇总键 `line-rank:*`。

### 3. 平滑成功率与 0.14 超车门槛算法 (No Noise Oscillation)
- **平滑成功率公式**：`rate = (ok + 10 × base) / (ok + fail + 10)`，其中 `base` 优先取全球平滑成功率，无历史数据时取 0.8；
- **广告源惩罚与名单核查规范**：
  - 传统采集线路中带有片头赌博跑马灯广告的扣除 0.15 分；
  - **抽样核验基准**：对每条线路抽查 3 部影视，提取 3 秒与 12 秒关键帧画面核验；经实测核验确认 `zuida`、`feifan` 开头无赌博跑马灯，已从广告名单中剔除；`juliang`、`guangsu`、`wujin`、`jisu`、`xinlang`、`hongniu`、`subo`、`wolong` 等片头烧录广告特征明确，列入 `AD_PRONE_SOURCES` 并在前台标注「片头广告」；
- **默认基准权重排序 (DEFAULT_LINE_TOP_ORDER)**：
  - 第一梯队（干净无片头广告）：`shadowline`, `modu`, `ikun`, `zuida`, `feifan`, `ruyi`, `liangzi`；
  - 第二梯队（仅大陆专线，海外受限降权）：`baofeng`, `dytt`, `json1080`, `youku`；
  - 第三梯队（片头带赌博广告，排在最后）：`juliang`, `guangsu`, `wujin`, `jisu`, `xinlang`, `hongniu`, `subo`；
- **0.14 超车防抖阈值**：只有当一条备选线路的分数比排在它前面的线路**高出 0.14 以上**时才允许超车，单次或偶发网络抖动不引发频繁换序，连续四次失败才会触发自动降级；
- **非阻塞直出与无虚标铁律**：播放容器通过 `/api/line-rank` 异步拉取当地画像，加载失败或冷启动时优雅回退至默认基准 `TOP_ORDER`，绝不阻塞起播；线路选择列表中彻底删除所有按静态对照表捏造的「4K」「蓝光」虚假标签，仅标注「片头广告」。

---

## 17. 真实用户网页打开速度统计与全球诊断规范 (PageSpeed Analytics Spec)

为精细化掌控全球各地区受限网络及跨洋连通质量：
1. **指标采集**：全局客户端组件 `<PageSpeedMonitor />` 通过 `PerformanceNavigationTiming` 计算首字节时间 TTFB (`responseStart - activationStart`)，并利用 `PerformanceObserver` 监听最大内容绘制 LCP；
2. **后台打断豁免**：页面初始处于后台（`visibilityState === 'hidden'`）时不统计 LCP，防止失真；
3. **低频聚合**：在页面隐藏、`pagehide` 或 20 秒后，通过 `sendBeacon('/api/beacon/page')` 写入 Workers Analytics Engine (`ikanpp_pagespeed`)；
4. **后台智能分析**：管理后台 (`/admin/analytics`) 实时以 `quantileExactWeighted(0.5)` 与 `quantileExactWeighted(0.75)` 计算各国 TTFB 与 LCP 的中位数与 P75 分位值；
5. **隐私与隔离**：只按「日期 × 国家 × 页面类型 × 设备」汇总，绝不记录 IP 或用户信息，午夜专区与管理后台绝对不上报。

---

## 18. PWA 装到桌面引导体验对齐规范 (PWA Installation Alignment Spec)

1. **时机铁律**：严禁用户初次打开网站即弹窗骚扰；必须且只能在用户看满第 2 集并出第一帧时由播放器触发计数后方可主动唤起；
2. **免打扰机制**：用户点击「稍后再说」或关闭后，写入 14 天静默免打扰（`14 * 24 * 60 * 60 * 1000`）；设置页与「我的」页保留常驻入口；
3. **iOS 26 权威措辞**：严格对齐 iOS 26 新版操作路径：
   「点 Safari 底部的「共享」（新版 iOS 先点右下角「···」）→ 选「添加到主屏幕」（新版 iOS 在「查看更多」里）→ 以后从桌面图标打开」；
4. **浏览器精准分流**：排除非 Safari 的 iOS 浏览器（CriOS、FxiOS、EdgiOS、UC、Quark 等），仅在原生 Safari 下展示上述步骤；其他浏览器引导复制链接在 Safari 打开；
5. **防遮挡与全屏安全**：全屏播放模式下坚决不弹窗打断观影；弹窗彻底剔除 `backdrop-blur`，采用纯色深底保证显卡硬件覆盖层不黑屏；独立桌面 App 窗口 (`display-mode: standalone`) 运行时 100% 彻底静默。

---

## 19. 部署后旧页面脚本失效自愈规范 (Stale Build Auto-Recovery Spec)

为彻底解决生产部署更新导致已打开的存量页面（后台标签页、PWA 桌面版）在按需加载脚本时抛出 `ChunkLoadError`、整页崩溃的痛点：
1. **触发条件**：
   - 统一由 `lib/client/stale-build.ts` 的 `isStaleBuildError` 判定（覆盖 Chrome、Safari、Firefox、Turbopack 与 webpack 的脚本缺失与动态 import 失败特征）；
2. **处理方式**：
   - 捕获后立即触发 `reloadForNewBuild()`，自动刷新到最新部署版本；
   - **防死循环机制**：利用 `sessionStorage` 限制每 60 秒内最多自动刷新一次，防止真实缺失文件时死循环刷新；超过 60 秒频控后展示友好中文错误页供用户手动选择；
3. **播放状态无损续播**：
   - 刷新后通过 URL searchParams 参数保持集数和线路，配合播放器 `shouldAutoPlay` 默认开启及播放历史记录，实现 100% 自动续播；
4. **指标与调度纯净度铁律**：
   - 脚本加载失败属于客户端版本更迭，**绝不当作线路故障**；严禁触发 `handlePlaybackError` 换线路，严禁向 `/api/beacon/play` 上报 `ok: false`，绝不污染地区线路质量学习与自愈调度系统。

---

## 20. iKanPP专线退役说明与纯粹直连架构回归 (Retired & Direct Play Spec) (2026-09)

- **退役背景**：原爱壹帆源站（PipeCDN）因强依赖移动端逆向签名、出网 IP 绑定、防盗链与切片中继代理，不仅链路复杂、容易受到 0.0.0.0 毒化干扰，且中继代理机制背离了轨道 A「100% 浏览器 Direct Play 纯直连」的极简极速原则；
- **架构决议**：全面取消该专线及 `/api/ikanpp-stream` 中继端点，释放 Edge Function 打包体积；
- **最终架构**：全站轨道 A 核心播放调度永久专注于**「⚡ 暗影自愈专线 (4K 原画直连，瓜子源)」**与全网骨干源（巨量、光速、无尽、暴风等），100% 直连第三方 CDN，零中继零代理，保障全平台毫秒级稳定秒开。







