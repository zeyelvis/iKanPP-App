import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const HOST = 'www.ikanpp.com';
const BASE_URL = `https://${HOST}`;

// IndexNow 官方与主流合作伙伴广播网关
const SEARCH_ENGINES = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

/**
 * 校验鉴权凭据 (CRON_SECRET)
 */
function verifyAuth(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    // 规范安全铁律：未配置 secret 时 Fail-Closed
    return false;
  }
  const authHeader = req.headers.get('authorization');
  if (authHeader && authHeader === `Bearer ${cronSecret}`) {
    return true;
  }
  const querySecret = req.nextUrl.searchParams.get('secret');
  if (querySecret && querySecret === cronSecret) {
    return true;
  }
  return false;
}

/**
 * GET 方法：纯健康状态查询，严禁产生外部推送副作用 (规范 21.4 节)
 */
export async function GET() {
  return NextResponse.json({
    service: 'iKanPP IndexNow Gateway',
    status: 'operational',
    method: 'POST only (GET side-effects prohibited)',
    documentation: 'https://www.indexnow.org',
  });
}

/**
 * POST 方法：安全消费内容变动事件并执行 IndexNow 广播
 */
export async function POST(req: NextRequest) {
  if (!verifyAuth(req)) {
    return NextResponse.json(
      { error: 'Unauthorized: Valid CRON_SECRET or bearer token required' },
      { status: 401 }
    );
  }

  const indexNowKey = process.env.INDEXNOW_KEY;
  if (!indexNowKey) {
    return NextResponse.json(
      { error: 'Server misconfiguration: INDEXNOW_KEY not set. Fail-Closed.' },
      { status: 500 }
    );
  }

  const keyLocation = `${BASE_URL}/${indexNowKey}.txt`;

  try {
    let urls: string[] = [];
    try {
      const body = await req.json();
      if (Array.isArray(body?.urls) && body.urls.length > 0) {
        urls = body.urls;
      }
    } catch {
      // ignore JSON parse error
    }

    // 若无明确 URL 列表，拒绝全量盲目推送以节省搜索引擎配额与反滥用
    if (urls.length === 0) {
      return NextResponse.json(
        { error: 'Bad Request: "urls" array of changed entities required' },
        { status: 400 }
      );
    }

    // 规范单次批次上限 1000 条
    const urlList = Array.from(new Set(urls)).slice(0, 1000);

    const payload = {
      host: HOST,
      key: indexNowKey,
      keyLocation,
      urlList,
    };

    // 并行向各大搜索引擎广播推送
    const pushResults = await Promise.allSettled(
      SEARCH_ENGINES.map(async (endpoint) => {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'User-Agent': 'iKanPP-AutoIndexer/1.0',
          },
          body: JSON.stringify(payload),
        });
        return {
          endpoint,
          status: res.status,
          statusText: res.statusText,
          success: res.status === 200 || res.status === 202,
        };
      })
    );

    const detailedResults = pushResults.map((p, idx) => {
      if (p.status === 'fulfilled') {
        return p.value;
      } else {
        return {
          endpoint: SEARCH_ENGINES[idx],
          status: 500,
          statusText: p.reason?.message || 'Push failed',
          success: false,
        };
      }
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      host: HOST,
      totalUrls: urlList.length,
      sampleUrls: urlList.slice(0, 5),
      results: detailedResults,
      message: 'IndexNow 变更广播完成',
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      {
        success: false,
        error: errMessage,
      },
      { status: 500 }
    );
  }
}

