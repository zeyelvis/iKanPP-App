'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Film,
  Zap,
  Radio,
  TrendingUp,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Search,
  Activity,
  Calendar,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface DashboardData {
  entityCount: number;
  indexingQuota: {
    used: number;
    limit: number;
    remaining: number;
  };
  indexNowCount: number;
  highPotentialCount: number;
  seoScoreDist: {
    excellent: number;
    good: number;
    needsWork: number;
  };
  recentLogs: Array<{
    id: string;
    actor: string;
    action: string;
    target?: string;
    timestamp: string;
  }>;
  latestReportDate: string;
  latestReportSummary: {
    sitemapCount: number;
    googlePushedCount: number;
    autoHealedCount: number;
    timestamp: string | null;
  } | null;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setRefreshing(true);
      const res = await fetch('/api/admin/dashboard');
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.success) {
        setData(json.data);
        setError(null);
      } else {
        setError(json.error || '获取数据异常');
      }
    } catch (err: any) {
      setError(err.message || '网络连接超时');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const quotaPercent = data
    ? Math.min(100, Math.round((data.indexingQuota.used / data.indexingQuota.limit) * 100))
    : 0;

  const totalScored = data
    ? data.seoScoreDist.excellent + data.seoScoreDist.good + data.seoScoreDist.needsWork
    : 1;

  const excellentPct = data
    ? Math.round((data.seoScoreDist.excellent / (totalScored || 1)) * 100)
    : 70;
  const goodPct = data
    ? Math.round((data.seoScoreDist.good / (totalScored || 1)) * 100)
    : 20;
  const needsWorkPct = data
    ? Math.round((data.seoScoreDist.needsWork / (totalScored || 1)) * 100)
    : 10;

  return (
    <div className="space-y-6">
      {/* 顶部标题栏 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <span>SEO Mission Control 仪表盘</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-mono">
              v3.0
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            监控全域影视实体质量、Google Indexing 促抓消耗、IndexNow 广播与高潜词排名
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchDashboard}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-red-400' : ''}`} />
            <span>{refreshing ? '刷新中...' : '刷新指标'}</span>
          </button>

          <Link
            href="/admin/seo"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-medium transition-all shadow-md shadow-red-600/30 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>全量 SEO 巡检</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 text-amber-200 text-xs flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>无法加载仪表盘实时数据: {error}（正在以本地兜底状态呈现）</span>
        </div>
      )}

      {/* 4 大核心 KPI 指标卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 卡片 1: 影视实体库 */}
        <div className="admin-glass-panel admin-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">影视实体库总规模</span>
            <div className="p-2 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white admin-tabular-nums">
              {loading ? '...' : (data?.entityCount || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-medium">100% 直连源站</span>
              <span>• KV 纳管</span>
            </div>
          </div>
          <Link
            href="/admin/entities"
            className="absolute bottom-4 right-4 text-slate-400 hover:text-white transition-colors"
            title="查看实体列表"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 卡片 2: 今日 Google Indexing 配额 */}
        <div className="admin-glass-panel admin-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">今日 Google Indexing 配额</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white admin-tabular-nums">
                {loading ? '...' : data?.indexingQuota.used || 0}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 200 条上限</span>
            </div>
            {/* 进度条 */}
            <div className="w-full bg-white/10 h-1.5 rounded-full mt-3 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  quotaPercent >= 90 ? 'bg-red-500' : quotaPercent >= 60 ? 'bg-amber-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${quotaPercent}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5">
              <span>剩余 {loading ? '...' : data?.indexingQuota.remaining || 200} 条</span>
              <span className="text-slate-400">{quotaPercent}% 消耗</span>
            </div>
          </div>
          <Link
            href="/admin/indexing"
            className="absolute top-4 right-12 text-slate-400 hover:text-white transition-colors"
            title="进入促抓控制台"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 卡片 3: IndexNow 广播 */}
        <div className="admin-glass-panel admin-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">最新 IndexNow 广播</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Radio className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white admin-tabular-nums">
              {loading ? '...' : (data?.indexNowCount || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <span className="text-cyan-400 font-medium">Bing / Yandex / Seznam</span>
              <span>全覆盖</span>
            </div>
          </div>
          <Link
            href="/admin/indexing"
            className="absolute bottom-4 right-4 text-slate-400 hover:text-white transition-colors"
            title="查看广播状态"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* 卡片 4: 高潜冲榜词 */}
        <div className="admin-glass-panel admin-card-hover p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">高潜冲榜词库 (Pos 11-30)</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold font-mono tracking-tight text-white admin-tabular-nums">
              {loading ? '...' : (data?.highPotentialCount || 0).toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
              <span className="text-purple-400 font-medium">第二页黄金跃升</span>
              <span>• 自动提权</span>
            </div>
          </div>
          <Link
            href="/admin/seo"
            className="absolute bottom-4 right-4 text-slate-400 hover:text-white transition-colors"
            title="查看关键词库"
          >
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 第二行：质量分级分布与巡检概况 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SEO 质量分级分布 */}
        <div className="admin-glass-panel p-6 rounded-2xl lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-red-500" />
                <span>全站影视实体 SEO 质量评级</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                依据剧情描述深度、真实演职人员、豆瓣/TMDB 评分、4K 宽屏剧照等 6 维门禁
              </p>
            </div>
            <Link
              href="/admin/entities"
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
            >
              <span>查看全部</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* 三色并列进度条 */}
          <div className="space-y-2">
            <div className="w-full bg-white/5 h-3 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full transition-all"
                style={{ width: `${excellentPct}%` }}
                title={`优秀 (≥80分): ${data?.seoScoreDist.excellent || 0} (${excellentPct}%)`}
              />
              <div
                className="bg-amber-500 h-full transition-all"
                style={{ width: `${goodPct}%` }}
                title={`合格 (60-79分): ${data?.seoScoreDist.good || 0} (${goodPct}%)`}
              />
              <div
                className="bg-red-500/80 h-full transition-all"
                style={{ width: `${needsWorkPct}%` }}
                title={`待优化 (<60分): ${data?.seoScoreDist.needsWork || 0} (${needsWorkPct}%)`}
              />
            </div>

            {/* 图例 */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>优秀 (≥80分)</span>
                </div>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  {loading ? '...' : (data?.seoScoreDist.excellent || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">占比 {excellentPct}%</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>合格 (60~79分)</span>
                </div>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  {loading ? '...' : (data?.seoScoreDist.good || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">占比 {goodPct}%</div>
              </div>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <div className="flex items-center gap-1.5 text-xs text-red-400 font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-400" />
                  <span>待补齐 (&lt;60分)</span>
                </div>
                <div className="text-lg font-bold font-mono text-white mt-1">
                  {loading ? '...' : (data?.seoScoreDist.needsWork || 0).toLocaleString()}
                </div>
                <div className="text-[11px] text-slate-400">占比 {needsWorkPct}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* 最新巡检简报 */}
        <div className="admin-glass-panel p-6 rounded-2xl flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>最新巡检报告</span>
              </h2>
              <span className="text-xs font-mono text-slate-400">
                {data?.latestReportDate || '今日'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              由 GitHub Actions 每小时巡检自动生成并归档至 KV
            </p>

            <div className="mt-4 space-y-2.5">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                <span className="text-slate-400">已提交 Sitemap 索引条目</span>
                <span className="font-mono font-semibold text-white">
                  {data?.latestReportSummary?.sitemapCount || 7} 个分卷
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                <span className="text-slate-400">Google 促抓推送</span>
                <span className="font-mono font-semibold text-emerald-400">
                  {data?.latestReportSummary?.googlePushedCount || 0} 成功
                </span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs">
                <span className="text-slate-400">死链与索引自愈数</span>
                <span className="font-mono font-semibold text-cyan-400">
                  {data?.latestReportSummary?.autoHealedCount || 0} 条修复
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/seo"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-colors"
          >
            <span>查看完整 SEO 巡检报告</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 第三行：操作审计日志流 */}
      <div className="admin-glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>最近操作审计流 (Audit Log)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              记录影视实体变更、Google Indexing 推送、IndexNow 广播与系统触发行为
            </p>
          </div>
          <Link
            href="/admin/system"
            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 font-medium"
          >
            <span>全量日志</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">正在拉取操作日志...</div>
        ) : !data?.recentLogs || data.recentLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 bg-white/[0.01] rounded-xl border border-white/5">
            暂无操作日志。当执行实体编辑、删除或手动推送促抓时，操作将实时记入 Cloudflare KV。
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {data.recentLogs.map((log) => (
              <div
                key={log.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
              >
                <div className="flex items-center gap-3">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span className="font-medium text-white">{log.action}</span>
                  {log.target && (
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-300 font-mono text-[11px] max-w-xs truncate">
                      {log.target}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                  <span>{log.actor}</span>
                  <span>•</span>
                  <span>{new Date(log.timestamp).toLocaleString('zh-CN', { hour12: false })}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 快捷导航与快速行动面板 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <Link
          href="/admin/entities"
          className="admin-glass-panel p-4 rounded-xl hover:border-red-500/30 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
              <Film className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">影视实体管理</div>
              <div className="text-xs text-slate-400">搜索、修改海报与剧情</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/admin/indexing"
          className="admin-glass-panel p-4 rounded-xl hover:border-amber-500/30 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20 transition-colors">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">促抓控制台</div>
              <div className="text-xs text-slate-400">单条或批量极速催促收录</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </Link>

        <Link
          href="/admin/system"
          className="admin-glass-panel p-4 rounded-xl hover:border-blue-500/30 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">系统健康与 Actions</div>
              <div className="text-xs text-slate-400">触发部署与工作流巡检</div>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
        </Link>
      </div>
    </div>
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}
