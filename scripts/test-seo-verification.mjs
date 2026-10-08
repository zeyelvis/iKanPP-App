/**
 * SEO 白帽与真实性回归测试（2026-10-08 重构阶段 4 按 D1 架构重写）。
 * 静态检查为主：凭据不进仓库、结构化数据不造假、薄内容页 noindex 且不上站点地图、站点地图 lastmod 真实、
 * 不再有 Google Indexing API 推送、定时接口不写默认口令。作品页网址解析见 scripts/test-title-urls.ts。
 *
 *   node scripts/test-seo-verification.mjs
 */
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const read = (rel) => fs.readFileSync(path.resolve(rel), 'utf8');
let step = 0;
function check(name, fn) {
  step++;
  fn();
  console.log(`  ✅ [${step}] ${name}`);
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|js|mjs|json|ya?ml|jsonc)$/.test(e.name)) out.push(p);
  }
  return out;
}
const SOURCE_FILES = ['app', 'lib', 'components', 'scripts', 'workers', '.github'].flatMap((d) => walk(path.resolve(d)));

console.log('🧪 SEO 白帽与真实性回归测试\n');

check('仓库里没有写死的 Cloudflare 凭据', () => {
  const leaked = ['cfk_', 'L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa'].join('');
  const hits = SOURCE_FILES.filter((f) => !f.endsWith('test-seo-verification.mjs') && fs.readFileSync(f, 'utf8').includes(leaked));
  assert.deepStrictEqual(hits, [], `发现凭据字面量: ${hits.join(', ')}`);
});

check('定时接口不写默认口令', () => {
  const hits = SOURCE_FILES.filter((f) => /ikanpp-cron-sync-secret|process\.env\.CRON_SECRET\s*\|\|/.test(fs.readFileSync(f, 'utf8')) && !f.endsWith('test-seo-verification.mjs') && !f.endsWith('test-architecture-integrity.mjs'));
  assert.deepStrictEqual(hits, [], `发现默认口令: ${hits.join(', ')}`);
});

check('不再调用 Google Indexing API（只适用于招聘与直播页）', () => {
  const hits = SOURCE_FILES.filter((f) => /indexing\.googleapis\.com/.test(fs.readFileSync(f, 'utf8')));
  assert.deepStrictEqual(hits, [], `发现 Indexing API 调用: ${hits.join(', ')}`);
});

check('作品页结构化数据：单一 @graph，无编造评分人数、无 VideoObject、无机械 FAQPage', () => {
  const c = read('components/seo/TitleJsonLd.tsx');
  assert.ok(c.includes("'@graph': ["));
  assert.ok(!c.includes('1520'));
  assert.ok(!c.includes("'@type': 'VideoObject'"));
  assert.ok(!c.includes("'@type': 'FAQPage'"));
});

check('作品页摘要卡不写死年份、评分与画质宣称', () => {
  const c = read('components/seo/AiOverviewCapsule.tsx');
  for (const bad of ["entity.year || '2024'", "entity.rate || '8.5'", '官方元数据权威核验', '1080P/4K超清', '免VIP极速秒播']) {
    assert.ok(!c.includes(bad), `AiOverviewCapsule 含 ${bad}`);
  }
});

check('相关搜索内链指向规范页面，不指向 /search?q=', () => {
  const c = read('components/seo/RelatedSearchChips.tsx');
  assert.ok(!c.includes('/search?q='));
  assert.ok(c.includes('resolveCanonicalHref'));
});

check('作品页旧网址用 308 永久跳转', () => {
  const c = read('app/title/[slug]/page.tsx');
  assert.ok(c.includes('permanentRedirect') && c.includes('RedirectType.replace'));
});

check('作品页 keywords 不堆砌（最多 5 个）', () => {
  assert.ok(read('app/title/[slug]/page.tsx').includes('seoSpectrum.keywords.slice(0, 5)'));
});

for (const [name, rel] of [['演员', 'app/actor/[slug]/page.tsx'], ['导演', 'app/director/[slug]/page.tsx']]) {
  check(`${name}页：没有作品时 noindex，标题不加营销词，卡片用规范网址`, () => {
    const c = read(rel);
    assert.ok(c.includes('cleanEntities.length === 0'));
    assert.ok(c.includes('robots: { index: false, follow: false }'));
    assert.ok(!c.includes('免费高清在线观看'));
    assert.ok(c.includes('canonicalSlug'));
  });
}

