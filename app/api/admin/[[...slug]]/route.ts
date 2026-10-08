import { NextRequest, NextResponse } from 'next/server';
import { verifyCloudflareAccess } from '@/lib/admin/verify-access';
import { recordAuditLog, getRecentAuditLogs } from '@/lib/admin/audit';
import { getTitleDemandLeaderboard } from '@/lib/services/entity-kv';
import { normalizeTitle } from '@/lib/data/entities/entity-utils';
import type { TitleEntity } from '@/lib/types/entity';
import { getDb } from '@/lib/data/d1/db';
import { toEntities } from '@/lib/data/d1/related';
import type { D1Like, TitleRow } from '@/lib/data/d1/title-route';
import {
  getShadowLineConfig,
  getShadowLineHealth,
  getShadowLineLogs,
  runShadowLineProbe,
  toggleShadowLineFuse,
  runShadowLineAutoSniff,
} from '@/lib/services/shadowline-service';

/**
 * 后台接口（/admin，Cloudflare Access 保护；这里再用 Access 令牌校验一次）。
 * 2026-10-08 重构阶段 4 精简：作品管理改读写 D1；保留求片记录、各国打开速度、审计日志、专线控制、IndexNow。
 * 去掉：推送 Google（Indexing API 不适用于影视页）、AI 长文、SEO / 部署触发（GitHub 流水线已停）、
 * 编造的「搜索词分析」（拿展示量乘系数冒充点击）。
 */

const HOST = 'www.ikanpp.com';
const INDEXNOW_KEY = process.env.INDEXNOW_KEY || '7f2e1b4c9a8d3e5f6a1b2c3d4e5f6071';
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '172a13185bd6e694bfefc089b12cad6a';
const KINDS = ['movie', 'tv', 'anime', 'variety', 'documentary'];

interface RouteContext {
  params: Promise<{ slug?: string[] }>;
}

const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
const code = (id: number) => `ik${String(id).padStart(6, '0')}`;
const parseId = (raw?: string) => {
  const m = String(raw ?? '').match(/^(?:ik)?(\d{1,6})$/i);
  return m ? Number(m[1]) : null;
};
function db(): D1Like {
  const d = getDb();
  if (!d) throw new Error('D1 不可用');
  return d;
}

const WITH_CANONICAL = `t.*, (SELECT slug FROM slugs WHERE title_id = t.id AND canonical = 1) AS canonical_slug`;

async function entityById(id: number): Promise<(TitleEntity & { state: string; mergedInto: number | null }) | null> {
  const row = await db().prepare(`SELECT ${WITH_CANONICAL} FROM titles t WHERE t.id = ?`).bind(id).first<TitleRow>();
  if (!row) return null;
  const [entity] = await toEntities(db(), [row]);
  return { ...entity, state: row.state, mergedInto: row.merged_into };
}

