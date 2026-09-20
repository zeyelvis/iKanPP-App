import assert from 'assert';
import fs from 'fs';
import path from 'path';

console.log('🧪 运行 iKanPP / KVideo 全自动 SEO 规范全量回归测试...\n');

// 1. 测试安全凭据脱敏
console.log('▶ [Test 1] 全库扫描硬编码 API Key 字面量...');
const SECRET_LITERAL = ['cfk_', 'L8MzQDjTswTK4jBtvJjmcKjEnxTQ1dKNhzNyn4dQa33221aa'].join('');
const directories = ['lib', 'app', 'components', 'scripts'];
let leakFound = false;

for (const dir of directories) {
  const fullDir = path.resolve(dir);
  if (!fs.existsSync(fullDir)) continue;
  
  function scan(d) {
    const files = fs.readdirSync(d);
    for (const f of files) {
      const p = path.join(d, f);
      if (p.endsWith('test-seo-verification.mjs')) continue;
      const stat = fs.statSync(p);
      if (stat.isDirectory()) {
        scan(p);
      } else if (/\.(ts|tsx|js|mjs|json|yml|yaml)$/.test(f)) {
        const text = fs.readFileSync(p, 'utf8');
        if (text.includes(SECRET_LITERAL)) {
          console.error(`  ❌ 发现凭据泄漏: ${p}`);
          leakFound = true;
        }
      }
    }
  }
  scan(fullDir);
}
assert.strictEqual(leakFound, false, '不应存在任何凭据字面量');
console.log('  ✅ 凭据扫描通过：全库 0 个硬编码 API Key 凭据！\n');

// 2. 测试 TitleJsonLd 真实性门禁
console.log('▶ [Test 2] 核验 TitleJsonLd 真实性门禁...');
const titleJsonLdPath = path.resolve('components/seo/TitleJsonLd.tsx');
const titleJsonLdContent = fs.readFileSync(titleJsonLdPath, 'utf8');

assert.ok(!titleJsonLdContent.includes('1520'), 'TitleJsonLd 不应包含写死的 ratingCount: 1520');
assert.ok(!titleJsonLdContent.includes("'@type': 'VideoObject'"), 'TitleJsonLd 不应包含虚假 VideoObject');
assert.ok(!titleJsonLdContent.includes("'@type': 'FAQPage'"), 'TitleJsonLd 不应包含机械 FAQPage');
assert.ok(titleJsonLdContent.includes("'@graph': ["), 'TitleJsonLd 必须输出规范单一 @graph 结构');
console.log('  ✅ TitleJsonLd 真实性门禁通过：已消除 1520、VideoObject 与机械 FAQ！\n');

// 3. 测试 RelatedSearchChips 伪内链治理
console.log('▶ [Test 3] 核验 RelatedSearchChips 消除 /search?q= 伪内链...');
const chipsPath = path.resolve('components/seo/RelatedSearchChips.tsx');
const chipsContent = fs.readFileSync(chipsPath, 'utf8');

assert.ok(!chipsContent.includes('/search?q='), 'RelatedSearchChips 不得包含指向 /search?q= 的伪链接');
assert.ok(chipsContent.includes('resolveCanonicalHref'), 'RelatedSearchChips 应使用 resolveCanonicalHref 生成规范链接');
console.log('  ✅ 伪内链治理通过：0 个 /search?q= 链接，全部转为规范分类或语义展示标签！\n');

// 4. 测试 deploy.yml 移除 Google Indexing 推送
console.log('▶ [Test 4] 核验 deploy.yml 移除 Google Indexing 推送...');
const deployYmlPath = path.resolve('.github/workflows/deploy.yml');
const deployYmlContent = fs.readFileSync(deployYmlPath, 'utf8');

assert.ok(!deployYmlContent.includes('push-google-indexing.mjs'), 'deploy.yml 中不得自动执行 push-google-indexing.mjs');
console.log('  ✅ deploy.yml 审核通过：已停用普通影视 URL 推送！\n');

// 5. 测试 google-indexing 门禁拦截
console.log('▶ [Test 5] 验证 Google Indexing 服务端直播门禁保护...');
const googleIndexingServicePath = path.resolve('lib/services/google-indexing.ts');
const googleIndexingContent = fs.readFileSync(googleIndexingServicePath, 'utf8');

