/**
 * Cloudflare Access Zero Trust JWT 鉴权校验工具
 * 严格遵循 Web Crypto API 标准，完美兼容 Cloudflare Pages / Edge Runtime 与本地开发
 */

import { NextResponse } from 'next/server';

interface AccessJwk {
  kid: string;
  kty: string;
  alg: string;
  use: string;
  e: string;
  n: string;
}

interface JwksResponse {
  keys: AccessJwk[];
  public_cert?: {
    kid: string;
    cert: string;
  };
}

interface AccessJwtPayload {
  aud: string[] | string;
  email?: string;
  user_uuid?: string;
  sub?: string;
  iss?: string;
  exp: number;
  nbf?: number;
  iat?: number;
  type?: string;
  identity_nonce?: string;
  [key: string]: any;
}

// 内存缓存 JWKS 公钥（TTL 1 小时）
let jwksCache: { keys: AccessJwk[]; expiry: number } | null = null;
const JWKS_CACHE_TTL = 3600 * 1000;

// 白名单默认管理员邮箱
const DEFAULT_ADMIN_EMAIL = 'zeyelvis@gmail.com';

/**
 * 获取允许登录的管理员邮箱白名单列表
 */
export function getAllowedAdminEmails(): string[] {
  const envEmails = process.env.ADMIN_EMAILS || '';
  const list = envEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  if (!list.includes(DEFAULT_ADMIN_EMAIL.toLowerCase())) {
    list.push(DEFAULT_ADMIN_EMAIL.toLowerCase());
  }
  return list;
}

/**
 * 解析 Base64URL 编码
 */
function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

/**
 * 从 Cloudflare Access 团队域名获取 JWKS 公钥
 */
async function fetchAccessJwks(teamDomain: string): Promise<AccessJwk[]> {
  const now = Date.now();
  if (jwksCache && jwksCache.expiry > now) {
    return jwksCache.keys;
  }

  // 规范化 teamDomain (支持传入 'ikanpp' 或 'ikanpp.cloudflareaccess.com')
  const host = teamDomain.includes('.')
    ? teamDomain
    : `${teamDomain}.cloudflareaccess.com`;
  const jwksUrl = `https://${host}/cdn-cgi/access/certs`;

  const res = await fetch(jwksUrl, {
    headers: { 'User-Agent': 'iKanPP-Admin-Verification/1.0' },
  });

  if (!res.ok) {
    throw new Error(`无法获取 Cloudflare Access 证书公钥: HTTP ${res.status}`);
  }

  const data = (await res.json()) as JwksResponse;
  if (!data.keys || !Array.isArray(data.keys)) {
    throw new Error('Cloudflare Access 返回的 JWKS 格式无效');
  }

  jwksCache = {
    keys: data.keys,
    expiry: now + JWKS_CACHE_TTL,
  };

  return data.keys;
}

export interface VerifyAccessResult {
  authenticated: boolean;
  email?: string;
  error?: string;
  status: number;
}

/**
 * 校验来自 Cloudflare Access 的 JWT 请求
 */
