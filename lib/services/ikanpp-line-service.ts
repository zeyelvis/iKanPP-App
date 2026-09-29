/**
 * iKanPP Line Service (iKanPP专线调度与健康管理服务)
 *
 * 与 shadowline-service.ts 同构的管理层：
 * - KV 配置持久化与热更新
 * - Canary 探活与健康检测
 * - 审计日志记录
 * - 紧急熔断开关
 */

import { kvGet, kvPut } from '@/lib/services/entity-kv';
import { ikanppProvider, type IkanppLineConfig } from '@/lib/services/providers/iyf-provider';

export interface IkanppLineHealth {
  status: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  lastProbeAt: string;
  playUrl?: string | null;
  resolution?: string;
  error?: string | null;
}

export interface IkanppLineAuditLog {
  timestamp: string;
  action: string;
  status: 'SUCCESS' | 'FAILURE' | 'INFO';
  latencyMs?: number;
  details?: string;
}

const DEFAULT_HEALTH: IkanppLineHealth = {
  status: 'healthy',
  latencyMs: 120,
  lastProbeAt: new Date().toISOString(),
};

export async function getIkanppLineConfig(): Promise<IkanppLineConfig> {
  try {
    const raw = await kvGet('ikanppline:config') || await kvGet('titanline:config');
    if (raw) {
      const stored = JSON.parse(raw);
      const config = { ...ikanppProvider.getConfig(), ...stored };
      ikanppProvider.updateConfig(config);
      return config;
    }
  } catch (err) {
    console.warn('[IkanppLine] 读取 KV 配置失败:', err);
  }
  return ikanppProvider.getConfig();
}

export async function getIkanppLineHealth(): Promise<IkanppLineHealth> {
  try {
    const raw = await kvGet('ikanppline:health') || await kvGet('titanline:health');
    if (raw) {
      return { ...DEFAULT_HEALTH, ...JSON.parse(raw) };
    }
  } catch (err) {
    console.warn('[IkanppLine] 读取 KV 健康状态失败:', err);
  }
  return DEFAULT_HEALTH;
}

export async function getIkanppLineLogs(limit = 20): Promise<IkanppLineAuditLog[]> {
  try {
    const raw = await kvGet('admin:audit-log:ikanppline') || await kvGet('admin:audit-log:titanline');
    if (raw) {
      const logs = JSON.parse(raw);
      if (Array.isArray(logs)) return logs.slice(-limit).reverse();
    }
  } catch (err) {
    console.warn('[IkanppLine] 读取审计日志失败:', err);
  }
  return [];
}

async function recordIkanppLineLog(entry: IkanppLineAuditLog): Promise<void> {
  try {
    let logs: IkanppLineAuditLog[] = [];
    const raw = await kvGet('admin:audit-log:ikanppline');
    if (raw) {
      logs = JSON.parse(raw);
      if (!Array.isArray(logs)) logs = [];
    }
    logs.push(entry);
    await kvPut('admin:audit-log:ikanppline', JSON.stringify(logs.slice(-100)));
  } catch (err) {
    console.warn('[IkanppLine] 记录审计日志失败:', err);
  }
}

/**
 * 探活验证 — 通过 API 获取一个已知影片的 576P m3u8 来验证通路
 */
export async function runIkanppLineProbe(): Promise<{ success: boolean; health: IkanppLineHealth }> {
  await getIkanppLineConfig();

  const probeResult = await ikanppProvider.probe();

  const healthData: IkanppLineHealth = {
    status: probeResult.success ? (probeResult.latencyMs < 3000 ? 'healthy' : 'degraded') : 'offline',
    latencyMs: probeResult.latencyMs,
    lastProbeAt: new Date().toISOString(),
    playUrl: probeResult.playUrl || null,
    resolution: '576P',
    error: probeResult.error || null,
  };

  try {
    await kvPut('ikanppline:health', JSON.stringify(healthData));
  } catch (kvErr) {
    console.warn('[IkanppLine] 写入健康状态到 KV 失败:', kvErr);
  }

  await recordIkanppLineLog({
    timestamp: new Date().toISOString(),
    action: 'CANARY_PROBE',
    status: probeResult.success ? 'SUCCESS' : 'FAILURE',
    latencyMs: probeResult.latencyMs,
    details: probeResult.success
      ? `探活成功，延迟 ${probeResult.latencyMs}ms，切片直链就绪`
      : `探活失败: ${probeResult.error}`,
  });

  return { success: probeResult.success, health: healthData };
}

/**
 * 切换静默熔断开关
 */
export async function toggleIkanppLineFuse(targetState?: boolean, actor = 'Admin'): Promise<IkanppLineConfig> {
  const config = await getIkanppLineConfig();
  config.enabled = targetState !== undefined ? targetState : !config.enabled;
  config.updatedAt = new Date().toISOString();

  ikanppProvider.updateConfig(config);

  try {
    await kvPut('ikanppline:config', JSON.stringify(config));
  } catch (kvErr) {
    console.warn('[IkanppLine] 写入熔断状态到 KV 失败:', kvErr);
  }

  await recordIkanppLineLog({
    timestamp: new Date().toISOString(),
    action: config.enabled ? 'FUSE_RESUME' : 'FUSE_TRIGGER',
    status: 'INFO',
    details: `${actor} ${config.enabled ? '解除了静默熔断，恢复专线' : '触发了紧急静默熔断，下线专线'}`,
  });

  return config;
}

// 兼容别名导出
export const getTitanLineConfig = getIkanppLineConfig;
export const getTitanLineHealth = getIkanppLineHealth;
export const getTitanLineLogs = getIkanppLineLogs;
export const runTitanLineProbe = runIkanppLineProbe;
export const toggleTitanLineFuse = toggleIkanppLineFuse;
export type TitanLineHealth = IkanppLineHealth;
export type TitanLineAuditLog = IkanppLineAuditLog;
