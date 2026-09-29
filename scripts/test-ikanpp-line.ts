import { ikanppProvider, matchBestIkanppLineCandidate } from '../lib/services/providers/iyf-provider';
import { getIkanppLineConfig, runIkanppLineProbe } from '../lib/services/ikanpp-line-service';
import { getSourceName } from '../lib/utils/source-names';
import { isValidSourceId } from '../lib/api/video-sources';
import { DEFAULT_LINE_TOP_ORDER } from '../lib/utils/line-ranking';

async function main() {
  console.log('====================================================');
  console.log('🧪 iKanPP 专线 (iKanPP Line Engine) 全链路自动化验证');
  console.log('====================================================\n');

  // 1. 验证名称规范
  console.log('📋 [测试 1/5] 验证源名称与线路规范...');
  const name1 = getSourceName('ikanpp');
  const name2 = getSourceName('ikanpp_line');
  const name3 = getSourceName('iyf');
  if (name1 !== '⚡ iKanPP专线' || name2 !== '⚡ iKanPP专线' || name3 !== '⚡ iKanPP专线') {
    throw new Error(`线路名称不符合规范: ${name1}, ${name2}, ${name3}`);
  }
  if (!isValidSourceId('ikanpp') || !isValidSourceId('ikanpp_line')) {
    throw new Error('ikanpp 专线未被识别为有效源 ID');
  }
  if (DEFAULT_LINE_TOP_ORDER[0] !== 'ikanpp') {
    throw new Error('ikanpp 专线未置顶在 DEFAULT_LINE_TOP_ORDER 首位');
  }
  console.log('  ✅ 专线名称与排序优先级验证通过: ⚡ iKanPP专线');

  // 2. 验证探活接口
  console.log('\n📋 [测试 2/5] 验证探活与签名算法...');
  const probe = await runIkanppLineProbe();
  console.log(`  探活结果: success=${probe.success}, latency=${probe.health.latencyMs}ms, resolution=${probe.health.resolution}`);
  if (!probe.success) {
    throw new Error(`探活失败: ${probe.health.error}`);
  }
  console.log('  ✅ 探活与签名算法验证通过');

  // 3. 验证片名直通搜索
  console.log('\n📋 [测试 3/5] 验证片名搜索与消歧匹配...');
  const searchResults = await ikanppProvider.searchByTitle('繁花');
  console.log(`  搜索《繁花》返回条目数: ${searchResults.length}`);
  if (searchResults.length === 0) {
    throw new Error('搜索《繁花》返回结果为空');
  }

  const matched = matchBestIkanppLineCandidate(searchResults, {
    title: '繁花',
    category: '电视剧',
  });
  if (!matched) {
    throw new Error('消歧匹配《繁花》失败');
  }
  console.log(`  ✅ 成功命中: 《${matched.title}》, mediaKey: ${matched.mediaKey}, 类型: ${matched.mediaType}`);

  // 4. 验证播放地址直解
  console.log('\n📋 [测试 4/5] 验证播放地址换取与直连播放...');
  const playData = await ikanppProvider.getPlayData(matched.mediaKey);
  if (!playData || playData.length === 0) {
    throw new Error('获取播放数据失败');
  }
  const freeEntry = playData.find(item => !item.isVip && item.mediaUrl);
  if (!freeEntry) {
    throw new Error('未找到可用免费播放流');
  }
  console.log(`  ✅ 成功获取画质: ${freeEntry.resolutionDes} (${freeEntry.resolution}P)`);
  console.log(`  ✅ 播放直链: ${freeEntry.mediaUrl.slice(0, 70)}...`);

  // 5. 验证轨道 A 铁律 (100% 浏览器直连第三方源站 CDN，零反代、零改写切片)
  console.log('\n📋 [测试 5/5] 验证轨道 A 双轨隔离铁律...');
  if (freeEntry.mediaUrl.includes('/api/proxy')) {
    throw new Error('严重违反轨道 A 铁律: 包含了 /api/proxy 反代地址！');
  }
  if (!freeEntry.mediaUrl.includes('pipecdn.vip')) {
    throw new Error('返回的流地址不是直连 PipeCDN！');
  }
  console.log('  ✅ 100% 浏览器直连第三方源站 PipeCDN (Direct Play)，零反代，恪守轨道 A 铁律！');

  console.log('\n====================================================');
  console.log('🎉 恭喜！iKanPP 专线全链路端到端验证 100% 成功通过！');
  console.log('====================================================');
}

main().catch(err => {
  console.error('❌ 测试失败:', err);
  process.exit(1);
});
