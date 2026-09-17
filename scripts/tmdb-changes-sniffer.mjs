#!/usr/bin/env node
/**
 * TMDB Changes 15分钟高频嗅探器脚本
 * 
 * 功能：
 * 1. 定期监听 TMDB 全球影视数据库的最新 movie & tv changes
 * 2. 触发 /api/seo/tmdb-changes 接口进行极速入库与质量过滤
 * 3. 实时联动 IndexNow 与 Google Indexing API 广播收录
 */

const HOST = process.env.SITE_URL || 'https://www.ikanpp.com';
const SECRET = process.env.CRON_SECRET || 'ikanpp-cron-sync-secret';

async function main() {
  console.log('🔍 [TMDB-Sniffer] 启动 TMDB Changes 全球影视新增嗅探器...');
  const targetUrl = `${HOST}/api/seo/tmdb-changes?secret=${encodeURIComponent(SECRET)}`;

  const startTime = Date.now();
  try {
    const res = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'iKanPP-TMDB-Sniffer/1.0',
        Accept: 'application/json',
      },
    });

    const elapsed = Date.now() - startTime;
    if (!res.ok) {
      console.error(`❌ [TMDB-Sniffer] 嗅探请求失败: HTTP ${res.status} (${elapsed}ms)`);
      const text = await res.text();
      console.error('错误响应:', text);
      process.exit(1);
    }

    const data = await res.json();
    console.log(`✅ [TMDB-Sniffer] 嗅探完成 (${elapsed}ms):`);
    console.log(`   - 扫描变动总数: ${data.totalChangesFound || 0} 条`);
    console.log(`   - 新增入库实体: ${data.newlyAdded || 0} 部`);
    if (Array.isArray(data.items) && data.items.length > 0) {
      console.log('   - 本轮入库片目:');
      for (const item of data.items) {
        console.log(`     * [${item.type}] ${item.title} (ID: ${item.entityId})`);
      }
    }
    if (Array.isArray(data.pushedUrls) && data.pushedUrls.length > 0) {
      console.log(`   - 已广播推送 ${data.pushedUrls.length} 个最新详情页至全网搜索引擎`);
    }
  } catch (err) {
    console.error('❌ [TMDB-Sniffer] 嗅探执行异常:', err);
    process.exit(1);
  }
}

main();
