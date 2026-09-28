'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  ShieldCheck,
  ShieldAlert,
  Activity,
  RefreshCw,
  Zap,
  Play,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  EyeOff,
  Clock,
  Terminal,
  Server,
  KeyRound,
  Wifi,
  Sparkles,
  Lock,
} from 'lucide-react';
import { ShadowLineConfig, ShadowLineHealth, ShadowLineAuditLog } from '@/lib/services/shadowline-service';

export default function ShadowLineAdminPage() {
  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<(ShadowLineConfig & { keyMasked?: string; ivMasked?: string }) | null>(null);
  const [health, setHealth] = useState<ShadowLineHealth | null>(null);
  const [logs, setLogs] = useState<ShadowLineAuditLog[]>([]);
  const [showFullKeys, setShowFullKeys] = useState(false);

  // 操作状态
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [bannerMsg, setBannerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/shadowline/status');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setConfig(data.config);
          setHealth(data.health);
          setLogs(data.logs || []);
        }
      }
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: '加载状态失败: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleProbe = async () => {
    try {
      setActionLoading('probe');
      setBannerMsg(null);
      const res = await fetch('/api/admin/shadowline/probe', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setHealth(data.health);
        setBannerMsg({ type: 'success', text: `Canary 探活成功！延迟 ${data.health.latencyMs}ms，m3u8 及切片 CORS 正常。` });
        fetchStatus();
      } else {
        setBannerMsg({ type: 'error', text: `Canary 探活异常: ${data.health?.error || '无法连通'}` });
      }
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: '触发探活失败: ' + err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleSniff = async () => {
    try {
      setActionLoading('sniff');
      setBannerMsg(null);
      const res = await fetch('/api/admin/shadowline/sniff', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setBannerMsg({ type: 'success', text: data.message });
        fetchStatus();
      } else {
        setBannerMsg({ type: 'error', text: data.message });
      }
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: '触发自愈嗅探失败: ' + err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggle = async () => {
    try {
      setActionLoading('toggle');
      setBannerMsg(null);
      const res = await fetch('/api/admin/shadowline/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !config?.enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setBannerMsg({
          type: 'success',
          text: data.enabled ? '暗影专线已解除熔断，恢复前台展示。' : '暗影专线已触发紧急熔断，前台已静默隐藏！',
        });
        fetchStatus();
      }
    } catch (err: any) {
      setBannerMsg({ type: 'error', text: '切换熔断状态失败: ' + err.message });
    } finally {
      setActionLoading(null);
    }
  };

  const isHealthy = config?.enabled && health?.status === 'healthy';

  return (
    <div className="space-y-6">
      {/* 顶部标题与状态指示条 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-linear-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20 border border-indigo-500/30 text-indigo-400">
            <Radio className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-wide">暗影自愈专线中枢</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                ShadowLine Mission Control
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              纯前端零代理高画质自愈备用线路，金丝雀探活与反侦察状态监控中枢
            </p>
          </div>
        </div>

        {/* 状态徽章 */}
        <div className="flex items-center gap-2.5">
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-mono font-medium ${
              !config?.enabled
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : isHealthy
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                !config?.enabled
                  ? 'bg-red-500'
                  : isHealthy
                  ? 'bg-emerald-400 animate-ping'
                  : 'bg-amber-400'
              }`}
            />
            <span>
              {!config?.enabled ? '已紧急熔断 (OFFLINE)' : isHealthy ? '健康在线 (HEALTHY)' : '降级受限 (DEGRADED)'}
            </span>
          </div>

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            title="刷新数据"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 提示 Banner */}
      {bannerMsg && (
        <div
          className={`p-3.5 rounded-xl border text-sm flex items-center justify-between ${
            bannerMsg.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {bannerMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{bannerMsg.text}</span>
          </div>
          <button onClick={() => setBannerMsg(null)} className="text-xs opacity-70 hover:opacity-100">
            关闭
          </button>
        </div>
      )}

      {/* 三大状态卡片矩阵 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 卡片 1: 动态解密凭据 */}
        <div className="p-4 rounded-xl bg-[#0D0D14]/80 border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <KeyRound className="w-4 h-4 text-purple-400" />
              动态解密凭据 (AES-128-CBC)
            </span>
            <button
              onClick={() => setShowFullKeys(!showFullKeys)}
              className="text-[11px] text-slate-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
            >
              {showFullKeys ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {showFullKeys ? '隐藏明文' : '查看完整'}
            </button>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">API HOST 域名:</span>
              <span className="text-slate-200 break-all">{config?.baseUrl || 'https://haiwaiapi.1fc8ab0.com'}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">AES KEY (16位):</span>
              <span className="text-purple-300">
                {showFullKeys ? config?.key : config?.keyMasked || '181c****5b2b'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">AES IV (16位):</span>
              <span className="text-purple-300">
                {showFullKeys ? config?.iv : config?.ivMasked || '4423****76ce'}
              </span>
            </div>
            <div className="pt-1 border-t border-white/5 flex justify-between text-[11px] text-slate-500 font-sans">
              <span>提取来源: {config?.sourceBundle || '/_nuxt/256178e.js'}</span>
              <span>{config?.updatedAt ? new Date(config.updatedAt).toLocaleTimeString() : '刚刚'}</span>
            </div>
          </div>
        </div>

        {/* 卡片 2: Canary 探活质量雷达 */}
        <div className="p-4 rounded-xl bg-[#0D0D14]/80 border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              Canary 金丝雀质量雷达
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {health?.latencyMs ?? 48} ms
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">标的影视:</span>
              <span className="text-slate-200 font-sans">{health?.canaryVod || '绿灯军团 (139933)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">切片 CORS 跨域:</span>
              <span className="text-emerald-400">{health?.corsStatus || '回显 (*)'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">起播响应状态:</span>
              <span className={health?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}>
                {health?.status === 'healthy' ? 'HTTP 200 (OK)' : '异常/超时'}
              </span>
            </div>
            <div className="pt-1 border-t border-white/5 flex justify-between text-[11px] text-slate-500 font-sans">
              <span>最近探活:</span>
              <span>{health?.lastProbeAt ? new Date(health.lastProbeAt).toLocaleTimeString() : '刚刚'}</span>
            </div>
          </div>
        </div>

        {/* 卡片 3: 隐匿与反反爬水位 */}
        <div className="p-4 rounded-xl bg-[#0D0D14]/80 border border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              隐匿防侦察水位 (Stealth Policy)
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
              安全级: 极高
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between">
              <span className="text-slate-500">解析策略:</span>
              <span className="text-sky-300 font-sans">惰性按需点播 (0预爬)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">来源隔离:</span>
              <span className="text-emerald-400">no-referrer (0暴露)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">客户端指纹:</span>
              <span className="text-slate-300 font-sans">全真 Chromium 124</span>
            </div>
            <div className="pt-1 border-t border-white/5 flex justify-between text-[11px] text-slate-500 font-sans">
              <span>巡检模式:</span>
              <span>高斯随机抖动 (2h ± 30m)</span>
            </div>
          </div>
        </div>
      </div>

      {/* 控制台操作面板 */}
      <div className="p-5 rounded-xl bg-[#0D0D14]/80 border border-white/10 space-y-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          控制台操作面板 (Mission Actions)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* 操作 1: 立即执行静默嗅探 */}
          <button
            onClick={handleSniff}
            disabled={actionLoading !== null}
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all hover:border-purple-500/30 flex items-start gap-3 group"
          >
            <div className="p-2 rounded bg-purple-500/10 text-purple-400 group-hover:scale-105 transition-transform">
              <RefreshCw className={`w-4 h-4 ${actionLoading === 'sniff' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">立即静默嗅探自愈</div>
              <div className="text-[11px] text-slate-400 mt-0.5">扫描上游 Bundle 变动并自动提取最新凭据</div>
            </div>
          </button>

          {/* 操作 2: 运行 Canary 探活测试 */}
          <button
            onClick={handleProbe}
            disabled={actionLoading !== null}
            className="p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-all hover:border-emerald-500/30 flex items-start gap-3 group"
          >
            <div className="p-2 rounded bg-emerald-500/10 text-emerald-400 group-hover:scale-105 transition-transform">
              <Zap className={`w-4 h-4 ${actionLoading === 'probe' ? 'animate-bounce' : ''}`} />
            </div>
            <div>
              <div className="text-xs font-semibold text-white">运行 Canary 探活</div>
              <div className="text-[11px] text-slate-400 mt-0.5">测试标的剧集 API 解密、m3u8 及切片 CORS 连通性</div>
            </div>
          </button>

          {/* 操作 3: 熔断开关切换 */}
          <button
            onClick={handleToggle}
            disabled={actionLoading !== null}
            className={`p-3 rounded-lg border text-left transition-all flex items-start gap-3 group ${
              config?.enabled
                ? 'bg-red-500/5 hover:bg-red-500/10 border-red-500/20 hover:border-red-500/40'
                : 'bg-emerald-500/5 hover:bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/40'
            }`}
          >
            <div
              className={`p-2 rounded ${
                config?.enabled ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'
              } group-hover:scale-105 transition-transform`}
            >
              {config?.enabled ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            </div>
            <div>
              <div className="text-xs font-semibold text-white">
                {config?.enabled ? '一键紧急熔断 (下线)' : '解除熔断 (恢复前台)'}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                {config?.enabled ? '前台切源抽屉立即静默隐藏该专线' : '恢复前台切源展示与点播解析'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* 自愈与审计日志记录 */}
      <div className="p-5 rounded-xl bg-[#0D0D14]/80 border border-white/10 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            探活与自愈审计日志 (Audit Trail - 保留90天)
          </h2>
          <span className="text-[11px] text-slate-500 font-mono">共 {logs.length} 条记录</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/5 text-slate-400 font-medium">
                <th className="py-2.5 px-3">时间</th>
                <th className="py-2.5 px-3">事件类型</th>
                <th className="py-2.5 px-3">状态</th>
                <th className="py-2.5 px-3">延迟 / 耗时</th>
                <th className="py-2.5 px-3">详细信息</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-mono">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-500 font-sans">
                    暂无审计日志，点击上方【运行 Canary 探活】记录第一条快照
                  </td>
                </tr>
              ) : (
                logs.map((log, index) => (
                  <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-200 font-sans">{log.action}</td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : log.status === 'FAILURE'
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400">{log.latencyMs ? `${log.latencyMs} ms` : '-'}</td>
                    <td className="py-2.5 px-3 text-slate-300 font-sans break-all">{log.details || '-'}</td>
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
