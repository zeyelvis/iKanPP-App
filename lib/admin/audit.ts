/**
 * 管理后台操作审计日志存储与读取模块
 * 自动写入 Cloudflare KV (key: admin:audit-log:TIMESTAMP)，保留最近 90 天
 */

import { kvGet, kvPut } from '@/lib/services/entity-kv';

export interface AuditLogEntry {
  id: string;
  actor: string;
  action: string;
  target?: string;
  details?: Record<string, any> | string;
  ip?: string;
  timestamp: string;
}

const AUDIT_INDEX_KEY = 'admin:audit-logs:index';
const MAX_LOGS_KEPT = 300;

/**
 * 记录一条管理员操作日志
 */
export async function recordAuditLog(entry: {
  actor: string;
  action: string;
  target?: string;
  details?: Record<string, any> | string;
  ip?: string;
}): Promise<AuditLogEntry> {
  const now = new Date();
  const id = `log_${now.getTime()}_${Math.random().toString(36).substring(2, 7)}`;
  const logItem: AuditLogEntry = {
    id,
    actor: entry.actor,
    action: entry.action,
    target: entry.target,
    details: entry.details,
    ip: entry.ip,
    timestamp: now.toISOString(),
  };

  try {
    // 写入单独日志键
    const logKey = `admin:audit-log:${now.getTime()}`;
    await kvPut(logKey, JSON.stringify(logItem));

    // 更新索引列表
    const indexRaw = await kvGet(AUDIT_INDEX_KEY);
    let indexList: AuditLogEntry[] = [];
    if (indexRaw) {
      try {
        indexList = JSON.parse(indexRaw);
      } catch {
        indexList = [];
      }
    }

    // 头部追加新日志，截断超过上限的历史日志
    indexList.unshift(logItem);
    if (indexList.length > MAX_LOGS_KEPT) {
      indexList = indexList.slice(0, MAX_LOGS_KEPT);
    }

    await kvPut(AUDIT_INDEX_KEY, JSON.stringify(indexList));
  } catch (err) {
    console.error('[AuditLog] 写入操作日志失败:', err);
  }

  return logItem;
}

/**
 * 获取最新操作审计日志列表
 */
export async function getRecentAuditLogs(limit: number = 50): Promise<AuditLogEntry[]> {
  try {
    const indexRaw = await kvGet(AUDIT_INDEX_KEY);
    if (!indexRaw) return [];
    const list: AuditLogEntry[] = JSON.parse(indexRaw);
    return list.slice(0, limit);
  } catch (err) {
    console.error('[AuditLog] 获取审计日志失败:', err);
    return [];
  }
}
