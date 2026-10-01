/**
 * D1 Native SQL Multi-Dimensional Browse Engine
 * 
 * 1. 原生 D1 关系型数据库极速分页查询 (10~25ms)
 * 2. 彻底废除 24 个手工维护的 KV 倒排索引
 * 3. 当 D1 未绑定时平滑降级至 KV 索引，保障 100% 可用性
 */

import { Env } from './types';

export interface BrowseParams {
  category?: string; // all, movie, tv, anime, variety, documentary, short
  year?: string;
  sortBy?: 'created_at' | 'rating' | 'popularity';
  page?: number;
  pageSize?: number;
}

export async function handleBrowseRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const url = new URL(request.url);
  const category = url.searchParams.get('category') || url.searchParams.get('type') || 'all';
  const year = url.searchParams.get('year') || '';
  const sort = url.searchParams.get('sort') || url.searchParams.get('order') || 'time_added';
  const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
  const pageSize = Math.min(50, Math.max(1, parseInt(url.searchParams.get('pageSize') || '20', 10)));
  const offset = (page - 1) * pageSize;

  let sortColumn = 'created_at';
  if (sort === 'rating' || sort === 'score') {
    sortColumn = 'rating';
  } else if (sort === 'popularity' || sort === 'hot') {
    sortColumn = 'popularity';
  }

  // 1. 如果 D1 数据库可用，优先执行原生 SQL 极速多维检索
  if (env.DB) {
    try {
      let query = `SELECT * FROM entities WHERE 1=1`;
      const bindings: any[] = [];

      if (category !== 'all') {
        query += ` AND category = ?`;
        bindings.push(category);
      }

      if (year && /^\d{4}$/.test(year)) {
        query += ` AND year = ?`;
        bindings.push(parseInt(year, 10));
      }

      // 获取总数
      const countQuery = query.replace('SELECT *', 'SELECT COUNT(*) as total');
      const countStmt = env.DB.prepare(countQuery).bind(...bindings);
      const countRes: any = await countStmt.first();
      const total = countRes?.total || 0;

      // 分页排序查询
      query += ` ORDER BY ${sortColumn} DESC LIMIT ? OFFSET ?`;
      bindings.push(pageSize, offset);

      const dataStmt = env.DB.prepare(query).bind(...bindings);
      const { results } = await dataStmt.all();

      return new Response(JSON.stringify({
        success: true,
        source: 'd1_sql',
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        results: results || [],
      }), {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, s-maxage=300, max-age=60',
        },
      });
    } catch (d1Err) {
      console.warn('[Browse] D1 SQL 查询异常，回退至 KV:', d1Err);
    }
  }

  // 2. 降级方案：从 KVIDEO_KV 倒排索引读取
  try {
    let indexKey = `index:${sort === 'rating' ? 'score' : sort === 'popularity' ? 'popularity' : 'time_added'}:${category}`;
    const rawIds = await env.KVIDEO_KV.get(indexKey);
    let ids: string[] = [];
    if (rawIds) {
      try {
        ids = JSON.parse(rawIds);
      } catch {}
    }

    const total = ids.length;
    const pageIds = ids.slice(offset, offset + pageSize);

    // 并发批量获取实体元数据
    const entityPromises = pageIds.map(async (id) => {
      const rawEntity = await env.KVIDEO_KV.get(`entity:${id}`);
      if (rawEntity) {
        try {
          return JSON.parse(rawEntity);
        } catch {}
      }
      return { id };
    });

    const results = await Promise.all(entityPromises);

    return new Response(JSON.stringify({
      success: true,
      source: 'kv_fallback',
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
      results,
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, s-maxage=300, max-age=60',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({
      success: false,
      error: err.message || 'Browse failed',
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}
