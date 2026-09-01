import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const liveId = searchParams.get('id') || '538';
  const name = searchParams.get('name') || '电视直播';

  try {
    const targetUrl = `https://huaren.live/liveplay/${liveId}-1.html`;
    const res = await fetch(targetUrl, {
      headers: {
        'User-Agent': USER_AGENT,
        'Referer': 'https://huaren.live/',
      },
      next: { revalidate: 300 }, // 边缘缓存 5 分钟
    });

    if (!res.ok) {
      return new NextResponse(renderErrorHtml('信号源连接失败，请稍后重试'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 502,
      });
    }

    const html = await res.text();
    // 提取流媒体地址 url=https://...
    const match = html.match(/playUrl\s*=\s*'[^']*url=([^&']+(&auth=[^']*)?)'/);
    let streamUrl = '';

    if (match && match[1]) {
      streamUrl = match[1];
    } else {
      // 备用正则提取
      const matchFallback = html.match(/https:\/\/live\.[^\/]+\/stream\/[^\s'"]+\.m3u8[^\s'"]*/);
      if (matchFallback) {
        streamUrl = matchFallback[0];
      }
    }

    if (!streamUrl) {
      return new NextResponse(renderErrorHtml('未找到该频道的直播流，请切换其他频道'), {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
        status: 404,
      });
    }

    // 生成 100% 纯净、无任何第三方水印和背景的西瓜流媒体播放器 HTML
    const playerHtml = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="referrer" content="no-referrer">
    <title>${escapeHtml(name)} - iKanPP 直播</title>
    <link rel="stylesheet" href="https://unpkg.byted-static.com/xgplayer/3.0.23/dist/index.min.css"/>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body, html {
            width: 100%;
            height: 100%;
            background: #000000 !important;
            overflow: hidden;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        #ikan-live-player {
            width: 100% !important;
            height: 100% !important;
            background: #000000 !important;
        }
        /* 隐藏西瓜播放器所有自带的海报层背景图 */
        .xgplayer-poster, .xgplayer .xgplayer-poster {
            background-image: none !important;
            background: #000000 !important;
        }
        /* 纯净加载旋转动画 */
        .ikan-loading {
            position: absolute;
            inset: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #000000;
            z-index: 10;
            transition: opacity 0.3s ease;
            pointer-events: none;
        }
        .ikan-loading.hide {
            opacity: 0;
        }
        .spinner {
            width: 44px;
            height: 44px;
            border: 3px solid rgba(255, 255, 255, 0.1);
            border-top-color: #e50914;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .loading-text {
            color: rgba(255, 255, 255, 0.7);
            font-size: 13px;
            margin-top: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
        }
    </style>
</head>
<body>
    <div id="loading" class="ikan-loading">
        <div class="spinner"></div>
        <div class="loading-text">${escapeHtml(name)} · 高清专线直连中</div>
    </div>
    <div id="ikan-live-player"></div>

    <script src="https://unpkg.byted-static.com/xgplayer/3.0.23/dist/index.min.js"></script>
    <script src="https://unpkg.byted-static.com/xgplayer-hls/3.0.23/dist/index.min.js"></script>
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            var streamUrl = ${JSON.stringify(streamUrl)};
            var loadingEl = document.getElementById('loading');

            var config = {
                id: 'ikan-live-player',
                url: streamUrl,
                playsinline: true,
                poster: '', // 彻底移除任何第三方背景图
                isLive: true,
                autoplay: true,
                autoplayMuted: true, // 确保各大浏览器秒开起播
                fluid: true,
                volume: 1,
                width: window.innerWidth,
                height: window.innerHeight,
                plugins: [HlsPlayer],
                lang: 'zh-cn'
            };

            var player = new Player(config);

            function hideLoading() {
                if (loadingEl) {
                    loadingEl.classList.add('hide');
                    setTimeout(function() {
                        if (loadingEl && loadingEl.parentNode) {
                            loadingEl.parentNode.removeChild(loadingEl);
                        }
                    }, 400);
                }
            }

            player.on('playing', hideLoading);
            player.on('canplay', hideLoading);
            player.on('loadeddata', hideLoading);

            // 自动容错重连
            var retryCount = 0;
            player.on('error', function(e) {
                if (retryCount < 6) {
                    retryCount++;
                    setTimeout(function() {
                        player.src = streamUrl;
                        player.reload();
                    }, 3000);
                }
            });
        });
    </script>
</body>
</html>`;

    return new NextResponse(playerHtml, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '服务繁忙，请稍后刷新重试';
    return new NextResponse(renderErrorHtml(msg), {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
      status: 500,
    });
  }
}

function escapeHtml(str: string) {
  return str.replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[m] || m));
}

function renderErrorHtml(msg: string) {
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><style>body{background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;font-family:sans-serif;font-size:14px;}</style></head><body><p>${escapeHtml(msg)}</p></body></html>`;
}
