/**
 * iKanPP专线 HLS 流中继端点 (PipeCDN CORS Bridge)
 *
 * 核心机制：
 * - PipeCDN 的 Cloudflare 防盗链会阻断携带非白名单 Origin 的浏览器请求 (520)
 * - 本端点作为轻量级边缘中继，剥离 Origin 请求头后转发至 PipeCDN
 * - m3u8 清单中的相对路径 .ts 切片地址自动改写为经由本中继的绝对路径
 * - .ts 二进制切片以 stream 模式透传，零缓冲零存储
 *
 * 安全边界：
 * - 仅允许 pipecdn.vip 域名的请求通过，严禁其他域名搭便车
 * - 与 /api/proxy (轨道 B iKanX 专用) 完全隔离，互不干扰
 *
 * 架构说明：
 * - 传统采集源（巨量/光速/无尽/暗影等）依旧 100% 浏览器直连，不经过任何中继
 * - 本中继仅桥接 PipeCDN 的 Cloudflare CORS 限制，是 iKanPP专线正常运行的必要基础设施
 */

import { NextRequest, NextResponse } from 'next/server';
import { ikanppProvider } from '@/lib/services/providers/iyf-provider';

export const runtime = 'edge';

// 白名单域名 — 仅允许 PipeCDN 及其子域
const ALLOWED_DOMAINS = ['pipecdn.vip'];

function isAllowedDomain(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return ALLOWED_DOMAINS.some(d => hostname === d || hostname.endsWith('.' + d));
  } catch {
    return false;
  }
}

/**
 * 将 m3u8 清单中的相对路径 .ts 切片地址改写为经由本中继的地址
 */
function rewriteM3u8(content: string, baseUrl: string, relayOrigin?: string): string {
  const base = new URL(baseUrl);
  const streamBase = relayOrigin ? `${relayOrigin}/api/ikanpp-stream` : '/api/ikanpp-stream';
  const lines = content.split('\n');

  return lines.map(line => {
    const trimmed = line.trim();

    // 处理 EXT-X-KEY / EXT-X-MAP 等含 URI="" 的标签
    if (trimmed.startsWith('#EXT-X-KEY:') || trimmed.startsWith('#EXT-X-MAP:') || trimmed.startsWith('#EXT-X-MEDIA:')) {
      const uriMatch = trimmed.match(/URI="([^"]+)"/);
      if (uriMatch && uriMatch[1] && !uriMatch[1].includes('/api/ikanpp-stream')) {
        try {
          const absoluteUrl = new URL(uriMatch[1], base).toString();
          const relayUrl = `${streamBase}?url=${encodeURIComponent(absoluteUrl)}`;
          return trimmed.replace(/URI="[^"]+"/, `URI="${relayUrl}"`);
        } catch {
          return line;
        }
      }
      return line;
    }

    // 跳过注释和空行
    if (trimmed.startsWith('#') || !trimmed) {
      return line;
    }

    // 已经是本中继的 URL 则跳过
    if (trimmed.includes('/api/ikanpp-stream')) {
      return line;
    }

    // 将相对/绝对 .ts URL 改写为经由本中继的地址
    try {
      const absoluteUrl = new URL(trimmed, base).toString();
      return `${streamBase}?url=${encodeURIComponent(absoluteUrl)}`;
    } catch {
      return line;
    }
  }).join('\n');
}

