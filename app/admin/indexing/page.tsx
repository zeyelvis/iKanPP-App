'use client';

import React, { useState, useEffect } from 'react';
import {
  Zap,
  Radio,
  Trash2,
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  ShieldAlert,
  Sliders,
  Sparkles,
  ExternalLink,
  Info,
} from 'lucide-react';

interface QuotaData {
  used: number;
  limit: number;
  remaining: number;
  safetyLockThreshold: number;
  isLocked: boolean;
  percent: number;
}

export default function AdminIndexingPage() {
  const [quota, setQuota] = useState<QuotaData | null>(null);
  const [quotaLoading, setQuotaLoading] = useState(true);

  // 单条操作
  const [singleUrl, setSingleUrl] = useState('');
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleResult, setSingleResult] = useState<any>(null);

  // 批量操作
  const [batchUrlsText, setBatchUrlsText] = useState('');
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchResult, setBatchResult] = useState<any>(null);

  const fetchQuota = async () => {
    try {
      setQuotaLoading(true);
      const res = await fetch('/api/admin/indexing/quota');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setQuota(data);
        }
      }
    } catch (e) {
      console.error('[Fetch Quota] 异常:', e);
    } finally {
      setQuotaLoading(false);
    }
  };

  useEffect(() => {
    fetchQuota();
  }, []);

  // 单条操作
  const handleSingleAction = async (actionType: 'push' | 'delete' | 'inspect' | 'indexnow') => {
    const url = singleUrl.trim();
    if (!url) {
      alert('请输入目标 URL');
      return;
    }

    try {
      setSingleLoading(true);
      setSingleResult(null);

      let endpoint = '/api/admin/indexing/push';
      let payload: any = { url, type: 'URL_UPDATED' };

      if (actionType === 'delete') {
        endpoint = '/api/admin/indexing/push';
        payload = { url, type: 'URL_DELETED' };
      } else if (actionType === 'inspect') {
        endpoint = '/api/admin/indexing/inspect';
        payload = { url };
      } else if (actionType === 'indexnow') {
        endpoint = '/api/admin/indexing/indexnow';
        payload = { urls: [url] };
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      setSingleResult({
        action: actionType,
        success: data.success,
        data,
      });

      // 刷新配额
      fetchQuota();
    } catch (err: any) {
      setSingleResult({
        action: actionType,
        success: false,
        error: err.message || '网络请求异常',
      });
    } finally {
      setSingleLoading(false);
    }
  };

  // 批量推送 Google
  const handleBatchPushGoogle = async () => {
    const rawLines = batchUrlsText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('http'));

    const urls = Array.from(new Set(rawLines));
    if (urls.length === 0) {
      alert('请在文本框中输入有效的 HTTP/HTTPS URL 列表（每行一条）');
      return;
    }

    if (quota && quota.isLocked) {
      alert('今日 Google Indexing API 已触发安全熔断锁，无法继续推送！');
      return;
    }

    try {
      setBatchLoading(true);
      setBatchResult(null);
      const res = await fetch('/api/admin/indexing/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, type: 'URL_UPDATED' }),
      });
      const data = await res.json();
      setBatchResult(data);
      fetchQuota();
    } catch (err: any) {
      setBatchResult({ success: false, error: err.message || '网络异常' });
    } finally {
      setBatchLoading(false);
    }
  };

  // 批量推送 IndexNow
  const handleBatchIndexNow = async () => {
    const rawLines = batchUrlsText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('http'));

    const urls = Array.from(new Set(rawLines));
    if (urls.length === 0) {
      alert('请在文本框中输入有效的 HTTP/HTTPS URL 列表（每行一条）');
      return;
    }

    try {
      setBatchLoading(true);
      setBatchResult(null);
      const res = await fetch('/api/admin/indexing/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls }),
      });
      const data = await res.json();
      setBatchResult(data);
    } catch (err: any) {
      setBatchResult({ success: false, error: err.message || '网络异常' });
    } finally {
      setBatchLoading(false);
    }
  };

  const parsedBatchCount = batchUrlsText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('http')).length;

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <span>搜索引擎促抓控制台</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 font-mono">
              Indexing Console
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            直连 Google Indexing API 与 IndexNow 全球多引擎（Bing / Yandex / Seznam），秒级催促爬虫收录
          </p>
        </div>

        <button
          onClick={fetchQuota}
          disabled={quotaLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${quotaLoading ? 'animate-spin text-amber-400' : ''}`} />
          <span>刷新配额</span>
        </button>
      </div>

      {/* 配额监控仪表盘 */}
      <div className="admin-glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>今日 Google Indexing API 配额监控</span>
              {quota?.isLocked && (
                <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/30">
                  安全硬锁已触发
                </span>
              )}
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black font-mono text-white tracking-tight">
                {quotaLoading ? '...' : quota?.used ?? 0}
              </span>
              <span className="text-sm text-slate-400 font-mono">/ 200 条单日上限</span>
              <span className="text-xs text-slate-400 font-mono">
                (今日剩余 {quotaLoading ? '...' : quota?.remaining ?? 200} 条)
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Google 官方默认单日配额为 200 URLs。为保障账号绝对安全，系统在消耗达到 180
              条时将自动启用熔断硬锁，防止超出每日上限。
            </p>
          </div>

          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs text-slate-400 font-mono">
              <span>消耗进度</span>
              <span>{quotaLoading ? '...' : quota?.percent ?? 0}%</span>
            </div>
            <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden p-0.5 border border-white/5">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  (quota?.percent || 0) >= 90
                    ? 'bg-red-500'
                    : (quota?.percent || 0) >= 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${quota?.percent || 0}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 单条极速操作面板 */}
        <div className="admin-glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>单条 URL 极速促抓 / 诊断</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">单次原子执行</span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 font-medium">目标 URL 地址</label>
              <input
                type="text"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                placeholder="https://www.ikanpp.com/title/ik000001-..."
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 font-mono focus:outline-hidden focus:border-amber-500/50"
              />
            </div>

            {/* 操作按钮组 */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => handleSingleAction('push')}
                disabled={singleLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition-colors disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Google 促抓</span>
              </button>

              <button
                type="button"
                onClick={() => handleSingleAction('inspect')}
                disabled={singleLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium transition-colors disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>官方诊断</span>
              </button>

              <button
                type="button"
                onClick={() => handleSingleAction('indexnow')}
                disabled={singleLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-medium transition-colors disabled:opacity-50"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>IndexNow</span>
              </button>

              <button
                type="button"
                onClick={() => handleSingleAction('delete')}
                disabled={singleLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-medium transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清退下架</span>
              </button>
            </div>
          </div>

          {/* 单条执行结果展示 */}
          {singleResult && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">执行结果回执</span>
                {singleResult.success ? (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>成功</span>
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>失败</span>
                  </span>
                )}
              </div>
              <pre className="p-3 rounded-lg bg-black/40 text-slate-300 font-mono text-[11px] overflow-x-auto admin-scrollbar">
                {JSON.stringify(singleResult.data || singleResult, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* 批量促抓面板 */}
        <div className="admin-glass-panel p-6 rounded-2xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>批量 URL 极速促抓 / 广播</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">
              已识别 {parsedBatchCount} 条有效链接
            </span>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-slate-300 font-medium">
                URL 列表 (每行一条完整地址)
              </label>
              <textarea
                rows={5}
                value={batchUrlsText}
                onChange={(e) => setBatchUrlsText(e.target.value)}
                placeholder="https://www.ikanpp.com/title/ik000001-...\nhttps://www.ikanpp.com/title/ik000002-..."
                className="w-full mt-1.5 p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 font-mono leading-relaxed focus:outline-hidden focus:border-cyan-500/50"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 text-xs">
              <button
                type="button"
                onClick={handleBatchPushGoogle}
                disabled={batchLoading || parsedBatchCount === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-semibold shadow-md shadow-amber-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>批量推 Google ({parsedBatchCount})</span>
              </button>

              <button
                type="button"
                onClick={handleBatchIndexNow}
                disabled={batchLoading || parsedBatchCount === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-600/30 transition-all active:scale-95 disabled:opacity-50"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>广播 IndexNow ({parsedBatchCount})</span>
              </button>
            </div>
          </div>

          {/* 批量结果反馈 */}
          {batchResult && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">批量任务执行回执</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {batchResult.pushedCount || batchResult.broadcastCount || 0} 成功
                </span>
              </div>
              <pre className="p-3 rounded-lg bg-black/40 text-slate-300 font-mono text-[11px] overflow-x-auto max-h-40 admin-scrollbar">
                {JSON.stringify(batchResult, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
