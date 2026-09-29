import { NextRequest, NextResponse } from 'next/server';
import { getIkanppLineConfig, getIkanppLineHealth } from '@/lib/services/ikanpp-line-service';
import { ikanppProvider, matchBestIkanppLineCandidate } from '@/lib/services/providers/iyf-provider';

export const runtime = 'edge';

/**
 * iKanPP 专线 - 客户端单点按需惰性解析接口 (Lazy Resolve API)
 * 
 * 架构规范要求：
 * 1. 0 批量预爬取：只在客户端用户点选或公网源熔断自愈时触发单点按需解析；
 * 2. 熔断守护：若后台开关已关闭或上游 offline，静默返回熔断状态，前端无缝降级；
 * 3. 直连下发：解析返回的 m3u8 直链由客户端直接播放，不经过任何反代服务；
 * 4. 高保真响应头与防指纹泄漏；
 * 5. 多维智能消歧：彻底杜绝正片动漫/影视被同名短剧或垃圾预告营销号顶替。
 */

// 内存单点缓存（TTL 2小时）
const resolveCache = new Map<string, { data: any; expiresAt: number }>();

const ALLOWED_ORIGINS = [
  'https://kanpp.tv',
  'https://www.kanpp.tv',
  'http://kanpp.tv',
  'http://www.kanpp.tv',
  'https://ikanpp.com',
  'https://www.ikanpp.com',
];

function getCorsHeaders(req: NextRequest): Record<string, string> {
  const origin = req.headers.get('origin') || '';
  const isAllowed =
    ALLOWED_ORIGINS.includes(origin) ||
    origin.endsWith('.kanpp.tv') ||
    origin.endsWith('.ikanpp.com') ||
    origin.includes('localhost') ||
    origin.includes('127.0.0.1');

  const headers: Record<string, string> = {
    'Vary': 'Origin',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Max-Age': '86400',
  };

  if (isAllowed && origin) {
    headers['Access-Control-Allow-Origin'] = origin;
  } else if (!origin) {
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(req),
  });
}

export async function GET(req: NextRequest) {
  return handleResolve(req);
}

export async function POST(req: NextRequest) {
  return handleResolve(req);
}

async function handleResolve(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);

  try {
    let title = '';
    let mediaKey = '';
    let episode: string | number | undefined;
    let year: string | undefined;
    let category: string | undefined;

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      title = (body.title || '').trim();
      mediaKey = String(body.mediaKey || body.vodId || body.id || '').trim();
      episode = body.episode;
      year = body.year;
      category = body.category || body.type;
    } else {
      const url = new URL(req.url);
      title = (url.searchParams.get('title') || '').trim();
      mediaKey = (url.searchParams.get('mediaKey') || url.searchParams.get('vodId') || url.searchParams.get('id') || '').trim();
      episode = url.searchParams.get('episode') || undefined;
      year = url.searchParams.get('year') || undefined;
      category = url.searchParams.get('category') || url.searchParams.get('type') || undefined;
    }

    if (!title && !mediaKey) {
      return NextResponse.json(
        { success: false, code: 'PARAM_MISSING', message: '片名(title) 或 专线唯一码(mediaKey) 不能为空' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. 熔断与状态核验
    const [config, health] = await Promise.all([
      getIkanppLineConfig(),
      getIkanppLineHealth(),
    ]);

    if (!config.enabled) {
      return NextResponse.json(
        { success: false, code: 'CIRCUIT_BREAK', message: 'iKanPP专线已开启静默熔断保护' },
        { status: 200, headers: corsHeaders }
      );
    }

    if (health.status === 'offline') {
      return NextResponse.json(
        { success: false, code: 'OFFLINE', message: 'iKanPP专线上游维护中' },
        { status: 200, headers: corsHeaders }
      );
    }

    // 2. 按 mediaKey 直接换取播放列表 (100% 精准直达)
    if (mediaKey && mediaKey !== 'ikanpp' && !mediaKey.startsWith('ik')) {
      const cacheKey = `ikanpp_res_key:${mediaKey}`;
      const cached = resolveCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return NextResponse.json(cached.data, {
          headers: { ...corsHeaders, 'Cache-Control': 'private, max-age=1800' },
        });
      }

      const episodeList = await ikanppProvider.getFullEpisodeList(mediaKey);
      if (!episodeList || episodeList.length === 0) {
        return NextResponse.json(
          { success: false, code: 'NO_PLAYLIST', message: `专线标识 ${mediaKey} 暂无可用切片播放地址` },
          { status: 200, headers: corsHeaders }
        );
      }

      const result = {
        success: true,
        mediaKey,
        title: title || `影视 #${mediaKey}`,
        episodes: episodeList,
        timestamp: new Date().toISOString(),
      };

      resolveCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + 1000 * 60 * 60 * 2,
      });

      return NextResponse.json(result, {
        headers: { ...corsHeaders, 'Cache-Control': 'private, max-age=1800' },
      });
    }

    // 3. 按片名搜索候选并消歧
    const cleanTitle = title.replace(/[（(].*?[）)]/g, '').trim();
    const searchResults = await ikanppProvider.searchByTitle(cleanTitle);
    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json(
        { success: false, code: 'NOT_FOUND', message: 'iKanPP专线片库暂未收录该影视' },
        { status: 200, headers: corsHeaders }
      );
    }

    const matched = matchBestIkanppLineCandidate(searchResults, {
      title: cleanTitle,
      category,
      year,
    });

    if (!matched) {
      return NextResponse.json(
        { success: false, code: 'NOT_FOUND', message: '专线片库暂未精准匹配该影视正片' },
        { status: 200, headers: corsHeaders }
      );
    }

    const episodeList = await ikanppProvider.getFullEpisodeList(matched.mediaKey);
    if (!episodeList || episodeList.length === 0) {
      return NextResponse.json(
        { success: false, code: 'NO_PLAYLIST', message: '专线源暂无可用切片' },
        { status: 200, headers: corsHeaders }
      );
    }

    const result = {
      success: true,
      mediaKey: matched.mediaKey,
      title: matched.title,
      coverImgUrl: matched.coverImgUrl,
      episodes: episodeList,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(result, {
      headers: { ...corsHeaders, 'Cache-Control': 'private, max-age=1800' },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, code: 'INTERNAL_ERROR', message: '解析异常: ' + err.message },
      { status: 500, headers: corsHeaders }
    );
  }
}
