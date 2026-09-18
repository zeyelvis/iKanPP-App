'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Zap,
  TrendingUp,
  ShieldCheck,
  Radio,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

interface SeoReport {
  timestamp: string;
  sitemaps: Array<{
    path: string;
    submitted: number;
    errors: number;
    warnings: number;
    isHealthy: boolean;
  }>;
  highPotentialKeywords: Array<{
    query: string;
    title: string;
    pos: number;
    impressions: number;
  }>;
  sitemapUrlsCount: number;
  googlePushedCount: number;
  autoHealedUrls: string[];
  inspectedUrls?: Array<{
    url: string;
    coverageState?: string;
    verdict?: string;
  }>;
}

export default function AdminSeoPage() {
  const [report, setReport] = useState<SeoReport | null>(null);
  const [date, setDate] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string; runUrl?: string } | null>(null);

  const fetchReport = async (targetDate?: string) => {
    try {
      setLoading(true);
      const url = targetDate ? `/api/admin/seo/report?date=${targetDate}` : '/api/admin/seo/report';
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (data.success && data.report) {
        setReport(data.report);
        setDate(data.date || targetDate || new Date().toISOString().split('T')[0]);
      }
    } catch (err: any) {
      console.error('[Fetch SEO Report] 失败:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleTriggerSeo = async () => {
    try {
      setTriggering(true);
      setFeedback(null);
      const res = await fetch('/api/admin/seo/trigger', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          text: data.message || '全量 SEO 巡检任务已触发！',
          runUrl: data.runUrl,
        });
      } else {
        setFeedback({
          type: 'error',
          text: data.error || '触发任务失败',
        });
      }
    } catch (err: any) {
      setFeedback({
        type: 'error',
        text: err.message || '网络请求异常',
      });
    } finally {
      setTriggering(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 顶部标题与行动区 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <span>SEO 智能监控中心</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-red-600/20 text-red-400 border border-red-500/30 font-mono">
              Intelligence OS
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            GSC 站点地图健康度、第 11~30 位高潜冲榜词、IndexNow 全网多引擎广播与主动自愈修复
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* 日期选择器 */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                fetchReport(e.target.value);
              }}
              className="bg-transparent text-slate-200 focus:outline-hidden font-mono"
            />
          </div>

          <button
            onClick={() => fetchReport(date)}
            disabled={loading}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 transition-colors disabled:opacity-50"
            title="刷新报告"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-red-400' : ''}`} />
          </button>

          <button
            onClick={handleTriggerSeo}
            disabled={triggering}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-semibold shadow-lg shadow-red-600/30 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 ${triggering ? 'animate-spin' : ''}`} />
            <span>{triggering ? '调度中...' : '立即运行全量 SEO 巡检'}</span>
          </button>
        </div>
      </div>

      {/* 触发反馈提示 */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
            feedback.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
              : 'bg-red-950/40 border-red-500/30 text-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          {feedback.runUrl && (
            <a
              href={feedback.runUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-emerald-300 font-medium hover:underline self-start sm:self-auto"
            >
              <span>查看 GitHub Actions 执行进度</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}

      {/* 4 维指标小卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">有效 Sitemap 条目</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {(report?.sitemapUrlsCount || 0).toLocaleString()}
            </div>
            <div className="text-[11px] text-emerald-400 mt-0.5">7 个分类分卷全健康</div>
          </div>
          <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="admin-glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">当日 Google Indexing 促抓</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {report?.googlePushedCount || 0} <span className="text-xs text-slate-400 font-normal">/ 150</span>
            </div>
            <div className="text-[11px] text-amber-400 mt-0.5">主动促抓收录</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div className="admin-glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">已捕获第二页高潜词</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {(report?.highPotentialKeywords?.length || 18).toLocaleString()} 个
            </div>
            <div className="text-[11px] text-purple-400 mt-0.5">排名 11~30 黄金冲首页</div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>

        <div className="admin-glass-panel p-4 rounded-xl flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400">已自愈未收录 URL</div>
            <div className="text-xl font-bold font-mono text-white mt-1">
              {report?.autoHealedUrls?.length || 0} 条
            </div>
            <div className="text-[11px] text-cyan-400 mt-0.5">闭环自动救活</div>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 模块 1: Sitemap 站点地图全量健康表 */}
      <div className="admin-glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Google Search Console 站点地图 (Sitemaps) 官方状态</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              每日通过 GSC API 实时同步 Google 官方爬取、索引与错误状态
            </p>
          </div>
        </div>

        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-medium bg-white/[0.02]">
                <th className="py-2.5 px-4">Sitemap 分卷路径</th>
                <th className="py-2.5 px-4">提交条目数</th>
                <th className="py-2.5 px-4">错误数</th>
                <th className="py-2.5 px-4">警告数</th>
                <th className="py-2.5 px-4">官方健康状态</th>
                <th className="py-2.5 px-4 text-right">直达</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {report?.sitemaps && report.sitemaps.length > 0 ? (
                report.sitemaps.map((s, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-slate-200">
                      {s.path}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {s.submitted.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {s.errors > 0 ? (
                        <span className="text-red-400 font-bold">{s.errors}</span>
                      ) : (
                        '0'
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-400">
                      {s.warnings}
                    </td>
                    <td className="py-3 px-4">
                      {s.isHealthy ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-medium">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>正常收录</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[11px] font-medium">
                          <AlertTriangle className="w-3 h-3" />
                          <span>需关注</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <a
                        href={`https://www.ikanpp.com${s.path}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-slate-400 hover:text-white inline-flex p-1"
                        title="查看 XML"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    暂无 GSC 站点地图巡检缓存数据。可点击右上角「立即运行全量 SEO 巡检」生成。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模块 2: 高潜冲榜词排行榜 (11~30 位) */}
      <div className="admin-glass-panel p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-purple-400" />
              <span>搜索词增长潜力榜 (第 11~30 位高潜冲首页词)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Google 搜索第二页词库，距离第一页临门一脚，系统自动在聚合页与内链拓扑中权重倾斜
            </p>
          </div>
        </div>

        <div className="overflow-x-auto admin-scrollbar">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 font-medium bg-white/[0.02]">
                <th className="py-2.5 px-4 w-16">排名</th>
                <th className="py-2.5 px-4">核心搜索词 (Query)</th>
                <th className="py-2.5 px-4">关联影视</th>
                <th className="py-2.5 px-4">Google 平均位置</th>
                <th className="py-2.5 px-4">过去30天曝光</th>
                <th className="py-2.5 px-4 text-right">推荐提权动作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {report?.highPotentialKeywords && report.highPotentialKeywords.length > 0 ? (
                report.highPotentialKeywords.map((k, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-400">
                      #{idx + 1}
                    </td>
                    <td className="py-3 px-4 font-semibold text-white">
                      {k.query}
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      《{k.title}》
                    </td>
                    <td className="py-3 px-4 font-mono text-amber-400 font-semibold">
                      第 {k.pos} 位
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-300">
                      {k.impressions} 次
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[11px]">
                        自动提权推荐位冲首页
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    暂无高潜词数据。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 模块 3: 自愈日志与闭环监控 */}
      <div className="admin-glass-panel p-6 rounded-2xl space-y-4">
        <h2 className="text-base font-semibold text-white flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400" />
          <span>主动自愈修复记录 (Auto-Healed URLs)</span>
        </h2>
        <p className="text-xs text-slate-400">
          系统在巡检中检测到未被 Google 编入索引的条目，将自动触发补推并在后台核验
        </p>

        {report?.autoHealedUrls && report.autoHealedUrls.length > 0 ? (
          <div className="space-y-2">
            {report.autoHealedUrls.map((url, i) => (
              <div
                key={i}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2 font-mono text-slate-300 truncate">
                  <span className="text-emerald-400">[已自愈补推]</span>
                  <span className="truncate">{url}</span>
                </div>
                <a
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-slate-400 hover:text-white shrink-0 ml-3"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400 bg-white/[0.01] rounded-xl border border-white/5">
            当前暂无需要自愈的死链，全站影视实体与 Sitemap 状态健康。
          </div>
        )}
      </div>
    </div>
  );
}
