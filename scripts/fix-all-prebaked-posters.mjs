import fs from 'fs';
import path from 'path';

const TMDB_API_KEY = '';

async function checkUrl(url) {
  if (!url || !url.startsWith('http')) return false;
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(url, { method: 'HEAD', signal: controller.signal });
    clearTimeout(timer);
    return res.status === 200;
  } catch {
    return false;
  }
}

async function searchTMDBPoster(title, year) {
  const clean = title.replace(/[《》【】\[\]（）()]/g, ' ').trim();
  const queries = [clean, title];
  
  for (const q of queries) {
    try {
      let url = `https://api.themoviedb.org/3/search/multi?api_key=${TMDB_API_KEY}&language=zh-CN&query=${encodeURIComponent(q)}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      const results = data.results || [];
      const matchWithPoster = results.find(r => r.poster_path);
      if (matchWithPoster) {
        const fullUrl = `https://image.tmdb.org/t/p/w500${matchWithPoster.poster_path}`;
        const isValid = await checkUrl(fullUrl);
        if (isValid) return fullUrl;
      }
    } catch {}
  }
  return null;
}

async function processFile(filePath) {
  console.log(`\n🔍 正在检查与修复文件: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // 匹配形如 title: 'xxx', ... cover: 'yyy'
  const itemRegex = /title:\s*['"]([^'"]+)['"][\s\S]*?cover:\s*['"]([^'"]+)['"]/g;
  let match;
  const items = [];

  while ((match = itemRegex.exec(content)) !== null) {
    items.push({
      fullMatch: match[0],
      title: match[1],
      cover: match[2],
    });
  }

  console.log(`共发现 ${items.length} 个条目，开始逐一校验图片可用性...`);

  let fixedCount = 0;
  let healthyCount = 0;
  let failCount = 0;

  for (const item of items) {
    const isOk = await checkUrl(item.cover);
    if (isOk) {
      healthyCount++;
      process.stdout.write(`✅ [正常] ${item.title}\n`);
    } else {
      console.log(`❌ [失效 404] ${item.title} -> 当前地址: ${item.cover}`);
      console.log(`   正在向 TMDB 官方数据库拉取真实现存高清海报...`);
      const newCover = await searchTMDBPoster(item.title);
      if (newCover) {
        console.log(`   🎉 成功获取新海报: ${newCover}`);
        content = content.replace(item.cover, newCover);
        fixedCount++;
      } else {
        console.log(`   ⚠️ TMDB 未找到对应海报: ${item.title}`);
        failCount++;
      }
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`\n✨ 文件处理完毕: ${filePath}`);
  console.log(`   原先健康: ${healthyCount}, 修复成功: ${fixedCount}, 无法匹配: ${failCount}\n`);
}

async function main() {
  const root = process.cwd();
  await processFile(path.join(root, 'lib/data/home-prebaked.ts'));
  await processFile(path.join(root, 'lib/data/category-prebaked.ts'));
}

main();