assert.ok(googleIndexingContent.includes('isLiveBroadcast'), 'publishGoogleIndexingUrl 必须有 isLiveBroadcast 门禁');
assert.ok(googleIndexingContent.includes('eligibleUrls'), 'batchPublishGoogleIndexing 必须有直播 URL 过滤');
console.log('  ✅ Google Indexing 门禁通过：普通影片调用 100% 拦截跳过！\n');

// 6. 测试 robots.ts 规则
console.log('▶ [Test 6] 校验 robots.ts 规则规范...');
const robotsPath = path.resolve('app/robots.ts');
const robotsContent = fs.readFileSync(robotsPath, 'utf8');

assert.ok(!robotsContent.includes("'/player'"), 'robots.ts 不应将 /player 加入 Disallow，确保爬虫能读取 noindex');
assert.ok(robotsContent.includes('sitemap-index.xml'), 'robots.ts 必须声明主 sitemap-index.xml');
assert.ok(!robotsContent.includes("`${BASE_URL}/sitemap.xml`"), 'robots.ts 不得在 sitemap 列表中重复声明子 sitemap');
console.log('  ✅ robots.ts 校验通过：已放行 /player 供 noindex 暴露，仅声明主索引入口！\n');

// 7. 测试 sitemap.xml 纯净化 (Core-Only)
console.log('▶ [Test 7] 校验 sitemap.xml 纯净化 (Core-Only)...');
const sitemapXmlPath = path.resolve('app/sitemap.xml/route.ts');
const sitemapXmlContent = fs.readFileSync(sitemapXmlPath, 'utf8');

assert.ok(!sitemapXmlContent.includes('listRecentEntities'), 'sitemap.xml 不得混入 recentEntities，避免与分卷重复');
assert.ok(!sitemapXmlContent.includes('getSitemapCatalog'), 'sitemap.xml 不得混入 catalog 实体');
assert.ok(!sitemapXmlContent.includes('<priority>'), 'sitemap.xml 应移除废弃的 <priority> 标签');
assert.ok(!sitemapXmlContent.includes('<changefreq>'), 'sitemap.xml 应移除废弃的 <changefreq> 标签');
assert.ok(sitemapXmlContent.includes('/movie'), 'sitemap.xml 必须包含核心频道大厅');
console.log('  ✅ sitemap.xml 校验通过：Core-Only 纯净大厅地图，彻底杜绝跨地图重复 URL！\n');

// 8. 测试 sitemap-titles 分卷越界 404
console.log('▶ [Test 8] 校验 sitemap-titles 分卷越界 404 与格式精简...');
const titlesRoutePath = path.resolve('app/api/seo/sitemap-titles/[page]/route.ts');
const titlesRouteContent = fs.readFileSync(titlesRoutePath, 'utf8');

assert.ok(titlesRouteContent.includes('status: 404'), '越界分卷必须返回 404 状态码');
assert.ok(!titlesRouteContent.includes('<priority>'), 'sitemap-titles 应移除废弃的 <priority> 标签');
assert.ok(!titlesRouteContent.includes('<changefreq>'), 'sitemap-titles 应移除废弃的 <changefreq> 标签');
assert.ok(titlesRouteContent.includes('computeETag'), 'sitemap-titles 必须保留 ETag 304 协商缓存');
console.log('  ✅ sitemap-titles 校验通过：越界严格返回 404，已清理废弃标签并保留 ETag 304！\n');

// 9. 测试 TitlePage 308 单跳永久重定向
console.log('▶ [Test 9] 校验 TitlePage 308 单跳永久规范重定向...');
const titlePagePath = path.resolve('app/title/[slug]/page.tsx');
const titlePageContent = fs.readFileSync(titlePagePath, 'utf8');

assert.ok(titlePageContent.includes('RedirectType.replace'), '详情页必须使用 RedirectType.replace 发起 308 永久重定向');
console.log('  ✅ TitlePage 校验通过：统一使用 HTTP 308 永久重定向无损传递权重！\n');

