import assert from 'node:assert';
import {
  computeLineScore,
  rankSourcesByPerformance,
  DEFAULT_LINE_TOP_ORDER,
} from '../lib/utils/line-ranking';

console.log('🧪 启动地区线路排序引擎单元测试...\n');

// 1. 无数据时默认基准分
const defaultScore = computeLineScore('test_source', {}, {});
assert.strictEqual(defaultScore, 0.8, '无历史数据时默认平滑分必须为 0.8');

// 2. 赌博广告源扣分 0.15
const adScore = computeLineScore('guangsu', {}, {});
assert.strictEqual(Math.round((defaultScore - adScore) * 100) / 100, 0.15, '广告线路必须扣除 0.15 分');
console.log('✅ [测试 1/4] 默认平滑基准与广告源惩罚计算验证通过！');

// 3. 两次失败 vs 四次失败降级验证
// 假设 A 线和 B 线初始全球成功率均为 0.85
const globalBaseStats = {
  lineA: { ok: 85, fail: 15 }, // base ~ 0.85
  lineB: { ok: 85, fail: 15 },
};

// 地区初始相同，A 排在前面
const initialRank = rankSourcesByPerformance(
  [{ source: 'lineA' }, { source: 'lineB' }],
  {},
  globalBaseStats,
  'AU',
  ['lineA', 'lineB']
);
assert.strictEqual(initialRank[0].source, 'lineA', '初始状态下应维持优先线路在前');

// 两次失败：A 发生 2 次失败，ok=10, fail=2 -> rate = (10 + 8.5) / 22 = 0.841，差值不到 0.14，不超车
const twoFailsStats = {
  lineA: { ok: 10, fail: 2 },
  lineB: { ok: 10, fail: 0 },
};
const twoFailRank = rankSourcesByPerformance(
  [{ source: 'lineA' }, { source: 'lineB' }],
  twoFailsStats,
  globalBaseStats,
  'AU',
  ['lineA', 'lineB']
);
assert.strictEqual(twoFailRank[0].source, 'lineA', '两次失败（可能为单次网络抖动）不应触发换序');

// 四次失败：A 连续 4 次失败，ok=10, fail=6 -> rate = (10 + 8.5) / 26 = 0.7115，B 为 0.925，差值 > 0.14，B 成功超车！
const fourFailsStats = {
  lineA: { ok: 10, fail: 6 },
  lineB: { ok: 10, fail: 0 },
};
const fourFailRank = rankSourcesByPerformance(
  [{ source: 'lineA' }, { source: 'lineB' }],
  fourFailsStats,
  globalBaseStats,
  'AU',
  ['lineA', 'lineB']
);
assert.strictEqual(fourFailRank[0].source, 'lineB', '连续四次失败必须触发降级，健康线路成功超车');
console.log('✅ [测试 2/4] 两次失败防抖与四次失败超车模型断言通过！');

// 4. 0.14 防抖阈值严格测试
const sourcesList = [{ source: 'src1' }, { source: 'src2' }];
// src1 0.778, src2 0.842 (差距 0.064 <= 0.14, 不超车)
const closeStats = {
  src1: { ok: 6, fail: 2 },
  src2: { ok: 8, fail: 1 },
};
const closeRank = rankSourcesByPerformance(
  sourcesList,
  closeStats,
  {},
  'US',
  ['src1', 'src2']
);
assert.strictEqual(closeRank[0].source, 'src1', '差值 <= 0.14 时必须阻止过度振荡换序');

console.log('✅ [测试 3/4] 0.14 防抖阈值严格阻断微小波动测试通过！');

// 5. 线路列表回退兜底
const fallbackRank = rankSourcesByPerformance(
  [{ source: 'wujin' }, { source: 'shadowline' }],
  {},
  {},
  'XX',
  DEFAULT_LINE_TOP_ORDER
);
assert.strictEqual(fallbackRank[0].source, 'shadowline', '无网络数据时必须按 DEFAULT_LINE_TOP_ORDER 优雅兜底');
console.log('✅ [测试 4/4] 离线与冷启动回退兜底测试通过！');

console.log('\n🎉 恭喜！地区线路排序引擎所有单元测试 100% 验证通过！');
