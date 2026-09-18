'use client';

import React, { useState, useEffect } from 'react';
import {
  Settings,
  ShieldCheck,
  Activity,
  Play,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  Clock,
  Key,
  Database,
  Cpu,
  Workflow,
} from 'lucide-react';
import { AuditLogEntry } from '@/lib/admin/audit';

interface HealthData {
  timestamp: string;
  isOverallHealthy: boolean;
  kv: {
    connected: boolean;
    latencyMs: number;
    totalEntities: number;
  };
  secrets: Record<string, boolean>;
}

const WORKFLOWS = [
  {
    id: 'deploy.yml',
    title: 'Cloudflare Pages 编译部署',
    desc: '重新编译主站 Next.js 并发布至全球 Cloudflare Anycast 边缘网络',
    icon: Cpu,
  },
  {
    id: 'seo-intelligence.yml',
    title: '全网 SEO 智能巡检与自愈',
    desc: '执行 GSC API 同步、高潜词挖掘、IndexNow 广播与 Google Indexing 促抓',
    icon: Activity,
  },
  {
    id: 'sync-iyf-channels.yml',
    title: '爱壹帆频道与连载新片同步',
    desc: '全自动抓取各大频道最新连载集数角标、焦点通栏大图并自动烘焙入库',
    icon: RefreshCw,
  },
  {
    id: 'full-site-prewarm.yml',
    title: '全站四维资产预热与 R2 缓存',
    desc: '预拉取演职员肖像、w1280 巨幕海报推送到亚太 R2 镜像，保障 0ms 秒开',
    icon: Database,
  },
];

