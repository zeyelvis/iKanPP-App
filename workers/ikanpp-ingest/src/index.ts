/**
 * iKanPP 入库 Worker（重构阶段 2）：用 Cloudflare 定时器按时更新 D1 ikanpp-db。
 * - 每小时第 23 分：各频道轮播与热播标签（jobs/hero.ts），然后是最新上线（jobs/latest.ts）。
 * 手动触发：POST /run?job=hero（或 latest），带 Authorization: Bearer <INGEST_SECRET>。
 * 每次运行的结果写进 sync_state（key = job:<名字>）。
 */
import type { Env } from './env';
import { syncHero } from './jobs/hero';
import { syncLatest } from './jobs/latest';

const JOBS: Record<string, (env: Env) => Promise<string[]>> = { hero: syncHero, latest: syncLatest };
/** 同一个定时器下的任务按顺序执行。 */
const SCHEDULE: Record<string, string[]> = { '23 * * * *': ['hero', 'latest'] };

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
    const jobs = SCHEDULE[event.cron] ?? [];
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
