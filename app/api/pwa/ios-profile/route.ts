import { NextResponse } from 'next/server';
import { WEBCLIP_ICON_BASE64 } from '@/lib/data/pwa/webclip-icon-base64';

export const runtime = 'edge';

/**
 * iOS WebClip 描述文件直装接口 (Apple Configuration Profile)
 * 
 * 核心黑科技原理：
 * 1. 下发符合 Apple 规范的 com.apple.webClip.managed 描述文件 (MIME: application/x-apple-aspen-config)；
 * 2. iPhone Safari 接收到此 MIME 类型后，会自动拦截并弹出系统级“允许下载配置描述文件”弹窗；
 * 3. 彻底跳过繁琐隐蔽的 Safari 底部分享菜单，用户在系统设置里点一次安装，即可入驻桌面；
 * 4. 包含 FullScreen: true 属性，点击桌面图标以 100% 独立无边框沉浸全屏启动。
 */
export async function GET() {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>PayloadContent</key>
    <array>
        <dict>
            <key>FullScreen</key>
            <true/>
            <key>Icon</key>
            <data>${WEBCLIP_ICON_BASE64}</data>
            <key>IsRemovable</key>
            <true/>
            <key>Label</key>
            <string>iKanPP</string>
            <key>PayloadDescription</key>
            <string>配置 iKanPP 4K 免翻极速客户端桌面图标</string>
            <key>PayloadDisplayName</key>
            <string>iKanPP 爱看片片</string>
            <key>PayloadIdentifier</key>
            <string>com.ikanpp.webclip</string>
            <key>PayloadType</key>
            <string>com.apple.webClip.managed</string>
            <key>PayloadUUID</key>
            <string>96E0D5A3-98FB-4F18-9714-3C8159E5D901</string>
            <key>PayloadVersion</key>
            <integer>1</integer>
            <key>Precomposed</key>
            <true/>
            <key>URL</key>
            <string>https://www.ikanpp.com/?pwa=1</string>
            <key>IgnoreManifestScope</key>
            <true/>
        </dict>
    </array>
    <key>PayloadDisplayName</key>
    <string>iKanPP 官方客户端</string>
    <key>PayloadDescription</key>
    <string>一键添加 iKanPP 4K 免翻极速流媒体至手机主屏幕</string>
    <key>PayloadIdentifier</key>
    <string>com.ikanpp.profile</string>
    <key>PayloadOrganization</key>
    <string>iKanPP Streaming</string>
    <key>PayloadRemovalDisallowed</key>
    <false/>
    <key>PayloadType</key>
    <string>Configuration</string>
    <key>PayloadUUID</key>
    <string>1A3B5C7D-9E1F-4A2B-8C3D-4E5F6A7B8C9D</string>
    <key>PayloadVersion</key>
    <integer>1</integer>
</dict>
</plist>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/x-apple-aspen-config; charset=utf-8',
      'Content-Disposition': 'attachment; filename="ikanpp.mobileconfig"',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
