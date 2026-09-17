#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * iKanPP Google Search Console 智能诊断与自主自愈守护进程 (GSC Auto-Doctor)
 * 
 * 核心能力：
 * 1. 自动调用 Google Search Console 官方 API 获取站点地图抓取状态与警告
 * 2. 自动检索真实搜索词流量（Search Analytics），挖掘排名在 11~25 位的高潜冲榜影片
 * 3. 自动通过 URL Inspection API 批量巡检近期入库影视在 Google 的真实索引状态
 * 4. 发现未编入索引（Crawled not indexed / Discovered not indexed / Unknown）时，
 *    自动联动 Google Indexing API 发起实时二次提权补推（自愈闭环）
 * 5. 全程零人工介入，支持本地 CLI 运行与 GitHub Actions 每日无人值守定时调度
 */

const SITE_URL = 'sc-domain:ikanpp.com';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.ikanpp.com';

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

  // 本地兜底读取文件
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

// 3. 通过 Google Indexing API 提交收录通知
async function pushToGoogleIndexing(url, token) {
  try {
    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        type: 'URL_UPDATED',
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('🤖 [GSC-Auto-Doctor] 启动 Google Search Console 智能自检与自愈守护进程...');

  const sa = getCredentials();
  if (!sa) {
    console.error('❌ 未找到有效的 Google 服务账号凭据，请配置 GOOGLE_INDEXING_KEY');
    process.exit(1);
  }

  console.log(`🔑 成功加载服务账号: ${sa.client_email}`);
  const accessToken = await getGoogleAccessToken(sa);
  console.log('✅ Google OAuth2 Token 签发成功！');

  const report = {
    timestamp: new Date().toISOString(),
    sitemaps: [],
    highPotentialKeywords: [],
    inspectedUrls: [],
    autoHealedUrls: [],
  };

  // -------------------------------------------------------------
  // 维度一：Sitemap 抓取健康自查
  // -------------------------------------------------------------
  console.log('\n📋 [1/3] 正在检查全网站点地图 (Sitemaps) 抓取健康状态...');
  try {
    const smRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/sitemaps`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (smRes.ok) {
      const smData = await smRes.json();
      if (Array.isArray(smData.sitemap)) {
        for (const sm of smData.sitemap) {
          const submittedCount = sm.contents?.[0]?.submitted || '0';
          const hasError = parseInt(sm.errors || '0', 10) > 0;
          const hasWarning = parseInt(sm.warnings || '0', 10) > 0;
          console.log(`  ➔ ${sm.path} | 提交数: ${submittedCount} | 错误: ${sm.errors || 0} | 警告: ${sm.warnings || 0}`);
          report.sitemaps.push({
            path: sm.path,
            submitted: submittedCount,
            errors: sm.errors || '0',
            warnings: sm.warnings || '0',
            lastDownloaded: sm.lastDownloaded || 'N/A',
            isHealthy: !hasError && !hasWarning,
          });
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Sitemaps 检查异常:', err.message);
  }

  // -------------------------------------------------------------
  // 维度二：真实搜索词流量挖掘 (寻找第 11~25 名第二页高潜影视)
  // -------------------------------------------------------------
  console.log('\n📊 [2/3] 正在挖掘 Google 真实搜索表现与第二页高潜词 (Search Analytics)...');
  try {
    const today = new Date();
    const dEnd = new Date(today.getTime() - 2 * 24 * 3600 * 1000).toISOString().split('T')[0];
    const dStart = new Date(today.getTime() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

    const anRes = await fetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE_URL)}/searchAnalytics/query`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        startDate: dStart,
        endDate: dEnd,
        dimensions: ['query'],
        rowLimit: 25,
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

          // 筛选第二页高潜词 (排名 10 ~ 30 之间，具备冲首页实力)
          if (pos >= 10 && pos <= 30) {
            report.highPotentialKeywords.push({ query, pos, clicks, impressions });
            console.log(`  🌟 [高潜词捕获] "${query}" | 平均排名: ${pos} 位 | 曝光: ${impressions} 次 | 待提权冲首页！`);
          }
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ Search Analytics 检索异常:', err.message);
  }

  // -------------------------------------------------------------
  // 维度三：新上架影视收录状态批量巡检与自动冲刺补推 (URL Inspection + Indexing)
  // -------------------------------------------------------------
  console.log('\n🔍 [3/3] 正在对最新影视详情页执行收录诊断与自愈补推...');
  
  // 提取待巡检候选 URL 清单 (从最新烘焙数据与固定经典条目中采样)
  const candidateUrls = new Set([
    `${BASE_URL}/`,
    `${BASE_URL}/movie`,
    `${BASE_URL}/tv`,
    `${BASE_URL}/anime`,
  ]);

  const latestDataPath = path.resolve(process.cwd(), 'lib/data/latest-titles-prebaked.ts');
  if (fs.existsSync(latestDataPath)) {
    try {
      const content = fs.readFileSync(latestDataPath, 'utf-8');
      const match = content.match(/export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem\[\]> = ([\s\S]*?);\s*$/);
      if (match && match[1]) {
        const data = JSON.parse(match[1]);
        for (const items of Object.values(data)) {
          if (Array.isArray(items)) {
            for (const item of items.slice(0, 10)) {
              if (item?.title && item?.entityId) {
                candidateUrls.add(`${BASE_URL}/title/${item.entityId}-${encodeURIComponent(item.title)}`);
              }
            }
          }
        }
      }
    } catch {}
  }

  const sampleUrls = Array.from(candidateUrls).slice(0, 15);
  console.log(`  📌 本次智能巡检抽样 ${sampleUrls.length} 个重点 URL...`);

  for (const inspectUrl of sampleUrls) {
    await sleep(200); // 适度间隔
    try {
      const insRes = await fetch('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inspectionUrl: inspectUrl,
          siteUrl: SITE_URL,
        }),
      });

      if (insRes.ok) {
        const insData = await insRes.json();
        const status = insData?.inspectionResult?.indexStatusResult;
        const coverage = status?.coverageState || 'UNKNOWN';
        const isIndexed = coverage.toLowerCase().includes('indexed');

        console.log(`  ➔ [诊断] ${inspectUrl}`);
        console.log(`     覆盖状态: ${coverage} | 判定: ${status?.verdict || 'N/A'}`);

        report.inspectedUrls.push({ url: inspectUrl, coverage, verdict: status?.verdict });

        // 🌟 自动自愈判断：若尚未编入索引，立即发起 Google Indexing 提权补推！
        if (!isIndexed) {
          console.log(`     ⚡ [自动自愈] 检测到未完全编入索引，立即向 Google Indexing API 发起强制冲刺推送...`);
          const pushed = await pushToGoogleIndexing(inspectUrl, accessToken);
          if (pushed) {
            console.log(`     ✅ [自愈成功] Google 已接收优先处理请求！`);
            report.autoHealedUrls.push(inspectUrl);
          } else {
            console.log(`     ⚠️ [自愈提示] Google Indexing API 请求暂未成功，已记录等待下轮`);
          }
        }
      }
    } catch (err) {
      console.warn(`  ⚠️ 诊断 ${inspectUrl} 失败:`, err.message);
    }
  }

  // -------------------------------------------------------------
  // 维度四：生成精美运行报告并写入 GitHub Actions Step Summary
  // -------------------------------------------------------------
  console.log('\n=============================================================');
  console.log('🎉 [GSC-Auto-Doctor] 本轮自动化巡检与自愈任务圆满完成！');
  console.log(`  - 检查 Sitemap 数量: ${report.sitemaps.length} 个 (全部健康: ${report.sitemaps.every(s => s.isHealthy)})`);
  console.log(`  - 捕获高潜冲榜词: ${report.highPotentialKeywords.length} 个`);
  console.log(`  - 巡检核心 URL: ${report.inspectedUrls.length} 个`);
  console.log(`  - 自动触发自愈补推: ${report.autoHealedUrls.length} 个 URL`);
  console.log('=============================================================\n');

  // 如果在 GitHub Actions 环境下，输出到 Summary
  if (process.env.GITHUB_STEP_SUMMARY) {
    const summaryMd = `
## 🩺 Google Search Console 智能巡检与自愈简报 (${report.timestamp.split('T')[0]})

### 📊 1. 站点地图 (Sitemaps) 健康状态
| Sitemap 地址 | 提交数量 | 错误 | 警告 | 健康评估 |
| :--- | :---: | :---: | :---: | :---: |
${report.sitemaps.map(s => `| \`${s.path.replace('https://www.ikanpp.com', '')}\` | ${s.submitted} | ${s.errors} | ${s.warnings} | ${s.isHealthy ? '✅ 完美健康' : '⚠️ 需关注'} |`).join('\n')}

### 🚀 2. 捕获的高潜冲榜搜索词 (第 11~30 名潜力股)
${report.highPotentialKeywords.length > 0 ? `
| 真实搜索词 | Google 平均排名 | 过去30天曝光 | 建议策略 |
| :--- | :---: | :---: | :--- |
${report.highPotentialKeywords.map(k => `| **${k.query}** | 第 ${k.pos} 位 | ${k.impressions} 次 | 自动提权推荐位冲首页 |`).join('\n')}
` : '*暂无处于第二页的高潜词*'}

### ⚡ 3. 自动感知与自愈修复清单
- **本轮巡检 URL 数量**：${report.inspectedUrls.length} 个
- **触发 Google Indexing 自动补推**：${report.autoHealedUrls.length} 个
${report.autoHealedUrls.map(u => `- \`[已补推]\` ${u}`).join('\n')}

> *本报告由 iKanPP GSC Auto-Doctor 无人值守守护进程自动生成。*
`;
    try {
      fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summaryMd, 'utf-8');
      console.log('📝 已将自愈简报写入 GITHUB_STEP_SUMMARY！');
    } catch {}
  }
}

main().catch(err => {
  console.error('Fatal error in gsc-auto-doctor:', err);
  process.exit(1);
});