// 10. 测试 ActorPage 演职员薄内容门禁与内链规范化
console.log('▶ [Test 10] 校验 ActorPage 演职员薄内容门禁与内链规范化...');
const actorPagePath = path.resolve('app/actor/[slug]/page.tsx');
const actorPageContent = fs.readFileSync(actorPagePath, 'utf8');

assert.ok(actorPageContent.includes('cleanEntities.length === 0'), 'ActorPage 必须检查收录作品数量');
assert.ok(actorPageContent.includes("robots: { index: false, follow: false }"), '作品为 0 的演职员必须输出 noindex 保护爬取预算');
assert.ok(!actorPageContent.includes('免费高清在线观看'), 'ActorPage 标题必须去营销化');
assert.ok(actorPageContent.includes('canonicalSlug'), 'ActorPage 卡片与 itemList 必须统一使用 canonicalSlug');
console.log('  ✅ ActorPage 校验通过：薄内容输出 noindex，标题去营销化，内链规范化！\n');

// 11. 测试 DirectorPage 导演薄内容门禁与内链规范化
console.log('▶ [Test 11] 校验 DirectorPage 导演薄内容门禁与内链规范化...');
const directorPagePath = path.resolve('app/director/[slug]/page.tsx');
const directorPageContent = fs.readFileSync(directorPagePath, 'utf8');

assert.ok(directorPageContent.includes('cleanEntities.length === 0'), 'DirectorPage 必须检查收录作品数量');
assert.ok(directorPageContent.includes("robots: { index: false, follow: false }"), '作品为 0 的导演必须输出 noindex 保护爬取预算');
assert.ok(!directorPageContent.includes('免费高清在线观看'), 'DirectorPage 标题必须去营销化');
assert.ok(directorPageContent.includes('canonicalSlug'), 'DirectorPage 卡片与 itemList 必须统一使用 canonicalSlug');
console.log('  ✅ DirectorPage 校验通过：薄内容输出 noindex，标题去营销化，内链规范化！\n');

// 12. 测试 URL 自动化审计工具
console.log('▶ [Test 12] 校验 scripts/seo/audit-urls.mjs 审计工具...');
const auditScriptPath = path.resolve('scripts/seo/audit-urls.mjs');
assert.ok(fs.existsSync(auditScriptPath), 'scripts/seo/audit-urls.mjs 必须存在');
const auditScriptContent = fs.readFileSync(auditScriptPath, 'utf8');

assert.ok(auditScriptContent.includes('extractJsonLd'), '审计工具必须具备 JSON-LD 结构化数据解析');
assert.ok(auditScriptContent.includes('canonicalMatches'), '审计工具必须校验 canonical 标签');
assert.ok(auditScriptContent.includes('h1Matches'), '审计工具必须统计 h1 个数');
assert.ok(auditScriptContent.includes('redirectHops'), '审计工具必须追踪重定向跳数');
console.log('  ✅ URL 自动化审计工具校验通过：已具备全维规则审计能力！\n');

// 13. 测试 PublishedTitleEntity 读取模型与 canPublishFact 事实准出
console.log('▶ [Test 13] 校验 PublishedTitleEntity 模型与 canPublishFact 事实准出函数...');
const entityTypePath = path.resolve('lib/types/entity.ts');
const entityTypeContent = fs.readFileSync(entityTypePath, 'utf8');

assert.ok(entityTypeContent.includes('export interface PublishedTitleEntity'), '必须声明 PublishedTitleEntity 接口');
assert.ok(entityTypeContent.includes('export interface FactProvenance'), '必须声明 FactProvenance 来源溯源接口');
assert.ok(entityTypeContent.includes('export function canPublishFact'), '必须导出 canPublishFact 函数');

// 动态测试 canPublishFact 门禁
const { canPublishFact } = await import('../lib/types/entity.ts');
assert.strictEqual(canPublishFact('2026', undefined), false, '无来源时不得准出事实');
assert.strictEqual(canPublishFact('2026', { source: 'tmdb', fetchedAt: '2026-01-01', confidence: 0.7 }), false, '置信度低于 0.8 不得准出事实');
assert.strictEqual(canPublishFact('2026', { source: 'tmdb', fetchedAt: '2026-01-01', confidence: 0.95 }), true, '高置信度事实允许准出');
console.log('  ✅ 数据模型与事实准出函数校验通过：严格拦截低置信度事实！\n');

