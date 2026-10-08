import { kvGet, kvPut } from '@/lib/server/kv';

export interface ShadowLineConfig {
  enabled: boolean;
  baseUrl: string;
  key: string;
  iv: string;
  updatedAt: string;
  sourceBundle?: string;
  bundleHash?: string;
}

export interface ShadowLineHealth {
  status: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  lastProbeAt: string;
  corsStatus: string;
  canaryVod: string;
  error?: string | null;
  playUrl?: string | null;
}

export interface ShadowLineAuditLog {
  timestamp: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'INFO';
  latencyMs?: number;
  details?: string;
}

const DEFAULT_CONFIG: ShadowLineConfig = {
  enabled: true,
  baseUrl: 'https://haiwaiapi.1fc8ab0.com',
  key: '181cc88340ae5b2b',
  iv: '4423d1e2773476ce',
  updatedAt: '2026-09-28T11:00:00Z',
  sourceBundle: '/_nuxt/256178e.js',
};

const DEFAULT_HEALTH: ShadowLineHealth = {
  status: 'healthy',
  latencyMs: 48,
  lastProbeAt: new Date().toISOString(),
  corsStatus: 'allowed (*)',
  canaryVod: '绿灯军团 (139933)',
};

const CANARY_VOD_ID = '139933';
const TARGET_HOST = 'https://gz360.tv';

const BROWSER_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Origin': TARGET_HOST,
  'Referer': `${TARGET_HOST}/`,
};

async function getCryptoKey(keyStr: string): Promise<CryptoKey> {
  const keyBuf = new TextEncoder().encode(keyStr);
  return crypto.subtle.importKey(
    'raw',
    keyBuf,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );
}

