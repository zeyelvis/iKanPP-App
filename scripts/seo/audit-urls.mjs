#!/usr/bin/env node

/**
 * iKanPP / KVideo 全自动 SEO 规范 URL 自动化审计工具
 * 对应《Cloudflare 全自动 SEO 架构执行规范 v5.0》第 20.3 节
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// 解析命令行参数
const args = process.argv.slice(2);
function getArg(flag, defaultValue = null) {
  const index = args.indexOf(flag);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return defaultValue;
}
const hasFlag = (flag) => args.includes(flag);

const BASE_URL = (getArg('--base') || process.env.BASE_URL || 'https://www.ikanpp.com').replace(/\/+$/, '');
const singleUrl = getArg('--url');
const outputJson = getArg('--output-json');
const outputMd = getArg('--output-md');
const failOnIssue = hasFlag('--fail-on-issue');

// 默认全真审计样本清单
const DEFAULT_SAMPLE_PATHS = [
  '/',
  '/movie',
  '/tv',
  '/anime',
  '/variety',
  '/documentary',
  '/ranking',
  '/robots.txt',
  '/sitemap.xml',
  '/sitemap-index.xml',
  '/api/seo/sitemap-titles/1',
  '/api/seo/sitemap-titles/99999', // 越界 404 检测
  '/actor/%E5%BC%A0%E8%AF%91',
  '/director/%E5%BC%A0%E8%89%BA%E8%B0%8B',
];

/**
 * 提取 HTML 中的全部 JSON-LD 对象
 */
function extractJsonLd(html) {
  const scripts = [];
  const regex = /<script\s+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    try {
      const parsed = JSON.parse(match[1]);
      scripts.push(parsed);
    } catch {
      scripts.push({ __error: 'SD-004: Invalid JSON-LD Syntax' });
    }
  }
  return scripts;
}

/**
 * 递归收集所有 @type
 */
function collectTypes(obj, types = new Set()) {
  if (!obj || typeof obj !== 'object') return types;
  if (Array.isArray(obj)) {
    for (const item of obj) collectTypes(item, types);
    return types;
  }
  if (obj['@type']) {
    if (Array.isArray(obj['@type'])) {
      for (const t of obj['@type']) types.add(t);
    } else {
      types.add(obj['@type']);
    }
  }
  if (Array.isArray(obj['@graph'])) {
    for (const item of obj['@graph']) collectTypes(item, types);
  }
  return types;
}

/**
 * 审计单个 URL
 */
