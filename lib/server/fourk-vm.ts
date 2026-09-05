/**
 * 4kvm.net 4K 极清专线服务端解析引擎
 * 
 * 核心能力：
 * 1. 动态加载轻量 Wasm 模块执行安全防盗链签名
 * 2. 毫秒级搜索对齐目标影视剧目
 * 3. 提取完整选集列表与对应的 dataid / secretKey
 * 4. 签出 ~8 Mbps 极清高码率 1080P/4K 直链 m3u8
 * 5. 内置智能内存缓存，极大减轻外部请求负载
 */

import { FOURK_WASM_BASE64 } from '@/lib/server/assets/fourk-vm/wasm-base64';

export interface FourkEpisode {
  name: string;
  index: number;
  dataId: string;
  secretKey: string;
  playPath: string;
  url?: string;
}

export interface FourkMovieDetail {
  id: string;
  title: string;
  cover: string;
  year?: string;
  userlink: string;
  episodes: FourkEpisode[];
}

// 内存缓存（1小时有效）
const detailCache = new Map<string, { data: FourkMovieDetail; expiresAt: number }>();
const playUrlCache = new Map<string, { url: string; expiresAt: number }>();

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

/**
 * 带严格超时的外部请求封装，防止外部目标站响应慢挂起服务端事件循环
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}, timeoutMs = 2500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

function base64ToUint8Array(base64: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(base64, 'base64'));
  }
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// ==========================================
// Wasm 动态签名执行环境封装
// ==========================================
let wasmInstance: any = null;
let wasmMemory: WebAssembly.Memory | null = null;
let isWasmInitializing = false;

// 胶水代码中的数据结构与内存读写
let heap: any[] = new Array(1024).fill(undefined);
heap.push(undefined, null, true, false);
let heap_next = heap.length;

function addHeapObject(obj: any) {
  if (heap_next === heap.length) heap.push(heap.length + 1);
  const idx = heap_next;
  heap_next = heap[idx];
  heap[idx] = obj;
  return idx;
}

function getObject(idx: number) {
  return heap[idx];
}

function dropObject(idx: number) {
  if (idx < 1028) return;
  heap[idx] = heap_next;
  heap_next = idx;
}

function takeObject(idx: number) {
  const ret = getObject(idx);
  dropObject(idx);
  return ret;
}

const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder('utf-8', { ignoreBOM: true, fatal: true });

function passStringToWasm(arg: string, malloc: any): [number, number] {
  const buf = textEncoder.encode(arg);
  const ptr = malloc(buf.length, 1) >>> 0;
  new Uint8Array(wasmMemory!.buffer).subarray(ptr, ptr + buf.length).set(buf);
  return [ptr, buf.length];
}

function getStringFromWasm(ptr: number, len: number): string {
  ptr = ptr >>> 0;
  return textDecoder.decode(new Uint8Array(wasmMemory!.buffer).subarray(ptr, ptr + len));
}

// 初始化 Wasm 实例
async function getOrInitWasm() {
  if (wasmInstance) return wasmInstance;
  if (isWasmInitializing) {
    while (isWasmInitializing) {
      await new Promise(r => setTimeout(r, 20));
    }
    return wasmInstance;
  }

  isWasmInitializing = true;
  try {
    const wasmBytes = base64ToUint8Array(FOURK_WASM_BASE64);

    const importObject = {
      './nbmovie_wasm_bg.js': {
        __wbg___wbindgen_is_undefined_52709e72fb9f179c: (arg0: number) => getObject(arg0) === undefined,
        __wbg___wbindgen_throw_6ddd609b62940d55: (arg0: number, arg1: number) => {
          throw new Error(getStringFromWasm(arg0, arg1));
        },
        __wbg_content_4373268a6f34e443: (arg0: number, arg1: number) => {
          const ret = getObject(arg1).content;
          const [ptr1, len1] = passStringToWasm(ret, wasmInstance.__wbindgen_export);
          const dv = new DataView(wasmMemory!.buffer);
          dv.setInt32(arg0 + 4 * 1, len1, true);
          dv.setInt32(arg0 + 4 * 0, ptr1, true);
        },
        __wbg_document_c0320cd4183c6d9b: (arg0: number) => {
          const doc = getObject(arg0).document;
          return !doc ? 0 : addHeapObject(doc);
        },
        __wbg_getElementById_d1f25d287b19a833: (arg0: number, arg1: number, arg2: number) => {
          const id = getStringFromWasm(arg1, arg2);
          const el = getObject(arg0).getElementById(id);
          return !el ? 0 : addHeapObject(el);
        },
        __wbg_instanceof_HtmlMetaElement_07f78901e9785572: () => true,
        __wbg_instanceof_Window_23e677d2c6843922: () => true,
        __wbg_now_16f0c993d5dd6c27: () => Date.now(),
        __wbg_static_accessor_GLOBAL_8adb955bd33fac2f: () => 0,
        __wbg_static_accessor_GLOBAL_THIS_ad356e0db91c7913: () => 0,
        __wbg_static_accessor_SELF_f207c857566db248: () => 0,
        __wbg_static_accessor_WINDOW_bb9f1ba69d61b386: () => {
          // 提供模拟的 Window 环境
          const now = Date.now();
          const fakeWindow = {
            document: {
              getElementById: (id: string) => {
                if (id === 'nb-st') return { content: String(now - 2000) };
                if (id === 'nb-plt') return { content: String(now) };
                return null;
              }
            }
          };
          return addHeapObject(fakeWindow);
        },
        __wbindgen_object_clone_ref: (arg0: number) => addHeapObject(getObject(arg0)),
        __wbindgen_object_drop_ref: (arg0: number) => {
          takeObject(arg0);
        },
      }
    };

    const result: any = await WebAssembly.instantiate(wasmBytes, importObject);
    const instance = result.instance || result;
    wasmInstance = instance.exports;
    wasmMemory = wasmInstance.memory;
    return wasmInstance;
  } finally {
    isWasmInitializing = false;
  }
}

/**
 * 实时计算 4kvm 播放请求签名并生成请求 Path
 */