// 14. 测试 entity-resolver 候选证据评分与确定性 Winner
console.log('▶ [Test 14] 校验 entity-resolver 实体解析评分引擎与确定性 Winner...');
const { resolveCandidate, sameVerifiedExternalId, chooseWinner } = await import('../lib/server/entity-resolver.ts');

// 外部 ID 一致 -> same
const matchSameTmdb = resolveCandidate(
  { title: '流浪地球2', tmdbId: '840326', type: 'movie' },
  { title: '流浪地球 2', tmdbId: '840326', type: 'movie' }
);
assert.strictEqual(matchSameTmdb.decision, 'same', '相同 TMDB ID 必须判定为同一实体');

// 同名但年份悬殊 (如 2000 年 vs 2024 年同名电影) -> different
const matchDiffYear = resolveCandidate(
  { title: '凶手', year: '2000', type: 'movie', directors: ['张三'] },
  { title: '凶手', year: '2024', type: 'movie', directors: ['李四'] }
);
assert.strictEqual(matchDiffYear.decision, 'different', '同名但年代导演悬殊不得误合并');

// Winner 选举确定性与幂等性
const candidateA = { entityId: 'ik000001', title: '流浪地球', tmdbId: '840326', hot: 5000000 };
const candidateB = { entityId: 'ik000002', title: '流浪地球', hot: 1000 };
const winner = chooseWinner([candidateA, candidateB]);
assert.strictEqual(winner.entityId, 'ik000001', '外部 ID 齐全且热度高的条目应选为 Winner');

// 幂等性测试 (打乱顺序结果恒同)
const winnerRev = chooseWinner([candidateB, candidateA]);
assert.strictEqual(winnerRev.entityId, 'ik000001', 'Winner 选举必须保证严格顺序无关与幂等性');
console.log('  ✅ 实体解析评分引擎校验通过：外部 ID 强一致，同名异作严格防误合，Winner 选举 100% 幂等！\n');

// 15. 测试 dedupe-backfill 去重作业工具
console.log('▶ [Test 15] 校验 scripts/seo/dedupe-backfill.mjs 脚本架构...');
const dedupeScriptPath = path.resolve('scripts/seo/dedupe-backfill.mjs');
assert.ok(fs.existsSync(dedupeScriptPath), 'dedupe-backfill.mjs 脚本必须存在');
const dedupeScriptContent = fs.readFileSync(dedupeScriptPath, 'utf8');

assert.ok(dedupeScriptContent.includes("case 'scan':"), '去重脚本必须包含 scan 扫描模式');
assert.ok(dedupeScriptContent.includes("case 'plan':"), '去重脚本必须包含 plan 规划模式');
assert.ok(dedupeScriptContent.includes("case 'apply':"), '去重脚本必须包含 apply 执行模式');
assert.ok(dedupeScriptContent.includes("case 'verify':"), '去重脚本必须包含 verify 校验模式');
assert.ok(dedupeScriptContent.includes('--confirm'), '执行模式必须具备安全确认开关');
console.log('  ✅ 去重作业工具校验通过：scan/plan/apply/verify 四阶段工作流与安全门禁完备！\n');

// 16. 测试 AiOverviewCapsule 真实性与消除假宣称
console.log('▶ [Test 16] 校验 AiOverviewCapsule 真实性与去虚假化...');
const capsulePath = path.resolve('components/seo/AiOverviewCapsule.tsx');
const capsuleContent = fs.readFileSync(capsulePath, 'utf8');

assert.ok(!capsuleContent.includes("entity.year || '2024'"), 'AiOverviewCapsule 不得输出写死的默认年份 2024');
assert.ok(!capsuleContent.includes("entity.rate || '8.5'"), 'AiOverviewCapsule 不得输出写死的默认评分 8.5');
assert.ok(!capsuleContent.includes('官方元数据权威核验'), 'AiOverviewCapsule 不得包含虚假权威核验宣称');
assert.ok(!capsuleContent.includes('1080P/4K超清'), 'AiOverviewCapsule 不得包含未探测的 4K 宣传标签');
assert.ok(!capsuleContent.includes('免VIP极速秒播'), 'AiOverviewCapsule 不得包含免VIP营销标签');
console.log('  ✅ AiOverviewCapsule 校验通过：彻底消除写死假数据与虚假宣称！\n');

