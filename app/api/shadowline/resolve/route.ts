import { NextRequest, NextResponse } from 'next/server';
import { getShadowLineConfig, getShadowLineHealth } from '@/lib/services/shadowline-service';
import { gzProvider, matchBestShadowLineCandidate } from '@/lib/services/providers/gz-provider';

export const runtime = 'edge';

/**
 * 暗影自愈专线 - 客户端单点按需惰性解析接口 (Lazy Resolve API)
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
    // 允许后端服务器直调 (无 Origin 头)
    headers['Access-Control-Allow-Origin'] = '*';
  }

  return headers;
}

function extractEpisodeNumber(epStr?: string | number): number | null {
  if (epStr === undefined || epStr === null) return null;
  if (typeof epStr === 'number') return epStr;
  const match = String(epStr).match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
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
    let episode: string | number | undefined;
    let year: string | undefined;
    let category: string | undefined;

    if (req.method === 'POST') {
      const body = await req.json().catch(() => ({}));
      title = (body.title || '').trim();
      episode = body.episode;
      year = body.year;
      category = body.category || body.type;
    } else {
      const url = new URL(req.url);
      title = (url.searchParams.get('title') || '').trim();
      episode = url.searchParams.get('episode') || undefined;
      year = url.searchParams.get('year') || undefined;
      category = url.searchParams.get('category') || url.searchParams.get('type') || undefined;
    }

    if (!title) {
      return NextResponse.json(
        { success: false, code: 'PARAM_MISSING', message: '片名不能为空' },
        { status: 400, headers: corsHeaders }
      );
    }

    // 1. 熔断与状态核验
    const [config, health] = await Promise.all([
      getShadowLineConfig(),
      getShadowLineHealth(),
    ]);

    if (!config.enabled) {
      return NextResponse.json(
        { success: false, code: 'CIRCUIT_BREAK', message: '暗影专线已开启静默熔断保护' },
        { status: 200, headers: corsHeaders }
      );
    }

    if (health.status === 'offline') {
      return NextResponse.json(
        { success: false, code: 'OFFLINE', message: '暗影专线上游维护中' },
        { status: 200, headers: corsHeaders }
      );
    }

    // 2. 检查单点缓存
    const cleanTitle = title.replace(/[（(].*?[）)]/g, '').trim();
    const cacheKey = `sl_res:${cleanTitle}_${category || 'any'}_${episode || 'all'}`;
    const cached = resolveCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return NextResponse.json(cached.data, {
        headers: { ...corsHeaders, 'Cache-Control': 'private, max-age=1800' },
      });
    }

    // 3. 动态配置 Provider 凭据
    gzProvider.updateConfig({
      baseUrl: config.baseUrl,
      key: config.key,
      iv: config.iv,
      enabled: config.enabled,
    });

    // 4. 惰性搜索标的
    const searchResults = await gzProvider.search(cleanTitle);
    if (!searchResults || searchResults.length === 0) {
      return NextResponse.json(
        { success: false, code: 'NOT_FOUND', message: '专线片库暂未收录该影视' },
        { status: 200, headers: corsHeaders }
      );
    }

    // 寻找最佳匹配（多维智能消歧算法，彻底防短剧与垃圾营销号误穿）
    const matched = matchBestShadowLineCandidate(searchResults, {
      title: cleanTitle,
      category,
      year,
    });

    if (!matched) {
      return NextResponse.json(
        { success: false, code: 'NOT_FOUND', message: '专线片库暂未收录该影视正片' },
        { status: 200, headers: corsHeaders }
      );
    }

    // 5. 换取播放列表 (m3u8 直链)
    const playList = await gzProvider.getPlayList(matched.vod_id);
    if (!playList || playList.length === 0) {
      return NextResponse.json(
        { success: false, code: 'NO_PLAYLIST', message: '专线源暂无可用切片' },
        { status: 200, headers: corsHeaders }
      );
    }

    // 6. 确定目标集数
    const epNum = extractEpisodeNumber(episode);
    let targetIndex = 0;

    if (epNum !== null && epNum > 0) {
      // 优先根据集数数字匹配 (epNum 对应第几集，index 为 epNum - 1)
      const foundIdx = playList.findIndex((ep) => {
        const n = extractEpisodeNumber(ep.episode);
        return n === epNum;
      });
      if (foundIdx !== -1) {
        targetIndex = foundIdx;
      } else if (epNum - 1 < playList.length) {
        targetIndex = epNum - 1;
      }
    }

    const selectedEp = playList[targetIndex] || playList[0];

    const result = {
      success: true,
      vodId: matched.vod_id,
      title: matched.title,
      targetEpisode: {
        episode: selectedEp.episode,
        url: selectedEp.url,
        index: targetIndex,
      },
      episodes: playList.map((ep, idx) => ({
        name: ep.episode,
        url: ep.url,
        index: idx,
      })),
      timestamp: new Date().toISOString(),
    };

    // 写入内存缓存 (2小时)
    resolveCache.set(cacheKey, {
      data: result,
      expiresAt: Date.now() + 1000 * 60 * 60 * 2,
    });

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
