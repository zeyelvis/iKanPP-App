/*
 * 部署会删除上一个版本的脚本文件。部署前就打开、一直没刷新的页面，在用到按需加载的脚本
 * （播放器、hls.js、侧边栏等）时会下载失败，整页报错。刷新一次即可拿到当前版本的页面和脚本。
 * 每 60 秒最多自动刷新一次，防止脚本真的缺失时无限刷新。
 */

const KEY = 'ikanpp:stale-reload';
let reloading = false;

/** 本页的某个脚本下载失败（覆盖 Chrome、Safari、Firefox、Turbopack、webpack 的报错文案）。 */
export function isStaleBuildError(error: unknown): boolean {
  const text = error instanceof Error ? `${error.name} ${error.message}` : String(error);
  return /ChunkLoadError|Loading chunk|Failed to load chunk|dynamically imported module|Importing a module script failed/i.test(text);
}

/** 刷新到当前版本；60 秒内刚刷新过则返回 false（此时应显示错误页，不再刷新）。 */
export function reloadForNewBuild(): boolean {
  if (reloading) return true;
  try {
    const last = Number(sessionStorage.getItem(KEY));
    if (last && Date.now() - last < 60_000) return false;
    sessionStorage.setItem(KEY, String(Date.now()));
  } catch {
    // 无痕模式等无法使用 sessionStorage：模块内的标记仍保证本次页面最多刷新一次。
  }
  reloading = true;
  window.location.reload();
  return true;
}
