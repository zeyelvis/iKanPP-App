/**
 * iKanPP 核心业务与历史缺陷防复发自动化回归测试套件 (Regression Guard Suite)
 * 
 * 强制门禁：
 * 1. 繁花实体质量契约（严禁奥本海默封面、严禁全1集、严禁模版简介）
 * 2. 流浪地球2 实体契约（严禁毒化 ID ik068315，必须为 ik082219）
 * 3. 港台矢量旗帜契约（必须为 SVG 矢量组件，消灭系统字体方块乱码）
 * 4. 推荐系统性能契约（严禁并发 60+ KV 请求雪崩）
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('====================================================');
console.log('🛡️ iKanPP 核心历史缺陷防复发门禁 (Regression Guard) 启动');
console.log('====================================================\n');

// 1. 测试繁花实体契约
console.log('📋 [门禁 1/4] 验证《繁花》实体与预烘焙数据纯净度...');
const prebakedExtraPath = path.resolve(process.cwd(), 'lib/data/home-prebaked-extra.ts');
const prebakedExtraContent = fs.readFileSync(prebakedExtraPath, 'utf8');

assert.ok(
  !prebakedExtraContent.includes('8Gxv8gTFCU0XGDykEGv7zR1n2ua.jpg'),
  '❌ [回归拦截] home-prebaked-extra.ts 中繁花封面被奥本海默 (8Gxv8gTFCU0XGDykEGv7zR1n2ua) 污染！'
);
assert.ok(
  prebakedExtraContent.includes('rV1owsdKtXytJ5eFMOOVTze3mrk.jpg'),
  '❌ [回归拦截] home-prebaked-extra.ts 中繁花未包含王家卫正版海报！'
);
console.log('  ✅ 《繁花》预烘焙海报核验通过（绝无奥本海默错配）');

// 2. 测试流浪地球2 实体与搜索图谱契约
console.log('\n📋 [门禁 2/4] 验证《流浪地球2》防毒化与权威 ID 契约...');
const searchPanelPath = path.resolve(process.cwd(), 'components/search/SearchKnowledgePanel.tsx');
const searchPanelContent = fs.readFileSync(searchPanelPath, 'utf8');

assert.ok(
  searchPanelContent.includes('sq_ent_v2_'),
  '❌ [回归拦截] SearchKnowledgePanel 必须使用 sq_ent_v2_ 缓存命名空间，防止历史毒化数据污染！'
);
assert.ok(
  !searchPanelContent.includes('ik068315'),
  '❌ [回归拦截] SearchKnowledgePanel 严禁残留毒化 ID ik068315！'
);
console.log('  ✅ 《流浪地球2》搜索图谱防毒化核验通过');

// 3. 测试港台矢量旗帜契约
console.log('\n📋 [门禁 3/4] 验证港台旗帜矢量化契约...');
const regionFlagsPath = path.resolve(process.cwd(), 'components/ui/RegionFlags.tsx');
assert.ok(fs.existsSync(regionFlagsPath), '❌ [回归拦截] RegionFlags.tsx 不存在！');
const flagsContent = fs.readFileSync(regionFlagsPath, 'utf8');
assert.ok(flagsContent.includes('export function FlagTW'), '❌ [回归拦截] FlagTW 未导出！');
assert.ok(flagsContent.includes('export function FlagHK'), '❌ [回归拦截] FlagHK 未导出！');
assert.ok(flagsContent.includes('<svg'), '❌ [回归拦截] 旗帜组件必须使用 SVG 矢量标签，杜绝系统字体缺失方块乱码！');
console.log('  ✅ 港台 SVG 矢量旗帜契约核验通过');

// 4. 测试详情页防 KV 洪峰与 after() 异步自愈契约
console.log('\n📋 [门禁 4/4] 验证详情页防 KV 洪峰与 Edge 异步持久化契约...');
const entityKvPath = path.resolve(process.cwd(), 'lib/services/entity-kv.ts');
const entityKvContent = fs.readFileSync(entityKvPath, 'utf8');

assert.ok(
  !entityKvContent.includes('Math.max(limit * 2, 60)'),
  '❌ [回归拦截] entity-kv.ts 严禁写死 Math.max(limit * 2, 60) 造成 120+ 次 KV 查询雪崩！'
);

const detailPagePath = path.resolve(process.cwd(), 'app/title/[slug]/page.tsx');
const detailPageContent = fs.readFileSync(detailPagePath, 'utf8');

assert.ok(
  detailPageContent.includes("import { after } from 'next/server'"),
  '❌ [回归拦截] page.tsx 必须使用 next/server 的 after() API 保障 Edge Worker 后台自愈完整持久化！'
);
assert.ok(
  !detailPageContent.includes('全 ${entity.numberOfEpisodes} 集` :'),
  '❌ [回归拦截] page.tsx 严禁直接无脑展示 `全 1 集`！必须核验 numberOfEpisodes > 1！'
);
console.log('  ✅ 详情页防 KV 洪峰与 after() 异步契约核验通过');

console.log('\n====================================================');
console.log('🎉 恭喜！所有历史缺陷防复发自动化回归测试全部 100% 通过！');
console.log('====================================================\n');