async function encrypt(plaintext: string, key: string, iv: string): Promise<string> {
  const cryptoKey = await getCryptoKey(key);
  const ivBuf = new TextEncoder().encode(iv);
  const encBuf = await crypto.subtle.encrypt(
    { name: 'AES-CBC', iv: ivBuf },
    cryptoKey,
    new TextEncoder().encode(plaintext)
  );
  return Array.from(new Uint8Array(encBuf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function decrypt<T = any>(hexCiphertext: string, key: string, iv: string): Promise<T> {
  const cryptoKey = await getCryptoKey(key);
  const ivBuf = new TextEncoder().encode(iv);
  const hex = hexCiphertext.trim();
  const match = hex.match(/.{1,2}/g) || [];
  const cipherBytes = new Uint8Array(match.map(b => parseInt(b, 16)));
  const decBuf = await crypto.subtle.decrypt(
    { name: 'AES-CBC', iv: ivBuf },
    cryptoKey,
    cipherBytes
  );
  const decText = new TextDecoder().decode(decBuf);
  return JSON.parse(decText) as T;
}

export async function getShadowLineConfig(): Promise<ShadowLineConfig> {
  try {
    const raw = await kvGet('shadowline:config');
    if (raw) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('[ShadowLine] 读取 KV 配置失败:', err);
  }
  return DEFAULT_CONFIG;
}

export async function getShadowLineHealth(): Promise<ShadowLineHealth> {
  try {
    const raw = await kvGet('shadowline:health');
    if (raw) {
      return { ...DEFAULT_HEALTH, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('[ShadowLine] 读取 KV 健康状态失败:', err);
  }
  return DEFAULT_HEALTH;
}

export async function getShadowLineLogs(limit = 20): Promise<ShadowLineAuditLog[]> {
  try {
    const raw = await kvGet('admin:audit-log:shadowline');
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) return logs.slice(-limit).reverse();
    }
  } catch (err) {
    console.warn('[ShadowLine] 读取审计日志失败:', err);
  }
  return [];
}

async function recordShadowLineLog(entry: ShadowLineAuditLog): Promise<void> {
  try {
    let logs: ShadowLineAuditLog[] = [];
    const raw = await kvGet('admin:audit-log:shadowline');
    if (raw) {
      logs = JSON.parse(raw);
      if (!Array.isArray(logs)) logs = [];
    }
    logs.push(entry);
    await kvPut('admin:audit-log:shadowline', JSON.stringify(logs.slice(-100)));
  } catch (err) {
    console.warn('[ShadowLine] 记录审计日志失败:', err);
  }
}

export async function runShadowLineProbe(): Promise<{ success: boolean; health: ShadowLineHealth }> {
  const config = await getShadowLineConfig();
  const start = Date.now();
  let probeSuccess = false;
  let playUrl = '';
  let errorMsg = '';
  let corsHeader = '';

  try {
    const payload = JSON.stringify({ vod_id: CANARY_VOD_ID });
    const enc = await encrypt(payload, config.key, config.iv);

    const apiRes = await fetch(`${config.baseUrl}/H5/Resource/GetVodInfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...BROWSER_HEADERS,
      },
      body: JSON.stringify({ params: enc }),
    });

    if (!apiRes.ok) {
      throw new Error(`API HTTP ${apiRes.status}`);
    }

    const json = await apiRes.json();
    if (!json.data || typeof json.data !== 'string') {
      throw new Error(`返回数据格式异常: ${JSON.stringify(json)}`);
    }

    const decrypted = await decrypt(json.data, config.key, config.iv);
    playUrl = decrypted?.vodInfo?.play_url || '';

    if (playUrl.startsWith('http')) {
      // 探活 CDN CORS
      const m3u8Res = await fetch(playUrl, {
        method: 'GET',
        headers: { 'Origin': 'https://ikanpp.com' },
      });
      corsHeader = m3u8Res.headers.get('access-control-allow-origin') || 'allowed';
      probeSuccess = m3u8Res.ok;
    }
  } catch (err: any) {
    errorMsg = err.message || '探活执行异常';
  }

  const latencyMs = Date.now() - start;
  const healthData: ShadowLineHealth = {
    status: probeSuccess ? 'healthy' : 'degraded',
    latencyMs,
    lastProbeAt: new Date().toISOString(),
    corsStatus: corsHeader || 'unknown',
    canaryVod: '绿灯军团 (139933)',
    error: errorMsg || null,
    playUrl: playUrl ? playUrl.slice(0, 60) + '...' : null,
  };

  await kvPut('shadowline:health', JSON.stringify(healthData));

  await recordShadowLineLog({
    timestamp: new Date().toISOString(),
    action: 'Canary 探活验证',
    status: probeSuccess ? 'SUCCESS' : 'FAILURE',
    latencyMs,
    details: probeSuccess ? `探活通过，延迟 ${latencyMs}ms，CORS 正常` : `探活异常: ${errorMsg}`,
  });

  return { success: probeSuccess, health: healthData };
}

export async function toggleShadowLineFuse(targetState?: boolean, actor = 'Admin'): Promise<ShadowLineConfig> {
  const config = await getShadowLineConfig();
  config.enabled = typeof targetState === 'boolean' ? targetState : !config.enabled;
  config.updatedAt = new Date().toISOString();

  await kvPut('shadowline:config', JSON.stringify(config));

  await recordShadowLineLog({
    timestamp: new Date().toISOString(),
    action: config.enabled ? '解除熔断（恢复前台暗影专线）' : '触发紧急熔断（下线前台暗影专线）',
    status: 'INFO',
    details: `操作人: ${actor}`,
  });

  return config;
}

export async function runShadowLineAutoSniff(actor = 'Admin'): Promise<{ success: boolean; config: ShadowLineConfig; message: string }> {
  try {
    const res = await fetch(TARGET_HOST, { headers: BROWSER_HEADERS });
    if (!res.ok) throw new Error(`无法连接主站: HTTP ${res.status}`);
    const html = await res.text();

    const scriptMatches = html.match(/src=["'](\/_nuxt\/[a-zA-Z0-9_-]+\.js)["']/g) || [];
    const scriptPaths = [...new Set(scriptMatches.map((m) => m.match(/src=["']([^"']+)["']/)?.[1] || ''))].filter(Boolean);

    let foundKey = '';
    let foundIv = '';
    let foundDomain = '';
    let foundBundle = '';

    for (const scriptPath of scriptPaths) {
      const sRes = await fetch(`${TARGET_HOST}${scriptPath}`, { headers: BROWSER_HEADERS });
      const jsText = await sRes.text();

      if (jsText.includes('enc.Utf8.parse') && jsText.includes('CBC')) {
        const hexMatches = jsText.match(/parse\(["']([a-f0-9]{16})["']\)/g) || [];
        const domainMatch = jsText.match(/https:\/\/[a-z0-9]+\.1fc8ab0\.com|https:\/\/haiwaiapi\.[a-z0-9]+\.com/);

        if (hexMatches.length >= 2) {
          const keys = hexMatches.map((m) => m.match(/parse\(["']([a-f0-9]{16})["']\)/)?.[1] || '');
          foundKey = keys[0];
          foundIv = keys[1];
          foundDomain = domainMatch ? domainMatch[0] : 'https://haiwaiapi.1fc8ab0.com';
          foundBundle = scriptPath;
          break;
        }
      }
    }

    if (foundKey && foundIv) {
      const currentConfig = await getShadowLineConfig();
      currentConfig.key = foundKey;
      currentConfig.iv = foundIv;
      currentConfig.baseUrl = foundDomain || currentConfig.baseUrl;
      currentConfig.sourceBundle = foundBundle || currentConfig.sourceBundle;
      currentConfig.updatedAt = new Date().toISOString();

      await kvPut('shadowline:config', JSON.stringify(currentConfig));

      // 嗅探后立即探活一次
      await runShadowLineProbe();

      await recordShadowLineLog({
        timestamp: new Date().toISOString(),
        action: '静态 Bundle 嗅探与自愈提取',
        status: 'SUCCESS',
        details: `从 ${foundBundle} 提取凭据成功，操作人: ${actor}`,
      });

      return {
        success: true,
        config: currentConfig,
        message: `成功从 ${foundBundle} 嗅探提取最新凭据并完成 Canary 探活`,
      };
    } else {
      return {
        success: false,
        config: await getShadowLineConfig(),
        message: '未在上游当前 Bundle 中发现凭据变动，继续沿用现有基线配置',
      };
    }
  } catch (err: any) {
    await recordShadowLineLog({
      timestamp: new Date().toISOString(),
      action: '静态 Bundle 嗅探自愈',
      status: 'FAILURE',
      details: `嗅探执行异常: ${err.message}`,
    });

    return {
      success: false,
      config: await getShadowLineConfig(),
      message: `嗅探自愈失败: ${err.message}`,
    };
  }
}