export async function GET(request: NextRequest) {
  let targetUrl = request.nextUrl.searchParams.get('url');
  const mediaKey = request.nextUrl.searchParams.get('mediaKey');
  const videoId = request.nextUrl.searchParams.get('videoId');

  // 核心破局机制：就地自洽调度 (On-Demand Edge Resolve)
  // 当请求携带 mediaKey 时，由当前执行中继的 Edge 节点现场向爱壹帆换取带本节点出网 IP 的实时签名！
  // 保证签名中的 IP 与当前 Edge 节点出口 IP 100% 绝对一致，彻底解决 PipeCDN IIS 403 Credentials 校验失败问题！
  if (mediaKey) {
    try {
      const freshPlay = await ikanppProvider.getBestFreePlayUrl(mediaKey, Number(videoId || '0'), true);
      if (freshPlay && freshPlay.url) {
        targetUrl = freshPlay.url;
      }
    } catch (e) {
      console.warn('[iKanPP-Stream] On-demand resolve failed, fallback to url param:', e);
    }
  }

  if (!targetUrl) {
    return new NextResponse('Missing url parameter', { status: 400 });
  }

  // 安全门禁：仅允许 PipeCDN 域名
  if (!isAllowedDomain(targetUrl)) {
    return new NextResponse(
      JSON.stringify({ error: 'Domain not allowed', message: 'Only PipeCDN domains are permitted through this relay.' }),
      { status: 403, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }
    );
  }

  try {
    // 关键：PipeCDN 的 Cloudflare WAF 严格核验合法 Referer、Origin 与 UA
    // 注入 Referer 与 Origin 为官方域名，彻底穿透防盗链
    const fetchHeaders: Record<string, string> = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36',
      'Referer': 'https://www.iyf.tv/',
      'Origin': 'https://www.iyf.tv',
      'Accept': '*/*',
    };

    const clientRange = request.headers.get('range');
    if (clientRange) {
      fetchHeaders['Range'] = clientRange;
    }

    const upstreamResponse = await fetch(targetUrl, {
      headers: fetchHeaders,
      signal: AbortSignal.timeout(20000),
    });

    if (!upstreamResponse.ok) {
      const errText = await upstreamResponse.text().catch(() => '');
      const respHeadersObj: Record<string, string> = {};
      upstreamResponse.headers.forEach((v, k) => { respHeadersObj[k] = v; });
      
      const debugInfo = {
        status: upstreamResponse.status,
        headers: respHeadersObj,
        sentHeaders: fetchHeaders,
        targetUrl,
        bodySnippet: errText.slice(0, 500)
      };

      console.error(`[iKanPP-Stream] Upstream Debug:`, JSON.stringify(debugInfo));
      return new NextResponse(`Upstream debug info:\n${JSON.stringify(debugInfo, null, 2)}`, {
        status: upstreamResponse.status,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
        },
      });
    }

    const contentType = upstreamResponse.headers.get('Content-Type') || '';
    const isM3u8 = contentType.includes('mpegurl') || targetUrl.includes('.m3u8');

    if (isM3u8) {
      // m3u8 清单：读取文本内容，改写内部 .ts 地址后返回
      const text = await upstreamResponse.text();

      if (text.trim().startsWith('#EXTM3U') || text.trim().startsWith('#EXT-X-')) {
        const rewritten = rewriteM3u8(text, targetUrl, request?.nextUrl?.origin);
        return new NextResponse(rewritten, {
          status: 200,
          headers: {
            'Content-Type': 'application/vnd.apple.mpegurl',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': '*',
            'Cache-Control': 'no-cache',
          },
        });
      }

      // 不是真正的 m3u8 内容，原样返回
      return new NextResponse(text, {
        status: 200,
        headers: {
          'Content-Type': contentType || 'text/plain',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }

    // .ts 二进制切片：以 stream 模式零缓冲透传
    const responseHeaders = new Headers();
    // 透传必要的上游响应头
    const passHeaders = ['content-type', 'content-length', 'cache-control', 'accept-ranges'];
    for (const key of passHeaders) {
      const val = upstreamResponse.headers.get(key);
      if (val) responseHeaders.set(key, val);
    }
    // 如果上游没有 Content-Type，根据 URL 推断
    if (!responseHeaders.has('content-type')) {
      if (targetUrl.includes('.ts')) {
        responseHeaders.set('Content-Type', 'video/mp2t');
      } else if (targetUrl.includes('.key')) {
        responseHeaders.set('Content-Type', 'application/octet-stream');
      }
    }
    responseHeaders.set('Access-Control-Allow-Origin', '*');
    responseHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
    responseHeaders.set('Access-Control-Allow-Headers', '*');

    return new NextResponse(upstreamResponse.body, {
      status: upstreamResponse.status,
      headers: responseHeaders,
    });
  } catch (err: any) {
    console.error('[iKanPP-Stream] Relay error:', err?.message || err);
    return new NextResponse(
      JSON.stringify({ error: 'Relay failed', message: err?.message || 'Internal relay error' }),
      {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Max-Age': '86400',
    },
  });
}