export default function AdminSystemPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningWorkflow, setRunningWorkflow] = useState<string | null>(null);
  const [workflowMsg, setWorkflowMsg] = useState<{ type: 'success' | 'error'; text: string; runUrl?: string } | null>(null);

  const fetchSystemData = async () => {
    try {
      setLoading(true);
      const [hRes, aRes] = await Promise.all([
        fetch('/api/admin/system/health'),
        fetch('/api/admin/audit-log?limit=50'),
      ]);

      if (hRes.ok) {
        const hData = await hRes.json();
        if (hData.success) setHealth(hData);
      }
      if (aRes.ok) {
        const aData = await aRes.json();
        if (aData.success) setAuditLogs(aData.logs || []);
      }
    } catch (e) {
      console.error('[Fetch System] 异常:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemData();
  }, []);

  const handleTriggerWorkflow = async (workflowId: string) => {
    try {
      setRunningWorkflow(workflowId);
      setWorkflowMsg(null);
      const res = await fetch('/api/admin/system/workflow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: workflowId }),
      });
      const data = await res.json();
      if (data.success) {
        setWorkflowMsg({
          type: 'success',
          text: data.message,
          runUrl: data.runUrl,
        });
        fetchSystemData();
      } else {
        setWorkflowMsg({
          type: 'error',
          text: data.error || '触发工作流失败',
        });
      }
    } catch (err: any) {
      setWorkflowMsg({
        type: 'error',
        text: err.message || '网络请求异常',
      });
    } finally {
      setRunningWorkflow(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <span>系统配置与操作审计</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-700/40 text-slate-300 border border-white/10 font-mono">
              System &amp; Audit
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            监控 Cloudflare KV 连通延迟、安全凭据装配、一键调度 GitHub Actions 与查看历史操作审计
          </p>
        </div>

        <button
          onClick={fetchSystemData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-red-400' : ''}`} />
          <span>刷新状态</span>
        </button>
      </div>

      {/* 工作流反馈提示 */}
      {workflowMsg && (
        <div
          className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            workflowMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/40 border-red-500/30 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {workflowMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{workflowMsg.text}</span>
          </div>
          {workflowMsg.runUrl && (
            <a
              href={workflowMsg.runUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-300 font-medium hover:underline self-start sm:self-auto"
            >
              <span>在 GitHub Actions 中实时跟踪</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* 模块 1: 系统运行与健康总览 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* KV 状态 */}
        <div className="admin-glass-panel p-5 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-red-500" />
              <span>Cloudflare KV 状态</span>
            </span>
            {health?.kv.connected ? (
              <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>连通正常</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-red-400 text-xs font-medium">
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span>离线</span>
              </span>
            )}
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>全局实体总索引:</span>
              <span className="font-mono font-bold text-white">
                {health?.kv.totalEntities?.toLocaleString() || 0} 条
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>KV 读取延迟:</span>
              <span className="font-mono text-emerald-400">
                {health?.kv.latencyMs || 0} ms
              </span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>存储命名空间:</span>
              <span className="font-mono text-slate-400">KVIDEO_KV</span>
            </div>
          </div>
        </div>

        {/* 环境变量安全状态 */}
        <div className="admin-glass-panel p-5 rounded-2xl lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>关键安全环境变量装配状态 (脱敏安全检查)</span>
            </span>
            <span className="text-[11px] text-slate-400">只读状态</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
            {health?.secrets ? (
              Object.entries(health.secrets).map(([key, isSet]) => (
                <div
                  key={key}
                  className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
                >
                  <span className="font-mono text-slate-300 text-[11px] truncate max-w-[120px]">
                    {key}
                  </span>
                  {isSet ? (
                    <span className="text-emerald-400 text-[11px] font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>已装配</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-[11px]">未配置</span>
                  )}
                </div>
              ))
            ) : (
              <div className="col-span-3 text-xs text-slate-400">正在检查环境变量...</div>
            )}
          </div>
        </div>
      </div>

      {/* 模块 2: GitHub Actions 调度面板 */}
      <div className="admin-glass-panel p-6 rounded-2xl space-y-4">
        <div>
          <h2 className="text-base font-semibold text-white flex items-center gap-2">
            <Workflow className="w-4 h-4 text-red-500" />
            <span>GitHub Actions 工作流远程触发与调度</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            无需离开控制台，一键向 GitHub 提交 workflow_dispatch 调度编译、巡检与预热任务
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {WORKFLOWS.map((wf) => {
            const Icon = wf.icon;
            const isRunning = runningWorkflow === wf.id;
            return (
              <div
                key={wf.id}
                className="p-4 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 transition-colors flex flex-col justify-between gap-3"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-xs">{wf.title}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                      {wf.desc}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-white/5 text-xs">
                  <span className="font-mono text-[11px] text-slate-400">{wf.id}</span>
                  <button
                    onClick={() => handleTriggerWorkflow(wf.id)}
                    disabled={isRunning}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600/20 hover:bg-red-600/30 text-red-300 border border-red-500/30 text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    <Play className={`w-3 h-3 ${isRunning ? 'animate-spin' : ''}`} />
                    <span>{isRunning ? '调度中...' : '立即运行'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 模块 3: 全量操作审计日志 */}
      <div className="admin-glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>全量操作审计日志 (Audit Trail)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              记录所有管理后台关键动作（实体下架、修改、促抓推送与工作流触发），永久保留 90 天
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">共 {auditLogs.length} 条</span>
        </div>

        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 font-medium">
                <th className="py-2.5 px-4">操作时间</th>
                <th className="py-2.5 px-4">操作人 (Actor)</th>
                <th className="py-2.5 px-4">操作类型 (Action)</th>
                <th className="py-2.5 px-4">目标对象 (Target)</th>
                <th className="py-2.5 px-4">操作详情</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    正在拉取操作日志...
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    暂无审计日志。
                  </td>
                </tr>
              ) : (
                auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('zh-CN', { hour12: false })}
                    </td>
                    <td className="py-3 px-4 font-mono font-medium text-slate-300">
                      {log.actor}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-white font-medium text-[11px]">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300 max-w-xs truncate">
                      {log.target || '-'}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] max-w-sm truncate font-mono">
                      {typeof log.details === 'object'
                        ? JSON.stringify(log.details)
                        : log.details || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
