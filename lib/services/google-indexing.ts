/**
 * Google Indexing API 轻量客户端
 * 
 * 功能：
 * 1. 纯原生 Web Crypto API (crypto.subtle) 实现 RS256 签名，零 npm 外部依赖
 * 2. 完美适配 Next.js Edge Runtime (Cloudflare Pages) 与 Node.js 18+ 环境
 * 3. 自动缓存 Access Token (50分钟)，高并发下极大减少向 Google Auth 发起的子请求
 * 4. 支持单个推送与受控批量推送（受限于 Google 每日 200 URLs 默认限额）
 * 5. 优雅容错降级：在未配置 GOOGLE_INDEXING_KEY 时静默跳过并输出指引
 */

interface GoogleServiceAccount {
  client_email: string;
  private_key: string;
}

interface IndexingPublishResult {
  url: string;
  success: boolean;
  status?: number;
  error?: string;
}

let cachedAccessToken: { token: string; expiresAt: number } | null = null;

/**
 * 从环境变量解析 Google Service Account 凭据
 * 支持纯 JSON 字符串或 Base64 编码字符串
 */
function getServiceAccountCredentials(): GoogleServiceAccount | null {
  const raw = process.env.GOOGLE_INDEXING_KEY || process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!raw) return null;

  try {
    let jsonStr = raw.trim();
    if (!jsonStr.startsWith('{')) {
      // 尝试 Base64 解码
      try {
        jsonStr = Buffer.from(jsonStr, 'base64').toString('utf-8');
      } catch {
        jsonStr = atob(jsonStr);
      }
    }
    const parsed = JSON.parse(jsonStr);
    if (parsed.client_email && parsed.private_key) {
      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key,
      };
    }
  } catch (err) {
    console.warn('[GoogleIndexing] 解析服务账号凭据失败:', err);
  }
  return null;
}

function base64UrlEncode(data: string | Uint8Array): string {
  let b64: string;
  if (typeof data === 'string') {
    b64 = btoa(unescape(encodeURIComponent(data)));
  } else {
    let binary = '';
    const bytes = data;
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    b64 = btoa(binary);
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/g, '')
    .replace(/-----END [A-Z ]+-----/g, '')
    .replace(/\s+/g, '');
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * 生成符合 Google OAuth2 规范的自签名 JWT 并换取 Access Token
 */
async function getGoogleAccessToken(creds: GoogleServiceAccount): Promise<string | null> {
  const now = Math.floor(Date.now() / 1000);

  // 1. 检查本地内存缓存有效性
  if (cachedAccessToken && cachedAccessToken.expiresAt > now + 300) {
    return cachedAccessToken.token;
  }

  try {
    const header = {
      alg: 'RS256',
      typ: 'JWT',
    };

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

    // 使用 Web Crypto API 导入 PKCS#8 密钥并签名
    const keyData = pemToArrayBuffer(creds.private_key);
    const cryptoKey = await crypto.subtle.importKey(
      'pkcs8',
      keyData,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['sign']
    );

    const encoder = new TextEncoder();
    const signatureBuffer = await crypto.subtle.sign(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      encoder.encode(signingInput)
    );

    const encodedSignature = base64UrlEncode(new Uint8Array(signatureBuffer));
    const assertionJwt = `${signingInput}.${encodedSignature}`;

    // 向 Google OAuth2 请求交换 Bearer Access Token
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        assertion: assertionJwt,
      }).toString(),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('[GoogleIndexing] OAuth2 Token 交换失败:', res.status, errText);
      return null;
    }

    const tokenData = (await res.json()) as { access_token?: string; expires_in?: number };
    if (!tokenData.access_token) {
      return null;
    }

    cachedAccessToken = {
      token: tokenData.access_token,
      expiresAt: now + (tokenData.expires_in || 3600),
    };

    return tokenData.access_token;
  } catch (err) {
    console.warn('[GoogleIndexing] 生成 Google Access Token 异常:', err);
    return null;
  }
}

/**
 * 提交单个 URL 到 Google Indexing API
 * @param url 待提交的完整页面 URL
 * @param type 'URL_UPDATED' (更新或新增) | 'URL_DELETED' (删除)
 */
export async function publishGoogleIndexingUrl(
  url: string,
  type: 'URL_UPDATED' | 'URL_DELETED' = 'URL_UPDATED'
): Promise<IndexingPublishResult> {
  const creds = getServiceAccountCredentials();
  if (!creds) {
    return {
      url,
      success: false,
      error: 'GOOGLE_INDEXING_KEY 未配置，跳过推送',
    };
  }

  const token = await getGoogleAccessToken(creds);
  if (!token) {
    return {
      url,
      success: false,
      error: '获取 Google OAuth2 Access Token 失败',
    };
  }

  try {
    const res = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        url,
        type,
      }),
    });

    if (res.ok) {
      return {
        url,
        success: true,
        status: res.status,
      };
    } else {
      const errText = await res.text();
      return {
        url,
        success: false,
        status: res.status,
        error: errText,
      };
    }
  } catch (err: any) {
    return {
      url,
      success: false,
      error: err?.message || '网络请求异常',
    };
  }
}

/**
 * 批量提交多个 URL 到 Google Indexing API
 * 自动进行去重、数量截断（默认每次最多 50 条）和并发控制
 */
export async function batchPublishGoogleIndexing(
  urls: string[],
  maxCount = 50
): Promise<{ total: number; successful: number; results: IndexingPublishResult[] }> {
  const uniqueUrls = Array.from(new Set(urls.filter(Boolean))).slice(0, maxCount);
  if (uniqueUrls.length === 0) {
    return { total: 0, successful: 0, results: [] };
  }

  const creds = getServiceAccountCredentials();
  if (!creds) {
    console.log('[GoogleIndexing] 未配置 GOOGLE_INDEXING_KEY，跳过批量推送');
    return {
      total: uniqueUrls.length,
      successful: 0,
      results: uniqueUrls.map(u => ({ url: u, success: false, error: '未配置服务密钥' })),
    };
  }

  console.log(`[GoogleIndexing] 开始向 Google Indexing API 提交 ${uniqueUrls.length} 个新入库 URL...`);

  const results: IndexingPublishResult[] = [];
  let successful = 0;

  // 控制并发以避免触发 Google API 每秒频控 (10 QPS)
  const chunkSize = 5;
  for (let i = 0; i < uniqueUrls.length; i += chunkSize) {
    const chunk = uniqueUrls.slice(i, i + chunkSize);
    const chunkResults = await Promise.all(
      chunk.map(url => publishGoogleIndexingUrl(url, 'URL_UPDATED'))
    );
    for (const r of chunkResults) {
      results.push(r);
      if (r.success) successful++;
    }
  }

  console.log(`[GoogleIndexing] 完成推送: 成功 ${successful}/${uniqueUrls.length}`);
  return {
    total: uniqueUrls.length,
    successful,
    results,
  };
}