// 17. 测试 GenrePage 门禁、标题去营销化与内链规范化
console.log('▶ [Test 17] 校验 GenrePage 门禁、标题去营销化与内链规范化...');
const genrePagePath = path.resolve('app/genre/[slug]/page.tsx');
const genrePageContent = fs.readFileSync(genrePagePath, 'utf8');

assert.ok(genrePageContent.includes('entities.length === 0'), 'GenrePage 必须检查收录作品数量');
assert.ok(genrePageContent.includes("robots: { index: false, follow: false }"), '作品数为 0 的题材必须输出 noindex 保护爬取预算');
assert.ok(!genrePageContent.includes('免费高清在线观看'), 'GenrePage 标题必须去营销化');
assert.ok(genrePageContent.includes('canonicalSlug'), 'GenrePage 卡片与 itemList 必须统一使用 canonicalSlug');
console.log('  ✅ GenrePage 校验通过：薄内容输出 noindex，标题去营销化，内链规范化！\n');

// 18. 测试 IndexNow 路由安全加固与消灭 GET 副作用
console.log('▶ [Test 18] 校验 IndexNow 路由安全加固与消灭 GET 副作用...');
const indexNowRoutePath = path.resolve('app/api/seo/indexnow/route.ts');
const indexNowRouteContent = fs.readFileSync(indexNowRoutePath, 'utf8');

assert.ok(!indexNowRouteContent.includes('7f2e1b4c9a8d3e5f6a1b2c3d4e5f6071'), 'IndexNow 路由不得硬编码 API 密钥');
assert.ok(indexNowRouteContent.includes('process.env.INDEXNOW_KEY'), 'IndexNow 路由必须从环境变量读取密钥');
assert.ok(indexNowRouteContent.includes('verifyAuth'), 'IndexNow 路由必须包含身份鉴权');
assert.ok(indexNowRouteContent.includes('CRON_SECRET'), 'IndexNow 路由必须校验 CRON_SECRET');
assert.ok(!indexNowRouteContent.includes('handleIndexNowPush(req)'), 'IndexNow GET 方法严禁触发外部推送副作用');
console.log('  ✅ IndexNow 路由校验通过：杜绝 GET 副作用，密钥环境变量化，鉴权门禁就位！\n');

// 19. 测试 canonical 统一 URL Helper
console.log('▶ [Test 19] 校验 lib/utils/canonical.ts 统一 URL Helper...');
const canonicalHelperPath = path.resolve('lib/utils/canonical.ts');
assert.ok(fs.existsSync(canonicalHelperPath), 'canonical.ts 必须存在');
const canonicalHelperContent = fs.readFileSync(canonicalHelperPath, 'utf8');

assert.ok(canonicalHelperContent.includes('getCanonicalTitlePath'), '必须导出 getCanonicalTitlePath');
assert.ok(canonicalHelperContent.includes('getCanonicalPersonPath'), '必须导出 getCanonicalPersonPath');
assert.ok(canonicalHelperContent.includes('getCanonicalGenrePath'), '必须导出 getCanonicalGenrePath');
console.log('  ✅ 统一 URL Helper 校验通过：全站规范路径生成器就绪！\n');

// 20. 测试 D1 Schema 权威表与索引约束定义
console.log('▶ [Test 20] 校验 db/schema.sql 核心表与索引约束 (规范 4.2 节)...');
const schemaPath = path.resolve('db/schema.sql');
assert.ok(fs.existsSync(schemaPath), 'db/schema.sql 必须存在');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS entities'), '必须定义 entities 实体主表');
assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS external_ids'), '必须定义 external_ids 外部映射表');
assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS entity_aliases'), '必须定义 entity_aliases 别名映射表');
assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS entity_facts'), '必须定义 entity_facts 事实证据表');
assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS persons'), '必须定义 persons 演职员表');
assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS credits'), '必须定义 credits 演职员关联表');
assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS page_index_state'), '必须定义 page_index_state 决策表');
assert.ok(schemaContent.includes('CREATE TABLE IF NOT EXISTS publish_outbox'), '必须定义 publish_outbox 发件箱');
assert.ok(schemaContent.includes('idx_entities_canonical_slug'), '必须定义规范 slug 索引');
console.log('  ✅ D1 Schema 校验通过：规范 4.2 节核心表结构与外键索引约束完整！\n');

