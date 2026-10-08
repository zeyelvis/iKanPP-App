# iKanPP 工程与架构准则

本文档是本仓库的工程规范，开发者、维护者和 AI 编程助手都必须遵守。2026-10-08 起按新架构重写（OpenNext + Workers + D1）；改动架构时同步更新本文件和 `docs/architecture/` 下对应文档，代码与文档必须一致。

---

## 1. 系统总览

| 部分 | 现状 |
|---|---|
| 网站 | Cloudflare Worker `ikanpp-web`（OpenNext + Next 16），区域路由 `ikanpp.com/*`、`www.ikanpp.com/*`；`ikanpp.com` 301 到 `www`。原 Pages 项目保留作回退：删掉 Worker 路由即回到 Pages。 |
| 权威数据 | D1 `ikanpp-db`（表结构见 `db/d1/`）：作品、网址片段、快照路由、影人与演职关系、题材索引、站点地图清单、首页与列表数据集（`documents`）。 |
| KV `KVIDEO_KV` | 只放小数据：求片记录、后台审计日志、专线配置与探活、专题、线路排序。读写统一走 `lib/server/kv.ts`，不存作品。 |
| R2 | `ikanpp-next-cache`：页面增量缓存（ISR）；`ikanpp-images`：图片镜像 `img.ikanpp.com`。 |
| 专线 Worker | `workers/ikanpp-core`（`ikanpp-core-worker`）：只提供专线解析 `/api/shadowline/resolve`、`/api/ikanpp-line`，主站 `next.config.ts` 把这两个地址转发过去；看片片、夜貓追劇的播放线路会实时调用 `www.ikanpp.com/api/shadowline/resolve`，**不能下线或改返回格式**。没有定时任务。部署：`wrangler deploy --config workers/ikanpp-core/wrangler.toml`。 |
| 入库 | Worker `workers/ikanpp-ingest`，Cloudflare 定时器：每小时第 23 分（轮播与热播标签、最新上线、短剧首屏），第 43 分（四大排序的两个时间排序；北京时间 4 点另跑人气与评分排序和站点地图重算）。手动触发：`POST /run?job=<任务>`，带 `INGEST_SECRET`。 |
| 部署 | 本机 `npm run deploy`（OpenNext 构建 → `scripts/drop-build-prerenders.mjs` → 部署）。数据更新不需要部署。GitHub 只跑检查（`.github/workflows/ci.yml`），不部署、不跑定时任务。 |

已经去掉、不得恢复的部分：会员系统（账号、VIP、签到、邀请、Supabase、Turnstile）、AI 长文生成（已有内容保留，不再生成）、GitHub 定时任务与本机 SEO 守护进程、写死在仓库里的首页与片单数据文件、Google Indexing API 推送。

午夜特区 iKanX 是独立项目（私有仓库 `ikanx`，Worker `ikanx`）。主站不得出现 `/premium`、`/api/premium`、`/api/proxy`，也不得读写 iKanX 的数据；主站收到 `/premium` 或 `premium=1` 的请求一律 301 到 ikanx.com（`proxy.ts`）。

---

## 2. 数据与编号

1. **D1 是唯一权威**：页面和公开接口只读，不写作品、不现场建档。新作品只由入库 Worker 建档（`workers/ikanpp-ingest/src/titles.ts` 的 `createTitle`）；后台编辑直接改 D1，但不改编号和规范网址。
2. **编号**：`ik` + 6 位数字。编号永不复用、永不改指；新编号取 130000 以上最小空号；同一个 TMDB 作品（类型 + 编号）只能有一个 live 编号。只按片名对上、没有建档的条目不分配编号。
3. **数据集**：首页与频道首屏 `home:<频道>`、最新上线 `latest:<频道>`、频道货架 `category:<频道>`、四大排序 `rank:<排序>:<频道>`，都是 `documents` 表里的整份 JSON。类型只定义在 `lib/types/prebaked.ts`，入库 Worker 和网站共用，不得在别处重复声明。
4. **读取**：统一通过 `lib/data/d1/`（`getDb()` 每个请求用一次只读副本会话）。构建阶段拿到的是空数据，页面靠 ISR（revalidate 300 秒）在线上生成；`drop-build-prerenders.mjs` 删除构建期产生的空页面。
5. **表结构变更**：在 `db/d1/` 新增编号文件，用 `wrangler d1 execute ikanpp-db --remote --file` 执行。注意 D1 限制：单条语句最多 100 个绑定参数、语句约 100 KB、单次执行有 CPU 上限，大批量改动要分批，外键列要建索引。
6. **去重**：片库里约 2.8 万部同名同年的重复条目。合并只能用 `lib/server/entity-resolver.ts` 的证据评分（TMDB / 豆瓣编号一致判同一部；否则按标题、原名、年份、导演、主演、片长加权，≥ 0.88 才合并，≤ 0.55 判不同，中间人工看），合并方式是 `state = 'merged'` + `merged_into`，旧网址 308 到保留条目。不得只凭同名同年合并。

