#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

/**
 * 🧹 生产环境 Cloudflare KV 终极物理排毒与幽灵条目粉碎引擎 (Sanitize & Purge)
 *
 * 核心升级：
 * 1. 采用最严格内容安全准则（包括新字体日文汉字、单字违禁词、敏感词）；
 * 2. 识别出的所有不合规条目，不仅从 index:all / sitemap:catalog 剔除，
 *    而且调用 DELETE 接口物理彻底抹除 entity:${id}、slug:${id}，杜绝死灰复燃！
 * 3. 统计并输出详尽体检报告。
 */

const CF_KV_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = process.env.CLOUDFLARE_NAMESPACE_ID || '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = process.env.CLOUDFLARE_API_KEY || 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const CF_KV_EMAIL = process.env.CLOUDFLARE_EMAIL || 'zeyelvis@gmail.com';

const isApplyMode = process.argv.includes('--apply');
const isPurgeKV = process.argv.includes('--purge-entities'); // 物理删除键
const tailArg = process.argv.find(a => a.startsWith('--tail='));
const tailLimit = tailArg ? parseInt(tailArg.split('=')[1], 10) : 0;

// 成人与违禁词
const ADULT_BLACKLIST_WORDS = [
  '痴漢', '痴汉', '調教', '调教', '発情', '发情', '近親', '近亲', '乱倫', '乱伦',
  '性奴', '小股', '沙龙病院', '中出し', '潮吹き', '巨乳', '美乳', '素人',
  '熟女', '人妻', '淫乱', '淫', '絶頂', '绝顶', '強姦', '强奸', '輪姦', '轮奸', '肉便器',
  '風俗', '风俗', '無修正', '无修正', 'エロ', 'AV', 'JAV', 'FC2', 'SM', '変態', '变态',
  '制服誘惑', '制服诱惑', '女教師', '女教师', '看護婦', '看护妇', '盗撮', '覗き', '偷窥',
  '性交', '做爱', '自慰', '色情', '三级', '露点', '情色', '偷拍', '色誘', '色诱', '情欲', '欲女',
  '売春', '愛汁', '肉しびれ', '女囚', '痴情', '快辱', '乱交', 'ポル诺', '半熟売春',
  '肉体', '迷奸', '性爱', '野合', '春药', '偷欢', '私通', '肉欲', '性虐', '援交', '内射', '潮吹'
];

const JAPANESE_KANJI_VARIANTS = /[剣気駅図竜絵鉄悪戦沢浜黒広恵毎歯寿对専拠抜拝捜検栄様歩殺殻浄浅]/;

function isCleanChineseTitle(title) {
  if (!title || typeof title !== 'string') return false;
  const t = title.trim();
  if (!t) return false;

  for (const w of ADULT_BLACKLIST_WORDS) {
    if (t.includes(w)) return false;
  }
  // 日文假名
  if (/[\u3040-\u309f\u30a0-\u30ff]/.test(t)) return false;
  // 韩文字符
  if (/[\uac00-\ud7af]/.test(t)) return false;
  // 日本新字体生肉识别
  if (JAPANESE_KANJI_VARIANTS.test(t)) {
    if (!/^(中国|华语|台湾|香港|澳门)/.test(t) && !/[的一是在不了有和人这中大国为上个]/g.test(t)) {
      return false;
    }
  }
  // 必须包含中文汉字
  if (!/[\u4e00-\u9fa5]/.test(t)) return false;

  return true;
}

async function kvGet(key, retries = 3) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'X-Auth-Email': CF_KV_EMAIL,
          'X-Auth-Key': CF_KV_API_KEY,
        },
      });
      if (res.status === 404) return null;
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 1000 * (attempt + 1)));
        continue;
      }
      if (!res.ok) throw new Error(`KV Get ${key} status: ${res.status}`);
      return await res.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise(r => setTimeout(r, 200 * (attempt + 1)));
    }
  }
  return null;
}