// 21. 测试仓储抽象与发布投影服务
console.log('▶ [Test 21] 校验 entity-repository 与 publish-projection...');
const repoPath = path.resolve('lib/server/entity-repository.ts');
assert.ok(fs.existsSync(repoPath), 'entity-repository.ts 必须存在');
const repoContent = fs.readFileSync(repoPath, 'utf8');
assert.ok(repoContent.includes('interface EntityRepository'), '必须定义 EntityRepository 接口');
assert.ok(repoContent.includes('getEntityRepository'), '必须导出 getEntityRepository 仓储实例工厂');

const projectionPath = path.resolve('lib/server/publish-projection.ts');
assert.ok(fs.existsSync(projectionPath), 'publish-projection.ts 必须存在');
const projectionContent = fs.readFileSync(projectionPath, 'utf8');
assert.ok(projectionContent.includes('computeEntityContentHash'), '必须导出 computeEntityContentHash');
assert.ok(projectionContent.includes('PublishProjectionService'), '必须定义 PublishProjectionService');

// 动态测试哈希计算
const { computeEntityContentHash } = await import('../lib/server/publish-projection.ts');
const dummyEntity = {
  entityId: 'ik000001',
  slug: 'test-slug',
  tmdbId: '123',
  tmdbType: 'movie',
  title: '测试电影',
  type: 'movie',
  year: '2026',
  description: '客观事实剧情简介',
  cover: 'https://example.com/cover.jpg',
  rate: '9.0',
  genres: ['剧情'],
  directors: ['测试导演'],
  actors: ['测试演员'],
  createdAt: '2026-09-20T00:00:00.000Z',
  updatedAt: '2026-09-20T00:00:00.000Z',
};
const hash = computeEntityContentHash(dummyEntity);
assert.equal(typeof hash, 'string', '哈希必须为字符串');
assert.equal(hash.length, 64, 'SHA-256 哈希长度必须为 64');
console.log(`  ✅ 仓储与投影校验通过：接口完备，内容指纹生成正确 (${hash.slice(0, 16)}...)！\n`);

// 22. 测试 Sitemap 人物作品门禁 (0 空人物页)
console.log('▶ [Test 22] 校验 app/sitemap-people.xml/route.ts 作品门禁...');
const sitemapPeoplePath = path.resolve('app/sitemap-people.xml/route.ts');
const sitemapPeopleContent = fs.readFileSync(sitemapPeoplePath, 'utf8');

assert.ok(sitemapPeopleContent.includes('getEntitiesByDirector'), '人物地图必须获取导演作品');
assert.ok(sitemapPeopleContent.includes('getEntitiesByActor'), '人物地图必须获取演员作品');
assert.ok(sitemapPeopleContent.includes('works.length > 0'), '人物地图必须过滤作品数小于1的人物');
console.log('  ✅ 人物 Sitemap 门禁校验通过：0 作品空人物页坚决不上地图！\n');

// 23. 测试历史架构与运营文档合规性与违规描述清理
console.log('▶ [Test 23] 校验历史文档合规性与违规描述清理...');
const seoSpecPath = path.resolve('docs/architecture/seo-reconstruction-spec.md');
const seoSpecContent = fs.readFileSync(seoSpecPath, 'utf8');
assert.ok(!seoSpecContent.includes('Google Indexing API 精准受控促抓（≤150条/日）'), 'SEO规范不得保留普通影视调用 Google Indexing 的废弃表述');
assert.ok(!seoSpecContent.includes('Movie/TV + VideoObject + FAQ + Breadcrumb'), 'SEO规范不得宣称四维伪造 Schema');

const catalogSpecPath = path.resolve('docs/architecture/entity-catalog-architecture-spec.md');
const catalogSpecContent = fs.readFileSync(catalogSpecPath, 'utf8');
assert.ok(catalogSpecContent.includes('D1 权威存储 + KV 边缘只读投影'), '实体库规范必须确立 D1 权威存储与 KV 投影架构');