// ==========================================
// GET
// ==========================================
export async function GET(request: NextRequest, { params }: RouteContext) {
  const auth = await verifyCloudflareAccess(request);
  if (!auth.authenticated) return json({ success: false, error: auth.error || '未授权访问' }, auth.status);
  const { slug = [] } = await params;
  const path = slug.join('/');
  const { searchParams } = new URL(request.url);

  try {
    // 后台外框用来显示当前登录邮箱
    if (path === 'whoami') return json({ success: true, email: auth.email ?? '' });

    // 仪表盘：片库数量、入库任务状态、站点地图、数据集更新时间
    if (path === 'dashboard') {
      const d = db();
      const [states, kinds, recent, jobs, sitemap, docs] = await Promise.all([
        d.prepare('SELECT state, COUNT(*) AS n FROM titles GROUP BY state').bind().all<{ state: string; n: number }>(),
        d.prepare("SELECT kind, COUNT(*) AS n FROM titles WHERE state = 'live' GROUP BY kind").bind().all<{ kind: string | null; n: number }>(),
        d
          .prepare(
            "SELECT SUM(created_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-1 day')) AS day, SUM(created_at >= strftime('%Y-%m-%dT%H:%M:%fZ', 'now', '-7 day')) AS week FROM titles WHERE source LIKE 'ingest%'",
          )
          .bind()
          .first<{ day: number | null; week: number | null }>(),
        d.prepare("SELECT key, value, updated_at FROM sync_state WHERE key LIKE 'job:%' ORDER BY key").bind().all<{ key: string; value: string; updated_at: string }>(),
        d.prepare('SELECT COUNT(*) AS n FROM sitemap_titles').bind().first<{ n: number }>(),
        d
          .prepare("SELECT substr(key, 1, instr(key, ':') - 1) AS kind, COUNT(*) AS n, MAX(updated_at) AS updated FROM documents GROUP BY 1")
          .bind()
          .all<{ kind: string; n: number; updated: string }>(),
      ]);
      return json({
        success: true,
        titles: Object.fromEntries(states.results.map((r) => [r.state, r.n])),
        liveByKind: Object.fromEntries(kinds.results.map((r) => [r.kind ?? 'unknown', r.n])),
        createdByIngest: { lastDay: recent?.day ?? 0, lastWeek: recent?.week ?? 0 },
        jobs: jobs.results.map((j) => {
          let parsed: { ok?: boolean; finished?: string; report?: string[] } = {};
          try {
            parsed = JSON.parse(j.value);
          } catch {}
          return { job: j.key.slice('job:'.length), ok: parsed.ok ?? null, finished: parsed.finished ?? j.updated_at, report: parsed.report ?? [] };
        }),
        sitemapTitles: sitemap?.n ?? 0,
        documents: docs.results,
      });
    }

    // 单部作品
    if (slug[0] === 'entities' && slug[1]) {
      const id = parseId(slug[1]);
      const entity = id ? await entityById(id) : null;
      if (!entity) return json({ success: false, error: '作品不存在' }, 404);
      return json({ success: true, entity });
    }

    // 作品列表：按编号或片名前缀搜索，按频道筛选
    if (path === 'entities') {
      const page = Math.max(1, Number(searchParams.get('page')) || 1);
      const limit = Math.min(60, Math.max(1, Number(searchParams.get('limit')) || 24));
      const channel = searchParams.get('channel') || '';
      const search = (searchParams.get('search') || '').trim();
      const sort = searchParams.get('sort') || 'latest';
      const where = ["t.state = 'live'"];
      const args: unknown[] = [];
      if (KINDS.includes(channel)) {
        where.push('t.kind = ?');
        args.push(channel);
      }
      if (/^(ik)?\d{1,6}$/i.test(search)) {
        where.push('t.id = ?');
        args.push(parseId(search));
      } else if (search) {
        const key = normalizeTitle(search);
        where.push('t.name_key >= ? AND t.name_key < ?');
        args.push(key, `${key}￿`);
      }
      const order = sort === 'popularity' ? 't.popularity DESC, t.id DESC' : sort === 'rating' ? 't.rating DESC, t.id DESC' : 't.created_at DESC, t.id DESC';
      const d = db();
      const total = (await d.prepare(`SELECT COUNT(*) AS n FROM titles t WHERE ${where.join(' AND ')}`).bind(...args).first<{ n: number }>())?.n ?? 0;
      const rows = await d
        .prepare(`SELECT ${WITH_CANONICAL} FROM titles t WHERE ${where.join(' AND ')} ORDER BY ${order} LIMIT ? OFFSET ?`)
        .bind(...args, limit, (page - 1) * limit)
        .all<TitleRow>();
      return json({ success: true, items: await toEntities(d, rows.results), total, page, pageCount: Math.max(1, Math.ceil(total / limit)) });
    }

    // 求片记录（KV）
    if (slug[0] === 'demands') {
      return json({ success: true, data: await getTitleDemandLeaderboard(100) });
    }

    // 各国打开速度（Analytics Engine 数据集 ikanpp_pagespeed）。需要密钥 AE_API_TOKEN（Account Analytics 读取权限）。
    if (path === 'analytics/speed') {
      const days = Math.min(30, Math.max(1, Number(searchParams.get('days')) || 7));
      const token = process.env.AE_API_TOKEN || '';
      if (!token) return json({ success: true, rows: [], total: 0, note: '未配置 AE_API_TOKEN，无法查询 Analytics Engine' });
      const sql = `
        SELECT blob1 AS country, count() AS sample_count,
          round(quantileExactWeighted(0.5)(double1, _sample_interval)) AS ttfb_p50,
          round(quantileExactWeighted(0.75)(double1, _sample_interval)) AS ttfb_p75,
          round(quantileExactWeighted(0.5)(double2, _sample_interval)) AS lcp_p50,
          round(quantileExactWeighted(0.75)(double2, _sample_interval)) AS lcp_p75
        FROM ikanpp_pagespeed WHERE timestamp >= NOW() - INTERVAL '${days}' DAY
        GROUP BY country ORDER BY sample_count DESC`;
      const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/analytics_engine/sql`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'text/plain' },
        body: sql,
      });
      if (!res.ok) return json({ success: false, error: `Analytics Engine HTTP ${res.status}` }, 502);
      const data = (await res.json()) as { data?: Array<Record<string, unknown>> };
      const rows = (data.data ?? []).map((r) => ({
        country: String(r.country || 'XX').toUpperCase(),
        sampleCount: Number(r.sample_count || 0),
        ttfbP50: Number(r.ttfb_p50 || 0),
        ttfbP75: Number(r.ttfb_p75 || 0),
        lcpP50: Number(r.lcp_p50 || 0),
        lcpP75: Number(r.lcp_p75 || 0),
      }));
      return json({ success: true, rows, total: rows.length });
    }

    if (path === 'audit-log') {
      const limit = Math.min(100, Number(searchParams.get('limit')) || 50);
      const logs = await getRecentAuditLogs(limit);
      return json({ success: true, logs, total: logs.length });
    }

    if (path === 'shadowline/status') {
      const [config, health, logs] = await Promise.all([getShadowLineConfig(), getShadowLineHealth(), getShadowLineLogs(30)]);
      return json({
        success: true,
        config: {
          ...config,
          keyMasked: config.key ? config.key.slice(0, 4) + '****' + config.key.slice(-4) : '',
          ivMasked: config.iv ? config.iv.slice(0, 4) + '****' + config.iv.slice(-4) : '',
        },
        health,
        logs,
      });
    }

    return json({ success: false, error: `未找到后台接口: ${path}` }, 404);
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : '后台接口异常' }, 500);
  }
}

// ==========================================
// POST
// ==========================================
export async function POST(request: NextRequest, { params }: RouteContext) {
  const auth = await verifyCloudflareAccess(request);
  if (!auth.authenticated) return json({ success: false, error: auth.error || '未授权' }, auth.status);
  const actor = auth.email || 'Admin';
  const { slug = [] } = await params;
  const path = slug.join('/');

  try {
    // IndexNow（Bing、Yandex 等）：只接受本站网址
    if (path === 'indexing/indexnow') {
      const body = (await request.json().catch(() => ({}))) as { urls?: string[]; url?: string };
      const urls = (Array.isArray(body.urls) ? body.urls : body.url ? [body.url] : []).filter(
        (u) => typeof u === 'string' && u.startsWith(`https://${HOST}/`),
      );
      if (!urls.length) return json({ success: false, error: `请提供 https://${HOST}/ 下的网址` }, 400);
      const res = await fetch('https://api.indexnow.org/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify({ host: HOST, key: INDEXNOW_KEY, keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`, urlList: urls.slice(0, 10000) }),
      });
      await recordAuditLog({ actor, action: 'IndexNow 提交', target: `${urls.length} 条网址`, details: { httpStatus: res.status, sampleUrl: urls[0] } });
      return res.ok
        ? json({ success: true, broadcastCount: urls.length, status: res.status })
        : json({ success: false, status: res.status, error: `IndexNow 返回 ${res.status}: ${await res.text()}` });
    }

    if (path === 'shadowline/probe') {
      const result = await runShadowLineProbe();
      return json({ success: result.success, health: result.health });
    }
    if (path === 'shadowline/toggle') {
      const body = (await request.json().catch(() => ({}))) as { enabled?: boolean };
      const config = await toggleShadowLineFuse(Boolean(body.enabled), actor);
      return json({ success: true, config, enabled: config.enabled });
    }
    if (path === 'shadowline/sniff') {
      return json(await runShadowLineAutoSniff(actor));
    }

    return json({ success: false, error: `未找到后台接口: ${path}` }, 404);
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : '后台接口异常' }, 500);
  }
}

