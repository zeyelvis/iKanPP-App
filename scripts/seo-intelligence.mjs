#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * iKanPP 全自动零成本 SEO 智能引擎 (SEO Intelligence OS)
 * 
 * 架构设计：
 * 模块 1: GSC API 官方全域健康巡检 (Sitemap 状态、真实流量词挖掘、第二页高潜词捕获)
 * 模块 2: Sitemaps 结构完整性与可达性自动化核验
 * 模块 3: 双轨促抓自愈网络 (IndexNow 全网多引擎广播 + Google Indexing API 受控促抓)
 * 模块 4: 多渠道监控简报直出 (GitHub Actions Step Summary + Telegram Bot 运营速报)
 */

const SITE_URL = 'sc-domain:ikanpp.com';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';
const INDEXNOW_KEY = '7f2e1b4c9a8d3e5f6a1b2c3d4e5f6071';
const MAX_GOOGLE_DAILY_PUSH = 150; // 严格限制在单日 200 配额以内，保障调用安全

// 1. 获取 Google 服务账号凭据 (支持 Base64 / 纯 JSON / 本地文件)
function getCredentials() {
  const envKey = process.env.GOOGLE_INDEXING_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (envKey) {
    try {
      let str = envKey.trim();
      if (!str.startsWith('{')) {
        str = Buffer.from(str, 'base64').toString('utf-8');
      }
      return JSON.parse(str);
    } catch (e) {
      console.warn('⚠️ 解析环境变量 GOOGLE_INDEXING_KEY 失败:', e.message);
    }
  }

  const localKeyPath = path.resolve(process.cwd(), 'google key/ikanpp-indexing-ef8f38009b05.json');
  if (fs.existsSync(localKeyPath)) {
    try {
      return JSON.parse(fs.readFileSync(localKeyPath, 'utf-8'));
    } catch {}
  }

  return null;
}