async function kvPut(key, value) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Auth-Email': CF_KV_EMAIL,
      'X-Auth-Key': CF_KV_API_KEY,
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body: typeof value === 'string' ? value : JSON.stringify(value),
  });
  if (!res.ok) throw new Error(`KV Put ${key} error: ${res.status}`);
}

async function kvBulkDelete(keys) {
  if (!keys || keys.length === 0) return;
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/bulk`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: {
      'X-Auth-Email': CF_KV_EMAIL,
      'X-Auth-Key': CF_KV_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(keys),
  });
  if (!res.ok) {
    console.warn(`[kvBulkDelete] 状态码: ${res.status}`);
  }
}

async function runSanitization() {
  console.log('====================================================');
  console.log(`🛡️  iKanPP 全站实体库终极物理排毒与幽灵粉碎引擎`);
  console.log(`模式: ${isApplyMode ? '⚡ [APPLY 生产实际修剪]' : '🔍 [DRY-RUN 仅只读排查统计]'}`);
  console.log(`物理抹除键: ${isPurgeKV ? '🔥 开启 (直接物理删除 KV 中的不合规实体)' : '🛡️ 仅更新索引大盘'}`);
  console.log('====================================================\n');

  // 1. 读取 index:all
  console.log('📡 [1/4] 正在拉取生产环境 index:all 全局索引...');
  const indexAllRaw = await kvGet('index:all');
  if (!indexAllRaw) {
    console.log('❌ 未获取到 index:all');
    return;
  }

  const allIds = JSON.parse(indexAllRaw);
  let targetIds = allIds;
  if (tailLimit > 0) {
    targetIds = allIds.slice(-tailLimit);
  }

  console.log(`📊 现有 index:all 总条目数: ${allIds.length} | 本次扫描目标数: ${targetIds.length}${tailLimit > 0 ? ` (最新 ${tailLimit} 条)` : ' (全站全量)'}`);

  // 2. 并发扫描与判定
  console.log('\n🔍 [2/4] 正在并发扫描实体健康度与语言合规性 (每批 100 条)...');
  const validIds = [];
  const invalidItems = [];
  const BATCH_SIZE = 100;

  for (let i = 0; i < targetIds.length; i += BATCH_SIZE) {
    const chunk = targetIds.slice(i, i + BATCH_SIZE);
    await Promise.all(chunk.map(async (id) => {
      try {
        const raw = await kvGet(`entity:${id}`);
        if (!raw) {
          invalidItems.push({ id, reason: 'KV 记录不存在(空键)' });
          return;
        }
        const ent = JSON.parse(raw);
        const title = (ent.title || '').trim();

        if (!title) {
          invalidItems.push({ id, title: '(空标题)', reason: '缺少片名' });
          return;
        }

        if (!isCleanChineseTitle(title)) {
          invalidItems.push({
            id,
            title,
            year: ent.year || '未知',
            type: ent.type || '未知',
            reason: /[\u3040-\u309f\u30a0-\u30ff]/.test(title) ? '含日文假名' :
                    /[\uac00-\ud7af]/.test(title) ? '含韩文字符' :
                    JAPANESE_KANJI_VARIANTS.test(title) ? '含日文新字体生肉汉字' :
                    !/[\u4e00-\u9fa5]/.test(title) ? '纯外文无中文' : '命中违禁词'
          });
          return;
        }

        validIds.push(id);
      } catch (err) {
        console.warn(`读取 entity:${id} 异常:`, err.message);
        // 重试失败，加入待排查
        invalidItems.push({ id, reason: `读取超时或异常: ${err.message}` });
      }
    }));

    if ((i + BATCH_SIZE) % 5000 === 0 || i + BATCH_SIZE >= targetIds.length) {
      console.log(`   - 已扫描: ${Math.min(i + BATCH_SIZE, targetIds.length)} / ${targetIds.length} | 累计发现不合规条目: ${invalidItems.length}`);
    }
  }

  // 持久化不合规清单以供留档与复核
  try {
    const cacheDir = path.resolve(process.cwd(), '.cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir, { recursive: true });
    fs.writeFileSync(path.join(cacheDir, 'purged-invalid-ids.json'), JSON.stringify(invalidItems, null, 2));
  } catch {}

  // 3. 输出排查统计报告
  console.log('\n📊 [3/4] 排查审计统计报告:');
  console.log(`- 原始实体总数: ${allIds.length}`);
  console.log(`- 正常合规华语实体数: ${validIds.length} (占比 ${(validIds.length / allIds.length * 100).toFixed(2)}%)`);
  console.log(`- 需修剪的不合规幽灵/外文/违规条目数: ${invalidItems.length} (占比 ${(invalidItems.length / allIds.length * 100).toFixed(2)}%)`);

  console.log('\n📋 被识别出的不合规条目样例 (前 25 条):');
  for (const it of invalidItems.slice(0, 25)) {
    console.log(`  - [${it.id}] 《${it.title || '(无)'}》 (${it.year || '-'}) 原因: ${it.reason}`);
  }

  // 4. 执行修剪与物理删除
  if (isApplyMode) {
    if (invalidItems.length === 0) {
      console.log('\n✨ 实体库完全健康，无需执行修剪！');
      return;
    }

    const invalidIdSet = new Set(invalidItems.map(it => it.id));
    const finalAllIds = allIds.filter(id => !invalidIdSet.has(id));

    console.log(`\n⚡ [4/4] 正在执行生产环境原子修剪，重写 index:all (从 ${allIds.length} 净化至 ${finalAllIds.length} 条，剔除 ${invalidItems.length} 条)...`);
    await kvPut('index:all', JSON.stringify(finalAllIds));
    console.log('✅ index:all 已成功原子更新！');

    // 同步清洗 sitemap:catalog
    console.log('📡 正在同步修剪 sitemap:catalog...');
    try {
      const catalogRaw = await kvGet('sitemap:catalog');
      if (catalogRaw) {
        const catalog = JSON.parse(catalogRaw);
        const cleanedCatalog = catalog.filter(c => !invalidIdSet.has(c[0]));
        await kvPut('sitemap:catalog', JSON.stringify(cleanedCatalog));
        console.log(`✅ sitemap:catalog 已同步更新，从 ${catalog.length} 条缩减为 ${cleanedCatalog.length} 条！`);
      }
    } catch (e) {
      console.warn('修剪 sitemap:catalog 异常:', e.message);
    }

    // 物理彻底抹除 KV 中的垃圾条目
    if (isPurgeKV) {
      console.log(`🔥 正在批量物理抹除 Cloudflare KV 中的 ${invalidItems.length} 个不合规实体键...`);
      const keysToDelete = [];
      for (const it of invalidItems) {
        keysToDelete.push(`entity:${it.id}`);
        keysToDelete.push(`slug:${it.id}`);
      }

      // 分批 1000 键调用 bulk delete
      for (let k = 0; k < keysToDelete.length; k += 1000) {
        const batchKeys = keysToDelete.slice(k, k + 1000);
        await kvBulkDelete(batchKeys);
        console.log(`   - 已物理抹除: ${Math.min(k + 1000, keysToDelete.length)} / ${keysToDelete.length} 个键`);
      }
      console.log('✅ 不合规幽灵实体已从 Cloudflare KV 底层物理抹除完毕！');
    }

    console.log('\n🎉 全站实体库终极排毒与修剪圆满完成！');
  } else {
    console.log('\n💡 当前为 [DRY-RUN] 模式，未修改生产数据。若确认修剪并物理抹除，请运行:');
    console.log('   node scripts/sanitize-and-purge.mjs --apply --purge-entities');
  }
}

runSanitization().catch(console.error);