// ==========================================
// PUT：修改作品资料（D1）。编号与规范网址不改（改网址会断掉已收录的页面）。
// ==========================================
const EDITABLE: Record<string, { column: string; kind: 'text' | 'number' | 'list' }> = {
  title: { column: 'name', kind: 'text' },
  originalTitle: { column: 'original_name', kind: 'text' },
  type: { column: 'kind', kind: 'text' },
  year: { column: 'year', kind: 'number' },
  description: { column: 'overview', kind: 'text' },
  cover: { column: 'poster', kind: 'text' },
  backdrop: { column: 'backdrop', kind: 'text' },
  genres: { column: 'genres', kind: 'list' },
  directors: { column: 'directors', kind: 'list' },
  actors: { column: 'actors', kind: 'list' },
  region: { column: 'region', kind: 'text' },
  language: { column: 'language', kind: 'text' },
  status: { column: 'status_label', kind: 'text' },
  rate: { column: 'rating', kind: 'number' },
  runtime: { column: 'runtime', kind: 'number' },
  numberOfSeasons: { column: 'seasons', kind: 'number' },
  numberOfEpisodes: { column: 'episodes', kind: 'number' },
};

const toList = (v: unknown) =>
  (Array.isArray(v) ? v : String(v ?? '').split(/[,，、]/)).map((x) => String(x).trim()).filter(Boolean);

