/**
 * 装到桌面的页首内联脚本（由根布局 <head> 注入）。单独成文件、不带 'use client'，
 * 服务端布局导入的才是字符串本身。
 *
 * Chrome 只发一次安装事件，而且常常早于 React 水合：先接住存在 window.__ikInstall 上，
 * lib/client/pwa-install.ts 随时取用；装好后（appinstalled）记住，不再提示。
 */
export const PWA_INSTALLED_KEY = 'ikanpp_pwa_installed';

export const PWA_INSTALL_CAPTURE_SCRIPT =
  "window.addEventListener('beforeinstallprompt',function(e){e.preventDefault();window.__ikInstall=e});" +
  `window.addEventListener('appinstalled',function(){window.__ikInstall=null;try{localStorage.setItem('${PWA_INSTALLED_KEY}','1')}catch(_){}});`;
