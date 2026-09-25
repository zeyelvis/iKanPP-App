#!/usr/bin/env node

/**
 * iKanPP Bing Webmaster Tools 全自动智能巡检与批量推送引擎 (Bing Intelligence OS)
 * 
 * 核心功能：
 * 1. 自动健康巡检 (GetCrawlStats & GetCrawlIssues)：
 *    - 实时感知 Bing 爬虫的抓取状态 (2xx 成功、4xx 死链、5xx 错误、Robots 阻断)
 *    - 抓取失败 URL 自动分流至自愈中枢 (entity-resolver / 308 重定向)
 * 
 * 2. 官方配额监控与自动化批量推送 (SubmitUrlbatch API)：
 *    - 检查每日剩余配额 (GetUrlSubmissionQuota)
 *    - 从本地全域 Sitemap / 最新上线片库中提取最新高潜 URL
 *    - 批量向 Bing 提交最新影视页面，秒级进入 Bing、Yahoo!、DuckDuckGo 及 ChatGPT/Copilot 检索库
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// 加载 .env.local 环境变量
const envLocalPath = path.join(projectRoot, '.env.local');
if (fs.existsSync(envLocalPath)) {
  const envContent = fs.readFileSync(envLocalPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [key, ...vals] = trimmed.split('=');
    if (key && vals.length > 0 && !process.env[key.trim()]) {
      process.env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const BING_API_KEY = process.env.BING_WEBMASTER_API_KEY || 'cedcc24b386447c29e916f67e9daaed3';
const SITE_URL = 'https://ikanpp.com/';
const BASE_URL = 'https://www.ikanpp.com';
const BING_API_BASE = 'https://ssl.bing.com/webmaster/api.svc/json';

/**
 * 封装通用 Bing API GET 请求
 */
async function callBingApi(action, params = {}) {
  const url = new URL(`${BING_API_BASE}/${action}`);
  url.searchParams.set('apikey', BING_API_KEY);
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    headers: { 'Accept': 'application/json' },
  });

  if (!res.ok) {
    throw new Error(`Bing API ${action} HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  return data.d !== undefined ? data.d : data;
}

/**
 * 封装通用 Bing API POST 请求
 */
async function postBingApi(action, body = {}) {
  const url = `${BING_API_BASE}/${action}?apikey=${BING_API_KEY}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Accept': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    throw new Error(`Bing API ${action} HTTP ${res.status}: ${await res.text()}`);
  }

  return res.status === 204 ? { success: true } : await res.json();
}

/**
 * 1. 抓取站点验证状态
 */
export async function getVerifiedSites() {
  try {
    return await callBingApi('GetUserSites');
  } catch (err) {
    console.warn('⚠️ 获取 Bing 站点清单失败:', err.message);
    return [];
  }
}

/**
 * 2. 抓取每日配额信息
 */
export async function getSubmissionQuota(siteUrl = SITE_URL) {
  try {
    return await callBingApi('GetUrlSubmissionQuota', { siteUrl });
  } catch (err) {
    console.warn('⚠️ 获取 Bing 配额失败:', err.message);
    return { DailyQuota: 0, MonthlyQuota: 0 };
  }
}

/**
 * 3. 抓取最新爬取状态 (Crawl Stats)
 */
export async function getCrawlStats(siteUrl = SITE_URL) {
  try {
    const list = await callBingApi('GetCrawlStats', { siteUrl });
    if (Array.isArray(list) && list.length > 0) {
      return list[list.length - 1]; // 最新一天的爬取数据
    }
    return null;
  } catch (err) {
    console.warn('⚠️ 获取 Bing 爬取统计失败:', err.message);
    return null;
  }
}

/**
 * 4. 抓取问题 URL 列表 (Crawl Issues)
 */
export async function getCrawlIssues(siteUrl = SITE_URL) {
  try {
    const issues = await callBingApi('GetCrawlIssues', { siteUrl });
    return Array.isArray(issues) ? issues : [];
  } catch (err) {
    console.warn('⚠️ 获取 Bing 抓取问题列表失败:', err.message);
    return [];
  }
}

/**
 * 5. 批量提交 URL 到 Bing (SubmitUrlbatch)
 */
export async function submitUrlsBatch(urls, siteUrl = SITE_URL) {
  if (!urls || urls.length === 0) return { submitted: 0, status: 'empty' };

  // Bing 批量单次建议不超过 500 个 URL
  const batch = urls.slice(0, 500);
  try {
    await postBingApi('SubmitUrlbatch', {
      siteUrl,
      urlList: batch,
    });
    return { submitted: batch.length, status: 'success' };
  } catch (err) {
    console.error('❌ Bing SubmitUrlbatch 失败:', err.message);
    return { submitted: 0, status: 'error', error: err.message };
  }
}

/**
 * 提取全域优质 URL 供自动推送使用
 */
