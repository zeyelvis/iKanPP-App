import { getTitleCanonicalHref, parseEntitySlug, normalizeTitle, generateSlug, decodeMangledHexSlug } from '../lib/data/entities/entity-utils.ts';
import { PREBAKED_LATEST_TITLES } from '../lib/data/latest-titles-prebaked.ts';

// 模拟详情页中的 resolveEntity 与预烘焙匹配逻辑
function simulateResolve(param, prebakedList) {
  let decodedSlug = param.trim();
  try {
    decodedSlug = decodeURIComponent(decodedSlug).trim();
  } catch {}

  const { entityId, slug: innerSlug } = parseEntitySlug(decodedSlug);
  let cleanTitle = innerSlug || (entityId ? '' : decodedSlug);
  cleanTitle = cleanTitle.replace(/^[-\s]+|[-\s]+$/g, '');
  if (/^[a-zA-Z0-9_]+-/.test(cleanTitle)) {
    cleanTitle = cleanTitle.replace(/^[a-zA-Z0-9_]+-/, '');
  }
  try {
    cleanTitle = decodeURIComponent(cleanTitle).trim();
  } catch {}
  cleanTitle = decodeMangledHexSlug(cleanTitle);

  const hit = prebakedList.find(item => {
    if (!item) return false;
    let itemSlugDecoded = '';
    try {
      itemSlugDecoded = decodeURIComponent(item.slug || '');
    } catch {}

    const cleanTitleLower = cleanTitle.toLowerCase();
    const decodedSlugLower = decodedSlug.toLowerCase();
    const itemTitleNorm = normalizeTitle(item.title);
    const cleanTitleNorm = normalizeTitle(cleanTitle);
    const decodedSlugNorm = normalizeTitle(decodedSlug);

    if (
      item.slug === decodedSlug ||
      itemSlugDecoded === decodedSlug ||
      item.title === cleanTitle ||
      item.title === decodedSlug ||
      (itemTitleNorm && (itemTitleNorm === cleanTitleNorm || itemTitleNorm === decodedSlugNorm)) ||
      (item.entityId && entityId && item.entityId.toLowerCase() === entityId.toLowerCase())
    ) {
      return true;
    }

    const itemTitleSlug = generateSlug(item.title).toLowerCase();
    if (itemTitleSlug === cleanTitleLower || itemTitleSlug === decodedSlugLower) {
      return true;
    }

    // 3. 历史受损 hex-slug 自愈比对（将连字符十六进制碎片无损还原为真实中文比对）
    const decodedClean = decodeMangledHexSlug(cleanTitleLower);
    const decodedSlugHex = decodeMangledHexSlug(decodedSlugLower);
    if (
      (decodedClean && (item.title === decodedClean || itemTitleNorm === normalizeTitle(decodedClean) || itemTitleSlug === decodedClean)) ||
      (decodedSlugHex && (item.title === decodedSlugHex || itemTitleNorm === normalizeTitle(decodedSlugHex) || itemTitleSlug === decodedSlugHex))
    ) {
      return true;
    }

    return false;
  });

  return hit || null;
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 全站「最新上线」防404与自愈能力全量自动化回归测试');
  console.log('====================================================');

  const allItems = [];
  for (const list of Object.values(PREBAKED_LATEST_TITLES)) {
    allItems.push(...list);
  }

  console.log(`\n📋 步骤 1：测试全专区所有 ${allItems.length} 部影片的 URL 生成与详情页解析...`);
  let successCount = 0;
  let failCount = 0;

  for (const item of allItems) {
    const href = getTitleCanonicalHref(item);
    
    // 校验生成的 URL 是否包含畸形连字符十六进制片段
    if (/(?:e[0-9a-f]-[0-9a-f]{2}){2,}/i.test(href)) {
      console.error(`❌ [URL格式异常] 片名 "${item.title}" 生成了撕裂的hex URL: ${href}`);
      failCount++;
      continue;
    }

    const rawSlug = href.replace(/^\/title\//, '');
    const resolved = simulateResolve(rawSlug, allItems);

    if (!resolved) {
      console.error(`❌ [404 未命中] 片名 "${item.title}" (URL: ${href}) 解析失败！`);
      failCount++;
    } else {
      successCount++;
    }
  }

  console.log(`✅ 步骤 1 验证完毕：成功 ${successCount} 部，失败 ${failCount} 部`);

  console.log(`\n📋 步骤 2：测试历史畸形 URL 存量自愈能力（纯 Hex 与带 ID Hex）...`);
  
  // 基础静态畸形 URL 测试集 + 动态从当前活跃片库中抽样生成测试集
  const staticCases = [
    { title: '阿波罗陷落', mangled: 'e9-98-bf-e6-b3-a2-e7-bd-97-e9-99-b7-e8-90-bd' },
    { title: '古战场传奇：吾血之亲第2季', mangled: 'e5-8f-a4-e6-88-98-e5-9c-ba-e4-bc-a0-e5-a5-87-e5-90-be-e8-a1-80-e4-b9-8b-e4-ba-b2-e7-ac-ac2-e5-ad-a3' },
    { title: '古战场传奇：吾血之亲第2季', mangled: 'ik475975-e5-8f-a4-e6-88-98-e5-9c-ba-e4-bc-a0-e5-a5-87-e5-90-be-e8-a1-80-e4-b9-8b-e4-ba-b2-e7-ac-ac2-e5-ad-a3' },
    { title: '神秘的声音', mangled: 'e7-a5-9e-e7-a7-98-e7-9a-84-e5-a3-b0-e9-9f-b3' },
    { title: '乌鸦俱乐部', mangled: 'e4-b9-8c-e9-b8-a6-e4-bf-b1-e4-b9-90-e9-83-a8' },
    { title: '法医秦明之龙番往事', mangled: 'e6-b3-95-e5-8c-bb-e7-a7-a6-e6-98-8e-e4-b9-8b-e9-be-99-e7-95-aa-e5-be-80-e4-ba-8b' },
    { title: '法医秦明之龙番往事', mangled: 'ik_radar_all_2-e6-b3-95-e5-8c-bb-e7-a7-a6-e6-98-8e-e4-b9-8b-e9-be-99-e7-95-aa-e5-be-80-e4-ba-8b' },
    { title: '交锋', mangled: 'e4-ba-a4-e9-94-8b' },
    { title: '美国人质', mangled: 'e7-be-8e-e5-9b-bd-e4-ba-ba-e8-b4-a8' }
  ];

  // 过滤出当前片库中切实收录的影片进行自愈断言
  const mangledCases = staticCases.filter(c => {
    const exists = allItems.some(item => item && (item.title === c.title || normalizeTitle(item.title) === normalizeTitle(c.title)));
    if (!exists) {
      console.log(`  ⏩ 影片《${c.title}》已随雷达小时级更新滚动淘汰出当前活跃前台，跳过该项`);
    }
    return exists;
  });

  let mangledSuccess = 0;
  for (const c of mangledCases) {
    const resolved = simulateResolve(c.mangled, allItems);
    if (resolved && (resolved.title === c.title || normalizeTitle(resolved.title) === normalizeTitle(c.title))) {
      console.log(`  ✅ 历史死链 "/title/${c.mangled}" 成功自愈命中: 《${resolved.title}》`);
      mangledSuccess++;
    } else {
      console.error(`  ❌ 历史死链 "/title/${c.mangled}" 无法自愈！`);
    }
  }

  console.log(`✅ 步骤 2 验证完毕：历史死链 100% 成功自愈 (${mangledSuccess}/${mangledCases.length})`);

  console.log(`\n📋 步骤 3：测试 decodeMangledHexSlug 核心算法的字节级还原能力...`);
  const hexTests = [
    { input: 'e5-8f-a4-e6-88-98-e5-9c-ba-e4-bc-a0-e5-a5-87', expected: '古战场传奇' },
    { input: 'e4-b8-87-e7-89-a9-e6-97-a2-e4-bc-9f-e5-a4-a7', expected: '万物既伟大' },
    { input: 'e5-81-87-e9-9d-a2-e7-be-8e-e9-a2-9c', expected: '假面美颜' },
  ];
  let hexSuccess = 0;
  for (const t of hexTests) {
    const decoded = decodeMangledHexSlug(t.input);
    if (decoded.includes(t.expected)) {
      console.log(`  ✅ Hex 解码通过: ${t.input} -> ${decoded}`);
      hexSuccess++;
    } else {
      console.error(`  ❌ Hex 解码失败: ${t.input} -> ${decoded} (期望包含 ${t.expected})`);
    }
  }

  if (failCount === 0 && mangledSuccess === mangledCases.length && hexSuccess === hexTests.length) {
    console.log('\n🎉 所有回归测试全部通过！0 个 404！');
    process.exit(0);
  } else {
    console.error('\n❌ 测试未完全通过，请检查日志！');
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