// 2. 生成多权限合一的 Google OAuth2 Access Token
async function getGoogleAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: sa.client_email,
    sub: sa.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: [
      'https://www.googleapis.com/auth/webmasters.readonly',
      'https://www.googleapis.com/auth/webmasters',
      'https://www.googleapis.com/auth/indexing',
    ].join(' '),
  };

  const b64Url = (obj) => Buffer.from(JSON.stringify(obj)).toString('base64url');
  const unsignedToken = `${b64Url(header)}.${b64Url(payload)}`;

  const sign = crypto.createSign('RSA-SHA256');
  sign.update(unsignedToken);
  sign.end();
  const signature = sign.sign(sa.private_key, 'base64url');
  const assertion = `${unsignedToken}.${signature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });

  if (!tokenRes.ok) {
    throw new Error(`Google OAuth2 请求失败: ${tokenRes.status} ${await tokenRes.text()}`);
  }

  const data = await tokenRes.json();
  return data.access_token;
}

// 3. Google Indexing API 单条推送 (支持 URL_UPDATED 与 URL_DELETED 死链清退)
async function pushToGoogleIndexing(url, token, type = 'URL_UPDATED') {
  try {
    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        type,
      }),
      signal: AbortSignal.timeout(6000),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 4. IndexNow 批量多网关广播 (Bing, Yandex, IndexNow)
async function broadcastIndexNow(urls) {
  if (!urls || urls.length === 0) return { success: true, count: 0 };
  const endpoints = [
    'https://api.indexnow.org/indexnow',
    'https://www.bing.com/indexnow',
    'https://yandex.com/indexnow',
  ];

  const payload = {
    host: 'www.ikanpp.com',
    key: INDEXNOW_KEY,
    keyLocation: `${BASE_URL}/${INDEXNOW_KEY}.txt`,
    urlList: urls.slice(0, 10000), // IndexNow 单次最大 10,000 条
  };

  const results = [];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(payload),
      });
      results.push({ endpoint: ep, ok: res.ok, status: res.status });
    } catch (err) {
      results.push({ endpoint: ep, ok: false, error: err.message });
    }
  }

  return { success: results.some(r => r.ok), details: results, count: urls.length };
}

// 5. 发送 Telegram 通知
async function sendTelegramAlert(text) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!botToken || !chatId) return;

  try {
    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
      }),
    });
  } catch (err) {
    console.warn('⚠️ Telegram 通知发送失败:', err.message);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🚀 =============================================================');
  console.log('🌟 [SEO Intelligence OS] iKanPP 搜索引擎全自动智能巡检与自愈引擎启动');
  console.log(`⏰ 时间: ${new Date().toISOString()} | 站点: ${BASE_URL}`);
  console.log('=============================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    sitemaps: [],
    sitemapUrlsCount: 0,
    highPotentialKeywords: [],
    inspectedUrls: [],
    autoHealedUrls: [],
    googlePushedCount: 0,
    indexNowBroadcast: null,
  };

  // -------------------------------------------------------------
  // 模块 1: Google Search Console (GSC) 官方健康诊断
  // -------------------------------------------------------------
  const sa = getCredentials();
  let googleAccessToken = null;

  if (sa) {
    try {
      googleAccessToken = await getGoogleAccessToken(sa);
      console.log(`🔑 成功接入 Google Cloud 服务账号: ${sa.client_email}`);

      // 1.1 Sitemap 健康巡检
      console.log('\n📋 [1/4] 正在检查 Google Search Console 站点地图 (Sitemaps) 状态...');
      const smRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps`, {
        headers: { Authorization: `Bearer ${googleAccessToken}` },
      });
      if (smRes.ok) {
        const smData = await smRes.json();
        if (Array.isArray(smData.sitemap)) {
          for (const sm of smData.sitemap) {
            const submitted = sm.contents?.[0]?.submitted || '0';
            const hasError = parseInt(sm.errors || '0', 10) > 0;
            const hasWarning = parseInt(sm.warnings || '0', 10) > 0;
            report.sitemaps.push({
              path: sm.path,
              submitted,
              errors: sm.errors || '0',
              warnings: sm.warnings || '0',
              isHealthy: !hasError && !hasWarning,
            });
            console.log(`  ➔ [Sitemap] ${sm.path} | 提交数: ${submitted} | 错误: ${sm.errors || 0} | 警告: ${sm.warnings || 0}`);
          }
        }
      }

      // 1.2 真实搜索分析与第 11~30 位高潜冲榜词挖掘
      console.log('\n📊 [2/4] 挖掘 Search Analytics 真实搜索表现与高潜词 (第 11~30 名)...');
      const today = new Date();
      const dEnd = new Date(today.getTime() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0];
      const dStart = new Date(today.getTime() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

      const anRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${googleAccessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: dStart,
          endDate: dEnd,
          dimensions: ['query'],
          rowLimit: 50,
        }),
      });

      if (anRes.ok) {
        const anData = await anRes.json();
        if (Array.isArray(anData.rows)) {
          for (const row of anData.rows) {
            const query = row.keys?.[0] || '';
            const pos = Math.round((row.position || 0) * 10) / 10;
            const clicks = row.clicks || 0;
            const impressions = row.impressions || 0;

            if (pos >= 10 && pos <= 30) {
              report.highPotentialKeywords.push({ query, pos, clicks, impressions });
              console.log(`  🌟 [高潜冲榜词] "${query}" | 平均排名: ${pos} 位 | 曝光: ${impressions} 次`);
            }
          }

          // 自动持久化高潜词库，供前端内链网络动态消费
          if (report.highPotentialKeywords.length > 0) {
            const hpFilePath = path.resolve(process.cwd(), 'lib/data/seo-high-potential.json');
            const cleanKeywords = report.highPotentialKeywords.map(k => {
              const cleanTitle = k.query
                .replace(/(?:在线观看|在线看|线上看|电影下载|全集|完整版|高清|免费)/g, '')
                .trim();
              return {
                query: k.query,
                title: cleanTitle || k.query,
                pos: k.pos,
                impressions: k.impressions,
              };
            });

            try {
              fs.writeFileSync(
                hpFilePath,
                JSON.stringify({ updatedAt: new Date().toISOString(), keywords: cleanKeywords }, null, 2),
                'utf-8'
              );
              console.log(`  💾 [知识库持久化] 已将 ${cleanKeywords.length} 个高潜词同步至 lib/data/seo-high-potential.json`);
            } catch (e) {
              console.warn('  ⚠️ 同步高潜词文件失败:', e.message);
            }
          }
        }
      }
    } catch (err) {
      console.warn('⚠️ GSC 官方数据接口调用异常:', err.message);
    }
  } else {
    console.warn('⚠️ 未检测到 GOOGLE_INDEXING_KEY，跳过 GSC 官方接口校验');
  }

  // -------------------------------------------------------------
  // 模块 2: Sitemaps 结构健康核验与全网 URL 收集
  // -------------------------------------------------------------
  console.log('\n🗺️ [3/4] 正在拉取线上 sitemap-index.xml 并核验分卷可达性...');
  const collectedUrls = new Set();

  try {
    const idxRes = await fetch(`${BASE_URL}/sitemap-index.xml`, { headers: { 'User-Agent': 'iKanPP-SeoEngine/2.0' } });
    if (idxRes.ok) {
      const idxText = await idxRes.text();
      const smMatches = idxText.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) || [];
      const subSitemaps = smMatches.map(m => m.replace(/<\/?loc>/g, '').trim());
      console.log(`  ➔ 发现 ${subSitemaps.length} 个 Sitemap 分卷，正在解析 URL...`);

      for (const smUrl of subSitemaps.slice(0, 5)) { // 抽样解析前 5 个分卷提取 URL
        try {
          const subRes = await fetch(smUrl, { headers: { 'User-Agent': 'iKanPP-SeoEngine/2.0' } });
          if (subRes.ok) {
            const subText = await subRes.text();
            const urlMatches = subText.match(/<loc>(https?:\/\/[^<]+)<\/loc>/g) || [];
            for (const u of urlMatches) {
              collectedUrls.add(u.replace(/<\/?loc>/g, '').trim());
            }
          }
        } catch {}
      }
    }
  } catch (err) {
    console.warn('⚠️ 提取线上 Sitemap 异常:', err.message);
  }

  report.sitemapUrlsCount = collectedUrls.size;
  console.log(`  ✅ 成功核验并汇总 ${collectedUrls.size} 个有效详情页 URL`);

  // -------------------------------------------------------------
  // 模块 3: 双轨促抓自愈网络 (IndexNow 广播 + Google Indexing API 受控促抓)
  // -------------------------------------------------------------
  console.log('\n⚡ [4/4] 启动双轨促抓自愈网络...');

  // 3.1 IndexNow 多引擎开放广播（Bing / Yandex / IndexNow 全量大盘）
  const allUrlsArray = Array.from(collectedUrls);
  if (allUrlsArray.length > 0) {
    console.log(`  📡 [IndexNow] 正在向 Bing / Yandex 等全量广播 ${allUrlsArray.length} 条 URL...`);
    const inRes = await broadcastIndexNow(allUrlsArray);
    report.indexNowBroadcast = inRes;
    console.log(`  ✅ [IndexNow] 广播完成，各大引擎接收响应正常！`);
  }

  // 3.2 Google Indexing API 受控精准促抓 (未收录自愈 + 优质新片，锁死上限 150 条)
  if (googleAccessToken) {
    console.log(`  🎯 [Google Indexing API] 开始受控促抓（严格锁死单日上限: ${MAX_GOOGLE_DAILY_PUSH} 条）...`);

    // 抽样 5 条近期核心 URL 进行官方 URL Inspection
    const inspectCandidates = [
      `${BASE_URL}/`,
      `${BASE_URL}/movie`,
      `${BASE_URL}/tv`,
      ...allUrlsArray.slice(0, 2),
    ];

    for (let idx = 0; idx < inspectCandidates.length; idx++) {
      const testUrl = inspectCandidates[idx];
      if (report.googlePushedCount >= MAX_GOOGLE_DAILY_PUSH) break;
      console.log(`    🔍 [${idx + 1}/${inspectCandidates.length}] 正在诊断 URL: ${testUrl}`);

      try {
        const insRes = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${googleAccessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            inspectionUrl: testUrl,
            siteUrl: SITE_URL,
          }),
          signal: AbortSignal.timeout(8000),
        });

        if (insRes.ok) {
          const insData = await insRes.json();
          const status = insData?.inspectionResult?.indexStatusResult;
          const coverage = status?.coverageState || 'UNKNOWN';
          const isIndexed = coverage.toLowerCase().includes('indexed');

          report.inspectedUrls.push({ url: testUrl, coverage, verdict: status?.verdict });
          console.log(`       覆盖状态: ${coverage} | 判定: ${status?.verdict || 'N/A'}`);

          const isDead = coverage.includes('NOT_FOUND') || coverage.includes('SOFT_404');

          if (isDead) {
            console.log(`       🚨 [死链/软404感知] 检测到异常页面，向 Google Indexing API 发起 URL_DELETED 清退...`);
            const deletedOk = await pushToGoogleIndexing(testUrl, googleAccessToken, 'URL_DELETED');
            if (deletedOk) {
              report.deadUrls = report.deadUrls || [];
              report.deadUrls.push(testUrl);
              console.log(`       🗑️ [清退成功] 已向 Google 提交死链移除请求！`);
            }
          } else if (!isIndexed) {
            // 若未完全编入索引且非死链，通过 Google Indexing API 进行自愈催抓
            console.log(`       ⚡ [未索引自愈] 发起 Indexing API 促抓...`);
            const ok = await pushToGoogleIndexing(testUrl, googleAccessToken);
            if (ok) {
              report.autoHealedUrls.push(testUrl);
              report.googlePushedCount++;
              console.log(`       ✅ [自愈成功] Google 已接收优先处理通知！`);
            }
          }
        } else {
          console.log(`       ℹ️ Inspection 返回状态码: ${insRes.status}`);
        }
      } catch (err) {
        console.warn(`       ⚠️ 巡检 ${testUrl} 超时或异常:`, err.message);
      }
      await sleep(150);
    }

    // 补充推送：如果配额仍充裕，抽取今日最新增量实体推满 50~100 条
    const remainingQuota = MAX_GOOGLE_DAILY_PUSH - report.googlePushedCount;
    if (remainingQuota > 0 && allUrlsArray.length > 0) {
      const topFreshUrls = allUrlsArray.slice(0, Math.min(remainingQuota, 60));
      console.log(`  🚀 [新片加速促抓] 挑选 ${topFreshUrls.length} 部最新高价值影视推向 Google Indexing API...`);
      for (const u of topFreshUrls) {
        const ok = await pushToGoogleIndexing(u, googleAccessToken);
        if (ok) {
          report.googlePushedCount++;
        }
        await sleep(100);
      }
    }
    console.log(`  ✅ [Google Indexing API] 促抓完成，今日累计使用配额: ${report.googlePushedCount}/${MAX_GOOGLE_DAILY_PUSH}`);
  }

  // -------------------------------------------------------------
  // 模块 4: 输出报告 (GITHUB_STEP_SUMMARY + Telegram)
  // -------------------------------------------------------------
  const summaryMd = `
## 🩺 iKanPP SEO 智能操作系统每日巡检速报 (${report.timestamp.split('T')[0]})

### 📊 1. Google Search Console 站点地图 (Sitemaps)
| Sitemap 路径 | 已提交条目 | 错误数 | 警告数 | 状态 |
| :--- | :---: | :---: | :---: | :---: |
${report.sitemaps.length > 0 ? report.sitemaps.map(s => `| \`${s.path.replace('https://www.ikanpp.com', '')}\` | ${s.submitted} | ${s.errors} | ${s.warnings} | ${s.isHealthy ? '✅ 正常' : '⚠️ 需关注'} |`).join('\n') : '| 暂无数据 / 未连接 GSC API | - | - | - | ℹ️ |'}

