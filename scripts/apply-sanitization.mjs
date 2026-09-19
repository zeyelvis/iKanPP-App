import fs from 'fs';

const CF_KV_ACCOUNT_ID = '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = 'cfk_L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa';
const CF_KV_EMAIL = 'zeyelvis@gmail.com';

async function kvGet(key) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    headers: {
      'X-Auth-Email': CF_KV_EMAIL,
      'X-Auth-Key': CF_KV_API_KEY
    }
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`KV Get ${key} status: ${res.status}`);
  return await res.text();
}

async function kvPut(key, value) {
  const url = `https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(key)}`;
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'X-Auth-Email': CF_KV_EMAIL,
      'X-Auth-Key': CF_KV_API_KEY,
      'Content-Type': 'text/plain; charset=utf-8'
    },
    body: typeof value === 'string' ? value : JSON.stringify(value)
  });
  if (!res.ok) throw new Error(`KV Put ${key} error: ${res.status}`);
}

async function main() {
  console.log('🚀 开始应用全站 8.2 万条全量清洗结果...');

  // 1. 读取缓存的不合规条目清单
  const invalidItems = JSON.parse(fs.readFileSync('.cache/sanitized-invalid-ids.json', 'utf8'));
  const invalidIdSet = new Set(invalidItems.map(i => i.id));
  console.log(`📋 待剔除的不合规条目总数: ${invalidIdSet.size}`);

  // 2. 获取当前最新的 index:all
  const currentAllRaw = await kvGet('index:all');
  const currentAll = JSON.parse(currentAllRaw);
  console.log(`📊 当前生产环境 index:all 总数: ${currentAll.length}`);

  // 备份当前 index:all
  fs.writeFileSync('.cache/index_all_backup.json', currentAllRaw);
  console.log('💾 已备份当前 index:all 至 .cache/index_all_backup.json');

  // 3. 执行过滤
  const cleanedAll = currentAll.filter(id => !invalidIdSet.has(id));
  console.log(`✨ 净化后的 index:all 数量: ${cleanedAll.length} (剔除了 ${currentAll.length - cleanedAll.length} 条)`);

  // 4. 原子写回 index:all
  console.log('⚡ 正在原子写回 index:all 到 Cloudflare KV...');
  await kvPut('index:all', JSON.stringify(cleanedAll));
  console.log('✅ index:all 已成功原子更新！');

  // 5. 获取并清洗 sitemap:catalog
  console.log('📡 正在拉取并同步清洗 sitemap:catalog...');
  const catalogRaw = await kvGet('sitemap:catalog');
  if (catalogRaw) {
    fs.writeFileSync('.cache/sitemap_catalog_backup.json', catalogRaw);
    const catalog = JSON.parse(catalogRaw);
    console.log(`📊 当前 sitemap:catalog 总数: ${catalog.length}`);
    const cleanedCatalog = catalog.filter(c => !invalidIdSet.has(c[0]));
    console.log(`✨ 净化后的 sitemap:catalog 数量: ${cleanedCatalog.length} (剔除了 ${catalog.length - cleanedCatalog.length} 条)`);
    console.log('⚡ 正在原子写回 sitemap:catalog 到 Cloudflare KV...');
    await kvPut('sitemap:catalog', JSON.stringify(cleanedCatalog));
    console.log('✅ sitemap:catalog 已成功原子更新！');
  }

  console.log('\n🎉 全站 8.2 万条实体地毯式排毒清洗已 100% 应用生效！');
}

main().catch(console.error);