export async function signPlayUrl(dataId: string, secretKey: string, quality: string = '1080', playKey: string = '0'): Promise<string> {
  const wasm = await getOrInitWasm();
  const retptr = wasm.__wbindgen_add_to_stack_pointer(-16);
  const [ptr0, len0] = passStringToWasm(dataId, wasm.__wbindgen_export);
  const [ptr1, len1] = passStringToWasm(secretKey, wasm.__wbindgen_export);
  const [ptr2, len2] = passStringToWasm(quality, wasm.__wbindgen_export);
  const [ptr3, len3] = passStringToWasm(playKey, wasm.__wbindgen_export);

  wasm.build_play_url(retptr, ptr0, len0, ptr1, len1, ptr2, len2, ptr3, len3);
  const dv = new DataView(wasmMemory!.buffer);
  const r0 = dv.getInt32(retptr + 4 * 0, true);
  const r1 = dv.getInt32(retptr + 4 * 1, true);

  wasm.__wbindgen_add_to_stack_pointer(16);
  const url = getStringFromWasm(r0, r1);
  wasm.__wbindgen_export3(r0, r1, 1);
  return url;
}

// ==========================================
// 业务爬取与对齐模块
// ==========================================

/**
 * 搜索 4kvm 影视
 */
export async function search4kvm(title: string): Promise<{ title: string; playUrl: string; cover: string } | null> {
  const cleanTitle = title.replace(/[《》【】\[\]（）()]/g, ' ').replace(/\s+/g, ' ').trim();
  const searchUrl = `https://www.4kvm.net/search?k=${encodeURIComponent(cleanTitle)}`;

  try {
    const res = await fetchWithTimeout(searchUrl, {
      headers: HEADERS,
    }, 2500);
    if (!res.ok) return null;
    const html = await res.text();

    const mainPart = html.split('搜索结果')[1] || html;
    const cardsPart = mainPart.split('<footer')[0] || mainPart;

    // 精确匹配带 data-vod-id 的搜索结果项
    const re = /<div[^>]*data-vod-id="([^"]+)"[^>]*>[\s\S]*?<a\s+href="([^"]+)"[\s\S]*?<img[^>]+(?:data-src|src)="([^"]+)"[\s\S]*?<h3[^>]*>([\s\S]*?)<\/h3>/gi;
    let match;
    const candidates: { title: string; playUrl: string; cover: string; score: number }[] = [];

    while ((match = re.exec(cardsPart)) !== null) {
      const playUrl = match[2];
      const cover = match[3];
      const rawCardTitle = match[4].replace(/<[^>]+>/g, '').trim();

      let score = 0;
      if (rawCardTitle === cleanTitle) {
        score = 100;
      } else if (rawCardTitle.includes(cleanTitle) || cleanTitle.includes(rawCardTitle)) {
        score = 60;
      }

      candidates.push({ title: rawCardTitle, playUrl, cover, score });
    }

    const validCandidates = candidates.filter(c => c.score > 0);
    if (validCandidates.length === 0) return null;
    validCandidates.sort((a, b) => b.score - a.score);
    return validCandidates[0];
  } catch (err) {
    console.error('[4kvm] Search error:', err);
    return null;
  }
}

