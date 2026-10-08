/**
 * 作品页网址回归测试（替代原 test-latest-titles-404.mjs，2026-10-08 重构阶段 4）。
 *
 * 在内存 SQLite 里按 db/d1 的表结构建一个小片库，用真实片名（含冒号、季号、粘连年份、外文、全角符号），
 * 直接跑网站用的 resolveTitleSegment（lib/data/d1/title-route.ts），断言：
 * 1. 生成的规范网址没有十六进制碎片，且能原地打开、不跳转；
 * 2. 纯片名网址、大小写不同的网址都落到同一部作品；
 * 3. 旧代码撕裂成十六进制的网址能还原并落到对的作品；
 * 4. 编号还在但片名对不上的网址不会被交给占着这个编号的另一部片；
 * 5. 旧站临时编号网址（ik_radar_…、ik_pre_…）按片名解析；
 * 6. 跳转链不超过一次、不成环。
 *
 *   npx tsx scripts/test-title-urls.ts
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { DatabaseSync } from 'node:sqlite';
import { decodeMangledHexSlug, generateSlug, getTitleCanonicalHref, normalizeTitle } from '../lib/data/entities/entity-utils';
import { resolveTitleSegment, type D1Like } from '../lib/data/d1/title-route';

const NAMES = [
  '卧龙2026', '征途', '假面良人', '魔女嘉莉', '海军罪案调查处：纽约第1季', '西西里的雄狮', '寻宝侦探第4季',
  '联邦调查局第9季', '魔法少女育成计划restart', 'PSYREN决战游戏', '忍者战争黑狐VS将军乃忍者', '蜘蛛侠：崭新之日',
  '狂怒者：荣誉之战', '坠落2：死点', '90米', '坂本日常真人版', '溺爱男友养成法～从性关系到成为本命女孩的故事',
  '第二次恋爱才完美第二季', '太玄·东方阙', '玄幻，我！天命大反派', '全职法师特别篇世界学府之争', '红妆送君葬',
  // 旧代码撕裂网址用例里的片名
  '阿波罗陷落', '古战场传奇：吾血之亲第2季', '神秘的声音', '乌鸦俱乐部', '法医秦明之龙番往事', '交锋', '美国人质',
  '名侦探柯南', '厨娘',
];

const MANGLED: { title: string; path: string }[] = [
  { title: '阿波罗陷落', path: 'e9-98-bf-e6-b3-a2-e7-bd-97-e9-99-b7-e8-90-bd' },
  { title: '古战场传奇：吾血之亲第2季', path: 'e5-8f-a4-e6-88-98-e5-9c-ba-e4-bc-a0-e5-a5-87-e5-90-be-e8-a1-80-e4-b9-8b-e4-ba-b2-e7-ac-ac2-e5-ad-a3' },
  { title: '神秘的声音', path: 'e7-a5-9e-e7-a7-98-e7-9a-84-e5-a3-b0-e9-9f-b3' },
  { title: '乌鸦俱乐部', path: 'e4-b9-8c-e9-b8-a6-e4-bf-b1-e4-b9-90-e9-83-a8' },
  { title: '法医秦明之龙番往事', path: 'e6-b3-95-e5-8c-bb-e7-a7-a6-e6-98-8e-e4-b9-8b-e9-be-99-e7-95-aa-e5-be-80-e4-ba-8b' },
  { title: '法医秦明之龙番往事', path: 'ik_radar_all_2-e6-b3-95-e5-8c-bb-e7-a7-a6-e6-98-8e-e4-b9-8b-e9-be-99-e7-95-aa-e5-be-80-e4-ba-8b' },
  { title: '交锋', path: 'e4-ba-a4-e9-94-8b' },
  { title: '美国人质', path: 'e7-be-8e-e5-9b-bd-e4-ba-ba-e8-b4-a8' },
];

const TEMP_IDS: { title: string; path: string }[] = [
  { title: '厨娘', path: 'ik_radar_tv_20-厨娘' },
  { title: '名侦探柯南', path: 'ik_pre_%e5%90%8d%e4%be%a6%e6%8e%a2%e6%9f%af%e5%8d%97-名侦探柯南' },
];

const HEX_DECODE = [
  { input: 'e5-8f-a4-e6-88-98-e5-9c-ba-e4-bc-a0-e5-a5-87', expected: '古战场传奇' },
  { input: 'e4-b8-87-e7-89-a9-e6-97-a2-e4-bc-9f-e5-a4-a7', expected: '万物既伟大' },
  { input: 'e5-81-87-e9-9d-a2-e7-be-8e-e9-a2-9c', expected: '假面美颜' },
];

// ---- 内存片库 ----
const sqlite = new DatabaseSync(':memory:');
for (const f of ['0001_init', '0004_title_name_key', '0005_title_genres']) {
  sqlite.exec(readFileSync(new URL(`../db/d1/${f}.sql`, import.meta.url), 'utf8'));
}
const db: D1Like = {
  prepare(sql) {
    const st = sqlite.prepare(sql);
    return {
      bind: (...values) => ({
        first: async <T>() => (st.get(...(values as never[])) as T) ?? null,
        all: async <T>() => ({ results: st.all(...(values as never[])) as T[] }),
      }),
    };
  },
};

const code = (id: number) => `ik${String(id).padStart(6, '0')}`;
const ids = new Map<string, number>();
const canonical = new Map<number, string>();
const insertTitle = sqlite.prepare("INSERT INTO titles (id, state, kind, name, name_key) VALUES (?, 'live', 'tv', ?, ?)");
const insertSlug = sqlite.prepare('INSERT OR IGNORE INTO slugs (slug, title_id, canonical, source) VALUES (?, ?, ?, ?)');
NAMES.forEach((name, i) => {
  const id = 130001 + i;
  // 与入库 Worker（workers/ikanpp-ingest/src/titles.ts）建档时写的片段相同
  const slug = `${code(id)}-${generateSlug(name)}`;
  insertTitle.run(id, name, normalizeTitle(name));
  insertSlug.run(slug, id, 1, 'ingest');
  insertSlug.run(generateSlug(name), id, 0, 'ingest-name');
  ids.set(name, id);
  canonical.set(id, `/title/${slug}`);
});
// 编号被改指的情形：ik139999 现在是《征途》，旧网址 ik139999-别的片 不能落到《征途》
sqlite.prepare("INSERT INTO titles (id, state, kind, name, name_key) VALUES (139999, 'live', 'movie', '征途', ?)").run(normalizeTitle('征途'));
insertSlug.run(`${code(139999)}-${generateSlug('征途')}`, 139999, 1, 'ingest');

async function follow(path: string) {
  let current = path;
  for (let hop = 0; hop < 3; hop++) {
    const r = await resolveTitleSegment(db, current.replace(/^\/title\//, ''));
    if (r.type === 'redirect') {
      current = r.location;
      continue;
    }
    return { r, hops: hop, path: current };
  }
  throw new Error(`跳转超过 2 次或成环: ${path}`);
}

let failures = 0;
async function check(label: string, fn: () => Promise<void> | void) {
  try {
    await fn();
  } catch (err) {
    failures++;
    console.error(`❌ ${label}: ${err instanceof Error ? err.message : err}`);
  }
}

async function main() {
  console.log(`作品页网址回归测试：${NAMES.length} 部作品`);

  for (const name of NAMES) {
    const id = ids.get(name)!;
    const href = getTitleCanonicalHref({ entityId: code(id), title: name });
    await check(`《${name}》规范网址`, async () => {
      assert.ok(!/(?:e[0-9a-f]-[0-9a-f]{2}){2,}/i.test(href), `出现十六进制碎片 ${href}`);
      assert.equal(href, canonical.get(id), '网站生成的网址与片库里的规范片段不一致');
      const { r, hops } = await follow(href);
      assert.equal(r.type, 'title');
      assert.equal(hops, 0, '规范网址不应再跳转');
      if (r.type === 'title') assert.equal(r.row.id, id);
    });
    await check(`《${name}》纯片名网址`, async () => {
      const { r, hops } = await follow(`/title/${generateSlug(name)}`);
      assert.equal(r.type, 'title');
      assert.ok(hops <= 1);
      if (r.type === 'title') assert.equal(r.row.id, id);
    });
    await check(`《${name}》大写网址`, async () => {
      const { r } = await follow(href.toUpperCase().replace('/TITLE/', '/title/'));
      assert.equal(r.type, 'title');
      if (r.type === 'title') assert.equal(r.row.id, id);
    });
  }

  for (const c of [...MANGLED, ...TEMP_IDS]) {
    await check(`旧网址 /title/${c.path}`, async () => {
      const { r, hops } = await follow(`/title/${c.path}`);
      assert.equal(r.type, 'title', '应落到作品页');
      assert.ok(hops <= 1);
      if (r.type === 'title') assert.equal(r.row.name, c.title);
    });
  }

  await check('编号被改指的旧网址', async () => {
    const { r } = await follow(`/title/${code(139999)}-${generateSlug('西西里的雄狮')}`);
    // 片名对不上编号：按片名落到《西西里的雄狮》本身，绝不能是占着编号的《征途》
    assert.ok(r.type !== 'title' || r.row.id === ids.get('西西里的雄狮'), `落到了 ${r.type === 'title' ? r.row.name : r.type}`);
  });

  await check('不存在的片名', async () => {
    const { r } = await follow('/title/这部片不存在于片库');
    assert.equal(r.type, 'not-found');
  });

  for (const t of HEX_DECODE) {
    await check(`十六进制还原 ${t.input}`, () => {
      assert.ok(decodeMangledHexSlug(t.input).includes(t.expected));
    });
  }

  if (failures) {
    console.error(`\n❌ ${failures} 项未通过`);
    process.exit(1);
  }
  console.log('✅ 全部通过：规范网址、纯片名、撕裂网址、临时编号、改指编号均解析正确');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