/** 改了导演或主演时，同步演职关系（影人页从 credits 取作品）。 */
async function replaceCredits(d: D1Like, id: number, role: 'director' | 'actor', names: string[]) {
  await d.prepare('DELETE FROM credits WHERE title_id = ? AND role = ?').bind(id, role).all();
  for (const [ord, name] of names.entries()) {
    await d.prepare('INSERT INTO people (id, name) SELECT COALESCE(MAX(id), 0) + 1, ? FROM people WHERE NOT EXISTS (SELECT 1 FROM people WHERE name = ?)').bind(name, name).all();
    await d.prepare('INSERT OR IGNORE INTO credits (title_id, person_id, role, ord) SELECT ?, id, ?, ? FROM people WHERE name = ?').bind(id, role, ord, name).all();
  }
}

export async function PUT(request: NextRequest, { params }: RouteContext) {
  const auth = await verifyCloudflareAccess(request);
  if (!auth.authenticated) return json({ success: false, error: auth.error || '未授权' }, auth.status);
  const { slug = [] } = await params;
  const id = slug[0] === 'entities' ? parseId(slug[1]) : null;
  if (!id) return json({ success: false, error: '未找到后台接口' }, 404);

  try {
    const before = await entityById(id);
    if (!before) return json({ success: false, error: '作品不存在' }, 404);
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const sets: string[] = [];
    const args: unknown[] = [];
    const lists: Record<string, string[]> = {};
    for (const [field, { column, kind }] of Object.entries(EDITABLE)) {
      if (!(field in body)) continue;
      const v = body[field];
      sets.push(`${column} = ?`);
      if (kind === 'list') {
        lists[field] = toList(v);
        args.push(JSON.stringify(lists[field]));
      } else if (kind === 'number') {
        const n = v === '' || v == null ? null : Number(v);
        args.push(n != null && Number.isFinite(n) ? n : null);
      } else {
        args.push(v == null || v === '' ? null : String(v));
      }
    }
    if (typeof body.title === 'string' && body.title.trim()) {
      sets.push('name_key = ?');
      args.push(normalizeTitle(body.title) || null);
    }
    if (!sets.length) return json({ success: false, error: '没有可修改的字段' }, 400);
    sets.push("updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')");

    const d = db();
    await d.prepare(`UPDATE titles SET ${sets.join(', ')} WHERE id = ?`).bind(...args, id).all();
    if (lists.genres) {
      const row = await d.prepare('SELECT kind, popularity FROM titles WHERE id = ?').bind(id).first<{ kind: string | null; popularity: number | null }>();
      await d.prepare('DELETE FROM title_genres WHERE title_id = ?').bind(id).all();
      for (const g of lists.genres) {
        await d.prepare('INSERT OR IGNORE INTO title_genres (genre, title_id, kind, popularity) VALUES (?, ?, ?, ?)').bind(g, id, row?.kind ?? null, row?.popularity ?? 0).all();
      }
    }
    if (lists.directors) await replaceCredits(d, id, 'director', lists.directors);
    if (lists.actors) await replaceCredits(d, id, 'actor', lists.actors);

    await recordAuditLog({
      actor: auth.email || 'Admin',
      action: '修改作品',
      target: `${code(id)} ${before.title}`,
      details: { fields: Object.keys(body).filter((k) => k in EDITABLE) },
    });
    return json({ success: true, entity: await entityById(id) });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : '修改失败' }, 500);
  }
}

// ==========================================
// DELETE：下架作品（state = removed）。编号保留、永不复用；旧网址按片名找同名作品，找不到就 404。
// ==========================================
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const auth = await verifyCloudflareAccess(request);
  if (!auth.authenticated) return json({ success: false, error: auth.error || '未授权' }, auth.status);
  const { slug = [] } = await params;
  const id = slug[0] === 'entities' ? parseId(slug[1]) : null;
  if (!id) return json({ success: false, error: '未找到后台接口' }, 404);
  try {
    const before = await entityById(id);
    if (!before) return json({ success: false, error: '作品不存在' }, 404);
    const d = db();
    await d.prepare("UPDATE titles SET state = 'removed', updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now') WHERE id = ? AND state = 'live'").bind(id).all();
    await d.prepare('DELETE FROM sitemap_titles WHERE title_id = ?').bind(id).all();
    await recordAuditLog({ actor: auth.email || 'Admin', action: '下架作品', target: `${code(id)} ${before.title}` });
    return json({ success: true });
  } catch (error) {
    return json({ success: false, error: error instanceof Error ? error.message : '下架失败' }, 500);
  }
}
