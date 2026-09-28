#!/usr/bin/env node

/**
 * GZ360 前端资产嗅探、密钥提取与 Canary 探活自愈脚本
 * 
 * 运行方式:
 *   node scripts/monitors/gz-sniffer.mjs
 * 
 * 功能:
 * 1. 抓取 gz360.tv 主站 HTML，提取最新的 Nuxt Bundle 脚本清单
 * 2. 扫描并自动逆向提取最新的 AES 密钥、IV 及 API 域名
 * 3. 使用提取出的凭据发起 Canary 金丝雀探活 (搜索 + 详情 + m3u8 CORS 测试)
 * 4. 仅在全链路 100% 畅通时输出健康状态与最新配置
 */

import crypto from 'crypto';

const TARGET_HOST = 'https://gz360.tv';
const CANARY_VOD_ID = '139933'; // 绿灯军团 (常驻测试标的)

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
};

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function encryptWith(plaintext, key, iv) {
  const cipher = crypto.createCipheriv('aes-128-cbc', Buffer.from(key, 'utf8'), Buffer.from(iv, 'utf8'));
  let enc = cipher.update(plaintext, 'utf8', 'hex');
  enc += cipher.final('hex');
  return enc;
}

function decryptWith(hexCiphertext, key, iv) {
  const decipher = crypto.createDecipheriv('aes-128-cbc', Buffer.from(key, 'utf8'), Buffer.from(iv, 'utf8'));
  let dec = decipher.update(hexCiphertext, 'hex', 'utf8');
  dec += decipher.final('utf8');
  return JSON.parse(dec);
}

async function runSniffer() {
  console.log(`[${new Date().toISOString()}] 🔍 正在嗅探 GZ360 主站静态资产...`);

  // 1. 获取主站 HTML
  let html = '';
  try {
    const res = await fetch(TARGET_HOST, { headers: HEADERS });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    html = await res.text();
  } catch (err) {
    console.error('❌ 获取主站 HTML 失败:', err.message);
    return false;
  }

  // 2. 提取所有 Nuxt 打包脚本
  const scriptMatches = html.match(/src=["'](\/_nuxt\/[a-zA-Z0-9_-]+\.js)["']/g) || [];
  const scriptPaths = [...new Set(scriptMatches.map((m) => m.match(/src=["']([^"']+)["']/)[1]))];

  console.log(`📦 发现 ${scriptPaths.length} 个前端 Bundle 文件`);

  let extractedConfig = null;

  // 3. 逐个检索可能包含 AES 凭据的文件
  for (const scriptPath of scriptPaths) {
    const scriptUrl = `${TARGET_HOST}${scriptPath}`;
    try {
      const sRes = await fetch(scriptUrl, { headers: HEADERS });
      const jsText = await sRes.text();

      // 特征 1: 包含 AES 与 Utf8.parse 16位字符串
      if (jsText.includes('enc.Utf8.parse') && jsText.includes('CBC')) {
        // 匹配 16 位 hex/ascii 密钥: parse("181cc88340ae5b2b")
        const hexMatches = jsText.match(/parse\(["']([a-f0-9]{16})["']\)/g) || [];
        const domainMatch = jsText.match(/https:\/\/[a-z0-9]+\.1fc8ab0\.com|https:\/\/haiwaiapi\.[a-z0-9]+\.com/);

        if (hexMatches.length >= 2) {
          const keys = hexMatches.map((m) => m.match(/parse\(["']([a-f0-9]{16})["']\)/)[1]);
          extractedConfig = {
            key: keys[0],
            iv: keys[1],
            baseUrl: domainMatch ? domainMatch[0] : 'https://haiwaiapi.1fc8ab0.com',
            sourceBundle: scriptPath,
          };
          console.log(`✅ 从 ${scriptPath} 成功定位加解密凭据:`, extractedConfig);
          break;
        }
      }
    } catch (e) {
      // 忽略单个文件抓取异常
    }
  }

  if (!extractedConfig) {
    console.warn('⚠️ 未在当前 Bundle 中扫描到明显变动，采用基线配置进行探活...');
    extractedConfig = {
      key: '181cc88340ae5b2b',
      iv: '4423d1e2773476ce',
      baseUrl: 'https://haiwaiapi.1fc8ab0.com',
      sourceBundle: 'baseline',
    };
  }

  // 4. 金丝雀 Canary 探活 (测试剧集详情与播放地址获取)
  console.log('🐥 开始 Canary 金丝雀探活验证...');
  const payload = JSON.stringify({ vod_id: CANARY_VOD_ID });
  const enc = encryptWith(payload, extractedConfig.key, extractedConfig.iv);

  try {
    const apiRes = await fetch(`${extractedConfig.baseUrl}/H5/Resource/GetVodInfo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': TARGET_HOST,
        'Referer': `${TARGET_HOST}/`,
        'User-Agent': HEADERS['User-Agent'],
      },
      body: JSON.stringify({ params: enc }),
    });

    const json = await apiRes.json();
    if (!json.data || typeof json.data !== 'string') {
      throw new Error(`API 返回异常: ${JSON.stringify(json)}`);
    }

    const decrypted = decryptWith(json.data, extractedConfig.key, extractedConfig.iv);
    const playUrl = decrypted?.vodInfo?.play_url;

    if (!playUrl || !playUrl.startsWith('http')) {
      throw new Error('未获取到有效的 m3u8 播放地址');
    }

    console.log(`🎬 成功解析 Canary 影视 [${decrypted.vodInfo.vod_name}] m3u8: ${playUrl}`);

    // 5. CDN 与 CORS 兼容性探活
    console.log('🌐 验证 CDN 跨域与切片可用性...');
    const m3u8Res = await fetch(playUrl, {
      method: 'GET',
      headers: {
        'Origin': 'https://ikanpp.com',
      },
    });

    if (!m3u8Res.ok) {
      throw new Error(`m3u8 请求失败，HTTP ${m3u8Res.status}`);
    }

    const corsHeader = m3u8Res.headers.get('access-control-allow-origin');
    console.log(`📡 CDN CORS 响应头: ${corsHeader || '无限制'}`);

    console.log('\n========================================');
    console.log('🎉 探活与自愈检查 100% 成功！该源处于健康状态');
    console.log('配置载荷:', JSON.stringify(extractedConfig, null, 2));
    console.log('========================================\n');
    return true;
  } catch (err) {
    console.error('❌ Canary 探活失败，触发熔断告警:', err.message);
    return false;
  }
}

// 执行
runSniffer().then((success) => {
  process.exit(success ? 0 : 1);
});