---

## 3. 作品页网址与零 404

1. **解析顺序**（`lib/data/d1/title-route.ts`）：快照路由（2026-10-08 在 Google 有展示的 12,173 个网址的当时结果）→ 片段表（规范片段与快照片段直接信任，其他别名要核对片名）→ 片段里的编号（片名对不上时不交给占着编号的另一部片）→ 按片名找资料最好的一部（有 TMDB、热度高、编号小；去掉旧临时编号前缀；带季号时再按去掉季号的片名找）→ 首页与列表数据集里的卡片直出。
2. **规范网址**：以 D1 `slugs` 表 `canonical = 1` 的片段为准，格式 `ik000123-片名`。`getTitleCanonicalHref` 生成链接时：片名优先；外部传入的片段先 `decodeURIComponent`；只有合法的 6 位编号才拼进网址，`ik_radar_…`、`ik_pre_…` 这类临时编号一律只输出 `/title/片名`。
3. **跳转**：非规范网址用 `permanentRedirect`（308）一跳到规范网址；只在目标编号合法时跳转，不得拼出 `/title/undefined-…`。旧代码撕裂成十六进制的网址（`e9-98-bf-…`）必须还原后解析。季网址（`片名第2季`）原地显示，canonical 指向本体。
4. **前台展示即必达**：首页、频道、最新上线、排序里出现的卡片，点进作品页必须能打开；片库还没有的作品按卡片资料直出，不得 404。
5. **回归测试**：改动 `getTitleCanonicalHref`、`generateSlug`、`title-route.ts` 或作品页解析时，必须跑 `npm run test:urls`；改动解析规则还要用导入用的 SQLite 文件跑 `npx tsx scripts/d1/test-title-route.ts` 对照快照（同一部片 ≥ 99.9%，0 错片）。

---

## 4. 首页、频道与列表（对齐爱壹帆）

1. **轮播与热播标签**（入库任务 `hero`）：轮播取爱壹帆频道页的轮播（纪录片取轮播接口，不足 8 席用经典纪录片补齐），每个频道 8 席，用 TMDB 补海报、剧照、简介、年份、评分；热播标签取 `getHotVideoTop`，保留更新角标。数量：首页、电影、电视剧、动漫各 12 个（6 + 6），综艺、纪录片各 8 个（4 + 4）。频道编号：首页 `0,1`、电影 `0,1,3`、电视剧 `0,1,4`、综艺 `0,1,5`、动漫 `0,1,6`、纪录片 `0,1,7`。轮播片名不得混进热播标签。
2. **最新上线**（任务 `latest`）：爱壹帆最近上架 + 光速、极速采集站各分类最近入库；采集站最新 6 部排最前，然后是爱壹帆，再是其余采集站作品；每个频道 24 部。海报、剧照、简介、评分用 TMDB（片名与年份必须对得上），没有 TMDB 时用采集站海报，爱壹帆的带水印图片不用，没有可用海报的不上。能对上片库的用作品编号和规范网址；片库没有、但对上了 TMDB 的由入库 Worker 建档（每次最多 20 部），对不上 TMDB 的只显示卡片，不建档。
3. **四大排序**（任务 `rankings`、`rankings-daily`）：添加时间、更新时间、人气、评分 × 6 个频道，顺序与爱壹帆一致，不置顶任何作品；关联不上片库的保留片名与年份，不分配编号。
4. **短剧首屏**（任务 `shorts`）：巨量资源短剧分类，排除特定子类与擦边词，不编造评分和演员。
5. **失败保留**：任何来源取不到或凑不满时保留上一次的结果，不用写死的兜底片单。每个任务的结果写入 `sync_state` 的 `job:<任务>`，后台仪表盘可看。
6. **频道大厅**：桌面 6 列网格（`grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6`），每页 24 部，总数按 D1 真实数量。卡片用深色一体底座（`bg-[#141416]/90 border border-white/5`），海报 `aspect-[2/3]`，下方片名一行、`年份 · 类型` 一行，悬停海报微放大并显示播放图标。

---

## 5. 内容安全（主站）

