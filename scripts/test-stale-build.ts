import assert from 'node:assert';
import { isStaleBuildError } from '../lib/client/stale-build';

// Turbopack（本站线上实际使用）：name 为 ChunkLoadError
const turbopack = Object.assign(new Error('Failed to load chunk /_next/static/chunks/3e973ed66dba0560.js from module 1234'), { name: 'ChunkLoadError' });
assert.ok(isStaleBuildError(turbopack));
assert.ok(isStaleBuildError(new Error('Loading chunk 812 failed.'))); // webpack
assert.ok(isStaleBuildError(new TypeError('Failed to fetch dynamically imported module: https://x/_next/a.js'))); // Chrome
assert.ok(isStaleBuildError(new TypeError('Importing a module script failed.'))); // Safari
assert.ok(isStaleBuildError(new TypeError('error loading dynamically imported module'))); // Firefox

// 其他错误不能误判，否则会把真正的 bug 变成无意义的刷新
assert.ok(!isStaleBuildError(new TypeError("Cannot read properties of undefined (reading 'episodes')")));
assert.ok(!isStaleBuildError(new Error('HTTP 500')));
assert.ok(!isStaleBuildError(new Error('manifestLoadError')));
assert.ok(!isStaleBuildError(undefined));

console.log('✅ 旧版本脚本错误识别测试通过');