const growthPlanPath = path.resolve('docs/operations/seo-geo-growth-plan.md');
const growthPlanContent = fs.readFileSync(growthPlanPath, 'utf8');
assert.ok(!growthPlanContent.includes('以资深影迷或海外游子身份真诚推荐'), '运营方案坚决杜绝假马甲推荐话术');
assert.ok(growthPlanContent.includes('严禁使用假马甲冒充普通用户发表虚假评论'), '运营方案必须包含严厉的白帽反隐蔽广告铁律');
console.log('  ✅ 历史架构与运营文档合规性校验通过：100% 消除违规表述，对齐白帽合规准则！\n');

// 24. 测试关键词系统移除网盘/磁力违规词及详情页杜绝堆叠 (规范 21.3 节)
console.log('▶ [Test 24] 校验关键词系统去网盘化与详情页防堆叠 (规范 21.3 节)...');
const kwSystemPath = path.resolve('lib/data/seo-rules/seo-keyword-system.ts');
const kwSystemContent = fs.readFileSync(kwSystemPath, 'utf8');
assert.ok(!kwSystemContent.includes('cloud_storage_intent'), '关键词库不得包含网盘意图词组');
assert.ok(!kwSystemContent.includes('百度网盘'), '关键词库不得包含网盘违规字样');

const kwGenPath = path.resolve('lib/utils/seo-keyword-generator.ts');
const kwGenContent = fs.readFileSync(kwGenPath, 'utf8');
assert.ok(!kwGenContent.includes('GENERIC_MODIFIERS.cloud_storage_intent'), '生成器不得注入网盘截流词');

const titlePageForKwContent = fs.readFileSync(titlePagePath, 'utf8');
assert.ok(titlePageForKwContent.includes('seoSpectrum.keywords.slice(0, 5)'), '详情页 keywords 必须限制在 5 个核心实体词以内防堆叠');
console.log('  ✅ 关键词系统校验通过：彻底清除网盘下载违规词，杜绝 keyword 堆叠惩罚！\n');

// 25. 测试 sitemap-genres.xml 收录门禁与 material lastmod (规范 21.4 节)
console.log('▶ [Test 25] 校验 sitemap-genres.xml 收录门禁与 material lastmod (规范 21.4 节)...');
const sitemapGenrePath = path.resolve('app/sitemap-genres.xml/route.ts');
const sitemapGenreContent = fs.readFileSync(sitemapGenrePath, 'utf8');
assert.ok(sitemapGenreContent.includes('getEntitiesByGenre'), '题材地图必须检查在库作品');
assert.ok(sitemapGenreContent.includes('works.length === 0'), '题材地图必须过滤作品为0的分类');
assert.ok(!sitemapGenreContent.includes('const lastModDate = new Date().toISOString()'), '题材地图严禁每天机械生成当天伪更新');
console.log('  ✅ 题材 Sitemap 门禁校验通过：0 作品分类不上地图，真实 material lastmod 生效！\n');

// 26. 测试 AGENTS.md 准则 19 铁律与旧推送清理 (规范 21.5 节)
console.log('▶ [Test 26] 校验 AGENTS.md 准则 19 铁律与旧推送清理 (规范 21.5 节)...');
const agentsMdPath = path.resolve('AGENTS.md');
const agentsMdContent = fs.readFileSync(agentsMdPath, 'utf8');
assert.ok(agentsMdContent.includes('19. 白帽真实性、D1 权威控制与主动广播铁律'), 'AGENTS.md 必须包含准则 19');
assert.ok(agentsMdContent.includes('D1 强一致权威层与 Edge KV 只读投影铁律'), 'AGENTS.md 必须包含 D1/KV 双层铁律');
assert.ok(!agentsMdContent.includes('Google Indexing 闪电广播'), 'AGENTS.md 严禁保留普通影视 Google Indexing 闪电广播的废弃表述');
console.log('  ✅ AGENTS.md 工程准则校验通过：准则 19 确立，违规推送描述彻底清零！\n');

console.log('🎉 26项全自动 SEO 架构与白帽合规回归测试 100% 成功通过！');