全站前台展示与片库必须遵守，统一由 `lib/data/entities/entity-utils.ts` 的 `isCleanChineseTitle` 判定，入库 Worker 的建档、最新上线、排序、短剧任务和 `app/api/library/browse` 都必须调用：

1. 片名含任何日文假名（`[぀-ゟ゠-ヿ]`）一律拦截，不管夹带多少汉字；不得写成 `test(kana) && !test(chinese)` 这种放行逻辑。
2. 片名必须含中文汉字；没有正式中文译名的纯外文条目不收。
3. 韩文字母（`[가-힯]`）一律拦截。
4. 成人与低俗词（`ADULT_BLACKLIST_WORDS`）一票否决。
5. 解说、速看、先导片、精彩片段、纯享版等非正片（`COMMENTARY_BLACKLIST_WORDS`）一票否决；动态漫画、网文改编漫剧不进动漫频道。

---

## 6. SEO / GEO 白帽规范

1. **结构化数据真实**：作品页只输出一个 `@graph`（`WebSite`、`WebPage`、`Movie` 或 `TVSeries`、`BreadcrumbList`），声明 `inLanguage: 'zh-CN'`、`isAccessibleForFree: true`，有 TMDB / 豆瓣 / IMDb 编号时放进 `sameAs`。不得编造评分人数，不得输出机械 `FAQPage`，页面没有内嵌可播视频时不得输出 `VideoObject`。
2. **可见内容真实**：年份、评分、画质、地区等没有数据就不显示，不得写默认值（如 `2024`、`8.5`、`4K`、`HDR10`、`5.1 环绕声`、`免VIP`）；线路列表不得按对照表标未经实测的画质，只对命中广告特征的源标「片头广告」。不得隐藏关键词、不得 Cloaking。
3. **索引控制**：`/player` 输出 noindex，`robots.txt` 放行它以便爬虫读到；搜索结果页（`?q=`）noindex；workers.dev 预览地址整站 noindex；没有作品的演员、导演、题材页 noindex 且不进站点地图；`/admin` 在 robots 里禁止。
4. **站点地图**：作品站点地图来自 D1 `sitemap_titles`（live、有海报、简介 ≥ 30 字、同名同年只留一部、规范网址），每天重算；`lastmod` 只用真实更新日期，不得每天写当天。
5. **关键词**：`lib/utils/seo-keyword-generator.ts` 生成长尾词，meta keywords 最多 5 个；不得出现网盘、迅雷、磁力等截流词；相关搜索内链指向规范页面，不指向 `/search?q=`。规则库：`docs/architecture/ikanpp_seo_keyword_system.yaml`、`lib/data/seo-rules/seo-keyword-system.ts`。
6. **推送**：不得使用 Google Indexing API（只适用于招聘与直播页）。IndexNow 只推有变化的网址：`npm run indexnow` 推首页与频道页；`/api/seo/indexnow` 只接受带 `CRON_SECRET` 的 POST，密钥从环境变量读取；后台只允许推 `https://www.ikanpp.com/` 下的网址。
7. **品牌**：原创评析统一署名「iKanPP 独家视点」「iKanPP 官方观影指南与答疑」；前台、DOM 属性、结构化数据里不得出现「AI 生成」「AI 独家解析」或内部调试用语。

---

## 7. 性能

1. **图片**：普通海外用户直连 TMDB；受限地区（CN、MM、RU、IR、BY、KP、SY、CU、VE、VN、ID、TM 等）走 `/api/img-proxy`，图片写进 R2 `img.ikanpp.com`；直连失败（`onError`）自动换成 `/api/img-proxy` 重试。尺寸：列表卡片 `w185` / `w342`，作品页主图 `w780`，大图 `w1280`，影人 `w185`；不得拉原图。R2 只存图片，不存视频。
2. **首屏不留白**：首页和频道页（`/`、`/movie`、`/tv`、`/anime`、`/variety`、`/documentary`、`/ranking`）的 Suspense 兜底不得用空白 `brand-spinner`，必须用 `HomePageSkeleton` / `CategoryHubSkeleton` 按真实数据直出大图、片名、播放按钮和热播标签；首屏大图用原生 `<picture>` / `<img>`（`fetchPriority="high"`、`decoding="sync"`，地址由 `getOptimizedImageUrl(…, { width: 1280 })` 生成，手机 500 宽），不用 Next/Image。
3. **预渲染**：`app/layout.tsx` 注入全站 Speculation Rules（频道页 `prerender`，`eagerness: 'moderate'`；作品页预取），并排除 `/admin*`。
4. **屏下内容**：首屏以下的货架、长文和演职员横轨用 `.below-fold-rail` / `.below-fold-section` 配合 `contain-intrinsic-size`。
5. **按需加载**：`FavoritesSidebar`、`WatchHistorySidebar`、`ResumePlayBubble`、搜索结果相关组件、首屏以下货架（直播预览、专题、特色条、个性推荐等）一律 `dynamic` 加载。
6. **Service Worker**：`public/sw.js` 安装时预缓存首页和频道页外壳，图片 Cache-First。
7. **演职员横轨**：用 `<CastRail />`，服务端只用已有数据渲染，缺的头像由客户端异步补；服务端渲染路径里不得等外部网络（不得加 `Promise.race` 超时截断）。

