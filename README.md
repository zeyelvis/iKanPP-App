# iKanPP

[www.ikanpp.com](https://www.ikanpp.com) 的网站代码。iKanPP 是面向海外华人的影视站：片库、作品页即播放页、频道与排行、短剧、电视直播。

本站不存储、不转码视频。播放时浏览器直接从第三方源站拉取 HLS 流（m3u8 与其中的 `.ts` 片段），本站只提供片库资料、线路调度和播放器。

> 工程规范在 [AGENTS.md](AGENTS.md)，改代码前请先读。本文件只介绍项目和日常操作。

---

## 功能

- **作品页即播放页**：`/title/ik000123-片名`，选集、换线路、续播都在作品页内完成；片库外的片源链接由 `/player` 播放。
- **频道与列表**：首页、电影、电视剧、动漫、综艺、纪录片、短剧、风云榜，另有专题、合集、演员、导演、题材页。
- **搜索**：多个采集站并行检索，结果合并去重。
- **线路调度**：按各地区实测成功率给线路排序，播放失败时前端自动换下一条线路；不经代理。
- **播放器**：默认 `nextgen` 引擎（苹果设备用系统原生 HLS，其他设备用 hls.js），`xgplayer`、`legacy` 可回退（地址加 `?engine=`）；支持片头广告过滤、自动下一集、跳过片头片尾。
- **电视直播**：`/iptv`。
- **本机数据**：收藏、观看记录、搜索记录、设置只存在用户自己的浏览器里，没有账号系统。
- **装到桌面**：PWA，iOS 另有描述文件安装方式。
- **后台**：`/admin`，由 Cloudflare Access 保护。

## 架构

| 部分 | 说明 |
|---|---|
| 网站 | Next.js 16，经 [OpenNext](https://opennext.js.org/cloudflare) 部署为 Cloudflare Worker `ikanpp-web`（配置见 `wrangler.jsonc`、`open-next.config.ts`）。页面用 ISR 定时刷新（首页与频道 5 分钟，作品页 1 小时）。 |
| 片库 | Cloudflare D1 `ikanpp-db`，唯一权威数据源。作品、网址片段、影人与演职关系、题材、站点地图清单，以及首页、最新上线、频道货架、四大排序等整份数据集（`documents` 表）。表结构见 `db/d1/`。 |
| 入库 | Worker `workers/ikanpp-ingest`，用 Cloudflare 定时器更新 D1：每小时第 23 分更新轮播与热播标签、最新上线、短剧首屏；第 43 分更新排序；北京时间 4 点重算人气、评分排序与站点地图。新作品只在这里建档、分配编号。 |
| 专线 | Worker `workers/ikanpp-core`（`ikanpp-core-worker`），提供专线解析 `/api/shadowline/resolve`、`/api/ikanpp-line`（主站 `next.config.ts` 转发）。 |
| KV | 只放小数据：求片记录、后台审计日志、专线配置、专题、线路排序。 |
| R2 | `ikanpp-next-cache`：页面增量缓存；`ikanpp-images`：图片镜像（`img.ikanpp.com`，受限地区经 `/api/img-proxy` 访问）。 |
| Analytics Engine | 播放成败（线路排序用）与各国打开速度。 |

## 目录

```
app/                  页面与接口（App Router）
  title/[slug]/       作品页（网址解析见 lib/data/d1/title-route.ts）
  api/                公开接口：detail、search-parallel、library/browse、img-proxy、beacon 等
  admin/              后台
components/           界面组件（player/ 为播放器）
lib/
  data/d1/            D1 读取：作品、网址解析、列表、站点地图
  data/entities/      片名规范化、内容安全过滤（isCleanChineseTitle）、规范网址生成
  player/             hls.js 配置等播放器基础代码
  server/             服务端工具（Cloudflare 绑定、KV、去重评分）
  store/              浏览器本地存储（收藏、观看记录、设置）
  types/              共享类型
db/d1/                D1 表结构与迁移
workers/ikanpp-ingest 入库 Worker
workers/ikanpp-core   专线 Worker
proxy.ts              请求入口：域名规范化、旧链接跳转、noindex 头
scripts/              测试、部署辅助、D1 导入工具
docs/architecture/    播放与性能规范
```

## 本地开发

需要 Node.js 22。

```bash
npm install
```

```bash
npm run dev
```

本地开发时 Cloudflare 绑定由 wrangler 在本机模拟，D1 是空库，所以页面没有片库数据，适合调界面和播放器。涉及数据的改动用下面的离线测试，或上线后在线上核对。

## 测试

```bash
npm run typecheck
```

```bash
npm run test:arch
```

`test:arch` 包含：架构门禁（播放器防黑屏与防卡顿红线、内容安全、主站不得走代理等）、历史缺陷回归、SEO 白帽检查、作品页网址解析（`npm run test:urls`，在内存 SQLite 里跑真实的解析逻辑）、专线匹配、线路排序、旧版本自愈、流地址清洗。

提交时 `scripts/git-hooks/pre-commit` 会自动跑架构门禁；推送后 GitHub Actions（`.github/workflows/ci.yml`）跑类型检查和 `test:arch`。

## 部署

部署需要有 Workers、D1、KV、R2 权限的 Cloudflare 登录态（`npx wrangler login`）。

网站：

```bash
npm run deploy
```

依次执行 OpenNext 构建、`scripts/drop-build-prerenders.mjs`（删掉构建期生成的空页面）和部署。只有代码改动需要部署，片库与列表数据由入库 Worker 直接写进 D1。

入库 Worker 与专线 Worker：

```bash
npx wrangler deploy --config workers/ikanpp-ingest/wrangler.jsonc
```

```bash
npx wrangler deploy --config workers/ikanpp-core/wrangler.toml
```

D1 表结构变更：在 `db/d1/` 新增编号文件后执行

```bash
npx wrangler d1 execute ikanpp-db --remote --file db/d1/<文件名>.sql
```

## 配置

密钥用 `wrangler secret put <名称>` 配置，不写进仓库。

| 名称 | 用在 | 说明 |
|---|---|---|
| `TMDB_API_KEY` | 网站、入库 Worker | TMDB 资料与图片 |
| `INGEST_SECRET` | 入库 Worker | 手动触发任务 `POST /run?job=<任务>` 的口令 |
| `CRON_SECRET` | 网站 | `/api/seo/indexnow` 推送口令；未配置时该接口拒绝请求 |
| `INDEXNOW_KEY` | 网站 | IndexNow 密钥 |
| `AE_API_TOKEN` | 网站 | 后台「各国打开速度」读取 Analytics Engine；未配置时页面显示提示 |
| `CF_ACCESS_AUD`、`CF_ACCESS_TEAM_DOMAIN`、`ADMIN_EMAILS` | 网站 | 后台接口校验 Cloudflare Access 令牌 |

公开配置：`NEXT_PUBLIC_SITE_URL`（站点地址，构建时写入，默认 `https://www.ikanpp.com`）。

默认采集站列表在 `lib/api/default-sources.ts`，手工维护。

## 文档

- [AGENTS.md](AGENTS.md)：工程规范（数据与编号、作品页网址、内容安全、SEO 白帽、性能、播放器红线、后台、工程流程）
- [docs/architecture/dual-track-streaming-spec.md](docs/architecture/dual-track-streaming-spec.md)：播放与换源
- [docs/architecture/global-performance-spec.md](docs/architecture/global-performance-spec.md)：图片与加载性能

## 联系

问题与版权投诉：contact@ikanpp.com

## 致谢与许可

本项目最初基于 [KuekHaoYang/KVideo](https://github.com/KuekHaoYang/KVideo)（MIT 许可证）开发，此后经过大幅改写。许可证见 [LICENSE](LICENSE)。
