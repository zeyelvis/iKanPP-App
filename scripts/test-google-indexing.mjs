import fs from 'fs';
import path from 'path';

// 读取密钥文件
const keyPath = path.resolve(process.cwd(), 'google key/ikanpp-indexing-ef8f38009b05.json');
if (!fs.existsSync(keyPath)) {
  console.error('❌ 未找到密钥文件:', keyPath);
  process.exit(1);
}

const keyData = JSON.parse(fs.readFileSync(keyPath, 'utf-8'));
console.log('🔑 成功读取服务账号:', keyData.client_email);

function base64UrlEncode(strOrBuffer) {
  let b64;
  if (typeof strOrBuffer === 'string') {
    b64 = Buffer.from(strOrBuffer).toString('base64');
  } else {
    b64 = strOrBuffer.toString('base64');
  }
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToArrayBuffer(pem) {
  const b64 = pem
    .replace(/-----BEGIN [A-Z ]+-----/g, '')
    .replace(/-----END [A-Z ]+-----/g, '')
    .replace(/\s+/g, '');
  const buf = Buffer.from(b64, 'base64');
  return buf;
}

async function runTest() {
  const now = Math.floor(Date.now() / 1000);

  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: keyData.client_email,
    scope: 'https://www.googleapis.com/auth/indexing',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  console.log('⏳ 正在使用 Web Crypto API 进行 RS256 私钥签名...');
  const keyBuffer = pemToArrayBuffer(keyData.private_key);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBuffer,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const encoder = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signingInput)
  );

  const encodedSignature = base64UrlEncode(Buffer.from(signatureBuffer));
  const assertionJwt = `${signingInput}.${encodedSignature}`;

  console.log('⏳ 正在向 Google OAuth2 (oauth2.googleapis.com) 交换 Bearer Access Token...');
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: assertionJwt,
    }).toString(),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    console.error('❌ 获取 Token 失败:', tokenRes.status, text);
    return;
  }

  const tokenData = await tokenRes.json();
  console.log('✅ Google OAuth2 验证成功！获取到 Access Token (长度:', tokenData.access_token.length, ')');

  console.log('⏳ 正在尝试向 Google Indexing API 提交 URL 状态测试...');
  const testUrl = 'https://www.ikanpp.com/';
  const publishRes = await fetch('https://indexing.googleapis.com/v3/urlNotifications:publish', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenData.access_token}`,
    },
    body: JSON.stringify({
      url: testUrl,
      type: 'URL_UPDATED',
    }),
  });

  const publishStatus = publishRes.status;
  const publishText = await publishRes.text();

  if (publishRes.ok) {
    console.log('🎉 恭喜！Google Indexing API 提交完全成功！HTTP', publishStatus);
    console.log('返回结果:', publishText);
  } else {
    console.log(`⚠️ Google 响应 HTTP ${publishStatus}:`, publishText);
    if (publishStatus === 403) {
      console.log('👉 提示：这是正常的，因为还需要在 Google Search Console 中将该服务账号添加为站点「拥有者 (Owner)」。');
    }
  }
}

runTest().catch(console.error);