export async function verifyCloudflareAccess(request: Request): Promise<VerifyAccessResult> {
  const isDev = process.env.NODE_ENV === 'development';
  const cfAud =
    process.env.CF_ACCESS_AUD || 'fab3226bf40ab3a4c565562cf9fed3e5b832155c896eeb656768341e11625171';
  const rawTeamDomain = process.env.CF_ACCESS_TEAM_DOMAIN || '9fa';

  // 1. 提取 JWT assertion
  const jwtAssertion =
    request.headers.get('cf-access-jwt-assertion') ||
    request.headers.get('Cf-Access-Jwt-Assertion');

  // 本地开发调试：若在开发环境且未携带 Cloudflare Access header，允许通过测试
  if (isDev && !jwtAssertion) {
    const devBypassHeader = request.headers.get('x-dev-admin-email');
    return {
      authenticated: true,
      email: devBypassHeader || DEFAULT_ADMIN_EMAIL,
      status: 200,
    };
  }

  if (!jwtAssertion) {
    return {
      authenticated: false,
      error: '未提供 Cloudflare Access 凭证 (Missing Cf-Access-Jwt-Assertion)',
      status: 401,
    };
  }

  const parts = jwtAssertion.split('.');
  if (parts.length !== 3) {
    return {
      authenticated: false,
      error: 'Cloudflare Access JWT 结构无效',
      status: 401,
    };
  }

  const [headerB64, payloadB64, signatureB64] = parts;

  // 3. 解码 JWT 头部与载荷
  let header: { kid?: string; alg?: string };
  let payload: AccessJwtPayload;

  try {
    header = JSON.parse(base64UrlDecode(headerB64));
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch (err: any) {
    return {
      authenticated: false,
      error: '解析 JWT 载荷失败: ' + (err.message || String(err)),
      status: 400,
    };
  }

  if (header.alg !== 'RS256') {
    return {
      authenticated: false,
      error: `不支持的签名算法: ${header.alg}，需为 RS256`,
      status: 400,
    };
  }

  if (!header.kid) {
    return {
      authenticated: false,
      error: 'JWT 缺少 kid 字段',
      status: 400,
    };
  }

  // 4. 校验过期时间 (含 60 秒时钟容差)
  const currentTime = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < currentTime - 60) {
    return {
      authenticated: false,
      error: '凭证已过期，请重新登录',
      status: 401,
    };
  }
  if (payload.nbf && payload.nbf > currentTime + 60) {
    return {
      authenticated: false,
      error: '凭证尚未生效',
      status: 401,
    };
  }

  // 5. 校验 Audience (AUD)
  if (cfAud) {
    const audMatch = Array.isArray(payload.aud)
      ? payload.aud.includes(cfAud)
      : payload.aud === cfAud;

    if (!audMatch) {
      return {
        authenticated: false,
        error: 'Application Audience 标签不匹配，拒绝访问',
        status: 403,
      };
    }
  }

  // 6. 校验邮箱白名单
  const email = (payload.email || request.headers.get('cf-access-authenticated-user-email') || '').toLowerCase().trim();
  if (!email) {
    return {
      authenticated: false,
      error: 'JWT 载荷中未包含用户邮箱',
      status: 403,
    };
  }

  const allowedEmails = getAllowedAdminEmails();
  if (!allowedEmails.includes(email)) {
    return {
      authenticated: false,
      error: `邮箱 ${email} 不在管理后台允许访问的白名单中`,
      status: 403,
    };
  }

  // 7. 使用 Web Crypto API 验签 RS256
  try {
    const keys = await fetchAccessJwks(rawTeamDomain);
    const jwkKey = keys.find((k) => k.kid === header.kid);
    if (!jwkKey) {
      return {
        authenticated: false,
        error: `未在 Cloudflare Access 证书库中找到对应 kid: ${header.kid}`,
        status: 401,
      };
    }

    const cryptoKey = await crypto.subtle.importKey(
      'jwk',
      {
        kty: jwkKey.kty,
        n: jwkKey.n,
        e: jwkKey.e,
        alg: 'RS256',
        ext: true,
      },
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify']
    );

    const data = new TextEncoder().encode(`${headerB64}.${payloadB64}`);
    const sigBinary = Uint8Array.from(base64UrlDecode(signatureB64), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify(
      'RSASSA-PKCS1-v1_5',
      cryptoKey,
      sigBinary,
      data
    );

    if (!isValid) {
      return {
        authenticated: false,
        error: 'Cloudflare Access JWT 数字签名验证失败',
        status: 401,
      };
    }
  } catch (err: any) {
    console.error('[Admin Auth] JWKS 验签发生异常:', err);
    return {
      authenticated: false,
      error: '鉴权验签服务暂时不可用: ' + (err.message || String(err)),
      status: 500,
    };
  }

  return {
    authenticated: true,
    email,
    status: 200,
  };
}

/**
 * 路由守卫辅助函数：若未授权直接返回预置的 401/403 NextResponse，授权成功返回 null
 */
export async function requireAdminAuth(
  request: Request
): Promise<NextResponse | null> {
  const result = await verifyCloudflareAccess(request);
  if (!result.authenticated) {
    return NextResponse.json(
      {
        success: false,
        error: result.error || '未授权访问',
      },
      { status: result.status }
    );
  }
  return null;
}
