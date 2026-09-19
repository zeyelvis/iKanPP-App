#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * iKanPP 自动化 Google Indexing API 闪电广播脚本
 * 
 * 作用：
 * 在 GitHub Actions 部署完成后或每小时新片入库后自动触发，
 * 将全站最新上映影视与核心频道的规范 URL 批量提交至 Google Indexing API，
 * 触发 Googlebot 5~15 分钟内极速入站抓取，抢占新片首发搜索红利。
 */

const HOST = 'www.ikanpp.com';
const BASE_URL = `https://${HOST}`;
const MAX_URLS_PER_RUN = 40; // 遵循 Google 每日 200 默认限额，单次广播 40 条

/**
 * 解析 Google 服务账号凭证
 */
function getGoogleCredentials() {
  // 1. 优先从环境变量读取
  const rawEnv = process.env.GOOGLE_INDEXING_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (rawEnv) {
    try {
      let jsonStr = rawEnv.trim();
      if (!jsonStr.startsWith('{')) {
        try {
          jsonStr = Buffer.from(jsonStr, 'base64').toString('utf-8');
        } catch {}
      }
      const parsed = JSON.parse(jsonStr);
      if (parsed.client_email && parsed.private_key) {
        return parsed;
      }
    } catch (e) {
      console.warn('⚠️ [GoogleIndexing] 环境变量凭据解析失败:', e.message);
    }
  }

  // 2. 本地密钥文件容错
  const localKeyDir = path.resolve(process.cwd(), 'google key');
  if (fs.existsSync(localKeyDir)) {
    const files = fs.readdirSync(localKeyDir).filter(f => f.endsWith('.json'));
    if (files.length > 0) {
      try {
        const fullPath = path.join(localKeyDir, files[0]);
        const data = JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
        if (data.client_email && data.private_key) {
          return data;
        }
      } catch (e) {
        console.warn('⚠️ [GoogleIndexing] 本地密钥文件解析失败:', e.message);
      }
    }
  }

  return null;
}

function base64UrlEncode(strOrBuffer) {
  let b64;
  if (typeof strOrBuffer === 'string') {
    b64 = Buffer.from(strOrBuffer).toString('base64');
  } else {
    b64 = strOrBuffer.toString('base64');
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/g, '')
    .replace(/-----END [A-Z ]+-----/g, '')
    .replace(/\s+/g, '');
  return Buffer.from(b64, 'base64');
}

/**
 * 生成 Google OAuth2 Access Token
 */
async function getAccessToken(creds) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: creds.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const keyBuffer = pemToArrayBuffer(creds.private_key);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signingInput)
  );

  const encodedSignature = base64UrlEncode(Buffer.from(signatureBuffer));
  const assertionJwt = `${signingInput}.${encodedSignature}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: assertionJwt,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    throw new Error(`Google OAuth2 Token 交换失败 (${tokenRes.status}): ${text}`);
  }

  const tokenData = await tokenRes.json();
  return tokenData.access_token;
}

/**
 * 从预烘焙数据提取最新增量影视 URL
 */
function extractLatestTargetUrls() {
  const urls = [
    `${BASE_URL}/`,
    `${BASE_URL}/movie`,
    `${BASE_URL}/tv`,
    `${BASE_URL}/anime`,
    `${BASE_URL}/variety`,
    `${BASE_URL}/ranking`,
  ];

  const targetPath = path.resolve(process.cwd(), 'lib/data/latest-titles-prebaked.ts');
  if (!fs.existsSync(targetPath)) return urls;

  try {
    const rawContent = fs.readFileSync(targetPath, 'utf-8');
    const jsonMatch = rawContent.match(/export const PREBAKED_LATEST_TITLES: Record<string, LatestPrebakedItem\[\]> = ([\s\S]*?);\s*$/);
    if (jsonMatch && jsonMatch[1]) {
      const data = JSON.parse(jsonMatch[1]);
      const seenTitles = new Set();

      for (const items of Object.values(data)) {
        if (Array.isArray(items)) {
          for (const item of items) {
            if (item && item.title && !seenTitles.has(item.title)) {
              seenTitles.add(item.title);
              const entityId = item.entityId || 'ik000000';
              const slug = item.slug || encodeURIComponent(item.title);
              urls.push(`${BASE_URL}/title/${encodeURIComponent(`${entityId}-${slug}`)}`);
            }
          }
        }
      }
    }
  } catch (err) {
    console.warn('⚠️ [GoogleIndexing] 解析 latest-titles-prebaked.ts 异常:', err.message);
  }

  const allCandidateUrls = Array.from(new Set(urls));
  // 按照 YAML Priority A 规范，截取前 MAX_URLS_PER_RUN 条高爆发新片与核心路由
  const priorityAUrls = allCandidateUrls.slice(0, MAX_URLS_PER_RUN);
  console.log(`🎯 [GoogleIndexing] 基于 YAML Priority A 策略筛选出 ${priorityAUrls.length} 个重点新片及频道 URL，准备推送...`);
  return priorityAUrls;
}



async function main() {
  console.log('📡 [GoogleIndexing] 启动新片全自动 Google Indexing API 广播...');

  const creds = getGoogleCredentials();
  if (!creds) {
    console.log('ℹ️ [GoogleIndexing] 未检测到 Google Service Account 密钥凭据 (GOOGLE_INDEXING_KEY)，跳过推送。');
    process.exit(0);
  }

  console.log(`🔑 [GoogleIndexing] 认证服务账号: ${creds.client_email}`);

  let token;
  try {
    token = await getAccessToken(creds);
    console.log('✅ [GoogleIndexing] Google OAuth2 验签成功！');
  } catch (err) {
    console.error('❌ [GoogleIndexing] 获取 Access Token 失败:', err.message);
    process.exit(0); // 容错退出，不阻断主流水线
  }

  const targetUrls = extractLatestTargetUrls();
  console.log(`🎯 [GoogleIndexing] 成功提取 ${targetUrls.length} 个重点新片及频道 URL，准备推送...`);

  let successCount = 0;
  let failCount = 0;

  // 控制并发以避免触发 Google API 10 QPS 频控限制
  const chunkSize = 5;
  for (let i = 0; i < targetUrls.length; i += chunkSize) {
    const chunk = targetUrls.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map(async (url) => {
        try {
          const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              url,
              type: 'URL_UPDATED',
            }),
          });

          if (res.ok) {
            successCount++;
            console.log(`  ✓ 已广播: ${url}`);
          } else {
            failCount++;
            const errText = await res.text();
            console.warn(`  ⚠️ 推送失败 (${res.status}): ${url} -> ${errText.slice(0, 100)}`);
          }
        } catch (e) {
          failCount++;
          console.warn(`  ❌ 网络异常: ${url} -> ${e.message}`);
        }
      })
    );
  }

  console.log(`🎉 [GoogleIndexing] 广播完毕！成功: ${successCount} 个, 失败/受限: ${failCount} 个。`);
}

main().catch(err => {
  console.error('❌ [GoogleIndexing] 发生未捕获异常:', err);
  process.exit(0);
});
