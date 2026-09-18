#!/usr/bin/env node
const CF_KV_ACCOUNT_ID = '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const CF_KV_EMAIL = 'zeyelvis@gmail.com';

// 仅针对片名的精准成人低俗黑名单（不包含容易在英文或正常词汇中误伤的短字母）
const ADULT_TITLE_WORDS = [
  '売春', '愛汁', '肉しびれ', '女囚', '痴情報道', '痴漢', '快辱',
  '半熟売春', '不倫女医', '性奴', '女尻', '熟肉の感触',
  '乱交', '調教', '無修正', '盗撮', '近親相姦', 'ポルノ', 'エロ',
  'YOSHIO -new member-', 'Kis-My-Ft2 Debut Tour', 'ジャニーズJr.選抜野球大会',
  '未亡人女将', '隣のお姉さん 小股', '性奴客栈', '芸能(裏) 情事', '粉红沙龙病院'
];

async function deleteKV(key) {
  try {
    const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'DELETE',
      headers: {
        'X-Auth-Email': CF_KV_EMAIL,
        'X-Auth-Key': CF_KV_API_KEY,
      },
    });
    const data = await res.json();
    if (data.success) {
      console.log(`🗑️ 物理清除: ${key}`);
    }
  } catch (err) {
    console.warn(`删除 ${key} 异常:`, err);
  }
}

async function scanAndCleanPrefix(prefix) {
  let cursor = '';
  let totalDeleted = 0;

  while (true) {
    const listUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/keys?prefix=${encodeURIComponent(prefix)}&limit=1000${cursor ? '&cursor=' + cursor : ''}`;
    const res = await fetch(listUrl, {
      headers: {
        'X-Auth-Email': CF_KV_EMAIL,
        'X-Auth-Key': CF_KV_API_KEY,
      }
    });
    const json = await res.json();
    if (!json.success || !json.result || json.result.length === 0) break;

    const batch = json.result;
    const CHUNK_SIZE = 25;
    for (let i = 0; i < batch.length; i += CHUNK_SIZE) {
      const chunk = batch.slice(i, i + CHUNK_SIZE);
      await Promise.all(chunk.map(async (k) => {
        try {
          const getUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(k.name)}`;
          const entRes = await fetch(getUrl, {
            headers: {
              'X-Auth-Email': CF_KV_EMAIL,
              'X-Auth-Key': CF_KV_API_KEY,
            }
          });
          if (!entRes.ok) return;
          const text = await entRes.text();

          const parsed = JSON.parse(text);
          const title = parsed.title || '';
          const hasDirtyWord = ADULT_TITLE_WORDS.some(w => title.includes(w));
          let isKanaSpam = false;
          let isLowQuality = false;

          // 纯日文假名地下录像
          if (/[\u3040-\u309f\u30a0-\u30ff]/.test(title) && !/[\u4e00-\u9fa5]{2,}/.test(title)) {
            isKanaSpam = true;
          }
          // 评分极低且是早于 2024 的老废片
          if (parsed.rate && parseFloat(parsed.rate) <= 3.0 && parsed.year && parseInt(parsed.year, 10) < 2024) {
            isLowQuality = true;
          }

          if (hasDirtyWord || isKanaSpam || isLowQuality) {
            console.log(`🚨 识别到污染实体: [${parsed.entityId}] ${parsed.title} (评分: ${parsed.rate}) - 原因: ${hasDirtyWord ? '违禁词' : isKanaSpam ? '日文假名' : '极低分垃圾片'}`);
            await deleteKV(k.name);
            if (parsed.slug) await deleteKV(`slug:${parsed.slug}`);
            if (parsed.tmdbId && parsed.tmdbType) await deleteKV(`tmdb:${parsed.tmdbType}:${parsed.tmdbId}`);
            totalDeleted++;
          }
        } catch {
          // 单条解析或删除失败不中断
        }
      }));
    }

    if (json.result_info?.cursor) {
      cursor = json.result_info.cursor;
    } else {
      break;
    }
  }

  return totalDeleted;
}

async function main() {
  console.log('🛡️ 启动并发深度物理净化流水线...');
  const prefixes = ['entity:ik052', 'entity:ik051', 'entity:ik050'];
  let grandTotal = 0;
  for (const p of prefixes) {
    const count = await scanAndCleanPrefix(p);
    grandTotal += count;
  }
  console.log(`✨ 物理净化大扫除完毕！共销毁抹除 ${grandTotal} 个毒化残留条目。`);
}

main().catch(console.error);
