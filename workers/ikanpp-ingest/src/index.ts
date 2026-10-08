/**
 * iKanPP 入库 Worker（重构阶段 2）：用 Cloudflare 定时器按时更新 D1 ikanpp-db。
 * - 每小时第 23 分：各频道轮播与热播标签（jobs/hero.ts），然后是最新上线（jobs/latest.ts）。
 * - 每小时第 43 分：爱壹帆两个时间排序（jobs/rankings.ts）；北京时间 4 点那次连人气、评分排序一起取。
 * 手动触发：POST /run?job=<名字>（hero、latest、rankings、rankings-daily），带 Authorization: Bearer <INGEST_SECRET>。
 * 每次运行的结果写进 sync_state（key = job:<名字>）。
 */
import type { Env } from './env';
import { syncHero } from './jobs/hero';
import { syncLatest } from './jobs/latest';
import { syncRankings } from './jobs/rankings';

const JOBS: Record<string, (env: Env) => Promise<string[]>> = {
  hero: syncHero,
  latest: syncLatest,
  rankings: (env) => syncRankings(env),
  'rankings-daily': (env) => syncRankings(env, { daily: true }),
};
/** 同一个定时器下的任务按顺序执行。 */
function scheduled(cron: string, at: Date): string[] {
  if (cron === '23 * * * *') return ['hero', 'latest'];
  if (cron === '43 * * * *') return [at.getUTCHours() === 20 ? 'rankings-daily' : 'rankings'];
  return [];
}

async function run(env: Env, job: string) {
  const started = new Date().toISOString();
  let ok = true;
  let report: string[];
  try {
    report = await JOBS[job](env);
  } catch (err) {
    ok = false;
    report = [String(err instanceof Error ? err.message : err)];
  }
  const value = JSON.stringify({ ok, started, finished: new Date().toISOString(), report });
  await env.DB.prepare("INSERT INTO sync_state (key, value) VALUES (?, ?) ON CONFLICT (key) DO UPDATE SET value = excluded.value, updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')")
    .bind(`job:${job}`, value)
    .run();
  return { ok, report };
}

export default {
  async scheduled(event: ScheduledController, env: Env, ctx: ExecutionContext) {
    const jobs = scheduled(event.cron, new Date(event.scheduledTime));
    ctx.waitUntil((async () => { for (const job of jobs) await run(env, job); })());
  },
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url);
    if (request.method !== 'POST' || url.pathname !== '/run') return new Response('Not found', { status: 404 });
    if (!env.INGEST_SECRET || request.headers.get('authorization') !== `Bearer ${env.INGEST_SECRET}`) return new Response('Unauthorized', { status: 401 });
    const job = url.searchParams.get('job') ?? '';
    if (!JOBS[job]) return new Response('Unknown job', { status: 400 });
    return Response.json(await run(env, job));
  },
};
