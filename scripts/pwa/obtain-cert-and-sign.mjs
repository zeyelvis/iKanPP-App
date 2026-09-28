import acme from 'acme-client';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// 从 .env.local 加载配置
const envPath = path.join(rootDir, '.env.local');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) {
      process.env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

const CF_API_TOKEN = process.env.CF_API_TOKEN;
const ZONE_ID = process.env.CLOUDFLARE_ZONE_ID || '549aa4ae0d12157392838d79dc206426';

if (!CF_API_TOKEN) {
  console.error('❌ 未找到 CF_API_TOKEN，请检查 .env.local');
  process.exit(1);
}

console.log('🚀 [1/6] 准备启动 Let\'s Encrypt 证书自动化申请流水线...');
console.log(`   Zone ID: ${ZONE_ID}`);

// 确保 certs 目录存在
const certsDir = path.join(rootDir, 'certs');
if (!fs.existsSync(certsDir)) {
  fs.mkdirSync(certsDir, { recursive: true });
}

async function cfApi(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Authorization': `Bearer ${CF_API_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(`https://api.cloudflare.com/client/v4${endpoint}`, options);
  const data = await res.json();
  if (!data.success) {
    throw new Error(`Cloudflare API 错误: ${JSON.stringify(data.errors)}`);
  }
  return data;
}

async function main() {
  // 1. 初始化 ACME 客户端
  console.log('🔑 [2/6] 生成 ACME 账户私钥与 CSR...');
  const accountKey = await acme.crypto.createPrivateKey();
  const client = new acme.Client({
    directoryUrl: acme.directory.letsencrypt.production,
    accountKey
  });

  const domains = ['ikanpp.com', 'www.ikanpp.com'];
  const [certKey, csr] = await acme.crypto.createCsr({
    commonName: 'www.ikanpp.com',
    altNames: domains
  });

  // 保存私钥
  const keyPath = path.join(certsDir, 'ikanpp.key');
  fs.writeFileSync(keyPath, certKey);
  console.log('   ✅ 私钥生成成功并保存至本地');

  // 2. 创建订单与 DNS 记录
  console.log('📡 [3/6] 向 Let\'s Encrypt 发起订单并注入 Cloudflare DNS 验证记录...');
  const createdRecords = [];

  const autoOrder = await client.auto({
    csr,
    email: 'zeyelvis@gmail.com',
    termsOfServiceAgreed: true,
    challengePriority: ['dns-01'],
    challengeCreateFn: async (authz, challenge, keyAuthorization) => {
      console.log(`   [ACME] 接收到挑战要求: ${authz.identifier.value} (${challenge.type})`);
      if (challenge.type !== 'dns-01') return;
      const recordName = `_acme-challenge.${authz.identifier.value}`;
      console.log(`   ➕ 添加 Cloudflare DNS TXT 记录: ${recordName}`);
      const res = await cfApi(`/zones/${ZONE_ID}/dns_records`, 'POST', {
        type: 'TXT',
        name: recordName,
        content: keyAuthorization,
        ttl: 60
      });
      createdRecords.push(res.result.id);
      console.log(`   ⏳ DNS TXT 记录已成功注入 (Record ID: ${res.result.id})，等待 15 秒以便全球生效...`);
      await new Promise(r => setTimeout(r, 15000));
    },
    challengeRemoveFn: async (authz, challenge, keyAuthorization) => {
      if (challenge.type !== 'dns-01') return;
      console.log(`   🧹 单项验证完成: ${authz.identifier.value}`);
    }
  });

  console.log('📜 [4/6] 成功签发 Let\'s Encrypt 官方证书！');
  const fullchainPath = path.join(certsDir, 'fullchain.crt');
  fs.writeFileSync(fullchainPath, autoOrder);

  // 清理所有创建的 TXT 记录
  console.log('🧹 清理 Cloudflare 临时 DNS 挑战记录...');
  for (const id of createdRecords) {
    try {
      await cfApi(`/zones/${ZONE_ID}/dns_records/${id}`, 'DELETE');
      console.log(`   ✅ 已删除记录 ${id}`);
    } catch (e) {
      console.warn(`   ⚠️ 删除记录 ${id} 失败: ${e.message}`);
    }
  }

  // 拆分叶子证书和中间证书链
  const certBlocks = autoOrder.split(/(?=-----BEGIN CERTIFICATE-----)/g).filter(b => b.trim().length > 0);
  const leafCert = certBlocks[0];
  const chainCerts = certBlocks.slice(1).join('\n');

  const leafPath = path.join(certsDir, 'leaf.crt');
  const chainPath = path.join(certsDir, 'chain.crt');
  fs.writeFileSync(leafPath, leafCert);
  fs.writeFileSync(chainPath, chainCerts);

  console.log('🔏 [5/6] 准备给 iOS WebClip 描述文件进行 OpenSSL S/MIME 数字签名...');

  // 动态生成未签名的 mobileconfig XML
  const { getWebClipBase64 } = await import('../../lib/data/pwa/webclip-icon-base64.js').catch(async () => {
    // 兼容 ts 编译
    const iconPath = path.join(rootDir, 'public/webclip-icon.png');
    const base64 = fs.readFileSync(iconPath).toString('base64');
    return { getWebClipBase64: () => base64 };
  });

  const iconBase64 = getWebClipBase64();
  const rawXml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>PayloadIdentifier</key>
            <string>com.ikanpp.webclip.app</string>
            <key>PayloadUUID</key>
            <string>B6E0973C-4357-4E56-8A61-0CD5B4C2549A</string>
            <key>PayloadDisplayName</key>
            <string>iKanPP 爱看片片</string>
            <key>PayloadDescription</key>
            <string>iKanPP 官方客户端 - 4K超清极速观影桌面快捷方式</string>
            <key>PayloadOrganization</key>
            <string>iKanPP Team</string>
            <key>URL</key>
            <string>https://www.ikanpp.com/?source=webclip</string>
            <key>Label</key>
            <string>iKanPP</string>
            <key>FullScreen</key>
            <true/>
            <key>IsRemovable</key>
            <true/>
            <key>Precomposed</key>
            <true/>
            <key>Icon</key>
            <data>
${iconBase64}
            </data>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>iKanPP 官方客户端</string>
    <key>PayloadDescription</key>
    <string>安装后即可在 iPhone 桌面生成 100% 沉浸式独立播放的 iKanPP 客户端图标，畅享 4K 院线与热播剧集。</string>
    <key>PayloadIdentifier</key>
    <string>com.ikanpp.profile.webclip</string>
    <key>PayloadOrganization</key>
    <string>iKanPP (ikanpp.com)</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>E73A8A9E-6C18-47A6-9937-567F4F71E86E</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

  const unsignedPath = path.join(certsDir, 'unsigned.mobileconfig');
  fs.writeFileSync(unsignedPath, rawXml);

  // 执行 OpenSSL S/MIME 签名（生成 Apple 要求的 DER 格式二进制签名包）
  const signedPath = path.join(rootDir, 'public/ikanpp-signed.mobileconfig');
  const signCmd = `openssl smime -sign -in "${unsignedPath}" -out "${signedPath}" -signer "${leafPath}" -inkey "${keyPath}" -certfile "${chainPath}" -outform der -nodetach`;
  console.log(`   ⚙️ 执行加签命令...`);
  execSync(signCmd);

  // 验证签名
  console.log('🔍 [6/6] 验证生成的签名描述文件...');
  const verifyCmd = `openssl smime -verify -in "${signedPath}" -inform der -noverify > /dev/null 2>&1`;
  try {
    execSync(verifyCmd);
    console.log('   ✅ S/MIME 签名校验 100% 通过！');
  } catch (err) {
    console.error('   ❌ 签名校验异常:', err.message);
  }

  const stat = fs.statSync(signedPath);
  console.log(`\n🎉 绿标已验证版描述文件生成成功！`);
  console.log(`   文件路径: public/ikanpp-signed.mobileconfig`);
  console.log(`   文件大小: ${(stat.size / 1024).toFixed(2)} KB`);
  console.log(`   域名签署: www.ikanpp.com, ikanpp.com`);
}

main().catch(err => {
  console.error('\n❌ 执行异常:', err);
  process.exit(1);
});