/**
 * 获取 4kvm 影视详情与完整选集列表
 */
export async function get4kvmMovieDetail(titleOrId: string): Promise<FourkMovieDetail | null> {
  const cleanInput = titleOrId.replace(/^4kvm_/i, '').trim();
  const cacheKey = cleanInput;
  const cached = detailCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  // 判断是否直接是 4kvm 的 play ID（一般为 8-16 位的字母数字，如 cgzq7f65g）
  const isPlayId = /^[a-zA-Z0-9_-]{6,20}$/.test(cleanInput) && !/[\u4e00-\u9fa5\s]/.test(cleanInput);
  let playPath = isPlayId ? `/play/${cleanInput}` : '';
  let movieTitle = '';
  let movieCover = '';

  if (!playPath) {
    const matched = await search4kvm(cleanInput);
    if (!matched) return null;
    playPath = matched.playUrl;
    movieTitle = matched.title;
    movieCover = matched.cover;
  }

  try {
    const playPageUrl = `https://www.4kvm.net${playPath}`;
    const res = await fetchWithTimeout(playPageUrl, {
      headers: {
        ...HEADERS,
        Referer: 'https://www.4kvm.net/',
      },
    }, 2500);
    if (!res.ok) return null;
    const html = await res.text();

    // 若未通过搜索获得标题，从页面 h1 或 title 标签提取
    if (!movieTitle) {
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      if (h1Match) {
        movieTitle = h1Match[1].replace(/<[^>]+>/g, '').trim();
      } else {
        const titleTagMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
        if (titleTagMatch) {
          movieTitle = titleTagMatch[1].split('-')[0].replace(/第\s*\d+\s*集/g, '').trim();
        }
      }
    }

    // 若未通过搜索获得封面，优先从 og:image 提取，或从真实海报 img 标签中提取
    if (!movieCover || movieCover.includes('item.cover') || !movieCover.startsWith('http')) {
      const ogMatch = html.match(/property=["']og:image["']\s+content=["']([^"']+)["']/i)
        || html.match(/content=["']([^"']+)["']\s+property=["']og:image["']/i);
      if (ogMatch && ogMatch[1].startsWith('http')) {
        movieCover = ogMatch[1].replace(/&amp;/g, '&');
      } else {
        const posterImgMatch = html.match(/<img[^>]+src=["'](https?:\/\/[^"']+)["'][^>]*alt=["'][^"']*["'][^>]*class=["'][^"']*(?:cover|poster)[^"']*["']/i)
          || html.match(/<img[^>]+class=["'][^"']*(?:cover|poster)[^"']*["'][^>]*src=["'](https?:\/\/[^"']+)["']/i);
        if (posterImgMatch) {
          movieCover = posterImgMatch[1].replace(/&amp;/g, '&');
        }
      }
    }

    // 提取 userlink
    let userlink = '0';
    const userlinkMatch = html.match(/userlink:\s*['"]([^'"]+)['"]/);
    if (userlinkMatch) {
      userlink = userlinkMatch[1];
    }

    // 提取选集列表: <a href="/play/cgzq7f3tf" ... data-episode="1" dataid="1551" ...>
    const epRegex = /<a\s+[^>]*href="(\/play\/([a-zA-Z0-9]+))"[^>]*data-episode="(\d+)"[^>]*dataid="(\d+)"[^>]*>/gi;
    let epMatch;
    const episodes: FourkEpisode[] = [];

    while ((epMatch = epRegex.exec(html)) !== null) {
      const playPath = epMatch[1];
      const secretKey = epMatch[2];
      const epNum = parseInt(epMatch[3], 10);
      const dataId = epMatch[4];

      episodes.push({
        name: `第${epNum}集`,
        index: epNum,
        dataId,
        secretKey,
        playPath,
      });
    }

    // 如果未通过正则匹配到多集（可能是单部电影），尝试解析单一播放器挂载的 vodid
    const resolvedSecretKey = playPath.replace(/^\/play\//, '');
    if (episodes.length === 0) {
      const vodIdMatch = html.match(/data-v-id="(\d+)"/) || html.match(/dataid="(\d+)"/);
      if (vodIdMatch) {
        episodes.push({
          name: '4K 正片',
          index: 1,
          dataId: vodIdMatch[1],
          secretKey: resolvedSecretKey,
          playPath,
        });
      }
    }

    const detail: FourkMovieDetail = {
      id: resolvedSecretKey,
      title: movieTitle || '4K 蓝光影视',
      cover: movieCover || '',
      userlink,
      episodes,
    };

    detailCache.set(cacheKey, { data: detail, expiresAt: Date.now() + 3600 * 1000 });
    return detail;
  } catch (err) {
    console.error('[4kvm] Detail parse error:', err);
    return null;
  }
}

/**
 * 获取指定集数的真实 m3u8 播放地址
 */
export async function get4kvmStreamUrl(detail: FourkMovieDetail, episodeIndex: number = 1): Promise<string | null> {
  const targetEp = detail.episodes.find(e => e.index === episodeIndex) || detail.episodes[0];
  if (!targetEp) return null;

  const cacheKey = `${detail.id}_${targetEp.dataId}_${targetEp.secretKey}`;
  const cached = playUrlCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.url;
  }

  try {
    const signedPath = await signPlayUrl(targetEp.dataId, targetEp.secretKey, '1080', detail.userlink);
    const apiUrl = `https://www.4kvm.net${signedPath}`;

    const res = await fetchWithTimeout(apiUrl, {
      headers: {
        ...HEADERS,
        Referer: `https://www.4kvm.net/play/${targetEp.secretKey}`,
        Accept: 'application/json, text/plain, */*',
      },
    }, 2500);

    if (!res.ok) return null;
    const json = await res.json();

    if (json.code === 200 && json.data?.quality_urls?.length > 0) {
      const validItem = json.data.quality_urls.find((q: any) => q.url && typeof q.url === 'string' && q.url.startsWith('http'));
      const m3u8Url = validItem?.url;
      if (m3u8Url) {
        playUrlCache.set(cacheKey, { url: m3u8Url, expiresAt: Date.now() + 3600 * 1000 });
        return m3u8Url;
      }
    }

    return null;
  } catch (err) {
    console.error('[4kvm] Stream resolve error:', err);
    return null;
  }
}