check('题材页：没有作品时 noindex，卡片用规范网址', () => {
  const c = read('app/genre/[slug]/page.tsx');
  assert.ok(c.includes('entities.length === 0'));
  assert.ok(c.includes('robots: { index: false, follow: false }'));
  assert.ok(!c.includes('免费高清在线观看'));
  assert.ok(c.includes('canonicalSlug'));
});

check('人物与题材站点地图：只收有作品的页面，lastmod 取作品真实更新日期', () => {
  for (const rel of ['app/sitemap-people.xml/route.ts', 'app/sitemap-genres.xml/route.ts']) {
    const c = read(rel);
    assert.ok(c.includes("t.state = 'live'"), `${rel} 必须按片库 live 作品过滤`);
    assert.ok(c.includes('max(substr(t.updated_at, 1, 10))'), `${rel} lastmod 必须取作品更新日期`);
    assert.ok(!/new Date\(\)\.toISOString\(\)/.test(c), `${rel} 不得用当天日期冒充更新`);
  }
});

check('作品站点地图：越界分卷 404，无废弃标签，保留 ETag', () => {
  const c = read('app/api/seo/sitemap-titles/[page]/route.ts');
  assert.ok(c.includes('status: 404'));
  assert.ok(!c.includes('<priority>') && !c.includes('<changefreq>'));
  assert.ok(c.includes('computeETag'));
});

check('主站点地图只放频道页，不混入作品', () => {
  const c = read('app/sitemap.xml/route.ts');
  assert.ok(c.includes('/movie'));
  assert.ok(!c.includes('<priority>') && !c.includes('<changefreq>'));
});

check('robots：放行 /player（让爬虫读到 noindex），屏蔽 /admin，只声明总索引', () => {
  const c = read('app/robots.ts');
  assert.ok(!c.includes("'/player'"));
  assert.ok(c.includes('/admin'));
  assert.ok(c.includes('sitemap-index.xml'));
});

check('IndexNow 接口：密钥来自环境变量，POST 需口令，GET 无副作用', () => {
  const c = read('app/api/seo/indexnow/route.ts');
  assert.ok(c.includes('process.env.INDEXNOW_KEY'));
  assert.ok(c.includes('verifyAuth') && c.includes('CRON_SECRET'));
  assert.ok(!c.includes('handleIndexNowPush(req)'));
});

check('预览地址 workers.dev 整站 noindex', () => {
  const c = read('proxy.ts');
  assert.ok(c.includes(".workers.dev") && c.includes('noindex, nofollow'));
});

check('关键词库不含网盘与下载截流词', () => {
  assert.ok(!read('lib/data/seo-rules/seo-keyword-system.ts').includes('百度网盘'));
  assert.ok(!read('lib/utils/seo-keyword-generator.ts').includes('GENERIC_MODIFIERS.cloud_storage_intent'));
});

const { resolveCandidate, chooseWinner } = await import('../lib/server/entity-resolver.ts');
check('去重评分：相同 TMDB 编号判为同一部，同名不同年代与导演不合并，选留顺序无关', () => {
  assert.strictEqual(resolveCandidate({ title: '流浪地球2', tmdbId: '840326', type: 'movie' }, { title: '流浪地球 2', tmdbId: '840326', type: 'movie' }).decision, 'same');
  assert.strictEqual(
    resolveCandidate({ title: '凶手', year: '2000', type: 'movie', directors: ['张三'] }, { title: '凶手', year: '2024', type: 'movie', directors: ['李四'] }).decision,
    'different',
  );
  const a = { entityId: 'ik000001', title: '流浪地球', tmdbId: '840326', hot: 5000000 };
  const b = { entityId: 'ik000002', title: '流浪地球', hot: 1000 };
  assert.strictEqual(chooseWinner([a, b]).entityId, 'ik000001');
  assert.strictEqual(chooseWinner([b, a]).entityId, 'ik000001');
});

console.log(`\n🎉 ${step} 项 SEO 白帽与真实性检查全部通过`);