---

## 8. 播放：直连、换源与专线

1. **主站 100% 直连**：浏览器直接从第三方源站 CDN 拉 m3u8 与切片。主站播放器没有代理模式（2026-10-08 已删除 `proxyMode`、`useProxy` 与「复制代理链接」），不得请求 `/api/proxy`，不得调用 `processM3u8Content` 改写切片地址，不得经任何代理抢救死链；架构门禁检查 4b 拦截。某个源超时或死链时，唯一做法是前端自动换到下一条可用线路（按各地区实测成功率排序，`lib/api/default-sources.ts` 为默认采集站列表，手工维护）。
2. **术语**：本站不转码、不存储、不切片。「切片」指源站 m3u8 里的 `.ts` 片段（HLS 的 segment），不得说成本站在切片。
3. **存储**：观看记录、收藏、搜索记录、设置只有主站一套（`useHistoryStore`、`useFavoritesStore`、`useSearchHistoryStore`、`settingsStore`）。午夜特区的分库存储与片源已删除；旧版本留在主站记录里的午夜条目在加载时去掉（观看记录存储 v3），导入片源时跳过 `group: 'premium'`。
4. **防串台**：标题分析先去掉片尾粘连的 4 位年份（`/(19\d\d|20\d\d)$/`）；目标带副标题时候选也必须带同一副标题，不得因 `target.includes(cand)` 就给高分（短母题不得吞掉长子题）；期待电影时，类型为连续剧、电视剧、动漫或集数大于 2 的候选一律否决；播放器发现加载的是剧集而期待电影且缺副标题时，静默拉黑该线路并重新选线。
5. **暗影专线 (ShadowLine)**：作为冷门首发的第二层，同样由浏览器直连对端 CDN，请求带 `referrerPolicy="no-referrer"`；只在单集被点播时解析（结合缓存），不批量预抓；巡检加随机抖动；服务端握手带完整浏览器请求头；对端阻断时静默熔断并在前台隐藏，不得暴力重试。控制台 `/admin/shadowline`，密钥在前台脱敏显示，操作写审计日志。

---

## 9. 播放器红线

