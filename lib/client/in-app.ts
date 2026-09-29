/**
 * 检测当前环境是否为第三方 App 内置 WebView 浏览器
 * 覆盖名单：微信、QQ、微博、钉钉、支付宝、抖音、小红书
 */

const IN_APP_RULES: [RegExp, string][] = [
  [/MicroMessenger/i, '微信'],
  [/ QQ\//, 'QQ'],
  [/Weibo/i, '微博'],
  [/DingTalk/i, '钉钉'],
  [/AlipayClient/i, '支付宝'],
  [/aweme|BytedanceWebview|NewsArticle|Toutiao/i, '抖音'],
  [/xhsdiscover|XiaoHongShu/i, '小红书'],
];

export function inAppBrowser(): string | null {
  if (typeof navigator === 'undefined') return null;
  const ua = navigator.userAgent;
  for (const [regex, name] of IN_APP_RULES) {
    if (regex.test(ua)) {
      return name;
    }
  }
  return null;
}
