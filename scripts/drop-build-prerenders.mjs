#!/usr/bin/env node
/**
 * 部署前删掉构建期预渲染的页面，让上线后第一次真实请求再渲染并缓存（OpenNext ISR）：
 * - 读 D1 的页面（首页、各频道、风云榜、短剧）：构建期没有数据库，渲染出来是空的（lib/data/d1/db.ts）；
 * - 其余静态页面（/about、/topic/… 等）：构建期条目带 x-nextjs-prerender 与分段预取数据，Next 16.3 起默认内联预取，
 *   OpenNext 不提供这些数据，浏览器会对页面上指向它们的链接反复预取（页脚链接在屏幕上时每秒十来次）；
 *   运行时渲染的页面只预取一次。
 * 只保留 Next 自己的 _not-found / _global-error，以及不读数据库的接口（robots.txt、sitemap-topics.xml 等）。
 *
 *   node scripts/drop-build-prerenders.mjs   （在 opennextjs-cloudflare build 之后、deploy 之前）
 */
import { existsSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const root = '.open-next/cache';
const builds = existsSync(root) ? readdirSync(root) : [];
if (builds.length !== 1) throw new Error(`${root} 里应只有一个构建，实际 ${builds.length} 个`);
const base = join(root, builds[0], 'route-cache');
if (!existsSync(join(base, 'APP_PAGE'))) throw new Error(`${base} 下没有 APP_PAGE：OpenNext 改了缓存目录结构？`);

// 读 D1 的接口（构建期数据为空）
const DB_ROUTES = new Set(['llms-full.txt']);
const KEEP_PAGES = new Set(['_not-found', '_global-error']);

const dropped = [];
for (const kind of ['APP_PAGE', 'APP_ROUTE']) {
  const dir = join(base, kind);
  if (!existsSync(dir)) continue;
  for (const file of readdirSync(dir, { recursive: true }).map(String)) {
    if (!file.endsWith('.cache')) continue;
    const route = file.split('/$/')[1]?.replace(/\.cache$/, '');
    if (!route) continue;
    const drop = kind === 'APP_PAGE' ? !KEEP_PAGES.has(route) : DB_ROUTES.has(route);
    if (!drop) continue;
    rmSync(join(dir, file));
    dropped.push(route);
  }
}
if (!dropped.includes('index') || !dropped.includes('movie')) throw new Error('没删到 index / movie 的构建期条目：缓存目录结构变了？');
console.log(`删掉构建期预渲染 ${dropped.length} 个：${dropped.join('、')}`);
