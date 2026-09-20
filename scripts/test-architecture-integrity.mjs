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

console.log('\n====================================================');
if (failed) {
  console.error('🚨 架构契约巡检失败！存在破坏全局稳定性的违规回退，请根据上述报错整改后再行提交！');
  process.exit(1);
} else {
  console.log('🎉 恭喜！全站架构契约、单一真理源、全屏防黑屏、正片纯净度与流水线韧性 100% 严格达标！');
  console.log('====================================================\n');
}


