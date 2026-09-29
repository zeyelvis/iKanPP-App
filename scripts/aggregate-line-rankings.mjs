#!/usr/bin/env node
/**
 * 汇总近 7 天按国家/地区的线路连通率画像并写入 Cloudflare KV
 * 
 * 核心逻辑：
 * 1. 从 Cloudflare Analytics Engine (ikanpp_playback) 执行 SQL 汇总近 7 天指标；
 * 2. 聚合生成各国 line-rank:{country} 与全球 line-rank:* 数据；
 * 3. 写入 Cloudflare KV 供播放容器 /api/line-rank 高速读取；
 * 4. 遵守工程准则第 20 条：即便无凭据或网络异常，也安全记录日志并 exit(0)，绝不中断 CI/CD 巡检流水线。
 */

const ACCOUNT_ID = process.env.CF_ACCOUNT_ID || process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const NAMESPACE_ID = process.env.CF_KV_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CF_KV_API_KEY || process.env.CF_API_KEY || process.env.CLOUDFLARE_AUTH_KEY || '';
const API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || process.env.CF_API_TOKEN || '';
const EMAIL = process.env.CLOUDFLARE_EMAIL || 'zeyelvis@gmail.com';

function getAuthHeaders() {
  if (API_TOKEN) {
    return {
      'Authorization': `Bearer ${API_TOKEN}`,
      'Content-Type': 'application/json',
    };
  }
  return {
    'X-Auth-Email': EMAIL,
    'X-Auth-Key': API_KEY,
    'Content-Type': 'application/json',
  };
}

async function main() {
  console.log('📊 启动近 7 天地区线路质量指标聚合巡检任务...');

  if (!API_TOKEN && !API_KEY) {
    console.log('ℹ️ 未检测到 Cloudflare API 凭据，跳过远端 Analytics Engine 查询，保持现有 KV 线路画像。');
    process.exit(0);
  }

  try {
    // 1. 发起 Analytics Engine SQL 查询
    const sql = `
      SELECT
        blob1 AS country,
        blob2 AS source,
        blob3 AS status,
        count() AS total
      FROM ikanpp_playback
      WHERE timestamp >= NOW() - INTERVAL '7' DAY
      GROUP BY country, source, status
    `;

    const sqlUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql`;
    const res = await fetch(sqlUrl, {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'Content-Type': 'text/plain',
      },
      body: sql,
    });

    if (!res.ok) {
      console.warn(`⚠️ Analytics Engine SQL 响应非 200 (${res.status})，降级退出。`);
      process.exit(0);
    }

    const data = await res.json();
    const rows = data?.data || [];
    console.log(`📈 成功拉取到 ${rows.length} 条近 7 天线路运行指标记录。`);

    if (rows.length === 0) {
      console.log('ℹ️ 近 7 天尚无新指标，无需刷新 KV。');
      process.exit(0);
    }

    // 2. 统计聚合
    const countryData = {};
    const globalData = {};

    for (const row of rows) {
      const country = String(row.country || 'XX').toUpperCase();
      const source = String(row.source || '');
      const status = String(row.status || '').toLowerCase();
      const count = parseInt(row.total || '0', 10) || 0;

      if (!source || count <= 0) continue;

      // 聚合国家
      if (!countryData[country]) countryData[country] = {};
      if (!countryData[country][source]) countryData[country][source] = { ok: 0, fail: 0 };
      if (status === 'ok') countryData[country][source].ok += count;
      else countryData[country][source].fail += count;

      // 聚合全球
      if (!globalData[source]) globalData[source] = { ok: 0, fail: 0 };
      if (status === 'ok') globalData[source].ok += count;
      else globalData[source].fail += count;
    }

    // 3. 构建 KV Bulk 写入 Payload
    const kvPairs = [];
    for (const [country, stats] of Object.entries(countryData)) {
      kvPairs.push({
        key: `line-rank:${country}`,
        value: JSON.stringify(stats),
      });
    }
    kvPairs.push({
      key: 'line-rank:*',
      value: JSON.stringify(globalData),
    });

    console.log(`📤 正在将 ${kvPairs.length} 组国家与全球线路画像写入 Cloudflare KV...`);

    const bulkUrl = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/bulk`;
    const writeRes = await fetch(bulkUrl, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(kvPairs),
    });

    const writeData = await writeRes.json();
    if (writeData.success) {
      console.log('🎉 地区线路质量学习画像全部成功同步至 KV 存储！');
    } else {
      console.warn('⚠️ KV 写入未完全成功:', JSON.stringify(writeData.errors));
    }
  } catch (err) {
    console.warn('⚠️ 线路指标聚合任务异常，安全跳过:', err instanceof Error ? err.message : String(err));
  }

  process.exit(0);
}

main();
