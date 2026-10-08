/**
 * iKanPP 核心业务与历史缺陷防复发自动化回归测试套件 (Regression Guard Suite)
 * 
 * 强制门禁：
 * 1. 流浪地球2 搜索卡片防毒化（缓存命名空间、严禁残留毒化 ID ik068315）
 * 2. 港台矢量旗帜契约（必须为 SVG 矢量组件，消灭系统字体方块乱码）
 *
 * 2026-10-08 重构阶段 4：去掉针对写死数据文件（home-prebaked-extra）与详情页 KV 后台自愈的两项，
 * 这两部分已随迁到 D1 删除；作品页网址的回归由 scripts/test-title-urls.ts 负责。
 */

import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

console.log('====================================================');
console.log('🛡️ iKanPP 核心历史缺陷防复发门禁 (Regression Guard) 启动');
console.log('====================================================\n');

// 1. 测试流浪地球2 实体与搜索图谱契约
console.log('\n📋 [门禁 1/2] 验证《流浪地球2》防毒化与权威 ID 契约...');
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

// 2. 测试港台矢量旗帜契约
console.log('\n📋 [门禁 2/2] 验证港台旗帜矢量化契约...');
const regionFlagsPath = path.resolve(process.cwd(), 'components/ui/RegionFlags.tsx');
assert.ok(fs.existsSync(regionFlagsPath), '❌ [回归拦截] RegionFlags.tsx 不存在！');
const flagsContent = fs.readFileSync(regionFlagsPath, 'utf8');
assert.ok(flagsContent.includes('export function FlagTW'), '❌ [回归拦截] FlagTW 未导出！');
assert.ok(flagsContent.includes('export function FlagHK'), '❌ [回归拦截] FlagHK 未导出！');
assert.ok(flagsContent.includes('<svg'), '❌ [回归拦截] 旗帜组件必须使用 SVG 矢量标签，杜绝系统字体缺失方块乱码！');
console.log('  ✅ 港台 SVG 矢量旗帜契约核验通过');

console.log('\n====================================================');
console.log('🎉 恭喜！所有历史缺陷防复发自动化回归测试全部 100% 通过！');
console.log('====================================================\n');
