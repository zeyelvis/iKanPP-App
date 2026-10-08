/**
 * iKanPP 自动化搜索引擎推送脚本 (IndexNow)
 * 作用：在 GitHub Actions 部署完成后自动触发，把首页与各频道页推送到 Bing / Yandex（IndexNow）
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
  try {
    // 只推每天都在变化的首页与频道页（2026-10-08 起）。此前每次部署都把站点地图里的前 1 万个
    // 网址全量重推，几乎都是没有变化的作品页；IndexNow 只应提交有变化的网址，作品页交给
    // 搜索引擎读站点地图发现。
    const urlList = ['/', '/movie', '/tv', '/anime', '/variety', '/documentary', '/short', '/ranking', '/iptv', '/topic'].map(
      (p) => `${BASE_URL}${p}`,
    );
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