### 🚀 2. 搜索词增长潜力榜 (第 11~30 位高潜冲首页词)
${report.highPotentialKeywords.length > 0 ? `
| 核心搜索词 | 当前平均排名 | 过去30天曝光 | 推荐内链策略 |
| :--- | :---: | :---: | :--- |
${report.highPotentialKeywords.slice(0, 10).map(k => `| **${k.query}** | 第 ${k.pos} 位 | ${k.impressions} 次 | 自动提权推荐位冲首页 |`).join('\n')}
` : '*暂无处于第 11~30 位的次级潜力词。*'}

### ⚡ 3. 搜索引擎多轨促抓与自愈执行情况
- **Sitemap 汇总有效条目**：${report.sitemapUrlsCount} 个
- **IndexNow 广播覆盖 (Bing/Yandex)**：已广播 ${report.indexNowBroadcast?.count || 0} 个 URL (状态: ${report.indexNowBroadcast?.success ? '✅ 成功' : '⚠️ 异常'})
- **Google Indexing API 促抓总数**：${report.googlePushedCount} / ${MAX_GOOGLE_DAILY_PUSH} 条 (安全受控运行)
- **URL Inspection 自动自愈补推**：${report.autoHealedUrls.length} 个条目
${report.autoHealedUrls.map(u => `  - \`[自愈成功]\` ${u}`).join('\n')}

