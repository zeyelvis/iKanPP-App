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
  ShieldCheck,
  Check,
  Globe,
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

  // 检测 URL 性质（普通影视 vs 直播实况）
  const cleanSingleUrl = singleUrl.trim();
  const isOrdinaryTitleUrl =
    cleanSingleUrl.includes('/title/') ||
    cleanSingleUrl.includes('/actor/') ||
    cleanSingleUrl.includes('/director/') ||
    cleanSingleUrl.includes('/genre/');
  const isLiveBroadcastUrl = cleanSingleUrl.includes('/live/');

  // 单条操作执行
  const handleSingleAction = async (actionType: 'push' | 'delete' | 'inspect' | 'indexnow') => {
    const url = singleUrl.trim();
    if (!url) {
      alert('请输入目标 URL');
      return;
    }

    // 白帽合规安全守卫：若用户尝试向 Google Indexing 推送普通影视页面，进行友好拦截并建议转推 IndexNow
    if (actionType === 'push' && isOrdinaryTitleUrl && !isLiveBroadcastUrl) {
      const confirmSwitch = window.confirm(
        '【Google 官方白帽合规拦截】\n\n' +
        'Google Indexing API 严格限定仅用于 /live/ 广播实况或求职事件。\n' +
        '普通影视页面调用会被 Google 判定为 API 滥用甚至降权整站！\n\n' +
        '是否立即转为【IndexNow 全网多引擎广播】？（秒级直达 Bing / Yandex / 搜狗等，全量影视合规支持）'
      );
      if (confirmSwitch) {
        return handleSingleAction('indexnow');
      }
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

  // 解析批量输入的 URL 分类
  const rawBatchLines = batchUrlsText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.startsWith('http'));
  const uniqueBatchUrls = Array.from(new Set(rawBatchLines));
  const batchLiveUrls = uniqueBatchUrls.filter((u) => u.includes('/live/'));
  const batchOrdinaryUrls = uniqueBatchUrls.filter((u) => !u.includes('/live/'));

  // 批量推送 Google
  const handleBatchPushGoogle = async () => {
    if (uniqueBatchUrls.length === 0) {
      alert('请在文本框中输入有效的 HTTP/HTTPS URL 列表（每行一条）');
      return;
    }

    if (quota && quota.isLocked) {
      alert('今日 Google Indexing API 已触发安全熔断锁，无法继续推送！');
      return;
    }

    // 若包含普通影视，提示智能转推
    if (batchOrdinaryUrls.length > 0) {
      const msg =
        `识别到输入的 ${uniqueBatchUrls.length} 条链接中，有 ${batchOrdinaryUrls.length} 条为普通影视页面。\n` +
        `Google Indexing API 严格仅限直播实况（当前识别到 ${batchLiveUrls.length} 条有效直播链接）。\n\n` +
        (batchLiveUrls.length > 0
          ? `点击【确定】仅推送这 ${batchLiveUrls.length} 条直播链接给 Google；其余普通影视建议使用下方【广播 IndexNow】！`
          : `当前无直播实况链接。请直接点击下方【广播 IndexNow】将这 ${batchOrdinaryUrls.length} 条影视秒级推送到全球多引擎！`);

      if (batchLiveUrls.length === 0) {
        alert(msg);
        return;
      }

      if (!window.confirm(msg)) {
        return;
      }
    }

    const urlsToPush = batchLiveUrls.length > 0 ? batchLiveUrls : uniqueBatchUrls;

    try {
      setBatchLoading(true);
      setBatchResult(null);
      const res = await fetch('/api/admin/indexing/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsToPush, type: 'URL_UPDATED' }),
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

  // 批量推送 IndexNow（全量全网支持）
  const handleBatchIndexNow = async () => {
    if (uniqueBatchUrls.length === 0) {
      alert('请在文本框中输入有效的 HTTP/HTTPS URL 列表（每行一条）');
      return;
    }

    try {
      setBatchLoading(true);
      setBatchResult(null);
      const res = await fetch('/api/admin/indexing/indexnow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: uniqueBatchUrls }),
      });
      const data = await res.json();
      setBatchResult(data);
    } catch (err: any) {
      setBatchResult({ success: false, error: err.message || '网络异常' });
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2.5">
            <span>搜索引擎促抓与主动广播控制台</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 font-mono">
              Indexing & Broadcast Console
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            双轨主动广播架构：IndexNow 全网多引擎（Bing / Yandex / 搜狗）秒级收录 + Google 白名单安全限流
          </p>
        </div>

        <button
          onClick={fetchQuota}
          disabled={quotaLoading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-slate-200 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${quotaLoading ? 'animate-spin text-cyan-400' : ''}`} />
          <span>刷新配额</span>
        </button>
      </div>

      {/* 白帽合规与双轨说明横幅 */}
      <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0 mt-0.5">
            <Globe className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
              <span>双轨收录架构标准规范 (v5.0 白帽合规版)</span>
              <span className="px-2 py-0.2 rounded bg-cyan-500/20 text-[10px] font-mono">White-Hat Compliant</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              <strong className="text-white">普通影视作品：</strong>100% 推荐使用 <strong className="text-cyan-400">IndexNow 协议</strong>（零单日限额，秒级直达微软 Bing、Yandex、Seznam 等全球多引擎）；Google 则通过动态分卷 <strong className="text-white">XML Sitemap</strong> 进行规律性抓取。<br />
              <strong className="text-white">Google Indexing API：</strong>Google 官方政策严格限定仅支持 <strong className="text-amber-400">BroadcastEvent (实况/直播)</strong> 与求职事件。严禁滥用于普通影视，系统已部署合规门禁硬锁。
            </p>
          </div>
        </div>
      </div>

      {/* 配额监控仪表盘 */}
      <div className="admin-glass-panel p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>今日 Google Indexing API 配额监控 (仅限直播实况)</span>
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
              Google 官方单日配额为 200 URLs。系统在消耗达到 180 条时将自动启用熔断硬锁，以绝对防止超频违规。
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
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>单条 URL 极速广播 / 诊断</span>
            </h2>
            <span className="text-[11px] text-slate-400 font-mono">单次原子执行</span>
          </div>

          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-slate-300 font-medium">目标 URL 地址</label>
                {cleanSingleUrl && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-medium ${
                      isLiveBroadcastUrl
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : isOrdinaryTitleUrl
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        : 'bg-white/10 text-slate-300'
                    }`}
                  >
                    {isLiveBroadcastUrl ? '⚡ 直播实况 (支持 Google & IndexNow)' : isOrdinaryTitleUrl ? '🎬 普通影视 (推荐 IndexNow)' : '🔗 标准页面'}
                  </span>
                )}
              </div>
              <input
                type="text"
                value={singleUrl}
                onChange={(e) => setSingleUrl(e.target.value)}
                placeholder="https://www.ikanpp.com/title/ik000001-..."
                className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-400 font-mono focus:outline-hidden focus:border-cyan-500/50"
              />
            </div>

            {/* 操作按钮组：优先推荐 IndexNow */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => handleSingleAction('indexnow')}
                disabled={singleLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-600/30 transition-all active:scale-95 disabled:opacity-50"
                title="向微软 Bing、Yandex、Seznam 等多引擎发起秒级收录广播（普通影视首选）"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>IndexNow 广播</span>
              </button>

              <button
                type="button"
                onClick={() => handleSingleAction('inspect')}
                disabled={singleLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium transition-colors disabled:opacity-50"
                title="查询 Google Search Console 官方索引收录状态"
              >
                <Search className="w-3.5 h-3.5" />
                <span>官方诊断</span>
              </button>

              <button
                type="button"
                onClick={() => handleSingleAction('push')}
                disabled={singleLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition-colors disabled:opacity-50"
                title="Google Indexing API（仅支持直播实况 /live/，普通影视自动引导转推 IndexNow）"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Google 促抓</span>
              </button>

              <button
                type="button"
                onClick={() => handleSingleAction('delete')}
                disabled={singleLoading}
                className="flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 border border-red-500/30 font-medium transition-colors disabled:opacity-50"
                title="向搜索引擎广播 URL_DELETED 下架指令"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>下架通知</span>
              </button>
            </div>
          </div>

          {/* 单条执行结果展示 */}
          {singleResult && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">执行结果回执</span>
                {singleResult.success ? (
                  <span className="text-emerald-400 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>成功执行</span>
                  </span>
                ) : (
                  <span className="text-red-400 flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>执行失败或被合规拦截</span>
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
              <Radio className="w-4 h-4 text-cyan-400" />
              <span>批量 URL 极速广播中枢</span>
            </h2>
            <div className="flex items-center gap-2 text-[11px] font-mono">
              <span className="text-slate-400">总计 {uniqueBatchUrls.length} 条</span>
              {batchLiveUrls.length > 0 && (
                <span className="text-amber-400">({batchLiveUrls.length} 直播)</span>
              )}
            </div>
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
                onClick={handleBatchIndexNow}
                disabled={batchLoading || uniqueBatchUrls.length === 0}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-md shadow-cyan-600/30 transition-all active:scale-95 disabled:opacity-50"
                title="全量推送到 IndexNow 多引擎网络（支持所有普通影视与全部链接，无上限限制）"
              >
                <Radio className="w-3.5 h-3.5" />
                <span>全网多引擎广播 IndexNow ({uniqueBatchUrls.length})</span>
              </button>

              <button
                type="button"
                onClick={handleBatchPushGoogle}
                disabled={batchLoading || uniqueBatchUrls.length === 0}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium transition-colors disabled:opacity-50"
                title="Google Indexing API（仅限直播实况链接，普通影视会自动拦截转推）"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>推 Google (仅限直播)</span>
              </button>
            </div>
          </div>

          {/* 批量结果反馈 */}
          {batchResult && (
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-200">批量任务执行回执</span>
                <span className="font-mono text-emerald-400 font-bold">
                  {batchResult.pushedCount || batchResult.broadcastCount || (batchResult.success ? uniqueBatchUrls.length : 0)} 成功
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
