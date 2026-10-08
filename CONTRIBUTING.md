# 参与开发

这个仓库是 www.ikanpp.com 的线上代码，由站长维护。欢迎通过 Issue 报告问题；如果提交改动，请按以下要求。

## 改动前

- 先读 [AGENTS.md](AGENTS.md)：数据与编号、作品页网址、内容安全、SEO 白帽、播放器红线等规则都在里面，违反的改动不会合并。
- 本地环境与常用命令见 [README.md](README.md)。

## 提交前

```bash
npm run typecheck
```

```bash
npm run test:arch
```

- 提交时 pre-commit 钩子会自动跑架构门禁（`scripts/test-architecture-integrity.mjs`），不要用 `--no-verify` 跳过。
- 改了作品页网址、`getTitleCanonicalHref`、`generateSlug` 或 `lib/data/d1/title-route.ts`，另跑 `npm run test:urls`。
- 改了播放调度、换源、网址规则、入库任务或数据结构，同步更新 AGENTS.md 与 `docs/architecture/` 下对应文档。
- 不要提交密钥、`.env*` 文件或本地数据文件。

## 提交信息

一行概括改了什么（可加类型前缀，如 `fix:`、`feat:`、`refactor:`），正文说明原因和影响。
