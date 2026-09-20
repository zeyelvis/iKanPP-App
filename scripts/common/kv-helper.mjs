/**
 * Cloudflare KV 全站通用脚本辅助 SDK (Single Source of KV Operations)
 * 供 scripts/ 目录下所有自动化、预热与同步脚本共用
 * 统管凭证别名兼容、重试退避与非阻塞降级，彻底杜绝单脚本凭证不一致与未捕获异常
 */

export function getKvConfig() {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID || process.env.CF_KV_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
  const namespaceId = process.env.CLOUDFLARE_NAMESPACE_ID || process.env.CF_KV_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
  const apiKey = process.env.CLOUDFLARE_API_KEY || process.env.CF_KV_API_KEY || process.env.CF_API_KEY || process.env.CLOUDFLARE_AUTH_KEY || '';
  const email = process.env.CLOUDFLARE_EMAIL || process.env.CF_KV_EMAIL || process.env.CF_EMAIL || process.env.CLOUDFLARE_AUTH_EMAIL || 'zeyelvis@gmail.com';

  const baseUrl = `https://api.cloudflare.com/client/v4/accounts/${accountId}/storage/kv/namespaces/${namespaceId}`;
  const headers = {
    'X-Auth-Email': email,
    'X-Auth-Key': apiKey,
  };

  return { accountId, namespaceId, apiKey, email, baseUrl, headers, hasKey: Boolean(apiKey) };
}

export async function kvGet(key) {
  const { baseUrl, headers, hasKey } = getKvConfig();
  if (!hasKey) return null;
  try {
    const res = await fetch(`${baseUrl}/values/${encodeURIComponent(key)}`, { headers });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return await res.text();
  } catch (err) {
    console.warn(`⚠️ [kvGet] 读取 ${key} 异常:`, err.message);
    return null;
  }
}

export async function kvPut(key, value) {
  const { baseUrl, headers, hasKey } = getKvConfig();
  if (!hasKey) {
    console.warn(`⚠️ [kvPut] 未检测到 API Key，跳过写入: ${key}`);
    return false;
  }
  try {
    const str = typeof value === 'string' ? value : JSON.stringify(value);
    const res = await fetch(`${baseUrl}/values/${encodeURIComponent(key)}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: str,
    });
    const data = await res.json();
    if (!data.success) {
      console.warn(`⚠️ [kvPut] 写入 ${key} 告警:`, JSON.stringify(data.errors));
      return false;
    }
    return true;
  } catch (err) {
    console.warn(`⚠️ [kvPut] 写入 ${key} 网络异常:`, err.message);
    return false;
  }
}

export async function kvBulkPut(pairs, batchSize = 1000) {
  const { baseUrl, headers, hasKey } = getKvConfig();
  if (!hasKey) {
    console.warn(`⚠️ [kvBulkPut] 未检测到 API Key，跳过批量写入 (${pairs.length} 条)`);
    return false;
  }
  let successCount = 0;
  for (let i = 0; i < pairs.length; i += batchSize) {
    const batch = pairs.slice(i, i + batchSize).map(p => ({
      key: p.key,
      value: typeof p.value === 'string' ? p.value : JSON.stringify(p.value),
    }));
    try {
      const res = await fetch(`${baseUrl}/bulk`, {
        method: 'PUT',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(batch),
      });
      const data = await res.json();
      if (!data.success) {
        console.warn(`⚠️ [kvBulkPut] 批量写入告警 (批次 ${i}):`, JSON.stringify(data.errors));
      } else {
        successCount += batch.length;
      }
    } catch (err) {
      console.warn(`⚠️ [kvBulkPut] 批量写入网络异常 (批次 ${i}):`, err.message);
    }
  }
  return successCount;
}

export async function kvDelete(key) {
  const { baseUrl, headers, hasKey } = getKvConfig();
  if (!hasKey) return false;
  try {
    const res = await fetch(`${baseUrl}/values/${encodeURIComponent(key)}`, {
      method: 'DELETE',
      headers,
    });
    const data = await res.json();
    return Boolean(data.success);
  } catch (err) {
    console.warn(`⚠️ [kvDelete] 删除 ${key} 异常:`, err.message);
    return false;
  }
}
