/**
 * iKanPP 自动化搜索引擎推送脚本 (IndexNow)
 * 作用：在 GitHub Actions 部署完成后自动触发，将全站所有页面推送到 Bing / IndexNow 搜索引擎
 */

const INDEXNOW_KEY = '7f2e1b4c9a8d3e5f6a1b2c3d4e5f6071';
const HOST = 'www.ikanpp.com';
const BASE_URL = `https://${HOST}`;
const KEY_LOCATION = `${BASE_URL}/${INDEXNOW_KEY}.txt`;

const SEARCH_ENGINES = [
  'https://api.indexnow.org/indexnow',
  'https://www.bing.com/indexnow',
  'https://yandex.com/indexnow',
];

async function run() {
  console.log('📡 [IndexNow] 正在从线上提取最新的 sitemap.xml...');
  try {
    const sitemapUrl = `${BASE_URL}/sitemap.xml`;
    const res = await fetch(sitemapUrl, {
      headers: { 'User-Agent': 'iKanPP-AutoIndexer/1.0' }
    });

    let urls = [];
    if (res.ok) {
      const xml = await res.text();
      const locMatches = xml.matchAll(/<loc>([^<]+)<\/loc>/gi);
      for (const match of locMatches) {
        if (match[1]) urls.push(match[1].trim());
      }
    }

    if (urls.length === 0) {
      urls = [
        `${BASE_URL}/`,
        `${BASE_URL}/movie`,
        `${BASE_URL}/tv`,
        `${BASE_URL}/guoman`,
        `${BASE_URL}/anime`,
        `${BASE_URL}/variety`,
        `${BASE_URL}/ranking`,
        `${BASE_URL}/iptv`,
      ];
    }

    const urlList = Array.from(new Set(urls)).slice(0, 1000);
    console.log(`🎯 [IndexNow] 成功提取 ${urlList.length} 个页面 URL，准备向各大搜索引擎自动推送...`);

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList,
    };

    for (const endpoint of SEARCH_ENGINES) {
      try {
        const pushRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'User-Agent': 'iKanPP-AutoIndexer/1.0',
          },
          body: JSON.stringify(payload),
        });
        console.log(`✅ [IndexNow] 推送至 ${endpoint}: HTTP ${pushRes.status} (${pushRes.statusText})`);
      } catch (e) {
        console.warn(`⚠️ [IndexNow] 推送至 ${endpoint} 异常:`, e.message);
      }
    }

    console.log('🎉 [IndexNow] 全网搜索引擎即时收录广播完成！');
  } catch (err) {
    console.error('❌ [IndexNow] 自动推送失败:', err);
  }
}

run();
