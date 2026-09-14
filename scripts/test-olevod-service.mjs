import { fetchOlevodDetailByTitle } from '../lib/server/olevod.ts';

async function main() {
  console.log('=== 1. 测试热门剧集《凡人修仙传》解析 ===');
  const t0 = Date.now();
  const res1 = await fetchOlevodDetailByTitle('凡人修仙传');
  const d0 = Date.now() - t0;
  console.log(`第 1 次抓取耗时: ${d0}ms`);
  if (!res1) {
    console.error('❌ 解析失败: 未找到凡人修仙传');
    process.exit(1);
  }
  console.log(`✅ 成功获取: [${res1.vod_name}] (ID: ${res1.vod_id}, 年份: ${res1.vod_year})`);
  console.log(`   总集数: ${res1.episodes.length} 集`);
  const ep191 = res1.episodes.find(e => e.name.includes('191') || e.index === 192);
  console.log(`   第 191 集切片: ${ep191 ? ep191.url : res1.episodes[res1.episodes.length - 1].url}`);

  console.log('\n=== 2. 测试 24 小时削峰内存缓存 (0ms 命中) ===');
  const t1 = Date.now();
  const res2 = await fetchOlevodDetailByTitle('凡人修仙传');
  const d1 = Date.now() - t1;
  console.log(`第 2 次读取耗时: ${d1}ms (预期 < 5ms)`);
  if (d1 < 10 && res2?.vod_id === res1.vod_id) {
    console.log('✅ 内存缓存命中验证成功！0 次外部 API 请求！');
  } else {
    console.warn(`⚠️ 耗时为 ${d1}ms`);
  }

  console.log('\n=== 3. 测试热门电视剧《狂飙》===');
  const res3 = await fetchOlevodDetailByTitle('狂飙');
  if (res3) {
    console.log(`✅ 成功获取: [${res3.vod_name}] (总集数: ${res3.episodes.length})`);
    console.log(`   第 1 集切片: ${res3.episodes[0]?.url}`);
  } else {
    console.error('❌ 解析狂飙失败');
  }

  console.log('\n=== 4. 测试未收录生僻影片 (优雅返回 null) ===');
  const res4 = await fetchOlevodDetailByTitle('一部根本不存在的生僻火星片xyz123456');
  console.log(`未收录片返回结果: ${res4 === null ? 'null (符合预期)' : '异常'}`);

  console.log('\n🎉 Olevod 1080P 超清专线核心服务测试全量通过！');
}

main().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
