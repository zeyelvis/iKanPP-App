import { checkIsIPadOS } from '@/lib/hooks/mobile/useDeviceDetection';

/**
 * 检测当前环境是否为会强行劫持/接管网页原生 <video> 标签的移动端第三方浏览器
 * 
 * 现象定位：
 * 部分移动端浏览器（如夸克、UC、手机百度、QQ浏览器、搜狗等）会强制使用自带播放器接管网页视频，
 * 导致网站的控制条、选集、换线路、续播与品牌角标失效。
 * 
 * 规则：
 * 1. 仅在手机或平板（UA 包含 Android|iPhone|iPad|iPod，或 checkIsIPadOS() 为 true）上生效，电脑版不拦截；
 * 2. 微信、QQ App 内置 WebView（含 MicroMessenger 或 " QQ/"）归内置浏览器引导处理，此处返回 null；
 * 3. 匹配命中返回友好中文名称，未命中返回 null。
 */
export function videoTakeoverBrowser(): string | null {
  if (typeof navigator === 'undefined') return null;

  const ua = navigator.userAgent;

  // 1. 仅在移动端与平板生效
  const isMobileOrTablet = /Android|iPhone|iPad|iPod/i.test(ua) || checkIsIPadOS();
  if (!isMobileOrTablet) return null;

  // 2. 微信、QQ App 等内置浏览器由专用横幅提示，不在此处拦截
  if (/MicroMessenger/i.test(ua) || / QQ\//.test(ua)) {
    return null;
  }

  // 3. 手机端接管视频的浏览器特征匹配
  if (/Quark\//i.test(ua)) return '夸克浏览器';
  if (/UCBrowser|UCWEB/i.test(ua)) return 'UC 浏览器';
  if (/baiduboxapp|baidubrowser|BIDUBrowser/i.test(ua)) return '百度';
  if (/MQQBrowser/i.test(ua)) return 'QQ 浏览器';
  if (/SogouMobileBrowser|SogouSearch/i.test(ua)) return '搜狗浏览器';

  return null;
}