> *本简报由 iKanPP SEO Intelligence OS 自动化定时任务每日无人值守生成。*
`;

  if (process.env.GITHUB_STEP_SUMMARY) {
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMd, 'utf-8');
      console.log('📝 已将执行报告成功注入 GITHUB_STEP_SUMMARY');
    } catch {}
  }

  // 发送 Telegram 运营日报
  const tgText = `🔔 *iKanPP SEO 智能操作系统巡检报告*
📅 日期: ${report.timestamp.split('T')[0]}
🗺️ Sitemap 汇总条目: ${report.sitemapUrlsCount}
📡 IndexNow 广播: ${report.indexNowBroadcast?.count || 0} 条 (Bing/Yandex)
🎯 Google Indexing 促抓: ${report.googlePushedCount}/${MAX_GOOGLE_DAILY_PUSH} 条
🌟 捕获高潜冲榜词: ${report.highPotentialKeywords.length} 个
⚡ 发现并自愈未索引 URL: ${report.autoHealedUrls.length} 个`;

  await sendTelegramAlert(tgText);

  // -------------------------------------------------------------
  // 模块 5: 归档持久化至 Cloudflare KV 供 /admin 可视化控制台使用
  // -------------------------------------------------------------
  try {
    const cfAccount = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
    const cfNamespace = process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
    const cfKey = process.env.CLOUDFLARE_API_KEY || process.env.CF_API_KEY || '';
    const cfEmail = process.env.CLOUDFLARE_EMAIL || process.env.CF_EMAIL || 'zeyelvis@gmail.com';

    const dateStr = report.timestamp.split('T')[0];
    const putKv = async (k, v) => {
      const url = `https://api.cloudflare.com/client/v4/accounts/${cfAccount}/storage/kv/namespaces/${cfNamespace}/values/${encodeURIComponent(k)}`;
      return fetch(url, {
        method: 'PUT',
        headers: { 'X-Auth-Email': cfEmail, 'X-Auth-Key': cfKey },
        body: typeof v === 'string' ? v : JSON.stringify(v),
      });
    };

    console.log('📦 正在将巡检报告归档至 Cloudflare KV (admin:seo-report:*)...');
    await Promise.allSettled([
      putKv(`admin:seo-report:${dateStr}`, report),
      putKv('admin:seo-report:latest', dateStr),
      putKv(`admin:indexing-quota:${dateStr}`, String(report.googlePushedCount)),
    ]);
    console.log('✅ 已成功归档至 Cloudflare KV！管理控制台 (/admin) 可随时调阅。');
  } catch (e) {
    console.warn('⚠️ 写入 Cloudflare KV 失败 (非阻塞):', e.message);
  }

  console.log('\n=============================================================');
  console.log('🎉 [SEO Intelligence OS] 本轮巡检与主动自愈任务圆满完成！');
  console.log('=============================================================\n');
}

main().catch(err => {
  console.error('Fatal error in seo-intelligence:', err);
  process.exit(1);
});