1. **引擎**：默认 `nextgen`（苹果设备用系统原生 HLS，其他设备用 hls.js），`xgplayer`、`legacy` 作回退，地址栏 `?engine=` 可切换。hls.js 配置只由 `lib/player/hls-config-factory.ts` 的 `createHlsConfig()` 生成。
2. **不得拨快时间轴**：任何卡顿检测里都不得执行 `currentTime += …` 或任何向前拨动；缓冲等待时只显示加载圈（`setIsLoading(true)`）。
3. **画面冻结看门狗例外（决策 D3）**：只在同时满足以下条件时，执行原地重定位 `video.currentTime = video.currentTime`：页面可见、未暂停、不在 seek、`readyState >= 3`、视频有分辨率、不在画中画、不在 AirPlay，且时钟前进超过 0.3 秒而 `totalVideoFrames` 连续 2 秒没有新帧。每集最多 3 次，间隔至少 10 秒。
4. **全屏不得用 3D 变换**：`<video>` 和直接容器不得有 `translateZ`、`scale`、`will-change: transform` 等；`<video>` 行内样式恒为 `transform: 'none'`；全屏事件里不得做 `scale(1.00001)` 之类抖动，进出全屏只重置 `v.style.transform = ''`；`video-player.css` 所有全屏选择器声明 `transform: none !important; will-change: auto !important;`。例外（决策 D1）：iPhone Safari 在 xgplayer 网页全屏时可旋转根容器 90°，系统原生全屏下仍不得有 transform。
5. **全屏不得用 `backdrop-filter`**：播放器内所有浮层（`DesktopOverlay`、`DesktopSpeedMenu`、`DesktopMoreMenu`、`InPlayerEpisodesDrawer`、`InPlayerSourceDrawer`、`NextEpisodeOverlay`、`KeyboardShortcutsModal`、`PlayerBrandLogo`、nextgen 组件、`.spinner-glass`、`.loading-overlay-glass`）不得出现 `backdrop-blur` 或 `backdropFilter`，用 `bg-[#141416]/95` 这类纯色深底。`:fullscreen *`、`:-webkit-full-screen *`、`.is-native-fullscreen *`、`::backdrop`、`::-webkit-backdrop` 必须各写一条规则，不得逗号合写。
6. **全屏容器透明**：`.kvideo-container` 的全屏状态恒为 `background: transparent !important`，黑底交给 `::backdrop`。全屏切换时不得读 `offsetHeight` 或 `getComputedStyle`，用 `requestVideoFrameCallback` / `requestAnimationFrame` 把 `opacity` 从 0.999 调回 1 唤醒合成层。
7. **缓冲水位**：识别 iPad 必须用 `checkIsIPadOS()`（`maxTouchPoints > 1` 且粗指针且支持触摸），不得只看 `maxTouchPoints`。桌面端 `maxBufferLength` ≥ 120 秒、`maxMaxBufferLength` ≥ 240 秒、`maxBufferSize` ≥ 120 MB、`backBufferLength` ≥ 60 秒、`fragLoadingTimeOut` ≥ 30000 ms、`fragLoadingMaxRetryTimeout` ≥ 60000 ms；移动端 60 秒 / 120 秒 / 60 MB，后向 25 秒。
8. **避免整树重渲染**：播放器容器只能用 selector 取 action（`useHistoryStore((s) => s.addToHistory)`），不得无 selector 订阅历史；传给播放器的回调用 `useCallback`。`VideoPlayer`、`CustomVideoPlayer`、`DesktopVideoPlayer`、`NextgenVideoPlayer` 必须 `React.memo` 导出。
9. **新版本自愈**：部署后旧页面加载旧脚本失败时，`isStaleBuildError` 识别后 `reloadForNewBuild` 刷新（`app/error.tsx`、`CustomVideoPlayer` 的动态加载、nextgen 的 hls.js 动态加载）。

---

## 10. 后台 `/admin`

1. **两道门**：Cloudflare Access 拦截 `/admin/*` 与 `/api/admin/*`（白名单邮箱 + 邮件验证码）；接口内再用 `verifyCloudflareAccess` 校验 Access 令牌（RS256、`aud`、邮箱白名单），不通过返回 401 / 403。
2. **功能**：仪表盘（D1 数量、入库任务状态、站点地图、数据集更新时间）、作品管理（D1 读写；下架即 `state = 'removed'` 并移出站点地图）、求片记录、暗影专线、各国打开速度（Analytics Engine，需 Worker 配置 `AE_API_TOKEN`）、IndexNow。
3. **审计**：所有修改写入 KV `admin:audit-log:*`，保留 90 天。
4. **与前台隔离**：robots 禁止 `/admin`，Speculation Rules 排除 `/admin*`，`Footer`、`MobileBottomNav`、`BackToTop` 在后台不渲染。后台只管主站，不碰 iKanX。

---

## 11. 工程流程

1. **检查**：提交前 `scripts/git-hooks/pre-commit` 自动跑 `scripts/test-architecture-integrity.mjs`；推送后 CI 跑类型检查（网站与入库 Worker）和 `npm run test:arch`（架构门禁、回归、SEO 白帽、作品页网址、专线匹配、线路排序、旧版本自愈、流地址清洗）。不得用 `--no-verify` 跳过。
2. **入库任务韧性**：每个任务单独 `try/catch`，一个来源出错不影响其他任务；失败时保留上一次结果。
3. **密钥**：不得把密钥写进代码或提交进仓库（仓库公开）。定时触发接口的口令只从环境变量读，未配置时一律拒绝；口令放请求头，不放网址参数。
4. **类型**：核心数据类型只定义在 `lib/types/`，脚本和 Worker 一律引用，不得重复声明。
5. **部署**：本机执行 `npm run deploy` 前把 `.env.local` 临时移开（里面的旧令牌没有 R2 权限），并用 `env -u CF_API_TOKEN -u CLOUDFLARE_API_TOKEN` 让 wrangler 用登录态；入库 Worker 用 `wrangler deploy --config workers/ikanpp-ingest/wrangler.jsonc` 部署（同样用登录态）。部署后检查首页、频道、作品页、站点地图与后台接口（未登录应跳 Access 登录）。
6. **文档**：改动播放调度、换源、网址规则、入库任务或数据结构时，同步更新本文件与 `docs/architecture/` 下对应文档（`dual-track-streaming-spec.md`、`global-performance-spec.md`）。