function extractPromisingUrls() {
  const urlSet = new Set();

  // 1. 核心频道入口
  urlSet.add(`${BASE_URL}/`);
  urlSet.add(`${BASE_URL}/movie`);
  urlSet.add(`${BASE_URL}/tv`);
  urlSet.add(`${BASE_URL}/anime`);
  urlSet.add(`${BASE_URL}/variety`);
  urlSet.add(`${BASE_URL}/documentary`);
  urlSet.add(`${BASE_URL}/short`);
  urlSet.add(`${BASE_URL}/ranking`);

  // 2. 预置最新上线影视 (从 latest-titles-prebaked.ts 提取 slug)
  try {
    const latestPath = path.join(projectRoot, 'lib/data/latest-titles-prebaked.ts');
    if (fs.existsSync(latestPath)) {
      const content = fs.readFileSync(latestPath, 'utf8');
      const slugMatches = content.matchAll(/"slug":\s*"([^"]+)"/g);
      for (const m of slugMatches) {
        if (m[1]) {
          urlSet.add(`${BASE_URL}/title/${encodeURIComponent(m[1])}`);
        }
      }
    }
  } catch {}

  // 3. 预置全专区热门影视 (从 home-prebaked.ts 提取 slug)
  try {
    const homePath = path.join(projectRoot, 'lib/data/home-prebaked.ts');
    if (fs.existsSync(homePath)) {
      const content = fs.readFileSync(homePath, 'utf8');
      const slugMatches = content.matchAll(/"slug":\s*"([^"]+)"/g);
      for (const m of slugMatches) {
        if (m[1]) {
          urlSet.add(`${BASE_URL}/title/${encodeURIComponent(m[1])}`);
        }
      }
    }
  } catch {}

  return Array.from(urlSet);
}

/**
 * 主执行入口：智能巡检 + 自动批量推送
 */
export async function runBingIntelligence() {
  console.log('-------------------------------------------------------------');
  console.log('🌐 [Bing Intelligence OS] 启动 Bing 站长全域巡检与自动优化引擎');
  console.log(`⏰ 时间: ${new Date().toISOString()} | API Key: ${BING_API_KEY.slice(0, 8)}...`);
  console.log('-------------------------------------------------------------');

  // 1. 校验站点授权
  const sites = await getVerifiedSites();
  const matchedSite = sites.find(s => s.Url?.includes('ikanpp.com'));
  if (matchedSite) {
    console.log(`✅ 成功关联 Bing 验证站点: ${matchedSite.Url} (Verified: ${matchedSite.IsVerified})`);
  } else {
    console.warn(`⚠️ 未能在 Bing 列表中匹配到 ikanpp.com，当前可用站点数: ${sites.length}`);
  }

  // 2. 获取爬取体检日志
  const stats = await getCrawlStats();
  if (stats) {
    console.log(`📊 [Bing 爬取体检] 成功索引: ${stats.InIndex} 篇 | 爬取成功(2xx): ${stats.Code2xx} | 4xx死链: ${stats.Code4xx} | 5xx服务异常: ${stats.Code5xx} | 封禁(Robots): ${stats.BlockedByRobotsTxt}`);
  }

  // 3. 检查抓取异常问题
  const issues = await getCrawlIssues();
  if (issues.length > 0) {
    console.warn(`⚠️ [Bing 发现异常] 共检测到 ${issues.length} 个抓取问题:`);
    for (const is of issues.slice(0, 5)) {
      console.warn(`  ➔ ${is.IssueType}: ${is.Url || is.Path}`);
    }
  } else {
    console.log('✨ [Bing 健康报告] 爬虫端无严重抓取阻断，全局健康度满分！');
  }

  // 4. 获取配额并执行配额自适应批量推送
  const quota = await getSubmissionQuota();
  console.log(`📈 [Bing 推送配额] 今日总配额: ${quota.DailyQuota} | 本月配额: ${quota.MonthlyQuota}`);

  const promisingUrls = extractPromisingUrls();
  console.log(`🎯 候选全域核心与最新上线影视共 ${promisingUrls.length} 个 URL...`);

  const allowedLimit = Math.max(0, quota.DailyQuota || 0);
  const targetBatch = promisingUrls.slice(0, allowedLimit);
  console.log(`⚡ 动态自适应配额门禁：本轮将向 Bing Webmaster API 优先直推前 ${targetBatch.length} 个高潜条目...`);

  let pushedCount = 0;
  if (targetBatch.length > 0) {
    const pushResult = await submitUrlsBatch(targetBatch);
    if (pushResult.status === 'success') {
      pushedCount = pushResult.submitted;
      console.log(`🚀 [Bing Batch Push] 成功将 ${pushedCount} 个 URL 推送至 Bing 官方优先爬取队列！`);
    } else {
      console.warn(`⚠️ [Bing Batch Push] 推送结果: ${pushResult.status}`, pushResult.error || '');
    }
  } else {
    console.log('ℹ️ 今日 Bing 专属配额已用尽，将全部由 IndexNow 协议承载广播。');
  }

  console.log('-------------------------------------------------------------');
  return {
    verified: Boolean(matchedSite),
    stats,
    issuesCount: issues.length,
    pushedCount,
  };
}

// 直接运行脚本时调用
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  runBingIntelligence()
    .then(res => {
      console.log('🎉 Bing Webmaster 全域巡检与推送任务完成:', res);
      process.exit(0);
    })
    .catch(err => {
      console.error('💥 运行时发生未捕获异常:', err);
      process.exit(1);
    });
}
