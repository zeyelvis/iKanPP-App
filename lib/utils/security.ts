/**
 * 安全工具模块 — URL 验证 + 速率限制 + 恒定时间比较
 */

// ====== SSRF 防护：URL 白名单验证 ======

/** 允许的图片代理域名白名单 */
const DOUBAN_IMAGE_WHITELIST = [
    'doubanio.com',
    'douban.com',
    'img1.doubanio.com',
    'img2.doubanio.com',
    'img3.doubanio.com',
    'img9.doubanio.com',
    'lzipic.com',
    'img.lzipic.com',
    'liangzipic.com',
    'img.liangzipic.com',
    'tmdb.org',
    'themoviedb.org',
];

/** 禁止访问的内网 IP 段与危险主机名 */
const PRIVATE_IP_PATTERNS = [
    /^127\./,                          // 127.0.0.0/8 (localhost)
    /^10\./,                           // 10.0.0.0/8 (Private A)
    /^172\.(1[6-9]|2\d|3[01])\./,     // 172.16.0.0/12 (Private B)
    /^192\.168\./,                     // 192.168.0.0/16 (Private C)
    /^169\.254\./,                     // 169.254.0.0/16 (Link-local & Cloud Metadata)
    /^0\./,                            // 0.0.0.0/8
    /^100\.(6[4-9]|[7-9]\d|1[01]\d|12[0-7])\./, // 100.64.0.0/10 (CGNAT)
    /^198\.18\./,                      // 198.18.0.0/15 (Benchmarking)
    /^fc00:/i,                         // IPv6 ULA
    /^fe80:/i,                         // IPv6 Link-local
    /^::1$/,                           // IPv6 localhost
    /^localhost$/i,
    /^metadata\.google\.internal$/i,   // GCP metadata
    /^169\.254\.169\.254$/,            // AWS/GCP/Azure metadata IP
];

/** 允许的 URL 协议 */
const ALLOWED_PROTOCOLS = ['http:', 'https:'];

/**
 * 验证 URL 是否为豆瓣图片域名
 */
export function isAllowedDoubanImageUrl(urlStr: string): boolean {
    try {
        const url = new URL(urlStr);
        if (!ALLOWED_PROTOCOLS.includes(url.protocol)) return false;
        const hostname = url.hostname.toLowerCase();
        return DOUBAN_IMAGE_WHITELIST.some(domain =>
            hostname === domain || hostname.endsWith('.' + domain)
        );
    } catch {
        return false;
    }
}

/**
 * 验证 URL 是否安全（非内网、合法协议）
 */
export function isSafeExternalUrl(urlStr: string | null | undefined): boolean {
    if (!urlStr || typeof urlStr !== 'string') return false;
    try {
        const url = new URL(urlStr.trim());
        // 仅允许 http/https
        if (!ALLOWED_PROTOCOLS.includes(url.protocol)) return false;
        const hostname = url.hostname.toLowerCase();
        // 禁止内网 IP/域名
        if (PRIVATE_IP_PATTERNS.some(pattern => pattern.test(hostname))) return false;
        // 禁止无点的主机名（如 localhost, intranet），除了可能存在的特殊合法顶级域
        if (!hostname.includes('.')) return false;
        return true;
    } catch {
        return false;
    }
}

// ====== 常量时间字符串比较（防时序侧信道攻击） ======

export function constantTimeCompare(a: string, b: string): boolean {
    if (typeof a !== 'string' || typeof b !== 'string') return false;
    if (a.length !== b.length) return false;

    let result = 0;
    for (let i = 0; i < a.length; i++) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
}

// ====== 速率限制（内存级，适用于 Edge Runtime） ======

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// 定期清理过期记录（每 60 秒）
let cleanupScheduled = false;
function scheduleCleanup() {
    if (cleanupScheduled) return;
    cleanupScheduled = true;
    setTimeout(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitMap) {
            if (now > entry.resetAt) rateLimitMap.delete(key);
        }
        cleanupScheduled = false;
    }, 60_000);
}

/**
 * 检查是否超过速率限制
 * @param key 限制维度（如 IP 地址）
 * @param maxRequests 窗口内最大请求数
 * @param windowMs 窗口时长（毫秒）
 * @returns true = 被限制，false = 放行
 */
export function isRateLimited(key: string, maxRequests: number, windowMs: number): boolean {
    scheduleCleanup();
    const now = Date.now();
    const entry = rateLimitMap.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitMap.set(key, { count: 1, resetAt: now + windowMs });
        return false;
    }

    entry.count++;
    return entry.count > maxRequests;
}

/**
 * 从请求中提取客户端真实 IP
 */
export function getClientIp(request: Request): string {
    const headers = request.headers;
    return headers.get('cf-connecting-ip') ||
        headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headers.get('x-real-ip') ||
        'unknown';
}
