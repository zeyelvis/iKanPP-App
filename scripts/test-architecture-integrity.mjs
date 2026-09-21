#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 🛡️ iKanPP 全站架构契约与流水线健壮性自动化巡检门禁 (Architecture Integrity Linter)
 * 在代码提交 (pre-commit) 与 CI 构建 (deploy.yml) 中自动拦截任何违规架构回退与契约漂移
 */

let failed = false;
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ [架构门禁拦截] ${message}`);
    failed = true;
  } else {
    console.log(`✅ [架构门禁验证] ${message}`);
  }
}

console.log('====================================================');
console.log('🛡️ iKanPP 全站架构契约与健壮性自动化巡检门禁启动');
console.log('====================================================\n');

// 1. 契约单一真理源 (SSOT) 验证：预烘焙数据必须引用 lib/types/prebaked.ts
const prebakedDataPath = path.resolve('lib/data/latest-titles-prebaked.ts');
const prebakedDataContent = fs.readFileSync(prebakedDataPath, 'utf-8');
assert(
  prebakedDataContent.includes("import type { LatestPrebakedItem } from '../types/prebaked'") ||
  prebakedDataContent.includes("from '../types/prebaked'"),
  'latest-titles-prebaked.ts 必须从 lib/types/prebaked.ts 引入单一真理源类型契约，严禁手写冗余 interface'
);

// 2. 脚本生成模板验证：防止生成脚本在字符串模板中硬编码 interface 导致覆写擦除字段
const generatorScripts = [
  'scripts/sync-release-radar.mjs',
  'scripts/sync-episode-updates.mjs',
  'scripts/sync-latest-titles.mjs',
];
for (const relPath of generatorScripts) {
  const fullPath = path.resolve(relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    assert(
      !content.includes('export interface LatestPrebakedItem {'),
      `${relPath} 严禁在模板中重复声明 export interface LatestPrebakedItem，必须引用共享契约`
    );
  }
}

// 3. API 端点 Cron Secret 默认鉴权保障验证：杜绝云端由于缺少环境变量返回 401
const apiRoutes = [
  'app/api/seo/entity-pipeline/route.ts',
  'app/api/seo/tmdb-changes/route.ts',
];
for (const relPath of apiRoutes) {
  const fullPath = path.resolve(relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    assert(
      content.includes("process.env.CRON_SECRET || 'ikanpp-cron-sync-secret'"),
      `${relPath} 必须包含安全的 CRON_SECRET 兜底默认值，杜绝云端定时触发 401 阻断`
    );
  }
}

// 4. 流水线辅助脚本优雅降级验证：严禁在 main().catch 中直接 process.exit(1) 阻断大盘上线
const auxiliaryScripts = [
  'scripts/sync-first-release-radar.mjs',
  'scripts/sync-iyf-four-rankings.mjs',
  'scripts/sync-episode-updates.mjs',
  'scripts/sync-juliang-short-dramas.mjs',
  'scripts/sync-seo-entities.mjs',
];
for (const relPath of auxiliaryScripts) {
  const fullPath = path.resolve(relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    const hasExitOneInCatch = /main\(\)\.catch\([\s\S]*?process\.exit\(1\)/.test(content);
    assert(
      !hasExitOneInCatch,
      `${relPath} 辅助流水线任务在 main().catch 中必须保持优雅降级 (process.exit(0))，严禁单点异常杀进程阻断全站大盘发布`
    );
  }
}

// 5. 全屏硬件覆盖层与显卡防黑屏规范验证：杜绝跨浏览器伪类逗号合写失效，杜绝全屏组件包含 backdrop-blur 与同步重排死锁
const videoCssPath = path.resolve('app/styles/video-player.css');
if (fs.existsSync(videoCssPath)) {
  const cssContent = fs.readFileSync(videoCssPath, 'utf-8');
  assert(
    cssContent.includes(':fullscreen * {') &&
    cssContent.includes(':-webkit-full-screen * {') &&
    cssContent.includes('.kvideo-container.is-native-fullscreen * {'),
    'video-player.css 必须独立声明 :fullscreen * 与 :-webkit-full-screen *，严禁跨引擎逗号合写导致整组规则被浏览器废弃'
  );
  assert(
    !/\.spinner-glass\s*\{[^}]*backdrop-filter/s.test(cssContent),
    'video-player.css 的 .spinner-glass 旋转加载指示器严禁包含 backdrop-filter，防止全屏卡顿缓冲时瞬间触发显卡黑屏'
  );
  assert(
    cssContent.includes('.kvideo-container:fullscreen {') &&
    cssContent.includes('background: transparent !important;'),
    'video-player.css 的全屏容器必须设置 background: transparent，由 ::backdrop 呈现黑底，杜绝显卡 Hardware Overlay 发生遮蔽剔除 (Occlusion Culling) 黑屏'
  );
}

// 递归扫描 components/player/desktop 及相关全屏弹窗组件，杜绝任何 backdrop-blur 渗入
const playerComponentFiles = [
  'components/player/desktop/DesktopOverlay.tsx',
  'components/player/desktop/DesktopSpeedMenu.tsx',
  'components/player/desktop/DesktopMoreMenu.tsx',
  'components/player/desktop/InPlayerEpisodesDrawer.tsx',
  'components/player/desktop/InPlayerSourceDrawer.tsx',
  'components/player/desktop/NextEpisodeOverlay.tsx',
  'components/player/desktop/KeyboardShortcutsModal.tsx',
  'components/player/ShareCardModal.tsx',
  'components/player/PlayerBrandLogo.tsx',
];

for (const relPath of playerComponentFiles) {
  const fullPath = path.resolve(relPath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf-8');
    assert(
      !content.includes('backdrop-blur') && !content.includes('backdropFilter'),
      `${relPath} 严禁包含 backdrop-blur 或 backdropFilter，全屏模式下必须使用高级纯色暗夜底色，杜绝 GPU Back-buffer 显存回读黑屏`
    );
  }
}

// 全屏控制器严禁同步触发强制重排 (void v.offsetHeight)
const fullscreenHookPath = path.resolve('components/player/hooks/desktop/useFullscreenControls.ts');
if (fs.existsSync(fullscreenHookPath)) {
  const hookContent = fs.readFileSync(fullscreenHookPath, 'utf-8');
  assert(
    !hookContent.includes('offsetHeight'),
    'useFullscreenControls.ts 严禁在全屏切换事件中调用 offsetHeight 强行触发同步重排，杜绝显卡 Hardware Surface 交接时发生渲染死锁'
  );
}

// 6. 纯正正片内容安全门禁：严禁任何解说类、短视频二手搬运条目渗透片库
const entityUtilsPath = path.resolve('lib/data/entities/entity-utils.ts');
if (fs.existsSync(entityUtilsPath)) {
  const utilsContent = fs.readFileSync(entityUtilsPath, 'utf-8');
  assert(
    utilsContent.includes('COMMENTARY_BLACKLIST_WORDS') &&
    utilsContent.includes("'解说'") &&
    utilsContent.includes("'说电影'") &&
    utilsContent.includes("'一口气看'"),
    'entity-utils.ts 必须声明 COMMENTARY_BLACKLIST_WORDS，并在 isCleanChineseTitle 中执行解说类一票否决'
  );
}

const browseRoutePath = path.resolve('app/api/library/browse/route.ts');
if (fs.existsSync(browseRoutePath)) {
  const browseContent = fs.readFileSync(browseRoutePath, 'utf-8');
  assert(
    browseContent.includes("typeName.includes('解说')") &&
    browseContent.includes('isCleanChineseTitle(cleanTitle)'),
    'app/api/library/browse/route.ts 必须对采集站数据执行 isCleanChineseTitle 与解说类分类物理过滤'
  );
}

// 7. iKanPP 原创品牌与去机器感门禁：严禁在前台展示组件中暴露 AI/Thin Content 标签
const reviewCompPath = path.resolve('components/title/AiUniqueReview.tsx');
if (fs.existsSync(reviewCompPath)) {
  const content = fs.readFileSync(reviewCompPath, 'utf-8');
  assert(
    !content.includes('AI 独家解析') && !content.includes('Thin Content'),
    'AiUniqueReview.tsx 必须使用 iKanPP 独家视点，严禁暴露 AI 独家解析或 Thin Content 内部黑话'
  );
}
const faqCompPath = path.resolve('components/title/AiFaqSection.tsx');
if (fs.existsSync(faqCompPath)) {
  const content = fs.readFileSync(faqCompPath, 'utf-8');
  assert(
    content.includes('iKanPP 观影指南与答疑') && content.includes('官方 FAQ'),
    'AiFaqSection.tsx 必须使用 iKanPP 官方观影指南与答疑，建立第一方品牌权威'
  );
}

// 10. 全屏黑屏三层物理防线回归测试
// 10a. compatibility.css 必须包含全屏容器内 backdrop-filter 强制禁用规则
const compatCssPath = path.resolve('app/styles/compatibility.css');
if (fs.existsSync(compatCssPath)) {
  const compatContent = fs.readFileSync(compatCssPath, 'utf-8');
  assert(
    compatContent.includes(':fullscreen') && compatContent.includes('backdrop-filter: none !important'),
    'compatibility.css 必须包含 :fullscreen 全屏容器内 backdrop-filter 强制禁用规则，防止 @supports 兼容性注入覆盖全屏安全防线'
  );
  assert(
    compatContent.includes('.is-native-fullscreen') && compatContent.includes('.is-fullscreen'),
    'compatibility.css 必须包含 .is-native-fullscreen 与 .is-fullscreen 的 backdrop-filter 禁用保底'
  );
}

// 10b. useFullscreenControls.ts 必须包含 JS 层 backdrop-filter 物理清除逻辑
const fsHookPath = path.resolve('components/player/hooks/desktop/useFullscreenControls.ts');
if (fs.existsSync(fsHookPath)) {
  const fsHookContent = fs.readFileSync(fsHookPath, 'utf-8');
  assert(
    fsHookContent.includes('backdropFilter') && fsHookContent.includes('querySelectorAll'),
    'useFullscreenControls.ts 必须包含全屏进入时 JS 层主动遍历 DOM 清除 backdropFilter 的物理防护'
  );
  assert(
    !fsHookContent.includes('offsetHeight') && !fsHookContent.includes('getComputedStyle'),
    'useFullscreenControls.ts 严禁在全屏切换中使用 offsetHeight/getComputedStyle 同步强制重排'
  );
}

// 10c. video-player.css 全屏规则必须保持三路独立声明
const vpCssPath = path.resolve('app/styles/video-player.css');
if (fs.existsSync(vpCssPath)) {
  const vpContent = fs.readFileSync(vpCssPath, 'utf-8');
  // 确保三路全屏 backdrop-filter 禁用规则独立存在
  const hasStandard = vpContent.includes(':fullscreen *') && vpContent.includes('backdrop-filter: none !important');
  const hasWebkit = vpContent.includes(':-webkit-full-screen *') && vpContent.includes('backdrop-filter: none !important');
  const hasClass = vpContent.includes('.is-native-fullscreen *') && vpContent.includes('backdrop-filter: none !important');
  assert(
    hasStandard && hasWebkit && hasClass,
    'video-player.css 必须保持 :fullscreen / :-webkit-full-screen / .is-native-fullscreen 三路独立的 backdrop-filter: none !important 规则'
  );
  // 确保全屏容器使用透明背景而非纯黑
  assert(
    vpContent.includes('background: transparent !important'),
    'video-player.css 全屏容器必须使用 background: transparent，严禁纯黑 background 导致 Occlusion Culling'
  );
}

// 11. 播放器防周期性卡顿与高吞吐深缓冲水位绝对门禁 (Anti-Periodic Stalling & High-Throughput Buffering Spec)
const hlsHookPath = path.resolve('components/player/hooks/useHlsPlayer.ts');
if (fs.existsSync(hlsHookPath)) {
  const hlsContent = fs.readFileSync(hlsHookPath, 'utf-8');
  assert(
    hlsContent.includes('checkIsIPadOS'),
    'useHlsPlayer.ts 必须引入并使用 checkIsIPadOS 精准识别 iPad 与 MacBook，严禁单凭 maxTouchPoints > 1 误判导致 Mac 桌面端被降级为移动端极小缓冲区'
  );
  assert(
    hlsContent.includes('maxBufferLength: isMobileClient ? 60 : 120') ||
    hlsContent.includes('maxBufferLength: 120'),
    'useHlsPlayer.ts 桌面端前向缓冲水位 maxBufferLength 必须 >= 120 秒，严禁擅自下调导致高码率片源播放中途水库干涸饥饿卡顿'
  );
  assert(
    hlsContent.includes('maxMaxBufferLength: isMobileClient ? 120 : 240') ||
    hlsContent.includes('maxMaxBufferLength: 240'),
    'useHlsPlayer.ts 桌面端最大前向缓冲水位 maxMaxBufferLength 必须 >= 240 秒'
  );
  assert(
    hlsContent.includes('120 * 1000 * 1000'),
    'useHlsPlayer.ts 桌面端最大缓冲区内存容量 maxBufferSize 必须 >= 120MB (120 * 1000 * 1000)'
  );
  assert(
    hlsContent.includes('backBufferLength: isMobileClient ? 25 : 60') ||
    hlsContent.includes('backBufferLength: 60'),
    'useHlsPlayer.ts 桌面端后向回退缓冲区 backBufferLength 必须 >= 60 秒，严禁设为 10~30 秒导致频繁触发 SourceBuffer.remove() 解码管线更新锁冲突与卡顿'
  );
  assert(
    hlsContent.includes('fragLoadingTimeOut: 30000'),
    'useHlsPlayer.ts 切片加载超时 fragLoadingTimeOut 必须保持 30000ms 宽裕水位，防止长肥管道瞬时抖动误判死链'
  );
}

// 11b. 播放器父级容器严禁无 selector 全量订阅历史 Store (消除 5 秒级联 Re-render 风暴)
const ppContainerPath = path.resolve('components/player/containers/IkanPPPlayerContainer.tsx');
if (fs.existsSync(ppContainerPath)) {
  const ppContent = fs.readFileSync(ppContainerPath, 'utf-8');
  assert(
    !ppContent.includes('useHistory(') && ppContent.includes('useHistoryStore((s) => s.addToHistory)'),
    'IkanPPPlayerContainer 严禁直接使用无 selector 的 useHistory() 订阅，必须使用 useHistoryStore((s) => s.addToHistory)，杜绝每 5 秒保存播放进度时引发 1400 行容器全量级联重渲染'
  );
  assert(
    ppContent.includes('handleSelectEpisodeInPlayer'),
    'IkanPPPlayerContainer 必须通过 useCallback 记忆化 handleSelectEpisodeInPlayer，严禁给 VideoPlayer 传递内联箭头函数'
  );
}

const xContainerPath = path.resolve('components/player/containers/IkanXPlayerContainer.tsx');
if (fs.existsSync(xContainerPath)) {
  const xContent = fs.readFileSync(xContainerPath, 'utf-8');
  assert(
    !xContent.includes('useHistory(') && xContent.includes('usePremiumHistoryStore((s) => s.addToHistory)'),
    'IkanXPlayerContainer 严禁直接使用无 selector 的 useHistory() 订阅，必须使用 usePremiumHistoryStore((s) => s.addToHistory)'
  );
}

// 11c. 播放器核心组件必须使用 React.memo 物理阻断外部渲染波及
const videoPlayerPath = path.resolve('components/player/VideoPlayer.tsx');
if (fs.existsSync(videoPlayerPath)) {
  const vpContent = fs.readFileSync(videoPlayerPath, 'utf-8');
  assert(
    vpContent.includes('export const VideoPlayer = React.memo('),
    'VideoPlayer.tsx 必须使用 React.memo 包裹，阻断父级容器的渲染扩散'
  );
}

const desktopPlayerPath = path.resolve('components/player/DesktopVideoPlayer.tsx');
if (fs.existsSync(desktopPlayerPath)) {
  const dpContent = fs.readFileSync(desktopPlayerPath, 'utf-8');
  assert(
    dpContent.includes('export const DesktopVideoPlayer = React.memo('),
    'DesktopVideoPlayer.tsx 必须使用 React.memo 包裹，阻断重绘风暴'
  );
}

const customPlayerPath = path.resolve('components/player/CustomVideoPlayer.tsx');
if (fs.existsSync(customPlayerPath)) {
  const cpContent = fs.readFileSync(customPlayerPath, 'utf-8');
  assert(
    cpContent.includes('export const CustomVideoPlayer = React.memo('),
    'CustomVideoPlayer.tsx 必须使用 React.memo 包裹'
  );
}

const artPlayerPath = path.resolve('components/player/artplayer/ArtVideoPlayer.tsx');
if (fs.existsSync(artPlayerPath)) {
  const apContent = fs.readFileSync(artPlayerPath, 'utf-8');
  assert(
    apContent.includes('export const ArtVideoPlayer = React.memo('),
    'ArtVideoPlayer.tsx 必须使用 React.memo 包裹，隔离外部虚拟 DOM 渲染波动'
  );
  assert(
    apContent.includes('createHlsConfig'),
    'ArtVideoPlayer.tsx 必须统一接入 createHlsConfig 单一真理源，继承 120s 深水库'
  );
}

const hlsFactoryPath = path.resolve('lib/player/hls-config-factory.ts');
if (fs.existsSync(hlsFactoryPath)) {
  const hfContent = fs.readFileSync(hlsFactoryPath, 'utf-8');
  assert(
    hfContent.includes('maxBufferLength: isMobileClient ? 60 : 120'),
    'hls-config-factory.ts 桌面端前向缓冲水位 maxBufferLength 必须 >= 120 秒'
  );
  assert(
    hfContent.includes('maxMaxBufferLength: isMobileClient ? 120 : 240'),
    'hls-config-factory.ts 桌面端最大前向缓冲水位 maxMaxBufferLength 必须 >= 240 秒'
  );
  assert(
    hfContent.includes('120 * 1000 * 1000'),
    'hls-config-factory.ts 桌面端最大缓冲区容量 maxBufferSize 必须 >= 120MB'
  );
  assert(
    hfContent.includes('backBufferLength: isMobileClient ? 25 : 60'),
    'hls-config-factory.ts 桌面端后向回退缓冲区 backBufferLength 必须 >= 60 秒'
  );
}

console.log('\n====================================================');
if (failed) {
  console.error('🚨 架构契约巡检失败！存在破坏全局稳定性的违规回退，请根据上述报错整改后再行提交！');
  process.exit(1);
} else {
  console.log('🎉 恭喜！全站架构契约、单一真理源、全屏防黑屏、播放器防周期性卡顿、正片纯净度与流水线韧性 100% 严格达标！');
  console.log('====================================================\n');
}

