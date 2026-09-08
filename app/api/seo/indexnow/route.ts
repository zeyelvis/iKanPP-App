import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const INDEXNOW_KEY = '7f2e1b4c9a8d3e5f6a1b2c3d4e5f6071';
const HOST = 'www.ikanpp.com';
const BASE_URL = `https://${HOST}`;
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

// IndexNow 官方与主流合作伙伴广播网关
const SEARCH_ENGINES = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

async function handleIndexNowPush(req: NextRequest) {
  try {
    let urls: string[] = [];
    if (req.method === 'POST') {
      try {
        const body = await req.json();
        if (Array.isArray(body?.urls) && body.urls.length > 0) {
          urls = body.urls;
        }
      } catch { /* ignore empty body */ }
    }

    // 若无直接传入 URL，从网站 sitemap.xml 动态提取
    if (urls.length === 0) {
      const origin = req.nextUrl.origin || BASE_URL;
      const sitemapRes = await fetch(`${origin}/sitemap.xml`, {
        cache: 'no-store',
      });

      if (!sitemapRes.ok) {
        throw new Error(`无法获取 sitemap.xml: HTTP ${sitemapRes.status}`);
      }

      const xml = await sitemapRes.text();
      const locMatches = xml.matchAll(/<loc>([^<]+)<\/loc>/gi);
      for (const match of locMatches) {
        if (match[1]) {
          urls.push(match[1].trim());
        }
      }
    }

    // 确保至少有基础核心大厅
    if (urls.length === 0) {
      urls.push(
        `${BASE_URL}/`,
        `${BASE_URL}/movie`,
        `${BASE_URL}/tv`,

        `${BASE_URL}/anime`,
        `${BASE_URL}/variety`,
        `${BASE_URL}/ranking`,
        `${BASE_URL}/iptv`
      );
    }

    // IndexNow 每次最多支持 10,000 个 URL，选取最新的前 1,000 条
    const urlList = Array.from(new Set(urls)).slice(0, 1000);

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    };

    // 2. 并行向各大搜索引擎广播推送
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
      message: 'IndexNow 自动广播完成，搜索引擎将在数分钟内启动抓取与建库',
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

export async function GET(req: NextRequest) {
  return handleIndexNowPush(req);
}

export async function POST(req: NextRequest) {
  return handleIndexNowPush(req);
}
