import { NextResponse } from 'next/server';
import { SIGNED_MOBILECONFIG_BASE64 } from '@/lib/data/pwa/signed-mobileconfig-base64';


/**
 * iOS WebClip 描述文件直装接口 (Apple Configuration Profile)
 * 
 * 权威绿标签名体系：
 * 1. 经由 Let's Encrypt 权威 CA 颁发证书进行 OpenSSL S/MIME 数字加密签名；
 * 2. 签署域名锁定为 www.ikanpp.com / ikanpp.com；
 * 3. iPhone 解析时系统直接识别为【已验证 ✔️】，彻底消灭未签名红字与二次警告惊吓弹窗；
 * 4. 输完锁屏密码直接 0 秒瞬时完成安装，入驻桌面 100% 独立全屏启动。
 */
export async function GET() {
  const binaryString = atob(SIGNED_MOBILECONFIG_BASE64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  return new NextResponse(bytes, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-apple-aspen-config',
      'Content-Disposition': 'attachment; filename="ikanpp.mobileconfig"',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
