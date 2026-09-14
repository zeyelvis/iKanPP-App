/**
 * Service Worker — KVideo 多层缓存策略
 * 
 * 缓存层级：
 * 1. video-cache   — HLS m3u8 manifest + ts 分片（Stale-While-Revalidate / Cache-First）
 * 2. img-cache     — 图片代理缓存（Cache-First，7 天过期）
 * 3. api-cache     — API 响应数据（Network-First，5 分钟过期）
 * 4. page-cache    — 页面 shell（Network-First，离线回退）
 */

const VIDEO_CACHE = 'video-cache-v3';
const IMG_CACHE = 'img-cache-v1';
const API_CACHE = 'api-cache-v1';
const PAGE_CACHE = 'page-cache-v3';

const ALL_CACHES = [VIDEO_CACHE, IMG_CACHE, API_CACHE, PAGE_CACHE];

// 核心预缓存 URL 列表：全站核心大厅与高保真首屏资源
const PRECACHE_URLS = [
  '/',
  '/movie',
  '/tv',
  '/anime',
  '/variety',
  '/documentary',
  '/ranking',
  '/short',
];

// 图片缓存 7 天过期
const IMG_MAX_AGE = 7 * 24 * 60 * 60 * 1000;
// API 缓存 5 分钟过期
const API_MAX_AGE = 5 * 60 * 1000;

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(PAGE_CACHE).then((cache) => {
      // 预缓存核心页面（容错模式，避免单个页面失败阻断安装）
      return Promise.allSettled(
        PRECACHE_URLS.map((url) =>
          fetch(url, { cache: 'no-cache' }).then((response) => {
            if (response.ok) return cache.put(url, response);
          }).catch(() => null)
        )
      );
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!ALL_CACHES.includes(cacheName)) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // 跳过非 GET 请求
    if (event.request.method !== 'GET') return;

    // 跳过视频流代理
    if (url.pathname.startsWith('/api/proxy')) return;

    // === 1. 全球/大陆影视海报全能极速缓存（Cache-First 0ms 响应）===
    const isOptimizedImage =
        url.pathname.startsWith('/api/img-proxy') ||
        url.hostname === 'img.ikanpp.com' ||
        url.hostname.includes('r2.dev') ||
        url.hostname.includes('tmdb.org') ||
        url.hostname.includes('doubanio.com') ||
        url.pathname.match(/\.(webp|avif|jpg|jpeg|png)$/i);

    if (isOptimizedImage && !url.pathname.startsWith('/api/proxy')) {
        event.respondWith(
            caches.open(IMG_CACHE).then(async (cache) => {
                const cached = await cache.match(event.request);
                if (cached) {
                    // 海报图片具备天然不可变性，直接 0ms 极速输出！
                    return cached;
                }
                // 未命中：网络请求后存入本地持久缓存
                try {
                    const response = await fetch(event.request);
                    if (response.ok) {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                } catch {
                    return cached || new Response('Image unavailable', { status: 503 });
                }
            })
        );
        return;
    }

    // === 2. HLS manifest 缓存（Stale-While-Revalidate）===
    if (url.pathname.endsWith('.m3u8')) {
        event.respondWith(
            caches.open(VIDEO_CACHE).then((cache) => {
                return cache.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
                    const fetchPromise = fetch(event.request).then((networkResponse) => {
                        if (!networkResponse || networkResponse.status !== 200) {
                            if (networkResponse) return networkResponse;
                            throw new Error('Network response was not ok');
                        }
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    }).catch((err) => {
                        console.error('[SW] Fetch failed for manifest:', err);
                        if (cachedResponse) return cachedResponse;
                        return new Response('Network error', {
                            status: 503,
                            statusText: 'Service Worker: Network Unavailable'
                        });
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
        return;
    }

    // === 3. 视频分片缓存（Cache-First）===
    if (url.pathname.endsWith('.ts')) {
        event.respondWith(
            caches.open(VIDEO_CACHE).then((cache) => {
                return cache.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
                    if (cachedResponse) return cachedResponse;
                    return fetch(event.request).then((response) => {
                        if (response && response.status === 200) {
                            cache.put(event.request, response.clone());
                        }
                        return response;
                    }).catch((error) => {
                        console.error('[SW] Failed to fetch segment:', error);
                        return new Response('Network error', {
                            status: 503,
                            statusText: 'Service Worker: Network Unavailable'
                        });
                    });
                });
            })
        );
        return;
    }

    // === 4. API 数据缓存（Network-First，5 分钟过期）===
    if (url.pathname.startsWith('/api/douban') || url.pathname.startsWith('/api/search')) {
        event.respondWith(
            caches.open(API_CACHE).then(async (cache) => {
                try {
                    const response = await fetch(event.request);
                    if (response.ok) {
                        const headers = new Headers(response.headers);
                        headers.set('x-sw-cached-at', Date.now().toString());
                        const timedResponse = new Response(await response.clone().arrayBuffer(), {
                            status: response.status,
                            statusText: response.statusText,
                            headers: headers,
                        });
                        cache.put(event.request, timedResponse);
                    }
                    return response;
                } catch {
                    // 网络失败，尝试返回缓存
                    const cached = await cache.match(event.request);
                    if (cached) {
                        const cachedTime = cached.headers.get('x-sw-cached-at');
                        if (cachedTime && (Date.now() - parseInt(cachedTime)) < API_MAX_AGE) {
                            return cached;
                        }
                    }
                    return new Response('Network error', { status: 503 });
                }
            })
        );
        return;
    }

    // === 5. 静态资源与 JS/CSS Bundle 极速缓存（Stale-While-Revalidate）===
    if (url.pathname.startsWith('/_next/static/') || url.pathname.match(/\.(js|css|woff2|png|svg|ico)$/)) {
        event.respondWith(
            caches.open(PAGE_CACHE).then(async (cache) => {
                const cached = await cache.match(event.request);
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    if (networkResponse && networkResponse.ok) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => cached);

                return cached || fetchPromise;
            })
        );
        return;
    }

    // === 6. 页面 shell 缓存（Network-First + 离线回退）===
    if (event.request.mode === 'navigate') {
        event.respondWith(
            caches.open(PAGE_CACHE).then(async (cache) => {
                try {
                    const response = await fetch(event.request);
                    if (response.ok) {
                        cache.put(event.request, response.clone());
                    }
                    return response;
                } catch {
                    // 离线：返回缓存的页面
                    const cached = await cache.match(event.request);
                    if (cached) return cached;
                    // 最终回退：尝试返回首页缓存
                    const indexCached = await cache.match('/');
                    if (indexCached) return indexCached;
                    return new Response('离线不可用', {
                        status: 503,
                        headers: { 'Content-Type': 'text/html; charset=utf-8' },
                    });
                }
            })
        );
        return;
    }
});
