import { PREBAKED_LATEST_TITLES } from '../lib/data/latest-titles-prebaked.ts';

const CF_KV_ACCOUNT_ID = '172a13185bd6e694bfefc089b12cad6a';
const CF_KV_NAMESPACE_ID = '42311924427747deaf00981d99d58998';
const CF_KV_API_KEY = process.env.CLOUDFLARE_API_KEY || process.env.CF_KV_API_KEY || process.env.CF_API_KEY || process.env.CLOUDFLARE_AUTH_KEY || '';
const CF_KV_EMAIL = 'zeyelvis@gmail.com';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function putKey(channel) {
  const kvKey = channel === 'all' ? 'recent:all' : `recent:${channel}`;
  const list = PREBAKED_LATEST_TITLES[channel] || [];
  
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_KV_ACCOUNT_ID}/storage/kv/namespaces/${CF_KV_NAMESPACE_ID}/values/${encodeURIComponent(kvKey)}`, {
    method: 'PUT',
    headers: {
      'X-Auth-Email': CF_KV_EMAIL,
      'X-Auth-Key': CF_KV_API_KEY,
      'Content-Type': 'text/plain; charset=utf-8',
    },
    body: JSON.stringify(list),
  });

  const json = await res.json();
  console.log(`[KV PUT SUCCESS] ${kvKey} -> 条数: ${list.length}, 榜首: ${list[0]?.title}, status: ${json.success}`);
  await sleep(600);
}

async function run() {
  console.log('🚀 开始顺序安全推送 6 大专区华语纯净最新上线数据...');
  for (const ch of ['all', 'movie', 'tv', 'anime', 'variety', 'documentary']) {
    await putKey(ch);
  }
  console.log('🎉 6 大专区安全推送完毕！');
}

run().catch(console.error);