async function auditUrl(targetUrl) {
  const report = {
    url: targetUrl,
    status: 0,
    canonical: null,
    robots: null,
    h1Count: 0,
    jsonLdTypes: [],
    inSitemap: true,
    redirectHops: 0,
    contentHash: '',
    issues: [],
  };

  try {
    let currentUrl = targetUrl;
    let hops = 0;
    let finalRes = null;
    let redirectHistory = [];

    // 手动追踪重定向以精确计数跳数与状态码
    while (hops < 5) {
      const res = await fetch(currentUrl, {
        method: 'GET',
        redirect: 'manual',
        headers: {
          'User-Agent': 'iKanPP-SEO-Auditor/1.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      });

      if ([301, 302, 307, 308].includes(res.status)) {
        hops++;
        const location = res.headers.get('location');
        redirectHistory.push({ status: res.status, url: currentUrl, target: location });
        if (!location) {
          report.issues.push('REDIRECT-003: Redirect without Location header');
          break;
        }
        currentUrl = new URL(location, currentUrl).href;
      } else {
        finalRes = res;
        break;
      }
    }

    report.redirectHops = hops;

    if (hops > 1) {
      report.issues.push(`REDIRECT-001: Multiple redirect hops detected (${hops} hops)`);
    }

    if (!finalRes) {
      report.issues.push('HTTP-001: Exceeded max redirect hops');
      return report;
    }

    report.status = finalRes.status;
    const isXml = (finalRes.headers.get('content-type') || '').includes('xml') || targetUrl.endsWith('.xml');
    const isText = (finalRes.headers.get('content-type') || '').includes('text/plain') || targetUrl.endsWith('.txt');

    // 检查非规范重定向状态码
    if (redirectHistory.length > 0) {
      const initialRedirect = redirectHistory[0];
      if (initialRedirect.status !== 301 && initialRedirect.status !== 308) {
        report.issues.push(`REDIRECT-002: Expected 301 or 308 permanent redirect, got ${initialRedirect.status}`);
      }
    }

    const bodyText = await finalRes.text();
    report.contentHash = crypto.createHash('sha256').update(bodyText).digest('hex').slice(0, 16);

    // 对于纯文本或 XML 文件做专属规则校验
    if (isText || isXml) {
      if (targetUrl.includes('robots.txt')) {
        if (!bodyText.includes('sitemap-index.xml')) {
          report.issues.push('ROBOTS-003: robots.txt missing sitemap-index.xml reference');
        }
        if (bodyText.includes('Disallow: /player')) {
          report.issues.push('ROBOTS-004: robots.txt should not Disallow /player to allow crawling noindex headers');
        }
      }
      if (targetUrl.includes('sitemap-titles/99999') && report.status !== 404) {
        report.issues.push(`SITEMAP-001: Out-of-bounds sitemap slice must return 404, got ${report.status}`);
      }
      return report;
    }

    // HTML 解析
    // 1. Canonical 标签提取
    const canonicalMatches = [...bodyText.matchAll(/<link\s+[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/gi)];
    if (canonicalMatches.length === 0) {
      // 容忍反转属性顺位
      const altMatches = [...bodyText.matchAll(/<link\s+[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/gi)];
      if (altMatches.length > 0) {
        report.canonical = altMatches[0][1];
      } else if (report.status === 200) {
        report.issues.push('CANONICAL-001: Missing canonical link tag on 200 response');
      }
    } else if (canonicalMatches.length > 1) {
      report.issues.push('CANONICAL-002: Multiple canonical tags detected');
      report.canonical = canonicalMatches[0][1];
    } else {
      report.canonical = canonicalMatches[0][1];
    }

    // 2. Robots 指令
    const robotsMatch = bodyText.match(/<meta\s+[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i)
      || bodyText.match(/<meta\s+[^>]*content=["']([^"']+)["'][^>]*name=["']robots["'][^>]*>/i);
    const xRobots = finalRes.headers.get('x-robots-tag');
    report.robots = (robotsMatch ? robotsMatch[1] : null) || xRobots || 'index,follow';

    // 3. H1 标签计数
    const h1Matches = [...bodyText.matchAll(/<h1[^>]*>([\s\S]*?)<\/h1>/gi)];
    report.h1Count = h1Matches.length;
    if (report.status === 200) {
      if (report.h1Count === 0) {
        report.issues.push('H1-001: Missing <h1> tag');
      } else if (report.h1Count > 1) {
        report.issues.push(`H1-002: Multiple <h1> tags detected (${report.h1Count})`);
      }
    }

    // 4. JSON-LD 结构化数据校验
    const jsonLds = extractJsonLd(bodyText);
    const types = new Set();
    for (const jld of jsonLds) {
      if (jld.__error) {
        report.issues.push(jld.__error);
      } else {
        collectTypes(jld, types);

        // SD-001 / SD-003 校验虚假评价人数与伪造 rating
        const str = JSON.stringify(jld);
        if (str.includes('"ratingCount":1520') || str.includes('"ratingCount":"1520"')) {
          report.issues.push('SD-003: Fake hardcoded ratingCount (1520) detected in JSON-LD');
        }
        if (str.includes('"@type":"VideoObject"') && !str.includes('embedUrl') && !str.includes('contentUrl')) {
          report.issues.push('SD-002: VideoObject declared without valid playable embed or stream');
        }
      }
    }
    report.jsonLdTypes = Array.from(types);

  } catch (err) {
    report.issues.push(`FETCH-001: Failed to audit URL: ${err.message}`);
  }

  return report;
}

/**
 * 主执行入口
 */
async function main() {
  console.log('🔍 iKanPP / KVideo SEO 自动化规范审计工具\n');
  console.log(`基准域名: ${BASE_URL}\n`);

  let pathsToAudit = [];
  if (singleUrl) {
    pathsToAudit = [singleUrl];
  } else {
    pathsToAudit = DEFAULT_SAMPLE_PATHS;
  }

  const results = [];
  for (const p of pathsToAudit) {
    const fullUrl = p.startsWith('http') ? p : `${BASE_URL}${p}`;
    process.stdout.write(`审计中: ${fullUrl} ... `);
    const report = await auditUrl(fullUrl);
    results.push(report);
    if (report.issues.length === 0) {
      console.log(`\x1b[32m✔ OK (${report.status})\x1b[0m`);
    } else {
      console.log(`\x1b[31m✘ ${report.issues.length} 个问题\x1b[0m`);
      for (const issue of report.issues) {
        console.log(`   └─ \x1b[33m${issue}\x1b[0m`);
      }
    }
  }

  // 汇总统计
  const totalUrls = results.length;
  const passedUrls = results.filter(r => r.issues.length === 0).length;
  const failedUrls = totalUrls - passedUrls;
  const allIssues = results.flatMap(r => r.issues);

  console.log('\n================ 审计摘要 ================');
  console.log(`总审计 URL 数 : ${totalUrls}`);
  console.log(`通过合规数量   : \x1b[32m${passedUrls}\x1b[0m`);
  console.log(`发现问题数量   : \x1b[${failedUrls > 0 ? '31' : '32'}m${failedUrls}\x1b[0m`);
  console.log(`违规项总数     : ${allIssues.length}`);
  console.log('==========================================\n');

  // 输出 JSON 文件
  if (outputJson) {
    const jsonPath = path.resolve(outputJson);
    fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
    fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2), 'utf8');
    console.log(`📄 JSON 审计报告已写入: ${jsonPath}`);
  }

  // 输出 Markdown 文件
  if (outputMd) {
    const mdPath = path.resolve(outputMd);
    fs.mkdirSync(path.dirname(mdPath), { recursive: true });
    let md = `# iKanPP / KVideo SEO 自动化规范审计报告\n\n`;
    md += `* 执行基准: \`${BASE_URL}\`\n`;
    md += `* 审计时间: \`${new Date().toISOString()}\`\n`;
    md += `* 通过率: **${passedUrls} / ${totalUrls}** (${Math.round((passedUrls / totalUrls) * 100)}%)\n\n`;
    md += `## 审计明细\n\n`;
    md += `| URL | 状态码 | Canonical | Robots | H1 计数 | Schema Types | 跳数 | 状态 |\n`;
    md += `|---|---|---|---|---|---|---|---|\n`;

    for (const r of results) {
      const statusIcon = r.issues.length === 0 ? '✅ 正常' : `❌ ${r.issues.length} 异常`;
      const schemaStr = r.jsonLdTypes.join(', ') || '-';
      const canonicalStr = r.canonical ? `\`${r.canonical.replace(BASE_URL, '')}\`` : '-';
      const urlDisplay = r.url.replace(BASE_URL, '') || '/';
      md += `| \`${urlDisplay}\` | ${r.status} | ${canonicalStr} | \`${r.robots || '-'}\` | ${r.h1Count} | ${schemaStr} | ${r.redirectHops} | ${statusIcon} |\n`;
    }

    if (allIssues.length > 0) {
      md += `\n## 发现的问题与违规规则\n\n`;
      for (const r of results) {
        if (r.issues.length > 0) {
          md += `### \`${r.url}\`\n\n`;
          for (const issue of r.issues) {
            md += `- ⚠️ ${issue}\n`;
          }
          md += `\n`;
        }
      }
    } else {
      md += `\n> 🎉 **全项合规**：所有审计 URL 100% 严格符合白帽 SEO 规范与真实性门禁！\n`;
    }

    fs.writeFileSync(mdPath, md, 'utf8');
    console.log(`📝 Markdown 审计报告已写入: ${mdPath}`);
  }

  if (failOnIssue && failedUrls > 0) {
    console.error('\n❌ 存在违规项，审计失败 (failOnIssue 开启)');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal auditor error:', err);
  process.exit(1);
});
